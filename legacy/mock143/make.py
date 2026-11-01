# Parsec · the RO list on every page + one RO view (Technician page = the RO page) — mock-up
import json, os, base64, html
H = os.path.dirname(os.path.abspath(__file__)); VT = os.path.join(os.path.dirname(H), "build", "vt")
OUT = "/mnt/user-data/outputs/Parsec RO list everywhere and one RO view mock-up.html"
e = html.escape
PICS = {k: "data:image/webp;base64," + base64.b64encode(open(os.path.join(VT, f), "rb").read()).decode() for k, f in
        [("a", "vnl-25-860_s.webp"), ("b", "vnr-26-640_s.webp"), ("c", "vhd-21-400_s.webp"), ("d", "vnl-18-760_s.webp")]}

IC = {"hold": '<circle cx="7" cy="7" r="5.25"/>', "run": '<circle cx="7" cy="7" r="5.25"/><path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" stroke="none"/>',
      "wait": '<circle cx="7" cy="7" r="5.25" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor" stroke="none"/>',
      "done": '<circle cx="7" cy="7" r="5.25"/><path d="M4.6 7.1l1.6 1.6 3.2-3.4"/>', "rt": '<circle cx="7" cy="7" r="5.25"/><path d="M7 3.5a3.5 3.5 0 1 1-3.5 3.5H7z" fill="currentColor" stroke="none"/>',
      "rel": '<circle cx="7" cy="7" r="6" fill="currentColor" stroke="none"/><path d="M4.4 7.2l1.8 1.8 3.5-3.7" stroke="var(--panel)"/>', "bad": '<circle cx="7" cy="7" r="5.25"/><path d="M7 4.2v3.4"/><circle cx="7" cy="9.75" r=".95" fill="currentColor" stroke="none"/>',
      "q": '<circle cx="7" cy="7" r="5.25"/><path d="M7 3.5a3.5 3.5 0 0 1 3.5 3.5H7z" fill="currentColor" stroke="none"/>'}
TONE = {"hold": "hold", "run": "run", "wait": "wait", "done": "run", "rt": "run", "rel": "run", "bad": "bad", "cust": "cust", "q": "tech"}
def st(k, w, sub="", menu=False, cls=""):
    ic = "wait" if k == "cust" else k
    svg = '<svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + IC[ic] + "</svg>"
    return '<span class="pst t-%s%s%s">%s<span>%s</span>%s%s</span>' % (TONE[k], " m" if menu else "", (" " + cls) if cls else "", svg, e(w), ('<em>· ' + e(sub) + '</em>') if sub else "", '<svg class="cv" viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.6 6 7.6 9 4.6"/></svg>' if menu else "")
def pic(k, cls="tp"): return '<span class="%s" style="background-image:var(--p%s)"></span>' % (cls, k)
def jt(t): return '<span class="jt jt-%s">%s</span>' % (t.lower(), e(t))
def av(n): return '<span class="av">%s</span>' % e(n if len(n) <= 2 else "".join(w[0] for w in n.split()[:2]).upper())
def b(t, pri=False): return '<span class="b%s">%s</span>' % (" pri" if pri else "", t)
def mini(bv, q): p = min(100, bv / q * 100) if q else 0; return '<span class="mb%s"><i style="width:%d%%"></i></span>' % (" over" if bv > q else "", p)

# ---------------------------------------------------------------- A · the ROs tab in each page's header
PAGES = [("Triage", ["Inbox", "Desk", "Yard"], "waiting on customers · writer’s ROs", "8"),
         ("Foreman", ["Floor", "Techs", "Yard", "Tomorrow"], "in the shop · bays and techs", "14"),
         ("Parts", ["Desk", "On order", "Shelf", "Returns", "Catalog"], "ROs with parts to get", "9"),
         ("Technician", ["Their ROs", "Yard"], "Mike’s ROs", "6"),
         ("Manager", ["Overview", "KPIs", "Fleets", "Flow", "Team", "Activity"], "every open RO", "24")]
def strip(name, tabs, scope, n, on=True):
    t = "".join('<span>%s</span>' % e(x) for x in tabs) + '<span class="%s">ROs <em>%s</em></span>' % ("on new" if on else "new", n)
    return '<div class="hs"><b class="pt">%s</b><span class="hseg">%s</span><small>%s</small></div>' % (e(name), t, e(scope))

