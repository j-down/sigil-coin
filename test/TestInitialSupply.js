var Sigil = artifacts.require("./Sigil.sol");

contract("Sigil", function(accounts) {
  it("Initial Supply Test.", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    let accountBalance = await sigilInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    console.log(accountBalance.toNumber());

    assert.equal(
      accountBalance.toNumber(),
      1650000 * Math.pow(10, 18),
      "Initial Supply Failed."
    );
  });
});
