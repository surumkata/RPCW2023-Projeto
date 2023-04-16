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

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
