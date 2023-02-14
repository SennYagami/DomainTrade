import { ethers, network } from "hardhat";
import hre from "hardhat";
import {
  seaportAddress,
  domainSeparatorDict,
  ensEthRegister,
  orderType,
  seaportOrderType,
} from "../constants";
const fs = require("fs");
import { Order, OrderComponents } from "../../types/type";
import { Wallet, Contract, BigNumber } from "ethers";
import { calculateOrderHash, getItemETH, getItem721, getItem1155 } from "../utils/utils";
import { toBN, toHex, randomHex, toKey } from "../utils/encodings";
import { keccak256, parseEther, recoverAddress } from "ethers/lib/utils";
import { chainIdOption, OfferItem, ConsiderationItem, CriteriaResolver } from "../../types/type";
import { json } from "hardhat/internal/core/params/argumentTypes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const getOrderHash = async (orderComponents: OrderComponents) => {
  const derivedOrderHash = calculateOrderHash(orderComponents);
  return derivedOrderHash;
};

// Returns signature
const signOrder = async (
  orderComponents: OrderComponents,
  signer: Wallet | Contract,
  chainId: chainIdOption,
  marketplaceContract: Contract
) => {
  const domainData = {
    name: "Seaport",
    version: "1.1",
    chainId: chainId,
    verifyingContract: seaportAddress,
  };

  const signature = await signer._signTypedData(domainData, seaportOrderType, orderComponents);

  return signature;
};

// sign to list ens
async function list({
  offerer,
  offer,
  consideration,
  orderType = 0,
  criteriaResolvers,
  signer,
  zoneHash = ethers.constants.HashZero,
  conduitKey = ethers.constants.HashZero,
  extraCheap = false,
  chainId = 5,
  marketplaceContract,
  counter,
  startTime,
  endTime,
}: {
  offerer: Wallet | Contract;
  //   zone: undefined | string = undefined,
  offer: OfferItem[];
  consideration: ConsiderationItem[];
  orderType?: number;
  criteriaResolvers?: CriteriaResolver[];

  signer?: Wallet;
  zoneHash?: string;
  conduitKey?: string;
  extraCheap?: boolean;
  chainId?: chainIdOption;
  marketplaceContract: Contract;
  counter: BigNumber;
  startTime: number;
  endTime: number;
}) {
  const salt = !extraCheap ? randomHex() : ethers.constants.HashZero;

  const orderParameters = {
    offerer: offerer.address,
    zone: ethers.constants.AddressZero,
    offer,
    consideration,
    totalOriginalConsiderationItems: consideration.length,
    orderType,
    zoneHash,
    salt,
    conduitKey,
    startTime,
    endTime,
  };

  const orderComponents = {
    ...orderParameters,
    counter,
  };

  const orderHash = await getOrderHash(orderComponents);

  const { isValidated, isCancelled, totalFilled, totalSize } =
    await marketplaceContract.getOrderStatus(orderHash);

  const orderStatus = {
    isValidated,
    isCancelled,
    totalFilled,
    totalSize,
  };

  const flatSig = await signOrder(orderComponents, offerer, chainId, marketplaceContract);

  const order = {
    parameters: orderParameters,
    // signature: !extraCheap ? flatSig : convertSignatureToEIP2098(flatSig),
    signature: flatSig,
    // numerator: 1, // only used for advanced orders
    // denominator: 1, // only used for advanced orders
    // extraData: "0x", // only used for advanced orders
  };

  // How much ether (at most) needs to be supplied when fulfilling the order
  const value = offer
    .map((x) =>
      x.itemType === 0 ? (x.endAmount.gt(x.startAmount) ? x.endAmount : x.startAmount) : toBN(0)
    )
    .reduce((a, b) => a.add(b), toBN(0))
    .add(
      consideration
        .map((x) =>
          x.itemType === 0 ? (x.endAmount.gt(x.startAmount) ? x.endAmount : x.startAmount) : toBN(0)
        )
        .reduce((a, b) => a.add(b), toBN(0))
    );

  return {
    order,
    orderHash,
    value,
    orderStatus,
    orderComponents,
  };
}

async function ordersGenerator({
  chainId,
  offerer,
  identifierOrCriteria,
  platform,
  marketplaceContract,
  counter,
}: {
  chainId: chainIdOption;
  offerer: SignerWithAddress;
  identifierOrCriteria: BigNumber;
  platform: SignerWithAddress;
  marketplaceContract: Contract;
  counter: BigNumber;
}) {
  //   construct offer
  const offer = [
    getItem1155({
      token: "0x57049f5aDA35FeDD72396dEb6537cCcFa229f25D",
      identifierOrCriteria: identifierOrCriteria,
    }),
  ];

  //   construct consideration
  const consideration = [
    getItemETH({
      startAmount: parseEther("0.005"),
      endAmount: parseEther("0.005"),
      recipient: offerer.address,
    }),
    getItemETH({
      startAmount: parseEther("0.001"),
      endAmount: parseEther("0.001"),
      recipient: platform.address,
    }),
  ];

  const timespan = 1;
  const startTime = Math.floor(new Date().getTime() / 1000);
  const endTime = startTime + 60 * 60 * 24 * timespan;

  //   get signed order
  const { order, orderHash, value, orderStatus, orderComponents } = await list({
    offerer: offerer as any,
    offer,
    consideration,
    orderType: 0,
    marketplaceContract,
    counter,
    startTime,
    endTime,
  });

  return { order, orderHash, value, orderStatus, orderComponents };
}

