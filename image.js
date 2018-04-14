const aws = require('aws-sdk');

/*const rekognition = new aws.Rekognition();
var params = {
  Image: {
    S3Object: {
      Bucket: "sinis",
      Name: "impossibly-cute-puppy-2.jpg"
    }
  },
  MaxLabels: 123,
  MinConfidence: 70
};
rekognition.detectLabels(params, (err, data) => {
  if (err) console.log(err, err.stack); // an error occurred
  else console.log(data); // successful response
  data = {
   Labels: [
      {
     Confidence: 99.25072479248047, 
     Name: "People"
    }, 
      {
     Confidence: 99.25074005126953, 
     Name: "Person"
    }
   ]
  }
  
});*/


module.exports.requestUploadURL = (event, context, callback) => {
  var s3 = new aws.S3();
  var params = JSON.parse(event.body);
  console.log('parms', params);

  var s3Params = {
    Bucket: 's3bucketbiologg',
    Key: params.name,
    ContentType: params.type,
    ACL: 'public-read',
  };

  var uploadURL = s3.getSignedUrl('putObject', s3Params);

  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ uploadURL: uploadURL }),
  })
}
