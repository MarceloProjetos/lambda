"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var sns = new AWS.SNS();

var async = require('async');

var topicArn = 'arn:aws:sns:us-east-1:631712212114:node-red-';

module.exports = {	    

	route: function(message, callback) {
	    //var message = JSON.parse(record.Sns.Message)

	    if (message === undefined || message.to === undefined) {
	    	console.log('Invalid message format, should be:', JSON.stringify({to: '<node_id>', from: '<node_id>', payload: { bucket: 'bucket_name', key: 'key_name'}}, null, 2));
	    	callback('Invalid message format.');
	    }
	    //console.log('Received message:\n', message);

	    async.waterfall([
	        function get(next) {

			    var params = {
			        TableName : 'node-red-flow',
			        Key : { 
			          "id" : message.to
			        }
			    };

				console.log('\n\nFinding nodes according to this parameters:\n\n', JSON.stringify(params, null, 2));

	            dynamodb.get(params, function(err, data) {

                	console.log('\nNode found:\n', JSON.stringify(data, null, 2));

	                if (err) {

	                  console.log('Err: ', err); // an error occurred
	                  next(err);

	                } else {

	                    if (data.Item === undefined) {

	                        console.error('\nNode not found.\n');
	                        next('Node not found.');

	                    } else {

	                        //console.log('\nNodes found:\n', JSON.stringify(data.Items, null, 2)); // successful response

	                        next(err, { message: message, node: data.Item });
	                    
	                    }
	                }
	            });
	        },
	        function handler(msg, next) {

	        	var message = msg.message;
	        	var node = msg.node;

	        	console.log('\nRouting message...\n', JSON.stringify(message, null, 2));

	        	var msg = {
			          from: message.from || '0000000.0000000',
			          to: message.to,
			          type: 'node-red-' + node.type.replace(' ', '-'),
			          payload: message.payload			          
		        	}

		        var message = {
		        	default: JSON.stringify(msg)
		        };

		        //console.log('\nSending message:\n', JSON.stringify(message, null, 2)); // successful response

				sns.publish({
					Message: JSON.stringify(message),
					MessageStructure: 'json',
					TopicArn: topicArn + node.type.replace(' ', '-')
					}, function(err, data) {
						if (!err) {
							console.log('\nSuccessfully sent SNS message to node:\n', topicArn + node.type.replace(' ', '-'), JSON.stringify(message, null, 2)); // successful response
						}
			            next(err, data);
			    });  

	        }
	    ], function(err) {
	        if (err) {
	            callback('Unable to handler message due to an error: ' + err);
	        } 

	        console.log('Successfully dispatch message.');

	        callback(null);
	    });
	}
}