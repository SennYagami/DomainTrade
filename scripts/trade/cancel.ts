import { ethers, network } from "hardhat";
import hre from "hardhat";
import { seaportAddress, wethAddress } from "../constants";
import { networkOption, OrderComponents } from "../../types/type";
import { Signer, Wallet } from "ethers";

const fs = require("fs");

// approve owner's all ens NFT to seaport
export async function cancelOrder(orderCLs: OrderComponents[], maker: Signer | undefined) {
  const network: networkOption = "goerli";

  if (!maker) {
    [maker] = await hre.ethers.getSigners();
  }

  let rawdata = await fs.readFileSync("./scripts/abi/seaport.json");
  let abi = JSON.parse(rawdata);

  const seaport = await hre.ethers.getContractAt(abi, seaportAddress);

  //   approve all weth to seaport
  const tx = await seaport.connect(maker).cancel(orderCLs);

  console.log({ tx });
  const res = await tx.wait();
  console.log({ res });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// cancelOrder().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
