var dgram = require("dgram");

var server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {
  //console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);

	// if it receives a discover packet, then let's try to launch boxee
	if ( msg.toString('utf8').match(/cmd="discover"/) ) {
		console.log("We got a discover packet!!!");
	} else {
		console.log("NOT a discover packet...");
	}
	
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});

server.bind(2562);
