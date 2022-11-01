import {getStorage} from "firebase-admin/storage";
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const config = require('../config.json')

function uploadFile(app,path,localPath){
   const bucket = getStorage(app).bucket("gs://safes-archi.appspot.com");
   return bucket.upload(localPath,{destination:path});
}



function getFile(app,path,type){
   return  new Promise((resolve,reject)=>{
      switch(type.name){
         case config.firebase.storage.fileTypes.assembly.name:
            resolve(getAssembly(app,path,type.extension));
            break;
         case config.firebase.storage.fileTypes.binary.name:
            resolve(getBinary(app,path,type.extension));
            break;
         default:
            reject(`Bad type ${type}`)
      }
   });

}

function getAssembly(app,path,ext){
   const bucket = getStorage(app).bucket();
   bucket.file(path).createReadStream({})
   return undefined;
}

function getBinary(app, path, extension) {
   return undefined;
}

export {uploadFile,getFile}