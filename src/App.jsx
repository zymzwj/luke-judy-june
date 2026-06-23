import React, { useState } from "react";
import { useAuth } from "./firebase/context.jsx";
import { useData } from "./firebase/dataContext.jsx";

import SignInGate from "./components/SignInGate.jsx";
import Header from "./components/Header.jsx";
import SyncStatus from "./components/SyncStatus.jsx";
import Sidebar from "./components/Sidebar.jsx";
import PixelAvatars from "./components/PixelAvatars.jsx";
import BirthdayMode, { BirthdayLetter } from "./components/BirthdayMode.jsx";
import PhotoCarousel from "./components/PhotoCarousel.jsx";
import DailyVerse from "./components/DailyVerse.jsx";
import Spiritual from "./components/Spiritual.jsx";
import MedTracker from "./components/MedTracker.jsx";
import TimeWheel from "./components/TimeWheel.jsx";
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

export default function App() {
  const { user } = useAuth();
  const { loading, syncState } = useData();
  const [plannerDay, setPlannerDay] = useState(null);
  const [birthdayActive, setBirthdayActive] = useState(false);

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
      <BirthdayMode onReplayStateChange={(state) => setBirthdayActive(state?.active || false)} />
      <SyncStatus state={syncState.state} msg={syncState.msg} />
      <Header />
      <PixelAvatars birthday={birthdayActive} />

      <div className="container" id="mainContent">
        <PhotoCarousel />
        <div className="bd-banner">🎂 今天是欣欣的生日 — Happy Birthday Judy 💕</div>
        <DailyVerse birthdayActive={birthdayActive} />
        {birthdayActive && <BirthdayLetter />}

        <div className="main-layout">
          <Sidebar birthdayActive={birthdayActive} />

          <div className="main-col">
            {/* Spiritual Growth */}
            <div className="section">
              <h2 className="section-title">🙏 灵命成长 <span className="en">Spiritual Life</span></h2>
              <p className="section-desc">祷告事项记录 + 每日灵修反思。一起在主里成长。</p>
              <Spiritual />
            </div>

            {/* Medication Tracker */}
            <div className="section">
              <MedTracker />
            </div>

            {/* Time Wheels */}
            <div className="section">
              <h2 className="section-title">⏳ 今日 24 小时 <span className="en">Time Wheel</span></h2>
              <p className="section-desc">写下今天每件事花了多少时间（不必都在今日清单里）。支持 "打游戏 1h" / "学习 2.5h" / "工作 8h30m" 这种自然写法。</p>
              <TimeWheel day={plannerDay} />
            </div>

            {/* Habit Tracker */}
            <div className="section">
              <h2 className="section-title">每日打卡 <span className="en">Daily Tracker</span></h2>
              <p className="section-desc">点击每个小格子标记完成。颜色代表对应的目标类别。</p>
              <HabitTracker />
            </div>

            {/* Weekly Plan + Daily Plan */}
            <div className="section">
              <h2 className="section-title">本周 &amp; 今日计划 <span className="en">Plans</span></h2>
              <p className="section-desc">每周一个方向，每天具体清单。打勾的每一项 +1 分，全部完成 +3 分奖励。</p>
              <Planner onDayChange={setPlannerDay} />
            </div>

            {/* Calendar */}
            <div className="section">
              <h2 className="section-title">六月日历 <span className="en">June Calendar</span></h2>
              <Calendar />
            </div>

            {/* Memory Wall */}
            <div className="section">
              <h2 className="section-title">💝 我们的故事 <span className="en">Memory Wall</span></h2>
              <p className="section-desc">把值得记住的瞬间写下来，配一张照片更好。一年后回看是无价之宝。</p>
              <MemoryWall />
            </div>

            {/* Sweet Inbox */}
            <div className="section">
              <SweetInbox />
            </div>

            {/* Bucket List + Monthly Goals */}
            <div className="section">
              <div className="bg-grid">
                <BucketList />
                <MonthlyGoals />
              </div>
            </div>

            {/* Weekly Retro + Month Report + Insights */}
            <div className="section">
              <h2 className="section-title">📝 复盘 &amp; 月报 <span className="en">Reflection &amp; Report</span></h2>
              <p className="section-desc">每周日花几分钟回顾这一周，月底自动生成你俩的六月总结。</p>
              <div className="retro-grid">
                <WeeklyRetro />
                <MonthReport />
              </div>
              <div className="insights-grid">
                <MoodChart />
                <HabitHeatmap />
              </div>
            </div>

            {/* Time Chart */}
            <div className="section">
              <TimeChart plannerDay={plannerDay} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
