var Sigil = artifacts.require("./Sigil.sol");
// var timeTravel = require("./TimeUtil.js");

// const jsonrpc = '2.0'
// const id = 0

// const send = (method, params = []) => web3
//   .currentProvider
//   .send({id, jsonrpc, method, params})

// const timeTravel = async seconds => {
//   await send('evm_increaseTime', [seconds])
//   await send('evm_mine')
// }

contract("Sigil", function (accounts) {
  before("set up staking from different users", async() => {
    let instance = await Sigil.deployed();

    let sigilInstance = instance;

    let stakeSigil = await sigilInstance.stakeSigil(1, {from: accounts[0]});

    let transferSigil = await sigilInstance.transfer(accounts[1], 1, {from: accounts[0]});

    let transferSigil3 = await sigilInstance.transfer(accounts[2], 1, {from: accounts[0]});

    let transferSigil4 = await sigilInstance.transfer(accounts[3], 3, {from: accounts[0]});

    let stakeSigil2 = await sigilInstance.stakeSigil(1, {from: accounts[1]});
    // await timeTravel(86400 * 10);

    // let stakingGains = await sigilInstance
    //   .getStakingGains
    //   .call(unixTime, {from: accounts[0]});
    // console.log(stakingGains)
    return Promise.all[instance,
      stakeSigil,
      transferSigil,
      transferSigil3,
      transferSigil4,
      stakeSigil2]
  })
  // it("Begin Testing Sigil Staking Mechanic: ---", async () => {   let instance
  // = await Sigil.deployed();   let sigilInstance = instance;   let stakeSigil =
  // await sigilInstance.stakeSigil(1, { from: accounts[0] });   let
  // transferSigil = await sigilInstance.transfer(accounts[1], 1, {     from:
  // accounts[0]   }); let transferSigil3 = await
  // sigilInstance.transfer(accounts[2], 1, { from: accounts[0]   });   let
  // transferSigil4 = await sigilInstance.transfer(accounts[3], 3, {     from:
  // accounts[0]   });   let stakeSigil2 = await sigilInstance.stakeSigil(1, {
  // from: accounts[1] }); });

  it("Waiting 1 minute...", async function (done) {
    // setTimeout(() => {
    //   done();
    // }, 60000);
    let instance = await Sigil.deployed();
    let sigilInstance = instance;
    let stakingGains2 = await sigilInstance
      .getNow
      .call( {from: accounts[1]});
    console.log(stakingGains2, "what I want")
  });

  // it("First Test: ---", async function () {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //   let unixTime = Math.floor(new Date() / 1000);
  //   let stakingGains = await sigilInstance
  //     .getStakingGains
  //     .call(unixTime, {from: accounts[0]});

  //   let stakingGains2 = await sigilInstance
  //     .getStakingGains
  //     .call(unixTime, {from: accounts[1]});

  //   let stakeSigil3 = await sigilInstance.stakeSigil(1, {from: accounts[2]});

  //   // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
  //   console.log("---- TOTAL GAINS ACCOUNT 1 ----");
  //   console.log(stakingGains);
  //   console.log("--------------------------------");

  //   console.log("---- TOTAL GAINS ACCOUNT 2 ----");
  //   console.log(stakingGains2);
  //   console.log("--------------------------------");
  // });

  // it("Waiting 1 minute...", function (done) {
  //   setTimeout(() => {
  //     done();
  //   }, 60000);
  // });

  // it("Test for appropriate change with one more person staking", async function () {
  //   let instance = await Sigil.deployed();
  //   let sigilInstance = instance;
  //   let unixTime = Math.floor(new Date() / 1000);
  //   let stakingGains = await sigilInstance
  //     .getStakingGains
  //     .call(unixTime, {from: accounts[0]});
  //   let stakingGains2 = await sigilInstance
  //     .getStakingGains
  //     .call(unixTime, {from: accounts[1]});

  //   let stakingGains3 = await sigilInstance
  //     .getStakingGains
  //     .call(unixTime, {from: accounts[2]});

  //   // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
  //   console.log("---- TOTAL GAINS ACCOUNT 1 ----");
  //   console.log(stakingGains);
  //   console.log("--------------------------------");
  //   console.log("---- TOTAL GAINS ACCOUNT 2 ----");
  //   console.log(stakingGains2);
  //   console.log("--------------------------------");
  //   console.log("---- TOTAL GAINS ACCOUNT 3 ----");
  //   console.log(stakingGains3);
  //   console.log("--------------------------------");
  // });

  // it("Waiting 1 minute...", function (done) {
  //   setTimeout(() => {
  //     done();
  //   }, 60000);
  // });

//   it("Testing one day without anyone staking: ---", async function () {
//     let instance = await Sigil.deployed();
//     let sigilInstance = instance;
//     let unixTime = Math.floor(new Date() / 1000);
//     let stakingGains = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[0]});
//     let stakingGains2 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[1]});

//     let stakingGains3 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[2]});

//     // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
//     console.log("---- TOTAL GAINS ACCOUNT 1 ----");
//     console.log(stakingGains);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 2 ----");
//     console.log(stakingGains2);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 3 ----");
//     console.log(stakingGains3);
//     console.log("--------------------------------");
//   });

//   it("Waiting 2 minutes...", function (done) {
//     setTimeout(() => {
//       done();
//     }, 120000);
//   });

//   it("2 Days Without Staking Test: ---", async function () {
//     let instance = await Sigil.deployed();
//     let sigilInstance = instance;
//     let unixTime = Math.floor(new Date() / 1000);
//     let stakingGains = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[0]});
//     let stakingGains2 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[1]});

//     let stakingGains3 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[2]});

//     let stakeSigil = await sigilInstance.stakeSigil(3, {from: accounts[3]});

//     // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
//     console.log("---- TOTAL GAINS ACCOUNT 1 ----");
//     console.log(stakingGains);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 2 ----");
//     console.log(stakingGains2);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 3 ----");
//     console.log(stakingGains3);
//     console.log("--------------------------------");
//   });

//   it("Waiting 1 minute...", function (done) {
//     setTimeout(() => {
//       done();
//     }, 60000);
//   });

//   it("Test for 4th person taking up half of total staking: ---", async function () {
//     let instance = await Sigil.deployed();
//     let sigilInstance = instance;
//     let unixTime = Math.floor(new Date() / 1000);
//     let stakingGains = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[0]});
//     let stakingGains2 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[1]});

//     let stakingGains3 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[2]});

//     let stakingGains4 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[3]});

//     // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
//     console.log("---- TOTAL GAINS ACCOUNT 1 ----");
//     console.log(stakingGains);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 2 ----");
//     console.log(stakingGains2);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 3 ----");
//     console.log(stakingGains3);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 4 ----");
//     console.log(stakingGains4);
//     console.log("--------------------------------");
//   });

//   it("Waiting 1 minute...", function (done) {
//     setTimeout(() => {
//       done();
//     }, 60000);
//   });

//   it("Test for multiple days : ---", async function () {
//     let instance = await Sigil.deployed();
//     let sigilInstance = instance;
//     let unixTime = Math.floor(new Date() / 1000);
//     let stakingGains = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[0]});
//     let stakingGains2 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[1]});

//     let stakingGains3 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[2]});

//     let stakingGains4 = await sigilInstance
//       .getStakingGains
//       .call(unixTime, {from: accounts[3]});

//     // let stakeBalance = await sigilInstance.stakeBalances.call(accounts[0]);
//     console.log("---- TOTAL GAINS ACCOUNT 1 ----");
//     console.log(stakingGains);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 2 ----");
//     console.log(stakingGains2);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 3 ----");
//     console.log(stakingGains3);
//     console.log("--------------------------------");
//     console.log("---- TOTAL GAINS ACCOUNT 4 ----");
//     console.log(stakingGains4);
//     console.log("--------------------------------");
//   });
});
