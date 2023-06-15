var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
var Inquiry = require('../controllers/inquiries')
var User = require('../controllers/users')
var consts = require('../utils/const')


function verifyAuthentication(req, res, next){
  req.body.logged = false
  req.body.level = 0
  console.log('Cookies: ' +req.cookies)
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
        else{
          console.log('Error: ' + e)
        }
      })
    }
  }
  next()
}


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


/* GET home page. */
router.get('/',verifyAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  user = null
  if(req.body.logged){
    logged = req.body.logged
    user = req.body.username
  }

  // paginacao das inquiricoes
  page = req.query.page
  if(!page){
    page = 0
  }else{
    page = parseInt(page)
  }

  Inquiry.list(page)
    .then(inquiries => {
      res.render('index', {user:user, is : inquiries, d : data,logged : logged})
    })
    .catch(erro => {
      res.render('error', {error : erro, message : "Erro na obtenção da lista de inquisições"})
    })
});

/* GET Pessoa page. */
router.get('/inquiry/:id', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log(req.params.id)
  id = req.params.id
  Inquiry.getInquiry(req.params.id)
    .then(inquiry => {
      console.log(inquiry)
      posts = inquiry.comments
      res.render('inquiry', { id:id,i: inquiry,posts:posts, d: data });
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção do registo de Pessoa"})
    })
});

/** Post de um novo post numa inquiricao */
router.post('/inquiry/post/:id',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log('Novo post')
  console.log('Id: '+ req.params.id)
  id = req.params.id
  user = req.body.username
  post = req.body.post
  Inquiry.addPost(id,user,post)
  .then(result => {
    User.addPostedInquiry(user,id)
    .then(result => {
      res.redirect('../'+id);
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na criação do post"})
    })
  })
  .catch(erro => {
    res.render('error', {error: erro, message: "Erro na criação do post"})
  })
});

/** Post de um novo post numa inquiricao */
router.post('/inquiry/response/:id',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log('Novo post')
  console.log('Id: '+ req.params.id)
  inquiryId = req.params.id
  user = req.body.username
  response = req.body.response
  postId = req.query.post

  Inquiry.addPostResponse(inquiryId,user,postId,response)
  .then(result => {
    User.addPostedInquiry(user,inquiryId)
    .then(result => {
      res.redirect('../'+inquiryId);
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na criação da response"})
    })
  })
  .catch(erro => {
    res.render('error', {error: erro, message: "Erro na criação da response"})
  })
});



router.get('/protegida',verifyAuthentication,(req,res) => {
  var data = new Date().toISOString().substring(0, 16)
  res.render('protected',{d:data, u:req.user})
})


module.exports = router;
