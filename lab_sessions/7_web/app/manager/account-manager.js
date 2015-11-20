var crypto = require('crypto');
var moment = require('moment');
var app = require('../app');

var collectionName = "Users";
var getUser = "SELECT * FROM twitter.Users WHERE username=?";

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
    // TUTORIAL: demonstrate this
}

exports.manualLogin = function(user, pass, callback)
{
    // TUTORIAL: demonstrate this
}

/* record insertion, update & deletion methods */
exports.addNewAccount = function(newData, callback)
{
    
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
