import React, { useState } from "react";
import { useAuth } from "./firebase/context.jsx";
import { useData } from "./firebase/dataContext.jsx";

import SignInGate from "./components/SignInGate.jsx";
import Header from "./components/Header.jsx";
import SyncStatus from "./components/SyncStatus.jsx";
import Sidebar from "./components/Sidebar.jsx";
import PixelAvatars from "./components/PixelAvatars.jsx";
import PhotoCarousel from "./components/PhotoCarousel.jsx";
import DailyVerse from "./components/DailyVerse.jsx";
import HabitTracker from "./components/HabitTracker.jsx";
import Planner from "./components/Planner.jsx";
import Calendar from "./components/Calendar.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Celebration from "./components/Celebration.jsx";
import Collapsible from "./components/Collapsible.jsx";
import { IS_CURRENT_MONTH, ACTIVE_MONTH, MONTH_CONFIG, monthUrl, prevMonthKey, nextMonthKey } from "./firebase/config.js";
import useTimeGradient from "./hooks/useTimeGradient.js";
import useScrollReveal from "./hooks/useScrollReveal.js";
import { PenIcon, CalendarIcon } from "./components/HandIcons.jsx";
import SectionNav from "./components/SectionNav.jsx";

export default function App() {
  const { user } = useAuth();
  const { loading, syncState } = useData();
  const [plannerDay, setPlannerDay] = useState(null);

  useTimeGradient();
  useScrollReveal();

  if (user === undefined || (user && loading)) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "var(--serif)" }}>
        加载中...
      </div>
    );
  }

  if (!user) {
    return <SignInGate />;
  }

  return (
    <>
      {!IS_CURRENT_MONTH && (
        <div className="archive-banner">
          📂 正在查看 {MONTH_CONFIG.label} 的数据
          <a href={window.location.pathname}>← 返回本月</a>
        </div>
      )}
      <SyncStatus state={syncState.state} msg={syncState.msg} />
      <Header />
      <PixelAvatars />
      <ThemeToggle />
      <Celebration />
      <SectionNav />

      <div className="container" id="mainContent">
        <PhotoCarousel />
        <DailyVerse />

        <div className="main-layout">
          <Sidebar />

          <div className="main-col">
            <Collapsible id="sec-plan" title={<><PenIcon size={28} /> 本周 &amp; 今日计划</>} desc="Plans" defaultOpen>
              <p className="section-desc">每周一个方向，每天具体清单。打勾的每一项 +1 分，全部完成 +3 分奖励。</p>
              <Planner onDayChange={setPlannerDay} />
            </Collapsible>

            <Collapsible id="sec-habit" title="✅ 每日打卡" desc="Daily Tracker" defaultOpen>
              <p className="section-desc">点击每个小格子标记完成。颜色代表对应的目标类别。</p>
              <HabitTracker />
            </Collapsible>

            <Collapsible id="sec-cal" title={<><CalendarIcon size={28} /> {MONTH_CONFIG.label}日历</>} desc={`${MONTH_CONFIG.labelEn} Calendar`}>
              <Calendar />
            </Collapsible>

            {/* Month Navigation */}
            <div className="month-nav-footer">
              <a href={monthUrl(prevMonthKey(ACTIVE_MONTH))}>‹ 上个月</a>
              <span>{MONTH_CONFIG.year}年{MONTH_CONFIG.label}</span>
              {!IS_CURRENT_MONTH && <a href={monthUrl(nextMonthKey(ACTIVE_MONTH))}>下个月 ›</a>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
