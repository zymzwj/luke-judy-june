# Luke & Judy June

This is a private shared June 2026 planner app for Luke and Judy.

## Current Direction

The project is being migrated from a single large `index.html` into a Vite + React app.

The first migration step keeps the existing product behavior intact:

- `index.html` is now the Vite entry page.
- `src/App.jsx` mounts the legacy page markup.
- `src/styles/global.css` contains the extracted legacy styles.
- `src/legacy/legacyMarkup.js` contains the extracted legacy HTML body.
- `src/legacy/legacyController.js` contains the extracted legacy browser logic.
- `legacy-index.html` is the untouched pre-migration reference copy.
- `src/data/calendar.js` owns calendar labels, default events, and June week ranges.
- `src/data/verses.js` owns the rotating daily verse list.
- `src/firebase/config.js` owns Firebase project configuration.
- `src/firebase/client.js` owns Firebase initialization and shared collection/document refs.
- `src/features/birthday.js` owns birthday-mode date rules, replay button text, and birthday verse copy.
- `src/utils/date.js` and `src/utils/format.js` own pure helper functions shared by legacy code and future React components.
- `src/utils/dom.js` owns small guarded DOM helpers used while legacy sections are gradually moved into React.
- `src/utils/plans.js` owns daily-plan parsing, scoring, sorting, bonus totals, and habit streak calculations.
- `src/pwa/registerServiceWorker.js` owns service worker registration.
- `src/components/DateWidget.jsx` owns the live sidebar date widget through a React portal mounted at `#dateWidgetMount`.
- `tests/run-unit-tests.js` provides dependency-free checks for extracted date, birthday, and plan helpers.

The next steps should gradually replace legacy sections with real React components while preserving the existing Firebase data shape.

## Suggested Migration Order

1. Keep moving pure business logic out of `src/legacy/legacyController.js` when it is needed by a component.
2. Continue converting isolated UI areas, with `BirthdayMode` and `HeroCarousel` as good next candidates. Reuse guarded DOM helpers when old code needs to coexist with a new React component during the transition.
3. Convert state-heavy areas later, such as `DailyPlanner`, `Calendar`, `MemoryWall`, and reports.
4. Once a section becomes a React component, delete that section's markup from `legacyMarkup` and its imperative handlers from `legacyController`.
5. Remove `src/legacy` only after all features have component equivalents.

## Verification

- `npm test` runs quick unit checks for extracted business logic.
- `npm run build` verifies the Vite/React production bundle.
