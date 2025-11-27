const API_URL = "https://691a8a552d8d7855756f15b3.mockapi.io/users";

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

  let pendingRequests = 0;
  let history = [];
  let redoStack = [];
  let currentTasks = [];
  let isUndoing = false;

  const HISTORY_KEY = "task_history_v1";
  const REDO_KEY = "task_redo_v1";

  function saveStacks() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(REDO_KEY, JSON.stringify(redoStack));
  }

  function loadStacks() {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    const redoJson = localStorage.getItem(REDO_KEY);
    history = JSON.parse(historyJson);
    redoStack = JSON.parse(redoJson);
  }

  loadStacks();

  function setSyncing(on) {
    if (on) {
      pendingRequests++;
    } else {
      pendingRequests = Math.max(0, pendingRequests - 1);
    }

    if (pendingRequests > 0) {
      syncEl.classList.add("syncing");
      syncEl.textContent = "Syncing...";
    } else {
      syncEl.classList.remove("syncing");
      syncEl.textContent = "Synced ✓";
    }
  }

  async function apiFetch(url, options) {
    setSyncing(true);
    try {
      const res = await fetch(url, options);
      return res;
    } finally {
      setSyncing(false);
    }
  }

  function clearColumns() {
    todoCol.innerHTML = "";
    inprogressCol.innerHTML = "";
    doneCol.innerHTML = "";
  }

  function createCard(item) {
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
    editBtn.addEventListener("click", () => editTask(item));

    const delBtn = document.createElement("button");
    delBtn.className = "remove";
    delBtn.textContent = "✕";
    delBtn.title = "Delete";
    delBtn.addEventListener("click", () => deleteTask(item.id));

    actions.append(editBtn, delBtn);
    card.append(title, actions);

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", String(item.id));
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => card.classList.remove("dragging"));

    return card;
  }

  function renderTasks(tasks) {
    clearColumns();
    tasks.forEach((t) => {
      const card = createCard(t);
      const status = t.status || "todo";
      if (status === "todo") todoCol.appendChild(card);
      else if (status === "inprogress") inprogressCol.appendChild(card);
      else doneCol.appendChild(card);
    });
  }

  async function fetchTasks() {
    const res = await apiFetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    currentTasks = await res.json();
    renderTasks(currentTasks);
    updateActionButtons();
  }

  async function createTask(title) {
    const payload = { title, status: "todo" };
    const res = await apiFetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Create failed");

    const created = await res.json();
    history.push({ type: "create", item: created });
    saveStacks();
    await fetchTasks();
  }

  async function deleteTask(id) {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;

    const getRes = await apiFetch(`${API_URL}/${id}`);
    if (!getRes.ok) throw new Error("Not found");
    const item = await getRes.json();

    const res = await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");

    history.push({ type: "delete", item });
    redoStack = [];
    saveStacks();
    await fetchTasks();
  }

  async function updateTask(id, updates, skipHistory = false) {
    let before = null;
    if (!skipHistory) {
      const beforeRes = await apiFetch(`${API_URL}/${id}`);
      if (beforeRes.ok) before = await beforeRes.json();
    }

    const res = await apiFetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Update failed");

    if (!skipHistory && !isUndoing && before) {
      history.push({ type: "update", before, after: updates });
      redoStack = [];
      saveStacks();
    }
    await fetchTasks();
  }

  function editTask(item) {
    const newTitle = prompt("Sửa tiêu đề", item.title || item.name || "");
    if (newTitle !== null) {
      updateTask(item.id, { ...item, title: newTitle });
    }
  }

  addBtn.addEventListener("click", () => {
    const val = input.value.trim();
    if (!val) return;
    createTask(val);
    input.value = "";
    input.focus();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();
    }
  });

  undoBtn.addEventListener("click", undoLast);
  exportBtn.addEventListener("click", exportCSV);
  if (redoBtnEl) redoBtnEl.addEventListener("click", redoLast);

  function updateActionButtons() {
    const hasTasks = Array.isArray(currentTasks) && currentTasks.length > 0;
    const hasUndo = history.length > 0;
    const hasRedo = redoStack.length > 0;

    undoBtn.classList.toggle("active", hasUndo);
    undoBtn.disabled = !hasUndo;

    exportBtn.classList.toggle("active", hasTasks);
    exportBtn.disabled = !hasTasks;

    if (redoBtnEl) {
      redoBtnEl.classList.toggle("active", hasRedo);
      redoBtnEl.disabled = !hasRedo;
    }
  }

  async function undoLast() {
    const action = history.pop();
    isUndoing = true;

    try {
      if (action.type === "create") {
        await apiFetch(`${API_URL}/${action.item.id}`, { method: "DELETE" });
        redoStack.push({ type: "create", item: action.item });
      } else if (action.type === "delete") {
        const payload = { ...action.item };
        delete payload.id;
        const res = await apiFetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const recreated = await res.json();
          redoStack.push({ type: "delete", item: recreated });
        }
      } else if (action.type === "update") {
        await updateTask(action.before.id, action.before, true);
        redoStack.push({
          type: "update",
          before: action.before,
          after: action.after,
        });
      }

      saveStacks();
      updateActionButtons();
    } catch (err) {
      console.error(err);
      alert("Hoàn tác thất bại");
    } finally {
      isUndoing = false;
      await fetchTasks();
    }
  }

  async function redoLast() {
    if (!redoStack.length) return;

    const action = redoStack.pop();

    try {
      if (action.type === "create") {
        const payload = { ...action.item };
        delete payload.id;
        const res = await apiFetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          history.push({ type: "create", item: created });
        }
      } else if (action.type === "delete") {
        await apiFetch(`${API_URL}/${action.item.id}`, { method: "DELETE" });
        history.push({ type: "delete", item: action.item });
      } else if (action.type === "update") {
        await updateTask(action.before.id, action.after, true);
        history.push({
          type: "update",
          before: action.before,
          after: action.after,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Redo thất bại");
    } finally {
      saveStacks();
      await fetchTasks();
      updateActionButtons();
    }
  }

  function exportCSV() {
    if (!Array.isArray(currentTasks) || currentTasks.length === 0)
      return alert("Không có task để xuất");

    const keys = Array.from(new Set(currentTasks.flatMap(Object.keys)));
    const rows = [keys.join(",")];

    for (const t of currentTasks) {
      const line = keys
        .map((k) => {
          const v = t[k] == null ? "" : String(t[k]);
          return `"${v.replace(/"/g, "")}"`;
        })
        .join(",");
      rows.push(line);
    }

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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

      if ((item.status || "todo") !== targetStatus) {
        await updateTask(id, { ...item, status: targetStatus });
      }
    });
  }

  [
    [todoCol, "todo"],
    [inprogressCol, "inprogress"],
    [doneCol, "done"],
  ].forEach(([col, status]) => setupColumnDrop(col, status));

  fetchTasks();
});
