
const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
    inputCitiesTo = formSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = formSearch.querySelector('.input__date-depart'),
    cheapestTicket = document.getElementById('cheapest-ticket'),
    otherCheapTickets = document.getElementById('other-cheap-tickets');

//API

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
    proxy = 'https://cors-anywhere.herokuapp.com/',
    API_KEY = '794d0dc1c8ef5101c7d0949d97bb2815',
    CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload',
    MAX_COUNT = 10;
let city = [];

//Функции
const getData = (url, callback, reject = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !== 4) return;

        if (request.status === 200){
            callback(request.response);
        }else{
            reject(request.status);
        }
    });
    request.send();
};

//вывод города
const showCity = (input, list) => {
    list.textContent = '';

    if (input.value !== ''){
        const filterCity = city.filter((item) => {
            const fixItem = item.name.toLowerCase();
            return fixItem.startsWith(input.value.toLowerCase());
    });

        filterCity.forEach((item) => {
            const li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = item.name;
            list.append(li)
        });
    }
};

//выбор города
const selectCity = (event, input, clear) =>{
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li'){
        input.value = target.textContent;
        clear.textContent = '';
    }
};

//ищем имя города через код аэропорта.
const getNameCity = (code) => {
    const objCity = city.find((item) => item.code === code);
    return objCity.name;
};

const getDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

//проверка на пересадки
const getChanges = (num) => {
    if (num){
        return num === 1 ? 'С одной пересадкой' : 'С двумя пересадкой';
    }  else {
        return 'Без пересадок'
    }
};

const getLinkAvi = (data) => {
    let link = 'https://www.aviasales.ru/search/';
    link += data.origin;
    const date = new Date(data.depart_date);

    const day = date.getDate();
    link += day < 10 ? '0' + day : day;

    const month = date.getMonth() + 1;
    link += month < 10 ? '0' + month : month;

    link += data.destination;

    //количество персон 1=1
    link += '1';

    return link;
};

//Создание карты Самый дешевый билет на выбранную дату
const createCart = (data) => {
    const ticket = document.createElement('article');
    ticket.classList.add('ticket');

    let deep = '';

    if (data){
        deep = `
        <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href="${getLinkAvi(data)}" target="_blank" class="button button__buy">Купить
                    за ${data.value} ₽</a>
                </div>
                <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>
                
                <div class="block-right">
                <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
                </div>
            </div>
        `;
    }else{
        deep = '<h3>К сожалениею на текущую дату билотов не нашлось!</h3>';
    }

    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
};

//выбор дешевых билетов
const renderCheapYear = (cheapTickets) => {
    otherCheapTickets.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

   // cheapTickets.sort((a, b) => a.value - b.value);
    cheapTickets.sort((a, b) => {
        if (a.value > b.value){
            return 1;
        }
        if (a.value < b.value){
            return -1;
        }
        return 0;
     });

    //вывод на 10 билетов
    for(let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++){
        const ticket = createCart(cheapTickets[i]);
        otherCheapTickets.append(ticket);
    }
};

const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

    const ticket = createCart(cheapTicket[0]);
    cheapestTicket.append(ticket);
};

//Получение best цены и фильтр на день.
const renderCheap = (data, date) => {
    const cheapTicketYear = JSON.parse(data).best_prices;
    const cheapTickDay = cheapTicketYear.filter((item) => {
        return item.depart_date === date;
    });
    renderCheapYear(cheapTicketYear);
    renderCheapDay(cheapTickDay);
};

// Обработчик событий
inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
});

dropdownCitiesFrom.addEventListener('click', (event) =>{
    selectCity(event, inputCitiesFrom, dropdownCitiesFrom)
});

dropdownCitiesTo.addEventListener('click', (event) =>{
    selectCity(event, inputCitiesTo, dropdownCitiesTo)
});

formSearch.addEventListener('submit', (evt => {
    evt.preventDefault();

    const cityFrom = city.find((item) => inputCitiesFrom.value === item.name);
    const cityTo = city.find((item) => inputCitiesTo.value === item.name);

    const formData = {
        from: cityFrom,
        to: cityTo,
        when: inputDateDepart.value
    };

    if (formData.from && formData.to){
        const requestData = '?depart_date=' + formData.when +
            '&origin=' + formData.from.code +
            '&destination=' + formData.to.code +
            '&one_way=true&token=' + API_KEY;

        //получение каленьдарный цен
        getData(proxy + CALENDAR + requestData, (response) => {
            renderCheap(response, formData.when);
        }, (error) => {
            alert('В этом направлении нет рейсов');
        });
    } else  {
        alert('Введите корректное название города!');
    }
}));

//вызовы функций
getData(proxy + citiesApi, (data) => {
    city = JSON.parse(data).filter((item => item.name));

    city.sort((a, b) => {
        if (a.value > b.value){
            return 1;
        }
        if (a.value < b.value){
            return -1;
        }
        return 0;
    });
});