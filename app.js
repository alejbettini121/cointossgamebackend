var express = require('express')
var path = require('path');
var cors = require('cors');
var bodyparser = require('body-parser');
var fs = require('fs');
var engines = require('consolidate');
const logger = require('./config/logger')
const initScript = require('./lib/initScript')
const parserRunner = require('./lib/parserRunner')

var router = express.Router();
var app = express(); 
var server = require('http').Server(app);
var port = 4004;

app.engine('html', engines.hogan);
app.set('view engine', 'html');
app.use(cors());

// body-parser
app.use(bodyparser.urlencoded({ extended: false}));
app.use(bodyparser.json());

app.use('/', express.static('public'))

var routes = require('./routes')(router);

app.use('/', routes);

server.listen(port, function() {
  logger.info("Coinflip server  running %d port", port);
});


initScript.init().then((done, err) => {
  if (err) {
    logger.error('Problem with data initialization!')
    logger.error(err)
    return
  }

  logger.info(done)
})

parserRunner.isActive().then((done) => {
  if (done) {
    logger.info('Data parser is active!')
    return
  }
  logger.info('Data parsing disabled! Check ./config/main/parsing_active setting')
})
