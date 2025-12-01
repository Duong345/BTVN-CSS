let syncEl = null;
let input = null;
let addBtn = null;
let undoBtn = null;
let redoBtnEl = null;
let exportBtn = null;
let todoCol = null;
let inprogressCol = null;
let doneCol = null;

export function initUIRefs(refs) {
  syncEl = refs.syncEl || syncEl;
  input = refs.input || input;
  addBtn = refs.addBtn || addBtn;
  undoBtn = refs.undoBtn || undoBtn;
  redoBtnEl = refs.redoBtn || redoBtnEl;
  exportBtn = refs.exportBtn || exportBtn;
  todoCol = refs.todoCol || todoCol;
  inprogressCol = refs.inprogressCol || inprogressCol;
  doneCol = refs.doneCol || doneCol;
}

export function getColumn(status) {
  if (status === "todo") return todoCol;
  if (status === "inprogress") return inprogressCol;
  if (status === "done") return doneCol;
  return todoCol;
}

export function updateActionButtons(
  hasTasks = false,
  hasUndo = false,
  hasRedo = false
) {
  if (undoBtn) {
    undoBtn.classList.toggle("active", hasUndo);
    undoBtn.disabled = !hasUndo;
  }
  if (exportBtn) {
    exportBtn.classList.toggle("active", hasTasks);
    exportBtn.disabled = !hasTasks;
  }
  if (redoBtnEl) {
    redoBtnEl.classList.toggle("active", hasRedo);
    redoBtnEl.disabled = !hasRedo;
  }
}

export function clearColumns() {
  if (todoCol) todoCol.innerHTML = "";
  if (inprogressCol) inprogressCol.innerHTML = "";
  if (doneCol) doneCol.innerHTML = "";
}

export function createCard(item) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.setAttribute("draggable", "true");
  card.dataset.id = item.id;

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = item.title || item.name || "Untitled";

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "remove";
  editBtn.textContent = "✎";
  editBtn.title = "Edit";

  const delBtn = document.createElement("button");
  delBtn.className = "remove";
  delBtn.textContent = "✕";
  delBtn.title = "Delete";

  actions.append(editBtn, delBtn);
  card.append(title, actions);

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", String(item.id));
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => card.classList.remove("dragging"));

  return card;
}

export function renderTasks(tasks) {
  clearColumns();
  tasks.forEach((t) => {
    const card = createCard(t);
    const status = t.status || "todo";
    const col =
      status === "todo"
        ? todoCol
        : status === "inprogress"
        ? inprogressCol
        : doneCol;
    if (col) col.appendChild(card);
  });
}

export function renderTask(task) {
  const card = createCard(task);
  const col =
    task.status === "done"
      ? doneCol
      : task.status === "inprogress"
      ? inprogressCol
      : todoCol;
  if (col) col.appendChild(card);
}

export function updateTaskUI_DOMReplace(id, newCard, targetStatus) {
  const old = document.querySelector(`[data-id='${id}']`);
  const targetCol =
    targetStatus === "done"
      ? doneCol
      : targetStatus === "inprogress"
      ? inprogressCol
      : todoCol;

  if (old && old.parentElement) {
    old.parentElement.removeChild(old);
  }
  if (targetCol) targetCol.appendChild(newCard);
}
