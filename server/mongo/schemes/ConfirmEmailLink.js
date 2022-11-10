import { Schema,model,ObjectId } from "mongoose";
import User from "./User.js";

const ConfirmEmailLinkSchema = new Schema({
    userId:{
        type:ObjectId,
        required:true
    },
    link:{
        type:String,
        unique:true
    }
});

const ConfirmEmailLink = model("ConfirmEmailLink",ConfirmEmailLinkSchema);
async function generateLink(userId){
    while(true){
        const link = userId.toString()+(+ new Date).toString(24)+Math.ceil(Math.random()*999999999).toString(30)
        const l = await ConfirmEmailLink.find({link:link});
        if(l.length===0){
            const ret = new ConfirmEmailLink({
                userId:userId,
                link:link
            });
            
            return ret
        }
    }
}
export function getConfirmationLink(userId){
    return generateLink( userId)
        .then(generatedLink=>{
            return generatedLink.save()
                .then(li=>li.link);
        });
}

export function checkConfirmationLink(link){
    return ConfirmEmailLink.find({link:link})
        .then(emailLink=>{
            if(emailLink.length===0){
                return {msg:'Error! cant find the link'}
            }else{
                const userId = emailLink[0].userId;
                return User.find({_id:userId})
                    .then(usr=>{
                        if(usr.length==0){
                            return {msg:"Error! cant find user"}
                        }else if(usr[0].emailVarified){
                            return {msg:"Error! email already varified"}
                        }else{
                            usr[0].emailVarified = true
                            usr[0].save()
                            return {msg:"email was varified\nnow try to login with your email and password."}
                        }
                    });
            }
        })
}
