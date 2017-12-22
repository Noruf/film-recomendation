var mongoose = require('mongoose');

var RatingSchema = mongoose.Schema({
  userID: String,
  filmID: String,
  rating: Number
});

var Rating = module.exports = mongoose.model('Rating', RatingSchema);
