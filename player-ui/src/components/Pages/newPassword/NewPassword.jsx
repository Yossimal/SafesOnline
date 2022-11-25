import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { serverPaths, serverUrl } from "../../../common/config";
import { requestPost } from "../../../common/request";


export default function NewPassword(){
    const navigate = useNavigate();
    const routeParams = useParams();
    useEffect(()=>{
        if(routeParams.token==null){
            navigate('/?msg=Please dont try to enter places that you not need to :)',{replace:true});
            return;
        }else{
            requestPost(`${serverUrl}${serverPaths.restorePassword}`,{token:routeParams.token})
            .then(res=>{
                if(res.isError){
                    navigate(`/?msg=${res.error}`,{replace:true})
                    return;
                }else{
                    navigate("/?msg=We've sent new password to your email.");
                }
            })
        }
    },[]);
}