var app = require('../app');
var uuid = require('node-uuid');
var async = require('async');

var collectionName = "Tweets";

var upsertTweet = 'INSERT INTO twitter.Tweets (tweetid, author, created_at, body) '
    + 'VALUES(?, ?, ?, ?);';

var openCollection = function(callback) {
    app.db.collection(collectionName, callback);
}

/* add a tweet*/
exports.newTweet = function(data, callback)
{
    data.created_at = new Date();
    data.tweetid = uuid.v1();

    // HINT:
    // The data object at this point contains the new tweeet
    // It has these attributes:
    // - created_at
    // - tweetid
    // - username
    // - name <- this is the fullname of username
    // - body
    
    // Need to initiate the process that will insert the tweet into the database
    // and process the tweet for the analytics. These can run in parallel, hence
    // we suggest you use async.parallel.
    // This function in the end must call callback(err, data)
    
    async.parallel([

    ], function (err, results) { callback(err, data); });
}
