import { sha256 } from "js-sha256";
import { Schema,model,ObjectId } from "mongoose";
import moment from 'moment'
import {createRequire} from "module"
import { token } from "morgan";

const require = createRequire(import.meta.url)
const config = require('../../config.json')



const RestorePasswordTokenSchema = new Schema({
    userId:{type:ObjectId, required:true},
    token:{type:String,required:true},
    active:{type:Boolean,default:true},
    timeStamp:{type:Date}
});

const RestorePasswordToken = model("RestorePasswordToken",LoginTokenSchema);

function generateTokenStr(){
    return `${sha256((+ Date()).toString(16))}`
}

export function generateToken(userId){
    const token = new RestorePasswordToken 
    ({
        userId:userId,
        token:generateTokenStr(),
        active:true,
        timeStamp:new date()
    });
    return token.save()
}

export function checkToken(userIdStr,tokenStr){
    //const userId = new ObjectId(userIdStr)
    console.log({userId:userIdStr,token:tokenStr,active:true})
    return LoginToken.find({userId:userIdStr,token:tokenStr,active:true})
        .then(t=>{
            console.log(t)
            if(t.length===0){
                return false;
            }
            for(let i=0;i<t.length;i++){
                const addedDate = moment(t[i].timeStamp).add(config.tokens.restorePasswordTokenExpirationTime,'m').toDate()
                if((new Date()).getTime()>addedDate.getTime()){
                    t[i].active = false;
                    t[i].save();
                    continue;
                }
                t[i].timeStamp = new Date();
                t[i].save();
                return true;    
            }
            return false;
        });
}
export async function removeToken(userIdStr,tokenStr){
    const tokens = await LoginToken.find({userId:userIdStr,token:tokenStr,active:true})
    for(let token of tokens){
        token.active = false
        await token.save()
    }
    return true;
}

