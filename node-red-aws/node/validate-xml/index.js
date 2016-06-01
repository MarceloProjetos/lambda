"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

var async = require('async');
var flow = require('node-red-aws-lambda-flow-module');
var libxmljs = require("libxmljs");

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

	async.forEachOf(event.Records, function(record, key, callback) {

	    var message = JSON.parse(record.Sns.Message);

	    async.waterfall([
	        function get(next) {

	        	var params = {
	        		Bucket: message.payload.bucket, 
	        		Key: decodeURI(message.payload.key)
	        	};

	            s3.getObject(params, function(err, data) {
	                next(err, data);
	            });
	        },
	        function parse(xml, next) {

				var xsd = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:element name="comment" type="xs:string"/></xs:schema>';
				var xml_valid = '<?xml version="1.0"?><comment>A comment</comment>';
				var xml_invalid = '<?xml version="1.0"?><commentt>A comment</commentt>';

				var xsdDoc = libxml.parseXml(xsd);
				var xmlDocValid = libxml.parseXml(xml_valid);
				var xmlDocInvalid = libxml.parseXml(xml_invalid);

				assert.equal(xmlDocValid.validate(xsdDoc), true);
				assert.equal(xmlDocInvalid.validate(xsdDoc), false);

	        }
	    ], function(err) {
	        callback(err);
	    });

	}, function(err) {
	  if (err) {
	    context.fail(err);
	  }
	  context.done(err);          

	});

};
