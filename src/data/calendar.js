import { ACTIVE_MONTH } from "../firebase/config.js";

export const CAT_NAMES = {
  yuxin: "Judy",
  date: "约会/共同",
  luke: "Luke",
  special: "特殊日",
  growth: "成长/学习"
};

const CALENDAR_DATA = {
  june: {
    events: [
      { date: "2026-06-04", cat: "special", title: "🎂 Judy 生日", time: "", note: "" },
      { date: "2026-06-14", cat: "special", title: "💕 在一起100天", time: "", note: "" },
    ],
    weeks: [
      { id: "W1", label: "Week 1", startDay: 1,  endDay: 7  },
      { id: "W2", label: "Week 2", startDay: 8,  endDay: 14 },
      { id: "W3", label: "Week 3", startDay: 15, endDay: 21 },
      { id: "W4", label: "Week 4", startDay: 22, endDay: 28 },
      { id: "W5", label: "Week 5", startDay: 29, endDay: 30 },
    ],
  },
  july: {
    events: [
      { date: "2026-07-05", cat: "special", title: "✈️ 异地开始", time: "", note: "开始异国恋模式" },
    ],
    weeks: [
      { id: "W1", label: "Week 1", startDay: 1,  endDay: 5  },
      { id: "W2", label: "Week 2", startDay: 6,  endDay: 12 },
      { id: "W3", label: "Week 3", startDay: 13, endDay: 19 },
      { id: "W4", label: "Week 4", startDay: 20, endDay: 26 },
      { id: "W5", label: "Week 5", startDay: 27, endDay: 31 },
    ],
  },
};

const data = CALENDAR_DATA[ACTIVE_MONTH];
export const DEFAULT_EVENTS = data.events;
export const WEEKS = data.weeks;
