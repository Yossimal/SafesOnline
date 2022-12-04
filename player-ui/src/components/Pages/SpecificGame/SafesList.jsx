import { ListGroupItem,Button, ListGroup,ButtonGroup } from "react-bootstrap";
import {useState,useEffect} from 'react'

function SafesListItem({safeName,onDownload,onSelect}){
    return <ListGroupItem className="d-flex justify-content-between align-items-start">
        <div className="ms-2 me-auto">
          <div className="fw-bold">{safeName}</div>
          <ButtonGroup>
            <Button size="sm" variant="success" onClick={onDownload}>Download</Button>
            <Button size="sm" variant="info" onClick={onSelect}>Try to crack</Button>
          </ButtonGroup>
        </div>
    </ListGroupItem>
}

export default function SafeList({safes,onDownload,onSelect}){

    const [items,setItems] = useState([]);

    function generateDownloader(safeId,name){
        return ()=>onDownload(safeId,name)
    }
    function generateSelector(safeId){
        return ()=>onSelect(safeId)
    }

    useEffect(()=>{
        setItems(safes.map(safe=><SafesListItem key={safe.id} onSelect={generateSelector(safe.id)} onDownload={generateDownloader(safe.id,safe.name)} safeName={safe.name} />))
    },[safes])

    return(<>
        <h1 style={{textAlign:"center"}}>Other Safes</h1>
        <ListGroup>
            {items}
        </ListGroup>
        </>
    )
}