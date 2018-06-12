var Sigil = artifacts.require("./Sigil.sol");

contract('Sigil', function(accounts) {

  it("test that it should store increase total stake by 400.", async () => {
    let instance = await Sigil.deployed();
    let sigilInstance = instance;
    let stakeSigil = await sigilInstance.stakeSigil(400, {from: accounts[0]});
    let totalSigilStaked = await sigilInstance.totalStaked();
    assert.equal(totalSigilStaked.c[0], 400, "The total stake was not increased by 400 was not staked.");
  });

  it("wait a few seconds", function(done) {
      setTimeout(() => {
          done();
      }, 1000);
  })

  it("total staking gains should equal ... .", async function() {
        let instance = await Sigil.deployed();
        let sigilInstance = instance;
        let unixTime = Math.floor(new Date() / 1000)
        let stakingGains = await sigilInstance.getStakingGains(unixTime, {from: accounts[0]});
        
        // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
        console.log(stakingGains)
  });

});