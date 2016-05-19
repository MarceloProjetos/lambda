"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var async = require('async');

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

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
                context.fail('Node not found.');

            } else {

                console.log('Node found:', JSON.stringify(data.Item, null, 2)); // successful response
                      
                var to_list = [];

                data.Item.wires.forEach(function(outputs) {
                  outputs.forEach(function(node) {
                    to_list.push(node)
                  })
                })

                dispatch_message(context, data.Item.id, to_list || null, data.Item.payload);

            }
          
        }

    });
    
};

function dispatch_message(context, from, to_list, payload) {
    if (to_list !== undefined && to_list !== null && to_list instanceof Array) {

      var msgs = [];

      to_list.forEach(function(to) {
        msgs.push({
              id : Guid.newGuid(),
              from: from,
              to: to,
              payload: payload || 'null'
            })
      })

      async.forEachOf(msgs, function(msg, key, callback) {
          
        console.log('Sending message', JSON.stringify(msg, null, 2)); // successful response

        var params = {
          'TableName': 'node-red-msg',
          'Item': msg
        }                  

        dynamodb.put(params, function(err, data) {
            if (err) {
                callback(new Error("Failed to dispath inject message for one node:" + err.message));
            } 
            callback();
        });
          
      }, function(err) {
          
          if (err) {
              console.error('Unable to dispatch all messages due to an error: ' + err.message);
              context.fail('Unable to dispatch all messages due to an error: ' + err.message);
          } 

          console.log('Successfully dispatch messages.');
          context.done();

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