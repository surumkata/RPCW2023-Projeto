var express = require('express');
var router = express.Router();
var Inquiry = require('../controllers/inquiries')
var User = require('../controllers/users')
var Post = require('../controllers/posts')
var consts = require('../utils/const')

var verifyAuthentication = consts.verifyAuthentication
var requireAuthentication = consts.requireAuthentication
var requireAdmin = consts.requireAdmin



/** Processa query por filtros de pesquisa */
function getQueryFilters(req){
  var searchQuery = {}
  var sortQuery = {UnitId:1}
  var page = req.query.page

  // paginacao das inquiricoes
  if(!page){
    page = 0
  }else{
    page = parseInt(page)
  }

  // procura por nome de pessoa
  personName = req.query.searchName
  if(personName){
    searchQuery['UnitTitle'] = { '$regex' : new RegExp(personName, 'i').source,'$options':'i'}
  }

  // procura por nome de pessoa
  searchPlace = req.query.searchPlace
  if(searchPlace){
    searchQuery['birthplace'] = { '$regex' : new RegExp(searchPlace, 'i').source,'$options':'i'}
  }

  // procura por data de inicio
  timeStart = req.query.searchTimeStart
  if(timeStart){
    searchQuery['UnitDateInitial'] = {"$gte":new Date(timeStart)}
  }

  // procura por data de fim
  timeEnd = req.query.searchTimeEnd
  if(timeEnd){
    searchQuery['UnitDateFinal'] = {"$lte" : new Date(timeEnd)}
  }

  // sorting por tipo de dado
  sortType = req.query.sort
  if(sortType){
    var type = ''
    switch (sortType) {
      case 'id':
        type = 'UnitId'
        break;
      case 'person':
        type = 'UnitTitle'
        break;
      case 'birthplace':
        type = 'birthplace'
        break;
      case 'startDate':
        type = 'UnitDateInitial'
        break;
      case 'endDate':
        type = 'UnitDateFinal'
        break;
      default:
        type = 'UnitId'
        break;
    }
    sortQuery = {}
    sortQuery[type] = 1
  }
  return [page,searchQuery,sortQuery]
}


/* GET home page. */
router.get('/',verifyAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  username = null
  // default documentos por pagina
  var docPerPage = 100
  // valores de utilizador, se estiver logged
  if(req.user.logged){
    logged = req.user.logged
    username = req.user.username
  }
  // obter filtros de pesquisa de documentos
  var [page,searchQuery,sortQuery] = getQueryFilters(req)
  Inquiry.list(page,searchQuery,sortQuery,docPerPage)
    .then(inquiries => {
      Inquiry.totalCount(searchQuery)
      .then(totalCount => {
        // verificar se ha mais paginas de documentos
        hasNextPage = (totalCount - (page+1) * docPerPage)>0
        res.render('index', {username:username,logged : logged,timeStartValue:timeStart,timeEndValue:timeEnd, is : inquiries, d : data,page:page,hasNextPage:hasNextPage})
      })
      .catch(erro => {
        res.render('error', {error : erro, message : "Erro na obtenção da lista de inquisições"})
      })
    })
    .catch(erro => {
      res.render('error', {error : erro, message : "Erro na obtenção da lista de inquisições"})
    })
});


/* GET inquiry page. */
router.get('/inquiry/:id',verifyAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  username = null
  if(req.user.logged){
    logged = req.user.logged
    username = req.user.username
  }
  id = req.params.id
  Inquiry.getInquiry(id)
    .then(inquiry => {
      if(inquiry){
        if('comments' in inquiry){
          comments = inquiry.comments
          // processar posts da inquiricao
          Post.getOriginComments(id)
          .then(posts=>{
            posts = Post.processPosts(posts)
            comments = Post.processComments(posts,comments)
            res.render('inquiry', {username:username,logged : logged,i: inquiry,posts:comments, d: data })
          })
          .catch(erro => {
            res.render('error', {error: erro, message: "Erro na obtenção dos posts"})
          })
        }else{
          res.render('inquiry', {username:username,logged : logged,i: inquiry,posts:[], d: data });
        }
      }else{
        res.redirect('/')
      }
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção da pagina de inquiricao"})
    })
});


/* GET create inquiry page. */
router.get('/createInquiry',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  res.render('createInquiry', {username:username,logged : logged, d: data} );
});

