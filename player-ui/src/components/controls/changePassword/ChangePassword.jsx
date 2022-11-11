import { useContext, useState } from "react"
import { Button, Form, FormControl, InputGroup } from "react-bootstrap"
import { serverPaths, serverUrl } from "../../../common/config"
import { requestWithAuth } from "../../../common/request"
import { AuthContext } from "../../../context/auth-context/auth-context"
import {sha256} from 'js-sha256'


function ChangePasswordInput(props){
    function update(e){
        props.setter(e.target.value)
    }

    return (<InputGroup>
        <Form.Control 
            placeholder={props.placeholder}
            onChange={update}
            type={props.type?props.type:"password"}
        />
    </InputGroup>)
}




export default function ChangePassword(props){

    const [currentPassword,setCurrentPassword] = useState('');
    const [newPassword,setNewPassword] = useState('');
    const [confirmNewPassword,setConfirmNewPassword] = useState('');
    const authContext = useContext(AuthContext);
    
    function checkForm(){
        if(newPassword!==confirmNewPassword){
            return {ok:false,msg:"confirm password not match the password"};
        }else if(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(newPassword)){
            return {ok:false,msg:"password must contain 6 characters, at least one letter and one number"};
        }else{
            return {ok:true}
        }
    }

    function updatePassword(){
        const ok=checkForm()
        if(!ok.ok){
            window.alert(ok.msg)
            return;
        }else{
            requestWithAuth(`${serverUrl}${serverPaths.changePassword}`,{oldPassword:sha256(currentPassword),newPassword:sha256(newPassword)},authContext.authData())
                .then(res=>{
                    if(!res.ok){
                        window.alert(res.error)
                    }else{
                        window.alert("The password has been changed successfuly");
                    }
                });
        }
    }

    return (<>
            <ChangePasswordInput placeholder="Current Password" setter={setCurrentPassword}/>
            <ChangePasswordInput placeholder="New Password" setter={setNewPassword}/>
            <ChangePasswordInput placeholder="Repeat New Password" setter={setConfirmNewPassword}/>
            <div className="m-auto d-grid gap-2">
                <Button variant="primary" onClick={updatePassword}>Update Password</Button> 
            </div>
        </>)
}