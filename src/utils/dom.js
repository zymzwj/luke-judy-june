export function byId(id) {
  return document.getElementById(id);
}

export function setTextIfPresent(id, text) {
  const el = byId(id);
  if (el) el.textContent = text;
  return el;
}

export function setDisplayIfPresent(id, value) {
  const el = byId(id);
  if (el) el.style.display = value;
  return el;
}

export function toggleClassIfPresent(id, className, force) {
  const el = byId(id);
  if (el) el.classList.toggle(className, force);
  return el;
}

export function setClassNameIfPresent(id, className) {
  const el = byId(id);
  if (el) el.className = className;
  return el;
}
