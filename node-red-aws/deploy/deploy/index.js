// dependencies
var aws = require('aws-sdk');
var async = require('async');
var msg = require('node-red-aws-msg');
var unmarshal = require('dynamodb-marshaler').unmarshalItem;

var sns = new aws.SNS();

exports.handler = function(event, context, callback) {
	console.log('Event: ' + JSON.stringify(event, null, 2));
	
	var records = msg.parse(event);

	async.each(records, function(record, asyncCallback) {
		var op = null;
		var node = null;

		switch(record.eventName) {
			case 'INSERT':
				op = 'node-inserted';
				node = unmarshal(record.dynamodb.NewImage);
				msg.send('node-red-aws-deploy-' + node.type + '-' + op, node, asyncCallback);
				break;
			case 'MODIFY':
				op = 'node-changed';
				node = unmarshal(record.dynamodb.NewImage);
				var old = unmarshal(record.dynamodb.OldImage);
				if (node.id !== old.id || node.type !== old.type) {
					msg.error('Node ID or TYPE was changed, this means an error on editor ?\nBefore: ' + JSON.stringify(old, null, 2) + '\nAfter: ' + JSON.stringify(node, null, 2), asyncCallback);
				} else {
					node._old = old;
					msg.send('node-red-aws-deploy-' + node.type + '-' + op, node, asyncCallback);
				}
				break;
			case 'REMOVE':
				op = 'node-deleted';
				node = unmarshal(record.dynamodb.OldImage);
				msg.send('node-red-aws-deploy-' + node.type + '-' + op, node, asyncCallback);
				break;
			default:
		}

		console.log('op: ' + op + ', type: ' + node.type);

	}, function(err) {

		if (err) {
			msg.error(err, callback);
		} else {
			callback(err, 'Done.');	
		}

	})

}
