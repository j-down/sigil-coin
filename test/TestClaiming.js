var Scale = artifacts.require("./Scale.sol");

const jsonrpc = "2.0";
const id = 0;

const send = (method, params = []) =>
  web3.currentProvider.send({ id, jsonrpc, method, params });

const timeTravel = async seconds => {
  await send("evm_increaseTime", [seconds]);
  await send("evm_mine");
};

contract("Scale", function(accounts) {
  it("Test the owner claim after 1 day of minting", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let secondsInADay = 86400;
    let ownerMintRate = await scaleInstance.ownerMintRate({
      from: accounts[0]
    });

    // Adjust for decimal places
    ownerMintRate = ownerMintRate.toNumber() / Math.pow(10, 18);

    var expectedOwnerBalance = await scaleInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    expectedOwnerBalance = secondsInADay * ownerMintRate + 8000000;

    // Travel forward one day
    let timeTravelPromise = await timeTravel(secondsInADay);

    // Owner claims 1 day's worth of coins
    let ownerClaim = await scaleInstance.ownerClaim({
      from: accounts[0]
    });

    // Check new owner balance
    var ownerBalance = await scaleInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    ownerBalance = ownerBalance.toNumber() / Math.pow(10, 18);

    assert.equal(ownerBalance.toFixed(0), expectedOwnerBalance.toFixed(0));
  });

  it("Test the pool claim after 1 day of minting", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let secondsInADay = 86400;
    let poolMintRate = await scaleInstance.poolMintRate({
      from: accounts[0]
    });

    // Adjust for decimal places
    poolMintRate = poolMintRate.toNumber() / Math.pow(10, 18);

    // Attempting to mint to the pool before setting it should revert
    // let failedPoolMint = await scaleInstance.poolIssue({
    //   from: accounts[8]
    // });

    // Owner sets the pool
    let setPool = await scaleInstance.setPool(accounts[1], {
      from: accounts[0]
    });

    // One day has passed in total because of past timeTravel
    expectedPoolBalance = secondsInADay * poolMintRate;

    // Anyone can issue to the pool
    let poolClaim = await scaleInstance.poolIssue({
      from: accounts[8]
    });

    // Check new pool
    var poolBalance = await scaleInstance.balanceOf(accounts[1], {
      from: accounts[1]
    });

    poolBalance = poolBalance.toNumber() / Math.pow(10, 18);

    // allow for some variation because of timing
    let minExpected = expectedPoolBalance - 2;
    let maxExpected = expectedPoolBalance + 2;

    console.log("Pool Balance: " + poolBalance.toFixed(0));
    console.log("Expected Pool Balance: " + expectedPoolBalance.toFixed(0));
    assert(
      poolBalance.toFixed(0) <= maxExpected.toFixed(0) &&
        poolBalance.toFixed(0) >= minExpected.toFixed(0)
    );
  });
});
