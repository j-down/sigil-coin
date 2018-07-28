var Sigil = artifacts.require("./Sigil.sol");

contract("Scale", function(accounts) {
  it("Test initial Sigil supply:", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    ownerBalance = await sigilInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    ownerBalance = ownerBalance.toNumber() / Math.pow(10, 18);

    console.log("---");
    console.log(ownerBalance);
  });
});
