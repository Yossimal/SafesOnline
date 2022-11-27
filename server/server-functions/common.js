import { partial } from "functools";
import { checkToken } from "../mongo/schemes/LoginToken.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const config = require('../config.json');

export function $private(func){
    return partial(privateFunc,func)
}



function privateFunc(func,req,res){
    const params = config.server.post.paths.getUserProfile.params;
    const token = req.body[params.token];
    const userId = req.body[params.userId];
    checkToken(userId,token)
    .then(ok=>{
        if(!ok){
            res.send({isError:true,error:"You need to login again!",badToken:true})
            return;
        }else{
            func(req,res)
        }
    });
}

export function generateUUID(){
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
            const random = (Math.random() * 16) | 0;
            const value = character === "x" ? random : (random & 0x3) | 0x8;
    
            return value.toString(16);
        });
}