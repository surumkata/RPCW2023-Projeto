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

var usersSchema = new mongoose.Schema({
    name : String,
    level : String,
    dateCreated : String,
    email:String,
    filiation:String,
    posts: [String],
    notifications: [notificationsSchema]
},{collection: 'users'})

usersSchema.plugin(passportLocalMongoose)

module.exports.userModel = mongoose.model('user',usersSchema)