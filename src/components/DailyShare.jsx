import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { todayISO } from "../utils/date.js";

export default function DailyShare() {
  const { data, saveField } = useData();
  const today = todayISO();
  const shares = Array.isArray(data.dailyShares) ? data.dailyShares : [];

  const [person, setPerson] = useState("luke");
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const entry = {
      id: `${person}-${Date.now()}`,
      person,
      text: text.trim(),
      date: today,
      ts: new Date().toISOString(),
    };
    await saveField("dailyShares", [...shares, entry]);
    setText("");
  };

  const handleDelete = async (id) => {
    await saveField("dailyShares", shares.filter(s => s.id !== id));
  };

  const grouped = {};
  for (const s of shares) {
    const d = s.date || today;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(s);
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
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="今天发生了什么有趣的事？"
          rows={2}
        />
        <button className="ds-send" onClick={handleSubmit} disabled={!text.trim()}>发布</button>
      </div>

      {dates.length > 0 && (
        <div className="ds-timeline">
          {dates.map(date => {
            const entries = grouped[date].sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
            const label = `${parseInt(date.slice(5, 7))}月${parseInt(date.slice(8))}日`;
            return (
              <div key={date} className="ds-day">
                <div className="ds-day-date">{label}</div>
                <div className="ds-day-entries">
                  {entries.map(entry => (
                    <div key={entry.id} className={`ds-entry ${entry.person}`}>
                      <span className="ds-entry-name">{entry.person === "luke" ? "Luke" : "Judy"}</span>
                      <span className="ds-entry-text">{entry.text}</span>
                      <button className="ds-entry-del" onClick={() => handleDelete(entry.id)} title="删除">×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dates.length === 0 && (
        <div className="ds-empty">还没有分享，写下今天的第一条吧</div>
      )}
    </div>
  );
}
