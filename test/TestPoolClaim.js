var Sigil = artifacts.require("./Sigil.sol");

contract("Sigil", function(accounts) {
  var seconds = 5;

  it("Set Pool.", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    await sigilInstance.setPool(accounts[1], {
      from: accounts[0]
    });

    console.log("Pool is set.");

    let poolAddress = await sigilInstance.pool({
      from: accounts[0]
    });

    console.log("Pool Address: " + poolAddress);

    assert.equal(poolAddress, accounts[1], "Did not set pool address.");
  });

  it("Wait for Pool to Earn Tokens", function(done) {
    setTimeout(() => {
      done();
    }, seconds * 1000);
  });

  it("Test the new Pool Balance", async function() {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    await sigilInstance.poolClaim({ from: accounts[1] });

    let poolFinalBalance = await sigilInstance.balanceOf(accounts[1], {
      from: accounts[1]
    });

    console.log("Pool New Balance: " + poolFinalBalance.c[0] / 10000);

    //The testing will definitely take at least 1 second
    let loadingTime = 0.052;

    let loadingRange = seconds * 0.053;

    let minExpected = seconds * 0.052 - loadingRange + loadingTime;

    let maxExpected = seconds * 0.052 + loadingRange + loadingTime;

    let poolBalance = poolFinalBalance.c[0] / 10000;

    assert(
      minExpected <= poolBalance && poolBalance <= maxExpected,
      poolFinalBalance.c[0] / 10000,
      "Incorrect Value for Pool Claim"
    );
  });
});
