pragma solidity ^0.4.18;

/**************************************************************
 * @title Sigil Token Contract
 * @file Sigil.sol
 * @author Jared Downing, Kane Thomas, Sigil LLC
 * @version 1.0
 *
 * @section LICENSE
 *
 * Contact for licensing details. All rights reserved.
 *
 * @section DESCRIPTION
 *
 * This is an ERC20-based token with staking and pooling functionality.
 *
 *************************************************************/
//////////////////////////////////
/// OpenZeppelin library imports
//////////////////////////////////

//Imports
/* import "./MintableToken.sol";
import "http://github.com/OpenZeppelin/zeppelin-solidity/contracts/ownership/HasNoEther.sol"; */

import 'openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';

contract Sigil is MintableToken, HasNoEther {
    // Using libraries
    using SafeMath for uint;

    //////////////////////////////////////////////////
    /// State Variables for the Sigil token contract
    //////////////////////////////////////////////////

    //////////////////////
    // Human token state
    //////////////////////
    string public constant name = "Sigil";
    string public constant symbol = "SGL";
    uint8 public constant  decimals = 18;

    ///////////////////////////////////////////////////////////
    // State variables for custom staking and pooling
    ///////////////////////////////////////////////////////////

    // Pool for coin distribution to Sigil products
    address public pool;
    // Pool last minted time
    uint poolTimeLastMinted;
    // Pool minted tokens per second
    uint public poolMintRate;

    // Owner last minted time
    uint public ownerTimeLastMinted;
    // Owner minted tokens per second
    uint public ownerMintRate;

    /// Stake minting
    // Minted tokens per second for all stakers
    uint public globalMintRate;
    // Total tokens currently staked
    uint public totalSigilStaked;

    // Maps the timestamp of staking to a total amount staking during that time
    mapping (uint => uint) totalStakingHistory;

    // Variable for staking accumulation accuracy. Set to 1 for seconds. 60 for minutes. 1440 for days.
    uint timingVariable = 60;

    // 70% to pool
    uint256 poolMintAmount;
    // 25% to staking
    uint256 globalMintAmount;
    // %5 to owner
    uint256 ownerMintAmount;

    // Percentage values for distribution
    uint poolPercentage = 70;
    uint ownerPercentage = 5;
    uint globalPercentage = 25;

    // Inflation
    // Inflation rate begins at %100 per year and decreases afterwards
    uint256 inflationRate = 1000;
    // Used to manage when to inflate
    uint256 public lastInflationUpdate;
    // Used to calculate how much to inflate by
    uint256 public lastYearTotalSupply;


    // Struct that will hold user staking information
    struct TokenStakeData {
        uint initialStakeBalance;
        uint initialStakeTime;
        uint initialStakePercentage;
    }

    // Track all tokens staked
    mapping (address => TokenStakeData) public stakeBalances;

    // Fire a loggable event when tokens are staked
    event Stake(address indexed staker, uint256 value);

    // Fire a loggable event when staked tokens are vested
    event Vest(address indexed vester, uint256 stakedAmount, uint256 stakingGains);

    //////////////////////////////////////////////////
    /// Begin Sigil token functionality
    //////////////////////////////////////////////////

    /// @dev Sigil token constructor
    constructor() public {
        // Define owner
        owner = msg.sender;

        // Define initial owner supply. (ether here is used only to get the decimals right)
        uint _initOwnerSupply = 8000000 ether;
        // One-time bulk mint given to owner
        bool _success = mint(msg.sender, _initOwnerSupply);
        // Abort if initial minting failed for whatever reason
        require(_success);

        ////////////////////////////////////
        // Set up state minting variables
        ////////////////////////////////////

        // Set pool and owner last minted to current block.timestamp ('now')
        ownerTimeLastMinted = now;

        poolTimeLastMinted = now;

        // Set minting rate for pool, staking, and owner over the course of 1 year
        poolMintAmount = _initOwnerSupply.mul(poolPercentage).div(100);
        ownerMintAmount = _initOwnerSupply.mul(ownerPercentage).div(100);
        globalMintAmount = _initOwnerSupply.mul(globalPercentage).div(100);

        poolMintRate = calculateFraction(poolMintAmount, 31536000 ether, decimals);
        ownerMintRate = calculateFraction(ownerMintAmount, 31536000 ether, decimals);
        globalMintRate = calculateFraction(globalMintAmount, 31536000 ether, decimals);

        lastInflationUpdate = now;
    }

    /////////////
    // Inflation
    /////////////

    //@dev the inflation rate begins at 100% and decreases by 15% every year until it reaches 10%.
    //    at 10% the rate begins to decrease by %5 until it reaches 1%.
    function adjustInflationRate() internal {

      lastYearTotalSupply = totalSupply();

      lastInflationUpdate = now;

      //Decrease inflation rate by %15 each year
      if (inflationRate > 100) {

        inflationRate = inflationRate.sub(150);
      }
      //Inflation rate reaches %10. Decrease inflation rate by 0.05 from here on out until it reaches %1.
      else {

          inflationRate = inflationRate.sub(5);
      }

      //Calculate new amount rate
      poolMintAmount = lastYearTotalSupply.mul(inflationRate).div(1000).mul(poolPercentage).div(100);
      ownerMintAmount = lastYearTotalSupply.mul(inflationRate).div(1000).mul(ownerPercentage).div(100);
      globalMintAmount = lastYearTotalSupply.mul(inflationRate).div(1000).mul(globalPercentage).div(100);

      //Adjust inflation rates
      poolMintRate = calculateFraction(poolMintAmount, 31536000 ether, decimals);
      ownerMintRate = calculateFraction(ownerMintAmount, 31536000 ether, decimals);
      globalMintRate = calculateFraction(globalMintAmount, 31536000 ether, decimals);
    }

    //@dev anyone can call this function to update the inflation rate yearly
    function updateInflationRate() public {

      // Require one year to have passed for every inflation adjustment
      require(SafeMath.sub(now, lastInflationUpdate) > 1 years);

      // Stop inflation rate changes at %1
      require(inflationRate > 10);

      adjustInflationRate();

    }

    /////////////
    // Staking
    /////////////

    /// @dev staking function which allows users to stake an amount of tokens to gain interest for up to 30 days
    function stakeSigil(uint _stakeAmount) external {
        // Require that tokens are staked successfully
        require(stake(_stakeAmount));
    }

    /// @dev stake function reduces the user's total available balance and adds it to their staking balance
    /// @param _value determines how many tokens a user wants to stake
    function stake(uint256 _value) private returns (bool success) {
        /// Sanity Checks:
        // You can only stake as many tokens as you have
        require(_value <= balances[msg.sender]);
        // You can only stake tokens if you have not already staked tokens
        require(stakeBalances[msg.sender].initialStakeBalance == 0);

        // Subtract stake amount from regular token balance
        balances[msg.sender] = balances[msg.sender].sub(_value);

        // Add stake amount to staked balance
        stakeBalances[msg.sender].initialStakeBalance = _value;

        // Increment the global staked tokens value
        totalSigilStaked += _value;

        /// Determine percentage of global stake
        stakeBalances[msg.sender].initialStakePercentage = calculateFraction(_value, totalSigilStaked, decimals);

        // Save the time that the stake started
        stakeBalances[msg.sender].initialStakeTime = now;

        //Set the new staking history
        setTotalStakingHistory();

        // Fire an event to tell the world of the newly staked tokens
        emit Stake(msg.sender, _value);

        return true;
    }

    // @dev returns how much Sigil a user has earned so far
    // @param _now is passed in to allow for a gas-free analysis
    // @return staking gains based on the amount of time passed since staking began
    function getStakingGains(uint _now) public returns (uint) {
        require(stakeBalances[msg.sender].initialStakeBalance > 0);
        uint _timePassedSinceStake = _now.div(60).sub(stakeBalances[msg.sender].initialStakeTime.div(60));
        return calculateStakeGains(_timePassedSinceStake);
    }

    /// @dev allows users to reclaim any staked tokens
    /// @return bool on success
    function unstake() external returns (bool) {

        /// Sanity checks:
        // require that there was some amount vested
        require(stakeBalances[msg.sender].initialStakeBalance > 0);
        // require that time has elapsed
        require(now >= stakeBalances[msg.sender].initialStakeTime);

        // Calculate the time elapsed since the tokens were originally staked
        uint _timePassedSinceStake = now.sub(stakeBalances[msg.sender].initialStakeTime);

        // Calculate tokens to mint
        uint _tokensToMint = calculateStakeGains(_timePassedSinceStake);

        // Add the original stake back to the user's balance
        balances[msg.sender] += stakeBalances[msg.sender].initialStakeBalance;

        // Subtract stake balance from totalSigilStaked
        totalSigilStaked -= stakeBalances[msg.sender].initialStakeBalance;

        mint(msg.sender, _tokensToMint);

        // Fire an event to tell the world of the newly vested tokens
        emit Vest(msg.sender, stakeBalances[msg.sender].initialStakeBalance, _tokensToMint);

        // Clear out stored data from mapping
        stakeBalances[msg.sender].initialStakeBalance = 0;
        stakeBalances[msg.sender].initialStakeTime = 0;
        stakeBalances[msg.sender].initialStakePercentage = 0;

        //Set the new staking history
        setTotalStakingHistory();

        return true;
    }

    /* DEPRICATED AF


    /// @dev Helper function to claimStake that modularizes the minting via staking calculation
    function calculateStakeGains(uint _timePassedSinceStake) view private returns (uint mintTotal) {

        uint _secondsIn30Days = 2592000; // Store seconds in a 30 days
        uint _finalStakePercentage;     // store our stake percentage at the time of stake claim
        uint _stakePercentageAverage;   // store our calculated average minting rate ((initial+final) / 2)
        uint _finalMintRate;            // store our calculated final mint rate (in Sigil-per-second)
        uint _tokensToMint = 0;         // store number of new tokens to be minted

        // Determine the amount to be newly minted upon vesting, if any
        // First, calculate our final stake percentage based upon the total amount of Sigil staked
        _finalStakePercentage = calculateFraction(stakeBalances[msg.sender].initialStakeBalance, totalSigilStaked, decimals);

        // Second, calculate average of initial and final stake percentage
        _stakePercentageAverage = calculateFraction((stakeBalances[msg.sender].initialStakePercentage.add(_finalStakePercentage)), 2, 0);

        // Finally, calculate our final mint rate (in Sigil-per-second)
        _finalMintRate = globalMintRate.mul(_stakePercentageAverage);
        _finalMintRate = _finalMintRate.div(1 ether);

        //Limit Sigil minted to a maximum of 30 days worth
        if (_timePassedSinceStake > _secondsIn30Days) {
            // Tokens were staked for the maximum amount of time (30 days)
            _tokensToMint = calculateMintTotal(_secondsIn30Days, _finalMintRate);
        } else {
            // Tokens were staked for a mintable amount of time, but less than the 30-day max
            _tokensToMint = calculateMintTotal(_timePassedSinceStake, _finalMintRate);
        }

        // Return the amount of new tokens to be minted
        return _tokensToMint;

    } */


    // @dev Helper function to claimStake that modularizes the minting via staking calculation
    function calculateStakeGains(uint _timePassedSinceStake) private returns (uint mintTotal)  {

      // StakeTimeInVariable: TESTING (60 for minutes)

      uint _nowAsTimingVariable = now.div(timingVariable);    // Today as a unique value in unix time
      uint _initialStakeTimeInVariable = stakeBalances[msg.sender].initialStakeTime.div(timingVariable); // When the user started staking as a unique day in unix time

      uint _timePassedSinceStakeInVariable = _nowAsTimingVariable.sub(_initialStakeTimeInVariable); // How much time has passed, in days, since the user started staking.
      uint _stakePercentages = 0; // Keeps an additive track of the user's staking percentages over time
      uint _tokensToMint = 0; // How many new Sigil tokens to create
      uint _lastUsedVariable;  // Last day the totalSigilStaked was updated

      // Average this msg.sender's relative percentage ownership of totalSigilStaked throughout each day since they started staking
      for (uint i = _initialStakeTimeInVariable; i < _nowAsTimingVariable; i++) {

        // If the day does not exist in the totalSigilStaked mapping, use the last day found before that.
        // If the day does exist add it and set it as the last day tracked
        if (totalStakingHistory[i] == 0) {

          _stakePercentages = _stakePercentages.add(calculateFraction(stakeBalances[msg.sender].initialStakeBalance, _lastUsedVariable, decimals));
        }
        else {

          _stakePercentages = _stakePercentages.add(calculateFraction(stakeBalances[msg.sender].initialStakeBalance, totalStakingHistory[i], decimals));

          _lastUsedVariable = totalStakingHistory[i];
        }
      }

      uint _stakePercentageAverage = calculateFraction(_stakePercentages, _timePassedSinceStakeInVariable, 0);

      uint _finalMintRate = globalMintRate.mul(_stakePercentageAverage);

      _finalMintRate = _finalMintRate.div(1 ether);

      //Calculate total tokens to be minted. Multiply by 1440 to convert to seconds.
      _tokensToMint = calculateMintTotal(_timePassedSinceStakeInVariable.mul(1440), _finalMintRate);

      return  _tokensToMint;
    }

    function setTotalStakingHistory() public {

      //TESTING: CHANGE BACK TO DAYS RATHER THAN SECONDS
      uint _nowAsTimingVariable = now.div(timingVariable);

      totalStakingHistory[_nowAsTimingVariable] = totalSigilStaked;

    }

    /// @dev Allows user to check their staked balance
    /// @return staked balance
    function getStakedBalance() view external returns (uint stakedBalance) {
        return stakeBalances[msg.sender].initialStakeBalance;
    }

    /////////////
    // Sigil Owner Claiming
    /////////////

    /// @dev allows contract owner to claim their mint
    function ownerClaim() external onlyOwner {
        // Sanity check: ensure that we didn't travel back in time
        require(now > ownerTimeLastMinted);

        uint _timePassedSinceLastMint;
        uint _tokenMintCount;
        bool _mintingSuccess;

        // Calculate the number of seconds that have passed since the owner last took a claim
        _timePassedSinceLastMint = now.sub(ownerTimeLastMinted);

        // Sanity check: ensure that some time has passed since the owner last claimed
        assert(_timePassedSinceLastMint > 0);

        // Determine the token mint amount, determined from the number of seconds passed and the ownerMintRate
        _tokenMintCount = calculateMintTotal(_timePassedSinceLastMint, ownerMintRate);

        // Mint the owner's tokens; this also increases totalSupply
        _mintingSuccess = mint(msg.sender, _tokenMintCount);

        // Sanity check: ensure that the minting was successful
        require(_mintingSuccess);

        // New minting was a success! Set last time minted to current block.timestamp (now)
        ownerTimeLastMinted = now;
    }


    ////////////////////////////////
    // Sigil Pool distribution
    ////////////////////////////////

    // @dev anyone can call this function. it mints Sigil to the pool dedicated to Sigil distribution to projects
    function poolIssue() public {
        // Sanity check: ensure that we didn't travel back in time
        require(now > poolTimeLastMinted);

        uint _timePassedSinceLastMint;
        uint _tokenMintCount;
        bool _mintingSuccess;

        // Calculate the number of seconds that have passed since the owner last took a claim
        _timePassedSinceLastMint = now.sub(poolTimeLastMinted);

        // Sanity check: ensure that some time has passed since the owner last claimed
        assert(_timePassedSinceLastMint > 0);

        // Determine the token mint amount, determined from the number of seconds passed and the ownerMintRate
        _tokenMintCount = calculateMintTotal(_timePassedSinceLastMint, poolMintRate);

        // Mint the owner's tokens; this also increases totalSupply
        _mintingSuccess = mint(pool, _tokenMintCount);

        // Sanity check: ensure that the minting was successful
        require(_mintingSuccess);

        // New minting was a success! Set last time minted to current block.timestamp (now)
        poolTimeLastMinted = now;
    }

    // @dev sets the address for the pooling
    // @param new pool Address
    function setPool(address _newAddress) public onlyOwner {

        pool = _newAddress;
    }


    /// @dev calculateFraction allows us to better handle the Solidity ugliness of not having decimals as a native type
    /// @param _numerator is the top part of the fraction we are calculating
    /// @param _denominator is the bottom part of the fraction we are calculating
    /// @param _precision tells the function how many significant digits to calculate out to
    /// @return quotient returns the result of our fraction calculation
    function calculateFraction(uint _numerator, uint _denominator, uint _precision) pure private returns(uint quotient) {
        // Take passed value and expand it to the required precision
        _numerator = _numerator.mul(10 ** (_precision + 1));
        // handle last-digit rounding
        uint _quotient = ((_numerator.div(_denominator)) + 5) / 10;
        return (_quotient);
    }

    /// @dev Determines mint total based upon how many seconds have passed
    /// @param _timeInSeconds takes the time that has elapsed since the last minting
    /// @return uint with the calculated number of new tokens to mint
    function calculateMintTotal(uint _timeInSeconds, uint _mintRate) pure private returns(uint mintAmount) {
        // Calculates the amount of tokens to mint based upon the number of seconds passed
        return(_timeInSeconds.mul(_mintRate));
    }

}
