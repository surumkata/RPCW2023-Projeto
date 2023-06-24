var Post = require('../models/posts')
var userController = require('./users')
var activityController = require('../controllers/activities')

// adicionar novo post
module.exports.addPost = (originId,user,post,parent) =>{
    console.log('Post by user: ' + user)
    console.log(originId,user,post,parent)
    var data = new Date().toISOString()
    var newPost = {
        parentId: parent,
        author: user,
        text: post,
        dateCreated : data,
        originId : originId
    }
    var type = parent?'response':'post'
    // adicioanr atividade de post ou response
    activityController.register(type,originId)
    return Post.postsModel
    .create(newPost)
    .then(result => {
        console.log('Post:',result)
        if(parent){
            exports.getPost(parent)
            .then(post => {
                var postUser = post.author
                var notification = {
                    dateCreated : data,
                    message: `${user} responded to your comment`,
                    url: `/inquiry/${originId}`
                }
                // enviar notificao ao autor do post original
                userController.addUserNotificationByEmail(postUser,notification)
            })
        }
        return result
    })
    .catch( error => {
        console.log(error)
        return error
    })
}

// obter post
module.exports.getPost = (id) =>{
    return Post.postsModel
    .findOne({_id: id})
    .then(posts => {
        return posts
    })
    .catch( error => {
        return error
    })
}

// obter posts relativos a um documento
module.exports.getOriginComments = (originId) =>{
    return Post.postsModel
    .find({originId: originId})
    .then(posts => {
        return posts
    })
    .catch( error => {
        return error
    })
}

// processa os posts para um dicionario em que as chaves sao o seu campo _id
module.exports.processPosts = (posts) => {
    processedPosts = {}
    for(post in posts){
        post = posts[post]
        postId = post['_id'].toHexString()
        processedPosts[postId] = post
    }
    return processedPosts
}

// processa os comentarios para terem os valores dos posts, mantendo a ordem
module.exports.processComments = (posts,comments) => {
    var processedComments = []
    for(comment in comments){
        var new_comment = {}
        var comment = comments[comment]
        var commentId = comment._id
        if(comment._id in posts){
            post = posts[commentId]
            new_comment['id'] = commentId
            new_comment['author'] = post.author
            new_comment['dateCreated'] = post.dateCreated
            new_comment['text'] = post.text
            new_comment['postResponses'] = []
        }
        if(comment.postResponses.length > 0){
            var responses = this.processComments(posts, comment.postResponses)
            new_comment['postResponses'] = responses
        }
        if(Object.keys(new_comment).length > 0)
            processedComments.push(new_comment)
    }
    return processedComments
}