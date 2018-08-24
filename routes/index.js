const Contract = require('../lib/models/contract/contractModel')
const WagerModel = require('../lib/models/event/wagerModel')
const WinLoseModel = require('../lib/models/event/finalResultModel')
const AnalyzedTicketModel = require('../lib/models/event/analyzedTicketModel')
const TicketModel = require('../lib/models/ticket/ticketModel')
const logger = require('../config/logger')

module.exports = (router) => {

	router.post('/api/v1/ticket', async function(req, res) { // create ticketID and provide it
		for (var i = 0; i < 1000; i ++){
			var ticketID = Math.floor(Math.random() * (100000000 + 1)).toString();
			const query = {
				ticketID: ticketID
			}
			const update = { }
			var tktInDB = await TicketModel.findOne(query);
		
			if (tktInDB == null) {
				await TicketModel.update(query, {$set: update}, {upsert: true, setDefaultsOnInsert: true}).then()
				return res.json({success: true, ticketID: ticketID})
			}
		}
		return res.json({success: false, ticketID: 0})
	});

	router.get('/api/v1/ticket/:id', function(req, res) { // get ticket status; created, waging, wagered, playing, win/lost

	});

	router.post('/api/v1/ticket/:id/wagered', function(req, res) { // provide transactionID when wager transaction starting

	});

	router.get('/api/v1/allTickets', function(req, res) { // provide transactionID when wager transaction starting

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