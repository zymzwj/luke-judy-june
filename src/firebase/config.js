export const firebaseConfig = {
  apiKey: "AIzaSyAeWzqTEexEL72JqSWIJuR4M0Ol5jrPThU",
  authDomain: "luke-judy-june.firebaseapp.com",
  projectId: "luke-judy-june",
  storageBucket: "luke-judy-june.firebasestorage.app",
  messagingSenderId: "440852030279",
  appId: "1:440852030279:web:9ecbef6643cf81d60a6262"
};

// ── Legacy document IDs (months before the YYYY-MM naming convention) ──
const LEGACY_IDS = {
  "2026-06": "luke-judy",
  "2026-07": "luke-judy-july",
};

// ── LDR config per month (only months with LDR get an entry) ──
const LDR_MAP = {
  "2026-07": {
    separationDate: "2026-07-05",
    reunionDate: null,
    lukeTimezone: "America/New_York",
    judyTimezone: "Asia/Shanghai",
    lukeCity: "美国",
    judyCity: "中国",
  },
};

const MONTH_LABELS = [
  "", "一月", "二月", "三月", "四月", "五月",
  "六月", "七月", "八月", "九月", "十月", "十一月", "十二月",
];
const MONTH_EN = [
  "", "January", "February", "March", "April", "May",
  "June", "July", "August", "September", "October", "November", "December",
];

// ── Resolve active month from URL ──
function resolveMonth() {
  const now = new Date();
  const defaultKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const params = new URLSearchParams(window.location.search);
  const raw = params.get("month");
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    if (m >= 1 && m <= 12) return raw;
  }
  return defaultKey;
}

export const ACTIVE_MONTH = resolveMonth();

// ── Compute month config from the key ──
const [year, month] = ACTIVE_MONTH.split("-").map(Number);
const daysInMonth = new Date(year, month, 0).getDate();
const firstDow = new Date(year, month - 1, 1).getDay();

export const MONTH_CONFIG = {
  year,
  month,
  daysInMonth,
  firstDow,
  label: MONTH_LABELS[month],
  labelEn: MONTH_EN[month],
};

export const COUPLE_ID = LEGACY_IDS[ACTIVE_MONTH] || `luke-judy-${ACTIVE_MONTH}`;

export const LDR = LDR_MAP[ACTIVE_MONTH] || null;

// ── Derived helpers ──
const now = new Date();
const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
export const IS_CURRENT_MONTH = ACTIVE_MONTH === currentKey;

export function monthUrl(key) {
  if (key === currentKey) return window.location.pathname;
  return `${window.location.pathname}?month=${key}`;
}

export function prevMonthKey(key) {
  const [y, m] = key.split("-").map(Number);
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return `${py}-${String(pm).padStart(2, "0")}`;
}

export function nextMonthKey(key) {
  const [y, m] = key.split("-").map(Number);
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}
