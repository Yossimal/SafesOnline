import { Schema,model,ObjectId } from "mongoose";


const KeySchema = new Schema({
    competitionId:{type:ObjectId,required:true},
    ownerId:{type:ObjectId,required:true},
    keyAccepted:{type:Boolean,default:false},
    safeId:{type:ObjectId,required:true}
},{timestamps:true});

const Key = model("Key",KeySchema);
export default Key;