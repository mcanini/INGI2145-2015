// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Import dynamoDB commons
var util = require('./lab3-commons')

/**
 * Don't hard-code your credentials!
 * Export the following environment variables instead:
 *
 * export AWS_ACCESS_KEY_ID='AKID'
 * export AWS_SECRET_ACCESS_KEY='SECRET'
 */

// Set your region for future requests.
AWS.config.region = 'us-west-2';

console.log(AWS.config.credentials);

var db = new AWS.DynamoDB();

db.deleteTable({"TableName":util.table_name}, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
