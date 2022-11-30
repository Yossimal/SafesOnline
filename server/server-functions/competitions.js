import Competition from "../mongo/schemes/Competition.js";
import {createRequire} from 'module'
import fs from 'fs'
import nodemailer from 'nodemailer'
import User from "../mongo/schemes/User.js";
import Safe from "../mongo/schemes/Safe.js";
import Key from "../mongo/schemes/Key.js";

const require = createRequire(import.meta.url)
const config = require('../config.json')

function generateCompetitionToken(){
    return (new Date()).getMilliseconds().toString(28)+Math.round(Math.random()*10000000).toString(30);
}

export function newCompetiotion(req,res){
    const params = config.server.post.paths.newCompetiotion.params;
    const authParams = config.server.post.authParams;
    const description = req.body[params.description]
    const userId = req.body[authParams.userId];
    const compName = req.body[params.name];
    const startTime = req.body[params.startTime];

    if(compName.length<6||description==''||startTime==undefined){
        res.send({isError:true,error:"Bad parameters"});
        return;
    }
    const comp = new Competition({
        creatorId:userId,
        description:description,
        name:compName,
        registerToken:generateCompetitionToken(),        startTime:startTime
    });
    comp.save().then(savedComp=>{
        //send ok response
        res.send({isError:false,msg:"The competiotion has been saved!"});
        //send the token to the user
        const user = User.find({_id:userId})
            .then(usr=>usr[0])
            .then(user=>{
                const safe = new Safe({
                    competiotinId:savedComp._id,
                    ownerId:user._id
                });
                safe.save().then(savedSafe =>{
                    user.competitions.push({
                        competitionId:savedComp._id,
                        safeId:savedSafe._id,
                        competitionLeader:true
                    });
                    user.save();
                });
                sendNewCompetiotionMail(user.email,savedComp.registerToken);
            });
    });


    function sendNewCompetiotionMail(userEmail,registerToken){
        const template = config.email.templates.newCompetiotion;
        fs.readFile(`${template.bodyPath}`,'utf8',(err,data)=>{
            if(err){
                return;
            }
            const transporter = nodemailer.createTransport(config.email.transporter);
            const html = data.replace('%competiotionCode%',registerToken);
            const message = {
                from: config.email.from,
                to:userEmail,
                subject:template.subject,
                html:html
            }
            transporter.sendMail(message,r=>{})
        })
    }
}

export async function allCompetiotions(req,res){
    const userId = req.body[config.server.post.authParams.userId];
    const user = await User.findById(userId);
    const competiotionsIds = user.competitions.map(c=>c.competitionId);
    const result = await Promise.all(competiotionsIds.map(async function(compId){
        const comp = await Competition.findById(compId)
        
        return {
            id:comp._id,
            name:comp.name,
            description:comp.description,
            startTime:comp.startTime
        }
    }));
    res.send(result)
}

export async function loadCompetiotionsData(req,res){
    const userId = req.body[config.server.post.authParams.userId];
    const params = config.server.post.paths.specificCompetitoion.params;
    const competiotionId = req.body[params.competiotionId]
    const codePath = config.paths.SAFES_CODE_PATH;
    const user = await User.findById(userId);
    //check access validation
    if(user.competitions.find(c=>c.competitionId.toString()==competiotionId).length==0){
        res.send({isError:true,error:"Yo dont have credentials to access that section."});
        return;
    }
    //get competition basic data
    let compData = await Competition.findById(competiotionId)
    compData = {
        id:compData._id,
        name:compData.name,
        description:compData.description,
        startTime:compData.startTime
    }
    if(compData.startTime.getMilliseconds()>(new Date()).getMilliseconds()){
        res.send({isError:true,error:"The competiotion hasn't started yet."})
        return;
    }
    //get the player safe data
    let safeData = await Safe.findOne({competiotinId:competiotionId,ownerId:userId});
    safeData = {
        id:safeData._id.toString(),
        competitionId:safeData.competiotinId.toString(),
        ownerId:safeData.ownerId.toString(),
        accepted:safeData.safeAccepted,
        name:safeData.name,
        code:""
    }
    const safeCodePath = `${codePath}/${safeData.id.toString()}.asm`
    if(fs.existsSync(safeCodePath)){
        safeData.code = fs.readFileSync(safeCodePath,{encoding:'utf8'})
    }
    //get other safes base data
    const otherSafes = await Safe.find({
        competiotinId:competiotionId,
        ownerId:{$ne:userId}
    });
    const otherSafesData = otherSafes.map(safe=>({
        name:safe.name,
        id:safe._id
    }));
    res.send({
        isError:false,
        compData:compData,
        safeData:safeData,
        otherSafes:otherSafesData
    });
}

export async function joinCompetition(req,res){
    const userId = req.body[config.server.post.authParams.userId];
    const params = config.server.post.paths.joinCompetition.params;
    const gameCode = req.body[params.gameCode];

    const comps = await Competition.find({registerToken:gameCode});
    if(comps.length==0){
        res.send({isError:true,error:"Bad token!"});
        return;
    }
    const comp = comps[0]
    const user = await User.findById(userId)
    if((await Safe.find({ownerId:userId,competiotinId:comp._id})).length==0){
        res.send({isError:true,error:"You already in that game."});
    }
    const safe = new Safe({
        competiotinId:comp._id,
        ownerId:userId
    });
    const savedSafe = await safe.save();
    user.competitions.push({
        competitionId:comp._id,
        safeId:savedSafe._id
    });
    user.save();
    res.send({isError:false});
}

export async function loadKeyCode(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.loadKeyCode.params
    const safeId = req.body[params.safeId]

    const user = await User.findById(userId)
    const safe = await Safe.findById(safeId)
    //check for user validation
    const userSafes = await Safe.find({ownerId:userId,competiotinId:safe.competiotinId});
    if(userSafes.length==0){
        res.send({isError:true,error:"Access Error!"});
        return;
    }
    const keys = await Key.find({safeId:safeId,competitionId:safe.competiotinId,ownerId:userId});
    //if there is no key ->create one
    let key;
    if(keys.length==0){
        key = new Key({
            safeId:safeId,
            ownerId:userId
        });
        key = await key.save();
    }else{
        key=keys[0];
    }
    const keyCodePath = `${config.paths.KEYS_CODE_PATH}${key._id}.asm`;
    
    if(fs.existsSync(keyCodePath)){
        const code = fs.readFileSync(keyCodePath,{encoding:"utf8"});
        res.send({isError:false,code:code})
        return;
    }
    res.send({isError:false,code:""});
}
export async function loadSafeCode(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.loadSafeCode.params
    const safeId = req.body[params.safeId]
    const codePath = `${config.paths.SAFES_CODE_PATH}${safeId}.asm`

    const safe = await Safe.findById(safeId)
    const userSafe = await Safe.find({competiotinId:safe.competiotinId,ownerId:userId})
    if(userSafe.length==0){
        res.send({isError:true,error:"Access Denied"})
    }
    else if(!fs.existsSync(codePath)){
        res.send({isError:false,code:""})
    }
    else{
        fs.readFile(codePath,{encoding:'utf8'},(err,data)=>{
            if(err){
                res.send({isError:true,error:"Reading Error."})
            }
            res.send({isError:false,code:data})
        });
    }
}

