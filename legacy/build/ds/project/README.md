Parsec is the shop's repair-order workspace, used by technicians, advisors, foremen, managers and the parts and warranty desks. It should feel like the rest of a luxury dealership: calm, spacious, quietly expensive. Every screen is ink on warm paper (or warm graphite at night), with one bronze accent and colour only where it means something.

## Principles

- **One surface, space instead of lines.** Pages live in one rounded `panel` on the `canvas`. Sections are separated by space (16 inside a group, 32 between groups, 48 between sections); `hairline` rules appear only inside lists and between the main column and the rail.
- **One accent per view.** `accent` (bronze in Ivory, champagne in Graphite) marks the one thing to do now: the accent button in the Next-step strip, the current stage, the running clock, keyboard focus. Everything else is ink.
- **Status is a shape, a colour and a word.** The icon's shape tells the family, its colour tells who it waits on, the word stays `ink`. Never a filled coloured block, never coloured status text.
- **Numbers line up.** Quantities (hours, money, mileage, counts) use tabular figures in the sans; identifiers (RO number, VIN, part numbers, key tags, case numbers) use the `mono` family.
- **Everything is on the page.** No “Show all” fold-outs, no count chips that hide content: fields sit in the properties rail, history sits in Activity.
- **Two themes, equal.** Ivory (light) and Graphite (dark) are designed together; people choose in Settings, default follows the system.

## Content fundamentals

- Plain shop language, sentence case everywhere — buttons, labels, headings, menu items. No all-caps labels (the op-type codes DIAG, OP, PM, WARR, COMEBACK, SUBLET are the only capitals).
- Buttons start with a verb: “Start clock”, “Transfer…”, “Add operation”. An ellipsis means a dialog follows.
- Status names exactly as the shop uses them, with an en dash: “Waiting – Parts”, “Complete – Road test”. A sub-reason follows a middle dot: “Waiting – Parts · Ordered”.
- Next steps give the reason, then the instruction: “Operation 2 isn't approved yet — send the estimate.”
- Toasts say what happened, past tense, with the new value: “Status set to Waiting – Parts · Ordered”, then “Undo”.
- Formats: hours `6.27 h` · burnt of quoted `6.27 / 11.90 h` · parts in hand of all `3 / 5` · durations `1:12` · clock `6:15:57` · money `$3,276.50` · mileage `616,000 mi` · dates `Thu, Oct 22 · 10:04` · relative `15d 17h`.
- No exclamation marks, no emoji, no jokes. Address the reader as “you” only when needed; name people by first and last name.

## Visual foundations

### Colour

Grounds, from back to front: `canvas` (behind the sidebar) → `panel` (pages, the rail) → `raised` (menus, inputs, cards) → `fill` (hover, tags) → `selected` (selected row, active nav). Text: `ink` for content, `ink-2` for secondary, `ink-3` for labels, placeholders and times (4.5:1 on every ground, both themes), `ink-4` for disabled only.

Accent: `accent` fills and rings, `accent-text` for links and the current stage name, `accent-tint` + `accent-line` for the Next-step strip and the highlighted command row, `on-accent` for text on an accent fill. The primary button is `primary` (ink in Ivory, ivory in Graphite) with `on-primary` text.

Meaning: the six `status-*` tokens colour status icons, tag squares and bar marks only (3:1 on every ground). `good`, `warn` and `bad` are for numbers and danger text; their `-tint` tokens back the rare notice. `scrim` sits behind the command menu and dialogs.

### Type

Three families. `serif` (Newsreader) for the page's one title: `display-lg` for the customer on the RO page, `display` for list-page and dialog titles. `sans` (Geist) for everything else: `title` for section headings, `heading` for card and operation titles, `body` and `body-medium` for text and rows, `small` for meta and rail values, `label` for property labels and counts, `micro` for keyboard hints, `timer` and `stat` for clock and numbers (always tabular). `mono` (Geist Mono) for identifiers: `id`, and `id-sm` in tags and dense lists.

All three are hosted on Google Fonts; the stacks fall back to Inter / Segoe UI, Charter / Georgia and Cascadia Mono / Consolas. For the offline shop build, embed the woff2 files in the app as the current build embeds its digit font.

### Layout

- **Shell:** `sidebar` 236px on `canvas` (collapses to 56px), then the main `panel` inset 8px with `radius-xl` and `shadow-panel`. A 48px `header` bar tops every page: breadcrumb and previous/next on the left; on the RO page the Time · Parts · Files totals sit top right, then a hairline and the quiet actions.
- **RO page:** a reading column, max `measure` 760px, padded 40px top and 48px sides, and the 300px RO details pane (`rail`) behind a `hairline`. Column order: eyebrow → customer title → vehicle line → status and owner → stage track → operations → activity. The details pane holds the Next card, then Schedule · People · Vehicle · Paperwork · Money as collapsible groups; it is sized to the window and never scrolls — opening a group that would overflow folds the group opened longest ago.
- **List pages** use the same shell: `display` title, a filter row, then 40px rows.
- Keep 64px of empty space at the bottom of a scrolling column.

### Shape, depth, borders

Radii: `radius-xs` 4 keyboard hints · `radius-sm` 6 tags, checkboxes · `radius-md` 8 buttons, inputs, rows, nav items · `radius-lg` 12 menus, popovers, cards, the Next-step strip · `radius-xl` 16 the main panel, the command menu · `radius-full` avatars, status icons, the play button, the toast.

