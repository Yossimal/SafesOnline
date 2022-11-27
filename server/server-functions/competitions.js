import Competition from "../mongo/schemes/Competition.js";
import {createRequire} from 'module'
import fs from 'fs'
import nodemailer from 'nodemailer'
import User from "../mongo/schemes/User.js";
import Safe from "../mongo/schemes/Safe.js";

const require = createRequire(import.meta.url)
const config = require('../config.json')

function generateCompetitionToken(){
    return (new Date()).getMilliseconds().toString(28)+Math.round(Math.random()*10000000).toString(30);
}

export function newCompetiotion(req,res){
    // console.log(req.body);
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
                console.log(err);
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
        console.log(compId)
        const comp = await Competition.findById(compId)
        
        console.log(comp)
        return {
            id:comp._id,
            name:comp.name,
            description:comp.description,
            startTime:comp.startTime
        }
    }));
    console.log("responding")
    res.send(result)
}

export async function loadCompetiotionsData(req,res){
    console.log(req.body)
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
    const safeCodePath = `..${codePath}/${safeData.id.toString()}.asm`
    if(fs.existsSync()){
        safeData.code = fs.readFileSync(safeCodePath)
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

