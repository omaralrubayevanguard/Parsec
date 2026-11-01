# Parsec Mobile — technician-first phone mock-up on the Parsec design system.
import os, sys, json, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parts as P
from parts import ic, si, psi, PART_STATUSES
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]

# new icons, same grid / stroke as the Parsec set
P.ICONS.update({
 "today": '<rect x="4" y="5" width="16" height="15" rx="2.75"/><path d="M4 9.75h16M8.5 3v4M15.5 3v4"/><circle cx="12" cy="14.75" r="1.25"/>',
 "camera": '<path d="M4.75 8.5A1.75 1.75 0 0 1 6.5 6.75h1.75l1.5-2h4.5l1.5 2h1.75a1.75 1.75 0 0 1 1.75 1.75v9a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75z"/><circle cx="12" cy="12.75" r="3.4"/>',
 "mic": '<rect x="9" y="3.75" width="6" height="10.5" rx="3"/><path d="M5.75 11a6.25 6.25 0 0 0 12.5 0M12 17.25v3"/>',
 "sync": '<path d="M4 7.5h3.5M4 4v3.5M4.75 7.5A8 8 0 0 1 19.6 9.5M20 16.5h-3.5M20 20v-3.5M19.25 16.5A8 8 0 0 1 4.4 14.5"/>',
 "chevL": '<path d="M14.5 6.5L9 12l5.5 5.5"/>',
 "scan": '<path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5M7.5 12h9"/>',
})
SB = ('<svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>'
      '<svg viewBox="0 0 16 12" width="16" height="12"><path d="M8 11.5l2.4-2.9a3.6 3.6 0 0 0-4.8 0zM3.3 6.3a7 7 0 0 1 9.4 0l1.5-1.8a9.4 9.4 0 0 0-12.4 0zM.4 2.8a11.6 11.6 0 0 1 15.2 0" /></svg>'
      '<svg viewBox="0 0 27 12" width="27" height="12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="2"/><rect x="24.6" y="4" width="1.6" height="4" rx=".8" opacity=".4"/></svg>')

def n(x): return f' data-n="{x}"' if x else ''
def statusbar(): return f'<div class="pm-sb"><b>9:41</b><span class="pm-sb__r">{SB}</span></div><div class="pm-island"></div>'
def tabbar(on):
    t = [("today","Today","today"),("ros","ROs","ros"),("sync","Sync","sync"),("me","Me","user")]
    return '<nav class="pm-tabs">' + "".join(f'<button class="pm-tab{" is-on" if k==on else ""}">{ic(i)}<span>{l}</span></button>' for k, l, i in t) + '</nav>'
def clockbar(mark=0):
    return (f'<div class="pm-cbar" data-cbar{n(mark)}><span class="pm-cbar__dot"></span><div class="pm-cbar__t"><small data-cbar-ro>RO-37538 · Operation 1</small><b data-cbar-job>Clutch slipping – replace clutch</b></div>'
            f'<span class="pm-cbar__v" data-clock-mini>6:15:57</span><button class="pm-cbar__stop" data-stop title="Stop clock">{ic("stop")}</button></div>')
def phone(key, cap, num, inner):
    return f'<figure class="pm-dev"><figcaption><span class="pm-cap__n">{num}</span>{cap}</figcaption><div class="pm-phone"><div class="pm-screen" data-screen="{key}">{inner}</div></div></figure>'

# ---------- 1 · Today ----------
SESS = [(7.5, 8.7, "RO-37538 · Operation 1 · 1:12", False), (8.85, 9.6, "RO-34601 · Operation 2 · 0:45", False), (9.7, 10.25, "RO-37538 · Operation 1 · running", True)]
pos = lambda h: (h - 7) / 8.5 * 100
segs = "".join(f'<i class="{"is-live" if live else ""}" title="{t}" style="left:{pos(a):.2f}%;width:{pos(b)-pos(a):.2f}%"{" data-liveseg" if live else ""}></i>' for a, b, t, live in SESS)
axis = "".join(f'<span style="left:{pos(h):.2f}%">{lbl}</span>' for h, lbl in [(7,"7a"),(9,"9a"),(11,"11a"),(13,"1p"),(15,"3p")])
JOBS = [
 ("37538-1", "RO-37538", "Blue Ridge Haulage", "Clutch slipping – replace clutch", "OP", 78, "6.27", "8.00", "working", True),
 ("37538-3", "RO-37538", "Blue Ridge Haulage", "PM service – A", "PM", 0, "0.00", "1.50", "hold", False),
 ("35112-1", "RO-35112", "Piedmont Aggregates", "Air leak at the front axle", "DIAG", 35, "0.42", "1.20", "hold", False),
]
def job(j):
    jid, ro, cust, t, typ, pct, b, q, s, live = j
    bb = f'<span data-b1>{b}</span>' if jid == "37538-1" else b
    return (f'<div class="pm-job" data-job="{jid}" data-ro="{ro}" data-t="{t}"><div class="pm-job__main"><div class="pm-job__meta">{si(s)}<span class="px-id">{ro}</span><span>{cust}</span></div>'
            f'<div class="pm-job__t">{t}</div><div class="pm-job__time"><span class="px-mini"><i style="width:{pct}%"></i></span><span>{bb} <em>/ {q} h</em></span><span class="px-tag" data-t="{typ}">{typ}</span></div></div>'
            f'<button class="pm-play{" is-live" if live else ""}" data-play="{jid}" title="Start clock">{ic("stop" if live else "play")}</button></div>')
wait_row = (f'<div class="pm-job is-wait"><div class="pm-job__main"><div class="pm-job__meta">{si("parts", color="problem")}<span class="px-id">RO-34601</span><span>Carolina Line Freight</span></div>'
            f'<div class="pm-job__t">DPF differential pressure high</div><div class="pm-job__time"><span>Waiting – Parts · Backordered</span><span>· due Fri</span></div></div></div>')
today = f'''{statusbar()}
<div class="pm-body">
  <header class="pm-hero"><div class="pm-eyebrow">Thursday, Oct 22</div><div class="pm-hero__row"><h1 class="pm-title">Today</h1><span class="px-av px-av--md px-av--me">MR</span></div></header>
  <section class="pm-card pm-shift"{n(2)}>
    <div class="pm-shift__top"><span class="pm-dot"></span><div>On the clock<small>since 6:58 · 3.28 h</small></div><button class="px-btn px-btn--sm">Clock out</button></div>
    <div class="pm-day">{segs}<b style="left:{pos(10.25):.2f}%"></b></div>
    <div class="pm-day__axis">{axis}</div>
    <div class="px-tsum pm-tsum3"><div><span>On jobs</span><b>2.50<small>h</small></b></div><div><span>Off jobs</span><b>0.78<small>h</small></b></div><div><span>Efficiency</span><b class="px-good">112<small>%</small></b></div></div>
  </section>
  <div class="pm-h"><h2>Ready to work</h2><span>3</span></div>
  <div class="pm-list"{n(3)}>{"".join(job(j) for j in JOBS)}</div>
  <div class="pm-h"><h2>Waiting</h2><span>1</span></div>
  <div class="pm-list">{wait_row}</div>
</div>
{clockbar(1)}{tabbar("today")}'''

