var express = require('express');
const passport = require('passport');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users login. */
router.get('/login', function(req, res, next) {
    var data = new Date().toISOString().substring(0, 16)
    console.log('Na cb do GET login')
    console.log(req.sessionID)
    res.render('login',{d:data})
  });

/* POST users login. */
router.post('/login', passport.authenticate('local'), function(req, res, next) {
    console.log('Na cb do POST login...')
    console.log('Auth: ' + JSON.stringify(req.user))
    res.redirect('/protegida')
  });

/* GET users logout. */
router.get('/logout', function(req, res, next) {
    console.log('Na cb do GET logout...')
    console.log(req.sessionID)
    req.logout(function(err){
        if(err)
            res.render('error',{error:err})
        else
            res.redirect('/')
    })
  });

module.exports = router;
