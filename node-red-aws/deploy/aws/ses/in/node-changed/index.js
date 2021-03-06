"use strict";

var aws = require('aws-sdk');
var async = require('async');
var ses = new aws.SES();
var node = require('node-red-aws-node');
var message = require('node-red-aws-msg');

exports.handler = function(event, context, callback) {
	
	var msg = message.parse(event.Message);

	var params = {
	};

	// work only in active rule set
	ses.describeActiveReceiptRuleSet(params, function(err, data) {
		if (err) {

			node.error(err, callback);

		} else {     
			console.log(JSON.stringify(data, null, 2)); // successful response

			data.Rules.forEach(function(rule) {
				if (rule.Name === 0) { // default rule
				} else {
					rule.Recipients.forEach(function(recipient) {
						if (recipient === msg.recipient) {

							console.log('Found recipient, nothing to do here.');

							console.log(err, err.stack); // an error occurred

							node.debug('Found recipient, nothing to do here.', callback);
							//callback(err, 'Done, found recipient');
						}
					})
				}
			})
		}

		console.log('Not found rule, create one.');

		node.send('node-red-aws-deploy-aws-ses-in-create-receipt-rule-set', msg, callback);
	});
}

