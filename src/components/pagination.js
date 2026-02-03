
export const initPagination = (elements, createPage) => {
      let pageCount = 0;

  const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;
         if (action && action.target) {
            const inputValue = action.target.value;
            
            if (inputValue === 'first') {
                page = 1;
            } else if (inputValue === 'prev') {
                page = Math.max(1, page - 1);
            } else if (inputValue === 'next') {
                page = Math.min(pageCount, page + 1);
            } else if (inputValue === 'last') {
                page = pageCount;
            } else if (!isNaN(inputValue)) {
                page = Math.max(1, Math.min(pageCount, parseInt(inputValue)));
            }
        }
         return {
            ...query,
            limit,
            page: page - 1 
        };
    };
  const updatePagination = (total, { page, limit }) => {
        const currentPage = page + 1;
        pageCount = Math.ceil(total / limit);

        if (elements.pages && elements.fromRow && elements.toRow && elements.totalRows) {
            
            elements.fromRow.textContent = (currentPage - 1) * limit + 1;
            elements.toRow.textContent = Math.min(currentPage * limit, total);
            elements.totalRows.textContent = total;
            
            
            if (createPage && elements.pages) {
                const pageTemplate = elements.pages.firstElementChild?.cloneNode(true) || document.createElement('div');
                const visiblePages = getPages(currentPage, pageCount, 5);
                
                elements.pages.replaceChildren(...visiblePages.map(pageNumber => {
                    const el = pageTemplate.cloneNode(true);
                    return createPage(el, pageNumber, pageNumber === currentPage);
                }));
            }
        }
 if (elements.page) {
            elements.page.value = currentPage;
            elements.page.max = pageCount;
        }
        if (elements.first) elements.first.disabled = currentPage === 1;
        if (elements.prev) elements.prev.disabled = currentPage === 1;
        if (elements.next) elements.next.disabled = currentPage === pageCount;
        if (elements.last) elements.last.disabled = currentPage === pageCount;
        if (elements.total) elements.total.textContent = pageCount;
    };
    
    return { applyPagination, updatePagination };
};


