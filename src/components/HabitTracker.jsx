import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { MONTH_CONFIG } from "../firebase/config.js";
import { currentDay, todayISO, dateStr } from "../utils/date.js";
import { computeHabitStreak } from "../utils/plans.js";

function HabitRow({ row, habits, today, todayStr, toggle, editing, onDelete }) {
  const streak = computeHabitStreak(habits, row.cat, today);
  const streakClass =
    streak === 0 ? "habit-streak zero" : streak >= 7 ? "habit-streak hot" : "habit-streak";

  return (
    <div className="habit-row" key={row.cat}>
      <div className={`habit-name ${row.nameClass || ""}`}>
        <span className={`who-dot ${row.person || ""}`} />
        {" " + row.name}
        <span className={streakClass}>
          {streak === 0 ? "—" : `🔥 ${streak}`}
        </span>
        {editing && (
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
  const customHabits = data.customHabits || [];
  const today = currentDay();
  const todayStr = todayISO();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerson, setNewPerson] = useState("both");

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
    saveField("customHabits", [...customHabits, { cat, name, person: newPerson }]);
    setNewName("");
  };

  const deleteHabit = (cat) => {
    saveField("customHabits", customHabits.filter(h => h.cat !== cat));
  };

  const personLabel = { luke: "Luke", judy: "Judy", both: "一起" };

  return (
    <div className="habit-card">
      <div className="habit-group">
        <div className="habit-group-title">
          🎯 打卡目标
          <button className="habit-edit-toggle" onClick={() => setEditing(!editing)}>
            {editing ? "完成" : "编辑"}
          </button>
        </div>

        {customHabits.map((row) => (
          <HabitRow key={row.cat} row={row} habits={habits} today={today} todayStr={todayStr} toggle={toggle} editing={editing} onDelete={deleteHabit} />
        ))}

        {customHabits.length === 0 && !editing && (
          <div className="habit-empty">还没有打卡目标，点击「编辑」添加</div>
        )}

        {editing && (
          <div className="habit-add-row">
            <select className="habit-person-select" value={newPerson} onChange={e => setNewPerson(e.target.value)}>
              <option value="luke">Luke</option>
              <option value="judy">Judy</option>
              <option value="both">一起</option>
            </select>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addHabit()}
              placeholder="新目标，如：📚 每天阅读30分钟"
              className="habit-add-input"
            />
            <button className="habit-add-btn" onClick={addHabit} disabled={!newName.trim()}>添加</button>
          </div>
        )}
      </div>
    </div>
  );
}
