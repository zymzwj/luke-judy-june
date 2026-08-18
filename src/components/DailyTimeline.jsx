import React, { useState, useRef, useEffect } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { dayKey, currentDay } from "../utils/date.js";
import { getDailyItems, parseQuickAdd } from "../utils/plans.js";
import { formatDuration } from "../utils/format.js";
import { MONTH_CONFIG } from "../firebase/config.js";

const START = 6;
const END = 23;
const HPX = 64;
const TOTAL = END - START;
const TRACK_H = TOTAL * HPX;
const MIN_BLOCK = 28;

const PEOPLE = ["luke", "judy"];
const LABEL = { luke: "Luke", judy: "Judy" };

function parseT(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
  if (h < START || h >= END) return null;
  return { h, m: min };
}

export default function DailyTimeline({ plannerDay }) {
  const { data, updateField } = useData();
  const [addSlot, setAddSlot] = useState(null);
  const [addText, setAddText] = useState("");
  const [quickAdd, setQuickAdd] = useState({ luke: "", judy: "" });
  const addRef = useRef(null);
  const scrollRef = useRef(null);
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNowTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const getItems = (p) => getDailyItems(data.dailyPlans, p, plannerDay);
  const commit = (p, items) => updateField(`dailyPlans.${dayKey(p, plannerDay)}`, items);

  const toggle = (p, idx) => {
    const items = [...getItems(p)];
    items[idx] = { ...items[idx], done: !items[idx].done };
    commit(p, items);
  };

  const remove = (p, idx) => {
    const items = [...getItems(p)];
    items.splice(idx, 1);
    commit(p, items);
  };

  const addAtSlot = () => {
    if (!addSlot || !addText.trim()) return;
    const { person, hour } = addSlot;
    const item = {
      text: addText.trim(),
      done: false,
      urgent: false,
      important: false,
      time: `${String(hour).padStart(2, "0")}:00`,
      duration: 60,
    };
    commit(person, [...getItems(person), item]);
    setAddText("");
    setAddSlot(null);
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
      duration: parsed.duration || 0,
    };
    commit(person, [...getItems(person), item]);
    setQuickAdd(prev => ({ ...prev, [person]: "" }));
  };

  const handleTrackClick = (person, e) => {
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + scrollRef.current.scrollTop;
    const hour = Math.floor(y / HPX) + START;
    if (hour >= START && hour < END) {
      setAddSlot({ person, hour });
      setAddText("");
    }
  };

  useEffect(() => {
    if (!addSlot) return;
    const handler = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) setAddSlot(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addSlot]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const h = nowTime.getHours();
    const targetH = (plannerDay === currentDay() && h >= START && h < END) ? h : 8;
    const top = Math.max(0, (targetH - START) * HPX - 120);
    scrollRef.current.scrollTop = top;
  }, [plannerDay]);

  const isToday = plannerDay === currentDay();
  const showNow = isToday && nowTime.getHours() >= START && nowTime.getHours() < END;
  const nowTop = showNow ? ((nowTime.getHours() - START) + nowTime.getMinutes() / 60) * HPX : -1;
  const nowLabel = `${String(nowTime.getHours()).padStart(2, "0")}:${String(nowTime.getMinutes()).padStart(2, "0")}`;

  const categorize = (person) => {
    const items = getItems(person);
    const scheduled = [];
    const unscheduled = [];
    items.forEach((it, idx) => {
      const t = parseT(it.time);
      if (t) {
        const top = ((t.h - START) + t.m / 60) * HPX;
        const dur = it.duration || 60;
        const height = Math.max(MIN_BLOCK, (dur / 60) * HPX);
        scheduled.push({ it, idx, top, height: Math.min(height, TRACK_H - top) });
      } else {
        unscheduled.push({ it, idx });
      }
    });
    return { scheduled, unscheduled };
  };

  const allUnsched = PEOPLE.flatMap(p =>
    categorize(p).unscheduled.map(u => ({ ...u, person: p }))
  );

  const stats = PEOPLE.map(p => {
    const items = getItems(p);
    const done = items.filter(i => i.done).length;
    return { person: p, done, total: items.length, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
  });

  return (
    <div className="tl">
      {/* Stats bar */}
      <div className="tl-stats">
        {stats.map(s => (
          <div key={s.person} className={`tl-stat ${s.person}`}>
            <div className="tl-stat-top">
              <span className="tl-stat-name">{LABEL[s.person]}</span>
              <span className="tl-stat-num">{s.done}<span className="tl-stat-of">/{s.total}</span></span>
            </div>
            <div className="tl-stat-bar">
              <div className="tl-stat-fill" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Unscheduled */}
      {allUnsched.length > 0 && (
        <div className="tl-unsched">
          <div className="tl-unsched-label">未安排的事项</div>
          <div className="tl-unsched-items">
            {allUnsched.map(({ it, idx, person }) => (
              <div key={`${person}-${idx}`} className={`tl-chip ${person}${it.done ? " done" : ""}`}>
                <button className="tl-chip-chk" onClick={() => toggle(person, idx)} />
                <span className="tl-chip-text">{it.text}</span>
                <span className="tl-chip-who">{LABEL[person]}</span>
                <button className="tl-chip-del" onClick={() => remove(person, idx)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Headers */}
      <div className="tl-head-row">
        <div className="tl-head-spacer" />
        {PEOPLE.map(p => (
          <div key={p} className={`tl-head ${p}`}>
            <span className="tl-head-dot" />
            {LABEL[p]}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="tl-scroll" ref={scrollRef}>
        <div className="tl-body" style={{ height: TRACK_H }}>
          {/* Alternating hour backgrounds */}
          {Array.from({ length: TOTAL }, (_, i) => (
            <div key={`bg${i}`} className={`tl-hour-bg${i % 2 === 0 ? " even" : ""}`} style={{ top: i * HPX, height: HPX }} />
          ))}

          {/* Grid lines + hour labels */}
          {Array.from({ length: TOTAL + 1 }, (_, i) => (
            <React.Fragment key={i}>
              <div className="tl-hour" style={{ top: i * HPX }}>
                {String(START + i).padStart(2, "0")}
                <span className="tl-hour-min">:00</span>
              </div>
              <div className="tl-gridline" style={{ top: i * HPX }} />
            </React.Fragment>
          ))}
          {Array.from({ length: TOTAL }, (_, i) => (
            <div key={`h${i}`} className="tl-gridline half" style={{ top: i * HPX + HPX / 2 }} />
          ))}

          {/* Tracks */}
          <div className="tl-tracks">
            {PEOPLE.map(person => {
              const { scheduled } = categorize(person);
              return (
                <div key={person} className={`tl-track ${person}`} onClick={(e) => handleTrackClick(person, e)}>
                  {scheduled.map(({ it, idx, top, height }) => (
                    <div
                      key={idx}
                      className={`tl-block ${person}${it.done ? " done" : ""}${it.urgent ? " urgent" : ""}${it.important ? " imp" : ""}`}
                      style={{ top, height, animationDelay: `${idx * 60}ms` }}
                      onClick={(e) => { e.stopPropagation(); toggle(person, idx); }}
                    >
                      {it.done && <span className="tl-block-check">✓</span>}
                      <div className="tl-block-head">
                        <span className="tl-block-time">{it.time}</span>
                        {it.duration > 0 && <span className="tl-block-dur">{formatDuration(it.duration)}</span>}
                      </div>
                      <span className="tl-block-text">{it.text}</span>
                      <div className="tl-block-flags">
                        {it.urgent && <span className="tl-flag urgent">急</span>}
                        {it.important && <span className="tl-flag imp">要</span>}
                      </div>
                      <button className="tl-block-del" onClick={(e) => { e.stopPropagation(); remove(person, idx); }}>×</button>
                    </div>
                  ))}

                  {addSlot && addSlot.person === person && (
                    <div
                      ref={addRef}
                      className="tl-add-slot"
                      style={{ top: (addSlot.hour - START) * HPX + 2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="tl-add-time">{String(addSlot.hour).padStart(2, "0")}:00</span>
                      <input
                        autoFocus
                        className="tl-add-input"
                        value={addText}
                        onChange={(e) => setAddText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addAtSlot();
                          if (e.key === "Escape") setAddSlot(null);
                        }}
                        placeholder="添加事项 Enter 确认"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Now indicator */}
          {showNow && (
            <div className="tl-now" style={{ top: nowTop }}>
              <div className="tl-now-dot" />
              <div className="tl-now-line" />
              <span className="tl-now-label">{nowLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Add inputs */}
      <div className="tl-add-bar">
        {PEOPLE.map(p => (
          <div key={p} className={`tl-add-wrap ${p}`}>
            <span className="tl-add-icon">+</span>
            <input
              type="text"
              value={quickAdd[p]}
              onChange={(e) => setQuickAdd(prev => ({ ...prev, [p]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(p); }}
              placeholder={`${LABEL[p]} 添加 (@9:00-11:00 或 @9:00+90)`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
