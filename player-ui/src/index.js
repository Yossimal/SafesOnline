import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppContextProvider from './context/auth-context/auth-context.js'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Login from './components/Pages/login/Login';
import Home from './components/Pages/home/Home';
import Register from './components/Pages/register/Register';
import EmailConfirm from './components/Pages/emailConfirm/EmailConfirm';
import PrivateSection from './components/controls/PrivateSection/PrivateSection';


const browserRouter = (
  <BrowserRouter>
  <Routes>
    <Route index element={<Login/>}/>
    <Route path="home" element={<PrivateSection><Home/></PrivateSection>}/>
    <Route path="register" element={<Register/>}/>
    <Route path="confirm/:token" element={<EmailConfirm />}/>
  </Routes>
  </BrowserRouter>
)



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <AppContextProvider>
      {browserRouter}
    </AppContextProvider>
  // </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
