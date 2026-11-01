# RO list page mock-up on the Parsec design system — three layout options.
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parts as P
from parts import ic, si
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
P.ICONS["sliders"] = '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'
P.ICONS["board"] = '<rect x="3.75" y="4.75" width="4.5" height="14.5" rx="1.5"/><rect x="9.75" y="4.75" width="4.5" height="9.5" rx="1.5"/><rect x="15.75" y="4.75" width="4.5" height="12" rx="1.5"/>'
P.ICONS["list"] = '<path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/><circle cx="4.75" cy="6.5" r=".9"/><circle cx="4.75" cy="12" r=".9"/><circle cx="4.75" cy="17.5" r=".9"/>'
P.ICONS["peek"] = '<rect x="3.75" y="4.75" width="16.5" height="14.5" rx="2.75"/><path d="M14.5 4.75v14.5"/>'
P.ICONS["kit"] = '<path d="M4.5 9.5h15v9a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M9 9.5V7a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 7v2.5M4.5 13.5h15"/>'

STG = ["checkin", "diag", "approval", "parts", "repair", "roadtest", "closeout"]
STGN = {"checkin": "Check-in", "diag": "Diag", "approval": "Approval", "parts": "Parts", "repair": "Repair", "roadtest": "Road test", "closeout": "Close-out"}
TECH = {"MR": "Mike Rodriguez", "LM": "Luis Martinez", "PS": "Priya Shah", "": "Unassigned"}
# no, customer, vehicle, unit, status, sub, stage, tech, spot, days, burnt, quoted, ops, complaint, type, ready, live, warranty, diag?
R = [
 ("37538", "Blue Ridge Haulage", "2020 Volvo VNL", "4417", "hold", "", "repair", "MR", "Lot D5", 15, 6.27, 11.90, 3, "Clutch slipping – replace clutch", "OP", "Thu 10:04", False, False, False),
 ("34601", "Carolina Line Freight", "2019 Volvo VNR", "2210", "parts", "Backordered · due Fri", "parts", "MR", "Yard B2", 9, 1.85, 4.20, 2, "Check engine light – DPF differential pressure high", "DIAG", "Mon 14:00", False, False, True),
 ("35112", "Piedmont Aggregates", "2021 Volvo VHD", "318", "hold", "", "diag", "MR", "Bay 4", 1, 0.42, 1.20, 1, "Air leak at the front axle", "DIAG", "Fri 11:30", False, False, True),
 ("37602", "Triad Cold Chain", "2022 Volvo VNL", "88", "working", "Repairing", "repair", "MR", "Bay 2", 3, 3.10, 5.50, 2, "Alternator not charging – replace alternator", "OP", "Today 15:40", True, False, True),
 ("37590", "Yadkin Valley Logistics", "2018 Volvo VNL", "1204", "customer", "Estimate sent", "approval", "LM", "Lot C3", 4, 1.00, 1.00, 2, "Front brakes grinding – brake job", "OP", "Fri 16:00", False, False, True),
 ("36988", "Old Salem Moving", "2017 Volvo VNM", "61", "support", "Awaiting reply", "diag", "PS", "Bay 6", 11, 4.80, 3.00, 1, "Intermittent no-start, U0100 lost comms with ECM", "WARR", "—", False, True, True),
 ("37420", "Guilford Paving", "2020 Volvo VHD", "902", "parts", "Ordered · due Thu", "parts", "LM", "Yard A4", 6, 0.90, 6.40, 3, "Hydraulic PTO leak at the pump", "OP", "Fri 12:00", False, False, False),
 ("37011", "Catawba Timber", "2019 Volvo VNL", "330", "foreman", "", "repair", "PS", "Bay 5", 8, 7.20, 8.00, 2, "Comeback – coolant loss after head gasket", "COMEBACK", "Thu 17:00", False, False, True),
 ("37555", "Haw River Dairy", "2023 Volvo VNR", "17", "hold", "", "checkin", "", "Lot A1", 0, 0.00, 0.50, 1, "PM service – A", "PM", "Today 13:30", False, False, False),
 ("37489", "Pilot Mountain Express", "2021 Volvo VNL", "5530", "roadtest", "", "roadtest", "MR", "Lot D1", 5, 9.60, 10.50, 4, "Overhead and injector cups", "OP", "Today 12:15", False, False, False),
 ("37544", "Greensboro City Waste", "2020 Volvo VHD", "4061", "working", "Diagnosing", "diag", "LM", "Bay 1", 2, 1.40, 2.00, 1, "Air dryer purging constantly", "DIAG", "Thu 09:30", False, False, True),
 ("37516", "Sandhills Grain", "2019 Volvo VNL", "77", "customer", "Approval pending", "approval", "PS", "Lot B6", 7, 2.20, 2.00, 2, "Steer axle kingpin play", "DIAG", "Mon 10:00", False, False, True),
 ("37301", "Uwharrie Fuel", "2016 Volvo VNL", "12", "released", "", "closeout", "LM", "—", 12, 5.10, 5.50, 2, "Turbo actuator fault – replace actuator", "OP", "Released Tue", False, False, True),
]
STATUS_NAME = dict((k, v) for k, v, *_ in P.STATUSES)
GROUP = {"working": "working", "roadtest": "working", "parts": "waiting", "foreman": "waiting", "support": "waiting", "customer": "waiting", "hold": "hold", "released": "done", "declined": "done"}
DATA = []
for (no, cust, veh, unit, st, sub, stg, tech, spot, days, b, q, nops, cmp, typ, ready, live, warr, hasdiag) in R:
    i = STG.index(stg)
    ticks = []
    for j, k in enumerate(STG):
        if st == "released": ticks.append("done")
        elif j < i: ticks.append("skip" if (k == "diag" and not hasdiag) else "done")
        elif j == i: ticks.append("wait" if st in ("customer", "parts", "support", "foreman") else "now")
        else: ticks.append("")
    DATA.append(dict(id="ro" + no, no=no, cust=cust, veh=veh, unit=unit, st=st, stn=STATUS_NAME[st], sub=sub, stage=stg, stagen=STGN[stg], ticks=ticks, tech=tech, techn=TECH[tech],
                     spot=spot, days=days, b=b, q=q, nops=nops, cmp=cmp, typ=typ, ready=ready, live=live, warr=warr, grp=GROUP[st], si=si(st)))
