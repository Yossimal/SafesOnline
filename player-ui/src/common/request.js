function generateOptions(body){
    let headers = { 'Content-Type': 'application/json' }
    return {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({...body})
    }; 
}


export function requestPost(url,body,moreHeaders=null){
    const requestOptions = generateOptions(body);
    if(moreHeaders !== null){
        requestOptions.headers = {...requestOptions.headers,...moreHeaders};
    }
    
    return fetch(url, requestOptions)
        .then(response => response.json())
        
}

export function requestWithAuth(url,body,authData){
    const requestOptions = generateOptions({...body,...authData})
    // console.log(requestOptions)
    return fetch(url,requestOptions)
        .then(response =>  response.json())
}