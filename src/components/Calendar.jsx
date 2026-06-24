import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useData } from "../firebase/dataContext.jsx";
import { CAT_NAMES } from "../data/calendar.js";

const ALL_CATS = ["yuxin", "date", "luke", "special", "growth"];
const MOOD_OPTIONS = [
  "😊", "😍", "🥰", "🎉", "✨", "❤️",
  "😁", "🤗", "😋", "🥳", "🤩", "😎",
  "🙂", "😌", "😴", "🤔", "😐", "😶",
  "😢", "😭", "😤", "😠", "🥲", "😔",
  "😰", "🤒", "🤯", "💪", "🙏", "💕",
];
const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const FIRST_DAY = 1; // June 1 2026 = Monday (day-of-week index)
const DAYS_IN_MONTH = 30;

function dateStr(d) {
  return `2026-06-${String(d).padStart(2, "0")}`;
}
function parseDateLabel(ds) {
  const dt = new Date(ds + "T00:00");
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}
function parseDow(ds) {
  return DOW_NAMES[new Date(ds + "T00:00").getDay()];
}

// ---------- Sub-components ----------

function MoodPicker({ date, rect, onClose }) {
  const { updateField } = useData();
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest(".mood-btn")) {
        onClose();
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [onClose]);

  const style = useMemo(() => {
    if (!rect) return {};
    const pw = 230, ph = 260;
    let left = rect.left + (rect.right - rect.left) / 2 - pw / 2;
    let top = rect.bottom + 6;
    if (left < 8) left = 8;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top + ph > window.innerHeight - 10) top = rect.top - ph - 6;
    return { left, top };
  }, [rect]);

  const pick = async (emoji) => {
    await updateField(`moods.${date}`, emoji);
    onClose();
  };
  const clear = async () => {
    await updateField(`moods.${date}`, null);
    onClose();
  };

  return (
    <div className="mood-popup show" ref={ref} style={style}>
      {MOOD_OPTIONS.map(m => (
        <button key={m} className="mood-opt" data-m={m} onClick={() => pick(m)}>
          {m}
        </button>
      ))}
      <button
        id="moodClear"
        onClick={clear}
        style={{ gridColumn: "1 / -1", fontSize: 12, padding: "4px 0", cursor: "pointer", background: "none", border: "none", color: "var(--ink-soft)" }}
      >
        清除
      </button>
    </div>
  );
}

function NotePopup({ date, rect, onClose }) {
  const { data, updateField } = useData();
  const [text, setText] = useState(data.dateMessages[date] || "");
  const ref = useRef(null);
  const textareaRef = useRef(null);
  const hasExisting = !!data.dateMessages[date];

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest(".msg-btn")) {
        onClose();
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [onClose]);

  const style = useMemo(() => {
    if (!rect) return {};
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + 280 > window.innerWidth) left = window.innerWidth - 288;
    if (left < 8) left = 8;
    if (top + 180 > window.innerHeight) top = rect.top - 186;
    return { left, top };
  }, [rect]);

  const save = async () => {
    const trimmed = text.trim();
    if (trimmed) {
      await updateField(`dateMessages.${date}`, trimmed);
    } else {
      await updateField(`dateMessages.${date}`, null);
    }
    onClose();
  };

  const del = async () => {
    await updateField(`dateMessages.${date}`, null);
    onClose();
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="note-popup show" ref={ref} style={style}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="写一段当天的话..."
        rows={3}
      />
      <div className="np-actions">
        <span className="np-date">{parseDateLabel(date)}</span>
        <button className="np-btn danger" onClick={del} style={{ display: hasExisting ? "inline-block" : "none" }}>
          删除
        </button>
        <button className="np-btn primary" onClick={save}>
          保存
        </button>
      </div>
    </div>
  );
}