# ---------- 2 · RO ----------
STAGES = [("Check-in","done"),("Diag","skip"),("Approval","wait"),("Parts","done"),("Repair","now"),("Road test",""),("Close-out","")]
ticks = "".join(f'<i class="{"is-"+s if s else ""}" title="{l}"></i>' for l, s in STAGES)
OPS = [(1,"Clutch slipping – replace clutch","OP","working","6.27","8.00",78,""),(2,"Wheel seal leaking","OP","customer","0.00","2.40",0,"Waiting on approval"),(3,"PM service – A","PM","hold","0.00","1.50",0,"")]
def oprow(o, swiped=False):
    num, t, typ, s, b, q, pct, meta = o
    bb = f'<span data-b1>{b}</span>' if num == 1 else b
    m = f'<span class="pm-op__m">{meta}</span>' if meta else ''
    row = (f'<div class="pm-op" data-oprow="{num}">{si(s)}<div class="pm-op__main"><div class="pm-op__t"><span class="pm-op__n">{num}</span>{t}</div>'
           f'<div class="pm-op__sub"><span class="px-tag" data-t="{typ}">{typ}</span><span class="px-mini"><i style="width:{pct}%"></i></span><span>{bb} <em>/ {q} h</em></span>{m}</div></div>{ic("chevR","px-ico pm-op__go")}</div>')
    if swiped:
        return f'<div class="pm-swipe is-open"{n(11)}><div class="pm-swipe__act">{ic("play")}<span>Start clock</span></div>{row}</div>'
    return row
ro = f'''{statusbar()}
<div class="pm-body">
  <nav class="pm-nav"><button class="pm-back">{ic("chevL")}Today</button><span class="pm-nav__acts"><button class="px-btn px-btn--ghost px-btn--icon" title="Search">{ic("search")}</button><button class="px-btn px-btn--ghost px-btn--icon" title="Options">{ic("more")}</button></span></nav>
  <div class="pm-eyebrow"><span class="px-id">RO-37538</span><span>·</span><span>15 days open</span></div>
  <h1 class="pm-title">Blue Ridge Haulage</h1>
  <div class="pm-sub">2020 Volvo VNL · Unit 4417 · Lot D5</div>
  <div class="pm-ro__status"><button class="px-status--button" data-rostatus>{si("working")}<span data-rostatus-name>Working</span><span class="px-status__sub" data-rostatus-sub>· Repairing</span>{ic("chevD","px-ico px-chev")}</button><span class="px-with">with <span class="px-av">MR</span> you</span></div>
  <div class="pm-totals"{n(5)}>
    <button class="pm-tot" data-sheet="time"><span>{ic("clock")}Time</span><b><span data-b1>6.27</span><em>/ 11.90 h</em></b></button>
    <button class="pm-tot" data-sheet="parts"><span>{ic("parts")}Parts</span><b><span data-inhand>3</span><em>/ <span data-nparts>5</span></em></b></button>
    <button class="pm-tot" data-sheet="files"><span>{ic("clip")}Files</span><b>6</b></button>
  </div>
  <div class="pm-stage"{n(4)}><div class="pm-stage__top"><b>Repair</b><span>· stage 5 of 7</span><span class="r">Ready Thu 10:04</span></div><div class="pm-ticks">{ticks}</div></div>
  <div class="px-next pm-next"><div class="px-next__head"><span class="px-next__k">Next</span><span class="px-next__for">Operation 2 · Wheel seal</span></div><div class="px-next__body"><p class="px-next__t">Waiting on customer approval for operation 2 — keep going on operation 1.</p><div class="px-next__acts"><button class="px-btn px-btn--sm">Remind Dana</button></div></div></div>
  <div class="pm-h"><h2>Operations</h2><span>3</span></div>
  <div class="pm-list">{oprow(OPS[0])}{oprow(OPS[1])}{oprow(OPS[2], swiped=True)}</div>
  <div class="pm-h"><h2>Details</h2></div>
  <div class="pm-props">
    <button class="pm-prop"><span>Vehicle</span><b>VIN …891160 · 616,000 mi</b>{ic("chevR")}</button>
    <button class="pm-prop"><span>People</span><b>Dana Kowalski, advisor</b>{ic("chevR")}</button>
    <button class="pm-prop"><span>Key tag</span><b class="px-id">112 · Board B</b>{ic("chevR")}</button>
    <button class="pm-prop"><span>Paperwork</span><b>Opened Oct 6 · no case</b>{ic("chevR")}</button>
  </div>
</div>
<div class="pm-sheetwrap" data-sheetwrap hidden></div>
{clockbar()}{tabbar("ros")}'''

# ---------- 3 · Operation (and 4 · its part sheet) ----------
PARTS1 = [("1-1","Clutch kit, 15.5 in","85136213","1","received"),("1-2","Clutch release bearing","21515427","1","installed")]
def pill(pid, k, live=True):
    return f'<button class="pm-pill" data-pp="{pid}" data-k="{k}">{psi(k)}<span>{P.pname(k)}</span>{ic("chevD","px-ico px-chev")}</button>'
def part_sheet(pid="1-1", cur="received", static=False):
    d = dict((p[0], p) for p in PARTS1)[pid]
    rows = "".join(f'<button class="pm-srow{" is-on" if k==cur else ""}" data-set="{k}">{psi(k)}<span>{nm}</span>{ic("check","px-ico pm-srow__tick")}</button>' for k, nm, *_ in PART_STATUSES)
    return (f'<div class="pm-sheet{" is-static" if static else ""}" data-sheet-el><div class="pm-sheet__p"><div class="pm-sheet__grab"></div>'
            f'<div class="pm-sheet__h"{n(7) if static else ""}><h3 data-sheet-title>{d[1]}</h3><p><span class="px-id">{d[2]}</span> · Qty {d[3]} · Operation 1</p></div>{rows}'
            f'<div class="pm-ssep"></div><button class="pm-srow">{ic("copy")}<span>Copy part number</span></button><button class="pm-srow">{ic("swap")}<span>Move to operation…</span></button>'
            f'<button class="pm-srow pm-srow--danger">{ic("trash")}<span>Remove part</span></button></div></div>')
