import { VirtualScroller } from 'primereact/virtualscroller';
import Button from "primereact/primereact.all.esm";



function SafesSelector(props) {
    const items = [...Array(100).keys()]
    console.log(items)
    const itemTemplate = (item,options)=>{
        return <p>{item}</p>
    }
    return (<>
        <VirtualScroller items={items} itemSize={50} showLoader  itemTemplate={itemTemplate}/>
        <Button label={"label"}/>
    </>)
}

export default SafesSelector;