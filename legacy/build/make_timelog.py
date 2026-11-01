# Time Log overhaul mock-up — the same panel as Triage, Foreman and Warranty (Parsec design system, Ivory + Graphite).
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read()
tg = open(f"{A}/tg.css").read()
tg = tg.replace(':root:is([data-theme="ivd"],[data-theme="mist"],[data-theme="atd"]) .tg{', ':root[data-theme="dark"] .tg{')
# the mock's own frame (rail, panel, buttons, toast) — the same lines the Warranty mock-up uses
wcss = open(f"{B}/make_warranty.py").read()
wcss = re.search(r'CSS = shell \+ r"""(.*?)"""', wcss, re.S).group(1)
frame = "\n".join(l for l in wcss.split("\n") if l.strip().startswith((".tg-panel", ".tg-rail", ".rl-badge", ".tg .btn", ".tg :focus-visible", ".toast-fm")))

IC = dict(P.ICONS)
s0 = open("/mnt/user-data/outputs/Parsec Warranty money and parts.html", encoding="utf-8").read()
i0 = s0.index("const P=") + 8; IC.update(json.loads(s0[i0:s0.index(", SI=", i0)]))
IC.update({
 "chevL": '<path d="M14.5 6 8.5 12l6 6"/>',
 "calendar": '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
 "download": '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
 "users": '<circle cx="9" cy="8.5" r="3.25"/><path d="M3.5 19.5c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 6.1M17.5 14.8c1.7.6 2.8 2.2 3 4.7"/>',
 "coffee": '<path d="M5 9h11v5.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5z"/><path d="M16 10.5h1.25a2.25 2.25 0 0 1 0 4.5H16M8 3.5v2.5M11 3.5v2.5"/>',
 "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.2 5.2l-5 5a1.8 1.8 0 0 0 2.5 2.5l5-5a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.3-.3-.3-2.3z"/>',
 "sheet": '<rect x="5" y="3.75" width="14" height="16.5" rx="2"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>',
 "split": '<path d="M12 4v16M5 8l-2 4 2 4M19 8l2 4-2 4"/>',
})

