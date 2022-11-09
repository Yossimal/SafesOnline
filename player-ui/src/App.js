import './App.css';
import { useRef } from 'react';
import {sha256} from 'js-sha256'




function App() {

    const password = useRef();
    const userName = useRef();
    function sendForm(){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName:"yossi",fullName:"Yosef Malka",password:sha256("qq11qq11"),email:"yosef.malka@gmail.com" })
        };
        fetch('http://localhost:8080/register', requestOptions)
            .then(response => response.json())
            .then(data => {console.log(data)});
    }

  
    return (
        <>

        </>
    );
}

export default App;
