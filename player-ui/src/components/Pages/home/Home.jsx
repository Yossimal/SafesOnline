import { useEffect,useContext } from "react"
import { requestPost } from "../../../common/request"
import { AuthContext } from "../../../context/auth-context/auth-context"
import TopNavbar from "../../controls/topNavbar/TopNavbar"
import { useSearchParams } from "react-router-dom"
import { useState } from "react"
import { Alert } from "react-bootstrap"


export default function Home(){

    const [searchParams,setSearchParams] = useSearchParams()
    const [msg,setMsg] = useState('')
    useEffect(()=>{
        setMsg(searchParams.get('msg'))
    },[searchParams])

    return (<>
        <h1>Hello User</h1>
        {msg&&msg!=""&&<Alert key="success" variant="success">{msg}</Alert>}
    </>
    )
}