const ethers = require("ethers");
require("dotenv").config();

seaportAbi = [
  {
    inputs: [],
    name: "information",
    outputs: [
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "domainSeparator",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "conduitController",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// approve owner's all ens NFT to seaport

const seaportAddress14 = "0x00000000000001ad428e4906aE43D8F9852d0dD6";

async function getSeaportInformation(address) {
  // address:string
  const provider = new ethers.getDefaultProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/0dN6VehDWXiGTayq8TRSXb6JiSwC3PE_"
  );
  const seaportContract = new ethers.Contract(seaportAddress14, seaportAbi, provider);
  const res = await seaportContract.information();

  console.log({ res });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getSeaportInformation().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
