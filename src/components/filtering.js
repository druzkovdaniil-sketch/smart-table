import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
    console.log('initFiltering вызван', { elements, indexes });
    
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)
        .forEach((elementName) => {
            const selectElement = elements[elementName];
            if (!selectElement) {
                console.warn(`Элемент ${elementName} не найден в elements`);
                return;
            }
            
            // Получаем значения для этого поля
            const values = indexes[elementName];
            if (!Array.isArray(values)) {
                console.warn(`Значения для ${elementName} не массив:`, values);
                return;
            }
            
            // Очищаем существующие опции (кроме первой пустой)
            selectElement.innerHTML = '<option value="">—</option>';
            
            // Добавляем новые опции
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                selectElement.appendChild(option);
            });
        });

    // @todo: #4.3 — настроить компаратор
    const compare = createComparison(defaultRules);

    return function applyFiltering(data, state, action) {
        console.log('applyFiltering вызван', { 
            dataLength: data.length, 
            state, 
            action 
        });
        
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            if (field) {
                const parent = action.closest('[data-field]') || action.parentElement;
                // Ищем input или select в родительском элементе
                const input = parent.querySelector('input') || parent.querySelector('select');
                
                if (input) {
                    input.value = '';
                    
                    // Очищаем соответствующее поле в state
                    if (state && state[field] !== undefined) {
                        state[field] = '';
                    }
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        const filtered = data.filter(row => {
            try {
                return compare(row, state);
            } catch (error) {
                console.error('Ошибка сравнения:', error, { row, state });
                return true; // если ошибка - оставляем строку
            }
        });
        
        console.log('Фильтрация:', { 
            было: data.length, 
            стало: filtered.length,
            state 
        });
        
        return filtered;
    };
}