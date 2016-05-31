"use strict";

var aws = require('aws-sdk');
var async = require('async');
var db = new aws.DynamoDB.DocumentClient();

/**
 * Provide an event that contains the following keys:
 *
 *   - operation: one of the operations in the switch statement below
 *   - tableName: required for operations that interact with DynamoDB
 *   - payload: a parameter to pass to the operation being performed
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var s3 = new aws.S3();

    event.Records.forEach(function(record) {
                
      console.log('Node id: ' + record.dynamodb.NewImage.to.S);

      var params = {
          TableName : 'node-red-flows',
          Key : { 
            "id" : record.dynamodb.NewImage.to.S
          }
      };

      db.get(params, function(err, data) {

          if (err) {
            console.log(err); // an error occurred
            context.fail(err);
          } else {
            console.log('Item found:', JSON.stringify(data, null, 2)); // successful response
          }
            
          if ( data.Item.wires !== undefined && data.Item.wires !== null) {

              data.Item.wires.forEach(function(out) {
                  out.forEach(function(id) {
                      
                      var msg = {
                        id : Guid.newGuid(),
                        from: data.Item.id,
                        to: id,
                        payload: record.dynamodb.NewImage.payload.S || ''
                      };

                      console.log('New msg:', JSON.stringify(msg, null, 2)); // successful response

                      var params = {
                        'TableName': 'node-red-msg',
                        'Item': msg
                      }                  

                      db.put(params, function(err, data) {
                          if (err) {
                              context.fail(new Error('id: ' + data.id + ', from: ' + data.from + ', to: ' + data.to + '\nerror: ' + err + '\ndata:' + data));
                          } else {
                              console.log('id: ' + data.id + ', from: ' + data.from + ', to: ' + data.to);
                              context.done();
                          }
                      });
                      
                  });
              });

          }

      });
                
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