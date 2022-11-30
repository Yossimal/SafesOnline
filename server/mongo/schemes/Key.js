import { Schema,model,ObjectId } from "mongoose";


const KeySchema = new Schema({
    ownerId:{type:ObjectId,required:true},
    keyAccepted:{type:Boolean,default:false},
    safeId:{type:ObjectId,required:true},
    keyWin:{type:Boolean,default:false}
},{timestamps:true});

const Key = model("Key",KeySchema);
export default Key;