SI = {k: si(k) for k, *_ in P.STATUSES}
ICO = {k: ic(k) for k in ("chevD", "chevR", "more", "check", "x", "swap", "print", "plus", "clock", "parts", "clip", "kit", "search", "sliders", "list", "board", "peek", "unit", "keyTag", "warranty", "user")}

sidebar = P.sidebar(active="ros", wt=False)
NOTES = {
 "list": [
  ("One title, one line of facts", "Serif title, then what matters across the shop: open, waiting, and how many are a week old."),
  ("Groups you can count", "Open · Mine · Working · Waiting · Hold · Done, each with its count — the same groups as today."),
  ("Search everything", "RO, customer, VIN, unit, part number, DTC. Press / to jump into it."),
  ("Grouped by status", "Each group starts with the status icon and a count, and folds away. Group by stage or tech from Display."),
  ("A row that reads left to right", "RO · customer and unit · complaint (+ more) · stage ticks · time used · tech · spot · ready by · days open."),
  ("Live and late at a glance", "A breathing bronze dot when the clock is running; days open turn amber at 7."),
  ("Hover for more", "A checkbox appears on the left, the RO options (⋯) on the right."),
  ("Do it to several", "Select rows and a bar rises: Transfer, Set status, Print, Clear."),
  ("Shop time stays on top", "Non-RO time keeps its row, quiet, above the groups."),
  ("Display", "One menu for view (List · Board), group by, sort and columns."),
 ],
 "board": [
  ("Seven stages, left to right", "Check-in → Close-out, the same steps as the stage track on the RO page, with counts."),
  ("Cards stay small", "RO, days, customer, complaint, status, tech and time used — the rest is one click away."),
  ("Waiting stands out by shape", "Dashed status icons and the hatched stage on cards held on someone else."),
  ("Drag to move a stage", "Drop a card on the next stage to tick that step (on the real page)."),
 ],
 "peek": [
  ("The list keeps its place", "Click a row (or J / K) and the RO opens in a pane on the right — the list doesn't move."),
  ("Open is one flat list", "No groups under Open — every open RO in one list, oldest first, with its status at the start of the complaint. Mine, Working, Waiting, Hold and Done still group by status."),
  ("The pane is the RO details pane", "Next card, Time · Parts · Files, operations — the same pieces as the RO page."),
  ("Enter opens the full RO", "↵ or Open RO goes to the RO page; Esc closes the pane."),
 ],
}

