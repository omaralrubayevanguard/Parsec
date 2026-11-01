import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parts as P
from parts import ic, si, STATUSES
B = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(B, "ds/project/components")

def doc(title, body, marker):
    return f'''{marker}
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>{title} — preview</title></head>
<body>
{body}
<script>/* static preview: every style comes from tokens.css + components/bundle.css */</script>
</body>
</html>
'''

MARK = '<style>[data-n]{position:relative}[data-n]::after{content:attr(data-n);position:absolute;top:-1px;left:-34px;z-index:5;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;background:var(--accent);color:var(--on-accent);font:600 12px/1 var(--font-sans);box-shadow:0 0 0 3px var(--panel)}.px-side[data-n]::after{top:18px;left:auto;right:-11px}.px-head[data-n]::after{top:13px;left:292px}.px-totals[data-n]::after{left:-30px;top:3px;box-shadow:0 0 0 3px var(--panel)}.px-clockin[data-n]::after{left:auto;right:-6px;top:-10px}.px-ro__rail [data-n]::after{left:-19px;top:-9px}.px-props[data-n]::after{top:4px}</style>'
C = {}  # name -> (group, height, extra marker attrs, readme, body)

C["Button"] = ("Actions", 136, "", """# Button

One verb, sentence case, at most one **accent** button per view.

- **Primary** (`primary` fill, ink in light / ivory in dark) — the main action of a view: *Start clock*, *Save*.
- **Accent** (`accent` bronze, `on-accent` label) — the single action the page is asking for right now; on the RO page it lives in the Next-step strip (*Estimate sent*). Never two on one screen.
- **Secondary** (`raised` with a `border` outline) — everything else that needs a button.
- **Ghost** — toolbar and header actions; icon-only ghosts need a `title`.
- **Danger** — `bad` text, `bad-tint` on hover; destructive actions also go behind a menu and get an Undo toast.

Provide: a label (or an icon + `title`), optional leading icon from the Parsec set, optional `.px-kbd` shortcut hint. Sizes: `--sm` 28px (rows, rail, strips), default 32px, `--lg` 40px (dialogs). Hover changes fill only; press scales to 98%; focus shows `shadow-focus`.
""", f'''<div class="px-demo col">
  <div class="px-demo" style="padding:0">
    <button class="px-btn px-btn--primary">{ic("play")}Start clock<span class="px-kbd">S</span></button>
    <button class="px-btn px-btn--accent">Estimate sent</button>
    <button class="px-btn">{ic("swap")}Transfer…</button>
    <button class="px-btn px-btn--ghost">Cancel</button>
    <button class="px-btn px-btn--danger">{ic("trash")}Delete RO</button>
    <button class="px-btn px-btn--ghost px-btn--icon" title="Options">{ic("more")}</button>
  </div>
  <div class="px-demo" style="padding:0">
    <button class="px-btn px-btn--sm">Approval pending</button>
    <button class="px-btn px-btn--accent px-btn--sm">Estimate sent</button>
    <button class="px-btn px-btn--lg px-btn--primary">Save operation</button>
    <button class="px-btn" disabled>Close RO</button>
  </div>
</div>''')

st_rows = "".join(f'<span class="px-status">{si(k)}{nm}</span>' for k, nm, *_ in STATUSES)
C["Status"] = ("Status", 181, "", """# Status

A status is a coloured **icon** plus an **ink word** — never a filled block, never coloured text.

The icon's *shape* tells the family and its *colour* tells who it waits on, so it reads without colour too:

| Shape | Statuses | Colour token |
| --- | --- | --- |
| Empty ring | Hold tech | `status-hold` |
| Half disc | Working (Diagnosing · Repairing · Inspecting · Testing) | `status-working` |
| Dashed ring + dot | Waiting – Parts, Waiting – Foreman | `status-waiting` |
| Dashed ring + dot | Waiting – Customer | `status-customer` |
| Dashed ring + dot | Waiting – Tech support | `status-support` |
| Three-quarter disc | Complete – Road test | `status-working` |
| Checked disc | Complete – Released, part Received / Installed | `status-working` |
| Crossed disc | Declined | `status-hold` |

Provide: the status key and its name; a sub-reason goes after a middle dot in `ink-3` (“Waiting – Parts · Ordered”). Use the button form (`.px-status--button`) where the status can be changed; it opens the Status menu. A running clock adds `.px-live` (the icon breathes, nothing else moves).
""", f'''<div class="px-demo col" style="gap:18px">
  <div style="display:grid;grid-template-columns:repeat(3,auto);gap:12px 36px">{st_rows}</div>
  <div class="px-demo" style="padding:0">
    <button class="px-status--button">{si("parts")}Waiting – Parts<span class="px-status__sub">· Ordered</span>{ic("chevD","px-ico px-chev")}</button>
    <span class="px-live"><button class="px-status--button">{si("working")}Working<span class="px-status__sub">· Repairing</span>{ic("chevD","px-ico px-chev")}</button></span>
  </div>
</div>''')

