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

  it("Transfer Scale to all accounts that will stake.", async () => {
    let instance = await Scale.deployed();

    let scaleInstance = instance;

    var address;

    // for (address = 1; address < 99; address++) {
    //   let transferScale = await scaleInstance.transfer(accounts[address], 1, {
    //     from: accounts[0]
    //   });
    // }

    scaleStakingRate = await scaleInstance.stakingMintRate.call({
      from: accounts[0]
    });

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    var d = new Date(0);

    d.setUTCSeconds(currentTime);
    console.log("Stake Date: " + d);

    let stakeScale = await scaleInstance.stakeScale(1, { from: accounts[0] });

    let timeTravelPromise = await timeTravel(1);
  });

  it("100 days", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var i;

    for (i = 0; i < 100; i++) {
      console.log("--------- Days passed " + daysPassed + "----------");
      let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

      var d = new Date(0);

      d.setUTCSeconds(currentTime);
      console.log("--- Current date: " + d);

      let updateHistory = await scaleInstance.updateTotalStakingHistory({
        from: accounts[0]
      });
      let timeTravelPromise = await timeTravel(1);
    }
  });

  it("100 days", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var i;

    for (i = 0; i < 100; i++) {
      console.log("--------- Days passed " + daysPassed + "----------");
      let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

      var d = new Date(0);

      d.setUTCSeconds(currentTime);
      console.log("--- Current date: " + d);

      let updateHistory = await scaleInstance.updateTotalStakingHistory({
        from: accounts[0]
      });
      let timeTravelPromise = await timeTravel(1);
    }
  });

  it("100 days", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var i;

    for (i = 0; i < 100; i++) {
      console.log("--------- Days passed " + daysPassed + "----------");
      let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

      var d = new Date(0);

      d.setUTCSeconds(currentTime);
      console.log("--- Current date: " + d);

      let updateHistory = await scaleInstance.updateTotalStakingHistory({
        from: accounts[0]
      });
      let timeTravelPromise = await timeTravel(1);
    }
  });

  it("100 days and unstake", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var i;

    for (i = 0; i < 100; i++) {
      console.log("--------- Days passed " + daysPassed + "----------");
      let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

      var d = new Date(0);

      d.setUTCSeconds(currentTime);
      console.log("--- Current date: " + d);

      let updateHistory = await scaleInstance.updateTotalStakingHistory({
        from: accounts[0]
      });
      let timeTravelPromise = await timeTravel(1);
    }

    let unstakeScale = await scaleInstance.unstake({
      from: accounts[0]
    });

    let balance = await scaleInstance.balanceOf(accounts[0], {
      from: accounts[0]
    });

    var finalBalance = balance.toNumber() / Math.pow(10, 18);

    console.log(finalBalance);

    //Make sure only a year's worth of Sigil was given;
    assert(finalBalance <= 10000000);
  });

  // it("Testing for unstaking and unstaking", async () => {
  //   let instance = await Scale.deployed();
  //   let scaleInstance = instance;
  //
  //   var i;
  //
  //   for (i = 1; i <= 150; i++) {
  //
  //     console.log("--------- Days passed " + daysPassed + "----------");
  //     let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });
  //
  //     var d = new Date(0);
  //
  //     d.setUTCSeconds(currentTime);
  //     console.log("--- Current date: " + d);
  //
  //     if (i < 99) {
  //       let stakeScale = await scaleInstance.stakeScale(1, {
  //         from: accounts[i]
  //       });
  //     } else if (i >= 99 && i < 198) {
  //       let useCase = i + 1;
  //       let unstakeScale = await scaleInstance.unstake({
  //         from: accounts[useCase % 99]
  //       });
  //     } else if (i >= 198 && i < 297) {
  //       let useCase = i + 2;
  //       let stakeScale = await scaleInstance.stakeScale(1, {
  //         from: accounts[useCase % 99]
  //       });
  //     } else {
  //       let useCase = i + 3;
  //       let unstakeScale = await scaleInstance.unstake({
  //         from: accounts[useCase % 99]
  //       });
  //     }
  //     let timeTravelPromise = await timeTravel(1);
  //   }
  // });
});
