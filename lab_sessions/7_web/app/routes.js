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
    // TODO: add code here to validate user password and save the session state
});

router.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.status(200).send( "disconnected").end();
    });
});


////////////////////////////////////////////////////////////////////////////////

module.exports = router;
