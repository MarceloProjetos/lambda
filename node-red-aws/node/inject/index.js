"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();
var sns = new AWS.SNS();

var async = require('async');

var topicArn = 'arn:aws:sns:us-east-1:631712212114:node-red-flow-route';

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    async.waterfall([
        function lookup_node(next) {

          var params = {
              TableName : 'node-red-flow',
              Key : { 
                "id" : event.params.path.id
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
            var to_list = [];

            node.wires.forEach(function(outputs) {
              outputs.forEach(function(node) {
                to_list.push(node)
              })
            })

            console.log('Injecting message to this nodes:', to_list);
            
            async.forEachOf(to_list, function(to, key, callback) {

              var msg = {
                  from: node.id || '0000000.0000000',
                  to: to,
                  payload: {
                    bucket: node.payload.bucket || null,
                    key: node.payload.key || null
                  }
                  
                }

              var message = {
                default: JSON.stringify(msg)
              };

              console.log('\nSending message:\n', JSON.stringify(msg, null, 2)); // successful response

              sns.publish({
                Message: JSON.stringify(message),
                MessageStructure: 'json',
                TopicArn: topicArn
              }, function(err, data) {
                if (!err) {
                  console.log('\Successfully dispatch SNS message:\n', JSON.stringify(message, null, 2)); // successful response
                }
                callback(err, data);
              });       
                
            }, function(err) {
                
                if (err) {
                    next('Unable to dispatch all messages due to an error: ' + err);
                } 

                console.log('Successfully dispatch messages.');

                next(null);
            });

        }
    ], function(err) {
        if (err) {
          context.fail('Error: ' + err);
        }
        context.done(null, { msg: 'Message dispatch successfully'});
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