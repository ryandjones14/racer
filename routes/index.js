var express = require('express');
var router = express.Router();
var request = require('request');
var searchKey = process.env.ACTIVE_SEARCH_KEY;

var city;
var state;
var activity;

/* GET home page. */
router.get('/', function(req, res, next){
  res.render('index', { title: 'Xplore'});
})

router.post('/events', function(req, res, next){
  city = req.body.city;
  state = req.body.state;
  activity = req.body.activity;
  res.redirect('/events');
})

router.get('/events', function(req, res, next) {
  var queryString = `radius=50&city=${city}&state=${state}&current_page=1&per_page=10&sort=distance&topic=${activity}&exclude_children=true`;

  var activeSearchURL = `http://api.amp.active.com/v2/search?${queryString}&api_key=${searchKey}`;

  request(activeSearchURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var activities = [];
      data.results.forEach(function(result) {
        activities.push(result);
      });
      console.log(activities[0]);
      res.render('events', { title: 'Xplore', activities: activities, activity: activity, city: city, state: state});
      // res.send(activities);
    }
  })
});

module.exports = router;
