import { useEffect } from "react";
import { ListGroup,ListGroupItem,Button,Container,Col,Row } from "react-bootstrap";
import { useState } from "react";
import {$partial} from '../../../common/wrappers.js'
import {GiCheckMark} from 'react-icons/gi'


function PlayerItem({playerName,safeName,onDownloadSafe,onKeysSelected,email,safeAccepted}){
    return (
        <ListGroupItem>
            <Container>
                <Row>
                    <Col xs={6}>
                        <div style={{textAlign:"center"}} className="fw-bold">{playerName}</div>
                    </Col>

                    <Col xs={6}>
                        <p style={{textAlign:"center"}}>{safeName}</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}/>
                    <Col xs={4}>
                        <small style={{textAlign:"center"}}>{email}</small>
                    </Col>
                    <Col xs={4}/>
                </Row>
                <Row>
                    <Col xs={4}>
                        <Button size="sm" variant="info" onClick={onDownloadSafe}>Download Safe</Button>
                    </Col>
                    <Col xs={1}/>
                    <Col xs={2}>
                        {safeAccepted&&<GiCheckMark style={{textAlign:"center"}}/>}
                    </Col>
                    <Col xs={1}/>
                    <Col xs={4}>
                        <Button size="sm" onClick={onKeysSelected}>Show all keys</Button>
                    </Col>

                </Row>
            
            </Container>
        </ListGroupItem>
    )
}

export default function PlayersList({playersData,onSelected,onDownload}){
    const [players,setPlayers] = useState([])

    useEffect(()=>{
        setPlayers(playersData.map(i=>
            <PlayerItem 
                key={i.safe.id} 
                playerName={i.user.name} 
                safeName={i.safe.name}
                onDownloadSafe={$partial(onDownload,[i.safe.id,i.safe.name,i.user.name])}
                onKeysSelected={$partial(onSelected,[i.safe.id,i.safe.name])}
                email={i.user.email}
                safeAccepted={i.safe.accepted}
            />
        ));
    },[playersData,onDownload,onSelected])



    return (
        <ListGroup>
            {players}
        </ListGroup>
    )
}