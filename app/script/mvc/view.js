import {
    wastedAreEmptyText,
    wastedElements,
    spanUserName,
} from './config.js';

import {
    getElement
} from "./utilities.js";

class View{
    #modal = null;
    #modalHeader = null;
    #modalBody = null;
    constructor() {
        const modalWindow = this.#createModal();
        this.#modal = new bootstrap.Modal(modalWindow, {
            backdrop:'static'
        })
    };
    openModal(){
        this.#modal.show();
    };
    closeModal(){
        this.#modal.hide();

    };

    #createModal(){
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.id = 'modal'
        modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                        
                        </div>
                        <div class="modal-body">
                           
                        </div>
                    </div>
                </div>`

        this.#modalHeader = modal.querySelector('.modal-header');
        this.#modalBody = modal.querySelector('.modal-body');
        document.body.append(modal)
        return modal;
    };
    createLoginForm(){
        const form = document.createElement('form');
        form.innerHTML = `
                <div class="mb-3">
                  <label for="login" class="form-label">Логин</label>
                  <input name="login" required type="text" class="form-control" id="login" placeholder="User123">
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">Пароль</label>
                  <input name="password" required type="password" class="form-control" id="password" placeholder="пароль">
                </div>
                <div>
                    <button class="btn btn-success" type="submit">Войти</button>
                </div>`;
        return form;

    }
    createAddWastedForm(){
        const form = document.createElement('form');
        form.innerHTML = `
                <div class="mb-3">
                  <label for="wasted-date" class="form-label">Дата траты</label>
                  <input name="wastedDate" required type="text" class="form-control" id="wasted-date" placeholder="11.11.2011">
                </div>
                <div class="mb-3">
                  <label for="category" class="form-label">Категория</label>
                  <input name="category" required type="text" class="form-control" id="category" placeholder="еда">
                </div>
                 <div class="mb-3">
                  <label for="price" class="form-label">Потрачено средств</label>
                  <input type="number" name="price" class="form-control" id="price" placeholder="250">
                </div>
                <div>
                    <button class="btn btn-success" type="submit">Добавить трату</button>
                    <button class="btn btn-danger" type="reset">Отмена</button>
                </div>`;
        return form;
    }
    clearModalBody(){
        this.#modalBody.innerHTML = '';
    }


    #createWasted(data){
        console.log(data);
        if(!data) return document.createElement('div').innerText = wastedAreEmptyText;

        const wasted = document.createElement('div');
        wasted.classList.add('position__item')
        wasted.setAttribute('data-id', data.id);
        wasted.innerHTML = `
                        <div class="date">Дата: ${data.wastedDate}</div>
                        <div class="category">Категория: ${data.category}</div>
                        <div class="price">Потраченно: ${data.price}грн</div>
                        <button class="btn-item-delete btn btn-danger btn-sm">
                            <i class="bi bi-x-circle"></i>
                        </button>
        `
        return wasted
    }
    renderNameUser(data){
        const container = getElement(spanUserName);
        if(container.innerText === 'undefined') container.innerText = '';
        container.append(data)
    }

    renderWasted(dataToRender){
        const wastedContainer = getElement(wastedElements);
        if(wastedContainer.innerText === wastedAreEmptyText) wastedContainer.innerText = '';
        wastedContainer.prepend(this.#createWasted(dataToRender));
    }

    set modalHeader (value){
        if(typeof value !== 'string') throw new Error('modalHeader must been str');
        this.#modalHeader.innerHTML = value;
    }
    set modalBody (value){
        if(!(value instanceof HTMLFormElement)) throw new Error('modalBody must been str');
        this.#modalHeader.append(value);
    }

}

export default View