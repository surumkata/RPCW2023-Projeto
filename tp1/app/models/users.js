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
    email: {
        type: String,
        required: true,
        unique: true
    },
    username : {
        type: String,
        required: true,
        minlength: 1,
        unique: false
    },
    level : String,
    dateCreated : Number,
    affiliations:[filiationsSchema],
    profilePicDir:String,
    posts: [String],
    notifications: [notificationsSchema],
    lastAccess: Date
},{collection: 'users'})

usersSchema.plugin(passportLocalMongoose,{usernameField: 'email',usernameUnique:false})

module.exports.userModel = mongoose.model('user',usersSchema)