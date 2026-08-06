import React from "react";
import { useData } from "../firebase/dataContext.jsx";
import { computeMonthPoints, computeDayPoints, getDailyItems, sumBonuses } from "../utils/plans.js";
import { currentDay } from "../utils/date.js";
import { MONTH_CONFIG } from "../firebase/config.js";
import DateWidget from "./DateWidget.jsx";

export default function Sidebar() {
  const { data } = useData();
  const today = currentDay();

  const lukePts = computeMonthPoints(data.dailyPlans, "luke") + sumBonuses(data.bonuses, "luke");
  const judyPts = computeMonthPoints(data.dailyPlans, "judy") + sumBonuses(data.bonuses, "judy");

  const lukeToday = getDailyItems(data.dailyPlans, "luke", today);
  const judyToday = getDailyItems(data.dailyPlans, "judy", today);
  const lukeTodayDone = lukeToday.filter(i => i.done).length;
  const judyTodayDone = judyToday.filter(i => i.done).length;
  const lukeTodayPts = computeDayPoints(lukeToday);
  const judyTodayPts = computeDayPoints(judyToday);

  return (
    <aside className="sidebar" id="sidebar">
      <DateWidget />

      <div className="sidebar-section">
        <div className="sidebar-section-title">{MONTH_CONFIG.label}积分榜</div>
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
    </aside>
  );
}
