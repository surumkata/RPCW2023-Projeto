//import de mongoose module
var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose')

var usersSchema = new mongoose.Schema({
    name : String,
    level : String,
    dateCreated : String,
    email:String,
    filiation:String,
    posts: [String]
},{collection: 'users'})

usersSchema.plugin(passportLocalMongoose)

module.exports.userModel = mongoose.model('user',usersSchema)