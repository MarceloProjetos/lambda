"use strict";

var aws = require('aws-sdk');
var async = require('async');
var msg = require('node-red-aws-msg');

var ses = new aws.SES();

exports.handler = function(event, context, callback) {
	console.log('Event: ' + JSON.stringify(event, null, 2));
	
	var nodes = msg.parse(event);

	async.each(nodes, function(node, asyncCallback) {

		var params = {
		};
		
		// work only in active rule set
		ses.describeActiveReceiptRuleSet(params, function(err, activeReceiptRuleSet) {
			if (err) {

				msg.error('Error on describeActiveReceiptRuleSet: ' + err, asyncCallback);

			} else {     
				console.log('ActiveReceiptRuleSet: ' + JSON.stringify(activeReceiptRuleSet, null, 2)); // successful response

				var rule = activeReceiptRuleSet.Rules.find(function(rule, index, array) { return rule.Name === node.id.replace('.', '-'); });

				if (rule) {
					console.log('Rule found, delete one.');
					//node.send('node-red-aws-deploy-aws-ses-in-create-receipt-rule-set', msg, callback);

					var params = {
					  RuleName: rule.Name, /* required */
					  RuleSetName: activeReceiptRuleSet.Metadata.Name /* required */
					};

					console.log('deleteReceiptRule: ' + JSON.stringify(params, null, 2));

					ses.deleteReceiptRule(params, function(err, data) {

						if (err) {

							node.error('Error on deleteReceiptRule: ' + err, asyncCallback);

						} else {
							asyncCallback(err, data);	
						}
					  	
					});	

				} else {
					console.log('Rule not found ' + node.id.replace('.', '-') + ', nothing to delete.');
					asyncCallback(err, activeReceiptRuleSet);
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