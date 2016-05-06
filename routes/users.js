var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Friend = require('../models/friend');
var Race = require('../models/race');
var User = require('../models/user');

function authenticatedUser(req, res, next) {
  // If the user is authenticated, then we can continue with next
  // https://github.com/jaredhanson/passport/blob/a892b9dc54dce34b7170ad5d73d8ccfba87f4fcf/lib/passport/http/request.js#L74
  if (req.session.currentUser) return next();
  // Otherwise
  // req.flash('errorMessage', 'Login to access!');
  return res.redirect('/');
}

// GET profile for currentUser
router.get('/profile', authenticatedUser, function(req, res, next){
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

router.get('/delete/:id', authenticatedUser, function(req, res, next){
  var friendId = req.params.id;
  var userId = req.session.currentUser._id;
  Friend.findOneAndRemove({'followerId': userId, 'id': friendId}, function(err) {
    if (err) console.log(err);
    console.log('Friend deleted!');
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
  });
})

// GET races for followed user
router.get('/:id', authenticatedUser, function(req, res, next){
  var id = req.params.id;
  var friend;
  var myRaces = [];
  User.findOne({ '_id': id }, function(err, user) {
    if (err) console.log(err);
    friend = user;
    Race.find({ 'userId': req.session.currentUser._id }, function(err, races) {
      if (err) console.log(err);
      races.forEach(function(race){
        myRaces.push(race.registerUrl)
      });
      console.log("MY RACES =====", myRaces);
      Race.find({ 'userId': id }, function(err, races) {
        if (err) console.log(err);
        console.log("RACES", races);
        res.render('users/friend', {title: 'racer', races: races, friend: friend, currentUser: req.session.currentUser, myRaces: myRaces});
      });
    });
  });
})

/* GET users listing. */
router.get('/', authenticatedUser, function(req, res, next) {
  var allUsers = [];
  var friendsIds = [];
  console.log("USER", req.session.currentUser);
  Friend.find({'followerId': req.session.currentUser._id}, function(err, friends){
    if (err) console.log("ERROR", err);
    friends.forEach(function(friend){
      friendsIds.push(friend.id);
    });
    User.find({}, function(err, users) {
      if (err) console.log(err);
      users.forEach(function(user){
        allUsers.push(user);
      });
      console.log(allUsers[0]);
      res.render('users/all', {title: 'racer', currentUser: req.session.currentUser, users: allUsers, friends: friendsIds});
    });
  })

});

router.post('/follow', authenticatedUser, function(req, res, next){
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
