import Input from "../../controls/input/Input";
import { useState,useContext } from "react";
import { AuthContext } from "../../../context/auth-context/auth-context";
import { Button } from "react-bootstrap";
import { requestWithAuth } from "../../../common/request";
import { serverPaths,serverUrl } from "../../../common/config";
import { useNavigate } from "react-router";

export default function AddGame(){
    const authContext = useContext(AuthContext);
    const [gameCode,setGameCode] = useState('')
    const navigate = useNavigate();
    function joinCompetition(){
        requestWithAuth(`${serverUrl}${serverPaths.joinCompetition}`,{gameCode:gameCode},authContext.authData())
        .then(res=>{
            if(res.isError){
                navigate(`/home?msg=${res.error}`,{replace:true})
            }else{
                navigate(`/home?msg=The game has been added to your games!`,{replace:true})
            }
        })
    }

    return(<>
        <h1 style={{textAlign:"center"}}>Enter The Game Code Here:</h1>
        <Input value={gameCode} setter={setGameCode} placeholder="Put the game code here" />
        <Button variant="success" onClick={joinCompetition}>Join!</Button>
    </>
    )
}