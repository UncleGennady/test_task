import {
    dbUrl,
} from './config.js';

class Controller {
    #model = null;
    #view = null;

    user = {
        id: 3,
        name: 'Vovchik',
        age: 'so old',
    };

    constructor(Model, View) {
        this.model = Model;
        this.view = View;

    }
    init(){
        this.#model.sendRequest('GET', dbUrl,)
            .then(r => console.log(r))
        this.#model.sendRequest('POST',dbUrl, this.user );
    }
   set model(modelClass){
        if(!modelClass) throw new Error('model is invalid')
        this.#model = new modelClass()
    }

    set view(modelClass){
        if(!modelClass) throw new Error('view is invalid')
        this.#view = new modelClass()
    }
}

export default Controller;