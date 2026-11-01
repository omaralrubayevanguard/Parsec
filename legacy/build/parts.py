# Shared HTML snippets for Parsec previews and the RO-page mock-up.
# Icons are Parsec's own stroke set (24 grid, 1.6 stroke, round caps), copied from the app's SF table.
SF_DOC = '<path d="M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M13.5 3.75V8.5h4.75"/>'
SF_BOX = '<path d="M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z"/><path d="M4.5 7.5l7.5 4 7.5-4M12 11.5v9"/>'
ICONS = {
 "console": '<rect x="3.75" y="3.75" width="7" height="7" rx="2"/><rect x="13.25" y="3.75" width="7" height="7" rx="2"/><rect x="3.75" y="13.25" width="7" height="7" rx="2"/><rect x="13.25" y="13.25" width="7" height="7" rx="2"/>',
 "ros": SF_DOC + '<path d="M8.5 12.5h7M8.5 16h4.5"/>',
 "foreman": '<rect x="5" y="4.75" width="14" height="15.5" rx="2.5"/><path d="M9.5 4.75V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.75M8.75 10.5h6.5M8.75 14h6.5M8.75 17.25h3.5"/>',
 "manager": '<circle cx="9.25" cy="8.25" r="3.25"/><path d="M3.5 19.5c0-3.2 2.6-5.25 5.75-5.25s5.75 2.05 5.75 5.25"/><path d="M15.5 5.3a3.2 3.2 0 0 1 0 5.9M17.2 14.6c2 .6 3.3 2.2 3.3 4.4"/>',
 "triage": '<rect x="3.5" y="7.5" width="17" height="12.25" rx="2.75"/><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M12 10.75v5.5M9.25 13.5h5.5"/>',
 "timelog": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.25V12l3.25 1.9"/>',
 "parts": SF_BOX,
 "career": '<path d="M5 19.5v-5M10 19.5v-11M15 19.5v-7.5M20 19.5V5"/>',
 "warranty": '<path d="M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z"/><path d="M8.9 12.1l2.2 2.2 4.1-4.4"/>',
 "fixes": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
 "newRo": '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
 "gear": '<path d="M4 8h8.5M17 8h3M4 16h3M11.5 16H20"/><circle cx="14.75" cy="8" r="2.25"/><circle cx="9.25" cy="16" r="2.25"/>',
 "bell": '<path d="M6 16.75V11a6 6 0 0 1 12 0v5.75l1.5 1.5h-15z"/><path d="M10 20.5a2.25 2.25 0 0 0 4 0"/>',
 "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
 "plus": '<path d="M12 5v14M5 12h14"/>',
 "play": '<path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z"/>',
 "stop": '<rect x="6" y="6" width="12" height="12" rx="2.75"/>',
 "swap": '<path d="M7 7.5h12.5L16 4M17 16.5H4.5L8 20"/>',
 "user": '<circle cx="12" cy="8" r="3.75"/><path d="M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75"/>',
 "print": '<path d="M7 9V4.5h10V9"/><rect x="3.75" y="9" width="16.5" height="7.5" rx="2"/><path d="M7 14.5h10v5H7z"/>',
 "trash": '<path d="M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5"/>',
 "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 "keyTag": '<circle cx="8" cy="15.5" r="4"/><path d="M10.9 12.6l8.6-8.6M16.5 7l2.5 2.5M14 9.5l2 2"/>',
 "history": '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75"/><path d="M12 8.5V12l2.5 1.5"/>',
 "save": '<path d="M5.5 4h10.2L20 8.3v10.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4z"/><path d="M8 4v4.5h7V4M8 20v-6h8v6"/>',
 "addJob": SF_DOC + '<path d="M12 11v6M9 14h6"/>',
 "addPart": SF_BOX + '<path d="M19 15v6M16 18h6"/>',
 "pencil": '<path d="M4.75 19.25l1-4L15.6 5.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L8.75 18.25z"/><path d="M14 7l3 3"/>',
 "note": '<path d="M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z"/><path d="M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5"/>',
 "copy": '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 "eye": '<path d="M2.75 12S6 5.75 12 5.75 21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z"/><circle cx="12" cy="12" r="3"/>',
 "clip": '<path d="M19.4 11.2l-7.1 7.2a4.4 4.4 0 0 1-6.2-6.2l7.6-7.6a2.9 2.9 0 0 1 4.1 4.1l-7.3 7.3a1.4 1.4 0 0 1-2-2l6.6-6.6"/>',
 "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 "x": '<path d="M6 6l12 12M18 6L6 18"/>',
 "unit": '<path d="M2.75 16.5V7.25A1.5 1.5 0 0 1 4.25 5.75h9.25v10.75M13.5 9.25h3.6a1.5 1.5 0 0 1 1.2.6l2.2 2.9a1.5 1.5 0 0 1 .3.9v2.85h-2"/><circle cx="7" cy="17.25" r="2"/><circle cx="16.5" cy="17.25" r="2"/><path d="M9 17.25h5.5"/>',
 "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>',
 "moon": '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
 "chat": '<path d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z"/>',
 "exit": '<path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 8l-4 4 4 4M6 12h9"/>',
 # intentional additions, drawn on the same grid and stroke
 "chevD": '<path d="M6.5 9.5L12 15l5.5-5.5"/>',
 "chevU": '<path d="M6.5 14.5L12 9l5.5 5.5"/>',
 "chevR": '<path d="M9.5 6.5L15 12l-5.5 5.5"/>',
 "more": '<path d="M5.5 12h.01M12 12h.01M18.5 12h.01" stroke-width="2.4"/>',
 "inbox": '<path d="M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5"/>',
 "sidebar": '<rect x="3.75" y="4.75" width="16.5" height="14.5" rx="2.75"/><path d="M9.5 4.75v14.5"/>',
 "link": '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
}
def ic(name, cls="px-ico", extra=""):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true"{extra}>{ICONS[name]}</svg>'

