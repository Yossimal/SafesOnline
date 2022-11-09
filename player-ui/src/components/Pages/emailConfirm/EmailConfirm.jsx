import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { requestPost } from "../../../common/request";
import { serverUrl,serverPaths } from "../../../common/config";
import { useContext } from "react";
import { AuthContext } from "../../../context/auth-context/auth-context";

export default function EmailConfirm(){
    const routeParams = useParams()
    const authContext = useContext(AuthContext)
    const navigate = useNavigate();
    useEffect(()=>{
        requestPost(`${serverUrl}${serverPaths.confirm}`,{link:routeParams.token})
            .then(res=>{
                console.log(res)
                if(res!=null){
                    authContext.setToken(res.token);
                    authContext.setIsLoggedIn(res.IsLoggedIn)
                    authContext.setUserId(res.userId);
                    navigate(`../../?msg=${res.msg}`,{replace:true})
                }else{
                navigate('?../../msg=There is an error with the server try again later',{replace:true})
                }
            });
    },[])
}