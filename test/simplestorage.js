var Sigil = artifacts.require("./Sigil.sol");

contract('Sigil', function(accounts) {

  it("...should store the value 100.", function() {
    return Sigil.deployed().then(function(instance) {
      sigilInstance = instance;

      return sigilInstance.stakeSigil(100, {from: accounts[0]});
    }).then(function() {
      return sigilInstance.totalStaked();
    }).then(function(totalStaked) {
      assert.equal(totalStaked, 100, "The value 100 was not staked.");
    });
  });
  
});
