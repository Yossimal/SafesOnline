import { ListGroupItem} from "react-bootstrap";
import { useNavigate } from "react-router";

export default function GameItem({gameData}){
    //const link = `/competitions/${gameData.id}`
    const navigate = useNavigate();
    console.log(gameData);

    function handleNavigate(){
        navigate(`./${gameData.id}`,{relative:true})
    }

    return (<ListGroupItem onClick={handleNavigate} className="d-flex justify-content-between align-items-start">
        <div className="ms-2 me-auto">
          <div className="fw-bold">{gameData.name}</div>
          <p>{gameData.description}</p>
        </div>
    </ListGroupItem>)
}