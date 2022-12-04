import { useState,useEffect, useContext } from "react";
import {Container,Col,Row,ListGroupItem,ListGroup, Button} from 'react-bootstrap'
import { serverPaths, serverUrl } from "../../../common/config";
import { requestWithAuth } from "../../../common/request";
import { AuthContext } from "../../../context/auth-context/auth-context";
import {useNavigate} from 'react-router-dom'
import { $partial } from "../../../common/wrappers";

function KeyItem({playerName,playerEmail,isWin,onDownload,isAccepted}){

    const lineColor = isWin?'success':isAccepted?'warning':'danger'


    return <ListGroupItem variant={lineColor}>
        <Container>
            <Row>
                <Col xs={6}>
                    <div style={{textAlign:"center"}} className="fw-bold">{playerName}</div>
                </Col>
                <Col xs={6}>
                    <small style={{textAlign:"center"}}>{playerEmail}</small>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="d-grid gap-2">
                        <Button style={{fontSize:"12px", padding:"0.05rem 0.05rem"}} onClick={onDownload} variant={`outline-${lineColor}`} size="sm">
                            Download Key
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    </ListGroupItem>
}

export default function KeysList({safeId,compId,safeName,onDownload}){

    const [keys,setKeys] = useState([])
    const authContext = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(()=>{
        requestWithAuth(`${serverUrl}${serverPaths.managerLoadKeys}`,{safeId:safeId,compId:compId},authContext.authData())
            .then(res=>{
                if(res.isError){
                    navigate(`/?msg=${res.error}`)
                    return;
                }
                else{
                    setKeys(res.data.map(k=>
                        <KeyItem
                            key = {k.key.id}
                            playerName={k.user.name} 
                            playerEmail={k.user.email} 
                            isWin={k.key.isWin} 
                            isAccepted={k.key.isAccepted}
                            onDownload={$partial(onDownload,[k.key.id,safeName,k.user.name])}
                        />
                    ))
                }
            })
    },[safeId])

    return <ListGroup>
        {keys}
    </ListGroup>
}