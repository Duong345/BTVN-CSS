import { API_URL, apiFetch } from "./api.js";
import {
  createCard,
  getColumn,
  updateTaskUI_DOMReplace,
  renderTasks,
  renderTask,
  clearColumns,
  updateActionButtons as uiUpdateActionButtons,
} from "./uiService.js";

export const HISTORY_KEY = "task_history_v1";
export const REDO_KEY = "task_redo_v1";

let pendingRequests = 0;
let history = [];
let redoStack = [];
export let currentTasks = [];
let isUndoing = false;

export function getHistoryLength() {
  return history.length;
}
export function getRedoLength() {
  return redoStack.length;
}
export function getCurrentTasks() {
  return currentTasks;
}

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

export async function fetchTasks() {
  const res = await apiFetch(API_URL);
  currentTasks = await res.json();
  renderTasks(currentTasks);
  uiUpdateActionButtons(
    Array.isArray(currentTasks) && currentTasks.length > 0,
    history.length > 0,
    redoStack.length > 0
  );
}

export async function createTask(title) {
  const payload = { title, status: "todo" };
  const res = await apiFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const created = await res.json();
  history.push({ type: "create", item: created });
  saveStacks();
  renderTask(created);
}

export async function deleteTask(id) {
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  const getRes = await apiFetch(`${API_URL}/${id}`);
  const item = await getRes.json();

  const res = await apiFetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");

  history.push({ type: "delete", item });
  redoStack = [];
  saveStacks();
  const el = document.querySelector(`[data-id='${id}']`);
  if (el) el.remove();
  uiUpdateActionButtons(
    Array.isArray(currentTasks) && currentTasks.length > 0,
    history.length > 0,
    redoStack.length > 0
  );
}

export async function updateTask(
  id,
  updates,
  skipHistory = false,
  skipFetch = false
) {
  let before = null;
  if (!skipHistory && !skipFetch) {
    const beforeRes = await apiFetch(`${API_URL}/${id}`);
    if (beforeRes.ok) before = await beforeRes.json();
  }

  const res = await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!skipHistory && !isUndoing && before) {
    history.push({ type: "update", before, after: updates });
    redoStack = [];
    saveStacks();
  }

  updateTaskUI(id, updates);
}

function updateTaskUI(id, updates) {
  const old = document.querySelector(`[data-id='${id}']`);

  const itemWithId = { ...updates, id: id };

  const newCard = createCard(itemWithId);

  const targetCol =
    (itemWithId.status === "done" && getColumn("done")) ||
    (itemWithId.status === "inprogress" && getColumn("inprogress")) ||
    getColumn("todo");

  if (old && old.parentElement) {
    old.remove();
  }

  if (targetCol) {
    targetCol.appendChild(newCard);
  }

  const idx = currentTasks.findIndex((t) => String(t.id) === String(id));
  if (idx >= 0) {
    currentTasks[idx] = { ...currentTasks[idx], ...updates, id: id };
  } else {
    currentTasks.push({ ...updates, id: id });
  }

  uiUpdateActionButtons(
    Array.isArray(currentTasks) && currentTasks.length > 0,
    history.length > 0,
    redoStack.length > 0
  );
}

export function editTask(item) {
  const newTitle = prompt("Sửa tiêu đề", item.title || item.name || "");
  if (newTitle !== null) {
    return updateTask(item.id, { ...item, title: newTitle });
  }
  return Promise.resolve();
}

export async function undoLast() {
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
    uiUpdateActionButtons(
      Array.isArray(currentTasks) && currentTasks.length > 0,
      history.length > 0,
      redoStack.length > 0
    );
  } catch (err) {
    console.error(err);
    alert("Hoàn tác thất bại");
  } finally {
    isUndoing = false;
    await fetchTasks();
  }
}

export async function redoLast() {
  if (!redoStack.length) return;

  const action = redoStack.pop();

  try {
    switch (action.type) {
      case "create": {
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
        break;
      }

      case "delete": {
        await apiFetch(`${API_URL}/${action.item.id}`, { method: "DELETE" });
        history.push({ type: "delete", item: action.item });
        break;
      }

      case "update": {
        await updateTask(action.before.id, action.after, true);
        history.push({
          type: "update",
          before: action.before,
          after: action.after,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(err);
    alert("Redo thất bại");
  } finally {
    saveStacks();
    await fetchTasks();
    uiUpdateActionButtons(
      Array.isArray(currentTasks) && currentTasks.length > 0,
      history.length > 0,
      redoStack.length > 0
    );
  }
}

export function exportCSV() {
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
