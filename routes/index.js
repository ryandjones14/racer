var express = require('express');
var router = express.Router();
var request = require('request');
var searchKey = process.env.ACTIVE_SEARCH_KEY;
var twitterKey = process.env.XPLORR_TWITTER_KEY;
var twitterSecret = process.env.XPLORR_TWITTER_SECRET;
var twitterCallbackUrl = process.env.XPLORR_CALLBACK;
// twitter module required in routes/index.js
var Twitter = require("node-twitter-api");
// twitter client object, API wrapper
var twitter = new Twitter({
  consumerKey: twitterKey,
  consumerSecret: twitterSecret,
  callback: twitterCallbackUrl
});

var city;
var state;
var activity;

/* GET request token page to start authentication */
router.get('/request-token', function(req, res, next) {
  // requestToken is the unique identifier of this life cycle with twitter
  twitter.getRequestToken(function(err, requestToken, requestSecret) {
    if (err)
      res.status(500).send(err);
    else {
      req.session.requestSecret = requestSecret;
      // now the user gets sent to twitter with requestToken to authenticate their login access
      res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
    }
  });
});

router.get('/callback', function(req, res) {
  console.log('OAuth Token', req.query.oauth_token);
  console.log('OAuth Verifier', req.query.oauth_verifier);

  var grantToken = req.query.oauth_token,
  verifier = req.query.oauth_verifier;

  twitter.getAccessToken(grantToken, req.session.requestSecret, verifier, function(err, accessToken, accessSecret) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
        if (err) {
          res.status(500).send(err);
        }
        else {
          res.send(user);
        }
      });
    }
  });
});

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
