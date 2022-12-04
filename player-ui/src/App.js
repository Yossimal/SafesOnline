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
import NewPassword from './components/Pages/newPassword/NewPassword';
import CreateGame from './components/Pages/createGame/CreateGame';
import MyGames from './components/Pages/myGames/MyGames';
import SpecificGame from './components/Pages/SpecificGame/SpecificGame';
import AddGame from './components/Pages/addGame/AddGame';
import GameManager from './components/Pages/Manager/GameManager'


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
          <Route path="restore-password/:token" element={<NewPassword/>}/>
          <Route path="create-competiotion" element={<PrivateSection><CreateGame/></PrivateSection>}/>
          <Route path="competiotions" element={<PrivateSection><MyGames/></PrivateSection>}/>
          <Route path="competiotions/:comp_id" element={<PrivateSection><SpecificGame/></PrivateSection>}/>
          <Route path="join-competition" element={<PrivateSection><AddGame /></PrivateSection>} />
          <Route path="competiotions/:comp_id/sudo-su" element={<PrivateSection><GameManager/></PrivateSection>}/>
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
