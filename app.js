var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');


var routes = require('./routes/index');
var users = require('./routes/users');
var races = require('./routes/races');

var Twitter = require('node-twitter-api');

var twitterKey = process.env.XPLORR_TWITTER_KEY;
var twitterSecret = process.env.XPLORR_TWITTER_SECRET;
var twitterCallbackUrl = process.env.XPLORR_CALLBACK;

var twitter = new Twitter({
  consumerKey: twitterKey,
  consumerSecret: twitterSecret,
  callback: twitterCallbackUrl
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONN_XPLORE);

app.use(session({
  secret: process.env.XPLORR_APP_SECRET,
  saveUninitialized: true,
  resave: false,
  cookie: { maxAge: 60000 }
}));


app.use('/', routes);
app.use('/users', users);
app.use('/races', races);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
// allow global access to currentUser variable, this must be after require passport
app.use(function(req, res, next) {
  global.currentUser = req.user;
  next();
});



// passport.use(new TwitterStrategy({
//     consumerKey: twitterKey,
//     consumerSecret: twitterSecret,
//     callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
//   },
//   function(token, tokenSecret, profile, cb) {
//     User.findOrCreate({ twitterId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


module.exports = app;
