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

**The side bar** (`shell/nav-rail.js`) draws the pages in `pxaOrder()` (`shell/nav-arrange.js`): the person's own order (`sf.nav.order`; the Admin's in `STATE.mgSet.navMe`), else the shop's (`STATE.mgSet.nav.order`, set by anyone who can change settings), else `PX_GROUPS`. Press and hold a page to drag it; a switch per page hides it (`sf.nav.hide`), and the name menu lists the hidden ones. Folded to icons, it opens over the page while the pointer rests on its expand button (`px-hover`). Its width and the panes' widths (a page's `.tg-list`, the Settings list, the RO list's side panel, the Library's document panel) are dragged at their edges and kept per person in this browser (`shell/widths.js`, `--px-rail-w`); a new list pane under `.tg-body` gets its edge for free.

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
- **The Library page (17.3)**: `pages/library/shop-and-cards.js` — it opens on For the shop (documents matching an open RO by code or symptom without contradicting the truck, and recalls that fit one), a bar by kind with what needs you, one search across every kind, the truck filter (model · year · Fits RO …) and To check, documents as cards with older releases folded. Pointing at a card opens the panel (a click keeps it); the panel (`library/viewer-use.js`) shows Valid for, the symptoms and the repair steps (`d.steps`, ticked into `op.procDone` from an operation), Attach to… with the ROs it fits first, and ⤢ for a page of its own.
- **Reading more (17.3)**: `library/read-more.js` adds to what `libDocRead` finds — part numbers, labor operations and hours, chassis ranges, symptoms, the repair in one line, the two likeliest kinds when the number gives none, and the fields read from somewhere weak (`doubt`, marked “check” on the card); `src` says which words each field came from, and the card shows the document beside it. A document keeps `parts`, `labor`, `chassis`, `symp` and `fix`; `STATE.libRules` can also hold `{ drop }` (a phrase to leave out of titles). On an RO, `libFits` says whether it covers the truck (chassis, model, year), `libSympHit` offers a document by the complaint’s words, and the parts, hours and repair go onto the operation one click each (`libUseParts` / `libUseHours` / `libUseFix`). Several files at once read under a progress window into one list (`library/intake-list.js`), with File N ready; the newest release of a document is the one offered (`libLatest`).

- **Records**: every record has an id and `updatedAt` / `updatedBy`; deletions leave a mark in `STATE.tombs` (`store-records.js`).
- **Write**: `pd16Write` writes only what changed since the last write (`store-read-write.js`).
- **Open / merge**: `adoptFolderState` merges the folder with memory record by record — newer wins, deletions carry, a clash on the same record asks (`store-merge.js`, `store-save-open.js`). Every 5 s (`pd16Poll`, only `layout.json` is read until its `writeId` changes; at once where the browser has a folder observer) another computer's save is merged in and the pages redraw. A save that finds another computer saved since its check writes nothing, merges first, then saves again.
- **Files in the folder**: `ro-page/bulletins.js` `scanFolder()` — a file put straight into an RO's `Attachments/` (or a folder inside it) gets a record on that RO's Files within seconds (every 4 s, at once on coming back to the window or from the folder observer); deleted there, it leaves. The RO on screen is scanned first and drawn at once; closed ROs every 30 s. A record's `fname` is its path inside `Attachments/` (`Photos/hub.jpg`).
- **Clean data**: dates ISO, days `YYYY-MM-DD`, money as dollar numbers (cents in exports), slim Completed records (`clean.js`; `STATE.dataV` = 16).
- **Export for the server**: tables as JSONL with a manifest and checksums; `import-export.js` verifies and round-trips (`export.js`).
- Without a folder (`FS_LOCAL`, the tests, a quick look) the app runs on the localStorage mirror only.

## 6. People, access, guards

- `access/sign-in.js` — who is using this computer (`tec_viewas`); `pin-pad.js`, `lock-screen.js`, `pins.js` (salted SHA-256).
- `access/permissions.js` — roles → pages and actions, per-person changes; `can(action)`, `canPage(page)`. Time Log and Career are not on the page list (17.1): everyone has their own (`navAllowed`), and `t.others` lets someone see other people's.
- `access/guards.js` — the shared functions are *wrapped* at load so a role that may not act is refused before any page sees the click; `permRootSync` puts a class per missing action on `<html>` so the button isn't drawn.
- `access/admin-page/` — the Admin page; `admin-helpers.js` is shared with Manager → Team. `person-page.js` (17.3) is one person's page: role, Sign-in, and tabs for Pages, What they can do (Role · On · Off) and Activity. Settings › People & access only links to it.

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
| One RO panel | `ro/ro-panel.js` `rpPanelHtml()` | one HTML for the RO list's side panel and the RO page's right column (there slotted as light DOM: `.jc-host > .rp-host[slot=rp]`, mounted by `rpMountRo`; the RO page keeps its own buttons at the bottom and its status menu on the pill). Small picture (opens Truck & photos), status, stage, operations, details with Collapse all; `rpFold` keeps each person's folds |
| Operation row and card | `ro-page/operation-header.js` `ropOpRow()` `ropFacts()` | the row is the number, the complaint (whole on hover) and the status, a blocker beside it; the job type is its coloured edge (`ropJtEdge`, a click changes it). Inside the card: the facts (job type, group, skill, ASIST, steps), Add ▾ for a code, a document or the Library (`fcAddBtn`), the hours on the clock card |
| Steady redraw | `ro-page/steady-redraw.js` | the RO page draws fresh on every change; around it, what was on screen keeps its look (an opening plays only for what is new), a picture already showing is reused, a scrolled box keeps its scroll. The RO's panel beside it is morphed (`morphChildren`), never replaced |
| Notes on the time bar | `ro-page/clock-card-draw.js` `ockPins()` `ockBarAt()` | every clock card's bar: initials over each piece, a pin where each note was written (point to read), a click adds a note at that moment to the punch under it. A note's time is kept beside it on the punch (`p.noteAt`, by its words; `ockNoteTime`), the words stay as typed; an old note with no time sits at the end of its punch |
| One extraction window | `import/new-ro/dialog.js` `dialog-layout.js` `IMPX.open({ ro, opId, target })` | every way in opens the same window: New RO, files dropped or a case pasted anywhere (`open.js`), Import / Extract operations on an RO (`{ ro }`), Extract parts on an operation (`{ ro, opId }`: a quote's parts go on it), Import a parts list (`{ target: "inv" }`). Files sit in a strip; a picture with almost no words is a photo (→ the RO's Files), a PDF that isn't the case is a document (→ the Library, asked first); the RO reads as a ticket with empty fields hidden; Check walks through what to check; the header's chip changes where everything goes. The 14.8 Extract operations dialog (`ro-page/extract-operations.js`) is no longer opened The paperwork's quoted hours win over hours typed here. Each operation's status (Waiting – Parts, Hold, Complete…) is read by `stOf` and set as a status picked on the job card; a status changed here since the last read stays, and a running clock keeps it Working. |
| Reading the case | `import/new-ro/` `IMPX.parse()` | New RO reads pasted text, screenshots (the built-in reader) and PDFs: `fixDigits` puts back letters read for digits and `vinRepair` uses the check digit (`field-rules.js`); `chkField` / `chkOpHours` / `chkPart` flag values that don't agree (`read-checks.js`); `mtCustomer` / `mtTruck` / `mtPart` / `mtCodes` offer what Parsec already knows (`read-match.js`). The dialog counts them in "to check". The scorecard `t173a` scores every sample against `tests/fixtures/reading/corpus.json` |
| Past fixes | `pages/fixes/common-fixes.js` `fixAll()` `fixMatchFor(op)` | every fixed operation plus the hand-added fixes. Which one fits an operation is a hierarchy: with only a complaint, the same complaint; with codes or documents, the fix with the same codes (by code, ignoring FTB / FMI) and documents (`exact`), then one sharing any (`close`), then a differently worded fix with the same code and document (`codes`); a same-complaint fix with other codes is `other`, never shown as the fix. The operation's chip (`ro-page/fault-codes.js`), the Fixes page's order and the Technician card all use it A fault code alone matches too (tier `code`); within a tier, the same truck model, then the same engine, then the newest come first. |
| Truck colour | `trucks/paint.js` `trkColorOf(ro)` `trkPaintSrc()` | `ro.color` (a name from `TRK_COLORS`, or a hex); set from the Colour row in the Vehicle section (ROFLD `color`, a swatch picker) or by New RO from the case. An RO without one takes the truck's from its last visit (same VIN). `trkPick` / `trkTopOf` hand back the catalog picture repainted: the body's own paint (white, grey or its hue) found and recoloured with its shading, side and top views; painted once, cached; never a photo or the shop's own picture Glass and chrome are left alone: a light pixel ringed by dark (a windshield reflection) or in a busy light-and-dark stripe (a stack, a bumper) isn't paint; a silver or grey body's own range of light is measured, so darker sweeps fill in. |
| Tech notes and release | `ro/forecast.js` `opNotesTxt(op)` · `ro-page/release-bypass.js` | The tech notes (punch notes, notes off the clock, older `op.work`) count as the story for every check (`fcHasCause` / `fcHasFix`). With the RO's road test off (`ro.noRoadTest`): the status reads Complete, a Release button replaces Road test and Truck checks, and Released asks “Release anyway?” with what's still open (`ropBypassAsk`). |
| Cause and Correction | `ro/cause-correction.js` `ccSync(op)` `ccSplit(op)` · `ro-page/cause-correction.js` `ropCcPanel(job)` | Filled from the tech notes, in the Time tab beside them: the sentences in time order, the first half the Cause and the rest the Correction; a sentence starting “Cause:” / “Fix:”, or a cause or fix written as its own note, goes where it says; the tech moves any sentence (`op.ccTag`). Saved as one work-log entry each (`kind` cause / fix, `cc: "c"` / `"x"`), which `opStory` returns, so Warranty and Fixes read them as before. A line typed by hand stays (`op.ccHand`), and the card asks when the notes change. ✦ suggests both lines (`tcBuild`); Copy the story gives Complaint · Cause · Correction. |
| Smooth scrolling | `shell/smooth-scroll.js` | a mouse wheel's steps glide in every scrolling pane, the RO page's too |
| Widths | `shell/widths.js` `pxwAfter()` | drag edges on the side bar and the panes, the hover-open side bar; localStorage per person, never shop data |
| Phone | `phone/` | the phone layout, and sync by QR codes (no network) |
| Sample data | `sample/` | 25 ROs with six weeks of history; `loadSample25()` |

## 8. Boot

`boot/init.js` (last in the manifest): theme and device → `restoreFolder()` (reconnect the folder from IndexedDB, else show the folder gate) → `FS_READY` → `render()` → timers and window listeners. The first `autoRun()` only takes a baseline.

## 9. The test build

`dist/Parsec.test.html` = the same app + `src/test/hooks.js`: `FS_LOCAL = true` and `window.__tg`, an object of hooks into the closure (`STATE`, `UI`, `render`, `loadSample25`, the page closures, …). Tests (`tests/`) load it with Playwright, call `__tg.loadSample25()`, and drive one area. Nothing of this is in `dist/Parsec.html`.
