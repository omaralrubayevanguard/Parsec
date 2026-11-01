# Parsec · recommendations after 17

Parsec 17 changed how the code is kept, not what it does. These are the next steps worth taking, in the order I'd take them. None is urgent; each is a small release on its own, and the guards make all of them safe to do a file at a time.

1. **Keep it in git.** A private repository (GitHub, or whatever IT allows) is the missing piece: every change compared, every version recoverable, and a new chat or a new developer starts from the files it needs rather than the whole app. The code holds no customer data (the sample data is invented), but ask IT before putting it anywhere off-site.

2. **Untangle the manifest, one area at a time.** Today the load order still follows Parsec 8–16's history (an area's files are spread through the manifest). For each area: move its function-only files together (free), then move its load-time files and read the guard's diff; where two capture-phase handlers for the same key or click swap order, check the two and keep the later one guarded. Run that area's tests. Done area by area, the manifest ends up grouped like the folders.

3. **Merge the stylesheets.** `styles/base/` carries 22 historical blocks and `styles/app/` 53 pieces, in the order they were appended, with later rules overriding earlier ones. The old build removed ~2,300 rules nothing used; more are redundant. Per area: join its pieces, remove what is overridden, keep the cascade order. The RO page's 9 files are the same story.

4. **Finish the `v1NN` naming.** Features that arrived as patches kept their version prefix (`v146*` the clock watch, `v163b*` the peek). Rename to what they are (`clockWatch*`, `peek*`) — a global rename per prefix, with the guard and tests behind it. Keep the version in the comment.

5. **One page shape.** Foreman, Triage and Warranty predate the page frame (`PG`) and are plain functions; wrapping each in its own closure with `view()/after()` like the others makes every page look the same and lets tests reach them the same way.

6. **A size guard.** Add a warning in `build.py` for any `src/app` file over ~60 KB (today: `ro-page/fault-codes.js` 76 KB, `pages/warranty/actions.js` 56 KB), so files split before they turn into the old problem.

7. **Server, when IT decides.** `docs/SERVER.md` has the staged path; Stage 0 (exports on a shared drive, verified) needs no code and starts the conversation with IT about where the data may live.

8. **Trim the old tests.** `tests/t10*`, `t11*`, `t113*` test Parsec 10–11 behaviour; a few fail on 16.3 and 17 alike because the behaviour changed on purpose. Decide each: update it, or delete it with a line in the changelog.

What I would *not* do: move to a framework (Next.js, React) before there is a server to justify it — this app is already a static client, and a rewrite would be weeks of work with nothing new on screen (see the note in `SERVER.md`).
