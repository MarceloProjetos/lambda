"use strict";

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var MailParser = require("mailparser").MailParser;

var source = 'email-waiting-to-process';
var destination = 'email-xml-attachment-files';
 
exports.handler = function(event, context) {
    console.log('\nProcess email attachments...');

    AWS.config.update({ "accessKeyId": "AKIAJIL7P6ZIPZCMC22Q", "secretAccessKey": "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", "region": "us-east-1" });

    var sesNotification = event.Records[0].ses;
    //console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));

    // Retrieve the email from your bucket
    s3.getObject({
        Bucket: source,
        Key: decodeURI(sesNotification.mail.messageId)
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            context.fail('Parse ends with fail to get mail file from S3 bucket.\nMessageId:'+decodeURI(sesNotification.mail.messageId));
        } else {

            //console.log("\n\n************************************* Email Raw Content ************************************* \n\n" + data.Body + "\n\n************************************* End Email Raw Content ************************************* \n\n");

            //var mail = new Buffer(data.Body, "utf-8");

            console.log("\nMail length:"+data.Body.length);

            var mailparser = new MailParser({
                streamAttachments: false
            });                

            for (var i = 0, len = data.Body.length; i < len; i++) {
                mailparser.write(new Buffer([data.Body[i]]));
            }

            mailparser.end();

            // work on streaming (streamAttachments: true)
            mailparser.on("attachment", function(attachment, mail) {
                console.log('\nProcessing attachment:'+ JSON.stringify(attachment));
                var data = {
                    Bucket: destination,
                    Key: attachment.generatedFileName,
                    Body: attachment.stream
                };

                s3.putObject(data, function(err, res) {
                    err && console.log('Erro:'+err);
                    context.succeed("OK");
                });
            });

            // work on buffered (streamAttachments: false)
            mailparser.on("end", function(mail){
                console.log("\n************************************* Start Email Parse *************************************\n");
                console.log("From:", mail.from); //[{address:'sender@example.com',name:'Sender Name'}]
                console.log("Subject:", mail.subject); // Hello world!
                //console.log("Text body:", mail.text); // How are you today?
                mail.attachments.forEach(function(attachment) {

                    console.log('\nProcessing attachment:'+ attachment.fileName);
                    console.log('contentType:'+ attachment.contentType);
                    console.log('fileName:'+ attachment.fileName);
                    console.log('contentDisposition:'+ attachment.contentDisposition);
                    console.log('contentId:'+ attachment.contentId);
                    console.log('transferEncoding:'+ attachment.transferEncoding);
                    console.log('length:'+ attachment.length);
                    console.log('generatedFileName:'+ attachment.generatedFileName);
                    console.log('checksum:'+ attachment.checksum);

                    if ((attachment.contentType == 'application/octet-stream' && 
                            (attachment.fileName.match(/.xml/i) || !attachment.fileName.match(/.pdf/i))) || 
                        (attachment.contentType == 'application/xml' ||
                        attachment.contentType == 'text/xml' ||
                        attachment.contentType == 'text/plain' ||
                        attachment.fileName.match(/.xml/i))) {

                        console.log('\nSend attachment to S3:'+ attachment.fileName);

                        var data = {
                            Bucket: destination,
                            Key: sesNotification.mail.messageId + '/' + attachment.fileName,
                            Body: attachment.content
                        };

                        s3.putObject(data, function(err, res) {
                            err && console.log('Erro:'+err);
                            context.succeed("\nParse ends sucessfull !");
                        });
                    } else {
                        console.log('\nNot a XML file:'+ attachment.fileName);
                    }
                });
                console.log("\n************************************* End Email Parse *************************************\n");
            });   
        }        
    });
};