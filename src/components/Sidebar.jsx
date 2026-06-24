import React from "react";
import { useData } from "../firebase/dataContext.jsx";
import { computeMonthPoints, computeDayPoints, getDailyItems, sumBonuses } from "../utils/plans.js";
import { currentJuneDay } from "../utils/date.js";
import DateWidget from "./DateWidget.jsx";

const GOALS = [
  { icon: "📖", title: "读经 & 灵修", meta: "每天 · 互监督", color: "rose" },
  { icon: "💕", title: "约会", meta: "每周一次", color: "plum" },
  { icon: "☕", title: "咖啡馆学习", meta: "每周两次", color: "gold" },
  { icon: "📈", title: "交易学习", meta: "每天 · Luke", color: "sky" },
  { icon: "🤝", title: "Networking", meta: "月度 · Judy", color: "sage" },
];

const DAILY_STUDY = [
  { label: "Java 学习", target: 120, keywords: ["java"], color: "#6a92b5" },
  { label: "金融学习", target: 60, keywords: ["金融", "交易", "trading"], color: "#c8954d" },
];

export default function Sidebar({ birthdayActive }) {
  const { data } = useData();
  const today = currentJuneDay();

  const lukePts = computeMonthPoints(data.dailyPlans, "luke") + sumBonuses(data.bonuses, "luke");
  const judyPts = computeMonthPoints(data.dailyPlans, "judy") + sumBonuses(data.bonuses, "judy");

  const lukeToday = getDailyItems(data.dailyPlans, "luke", today);
  const judyToday = getDailyItems(data.dailyPlans, "judy", today);
  const lukeTodayDone = lukeToday.filter(i => i.done).length;
  const judyTodayDone = judyToday.filter(i => i.done).length;
  const lukeTodayPts = computeDayPoints(lukeToday);
  const judyTodayPts = computeDayPoints(judyToday);

  const studyProgress = DAILY_STUDY.map(goal => {
    let logged = 0;
    for (const it of lukeToday) {
      if (it.duration > 0 && goal.keywords.some(k => it.text.toLowerCase().includes(k)))
        logged += it.duration;
    }
    const pct = Math.min(100, Math.round((logged / goal.target) * 100));
    return { ...goal, logged, pct };
  });

  return (
    <aside className="sidebar" id="sidebar">
      <DateWidget
        replayActive={birthdayActive}
        replayButtonText={birthdayActive ? "🎂 关闭生日模式" : "🎂 重温生日"}
        onReplay={() => window.dispatchEvent(new CustomEvent("toggle-birthday-replay"))}
      />

      <div className="sidebar-section">
        <div className="sidebar-section-title">六月积分榜</div>
        <div className="score-panel">
          <div className="score-row luke">
            <span className="score-name luke">Luke</span>
            <span className="score-num"><span>{lukePts}</span><span className="pts">pts</span></span>
          </div>
          <div className="score-today">今日 {lukeTodayDone}/{lukeToday.length} · {lukeTodayPts} pt</div>
          <div className="score-row judy">
            <span className="score-name judy">Judy</span>
            <span className="score-num"><span>{judyPts}</span><span className="pts">pts</span></span>
          </div>
          <div className="score-today">今日 {judyTodayDone}/{judyToday.length} · {judyTodayPts} pt</div>
          <div className="score-foot">按完成度 0-10 分 · 全勤 +3</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">每日学习</div>
        <div className="study-goals">
          {studyProgress.map(s => (
            <div className="study-goal" key={s.label}>
              <div className="study-goal-head">
                <span className="study-goal-label">{s.label}</span>
                <span className="study-goal-stat">
                  {s.logged >= 60 ? `${Math.floor(s.logged / 60)}h${s.logged % 60 ? s.logged % 60 + "m" : ""}` : s.logged + "m"}
                  {" / "}
                  {s.target >= 60 ? `${s.target / 60}h` : s.target + "m"}
                </span>
              </div>
              <div className="study-goal-track">
                <div
                  className={`study-goal-fill${s.pct >= 100 ? " done" : ""}`}
                  style={{ width: `${s.pct}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">循环目标</div>
        <div className="sidebar-goals">
          {GOALS.map(g => (
            <div className={`sidegoal ${g.color}`} key={g.title}>
              <span className="sidegoal-icon">{g.icon}</span>
              <div className="sidegoal-text">
                <div className="sidegoal-title">{g.title}</div>
                <div className="sidegoal-meta">{g.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
