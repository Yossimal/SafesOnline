import { useEffect,useContext } from "react";
import { ListGroup,ListGroupItem,Button, ButtonGroup } from "react-bootstrap";
import { requestWithAuth } from "../../../common/request";
import {serverUrl,serverPaths} from '../../../common/config.js'
import { AuthContext } from "../../../context/auth-context/auth-context";
import { useState } from "react";

function PlayerItem({playerName,safeName,onDownloadSafe,onKeysSelected}){
    return (
        <ListGroupItem>
            <div className="fw-bold">{playerName}</div>
            <p>{safeName}</p>
            <ButtonGroup>
                <Button size="sm" variant="info" onClick={onDownloadSafe}>Download Safe</Button>
                <Button size="sm" onClick={onKeysSelected}>Show all keys</Button>
            </ButtonGroup>
        </ListGroupItem>
    )
}

export default function PlayersList({compId,onSelected,onDownload}){
    const authContext = useContext(AuthContext)
    const [players,setPlayers] = useState([])
    useEffect(()=>{
        requestWithAuth(`${serverUrl}${serverPaths.loadManagerData}`,{compId:compId},authContext.authData())
            .then(res=>{
                        
            });
    },[])

    return (
        <ListGroup>
            {players}
        </ListGroup>
    )
}