Nothing casts a shadow at rest except the panel edge (`shadow-panel`). Menus, popovers, the command menu and the toast use `shadow-raised`. Inputs and secondary buttons carry a 1px `border` outline; checkboxes and toggles `border-strong` (3:1).

### States

Hover changes the fill only (`fill`), in 150ms ease-out; nothing moves. Press scales a button to 98%. Selected rows and the active nav item use `selected`. Keyboard focus is `shadow-focus`: a 2px gap in `panel`, then a solid 2px `accent` ring (≥4.6:1 on every ground in both themes). Disabled: `ink-4` on `fill`, no outline.

### Motion

Menus and popovers fade up 6px in 180ms (`cubic-bezier(.2,.8,.2,1)`). The only things that animate on their own are the running clock (its digits and a breathing `accent` dot) and a live status icon. No sweeps, no bounces, no staggered reveals. Honour `prefers-reduced-motion` by removing all of it.

Micro-interactions, each answering something the person just did (on the phone, sheets rise from the bottom in 260ms and the ClockBar rises in when a clock starts): a detail group folds in 240ms with its chevron turning; the tab underline slides to the new tab; a changed status or part icon pops in from 60%; a row that just changed glows `accent-tint` and fades back over 1.4s; the Next card's new text rises 4px; a header total glows `accent-tint` when its count changes; a copied VIN's icon turns into a `good` tick for 1.4s; toggles slide their knob; checkboxes pop their tick.

### Modals

Open from a link, a button, a menu item or a single key (T transfer, O add operation). The page dims under `scrim` with a 2px blur in 160ms; the dialog — `raised`, `radius-xl`, `shadow-raised`, 480px (400px for a confirm), 12% from the top — rises 8px from 98% scale in 220ms and puts focus in its first field. Esc, Cancel, × or a click on the scrim closes it in 120ms and returns focus; ⌘↵ / Ctrl ↵ confirms. Title in the serif at 22px with an `ink-3` subtitle; footer: keyboard hint left, Cancel (ghost) and one action (`primary`, or solid `bad` for a destructive confirm). One at a time. A read-only variant — 560px wide, one Close button — shows the breakdown behind a header total (Time, Parts, Files); its rows jump to the operation they name.

## Phone — Parsec Mobile

The technician's phone app uses the same tokens, type and components, reshaped for one hand and a busy bay (see PhoneApp, ClockBar, DayStrip).

- **Shell:** a four-tab bar (Today · ROs · Sync · Me) at the bottom, safe areas respected; a pushed screen (an operation) swaps the tab bar for an action bar — Photo, Note, and the wide Start / Stop clock where the thumb rests.
- **Today, not a list of ROs:** your operations across every RO, Ready to work then Waiting, under a shift card with the DayStrip.
- **The ClockBar** follows you on every screen while a clock runs; the sidebar's clock-in card is its desktop twin.
- **Sheets instead of menus and dialogs:** `raised`, 24px top corners, grab handle, 52px rows; swipe down or tap outside to close. Totals tiles, status, part status, stage checklists, stop reasons and forms all open as sheets.
- **Gestures add speed, never replace a button:** swipe a row left to start its clock (or mark a part Received), long-press for its full menu.
- **Sizes:** body 15px, inputs 16px (no zoom on focus), targets 44px+. **Bay mode** raises body to 17.5px, targets to 54px+ and labels to `ink-2`.
- **Theme** follows the phone's dark mode unless chosen in Me. One accent per screen, as on the desktop.
- **Sync** is the desktop's QR loop, both ways, no network; photos stay on the phone until shared to the RO folder.

## Status system

| Status | Icon | Token | Sub-reasons |
| --- | --- | --- | --- |
| Hold tech | empty ring | `status-hold` | — |
| Working | half disc | `status-working` | Diagnosing · Repairing · Inspecting · Testing |
| Waiting – Parts | dashed ring + dot | `status-waiting` | Not ordered · Ordered · Backordered · Received |
| Waiting – Foreman | dashed ring + dot | `status-waiting` | — |
| Waiting – Tech support | dashed ring + dot | `status-support` | Case opened · Awaiting reply · Escalated |
| Waiting – Customer | dashed ring + dot | `status-customer` | Estimate sent · Approval pending · Declined work |
| Complete – Road test | three-quarter disc | `status-working` | — |
| Complete – Released | checked disc | `status-working` | — |
| Declined | crossed disc | `status-hold` | — |

RO stages, in order: Check-in · Diag · Approval · Parts · Repair · Road test · Close-out (see StageTrack).

## Iconography

Parsec's own stroke icons (the `assets/Icons` group): 24px grid, 1.6 stroke, round caps and joins, no fill, drawn at 16px in the UI in `ink-3` (rest) or `ink` (active). Twelve are intentional additions drawn to the same rules: `chevD`, `chevU`, `chevR`, `more`, `inbox`, `sidebar`, `link` for the new shell, and `today`, `camera`, `mic`, `sync`, `chevL` for the phone. The older multi-colour illustrated icons are retired from the interface. No emoji anywhere.

## Logo

The Parsec dot cluster beside the word “Parsec” set in the sans at 600. Use `parsec-mark-light.svg` on Ivory grounds and `parsec-mark-dark.svg` on Graphite. The mark's centre stays its own green; never recolour it to the accent, never place it on the accent.
