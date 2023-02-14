const ethers = require("ethers");
require("dotenv").config();

WethAbi = [
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// approve owner's all ens NFT to seaport

const wethAddress = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";

async function getWethAddress(address) {
  // address:string
  const provider = new ethers.getDefaultProvider("goerli");
  const WethContract = new ethers.Contract(wethAddress, WethAbi, provider);
  const res = await WethContract.balanceOf(address);
  const wethBalance = ethers.utils.formatUnits(res, 18);
  console.log({ wethBalance });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getWethAddress("0x8705f166792eed5be37b6573752c19f574cf05ac").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
