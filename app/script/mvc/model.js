import {
    dbUrl,
    keyCurrentUser,
} from './config.js';

class Model {
    #userIs = false
    #currentUser = null;
    constructor(user) {
        this.#currentUser = user
    }
    // #setID = function* (id){
    //     let index = id;
    //     while(true)
    //         yield index++;
    // };

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

    async getLastIDFromDb(){
       let id = await this.sendRequest('GET', dbUrl)

           id = !!id.length ? await id[id.length-1].id : 0;
            console.log(id)
        return id;

    }

    async setData(key, value, storage){
        const saveData = structuredClone(value);
        const response = await this.#authorizationСheck(saveData)
        console.log(response)
        if(!!response.userAuthentication){
            await storage.setItem(key, saveData.login);
            return true
        };

        if(response.ok && !response.userAuthentication) return false;
        let id = await this.getLastIDFromDb() + 1;
        console.log(id);
        saveData.id = await id;
        await this.sendRequest("POST", dbUrl, saveData);
        await storage.setItem(key, saveData.login);
        return true;
    };
    getData(key,storage){
        return storage.getItem(key);
    };

    #authorizationСheck = async (data) => {
        const dbData = await this.sendRequest('GET', dbUrl)
        console.log(123);
        const response ={}
        if(await dbData.some(i => i.login === data.login && i.password !== data.password)){
            response.userAuthentication = false;
            response.ok = true;
            return response
        };
        const item = await dbData.find(i => i.login === data.login && i.password === data.password)
        if(!!item){
            response.item = item;
            response.userAuthentication = true;
            response.ok = true;
            return response
        };
        response.userAuthentication = false;
        response.ok = false;
        return response
    };

    set currentUser (value){
        if(typeof value !== 'string') throw new Error('Login must been str');
        this.#currentUser = value;
    }
    get currentUser(){
        console.log(this.#currentUser);
        return this.#currentUser;
    }

}


export default Model;