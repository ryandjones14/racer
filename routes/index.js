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

router.post('/trips', function(req, res, next){
  city = req.body.city;
  state = req.body.state;
  activity = req.body.activity;
  res.redirect('/trips');
})

router.get('/trips', function(req, res, next) {


  var queryString = `radius=50&city=${city}&state=${state}&current_page=1&per_page=10&sort=distance&topic=${activity}&exclude_children=true`;

  var activeSearchURL = `http://api.amp.active.com/v2/search?${queryString}&api_key=${searchKey}`;

  request(activeSearchURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // var data = JSON.parse(body);
      // var activites = [];
      // data.items.forEach(function(item) {
      //   activites.push(item.family);
      // });

      // res.render('index', { title: 'Xplore', activites: activites});
      console.log(activeSearchURL);
      res.send(body);
    }
  })
});

module.exports = router;
