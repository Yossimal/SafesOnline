import { useEffect,useState } from "react";
import { useContext } from "react";
import { requestWithAuth } from "../../../common/request";
import { serverUrl,serverPaths } from "../../../common/config";
import { Button, Col, Container, Row } from "react-bootstrap";
import { AuthContext } from "../../../context/auth-context/auth-context";
import { useNavigate } from "react-router";


export default function Profile(){
    
    const navigate = useNavigate()
    const authContext = useContext(AuthContext);
    const [userName,setUserName] = useState('')
    const [fullName,setFullName] = useState('')
    const [email,setEmail] = useState('')
    const [changePassword,setChangePassword] = useState(false)
    
    useEffect(()=>{
        
        const authData = {userId:authContext.userId,token:authContext.token}
        requestWithAuth(`${serverUrl}${serverPaths.getUserProfile}`,{},authData)
            .then(res=>{
                console.log(`isError: ${res.isError}, badToken:${res.badToken}`)
                if(res.isError && res.badToken){
                    console.log("isError")
                    navigate(`/?msg=${res.error}`,{replace:true})
                }else{
                    setUserName(res.userName);
                    setFullName(res.fullName);
                    setEmail(res.email);
                }
            });
    },[authContext.isLoggedIn])

    return (
        <>
            <Container>
                <Row>
                    <Col/>
                    <Col>
                        {userName}
                    </Col>
                    <Col/>
                </Row>
                <Row>
                    <Col/>
                    <Col>
                        {fullName}
                    </Col>
                    <Col/>
                </Row>
                <Row>
                    <Col/>
                    <Col>
                        {email}
                    </Col>
                    <Col/>
                </Row>
                <Row>
                    <Col/>
                    <Col>
                        <Button
                         variant={changePassword?"info":"warning"}
                         size="lg"
                         onClick={()=>setChangePassword(cp=>!cp)}>
                            {changePassword?"Close change password window.":"Change password"}
                        </Button>
                    </Col>
                    <Col/>
                </Row>
                
            </Container>
        </>
    )
}