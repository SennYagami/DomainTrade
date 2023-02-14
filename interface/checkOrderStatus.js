const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

seaportABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
    ],
    name: "getOrderStatus",
    outputs: [
      {
        internalType: "bool",
        name: "isValidated",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isCancelled",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "totalFilled",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalSize",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const seaportAddress = "0x00000000006c3852cbef3e08e8df289169ede581";
async function fetchOrderStatus(orderHash) {
  const provider = new ethers.getDefaultProvider(
    "https://eth-goerli.g.alchemy.com/v2/Zf0Pex_0WB4BkhBQCA14wnt4u6PAi6UF"
  );
  const seaport = new ethers.Contract(seaportAddress, seaportABI, provider);
  const orderStatus = await seaport.getOrderStatus(orderHash);
  return orderStatus;
}

fetchOrderStatus("0x7ec12fa4890c04b4fc8199f2dc85229c2da32328959eac52b85b2358b8443ab3").then(
  (orderStatus) => {
    console.log({ orderStatus });
  }
);
