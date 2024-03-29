import { useEffect,useState } from "react";
import { useContext } from "react";
import { requestWithAuth } from "../../../common/request";
import { serverUrl,serverPaths } from "../../../common/config";
import { Button, Col, Collapse, Container, Row } from "react-bootstrap";
import { AuthContext } from "../../../context/auth-context/auth-context";
import { useNavigate } from "react-router";
import CangePassword from '../../controls/changePassword/ChangePassword'
import ChangePassword from "../../controls/changePassword/ChangePassword";
import { $toggleSetter } from "../../../common/wrappers";

export default function Profile(){
    
    const navigate = useNavigate()
    const authContext = useContext(AuthContext);
    const [userName,setUserName] = useState('')
    const [fullName,setFullName] = useState('')
    const [email,setEmail] = useState('')
    const [changePassword,setChangePassword] = useState(false)
    
    const changePasswordElement = (<Row>
        <Col>
            <ChangePassword/>
        </Col>
    </Row>)

    useEffect(()=>{
        
        const authData = {userId:authContext.userId,token:authContext.token}
        requestWithAuth(`${serverUrl}${serverPaths.getUserProfile}`,{},authData)
            .then(res=>{
                if(res.isError && res.badToken){
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
            <Container className="m-auto" style={{textAlign:"center"}}>
                <Row>
                    <Col className="m-auto">
                        {userName}
                    </Col>
                </Row>
                <Row>
                    <Col className="m-auto">
                        {fullName}
                    </Col>
                </Row>
                <Row>
                    <Col className="m-auto">
                        {email}
                    </Col>
                </Row>
                <Row>
                    <Col className="m-auto d-grid gap-2">
                        <Button
                         variant={changePassword?"info":"warning"}
                         size="lg"
                         onClick={$toggleSetter(setChangePassword)}>
                            {changePassword?"Close change password window.":"Change password"}
                        </Button>
                    </Col>
                </Row>
                <Collapse in={changePassword}>
                    {changePasswordElement}
                </Collapse>
                
            </Container>
        </>
    )
}