var Scale = artifacts.require("./Scale.sol");

contract("Scale", function(accounts) {
  it("Test initial Scale supply:", async () => {
    let instance = await Scale.deployed();

    let scaleInstance = instance;

    ownerBalance = await scaleInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    ownerBalance = ownerBalance.toNumber() / Math.pow(10, 18);

    console.log("---");
    console.log(ownerBalance);
  });
});
