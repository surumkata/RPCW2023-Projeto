var express = require('express');
var multer = require('multer');
const passport = require('passport');
var fs = require('fs');
var path = require('path');
var User = require('../models/users')
var userController = require('../controllers/users')
var consts = require('../utils/const')
var router = express.Router();

var upload = multer({dest:'uploads'})

var verifyAuthentication = consts.verifyAuthentication
var requireAuthentication = consts.requireAuthentication
var requireAdmin = consts.requireAdmin
var createJwtToken = consts.createJwtToken
var clearJwtToken = consts.clearJwtToken




/* GET users profile page. */
router.get('/profile', requireAuthentication,function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)

  logged = req.user.logged
  username = req.user.username
  email = req.user.email

  userController.getUserByEmail(email)
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


  logged = req.user.logged
  username = req.user.username
  email = req.user.email


  userController.getUserByEmail(email)
  .then(user => {
    res.render('editUserProfile',{username:username,logged : logged,d:data,user:user})
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
});

/* POST users profile page. */
router.post('/editProfile',requireAuthentication,upload.single('profilePic') ,function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  email = req.user.email
  // criar objeto de utilizador modificado
  var u = {
    affiliations : []
  }
  if(req.body.username){
    u['username'] = req.body.username
  }

  if(req.body.affiliationName){
    if(Array.isArray(req.body.affiliationName)){
      for(i in req.body.affiliationName){
        let new_affiliation = {}
        new_affiliation['name'] = req.body.affiliationName[i]
        new_affiliation['relation'] = req.body.affiliationRelation[i]
        new_affiliation['process'] = req.body.affiliationProcess[i]
        u.affiliations.push(new_affiliation)
      }
    }else{
      let new_affiliation = {}
      new_affiliation['name'] = req.body.affiliationName
      new_affiliation['relation'] = req.body.affiliationRelation
      new_affiliation['process'] = req.body.affiliationProcess
      u.affiliations.push(new_affiliation)
    }
  }

  // upload de profile pic
  if(req.file){
    let oldPath = path.join(__dirname,'/../' + req.file.path)
    let fileExtension = req.file.originalname.split('.').slice(-1)
    let userImagesPath = path.join(__dirname,'/../public/images/users/'+email)
    let newPath = path.join(userImagesPath,'/profilePic.' + fileExtension)
    // criar pasta para imagens do utilizador se nao houverem
    if (!fs.existsSync(userImagesPath)){
      fs.mkdirSync(userImagesPath);
    }
    // mover imagem da pasta uploads para pasta do utilizador
    fs.renameSync(oldPath, newPath)
    // adicionar campo de diretoria de imagem de perfil ao user
    u['profilePicDir'] = '/images/users/'+email+'/profilePic.'+fileExtension
  }

  userController.updateUserByEmail(email,u)
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
      createJwtToken(user.email,user.username,user.level,
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


/** Get de autenticacao com google */
router.get('/login/google', passport.authenticate("google", { scope: ["email", "profile"] }));

/** Obter data de user com autenticacao por google */
router.get("/login/google/callback",passport.authenticate("google", { session: false }),(req, res) => {
  console.log('Authentication with google callback')
  username = req.user.username
  email = req.user.email
  level = req.user.level
  return createJwtToken(email,username,level,
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
      else{
        res.cookie('user_token',token,{httpOnly: true})
        res.redirect('/')
      }
    })
});


/** Get de autenticacao com facebook */
router.get('/login/facebook', passport.authenticate("facebook", {authType: 'reauthenticate',scope:'email'}));

/** Obter data de user com autenticacao por google */
router.get("/login/facebook/callback",passport.authenticate("facebook", { session: false }),(req, res) => {
  console.log('Authentication with facebook callback')
  username = req.user.username
  email = req.user.email
  level = req.user.level
  return createJwtToken(email,username,level,
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
      else{
        res.cookie('user_token',token,{httpOnly: true})
        res.redirect('/')
      }
    })
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
  var email = req.body.email
  var username = req.body.username
  var password = req.body.password
    // verificar se username esta disponivel
    userController.getUserByEmail(email)
      .then(result => {
        // disponivel
        if(result == null){

          // adicionar imagem default ao utilizador
          let defaultPicPath = path.join(__dirname,'/../public/images/default/profilePic.png')
          let userImagesPath = path.join(__dirname,'/../public/images/users/'+email)
          let newPath = path.join(userImagesPath,'/profilePic.png')
          // criar pasta para imagens do utilizador se nao houver
          if (!fs.existsSync(userImagesPath)){
            fs.mkdirSync(userImagesPath);
          }
          // copiar imagem da pasta default para pasta do utilizador
          fs.copyFileSync(defaultPicPath, newPath)
          // adicionar campo de diretoria de imagem de perfil ao user
          profilePicDir = '/images/users/'+email+'/profilePic.png'

          // criar novo utilizador
          User.userModel.register(
            new User.userModel({ 
              email: email, 
              username: username,
              level: 0,
              dateCreated: data,
              profilePicDir:profilePicDir }), 
            password, 
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
  if(req.user.logged){
    username = req.user.username
    email = req.user.email
    userController.getUserByEmail(email)
    .then(user => {
      res.json({notifications:user.notifications})
    })
  }
});

/** POST de notificacao vista */
router.post('/api/notifications/seen/:id', requireAuthentication,function(req, res, next) {
  notificationId = req.params.id
  email = req.user.email
  userController.seeNotification(email,notificationId)
  .then(user => {
    res.json({})
  })
});

/** Post para remover notificacao */
router.post('/api/notifications/remove/:id', requireAuthentication,function(req, res, next) {
  notificationId = req.params.id
  email = req.user.email
  userController.removeNotification(email,notificationId)
  .then(user => {
    res.json({})
  })
});

module.exports = router;
