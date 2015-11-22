var express = require('express');
var assert = require('assert');
var app = require('./app.js');
var ejs = require('ejs');
var fs = require('fs');
var AM = require('./manager/account-manager.js');
var fs = require('fs');
var formidable = require('formidable');
var router = express.Router();

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
            res.status(403).send("Informations entered are incompletes !").end();
    }
    // attempt manual login & open collection Users
    AM.manualLogin(req.param('username'), req.param('pass'), function(e, o) {
        if (!o) {
            if (e == 'user-not-found')
                res.status(403).send( "User not found").end();
            else if (e == 'invalid-password')
                res.status(403).send( "Password not match").end();
            else
                res.status(403).send( "Unexpected Error").end();
        } else {
            req.session.user =  o;
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

router.get('/home', function(req, res) {
     res.render('home', {});
});

module.exports = router;
