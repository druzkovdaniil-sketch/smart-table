function getPages(current, total, visible = 5) {
    const pages = [];
    let start = Math.max(1, current - Math.floor(visible / 2));
    let end = Math.min(total, start + visible - 1);
    
    if (end - start + 1 < visible) {
        start = Math.max(1, end - visible + 1);
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    
    return pages;
}

export const initPagination = (elements, createPage) => {
    let pageCount = 0;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;
        
        console.log('Pagination action:', action?.target?.value, 'current page:', page, 'pageCount:', pageCount);
        
        if (action && action.target && action.target.name === 'page') {
            const inputValue = action.target.value;
            
            if (inputValue === 'first') {
                page = 1;
            } else if (inputValue === 'prev') {
                page = Math.max(1, page - 1);
            } else if (inputValue === 'next') {
                page = Math.min(pageCount, page + 1);
            } else if (inputValue === 'last') {
                page = pageCount;
            } else if (!isNaN(parseInt(inputValue))) {
                // ИСПРАВЛЕНО: используем inputValue вместо newPage
                const newPage = parseInt(inputValue);
                page = Math.max(1, Math.min(pageCount, newPage));
                console.log('Setting page to:', page, 'from input:', newPage);
            }
        }
        
        console.log('Final page for query:', page);
        
        return {
            ...query,
            limit,
            page: page
        };
    };
    
    const updatePagination = (total, { page, limit }) => {
        const currentPage = page;
        pageCount = Math.ceil(total / limit);

        console.log('updatePagination:', { 
            total, 
            currentPage, 
            limit, 
            pageCount 
        });
        
        if (elements.fromRow && elements.toRow && elements.totalRows) {
            elements.fromRow.textContent = (currentPage - 1) * limit + 1;
            elements.toRow.textContent = Math.min(currentPage * limit, total);
            elements.totalRows.textContent = total;
        }
        
        if (createPage && elements.pages) {
            const pageTemplate = elements.pages.firstElementChild?.cloneNode(true) || document.createElement('div');
            const visiblePages = getPages(currentPage, pageCount, 5);
            
            elements.pages.replaceChildren(...visiblePages.map(pageNumber => {
                const el = pageTemplate.cloneNode(true);
                return createPage(el, pageNumber, pageNumber === currentPage);
            }));
        }
        
        if (elements.page) {
            elements.page.value = currentPage;
            elements.page.max = pageCount;
        }
        if (elements.first) {
            elements.first.disabled = currentPage === 1;
            elements.first.value = 'first';
        }
        if (elements.prev) {
            elements.prev.disabled = currentPage === 1;
            elements.prev.value = 'prev';
        }
        if (elements.next) {
            elements.next.disabled = currentPage === pageCount;
            elements.next.value = 'next';
        }
        if (elements.last) {
            elements.last.disabled = currentPage === pageCount;
            elements.last.value = 'last';
        }
        if (elements.total) elements.total.textContent = pageCount;
    };
    
    return { applyPagination, updatePagination };
};