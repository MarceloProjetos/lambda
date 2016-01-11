"use strict";

var AWS = require('aws-sdk');
var s3 = new AWS.S3();

exports["General tests"] = {
    "AWS test": function(test) {

        AWS.config.update({ "accessKeyId": "AKIAJIL7P6ZIPZCMC22Q", "secretAccessKey": "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", "region": "us-east-1" });

        var bucketName = 'email-waiting-to-process';

        //var sesNotification = event.Records[0].ses;
        //console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));
        var messageId = "v3vkiegm2oc9gvc1l0ljgfi8rsv51idi3htehlg1";

        // Retrieve the email from your bucket
        s3.getObject({
                Bucket: bucketName,
                Key: messageId
            }, function(err, data) {
                if (err) {
                    console.log(err, err.stack);

                } else {
                    //console.log("\n\n************************************* Email Raw Content ************************************* \n\n" + data.Body + "\n\n************************************* End Email Raw Content ************************************* \n\n");

                    console.log('Do something here');

                }
            }

        );

         test.done();
    }
}