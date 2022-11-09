import {createRequire} from "module"
import {generateToken, removeToken} from "../mongo/schemes/LoginToken.js"
import User,{addUser} from "../mongo/schemes/User.js"
import nodemailer from 'nodemailer'
import fs from 'fs'
import {checkToken as checkLoginToken} from "../mongo/schemes/LoginToken.js"
import { checkConfirmationLink, getConfirmationLink } from "../mongo/schemes/ConfirmEmailLink.js"
const require = createRequire(import.meta.url)
const config = require('../config.json')

export function login(req,res){
    const params = config.server.post.paths.login.params
    const userName = req.body[params.userName];
    const password = req.body[params.password];
    User.find({userName:userName,password:password})
        .then(users=>{
            return users.length===0?null:users[0]})
        .then(user=>{
            if(user===null){
                res.send({"error":"bad credentials"});
            }else if(!user.emailVarified){
                sendConfirmEmail(user._id,user.email)
                res.send({"error":"email not varified\ncheck your mailbox for email from us."});
            }else{
                generateToken(user._id).then(token=>
                    res.send({userId:user._id.toString(),loginToken:token.token})
                )
            }
        });
}

export function register(req,res){
    console.log("registering")
    const params = config.server.post.paths.register.params
    const userName = req.body[params.userName]
    const password = req.body[params.password]
    const email = req.body[params.email]
    const presentName = req.body[params.presentName]
    
    addUser({
        email:email,
        userName:userName,
        password:password,
        presentName:presentName
    }).then(user=>{
        if(user.isError){
            res.send({error:user.error})
            return;
        }else{
            sendConfirmEmail(user._id,user.email)
        }

    });
    
}

export async function confirmEmail(req,res){
    const token = req.body[config.server.post.paths.confirm.params.token]
    console.log(req.body)
    res.send(await checkConfirmationLink(token))
}

function sendConfirmEmail(userId,userEmail){
    const template = config.email.templates.firstRegister;
        fs.readFile(`${template.bodyPath}`,'utf8',(err,data)=>{
            if(err){
                console.error(err)
                return;
            }
            const transporter = nodemailer.createTransport(config.email.transporter);            
            getConfirmationLink(userId).then(link=>{
                const confirmLink = `${config.ui.url}/${config.ui.paths.confirmEmail}/${link}`
                const html = data.replace('%confirmLinlk%',confirmLink)
                console.log(html)
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

export async function checkToken(req,res){
    const params = config.server.post.paths.checkToken.params;
    const userId = req.body[params.userId];
    const token = req.body[params.token];
    return res.send(await {isRegistered:checkLoginToken(token,userId)})
}

export async function logOut(req,res){
    const params = config.server.post.paths.logOut.params;
    const userId = params.userId;
    const token = params.token;
    removeToken(userId,token)
        .then(ok=>ok?{loggedOut:true}:{loggedOut:false})
    
}
