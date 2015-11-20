var express = require('express');
var assert = require('assert');
var app = require('./app.js');
var ejs = require('ejs');
var fs = require('fs');
var AM = require('./manager/account-manager.js');
var TM = require('./manager/tweet-manager.js');
var fs = require('fs');
var kafka = require('kafka-node');
var formidable = require('formidable');
var router = express.Router();
var AWS = require('aws-sdk');
// AWS.config.loadFromPath('./awsCredentials.json');

////////////////////////////////////////////////////////////////////////////////

// NOTE(norswap): This method is necessary because, annoyingly, EJS does not
//  support dynamic includes (including a file whose name is passed via the
//  dictionary -- it has to be hardcoded in the template instead).
function render(res, dict) {
    fs.readFile('views/'+ dict.partial + '.ejs', 'utf-8', function(err, data) {
        assert(!err);
        dict.partial = ejs.render(data, dict);
        res.render('template', dict);
    });
}

////////////////////////////////////////////////////////////////////////////////
// Login page

router.get('/', function(req, res) {
    res.render('template', {'title': 'twitterclone - Connection'});
});

router.get('/connection', function(req, res) {
    res.render('connection', {});
});

////////////////////////////////////////////////////////////////////////////////
// Login / Logout

router.post('/validate', function(req, res) {
    if (    req.param('username').length > 20 || req.param('username').length < 4  
        || !req.param('username').match("^([-_A-z0-9]){3,}$")
        ||  req.param('pass').length > 20 || req.param('pass').length < 4 ) {
            res.status(403).send("Informations entered are incompletes!").end();
            return;
    }
    // attempt manual login & open collection Users
    AM.manualLogin(req.param('username'), req.param('pass'), function(e, o) {
        if (!o) {
            if (e == 'user-not-found')
                res.status(403).send("User not found").end();
            else if (e == 'invalid-password')
                res.status(403).send("Password not match").end();
            else
                res.status(403).send("Unexpected Error").end();
        } else {
            req.session.user = o;
            res.status(200).send().end();
        }
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.status(200).send( "disconnected").end();
    });
});

router.get('/isConnected', function(req, res) {
    if (req.session.user != null) {
        res.status(200).send( "true").end();
    } else {
        res.status(200).send( "false").end();
    }
});

////////////////////////////////////////////////////////////////////////////////
// Subscription

router.post('/validateSubscription', function(req, res) {
    //Verify informations
    var username = req.param('username');
    var fullname = req.param('fullname');
    var pass = req.param('pass');
    if (    username.length > 20 || username.length < 4  || !username.match("^([-_A-z0-9]){3,}$")
        ||  fullname.length > 20 || fullname.length < 4 || !fullname.match("^([- _A-z0-9]){3,}$")
        ||  pass.length > 20 || pass.length < 4 ) {
            res.status(403).send("Informations entered are incorrects (well try) !").end();
    }
    // attempt registe & open collection Users
    AM.addNewAccount({'username': username, 'pass': pass, 
        'fullname': fullname}, function(e, o) {
            if(e == 'username-taken') {
                res.status(403).send( "Username already taken").end();
            } else {
                res.status(200).send( "Success").end();
            }
    });
});

////////////////////////////////////////////////////////////////////////////////
// User Profile

router.get('/usr', function(req, res) {
    res.render('profile', {});
    app.userlineState = -1;
});

/** Return informations about user **/

router.get('/usr/:username', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
    var username= req.session.user.username;
    var result = {isFollowing: false, fullname: ""};

    AM.isFollowing(username, req.param('username'), function(e, o) {
        if (e != null)
            return console.log(e);
        result.isFollowing = o;
        AM.getUserInfo(req.param('username'), function(e, o) {
            if (e != null)
                return console.log(e);
            result.fullname = o.fullname;
            res.status(200).send(result).end();
        });
    });
});

router.get('/usr/:username/feed', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
    app.userlineState = -1;
    AM.getUserlines(req.param('username'), function(err, o){
        if (err != null)
            return console.log(err);
        res.status(200).send(o).end();
    });
});

router.get('/usr/:username/following', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
});

router.get('/usr/:username/followers', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
});

router.get('/usr/:username/follow', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
    var username= req.session.user.username;
    AM.follow(username, req.param('username'), function(e, o) {
        if (e != null)
            return console.log(e);
        res.status(200).end();
    });
});

router.get('/usr/:username/unfollow', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
    var username= req.session.user.username;
    AM.unfollow(username, req.param('username'), function(e, o) {
        if (e != null)
            return console.log(e);
        res.status(200).end();
    });
});

////////////////////////////////////////////////////////////////////////////////
// User Timeline

router.get('/home', function(req, res) {
     res.render('home', {});
     app.timelineState = -1;
});

router.get('/newsFeed/:offset', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
    AM.getUserTimelines(req.session.user.username, function(err, o){
        if (err != null)
            return console.log(err);
        res.status(200).send(o).end();
    });
});

////////////////////////////////////////////////////////////////////////////////
//  Send tweet 
router.post('/newTweet', function(req, res) {
    if (req.session.user === null) {
        res.status(403).send("not authentificated").end();
    }
    if (req.param('tweet').length <= 4) {
        res.status(403).send("Tweet too short").end();
    }
    var data = {    body: req.param('tweet'), 
                    username: req.session.user.username};
    if(req.param('imageId') != 'null')
        data.image = req.param('imageId');

    TM.newTweet(data, function(e, o) {
        if (e != null)
            return console.log(e);
        res.status(200).end();
    });
});

////////////////////////////////////////////////////////////////////////////////
// Upload Image
router.post('/image/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/tmp';
    form.encoding = 'binary';
    var imgId = null;
    var error = null;
    IM.getImageId(function(seq){
        imgId = seq;
        form.on('error', function(message) {
            res.status(413).send('Upload too large').end();
            res.end();
        });
        form.addListener('file', function(name, file) {
            // only accecpt png or jpg
            if( file.type != 'image/jpeg'
                && file.type != 'image/jpg'
                && file.type != 'image/png'
                && file.type != 'application/jpeg'
                && file.type != 'application/jpg'
                && file.type != 'application/png') {
                    error = "file format";
            }
            else if (file.size > 1000000) {//Max size 1Mb
                error = "file size";
            }
            if (error != null) {
                res.status(403).send(error).end();
            } else {
                var split = file.type.split('/');
                /** Upload the image on amazon */
                var body = fs.createReadStream(file.path);
                var s3obj = new AWS.S3({params:
                    {Bucket: 'ingi2145-project2', Key: 'img/' + imgId + '.' + split[1]}});
                s3obj.upload({Body: body, ContentType: file.type}).
                    on('httpUploadProgress', function(evt) {}).
                    send(function(err, data) {
                        fs.unlink(file.path);
                        res.status(200).send({"id": imgId + "." + split[1]}).end();
                    });
            }
        });

        form.parse(req, function(err, fields, files) {
            if (err) {
                return console.log(err);
            }
        });
    });
});

////////////////////////////////////////////////////////////////////////////////

module.exports = router;
