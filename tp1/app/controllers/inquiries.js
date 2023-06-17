var Inquiry = require('../models/inquiries')
var userController = require('../controllers/users')

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

module.exports.getEditedInquiry = id => {
    return Inquiry.editedInquiriesModel
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



module.exports.addEditedInquiry = (originalId,editedInquiry,username,userLevel) => {
    data = new Date().getTime().toString()
    return this.getInquiry(originalId)
    .then(inquiry => {
        if(inquiry){
            return Inquiry.editedInquiriesModel
                .create(inquiry.toJSON())
                .then(result => {
                    if(result){
                        return Inquiry.editedInquiriesModel
                            .updateOne({_id:originalId},editedInquiry)
                            .then(result => {
                                console.log('Added edited inquiry')
                                notification = {
                                    dateCreated : data,
                                    message: `${username} requested an edition of an inquiry`,
                                    url: `/editedInquiry/${inquiry._id}`
                                }
                                userController.addUserNotificationByLevel(1,notification)
                                return result
                            })
                            .catch( error => {
                                console.log('Erro edited inquiry (updated edited inquiry):',error)
                                return error
                            })
                    }
                    return result
                })
                .catch( error => {
                    console.log('Erro edited inquiry (creating edited inquiry):',error)
                    return error
                })
        }
        return inquiry
        
    })
    .catch( error => {
        console.log('Erro edited inquiry (searching original):',error)
        return error
    })
}