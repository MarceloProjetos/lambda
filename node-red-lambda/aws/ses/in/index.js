"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var sns = new AWS.SNS();

var async = require('async');

var topicRoute = 'arn:aws:sns:us-east-1:631712212114:node-red-flow-route';
var defaultRoute = 'arn:aws:sns:us-east-1:631712212114:node-red-aws-ses-in-default';

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // remove unused messages
    for(var i = event.Records.length - 1; i >= 0; i--) {
        if(!event.Records[i].EventSource === 'aws:sns') {
           event.Records.splice(i, 1);
        }
    }

	async.forEachOf(event.Records, function(record, key, callback) {

	    var message = JSON.parse(record.Sns.Message)
	    var recipients = message.receipt.recipients; 
	    var payload = {
	    	bucket: message.receipt.action.bucketName,
	    	key: message.receipt.action.objectKey
	    }

	    console.log('Send to recipients:', recipients);

	    async.forEachOf(recipients, function(recipient, key, callback2) {

		    async.waterfall([
		        function get(next) {

				    var params = {
				        TableName : 'node-red-flow',
				        IndexName: 'type-email-index',
				        KeyConditionExpression: '#type = :type and email = :email',
					    ExpressionAttributeNames:{
					        '#type': 'type'
					    },
					    ExpressionAttributeValues: {
					        ':type': 'aws-ses-in',
					        ':email': recipient
					    },
				        ProjectionExpression: "id, wires",
				        ScanIndexForward: false
				    };	    

					console.log('\n\nFinding SES nodes according to this parameters:\n\n', params);

		            dynamodb.query(params, function(err, data) {

	                	console.log('\nNodes found:\n', JSON.stringify(data, null, 2));

		                if (err) {

		                  console.log('Err: ', err); // an error occurred
		                  next(err);

		                } else {

		                    if (data.Items === undefined) {

		                        console.log('\nNodes not found. Forward email to default SES handler');

		                        next('Nodes not found. Forwarded email to default SES handler.');

		                    } else {

		                        //console.log('\nNodes found:\n', JSON.stringify(data.Items, null, 2)); // successful response

		                        next(null, data.Items);
		                    
		                    }
		                }
		            });
		        },
		        function forward_msg(nodes, next) {

			        var to_list = [];

			        nodes.forEach(function(node) {
				        node.wires.forEach(function(outputs) {
				          outputs.forEach(function(destination) {
				            to_list.push({from: node.id, to: destination})
				          })
				        })
			        })

			        async.forEachOf(to_list, function(node, key, callback2) {

			        	var msg = {
					          from: node.from || '0000000.0000000',
					          to: node.to,
					          payload: {
					          	bucket: payload.bucket || null,
					          	key: payload.key || null
					          }
					          
				        	}

				        var message = {
				        	default: JSON.stringify(msg)
				        };

				        console.log('\nSending message:\n', JSON.stringify(msg, null, 2)); // successful response

						sns.publish({
							Message: JSON.stringify(message),
							MessageStructure: 'json',
							TopicArn: topicRoute
							}, function(err, data) {
								if (!err) {
									console.log('\Successfully dispatch SNS message:\n', JSON.stringify(message, null, 2)); // successful response
								}
					            callback2(err, data);
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
		            callback2('Unable to notify receipt ' + receipt + ' of incomming SES Mail due to an error: ' + err);
		        } 

		        callback2(null);
		    });

		}, function(err) {
		  if (err) {
		    callback('Error: ' + err);
		  }
		  callback(null, { msg: 'SES Mail incomming notify successfully.'});          

		});

	}, function(err) {
	  if (err) {
	    context.fail('Error: ' + err);
	  }
	  context.done(null, { msg: 'SES Mail incomming notify successfully.'});          

	});

};

/*
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
*/