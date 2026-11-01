# Parsec · how it works

One HTML file. One script, one closure. All data in two objects. One function that draws. This page is the map a developer needs before opening `src/app`; `AREAS.md` lists every file.

## 1. The page

`src/page.html` is the skeleton: a `<head>` with the base stylesheets, an empty `<div id="app">`, the RO engine, the two QR libraries, and the app script. The build (`build.py`) fills its markers and writes `dist/Parsec.html`. Fonts come from Google Fonts when online; everything else is inside the file.

The app script is `src/app/_head.js` + every file in `build/manifest.txt` + `src/app/_tail.js`, which together read:

```js
(function(){ "use strict";
  …every file, in manifest order…
})();
```

So **every file shares one scope**. Function declarations are hoisted, so a function in `pages/foreman/actions.js` can call one in `ro/actions.js` wherever either sits. What *does* depend on order is everything that runs while the script loads: `var` constants, the page closures (`var TL = (function(){ … })();`), `document.addEventListener(…)`, the wrappers (`doStartPunch = guard(doStartPunch)`), timers, and `boot/init.js`. The manifest fixes that order and `build/checks/structure.js` guards it.

## 2. State

Two roots, in `state/state.js`:

- **`STATE`** — everything the shop keeps: `ros` (each with `operations`, `parts`, `bulletins`, `history`), `punches`, `shifts`, `staff`, settings (`shop`, `fmCfg`, `rtCfg`, `waCfg`, …), automations, the Inbox, `tcDone`, `shopBtns`, `setLog`, … Every key has a home in the data store map (`data/store-topics.js`, PD_TOPICS); the build fails when one doesn't.
- **`UI`** — what this screen shows: `view`, `selectedRo`, open pop-overs and modals, per-page UI state. Saved per browser (`persistUI`), never shared.

Pages read `STATE` freely. They change it only through actions (`ro/actions.js`, each page's `actions.js`, `ro/details-table.js`'s `roFldSet`, `settings/values-and-changes.js`'s `sgChange`), which: `pushUndo()` first, change the data, `scheduleSave()`, `render()`.

## 3. The loop

```
click / key  →  shell/event-wiring.js (data-action dispatch) or a page's own handler
             →  an action changes STATE  (pushUndo · change · scheduleSave)
             →  render()                  shell/render-root.js
                   picks UI.view → viewHtml (a page module's view()) → patchApp() morphs it into #app
                   then the after-render hooks: the page module's after(), trkHydrate (pictures), lists fold, drafts…
             →  scheduleSave()            data/store-api.js
                   cleans (v160CleanSave) · marks (updatedAt/by) · persistLocal (localStorage mirror) · 400 ms debounce
                   → doSave() → writeFolderState() → pd16Save() writes only the changed files of Parsec Data/
                   → autoQueue() → the automations watcher compares before/after (automations/watcher.js)
```

`shell/live-time.js` ticks every second and patches only the figures that move; it never calls `render()` while you type (`safeToRedraw`).

## 4. Pages

Each page is a closure that registers itself with the shared frame `PG` (`pages/frame.js`):

```js
var TL = (function(){ … return { view: view, after: after, … }; })();   // pages/timelog/
function viewTimeLog(){ return TL.view(); }
```

`render()` finds the module for `UI.view` (`PG.mods`) and calls `view()` for the HTML, then `after()` to place pop-overs. Each page folder has the same shape: `model.js` (what the page knows, from STATE), `draw.js` (HTML), `popovers.js`, `actions.js` (clicks, typing, keys), `view.js` (the entry). The first and last file of a closure are `_open.js` / `_close.js`.

**The side bar** (`shell/nav-rail.js`) draws the pages in `pxaOrder()` (`shell/nav-arrange.js`): the person's own order (`sf.nav.order`; the Admin's in `STATE.mgSet.navMe`), else the shop's (`STATE.mgSet.nav.order`, set by anyone who can change settings), else `PX_GROUPS`. Press and hold a page to drag it; a switch per page hides it (`sf.nav.hide`), and the name menu lists the hidden ones.

**Department pages** (Technician, Triage, Foreman, Parts, Warranty, Manager) carry **Time Log** and **Career** as tabs: `dpTitle()` (`shell/dept-tabs.js`) turns the page's `<h1 class="tg-h1">` into “Technician · Time Log · Career”. The two keep their own modules (`UI.view` `timelog` / `career`); `UI.dHome` is the department they sit on, so the side bar keeps it lit. Everyone has their own Time Log; Career is for technicians and foremen; seeing anyone else's needs `t.others` (“See other people’s time” — the foreman and the manager), and Manager › Team opens a person's Time Log, timesheet or Career.

Pages that predate the frame — Foreman, Triage, Warranty, the RO rail — are plain functions in their folders (`fmView`, `tgView`, `waView`) called from `render()` the same way.

**The RO page** (`ro-page/`, the `JC` closure) is different: it renders into a **shadow root** so its stylesheet (`styles/ro-page/`, the `JC_CSS` string) cannot leak. `ro-page/state.js` holds `R` (the root), `RO` (the open RO), `S` (its UI state); `ro-page/render.js` draws it; `ro-page/layout.js` + `build-and-fold.js` lay out the one-panel page (operations in the middle, the truck card and sections on the right). The Technician page embeds the same RO page (`one-ro-view.js`). Tests reach it through `document.querySelector('.jc-host').shadowRoot`.

