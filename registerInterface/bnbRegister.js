const ethers = require("ethers");
require("dotenv").config();

ETHRegistrarControllerAbi = [
  {
    inputs: [
      {
        internalType: "contract BaseRegistrar",
        name: "_base",
        type: "address",
      },
      {
        internalType: "contract PriceOracle",
        name: "_prices",
        type: "address",
      },
      { internalType: "uint256", name: "_minCommitmentAge", type: "uint256" },
      { internalType: "uint256", name: "_maxCommitmentAge", type: "uint256" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: true,
        internalType: "bytes32",
        name: "label",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expires",
        type: "uint256",
      },
    ],
    name: "NameRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: true,
        internalType: "bytes32",
        name: "label",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "cost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expires",
        type: "uint256",
      },
    ],
    name: "NameRenewed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "NewPriceOracle",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    constant: true,
    inputs: [],
    name: "MIN_REGISTRATION_DURATION",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "available",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "bytes32", name: "commitment", type: "bytes32" }],
    name: "commit",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "commitments",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isOwner",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bytes32", name: "secret", type: "bytes32" },
    ],
    name: "makeCommitment",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bytes32", name: "secret", type: "bytes32" },
      { internalType: "address", name: "resolver", type: "address" },
      { internalType: "address", name: "addr", type: "address" },
    ],
    name: "makeCommitmentWithConfig",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "maxCommitmentAge",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "minCommitmentAge",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "bytes32", name: "secret", type: "bytes32" },
    ],
    name: "register",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "bytes32", name: "secret", type: "bytes32" },
      { internalType: "address", name: "resolver", type: "address" },
      { internalType: "address", name: "addr", type: "address" },
    ],
    name: "registerWithConfig",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "duration", type: "uint256" },
    ],
    name: "renew",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "duration", type: "uint256" },
    ],
    name: "rentPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "uint256", name: "_minCommitmentAge", type: "uint256" },
      { internalType: "uint256", name: "_maxCommitmentAge", type: "uint256" },
    ],
    name: "setCommitmentAges",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract PriceOracle",
        name: "_prices",
        type: "address",
      },
    ],
    name: "setPriceOracle",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "bytes4", name: "interfaceID", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "valid",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "withdraw",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ETHRegistrarControllerAddress = "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5";

function getCommitment(name, owner, secret, resolver, addr) {
  const label = ethers.utils.keccak256(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(name)));
  const commitment = ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes32", "address", "address", "address", "bytes32"],
      [label, owner, resolver, addr, secret]
    )
  );
  return commitment;
}
async function commit(signer, name, owner, secret, resolver, addr) {
  const ETHRegistrarControllerContract = new ethers.Contract(
    ETHRegistrarControllerAddress,
    ETHRegistrarControllerAbi,
    signer
  );

  const commitment = getCommitment(name, owner, secret, resolver, addr);
  const res = await ETHRegistrarControllerContract.commit(commitment, {
    gasLimit: 250000,
  });
  console.log({ res });
}

async function register(signer, name, owner, duration, secret, resolver, addr) {
  const ETHRegistrarControllerContract = new ethers.Contract(
    ETHRegistrarControllerAddress,
    ETHRegistrarControllerAbi,
    signer
  );

  const price = await ETHRegistrarControllerContract.rentPrice(name, duration);

  const res = await ETHRegistrarControllerContract.registerWithConfig(
    name,
    owner,
    duration,
    secret,
    resolver,
    addr,
    {
      gasLimit: 2500000,
      value: price,
    }
  );
  console.log({ res });
}
async function renew(signer, name, duration) {
  const ETHRegistrarControllerContract = new ethers.Contract(
    ETHRegistrarControllerAddress,
    ETHRegistrarControllerAbi,
    signer
  );

  const price = await ETHRegistrarControllerContract.rentPrice(name, duration);

  const res = await ETHRegistrarControllerContract.renew(name, duration, {
    gasLimit: 2500000,
    value: price,
  });
  console.log({ res });
}

async function main() {
  const provider = new ethers.getDefaultProvider(
    "https://eth-goerli.g.alchemy.com/v2/Zf0Pex_0WB4BkhBQCA14wnt4u6PAi6UF"
  );
  const signer = new ethers.Wallet(process.env.DEPLOYER, provider);

  const name = "testaaa121321312asedwqe";
  const owner = "0x8705f166792eeD5Be37b6573752C19F574CF05ac";
  //   1 year
  const duration = 31556952;
  const secret = "0x44477c671ab6965484fd47e8002b558017d2d7c5f8080c78b9c6f6387cdd83d6";
  const resolver = "0xE264d5bb84bA3b8061ADC38D3D76e6674aB91852";
  const addr = "0x8705f166792eeD5Be37b6573752C19F574CF05ac";

  //   await commit(signer, name, owner, secret, resolver, addr);
  //   await register(signer, name, owner, duration, secret, resolver, addr);
  await renew(signer, name, duration);
}

main().catch((err) => {
  console.log(err);
});
