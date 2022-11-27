import {createRequire} from 'module'
import Safe from "../mongo/schemes/Safe.js";
import fs from 'fs'
import Competition from "../mongo/schemes/Competition.js";
import { exec } from "child_process";
import path from 'path'
import Key from '../mongo/schemes/Key.js';
import User from '../mongo/schemes/User.js'
import {runGame} from './runGames.js'

const require = createRequire(import.meta.url)
const config = require('../config.json')

export async function saveSafe(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.saveSafe.params
    const safeId = req.body[params.safeId]
    const codePath = `${config.paths.SAFES_CODE_PATH}${safeId}.asm`
    const safeCode = req.body[params.safeCode]
    const name = req.body[params.name]
    //get the safe data
    const safe = await Safe.findById(safeId);
    //check if the user can save the safe
    if(safe==null||safe.ownerId.toString()!=userId){
        res.send({iseError:true,error:"You don't have premissions for saving the safe."});
        return;
    }
    //save the safe code
    saveCode(safeCode,codePath,(err)=>{
        if(err){
            console.log(path.dirname(`${codePath}`))
            console.log(err)
            res.send({isError:true,error:"save error",msg:err})
            return
        }
        res.send({isError:false});
    });

    safe.name=name;
    safe.save()

}

export async function assembleSafe(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.saveSafe.params
    const safeId = req.body[params.safeId]
    const codePath = `${config.paths.SAFES_CODE_PATH}${safeId}`
    const safeCode = req.body[params.safeCode]
    const bytecodePath = `${config.paths.SAFES_COMPILED_PATH}${safeId}`
    const name = req.body[params.name]
    const nasmPath = config.paths.NASM_PATH

    //get the safe data
    const safe = await Safe.findById(safeId);
    //check if the user can save the safe
    if(safe==null||safe.ownerId.toString()!=userId){
        res.send({iseError:true,error:"You don't have premissions for saving the safe."});
        return;
    }
    //save the safe name
    safe.name = name;
    safe.save();
    //save the safe
    saveCode(safeCode,`${codePath}.asm`,async err=>{
        if(err){
            res.send({iserror:true,error:"There was an error uploading the safe code."});
            return;
        }
        //get the competition data
        const comp = await Competition.findById(safe.competiotinId)

        if (!comp.canUploadSafes) {
            res.send({isError:true,error:"Cant upload safes now"})
            return;
        }
        exec(`${nasmPath} "./${codePath}.asm"`, (error, stdout, stderr) => {
            if (error || stderr) {
                res.send({isError:true,error: `${stderr.substring(stderr.indexOf('error'))}`});
                //console.error(error);
                console.error(stderr);

            } else if (stdout) {
                res.send({isError:true,error: stdout});
            } else {
                exec(`mv "${codePath}" "${bytecodePath}"`, (error, stdout, stderr) => {
                    if (stderr || error) {
                        res.send({error: "failed to save the compiled file (mverr)"})
                        console.log(stderr)
                        console.log(error)
                        return;
                    }
                    const dummyKeyPath = config.paths.DUMMY_KEY
                    runGame(dummyKeyPath,bytecodePath,(error,stdout,stderr)=>{
                        console.log(stdout)
                        if (error || stderr) {
                            res.send({isError:true,error: "there was an error running the game"})
                            console.error(error)
                            console.error(stderr)
                            return;
                        }
                        if(!stdout.includes(`${safe._id.toString()}`)){
                            res.send({isError:true,error:"That safe is fragile"});
                        }else{
                            res.send({isError:false})
                        }
                    });
                });
            }
        });
    });
}

export async function saveKey(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.saveKey.params;
    const safeId = req.body[params.safeId]
    const code = req.body[params.keyCode]
    const keysCodePath = config.paths.KEYS_CODE_PATH
    const safe = await Safe.findById(safeId)
    const competition = await Competition.findById(safe.competiotinId);
    const user = await User.findById(userId);
    if(!checkUserAccess(user,competition._id.toString())){
        res.send({isError:true,error:"No Credentioals!"});
        return;
    }
    const key = await getKey(user,safe._id.toString(),competition._id.toString());
    const codePath = `${keysCodePath}${key._id.toString()}.asm`
    saveCode(code,codePath,err=>{
        if(err){
            res.send({isError:true,error:"Can't save the file."});
            return;
        }
        res.send({isError:false})
    })
}

export async function assembleKey(req,res){
    const userId = req.body[config.server.post.authParams.userId]
    const params = config.server.post.paths.saveSafe.params
    const safeId = req.body[params.safeId]
    const keysCodePath = config.paths.KEYS_CODE_PATH
    const safeCode = req.body[params.safeCode]
    const keysBytecodePath = config.paths.KEYS_COMPILED_PATH
    const nasmPath = config.paths.NASM_PATH;

    const safe = await Safe.findById(safeId)
    const competition = await Competition.findById(safe.competiotinId);
    const user = await User.findById(userId);
    if(!checkUserAccess(user,competition._id.toString())){
        res.send({isError:true,error:"No Credentioals!"});
        return;
    }
    const key = await getKey(user,safeId,competition._id.toString());
    const codePath = `${keysCodePath}${key._id}`;
    const bytecodePath = `${keysBytecodePath}${key._id.toString()}`;

    //save the key
    saveCode(safeCode,`${codePath}.asm`,async err=>{
        if(err){
            res.send({iserror:true,error:"There was an error uploading the safe code."});
            return;
        }
        //check if we can upload keys
        if (!competition.canUploadKeys) {
            res.send({isError:true,error:"Cant upload safes now"})
            return;
        }
        exec(`${nasmPath} "./${codePath}.asm"`, (error, stdout, stderr) => {
            if (error || stderr) {
                res.send({isError:true,error: `${stderr.substring(stderr.indexOf('error'))}`});
                //console.error(error);
                console.error(stderr);

            } else if (stdout) {
                res.send({isError:true,error: stdout});
            } else {
                exec(`mv "${codePath}" "${bytecodePath}"`, (error, stdout, stderr) => {
                    if (stderr || error) {
                        res.send({error: "failed to save the compiled file (mverr)"})
                        console.log(stderr)
                        console.log(error)
                        return;
                    } else {
                        res.send({isError:false});
                        return;
                    }
                });
                //test the key with dummy key so we can know it not a master key
                const dummyKeyPath = config.paths.DUMMY_KEY
                runGame(dummyKeyPath,bytecodePath,(error,stdout,stderr)=>{
                    if (error || stderr) {
                        res.send({isError:true,error: "there was an error running the game"})
                        console.error(error)
                        console.error(stderr)
                        return;
                    }
                    if(stdout.includes(`${key._id.toString()}`)){
                        res.send({isError:true,error:"That key is illegal"});
                    }else{
                        res.send({isError:false})
                    }
                });
                
            }
        });
    });
}

export async function getKey(user,safeId,compId){
    keys = user.competitions.key.find(k=>k.safeId.toString()==safeId)
    if(keys.length==0){
        const key = new Key({
            competitionId:compId,
            ownerId:userId,
            safeId:safeId
        });
        const savedKey = await key.save()
        user.competitions.key.push(savedKey._id);
        await user.save();
        return key;
    }
    else{
        return await Key.findById(keys[0].keyId)
    }
}

function checkUserAccess(user,competiotionId){
    return user.competitions.find(c=>c.competitionId.toString()==competiotionId).length>0;
}

function saveCode(code,path,callback){
    console.log(path,code)
    fs.writeFile(path,code,callback)
}