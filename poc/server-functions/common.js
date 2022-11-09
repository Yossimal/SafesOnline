import { partial } from "functools";
import { checkToken } from "../mongo/schemes/LoginToken.js";

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
            res.send({error:"You need to login again!",badToken:true})
            return;
        }else{
            func(req,res)
        }
    });
}