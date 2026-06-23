import React, { useState, useEffect, useCallback, useRef } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { currentJuneDay, todayISO } from "../utils/date.js";

const CONFETTI_COLORS = ["#c97b8f", "#8d6e9e", "#6a92b5", "#c8954d", "#87a386", "#f5d3dd", "#dfeaf3"];
const CONFETTI_COUNT = 50;

const MILESTONES = [
  {
    id: "med-21",
    check: (data) => {
      const taken = Object.keys(data.medTracker || {}).filter(
        (k) => k.startsWith("day-") && data.medTracker[k]
      ).length;
      return taken >= 21;
    },
    emoji: "💊",
    text: "21天药全打完！",
    sub: "坚持就是胜利 🎉",
  },
  {
    id: "bible-7",
    check: (data) => {
      const habits = data.habits || {};
      const today = currentJuneDay();
      let streak = 0;
      for (let d = today; d >= 1; d--) {
        const ds = `2026-06-${String(d).padStart(2, "0")}`;
        const lukeKey = `bible-luke-${ds}`;
        const judyKey = `bible-yx-${ds}`;
        if (habits[lukeKey] && habits[judyKey]) {
          streak++;
        } else break;
      }
      return streak >= 7;
    },
    emoji: "📖",
    text: "读经连续7天！",
    sub: "两人一起坚持真不容易 💕",
  },
  {
    id: "both-today",
    check: (data) => {
      const habits = data.habits || {};
      const ds = todayISO();
      const cats = ["bible-luke", "bible-yx", "devo-luke", "devo-yx"];
      return cats.every((c) => habits[`${c}-${ds}`]);
    },
    emoji: "🙏",
    text: "今天两人都全勤！",
    sub: "读经 + 灵修全部完成 ✨",
  },
];

function createConfettiPieces() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "50%" : "2px",
  }));
}

export default function Celebration() {
  const { data } = useData();
  const [show, setShow] = useState(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    const stored = sessionStorage.getItem("celebrations-fired");
    if (stored) {
      try { firedRef.current = new Set(JSON.parse(stored)); } catch {}
    }
  }, []);

  const fire = useCallback((milestone) => {
    if (firedRef.current.has(milestone.id)) return;
    firedRef.current.add(milestone.id);
    sessionStorage.setItem("celebrations-fired", JSON.stringify([...firedRef.current]));
    setShow(milestone);
    setTimeout(() => setShow(null), 3500);
  }, []);

  useEffect(() => {
    if (!data) return;
    for (const m of MILESTONES) {
      if (!firedRef.current.has(m.id) && m.check(data)) {
        fire(m);
        break;
      }
    }
  }, [data, fire]);

  if (!show) return null;

  const pieces = createConfettiPieces();

  return (
    <>
      <div className="confetti-container">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              borderRadius: p.shape,
              background: p.color,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="confetti-toast">
        <div className="toast-emoji">{show.emoji}</div>
        <div className="toast-text">{show.text}</div>
        <div className="toast-sub">{show.sub}</div>
      </div>
    </>
  );
}
