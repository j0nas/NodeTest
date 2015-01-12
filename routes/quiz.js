var express = require('express');
var router = express.Router();

module.exports = function (db) {
    router.get("/list", function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        res.render('listquiz', {
            title: 'Available quizzes',
            loggedin: true,
            username: req.session.username
        });
    });

    router.get('/new', function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        res.render('createquiz', {
            title: 'Create new quiz',
            loggedin: true,
            username: req.session.username
        });
    })

    router.post('/new', function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        var quiz = req.body;
        quiz.author = req.session.username;

        db.collection('quiz', function (err, collection) {
            collection.insert(quiz, {safe: true}, function (err, result) {
                if (err) {
                    console.log('Failed to persist quiz!');
                    res.send({'error': 'An error has occurred'});
                    return;
                }

                console.log("Successfully persisted quiz.");
                res.redirect('/');
            });
        });
    });

    router.post('/delete/:id', function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        var id = req.params.id;
        console.log('Deleting quiz: ' + id);
        db.collection('quiz', function (err, collection) {
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

    router.get("/", function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        db.collection('quiz', function (err, collection) {
            collection.find().toArray(function (err, items) {
                res.send(items);
            });
        });
    });

    router.get('/activate/:id', function (req, res, next) {
        if (!req.session.loggedin) {
            res.status(401).end();
            return;
        }

        db.collection('quiz', function (err, collection) {
            collection.findOne({
                '_id': new BSON.ObjectID(req.params.id)
            }, function (err, item) {
                if (err || item == null) {
                    res.status(404).end();
                    return;
                }

                if (!req.session.quiz || !req.session.quiz.active) {
                    req.session.quiz = {};
                    req.session.quiz.active = true;
                    req.session.quiz.id = item._id;
                    req.session.quiz.question = 0;
                } else {
                    req.session.quiz.question++;

                    // If user has answered all questions
                    if ((req.session.quiz.question + 1) > item.questions.length) {
                        req.session.quiz.active = false;
                        res.render('quizdone', {
                            message: 'Quiz done!',
                            loggedin: true,
                            username: req.session.username
                        });
                        // Probably also persist quiz performance stats..?
                        return;
                    }
                }

                res.render('quiz', {
                    name: item.quizname,
                    author: item.author,
                    question: item.questions[req.session.quiz.question],
                    questionnumber: req.session.quiz.question,
                    loggedin: true,
                    username: req.session.username
                });
            })
        });
    });

    return router;
}
