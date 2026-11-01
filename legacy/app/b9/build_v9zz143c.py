# Parsec 14.3 — Done's question only on Done: opCompleteGaps is a plain question again (14.1 made every caller — opStatus while
# drawing, Ready to close — pop "finish it anyway?"); the places a person stops as Complete or presses Done ask through v141GapsAsk.
# Runs inside build12.py: uses js, rep, LOG, HOOK_NAMES.
for _a, _b in [
    ('if(/^Complete/.test(r) && op && typeof opCompleteGaps === "function"){ var g = opCompleteGaps(op); if(g.length){ p.stopReason', 'if(/^Complete/.test(r) && op && typeof opCompleteGaps === "function"){ var g = v141GapsAsk(op); if(g.length){ p.stopReason'),
    ('if(/^Complete/.test(r) && op && typeof opCompleteGaps === "function"){ var g = opCompleteGaps(op); if(g.length){ gaps = g;', 'if(/^Complete/.test(r) && op && typeof opCompleteGaps === "function"){ var g = v141GapsAsk(op); if(g.length){ gaps = g;'),
    ('var gg = cop ? opCompleteGaps(cop).filter(', 'var gg = cop ? v141GapsAsk(cop).filter('),
    ("if (/^Complete/.test(r) && job && opCompleteGaps(job).length) {", "if (/^Complete/.test(r) && job && v141GapsAsk(job).length) {"),
    ("function opCompleteGate(job) {\n  var g = opCompleteGaps(job);", "function opCompleteGate(job) {\n  var g = v141GapsAsk(job);"),
    ("live.forEach(function (j) { var g = []; try { g = opCompleteGaps(j); } catch (e) {}", "live.forEach(function (j) { var g = []; try { g = v141GapsAsk(j); } catch (e) {}")]:
    js = rep(js, _a, _b)
HOOK_NAMES += ["v141GapsAsk"]
LOG.append("Parsec 14.3: Done's question only on Done")
