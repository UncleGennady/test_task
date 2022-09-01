import {
    dbUrl,
    addWastedSelector,
    addWastedModalTitle,
    loginModalTitle,
    keyCurrentUser,
    exit,
    wastedElements,
    deleteFullList,
    listSelectorContainer,
    deleteItemList,
} from './config.js';

import {
    getElement,
} from './utilities.js';

class Controller {
    #model = null;
    #view = null;
    // #idUser = null;

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
        this.#addEventListContainer();
        this.#exitHandler();

    };

    #handleWastedAddBtn() {
        getElement(addWastedSelector).addEventListener('click',this.#wastedAddBtnHandler)
    }
    async #loadEvent(){
        console.log(this.#model.getData(keyCurrentUser,sessionStorage))
        const data = JSON.parse(this.#model.getData(keyCurrentUser,sessionStorage))
        // this.#idUser = !!data ? data.id : null
        const userName = !!data ? data.login : '';
        this.#downloadList();
        console.log(userName)
        this.#view.renderNameUser(userName);
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
    #downloadList = async () =>{
        if(!!this.#model.userId){
            this.#model.listData = await this.#model.sendRequest("GET", `${dbUrl}/${this.#model.userId}`).then(r => r.list)
            console.log(this.#model.listData, "impot")
            await this.#view.renderWastedList(this.#model.listData);
        }
    }

    #exitHandler(){
       getElement(exit).addEventListener('click',(e)=>{
            console.log(1234);
            sessionStorage.removeItem(keyCurrentUser);
            this.#view.clearContainer(wastedElements, "");
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
        this.#model.currentUser = savedData.login;
        const response = this.#model.setData(keyCurrentUser, savedData, sessionStorage);
        if(! (await response)) {
            alert('Такой юзер уже есть. Повторите попытку входа')
            window.location.reload()
        }
        this.#view.renderNameUser(savedData.login);
        this.#downloadList();

    }

    #addWastedFormHandler = async e => {
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
        this.#model.listData = await this.#model.sendRequest("GET", `${dbUrl}/${this.#model.userId}`).then(r => r.list)
        data.id = await this.#model.listData[this.#model.listData.length-1] ? (this.#model.listData[this.#model.listData.length-1].id)+1 : 1;
        console.log(data.id);
        this.#view.renderWasted(data);

        this.#model.listData.push(data);
        if(!!this.#model.userId) {
            console.log('maybe happy');
            console.log( this.#model.listData, "IMPOT")
            await this.#model.sendRequest("PATCH", `${dbUrl}/${this.#model.userId}`, {
                "list": await this.#model.listData
            })
        }
    }
    #addEventListContainer = () =>{
        getElement(listSelectorContainer).addEventListener('click',this.#addEventListContainerHandler)


    }
    #addEventListContainerHandler = (e) =>{
        e.preventDefault()
        e.stopPropagation()
        console.log(e.target);
        // e.path.forEach(i => console.log(i.classList))

        if(e.target.classList.contains(deleteFullList)){this.#view.clearContainer(wastedElements, null);
        this.#model.sendRequest("PATCH", `${dbUrl}/${this.#model.userId}`, {
            "list": []
            })
        }

        if(e.target.classList.contains(deleteItemList)){
            let elForDelete = (e.path.find(i => i.hasAttribute('data-id') ))
            const idForDelete = +elForDelete.getAttribute('data-id')
            console.log(idForDelete);
            console.log(this.#model.listData);
            this.#model.listData = this.#model.listData.filter(i  => i.id !== idForDelete);
            this.#model.sendRequest("PATCH", `${dbUrl}/${this.#model.userId}`, {
                "list": this.#model.listData
            })
            console.log(this.#model.listData)
            this.#view.clearContainer(wastedElements, null)
            this.#view.renderWastedList(this.#model.listData);

        }
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