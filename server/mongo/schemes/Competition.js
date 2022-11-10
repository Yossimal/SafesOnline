import { Schema,model,ObjectId } from "mongoose";

const competitionSchema = new Schema({
    startTime:Date,
    creatorId:ObjectId,
    registerToken:String,
    name:String,
    canUploadSafes:{type:Boolean,default:true},
    canUploadKeys:{type:Boolean,deafault:true}
},{timestamps:true});

const Competition = model("Competition",competitionSchema);


export default Competition;