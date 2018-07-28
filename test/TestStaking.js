// IMPORTANT
// To test staking you must implement these two functions in the solidity contract
// function getNow() view external returns (uint) {
//
//   return now;
// }
//
// function updateTotalStakingHistory() external {
//
//   // Get now in terms of the variable staking accuracy (days in Scale's case)
//   uint _nowAsTimingVariable = now.div(timingVariable);
//
//   // Set the totalStakingHistory as a timestamp of the totalScaleStaked today
//   totalStakingHistory[_nowAsTimingVariable] = totalScaleStaked;
// }

var Scale = artifacts.require("./Scale.sol");
// var timeTravel = require("./TimeUtil.js");

const jsonrpc = "2.0";
const id = 0;

const send = (method, params = []) =>
  web3.currentProvider.send({ id, jsonrpc, method, params });

var daysPassed = 0;

const timeTravel = async days => {
  daysPassed += days;
  var seconds = 84601 * days;
  await send("evm_increaseTime", [seconds]);
  await send("evm_mine");
};

const timeTravelOneHour = async () => {
  await send("evm_increaseTime", [3600]);
  await send("evm_mine");
};

contract("Scale", async accounts => {
  var secondsInADay = 86400;
  var scaleStakingRate = 0;
  var firstPersonInitialBalance = 0;
  var firstPersonCalculatedEarnings;

  it("Transfer Scale to accounts that will stake and begin staking for 1 and 2.", async () => {
    let instance = await Scale.deployed();

    let scaleInstance = instance;

    firstPersonInitialBalance = await scaleInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    firstPersonInitialBalance =
      firstPersonInitialBalance.toNumber() / Math.pow(10, 18);

    console.log("Person 1 Initial Balance: " + firstPersonInitialBalance);

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    var d = new Date(0);

    d.setUTCSeconds(currentTime);
    console.log("--- Initial Stake Date: " + d);

    let stakeScale = await scaleInstance.stakeScale(1, { from: accounts[0] });

    let transferScale = await scaleInstance.transfer(accounts[1], 1, {
      from: accounts[0]
    });

    let transferScale3 = await scaleInstance.transfer(accounts[2], 1, {
      from: accounts[0]
    });

    let transferScale4 = await scaleInstance.transfer(accounts[3], 3, {
      from: accounts[0]
    });

    scaleStakingRate = await scaleInstance.stakingMintRate.call({
      from: accounts[0]
    });

    let stakeScale2 = await scaleInstance.stakeScale(1, {
      from: accounts[1]
    });

    let timeTravelPromise = await timeTravel(1);
  });

  //Test to make sure first staker worked. Wait another
  it("Verify First Two Stakers Split", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;
    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[0]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    assert.equal(
      totalScaleCalculatedEarnings.toFixed(5),
      totalScaleExpectedEarnings.toFixed(5)
    );
  });

  it("Travel two days without anyone staking", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let timeTravelPromise = await timeTravel(2);

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[0]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    assert.equal(
      totalScaleCalculatedEarnings.toFixed(5),
      totalScaleExpectedEarnings.toFixed(5)
    );
  });

  it("Third person stakes then travel one day", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let stakeScale = await scaleInstance.stakeScale(1, { from: accounts[2] });

    let timeTravelPromise = await timeTravel(1);

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[0]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    let stakingGains3 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[2]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 3 Total Gains -- //");
    console.log(stakingGains3.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18) +
      stakingGains3.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    assert.equal(
      totalScaleCalculatedEarnings.toFixed(5),
      totalScaleExpectedEarnings.toFixed(5)
    );
  });

  it("Skip a day without staking", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let timeTravelPromise = await timeTravel(1);

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[0]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    let stakingGains3 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[2]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 3 Total Gains -- //");
    console.log(stakingGains3.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18) +
      stakingGains3.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    assert.equal(
      totalScaleCalculatedEarnings.toFixed(5),
      totalScaleExpectedEarnings.toFixed(5)
    );
  });

  it("Fourth person stakes half of total staking", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    let stakeScale = await scaleInstance.stakeScale(3, { from: accounts[3] });

    let timeTravelPromise = await timeTravel(1);

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[0]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    let stakingGains3 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[2]
    });

    let stakingGains4 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[3]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 3 Total Gains -- //");
    console.log(stakingGains3.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 4 Total Gains -- //");
    console.log(stakingGains4.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18) +
      stakingGains3.toNumber() / Math.pow(10, 18) +
      stakingGains4.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    assert.equal(
      totalScaleCalculatedEarnings.toFixed(5),
      totalScaleExpectedEarnings.toFixed(5)
    );
  });

  it("Everyone staking for 30 days.", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var i;

    for (i = 0; i <= 30; i++) {
      console.log("--------- Days passed " + daysPassed + "----------");
      let timeTravelPromise = await timeTravel(1);

      let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

      var d = new Date(0);

      d.setUTCSeconds(currentTime);
      console.log("--- Current date: " + d);

      let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
        from: accounts[0]
      });

      let stakingGains2 = await scaleInstance.getStakingGains.call(
        currentTime,
        {
          from: accounts[1]
        }
      );

      let stakingGains3 = await scaleInstance.getStakingGains.call(
        currentTime,
        {
          from: accounts[2]
        }
      );

      let stakingGains4 = await scaleInstance.getStakingGains.call(
        currentTime,
        {
          from: accounts[3]
        }
      );

      // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
      console.log("// -- Account 1 Total Gains -- //");
      console.log(stakingGains.toNumber() / Math.pow(10, 18));
      console.log("// -- Account 2 Total Gains -- //");
      console.log(stakingGains2.toNumber() / Math.pow(10, 18));
      console.log("// -- Account 3 Total Gains -- //");
      console.log(stakingGains3.toNumber() / Math.pow(10, 18));
      console.log("// -- Account 4 Total Gains -- //");
      console.log(stakingGains4.toNumber() / Math.pow(10, 18));

      let totalScaleCalculatedEarnings =
        stakingGains.toNumber() / Math.pow(10, 18) +
        stakingGains2.toNumber() / Math.pow(10, 18) +
        stakingGains3.toNumber() / Math.pow(10, 18) +
        stakingGains4.toNumber() / Math.pow(10, 18);

      let totalScaleExpectedEarnings =
        daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

      console.log(totalScaleExpectedEarnings);
      console.log(totalScaleCalculatedEarnings);
      // Sometimes the timeTravel is slightly off and is close to the next day but not exactly. So we wind forward
      //    an hour if this happens.
      if (
        totalScaleCalculatedEarnings.toFixed(5) ==
        totalScaleExpectedEarnings.toFixed(5)
      ) {
        console.log("--- passed ---");
      } else {
        let timeProm = await timeTravelOneHour();

        let currentTime = await scaleInstance.getNow.call({
          from: accounts[0]
        });

        var d = new Date(0);

        d.setUTCSeconds(currentTime);
        console.log("--- Current date: " + d);

        let stakingGains = await scaleInstance.getStakingGains.call(
          currentTime,
          {
            from: accounts[0]
          }
        );

        let stakingGains2 = await scaleInstance.getStakingGains.call(
          currentTime,
          {
            from: accounts[1]
          }
        );

        let stakingGains3 = await scaleInstance.getStakingGains.call(
          currentTime,
          {
            from: accounts[2]
          }
        );

        let stakingGains4 = await scaleInstance.getStakingGains.call(
          currentTime,
          {
            from: accounts[3]
          }
        );

        // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
        console.log("// -- Account 1 Total Gains -- //");
        console.log(stakingGains.toNumber() / Math.pow(10, 18));
        console.log("// -- Account 2 Total Gains -- //");
        console.log(stakingGains2.toNumber() / Math.pow(10, 18));
        console.log("// -- Account 3 Total Gains -- //");
        console.log(stakingGains3.toNumber() / Math.pow(10, 18));
        console.log("// -- Account 4 Total Gains -- //");
        console.log(stakingGains4.toNumber() / Math.pow(10, 18));

        let totalScaleCalculatedEarnings =
          stakingGains.toNumber() / Math.pow(10, 18) +
          stakingGains2.toNumber() / Math.pow(10, 18) +
          stakingGains3.toNumber() / Math.pow(10, 18) +
          stakingGains4.toNumber() / Math.pow(10, 18);

        let totalScaleExpectedEarnings =
          daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

        console.log(totalScaleExpectedEarnings);
        console.log(totalScaleCalculatedEarnings);
        assert.equal(
          totalScaleCalculatedEarnings.toFixed(5),
          totalScaleExpectedEarnings.toFixed(5)
        );
      }
    }
  });

  it("First person unstakes", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    console.log("// -- Account 1 Account Balance -- //");
    console.log(firstPersonInitialBalance);

    console.log("Days Passed: " + daysPassed);

    // -- log the total staking information

    let currentTime = await scaleInstance.getNow.call({
      from: accounts[0]
    });

    var d = new Date(0);

    d.setUTCSeconds(currentTime);
    console.log("--- Current date: " + d);

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[0]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    let stakingGains3 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[2]
    });

    let stakingGains4 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[3]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 3 Total Gains -- //");
    console.log(stakingGains3.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 4 Total Gains -- //");
    console.log(stakingGains4.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18) +
      stakingGains3.toNumber() / Math.pow(10, 18) +
      stakingGains4.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    console.log(totalScaleExpectedEarnings);
    console.log(totalScaleCalculatedEarnings);

    // --

    // Because at least 7 days have passed person 1 can unstake.
    let unstakeScale = await scaleInstance.unstake({ from: accounts[0] });

    let firstPersonBalance = await scaleInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    console.log("// -- Account 1 Account Balance -- //");
    console.log(firstPersonBalance.toNumber() / Math.pow(10, 18));

    //Correct amount
    firstPersonCalculatedEarnings =
      firstPersonBalance.toNumber() / Math.pow(10, 18);

    let firstPersonExpectedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) + firstPersonInitialBalance;

    //Assert person 1 recieved the correct amount of tokens (should be the same as person 2 has total)
    assert.equal(
      firstPersonCalculatedEarnings.toFixed(5),
      firstPersonExpectedEarnings.toFixed(5)
    );
  });

  it("Make sure everyone else is still staking properly", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    //reset days to make sure current stakers are staking properly
    daysPassed = 0;

    let timeTravelPromise = await timeTravel(1);

    let currentTime = await scaleInstance.getNow.call({ from: accounts[1] });

    let stakingGains = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[1]
    });

    let stakingGains2 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[2]
    });

    let stakingGains3 = await scaleInstance.getStakingGains.call(currentTime, {
      from: accounts[3]
    });

    // Should be 5,479 total per day. Because they started staking the same day it should be split 50/50 between the two
    console.log("// -- Account 1 Total Gains -- //");
    console.log(stakingGains.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 2 Total Gains -- //");
    console.log(stakingGains2.toNumber() / Math.pow(10, 18));
    console.log("// -- Account 3 Total Gains -- //");
    console.log(stakingGains3.toNumber() / Math.pow(10, 18));

    let totalScaleCalculatedEarnings =
      stakingGains.toNumber() / Math.pow(10, 18) +
      stakingGains2.toNumber() / Math.pow(10, 18) +
      stakingGains3.toNumber() / Math.pow(10, 18);

    let totalScaleExpectedEarnings =
      daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18);

    console.log(totalScaleExpectedEarnings);
    console.log(totalScaleCalculatedEarnings);
    // assert.equal(
    //   totalScaleCalculatedEarnings.toFixed(5),
    //   totalScaleExpectedEarnings.toFixed(5)
    // );
  });
});