C["StatusMenu"] = ("Menus", 423, "", """# StatusMenu

The one place a status changes: a searchable list of the nine statuses with their shortcut numbers, and sub-reasons in a second level.

- Opens from the status button (or **S** anywhere on the RO page). Type to filter; **1–9** pick directly; **→** opens the sub-reasons.
- Groups are split by hairlines: on the board · working and waiting · complete · declined.
- The sub-reason panel repeats the status's one-line description, then its reasons; choosing one sets both (“Waiting – Parts · Ordered”) and shows a Toast with Undo.

Replaces the old menu that showed every status and every reason at once. Provide: the current status (marked `is-on`), the status list, and an `onSelect(status, reason)`.
""", f'<div class="px-demo" style="align-items:flex-start">{P.status_menu("parts","hold").replace(chr(32)+"data-n="+chr(34)+"10"+chr(34),"")}</div>')

tags = "".join(f'<span class="px-tag" data-t="{t}">{t}</span>' for t in ["DIAG","OP","PM","WARR","COMEBACK","SUBLET"])
C["TypeTag"] = ("Status", 68, "", """# TypeTag

The operation type as a short mono code on a quiet fill, with a small coloured square for scanning.

Codes and squares: DIAG `status-support` · OP `status-customer` (teal) · PM `status-working` · WARR `accent` · COMEBACK `status-problem` · SUBLET `status-waiting`. The code stays `ink-2`, so the tag is legible in both themes whatever the square. Click to cycle; the menu picks directly. Provide: one of the six codes.
""", f'<div class="px-demo">{tags}</div>')

C["StageTrack"] = ("Status", 322, "", """# StageTrack

Seven labelled steps — Check-in, Diag, Approval, Parts, Repair, Road test, Close-out — with one line above saying where the RO is and when it should be ready.

- Done: `ink-2` bar · Current: `accent` bar and `accent-text` label · Blocked: hatched `status-waiting` · Not needed: outlined, label `ink-4`.
- The summary line names the stage, “stage n of 7”, what is holding it, and the forecast (“Ready about Thu, Oct 22 · 10:04”).
- Clicking a step opens a small popover with that step's checkboxes and its one-line “done when” rule. Nothing more.

Provide: each stage's state, the checklist per stage, the forecast. Replaces the unlabelled seven-dash bar in the RO card.
""", f'''<div style="padding:24px 32px;max-width:760px">{P.stage(False).replace('style="margin-top:32px"','')}
<div style="margin:10px 0 0 calc((100% - 24px) / 7 * 2 + 8px)">{P.stagepop()}</div></div>''')

C["NextStep"] = ("Feedback", 173, "", """# NextStep

One sentence that says what the RO needs next, and the one button that does it.

Sits under the stage track on `accent-tint` with an `accent-line` edge — the only tinted block on the page. Write it as an instruction with the reason first: “Operation 2 isn't approved yet — send the estimate.” At most one accent button and one secondary. Hide the strip when nothing is pending; never stack two. Provide: the sentence, the action(s), optional forecast text.
""", f'<div style="padding:24px 32px;max-width:760px">{P.nextstep(False).replace(chr(32)+"style="+chr(34)+"margin-top:24px"+chr(34),"")}</div>')

C["TimeCard"] = ("Data", 436, "", """# TimeCard

The clock for one operation: a big tabular timer, a thin quoted-time bar, four numbers and one round button.

- **Idle**: `primary` play button, caption “On this operation · 3 entries”.
- **Running**: the button turns `accent` with a stop glyph, a small `accent` dot breathes beside “Clock running · Repairing”, and the timer ticks. Nothing else animates.
- The bar fills in `ink-2` to burnt time; the `ink` tick marks quoted time; past it the overrun fills `status-problem`.
- Stats: Quoted · Burnt · Left · Efficiency, in `stat` style with a small unit. Efficiency takes `good` at 100 % or more, `warn` under 0.5 h left, `bad` when over quote.

Provide: quoted hours, punches (for burnt and the timer), running state, the start/stop handler. One TimeCard per open operation.
""", f'''<div style="padding:24px 32px;max-width:620px;display:flex;flex-direction:column;gap:20px">{P.timecard(False, False)}
{P.timecard(True, False).replace('6:15:57','6:18:04').replace('width:78.4%','width:78.9%')}</div>''')

