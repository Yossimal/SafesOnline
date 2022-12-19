import {Container,Row,Col, ButtonGroup, Button} from 'react-bootstrap'
import PlayersList from './PlayersList'
import { useParams } from 'react-router'
import { useState,useContext, useEffect } from 'react'
import KeysList from './KeysList'
import { requestWithAuth } from '../../../common/request'
import { serverUrl,serverPaths } from '../../../common/config'
import { AuthContext } from '../../../context/auth-context/auth-context'
import {useNavigate} from 'react-router-dom'

export default function GameManager(){
    
    const urlParams = useParams()
    const [safeId,setSafeId] = useState('');
    const [safeName,setSafeName] = useState('');
    const [playersData,setPlayersData] = useState([])
    //const [userName,setUserName] = useState('');
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();
    const [lockSafes,setLockSafes] = useState(false);
    const [lockKeys,setLockKeys] = useState(false);
    const [lockKeysData,setLockKeysData] = useState({color:"warning",text:"loading..."})
    const [lockSafesData,setLockSafesData] = useState({color:"warning",text:"loading..."})

    useEffect(()=>{
        requestWithAuth(`${serverUrl}${serverPaths.loadManagerData}`,{compId:urlParams.comp_id},authContext.authData())
            .then(res=>{
                    if(res.isError){
                        navigate(`/?msg=${res.error}`);
                    }
                    else{
                        setPlayersData(res.data)
                        setLockKeys(res.lockStatus.keys)
                        setLockSafes(res.lockStatus.saves)
                    }
            });
    },[])

    useEffect(()=>{
        setLockSafesData({
            color:lockSafes?"secondary":"primary",
            text:lockSafes?"Unlock safes uploads":"Lock safes uploads"
        });
    },[lockSafes])

    useEffect(()=>{
        setLockKeysData({
            color:lockKeys?"secondary":"primary",
            text:lockKeys?"Unlock keys uploads":"Lock keys uploads"
        });
    },[lockKeys])

    function onSafeSelected(id,name){
        setSafeId(id)
        setSafeName(name)
    }

    function onSafeDownloaded(id,name,userName){
        requestWithAuth(`${serverUrl}${serverPaths.managerDownloadSafe}`,{safeId:id,compId:urlParams.comp_id},authContext.authData())
            .then(res=>{
                if(res.isError){
                    navigate(`/?msg=${res.error}`,{replace:true})
                    console.error(res)
                    return;
                }
                else{
                    downloadFile(`${userName} - ${name}.asm`,res.code)
                }
            })
    }

    function downloadFile(name,text){
            // Create blob link to download
            const url = window.URL.createObjectURL(
            new Blob([text],{type: 'text/plain'}),
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
            'download',
            `${name}`,
            );

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
    }

    function onKeyDownloaded(id,safeName,userName){
        requestWithAuth(`${serverUrl}${serverPaths.managerDownloadKey}`,{keyId:id,compId:urlParams.comp_id},authContext.authData())
        .then(res=>{
            if(res.isError){
                navigate(`/?msg=${res.error}`,{replace:true})
                console.error(res)
                return;
            }
            else{
                downloadFile(`${safeName}.key.${userName}.asm`,res.code)
            }
        })
    }

    async function lock(what,isLock){
        return await requestWithAuth(`${serverUrl}${serverPaths.lockUploads}`,{compId:urlParams.comp_id,lock:isLock,what:what},authContext.authData())
    }

    function toggleLockSafes(){
        lock("saves",!lockSafes)
            .then(res=>{
                setLockSafes(res.status);
            })
    }

    function toggleLockKeys(){
        lock("keys",!lockKeys)
            .then(res=>{
                setLockKeys(res.status);
            })
    }
    
    return <Container>
        <Row>
            <div className="d-grid gap-2">
                <ButtonGroup size='lg'>
                    <Button variant={lockSafesData.color} onClick={toggleLockSafes}>{lockSafesData.text}</Button>
                    <Button variant={lockKeysData.color} onClick={toggleLockKeys}>{lockKeysData.text}</Button>
                </ButtonGroup>
            </div>
        </Row>
        <Row>
            <Col xs={6}>
                <PlayersList playersData={playersData} onDownload={onSafeDownloaded} onSelected={onSafeSelected}/>
            </Col>
            <Col xs={6}>
                {safeId!==''&&<KeysList safeId={safeId} safeName={safeName} onDownload={onKeyDownloaded} compId={urlParams.comp_id} />}
            </Col>
        </Row>

    </Container>
}