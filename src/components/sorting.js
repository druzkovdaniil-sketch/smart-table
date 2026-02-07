export const initSorting = (columns) => {
  return (query, state, action) => {
    if (action && action.target && action.target.tagName === "TH") {
      const field = action.target.dataset.field;
      if (!field) return query;

      const currentOrder = action.target.dataset.order || "none";
      let nextOrder = "asc";

      if (currentOrder === "asc") {
        nextOrder = "desc";
      } else if (currentOrder === "desc") {
        nextOrder = "none";
      }

      columns.forEach((col) => {
        col.dataset.order = "none";
      });

      if (nextOrder !== "none") {
        action.target.dataset.order = nextOrder;
      }
    }

    const sortColumn = Array.from(
      document.querySelectorAll("th[data-field]"),
    ).find((col) => col.dataset.order && col.dataset.order !== "none");

    if (sortColumn) {
      const field = sortColumn.dataset.field;
      const order = sortColumn.dataset.order;
      return {
        ...query,
        sort: `${field}:${order}`,
      };
    }

    return query;
  };
};
