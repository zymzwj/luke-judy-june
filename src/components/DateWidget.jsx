import React, { useEffect, useState } from "react";

import { getDateWidgetState } from "../utils/date.js";

export function DateWidgetView({
  state,
  replayButtonText = "🎂 重温生日",
  replayActive = false,
  onReplay
}) {
  return (
    <div className="date-widget">
      <div className="dw-today-label">今天</div>
      <div className="dw-today">{state.todayText}</div>
      <div className="dw-dow">{state.dowText}</div>
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
      <div className={state.birthdayClassName}>{state.birthdayText}</div>
      <button
        className={`dw-replay${replayActive ? " active" : ""}`}
        type="button"
        onClick={onReplay}
      >
        {replayButtonText}
      </button>
    </div>
  );
}

export default function DateWidget({
  replayButtonText,
  replayActive = false,
  onReplay
}) {
  const [state, setState] = useState(() => getDateWidgetState(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState(getDateWidgetState(new Date()));
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <DateWidgetView
      state={state}
      replayButtonText={replayButtonText}
      replayActive={replayActive}
      onReplay={onReplay}
    />
  );
}
