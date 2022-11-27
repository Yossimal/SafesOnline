import { Schema,model,ObjectId } from "mongoose";
import {createRequire} from 'module'
import fs from 'fs'

const require = createRequire(import.meta.url);
const config = require('../../config.json');


const SafeSchema = new Schema({
    competiotinId:{type:ObjectId,required:true},
    ownerId:{type:ObjectId,required:true},
    safeAccepted:{
        type:Boolean,
        default:false
    },
    name:{type:String,default:"My Safe"}
},{timestamps:true});

const Safe = model("Safe",SafeSchema);

export default Safe;