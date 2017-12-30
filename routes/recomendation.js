var express = require('express');
var router = express.Router();

var CorrelationLogic = require('../logic/correlation.js');
var Correlation = require('../models/correlation.js');
var RecomendationLogic = require('../logic/recomendation.js');

var Rating = require('../models/rating');
var User = require('../models/user');

router.get('/recomendations',ensureAuthenticated,function(req, res, next) {
  User.findById(req.user._id).
  populate({
    path:'recomendations.filmID',
    select:'title',
  }).
  exec(function(err, user){
    Rating.find({userID:user._id},'filmID',function(err,ratings){
      let rec = user.recomendations;
      let watched = ratings.map(x => x.filmID.toString());
      let notwatched = rec.filter(x => !watched.includes(x.filmID._id.toString()));
      user.recomendations=notwatched;
      res.render('recomendations',{title:'Recomendations',user:user});
    });
  });
});



router.get('/neighbours',function(req, res, next) {
  Correlation.find({usersID:{ $all:[req.user._id] }}).populate({path:'usersID',select:'username'}).exec(function(err,cors){
    let coefficients = [];
    for(let i=0;i<cors.length;i++){
      let users = cors[i].usersID
      var u = users[0].username==req.user.username?users[1].username:users[0].username
      coefficients.push({
        username:u,
        coefficient:cors[i].r
      });
    }
    res.render('neighbours',{title:'Neighbours', coefficients:coefficients});
  });
});



router.post('/correlation',function(req, res, next) {
  User.find({}).select('_id').exec(function(err,users){
    for(let i=0;i<users.length;i++){
      for(let j=i+1;j<users.length;j++){
        CorrelationLogic.calculateCorrelation(users[i].id, users[j].id);
      }
    }
    res.send('Success');
  });

});

router.post('/calculate',function(req, res, next) {
  RecomendationLogic.find(req.user);
  res.send('Success');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login')
};


module.exports = router;
