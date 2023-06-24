var mongoose = require('mongoose')


var activitySchema = new mongoose.Schema({
    date : Date,
    type : String,
    inquiryId: String
},{collection: 'atividades'})

module.exports.activityModel = mongoose.model('atividade',activitySchema)
