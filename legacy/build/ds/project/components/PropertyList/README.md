# PropertyList

The RO details pane: the NextStep card, then every RO field in five collapsible groups — Schedule, People, Vehicle, Paperwork, Money. The pane is sized to the window and never scrolls.

- Click a group's header to fold or unfold it (chevron turns, rows ease open in 240ms). A closed group shows a one-line summary on the right (“Money  $3,276.50”, “People  MR · DK”).
- If unfolding a group would overflow the pane, the group opened longest ago folds itself — so everything always fits. Default: Schedule, People, Vehicle open; Paperwork and Money closed.
- Rows: label `ink-3` in a 92px column, value `ink` 13px, 30px tall. Identifiers in `id` mono; VIN has a copy button that ticks green for a moment. A whole row is the edit target (hover `fill`); empty values read “Add …” in `ink-3`.
- Group actions sit in the header when open (People → “Transfer…”, which opens the Transfer modal).

Provide: the field groups, their summaries, edit handlers, the pane height.
