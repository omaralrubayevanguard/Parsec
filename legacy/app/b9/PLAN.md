# Parsec 9 — every mock-up on real data

Audit of Parsec_8 against the mock-ups (outputs/*.html, sources in build/):

| Page | Mock-up (latest) | In Parsec 8? |
|---|---|---|
| RO page | Parsec RO redesign (make_mock2) | yes — v175–177 (list + work, pane: Next/Schedule/People/Vehicle/Paperwork/Money) |
| RO list | Parsec RO list mock-up (make_rolist, layout C list + peek) | NO — old table, rows open the full RO |
| Triage | Triage * (make_triage_*) | yes — v178 (+ step-0 bar triggers) |
| Foreman | Foreman * | yes — v179 |
| Warranty | Warranty * | yes — v181 |
| Console | Console v2 (cx/) | NO — old cards |
| Inbox | Inbox v2 (ib/) | NO — bell popover only |
| Time Log | overhaul + recommendations (tl7) + drag an edge (tld) + ideas (tli) | NO — old day cards |
| Parts | Parts v2 (make_parts2) + ideas (pti) | NO — old inventory list |
| Fixes | Fixes v2 (make_fixes2) + ideas (fxi) | NO — old list |
| Career | Career v2 (cr/) | NO — old totals |
| Manager | Manager v3 (mg/ mgi/) | NO — old page |
| Nav bar & profile | Nav bar and Profile | yes — step 0 (Parsec 8) |

Approach: each page is a module (closure) holding the mock's views nearly as written, an adapter that
builds the mock's data shape from STATE on every render, and handlers that change STATE through the
app's own functions (punches, statuses, routes, bulletins, undo). CSS from the mock files, converted to
the app themes. Shared: STATE.ib (notes to people) + pxNote(), role home pages, Staged / Picked up live.
