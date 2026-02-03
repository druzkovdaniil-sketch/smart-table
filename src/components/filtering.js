
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

            }
        });

        return Object.keys(filter).length > 0 
            ? { ...query, ...filter } 
            : query;
    };
    
    return { updateIndexes, applyFiltering };
}