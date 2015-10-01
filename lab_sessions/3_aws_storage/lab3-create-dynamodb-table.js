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

var params = {
  TableName: util.table_name, /* required */
  KeySchema: [ /* required */
    {
      AttributeName: 'NOMA', /* required */
      KeyType: 'HASH' /* required */
    },
    {
      AttributeName: 'Name', /* required */
      KeyType: 'RANGE' /* required */
    }
  ],
  GlobalSecondaryIndexes: [
        {
            IndexName: 'ByName',
            KeySchema: [
                {
                    AttributeName: 'Name',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 5
            }
        },

        {
            IndexName: 'ByNOMA',
            KeySchema: [
                {
                    AttributeName: 'NOMA',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 5
            }
        }
    ],
  AttributeDefinitions: [ /* required */
    {
      AttributeName: 'NOMA', /* required */
      AttributeType: 'N' /* required */
    },
    {
      AttributeName: 'Name', /* required */
      AttributeType: 'S' /* required */
    }
  ],
  ProvisionedThroughput: { /* required */
    ReadCapacityUnits: 10, /* required */
    WriteCapacityUnits: 5 /* required */
  },
};

var db = new AWS.DynamoDB();


db.createTable(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

var params = {
  TableName: util.table_name,
};
db.waitFor('tableExists', params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

db.listTables(function(err, data) {
  	if (err) console.log(err, err.stack); // an error occurred
  	else console.log(data.TableNames); // successful response
  });

