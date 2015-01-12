var express = require('express');
var router = express.Router();

// ALL OPERATIONS FOR /users/* ROUTE
module.exports = function (db, BSON) {
    router.get("/", function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        db.collection('users', function (err, collection) {
            collection.find().toArray(function (err, items) {
                res.json(items);
            });
        });
    });

    router.get("/new", function (req, res, next) {
        res.render('createaccount', {
            title: 'Create new user',
            loggedin: req.session.loggedin == true,
            username: req.session.username
        });
    });

    router.post('/login', function (req, res, next) {
        if (req.session.loggedin) {
            return;
        }

        db.collection('users', function (err, collection) {
            var passHash = require('password-hash');
            collection.findOne({
                'username': req.body.username
            }, function (err, item) {
                if (err || item == null || !passHash.verify(req.body.password, item.password)) {
                    res.status(401).end();
                    return;
                }

                console.log('Login successful for account: ' + JSON.stringify(item));
                console.log('Session initiated.');
                req.session.username = item.username;
                req.session.loggedin = true;
                res.send(item);
            })
        });
    })

    router.post('/logout', function (req, res, next) {
        if (req.session.loggedin) {
            req.session.destroy();
            console.log("Session destroyed.");
        }

        res.redirect(200, '/'); // TODO fix redirect to index when logging out
    });

    router.post('/create', function (req, res, next) {
        if (typeof req.body == "undefined") {
            return;
        }

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
                res.status(200).end();
            });
        });
    });

    router.post('/delete/:id', function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        var id = req.params.id;
        console.log('Deleting user: ' + id);
        db.collection('users', function (err, collection) {
            collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
                if (err) {
                    res.send({'error': 'An error has occurred - ' + err});
                } else {
                    console.log('' + result + ' document(s) deleted');
                    res.send(req.body);
                }
            });
        });
    });

    return router;
}