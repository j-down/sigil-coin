import React, {Component} from 'react'
import SigilContract from '../build/contracts/Sigil.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import sigillogo from './assets/logo_rounded.png';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      sigilBalance: null,
      sigilStakeBalance: null,
      sigilInstance: null,
      stakeGains: 0
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance. See utils/getWeb3 for more info.

    getWeb3.then(results => {
      console.log(results.web3, "web3")

      this.setState({web3: results.web3})

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    }).catch(() => {
      console.log('Error finding web3.')
      this.setState({web3: false})
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const sigil = contract(SigilContract)
    sigil.setProvider(this.state.web3.currentProvider)

    // Declaring the default "from" address to avoid error invalid address error
    sigil.defaults({from: this.state.web3.eth.coinbase});
    // Declaring this for later so we can chain functions on sigil.
    var sigilInstance

    // Get accounts.
    this
      .state
      .web3
      .eth
      .getAccounts((error, accounts) => {
        sigil
          .deployed()
          .then((instance) => {
            sigilInstance = instance
            console.log(sigilInstance, 'sigilInstance instanciation')
            if (error) {
              console.log(error, 'error');
            } else {
              this.setState({ sigilInstance }, this.getTotalSigilStaked);
              console.log(accounts, "accounts")
              let account = accounts[0];
              sigilInstance
                .balanceOf(account)
                .then(result => {
                  
                  console.log(result, 'result')
                  let balance = result.c[0] / 10000;
                  this.setState({sigilBalance: balance});
                }).catch(error => {
                  console.log(error, 'error')
                })
                sigilInstance
                .getStakedBalance()
                .then((result) => {
                  console.log(result, 'staking balance')
                  let balance = result.c[0] / 10000;
                  this.setState({sigilStakeBalance: balance});
                  if (balance > 0) {
                    setInterval(() => {
                      console.log('set timeout')
                      this.calculateStakingGains();
                    }, 250)
                  }
                })
            }

            // Stores a given value, 5 by default. return sigilInstance.set(5,
            // {from: accounts[0]})
          })
          .then((result) => {
            // Get the value from the contract to prove it worked. return
            // sigilInstance   .get   .call(accounts[0])
          })
          .then((result) => {
            // Update state with the result. return this.setState({storageValue:
            // result.c[0]})
          })
      })
  }

  startStaking = () => {
    console.log(this.state.sigilInstance, "start staking sigil instance")
    console.log("start staking", this.state.amountForStaking)
    let amount = this.state.amountForStaking * Math.pow(10,18);
    if (!isNaN(amount) && amount > 0) {
      this.state.sigilInstance.stakeSigil(amount)
      .then((result) => {
        console.log(result, 'newly staked return value')
        // let balance = result.c[0];
        // this.setState({sigilStakeBalance: balance});
      })
      .catch(error => {
        console.log(error, "error")
      })

    } else {
      console.log('stake amount NaN')
    }
    
  }

  claimStake = () => {
    console.log("claim stake")
    this.state.sigilInstance.unstake()
      .then((result) => {
        console.log(result, 'newly staked return value')
        this.setState({sigilStakeBalance: 0 });
      })
      .catch(error => {
        console.log("mistake------")
        console.log(error, "error")
      })
  }

  calculateStakingGains = () => {
    let unixTime = Math.floor(new Date() / 1000)
    console.log(unixTime, 'unix time')
    this.state.sigilInstance.getStakingGains(unixTime)
    .then((result) => {
      console.log(result, 'amount of sigil earned')
      let stakeGains = result.c[0] / 10000;
      this.setState({stakeGains});
    })
    .catch(error => {
      console.log(error, "error")
    })
  }

  getTotalSigilStaked = () => {
    // this.state.sigilInstance.getInitialStakingTime()
    // .then((result) => {
    //   console.log(result, 'initial staking time')
    //   let stakeGains = result.c[0];
    //   this.setState({stakeGains});
    // })
    // .catch(error => {
    //   console.log(error, "error")
    // })

    this.state.sigilInstance.getCurrentTime()
    .then((result) => {
      console.log(result, 'current time')
      let stakeGains = result.c[0];
      this.setState({stakeGains});
    })
    .catch(error => {
      console.log(error, "error")
    })
  }

  handleStakeAmount = (event) => {
    // convert amount to a number
    let amount = parseInt(event.target.value);
    this.setState({ amountForStaking: amount })
  }

  render() {
    if (this.state.web3) {
      if (this.state.sigilStakeBalance != 0) {
        return (
          <div className="background">
            <div className="logoContainer">
              <img className="logoImage" src={sigillogo}/>
            </div>
            <div onClick={this.calculateStakingGains} className="startStakingButton">
              <p className="buttonText">Claim Stake</p>
            </div>
            <h1 className="headerText">Stake Your Sigil</h1>
            <h1 className="headerText">{"Sigil balance:" + this.state.sigilBalance}
            </h1>
            <h1 className="headerText">{"Amount staked:" + this.state.sigilStakeBalance}
            </h1>
            <h1 className="headerText">{"Sigil Earned:" + this.state.stakeGains}
            </h1>
          </div>
        );
      }
      return (
        <div className="background">
          <div className="logoContainer">
            <img className="logoImage" src={sigillogo}/>
          </div>
          <h1 className="headerText">Stake Your Sigil</h1>
            <input onChange={this.handleStakeAmount} type="text" name="Amount To stake" placeholder="0" className="formInputStyle"/>
            <button onClick={this.startStaking} className="submitButton">Start Stake</button>
          <h1 className="headerText">{"Sigil balance:" + this.state.sigilBalance}
          </h1>
          <h1 className="headerText">{"Amount staked:" + this.state.sigilStakeBalance}
          </h1>
        </div>
      );
    } else if (this.state.web3 == null) {
      return (
        <div>
          <h1>Loading</h1>
        </div>
      )
    } 
    return (
      <div className="background">
        <div className="logoContainer">
          <img className="logoImage" src={sigillogo}/>
        </div>
        <h1 className="headerText">Please Download Metamask</h1>
      </div>
    )
  }
}

export default App
