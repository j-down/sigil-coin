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

  it("Test stakeFor user who is already staking", async () => {
    let instance = await Scale.deployed();
    let scaleInstance = instance;

    var scaleStakingRate = await scaleInstance.stakingMintRate.call({
        from: accounts[0]
    });

    let stakeScale1 = await scaleInstance.stakeFor(accounts[1], 1, {
        from: accounts[0]
    });

    let timeTravelPromise1 = await timeTravel(1);

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
          from: accounts[0]
        }
    );

    stakingGainsActualUser1 = stakingGainsActualUser1.toNumber() / Math.pow(10, 18);
    stakingGainsActualUser2 = stakingGainsActualUser2.toNumber() / Math.pow(10, 18);

    let user1ExpectedEarnings =
    (daysPassed * scaleStakingRate * secondsInADay / Math.pow(10, 18))

    assert.equal(
        user1ExpectedEarnings.toFixed(5),
        stakingGainsActualUser1.toFixed(5)
    );

    assert.equal(
        0,
        stakingGainsActualUser2.toFixed(5)
    );
  })
});
