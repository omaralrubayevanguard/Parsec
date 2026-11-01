# TotalsModal

The breakdown behind a header total: **Time on RO**, **Parts on RO** and **Files on RO**. The same Modal pattern, read-only: 560px wide, one **Close** button, `esc` hint on the left. It opens from its HeaderTotals chip, fades the page under `scrim`, rises 8px in 220ms, and closes with Esc, Close, the × or a click outside; ⌘↵ also closes. Focus lands on Close and returns to the chip.

- **Time** — four numbers (Quoted · Burnt · Left · Efficiency, efficiency in `good` at or above 100%), then one row per operation: status icon, number, title, a thin progress bar (`status-problem` once over quote), `burnt / quoted h`.
- **Parts** — a count for each of the five part statuses (same icons as PartStatus), then parts grouped by operation: description, part number in `id` mono, quantity, status icon and word.
- **Files** — grouped by *Whole RO* (dash photo, DTC report, estimate) and by operation: paperclip, file name, kind, date. A row opens the file.
- A group's header and every operation or part row are buttons: clicking one closes the modal and jumps to that operation (to its Parts or Files tab for those lists); the header shows a chevron on hover. Empty groups are left out.
- Numbers use tabular figures; identifiers use `mono`; labels `ink-3`; one hairline between rows and none after the last.

Provide: the RO's operations with burnt and quoted hours, parts with statuses, files with kind and date, and the jump handler.
