'use strict'

// Text length

const TaskSettings = {
    MINLENGTH: 1,
    MAXLENGTH: 75,
    COUNTERSUPDATEINTERVAL: 1000,
};

let tasksArray = [];
const bodyElem = document.querySelector('.body');
const dateElem = document.querySelector('.date');
const timeElem = document.querySelector('.time');
const tasksBodyElem = document.querySelector('.tasks-body');
const addBlock = document.querySelector('.add-block');
const addTaskInput = document.querySelector('.add-block-input');
const addTaskBtn = document.querySelector('.add-task-btn');
const taskContainerElem = document.querySelector('.tasks-container');
const taskTextElem = document.querySelector('.task-text');
const settingsIconBtn = document.querySelector('.settings-icon');
const settingsContainer = document.querySelector('.settings-container');
const closeDateContBtn = document.querySelector('.close-settings-icon');
const progress = document.querySelector('.preloader-progress');
const preloader = document.querySelector('.preloader');
const switcher = document.querySelector('.switch__input');
const themeTextEl = document.querySelector('.switch__sr');
const radioButtons = document.querySelectorAll('.label-radio');
const modalConfBtn = document.querySelectorAll('.modal_confirm-btn');
let textHeaderSetDeadline = 'Set a deadline (optional)';
let textBtnSetDeadline = 'Set';
let textDoNotSetDeadline = 'Do not set';
let selectedLanguage = "en";


getFromLocalStorage();
areThereTasks();


// Preloader

window.onload = function() {
    setTimeout(function() {
        preloader.style.display = "none";
    }, 1000);
};


// Background

var granimInstance = new Granim({
    element: '#canvas-basic',
    direction: 'diagonal',
    isPausedWhenNotInView: true,
    stateTransitionSpeed: 3500,
    states: {
        "default-state": {
            gradients: [
                ['#5A72E3', '#1691bc'],
                ['#055aa0', '#055aa0'],
                ['#b965e4', '#402495']
            ]
        }
    }
});

// Theme switcher

// Check local storage

let themeState = localStorage.getItem('theme');

if (themeState === 'dark-theme') {
    bodyElem.classList.add('dark-theme');
    selectedLanguage === "ru" ? themeTextEl.textContent = 'Темная' : themeTextEl.textContent = 'Dark';
    switcher.checked = true;
} else {
    bodyElem.classList.remove('dark-theme');
    selectedLanguage === "ru" ? themeTextEl.textContent = 'Светлая' : themeTextEl.textContent = 'Light';
    switcher.checked = false;
}


switcher.addEventListener('change', function() {
    if (switcher.checked) {
        bodyElem.classList.add('dark-theme');
        selectedLanguage === "ru" ? themeTextEl.textContent = 'Темная' : themeTextEl.textContent = 'Dark';
        themeState = 'dark-theme';
        localStorage.setItem('theme', 'dark-theme');
    } else {
        bodyElem.classList.remove('dark-theme');
        selectedLanguage === "ru" ? themeTextEl.textContent = 'Светлая' : themeTextEl.textContent = 'Light';
        themeState = 'light-theme';
        localStorage.setItem('theme', 'light-theme');
    }
});


// Localization

const savedLang = localStorage.getItem('lang');

if (savedLang === 'ru') {
    selectedLanguage = "ru";
    changeLanguage();
};


radioButtons.forEach(radioButton => {

    radioButton.addEventListener('click', () => {

        selectedLanguage = radioButton.value;
        localStorage.setItem('lang', selectedLanguage);
        changeLanguage();

    });
});


