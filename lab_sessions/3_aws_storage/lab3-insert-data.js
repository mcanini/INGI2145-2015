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

// open a json file
fs = require('fs');
fs.readFile('students.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  parsedJSON = JSON.parse(data);
  prepareJSON(parsedJSON);  //Formats it for DynamoDB compliance
  pushToDynamo(parsedJSON); //Pushes the insert operations to DynamoDB
  //console.log(parsedJSON);
});

function prepareJSON(data)
{
    var arrayLength = data.length
  	for (var i = 0; i < arrayLength; i++) {
	   data[i] = {"NOMA":{"N":data[i][1].toString()}, "Name": {"S":data[i][0]}, "Email": {"S":data[i][2]}, "AWSuser": {"S":data[i][3]}}
	 }
}

function pushToDynamo(table)
{
    var db = new AWS.DynamoDB();
    var arrayLength = table.length;
	for (var i = 0; i < arrayLength; i++) {
	db.putItem({"TableName":util.table_name, "Item":table[i]}, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log("[RECORD INSERTED]");           // successful response
	});
	}
}
