import { useEffect } from "react";
import { useContext } from "react";
import { requestWithAuth } from "../../../common/request";
import { serverUrl,serverPaths } from "../../../common/config";

export default function Profile(){
    
    const authContext = useContext();
    useEffect(()=>{
        requestWithAuth(`${serverUrl}${serverPaths.}`)
    },[])

    return (
        <>

        </>
    )
}