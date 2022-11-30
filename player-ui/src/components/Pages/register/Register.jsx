import { InputGroup,Form, FormGroup, Button } from 'react-bootstrap'
import {useState,useEffect,useContext} from 'react'
import { requestPost } from '../../../common/request'
import {serverUrl,serverPaths,pagesPaths} from "../../../common/config.js"
import {sha256} from 'js-sha256'
import { AuthContext } from '../../../context/auth-context/auth-context'
import {useNavigate} from 'react-router'

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
    const authContext = useContext(AuthContext)
    const navigate = useNavigate()
    const [userName,setUserName] = useState("")
    const [password,setPassword] = useState("")
    const [confirmPassword,setConfirmPassword] = useState("")
    const [email,setEmail] = useState("")
    const [fullName,setFullName] = useState("")


    useEffect(()=>{
        if(authContext.isLoggedIn){
            navigate('..',{relative:true})
        }
    },[])

    function checkForm(){
        if(password!==confirmPassword){
            return {ok:false,msg:"confirm password not match the password"};
        }else if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)){
            return {ok:false,msg:"password must contain 6 characters, at least one letter and one number"};
        }else if(!/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email)){
            return {ok:false,msg:"invalid email"}
        }else{
            return {ok:true}
        }
    }

    function handleRegister(){
        const ok = checkForm()
        if(!ok.ok){
            window.alert(ok.msg);
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
                    navigate('..',{relative:true})
                }
            });

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