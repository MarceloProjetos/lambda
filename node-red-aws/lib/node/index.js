"use strict";

var aws = require('aws-sdk');
var sns = new aws.SNS();
var lambda = new aws.Lambda();

module.exports = {
	error: function(err, callback) {
		console.log('Error: ' + err, err.stack); // an error occurred

		var message = {
        	default: JSON.stringify(err)
        };

        const params = {
			Message: JSON.stringify(message),
			MessageStructure: 'json',
			TopicArn: 'arn:aws:sns:us-east-1:631712212114:node-red-aws-deploy-error' 
		}

		sns.publish(
			params, 
			function(err, data) {
				if (!err) {
					console.log('\Successfully dispatch SNS message to ' + params.TopicArn + ':\n', JSON.stringify(message, null, 2)); // successful response
				}
	        	if (callback) callback(err, data);
	    	}
	    );
	},
	debug: function(msg, callback) {
		var context = this;

		var message = {
        	default: JSON.stringify(msg)
        };

        const params = {
			Message: JSON.stringify(message),
			MessageStructure: 'json',
			TopicArn: 'arn:aws:sns:us-east-1:631712212114:node-red-aws-deploy-debug' 
		}

		sns.publish(
			params, 
			function(err, data) {
				if (err) {
					context.error(err, callback);
				} else {
					console.log('\Successfully dispatch SNS message to ' + params.TopicArn + ':\n', JSON.stringify(message, null, 2)); // successful response
		        	if (callback) callback(err, data);
				}
	    	}
	    );		
	},
	send: function(topic, msg, callback) {
		var context = this;

		var message = {
        	default: JSON.stringify(msg)
        };

        const params = {
			Message: JSON.stringify(message),
			MessageStructure: 'json',
			TopicArn: 'arn:aws:sns:us-east-1:631712212114:' + topic 
		}

		sns.publish(
			params, 
			function(err, data) {
				if (err) {
					context.error(err, callback);
				} else {
					console.log('\Successfully dispatch SNS message to ' + params.TopicArn + ':\n', JSON.stringify(message, null, 2)); // successful response
		        	if (callback) callback(err, data);
				}
	    	}
	    );
	},
	call: function(f, msg, callback) {
		lambda.invoke({
			FunctionName: f,
			Payload: JSON.stringify(msg) // pass params
			}, function(err, data) {
				if (callback) callback(err, data);
			}
		);	
	},
	showConfig: function() {
		console.log(JSON.stringify(aws.config, null, 2));
	}
}