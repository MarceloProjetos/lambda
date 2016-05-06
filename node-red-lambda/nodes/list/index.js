"use strict";

var aws = require('aws-sdk');
var ses = new aws.SES();
 
exports.handler = function(event, context) {

    //aws.config.update({ "accessKeyId": "AKIAJCB5PG7MBNKVUQAQ", "secretAccessKey": "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", "region": "us-east-1" });

    //console.log('\nstart...\ncontext: ' + JSON.stringify(context)+ '\n\n');

	var data = [
				   {
				      "type":"tab",
				      "id":"c60520c0.7b35b",
				      "label":"Fluxo Novo"
				   },
				   {
				      "id":"fb2d5585.da75",
				      "type":"inject",
				      "z":"c60520c0.7b35b",
				      "name":"",
				      "topic":"",
				      "payload":"",
				      "payloadType":"date",
				      "repeat":"",
				      "crontab":"",
				      "once":false,
				      "x":126.5,
				      "y":95,
				      "wires":[
				         [
				            "96c9ecb5.1f1b8"
				         ]
				      ]
				   },
				   {
				      "id":"96c9ecb5.1f1b8",
				      "type":"debug",
				      "z":"c60520c0.7b35b",
				      "name":"",
				      "active":true,
				      "console":"false",
				      "complete":"false",
				      "x":423.49998474121094,
				      "y":143.1999969482422,
				      "wires":[

				      ]
				   }
				];

	/*
	var params = {};

	ses.describeActiveReceiptRuleSet (params, function(err, data) {

		if (err) {
			console.log(err, err.stack); // an error occurred
			context.fail(err);
		} else {
			console.log(data);           // successful response
			context.succeed(data);
		}
		
		context.done('Ok');
	});
	*/

	context.succeed(data);

}