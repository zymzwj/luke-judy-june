export const CAT_NAMES = {
  yuxin: "Judy",
  date: "约会/共同",
  luke: "Luke",
  special: "特殊日",
  growth: "成长/学习"
};

// Initial events: known commitments plus recommended date, study, and networking checkpoints.
export const DEFAULT_EVENTS = [
  // 已知事项
  { date: "2026-06-03", cat: "luke", title: "和大伟见面", time: "19:30-20:45", note: "" },
  { date: "2026-06-06", cat: "luke", title: "弟兄聚会", time: "下午", note: "" },
  { date: "2026-06-14", cat: "yuxin", title: "姐姐的 baby prayer", time: "", note: "Judy参加" },
  { date: "2026-06-20", cat: "yuxin", title: "Vanny 的 bridal shower", time: "", note: "Judy参加" },
  { date: "2026-06-22", cat: "special", title: "🎂 Judy 的生日", time: "", note: "Judy 生日 🎉" },
  { date: "2026-06-21", cat: "special", title: "🎁 Judy 生日 Party", time: "晚上", note: "提前一天的庆祝" },
  { date: "2026-06-24", cat: "yuxin", title: "💳 Judy信用卡还款日", time: "", note: "提醒还款" },
  { date: "2026-06-26", cat: "date", title: "🏖️ Ocean City (Day 1)", time: "", note: "出发" },
  { date: "2026-06-27", cat: "date", title: "🏖️ Ocean City (Day 2)", time: "", note: "" },
  { date: "2026-06-28", cat: "date", title: "🏖️ Ocean City (Day 3)", time: "", note: "返程" },
  // 每周约会 (尽量避开已知冲突)
  { date: "2026-06-07", cat: "date", title: "💕 Week 1 约会", time: "", note: "周日 - 建议晚餐 + 散步" },
  { date: "2026-06-13", cat: "date", title: "💕 Week 2 约会", time: "", note: "周六 (周日是 baby prayer)" },
  { date: "2026-06-19", cat: "date", title: "💕 Week 3 约会", time: "", note: "周五 (周末两天都被占)" },
  // Week 4 由 Ocean City 旅行覆盖
  // 咖啡馆学习 (每周二 + 周四)
  { date: "2026-06-02", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周二" },
  { date: "2026-06-04", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周四" },
  { date: "2026-06-09", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周二" },
  { date: "2026-06-11", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周四" },
  { date: "2026-06-16", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周二" },
  { date: "2026-06-18", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周四" },
  { date: "2026-06-23", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周二" },
  { date: "2026-06-25", cat: "growth", title: "☕ 咖啡馆学习", time: "", note: "周四" },
  // Networking 复盘节点 (每周一次)
  { date: "2026-06-08", cat: "yuxin", title: "🤝 Networking Week 1 复盘", time: "", note: "Luke 督促 - 本周做了几次联系/咖啡聊？" },
  { date: "2026-06-15", cat: "yuxin", title: "🤝 Networking Week 2 复盘", time: "", note: "Luke 督促" },
  { date: "2026-06-22", cat: "yuxin", title: "🤝 Networking Week 3 复盘", time: "", note: "Luke 督促" },
  { date: "2026-06-29", cat: "yuxin", title: "🤝 Networking 月度回顾", time: "", note: "Luke 督促 - 总结整月成果" }
];

// Week mapping for June 2026 (June 1 is Monday).
export const WEEKS = [
  { id: "W1", label: "Week 1", startDay: 1,  endDay: 7  },
  { id: "W2", label: "Week 2", startDay: 8,  endDay: 14 },
  { id: "W3", label: "Week 3", startDay: 15, endDay: 21 },
  { id: "W4", label: "Week 4", startDay: 22, endDay: 28 },
  { id: "W5", label: "Week 5", startDay: 29, endDay: 30 }
];
