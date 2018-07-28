var Sigil = artifacts.require("./Sigil.sol");
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
  var sigilStakingRate = 0;
  var firstPersonInitialBalance = 0;
  var firstPersonCalculatedEarnings;

  it("Transfer Sigil to all accounts that will stake.", async () => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    var address;

    // for (address = 1; address < 99; address++) {
    //   let transferSigil = await sigilInstance.transfer(accounts[address], 1, {
    //     from: accounts[0]
    //   });
    // }

    sigilStakingRate = await sigilInstance.stakingMintRate.call({
      from: accounts[0]
    });

    let currentTime = await sigilInstance.getNow.call({ from: accounts[0] });

    var d = new Date(0);

    d.setUTCSeconds(currentTime);
    console.log("Stake Date: " + d);

    let stakeSigil = await sigilInstance.stakeSigil(1, { from: accounts[0] });

    let timeTravelPromise = await timeTravel(1);
  });

  // it("100 days", async () => {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //
  //   var i;
  //
  //   for (i = 0; i < 100; i++) {
  //     console.log("--------- Days passed " + daysPassed + "----------");
  //     let currentTime = await sigilInstance.getNow.call({ from: accounts[0] });
  //
  //     var d = new Date(0);
  //
  //     d.setUTCSeconds(currentTime);
  //     console.log("--- Current date: " + d);
  //
  //     let updateHistory = await sigilInstance.updateTotalStakingHistory({
  //       from: accounts[0]
  //     });
  //     let timeTravelPromise = await timeTravel(1);
  //   }
  // });
  //
  // it("100 days", async () => {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //
  //   var i;
  //
  //   for (i = 0; i < 100; i++) {
  //     console.log("--------- Days passed " + daysPassed + "----------");
  //     let currentTime = await sigilInstance.getNow.call({ from: accounts[0] });
  //
  //     var d = new Date(0);
  //
  //     d.setUTCSeconds(currentTime);
  //     console.log("--- Current date: " + d);
  //
  //     let updateHistory = await sigilInstance.updateTotalStakingHistory({
  //       from: accounts[0]
  //     });
  //     let timeTravelPromise = await timeTravel(1);
  //   }
  // });
  //
  // it("100 days", async () => {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //
  //   var i;
  //
  //   for (i = 0; i < 100; i++) {
  //     console.log("--------- Days passed " + daysPassed + "----------");
  //     let currentTime = await sigilInstance.getNow.call({ from: accounts[0] });
  //
  //     var d = new Date(0);
  //
  //     d.setUTCSeconds(currentTime);
  //     console.log("--- Current date: " + d);
  //
  //     let updateHistory = await sigilInstance.updateTotalStakingHistory({
  //       from: accounts[0]
  //     });
  //     let timeTravelPromise = await timeTravel(1);
  //   }
  // });
  //
  // it("65 days and unstake", async () => {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //
  //   var i;
  //
  //   for (i = 0; i <= 65; i++) {
  //     console.log("--------- Days passed " + daysPassed + "----------");
  //     let currentTime = await sigilInstance.getNow.call({ from: accounts[0] });
  //
  //     var d = new Date(0);
  //
  //     d.setUTCSeconds(currentTime);
  //     console.log("--- Current date: " + d);
  //
  //     let updateHistory = await sigilInstance.updateTotalStakingHistory({
  //       from: accounts[0]
  //     });
  //     let timeTravelPromise = await timeTravel(1);
  //   }
  //
  //   let unstakeSigil = await sigilInstance.unstake({
  //     from: accounts[0]
  //   });
  //
  //   let balance = await sigilInstance.balanceOf(accounts[0], {
  //     from: accounts[0]
  //   });
  //
  //   console.log(balance);
  // });

  // it("Testing for unstaking and unstaking", async () => {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //
  //   var i;
  //
  //   for (i = 1; i <= 150; i++) {
  //
  //     console.log("--------- Days passed " + daysPassed + "----------");
  //     let currentTime = await sigilInstance.getNow.call({ from: accounts[0] });
  //
  //     var d = new Date(0);
  //
  //     d.setUTCSeconds(currentTime);
  //     console.log("--- Current date: " + d);
  //
  //     if (i < 99) {
  //       let stakeSigil = await sigilInstance.stakeSigil(1, {
  //         from: accounts[i]
  //       });
  //     } else if (i >= 99 && i < 198) {
  //       let useCase = i + 1;
  //       let unstakeSigil = await sigilInstance.unstake({
  //         from: accounts[useCase % 99]
  //       });
  //     } else if (i >= 198 && i < 297) {
  //       let useCase = i + 2;
  //       let stakeSigil = await sigilInstance.stakeSigil(1, {
  //         from: accounts[useCase % 99]
  //       });
  //     } else {
  //       let useCase = i + 3;
  //       let unstakeSigil = await sigilInstance.unstake({
  //         from: accounts[useCase % 99]
  //       });
  //     }
  //     let timeTravelPromise = await timeTravel(1);
  //   }
  // });
});
