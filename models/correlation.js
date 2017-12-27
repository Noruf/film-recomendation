var mongoose = require('mongoose');

var User = require('../models/user');
var Schema = mongoose.Schema;

var CorrelationSchema = mongoose.Schema({
  usersID: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  r: Number
});

var Correlation = module.exports = mongoose.model('Correlation', CorrelationSchema);
