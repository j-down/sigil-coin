//Testing for staking failure when attempting to stake more than you have/

var Sigil = artifacts.require("./Sigil.sol");

contract("Sigil", function(accounts) {
  it("Unstaking Test.", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    console.log("Staking 1000 Sigil...");

    await sigilInstance.stakeSigil(1000 * Math.pow(10, 18), {
      from: accounts[0]
    });

    let stakingBalance = await sigilInstance.getStakedBalance({
      from: accounts[0]
    });
    console.log("Staking Balance Before Unstaking: " + stakingBalance.c[0]);

    await sigilInstance.unstake({
      from: accounts[0]
    });

    console.log("Unstake has run.");

    let unstakedBalance = await sigilInstance.getStakedBalance({
      from: accounts[0]
    });

    console.log("Staking Balance After Unstaking: " + unstakedBalance.c[0]);

    assert.equal(unstakedBalance.c[0], 0, "Unstaking Failed.");
  });
});