function EventModal({ date, onClose }) {
  const { data, saveField } = useData();
  const [formDate, setFormDate] = useState(date || "2026-06-01");
  const [cat, setCat] = useState("date");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  const saveEvent = async () => {
    if (!formDate || !title.trim()) {
      alert("日期和标题必填");
      return;
    }
    const newEvent = {
      date: formDate,
      cat,
      title: title.trim(),
      time: time.trim(),
      note: note.trim()
    };
    const updated = [...data.events, newEvent];
    await saveField("events", updated);
    onClose();
  };

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop show" onClick={onBackdropClick}>
      <div className="modal">
        <h3>添加事项</h3>
        <div className="form-row-grid">
          <div className="form-row">
            <label>日期</label>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
          </div>
          <div className="form-row">
            <label>分类</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              {ALL_CATS.map(c => (
                <option key={c} value={c}>{CAT_NAMES[c]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <label>标题</label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="事项标题"
          />
        </div>
        <div className="form-row-grid">
          <div className="form-row">
            <label>时间</label>
            <input type="text" value={time} onChange={e => setTime(e.target.value)} placeholder="如 19:00-20:30" />
          </div>
          <div className="form-row">
            <label>备注</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="可选" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn primary" onClick={saveEvent}>保存</button>
        </div>
      </div>
    </div>
  );
}

function DayTooltip({ date, rect, events, moods, dateMessages, activeFilters }) {
  const ref = useRef(null);

  const dayEvents = useMemo(() =>
    events
      .filter(e => e.date === date && activeFilters.has(e.cat))
      .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [events, date, activeFilters]
  );

  const mood = moods[date] || "";
  const msg = dateMessages[date];
  const label = parseDateLabel(date);
  const dow = parseDow(date);

  const style = useMemo(() => {
    if (!rect) return {};
    const tw = 260;
    let left = rect.right + 10;
    if (left + tw > window.innerWidth - 10) {
      left = rect.left - tw - 10;
    }
    if (left < 10) left = 10;
    let top = rect.top;
    if (top + 200 > window.innerHeight) top = window.innerHeight - 210;
    return { left, top };
  }, [rect]);

  return (
    <div className="day-tooltip show" ref={ref} style={style}>
      <div className="tt-date">{label} · {dow} {mood ? `· ${mood}` : ""}</div>
      {msg && (
        <div className="tt-event">
          <div className="tt-bullet" style={{ background: "#fff", border: "1px solid rgba(255,255,255,0.3)" }} />
          <div>
            <div className="tt-meta">💬 {msg}</div>
          </div>
        </div>
      )}
      {dayEvents.length === 0 && !msg && (
        <div className="tt-empty">今天没有安排</div>
      )}
      {dayEvents.map((e, i) => (
        <div className="tt-event" key={i}>
          <div className={`tt-bullet ${e.cat}`} />
          <div>
            <div className="tt-title">{e.title}</div>
            {e.time && <div className="tt-meta">⏰ {e.time}</div>}
            {e.note && <div className="tt-meta">📝 {e.note}</div>}
          </div>
        </div>
      ))}
      <div className="tt-hint">点击格子添加事项 · 点 +/emoji 标心情</div>
    </div>
  );
}

function EventList({ events, activeFilters, onDelete }) {
  const filtered = useMemo(() =>
    events
      .filter(e => activeFilters.has(e.cat))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "")),
    [events, activeFilters]
  );

  return (
    <div className="card">
      <div className="card-head">
        <h3>事项清单</h3>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{filtered.length} 项</span>
      </div>
      <div className="events">
        {filtered.length === 0 ? (
          <div className="empty-state">这里还空着 -- 试着点日历加一个吧</div>
        ) : (
          filtered.map((e, i) => {
            const idx = events.indexOf(e);
            const label = parseDateLabel(e.date);
            const dow = parseDow(e.date);
            return (
              <div className={`event ${e.cat}`} key={idx}>
                <button className="event-del" onClick={() => onDelete(idx)} title="删除">✕</button>
                <div className="event-date">{label} · {dow} · {CAT_NAMES[e.cat]}</div>
                <div className="event-title">{e.title}</div>
                {e.time && <div className="event-meta">⏰ {e.time}</div>}
                {e.note && <div className="event-meta">📝 {e.note}</div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------- Main Calendar ----------

export default function Calendar() {
  const { data, saveField } = useData();
  const { events, moods, dateMessages } = data;

  const [activeFilters, setActiveFilters] = useState(() => new Set(ALL_CATS));
  const [modalDate, setModalDate] = useState(null); // null = closed, string = open for that date
  const [moodPicker, setMoodPicker] = useState(null); // { date, rect }
  const [notePopup, setNotePopup] = useState(null); // { date, rect }
  const [tooltip, setTooltip] = useState(null); // { date, rect }

  // Filter toggle
  const toggleFilter = useCallback((cat) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (cat === "all") {
        const allOn = ALL_CATS.every(c => next.has(c));
        if (allOn) next.clear();
        else ALL_CATS.forEach(c => next.add(c));
      } else {
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
      }
      return next;
    });
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (idx) => {
    if (!confirm("删除这条事项？两人都会看到删除结果。")) return;
    const updated = [...events];
    updated.splice(idx, 1);
    await saveField("events", updated);
  }, [events, saveField]);

  // Close popups when clicking outside
  const closePopups = useCallback(() => {
    setMoodPicker(null);
    setNotePopup(null);
  }, []);

  // Build calendar cells
  const cells = useMemo(() => {
    const result = [];
    // Empty cells for offset
    for (let i = 0; i < FIRST_DAY; i++) {
      result.push({ empty: true, key: `empty-${i}` });
    }
    for (let d = 1; d <= DAYS_IN_MONTH; d++) {
      const date = dateStr(d);
      const dow = (FIRST_DAY + d - 1) % 7;
      const isWeekend = dow === 0 || dow === 6;
      const dayEvents = events.filter(e => e.date === date && activeFilters.has(e.cat));
      const mood = moods[date] || "";
      const hasMsg = !!dateMessages[date];
      result.push({
        empty: false,
        key: date,
        day: d,
        date,
        isWeekend,
        dayEvents: dayEvents.slice(0, 5),
        mood,
        hasMsg
      });
    }
    return result;
  }, [events, moods, dateMessages, activeFilters]);

  return (
    <div>
      {/* Filter chips */}
      <div className="filters" id="filters">
        <button
          className={`chip${ALL_CATS.every(c => activeFilters.has(c)) ? " active" : ""}`}
          data-cat="all"
          onClick={() => toggleFilter("all")}
        >
          全部
        </button>
        {ALL_CATS.map(cat => (
          <button
            key={cat}
            className={`chip${activeFilters.has(cat) ? " active" : ""}`}
            data-cat={cat}
            onClick={() => toggleFilter(cat)}
          >
            {CAT_NAMES[cat]}
          </button>
        ))}
      </div>

      <div className="layout">
        {/* Left card: Calendar grid */}
        <div className="card">
          <div className="card-head">
            <h3>月历视图</h3>
            <button className="add-btn" onClick={() => setModalDate("2026-06-01")}>+ 添加事项</button>
          </div>
          <div className="cal-grid" id="calHead">
            {DAY_HEADERS.map(d => (
              <div key={d} className="cal-head">{d}</div>
            ))}
          </div>
          <div className="cal-grid" id="calBody" style={{ marginTop: 5 }}>
            {cells.map(cell => {
              if (cell.empty) {
                return <div key={cell.key} className="cal-cell empty" />;
              }
              return (
                <div
                  key={cell.key}
                  className={`cal-cell${cell.isWeekend ? " weekend" : ""}`}
                  data-date={cell.date}
                  onClick={(e) => {
                    if (e.target.closest(".mood-btn") || e.target.closest(".msg-btn")) return;
                    setModalDate(cell.date);
                  }}
                  onMouseEnter={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ date: cell.date, rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right } }); }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div className="cell-head">
                    <span className="day-num">{cell.day}</span>
                    <button
                      className={`mood-btn${cell.mood ? " set" : ""}`}
                      data-date={cell.date}
                      title="标注心情"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotePopup(null);
                        setTooltip(null);
                        const cellEl = e.currentTarget.closest(".cal-cell");
                        const r = cellEl.getBoundingClientRect();
                        setMoodPicker(prev =>
                          prev?.date === cell.date ? null : { date: cell.date, rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right } }
                        );
                      }}
                    >
                      {cell.mood || "🙂"}
                    </button>
                  </div>
                  <div className="day-events">
                    {cell.dayEvents.map((e, i) => (
                      <div key={i} className={`dot ${e.cat}`} />
                    ))}
                  </div>
                  <button
                    className={`msg-btn${cell.hasMsg ? " set" : ""}`}
                    data-date={cell.date}
                    title={cell.hasMsg ? "查看/编辑留言" : "写一段当天的话"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoodPicker(null);
                      setTooltip(null);
                      const r2 = e.currentTarget.getBoundingClientRect();
                      setNotePopup(prev =>
                        prev?.date === cell.date ? null : { date: cell.date, rect: { top: r2.top, bottom: r2.bottom, left: r2.left, right: r2.right } }
                      );
                    }}
                  >
                    {cell.hasMsg ? "💬" : "✎"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right card: Event list */}
        <EventList
          events={events}
          activeFilters={activeFilters}
          onDelete={deleteEvent}
        />
      </div>

      {/* Mood Picker Popup — portal to body to escape transform containing block */}
      {moodPicker && createPortal(
        <MoodPicker
          date={moodPicker.date}
          rect={moodPicker.rect}
          onClose={() => setMoodPicker(null)}
        />,
        document.body
      )}

      {/* Note Popup */}
      {notePopup && createPortal(
        <NotePopup
          date={notePopup.date}
          rect={notePopup.rect}
          onClose={() => setNotePopup(null)}
        />,
        document.body
      )}

      {/* Tooltip */}
      {tooltip && createPortal(
        <DayTooltip
          date={tooltip.date}
          rect={tooltip.rect}
          events={events}
          moods={moods}
          dateMessages={dateMessages}
          activeFilters={activeFilters}
        />,
        document.body
      )}

      {/* Event Modal */}
      {modalDate && (
        <EventModal
          date={modalDate}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  );
}
