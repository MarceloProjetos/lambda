/* exemplo 1
var https = require('https'),                  // Module for https
    fs =    require('fs');                     // Required to read certs and keys

var options = {
    key:   fs.readFileSync('ssl/client.key'),  // Secret client key
    cert:  fs.readFileSync('ssl/client.crt'),  // Public client key
    // rejectUnauthorized: false,              // Used for self signed server
    host: "rest.localhost",                    // Server hostname
    port: 8443                                 // Server port
};

callback = function(response) {
  var str = '';    
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}

https.request(options, callback).end();

*/


/* exemplo 2

var express = require('express');
var fs = require('fs');
var https = require('https');
var clientCertificateAuth = require('client-certificate-auth');
 
var opts = {
  // Server SSL private key and certificate 
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.pem'),
  // issuer/CA certificate against which the client certificate will be 
  // validated. A certificate that is not signed by a provided CA will be 
  // rejected at the protocol layer. 
  ca: fs.readFileSync('cacert.pem'),
  // request a certificate, but don't necessarily reject connections from 
  // clients providing an untrusted or no certificate. This lets us protect only 
  // certain routes, or send a helpful error message to unauthenticated clients. 
  requestCert: true,
  rejectUnauthorized: false
};
 
var app = express();
 
// add clientCertificateAuth to the middleware stack, passing it a callback 
// which will do further examination of the provided certificate. 
app.use(clientCertificateAuth(checkAuth));
app.use(app.router);
app.use(function(err, req, res, next) { console.log(err); next(); });
 
app.get('/', function(req, res) {
  res.send('Authorized!');
});
 
var checkAuth = function(cert) {
 /*
  * allow access if certificate subject Common Name is 'Doug Prishpreed'.
  * this is one of many ways you can authorize only certain authenticated
  * certificate-holders; you might instead choose to check the certificate
  * fingerprint, or apply some sort of role-based security based on e.g. the OU
  * field of the certificate. You can also link into another layer of
  * auth or session middleware here; for instance, you might pass the subject CN
  * as a username to log the user in to your underlying authentication/session
  * management layer.
  */
  /*return cert.subject.CN === 'Doug Prishpreed';
};
 
https.createServer(opts, app).listen(4000);
Or secure only certain routes:

app.get('/unsecure', function(req, res) {
  res.send('Hello world');
});
 
app.get('/secure', clientCertificateAuth(checkAuth), function(req, res) {
  res.send('Hello authorized user');
});
checkAuth can also be asynchronous:

function checkAuth(cert, callback) {
  callback(true);
}
 
app.use(checkAuth);

*/

/* exemplo 3: https://nodejs.org/api/https.html

const https = require('https');
const fs = require('fs');

const options = {
  pfx: fs.readFileSync('./8363624.pfx'),
  passphrase: 'Rtm098'
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);

*/

/* exemplo 4: https://vanjakom.wordpress.com/2011/08/11/client-and-server-side-ssl-with-nodejs/

var sys = require("sys");
var fs = require("fs");
var https = require("https");

var options = {
  key: fs.readFileSync("keys/server.key"),
  cert: fs.readFileSync("certs/server.crt"),
  ca: fs.readFileSync("ca/ca.crt"),
  requestCert: true,
  rejectUnauthorized: false
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  sys.puts("request: " + req.connection.getPeerCertificate().subject.CN);
  res.end("Hellod, " + req.connection.getPeerCertificate().subject.CN + "\n");
}).listen(8000);

sys.puts("serverted");

*/

// exemplo 5: https://www.npmjs.com/package/client-certificate-auth

var express = require('express');
var fs = require('fs');
var https = require('https');
var clientCertificateAuth = require('client-certificate-auth');
 
var opts = {
  // Server SSL private key and certificate 
  key: fs.readFileSync('keys/server.key'),
  cert: fs.readFileSync('certs/server.crt'),
  // issuer/CA certificate against which the client certificate will be 
  // validated. A certificate that is not signed by a provided CA will be 
  // rejected at the protocol layer. 
  ca: fs.readFileSync('ca/ca.crt'),
  // request a certificate, but don't necessarily reject connections from 
  // clients providing an untrusted or no certificate. This lets us protect only 
  // certain routes, or send a helpful error message to unauthenticated clients. 
  requestCert: true,
  rejectUnauthorized: false
};
 
var app = express();
 
// add clientCertificateAuth to the middleware stack, passing it a callback 
// which will do further examination of the provided certificate. 
app.use(clientCertificateAuth(checkAuth));
//app.use(app.router);  // deprecated !!!
app.use(function(err, req, res, next) { console.log(err); next(); });
 
app.get('/', function(req, res) {
  res.send('Authorized!');
});
 
var checkAuth = function(cert) {
 /*
  * allow access if certificate subject Common Name is 'Doug Prishpreed'.
  * this is one of many ways you can authorize only certain authenticated
  * certificate-holders; you might instead choose to check the certificate
  * fingerprint, or apply some sort of role-based security based on e.g. the OU
  * field of the certificate. You can also link into another layer of
  * auth or session middleware here; for instance, you might pass the subject CN
  * as a username to log the user in to your underlying authentication/session
  * management layer.
  */
  return cert.subject.CN === 'Doug Prishpreed';
};
 
https.createServer(opts, app).listen(8000);

//Or secure only certain routes:
app.get('/unsecure', function(req, res) {
  res.send('Hello world');
});
 
app.get('/secure', clientCertificateAuth(checkAuth), function(req, res) {
  res.send('Hello authorized user');
});

//checkAuth can also be asynchronous:
function checkAuth(cert, callback) {
  callback(true);
}
 
app.use(checkAuth);