ROWS = [("8690", "a", "Summit Freightways", "Unit T-354", ("run", "Working", "Repairing"), ("run", "Working · Op 1", "Mike"), "MR", "D5", "13d", 3.98, 8.0),
        ("2488", "b", "Highplains Grain", "Unit T-885", ("wait", "Waiting – Parts", "Ordered"), ("teal", "Send the estimate", "Jenna"), "DK", "E10", "13d", 4.48, 6.0),
        ("1298", "c", "Midway Auto Transport", "Unit T-210", ("rt", "Complete – Road test", ""), ("good", "Release the truck", "Jenna"), "PS", "F1", "13d", 2.97, 2.2),
        ("9333", "d", "Granite State Express", "Unit T-118", ("hold", "Hold tech", "1 op waiting on parts"), ("teal", "Assign a tech", "Frank"), "", "D8", "12d", 1.0, 2.0),
        ("4013", "b", "Copperline Transport", "Unit T-640", ("q", "Waiting – Tech support", ""), ("hold", "Op 1 — Turbo actuator", "Luis"), "LM", "D10", "11d", 1.25, 2.5),
        ("7616", "a", "Prairie Line Trucking", "Unit T-934", ("cust", "Waiting – Customer", "Approval pending"), ("teal", "Customer approval · 2 d", "Jenna"), "LM", "D6", "9d", 1.5, 2.7),
        ("2804", "c", "Harbor Point Drayage", "Unit T-421", ("bad", "Waiting – Parts", "Backordered"), ("bad", "Chase the backorder · ETA Fri", "Ben"), "DK", "D9", "8d", 0.2, 1.0)]
def rl_table(rows, sel="2488", cols="ro cust st nx tech spot open"):
    hd = {"ro": "RO", "cust": "Customer", "st": "Status", "nx": "Next step", "tech": "Tech", "spot": "Spot", "open": "Open", "time": "Time"}
    C = cols.split()
    h = '<div class="rlh">' + "".join('<span class="c-%s%s">%s%s</span>' % (c, " on" if c == "open" else "", hd[c], ' <i class="ar">↓</i>' if c == "open" else "") for c in C) + "</div>"
    out = []
    for no, p, cu, un, s, nx, tech, spot, days, bb, q in rows:
        cell = {"ro": '<span class="c-ro"><span class="no">%s</span>%s</span>' % (no, pic(p, "tpm")), "cust": '<span class="c-cust"><b>%s</b><small>%s</small></span>' % (e(cu), e(un)),
                "st": '<span class="c-st">%s</span>' % st(s[0], s[1], s[2]), "nx": '<span class="c-nx t-%s"><i></i>%s<small>· %s</small></span>' % (nx[0], e(nx[1]), e(nx[2])),
                "tech": '<span class="c-tech">%s</span>' % (av(tech) if tech else '<small class="mu">—</small>'), "spot": '<span class="c-spot">%s</span>' % e(spot),
                "open": '<span class="c-open%s">%s</span>' % (" late" if int(days[:-1]) >= 7 else "", e(days)), "time": '<span class="c-time">%s%.2f <em>/ %.2f</em></span>' % (mini(bb, q), bb, q)}
        out.append('<div class="rlr%s">%s</div>' % (" on" if no == sel else "", "".join(cell[c] for c in C)))
    return '<div class="rlt" style="--cols:%s">%s%s</div>' % (" ".join({"ro": "104px", "cust": "minmax(120px,1.2fr)", "st": "minmax(140px,1fr)", "nx": "minmax(150px,1.4fr)", "tech": "40px", "spot": "48px", "open": "46px", "time": "112px"}[c] for c in C), h, "".join(out))

