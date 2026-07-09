import React, { useState } from "react";

const STORAGE_KEY = "lj-collapsed";

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function writeState(id, open) {
  const s = readState();
  s[id] = open;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function Collapsible({ id, title, desc, defaultOpen = false, children }) {
  const stored = readState()[id];
  const [open, setOpen] = useState(stored !== undefined ? stored : defaultOpen);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    writeState(id, next);
  };

  return (
    <div className={`section reveal collapsible ${open ? "open" : "closed"}`} id={id}>
      <button className="section-toggle" onClick={toggle} aria-expanded={open}>
        <h2 className="section-title">
          {title} <span className="en">{desc}</span>
        </h2>
        <span className="section-chevron">{open ? "−" : "+"}</span>
      </button>
      <div className="section-body">
        <div className="section-body-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
