import { useContext, useState } from "react"
import { requestPost } from "../../../common/request.js"
import { AuthContext } from "../../../context/auth-context/auth-context.js"
import { InputGroup,Button,Form, Fade, Collapse } from "react-bootstrap"
import { useNavigate } from "react-router"
import "./login.css"
import { useSearchParams } from "react-router-dom"
import { sha256 } from "js-sha256"
import {serverPaths, serverUrl,pagesPaths} from "../../../common/config.js"
import { useEffect } from "react"
import { $toggleSetter } from "../../../common/wrappers.js"
import ForgotPassword from "../../controls/forgotPassword/ForgotPassword.jsx"



function Login(){
    const [userName,setUserName] = useState('');
    const [password,setPassword] = useState('');
    const [forgotPassword,setForgotPassword] = useState(false)
    const navigate = useNavigate();
    const [searchParams,setSearchParams] = useSearchParams()
    const [msg,setMsg] = useState(searchParams.get('msg'))
    const authContext = useContext(AuthContext);
    const forgotPasswordElement = ( <div className="ms-5">
                                        <ForgotPassword/>
                                    </div>)


    useEffect(()=>{
        if(authContext.isLoggedIn){
            navigate(pagesPaths.home)
        }
    },[authContext.isLoggedIn])

    useEffect(()=>{
        if(msg!=null&&msg!=''){
            window.alert(msg)
        }
    },[msg])

    function updateInput(setter){
        return function(e){
            setter(e.target.value)
        }
    }

    const handleLogin = ()=>{
        const registerData = {
            userName:userName,
            password:sha256(password)
        }
        requestPost(`${serverUrl}${serverPaths.login}`,registerData)
            .then(res=>{
                if(res.error!=undefined){
                    window.alert(res.error);
                }
                else{
                    authContext.setToken(res.loginToken);
                    authContext.setIsLoggedIn(true)
                    authContext.setUserId(res.userId);
                    navigate(pagesPaths.home)
                }
            })
    }

    function register(){
        navigate(pagesPaths.register);
    }

    return (<><div className="center me-3 ms-3">
        <h1>
            Welcome!
        </h1>
        <p>
            Welcome to the assembly safe cracking competiotion site!
        </p>
        <div className="ms-5 me-5">
            <InputGroup>
                <Form.Control placeholder="User Name" onChange={updateInput(setUserName)} />
            
            </InputGroup>
            <InputGroup>
                <Form.Control type="password" placeholder="Password" onChange={updateInput(setPassword)} />
            </InputGroup>
            <div className="d-grid gap-2">
                <Button onClick={handleLogin} size="lg"  variant="primary">login</Button>
                <Button onClick={register} size="lg" variant="info">Create New Account</Button>
            </div>
        </div>
    </div>
        <Button variant="link" onClick={$toggleSetter(setForgotPassword)} aria-expanded={forgotPassword} className="left ms-5">
            Forgot my password :(
        </Button>
        <Fade in={forgotPassword}>
                {forgotPasswordElement}
        </Fade>
    </>)
}

export default Login