import User from "../mongo/schemes/User.js";
import {createRequire} from "module"
import {ObjectId} from 'mongoose'
const require = createRequire(import.meta.url)
const config = require('../config.json')



export function getUserProfile(req,res){
    console.log(req.body)
    const userId = req.body[config.server.post.authParams.userId]
    const user = User.find({_id:userId})
        .then(users=>users[0])
        .then(user=>{
            const resSchema = config.server.post.paths.getUserProfile.responseSchema;
            let ret = {}
            ret[resSchema.email] = user.email
            ret[resSchema.presentName] = user.presentName
            ret[resSchema.userName] = user.userName
            res.send(ret)
        });
}


export function changePassword(req,res){
    const params = config.server.post.paths.changePassword.params
    const oldPassword = req.body[params.oldPassword]
    const newPassword = req.body[params.newPassword]
    const userId = req.body[config.server.post.authParams.userId]
    User.find({_id:new ObjectId(userId)})
        .then(users=>users[0])
        .then(user=>{
            if(user.password!==oldPassword){
                res.send({ok:false,error:"That is not your old password!"});
                return;
            }else{
                user.password = newPassword
                user.save();
                res.send({ok:true})
            }
        });
    
}