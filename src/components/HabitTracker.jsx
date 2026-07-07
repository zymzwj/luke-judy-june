import React, { useState, useEffect } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { MONTH_CONFIG } from "../firebase/config.js";
import { currentDay, todayISO, dateStr } from "../utils/date.js";
import { computeHabitStreak } from "../utils/plans.js";

const FIXED_GROUPS = [
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
];

const DEFAULT_CUSTOM = [
  { cat: "trade", name: "📈 Luke 交易计划+复盘" },
  { cat: "cafe", name: "☕ 咖啡馆学习 (一起)" },
  { cat: "network", name: "🤝 Judy Networking" },
];

function HabitRow({ row, habits, today, todayStr, toggle, editing, onDelete }) {
  const streak = computeHabitStreak(habits, row.cat, today);
  const streakClass =
    streak === 0 ? "habit-streak zero" : streak >= 7 ? "habit-streak hot" : "habit-streak";

  return (
    <div className="habit-row" key={row.cat}>
      <div className={`habit-name ${row.nameClass || ""}`}>
        <span className={`who-dot ${row.nameClass || row.cat}`} />
        {" " + row.name}
        <span className={streakClass}>
          {streak === 0 ? "—" : `🔥 ${streak}`}
        </span>
        {editing && onDelete && (
          <button className="habit-delete-btn" onClick={() => onDelete(row.cat)} title="删除">✕</button>
        )}
      </div>
      <div className="habit-week" data-habit={row.cat}>
        {Array.from({ length: MONTH_CONFIG.daysInMonth }, (_, i) => {
          const d = i + 1;
          const ds = dateStr(d);
          const key = `${row.cat}-${ds}`;
          const done = habits[key] ? "done" : "";
          const isoMonth = `${MONTH_CONFIG.year}-${String(MONTH_CONFIG.month).padStart(2, "0")}`;
          const future = ds > todayStr && todayStr.startsWith(isoMonth) ? "future" : "";
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
}

export default function HabitTracker() {
  const { data, updateField, saveField } = useData();
  const habits = data.habits || {};
  const customHabits = data.customHabits;
  const today = currentDay();
  const todayStr = todayISO();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  // Auto-seed: if customHabits is empty array and no seed flag, populate with defaults
  useEffect(() => {
    if (customHabits && customHabits.length === 0 && !data.seedsApplied?.customHabitsSeeded) {
      saveField("customHabits", DEFAULT_CUSTOM);
      updateField("seedsApplied.customHabitsSeeded", true);
    }
  }, [customHabits]);

  const toggle = (key) => {
    if (habits[key]) {
      updateField(`habits.${key}`, null);
    } else {
      updateField(`habits.${key}`, true);
    }
  };

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    const cat = "custom-" + Date.now();
    const updated = [...(customHabits || []), { cat, name }];
    saveField("customHabits", updated);
    setNewName("");
  };

  const deleteHabit = (cat) => {
    const updated = (customHabits || []).filter(h => h.cat !== cat);
    saveField("customHabits", updated);
  };

  const personalRows = (customHabits && customHabits.length > 0) ? customHabits : [];

  return (
    <div className="habit-card">
      {FIXED_GROUPS.map((group) => (
        <div className="habit-group" key={group.title}>
          <div className="habit-group-title">
            {group.title}
            {group.sub && <span> {group.sub}</span>}
          </div>
          {group.rows.map((row) => (
            <HabitRow key={row.cat} row={row} habits={habits} today={today} todayStr={todayStr} toggle={toggle} editing={false} />
          ))}
        </div>
      ))}

      {/* Editable personal goals */}
      <div className="habit-group">
        <div className="habit-group-title">
          🎯 个人目标
          <button className="habit-edit-toggle" onClick={() => setEditing(!editing)}>
            {editing ? "完成" : "编辑"}
          </button>
        </div>

        {personalRows.map((row) => (
          <HabitRow key={row.cat} row={row} habits={habits} today={today} todayStr={todayStr} toggle={toggle} editing={editing} onDelete={deleteHabit} />
        ))}

        {editing && (
          <div className="habit-add-row">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHabit()}
              placeholder="新目标名称，如：📚 每天阅读30分钟"
              className="habit-add-input"
            />
            <button className="habit-add-btn" onClick={addHabit} disabled={!newName.trim()}>添加</button>
          </div>
        )}
      </div>
    </div>
  );
}
