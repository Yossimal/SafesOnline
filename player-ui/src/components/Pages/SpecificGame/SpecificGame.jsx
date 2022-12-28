import { useEffect,useState,useContext } from "react";
import { Container, Row,Col, Button,Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Input from "../../controls/input/Input";
import AsmEditor from '../../controls/CodeEditor/Editor';
import { requestWithAuth,requestFile } from "../../../common/request";
import {serverUrl,serverPaths} from '../../../common/config.js'
import { AuthContext } from "../../../context/auth-context/auth-context";
import SafeList from "./SafesList";
import ScoreBoard from "./ScoreBoard";
export default function SpecificGame(){

    const routeParams = useParams()
    const [compData,setCompData] = useState() 
    const [otherSafes,setOtherSafes] = useState([])
    const [safeName,setSafeName] = useState('loading...')
    const [code,setCode] = useState('loading...')
    const [competiotionName,setCompetiotionName] = useState('loading...')
    const [crackedSafeId,setCrackedSafeId] = useState(null)
    const authContext = useContext(AuthContext)
    const [alertMsg,setAlertMsg] = useState('');
    const [alertColor,setAlertColor] = useState('danger')
    const [downloadedCode,setDownloadedCode] = useState('')

    useEffect(()=>{
        const compId = routeParams.comp_id;
        requestWithAuth(`${serverUrl}${serverPaths.specificCompetiotion}`,{compId:compId},authContext.authData())
        .then(res=>{
            setSafeName(res.safeData.name);
            setOtherSafes(res.otherSafes)
            setCompData(res)
            setCompetiotionName(res.compData.name)
            setDownloadedCode(res.safeData.code)
        })
    },[routeParams,authContext]);


    useEffect(()=>{
        setCode(downloadedCode)
    },[downloadedCode])


    // function saveSafe(){
    //     requestWithAuth(`${serverUrl}${serverPaths.saveSafe}`,{safeId:compData.safeData.id,name:safeName,safeCode:code},authContext.authData())
    //     .then(res=>{
    //         setDownloadedCode(code)
    //         handleResponse('The file have been saved!',res)
    //     });
    // }

    function assembleSafe(){
        requestWithAuth(`${serverUrl}${serverPaths.assembleSafe}`,{safeId:compData.safeData.id,name:safeName,safeCode:code},authContext.authData())
        .then(res=>{
            setDownloadedCode(code)
            handleResponse('The file has been assembled!',res)
        });
    }

    function handleResponse(successMsg,res){
        if(res.isError){
            setAlertMsg(res.error);
            setAlertColor('danger');
            return;
        }
        setAlertMsg(successMsg)
        setAlertColor('info')
    }

    function onSafeDownloaded(id,name){
        requestFile(`${serverUrl}${serverPaths.downloadSafe}`,{safeId:id},authContext.authData())
        .then((blob) => {
            // Create blob link to download
            const url = window.URL.createObjectURL(
            new Blob([blob]),
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
            'download',
            `${name}.com`,
            );

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
        });
    }

    function onSafeSelected(id){
        let ok = true;
        if(downloadedCode!==code){
            if(!window.confirm("Are you sure you want to change window without saving?")){
                ok=false;
            }
        }
        if(ok){
            requestWithAuth(`${serverUrl}${serverPaths.loadKey}`,{safeId:id},authContext.authData())
                .then(res=>{
                    setDownloadedCode(res.code)
                    setCrackedSafeId(id)
                    if(res.isWin){
                        setAlertColor("warning")
                        setAlertMsg("Warning: That key already wining this safe! if you will assemble or save new key you may lose the winning progress!");
                    }
                    else{
                        setAlertMsg('')
                        
                    }
            });
        }
    }

    // function saveKey(){
    //     requestWithAuth(`${serverUrl}${serverPaths.saveKey}`,{safeId:crackedSafeId,keyCode:code},authContext.authData())
    //     .then(res=>{
    //         handleResponse("The key has been saved!",res)
    //         setDownloadedCode(code)
    //     })
    // }

    function assembleKey(){
        requestWithAuth(`${serverUrl}${serverPaths.assembleKey}`,{safeId:crackedSafeId,keyCode:code},authContext.authData())
            .then(res=>{
                handleResponse("The key has been assmbled!",res)
                setDownloadedCode(code)
            });
    }
    function crackSafe(){
        requestWithAuth(`${serverUrl}${serverPaths.crackSafe}`,{safeId:crackedSafeId},authContext.authData())
        .then(res=>{
            if(res.isError){
                handleResponse("",res);
            }
            else if(res.isWin){
                setAlertMsg("You did it!")
                setAlertColor("success")
            }else{
                setAlertMsg("better luck next time :(")
                setAlertColor("danger")
            }
        })
    }
    function editSafe(){
        if(downloadedCode!==code){
            if(!window.confirm("Are you sure you want to leave the key without saving?")){
                return;
            }
        }
        else{
            setCrackedSafeId(null)
            requestWithAuth(`${serverUrl}${serverPaths.loadSafeCode}`,{safeId:compData.safeData.id},authContext.authData())
                .then(res=>{
                    if(res.isError){
                        handleResponse("",res)
                    }
                    else{
                        setDownloadedCode(res.code)
                        setAlertMsg('')
                    }
                });
        }
    }

    return (
        <>
            <Container>
                <Row>
                    <Col xs={8}>
                        <Container>
                            <Row>
                                <Col>
                                    <h1 style={{textAlign:"center"}}>{competiotionName}</h1>
                                    <Input value={safeName} setter={setSafeName} placeholder="The safe name"/>
                                </Col>
                            </Row>
                            <Row>   
                                <Col>
                                    {alertMsg!=''&&<Alert variant={alertColor}>{alertMsg}</Alert>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                
                                    <AsmEditor codeState={[code,setCode]} />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                <div className="mb-2">
                                    <Button onClick={crackedSafeId==null?assembleSafe:assembleKey} size="md">Upload {crackedSafeId==null?"Safe":"Key"}</Button>{' '}
                                    {crackedSafeId!=null&&<Button variant="secondary" onClick={crackSafe} size="md">Run</Button>}{' '}
                                    {crackedSafeId!=null&&<Button variant="dark" onClick={editSafe} size="md">Continue editing my safe</Button>}
                                </div>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col>
                        <SafeList onDownload={onSafeDownloaded} onSelect={onSafeSelected} safes={otherSafes}/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ScoreBoard compId={routeParams.comp_id}/>
                    </Col>
                </Row>
            </Container>
        </>
    )
}