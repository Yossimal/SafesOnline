import { sha256 } from "js-sha256";
import { Schema,model,ObjectId } from "mongoose";
import moment from 'moment'
import {createRequire} from "module"
import { token } from "morgan";

const require = createRequire(import.meta.url)
const config = require('../../config.json')



const RestorePasswordTokenSchema = new Schema({
    userId:{type:ObjectId, required:true},
    token:{type:String,required:true,unique:true},
    active:{type:Boolean,default:true},
    timeStamp:{type:Date}
});

const RestorePasswordToken = model("RestorePasswordToken",RestorePasswordTokenSchema);

function generateTokenStr(){
    return `${sha256((+ Date()).toString(16)+(Math.random().toString()))}`
}

export function generateToken(userId){
    const token = new RestorePasswordToken 
    ({
        userId:userId,
        token:generateTokenStr(),
        active:true,
        timeStamp:new Date()
    });
    return token.save()
}

export function checkToken(tokenStr){
    return RestorePasswordToken.find({token:tokenStr,active:true})
        .then(t=>{
            if(t.length===0){
                return null;
            }
            for(let i=0;i<t.length;i++){
                const addedDate = moment(t[i].timeStamp).add(config.tokens.restorePasswordTokenExpirationTime,'m').toDate()
                if((new Date()).getTime()>addedDate.getTime()){
                    t[i].active = false;
                    t[i].save();
                    continue;
                }
                return t[0].userId;    
            }
            return null;
        });
}
export async function removeToken(tokenStr){
    const tokens = await RestorePasswordToken.find({token:tokenStr,active:true})
    for(let token of tokens){
        token.active = false
        await token.save()
    }
    return true;
}

