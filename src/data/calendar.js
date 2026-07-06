import { MONTH_CONFIG, ACTIVE_MONTH } from "../firebase/config.js";

export const CAT_NAMES = {
  yuxin: "Judy",
  date: "约会/共同",
  luke: "Luke",
  special: "特殊日",
  growth: "成长/学习"
};

// ── Per-month special events (only months with notable dates get entries) ──
const EVENTS_MAP = {
  "2026-06": [
    { date: "2026-06-04", cat: "special", title: "🎂 Judy 生日", time: "", note: "" },
    { date: "2026-06-14", cat: "special", title: "💕 在一起100天", time: "", note: "" },
  ],
  "2026-07": [
    { date: "2026-07-05", cat: "special", title: "✈️ 异地开始", time: "", note: "开始异国恋模式" },
  ],
};

export const DEFAULT_EVENTS = EVENTS_MAP[ACTIVE_MONTH] || [];

// ── Auto-compute weeks from month config ──
function computeWeeks() {
  const { daysInMonth, firstDow } = MONTH_CONFIG;
  const weeks = [];
  let startDay = 1;
  let weekNum = 1;

  // First week: day 1 to end of that calendar week (Saturday)
  const daysUntilSat = (6 - firstDow + 7) % 7;
  const firstEnd = Math.min(startDay + daysUntilSat, daysInMonth);
  weeks.push({ id: `W${weekNum}`, label: `Week ${weekNum}`, startDay, endDay: firstEnd });
  startDay = firstEnd + 1;
  weekNum++;

  // Full weeks (Sun–Sat)
  while (startDay <= daysInMonth) {
    const endDay = Math.min(startDay + 6, daysInMonth);
    weeks.push({ id: `W${weekNum}`, label: `Week ${weekNum}`, startDay, endDay });
    startDay = endDay + 1;
    weekNum++;
  }

  return weeks;
}

export const WEEKS = computeWeeks();