def op_screen(key, sheet=False):
    mk = (lambda x: n(x)) if key == "op" else (lambda x: "")
    parts = "".join(f'<div class="pm-part"><div><b>{d}</b><small><span class="px-id">{pn}</span> · Qty {q}</small></div>{pill(pid, k)}</div>' for pid, d, pn, q, k in PARTS1)
    times = "".join(f'<div class="pm-trow"><div><b>{d}</b><small>{t} · Repairing</small></div><span>{du}</span></div>' for d, t, du in [("Mon, Oct 19","7:32 – 11:05","3:33"),("Mon, Oct 19","12:10 – 13:41","1:31"),("Tue, Oct 20","7:30 – 8:42","1:12")])
    files = "".join(f'<div class="pm-file" style="--h:{h}"><span>{nm}</span></div>' for nm, h in [("flywheel-scoring.jpg", 28), ("clutch-disc.jpg", 34)]) + f'<button class="pm-file pm-file--add">{ic("camera")}<span>Add photo</span></button>'
    return f'''{statusbar()}
<div class="pm-body">
  <nav class="pm-nav"><button class="pm-back">{ic("chevL")}RO-37538</button><span class="pm-nav__t">Operation 1 of 3</span><span class="pm-nav__acts"><button class="px-btn px-btn--ghost px-btn--icon" title="Options">{ic("more")}</button></span></nav>
  <div class="pm-optitle"><span class="px-tag" data-t="OP">OP</span><h1>Clutch slipping – replace clutch</h1></div>
  <div class="pm-clock is-live" data-clockcard>
    <div class="pm-clock__v" data-clock>6:15:57</div>
    <div class="pm-clock__cap"><span class="pm-cbar__dot"></span><span data-clockcap>Clock running · Repairing</span></div>
    <div class="px-bar"><div class="px-bar__fill" data-bar style="width:78.4%"></div><div class="px-bar__q" style="left:calc(100% - 2px)"></div></div>
    <div class="px-time__stats"><div><span>Quoted</span><b>8.00<small>h</small></b></div><div><span>Burnt</span><b><span data-b1>6.27</span><small>h</small></b></div><div><span>Left</span><b><span data-left>1.73</span><small>h</small></b></div><div><span>Efficiency</span><b class="px-good"><span data-eff>128</span><small>%</small></b></div></div>
  </div>
  <div class="px-seg px-seg--fill pm-seg" role="tablist"><button class="is-on" data-ptab="parts">Parts <span class="n" data-pcount>2/2</span></button><button data-ptab="time">Time <span class="n">3</span></button><button data-ptab="notes">Notes</button><button data-ptab="files">Files <span class="n">2</span></button></div>
  <div data-ppane="parts">{parts}<button class="pm-addrow">{ic("plus")}Add part</button></div>
  <div data-ppane="time" hidden>{times}<button class="pm-addrow">{ic("plus")}Add time entry</button></div>
  <div data-ppane="notes" hidden><textarea class="px-input pm-notes" rows="5">Removed transmission. Clutch disc worn to the rivets, flywheel scored — resurfaced. Installing new clutch kit. (Oct 20 · 8:40)</textarea><p class="pm-hint">{ic("mic")}Hold Note to dictate — the date and time stamp is added when you let go.</p></div>
  <div data-ppane="files" hidden><div class="pm-files">{files}</div></div>
</div>
<div class="pm-toastwrap" data-ptoast></div>
<div class="pm-actbar">
  <button class="pm-act"{mk(8)}>{ic("camera")}<span>Photo</span></button>
  <button class="pm-act"{mk(9)}>{ic("mic")}<span>Note</span></button>
  <button class="pm-go is-live" data-go{mk(6)}>{ic("stop")}<span data-go-l>Stop clock</span></button>
</div>
{part_sheet(static=True) if sheet else ""}'''

# ---------- 5 · Sync ----------
def qr_svg(seed):
    N = 29; rnd = random.Random(seed); m = [[rnd.random() < .47 for _ in range(N)] for _ in range(N)]
    def finder(r0, c0):
        for r in range(-1, 8):
            for c in range(-1, 8):
                rr, cc = r0 + r, c0 + c
                if 0 <= rr < N and 0 <= cc < N:
                    m[rr][cc] = (0 <= r <= 6 and 0 <= c <= 6) and (r in (0, 6) or c in (0, 6) or (2 <= r <= 4 and 2 <= c <= 4))
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0)
    for i in range(8, N - 8): m[6][i] = m[i][6] = i % 2 == 0
    d = "".join(f"M{c} {r}h1v1h-1z" for r in range(N) for c in range(N) if m[r][c])
    return f'<svg class="pm-qr__code" viewBox="-2 -2 {N+4} {N+4}" data-qr="{seed}"><rect x="-2" y="-2" width="{N+4}" height="{N+4}" fill="#fff"/><path d="{d}" fill="#111"/></svg>'
QRS = [qr_svg(s) for s in (11, 27, 53)]
sync = f'''{statusbar()}
<div class="pm-body">
  <header class="pm-hero"><div class="pm-eyebrow">No network needed</div><div class="pm-hero__row"><h1 class="pm-title">Sync</h1></div></header>
  <div class="px-seg px-seg--fill pm-seg" style="margin-top:16px"><button class="is-on" data-sync="send">Send to computer</button><button data-sync="get">Get from computer</button></div>
  <div data-syncpane="send">
    <div class="pm-qr"{n(10)}>
      <svg class="pm-qr__ring" viewBox="0 0 264 264"><circle cx="132" cy="132" r="126" /><circle class="p" cx="132" cy="132" r="126" data-ring style="stroke-dasharray:791.7;stroke-dashoffset:{791.7*(1-7/18):.1f}"/></svg>
      <div class="pm-qr__box" data-qrbox>{QRS[0]}</div>
    </div>
    <div class="pm-qr__cap"><b data-qrn>Code 7 of 18</b><span>Hold the phone up to the computer’s webcam. The screen stays awake until it’s done.</span></div>
  </div>
  <div data-syncpane="get" hidden>
    <div class="pm-cam"><i></i><i></i><i></i><i></i><span>Point the camera at the codes on the computer screen</span></div>
  </div>
  <div class="pm-card pm-sync">
    <div class="pm-sync__h">What’s going</div>
    <div class="pm-sync__r"><span>ROs</span><b>3</b></div>
    <div class="pm-sync__r"><span>Time entries</span><b>14</b></div>
    <div class="pm-sync__r"><span>Part changes</span><b>2</b></div>
    <div class="pm-sync__r"><span>Notes</span><b>3</b></div>
    <div class="pm-sync__f">Last synced 7:12 this morning · photos go to the RO folder separately</div>
  </div>
</div>
{clockbar()}{tabbar("sync")}'''

screens = (phone("today", "Today — your jobs, your day", 1, today) + phone("ro", "RO — the same page, one column", 2, ro) +
           phone("op", "Operation — where the work happens", 3, op_screen("op")) + phone("opsheet", "Part status — a bottom sheet", 4, op_screen("opsheet", sheet=True)) +
           phone("sync", "Sync — QR codes, no network", 5, sync))

NOTES = [
 ("Visualization", [
  (1, "Running clock bar", "Follows you on every screen. Tap it to go back to the job; stop without hunting."),
  (2, "Day strip", "Today's clocked time as segments per job; gaps are time not on a job. Feeds EOD."),
  (3, "Jobs, not ROs", "Today lists your operations across every RO — ready vs waiting — with play on each row."),
  (4, "Stage in one line", "Seven ticks and the current stage instead of the labelled track."),
  (5, "Totals as tiles", "Time · Parts · Files, same as the desktop header; each opens a bottom sheet."),
 ]),
 ("Efficiency", [
  (6, "Thumb zone", "Start / stop clock sits bottom right — one thumb, no reaching."),
  (7, "Bottom sheets", "Replace menus and modals: 52px rows, tap outside or swipe down to close."),
  (8, "Camera first", "Photos land in the operation's Files and the Dash pic / DTC bulletins, shrunk on capture."),
  (9, "Voice notes", "Hold Note to dictate work performed; the time stamp is added like Enter does today."),
  (10, "QR sync, upgraded", "Progress ring, what's going, last synced; works with no network, like today."),
  (11, "Swipe actions", "Swipe an operation to start its clock, a part to mark it Received; long-press for the full menu."),
 ]),
 ("Styling", [
  (0, "Bay mode", "Bigger type and targets, stronger labels — for gloves and bright bays. Try the toggle."),
  (0, "Phone rules", "16px inputs (no zoom on focus), safe areas, 44px+ targets, tabular numbers, same tokens."),
  (0, "Follows the phone", "Ivory by day, Graphite when the phone is in dark mode; status colours never change."),
 ]),
 ("Back on the desktop", [
  (0, "Day strip on Time log", "The same strip, one row per day — EOD and corrections at a glance."),
  (0, "Running job in the sidebar", "The clock-in card shows the job that's running and stops it."),
 ]),
]
notes_html = "".join(f'<section class="wt-g"><h3>{g}</h3><ol>' + "".join(
    f'<li><span class="wt-n{" is-plain" if not k else ""}">{k or "·"}</span><div><b>{t}</b><p>{d}</p></div></li>' for k, t, d in items) + '</ol></section>' for g, items in NOTES)