/* Post create inquiry */
router.post('/createInquiry',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  userLevel = req.user.level
  
  // processar inquiry
  var newInquiry = {
    editor: username,
    dateEdited : data,
    relations_id : []
  }
  // Verificar modificações nas relaçoes
  if(req.body.relationName){
    if(Array.isArray(req.body.relationName)){
      for(i in req.body.relationName){
        new_relation = {}
        new_relation['type'] = req.body.relationType[i]
        new_relation['name'] = req.body.relationName[i]
        new_relation['id'] = req.body.relationId[i]
        newInquiry.relations_id.push(new_relation)
      }
    }else{
      new_relation = {}
      new_relation['type'] = req.body.relationType
      new_relation['name'] = req.body.relationName
      new_relation['id'] = req.body.relationId
      newInquiry.relations_id.push(new_relation)
    }
  }
  newInquiryId = Inquiry.newId()
  Inquiry.newUnitId()
  .then(newUnitId =>{
    newInquiry['UnitId'] = newUnitId
    console.log('Adding inquiry',newInquiry)
    if(userLevel == 1){
      newInquiry['_id'] = newInquiryId
      Inquiry.addInquiry(newInquiry)
    }else{
      newInquiry['originalId'] = newInquiryId
      Inquiry.addEditedInquiry(null,newInquiry,username)
    }
    res.redirect('/');
  })
  .catch(erro => {
    res.render('error', {error: erro, message: "Erro na obtenção do registo de Inquirição"})
  })
});


/* GET edited inquiry page. Apenas admins. */
router.get('/editedInquiry/:id',requireAdmin, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  id = req.params.id
  Inquiry.getEditedInquiry(id)
    .then(inquiry => {
      if(inquiry){
        res.render('editedInquiry', {username:username,logged : logged,i: inquiry, d: data} );
      }else{
        res.json({message: 'Task already dealt with.'})
      }
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção do registo de Inquirição"})
    })
});

/** POST de aceitação de uma sugestao de edicao de inquerito */
router.post('/editedInquiry/accept/:id',requireAdmin, function(req, res) {
  var data = new Date().toISOString().substring(0, 16)
  var id = req.params.id
  Inquiry.acceptEditedInquiry(id)
  res.redirect('/')
})

router.post('/editedInquiry/reject/:id',requireAdmin, function(req, res) {
  var data = new Date().toISOString().substring(0, 16)
  var id = req.params.id
  Inquiry.removeEditedInquiry(id,true)
  res.redirect('/')
})


/* GET inquiry edit page. */
router.get('/inquiry/:id/edit',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  console.log(req.params.id)
  id = req.params.id
  Inquiry.getInquiry(req.params.id)
    .then(inquiry => {
      res.render('editInquiry', {username:username,logged : logged, id:id,i: inquiry, d: data });
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na obtenção do registo de Inquirição"})
    })
});


/** POST de sugestao de edicao de um inquerito. Se for admin a sugerir, modificacao é imediatamente aplicada */
router.post('/inquiry/:id/edit',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  userLevel = req.user.level
  id = req.params.id
  var editedInquiry = {
    originalId: id,
    editor: username,
    dateEdited : data,
    relations_id : []
  }
  // Verificar modificações nas relaçoes
  if(req.body.relationName){
    if(Array.isArray(req.body.relationName)){
      for(i in req.body.relationName){
        new_relation = {}
        new_relation['type'] = req.body.relationType[i]
        new_relation['name'] = req.body.relationName[i]
        new_relation['id'] = req.body.relationId[i]
        editedInquiry.relations_id.push(new_relation)
      }
    }else{
      new_relation = {}
      new_relation['type'] = req.body.relationType
      new_relation['name'] = req.body.relationName
      new_relation['id'] = req.body.relationId
      editedInquiry.relations_id.push(new_relation)
    }
  }
  // admin imediatamente modifica inquiricao
  if(userLevel == 1){
    Inquiry.updateInquiry(id,editedInquiry)
  }else{
    Inquiry.addEditedInquiry(id,editedInquiry,username)
  }
  res.redirect(`/inquiry/${id}`);
});



/** Post de um novo post numa inquiricao */
router.post('/inquiry/post/:id',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log('Novo post')
  console.log('Id: '+ req.params.id)
  id = req.params.id
  user = req.user.username
  post = req.body.post
  // adicionar post
  Post.addPost(id,user,post,null)
  .then(post => {
    // adicionar referencia ao post na inquiricao
    Inquiry.addPost(id,user,post)
    .then(result => {
      // adicionar referencia ao post no user
      User.addPostedInquiry(user,id)
      .then(result => {
        res.redirect('../'+id);
      })
      .catch(erro => {
        res.render('error', {error: erro, message: "Erro na adicao do inquerito nos posts do user"})
      })
    })
    .catch(erro => {
      res.render('error', {error: erro, message: "Erro na adicao do post na inquiricao"})
    })
    })
  .catch(erro => {
    res.render('error', {error: erro, message: "Erro na criação do post"})
  })
  
});

/** Post de uma nova resposta numa inquiricao */
router.post('/inquiry/response/:id',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  console.log('Novo post')
  console.log('Id: '+ req.params.id)
  inquiryId = req.params.id
  user = req.user.username
  response = req.body.response
  postId = req.query.post

  // adicionar post
  Post.addPost(inquiryId,user,response,postId)
  .then(response => {
      // adicionar referencia de post na inquiricao 
      Inquiry.addPostResponse(inquiryId,user,postId,response)
      .then(result => {
        // adicionar referencia de post no user
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
  })
  .catch(erro => {
    res.render('error', {error: erro, message: "Erro na criação da response"})
  })
});



module.exports = router;