C["OperationList"] = ("Data", 152, "", """# OperationList

Operations as quiet 40px rows: status icon, number, complaint, type tag, burnt / quoted hours, a 40px efficiency bar and who has it.

- Hover: `fill`. Selected: `selected`, and the row opens in place to show its TimeCard and its Time · Parts · Notes · Files tabs.
- A short `ink-3` note before the tag flags what blocks it (“1 part not ordered”).
- Click the status icon to change that operation's status; click anywhere else to open it.

Provide: the operations with status, type, quoted and burnt hours, parts out, assignee; the selected id. Replaces the operation cards in the left column of the old RO page.
""", f'<div style="padding:16px 32px;max-width:760px"><div class="px-ops">{"".join(P.op_row(o, on=(o[0]==1)) for o in P.OPS)}</div></div>')

C["PropertyList"] = ("Data", 836, "", """# PropertyList

Every RO field, always visible, in five quiet groups — Schedule, People, Vehicle, Paperwork, Money — down the right-hand rail.

- Label `ink-3` in a 96px column, value `ink` 13px; identifiers (VIN, key tag) in `id` mono with a copy button on hover.
- A row's whole width is the edit target: hover shows `fill`, click edits in place. Empty values read “Add …” in `ink-4`.
- Links inside (“Transfer…”) use `accent-text`.

Provide: the field groups and values, edit handlers. Replaces the four key facts plus “Show all 17” fold-out and the chip row in the old RO card.
""", f'<div style="padding:24px;width:300px">{P.props(False)}</div>')

C["ActivityFeed"] = ("Data", 379, "", """# ActivityFeed

Everything that happened to the RO, newest last, with notes inline and a composer at the end.

Each event is an icon or avatar, one sentence with the actor in `ink` 500 (“**Mike Rodriguez** set the RO to **Hold tech**”) and a time in `ink-3`. Notes sit in a `raised` box under their event. Provide: events (actor, verb, object, time), notes, a send handler. Replaces the History count chip — the history is now on the page.
""", f'<div style="padding:8px 32px 24px;max-width:760px">{P.feed(False)}</div>')

C["Sidebar"] = ("Navigation", 780, "", """# Sidebar

The app's navigation, on `canvas`, left of the main panel: logo, search (⌘K), the clock-in card, then pages in three groups.

- Groups: (top) Inbox, Console, Triage, RO list · **Shop** Foreman, Warranty, Manager, Parts · **You** Time log, Fixes, Career. Settings and the signed-in person sit at the foot.
- Show only the pages a role uses: an advisor sees no Time log, a technician sees no Manager.
- Active page: `selected` fill, `ink` text and icon. Counts in `ink-3`, never red badges.
- Collapses to 56px (icons only) with the sidebar button or **[**.
- While a clock runs, the clock-in card grows a second line: a breathing `accent` dot, the RO and operation, the running time and a stop button, with the job's name below. Tap it to jump to the job; it folds away when the clock stops — the desktop twin of the phone's ClockBar.

Replaces the ten-tab top bar and the right-hand icon cluster (search, clock, bell, settings, profile).
""", f'<div style="height:780px;width:236px">{P.sidebar(wt=False, running=True)}</div>')

C["PageHeader"] = ("Navigation", 56, "", """# PageHeader

A 48px bar across the top of the main panel: breadcrumb on the left, previous/next with position beside it, and on the right the RO's totals followed by quiet icon actions.

Breadcrumb in `ink-3` with the current item in `ink` (the RO number in `id` mono). **K / J** move between ROs in the list you came from. On the right: the HeaderTotals (Time · Parts · Files), a hairline, then ghost icon buttons with titles — copy link, print, and ⋯ which opens the RO options Menu. Provide: the trail, list position, the RO's totals, actions.
""", f'<div style="background:var(--panel)">{P.header(False)}</div>')

