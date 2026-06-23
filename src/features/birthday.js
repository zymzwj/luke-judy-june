export const JUDY_BIRTHDAY_VERSE = {
  text: `"我的肺腑是你所造的，我在母腹中，你已覆庇我。我要称谢你，因我受造，奇妙可畏。"`,
  cite: "— 诗篇 139:13-14 · 为欣欣 🎂"
};

export function isJudyBirthdayWindow(now = new Date()) {
  const year = now.getFullYear();

  // 2026 cycle already celebrated; use the replay button to revisit it.
  if (year <= 2026) return false;

  if (now.getMonth() === 5 && now.getDate() === 22) return true;

  if (now.getMonth() === 5 && now.getDate() === 23) {
    const endUtc = Date.UTC(year, 5, 23, 16, 0, 0);
    return now.getTime() < endUtc;
  }

  return false;
}

export function getBirthdayModeState({
  manualOverride = null,
  wasActive = null,
  now = new Date()
} = {}) {
  const active = manualOverride !== null ? manualOverride : isJudyBirthdayWindow(now);

  return {
    active,
    transitionedOn: (wasActive === false || wasActive === null) && active,
    transitionedOff: wasActive === true && !active,
    shouldAutoShowSplash: active && manualOverride === null,
    replayButtonText: active ? "🌷 退出生日模式" : "🎂 重温生日"
  };
}
