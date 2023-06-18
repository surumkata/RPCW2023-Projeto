var Inquiry = require('../models/inquiries')
var userController = require('../controllers/users')

// Inquirição list
module.exports.list = (page,searchQuery,sortQuery,docPerPage) => {
    return Inquiry.inquiriesModel
    .find(searchQuery)
    .sort(sortQuery)
    .skip(page*docPerPage)
    .limit(docPerPage)
        .then(docs => {
            return docs
        })
        .catch(error => {
            console.log('Error:',error)
            return error
        })
}

module.exports.totalCount = (searchQuery,docPerPage) => {
    return Inquiry.inquiriesModel
    .find(searchQuery)
    .count()
    .then(count => {
        return count
    })
    .catch(error => {
        console.log('Error:',error)
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
            console.log('Error:',error)
            return error
        }
        )
}

module.exports.updateInquiry = (id,uInquiry) => {
    console.log('Update inquiry',id)
    return Inquiry.inquiriesModel
    .updateOne({'_id':id},uInquiry)
        .then(result => {
            return result
        })
        .catch( error => {
            console.log('Update error:',error)
            return error
        }
        )
}

module.exports.removeEditedInquiry = id => {
    return Inquiry.editedInquiriesModel
    .findOneAndRemove({'_id':id})
        .then(result => {
            return result
        })
        .catch( error => {
            console.log('Error:',error)
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
            console.log('Error:',error)
            return error
        }
        )
}

module.exports.acceptEditedInquiry = id => {
    console.log('Accepting edited inquiry',id)
    data = new Date().getTime().toString()
    return Inquiry.editedInquiriesModel
    .findOne({'_id':id},{_id:0})
    .then(inquiry => {
        if(inquiry){
            editor = inquiry.editor
            originalId = inquiry.originalId
            dateEdited = inquiry.dateEdited
            notification = {
                dateCreated : data,
                message: `A tua edição da inquirição ${originalId} foi aceite`,
                url: `/inquiry/${originalId}`
            }
            userController.addUserNotificationByUsername(editor,notification)
            this.updateInquiry(originalId,inquiry)
            this.removeEditedInquiry(id,false)
        }
        return inquiry
    })
    .catch( error => {
        console.log('Error:',error)
        return error
    }
    )
}

module.exports.removeEditedInquiry = (id,sendNotification) => {
    console.log('Removing edited inquiry',id)
    data = new Date().getTime().toString()
    return Inquiry.editedInquiriesModel
    .findOneAndRemove({'_id':id})
        .then(inquiry => {
            if(sendNotification){
                originalId = inquiry.originalId
                editorId = inquiry.editor
                notification = {
                    dateCreated : data,
                    message: `A tua edição da inquirição ${originalId} foi rejeitada`,
                    url: `/inquiry/${originalId}`
                }
                userController.addUserNotificationByUsername(editorId,notification)
            }
            return inquiry
        })
        .catch( error => {
            console.log('Error:',error)
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
        console.log('Error:',error)
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
        console.log('Error:',error)
        return error
    })
}



module.exports.addEditedInquiry = (originalId,editedInquiry,username,userLevel) => {
    data = new Date().getTime().toString()
    return this.getInquiry(originalId)
    .then(inquiry => {
        if(inquiry){
            inquiry._id = undefined
            return Inquiry.editedInquiriesModel
                .create(inquiry.toJSON())
                .then(newInquiry => {
                    if(newInquiry){
                        return Inquiry.editedInquiriesModel
                            .updateOne({_id:newInquiry._id},editedInquiry)
                            .then(result => {
                                console.log('Added edited inquiry')
                                notification = {
                                    dateCreated : data,
                                    message: `${username} requested an edition of an inquiry`,
                                    url: `/editedInquiry/${newInquiry._id}`
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