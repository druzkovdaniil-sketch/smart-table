export const initSorting = (columns) => {
    return (query, state, action) => {
        if (action && action.target.tagName === 'TH') {
            const field = action.target.dataset.field;
            const currentOrder = state.sortOrder;
            let nextOrder = 'asc';
            
            if (field === state.sortField) {
                if (currentOrder === 'asc') nextOrder = 'desc';
                else if (currentOrder === 'desc') nextOrder = 'none';
            }
            
            columns.forEach(col => {
                if (col.dataset.field === field) {
                    col.dataset.order = nextOrder;
                } else {
                    col.dataset.order = 'none';
                }
            });
        }
        
        const sortColumn = Array.from(document.querySelectorAll('th[data-field]'))
            .find(col => col.dataset.order && col.dataset.order !== 'none');
        
        if (sortColumn) {
            const field = sortColumn.dataset.field;
            const order = sortColumn.dataset.order;
            return {
                ...query,
                sort: `${field}:${order}`
            };
        }
        
        return query;
    };
};