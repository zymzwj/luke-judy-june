import React, { useState, useRef, useEffect } from "react";

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
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(open ? "auto" : "0px");
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (open) {
      const h = bodyRef.current.scrollHeight;
      setHeight(h + "px");
      const t = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(t);
    } else {
      setHeight(bodyRef.current.scrollHeight + "px");
      requestAnimationFrame(() => requestAnimationFrame(() => setHeight("0px")));
    }
  }, [open]);

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
      <div
        className="section-body"
        ref={bodyRef}
        style={{ maxHeight: height, overflow: "hidden", transition: mounted.current ? "max-height 0.3s ease" : "none" }}
      >
        {children}
      </div>
    </div>
  );
}
