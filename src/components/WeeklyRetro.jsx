import React, { useCallback, useEffect, useRef, useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { WEEKS } from "../data/calendar.js";
import { currentJuneDay, weekOfJune } from "../utils/date.js";

const FIELDS = [
  { key: "good", label: "💝 这周最暖心的瞬间", placeholder: "一段对话、一顿饭、一个拥抱..." },
  { key: "hard", label: "🥲 最大的挑战 / 没做好的", placeholder: "坦诚一些，看见就是改变的开始" },
  { key: "gratitude", label: "🌷 三件感恩的事", placeholder: "1. ...\n2. ...\n3. ..." },
  { key: "love", label: "💕 对方做了什么让你感动", placeholder: "说出来更暖" },
  { key: "next", label: "🎯 下周一起想做的", placeholder: "约会 / 一起做的事 / 想尝试的" }
];

export default function WeeklyRetro() {
  const { data, updateField } = useData();
  const today = currentJuneDay();
  const currentWeek = weekOfJune(today);
  const [weekIdx, setWeekIdx] = useState(
    WEEKS.findIndex((w) => w.id === currentWeek.id)
  );
  const [saveStatus, setSaveStatus] = useState("—");
  const timerRef = useRef(null);

  const week = WEEKS[weekIdx];
  const weekId = week.id;
  const retros = data.weeklyRetros || {};
  const [local, setLocal] = useState(() => retros[weekId] || {});

  useEffect(() => {
    setLocal(retros[weekId] || {});
  }, [weekId, retros]);

  const debouncedSave = useCallback(
    (nextLocal) => {
      setSaveStatus("编辑中...");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          await updateField(`weeklyRetros.${weekId}`, nextLocal);
          setSaveStatus("已保存");
        } catch {
          setSaveStatus("保存失败");
        }
      }, 800);
    },
    [weekId, updateField]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (key, value) => {
    const nextLocal = { ...local, [key]: value };
    setLocal(nextLocal);
    debouncedSave(nextLocal);
  };

  const totalChars = FIELDS.reduce(
    (sum, f) => sum + (local[f.key] || "").length,
    0
  );

  return (
    <div className="retro-card">
      <div className="retro-head">
        <h3>📝 本周复盘</h3>
        <div className="retro-week-nav">
          <button
            disabled={weekIdx <= 0}
            onClick={() => setWeekIdx((i) => i - 1)}
          >
            ‹
          </button>
          <span>{week.label}</span>
          <button
            disabled={weekIdx >= WEEKS.length - 1}
            onClick={() => setWeekIdx((i) => i + 1)}
          >
            ›
          </button>
        </div>
      </div>

      {FIELDS.map((f) => (
        <div className="retro-q" key={f.key}>
          <label>{f.label}</label>
          <textarea
            value={local[f.key] || ""}
            onChange={(e) => handleChange(f.key, e.target.value)}
            rows={3}
            placeholder={f.placeholder}
          />
        </div>
      ))}

      <div className="retro-foot">
        <span>{totalChars} 字</span>
        <span>{saveStatus}</span>
      </div>
    </div>
  );
}
