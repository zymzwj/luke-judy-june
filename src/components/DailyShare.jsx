import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { todayISO } from "../utils/date.js";

export default function DailyShare() {
  const { data, updateField } = useData();
  const today = todayISO();
  const shares = data.dailyShares || {};
  const lukeShare = shares[`luke-${today}`];
  const judyShare = shares[`judy-${today}`];

  const [person, setPerson] = useState("luke");
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await updateField(`dailyShares.${person}-${today}`, {
      text: text.trim(),
      ts: new Date().toISOString(),
    });
    setText("");
  };

  const recentKeys = Object.keys(shares)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 14);

  const grouped = {};
  for (const key of recentKeys) {
    const date = key.replace(/^(luke|judy)-/, "");
    const who = key.startsWith("luke-") ? "luke" : "judy";
    if (!grouped[date]) grouped[date] = {};
    grouped[date][who] = shares[key];
  }

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="daily-share-card">
      <div className="ds-compose">
        <div className="ds-compose-who">
          <select value={person} onChange={e => setPerson(e.target.value)}>
            <option value="luke">Luke</option>
            <option value="judy">Judy</option>
          </select>
          <span className="ds-compose-hint">的今日分享</span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="今天发生了什么有趣的事？"
          rows={2}
        />
        <button className="ds-send" onClick={handleSubmit}>📸 发布</button>
      </div>

      {dates.length > 0 && (
        <div className="ds-timeline">
          {dates.map(date => {
            const day = grouped[date];
            const label = `${parseInt(date.slice(5, 7))}月${parseInt(date.slice(8))}日`;
            return (
              <div key={date} className="ds-day">
                <div className="ds-day-date">{label}</div>
                <div className="ds-day-entries">
                  {day.luke && (
                    <div className="ds-entry luke">
                      <span className="ds-entry-name">Luke</span>
                      <span className="ds-entry-text">{day.luke.text}</span>
                    </div>
                  )}
                  {day.judy && (
                    <div className="ds-entry judy">
                      <span className="ds-entry-name">Judy</span>
                      <span className="ds-entry-text">{day.judy.text}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dates.length === 0 && (
        <div className="ds-empty">还没有分享，写下今天的第一条吧 ✨</div>
      )}
    </div>
  );
}
