import { Schema,model,ObjectId } from "mongoose";


const KeySchema = new Schema({
    competitionId:{type:ObjectId,required:true},
    ownerId:{type:ObjectId,required:true},
    keyBytecodePath:{type:String,default:""},
    keyCodePath:String,
    keyAccepted:{type:Boolean,default:false}
},{timestamps:true});

const Key = model("Key",KeySchema);
export default Key;