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
    #filterEl = getElement('#category_search')
    #filterDateEl = getElement('#date_search')



    constructor(Model, View) {
        this.model = Model;
        this.view = View;

    }
    async init(){

        this.#loadEvent();
        this.#handleWastedAddBtn();
        this.#addEventListContainer();
        this.#addFilterHandler();
        this.#exitHandler();

    };

    #handleWastedAddBtn() {
        getElement(addWastedSelector).addEventListener('click',this.#wastedAddBtnHandler)
    }
    async #loadEvent(){
        const data = JSON.parse(this.#model.getData(keyCurrentUser,sessionStorage))
        const userName = !!data ? data.login : '';
        this.#downloadList();

        this.#view.renderNameUser(userName);
        if(!!(this.#model.getData(keyCurrentUser,sessionStorage))) return;

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

            await this.#view.renderWastedList(this.#model.listData);
        }
    }
// выход из аккаунта
    #exitHandler(){
        getElement(exit).addEventListener('click',(e)=>{

            sessionStorage.removeItem(keyCurrentUser);
            this.#view.clearContainer(wastedElements, "");
            window.location.reload()

        })
    }

    #wastedAddBtnHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // при добавлении новых елементов сбрасываеться фильтр и перерендериваеться список
        if(this.#filterEl.value !== '' || this.#filterDateEl.value !== ''){
            getElement(wastedElements).innerText = "";
            this.#view.renderWastedList(this.#model.listData);
        }
        this.#filterEl.value = ''
        this.#filterDateEl.value = ''
        const {target} = e ;
        console.dir(target);
        const addWastedForm = this.#view.createAddWastedForm();
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

        const { target } = e
        const inputs = target.querySelectorAll('input');
        const data = Array.from(inputs).reduce((acc,input )=>{
            acc[input.name] = input.value;
            return acc;
        }, {});
        this.#view.closeModal();

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
        //загружает списоп конкретного юзера
        this.#downloadList();

    }

    #addWastedFormHandler = async e => {
        e.preventDefault();
        e.stopPropagation();

        const { target } = e
        const inputs = target.querySelectorAll('input');
        const data = Array.from(inputs).reduce((acc,input )=>{
            acc[input.name] = input.value;
            return acc;
        }, {});
        this.#view.closeModal();

        setTimeout(() => {
            this.#view.modalHeader = '';
            this.#view.clearModalBody()},150);

        target.removeEventListener('submit', this.#addWastedFormHandler);
        this.#model.listData = await this.#model.sendRequest("GET", `${dbUrl}/${this.#model.userId}`).then(r => r.list)
        // Берем id последнего елемента списка в базе либо 1
        data.id = await this.#model.listData[this.#model.listData.length-1] ? (this.#model.listData[this.#model.listData.length-1].id)+1 : 1;

        this.#view.renderWasted(data);

        this.#model.listData.push(data);
        // добавляем в БД трату конкретного ЮЗЕРА
        if(!!this.#model.userId) {
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

        // проверяем елемент который очищает весь список юзера
        if(e.target.classList.contains(deleteFullList)){this.#view.clearContainer(wastedElements, null);
            this.#model.sendRequest("PATCH", `${dbUrl}/${this.#model.userId}`, {
                "list": []
            })
        }
        // проверяем елемент который очищает конкретную запись юзера
        if(e.target.classList.contains(deleteItemList)){
            let elForDelete = (e.path.find(i => i.hasAttribute('data-id') ))
            const idForDelete = +elForDelete.getAttribute('data-id')
            //удаляет из БД трату
            this.#model.listData = this.#model.listData.filter(i  => i.id !== idForDelete);
            this.#model.sendRequest("PATCH", `${dbUrl}/${this.#model.userId}`, {
                "list": this.#model.listData
            })

            this.#view.clearContainer(wastedElements, null)
            this.#view.renderWastedList(this.#model.listData);

        }
    }
// навешиваем событие на фильтры
    #addFilterHandler(){
        let data = null;
        const listContainer = getElement(wastedElements);
        const containerFilter = getElement(".container-filter")
        // берем данные при клике на input
       containerFilter.addEventListener('click',(e)=>{
            e.preventDefault()
            e.stopPropagation()
           const {target} = e
            console.dir(target.id);
            if(!(target.id === 'category_search' || target.id === 'date_search')) return;

           data = this.#model.sendRequest("GET",`${dbUrl}/${this.#model.userId}`).then(r => r.list)
           if(target.id === 'category_search'){

               this.#filterEl.addEventListener('keyup',event => this.#filterSearchHandler(data, listContainer, this.#filterEl))
           }else if(target.id === 'date_search'){

               this.#filterDateEl.addEventListener('keyup',event => this.#filterSearchHandler(data, listContainer,this.#filterDateEl))
           }
        } )
    }
// фильтрует лист трат по категориям, дате, категориям-дате
    #filterSearchHandler = async(data,container, filterElements) => {
        if(!data) return;

        const arrFilterValue = filterElements.value.split('');

        const lengthSearchWord = arrFilterValue.length;
        let secondaryFilter = null;
        //устанавливаем вторичный фильтр
        if(filterElements.id === 'category_search') secondaryFilter = this.#filterDateEl
        if(filterElements.id === 'date_search') secondaryFilter = this.#filterEl

        const saveData = data;

        let filteredData = data.then(r => r.reduce((acc, item)=>  {
            //  устанавливает фильтрацию елементов по категориям или по дате
            const name = filterElements.id === 'category_search' ? item.category.split('',lengthSearchWord) : item.wastedDate.split('',lengthSearchWord);

            if(name.length < lengthSearchWord) return acc;
            // если слово в инпуте меняеться при наборе, обновляет список
            const check  = () =>{
                for (let i = 0; i <= lengthSearchWord - 1 ; i ++) {
                    if(name[i] !== arrFilterValue[i] ) return false;
                }
                return true;
            }

            if(check()) acc.push(item);

            return acc;
        }, []))

        //если второстипенный фильтр не пустой происходит повторная фильтрация отфильтрованного списка по нему
        if(secondaryFilter !== ''.trim()){
            filteredData = filteredData.then(r => r.filter(item => (secondaryFilter.id === "date_search"? item.wastedDate : item.category).includes(secondaryFilter.value)))
        }

        // отображаем отфильтрованые контакты
        this.#view.renderFilterWasted(filteredData, container);
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