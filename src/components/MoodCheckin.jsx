import React from "react";
import { useData } from "../firebase/dataContext.jsx";
import { todayISO, dateStr } from "../utils/date.js";
import { MONTH_CONFIG } from "../firebase/config.js";

const MOODS = [
  { emoji: "😊", label: "开心" },
  { emoji: "🥰", label: "甜蜜" },
  { emoji: "😌", label: "平静" },
  { emoji: "💪", label: "充实" },
  { emoji: "😢", label: "想你" },
  { emoji: "😔", label: "低落" },
  { emoji: "😤", label: "烦躁" },
  { emoji: "😴", label: "疲惫" },
];

export default function MoodCheckin() {
  const { data, updateField } = useData();
  const today = todayISO();
  const checkins = data.moodCheckins || {};
  const lukeToday = checkins[`luke-${today}`];
  const judyToday = checkins[`judy-${today}`];

  const pickMood = async (person, emoji) => {
    await updateField(`moodCheckins.${person}-${today}`, {
      emoji,
      ts: new Date().toISOString(),
    });
  };

  const recentDays = [];
  for (let d = Math.min(MONTH_CONFIG.daysInMonth, new Date().getDate()); d >= 1 && recentDays.length < 7; d--) {
    const ds = dateStr(d);
    const luke = checkins[`luke-${ds}`];
    const judy = checkins[`judy-${ds}`];
    if (luke || judy) {
      recentDays.push({ date: ds, day: d, luke, judy });
    }
  }

  return (
    <div className="mood-checkin-card">
      <div className="mc-today">
        <div className="mc-person">
          <div className="mc-person-name">Luke</div>
          {lukeToday ? (
            <div className="mc-picked">{lukeToday.emoji}</div>
          ) : (
            <div className="mc-picker">
              {MOODS.map(m => (
                <button key={m.emoji} className="mc-opt" title={m.label} onClick={() => pickMood("luke", m.emoji)}>
                  {m.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mc-person">
          <div className="mc-person-name">Judy</div>
          {judyToday ? (
            <div className="mc-picked">{judyToday.emoji}</div>
          ) : (
            <div className="mc-picker">
              {MOODS.map(m => (
                <button key={m.emoji} className="mc-opt" title={m.label} onClick={() => pickMood("judy", m.emoji)}>
                  {m.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {recentDays.length > 0 && (
        <div className="mc-history">
          <div className="mc-history-title">最近心情</div>
          <div className="mc-history-grid">
            {recentDays.map(r => (
              <div key={r.date} className="mc-history-day">
                <span className="mc-day-num">{r.day}日</span>
                <span className="mc-day-mood">{r.luke?.emoji || "·"}</span>
                <span className="mc-day-mood">{r.judy?.emoji || "·"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
