"use strict";

var AWS = require('aws-sdk');
//var dynamodb = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();
var attr = require("dynamodb-data-types").AttributeValue;

var async = require('async');

exports.handler = function(payload, context) {
	//async.forEachOf(event.Records, function(record, key, callback) {
		async.waterfall([
	        function get(next) {
	        	//{"label":"Flow 1","id":"50a547c4.0c60b8","type":"tab"}

	        	payload.tryNull = null;
	        	payload["asdadas asdasda"] = 1;
	        	
	        	// test path type
	        	payload["rh.ferias"] = {
	        		"data inicial": null,
	        		"data final": "2016-08-19T00:18Z"
	        	};

	        	var params = { 
	        		"TableName": 'nodes',
                    "Item": attr.wrap(payload)
                } 
	        	dynamodb.putItem(params, function(err, data) {
	        		if (err) {
	        			console.log(err);
	        		} else {
	        			console.log('success:\n' + JSON.stringify(attr.wrap(payload), null, 2));	
	        		}

	        		for (var key in payload) {
	        			if (payload.hasOwnProperty(key)) {
	        				console.log('key: ' + key)
	        				for (var t in payload[key]) {
	        					if (key.hasOwnProperty(t)) {
	        						console.log('type: ' + t)
	        					}
	        				}
	        			}
	        		}
	        		
	                //next(err);
	            });
	        }
		]);
	/*}, function(err) {
        context(err);
	} */
	
}
