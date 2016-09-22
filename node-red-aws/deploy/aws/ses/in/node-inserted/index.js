"use strict";

var aws = require('aws-sdk');
var async = require('async');
var msg = require('node-red-aws-msg');

var ses = new aws.SES();
var sns = new aws.SNS();

exports.handler = function(event, context, callback) {
	console.log('Event: ' + JSON.stringify(event, null, 2));
	
	var nodes = msg.parse(event);

	async.each(nodes, function(node, asyncCallback) {

		var params = {
		};

		// work only in active rule set
		ses.describeActiveReceiptRuleSet(params, function(err, activeReceiptRuleSet) {
			if (err) {

				msg.error(err, asyncCallback);

			} else {     
				console.log('ActiveReceiptRuleSet: ' + JSON.stringify(activeReceiptRuleSet, null, 2)); // successful response

				var rule = activeReceiptRuleSet.Rules.find(function(rule, index, array) { return rule.Name === node.id.replace('.', '-'); });

				if (!rule) {
					console.log('Rule not found ' + node.id.replace('.', '-') + ', create one.');
					//node.send('node-red-aws-deploy-aws-ses-in-create-receipt-rule-set', msg, callback);

					var actions = [];

					node.wires.forEach(function(e, k, a) {
						e.forEach(function(v, k, a) {
							actions.push({ 
								SNSAction: {
					        		TopicArn: 'arn:aws:sns:us-east-1:631712212114:node-red-aws-node-' + v.replace('.', '-'), /* required */
					        		Encoding: 'UTF-8'
					        	}
					        });
						})					
					})

					async.each(actions, function(topic, asyncCallback2) {
						
						var params = {
						  	Name: topic.SNSAction.TopicArn.split(':')[5]
						};

						console.log('Creating SNS topic: ' + params.Name);

						sns.createTopic(params, function(err, data) {
							if (err) {

								msg.error('Create SNS topic error: ' + err, asyncCallback2);

							} else {
								console.log('Create SNS topic successfull.');
								asyncCallback2(err, data);
							}

						});

					}, function(err) {
						if (err) {

							msg.error('Error on create SNS topics: ' + err, asyncCallback);

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
							    Name: node.id.replace('.', '-'), /* required */
							    Actions: actions,
							    Enabled: true,
							    Recipients: [
							      node.recipient
							    ],
							    ScanEnabled: false
							  },
							  RuleSetName: activeReceiptRuleSet.Metadata.Name, /* required */
							};

							console.log('createReceiptRule: ' + JSON.stringify(params, null, 2));

							ses.createReceiptRule(params, function(err, data) {

								if (err) {

									msg.error('Error on create Receipt Rule: ' + err, ayncCallback1);

								} else {
									console.log('Create SES Receipt Rule successfull.');
									asyncCallback(err, data);	
								}
							  	
							});	

						}
					})

				} else {
					console.log('Rule found ' + node.id.replace('.', '-') + ', check if receipt is the same.');
				}
				
			}
			
		});

	}, function(err) {

		if (err) {
			msg.error(err, callback);
		} else {
			callback(err, 'Done.');	
		}

	})

}
