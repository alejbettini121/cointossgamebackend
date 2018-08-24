var keccak256 = require('js-sha3').keccak256;
var bigInt = require("big-integer");

//0x00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 e2 40

longToByteArray = function(/*long*/long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = byteArray.length-1; index >=0; index -- ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

var byteArray =  longToByteArray(process.argv[2]);
var resultBigHex = keccak256(byteArray);
var digit10 = bigInt(resultBigHex, 16).toString(10);

console.log(digit10);