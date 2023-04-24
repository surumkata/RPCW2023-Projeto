//import de mongoose module
var mongoose = require('mongoose')

var usersSchema = new mongoose.Schema({
    id : String,
    password : String,
    name : String,
    level : String,
    dataCreated : String
})

module.exports.usersModel = mongoose.model('user',usersSchema)