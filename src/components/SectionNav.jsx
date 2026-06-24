import React, { useState, useEffect, useCallback } from "react";

const SECTIONS = [
  { id: "sec-spiritual", label: "灵命成长", icon: "📖" },
  { id: "sec-med", label: "吃药打卡", icon: "💊" },
  { id: "sec-time", label: "24小时", icon: "⏳" },
  { id: "sec-habit", label: "每日打卡", icon: "✅" },
  { id: "sec-plan", label: "计划", icon: "📝" },
  { id: "sec-cal", label: "日历", icon: "📅" },
  { id: "sec-memory", label: "故事", icon: "💕" },
  { id: "sec-inbox", label: "信箱", icon: "💌" },
  { id: "sec-bucket", label: "心愿", icon: "🎯" },
  { id: "sec-retro", label: "复盘", icon: "📊" },
  { id: "sec-timechart", label: "时间图", icon: "📈" },
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
      {SECTIONS.map(({ id, label, icon }) => (
        <button
          key={id}
          className={`section-nav-item${activeId === id ? " active" : ""}`}
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
