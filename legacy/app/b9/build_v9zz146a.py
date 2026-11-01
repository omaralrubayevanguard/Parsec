# Parsec 14.6 (A) — "Waiting – Sublet": an operation (or RO) sent out to a sublet vendor. It sits right below Waiting – Parts in
# every list, picker, map and rollup, and behaves like a parts hold: the op is waiting, not work the tech can do.
# The status look (icon + tone) is in b9/st14.js; the RO list, hold menus and Technician page in rl1/cx3/cx4/tc1/rop1.js.
# Runs inside build12.py: uses js, rep, LOG.
_S = "Waiting – Sublet"
for _a, _b in [
    # the shared status list (PX_STATUS): RO and job
    ('    { k: "Waiting – Parts", t: "waiting", who: "Parts" },\n    { k: "Waiting – Foreman", t: "waiting", who: "Foreman" },\n    { k: "Waiting – Tech Support", t: "support", who: "Tech support" },\n    { k: "Waiting – Customer", t: "customer", who: "Service writer" },\n    { k: "Complete – Road test"',
     '    { k: "Waiting – Parts", t: "waiting", who: "Parts" },\n    { k: "Waiting – Sublet", t: "waiting", who: "Service writer" },\n    { k: "Waiting – Foreman", t: "waiting", who: "Foreman" },\n    { k: "Waiting – Tech Support", t: "support", who: "Tech support" },\n    { k: "Waiting – Customer", t: "customer", who: "Service writer" },\n    { k: "Complete – Road test"'),
    ('    { k: "Waiting – Parts", t: "waiting", who: "Parts" },\n    { k: "Waiting – Foreman", t: "waiting", who: "Foreman" },\n    { k: "Waiting – Tech Support", t: "support", who: "Tech support" },\n    { k: "Waiting – Customer", t: "customer", who: "Service writer" },\n    { k: "Waiting – Approval"',
     '    { k: "Waiting – Parts", t: "waiting", who: "Parts" },\n    { k: "Waiting – Sublet", t: "waiting", who: "Service writer" },\n    { k: "Waiting – Foreman", t: "waiting", who: "Foreman" },\n    { k: "Waiting – Tech Support", t: "support", who: "Tech support" },\n    { k: "Waiting – Customer", t: "customer", who: "Service writer" },\n    { k: "Waiting – Approval"'),
    # stop reasons (every Stop menu), their colour, the automations' list, the phone's ticks
    ('var STOP_REASONS_EXPLICIT = ["Waiting – Parts","Waiting – Foreman"', 'var STOP_REASONS_EXPLICIT = ["Waiting – Parts","Waiting – Sublet","Waiting – Foreman"'),
    ('"Waiting – Parts":"wparts", "Waiting – Foreman":"wforeman"', '"Waiting – Parts":"wparts", "Waiting – Sublet":"wparts", "Waiting – Foreman":"wforeman"'),
    ('var AUTO_WAITS = ["Waiting – Parts","Waiting – Foreman"', 'var AUTO_WAITS = ["Waiting – Parts","Waiting – Sublet","Waiting – Foreman"'),
    (r'var MST = ["Hold Tech","Waiting \u2013 Parts","Waiting \u2013 Foreman"', r'var MST = ["Hold Tech","Waiting \u2013 Parts","Waiting \u2013 Sublet","Waiting \u2013 Foreman"'),
    # the RO status options (the RO's picker, STATUSES, stRank's order)
    ('  { status:"Waiting – Parts",       subs:["Not Ordered","Ordered","Backordered","Received"] },\n',
     '  { status:"Waiting – Parts",       subs:["Not Ordered","Ordered","Backordered","Received"] },\n  { status:"Waiting – Sublet",      subs:["Sent out","Due back"] },\n'),
    # the RO page's look and the job card's status names
    ('  "Waiting – Parts":        stLook(\'wait\', \'Held on a part that is out\'),\n',
     '  "Waiting – Parts":        stLook(\'wait\', \'Held on a part that is out\'),\n  "Waiting – Sublet":       stLook(\'wait\', \'Sent out to a sublet vendor\'),\n'),
    (r"var JOB_STATUS_NAMES = ['Hold Tech', 'Waiting \u2013 Parts', 'Waiting \u2013 Foreman'", r"var JOB_STATUS_NAMES = ['Hold Tech', 'Waiting \u2013 Parts', 'Waiting \u2013 Sublet', 'Waiting \u2013 Foreman'"),
    ("var ASST_JOB_STATUS_NAMES = ['Hold Tech', 'Waiting – Parts', 'Waiting – Foreman'", "var ASST_JOB_STATUS_NAMES = ['Hold Tech', 'Waiting – Parts', 'Waiting – Sublet', 'Waiting – Foreman'"),
    # the standalone sheet's codes
    ('var SHEET_STATUS = { "Hold Tech":0, "Working":1, "Waiting – Parts":2, ', 'var SHEET_STATUS = { "Hold Tech":0, "Working":1, "Waiting – Parts":2, "Waiting – Sublet":3, '),
    # the RO status the operations add up to: sublet after parts — Hold Tech while other ops are workable
    (r'  if(sts.indexOf("Waiting \u2013 Tech Support") >= 0) return { status: "Waiting \u2013 Tech Support", sub: null };',
     r'  if(sts.indexOf("Waiting \u2013 Sublet") >= 0){ var ns = sts.filter(function(x){ return x === "Waiting \u2013 Sublet"; }).length; return v141Workable(live).length ? { status: "Hold Tech", sub: ns + " op" + (ns === 1 ? "" : "s") + " out at the sublet" } : { status: "Waiting \u2013 Sublet", sub: null }; }   /* Parsec 14.6 */' + "\n" +
     r'  if(sts.indexOf("Waiting \u2013 Tech Support") >= 0) return { status: "Waiting \u2013 Tech Support", sub: null };'),
]:
    js = rep(js, _a, _b)
# ASIST's words → Parsec's statuses (the New RO import): "sublet" / "sent out" before parts
_m0 = '    if(/part/.test(s)) return "Waiting – Parts";'
if js.count(_m0) == 1:
    js = rep(js, _m0, '    if(/sublet|sent\\s*out|outside\\s*vendor/.test(s)) return "Waiting – Sublet";   /* Parsec 14.6 */\n' + _m0)
LOG.append("Parsec 14.6: Waiting – Sublet")
