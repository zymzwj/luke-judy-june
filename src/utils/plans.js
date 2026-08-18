import { dayKey, dateStr } from "./date.js";
import { MONTH_CONFIG } from "../firebase/config.js";

export function getDailyItems(dailyPlans, person, day) {
  const items = dailyPlans[dayKey(person, day)] || [];
  return Array.isArray(items) ? items : [];
}

export function computeDayPoints(items) {
  if (!items || items.length === 0) return 0;
  const done = items.filter(i => i.done).length;
  const total = items.length;
  let pts = Math.round((done / total) * 10);
  if (total >= 1 && done === total) pts += 3;
  return pts;
}

export function computeMonthPoints(dailyPlans, person) {
  let total = 0;
  for (let d = 1; d <= MONTH_CONFIG.daysInMonth; d++) {
    total += computeDayPoints(getDailyItems(dailyPlans, person, d));
  }
  return total;
}

export function priorityRank(item) {
  const urgent = item.urgent ? 1 : 0;
  const important = item.important ? 1 : 0;
  if (urgent && important) return 0;
  if (important) return 1;
  if (urgent) return 2;
  return 3;
}

export function sortDailyItems(items) {
  return items
    .map((it, origIdx) => ({ it, origIdx }))
    .sort((a, b) => {
      if (a.it.done !== b.it.done) return a.it.done ? 1 : -1;
      const pr = priorityRank(a.it) - priorityRank(b.it);
      if (pr) return pr;
      return a.origIdx - b.origIdx;
    });
}

export function parseQuickAdd(raw) {
  let text = raw.trim();
  let urgent = false;
  let important = false;
  let time = "";
  let duration = 0;

  // @9:00-11:00 → time range
  const range = text.match(/@(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\b/);
  if (range) {
    const h1 = Math.max(0, Math.min(23, parseInt(range[1], 10)));
    const m1 = Math.max(0, Math.min(59, parseInt(range[2], 10)));
    const h2 = Math.max(0, Math.min(23, parseInt(range[3], 10)));
    const m2 = Math.max(0, Math.min(59, parseInt(range[4], 10)));
    time = String(h1).padStart(2, "0") + ":" + String(m1).padStart(2, "0");
    duration = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
    text = text.replace(range[0], "").trim();
  } else {
    // @9:00+90 → start time + duration in minutes
    const td = text.match(/@(\d{1,2}):(\d{2})\+(\d+)\b/);
    if (td) {
      const h = Math.max(0, Math.min(23, parseInt(td[1], 10)));
      const m = Math.max(0, Math.min(59, parseInt(td[2], 10)));
      time = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      duration = Math.max(0, parseInt(td[3], 10));
      text = text.replace(td[0], "").trim();
    } else {
      // @9:00 → start time only
      const tm = text.match(/@(\d{1,2}):(\d{2})\b/);
      if (tm) {
        const h = Math.max(0, Math.min(23, parseInt(tm[1], 10)));
        const m = Math.max(0, Math.min(59, parseInt(tm[2], 10)));
        time = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
        text = text.replace(tm[0], "").trim();
      }
    }
  }

  if (/\s!!$/.test(text)) {
    urgent = true;
    text = text.replace(/\s!!$/, "").trim();
  } else if (/\s!$/.test(text)) {
    important = true;
    text = text.replace(/\s!$/, "").trim();
  }
  return { text, urgent, important, time, duration };
}

export function sumBonuses(bonuses, person) {
  return bonuses.filter(b => b.person === person).reduce((s, b) => s + (b.pts || 0), 0);
}

export function computeHabitStreak(habits, habitCat, today) {
  let streak = 0;
  for (let d = today; d >= 1; d--) {
    const ds = dateStr(d);
    if (habits[`${habitCat}-${ds}`]) streak++;
    else break;
  }
  return streak;
}
