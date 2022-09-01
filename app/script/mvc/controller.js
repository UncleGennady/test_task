import {
    dbUrl,
    addWastedSelector,
    addWastedModalTitle,
    loginModalTitle,
    keyCurrentUser,
    exit,
} from './config.js';

import {
    getElement,
} from './utilities.js';

class Controller {
    #model = null;
    #view = null;

    // user = {
    //     id: 3,
    //     name: 'Vovchik',
    //     age: 'so old',
    // };

    constructor(Model, View) {
        this.model = Model;
        this.view = View;

    }
   async init(){
        this.#model.sendRequest('GET', dbUrl,)
            .then(r => console.log(r))

        // let z = await this.#model.getLastIDFromDb()
        // console.log(z);
        // this.#model.sendRequest('POST',dbUrl, this.user );
       // await this.#model.authorizationСheck();
        this.#loadEvent();
        this.#handleWastedAddBtn();
        this.exitHandler();
    };

    #handleWastedAddBtn() {
        getElement(addWastedSelector).addEventListener('click',this.#wastedAddBtnHandler)
    }
    #loadEvent(){
        console.log(this.#model.getData(keyCurrentUser,sessionStorage))

        this.#view.renderNameUser((this.#model.getData(keyCurrentUser,sessionStorage) || ''));
        if(!!(this.#model.getData(keyCurrentUser,sessionStorage))) return;
        console.log(321);
        document.addEventListener('DOMContentLoaded',this.#loginHandler)

    }
    #loginHandler = () => {
        const loginForm = this.#view.createLoginForm();
        loginForm.addEventListener('submit', this.#loginFormHandler);

        this.#view.modalHeader = loginModalTitle;
        this.#view.modalBody = loginForm;
        this.#view.openModal();

    }

    exitHandler(){
        document.querySelector(exit).addEventListener('click',(e)=>{
            console.log(1234);
            sessionStorage.removeItem(keyCurrentUser);
            window.location.reload()

        })
    }

    #wastedAddBtnHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // при добавлении новых елементов сбрасываеться фильтр
        // this.#resetFilterSearch();
        const {target} = e ;
        console.dir(target);
        const addWastedForm = this.#view.createAddWastedForm();
        // const addWastedForm = this.#view.createLoginForm();
        addWastedForm.addEventListener('reset',this.#resetWastedFormHandler);
        addWastedForm.addEventListener('submit', this.#addWastedFormHandler);

        this.#view.modalHeader = addWastedModalTitle;
        this.#view.modalBody = addWastedForm


        this.#view.openModal();

    };
    #resetWastedFormHandler = e=> {
        e.preventDefault()
        e.stopPropagation()
        const { target } = e
        this.#view.closeModal();
        target.removeEventListener('reset', this.#addWastedFormHandler);
    };
    #loginFormHandler = async e => {
        e.preventDefault();
        e.stopPropagation();
        console.log(e)
        const { target } = e
        const inputs = target.querySelectorAll('input');
        const data = Array.from(inputs).reduce((acc,input )=>{
            acc[input.name] = input.value;
            return acc;
        }, {});
        this.#view.closeModal();
        console.log(data);
        const savedData = data;

        setTimeout(() => {
            this.#view.modalHeader = '';
            this.#view.clearModalBody()},150);

        target.removeEventListener('submit', this.#loginFormHandler);
        this.#model.currentUser = data.login;
        const response = this.#model.setData(keyCurrentUser, data, sessionStorage);
        if(! (await response)) {
            alert('Такой юзер уже есть. Повторите попытку входа')
            window.location.reload()
        }
        this.#view.renderNameUser(this.#model.getData(keyCurrentUser, sessionStorage));

    }

    #addWastedFormHandler = e => {
        e.preventDefault();
        e.stopPropagation();
        console.log(e)
        const { target } = e
        const inputs = target.querySelectorAll('input');
        const data = Array.from(inputs).reduce((acc,input )=>{
            acc[input.name] = input.value;
            return acc;
        }, {});
        this.#view.closeModal();
        console.log(data);
        setTimeout(() => {
            this.#view.modalHeader = '';
            this.#view.clearModalBody()},150);

        target.removeEventListener('submit', this.#addWastedFormHandler);

        this.#view.renderWasted(data);
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