'use strict';

var Primus = require('primus')
  , count = 0
  , server
  , primus;

//
// Some build in Node.js modules that we need:
//
var http = require('http')
  , fs = require('fs');

//
// Create a basic server that will send the compiled library or a basic HTML
// file which we can use for testing.
//
server = http.createServer(function server(req, res) {
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(__dirname + '/index.html').pipe(res);
});

//
// Now that we've setup our basic server, we can setup our Primus server.
//
primus = new Primus(server, { transformer: 'engine.io' });

//
// Add the SubStream plugin.
//
primus.use('substream', require('../'));
function randomString(maxLength) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = Math.random() * maxLength;
  var randomstring = '';
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}
//
// Listen for new connections and send data
//
function makeDummyStream(foo) {
  setInterval(function () {
    foo.write({ time: new Date().getTime(), message: randomString(400)});
  }, process.env.interval);
}

function sendMessage(foo2, message) {
  foo2.write({ time: new Date().getTime(), message: message});
}

primus.on('connection', function connection(spark) {
  console.log('new connection: ', spark.id);

  var x = 0;
  for (x = 0; x < process.env.numOfStrings || 100; x++) {
    var foo = spark.substream('x' + x);
    makeDummyStream(foo);
  }
  var foo2 = spark.substream('foo');
  var count = 0;
  setInterval(function () {
    count++;
    sendMessage(foo2, count);
  }, process.env.interval);
});

//
// Everything is ready, listen to a port number to start the server.
//
server.listen(process.env.port);