// construct fulFillments
function fulFillmentsConstructor(orderLs: Order[]) {
  const offerGroup: { [key: string]: { orderIndex: number; itemIndex: number }[] } = {};
  const considerationGroup: { [key: string]: { orderIndex: number; itemIndex: number }[] } = {};

  for (let orderIndex = 0; orderIndex < orderLs.length; orderIndex++) {
    const order = orderLs[orderIndex];

    const offer = order.parameters.offer;
    const consideration = order.parameters.consideration;

    for (let offerItemIndex = 0; offerItemIndex < offer.length; offerItemIndex++) {
      const offerItem = offer[offerItemIndex];

      const k =
        order.parameters.offerer +
        order.parameters.conduitKey +
        offerItem.itemType +
        offerItem.token +
        offerItem.identifierOrCriteria.toString();

      if (k in offerGroup) {
        offerGroup[k].push({ orderIndex: orderIndex, itemIndex: offerItemIndex });
      } else {
        offerGroup[k] = [{ orderIndex: orderIndex, itemIndex: offerItemIndex }];
      }
    }

    for (
      let considerationItemIndex = 0;
      considerationItemIndex < consideration.length;
      considerationItemIndex++
    ) {
      const considerationItem = consideration[considerationItemIndex];

      const k =
        considerationItem.itemType +
        considerationItem.token +
        considerationItem.identifierOrCriteria.toString() +
        considerationItem.recipient;
      if (k in considerationGroup) {
        considerationGroup[k].push({ orderIndex: orderIndex, itemIndex: considerationItemIndex });
      } else {
        considerationGroup[k] = [{ orderIndex: orderIndex, itemIndex: considerationItemIndex }];
      }
    }
  }

  const offerFulfillments = Object.values(offerGroup).map((item) => item);
  const considerationFulfillments = Object.values(considerationGroup).map((item) => item);

  return { offerFulfillments, considerationFulfillments };
}

async function main() {
  const [offerer, buyer, platform] = await hre.ethers.getSigners();

  // construct seaport contract to fetch counter of user
  let seaportAbiRawdata = await fs.readFileSync("./scripts/abi/seaport.json");
  let seaportAbi = JSON.parse(seaportAbiRawdata);
  const marketplaceContract = await ethers.getContractAt(seaportAbi, seaportAddress);

  const counter: BigNumber = await marketplaceContract.getCounter(offerer.address);

  //   network
  const chainId = 5;

  const identifierOrCriteriaLs: BigNumber[] = [
    BigNumber.from("61072734877611082942699912527416715977452157525254428555173631882321494802433"),
    BigNumber.from("85362545198061464406139643827169218941056771871050702979351415504725031780353"),
    BigNumber.from("85362545198061464406139643827169218941056771871050702979351415511322101547009"),
  ];

  const orderLs = [];
  const valueLs: BigNumber[] = [];

  for (let i = 0; i < identifierOrCriteriaLs.length; i++) {
    const { order, orderHash, value, orderStatus, orderComponents } = await ordersGenerator({
      chainId: chainId,
      offerer: offerer,
      identifierOrCriteria: identifierOrCriteriaLs[i],
      platform,
      marketplaceContract,
      counter,
    });

    orderLs.push(order);
    valueLs.push(value);
  }

  const value = valueLs.reduce((a, b) => a.add(b), BigNumber.from(0));

  const { offerFulfillments, considerationFulfillments } = fulFillmentsConstructor(orderLs);

  console.log({
    offerFulfillments: JSON.stringify(offerFulfillments, null, 2),
    considerationFulfillments: JSON.stringify(considerationFulfillments, null, 2),
  });

  //  batch buy
  const tx = await marketplaceContract
    .connect(buyer)
    .fulfillAvailableOrders(
      orderLs,
      offerFulfillments,
      considerationFulfillments,
      toKey(0),
      orderLs.length,
      {
        value,
      }
    );

  //   console.log({ offerer: offerer.address, buyer: buyer.address });
  //   console.log({
  //     orderLs: JSON.stringify(orderLs, null, 2),
  //     offerFulfillments,
  //     considerationFulfillments,
  //     fulfillerConduitKey: toKey(0),
  //     ol: orderLs.length,
  //     value,
  //   });

  console.log({ tx });
  const receipt = await tx.wait();
  //   console.log({ receipt });
}

main();
