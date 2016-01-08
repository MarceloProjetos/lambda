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

    /**
    * I encode the given S3 object key for use in a url. Amazon S3 keys have some non-
    * standard behavior for encoding - see this Amazon forum thread for more information:
    * https://forums.aws.amazon.com/thread.jspa?threadID=55746
    *
    * @output false
    */
    var urlDecodeS3Key = function ( key ) {
        console.log('Decoding key '+key);
        
        key = decodeURI( key, "utf-8" );
        // At this point, we have a key that has been encoded too aggressively by
        // ColdFusion. Now, we have to go through and un-escape the characters that
        // AWS does not expect to be encoded.
        // The following are "unreserved" characters in the RFC 3986 spec for Uniform
        // Resource Identifiers (URIs) - http://tools.ietf.org/html/rfc3986#section-2.3
        key = key.replace(/%2E/g, '.' );
        key = key.replace(/%2D/g, '-' );
        key = key.replace(/%5F/g, '_' );
        key = key.replace(/%7E/g, '~' );
        // Technically, the "/" characters can be encoded and will work. However, if the
        // bucket name is included in this key, then it will break (since it will bleed
        // into the S3 domain: "s3.amazonaws.com%2fbucket"). As such, I like to unescape
        // the slashes to make the function more flexible. Plus, I think we can all agree
        // that regular slashes make the URLs look nicer.
        key = key.replace(/%2F/g, '/' );
        // This one isn't necessary; but, I think it makes for a more attactive URL.
        // --
        // NOTE: That said, it looks like Amazon S3 may always interpret a "+" as a
        // space, which may not be the way other servers work. As such, we are leaving
        // the "+"" literal as the encoded hex value, %2B.
        key = key.replace(/%20/g, '+' );
        key = key.replace(/%3B/g, ';' );

        console.log('Decoded key is '+key);

        return( key );
    }

    // Retrieve the email from your bucket
    s3.getObject({
            Bucket: s3Notification.bucket.name,
            Key: urlDecodeS3Key(s3Notification.object.key)
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                context.fail('Parse ends with fail to get xml file from S3 bucket. Bucket:'+s3Notification.bucket.name+', Key:'+urlDecodeS3Key(s3Notification.object.key));
            } else {

                //console.log("\n\n************************************* Email Raw Content ************************************* \n\n" + data.Body + "\n\n************************************* End Email Raw Content ************************************* \n\n");

                //var xml = new Buffer(data.Body, "utf-8");

                console.log("\nXml length:"+data.Body.length);

                parseXml(data.Body, {mergeAttrs: true, explicitArray: false, emptyTag: 'null'}, function (err, xml) {
                    if (!err) {
                        if (xml != undefined && xml.nfeProc != undefined) {
                            
                            //console.log(JSON.stringify(nfe));
                            console.log('\nChave:'+xml.nfeProc.NFe.infNFe.Id+'\n');

                            var nfe = {
                                chave: xml.nfeProc.NFe.infNFe.Id,
                                versao: xml.nfeProc.versao,
                                nNF: xml.nfeProc.NFe.infNFe.ide.nNF,
                                dhEmi: xml.nfeProc.NFe.infNFe.ide.dhEmi,
                                dhSaiEnt: xml.nfeProc.NFe.infNFe.ide.dhSaiEnt,
                                natOp: xml.nfeProc.NFe.infNFe.ide.natOp,
                                dest: {
                                    CNPJ: xml.nfeProc.NFe.infNFe.dest.CNPJ,
                                    IE: xml.nfeProc.NFe.infNFe.dest.IE,
                                    xNome: xml.nfeProc.NFe.infNFe.dest.xNome
                                },
                                emit: {
                                    CNPJ: xml.nfeProc.NFe.infNFe.emit.CNPJ,
                                    IE: xml.nfeProc.NFe.infNFe.emit.IE,
                                    xNome: xml.nfeProc.NFe.infNFe.emit.xNome
                                } 
                            };    

                            console.log(JSON.stringify(nfe));                       

                            var response = dynamodb.put({
                             'TableName': tableName,
                             'Item': nfe
                            }, function(err, data) {
                                if (err) {
                                    context.fail(new Error('DynamoDB Put Error: ' + err));
                                } else {
                                    context.succeed("Successfully Inserted NFe XML");
                                }
                            });    
                        } else {
                             context.succeed("Not a XML NFe file, ignore.");
                        }
                        
                    } else {
                        context.fail(new Error('XML Parse Error: ' + err));
                    }
                    
                });

                /*
                var response = dynamo.putItem({
                    'TableName': tableName,
                    'Item': new Buffer(data.Body, "utf-8")
                }, function(err, data) {
                    if (err) {
                        context.fail(new Error('Error ' + err));
                    } else {
                        context.succeed("Successfully Inserted");
                    }
                });
                */           
            }
        
    });

};


