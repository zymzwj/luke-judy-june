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
import Spiritual from "./components/Spiritual.jsx";
import MedTracker from "./components/MedTracker.jsx";
import HabitTracker from "./components/HabitTracker.jsx";
import Planner from "./components/Planner.jsx";
import TimeChart from "./components/TimeChart.jsx";
import Calendar from "./components/Calendar.jsx";
import MemoryWall from "./components/MemoryWall.jsx";
import SweetInbox from "./components/SweetInbox.jsx";
import BucketList from "./components/BucketList.jsx";
import MonthlyGoals from "./components/MonthlyGoals.jsx";
import WeeklyRetro from "./components/WeeklyRetro.jsx";
import MonthReport from "./components/MonthReport.jsx";
import MoodChart from "./components/MoodChart.jsx";
import HabitHeatmap from "./components/HabitHeatmap.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Celebration from "./components/Celebration.jsx";
import SharedLists from "./components/SharedLists.jsx";
import DailyShare from "./components/DailyShare.jsx";
import Collapsible from "./components/Collapsible.jsx";
import { IS_CURRENT_MONTH, ACTIVE_MONTH, MONTH_CONFIG, monthUrl, prevMonthKey, nextMonthKey } from "./firebase/config.js";
import useTimeGradient from "./hooks/useTimeGradient.js";
import useScrollReveal from "./hooks/useScrollReveal.js";
import { BookIcon, HeartIcon, PenIcon, CalendarIcon, ChartIcon } from "./components/HandIcons.jsx";
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

            <Collapsible id="sec-med" title="💊 吃药打卡" desc="Medication" defaultOpen>
              <MedTracker />
            </Collapsible>

            <Collapsible id="sec-habit" title="✅ 每日打卡" desc="Daily Tracker" defaultOpen>
              <p className="section-desc">点击每个小格子标记完成。颜色代表对应的目标类别。</p>
              <HabitTracker />
            </Collapsible>

            <Collapsible id="sec-cal" title={<><CalendarIcon size={28} /> {MONTH_CONFIG.label}日历</>} desc={`${MONTH_CONFIG.labelEn} Calendar`}>
              <Calendar />
            </Collapsible>

            <Collapsible id="sec-share" title="📸 今日分享" desc="Daily Share">
              <p className="section-desc">每天分享一张照片和一句话，记录异地的日常。</p>
              <DailyShare />
            </Collapsible>

            <Collapsible id="sec-spiritual" title={<><BookIcon size={28} /> 灵命成长</>} desc="Spiritual Life">
              <p className="section-desc">祷告事项记录 + 每日灵修反思。一起在主里成长。</p>
              <Spiritual />
            </Collapsible>

            <Collapsible id="sec-memory" title={<><HeartIcon size={28} /> 我们的故事</>} desc="Memory Wall">
              <p className="section-desc">把值得记住的瞬间写下来，配一张照片更好。一年后回看是无价之宝。</p>
              <MemoryWall />
            </Collapsible>

            <Collapsible id="sec-inbox" title="💌 甜话收件箱" desc="Sweet Inbox">
              <SweetInbox />
            </Collapsible>

            <Collapsible id="sec-lists" title="📋 共同清单" desc="Shared Lists">
              <p className="section-desc">一起看的剧、一起读的书、下次见面要做的事。</p>
              <SharedLists />
            </Collapsible>

            <Collapsible id="sec-bucket" title="🎯 心愿 &amp; 月度目标" desc="Bucket List &amp; Goals">
              <div className="bg-grid">
                <BucketList />
                <MonthlyGoals />
              </div>
            </Collapsible>

            <Collapsible id="sec-retro" title={<><PenIcon size={28} /> 复盘 &amp; 月报</>} desc="Reflection &amp; Report">
              <p className="section-desc">每周日花几分钟回顾这一周，月底自动生成你俩的{MONTH_CONFIG.label}总结。</p>
              <div className="retro-grid">
                <WeeklyRetro />
                <MonthReport />
              </div>
              <div className="insights-grid">
                <MoodChart />
                <HabitHeatmap />
              </div>
            </Collapsible>

            <Collapsible id="sec-timechart" title="⏱ 用时统计" desc="Time Chart">
              <TimeChart plannerDay={plannerDay} />
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
