var express = require('express');
var router = express.Router();
var request = require('request');
var searchKey = process.env.ACTIVE_SEARCH_KEY;
var Race = require('../models/race')

var city;
var state;
var activity;

router.post('/', function(req, res, next){
  city = req.body.city;
  state = req.body.state;
  activity = req.body.activity;
  console.log("Testestest");
  res.redirect('/races');

})

router.get('/my-races', function(req, res, next) {
  var id = global.currentUser.id;
  Race.find({ userId: id }, function(err, races) {
    if (err) console.log(err);
    res.render('races/my-races', {title: 'racer', races: races});
  });
});

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
      res.render('races', { title: 'xplorr', activities: activities, activity: activity, city: city, state: state});
      // res.send(activities);
    }
  })
});

router.post('/new', function(req, res, next){
  var newRace = Race({
    name: req.body.name,
    logo: req.body.logo,
    place: req.body.place,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    registerUrl: req.body.register,
    userId: req.body.userId
  });

  newRace.save(function(err, user) {
    if (err) console.log(err);
    var backURL=req.header('Referer') || '/';
    console.log("backURL: "+backURL);
    res.redirect(backURL);
  });
})

module.exports = router;
