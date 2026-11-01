/* Parsec · pages/timelog · _open.js
   Opens the Time Log closure (TL): one person's day and pay period from the punches and day clocks.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   TL (1 constant)
   at load    builds TL (a closure)
*/
/* ============================== Time Log (overhaul + recommendations + drag an edge + ideas mock-ups) ==============================
   One person's days: a list with what needs fixing on top, the day as a timeline you can drag, the week with
   efficiency week by week, the pay-period timesheet with sign → approve → lock, and the whole shop for leads.
   Times are minutes of the day here; they go back to the punches and day clocks as ISO times. */
var TL = (function(){