def frame_foreman():
    head = '<div class="ph"><b class="ttl">Foreman</b><span class="facts">0/19 bays · <b>3</b> waiting on you · 0 late</span><span class="sp"></span><span class="hseg big"><span>Floor</span><span>Techs</span><span>Yard</span><span>Tomorrow</span><span class="on new">ROs <em>14</em></span></span><span class="ib">⌕</span>' + b("+ New RO", True) + "</div>"
    chips = '<div class="chips"><span class="ch on">In the shop <em>14</em></span><span class="ch">Waiting on you <em>3</em></span><span class="ch">No tech <em>2</em></span><span class="ch">All open <em>24</em></span><span class="sp"></span><span class="b sm">Display</span></div>'
    pane = ('<aside class="fpane"><div class="ey"><span class="mono">RO-32488</span> · Approval · stage 3 of 7</div><h3>Highplains Grain</h3><div class="mu">2018 Volvo VNL 400 · Unit T-885 · E10</div>'
            '<div class="row2">' + st("wait", "Waiting – Parts", "Ordered", True) + '<span class="mu">with</span>' + av("Dana Kowalski") + '<span>Dana</span></div>'
            '<div class="nxc"><b>Next</b><span>1 part on the way — Water pump · ETA Fri</span>' + b("Tell the tech") + "</div>"
            '<div class="fops"><div><span class="n">1</span><span>Coolant leak at water pump</span>' + st("done", "Complete") + '</div><div><span class="n">2</span><span>Driver side mirror broken</span>' + st("wait", "Waiting – Parts") + '</div><div><span class="n">3</span><span>Wheel seal leaking</span>' + st("hold", "Hold tech") + "</div></div>"
            '<div class="ft">' + b("Assign…") + b("Move truck") + b("Open RO", True) + "</div></aside>")
    return '<div class="frame">' + head + '<div class="pb"><div class="pl">' + chips + rl_table(ROWS) + '<div class="keys"><kbd>J</kbd><kbd>K</kbd> move · <kbd>↵</kbd> open · <kbd>/</kbd> search · click a header to sort · drag to reorder</div></div>' + pane + "</div></div>"

# ---------------------------------------------------------------- B · the Technician page's RO, now and after
def tech_now():
    return ('<div class="frame tn"><div class="ph"><b class="ttl">Technician</b>' + av("Mike Rodriguez") + '<b>Mike Rodriguez</b><span class="facts">· ● On the clock</span><span class="sp"></span><span class="hseg big"><span class="on">Their ROs</span><span>Yard</span></span></div>'
            '<div class="tcols"><div class="tl">' + tlist() + '</div>'
            '<div class="tc"><div class="sh"><h4>Operations</h4><small>1 · 4.0 of 8.0 h</small></div>'
            '<div class="tcard"><div class="th1"><b>Clutch slipping – replace clutch</b></div><div class="th2">' + '<span class="jtp">● REPAIR ▾</span><span class="tpill">◐ Working · Repairing ▾</span><span class="mu">⋯</span></div>'
            '<span class="chip">⚒ Fixed 13× before</span>' + clock("3:59:12", 8.0, 3.99, "Mike", tint=True) +
            '<div class="ttabs"><span class="on">Time <em>3</em></span><span>Parts <em>2/2</em></span><span>Files</span><span class="sp"></span><span class="mu">⟳</span></div>'
            '<div class="tbar"><i style="flex:36"></i><i style="flex:36"></i><i class="lt" style="flex:20"></i></div><div class="mu sm">Thu, Oct 15 · 9:57 am Started · Repairing · Mike</div></div></div>'
            '<div class="tr"><div class="tcard2">' + pic("a", "tpb") + '<div class="mono mu sm">RO-32046 · 12 days open</div><h3>Summit Freightways</h3><div class="mu">2020 Volvo VNL 860 · 6x4 · High-roof sleeper · Unit T-464</div>'
            '<div class="tpill sm2">● Working · Repairing</div><div class="tpill sm2">● RO · Working ▾</div><div class="mono tk">3:59:24 <small>Op 1 · since 4:39 am</small></div><div class="ft l">' + b("Ask Frank") + b("Road test") + b("Truck checks") + "</div></div>"
            '<div class="grp"><b>People</b><div><span>Technician</span><span>Mike Rodriguez</span></div><div><span>Advisor</span><span>Jenna Cho</span></div></div><div class="grp"><b>Schedule</b><div><span>Ready about</span><span>Today 12:59 PM</span></div></div></div></div></div>')