CSS = r'''
html,body{margin:0;background:var(--canvas)}
body{font-family:var(--font-sans);color:var(--ink);-webkit-font-smoothing:antialiased}
.wt-bar{position:sticky;top:0;z-index:80;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:12px 20px;background:var(--canvas);box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-bar h1{margin:0;font:500 20px/26px var(--font-serif);letter-spacing:-.01em;margin-right:auto;display:flex;align-items:center;gap:10px}
.wt-bar h1 svg{width:20px;height:20px}.wt-bar h1 svg circle{fill:var(--ink)}.wt-bar h1 svg .o{fill:var(--ink-3)}.wt-bar h1 svg .c{fill:#22c55e}
.wt-bar label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-2);cursor:pointer;user-select:none}
.pm-board{display:flex;flex-wrap:wrap;gap:48px 44px;justify-content:center;padding:36px 24px 16px}
.wt-notes{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px 40px;padding:24px 32px 56px;max-width:1440px;margin:0 auto}
.wt-g h3{margin:0 0 4px;font:600 13px/20px var(--font-sans);color:var(--ink-3)}
.wt-g ol{list-style:none;margin:0;padding:0}
.wt-g li{display:flex;gap:12px;padding:11px 0;box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-g b{font-size:14px;font-weight:600}.wt-g p{margin:2px 0 0;font-size:13px;line-height:19px;color:var(--ink-2)}
.wt-n,.wt [data-n]::after{width:22px;height:22px;border-radius:999px;display:grid;place-items:center;flex:none;background:var(--accent);color:var(--on-accent);font:600 12px/1 var(--font-sans)}
.wt-n.is-plain{background:var(--fill);color:var(--ink-3)}
.wt [data-n]{position:relative}
.wt [data-n]::after{content:attr(data-n);position:absolute;top:-9px;right:-6px;z-index:25;box-shadow:0 0 0 3px var(--panel)}
.wt .pm-screen [data-n]::after{width:18px;height:18px;font-size:11px;top:-8px;right:-5px}
.wt .pm-screen .pm-stage[data-n]::after{right:auto;left:-19px;top:0}

/* ---------- phone frame ---------- */
.pm-dev{margin:0;display:flex;flex-direction:column;gap:16px;align-items:center}
.pm-dev figcaption{display:flex;align-items:center;gap:8px;font:500 14px/20px var(--font-sans);color:var(--ink-2)}
.pm-cap__n{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;background:var(--fill);color:var(--ink-3);font-size:12px;font-weight:600}
.pm-phone{position:relative;width:390px;height:844px;border-radius:54px;background:var(--panel);box-shadow:0 0 0 9px #1b1a18,0 0 0 10px #44413c,0 40px 70px -30px rgba(0,0,0,.45);overflow:hidden;flex:none;isolation:isolate}
.pm-screen{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--panel);
  --pm-row:56px;--pm-tap:40px;--pm-body:15px;--pm-small:12.5px;--pm-lab:var(--ink-3)}
.is-bay .pm-screen{--pm-row:66px;--pm-tap:52px;--pm-body:17px;--pm-small:14px;--pm-lab:var(--ink-2)}
.pm-island{position:absolute;top:11px;left:50%;width:122px;height:35px;margin-left:-61px;border-radius:20px;background:#000;z-index:60}
.pm-sb{height:54px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:4px 32px 0 40px;font:600 16px/1 var(--font-sans);color:var(--ink)}
.pm-sb__r{display:flex;gap:6px;align-items:center}.pm-sb__r svg{fill:currentColor}
.pm-body{flex:1;min-height:0;overflow-y:auto;scrollbar-width:none;padding:4px 20px 28px;font-size:var(--pm-body)}
.pm-body::-webkit-scrollbar{display:none}
.pm-hero{padding-top:8px}
.pm-eyebrow{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--pm-lab)}
.pm-eyebrow .px-id{color:var(--ink-2)}
.pm-hero__row{display:flex;align-items:center;justify-content:space-between}
.pm-title{margin:2px 0 0;font:500 30px/36px var(--font-serif);letter-spacing:-.015em;font-variation-settings:"opsz" 36;color:var(--ink)}
.is-bay .pm-title{font-size:32px;line-height:38px}
.pm-sub{margin-top:4px;font-size:14px;color:var(--ink-2)}
.pm-card{margin-top:20px;background:var(--raised);border-radius:18px;box-shadow:inset 0 0 0 1px var(--hairline);padding:16px}
.pm-h{display:flex;align-items:baseline;gap:8px;margin:28px 0 2px}
.pm-h h2{margin:0;font:600 17px/24px var(--font-sans);letter-spacing:-.01em}
.pm-h span{font-size:13px;color:var(--ink-3)}
.pm-list{display:flex;flex-direction:column}

/* today */
.pm-shift__top{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:500}
.pm-shift__top small{display:block;font-size:var(--pm-small);font-weight:400;color:var(--pm-lab)}
.pm-shift__top .px-btn{margin-left:auto}
.pm-dot{width:8px;height:8px;border-radius:50%;background:var(--good);flex:none}
.pm-day{position:relative;height:30px;margin-top:16px;border-radius:8px;background:var(--fill)}
.pm-day i{position:absolute;top:5px;bottom:5px;border-radius:4px;background:var(--ink-2);min-width:4px}
.pm-day i.is-live{background:var(--accent)}
.pm-day b{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;border-radius:1px;background:var(--ink)}
.pm-day__axis{position:relative;height:16px;margin-top:6px;font-size:11px;color:var(--ink-3)}
.pm-day__axis span{position:absolute;transform:translateX(-2px)}
.pm-tsum3{grid-template-columns:repeat(3,1fr);margin-top:14px;padding-top:14px;box-shadow:inset 0 1px 0 var(--hairline)}
.pm-tsum3 b{font-size:19px}
.pm-job{display:flex;align-items:center;gap:12px;min-height:var(--pm-row);padding:12px 0;box-shadow:inset 0 -1px 0 var(--hairline)}
.pm-job:last-child{box-shadow:none}
.pm-job__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.pm-job__meta,.pm-job__time{display:flex;align-items:center;gap:6px;font-size:var(--pm-small);color:var(--pm-lab);white-space:nowrap;overflow:hidden}
.pm-job__meta .px-id{font-size:12px;color:var(--ink-2)}
.pm-job__t{font-size:var(--pm-body);font-weight:500;line-height:1.3;color:var(--ink)}
.pm-job__time em,.pm-op__sub em{font-style:normal;color:var(--ink-3)}
.pm-job__time .px-tag,.pm-op__sub .px-tag{height:18px;font-size:10.5px}
.pm-job .px-mini{width:44px}
.pm-play{all:unset;box-sizing:border-box;width:var(--pm-tap);height:var(--pm-tap);border-radius:50%;display:grid;place-items:center;flex:none;box-shadow:inset 0 0 0 1px var(--border);color:var(--ink);cursor:pointer;transition:background-color .15s ease-out}
.pm-play .px-ico{width:16px;height:16px}
.pm-play:active{transform:scale(.96)}
.pm-play.is-live{background:var(--accent);color:var(--on-accent);box-shadow:none}
.pm-job.is-wait .pm-job__t{color:var(--ink-2)}

/* clock bar + tab bar */
.pm-cbar{flex:none;margin:0 12px 8px;display:flex;align-items:center;gap:10px;height:54px;padding:0 7px 0 14px;border-radius:18px;background:var(--primary);color:var(--on-primary);box-shadow:var(--shadow-raised);cursor:pointer;animation:pm-up .24s cubic-bezier(.2,.8,.2,1) both}
.pm-cbar[hidden]{display:none!important}
.pm-cbar__dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none;animation:px-breathe 2.4s ease-in-out infinite}
.pm-cbar .pm-cbar__dot{background:#D1B184}
.pm-cbar__t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}
.pm-cbar__t small{font-size:11.5px;opacity:.7}
.pm-cbar__t b{font-size:13.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-cbar__v{font:600 16px/1 var(--font-sans);font-variant-numeric:tabular-nums}
.pm-cbar__stop{all:unset;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(128,128,128,.28);cursor:pointer}
.pm-cbar__stop .px-ico{width:15px;height:15px;color:inherit}
.pm-tabs{flex:none;display:grid;grid-template-columns:repeat(4,1fr);padding:6px 10px 30px;box-shadow:inset 0 1px 0 var(--hairline);background:var(--panel)}
.pm-tab{all:unset;display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0;font-size:10.5px;font-weight:500;color:var(--ink-3);cursor:pointer}
.pm-tab .px-ico{width:23px;height:23px}
.pm-tab.is-on{color:var(--ink)}

/* RO */
.pm-nav{display:flex;align-items:center;gap:8px;height:44px;margin:0 -8px 8px}
.pm-back{all:unset;display:inline-flex;align-items:center;gap:2px;height:36px;padding:0 8px 0 2px;font-size:15px;color:var(--ink-2);cursor:pointer}
.pm-back .px-ico{width:20px;height:20px}
.pm-nav__t{flex:1;text-align:center;font-size:14px;font-weight:500;color:var(--ink-2)}
.pm-nav__acts{margin-left:auto;display:flex}
.pm-ro__status{display:flex;align-items:center;gap:10px;margin-top:16px;flex-wrap:wrap}
.pm-ro__status .px-status--button{height:34px}
.pm-totals{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:20px}
.pm-tot{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:3px;padding:10px 12px;border-radius:14px;background:var(--fill);cursor:pointer;transition:background-color .15s ease-out}
.pm-tot:active{background:var(--selected)}
.pm-tot > span{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:var(--pm-lab)}
.pm-tot > span .px-ico{width:14px;height:14px}
.pm-tot b{font:500 17px/22px var(--font-sans);font-variant-numeric:tabular-nums;white-space:nowrap}
.pm-tot em{font-style:normal;font-weight:400;font-size:13px;color:var(--ink-3);margin-left:3px}
.pm-stage{margin-top:22px}
.pm-stage__top{display:flex;gap:5px;font-size:13.5px;color:var(--ink-2)}
.pm-stage__top b{font-weight:600;color:var(--accent-text)}
.pm-stage__top .r{margin-left:auto;color:var(--ink-3)}
.pm-ticks{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:10px}
.pm-ticks i{height:5px;border-radius:3px;background:var(--hairline)}
.pm-ticks i.is-done{background:var(--ink-2)}
.pm-ticks i.is-now{background:var(--accent)}
.pm-ticks i.is-skip{background:transparent;box-shadow:inset 0 0 0 1px var(--hairline)}
.pm-ticks i.is-wait{background:repeating-linear-gradient(90deg,var(--status-customer) 0 4px,transparent 4px 7px)}
.pm-next{margin-top:20px}
.pm-next .px-next__acts .px-btn{flex:0 0 auto}
.pm-op{display:flex;align-items:center;gap:12px;min-height:var(--pm-row);padding:12px 0;box-shadow:inset 0 -1px 0 var(--hairline);background:var(--panel);cursor:pointer}
.pm-op__main{flex:1;min-width:0}
.pm-op__t{font-size:var(--pm-body);font-weight:500;line-height:1.3}
.pm-op__n{color:var(--ink-3);margin-right:8px;font-variant-numeric:tabular-nums}
.pm-op__sub{display:flex;align-items:center;gap:7px;margin-top:5px;font-size:var(--pm-small);color:var(--pm-lab);white-space:nowrap}
.pm-op__sub .px-mini{width:36px}
.pm-op__m{overflow:hidden;text-overflow:ellipsis}
.pm-op__go{width:16px;height:16px;color:var(--ink-4)}
.pm-swipe{position:relative;overflow:hidden;margin:0 -20px;padding:0 20px}
.pm-swipe__act{position:absolute;top:0;bottom:0;right:0;width:104px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:var(--primary);color:var(--on-primary);font-size:12px;font-weight:500}
.pm-swipe__act .px-ico{width:18px;height:18px}
.pm-swipe.is-open .pm-op{transform:translateX(-104px);box-shadow:none}
.pm-props{display:flex;flex-direction:column}
.pm-prop{all:unset;display:flex;align-items:center;gap:12px;min-height:50px;box-shadow:inset 0 -1px 0 var(--hairline);font-size:14px;cursor:pointer}
.pm-prop span{width:84px;flex:none;color:var(--pm-lab);font-size:13px}
.pm-prop b{flex:1;min-width:0;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-prop .px-ico{width:16px;height:16px;color:var(--ink-4)}

/* operation */
.pm-optitle{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.pm-optitle h1{margin:0;font:500 26px/32px var(--font-serif);letter-spacing:-.01em;font-variation-settings:"opsz" 30}
.pm-clock{margin-top:18px;padding:18px 18px 16px;border-radius:20px;background:var(--raised);box-shadow:inset 0 0 0 1px var(--hairline)}
.pm-clock__v{font:500 52px/56px var(--font-sans);letter-spacing:-.025em;font-variant-numeric:tabular-nums}
.pm-clock__cap{display:flex;align-items:center;gap:8px;margin:2px 0 14px;font-size:13px;color:var(--ink-3)}
.pm-clock:not(.is-live) .pm-cbar__dot{display:none}
.pm-clock .px-time__stats{margin-top:14px;gap:8px}
.pm-clock .px-time__stats b{font-size:17px}
.pm-seg{margin:22px 0 4px}
.pm-seg button{padding:8px 4px;font-size:13.5px}
.pm-seg .n{color:var(--ink-3);font-weight:400;margin-left:2px}
.pm-part,.pm-trow{display:flex;align-items:center;gap:12px;min-height:var(--pm-row);padding:10px 0;box-shadow:inset 0 -1px 0 var(--hairline)}
.pm-part > div,.pm-trow > div{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pm-part b,.pm-trow b{font-size:var(--pm-body);font-weight:500}
.pm-part small,.pm-trow small{font-size:var(--pm-small);color:var(--pm-lab)}
.pm-part small .px-id{font-size:12px}
.pm-trow > span{font:500 15px/1 var(--font-sans);font-variant-numeric:tabular-nums}
.pm-pill{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 10px 0 11px;border-radius:999px;background:var(--fill);font-size:13px;font-weight:500;white-space:nowrap;cursor:pointer;flex:none}
.is-bay .pm-pill{height:44px;font-size:14.5px}
.pm-pill .px-chev{width:12px;height:12px;color:var(--ink-3)}
.pm-addrow{all:unset;display:flex;align-items:center;gap:10px;height:48px;font-size:14px;color:var(--ink-3);cursor:pointer}
.pm-addrow .px-ico{width:16px;height:16px}
.pm-notes{width:100%;margin-top:14px;font-size:16px;line-height:23px;padding:12px;height:auto}
.pm-hint{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:var(--ink-3);margin:10px 0 0}
.pm-hint .px-ico{width:15px;height:15px;flex:none;margin-top:1px}
.pm-files{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.pm-file{all:unset;box-sizing:border-box;position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,hsl(var(--h),14%,58%),hsl(var(--h),12%,26%));display:flex;align-items:flex-end;padding:6px}
.pm-file span{font-size:10.5px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.pm-file--add{background:none;box-shadow:inset 0 0 0 1.5px var(--border);flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--ink-2);cursor:pointer}
.pm-file--add span{color:var(--ink-2);text-shadow:none;font-size:12px}
.pm-file--add .px-ico{width:22px;height:22px}
.pm-actbar{flex:none;display:flex;gap:10px;padding:10px 16px 30px;box-shadow:inset 0 1px 0 var(--hairline);background:var(--panel)}
.pm-act{all:unset;box-sizing:border-box;width:76px;height:58px;border-radius:16px;background:var(--fill);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11.5px;font-weight:500;color:var(--ink);cursor:pointer}
.pm-act .px-ico{width:21px;height:21px}
.pm-go{all:unset;box-sizing:border-box;flex:1;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:10px;background:var(--primary);color:var(--on-primary);font-size:16px;font-weight:600;cursor:pointer;transition:background-color .2s ease-out}
.pm-go .px-ico{width:18px;height:18px}
.pm-go.is-live{background:var(--accent);color:var(--on-accent)}
.is-bay .pm-act,.is-bay .pm-go{height:66px}

/* sheets */
.pm-sheet{position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;justify-content:flex-end;background:var(--scrim);animation:px-fade .16s ease-out both}
.pm-sheet__p{position:relative;background:var(--raised);border-radius:24px 24px 0 0;padding:8px 14px 32px;box-shadow:var(--shadow-raised);max-height:82%;overflow-y:auto;scrollbar-width:none;animation:pm-up .26s cubic-bezier(.2,.8,.2,1) both}
.pm-sheet.is-closing{animation:px-fade .14s ease-in reverse both}.pm-sheet.is-closing .pm-sheet__p{animation:pm-up .14s ease-in reverse both}
.pm-sheet.is-static,.pm-sheet.is-static .pm-sheet__p{animation:none}
.pm-sheet__grab{width:36px;height:5px;border-radius:3px;background:var(--border-strong);margin:0 auto 12px}
.pm-sheet__h{padding:2px 10px 12px}
.pm-sheet__h h3{margin:0;font:500 21px/27px var(--font-serif);letter-spacing:-.01em}
.pm-sheet__h p{margin:3px 0 0;font-size:13px;color:var(--ink-3)}
.pm-srow{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:14px;width:100%;min-height:52px;padding:0 12px;border-radius:12px;font-size:16px;color:var(--ink);cursor:pointer}
.is-bay .pm-srow{min-height:60px;font-size:17px}
.pm-srow:hover{background:var(--fill)}
.pm-srow .px-si{width:16px;height:16px}
.pm-srow > .px-ico{width:18px;height:18px;color:var(--ink-3)}
.pm-srow__tick{margin-left:auto;opacity:0}
.pm-srow.is-on .pm-srow__tick{opacity:1;color:var(--ink)}
.pm-srow--danger,.pm-srow--danger > .px-ico{color:var(--bad)}
.pm-ssep{height:1px;background:var(--hairline);margin:6px 12px}
.pm-sheet .px-tsum{padding:0 10px 6px}
.pm-sheet .px-tsum b{font-size:19px}
.pm-sl{padding:0 10px}
.pm-sl .pm-part{min-height:52px}
.pm-sgrp{font-size:12.5px;color:var(--ink-3);padding:14px 0 2px}
.pm-sgrp b{font-weight:500;color:var(--ink-2)}
.pm-pbar{display:flex;gap:3px;height:8px;margin:2px 10px 10px}
.pm-pbar i{border-radius:3px}
.pm-pleg{display:flex;flex-wrap:wrap;gap:6px 14px;padding:0 10px 4px;font-size:12.5px;color:var(--ink-2)}
.pm-pleg span{display:inline-flex;align-items:center;gap:6px}
.pm-pst{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:500;white-space:nowrap}
.pm-done{all:unset;box-sizing:border-box;display:block;width:calc(100% - 20px);margin:16px 10px 0;height:48px;border-radius:14px;background:var(--fill);text-align:center;font-size:15px;font-weight:500;cursor:pointer}

/* sync */
.pm-qr{position:relative;width:264px;height:264px;margin:24px auto 0;display:grid;place-items:center}
.pm-qr__ring{position:absolute;inset:0;transform:rotate(-90deg)}
.pm-qr__ring circle{fill:none;stroke:var(--hairline);stroke-width:4}
.pm-qr__ring circle.p{stroke:var(--accent);stroke-linecap:round;transition:stroke-dashoffset .4s ease-out}
.pm-qr__box{width:212px;height:212px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px var(--hairline)}
.pm-qr__code{display:block;width:100%;height:100%}
.pm-qr__cap{text-align:center;margin-top:16px;display:flex;flex-direction:column;gap:4px;padding:0 12px}
.pm-qr__cap b{font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}
.pm-qr__cap span{font-size:13px;line-height:19px;color:var(--ink-3)}
.pm-cam{position:relative;height:300px;margin-top:20px;border-radius:20px;background:#121211;display:flex;align-items:flex-end;justify-content:center;padding:18px;color:#cfcac2;font-size:13px;text-align:center}
.pm-cam i{position:absolute;width:34px;height:34px;border:3px solid #D1B184}
.pm-cam i:nth-child(1){top:60px;left:90px;border-right:0;border-bottom:0;border-radius:10px 0 0 0}
.pm-cam i:nth-child(2){top:60px;right:90px;border-left:0;border-bottom:0;border-radius:0 10px 0 0}
.pm-cam i:nth-child(3){bottom:70px;left:90px;border-right:0;border-top:0;border-radius:0 0 0 10px}
.pm-cam i:nth-child(4){bottom:70px;right:90px;border-left:0;border-top:0;border-radius:0 0 10px 0}
.pm-sync .pm-sync__h{font-size:13px;font-weight:600;color:var(--ink-2);margin-bottom:4px}
.pm-sync__r{display:flex;justify-content:space-between;height:38px;align-items:center;box-shadow:inset 0 -1px 0 var(--hairline);font-size:14px}
.pm-sync__r span{color:var(--ink-2)}.pm-sync__r b{font-weight:500;font-variant-numeric:tabular-nums}
.pm-sync__f{margin-top:10px;font-size:12.5px;line-height:18px;color:var(--ink-3)}

/* toasts in the phone */
[data-screen=today] .pm-toastwrap,[data-screen=ro] .pm-toastwrap,[data-screen=sync] .pm-toastwrap{bottom:160px}
.pm-toastwrap{position:absolute;left:0;right:0;bottom:112px;display:flex;justify-content:center;z-index:45;pointer-events:none}
.pm-toastwrap .px-toast{pointer-events:auto;animation:px-rise .2s cubic-bezier(.2,.8,.2,1) both;max-width:340px}
@keyframes pm-up{from{transform:translateY(100%)}}
.is-new{animation:px-pop .26s cubic-bezier(.2,.8,.2,1) both}
@media (max-width:440px){.pm-board{padding:24px 0}.pm-dev{zoom:.86}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
'''