CSS = r'''
html,body{margin:0;background:var(--canvas)}
body{font-family:var(--font-sans);color:var(--ink)}
.wt-bar{position:sticky;top:0;z-index:80;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:12px 20px;background:var(--canvas);box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-bar h1{margin:0;font:500 20px/26px var(--font-serif);letter-spacing:-.01em;margin-right:auto;display:flex;align-items:center;gap:10px}
.wt-bar h1 svg{width:20px;height:20px}.wt-bar h1 svg circle{fill:var(--ink)}.wt-bar h1 svg .o{fill:var(--ink-3)}.wt-bar h1 svg .c{fill:#22c55e}
.wt-bar label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-2);cursor:pointer;user-select:none}
.wt-stage{padding:20px}
.wt-wrap{position:relative;width:100%;overflow:hidden;border-radius:18px;box-shadow:0 0 0 1px var(--hairline)}
.mock{position:absolute;left:0;top:0;width:1440px;height:900px;transform-origin:0 0;overflow:hidden}
.wt-notes{list-style:none;margin:0;padding:8px 20px 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px 32px}
.wt-notes li{display:flex;gap:12px;padding:12px 0;box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-notes b{font-size:14px;font-weight:600}.wt-notes p{margin:2px 0 0;font-size:13px;line-height:19px;color:var(--ink-2)}
.wt-n,.wt [data-n]::after{width:22px;height:22px;border-radius:999px;display:grid;place-items:center;flex:none;background:var(--accent);color:var(--on-accent);font:600 12px/1 var(--font-sans)}
.wt [data-n]{position:relative}
.wt [data-n]::after{content:attr(data-n);position:absolute;top:-1px;left:-32px;z-index:30;box-shadow:0 0 0 3px var(--panel)}
.wt .rl-tools [data-n]::after{top:-12px;left:auto;right:-10px}
.wt .rl-row[data-n]::after{left:-30px;top:10px}
.wt .rl-grp[data-n]{position:sticky}.wt .rl-grp[data-n]::after{left:-32px;top:8px}
.wt .rl-bulk[data-n]::after{left:-30px;top:8px;box-shadow:none}
.wt .rl-peek[data-n]::after{left:-12px;top:14px}
.wt .rl-open[data-n]::after{left:auto;right:-8px;top:-12px}
.wt .rl-col[data-n]::after{left:auto;right:6px;top:6px}
.wt .rl-card[data-n]::after{left:auto;right:8px;top:30px}

/* ---------- RO list page ---------- */
.rl{flex:1;min-height:0;display:flex}
.rl-main{flex:1;min-width:0;display:flex;flex-direction:column}
.rl-top{padding:28px 40px 0}
.rl-titlerow{display:flex;align-items:flex-end;gap:16px}
.rl-title{margin:0;font:500 26px/32px var(--font-serif);letter-spacing:-.015em;font-variation-settings:"opsz" 30}
.rl-facts{margin:4px 0 0;font-size:13.5px;color:var(--ink-3);display:flex;gap:6px;flex-wrap:wrap}
.rl-facts b{font-weight:500;color:var(--ink-2)}
.rl-facts .warn{color:var(--warn)}
.rl-titlerow .px-btn--primary{margin-left:auto}
.rl-tools{display:flex;align-items:center;gap:10px;margin-top:22px;padding-bottom:12px;box-shadow:inset 0 -1px 0 var(--hairline)}
.rl-seg .px-seg button{display:inline-flex;align-items:center;gap:6px;padding:5px 11px}
.rl-seg .px-seg button span{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.rl-seg .px-seg button.is-on span{color:var(--ink-2)}
.rl-find{position:relative;margin-left:auto}
.rl-find .px-ico{position:absolute;left:10px;top:50%;margin-top:-8px;color:var(--ink-3);pointer-events:none}
.rl.is-peek .rl-find input{width:210px}
.rl-find input{width:300px;padding-left:34px;padding-right:30px;height:32px;font-size:13.5px}
.rl-find .px-kbd{position:absolute;right:8px;top:50%;margin-top:-9px}
.rl-scroll{flex:1;min-height:0;overflow:auto;padding:0 40px 64px;scrollbar-width:thin}
.rl-head,.rl-row{display:grid;grid-template-columns:var(--cols);align-items:center;column-gap:14px}
.rl{--cols:18px 76px 16px minmax(170px,1.2fr) minmax(150px,1.5fr) 76px 126px 24px 58px 84px 40px 24px}
.rl.is-peek{--cols:18px 84px 16px minmax(140px,1.2fr) minmax(120px,1.4fr) 76px 24px 40px 24px}
.rl.is-peek .c-time,.rl.is-peek .c-spot,.rl.is-peek .c-ready{display:none}
.rl-head{position:sticky;top:0;z-index:4;height:34px;background:var(--panel);font-size:12px;font-weight:500;color:var(--ink-3);box-shadow:inset 0 -1px 0 var(--hairline)}
.rl-head .r,.rl-row .r{text-align:right}
.rl-grp{position:sticky;top:34px;z-index:3;display:flex;align-items:center;gap:8px;height:38px;margin-top:10px;background:var(--panel);font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;user-select:none}
.rl-grp .px-chev{width:14px;height:14px;color:var(--ink-3);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.rl-grp.is-closed .px-chev{transform:rotate(-90deg)}
.rl-grp .n{font-weight:400;color:var(--ink-3);font-variant-numeric:tabular-nums}
.rl-grp .px-btn{margin-left:auto;opacity:0;transition:opacity .15s}
.rl-grp:hover .px-btn{opacity:1}
.rl-rows{display:flex;flex-direction:column}
.rl-grp.is-closed + .rl-rows{display:none}
.rl-row{position:relative;height:44px;padding:0 6px;margin:0 -6px;border-radius:var(--radius-md);font-size:13.5px;color:var(--ink);cursor:pointer;transition:background-color .12s ease-out}
.rl-row::after{content:"";position:absolute;left:6px;right:6px;bottom:0;height:1px;background:var(--hairline)}
.rl-row:hover{background:var(--fill)}
.rl-row:hover::after,.rl-row.is-sel::after,.rl-row.is-cur::after{opacity:0}
.rl-row.is-sel{background:var(--accent-tint)}
.rl-row.is-cur{background:var(--selected)}
.rl-row > *{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rl-cb{width:16px;height:16px;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--border-strong);display:grid;place-items:center;opacity:0;transition:opacity .12s}
.rl-row:hover .rl-cb,.rl-row.is-sel .rl-cb,.rl.has-sel .rl-cb{opacity:1}
.rl-row.is-sel .rl-cb{background:var(--primary);box-shadow:none}
.rl-row.is-sel .rl-cb::after{content:"";width:8px;height:4px;border:solid var(--on-primary);border-width:0 0 1.75px 1.75px;transform:translateY(-1px) rotate(-45deg)}
.rl-no{display:flex;align-items:center;gap:6px;font:500 13px/1 var(--font-mono);color:var(--ink-2)}
.rl-live{width:7px;height:7px;border-radius:50%;background:var(--accent);flex:none;animation:px-breathe 2.4s ease-in-out infinite}
.rl-cu b{font-weight:500}
.rl-cu small{margin-left:6px;font-size:12.5px;color:var(--ink-3)}
.rl-cmp{color:var(--ink-2)}
.rl-cmp em{font-style:normal;margin-left:6px;font-size:11.5px;color:var(--ink-3);background:var(--fill);border-radius:5px;padding:1px 5px}
.rl-cmp .sub{color:var(--ink-3)}
.rl-ticks{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.rl-ticks i{height:4px;border-radius:2px;background:var(--hairline)}
.rl-ticks i.done{background:var(--ink-2)}.rl-ticks i.now{background:var(--accent)}.rl-ticks i.skip{background:transparent;box-shadow:inset 0 0 0 1px var(--hairline)}
.rl-ticks i.wait{background:repeating-linear-gradient(90deg,var(--status-customer) 0 3px,transparent 3px 5px)}
.rl-time{display:flex;align-items:center;gap:8px;font-variant-numeric:tabular-nums;font-size:12.5px;color:var(--ink-2)}
.rl-time em{font-style:normal;color:var(--ink-3)}
.rl-time .px-mini{width:32px}
.rl-sub{font-size:12.5px;color:var(--ink-3)}
.rl-days{font-variant-numeric:tabular-nums;font-size:12.5px;color:var(--ink-3)}
.rl-days.late{color:var(--warn);font-weight:500}
.rl-opt{opacity:0;width:24px;height:24px}
.rl-row:hover .rl-opt{opacity:1}
.rl-opt .px-ico{width:14px;height:14px}
.rl-shop{margin-top:6px;color:var(--ink-2)}
.rl-shop .rl-no{color:var(--ink-3)}
.rl-shop .px-ico{width:14px;height:14px}
.rl-tag{display:inline-flex;align-items:center;gap:4px;margin-left:6px;font-size:11px;color:var(--accent-text)}
.rl-tag .px-ico{width:12px;height:12px}
/* bulk bar */
.rl-bulkwrap{position:absolute;left:0;right:0;bottom:24px;z-index:40;display:flex;justify-content:center;pointer-events:none}
.rl-bulk{position:relative;pointer-events:auto;display:flex;align-items:center;gap:6px;height:44px;padding:0 6px 0 16px;border-radius:14px;background:var(--raised);box-shadow:var(--shadow-raised),inset 0 0 0 1px var(--hairline);font-size:13.5px;animation:px-rise .2s cubic-bezier(.2,.8,.2,1) both}
.rl-bulk b{font-weight:600;margin-right:8px;font-variant-numeric:tabular-nums}
.rl-bulk[hidden]{display:none}
/* display popover */
.rl-disp{position:absolute;z-index:45;width:280px;padding:12px}
.rl-disp h5{margin:4px 4px 6px;font-size:12px;font-weight:500;color:var(--ink-3)}
.rl-disp .px-seg{display:flex;margin-bottom:12px}.rl-disp .px-seg button{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.rl-disp .px-seg .px-ico{width:14px;height:14px}
.rl-disp .rl-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 2px 12px}
.rl-disp .rl-chips button{all:unset;cursor:pointer;height:26px;padding:0 10px;border-radius:7px;font-size:12.5px;color:var(--ink-2);box-shadow:inset 0 0 0 1px var(--border)}
.rl-disp .rl-chips button.is-on{color:var(--ink);background:var(--fill);box-shadow:inset 0 0 0 1.5px var(--ink)}
/* board */
.rl-board{flex:1;min-height:0;display:flex;gap:12px;overflow-x:auto;padding:16px 40px 40px;scrollbar-width:thin;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 48px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 48px),transparent)}
.rl-col{flex:0 0 214px;display:flex;flex-direction:column;gap:8px;min-height:0}
.rl-colh{display:flex;align-items:center;gap:8px;height:30px;font-size:13px;font-weight:600}
.rl-colh .n{font-weight:400;color:var(--ink-3)}
.rl-colh i{width:8px;height:8px;border-radius:2px;background:var(--ink-3)}
.rl-colh i.now{background:var(--accent)}
.rl-cards{display:flex;flex-direction:column;gap:8px;overflow:auto;padding:2px;scrollbar-width:none}
.rl-card{position:relative;padding:12px 12px 10px;border-radius:var(--radius-lg);background:var(--raised);box-shadow:inset 0 0 0 1px var(--hairline);cursor:grab;transition:box-shadow .15s ease-out}
.rl-card:hover{box-shadow:inset 0 0 0 1px var(--border-strong)}
.rl-card__top{display:flex;align-items:center;gap:6px;font:500 12px/1 var(--font-mono);color:var(--ink-3)}
.rl-card__top .d{margin-left:auto;font-family:var(--font-sans);font-variant-numeric:tabular-nums}
.rl-card__top .d.late{color:var(--warn);font-weight:500}
.rl-card h4{margin:7px 0 3px;font-size:14px;font-weight:600;color:var(--ink)}
.rl-card p{margin:0;font-size:12.5px;line-height:17px;color:var(--ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rl-card__ft{display:flex;align-items:center;gap:7px;margin-top:10px;font-size:12px;color:var(--ink-2)}
.rl-card__ft .s{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rl-card__ft .px-mini{width:28px;margin-left:auto;flex:none}
.rl-card__ft .px-av{flex:none}
.rl-card__ft .t{font-variant-numeric:tabular-nums;color:var(--ink-3)}
.rl-empty{font-size:12.5px;color:var(--ink-4);padding:14px 4px;text-align:center;border-radius:var(--radius-lg);box-shadow:inset 0 0 0 1px var(--hairline);border-style:dashed}
/* peek */
.rl-peek{flex:0 0 360px;display:flex;flex-direction:column;gap:18px;padding:24px 24px 32px;box-shadow:inset 1px 0 0 var(--hairline);overflow:auto;animation:px-fade .18s ease-out both}
.rl-peek[hidden]{display:none}
.rl-peek__top{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink-3)}
.rl-peek__top .px-id{color:var(--ink-2)}
.rl-peek__top .px-btn{margin-left:auto}
.rl-peek h2{margin:-8px 0 0;font:500 24px/30px var(--font-serif);letter-spacing:-.01em}
.rl-peek .sub{margin-top:-14px;font-size:13px;color:var(--ink-2)}
.rl-peek .px-next{margin:0}
.rl-tots{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px}
.rl-tots div{padding:9px 11px;border-radius:12px;background:var(--fill)}
.rl-tots span{display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:500;color:var(--ink-3)}
.rl-tots span .px-ico{width:13px;height:13px}
.rl-tots b{display:block;margin-top:2px;font:500 15px/20px var(--font-sans);font-variant-numeric:tabular-nums}
.rl-tots em{font-style:normal;font-weight:400;font-size:12px;color:var(--ink-3)}
.rl-pops{display:flex;flex-direction:column}
.rl-pop{display:flex;align-items:center;gap:10px;min-height:40px;box-shadow:inset 0 -1px 0 var(--hairline);font-size:13px}
.rl-pop .n{width:14px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.rl-pop .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rl-pop .h{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.rl-peek .rl-open{display:flex;gap:8px}.rl-peek .rl-open .px-btn{flex:1}
.rl-pk-h{font-size:12px;font-weight:500;color:var(--ink-3);margin-bottom:-10px}
'''

