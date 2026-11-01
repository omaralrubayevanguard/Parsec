# the Time Log ideas — exec'd by make.py (uses e, st, btn, kbd, chk, tag)
def seg(a, b, k, lab=""):   # a day bar segment, hours on a 6–18 axis
    l = (a - 6) / 12 * 100; w = (b - a) / 12 * 100
    return '<i class="sg %s" style="left:%.2f%%;width:%.2f%%">%s</i>' % (k, l, w, lab)
def bar(*segs, marks=""):
    return '<div class="tb">' + "".join(segs) + marks + '<div class="ax">' + "".join('<span style="left:%.2f%%">%02d</span>' % ((h - 6) / 12 * 100, h) for h in range(6, 19, 2)) + "</div></div>"
def mark(h, lab, cls=""): return '<b class="tm %s" style="left:%.2f%%">%s</b>' % (cls, (h - 6) / 12 * 100, ('<em>%s</em>' % e(lab)) if lab else '')
def fix(title, sub, ev, btns, tone="warn"):
    return ('<div class="fx t-%s"><div class="fh"><b>%s</b><small>%s</small></div>' % (tone, e(title), e(sub)) + ('<ul class="ev">' + "".join('<li><span>%s</span><em>%s</em></li>' % (e(a), e(c)) for a, c in ev) + "</ul>" if ev else "")
            + '<div class="ft">' + "".join(btns) + "</div></div>")
def prow(t, what, d, cls=""): return '<div class="pr %s"><span class="t">%s</span><span class="w">%s</span><span class="d">%s</span></div>' % (cls, e(t), what, e(d))

