# Parsec

The repair-order workspace for the shop: one HTML file (`dist/Parsec.html`) that runs in the browser with no server and no installs, and keeps the shop's data in a folder (`Parsec Data/`) through the browser's own file access.

This folder is the **source**. Nobody edits `dist/Parsec.html` by hand: change a file under `src/`, `styles/` or `assets/`, build, test, ship the built file.

```
python3 build.py          # → dist/Parsec.html (the app) and dist/Parsec.test.html (the app + the test hook)   ~2 s
python3 tests/run.py      # every test against the test build (3 browsers at a time, ~40 min); or name a few: tests/run.py t163a t162c
python3 tools/headers.py  # refresh the generated facts in every file header and docs/AREAS.md
```

Needs Python 3 and Node (the guards parse the app with a vendored copy of acorn, `vendor/acorn/`). On Windows the command is `python` (or `py`) instead of `python3`. Nothing is installed by the build. The tests need Playwright for Python and its Chromium (`pip install playwright`, then `python -m playwright install chromium`, once per computer); the build and the guards run anywhere.

## The tree

| where | what |
|---|---|
| `src/page.html` | the page skeleton: head, the empty `#app`, and `@@markers@@` the build fills |
| `src/app/` | the app, one closure, split into **areas** (`kit/ state/ data/ shell/ access/ ro/ ro-page/ import/ trucks/ pages/<page>/ clock/ automations/ settings/ phone/ sample/ boot/`). Every file starts with a header that says what it is, how it flows, what it declares and touches. `docs/AREAS.md` is the index. |
| `src/engine/ro-engine.js` | the RO math (window.RoMath), a separate script |
| `src/test/hooks.js` | `window.__tg` — only in `dist/Parsec.test.html` |
| `styles/base/` | the stylesheets Parsec 8 shipped with, one `<style id>` block each |
| `styles/app/` | every area's styles, one `<style id="v190pg">` block, in file-name order |
| `styles/ro-page/` | the RO page's own stylesheet (it renders in a shadow root; the build makes it the `JC_CSS` string) |
| `assets/` | the truck pictures (`trucks/*.webp`) and icons; the build inlines them as data URLs |
| `vendor/` | the two QR libraries (shipped in the page) and acorn (the build's parser; not in the page) |
| `build/manifest.txt` | **the load order** of `src/app` — the one thing about the layout the build enforces (see below) |
| `build/checks/` | the guards the build runs |
| `tests/` | the Playwright tests (`t<version><letter>.py`), the runner, a Parsec 15 build the data-store test compares against |
| `docs/` | `ARCHITECTURE.md` (how it works), `CONVENTIONS.md` (how to change it), `SERVER.md` (the seams for a server and admin controls), `AREAS.md` (generated index), `MIGRATION-16-to-17.md` (how this tree was made and proven), `NEXT.md` (recommendations) |
| `tools/` | `headers.py`, `purposes.json` (the hand-written purpose line per file), `areas.json`, and `migration/` — the one-time tools that produced this tree from Parsec 16.3 |
| `CLAUDE.md` | the working rules every Claude session reads first: how the user wants to work, releasing, git, company data, mock-ups, and keeping the rules current |
| `.claude/skills/idea-picker/` | the Idea picker skill (mock-ups before UI changes); Claude Code loads it from here |
| `mockups/` | every mock-up and Idea picker so far; new ones are added here |
| `extras/` | other deliveries: Parsec Mobile, the code review, the phone sync patch |

## The rules in one breath

- **One closure, many files.** Every `src/app` file is part of the same function scope; a function anywhere can call a function anywhere. Function declarations are hoisted, so *where a function lives never matters*. What matters is the order of what runs at load — constants, the page closures, listeners, wrappers, init — and `build/manifest.txt` fixes that order. The build refuses a changed order unless you say `--accept-order`.
- **Nothing is patched.** Change the source, not the output. There are no find-and-replace layers any more (Parsec 8–16 had 723 of them).
- **The guards run on every build**: it parses; every file is in the manifest once; no name is declared twice; nothing reads a constant before it exists; the load order matches the baseline; every `STATE` key has a home in the data store; the tooltips keep their writing rules; every file has its header.
- **Headers are part of the code.** The first lines of a file (purpose, flow) are written by hand; the facts under the rule are generated — refresh them with `tools/headers.py` after moving code.
- **Release**: bump `src/app/kit/version.js`, build, run the tests, add the changelog entry, tag, ship `dist/Parsec.html` renamed `Parsec_<version>.html` (the steps: `CLAUDE.md` → Releasing).

How to work on it with Claude is in `CLAUDE.md`. Everything else is in `docs/`.

## The history

Every release since Parsec 4 is a tagged commit (`git tag` — `v4` … `v16.3`, `v17`), each with the delivered file in `releases/` and the mock-ups that led to it in `mockups/`. The workspace that built Parsec 9–16.3 is the commit tagged `legacy-workspace`. To get an old build: `git show v12.5:releases/Parsec_12.5.html > Parsec_12.5.html`. `CHANGELOG.txt` is the whole story in words; `mockups/` stays in the tree because new mock-ups keep being added there.
