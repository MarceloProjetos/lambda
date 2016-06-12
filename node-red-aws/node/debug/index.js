"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var awsIot = require('aws-iot-device-sdk');

var async = require('async');

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

  async.forEachOf(event.Records, function(record, key, callback) {

      var msg = JSON.parse(record.Sns.Message);

      async.waterfall([
          function get(next) {

            var params = {
                TableName : 'node-red-flow',
                Key : { 
                  "id" : msg.to
                }
            };
            
            dynamodb.get(params, function(err, data) {

                if (err) {

                  console.log(err); // an error occurred
                  context.fail(err);

                } else {

                    if (data.Item === undefined) {

                        console.error('Node not found.');
                        next('Node not found.');

                    } else {

                        console.log('Node found:', JSON.stringify(data.Item, null, 2)); // successful response
                        next(err, data.Item);

                    }
                  
                }

            });
          },
          function dispatch(node, next) {

            var device = awsIot.device({
              "host": "A2P1UO6NYTQZKP.iot.us-east-1.amazonaws.com",
              "port": 8883,
              "clientId": "node-red-debug",
              "thingName": "node-red-debug",
              "caCert": "root-CA.crt",
              "clientCert": "0463c63f04-certificate.pem.crt",
              "privateKey": "0463c63f04-private.pem.key"
            });

            /*var device = awsIot.device({
              keyPath: "991378bb0c-private.pem.key", //<YourPrivateKeyPath>,
              certPath: "991378bb0c-certificate.pem.crt", //<YourCertificatePath>,
              caPath: "root-CA.crt", //<YourRootCACertificatePath>,
              debug: true,
              clientId: "node-red1", //<YourUniqueClientIdentifier>,
              region: 'us-east-1', //<YourAWSRegion> 
              host: "A2P1UO6NYTQZKP.iot.us-east-1.amazonaws.com",
              port: 8883,
              thingName: "node-red",    
            });*/

            device
              .on('connect', function() {
                console.log('connect');
                device.subscribe('debug');
                device.publish('debug', JSON.stringify(msg.payload || ''), function(err) {
                  next(err);
                });
              });

          }
      ], function(err) {
          callback(err);
      });

  }, function(err) {
    if (err) {
      context.fail(err);
    }
    context.done(err);          

  });
    
};

function uuid() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

var Guid = Guid || (function () {

var EMPTY = '00000000-0000-0000-0000-000000000000';

var _padLeft = function (paddingString, width, replacementChar) {
    return paddingString.length >= width ? paddingString : _padLeft(replacementChar + paddingString, width, replacementChar || ' ');
};

var _s4 = function (number) {
    var hexadecimalResult = number.toString(16);
    return _padLeft(hexadecimalResult, 4, '0');
};

var _cryptoGuid = function () {
    var buffer = new window.Uint16Array(8);
    window.crypto.getRandomValues(buffer);
    return [_s4(buffer[0]) + _s4(buffer[1]), _s4(buffer[2]), _s4(buffer[3]), _s4(buffer[4]), _s4(buffer[5]) + _s4(buffer[6]) + _s4(buffer[7])].join('-');
};

var _guid = function () {
    var currentDateMilliseconds = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (currentChar) {
        var randomChar = (currentDateMilliseconds + Math.random() * 16) % 16 | 0;
        currentDateMilliseconds = Math.floor(currentDateMilliseconds / 16);
        return (currentChar === 'x' ? randomChar : (randomChar & 0x7 | 0x8)).toString(16);
    });
};

var create = function () {
    var hasCrypto = false; //typeof (window.crypto) != 'undefined',
    var hasRandomValues = false; //typeof (window.crypto.getRandomValues) != 'undefined';
    return (hasCrypto && hasRandomValues) ? _cryptoGuid() : _guid();
};

return {
    newGuid: create,
    empty: EMPTY
};})();