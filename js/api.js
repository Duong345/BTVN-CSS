export const API_URL = "https://691a8a552d8d7855756f15b3.mockapi.io/users";

let pendingRequests = 0;
let syncEl = null;

export function initSyncElement(el) {
  syncEl = el;
  if (syncEl) {
    syncEl.textContent = "Synced ✓";
    syncEl.classList.remove("syncing");
  }
}

export function setSyncing(on) {
  if (on) {
    pendingRequests++;
  } else {
    pendingRequests = Math.max(0, pendingRequests - 1);
  }

  if (!syncEl) return;

  if (pendingRequests > 0) {
    syncEl.classList.add("syncing");
    syncEl.textContent = "Syncing...";
  } else {
    syncEl.classList.remove("syncing");
    syncEl.textContent = "Synced ✓";
  }
}

export async function apiFetch(url, options) {
  setSyncing(true);
  try {
    const res = await fetch(url, options);
    return res;
  } finally {
    setSyncing(false);
  }
}
