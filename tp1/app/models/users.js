//import de mongoose module
var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose')

var usersSchema = new mongoose.Schema({
    id : String,
    password : String,
    name : String,
    level : String,
    dataCreated : String
},{collection: 'users'})

usersSchema.plugin(passportLocalMongoose)

module.exports.usersModel = mongoose.model('user',usersSchema)