# Status icons: the SHAPE names the family, the colour names who it waits on.
def si(s, live=False, color=None):
    ring = '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5"/>'
    body = {
     "hold": ring,
     "working": ring + '<path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>',
     "parts": '<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>',
     "roadtest": ring + '<path d="M7 3.5a3.5 3.5 0 1 1-3.5 3.5H7z" fill="currentColor"/>',
     "released": '<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M4.4 7.2l1.8 1.8 3.5-3.7" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
     "declined": '<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M5 5l4 4M9 5l-4 4" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round"/>',
    }
    body["foreman"] = body["customer"] = body["support"] = body["parts"]
    return f'<svg class="px-si" data-s="{color or s}" viewBox="0 0 14 14" aria-hidden="true">{body[s]}</svg>'

# Part statuses reuse the same shapes: ring = not started, dashed = waiting, half = in hand, check = done.
PART_STATUSES = [("notordered","Not ordered","hold",None),("ordered","Ordered","parts",None),("backordered","Backordered","parts","problem"),
                 ("received","Received","working",None),("installed","Installed","released",None)]
def psi(k):
    shape, col = {p[0]: (p[2], p[3]) for p in PART_STATUSES}[k]
    return si(shape, color=col)
def pname(k):
    return {p[0]: p[1] for p in PART_STATUSES}[k]
def pstat(k):
    return f'<button class="px-pstat" data-pstat="{k}" title="Part status and options">{psi(k)}<span>{pname(k)}</span>{ic("chevD","px-ico px-chev")}</button>'
def part_row(pid, d, pn, q, k):
    return f'<div class="px-li px-li--part" data-part="{pid}"><span>{d}</span><span class="px-id px-muted">{pn}</span><span class="r">{q}</span>{pstat(k)}</div>'
def part_menu(cur="received"):
    items = "".join(f'<button class="px-menu__item{" is-on" if k==cur else ""}" data-set="{k}">{psi(k)}<span>{nm}</span>'
                    + (ic("check","px-ico px-menu__tick") if k == cur else f'<span class="px-kbd">{i+1}</span>') + '</button>'
                    for i, (k, nm, *_ ) in enumerate(PART_STATUSES))
    return f'''<div class="px-pop px-pmenu">
  <div class="px-menu__group">Part status</div>{items}
  <div class="px-menu__sep"></div>
  <button class="px-menu__item" data-pact="edit">{ic("pencil")}Edit part…<span class="px-kbd">E</span></button>
  <button class="px-menu__item" data-pact="copy">{ic("copy")}Copy part number</button>
  <button class="px-menu__item" data-pact="move">{ic("swap")}Move to operation…</button>
  <div class="px-menu__sep"></div>
  <button class="px-menu__item px-menu__item--danger" data-pact="remove">{ic("trash")}Remove part</button>
</div>'''

STATUSES = [  # key, name, description, sub-reasons, shortcut
 ("hold","Hold tech","On the board, nothing being worked",[],"1"),
 ("working","Working","Being worked right now",["Diagnosing","Repairing","Inspecting","Testing"],"2"),
 ("parts","Waiting – Parts","Held on a part that is out",["Not ordered","Ordered","Backordered","Received"],"3"),
 ("foreman","Waiting – Foreman","Held on the foreman",[],"4"),
 ("support","Waiting – Tech support","Case open with tech support",["Case opened","Awaiting reply","Escalated"],"5"),
 ("customer","Waiting – Customer","Held on customer approval",["Estimate sent","Approval pending","Declined work"],"6"),
 ("roadtest","Complete – Road test","Work done, road testing",[],"7"),
 ("released","Complete – Released","Finished and turned in",[],"8"),
 ("declined","Declined","Customer declined the work",[],"9"),
]

LOGO = ('<svg viewBox="-110 -110 220 220" aria-hidden="true"><circle class="c" r="14"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/>'
        '<circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/>'
        '<circle cy="-84" r="7" class="o"/><circle cy="84" r="7" class="o"/><circle cx="73" cy="42" r="7" class="o"/><circle cx="-73" cy="42" r="7" class="o"/>'
        '<circle cx="73" cy="-42" r="7" class="o"/><circle cx="-73" cy="-42" r="7" class="o"/></svg>')

def n(x):  # walkthrough anchor
    return f' data-n="{x}"' if x else ''

