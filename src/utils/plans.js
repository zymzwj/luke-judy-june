import { dayKey } from "./date.js";

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
  for (let d = 1; d <= 30; d++) {
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
  const tm = text.match(/@(\d{1,2}):(\d{2})\b/);
  if (tm) {
    const h = Math.max(0, Math.min(23, parseInt(tm[1], 10)));
    const m = Math.max(0, Math.min(59, parseInt(tm[2], 10)));
    time = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    text = text.replace(tm[0], "").trim();
  }
  if (/\s!!$/.test(text)) {
    urgent = true;
    text = text.replace(/\s!!$/, "").trim();
  } else if (/\s!$/.test(text)) {
    important = true;
    text = text.replace(/\s!$/, "").trim();
  }
  return { text, urgent, important, time };
}

export function sumBonuses(bonuses, person) {
  return bonuses.filter(b => b.person === person).reduce((s, b) => s + (b.pts || 0), 0);
}

export function computeHabitStreak(habits, habitCat, today) {
  let streak = 0;
  for (let d = today; d >= 1; d--) {
    const ds = `2026-06-${String(d).padStart(2, "0")}`;
    if (habits[`${habitCat}-${ds}`]) streak++;
    else break;
  }
  return streak;
}
