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


module.exports.addPostedInquiry = (username,inquiryId) => {
    return User.userModel
    .updateOne({'username':username},
    {"$addToSet":{"posts": inquiryId}},
    { "new": true, "upsert": true },
    function (err, res) {
        if (err) throw err;
        console.log(res);
    }
    )
}