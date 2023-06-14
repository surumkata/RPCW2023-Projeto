var express = require('express');
const passport = require('passport');
var router = express.Router();
var jwt = require('jsonwebtoken')
var userController = require('../controllers/users')
var User = require('../models/users')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users login. */
router.get('/login', function(req, res, next) {
    var data = new Date().toISOString().substring(0, 16)
    console.log('Na cb do GET login')
    console.log(req.sessionID)
    res.render('login',{d:data})
  });

/* POST users login. */
router.post('/login', passport.authenticate('local'), function(req, res, next) {
    console.log('Na cb do POST login...')
    console.log('Auth: ' + JSON.stringify(req.user))
    res.redirect('/protegida')
  });



/* GET users login. */
router.get('/register', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log('Na cb do GET login')
  console.log(req.sessionID)
  res.render('register',{d:data})
});

/* POST users reguster. */
router.post('/register', function(req, res, next) {
  console.log('Na cb do POST register...')
  console.log('Password: '+ req.body.password)
  var data = new Date().toISOString().substring(0,16)
  User.userModel.register(
    new User.userModel({ 
      username: req.body.username, 
      name: req.body.name,
      level: 0,
      active: true,
      dateCreated: data }), 
    req.body.password, 
    function(err, user) {
    if (err){
      console.log('Erro: ' + err)
      res.redirect('/users/register')
    }
    else{
      console.log('User registado')
      res.redirect('/users/login')    
    }
    }) 
});



/* GET users logout. */
router.get('/logout', function(req, res, next) {
    console.log('Na cb do GET logout...')
    console.log(req.sessionID)
    req.logout(function(err){
        if(err)
            res.render('error',{error:err})
        else
            res.redirect('/')
    })
  });

module.exports = router;
