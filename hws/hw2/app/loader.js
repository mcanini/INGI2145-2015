var bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');
var async = require('async');
var uuid = require('node-uuid');
var fs = require('fs');
var byline = require('byline');
var crypto    = require('crypto');

var client = new cassandra.Client( { contactPoints : [ '127.0.0.1' ] } );
client.connect(function(err, result) {
    console.log('Connected.');
});

async.series([
    function connect(next) {
        client.connect(next);
    },
    function dropKeyspace(next) {
        var query = "DROP KEYSPACE IF EXISTS twitter;";
        client.execute(query, next);
    },
    function createKeyspace(next) {
        var query = "CREATE KEYSPACE IF NOT EXISTS twitter WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3' };";
        client.execute(query, next);
    },
    function createUserTable(next) {
        var query = 'CREATE TABLE IF NOT EXISTS twitter.Users (' + 
                    'username varchar PRIMARY KEY,' + 
                    'name text,' + 
                    'pass text);';
        client.execute(query, next);
    },

    /////////
    // HINT: CREATE ALL YOUR OTHER TABLES HERE
    /////////

    function insertUsers(next)
    {        
        /* private encryption & validation methods */
        // To insert same password "test" for all the users
        var generateSalt = function()
        {
            var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
            var salt = '';
            for (var i = 0; i < 10; i++) {
                var p = Math.floor(Math.random() * set.length);
                salt += set[p];
            }
            return salt;
        }
        
        var md5 = function(str) {
            return crypto.createHash('md5').update(str).digest('hex');
        }
        
        var saltAndHash = function(pass, callback)
        {
            var salt = generateSalt();
            callback(salt + md5(pass + salt));
        }
        
        var upsertUser = 'INSERT INTO twitter.Users (username, name, pass) '
            + 'VALUES(?, ?, ?);';

        var u = byline(fs.createReadStream(__dirname + '/users.json'));
     
        u.on('data', function(line) {
            try {
                var obj = JSON.parse(line);
                saltAndHash("test", function(pass) {
                    obj.pass = pass;
                    client.execute(upsertUser,
                        [obj.username, obj.fullname, obj.pass],
                        afterExecution('Error: ', 'User ' + obj.username + ' upserted.'));
                    for (var i in obj.followers) {

        /////////
        // HINT: UPDATE USER RELATIONS TO USERS FOLLOWED BY USER obj
        /////////

                    }
                });
            } catch (err) {
                console.log("Error:", err);
            }
        });
        u.on('end', next);
    },
    function insertTweet(next)
    {        
        var upsertTweet = 'INSERT INTO twitter.Tweets (tweetid, author, created_at, body) '
            + 'VALUES(?, ?, ?, ?);';

        var t = byline(fs.createReadStream(__dirname + '/sample.json'));

        t.on('data', function(line) {
        try {
            var obj = JSON.parse(line);
            obj.tweetid = uuid.v1();
            obj.created_at = new Date(Date.parse(obj.created_at));
            client.execute(upsertTweet,
                    [obj.tweetid, obj.username, obj.created_at, obj.text],
                    afterExecution('Error: ', 'Tweet ' + obj.tweetid + ' upserted.'));

    /////////
    // HINT: UPDATE TIMELINES CONTAINING TWEET obj
    /////////

        } catch (err) {
            console.log("Error:", err);
        }
        });
        t.on('end', next);        
    }
], afterExecution('Error: ', 'Tables created.'));

function afterExecution(errorMessage, successMessage) {
    return function(err, result) {
        if (err) {
            return console.log(errorMessage + err);
        } else {
            return console.log(successMessage);
        }
    }
}

