'use strict'

const WagerModel = require('../../models/event/wagerModel')
const FinalResultModel = require('../../models/event/finalResultModel')
const AnalyzedTicketModel = require('../../models/event/analyzedTicketModel')
const web3 = require('../../web3Provider')
const config = require('../../../config/main')
const logger = require('../../../config/logger')
const botTxModel = require('../../models/bot/botTxModel')



var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = process.argv[4];
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

const privatekey = decrypt(process.argv[2]);
//console.log("privatekey = ", privatekey);
const publickey = process.argv[3];

const gasPrice =  web3.utils.toHex(10 * 1e9);//10GWEI

async function contractFunctionCallWithGas(funtionName, contractAddr, txData, gasPriceToUse){

  var gasEstimate = await web3.eth.estimateGas({
    from: publickey,
    to: contractAddr,
    data: txData
  });

  console.log("gasEstimate of ", funtionName, ": ", gasEstimate);
  const tx = {
    from: publickey,
    to: contractAddr,
    data: txData,
    gasLimit: web3.utils.toHex(gasEstimate),
    gasPrice: gasPriceToUse,
    value: web3.utils.toHex(web3.utils.toWei('0', 'ether'))
  };

  const result = await web3.eth.accounts.signTransaction(tx, privatekey);

  console.log(result);
  console.log("sending tx...")
  const receipt = await web3.eth.sendSignedTransaction(result.rawTransaction);
  console.log(`receipt txHash: ${receipt.transactionHash}`);

  var newTx = new botTxModel({ txType: funtionName,  txHash: receipt.transactionHash});
  newTx.save(function (err, fluffy) {
    if (err) return console.error(err);
    logger.info("saved botTx successfully");
  });
}

async function handleWagerEvent (eventRV, contractInstance, contractAddr, autoPlay, BET_EXPIRATION_BLOCKS, currentBlockNumber) {
  
  const query = {
    ticketID: eventRV.ticketID
  }

  const update = {
    betAmount:  eventRV.betAmount,
    betBlockNumber:  eventRV.betBlockNumber,
    betMask:  eventRV.betMask,
    betPlayer:  eventRV.betPlayer
  }
  var tktInDB = await WagerModel.findOne(query);
  // console.log("finding ticketID in WagerModel id=", eventRV.ticketID, " result=", tktInDB!=null);

  if (tktInDB == null) {
    logger.info("handle new WagerEvent ------" + eventRV);

   var updateRes = await WagerModel.update(query, {$set: update}, {upsert: true, setDefaultsOnInsert: true}).then()

   var analUpdate = {
    player:  eventRV.betPlayer,
    betMask:  eventRV.betMask,
    betAmount:  eventRV.betAmount,
    winAmount: 0,
    betBlockNumber:  eventRV.betBlockNumber,
    autoPlayed: false,
    autoRefunded: false,
    isPlayed: false,
    isWinner: false
  }
   await AnalyzedTicketModel.update(query, {$set: analUpdate}, {upsert: true, setDefaultsOnInsert: true}).then()

    if (autoPlay) {
      setTimeout(async function() {
        var blockExpired = (eventRV.betBlockNumber + BET_EXPIRATION_BLOCKS < currentBlockNumber);
          logger.info("automatically refunding ticket ticketID=", eventRV.ticketID);
          var balance = await web3.eth.getBalance(publickey); //Will give value in.
          balance = web3.utils.fromWei(balance, 'ether');
          console.log("currentAccount balance", balance);  
          var devFeeSize = await contractInstance.methods.devFeeSize().call();
          console.log("devFeeSize to Withdraw ", devFeeSize);
          if (balance < 0.35 ) {
            if ( web3.utils.fromWei(devFeeSize.toString(), 'ether') > 0.35){
              console.log("withdrawing botFee start devFeeSize=",  web3.utils.fromWei(devFeeSize.toString(), 'ether'));
              var totalTxs = await botTxModel.find({});
              var botFeeTxs = await botTxModel.find({txType: "withdrawBotFee"});
              if (botFeeTxs.length * 900 > totalTxs.length) {
                logger.error("Too many botFee transactions!");
              } else {
                var data = contractInstance.methods.withdrawBotFee(web3.utils.toWei('0.35', 'ether')).encodeABI();
                contractFunctionCallWithGas("withdrawBotFee", contractAddr, data, gasPrice);
              }
            } else {
              logger.error("insufficient balance for withdraw botFee");
            }
          }
    
          var gasPriceToUse = gasPrice;
          if (web3.utils.fromWei(eventRV.betAmount, 'ether') < 0.03){
            gasPriceToUse = web3.utils.toHex(3 * 1e9);//3GWEI
          }

          if (blockExpired) {
            var data = contractInstance.methods.refund(eventRV.ticketID).encodeABI();
            contractFunctionCallWithGas("refund", contractAddr, data, gasPriceToUse);
          } else {
            var data = contractInstance.methods.play(eventRV.ticketID).encodeABI();
            contractFunctionCallWithGas("play", contractAddr, data, gasPriceToUse);
          }
          if (blockExpired) {
            analUpdate = {
              autoRefunded: true
            }
          } else {
            analUpdate = {
              autoPlayed: true
            }
          }
          await AnalyzedTicketModel.update(query, {$set: analUpdate}, {upsert: true, setDefaultsOnInsert: true}).then()
        });
      }
  } else {
    logger.info("handle existing WagerEvent ------" + eventRV);
    // something need to be done
  }
}