def sidebar(active="ros", wt=True, running=False):
    def a(key, label, icon, count=""):
        on = ' class="is-on"' if key == active else ''
        c = f'<span class="n">{count}</span>' if count else ''
        return f'<a{on} data-page="{key}">{ic(icon)}{label}{c}</a>'
    return f'''<aside class="px-side"{n(1 if wt else 0)}>
  <div class="px-brand">{LOGO}Parsec<button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Collapse sidebar">{ic("sidebar")}</button></div>
  <button class="px-search" data-cmd>{ic("search")}Search or jump to…<span class="px-kbd">⌘K</span></button>
  <div class="px-clockin" data-clockin{n(14 if wt else 0)}><span class="dot"></span><div>On the clock<b class="px-num">since 6:58</b></div><button class="px-btn px-btn--sm">Clock out</button>
    <div class="px-clockin__job" data-clockin-job{"" if running else " hidden"}><span class="px-clockin__live"></span><small data-clockin-what>RO-37538 · Op 1</small><span class="px-clockin__v" data-clockin-t>6:15:57</span><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Stop clock" data-clockin-stop>{ic("stop")}</button><b data-clockin-name>Clutch slipping – replace clutch</b></div></div>
  <nav class="px-nav">
    {a("inbox","Inbox","inbox","27")}
    {a("console","Console","console")}
    {a("triage","Triage","triage","5")}
    {a("ros","RO list","ros","12")}
    <div class="px-nav__h">Shop</div>
    {a("foreman","Foreman","foreman")}
    {a("warranty","Warranty","warranty","3")}
    {a("manager","Manager","manager")}
    {a("parts","Parts","parts")}
    <div class="px-nav__h">You</div>
    {a("timelog","Time log","timelog")}
    {a("fixes","Fixes","fixes")}
    {a("career","Career","career")}
  </nav>
  <div class="px-side__foot">
    <nav class="px-nav">{a("settings","Settings","gear")}</nav>
    <div class="px-me"><span class="px-av px-av--md px-av--me">MR</span><div>Mike Rodriguez<small>Technician</small></div></div>
  </div>
</aside>'''

def header(wt=True, totals=True):
    return f'''<header class="px-head"{n(2 if wt else 0)}>
  <div class="px-crumb"><a>RO list</a><span class="sl">/</span><b class="px-id">RO-37538</b></div>
  <div class="px-head__pager"><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Previous RO (K)">{ic("chevU")}</button><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Next RO (J)">{ic("chevD")}</button><span>4 of 12</span></div>
  <div class="px-head__acts">
    {totals_bar(wt) if totals else ""}
    <button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Copy link">{ic("link")}</button>
    <button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Print">{ic("print")}</button>
    <button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Options" data-opts>{ic("more")}</button>
  </div>
</header>'''

# ---------- RO totals (header chips + their modals) ----------
PARTS_D = {1: [("1-1","Clutch kit, 15.5 in","85136213","1","received"),("1-2","Clutch release bearing","21515427","1","installed")],
           2: [("2-1","Inner wheel seal, right rear","21422645","1","notordered")],
           3: [("3-1","Oil filter","21707134","2","received"),("3-2","Fuel filter kit","23658092","1","ordered")]}
FILES_D = {1: [("flywheel-scoring.jpg","Picture","Oct 19"),("clutch-disc.jpg","Picture","Oct 19")], 2: [("rr-seal-leak.jpg","Picture","Oct 20")], 3: []}
ROFILES_D = [("dash-photo.jpg","Dash photo","Oct 6"),("dtc-report.pdf","DTC upload","Oct 6"),("estimate-v1.pdf","Estimate","Oct 6")]
IN_HAND = ("received", "installed")

def ro_totals():
    q = sum(float(d["q"]) for d in OPDATA.values()); b = sum(float(d["b"]) for d in OPDATA.values())
    wq = sum(float(d["q"]) for d in OPDATA.values() if float(d["b"]) > 0)
    allp = [x for v in PARTS_D.values() for x in v]
    return dict(q=q, b=b, left=sum(max(0, float(d["q"]) - float(d["b"])) for d in OPDATA.values()),
                eff=round(wq / b * 100) if b else None, parts=len(allp), inhand=sum(1 for x in allp if x[4] in IN_HAND),
                files=len(ROFILES_D) + sum(len(v) for v in FILES_D.values()))

def totals_bar(wt=True, live=False):
    t = ro_totals()
    return f'''<div class="px-totals" role="group" aria-label="Totals for this RO"{n(13 if wt else 0)}>
      <button class="px-total{" is-live" if live else ""}" data-total="time" title="Time on this RO · click for the breakdown" aria-label="Time: {t["b"]:.2f} of {t["q"]:.2f} hours quoted. Open breakdown">{ic("clock")}<span><b data-tt="burnt">{t["b"]:.2f}</b><em>/ <span data-tt="quoted">{t["q"]:.2f}</span> h</em></span></button>
      <button class="px-total" data-total="parts" title="Parts on this RO · click for the list" aria-label="Parts: {t["inhand"]} of {t["parts"]} in hand. Open list">{ic("parts")}<span><b data-tt="inhand">{t["inhand"]}</b><em>/ <span data-tt="nparts">{t["parts"]}</span></em></span></button>
      <button class="px-total" data-total="files" title="Files on this RO · click for the list" aria-label="Files: {t["files"]}. Open list">{ic("clip")}<span><b data-tt="nfiles">{t["files"]}</b></span></button>
    </div><span class="px-head__sep" aria-hidden="true"></span>'''

