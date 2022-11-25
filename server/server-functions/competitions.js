import Competition from "../mongo/schemes/Competition.js";
import {createRequire} from 'module'

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

    })
}