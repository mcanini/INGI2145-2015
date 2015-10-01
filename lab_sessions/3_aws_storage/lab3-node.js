// npm install aws-sdk
// npm install mc

var http = require('http');

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk'); // Docs at http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html

// Import dynamoDB commons
var util = require('./lab2-commons')

// memached node api
var mc = require('mc');

// Import request parser
var url_parser = require('url')


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

//Create db object (used for sending db commands)
var db = new AWS.DynamoDB();

//List of attributes to retrieve from table (relevant for query operations)
var list_of_attributes = ["NOMA", "Name", "Email", "UserAWS"];

//Determines whether or not a caching node will be utilized ('false' indicates that only dynamodb will be used)
var caching_mode = false;

//Commands you should test out:
//- Querying for a specific student by id or name
//- Retrieve all items from table
//- Adding attribute "ProgName" to all items
//- Deleting a specific student

// Available GET commands:
// --> /query?id=<NOMA>
// --> /query?name=<NAME>
// --> /list
// --> /set?attr=<ATTR NAME>&value=<VALUE>
// --> /unenroll?id=<NOMA>

//Handles any requests sent to the server
function onRequest(req, res) {
  //Ignores redundant requests from the browser
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  
  console.log("<--Request received");

  //parse request
  parsed_request = url_parser.parse(req.url, true);

  //handle request and performs necessary operations
  util.handle_request(db, parsed_request, res, list_of_attributes, caching_mode);
  
  console.log("-->Response sent");
  res.writeHead(200, {'Content-Type': 'text/plain', 'Transfer-Encoding': 'chunked'});
}

//connect to local memcached node
MemcacheClient = new mc.Client("localhost:11211", mc.Adapter.json);
MemcacheClient.connect(function() {
		console.log("Connected to local memcached node");
});

//create node.js server
http.createServer(onRequest).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');

