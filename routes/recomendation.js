var express = require('express');
var router = express.Router();

var CorrelationLogic = require('../logic/correlation.js');
var Correlation = require('../models/correlation.js');

var User = require('../models/user');

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



router.post('/calculate',function(req, res, next) {
  User.find({}).select('_id').exec(function(err,users){
    for(let i=0;i<users.length;i++){
      for(let j=i+1;j<users.length;j++){
        CorrelationLogic.calculateCorrelation(users[i].id, users[j].id);
      }
    }
    res.send('Success');
  });

});
module.exports = router;
