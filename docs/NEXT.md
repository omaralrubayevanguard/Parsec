# Parsec · recommendations after 17

Parsec 17 changed how the code is kept, not what it does. These are the next steps worth taking, in the order I'd take them. None is urgent; each is a small release on its own, and the guards make all of them safe to do a file at a time.

1. **Keep it in git.** *Done (November 2026):* a private GitHub repository holds the whole history, Parsec 4 → 17, and `CLAUDE.md` gives every session the working rules. The code holds no customer data (the sample data is invented); real shop data still needs IT's OK before it goes anywhere off-site.

2. **Untangle the manifest, one area at a time.** Today the load order still follows Parsec 8–16's history (an area's files are spread through the manifest). For each area: move its function-only files together (free), then move its load-time files and read the guard's diff; where two capture-phase handlers for the same key or click swap order, check the two and keep the later one guarded. Run that area's tests. Done area by area, the manifest ends up grouped like the folders.

3. **Merge the stylesheets.** `styles/base/` carries 22 historical blocks and `styles/app/` 53 pieces, in the order they were appended, with later rules overriding earlier ones. The old build removed ~2,300 rules nothing used; more are redundant. Per area: join its pieces, remove what is overridden, keep the cascade order. The RO page's 9 files are the same story.

4. **Finish the `v1NN` naming.** Features that arrived as patches kept their version prefix (`v146*` the clock watch, `v163b*` the peek). Rename to what they are (`clockWatch*`, `peek*`) — a global rename per prefix, with the guard and tests behind it. Keep the version in the comment.

5. **One page shape.** Foreman, Triage and Warranty predate the page frame (`PG`) and are plain functions; wrapping each in its own closure with `view()/after()` like the others makes every page look the same and lets tests reach them the same way.

6. **A size guard.** *Done in 17:* `build.py` prints "worth splitting (over 60 KB)" for any `src/app` file past that size (`ro-page/fault-codes.js` is 76 KB), so files get split before they turn into the old problem. *Done since:* `ro-page/fault-codes.js` was split into `fault-codes.js` (the codes), `op-tiles.js` (the tile row) and `op-card.js` (`jobCard`, 59 KB, one function: splitting it into sections is a later step).

7. **Server, when IT decides.** `docs/SERVER.md` has the staged path; Stage 0 (exports on a shared drive, verified) needs no code and starts the conversation with IT about where the data may live.

8. **Trim the old tests.** `tests/t10*`, `t11*`, `t113*` test Parsec 10–11 behaviour; a few fail on 16.3 and 17 alike because the behaviour changed on purpose. Decide each: update it, or delete it with a line in the changelog.

9. **The Library, round 2: Impact procedures.** *Done in 17.1:* the Procedures tab reads Impact printouts into steps (lbf·ft first), warnings, tools and torques, sorted under function groups; steps are ticked from the operation and counted on its tile. *Still open:* the Volvo-copyright check before real printouts go in the shop's Library. The original plan: Read an Impact printout's steps, warnings, special tools and torques (lbf·ft first) into a step list ticked as the work goes, with the steps done on the operation's tile, matched by operation number (`4134-03-02-05`) then function group. The picks are in `mockups/Parsec Library Impact-style ideas mock-up.html`; `library/read-docs.js` already reads the printout's header (`opNo`, `fgrp`, `model`). Waits on the Volvo-copyright check.

What I would *not* do: move to a framework (Next.js, React) before there is a server to justify it — this app is already a static client, and a rewrite would be weeks of work with nothing new on screen (see the note in `SERVER.md`).
