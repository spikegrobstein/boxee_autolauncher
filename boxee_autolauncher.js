#! /usr/bin/env node

// configuration:

var path_to_boxee = "/Applications/TextEdit.app";

// udp socket stuff
var dgram = require("dgram");
var server = dgram.createSocket("udp4");

// shell execution stuff
var util = require('util'),
    exec = require('child_process').exec,
    child;

// if boxee isn't running, listen, otherwise, wait until boxee stops running, then listen.
function listen () {
	util.log('ready to listen... check if boxee is running...');
	
	try {
		server.bind(2562);
	} catch (err) {
		util.log("Boxee appears to be running! waiting 2.5 seconds.");
		setTimeout(listen, 2500); // wait 2.5 seconds and try again (in case boxee exits)
	}

}

server.on("message", function (msg, rinfo) {
  //util.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);

	// if it receives a discover packet, then let's try to launch boxee
	if ( msg.toString('utf8').match(/cmd="discover"/) ) {
		util.log("We got a discover packet!!! Launching Boxee at " + path_to_boxee);
		
		// launch boxee!
		child = exec('open "' + path_to_boxee + '"',
		  function (error, stdout, stderr) {
		    if (error !== null) {
		      util.log('exec error: ' + error);
		    }
		});
		
		server.close();
		listen();
		
	} else {
		util.log("NOT a discover packet...");
	}
	
});

server.on("listening", function () {
  var address = server.address();
  util.log("server listening " + address.address + ":" + address.port);
});

listen();
