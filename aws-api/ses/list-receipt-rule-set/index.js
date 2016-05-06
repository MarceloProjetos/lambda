"use strict";

var aws = require('aws-sdk');
var ses = new aws.SES();
 
exports.handler = function(event, context, callback) {

    //aws.config.update({ "accessKeyId": "AKIAJCB5PG7MBNKVUQAQ", "secretAccessKey": "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", "region": "us-east-1" });

    //console.log('\nstart...\ncontext: ' + JSON.stringify(context)+ '\n\n');

	var params = {
	  NextToken: null
	};

	ses.listReceiptRuleSets(params, function(err, data) {

		if (err) {
			console.log(err, err.stack); // an error occurred
			context.fail(err);
		} else {
			console.log(data);           // successful response
			context.succeed(data);
		}
		
		context.done('Ok');
	});

}