import React, { useMemo } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { currentDay, dateStr } from "../utils/date.js";
import { MONTH_CONFIG } from "../firebase/config.js";

const HABIT_CATS = [
  "bible-luke", "bible-yx", "devo-luke", "devo-yx",
  "sport-luke", "sport-yx", "trade", "cafe", "network"
];

function levelClass(count) {
  if (count === 0) return "l0";
  if (count <= 2) return "l1";
  if (count <= 4) return "l2";
  if (count <= 6) return "l3";
  if (count <= 8) return "l4";
  return "l5";
}

export default function HabitHeatmap() {
  const { data } = useData();
  const today = currentDay();
  const habits = data.habits || {};

  const cells = useMemo(() => {
    const result = [];
    for (let d = 1; d <= 31; d++) {
      const ds = dateStr(d);
      let count = 0;
      for (const cat of HABIT_CATS) {
        if (habits[`${cat}-${ds}`]) count++;
      }
      result.push({ day: d, count });
    }
    return result;
  }, [habits]);

  return (
    <div className="insight-card heatmap">
      <h4>🔥 打卡热力图</h4>
      <div className="sub">每格颜色 = 那天完成了几个打卡 / 总共可打的（9 项）</div>
      <div className="heatmap-grid">
        {cells.map((c) => (
          <div
            key={c.day}
            className={`heatmap-cell ${levelClass(c.count)}${c.day === today ? " today" : ""}`}
            title={`${MONTH_CONFIG.month}月${c.day}日: ${c.count}/${HABIT_CATS.length} 习惯`}
          >
            <span className="hm-num">{c.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
