# The Parsec 9–16.3 workspace (retired)

How Parsec was built before Parsec 17: `app/Parsec_8.html` is the hand-written base; `app/build12.py` inserted the page modules (`app/b9/*.js`) and ran the patch files (`app/b9/build_*.py`, 61 of them making 723 text edits) to produce `Parsec_12.html` (the deliverable) and `t12.html` (the test build). `build/` holds the mock-ups' sources and helpers, `mock1xx/` the Idea pickers, `skill/` the Idea picker skill, `app/_t*.py` the tests. Retired by Parsec 17 (see `docs/MIGRATION-16-to-17.md` on `main`); kept here so any old decision can be traced.
