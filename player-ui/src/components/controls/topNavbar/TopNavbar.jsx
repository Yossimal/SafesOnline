import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useContext } from 'react';
import { AuthContext } from '../../../context/auth-context/auth-context';


function TopNavbar() {
    const authContext = useContext(AuthContext)
    function logOut(){
        authContext.setIsLoggedIn(false)

    }


  return (<>
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/home" className="onDark">Safe Competiotion</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="profile">profile</Nav.Link>
            <Nav.Link href="#home">My Games</Nav.Link>
            <Nav.Link href="#link">Add Game</Nav.Link>
            <Nav.Link href="#createGame">Create Game</Nav.Link>
            </Nav>
            <Nav>
                <Nav.Link onClick={logOut} href="#">Log out</Nav.Link>
            </Nav>
        </Navbar.Collapse>
        
      </Container>
    </Navbar>
   </>
  );
}

export default TopNavbar;