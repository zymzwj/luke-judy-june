import React, { useState, useEffect, useCallback } from "react";
import { useData } from "../firebase/dataContext.jsx";

const SHARE_SEEN_KEY = "lj-share-seen";

const SECTIONS = [
  { id: "sec-plan", label: "计划", icon: "📝", mobile: true },
  { id: "sec-med", label: "吃药", icon: "💊", mobile: true },
  { id: "sec-habit", label: "打卡", icon: "✅", mobile: true },
  { id: "sec-cal", label: "日历", icon: "📅", mobile: true },
  { id: "sec-share", label: "分享", icon: "📸", mobile: true },
  { id: "sec-spiritual", label: "灵命", icon: "📖" },
  { id: "sec-memory", label: "故事", icon: "💕", mobile: true },
  { id: "sec-inbox", label: "信箱", icon: "💌" },
  { id: "sec-lists", label: "清单", icon: "📋" },
  { id: "sec-bucket", label: "心愿", icon: "🎯" },
  { id: "sec-retro", label: "复盘", icon: "📊" },
  { id: "sec-timechart", label: "时间图", icon: "📈" },
];

export default function SectionNav() {
  const [activeId, setActiveId] = useState("");
  const { data } = useData();
  const shares = Array.isArray(data.dailyShares) ? data.dailyShares : [];

  const lastSeen = localStorage.getItem(SHARE_SEEN_KEY) || "";
  const hasNewShare = shares.some(s => s.ts && s.ts > lastSeen);

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
          <span className="section-nav-icon">
            {icon}
            {id === "sec-share" && hasNewShare && <span className="nav-badge" />}
          </span>
          <span className="section-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
