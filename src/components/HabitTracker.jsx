import React from "react";
import { useData } from "../firebase/dataContext.jsx";
import { currentJuneDay, todayISO } from "../utils/date.js";
import { computeHabitStreak } from "../utils/plans.js";

const HABIT_GROUPS = [
  {
    title: "📖 读经",
    sub: "互相监督 · 每天",
    rows: [
      { cat: "bible-luke", name: "Luke 读经", nameClass: "luke" },
      { cat: "bible-yx", name: "Judy 读经", nameClass: "yuxin" },
    ],
  },
  {
    title: "🙏 灵修",
    sub: "互相监督 · 每天",
    rows: [
      { cat: "devo-luke", name: "Luke 灵修", nameClass: "luke" },
      { cat: "devo-yx", name: "Judy 灵修", nameClass: "yuxin" },
    ],
  },
  {
    title: "💪 运动",
    sub: "各自坚持",
    rows: [
      { cat: "sport-luke", name: "Luke 运动", nameClass: "luke" },
      { cat: "sport-yx", name: "Judy 运动", nameClass: "yuxin" },
    ],
  },
  {
    title: "🎯 个人目标",
    sub: "",
    rows: [
      { cat: "trade", name: "📈 Luke 交易计划+复盘", nameClass: "" },
      { cat: "cafe", name: "☕ 咖啡馆学习 (一起)", nameClass: "" },
      { cat: "network", name: "🤝 Judy Networking", nameClass: "" },
    ],
  },
];

export default function HabitTracker() {
  const { data, updateField } = useData();
  const habits = data.habits || {};
  const today = currentJuneDay();
  const todayStr = todayISO();

  const toggle = (key) => {
    if (habits[key]) {
      updateField(`habits.${key}`, null);
    } else {
      updateField(`habits.${key}`, true);
    }
  };

  return (
    <div className="habit-card">
      {HABIT_GROUPS.map((group) => (
        <div className="habit-group" key={group.title}>
          <div className="habit-group-title">
            {group.title}
            {group.sub && <span> {group.sub}</span>}
          </div>
          {group.rows.map((row) => {
            const streak = computeHabitStreak(habits, row.cat, today);
            const streakClass =
              streak === 0 ? "habit-streak zero" : streak >= 7 ? "habit-streak hot" : "habit-streak";

            return (
              <div className="habit-row" key={row.cat}>
                <div className={`habit-name ${row.nameClass}`}>
                  <span className={`who-dot ${row.nameClass || row.cat}`} />
                  {" " + row.name}
                  <span className={streakClass}>
                    {streak === 0 ? "—" : `🔥 ${streak}`}
                  </span>
                </div>
                <div className="habit-week" data-habit={row.cat}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const d = i + 1;
                    const ds = `2026-06-${String(d).padStart(2, "0")}`;
                    const key = `${row.cat}-${ds}`;
                    const done = habits[key] ? "done" : "";
                    const future =
                      ds > todayStr && todayStr.startsWith("2026-06") ? "future" : "";
                    return (
                      <div
                        key={d}
                        className={`habit-day ${done} ${future}`}
                        data-cat={row.cat}
                        title={ds}
                        onClick={() => toggle(key)}
                      >
                        <span className="dnum">{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
