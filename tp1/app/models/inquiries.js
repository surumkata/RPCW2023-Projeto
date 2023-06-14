//import de mongoose module
var mongoose = require('mongoose')

var relationsIdSchema = new mongoose.Schema({
    relation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inquiricoe'
      }
})


var commentsSchema = new mongoose.Schema({
    author: String,
    text : String,
    dataCreated : String, 
    postResponses: [this]
})

var inquiriesSchema = new mongoose.Schema({
    ID : Number,
    UnitID: Number,
    UnitTitle : [String],
    UnitDateInitial : String,
    UnitDateFinal : String,
    UnitDateInitialCertainty : Boolean,
    UnitDateFinalCertainty : Boolean,
    AllowUnitDatesInference : Boolean,
    Dimensions : String,
    AccessRestrict : String,
    PhysLoc : String,
    PreviousLoc : String,
    PhysTech : String,
    RelatedMaterial : String,
    Note : String,
    Revised : Boolean,
    Published : Boolean,
    Available : Boolean,
    Creator : String,
    Created : String,
    Username : String,
    ProcessInfoDate : String,
    ProcessInfo : String,
    filiations : [String],
    birthplace : String,
    current_concelho : String,
    current_district : String,
    relations_id : [relationsIdSchema],
    comments: [commentsSchema]
},{collection:'inquiricoes'})

module.exports.inquiriesModel = mongoose.model('inquiricoe',inquiriesSchema)