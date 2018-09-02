const Contract = require('../lib/models/contract/contractModel')
const WagerModel = require('../lib/models/event/wagerModel')
const WinLoseModel = require('../lib/models/event/finalResultModel')
const AnalyzedTicketModel = require('../lib/models/event/analyzedTicketModel')
const JackpotPaymentModel = require('../lib/models/event/jackpotPaymentModel')
const TicketModel = require('../lib/models/ticket/ticketModel')
const logger = require('../config/logger')
var keccak256 = require('js-sha3').keccak256;
var bigInt = require("big-integer");
const eventHelper = require('../lib/eventParser/event/helper')

createRandom32Bytes = function() {

	var byteArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = byteArray.length-1; index >=0; index -- ) {
        var byte = Math.floor(Math.random() * (100000000 + 1)) & 0xff;
        byteArray [ index ] = byte;
    }

    return byteArray;
};

module.exports = (router) => {

	router.post('/api/v1/ticket', async function(req, res) { // create ticketID and provide it
		for (var i = 0; i < 1000; i ++){
			function dec2hex(value) {
				return (value + 0x100).toString(16).substr(-2).toUpperCase();
			}
			  
			var byteArray =  createRandom32Bytes();
			var ticketIDBigHex = keccak256(byteArray);
			var ticketID = bigInt(ticketIDBigHex, 16).toString(10);
			var ticketReveal = bigInt(byteArray.map(dec2hex).join(''), 16).toString(10);

			const query = {
				ticketID: ticketID
			}
			const update = {
				ticketReveal: ticketReveal
			 }
			var tktInDB = await TicketModel.findOne(query);
		
			if (tktInDB == null) {
				const {
					ticketLastBlock,
					v,
					r,
					s
				} = await eventHelper.signTicketForWager(ticketIDBigHex);
				await TicketModel.update(query, {$set: update}, {upsert: true, setDefaultsOnInsert: true}).then()
				return res.json({success: true, ticketID: ticketID, ticketLastBlock: ticketLastBlock, v: v, r: r, s: s})
			}
		}
		return res.json({success: false, ticketID: 0})
	});

	router.get('/api/v1/ticket/:ticketID', async function(req, res) { // get ticket status; created, waging, wagered, playing, win/lost

		var tktInDB = await TicketModel.findOne({
			ticketID: req.params.ticketID
		});

		if (tktInDB){
			res.json({success: true, data: tktInDB})
		} else {
			res.json({success: false})
		}
	});

	router.post('/api/v1/ticket/:id/wagered', function(req, res) {

	});

	router.get('/api/v1/jackpotWins', function(req, res) { 
		JackpotPaymentModel.find({}, function(err, docs) {
			if (!err){ 
				res.json({success: true, data: docs})
			} else {
				throw err;
			}
		});
	});

	router.get('/api/v1/wageredTickets', function(req, res) { // provide wagered tickets on database
		WagerModel.find({}, function(err, docs) {
			if (!err){ 
				res.json({success: true, data: docs})
			} else {
				throw err;
			}
		});
	});

	router.get('/api/v1/playedTickets', function(req, res) { // provide transactionID when wager transaction starting
		WinLoseModel.find({}, function(err, docs) {
			if (!err){ 
				res.json({success: true, data: docs})
			} else {
				throw err;
			}
		});
	});

	router.get('/api/v1/analyzedTickets', function(req, res) { // provide transactionID when wager transaction starting
		AnalyzedTicketModel.find({}, function(err, docs) {
			if (!err){ 
				res.json({success: true, data: docs})
			} else {
				throw err;
			}
		});
	});


	router.get('*', function(req, res) {
	  res.render("coinflip.html");
	});
	return router;
};