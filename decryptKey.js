
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = process.argv[3];
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}


console.log("encrypted = ", decrypt(process.argv[2]));