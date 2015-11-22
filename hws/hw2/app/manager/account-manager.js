var crypto 		= require('crypto');
var moment 		= require('moment');
var app = require('../app');

var collectionName = "Users";
var getUser = "SELECT * FROM twitter.Users WHERE username=?";

var insertUser = "INSERT INTO twitter.Users (username, name, pass) " 
            + "VALUES(?, ?, ?);";

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	app.db.execute(getUser, [ user ], function(e, result) {
		if (result.rows.length > 0) {
			var o = result.rows[0];
			o.pass == pass ? callback(o) : callback(null);
			app.timelineState = -1;
		}
		else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	app.db.execute(getUser, [ user ], function(e, result) {
		if (result.rows.length == 0){
			callback('user-not-found');
		}
		else{
			var o = result.rows[0];
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
					app.timelineState = -1;
					console.log("Successful!")
				}
				else {
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */
exports.addNewAccount = function(newData, callback)
{
	app.db.execute(getUser, [newData.username], function(e, result){
		if (result.rows.length > 0){
			callback('username-taken');
		}
		else{
			saltAndHash(newData.pass, function(hash){
				newData.pass = hash;
				app.db.execute(insertUser, [newData.username, '', newData.pass], callback);
			});
		}
	});
}

/* Return Following, Followers */

exports.getFollowers = function(username, callback) {
	// HINT:
	// Query the DB to obtain the list of followers of user identified by username
	// If the query is successful:
	// Invoke callback(null, followers) where followers is a list of usernames
	// If the query fails:
	// Invoke callback(e, null)
}

exports.getFollowing = function(username, callback) {
	// HINT:
	// Query the DB to obtain the list of followings account of user identified by username
	// If the query is successful:
	// Invoke callback(null, follows) where follows is a list of persons that are followed by the username
	// If the query fails:
	// Invoke callback(e, null)
}

/* Follow user */

exports.follow = function(follower, followed, callback)
{
	// HINT:
	// Query the DB to insert the new connection (following relation)
	// from user identified by follower and the user identified by followed
	// If the query is successful:
	// Invoke callback(null, follow) where follow is the username of person who is followed by follower
	// If the query fails:
	// Invoke callback(e, null)
}

/* Unfollow user */

exports.unfollow = function(follower, followed, callback)
{
	// HINT:
	// Query the DB to delete the existing connection (following relation)
	// from user identified by follower and the user identified by followed
	// If the query is successful:
	// Invoke callback(null, follow) where follow is the username of person who is followed by follower
	// If the query fails:
	// Invoke callback(e, null)
}


/* is Following */

exports.isFollowing = function(follower, followed, callback)
{
	// HINT:
	// Query to check if there is the following relation between two accounts.
	// If the query is successful:
	// Invoke callback(null, follow) where follower is the username of person who follows another one.
	// If the query fails:
	// Invoke callback(e, null)
}


/* get User tweets */

exports.getUserTimelines = function(username, callback) {
	// HINT:
	// Query to get all the tweets from the followed accounts of a user indentified by username.
	// If the query is successful:
	// Invoke callback(null, tweets) where tweets are the feed from all followed accounts.
	// If the query fails:
	// Invoke callback(e, null)
}

exports.getUserlines = function(username, callback) {
	// HINT:
	// Query to get all the tweets from the an account indentified by username.
	// If the query is successful:
	// Invoke callback(null, tweets) where tweets are all the tweet of the account identified by username.
	// If the query fails:
	// Invoke callback(e, null)
}

/* get User tweets */

exports.getUserInfo = function(username, callback) {
	// HINT:
	// Query to get information of a user indentified by username.
	// If the query is successful:
	// Invoke callback(null, userinfo).
	// If the query fails:
	// Invoke callback(e, null)
}

/* private encryption & validation methods */

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

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}
