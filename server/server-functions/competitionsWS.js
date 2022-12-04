import { createRequire } from 'module';
import { onScoreChanged } from './events/scoreChanged.js';
import { loadScores } from './competitions.js';
import {io} from '../server.js'

const require = createRequire(import.meta.url)
const config = require('../config.json')


export function scoreWS(socket){
    const id = socket.handshake.query.compId
    const userId = socket.handshake.query.userId
    const scoresPath = config.server.socket.paths.scores.path;
    socket.join([userId,id])
    loadScores(id).then(scores=>{
        io.in(userId).emit(scoresPath,scores);
    })
  
    onScoreChanged((id,scores)=>{
        io.in(id).emit('scores',scores)        
    });
    
}

