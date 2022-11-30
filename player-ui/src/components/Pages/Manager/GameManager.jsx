import {Container,Row,Col} from 'react-bootstrap'
import PlayersList from './PlayersList'

export default function GameManager(){
    
    function onKeySelected(id){

    }

    function onSafeDownloaded(id){

    }
    
    return <Container>
        <Row>
            <Col xs={6}>
                <PlayersList/>
            </Col>
            <Col xs={6}>

            </Col>
        </Row>

    </Container>
}