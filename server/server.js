import express from "express";
import {createRequire} from "module"
import cors from 'cors'
import { checkToken, confirmEmail, login, logOut, register } from "./server-functions/authentications.js";
import { askRestorePaassword, changePassword, getUserProfile,restorePassword } from "./server-functions/user.js";
import { $private, $privateSocket } from "./server-functions/common.js";
import { allCompetiotions, downloadKeyMan, downloadSafeMan, getKeysManager, getManagmentUsersData, joinCompetition, loadCompetiotionsData, loadKeyCode, loadSafeCode, lockUploads, newCompetiotion } from "./server-functions/competitions.js";
import { assembleKey, assembleSafe, downloadSafe, saveKey, saveSafe } from "./server-functions/filesEditor.js";
import { crackSafe } from "./server-functions/runGames.js";
import { onScoreChanged, scoreChanged } from "./server-functions/events/scoreChanged.js";
import {Server} from "socket.io"
import { scoreWS } from "./server-functions/competitionsWS.js";
import { createServer } from "http";

const require = createRequire(import.meta.url)
const config = require('./config.json')
const app = express();
const server = createServer(app)
const port = config.server.port
export const io = new Server(server,{cors:{origin: config.ui.url}})
app.use(express.json())

//app.use(bodyParser.urlencoded({extended:true}))
app.use(cors({
    origin: config.ui.url
  }));

function runServer() {
    const paths = config.server.post.paths

    //POST routes
    app.post(paths.login.path,login);
    app.post(paths.register.path,register);
    app.post(paths.confirm.path,confirmEmail);
    app.post(paths.checkToken.path,checkToken);
    app.post(paths.logOut.path,logOut);
    app.post(paths.getUserProfile.path,$private(getUserProfile));
    app.post(paths.changePassword.path,$private(changePassword));
    app.post(paths.askRestorePassword.path,askRestorePaassword);
    app.post(paths.restorePassword.path,restorePassword);
    app.post(paths.newCompetiotion.path,$private(newCompetiotion));
    app.post(paths.allCompetiotions.path,$private(allCompetiotions));
    app.post(paths.specificCompetitoion.path,$private(loadCompetiotionsData));
    // app.post(paths.saveSafe.path,$private(saveSafe));
    app.post(paths.assembleSafe.path,$private(assembleSafe));
    app.post(paths.joinCompetition.path,$private(joinCompetition));
    app.post(paths.getDownloadLink.path,$private(downloadSafe));
    app.post(paths.loadKeyCode.path,$private(loadKeyCode));
    app.post(paths.loadSafeCode.path,$private(loadSafeCode));
    // app.post(paths.saveKey.path,$private(saveKey));
    app.post(paths.assembleKey.path,$private(assembleKey));
    app.post(paths.crackSafe.path,$private(crackSafe));
    app.post(paths.managerDownloadSafe.path,$private(downloadSafeMan));
    app.post(paths.managerDownloadKey.path,$private(downloadKeyMan))
    app.post(paths.loadManagmentData.path,$private(getManagmentUsersData));
    app.post(paths.loadKeysManager.path,$private(getKeysManager));
    app.post(paths.lockCompetitionUploads.path,$private(lockUploads))


    //GET routes
    app.get('/', (req, res) => {
        res.send('מה חשבת למצוא כאן?')
        scoreChanged("63831bed5931822dac6c3bf9")
    });

    //Web socket connections
    io.on('connection',$privateSocket(scoreWS))



    server.listen(port, () => {
        console.log(`Listening on port ${port}`)
    });

}

export default runServer
