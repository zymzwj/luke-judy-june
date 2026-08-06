import React, { useState, useEffect, useCallback } from "react";

const SECTIONS = [
  { id: "sec-plan", label: "计划", icon: "📝", mobile: true },
  { id: "sec-habit", label: "打卡", icon: "✅", mobile: true },
  { id: "sec-cal", label: "日历", icon: "📅", mobile: true },
];

export default function SectionNav() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <nav className="section-nav">
      {SECTIONS.map(({ id, label, icon, mobile }) => (
        <button
          key={id}
          className={`section-nav-item${activeId === id ? " active" : ""}${mobile ? "" : " desktop-only"}`}
          onClick={() => scrollTo(id)}
          title={label}
        >
          <span className="section-nav-icon">{icon}</span>
          <span className="section-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
