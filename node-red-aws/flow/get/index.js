"use strict";

var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB.DocumentClient();
 
exports.handler = function(event, context) {

	var params = {
		TableName : 'node-red-flow',
		Select: 'ALL_ATTRIBUTES'
	}

	dynamodb.scan(params, function(err, data) {

        if (err) {
            console.error(new Error('Error: ' + err.message));
            context.fail(new Error('Error: ' + err.message));
        } 

    	console.log('Found: ' + data.Count);
        context.done(null, data.Items);

    });  

}