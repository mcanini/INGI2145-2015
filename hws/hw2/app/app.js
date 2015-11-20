var express = require('express');
var app = module.exports = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var assert = require('assert');
var AM = require('./manager/account-manager.js');
var TM = require('./manager/tweet-manager.js');
var cassandra = require('cassandra-driver');
var async = require('async');

////////////////////////////////////////////////////////////////////////////////

app.set('env', 'development');

////////////////////////////////////////////////////////////////////////////////
// MIDDLEWARE

app.use(cookieParser());
// Http only false to allow connection in ajax
// XSS leak but not the time to implement
// Nice session mechanism
// Store the session data on mongo
// to make the sessions avalaible
// on all the nodeJs nodes.
app.use(session({ secret: 'super-duper-secret-secret',
                  saveUninitialized: true,
                  cookie: { httpOnly: false },
                  resave: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// serve static content from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// parse the parameters of POST requests (available through `req.body`)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// routes
app.use('/', require('./routes.js'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

////////////////////////////////////////////////////////////////////////////////
// ERROR HANDLERS

// development error handler, will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log('[' + err.status + '] ' + err.message);
        res.render('template', {
            title: 'Error',
            partial: 'error',
            message: err.message,
            error: err
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('template', {
        title: 'Error',
        partial: 'error',
        message: err.message,
        error: {}
    });
});

////////////////////////////////////////////////////////////////////////////////
// START APP

// 1) Connect to Cassandra
// 2) Start the HTTP server
app.db = new cassandra.Client( { contactPoints : [ '127.0.0.1' ] } );
app.db.connect(function(err, result) {
    console.log('Connected.');

    var server = app.listen(3002, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Listening at http://%s:%s', host, port);
    });
});

////////////////////////////////////////////////////////////////////////////////
