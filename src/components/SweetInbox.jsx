import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";

const TABS = [
  { key: "all", label: "全部" },
  { key: "unread", label: "未读" },
  { key: "luke", label: "给Luke" },
  { key: "judy", label: "给Judy" }
];

export default function SweetInbox() {
  const { data, saveMerge } = useData();
  const [tab, setTab] = useState("all");
  const [from, setFrom] = useState("Luke");
  const [to, setTo] = useState("Judy");
  const [text, setText] = useState("");

  const inbox = data.sweetInbox || [];

  const filtered = inbox
    .filter((m) => {
      if (tab === "unread") return !m.read;
      if (tab === "luke") return m.to === "Luke";
      if (tab === "judy") return m.to === "Judy";
      return true;
    })
    .sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));

  const handleFromChange = (val) => {
    setFrom(val);
    setTo(val === "Luke" ? "Judy" : "Luke");
  };

  const handleToChange = (val) => {
    setTo(val);
    setFrom(val === "Luke" ? "Judy" : "Luke");
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now().toString(),
      from,
      to,
      text: text.trim(),
      ts: new Date().toISOString(),
      read: false
    };
    await saveMerge({ sweetInbox: [...inbox, msg] });
    setText("");
  };

  const handleMarkRead = async (id) => {
    const updated = inbox.map((m) =>
      m.id === id ? { ...m, read: true } : m
    );
    await saveMerge({ sweetInbox: updated });
  };

  const handleDelete = async (id) => {
    const updated = inbox.filter((m) => m.id !== id);
    await saveMerge({ sweetInbox: updated });
  };

  const unreadCount = inbox.filter(m => !m.read).length;

  return (
    <div className="inbox-card">
      <div className="inbox-head">
        <span className="inbox-title">💌 甜话 / 夸夸 收件箱</span>
        <span className="inbox-counts">{inbox.length} 条{unreadCount > 0 ? ` · ${unreadCount} 未读` : ""}</span>
      </div>
      <div className="inbox-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`inbox-tab${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="inbox-list">
        {filtered.length === 0 && (
          <div className="memory-empty">暂无消息</div>
        )}
        {filtered.map((m) => (
          <div
            key={m.id}
            className={`inbox-msg ${m.from === "Luke" ? "from-luke" : "from-judy"}${!m.read ? " unread" : ""}`}
          >
            <div className="im-meta">
              <span className="im-from">{m.from} → {m.to}</span>
              <span>{m.ts ? new Date(m.ts).toLocaleString("zh-CN") : ""}</span>
            </div>
            <div className="im-text">{m.text}</div>
            {!m.read && (
              <button className="im-mark" onClick={() => handleMarkRead(m.id)}>
                ✓ 已读
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="inbox-compose">
        <div className="inbox-compose-row">
          <select value={from} onChange={(e) => handleFromChange(e.target.value)}>
            <option value="Luke">Luke</option>
            <option value="Judy">Judy</option>
          </select>
          <span style={{ color: "var(--muted)", fontSize: 11 }}>→</span>
          <select value={to} onChange={(e) => handleToChange(e.target.value)}>
            <option value="Luke">Luke</option>
            <option value="Judy">Judy</option>
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="想到的好的、感动的、想说的，写下来留给对方..."
          rows={2}
        />
        <button onClick={handleSend}>💕 发送</button>
      </div>
    </div>
  );
}
