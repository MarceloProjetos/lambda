"use strict";

var sig = require('amazon-s3-url-signer');

var source = 'nfe-xml';
var destination = 'email-xml-attachment-files';
var tableName = 'nfe';
 
exports.handler = function(event, context) {
    console.log('\Signing xml url...');

    var bucket = sig.urlSigner('AKIAJIL7P6ZIPZCMC22Q', '2Q6jyWBWKYPWtVDBPCL0oHd5weRTh7zb4QTcofgU');

    var url = bucket.getUrl('GET', event.key, source, 10); //url expires in 10 minutes
    //var url2 = bucket2.getUrl('PUT', '/somedir/somefile.png', 'mybucketonotheraccount', 10); //url expires in 100 minutes

    context.succeed('Signed URL:'+url);

};


