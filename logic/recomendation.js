var Rating = require('../models/rating');
var Correlation = require('../models/correlation');



module.exports.find = function(user) {
    Correlation.find({usersID: {$all: [user._id], r:{$gt: 0}}}, function(err, coefficients) {
      if(err||coefficients.length<1){
        return;
      }
      let users = []
      for (let i = 0; i < coefficients.length; i++) {
        let usersID = coefficients[i].usersID;
        u = usersID[0].toString() == user._id ? usersID[1] : usersID[0];
        users.push(u.toString());
        coefficients[i].userID = u.toString();
      }
      Rating.find({userID: {$in: users}}, function(err, ratings) {
        let recomendations = [];
        let films = new Set();
        for(let i=0;i<ratings.length;i++){
          films.add(ratings[i].filmID.toString());
        }
        for(let filmID of films){
          let filmRatings = ratings.filter(a => a.filmID.toString()==filmID);
          let sum=0;
          let weight=0
          for(let rating of filmRatings){
            let c = coefficients.find(a => a.userID==rating.userID.toString());
            sum += rating.rating * c.r;
            weight += c.r;
          }
          recomendations.push({
            filmID:filmID,
            rating:sum/weight
          });
        }
        user.recomendations = recomendations;
        user.save(u, function(err){
          if(err){
            console.log(err);
          }
        });

      });
    });
  }
