/* Based on http://www.kingsquare.nl/blog/29-06-2011/16812936/Use-node.js-to-install-and-link-Dropbox-fully-automated-in-a-text-based-Linux-environment
* Copyright (c) 2011 Kingsquare BV
*
* Modified by Christian G. Warden <cwarden@xerus.org>
**/

'use strict';

var spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , dropboxdProcess
  , hostId;

if (process.argv.length < 4) {
	console.log('Please provide a username and password as parameter');
	return;
}

var die = function(error) {
	console.log(error);
	dropboxdProcess.kill();
	process.exit(1);
}

console.log('Starting dropbox-link process');
delete process.env.DISPLAY;
try {
	var cmd = process.env.HOME + '/.dropbox-dist/dropbox';
	console.log('starting ' + cmd);
	dropboxdProcess = spawn(cmd);
	dropboxdProcess.stdout.on('data', function(data) {
		var resultString = String(data);
		if (typeof hostId === 'undefined') {
			var match = /host_id=(.*?)[&|]/.exec(resultString);
			if (!match) {
				if (resultString == 'This client is not linked to any account...') {
					// we didn't receive the host_id in the `data`. Try again.
					return;
				}
				else {
					die('Unexpected output: ' + resultString);
				}
			}
			hostId = match[1];
			console.log('Retrieved host_id, starting login procedure');
			exec('curl -c ~/dropboxCookies https://www.dropbox.com/login', function(error, stdout) {
				console.log('Retrieved session cookies...');
				var t = /name="t" value="(.*?)"/.exec(String(stdout))[1];
				exec('curl -b ~/dropboxCookies  -c ~/dropboxCookies -d t='+t+' -d login_email=' + encodeURIComponent(process.argv[2])
				  + ' -d login_password=' + encodeURIComponent(process.argv[3])
				  + ' -d login_submit=Log+in https://www.dropbox.com/login', function(error, stdout) {
					exec('curl -b ~/dropboxCookies -c ~/dropboxCookies https://www.dropbox.com/cli_link?host_id=' + hostId
					  + '&cl=en_US', function(error, stdout) {
						var match = /name="t" value="(.*?)"/.exec(String(stdout))
						if (!match) {
							die('Could not authenticate.  Check username and password.');
						}
						var t = match[1];
						exec('curl -b ~/dropboxCookies -d t=' + t + ' -d password=' + encodeURIComponent(process.argv[3])
							 + ' https://www.dropbox.com/cli_link?host_id=' + hostId, function(error, stdout) {
							console.log('Link procedure done, waiting for dropbox response...');
						});
					});
				});
		  });
		}

		if (resultString.indexOf('Client successfully linked') >= 0) {
			console.log('All done.  Killing dropbox process.');
			// dropbox says the client is linked before it has written the
			// sigstore.dbx file so we need to wait a bit.
			setTimeout(function() {
				dropboxdProcess.kill();
			}, 1000);
		}
	});
} catch (e) {
	console.log('Error: ' + e);
	dropboxdProcess.kill();
}

dropboxdProcess.stderr.on('data', function(data) {
	console.log(String(data));
});

dropboxdProcess.on('exit', function (code) {
	console.log('dropbox process exited with code ' + code);
});
