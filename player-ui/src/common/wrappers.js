
export function $updateInput(setter){
    return e=>setter(e.target.value);
}

export function $toggleSetter(setter){
    return ()=>setter(v=>!v)
}