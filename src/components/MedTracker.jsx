import React, { useCallback, useEffect, useState } from "react";
import { db, medsDocRef, onSnapshot, setDoc, updateDoc, deleteField, getDoc, doc } from "../firebase/client.js";
import { useData } from "../firebase/dataContext.jsx";
import { daysBetween, todayDateObj } from "../utils/date.js";
import { ACTIVE_MONTH, prevMonthKey } from "../firebase/config.js";

const LEGACY_IDS = { "2026-06": "luke-judy", "2026-07": "luke-judy-july" };
function coupleIdFor(key) { return LEGACY_IDS[key] || `luke-judy-${key}`; }

export default function MedTracker() {
  const { save } = useData();
  const [meds, setMeds] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(medsDocRef, async (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setMeds({ startDate: d.startDate || "", taken: d.taken || {} });
      } else {
        const keysToTry = [ACTIVE_MONTH, prevMonthKey(ACTIVE_MONTH)];
        let migrated = null;
        for (const key of keysToTry) {
          try {
            const ref = doc(db, "couples", coupleIdFor(key));
            const monthSnap = await getDoc(ref);
            if (monthSnap.exists()) {
              const m = monthSnap.data().meds;
              if (m && m.startDate) {
                migrated = { startDate: m.startDate, taken: m.taken || {} };
                break;
              }
            }
          } catch (e) { console.warn("meds migration", e); }
        }
        await setDoc(medsDocRef, migrated || { startDate: "", taken: {} });
      }
    });
    return unsub;
  }, []);

  const saveMed = useCallback((path, value) => save(() =>
    value !== undefined && value !== null
      ? updateDoc(medsDocRef, { [path]: value })
      : updateDoc(medsDocRef, { [path]: deleteField() })
  ), [save]);

  if (!meds) return null;

  const taken = meds.taken || {};
  const today = todayDateObj();
  const hasStart = !!meds.startDate;
  const startD = hasStart ? new Date(meds.startDate + "T00:00") : null;
  const offset = hasStart ? daysBetween(startD, today) : -1;
  const currentDay = offset + 1;
  const takenCount = Object.values(taken).filter(Boolean).length;
  const pct = Math.round((takenCount / 21) * 100);

  let actionText, btnText, btnDisabled, btnDone;
  if (!hasStart) {
    actionText = "设置开始日期后开启 21 天打卡";
    btnText = "💊 今日服药";
    btnDisabled = true;
    btnDone = false;
  } else if (currentDay < 1) {
    actionText = (
      <>还有 <strong>{-offset}</strong> 天开始疗程</>
    );
    btnText = "💊 今日服药";
    btnDisabled = true;
    btnDone = false;
  } else if (currentDay > 21) {
    const allDone = takenCount === 21;
    const nextStart = new Date(startD);
    nextStart.setDate(startD.getDate() + 28);
    const daysLeft = daysBetween(today, nextStart);
    const nextDateStr = `${nextStart.getMonth() + 1}月${nextStart.getDate()}日`;

    const statusLine = allDone
      ? <strong>🎉 21 天疗程已全部完成！</strong>
      : <>疗程已结束 — 完成 <strong>{takenCount} / 21</strong></>;

    const hintLine = daysLeft > 0 ? (
      <span className="med-next-hint">💊 距下次吃药还有 <strong>{daysLeft}</strong> 天（{nextDateStr}开始）</span>
    ) : daysLeft === 0 ? (
      <span className="med-next-hint">💊 今天（{nextDateStr}）开始新的疗程啦！记得设置新的开始日期</span>
    ) : (
      <span className="med-next-hint">💊 新疗程应于 <strong>{nextDateStr}</strong> 开始，记得设置新的开始日期哦</span>
    );

    actionText = <>{statusLine}{hintLine}</>;
    btnText = allDone ? "✓ 全部完成" : "已结束";
    btnDisabled = true;
    btnDone = true;
  } else {
    const takenToday = !!taken[String(currentDay)];
    if (takenToday) {
      actionText = (
        <>💕 <strong>欣欣宝贝你真棒！是个记得吃药的好宝宝！</strong> 🥰</>
      );
      btnText = "✓ 已完成";
      btnDisabled = false;
      btnDone = true;
    } else {
      actionText = (
        <>🌷 <strong>欣欣公主今天记得吃药哦</strong> 💕</>
      );
      btnText = "💊 今日服药";
      btnDisabled = false;
      btnDone = false;
    }
  }

  const toggleCell = (day) => {
    const key = String(day);
    saveMed(`taken.${key}`, taken[key] ? null : true);
  };

  const handleTakeToday = () => {
    if (!hasStart || currentDay < 1 || currentDay > 21) return;
    const key = String(currentDay);
    saveMed(`taken.${key}`, taken[key] ? null : true);
  };

  let footerText = "点击格子可手动补打卡或撤销";
  let footerClass = "med-footer";
  if (takenCount === 21) {
    footerText = "🎉 21 天全勤！Judy 太棒了";
    footerClass = "med-footer success";
  } else if (hasStart && currentDay >= 1 && currentDay <= 21) {
    const missed = (() => {
      let m = 0;
      for (let d = 1; d <= Math.min(currentDay, 21); d++) {
        if (!taken[String(d)]) m++;
      }
      return m;
    })();
    if (missed > 0) {
      const missedNotToday = missed - (taken[String(currentDay)] ? 0 : 1);
      if (missedNotToday > 0) {
        footerText = `已完成 ${takenCount} 天 · 漏打卡 ${missedNotToday} 天 · 点格子可补打卡`;
      } else {
        footerText = "点格子可手动补打卡或撤销";
      }
    }
  }

  return (
    <div className="med-card">
      <div className="med-head">
        <div className="med-title">
          💊 Judy 的服药打卡
          <span className="med-subtitle">21 天疗程 · 每天 1 次</span>
        </div>
        <label className="med-date-input">
          开始日期
          <input
            type="date"
            min="2026-01-01"
            max="2027-12-31"
            value={meds.startDate || ""}
            onChange={(e) => saveMed("startDate", e.target.value)}
          />
        </label>
      </div>

      <div className="med-progress-row">
        <span className="med-progress-text">
          Day {hasStart ? Math.min(Math.max(currentDay, 0), 21) : 0} / 21
        </span>
        <div className="med-progress-bar">
          <div className="med-progress-fill" style={{ width: pct + "%" }} />
        </div>
        <span className="med-progress-pct">{pct}%</span>
      </div>

      <div className="med-action">
        <span className="med-action-text">{actionText}</span>
        <button
          className={`med-take-btn${btnDone ? " done" : ""}`}
          disabled={btnDisabled}
          onClick={handleTakeToday}
        >
          {btnText}
        </button>
      </div>

      <div className="med-grid">
        {!hasStart ? (
          <div style={{
            gridColumn: "1/-1", textAlign: "center", padding: "20px 0",
            color: "var(--muted)", fontStyle: "italic", fontFamily: "var(--serif)"
          }}>
            请先设置开始日期
          </div>
        ) : (
          Array.from({ length: 21 }, (_, i) => {
            const day = i + 1;
            const dayDate = new Date(startD);
            dayDate.setDate(startD.getDate() + day - 1);
            const md = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;
            const isFuture = dayDate > today;
            const isToday = daysBetween(dayDate, today) === 0;
            const isTaken = !!taken[String(day)];
            return (
              <div
                key={day}
                className={`med-cell${isTaken ? " taken" : ""}${isToday ? " today" : ""}${isFuture ? " future" : ""}`}
                onClick={() => toggleCell(day)}
              >
                <span className="md-check">✓</span>
                <div className="md-num">Day {day}</div>
                <div className="md-date">{md}</div>
              </div>
            );
          })
        )}
      </div>

      <div className={footerClass}>{footerText}</div>
    </div>
  );
}
