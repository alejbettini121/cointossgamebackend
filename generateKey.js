
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = process.argv[3];

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}


console.log("encrypted = ", encrypt(process.argv[2]));