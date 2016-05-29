"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var sns = new AWS.SNS();

var async = require('async');

exports.handler = function(event, context) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // remove unused messages
    for(var i = event.Records.length - 1; i >= 0; i--) {
        if(!event.Records[i].EventSource === 'aws:sns') {
           event.Records.splice(i, 1);
        }
    }

	async.forEachOf(event.Records, function(record, key, callback) {

	    var message = JSON.parse(record.Sns.Message)

	    async.waterfall([
	        function get(next) {

			    var params = {
			        TableName : 'node-red-flow',
			        Key : { 
			          "id" : message.to
			        }
			    };

				console.log('\n\nFinding nodes according to this parameters:\n\n', params);

	            dynamodb.get(params, function(err, data) {

                	console.log('\nNode found:\n', JSON.stringify(data, null, 2));

	                if (err) {

	                  console.log('Err: ', err); // an error occurred
	                  next(err);

	                } else {

	                    if (data.Item === undefined) {

	                        console.error('\nNode not found.');
	                        next('Node not found.');

	                    } else {

	                        //console.log('\nNodes found:\n', JSON.stringify(data.Items, null, 2)); // successful response

	                        next(err, data.Item);
	                    
	                    }
	                }
	            });
	        },
	        function handler(node, next) {

		        var to_list = [];

		        node.wires.forEach(function(outputs) {
		          outputs.forEach(function(destination) {
		            to_list.push({from: node.id, type: node.type, to: destination})
		          })
		        })

		        async.forEachOf(to_list, function(node, key, callback2) {

		        	var msg = {
				          id : payload.key, //Guid.newGuid(),
				          from: node.from || '0000000.0000000',
				          to: node.to,
				          type: 'node-red-' + node.type.replace(' ', '-'),
				          payload: {
				          	bucket: message.payload.bucket || null,
				          	key: message.payload.key || null
				          }
				          
			        	}

			        var message = {
			        	default: JSON.stringify(msg)
			        };

			        console.log('\nSending message:\n', JSON.stringify(msg, null, 2)); // successful response

					sns.publish({
						Message: JSON.stringify(message),
						MessageStructure: 'json',
						TopicArn: 'arn:aws:sns:us-east-1:631712212114:' + node.type
						}, function(err, data) {
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
	            callback('Unable to handler message due to an error: ' + err);
	        } 

	        console.log('Successfully dispatch message.');

	        callback(null);
	    });

	}, function(err) {
	  if (err) {
	    context.fail('Error: ' + err);
	  }
	  context.done(null, { msg: 'Message dispatch successfully.'});          

	});

};
