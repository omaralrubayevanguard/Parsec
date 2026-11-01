# Modal

Dialogs for work that needs a few fields or a confirmation: Transfer RO, Add operation, Delete RO.

**How they open.** From a link (“Transfer…”), a button (“Add operation”), a menu item (⋯ → Delete RO) or a key (T, O). The page dims under `scrim` with a 2px blur, fading in over 160ms; the dialog rises 8px and settles from 98% scale in 220ms. Focus lands on the first field. **How they close.** Esc, Cancel, the × or a click on the scrim; it fades out in 120ms and focus returns to what opened it. **⌘↵ / Ctrl ↵** confirms. One modal at a time; a dropdown inside one (Reason) floats above it.

**How they look.** `raised` surface, `radius-xl`, `shadow-raised`, 480px (400px for a confirm), placed 12% from the top. Title in the serif at 22px with a one-line `ink-3` subtitle; fields with `label` captions; footer with a keyboard hint on the left, then Cancel (ghost) and the one action — `primary`, or solid `bad` for a destructive confirm. A confirm says exactly what will go and that Undo exists.

Provide: title, subtitle, fields, the action and its handler. A read-only variant with a single Close button — the TotalsModal — opens from the header totals.
