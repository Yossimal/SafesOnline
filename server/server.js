import fs from "fs";
import {exec} from "child_process";
import {resolve} from "path";
import express from "express";
import {createRequire} from "module"
import cors from 'cors'
import { checkToken, confirmEmail, login, logOut, register } from "./server-functions/authentications.js";
import { askRestorePaassword, changePassword, getUserProfile } from "./server-functions/user.js";
import { $private } from "./server-functions/common.js";

const require = createRequire(import.meta.url)
const config = require('./config.json')
const app = express();
const port = config.server.port
app.use(express.json())
//app.use(bodyParser.urlencoded({extended:true}))
app.use(cors({
    origin: config.ui.url
  }));

const SAFES_CODE_PATH = config.paths.SAFES_CODE_PATH;
const SAFES_COMPILED_PATH =config.paths.SAFES_COMPILED_PATH;
const NASM_PATH = config.paths.NASM_PATH;
const KEYS_CODE_PATH =config.paths.KEYS_CODE_PATH;
const KEYS_COMPILED_PATH = config.paths.KEYS_COMPILED_PATH;
const CORE_WARS_PATH =config.paths.CORE_WARS_PATH;
const JAVA_PATH =config.paths.JAVA_PATH;

let lockSafesUploads = false
let lockKeysUpload = false

