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

// criar pastas base
if(!fs.existsSync(path.join(__dirname, '../uploads'))){
  fs.mkdirSync(path.join(__dirname, '../uploads'))
}

if(!fs.existsSync(path.join(__dirname, '../public/images'))){
  fs.mkdirSync(path.join(__dirname, '../public/images'))
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

  // procura por local de nascimento
  var searchBirthPlace = req.query.searchBirthplace
  if(searchBirthPlace){
    searchQuery['birthplace'] = { '$regex' : new RegExp(searchBirthPlace, 'i').source,'$options':'i'}
  }

  // procura por concelho de residência
  var searchConcelho = req.query.searchConcelho
  if(searchConcelho){
    searchQuery['current_concelho'] = { '$regex' : new RegExp(searchConcelho, 'i').source,'$options':'i'}
  }

  // procura por distrito de residência
  var searchDistrict = req.query.searchDistrict
  if(searchDistrict){
    searchQuery['current_district'] = { '$regex' : new RegExp(searchDistrict, 'i').source,'$options':'i'}
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
      case 'current_concelho':
        type = 'current_concelho'
        break;
      case 'current_district':
        type = 'current_district'
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


/** Processa post de uma inquircao no body, devolvendo o dicionario da inquiricao */
function getInquiryFields(req,inquiryId,email,userLevel,date){

  // processar inquiry
  var inquiry = {
    editor: email,
    dateEdited : date,
    affiliations :[],
    relations_id : []
  }

  // valor de titular
  if(req.body.UnitTitle){
    inquiry.UnitTitle = req.body.UnitTitle
  }

  // valor de data de nascimento
  if(req.body.birthdate){
    inquiry.birthdate = req.body.birthdate
  }

  // valor de data de nascimento
  if(req.body.birthplace){
    inquiry.birthplace = req.body.birthplace
  }

  // valor de distrito de residencia
  if(req.body.current_district){
    inquiry.current_district = req.body.current_district
  }

  // valor de concelho de residencia
  if(req.body.current_concelho){
    inquiry.current_concelho = req.body.current_concelho
  }

  // valor de inicio de processo
  if(req.body.UnitDateInitial){
    inquiry.UnitDateInitial = req.body.UnitDateInitial
  }

  // valor de fim de processo
  if(req.body.UnitDateFinal){
    inquiry.UnitDateFinal = req.body.UnitDateFinal
  }

  // valor de localizacao fisica
  if(req.body.PhysLoc){
    inquiry.PhysLoc = req.body.PhysLoc
  }

  // valor de localizacao fisica anterior
  if(req.body.PreviousLoc){
    inquiry.PreviousLoc = req.body.PreviousLoc
  }

  // valor de material relacionado
  if(req.body.RelatedMaterial){
    inquiry.RelatedMaterial = req.body.RelatedMaterial
  }

  // valor de afiliacoes
  if(req.body.affiliationName){
    if(Array.isArray(req.body.affiliationName)){
      for(i in req.body.affiliationName){
        new_affiliation = req.body.affiliationName[i]
        inquiry.affiliations.push(new_affiliation)
      }
    }else{
      new_affiliation = req.body.affiliationName
      inquiry.affiliations.push(new_affiliation)
    }
  }

  // Verificar modificações nas relaçoes
  if(req.body.relationName){
    if(Array.isArray(req.body.relationName)){
      for(i in req.body.relationName){
        new_relation = {}
        new_relation['type'] = req.body.relationType[i]
        new_relation['name'] = req.body.relationName[i]
        new_relation['id'] = req.body.relationId[i]
        inquiry.relations_id.push(new_relation)
      }
    }else{
      new_relation = {}
      new_relation['type'] = req.body.relationType
      new_relation['name'] = req.body.relationName
      new_relation['id'] = req.body.relationId
      inquiry.relations_id.push(new_relation)
    }
  }
  if(req.body.UnitDateInitial){
    inquiry.UnitDateInitial = req.body.UnitDateInitial
  }
  if(req.body.UnitDateFinal){
    inquiry.UnitDateFinal = req.body.UnitDateFinal
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
      inquiryImagesPath = path.join(__dirname,'/../public/images/inquiries/'+inquiryId)
      newPath = path.join(inquiryImagesPath,`/${imageName}`)
      // adicionar campo de diretoria de imagem de inquiry
      inquiry['inquiryPicDir'] = '/images/inquiries/'+inquiryId+'/' + imageName
    }else{
      imageName = `inquiryPic_${email}_${new Date().getTime()}.` + fileExtension
      inquiryImagesPath = path.join(__dirname,'/../public/images/editedInquiries/'+inquiryId)
      newPath = path.join(inquiryImagesPath,`/${imageName}`)
      // adicionar campo de diretoria de imagem de inquiry
      inquiry['inquiryPicDir'] = '/images/editedInquiries/'+inquiryId+'/' + imageName
    }
    // criar pasta para imagens da inquiry se nao houver
    if (!fs.existsSync(inquiryImagesPath)){
      fs.mkdirSync(inquiryImagesPath);
    }
    // mover imagem da pasta uploads para pasta da inquiry
    fs.renameSync(oldPath, newPath)
  }

  return inquiry
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
  var logged = req.user.logged
  var username = req.user.username
  var userLevel = req.user.level
  var email = req.user.email
  console.log(JSON.stringify(req.body))

  // id para a inquiricao
  var newInquiryId = Inquiry.newId()
  // processar posted inquiry
  var newInquiry = getInquiryFields(req,newInquiryId,email,userLevel,data)
  newInquiry['Creator'] = email
  newInquiry['Created'] = data
  
  
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
  var logged = req.user.logged
  var username = req.user.username
  var email = req.user.email
  var userLevel = req.user.level
  var id = req.params.id

  // processar posted inquiry
  var editedInquiry = getInquiryFields(req,id,email,userLevel,data)


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
