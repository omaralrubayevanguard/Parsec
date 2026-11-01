# Triage page — eight ideas on the Parsec design system (Ivory + Graphite).
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parts as P
from parts import ic, si
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
P.ICONS.update({
 "phone": '<path d="M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z"/>',
 "mail": '<rect x="3.75" y="5.75" width="16.5" height="12.5" rx="2.25"/><path d="M4.5 7.25l7.5 5.75 7.5-5.75"/>',
 "userPlus": '<circle cx="10" cy="8" r="3.5"/><path d="M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5"/>',
 "pin": '<path d="M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z"/><circle cx="12" cy="10.25" r="2.25"/>',
 "flag": '<path d="M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6"/>',
 "release": '<path d="M4.5 12h11M11.5 7.5L16 12l-4.5 4.5M19.5 5v14"/>',
 "inArrow": '<path d="M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14"/>',
 "list": '<path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/><circle cx="4.75" cy="6.5" r=".9"/><circle cx="4.75" cy="12" r=".9"/><circle cx="4.75" cy="17.5" r=".9"/>',
 "ring": '<circle cx="12" cy="12" r="8"/>',
})
ICO = {k: ic(k) for k in P.ICONS}
SI = {k: si(k) for k, *_ in P.STATUSES}
SI["problem"] = si("parts", color="problem")

# ---------- the yard (now = 10:15) ----------
R = [
 dict(no="37602", cust="Triad Cold Chain", unit="88", veh="2022 Volvo VNL", cat="wrk", st="working", sub="Repairing", spot="B2", age="3d", tech="MR", hold=("tech", "Mike Rodriguez", 1.2, 8), stage=4, ready="Today 15:40", live=True,
      ops=[("Alternator not charging – replace alternator", 1180, "ok"), ("DOT inspection", 260, "ok")], chk=(0, 2, False, True, False), ct=[], tl=[(7.0, "wrk")], ev=[]),
 dict(no="37538", cust="Blue Ridge Haulage", unit="4417", veh="2020 Volvo VNL", cat="wrk", st="hold", sub="", spot="B3", age="15d", tech="MR", hold=("writer", "Dana Kowalski", 3.5, 4), stage=4, ready="Thu 10:04",
      ops=[("Clutch slipping – replace clutch", 2499, "ok"), ("Wheel seal leaking", 540, None), ("PM service – A", 238, "ok")], chk=(1, 3, False, True, False),
      ct=[("Text", "8:05", "Dana Kowalski", "Update given", "Clutch is in; wheel seal needs approval."), ("Call", "9:40", "Dana Kowalski", "Left voicemail", "Approval for op 2 — $540.")],
      tl=[(7.0, "wrk")], ev=[(8.08, "text"), (9.67, "call")], next="Operation 2 isn't approved yet — call Blue Ridge back."),
 dict(no="37544", cust="Greensboro City Waste", unit="4061", veh="2020 Volvo VHD", cat="wrk", st="working", sub="Diagnosing", spot="B1", age="2d", tech="LM", hold=("tech", "Luis Martinez", 0.8, 8), stage=1, ready="Thu 09:30",
      ops=[("Air dryer purging constantly", 320, "ok")], chk=(0, 1, True, False, False), ct=[("In person", "7:20", "Dana Kowalski", "Update given", "Fleet manager stopped by; diag today.")], tl=[(7.0, "wrk")], ev=[(7.33, "person")]),
 dict(no="37011", cust="Catawba Timber", unit="330", veh="2019 Volvo VNL", cat="wrk", st="foreman", sub="", spot="B5", age="8d", tech="PS", hold=("foreman", "Ray Owens", 5.2, 2), stage=4, ready="Thu 17:00",
      ops=[("Comeback – coolant loss after head gasket", 0, "warr"), ("Coolant hose kit", 410, "ok")], chk=(0, 2, False, True, False), ct=[], tl=[(7.0, "wrk")], ev=[(8.5, "xfer")]),
 dict(no="36988", cust="Old Salem Moving", unit="61", veh="2017 Volvo VNM", cat="wrk", st="support", sub="Awaiting reply", spot="B6", age="11d", tech="PS", hold=("warranty", "Kim Lee", 26, 24), stage=1, ready="—", warr=(53, 7),
      ops=[("Intermittent no-start, U0100 lost comms with ECM", 0, "warr")], chk=(0, 1, False, False, False), ct=[("Email", "9:05", "Kim Lee", "Update given", "Case 4-118 sent to Volvo tech support.")], tl=[(7.0, "wrk")], ev=[(9.08, "email")]),
 dict(no="37420", cust="Guilford Paving", unit="902", veh="2020 Volvo VHD", cat="wrk", st="parts", sub="Ordered · due Thu", spot="UP", age="6d", tech="LM", hold=("parts", "Parts desk", 20, 24), stage=3, ready="Fri 12:00",
      ops=[("Hydraulic PTO leak at the pump", 1960, "ok"), ("Hose replacement", 380, "ok"), ("Pressure test", 210, "ok")], chk=(0, 3, False, True, False), ct=[("Call", "Wed 16:10", "Dana Kowalski", "Update given", "PTO pump due Thursday.")], tl=[(7.0, "wrk")], ev=[]),
 dict(no="34601", cust="Carolina Line Freight", unit="2210", veh="2019 Volvo VNR", cat="wrk", st="parts", sub="Backordered · due Fri", spot="AW1", age="9d", tech="MR", hold=("parts", "Parts desk", 40, 24), stage=3, ready="Mon 14:00", warr=(70, 3),
      ops=[("Check engine light – DPF differential pressure high", 0, "warr"), ("Replace DPF", 0, "warr")], chk=(1, 2, False, True, False), ct=[("Text", "7:45", "Dana Kowalski", "Update given", "DPF backordered — due Friday.")], tl=[(7.0, "wrk")], ev=[(7.75, "text")]),
 dict(no="37590", cust="Yadkin Valley Logistics", unit="1204", veh="2018 Volvo VNL", cat="apr", st="customer", sub="Estimate sent", spot="C3", age="26h", tech="LM", hold=("writer", "Dana Kowalski", 26, 4), stage=2, ready="Fri 16:00", late=True,
      ops=[("Front brakes grinding – brake job", 1280, None), ("Slack adjusters", 360, None)], chk=(0, 2, False, False, False),
      ct=[("Text", "Wed 8:10", "Dana Kowalski", "Update given", "Estimate $1,640 sent."), ("Call", "9:20", "Dana Kowalski", "No answer", ""), ("Call", "10:02", "Dana Kowalski", "Left voicemail", "Asked for a yes or no on the brakes.")],
      tl=[(7.0, "apr")], ev=[(9.33, "call"), (10.03, "call")], next="No answer on the estimate for 26 h — try the fleet manager."),
 dict(no="37516", cust="Sandhills Grain", unit="77", veh="2019 Volvo VNL", cat="apr", st="customer", sub="Approval pending", spot="C4", age="7h", tech="PS", hold=("writer", "Dana Kowalski", 7, 4), stage=2, ready="Mon 10:00",
      ops=[("Steer axle kingpin play", 860, None)], chk=(0, 1, False, True, False), ct=[("Call", "8:40", "Dana Kowalski", "Will call back", "Owner checking with the fleet manager.")], tl=[(7.0, "apr")], ev=[(8.67, "call")]),
 dict(no="37628", cust="Rowan Ready Mix", unit="2203", veh="2021 Volvo VNR", cat="apr", st="customer", sub="Estimate sent", spot="C5", age="1h", tech="LM", hold=("writer", "Dana Kowalski", 1, 4), stage=2, ready="Fri 15:00",
      ops=[("Turbo whistle and low power", 2480, None), ("Charge air cooler leak", 640, None)], chk=(0, 2, False, False, False), ct=[("Email", "9:15", "Dana Kowalski", "Update given", "Estimate $3,120 sent.")], tl=[(7.6, "chk"), (9.2, "apr")], ev=[(9.25, "email")]),
 dict(no="37555", cust="Haw River Dairy", unit="17", veh="2023 Volvo VNR", cat="chk", st="hold", sub="", spot="T1", age="3h", tech="", hold=("foreman", "Ray Owens", 3, 1), stage=0, ready="Today 13:30", late=True,
      ops=[("PM service – A", 238, "ok")], chk=(0, 1, False, False, False), ct=[("In person", "7:15", "Dana Kowalski", "Update given", "Driver dropped it off for PM-A.")], tl=[(7.25, "chk")], ev=[(7.25, "person")], next="Checked in 3 h ago with no tech — assign one."),
 dict(no="35112", cust="Piedmont Aggregates", unit="318", veh="2021 Volvo VHD", cat="chk", st="hold", sub="", spot="T2", age="40m", tech="MR", hold=("tech", "Mike Rodriguez", 0.6, 8), stage=0, ready="Fri 11:30",
      ops=[("Air leak at the front axle", 250, "ok")], chk=(0, 1, False, False, False), ct=[], tl=[(9.6, "chk")], ev=[]),
 dict(no="37641", cust="Dixie Fleet Services", unit="5102", veh="2022 Volvo VNL", cat="arr", st="hold", sub="", spot="W1", age="11:30", tech="", hold=("writer", "Dana Kowalski", 1.3, 4), stage=0, ready="—",
      ops=[("Coolant leak, front of engine", 0, None)], chk=(0, 1, False, False, False), ct=[("Call", "8:55", "Dana Kowalski", "Update given", "Driver about 40 minutes out.")], tl=[], ev=[(8.92, "call")]),
 dict(no="37644", cust="Mount Airy Movers", unit="230", veh="2018 Volvo VNM", cat="arr", st="hold", sub="", spot="W2", age="13:00", tech="", hold=("writer", "Dana Kowalski", 0.5, 4), stage=0, ready="—",
      ops=[("Liftgate inoperative", 0, None)], chk=(0, 1, False, False, False), ct=[], tl=[], ev=[]),
 dict(no="37489", cust="Pilot Mountain Express", unit="5530", veh="2021 Volvo VNL", cat="rdy", st="roadtest", sub="", spot="D1", age="2h", tech="MR", hold=("writer", "Dana Kowalski", 2, 2), stage=5, ready="Today 12:15",
      ops=[("Overhead and injector cups", 3340, "ok"), ("Valve cover gasket", 410, "ok")], chk=(2, 2, True, True, True), ct=[("Call", "9:55", "Dana Kowalski", "Update given", "Ready at noon; driver on the way.")], tl=[(7.0, "wrk"), (8.25, "rdy")], ev=[(8.2, "check"), (9.92, "call")]),
 dict(no="37301", cust="Uwharrie Fuel", unit="12", veh="2016 Volvo VNL", cat="rdy", st="roadtest", sub="", spot="D2", age="28h", tech="LM", hold=("writer", "Dana Kowalski", 28, 2), stage=5, ready="Wed 12:00", late=True,
      ops=[("Turbo actuator fault – replace actuator", 1720, "ok"), ("Software update", 0, "warr")], chk=(2, 2, True, False, True),
      ct=[("Call", "Wed 15:00", "Dana Kowalski", "No answer", ""), ("Text", "Wed 15:05", "Dana Kowalski", "Update given", "Ready for pickup.")], tl=[(7.0, "rdy")], ev=[], next="Ready since yesterday — one punch has no note, then release."),
 dict(no="37460", cust="Lexington Bottling", unit="44", veh="2019 Volvo VNL", cat="rdy", st="declined", sub="", spot="D3", age="4h", tech="PS", hold=("writer", "Dana Kowalski", 4, 2), stage=6, ready="Today",
      ops=[("Diagnose ABS light", 210, "ok"), ("Replace ABS module", 1890, "no")], chk=(1, 1, True, True, True), ct=[("Call", "8:00", "Dana Kowalski", "Declined", "Declined op 2 — release as is.")], tl=[(7.0, "apr"), (8.0, "rdy")], ev=[(8.0, "call"), (8.02, "appr")]),
]
REL = [dict(no="37220", cust="Elkin Hardwoods", at="8:40", spot="—"), dict(no="37388", cust="Surry Feed & Seed", at="9:30", spot="—")]
for r in R:
    r.setdefault("late", False); r.setdefault("live", False); r.setdefault("warr", None); r.setdefault("next", "")
    r["stn"] = dict((k, v) for k, v, *_ in P.STATUSES)[r["st"]]
