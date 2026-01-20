
import { createComparison, defaultRules } from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

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
            
            const indexValues = Object.values(indexes[elementName]);
            const options = indexValues.map(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            });
            
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Выберите...';
            selectElement.append(emptyOption, ...options);
        });

    return function applyFiltering(data, state, action) {
        console.log('applyFiltering вызван', { data, state, action });
        
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            if (field) {
                const parent = action.closest('[data-field]') || action.parentElement;
                const input = parent.querySelector('input, select');
                
                if (input) {
                    input.value = '';
                    
                    if (state && state[field] !== undefined) {
                        state[field] = '';
                    }
                }
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    };
}