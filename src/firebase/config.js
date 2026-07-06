export const firebaseConfig = {
  apiKey: "AIzaSyAeWzqTEexEL72JqSWIJuR4M0Ol5jrPThU",
  authDomain: "luke-judy-june.firebaseapp.com",
  projectId: "luke-judy-june",
  storageBucket: "luke-judy-june.firebasestorage.app",
  messagingSenderId: "440852030279",
  appId: "1:440852030279:web:9ecbef6643cf81d60a6262"
};

const MONTHS = {
  june: {
    coupleId: "luke-judy",
    config: { year: 2026, month: 6, daysInMonth: 30, firstDow: 1, label: "六月", labelEn: "June" },
    ldr: null,
  },
  july: {
    coupleId: "luke-judy-july",
    config: { year: 2026, month: 7, daysInMonth: 31, firstDow: 3, label: "七月", labelEn: "July" },
    ldr: {
      separationDate: "2026-07-05",
      reunionDate: null,
      lukeTimezone: "America/New_York",
      judyTimezone: "Asia/Shanghai",
      lukeCity: "美国",
      judyCity: "中国",
    },
  },
};

const params = new URLSearchParams(window.location.search);
const monthParam = params.get("month");
export const ACTIVE_MONTH = monthParam && MONTHS[monthParam] ? monthParam : "july";
export const IS_ARCHIVE = ACTIVE_MONTH !== "july";

const active = MONTHS[ACTIVE_MONTH];
export const COUPLE_ID = active.coupleId;
export const MONTH_CONFIG = active.config;
export const LDR = active.ldr;
