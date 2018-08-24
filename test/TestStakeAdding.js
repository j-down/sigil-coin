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


const jsonrpc = "2.0";
const id = 0;

const send = (method, params = []) =>
  web3.currentProvider.send({ id, jsonrpc, method, params });

var daysPassed = 0;

const timeTravel = async days => {
  daysPassed += days;
  var seconds = 84600 * days;
  await send("evm_increaseTime", [seconds]);
  await send("evm_mine");
};

var secondsInADay = 86400;

contract("Scale", async accounts => {

  it("Transfer Scale to all accounts that will stake.", async () => {
    let instance = await Scale.deployed();

    let scaleInstance = instance;
   
    var address;

    for (address = 1; address < 99; address++) {
      let transferScale = await scaleInstance.transfer(accounts[address], 1, {
        from: accounts[0]
      });
    }

    await scaleInstance.transfer(accounts[1], 1000, {
        from: accounts[0]
    });

    await scaleInstance.transfer(accounts[2], 1000, {
        from: accounts[0]
    });

    let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

    var d = new Date(0);

    d.setUTCSeconds(currentTime);
    console.log("Stake Date: " + d);

  });

  it("Test two different users staking multiple times over two seperate days", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    // one day of account one staking (2/3), account 2 staking (1/3)

    var scaleStakingRate = await scaleInstance.stakingMintRate.call({
        from: accounts[0]
    });

    let stakeScale1 = await scaleInstance.stakeScale(1, {
        from: accounts[1]
    });

    let stakeScale2 = await scaleInstance.stakeScale(1, {
        from: accounts[1]
    });

    let stakeScale3 = await scaleInstance.stakeScale(1, {
        from: accounts[2]
    });

    let timeTravelPromise1 = await timeTravel(1);

    // next day, total staking is 13. Account one staking 53.8461% (7/13), account two is staking 4 (6/13)

    let stakeScale4 = await scaleInstance.stakeScale(2, {
        from: accounts[1]
    });

    let stakeScale5 = await scaleInstance.stakeScale(3, {
        from: accounts[1]
    });

    let stakeScale6 = await scaleInstance.stakeScale(5, {
        from: accounts[2]
    });

    // wait three days 

    let timeTravelPromise2 = await timeTravel(1);
    let timeTravelPromise3 = await timeTravel(1);
    let timeTravelPromise4 = await timeTravel(1);

    currentTime = await scaleInstance.getNow.call({ from: accounts[1] });

    let stakingGainsActualUser1 = await scaleInstance.getStakingGains(
        currentTime,
        {
          from: accounts[1]
        }
    );

    let stakingGainsActualUser2 = await scaleInstance.getStakingGains(
        currentTime,
        {
          from: accounts[2]
        }
    );

    stakingGainsActualUser1 = stakingGainsActualUser1.toNumber() / Math.pow(10, 18);
    stakingGainsActualUser2 = stakingGainsActualUser2.toNumber() / Math.pow(10, 18);

    let user1ExpectedEarnings =
    (1 * scaleStakingRate * secondsInADay * (2 / 3) / Math.pow(10, 18))
    + (3 * scaleStakingRate * secondsInADay * (7 / 13) / Math.pow(10, 18))


    let user2ExpectedEarnings =
    (1 * scaleStakingRate * secondsInADay * (1 / 3) / Math.pow(10, 18))
    + (3 * scaleStakingRate * secondsInADay * (6 / 13) / Math.pow(10, 18))
    

    assert.equal(
        user1ExpectedEarnings.toFixed(5),
        stakingGainsActualUser1.toFixed(5)
    );

    assert.equal(
        user2ExpectedEarnings.toFixed(5),
        stakingGainsActualUser2.toFixed(5)
    );



  })

//   it("Testing for unstaking and unstaking", async () => {
//     let instance = await Scale.deployed();
//     let scaleInstance = instance;

//     var i;

//     for (i = 1; i <= 150; i++) {
//       console.log("--------- Days passed " + daysPassed + "----------");
//       let currentTime = await scaleInstance.getNow.call({ from: accounts[0] });

//       var d = new Date(0);

//       d.setUTCSeconds(currentTime);
//       console.log("--- Current date: " + d);

//       if (i < 99) {
//         let stakeScale = await scaleInstance.stakeScale(1, {
//           from: accounts[i]
//         });
//       } else if (i >= 99 && i < 198) {
//         let useCase = i + 1;
//         let unstakeScale = await scaleInstance.unstake({
//           from: accounts[useCase % 99]
//         });
//       } else if (i >= 198 && i < 297) {
//         let useCase = i + 2;
//         let stakeScale = await scaleInstance.stakeScale(1, {
//           from: accounts[useCase % 99]
//         });
//       } else {
//         let useCase = i + 3;
//         let unstakeScale = await scaleInstance.unstake({
//           from: accounts[useCase % 99]
//         });
//       }
//       let timeTravelPromise = await timeTravel(1);
//     }
//   });
});
