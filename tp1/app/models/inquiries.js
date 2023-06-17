//import de mongoose module
var mongoose = require('mongoose')

var relationsIdSchema = new mongoose.Schema({
    type: String,
    id: String,
    name:String
})


var commentsSchema = new mongoose.Schema({
    _id : String,
    postResponses: [this]
})

var inquiriesSchema = new mongoose.Schema({
    _id: String,
    UnitId: Number,
    UnitTitle : [String],
    dateEdited:String,
    editor:String,
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


var editedInquiriesSchema = new mongoose.Schema({
    editor: String,
    originalId: String,
    dateEdited:String,
    UnitId: Number,
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
},{collection:'editedInquiricoes'})

module.exports.editedInquiriesModel = mongoose.model('editedInquiricoe',editedInquiriesSchema)