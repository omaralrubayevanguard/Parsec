# PartStatus

Each part's status is a dropdown: click it (or focus it and press Enter) for the five statuses and the part's options.

- Statuses, keys 1–5, with the same shapes as RO status: Not ordered (empty ring, `status-hold`) · Ordered (dashed, `status-waiting`) · Backordered (dashed, `status-problem`) · Received (half disc, `status-working`) · Installed (checked disc, `status-working`). The current one carries a check.
- Options: Edit part… (E) · Copy part number · Move to operation… (second level lists the other operations) · Remove part (danger, with Undo).
- Choosing a status pops the new icon in, glows the row bronze for a moment, updates the Parts tab count (“1/2”) and the operation row's note (“1 part not ordered”), and shows a Toast with Undo.

The trigger is a quiet 28px button: icon, status word, chevron that turns when open. Provide: the part, its status, the operations it can move to.
