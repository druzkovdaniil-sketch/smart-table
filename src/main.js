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

  return {
    ...state,
    rowsPerPage,
    page,
  };
}

async function render(action) {
  console.log("=== RENDER START ===");
  console.log("Action:", action);

  let state = collectState();

  if (
    action &&
    action.buttonName &&
    !["first", "prev", "next", "last", "page"].includes(action.buttonName)
  ) {
    const resetFields = [
      "search",
      "date",
      "customer",
      "seller",
      "totalFrom",
      "totalTo",
      "rowsPerPage",
      "clear",
    ];

    if (resetFields.includes(action.buttonName)) {
      state.page = 1;
      if (sampleTable.pagination.elements.page) {
        sampleTable.pagination.elements.page.value = 1;
      }
      console.log("Reset page to 1 because of:", action.buttonName);
    }
  }

  console.log("Current state:", state);
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

    updateIndexes(sampleTable.filter.elements, {
      searchBySeller: indexes.sellers,
    });

    if (sampleTable.pagination.elements.page) {
      sampleTable.pagination.elements.page.value = 1;
    }

    if (
      sampleTable.pagination.elements.rowsPerPage &&
      !sampleTable.pagination.elements.rowsPerPage.value
    ) {
      sampleTable.pagination.elements.rowsPerPage.value = 10;
    }

    console.log("Setting up pagination button handlers...");

    const paginationContainer = sampleTable.pagination.container;

    const setupButton = (buttonName, selector) => {
      const button = paginationContainer.querySelector(selector);
      if (button) {
        console.log(`Found ${buttonName} button`);

        button.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          console.log(`${buttonName} button clicked!`);

          if (buttonName === "last") {
            try {
              const state = collectState();
              const tempQuery = { limit: state.rowsPerPage, page: 1 };
              const { total } = await api.getRecords(tempQuery);
              const totalPages = Math.ceil(total / state.rowsPerPage);

              if (sampleTable.pagination.elements.page) {
                sampleTable.pagination.elements.page.value = totalPages;
              }

              render({
                buttonName: "last",
                buttonValue: "last",
                totalPages: totalPages,
              });
            } catch (error) {
              console.error("Error getting total pages:", error);
            }
          } else {
            render({
              buttonName: buttonName,
              buttonValue: buttonName,
            });
          }
        });

        return button;
      }
      return null;
    };

    const firstButton = setupButton(
      "first",
      '[data-name="firstPage"], button[name="first"]',
    );
    const prevButton = setupButton(
      "prev",
      '[data-name="previousPage"], button[name="prev"]',
    );
    const nextButton = setupButton(
      "next",
      '[data-name="nextPage"], button[name="next"]',
    );
    const lastButton = setupButton(
      "last",
      '[data-name="lastPage"], button[name="last"]',
    );

    paginationContainer.addEventListener("click", (event) => {
      const pageRadio = event.target.closest('input[name="page"]');
      const pageLabel = event.target.closest("label.pagination-button");

      if (pageRadio || pageLabel) {
        event.preventDefault();
        event.stopPropagation();

        const radio =
          pageRadio || pageLabel?.querySelector('input[name="page"]');
        if (radio) {
          console.log("Page number clicked:", radio.value);
          radio.checked = true;

          render({
            target: radio,
            buttonName: "page",
            buttonValue: radio.value,
          });
        }
      }
    });

    const rowsPerPageSelect = paginationContainer.querySelector(
      'select[name="rowsPerPage"]',
    );
    if (rowsPerPageSelect) {
      rowsPerPageSelect.addEventListener("change", (event) => {
        console.log("Rows per page changed:", event.target.value);
        render({ target: event.target });
      });
    }

    console.log("Button setup complete. Found:", {
      first: !!firstButton,
      prev: !!prevButton,
      next: !!nextButton,
      last: !!lastButton,
    });

    await render();
  } catch (error) {
    console.error("Init error:", error);
  }
}

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

init().catch(console.error);
