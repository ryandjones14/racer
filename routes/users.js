var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var allUsers = [];
  User.find({}, function(err, users) {
    if (err) console.log(err);
    console.log("USERS", users);
    users.forEach(function(user){
      allUsers.push(user);
    })
    console.log("ALL USERS", allUsers);
    res.render('users/all', {title: 'racer', currentUser: req.session.currentUser, users: allUsers});
  });
});

module.exports = router;
