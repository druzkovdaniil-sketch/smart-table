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
  let currentPageState = 1;

  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
    let page = state.page;

    console.log("=== APPLY PAGINATION ===");
    console.log(
      "Action buttonName:",
      action?.buttonName,
      "buttonValue:",
      action?.buttonValue,
    );

    if (action && action.buttonName) {
      const buttonName = action.buttonName;

      if (buttonName === "first") {
        page = 1;
      } else if (buttonName === "prev") {
        page = Math.max(1, page - 1);
      } else if (buttonName === "next") {
        page = Math.min(pageCount, page + 1);
      } else if (buttonName === "last") {
        page = pageCount;
      } else if (buttonName === "page") {
        const pageValue = parseInt(action.buttonValue);
        if (!isNaN(pageValue)) {
          page = Math.max(1, Math.min(pageCount, pageValue));
        }
      }

      console.log(`Pagination: ${buttonName} → page ${page}`);
    }

    console.log("Final page for query:", page);
    return {
      ...query,
      limit,
      page: page,
    };
  };

  const updatePagination = (total, { page, limit }) => {
    const currentPage = page || 1;
    pageCount = Math.max(1, Math.ceil(total / limit));

    console.log("=== UPDATE PAGINATION ===");
    console.log(
      "Total:",
      total,
      "currentPage:",
      currentPage,
      "limit:",
      limit,
      "pageCount:",
      pageCount,
    );

    if (elements.fromRow && elements.toRow && elements.totalRows) {
      const from = (currentPage - 1) * limit + 1;
      const to = Math.min(currentPage * limit, total);
      elements.fromRow.textContent = from;
      elements.toRow.textContent = to;
      elements.totalRows.textContent = total;
      console.log("Rows info updated:", from, "to", to, "of", total);
    }

    if (createPage && elements.pages) {
      const pageTemplate =
        elements.pages.firstElementChild?.cloneNode(true) ||
        document.createElement("div");
      const visiblePages = getPages(currentPage, pageCount, 5);

      console.log("Visible pages:", visiblePages);

      elements.pages.replaceChildren(
        ...visiblePages.map((pageNumber) => {
          const el = pageTemplate.cloneNode(true);
          return createPage(el, pageNumber, pageNumber === currentPage);
        }),
      );
    }

    if (elements.page) {
      elements.page.value = currentPage;
      elements.page.max = pageCount;
      console.log("Page input updated:", currentPage, "max:", pageCount);
    }

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === pageCount;

    if (elements.first) {
      elements.first.disabled = isFirstPage;
      elements.first.setAttribute("name", "first");
      console.log("First button:", isFirstPage ? "disabled" : "enabled");
    }

    if (elements.prev) {
      elements.prev.disabled = isFirstPage;
      elements.prev.setAttribute("name", "prev");
      console.log("Prev button:", isFirstPage ? "disabled" : "enabled");
    }

    if (elements.next) {
      elements.next.disabled = isLastPage;
      elements.next.setAttribute("name", "next");
      console.log("Next button:", isLastPage ? "disabled" : "enabled");
    }

    if (elements.last) {
      elements.last.disabled = isLastPage;
      elements.last.setAttribute("name", "last");
      console.log("Last button:", isLastPage ? "disabled" : "enabled");
    }

    if (elements.total) {
      elements.total.textContent = pageCount;
      console.log("Total pages:", pageCount);
    }

    currentPageState = currentPage;
  };

  return { applyPagination, updatePagination };
};
