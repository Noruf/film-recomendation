var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var upload = multer({dest: './uploads'});
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

mongoose.connect('mongodb://admin:averystrongpassword@ds121716.mlab.com:21716/film_recomendation', { useMongoClient: true });

db.once('open',function(){
  console.log('Connected to mongodb');
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// handle file uploads
// app.use(multer({dest:'./uploads'}));


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// handle session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value, location) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }
}));

// express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// For eny page
app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

//routes
var index = require('./routes/index');
var users = require('./routes/users');
var films = require('./routes/films');
var recomendation = require('./routes/recomendation');
app.use('/', index);
app.use('/users', users);
app.use('/films', films);
app.use('/recomendation', recomendation);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


//app.listen(3000);
console.log('Listening on port 3000');
module.exports = app;
