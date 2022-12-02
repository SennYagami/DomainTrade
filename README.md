# Scripts

* `scripts/trade/approveEnsToSeaport.ts`

  * Domain owner needs approve ens to seaport first, then to list
* `scripts/trade/list.ts`

  * Construct the list info array, and let domain owner sign signature on the digest of the list info array. Construct final data contains list info and signature
* `scripts/trade/approveWethToSeaport.ts`

  * If one wants to make an offer using Weth, he/she needs to approve weth to seaport
* `scripts/trade/makeOffer.ts`

  * Construct the list info array, and let offer maker sign signature on the digest of the offer info array. Construct final data contains offer info and signature
* `scripts/trade/cancel.ts`

  * If one wants to cancel the previously listed domain, he/she needs to cancel the order. Call seaport cancel function passing order components

## Run

```Go
npm install
```

* Set `.env`
  * Needs rpc and two wallet private keys. (one as seller one as buyer)

```Go
npx hardhat run scripts/trade/approveEnsToSeaport.ts
npx hardhat run scripts/trade/approveWethToSeaport.ts
npx hardhat run scripts/trade/list.ts
npx hardhat run scripts/trade/makeOffer.ts
npx hardhat run scripts/trade/cancel.ts
```
