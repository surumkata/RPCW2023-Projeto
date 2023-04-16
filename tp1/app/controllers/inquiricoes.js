var Inquiricao = require('../models/inquiricoes')

// Inquirição list
module.exports.list = () => {
    return Inquiricao.inquiriesModel
    .find()
        .sort({ID:1})
        .then(docs => {
            return docs
        })
        .catch(error => {
            return error
        })
}

module.exports.getInquiricao = id => {
    return Inquiricao.inquiriesModel
    .findOne({'_id':id})
        .then(inquiricao => {
            return inquiricao
        })
        .catch( error => {
            return error
        }
        )
}