def title_block(status="hold", sub="", wt=True):
    nm = dict((k, v) for k, v, *_ in STATUSES)[status]
    subtxt = f'<span class="px-status__sub">· {sub}</span>' if sub else ''
    return f'''<div{n(3 if wt else 0)}>
  <div class="px-ro__eyebrow"><span class="px-id">RO-37538</span><span>·</span><span>Opened Oct 6</span><span>·</span><span>15 days open</span></div>
  <h1 class="px-ro__title">Blue Ridge Haulage</h1>
  <div class="px-ro__sub">2020 Volvo VNL · Unit 4417 · Lot D5</div>
  <div class="px-ro__status">
    <button class="px-status--button" data-status-btn>{si(status)}<span data-status-name>{nm}</span>{subtxt}{ic("chevD","px-ico px-chev")}</button>
    <span class="px-with">with <span class="px-av">MR</span> Mike Rodriguez · 15d 17h</span>
  </div>
</div>'''

STAGES = [("checkin","Check-in","done"),("diag","Diag","skip"),("approval","Approval","wait"),("parts","Parts","done"),
          ("repair","Repair","now"),("roadtest","Road test",""),("closeout","Close-out","")]
def stage(wt=True):
    segs = "".join(f'<button class="px-stage__seg{" is-"+s if s else ""}" data-stage="{k}"><i></i><span>{lbl}</span></button>' for k, lbl, s in STAGES)
    return f'''<div class="px-stage" style="margin-top:32px"{n(4 if wt else 0)}>
  <div class="px-stage__top"><b>Repair</b><span>· stage 5 of 7</span><span>· approval still open on 1 operation</span><span class="px-stage__eta">Ready about Thu, Oct 22 · 10:04</span></div>
  <div class="px-stage__track">{segs}</div>
</div>'''

def stagepop():
    return f'''<div class="px-pop px-stagepop">
  <h4>Approval</h4><p>Done when every customer-pay operation is approved or declined.</p>
  <label class="px-check is-on"><i></i><span>Estimate reviewed</span></label>
  <label class="px-check"><i></i><span>Estimate sent</span></label>
  <label class="px-check"><i></i><span>Customer approved</span></label>
</div>'''

def nextstep(wt=True):
    """The Next card — lives at the top of the RO details pane, above Schedule."""
    return f'''<div class="px-next" data-next{n(5 if wt else 0)}>
  <div class="px-next__head"><span class="px-next__k">Next</span><span class="px-next__for">Operation 2 · Wheel seal</span></div>
  <div class="px-next__body" data-next-body>
    <p class="px-next__t">Operation 2 isn’t approved yet — send the estimate.</p>
    <div class="px-next__acts"><button class="px-btn px-btn--sm" data-next-act="pending">Approval pending</button><button class="px-btn px-btn--accent px-btn--sm" data-next-act="sent">Estimate sent</button></div>
  </div>
</div>'''

OPDATA = {
 1: dict(clock="6:15:57", entries="3 entries", pct=78.4, q="8.00", b="6.27", left="1.73", eff="128", effcls="px-good"),
 2: dict(clock="0:00:00", entries="no time yet", pct=0, q="2.40", b="0.00", left="2.40", eff="—", effcls=""),
 3: dict(clock="0:00:00", entries="no time yet", pct=0, q="1.50", b="0.00", left="1.50", eff="—", effcls=""),
}
def timecard(live=False, wt=True, opn=1):
    d = OPDATA[opn]
    go = ic("stop") if live else ic("play")
    cap = 'Clock running · Repairing' if live else f'On this operation · {d["entries"]}'
    effu = '<small>%</small>' if d["eff"] != "—" else ''
    return f'''<div class="px-time{' is-live' if live else ''}"{n(7 if wt else 0)}>
  <div class="px-time__top">
    <div><div class="px-time__clock" data-clock>{d["clock"]}</div><div class="px-time__cap" data-clock-cap>{cap}</div></div>
    <button class="px-btn px-btn--primary px-time__go" title="Start clock (S)" data-go>{go}</button>
  </div>
  <div class="px-bar"><div class="px-bar__fill" data-bar style="width:{d["pct"]}%"></div><div class="px-bar__q" style="left:calc(100% - 2px)"></div></div>
  <div class="px-time__stats">
    <div><span>Quoted</span><b>{d["q"]}<small>h</small></b></div>
    <div><span>Burnt</span><b><span data-burnt>{d["b"]}</span><small>h</small></b></div>
    <div><span>Left</span><b><span data-left>{d["left"]}</span><small>h</small></b></div>
    <div><span>Efficiency</span><b class="{d["effcls"]}"><span data-eff>{d["eff"]}</span>{effu}</b></div>
  </div>
</div>'''

