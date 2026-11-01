# Parsec 14.6 (G) — "Still on the clock?" on every page, the clock-out check, and the missed clock-in question (b9/v146g.js + v146g.css).
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LOG.
# the clock-out entry points all go through shiftClockOut — the old one becomes shiftClockOut0, v146g.js puts the check in front
js = rep(js, "function shiftClockOut(reason, mins, notes, stand){", "function shiftClockOut0(reason, mins, notes, stand){")
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v146g.js") + "\nvar PG = (function(){\n")
EXTRA_CSS.append(b9("v146g.css"))


# every render looks at the corner cards again
js = rep(js, "  LAST_RENDER = Date.now();", "  LAST_RENDER = Date.now(); try{ v146Soon(); }catch(e){}")

KEEP_EXTRA += ["v146Tick", "v146Soon", "v146Check", "v146Finish", "v146Notes", "v146ClockInAt", "v146OutAt", "shiftClockOut0", "isShopPunchSafe"]
HOOK_NAMES += ["v146Tick", "v146NudState", "v146InState", "v146Open", "shiftClockOut", "shiftClockOut0", "V146", "openShift", "shiftsOfPerson"]
LOG.append("Parsec 14.6 (G): Still on the clock? on every page, the clock-out check, the missed clock-in question")
