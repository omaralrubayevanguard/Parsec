# Parsec · the seams for a server, and admin controls

Parsec runs without a server today: the shop's data is a folder, one computer at a time writes it, and two computers reconcile by merging. This page says what is already shaped for a server, where the seams are in the code, and the order to do it in — so the move is a change in `data/` and `access/`, not a rewrite.

## What is already server-shaped (Parsec 16)

| | where | why it matters for a server |
|---|---|---|
| One document | `STATE` (`state/state.js`) | the whole shop is one JSON document; a server can hold it as is, or as tables |
| Tables | `data/export.js` → `tables/*.jsonl` + `schema.json` | every record kind flattened: ROs, operations, parts, punches, shifts, staff, claims, inventory, messages, settings. Money in cents, links as ids. This is the import format for a database |
| Ids and marks | `data/store-records.js` | every record has `id`, `updatedAt`, `updatedBy`; deletions are tombstones in `STATE.tombs` — the ingredients of last-writer-wins sync |
| Merge | `data/store-merge.js` `pdMerge(a, b)` | record by record, newer mark wins, deletions carry, same-record clash → ask. The same function can reconcile a server copy |
| Canonical text | `pdCanon` | the same data gives the same text → cheap change detection and checksums |
| Clean data | `data/clean.js` | ISO dates, YYYY-MM-DD days, numeric money, `STATE.dataV` for versioned migrations |
| Topic map | `data/store-topics.js` `PD_TOPICS` | the list of record kinds and where each lives; the build fails when a key is unplaced. A server's tables mirror this list |
| Verify | `data/import-export.js` `pdxVerify`, `pdxDiff` | checksums on every file, refuse on a mismatch, round-trip compare |
| Change feed | `automations/watcher.js` `autoRun` | every change is already diffed before/after at save — the same diff can be sent as events |

## The seams (what to replace, in order)

1. **Transport.** `writeFolderState()` / `readFolderState()` / `adoptFolderState()` in `data/store-save-open.js` are the only places that touch the folder. A server adapter implements the same three verbs (write what changed, read all, merge with memory) against HTTP; nothing above them changes. `pd16Write` already produces "only what changed" — send that.
2. **Attachments.** `ro-page/bulletins.js` and `data/store-api.js` (`writeFileToFolder`, `pdAttList`) put files beside the RO. On a server they become uploads keyed by RO id + file id (the export already copies them that way).
3. **Identity.** `access/sign-in.js` keeps "who is at this computer" in `localStorage` (`tec_viewas`), PINs are salted SHA-256 (`access/pins.js`). A server replaces the PIN check with a real sign-in and gives the client a token; `pxMeName()` / `viewAsStaff()` stay the one place the app asks "who am I".
4. **Permissions.** `access/permissions.js` has roles → pages/actions and per-person changes; `can()` / `canPage()` are asked everywhere and `access/guards.js` refuses at the function. On a server the **same table** is enforced server-side on every write (the client's check becomes a courtesy). Keep the table in one place: it is a `STATE` key today (`staff[].pages/actions`, roles) — it exports with everything else.
5. **Audit.** `access/people-and-demo-team.js` `audit(kind, text)` writes `STATE.audit`; `settings/values-and-changes.js` logs every setting change with who/when (`STATE.setLog`); the automations log what ran (`autoLog`). These three are the audit trail a server keeps append-only.
6. **Real-time.** `pd16Poll` (`store-save-open.js`) already asks "has another computer saved?" on a timer and merges. With a server, the poll becomes a subscription; `pdMerge` stays.

## A staged path

- **Stage 0 (now):** folder on a shared drive; nightly `Exports/` for the server team to load; `pdxVerify` proves the copy. No app change.
- **Stage 1:** a small sync service that stores the per-record tables and accepts "what changed" from `pd16Write`, answering with what others changed; the client merges with `pdMerge`. The folder stays as the local copy and the fallback. Requires IT's OK on where company data lives.
- **Stage 2:** the server becomes the source of truth: sign-in, permissions enforced server-side, attachments uploaded, reports from the tables. The client keeps working offline on its local copy and syncs when back.

## Admin controls — what exists, what a server adds

Today (all in the app, enforced in the browser): roles and per-person pages/actions (Admin page), an Admin PIN for the "every page" view, sign-in rules (idle lock, end of day), the sign-in log, Settings with "who can change" per row and Recently changed with Undo, automations with per-rule switches and a What ran log with Undo, backups (end of day, keep 30) and Back up now, export with checksums.

A server adds: real accounts and passwords or SSO, the same role table enforced on every request, an append-only audit log, backups the shop doesn't have to think about, and reports over the tables. None of it changes the pages; it changes `data/` (transport) and `access/` (identity).

## Choosing the server stack

Pick what IT will run: Next.js/Node is natural if they host Node; .NET or Java if that is their platform; a database with JSON columns (Postgres) fits the record shapes as they are. The export format (`schema.json`) is the contract either way. Don't rewrite the front end for the stack; this app already is a static client.
