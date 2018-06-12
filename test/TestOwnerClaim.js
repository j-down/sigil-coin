var Sigil = artifacts.require("./Sigil.sol");

contract("Sigil", function(accounts) {
  var seconds = 1;

  it("Wait for Owner to Earn Tokens", function(done) {
    setTimeout(() => {
      done();
    }, seconds * 1000);
  });

  it("Test the new Owner Balance", async function() {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    let initialOwnerBalance = await sigilInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    await sigilInstance.ownerClaim({ from: accounts[0] });

    let ownerFinalBalance = await sigilInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    console.log(
      "Owner New Balance After " +
        seconds +
        " Second(s): " +
        ownerFinalBalance.c[0] / 10000
    );

    //A maximum value for the value to be off for the purposes of testing
    let loadingRange = 0.053;

    //Should increase at a rate of 0.05208 Sigil per second.
    let minExpected =
      initialOwnerBalance.c[0] / 10000 + seconds * 0.052 - loadingRange;

    let maxExpected =
      initialOwnerBalance.c[0] / 10000 + seconds * 0.052 + loadingRange;

    let ownerBalance = ownerFinalBalance.c[0] / 10000;

    assert(
      minExpected <= ownerBalance && ownerBalance <= maxExpected,
      "Incorrect Value for Owner Claim"
    );
  });
});
