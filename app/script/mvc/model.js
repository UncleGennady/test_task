import {
    dbUrl,
} from './config.js';

class Model {
    #userIs = false

    constructor() {

    }
    #setID = function* (id){
        let index = id;
        while(true)
            yield index++;
    };

    sendRequest = async function (method, url, body = null) {
        if(method ==="POST" && await this.#checkUser(body)) return;
        const headers = {'Content-Type': 'application/json'};
        let response = await fetch(url,{
            method,
            body: body ? JSON.stringify(body): null,
            headers
        });
        if (method === 'GET' && !response.ok) throw new Error('data not valid');
        response = await response.json();
        return response;
    };

    #checkUser = async (body) => {
        const idUser = body.id

        this.#userIs = await this.sendRequest('GET', dbUrl,)
            .then(r => r.some(i => i.id === idUser))
        console.log(this.#userIs);
        return this.#userIs;
    };

}


export default Model;