def tlist(roview=False):
    g = lambda t, n: '<div class="lg"><span class="mu">⌄</span> %s <em>%s</em></div>' % (t, n)
    r = lambda no, p, cu, sub, rt, on=False: '<div class="li%s">%s<span class="no">%s</span><span class="lc"><b>%s</b><small>%s</small></span><span class="lr">%s</span></div>' % (" on" if on else "", pic(p, "tpm"), no, e(cu), e(sub), rt)
    return ('<div class="lh"><b>Mike’s repair orders</b><em>6</em></div>' + g("Sent to you", 1) + r("1298", "c", "Midway Auto Transport", "Road test ask · Frank", '<span class="chip sm">Road test</span>') +
            g("Working", 1) + r("8690", "a", "Summit Freightways", "Clutch slipping – replace clutch", '<span class="mono run">3:59</span>', True) + g("Assigned · Frank’s order", 3) +
            r("6271", "d", "Granite State Express", "PM service – level A", '<span class="mono">1.0 h</span>') + r("9182", "b", "Lone Star Tankers", "Replace rear brake chamber", '<span class="mono">1.5 h</span>') +
            g("Waiting", 2) + r("2253", "c", "Iron Horse Logistics", "Parts · Water pump — ordered", '<small class="warn">due Sat</small>'))

def clock(big, q, bb, who, tint=False):
    left = q - bb; eff = int(round(q / bb * 100)) if bb else 0
    return ('<div class="ock%s"><div class="oa"><b class="mono big">%s</b><small>On this operation · 3 entries · since 4:39 am</small></div><span class="play">■</span>'
            '<div class="obar"><i style="width:%d%%"></i><span class="qn" style="left:%d%%"></span></div>'
            '<div class="ol2"><span>◷ Quoted runs out about 8:30 am</span><span>◔ At Mike’s usual 110%%: done about 8:45 am</span></div>'
            '<div class="okv"><div><small>Quoted</small><b><u>%.2f</u><em>h</em></b></div><div><small>Burnt</small><b>%.2f<em>h</em></b></div><div><small>Left</small><b>%.2f<em>h</em></b></div><div><small>Efficiency</small><b class="g">%d<em>%%</em></b></div></div></div>') % (
            " tint" if tint else "", big, min(100, bb / q * 100 * .9), 90, q, bb, left, eff)

