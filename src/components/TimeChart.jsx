import React, { useEffect, useRef, useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { getDailyItems } from "../utils/plans.js";
import { currentJuneDay } from "../utils/date.js";
import { WEEKS } from "../data/calendar.js";

const SCOPE_LABELS = { today: "今日", week: "本周", month: "六月" };

function rangeForScope(scope) {
  const t = currentJuneDay();
  if (scope === "today") return [t, t];
  if (scope === "week") {
    for (const w of WEEKS) if (t >= w.startDay && t <= w.endDay) return [w.startDay, w.endDay];
    return [1, 30];
  }
  return [1, 30];
}

function aggregateTaskDurations(dailyPlans, scope) {
  const [from, to] = rangeForScope(scope);
  const agg = {};
  for (let d = from; d <= to; d++) {
    for (const person of ["luke", "judy"]) {
      const items = getDailyItems(dailyPlans, person, d);
      for (const it of items) {
        if (!it.duration || it.duration <= 0) continue;
        const key = it.text.trim();
        if (!agg[key]) agg[key] = { luke: 0, judy: 0, total: 0 };
        agg[key][person] += it.duration;
        agg[key].total += it.duration;
      }
    }
  }
  return Object.entries(agg).sort((a, b) => b[1].total - a[1].total).slice(0, 12);
}

function fmtMins(v) {
  const h = Math.floor(v / 60);
  const m = v - h * 60;
  if (h > 0) return m > 0 ? `${h}h${m}m` : `${h}h`;
  return `${m}m`;
}

export default function TimeChart() {
  const { data } = useData();
  const [chartScope, setChartScope] = useState("month");
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data.dailyPlans || !canvasRef.current) return;

    const entries = aggregateTaskDurations(data.dailyPlans, chartScope);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (entries.length === 0) return;

    const labels = entries.map(([name]) => name);
    const lukeData = entries.map(([, v]) => v.luke);
    const judyData = entries.map(([, v]) => v.judy);

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Luke",
            data: lukeData,
            backgroundColor: "#6a92b5",
            borderRadius: 4,
          },
          {
            label: "Judy",
            data: judyData,
            backgroundColor: "#c97b8f",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              callback: v => v < 60 ? v + "m" : (v % 60 === 0 ? (v/60) + "h" : (v/60).toFixed(1) + "h"),
              font: { family: "Inter, sans-serif", size: 11 },
              color: "#a89a8e"
            },
            grid: { color: "rgba(168, 154, 142, 0.15)" }
          },
          y: {
            stacked: true,
            ticks: {
              font: { family: "Inter, sans-serif", size: 12 },
              color: "#2a2522"
            },
            grid: { display: false }
          },
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              font: { family: "Inter, sans-serif", size: 12 },
              color: "#6b5f57",
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                return `${ctx.dataset.label}: ${fmtMins(ctx.raw)}`;
              },
              footer(items) {
                const total = items.reduce((s, i) => s + i.raw, 0);
                return `合计 ${fmtMins(total)}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data.dailyPlans, chartScope]);

  const entries = data.dailyPlans ? aggregateTaskDurations(data.dailyPlans, chartScope) : [];
  const hasData = entries.length > 0;
  const scopeLabel = SCOPE_LABELS[chartScope];
  const metaText = `${scopeLabel}各项任务累计用时（按任务名分组），Luke 蓝 + Judy 玫瑰`;
  const containerHeight = Math.max(220, entries.length * 32 + 60) + "px";

  return (
    <div className="chart-card">
      <div className="chart-head"><h3>⏱ 用时统计 · {scopeLabel}</h3></div>
      <div className="chart-scope">
        <button className={chartScope === "today" ? "active" : ""} onClick={() => setChartScope("today")}>今日</button>
        <button className={chartScope === "week" ? "active" : ""} onClick={() => setChartScope("week")}>本周</button>
        <button className={chartScope === "month" ? "active" : ""} onClick={() => setChartScope("month")}>六月</button>
      </div>
      <p className="chart-meta">{metaText}</p>
      <div style={{ minHeight: containerHeight }}>
        <canvas ref={canvasRef} style={{ display: hasData ? "block" : "none" }} />
      </div>
      {!hasData && <div className="chart-empty">当前范围没有记录用时的任务</div>}
    </div>
  );
}
