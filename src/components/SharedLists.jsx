import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";

const CATEGORIES = [
  { key: "shows", label: "一起看的剧", icon: "🎬", placeholder: "剧名..." },
  { key: "books", label: "一起读的书", icon: "📚", placeholder: "书名..." },
  { key: "reunion", label: "见面要做的事", icon: "💕", placeholder: "想做的事..." },
];

export default function SharedLists() {
  const { data, saveMerge } = useData();
  const [inputs, setInputs] = useState({});
  const lists = data.sharedLists || {};

  const addItem = async (cat) => {
    const text = (inputs[cat] || "").trim();
    if (!text) return;
    const items = lists[cat] || [];
    const newItem = { id: Date.now().toString(), text, done: false, addedBy: "Luke", ts: new Date().toISOString() };
    await saveMerge({ sharedLists: { ...lists, [cat]: [...items, newItem] } });
    setInputs(prev => ({ ...prev, [cat]: "" }));
  };

  const toggleItem = async (cat, id) => {
    const items = (lists[cat] || []).map(it =>
      it.id === id ? { ...it, done: !it.done } : it
    );
    await saveMerge({ sharedLists: { ...lists, [cat]: items } });
  };

  const deleteItem = async (cat, id) => {
    const items = (lists[cat] || []).filter(it => it.id !== id);
    await saveMerge({ sharedLists: { ...lists, [cat]: items } });
  };

  return (
    <div className="shared-lists">
      {CATEGORIES.map(cat => {
        const items = lists[cat.key] || [];
        const done = items.filter(i => i.done).length;
        return (
          <div key={cat.key} className="sl-card">
            <div className="sl-head">
              <span>{cat.icon} {cat.label}</span>
              <span className="sl-count">{done}/{items.length}</span>
            </div>
            <div className="sl-items">
              {items.map(it => (
                <div key={it.id} className={`sl-item${it.done ? " done" : ""}`}>
                  <button className="sl-check" onClick={() => toggleItem(cat.key, it.id)}>
                    {it.done ? "✓" : "○"}
                  </button>
                  <span className="sl-text">{it.text}</span>
                  <button className="sl-del" onClick={() => deleteItem(cat.key, it.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="sl-add">
              <input
                type="text"
                value={inputs[cat.key] || ""}
                onChange={e => setInputs(prev => ({ ...prev, [cat.key]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addItem(cat.key)}
                placeholder={cat.placeholder}
              />
              <button onClick={() => addItem(cat.key)}>+</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
