var express = require('express');
var router = express.Router();
var request = require('request');
var searchKey = process.env.ACTIVE_SEARCH_KEY;
var Race = require('../models/race')

var city;
var state;
var activity;

function authenticatedUser(req, res, next) {
  // If the user is authenticated, then we can continue with next
  // https://github.com/jaredhanson/passport/blob/a892b9dc54dce34b7170ad5d73d8ccfba87f4fcf/lib/passport/http/request.js#L74
  if (req.session.currentUser) return next();
  // Otherwise
  // req.flash('errorMessage', 'Login to access!');
  return res.redirect('/');
}

router.get('/my-races', authenticatedUser, function(req, res, next) {
  var id = req.session.currentUser._id;
  Race.find({ 'userId': id }, function(err, races) {
    if (err) console.log(err);
    res.render('races/my-races', {title: 'racer', races: races, currentUser: req.session.currentUser});
  });
});

router.get('/delete/:name/:date', authenticatedUser, function(req, res, next){
  var name = req.params.name;
  var date = req.params.date;
  var id = req.session.currentUser._id;
  Race.findOneAndRemove({'userId' : id, 'name': name, 'date': date}, function(err) {
    if (err) console.log(err);
    console.log('Race deleted!');
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
  });
})

router.post('/new', authenticatedUser ,function(req, res, next){
  var newRace = Race({
    name: req.body.name,
    logo: req.body.logo,
    place: req.body.place,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    registerUrl: req.body.register,
    date: req.body.date,
    userId: req.body.userId
  });

  newRace.save(function(err, user) {
    if (err) console.log(err);
    console.log("RACE", newRace);
    var backURL=req.header('Referer') || '/';
    res.redirect(backURL);
  });
})

router.post('/', function(req, res, next){
  city = req.body.city;
  state = req.body.state;
  activity = req.body.activity;
  console.log("Testestest");
  res.redirect('/races');
})

router.get('/', function(req, res, next) {

  Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0])+'..'; // padding
  };

  d = new Date();
  var date = d.yyyymmdd();

  Date.prototype.yyyyMMdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+7).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
  };

  var sixMonthDate = d.yyyyMMdd();

  var queryString = `radius=50&city=${city}&state=${state}&current_page=1&per_page=10&sort=distance&topic=${activity}&start_date=${date}..${sixMonthDate}&exclude_children=true`;

  var activeSearchURL = `http://api.amp.active.com/v2/search?${queryString}&api_key=${searchKey}`;

  request(activeSearchURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var activities = [];
      data.results.forEach(function(result) {
        activities.push(result);
      });
      console.log(activities[0]);
      var myRaces = [];
      if (req.session.currentUser){
        Race.find({'userId': req.session.currentUser._id}, function(err, races) {
          if (err) console.log(err);
          races.forEach(function(race){
            myRaces.push(race.registerUrl);
          });
          res.render('races/races', { title: 'racer', activities: activities, activity: activity, city: city, state: state, currentUser: req.session.currentUser, myRaces: myRaces});
        });
      } else {
        res.render('races/races', { title: 'racer', activities: activities, activity: activity, city: city, state: state, currentUser: req.session.currentUser});
      }

      // res.send(activities);
    }
  })
});

module.exports = router;
