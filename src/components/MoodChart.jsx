import React, { useEffect, useRef } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { MONTH_CONFIG } from "../firebase/config.js";
import { dateStr } from "../utils/date.js";

const MOOD_SCALE = {
  "😔": 1, "🥲": 2, "😴": 2, "😤": 2, "😐": 3,
  "🙂": 4, "😊": 5, "❤️": 5, "🎉": 6, "✨": 6, "😍": 6, "🥰": 7
};

const Y_LABELS = [
  { value: 1, label: "😔" },
  { value: 2, label: "🥲" },
  { value: 3, label: "😐" },
  { value: 4, label: "🙂" },
  { value: 5, label: "😊" },
  { value: 6, label: "🎉" },
  { value: 7, label: "🥰" }
];

export default function MoodChart() {
  const { data } = useData();
  const canvasRef = useRef(null);

  useEffect(() => {
    const Chart = window.Chart;
    if (!Chart || !canvasRef.current) return;

    const moods = data.moods || {};
    const labels = [];
    const values = [];

    for (let d = 1; d <= 31; d++) {
      labels.push(d);
      const ds = dateStr(d);
      const emoji = moods[ds];
      if (emoji && MOOD_SCALE[emoji] != null) {
        values.push(MOOD_SCALE[emoji]);
      } else {
        values.push(null);
      }
    }

    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "心情趋势",
          data: values,
          borderColor: "#c9a87c",
          backgroundColor: "rgba(201,168,124,0.15)",
          fill: true,
          tension: 0.3,
          spanGaps: true,
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: MONTH_CONFIG.label },
            ticks: { maxTicksLimit: 15 }
          },
          y: {
            min: 0,
            max: 7.5,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                const found = Y_LABELS.find((l) => l.value === value);
                return found ? found.label : "";
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const val = ctx.parsed.y;
                const found = Y_LABELS.reduce((closest, l) =>
                  Math.abs(l.value - val) < Math.abs(closest.value - val) ? l : closest
                );
                return `${found.label} (${val.toFixed(1)})`;
              }
            }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [data.moods]);

  return (
    <div className="insight-card mood">
      <h4>📈 心情时间趋势</h4>
      <div className="sub">每天日历上标的心情，画成 30 天折线（emoji 数字化）</div>
      <div style={{ position: "relative", height: 260 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
