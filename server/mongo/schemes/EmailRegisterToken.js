import { Schema,model,ObjectId } from "mongoose";

const EmailRegisterTokenSchema = new Schema({
    competitionId:{type:ObjectId,required:true},
    userId:{type:ObjectId,required:true},
    linkCode:String
},{timestamps:true})

const EmailRegisterToken = model("EmailRegisterToken",EmailRegisterTokenSchema);

function generateLinkCode(){
    ((new Date).getTime()*Math.ceil(1+Math.random()*9999999999)).toString(36)
}

export function getEmail(competiotion,user){
    return new EmailRegisterToken({
        competitionId:competiotion._id,
        userId:user._id,
        linkCode:generateLinkCode()
    });
}

export default EmailRegisterToken;