JS = r'''
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const DATA=__DATA__, SI=__SI__, ICO=__ICO__, NOTES=__NOTES__, OPTS=__OPTS__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit); fit();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st={view:'peek',grp:'open',q:'',groupBy:'status',sort:'days',sel:new Set(),cur:'ro37538',closed:{},opt:'peek'};
const GORDER=['working','roadtest','parts','customer','support','foreman','hold','released'];
const GNAME={working:'Working',roadtest:'Complete – Road test',parts:'Waiting – Parts',customer:'Waiting – Customer',support:'Waiting – Tech support',foreman:'Waiting – Foreman',hold:'Hold tech',released:'Complete – Released'};
const STG=['checkin','diag','approval','parts','repair','roadtest','closeout'], STGN={checkin:'Check-in',diag:'Diag',approval:'Approval',parts:'Parts',repair:'Repair',roadtest:'Road test',closeout:'Close-out'};
const SHORT={working:'Working',roadtest:'Road test',parts:'Parts',customer:'Customer',support:'Tech support',foreman:'Foreman',hold:'Hold tech',released:'Released'};
const TECHN={MR:'Mike Rodriguez',LM:'Luis Martinez',PS:'Priya Shah','':'Unassigned'};
function rows(){const q=st.q.trim().toLowerCase();
  return DATA.filter(r=>{ if(st.grp==='done'?r.grp!=='done':r.grp==='done')return false; if(st.grp==='mine'&&r.tech!=='MR')return false; if(['working','waiting','hold'].includes(st.grp)&&r.grp!==st.grp)return false;
    return !q||[r.no,r.cust,r.unit,r.veh,r.cmp,r.techn,r.spot].join(' ').toLowerCase().includes(q); })
   .sort((a,b)=>st.sort==='days'?b.days-a.days:st.sort==='no'?a.no.localeCompare(b.no):a.ready.localeCompare(b.ready));}
function counts(){const c={open:0,mine:0,working:0,waiting:0,hold:0,done:0};DATA.forEach(r=>{if(r.grp==='done'){c.done++;return;}c.open++;if(r.tech==='MR')c.mine++;c[r.grp]++;});return c;}
const ticks=r=>`<span class="rl-ticks" title="${esc(STGN[r.stage])}">${r.ticks.map(t=>`<i class="${t}"></i>`).join('')}</span>`;
const mini=(b,q)=>`<span class="px-mini"><i${b>q?' class="over"':''} style="width:${q?Math.min(100,b/q*100):0}%"></i></span>`;
function row(r,mark){const late=r.days>=7&&r.grp!=='done';
  return `<div class="rl-row${st.sel.has(r.id)?' is-sel':''}${st.view==='peek'&&st.cur===r.id?' is-cur':''}" data-ro="${r.id}"${mark?` data-n="${mark}"`:''}>
   <span class="rl-cb" data-cb></span><span class="rl-no">${r.live?'<i class="rl-live" title="Clock running"></i>':''}${r.no}</span>${r.si}
   <span class="rl-cu"><b>${esc(r.cust)}</b><small>Unit ${esc(r.unit)}</small>${r.warr?`<span class="rl-tag">${ICO.warranty}WARR</span>`:''}</span>
   <span class="rl-cmp">${st.grp==='open'?`<span class="sub">${esc(r.sub?r.sub.split(' · ')[0]:SHORT[r.st])} · </span>`:r.sub&&st.groupBy!=='none'?`<span class="sub">${esc(r.sub)} · </span>`:''}${esc(r.cmp)}${r.nops>1?`<em>+${r.nops-1}</em>`:''}</span>
   ${ticks(r)}<span class="rl-time c-time">${mini(r.b,r.q)}<span>${r.b.toFixed(2)} <em>/ ${r.q.toFixed(2)}</em></span></span>
   <span class="px-av" title="${esc(r.techn)}">${r.tech||'—'}</span><span class="rl-sub c-spot">${esc(r.spot)}</span><span class="rl-sub c-ready">${esc(r.ready)}</span>
   <span class="rl-days r${late?' late':''}">${r.days===0?'today':r.days+'d'}</span>
   <button class="px-btn px-btn--ghost px-btn--icon px-btn--sm rl-opt" data-opt title="RO options">${ICO.more}</button></div>`;}
function groupKey(r){return st.groupBy==='status'?r.st:st.groupBy==='stage'?r.stage:st.groupBy==='tech'?r.tech:'all';}
function groupLabel(k){if(st.groupBy==='status')return SI[k]+`<span>${GNAME[k]}</span>`;if(st.groupBy==='stage')return `<span>${STGN[k]}</span>`;if(st.groupBy==='tech')return `<span class="px-av">${k||'—'}</span><span>${TECHN[k]}</span>`;return '<span>All open</span>';}
function renderList(){
  const L=rows(), flat=st.grp==='open', gb=flat?'none':st.groupBy, keys=gb==='status'?GORDER:gb==='stage'?STG:gb==='tech'?['MR','LM','PS','']:['all'];
  const _unused=st.groupBy==='status'?GORDER:st.groupBy==='stage'?STG:st.groupBy==='tech'?['MR','LM','PS','']:['all'];
  let h=`<div class="rl-head"><span></span><span>RO</span><span></span><span>Customer</span><span>Complaint</span><span>Stage</span><span class="c-time">Time</span><span>Tech</span><span class="c-spot">Spot</span><span class="c-ready">Ready by</span><span class="r">Open</span><span></span></div>`;
  if(st.grp!=='done'&&!st.q) h+=`<div class="rl-row rl-shop"${st.opt==='list'?' data-n="9"':''}><span></span><span class="rl-no">${ICO.kit}</span><span></span><span class="rl-cu"><b>Shop time</b><small>clock non-RO work</small></span><span class="rl-cmp">Cleaning, training, shop truck…</span><span></span><span class="c-time"></span><span></span><span class="c-spot"></span><span class="c-ready"></span><span></span><span></span></div>`;
  let first=true;
  keys.forEach(k=>{const g=L.filter(r=>flat||groupKey(r)===k);if(!g.length)return;if(flat){h+=`<div class="rl-rows" style="margin-top:6px">${g.map(r=>row(r,0)).join('')}</div>`;return;}const closed=st.closed[st.groupBy+k];
    h+=`<div class="rl-grp${closed?' is-closed':''}" data-g="${st.groupBy+k}"${first&&st.opt==='list'?' data-n="4"':''}>${ICO.chevD.replace('px-ico','px-ico px-chev')}${groupLabel(k)}<span class="n">${g.length}</span><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="New RO in this group">${ICO.plus}</button></div><div class="rl-rows">${g.map((r,i)=>row(r,first&&i===0&&st.opt==='list'?5:(r.live&&st.opt==='list'?6:0))).join('')}</div>`;first=false;});
  if(!L.length) h+='<div class="px-empty" style="padding:48px 0;text-align:center;color:var(--ink-3)">Nothing matches that — check the spelling, or clear the search.</div>';
  return `<div class="rl-scroll">${h}</div>`;}
function renderBoard(){const L=rows();
  return `<div class="rl-board">${STG.map((k,i)=>{const g=L.filter(r=>r.stage===k);
    return `<div class="rl-col"${i===0&&st.opt==='board'?' data-n="1"':''}><div class="rl-colh"><i class="${k==='repair'?'now':''}"></i>${STGN[k]}<span class="n">${g.length}</span></div><div class="rl-cards">${g.map((r,j)=>`<div class="rl-card" data-ro="${r.id}"${i===2&&j===0&&st.opt==='board'?' data-n="3"':''}${i===4&&j===0&&st.opt==='board'?' data-n="2"':''}>
      <div class="rl-card__top">${r.live?'<i class="rl-live"></i>':''}${r.no}<span class="d${r.days>=7?' late':''}">${r.days===0?'today':r.days+'d'}</span></div>
      <h4>${esc(r.cust)}</h4><p>${esc(r.cmp)}${r.nops>1?` · +${r.nops-1}`:''}</p>
      <div class="rl-card__ft">${r.si}<span class="s">${esc(r.sub?r.sub.split(' · ')[0]:SHORT[r.st])}</span>${mini(r.b,r.q)}<span class="px-av">${r.tech||'—'}</span></div></div>`).join('')||'<div class="rl-empty">Nothing here</div>'}</div></div>`;}).join('')}</div>`;}
function renderPeek(){const r=DATA.find(x=>x.id===st.cur)||DATA[0];const left=Math.max(0,r.q-r.b);
  const ops=[[1,r.cmp,r.si,r.b,r.q]].concat(Array.from({length:r.nops-1},(_,i)=>[i+2,['PM service – A','Wheel seal leaking','DOT inspection'][i%3],SI.hold,0,[1.5,2.4,0.8][i%3]]));
  const nx=r.st==='parts'?`Waiting on parts — ${r.sub}. Check the ETA with the parts desk.`:r.st==='customer'?`${r.sub} — follow up with ${r.cust.split(' ')[0]} if nothing by 2 pm.`:r.st==='support'?'Tech support case open — awaiting their reply.':r.st==='foreman'?'Held for the foreman — needs a look before it goes on.':r.st==='roadtest'?'Work done — road test, then release.':r.st==='working'?`Clock running · ${r.sub}.`:`Ready to work — ${left.toFixed(2)} h left on the quote.`;
  return `<div class="rl-peek__top"><span class="px-id">RO-${r.no}</span><span>·</span><span>${r.days===0?'opened today':r.days+' days open'}</span><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" data-peekx title="Close (Esc)">${ICO.x}</button></div>
   <h2>${esc(r.cust)}</h2><div class="sub">${esc(r.veh)} · Unit ${esc(r.unit)} · ${esc(r.spot)}</div>
   <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="px-status--button">${r.si}<span>${esc(r.stn)}</span>${r.sub?`<span class="px-status__sub">· ${esc(r.sub.split(' · ')[0])}</span>`:''}${ICO.chevD.replace('px-ico','px-ico px-chev')}</button><span class="px-with">with <span class="px-av">${r.tech||'—'}</span> ${esc(TECHN[r.tech])}</span></div>
   <div class="px-next${r.st==='hold'||r.st==='working'?' is-clear':''}"><div class="px-next__head"><span class="px-next__k">Next</span><span class="px-next__for">${esc(STGN[r.stage])} · ready ${esc(r.ready)}</span></div><div class="px-next__body"><p class="px-next__t">${esc(nx)}</p></div></div>
   <div class="rl-tots"><div><span>${ICO.clock}Time</span><b>${r.b.toFixed(2)}<em> / ${r.q.toFixed(2)} h</em></b></div><div><span>${ICO.parts}Parts</span><b>${r.st==='parts'?'1':'2'}<em> / ${r.st==='parts'?'2':'2'}</em></b></div><div><span>${ICO.clip}Files</span><b>${3+r.nops}</b></div></div>
   <div class="rl-pk-h">Operations</div><div class="rl-pops">${ops.map(o=>`<div class="rl-pop">${o[2]}<span class="n">${o[0]}</span><span class="t">${esc(o[1])}</span><span class="h">${o[3].toFixed(2)} / ${o[4].toFixed(2)} h</span></div>`).join('')}</div>
   <div class="rl-open"><button class="px-btn px-btn--primary">Open RO<span class="px-kbd">↵</span></button><button class="px-btn">${ICO.swap}Transfer…</button></div>`;}
function render(){
  const c=counts(), main=$('.rl-main'), peek=$('.rl-peek'), rl=$('.rl');
  $$('[data-grp]').forEach(b=>{b.classList.toggle('is-on',b.dataset.grp===st.grp);$('span',b).textContent=c[b.dataset.grp];});
  rl.classList.toggle('is-peek',st.view==='peek');rl.classList.toggle('has-sel',st.sel.size>0);
  $('.rl-body').innerHTML=st.view==='board'?renderBoard():renderList();
  peek.hidden=st.view!=='peek'; if(st.view==='peek')peek.innerHTML=renderPeek();
  const bulk=$('.rl-bulk');bulk.hidden=!st.sel.size;$('b',bulk).textContent=`${st.sel.size} selected`;
  $$('[data-optset]').forEach(b=>b.classList.toggle('is-on',b.dataset.optset===st.opt));
  $$('[data-nl]').forEach(e=>{if(st.opt==='list')e.dataset.n=e.dataset.nl;else delete e.dataset.n;});
  if(st.opt==='peek'){const c=$('.rl-row.is-cur');if(c)c.dataset.n='1';peek.dataset.n='2';const o=$('.rl-open',peek);if(o)o.dataset.n='3';}else delete peek.dataset.n;
  renderNotes();}
function renderNotes(){const N=NOTES[st.opt];$('.wt-notes').innerHTML=N.map((n,i)=>`<li><span class="wt-n">${i+1}</span><div><b>${n[0]}</b><p>${n[1]}</p></div></li>`).join('');}
/* toolbar of the walkthrough */
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
$$('[data-optset]').forEach(b=>b.onclick=()=>{st.opt=b.dataset.optset;st.view=st.opt;st.sel.clear();closePop();render();});
const wl=$('#wtToggle'); wl.onclick=()=>{const on=!wl.classList.contains('is-on');wl.classList.toggle('is-on',on);$('.px-toggle',wl).classList.toggle('is-on',on);mock.classList.toggle('wt',on);};
/* page interactions */
$$('[data-grp]').forEach(b=>b.onclick=()=>{st.grp=b.dataset.grp;st.sel.clear();render();});
$('[data-q]').oninput=e=>{st.q=e.target.value;render();};
let pop=null; function closePop(){if(pop){pop.remove();pop=null;}}
function place(el,anchor,dx){const a=anchor.getBoundingClientRect(),m=mock.getBoundingClientRect();el.style.left=((a.right-m.left)/scale-280+(dx||0))+'px';el.style.top=((a.bottom-m.top)/scale+6)+'px';}
$('[data-disp]').onclick=e=>{e.stopPropagation();if(pop){closePop();return;}const d=document.createElement('div');d.className='px-pop rl-disp';
  d.innerHTML=`<h5>View</h5><div class="px-seg"><button class="${st.view!=='board'?'is-on':''}" data-v="list">${ICO.list}List</button><button class="${st.view==='board'?'is-on':''}" data-v="board">${ICO.board}Board</button></div>
   <h5>Group by</h5><div class="rl-chips">${[['status','Status'],['stage','Stage'],['tech','Tech'],['none','None']].map(([k,l])=>`<button class="${st.groupBy===k?'is-on':''}" data-gb="${k}">${l}</button>`).join('')}</div>
   <h5>Sort</h5><div class="rl-chips">${[['days','Days open'],['no','RO number'],['ready','Ready by']].map(([k,l])=>`<button class="${st.sort===k?'is-on':''}" data-so="${k}">${l}</button>`).join('')}</div>
   <h5>Columns</h5><div class="rl-chips">${['Stage','Time','Tech','Spot','Ready by','Open'].map(l=>`<button class="is-on">${l}</button>`).join('')}</div>`;
  mock.appendChild(d);place(d,e.currentTarget);pop=d;
  $$('[data-v]',d).forEach(b=>b.onclick=()=>{st.view=b.dataset.v==='board'?'board':(st.opt==='peek'?'peek':'list');closePop();render();});
  $$('[data-gb]',d).forEach(b=>b.onclick=()=>{st.groupBy=b.dataset.gb;$$('[data-gb]',d).forEach(x=>x.classList.toggle('is-on',x===b));render();});
  $$('[data-so]',d).forEach(b=>b.onclick=()=>{st.sort=b.dataset.so;$$('[data-so]',d).forEach(x=>x.classList.toggle('is-on',x===b));render();});};
mock.addEventListener('mousedown',e=>{if(pop&&!pop.contains(e.target)&&!e.target.closest('[data-disp],[data-opt]'))closePop();});
mock.addEventListener('click',e=>{
  const g=e.target.closest('.rl-grp');if(g&&!e.target.closest('.px-btn')){st.closed[g.dataset.g]=!st.closed[g.dataset.g];g.classList.toggle('is-closed');return;}
  const o=e.target.closest('[data-opt]');if(o){e.stopPropagation();closePop();const d=document.createElement('div');d.innerHTML=OPTS;const m=d.firstElementChild;m.style.position='absolute';m.style.zIndex=45;mock.appendChild(m);place(m,o,40);pop=m;return;}
  const cb=e.target.closest('[data-cb]');const r=e.target.closest('.rl-row[data-ro]');
  if(cb&&r){const id=r.dataset.ro;st.sel.has(id)?st.sel.delete(id):st.sel.add(id);render();return;}
  if(r){ if(e.shiftKey||e.metaKey||e.ctrlKey){const id=r.dataset.ro;st.sel.has(id)?st.sel.delete(id):st.sel.add(id);render();return;}
    if(st.view==='peek'){st.cur=r.dataset.ro;render();return;} flashOpen(r);return;}
  const c=e.target.closest('.rl-card');if(c){flashOpen(c);return;}
  if(e.target.closest('[data-peekx]')){st.opt='list';st.view='list';render();return;}
  if(e.target.closest('[data-clear]')){st.sel.clear();render();}
});
function flashOpen(el){el.animate([{background:'var(--accent-tint)'},{background:'transparent'}],{duration:700});toast('Opens RO-'+DATA.find(x=>x.id===el.dataset.ro).no+' on the RO page');}
let tt;function toast(m){$('.tw')?.remove();const w=document.createElement('div');w.className='tw';w.style.cssText='position:absolute;left:0;right:0;bottom:24px;display:flex;justify-content:center;z-index:50;pointer-events:none';w.innerHTML=`<div class="px-toast" style="animation:px-rise .2s cubic-bezier(.2,.8,.2,1) both">${m}</div>`;mock.appendChild(w);clearTimeout(tt);tt=setTimeout(()=>w.remove(),2200);}
addEventListener('keydown',e=>{if(e.target.matches('input'))return;
  if(e.key==='/'){e.preventDefault();$('[data-q]').focus();}
  if(e.key==='Escape'){closePop();if(st.sel.size){st.sel.clear();render();}}
  if(st.view==='peek'&&(e.key==='j'||e.key==='k')){const L=rows(),i=L.findIndex(r=>r.id===st.cur);const n=L[Math.max(0,Math.min(L.length-1,i+(e.key==='j'?1:-1)))];if(n){st.cur=n.id;render();}}});
render();
'''
rep = {"__DATA__": DATA, "__SI__": SI, "__ICO__": ICO, "__NOTES__": NOTES, "__OPTS__": P.options_menu()}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))

