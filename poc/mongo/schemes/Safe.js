import { Schema,model,ObjectId } from "mongoose";

const SafeSchema = new Schema({
    competiotinId:{type:ObjectId,required:true},
    ownerId:{type:ObjectId,required:true},
    safeBytecodePath:String,
    safeCodePath:{
        type:String,
        default:""
    },
    safeAccepted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const Safe = model("Safe",SafeSchema);
export default Safe;