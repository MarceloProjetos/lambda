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
    /*for(var i = event.Records.length - 1; i >= 0; i--) {
        if(!event.Records[i].EventSource === 'aws:sns') {
           event.Records.splice(i, 1);
        }
    }*/

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

					//console.log('\n\nFinding SES nodes according to this parameters:\n\n', params);

		            dynamodb.query(params, function(err, data) {

	                	console.log('\nNodes found:\n', JSON.stringify(data, null, 2));

		                if (err) {

		                  console.log('Err: ', err); // an error occurred
		                  next(err);

		                } else {

		                    if (data.Items.length) {

		                        console.log('\nNodes found:\n', JSON.stringify(data.Items, null, 2)); // successful response

		                        next(null, data.Items);
		                    
		                    } else {

		                        console.log('\nNodes not found. Forward email to default SES handler');

		                        //next('Nodes not found. Forwarded email to default SES handler.');

		                    }
		                }
		            });
		        },
		        function forward(nodes, next) {

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

				        //console.log('\nSending message:\n', JSON.stringify(msg, null, 2)); // successful response

						sns.publish({
							Message: JSON.stringify(message),
							MessageStructure: 'json',
							TopicArn: topicRoute
							}, 
							function(err, data) {
								if (!err) {
									console.log('\Successfully dispatch SNS message:\n', JSON.stringify(message, null, 2)); // successful response
								}
					        	callback2(err, data);
					    	}
					    );  

					}, function(err) {
			          
						if (err) {
							next('Unable to dispatch all messages due to an error: ' + err);
						} 

						//console.log('Successfully dispatch messages.');

						next(null);
					});


		        }
		    ], function(err) {
		        callback2(err);
		    });

		}, function(err) {
		  callback(err);
		});

	}, function(err) {
	  /*if (err) {
	    context.fail('Error: ' + err);
	  }*/
	  context.done(err);          

	});

};
