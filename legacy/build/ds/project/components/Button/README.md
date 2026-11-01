# Button

One verb, sentence case, at most one **accent** button per view.

- **Primary** (`primary` fill, ink in light / ivory in dark) — the main action of a view: *Start clock*, *Save*.
- **Accent** (`accent` bronze, `on-accent` label) — the single action the page is asking for right now; on the RO page it lives in the Next-step strip (*Estimate sent*). Never two on one screen.
- **Secondary** (`raised` with a `border` outline) — everything else that needs a button.
- **Ghost** — toolbar and header actions; icon-only ghosts need a `title`.
- **Danger** — `bad` text, `bad-tint` on hover; destructive actions also go behind a menu and get an Undo toast.

Provide: a label (or an icon + `title`), optional leading icon from the Parsec set, optional `.px-kbd` shortcut hint. Sizes: `--sm` 28px (rows, rail, strips), default 32px, `--lg` 40px (dialogs). Hover changes fill only; press scales to 98%; focus shows `shadow-focus`.
