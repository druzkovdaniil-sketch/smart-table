export const initSearching = (elements) => {
    return (query, state, action) => {
        console.log('applySearching called');
        
        // Проверяем есть ли значение в поле поиска
        const searchField = Object.keys(elements).find(key => 
            elements[key] && elements[key].name === 'search'
        );
        
        if (searchField && state[searchField]) {
            return {
                ...query,
                search: state[searchField]
            };
        }
        
        return query;
    };
};