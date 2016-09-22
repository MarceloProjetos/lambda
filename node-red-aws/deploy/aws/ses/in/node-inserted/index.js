"use strict";

var aws = require('aws-sdk');
var async = require('async');
var ses = new aws.SES();
var node = require('node-red-aws-node');
var message = require('node-red-aws-msg');
var sns = new aws.SNS();

exports.handler = function(event, context, callback) {
	console.log('Message: ' + JSON.stringify(event, null, 2));
	
	var msg = message.parse(event)[0];

	var params = {
	};

	// work only in active rule set
	ses.describeActiveReceiptRuleSet(params, function(err, data) {
		if (err) {

			node.error(err, callback);

		} else {     
			console.log(JSON.stringify(data, null, 2)); // successful response

			var rule = data.Rules.find(function(e, i, a) { return e.Name === msg.id; });

			if (!rule) {
				console.log('Rule not found, create one.');
				//node.send('node-red-aws-deploy-aws-ses-in-create-receipt-rule-set', msg, callback);

				var actions = [];

				msg.wires.forEach(function(e, k, a) {
					e.forEach(function(v, k, a) {
						actions.push({ 
							SNSAction: {
				        		TopicArn: 'arn:aws:sns:us-east-1:631712212114:node-red-aws-node-' + v.replace('.', '-'), /* required */
				        		Encoding: 'UTF-8'
				        	}
				        });
					})					
				})

				async.each(actions, function(topic, callback2) {
					
					var params = {
					  	Name: topic.SNSAction.TopicArn.split(':')[5]
					};

					console.log('Creating SNS topic: ' + params.Name);

					sns.createTopic(params, function(err, data) {
						if (err) 
							console.log('Create SNS topic error: ' + err);
						else
							console.log('Create SNS topic successfull.');
						callback2(err, data);           // successful response
					});

				}, function(err) {
					if (err) {
						console.log('Error on create SNS topics');
					} else {
						console.log('Create SNS topics done.');

						actions.splice(0, 0,
							{ 
								S3Action: {
						        	BucketName: 'node-red-aws-ses-in'
						        }
						    });

						var params = {
						  Rule: { /* required */
						    Name: msg.id.replace('.', '-'), /* required */
						    Actions: actions,
						    Enabled: true,
						    Recipients: [
						      msg.recipient
						    ],
						    ScanEnabled: false
						  },
						  RuleSetName: data.Metadata.Name, /* required */
						};

						console.log(JSON.stringify(params, null, 2));

						ses.createReceiptRule(params, function(err, data) {
						  	callback(err, data);
						});	

					}
				})

			} else {
				console.log('Rule found, check if receipt is the same.');
			}
			
		}
		
	});
}
