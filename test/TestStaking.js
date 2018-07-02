var Sigil = artifacts.require("./Sigil.sol");

contract("Sigil", function(accounts) {
  var seconds = 10;

  it("Transfer Sigil to Seperate Stakers", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    await sigilInstance.transfer(accounts[1], 1000 * Math.pow(10, 18), {
      from: accounts[0]
    });
  });

  it("Begin Staking Sigil.", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    await sigilInstance.stakeSigil(9000 * Math.pow(10, 18), {
      from: accounts[0]
    });

    await sigilInstance.stakeSigil(1000 * Math.pow(10, 18), {
      from: accounts[1]
    });
  });

  it("Wait for Stakers to Earn Tokens", function(done) {
    setTimeout(() => {
      done();
    }, seconds * 1000);
  });

  it("Test the Earnings from Staking", async function() {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    await sigilInstance.unstake({
      from: accounts[0]
    });

    await sigilInstance.unstake({
      from: accounts[1]
    });

    let ownerStakingBalance = await sigilInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    let transfereeStakingBalance = await sigilInstance.balanceOf(accounts[1], {
      from: accounts[1]
    });

    console.log(
      "Owner (90% of Total Staking) Staking Balance After " +
        seconds +
        " Second(s): " +
        ownerStakingBalance.c[0] / 10000
    );

    console.log(
      "Transferee (10% of Total Staking) Staking Balance After " +
        seconds +
        " Second(s): " +
        transfereeStakingBalance.c[0] / 10000
    );

    // //A maximum value for the value to be off for the purposes of testing
    // let loadingRange = 0.053;
    //
    // //Should increase at a rate of 0.05208 Sigil per second.
    // let minExpected =
    //   initialOwnerBalance.c[0] / 10000 + seconds * 0.052 - loadingRange;
    //
    // let maxExpected =
    //   initialOwnerBalance.c[0] / 10000 + seconds * 0.052 + loadingRange;
    //
    // let ownerBalance = ownerFinalBalance.c[0] / 10000;
    //
    // assert(
    //   minExpected <= ownerBalance && ownerBalance <= maxExpected,
    //   "Incorrect Value for Owner Claim"
    // );
  });
});
