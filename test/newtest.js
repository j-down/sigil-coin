var Sigil = artifacts.require("./Sigil.sol");

contract('Sigil', function(accounts) {

  it("...should store the value 100.", function() {
    return Sigil.deployed().then(function(instance) {
      sigilInstance = instance;

      return sigilInstance.stakeSigil(400, {from: accounts[0]});
    }).then(function() {
      return sigilInstance.totalStaked();
    }).then(function(totalStaked) {
      console.log(totalStaked)
      assert.equal(totalStaked.c[0], 400, "The value 100 was not staked.");
    });
  });

  it("...should store the value 200.", function() {
    return Sigil.deployed().then(function(instance) {
      sigilInstance = instance;

      return sigilInstance.totalStaked();
    }).then(function(totalStaked) {
      console.log(totalStaked)
    })
  });

});