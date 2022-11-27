import { $updateInput } from "../../../common/wrappers"
import { Form,InputGroup } from "react-bootstrap"


export default function Input({type,setter,placeholder,value}){
    return (
        <InputGroup>
            <Form.Control type={type} placeholder={placeholder} value={value} onChange={$updateInput(setter)} />
        </InputGroup>   
    )
}