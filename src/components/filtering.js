export function initFiltering(elements) {
  console.log("initFiltering called with elements:", Object.keys(elements));

  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const selectElement = elements[elementName];
      if (!selectElement) {
        console.warn(`Element ${elementName} not found`);
        return;
      }
      const existingOptions = Array.from(selectElement.options);
      const emptyOption =
        existingOptions.find((opt) => opt.value === "") ||
        (() => {
          const opt = document.createElement("option");
          opt.value = "";
          opt.textContent = "—";
          return opt;
        })();

      selectElement.innerHTML = "";
      selectElement.appendChild(emptyOption);

      Object.values(indexes[elementName]).forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
      });
    });
  };

  const applyFiltering = (query, state, action) => {
    console.log("=== APPLY FILTERING ===");
    console.log(
      "Action:",
      action?.target?.name,
      "value:",
      action?.target?.value,
    );
    console.log("Available elements:", Object.keys(elements));

    if (action && action.target) {
      const name = action.target.name;
      if (
        name &&
        (name === "date" ||
          name === "customer" ||
          name === "seller" ||
          name === "totalFrom" ||
          name === "totalTo")
      ) {
        query = { ...query, page: 0 };
        console.log("Reset page to 0 because of filter:", name);
      }
    }

    const filter = {};
    if (elements.searchByDate && elements.searchByDate.value.trim()) {
      const dateValue = elements.searchByDate.value.trim();
      console.log("Date filter input:", dateValue);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const yearRegex = /^\d{4}$/;
      const yearMonthRegex = /^\d{4}-\d{2}$/;

      if (
        dateRegex.test(dateValue) ||
        yearRegex.test(dateValue) ||
        yearMonthRegex.test(dateValue)
      ) {
        filter["filter[date]"] = dateValue;
        console.log("Date filter accepted:", dateValue);
      } else {
        console.warn("Invalid date format, ignoring:", dateValue);
      }
    }

    if (elements.searchByCustomer && elements.searchByCustomer.value.trim()) {
      const customerValue = elements.searchByCustomer.value.trim();
      filter["filter[customer]"] = customerValue;
      console.log("Customer filter:", customerValue);
    }

    if (elements.searchBySeller && elements.searchBySeller.value.trim()) {
      const sellerValue = elements.searchBySeller.value.trim();
      filter["filter[seller]"] = sellerValue;
      console.log("Seller filter:", sellerValue);
    }

    if (elements.totalFrom && elements.totalFrom.value.trim()) {
      const totalFromValue = elements.totalFrom.value.trim();
      if (!isNaN(parseFloat(totalFromValue))) {
        filter["filter[totalFrom]"] = parseFloat(totalFromValue);
        console.log("Total from filter:", totalFromValue);
      }
    }

    if (elements.totalTo && elements.totalTo.value.trim()) {
      const totalToValue = elements.totalTo.value.trim();
      if (!isNaN(parseFloat(totalToValue))) {
        filter["filter[totalTo]"] = parseFloat(totalToValue);
        console.log("Total to filter:", totalToValue);
      }
    }

    console.log("Final filter object:", filter);

    return Object.keys(filter).length > 0 ? { ...query, ...filter } : query;
  };

  return { updateIndexes, applyFiltering };
}
