const ethers = require("ethers");

const fs = require("fs");
require("dotenv").config();

const { keccak256, parseEther, toUtf8Bytes } = require("ethers/lib/utils");
const { randomBytes } = require("crypto");
const { BigNumber } = require("ethers");

const seaportAddress = "0x00000000006c3852cbef3e08e8df289169ede581";

const ensEthRegister = {
  5: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
  1: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85",
};

const seaportOrderType = {
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

const hexRegex = /[A-Fa-fx]/g;

const toBN = (n) => BigNumber.from(toHex(n));

const toKey = (n) => toHex(n, 32);

const toHex = (n, numBytes = 0) => {
  const asHexString = BigNumber.isBigNumber(n)
    ? n.toHexString().slice(2)
    : typeof n === "string"
    ? hexRegex.test(n)
      ? n.replace(/0x/, "")
      : Number(n).toString(16)
    : Number(n).toString(16);
  return `0x${asHexString.padStart(numBytes * 2, "0")}`;
};

let randomBytesCustomized = (n) => randomBytes(n).toString("hex");

const randomHex = (bytes = 32) => `0x${randomBytesCustomized(bytes)}`;

const random128 = () => toBN(randomHex(16));

const getItemETH = ({ startAmount, endAmount, recipient }) =>
  getOfferOrConsiderationItem(
    0,
    ethers.constants.AddressZero,
    0,
    toBN(startAmount),
    toBN(endAmount),
    recipient
  );

const getItem20 = ({ token, startAmount, endAmount, recipient }) =>
  getOfferOrConsiderationItem(1, token, 0, startAmount, endAmount, recipient);

const getItem721 = ({
  token,
  identifierOrCriteria,
  startAmount = 1,
  endAmount = 1,
  recipient,
}) =>
  getOfferOrConsiderationItem(
    2,
    token,
    identifierOrCriteria,
    startAmount,
    endAmount,
    recipient
  );

const getOfferOrConsiderationItem = (
  itemType = 0,
  token = ethers.constants.AddressZero,
  identifierOrCriteria = 0,
  startAmount = 1,
  endAmount = 1,
  recipient
) => {
  const offerItem = {
    itemType,
    token,
    identifierOrCriteria: toBN(identifierOrCriteria),
    startAmount: toBN(startAmount),
    endAmount: toBN(endAmount),
  };
  if (typeof recipient === "string") {
    return {
      ...offerItem,
      recipient: recipient,
    };
  }

  return offerItem;
};

const calculateOrderHash = (orderComponents) => {
  const offerItemTypeString =
    "OfferItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount)";
  const considerationItemTypeString =
    "ConsiderationItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount,address recipient)";
  const orderComponentsPartialTypeString =
    "OrderComponents(address offerer,address zone,OfferItem[] offer,ConsiderationItem[] consideration,uint8 orderType,uint256 startTime,uint256 endTime,bytes32 zoneHash,uint256 salt,bytes32 conduitKey,uint256 counter)";
  const orderTypeString = `${orderComponentsPartialTypeString}${considerationItemTypeString}${offerItemTypeString}`;

  const offerItemTypeHash = keccak256(toUtf8Bytes(offerItemTypeString));
  const considerationItemTypeHash = keccak256(
    toUtf8Bytes(considerationItemTypeString)
  );
  const orderTypeHash = keccak256(toUtf8Bytes(orderTypeString));

  const offerHash = keccak256(
    "0x" +
      orderComponents.offer
        .map((offerItem) => {
          return keccak256(
            "0x" +
              [
                offerItemTypeHash.slice(2),
                offerItem.itemType.toString().padStart(64, "0"),
                offerItem.token.slice(2).padStart(64, "0"),
                toBN(offerItem.identifierOrCriteria)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
                toBN(offerItem.startAmount)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
                toBN(offerItem.endAmount)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
              ].join("")
          ).slice(2);
        })
        .join("")
  );

  const considerationHash = keccak256(
    "0x" +
      orderComponents.consideration
        .map((considerationItem) => {
          return keccak256(
            "0x" +
              [
                considerationItemTypeHash.slice(2),
                considerationItem.itemType.toString().padStart(64, "0"),
                considerationItem.token.slice(2).padStart(64, "0"),
                toBN(considerationItem.identifierOrCriteria)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
                toBN(considerationItem.startAmount)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
                toBN(considerationItem.endAmount)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
                considerationItem.recipient.slice(2).padStart(64, "0"),
              ].join("")
          ).slice(2);
        })
        .join("")
  );

  const derivedOrderHash = keccak256(
    "0x" +
      [
        orderTypeHash.slice(2),
        orderComponents.offerer.slice(2).padStart(64, "0"),
        orderComponents.zone.slice(2).padStart(64, "0"),
        offerHash.slice(2),
        considerationHash.slice(2),
        orderComponents.orderType.toString().padStart(64, "0"),
        toBN(orderComponents.startTime)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.endTime).toHexString().slice(2).padStart(64, "0"),
        orderComponents.zoneHash.slice(2),
        orderComponents.salt.slice(2).padStart(64, "0"),
        orderComponents.conduitKey.slice(2).padStart(64, "0"),
        toBN(orderComponents.counter).toHexString().slice(2).padStart(64, "0"),
      ].join("")
  );

  return derivedOrderHash;
};

const getOrderHash = async (orderComponents) => {
  const derivedOrderHash = calculateOrderHash(orderComponents);
  return derivedOrderHash;
};

