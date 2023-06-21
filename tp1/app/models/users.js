//import de mongoose module
var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose')

var notificationsSchema = new mongoose.Schema({
    dateCreated : Number,
    message: String,
    url: String,
    seen: {
        type:Boolean,
        default: false
    }
})

var filiationsSchema = new mongoose.Schema({
    name : String,
    relation: String,
    process: String
})


var usersSchema = new mongoose.Schema({
    email:String,
    username : String,
    level : String,
    dateCreated : Number,
    filiations:[filiationsSchema],
    profilePicDir:String,
    posts: [String],
    notifications: [notificationsSchema]
},{collection: 'users'})

usersSchema.plugin(passportLocalMongoose,{usernameField: 'email'})

module.exports.userModel = mongoose.model('user',usersSchema)