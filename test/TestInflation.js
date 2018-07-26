var Sigil = artifacts.require("./Sigil.sol");

contract("Sigil", function(accounts) {
  var oldPoolMintRate;
  var oldOwnerMintRate;
  var oldGlobalMintRate;

  it("test that it should store increase total stake by 400.", async () => {
    let instance = await Sigil.deployed();
    let sigilInstance = instance;

    let poolMintRate = await sigilInstance.poolMintRate({
      from: accounts[0]
    });

    let ownerMintRate = await sigilInstance.ownerMintRate({
      from: accounts[0]
    });

    let globalMintRate = await sigilInstance.globalMintRate({
      from: accounts[0]
    });

    console.log("Pool Inflation Rate: " + poolMintRate);
    console.log("Owner Inflation Rate: " + ownerMintRate);
    console.log("Global Inflation Rate: " + globalMintRate);

    oldPoolMintRate = poolMintRate;
    oldOwnerMintRate = ownerMintRate;
    oldGlobalMintRate = globalMintRate;
  });

  it("wait a few seconds", function(done) {
    setTimeout(() => {
      done();
    }, 6000);
  });

  it("Final update for inflation rate", async function() {
    let instance = await Sigil.deployed();
    let sigilInstance = instance;

    let inflateSigil = await sigilInstance.updateInflationRate({
      from: accounts[0]
    });

    let poolMintRate = await sigilInstance.poolMintRate({
      from: accounts[0]
    });

    let ownerMintRate = await sigilInstance.ownerMintRate({
      from: accounts[0]
    });

    let globalMintRate = await sigilInstance.globalMintRate({
      from: accounts[0]
    });

    oldPoolMintRate = oldPoolMintRate - oldPoolMintRate * 0.15;
    oldOwnerMintRate = oldOwnerMintRate - oldOwnerMintRate * 0.15;
    oldGlobalMintRate = oldGlobalMintRate - oldGlobalMintRate * 0.15;

    console.log("New Pool Inflation Rate: " + poolMintRate);
    console.log("Expected Pool Inflation Rate: " + oldPoolMintRate);

    console.log("New Owner Mint Inflation Rate: " + ownerMintRate);
    console.log("Expected Owner Mint Inflation Rate: " + oldOwnerMintRate);

    console.log("New Global Mint Inflation Rate: " + globalMintRate);
    console.log("Expected Global Mint Inflation Rate: " + oldGlobalMintRate);
  });
});
