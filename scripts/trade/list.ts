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
import { OrderComponents } from "../../types/type";
import { Wallet, Contract, BigNumber } from "ethers";
import { calculateOrderHash, getItemETH, getItem721 } from "../utils/utils";
import { toBN, toHex, randomHex, toKey } from "../utils/encodings";
import { keccak256, parseEther, recoverAddress } from "ethers/lib/utils";
import { chainIdOption, OfferItem, ConsiderationItem, CriteriaResolver } from "../../types/type";
import { json } from "hardhat/internal/core/params/argumentTypes";

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
    numerator: 1, // only used for advanced orders
    denominator: 1, // only used for advanced orders
    extraData: "0x", // only used for advanced orders
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

async function main() {
  const [offerer, buyer, platform] = await hre.ethers.getSigners();

  // construct seaport contract to fetch counter of user
  let seaportAbiRawdata = await fs.readFileSync("./scripts/abi/seaport.json");
  let seaportAbi = JSON.parse(seaportAbiRawdata);
  const marketplaceContract = await ethers.getContractAt(seaportAbi, seaportAddress);

  const counter: BigNumber = await marketplaceContract.getCounter(offerer.address);

  //   network
  const chainId = 5;

  //   tokenId
  const rawIdentifierOrCriteria =
    "27539411578306876369171611114967280087586888077525747927824545951054847386210";
  const identifierOrCriteria = BigNumber.from(rawIdentifierOrCriteria);

  //   construct offer
  const offer = [
    getItem721({ token: ensEthRegister[chainId], identifierOrCriteria: identifierOrCriteria }),
  ];

  //   construct consideration
  const consideration = [
    getItemETH({
      startAmount: parseEther("0.05"),
      endAmount: parseEther("0.05"),
      recipient: offerer.address,
    }),
    getItemETH({
      startAmount: parseEther("0.01"),
      endAmount: parseEther("0.01"),
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

  //  fullfill using signed order
  const tx = await marketplaceContract.connect(buyer).fulfillOrder(order, toKey(0), {
    value,
  });

  console.log({ offerer: offerer.address, buyer: buyer.address });
  console.log({
    order: JSON.stringify(order, null, 2),
    orderHash,
    value,
    orderStatus,
    orderComponents,
  });
  console.log({ tx });

  const receipt = await tx.wait();

  console.log({ receipt });
}

main();
