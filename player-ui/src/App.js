import './App.css';
import { useContext } from 'react';
import { AuthContext } from './context/auth-context/auth-context';
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Login from './components/Pages/login/Login';
import Home from './components/Pages/home/Home';
import Register from './components/Pages/register/Register';
import EmailConfirm from './components/Pages/emailConfirm/EmailConfirm';
import PrivateSection from './components/controls/PrivateSection/PrivateSection';
import TopNavbar from './components/controls/topNavbar/TopNavbar';
import Profile from './components/Pages/profile/Profile';


function App() {

    const authContext = useContext(AuthContext)
    const browserRouter = (

        <BrowserRouter>
        <Routes>
          <Route index element={<Login/>}/>
          <Route path="home" element={<PrivateSection><Home/></PrivateSection>}/>
          <Route path="register" element={<Register/>}/>
          <Route path="confirm/:token" element={<EmailConfirm />}/>
          <Route path="profile" element={<PrivateSection><Profile/></PrivateSection>}/>
        </Routes>
        </BrowserRouter>
      )


  
    return (
        <>
        {authContext.isLoggedIn&&<TopNavbar />}
        {browserRouter}
        </>
    );
}

export default App;
