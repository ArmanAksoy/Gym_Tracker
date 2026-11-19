# Training app (Gym_Tracker)

Personal workout log for Arman. Hypertrophy goal, trains mostly Sat/Sun, three routine days plus a warm-up block that loads with every routine.

## How it is built
- `index.html` is the whole front end (CSS + JS in one file), served by GitHub Pages from `main`. Pushing to `main` is the deploy.
- `sw.js` caches the app shell (stale-while-revalidate), so a new version shows on the second open after a push.
- Data lives in a Google Sheet behind a standalone Apps Script web app (`Api.gs`, not in this repo). The front end calls it with `fetch` POST `{key, action, args}`; a small bridge at the top of `index.html` fakes `google.script.run` so the rest of the code reads like a sheet-bound app.
- Backend actions used: getData, logSets, deleteExercise, getWeights, saveWeight, deleteWeight, progress, saveProgram, seedWarmup, diagnostics, selfTest, backfillRest, sortLog, applySetRepair, applyVoidRemoval.

## Working rules
- Arman wants changes pushed straight to `main`, no copy-paste on his side. Test before pushing: `node --check` each script block, and a jsdom run with a mocked fetch for anything touching sync, dates or timing.
- Backend changes cannot be deployed from here. If a change needs `Api.gs`, say so plainly and hand over the exact code.
- Never commit the API key or the data service URL (the repo is public; both live in the phone's localStorage).

## Do not reintroduce
- Sheets reads times back as Dates anchored to 1899-12-30: normalize with `timeStr_()` server side.
- Dates must be anchored at midday (`dateFromYmd_()`), or timezones shift them a day.
- Rest is derived server side from timestamps and returned by `logSets`; client-side rest timing was unreliable.
- RPE typed after ticking a set is saved by the debounced `pushSoon`.
- The cached `getData` copy carries an old `today`; the bridge overwrites it with the device date.
- All writes go through the persistent queue (`enqueue`/`pump`, localStorage `tl_queue`): one pending op per date|session|exercise, newest wins, same-exercise ops are serialized.
- `.wrow` is the warm-up grid; weight-tab rows are `.wlog`. Do not reuse class names across tabs.
- Apps Script `addMetaTag` only accepts four values (only matters if the sheet-bound version is ever used again).
