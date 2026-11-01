s = open("make_components.py").read()
def rep(old, new):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, 1)

rep(".px-head[data-n]::after{top:13px;left:auto;right:124px}", ".px-head[data-n]::after{top:13px;left:292px}.px-totals[data-n]::after{left:-30px;top:3px;box-shadow:0 0 0 3px var(--panel)}")

# PageHeader
i = s.index('C["PageHeader"]'); j = s.index('C["Tabs"]')
s = s[:i] + '''C["PageHeader"] = ("Navigation", 56, "", """# PageHeader

A 48px bar across the top of the main panel: breadcrumb on the left, previous/next with position beside it, and on the right the RO's totals followed by quiet icon actions.

Breadcrumb in `ink-3` with the current item in `ink` (the RO number in `id` mono). **K / J** move between ROs in the list you came from. On the right: the HeaderTotals (Time · Parts · Files), a hairline, then ghost icon buttons with titles — copy link, print, and ⋯ which opens the RO options Menu. Provide: the trail, list position, the RO's totals, actions.
""", f'<div style="background:var(--panel)">{P.header(False)}</div>')

C["HeaderTotals"] = ("Navigation", 150, "", """# HeaderTotals

Three quiet counters at the top right of the RO page — **Time**, **Parts**, **Files** — each a button that opens a modal with the breakdown (see TotalsModal).

- **Time** is hours burnt over hours quoted across every operation, `6.27 / 11.90 h`; **Parts** is parts in hand (Received or Installed) over all parts, `3 / 5`; **Files** is a single count, `6`. Icon from the Parsec set (clock, box, paperclip) in `ink-3`, numbers in `ink` with tabular figures, the denominator in `ink-3`.
- Ghost buttons at 28px: hover and the open state use `fill`; focus shows `shadow-focus`. A `title` and an `aria-label` give the long form (“Time: 6.27 of 11.90 hours quoted. Open breakdown”).
- They are live: Time ticks with the running clock (its icon turns `accent` while a clock runs — the same single accent as the clock itself); Parts and Files glow `accent-tint` for a moment when their count changes; adding an operation moves the quoted hours and the Money group's Labor line with it.
- A hairline separates them from the page actions. They are the RO's totals, not the selected operation's: that stays in the TimeCard.

Provide: the RO's operations (burnt and quoted hours), parts with statuses, files, and a handler per button.
""", f\'\'\'<div class="px-demo col" style="gap:20px;align-items:flex-start">
  <div class="px-head__acts" style="margin:0">{P.totals_bar(False)}</div>
  <div class="px-head__acts" style="margin:0">{P.totals_bar(False, live=True).replace('class="px-total" data-total="parts"', 'class="px-total is-open" data-total="parts"')}</div>
</div>\'\'\')

''' + s[j:]

# ROPage README
rep("10 is the StatusMenu, 12 the Modal).", "10 is the StatusMenu, 12 the Modal, 13 the header totals and the modals they open).")

# Modal README: pointer to info modals
rep("Provide: title, subtitle, fields, the action and its handler.\n\"\"\", f'''<style>.px-modal{{max-height:none}}</style>", "Provide: title, subtitle, fields, the action and its handler. A read-only variant with a single Close button — the TotalsModal — opens from the header totals.\n\"\"\", f'''<style>.px-modal{{max-height:none}}</style>")

# new component before build()
add = '''
def _w(m):
    return m.replace('<div class="px-scrim" data-scrim>', '<div>')
C["TotalsModal"] = ("Feedback", 1260, " width=1440", """# TotalsModal

The breakdown behind a header total: **Time on RO**, **Parts on RO** and **Files on RO**. The same Modal pattern, read-only: 560px wide, one **Close** button, `esc` hint on the left. It opens from its HeaderTotals chip, fades the page under `scrim`, rises 8px in 220ms, and closes with Esc, Close, the × or a click outside; ⌘↵ also closes. Focus lands on Close and returns to the chip.

- **Time** — four numbers (Quoted · Burnt · Left · Efficiency, efficiency in `good` at or above 100%), then one row per operation: status icon, number, title, a thin progress bar (`status-problem` once over quote), `burnt / quoted h`.
- **Parts** — a count for each of the five part statuses (same icons as PartStatus), then parts grouped by operation: description, part number in `id` mono, quantity, status icon and word.
- **Files** — grouped by *Whole RO* (dash photo, DTC report, estimate) and by operation: paperclip, file name, kind, date. A row opens the file.
- A group's header and every operation or part row are buttons: clicking one closes the modal and jumps to that operation (to its Parts or Files tab for those lists); the header shows a chevron on hover. Empty groups are left out.
- Numbers use tabular figures; identifiers use `mono`; labels `ink-3`; one hairline between rows and none after the last.

Provide: the RO's operations with burnt and quoted hours, parts with statuses, files with kind and date, and the jump handler.
""", f\'\'\'<style>.px-modal{{max-height:none}}</style><div style="background:var(--scrim);display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start;justify-content:center;padding:40px 24px;min-height:1180px">
{_w(P.modal_time(False))}{_w(P.modal_parts(False))}{_w(P.modal_files(False))}</div>\'\'\')

def build():'''
rep("\ndef build():", add)
open("make_components.py", "w").write(s)
print("ok")
