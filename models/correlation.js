var mongoose = require('mongoose');

var CorrelationSchema = mongoose.Schema({
  usersID: [String],
  r: Number
});

var Correlation = module.exports = mongoose.model('Correlation', CorrelationSchema);
