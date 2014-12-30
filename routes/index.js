var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Index',
        loggedin: typeof req.session.username !== 'undefined' && req.session.username.length > 0,
        username: req.session.username
    });
});

module.exports = router;
