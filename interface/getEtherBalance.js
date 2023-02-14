const ethers = require("ethers");

async function getEtherBalance(address) {
  // address:string
  const provider = new ethers.getDefaultProvider("goerli");
  const res = await provider.getBalance(address);
  const etherBalance = ethers.utils.formatEther(res);

  return etherBalance;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getEtherBalance("0x8705f166792eed5be37b6573752c19f574cf05ac").catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