CSS = shell + r"""
""" + frame + r"""
/* ===== Time Log — prefix tk-, on the Triage tg- base ===== */
.tk{--tk-job:#96621f;--tk-air:#2a9d8f;--tk-shop:#6250d6;--tk-ontxt:#FFFFFF;}
:root[data-theme="dark"] .tk{--tk-job:#b97b30;--tk-air:#2a9d8f;--tk-shop:#9085e9;--tk-ontxt:#151514;}
.tk .tg-list{flex-basis:356px;width:356px;}
.tk .tg-pop{left:auto;}
/* the person */
.tk-who{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 8px 0 4px !important;border-radius:999px;font-size:13px;font-weight:500;color:var(--tg-ink);box-shadow:inset 0 0 0 1px var(--tg-hair);flex:none;}
.tk-who:hover{background:var(--tg-fill);}
.tk-who .tg-ic{color:var(--tg-ink3);}
.tk-av{width:22px;height:22px;border-radius:999px;display:inline-grid;place-items:center;flex:none;background:var(--tg-acct);color:var(--tg-acctx);font:600 9.5px/1 var(--tg-sans);letter-spacing:.02em;}
.tk-av.lg{width:30px;height:30px;font-size:11px;}
.tk-av.all{background:var(--tg-sel);color:var(--tg-ink2);}
.tk-live{width:7px;height:7px;border-radius:50%;background:var(--tg-st-working);box-shadow:0 0 0 3px color-mix(in srgb,var(--tg-st-working) 20%,transparent);flex:none;}
.tk-hb{display:inline-flex;align-items:center;gap:6px;}
/* the day list */
.tk-di{position:relative;display:grid;grid-template-columns:44px minmax(0,1fr) auto;grid-template-rows:auto auto auto;column-gap:12px;row-gap:3px;align-items:center;padding:10px 20px;cursor:pointer;transition:background-color .12s;}
.tk-di:hover{background:var(--tg-fill);}
.tk-di.on{background:var(--tg-sel);}
.tk-di.kb{box-shadow:inset 3px 0 0 var(--tg-acc);}
.tk-dt{grid-row:1 / span 3;align-self:start;display:flex;flex-direction:column;align-items:center;justify-content:center;width:44px;height:44px;border-radius:11px;background:var(--tg-fill);}
.tk-di.on .tk-dt{background:var(--tg-raised);}
.tk-dt small{font-size:10.5px;font-weight:600;letter-spacing:.04em;color:var(--tg-ink3);text-transform:uppercase;line-height:12px;}
.tk-dt b{font:500 18px/20px var(--tg-serif);color:var(--tg-ink);}
.tk-di.today .tk-dt{background:var(--tg-primary);} .tk-di.today .tk-dt small,.tk-di.today .tk-dt b{color:var(--tg-onprimary);}
.tk-di .r1{grid-column:2;display:flex;align-items:center;gap:7px;min-width:0;font-size:13.5px;font-weight:500;white-space:nowrap;}
.tk-di .r1 small{font-size:12px;font-weight:400;color:var(--tg-ink3);}
.tk-di .tot{grid-column:3;grid-row:1;font:500 13px/1 var(--tg-mono);color:var(--tg-ink);text-align:right;}
.tk-di .tot small{display:block;margin-top:3px;font:400 11px/1 var(--tg-sans);color:var(--tg-ink3);}
.tk-di .strip{grid-column:2 / span 2;grid-row:2;}
.tk-di .why{grid-column:2 / span 2;grid-row:3;display:flex;align-items:center;gap:5px;font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.tk-di .why.bad{color:var(--tg-bad);font-weight:500;} .tk-di .why.warn{color:var(--tg-warn);}
.tk-di .why .tg-ic{flex:none;}
.tk-di.empty .r1{color:var(--tg-ink3);font-weight:400;}
.tk-pill{display:inline-flex;align-items:center;gap:5px;height:18px;padding:0 6px;border-radius:5px;font-size:11px;font-weight:600;background:var(--tg-good-t);color:var(--tg-good);}
.tk-pill.off{background:var(--tg-fill);color:var(--tg-ink3);}
.tk-pill.warn{background:var(--tg-warn-t);color:var(--tg-warn);}
.tk-pill.bad{background:var(--tg-bad-t);color:var(--tg-bad);}
/* mini day strip */
.tk-strip{position:relative;height:6px;border-radius:3px;background:var(--tg-fill);overflow:hidden;}
.tk-strip i{position:absolute;top:0;bottom:0;border-radius:2px;}
.tk-strip i.job{background:var(--tk-job);} .tk-strip i.air{background:var(--tk-air);} .tk-strip i.shop{background:var(--tk-shop);}
.tk-strip i.prob{background:var(--tg-bad);}
/* ---------- Day ---------- */
.tk-day{height:100%;overflow:auto;scrollbar-width:thin;padding-bottom:28px;}
.tk-dh{display:flex;align-items:center;gap:10px;padding:20px 28px 0;}
.tk-dh h2{margin:0;font:500 26px/32px var(--tg-serif);letter-spacing:-.01em;white-space:nowrap;}
.tk-dh .nav{display:inline-flex;gap:2px;}
.tk-dh .sp{flex:1;}
.tk-stats{display:flex;flex-wrap:wrap;gap:6px 30px;padding:14px 28px 2px;}
.tk-stat small{display:block;font-size:12px;color:var(--tg-ink3);}
.tk-stat b{display:inline-flex;align-items:baseline;gap:6px;font:500 19px/26px var(--tg-mono);color:var(--tg-ink);letter-spacing:-.01em;}
.tk-stat b em{font:500 12px/1 var(--tg-sans);font-style:normal;color:var(--tg-ink3);}
.tk-stat .sw{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px;vertical-align:1px;}
.tk-stat.good b em{color:var(--tg-good);}
/* the timeline */
.tk-tl{position:relative;margin:16px 28px 0;padding:30px 18px 12px;border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.tk-trk{position:relative;height:48px;}
.tk-clk{position:absolute;top:0;bottom:0;border-radius:6px;background:var(--tg-fill);}
.tk-b{position:absolute;top:5px;bottom:5px;border-radius:4px;display:flex;align-items:center;padding:0 6px;overflow:hidden;font:600 11px/1 var(--tg-mono);color:var(--tk-ontxt);white-space:nowrap;cursor:pointer;box-shadow:0 0 0 1px var(--tg-raised);}
.tk-b.job{background:var(--tk-job);} .tk-b.air{background:var(--tk-air);} .tk-b.shop{background:var(--tk-shop);}
.tk-b.run{background:repeating-linear-gradient(135deg,var(--tk-job) 0 7px,color-mix(in srgb,var(--tk-job) 82%,var(--tg-raised)) 7px 12px);}
.tk-b.sel{box-shadow:0 0 0 2px var(--tg-raised),0 0 0 4px var(--tg-ink);z-index:2;}
.tk-b.prob{box-shadow:0 0 0 2px var(--tg-raised),0 0 0 4px var(--tg-bad);z-index:2;}
.tk-b .h{position:absolute;top:50%;width:4px;height:18px;margin-top:-9px;border-radius:2px;background:var(--tk-ontxt);opacity:.85;cursor:ew-resize;}
.tk-b .h.l{left:2px;} .tk-b .h.r{right:2px;}
.tk-lunch{position:absolute;top:5px;bottom:5px;border-radius:4px;box-shadow:inset 0 0 0 1px var(--tg-border);background:repeating-linear-gradient(135deg,transparent 0 5px,var(--tg-hair) 5px 6px);display:grid;place-items:center;color:var(--tg-ink3);}
.tk-lunch .tg-ic{width:14px;height:14px;}
.tk-flag{position:absolute;top:-22px;transform:translateX(-50%);display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:4px;font:600 9.5px/1 var(--tg-sans);letter-spacing:.05em;background:var(--tg-ink);color:var(--tg-panel);white-space:nowrap;}
.tk-flag::after{content:"";position:absolute;left:50%;top:16px;width:1px;height:10px;background:var(--tg-ink);}
.tk-flag.out{background:var(--tg-ink3);} .tk-flag.out::after{background:var(--tg-ink3);}
.tk-flag.bad{background:var(--tg-bad);} .tk-flag.bad::after{background:var(--tg-bad);}
.tk-now{position:absolute;top:-6px;bottom:-6px;width:2px;margin-left:-1px;background:var(--tg-bad);border-radius:1px;z-index:3;}
.tk-now::before{content:"";position:absolute;left:-3px;top:-4px;width:8px;height:8px;border-radius:50%;background:var(--tg-bad);}
.tk-ax{position:relative;height:18px;margin-top:6px;}
.tk-ax span{position:absolute;transform:translateX(-50%);font:500 11px/18px var(--tg-mono);color:var(--tg-ink4);}
.tk-ax span.hr{color:var(--tg-ink3);}
.tk-grid{position:absolute;inset:0;pointer-events:none;}
.tk-grid i{position:absolute;top:0;bottom:-8px;width:1px;background:var(--tg-hair);}
.tk-leg{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:8px;font-size:12px;color:var(--tg-ink3);}
.tk-leg span{display:inline-flex;align-items:center;gap:6px;}
.tk-leg i{width:10px;height:10px;border-radius:3px;}
.tk-leg i.job{background:var(--tk-job);} .tk-leg i.air{background:var(--tk-air);} .tk-leg i.shop{background:var(--tk-shop);}
.tk-leg i.lunch{box-shadow:inset 0 0 0 1px var(--tg-border);background:repeating-linear-gradient(135deg,transparent 0 2px,var(--tg-hair) 2px 3px);}
.tk-leg .sp{flex:1;}
.tk-tip{position:absolute;z-index:30;max-width:280px;padding:8px 10px;border-radius:9px;background:var(--tg-raised);box-shadow:var(--tg-sh-raised);font-size:12px;line-height:17px;color:var(--tg-ink);pointer-events:none;}
.tk-tip b{font-weight:600;} .tk-tip small{display:block;color:var(--tg-ink3);}
/* a fix, inline */
.tk-fix{display:flex;align-items:center;gap:12px;margin:12px 28px 0;padding:11px 14px;border-radius:12px;background:var(--tg-bad-t);color:var(--tg-ink);font-size:13px;}
.tk-fix.warn{background:var(--tg-warn-t);}
.tk-fix > .tg-ic{color:var(--tg-bad);flex:none;} .tk-fix.warn > .tg-ic{color:var(--tg-warn);}
.tk-fix p{margin:0;flex:1;min-width:0;line-height:18px;} .tk-fix p b{font-weight:600;}
.tk-fix .btn{flex:none;}
/* the day, in order */
.tk-st{margin:16px 28px 0;}
.tk-sth{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:12px;font-weight:600;color:var(--tg-ink3);}
.tk-sth .sp{flex:1;}
.tk-r{position:relative;display:grid;grid-template-columns:112px 46px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:46px;padding:7px 10px;border-radius:10px;cursor:pointer;}
.tk-r:hover{background:var(--tg-fill);}
.tk-r.sel{background:var(--tg-sel);}
.tk-r .tm{font:500 12.5px/1 var(--tg-mono);color:var(--tg-ink2);white-space:nowrap;}
.tk-r .du{font:500 12.5px/1 var(--tg-mono);color:var(--tg-ink);text-align:right;}
.tk-r .wh{display:flex;flex-direction:column;gap:3px;min-width:0;}
.tk-r .wh .l1{display:flex;align-items:center;gap:8px;min-width:0;font-size:13.5px;}
.tk-r .wh .l1 b{font-weight:500;white-space:nowrap;}
.tk-r .wh .l1 .no{font:500 12.5px/1 var(--tg-mono);color:var(--tg-ink);flex:none;}
.tk-r .wh .l1 .cm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;color:var(--tg-ink);}
.tk-r .wh .l2{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.tk-r .wh .l2 .nt{overflow:hidden;text-overflow:ellipsis;min-width:0;}
.tk-r .wh .l2 .nt.miss{color:var(--tg-warn);}
.tk-sw{width:10px;height:10px;border-radius:3px;flex:none;}
.tk-sw.job{background:var(--tk-job);} .tk-sw.air{background:var(--tk-air);} .tk-sw.shop{background:var(--tk-shop);}
.tk-rs{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;}
.tk-rs i{font-style:normal;color:var(--tg-ink4);}
.tk-eff{font:500 11.5px/1 var(--tg-mono);color:var(--tg-ink3);}
.tk-r .ac{display:flex;gap:2px;opacity:0;transition:opacity .12s;}
.tk-r:hover .ac,.tk-r.sel .ac{opacity:1;}
.tk-r.edge{min-height:30px;padding-top:3px;padding-bottom:3px;cursor:default;}
.tk-r.edge:hover{background:none;}
.tk-r.edge .wh .l1{font-size:12.5px;color:var(--tg-ink3);gap:6px;}
.tk-r.edge .wh .l1 .tg-ic{color:var(--tg-ink3);}
.tk-r.air .wh .l1 b{font-weight:400;color:var(--tg-ink2);}
.tk-r.air .ac{opacity:1;}
.tk-r.run .du{color:var(--tg-good);}
.tk-r.prob{box-shadow:inset 3px 0 0 var(--tg-bad);}
.tk-ed{display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:4px;font-size:10.5px;font-weight:600;background:var(--tg-fill);color:var(--tg-ink3);}
.tk-ops{margin:18px 28px 0;padding:14px 16px 10px;border-radius:14px;box-shadow:inset 0 0 0 1px var(--tg-hair);}
.tk-opr{display:grid;grid-template-columns:minmax(0,1fr) 180px 92px;gap:12px;align-items:center;min-height:30px;font-size:13px;}
.tk-opr .no{font:500 12.5px/1 var(--tg-mono);margin-right:6px;}
.tk-opr .cm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tk-opr .v{font:500 12px/1 var(--tg-mono);color:var(--tg-ink2);text-align:right;}
.tk-bar{position:relative;height:6px;border-radius:3px;background:var(--tg-fill);}
.tk-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--tk-job);}
.tk-bar u{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--tg-ink);border-radius:1px;}
/* ---------- Week ---------- */
.tk-wk{height:100%;overflow:auto;scrollbar-width:thin;padding-bottom:24px;}
.tk-wg{margin:16px 28px 0;padding:6px 18px 10px;border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.tk-wr{display:grid;grid-template-columns:96px minmax(0,1fr) 64px 76px 56px;gap:14px;align-items:center;min-height:52px;box-shadow:inset 0 -1px 0 var(--tg-hair);cursor:pointer;}
.tk-wr:last-child{box-shadow:none;}
.tk-wr.h{min-height:30px;cursor:default;font-size:11.5px;color:var(--tg-ink3);}
.tk-wr.h .tk-ax{margin:0;}
.tk-wr:not(.h):hover{background:linear-gradient(90deg,transparent,var(--tg-fill) 8%,var(--tg-fill) 92%,transparent);}
.tk-wr.on .dl b{color:var(--tg-acctx);}
.tk-wr .dl{display:flex;flex-direction:column;}
.tk-wr .dl b{font-size:13.5px;font-weight:500;} .tk-wr .dl small{font-size:11.5px;color:var(--tg-ink3);}
.tk-wr .v{font:500 12.5px/1 var(--tg-mono);text-align:right;color:var(--tg-ink);}
.tk-wr .v small{display:block;margin-top:3px;font:400 11px/1 var(--tg-sans);color:var(--tg-ink3);}
.tk-wr .v.mut{color:var(--tg-ink4);}
.tk-wt{position:relative;height:22px;}
.tk-wt .tk-clk{border-radius:5px;}
.tk-wt .tk-b{top:3px;bottom:3px;padding:0;border-radius:3px;cursor:default;}
.tk-wt .tk-lunch{top:3px;bottom:3px;}
.tk-wt .tk-lunch .tg-ic{display:none;}
.tk-wt .tk-now{top:-4px;bottom:-4px;}
.tk-wf{display:grid;grid-template-columns:96px minmax(0,1fr) 64px 76px 56px;gap:14px;align-items:center;padding:12px 18px 0;margin:0 28px;font-size:12.5px;color:var(--tg-ink3);}
.tk-wf b{font:600 13px/1 var(--tg-mono);color:var(--tg-ink);text-align:right;display:block;}
.tk-cap{margin:14px 28px 0;display:flex;align-items:center;gap:14px;}
.tk-cap .m{flex:1;max-width:420px;}
.tk-cap small{font-size:12px;color:var(--tg-ink3);}
.tk-capb{position:relative;height:8px;border-radius:4px;background:var(--tg-fill);margin-top:6px;overflow:hidden;}
.tk-capb i{position:absolute;left:0;top:0;bottom:0;background:var(--tg-ink2);border-radius:4px;}
.tk-capb u{position:absolute;top:0;bottom:0;width:2px;background:var(--tg-bad);}
/* ---------- Timesheet ---------- */
.tk-ts{height:100%;overflow:auto;scrollbar-width:thin;padding:18px 28px 28px;}
.tk-tsbar{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.tk-tsbar .sp{flex:1;}
.tk-tsbar b{font-size:14px;font-weight:600;}
.tk-paper{max-width:860px;margin:0 auto;padding:30px 34px 26px;border-radius:6px;background:#fff;color:#1d1c1a;box-shadow:0 1px 3px rgba(0,0,0,.1),0 14px 40px -14px rgba(0,0,0,.25);font:400 12.5px/18px var(--tg-sans);}
:root[data-theme="dark"] .tk-paper{background:#FBFAF7;}
.tk-paper header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:1.5px solid #1d1c1a;margin-bottom:14px;}
.tk-paper header b{display:block;font:500 20px/24px var(--tg-serif);}
.tk-paper header small{display:block;font-size:11.5px;color:#67625a;}
.tk-paper header .r{text-align:right;} .tk-paper header .r b{font:600 14px/18px var(--tg-sans);}
.tk-paper .lg svg{width:18px;height:18px;} .tk-paper .lg circle{fill:#1d1c1a;} .tk-paper .lg .o{fill:#8a857c;} .tk-paper .lg .c{fill:#2c7350;}
.tk-paper table{width:100%;border-collapse:collapse;}
.tk-paper th{text-align:right;font-size:11px;font-weight:500;color:#67625a;padding:5px 6px;border-bottom:1px solid #d6d0c3;white-space:nowrap;}
.tk-paper th:first-child,.tk-paper td:first-child{text-align:left;}
.tk-paper td{padding:6px 6px;border-bottom:1px solid #f0ede6;text-align:right;font:500 12px/16px var(--tg-mono);white-space:nowrap;}
.tk-paper td:first-child{font:500 12.5px/16px var(--tg-sans);}
.tk-paper td.mut{color:#a8a398;}
.tk-paper tr.wk td{background:#f6f4ef;font-weight:600;border-bottom:1px solid #d6d0c3;}
.tk-paper tr.tot td{font-weight:700;border-top:1.5px solid #1d1c1a;border-bottom:0;padding-top:9px;}
.tk-paper tr.prob td{background:#fbefec;}
.tk-paper tr.prob td:last-child{color:#a8402e;font:600 11px/16px var(--tg-sans);}
.tk-paper td.fl{font:500 11px/16px var(--tg-sans);color:#67625a;text-align:left;}
.tk-sig{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-top:30px;}
.tk-sig div{border-top:1px solid #1d1c1a;padding-top:5px;font-size:11px;color:#67625a;}
.tk-paper footer{margin-top:16px;font-size:10.5px;color:#8f897c;}
/* ---------- Shop ---------- */
.tk-sh{height:100%;overflow:auto;scrollbar-width:thin;padding-bottom:24px;}
.tk-sr{display:grid;grid-template-columns:236px minmax(0,1fr) 62px 78px 56px;gap:14px;align-items:center;min-height:60px;padding:0 6px;box-shadow:inset 0 -1px 0 var(--tg-hair);cursor:pointer;}
.tk-sr:last-child{box-shadow:none;}
.tk-sr.h{min-height:30px;cursor:default;font-size:11.5px;color:var(--tg-ink3);}
.tk-sr:not(.h):hover{background:var(--tg-fill);border-radius:10px;}
.tk-sr .nm{display:flex;align-items:center;gap:10px;min-width:0;}
.tk-sr .nm span{display:flex;flex-direction:column;min-width:0;}
.tk-sr .nm b{font-size:13.5px;font-weight:500;white-space:nowrap;}
.tk-sr .nm small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tk-sr .nm small.on{color:var(--tg-good);} .tk-sr .nm small.warn{color:var(--tg-warn);}
.tk-sr .v{font:500 12.5px/1 var(--tg-mono);text-align:right;}
.tk-sr .v small{display:block;margin-top:3px;font:400 11px/1 var(--tg-sans);color:var(--tg-ink3);}
.tk-sum{display:flex;flex-wrap:wrap;gap:8px;margin:14px 28px 0;}
.tk-sum span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:8px;background:var(--tg-fill);font-size:12.5px;color:var(--tg-ink2);}
.tk-sum span b{font-weight:600;color:var(--tg-ink);}
.tk-sum span.warn{background:var(--tg-warn-t);color:var(--tg-warn);} .tk-sum span.warn b{color:var(--tg-warn);}
/* popovers */
.tk-opt{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:10px;align-items:center;width:100%;padding:8px 10px !important;border-radius:10px;text-align:left;}
.tk-opt:hover{background:var(--tg-fill);}
.tk-opt.on{background:var(--tg-sel);box-shadow:inset 0 0 0 1px var(--tg-border);}
.tk-opt .tg-kbd{grid-row:1 / span 2;}
.tk-opt b{font-size:13.5px;font-weight:500;} .tk-opt small{grid-column:2;font-size:12px;color:var(--tg-ink3);}
.tk-ctx{margin:-2px 0 10px;padding:9px 11px;border-radius:10px;background:var(--tg-canvas);font-size:12.5px;line-height:18px;color:var(--tg-ink2);}
.tk-ctx b{color:var(--tg-ink);font-weight:500;}
.tk-tg{display:grid;grid-template-columns:1fr 1fr 70px;gap:8px;margin:0 0 10px;}
.tk-f{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--tg-ink3);}
.tk-f input,.tk-f textarea{width:100%;}
.tk-f input{font-family:var(--tg-mono) !important;}
.tk-f .ro{height:32px;display:flex;align-items:center;font:500 13px/1 var(--tg-mono);color:var(--tg-ink);}
.tk-was{font-size:11.5px;color:var(--tg-ink3);margin:2px 0 8px;}
.tg-pop .tg-r{margin-bottom:6px;}
.tk-pop-w{width:340px;}
.tk-pop-m{width:300px;}
.tk-mih{padding:8px 10px 4px;font-size:11.5px;font-weight:600;color:var(--tg-ink3);}
.tk-mnote{margin:6px 6px 2px 10px;padding-top:8px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:11.5px;line-height:16px;color:var(--tg-ink3);}
.tk-ro{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:8px;padding:6px 8px !important;border-radius:8px;text-align:left;width:100%;}
.tk-ro:hover{background:var(--tg-fill);} .tk-ro.on{background:var(--tg-sel);box-shadow:inset 0 0 0 1px var(--tg-border);}
.tk-ro .no{font:500 12.5px/18px var(--tg-mono);} .tk-ro .cm{font-size:12.5px;color:var(--tg-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
"""

