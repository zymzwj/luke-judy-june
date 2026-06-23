import assert from "node:assert/strict";

import {
  getBirthdayModeState,
  isJudyBirthdayWindow
} from "../src/features/birthday.js";
import { legacyMarkup } from "../src/legacy/legacyMarkup.js";
import {
  currentJuneDay,
  dayKey,
  getDateWidgetState
} from "../src/utils/date.js";
import {
  computeDayPoints,
  computeMonthPoints,
  parseQuickAdd,
  sortDailyItems,
  sumBonuses
} from "../src/utils/plans.js";

function testDateHelpers() {
  assert.equal(currentJuneDay(new Date(2026, 4, 20)), 1);
  assert.equal(currentJuneDay(new Date(2026, 5, 15)), 15);
  assert.equal(currentJuneDay(new Date(2026, 6, 2)), 30);
  assert.equal(dayKey("luke", 3), "luke-2026-06-03");

  const juneStart = getDateWidgetState(new Date(2026, 5, 1));
  assert.equal(juneStart.status, "六月还剩");
  assert.equal(juneStart.count, 30);
  assert.equal(juneStart.progress, 0);

  const birthday = getDateWidgetState(new Date(2026, 5, 22));
  assert.equal(birthday.birthdayText, "🎂 今天是 Judy 生日！");
  assert.equal(birthday.birthdayClassName, "dw-bday today");

  const afterJune = getDateWidgetState(new Date(2026, 6, 1));
  assert.equal(afterJune.status, "六月已结束");
  assert.equal(afterJune.progress, 100);
}

function testBirthdayMode() {
  assert.equal(isJudyBirthdayWindow(new Date(2026, 5, 22, 12)), false);
  assert.equal(isJudyBirthdayWindow(new Date(2027, 5, 21, 12)), false);
  assert.equal(isJudyBirthdayWindow(new Date(2027, 5, 22, 12)), true);

  const forcedOn = getBirthdayModeState({ manualOverride: true, wasActive: false });
  assert.equal(forcedOn.active, true);
  assert.equal(forcedOn.transitionedOn, true);
  assert.equal(forcedOn.replayButtonText, "🌷 退出生日模式");

  const forcedOff = getBirthdayModeState({ manualOverride: false, wasActive: true });
  assert.equal(forcedOff.active, false);
  assert.equal(forcedOff.transitionedOff, true);
  assert.equal(forcedOff.replayButtonText, "🎂 重温生日");
}

function testPlanHelpers() {
  assert.deepEqual(parseQuickAdd("读经 @7:05 !"), {
    text: "读经",
    urgent: false,
    important: true,
    time: "07:05"
  });
  assert.deepEqual(parseQuickAdd("复盘 @27:99 !!"), {
    text: "复盘",
    urgent: true,
    important: false,
    time: "23:59"
  });

  assert.equal(computeDayPoints([]), 0);
  assert.equal(computeDayPoints([{ done: true }, { done: false }]), 5);
  assert.equal(computeDayPoints([{ done: true }, { done: true }]), 13);

  const dailyPlans = {
    "luke-2026-06-01": [{ done: true }],
    "luke-2026-06-02": [{ done: true }, { done: false }]
  };
  assert.equal(computeMonthPoints(dailyPlans, "luke"), 18);

  assert.equal(sumBonuses([{ person: "luke", pts: 2 }, { person: "judy", pts: 9 }], "luke"), 2);

  const sorted = sortDailyItems([
    { text: "done", done: true },
    { text: "normal", done: false },
    { text: "important", done: false, important: true },
    { text: "urgent-important", done: false, urgent: true, important: true }
  ]).map(entry => entry.it.text);
  assert.deepEqual(sorted, ["urgent-important", "important", "normal", "done"]);
}

function testReactMigrationBoundaries() {
  assert.match(legacyMarkup, /id="dateWidgetMount"/);
  assert.doesNotMatch(legacyMarkup, /id="dwToday"/);
  assert.doesNotMatch(legacyMarkup, /id="dwReplayBtn"/);
}

testDateHelpers();
testBirthdayMode();
testPlanHelpers();
testReactMigrationBoundaries();

console.log("Unit checks passed");
