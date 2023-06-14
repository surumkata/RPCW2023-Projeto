//import de mongoose module
var mongoose = require('mongoose')

var relations_idSchema = new mongoose.Schema({
    String : String
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
    relations_id : [relations_idSchema]
},{collection:'inquiricoes'})

module.exports.inquiriesModel = mongoose.model('inquiricoe',inquiriesSchema)