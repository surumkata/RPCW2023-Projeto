var Inquiry = require('../models/inquiries')

// Inquirição list
module.exports.list = page => {
    return Inquiry.inquiriesModel
    .find()
    .sort({UnitId:1})
    .skip(page*100)
    .limit(100)
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


module.exports.addPost = (id,user,post) =>{
    console.log('Inquiry post by user: ' + user)
    data = new Date().getTime().toString()
    newPost = {
        _id: post._id.toHexString(),
        postResponses: []
    }
    return Inquiry.inquiriesModel
    .updateOne({'_id':id},
    {"$push":{"comments": newPost}},
    { "new": true, "upsert": true })
    .then(inquiry => {
        return inquiry
    })
    .catch( error => {
        return error
    })

}


module.exports.addPostResponse = (inquiryId,user,postId,response) => {
    console.log('Response by user: ' + user)
    data = new Date().getTime().toString()
    newResponse = {
        _id: response._id.toHexString(),
        postResponses: []
    }
    return Inquiry.inquiriesModel
    .updateOne({'_id':inquiryId,'comments._id':postId},
    {"$push":{"comments.$.postResponses": newResponse}},
    { "new": true, "upsert": true })
    .then(inquiry => {
        console.log('Inquiry',inquiry)
        return inquiry
    })
    .catch( error => {
        console.log(error)
        return error
    })
}