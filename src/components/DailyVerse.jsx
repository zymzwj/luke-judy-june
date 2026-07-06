import React from "react";
import { DAILY_VERSES } from "../data/verses.js";
import { dayOfYear } from "../utils/date.js";

export default function DailyVerse() {
  const today = new Date();
  const idx = dayOfYear(today) % DAILY_VERSES.length;
  const v = DAILY_VERSES[idx];

  return (
    <div className="quote-card section">
      <div className="quote-text">"{v.text}"</div>
      <div className="quote-cite">— {v.cite}</div>
    </div>
  );
}
