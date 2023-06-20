var jwt = require('jsonwebtoken')

// segredo jwt
module.exports.sessionSecret = 'inquiricoesSecret'



/** Verifica estado de autenticacao */
module.exports.verifyAuthentication = function(req, res, next){
    console.log('Verify authentication')
    req.user ={logged:false,level:0}
    if(req.cookies && 'user_token' in req.cookies){
      var token = req.cookies['user_token']
      console.log('Token: ' + token)
      if(token){
        jwt.verify(token, exports.sessionSecret, async function(e, payload){
          if(!e){
            console.log('Logged in.')
            console.log('Payload: ' + JSON.stringify(payload))
            req.user = {email:payload.email,username:payload.username, logged:true,level:payload.level}
            // atualizar token
            await exports.updateJwtToken(res,payload.email,payload.username,payload.level)
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
    if(req.cookies && 'user_token' in req.cookies){
      var token = req.cookies['user_token']
      console.log('Token: ' + token)
      if(token){
        jwt.verify(token, exports.sessionSecret, async function(e, payload){
          if(!e){
            console.log('Logged in.')
            console.log('Payload: ' + JSON.stringify(payload))
            req.user = {email:payload.email,username:payload.username, logged:true,level:payload.level}
            // atualizar token
            await exports.updateJwtToken(res,payload.email,payload.username,payload.level)

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
    if(req.cookies && 'user_token' in req.cookies){
      var token = req.cookies['user_token']
      console.log('Token: ' + token)
      if(token){
        jwt.verify(token, exports.sessionSecret, async function(e, payload){
          if(!e){
            console.log('Logged in.')
            console.log('Payload: ' + JSON.stringify(payload))
            req.user = {email:payload.email,username:payload.username, logged:true,level:payload.level}
            // atualizar token
            await exports.updateJwtToken(res,payload.email,payload.username,payload.level)

            if(payload.level != 1){
              return res.json({error: 'Unauthorized access.'})
            }
  
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
module.exports.createJwtToken = function(email,username,level,callback){
    jwt.sign({
        email:email,
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
module.exports.updateJwtToken = async function(res,email,username,level){
    exports.clearJwtToken(res)
    await exports.createJwtToken(email,username,level,
        function(e,token){
            if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
            else{
            res.cookie('user_token',token,{httpOnly: true})
            console.log('Token created')
            }
        })

}