def tabs(on="time"):
    t = [("time","Time","3"),("parts","Parts","2/2"),("notes","Notes",""),("files","Files","2")]
    return '<div class="px-tabs" role="tablist">' + "".join(
        f'<button class="px-tab{" is-on" if k==on else ""}" data-tab="{k}">{lbl}{f"<span class=px-tab__n>{c}</span>" if c else ""}</button>' for k, lbl, c in t) + '</div>'

def time_entries(hidden=False):
    rows = [("Mon, Oct 19","7:32 – 11:05","Repairing","3:33"),("Mon, Oct 19","12:10 – 13:41","Repairing","1:31"),("Tue, Oct 20","7:30 – 8:42","Repairing","1:12")]
    return f'<div class="px-list" data-pane="time"{" hidden" if hidden else ""}>' + "".join(
        f'<div class="px-li px-li--time"><span>{d}</span><span class="px-num px-muted">{t}</span><small>{r}</small><span class="r">{dur}</span><span class="px-av">MR</span></div>' for d, t, r, dur in rows) + \
        f'<button class="px-add">{ic("plus")}Add time entry</button></div>'

def parts_list(hidden=True):
    rows = [("1-1","Clutch kit, 15.5 in","85136213","1","received"),("1-2","Clutch release bearing","21515427","1","installed")]
    h = ' hidden' if hidden else ''
    return f'<div class="px-list" data-pane="parts"{h}>' + "".join(part_row(*r) for r in rows) + \
        f'<button class="px-add">{ic("plus")}Add part</button></div>'

def notes_pane(hidden=True):
    h = ' hidden' if hidden else ''
    return f'<div data-pane="notes"{h}><textarea class="px-input" style="width:100%">Removed transmission. Clutch disc worn to the rivets, flywheel scored — resurfaced. Installing new clutch kit. (Oct 20 · 8:40)</textarea></div>'

def files_pane(hidden=True):
    h = ' hidden' if hidden else ''
    return f'<div class="px-list" data-pane="files"{h}>' + "".join(
        f'<div class="px-li px-li--part"><span style="display:flex;gap:10px;align-items:center">{ic("clip")}{f}</span><span class="px-muted">{k}</span><span></span><small>{w}</small></div>' for f, k, w in
        FILES_D[1]) + '</div>'

OPS = [  # n, title, type, status, time, mini %, over, meta, who
 (1,"Clutch slipping – replace clutch","OP","hold","6.27","8.00",78,False,"","MR"),
 (2,"Wheel seal leaking","OP","customer","0.00","2.40",0,False,"1 part not ordered","MR"),
 (3,"PM service – A","PM","hold","0.00","1.50",0,False,"","MR"),
]
def op_row(o, on=False):
    num, t, typ, s, b, q, pct, over, meta, who = o
    m = f'<span class="px-row__m">{meta}</span>' if meta else ''
    return (f'<button class="px-row{" is-on" if on else ""}" data-op="{num}">{si(s)}<span class="px-row__n">{num}</span>'
            f'<span class="px-row__t">{t}</span>{m}<span class="px-tag" data-t="{typ}">{typ}</span>'
            f'<span class="px-row__time">{b} <em>/ {q} h</em></span><span class="px-mini"><i style="width:{pct}%"></i></span><span class="px-av">{who}</span></button>')

def ops_section(open_n=1, live=False, wt=True):
    rows = []
    for o in OPS:
        rows.append(op_row(o, on=(o[0] == open_n)))
        if o[0] == open_n:
            rows.append(f'''<div class="px-op" data-op-body>
  {timecard(live, wt)}
  <div>{tabs("parts")}<div style="margin-top:4px"{n(11 if wt else 0)}>{time_entries(True)}{parts_list(False)}{notes_pane()}{files_pane()}</div></div>
</div>''')
    return f'''<div class="px-sec"><h3>Operations</h3><span class="n">3</span><button class="px-btn px-btn--ghost px-btn--sm">{ic("plus")}Add operation</button></div>
<div class="px-ops"{n(6 if wt else 0)}>{"".join(rows)}</div>'''

