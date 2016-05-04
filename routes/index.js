var express = require('express');
var router = express.Router();
var request = require('request');
var passport = require('passport');
var User = require('../models/user');
var session = require('express-session');



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

/* GET request token page to start authentication */
router.get('/request-token', function(req, res, next) {
  // requestToken is the unique identifier of this life cycle with twitter
  twitter.getRequestToken(function(err, requestToken, requestSecret) {
    if (err){
      res.status(500).send(err);
    } else {
      req.session.requestSecret = requestSecret;
      // now the user gets sent to twitter with requestToken to authenticate their login access
      res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
    }
  });
});

router.get('/callback', function(req, res) {

  var grantToken = req.query.oauth_token,
  verifier = req.query.oauth_verifier;

  twitter.getAccessToken(grantToken, req.session.requestSecret, verifier, function(err, accessToken, accessSecret) {
    if (err) {
      res.status(500).send(err);
    } else {
      twitter.verifyCredentials(accessToken, accessSecret, function(err, profile) {
              if (err) {
                res.status(500).send(err);
              } else {
                User.findOne({ 'twitterId': profile.id}, function(err, user) {
                    if (err) console.log(err);

                    //No user was found... so create a new user with values from Twitter (all the profile. stuff)
                    if (!user) {
                      user = new User({
                        username: profile.screen_name,
                        twitterId: profile.id,
                        profilePic: profile.profile_image_url
                      });
                      console.log("USER", user);

                      user.save(function(err) {
                        if (err) console.log("ERROR", err);
                        // CODE HERE TO SET current_user_id in session
                        req.session.currentUser = user;
                        console.log(req.session.currentUser);
                        var backURL=req.header('Referer') || '/';
                        res.redirect(backURL);
                        // return user;
                      });

                    } else {
                      // CODE HERE TO SET current_user_id in session
                      req.session.currentUser = user;
                      console.log(req.session.currentUser);

                      var backURL=req.header('Referer') || '/';
                      console.log("backURL: "+backURL);
                      res.redirect('/');
                    }
                  });
              }
      });
    }
  });
});

    // route for login form
    // route for processing the login form
    // route for signup form
    // route for processing the signup form

    // route for showing the profile page
    // router.get('/profile', isLoggedIn, function(req, res) {
    //     res.render('profile.ejs', {
    //         user : req.user // get the user out of session and pass to template
    //     });
    // });

    // route for logging out
    router.get('/logout', function(req, res) {
      global.currentUser = null;
      res.redirect('/');
    });

    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    router.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    router.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

/* GET home page. */
router.get('/', function(req, res, next){
  res.render('index', { title: 'racer', currentUser: req.session.currentUser});
})



module.exports = router;
