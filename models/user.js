var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    twitterId: Number,
    profilePic: String,
  });


var User = mongoose.model('User', userSchema);

module.exports = User;
