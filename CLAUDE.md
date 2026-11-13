# Parsec — working rules for Claude

Read this first, every session. It says **how to work on Parsec with the user**. How the code works is in the docs:
`README.md` (the tree, the commands) · `docs/CONVENTIONS.md` (where code goes, names, recipes — keep it open while you change code) · `docs/ARCHITECTURE.md` (how it works; read once) · `docs/AREAS.md` (every file and what it does; generated) · `docs/SERVER.md` (the server and admin plan) · `docs/NEXT.md` (the recommended next steps).

## What Parsec is

- The repair-order (RO) workspace for the service shop at Vanguard Truck Center, a Volvo dealership. The shop's system of record is ASIST/Decisiv; Parsec is the shop's own workspace beside it.
- It ships as **one file**, `Parsec_<version>.html`, that runs in the browser with no server and no installs, because the shop's computers allow no installs. The source is split into files; what the user opens and tests is always the single built file.
- The shop's data lives in its `Parsec Data/` folder (through the browser's file access), never in this repository. The sample data here is invented.

## Every session

1. `git pull` on `main`, since another session may have pushed.
2. Find the area in `docs/AREAS.md` and read the headers of its files, not the whole app.
3. Change `src/`, `styles/` or `assets/`, never `dist/` or a built file.
4. `python build.py`: every guard must pass.
5. Run the tests for what you touched.
6. Commit and push to `main` yourself, after every change (see Git), then tell the user in a few lines what changed.
7. Send the built file in the chat, `dist/Parsec.html` renamed `Parsec_<version>.html`, after every change, unless the user asks you to hold.

## Commands

On Windows the command is `python` (or `py`); elsewhere `python3`. Node must be on the PATH, because the guards use it.

| command | what it does |
|---|---|
| `python build.py` | → `dist/Parsec.html` (ships) and `dist/Parsec.test.html` (tests), about 2 s, every guard |
| `python build.py --accept-order` | only after reading the load-order diff, and only when the change is on purpose |
| `python tests/run.py t163a t162c` | the named tests; `--list` says what each one covers |
| `python tests/run.py` | the whole suite, about 40 min: before a release, not after every change |
| `python tools/headers.py` | refreshes the file headers and `docs/AREAS.md` after adding or moving code |

The tests need Playwright for Python, set up once per computer with `pip install playwright` and `python -m playwright install chromium`. `--no-checks` is for a quick look only, never for a release.

## How the user wants to work

