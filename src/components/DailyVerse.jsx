import React from "react";
import { DAILY_VERSES } from "../data/verses.js";
import { dayOfYear } from "../utils/date.js";
import { JUDY_BIRTHDAY_VERSE } from "../features/birthday.js";

export default function DailyVerse({ birthdayActive }) {
  const today = new Date();
  const idx = dayOfYear(today) % DAILY_VERSES.length;

  let text, cite;
  if (birthdayActive) {
    text = JUDY_BIRTHDAY_VERSE.text;
    cite = JUDY_BIRTHDAY_VERSE.cite;
  } else {
    const v = DAILY_VERSES[idx];
    text = `"${v.text}"`;
    cite = `— ${v.cite}`;
  }

  return (
    <div className="quote-card section">
      <div className="quote-text">{text}</div>
      <div className="quote-cite">{cite}</div>
    </div>
  );
}
