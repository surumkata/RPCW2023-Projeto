var jwt = require('jsonwebtoken')

// segredo jwt
module.exports.sessionSecret = 'inquiricoesSecret'



/** Verifica estado de autenticacao */
module.exports.verifyAuthentication = function(req, res, next){
    console.log('Verify authentication')
    req.body.logged = false
    req.body.level = 0
    if(req.cookies && 'user_token' in req.cookies){
      var token = req.cookies['user_token']
      console.log('Token: ' + token)
      if(token){
        jwt.verify(token, exports.sessionSecret, function(e, payload){
          if(!e){
            console.log('Logged in.')
            console.log('Payload: ' + JSON.stringify(payload))
            // atualizar token
            exports.updateJwtToken(res,payload.username,payload.level)

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
  module.exports.requireAuthentication = function(req,res,next){
    console.log('Require authentication')
    console.log('User (verif,): '+JSON.stringify(req.user))
    if(req.cookies && 'user_token' in req.cookies){
      var token = req.cookies['user_token']
      console.log('Token: ' + token)
      if(token){
        jwt.verify(token, exports.sessionSecret, function(e, payload){
          if(!e){
            console.log('Logged in.')
            console.log('Payload: ' + JSON.stringify(payload))
            // atualizar token
            exports.updateJwtToken(res,payload.username,payload.level)

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
  module.exports.requireAdmin = function(req,res,next){
    console.log('Require Admin')
    console.log('User (verif,): '+JSON.stringify(req.user))
    if(req.cookies && 'user_token' in req.cookies){
      var token = req.cookies['user_token']
      console.log('Token: ' + token)
      if(token){
        jwt.verify(token, exports.sessionSecret, function(e, payload){
          if(!e){
            console.log('Logged in.')
            console.log('Payload: ' + JSON.stringify(payload))
            // atualizar token
            exports.updateJwtToken(res,payload.username,payload.level)

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

/** Cria token jwt */
module.exports.createJwtToken = function(username,level,callback){
    console.log('A criar token',exports.sessionSecret)
    jwt.sign({
        username: username,
        level: level}, 
        exports.sessionSecret,
        {expiresIn: '1h'},
        callback)
}

/** Elimina token jwt, assumindo a cookie em que ele esta guardado */
module.exports.clearJwtToken = function(res){
    res.clearCookie('user_token')
}

/** Atualiza token jwt */
module.exports.updateJwtToken = function(res,username,level){
    exports.clearJwtToken(res)
    exports.createJwtToken(username,level,
        function(e,token){
            if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
            else{
            res.cookie('user_token',token,{httpOnly: true})
            }
        })

}