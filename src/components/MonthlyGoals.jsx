import React, { useState } from "react";
import { useData } from "../firebase/dataContext.jsx";

export default function MonthlyGoals() {
  const { data, saveMerge } = useData();
  const [goalText, setGoalText] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const goals = data.monthlyGoals || [];

  const handleAdd = async (e) => {
    if (e.key === "Enter" && goalText.trim() && goalTarget) {
      const goal = {
        id: Date.now().toString(),
        text: goalText.trim(),
        target: parseInt(goalTarget, 10) || 1,
        current: 0
      };
      await saveMerge({ monthlyGoals: [...goals, goal] });
      setGoalText("");
      setGoalTarget("");
    }
  };

  const handleProgress = async (id, delta) => {
    const updated = goals.map((g) => {
      if (g.id !== id) return g;
      const next = Math.max(0, (g.current || 0) + delta);
      return { ...g, current: next };
    });
    await saveMerge({ monthlyGoals: updated });
  };

  const handleDelete = async (id) => {
    const updated = goals.filter((g) => g.id !== id);
    await saveMerge({ monthlyGoals: updated });
  };

  const doneCount = goals.filter(g => (g.current || 0) >= g.target).length;

  return (
    <div className="bg-card goals">
      <h4>🎯 六月共同目标 <span className="meta">{doneCount}/{goals.length} 完成</span></h4>
      <div className="sub">独立于每日任务的月度目标（比如"一起去 3 家新餐厅"）</div>

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="bg-empty">还没有月度目标 — 比如"6 月一起去 3 家新餐厅"</div>
        ) : (
          goals.map((g) => {
            const pct = g.target > 0
              ? Math.min(100, Math.round(((g.current || 0) / g.target) * 100))
              : 0;
            const isDone = (g.current || 0) >= g.target;

            return (
              <div key={g.id} className={`goal-item${isDone ? " done" : ""}`}>
                <div className="gi-head">
                  <span className="gi-text">{g.text}</span>
                  <span className="gi-progress">
                    {g.current || 0}/{g.target}
                  </span>
                </div>
                <div className="gi-bar">
                  <div className="gi-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="gi-actions">
                  <button
                    className="gi-btn minus"
                    onClick={() => handleProgress(g.id, -1)}
                  >
                    −1
                  </button>
                  <button
                    className="gi-btn plus"
                    onClick={() => handleProgress(g.id, 1)}
                  >
                    +1
                  </button>
                  <button
                    className="gi-btn del"
                    onClick={() => handleDelete(g.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="add-row">
        <input
          type="text"
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          onKeyDown={handleAdd}
          placeholder="目标..."
        />
        <input
          type="number"
          className="target"
          value={goalTarget}
          onChange={(e) => setGoalTarget(e.target.value)}
          onKeyDown={handleAdd}
          placeholder="目标数"
          min="1"
        />
      </div>
    </div>
  );
}