JS = r'''
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=document.documentElement, stage=$('.pm-board');
const PSI=__PSI__, PNAME=__PNAME__, ICO=__ICO__, QRS=__QRS__;
const scr=k=>$(`[data-screen="${k}"]`);
/* toolbar */
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
function tog(id,fn){const l=$(id);l.onclick=()=>{const on=!l.classList.contains('is-on');l.classList.toggle('is-on',on);$('.px-toggle',l).classList.toggle('is-on',on);fn(on);};}
tog('#bay',on=>stage.classList.toggle('is-bay',on)); tog('#nums',on=>stage.classList.toggle('wt',on));
const pop=el=>{if(!el)return;el.classList.remove('is-new');void el.offsetWidth;el.classList.add('is-new');};

/* toast inside a phone */
let tt;function ptoast(k,msg,undo){const w=$('[data-ptoast]',scr(k))||(()=>{const d=document.createElement('div');d.className='pm-toastwrap';d.dataset.ptoast='';scr(k).appendChild(d);return d;})();
  w.innerHTML=`<div class="px-toast">${msg}${undo?'<button class="px-toast__act">Undo</button>':''}</div>`;if(undo)$('button',w).onclick=()=>{undo();w.innerHTML='';};clearTimeout(tt);tt=setTimeout(()=>w.innerHTML='',3200);}

/* ---------- the clock: one running job, everywhere ---------- */
const JOBT={'37538-1':['RO-37538 · Operation 1','Clutch slipping – replace clutch'],'37538-3':['RO-37538 · Operation 3','PM service – A'],'35112-1':['RO-35112 · Operation 1','Air leak at the front axle']};
let running='37538-1', base=22557, started=Date.now();
const fmt=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');};
let secs1=22557;
function tick(){if(running==='37538-1'){secs1=base+Math.floor((Date.now()-started)/1000);}
  const h=secs1/3600;
  $$('[data-screen="op"] [data-clock]').forEach(e=>e.textContent=fmt(secs1));
  $$('[data-b1]').forEach(e=>e.textContent=h.toFixed(2));
  $$('[data-screen="op"] [data-left]').forEach(e=>e.textContent=Math.max(0,8-h).toFixed(2));
  $$('[data-screen="op"] [data-eff]').forEach(e=>e.textContent=Math.round(8/h*100));
  $$('[data-screen="op"] [data-bar]').forEach(e=>e.style.width=Math.min(100,h/8*100)+'%');
  if(running){const s=running==='37538-1'?secs1:Math.floor((Date.now()-started)/1000);$$('[data-clock-mini]').forEach(e=>e.textContent=fmt(s));}}
setInterval(tick,1000);
function render(){
  $$('[data-cbar]').forEach(c=>{c.hidden=!running;if(running){$('[data-cbar-ro]',c).textContent=JOBT[running][0];$('[data-cbar-job]',c).textContent=JOBT[running][1];}});
  $$('[data-screen="today"] [data-play]').forEach(b=>{const on=b.dataset.play===running;b.classList.toggle('is-live',on);b.innerHTML=on?ICO.stop:ICO.play;b.title=on?'Stop clock':'Start clock';
    const row=b.closest('.pm-job'),s=$('.px-si',row);const want=on?'working':'hold';if(s.dataset.s!==want){s.outerHTML=__SIW__[want];pop($('.px-si',row));}});
  const on1=running==='37538-1', o=scr('op');
  $('[data-clockcard]',o).classList.toggle('is-live',on1);$('[data-clockcap]',o).textContent=on1?'Clock running · Repairing':'On this operation · clock stopped';
  const g=$('[data-go]',o);g.classList.toggle('is-live',on1);g.innerHTML=(on1?ICO.stop:ICO.play)+`<span>${on1?'Stop clock':'Start clock'}</span>`;
  const r=scr('ro'),st=$('[data-rostatus]',r),cur=$('.px-si',st).dataset.s,want=running&&running.startsWith('37538')?'working':'hold';
  if(cur!==want){$('.px-si',st).outerHTML=__SIW__[want];pop($('.px-si',st));$('[data-rostatus-name]',st).textContent=want==='working'?'Working':'Hold tech';$('[data-rostatus-sub]',st).textContent=want==='working'?'· Repairing':'';}
  const op1=$('[data-oprow="1"] .px-si',r);if(op1.dataset.s!==(on1?'working':'hold')){op1.outerHTML=__SIW__[on1?'working':'hold'];}
  const seg=$('[data-liveseg]');if(seg)seg.classList.toggle('is-live',on1);
  tick();}
function start(id,from){if(running==='37538-1')base=secs1;running=id;started=Date.now();if(id==='37538-1')started=Date.now();render();ptoast(from,__SIW__.working+`Clock started · ${JOBT[id][0].split(' · ')[1]}`);}
function stop(from){const was=running;if(!was)return;if(was==='37538-1')base=secs1;running=null;render();ptoast(from,__SIW__.hold+`Clock stopped · ${JOBT[was][0].split(' · ')[1]}`,()=>{start(was,from);});}
$$('[data-screen="today"] [data-play]').forEach(b=>b.onclick=()=>b.dataset.play===running?stop('today'):start(b.dataset.play,'today'));
$$('[data-screen] [data-stop]').forEach(b=>b.onclick=e=>{e.stopPropagation();stop(b.closest('[data-screen]').dataset.screen);});
$('[data-screen="op"] [data-go]').onclick=()=>running==='37538-1'?stop('op'):start('37538-1','op');

/* ---------- operation tabs ---------- */
const op=scr('op');
$$('[data-ptab]',op).forEach(t=>t.onclick=()=>{$$('[data-ptab]',op).forEach(x=>x.classList.toggle('is-on',x===t));$$('[data-ppane]',op).forEach(p=>p.hidden=p.dataset.ppane!==t.dataset.ptab);});

/* ---------- bottom sheets ---------- */
const PARTS=[{id:'1-1',op:1,d:'Clutch kit, 15.5 in',pn:'85136213',q:1,k:'received'},{id:'1-2',op:1,d:'Clutch release bearing',pn:'21515427',q:1,k:'installed'},
  {id:'2-1',op:2,d:'Inner wheel seal, right rear',pn:'21422645',q:1,k:'notordered'},{id:'3-1',op:3,d:'Oil filter',pn:'21707134',q:2,k:'received'},{id:'3-2',op:3,d:'Fuel filter kit',pn:'23658092',q:1,k:'ordered'}];
const OPN={1:'Clutch slipping – replace clutch',2:'Wheel seal leaking',3:'PM service – A'};
const IN=k=>k==='received'||k==='installed';
function counts(){$$('[data-inhand]').forEach(e=>e.textContent=PARTS.filter(p=>IN(p.k)).length);const o1=PARTS.filter(p=>p.op===1);$('[data-pcount]',op).textContent=o1.filter(p=>IN(p.k)).length+'/'+o1.length;}
function openSheet(k,html,onbind){closeSheet(k,true);const s=document.createElement('div');s.className='pm-sheet';s.dataset.live='';s.innerHTML=`<div class="pm-sheet__p"><div class="pm-sheet__grab"></div>${html}</div>`;scr(k).appendChild(s);
  s.onclick=e=>{if(e.target===s)closeSheet(k);};$$('[data-done]',s).forEach(b=>b.onclick=()=>closeSheet(k));onbind&&onbind(s);return s;}
function closeSheet(k,now){const s=$('.pm-sheet[data-live]',scr(k));if(!s)return;if(now){s.remove();return;}s.classList.add('is-closing');setTimeout(()=>s.remove(),140);}
const pst=k=>`<span class="pm-pst">${PSI[k]}${PNAME[k]}</span>`;
const PCOL={notordered:'var(--status-hold)',ordered:'var(--status-waiting)',backordered:'var(--status-problem)',received:'var(--status-working)',installed:'var(--status-working)'};
function sheetParts(){const inh=PARTS.filter(p=>IN(p.k)).length;
  const bar=Object.keys(PSI).map(k=>{const c=PARTS.filter(p=>p.k===k).length;return c?`<i style="flex:${c};background:${PCOL[k]};opacity:${k==='received'?.55:1}"></i>`:''}).join('');
  const leg=Object.keys(PSI).map(k=>{const c=PARTS.filter(p=>p.k===k).length;return c?`<span>${PSI[k]}${PNAME[k]} ${c}</span>`:''}).join('');
  const groups=[1,2,3].map(o=>{const ps=PARTS.filter(p=>p.op===o);return ps.length?`<div class="pm-sgrp"><b>Operation ${o}</b> · ${OPN[o]}</div>`+ps.map(p=>`<div class="pm-part"><div><b>${p.d}</b><small><span class="px-id">${p.pn}</span> · Qty ${p.q}</small></div>${pst(p.k)}</div>`).join(''):''}).join('');
  return `<div class="pm-sheet__h"><h3>Parts on RO-37538</h3><p>${inh} of ${PARTS.length} in hand</p></div><div class="pm-pbar">${bar}</div><div class="pm-pleg">${leg}</div><div class="pm-sl">${groups}</div><button class="pm-done" data-done>Done</button>`;}
function sheetTime(){const b=secs1/3600;return `<div class="pm-sheet__h"><h3>Time on RO-37538</h3><p>3 operations</p></div>
  <div class="px-tsum"><div><span>Quoted</span><b>11.90<small>h</small></b></div><div><span>Burnt</span><b>${b.toFixed(2)}<small>h</small></b></div><div><span>Left</span><b>${(11.9-b).toFixed(2)}<small>h</small></b></div><div><span>Eff.</span><b class="px-good">${Math.round(8/b*100)}<small>%</small></b></div></div>
  <div class="pm-sl">${[[1,b,8],[2,0,2.4],[3,0,1.5]].map(([o,x,q])=>`<div class="pm-part"><div><b><span class="pm-op__n">${o}</span>${OPN[o]}</b><small><span class="px-mini" style="display:inline-block;width:64px;vertical-align:middle"><i style="width:${Math.min(100,x/q*100)}%"></i></span></small></div><span class="pm-pst" style="font-variant-numeric:tabular-nums">${x.toFixed(2)} <span style="color:var(--ink-3);font-weight:400">/ ${q.toFixed(2)} h</span></span></div>`).join('')}</div><button class="pm-done" data-done>Done</button>`;}
function sheetFiles(){const F=[['Whole RO',[['dash-photo.jpg','Dash photo · Oct 6'],['dtc-report.pdf','DTC upload · Oct 6'],['estimate-v1.pdf','Estimate · Oct 6']]],['Operation 1 · '+OPN[1],[['flywheel-scoring.jpg','Picture · Oct 19'],['clutch-disc.jpg','Picture · Oct 19']]],['Operation 2 · '+OPN[2],[['rr-seal-leak.jpg','Picture · Oct 20']]]];
  return `<div class="pm-sheet__h"><h3>Files on RO-37538</h3><p>6 files</p></div><div class="pm-sl">${F.map(([g,fs])=>`<div class="pm-sgrp"><b>${g.split(' · ')[0]}</b>${g.includes(' · ')?' · '+g.split(' · ')[1]:''}</div>`+fs.map(([nm,m])=>`<div class="pm-part"><div><b>${nm}</b><small>${m}</small></div>${ICO.chevR.replace('px-ico','px-ico pm-op__go')}</div>`).join('')).join('')}</div><button class="pm-done" data-done>Done</button>`;}
$$('[data-screen="ro"] [data-sheet]').forEach(b=>b.onclick=()=>openSheet('ro',{parts:sheetParts,time:sheetTime,files:sheetFiles}[b.dataset.sheet]()));

/* part status sheet (screen 3, live) */
function partSheet(pill){const p=PARTS.find(x=>x.id===pill.dataset.pp);
  const rows=Object.keys(PSI).map(k=>`<button class="pm-srow${k===p.k?' is-on':''}" data-set="${k}">${PSI[k]}<span>${PNAME[k]}</span>${ICO.check.replace('px-ico','px-ico pm-srow__tick')}</button>`).join('');
  openSheet('op',`<div class="pm-sheet__h"><h3>${p.d}</h3><p><span class="px-id">${p.pn}</span> · Qty ${p.q} · Operation ${p.op}</p></div>${rows}<div class="pm-ssep"></div><button class="pm-srow" data-copy>${ICO.copy}<span>Copy part number</span></button><button class="pm-srow">${ICO.swap}<span>Move to operation…</span></button><button class="pm-srow pm-srow--danger">${ICO.trash}<span>Remove part</span></button>`,
    s=>{$$('[data-set]',s).forEach(r=>r.onclick=()=>{const prev=p.k;setPart(p,r.dataset.set);closeSheet('op');ptoast('op',PSI[p.k]+`${p.d} · ${PNAME[p.k]}`,()=>setPart(p,prev));});
        $('[data-copy]',s).onclick=()=>{try{navigator.clipboard.writeText(p.pn)}catch(_){};closeSheet('op');ptoast('op',ICO.check+'Part number copied');};});}
function setPart(p,k){p.k=k;$$(`[data-screen="op"] [data-pp="${p.id}"]`).forEach(b=>{b.dataset.k=k;b.innerHTML=PSI[k]+`<span>${PNAME[k]}</span>`+ICO.chevD.replace('px-ico','px-ico px-chev');pop($('.px-si',b));});counts();}
$$('[data-screen="op"] [data-pp]').forEach(b=>b.onclick=()=>partSheet(b));
/* static sheet on screen 4: rows still move the tick */
$$('[data-screen="opsheet"] [data-set]').forEach(r=>r.onclick=()=>{$$('[data-screen="opsheet"] [data-set]').forEach(x=>x.classList.toggle('is-on',x===r));});

/* ---------- sync ---------- */
const sy=scr('sync');let qi=0,qn=7,qt=null;
function runQR(){clearInterval(qt);qt=setInterval(()=>{qi=(qi+1)%QRS.length;qn=qn%18+1;$('[data-qrbox]',sy).innerHTML=QRS[qi];$('[data-qrn]',sy).textContent=`Code ${qn} of 18`;$('[data-ring]',sy).style.strokeDashoffset=(791.7*(1-qn/18)).toFixed(1);},600);}
$$('[data-sync]',sy).forEach(b=>b.onclick=()=>{$$('[data-sync]',sy).forEach(x=>x.classList.toggle('is-on',x===b));$$('[data-syncpane]',sy).forEach(p=>p.hidden=p.dataset.syncpane!==b.dataset.sync);b.dataset.sync==='send'?runQR():clearInterval(qt);});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)runQR();
render();
'''
SIW = {k: si(k) for k in ("working", "hold")}
rep = {"__PSI__": {k: psi(k) for k, *_ in PART_STATUSES}, "__PNAME__": {k: nm for k, nm, *_ in PART_STATUSES},
       "__ICO__": {k: ic(k) for k in ("play","stop","check","copy","swap","trash","chevD","chevR")}, "__QRS__": QRS, "__SIW__": SIW}
for k, v in rep.items():
    JS = JS.replace(k, json.dumps(v))

html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Mobile mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar">
  <h1>{P.LOGO}Parsec Mobile · technician mock-up</h1>
  <div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div>
  <label id="bay"><span class="px-toggle"></span>Bay mode</label>
  <label id="nums" class="is-on"><span class="px-toggle is-on"></span>Numbers</label>
</div>
<div class="pm-board wt">{screens}</div>
<div class="wt-notes">{notes_html}</div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
