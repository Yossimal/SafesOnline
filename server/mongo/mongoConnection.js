import mongoose from "mongoose";
var db = null;

export function establishConnection(){
    const ret = mongoose.connect("mongodb://localhost:27017/safesdb")
    db = mongoose.connection
    
    db.on("error",err=>console.log(err))
    db.once('open',()=>{
        console.log("Connected");
    })
    return ret;
}

export default db;
