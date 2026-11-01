# StatusMenu

The one place a status changes: a searchable list of the nine statuses with their shortcut numbers, and sub-reasons in a second level.

- Opens from the status button (or **S** anywhere on the RO page). Type to filter; **1–9** pick directly; **→** opens the sub-reasons.
- Groups are split by hairlines: on the board · working and waiting · complete · declined.
- The sub-reason panel repeats the status's one-line description, then its reasons; choosing one sets both (“Waiting – Parts · Ordered”) and shows a Toast with Undo.

Replaces the old menu that showed every status and every reason at once. Provide: the current status (marked `is-on`), the status list, and an `onSelect(status, reason)`.
