var express = require('express');
var router = express.Router();
var Inquiry = require('../controllers/inquiries')

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  Inquiry.list()
    .then(inquiries => {
      res.render('index', {is : inquiries, d : data})
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
