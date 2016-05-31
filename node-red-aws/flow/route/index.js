"use strict";

var async = require('async');
var flow = require('node-red-aws-lambda-flow-module');

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // remove unused messages
    /*for(var i = event.Records.length - 1; i >= 0; i--) {
        if(!event.Records[i].EventSource === 'aws:sns') {
           event.Records.splice(i, 1);
        }
    }*/

	async.forEachOf(event.Records, function(record, key, callback) {

		flow.route(JSON.parse(record.Sns.Message), callback);

	}, function(err) {
	  if (err) {
	    context.fail(err);
	  }
	  context.done(null, { msg: 'Message dispatch successfully.'});          

	});

};
