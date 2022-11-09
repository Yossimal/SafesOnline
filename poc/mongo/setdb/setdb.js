import User,{addToCompetition} from "../schemes/User.js";
import Safe from "../schemes/Safe.js";
import Key from "../schemes/Key.js";
import EmailRegisterToken from "../schemes/EmailRegisterToken.js";
import Competition from "../schemes/Competition.js";
import {createRequire} from "module";
import {sha256} from "js-sha256";

const require = createRequire(import.meta.url)
const usersData = require("./data/users.json")


Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
  }

function generateRegisterToken(){
    ((new Date).getTime()*Math.ceil(1+Math.random()*9999999999)).toString(36)
}

export default function setDb(){
   //setUsers();
    //setCompetiotion();

}

function setUsers(){
    usersData.forEach(usr=>{
        const toAdd = new User(usr);
        toAdd.password = sha256(toAdd.password)
        toAdd.save();
       })
}

function setCompetiotion(){
    const query = User.find({userName:"yossimal"}).then(adminArr=>{
        const admin=adminArr[0]
        admin.competitions = []
        admin.save().then(a=>{
            const comp = new Competition({
                startTime:new Date(),
                creatorId:admin._id,
                registerToken:generateRegisterToken(),
            });
            comp.save().then(res=>{
                addToCompetition(admin,res,true);});
        })
    })
}
