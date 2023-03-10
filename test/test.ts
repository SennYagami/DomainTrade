import { ethers } from "ethers";
import { BigNumber } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import type { BigNumberish } from "ethers";

const hexRegex = /[A-Fa-fx]/g;

export const toHex = (n: BigNumberish, numBytes: number = 0) => {
  const asHexString = BigNumber.isBigNumber(n)
    ? n.toHexString().slice(2)
    : typeof n === "string"
    ? hexRegex.test(n)
      ? n.replace(/0x/, "")
      : Number(n).toString(16)
    : Number(n).toString(16);
  return `0x${asHexString.padStart(numBytes * 2, "0")}`;
};

export const toBN = (n: BigNumberish) => BigNumber.from(toHex(n));

export type OfferItem = {
  itemType: number;
  token: string;
  identifierOrCriteria: BigNumber;
  startAmount: BigNumber;
  endAmount: BigNumber;
};
export type ConsiderationItem = {
  itemType: number;
  token: string;
  identifierOrCriteria: BigNumber;
  startAmount: BigNumber;
  endAmount: BigNumber;
  recipient: string;
};

export type OrderParameters = {
  offerer: string;
  zone: string;
  offer: OfferItem[];
  consideration: ConsiderationItem[];
  orderType: number;
  startTime: string | BigNumber | number;
  endTime: string | BigNumber | number;
  zoneHash: string;
  salt: string;
  conduitKey: string;
  totalOriginalConsiderationItems: string | BigNumber | number;
};

export type OrderComponents = Omit<OrderParameters, "totalOriginalConsiderationItems"> & {
  counter: BigNumber;
};

export const calculateOrderHash = (orderComponents: any) => {
  const offerItemTypeString =
    "OfferItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount)";
  const considerationItemTypeString =
    "ConsiderationItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount,address recipient)";
  const orderComponentsPartialTypeString =
    "OrderComponents(address offerer,address zone,OfferItem[] offer,ConsiderationItem[] consideration,uint8 orderType,uint256 startTime,uint256 endTime,bytes32 zoneHash,uint256 salt,bytes32 conduitKey,uint256 counter)";

  const orderTypeString = `${orderComponentsPartialTypeString}${considerationItemTypeString}${offerItemTypeString}`;

  const offerItemTypeHash = keccak256(toUtf8Bytes(offerItemTypeString));
  const considerationItemTypeHash = keccak256(toUtf8Bytes(considerationItemTypeString));
  const orderTypeHash = keccak256(toUtf8Bytes(orderTypeString));

  //   offerItemTypeHash = "0xa66999307ad1bb4fde44d13a5d710bd7718e0c87c1eef68a571629fbf5b93d02"
  //   considerationItemTypeHash = "0x42d81c6929ffdc4eb27a0808e40e82516ad42296c166065de7f812492304ff6e"
  //   orderTypeHash = "0xfa445660b7e21515a59617fcd68910b487aa5808b8abda3d78bc85df364b2c2f"

  const offerHash = keccak256(
    "0x" +
      orderComponents.offer
        .map((offerItem: any) => {
          return keccak256(
            "0x" +
              [
                offerItemTypeHash.slice(2),
                offerItem.itemType.toString().padStart(64, "0"),
                offerItem.token.slice(2).padStart(64, "0"),
                offerItem.identifierOrCriteria["hex"].slice(2).padStart(64, "0"),
                offerItem.startAmount["hex"].slice(2).padStart(64, "0"),
                offerItem.endAmount["hex"].slice(2).padStart(64, "0"),
              ].join("")
          ).slice(2);
        })
        .join("")
  );

  const considerationHash = keccak256(
    "0x" +
      orderComponents.consideration
        .map((considerationItem: any) => {
          return keccak256(
            "0x" +
              [
                considerationItemTypeHash.slice(2),
                considerationItem.itemType.toString().padStart(64, "0"),
                considerationItem.token.slice(2).padStart(64, "0"),
                considerationItem.identifierOrCriteria["hex"].slice(2).padStart(64, "0"),
                considerationItem.startAmount["hex"].slice(2).padStart(64, "0"),
                considerationItem.endAmount["hex"].slice(2).padStart(64, "0"),
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
        toBN(orderComponents.startTime).toHexString().slice(2).padStart(64, "0"),
        toBN(orderComponents.endTime).toHexString().slice(2).padStart(64, "0"),
        orderComponents.zoneHash.slice(2),
        orderComponents.salt.slice(2).padStart(64, "0"),
        orderComponents.conduitKey.slice(2).padStart(64, "0"),
        orderComponents.counter["hex"].slice(2).padStart(64, "0"),
      ].join("")
  );

  return derivedOrderHash;
};

const orderComponents =
  '{"offerer":"0x8705f166792eeD5Be37b6573752C19F574CF05ac","zone":"0x0000000000000000000000000000000000000000","offer":[{"itemType":2,"token":"0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85","identifierOrCriteria":{"type":"BigNumber","hex":"0x3ce2c12c202cbaef1941cbc921ce184714a99e902ff9dac896227ded432da262"},"startAmount":{"type":"BigNumber","hex":"0x01"},"endAmount":{"type":"BigNumber","hex":"0x01"}}],"consideration":[{"itemType":0,"token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":{"type":"BigNumber","hex":"0x00"},"startAmount":{"type":"BigNumber","hex":"0xb1a2bc2ec50000"},"endAmount":{"type":"BigNumber","hex":"0xb1a2bc2ec50000"},"recipient":"0x8705f166792eeD5Be37b6573752C19F574CF05ac"},{"itemType":0,"token":"0x0000000000000000000000000000000000000000","identifierOrCriteria":{"type":"BigNumber","hex":"0x00"},"startAmount":{"type":"BigNumber","hex":"0x2386f26fc10000"},"endAmount":{"type":"BigNumber","hex":"0x2386f26fc10000"},"recipient":"0xF9343048CC63d897c88754Ffca032F527C466dDf"}],"totalOriginalConsiderationItems":2,"orderType":0,"zoneHash":"0x0000000000000000000000000000000000000000000000000000000000000000","salt":"0x88da3749993100bc6f0ac9f46f9beaa8811778b41451baf3531f8e36e85075e4","conduitKey":"0x0000000000000000000000000000000000000000000000000000000000000000","startTime":1677052894,"endTime":1677139294,"counter":{"type":"BigNumber","hex":"0x00"}}';
const jsonOrderComponents = JSON.parse(orderComponents);

const orderHash = calculateOrderHash(jsonOrderComponents); // 0x4638343b5831fab7d1d7ccd42e74930764d1638d2af74988ad9503bfc6368901
console.log({ orderHash });