def tech_after():
    hd = ('<div class="ph"><b class="ttl">Technician</b>' + av("Mike Rodriguez") + '<b>Mike Rodriguez</b><span class="facts">· ● On the clock · 112% today</span><span class="sp"></span><span class="hseg big"><span class="on">Their ROs</span><span>Yard</span><span class="new">ROs <em>24</em></span></span></div>')
    bc = ('<div class="bc"><span class="mu">Mike’s ROs</span><span class="mu">/</span><b class="mono">RO-32046</b><span class="mu">⌃ ⌄ 1 of 6</span><span class="sp"></span>'
          '<span class="stat">◷ <b>3.99</b> / 8.00 h</span><span class="stat">⬡ <b>2</b> / 2</span><span class="stat">⟲ 3</span><span class="stat">⌀ 1</span><span class="mu">⋯</span></div>')
    ops = ('<div class="sh"><h4>Operations</h4><small>3</small><span class="sp"></span><span class="mu">+</span></div>'
           '<div class="opr on">' + st("run", "", "", cls="io") + '<span class="n">1</span><b>Clutch slipping – replace clutch</b>' + jt("REPAIR") + '<span class="mono t">3.99 / <u>8.00</u> h</span>' + mini(3.99, 8) + av("Mike Rodriguez") + st("run", "Working", "", True) + '<span class="mu">⋯</span></div>'
           '<div class="opin"><div class="chips2"><span class="chip">⚒ Fixed 13× before</span><span class="chip">Claim · none</span></div>' + clock("3:59:12", 8.0, 3.99, "Mike") +
           '<div class="ptabs"><span>Time <em>3</em></span><span class="on">Parts <em>2/2</em></span><span>Files</span><span class="sp"></span><span class="ia" title="Add part">+</span><span class="ia" title="From inventory">⬡</span><span class="ia" title="Extract from a quote">⌗</span><span class="ia" title="Ask Parts">↗</span></div>'
           '<div class="ptbl"><div class="h"><span>Part</span><span>Number</span><span>Qty</span><span>Status</span></div>'
           '<div><span>Clutch kit 15.5" <small class="mu">· $1,240.00</small></span><span class="mono">85013702</span><span>1</span>' + st("done", "Received", "", True) + '</div>'
           '<div><span>Pilot bearing <small class="mu">· $38.50</small></span><span class="mono">20518417</span><span>1</span>' + st("done", "Received", "", True) + '</div></div></div>'
           '<div class="opr">' + st("hold", "", "", cls="io") + '<span class="n">2</span><b>Check engine light – NOx sensor SPN 3226</b>' + jt("DIAG") + '<span class="mono t">0.00 / <u>1.50</u> h</span>' + mini(0, 1.5) + av("Mike Rodriguez") + st("hold", "Hold tech", "", True) + '<span class="mu">⋯</span></div>'
           '<div class="opr">' + st("cust", "", "", cls="io") + '<span class="n">3</span><b>PM service – level A</b>' + jt("PM") + '<span class="mono t">0.00 / <u>2.00</u> h</span>' + mini(0, 2) + av("Mike Rodriguez") + st("cust", "Waiting – Approval", "", True) + '<span class="mu">⋯</span></div>')
    rail = ('<div class="tcard3">' + pic("a", "tpb") + '<div class="mono mu sm">RO-32046 · Opened Oct 15 · 12 days open</div><h3><u>Summit Freightways</u></h3><div class="mu"><u>2020</u> <u>Volvo</u> <u>VNL 860</u> · 6x4 · High-roof sleeper · Unit <u>T-464</u> · D5</div>'
            '<div class="row2">' + st("run", "Working", "Repairing", True) + '<span class="mu">with</span>' + av("Mike Rodriguez") + "<span>Mike Rodriguez</span></div>"
            '<div class="ft l">' + b("Transfer…") + b("Road test") + b("Truck checks") + b("Ask Frank") + '</div><div class="sw"><span>Road test before release</span><i></i></div></div>'
            '<div class="stg"><b>Repair</b><span class="mu">· stage 4 of 6 · on it now 47 m</span><div class="sbar"><i class="d"></i><i class="d"></i><i class="d"></i><i class="a"></i><i></i><i></i></div><small class="mu">Ready about Today 12:59 PM</small></div>'
            '<div class="who"><b>Who has it</b><div>' + av("Mike Rodriguez") + '<span><b>With Mike Rodriguez</b><small>Technician · on the clock</small></span></div></div>'
            '<div class="grp"><b>⌄ Vehicle</b><div><span>Model year</span><span>2020</span></div><div><span>VIN</span><span class="mono">4V4NC9EH7LN758560</span></div><div><span>Mileage</span><span>413,104 mi</span></div><div><span>Engine serial</span><span class="mono">D13-1186402</span></div></div>'
            '<div class="grp sh2"><b>› Customer</b><span class="mu">Summit Freightways</span></div><div class="grp sh2"><b>› People</b><span class="mu">MR</span></div><div class="grp sh2"><b>› Schedule</b><span class="mu">Today 12:59</span></div>')
    return '<div class="frame ta">' + hd + '<div class="tcols"><div class="tl">' + tlist() + '</div><div class="tc">' + bc + ops + '</div><div class="tr">' + rail + "</div></div></div>"

CHANGES = [("Operations", "one-line rows like the RO page — status, #, title, job type, time, bar, who, status pill, ⋯; the open one unfolds below its row"),
           ("Header", "the RO page’s bar: RO number, ⌃ ⌄ through Mike’s ROs, time / parts / notes / files counts, ⋯ for print and copy"),
           ("Clock card", "the same card, no green tint; Quoted, Burnt, Left, Efficiency the same size and place"),
           ("Tabs", "Time · Parts · Files with the RO page’s actions on the right; parts as the RO page’s table with prices and status pills"),
           ("Right rail", "the RO page’s truck card, stage track, Who has it, and the details groups (Vehicle, Customer, People, Schedule, Case)"),
           ("Kept from Technician", "the left list (Sent to you, Working, Assigned in the foreman’s order, Waiting), Ask Frank, Next up after a stop, the clock-in state")]

