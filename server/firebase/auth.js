import {applicationDefault, cert, initializeApp} from "firebase-admin/app";
import {createRequire} from 'module'
import {getDatabase} from "firebase-admin/database";

const require = createRequire(import.meta.url)
const config = require('../config.json')
const GOOGLE_APPLICATION_CREDENTIALS = require(config.paths.GOOGLE_APPLICATION_CREDENTIALS)


function initialize() {
    const app = initializeApp({
        credential: cert(GOOGLE_APPLICATION_CREDENTIALS),
        databaseURL: "https://safes-archi-default-rtdb.europe-west1.firebasedatabase.app/"
    });

    return app;
}


export {initialize}