page = f'''<div class="px-app">
{sidebar}
<section class="px-panel" style="position:relative;display:flex;flex-direction:column">
<header class="px-head"><div class="px-crumb"><b>Repair orders</b></div><div class="px-head__acts"><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Print list">{ic("print")}</button><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" title="Options">{ic("more")}</button></div></header>
<div class="rl">
 <div class="rl-main">
  <div class="rl-top">
   <div class="rl-titlerow"><div data-nl="1"><h1 class="rl-title">Repair orders</h1><p class="rl-facts"><span><b>12</b> open</span><span>·</span><span><b>6</b> waiting</span><span>·</span><span><b>2</b> on the clock</span><span>·</span><span class="warn"><b class="warn">5</b> open 7+ days</span></p></div>
   <button class="px-btn px-btn--primary">{ic("plus")}New RO<span class="px-kbd">N</span></button></div>
   <div class="rl-tools">
    <div class="rl-seg" data-nl="2"><div class="px-seg">{"".join(f'<button data-grp="{k}">{l}<span>0</span></button>' for k, l in [("open","Open"),("mine","Mine"),("working","Working"),("waiting","Waiting"),("hold","Hold"),("done","Done")])}</div></div>
    <label class="rl-find" data-nl="3">{ic("search")}<input class="px-input" data-q placeholder="Search RO, customer, VIN, part #, DTC…" aria-label="Search repair orders"><span class="px-kbd">/</span></label>
    <button class="px-btn" data-disp data-nl="10">{ic("sliders")}Display</button>
   </div>
  </div>
  <div class="rl-body" style="flex:1;min-height:0;display:flex;flex-direction:column"></div>
 </div>
 <aside class="rl-peek" hidden></aside>
</div>
<div class="rl-bulkwrap"><div class="rl-bulk" hidden data-nl="8"><b>0 selected</b><button class="px-btn px-btn--ghost px-btn--sm">{ic("swap")}Transfer…</button><button class="px-btn px-btn--ghost px-btn--sm">{si("hold")}Set status…</button><button class="px-btn px-btn--ghost px-btn--sm">{ic("print")}Print</button><button class="px-btn px-btn--ghost px-btn--icon px-btn--sm" data-clear title="Clear (Esc)">{ic("x")}</button></div></div>
</section>
</div>'''

html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec RO list mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar">
  <h1>{P.LOGO}Parsec · RO list</h1>
  <div class="px-seg"><button data-optset="list">A · List</button><button data-optset="board">B · Board</button><button class="is-on" data-optset="peek">C · List + peek ✓</button></div>
  <div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div>
  <label id="wtToggle" class="is-on"><span class="px-toggle is-on"></span>Numbers</label>
</div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock wt">{page}</div></div></div>
<ol class="wt-notes"></ol>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
