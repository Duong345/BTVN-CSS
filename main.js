const items = document.querySelectorAll(".item");
const contents = document.querySelectorAll(".content");
const containers = document.querySelectorAll(".container");
const body = document.querySelector("body");

let draggedItem = null;
let draggedContainer = null;

let itemPlaceholder = document.createElement("div");
itemPlaceholder.className = "item-placeholder";

let containerPlaceholder = document.createElement("div");
containerPlaceholder.className = "container-placeholder";

items.forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.stopPropagation();
    draggedItem = item;
    item.classList.add("dragging");
    setTimeout(() => (item.style.display = "none"), 0);
  });

  item.addEventListener("dragend", (e) => {
    item.classList.remove("dragging");
    item.style.display = "";
    draggedItem = null;
  });
});

containers.forEach((container) => {
  container.addEventListener("dragstart", (e) => {
    if (draggedItem) return;
    draggedContainer = container;
    container.classList.add("dragging");
    setTimeout(() => {
      container.style.display = "none";
    }, 0);
  });

  container.addEventListener("dragend", (e) => {
    container.classList.remove("dragging");
    container.style.display = "";
    draggedContainer = null;
  });
});

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function getDragAfterContainer(x) {
  const containerElements = [
    ...document.querySelectorAll(".container:not(.dragging)"),
  ];

  return containerElements.reduce(
    (closest, container) => {
      const box = container.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: container };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

contents.forEach((content) => {
  content.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const afterElement = getDragAfterElement(content, e.clientY);
    if (afterElement == null) {
      content.appendChild(itemPlaceholder);
    } else {
      content.insertBefore(itemPlaceholder, afterElement);
    }
  });

  content.addEventListener("dragleave", (e) => {
    if (!content.contains(e.relatedTarget)) {
      itemPlaceholder.remove();
    }
  });

  content.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    if (itemPlaceholder.parentNode) {
      itemPlaceholder.parentNode.insertBefore(draggedItem, itemPlaceholder);
      itemPlaceholder.remove();
    }
  });
});

body.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!draggedContainer) return;

  const afterElement = getDragAfterContainer(e.clientX);

  if (containerPlaceholder.parentNode) {
    containerPlaceholder.remove();
  }

  if (afterElement) {
    body.insertBefore(containerPlaceholder, afterElement);
  } else {
    body.appendChild(containerPlaceholder);
  }
});

body.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!draggedContainer) return;

  if (containerPlaceholder.parentNode) {
    containerPlaceholder.parentNode.insertBefore(
      draggedContainer,
      containerPlaceholder
    );
    containerPlaceholder.remove();
  }
});
