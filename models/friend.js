var mongoose = require('mongoose');

var friendSchema = new mongoose.Schema({
    id: String,
    username: String,
    profilePic: String,
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
});

var Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
