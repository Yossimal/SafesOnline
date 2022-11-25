import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { serverPaths, serverUrl } from "../../../common/config";
import { requestPost } from "../../../common/request";
import { $updateInput } from "../../../common/wrappers";


export default function ForgotPassword(){

    const [userName,setUserName] = useState("")
    const [email,setEmail] = useState("")
    
    function askRestoreEmail(){
        requestPost(`${serverUrl}${serverPaths.askRestorePassword}`,{email:email,userName:userName})
            .then(res=>{
                if(res.isError){
                    window.alert(res.error);
                }else{
                    window.alert("Check your email to continue the process");
                }
            })
    }

    return (<div>
            <InputGroup>
                <Form.Control type="text" placeholder="enter your user name here" onChange={$updateInput(setUserName)} />
            </InputGroup>
            <InputGroup>
                <Form.Control type="email" placeholder="enter your email here" onChange={$updateInput(setEmail)}/>
            </InputGroup>
            <div>
                <Button varian="primary" onClick={askRestoreEmail}>
                    Continue with the restore password process!
                </Button>
            </div>
        </div>
    )
}