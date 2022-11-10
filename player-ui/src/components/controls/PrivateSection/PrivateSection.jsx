import { useEffect,useContext, useState } from "react";
import { Route } from "react-router";
import { AuthContext } from "../../../context/auth-context/auth-context";
import { useNavigate } from "react-router";
import { requestPost, requestWithAuth } from "../../../common/request";
import {serverPaths, serverUrl} from "../../../common/config.js"

export default function PrivateSection(props){
    const navigate = useNavigate()
    const [isSafe,setIsSafe] = useState(false)
    const authContext = useContext(AuthContext);
    useEffect(()=>{
        console.log(authContext)
        if(!authContext.isLoggedIn){
            navigate('/?msg=You cant enter that place!\n You must login before!',{replace:true})
        }else{
            const requestBody = {
                token:authContext.token,
                userId:authContext.userId
            }
            requestWithAuth(`${serverUrl}${serverPaths.checkToken}`,{},requestBody)
                .then(res=>{
                    console.log(res)
                    if(!res.isRegistered){
                        authContext.setIsLoggedIn(false)
                        navigate('/?msg=You ware not active for long time.\n Try to login again.')
                    }else{
                        setIsSafe(true)
                    }
                });
        }
    },[])

    return <>{isSafe&&props.children}</>
}
