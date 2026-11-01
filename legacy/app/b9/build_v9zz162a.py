# Parsec 16.2 (A) — better automations: six more built-ins next to Status sync and Parts → status (parts in → the tech and the
# foreman; waiting on the customer 4 h → the advisor; ready to release → the advisor and the foreman; Start on an operation whose
# part isn't in asks first; past 100 % of the quote while the clock runs → the foreman; warranty claims chased → the warranty
# admin and the advisor), each with its switch and threshold; every automated action written to a log, shown as "What ran"
# with Undo on each line; autoPageHtml() / autoPageMount(el) for the Settings › Automations page (b9/v162a.js + v162a.css).
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, KEEP_EXTRA, HOOK_NAMES, LOG.
# the module, right after the built-in list it adds to
js = rep(js, "var AUTO_STOP_ALL = null;", b9("v162a.js") + "\nvar AUTO_STOP_ALL = null;")
# each built-in row: the new ones show their threshold and who they tell
js = rep(js, """h += '<div class="am-rule"><div class="am-t"><b>'+b[1]+'</b><span>'+b[2]+'</span></div>'""",
             """h += '<div class="am-rule"><div class="am-t"><b>'+b[1]+'</b><span>'+b[2]+'</span>'+v162Thr(b[0])+'</div>'""")
# the RO page's own Start (the timer, the calm clock, the clock card): a part that isn't in asks first, after the part lock
js = rep(js, r"""    var lk = opPartLock(job);
    if (lk) { toast('Can\u2019t start repairing \u2014 ' + lockLine(lk) + '. Get the part in hand first.'); focusParts(job); return; }
""", r"""    var lk = opPartLock(job);
    if (lk) { toast('Can\u2019t start repairing \u2014 ' + lockLine(lk) + '. Get the part in hand first.'); focusParts(job); return; }
    if (typeof v162AskStart === 'function' && v162AskStart(RO.id, job.id, null, function () { toggleJobClock(job); })) return;   /* Parsec 16.2 */
""")
EXTRA_CSS.append(b9("v162a.css"))
KEEP_EXTRA += ["autoPageHtml", "autoPageMount"]
HOOK_NAMES += ["V162", "v162Check", "v162Cfg", "v162Conds", "v162Log", "v162LogHtml", "v162Undo", "v162UndoOk", "v162AskStart", "autoPageHtml", "autoPageMount",
               "autoCfg", "autoFlush", "opPartLock", "getOp"]
LOG.append("Parsec 16.2 (A): six more built-in automations (parts in, waiting on the customer, ready to release, ask before a start, past the quote, warranty chase) with thresholds; What ran with Undo")
