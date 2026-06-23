export function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

export function formatDuration(mins) {
  if (!mins || mins <= 0) return "";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins - h * 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

export function fmtHM(mins) {
  if (!mins) return "0";
  const h = Math.floor(mins / 60);
  const m = mins - h * 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}
