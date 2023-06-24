var Activity = require('../models/activities')



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