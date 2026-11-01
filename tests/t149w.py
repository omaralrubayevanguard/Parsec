# Parsec 14.9 (W) — the words of every tooltip: tipNorm on real before / after pairs, the label-repeat case, and the build lint.
import asyncio, os, sys, json, re
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "t12_w.html"
FAILS = []
def ok(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: FAILS.append(m)
# (raw, ctx, title, details, keys)
P = [
 ("Search repair orders ( / )", {}, "Search ROs", [], ["/"]),
 ("Click to edit this part", {}, "Edit this part", [], []),
 ("Burnt", {}, "Burnt · hours clocked on this RO", [], []),
 ("Snooze (S)", {}, "Snooze until tomorrow 07:00", [], ["S"]),
 ("Snooze  (S)", {}, "Snooze until tomorrow 07:00", [], ["S"]),
 ("On the clock — click to stop", {}, "Stop the clock", [], []),
 ("Close (Esc)", {}, "Close", [], ["Esc"]),
 ("Done (Ctrl ↵)", {}, "Done · take it off the list", [], ["Ctrl", "↵"]),
 ("Start (Enter)", {}, "Start the clock", [], ["↵"]),
 ("Close the sidebar  [", {}, "Close the sidebar", [], ["["]),
 ("Search — RO, VIN, unit, customer or part  Ctrl K", {}, "Search everything", ["An RO, VIN, unit, customer or part"], ["Ctrl", "K"]),
 ("Find an RO — number, VIN, unit, customer or part (Ctrl+K)", {}, "Find an RO", ["By number, VIN, unit, customer or part"], ["Ctrl", "K"]),
 ("Fold the list — the page gets the whole width ( ] )", {}, "Fold the list", ["The page gets the whole width"], ["]"]),
 ("Period (D · W · M · Q · Y · A)", {}, "Change the period", ["Day, week, month, quarter, year or all"], ["D", "W", "M", "Q", "Y", "A"]),
 ("Show on the yard  ⇧↵", {}, "Show it on the yard", [], ["⇧", "↵"]),
 ("Quoted hours — click to change", {}, "Change the quoted hours", [], []),
 ("Click to change", {}, "Change it", [], []),
 ("Double-click to rename", {}, "Rename", ["Double-click the name"], []),
 ("ETA", {}, "When the part is due in", [], []),
 ("Close", {}, "Close it", [], []),
 ("Tick to plan together  (X)", {}, "Plan these together", [], ["X"]),
 ("Print (P)", {}, "Print the RO", [], ["P"]),
 ("Previous RO (K)", {}, "Previous RO", [], ["K"]),
 ("Edit — the start, stop it earlier, the reason, the operation (E)", {}, "Edit the punch", ["The start, an earlier stop, the reason, the operation"], ["E"]),
 ("Note on this punch — Enter or Save adds it with a time stamp; it also saves itself when you change page or the clock changes", {}, "A note on this punch", ["Enter or Save adds it with a time stamp · it saves itself when you leave"], []),
 ("Complete and release the truck without the truck checks — asks why", {}, "Complete and release", ["Skips the truck checks · asks why"], []),
 ("Search — RO, claim #, VIN, customer or code", {}, "Search claims", ["RO, claim #, VIN, customer or code"], []),
 ("Clear formatting — back to plain text", {}, "Clear formatting", ["Back to plain text"], []),
 ("Save this note — no clock needed", {}, "Save this note", ["No clock needed"], []),
 ("Saves a note on this operation without clocking on. It goes into the timeline at the time you save it.", {}, "Save a note without the clock", ["It goes into the timeline at the time you save it"], []),
 ("Delete this operation?", {}, "Delete this operation", [], []),
 ("Air|on the clock, not on a job", {}, "Air", ["On the clock, not on a job"], []),
 ("Manager only|No other role can open this page — Team shows it locked.", {}, "Manager only", ["No other role can open this page — Team shows it locked"], []),
 ("Clear All Data Now", {}, "Clear all data now", [], []),
 ("Open The RO Page", {}, "Open the RO page", [], []),
 ("Save the note.", {}, "Save the note", [], []),
 ("Tap to open the photo", {}, "Open the photo", [], []),
 ("Mike Rodriguez — click to start the clock anyway", {}, "Start the clock anyway", ["Mike Rodriguez"], []),
 ("Replace hose · click to stop the punch", {}, "Stop the punch", ["Replace hose"], []),
 ("On the clock since 07:02 · click to clock out", {}, "Clock out", ["On the clock since 07:02"], []),
 ("Clock on: Replace NOx sensor", {}, "Start the clock", ["Replace NOx sensor"], []),
 ("Check engine light — click to change it", {}, "Change the complaint", ["Check engine light"], []),
 ("Ivory — click for Graphite", {}, "Ivory", ["Switch to Graphite"], []),
 ("Waiting – Parts (3)", {}, "Waiting – Parts", [], ["3"]),
 ("Total sales|So far::$134k|Goal::$118k|~Click to clear", {}, "Total sales", ["So far::$134k", "Goal::$118k", "~Clear the filter"], []),
 ("Undo — Ctrl+Z", {}, "Undo the last change" if False else "Undo", [], ["Ctrl", "Z"]),
 ("Clock off for a 30-minute lunch — the job stops for lunch", {}, "Lunch · 30 minutes", ["The job stops for lunch"], []),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto("file://" + H + "/" + PAGE); await pg.wait_for_timeout(1200)
        ok(await pg.evaluate("typeof window.tipNorm === 'function' && typeof TIPMAP === 'object'"), "tipNorm and TIPMAP are in the page")
        R = await pg.evaluate("(P) => P.map(x => window.tipNorm(x[0], x[1]))", [[x[0], x[1]] for x in P])
        n = 0
        for (raw, ctx, t, d, k), r in zip(P, R):
            good = r is not None and r["t"] == t and r["d"] == d and r["k"] == k
            n += good
            if not good: ok(False, f"{raw!r} → {r} (wanted {t!r} {d} {k})")
        ok(n == len(P), f"{n} of {len(P)} real tooltips come out right")
        # the label-repeat case: a button that already says it
        rr = await pg.evaluate("""[window.tipNorm('Display', { label: 'Display' }), window.tipNorm('Display (D)', { label: 'Display' }), window.tipNorm('Display (D)', { label: 'Display', icon: true }),
          window.tipNorm('Release without checks', { label: 'Release without checks' }), window.tipNorm('Complete and release the truck without the truck checks — asks why', { label: 'Release without checks' }), window.tipNorm('', {})]""")
        ok(rr[0] is None and rr[1] is None, "a tip that only repeats the button's label is dropped (keys aren't shown on labelled buttons)")
        ok(rr[2] and rr[2]["k"] == ["D"], "…but an icon button keeps its key chip")
        ok(rr[3] is None and rr[4] and rr[4]["t"] == "Complete and release", "a tip that adds something stays")
        ok(rr[5] is None, "empty text → no tip")
        # every title on the page now: none over 60 / Click to / brackets / Title Case / full stop after the rules
        rep = await pg.evaluate("""(() => { const out = []; document.querySelectorAll('[title]').forEach(el => { const r = window.tipNorm(el.getAttribute('title'), {}); if(!r) return;
          const w = []; if(r.t.length > 60) w.push('long'); if(/\\b(click|tap) (to|for)\\b/i.test([r.t].concat(r.d).join(' '))) w.push('click to'); if(/\\.$/.test(r.t)) w.push('stop'); if(/\\(\\s*(esc|enter|[a-z0-9\\/])\\s*\\)$/i.test(r.t)) w.push('key');
          if(w.length) out.push(el.getAttribute('title') + ' → ' + r.t + ' ' + w.join(',')); }); return [document.querySelectorAll('[title]').length, out]; })()""")
        ok(not rep[1], f"the {rep[0]} titles on the opening page all follow the rules ({rep[1][:3]})")
        ok(not errs, "no page errors: " + " | ".join(errs[:3]))
        await b.close()
    lint = open(os.path.join(H, "_tiplint.txt"), encoding="utf-8").read()
    m = re.search(r"(\d+) static tooltips checked, (\d+) break a writing rule", lint)
    ok(bool(m) and int(m.group(1)) > 250, f"the build's lint ran over the page ({m.group(1) if m else '?'} tooltips)")
    ok(bool(m) and m.group(2) == "0", f"the lint flags none ({m.group(2) if m else '?'})")
    log = open(os.path.join(H, "_b149w.log"), encoding="utf-8").read() if os.path.exists(os.path.join(H, "_b149w.log")) else ""
    ok("tooltip lint:" in log, "the build log carries the lint line")
    print("FAILS", len(FAILS)); [print(" -", f) for f in FAILS]
asyncio.run(main())
