var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session')

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret: 'EdYouSessionToken',
    saveUninitialized: true,
    resave: true
}));

app.use('/', routes);

var mongo = require('mongodb');
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('userdb', server, {safe: false});
db.open(function (err, db) {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Connected to 'userdb' database");
    db.collection('users', {strict: true}, function (err, collection) {
        if (err) {
            console.log("The 'users' collection doesn't exist.");
        }
    });
});

// ROUTES
app.post('/users/login', function (req, res, next) {
    db.collection('users', function (err, collection) {
        var passHash = require('password-hash');
        console.log(passHash.generate(req.body.password));
        console.log(passHash.generate(req.body.password));
        collection.findOne({
            'username': req.body.username
        }, function (err, item) {
            if (err || item == null || !passHash.verify(req.body.password, item.password)) {
                res.status(401).end();
                return;
            }

            //if () {
            //    res.status(401).end();
            //    return;
            //}

            console.log('Login successful for account: ' + JSON.stringify(item));
            res.send(item);
        })
    });
})

app.post('/users/create', function (req, res, next) {
    var passHash = require('password-hash');
    var user = {
        username: req.body.username,
        password: passHash.generate(req.body.password)
        // Saves password as SHA1-encryped string.
    };

    db.collection('users', function (err, collection) {
        collection.insert(user, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred'});
                return;
            }

            console.log("Successfully created user.");
            res.send(200);
        });
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;