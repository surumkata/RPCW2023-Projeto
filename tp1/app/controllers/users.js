var User = require('../models/users')

// Users list
module.exports.list = () => {
    return User.userModel
    .find()
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
            
        })
        .catch( error => {
            return error
        }
        )
}