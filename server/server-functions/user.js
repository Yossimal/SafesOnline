import User from "../mongo/schemes/User.js";
import {createRequire} from "module"
import {ObjectId} from 'mongoose'
import nodemailer from 'nodemailer'
import {generateToken, removeToken} from '../mongo/schemes/RestorePasswordToken.js'
import { checkToken as checkRestoreToken } from "../mongo/schemes/RestorePasswordToken.js";
import fs, { fdatasyncSync } from 'fs'
import {sha256} from 'js-sha256'
import RandExp from 'randexp'

const require = createRequire(import.meta.url)
const config = require('../config.json')




export function getUserProfile(req,res){
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
    User.find({_id:userId})
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

export function askRestorePaassword(req,res){
    const params =  config.server.post.paths.askRestorePassword.params;
    const email = req.body[params.email]
    const userName = req.body[params.userName]
    User.find({email:email,userName:userName})
    .then(users=>users.length==0?null:users[0])
    .then(user=>{
        if(user==null){
            res.send({isError:true,error:"Bad user name or email"})
        }else{
            sendRestorePasswordEmail(user._id.toString(),user.email)
            res.send({isError:false})
        }
    });
}

export function restorePassword(req,res){
    const token = req.body[config.server.post.paths.restorePassword.params.token];
    checkRestoreToken(token)
        .then(userId=>{
            if(userId==null){
                res.send({isError:true,error:"Bad link. maybe you got time out?"});
                return
            }else{
                User.find({_id:userId})
                    .then(users=>users[0])
                    .then(user=>{
                        const password = generateRandomPassword()
                        user.password = sha256(password);
                        user.save()
                        .then(saved=>{
                            sendNewPasswordEmail(password,user.email,res);
                        });
                    });
                removeToken(token)
            }
        })
}


function generateRandomPassword(){
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    const exp = new RandExp(passwordPattern)
    exp.defaultRange.length=8
    return exp.gen();
}

function sendNewPasswordEmail(newPassword,userEmail,response){
    const template = config.email.templates.newPassword;
    fs.readFile(`${template.bodyPath}`,'utf8',(err,data)=>{
        if(err){
            console.error(err);
            return;
        }else{
            const transporter = nodemailer.createTransport(config.email.transporter);
            const html = data.replace('%newPassword%',newPassword);
            const message = {
                from:config.email.from,
                to:userEmail,
                subject:template.subject,
                html:html
            }
            transporter.sendMail(message,result=>{
                if(res==null){
                    response.send({isError:false})
                }else{
                    response.send({isError:true,error:"There was an error sending the restore email. try to change the password later."})
                }
            
            })
        }
    });
}

function sendRestorePasswordEmail(userId,userEmail){
    const template = config.email.templates.restorePassword;
        fs.readFile(`${template.bodyPath}`,'utf8',(err,data)=>{
            if(err){
                console.error(err)
                return;
            }
            const transporter = nodemailer.createTransport(config.email.transporter);            
            generateToken(userId).then(link=>{
                const restoreLink = `${config.ui.url}/${config.ui.paths.restorePassword}/${link.token}`
                const html = data.replace('%restoreLink%',restoreLink)
                const message = {
                    from:config.email.from,
                    to:userEmail,
                    subject:template.subject,
                    html:html
                }
                transporter.sendMail(message,result=>{console.log(result);});
        });
    })
}