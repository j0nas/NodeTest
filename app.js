var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session')

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('json spaces', 4);

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

var routes = require('./routes/index');
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

var userroutes = require('./routes/users')(db, BSON);
// Set '/users' as base route for users.js
app.use('/users', userroutes);


var quizroutes = require('./routes/quiz')(db, BSON);
// Set '/quiz' as base route for quiz.js
app.use('/quiz', quizroutes);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;