export const getBasicOrderParameters = (
  basicOrderRouteType,
  order,
  fulfillerConduitKey = false,
  tips = []
) => ({
  offerer: order.parameters.offerer,
  zone: order.parameters.zone,
  basicOrderType: order.parameters.orderType + 4 * basicOrderRouteType,
  offerToken: order.parameters.offer[0].token,
  offerIdentifier: order.parameters.offer[0].identifierOrCriteria,
  offerAmount: order.parameters.offer[0].endAmount,
  considerationToken: order.parameters.consideration[0].token,
  considerationIdentifier:
    order.parameters.consideration[0].identifierOrCriteria,
  considerationAmount: order.parameters.consideration[0].endAmount,
  startTime: order.parameters.startTime,
  endTime: order.parameters.endTime,
  zoneHash: order.parameters.zoneHash,
  salt: order.parameters.salt,
  totalOriginalAdditionalRecipients: BigNumber.from(
    order.parameters.consideration.length - 1
  ),
  signature: order.signature,
  offererConduitKey: order.parameters.conduitKey,
  fulfillerConduitKey: toKey(
    typeof fulfillerConduitKey === "string" ? fulfillerConduitKey : 0
  ),
  additionalRecipients: [
    ...order.parameters.consideration
      .slice(1)
      .map(({ endAmount, recipient }) => ({ amount: endAmount, recipient })),
    ...tips,
  ],
});

// sign to list ens
async function orderComponentsContructor({
  offererAddress,
  offer,
  consideration,
  orderType = 0,
  criteriaResolvers,
  signer,
  zoneHash = ethers.constants.HashZero,
  conduitKey = ethers.constants.HashZero,
  extraCheap = false,
  chainId = 5,
  counter,
  startTime,
  endTime,
}) {
  const salt = !extraCheap ? randomHex() : ethers.constants.HashZero;

  const orderParameters = {
    offerer: offererAddress,
    zone: ethers.constants.AddressZero,
    offer,
    consideration,
    totalOriginalConsiderationItems: consideration.length,
    orderType,
    zoneHash,
    salt,
    conduitKey,
    startTime,
    endTime,
  };

  const orderComponents = {
    ...orderParameters,
    counter,
  };

  // How much ether (at most) needs to be supplied when fulfilling the order

  const value = offer
    .map((x) =>
      x.itemType === 0
        ? x.endAmount.gt(x.startAmount)
          ? x.endAmount
          : x.startAmount
        : toBN(0)
    )
    .reduce((a, b) => a.add(b), toBN(0))
    .add(
      consideration
        .map((x) =>
          x.itemType === 0
            ? x.endAmount.gt(x.startAmount)
              ? x.endAmount
              : x.startAmount
            : toBN(0)
        )
        .reduce((a, b) => a.add(b), toBN(0))
    );

  const domainData = {
    name: "Seaport",
    version: "1.1",
    chainId: chainId,
    verifyingContract: seaportAddress,
  };

  return {
    orderComponents,
    orderParameters,
    domainData,
    value,
  };
}

async function listSignDataGetter({
  offererAddress, //signer of offerer
  chainId, //chainId
  identifierOrCriteria, //tokenId in base 10
  etherAmount, //ether based price
  counter, //seaport's counter of offerer, get from backend
  startTime, //startTime of order, need to be integer with 10 digits
  endTime, //endTime of order, need to be integer with 10 digits
}) {
  identifierOrCriteria = BigNumber.from(identifierOrCriteria);
  //   construct offer
  const offer = [
    getItem721({
      token: ensEthRegister[chainId],
      identifierOrCriteria: identifierOrCriteria,
    }),
  ];

  //   construct consideration
  const consideration = [
    getItemETH({
      startAmount: parseEther(etherAmount.toString()),
      endAmount: parseEther(etherAmount.toString()),
      recipient: offererAddress,
    }),
  ];

  //   get signed order
  const { orderComponents, orderParameters, domainData, value } =
    await orderComponentsContructor({
      chainId,
      offererAddress: offererAddress,
      offer,
      consideration,
      orderType: 0,
      counter: BigNumber.from(counter),
      startTime,
      endTime,
    });

  const orderHash = await getOrderHash(orderComponents);

  getBasicOrderParameters(
    0,
    order
    // EthForERC721
  );
  return { orderComponents, orderParameters, orderHash, domainData, value };
}

async function test() {
  const provider = new ethers.getDefaultProvider("goerli");

  const offerer = new ethers.Wallet(process.env.DEPLOYER, provider);

  const { orderComponents, orderParameters, orderHash, domainData, value } =
    await listSignDataGetter({
      offererAddress: offerer.address,
      chainId: 5,
      identifierOrCriteria:
        "69795268980990706471111358049403619171590773124827335588749202653893061835756",
      etherAmount: 0.01,
      counter: 5,
      startTime: 1670980560,
      endTime: 1670990560,
    });

  const flatSig = await offerer._signTypedData(
    domainData,
    seaportOrderType,
    orderComponents
  );

  const order = {
    parameters: orderParameters,
    // signature: !extraCheap ? flatSig : convertSignatureToEIP2098(flatSig),
    signature: flatSig,
    numerator: 1, // only used for advanced orders
    denominator: 1, // only used for advanced orders
    extraData: "0x", // only used for advanced orders
  };

  console.log({ flatSig, order });
  //   return { order, value };

  //   let ABI = await fs.readFileSync("./interface/abi/seaport.json");
  //   let abi = JSON.parse(ABI);
  //   const seaport = new ethers.Contract(seaportAddress, abi, offerer);
  //   const res = await seaport.fulfillOrder(order, toKey(0), {
  //     value: value, // MUST be a string passed into parseEther
  //     gasLimit: 250000,
  //     // gasPrice: provider.getGasPrice().         // MAY be a number or a Promise
  //   });
  //   console.log({ res });
}

test();
