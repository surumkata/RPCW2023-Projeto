var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

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
var localStrategy = require('passport-local').Strategy


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session({
  genid : res => {
    console.log('Dentro do middleware da sessão...')
    console.log(res.sessionID)
    return uuidv4()
  },
  store : new fileStore(),
  secret : 'O meu segredo',
  resave : false,
  saveUninitialized : true
}))

var User = require('./models/users')

passport.use(new localStrategy(
  {usernameField: 'username'},(username,password,done) => {
    User.usersModel.findOne({"username" : username})
      .then(user => {
        if(!user)
          return done(null,flase,{message:"Utilizador inexistente!"})
        if(password != user.password)
          return done(null,false,{message:"Password Inválida"})
        done(null,user)
      })
      .catch(error => {
        
      })
  }
))

passport.serializeUser((user,done) => {
  console.log("Vou serializar o user na sessao" + JSON.stringify(user))
  done(null,user.id)
})

passport.deserializeUser((uid,done)=> {
  console.log("Vou desserializar o user" + uid)
  User.usersModel.findOne({"id" : uid})
    .then(user => done(null,user))
    .catch(erro => done(erro,false))
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
