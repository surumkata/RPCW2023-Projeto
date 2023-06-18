var express = require('express');
const passport = require('passport');
var router = express.Router();
var jwt = require('jsonwebtoken')
var User = require('../models/users')
var userController = require('../controllers/users')
var consts = require('../utils/const')


var verifyAuthentication = consts.verifyAuthentication
var requireAuthentication = consts.requireAuthentication
var requireAdmin = consts.requireAdmin
var createJwtToken = consts.createJwtToken
var clearJwtToken = consts.clearJwtToken




/* GET users profile page. */
router.get('/profile', requireAuthentication,function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  username = null
  if(req.body.logged){
    logged = req.body.logged
    username = req.body.username
  }
  username = req.body.username

  userController.getUserByUsername(username)
  .then(user => {
    res.render('userProfile',{username:username,logged : logged,d:data,user:user})
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
});

/* GET users profile edit page. */
router.get('/editProfile', requireAuthentication,function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  username = null
  if(req.body.logged){
    logged = req.body.logged
    username = req.body.username
  }
  username = req.body.username

  userController.getUserByUsername(username)
  .then(user => {
    res.render('editUserProfile',{username:username,logged : logged,d:data,user:user})
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
});

/* POST users profile page. */
router.post('/editProfile', requireAuthentication,function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  username = req.body.username

  // criar objeto de utilizador modificado
  u = {}
  if(req.body.email){
    u['email'] = req.body.email
  }
  if(req.body.filiation){
    u['filiation'] = req.body.filiation
  }

  userController.updateUserByUsername(username,u)
  .then(user => {
    res.redirect('profile')
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
});



/* GET users login. */
router.get('/login', function(req, res, next) {
    var data = new Date().toISOString().substring(0, 16)
    // verificar erro de login
    loginError = req.cookies['loginError'] == 'true'
    res.clearCookie('loginError')

    res.render('login',{d:data,error:loginError})
  });


/* POST users login. */
router.post('/login', function(req, res, next) {
    // verificar utilizador
    passport.authenticate('local', function(err, user, info) {
      if (err) { 
        return next(err); 
      }
      // user nao existe
      if (!user) { 
        res.cookie('loginError','true')
        return res.redirect('login'); 
      }
      // criar token de autenticacao
      createJwtToken(user.username,user.level,
        function(e, token) {
            if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
            else{
              res.cookie('user_token',token,{httpOnly: true})
              res.redirect('/')
            }
          }
          )
    })(req,res,next)
  });




/* GET pagina de registo. */
router.get('/register', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  registerError = req.cookies['registerError'] == 'true'
  // verificar erro de registo
  res.clearCookie('registerError')
  res.render('register',{error:registerError,d:data})
});

/* POST users register. */
router.post('/register', function(req, res, next) {
  var data = new Date().getTime().toString()
  // verificar se password e confirmacao de password coincidem
  if(req.body.password == req.body.confirmPassword){
    // verificar se username esta disponivel
    userController.getUserByUsername(req.body.username)
      .then(result => {
        // disponivel
        if(result == null){
          // criar novo utilizador
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
        // username ja usado
        else{
          res.cookie('registerError','true')
          res.redirect('register')
        }
        
      })
      .catch(err => {
        console.log('Erro: ' + err)
        res.redirect('/users/register')
      })
  }
});



/* GET users logout. */
router.get('/logout', requireAuthentication,function(req, res, next) {
    clearJwtToken(res)
    res.redirect('/')
    // req.logout(function(err){
    //     if(err)
    //         res.render('error',{error:err})
    //     else
    //     {
    //       res.clearCookie('user_token')
    //       res.redirect('/')
    //     }
    // })
  });



/* GET users notificacoes. */
router.get('/api/notifications', verifyAuthentication,function(req, res, next) {
  if(req.body.logged){
    username = req.body.username
    userController.getUserByUsername(username)
    .then(user => {
      res.json({notifications:user.notifications})
    })
  }
});

/** POST de notificacao vista */
router.post('/api/notifications/seen/:id', requireAuthentication,function(req, res, next) {
  notificationId = req.params.id
  username = req.body.username
  userController.seeNotification(username,notificationId)
  .then(user => {
    res.json({})
  })
});

/** Post para remover notificacao */
router.post('/api/notifications/remove/:id', requireAuthentication,function(req, res, next) {
  notificationId = req.params.id
  username = req.body.username
  userController.removeNotification(username,notificationId)
  .then(user => {
    res.json({})
  })
});

module.exports = router;
