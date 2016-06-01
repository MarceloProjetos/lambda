"use strict";

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();
var sns = new AWS.SNS();

var async = require('async');
var flow = require('node-red-aws-lambda-flow-module');
var MailParser = require("mailparser").MailParser;

var body_bucket = 'node-red-aws-lambda-mail-parser-body';
var attachments_bucket = 'node-red-aws-lambda-mail-parser-attachment';

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
	        function parse(email, next) {

	            var mailparser = new MailParser({
	                streamAttachments: true
	            });                

	            for (var i = 0, len = email.Body.length; i < len; i++) {
	                mailparser.write(new Buffer([email.Body[i]]));
	            }

	            mailparser.end();

	            // work on streaming (streamAttachments: true)
	            mailparser.on("attachment", function(attachment) {
	                console.log('\nProcessing attachment:'+ JSON.stringify(attachment, null, 2));

	                var file = {
	                    Bucket: attachments_bucket,
	                    Key: attachment.generatedFileName,
	                    Body: attachment.stream
	                };

	                s3.putObject(file, function(err, res) {
	                	if (err) {
	                		console.log('Save attachment error: [', attachments_bucket, ']: ', err);
	                	} else {
	                		console.log('Save attachment successfully: ', attachments_bucket, attachment.generatedFileName);
	                	}
	                    next(err);
	                });
	            });

	            // work on buffered (streamAttachments: false)
	            mailparser.on("end", function(mail){
	                console.log("\n************************************* Start Email Parse *************************************\n");
	                console.log("From:", mail.from); //[{address:'sender@example.com',name:'Sender Name'}]
	                console.log("Subject:", mail.subject); // Hello world!
	                //console.log("Text body:", mail.text); // How are you today?
	                console.log("\n************************************* End Email Parse *************************************\n");
	            });   

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
