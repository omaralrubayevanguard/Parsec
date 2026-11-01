# Parsec 15 (B) — the clock only reminds. Nothing stops or clocks out by itself for lunch or at the end of the day:
#   · lunchOffClock (run on every save) closed the day clock when a punch stopped as Lunch or End of day — now it returns at once
#   · the RO page / Technician clock card automation (ockAuto) paused a running job at the shop's lunch time (ockAutoStop) and
#     started it again at the lunch's end — both are off (14.9 already made the end of the shift stop nothing)
# Reminders instead (b9/v150b.js + v150b.css), drawn in 14.6's corner: Lunch time after 4 h on the clock, Clock out for the
# day? when a job stops as End of day (Clock out for lunch? when it stops as Lunch), Not now asks again in 15 min.
# Runs inside build12.py after build_v9zz149*.py: uses js, rep, b9, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LOG.
js = rep(js, "function lunchOffClock(){\n  var now = Date.now(), msg = null;",
             "function lunchOffClock(){\n  return;   /* Parsec 15: a stop never clocks you out — the reminders ask instead (b9/v150b.js) */\n  var now = Date.now(), msg = null;")
js = rep(js, '  if(mine && prev < d.la && now >= d.la){ ockAutoStop(rp, "Lunch", "lunch", "Lunch — your clock paused itself at " + ockClk(d.la) + ". It starts again at " + ockClk(d.lz) + "."); return; }\n',
             '  /* Parsec 15: the shop\'s lunch time pauses nothing — the Lunch time reminder asks after 4 hours on the clock (b9/v150b.js) */\n')
js = rep(js, "  if(!rp && prev < d.lz && now >= d.lz){\n    var L = (STATE.punches || []).filter(function(p){ return p.autoPause === \"lunch\"",
             "  if(false && !rp && prev < d.lz && now >= d.lz){   /* Parsec 15: nothing paused it, so nothing starts it again */\n    var L = (STATE.punches || []).filter(function(p){ return p.autoPause === \"lunch\"")
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v150b.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v150b.css"))
# the reminders draw inside 14.6's corner card host, after its "Still on the clock?"
js = rep(js, '      var N = UI.view === "timelog" ? null : v146NudState(); if(N) h += v146NudHtml(N);',
             '      var N = UI.view === "timelog" ? null : v146NudState(); if(N) h += v146NudHtml(N);\n      try{ h += v150Html(N); }catch(e150){}   /* Parsec 15: Lunch time · Clock out for the day? */')
KEEP_EXTRA += ["v150Html", "v150LunchState", "v150StopState", "v150OutAt", "v150LunchHtml", "v150StopHtml"]
HOOK_NAMES += ["V150", "v150LunchState", "v150StopState", "lunchOffClock"]
LOG.append("Parsec 15 (B): the clock only reminds — no lunch pause, no clock-out on a Lunch / End of day stop; Lunch time after 4 h, Clock out for the day?, Not now = 15 min")
