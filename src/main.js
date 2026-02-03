import './fonts/ys-display/fonts.css'
import './style.css'
import { initFiltering } from './components/filtering.js';


import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
// @todo: подключение
import { initPagination } from './components/pagination.js';

import { initSorting } from './components/sorting.js';
import { initSearching } from './components/searching.js';
// Исходные данные используемые в render()
// const { data, ...indexes } = initData(sourceData);
// const filterIndexes = {
//     searchBySeller: Object.values(indexes.sellers) 
// };
const api = initData();
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

async function render(action) { // Добавьте async!
    let state = collectState();
    let query = {};
    // Пока закомментируем все apply-функции, будем включать их по одной
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);
    const { total, items } = await api.getRecords(query);
    sampleTable.render(items);
}


const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search','header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация
const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);
const applySearching = initSearching(sampleTable.search.elements);
let applyFiltering;
// const applyFiltering = initFiltering(sampleTable.filter.elements, filterIndexes);

// const appRoot = document.querySelector('#app');
// appRoot.appendChild(sampleTable.container);

// render();

async function init() {
    const indexes = await api.getIndexes();
    const { applyFiltering: initFilteringFunc, updateIndexes } = initFiltering(sampleTable.filter.elements);
    applyFiltering = initFilteringFunc;
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
    sampleTable.search.addEventListener('input', debounce(() => render(), 500));
    sampleTable.filter.addEventListener('change', () => render());
    sampleTable.pagination.addEventListener('change', (event) => render(event));
    sampleTable.table.addEventListener('click', (event) => {
        if (event.target.tagName === 'TH') {
            render(event);
        }
    });
    await render();
}

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

init().catch(console.error);