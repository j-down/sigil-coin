var Sigil = artifacts.require("./Sigil.sol");

module.exports = function(deployer) {
  deployer.deploy(Sigil);
};
