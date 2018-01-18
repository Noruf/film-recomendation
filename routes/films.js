var express = require('express');
var router = express.Router();

var Film = require('../models/film');
var Rating = require('../models/rating');

router.get('/', function(req, res, next) {

  let query = Object.assign({}, req.query);
  let orderby = query.orderby||'-year';
  delete query.orderby;
  if(query.title) query.title = new RegExp(query.title,"i");
  if(query.country) query.country = new RegExp(query.country,"i");
  if(query.genre) query.genre = new RegExp(query.genre,"i");
  Film.find(query).sort(orderby).exec(function(err, films) {
    if (err) {
      console.log(err);
    } else {
      Film.count({}, function(err,count){
        films.count = count;
        res.render('films', {
          title: 'Film Database',
          films: films,
          query: req.query
        });
      });
    }
  });
});





router.get('/add', ensureAuthenticated, function(req, res, next) {
  res.render('add_film', {
    title: 'Add Film',
    film: new Film(),
    actorString: ''
  });
});


router.post('/add', function(req, res, next) {
  var film = createFilm(req);
  var errors = req.validationErrors();

  if (errors) {
    res.render('add_film', {
      title: 'Add Film',
      errors: errors,
      film: film,
      user:req.user
    });
  } else {


    Film.createFilm(film, function(err, film) {
      if (err) throw err;
      console.log(film);
      req.flash('success', 'Film has been added');
      res.redirect('/films/'+ film._id);
    });
  }

});

router.get('/edit/:id', ensureAuthenticated, function(req, res, next) {
  let filmID = req.params.id;
  Film.getFilmById(filmID, function(err, film) {
    if (err) throw err;
    console.log(film);
    res.render('add_film', {
      title: 'Edit Film',
      film: film,
      actorString: Film.getActors(film.actors)
    });
  });
});

router.post('/edit/:id', function(req, res) {
  let filmID = req.params.id;
  Film.getFilmById(filmID, function(err, oldFilm) {
    if (err) throw err;

    let film = createFilm(req, oldFilm);

    let errors = req.validationErrors();

    if (errors) {
      res.render('add_film', {
        title: 'Edit Film',
        errors: errors,
        film: film,
        user:req.user
      })
    };
    let query = {
      _id: filmID
    }

    Film.update(query, film, function(err) {
      if (err) {
        console.log(err);
        return;
      }
      req.flash('success', 'Film Updated');
      res.redirect('/films/' + filmID);
    });
  });
});



function createFilm(req, oldFilm) {
  let film = oldFilm ? {} : new Film()

  var words = /\b[\w-]+\b/g;

  var title = req.body.title.trim();
  var year = req.body.year;
  var description = req.body.description.trim();
  var genre = req.body.genre.match(words);
  var director = req.body.director.trim();
  var scenarist = req.body.scenarist.trim();
  var country = req.body.country.trim();
  var premiere = req.body.premiere;
  var minutes = req.body.minutes;
  var names = req.body.name;
  var roles = req.body.role;

  var actors = [];
  for(let i=0;i<names.length;i++){
    if(names[i]<1)continue;
    actors.push({
      name: names[i].trim(),
      role: roles[i].trim()
    });
  }


  var meta = {
    lastModified: {
      id: req.user._id,
      date: new Date()
    }
  }
  meta.added = oldFilm ? oldFilm.meta.added : {
    id: req.user._id,
    date: new Date()
  }

  // Form Validation
  req.checkBody('title', 'title field is required').notEmpty();
  req.checkBody('year', 'year field is required').notEmpty();
  req.checkBody('description', 'description field is required').notEmpty();
  req.checkBody('genre', 'genre field is required').notEmpty();
  req.checkBody('director', 'director field is required').notEmpty();
  req.checkBody('scenarist', 'scenarist field is required').notEmpty();
  req.checkBody('premiere', 'premiere field is required').notEmpty();
  req.checkBody('minutes', 'minutes field is required').notEmpty();


  film.title = title;
  film.year = year;
  film.description = description;

  film.genre = genre;
  film.director = director;
  film.scenarist = scenarist;
  film.country = country;
  film.premiere = new Date(premiere);
  film.minutes = minutes;

  film.actors = actors;
  film.meta = meta;


  return film;
}

router.delete('/:id', function(req, res) {
  if (!req.user._id) {
    res.status(500).send({
      error: 'You are not logged in!'
    });
  }

  let query = {
    _id: req.params.id
  }

  Film.findById(req.params.id, function(err, article) {
    Film.remove(query, function(err) {
      if (err) {
        console.log(err);
      }
      res.send('Success');
    });
  });
});

router.post('/rate', function(req, res, next) {
  if (!req.user) {
    res.status(500).send({
      error: 'You are not logged in!'
    });
    return;
  }
  if(!req.body.filmID||!req.body.rating){
    res.status(500).send({
      error: 'Something went wrong!'
    });
    return;
  }
  let query = {
    userID: req.user._id,
    filmID: req.body.filmID
  };
  Rating.findOne(query, function(err, rating) {
    if (rating) {
      rating.set({
        rating: req.body.rating
      });
    } else {
      rating = new Rating({
        userID: req.user._id,
        filmID: req.body.filmID,
        rating: req.body.rating
      });
    }
    rating.save(rating, function(err) {
      if (err) {
        res.status(500).send();
      }
      else{
        res.send('Success');
      }
    });
  });
});


function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}
function average(values) {
    let sum = 0;
    for(let i=0;i<values.length;i++){
      sum+=values[i];
    }
    return sum/values.length;
}
function std_deviation(values,avg){
  let s=0;
  for(let i=0;i<values.length;i++){
    s+=Math.pow(values[i]-avg,2);
  }
  let result = Math.sqrt(s/values.length);
  return result;
}

router.get('/:id', function(req, res, next) {
  Film.findById(req.params.id, function(err, film) {
    if (err||!film) {
      res.status(500).send();
      return;
    }
    Rating.find({filmID:film._id},function(err,ratings){
      let stats;
      if(ratings.length==0){
        stats={median:'N/A',avg:'N/A',std:'N/A',votes:'0'}
      }
      else{
        let values = ratings.map(a => a.rating);
        let avg=average(values)
        stats={
          avg:avg,
          median:median(values),
          std:std_deviation(values,avg),
          votes:values.length
        }
      }

      if(req.user){
        let rating = ratings.find(x => x.userID.toString()==req.user._id);
        if (rating) {
          film.rating = rating.rating;
        }
      }
      res.render('film', {
        film: film,
        title: `${film.title} (${film.year})`,
        stats:stats
      });

    });
  });
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login')
};

module.exports = router;
