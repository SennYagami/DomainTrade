export const seaportAddress = "0x00000000006c3852cbef3e08e8df289169ede581";
export const chainIdDict = { goerli: 5, ethereum: 1 };
export const domainSeparatorDict = {
  goerli: "0x712fdde1f147adcbb0fabb1aeb9c2d317530a46d266db095bc40c606fe94f0c2",
  ethereum: "0xb50c8913581289bd2e066aeef89fceb9615d490d673131fd1a7047436706834e",
};
export const ensEthRegister = {
  goerli: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
  ethereum: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
};
export const wethAddress = {
  goerli: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
  ethereum: "",
};

export const orderType = {
  OrderComponents: [
    { name: "offerer", type: "address" },
    { name: "zone", type: "address" },
    { name: "offer", type: "OfferItem[]" },
    { name: "consideration", type: "ConsiderationItem[]" },
    { name: "orderType", type: "uint8" },
    { name: "startTime", type: "uint256" },
    { name: "endTime", type: "uint256" },
    { name: "zoneHash", type: "bytes32" },
    { name: "salt", type: "uint256" },
    { name: "conduitKey", type: "bytes32" },
    { name: "counter", type: "uint256" },
  ],
  OfferItem: [
    { name: "itemType", type: "uint8" },
    { name: "token", type: "address" },
    { name: "identifierOrCriteria", type: "uint256" },
    { name: "startAmount", type: "uint256" },
    { name: "endAmount", type: "uint256" },
  ],
  ConsiderationItem: [
    { name: "itemType", type: "uint8" },
    { name: "token", type: "address" },
    { name: "identifierOrCriteria", type: "uint256" },
    { name: "startAmount", type: "uint256" },
    { name: "endAmount", type: "uint256" },
    { name: "recipient", type: "address" },
  ],
};