def props(wt=True, closed=("paperwork", "money")):
    """RO details: five collapsible groups. Closed groups show a one-line summary instead of their rows."""
    def p(lbl, val, cls="", copy=False):
        c = (f'<button class="px-copy" title="Copy" data-copy="{copy}">{ic("copy")}{ic("check")}</button>') if copy else ""
        return f'<div class="px-prop"><span>{lbl}</span><b class="{cls}">{val}</b>{c}</div>'
    def g(key, title, summary, rows, action=""):
        op = "" if key in closed else " is-open"
        return (f'<section class="px-pg{op}" data-pg="{key}"><div class="px-pg__h" data-pg-toggle>'
                f'{ic("chevD","px-ico px-pg__chev")}<span class="px-pg__t">{title}</span><span class="px-pg__sum">{summary}</span>{action}</div>'
                f'<div class="px-pg__b"><div class="px-pg__in">{rows}</div></div></section>')
    return f'''<div class="px-props"{n(8 if wt else 0)}>
  {g("schedule","Schedule","Thu, Oct 22 · 10:04", p("Ready about","Thu, Oct 22 · 10:04")+p("Promised","Add date","px-empty")+p("Days open","15","px-num"))}
  {g("people","People","MR · DK", '<div class="px-prop"><span>Technician</span><b><span class="px-av">MR</span>Mike Rodriguez</b></div><div class="px-prop"><span>Advisor</span><b><span class="px-av">DK</span>Dana Kowalski</b></div>', '<button class="px-link px-pg__act" data-transfer>Transfer…</button>')}
  {g("vehicle","Vehicle","Unit 4417 · 616,000 mi", p("VIN",'<span class="px-id">4V4NC9EH9LN891160</span>',copy="4V4NC9EH9LN891160")+p("Unit","4417")+p("Mileage","616,000 mi","px-num")+p("Engine hours","18,240 h","px-num")+p("Key tag",'<span class="px-id">112</span>')+p("Location","Lot D5"))}
  {g("paperwork","Paperwork","Opened Oct 6 · no case", p("Case #","Add case","px-empty")+'<div class="px-prop"><span>Warranty</span><b><button class="px-toggle" data-toggle aria-label="Warranty RO"></button></b></div>'+p("Opened","Tue, Oct 6, 2026")+p("Closed","—","px-empty"))}
  {g("money","Money","$3,276.50", p("Labor","11.90 h · $2,499.00","px-num")+p("Parts","$777.50","px-num")+p("Estimate",'<span class="px-num">$3,276.50</span>'))}
</div>'''

def details(wt=True):
    """The RO details pane: Next card, then the property groups — sized to fit without scrolling."""
    return f'<aside class="px-ro__rail" data-rail>{nextstep(wt)}{props(wt)}</aside>'

# ---------- Modals ----------
def modal(kind_cls, title, sub, body, foot, n_attr=""):
    return f'''<div class="px-scrim" data-scrim><div class="px-modal{kind_cls}" role="dialog" aria-modal="true" aria-label="{title}"{n_attr}>
  <div class="px-modal__h"><div><h2>{title}</h2><p>{sub}</p></div><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" data-close title="Close (Esc)">{ic("x")}</button></div>
  <div class="px-modal__b">{body}</div>
  <div class="px-modal__f">{foot}</div>
</div></div>'''

def modal_transfer(wt=True):
    seg = "".join(f'<button class="{"is-on" if i==0 else ""}">{x}</button>' for i, x in enumerate(["Technician","Approval","Parts","Foreman","Manager","Warranty"]))
    people = [("MR","Mike Rodriguez","Has this RO · 3 ROs · 6.3 h booked",False,True),("LM","Luis Martinez","2 ROs · 4.5 h booked · Bay 6",True,False),("PS","Priya Shah","4 ROs · 9.0 h booked · Body shop",False,False)]
    pick = "".join(f'<button class="px-pick{" is-on" if on else ""}{" is-dis" if dis else ""}" data-pick{" data-autofocus" if on else ""}><span class="px-av px-av--md">{a}</span><span class="px-pick__t"><b>{nm}</b><small>{meta}</small></span><i class="px-radio"></i></button>' for a, nm, meta, on, dis in people)
    body = f'''<div class="px-field"><label>Send to</label><div class="px-seg px-seg--fill">{seg}</div></div>
<div class="px-field"><label>Technician</label><div class="px-picks">{pick}</div></div>
<div class="px-field"><label>Reason</label><button class="px-select" data-select>Tech + bay{ic("chevD","px-ico px-chev")}</button></div>
<div class="px-field"><label>Note</label><textarea class="px-input px-input--full" rows="2" placeholder="Anything they need to know">Clutch is in, needs the hydraulic check and road test — I'm off at 3.</textarea></div>
<label class="px-check-row"><button class="px-toggle is-on" data-toggle aria-label="Ask them to accept first"></button>Ask Luis to accept before it moves</label>'''
    foot = f'<span class="px-modal__hint"><span class="px-kbd">⌘</span><span class="px-kbd">↵</span>to send</span><button class="px-btn px-btn--ghost" data-close>Cancel</button><button class="px-btn px-btn--primary" data-submit="transfer">Transfer RO</button>'
    return modal("", "Transfer RO-37538", "Blue Ridge Haulage · now with Mike Rodriguez", body, foot, n(12) if wt else "")

def modal_addop(wt=True):
    tags = "".join(f'<button class="px-tag{" is-on" if t=="OP" else ""}" data-t="{t}">{t}</button>' for t in ["DIAG","OP","PM","WARR","COMEBACK","SUBLET"])
    body = f'''<div class="px-field"><label>Complaint</label><input class="px-input px-input--full" data-autofocus placeholder="e.g. Air leak at the front axle" value=""></div>
<div class="px-field"><label>Type</label><div class="px-tagpick">{tags}</div></div>
<div style="display:flex;gap:16px">
  <div class="px-field"><label>Quoted</label><div class="px-affix"><input class="px-input" style="width:96px" value="1.50"><span>h</span></div></div>
  <div class="px-field" style="flex:1"><label>Pay</label><div class="px-seg px-seg--fill"><button class="is-on">Customer</button><button>Warranty</button><button>Internal</button></div></div>
</div>
<button class="px-link" style="align-self:flex-start">Start from a standard operation…</button>'''
    foot = f'<span class="px-modal__hint"><span class="px-kbd">⌘</span><span class="px-kbd">↵</span>to add</span><button class="px-btn px-btn--ghost" data-close>Cancel</button><button class="px-btn px-btn--primary" data-submit="addop">Add operation</button>'
    return modal("", "Add operation", "RO-37538 · becomes operation 4", body, foot, n(12) if wt else "")