IDEAS = [
("Find what’s wrong", [
 ("list", "A “Fix these” list for the person and the period", "Every clock problem in one place — not hunted day by day. Each line says what’s wrong and offers the likely fix.",
  '<div class="card"><h5>Fix these · Mike · Oct 26 – Nov 8 <em>4</em></h5>'
  + fix("Thu 10/29 — still clocked in overnight", "the day clock ran 15:35 → 07:02 next day", [], [btn("Clock out 15:35", True), btn("Pick a time…")])
  + fix("Mon 10/26 — 2 punches outside the day clock", "07:01–07:03 before clock-in", [], [btn("Move clock-in to 07:01", True), btn("Trim the punch")], "info")
  + fix("Wed 10/28 — no lunch taken", "8:15 clocked, no lunch punch", [], [btn("Lunch 12:00–12:30", True), btn("Worked through lunch")], "info")
  + "</div>",
  [("top", "On top of the Day view", "a strip above the day, for the open day and the period"), ("tab", "Its own view: Fix", "a fifth view beside Day · Week · Timesheet · Shop"), ("days", "Only on the days list", "a mark on each day, as now, with the fix in the day"), ("skipit", "Skip", "")]),
 ("forgot", "Forgot to clock out — the end time from evidence", "Instead of a blank time box, Parsec offers the times it can prove: the last stop, the last note, the shift end, the last thing done on an RO.",
  bar(seg(7.05, 9.6, "j"), seg(9.6, 12, "j2"), seg(12.5, 14.9, "j"), seg(14.9, 18, "ov"), marks=mark(14.9, "last stop 14:52", "l") + mark(15.53, "shift end 15:30", "dash"))
  + fix("Clocked in since 07:03 yesterday", "pick when Mike really left", [("Last job stopped", "14:52"), ("Last note — “Torqued, road tested”", "15:08"), ("Shift end", "15:30"), ("Last on an RO — Picked up a part", "15:12")], [btn("Use 15:08", True), btn("15:30"), btn("Another time…")]),
  [("ask", "Offer the evidence times", "one tap, the reason is “Forgot to clock out”"), ("auto", "Clock out at shift end by itself", "next morning, marked for review"), ("both", "Both", "auto at shift end + the evidence to change it"), ("skipit", "Skip", "")]),
 ("missed", "Missed clock-in · punches outside the day clock", "A job started before clock-in, or after clock-out, quietly splits the day. Catch it when it happens.",
  bar(seg(7.0, 7.08, "j"), seg(7.1, 11.9, "j"), seg(12.4, 15.5, "j2"), marks=mark(7.1, "", "dash") + mark(7.0, "job 07:01 · clocked in 07:06", "bad"))
  + fix("Job started 5 min before clock-in", "Op 1 · 7156 · started 07:01", [], [btn("Clock-in at 07:01", True), btn("Job at 07:06"), btn("Leave it")], "info"),
  [("prompt", "Ask right away", "a toast at Start: “You’re not clocked in — clock in at 07:01?”"), ("list", "Only in the Fix these list", ""), ("auto", "Move the clock-in by itself", "and log it"), ("skipit", "Skip", "")]),
 ("overlap", "Overlapping punches — pick who keeps the time", "Phone and computer, or two jobs at once: show both and settle it in one move.",
  '<div class="ovl"><div class="o1"><b>7156 · Clutch</b><small>09:10 – 10:40</small></div><div class="o2"><b>2253 · Water pump</b><small>10:15 – 11:30</small></div><div class="oz"><span>25 min on both</span></div></div>'
  '<div class="ft">' + btn("Clutch ends 10:15", True) + btn("Water pump starts 10:40") + btn("Split the 25 min") + "</div>",
  [("pick", "Three buttons, as drawn", ""), ("split", "Always split it evenly", "no question"), ("skipit", "Skip", "")]),
]),
("Fix it fast", [
 ("tools", "Split · merge · fill the air", "The edits people actually need, right on the day bar.",
  bar(seg(7.1, 9.5, "j"), seg(9.5, 10.4, "air"), seg(10.4, 12, "j2"), seg(12.5, 15.4, "j"), marks=mark(9.5, "air 54 min", "teal"))
  + '<div class="tools"><span class="tl"><b>✂ Split</b><small>at a time — the second half to another job</small></span><span class="tl"><b>⇥⇤ Merge</b><small>two punches, same job, side by side</small></span><span class="tl"><b>▤ Fill the air</b><small>shop time · a job · unpaid break</small></span></div>',
  [("all", "All three", ""), ("fill", "Only Fill the air", "the most common one"), ("splitonly", "Only Split", ""), ("skipit", "Skip", "")]),
 ("keys", "Type times the fast way", "Keyboard-first editing — no fiddly time pickers.",
  '<div class="kt"><div><span class="in">715</span><em>→ 07:15</em></div><div><span class="in">3:45p</span><em>→ 15:45</em></div><div><span class="in">+10</span><em>→ 10 min later</em></div><div><span class="in">-5</span><em>→ 5 min earlier</em></div></div>'
  '<p class="mu2">With an edge picked: ' + kbd("←") + kbd("→") + ' 1 min · ' + kbd("Shift") + kbd("←") + ' 5 min · ' + kbd("Enter") + ' save · ' + kbd("Esc") + ' undo the drag</p>',
  [("both", "Typed shorthand + arrow nudges", ""), ("typed", "Only typed shorthand", ""), ("skipit", "Skip", "")]),
 ("crew", "Fix the whole crew at once (foreman, manager)", "Shop-wide events shouldn’t mean ten separate edits.",
  '<div class="card"><h5>Shop view · Thu 10/29 · 4 picked</h5>' + chk("Mike Rodriguez — still on") + chk("Dana Kowalski — still on") + chk("Luis Martinez — still on") + chk("Priya Shah — still on")
  + '<div class="ft"><small>For everyone picked</small>' + btn("Clock out at 15:30", True) + btn("Lunch 12:00–12:30") + btn("Safety meeting 07:00–07:30 → shop time") + "</div></div>",
  [("yes", "Pick people in the Shop view, then act", ""), ("events", "Only shop events (meeting, power out, training)", ""), ("skipit", "Skip", "")]),
]),
("Who fixes, and the record", [
 ("request", "Ask for a fix → foreman approves", "A tech without “Fix their own punches” asks; it lands in the foreman’s Needs action; the day shows it pending.",
  '<div class="cols2"><div class="card"><h5>Mike asks</h5><b>Clock out 15:08 on Thu 10/29</b><small class="mu2">Forgot to clock out · last note 15:08</small><div class="ft">' + btn("Send to Frank", True) + '</div></div>'
  '<div class="card"><h5>Frank · Needs action</h5>' + row("Mike", "Time fix · Thu 10/29", tag("pending", "wait"), "clock out 15:08 instead of still on") + '<div class="ft">' + btn("Approve", True) + btn("Change…") + btn("Decline") + "</div></div></div>",
  [("approve", "Request → approve", "for anyone without the fix permission"), ("everyone", "Everyone asks, nobody edits directly", "even techs who have the permission"), ("skipit", "Skip", "")]),
 ("audit", "Every change says why — and keeps the before", "A reason on each edit, the before and after on the row, and the edits counted on the timesheet.",
  prow("07:06 – 11:58", 'Op 1 · 7156 <span class="ed">edited</span>', "4:52") + prow("", '<span class="hist">was 07:06 – <s>still on</s> · Frank · “Forgot to clock out” · Thu 4:12 pm</span>', "", "h")
  + '<div class="rsn"><small>Why?</small>' + "".join('<span class="ch">%s</span>' % e(x) for x in ["Forgot to clock out", "Forgot to clock in", "Wrong job", "Worked through lunch", "Parsec was down", "Other…"]) + "</div>",
  [("must", "A reason on every change", "the list above, one tap"), ("opt", "A reason only when someone else’s time is changed", ""), ("skipit", "Skip", "")]),
 ("sign", "No signing with problems open", "The timesheet can’t be signed while there’s something to fix — it says what, with a link to each.",
  '<div class="card warn"><b>2 things to fix before you can sign</b><small>Thu 10/29 still clocked in · Wed 10/28 no lunch</small><div class="ft">' + btn("Fix them", True) + btn("Sign with a note…") + "</div></div>",
  [("block", "Block signing until fixed", ""), ("note", "Allow signing with a note", "the approver sees the note"), ("skipit", "Skip", "")]),
]),
("Stop it happening", [
 ("still", "“Still on the clock?” after the shift ends", "A nudge on whatever page you’re on, 20 minutes after your shift ends — not a surprise the next morning.",
  '<div class="nud"><b>Still on the clock, Mike?</b><small>Your shift ended at 15:30 · last activity 15:12</small><div class="ft">' + btn("Clock out at 15:12", True) + btn("Clock out now") + btn("I’m still here — 1 h") + "</div></div>",
  [("20", "20 min after shift end", ""), ("60", "60 min after shift end", ""), ("off", "Only at the end-of-day sign-out", "as now"), ("skipit", "Skip", "")]),
 ("check", "A clock-out check", "Clock out shows the day in one line and anything still open — a running job, no lunch, notes owed.",
  '<div class="card"><h5>Clock out · Mike · Thu</h5><div class="kp3"><span><b>8:02</b><small>clocked</small></span><span><b>7:10</b><small>on jobs</small></span><span><b>0:52</b><small>air</small></span></div>'
  + chk("Op 1 · 7156 is still running — stop it as Hold tech", False) + chk("Lunch 12:01–12:31") + chk("2 punches without a note", False) + '<div class="ft">' + btn("Fix and clock out", True) + btn("Clock out anyway") + "</div></div>",
  [("yes", "Show it at every clock-out", ""), ("issues", "Only when something’s open", ""), ("skipit", "Skip", "")]),
 ("lunch", "Lunch rule", "Most missed-lunch fixes are the same fix. Let the shop’s rule do it.",
  bar(seg(7.0, 12.0, "j"), seg(12.0, 12.5, "lu"), seg(12.5, 15.5, "j2"), marks=mark(12.0, "auto lunch 12:00–12:30", "dash")) + '<p class="mu2">No lunch punched after 6 h on the clock → 30 min taken off at 12:00, marked “auto lunch” — the tech can change it or say “worked through lunch”.</p>',
  [("auto", "Auto-deduct 30 min after 6 h", "a setting on the Manager page"), ("flag", "Just flag it in Fix these", ""), ("skipit", "Skip", "")]),
]),
("Payroll", [
 ("round", "Paid time vs clocked time", "If the shop rounds for pay, show both — the clock stays exact, the timesheet shows what’s paid.",
  '<div class="tbl2"><div class="h"><span>Day</span><span>In</span><span>Out</span><span>Clocked</span><span>Paid</span></div><div><span>Mon</span><span>07:03 → 07:00</span><span>15:27 → 15:30</span><span>7:54</span><span><b>8:00</b></span></div><div><span>Tue</span><span>07:06 → 07:00</span><span>15:43 → 15:45</span><span>8:07</span><span><b>8:15</b></span></div></div>',
  [("15", "Round to 15 min", ""), ("6", "Round to 6 min (tenths)", ""), ("none", "No rounding — exact", "as now"), ("skipit", "Skip", "")]),
 ("badge", "Match the shop’s time clock", "If the shop clocks in somewhere else too (a badge clock, the payroll system), load its export and let Parsec show where the two disagree.",
  '<div class="card"><h5>Badge clock export · Oct 26 – Nov 8 · loaded from your folder</h5>' + prow("Mon 10/26", "Badge 07:01 – 15:32 · Parsec 07:03 – 15:27", "−7 min") + prow("Thu 10/29", "Badge 06:58 – 15:31 · Parsec 07:06 – <b>still on</b>", "fix", "bad")
  + '<div class="ft"><small>A CSV from the time clock — read here, nothing leaves the computer</small>' + btn("Use the badge times", True) + btn("Keep Parsec’s") + "</div></div>",
  [("yes", "Yes — I can get a CSV export", "send a sample and I’ll match its columns"), ("no", "No other clock — Parsec is the clock", ""), ("skipit", "Skip", "")]),
]),
]

NEW14 = [("Drag an edge", "change a punch or the day clock by dragging, snap 1 or 5 min"), ("Edit in place", "click a time or a reason on the day’s rows; E edits, A adds"),
         ("Stop it earlier", "a running punch’s “now” is a button — type when it really stopped"), ("Move time", "a day or a range of days to another person (Manager › Team)"),
         ("Sign and approve", "the pay period: the tech signs, the foreman or manager approves, then it locks"), ("Lunch off the clock", "a punch stopped for Lunch ends the day clock until work picks up")]
