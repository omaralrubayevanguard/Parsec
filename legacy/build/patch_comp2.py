import json
s = open("make_components.py").read()
def rep(a, b):
    global s
    assert a in s, a[:80]; s = s.replace(a, b, 1)
rep("- Collapses to 56px (icons only) with the sidebar button or **[**.", "- Collapses to 56px (icons only) with the sidebar button or **[**.\n- While a clock runs, the clock-in card grows a second line: a breathing `accent` dot, the RO and operation, the running time and a stop button, with the job's name below. Tap it to jump to the job; it folds away when the clock stops — the desktop twin of the phone's ClockBar.")
rep("""f'<div style="height:760px;width:236px">{P.sidebar(wt=False)}</div>')""", """f'<div style="height:780px;width:236px">{P.sidebar(wt=False, running=True)}</div>')""")
add = r'''
# ---- round 4: the phone app and the desktop carry-overs ----
import os as _os
SNAPS = json.load(open(_os.path.join(B, "mobile/snaps.json")))
APPCSS = open(_os.path.join(B, "mobile/app.css")).read()
def _strip(h, lo, hi, segs, live=None, now=None, inband=None, axis=True, cls="px-day"):
    pos = lambda t: (t - lo) / (hi - lo) * 100
    inb = f'<span class="px-day__in" style="left:{pos(inband[0]):.2f}%;right:{100 - pos(inband[1]):.2f}%"></span>' if inband else ''
    sg = "".join(f'<i{" class=is-live" if live == k else ""} style="left:{pos(a):.2f}%;width:{pos(b) - pos(a):.2f}%"></i>' for k, (a, b) in enumerate(segs))
    nw = f'<b style="left:{pos(now):.2f}%"></b>' if now else ''
    ax = ('<div class="px-day__axis">' + "".join(f'<span style="left:{pos(t):.2f}%">{l}</span>' for t, l in [(7, "7a"), (9, "9a"), (11, "11a"), (13, "1p"), (15, "3p")]) + '</div>') if axis else ''
    return f'<div class="{cls}">{inb}{sg}{nw}</div>{ax}'
WEEK = [("Mon", "Oct 19", [(7.5, 11.08), (12.17, 13.68), (13.9, 15.2)], "6.32", "118"), ("Tue", "Oct 20", [(7.5, 8.7), (8.85, 10.4), (10.6, 12), (12.5, 15.1)], "6.95", "104"),
        ("Wed", "Oct 21", [(7.4, 9.9), (10.2, 11.9), (12.6, 14.8)], "6.30", "96"), ("Thu", "Oct 22", [(7.5, 8.7), (8.85, 9.6), (9.7, 10.25)], "2.50", "112")]
week = "".join(f'<div class="px-week__d"><b>{d}</b>{dt}</div><div>{_strip(None, 7, 15.5, sg, live=(len(sg) - 1 if d == "Thu" else None), now=(10.25 if d == "Thu" else None), inband=((6.97, 10.25) if d == "Thu" else (6.97, 15.4)), axis=False)}</div><div class="px-week__n">{h}<small>on jobs</small></div><div class="px-week__n">{e}%<small>eff.</small></div>' for d, dt, sg, h, e in WEEK)
C["DayStrip"] = ("Data", 330, "", """# DayStrip

A day of clocked time as one bar: each segment is a stretch on a job, gaps are time on the clock but not on a job, and a thin `ink` line marks now. The running segment is the view's `accent`; finished ones are `ink-2`; the clocked-in span is a `selected` band behind them.

- **Phone, Today:** in the shift card with the clock-in state above it and On jobs · Off jobs · Efficiency below. The window runs 7a–3:30p and widens to fit an early start or a late finish.
- **Desktop, Time log:** one row per day — day and date, the strip, hours on jobs, efficiency. It shows at a glance where the day went and where an EOD correction is needed.
- Segments are 4px-radius bars inset 5px (4px in the week rows) on a `fill` track, `radius-md` corners; axis labels in 11px `ink-3`, every two hours. A segment's tooltip names the RO, the operation and the times.

Provide: the day's time entries (start, stop, job), the clock-in span, and now.""", f\'\'\'<div class="px-demo col" style="gap:28px;align-items:stretch;max-width:760px">
  <div style="max-width:380px"><div class="px-week__h" style="margin-bottom:10px">Today</div>{_strip(None, 7, 15.5, [(7.5, 8.7), (8.85, 9.6), (9.7, 10.25)], live=2, now=10.25, inband=(6.97, 10.25))}</div>
  <div><div class="px-week__h" style="margin-bottom:10px">Time log · this week</div><div class="px-week">{week}</div></div>
</div>\'\'\')

CBAR_CSS = "\n".join(l for l in APPCSS.split("\n") if l.startswith(".pm-cbar"))
cbar = SNAPS["today"].split('<div class="pm-cbar"', 1)[1].split('<nav class="pm-tabs">', 1)[0]
C["ClockBar"] = ("Feedback", 230, "", """# ClockBar

The running clock follows the technician everywhere. One job runs at a time; wherever you are, its time is one glance away and stop is one tap away.

- **Phone:** a 56px `primary` bar (ink in Ivory, ivory in Graphite) floating 12px in from the edges just above the tab bar on every screen except the job itself: breathing champagne dot, RO · operation · what you're doing in 11.5px, the job in 14px, the running time in tabular figures, and a round stop button. Tap the bar to open the job; stop opens the stop sheet (Waiting – Parts … Complete, Lunch, End of day).
- **Desktop:** the same information as a second line in the sidebar's clock-in card (see Sidebar).
- It rises in from the bottom in 240ms when a clock starts and leaves when it stops. Its time is the operation's total burnt time, not just this stretch — the same number as the TimeCard.

Provide: the running entry (RO, operation, reason, start) and a stop handler.""", f\'\'\'<style>{CBAR_CSS}</style><div class="px-demo col" style="gap:24px;align-items:flex-start">
  <div style="width:390px;background:var(--panel);padding:12px 0;border-radius:16px;box-shadow:inset 0 0 0 1px var(--hairline)"><div class="pm-cbar" style="animation:none"{cbar}</div>
  <div style="width:236px">{P.sidebar(wt=False, running=True).split('<div class="px-clockin"', 1)[1].join(['<div class="px-clockin"', '']) if False else ''}</div>
</div>\'\'\')

def _phone(cap, html):
    return f'<figure class="phf"><figcaption>{cap}</figcaption><div class="ph">{html}</div></figure>'
PHONE_CSS = APPCSS.replace("html, body {", ".ph-unused {").replace("body {", ".ph-unused2 {") + """
.phs{display:flex;flex-wrap:wrap;gap:40px 36px;justify-content:center;padding:32px 24px;background:var(--canvas)}
.phf{margin:0;display:flex;flex-direction:column;align-items:center;gap:12px}
.phf figcaption{font:500 13px/18px var(--font-sans);color:var(--ink-2)}
.ph{position:relative;width:390px;height:844px;border-radius:46px;overflow:hidden;background:var(--panel);color:var(--ink);font-family:var(--font-sans);box-shadow:0 0 0 8px #1b1a18,0 0 0 9px #44413c,0 30px 60px -30px rgba(0,0,0,.4)}
.ph .app{height:100%}.ph .view{padding-top:46px}.ph .view.is-enter .wrap{animation:none}.ph .pm-sheet,.ph .pm-sheet__p,.ph .pm-cbar{animation:none}
"""
C["PhoneApp"] = ("Patterns", 1860, " width=1440", """# PhoneApp

Parsec Mobile — the technician's phone app, built from the same tokens and components as the desktop. One HTML file that works with no signal; ROs come from Parsec on the computer and changes go back to it by QR codes.

**Screens.** A four-tab bar — Today · ROs · Sync · Me — with a count on Sync for changes waiting to go. **Today** lists your operations across every RO (Ready to work, then Waiting) under a shift card with the DayStrip. **RO** is the desktop RO page in one column: eyebrow, serif customer, status, the Time · Parts · Files tiles (each opens a sheet), the stage line (seven ticks), the NextStep card, operations, details. **Operation** is where the work happens: the TimeCard at phone size, Parts · Time · Notes · Files tabs, and an action bar — Photo, Note (hold to dictate), Start / Stop clock.

**Moves.** The ClockBar follows you. Swipe a job or operation left to start its clock, a part left to mark it Received; long-press a row for its full menu. Menus and dialogs become bottom sheets: 52px rows, a grab handle, swipe down or tap outside to close. Stopping the clock asks why, in one tap. Photos go straight into the operation's Files (or the RO's Dash photo / DTC / Picture), shrunk to 1600px on capture, and tick the matching close-out step. Dictated notes get the date and time stamp, like Enter on the desktop. Every change shows a Toast with Undo.

**Rules.** Text 15px (17.5px in **Bay mode**, which also makes targets 54px+ and labels `ink-2` — for gloves and bright bays); inputs 16px so the phone never zooms; targets at least 44px; safe areas respected; tabular figures for every number. Theme follows the phone's dark mode unless set in Me. One accent per screen: the running clock, the current stage, or the one action the Next card asks for.

**Sync.** Same QR loop as the desktop (TQ1 frames). Send to computer shows the codes with a progress ring and keeps the screen awake; Get from computer reads the computer's codes, and the computer's reply confirms what it took. Changes stay on the phone, marked Sent / Not taken, until confirmed. Photos travel separately (share to the RO folder).

Provide: the ROs from the computer (Phone sync → Send to phone).""", f\'\'\'<style>{PHONE_CSS}</style><div class="phs">{_phone("Today", SNAPS["today"])}{_phone("RO", SNAPS["ro"])}{_phone("Operation", SNAPS["op"])}{_phone("Part status sheet", SNAPS["sheet"])}{_phone("Sync — send to computer", SNAPS["sync"])}{_phone("Today in Bay mode", SNAPS["bay"])}</div>\'\'\')
'''
rep("\ndef build():", add + "\ndef build():")
open("make_components.py", "w").write(s)
print("ok")
