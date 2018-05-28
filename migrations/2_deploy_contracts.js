var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Sigil = artifacts.require("./Sigil.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Sigil);
};
