import { EventEmitter } from "events";
import { loadScores } from "../competitions.js";

const event = "score-changed"
const emmiter = new EventEmitter();



export function onScoreChanged(litsener){
    return emmiter.on(event,litsener)
}

export function scoreChanged(competitionId){
    loadScores(competitionId).then(scores=>
        emmiter.emit(event,competitionId,scores)
    );
}

