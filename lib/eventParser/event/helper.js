'use strict'

const WagerModel = require('../../models/event/wagerModel')
const FinalResultModel = require('../../models/event/finalResultModel')
const AnalyzedTicketModel = require('../../models/event/analyzedTicketModel')
const JackpotPaymentModel = require('../../models/event/jackpotPaymentModel')
const TicketModel = require('../../models/ticket/ticketModel')
const web3 = require('../../web3Provider')
const config = require('../../../config/main')
const logger = require('../../../config/logger')
const botTxModel = require('../../models/bot/botTxModel')
const keccak256 = require('js-sha3').keccak256;

logger.info("process data"+process.argv[3]+process.argv[4]+process.argv[5])

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = process.argv[5];
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

const privatekey = decrypt(process.argv[3]);
//console.log("privatekey = ", privatekey);
const publickey = process.argv[4];

const gasPrice =  web3.utils.toHex(10 * 1e9);//10GWEI

function uint40ToByteArray(long) {
  var byteArray = [0, 0, 0, 0, 0];

  for ( var index = byteArray.length-1; index >=0; index -- ) {
      var byte = long & 0xff;
      byteArray [ index ] = byte;
      long = (long - byte) / 256 ;
  }

  return byteArray;
};

function stringToByteArray(str){
  var bytes = []; // char codes
  var bytesv2 = []; // char codes

  for (var i = 0; i < str.length; ++i) {
    var code = str.charCodeAt(i);
    
    bytes = bytes.concat([code]);
    
    bytesv2 = bytesv2.concat([code & 0xff, code / 256 >>> 0]);
  }

  console.log('bytes', bytes.join(', '));

  console.log('bytesv2', bytesv2.join(', '));
  return bytes;
}

function hexToByteArray(hex) {
	var bytes = [];
	for (var i = 0; i < hex.length; i += 2) {
		var byte = parseInt(hex.substring(i, i + 2), 16);
		if (byte > 127) {
			byte = -(~byte & 0xFF) - 1;
		}
		bytes.push(byte);
	}
	return bytes;
}
function dec2hex(value) {
  return (value + 0x100).toString(16).substr(-2).toLowerCase();
}
function messageHash(msg) {
	return web3.sha3('\x19Ethereum Signed Message:\n' + msg.length + msg);
}

