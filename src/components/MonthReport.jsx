import React, { useMemo } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { getDailyItems, computeMonthPoints, sumBonuses } from "../utils/plans.js";
import { fmtHM } from "../utils/format.js";

const MOOD_SCALE = {
  "😔": 1, "🥲": 2, "😴": 2, "😤": 2, "😐": 3,
  "🙂": 4, "😊": 5, "❤️": 5, "🎉": 6, "✨": 6, "😍": 6, "🥰": 7
};

const HABIT_CATS = [
  "bible-luke", "bible-yx", "devo-luke", "devo-yx",
  "sport-luke", "sport-yx", "trade", "cafe", "network"
];

export default function MonthReport() {
  const { data, memories } = useData();

  const stats = useMemo(() => {
    // Task completion
    let totalDone = 0;
    let totalTotal = 0;
    for (const person of ["luke", "judy"]) {
      for (let d = 1; d <= 30; d++) {
        const items = getDailyItems(data.dailyPlans || {}, person, d);
        totalTotal += items.length;
        totalDone += items.filter((i) => i.done).length;
      }
    }
    const completionRate = totalTotal > 0
      ? Math.round((totalDone / totalTotal) * 100)
      : 0;

    // Points
    const lukePoints = computeMonthPoints(data.dailyPlans || {}, "luke") +
      sumBonuses(data.bonuses || [], "luke");
    const judyPoints = computeMonthPoints(data.dailyPlans || {}, "judy") +
      sumBonuses(data.bonuses || [], "judy");

    // Habit check-ins
    let habitCount = 0;
    const habits = data.habits || {};
    for (const cat of HABIT_CATS) {
      for (let d = 1; d <= 30; d++) {
        const ds = `2026-06-${String(d).padStart(2, "0")}`;
        if (habits[`${cat}-${ds}`]) habitCount++;
      }
    }

    // Time logged
    let totalMins = 0;
    const timeLogs = data.timeLogs || {};
    const activityCounts = {};
    for (const key of Object.keys(timeLogs)) {
      const entries = timeLogs[key];
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          totalMins += entry.mins || 0;
          if (entry.activity) {
            activityCounts[entry.activity] = (activityCounts[entry.activity] || 0) + 1;
          }
        }
      }
    }

    // Top activity
    let topActivity = "—";
    let topCount = 0;
    for (const [act, cnt] of Object.entries(activityCounts)) {
      if (cnt > topCount) { topActivity = act; topCount = cnt; }
    }

    // Answered prayers
    const answeredPrayers = (data.prayers || []).filter((p) => p.answered).length;

    // Judy med adherence
    const medsTaken = data.meds?.taken || {};
    const medDays = Object.values(medsTaken).filter(Boolean).length;
    const medRate = Math.round((medDays / 30) * 100);

    // Most common mood
    const moodCounts = {};
    const moods = data.moods || {};
    for (const key of Object.keys(moods)) {
      const emoji = moods[key];
      if (emoji) moodCounts[emoji] = (moodCounts[emoji] || 0) + 1;
    }
    let topMood = "—";
    let topMoodCount = 0;
    for (const [emoji, cnt] of Object.entries(moodCounts)) {
      if (cnt > topMoodCount) { topMood = emoji; topMoodCount = cnt; }
    }

    return {
      completionRate,
      lukePoints,
      judyPoints,
      habitCount,
      totalTime: fmtHM(totalMins),
      memoryCount: memories.length,
      answeredPrayers,
      medRate,
      topMood,
      topActivity
    };
  }, [data, memories]);

  const headline = `六月完成率 ${stats.completionRate}%，Luke ${stats.lukePoints} 分 / Judy ${stats.judyPoints} 分，共打卡 ${stats.habitCount} 次，记录 ${stats.memoryCount} 条回忆。`;

  return (
    <div className="report-card">
      <div className="report-head">
        <h3>📊 六月月报</h3>
      </div>
      <div className="report-stats">
        <Stat label="任务完成率" value={`${stats.completionRate}%`} />
        <Stat label="LUKE 积分" value={stats.lukePoints} />
        <Stat label="JUDY 积分" value={stats.judyPoints} />
        <Stat label="习惯打卡" value={`${stats.habitCount} 次`} />
        <Stat label="时间记录" value={stats.totalTime} />
        <Stat label="回忆数" value={stats.memoryCount} />
        <Stat label="已应允祷告" value={stats.answeredPrayers} />
        <Stat label="JUDY 吃药率" value={`${stats.medRate}%`} />
        <Stat label="最常见心情" value={stats.topMood} />
        <Stat label="最多活动" value={stats.topActivity} />
      </div>
      <div className="report-headline">{headline}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="report-stat">
      <div className="rs-label">{label}</div>
      <div className="rs-value">{value}</div>
    </div>
  );
}
