var express = require('express');
var router = express.Router();

router.get('/admin', function (req, res) {
    res.render('admin', {
        title: 'Admin\'s corner',
        loggedin: req.session.loggedin == true,
        username: req.session.username
    });
});

module.exports = router;
