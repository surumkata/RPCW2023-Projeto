var express = require('express');
const passport = require('passport');
var router = express.Router();
var jwt = require('jsonwebtoken')
var User = require('../models/users')
var userController = require('../controllers/users')
var consts = require('../utils/const')


function requireAuthentication(req,res,next){
  console.log('User (verif,): '+JSON.stringify(req.user))
  if(req.cookies && 'user_token' in req.cookies){
    var token = req.cookies['user_token']
    console.log('Token: ' + token)
    if(token){
      jwt.verify(token, consts.sessionSecret, function(e, payload){
        if(!e){
          console.log('Logged in.')
          console.log('Payload: ' + JSON.stringify(payload))
          req.body.logged = true
          req.body.username = payload.username
          req.body.level = payload.level
        }
      })
    }
    //return true if user is authenticated
    next()
  }
  else{
    res.redirect('/users/login')
  }
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/* GET users profile page. */
router.get('/profile', requireAuthentication,function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  username = req.body.username
  console.log('Profile page de user: ' + username)
  userController.getUserByUsername(username)
  .then(user => {
    res.render('userProfile',{d:data,user:user})
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
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
    // verificar utilizador
    passport.authenticate('local', function(err, user, info) {
      if (err) { 
        return next(err); 
      }
      if (!user) { 
        res.cookie('loginError','true')
        return res.redirect('login'); 
      }
      jwt.sign({
        username: user.username,
        level: user.level}, 
        consts.sessionSecret,
        {expiresIn: 3600},
        function(e, token) {
          if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
          else{
            res.cookie('user_token',token)
            res.redirect('/')
          }
        });
    })(req,res,next)
  });




/* GET users login. */
router.get('/register', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log('Na cb do GET login')
  console.log(req.sessionID)
  registerError = req.cookies['registerError'] == 'true'
  res.clearCookie('registerError')
  res.render('register',{error:registerError,d:data})
});

/* POST users register. */
router.post('/register', function(req, res, next) {
  console.log('Na cb do POST register...')
  console.log('Password: '+ req.body.password)
  var data = new Date().getTime().toString()
  userController.getUserByUsername(req.body.username)
    .then(result => {
      if(result == null){
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
      }
      else{
        res.cookie('registerError','true')
        res.redirect('register')
      }
      
    })
    .catch(err => {
      console.log('Erro: ' + err)
      res.redirect('/users/register')
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
