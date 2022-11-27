import { Schema,model,ObjectId } from "mongoose";
import {sha256} from "js-sha256"
import Safe from "./Safe.js"
import Key from "./Key.js"
import {createRequire} from "module"

const require = createRequire(import.meta.url)
const config = require('../../config.json')


const KeysSchema = new Schema({
    safeId:ObjectId,
    keyId:ObjectId
});

const CompetitionParticipationSchema = new Schema({
    competitionId:ObjectId,
    safeId:ObjectId,
    key:{
        type:[KeysSchema],
        default:[]
    },
    competitionLeader:{
        type:Boolean,
        default:false
    }
});

const UserSchema = new Schema({
    userName:{type:String,unique:true},
    presentName:String,
    email:String,
    emailVarified:{
        type:Boolean,
        default:false
    },
    password:String,
    competitions:{
        type:[CompetitionParticipationSchema],
        default:[]
    },
    
    
},{timestamps:true});

const User = model('User',UserSchema);

export function addUser(userData){
    const toAdd = new User({
        email:userData.email,
        password:userData.password,
        userName:userData.userName,
        presentName:userData.presentName,
        emailVarified:false,
    });
    return User.find({userName:toAdd.userName})
        .then(users=>{
            if(users.length!==0){
                return {isError:true,error:"user already exists"}
            }else{
                return {isError:false}
            }
        }).then(r=>{
            if(r.isError){
               return r; 
            }
            return toAdd.save()
        })
}

export function addToCompetition(user,competiotion,isLeader=false){
    // console.log(user._id)
    const sha = sha256(competiotion._id.toString()+user._id.toString())
    const filePath = `${sha}${+ new Date()}`
    const safe = new Safe({
        competiotinId:competiotion._id,
        ownerId:user._id,
        safeBytecodePath:filePath,
        safeCodePath:`${filePath}.asm`,
    });
    // console.log(safe);
    safe.save().then(s=>{
        user.competitions.push({
            competitionId:competiotion._id,
            safeId:s._id,
            competitionLeader:isLeader
        })
        user.save()
    });
    
}

export default User;