# ---------------------------------------------------------------- the questions
QS = [("A · The ROs tab", [
        ("a_name", "What the tab says", [("ros", "ROs", "short, matches the count style"), ("rolist", "RO list", "the sidebar’s word"), ("repair", "Repair orders", "")]),
        ("a_scope", "What it opens on", [("page", "This page’s ROs, with chips", "Foreman: in the shop · Parts: parts to get · Triage: the writer’s · Technician: Mike’s · Manager: every open RO — an All open chip on each"), ("all", "Every open RO", "the same list on every page"), ("mine", "My ROs", "whoever is signed in")]),
        ("a_click", "Clicking an RO", [("pane", "Opens in this page’s own pane", "you stay on Foreman, Parts…"), ("ro", "Opens the RO page", "Back returns to the tab"), ("peek", "The RO list’s side pane", "the same pane as the RO list page")]),
        ("a_cols", "Its columns", [("shared", "My RO list layout, everywhere", "drag or add a column once, it follows you"), ("own", "Each page its own", "Parts shows parts columns, Foreman bays and tech"), ("own2", "Each page its own, starting from mine", "")]),
        ("a_pos", "Where the tab sits", [("last", "Last", "after the page’s own views"), ("first", "First", "")])]),
      ("B · One RO view", [
        ("b_shared", "How it’s built", [("one", "One RO view, shared", "the RO page and the Technician page draw the same thing — a fix on one is on both"), ("skin", "Restyle the Technician page only", "two copies stay")]),
        ("b_layout", "On the Technician page", [("three", "List · RO · rail (3 columns)", "as drawn"), ("fold", "The list folds away when an RO is open", "RO page full width; ⌃ ⌄ moves through Mike’s ROs"), ("drop", "The list as a drop-down in the bar", "")]),
        ("b_keep", "Technician-only pieces", [("all", "Keep them all, in the RO page’s style", "Sent to you, Next up, Ask Frank, Fixed before, clock-in"), ("some", "Only Sent to you and Next up", ""), ("none", "None — the RO page as it is", "")]),
        ("b_phone", "On a phone", [("same", "The same RO view, stacked", "rail under the operations"), ("keep", "Keep the phone as it is", "")])])]

DATA = json.dumps([[sec, [[k, t, [[o[0], o[1]] for o in opts]] for k, t, opts in items]] for sec, items in QS])
def qhtml(items): return "".join('<div class="q"><b>%s</b><div class="ol">%s</div></div>' % (e(t), "".join('<button class="opt" data-k="%s" data-v="%s" aria-pressed="false"><i></i><span><b>%s</b>%s</span></button>' % (k, ok, e(lab), ('<small>' + e(note) + '</small>') if note else "") for ok, lab, note in opts)) for k, t, opts in items)

CSS = open(os.path.join(H, "base.css"), encoding="utf-8").read() + open(os.path.join(H, "mock.css"), encoding="utf-8").read()
PV = ":root{" + "".join("--p%s:url(%s);" % (k, v) for k, v in PICS.items()) + "}"
BODY = ('<section class="sec"><h2>A · The RO list on every page <small>a ROs tab beside each page’s own views</small></h2>'
        '<div class="strips">' + "".join(strip(*p) for p in PAGES) + "</div>"
        '<h3 class="cap">Foreman with the ROs tab open — the RO list, the page’s own pane</h3>' + frame_foreman() + '<div class="qs">' + qhtml(QS[0][1]) + "</div></section>"
        '<section class="sec"><h2>B · The Technician page’s RO, the RO page’s way <small>same information, one look</small></h2>'
        '<div class="cmp"><div><h3 class="cap">Now</h3>' + tech_now() + '</div><div><h3 class="cap">After</h3>' + tech_after() + "</div></div>"
        '<div class="chg">' + "".join('<div><b>%s</b><span>%s</span></div>' % (e(a), e(c)) for a, c in CHANGES) + '</div><div class="qs">' + qhtml(QS[1][1]) + "</div></section>")

