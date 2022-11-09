import { createContext, useEffect, useState } from "react";



export class AuthContextData{
    
    isLoggedIn=false;
    userId="";
    token="";
    setUserId=null;
    setIsLoggedIn=null;
    setToken=null;
    staticisLoaded = false;


    constructor(userId,token,isLoggedIn){
        this.userId = userId[0];
        this.isLoggedIn = isLoggedIn[0];
        this.token = token[0];
        this.setIsLoggedIn = (val)=>{
            localStorage.setItem('isLoggedIn',val)
            isLoggedIn[1](val)
        }
        this.setUserId = (val)=>{
            localStorage.setItem('userId',val)
            userId[1](val)
        }
        this.setToken = val=>{
            
            localStorage.setItem("authToken",val)
            token[1](val)
        }
    }
    

}

export const AuthContext = createContext(null);

const AuthContextProvider = ({children})=>{
    const isLoggedIn = useState(localStorage.getItem("isLoggedIn"));
    const userId = useState(localStorage.getItem("userId"));
    const token =  useState(localStorage.getItem("authToken"));
    return <AuthContext.Provider value={new AuthContextData(userId,token,isLoggedIn)}>{children}</AuthContext.Provider>
};

export default AuthContextProvider;