DATA = dict(ros=R, rel=REL)

CSS = r'''
html,body{margin:0;background:var(--canvas)}
body{font-family:var(--font-sans);color:var(--ink)}
.wt-bar{position:sticky;top:0;z-index:80;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 20px;background:var(--canvas);box-shadow:inset 0 -1px 0 var(--hairline)}
.wt-bar h1{margin:0;font:500 20px/26px var(--font-serif);letter-spacing:-.01em;margin-right:auto;display:flex;align-items:center;gap:10px}
.wt-bar h1 svg{width:20px;height:20px}.wt-bar h1 svg circle{fill:var(--ink)}.wt-bar h1 svg .o{fill:var(--ink-3)}.wt-bar h1 svg .c{fill:#22c55e}
.wt-ideas{display:flex;gap:2px;padding:2px;border-radius:var(--radius-md);background:var(--fill)}
.wt-ideas button{all:unset;cursor:pointer;padding:5px 10px;border-radius:6px;font-size:13px;font-weight:500;color:var(--ink-2)}
.wt-ideas button.is-on{background:var(--raised);color:var(--ink);box-shadow:0 0 0 1px var(--hairline),0 1px 2px rgba(0,0,0,.06)}
.wt-stage{padding:20px}
.wt-wrap{position:relative;width:100%;overflow:hidden;border-radius:18px;box-shadow:0 0 0 1px var(--hairline)}
.mock{position:absolute;left:0;top:0;width:1440px;height:900px;transform-origin:0 0;overflow:hidden;background:var(--canvas)}
.wt-about{display:grid;grid-template-columns:minmax(220px,320px) 1fr;gap:12px 40px;padding:6px 24px 56px;max-width:1400px}
.wt-about h2{margin:0;font:500 24px/30px var(--font-serif)}
.wt-about h2 small{display:block;margin-top:4px;font:400 13px/18px var(--font-sans);color:var(--ink-3)}
.wt-about ul{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:4px 28px}
.wt-about li{padding:10px 0;box-shadow:inset 0 -1px 0 var(--hairline);font-size:13px;line-height:19px;color:var(--ink-2)}
.wt-about li b{display:block;font-size:14px;color:var(--ink);font-weight:600;margin-bottom:2px}

/* ---------- shell: icon rail + panel ---------- */
.tg-app{display:flex;height:100%}
.tg-rail{flex:none;width:56px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 0 12px}
.tg-rail .lg{width:22px;height:22px;margin-bottom:10px}.tg-rail .lg svg{width:22px;height:22px}.tg-rail .lg circle{fill:var(--ink)}.tg-rail .lg .o{fill:var(--ink-3)}.tg-rail .lg .c{fill:#22c55e}
.tg-rail a{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;color:var(--ink-3)}
.tg-rail a.is-on{background:var(--selected);color:var(--ink)}
.tg-rail a .px-ico{width:18px;height:18px}
.tg-rail .sep{width:24px;height:1px;background:var(--hairline);margin:8px 0}
.tg-rail .ck{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--panel);box-shadow:inset 0 0 0 1px var(--hairline)}
.tg-rail .ck i{width:8px;height:8px;border-radius:50%;background:var(--status-working);box-shadow:0 0 0 3px var(--good-tint)}
.tg-rail .sp{flex:1}
.tg-panel{flex:1;min-width:0;margin:8px 8px 8px 0;border-radius:var(--radius-xl);background:var(--panel);box-shadow:var(--shadow-panel);display:flex;flex-direction:column;overflow:hidden;position:relative}
.tg-head{display:flex;align-items:center;gap:12px;height:56px;padding:0 16px 0 28px;box-shadow:inset 0 -1px 0 var(--hairline);flex:none}
.tg-head h1{margin:0;font:500 22px/28px var(--font-serif);letter-spacing:-.01em}
.tg-facts{display:flex;gap:6px;font-size:13px;color:var(--ink-3);white-space:nowrap}
.tg-facts b{font-weight:500;color:var(--ink-2)}.tg-facts .w b,.tg-facts .w{color:var(--warn)}
.tg-find{position:relative;margin-left:auto}
.tg-find .px-ico{position:absolute;left:10px;top:50%;margin-top:-8px;color:var(--ink-3)}
.tg-find input{width:260px;height:32px;padding-left:34px;font-size:13.5px}
.tg-body{flex:1;min-height:0;display:flex;position:relative}

/* ---------- shared bits ---------- */
.sq{display:inline-block;width:8px;height:8px;border-radius:2px;flex:none}
.tg-spot{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 6px;border-radius:6px;background:var(--fill);font:500 11.5px/1 var(--font-mono);color:var(--ink-2);white-space:nowrap}
.tg-spot .px-ico{width:11px;height:11px;color:var(--ink-3)}
.tg-age{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.tg-age.late{color:var(--warn);font-weight:500}
.tg-ro{font:500 12.5px/1 var(--font-mono);color:var(--ink-2)}
.tg-live{width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block;animation:px-breathe 2.4s ease-in-out infinite;flex:none}
.tg-w{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:500;color:var(--accent-text)}
.tg-w .px-ico{width:12px;height:12px}
.tg-ct{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-ct .px-ico{width:13px;height:13px;flex:none}
.tg-ct b{font-weight:500;color:var(--ink-2)}
.tg-oc{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:500;white-space:nowrap;background:var(--fill);color:var(--ink-2)}
.tg-oc.ok{background:var(--good-tint);color:var(--good)}.tg-oc.no{background:var(--bad-tint);color:var(--bad)}.tg-oc.mid{background:var(--warn-tint);color:var(--warn)}
.tg-held{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.tg-held .m{flex:1;height:4px;border-radius:2px;background:var(--hairline);position:relative;overflow:hidden;min-width:28px}
.tg-held .m i{position:absolute;left:0;top:0;bottom:0;border-radius:2px;background:var(--ink-2)}
.tg-held .m i.over{background:var(--status-problem)}
.tg-held.over{color:var(--warn)}
.tg-role{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:7px;background:var(--fill);font:600 9.5px/1 var(--font-sans);color:var(--ink-2);letter-spacing:.02em;flex:none}
.tg-checks{display:inline-flex;gap:3px}
.tg-checks i{width:7px;height:7px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)}
.tg-checks i.ok{background:var(--status-working);box-shadow:none}
.tg-sec{font-size:12px;font-weight:500;color:var(--ink-3);margin:0 0 8px}
.tg-sel{box-shadow:inset 0 0 0 1.5px var(--accent) !important}
.tg-pane{flex:0 0 340px;display:flex;flex-direction:column;gap:16px;padding:22px 22px 28px;box-shadow:inset 1px 0 0 var(--hairline);overflow:auto;scrollbar-width:none}
.tg-pane h2{margin:0;font:500 22px/28px var(--font-serif);letter-spacing:-.01em}
.tg-pane .eb{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink-3);margin-bottom:-10px}
.tg-pane .eb .tg-ro{color:var(--ink-2)}
.tg-pane .sub{margin-top:-12px;font-size:13px;color:var(--ink-2)}
.tg-kv{display:grid;grid-template-columns:96px 1fr;gap:7px 10px;font-size:13px}
.tg-kv span{color:var(--ink-3)}
.tg-acts{display:flex;gap:8px;flex-wrap:wrap}.tg-acts .px-btn{flex:1}
.tg-feed{display:flex;flex-direction:column}
.tg-fe{display:grid;grid-template-columns:22px 1fr auto;gap:2px 10px;padding:9px 0;box-shadow:inset 0 -1px 0 var(--hairline);font-size:13px}
.tg-fe:last-child{box-shadow:none}
.tg-fe .gi{grid-row:span 2;width:22px;height:22px;border-radius:7px;background:var(--fill);display:grid;place-items:center;color:var(--ink-2)}
.tg-fe .gi .px-ico{width:13px;height:13px}
.tg-fe b{font-weight:500}.tg-fe time{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.tg-fe p{grid-column:2/-1;margin:0;font-size:12.5px;color:var(--ink-2)}
.tg-close{display:flex;flex-direction:column;gap:2px}
.tg-cl{display:flex;align-items:center;gap:10px;min-height:30px;font-size:13px}
.tg-cl i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong);display:grid;place-items:center;flex:none}
.tg-cl.ok i{background:var(--status-working);box-shadow:none}
.tg-cl.ok i::after{content:"";width:7px;height:3.5px;border:solid var(--panel);border-width:0 0 1.6px 1.6px;transform:translateY(-1px) rotate(-45deg)}
.tg-cl small{margin-left:auto;font-size:12px;color:var(--ink-3)}
.tg-cl .px-link{margin-left:auto;font-size:12.5px}
.tg-ring{transform:rotate(-90deg);flex:none}
.tg-ring circle{fill:none;stroke-width:4}
.tg-ring .t{stroke:var(--hairline)}.tg-ring .p{stroke:var(--accent);stroke-linecap:round}
.tg-ring.ok .p{stroke:var(--status-working)}
.tg-ticks{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.tg-ticks i{height:4px;border-radius:2px;background:var(--hairline)}
.tg-ticks i.done{background:var(--ink-2)}.tg-ticks i.now{background:var(--accent)}.tg-ticks i.wait{background:repeating-linear-gradient(90deg,var(--status-customer) 0 3px,transparent 3px 5px)}

/* ===== 1 · Stage lanes ===== */
.i1{flex:1;min-width:0;display:flex;flex-direction:column}
.i1-lanes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;padding:18px 20px 12px}
.i1-lane{display:flex;flex-direction:column;min-height:0;border-radius:16px;background:var(--canvas);padding:10px}
.i1-lh{display:flex;align-items:center;gap:8px;height:28px;padding:0 4px;font-size:13px;font-weight:600;white-space:nowrap}
.i1-lh .n{font-weight:400;color:var(--ink-3)}
.i1-lh .x{margin-left:auto;font-size:11.5px;font-weight:500;color:var(--warn)}
.i1-cards{display:flex;flex-direction:column;gap:8px;overflow:auto;scrollbar-width:none;padding:4px 0 2px}
.i1-c{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;padding:11px 12px;border-radius:12px;background:var(--raised);box-shadow:0 0 0 1px var(--hairline),0 1px 2px rgba(0,0,0,.03);cursor:pointer;transition:box-shadow .15s}
.i1-c:hover{box-shadow:0 0 0 1px var(--border-strong)}
.i1-c .t{display:flex;align-items:center;gap:6px}
.i1-c .t .tg-age{margin-left:auto}
.i1-c h4{margin:0;font-size:13.5px;font-weight:600;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i1-c .m{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-2);white-space:nowrap;overflow:hidden}
.i1-c .m .px-av{margin-left:auto}
.i1-c .tg-ct{font-size:11.5px;min-width:0}
.i1-empty{padding:16px 6px;font-size:12.5px;color:var(--ink-4)}
.i1-rel{display:flex;align-items:center;gap:10px;height:44px;margin:0 20px 14px;padding:0 14px;border-radius:12px;background:var(--canvas);font-size:13px;color:var(--ink-2)}
.i1-rel b{font-weight:600;color:var(--ink)}
.i1-rel .tg-spot{background:var(--raised)}

/* ===== 2 · Yard plan ===== */
.i2{flex:1;min-width:0;overflow:auto;padding:20px 24px 24px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin}
.i2-row{display:flex;gap:18px}
.i2-z{border-radius:16px;padding:12px 14px 14px;box-shadow:inset 0 0 0 1px var(--hairline)}
.i2-zh{display:flex;align-items:baseline;gap:8px;margin-bottom:10px;font-size:13px;font-weight:600}
.i2-zh small{font-weight:400;color:var(--ink-3);font-size:12px}
.i2-g{display:grid;gap:6px}
.i2-s{all:unset;box-sizing:border-box;position:relative;height:56px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--hairline);background-image:repeating-linear-gradient(135deg,transparent 0 6px,color-mix(in srgb,var(--hairline) 55%,transparent) 6px 7px);display:flex;flex-direction:column;justify-content:center;padding:0 9px;cursor:default}
.i2-s .l{position:absolute;top:6px;right:8px;font:500 10px/1 var(--font-mono);color:var(--ink-4)}
.i2-s.occ{background:var(--raised);box-shadow:0 0 0 1px var(--hairline),0 2px 6px -3px rgba(0,0,0,.12);cursor:pointer}
.i2-s.occ:hover{box-shadow:0 0 0 1px var(--border-strong)}
.i2-s b{display:flex;align-items:center;gap:5px;font:500 13px/1 var(--font-mono);padding-right:22px}
.i2-s small{margin-top:5px;font-size:11px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i2-s .fl{position:absolute;bottom:6px;right:7px;display:flex;gap:3px;align-items:center}
.i2-s .fl .lt{width:6px;height:6px;border-radius:50%;background:var(--warn)}
.i2-s .fl .px-ico{width:11px;height:11px;color:var(--accent-text)}
.i2-leg{display:flex;gap:18px;flex-wrap:wrap;font-size:12px;color:var(--ink-3);padding:0 2px}
.i2-leg span{display:inline-flex;align-items:center;gap:6px}

/* ===== 3 · Action inbox ===== */
.i3-list{flex:0 0 420px;display:flex;flex-direction:column;box-shadow:inset -1px 0 0 var(--hairline);min-height:0}
.i3-lh{display:flex;align-items:center;gap:8px;padding:18px 20px 8px;font-size:14px;font-weight:600}
.i3-lh .n{font-weight:400;color:var(--ink-3)}
.i3-grp{padding:12px 20px 4px;font-size:12px;font-weight:500;color:var(--ink-3)}
.i3-scroll{flex:1;overflow:auto;scrollbar-width:none;padding-bottom:16px}
.i3-it{display:grid;grid-template-columns:28px 1fr auto;gap:2px 12px;align-items:center;padding:10px 20px;cursor:pointer;position:relative}
.i3-it:hover{background:var(--fill)}
.i3-it.on{background:var(--selected)}
.i3-it .gi{grid-column:1;grid-row:1 / span 2;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:var(--fill);color:var(--ink-2)}
.i3-it.on .gi{background:var(--raised)}
.i3-it .gi .px-ico{width:15px;height:15px}
.i3-it .t{grid-column:2;grid-row:1;display:flex;align-items:center;gap:8px;min-width:0;font-size:13.5px}
.i3-it .t b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i3-it .w{grid-column:2;grid-row:2;font-size:12.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i3-it .w.late{color:var(--warn)}
.i3-it .px-btn{grid-column:3;grid-row:1 / span 2}
.i3-it .dot{position:absolute;left:8px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:var(--accent)}
.i3-main{flex:1;min-width:0;display:flex;flex-direction:column}
.i3-top{padding:20px 28px 16px;box-shadow:inset 0 -1px 0 var(--hairline);display:flex;flex-direction:column;gap:10px}
.i3-top .r1{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-3)}
.i3-top h2{margin:0;font:500 24px/30px var(--font-serif)}
.i3-top .r2{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:13px;color:var(--ink-2)}
.i3-top .r2 .tg-ticks{width:120px}
.i3-thread{flex:1;overflow:auto;padding:18px 28px;display:flex;flex-direction:column;gap:14px;scrollbar-width:none}
.i3-day{align-self:center;font-size:11.5px;color:var(--ink-3);padding:2px 10px;border-radius:999px;background:var(--fill)}
.i3-m{display:flex;gap:12px;align-items:flex-start;max-width:620px}
.i3-m .gi{width:30px;height:30px;border-radius:10px;background:var(--fill);display:grid;place-items:center;flex:none;color:var(--ink-2)}
.i3-m .gi .px-ico{width:15px;height:15px}
.i3-m .bd{flex:1;display:flex;flex-direction:column;gap:4px}
.i3-m .hd{display:flex;align-items:center;gap:8px;font-size:13px}
.i3-m .hd b{font-weight:600}.i3-m .hd time{font-size:12px;color:var(--ink-3)}
.i3-m p{margin:0;padding:9px 12px;border-radius:12px;background:var(--raised);box-shadow:0 0 0 1px var(--hairline);font-size:13.5px;line-height:20px}
.i3-m.sys .gi{background:transparent;box-shadow:inset 0 0 0 1px var(--hairline)}
.i3-m.sys .hd{color:var(--ink-3)}
.i3-appr{border-radius:14px;box-shadow:0 0 0 1px var(--hairline);background:var(--raised);overflow:hidden;max-width:620px}
.i3-appr .h{display:flex;align-items:center;gap:10px;padding:10px 14px;font-size:13px;font-weight:600;box-shadow:inset 0 -1px 0 var(--hairline)}
.i3-appr .h span{margin-left:auto;font-weight:400;font-size:12.5px;color:var(--ink-3)}
.i3-op{display:flex;align-items:center;gap:10px;padding:8px 14px;font-size:13px;box-shadow:inset 0 -1px 0 var(--hairline)}
.i3-op:last-child{box-shadow:none}
.i3-op .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i3-op .mny{font-variant-numeric:tabular-nums;color:var(--ink-2);width:64px;text-align:right}
.tg-seg3{display:inline-flex;padding:2px;border-radius:8px;background:var(--fill)}
.tg-seg3 button{all:unset;cursor:pointer;padding:3px 9px;border-radius:6px;font-size:12px;font-weight:500;color:var(--ink-2)}
.tg-seg3 button.on{background:var(--raised);color:var(--ink);box-shadow:0 0 0 1px var(--hairline)}
.tg-seg3 button.on.ok{color:var(--good)}.tg-seg3 button.on.no{color:var(--bad)}
.i3-comp{margin:0 28px 20px;border-radius:16px;background:var(--raised);box-shadow:0 0 0 1px var(--border),var(--shadow-raised);padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.i3-comp .r{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.i3-comp .r .lbl{font-size:12px;color:var(--ink-3);margin-right:2px}
.tg-chip{all:unset;cursor:pointer;height:26px;padding:0 10px;border-radius:8px;font-size:12.5px;color:var(--ink-2);box-shadow:inset 0 0 0 1px var(--border);display:inline-flex;align-items:center;gap:6px}
.tg-chip .px-ico{width:13px;height:13px}
.tg-chip.on{background:var(--fill);color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--ink)}
.i3-comp textarea{all:unset;font-size:14px;line-height:20px;min-height:22px;color:var(--ink)}
.i3-comp textarea::placeholder{color:var(--ink-3)}
.i3-comp .send{margin-left:auto}

/* ===== 4 · Day timeline ===== */
.i4{flex:1;min-width:0;display:flex;flex-direction:column;padding:18px 24px 18px}
.i4-axis,.i4-row{display:grid;grid-template-columns:260px 1fr;align-items:center}
.i4-axis{height:30px;font-size:11.5px;color:var(--ink-3)}
.i4-ax{position:relative;height:100%}
.i4-ax span{position:absolute;top:8px;transform:translateX(-50%)}
.i4-rows{flex:1;overflow:auto;scrollbar-width:none;position:relative}
.i4-row{height:44px;box-shadow:inset 0 -1px 0 var(--hairline);cursor:pointer}
.i4-row:hover{background:var(--fill)}
.i4-row.on{background:var(--selected)}
.i4-who{display:flex;align-items:center;gap:8px;padding:0 10px 0 4px;min-width:0;font-size:13px}
.i4-who b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i4-tr{position:relative;height:100%}
.i4-grid{position:absolute;top:0;bottom:0;width:1px;background:var(--hairline)}
.i4-seg{position:absolute;top:15px;height:14px;border-radius:5px}
.i4-seg.wait{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.35) 0 3px,transparent 3px 6px)}
.i4-ev{position:absolute;top:9px;width:24px;height:24px;margin-left:-12px;border-radius:8px;background:var(--raised);box-shadow:0 0 0 1px var(--border-strong);display:grid;place-items:center;color:var(--ink);z-index:2}
.i4-ev .px-ico{width:12px;height:12px}
.i4-due{position:absolute;top:13px;width:2px;height:18px;margin-left:-1px;background:var(--ink);border-radius:1px}
.i4-due::after{content:"";position:absolute;top:-4px;left:-3px;width:8px;height:8px;background:var(--ink);transform:rotate(45deg);border-radius:1px}
.i4-now{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--accent);z-index:3}
.i4-now::before{content:"10:15";position:absolute;top:-22px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:600;color:var(--accent-text)}
.i4-foot{display:flex;gap:18px;flex-wrap:wrap;align-items:center;padding-top:12px;font-size:12px;color:var(--ink-3)}
.i4-foot span{display:inline-flex;align-items:center;gap:6px}
.i4-foot .px-ico{width:12px;height:12px}

/* ===== 5 · Ledger ===== */
.i5{flex:1;min-width:0;overflow:auto;padding:12px 24px 24px;scrollbar-width:thin}
.i5-h,.i5-r{display:grid;grid-template-columns:72px minmax(170px,1.3fr) 150px 56px minmax(150px,1fr) 150px minmax(170px,1.2fr) 120px 60px 44px;column-gap:14px;align-items:center}
.i5-h{position:sticky;top:0;z-index:2;height:36px;background:var(--panel);font-size:12px;font-weight:500;color:var(--ink-3);box-shadow:inset 0 -1px 0 var(--hairline)}
.i5-h span{display:flex;align-items:center;gap:4px}
.i5-h .px-ico{width:11px;height:11px}
.i5-r{min-height:48px;padding:0 8px;margin:0 -8px;border-radius:10px;font-size:13px;cursor:pointer;position:relative}
.i5-r::after{content:"";position:absolute;left:8px;right:8px;bottom:0;height:1px;background:var(--hairline)}
.i5-r:hover{background:var(--fill)}
.i5-r.on{background:var(--selected)}
.i5-r > *{min-width:0}
.i5-r .c b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
.i5-r .c small{font-size:12px;color:var(--ink-3)}
.i5-stg{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--ink-2)}
.i5-st{display:flex;align-items:center;gap:6px;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i5-ap{font-size:12px;font-variant-numeric:tabular-nums;color:var(--ink-2);white-space:nowrap}
.i5-ap em{font-style:normal;color:var(--warn)}
.i5-x{grid-column:1/-1;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:28px;padding:14px 8px 18px;margin:0 -8px 6px;background:var(--canvas);border-radius:0 0 12px 12px}
.i5-x .tg-sec{margin-bottom:6px}

/* ===== 6 · Tiles and rings ===== */
.i6{flex:1;min-width:0;overflow:auto;padding:20px 24px 24px;scrollbar-width:thin}
.i6-kpi{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:22px}
.i6-k{padding:14px 16px;border-radius:16px;background:var(--canvas);display:flex;flex-direction:column;gap:4px}
.i6-k span{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink-3)}
.i6-k b{font:500 28px/34px var(--font-serif);font-variant-numeric:tabular-nums}
.i6-k small{font-size:12px;color:var(--ink-3)}
.i6-k.w b{color:var(--warn)}
.i6-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.i6-t{display:flex;flex-direction:column;gap:10px;padding:14px 16px 14px;border-radius:18px;background:var(--raised);box-shadow:0 0 0 1px var(--hairline);min-width:0}
.i6-t .a{display:flex;align-items:center;gap:12px}
.i6-t .a .nm{min-width:0;flex:1}
.i6-t h4{margin:0;font:500 17px/22px var(--font-serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i6-t .a .tg-ro{font-size:12px}
.i6-t .rg{position:relative;width:44px;height:44px;flex:none}
.i6-t .rg b{position:absolute;inset:0;display:grid;place-items:center;font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums}
.i6-t .ln{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-2);white-space:nowrap;overflow:hidden}
.i6-t .ln .tg-age{margin-left:auto}
.i6-t .nx{display:flex;align-items:center;gap:8px;padding-top:10px;box-shadow:inset 0 1px 0 var(--hairline);font-size:12.5px;color:var(--ink-2)}
.i6-t .nx span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-late{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:6px;background:var(--warn-tint);color:var(--warn);font-size:11px;font-weight:600}
.i6-gh{display:flex;align-items:center;gap:8px;margin:22px 0 10px;font-size:13px;font-weight:600}
.i6-gh:first-of-type{margin-top:0}
.i6-gh .n{font-weight:400;color:var(--ink-3)}
.i6-wb{height:4px;border-radius:2px;background:var(--hairline);overflow:hidden}.i6-wb i{display:block;height:100%;background:var(--accent)}

/* ===== 7 · Triage desk ===== */
.i7-list{flex:0 0 300px;display:flex;flex-direction:column;box-shadow:inset -1px 0 0 var(--hairline);min-height:0}
.i7-scroll{flex:1;overflow:auto;padding:12px 12px 16px;scrollbar-width:none}
.i7-g{display:flex;align-items:center;gap:8px;padding:12px 8px 4px;font-size:12px;font-weight:500;color:var(--ink-3)}
.i7-it{display:flex;align-items:center;gap:10px;height:42px;padding:0 8px;border-radius:9px;cursor:pointer;font-size:13px}
.i7-it:hover{background:var(--fill)}
.i7-it.on{background:var(--selected)}
.i7-it b{flex:1;min-width:0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i7-main{flex:1;min-width:0;overflow:auto;padding:24px 32px 32px;display:flex;flex-direction:column;gap:16px;scrollbar-width:thin}
.i7-hd{display:flex;align-items:flex-end;gap:16px}
.i7-hd .l{flex:1;min-width:0}
.i7-hd .eb{display:flex;gap:6px;align-items:center;font-size:12.5px;color:var(--ink-3)}
.i7-hd h2{margin:2px 0 0;font:500 28px/34px var(--font-serif);letter-spacing:-.015em}
.i7-hd .sub{font-size:13.5px;color:var(--ink-2);margin-top:2px}
.i7-hd .r{display:flex;gap:8px}
.i7-strip{border-radius:16px;box-shadow:inset 0 0 0 1px var(--hairline);padding:14px 16px}
.i7-steps{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
.i7-step{display:flex;flex-direction:column;gap:6px;font-size:12.5px;cursor:pointer}
.i7-step i{height:5px;border-radius:3px;background:var(--hairline)}
.i7-step.done i{background:var(--ink-2)}.i7-step.now i{background:var(--accent)}.i7-step.wait i{background:repeating-linear-gradient(90deg,var(--status-customer) 0 4px,transparent 4px 7px)}
.i7-step b{font-weight:500}.i7-step.now b{color:var(--accent-text)}
.i7-step small{color:var(--ink-3);font-size:11.5px}
.i7-next{display:flex;align-items:center;gap:14px;border-radius:16px;padding:12px 14px 12px 16px;background:var(--accent-tint);box-shadow:inset 0 0 0 1px var(--accent-line)}
.i7-next .k{font-size:12px;font-weight:600;color:var(--accent-text)}
.i7-next p{flex:1;margin:0;font-size:14px;font-weight:500}
.i7-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.i7-card{border-radius:16px;box-shadow:inset 0 0 0 1px var(--hairline);padding:14px 16px}
.i7-card .h{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;font-weight:600}
.i7-card .h small{margin-left:auto;font-weight:400;color:var(--ink-3);font-size:12px}
.i7-rtc{display:flex;gap:16px;align-items:center}
.i7-rtc .tg-close{flex:1}
.i7-log{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}

/* ===== 8 · Who has it ===== */
.i8{flex:1;min-width:0;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;padding:18px 20px 20px;overflow:hidden}
.i8-col{display:flex;flex-direction:column;gap:8px;min-height:0}
.i8-ch{display:flex;flex-direction:column;gap:6px;padding:10px 12px 12px;border-radius:14px;background:var(--canvas)}
.i8-ch .t{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}
.i8-ch .t .n{font-weight:400;color:var(--ink-3)}
.i8-ch .g{font-size:11.5px;color:var(--ink-3)}
.i8-ch .g b{font-weight:500;color:var(--warn)}
.i8-cards{display:flex;flex-direction:column;gap:8px;overflow:auto;scrollbar-width:none;padding:1px}
.i8-c{display:flex;flex-direction:column;gap:8px;padding:11px 12px;border-radius:12px;background:var(--raised);box-shadow:0 0 0 1px var(--hairline);font-size:12.5px;cursor:pointer}
.i8-c .t{display:flex;align-items:center;gap:6px}
.i8-c .t .tg-spot{margin-left:auto}
.i8-c h4{margin:0;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i8-c .s{display:flex;align-items:center;gap:6px;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i8-c.pend{background:transparent;box-shadow:none;outline:1.5px dashed var(--border-strong);outline-offset:-1.5px}
.i8-c.pend .pd{font-size:12px;color:var(--ink-3)}
'''

