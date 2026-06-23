import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";

export default function BucketList() {
  const { data, saveMerge } = useData();
  const [input, setInput] = useState("");

  const items = data.bucketList || [];

  const sorted = [
    ...items.filter((i) => !i.done),
    ...items.filter((i) => i.done)
  ];

  const doneCount = items.filter((i) => i.done).length;

  const handleAdd = async (e) => {
    if (e.key !== "Enter" || !input.trim()) return;
    const item = {
      id: Date.now().toString(),
      text: input.trim(),
      done: false,
      completedAt: null
    };
    await saveMerge({ bucketList: [...items, item] });
    setInput("");
  };

  const handleToggle = async (id) => {
    const updated = items.map((i) =>
      i.id === id
        ? {
            ...i,
            done: !i.done,
            completedAt: !i.done ? new Date().toISOString() : null
          }
        : i
    );
    await saveMerge({ bucketList: updated });
  };

  const handleDelete = async (id) => {
    const updated = items.filter((i) => i.id !== id);
    await saveMerge({ bucketList: updated });
  };

  return (
    <div className="bg-card bucket">
      <h4>🌷 共同心愿清单 <span className="meta">{doneCount} / {items.length}</span></h4>
      <div className="sub">想一起去的地方、想一起做的事、想一起尝试的菜</div>

      <div className="bucket-list">
        {sorted.length === 0 ? (
          <div className="bg-empty">还没有心愿 — 写下你们想一起做的第一件事</div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.id}
              className={`bucket-item${item.done ? " done" : ""}`}
            >
              <input
                type="checkbox"
                className="bi-chk"
                checked={item.done}
                onChange={() => handleToggle(item.id)}
              />
              <span className="bi-text">{item.text}</span>
              {item.completedAt && (
                <span className="bi-date">
                  {new Date(item.completedAt).toLocaleDateString("zh-CN")}
                </span>
              )}
              <button className="bi-del" onClick={() => handleDelete(item.id)}>
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="add-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleAdd}
          placeholder="+ 加一条心愿... (Enter 提交)"
        />
      </div>
    </div>
  );
}
