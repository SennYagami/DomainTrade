import { ethers } from "hardhat";
import hre from "hardhat";
import { seaportAddress } from "../constants";
const fs = require("fs");

// approve owner's all ens NFT to seaport
async function approveEnsToSeaport() {
  const [ensOwner] = await hre.ethers.getSigners();
  let rawdata = await fs.readFileSync("./scripts/abi/ensEthRegister.json");
  let abi = JSON.parse(rawdata);

  const ensEthDomainRegister = await hre.ethers.getContractAt(
    abi,
    "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"
  );

  const res = await ensEthDomainRegister.connect(ensOwner).setApprovalForAll(seaportAddress, true);
  console.log({ res });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
approveEnsToSeaport().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
