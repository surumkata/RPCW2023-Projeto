var User = require('../models/users')
var fs = require('fs');
var path = require('path');

// criar pasta para users de inquiricoes
if(!fs.existsSync(path.join(__dirname, '../public/images/users'))){
    fs.mkdirSync(path.join(__dirname, '../public/images/users'))
}


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

// obter user
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


// obter user por username
module.exports.getUserByEmail = email => {
    console.log('Geting user ' + email)
    return User.userModel
    .findOne({'email':email})
        .then(user => {
            return user
        })
        .catch( error => {
            return error
        }
        )
}

// atualizar user, procura usando username
module.exports.updateUserByEmail = (email,u) => {
    console.log('Updating user ' + email)
    return User.userModel
    .updateOne({'email':email},u)
        .then(user => {
            console.log('Updated user: ' + JSON.stringify(user))
            return user
        })
        .catch( error => {
            console.log('Updated user: '+ error)
            return error
        }
        )
}

// adicionar referencia a uma inquiricao em que o user realizou um post
module.exports.addPostedInquiry = (email,inquiryId) => {
    console.log('Adding post inquiry reference ' + email)
    return User.userModel
    .updateOne({'email':email},
    {"$addToSet":{"posts": inquiryId}},
    { "new": true, "upsert": true })
    .then(result => {
        console.log('Updated user post reference: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log('Updated user post reference: ' +error)
        return error
    }
    )
}

// adicionar notificacao a um user
module.exports.addUserNotificationByEmail = (email,notification) => {
    console.log('Adding notification for user ' + email + ': ' + notification)
    return User.userModel
    .updateOne({'email':email},
    {"$push":{"notifications": notification}},
    { "new": true, "upsert": true })
    .then(result => {
        console.log('Updated user notifications: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log('Updated user notifications: ' +error)
        return error
    }
    )
}

// adicionar notificacao a todos os users de um dado nivel de acesso
module.exports.addUserNotificationByLevel = (level,notification) => {
    console.log('Adding notification for user level ' + level + ': ' + notification)
    return User.userModel
    .updateOne({'level':level},
    {"$push":{"notifications": notification}},
    { "new": true, "upsert": true })
    .then(result => {
        console.log('Updated user notifications: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log('Updated user notifications: ' + error)
        return error
    }
    )
}

// atualizar notificacao do utilizador para vista
module.exports.seeNotification = (email,notificationId) => {
    console.log('Seeing notification for user ' + email + ': ' + notificationId)
    return User.userModel
    .updateOne({'email':email,'notifications._id':notificationId},
    {"$set":{"notifications.$.seen": true}})
    .then(result => {
        console.log('Updated user notification to seen: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log('Updated user notification to seen: ' +error)
        return error
    }
    )
}

// remover notificacao de utilizador
module.exports.removeNotification = (email,notificationId) => {
    console.log('Seeing notification for user ' + email + ': ' + notificationId)
    return User.userModel
    .updateOne({'email':email},
    {"$pull":{ notifications: {_id : notificationId}}})
    .then(result => {
        console.log('Updated user notification to seen: ' + JSON.stringify(result))
        return result
    })
    .catch( error => {
        console.log('Updated user notification to seen: ' +error)
        return error
    }
    )
}

/** Atualiza valor de ultimo acesso de user */
module.exports.updateLastAccess = (email) => {
    date = new Date().toISOString()
    return User.userModel
    .updateOne({'email':email},{'$set':{'lastAccess':date}})
    .then(result => {
        return result
    })
    .catch( error => {
        console.log('Updated user:  ' +error)
        return error
    }
    )
}