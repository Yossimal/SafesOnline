import { useEffect,useState,useContext } from "react"
import { useSearchParams } from "react-router-dom"
import { Alert,Card,Container,Col,Row } from "react-bootstrap"




export default function Home(){

    const [searchParams,setSearchParams] = useSearchParams()
    const [msg,setMsg] = useState('')
    useEffect(()=>{
        setMsg(searchParams.get('msg'))
    },[searchParams])

    return (<>
    <Container>
        <Row>
            <Col xs={2}/>
            <Col className="mb-2">
                <Card>
                    <Card.Header>Welcome!</Card.Header>
                    <Card.Body>
                        <Card.Title>Welcome to the safe cracking competition!</Card.Title>
                        <Card.Text>
                            <p>The game is based on CodeGuru game and modified for Architecture curse in magshimim. You can always try <a href="https://codeguru.co.il/Xtreme/">CodeGuru Xtreme</a></p>
                        </Card.Text>
                    </Card.Body>
                </Card> 
            </Col>
            <Col xs={2}/>
        </Row>
    </Container>      
        {msg&&msg!=""&&<Alert key="success" variant="success">{msg}</Alert>}
    </>
    )
}