var express = require('express');
var router = express.Router();
var Inquiricao = require('../controllers/inquiricoes')

/* GET home page. */
router.get('/', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  Inquiricao.list()
    .then(inquiricoes => {
      res.render('index', {is : inquiricoes, d : data})
    })
    .catch(erro => {
      res.render('error', {error : erro, message : "Erro na obtenção da lista de inquisições"})
    })
});

/* GET Pessoa page. */
router.get('/:id', function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log(req.params.id)
  Inquiricao.getInquiricao(req.params.id)
    .then(inquiricao => {
      console.log(inquiricao)
      res.render('inquiricao', { i: inquiricao, d: data });
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção do registo de Pessoa"})
    })
});


module.exports = router;
