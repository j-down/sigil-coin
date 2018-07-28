var Scale = artifacts.require("./Scale.sol");

const jsonrpc = "2.0";
const id = 0;

const send = (method, params = []) =>
  web3.currentProvider.send({ id, jsonrpc, method, params });

const timeTravel = async () => {
  // Fails when less than 1 year
  await send("evm_increaseTime", [31536001]);
  await send("evm_mine");
};

contract("Scale", function(accounts) {
  var oldPoolMintRate;
  var oldOwnerMintRate;
  var oldStakingMintRate;

  var poolPercentage;
  var ownerPercentage;
  var stakingPercentage;

  it("Test that the inflation rates are accurate in the beginning", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let poolMintRate = await scaleInstance.poolMintRate({
      from: accounts[0]
    });

    let ownerMintRate = await scaleInstance.ownerMintRate({
      from: accounts[0]
    });

    let stakingMintRate = await scaleInstance.stakingMintRate({
      from: accounts[0]
    });

    poolPercentage = await scaleInstance.poolPercentage({
      from: accounts[0]
    });

    ownerPercentage = await scaleInstance.ownerPercentage({
      from: accounts[0]
    });

    stakingPercentage = await scaleInstance.stakingPercentage({
      from: accounts[0]
    });

    //Adjust for decimal places
    oldPoolMintRate = poolMintRate.toNumber() / Math.pow(10, 18);
    oldOwnerMintRate = ownerMintRate.toNumber() / Math.pow(10, 18);
    oldStakingMintRate = stakingMintRate.toNumber() / Math.pow(10, 18);

    poolPercentage = poolPercentage * 0.01;
    ownerPercentage = ownerPercentage * 0.01;
    stakingPercentage = stakingPercentage * 0.01;

    console.log("Pool Inflation Rate: " + oldPoolMintRate);
    console.log("Owner Inflation Rate: " + oldOwnerMintRate);
    console.log("Staking Inflation Rate: " + oldStakingMintRate);

    var totalMintRate = oldPoolMintRate + oldOwnerMintRate + oldStakingMintRate;

    console.log("Total Mint Rate: " + totalMintRate);

    let calculatedStakingPercentage = oldStakingMintRate / totalMintRate;
    let calculatedPoolPercentage = oldPoolMintRate / totalMintRate;
    let calculatedOwnerPercentage = oldOwnerMintRate / totalMintRate;

    console.log("Calculated Pool Percentage: " + calculatedPoolPercentage);
    console.log("Calculated Owner Percentage: " + calculatedOwnerPercentage);
    console.log(
      "Calculated Staking Percentage: " + calculatedStakingPercentage
    );

    let setPool = await scaleInstance.setPool(accounts[1], {
      from: accounts[0]
    });

    let stakeScale = await scaleInstance.stakeScale(1, { from: accounts[0] });

    assert(
      stakingPercentage.toFixed(2) == calculatedStakingPercentage.toFixed(2) &&
        poolPercentage.toFixed(2) == calculatedPoolPercentage.toFixed(2) &&
        ownerPercentage.toFixed(2) == calculatedOwnerPercentage.toFixed(2)
    );
  });

  it("Update inflation rate after 1 year", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var i;
    var percentInflation = 1.0;

    let timeTravelPromise = await timeTravel();

    // Test for 25 years
    // Start deflating by 0.005% after year 5 and will stop inflation rate decreases at 1%
    for (i = 0; i < 25; i++) {
      let yearsPassed = i + 1;

      console.log(
        "------------ " + yearsPassed + " Years Passed ----------------"
      );

      // -- Claim and update total Supply
      let ownerClaim = await scaleInstance.ownerClaim({
        from: accounts[0]
      });

      let poolClaim = await scaleInstance.poolIssue({
        from: accounts[8]
      });

      let unstakeScale = await scaleInstance.unstake({ from: accounts[0] });

      let stakeScale = await scaleInstance.stakeScale(1, { from: accounts[0] });

      let totalSupply = await scaleInstance.totalSupply({
        from: accounts[0]
      });

      // Update rates
      let inflateScale = await scaleInstance.updateInflationRate({
        from: accounts[0]
      });

      if (percentInflation > 0.1) {
        percentInflation -= 0.3;
      } else {
        if (percentInflation > 0.01) {
          percentInflation -= 0.005;
        }
      }

      let poolMintRate = await scaleInstance.poolMintRate({
        from: accounts[0]
      });

      let ownerMintRate = await scaleInstance.ownerMintRate({
        from: accounts[0]
      });

      let stakingMintRate = await scaleInstance.stakingMintRate({
        from: accounts[0]
      });

      totalSupply = totalSupply.toNumber() / Math.pow(10, 18);

      poolMintRate = poolMintRate.toNumber() / Math.pow(10, 18);
      ownerMintRate = ownerMintRate.toNumber() / Math.pow(10, 18);
      stakingMintRate = stakingMintRate.toNumber() / Math.pow(10, 18);

      oldPoolMintRate =
        totalSupply * percentInflation * poolPercentage / 31536000;
      oldOwnerMintRate =
        totalSupply * percentInflation * ownerPercentage / 31536000;
      oldStakingMintRate =
        totalSupply * percentInflation * stakingPercentage / 31536000;

      console.log("New Pool Inflation Rate: " + poolMintRate.toFixed(5));
      console.log(
        "Expected Pool Inflation Rate: " + oldPoolMintRate.toFixed(5)
      );

      console.log("New Owner Mint Inflation Rate: " + ownerMintRate.toFixed(5));
      console.log(
        "Expected Owner Mint Inflation Rate: " + oldOwnerMintRate.toFixed(5)
      );

      console.log(
        "New Staking Mint Inflation Rate: " + stakingMintRate.toFixed(5)
      );
      console.log(
        "Expected Staking Mint Inflation Rate: " + oldStakingMintRate.toFixed(5)
      );
      console.log("--------------------------------");

      console.log("Total Supply Now: " + totalSupply);
      let totalCoins =
        poolMintRate * 31536000 +
        ownerMintRate * 31536000 +
        stakingMintRate * 31536000;
      console.log("Total Coins to be Minted this Year: " + totalCoins);

      console.log("-----------------------------");

      assert(
        poolMintRate.toFixed(5) == oldPoolMintRate.toFixed(5) &&
          ownerMintRate.toFixed(5) == oldOwnerMintRate.toFixed(5) &&
          stakingMintRate.toFixed(5) == oldStakingMintRate.toFixed(5)
      );

      let timeTravelPromise = await timeTravel();
    }
  });
});
