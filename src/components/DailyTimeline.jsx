import React, { useState, useRef, useEffect } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { dayKey, currentDay } from "../utils/date.js";
import { getDailyItems } from "../utils/plans.js";
import { formatDuration } from "../utils/format.js";
import { MONTH_CONFIG } from "../firebase/config.js";

const START = 7;
const END = 24;
const HPX = 64;
const TOTAL = END - START;
const TRACK_H = TOTAL * HPX;
const MIN_BLOCK = 28;

const SNAP = HPX / 4; // 15-minute snap grid
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
  const [addModal, setAddModal] = useState(null);
  const addRef = useRef(null);
  const scrollRef = useRef(null);
  const [nowTime, setNowTime] = useState(new Date());
  const [dragState, setDragState] = useState(null);

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

  const openAddModal = (person) => {
    setAddModal({ person, text: "", startH: 9, startM: 0, endH: 10, endM: 0, urgent: false, important: false, noTime: false });
  };

  const submitAddModal = () => {
    if (!addModal || !addModal.text.trim()) return;
    const { person, text, startH, startM, endH, endM, urgent, important, noTime } = addModal;
    if (noTime) {
      commit(person, [...getItems(person), {
        text: text.trim(), done: false, urgent, important, time: null, duration: null,
      }]);
    } else {
      const time = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
      const dur = (endH * 60 + endM) - (startH * 60 + startM);
      commit(person, [...getItems(person), {
        text: text.trim(), done: false, urgent, important, time, duration: dur > 0 ? dur : 60,
      }]);
    }
    setAddModal(null);
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

  const pxToTime = (px) => {
    const totalMin = Math.round((px / HPX) * 60 / 15) * 15;
    const cl = Math.max(0, Math.min(TOTAL * 60 - 15, totalMin));
    const h = Math.floor(cl / 60) + START;
    const m = cl % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleBlockDown = (e, person, idx, blockTop) => {
    if (e.target.closest(".tl-block-del") || e.target.closest(".tl-block-resize")) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const track = e.currentTarget.closest(".tl-track");
    const scrollTop = scrollRef.current?.scrollTop || 0;
    const rect = track.getBoundingClientRect();
    const offsetY = clientY - rect.top + scrollTop - blockTop;
    let moved = false;
    let finalTime = null;

    const onMove = (ev) => {
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      if (!moved && Math.abs(cy - clientY) < 5) return;
      moved = true;
      if (ev.cancelable) ev.preventDefault();
      const r = track.getBoundingClientRect();
      const st = scrollRef.current?.scrollTop || 0;
      const rawY = cy - r.top + st - offsetY;
      const snapped = Math.round(rawY / SNAP) * SNAP;
      const top = Math.max(0, Math.min(TRACK_H - MIN_BLOCK, snapped));
      finalTime = pxToTime(top);
      setDragState({ person, idx, top, time: finalTime });
    };

    const onEnd = () => {
      done();
      if (moved && finalTime) {
        const items = [...getItems(person)];
        items[idx] = { ...items[idx], time: finalTime };
        commit(person, items);
      } else if (!moved) {
        toggle(person, idx);
      }
      setDragState(null);
    };

    const done = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.body.style.userSelect = "none";
  };

  const handleResizeDown = (e, person, idx, blockTop) => {
    e.stopPropagation();
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const track = e.currentTarget.closest(".tl-track");
    let finalDur = null;

    const onMove = (ev) => {
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      if (ev.cancelable) ev.preventDefault();
      const r = track.getBoundingClientRect();
      const st = scrollRef.current?.scrollTop || 0;
      const rawH = cy - r.top + st - blockTop;
      const snapped = Math.round(rawH / SNAP) * SNAP;
      const h = Math.max(SNAP, Math.min(TRACK_H - blockTop, snapped));
      finalDur = Math.round((h / HPX) * 60);
      setDragState({ person, idx, top: blockTop, height: h, resizing: true, duration: finalDur });
    };

    const onEnd = () => {
      done();
      if (finalDur && finalDur > 0) {
        const items = [...getItems(person)];
        items[idx] = { ...items[idx], duration: finalDur };
        commit(person, items);
      }
      setDragState(null);
    };

    const done = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";
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
                <div key={person} className={`tl-track ${person}`} onDoubleClick={(e) => handleTrackClick(person, e)}>
                  {scheduled.map(({ it, idx, top, height }) => {
                    const ds = dragState?.person === person && dragState?.idx === idx ? dragState : null;
                    const isResizing = ds?.resizing;
                    return (
                      <div
                        key={idx}
                        className={`tl-block ${person}${it.done ? " done" : ""}${it.urgent && it.important ? " pri-ui" : it.important ? " pri-i" : it.urgent ? " pri-u" : " pri-n"}${ds ? " dragging" : ""}`}
                        style={{
                          top: ds && !isResizing ? ds.top : top,
                          height: isResizing ? ds.height : height,
                          animationDelay: `${idx * 60}ms`,
                        }}
                        onMouseDown={(e) => handleBlockDown(e, person, idx, top)}
                        onTouchStart={(e) => handleBlockDown(e, person, idx, top)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {it.done && <span className="tl-block-check">✓</span>}
                        <div className="tl-block-head">
                          <span className="tl-block-time">{ds && !isResizing ? ds.time : it.time}</span>
                          <span className="tl-block-dur">
                            {formatDuration(isResizing ? ds.duration : (it.duration || 60))}
                          </span>
                        </div>
                        <span className="tl-block-text">{it.text}</span>
                        <div className="tl-block-flags">
                          {it.urgent && <span className="tl-flag urgent">急</span>}
                          {it.important && <span className="tl-flag imp">要</span>}
                        </div>
                        <button className="tl-block-del" onClick={(e) => { e.stopPropagation(); remove(person, idx); }}>×</button>
                        <div
                          className="tl-block-resize"
                          onMouseDown={(e) => handleResizeDown(e, person, idx, top)}
                          onTouchStart={(e) => handleResizeDown(e, person, idx, top)}
                        />
                      </div>
                    );
                  })}

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

      {/* Add buttons */}
      <div className="tl-add-bar">
        {PEOPLE.map(p => (
          <button key={p} className={`tl-add-btn ${p}`} onClick={() => openAddModal(p)}>
            <span className="tl-add-btn-icon">+</span>
            {LABEL[p]} 添加任务
          </button>
        ))}
      </div>

      {/* Add modal */}
      {addModal && (
        <div className="tl-modal-overlay" onClick={() => setAddModal(null)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tl-modal-head">
              <span className={`tl-head-dot ${addModal.person}`} />
              <span className="tl-modal-title">{LABEL[addModal.person]} · 添加任务</span>
              <button className="tl-modal-close" onClick={() => setAddModal(null)}>×</button>
            </div>

            <input
              className="tl-modal-input"
              autoFocus
              placeholder="输入事项名称"
              value={addModal.text}
              onChange={(e) => setAddModal(prev => ({ ...prev, text: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter" && addModal.text.trim()) submitAddModal(); }}
            />

            <div className="tl-modal-section">
              <div className="tl-modal-label-row">
                <span className="tl-modal-label">时间</span>
                <label className="tl-notime-toggle">
                  <input type="checkbox" checked={addModal.noTime} onChange={(e) => setAddModal(prev => ({ ...prev, noTime: e.target.checked }))} />
                  <span>不安排时间</span>
                </label>
              </div>
              {!addModal.noTime && (
                <div className="tl-modal-time">
                  <select value={addModal.startH} onChange={(e) => {
                    const h = +e.target.value;
                    setAddModal(prev => ({ ...prev, startH: h, endH: Math.max(prev.endH, h + 1) }));
                  }}>
                    {Array.from({ length: END - START }, (_, i) => <option key={i} value={START + i}>{String(START + i).padStart(2, "0")}</option>)}
                  </select>
                  <span className="tl-modal-colon">:</span>
                  <input type="number" min="0" max="59" className="tl-modal-min" value={String(addModal.startM).padStart(2, "0")}
                    onChange={(e) => { const v = Math.max(0, Math.min(59, +e.target.value || 0)); setAddModal(prev => ({ ...prev, startM: v })); }} />
                  <span className="tl-modal-arrow">→</span>
                  <select value={addModal.endH} onChange={(e) => setAddModal(prev => ({ ...prev, endH: +e.target.value }))}>
                    {Array.from({ length: END - START + 1 }, (_, i) => <option key={i} value={START + i}>{String(START + i).padStart(2, "0")}</option>)}
                  </select>
                  <span className="tl-modal-colon">:</span>
                  <input type="number" min="0" max="59" className="tl-modal-min" value={String(addModal.endM).padStart(2, "0")}
                    onChange={(e) => { const v = Math.max(0, Math.min(59, +e.target.value || 0)); setAddModal(prev => ({ ...prev, endM: v })); }} />
                </div>
              )}
            </div>

            <div className="tl-modal-section">
              <span className="tl-modal-label">优先级</span>
              <div className="tl-modal-pri">
                <button className={`tl-pri-btn ui${addModal.urgent && addModal.important ? " on" : ""}`}
                  onClick={() => setAddModal(prev => ({ ...prev, urgent: true, important: true }))}>
                  紧急且重要
                </button>
                <button className={`tl-pri-btn i${!addModal.urgent && addModal.important ? " on" : ""}`}
                  onClick={() => setAddModal(prev => ({ ...prev, urgent: false, important: true }))}>
                  重要不紧急
                </button>
                <button className={`tl-pri-btn u${addModal.urgent && !addModal.important ? " on" : ""}`}
                  onClick={() => setAddModal(prev => ({ ...prev, urgent: true, important: false }))}>
                  紧急不重要
                </button>
                <button className={`tl-pri-btn n${!addModal.urgent && !addModal.important ? " on" : ""}`}
                  onClick={() => setAddModal(prev => ({ ...prev, urgent: false, important: false }))}>
                  不紧急不重要
                </button>
              </div>
            </div>

            <button className={`tl-modal-submit ${addModal.person}`} onClick={submitAddModal} disabled={!addModal.text.trim()}>
              添加任务
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
