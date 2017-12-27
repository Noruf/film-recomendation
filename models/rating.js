var mongoose = require('mongoose');

var User = require('../models/user');
var Film = require('../models/film');
var Schema = mongoose.Schema;


var RatingSchema = mongoose.Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User' },
  filmID: { type: Schema.Types.ObjectId, ref: 'Film' },
  rating: Number
});

var Rating = module.exports = mongoose.model('Rating', RatingSchema);
