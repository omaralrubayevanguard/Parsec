# Status

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
