import { useNavigate } from "react-router";
import { Button,Form, FormLabel, InputGroup } from "react-bootstrap";
import Input from '../../controls/input/Input'
import { useState } from "react";
import { requestWithAuth } from "../../../common/request";
import { serverUrl,serverPaths } from "../../../common/config";
import { useContext } from "react";
import { AuthContext } from "../../../context/auth-context/auth-context";
import { $updateInput } from "../../../common/wrappers";
import { useEffect } from "react";



export default function CreateGame(){
    const [compName,setCompName] = useState('');
    const [compDescription,setCompDescription] = useState("");
    const authContext = useContext(AuthContext)
    const [startDate,setStartDate] = useState(new Date())
    const navigate = useNavigate()

    const checkForm = ()=>{
        if(compName.length<6){
            window.alert("The competiotion name must have 6 characters");
            return false;
        }else if(compDescription==""){
            window.alert("You need to describe the competioiton");
            return false;
        }
        return true;
    }

    const createCompetiotion = ()=>{
        if(!checkForm()){
            return;
        }
        requestWithAuth(`${serverUrl}${serverPaths.createCompetition}`,{name:compName,description:compDescription,startTime:startDate},authContext.authData())
            .then(res=>{
                if(res.isError){
                    navigate(`/home?${res.error}&variant=danger`)
                }else{
                    navigate("/home?msg=The game created!&variant=success",{replace:true})
                }
            });
    }

    return(<>
            <Input placeholder="The competiotion name" setter={setCompName} type="text"/>
            <Form.Control placeholder="Describe the competiotion here." as="textarea" onChange={$updateInput(setCompDescription)} rows={5}/>
            <InputGroup>
                <InputGroup.Text>Start Date: </InputGroup.Text>
                <Form.Control type="date" onChange={$updateInput(setStartDate)} value={startDate}/>
            </InputGroup>
            <div className="d-grid gap-2">
                <Button onClick={createCompetiotion} size="lg" variant="success">Create!</Button>
            </div>


        </>)
}