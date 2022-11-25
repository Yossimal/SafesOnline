import { $updateInput } from "../../../common/wrappers"
import { Form,InputGroup } from "react-bootstrap"


export default function Input({type,setter,placeholder}){
    return (
        <InputGroup>
            <Form.Control type={type} placeholder={placeholder} onChange={$updateInput(setter)} />
        </InputGroup>   
    )
}