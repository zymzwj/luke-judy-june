import React, { useEffect, useRef, useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { getDailyItems } from "../utils/plans.js";
import { fmtHM } from "../utils/format.js";

const WHEEL_COLORS = [
  "#6a92b5", "#c97b8f", "#8d6e9e", "#c8954d", "#87a386",
  "#b56b8a", "#7a8db5", "#a08555", "#6b8e88", "#9c7a8e",
  "#d4a373", "#a59cce", "#8aa68e", "#c89191"
];

function parseTimeEntry(raw) {
  let mins = 0, working = raw.trim();
  const hMatch = working.match(/(\d+(?:\.\d+)?)\s*h\b/i);
  const mMatch = working.match(/(\d+)\s*m(?:in)?\b/i);
  const chHour = working.match(/(\d+(?:\.\d+)?)\s*小时/);
  const chMin = working.match(/(\d+)\s*分(?:钟)?/);
  if (hMatch) mins += parseFloat(hMatch[1]) * 60;
  if (mMatch) mins += parseInt(mMatch[1], 10);
  if (chHour) mins += parseFloat(chHour[1]) * 60;
  if (chMin) mins += parseInt(chMin[1], 10);
  let activity = working
    .replace(/\d+(?:\.\d+)?\s*h\b/gi, "")
    .replace(/\d+\s*m(?:in)?\b/gi, "")
    .replace(/\d+(?:\.\d+)?\s*小时/g, "")
    .replace(/\d+\s*分(?:钟)?/g, "")
    .trim();
  if (mins === 0) {
    const m = activity.match(/(\d+(?:\.\d+)?)\s*$/);
    if (m) {
      mins = parseFloat(m[1]) * 60;
      activity = activity.replace(/(\d+(?:\.\d+)?)\s*$/, "").trim();
    }
  }
  return { activity, mins: Math.round(mins) };
}

export default function TimeWheel({ day }) {
  const { data, updateField } = useData();
  const chartRefs = useRef({ luke: null, judy: null });
  const lukeCanvasRef = useRef(null);
  const judyCanvasRef = useRef(null);

  const dayISO = `2026-06-${String(day).padStart(2, "0")}`;
  const wheelKey = (person) => `${person}-${dayISO}`;

  const getManualLogs = (person) => (data.timeLogs && data.timeLogs[wheelKey(person)]) || [];

  function getMergedLogs(person) {
    const manual = getManualLogs(person);
    const manualNames = new Set(manual.map(l => l.activity.trim().toLowerCase()));
    const planItems = data.dailyPlans ? getDailyItems(data.dailyPlans, person, day) : [];
    const fromPlan = planItems
      .filter(it => it.done && it.duration > 0 && !manualNames.has(it.text.trim().toLowerCase()))
      .map(it => ({ activity: it.text.trim(), mins: it.duration, fromPlan: true }));
    return [...manual, ...fromPlan];
  }

  function buildChart(canvasRef, person) {
    const canvas = canvasRef.current;
    if (!canvas || typeof Chart === "undefined") return;

    if (chartRefs.current[person]) {
      chartRefs.current[person].destroy();
      chartRefs.current[person] = null;
    }

    const logs = getMergedLogs(person);
    const totalMins = logs.reduce((s, l) => s + l.mins, 0);
    const remainingHours = Math.max(0, (24 * 60 - totalMins) / 60);

    const dataValues = logs.map((l) => l.mins / 60);
    const colors = logs.map((_, i) => WHEEL_COLORS[i % WHEEL_COLORS.length]);
    const labels = logs.map((l) => l.activity);

    if (remainingHours > 0) {
      dataValues.push(remainingHours);
      colors.push("#ebe2d6");
      labels.push("未记录");
    }

    chartRefs.current[person] = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        cutout: "62%",
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const hours = ctx.parsed;
                const h = Math.floor(hours);
                const m = Math.round((hours - h) * 60);
                if (m === 0) return `${ctx.label}: ${h}h`;
                return `${ctx.label}: ${h}h${m}m`;
              }
            }
          }
        }
      }
    });
  }

  useEffect(() => {
    buildChart(lukeCanvasRef, "luke");
    buildChart(judyCanvasRef, "judy");

    return () => {
      if (chartRefs.current.luke) chartRefs.current.luke.destroy();
      if (chartRefs.current.judy) chartRefs.current.judy.destroy();
    };
  }, [data.timeLogs, data.dailyPlans, day]);

  function deleteEntry(person, idx) {
    const manual = getManualLogs(person);
    if (idx < manual.length) {
      updateField(`timeLogs.${wheelKey(person)}`, manual.filter((_, i) => i !== idx));
    }
  }

  function handleAdd(person) {
    return (e) => {
      if (e.key !== "Enter") return;
      const raw = e.target.value;
      if (!raw.trim()) return;
      const { activity, mins } = parseTimeEntry(raw);
      if (!activity || mins <= 0) {
        alert("没识别出来。试试格式: 打游戏 1h / 学习 2.5h / 工作 8h30m");
        return;
      }
      const manual = getManualLogs(person);
      updateField(`timeLogs.${wheelKey(person)}`, [...manual, { activity, mins }]);
      e.target.value = "";
    };
  }

  function renderWheel(person, canvasRef) {
    const logs = getMergedLogs(person);
    const manualCount = getManualLogs(person).length;
    const totalMins = logs.reduce((s, l) => s + l.mins, 0);
    const label = person === "luke" ? "Luke" : "Judy";
    const totalHours = Math.floor(totalMins / 60);

    return (
      <div className={`wheel-card ${person}`} key={person}>
        <div className="wheel-head">
          <span className={`wheel-name ${person}`}>{label}</span>
          <span className="wheel-total">已记录 {fmtHM(totalMins)} / 24h</span>
        </div>
        <div className="wheel-canvas-wrap">
          <canvas ref={canvasRef} />
          <div className="wheel-center">
            <div className="wc-hours">{totalHours}h</div>
            <div className="wc-label">已记录</div>
          </div>
        </div>
        {logs.length === 0 ? (
          <div className="wheel-empty">下面输入一条试试 — 比如 "睡觉 7h"</div>
        ) : (
          <div className="wheel-legend">
            {logs.map((l, i) => (
              <div className="wheel-legend-item" key={i}>
                <span className="wl-dot" style={{ background: WHEEL_COLORS[i % WHEEL_COLORS.length] }} />
                <span className="wl-name">{l.activity}{l.fromPlan ? " ✓" : ""}</span>
                <span className="wl-time">{fmtHM(l.mins)}</span>
                {!l.fromPlan && <button className="wl-del" onClick={() => deleteEntry(person, i)}>×</button>}
              </div>
            ))}
          </div>
        )}
        <input className="wheel-add" placeholder="例: 睡觉 7h / 工作 8h30m" onKeyDown={handleAdd(person)} />
      </div>
    );
  }

  return (
    <div className="wheel-grid">
      {renderWheel("luke", lukeCanvasRef)}
      {renderWheel("judy", judyCanvasRef)}
    </div>
  );
}
