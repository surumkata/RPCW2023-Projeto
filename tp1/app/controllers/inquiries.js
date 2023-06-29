var fs = require('fs');
var path = require('path');
var Inquiry = require('../models/inquiries')
var userController = require('../controllers/users')
const { default: mongoose } = require('mongoose')

// criar pasta para imagens de inquiricoes
if(!fs.existsSync(path.join(__dirname, '../public/images/inquiries'))){
    fs.mkdirSync(path.join(__dirname, '../public/images/inquiries'))
}

// criar pasta para imagens de inquiricoes editadas
if(!fs.existsSync(path.join(__dirname, '../public/images/editedInquiries'))){
    fs.mkdirSync(path.join(__dirname, '../public/images/editedInquiries'))
}


// Inquirição list (pode receber filtros de procura e ordenacao e paginacao)
module.exports.list = (page,searchQuery,sortQuery,docPerPage) => {
    return Inquiry.inquiriesModel
    .find(searchQuery)
    .sort(sortQuery)
    .collation({ locale: "pt", caseLevel: true })
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

// Contar numero de documentos existentes (tendo em conta o filtro passado)
module.exports.totalCount = (searchQuery) => {
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

// Obter inquiricao pelo seu id
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


// atualizar inquiricao
module.exports.updateInquiry = (id,uInquiry) => {
    console.log('Update inquiry',id)
    return Inquiry.inquiriesModel
    .updateOne({'_id':id},uInquiry,{upsert:true})
        .then(result => {
            return result
        })
        .catch( error => {
            console.log('Update error:',error)
            return error
        }
        )
}

// remover sugestao de edicao de inquiricao
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

// obter edicao de inquiricao
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

// aceitar edicao de inquiricao
module.exports.acceptEditedInquiry = id => {
    console.log('Accepting edited inquiry',id)
    data = new Date().getTime().toString()
    return Inquiry.editedInquiriesModel
    .findOne({'_id':id},{_id:0})
    .then(inquiry => {
        if(inquiry){
            let editor = inquiry.editor
            let originalId = inquiry.originalId
            let dateEdited = inquiry.dateEdited
            let inquiryPicDir = inquiry.inquiryPicDir

            let notification = {
                dateCreated : data,
                message: `A tua edição da inquirição ${originalId} foi aceite`,
                url: `/inquiry/${originalId}`
            }
            // se houver uma fotografia nova na edicao, mover para inquiricao
            if(inquiryPicDir){
                let publicPath  = path.join(__dirname,'/../public')
                let fileExtension = inquiryPicDir.split('.').slice(-1)
                let picDir = path.join(publicPath,'/images/inquiries/'+originalId)
                let originalInquiryPicDir = path.join(picDir,'/inquiryPic.'+fileExtension)
                let oldPath = path.join(publicPath,inquiryPicDir)
                
                if(fs.existsSync(oldPath)){
                    if(!fs.existsSync(picDir)){
                        fs.mkdirSync(picDir)
                    }

                    console.log(oldPath,originalInquiryPicDir)
                    console.log(originalId,id)
                    fs.renameSync(oldPath, originalInquiryPicDir)
                    inquiry.inquiryPicDir = `/images/inquiries/${originalId}/inquiryPic.${fileExtension}`
                    // remover imagem antiga
                    this.getInquiry(originalId)
                    .then(inquiry =>{
                        if(inquiry)
                            fs.rmSync(path.join(publicPath,inquiry.inquiryPicDir))
                    })
                    .catch( error => {
                        console.log('Error:',error)
                    })
                }
            }
            
            // enviar mensagem ao editor
            userController.addUserNotificationByEmail(editor,notification)
            // atualizar inquiricao editada
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


// remover edicao de inquiricao
module.exports.removeEditedInquiry = (id,sendNotification) => {
    console.log('Removing edited inquiry',id)
    data = new Date().getTime().toString()
    return Inquiry.editedInquiriesModel
    .findOneAndRemove({'_id':id})
        .then(inquiry => {
            let inquiryPicDir = inquiry.inquiryPicDir
            if(sendNotification){
                let originalId = inquiry.originalId
                let editorId = inquiry.editor
                let notification = {
                    dateCreated : data,
                    message: `A tua edição da inquirição ${originalId} foi rejeitada`,
                    url: `/inquiry/${originalId}`
                }

                // enviar notificao ao editor
                userController.addUserNotificationByEmail(editorId,notification)
            }
            // se houver uma fotografia nova na edicao, remover
            if(inquiryPicDir){
                let editedInquiryPicDir  = path.join(__dirname,'/../public')
                let newPath = path.join(editedInquiryPicDir,inquiryPicDir)
                if(fs.existsSync(newPath)){
                    fs.rmSync(newPath)
                }
            }
            return inquiry
        })
        .catch( error => {
            console.log('Error:',error)
            return error
        }
        )
}


// adicionar novo post numa inquiricao
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


// adicionar resposta a um post numa inquiricao
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


// adicionar sugestao de edicao de inquiricao
module.exports.addEditedInquiry = (originalId,editedInquiry,email) => {
    console.log('Adding edited inquiry: ' + email)
    data = new Date().getTime().toString()
    if(originalId){
        return this.getInquiry(originalId)
        .then(inquiry => {
            if(inquiry){
                inquiry._id = undefined
                // adicionar inquiricao normal nos pedidos de inquiricao editada
                return Inquiry.editedInquiriesModel
                    .create(inquiry.toJSON())
                    .then(newInquiry => {
                        if(newInquiry){
                            // colocar edicoes no elemento de inquiricao editada
                            return Inquiry.editedInquiriesModel
                                .updateOne({_id:newInquiry._id},editedInquiry)
                                .then(result => {
                                    console.log('Added edited inquiry')
                                    notification = {
                                        dateCreated : data,
                                        message: `${email} requested an edition of an inquiry`,
                                        url: `/editedInquiry/${newInquiry._id}`
                                    }
                                    // enviar notificacao aos admins sobre sugestao de edicao
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
    }else{
        return Inquiry.editedInquiriesModel
            .create(editedInquiry)
            .then(newInquiry => {
                if(newInquiry){
                    // colocar edicoes no elemento de inquiricao editada
                    return Inquiry.editedInquiriesModel
                        .updateOne({_id:newInquiry._id},editedInquiry)
                        .then(result => {
                            console.log('Added edited inquiry')
                            notification = {
                                dateCreated : data,
                                message: `${email} requested an edition of an inquiry`,
                                url: `/editedInquiry/${newInquiry._id}`
                            }
                            // enviar notificacao aos admins sobre sugestao de edicao
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
}

/** Adiciona nova inquiricao */
module.exports.addInquiry = (inquiry) => {

    return Inquiry.inquiriesModel
    .create(inquiry)
    .then( (result) => {
        return result
    })
    .catch( error => {
        console.log('Erro adding inquiry:',error)
        return error
    })
    
}

/** Devolve um id disponivel */
module.exports.newId = ()=>{
    return new mongoose.mongo.ObjectId()
}


/** Devolve o proximo unitId valido */
module.exports.newUnitId = ()=>{
    return Inquiry.inquiriesModel
    .find()
    .sort({UnitId:-1})
    .limit(1)
    .then(inquiry=>{
        inquiry = inquiry[0]
        if(inquiry){
            newUnitId = inquiry.UnitId + 1 
            console.log('New unitId',newUnitId)
            return newUnitId
        }else return null
    })
    .catch( error => {
        console.log('Erro geting new unitId:',error)
        return error
    })
}