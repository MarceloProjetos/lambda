"use strict";

var aws = require('aws-sdk');
var async = require('async');
var dynamodb = new aws.DynamoDB.DocumentClient();
 
exports.handler = function(event, context) {

	var params = {
		'TableName': 'node-red-flow',
    	'Item': ''
	}

	async.forEachOf(event, function(value, key, callback) {

		params.Item = value;

		dynamodb.put(params, function(err, data) {

            if (err) {
                callback(new Error("failed to put node:" + err.message));
            } 
                
            callback();
        });  

	}, function(err) {
        
        if (err) {
            console.error(new Error('Unable to update flows due to an error: ' + err.message));
            context.fail(new Error('Unable to update flows due to an error: ' + err.message));
        } 
            
        console.log('Successfully update flows.');
        context.done();
    });

}