JS = r"""
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const p2=n=>String(n).padStart(2,'0');
const hm=m=>p2(Math.floor(m/60))+':'+p2(Math.round(m%60));
const dur=m=>{ m=Math.round(m); return Math.floor(m/60)+':'+p2(m%60); };
const pm=s=>{ const x=/^(\d{1,2}):(\d{2})$/.exec(String(s).trim()); return x?(+x[1])*60+(+x[2]):null; };
/* today is Thu Oct 22 2026, 14:15 */
const NOW=14*60+15, TODAY='2026-10-22';
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], DNL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MNL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const short=k=>{ const d=dOf(k); return DN[d.getDay()]+' '+(d.getMonth()+1)+'/'+d.getDate(); };
const TECH={MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah'};
const TF=k=>TECH[k].split(' ')[0];
const ROS={
 '37612':['Midway Auto Transport','Wheel seal leaking — drive axle, left rear'], '37628':['Prairie Line Trucking','Turbo actuator fault — low boost'],
 '37502':['Piedmont Aggregates','Check engine light — outlet NOx sensor'], '37590':['Silverline LTL','Clean DPF and replace DPF pressure sensor'],
 '37455':['Highplains Grain','Coolant leak at water pump'], '37011':['Red Mesa Hauling','Recall 24V-118 — EGR cooler inspection'],
 '37544':['Copperline Transport','EGR valve stuck — derate'], '37519':['Dixie Fleet Services','Coolant temp sensor — erratic reading'],
 '37701':['Triad Cold Chain','Alternator not charging — 12.1 V at idle'], '37388':['Elkin Hardwoods','DEF doser clogged — derate'],
 '37466':['Uwharrie Fuel','Misfire cylinder 4 — injector'], '37203':['Surry Feed & Seed','Radiator leak — lower tank'],
 '37720':['Keystone Carriers','PM service — 74-point inspection'], '37731':['Iron Horse Logistics','Clutch slipping — replace clutch'],
 '37742':['Rowan Ready Mix','Air dryer purging constantly'], '37750':['Yadkin Valley Freight','A/C not cooling — compressor clutch']
};
const SHOPW=['Clean bay','Training','Tool maintenance','Shop truck'];
const SR=['Diagnosing','Repairing','Inspecting – 74-point'], ER=['Complete','Switched job','Waiting – Parts','Waiting – Approval','Waiting – Tech Support','Lunch','End of day'];
const NOTES=['Replaced and torqued to spec, verified no leaks.','Pulled codes, checked wiring and connectors.','Ordered parts, waiting on delivery.','Road tested 10 miles, no return.','Pressure tested the system, holds.','Cleaned the connector, re-pinned, codes cleared.'];
/* a seeded generator — the same days every time */
function rng(seed){ let a=0; for(const c of seed) a=(a*31+c.charCodeAt(0))|0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
let PID=0;
const pu=(s,e,ro,sr,er,note,q,o)=>Object.assign({id:'p'+(++PID),s,e,ro,sr,er,note:note||'',q:q||0},o||{});
function genDay(t,k){
  const d=dOf(k), r=rng(t+k); if(d.getDay()===0||d.getDay()===6) return null;
  const pool=Object.keys(ROS); const pick=()=>pool[Math.floor(r()*pool.length)];
  const cin=410+Math.floor(r()*18), l0=690+Math.floor(r()*8), l1=l0+30, out=k===TODAY?null:925+Math.floor(r()*25);
  const sh=[[cin,l0,'Lunch'],[l1,out,out?'End of day':null]], p=[];
  let m=cin+3+Math.floor(r()*5), ro=pick(), shopDone=r()<0.6;
  const end=out||NOW;
  while(m<end-10){
    if(m>=l0-5&&m<l1){ m=l1+2+Math.floor(r()*5); continue; }
    if(!shopDone&&m>780&&r()<0.5){ const e=Math.min(m+12+Math.floor(r()*18),end); p.push(pu(m,e,'SHOP','Shop time','Switched job','',0,{shop:SHOPW[Math.floor(r()*4)]})); shopDone=true; m=e+1; continue; }
    let e=m+40+Math.floor(r()*110), er=ER[Math.floor(r()*5)];
    if(m<l0&&e>l0-2){ e=l0; er='Lunch'; }
    if(e>end){ e=k===TODAY?null:end; er=k===TODAY?null:'End of day'; }
    const len=(e==null?NOW:e)-m;
    p.push(pu(m,e,ro,SR[Math.floor(r()*3)],er,r()<0.88?NOTES[Math.floor(r()*NOTES.length)]:'',Math.round(len/60*(0.85+r()*0.5)*10)/10));
    if(e==null) break;
    m=e+(er==='Lunch'?0:2+Math.floor(r()*14)); if(er!=='Lunch'&&er!=='Switched job') ro=pick(); else if(er==='Switched job') ro=pick();
  }
  return {sh:sh.filter(x=>x[0]<(k===TODAY?NOW:1e9)),p};
}
const DAYS=[]; for(let i=24;i>=0;i--) DAYS.push(addD(TODAY,-i));
function seed(){
  PID=0; const D={};
  Object.keys(TECH).forEach(t=>{ D[t]={}; DAYS.forEach(k=>{ const g=genDay(t,k); if(g) D[t][k]=g; }); });
  /* Mike — today, by hand */
  D.MR[TODAY]={sh:[[418,690,'Lunch'],[720,null,null]],p:[
    pu(424,532,'37612','Repairing','Complete','Replaced wheel seal and both shoes on that end, refilled hub.',2.4),
    pu(560,684,'37628','Diagnosing','Waiting – Parts','Actuator sticking at 60% — ordered a new actuator.',1.6),
    pu(725,790,'37502','Repairing','Complete','Replaced outlet NOx sensor, ran a parked regen, no return.',1.0),
    pu(790,804,'SHOP','Shop time','Switched job','',0,{shop:'Clean bay'}),
    pu(804,null,'37590','Repairing',null,'',0.9)]};
  /* yesterday: two punches overlap */
  D.MR['2026-10-21']={sh:[[415,690,'Lunch'],[720,932,'End of day']],p:[
    pu(420,612,'37455','Repairing','Switched job','Water pump out, gasket surface cleaned.',3.0),
    pu(605,688,'37011','Inspecting – 74-point','Complete','Recall inspection — seepage at the cooler outlet, photos on the RO.',1.0),
    pu(722,880,'37544','Diagnosing','Waiting – Tech Support','Valve sticking at 40%, Volvo tech support case open.',2.0),
    pu(880,928,'37519','Repairing','Complete','',0.6)]};
  /* Monday: never clocked out */
  D.MR['2026-10-19']={sh:[[420,null,null]],p:[
    pu(426,630,'37701','Repairing','Switched job','Rectifier failed — replaced alternator, 14.1 V at idle.',1.6),
    pu(634,690,'37388','Repairing','Lunch','Doser tip crystallized — flow test failed.',0.8),
    pu(725,924,'37466','Repairing','End of day','Replaced injector 4, cylinder cut-out test good.',3.2)]};
  /* the others, today */
  D.DK[TODAY]={sh:[[412,695,'Lunch'],[725,null,null]],p:[pu(418,600,'37720','Inspecting – 74-point','Complete','74-point done, brakes at 40%.',1.5),pu(606,693,'37742','Diagnosing','Waiting – Parts','Purge valve leaking — ordered.',1.0),pu(725,null,'37731','Repairing',null,'',2.4)]};
  D.LM[TODAY]={sh:[[425,690,'Lunch'],[720,820,'Appointment']],p:[pu(430,688,'37750','Diagnosing','Waiting – Approval','Compressor clutch open — quote sent.',2.6),pu(722,818,'37203','Repairing','Switched job','Radiator out.',1.2)],back:'15:00'};
  D.PS[TODAY]={sh:[[420,690,'Lunch'],[720,null,null]],p:[pu(424,612,'37011','Repairing','Complete','EGR cooler gasket replaced.',3.4),pu(618,688,'37544','Diagnosing','Switched job','',1.1),pu(722,833,'37612','Repairing','Complete','Hub end play checked, torqued.',1.8)]};
  return D;
}
let S,U,UNDO,TOAST,TT;
function reset(){ S={D:seed()}; U={view:'day',who:'MR',day:TODAY,sel:null,pop:null,kb:false,open:{},fixed:{}}; UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify(S)); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }

/* ---------- a day's numbers ---------- */
function dayOf(t,k){ return (S.D[t]||{})[k]||null; }
function calc(t,k){
  const D=dayOf(t,k); if(!D) return null;
  const today=k===TODAY, open=D.sh.some(x=>x[1]==null), eod=x=>x==null?(today?NOW:null):x;
  const segs=D.sh.map(x=>[x[0],eod(x[1]),x[2],x[1]]);
  const ps=D.p.slice().sort((a,b)=>a.s-b.s).map(p=>Object.assign({},p,{e2:p.e==null?(today?NOW:p.s):p.e}));
  let clocked=0, job=0, shop=0, q=0; segs.forEach(x=>{ if(x[1]!=null) clocked+=x[1]-x[0]; });
  const lastStop=ps.length?Math.max(...ps.map(p=>p.e2)):null;
  /* a clock left open on a past day counts to the last punch, until it is fixed */
  if(!today&&open){ segs.forEach(x=>{ if(x[1]==null){ const e=Math.max(x[0],lastStop||x[0]); clocked+=e-x[0]; x[1]=e; } }); }
  ps.forEach(p=>{ const m=p.e2-p.s; if(p.ro==='SHOP') shop+=m; else { job+=m; q+=p.q; } });
  /* air: on the clock, not on a punch */
  const air=[]; segs.forEach(x=>{ if(x[1]==null) return; let c=x[0]; ps.forEach(p=>{ if(p.e2<=c||p.s>=x[1]) return; if(p.s>c) air.push([c,Math.min(p.s,x[1])]); c=Math.max(c,p.e2); }); if(x[1]>c) air.push([c,x[1]]); });
  const airM=air.reduce((a,x)=>a+x[1]-x[0],0);
  const lunch=[]; for(let i=1;i<segs.length;i++){ if(segs[i-1][1]!=null&&segs[i][0]>segs[i-1][1]) lunch.push([segs[i-1][1],segs[i][0],segs[i-1][2]]); }
  const fixes=[];
  if(!today&&open) fixes.push({k:'noout',t:'No clock out',why:`Clocked in ${hm(D.sh[0][0])} and never clocked out — the day counts to the last punch, ${hm(lastStop)}, until it’s fixed`,at:lastStop});
  for(let i=1;i<ps.length;i++){ if(ps[i].s<ps[i-1].e2){ fixes.push({k:'over',t:'Punches overlap',why:`${ps[i-1].ro} and ${ps[i].ro} overlap ${ps[i-1].e2-ps[i].s} min, ${hm(ps[i].s)}–${hm(ps[i-1].e2)}`,a:ps[i-1].id,b:ps[i].id,from:ps[i].s,to:ps[i-1].e2}); } }
  const soft=[]; air.forEach(x=>{ if(x[1]-x[0]>=20) soft.push({k:'air',from:x[0],to:x[1]}); });
  const miss=ps.filter(p=>p.ro!=='SHOP'&&p.e!=null&&!p.note).length;
  const on=open&&today, run=ps.find(p=>p.e==null);
  const first=segs.length?segs[0][0]:null, last=segs.length?segs[segs.length-1][1]:null;
  const span=today?NOW:(open?lastStop:last); const lastOut=segs.length?segs[segs.length-1][3]:null;
  return {D,segs,ps,clocked:(!today&&open)?clocked:clocked,job,shop,air,airM,lunch,lunchM:lunch.filter(x=>x[2]==='Lunch').reduce((a,x)=>a+x[1]-x[0],0),q,eff:job?q/(job/60):null,fixes,soft,miss,on,run,open,first,last,span,today};
}
const effTxt=e=>e==null?'—':Math.round(e*100)+'%';
const days=()=>DAYS.filter(k=>dayOf(U.who,k)).slice().reverse();
const wkStart=k=>{ const d=dOf(k), w=(d.getDay()+6)%7; return addD(k,-w); };
function groups(){
  const L=days(), ws=wkStart(TODAY), lws=addD(ws,-7), G={fix:[],wk:[],last:[],old:[]};
  L.forEach(k=>{ const c=calc(U.who,k); if(c.fixes.length&&!U.fixed[U.who+k]) G.fix.push(k); else if(k>=ws) G.wk.push(k); else if(k>=lws) G.last.push(k); else G.old.push(k); });
  return G;
}
const flat=()=>{ const G=groups(); return G.fix.concat(G.wk,G.last,U.open.old?G.old:[]); };

/* ---------- drawing ---------- */
const pos=(m,a,b)=>((m-a)/(b-a)*100).toFixed(3)+'%';
const wid=(x,y,a,b)=>((y-x)/(b-a)*100).toFixed(3)+'%';
function strip(c){ const a=360,b=1080; let h=''; c.segs.forEach(x=>{ if(x[1]==null) return; }); c.ps.forEach(p=>{ h+=`<i class="${p.ro==='SHOP'?'shop':'job'}" style="left:${pos(Math.max(p.s,a),a,b)};width:${wid(Math.max(p.s,a),Math.min(p.e2,b),a,b)}"></i>`; });
  c.air.forEach(x=>{ h+=`<i class="air" style="left:${pos(Math.max(x[0],a),a,b)};width:${wid(Math.max(x[0],a),Math.min(x[1],b),a,b)}"></i>`; });
  if(c.fixes.some(f=>f.k==='noout')&&c.ps.length){ const ls=Math.max(...c.ps.map(p=>p.e2)); h+=`<i class="prob" style="left:${pos(ls,a,b)};right:0"></i>`; }
  return `<div class="tk-strip">${h}</div>`; }
function track(c,a,b,opts){
  opts=opts||{}; let h='';
  c.segs.forEach(x=>{ const e=x[1]==null?b:Math.min(x[1],b); h+=`<span class="tk-clk" style="left:${pos(x[0],a,b)};width:${wid(x[0],e,a,b)}"></span>`; });
  c.lunch.forEach(x=>{ h+=`<span class="tk-lunch" data-tip="${esc((x[2]==='Lunch'?'Lunch':x[2]||'Off the clock')+' · '+hm(x[0])+'–'+hm(x[1])+' · '+dur(x[1]-x[0]))}" style="left:${pos(x[0],a,b)};width:${wid(x[0],x[1],a,b)}">${x[2]==='Lunch'?ic('coffee',14):''}</span>`; });
  c.air.forEach(x=>{ if(x[0]>=b) return; const e=Math.min(x[1],b); h+=`<span class="tk-b air" data-tip="${esc('Air · '+hm(x[0])+'–'+hm(x[1])+' · '+dur(x[1]-x[0])+'|On the clock, not on a job')}" style="left:${pos(x[0],a,b)};width:${wid(x[0],e,a,b)}"></span>`; });
  const over=new Set(); c.fixes.forEach(f=>{ if(f.k==='over'){ over.add(f.a); over.add(f.b); } });
  c.ps.forEach(p=>{ const e=Math.min(p.e2,b), w=(e-p.s)/(b-a)*(opts.w||800), shp=p.ro==='SHOP', sel=U.sel===p.id&&opts.live;
    const lbl=opts.live&&w>46?(shp?'Shop':p.ro):'';
    h+=`<span class="tk-b ${shp?'shop':'job'}${p.e==null?' run':''}${sel?' sel':''}${over.has(p.id)&&opts.live?' prob':''}" ${opts.live?`data-a="psel" data-p="${p.id}"`:''} data-tip="${esc((shp?'Shop · '+p.shop:p.ro+' · '+ROS[p.ro][1])+'|'+hm(p.s)+'–'+(p.e==null?'now':hm(p.e))+' · '+dur(p.e2-p.s)+(shp?'':' · '+p.sr+(p.er?' → '+p.er:'')))}" style="left:${pos(p.s,a,b)};width:${wid(p.s,e,a,b)}">${lbl}${sel&&p.e!=null?'<i class="h l"></i><i class="h r"></i>':''}</span>`; });
  if(opts.flags){ c.segs.forEach((x,i)=>{ h+=`<span class="tk-flag" style="left:${pos(x[0],a,b)}">IN</span>`; if(x[3]!=null) h+=`<span class="tk-flag out" style="left:${pos(x[1],a,b)}">OUT</span>`; });
    if(c.open&&!c.today){ const ls=Math.max(...c.ps.map(p=>p.e2)); h+=`<span class="tk-flag bad" style="left:${pos(Math.min(ls+10,b-5),a,b)}">NO OUT</span>`; } }
  if(c.today&&NOW>a&&NOW<b) h+=`<span class="tk-now" style="left:${pos(NOW,a,b)}" title="Now 14:15"></span>`;
  return h;
}
function axis(a,b,step){ let h=''; for(let m=Math.ceil(a/60)*60;m<=b;m+=60*(step||1)){ h+=`<span class="hr" style="left:${pos(m,a,b)}">${p2(m/60)}</span>`; } return `<div class="tk-ax">${h}</div>`; }
function gridL(a,b){ let h=''; for(let m=Math.ceil(a/60)*60;m<=b;m+=60) h+=`<i style="left:${pos(m,a,b)}"></i>`; return `<div class="tk-grid">${h}</div>`; }

function render(){
  const v=U.view;
  const body=v==='week'?vWeek():v==='sheet'?vSheet():v==='shop'?vShop():vDay();
  const showList=v==='day'||v==='week';
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='timelog'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg tk">${head()}<div class="tg-body v-${v}">${showList?list():''}<div class="tg-main">${body}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const c=calc(U.who,TODAY), ws=wkStart(TODAY); let wk=0; for(let i=0;i<7;i++){ const x=calc(U.who,addD(ws,i)); if(x) wk+=x.clocked; }
  const G=groups(), nf=G.fix.length, all=U.who==='ALL';
  const vs=[['day','clock','Day'],['week','calendar','Week'],['sheet','sheet','Timesheet'],['shop','users','Shop']];
  const who=all?`<span class="tk-av all">${ic('users',12)}</span>Whole shop`:`<span class="tk-av">${U.who}</span>${U.who==='MR'?'You · ':''}${esc(TECH[U.who])}`;
  let facts='';
  if(all||U.view==='shop'){ const on=Object.keys(TECH).filter(t=>{ const x=calc(t,TODAY); return x&&x.on; }).length; facts=`<span class="tg-hf"><b>${on} of 4</b>on the clock</span><i>·</i><span class="tg-hf"><b>1</b>off — appointment</span>`; }
  else facts=`${c&&c.on?`<span class="tg-hf tk-hb"><span class="tk-live"></span><b>${dur(c.clocked)}</b>on the clock</span><i>·</i>`:''}<span class="tg-hf"><b>${dur(wk)}</b>this week</span><i>·</i><span class="tg-hf"><b>${c?effTxt(c.eff):'—'}</b>efficiency today</span>${nf?`<i>·</i><button class="tg-hf w" data-a="tofix"><b>${nf}</b>to fix</button>`:''}`;
  return `<header class="tg-head"><h1 class="tg-h1">Time Log</h1><button class="tk-who" data-a="pop" data-p="who">${who}${ic('chevD',14)}</button><span class="tg-facts">${facts}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="add" title="Add a punch or a clock segment (A)">${ic('plus',16)}</button><button class="btn ib tg-srch-b" data-a="pop" data-p="exp" title="Print and export">${ic('download',16)}</button></header>`;
}
function list(){
  const G=groups(), s=U.day;
  const item=k=>{ const c=calc(U.who,k), d=dOf(k), on=k===s, f=c.fixes[0]&&!U.fixed[U.who+k]?c.fixes[0]:null, today=k===TODAY;
    const why=f?`<span class="why bad">${ic('flag',12)}${esc(f.t)} · ${esc(f.k==='noout'?'since '+hm(c.D.sh[0][0]):(f.to-f.from)+' min')}</span>`
      :today&&c.on?`<span class="why">${c.run?`On ${c.run.ro==='SHOP'?'shop time':c.run.ro} · ${dur(NOW-c.run.s)}`:'On the clock, not on a job'}</span>`
      :c.miss?`<span class="why warn">${ic('note',12)}${c.miss} punch${c.miss>1?'es':''} without a work note</span>`:`<span class="why">${hm(c.first)} – ${c.last!=null?hm(c.last):'—'} · ${c.ps.filter(p=>p.ro!=='SHOP').length} jobs</span>`;
    return `<div class="tk-di${on?' on':''}${on&&U.kb?' kb':''}${today?' today':''}" data-a="day" data-k="${k}"><span class="tk-dt"><small>${DN[d.getDay()]}</small><b>${d.getDate()}</b></span>
      <span class="r1">${today?'Today':DNL[d.getDay()]}${today&&c.on?'<span class="tk-pill">On the clock</span>':''}<small>${MN[d.getMonth()]} ${d.getDate()}</small></span>
      <span class="tot">${dur(c.clocked)}<small>${effTxt(c.eff)}</small></span>${strip(c)}${why}</div>`; };
  let body='';
  const grp=(t,L)=>L.length?`<div class="tg-grp">${t}<span>${L.length}</span></div>`+L.map(item).join(''):'';
  body+=grp('To fix',G.fix)+grp('This week',G.wk)+grp('Last week',G.last);
  if(G.old.length) body+=`<div class="tg-sec${U.open.old?' open':''}" data-a="open" data-k="old">${ic('chevR',12)}<span>Earlier</span><span class="n">${G.old.length}</span></div>`+(U.open.old?G.old.map(item).join(''):'');
  const keys=`<div class="tg-keys"><span>${kbd('J')}${kbd('K')}day</span><span>${kbd('E')}edit</span><span>${kbd('A')}add</span><span>${kbd('1')}–${kbd('4')}views</span></div>`;
  return `<section class="tg-list"><div class="tg-lh">Days<span class="n">${days().length}</span>${G.fix.length?`<button class="tg-fchip w" data-a="tofix">${G.fix.length} to fix</button>`:''}</div><div class="tg-scroll">${body}</div>${keys}</section>`;
}
function vDay(){
  const k=U.day, c=calc(U.who,k), d=dOf(k);
  if(!c) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('clock',22)}</span><h3>Nothing clocked</h3><p>No clock in and no punches this day.</p></div></div>`;
  const a=Math.min(390,Math.floor((c.first-20)/60)*60), b=Math.max(1020,Math.ceil(((c.today?NOW:c.open?Math.max(...c.ps.map(p=>p.e2)):c.last)+30)/60)*60);
  const pct=c.clocked?Math.round(c.job/c.clocked*100):0;
  const st=c.today&&c.on?`<span class="tk-pill">${ic('clock',11)}On the clock since ${hm(c.segs[c.segs.length-1][0])}</span>`:c.open&&!c.today?`<span class="tk-pill bad">${ic('flag',11)}No clock out</span>`:`<span class="tk-pill off">Closed out ${c.last!=null?hm(c.last):''}</span>`;
  const stat=(l,v,sub,cls,sw)=>`<div class="tk-stat${cls?' '+cls:''}"><small>${sw?`<i class="sw" style="background:var(--tk-${sw})"></i>`:''}${l}</small><b>${v}${sub?`<em>${sub}</em>`:''}</b></div>`;
  let h=`<div class="tk-day" data-scroll="day"><div class="tk-dh"><h2>${c.today?'Today · ':''}${DNL[d.getDay()]}, ${MNL[d.getMonth()]} ${d.getDate()}</h2>${st}<span class="sp"></span><span class="nav"><button class="btn btn-sm ib" data-a="dnav" data-d="-1" title="Day before (←)">${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="dnav" data-d="1" title="Day after (→)"${k===TODAY?' disabled':''}>${ic('chevR',15)}</button></span><button class="btn btn-sm" data-a="toast" data-t="The day report prints — one page, every punch with its notes.">${ic('print',14)}Day report</button></div>`;
  h+=`<div class="tk-stats">${stat('Clocked',dur(c.clocked),c.open&&!c.today?'open':'')}${stat('On jobs',dur(c.job),pct+'%','', 'job')}${stat('Air',dur(c.airM),'','', 'air')}${stat('Shop',dur(c.shop),'','', 'shop')}${stat('Lunch',dur(c.lunchM))}${stat('Efficiency',effTxt(c.eff),c.q.toFixed(1)+' h quoted',c.eff>=1?'good':'')}</div>`;
  h+=`<div class="tk-tl"><div class="tk-trk">${gridL(a,b)}${track(c,a,b,{live:1,flags:1,w:740})}</div>${axis(a,b)}<div class="tk-leg"><span><i class="job"></i>On a job</span><span><i class="air"></i>Air — on the clock, off a job</span><span><i class="shop"></i>Shop time</span><span><i class="lunch"></i>Lunch · off the clock</span><span class="sp"></span><span>Drag a block’s edge to change a time</span></div></div>`;
  c.fixes.filter(()=>!U.fixed[U.who+k]).forEach(f=>{ h+=`<div class="tk-fix">${ic('flag',16)}<p><b>${esc(f.t)}.</b> ${esc(f.why)}.</p><button class="btn btn-sm btn-primary" data-a="pop" data-p="fix" data-f="${f.k}">Fix…</button></div>`; });
  c.soft.forEach(s=>{ if(U.fixed['air'+U.who+k+s.from]) return; h+=`<div class="tk-fix warn">${ic('info',16)}<p><b>${dur(s.to-s.from)} of air</b> from ${hm(s.from)} to ${hm(s.to)} — on the clock, not on a job.</p><button class="btn btn-sm" data-a="pop" data-p="air" data-from="${s.from}" data-to="${s.to}">Fill it…</button><button class="btn btn-sm tg-gh" data-a="airok" data-from="${s.from}">It’s right</button></div>`; });
  /* the day, in order: clock edges, punches, air, lunch */
  const R=[]; c.segs.forEach((x,i)=>{ R.push({t:x[0],kind:'in',i}); if(x[3]!=null) R.push({t:x[1],kind:'out',why:x[2]}); });
  c.ps.forEach(p=>R.push({t:p.s,kind:'p',p})); c.air.forEach(x=>{ if(x[1]-x[0]>=3) R.push({t:x[0],kind:'air',x}); });
  R.sort((x,y)=>x.t-y.t||(x.kind==='out'?-1:0));
  const over=new Set(); c.fixes.forEach(f=>{ if(f.k==='over'){ over.add(f.a); over.add(f.b); } });
  const row=r=>{
    if(r.kind==='in') return `<div class="tk-r edge"><span class="tm">${hm(r.t)}</span><span></span><span class="wh"><span class="l1">${ic('clock',13)}Clocked in${r.i?' · back from lunch':''}</span></span><span></span></div>`;
    if(r.kind==='out') return `<div class="tk-r edge"><span class="tm">${hm(r.t)}</span><span></span><span class="wh"><span class="l1">${ic(r.why==='Lunch'?'coffee':'exit',13)}Clocked out · ${esc(r.why||'')}</span></span><span></span></div>`;
    if(r.kind==='air') return `<div class="tk-r air"><span class="tm">${hm(r.x[0])} – ${hm(r.x[1])}</span><span class="du">${dur(r.x[1]-r.x[0])}</span><span class="wh"><span class="l1"><i class="tk-sw air"></i><b>Air — on the clock, not on a job</b></span></span><span class="ac">${r.x[1]-r.x[0]>=10?`<button class="btn btn-sm tg-gh" data-a="pop" data-p="air" data-from="${r.x[0]}" data-to="${r.x[1]}">${ic('plus',13)}Fill</button>`:''}</span></div>`;
    const p=r.p, shp=p.ro==='SHOP', run=p.e==null, m=p.e2-p.s;
    return `<div class="tk-r${U.sel===p.id?' sel':''}${run?' run':''}${over.has(p.id)?' prob':''}" data-a="psel" data-p="${p.id}"><span class="tm">${hm(p.s)} – ${run?'now':hm(p.e)}</span><span class="du">${dur(m)}</span>
      <span class="wh"><span class="l1"><i class="tk-sw ${shp?'shop':'job'}"></i>${shp?`<b>Shop time</b><span class="cm">${esc(p.shop)}</span>`:`<span class="no">${p.ro}</span><span class="cm">${esc(ROS[p.ro][1])}</span>`}${p.ed?'<span class="tk-ed">edited</span>':''}</span>
      <span class="l2">${shp?'':`<span class="tk-rs">${esc(p.sr)}<i>→</i>${run?'<b style="color:var(--tg-good);font-weight:500">running</b>':esc(p.er||'')}</span><span>·</span>`}${shp?'<span class="nt">Counts as shop time, not on an RO</span>':p.note?`<span class="nt">${esc(p.note)}</span>`:run?'<span class="nt">Notes go in when the clock stops</span>':'<span class="nt miss">No work note</span>'}</span></span>
      <span class="ac">${run?`<button class="btn btn-sm" data-a="toast" data-t="Stopped ${p.ro} at 14:15 — the stop reason picker opens, same as the Console.">${ic('stop',13)}Stop</button>`:`<button class="btn btn-sm ib" data-a="pop" data-p="edit" data-pid="${p.id}" title="Edit (E)">${ic('pencil',14)}</button>`}</span></div>`; };
  h+=`<div class="tk-st"><div class="tk-sth">The day, in order<span class="sp"></span><span style="font-weight:400">Click a row or a block to select it · E edits</span></div>${R.map(row).join('')}</div>`;
  /* by operation */
  const O={}; c.ps.forEach(p=>{ if(p.ro==='SHOP') return; const o=O[p.ro]||(O[p.ro]={b:0,q:0}); o.b+=(p.e2-p.s)/60; o.q+=p.q; });
  const ks=Object.keys(O);
  if(ks.length) h+=`<div class="tk-ops"><div class="tk-sth" style="margin-bottom:4px">By operation today<span class="sp"></span><span style="font-weight:400">clocked against what it pays · the line is the quote</span></div>${ks.map(r=>{ const o=O[r], mx=Math.max(o.b,o.q)*1.15; return `<div class="tk-opr"><span class="cm"><span class="no">${r}</span>${esc(ROS[r][1])}</span><span class="tk-bar" title="${o.b.toFixed(2)} h clocked · ${o.q.toFixed(1)} h quoted"><i style="width:${(o.b/mx*100).toFixed(1)}%"></i><u style="left:${(o.q/mx*100).toFixed(1)}%"></u></span><span class="v">${o.b.toFixed(2)} / ${o.q.toFixed(1)} h</span></div>`; }).join('')}</div>`;
  return h+'</div>';
}
function vWeek(){
  const ws=wkStart(U.day), a=360, b=1080; let T={c:0,j:0,air:0,s:0,q:0};
  const rows=[0,1,2,3,4,5,6].map(i=>{ const k=addD(ws,i), d=dOf(k), c=calc(U.who,k);
    if(c){ T.c+=c.clocked; T.j+=c.job; T.air+=c.airM; T.s+=c.shop; T.q+=c.q; }
    const fut=k>TODAY;
    return `<div class="tk-wr${k===U.day?' on':''}" data-a="${c?'wday':''}" data-k="${k}"><span class="dl"><b>${DN[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}</b><small>${c?(c.fixes.length&&!U.fixed[U.who+k]?`<span style="color:var(--tg-bad);font-weight:500">${esc(c.fixes[0].t)}</span>`:k===TODAY?'today':hm(c.first)+' – '+(c.last!=null?hm(c.last):'—')):fut?'—':'off'}</small></span>
      <span class="tk-wt">${c?track(c,a,b,{w:560}):''}</span>${c?`<span class="v">${dur(c.clocked)}<small>clocked</small></span><span class="v">${dur(c.job)}<small>${c.clocked?Math.round(c.job/c.clocked*100)+'% on jobs':'on jobs'}</small></span><span class="v">${effTxt(c.eff)}<small>eff.</small></span>`:'<span></span><span></span><span></span>'}</div>`; }).join('');
  const d0=dOf(ws), d6=dOf(addD(ws,6)), cap=40*60;
  return `<div class="tk-wk"><div class="tk-dh"><h2>Week of ${MNL[d0.getMonth()]} ${d0.getDate()} – ${d6.getDate()}</h2><span class="sp"></span><span class="nav"><button class="btn btn-sm ib" data-a="wnav" data-d="-7">${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="wnav" data-d="7"${ws===wkStart(TODAY)?' disabled':''}>${ic('chevR',15)}</button></span></div>
    <div class="tk-cap"><div class="m"><small><b style="color:var(--tg-ink);font:600 15px/1 var(--tg-mono)">${dur(T.c)}</b> of 40:00 · ${dur(Math.max(0,cap-T.c))} to go before overtime</small><div class="tk-capb"><i style="width:${Math.min(100,T.c/cap*100).toFixed(1)}%"></i></div></div>
    <div class="tk-stats" style="padding:0;gap:6px 26px"><div class="tk-stat"><small><i class="sw" style="background:var(--tk-job)"></i>On jobs</small><b>${dur(T.j)}<em>${T.c?Math.round(T.j/T.c*100):0}%</em></b></div><div class="tk-stat"><small><i class="sw" style="background:var(--tk-air)"></i>Air</small><b>${dur(T.air)}</b></div><div class="tk-stat"><small><i class="sw" style="background:var(--tk-shop)"></i>Shop</small><b>${dur(T.s)}</b></div><div class="tk-stat${T.j&&T.q/(T.j/60)>=1?' good':''}"><small>Efficiency</small><b>${T.j?effTxt(T.q/(T.j/60)):'—'}</b></div></div></div>
    <div class="tk-wg"><div class="tk-wr h"><span></span><span class="tk-wt" style="height:18px">${axis(a,b,2)}</span><span class="v mut" style="font-family:var(--tg-sans)">Clocked</span><span class="v mut" style="font-family:var(--tg-sans)">On jobs</span><span class="v mut" style="font-family:var(--tg-sans)">Eff.</span></div>${rows}</div>
    <div class="tk-st" style="margin-top:12px"><div class="tk-sth" style="font-weight:400">Click a day to open it · the timeline runs 06:00–18:00</div></div></div>`;
}
function vSheet(){
  const per0='2026-10-12', L=[]; for(let i=0;i<14;i++) L.push(addD(per0,i));
  let T={c:0,j:0,air:0,s:0,l:0}, W={c:0,j:0,air:0,s:0,l:0}; const rows=[];
  L.forEach((k,i)=>{ const c=calc(U.who,k), d=dOf(k), fut=k>TODAY;
    if(c){ ['c','j','air','s','l'].forEach((f,j)=>{ const v=[c.clocked,c.job,c.airM,c.shop,c.lunchM][j]; T[f]+=v; W[f]+=v; }); }
    const prob=c&&c.fixes.length&&!U.fixed[U.who+k];
    rows.push(c?`<tr class="${prob?'prob':''}"><td>${DN[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}</td><td>${hm(c.first)}</td><td>${c.open?(c.today?'on':'—'):hm(c.last)}</td><td>${dur(c.lunchM)}</td><td>${dur(c.clocked)}</td><td>${dur(c.job)}</td><td>${dur(c.airM)}</td><td>${dur(c.shop)}</td><td class="fl">${prob?esc(c.fixes[0].t)+' — fix before printing':c.today?'still on the clock':''}</td></tr>`
      :`<tr><td>${DN[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}</td><td class="mut" colspan="7" style="text-align:left;font-family:var(--tg-sans)">${fut?'':'off'}</td><td></td></tr>`);
    if(i===6||i===13){ rows.push(`<tr class="wk"><td>Week ${i===6?1:2}</td><td></td><td></td><td>${dur(W.l)}</td><td>${dur(W.c)}</td><td>${dur(W.j)}</td><td>${dur(W.air)}</td><td>${dur(W.s)}</td><td class="fl">${W.c>2400?'Overtime '+dur(W.c-2400):''}</td></tr>`); W={c:0,j:0,air:0,s:0,l:0}; } });
  const nfix=L.filter(k=>{ const c=calc(U.who,k); return c&&c.fixes.length&&!U.fixed[U.who+k]; }).length;
  return `<div class="tk-ts"><div class="tk-tsbar"><span class="nav"><button class="btn btn-sm ib" data-a="toast" data-t="The pay period before.">${ic('chevL',15)}</button><button class="btn btn-sm ib" disabled>${ic('chevR',15)}</button></span><b>Pay period · Oct 12 – Oct 25</b><span class="tg-hf" style="cursor:default">two weeks, Monday to Sunday</span>${nfix?`<span class="tk-pill bad">${ic('flag',11)}${nfix} day${nfix>1?'s':''} to fix first</span>`:''}<span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="CSV saved — one row per day, the same columns as the sheet.">${ic('download',14)}Export CSV</button><button class="btn btn-sm btn-primary" data-a="toast" data-t="The timesheet prints — signature lines at the bottom.">${ic('print',14)}Print</button></div>
   <article class="tk-paper"><header><div><span class="lg">${LOGO}</span><b>Timesheet</b><small>Vanguard Truck Center · Greensboro</small></div><div class="r"><b>${esc(TECH[U.who==='ALL'?'MR':U.who])}</b><small>Technician</small><small>Oct 12 – Oct 25, 2026</small></div></header>
   <table><thead><tr><th>Day</th><th>In</th><th>Out</th><th>Lunch</th><th>Clocked</th><th>On jobs</th><th>Air</th><th>Shop</th><th style="text-align:left">Note</th></tr></thead><tbody>${rows.join('')}<tr class="tot"><td>Period</td><td></td><td></td><td>${dur(T.l)}</td><td>${dur(T.c)}</td><td>${dur(T.j)}</td><td>${dur(T.air)}</td><td>${dur(T.s)}</td><td class="fl">${T.c?Math.round(T.j/T.c*100)+'% on jobs':''}</td></tr></tbody></table>
   <div class="tk-sig"><div>Technician</div><div>Foreman / manager</div></div><footer>Printed from Parsec · times from the clock in / out and the punches · edited punches are marked in the day report</footer></article></div>`;
}
function vShop(){
  const k=U.day, a=360, b=1080, d=dOf(k);
  const rows=Object.keys(TECH).map(t=>{ const c=calc(t,k); if(!c) return `<div class="tk-sr"><span class="nm"><span class="tk-av lg">${t}</span><span><b>${TECH[t]}</b><small>Not in</small></span></span><span></span><span class="v">—</span><span class="v">—</span><span class="v">—</span></div>`;
    const D=c.D, lastOut=c.segs[c.segs.length-1];
    const now=k===TODAY?(c.run?`<small class="on">On ${c.run.ro==='SHOP'?'shop time':c.run.ro} · ${dur(NOW-c.run.s)}</small>`:c.on?`<small class="warn">On the clock, no job for ${dur(NOW-Math.max(...c.ps.map(p=>p.e2)))}</small>`:`<small>Off the clock — ${esc((lastOut[2]||'').toLowerCase())}${D.back?', back by '+D.back:''}</small>`):`<small>${hm(c.first)} – ${c.last!=null?hm(c.last):'—'}</small>`;
    return `<div class="tk-sr" data-a="who" data-t="${t}"><span class="nm"><span class="tk-av lg">${t}</span><span><b>${TECH[t]}</b>${now}</span></span><span class="tk-wt">${track(c,a,b,{w:520})}</span><span class="v">${dur(c.clocked)}<small>clocked</small></span><span class="v">${dur(c.job)}<small>${c.clocked?Math.round(c.job/c.clocked*100):0}% on jobs</small></span><span class="v">${effTxt(c.eff)}<small>eff.</small></span></div>`; }).join('');
  const all=Object.keys(TECH).map(t=>calc(t,k)).filter(Boolean), cl=all.reduce((s,c)=>s+c.clocked,0), jb=all.reduce((s,c)=>s+c.job,0), air=all.reduce((s,c)=>s+c.airM,0);
  return `<div class="tk-sh"><div class="tk-dh"><h2>${k===TODAY?'Today · ':''}${DNL[d.getDay()]}, ${MNL[d.getMonth()]} ${d.getDate()}</h2><span class="sp"></span><span class="nav"><button class="btn btn-sm ib" data-a="dnav" data-d="-1">${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="dnav" data-d="1"${k===TODAY?' disabled':''}>${ic('chevR',15)}</button></span><button class="btn btn-sm btn-primary" data-a="toast" data-t="The end-of-day sheet prints — one line per tech, open ROs and hours left.">${ic('print',14)}End-of-day sheet</button></div>
   <div class="tk-sum"><span><b>${dur(cl)}</b>clocked across the shop</span><span><b>${cl?Math.round(jb/cl*100):0}%</b>on jobs</span><span class="warn"><b>${dur(air)}</b>air</span><span><b>1</b>off — Luis, appointment until 15:00</span></div>
   <div class="tk-wg"><div class="tk-sr h"><span>Technician</span><span class="tk-wt" style="height:18px">${axis(a,b,2)}</span><span class="v" style="font-family:var(--tg-sans);color:var(--tg-ink3)">Clocked</span><span class="v" style="font-family:var(--tg-sans);color:var(--tg-ink3)">On jobs</span><span class="v" style="font-family:var(--tg-sans);color:var(--tg-ink3)">Eff.</span></div>${rows}</div>
   <div class="tk-st" style="margin-top:12px"><div class="tk-sth" style="font-weight:400">Click a tech to open their day · the foreman and the manager see this view, a tech sees only their own time</div></div></div>`;
}
function findP(id){ for(const t in S.D) for(const k in S.D[t]){ const p=S.D[t][k].p.find(x=>x.id===id); if(p) return {t,k,p}; } return null; }
function pop(){
  const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const st=`style="left:${p.x||400}px;top:${p.y||12}px"`;
  if(p.type==='who') return `<div class="tg-pop menu tk-pop-m" ${st}><div class="tk-mih">Whose time</div>${Object.keys(TECH).map((t,i)=>`<button class="tg-mi${U.who===t?' on':''}" data-a="who" data-t="${t}"><span class="tk-av">${t}</span>${esc(TECH[t])}${t==='MR'?'<span class="meta">you</span>':''}</button>`).join('')}<button class="tg-mi${U.who==='ALL'?' on':''}" data-a="who" data-t="ALL"><span class="tk-av all">${ic('users',12)}</span>Whole shop<span class="meta">Shop view</span></button><div class="tk-mnote">A technician sees only their own time. The foreman and the manager can open anyone’s.</div></div>`;
  if(p.type==='add') return `<div class="tg-pop menu tk-pop-m" ${st}><button class="tg-mi" data-a="addp">${ic('clock',14)}Add a punch…<span class="meta">${kbd('A')}</span></button><button class="tg-mi" data-a="toast" data-t="Clock segment — a clock in / out typed by hand, for a day you forgot to clock.">${ic('plus',14)}Add a clock in / out…</button><div class="tk-mnote">Import CSV and Backup move to Settings → Data — they’re not day-to-day.</div></div>`;
  if(p.type==='exp') return `<div class="tg-pop menu tk-pop-m" ${st}><button class="tg-mi" data-a="toast" data-t="The day report prints.">${ic('print',14)}Day report<span class="meta">this day</span></button><button class="tg-mi" data-a="view" data-v="sheet">${ic('sheet',14)}Timesheet<span class="meta">pay period</span></button><button class="tg-mi" data-a="view" data-v="shop">${ic('users',14)}End-of-day sheet<span class="meta">every tech</span></button><button class="tg-mi" data-a="toast" data-t="CSV saved — every punch in the range.">${ic('download',14)}Export punches · CSV</button></div>`;
  if(p.type==='edit'){ const f=findP(p.pid); if(!f) return ''; const x=f.p, s=p.s!=null?p.s:hm(x.s), e=p.e!=null?p.e:hm(x.e), m=(pm(e)||0)-(pm(s)||0);
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Edit punch',`${x.ro==='SHOP'?'Shop time':x.ro} · ${short(f.k)}`)}<div class="tk-ctx">${x.ro==='SHOP'?esc(x.shop):`<b>${x.ro}</b> · ${esc(ROS[x.ro][0])}<br>${esc(ROS[x.ro][1])}`}</div>
      <div class="tk-tg"><label class="tk-f"><span>Start</span><input id="tk-s" value="${esc(s)}"></label><label class="tk-f"><span>Stop</span><input id="tk-e" value="${esc(e)}"></label><span class="tk-f"><span>Length</span><span class="ro">${m>0?dur(m):'—'}</span></span></div>
      ${x.ro==='SHOP'?'':`<span class="tg-lbl top">Started as</span><div class="tg-r">${SR.map(r=>`<button class="tg-chip${(p.sr||x.sr)===r?' on':''}" data-a="pset" data-f="sr" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>
      <span class="tg-lbl top">Stopped as</span><div class="tg-r">${ER.map(r=>`<button class="tg-chip${(p.er||x.er)===r?' on':''}" data-a="pset" data-f="er" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>
      <label class="tk-f" style="margin-top:6px"><span>Work note</span><textarea id="tk-n" rows="2" placeholder="What was done">${esc(p.n!=null?p.n:x.note)}</textarea></label>`}
      ${x.ed?`<div class="tk-was" style="margin-top:8px">${ic('history',11)} Edited — was ${esc(x.ed)}</div>`:''}
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="pdel" style="color:var(--tg-bad)">${ic('trash',13)}Delete</button><span class="hint">Edits are marked on the day report</span><button class="btn btn-sm btn-primary" data-a="psave">Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='fix'){ const c=calc(U.who,U.day), f=c&&c.fixes.find(x=>x.k===p.f); if(!f) return '';
    if(f.k==='noout'){ const O=[[hm(f.at),'The last punch stopped then'],['15:30','Your usual end of shift'],['','Type the time you left']];
      return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('No clock out',short(U.day))}<div class="tk-ctx">Clocked in at <b>${hm(c.D.sh[0][0])}</b> and never clocked out, so the day counts <b>${dur(c.clocked)}</b>. The last punch, ${c.ps[c.ps.length-1].ro}, stopped at <b>${hm(f.at)}</b>.</div>
      ${O.map((o,i)=>`<button class="tk-opt${p.o===i?' on':''}" data-a="fset" data-o="${i}">${kbd(i+1)}<b>${o[0]?'Clock out at '+o[0]:'Another time'}</b><small>${o[1]}</small></button>`).join('')}
      ${p.o===2?`<label class="tk-f" style="margin-top:6px"><span>Clock out at</span><input id="tk-fo" value="${esc(p.t||'')}" placeholder="15:45"></label>`:''}
      <div class="tg-acts"><span class="hint">The day becomes ${p.o===0?dur(f.at-c.D.sh[0][0]):p.o===1?dur(930-c.D.sh[0][0]):'—'} clocked</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o==null?' disabled':''}>Clock out${kbd('↵')}</button></div></div>`; }
    const A=c.ps.find(x=>x.id===f.a), Bp=c.ps.find(x=>x.id===f.b);
    const O=[[`End ${A.ro} at ${hm(Bp.s)}`,`${A.ro} loses ${f.to-f.from} min`],[`Start ${Bp.ro} at ${hm(A.e2)}`,`${Bp.ro} loses ${f.to-f.from} min`]];
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Punches overlap',short(U.day))}<div class="tk-ctx"><b>${A.ro}</b> ran to ${hm(A.e2)} and <b>${Bp.ro}</b> started at ${hm(Bp.s)} — the same ${f.to-f.from} minutes counted twice.</div>
      ${O.map((o,i)=>`<button class="tk-opt${p.o===i?' on':''}" data-a="fset" data-o="${i}">${kbd(i+1)}<b>${o[0]}</b><small>${o[1]}</small></button>`).join('')}
      <div class="tg-acts"><span class="hint">Marked as edited on both punches</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o==null?' disabled':''}>Fix it${kbd('↵')}</button></div></div>`; }
  if(p.type==='air'){ const c=calc(U.who,U.day), recent=[...new Set(c.ps.filter(x=>x.ro!=='SHOP').map(x=>x.ro))].slice(-4);
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Fill the air',`${hm(p.from)}–${hm(p.to)} · ${dur(p.to-p.from)}`)}<span class="tg-lbl top">On a job</span>${recent.map(r=>`<button class="tk-ro${p.ro===r?' on':''}" data-a="aset" data-ro="${r}"><span class="no">${r}</span><span class="cm">${esc(ROS[r][1])}</span></button>`).join('')}
      <span class="tg-lbl top" style="margin-top:8px">Or shop time</span><div class="tg-r">${SHOPW.map(w=>`<button class="tg-chip${p.ro==='SHOP'&&p.w===w?' on':''}" data-a="aset" data-ro="SHOP" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      <div class="tg-acts"><span class="hint">Adds a punch for the whole gap</span><button class="btn btn-sm btn-primary" data-a="ago"${p.ro?'':' disabled'}>Add punch${kbd('↵')}</button></div></div>`; }
  return '';
}
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='day'){ U.day=t.dataset.k; U.sel=null; U.kb=false; U.pop=null; if(U.view!=='day'&&U.view!=='week') U.view='day'; render(); }
  else if(a==='wday'){ U.day=t.dataset.k; U.view='day'; U.sel=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; if(U.who==='ALL'&&(U.view==='day'||U.view==='week'||U.view==='sheet')) U.who='MR'; render(); }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p&&!t.dataset.pid){ U.pop=null; render(); return; } const ex={}; if(t.dataset.pid) ex.pid=t.dataset.pid; if(t.dataset.f) ex.f=t.dataset.f; if(t.dataset.from){ ex.from=+t.dataset.from; ex.to=+t.dataset.to; } openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='open'){ U.open[t.dataset.k]=!U.open[t.dataset.k]; render(); }
  else if(a==='tofix'){ const G=groups(); if(G.fix.length){ U.day=G.fix[0]; U.view='day'; U.sel=null; render(); } }
  else if(a==='who'){ const w=t.dataset.t; U.pop=null; if(w==='ALL'){ U.who='ALL'; U.view='shop'; } else { U.who=w; if(U.view==='shop') U.view='day'; if(!dayOf(w,U.day)) U.day=TODAY; } U.sel=null; render(); }
  else if(a==='psel'){ U.sel=t.dataset.p; render(); }
  else if(a==='dnav'){ const L=DAYS; let i=L.indexOf(U.day)+(+t.dataset.d); if(U.view==='day'){ while(i>=0&&i<L.length&&!dayOf(U.who,L[i])) i+=(+t.dataset.d); } if(i>=0&&i<L.length){ U.day=L[i]; U.sel=null; } render(); }
  else if(a==='wnav'){ const k=addD(U.day,+t.dataset.d); if(k<=TODAY&&k>=DAYS[0]){ U.day=k; render(); } }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='pset'){ p[t.dataset.f]=t.dataset.v; render(); }
  else if(a==='psave'){ const f=findP(p.pid); if(!f) return; const s=pm($('#tk-s').value), en=pm($('#tk-e').value); if(s==null||en==null||en<=s){ toast('Stop has to come after start.',false); render(); return; } snap(); const x=f.p; if(s!==x.s||en!==x.e) x.ed=x.ed||(hm(x.s)+'–'+hm(x.e)); x.s=s; x.e=en; if(p.sr) x.sr=p.sr; if(p.er) x.er=p.er; const n=$('#tk-n'); if(n) x.note=n.value; U.pop=null; toast(`${x.ro==='SHOP'?'Shop time':x.ro} · ${hm(s)}–${hm(en)} saved.`); render(); }
  else if(a==='pdel'){ const f=findP(p.pid); if(!f) return; snap(); S.D[f.t][f.k].p=S.D[f.t][f.k].p.filter(x=>x.id!==p.pid); U.pop=null; U.sel=null; toast(`Punch deleted — ${f.p.ro==='SHOP'?'shop time':f.p.ro} ${hm(f.p.s)}–${hm(f.p.e)}.`); render(); }
  else if(a==='fset'){ p.o=+t.dataset.o; render(); if(p.o===2) $('#tk-fo')?.focus(); }
  else if(a==='fgo'){ const c=calc(U.who,U.day), f=c.fixes.find(x=>x.k===p.f); if(!f||p.o==null) return; snap(); const D=dayOf(U.who,U.day);
    if(f.k==='noout'){ const v=p.o===0?f.at:p.o===1?930:pm(($('#tk-fo')||{}).value||''); if(v==null){ toast('Type a time like 15:45.',false); render(); return; } D.sh[D.sh.length-1][1]=v; D.sh[D.sh.length-1][2]='End of day'; U.pop=null; toast(`Clocked out at ${hm(v)} on ${short(U.day)} — the day is ${dur(v-D.sh[0][0])}.`); render(); return; }
    const A=D.p.find(x=>x.id===f.a), Bp=D.p.find(x=>x.id===f.b); if(p.o===0){ A.ed=A.ed||(hm(A.s)+'–'+hm(A.e)); A.e=Bp.s; } else { Bp.ed=Bp.ed||(hm(Bp.s)+'–'+hm(Bp.e)); Bp.s=A.e; } U.pop=null; toast('Overlap fixed — both punches are marked edited.'); render(); }
  else if(a==='aset'){ p.ro=t.dataset.ro; p.w=t.dataset.w||null; render(); }
  else if(a==='ago'){ if(!p.ro) return; snap(); const D=dayOf(U.who,U.day); D.p.push(pu(p.from,p.to,p.ro,p.ro==='SHOP'?'Shop time':'Repairing',p.ro==='SHOP'?'Switched job':'Switched job','',p.ro==='SHOP'?0:Math.round((p.to-p.from)/60*10)/10,p.ro==='SHOP'?{shop:p.w,ed:'added by hand'}:{ed:'added by hand'})); U.pop=null; toast(`${dur(p.to-p.from)} added to ${p.ro==='SHOP'?'shop time · '+p.w:p.ro}.`); render(); }
  else if(a==='airok'){ snap(); U.fixed['air'+U.who+U.day+t.dataset.from]=1; toast('Kept as air.'); render(); }
  else if(a==='addp'){ U.pop=null; toast('Add a punch — pick the RO and operation, then the times. Same form as Edit.',false); render(); }
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('dblclick',e=>{ const t=e.target.closest('[data-a="psel"]'); if(!t) return; const f=findP(t.dataset.p); if(f&&f.p.e!=null) openPop('edit',{pid:t.dataset.p},t); });
mock.addEventListener('input',e=>{ const p=U.pop; if(!p) return; if(e.target.id==='tk-s') p.s=e.target.value; if(e.target.id==='tk-e') p.e=e.target.value; if(e.target.id==='tk-n') p.n=e.target.value; if(e.target.id==='tk-fo') p.t=e.target.value;
  if((e.target.id==='tk-s'||e.target.id==='tk-e')){ const m=(pm(p.e!=null?p.e:'')||0)-(pm(p.s!=null?p.s:'')||0), r=$('.tk-tg .ro'); if(r) r.textContent=m>0?dur(m):'—'; } });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.tk').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-290)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"]')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.indexOf(U.day); U.day=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.sel=null; U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();} if(k==='Enter'&&!(e.target.tagName==='TEXTAREA')){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); } if(inF) return; const n=+k; if(n>=1&&n<=3){ $(`.tg-pop [data-a="fset"][data-o="${n-1}"]`)?.click(); return stop(); } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='ArrowLeft'||k==='ArrowRight'){ $(`[data-a="dnav"][data-d="${k==='ArrowLeft'?-1:1}"]`)?.click(); return stop(); }
  if(k==='e'){ const c=calc(U.who,U.day), x=c&&(c.ps.find(q=>q.id===U.sel)||c.ps.filter(q=>q.e!=null).slice(-1)[0]); if(x&&x.e!=null){ U.sel=x.id; render(); const el=$(`.tk-r[data-p="${x.id}"]`); openPop('edit',{pid:x.id},el); } return stop(); }
  if(k==='a'){ const b=$('[data-a="pop"][data-p="add"]'); if(b) openPop('add',{},b); return stop(); }
  if(k>='1'&&k<='4'){ U.view=['day','week','sheet','shop'][+k-1]; if(U.view==='shop') U.who=U.who; else if(U.who==='ALL') U.who='MR'; render(); return stop(); }
});
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; if(['edit','fix','air'].includes(U.pop.type)) x=Math.min(U.pop.ax+(U.pop.aw||0)-pw,W-pw-16); y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); }
    else { x=W-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tk-di.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  const f=$('.tg-pop #tk-s'); if(f&&U.pop&&!U.pop._f){ U.pop._f=1; f.focus(); f.select(); }
}
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  day:()=>{reset();render();},
  fix:()=>{reset();U.day='2026-10-19';render();const b=$('[data-a="pop"][data-p="fix"]');openPop('fix',{f:'noout',o:0},b);},
  edit:()=>{reset();const c=calc('MR',TODAY);U.sel=c.ps[0].id;render();const el=$(`.tk-r[data-p="${c.ps[0].id}"]`);openPop('edit',{pid:c.ps[0].id},el);},
  air:()=>{reset();render();const b=$('.tk-fix.warn [data-a="pop"]');openPop('air',{from:+b.dataset.from,to:+b.dataset.to,ro:'37612'},b);},
  week:()=>{reset();U.view='week';render();},
  sheet:()=>{reset();U.view='sheet';render();},
  shop:()=>{reset();U.view='shop';U.who='ALL';render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__tk={S:()=>S,U:()=>U,render,reset,openPop,DEMO,calc};
reset(); render();
"""
used = set(re.findall(r"ic\('([A-Za-z]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "clock", "exit", "coffee", "users", "calendar", "sheet"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("day", "1 · Day"), ("fix", "2 · Fix a day"), ("edit", "3 · Edit a punch"), ("air", "4 · Fill air"), ("week", "5 · Week"), ("sheet", "6 · Timesheet"), ("shop", "7 · Shop")])
about = [
 ("Same panel as Triage, Foreman, Warranty", "Header facts, view tabs, a list on the left, the work on the right. Days replace the long stack of day cards."),
 ("Whose time", "The name chip. A tech sees only their own; the foreman and the manager can open anyone, or the whole shop."),
 ("To fix first", "Days with no clock out or overlapping punches sit at the top, with a one-click fix."),
 ("Day", "One timeline (on a job · air · shop · lunch) and the day in order underneath. Air gaps can be filled; punches edit in place."),
 ("Week · Timesheet · Shop", "Week against 40 h, a printable pay-period timesheet with signature lines, and every tech’s day — the end-of-day sheet, as a page."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Time Log overhaul</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Time Log — overhaul</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Time Log<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
