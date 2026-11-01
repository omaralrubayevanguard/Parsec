# Parsec 12.3 — the RO page picks (read this first)

Base: `app/build12.py` (Parsec 12.2) + patch files `app/b9/build_*.py` (run alphabetically, at module level, see PLAN12.md for the API:
js, rep, b9, json, re, os, LOG, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LATE_TOKENS; JC_CSS append pattern).
Test builds: `PG_PATCHES=<list> PG_TAG=<x> python3 build12.py` → `app/Parsec_12x.html` + test copy `app/t12x.html` (≈150 s — run in the
background with nohup and poll; the shell times out at 2 min). Never write Parsec_12.html / t12.html (final integration only).
List the patches explicitly so another fork's half-done file never breaks your build:
- fork B: PG_PATCHES=build_fix12.py,build_imp.py,build_ocr.py,build_rop.py,build_tc123.py,build_tri.py,build_v122.py,build_v123.py PG_TAG=b
- fork C: PG_PATCHES=build_fix12.py,build_imp.py,build_ocr.py,build_rop.py,build_rop123.py,build_tri.py,build_v122.py,build_v123.py PG_TAG=c
Never `rm` with relative globs. Screenshots in `app/shots123<tag>/`. Never kill processes with `pkill -f`/grep patterns that can match your own shell.

## The picks (user, verbatim)
Time tab: colors follow — line and start dot: why it started · stop dot: why it stopped · one color per reason, everywhere (Time Log,
reason chips, day bar) · a slim day bar at the top, in the same colors · no legend — each line says its reason · editing inside the Time
tab: click a time or a reason to change it — no edit mode · deleting a punch: trash on hover — gone at once, Undo in the toast · adding a
time entry: a + between punches, and an icon in the tab header. The separate "Time punches / Day bar & details" section (opened by Edit
entries) goes away.
Icons: the word links become icons, the name shows on hover (tooltip) — only the word links (Add operation, Add part, From inventory…,
Extract from a quote…, Add time entry, Edit entries / Done editing, + Add note, + code…); the outlined buttons stay as they are; Start / Stop
and Save keep their words.
Operation header: the complaint line under the header goes, the "+ code" button goes (fault codes only in the Fault codes block), the
operation status (pill + dropdown) and the ⋯ menu move into the operation header row; the job type chip becomes a dropdown like part
status, each type its own color.
Tab actions: each tab's actions sit at the right of the tab row, only while that tab is open — Time: Add time entry; Parts: Add part, From
inventory…, Extract from a quote…; Files: Upload, Take a photo, Paste a screenshot.
Theme: color swatches in one inset strip above the profile row in the sidebar (theme only); folded sidebar: one swatch, click cycles.
Every RO page: the same changes on the RO page (from the RO list) AND the Technician page's RO.
Sample trucks: from the truck catalog — year, make, model, configuration (axles and cab — "6x4 · High-roof sleeper"), sleeper length
("70-inch"; day cabs none), engine and horsepower; they show on the truck line under the name, and in Vehicle.
The mock-up: build/rp2/rp2.html (open it — the look to match).

## Shared (fork A = me: b9/v123.js, b9/v123.css, b9/v123_jc.css, b9/build_v123.py — top-level globals, use them, don't copy them)
- Colors: CSS vars `--rc-<k>` for every clock reason (keys of REASON_RC: diag rep insp i74 dot test bench wparts wforeman wtech wappr wnew
  done lunch eod switch pulled declined) and `--jt-<k>` for job types (op diag pm warr cb sub rec) — defined in the main document AND in the
  RO page's shadow root (JC). `reasonVar(r)` (exists) → "var(--rc-k)"; `jtVar(k)` → "var(--jt-k)"; `JT_KEY`.
- `truckCfg(ro)` → "6x4 · High-roof sleeper" ("" when unknown); `truckLine(ro)` → "2020 Volvo VNL 760 · 6x4 · High-roof sleeper · 70-inch"
  (falls back to the year/make/model Parsec reads today). New RO fields from the samples: ro.year (number), ro.make, ro.model, ro.axles,
  ro.cab, ro.sleeper ("70-inch" or ""), ro.engineType ("D13 TC · 455 HP").
- Sidebar theme strip, sample trucks: fork A.

## Owners
- B (fork): the Technician page's RO — b9/tc1.js, b9/tc.css (+ b9/build_tc123.py for any rep on other code). Time tab (colors, day bar,
  edits in place, delete, add), icons with tooltips for its word links, the operation header (status + ⋯ into the header, job type dropdown,
  no complaint line / + code in the body), tab actions in the tab row, the truck line + Vehicle rows (Configuration, Sleeper, Engine).
- C (fork): the RO page (JC shadow root) — b9/rop1.js, b9/rop_jc.css, b9/build_rop.py, + b9/build_rop123.py for reps on JC code. Same list,
  plus: remove the separate Time punches section (and its Edit entries / Done editing), Add operation as an icon, the band's truck line.
- A (me): v123 shared, sidebar theme strip, sample trucks, the clock card mock-up, integration + changelog.
Each fork: test its page on desktop 1440 and phone 390, four themes, no console errors, run app/_t122.py and app/_int/_t12d.py against its
t12x.html (copy and point H/PAGE), and finish with a short report: what changed, file list, anything left.
