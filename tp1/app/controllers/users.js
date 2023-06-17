var User = require('../models/users')
var mongoose = require('mongoose')

// Users list
module.exports.list = function(page) {
    return User.userModel
    .find()
    .skip(page*100)
    .limit(100)
        .sort({ID:1})
        .then(docs => {
            return docs
        })
        .catch(error => {
            return error
        })
}

module.exports.getUser = id => {
    return User.userModel
    .findOne({'_id':id})
        .then(user => {
            return user
        })
        .catch( error => {
            return error
        }
        )
}



module.exports.getUserByUsername = username => {
    return User.userModel
    .findOne({'username':username})
        .then(user => {
            return user
        })
        .catch( error => {
            return error
        }
        )
}

module.exports.updateUserByUsername = (username,u) => {
    return User.userModel
    .updateOne({'username':username},u)
        .then(user => {
            console.log('Updated user: ' + JSON.stringify(user))
            return user
        })
        .catch( error => {
            console.log(error)
            return error
        }
        )
}


module.exports.addPostedInquiry = (username,inquiryId) => {
    return User.userModel
    .updateOne({'username':username},
    {"$addToSet":{"posts": inquiryId}},
    { "new": true, "upsert": true })
    .then(result => {
        console.log('Updated user: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log(error)
        return error
    }
    )
}


module.exports.addUserNotificationByUsername = (username,notification) => {
    console.log('Adding notification for user ' + username + ': ' + notification)
    return User.userModel
    .updateOne({'username':username},
    {"$push":{"notifications": notification}},
    { "new": true, "upsert": true })
    .then(result => {
        console.log('Updated user: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log(error)
        return error
    }
    )
}

module.exports.addUserNotificationByLevel = (level,notification) => {
    console.log('Adding notification for user level ' + level + ': ' + notification)
    return User.userModel
    .updateOne({'level':level},
    {"$push":{"notifications": notification}},
    { "new": true, "upsert": true })
    .then(result => {
        console.log('Updated user: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log(error)
        return error
    }
    )
}


module.exports.seeNotification = (username,notificationId) => {
    console.log('Seeing notification for user ' + username + ': ' + notificationId)
    return User.userModel
    .updateOne({'username':username,'notifications._id':notificationId},
    {"$set":{"notifications.$.seen": true}})
    .then(result => {
        console.log('Updated user notification to seen: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log(error)
        return error
    }
    )
}

module.exports.removeNotification = (username,notificationId) => {
    console.log('Seeing notification for user ' + username + ': ' + notificationId)
    return User.userModel
    .updateOne({'username':username},
    {"$pull":{ notifications: {_id : notificationId}}})
    .then(result => {
        console.log('Updated user notification to seen: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log(error)
        return error
    }
    )
}

