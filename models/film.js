var mongoose = require('mongoose');


// Film Schema
var FilmSchema = mongoose.Schema({
  title:  String,
  year: Number,
  description: String,

  genre: [String],
  director: String,
  scenarist: String,
  country: String,
  premiere: Date,
  minutes: Number,

  actors: [{name: String, role: String}],
  meta:{
    lastModified: { id: String, date: Date},
    added: {id:String, date:Date}
  }

});

var Film = module.exports = mongoose.model('Film', FilmSchema);

// Repository
module.exports.getFilmById = function (id, callback) {
  Film.findById(id, callback);
};

module.exports.getFilmByNameYear = function (name, callback) {
  var query = { name: name };
  Film.findOne(query, callback);
};

module.exports.createFilm = function (newFilm, callback) {
  newFilm.save(callback);
};

module.exports.getActors = function (actors) {
  let actorString = "";
  actors.forEach(function(actor){
    actorString+=actor.name+" - "+actor.role+"\n";
  });
  return actorString;
}
