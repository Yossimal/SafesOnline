import { useEffect,useState,useContext } from "react";
import { Container, Row,Col, Button,Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Input from "../../controls/input/Input";
import AsmEditor from '../../controls/CodeEditor/Editor';
import { requestWithAuth } from "../../../common/request";
import {serverUrl,serverPaths} from '../../../common/config.js'
import { AuthContext } from "../../../context/auth-context/auth-context";



export default function SpecificGame(){

    const routeParams = useParams()
    const [compData,setCompData] = useState() 
    const [safeName,setSafeName] = useState('loading...')
    const [code,setCode] = useState('loading...')
    const [competiotionName,setCompetiotionName] = useState('loading...')
    const [editingKey,setEditingKey] = useState(false)
    const authContext = useContext(AuthContext)
    const [alertMsg,setAlertMsg] = useState('');
    const [alertColor,setAlertColor] = useState('danger')

    useEffect(()=>{
        const compId = routeParams.comp_id;
        requestWithAuth(`${serverUrl}${serverPaths.specificCompetiotion}`,{compId:compId},authContext.authData())
        .then(res=>{
            setCode(res.safeData.code);
            setSafeName(res.safeData.name);
            setCompData(res)
            setCompetiotionName(res.compData.name)
        })
    },[routeParams]);

    function saveSafe(){
        requestWithAuth(`${serverUrl}${serverPaths.saveSafe}`,{safeId:compData.safeData.id,name:safeName,safeCode:code},authContext.authData())
        .then(res=>{
            handleResponse('The file have been saved!',res)
        });
    }

    function assembleSafe(){
        requestWithAuth(`${serverUrl}${serverPaths.assembleSafe}`,{safeId:compData.safeData.id,name:safeName,safeCode:code},authContext.authData())
        .then(res=>{
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
    return (
        <>
            <Container>
                <Row>
                    <Col xs={10}>
                        <Container>
                            <Row>
                                <Col>
                                    <h1 style={{textAlign:"center"}}>{competiotionName}</h1>
                                    <Input value={safeName} setter={setSafeName} placeholder="The safe name"/>
                                    <AsmEditor codeState={[code,setCode]}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    {alertMsg!=''&&<Alert variant={alertColor}>{alertMsg}</Alert>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                <div className="mb-2">
                                    <Button onClick={saveSafe} size="md" variant="success">Save</Button>{' '}
                                    <Button onClick={assembleSafe} size="md">Assemble</Button>{' '}
                                    {editingKey&&<Button variant="secondary" size="md">Run</Button>}{' '}
                                    {editingKey&&<Button variant="dark" size="md">Continue editing my safe</Button>}
                                </div>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col>
                        The other keys data will be here
                    </Col>
                </Row>
            </Container>
        </>
    )
}