C["HeaderTotals"] = ("Navigation", 124, "", """# HeaderTotals

Three quiet counters at the top right of the RO page — **Time**, **Parts**, **Files** — each a button that opens a modal with the breakdown (see TotalsModal).

- **Time** is hours burnt over hours quoted across every operation, `6.27 / 11.90 h`; **Parts** is parts in hand (Received or Installed) over all parts, `3 / 5`; **Files** is a single count, `6`. Icon from the Parsec set (clock, box, paperclip) in `ink-3`, numbers in `ink` with tabular figures, the denominator in `ink-3`.
- Ghost buttons at 28px: hover and the open state use `fill`; focus shows `shadow-focus`. A `title` and an `aria-label` give the long form (“Time: 6.27 of 11.90 hours quoted. Open breakdown”).
- They are live: Time ticks with the running clock (its icon turns `accent` while a clock runs — the same single accent as the clock itself); Parts and Files glow `accent-tint` for a moment when their count changes; adding an operation moves the quoted hours and the Money group's Labor line with it.
- A hairline separates them from the page actions. They are the RO's totals, not the selected operation's: that stays in the TimeCard.

Provide: the RO's operations (burnt and quoted hours), parts with statuses, files, and a handler per button.
""", f'''<style>.px-head__sep{{display:none}}</style><div class="px-demo col" style="gap:20px;align-items:flex-start">
  <div class="px-head__acts" style="margin:0">{P.totals_bar(False)}</div>
  <div class="px-head__acts" style="margin:0">{P.totals_bar(False, live=True).replace('class="px-total" data-total="parts"', 'class="px-total is-open" data-total="parts"')}</div>
</div>''')

C["Tabs"] = ("Navigation", 141, "", """# Tabs

Underlined text tabs with quiet counts, for switching views of one thing (an operation's Time · Parts · Notes · Files).

Active: `ink` text and a 2px `ink` underline; rest: `ink-3`. Counts follow in 12px `ink-3`. For two or three short options inside a toolbar, use the segmented control instead. Provide: tabs with optional counts and the active key.
""", f'''<div class="px-demo col" style="gap:24px;max-width:560px">{P.tabs()}
<div class="px-seg"><button class="is-on">Ivory</button><button>Graphite</button><button>System</button></div></div>''')

C["CommandMenu"] = ("Menus", 430, "", """# CommandMenu

**⌘K / Ctrl K** from anywhere: jump to an RO by number, VIN, unit or customer, or run an action on the current page.

Results first (status icon, RO number in mono, customer, a short meta line), then actions with their single-key shortcuts. The highlighted row uses `accent-tint`. It sits on `scrim`, 600px wide, `radius-xl`, `shadow-raised`. Provide: a search over ROs and a list of page actions. Replaces the search icon in the old top bar.
""", f'<div style="padding:24px;background:var(--scrim);min-height:430px">{P.cmd_menu()}</div>')

C["Menu"] = ("Menus", 310, "", """# Menu

A floating list of actions: icon, label, optional shortcut, hairline separators, danger item last.

`raised` surface, `radius-lg`, `shadow-raised`, 32px items with `fill` on hover. Fades up 6px in 180ms. Destructive items (`bad`) sit after a separator and always offer Undo afterwards. Provide: items with icon, label, optional shortcut and handler. Used for the RO options (⋯) menu.
""", f'<div class="px-demo" style="align-items:flex-start">{P.options_menu()}</div>')

C["Toast"] = ("Feedback", 88, "", """# Toast

A short confirmation at the bottom centre, with Undo when the action can be reversed.

`primary` pill (ink in light, ivory in dark), `on-primary` text, one action. Says what happened, past tense, with the new value: “Status set to Waiting – Parts · Ordered”. Leaves after 5 s; stays while hovered. Provide: message, optional action. One at a time.
""", f'<div class="px-demo">{P.toast()}</div>')

C["Field"] = ("Inputs", 321, "", """# Field

Inputs, a text area, checkboxes and a toggle — `raised` with a `border` outline at rest, an `accent` ring on focus.

- Label above in `label` style (`ink-3`), placeholder in `ink-3`. 32px inputs; text areas grow with their content.
- Checkboxes and toggles outline in `border-strong` (3:1). A ticked checklist item keeps its text, dimmed and struck through.
- Work-performed notes stamp the date and time on Enter, as today.

Provide: label, value, placeholder, handlers.
""", f'''<div class="px-demo" style="align-items:flex-start;gap:32px">
  <div class="px-field"><label>Part number</label><input class="px-input" placeholder="e.g. 85136213"></div>
  <div class="px-field"><label>Description</label><input class="px-input is-focus" value="Clutch kit, 15.5 in"></div>
  <div class="px-field" style="width:300px"><label>Work performed</label><textarea class="px-input" style="width:300px">Removed transmission. Clutch disc worn to the rivets. (Oct 20 · 8:40)</textarea></div>
  <div style="display:flex;flex-direction:column;gap:12px;padding-top:22px">
    <label class="px-check is-on"><i></i><span>Estimate reviewed</span></label>
    <label class="px-check"><i></i><span>Customer approved</span></label>
    <span style="display:flex;gap:10px;align-items:center;font-size:13.5px"><span class="px-toggle is-on"></span>Warranty RO</span>
    <span style="display:flex;gap:10px;align-items:center;font-size:13.5px"><span class="px-toggle"></span>Comeback</span>
  </div>
</div>''')

