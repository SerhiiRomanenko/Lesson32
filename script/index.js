'use strict';

const PRIORITY_1 = 1;

class TodoModel {
    loginField = document.querySelector('.login');
    passwordField = document.querySelector('.password');

    baseUrl = 'https://todo.hillel.it';
    token = null;
    repository;

    async auth() {
        const popupBg = document.querySelector('.popup__bg'); // Фон попап окна
        const popup = document.querySelector('.popup'); // Само окно

        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ value: this.loginField.value + this.passwordField.value }),
        });

        const result = await response.json();
        this.token = result.access_token;

        if (this.token !== null) {
            popupBg.classList.remove('active'); // Убираем активный класс с фона
            popup.classList.remove('active'); // И с окна
            this.getAllNotes();
        }
    }

    async addNote(value, priority = PRIORITY_1) {
        const headers = new Headers();

        headers.set('Content-Type', 'application/json;charset=utf-8');
        headers.set('Authorization', `Bearer ${this.token}`);

        const response = await fetch(`${this.baseUrl}/todo`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ value, priority }),
        });

        await response.json();
        this.getAllNotes();
    }

    async getAllNotes() {
        const headers = new Headers();

        headers.set('Content-Type', 'application/json;charset=utf-8');
        headers.set('Authorization', `Bearer ${this.token}`);

        const response = await fetch(`${this.baseUrl}/todo`, {
            method: 'GET',
            headers,
            body: JSON.stringify(),
        });

        const result = await response.json();
        this.repository = result;
    }

    async del(id) {
        const headers = new Headers();

        headers.set('Content-Type', 'application/json;charset=utf-8');
        headers.set('Authorization', `Bearer ${this.token}`);

        const response = await fetch(`${this.baseUrl}/todo/${id}`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ id }),
        });

        await response.json();
        this.getAllNotes();
    }

    // async getById(id) {
    //     const headers = new Headers();

    //     headers.set('Content-Type', 'application/json;charset=utf-8');
    //     headers.set('Authorization', `Bearer ${this.token}`);

    //     const response = await fetch(`${this.baseUrl}/todo/${id}`, {
    //         method: 'GET',
    //         headers,
    //         body: JSON.stringify(),
    //     });

    //     const result = await response.json();
    //     this.getAllNotes();
    // }

    getStatistic() {
        const doneNotice = this.repository.filter(item => item.isDone === true);

        return {
            totalNotice: this.repository.length,
            doneNotice: doneNotice.length,
        };
    }
}

class RenderToDoList {
    form = document.querySelector('.popup');
    todoForm = document.querySelector('.todo-form');
    list = document.querySelector('.todo__list');
    // button = document.querySelector('.form__button');
    loginField = document.querySelector('.login');
    passwordField = document.querySelector('.password');

    constructor() {
        this.model = new TodoModel();

        this.initializeFormSubmit();
        this.authorization();
        this.initializeRemovingNotice();
    }

    authorization() {
        this.form.addEventListener('submit', event => {
            event.preventDefault();
            if (this.loginField.value.trim() === '' || this.passwordField.value.trim() === '') {
                alert('Не верно введен логин или пароль');
            } else {
                this.model.auth();
                setTimeout(() => {
                    this.initializeShowingList();
                }, 500);
            }
        });
    }

    initializeFormSubmit() {
        this.todoForm.addEventListener('submit', event => {
            event.preventDefault();

            const $input = document.querySelector('.todo__text');

            if ($input.value.trim()) {
                this.model.addNote($input.value);
                setTimeout(() => {
                    this.initializeShowingList();
                }, 500);
            }
            $input.value = '';
            setTimeout(() => {
                this.initializeShowStatistic();
            }, 400);
        });
    }

    initializeShowingList() {
        const fragment = new DocumentFragment();

        this.model.repository.forEach(item => {
            const $li = document.createElement('li');
            $li.dataset.id = item._id;

            const $span = document.createElement('span');
            $span.className = `text${$li.dataset.id}`;
            $span.innerHTML = item.value;
            const $input = document.createElement('input');
            $input.className = `check${$li.dataset.id}`;
            $input.setAttribute('type', 'checkbox');
            if (item.isDone === true) {
                $input.setAttribute('checked', 'true');
            }

            const $button = document.createElement('button');
            $button.innerHTML = 'Remove notice';
            $button.className = `remove${$li.dataset.id}`;
            $li.innerHTML = $span.outerHTML + $input.outerHTML + $button.outerHTML;
            fragment.appendChild($li);
        });
        this.list.innerHTML = '';
        this.list.appendChild(fragment);
        setTimeout(() => {
            this.initializeShowStatistic();
        }, 400);
    }

    initializeRemovingNotice() {
        this.list.addEventListener('click', ({ target }) => {
            const li = target.closest('li');
            const $input = document.querySelector('.todo__text');
            const span = target.closest('span');
            switch (target.className) {
                case `remove${li.dataset.id}`:
                    if (window.confirm('Do you really want to delete item?')) {
                        this.model.del(+li.getAttribute('data-id'));
                        setTimeout(() => {
                            this.initializeShowStatistic();
                            this.initializeShowingList();
                        }, 400);
                    }
                    break;
                case `check${li.dataset.id}`:
                    this.model.setAsDoneNotice(+li.getAttribute('data-id'));
                    this.initializeShowStatistic();
                    this.initializeShowingList();
                    break;
                case `text${li.dataset.id}`:
                    $input.value = '';
                    $input.value = span.innerText.trim();
                    this.model.del(+li.getAttribute('data-id'));
            }
        });
    }

    initializeShowStatistic() {
        const $statBox = document.querySelector('.todo__statistic');
        const $div = document.createElement('div');
        $statBox.innerHTML = '';
        const fragment = document.createDocumentFragment();

        $div.innerHTML = `<h2>Total: ${this.model.getStatistic().totalNotice}</h2>
        <h2>Complited: ${this.model.getStatistic().doneNotice}</h2>`;
        fragment.appendChild($div);
        $statBox.appendChild(fragment);
    }
}

new RenderToDoList();
