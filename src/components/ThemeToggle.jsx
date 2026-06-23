import React, { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "luke-judy-theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <button className="theme-toggle" onClick={toggle} title={theme === "dark" ? "切换到浅色" : "切换到深色"}>
      <span className="toggle-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
