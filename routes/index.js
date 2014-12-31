var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', {
        title: 'Index',
        loggedin: req.session.loggedin == true,
        username: req.session.username
    });
});

router.get('/admin', function (req, res) {
    // TODO might want to validate admin priviledge here
    if (req.session.loggedin) {
        res.render('admin', {
            title: 'Admin\'s corner',
            loggedin: true,
            username: req.session.username
        });
    } else {
        res.status(401).end();
    }
});

module.exports = router;
