import runServer from "./server.js";
import {initialize} from "./firebase/auth.js";
import {uploadFile} from "./firebase/storage.js";

const firebaseApp = initialize()
runServer()
uploadFile(firebaseApp,'safesCompiled/Gabi','./codes/compiled_safes/Gabi').then(res=>{
    console.log(res);
});
