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
        competiotinId:competiotionId,safeAccepted:true
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
    if((await Safe.find({ownerId:userId,competiotinId:comp._id})).length!==0){
        res.send({isError:true,error:"You already in that game."});
    }
    else{
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
        res.send({isError:false,code:code,isWin:key.keyWin})
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



export async function getManagmentUsersData(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.loadManagmentData.params
    const compId = req.body[params.competitionId]

    //check if the user is the manager
    const comp = await Competition.findById(compId);
    if(comp==null){
        res.send({isError:true,error:"Dont even try to do that!"});
        return;
    }
    else if(comp.creatorId.toString()!=userId){
        res.send({isError:true,error:"You are not the manager! Go Away!"});
        return;
    }
    else{
        //get all safes in competition
        const safes = await Safe.find({competiotinId:compId})
        const results = await Promise.all(safes.map(async safe=>{
            const item = {}
            item.safe = {
                id:safe._id,
                name:safe.name,
                accepted:safe.safeAccepted
            }
            const user = await User.findById(safe.ownerId);
            item.user = {
                name:user.presentName,
                email:user.email
            }
            return item;
        }));
        const lockStatus = {
            saves:!comp.canUploadSafes,
            keys:!comp.canUploadKeys
        }
        res.send({isError:false,data:results,lockStatus:lockStatus})
        
        
    }

}



export async function getKeysManager(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.loadKeysManager.params;
    const safeId = req.body[params.safeId]
    const compId = req.body[params.competitionId]
    
    //get the competition
    const comp = await Competition.findById(compId)
    if(comp==null||comp.creatorId.toString()!=userId){
        res.send({isError:true,error:"I told you, Go Away!"});
        return;
    }
    else{
        //check if the safe is ok
        const safe = await Safe.findById(safeId)
        if(safe.competiotinId.toString()!=compId){
            res.send({isError:true,error:"Stop it! I won;t let you get in!"})
            return;
        }
        //load the keys of the safe
        const keys = await Key.find({safeId:safeId});
        const results = await Promise.all(keys.map(async key=>{
            //get the key owner
            const owner = await User.findById(key.ownerId);
            const result = {}
            result.key = {
                id:key._id.toString(),
                isWin:key.keyWin,
                isAccepted:key.keyAccepted
            }
            result.user= {
                name:owner.presentName,
                email:owner.email
            }
            return result
        }));
        res.send({isError:false,data:results})
    }
}

export async function downloadSafeMan(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.managerDownloadSafe.params
    const compId = req.body[params.competitionId]
    const safeId = req.body[params.safeId]
    
    //check the user credentials
    const comp = await Competition.findById(compId)
    if(comp==null||comp.creatorId.toString()!==userId){
        res.send({isError:true,error:"Stop It! I won't give you the code!"})
        return;
    }else{
        //check if the safe is part of the competition
        const safe = await Safe.findById(safeId);
        if(safe==null||safe.competiotinId.toString()!=compId){
            res.send({isError:true,error:"Being an owner of competition not owns you all the safes in the platforms! Go Away!"})
            return;
        }
        else{
            //load the safe code
            const safePath = `${config.paths.SAFES_CODE_PATH}${safeId}.asm`
            //check if there is file for the safe
            if(!fs.existsSync(safePath)){
                //if there is no file -> return an empty code
                res.send({isError:false,code:""});
                return;
            }
            else{
                //read the code from the file and send it
                fs.readFile(safePath,{encoding:'utf8'},(err,data)=>{
                    if(err){
                        res.send({isError:true,error:"reading error",info:err.toString()})
                        return;
                    }
                    else{
                        res.send({isError:false,code:data});
                        return;
                    }
                });
            }
        }
    }
}

export async function downloadKeyMan(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.managerDownloadKey.params;
    const compId = req.body[params.competitionId]
    const keyId = req.body[params.keyId]

    //check if the user is the competition owner
    const comp = await Competition.findById(compId)
    if(comp==null||comp.creatorId.toString()!=userId){
        res.send({isError:true,error:"Stop It! I won't give you the code!"})
        return;
    }
    else{
        //get the key
        const key = await Key.findById(keyId);
        if(key==null){
            res.send({isError:true,error:"There is no even key like that! Stop trying to hack the system!"});
            return;
        }
        //check if the key is part of the competition
        const keySafe = await Safe.findById(key.safeId.toString());
        if(keySafe==null||keySafe.competiotinId.toString()!=compId){
            res.send({isError:true,error:"Being an owner of competition not owns you all the keys in the platforms! Go Away!"})
            return;
        }
        else{
            //get the key code
            const keyCodePath = `${config.paths.KEYS_CODE_PATH}${keyId}.asm`
            if(!fs.existsSync(keyCodePath)){
                res.send({isError:false,code:""});
                return;
            }
            else{
                fs.readFile(keyCodePath,{encoding:'utf8'},(err,data)=>{
                    if(err){
                        res.send({isError:true,error:"reading error",info:err.toString()})
                        return;
                    }
                    else{
                        res.send({isError:false,code:data});
                        return;
                    }
                });
            }
        }


    }
}

export async function lockUploads(req,res){
    const userId = req.body[config.server.post.authParams.userId];
    const params = config.server.post.paths.lockCompetitionUploads.params
    const compId = req.body[params.competitionId]
    const lock = req.body[params.lock]
    const what = req.body[params.what.name]

    //check the user access
    const comp = await Competition.findById(compId)
    if(comp == null||comp.creatorId.toString()!==userId){
        res.send({isError:true,error:"This is not fun! Stop!"});
        return;
    }
    else if(typeof(lock)!=="boolean"||!params.what.options.includes(what)){
        res.send({isError:true,error:"If you trying to use the api at least use it correctly!"});
        return;
    }
    else{
        let whatParam = ''
        if(what==='saves'){
            whatParam = 'canUploadSafes'
        }
        else{
            whatParam = 'canUploadKeys'
        }
        comp[whatParam] = !lock
        comp.save().then(c=>{
            res.send({isError:false,status:!comp[whatParam]})
        })

        
    }
}


export async function loadScores(compId){
    const safes = await Safe.find({competiotinId:compId});
    const scores = await Promise.all(safes.map(async safe=>{
        const badKeys = await Key.find({safeId:safe._id,keyWin:true});
        const goodKeys = await Key.find({ownerId:safe.ownerId,keyWin:true,safeId:safe._id});
        const result={};
        const safeKey = goodKeys.find(k=>k.safeId.toString()==safe._id.toString());
        result.safeName = safe.name;
        result.accepted = safe.safeAccepted&&(safeKey&&safeKey.keyWin);
        result.badKeys = badKeys.length-(result.accepted?1:0);
        result.goodKeys = goodKeys.length-(result.accepted?1:0);
        result.score =  calculateScore(result)
        return result;
    }))
    return scores;
}

function calculateScore(data){
    const scores = config.rules.scores
    return !data.accepted?0:
           (scores.goodSafe
        +   data.goodKeys*scores.goodKey
        +   data.badKeys*scores.badKey)
}
