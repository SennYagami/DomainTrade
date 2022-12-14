import { ethers, network } from "hardhat";
import hre from "hardhat";
import {
  seaportAddress,
  domainSeparatorDict,
  ensEthRegister,
  seaportOrderType,
} from "../constants";
const fs = require("fs");
import { OrderComponents } from "../../types/type";
import { Wallet, Contract, BigNumber, Signer, BigNumberish } from "ethers";
import { calculateOrderHash, getItemETH, getItem721 } from "../utils/utils";
import { toBN, toHex, randomHex, toKey } from "../utils/encodings";
import { keccak256, parseEther, recoverAddress } from "ethers/lib/utils";
import { chainIdOption, OfferItem, ConsiderationItem, CriteriaResolver } from "../../types/type";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const getOrderHash = async (orderComponents: OrderComponents) => {
  const derivedOrderHash = calculateOrderHash(orderComponents);
  return derivedOrderHash;
};

// Returns signature
const signOrder = async (
  orderComponents: OrderComponents,
  signer: Wallet | Contract,
  chainId: chainIdOption
) => {
  const domainData = {
    name: "Seaport",
    version: "1.1",
    chainId: chainId,
    verifyingContract: seaportAddress,
  };

  const signature = await signer._signTypedData(domainData, orderType, orderComponents);

  return signature;
};

// sign to list ens
async function orderComponentsContructor({
  offererAddress,
  offer,
  consideration,
  orderType = 0,
  criteriaResolvers,
  signer,
  zoneHash = ethers.constants.HashZero,
  conduitKey = ethers.constants.HashZero,
  extraCheap = false,
  chainId = 5,
  counter,
  startTime,
  endTime,
}: {
  offererAddress: string;
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
  counter: BigNumber;
  startTime: number;
  endTime: number;
}) {
  const salt = !extraCheap ? randomHex() : ethers.constants.HashZero;

  const orderParameters = {
    offerer: offererAddress,
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

  const domainData = {
    name: "Seaport",
    version: "1.1",
    chainId: chainId,
    verifyingContract: seaportAddress,
  };

  return {
    orderComponents,
    domainData,

    value,
  };
}

export async function listSignDataGetter({
  offererAddress, //signer of offerer
  chainId, //chainId
  identifierOrCriteria, //tokenId in base 10
  etherAmount, //ether based price
  counter, //seaport's counter of offerer, get from backend
  startTime, //startTime of order, need to be integer with 10 digits
  endTime, //endTime of order, need to be integer with 10 digits
}: {
  offererAddress: string;
  chainId: 1 | 5;
  identifierOrCriteria: BigNumberish;
  etherAmount: number;
  counter: number;
  startTime: number;
  endTime: number;
}) {
  identifierOrCriteria = BigNumber.from(identifierOrCriteria);
  //   construct offer
  const offer = [
    getItem721({ token: ensEthRegister[chainId], identifierOrCriteria: identifierOrCriteria }),
  ];

  //   construct consideration
  const consideration = [
    getItemETH({
      startAmount: parseEther(etherAmount.toString()),
      endAmount: parseEther(etherAmount.toString()),
      recipient: offererAddress,
    }),
  ];

  //   get signed order
  const { orderComponents, domainData, value } = await orderComponentsContructor({
    chainId,
    offererAddress: offererAddress,
    offer,
    consideration,
    orderType: 0,
    counter: BigNumber.from(counter),
    startTime,
    endTime,
  });

  return { orderComponents, domainData, value };
}

async function test() {
  const [offerer, buyer] = await hre.ethers.getSigners();
  const { orderComponents, domainData, value } = await listSignDataGetter({
    offererAddress: offerer.address,
    chainId: 5,
    identifierOrCriteria:
      "5552456067401538453316532186467078988369905899698674104384436431374768680926",
    etherAmount: 0.01,
    counter: 5,
    startTime: 1670980560,
    endTime: 1670990560,
  });

  const signature = await offerer._signTypedData(domainData, seaportOrderType, orderComponents);

  console.log({ signature });
}

test();
