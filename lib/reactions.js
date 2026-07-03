// Per-device memory of which reviews this reader has reacted to.
// localStorage only — reactions are anonymous, so this is a courtesy
// guard against double-voting, not a security boundary.

const STORAGE_KEY = 'rmhf-reactions';

function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function getReactionState(reviewId) {
  const all = readAll();
  const entry = all[reviewId] || {};
  return { helpful: !!entry.helpful, funny: !!entry.funny };
}

export function setReactionState(reviewId, type, value) {
  if (typeof window === 'undefined') return;
  try {
    const all = readAll();
    const entry = all[reviewId] || {};
    entry[type] = !!value;
    if (!entry.helpful && !entry.funny) {
      delete all[reviewId];
    } else {
      all[reviewId] = entry;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked — reaction still lands server-side.
  }
}
