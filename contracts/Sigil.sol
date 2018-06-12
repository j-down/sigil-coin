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
 * This is an ERC20-based token with staking functionality.
 *
 *************************************************************/
//////////////////////////////////
/// OpenZeppelin library imports
//////////////////////////////////

///* Truffle format
import "./MintableToken.sol";
import "./HasNoEther.sol";

contract Sigil is MintableToken, HasNoEther {
    // Using libraries
    using SafeMath for uint;

    //////////////////////////////////////////////////
    /// State Variables for the Sigil token contract
    //////////////////////////////////////////////////

    //////////////////////
    // ERC20 token state
    //////////////////////

    /**
    These state vars are handled in the OpenZeppelin libraries;
    we display them here for the developer's information.
    ***
    // ERC20Basic - Store account balances
    mapping (address => uint256) public balances;

    // StandardToken - Owner of account approves transfer of an amount to another account
    mapping (address => mapping (address => uint256)) public allowed;

    //
    uint256 public totalSupply;
    */

    //////////////////////
    // Human token state
    //////////////////////
    string public constant name = "Sigil";
    string public constant symbol = "SGL";
    uint8 public constant  decimals = 18;

    ///////////////////////////////////////////////////////////
    // State vars for custom staking and budget functionality
    ///////////////////////////////////////////////////////////



    // Owner last minted time
    uint public ownerTimeLastMinted;
    // Owner minted tokens per second
    uint public ownerMintRate;


    /// Stake minting
    // Minted tokens per second for all stakers
    uint private globalMintRate;
    // Total tokens currently staked
    uint public totalSigilStaked;

    // Project pool
    address public pool;
    // Last time pool claimed
    uint poolTimeLastMinted;
    // Pool minted tokens per second
    uint public poolMintRate;

    // struct that will hold user stake
    struct TokenStakeData {
        uint initialStakeBalance;
        uint initialStakeTime;
        uint initialStakePercentage;
        address stakeSplitAddress;
    }

    // Track all tokens staked
    mapping (address => TokenStakeData) public stakeBalances;

    // Fire a loggable event when tokens are staked
    event Stake(address indexed staker, address indexed stakeSplitAddress, uint256 value);

    // Fire a loggable event when staked tokens are vested
    event Vest(address indexed vester, address indexed stakeSplitAddress, uint256 stakedAmount, uint256 stakingGains);

    // TESTING: Print value
    event Print(string text);


    //////////////////////////////////////////////////
    /// Begin Sigil token functionality
    //////////////////////////////////////////////////

    /// @dev Sigil token constructor
    constructor() public {
        // Define owner
        owner = msg.sender;

        // Define initial owner supply. (ether here is used only to get the decimals right)
        uint _initOwnerSupply = 1650000 ether;
        // One-time bulk mint given to owner
        bool _success = mint(msg.sender, _initOwnerSupply);
        // Abort if initial minting failed for whatever reason
        require(_success);

        ////////////////////////////////////
        // Set up state minting variables
        ////////////////////////////////////

        // Set last minted to current block.timestamp ('now')
        ownerTimeLastMinted = now;

        // Set poool mint time
        poolTimeLastMinted = now;

        // 4500 minted tokens per day, 86400 seconds in a day
        ownerMintRate = calculateFraction(4500, 86400, decimals);

        //
        poolMintRate = calculateFraction(4500, 86400, decimals);

        // 4,900,000 targeted minted tokens per year via staking; 31,536,000 seconds per year
        globalMintRate = calculateFraction(4900000, 31536000, decimals);
    }

    /// @dev staking function which allows users to stake an amount of tokens to gain interest for up to 30 days
    function stakeSigil(uint _stakeAmount) external {
        // Require that tokens are staked successfully
        require(stake(_stakeAmount));
    }

    /////////////
    // Staking
    /////////////

    /// @dev stake function reduces the user's total available balance. totalSupply is unaffected
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

        // Fire an event to tell the world of the newly staked tokens
        Stake(msg.sender, stakeBalances[msg.sender].stakeSplitAddress, _value);

        return true;
    }

    function getStakingGains(uint _now) external view returns (uint) {
        require(stakeBalances[msg.sender].initialStakeBalance > 0);
        uint _timePassedSinceStake = _now.sub(stakeBalances[msg.sender].initialStakeTime);
        return calculateStakeGains(_timePassedSinceStake);
    }

    function getCurrentTime() view returns (uint) {
        return now;
    }

    function getInitialStakingTime() view returns (uint) {
        return stakeBalances[msg.sender].initialStakeTime;
    }

    /// @dev allows users to reclaim any staked tokens
    /// @return bool on success
    function unstake() external returns (bool) {

        Print("Begin unstaking");

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
        Vest(msg.sender, stakeBalances[msg.sender].stakeSplitAddress, stakeBalances[msg.sender].initialStakeBalance, _tokensToMint);

        // Clear out stored data from mapping
        stakeBalances[msg.sender].initialStakeBalance = 0;
        stakeBalances[msg.sender].initialStakeTime = 0;
        stakeBalances[msg.sender].initialStakePercentage = 0;
        stakeBalances[msg.sender].stakeSplitAddress = 0;

        return true;
    }

    /// @dev Helper function to claimStake that modularizes the minting via staking calculation
    function calculateStakeGains(uint _timePassedSinceStake) view private returns (uint mintTotal) {
        // Store seconds in a day (need it in variable to use SafeMath)
  //uint _secondsPerDay = 86400;
        uint _finalStakePercentage;     // store our stake percentage at the time of stake claim
        uint _stakePercentageAverage;   // store our calculated average minting rate ((initial+final) / 2)
        uint _finalMintRate;            // store our calculated final mint rate (in Sigil-per-second)
        uint _tokensToMint = 0;         // store number of new tokens to be minted

        // Determine the amount to be newly minted upon vesting, if any
        // if (_timePassedSinceStake > _secondsPerDay) {

            /// We've passed the minimum staking time; calculate minting rate average ((initialRate + finalRate) / 2)

            // First, calculate our final stake percentage based upon the total amount of Sigil staked
            _finalStakePercentage = calculateFraction(stakeBalances[msg.sender].initialStakeBalance, totalSigilStaked, decimals);

            // Second, calculate average of initial and final stake percentage
            _stakePercentageAverage = calculateFraction((stakeBalances[msg.sender].initialStakePercentage.add(_finalStakePercentage)), 2, 0);

            // Finally, calculate our final mint rate (in Sigil-per-second)
            _finalMintRate = globalMintRate.mul(_stakePercentageAverage);
            _finalMintRate = _finalMintRate.div(1 ether);


                // Tokens were staked for a mintable amount of time, but less than the 30-day max
                _tokensToMint = calculateMintTotal(_timePassedSinceStake, _finalMintRate);
        // }

        // Return the amount of new tokens to be minted
        return _tokensToMint;

    }

    function totalStaked() view public returns (uint ){
        return totalSigilStaked;
    }

    /// @dev Allows user to check their staked balance
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

    modifier onlyPool() {

      require(msg.sender == pool);
      _;
    }

    // @dev allows distribution of Sigil to most upvoted causes, which is handled by a seperate contract
    function poolClaim() external onlyPool {
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
