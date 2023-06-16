//import de mongoose module
var mongoose = require('mongoose')


var postsSchema = new mongoose.Schema({
    parentId: String,
    author: String,
    text : String,
    dateCreated : String,
    originId : String,
},{collection:'posts'})

module.exports.postsModel = mongoose.model('post',postsSchema)