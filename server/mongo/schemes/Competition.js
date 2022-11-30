import { Schema,model,ObjectId } from "mongoose";

const competitionSchema = new Schema({
    startTime:Date,
    creatorId:ObjectId,
    registerToken:{type:String,unique:true},
    name:{type:String,require:true},
    description:String,
    canUploadSafes:{type:Boolean,default:true},
    canUploadKeys:{type:Boolean,default:true}
},{timestamps:true});

const Competition = model("Competition",competitionSchema);



export default Competition;