JS = r'''
var D=document,$=function(s,r){return (r||D).querySelector(s)},$$=function(s,r){return [].slice.call((r||D).querySelectorAll(s))};
var V={th:'ivory',picks:false,v:{},note:''};
try{ var sv=JSON.parse(localStorage.getItem('pk143')||'{}'); if(sv.v) V.v=sv.v; if(sv.note) V.note=sv.note; if(sv.th) V.th=sv.th; }catch(e){}
function save(){ try{ localStorage.setItem('pk143',JSON.stringify({v:V.v,note:V.note,th:V.th})); }catch(e){} }
function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
function pkText(){ var L=['Parsec · RO list on every page + one RO view — my picks'];
  DATA.forEach(function(sec){ var rows=[]; sec[1].forEach(function(it){ var v=V.v[it[0]]; if(!v) return; var lab=(it[2].filter(function(o){return o[0]===v})[0]||[])[1]||v; rows.push('· '+it[1]+': '+lab); });
    if(rows.length){ L.push(sec[0]+':'); L=L.concat(rows); } });
  var left=DATA.reduce(function(a,s){return a+s[1].filter(function(it){return !V.v[it[0]]}).length},0); if(left) L.push('(not picked yet: '+left+')');
  if(V.note.trim()) L.push('Notes: '+V.note.trim()); return L.join('\n'); }
function sync(){ $$('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-th')===V.th)); }); D.documentElement.setAttribute('data-th',V.th);
  $$('.opt').forEach(function(b){ b.setAttribute('aria-pressed',String(V.v[b.getAttribute('data-k')]===b.getAttribute('data-v'))); });
  var n=Object.keys(V.v).length, t=DATA.reduce(function(a,s){return a+s[1].length},0); $('#pk-n').textContent=n?n+'/'+t:''; }
function pkDraw(){ var w=$('#picks'); w.hidden=!V.picks; if(!V.picks) return; var ta=$('#pk-note'); if(ta&&D.activeElement===ta){ $('#picks pre').textContent=pkText(); return; }
  w.innerHTML='<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">✕</button></div><pre>'+esc(pkText())+'</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. Parts’ ROs tab should show the PO column">'+esc(V.note)+'</textarea></div><button class="btn pri" data-pk="copy">Copy for the chat</button>'; }
function toast(m){ var t=$('.toast'); if(t) t.remove(); t=D.createElement('div'); t.className='toast'; t.textContent=m; D.body.appendChild(t); clearTimeout(toast.h); toast.h=setTimeout(function(){t.remove()},2600); }
D.addEventListener('click',function(ev){ var t=ev.target,b;
  if((b=t.closest('.mk button[data-th]'))){ V.th=b.getAttribute('data-th'); save(); sync(); return; }
  if(t.closest('#pk-open')){ V.picks=!V.picks; pkDraw(); return; }
  if((b=t.closest('[data-pk]'))){ var a=b.getAttribute('data-pk'); if(a==='x'){ V.picks=false; pkDraw(); }
    if(a==='copy'){ var tx=pkText(); (navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).then(function(){toast('Copied — paste it in the chat.')},function(){ var ta=D.createElement('textarea'); ta.value=tx; D.body.appendChild(ta); ta.select(); try{D.execCommand('copy'); toast('Copied — paste it in the chat.');}catch(e){} ta.remove(); }); } return; }
  if((b=t.closest('.opt'))){ var k=b.getAttribute('data-k'), v=b.getAttribute('data-v'); if(V.v[k]===v) delete V.v[k]; else V.v[k]=v; save(); sync(); if(V.picks) pkDraw(); return; }
});
D.addEventListener('input',function(ev){ if(ev.target.id==='pk-note'){ V.note=ev.target.value; save(); var p=$('#picks pre'); if(p) p.textContent=pkText(); } });
D.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&V.picks){ V.picks=false; pkDraw(); } });
sync();
'''
HTML = ('<!doctype html><html lang="en" data-th="ivory"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Parsec · RO list everywhere, one RO view</title><style>' + PV + CSS + '</style></head><body>'
        '<div class="mk"><h1><svg class="lg" viewBox="-110 -110 220 220" aria-hidden="true"><circle class="c" r="14"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/><circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/></svg>Parsec <small>RO list everywhere · one RO view</small></h1>'
        '<div class="seg" role="group" aria-label="Theme"><button data-th="ivory" aria-pressed="true">Ivory</button><button data-th="graphite" aria-pressed="false">Graphite</button></div><button class="btn sm pri" id="pk-open">Your picks <em id="pk-n"></em></button></div>'
        '<main class="wrap">' + BODY + '</main><div id="picks" hidden></div><script>var DATA=' + DATA + ';' + JS + '</script></body></html>')
open(OUT, "w", encoding="utf-8").write(HTML); open(os.path.join(H, "out.html"), "w", encoding="utf-8").write(HTML)
print("wrote", OUT, len(HTML) // 1024, "KB")
