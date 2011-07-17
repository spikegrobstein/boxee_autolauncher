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
	console.log('ready to listen... check if boxee is running...');
	
	is_boxee_running(
		function() {
			console.log("Boxee is running... let's wait 2.5 seconds and try again...");

			setTimeout(listen, 2500); // wait 2.5 seconds and try to listen again
		},
		function() {
			console.log("Boxee is not running... let's start listening.");
			
			try {
				server.bind(2562);
			} catch (err) {
				console.log("Boxee MUST be running!");
			}
			
			setTimeout(listen, 2500); // wait 2.5 seconds and try again (in case boxee exits)
		}
	);

}

// returns true if boxee is running
// checks this by looking at child.pid and hitting it with kill -0
function is_boxee_running (callback_on_true, callback_on_false) {
	if (typeof callback_on_true !== 'function') {
		console.log("callback_on_true not defined.");
		callback_on_true = function() { return false; };
	}
	
	if (typeof callback_on_false !== 'function') {
		console.log("callback_on_false not defined.");
		callback_on_false = function() { return false; };
	}
	
	if (!child) {
		console.log("no child process... must not be running.")
		// if there's no child, yet, then it's not running
		callback_on_false();
		return;
	}
	
	// send kill -0 to child.pid.
	console.log("Running Kill command");
	var kill_cmd = exec('kill -0 ' + child.pid,
		function (error, stdout, stderr) {
			(error !== null) ? callback_on_true() : callback_on_false();
	});
}

server.on("message", function (msg, rinfo) {
  //console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);

	// if it receives a discover packet, then let's try to launch boxee
	if ( msg.toString('utf8').match(/cmd="discover"/) ) {
		console.log("We got a discover packet!!! Launching Boxee at " + path_to_boxee);
		
		// launch boxee!
		child = exec('open "' + path_to_boxee + '"',
		  function (error, stdout, stderr) {
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
		});
		
		server.close();
		
	} else {
		console.log("NOT a discover packet...");
	}
	
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);
});

listen();
