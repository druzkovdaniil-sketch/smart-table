import './fonts/ys-display/fonts.css'
import './style.css'
import { initFiltering } from './components/filtering.js';
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initSearching } from './components/searching.js';

// Функция debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const api = initData();

function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page) || 1; // Убедимся что page всегда число

    return {
        ...state,
        rowsPerPage,
        page
    };
}

async function render(action) {
    console.log('=== RENDER START ===');
    console.log('Action:', action?.target?.name, '=', action?.target?.value);
    let state = collectState();
    
    // Сбрасываем страницу на 1 при изменении rowsPerPage или фильтров
    if (action && action.target) {
        const name = action.target.name;
        if (name === 'rowsPerPage' || name === 'searchBySeller' || 
            name === 'totalFrom' || name === 'totalTo') {
            state.page = 1;
            // Обновляем значение в DOM
            const pageInput = document.querySelector('input[name="page"]');
            if (pageInput) {
                pageInput.value = 1;
            }
            console.log('Reset page to 1 because of:', name);
        }
    }
    
    console.log('state:', state);
    let query = {};
    
    query = applySearching(query, state, action);
    console.log('after search:', query);
    
    query = applyFiltering(query, state, action);
    console.log('after filter:', query);
    
    query = applySorting(query, state, action);
    console.log('after sort:', query);
    
    query = applyPagination(query, state, action);
    console.log('final query:', query);
    
    try {
        const { total, items } = await api.getRecords(query);
        console.log('data received:', { total, items: items?.length || 0 });
        
        // Обновляем пагинацию
        updatePagination(total, query);
        
        // Рендерим таблицу
        sampleTable.render(items || []);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search','header', 'filter'],
    after: ['pagination']
}, render);

// Инициализация компонентов
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

let applyFiltering; // Будет инициализирован в init()

async function init() {
    console.log('init started');
    
    try {
        const indexes = await api.getIndexes();
        console.log('indexes loaded:', indexes);
        
        const { applyFiltering: initFilteringFunc, updateIndexes } = initFiltering(sampleTable.filter.elements);
        applyFiltering = initFilteringFunc;
        
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
        
        // Проверяем элементы
        console.log('Search elements:', sampleTable.search.elements);
        console.log('Filter elements:', sampleTable.filter.elements);
        console.log('Pagination elements:', sampleTable.pagination.elements);
        
        // Устанавливаем начальные значения
        const pageInput = document.querySelector('input[name="page"]');
        if (pageInput) {
            pageInput.value = 1;
            console.log('Set initial page to 1');
        }
        
        const rowsPerPageSelect = document.querySelector('select[name="rowsPerPage"]');
        if (rowsPerPageSelect && !rowsPerPageSelect.value) {
            rowsPerPageSelect.value = 10;
            console.log('Set initial rowsPerPage to 10');
        }
        
        // Делаем первый рендер
        await render();
        
    } catch (error) {
        console.error('Init error:', error);
    }
}

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

init().catch(console.error);