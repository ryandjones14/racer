var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Friend = require('../models/friend');
var Race = require('../models/race');
var User = require('../models/user');

// GET profile for currentUser
router.get('/profile', function(req, res, next){
  var allFriends = [];
  Friend.find({'followerId': req.session.currentUser._id}, function(err, friends){
    if (err) console.log(err);
    console.log("FRIENDS", friends);
    friends
    friends.forEach(function(friend){
      allFriends.push(friend);
    })
    console.log("ALL FRIENDS", allFriends);
    res.render('users/profile', {title: 'racer', currentUser: req.session.currentUser, friends: allFriends});
  })
})

// GET races for followed user
router.get('/:id', function(req, res, next){
  var id = req.params.id;
  var friend;
  User.find({ 'userId': id }, function(err, user) {
    if (err) console.log(err);
    friend = user;
  });
  Race.find({ 'userId': id }, function(err, races) {
    if (err) console.log(err);
    console.log("RACE", races[0]);
    res.render('users/friend', {title: 'racer', races: races, friend: friend, currentUser: req.session.currentUser});
  });
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  var allUsers = [];
  User.find({}, function(err, users) {
    if (err) console.log(err);
    users.forEach(function(user){
      allUsers.push(user);
    })
    res.render('users/all', {title: 'racer', currentUser: req.session.currentUser, users: allUsers});
  });
});

router.post('/follow', function(req, res, next){
  var newFriend = Friend({
    id: req.body.id,
    username: req.body.name,
    profilePic: req.body.profilePic,
    followerId: req.body.userId
  });

  newFriend.save(function(err, user) {
    if (err) console.log(err);
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
  });
})

module.exports = router;