JS = r'''
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const D=__DATA__, I=__ICO__, SI=__SI__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CAT={arr:['Arriving','var(--ink-4)'],chk:['Checked in','var(--status-support)'],apr:['Awaiting approval','var(--status-customer)'],wrk:['In repair','var(--status-working)'],rdy:['Ready to release','var(--ink)'],rel:['Released today','var(--ink-3)']};
const ORDER=['arr','chk','apr','wrk','rdy'];
const ROLE={tech:['TE','Technician'],writer:['AP','Approval'],parts:['PT','Parts'],foreman:['FM','Foreman'],manager:['MG','Manager'],warranty:['WA','Warranty']};
const KIND={Call:'phone',Text:'chat',Email:'mail','In person':'user',appr:'check',xfer:'swap',check:'foreman',call:'phone',text:'chat',email:'mail',person:'user'};
const OUTC=o=>/Approved|Update/.test(o)?'ok':/Declined/.test(o)?'no':'mid';
const STG=['Check-in','Diag','Approval','Parts','Repair','Road test','Close-out'];
const ROS=D.ros; let SEL=ROS[1].no, IDEA=1;
const get=no=>ROS.find(r=>r.no===no);
const sq=c=>`<i class="sq" style="background:${CAT[c][1]}"></i>`;
const spot=s=>`<span class="tg-spot">${I.pin}${esc(s)}</span>`;
const age=r=>`<span class="tg-age${r.late?' late':''}">${r.cat==='arr'?'~'+esc(r.age):esc(r.age)}</span>`;
const st=r=>`${SI[r.st]}<span>${esc(r.stn.replace('Hold tech','Hold tech'))}${r.sub?` <span style="color:var(--ink-3)">· ${esc(r.sub.split(' · ')[0])}</span>`:''}</span>`;
const av=t=>`<span class="px-av" title="${esc(t)}">${t||'—'}</span>`;
const lastCt=r=>{const c=r.ct[r.ct.length-1];return c?`<span class="tg-ct">${I[KIND[c[0]]]}<b>${esc(c[3])}</b> · ${esc(c[1])}</span>`:`<span class="tg-ct">${I.phone}No contact yet</span>`;};
const held=r=>{const [to,who,h,g]=r.hold, o=h>g;return `<span class="tg-held${o?' over':''}"><span class="tg-role">${ROLE[to][0]}</span><span class="m"><i class="${o?'over':''}" style="width:${Math.min(100,h/g*100)}%"></i></span>${h<1?Math.round(h*60)+'m':h.toFixed(h<10?1:0)+'h'} / ${g}h</span>`;};
const checks=r=>{const [a,b,p,n,rt]=r.chk;const L=[a===b,p,n,rt,!/^Waiting/.test(r.stn)];return `<span class="tg-checks" title="Ready to close">${L.map(x=>`<i class="${x?'ok':''}"></i>`).join('')}</span>`;};
const ticks=r=>`<span class="tg-ticks">${STG.map((_,i)=>`<i class="${i<r.stage?'done':i===r.stage?(r.cat==='apr'?'wait':'now'):''}"></i>`).join('')}</span>`;
const ring=(r,size=44)=>{const R=size/2-4,C=2*Math.PI*R,done=r.stage+(r.cat==='rdy'?1:0);return `<svg class="tg-ring${r.cat==='rdy'?' ok':''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="t" cx="${size/2}" cy="${size/2}" r="${R}"/><circle class="p" cx="${size/2}" cy="${size/2}" r="${R}" stroke-dasharray="${(C*done/7).toFixed(1)} ${C.toFixed(1)}"/></svg>`;};
const money=n=>'$'+n.toLocaleString('en-US');
const appr=r=>{let ok=0,op=0,no=0;r.ops.forEach(o=>{if(o[2]==='ok')ok+=o[1];else if(o[2]==='no')no+=o[1];else if(o[2]===null)op+=o[1];});return {ok,op,no};};
function needs(){const L=[];ROS.forEach(r=>{
  if(r.cat==='apr')L.push([r,r.late?0:3,'phone',r.ct.length?`${r.sub} ${r.age} ago · ${r.ct[r.ct.length-1][3].toLowerCase()}`:`${r.sub} ${r.age} ago`,r.late?'Call back':'Follow up','Waiting on customers']);
  else if(r.cat==='rdy')L.push([r,r.late?1:2,'release',`${r.stn==='Declined'?'Declined':'Road test done'} · ${r.spot}${r.late?' · waiting '+r.age:''}`,'Release','Ready to go']);
  else if(r.cat==='chk'&&!r.tech)L.push([r,1,'userPlus',`Checked in ${r.age} ago · no tech yet`,'Assign','Ready to go']);
  else if(r.cat==='arr')L.push([r,5,'inArrow',`Arriving ~${r.age} · ${r.spot}`,'Check in','Coming in']);
  else if(r.hold[2]>r.hold[3])L.push([r,4,'swap',`With ${ROLE[r.hold[0]][1].toLowerCase()} ${Math.round(r.hold[2])}h · goal ${r.hold[3]}h`,'Nudge','Held too long']);});
  return L.sort((a,b)=>a[1]-b[1]);}

/* ---------- the selected-RO pane (used by several ideas) ---------- */
function closeList(r){const [a,b,p,n,rt]=r.chk;const hold=/^Waiting/.test(r.stn);
  return [[a===b,'All operations complete',`${a} of ${b}`],[p,'Parts installed',p?'all installed':'not all installed'],[n,'Notes written',n?'every punch has a note':'1 punch with no note'],[rt,'Road test done',rt?'Pass':'not logged'],[!hold,'Holding',hold?r.stn.replace('Waiting – ','Waiting on '):'nothing blocking']];}
function closeHtml(r){return `<div class="tg-close">${closeList(r).map(x=>`<div class="tg-cl${x[0]?' ok':''}"><i></i><span>${x[1]}</span><small>${esc(x[2])}</small></div>`).join('')}</div>`;}
function feed(r,max){const L=r.ct.slice().reverse().slice(0,max||9);return L.length?`<div class="tg-feed">${L.map(c=>`<div class="tg-fe"><span class="gi">${I[KIND[c[0]]]}</span><span><b>${esc(c[0])}</b> · <span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span></span><time>${esc(c[1])}</time>${c[4]?`<p>${esc(c[4])}</p>`:''}</div>`).join('')}</div>`:'<p style="margin:0;font-size:13px;color:var(--ink-3)">No calls or messages yet.</p>';}
function pane(r){const a=appr(r);
  return `<aside class="tg-pane"><div class="eb"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span><span style="margin-left:auto">${age(r)}</span></div>
  <h2>${esc(r.cust)}</h2><div class="sub">${esc(r.veh)} · Unit ${esc(r.unit)}</div>
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${spot(r.spot)}<button class="px-status--button" style="height:28px;font-size:13px">${st(r)}${I.chevD.replace('px-ico','px-ico px-chev')}</button>${r.warr?`<span class="tg-w">${I.warranty}${r.warr[0]}% ready</span>`:''}</div>
  ${r.next?`<div class="px-next"><div class="px-next__head"><span class="px-next__k">Next</span></div><div class="px-next__body"><p class="px-next__t">${esc(r.next)}</p></div></div>`:''}
  <div><div class="tg-sec">Who has it</div><div style="display:flex;align-items:center;gap:10px"><span class="tg-role">${ROLE[r.hold[0]][0]}</span><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:500">${esc(r.hold[1])}</div><div style="font-size:12px;color:var(--ink-3)">${ROLE[r.hold[0]][1]} · holding ${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'}</div></div><button class="px-btn px-btn--sm">${I.swap}Transfer…</button></div></div>
  <div><div class="tg-sec">Customer</div>${feed(r,3)}<div class="tg-acts" style="margin-top:10px"><button class="px-btn px-btn--sm">${I.phone}Log a call</button><button class="px-btn px-btn--sm">${I.chat}Text</button></div></div>
  <div><div class="tg-sec">Ready to close</div>${closeHtml(r)}</div>
  <div class="tg-acts">${r.cat==='rdy'?`<button class="px-btn px-btn--primary">${I.release}Release</button>`:''}<button class="px-btn">Open RO</button><button class="px-btn">${I.pin}Move…</button></div></aside>`;}

/* ===== 1 · Stage lanes ===== */
function idea1(){const SHORT={arr:'Arriving',chk:'Checked in',apr:'Approval',wrk:'In repair',rdy:'Ready'};const lane=k=>{const L=ROS.filter(r=>r.cat===k),late=L.filter(r=>r.late).length;
  return `<section class="i1-lane"><div class="i1-lh" title="${CAT[k][0]}">${sq(k)}${SHORT[k]}<span class="n">${L.length}</span>${late?`<span class="x">${late} late</span>`:''}</div><div class="i1-cards">${L.map(r=>`<button class="i1-c${r.no===SEL?' tg-sel':''}" data-sel="${r.no}">
    <div class="t">${r.live?'<i class="tg-live"></i>':''}<span class="tg-ro">${r.no}</span>${r.warr?`<span class="tg-w">${I.warranty}</span>`:''}${age(r)}</div>
    <h4>${esc(r.cust)}</h4><div class="m">${SI[r.st]}<span style="overflow:hidden;text-overflow:ellipsis">${esc(r.sub?r.sub.split(' · ')[0]:r.stn)}</span></div><div class="m">${spot(r.spot)}${lastCt(r)}${av(r.tech)}</div></button>`).join('')||'<div class="i1-empty">None</div>'}</div></section>`;};
  return `<div class="i1"><div class="i1-lanes">${ORDER.map(lane).join('')}</div><div class="i1-rel">${sq('rel')}<b>Released today</b><span>${D.rel.length}</span>${D.rel.map(x=>`<span class="tg-spot">${x.no}</span><span style="color:var(--ink-3)">${esc(x.cust)} · ${x.at}</span>`).join('')}</div></div>${pane(get(SEL))}`;}

/* ===== 2 · Yard plan ===== */
function idea2(){const at={};ROS.forEach(r=>at[r.spot]=r);
  const s=(id,lbl)=>{const r=at[id];return r?`<button class="i2-s occ${r.no===SEL?' tg-sel':''}" data-sel="${r.no}" title="${esc(r.cust)}"><span class="l">${lbl||id}</span><b>${sq(r.cat)}${r.no.slice(-4)}${r.live?'<i class="tg-live"></i>':''}</b><small>${esc(r.cust)}</small><span class="fl">${r.warr?I.warranty:''}${r.late?'<i class="lt"></i>':''}</span></button>`:`<div class="i2-s"><span class="l">${lbl||id}</span></div>`;};
  const grid=(ids,cols)=>`<div class="i2-g" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${ids.map(x=>Array.isArray(x)?s(x[0],x[1]):s(x)).join('')}</div>`;
  const lot=(row,n)=>Array.from({length:n},(_,i)=>row+(i+1));
  return `<div class="i2">
   <div class="i2-row"><section class="i2-z" style="flex:1.7"><div class="i2-zh">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid(['UP','B1','B2','B3','B4','AW1','B5','B6','B7','B8'],5)}</section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Check-in<small>waiting arrival · triage lanes</small></div>${grid(['W1','W2','W3','W4'],4)}<div style="height:6px"></div>${grid(['T1','T2','T3'],4)}</section></div>
   <section class="i2-z"><div class="i2-zh">Parking lot<small>C line · waiting on customers &nbsp;·&nbsp; D line · ready to release &nbsp;·&nbsp; E line · overflow</small></div>${grid(lot('C',10),10)}<div style="height:6px"></div>${grid(lot('D',10),10)}<div style="height:6px"></div>${grid(lot('E',10),10)}</section>
   <div class="i2-row"><section class="i2-z" style="flex:1"><div class="i2-zh">Warranty<small>on the yard</small></div><div style="display:flex;flex-direction:column;gap:6px">${ROS.filter(r=>r.warr).map(r=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${r.no}</span><b style="font-weight:500">${esc(r.cust)}</b>${spot(r.spot)}<span style="margin-left:auto;color:var(--ink-3);font-size:12px">${r.warr[0]}% ready · ${r.warr[1]} missing</span><span style="width:80px" class="i6-wb"><i style="width:${r.warr[0]}%"></i></span></div>`).join('')}</div></section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Released today<small>${D.rel.length}</small></div><div style="display:flex;flex-direction:column;gap:6px">${D.rel.map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${x.no}</span><b style="font-weight:500">${esc(x.cust)}</b><span style="margin-left:auto;color:var(--ink-3);font-size:12px">${x.at}</span></div>`).join('')}</div></section></div>
   <div class="i2-leg">${ORDER.map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span><i class="tg-live"></i>On the clock</span><span><i style="width:6px;height:6px;border-radius:50%;background:var(--warn);display:inline-block"></i>Late</span><span style="color:var(--accent-text)">${I.warranty}Warranty</span></div>
  </div>${pane(get(SEL))}`;}

/* ===== 3 · Action inbox ===== */
function idea3(){const N=needs();const groups={};N.forEach(x=>{(groups[x[5]]=groups[x[5]]||[]).push(x);});
  if(!N.some(x=>x[0].no===SEL))SEL=N[0][0].no;
  const r=get(SEL),a=appr(r);
  const list=Object.keys(groups).map(g=>`<div class="i3-grp">${g}</div>`+groups[g].map(([x,_,icn,why,btn])=>`<div class="i3-it${x.no===SEL?' on':''}" data-sel="${x.no}">${x.late?'<i class="dot"></i>':''}<span class="gi">${I[icn]}</span><span class="t"><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b></span><span class="w${x.late?' late':''}">${esc(why)}</span><button class="px-btn px-btn--sm${btn==='Release'?' px-btn--primary':''}">${btn}</button></div>`).join('')).join('');
  const thread=r.ct.map(c=>`<div class="i3-m"><span class="gi">${I[KIND[c[0]]]}</span><div class="bd"><div class="hd"><b>${esc(c[0])}</b><span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span><span style="color:var(--ink-3)">${esc(c[2])}</span><time>${esc(c[1])}</time></div>${c[4]?`<p>${esc(c[4])}</p>`:''}</div></div>`).join('');
  return `<div class="i3-list"><div class="i3-lh">Needs action<span class="n">${N.length}</span></div><div class="i3-scroll">${list}</div></div>
  <div class="i3-main"><div class="i3-top"><div class="r1"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2>
   <div class="r2">${spot(r.spot)}${ticks(r)}<span style="display:inline-flex;gap:6px;align-items:center">${st(r)}</span>${held(r)}<span style="margin-left:auto;display:flex;gap:8px"><button class="px-btn px-btn--sm">${I.swap}Transfer…</button><button class="px-btn px-btn--sm">Open RO</button></span></div></div>
   <div class="i3-thread"><span class="i3-day">This RO · calls, texts, approvals and transfers</span>${thread||'<div class="i3-m sys"><span class="gi">'+I.phone+'</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>'}
    <div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">Transferred to <b style="color:var(--ink)">${esc(r.hold[1])}</b> · ${ROLE[r.hold[0]][1]}<time>${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'} ago</time></div></div></div>
    <div class="i3-appr"><div class="h">${I.check}Approvals<span>Approved ${money(a.ok)} · open ${money(a.op)}${a.no?' · declined '+money(a.no):''}</span></div>${r.ops.map((o,i)=>`<div class="i3-op"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button class="${o[2]==='part'?'on':''}">Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div>
   </div>
   <div class="i3-comp"><div class="r"><span class="lbl">Log</span>${['Call','Text','Email','In person'].map((k,i)=>`<button class="tg-chip${i===0?' on':''}" data-chip="k">${I[KIND[k]]}${k}</button>`).join('')}<span style="width:12px"></span><span class="lbl">Outcome</span>${['Approved','Declined','Left voicemail','No answer','Update given','Will call back'].map((k,i)=>`<button class="tg-chip${i===2?' on':''}" data-chip="o">${k}</button>`).join('')}</div>
    <div class="r"><textarea rows="1" placeholder="Note — e.g. approved $540 for op 2"></textarea><button class="px-btn px-btn--primary px-btn--sm send">Log it<span class="px-kbd">↵</span></button></div></div></div>`;}

/* ===== 4 · Day timeline ===== */
function idea4(){const A=7,Z=18,pos=h=>((h-A)/(Z-A)*100).toFixed(2)+'%',NOW=10.25;
  const rows=ROS.filter(r=>r.tl.length||r.cat==='arr').sort((a,b)=>ORDER.indexOf(a.cat)-ORDER.indexOf(b.cat));
  const due={'37489':12.25,'37602':15.67,'37555':13.5,'37641':11.5,'37644':13,'37460':11};
  const grid=Array.from({length:Z-A+1},(_,i)=>`<i class="i4-grid" style="left:${pos(A+i)}"></i>`).join('');
  const row=r=>{const segs=r.tl.map((s,i)=>{const e=i<r.tl.length-1?r.tl[i+1][0]:NOW;return `<i class="i4-seg${s[1]==='apr'?' wait':''}" style="left:${pos(s[0])};width:calc(${pos(e)} - ${pos(s[0])});background-color:${CAT[s[1]][1]}" title="${CAT[s[1]][0]}"></i>`;}).join('');
    const ev=r.ev.map(e=>`<span class="i4-ev" style="left:${pos(e[0])}" title="${e[1]}">${I[KIND[e[1]]]}</span>`).join('');
    const dd=due[r.no]?`<i class="i4-due" style="left:${pos(due[r.no])}" title="Promised"></i>`:'';
    return `<div class="i4-row${r.no===SEL?' on':''}" data-sel="${r.no}"><div class="i4-who">${sq(r.cat)}<span class="tg-ro">${r.no}</span><b>${esc(r.cust)}</b><span style="margin-left:auto">${spot(r.spot)}</span></div><div class="i4-tr">${grid}${segs}${dd}${ev}</div></div>`;};
  return `<div class="i4"><div class="i4-axis"><span style="font-size:12px;font-weight:500">Today on the yard</span><div class="i4-ax">${Array.from({length:Z-A+1},(_,i)=>{const h=A+i;return `<span style="left:${pos(h)}">${h===12?'12p':h>12?(h-12)+'p':h+'a'}</span>`;}).join('')}</div></div>
   <div class="i4-rows">${rows.map(row).join('')}<div style="position:absolute;top:0;bottom:0;left:260px;right:0;pointer-events:none"><i class="i4-now" style="left:${pos(NOW)}"></i></div></div>
   <div class="i4-foot">${ORDER.map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span>${I.phone}Call</span><span>${I.chat}Text</span><span>${I.mail}Email</span><span>${I.user}In person</span><span>${I.check}Approval</span><span>${I.swap}Transfer</span><span><i style="width:8px;height:8px;background:var(--ink);transform:rotate(45deg);border-radius:1px;display:inline-block"></i>Promised</span></div></div>${pane(get(SEL))}`;}

/* ===== 5 · Ledger ===== */
function idea5(){const L=ROS.slice().sort((a,b)=>(b.late-a.late)||ORDER.indexOf(a.cat)-ORDER.indexOf(b.cat));
  const head=`<div class="i5-h"><span>RO</span><span>Customer</span><span>Stage</span><span>Spot</span><span>Status</span><span>Who has it</span><span>Last contact</span><span>Approval</span><span>Close</span><span style="justify-content:flex-end">Age ${I.chevD}</span></div>`;
  const row=r=>{const a=appr(r),on=r.no===SEL;return `<div class="i5-r${on?' on':''}" data-sel="${r.no}"><span class="tg-ro">${r.live?'<i class="tg-live"></i> ':''}${r.no}</span><span class="c"><b>${esc(r.cust)}</b><small>Unit ${esc(r.unit)}${r.warr?' · warranty':''}</small></span>
   <span class="i5-stg"><span style="display:flex;align-items:center;gap:6px">${sq(r.cat)}${CAT[r.cat][0]}</span>${ticks(r)}</span><span>${spot(r.spot)}</span><span class="i5-st">${SI[r.st]}<span style="overflow:hidden;text-overflow:ellipsis">${esc(r.sub?r.sub.split(' · ')[0]:r.stn)}</span></span><span>${held(r)}</span><span>${lastCt(r)}</span>
   <span class="i5-ap">${a.ok||a.op?`${a.ok?money(a.ok):''}${a.op?`${a.ok?' ':''}<em>${a.ok?'+':''}${money(a.op)} open</em>`:''}`:'—'}</span><span>${checks(r)}</span><span style="text-align:right">${age(r)}</span></div>`+(on?`<div class="i5-x"><div><div class="tg-sec">Customer</div>${feed(r,3)}<div class="tg-acts" style="margin-top:8px"><button class="px-btn px-btn--sm">${I.phone}Log a call</button><button class="px-btn px-btn--sm">${I.chat}Text</button><button class="px-btn px-btn--sm">${I.swap}Transfer…</button></div></div><div><div class="tg-sec">Approvals</div>${r.ops.map((o,i)=>`<div class="tg-cl${o[2]==='ok'||o[2]==='warr'?' ok':''}"><i></i><span>Op ${i+1} · ${esc(o[0].split(' – ')[0])}</span><small>${o[2]==='warr'?'warranty':o[1]?money(o[1]):''}</small></div>`).join('')}</div><div><div class="tg-sec">Ready to close</div>${closeHtml(r)}</div></div>`:'');};
  const g=k=>{const L2=L.filter(r=>r.cat===k);return L2.length?`<div style="display:flex;align-items:center;gap:8px;height:40px;margin-top:8px;font-size:13px;font-weight:600">${sq(k)}${CAT[k][0]}<span style="font-weight:400;color:var(--ink-3)">${L2.length}</span></div>`+L2.map(row).join(''):'';};
  return `<div class="i5">${head}${ORDER.map(g).join('')}</div>`;}

/* ===== 6 · Tiles and rings ===== */
function idea6(){const N=needs();const by=k=>ROS.filter(r=>r.cat===k);
  const kp=[['On the yard',ROS.length,`${by('wrk').length} in repair · ${by('arr').length} arriving`,''],['Awaiting approval',by('apr').length,money(by('apr').reduce((s,r)=>s+appr(r).op,0))+' open',''],['Ready to release',by('rdy').length,'2 picking up today',''],['Late',ROS.filter(r=>r.late).length,'over the goal for their stage','w'],['Customer contacts',ROS.reduce((s,r)=>s+r.ct.filter(c=>/^\d/.test(c[1])).length,0),'calls, texts and emails today','']];
  const tile=r=>{const n=N.find(x=>x[0]===r);return `<div class="i6-t${r.late?' late':''}${r.no===SEL?' tg-sel':''}" data-sel="${r.no}"><div class="a"><span class="rg">${ring(r)}<b>${r.stage+(r.cat==='rdy'?1:0)}/7</b></span><span class="nm"><h4>${esc(r.cust)}</h4><span class="tg-ro">RO-${r.no}</span></span>${r.late?'<span class="tg-late">Late</span>':''}</div>
   <div class="ln">${spot(r.spot)}${SI[r.st]}<span style="overflow:hidden;text-overflow:ellipsis">${esc(r.sub?r.sub.split(' · ')[0]:r.stn)}</span>${age(r)}</div><div class="ln">${held(r)}</div>${r.warr?`<div class="ln"><span class="tg-w">${I.warranty}Warranty ${r.warr[0]}% ready · ${r.warr[1]} missing</span></div><div class="i6-wb"><i style="width:${r.warr[0]}%"></i></div>`:''}
   <div class="nx"><span>${n?esc(n[3]):lastCt(r)}</span>${n?`<button class="px-btn px-btn--sm${n[4]==='Release'?' px-btn--primary':''}">${n[4]}</button>`:'<button class="px-btn px-btn--sm px-btn--ghost">Open</button>'}</div></div>`;};
  return `<div class="i6"><div class="i6-kpi">${kp.map(k=>`<div class="i6-k ${k[3]}"><span>${k[0]}</span><b>${k[1]}</b><small>${k[2]}</small></div>`).join('')}</div>
   ${['apr','rdy','chk','arr','wrk'].map(k=>`<div class="i6-gh">${sq(k)}${CAT[k][0]}<span class="n">${by(k).length}</span></div><div class="i6-grid">${by(k).map(tile).join('')}</div>`).join('')}</div>`;}

/* ===== 7 · Triage desk ===== */
function idea7(){const r=get(SEL),a=appr(r);
  const list=ORDER.map(k=>{const L=ROS.filter(x=>x.cat===k);return `<div class="i7-g">${sq(k)}${CAT[k][0]}<span style="color:var(--ink-4)">${L.length}</span></div>`+L.map(x=>`<div class="i7-it${x.no===SEL?' on':''}" data-sel="${x.no}">${x.live?'<i class="tg-live"></i>':''}<span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b>${age(x)}</div>`).join('');}).join('');
  const subs=['3/3','skipped','1 of 2','in hand','2 of 3 ops','—','—'];
  const steps=STG.map((n,i)=>`<div class="i7-step ${i<r.stage?'done':i===r.stage?(r.cat==='apr'?'wait':'now'):''}"><i></i><b>${n}</b><small>${i<r.stage?'done':i===r.stage?'now':'—'}</small></div>`).join('');
  const done=closeList(r).filter(x=>x[0]).length,C=2*Math.PI*22;
  return `<div class="i7-list"><div class="tg-find" style="margin:14px 12px 0">${I.search}<input class="px-input" style="width:100%;box-sizing:border-box" placeholder="RO, unit or customer"></div><div class="i7-scroll">${list}</div></div>
  <div class="i7-main"><div class="i7-hd"><div class="l"><div class="eb"><span class="tg-ro">RO-${r.no}</span>·<span>${esc(r.veh)} · Unit ${esc(r.unit)}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2></div><div class="r">${spot(r.spot)}<button class="px-status--button">${st(r)}${I.chevD.replace('px-ico','px-ico px-chev')}</button></div></div>
   <div class="i7-strip"><div class="tg-sec" style="display:flex;gap:8px">Stage<span style="color:var(--ink-2)">${STG[r.stage]} · ${r.stage+1} of 7</span><span style="margin-left:auto">ready ${esc(r.ready)}</span></div><div class="i7-steps">${steps}</div></div>
   ${(()=>{const n=needs().find(x=>x[0]===r);const t=r.next||(n?n[3]:'Nothing waiting on anyone — keep going.');return `<div class="i7-next"><span class="k">Next</span><p>${esc(t.charAt(0).toUpperCase()+t.slice(1))}</p><button class="px-btn px-btn--sm">${I.phone}Log a call</button>${n?`<button class="px-btn px-btn--accent px-btn--sm">${n[4]}</button>`:''}</div>`;})()}
   <div class="i7-two"><div class="i7-card"><div class="h">${I.phone}Customer<small>${r.ct.length} contact${r.ct.length===1?'':'s'}</small></div>${feed(r,4)}<div class="i7-log">${['Call','Text','Email','In person'].map(k=>`<button class="tg-chip">${I[KIND[k]]}${k}</button>`).join('')}</div></div>
    <div class="i7-card"><div class="h">${I.check}Approvals<small>approved ${money(a.ok)} · open ${money(a.op)}</small></div>${r.ops.map((o,i)=>`<div class="i3-op" style="padding:8px 0"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button>Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div></div>
   <div class="i7-two"><div class="i7-card"><div class="h">Ready to close<small>${done} of 5</small></div><div class="i7-rtc"><svg class="tg-ring${done===5?' ok':''}" width="56" height="56" viewBox="0 0 56 56"><circle class="t" cx="28" cy="28" r="22"/><circle class="p" cx="28" cy="28" r="22" stroke-dasharray="${(C*done/5).toFixed(1)} ${C.toFixed(1)}"/></svg>${closeHtml(r)}</div></div>
    <div class="i7-card"><div class="h">${I.swap}Who has it</div><div style="display:flex;align-items:center;gap:10px"><span class="tg-role">${ROLE[r.hold[0]][0]}</span><div style="flex:1"><div style="font-weight:500;font-size:14px">${esc(r.hold[1])}</div><div style="font-size:12.5px;color:var(--ink-3)">${ROLE[r.hold[0]][1]}</div></div><button class="px-btn px-btn--sm px-btn--primary">Transfer…</button></div><div style="margin-top:12px">${held(r)}</div><div class="tg-kv" style="margin-top:14px"><span>Tech</span><b style="font-weight:400">${r.tech||'Unassigned'}</b><span>Key tag</span><b class="px-id">1${r.no.slice(-2)}</b><span>Ready about</span><b style="font-weight:400">${esc(r.ready)}</b></div></div></div>
  </div>`;}

/* ===== 8 · Who has it ===== */
function idea8(){const cols=['writer','tech','parts','foreman','warranty','manager'];
  const pend={manager:[['37011','Catawba Timber','Sent by Ray Owens 12m ago — waiting to accept']]};
  return `<div class="i8">${cols.map(k=>{const L=ROS.filter(r=>r.hold[0]===k).sort((a,b)=>b.hold[2]/b.hold[3]-a.hold[2]/a.hold[3]),over=L.filter(r=>r.hold[2]>r.hold[3]).length,goal={tech:8,writer:4,parts:24,foreman:2,warranty:24,manager:4}[k];
   return `<section class="i8-col"><div class="i8-ch"><div class="t"><span class="tg-role">${ROLE[k][0]}</span>${ROLE[k][1]}<span class="n">${L.length}</span></div><div class="g">Goal ${goal} h${over?` · <b>${over} over</b>`:''}</div></div><div class="i8-cards">${L.map(r=>`<div class="i8-c${r.no===SEL?' tg-sel':''}" data-sel="${r.no}"><div class="t"><span class="tg-ro">${r.no}</span>${r.warr?`<span class="tg-w">${I.warranty}</span>`:''}${spot(r.spot)}</div><h4>${esc(r.cust)}</h4><div class="s">${sq(r.cat)}${CAT[r.cat][0]}</div><div class="s" style="font-size:12px">${esc(r.hold[1])}</div>${held(r)}</div>`).join('')}${(pend[k]||[]).map(p=>`<div class="i8-c pend"><div class="t"><span class="tg-ro">${p[0]}</span></div><h4>${esc(p[1])}</h4><span class="pd">${esc(p[2])}</span></div>`).join('')}${L.length||pend[k]?'':'<div class="i1-empty">Nobody waiting on this desk</div>'}</div></section>`;}).join('')}</div>`;}

/* ---------- page ---------- */
const IDEAS={1:['Stage lanes','Five lanes, Arriving → Ready to release, with small cards and a selected-RO pane.',idea1],2:['Yard plan','The lot drawn as spots — where every truck is, coloured by stage.',idea2],3:['Action inbox','What needs doing, in order, with the customer conversation beside it.',idea3],4:['Day timeline','Today as a timeline: how long each truck has waited, and every call on it.',idea4],5:['Ledger','One dense row per RO, with the details opening in place.',idea5],6:['Tiles and rings','Shop numbers on top, then a tile per RO with its progress ring and next action.',idea6],7:['Triage desk','One RO at a time: stage, next step, ready to close, customer and approvals.',idea7],8:['Who has it','Columns by who holds each RO, with time held against the goal.',idea8]};
const NOTES={
1:[['Lanes, not tabs','The five stages are always on screen; counts and late counts in each header.'],['Card','RO, age, customer, spot, status, tech, last contact — warranty as a small shield.'],['Selected pane','Who has it, the last three contacts, Ready to close, and Release / Move.'],['Released today','A quiet strip at the bottom instead of a sixth lane.']],
2:[['Locations first','Bays, UpTime and awning, the arrival line, triage lanes and lot rows — empty spots are hatched.'],['Spot tile','Last 4 of the RO, a stage square, the customer; amber dot when late, shield for warranty.'],['One legend','Stage squares, the running-clock dot, late and warranty, in one line.']],
3:[['Work comes to you','Needs action grouped: Waiting on customers, Ready to go, Held too long, Coming in — each with one button.'],['The conversation','Calls, texts, emails, approvals and transfers for the RO as one thread.'],['Log in two taps','Pick the kind and the outcome, add a note, ↵.']],
4:[['Waits you can see','Each truck’s day as stage bars; approval waits are hatched.'],['Every touchpoint','Calls, texts, emails, approvals and transfers sit on the bar where they happened.'],['Promised times','A diamond marks the promise; the bronze line is now.']],
5:[['Everything in a row','Stage ticks, spot, status, who has it and for how long, last contact, approvals, close checks, age.'],['Opens in place','Click a row for the customer log, approvals and Ready to close — no pane needed.'],['Sort by column','Header sorting replaces the sorting tabs.']],
6:[['Shop at a glance','Five numbers: on the yard, awaiting approval, ready to release, late, contacts today.'],['Tile','Progress ring (stages done of 7), serif customer, spot, status, time held, and its next action.'],['Late','An amber Late pill and an amber age — nothing else turns colour.']],
7:[['Desk for one RO','The list on the left; the work on the right.'],['Three bars','Stage progress, Next step and Ready to close — each its own strip.'],['Customer and approvals','Side by side, with logging and Approve / Partly / Decline right there.']],
8:[['By responsibility','Approval, Technician, Parts, Foreman, Warranty, Manager — the transfer desks.'],['Time held','Each card shows hours held against the desk’s goal; over goal turns red.'],['Pending transfers','Dashed cards wait for the next desk to accept.']]};
const RAIL=['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'];
function render(){const [name,desc,fn]=IDEAS[IDEA];
  const facts=`<span><b>${ROS.length}</b> on the yard</span>·<span><b>${ROS.filter(r=>r.cat==='apr').length}</b> awaiting approval</span>·<span><b>${ROS.filter(r=>r.cat==='rdy').length}</b> ready to release</span>·<span class="w"><b>${ROS.filter(r=>r.late).length}</b> late</span>`;
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${I.sidebar}</a><a>${I.search}</a><span class="ck"><i></i></span><span class="sep"></span>${RAIL.map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='triage'?'is-on':''}">${I[k]}</a>`).join('')}<span class="sp"></span><a>${I.gear}</a><span class="px-av px-av--md px-av--me">MR</span></aside>
   <section class="tg-panel"><header class="tg-head"><h1>Triage</h1><span class="tg-facts">${facts}</span><label class="tg-find">${I.search}<input class="px-input" placeholder="RO, unit, customer or VIN"></label><button class="px-btn px-btn--primary">${I.plus}New RO</button></header><div class="tg-body">${fn()}</div></section></div>`;
  $('.wt-about').innerHTML=`<h2>${IDEA} · ${name}<small>${desc}</small></h2><ul>${NOTES[IDEA].map(n=>`<li><b>${n[0]}</b>${n[1]}</li>`).join('')}</ul>`;
  $$('[data-idea]').forEach(b=>b.classList.toggle('is-on',+b.dataset.idea===IDEA));}
$$('[data-idea]').forEach(b=>b.onclick=()=>{IDEA=+b.dataset.idea;render();});
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
mock.addEventListener('click',e=>{const s=e.target.closest('[data-sel]');if(s&&!e.target.closest('.px-btn')){SEL=s.dataset.sel;render();return;}
  const c=e.target.closest('[data-chip]');if(c){$$(`[data-chip="${c.dataset.chip}"]`,c.parentElement).forEach(x=>x.classList.toggle('on',x===c));}});
addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;const n=+e.key;if(n>=1&&n<=8){IDEA=n;render();}});
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
ideas = "".join(f'<button data-idea="{i}">{i} · {n}</button>' for i, n in enumerate(["Stage lanes", "Yard plan", "Action inbox", "Day timeline", "Ledger", "Tiles and rings", "Triage desk", "Who has it"], 1))
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage ideas</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — 8 ideas</h1><div class="wt-ideas">{ideas}</div>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
