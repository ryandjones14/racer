var mongoose = require('mongoose');

var raceSchema = new mongoose.Schema({
    name: String,
    logo: String,
    place: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    registerUrl: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
});

var Race = mongoose.model('Race', raceSchema);

module.exports = Race;