def modal_delete(wt=True):
    body = '<p class="px-modal__p">This removes 3 operations, 3 time entries, 5 parts and 6 files from Parsec. You’ll have 10 seconds to undo.</p>'
    foot = '<button class="px-btn px-btn--ghost" data-close>Cancel</button><button class="px-btn px-btn--danger px-btn--solid" data-submit="delete">Delete RO</button>'
    return modal(" px-modal--sm", "Delete RO-37538?", "Blue Ridge Haulage · 15 days open", body, foot, n(12) if wt else "")

# ---- totals modals: read-only breakdowns that open from the header chips ----
def _info_foot():
    return '<span class="px-modal__hint"><span class="px-kbd">esc</span>to close</span><button class="px-btn" data-close data-autofocus>Close</button>'

def _grp(label, sub="", goto=None, tab=None):
    inner = f'<b>{label}</b>' + (f'<span>{sub}</span>' if sub else '')
    if goto:
        return f'<button class="px-mgrp" data-goto-op="{goto}"' + (f' data-goto-tab="{tab}"' if tab else '') + f'>{inner}{ic("chevR")}</button>'
    return f'<div class="px-mgrp">{inner}</div>'

def modal_time(wt=True):
    t = ro_totals()
    effc = "px-good" if (t["eff"] or 0) >= 100 else "px-warn"
    effv = f'{t["eff"]}<small>%</small>' if t["eff"] else "—"
    stats = (f'<div class="px-tsum"><div><span>Quoted</span><b>{t["q"]:.2f}<small>h</small></b></div><div><span>Burnt</span><b>{t["b"]:.2f}<small>h</small></b></div>'
             f'<div><span>Left</span><b>{t["left"]:.2f}<small>h</small></b></div><div><span>Efficiency</span><b class="{effc}">{effv}</b></div></div>')
    rows = "".join(f'<button class="px-mrow px-mrow--time" data-goto-op="{num}">{si(s)}<span class="px-mrow__t"><span class="px-mrow__n">{num}</span>{title}</span>'
                   f'<span class="px-mini"><i style="width:{pct}%"></i></span><span class="px-mrow__v">{b} <em>/ {q} h</em></span></button>'
                   for num, title, typ, s, b, q, pct, *_ in OPS)
    body = f'{stats}<div class="px-mlist">{_grp("By operation")}{rows}</div>'
    return modal(" px-modal--md", "Time on RO-37538", f"Blue Ridge Haulage · {len(OPS)} operations", body, _info_foot(), n(13) if wt else "")

def modal_parts(wt=True):
    t = ro_totals()
    allp = [x for v in PARTS_D.values() for x in v]
    cells = "".join(f'<div><span>{psi(k)}{nm}</span><b>{sum(1 for x in allp if x[4]==k)}</b></div>' for k, nm, *_ in PART_STATUSES)
    groups = ""
    for num, title, typ, s, *_ in OPS:
        rows = PARTS_D.get(num, [])
        if not rows: continue
        groups += '<div class="px-mlist">' + _grp(f"Operation {num}", f" · {title}", num, "parts") + "".join(
            f'<button class="px-mrow px-mrow--part" data-goto-op="{num}" data-goto-tab="parts"><span class="px-mrow__t">{d}</span><span class="px-id px-faint">{pn}</span><span class="r">{q}</span>'
            f'<span class="px-pstat-ro">{psi(k)}<span>{pname(k)}</span></span></button>' for pid, d, pn, q, k in rows) + '</div>'
    body = f'<div class="px-tsum px-tsum--5">{cells}</div>{groups}'
    return modal(" px-modal--md", "Parts on RO-37538", f'Blue Ridge Haulage · {t["inhand"]} of {t["parts"]} in hand', body, _info_foot(), n(13) if wt else "")

def _file_row(f, k, w):
    return f'<button class="px-mrow px-mrow--file" data-file="{f}">{ic("clip")}<span class="px-mrow__t">{f}</span><span class="px-faint">{k}</span><small>{w}</small></button>'

def modal_files(wt=True):
    t = ro_totals()
    groups = '<div class="px-mlist">' + _grp("Whole RO", f" · {len(ROFILES_D)}") + "".join(_file_row(*f) for f in ROFILES_D) + '</div>'
    for num, title, typ, s, *_ in OPS:
        rows = FILES_D.get(num, [])
        if not rows: continue
        groups += '<div class="px-mlist">' + _grp(f"Operation {num}", f" · {title}", num, "files") + "".join(_file_row(*f) for f in rows) + '</div>'
    return modal(" px-modal--md", "Files on RO-37538", f'Blue Ridge Haulage · {t["files"]} files', groups, _info_foot(), n(13) if wt else "")

