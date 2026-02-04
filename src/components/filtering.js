export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const selectElement = elements[elementName];
            if (!selectElement) return;

            selectElement.innerHTML = '<option value="">—</option>';
            
            Object.values(indexes[elementName]).forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                selectElement.appendChild(option);
            });
        });
    };

    const applyFiltering = (query, state, action) => {
        console.log('applyFiltering called with action:', action?.target?.name);

        // При изменении фильтра сбрасываем страницу на 1
        if (action && action.target && 
            (action.target.name === 'searchBySeller' || 
             action.target.name === 'totalFrom' || 
             action.target.name === 'totalTo')) {
            query = { ...query, page: 1 };
        }

        if (action && action.target && action.target.classList.contains('clear-button')) {
            const field = action.target.dataset.field;
            if (field && elements[field]) {
                elements[field].value = '';
            }
        }

        const filter = {};
        
        Object.keys(elements).forEach(key => {
            if (elements[key] && elements[key].value) {
                if (elements[key].name === 'searchBySeller') {
                    filter['filter[seller]'] = elements[key].value;
                }
                // Добавляем фильтры по числам если они есть
                if (elements[key].name === 'totalFrom') {
                    filter['filter[totalFrom]'] = elements[key].value;
                }
                if (elements[key].name === 'totalTo') {
                    filter['filter[totalTo]'] = elements[key].value;
                }
            }
        });

        console.log('Filter result:', filter);
        return Object.keys(filter).length > 0 
            ? { ...query, ...filter } 
            : query;
    };
    
    return { updateIndexes, applyFiltering };
}