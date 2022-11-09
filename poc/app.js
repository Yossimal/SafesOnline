import runServer from "./server.js";
import { establishConnection } from "./mongo/mongoConnection.js";
import {initialize} from "./firebase/auth.js";
import Competition from "./mongo/schemes/Competition.js";
import User from "./mongo/schemes/User.js"
import setDb from "./mongo/setdb/setdb.js";



establishConnection()
    .then(db=>{
        setDb();
        
        runServer();
    }).catch(err=>console.error(err))