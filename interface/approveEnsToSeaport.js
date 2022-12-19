const ethers = require("ethers");
require("dotenv").config();

EnsAbi = [
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];
// approve owner's all ens NFT to seaport
const EnsContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

async function main() {
  const provider = new ethers.getDefaultProvider("goerli");
  const signer = new ethers.Wallet(process.env.DEPLOYER, provider);
  await setApprovalForAllEnsToSeaport(signer);
}
async function setApprovalForAllEnsToSeaport(signer) {
  const EnsContract = new ethers.Contract(EnsContractAddress, EnsAbi, signer);
  const res = await EnsContract.setApprovalForAll(
    "0x00000000006c3852cbef3e08e8df289169ede581",
    true,
    {
      gasLimit: 250000,
    }
  );
  console.log({ res });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
