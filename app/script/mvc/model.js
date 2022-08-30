class Model {

    constructor() {

    }
    #setID = function* (id){
        let index = id;
        while(true)
            yield index++;
    };
}


export default Model;