function changeLanguage() {

    if (selectedLanguage === "ru") {
        themeState === "dark-theme" ? themeTextEl.textContent = 'Темная' : themeTextEl.textContent = 'Светлая';
        addTaskInput.setAttribute('placeholder', 'Добавить задачу');
        textHeaderSetDeadline = 'Установить срок выполнения';
        textBtnSetDeadline = "Установить";
        textDoNotSetDeadline = "Не устанавливать";
        if (tasksBodyElem.classList.contains('tasks-body_empty')) {
            tasksBodyElem.classList.add('tasks-body_empty-rus');
            tasksBodyElem.classList.remove('tasks-body_empty');
        };
    } else {
        themeState === "dark-theme" ? themeTextEl.textContent = 'Dark' : themeTextEl.textContent = 'Light';
        addTaskInput.setAttribute('placeholder', 'Add new task');
        textHeaderSetDeadline = 'Set a deadline (optional)';
        textBtnSetDeadline = "Set";
        textDoNotSetDeadline = "Do not set";
        if (tasksBodyElem.classList.contains('tasks-body_empty-rus')) {
            tasksBodyElem.classList.remove('tasks-body_empty-rus');
            tasksBodyElem.classList.add('tasks-body_empty');
        };
    };

    fetch('localization.json')
        .then(response => response.json())
        .then(data => {
            const lang = selectedLanguage;
            const elements = document.querySelectorAll('[data-translation-key]');
            elements.forEach(element => {
                const translationKey = element.dataset.translationKey;
                element.textContent = data[lang][translationKey];
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки JSON файла:', error);
        });
};


// Open settings menu (mobile)

settingsIconBtn.onclick = function() {
    settingsContainer.classList.add('settings-container_opened');
};

document.addEventListener("click", function(event) {
    if (!event.target.classList.contains('settings-container') && !event.target.classList.contains('settings-icon')) {
      settingsContainer.classList.remove('settings-container_opened');
    }
});


// Add new task

addTaskBtn.onclick = function() {

    createNewTask(addTaskInput.value);

};


// Create new task

function createNewTask(taskText) {

    if (taskText.length > 0 && taskText.length < TaskSettings.MAXLENGTH) {

        addBlock.classList.remove('alert-max-length');
        addBlock.classList.remove('alert-max-length_rus');
        addBlock.classList.remove('alert-min-length');
        addBlock.classList.remove('alert-min-length_rus');

        const newTaskElem = document.createElement('div');
        newTaskElem.className = 'task';
        newTaskElem.innerHTML = `<label class="custom-checkbox">
    <input class="task-checkbox" type="checkbox">
    <span class="checkmark"></span>
    </label>
    <div class="task-text-wrapper"><div class="task-text"></div></div>
    <button class="task-delete-btn"></button>
    <button class="task-edit-btn"></button>`;
        taskText.length > 40 ? newTaskElem.classList.add('task_dots') : null;
        const trimmedText = validateText(taskText);
        newTaskElem.setAttribute('title', taskText);
        newTaskElem.querySelector('.task-text').textContent = trimmedText;
        newTaskElem.querySelector('.task-text').classList.add('trim-text');

        const newModal = document.createElement('div');
        newModal.classList.add('modal-container');
        newModal.innerHTML = `<div class="modal">
      <div class="modal-header">
      ${textHeaderSetDeadline}</div>
      <div class="date-time-input-wrapper"><input id="date-time-picker" type="datetime-local" name="date-time-picker"></div>
      <button class="modal_confirm-btn">${textBtnSetDeadline}</button>
      <button class="modal_skip-btn">${textDoNotSetDeadline}</button>
    </div>`;

        bodyElem.appendChild(newModal);

        const setDeadlineBtn = document.querySelector('.modal_confirm-btn');
        const skipDeadlineBtn = document.querySelector('.modal_skip-btn');
        const dateInput = document.querySelector('#date-time-picker');


        setDeadlineBtn.onclick = function() {
            if (dateInput.value === '') {

                if (selectedLanguage === "ru") {
                    newModal.querySelector('.date-time-input-wrapper').classList.add('date-input-alert_rus');
                } else {
                    newModal.querySelector('.date-time-input-wrapper').classList.add('date-input-alert');
                };

            } else {

                const newCountdownEl = createCountdown(dateInput.value);

                newTaskElem.appendChild(newCountdownEl);

                taskContainerElem.appendChild(newTaskElem);

                const selectedTime = newCountdownEl.dataset.time;

                tasksArray.push({
                    text: trimmedText,
                    status: 'unfinished',
                    time: selectedTime,
                });

                addToLocalStorage(tasksArray);
                areThereTasks();

                document.querySelector('.add-block-input').value = '';

                document.querySelector('.modal-container').remove();

            }
        }


        skipDeadlineBtn.onclick = function() {

            taskContainerElem.appendChild(newTaskElem);

            tasksArray.push({
                text: trimmedText,
                status: 'unfinished'
            });

            addToLocalStorage(tasksArray);
            areThereTasks();

            document.querySelector('.add-block-input').value = '';

            document.querySelector('.modal-container').remove();

        }

    } else if (taskText.length > TaskSettings.MAXLENGTH) {

        if (selectedLanguage === "ru") {
            addBlock.classList.add('alert-max-length_rus');
            addBlock.classList.remove('alert-min-length_rus');
            return;
        } else {
            addBlock.classList.add('alert-max-length');
            addBlock.classList.remove('alert-min-length');
            return;
        };

    } else {

        if (selectedLanguage === "ru") {
            addBlock.classList.add('alert-min-length_rus');
            addBlock.classList.remove('alert-max-length_rus');
            return;
        } else {
            addBlock.classList.add('alert-min-length');
            addBlock.classList.remove('alert-max-length');
            return;
        };

    };

};


// Create a counter

function createCountdown(inputDate) {
    const selectedDate = new Date(inputDate);
    const now = new Date();
    const difference = selectedDate.getTime() - now.getTime();

    const newCountdownEl = document.createElement('div');
    newCountdownEl.className = 'countdown';

    if (difference <= 0) {
        newCountdownEl.innerHTML = `Time is up :(`;
        newCountdownEl.style.color = 'rgb(192, 2, 2)';
        newCountdownEl.setAttribute('data-time', selectedDate.getTime());
        return newCountdownEl;
    }

    let seconds = Math.floor(difference / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours %= 24;
    minutes %= 60;
    seconds %= 60;

    newCountdownEl.setAttribute('data-time', selectedDate.getTime());

    if (selectedLanguage === "ru") {
        newCountdownEl.innerHTML = `Осталось ${days} д ${hours} ч ${minutes} мин`;
    } else {
        newCountdownEl.innerHTML = `${days}d ${hours}h ${minutes}min left`;
    };

    return newCountdownEl;
};


setInterval(updateCountdown, TaskSettings.COUNTERSUPDATEINTERVAL);


// Updating the counters

function updateCountdown() {

    const counters = document.querySelectorAll('.countdown');
    const now = new Date();

    for (let counter of counters) {

        const selectedDate = counter.dataset.time;
        const difference = selectedDate - now.getTime();

        if (difference <= 60000) {
            if (selectedLanguage === "ru") {
                counter.innerHTML = `Время вышло :(`;
            } else {
                counter.innerHTML = `Time is up :(`;
            };
            counter.classList.add('red-color');
            continue;
        }

        let seconds = Math.floor(difference / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        hours %= 24;
        minutes %= 60;
        seconds %= 60;

        if (selectedLanguage === "ru") {
            counter.innerHTML = `Осталось ${days} д ${hours} ч ${minutes} мин`;
        } else {
            counter.innerHTML = `${days}d ${hours}h ${minutes}min left`;
        };

    };

};


// Trim text if it is too long

function validateText(text) {
    let trimmedText = text;
    return trimmedText;
};


// Manipulations with tasks

taskContainerElem.onclick = function(event) {

    const taskElements = document.querySelectorAll('.task');

    // Mark the task done
    if ((event.target.classList.contains('checkmark')) || (event.target.classList.contains('task-text'))) {

        event.preventDefault();

        const task = event.target.closest('.task');
        const checkbox = task.querySelector('.task-checkbox');
        const taskText = task.querySelector('.task-text');

        if (checkbox.checked === true) {
            checkbox.checked = false;
            taskText.style.color = '#333';
            taskText.style.textDecorationLine = 'none';

        } else {
            checkbox.checked = true;
            taskText.style.color = 'green';
            taskText.style.textDecorationLine = 'line-through';
        }

        // add Done or Unfinished status to array
        const wantedObj = tasksArray.find(obj => obj.text === taskText.textContent);

        if (wantedObj.status === "unfinished") {
            wantedObj.status = "done";
        } else {
            wantedObj.status = "unfinished";
        };

        addToLocalStorage(tasksArray);

    };


    // Edit task

    if (event.target.classList.contains('task-edit-btn')) {

        const task = event.target.parentNode;
        const inputValue = task.querySelector('.task-text');
        const editBtn = task.querySelector('.task-edit-btn');

        if (task.querySelector('.edit-input') == null) {

            const newTextarea = document.createElement('textarea');
            newTextarea.className = "edit-input";
            newTextarea.setAttribute('rows', '1');
            newTextarea.setAttribute('cols', '30');
            newTextarea.value = inputValue.textContent;
            task.appendChild(newTextarea);

            const newConfirmBtn = document.createElement('button');
            newConfirmBtn.className = "task-confirm-btn";
            editBtn.style.display = "none";
            task.appendChild(newConfirmBtn);
            const confirmBtn = task.querySelector('.task-confirm-btn');
            const textArea = task.querySelector('.edit-input');

            newTextarea.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    const foundEl = tasksArray.find(task => task.text === inputValue.textContent);
                    inputValue.setAttribute('title', this.value);
                    this.value.length > 40 ? task.classList.add('task_dots') : task.classList.remove('task_dots');
                    inputValue.textContent = this.value;
                    foundEl.text = textArea.value;
                    task.querySelector('.edit-input').remove();
                    editBtn.style.display = "block";
                    confirmBtn.remove();
                    addToLocalStorage(tasksArray);
                };
            });

            confirmBtn.onclick = function() {
                const foundEl = tasksArray.find(task => task.text === inputValue.textContent);
                inputValue.setAttribute('title', textArea.value);
                textArea.value.length > 40 ? task.classList.add('task_dots') : task.classList.remove('task_dots');
                inputValue.textContent = textArea.value;
                foundEl.text = textArea.value;
                task.querySelector('.edit-input').remove();
                editBtn.style.display = "block";
                confirmBtn.remove();
                addToLocalStorage(tasksArray);
            };


        };

    };


    // Deleting task

    if (event.target.classList.contains('task-delete-btn')) {
        const task = event.target.parentNode;
        task.classList.add('red-bg');
        const taskText = task.querySelector('.task-text').textContent;
        tasksArray = tasksArray.filter(obj => obj.text !== taskText);
        addToLocalStorage(tasksArray);
        areThereTasks();
        setTimeout(() => task.remove(), 100);
    };

};



// Add task to array

function pushTaskToArray(taskText) {
    taskText.push(tasksArray);
};


// Add data to LocalStorage

function addToLocalStorage(array) {
    const stringArray = JSON.stringify(array);
    localStorage.setItem('tasksArray', stringArray);
};


// Get data from LocalStorage

function getFromLocalStorage() {

    const savedTasksArray = localStorage.getItem('tasksArray');

    if (savedTasksArray !== null) {

        tasksArray = JSON.parse(savedTasksArray);

        areThereTasks();

        tasksArray.forEach(function(item, index) {

            const newTaskElem = document.createElement('div');
            newTaskElem.className = 'task';
            newTaskElem.innerHTML = `<label class="custom-checkbox">
      <input class="task-checkbox" type="checkbox">
      <span class="checkmark"></span>
      </label>
      <div class="task-text-wrapper"><div class="task-text"></div></div>
      <button class="task-delete-btn"></button>
      <button class="task-edit-btn"></button>`;
            const trimmedText = validateText(item.text);
            const taskStatus = item.status;
            const checkbox = newTaskElem.querySelector('.task-checkbox');
            const taskText = newTaskElem.querySelector('.task-text');
            trimmedText.length > 40 ? newTaskElem.classList.add('task_dots') : newTaskElem.classList.remove('task_dots');
            taskText.textContent = trimmedText;
            taskText.classList.add('trim-text');

            if (item.status === "done") {
                checkbox.checked = true;
                taskText.style.color = 'green';
                taskText.style.textDecorationLine = 'line-through';
            };

            if (item.time !== undefined) {
                const newCountdownEl = document.createElement('div');
                newCountdownEl.className = 'countdown';
                newCountdownEl.setAttribute('data-time', item.time);
                newTaskElem.appendChild(newCountdownEl);
            };

            taskContainerElem.appendChild(newTaskElem);

        });

    };


    return tasksArray;

};


// Checking - if any tasks
function areThereTasks() {
    if (tasksArray.length === 0) {
        if (selectedLanguage === "ru") {
            tasksBodyElem.classList.add('tasks-body_empty-rus');
        } else {
            tasksBodyElem.classList.add('tasks-body_empty');
        };
    } else {
        tasksBodyElem.classList.remove('tasks-body_empty');
        tasksBodyElem.classList.remove('tasks-body_empty-rus');
    }
};