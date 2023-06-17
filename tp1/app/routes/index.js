var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
var Inquiry = require('../controllers/inquiries')
var User = require('../controllers/users')
var Post = require('../controllers/posts')
var consts = require('../utils/const')


/** Verifica estado de autenticacao */
function verifyAuthentication(req, res, next){
  console.log('Verify authentication')
  req.body.logged = false
  req.body.level = 0
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

/** Verifica autenticacao e redireciona para pagina de login se utilizador nao estiver logged */
function requireAuthentication(req,res,next){
  console.log('Require authentication')
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
          return next()
        }else{
          return res.redirect('/users/login')
        }
      })
    }
    else{
      return res.redirect('/users/login')
    }
  }
  else{
    return res.redirect('/users/login')
  }
}


/** Verifica autenticacao de nivel admin */
function requireAdmin(req,res,next){
  console.log('Require Admin')
  console.log('User (verif,): '+JSON.stringify(req.user))
  if(req.cookies && 'user_token' in req.cookies){
    var token = req.cookies['user_token']
    console.log('Token: ' + token)
    if(token){
      jwt.verify(token, consts.sessionSecret, function(e, payload){
        if(!e){
          console.log('Logged in.')
          console.log('Payload: ' + JSON.stringify(payload))

          if(payload.level != 1){
            return res.json({error: 'Unauthorized access.'})
          }

          req.body.logged = true
          req.body.username = payload.username
          req.body.level = payload.level

          return next()
        }else{
          return res.redirect('/users/login')
        }
      })
    }else{
      return res.redirect('/users/login')
    }
  }
  else{
    return res.redirect('/users/login')
  }
}


/* GET home page. */
router.get('/',verifyAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = false
  username = null
  if(req.body.logged){
    logged = req.body.logged
    username = req.body.username
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
      res.render('index', {username:username, is : inquiries, d : data,logged : logged})
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
  if(req.body.logged){
    logged = req.body.logged
    username = req.body.username
  }
  console.log(req.params.id)
  id = req.params.id
  Inquiry.getInquiry(id)
    .then(inquiry => {
      if(inquiry){
        console.log('Inquiry: ',JSON.stringify(inquiry))
        if('comments' in inquiry){
          comments = inquiry.comments
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


/* GET edited inquiry page. */
router.get('/editedInquiry/:id',requireAdmin, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.body.logged
  username = req.body.username
  console.log(req.params.id)
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
  logged = req.body.logged
  username = req.body.username
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


/** POST de sugestao de edicao de um inquerito */
router.post('/inquiry/:id/edit',requireAuthentication, function(req, res, next) {
  var data = new Date().toISOString().substring(0, 16)
  logged = req.body.logged
  username = req.body.username
  userLevel = req.body.level
  id = req.params.id
  console.log('Body:' , JSON.stringify(req.body))
  var editedInquiry = {
    originalId: id,
    editor: username,
    dateEdited : data,
    relations_id : []
  }
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
  console.log('New relation:' , JSON.stringify(editedInquiry))
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
  user = req.body.username
  post = req.body.post
  Post.addPost(id,user,post,null)
  .then(post => {
    Inquiry.addPost(id,user,post)
    .then(result => {
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
  user = req.body.username
  response = req.body.response
  postId = req.query.post

  Post.addPost(inquiryId,user,response,postId)
  .then(response => {
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
  })
  .catch(erro => {
    res.render('error', {error: erro, message: "Erro na criação da response"})
  })
  
});



module.exports = router;