C["ROPage"] = ("Patterns", 900, ' width=1440', """# ROPage

The repair order page: sidebar, a 48px header, then a reading column and a properties rail.

Top to bottom in the column: eyebrow (RO number · opened · days open), the customer in `display-lg`, the vehicle line, the status button and who has it; the StageTrack; Operations (the selected one open on its Parts tab, with its TimeCard); Activity. The RO details pane on the right holds the NextStep card, then the PropertyList, and never scrolls. The bronze numbers mark what changed (see *RO page — what changed*; 10 is the StatusMenu, 12 the Modal, 13 the header totals and the modals they open, 14 the running job in the clock-in card). Column max `measure` 760px with 48px sides; rail `rail` 300px behind a `hairline`.

Every role reads the same page: technicians live in Operations, advisors in the title, Next step and Money, managers in status, stage and who has it. Provide: one RO.
""", f'''{MARK}<div style="height:900px">{P.ro_page(wt=True)}</div>''')


# ---- round 2: Next in the details pane, collapsible details, parts dropdown, modals ----
C["NextStep"] = ("Feedback", 173, "", """# NextStep

One sentence that says what the RO needs next, and the one or two buttons that do it — the first thing in the RO details pane, above Schedule.

`accent-tint` card with an `accent-line` edge, `radius-lg`; a small header (“Next” in `accent-text`, the operation it is about in `ink-2`), the sentence in 13.5px 500, then full-width buttons — at most one accent. Write the reason first, then the instruction: “Operation 2 isn't approved yet — send the estimate.”

Pressing an action moves the card on to the next step (Estimate sent → waiting on approval → order the part → nothing waiting); the new text slides in 4px and fades up in 280ms, and the change shows a Toast with Undo. When nothing is waiting the card turns quiet (`hairline` outline, no tint) and says so. Provide: the current step's sentence, its actions, the operation it is about.
""", f'<div style="padding:20px;width:300px">{P.nextstep(False)}</div>')

C["PropertyList"] = ("Data", 836, "", """# PropertyList

The RO details pane: the NextStep card, then every RO field in five collapsible groups — Schedule, People, Vehicle, Paperwork, Money. The pane is sized to the window and never scrolls.

- Click a group's header to fold or unfold it (chevron turns, rows ease open in 240ms). A closed group shows a one-line summary on the right (“Money  $3,276.50”, “People  MR · DK”).
- If unfolding a group would overflow the pane, the group opened longest ago folds itself — so everything always fits. Default: Schedule, People, Vehicle open; Paperwork and Money closed.
- Rows: label `ink-3` in a 92px column, value `ink` 13px, 30px tall. Identifiers in `id` mono; VIN has a copy button that ticks green for a moment. A whole row is the edit target (hover `fill`); empty values read “Add …” in `ink-3`.
- Group actions sit in the header when open (People → “Transfer…”, which opens the Transfer modal).

Provide: the field groups, their summaries, edit handlers, the pane height.
""", f'<div style="height:836px;display:flex;box-shadow:inset 0 0 0 1px var(--hairline)">{P.details(False)}</div>')

parts_demo = "".join(P.part_row(*r) for r in [("1-1","Clutch kit, 15.5 in","85136213","1","received"),("1-2","Clutch release bearing","21515427","1","installed"),("2-1","Inner wheel seal, right rear","21422645","1","notordered")])
C["PartStatus"] = ("Data", 529, "", """# PartStatus

Each part's status is a dropdown: click it (or focus it and press Enter) for the five statuses and the part's options.

- Statuses, keys 1–5, with the same shapes as RO status: Not ordered (empty ring, `status-hold`) · Ordered (dashed, `status-waiting`) · Backordered (dashed, `status-problem`) · Received (half disc, `status-working`) · Installed (checked disc, `status-working`). The current one carries a check.
- Options: Edit part… (E) · Copy part number · Move to operation… (second level lists the other operations) · Remove part (danger, with Undo).
- Choosing a status pops the new icon in, glows the row bronze for a moment, updates the Parts tab count (“1/2”) and the operation row's note (“1 part not ordered”), and shows a Toast with Undo.

The trigger is a quiet 28px button: icon, status word, chevron that turns when open. Provide: the part, its status, the operations it can move to.
""", f'''<div style="padding:16px 32px;max-width:720px"><div class="px-list">{parts_demo}</div>
<div style="margin:6px 0 0 calc(100% - 252px)">{P.part_menu("received")}</div></div>''')

