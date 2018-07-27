// var getWeb3 = require('../src/utils/getWeb3'); const jsonrpc = '2.0' const id
// = 0 let web3; let send; let timeTravel; getWeb3.then(results => {
// console.log(results.web3, "web3")     web3 = results.web3;     send =
// (method, params = []) => web3         .currentProvider         .send({id,
// jsonrpc, method, params})     timeTravel = async seconds => {         await
// send('evm_increaseTime', [seconds])         await send('evm_mine')     } })
// module.exports = timeTravel;