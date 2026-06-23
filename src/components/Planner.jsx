import React, { useState, useEffect, useRef, useCallback } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { currentJuneDay, dayKey, weekOfJune } from "../utils/date.js";
import {
  getDailyItems,
  sortDailyItems,
  parseQuickAdd,
  computeDayPoints,
  computeMonthPoints,
  sumBonuses,
} from "../utils/plans.js";
import { formatDuration } from "../utils/format.js";
import { WEEKS } from "../data/calendar.js";

const DOW_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const PEOPLE = ["luke", "judy"];
const PERSON_LABEL = { luke: "Luke", judy: "Judy" };

const DUR_PRESETS = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "1h", value: 60 },
  { label: "1.5h", value: 90 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
];

export default function Planner({ onDayChange }) {
  const { data, updateField, saveField } = useData();

  // ── Weekly state ──
  const today = currentJuneDay();
  const currentWeek = weekOfJune(today);
  const [plannerWeekIdx, setPlannerWeekIdx] = useState(() =>
    Math.max(0, WEEKS.findIndex((w) => w.id === currentWeek.id))
  );
  const week = WEEKS[plannerWeekIdx];
  const isCurrentWeek = week.id === currentWeek.id;

  const [weekText, setWeekText] = useState("");
  const [weekSaving, setWeekSaving] = useState(false);
  const debounceRef = useRef(null);

  // Sync weekText from data when week changes
  useEffect(() => {
    setWeekText(data.weeklyPlans[week.id] || "");
  }, [plannerWeekIdx, data.weeklyPlans, week.id]);

  // Debounced save for weekly plan
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Skip the initial render — only save after user edits
    const savedText = data.weeklyPlans[week.id] || "";
    if (weekText === savedText) return;

    debounceRef.current = setTimeout(async () => {
      setWeekSaving(true);
      try {
        await updateField(`weeklyPlans.${week.id}`, weekText);
      } finally {
        setWeekSaving(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [weekText]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Daily state ──
  const [plannerDay, setPlannerDay] = useState(today);
  const dow = DOW_NAMES[new Date(2026, 5, plannerDay).getDay()];
  const isToday = plannerDay === today;

  useEffect(() => {
    if (onDayChange) onDayChange(plannerDay);
  }, [plannerDay, onDayChange]);

  // ── Quick-add inputs ──
  const [quickAdd, setQuickAdd] = useState({ luke: "", judy: "" });

  // ── Postpone menu state ──
  const [postponeCtx, setPostponeCtx] = useState(null);
  const postponeRef = useRef(null);

  // ── Duration popup state ──
  const [durCtx, setDurCtx] = useState(null);
  const [customDur, setCustomDur] = useState("");
  const durRef = useRef(null);

  // Close popups on outside click
  useEffect(() => {
    function handleClick(e) {
      if (postponeCtx && postponeRef.current && !postponeRef.current.contains(e.target)) {
        setPostponeCtx(null);
      }
      if (durCtx && durRef.current && !durRef.current.contains(e.target)) {
        setDurCtx(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [postponeCtx, durCtx]);

  // ── Helpers ──
  const commitDayItems = useCallback(
    (person, day, items) => {
      updateField(`dailyPlans.${dayKey(person, day)}`, items);
    },
    [updateField]
  );

  const getItems = useCallback(
    (person) => getDailyItems(data.dailyPlans, person, plannerDay),
    [data.dailyPlans, plannerDay]
  );

  const toggleDone = (person, idx) => {
    const items = [...getItems(person)];
    items[idx] = { ...items[idx], done: !items[idx].done };
    commitDayItems(person, plannerDay, items);
  };

  const toggleFlag = (person, idx, flag) => {
    const items = [...getItems(person)];
    items[idx] = { ...items[idx], [flag]: !items[idx][flag] };
    commitDayItems(person, plannerDay, items);
  };

  const deleteItem = (person, idx) => {
    const items = [...getItems(person)];
    items.splice(idx, 1);
    commitDayItems(person, plannerDay, items);
  };

  const handleQuickAdd = (person) => {
    const raw = quickAdd[person];
    if (!raw.trim()) return;
    const parsed = parseQuickAdd(raw);
    if (!parsed.text) return;
    const item = {
      text: parsed.text,
      done: false,
      urgent: parsed.urgent,
      important: parsed.important,
      time: parsed.time || "",
      duration: 0,
    };
    const items = [...getItems(person), item];
    commitDayItems(person, plannerDay, items);
    setQuickAdd((prev) => ({ ...prev, [person]: "" }));
  };

  const handlePostpone = async (targetDay) => {
    if (!postponeCtx || targetDay < 1 || targetDay > 30) return;
    const { person, idx } = postponeCtx;
    const srcItems = [...getItems(person)];
    const [moved] = srcItems.splice(idx, 1);
    moved.done = false;
    const dstItems = [...getDailyItems(data.dailyPlans, person, targetDay), moved];
    await updateField(`dailyPlans.${dayKey(person, plannerDay)}`, srcItems);
    await updateField(`dailyPlans.${dayKey(person, targetDay)}`, dstItems);
    setPostponeCtx(null);
  };

  const handleDurSave = (value) => {
    if (!durCtx) return;
    const { person, idx } = durCtx;
    const items = [...getItems(person)];
    if (value && value > 0) {
      items[idx] = { ...items[idx], duration: Math.round(value) };
    } else {
      const { duration, ...rest } = items[idx];
      items[idx] = rest;
    }
    commitDayItems(person, plannerDay, items);
    setDurCtx(null);
    setCustomDur("");
  };

  // ── Bonus manager (matches legacy prompt-based flow) ──
  const openBonusManager = () => {
    const bonuses = Array.isArray(data.bonuses) ? data.bonuses : [];
    const list = bonuses.length === 0
      ? "（还没有奖励）"
      : bonuses.map((b) =>
          `${b.person === "luke" ? "Luke" : "Judy"} · +${b.pts} · ${b.reason}`
        ).join("\n");

    const choice = prompt(
      `当前奖励：\n${list}\n\n` +
      `输入新奖励（格式: 人名 分数 理由）\n` +
      `例如: Judy 50 帮我做了饭\n\n` +
      `或者输入"删除N"删除第N条（从1开始），取消请关闭`
    );
    if (!choice) return;
    const trimmed = choice.trim();

    // Handle delete command
    const delMatch = trimmed.match(/^删除\s*(\d+)$/);
    if (delMatch) {
      const idx = parseInt(delMatch[1], 10) - 1;
      if (idx < 0 || idx >= bonuses.length) { alert("索引超出范围"); return; }
      if (!confirm(`确认删除：${bonuses[idx].reason} (+${bonuses[idx].pts}) ?`)) return;
      const next = bonuses.filter((_, i) => i !== idx);
      saveField("bonuses", next);
      return;
    }

    // Parse: <person> <pts> <reason...>
    const m = trimmed.match(/^(luke|judy|Luke|Judy|路克|朱迪|欣欣)\s+(-?\d+)\s+(.+)$/);
    if (!m) { alert("格式不对，请重试：人名 分数 理由"); return; }
    let person = m[1].toLowerCase();
    if (person === "路克") person = "luke";
    if (person === "朱迪" || person === "欣欣") person = "judy";
    const pts = parseInt(m[2], 10);
    const reason = m[3].trim();
    const newBonus = { id: `manual-${Date.now()}`, person, pts, reason, at: Date.now() };
    const next = [...bonuses, newBonus];
    saveField("bonuses", next);
  };

  // ── Render helpers ──
  const renderPersonColumn = (person) => {
    const rawItems = getItems(person);
    const sorted = sortDailyItems(rawItems);
    const doneCount = rawItems.filter((i) => i.done).length;
    const totalCount = rawItems.length;
    const totalDuration = rawItems.reduce((s, i) => s + (i.duration || 0), 0);
    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const allDone = totalCount >= 3 && doneCount === totalCount;

    return (
      <div className={`today-card ${person}`} key={person}>
        <div className="today-head">
          <span className={`today-name ${person}`}>{PERSON_LABEL[person]}</span>
          <span className="today-progress-text">{doneCount}/{totalCount}</span>
        </div>
        <div className="today-bar">
          <div className="today-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        {/* Checklist */}
        <div className="today-items">
          {sorted.length === 0 && <div className="today-empty">还没有事项 — 在下面输入框加一条吧</div>}
          {sorted.map(({ it, origIdx }) => {
            const dur = it.duration || 0;
            const durLabel = dur > 0 ? `⏱ ${formatDuration(dur)}` : "⏱";
            return (
              <div
                key={origIdx}
                className={`today-item${it.done ? " done" : ""}${it.time ? " has-time" : ""}`}
              >
                <button
                  className="chk"
                  onClick={() => toggleDone(person, origIdx)}
                  aria-label={it.done ? "取消完成" : "标记完成"}
                />
                {it.time && <span className="today-time">⏰ {it.time}</span>}
                <span className="today-item-text">{it.text}</span>
                <span className="prio-row">
                  <button
                    className={`prio-flag urgent${it.urgent ? " active" : ""}`}
                    onClick={() => toggleFlag(person, origIdx, "urgent")}
                  >
                    急
                  </button>
                  <button
                    className={`prio-flag important${it.important ? " active" : ""}`}
                    onClick={() => toggleFlag(person, origIdx, "important")}
                  >
                    要
                  </button>
                  <button
                    className={`dur-chip${dur > 0 ? " set" : ""}`}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDurCtx({ person, idx: origIdx, anchorRect: rect });
                      setCustomDur(dur > 0 ? String(dur) : "");
                    }}
                  >
                    {durLabel}
                  </button>
                </span>
                <button
                  className="today-item-more"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPostponeCtx({ person, idx: origIdx, anchorRect: rect });
                  }}
                >
                  ⋯
                </button>
                <button className="today-item-del" onClick={() => deleteItem(person, origIdx)}>
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {allDone && <div className="today-bonus">🎉 今日全部完成 · +3 分奖励</div>}

        {/* Quick-add */}
        <input
          className="today-add"
          type="text"
          placeholder={`给${PERSON_LABEL[person]}添加任务…`}
          value={quickAdd[person]}
          onChange={(e) => setQuickAdd((prev) => ({ ...prev, [person]: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd(person);
          }}
        />
      </div>
    );
  };

  // ── Scores ──
  const renderScores = () => {
    const bonuses = Array.isArray(data.bonuses) ? data.bonuses : [];
    return (
      <div className="scores-section">
        {PEOPLE.map((person) => {
          const monthPts = computeMonthPoints(data.dailyPlans, person) + sumBonuses(bonuses, person);
          const todayItems = getDailyItems(data.dailyPlans, person, today);
          const todayDone = todayItems.filter((i) => i.done).length;
          const todayTotal = todayItems.length;
          const todayPts = computeDayPoints(todayItems);
          const personBonus = sumBonuses(bonuses, person);
          const bonusStr = personBonus > 0 ? ` · 🎁 +${personBonus}` : "";

          return (
            <div className="score-card" key={person}>
              <h4>{PERSON_LABEL[person]}</h4>
              <div className="score-month">月积分: {monthPts}</div>
              <div className={`score-today${todayPts > 0 || personBonus > 0 ? " plus" : ""}`}>
                今日 {todayDone}/{todayTotal} · {todayPts > 0 ? "+" + todayPts + " pt" : "0 pt"}
                {bonusStr}
              </div>
            </div>
          );
        })}
        <button className="bonus-btn" onClick={openBonusManager}>
          🎁 奖励管理
        </button>
      </div>
    );
  };

  // ── Postpone menu ──
  const renderPostponeMenu = () => {
    if (!postponeCtx) return null;
    const { anchorRect } = postponeCtx;
    const options = [
      { label: "顺延到明天", offset: 1 },
      { label: "顺延3天后", offset: 3 },
      { label: "顺延一周后", offset: 7 },
    ];
    return (
      <div
        ref={postponeRef}
        className="postpone-menu show"
        style={{
          position: "fixed",
          top: anchorRect.bottom + 4,
          left: anchorRect.left,
          zIndex: 999,
        }}
      >
        {options.map(({ label, offset }) => {
          const target = plannerDay + offset;
          const disabled = target > 30;
          return (
            <div
              key={offset}
              className={`pm-item${disabled ? " disabled" : ""}`}
              onClick={() => !disabled && handlePostpone(target)}
            >
              <span>{label}</span>
              <span className="pm-time">{disabled ? "超出范围" : `6月${target}日`}</span>
            </div>
          );
        })}
        <div className="pm-divider" />
        <div
          className="pm-item"
          onClick={() => {
            const input = prompt("输入目标日期 (1-30):");
            if (!input) return;
            const d = parseInt(input, 10);
            if (d >= 1 && d <= 30 && d !== plannerDay) {
              handlePostpone(d);
            }
          }}
        >
          选择具体日期…
        </div>
      </div>
    );
  };

  // ── Duration popup ──
  const renderDurPopup = () => {
    if (!durCtx) return null;
    const { anchorRect } = durCtx;
    return (
      <div
        ref={durRef}
        className="dur-popup show"
        style={{
          position: "fixed",
          top: anchorRect.bottom + 4,
          left: anchorRect.left,
          zIndex: 999,
        }}
      >
        <div className="dur-presets">
          {DUR_PRESETS.map(({ label, value }) => (
            <button key={value} className="dur-preset" onClick={() => handleDurSave(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="dur-custom-row">
          <input
            type="number"
            min="1"
            max="480"
            placeholder="自定义"
            value={customDur}
            onChange={(e) => setCustomDur(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = parseInt(customDur, 10);
                if (v > 0) handleDurSave(v);
              }
            }}
          />
          <span className="dur-unit">分钟</span>
        </div>
        <div className="dur-actions">
          <button
            onClick={() => {
              const v = parseInt(customDur, 10);
              if (v > 0) handleDurSave(v);
            }}
          >
            保存
          </button>
          <button onClick={() => handleDurSave(0)}>清除</button>
        </div>
      </div>
    );
  };

  // ── Main render ──
  return (
    <>
      {/* ── Weekly Plan ── */}
      <div className="planner-card weekly">
        <div className="planner-head">
          <button
            className="planner-nav"
            disabled={plannerWeekIdx <= 0}
            onClick={() => setPlannerWeekIdx((i) => i - 1)}
          >
            ‹
          </button>
          <div className="planner-title">
            <div className="planner-label">本周计划 · 共享</div>
            <div className="planner-range">
              6月{week.startDay}日 – 6月{week.endDay}日
              {isCurrentWeek && <span className="today-badge">本周</span>}
            </div>
          </div>
          <button
            className="planner-nav"
            disabled={plannerWeekIdx >= WEEKS.length - 1}
            onClick={() => setPlannerWeekIdx((i) => i + 1)}
          >
            ›
          </button>
        </div>
        {!isCurrentWeek && (
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <button
              className="planner-jump-today"
              onClick={() =>
                setPlannerWeekIdx(Math.max(0, WEEKS.findIndex((w) => w.id === currentWeek.id)))
              }
            >
              跳到本周
            </button>
          </div>
        )}
        <textarea
          className="planner-text"
          value={weekText}
          onChange={(e) => setWeekText(e.target.value)}
          placeholder="写下本周计划…"
          rows={4}
        />
        <div className="planner-foot">
          <span>{weekText.length} 字</span>
          <span className={`planner-save${weekSaving ? " saving" : ""}`}>
            {weekSaving ? "保存中…" : "已保存"}
          </span>
        </div>
      </div>

      {/* ── Daily Plan ── */}
      <div className="planner-card" style={{ marginTop: 18, paddingBottom: 14 }}>
        <div className="planner-head" style={{ marginBottom: 4 }}>
          <button className="planner-nav" disabled={plannerDay <= 1} onClick={() => setPlannerDay((d) => d - 1)}>
            ‹
          </button>
          <div className="planner-title">
            <div className="planner-label">今日清单</div>
            <div className="planner-range">
              6月{plannerDay}日 · {dow}
              {isToday && <span className="today-badge">今天</span>}
            </div>
          </div>
          <button className="planner-nav" disabled={plannerDay >= 30} onClick={() => setPlannerDay((d) => d + 1)}>
            ›
          </button>
        </div>
        {!isToday && (
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <button className="planner-jump-today" onClick={() => setPlannerDay(today)}>
              跳到今天
            </button>
          </div>
        )}

        <div className="today-grid">
          {PEOPLE.map((p) => renderPersonColumn(p))}
        </div>
      </div>

      {/* ── Popups (portaled to body via fixed positioning) ── */}
      {renderPostponeMenu()}
      {renderDurPopup()}
    </>
  );
}
