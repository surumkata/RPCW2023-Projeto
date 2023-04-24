var Inquiry = require('../models/inquiries')

// Inquirição list
module.exports.list = () => {
    return Inquiry.inquiriesModel
    .find()
        .sort({ID:1})
        .then(docs => {
            return docs
        })
        .catch(error => {
            return error
        })
}

module.exports.getInquiry = id => {
    return Inquiry.inquiriesModel
    .findOne({'_id':id})
        .then(inquiry => {
            return inquiry
        })
        .catch( error => {
            return error
        }
        )
}