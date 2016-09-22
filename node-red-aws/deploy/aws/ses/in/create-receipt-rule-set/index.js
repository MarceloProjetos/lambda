"use strict";

var aws = require('aws-sdk');
var async = require('async');
var ses = new aws.SES();
var node = require('node-red-aws-node');
var message = require('node-red-aws-msg');

exports.handler = function(event, context, callback) {
	
	var msg = message.parse(event);

	console.log('Message: ' + JSON.stringify(msg, null, 2));

	var params = {
	  Rule: { /* required */
	    Name: 'STRING_VALUE', /* required */
	    Actions: [
	        LambdaAction: {
	          FunctionArn: 'STRING_VALUE', /* required */
	          InvocationType: 'Event | RequestResponse',
	          TopicArn: 'STRING_VALUE'
	        },
	        S3Action: {
	          BucketName: 'STRING_VALUE', /* required */
	          KmsKeyArn: 'STRING_VALUE',
	          ObjectKeyPrefix: 'STRING_VALUE',
	          TopicArn: 'STRING_VALUE'
	        },
	        SNSAction: {
	          TopicArn: 'STRING_VALUE', /* required */
	          Encoding: 'UTF-8 | Base64'
	        }
	      },
	      /* more items */
	    ],
	    Enabled: true || false,
	    Recipients: [
	      msg.recipient,
	      /* more items */
	    ],
	    ScanEnabled: true || false,
	    TlsPolicy: 'Require | Optional'
	  },
	  RuleSetName: 'STRING_VALUE', /* required */
	  After: ''
	};

	ses.createReceiptRule(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});	

}