def _static(m):
    return m.replace('<div class="px-scrim" data-scrim>', '<div>')
C["Modal"] = ("Feedback", 725, " width=1440", """# Modal

Dialogs for work that needs a few fields or a confirmation: Transfer RO, Add operation, Delete RO.

**How they open.** From a link (“Transfer…”), a button (“Add operation”), a menu item (⋯ → Delete RO) or a key (T, O). The page dims under `scrim` with a 2px blur, fading in over 160ms; the dialog rises 8px and settles from 98% scale in 220ms. Focus lands on the first field. **How they close.** Esc, Cancel, the × or a click on the scrim; it fades out in 120ms and focus returns to what opened it. **⌘↵ / Ctrl ↵** confirms. One modal at a time; a dropdown inside one (Reason) floats above it.

**How they look.** `raised` surface, `radius-xl`, `shadow-raised`, 480px (400px for a confirm), placed 12% from the top. Title in the serif at 22px with a one-line `ink-3` subtitle; fields with `label` captions; footer with a keyboard hint on the left, then Cancel (ghost) and the one action — `primary`, or solid `bad` for a destructive confirm. A confirm says exactly what will go and that Undo exists.

Provide: title, subtitle, fields, the action and its handler. A read-only variant with a single Close button — the TotalsModal — opens from the header totals.
""", f'''<style>.px-modal{{max-height:none}}</style><div style="min-height:640px;background:var(--scrim);display:flex;gap:28px;align-items:flex-start;justify-content:center;padding:40px 24px">
{_static(P.modal_transfer(False))}{_static(P.modal_addop(False))}{_static(P.modal_delete(False))}</div>''')

def _w(m):
    return m.replace('<div class="px-scrim" data-scrim>', '<div>')
C["TotalsModal"] = ("Feedback", 1204, " width=1440", """# TotalsModal

The breakdown behind a header total: **Time on RO**, **Parts on RO** and **Files on RO**. The same Modal pattern, read-only: 560px wide, one **Close** button, `esc` hint on the left. It opens from its HeaderTotals chip, fades the page under `scrim`, rises 8px in 220ms, and closes with Esc, Close, the × or a click outside; ⌘↵ also closes. Focus lands on Close and returns to the chip.

- **Time** — four numbers (Quoted · Burnt · Left · Efficiency, efficiency in `good` at or above 100%), then one row per operation: status icon, number, title, a thin progress bar (`status-problem` once over quote), `burnt / quoted h`.
- **Parts** — a count for each of the five part statuses (same icons as PartStatus), then parts grouped by operation: description, part number in `id` mono, quantity, status icon and word.
- **Files** — grouped by *Whole RO* (dash photo, DTC report, estimate) and by operation: paperclip, file name, kind, date. A row opens the file.
- A group's header and every operation or part row are buttons: clicking one closes the modal and jumps to that operation (to its Parts or Files tab for those lists); the header shows a chevron on hover. Empty groups are left out.
- Numbers use tabular figures; identifiers use `mono`; labels `ink-3`; one hairline between rows and none after the last.

Provide: the RO's operations with burnt and quoted hours, parts with statuses, files with kind and date, and the jump handler.
""", f'''<style>.px-modal{{max-height:none}}</style><div style="background:var(--scrim);display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start;justify-content:center;padding:40px 24px">
{_w(P.modal_time(False))}{_w(P.modal_parts(False))}{_w(P.modal_files(False))}</div>''')

