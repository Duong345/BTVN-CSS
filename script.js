const items = document.querySelectorAll(".item");
const contents = document.querySelectorAll(".content");
let draggedItem = null;
let placeholder = document.createElement("div");
placeholder.className = "placeholder";
items.forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    draggedItem = item;
    item.classList.add("dragging");
    setTimeout(() => (item.style.display = "none"), 0);
  });
  item.addEventListener("dragend", (e) => {
    item.classList.remove("dragging");
    item.style.display = "";
    placeholder.remove();
    draggedItem = null;
  });
});
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".item:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
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
    const afterElement = getDragAfterElement(content, e.clientY);
    if (afterElement == null) {
      content.appendChild(placeholder);
    } else {
      content.insertBefore(placeholder, afterElement);
    }
  });
  content.addEventListener("dragleave", (e) => {
    if (!content.contains(e.relatedTarget)) placeholder.remove();
  });
  content.addEventListener("drop", (e) => {
    if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(draggedItem, placeholder);
      placeholder.remove();
    }
  });
});
