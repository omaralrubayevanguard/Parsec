# Parsec 14.9 (D) — air never counts toward efficiency, no clock stops at the end of the shift, the key tag beside the spot.
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
#
# 1) Air is only where the time went. Every efficiency figure already reads quoted hours ÷ hours on jobs (the Time Log's
#    day / week / trend / timesheet and the day report: q ÷ minutes on finished jobs; the Technician page, the RO page clock
#    card, Career and Manager: quoted ÷ the operation's burnt hours, which are its punches). The words that said otherwise go:
#    the Console / Technician "air counts against your efficiency" nudges, the KPI and Career labels that called hours on
#    jobs "hours clocked", and "Overall" (sold ÷ on the clock, air in) says it's productivity, not efficiency.
js = rep(js, "Air time counts against your efficiency — pick the next one or start shop time.",
             "Air shows where the time went — it doesn’t count toward your efficiency. Pick the next one or start shop time.")
js = rep(js, "Air time counts against you — start the next one.", "Air shows where the time went — it doesn’t count toward your efficiency.")
js = rep(js, "Hours sold ÷ hours clocked, on the same operations.", "Hours sold ÷ hours on those jobs — air and shop time don’t count.", 2)
js = rep(js, "mh:'Sold / clocked'", "mh:'Sold / on the job'", 2)
js = rep(js, "Hours sold ÷ hours on the clock — efficiency and productivity in one number.", "Hours sold ÷ hours on the clock, air included — a productivity figure, not efficiency.", 2)
js = rep(js, "n:'Labor $ per clocked hour'", "n:'Labor $ per hour on jobs'", 2)
js = rep(js, "Labor sold ÷ hours clocked. At 100% efficiency it’s the labor rate.", "Labor sold ÷ hours on jobs (air doesn’t count). At 100% efficiency it’s the labor rate.", 2)
js = rep(js, "mh:'Per clocked h'", "mh:'Per hour on jobs'", 2)
js = rep(js, "h clocked`]", "h on jobs`]", 2)
js = rep(js, "'Hours clocked'", "'Hours on jobs'", 5)
js = rep(js, "<small>Clocked</small><b>${h1(b)} h</b>", "<small>On jobs</small><b>${h1(b)} h</b>")
js = rep(js, "Air — on the clock, off a job</span>", "Air — on the clock, off a job · not in efficiency</span>", 2)
js = rep(js, "air is clocked time on no job and not lunch", "air is clocked time on no job and not lunch, and never counts toward efficiency")

# 2) The end of the shift stops nothing. The RO page / Technician clock card's automation (ockAuto) stopped a running clock
#    at the shop's end of day (and that stop closed the day clock through lunchOffClock). Now it only says the clock is still
#    running; the 14.6 "Still on the clock?" card and the Time Log reminder stay. Lunch's pause / restart is left as it is.
js = rep(js, '  if(mine && prev < d.z && now >= d.z){ ockAutoStop(rp, "End of day", "eod", "End of day — your clock stopped itself at " + ockClk(d.z) + "."); return; }',
             '  if(mine && prev < d.z && now >= d.z){ ockToast("The shift ended at " + ockClk(d.z) + " — your clock keeps running. Stop it when you’re done."); return; }   /* Parsec 14.9: the end of the shift stops nothing */')
js = rep(js, '+ (mineRun ? " — the clock stops itself" : "");', '+ (mineRun ? " — your clock keeps running" : "");')
js = rep(js, "lunch and the end of the day: your running clock pauses itself at lunch, starts again after, stops at the end of the day",
             "lunch and the end of the day: your running clock pauses itself at lunch and starts again after; the end of the day only says so (Parsec 14.9)")

# 3) The key tag beside the spot (ro.keyTag — already in the RO details' Vehicle group, the RO list's Key tag column and the import)
js = rep(js, "function rifHtml(ro, k, shown, ph){", b9("v149d.js") + "\nfunction rifHtml(ro, k, shown, ph){")
js = rep(js, 'unitNumber: "Add unit", location: "Add spot" };', 'unitNumber: "Add unit", location: "Add spot", keyTag: "Add key" };')
# the RO page's truck card line
js = rep(js, "(RO.location ? ' · ' + rifHtml(RO, 'location', RO.location) : '');", "(RO.location ? ' · ' + rifHtml(RO, 'location', RO.location) : '') + v149KeySeg(RO);")
# the RO list pane and the RO list's Spot column
js = rep(js, '<div class="sub">${rifVeh(ro, r.veh)}${r.spot && r.spot !== \'—\' ? \' · \' + esc(r.spot) : \'\'}</div>',
             '<div class="sub">${rifVeh(ro, r.veh)}${r.spot && r.spot !== \'—\' ? \' · \' + esc(r.spot) : \'\'}${v149KeySeg(ro)}</div>')
js = rep(js, "spot:    { l: 'Spot', w: '52px', min: 52, peek: 1, cell: r => `<span class=\"rq-sub\">${esc(r.spot)}</span>`,",
             "spot:    { l: 'Spot', w: '96px', min: 52, peek: 1, cell: r => `<span class=\"rq-sub\">${esc(r.spot)}${r.ro && v149KeyTxt(r.ro) ? ' · ' + esc(v149KeyTxt(r.ro)) : ''}</span>`,")
# the Technician page's list rows
js = rep(js, "cxBring && !bayLike(o.spot) ? 'coming in' : o.spot || 'no spot');",
             "cxBring && !bayLike(o.spot) ? 'coming in' : (o.spot || 'no spot') + (o.ro && v149KeyTxt(o.ro) ? ' · ' + v149KeyTxt(o.ro) : ''));")
# the New RO import reads "Key tag", "Tag #", and now "Key #", "Key no." and "Key tag number" too
js = rep(js, r'["tag", /^(?:key\s*)?tag\s*(?:#|no\.?)?(?=\s*[:#]|\s+[A-Z0-9]|\s*$)/i],',
             r'["tag", /^(?:key\s*(?:#|no\.?|number)|(?:key\s*)?tag\s*(?:#|no\.?|number)?)(?=\s*[:#]|\s+[A-Z0-9]|\s*$|\s*\d)/i],')

HOOK_NAMES += ["v149KeySeg", "v149KeyTxt"]
LOG.append("Parsec 14.9 (D): air never counts toward efficiency · the end of the shift stops nothing · the key tag beside the spot")
