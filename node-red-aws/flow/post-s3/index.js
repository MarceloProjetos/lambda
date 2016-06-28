"use strict";

var aws = require('aws-sdk');
var s3 = new aws.S3();
 
exports.handler = function(event, context) {

	var params = {
		'Bucket': 'node-red-flow',
    	'Key': 'node-red-flows'
	}

	s3.putObject(params, function(err, data) {
        if (err) {
            context.fail(err);
        } 
        console.log('Successfully update flows.');
        context.done();

    });


}