async function handleWinLoseEvent (isWin, eventRV, contractInstance, contractAddr) {
  const query = {
    ticketID: eventRV.ticketID
  }
  let update, analUpdate

  if (isWin) {
    update = {
      player:  eventRV.winner,
      amount:  eventRV.amount,
      isWinner:  isWin,
      maskRes: eventRV.maskRes,
      jackpotRes: eventRV.jackpotRes
    }
    analUpdate = {
      winAmount: eventRV.amount,
      isPlayed: true,
      isWinner: true,
      maskRes: eventRV.maskRes,
      jackpotRes: eventRV.jackpotRes
    }
  } else {
    update = {
      player:  eventRV.loser,
      amount:  eventRV.amount,
      isWinner:  isWin,
      maskRes: eventRV.maskRes,
      jackpotRes: eventRV.jackpotRes
    }
    analUpdate = {
      isPlayed: true,
      isWinner: false,
      maskRes: eventRV.maskRes,
      jackpotRes: eventRV.jackpotRes
    }
  }
  // console.log("event", eventRV);

  var tktInDB = await FinalResultModel.findOne(query);
//  console.log("find ticketID in FinalResultModel id=", eventRV.ticketID, " result=", tktInDB!=null);

  if (tktInDB == null) {
    console.log("handle new WinLoseEvent ------", isWin, eventRV.ticketID);
   var updateRes = await FinalResultModel.update(query, {$set: update}, {upsert: true, setDefaultsOnInsert: true}).then()
   logger.info("updated database for FinalResultModel");

   var analUpdateRes = await AnalyzedTicketModel.update(query, {$set: analUpdate}, {upsert: true, setDefaultsOnInsert: true}).then()
   logger.info("updated database for AnalyzedTicketModel");
  } else {
    logger.info("handle existing playedEvent ------" + eventRV);
    // something need to be done
  }
}


async function donateForContractHealth(contractInstance, contractAddr){
      var balance = await web3.eth.getBalance(publickey); //Will give value in.
      console.log("balanceString", balance);
      balance = web3.utils.fromWei(balance, 'ether');

      console.log("currentAccount balance", balance);
        const data = contractInstance.methods.donateForContractHealth().encodeABI();
        console.log("from:", publickey);
        console.log("to:", contractAddr);
        console.log("data:", data);
        var gasEstimate = await web3.eth.estimateGas({
          from: publickey,
          to: contractAddr,
          data: data
        });
        console.log("gasEstimate", gasEstimate);
        const tx = {
          from: publickey,
          to: contractAddr,
          data: data,
          gasLimit: web3.utils.toHex(gasEstimate),
          gasPrice: gasPrice,
          value: web3.utils.toHex(web3.utils.toWei('0.002', 'ether'))
        };
        console.log("tx totalFunds=",web3.utils.fromWei(tx.value, 'ether'));

        const result = await web3.eth.accounts.signTransaction(tx, privatekey);
      
        console.log(result);
        console.log("sending tx...")
        const receipt = await web3.eth.sendSignedTransaction(result.rawTransaction);
        console.log(`receipt: ${JSON.stringify(receipt)}`);
}

module.exports = {
  handleWagerEvent,
  donateForContractHealth,
  handleWinLoseEvent
}