- **Mock-ups before UI changes.** Before anything changes on screen (a page, a workflow, a feature), make an Idea picker (below) and build from the picks. Skip the mock-up only when the user gives a directive ("go ahead", "just do it", or exact instructions).
- **Fast turnarounds.** Keep replies short, in plain words, without recapping every step. Don't run the whole suite after every change: the build guards and the affected tests are enough until a release.
- **No screenshots of the work.** Look at screens yourself to check them, but don't send them. Send only the mock-ups and the built file (see Every session, step 7).
- **Plain words on screen.** Labels, tooltips and messages are written for the shop floor; `tipNorm` and the tooltip lint keep the style (see CONVENTIONS).
- **Ideas are welcome.** Offer them in a line or two, but don't build them unasked.
- **Ask first** before you change how data is saved (a `STATE` key's meaning, `PD_TOPICS`, the folder layout), because the real `Parsec Data/` folder has to keep opening. Ask before you delete a test, too.

## The code, in short (the details are in docs/CONVENTIONS.md)

- **One closure, many files.** `build/manifest.txt` is the load order. A new file goes in its area folder and into the manifest at the end of its area's run, with a purpose line in `tools/purposes.json`; then run `python tools/headers.py`.
- **No patch layers, no libraries, no CDN links.** The page has to work offline on the shop's computers.
- A new `STATE` key gets a home in `data/store-topics.js` (`PD_TOPICS`). A new setting goes through `sgReg`. Telling someone something uses `IB.send`; a question before an action uses `pgAsk`.
- **Leave room for the server.** Saving and loading go through `src/app/data/`, and who-can-do-what through `src/app/access/`. `docs/SERVER.md` lists the seams.
- When the build prints "worth splitting (over 60 KB)" for a file you're working in, split it.

## Releasing

1. In `src/app/kit/version.js`, write the new `BUILD` line (the version and a one-line summary) and move the old one to `BUILD_WAS`. So far a round of changes has been a point release (16.1, 16.2, 16.3); ask before a whole number goes up.
2. Run `python build.py`, then the whole suite. It should be all green, or you should know why not: `tests/RESULTS-17.md` lists the tests that already failed on 16.3.
3. Add the new entry at the top of `CHANGELOG.txt`, in the same shape as the others. Line 2 says which version is the newest.
4. Commit and push to `main`. GitHub refuses tag pushes from cloud sessions, so give the user the commands to run in the top Parsec folder: `git pull`, `git tag -a v17.5 <commit> -m "Parsec 17.5"`, `git push origin v17.5`.
5. Give the user `dist/Parsec.html` renamed `Parsec_<version>.html`. That one file is what goes to the shop; the test build never ships.

## Git

- **Work on `main`, no branches.** Commit and push each finished change yourself, right away; the user doesn't run git for changes, only for release tags. Use a branch only when the user asks for one.
- **The new look has its own branch, `new-look`** (asked for in Nov 2026; the plan is item 10 in `docs/NEXT.md`). Look work goes there; fixes and features go on `main` and are merged into `new-look` so it stays current. Say which branch a change is on.
- **One chat per branch** (asked for in Nov 2026). One chat works on `main` (fixes, features, releases); another chat owns `new-look`. A chat commits and pushes only to its own branch. Only the `new-look` chat merges `main` into `new-look` (`git merge origin/main` before each step); `new-look` is never merged into `main` until the plan's last step ships it. If a change belongs on the other branch, say so and leave it for that chat.
- One finished change per commit. The message says what changed for the user, e.g. "Time Log: drag an edge to change a punch".
- Commit mock-ups too (`mockups/`), with the change they led to, or on their own when they're delivered.
- Never commit `dist/`, anything from the real `Parsec Data/` folder or its exports, real customer data (names, phones, VINs), passwords or keys. The repository stays private.

## Company data and the computers

- Company data must not go off-site without IT's OK. Never copy files from the real `Parsec Data/` folder into this repository, a chat or a cloud service. Test with the sample data (`__tg.loadSample25()` in the test build), or with the test database once it exists.
- The work computer allows no installs, so whatever ships must run there as the one HTML file.
- Development happens on the user's personal computer, where installs are fine. The server, domain and test database are planned there (`docs/SERVER.md`). Nothing goes live, and no real data goes in, without the user's OK.

## Mock-ups: the Idea picker

The skill is in this repository: `.claude/skills/idea-picker/SKILL.md`, with `template.html` and `samples/`. Claude Code loads it as a project skill. **Always use the latest version:** before building a mock-up, compare the version in the repository's SKILL.md with any `idea-picker` skill the chat lists (the user's account copy). If the account copy is newer, copy it into the repository first and commit it; if the repository's is newer, use it and say once that the account copy is behind.

- **When:** the user asks for ideas, options or a mock-up, or before any UI change (see above).
- **The user's mock-up rules** are all in the skill. Keep them:
  - Short: the visuals and the options, almost no prose. The user asks when they want more.
  - A **Your picks** panel that gathers the picks into text to copy back into the chat, in the skill's exact format.
  - Every action animated the way it would really happen. Nothing moves until an option is picked; then it plays once and holds the result, and ↻ appears after the pick.
  - Parsec's real look, names and numbers.
  - A whole new look is shown as a **live look**: the app itself to click through, with a Tune drawer that goes deep (a choice for each part, sliders, a switch for each small move) and a Workbench page. The skill has the details.
- **Where it goes:** save it as `mockups/Parsec <topic> ideas mock-up.html` and commit it. Then show it where the user can click it:
  - In a chat that publishes artifacts, publish it.
  - In Claude Code on the user's computer, give the file's path to open in the browser.
  - In a cloud session, push it and tell the user to pull and open it.
- **Reading the picks:** build each picked option as its card describes. `skip` leaves that idea as it is, and `Notes:` overrides the cards.
- **Keep the skill current.** Update `SKILL.md` and `template.html` in the same commit, and say so in one line, when:
  - the user gives new feedback on mock-ups, or
  - a mock-up finds a better way (an animation pattern, a layout, a check that caught a problem).

  The user also keeps the skill on their Claude account. When the repository copy changes, mention once that the account copy is behind; in a claude.ai or Cowork chat, offer the update with the skill card.

## Keeping these rules current

This file and `docs/*.md` are part of the code, not notes about it.

- **When a rule changes or a new one is agreed**, update this file in the same commit, along with the doc the rule belongs to, and tell the user in one line which rule changed. That covers the user saying how they want something done, a convention being added, and a workflow or command changing. The docs:
  - code rules → `docs/CONVENTIONS.md`
  - how it works → `docs/ARCHITECTURE.md`
  - server and admin → `docs/SERVER.md`
  - the roadmap → `docs/NEXT.md` (mark items done)
- **One place per rule.** This file says how to work with the user; `docs/` says how the code works. Link to a rule instead of copying it, so two files never disagree.
- **Generated files:** `docs/AREAS.md` and the facts in the file headers come from `python tools/headers.py`. Never edit them by hand.
- **Keep this file short.** If a section grows past a screen, move the detail into `docs/` and leave a pointer here.
