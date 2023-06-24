var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var consts = require('./utils/const')
var User = require('./models/users')
var Post = require('./models/posts')
require("dotenv").config()
//import de mongoose module
var mongoose = require('mongoose')

//Set up default mongoose conection
var mongoDB = 'mongodb://127.0.0.1/inquir_ge'
mongoose.connect(mongoDB,{useNewUrlParser:true, useUnifiedTopology:true})

var db = mongoose.connection

db.on('error',console.error.bind(console,'MongoDB connectior error...'))

db.once('open',function(){
    console.log('Conexão ao MongoDB realizada com sucesso...')
})

const {v4:uuidv4} = require('uuid')
var session = require('express-session')
var fileStore = require('session-file-store') (session)
var passport = require('passport')
require("./utils/passportConfig").googleStrategy(passport);
require("./utils/passportConfig").facebookStrategy(passport);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session({
  genid : res => {
    console.log('Dentro do middleware da sessão...')
    console.log('Id da sessao: ' + res.sessionID)
    return uuidv4()
  },
  store : new fileStore(),
  secret : consts.sessionSecret,
  resave : false,
  saveUninitialized : true
}))

var User = require('./models/users')

passport.use('local',User.userModel.createStrategy())
passport.serializeUser( (user, done) => { 
  console.log(`\n--------> Serialize User:`)
  done(null, user)
} )


passport.deserializeUser((user, done) => {
      console.log("\n--------- Deserialized User:")
      done (null, user)
}) 




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