# ---- round 4: the phone app and the desktop carry-overs ----
import os as _os
SNAPS = json.load(open(_os.path.join(B, "mobile/snaps.json")))
APPCSS = open(_os.path.join(B, "mobile/app.css")).read()
def _strip(h, lo, hi, segs, live=None, now=None, inband=None, axis=True, cls="px-day"):
    pos = lambda t: (t - lo) / (hi - lo) * 100
    inb = f'<span class="px-day__in" style="left:{pos(inband[0]):.2f}%;right:{100 - pos(inband[1]):.2f}%"></span>' if inband else ''
    sg = "".join(f'<i{" class=is-live" if live == k else ""} style="left:{pos(a):.2f}%;width:{pos(b) - pos(a):.2f}%"></i>' for k, (a, b) in enumerate(segs))
    nw = f'<b style="left:{pos(now):.2f}%"></b>' if now else ''
    ax = ('<div class="px-day__axis">' + "".join(f'<span style="left:{pos(t):.2f}%">{l}</span>' for t, l in [(7, "7a"), (9, "9a"), (11, "11a"), (13, "1p"), (15, "3p")]) + '</div>') if axis else ''
    return f'<div class="{cls}">{inb}{sg}{nw}</div>{ax}'
WEEK = [("Mon", "Oct 19", [(7.5, 11.08), (12.17, 13.68), (13.9, 15.2)], "6.32", "118"), ("Tue", "Oct 20", [(7.5, 8.7), (8.85, 10.4), (10.6, 12), (12.5, 15.1)], "6.95", "104"),
        ("Wed", "Oct 21", [(7.4, 9.9), (10.2, 11.9), (12.6, 14.8)], "6.30", "96"), ("Thu", "Oct 22", [(7.5, 8.7), (8.85, 9.6), (9.7, 10.25)], "2.50", "112")]
week = "".join(f'<div class="px-week__d"><b>{d}</b>{dt}</div><div>{_strip(None, 7, 15.5, sg, live=(len(sg) - 1 if d == "Thu" else None), now=(10.25 if d == "Thu" else None), inband=((6.97, 10.25) if d == "Thu" else (6.97, 15.4)), axis=False)}</div><div class="px-week__n">{h}<small>on jobs</small></div><div class="px-week__n">{e}%<small>eff.</small></div>' for d, dt, sg, h, e in WEEK)
C["DayStrip"] = ("Data", 376, "", """# DayStrip

A day of clocked time as one bar: each segment is a stretch on a job, gaps are time on the clock but not on a job, and a thin `ink` line marks now. The running segment is the view's `accent`; finished ones are `ink-2`; the clocked-in span is a `selected` band behind them.

- **Phone, Today:** in the shift card with the clock-in state above it and On jobs · Off jobs · Efficiency below. The window runs 7a–3:30p and widens to fit an early start or a late finish.
- **Desktop, Time log:** one row per day — day and date, the strip, hours on jobs, efficiency. It shows at a glance where the day went and where an EOD correction is needed.
- Segments are 4px-radius bars inset 5px (4px in the week rows) on a `fill` track, `radius-md` corners; axis labels in 11px `ink-3`, every two hours. A segment's tooltip names the RO, the operation and the times.

Provide: the day's time entries (start, stop, job), the clock-in span, and now.""", f'''<div class="px-demo col" style="gap:28px;align-items:stretch;max-width:760px">
  <div style="max-width:380px"><div class="px-week__h" style="margin-bottom:10px">Today</div>{_strip(None, 7, 15.5, [(7.5, 8.7), (8.85, 9.6), (9.7, 10.25)], live=2, now=10.25, inband=(6.97, 10.25))}</div>
  <div><div class="px-week__h" style="margin-bottom:10px">Time log · this week</div><div class="px-week">{week}</div></div>
</div>''')

_ck = P.sidebar(wt=False, running=True); CKCARD = _ck[_ck.index('<div class="px-clockin"'):_ck.index('<nav class="px-nav">')]
CBAR_CSS = "\n".join(l for l in APPCSS.split("\n") if l.startswith(".pm-cbar"))
cbar = SNAPS["today"].split('<div class="pm-cbar"', 1)[1].split('<nav class="pm-tabs">', 1)[0]
C["ClockBar"] = ("Feedback", 320, "", """# ClockBar

The running clock follows the technician everywhere. One job runs at a time; wherever you are, its time is one glance away and stop is one tap away.

- **Phone:** a 56px `primary` bar (ink in Ivory, ivory in Graphite) floating 12px in from the edges just above the tab bar on every screen except the job itself: breathing champagne dot, RO · operation · what you're doing in 11.5px, the job in 14px, the running time in tabular figures, and a round stop button. Tap the bar to open the job; stop opens the stop sheet (Waiting – Parts … Complete, Lunch, End of day).
- **Desktop:** the same information as a second line in the sidebar's clock-in card (see Sidebar).
- It rises in from the bottom in 240ms when a clock starts and leaves when it stops. Its time is the operation's total burnt time, not just this stretch — the same number as the TimeCard.

Provide: the running entry (RO, operation, reason, start) and a stop handler.""", f'''<style>{CBAR_CSS}</style><div class="px-demo col" style="gap:24px;align-items:flex-start">
  <div style="width:390px;background:var(--panel);padding:12px 0;border-radius:16px;box-shadow:inset 0 0 0 1px var(--hairline)"><div class="pm-cbar" style="animation:none"{cbar}</div>
  <div style="width:260px;padding:12px;box-sizing:border-box;background:var(--canvas);border-radius:16px">{CKCARD}</div>
</div>''')

