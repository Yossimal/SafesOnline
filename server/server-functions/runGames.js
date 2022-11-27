import {createRequire} from 'module'
import {exec} from 'child_process'
import {resolve} from 'path'

const require = createRequire(import.meta.url);
const config = require('../config.json')

export function runGame(safePath,keyPath,callback){
    const javaPath = config.paths.JAVA_PATH
                const runnerPath = config.paths.CORE_WARS_PATH
    exec(`${javaPath} -cp "${resolve(runnerPath)}" il.co.codeguru.corewars8086.CoreWarsEngine "${resolve(safePath)}" "${resolve(keyPath)}"`,callback)
}