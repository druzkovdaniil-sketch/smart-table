import { cloneTemplate } from "../lib/utils.js";

/**
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;
  const root = cloneTemplate(tableTemplate);

  if (before) {
    before.reverse().forEach((subName) => {
      root[subName] = cloneTemplate(subName);
      root.container.prepend(root[subName].container);
    });
  }

  if (after) {
    after.forEach((subName) => {
      root[subName] = cloneTemplate(subName);
      root.container.append(root[subName].container);
    });
  }

  root.container.addEventListener("change", (event) => {
    onAction(event);
  });

  root.container.addEventListener("reset", () => {
    setTimeout(() => onAction());
  });

  root.container.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Submit event triggered, button:", e.submitter?.name);
    onAction(e);
  });

  root.container.addEventListener("click", (event) => {
    if (event.target.tagName === "TH") {
      onAction(event);
    }
  });

  const render = (data) => {
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);
      Object.keys(item).forEach((key) => {
        if (key in row.elements) {
          row.elements[key].textContent = item[key];
        }
      });
      return row.container;
    });
    root.elements.rows.replaceChildren(...nextRows);
  };

  return { ...root, render };
}