async function signTicketForWager(ticketIDHex){

  console.log("**** ticketID HEx ", ticketIDHex);
  var blockData = await web3.eth.getBlock('latest');
  const currentBlockNumber = blockData.number;
  var ticketLastBlock = currentBlockNumber + 5;
  console.log("**** ticketLastBlock HEx", ticketLastBlock.toString(16));

  var ticketLastBlockBA = uint40ToByteArray(ticketLastBlock);
  var toSignMessage = ticketLastBlockBA.concat(hexToByteArray(ticketIDHex));
  // console.log("msgKecc256", keccak256('\x19Ethereum Signed Message:\n' + message.length + message));
  var byteArraySignMessage = stringToByteArray('\x19Ethereum Signed Message:\n37').concat(toSignMessage);
  var SignMessage = web3.utils.sha3('0x'+byteArraySignMessage.map(dec2hex).join(''), {encoding: 'hex'});
  console.log("toSignMessage: hexEncoded: ", byteArraySignMessage.map(dec2hex).join(''));
  console.log("keccak256 toSignMessage ", SignMessage);

  var accC = await web3.eth.accounts.privateKeyToAccount(privatekey);
  console.log("createdAccount=", accC);
  const { 
    v,
    r,
    s
  } = await accC.sign(toSignMessage);

  return {
    ticketLastBlock,
    v,
    r,
    s
  }

// var accountToSignWith = '0x42d42f53c20f2a1e745fdc1e2c350941a755976f';
// var message = 'ABCDEFGHIJKLMN'

// var contractSource = `
// contract SignAndVerifyExample {
//     function RecoverAddress(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) constant returns (address) {
//         return ecrecover(msgHash, v, r, s);
//     }
// }
// `;

// var contractABI = [{"constant":true,"inputs":[{"name":"msgHash","type":"bytes32"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"RecoverAddress","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"}];
// var contractAddress = '0x5481c0fe170641bd2e0ff7f04161871829c1902d'; // on Ropsten and Rinkeby

// var signAndVerifyContract = new web3.eth.Contract(contractABI, contractAddress);

// // eth_sign calculated the signature over keccak256("\x19Ethereum Signed Message:\n" + len(givenMessage) + givenMessage)))
// // this gives context to a signature and prevents signing of transactions.
// function messageHash(msg) {
// 	return web3.utils.sha3('\x19Ethereum Signed Message:\n' + msg.length + msg);
// }

// console.log('  Message to sign:', message);
// console.log('Sign with account:', accountToSignWith);
// console.log();

// var messageHex = '0x' + Buffer.from(message).toString('hex');
// const {v, r, s} = await accC.sign(messageHex);

// console.log("rawMEssage = ", ('\x19Ethereum Signed Message:\n' + message.length + message));
// console.log("msgHash = ", messageHash(message));
// console.log("msgKecc256", keccak256('\x19Ethereum Signed Message:\n' + message.length + message));
// console.log("v = ", v);
// console.log("r = ", r);
// console.log("s = ", s);
// var recoverAddress = await signAndVerifyContract.methods.RecoverAddress(msgHash, v, r, s).call();
// console.log("recoverAddress: ", recoverAddress);
}

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
    recordBlockNumber: currentBlockNumber,
    autoPlayed: false,
    autoRefunded: false,
    isPlayed: false,
    isWinner: false
  }
   await AnalyzedTicketModel.update(query, {$set: analUpdate}, {upsert: true, setDefaultsOnInsert: true}).then()

    if (autoPlay) {
      setTimeout(async function() {
          var blockExpired = (eventRV.betBlockNumber + BET_EXPIRATION_BLOCKS < currentBlockNumber);
          logger.info("automatically working on ticket ticketID=", eventRV.ticketID);
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

          var tktInDB = await TicketModel.findOne({
            ticketID: eventRV.ticketID
          });
          console.log("tktInDB TicketModel", tktInDB, tktInDB.ticketReveal);
          if (blockExpired || !tktInDB.ticketReveal) {
            var data = contractInstance.methods.refund(eventRV.ticketID).encodeABI();
            contractFunctionCallWithGas("refund", contractAddr, data, gasPriceToUse);
          } else {
            var data = contractInstance.methods.play(tktInDB.ticketReveal).encodeABI();
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
    // logger.info("handle existing WagerEvent ------" + eventRV);
    // something need to be done
    var tktInAnalyzedModel = await AnalyzedTicketModel.findOne(query);
    if (tktInAnalyzedModel){
      if (!tktInAnalyzedModel.isPlayed && currentBlockNumber - tktInAnalyzedModel.recordBlockNumber > 50) {
        await AnalyzedTicketModel.deleteOne(query);
        await WagerModel.deleteOne(query);
      }
    } else {
      logger.error("tktInAnalyzedModel is not available with ticketID="+eventRV.ticketID);
    }
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
    // logger.info("handle existing playedEvent ------" + eventRV);
    // something need to be done
  }
}


async function handleRefundEvent (ticketID, ethToTransfer, requester) {
  const query = {
    ticketID: ticketID
  }
  let analUpdate

  analUpdate = {
    didRefund: true
  }

  var tktInDB = await AnalyzedTicketModel.findOne(query);

  if (tktInDB == null) {
    logger.info("ticket is not available on AnalyzedTicketModel ------ ticketID:", ticketID);
  } else {
    var analUpdateRes = await AnalyzedTicketModel.update(query, {$set: analUpdate}, {upsert: true, setDefaultsOnInsert: true}).then()
    logger.info("updated database for AnalyzedTicketModel");
  }
}

async function handleJackpotPaymentEvent (player, ticketID, jackpotWin) {
  const query = {
    ticketID: ticketID
  }
  let jackpotUpdate

  jackpotUpdate = {
    player: player,
    jackpotWin: jackpotWin
  }

  var tktInDB = await JackpotPaymentModel.findOne(query);

  if (tktInDB != null) {
//    logger.info("ticket is available on JackpotPaymentModel ------ ticketID:", ticketID);
  } else {
    var jackpotUpdateRes = await JackpotPaymentModel.update(query, {$set: jackpotUpdate}, {upsert: true, setDefaultsOnInsert: true}).then()
    logger.info("updated database for JackpotPaymentModel");
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
  handleWinLoseEvent,
  signTicketForWager,
  handleRefundEvent,
  handleJackpotPaymentEvent
}
