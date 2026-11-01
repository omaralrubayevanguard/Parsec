# TimeCard

The clock for one operation: a big tabular timer, a thin quoted-time bar, four numbers and one round button.

- **Idle**: `primary` play button, caption “On this operation · 3 entries”.
- **Running**: the button turns `accent` with a stop glyph, a small `accent` dot breathes beside “Clock running · Repairing”, and the timer ticks. Nothing else animates.
- The bar fills in `ink-2` to burnt time; the `ink` tick marks quoted time; past it the overrun fills `status-problem`.
- Stats: Quoted · Burnt · Left · Efficiency, in `stat` style with a small unit. Efficiency takes `good` at 100 % or more, `warn` under 0.5 h left, `bad` when over quote.

Provide: quoted hours, punches (for burnt and the timer), running state, the start/stop handler. One TimeCard per open operation.
