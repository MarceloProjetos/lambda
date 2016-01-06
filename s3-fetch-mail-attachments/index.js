"use strict";

var MailParser = require("mailparser").MailParser,
    encodinglib = require("encoding"),
    fs = require("fs");

var AWS = require('aws-sdk');
var s3 = new AWS.S3();


var source = 'email-waiting-to-process';
var destination = 'email-xml-attachment-files';
 
exports.handler = function(event, context) {
    console.log('Process email a');

    AWS.config.update({ "accessKeyId": "AKIAJIL7P6ZIPZCMC22Q", "secretAccessKey": "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", "region": "us-east-1" });

    var sesNotification = event.Records[0].ses;
    //console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));



    // Retrieve the email from your bucket
    s3.getObject({
            Bucket: source,
            Key: sesNotification.mail.messageId
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                context.fail();
            } else {

                //console.log("\n\n************************************* Email Raw Content ************************************* \n\n" + data.Body + "\n\n************************************* End Email Raw Content ************************************* \n\n");

                var mail = new Buffer(data.Body, "utf-8");

                console.log("mail length:"+mail.length);

                var mailparser = new MailParser({
                    streamAttachments: true
                });                

                for (var i = 0, len = mail.length; i < len; i++) {
                    mailparser.write(new Buffer([mail[i]]));
                }

                mailparser.end();

                mailparser.on("attachment", function(attachment, mail) {
                    console.log('\nProcessing attachment:'+ attachment.generatedFileName);
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


                //console.log("start to parse email");

                // Custom email processing goes here
                //var email = data.Body;
                /*var email = "From: 'Sender Name' <sender@example.com>\r\n"+
                            "To: 'Receiver Name' <receiver@example.com>\r\n"+
                            "Subject: Hello world!\r\n"+
                            "\r\n"+
                            "How are you today?";

                //console.log("mail to parse:"+email);

                var MailParser = require("mailparser").MailParser;
                var mailparser = new MailParser({
                    debug: false,
                    streamAttachments: false,
                    unescapeSMTP: false,
                    showAttachments: true
                });


                mailparser.on("headers", function(headers){
                    console.log(headers.received);
                });


                mailparser.on("end", function(mail){
                    mail; // object structure for parsed e-mail
                });


                // setup an event listener when the parsing finishes
                mailparser.on("end", function(mail) {
                    console.log("\n\n************************************* Start Parse Email ************************************* \n\n");
                    console.log("From:", mail.from); //[{address:'sender@example.com',name:'Sender Name'}]
                    console.log("Subject:", mail.subject); // Hello world!
                    console.log("Text body:", mail.text); // How are you today?
                    mail.attachments.forEach(function(attachment){
                        console.log("attachment:"+attachment.fileName);
                    });
                    console.log("\n\n************************************* End Parse Email ************************************* \n\n");
                });

                // send the email source to the parser
                mailparser.write(email);
                mailparser.end();
                */

                //var fs = require("fs");
                //fs.createReadStream("email.eml").pipe(mailparser);
                
            }
        
    });

    //mailparser.end();


    /*mail = "From: 'Sender Name' <sender@example.com>\r\n"+
                            "To: 'Receiver Name' <receiver@example.com>\r\n"+
                            "Subject: Hello world!\r\n"+
                            "\r\n"+
                            "How are you today?";*/

    

    //test.expect(1);
    //var mailparser = new MailParser();

    /*for (var i = 0, len = mail.length; i < len; i++) {
        mailparser.write(new Buffer([mail[i]]));
    }

    mailparser.end();

    var attachment = new AWS.S3({params: {
        Bucket: destination,
        Key: sesNotification.mail.messageId
    }});

    attachment.upload({ Body: mail}, function() {
          console.log("Successfully uploaded data to myBucket/myKey");
        });

    /*attachment.createBucket(function(err) {
      if (err) { console.log("Error:", err); }
      else {
        console.log("Bucket created");
      }
    });*/

    /*mailparser.on("end", function(mail) {
        //test.equal(mail.text, "ÕÄ\nÖÜ");
        //test.done();
        //mail.text;
        
        console.log(mail.text);
    });*/

    

};