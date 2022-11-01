import {getDatabase} from "firebase-admin/database";


function onChange(app,path,onLoad){

}

function writeData(app,userId,name,email){
    const db = getDatabase(app)
    db.ref('users/'+userId).set({name:name,email:email},error=>{
        if(error){
            console.log(error);
        }
    }).then(()=>console.log('yey'));
}