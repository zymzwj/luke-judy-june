import React, { useEffect, useState } from "react";
import { getDateWidgetState } from "../utils/date.js";
import { LDR } from "../firebase/config.js";

function DualClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (tz) =>
    now.toLocaleTimeString("zh-CN", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="dw-clocks">
      <div className="dw-clock">
        <span className="dw-clock-city">🇺🇸 {LDR.lukeCity}</span>
        <span className="dw-clock-time">{fmt(LDR.lukeTimezone)}</span>
      </div>
      <div className="dw-clock">
        <span className="dw-clock-city">🇨🇳 {LDR.judyCity}</span>
        <span className="dw-clock-time">{fmt(LDR.judyTimezone)}</span>
      </div>
    </div>
  );
}

export function DateWidgetView({ state }) {
  return (
    <div className="date-widget">
      <div className="dw-today-label">今天</div>
      <div className="dw-today">{state.todayText}</div>
      <div className="dw-dow">{state.dowText}</div>
      <div className="dw-divider" />
      <DualClock />
      <div className="dw-divider" />
      <div className="dw-status">{state.status}</div>
      <div className="dw-count">
        <span>{state.count}</span>
        <span className="dw-unit">天</span>
      </div>
      <div className="dw-bar">
        <div className="dw-bar-fill" style={{ width: `${state.progress}%` }} />
      </div>
      <div className="dw-bar-label">{state.barLabel}</div>
      <div className={state.ldrClassName}>{state.ldrText}</div>
      {state.reunionText && <div className="dw-ldr reunion">{state.reunionText}</div>}
    </div>
  );
}

export default function DateWidget() {
  const [state, setState] = useState(() => getDateWidgetState(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setState(getDateWidgetState(new Date())), 60000);
    return () => clearInterval(timer);
  }, []);

  return <DateWidgetView state={state} />;
}
