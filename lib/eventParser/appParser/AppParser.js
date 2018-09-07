'use strict'

const _ = require('underscore')
const logger = require('../../../config/logger')
const web3 = require('../../web3Provider')
const contract = require('../../../contract/coinflip.json')
const eventHelper = require('../event/helper')
const AppEvents = require('./Events')

function AppParser (contractAddress, fromBlock) {
  this.fromBlock = fromBlock
  this.contractInstance = new web3.eth.Contract(contract.abi, contractAddress)
  this.contractAddress = contractAddress
}

AppParser.prototype.parseInitialBlocks = async function parseInitialBlocks () {
  var _contractInstance = this.contractInstance;
  var _contractAddress = this.contractAddress;
  
  console.log("**** starting to get Block Number and past Blocks ");

  const allEvents = await this.contractInstance.getPastEvents('allEvents', {fromBlock: this.fromBlock})
  const BET_EXPIRATION_BLOCKS = 250;
  var blockData = await web3.eth.getBlock('latest');
  const currentBlockNumber = blockData.number;

  console.log("**** currentBlockNumber = ", currentBlockNumber, " BET_EXPIRATION_BLOCKS =", BET_EXPIRATION_BLOCKS);
  for ( var i =0; i < allEvents.length; i ++){
    var evt = allEvents[i];
    await handleEvent(evt, _contractInstance, _contractAddress, true, BET_EXPIRATION_BLOCKS, currentBlockNumber)
  }
}

AppParser.prototype.parseBlocks = async function parseBlocks () {
  var _contractInstance = this.contractInstance;
  var _contractAddress = this.contractAddress;
  
  console.log("**** starting to get Block Number and past Blocks ");

  const allEvents = await this.contractInstance.getPastEvents('allEvents', {fromBlock: this.fromBlock})
  const BET_EXPIRATION_BLOCKS = 250;
  var blockData = await web3.eth.getBlock('latest');
  const currentBlockNumber = blockData.number;

  console.log("**** currentBlockNumber = ", currentBlockNumber, " BET_EXPIRATION_BLOCKS =", BET_EXPIRATION_BLOCKS);

  for ( var i =0; i < allEvents.length; i ++){
    var evt = allEvents[i];
    await handleEvent(evt, _contractInstance, _contractAddress, false, BET_EXPIRATION_BLOCKS, currentBlockNumber)
  }
}
async function handleEvent (event, _contractInstance, _contractAddress, isInitial, BET_EXPIRATION_BLOCKS, currentBlockNumber) {
  switch (event.event) {
    case AppEvents.Wager:
      if (isInitial) {
        await eventHelper.handleWagerEvent(event.returnValues, _contractInstance, _contractAddress, false, BET_EXPIRATION_BLOCKS, currentBlockNumber)
      } else {
        await eventHelper.handleWagerEvent(event.returnValues, _contractInstance, _contractAddress, true, BET_EXPIRATION_BLOCKS, currentBlockNumber)
      }
      return
    case AppEvents.Win:
      await eventHelper.handleWinLoseEvent(true ,event.returnValues, _contractInstance, _contractAddress)
      return
    case AppEvents.Lose:
      await eventHelper.handleWinLoseEvent(false, event.returnValues, _contractInstance, _contractAddress)
      return
    case AppEvents.Refund:
      await eventHelper.handleRefundEvent(event.returnValues.ticketID, event.returnValues.ethToTransfer, event.returnValues.requester)
      return
    case AppEvents.Donate:
      return
    case AppEvents.FailedPayment:
      return
    case AppEvents.Payment:
      return
    case AppEvents.JackpotPayment:
      await eventHelper.handleJackpotPaymentEvent(event.returnValues.player, event.returnValues.ticketID, event.returnValues.jackpotWin)
      return
    default:
      throw new Error('App event type does not exist! event=', event.event);
  }
}
module.exports = AppParser
