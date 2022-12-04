import {createRequire} from 'module'
import {exec} from 'child_process'
import {resolve} from 'path'
import Key from '../mongo/schemes/Key.js';
import { existsSync } from 'fs';
import { scoreChanged } from './events/scoreChanged.js';
import Competition from '../mongo/schemes/Competition.js';
import Safe from '../mongo/schemes/Safe.js';

const require = createRequire(import.meta.url);
const config = require('../config.json')

export function runGame(safePath,keyPath,callback){
    const javaPath = config.paths.JAVA_PATH
                const runnerPath = config.paths.CORE_WARS_PATH
    exec(`${javaPath} -cp "${resolve(runnerPath)}" il.co.codeguru.corewars8086.CoreWarsEngine "${resolve(safePath)}" "${resolve(keyPath)}"`,callback)
}

export async function crackSafe(req,res){
    const userId = req.body[config.server.post.authParams.userId];
    const params = config.server.post.paths.crackSafe.params;
    const safeId = req.body[params.safeId]

    //get the user Key
    const keys = await Key.find({ownerId:userId,safeId:safeId})
    if(keys.length==0||!keys[0].keyAccepted){
        res.send({isError:true,error:"You need to assemble your key first!"})
        return;
    }
    const key = keys[0];
    const keyPath = `${config.paths.KEYS_COMPILED_PATH}${key._id.toString()}`
    const safePath = `${config.paths.SAFES_COMPILED_PATH}${safeId}`;
    if(!existsSync(keyPath)){
        res.send({isEerror:true,error:"There is errorwith your key file. try to assemble it again."})
    }
    else if(!existsSync(safePath)){
        res.send({isError:true,error:"There is an error with the safe. Ask the safe owner to reAssemble it."})
    }
    else{
        runGame(safePath,keyPath,async (error,stdout,stderr)=>{
            if(error||stderr){
                res.send({isError:true,error:"There was an error running the game. Please try again later."});
            }
            else{
                const safe = await Safe.findById(safeId)
                const comp = await Competition.findById(safe.competiotinId)
                if(stdout.indexOf(`${safeId}`)!=-1){
                    res.send({isError:false,isWin:true})
                    key.keyWin = true;
                }else{
                    res.send({isError:false,isWin:false})
                    key.keyWin = false;
                }
                key.save()
                    .then(k=>
                        scoreChanged(comp._id.toString())
                )
            }
        })
    }

    
}