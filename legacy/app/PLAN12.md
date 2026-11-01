# Parsec 12 — shared plan for the parallel work (read this first)

Base: `app/build12.py` = build11.py (Parsec 11.3) + patch-file hooks. It execs every `app/b9/build_*.py`
(or only the ones in `PG_PATCHES=a.py,b.py`), right before the BUILD label, at module level, so a patch file
sees and changes `js` (the whole app script with the modules in), and can use `rep`, `b9`, `json`, `re`, `os`, `H`, `C`, `LOG`.
A patch file may append to:
- `EXTRA_CSS` — raw CSS strings for the main document (not page-scoped, not renamed)
- `KEEP_EXTRA` — top-level names the prune must keep
- `HOOK_NAMES` — names exposed on the test hook `window.__tg` (must be top-level `function X` / `var X` in js)
- `LATE_TOKENS` — {token: text} put into the final file at the very end (big assets; the token must appear exactly once)
JC (RO page) CSS goes into the JC_CSS string the same way build11 does it:
`_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0); js = js[:_jc1] + json.dumps("\n" + b9("x_jc.css"))[1:-1] + js[_jc1:]`

Test builds: `PG_PATCHES=build_X.py PG_TAG=x python3 build12.py` → `app/Parsec_12x.html` and the test copy `app/t12x.html`
(about 150 s — run it in the background with nohup and poll; the shell times out at 2 min).
Never write Parsec_12.html / t12.html (that's the final integration). Don't edit build12.py, build11.py, or existing b9 files
other than the ones listed as yours — make every change to shared code a `rep(...)` in your own patch file.
Never `rm` with relative globs. Put screenshots in `app/shots12<tag>/`.

Owners
- A (fork): Triage mock-up only — `build/tri/*`, output `/mnt/user-data/outputs/Parsec Triage transfer and road test mock-up.html`.
- B (fork): the screenshot reader built in — `app/b9/build_ocr.py`, `app/b9/ocr*.js`, `build/ocr/*` (vendor files).
- C (fork): the New RO import — `app/b9/build_imp.py`, `app/b9/imp*.js`, `app/b9/imp*.css`.
- D (fork): the RO page layout + picking on the RO page — `app/b9/build_rop.py`, `app/b9/rop*.js`, `app/b9/rop*_jc.css`.

Data fields (C writes them, D shows them on the RO page; both use these names)
RO: roNumber, caseNumber, customerName, custNo (new), status, promisedAt (ETR, ISO), followUpAt (new, ISO), createdBy (new, a name —
  also the Advisor in People when no advisor is set), dateOpened, poNumber (new), authNumber (new), techSupportCase, department (new),
  year, make, model, vin, unitNumber, chassis (new), engineType, engineSerial (new), mileage, engineHours, keyTag, location,
  extNotes (new: [{id, at, by, text, kind: 'user'|'system', src: 'ASIST'}] — RO-level notes from ASIST), imp (new: the import memory).
Operation: complaint, quoted, estCost, asistApproval (new: 'Approved'|'Pending'|'Declined' — shown only, never changes the status),
  label (new: ASIST label status, text), skill (new), work / log (technician story → cause/correction/work), parts[].
  Op code, VMRS and price code are NOT fields (the user left them off): C writes them once into the operation's notes (offNotes).
Part: description, partNumber, qty, price (unit), core (new: core charge $), salesman (new), status.

User picks for the import: New RO and Import on the RO page · show the changes, then Apply · ASIST and Parsec both changed a field → keep
Parsec's (show ASIST's beside it) · screenshot reader built into the file (B) · people not on the Team → add them to the Team (no pages,
no sign-in) · part prices also update the Parts list · ASIST approval shown only · new fields: PO #, Auth #, Department, Follow-up,
Chassis / serial, Engine serial, Skill, Core charge, Salesman.

RO page picks (the RO page mock-up, now for the real RO page too): Middle: Operations, Parts on this RO, Activity & notes, Fault codes,
Photos & codes, Messages about this RO, Truck history, Warranty claim, Customer, Estimate & approval, Ready to close. Right: Truck &
status, Stage bar, Who has it, People, Schedule, Vehicle, Money. Taken off: Next step, Paperwork. Open operation: tabs (Time, Parts,
Files) with the notes inside the Time tab between each punch's start and stop. Truck picture big. BUT Activity stays the header button
+ pop-up from 11.3 (the user's newer request) — no Activity block in the middle of the RO page.
Picking picks (selecting mock-up): box on hover + Ctrl/Shift click; bar along the bottom; parts on one operation at a time; operation
actions Start, Hold, Ask Parts, Ask the foreman, Note on all, Add a code, Mark done, Print job jacket, Copy the story; part actions
Picked up, Installed, Ask Parts, Return, Move to…, Copy part numbers, Print pick list; no new keys.
The Technician page (b9/tc1.js, b9/tc.css) already does all of this for one tech — port its behaviour, not its markup.
