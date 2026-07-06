import { WEEKS } from "../data/calendar.js";
import { MONTH_CONFIG, LDR } from "../firebase/config.js";

const { year: YEAR, month: MONTH, daysInMonth: DAYS } = MONTH_CONFIG;

export function weekOf(day) {
  for (const w of WEEKS) if (day >= w.startDay && day <= w.endDay) return w;
  return WEEKS[0];
}

export function currentDay(now = new Date()) {
  if (now.getFullYear() === YEAR && now.getMonth() === MONTH - 1) return now.getDate();
  if (now < new Date(YEAR, MONTH - 1, 1)) return 1;
  return DAYS;
}

export function dayKey(person, day) {
  return `${person}-${YEAR}-${String(MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dateStr(d) {
  return `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function daysBetween(d1, d2) {
  const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((b - a) / 86400000);
}

export function todayDateObj(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

export function getDateWidgetState(today = new Date()) {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthStart = new Date(YEAR, MONTH - 1, 1);
  const monthEnd = new Date(YEAR, MONTH - 1, DAYS);
  const dowNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  let status, count, progress, barLabel;

  if (todayDate < monthStart) {
    const days = Math.ceil((monthStart - todayDate) / 86400000);
    status = `距${MONTH_CONFIG.label}开始`;
    count = days;
    progress = 0;
    barLabel = `${MONTH_CONFIG.label}共 ${DAYS} 天`;
  } else if (todayDate <= monthEnd) {
    const dayOfMonth = today.getDate();
    const left = DAYS - dayOfMonth + 1;
    status = `${MONTH_CONFIG.label}还剩`;
    count = left;
    progress = ((dayOfMonth - 1) / DAYS) * 100;
    barLabel = `${MONTH_CONFIG.label}进度 ${Math.round(progress)}%`;
  } else {
    status = `${MONTH_CONFIG.label}已结束`;
    count = "🎉";
    progress = 100;
    barLabel = "下个月见";
  }

  let ldrText = null, ldrClassName = null, reunionText = null;
  if (LDR) {
    const sepDate = new Date(LDR.separationDate + "T00:00");
    const sepDays = Math.ceil((todayDate - sepDate) / 86400000);
    if (sepDays < 0) {
      ldrText = `✈️ 距异地开始还有 ${-sepDays} 天`;
      ldrClassName = "dw-ldr";
    } else if (sepDays === 0) {
      ldrText = "✈️ 今天开始异地…要加油！";
      ldrClassName = "dw-ldr today";
    } else {
      ldrText = `✈️ 异地第 ${sepDays + 1} 天`;
      ldrClassName = "dw-ldr";
    }
    if (LDR.reunionDate) {
      const reunionDate = new Date(LDR.reunionDate + "T00:00");
      const reunionDays = Math.ceil((reunionDate - todayDate) / 86400000);
      if (reunionDays > 0) {
        reunionText = `💕 距下次见面 ${reunionDays} 天`;
      } else if (reunionDays === 0) {
        reunionText = "💕 今天见面！";
      }
    }
  }

  return {
    todayText: `${today.getMonth() + 1}月${today.getDate()}日`,
    dowText: dowNames[today.getDay()],
    status,
    count,
    progress,
    barLabel,
    ldrText,
    ldrClassName,
    reunionText,
  };
}
