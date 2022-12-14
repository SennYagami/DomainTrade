import { ethers, network } from "hardhat";
import hre from "hardhat";
import { seaportAddress, wethAddress } from "../constants";
import { networkOption } from "../../types/type";
const fs = require("fs");

// approve owner's all ens NFT to seaport
async function approveWethToSeaport() {
  const network: networkOption = "goerli";

  const [maker] = await hre.ethers.getSigners();
  let rawdata = await fs.readFileSync("./scripts/abi/weth.json");
  let abi = JSON.parse(rawdata);

  const wethContract = await hre.ethers.getContractAt(abi, wethAddress[network]);

  //   approve all weth to seaport
  const res = await wethContract
    .connect(maker)
    .approve(seaportAddress, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  console.log({ res });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
approveWethToSeaport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
