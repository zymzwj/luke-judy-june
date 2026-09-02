import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { MONTH_CONFIG } from "../firebase/config.js";

export default function MonthlyPlan() {
  const { data, saveMerge } = useData();
  const [input, setInput] = useState("");

  const items = data.monthlyPlan || [];
  const sorted = [...items.filter(i => !i.done), ...items.filter(i => i.done)];
  const doneCount = items.filter(i => i.done).length;

  const handleAdd = async () => {
    if (!input.trim()) return;
    const item = { id: Date.now().toString(), text: input.trim(), done: false, completedAt: null };
    await saveMerge({ monthlyPlan: [...items, item] });
    setInput("");
  };

  const handleToggle = async (id) => {
    const updated = items.map(i =>
      i.id === id ? { ...i, done: !i.done, completedAt: !i.done ? new Date().toISOString() : null } : i
    );
    await saveMerge({ monthlyPlan: updated });
  };

  const handleDelete = async (id) => {
    await saveMerge({ monthlyPlan: items.filter(i => i.id !== id) });
  };

  return (
    <div className="bg-card monthly-plan">
      <h4>📋 {MONTH_CONFIG.label}计划 <span className="meta">{doneCount}/{items.length} 完成</span></h4>
      <div className="sub">这个月要做的事，完成一项打一个勾</div>

      <div className="bucket-list">
        {sorted.length === 0 ? (
          <div className="bg-empty">还没有计划 — 写下这个月想完成的第一件事</div>
        ) : (
          sorted.map(item => (
            <div key={item.id} className={`bucket-item${item.done ? " done" : ""}`}>
              <input type="checkbox" className="bi-chk" checked={item.done} onChange={() => handleToggle(item.id)} />
              <span className="bi-text">{item.text}</span>
              {item.completedAt && <span className="bi-date">{new Date(item.completedAt).toLocaleDateString("zh-CN")}</span>}
              <button className="bi-del" onClick={() => handleDelete(item.id)}>×</button>
            </div>
          ))
        )}
      </div>

      <div className="add-row">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="+ 加一条计划..." />
        <button className="add-row-btn" onClick={handleAdd} disabled={!input.trim()}>添加</button>
      </div>
    </div>
  );
}
