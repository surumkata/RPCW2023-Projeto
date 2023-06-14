var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
var Inquiry = require('../controllers/inquiries')
var consts = require('../utils/const')


function verificaAutenticacao(req, res, next){
  req.body.logged = false
  req.body.level = 0
  if('user_token' in req.cookies){
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
  }
  next()
}

/* GET home page. */
router.get('/',verificaAutenticacao, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  if(req.body.logged)
    logged = req.body.logged
  Inquiry.list(page=1)
    .then(inquiries => {
      res.render('index', {is : inquiries, d : data,logged : logged})
    })
    .catch(erro => {
      res.render('error', {error : erro, message : "Erro na obtenção da lista de inquisições"})
    })
});

/* GET Pessoa page. */
router.get('/inquiry/:id', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log(req.params.id)
  Inquiry.getInquiry(req.params.id)
    .then(inquiry => {
      console.log(inquiry)
      res.render('inquiry', { i: inquiry, d: data });
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção do registo de Pessoa"})
    })
});

function verifyAuthentication(req,res,next){
  console.log('User (verif,): '+JSON.stringify(req.user))
  if(req.isAuthenticated()){
    //return true if user is authenticated
    next()
  }
  else{
    res.redirect('/users/login')
  }
}

router.get('/protegida',verifyAuthentication,(req,res) => {
  var data = new Date().toISOString().substring(0, 16)
  res.render('protected',{d:data, u:req.user})
})


module.exports = router;
