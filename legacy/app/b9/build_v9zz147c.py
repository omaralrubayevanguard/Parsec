# Parsec 14.7 (C) — Completed ROs kept per person (the Technician page's Completed section reads STATE.tcDone) and the
# lunch reminder (Lunch · 1 hour, no clock-in by itself). b9/v147c.js + v147c.css; the section is in b9/tc1.js, the
# Console / Technician clock-out menu in b9/cx3.js + cx4.js. Runs inside build12.py after build_v9zz146g.py.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v147c.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v147c.css"))
# the record: every save, and just before an RO is deleted (all the deletes write an ro-del audit line first)
js = rep(js, "  try{ lunchOffClock(); }catch(e){ console.warn('lunch clock', e); }",
             "  try{ lunchOffClock(); }catch(e){ console.warn('lunch clock', e); }\n  try{ v147Scan(true); }catch(e){}   /* Parsec 14.7: Completed, kept per person */")
js = rep(js, "function audit(type, text, ro){", "function audit(type, text, ro){\n  if(type === 'ro-del' && ro){ try{ v147Rec(ro); }catch(e){} }   /* Parsec 14.7: the RO stays in its tech's Completed */")
# the corner card looks again on every render
js = rep(js, "LAST_RENDER = Date.now(); try{ v146Soon(); }catch(e){}", "LAST_RENDER = Date.now(); try{ v146Soon(); }catch(e){} try{ v147Soon(); }catch(e){}")
# the sidebar clock pop-over: Lunch · 1 h beside Lunch · 30 min (the clock-off dialog already has 30 min / 1 hour)
js = rep(js, "Lunch · 30 min</button>'",
             "Lunch · 30 min</button>' + '<button class=\"px-btn sm\" data-action=\"clock-off\" data-reason=\"Lunch\" data-min=\"60\" title=\"Clock off for an hour \\u2014 no clock-in by itself, Parsec reminds you when it\\u2019s up\">Lunch · 1 h</button>'")
KEEP_EXTRA += ["v147Scan", "v147Rec", "v147Tick", "v147Soon", "v147LunState", "v147DoneList"]
HOOK_NAMES += ["v147Scan", "v147Rec", "v147LunState", "v147Tick", "V147C"]
LOG.append("Parsec 14.7 (C): Completed ROs on the Technician page, kept per person · Lunch · 1 hour with a reminder")
