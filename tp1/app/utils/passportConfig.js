const GoogleStrategy = require("passport-google-oauth2").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require("../models/users").userModel;
const path = require("path")
const fs = require("fs");



module.exports.googleStrategy = (passport) => {
    passport.use('google',new GoogleStrategy({
        clientID: process.env.googleCLIENT_ID,
        clientSecret: process.env.googleCLIENT_SECRET,
        callbackURL: process.env.googleCallbackURL,
        passReqToCallback : true
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log('Got user')
            let username = profile.displayName
            let email = profile.emails[0].value
            let level = 0
            let existingUser = await User.findOne({ 'email': email });
            // if user exists return the user
            if (existingUser) {
              return done(null, existingUser);
            }
            var data = new Date().getTime().toString()
            // adicionar imagem default ao utilizador
            let defaultPicPath = path.join(__dirname,'/../public/images/default/profilePic.png')
            let userImagesPath = path.join(__dirname,'/../public/images/users/'+email)
            let newPath = path.join(userImagesPath,'/profilePic.png')
            // criar pasta para imagens do utilizador se nao houver
            if (!fs.existsSync(userImagesPath)){
              fs.mkdirSync(userImagesPath);
            }
            // copiar imagem da pasta default para pasta do utilizador
            fs.copyFileSync(defaultPicPath, newPath)
            // adicionar campo de diretoria de imagem de perfil ao user
            profilePicDir = '/images/users/'+email+'/profilePic.png'
  
            // if user does not exist create a new user 
            console.log('Creating new user...');
            const newUser = new User({
              username: username,
              email: email,
              level: level,
              dateCreated: data,
              profilePicDir:profilePicDir
            });
            await newUser.save();
            return done(null, newUser);
            
        } catch (error) {
            return done(error, false)
        }
      }
    ));
  }


  module.exports.facebookStrategy = (passport) => {
    passport.use('facebook',new FacebookStrategy({
      clientID: process.env.facebookCLIENT_ID,
      clientSecret: process.env.facebookCLIENT_SECRET,
      callbackURL: process.env.facebookCallbackURL,
      passReqToCallback : true,
      profileFields: ['id', 'emails', 'name']
    },
      async (request,accessToken, refreshToken, profile, done) => {
        try {
            console.log('Got user',JSON.stringify(profile._json))
            const { email, first_name, last_name } = profile._json;
            if(email){
              let username = `${first_name} ${last_name}`
              let level = 0
              let existingUser = await User.findOne({ 'email': email });
              // if user exists return the user
              if (existingUser) {
                return done(null, existingUser);
              }
              var data = new Date().getTime().toString()
              // adicionar imagem default ao utilizador
              let defaultPicPath = path.join(__dirname,'/../public/images/default/profilePic.png')
              let userImagesPath = path.join(__dirname,'/../public/images/users/'+email)
              let newPath = path.join(userImagesPath,'/profilePic.png')
              // criar pasta para imagens do utilizador se nao houver
              if (!fs.existsSync(userImagesPath)){
                fs.mkdirSync(userImagesPath);
              }
              // copiar imagem da pasta default para pasta do utilizador
              fs.copyFileSync(defaultPicPath, newPath)
              // adicionar campo de diretoria de imagem de perfil ao user
              profilePicDir = '/images/users/'+email+'/profilePic.png'
    
              // if user does not exist create a new user 
              console.log('Creating new user...',email,username);
              const newUser = new User({
                username: username,
                email: email,
                level: level,
                dateCreated: data,
                profilePicDir:profilePicDir
              });
              console.log('User created...');
              await newUser.save();
              console.log('User saved...');
              return done(null, newUser);
            }else{
              return done(error, false)
            }
            
        } catch (error) {

            return done(error, false)
        }
      }
    ));
  }