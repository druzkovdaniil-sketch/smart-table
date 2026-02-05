import "./fonts/ys-display/fonts.css";
import "./style.css";
import { initFiltering } from "./components/filtering.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initSearching } from "./components/searching.js";
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
  const page = parseInt(state.page) || 1;
  const sortHeader = Array.from(
    document.querySelectorAll("th[data-field]"),
  ).find((th) => th.dataset.order && th.dataset.order !== "none");

  return {
    ...state,
    rowsPerPage,
    page,
    sortField: sortHeader ? sortHeader.dataset.field : null,
    sortOrder: sortHeader ? sortHeader.dataset.order : "none",
  };
}

async function render(action) {
  console.log("=== RENDER START ===");
  console.log("Action:", action?.target?.name, "=", action?.target?.value);
  let state = collectState();
  if (action && action.target) {
    const name = action.target.name;
    if (
      name === "rowsPerPage" ||
      name === "searchBySeller" ||
      name === "totalFrom" ||
      name === "totalTo"
    ) {
      state.page = 1;
      const pageInput = document.querySelector('input[name="page"]');
      if (pageInput) {
        pageInput.value = 1;
      }
      console.log("Reset page to 1 because of:", name);
    }
  }

  console.log("state:", state);
  let query = {};

  query = applySearching(query, state, action);
  console.log("after search:", query);

  query = applyFiltering(query, state, action);
  console.log("after filter:", query);

  query = applySorting(query, state, action);
  console.log("after sort:", query);

  query = applyPagination(query, state, action);
  console.log("final query:", query);

  try {
    const { total, items } = await api.getRecords(query);
    console.log("data received:", { total, items: items?.length || 0 });
    updatePagination(total, query);

    sampleTable.render(items || []);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  render,
);

const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  },
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const applySearching = initSearching(sampleTable.search.elements);

let applyFiltering;

async function init() {
  console.log("init started");

  try {
    const indexes = await api.getIndexes();
    console.log("indexes loaded:", indexes);

    const { applyFiltering: initFilteringFunc, updateIndexes } = initFiltering(
      sampleTable.filter.elements,
    );
    applyFiltering = initFilteringFunc;

    const indexesToUpdate = {}; // важно

    updateIndexes(sampleTable.filter.elements, {
      searchBySeller: indexes.sellers,
    });
    if (sampleTable.filter.elements.searchBySeller) {
      indexesToUpdate.searchBySeller = indexes.sellers;
    }

    if (sampleTable.filter.elements.searchByCustomer) {
      indexesToUpdate.searchByCustomer = indexes.customers;
    }

    console.log("Search elements:", sampleTable.search.elements);
    console.log("Filter elements:", sampleTable.filter.elements);
    console.log("Pagination elements:", sampleTable.pagination.elements);
    const pageInput = document.querySelector('input[name="page"]');
    if (pageInput) {
      pageInput.value = 1;
      console.log("Set initial page to 1");
    }

    const rowsPerPageSelect = document.querySelector(
      'select[name="rowsPerPage"]',
    );
    if (rowsPerPageSelect && !rowsPerPageSelect.value) {
      rowsPerPageSelect.value = 10;
      console.log("Set initial rowsPerPage to 10");
    }
    if (sampleTable.search.elements.search) {
      sampleTable.search.elements.search.addEventListener(
        "input",
        debounce(() => {
          console.log("Search input changed");
          render();
        }, 500),
      );
    }
    if (sampleTable.filter.elements.searchBySeller) {
      sampleTable.filter.elements.searchBySeller.addEventListener(
        "change",
        (event) => {
          console.log("Filter seller changed");
          render(event);
        },
      );
    }
    const paginationButtons = ["first", "prev", "next", "last"];
    paginationButtons.forEach((buttonName) => {
      const button = sampleTable.pagination.elements[buttonName];
      if (button) {
        button.addEventListener("click", (event) => {
          console.log(`${buttonName} button clicked`);
          render(event);
        });
      }
    });
    if (sampleTable.pagination.elements.page) {
      sampleTable.pagination.elements.page.addEventListener(
        "change",
        (event) => {
          console.log("Page input changed");
          render(event);
        },
      );
    }
    if (sampleTable.pagination.elements.rowsPerPage) {
      sampleTable.pagination.elements.rowsPerPage.addEventListener(
        "change",
        (event) => {
          console.log("Rows per page changed");
          render(event);
        },
      );
    }
    if (sampleTable.header.elements.sortByDate) {
      sampleTable.header.elements.sortByDate.addEventListener(
        "click",
        (event) => {
          console.log("Sort by date clicked");
          render(event);
        },
      );
    }
    if (sampleTable.header.elements.sortByTotal) {
      sampleTable.header.elements.sortByTotal.addEventListener(
        "click",
        (event) => {
          console.log("Sort by total clicked");
          render(event);
        },
      );
    }
    const clearButton =
      sampleTable.filter.container.querySelector(".clear-button");
    if (clearButton) {
      clearButton.addEventListener("click", (event) => {
        console.log("Clear button clicked");
        render(event);
      });
    }
    if (sampleTable.filter.elements.searchByDate) {
      sampleTable.filter.elements.searchByDate.addEventListener(
        "change",
        (event) => {
          console.log("Date filter changed");
          render(event);
        },
      );
      sampleTable.filter.elements.searchByDate.addEventListener(
        "input",
        debounce((event) => {
          console.log("Date filter input");
          render(event);
        }, 500),
      );
      if (sampleTable.filter.elements.searchByCustomer) {
        sampleTable.filter.elements.searchByCustomer.addEventListener(
          "change",
          (event) => {
            console.log("Customer filter changed");
            render(event);
          },
        );
        const clearButtons = sampleTable.filter.container.querySelectorAll(
          'button[name="clear"]',
        );
        clearButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            console.log(
              "Clear button clicked for:",
              event.target.dataset.field,
            );
            render(event);
          });
        });
      }
    }
    await render();
  } catch (error) {
    console.error("Init error:", error);
  }
}

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

init().catch(console.error);
