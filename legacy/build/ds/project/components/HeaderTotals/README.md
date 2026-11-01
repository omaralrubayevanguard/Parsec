# HeaderTotals

Three quiet counters at the top right of the RO page — **Time**, **Parts**, **Files** — each a button that opens a modal with the breakdown (see TotalsModal).

- **Time** is hours burnt over hours quoted across every operation, `6.27 / 11.90 h`; **Parts** is parts in hand (Received or Installed) over all parts, `3 / 5`; **Files** is a single count, `6`. Icon from the Parsec set (clock, box, paperclip) in `ink-3`, numbers in `ink` with tabular figures, the denominator in `ink-3`.
- Ghost buttons at 28px: hover and the open state use `fill`; focus shows `shadow-focus`. A `title` and an `aria-label` give the long form (“Time: 6.27 of 11.90 hours quoted. Open breakdown”).
- They are live: Time ticks with the running clock (its icon turns `accent` while a clock runs — the same single accent as the clock itself); Parts and Files glow `accent-tint` for a moment when their count changes; adding an operation moves the quoted hours and the Money group's Labor line with it.
- A hairline separates them from the page actions. They are the RO's totals, not the selected operation's: that stays in the TimeCard.

Provide: the RO's operations (burnt and quoted hours), parts with statuses, files, and a handler per button.
