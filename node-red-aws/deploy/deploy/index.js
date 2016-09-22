// dependencies
var aws = require('aws-sdk');
var async = require('async');
var _ = require('underscore');
var node = require('node-red-aws-node');
var message = require('node-red-aws-msg');
var unmarshal = require('dynamodb-marshaler').unmarshalItem;

var sns = new aws.SNS();

exports.handler = function(event, context, callback) {

	async.each(event.Records, function(record, callback) {
		var op = null;
		var n = null;

		switch(record.eventName) {
			case 'INSERT':
				op = 'node-inserted';
				n = unmarshal(record.dynamodb.NewImage);
				node.send('node-red-aws-deploy-' + n.type + '-' + op, n, callback);
				break;
			case 'MODIFY':
				op = 'node-changed';
				n = unmarshal(record.dynamodb.NewImage);
				var o = unmarshal(record.dynamodb.OldImage);
				if (n.id !== o.id || n.type !== o.type) {
					node.error('Node ID or TYPE was changed, this means an error on editor ?\nBefore: ' + JSON.stringify(o, null, 2) + '\nAfter: ' + JSON.stringify(n, null, 2), callback);
				} else {
					n._ = o;
					node.send('node-red-aws-deploy-' + n.type + '-' + op, n, callback);
				}
				break;
			case 'REMOVE':
				op = 'node-deleted';
				n = unmarshal(record.dynamodb.OldImage);
				node.send('node-red-aws-deploy-' + n.type + '-' + op, n, callback);
				break;
			default:
		}

		console.log('op: ' + op + ', type: ' + n.type);

	}, function(err) {
		callback(err, 'Done.');
	})

}

// Deal with Floats and Nulls coming in on the Stream
// in order to created a valid ES Body
// Otherwise just reformat into ES body
var convertBody = function(record){
  var values = record;
  var body = _.mapObject(values, function(val, key){
    var tuple = _.pairs(val)[0];
    var new_val = tuple[1];
    switch (tuple[0]) {
      case 'N':
      new_val = parseFloat(tuple[1]);
      break;
      case 'NULL':
      new_val = null;
      break;
    }
    return new_val;
  });
  return body;
};