function runServer() {
    const paths = config.server.post.paths

    app.post(paths.login.path,login);
    app.post(paths.register.path,register);
    app.post(paths.confirm.path,confirmEmail);
    app.post(paths.checkToken.path,checkToken);
    app.post(paths.logOut.path,logOut);
    app.post(paths.getUserProfile.path,$private(getUserProfile))
    app.post(paths.changePassword.path,$private(changePassword))
    app.post(paths.askRestorePassword.path,askRestorePaassword)




    app.get('/', (req, res) => {
        res.send('מה חשבת למצוא כאן?')
    });
    app.post(config.server.post.paths.uploadSafe, (req, res) => {
        if (lockSafesUploads) {
            res.send("cant upload safes now")
        } else if (req.body.name == null || req.body.password == null || req.body.safe == null) {
            res.send({error: "bad request"})
        } else if (checkPassword(req.body.name, req.body.password)) {

            fs.writeFile(`${SAFES_CODE_PATH}${req.body.name}.asm`, req.body.safe, (err) => {

                if (err) {
                    res.send({error: "there was an error creating the file"})
                } else {
                    exec(`${NASM_PATH} "${SAFES_CODE_PATH}${req.body.name}.asm"`, (error, stdout, stderr) => {
                        if (error || stderr) {
                            res.send({error: "an error was occurred on compilation"});
                            console.error(error);
                            console.error(stderr);
                        } else if (stdout) {
                            res.send({error: "code error", output: stdout});
                        } else {
                            exec(`move "${resolve(SAFES_CODE_PATH + req.body.name)}" "${resolve(SAFES_COMPILED_PATH)}"`, (error, stdout, stderr) => {
                                if (stderr || error) {
                                    res.send({error: "failed to save the compiled file"})
                                    console.log(stderr)
                                    console.log(error)
                                } else {
                                    res.send({yey: "the file have saved"});
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.send({error: "bad password"});
        }
        //console.log(req.body);
    });
    app.post(config.server.post.paths.uploadKey, (req, res) => {
        if (lockKeysUpload) {
            res.send({error: "you cant upload keys right now"})
        } else if (req.body.name == null || req.body.password == null || req.body.safe == null || req.body.key == null) {
            res.send({error: "bad request"});
        } else if (checkPassword(req.body.name, req.body.password)) {
            fs.writeFile(`${KEYS_CODE_PATH}${req.body.name}.${req.body.safe}.asm`, req.body.key, (err) => {
                if (err) {
                    console.error("error: " + err)
                    res.send({error: "there was an error creating the file"})
                } else {
                    exec(`${NASM_PATH} "${KEYS_CODE_PATH}${req.body.name}.${req.body.safe}.asm"`, (error, stdout, stderr) => {
                        if (error || stderr) {
                            res.send({error: "an error was occurred on compilation"});
                            console.error(error);
                            console.error(stderr);
                        } else if (stdout) {
                            res.send({error: "code error", output: stdout});
                        } else {
                            exec(`move "${resolve(KEYS_CODE_PATH + req.body.name + '.' + req.body.safe)}" "${resolve(KEYS_COMPILED_PATH)}"`, (error, stdout, stderr) => {
                                if (stderr || error) {
                                    res.send({error: "failed to save the compiled file"})
                                    console.log(stderr)
                                    console.log(error)
                                } else {
                                    res.send({yey: "the file have saved"});
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.send({error: "bad password"});
        }
    });
    app.post(config.server.post.paths.play, (req, res) => {
        if (req.body.name == null || req.body.password == null || req.body.safe == null) {
            res.send({error: "invalid request"})
        } else if (checkPassword(req.body.name, req.body.password)) {
            const playerFile = `${KEYS_COMPILED_PATH}${req.body.name}.${req.body.safe}`
            const safeFile = `${SAFES_COMPILED_PATH}${req.body.safe}`
            exec(`"${resolve(JAVA_PATH)}" -cp "${resolve(CORE_WARS_PATH)}"  il.co.codeguru.corewars8086.CoreWarsEngine "${resolve(safeFile)}" "${resolve(playerFile)}"`, (error, stdout, stderr) => {

                if (error || stderr) {
                    res.send({error: "there was an error running the game"})
                    console.log(error)
                    console.log(stderr)
                } else {
                    if (stdout.includes(`${req.body.safe}.${req.body.name}`)) {
                        res.send({yey: "the game has ended successfully", results: "win"})
                    } else {
                        res.send({yey: "the game has ended successfully", results: "lose"})
                    }
                }
            });
        }
    });
    app.post(config.server.post.paths.lock, (req, res) => {
        if (req.body.name == null || req.body.password == null || req.body.what == null) {
            res.send({error: "invalid request"});
            return;
        }
        let what = getWhat(req.body.what)
        if (!what) {
            res.send({error: "bad lock option"});
            return;
        }

        if (lockSafesUploads) {
            res.send({error: `the ${what} upload option is already locked`})
        } else if (checkPassword(req.body.name, req.body.password) && isAdmin(req.body.name)) {
            let what;
            if (what === 'safes') {
                lockSafesUploads = true;
            } else {
                lockKeysUpload = true;
            }

            res.send({yey: `The ${what} uploads option is locked`});
        } else {
            res.send({error: `you dont have the privileges for locking the ${what} upload options`});
        }
    });
    app.post(config.server.post.paths.unlock, (req, res) => {
        if (req.body.name == null || req.body.password == null || req.body.what == null) {
            res.send({error: "invalid request"});
            return;
        }
        let what = getWhat(req.body.what);
        if (!what) {
            res.send({error: "bad lock option"})
            return;
        }

        if (!lockSafesUploads) {

            res.send({error: `the ${what} upload option is not locked`})
        } else if (checkPassword(req.body.name, req.body.password) && isAdmin(req.body.name)) {
            let what;
            if (what === 'safes') {
                lockSafesUploads = false;
            } else {
                lockKeysUpload = false;
            }

            res.send({yey: `The ${what} uploads option is unlocked`});
        } else {
            res.send({error: `you dont have the privileges for unlocking the ${what} upload options`});
        }
    });
    app.get(config.server.get.paths.lockStatus, (req, res) => {
        let what = getWhat(req.params.what)
        if(!what) {
            res.send({error: "bad request param"});
            return;
        }
        res.send({lockStatus: what==='safes'?lockSafesUploads:lockKeysUpload});
    });
    app.get(config.server.get.paths.allSafes, (req, res) => {
        fs.readdir(SAFES_COMPILED_PATH, (err, files) => {
            let results = []
            files.forEach(file => {
                results.push(file)
            });
            res.send({safes: results})
        })
    });
    app.get(config.server.get.paths.getSafeBinary, (req, res) => {
        fs.readdir(SAFES_COMPILED_PATH, (err, files) => {
            if (!req.params.safe in files) {
                res.send({error: "safe not exists"});
            } else {
                res.sendFile(`${resolve(SAFES_COMPILED_PATH + req.params.safe)}`)
            }
        })
    });
    app.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });
    function checkPassword(name, password) {
        return true;
    }
    function isAdmin(name) {
        return true;
    }
    function getWhat(what){
        switch (what) {
            case 'safes':
                return 'safes';
            case 'keys':
                return 'keys';
            default:
                return null;
        }
    }
}

export default runServer