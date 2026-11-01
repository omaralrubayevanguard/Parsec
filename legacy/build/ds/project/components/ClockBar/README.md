# ClockBar

The running clock follows the technician everywhere. One job runs at a time; wherever you are, its time is one glance away and stop is one tap away.

- **Phone:** a 56px `primary` bar (ink in Ivory, ivory in Graphite) floating 12px in from the edges just above the tab bar on every screen except the job itself: breathing champagne dot, RO · operation · what you're doing in 11.5px, the job in 14px, the running time in tabular figures, and a round stop button. Tap the bar to open the job; stop opens the stop sheet (Waiting – Parts … Complete, Lunch, End of day).
- **Desktop:** the same information as a second line in the sidebar's clock-in card (see Sidebar).
- It rises in from the bottom in 240ms when a clock starts and leaves when it stops. Its time is the operation's total burnt time, not just this stretch — the same number as the TimeCard.

Provide: the running entry (RO, operation, reason, start) and a stop handler.
