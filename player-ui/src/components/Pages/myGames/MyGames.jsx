import { useState,useEffect,useContext } from "react";
import { ListGroup } from "react-bootstrap";
import { serverPaths, serverUrl } from "../../../common/config";
import { requestWithAuth } from "../../../common/request";
import { AuthContext } from "../../../context/auth-context/auth-context";
import GameItem from "./GameItem";


export default function MyGames(){
    const [games,setGames] = useState([])
    const authContext = useContext(AuthContext)
    useEffect(()=>{
        requestWithAuth(`${serverUrl}${serverPaths.allCompetiotions}`,{},authContext.authData())
        .then(res=>{
            setGames(res.map(comp=><GameItem gameData={comp} key={comp.id}/>))
        });
    },[authContext]);


    return (<>
        <ListGroup>
            {games}
        </ListGroup>
    </>)
}