def _phone(cap, html):
    return f'<figure class="phf"><figcaption>{cap}</figcaption><div class="ph">{html}</div></figure>'
PHONE_CSS = APPCSS.replace("html, body {", ".ph-unused {").replace("body {", ".ph-unused2 {") + """
.phs{display:flex;flex-wrap:wrap;gap:40px 36px;justify-content:center;padding:32px 24px;background:var(--canvas)}
.phf{margin:0;display:flex;flex-direction:column;align-items:center;gap:12px}
.phf figcaption{font:500 13px/18px var(--font-sans);color:var(--ink-2)}
.ph{position:relative;width:390px;height:844px;border-radius:46px;overflow:hidden;background:var(--panel);color:var(--ink);font-family:var(--font-sans);box-shadow:0 0 0 8px #1b1a18,0 0 0 9px #44413c,0 30px 60px -30px rgba(0,0,0,.4)}
.ph .app{height:100%}.ph .view{padding-top:46px}.ph .view.is-enter .wrap{animation:none}.ph .pm-sheet,.ph .pm-sheet__p,.ph .pm-cbar{animation:none}
"""
C["PhoneApp"] = ("Patterns", 1860, " width=1440", """# PhoneApp

Parsec Mobile — the technician's phone app, built from the same tokens and components as the desktop. One HTML file that works with no signal; ROs come from Parsec on the computer and changes go back to it by QR codes.

**Screens.** A four-tab bar — Today · ROs · Sync · Me — with a count on Sync for changes waiting to go. **Today** lists your operations across every RO (Ready to work, then Waiting) under a shift card with the DayStrip. **RO** is the desktop RO page in one column: eyebrow, serif customer, status, the Time · Parts · Files tiles (each opens a sheet), the stage line (seven ticks), the NextStep card, operations, details. **Operation** is where the work happens: the TimeCard at phone size, Parts · Time · Notes · Files tabs, and an action bar — Photo, Note (hold to dictate), Start / Stop clock.

**Moves.** The ClockBar follows you. Swipe a job or operation left to start its clock, a part left to mark it Received; long-press a row for its full menu. Menus and dialogs become bottom sheets: 52px rows, a grab handle, swipe down or tap outside to close. Stopping the clock asks why, in one tap. Photos go straight into the operation's Files (or the RO's Dash photo / DTC / Picture), shrunk to 1600px on capture, and tick the matching close-out step. Dictated notes get the date and time stamp, like Enter on the desktop. Every change shows a Toast with Undo.

**Rules.** Text 15px (17.5px in **Bay mode**, which also makes targets 54px+ and labels `ink-2` — for gloves and bright bays); inputs 16px so the phone never zooms; targets at least 44px; safe areas respected; tabular figures for every number. Theme follows the phone's dark mode unless set in Me. One accent per screen: the running clock, the current stage, or the one action the Next card asks for.

**Sync.** Same QR loop as the desktop (TQ1 frames). Send to computer shows the codes with a progress ring and keeps the screen awake; Get from computer reads the computer's codes, and the computer's reply confirms what it took. Changes stay on the phone, marked Sent / Not taken, until confirmed. Photos travel separately (share to the RO folder).

Provide: the ROs from the computer (Phone sync → Send to phone).""", f'''<style>{PHONE_CSS}</style><div class="phs">{_phone("Today", SNAPS["today"])}{_phone("RO", SNAPS["ro"])}{_phone("Operation", SNAPS["op"])}{_phone("Part status sheet", SNAPS["sheet"])}{_phone("Sync — send to computer", SNAPS["sync"])}{_phone("Today in Bay mode", SNAPS["bay"])}</div>''')

def build():
    for name, (group, h, extra, readme, body) in C.items():
        d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
        marker = f'<!-- @dsCard group="{group}" height={h}{extra} -->'
        open(os.path.join(d, "preview.html"), "w").write(doc(name, body, marker))
        open(os.path.join(d, "README.md"), "w").write(readme.strip() + "\n")
    print(len(C), "components")
if __name__ == "__main__":
    build()
