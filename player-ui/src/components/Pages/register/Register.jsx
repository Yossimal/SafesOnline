import { InputGroup,Form, FormGroup, Button } from 'react-bootstrap'
import {useState} from 'react'
import { requestPost } from '../../../common/request'
import {serverUrl,serverPaths,pagesPaths} from "../../../common/config.js"
import {sha256} from 'js-sha256'

function RegisterInput(props){
    function updateInput(setter){
        return function(e){
            setter(e.target.value)
        }
    }
    return <>
        <FormGroup>
            <Form.Control type={props.type==null?"text":props.type} placeholder={props.placeholder} onChange={updateInput(props.setter)} />
        </FormGroup>
    </>

}

export default function Register(){

    const [userName,setUserName] = useState("")
    const [password,setPassword] = useState("")
    const [confirmPassword,setConfirmPassword] = useState("")
    const [email,setEmail] = useState("")
    const [fullName,setFullName] = useState("")

    function checkForm(){

    }

    function handleRegister(){
        const error = checkForm()
        if(error!=null){
            window.alert(error);
            return;
        }
        const body = {
            userName:userName,
            password:sha256(password),
            email:email,
            fullName:fullName
        }
        requestPost(`${serverUrl}${serverPaths.register}`,body)
            .then(res=>{
                if(res.error!=null){
                    window.alert(res.error)
                }
                else{
                    console.log(res)
                }
            })

    }
    

    return (
        <>
            <RegisterInput placeholder="User Name" setter={setUserName}/>
            <RegisterInput type="password" placeholder="Password" setter={setPassword}/>
            <RegisterInput type="password" placeholder="Confirm Password" setter={setConfirmPassword}/>
            <RegisterInput placeholder="Full Name" setter={setFullName}/>
            <RegisterInput placeholder="Email" setter={setEmail}/>

            <div className='d-grid gap-2'>
                <Button variant='success' size="lg" onClick={handleRegister} >Create Account</Button>
            </div>
        
        </>
    )
}