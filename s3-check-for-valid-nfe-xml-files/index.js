"use strict";

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
var parseXml = require('xml2js').parseString;

var source = 'email-waiting-to-process';
var destination = 'email-xml-attachment-files';
var tableName = 'nfe';
 
exports.handler = function(event, context) {
    console.log('\nProcess xml attachments...');

    AWS.config.update({ "accessKeyId": "AKIAJIL7P6ZIPZCMC22Q", "secretAccessKey": "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", "region": "us-east-1" });

    var s3Notification = event.Records[0].s3;
    //console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));

    // Retrieve the email from your bucket
    s3.getObject({
            Bucket: s3Notification.bucket.name,
            Key: s3Notification.object.key
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                context.fail('Parse ends with fail to get xml file from S3 bucket.');
            } else {

                //console.log("\n\n************************************* Email Raw Content ************************************* \n\n" + data.Body + "\n\n************************************* End Email Raw Content ************************************* \n\n");

                var xml = new Buffer(data.Body, "utf-8");

                console.log("\nXml length:"+data.Body.length);

                parseXml(xml, {mergeAttrs: true, explicitArray: false, emptyTag: 'null'}, function (err, nfe) {
                    if (!err && nfe.nfeProc != undefined) {
                        //console.log(JSON.stringify(nfe));
                        console.dir('Chave:'+nfe.nfeProc.NFe.infNFe.Id);
                        nfe.chave = nfe.nfeProc.NFe.infNFe.Id;

                        var response = dynamodb.put({
                         'TableName': tableName,
                         'Item': nfe
                        }, function(err, data) {
                            if (err) {
                                context.fail(new Error('Error ' + err));
                            } else {
                                context.succeed("Successfully Inserted NFe XML");
                            }
                        });
                    } else {
                        console.log("Erro:"+err);
                    }
                    
                });

                /*var response = dynamo.putItem({
                 'TableName': tableName,
                 'Item': new Buffer(data.Body, "utf-8")
                }, function(err, data) {
                    if (err) {
                        context.fail(new Error('Error ' + err));
                    } else {
                        context.succeed("Successfully Inserted");
                    }
                });     */           
            }
        
    });

};