import { initSyncElement, apiFetch, API_URL } from "./api.js";
import * as Task from "./taskService.js";
import * as UI from "./uiService.js";

document.addEventListener("DOMContentLoaded", () => {
  const syncEl = document.querySelector(".sync");
  const input = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtnEl = document.getElementById("redoBtn");
  const exportBtn = document.getElementById("exportBtn");
  const todoCol = document.getElementById("todo");
  const inprogressCol = document.getElementById("inprogress");
  const doneCol = document.getElementById("done");

  initSyncElement(syncEl);

  UI.initUIRefs({
    syncEl,
    input,
    addBtn,
    undoBtn,
    redoBtn: redoBtnEl,
    exportBtn,
    todoCol,
    inprogressCol,
    doneCol,
  });

  addBtn.addEventListener("click", () => {
    const val = input.value.trim();
    Task.createTask(val);
    input.value = "";
    input.focus();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();
    }
  });

  undoBtn.addEventListener("click", () => Task.undoLast());
  exportBtn.addEventListener("click", () => Task.exportCSV());
  if (redoBtnEl) redoBtnEl.addEventListener("click", () => Task.redoLast());

  document.addEventListener("click", async (e) => {
    const clickedBtn = e.target;
    if (clickedBtn.tagName === "BUTTON" && clickedBtn.closest(".task-card")) {
      const card = clickedBtn.closest(".task-card");
      const id = card.dataset.id;
      const buttons = Array.from(card.querySelectorAll(".task-actions button"));
      const idx = buttons.indexOf(clickedBtn);
      if (idx === 0) {
        const getRes = await apiFetch(`${API_URL}/${id}`);
        if (getRes.ok) {
          const item = await getRes.json();
          await Task.editTask(item);
        }
      } else if (idx === 1) {
        await Task.deleteTask(id);
      }
    }
  });

  function setupColumnDrop(columnEl, targetStatus) {
    columnEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      columnEl.classList.add("over");
    });

    columnEl.addEventListener("dragleave", () =>
      columnEl.classList.remove("over")
    );

    columnEl.addEventListener("drop", async (e) => {
      e.preventDefault();
      columnEl.classList.remove("over");

      const id = e.dataTransfer.getData("text/plain");
      const res = await apiFetch(`${API_URL}/${id}`);
      const item = await res.json();

      const currentStatus = item.status || "todo";
      if (currentStatus !== targetStatus) {
        await Task.updateTask(id, { ...item, status: targetStatus });
      }
    });
  }

  [
    [todoCol, "todo"],
    [inprogressCol, "inprogress"],
    [doneCol, "done"],
  ].forEach(([col, status]) => setupColumnDrop(col, status));

  Task.fetchTasks();
});
