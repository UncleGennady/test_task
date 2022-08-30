class Controller {
    #model = null;
    #view = null;

    constructor(Model, View) {
        this.model = Model;
        this.view = View;

    }
    init(){

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