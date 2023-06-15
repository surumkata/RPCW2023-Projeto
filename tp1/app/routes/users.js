var express = require('express');
const passport = require('passport');
var router = express.Router();
var jwt = require('jsonwebtoken')
var User = require('../models/users')
var consts = require('../utils/const')


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users login. */
router.get('/login', function(req, res, next) {
    var data = new Date().toISOString().substring(0, 16)
    console.log('Na cb do GET login')
    console.log(req.sessionID)
    loginError = req.cookies['loginError'] == 'true'
    res.clearCookie('loginError')
    console.log('Login error: '+ loginError)
    res.render('login',{d:data,error:loginError})
  });

/* POST users login. */
router.post('/login', function(req, res, next) {
    console.log('Na cb do POST login...')
    console.log('Auth: ' + JSON.stringify(req.user))
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { 
        res.cookie('loginError','true')
        return res.redirect('login'); }
      return res.redirect('userToken');
    })(req,res,next)
  });

  router.post('/userToken', function(req, res){
    jwt.sign({
      username: req.user.username,
      level: req.user.level}, 
      consts.sessionSecret,
      {expiresIn: 3600},
      function(e, token) {
        if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
        else{
          res.cookie('user_token',token)
          res.redirect('/')
        }
      });
  })



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
  var data = new Date().getTime().toString()
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
        {
          res.clearCookie('user_token')
          res.redirect('/')
        }
    })
  });

module.exports = router;
