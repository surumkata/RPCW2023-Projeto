var User = require('../models/users')

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