## 5. Data store (layout 16)

`data/` — the folder `Parsec Data/`:

```
layout.json                          the layout version, the app that wrote it
ROs/Open/<RO - Customer>/ro.json     one folder per open RO  + <RO> Repair Order.html (readable) + Attachments/
ROs/Closed/<year>/…/ro.json.gz       closed ROs by year, compressed
Shop/<topic>.json                    everything else by topic (staff, settings, punches/<YYYY-MM>, activity/<YYYY-MM>, …)
Backups/<YYYY-MM>/data-<date>.json.gz   end of day, keep 30
Exports/<date time>/                 tables/*.jsonl + attachments + schema.json + README + manifest (sha256)
Library/<kind>/<number> - <title> (rel NN).pdf   the Library's documents (Fault codes, CBR, TSB, FSB, Recalls, Procedures, Diagnostics), one copy each (17.1)
```

- **The Library (17.1)**: `library/` reads codes and documents and files them; `pages/library/` is the page; `ro-page/library-on-ro.js` puts them on an operation. Its records are `STATE.libDocs` (one per document and release), `STATE.libCodes` (codes read from a DTC bulletin, with their FTBs) and `STATE.libRules` (number prefixes the shop taught it), in `Shop/library.json`. An operation links a document with `op.docs = [{ id, at, by }]`, and a copy goes into the RO's `Attachments/` (the entry's file carries `doc`). Nothing is filed without the person saying File it (`libIntake`). The codes in a document are read into `libCodes` only when its kind is Fault codes (a DTC bulletin is offered as Fault codes); Procedures and Diagnostics are read into steps; every other kind is filed with its details as it is.

- **Records**: every record has an id and `updatedAt` / `updatedBy`; deletions leave a mark in `STATE.tombs` (`store-records.js`).
- **Write**: `pd16Write` writes only what changed since the last write (`store-read-write.js`).
- **Open / merge**: `adoptFolderState` merges the folder with memory record by record — newer wins, deletions carry, a clash on the same record asks (`store-merge.js`, `store-save-open.js`). A poll notices another computer's save.
- **Clean data**: dates ISO, days `YYYY-MM-DD`, money as dollar numbers (cents in exports), slim Completed records (`clean.js`; `STATE.dataV` = 16).
- **Export for the server**: tables as JSONL with a manifest and checksums; `import-export.js` verifies and round-trips (`export.js`).
- Without a folder (`FS_LOCAL`, the tests, a quick look) the app runs on the localStorage mirror only.

## 6. People, access, guards

- `access/sign-in.js` — who is using this computer (`tec_viewas`); `pin-pad.js`, `lock-screen.js`, `pins.js` (salted SHA-256).
- `access/permissions.js` — roles → pages and actions, per-person changes; `can(action)`, `canPage(page)`. Time Log and Career are not on the page list (17.1): everyone has their own (`navAllowed`), and `t.others` lets someone see other people's.
- `access/guards.js` — the shared functions are *wrapped* at load so a role that may not act is refused before any page sees the click; `permRootSync` puts a class per missing action on `<html>` so the button isn't drawn.
- `access/admin-page/` — the Admin page; `admin-helpers.js` is shared with Manager → Team.

## 7. Cross-cutting pieces

| piece | where | one line |
|---|---|---|
| Inbox | `pages/inbox/model.js` `IB.send({to, t, b, …})` | how any area tells a person something; derived items (hand-offs, asks) are computed, stored ones kept |
| Automations | `automations/` | `autoRun` compares the last saved snapshot with the new one, raises events, rules act (built-ins + sentence rules); What ran with Undo |
| Settings | `settings/registry.js` `sgReg()` | every setting is one row: group, who may change, where it applies, get/set, default; the page, search, Reset and Recently changed come free |
| Tooltips | `kit/tooltip-words.js` + `kit/tooltip-engine.js` | one tooltip; `tipNorm` rewrites every title into the house style; the build lints them |
| Status look | `kit/status-look.js` `pgSt()` | one icon + word per status everywhere |
| RO links / pictures | `shell/ro-rail.js` `rl163Deco` | every RO number is a link, every RO row shows the truck; runs on the new markup before the morph |
| Questions | `ro/flow-gates.js` `pgAsk()` | the shared "are you sure / which one" dialog |
| Trucks | `trucks/` | `trkPick(ro)`: the RO's own picture, else the catalog body for its model/year, else the check-in photo |
| Clock | `clock/` | day clocks (shifts) and punches per person; the clock only reminds, never stops anything |
| Phone | `phone/` | the phone layout, and sync by QR codes (no network) |
| Sample data | `sample/` | 25 ROs with six weeks of history; `loadSample25()` |

## 8. Boot

`boot/init.js` (last in the manifest): theme and device → `restoreFolder()` (reconnect the folder from IndexedDB, else show the folder gate) → `FS_READY` → `render()` → timers and window listeners. The first `autoRun()` only takes a baseline.

## 9. The test build

`dist/Parsec.test.html` = the same app + `src/test/hooks.js`: `FS_LOCAL = true` and `window.__tg`, an object of hooks into the closure (`STATE`, `UI`, `render`, `loadSample25`, the page closures, …). Tests (`tests/`) load it with Playwright, call `__tg.loadSample25()`, and drive one area. Nothing of this is in `dist/Parsec.html`.
