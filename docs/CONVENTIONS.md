# Parsec · how to change it

Read `ARCHITECTURE.md` once; keep this one open while you work. The working rules (mock-ups first, releasing, git, company data) are in `CLAUDE.md` at the top of the repository.

## Where code goes

| you are changing… | it lives in |
|---|---|
| a page's behaviour | `src/app/pages/<page>/` — `model.js` (data), `draw.js` (HTML), `popovers.js`, `actions.js` (clicks, typing, keys) |
| the RO page | `src/app/ro-page/` (inside the `JC` closure); its styles in `styles/ro-page/` |
| what an RO *is* — status, stages, hours, transfers, the details table | `src/app/ro/` |
| the clock, punches, reminders | `src/app/clock/` |
| what is saved, the folder, backups, export | `src/app/data/` (and the map `data/store-topics.js`) |
| sign-in, permissions, PINs, the Admin page | `src/app/access/` |
| the frame: sidebar, render, event wiring, modals, search | `src/app/shell/` |
| a shared helper, icon, formatter, the status look, tooltips | `src/app/kit/` |
| an automation | `src/app/automations/` |
| a setting | `src/app/settings/registry.js` (`sgReg`) |
| styles | `styles/app/NN-<name>.css` — a new area gets a new numbered file at the end; the RO page's in `styles/ro-page/` |
| a picture, an icon file | `assets/` + a line in `assets/index.txt` (or `assets/trucks/index.txt`) |

A new file: put it in its area folder, add it to `build/manifest.txt` **at the end of that area's run** (or just before `boot/init.js` when it only declares functions), give it a header, build. The guard will tell you if its load order matters.

## Names

Prefixes are how this codebase finds its way; keep them:

- `fm*` Foreman · `tg*` Triage · `wa*` Warranty · `rop*` / `px*` the RO page · `ock*` the clock card · `trk*` / `vt*` trucks · `pd*` / `pd16*` the data store · `sg*` Settings · `lg*` login/PIN/lock · `perm*` permissions · `auto*` automations · `v1NN*` a feature that came with version 1.NN (e.g. `v146*` the clock watch, `v163*` the RO links) · inside a page closure, short names (`view`, `head`, `list`, `rd`, `pop`, `H`).
- Constants are `UPPER_CASE`, module closures are `UPPER` (`TL`, `PT`, `JC`), everything else `camelCase`.
- A `STATE` key reads like data (`punches`, `shopBtns`), a `UI` key like what the screen does (`view`, `selectedRo`, `fmOpen`).
- CSS classes carry the area's prefix too (`.fm-`, `.tg-`, `.rop-`, `.sg-`); the frame's own are `.px-`/`.pz-`/`.iv-`.

## Comments

- Every file starts with the header: purpose (one line, what a developer gets from this file), **Flow** (how it does it, in one or two lines, naming the entry function), then the generated facts. The purpose lines live in `tools/purposes.json`; `tools/headers.py` rewrites the facts.
- Inside a file, keep the section banners (`/* ---------- the floor ---------- */`) and write a short comment where the *why* isn't obvious — a rule, an order dependency, a browser quirk. Don't narrate the obvious.
- A version tag in a comment (`Parsec 14.7:`) is history worth keeping; it tells a reader when and why a rule arrived. Don't add new ones for ordinary edits — the changelog has them.

## The recipes

**A new setting.** One row in `SG_REG` (`settings/registry.js`): `{ id: "shop.x", g: "shop", sub, label, help, who, where, kind, def, get, set }` — or, from the area that owns the value, push the row onto `sgReg()` at load the way `settings/shop-buttons.js` does with `V163_SG`. The page, search, Reset, Recently changed and Undo come with it. If the value is a new `STATE` key, add it to `PD_TOPICS` in `data/store-topics.js` (the build insists).

**A new STATE key.** Decide its topic in `data/store-topics.js` (`PD_TOPICS` — which `Shop/<topic>.json`; `PD_SPLIT` if it grows by month/year; `PD_LOCAL_ONLY` with a reason if it must not leave this computer). Records that people edit get an `id` and go through `pdMark` automatically on save.

**A new automation.** A built-in: add it next to the six in `automations/built-ins.js` (a condition in `v162Conds`, a message in `v162Msgs`, its switch), and the What ran log + Undo come free. A new event or field for sentence rules: `automations/sentence-builder.js` (`V162B_TRIG` / `V162B_FIELD`).

**A new page.** A folder under `pages/` with `_open.js` (`var XX = (function(){`), `model.js`, `draw.js`, `actions.js`, `_close.js` (`return { view, after, … }; })();`) and `view.js`; register in `pages/frame.js` (`PG.reg`), add the nav entry (`shell/nav-rail.js` PX_GROUPS — the default order; people's own orders and the shop's (`shell/nav-arrange.js`) take a new page in after its neighbour — and `access/permissions.js` pages per role), a `styles/app/NN-<page>.css`, and a test.

**A new test.** `tests/t<version><letter>.py`, copied from a recent one: load `t12.html` (the runner passes it), `__tg.loadSample25()`, sign in a role, drive the UI, print `ok …` / `FAIL …`, exit non-zero on a failure. Run it with `python3 tests/run.py t<name>`.

**Reading better.** Any change to how New RO reads a case runs the reading scorecard first and after: `python tests/run.py t173a`. A misread that comes up in the shop becomes a new case in `tests/fixtures/reading/corpus.json` (invented values, the same shape), and when the score goes up, raise `floor` to just under it so it can't slip back.

**Telling a person something.** `IB.send({ to: name, t: title, b: body, k: kind, ro, op })` — never a bare toast for something they must act on.

**A question before an action.** `pgAsk({ head, sub, list, buttons }, cb)` (`ro/flow-gates.js`); it keeps the house wording and keyboard (Enter = the primary button, Esc = cancel).

**Something that moves.** Opening, closing, folds and tabs already move (`shell/motion-open.js`, `styles/app/57-motion.css`); add a selector there rather than a new animation. Motion never dims the whole page: an ease-in starts at 85 % opacity and 3 px, and only what changed moves. On the RO page, an element with an opening animation needs a key of its own (`data-key`, `data-op` or `data-job`) so a redraw can tell a new one from the same one (`ro-page/steady-redraw.js`); never replace a panel's `innerHTML` that stays on screen — morph it (`morphChildren`).

**A tooltip.** Write the `title` in plain words; `tipNorm` fixes the style and the build lints it. If a phrase needs an exact rewrite, add it to `TIPMAP` in `kit/tooltip-words.js`.

## What the build enforces

`python3 build.py` stops on: a syntax error (with file and line) · a file missing from or doubled in the manifest · a name declared twice · a constant read at load before it exists · a load order different from `build/order-baseline.json` (accept a deliberate change with `--accept-order`) · a `STATE` key with no home · a tooltip that breaks a rule · a file without a header. It also prints how many files, functions, listeners and wrappers there are, so growth is visible.

## Releasing

The steps are in `CLAUDE.md` → Releasing: version line, build and the whole suite, the `CHANGELOG.txt` entry, the tag, then `dist/Parsec.html` shipped as `Parsec_<version>.html`. The test build never ships.

## What not to do

- Don't edit `dist/`. Don't patch the built file. Don't reorder the manifest to "tidy it" without reading the guard's diff — the capture-phase key and click handlers (PIN pad, menus, pop-overs) rely on their order.
- Don't put data in `UI` or screen state in `STATE`.
- Don't reach into another page's DOM; change `STATE` and `render()`.
- Don't add a library. The app has no build dependencies on purpose (no installs on the shop's computers).
