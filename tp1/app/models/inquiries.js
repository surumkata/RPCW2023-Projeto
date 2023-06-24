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
    inquiryPicDir:String,
    UnitId: Number,
    UnitTitle : [String],
    editor:String,
    UnitDateInitial : Date,
    UnitDateFinal : Date,
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
    ProcessInfoDate : String,
    ProcessInfo : String,
    affiliations : [String],
    birthplace : String,
    birthdate : Date,
    current_concelho : String,
    current_district : String,
    country: String,
    ScopeContent: String,
    Repository: String,
    relations_id : [relationsIdSchema],
    comments: [commentsSchema]
},{collection:'inquiricoes'})

module.exports.inquiriesModel = mongoose.model('inquiricoe',inquiriesSchema)


var editedInquiriesSchema = new mongoose.Schema({
    editor: String,
    originalId: String,
    inquiryPicDir:String,
    UnitId: Number,
    UnitTitle : [String],
    UnitDateInitial : Date,
    UnitDateFinal : Date,
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
    ProcessInfoDate : String,
    ProcessInfo : String,
    affiliations : [String],
    birthplace : String,
    birthdate : Date,
    current_concelho : String,
    current_district : String,
    country: String,
    ScopeContent: String,
    Repository: String,
    relations_id : [relationsIdSchema],
    comments: [commentsSchema]
},{collection:'editedInquiricoes'})

module.exports.editedInquiriesModel = mongoose.model('editedInquiricoe',editedInquiriesSchema)