import { WEEKS } from "../data/calendar.js";

export function weekOfJune(day) {
  for (const w of WEEKS) if (day >= w.startDay && day <= w.endDay) return w;
  return WEEKS[0];
}

export function currentJuneDay(now = new Date()) {
  if (now.getFullYear() === 2026 && now.getMonth() === 5) return now.getDate();
  if (now.getFullYear() < 2026 || (now.getFullYear() === 2026 && now.getMonth() < 5)) return 1;
  return 30;
}

export function dayKey(person, day) {
  return `${person}-2026-06-${String(day).padStart(2, "0")}`;
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
  const year = today.getFullYear();
  const todayDate = new Date(year, today.getMonth(), today.getDate());
  const juneStart = new Date(year, 5, 1);
  const juneEnd = new Date(year, 5, 30);
  const dowNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  let status;
  let count;
  let progress;
  let barLabel;

  if (todayDate < juneStart) {
    const days = Math.ceil((juneStart - todayDate) / 86400000);
    status = "距六月开始";
    count = days;
    progress = 0;
    barLabel = "六月共 30 天";
  } else if (todayDate <= juneEnd) {
    const dayOfJune = today.getDate();
    const left = 30 - dayOfJune + 1;
    status = "六月还剩";
    count = left;
    progress = ((dayOfJune - 1) / 30) * 100;
    barLabel = `六月进度 ${Math.round(progress)}%`;
  } else {
    status = "六月已结束";
    count = "🎉";
    progress = 100;
    barLabel = "下次见，七月";
  }

  const bday = new Date(year, 5, 22);
  const diffDays = Math.ceil((bday - todayDate) / 86400000);
  let birthdayText;
  let birthdayClassName;

  if (diffDays === 0) {
    birthdayText = "🎂 今天是 Judy 生日！";
    birthdayClassName = "dw-bday today";
  } else if (diffDays > 0) {
    birthdayText = `🎂 距 Judy 生日 ${diffDays} 天`;
    birthdayClassName = "dw-bday" + (diffDays <= 7 ? " urgent" : "");
  } else {
    const nextBday = new Date(year + 1, 5, 22);
    const nextDiff = Math.ceil((nextBday - todayDate) / 86400000);
    birthdayText = `🎂 距 Judy 下次生日 ${nextDiff} 天`;
    birthdayClassName = "dw-bday";
  }

  return {
    todayText: `${today.getMonth() + 1}月${today.getDate()}日`,
    dowText: dowNames[today.getDay()],
    status,
    count,
    progress,
    barLabel,
    birthdayText,
    birthdayClassName
  };
}
