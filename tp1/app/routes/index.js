var express = require('express');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var Inquiry = require('../controllers/inquiries')
var User = require('../controllers/users')
var Post = require('../controllers/posts')
var consts = require('../utils/const')
var router = express.Router();

var upload = multer({dest:'uploads'})

var verifyAuthentication = consts.verifyAuthentication
var requireAuthentication = consts.requireAuthentication
var requireAdmin = consts.requireAdmin


if(!fs.existsSync(path.join(__dirname, '../uploads'))){
  fs.mkdirSync(path.join(__dirname, '../uploads'))
}


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
  var personName = req.query.searchName
  if(personName){
    searchQuery['UnitTitle'] = { '$regex' : new RegExp(personName, 'i').source,'$options':'i'}
  }

  // procura por nome de pessoa
  var searchPlace = req.query.searchPlace
  if(searchPlace){
    searchQuery['birthplace'] = { '$regex' : new RegExp(searchPlace, 'i').source,'$options':'i'}
  }

  // procura por data de inicio
  var timeStart = req.query.searchTimeStart
  if(timeStart){
    searchQuery['UnitDateInitial'] = {"$gte":new Date(timeStart)}
  }

  // procura por data de fim
  var timeEnd = req.query.searchTimeEnd
  if(timeEnd){
    searchQuery['UnitDateFinal'] = {"$lte" : new Date(timeEnd)}
  }

  // ordenamento
  var order = req.query.order
  orderQuery = 1
  if(order == 'desc'){
    orderQuery = -1
  }

  // sorting por tipo de dado
  var sortType = req.query.sort
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
    sortQuery[type] = orderQuery
  }

  return [page,searchQuery,sortQuery,timeStart,timeEnd]
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
  var [page,searchQuery,sortQuery,timeStart,timeEnd] = getQueryFilters(req)
  Inquiry.list(page,searchQuery,sortQuery,docPerPage)
    .then(inquiries => {
      Inquiry.totalCount(searchQuery)
      .then(totalCount => {
        // verificar se ha mais paginas de documentos
        hasNextPage = (totalCount - (page+1) * docPerPage)>0
        maxPage = Math.floor(totalCount / docPerPage);
        res.render('index', {username:username,logged : logged,timeStartValue:timeStart,timeEndValue:timeEnd, is : inquiries, d : data,page:page,hasNextPage:hasNextPage,maxPage:maxPage})
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
router.post('/createInquiry',requireAuthentication,upload.single('inquiryPic'), function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  userLevel = req.user.level
  email = req.user.email
  console.log(JSON.stringify(req.body))
  // processar inquiry
  var newInquiry = {
    editor: email,
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
  if(req.body.UnitDateInitial){
    newInquiry.UnitDateInitial = req.body.UnitDateInitial
  }
  if(req.body.UnitDateFinal){
    newInquiry.UnitDateFinal = req.body.UnitDateFinal
  }

  // id para a inquiricao
  newInquiryId = Inquiry.newId()

  // upload de inquiry pic
  if(req.file){
    let oldPath = path.join(__dirname,'/../' + req.file.path)
    let fileExtension = req.file.originalname.split('.').slice(-1)
    let inquiryImagesPath
    let newPath
    let imageName
    // admin modifica diretamente imagem
    if(userLevel == 1){
      imageName = 'inquiryPic.' + fileExtension
      inquiryImagesPath = path.join(__dirname,'/../public/images/inquiries/'+newInquiryId)
      newPath = path.join(inquiryImagesPath,`/${imageName}`)
      // adicionar campo de diretoria de imagem de inquiry
      newInquiry['inquiryPicDir'] = '/images/inquiries/'+newInquiryId+'/' + imageName
    }else{
      imageName = `inquiryPic_${email}_${new Date().getTime()}.` + fileExtension
      inquiryImagesPath = path.join(__dirname,'/../public/images/editedInquiries/'+newInquiryId)
      newPath = path.join(inquiryImagesPath,`/${imageName}`)
      // adicionar campo de diretoria de imagem de inquiry
      newInquiry['inquiryPicDir'] = '/images/editedInquiries/'+newInquiryId+'/' + imageName
    }
    // criar pasta para imagens da inquiry se nao houver
    if (!fs.existsSync(inquiryImagesPath)){
      fs.mkdirSync(inquiryImagesPath);
    }
    // mover imagem da pasta uploads para pasta da inquiry
    fs.renameSync(oldPath, newPath)
  }

  
  Inquiry.newUnitId()
  .then(newUnitId =>{
    newInquiry['UnitId'] = newUnitId
    console.log('Adding inquiry',newInquiry)
    // admin imediatamente adiciona inquiry
    if(userLevel == 1){
      newInquiry['_id'] = newInquiryId
      Inquiry.addInquiry(newInquiry)
    }else{
      newInquiry['originalId'] = newInquiryId
      Inquiry.addEditedInquiry(null,newInquiry,email)
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
router.post('/inquiry/:id/edit',requireAuthentication,upload.single('inquiryPic'), function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.user.logged
  username = req.user.username
  email = req.user.email
  userLevel = req.user.level
  id = req.params.id
  var editedInquiry = {
    originalId: id,
    editor: email,
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

  // upload de inquiry pic
  if(req.file){
    let oldPath = path.join(__dirname,'/../' + req.file.path)
    let fileExtension = req.file.originalname.split('.').slice(-1)
    let inquiryImagesPath
    let newPath
    let imageName
    // admin modifica diretamente imagem
    if(userLevel == 1){
      imageName = 'inquiryPic.' + fileExtension
      inquiryImagesPath = path.join(__dirname,'/../public/images/inquiries/'+id)
      newPath = path.join(inquiryImagesPath,`/${imageName}`)
      // adicionar campo de diretoria de imagem de inquiry
      editedInquiry['inquiryPicDir'] = '/images/inquiries/'+id+'/' + imageName
    }else{
      imageName = `inquiryPic_${email}_${new Date().getTime()}.` + fileExtension
      inquiryImagesPath = path.join(__dirname,'/../public/images/editedInquiries/'+id)
      newPath = path.join(inquiryImagesPath,`/${imageName}`)
      // adicionar campo de diretoria de imagem de inquiry
      editedInquiry['inquiryPicDir'] = '/images/editedInquiries/'+id+'/' + imageName
    }
    // criar pasta para imagens da inquiry se nao houver
    if (!fs.existsSync(inquiryImagesPath)){
      fs.mkdirSync(inquiryImagesPath);
    }
    // mover imagem da pasta uploads para pasta da inquiry
    fs.renameSync(oldPath, newPath)
  }

  // admin imediatamente modifica inquiricao
  if(userLevel == 1){
    Inquiry.updateInquiry(id,editedInquiry)
  }else{
    Inquiry.addEditedInquiry(id,editedInquiry,email)
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
  email = req.user.email
  post = req.body.post
  // adicionar post
  Post.addPost(id,email,post,null)
  .then(post => {
    // adicionar referencia ao post na inquiricao
    Inquiry.addPost(id,email,post)
    .then(result => {
      // adicionar referencia ao post no user
      User.addPostedInquiry(email,id)
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
  email = req.user.email
  response = req.body.response
  postId = req.query.post

  // adicionar post
  Post.addPost(inquiryId,email,response,postId)
  .then(response => {
      // adicionar referencia de post na inquiricao 
      Inquiry.addPostResponse(inquiryId,email,postId,response)
      .then(result => {
        // adicionar referencia de post no user
        User.addPostedInquiry(email,inquiryId)
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
