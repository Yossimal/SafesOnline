import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useContext } from 'react';
import { AuthContext } from '../../../context/auth-context/auth-context';
import { redirect, useNavigate } from 'react-router';
import {clientUrl, serverPaths, serverUrl} from '../../../common/config.js'
import { requestPost } from '../../../common/request';


function TopNavbar() {
    const authContext = useContext(AuthContext)


    function logOut(){
      console.log('lo')
      requestPost(`${serverUrl}${serverPaths.logout}`,authContext.authData())
        .then(res=>{
          console.log("logging out")
          if(!res.ok){
            window.alert("There was an error logging you out. Try to refresh the page.")
          }else{
            window.location.replace(clientUrl)
            authContext.setIsLoggedIn(false)
          }
        })

      
    }


  return (<>
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/home" className="onDark">Safe Competiotion</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="profile">profile</Nav.Link>
            <Nav.Link href="#HOME">My Games</Nav.Link>
            <Nav.Link href="#link">Add Game</Nav.Link>
            <Nav.Link href="#createGame">Create Game</Nav.Link>
            </Nav>
            <Nav>
                <Nav.Link onClick={logOut}>Log out</Nav.Link>
            </Nav>
        </Navbar.Collapse>
        
      </Container>
    </Navbar>
   </>
  );
}

export default TopNavbar;