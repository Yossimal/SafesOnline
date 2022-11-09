import { useEffect,useContext } from "react"
import { requestPost } from "../../../common/request"
import { AuthContext } from "../../../context/auth-context/auth-context"
import TopNavbar from "../../controls/topNavbar/TopNavbar"


export default function Home(){

    return (<>

        <h1>Hello User</h1>
    </>
    )
}