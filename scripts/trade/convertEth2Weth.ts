import { ethers, network } from "hardhat";
import hre from "hardhat";
import { seaportAddress, wethAddress } from "../constants";
import { networkOption } from "../../types/type";

const fs = require("fs");

// approve owner's all ens NFT to seaport

async function convertEth2Weth() {
  const network: networkOption = "goerli";
  const depositValue = ethers.utils.parseEther("0.1");
  const [signer] = await hre.ethers.getSigners();
  let rawdata = await fs.readFileSync("./scripts/abi/weth.json");
  let abi = JSON.parse(rawdata);

  const wethContract = await hre.ethers.getContractAt(abi, wethAddress[network]);

  const res = await wethContract.connect(signer).deposit({ value: depositValue });
  console.log({ res });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
convertEth2Weth().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
