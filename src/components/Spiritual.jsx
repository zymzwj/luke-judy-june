import React, { useState, useRef, useEffect, useCallback } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { currentJuneDay } from "../utils/date.js";

function fmtDateLabel(day) {
  const d = new Date(2026, 5, day);
  const dow = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
  return `6月${day}日 · ${dow}`;
}

// ─── Prayers sub-component ────────────────────────────────────

function Prayers() {
  const { data, saveMerge } = useData();
  const prayers = Array.isArray(data.prayers) ? data.prayers : [];
  const [input, setInput] = useState("");

  const pending = prayers.filter((p) => !p.answered).length;
  const answered = prayers.filter((p) => p.answered).length;

  // Sort: pending first (most recent first within each group)
  const sorted = [...prayers].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return (b.addedAt || 0) - (a.addedAt || 0);
  });

  const handleAdd = (e) => {
    if (e.key !== "Enter") return;
    const text = input.trim();
    if (!text) return;
    const newP = { id: "p-" + Date.now(), text, addedAt: Date.now(), answered: false };
    saveMerge({ prayers: [...prayers, newP] });
    setInput("");
  };

  const toggleAnswered = (origIdx) => {
    const next = prayers.map((p, i) => {
      if (i !== origIdx) return p;
      if (p.answered) return { ...p, answered: false, answeredAt: null };
      return { ...p, answered: true, answeredAt: Date.now() };
    });
    saveMerge({ prayers: next });
  };

  const remove = (origIdx) => {
    const next = prayers.filter((_, i) => i !== origIdx);
    saveMerge({ prayers: next });
  };

  return (
    <div className="spirit-card">
      <h3>
        祷告记录{" "}
        <span className="stat">{`${pending} 等候 · ${answered} 已应允`}</span>
      </h3>
      <div className="sub">把心愿、感恩、代祷写下来；蒙应允时打勾，留下时间见证</div>
      <div className="prayer-list">
        {prayers.length === 0 ? (
          <div
            style={{
              color: "var(--muted)",
              fontStyle: "italic",
              textAlign: "center",
              padding: "14px 0",
              fontFamily: "var(--serif)",
              fontSize: "13px",
            }}
          >
            还没有祷告事项 — 在下面输入一条吧
          </div>
        ) : (
          sorted.map((p) => {
            const origIdx = prayers.indexOf(p);
            const addedDate = p.addedAt ? new Date(p.addedAt) : null;
            const ansDate = p.answeredAt ? new Date(p.answeredAt) : null;
            let meta = addedDate
              ? `加于 ${addedDate.getMonth() + 1}/${addedDate.getDate()}`
              : "";
            if (ansDate)
              meta += ` · 应允于 ${ansDate.getMonth() + 1}/${ansDate.getDate()}`;

            return (
              <div
                key={p.id || origIdx}
                className={`prayer-item${p.answered ? " answered" : ""}`}
              >
                <button
                  className="pr-chk"
                  title={p.answered ? "撤销已应允" : "标记为已应允"}
                  onClick={() => toggleAnswered(origIdx)}
                />
                <div className="pr-text">
                  {p.text}
                  <span className="pr-meta">{meta}</span>
                </div>
                <button
                  className="pr-del"
                  title="删除"
                  onClick={() => remove(origIdx)}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
      <input
        className="prayer-add"
        placeholder="+ 加一条祷告... (Enter 提交)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleAdd}
      />
    </div>
  );
}

// ─── Devotion Notes sub-component ─────────────────────────────

function DevotionNotes() {
  const { data, updateField } = useData();
  const devotionNotes = data.devotionNotes || {};
  const [devoDay, setDevoDay] = useState(() => currentJuneDay());
  const [saveStatus, setSaveStatus] = useState("—");
  const timerRef = useRef(null);

  const dateStr = `2026-06-${String(devoDay).padStart(2, "0")}`;
  const text = devotionNotes[dateStr] || "";

  // Local text state for controlled textarea with debounce
  const [localText, setLocalText] = useState(text);

  // Sync localText when devoDay changes or external data changes while not editing
  useEffect(() => {
    setLocalText(devotionNotes[dateStr] || "");
    setSaveStatus("—");
  }, [devoDay, dateStr]);

  // Also sync if remote data updates and local hasn't been edited
  useEffect(() => {
    const remoteText = devotionNotes[dateStr] || "";
    setLocalText((prev) => {
      // Only override if not mid-edit (saveStatus is "—" means idle)
      if (saveStatus === "—") return remoteText;
      return prev;
    });
  }, [devotionNotes, dateStr, saveStatus]);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setLocalText(val);
      setSaveStatus("未保存");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          if (val) {
            await updateField(`devotionNotes.${dateStr}`, val);
          } else {
            await updateField(`devotionNotes.${dateStr}`, null);
          }
          const now = new Date();
          setSaveStatus(
            `已保存 ${String(now.getHours()).padStart(2, "0")}:${String(
              now.getMinutes()
            ).padStart(2, "0")}`
          );
        } catch {
          setSaveStatus("保存失败");
        }
      }, 800);
    },
    [dateStr, updateField]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="spirit-card">
      <h3>今日灵修笔记</h3>
      <div className="devo-head">
        <button
          className="devo-nav"
          disabled={devoDay <= 1}
          onClick={() => setDevoDay((d) => d - 1)}
          title="前一天"
        >
          ‹
        </button>
        <span className="devo-date">{fmtDateLabel(devoDay)}</span>
        <button
          className="devo-nav"
          disabled={devoDay >= 30}
          onClick={() => setDevoDay((d) => d + 1)}
          title="后一天"
        >
          ›
        </button>
      </div>
      <textarea
        className="devo-text"
        placeholder="今天读到的话、领受、感谢、安静默想..."
        value={localText}
        onChange={handleChange}
      />
      <div className="devo-foot">
        <span>{localText.length} 字</span>
        <span>{saveStatus}</span>
      </div>
    </div>
  );
}

// ─── Main Spiritual component ─────────────────────────────────

export default function Spiritual() {
  return (
    <div className="spirit-grid">
      <Prayers />
      <DevotionNotes />
    </div>
  );
}
