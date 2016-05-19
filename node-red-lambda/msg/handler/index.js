"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var async = require('async');

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    /*
    Process one message at a time
    setup dynamodb to trigger this function for each inserted record
    */
    var record = event.Records[0];

    if (record.eventName != 'INSERT') {
      context.done(null, '***** NOT AN INSERT REQUEST, ABORT EXECUTION ******');
    }

    var payload = record.dynamodb.NewImage.payload.S;

    console.log('Node id: ' + record.dynamodb.NewImage.to.S);

    var params = {
        TableName : 'node-red-flow',
        Key : { 
          "id" : record.dynamodb.NewImage.to.S
        }
    };

    async.waterfall([
        function get(next) {
            dynamodb.get(params, function(err, data) {

                if (err) {

                  console.log(err); // an error occurred
                  next(err);

                } else {

                    if (data.Item === undefined) {

                        console.error('Node not found.');
                        next('Node not found.');

                    } else {

                        console.log('Node found:\n', JSON.stringify(data.Item, null, 2)); // successful response

                        next(err, data.Item);
                    
                    }
                }
            });
        },
        function handler(node, next) {
            console.log('calling message handler for node of type:', node.type, '\n', node);

            switch(node.type) {
                case 'inject':
                    console.log('call inject handler.');
                    exports.inject(context, node, payload, next);
                    break;
                case 'debug':
                    console.log('call debug handler.');
                    exports.debug(context, node, payload, next);
                    break;
                default:
                    next('Message handler for type ' + data.Item.type + ' not implemented.', null);
            }
        }
    ], function(err) {
        if (err) {
          context.fail('Error: ' + err);
        }
        context.done(null, { msg: 'Message dispatch successfully'});
    });

};

exports.inject = function(context, node, payload, callback) {
  async.waterfall([
    function dispatch(next) {
        var to_list = [];

        node.wires.forEach(function(outputs) {
          outputs.forEach(function(node) {
            to_list.push(node)
          })
        })

        console.log('Injecting message to this nodes:', to_list);
        
        dispatch_message(context, node, to_list || null, payload, callback);
            
        //next();
    }
  ], function(err) {
    callback(err);
  });
};

exports.debug = function(context, node, payload, callback) {
    var s3 = new AWS.S3();

    async.waterfall([
      function dispatch(next) {
        var params = {
          Bucket: 'node-red-msg',
          Key: Guid.newGuid(),
          Body: JSON.stringify(node, null, 2)
        }

        s3.putObject(params, function(err, data) {
          if (err) {
            next(err);
          }

          // dump payload to mqtt
          console.log('Dump debug messages to mqtt successfully for node', node.id, '\n', payload);

        });

      }
    ], function(err) {
      callback(err);
    });

}

function dispatch_message(context, node, to_list, payload, callback) {
    if (to_list !== undefined && to_list !== null && to_list instanceof Array) {

      console.log('Dispatching message for nodes:', to_list);

      async.forEachOf(to_list, function(id, key, callback2) {

        var msg = {
          id : Guid.newGuid(),
          from: node.id || '0000000.0000000',
          to: id,
          payload: payload || 'null'
        };

        console.log('Sending message:\n', JSON.stringify(msg, null, 2)); // successful response

        var params = {
          'TableName': 'node-red-msg',
          'Item': msg
        }                  

        dynamodb.put(params, function(err, data) {
          console.log('Msg sent successfully to node', id);
            if (err) {
                callback2(new Error("Failed to dispath inject message for one node:" + err));
            } 
            callback2(err, data);
        });
          
      }, function(err) {
          
          if (err) {
              callback('Unable to dispatch all messages due to an error: ' + err);
          } 

          console.log('Successfully dispatch messages.');

          callback(null);
      });

    }

}

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