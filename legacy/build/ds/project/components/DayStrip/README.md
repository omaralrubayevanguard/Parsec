# DayStrip

A day of clocked time as one bar: each segment is a stretch on a job, gaps are time on the clock but not on a job, and a thin `ink` line marks now. The running segment is the view's `accent`; finished ones are `ink-2`; the clocked-in span is a `selected` band behind them.

- **Phone, Today:** in the shift card with the clock-in state above it and On jobs · Off jobs · Efficiency below. The window runs 7a–3:30p and widens to fit an early start or a late finish.
- **Desktop, Time log:** one row per day — day and date, the strip, hours on jobs, efficiency. It shows at a glance where the day went and where an EOD correction is needed.
- Segments are 4px-radius bars inset 5px (4px in the week rows) on a `fill` track, `radius-md` corners; axis labels in 11px `ink-3`, every two hours. A segment's tooltip names the RO, the operation and the times.

Provide: the day's time entries (start, stop, job), the clock-in span, and now.