def feed(wt=True):
    return f'''<div class="px-sec"><h3>Activity</h3></div>
<div class="px-feed"{n(9 if wt else 0)}>
  <div class="px-ev"><span class="px-ev__dot">{ic("clock")}</span><span><b>Mike Rodriguez</b> stopped the clock on operation 1 · 1:12</span><time>Tue 8:42</time></div>
  <div class="px-ev"><span class="px-ev__dot">{si("hold")}</span><span><b>Mike Rodriguez</b> set the RO to <b>Hold tech</b></span><time>Tue 8:42</time></div>
  <div class="px-ev"><span class="px-ev__dot">{ic("addJob")}</span><span><b>Dana Kowalski</b> added operation 2 · Wheel seal leaking</span><time>Tue 9:05</time></div>
  <div class="px-ev"><span class="px-av">MR</span><span><b>Mike Rodriguez</b> left a note</span><time>Tue 9:10</time>
    <div class="px-note">Right rear inner wheel seal is weeping onto the shoes. Needs approval before I pull the hub.</div></div>
  <div class="px-composer">{ic("chat")}Leave a note… <button class="px-btn px-btn--sm px-btn--ghost">Send</button></div>
</div>'''

def status_menu(hover="parts", current="hold"):
    rows = []
    for k, nm, desc, subs, key in STATUSES:
        cls = " is-hover" if k == hover else (" is-on" if k == current else "")
        more = ic("chevR","px-ico px-smenu__more") if subs else '<span style="width:16px"></span>'
        rows.append(f'<button class="px-menu__item{cls}">{si(k)}<span>{nm}</span><span class="px-kbd">{key}</span>{more}</button>')
        if k in ("hold","customer","released"): rows.append('<div class="px-menu__sep"></div>')
    subs = dict((k, s) for k, _, _, s, _ in STATUSES)[hover]
    sub = "".join(f'<button class="px-menu__item{" is-on" if i==1 else ""}">{s}</button>' for i, s in enumerate(subs))
    desc = dict((k, d) for k, _, d, _, _ in STATUSES)[hover]
    return f'''<div class="px-smenu"{n(10)}>
  <div class="px-pop"><div class="px-menu__search">{ic("search")}Set status…<span class="px-kbd">S</span></div>{"".join(rows)}</div>
  <div class="px-pop px-sub"><div class="px-menu__group">{desc}</div>{sub}</div>
</div>'''

def options_menu():
    return f'''<div class="px-pop" style="width:240px">
  <button class="px-menu__item">{ic("save")}Save a copy</button>
  <button class="px-menu__item is-hover">{ic("print")}Print<span class="px-kbd">P</span></button>
  <div class="px-menu__sep"></div>
  <button class="px-menu__item">{ic("addJob")}Add operation<span class="px-kbd">O</span></button>
  <button class="px-menu__item">{ic("ros")}Extract operations…</button>
  <button class="px-menu__item">{ic("note")}Add standard operation…</button>
  <button class="px-menu__item">{ic("warranty")}Mark as warranty RO</button>
  <div class="px-menu__sep"></div>
  <button class="px-menu__item px-menu__item--danger">{ic("trash")}Delete RO</button>
</div>'''

def cmd_menu():
    return f'''<div class="px-cmd">
  <div class="px-cmd__in">{ic("search")}<span>4V4NC</span><span class="ph">— search ROs, VINs, customers or type a command</span></div>
  <div class="px-cmd__body">
    <div class="px-menu__group">Repair orders</div>
    <div class="px-cmd__item is-on">{si("hold")}<span class="px-id">RO-37538</span><span>Blue Ridge Haulage</span><span class="px-menu__meta">VIN …891160 · Lot D5</span></div>
    <div class="px-cmd__item">{si("parts")}<span class="px-id">RO-34601</span><span>Carolina Line Freight</span><span class="px-menu__meta">VIN …250799 · Bay 4</span></div>
    <div class="px-menu__group">Actions</div>
    <div class="px-cmd__item">{ic("play")}Start clock on operation 1<span class="px-kbd">S</span></div>
    <div class="px-cmd__item">{ic("swap")}Transfer RO…<span class="px-kbd">T</span></div>
    <div class="px-cmd__item">{ic("addJob")}Add operation<span class="px-kbd">O</span></div>
  </div>
  <div class="px-cmd__foot"><span><span class="px-kbd">↑</span><span class="px-kbd">↓</span>move</span><span><span class="px-kbd">↵</span>open</span><span><span class="px-kbd">esc</span>close</span></div>
</div>'''

def toast():
    return f'<div class="px-toast">{si("parts")}Status set to Waiting – Parts · Ordered<button class="px-toast__act">Undo</button><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" style="color:inherit">{ic("x")}</button></div>'

def ro_page(live=False, wt=True, status="hold", sub=""):
    return f'''<div class="px-app">
{sidebar(wt=wt)}
<section class="px-panel">
{header(wt)}
<div class="px-ro">
  <main class="px-ro__main"><div class="px-ro__col">
    {title_block(status, sub, wt)}
    {stage(wt)}
    {ops_section(1, live, wt)}
    {feed(wt)}
  </div></main>
  {details(wt)}
</div>
</section>
</div>'''
