var Activity = require('../models/activities')


/**Registar uma atividade no site */
module.exports.register = (type,inquiryId) =>{
    var date = new Date().toISOString()
    var newActivity = {
        date: date,
        type: type,
        inquiryId: inquiryId
    }
    return Activity.activityModel
    .create(newActivity)
    .then(result=>{
        return result
    })
    .catch(err=>{
        console.log('Activity :',err)
        return err
    })
}

/** Obter lista das top inquiricoes por numero de atividade de um certo tipo */
module.exports.listTop = (searchPipeline,topN) =>{
    groupByInquiry = { '$group':{'_id':"$inquiryId",'count':{'$sum':1}}}
    return Activity.activityModel
    .aggregate(Array.prototype.concat(searchPipeline,groupByInquiry))
    .sort({'count':-1})
    .limit(topN)
    .then(result=>{
        return result
    })
    .catch(err=>{
        console.log('Activity :',err)
        return err
    })
}

/** Obter estatisticas por dia de uma dada inquiricao */
module.exports.listInquiry = (id,searchPipeline) =>{
    findInquiry = { '$match':{'inquiryId':id}}
    groupByDate = {'$group':{_id:{'$dateToString':{'format': "%Y-%m-%d",'date': "$date"}}, 'count':{ '$sum': 1}}}
    return Activity.activityModel
    .aggregate(Array.prototype.concat(findInquiry,searchPipeline,groupByDate))
    .sort({'count':-1})
    .then(result=>{
        return result
    })
    .catch(err=>{
        console.log('Activity :',err)
        return err
    })
}