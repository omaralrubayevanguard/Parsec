# Parts page mock-up — the same panel as Triage, Foreman, Warranty and Time Log (Parsec design system, Ivory + Graphite).
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
 "truck": '<path d="M3.5 6.5h10v9h-10zM13.5 9.5h3.8l3.2 3.4v2.6h-7"/><circle cx="7" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/>',
 "cart": '<path d="M3.5 4.5h2.2l2 10h10l1.8-7H6.6"/><circle cx="9" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
 "shelf": '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M9 4v8M15 12v8"/>',
 "book": '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5zM5 18.5A1.5 1.5 0 0 0 6.5 20H19"/>',
 "scan": '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 8.5v7M11 8.5v7M14 8.5v7M17 8.5v7"/>',
 "box": '<path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z"/><path d="M4 7.5 12 11l8-3.5M12 11v9"/>',
 "lock": '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
 "kit": '<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4 12h16"/>',
 "scan2": '<path d="M5 4v16M8 4v16M11.5 4v16M15 4v16M19 4v16"/>',
})

CSS = shell + r"""
""" + frame + r"""
/* ===== Parts — prefix pt-, on the Triage tg- base ===== */
.pt .tg-list{flex-basis:400px;width:400px;}
.pt .tg-pop{left:auto;}
.pt .tg-it .tg-t .tg-spot{display:inline-flex;}
.pt .tg-spot.bay{background:var(--tg-warn-t);color:var(--tg-warn);} .pt .tg-spot.bay .tg-ic{color:var(--tg-warn);}
.pt .tg-it .tg-gi.now{background:var(--tg-warn-t);color:var(--tg-warn);}
.pt-cb{flex:none;height:30px;}
/* part status chips */
.pt-st{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:6px;font-size:11.5px;font-weight:500;white-space:nowrap;background:var(--tg-fill);color:var(--tg-ink2);cursor:pointer;}
.pt-st i{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none;}
.pt-st .tg-ic{width:10px;height:10px;opacity:.7;}
.pt-st.no{background:var(--tg-fill);color:var(--tg-ink2);}
.pt-st.ord{background:color-mix(in srgb,var(--tg-st-support) 13%,transparent);color:var(--tg-st-support);}
.pt-st.bo{background:var(--tg-bad-t);color:var(--tg-bad);}
.pt-st.in{background:var(--tg-good-t);color:var(--tg-good);}
.pt-st.inst{background:transparent;box-shadow:inset 0 0 0 1px var(--tg-hair);color:var(--tg-ink3);}
.pt-st.late{background:var(--tg-warn-t);color:var(--tg-warn);}
.pt-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none;}
/* the RO pane */
.pt-pane{height:100%;overflow:auto;scrollbar-width:thin;display:flex;flex-direction:column;}
.pt-pane > .tg-top{position:sticky;top:0;z-index:3;background:var(--tg-panel);}
.pt-facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px 16px;}
.pt-facts small{display:block;font-size:11.5px;color:var(--tg-ink3);}
.pt-facts span{display:flex;align-items:center;gap:6px;font-size:13px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink);}
.pt-facts span.m{font:500 12.5px/20px var(--tg-mono);}
.pt-facts .warn{color:var(--tg-warn);font-weight:500;}
.pt-pad{padding:16px 28px 28px;display:flex;flex-direction:column;gap:12px;}
.pt-op{border-radius:16px;box-shadow:inset 0 0 0 1px var(--tg-hair);background:var(--tg-raised);overflow:hidden;}
.pt-oph{display:flex;align-items:center;gap:10px;padding:11px 16px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13.5px;}
.pt-oph .n{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);}
.pt-oph b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.pt-oph .sp{flex:1;}
.pt-oph small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.pt-jt{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 10.5px/1 var(--tg-mono);letter-spacing:.03em;background:color-mix(in srgb,var(--tg-st-customer) 12%,transparent);color:var(--tg-st-customer);flex:none;}
.pt-pr{position:relative;display:grid;grid-template-columns:118px minmax(0,1fr) 84px 34px 168px 78px 104px;gap:12px;align-items:center;min-height:50px;padding:6px 16px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;}
.pt-pr:last-of-type{box-shadow:none;}
.pt-pr.h{min-height:30px;font-size:11.5px;color:var(--tg-ink3);}
.pt-pr .d{display:flex;flex-direction:column;gap:2px;min-width:0;}
.pt-pr .d b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-pr .d small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-pr .d small.ok{color:var(--tg-good);}
.pt-pr .pn,.pt-pr .q,.pt-pr .pr{font:500 12.5px/1 var(--tg-mono);}
.pt-pr .q,.pt-pr .pr{text-align:right;}
.pt-pr .src{display:flex;flex-direction:column;gap:2px;min-width:0;font-size:12.5px;}
.pt-pr .src b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-pr .src small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.pt-pr .src small.late{color:var(--tg-warn);font-weight:500;}
.pt-pr .src small.bad{color:var(--tg-bad);font-weight:500;}
.pt-pr .ac{display:flex;justify-content:flex-end;gap:4px;}
.pt-opf{display:flex;align-items:center;gap:14px;padding:10px 16px;background:var(--tg-canvas);font-size:12.5px;color:var(--tg-ink3);}
.pt-opf b{font:500 12.5px/1 var(--tg-mono);color:var(--tg-ink);}
.pt-opf .sp{flex:1;}
.pt-bar{position:relative;width:90px;height:5px;border-radius:3px;background:var(--tg-hair);overflow:hidden;}
.pt-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--tg-good);}
.pt-sec{margin-top:6px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--tg-ink3);}
.pt-sec .sp{flex:1;} .pt-sec span{font-weight:400;}
.pt-log{display:flex;flex-direction:column;}
.pt-log div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;padding:5px 0;font-size:12.5px;color:var(--tg-ink2);box-shadow:inset 0 -1px 0 var(--tg-hair);}
.pt-log div:last-child{box-shadow:none;}
.pt-log time{font:500 12px/18px var(--tg-mono);color:var(--tg-ink3);}
.pt-log b{font-weight:500;color:var(--tg-ink);}
.pt-ret{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 14px;align-items:center;padding:14px 16px;}
.pt-ret .gi{grid-row:1 / span 2;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--tg-fill);color:var(--tg-ink2);}
.pt-ret b{font-weight:500;font-size:13.5px;} .pt-ret small{font-size:12.5px;color:var(--tg-ink3);}
.pt-ret .btn{grid-column:3;grid-row:1 / span 2;}
.pt-ok{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:14px;background:var(--tg-good-t);color:var(--tg-ink);font-size:13px;}
.pt-ok .tg-ic{color:var(--tg-good);}
/* ---------- On order ---------- */
.pt-full{height:100%;overflow:auto;scrollbar-width:thin;padding:18px 28px 28px;}
.pt-fh{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.pt-fh h2{margin:0;font:500 24px/30px var(--tg-serif);letter-spacing:-.01em;}
.pt-fh .sp{flex:1;}
.pt-sum{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
.pt-sum span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:8px;background:var(--tg-fill);font-size:12.5px;color:var(--tg-ink2);}
.pt-sum span b{font-weight:600;color:var(--tg-ink);}
.pt-sum span.warn{background:var(--tg-warn-t);color:var(--tg-warn);} .pt-sum span.warn b{color:var(--tg-warn);}
.pt-tbl{border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);padding:4px 16px 8px;margin-bottom:14px;}
.pt-tg{display:flex;align-items:center;gap:8px;padding:12px 2px 6px;font-size:12px;font-weight:600;color:var(--tg-ink3);}
.pt-tg.late{color:var(--tg-warn);} .pt-tg span{font-weight:400;color:var(--tg-ink4);} .pt-tg .sp{flex:1;}
.pt-or{display:grid;grid-template-columns:minmax(0,1.4fr) 84px 30px minmax(0,1.3fr) 118px 150px 96px 110px;gap:12px;align-items:center;min-height:44px;padding:4px 6px;border-radius:10px;font-size:13px;cursor:pointer;}
.pt-or:hover{background:var(--tg-fill);}
.pt-or.h{min-height:28px;cursor:default;font-size:11.5px;color:var(--tg-ink3);} .pt-or.h:hover{background:none;}
.pt-or > b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-or .m{font:500 12.5px/1 var(--tg-mono);}
.pt-or .q{text-align:right;}
.pt-or .ro{display:flex;align-items:center;gap:7px;min-width:0;white-space:nowrap;}
.pt-or .ro span{overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink2);}
.pt-or .wt{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--tg-ink2);white-space:nowrap;}
.pt-or .su{display:flex;flex-direction:column;gap:1px;font-size:12.5px;white-space:nowrap;min-width:0;} .pt-or .su small{font-size:11.5px;color:var(--tg-ink3);}
.pt-or .eta{font-size:12.5px;white-space:nowrap;} .pt-or .eta.late{color:var(--tg-warn);font-weight:500;} .pt-or .eta.bad{color:var(--tg-bad);font-weight:500;}
/* ---------- Shelf ---------- */
.pt-bins{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:22px;}
.pt-bin{position:relative;min-height:104px;padding:11px 13px;border-radius:14px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);display:flex;flex-direction:column;gap:4px;cursor:pointer;}
.pt-bin:hover{box-shadow:inset 0 0 0 1px var(--tg-bs);}
.pt-bin.empty{background:repeating-linear-gradient(135deg,transparent 0 6px,var(--tg-hair) 6px 7px);cursor:default;box-shadow:inset 0 0 0 1px var(--tg-hair);}
.pt-bin .k{display:flex;align-items:center;gap:6px;font:600 12px/1 var(--tg-mono);color:var(--tg-ink3);}
.pt-bin .k .sp{flex:1;}
.pt-bin .k em{font:500 11.5px/1 var(--tg-sans);font-style:normal;}
.pt-bin .k em.ok{color:var(--tg-good);} .pt-bin .k em.part{color:var(--tg-warn);}
.pt-bin .t{display:flex;align-items:center;gap:7px;font-size:13.5px;min-width:0;margin-top:4px;}
.pt-bin .t b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-bin .w{margin-top:auto;display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tg-ink3);}
.pt-bin .w .sp{flex:1;}
.pt-bin.empty .w{color:var(--tg-ink4);}
.pt-sr{display:grid;grid-template-columns:92px minmax(0,1.3fr) minmax(0,1.2fr) 60px minmax(0,1.3fr) auto;gap:12px;align-items:center;min-height:50px;padding:4px 6px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;}
.pt-sr:last-child{box-shadow:none;}
.pt-sr.h{min-height:28px;font-size:11.5px;color:var(--tg-ink3);}
.pt-sr .m{font:500 12.5px/1 var(--tg-mono);}
.pt-sr .d{display:flex;flex-direction:column;gap:2px;min-width:0;} .pt-sr .d b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pt-sr .d small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-sr .st{display:flex;flex-direction:column;gap:3px;align-items:flex-start;font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.pt-sr .done{font-size:12px;color:var(--tg-good);display:inline-flex;align-items:center;gap:5px;}
/* ---------- Catalog ---------- */
.pt-cbar{display:flex;align-items:center;gap:8px;margin-bottom:14px;}
.pt-cbar input{width:340px;}
.pt-cbar .sp{flex:1;}
.pt-cr{display:grid;grid-template-columns:28px minmax(0,1.6fr) 96px 78px 62px 86px minmax(0,1.2fr) 92px;gap:12px;align-items:center;min-height:42px;padding:3px 6px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;}
.pt-cr.h{min-height:30px;font-size:11.5px;color:var(--tg-ink3);}
.pt-cr.kid{min-height:34px;font-size:12.5px;color:var(--tg-ink2);}
.pt-cr.kid .d{padding-left:14px;position:relative;} .pt-cr.kid .d::before{content:"";position:absolute;left:2px;top:-8px;width:8px;height:16px;border-left:1px solid var(--tg-border);border-bottom:1px solid var(--tg-border);border-bottom-left-radius:4px;}
.pt-cr .d{display:flex;align-items:center;gap:8px;min-width:0;} .pt-cr .d b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-cr .m{font:500 12.5px/1 var(--tg-mono);}
.pt-cr .r{text-align:right;}
.pt-cr .oh{display:flex;align-items:center;justify-content:flex-end;gap:6px;font:500 12.5px/1 var(--tg-mono);}
.pt-cr .oh.low{color:var(--tg-warn);}
.pt-cr .fit{font-size:12.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-cr .car{all:unset;cursor:pointer;display:grid;place-items:center;width:22px;height:22px;border-radius:6px;color:var(--tg-ink3);} .pt-cr .car:hover{background:var(--tg-fill);}
.pt-cr .car .tg-ic{transition:transform .15s;} .pt-cr .car.open .tg-ic{transform:rotate(90deg);}
.pt-kitb{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 10.5px/1 var(--tg-mono);background:var(--tg-acct);color:var(--tg-acctx);flex:none;}
.pt-low{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 10.5px/1 var(--tg-sans);background:var(--tg-warn-t);color:var(--tg-warn);}
.pt-cr .ac{display:flex;justify-content:flex-end;gap:4px;}
/* popovers */
.pt-pop-w{width:440px;}
.pt-pop-x{width:540px;}
.pt-ctx{margin:-2px 0 10px;padding:9px 11px;border-radius:10px;background:var(--tg-canvas);font-size:12.5px;line-height:18px;color:var(--tg-ink2);}
.pt-ctx b{color:var(--tg-ink);font-weight:500;}
.pt-opt{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:10px;align-items:center;width:100%;padding:8px 10px !important;border-radius:10px;text-align:left;}
.pt-opt:hover{background:var(--tg-fill);}
.pt-opt.on{background:var(--tg-sel);box-shadow:inset 0 0 0 1px var(--tg-border);}
.pt-opt[disabled]{opacity:.45;pointer-events:none;}
.pt-opt .tg-kbd{grid-row:1 / span 2;}
.pt-opt b{font-size:13.5px;font-weight:500;} .pt-opt small{grid-column:2;font-size:12px;color:var(--tg-ink3);}
.pt-ln{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:7px 4px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;cursor:pointer;}
.pt-ln:last-child{box-shadow:none;}
.pt-ln input{margin:0;}
.pt-ln .d{display:flex;flex-direction:column;gap:1px;min-width:0;} .pt-ln .d b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pt-ln .d small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-ln .r{text-align:right;font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.pt-ln .r b{display:block;font:500 12.5px/18px var(--tg-mono);color:var(--tg-ink);}
.pt-ln .r .stk{color:var(--tg-good);font-weight:500;}
.pt-ln.hit{background:var(--tg-good-t);border-radius:8px;}
.pt-ln.dim{opacity:.55;}
.pt-lh{display:flex;align-items:center;gap:6px;margin:10px 0 2px;font-size:11.5px;font-weight:600;color:var(--tg-ink3);}
.pt-lh.late{color:var(--tg-warn);}
.pt-scan{display:flex;align-items:center;gap:8px;margin:0 0 6px;padding:0 10px;height:38px;border-radius:10px;box-shadow:inset 0 0 0 1.5px var(--tg-border);background:var(--tg-panel);}
.pt-scan:focus-within{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.pt-scan .tg-ic{color:var(--tg-ink3);flex:none;}
.pt-scan input{flex:1;height:34px;background:transparent !important;box-shadow:none !important;border:0 !important;padding:0 !important;font:500 13.5px/1 var(--tg-mono) !important;}
.pt-srin input:focus{box-shadow:none !important;outline:none;}
.pt-scan input:focus{box-shadow:none !important;outline:none;}
.pt-scan small{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;}
.pt-lst{max-height:330px;overflow:auto;margin:0 -4px;padding:0 4px;}
.pt-f{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--tg-ink3);margin-top:8px;}
.pt-f input{width:100%;font-family:var(--tg-mono) !important;}
.pt-two{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.pt-ck{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12.5px;color:var(--tg-ink2);cursor:pointer;}
.pt-ck input{margin:0;}
.pt-srr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:2px 10px;align-items:center;width:100%;padding:7px 10px !important;border-radius:9px;text-align:left;font-size:13px;}
.pt-srr:hover,.pt-srr.k{background:var(--tg-fill);}
.pt-srr .gi{grid-row:1 / span 2;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:var(--tg-fill);color:var(--tg-ink2);}
.pt-srr b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pt-srr small{grid-column:2 / 4;font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-srr .m{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);}
.pt-srin{display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;margin:0 0 6px;border-radius:9px;background:var(--tg-fill);}
.pt-srin input{flex:1;background:transparent !important;box-shadow:none !important;border:0 !important;padding:0 !important;font-size:13.5px;}
.pt-srin .tg-ic{color:var(--tg-ink3);}
.pt-none{padding:14px 10px;font-size:12.5px;color:var(--tg-ink3);}
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
const hm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const usd=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=n=>'$'+Math.round(n).toLocaleString('en-US');
/* today is Thu Oct 22 2026, 14:15 */
const NOW=14*60+15, TODAY='2026-10-22';
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const short=k=>{ const d=dOf(k); return DN[d.getDay()]+' '+(d.getMonth()+1)+'/'+d.getDate(); };
const md=k=>{ const d=dOf(k); return (d.getMonth()+1)+'/'+d.getDate(); };
const dd=(a,b)=>Math.round((dOf(b)-dOf(a))/86400000);
const PPL={AM:'Alicia Moore',JT:'Jordan Tate',FD:'Frank Delaney',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
const F=k=>PPL[k].split(' ')[0];
const lc=s=>/^[A-Z][a-z]/.test(s)?s[0].toLowerCase()+s.slice(1):s;
const SUP={pdc:'Volvo PDC',vor:'PDC rush',fp:'FleetPride',stock:'Stock'};
/* the catalog: what the shop keeps, where it sits, what it costs */
const CAT0=[
 ['22411521','A/C compressor',0,'',1186.40,'D13 · VNL · 2018–21',0],['21877394','Receiver drier',2,'D1',88.50,'VNL · 2018–23',2],['20532195','O-ring kit, A/C',6,'D1',12.40,'All models',4],
 ['22479124','Injector',1,'E2',684.00,'D13 · 2017+',2],['23295841','DEF doser',0,'',742.18,'D13 · 2019+',0],['21512367','Doser gasket',4,'C5',9.60,'D13',4],
 ['21531071','Coolant temp sensor',2,'B2',64.20,'D11 · D13',2],['21789944','Connector pigtail, 2-pin',0,'',38.75,'All models',2],['22972342','Turbo actuator',0,'',1348.00,'D13 TC · 2019+',0],
 ['21399788','Radiator',0,'',2214.00,'VNL · 2018–22',0],['23137410','EGR valve',0,'',968.00,'D13 · 2017–21',0],['21620181','Purge valve, air dryer',1,'C1',142.60,'All models',1],
 ['20972915','Air dryer cartridge',3,'C1',96.30,'All models',2],['21468475','Water pump',0,'',398.70,'D13 · 2017+',1],['20734264','Water pump gasket',5,'B4',14.20,'D13',2],
 ['85137802','Brake shoe kit, 16.5 × 7',0,'',192.00,'Q+ drum brakes',2],['85131923','Brake drum, 16.5 × 7',2,'G1',178.00,'Q+ drum brakes',2],['85137815','Brake hardware kit',4,'G2',24.80,'Q+ drum brakes',4],
 ['21751883','EGR cooler gasket kit',0,'',46.90,'D13 · 2017–21',0],['22088425','Starter',1,'E4',486.00,'D13',1],['21707133','Oil filter',14,'F1',28.40,'D13',12],['21380475','Fuel filter',9,'F1',34.60,'D13',12],['23223434','Coolant filter',7,'F2',22.10,'D11 · D13',6],
 ['85023114','Clutch kit, 15.5"',0,'',1642.00,'I-Shift · manual 2017+',0],['21302012','Release bearing',1,'E5',214.50,'Manual 2017+',1],['22770789','DPF pressure sensor',0,'',186.40,'D13 · 2017+',1],['82491362','Headlamp, left',0,'',628.00,'VNL · 2018+',0]
].map(x=>({pn:x[0],desc:x[1],oh:x[2],bin:x[3],price:x[4],fit:x[5],min:x[6]}));
const KITS0=[{pn:'PMK-D13',desc:'PM kit — D13',fit:'D13 · every 35k mi',kids:[['21707133',2],['21380475',2],['23223434',1]]},{pn:'BRK-Q165',desc:'Brake job — one axle',fit:'Q+ drum brakes',kids:[['85137802',2],['85131923',2],['85137815',2]]}];
let S,U,UNDO,TOAST,TT;
const cat=pn=>S.C.find(c=>c.pn===pn);
let PID=0;
const pt=(pn,qty,o)=>{ const c=CAT0.find(x=>x.pn===pn); return Object.assign({id:'p'+(++PID),pn,desc:c.desc,qty,price:c.price,st:'Not Ordered'},o||{}); };
function seed(){
  PID=0;
  return [
   {no:'37750',cust:'Yadkin Valley Freight',unit:'T-118',veh:'2020 Volvo VNL 760',eng:'D13',vin:'…LN227310',spot:'L4',tech:'LM',wr:'AM',route:{from:'AM',at:832,why:'Approved — order parts'},
    ops:[{cmp:'A/C not cooling — compressor clutch',parts:[pt('22411521',1),pt('21877394',1),pt('20532195',1)]}],log:[['10/22 13:52','<b>Alicia</b> → Parts · Approved — order parts'],['10/22 11:05','Customer approved the estimate · $1,940']]},
   {no:'37466',cust:'Uwharrie Fuel',unit:'U-07',veh:'2019 Volvo VNL 860',eng:'D13',vin:'…KN204417',spot:'B6',tech:'PS',wr:'JT',route:{from:'FD',at:842,why:'Priya needs it now — she’s in B6',now:1},
    ops:[{cmp:'Misfire cylinder 4 — injector',parts:[pt('22479124',1)]}],log:[['10/22 14:02','<b>Frank</b> → Parts · Priya needs the injector now'],['10/22 13:30','Cylinder cut-out test failed on 4']]},
   {no:'37388',cust:'Elkin Hardwoods',unit:'EH-22',veh:'2021 Volvo VNR 640',eng:'D13',vin:'…MN310982',spot:'L9',tech:'DK',wr:'AM',appr:700,
    ops:[{cmp:'DEF doser clogged — derate',parts:[pt('23295841',1),pt('21512367',1)]}],log:[['10/22 11:40','<b>Alicia</b> → Parts · Approved — order parts · accepted']]},
   {no:'37519',cust:'Dixie Fleet Services',unit:'D-341',veh:'2018 Volvo VNL 670',eng:'D13',vin:'…JN198004',spot:'L2',tech:'MR',wr:'JT',appr:615,
    ops:[{cmp:'Coolant temp sensor — erratic reading',parts:[pt('21531071',1),pt('21789944',1)]}],log:[['10/22 10:15','<b>Jordan</b> → Parts · Approved — order parts · accepted']]},
   {no:'37203',cust:'Surry Feed & Seed',unit:'SF-3',veh:'2019 Volvo VNL 760',eng:'D13',vin:'…KN266120',spot:'B9',tech:'LM',wr:'AM',bay:'2026-10-19',
    ops:[{cmp:'Radiator leak — lower tank',parts:[pt('21399788',1,{st:'Backordered',sup:'pdc',po:'55762',ord:'2026-10-19',eta:null})]}],log:[['10/20 08:10','Volvo PDC: radiator backordered, no date'],['10/19 15:20','Ordered · PO 55762 · Volvo PDC'],['10/19 14:55','Radiator out — truck stays in B9']],told:'10/20'},
   {no:'37628',cust:'Prairie Line Trucking',unit:'412',veh:'2019 Volvo VNL 860',eng:'D13 TC',vin:'…KN281460',spot:'L12',tech:'MR',wr:'JT',
    ops:[{cmp:'Turbo actuator fault — low boost',parts:[pt('22972342',1,{st:'Ordered',sup:'pdc',po:'55790',ord:'2026-10-20',eta:'2026-10-21'})]}],log:[['10/20 11:40','Ordered · PO 55790 · Volvo PDC · due Wed 10/21'],['10/20 11:24','Mike stopped · Waiting – Parts']],told:'10/20'},
   {no:'37544',cust:'Copperline Transport',unit:'C-55',veh:'2018 Volvo VNL 760',eng:'D13',vin:'…JN173385',spot:'L3',tech:'AW',wr:'AM',
    ops:[{cmp:'EGR valve stuck — derate',parts:[pt('23137410',1,{st:'Ordered',sup:'pdc',po:'55711',ord:'2026-10-15',eta:null})]}],log:[['10/15 16:05','Ordered · PO 55711 · Volvo PDC · no date given']]},
   {no:'37742',cust:'Rowan Ready Mix',unit:'RM-9',veh:'2020 Volvo VHD',eng:'D11',vin:'…LN240051',spot:'L5',tech:'DK',wr:'JT',
    ops:[{cmp:'Air dryer purging constantly',parts:[pt('21620181',1,{st:'Received',sup:'pdc',po:'55801',ord:'2026-10-21',eta:'2026-10-22',bin:'A3',rcv:460}),pt('20972915',1,{st:'Received',sup:'stock',bin:'A3',rcv:462})]}],log:[['10/22 07:42','Checked in · bin A3 · all parts in'],['10/21 09:30','Ordered · PO 55801 · Volvo PDC']]},
   {no:'37455',cust:'Highplains Grain',unit:'HG-14',veh:'2021 Volvo VNL 760',eng:'D13',vin:'…MN288713',spot:'L8',tech:'AW',wr:'AM',
    ops:[{cmp:'Coolant leak at water pump',parts:[pt('21468475',1,{st:'Received',sup:'pdc',po:'55803',ord:'2026-10-21',eta:'2026-10-22',bin:'A4',rcv:461}),pt('20734264',1,{st:'Received',sup:'stock',bin:'A4',rcv:463})]}],log:[['10/22 07:43','Checked in · bin A4 · all parts in'],['10/21 10:10','Ordered · PO 55803 · Volvo PDC']]},
   {no:'37720',cust:'Keystone Carriers',unit:'K-201',veh:'2022 Volvo VNL 860',eng:'D13',vin:'…NN301776',spot:'L1',tech:'DK',wr:'JT',
    ops:[{cmp:'Brakes at 40% — drive axle shoes and drums',parts:[pt('85137802',2,{st:'Ordered',sup:'pdc',po:'55822',ord:'2026-10-21',eta:'2026-10-22'}),pt('85131923',2,{st:'Received',sup:'stock',bin:'A2',rcv:610}),pt('85137815',2,{st:'Received',sup:'stock',bin:'A2',rcv:611})]}],log:[['10/22 10:11','Drums and hardware pulled from stock · bin A2'],['10/21 15:30','Ordered shoes · PO 55822 · Volvo PDC · due today']]},
   {no:'37011',cust:'Red Mesa Hauling',unit:'RMH-6',veh:'2019 Volvo VNL 760',eng:'D13',vin:'…KN259903',spot:'L6',tech:'PS',wr:'AM',jt:'RECALL',
    ops:[{cmp:'Recall 24V-118 — EGR cooler inspection',parts:[pt('21751883',1,{st:'Ordered',sup:'pdc',po:'55818',ord:'2026-10-21',eta:'2026-10-22',price:0})]}],log:[['10/21 13:00','Ordered · PO 55818 · Volvo PDC · recall, no charge']]},
   {no:'37660',cust:'Mount Airy Logistics',unit:'MA-40',veh:'2018 Volvo VNL 670',eng:'D13',vin:'…JN171290',spot:'L10',tech:'KT',wr:'JT',
    ops:[{cmp:'Clutch slipping — replace clutch',parts:[pt('85023114',1,{st:'Ordered',sup:'vor',po:'55826',ord:'2026-10-22',eta:'2026-10-23'}),pt('21302012',1,{st:'Received',sup:'stock',bin:'A5',rcv:575})]}],log:[['10/22 09:35','Clutch kit on rush · PO 55826 · due Fri 10/23 07:00'],['10/22 09:35','Release bearing pulled from stock · bin A5']]},
   {no:'37602',cust:'Triad Cold Chain',unit:'T-412',veh:'2021 Volvo VNL 760',eng:'D13 TC',vin:'…MN281460',spot:'L11',tech:'MR',wr:'AM',
    ops:[{cmp:'DPF pressure sensor — fault code',parts:[pt('22770789',1,{st:'Ordered',sup:'pdc',po:'55824',ord:'2026-10-22',eta:'2026-10-26'})]}],log:[['10/22 08:50','Ordered · PO 55824 · Volvo PDC · due Mon 10/26']]},
   {no:'37593',cust:'Catawba Timber',unit:'CT-8',veh:'2019 Volvo VNL 860',eng:'D13',vin:'…KN233017',spot:'L7',tech:'PS',wr:'JT',
    ops:[{cmp:'Headlamp out — housing cracked, left',parts:[pt('82491362',1,{st:'Ordered',sup:'pdc',po:'55819',ord:'2026-10-21',eta:'2026-10-27'})]}],log:[['10/21 14:10','Ordered · PO 55819 · Volvo PDC · due Tue 10/27']]},
   {no:'37771',cust:'Northline Transport',unit:'N-88',veh:'2020 Volvo VNL 760',eng:'D13',vin:'…LN219044',spot:'—',tech:'AW',wr:'AM',ops:[],
    ret:{kind:'warranty',tag:'FP-1001',desc:'Water pump',pn:'21468475',ra:'88213',by:'2026-10-27',shelf:'W3',claim:'W2619848'},log:[['10/21 09:00','Volvo asked for the water pump back · RA 88213'],['10/14 15:10','Failed part tagged FP-1001 · shelf W3']]},
   {no:'37480',cust:'Yadkin Valley Dairy',unit:'YD-2',veh:'2018 Volvo VNL 670',eng:'D13',vin:'…JN160327',spot:'—',tech:'KT',wr:'JT',ops:[],
    ret:{kind:'core',desc:'Starter core',pn:'22088425',charge:95,by:'2026-10-29',shelf:'K2'},log:[['10/20 16:40','Starter replaced · core on shelf K2 · $95 core charge']]}
  ];
}
function reset(){ S={R:seed(),C:JSON.parse(JSON.stringify(CAT0))}; U={view:'desk',sel:'37750',pop:null,kb:false,open:{},done:[],cq:'',cflt:'all',kopen:{},q:''}; UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify({S,done:U.done})); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const get=no=>S.R.find(r=>r.no===no);

/* ---------- what each RO needs from Parts ---------- */
const lines=r=>r.ops.flatMap(o=>o.parts);
const inHand=p=>p.st==='Received'||p.st==='Installed';
function late(p){ if(p.st==='Backordered') return {k:'bo',t:p.eta?'backordered · now '+short(p.eta):'backordered · no date'};
  if(p.st!=='Ordered') return null;
  if(p.eta&&p.eta<TODAY){ const n=dd(p.eta,TODAY); return {k:'late',t:`due ${short(p.eta)} · ${n} d late`,n}; }
  if(!p.eta&&p.ord&&dd(p.ord,TODAY)>=5) return {k:'noeta',t:`ordered ${dd(p.ord,TODAY)} d ago · no ETA`}; return null; }
function stateOf(r){
  if(U.done.includes(r.no)) return 'done';
  if(r.route&&!r.route.acc) return 'sent';
  if(r.ret) return r.ret.shipped?'done':'ret';
  const L=lines(r);
  if(L.some(p=>p.st==='Not Ordered')) return 'order';
  if(L.some(late)) return 'late';
  if(L.length&&L.every(inHand)) return 'in';
  return 'way';
}
const GROUPS=[['sent','Sent to you','inbox'],['order','To order','cart'],['late','Late','clock'],['in','Arrived','check'],['ret','Returns','undo']];
function grouped(){ const G={sent:[],order:[],late:[],in:[],ret:[],way:[],done:[]}; S.R.forEach(r=>G[stateOf(r)].push(r)); return G; }
const flat=()=>{ const G=grouped(); return GROUPS.flatMap(g=>G[g[0]]).concat(U.open.way?G.way:[]).map(r=>r.no); };
const binOf=r=>{ const b=lines(r).map(p=>p.bin).filter(Boolean); return b[0]||null; };
function why(r){ const st=stateOf(r), L=lines(r);
  if(st==='sent') return {t:`From ${F(r.route.from)} ${hm(r.route.at)} · ${r.route.why}`,late:!!r.route.now};
  if(st==='order'){ const no=L.filter(p=>p.st==='Not Ordered'), stk=no.filter(p=>(cat(p.pn)||{}).oh>=p.qty).length; return {t:`Approved ${hm(r.appr||r.route&&r.route.at||480)} · ${no.length} part${no.length>1?'s':''}${stk?` · ${stk} on the shelf`:''}`}; }
  if(st==='late'){ const p=L.find(late), l=late(p); return {t:r.spot[0]==='B'?`${r.spot} tied up ${dd(r.bay||TODAY,TODAY)} d · ${lc(p.desc)} ${l.t}`:`${p.desc} · ${l.t}`,late:true}; }
  if(st==='in'){ return {t:`All ${L.length} in · bin ${binOf(r)} · since ${hm(Math.max(...L.map(p=>p.rcv||0)))}`}; }
  if(st==='ret') return r.ret.kind==='warranty'?{t:`Volvo wants the ${lc(r.ret.desc)} back · ship by ${short(r.ret.by)}`,late:dd(TODAY,r.ret.by)<=5}:{t:`${r.ret.desc} · ${usd0(r.ret.charge)} charge · back by ${short(r.ret.by)}`};
  if(st==='way'){ const p=L.filter(x=>!inHand(x)).sort((a,b)=>(a.eta||'9')<(b.eta||'9')?-1:1)[0]; return {t:p?`${p.desc} · due ${p.eta===TODAY?'today':short(p.eta)}`:'—'}; }
  return {t:'Cleared'}; }
const BTN={sent:r=>r.route.now?'Pull it':'Accept',order:()=>'Order…',late:()=>'Chase…',in:()=>'Send to Frank',ret:()=>'Ship…',way:()=>'Open'};

/* ---------- drawing ---------- */
const stCls={'Not Ordered':'no','Ordered':'ord','Backordered':'bo','Received':'in','Installed':'inst'};
const stTxt={'Not Ordered':'Not ordered','Ordered':'Ordered','Backordered':'Backordered','Received':'In hand','Installed':'Installed'};
const stChip=(p,live)=>{ const l=late(p); return `<span class="pt-st ${l&&l.k==='late'?'late':stCls[p.st]}"${live?` data-a="pop" data-p="st" data-pid="${p.id}" title="Change status"`:''}><i></i>${stTxt[p.st]}${live?ic('chevD',10):''}</span>`; };
function render(){
  const v=U.view;
  const body=v==='order'?vOrder():v==='shelf'?vShelf():v==='cat'?vCat():vDesk();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='parts'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg pt">${head()}<div class="tg-body v-${v}">${v==='desk'?list():''}<div class="tg-main">${body}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const G=grouped(), all=S.R.flatMap(lines), oo=all.filter(p=>p.st==='Ordered'||p.st==='Backordered'), due=oo.filter(p=>p.eta===TODAY).length, amt=oo.reduce((s,p)=>s+p.price*p.qty,0);
  const f=(k,n,t,w)=>n?`<button class="tg-hf${w?' w':''}" data-a="hf" data-k="${k}"><b>${n}</b>${t}</button><i>·</i>`:'';
  const vs=[['desk','inbox2','Desk'],['order','truck','On order'],['shelf','shelf','Shelf'],['cat','book','Catalog']];
  return `<header class="tg-head"><h1 class="tg-h1">Parts</h1><span class="tg-facts">${f('sent',G.sent.length,'sent to you')}${f('order',G.order.length,'to order')}${f('late',G.late.length,'late',true)}${f('due',due,'due today')}<span class="tg-hf" style="cursor:default"><b>${usd0(amt)}</b>on order</span></span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Find a part, RO or customer (/)">${ic('search',16)}</button><button class="btn btn-sm btn-primary pt-cb" data-a="pop" data-p="chk" title="Check in a delivery (C)">${ic('truck',15)}Check in</button></header>`;
}
function list(){
  const G=grouped(), s=U.sel;
  const item=r=>{ const st=stateOf(r), w=why(r), on=r.no===s, g=GROUPS.find(x=>x[0]===st);
    return `<div class="tg-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-ro="${r.no}">${w.late?'<i class="tg-dot"></i>':''}<span class="tg-gi${st==='sent'&&r.route.now?' now':''}">${ic(g?g[2]:'box',15)}</span><span class="tg-t"><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b>${r.spot!=='—'?`<span class="tg-spot${r.spot[0]==='B'?' bay':''}">${ic('pin',11)}${r.spot}</span>`:''}</span><span class="tg-w${w.late?' late':''}">${esc(w.t)}</span><button class="btn btn-sm${st==='sent'&&r.route.now?' btn-primary':''} tg-go" data-a="do" data-ro="${r.no}">${esc(BTN[st](r))}${on&&U.kb?kbd('↵'):''}</button></div>`; };
  let body=GROUPS.filter(g=>G[g[0]].length).map(g=>`<div class="tg-grp">${g[1]}<span>${G[g[0]].length}</span></div>`+G[g[0]].map(item).join('')).join('');
  if(!body) body=`<div class="tg-empty"><span class="tg-ring0 ok">${ic('check',22)}</span><h3>All caught up</h3><p>Nothing to order, chase or ship.</p></div>`;
  if(G.way.length) body+=`<div class="tg-sec${U.open.way?' open':''}" data-a="open" data-k="way">${ic('chevR',12)}<span>On the way</span><span class="n">${G.way.length}</span><span class="m">on time</span></div>`+(U.open.way?G.way.map(item).join(''):'');
  if(G.done.length) body+=`<div class="tg-sec${U.open.done?' open':''}" data-a="open" data-k="done">${ic('chevR',12)}<span>Cleared today</span><span class="n">${G.done.length}</span></div>`+(U.open.done?`<div class="tg-rows">${G.done.map(r=>`<div class="tg-row done"><time>${esc(r.doneAt||'')}</time><b class="tg-no">${r.no}</b><b>${esc(r.cust)}</b><small>${ic('check',12)}${esc(r.doneWhy||'')}</small></div>`).join('')}</div>`:'');
  const n=GROUPS.reduce((a,g)=>a+G[g[0]].length,0);
  return `<section class="tg-list"><div class="tg-lh">Needs action<span class="n">${n}</span></div><div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('↵')}do it</span><span>${kbd('C')}check in</span><span>${kbd('/')}find</span><span>${kbd('1')}–${kbd('4')}views</span></div></section>`;
}
function srcCell(p){
  const c=cat(p.pn)||{}, l=late(p);
  if(p.st==='Not Ordered') return c.oh>=p.qty?`<span class="src"><b>On the shelf · ${c.bin}</b><small>${c.oh} on hand</small></span>`:`<span class="src"><b>To order</b><small>${c.oh?c.oh+' on hand · short':'none on hand'}</small></span>`;
  if(inHand(p)) return `<span class="src"><b>${p.st==='Installed'?'On the truck':'Bin '+p.bin}</b><small>${p.sup==='stock'?'from stock':SUP[p.sup]+' · PO '+p.po}${p.rcv?' · in '+hm(p.rcv):''}</small></span>`;
  return `<span class="src"><b>${SUP[p.sup]} · PO ${p.po}</b><small class="${l?(l.k==='bo'?'bad':'late'):''}">${l?l.t:p.eta?(p.eta===TODAY?'due today':'due '+short(p.eta)):'no ETA'}</small></span>`; }
function nextBar(r){
  const st=stateOf(r), L=lines(r);
  const bar=(t,btn,a,sec)=>`<div class="tg-next"><span class="k">Next</span><p>${t}</p>${btn?`<button class="btn btn-sm${a==='do'?' btn-primary':''}" data-a="do" data-ro="${r.no}">${btn}${kbd('↵')}</button>`:''}${sec||''}</div>`;
  if(st==='sent') return r.route.now?bar(`${F(r.tech)} is waiting in ${r.spot} for the ${lc(L[0].desc)} — ${cat(L[0].pn).oh} on the shelf, bin ${cat(L[0].pn).bin}.`,'Pull it','do',`<button class="btn btn-sm" data-a="pop" data-p="ret" data-ro="${r.no}">Return…</button>`)
    :bar(`${F(r.route.from)} sent this ${hm(r.route.at)} · ${esc(r.route.why)}.`,'Accept','do',`<button class="btn btn-sm" data-a="pop" data-p="ret" data-ro="${r.no}">Return…</button>`);
  if(st==='order'){ const no=L.filter(p=>p.st==='Not Ordered'), stk=no.filter(p=>cat(p.pn).oh>=p.qty).length; return bar(stk===no.length?(no.length===1?`1 part to get — it’s on the shelf, bin ${cat(no[0].pn).bin}.`:`${no.length} parts to get — all on the shelf.`):`${no.length} part${no.length>1?'s':''} to get${stk?` · ${stk} on the shelf`:''}.`,stk===no.length?'Pull…':'Order…','do'); }
  if(st==='late'){ const p=L.find(late), l=late(p); return bar(`The ${lc(p.desc)} is ${l.k==='late'?l.n+' day'+(l.n>1?'s':'')+' late':l.k==='bo'?'backordered with no date':'7 days out with no ETA'} — ${SUP[p.sup]}, PO ${p.po}.${r.told?` ${F(r.wr)} last told the customer ${r.told}.`:''}`,'Chase…','do'); }
  if(st==='in') return bar(`Every part is in — bin ${binOf(r)}. Send it to Frank to bring the truck in.`,'Send to Frank','do');
  if(st==='ret') return r.ret.kind==='warranty'?bar(`Volvo wants the ${lc(r.ret.desc)} back — tag ${r.ret.tag}, shelf ${r.ret.shelf}, RA ${r.ret.ra}. Ship by ${short(r.ret.by)}.`,'Ship…','do'):bar(`Send the ${lc(r.ret.desc)} back by ${short(r.ret.by)} or the ${usd0(r.ret.charge)} core charge stays on the bill.`,'Ship…','do');
  if(st==='way'){ const p=L.filter(x=>!inHand(x))[0]; return bar(`Nothing to do — the ${lc(p.desc)} is due ${p.eta===TODAY?'today':short(p.eta)}.`,'',''); }
  return `<div class="pt-ok">${ic('check',16)}Cleared — ${esc(r.doneWhy||'')}</div>`;
}
function vDesk(){
  const r=get(U.sel); if(!r) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('parts',22)}</span><h3>Pick an RO</h3><p>Its parts, where they are and what’s next.</p></div></div>`;
  const st=stateOf(r), L=lines(r), g=GROUPS.find(x=>x[0]===st);
  const tot=L.reduce((s,p)=>s+p.price*p.qty,0), nIn=L.filter(inHand).length;
  let h=`<div class="pt-pane" data-scroll="pane"><div class="tg-top"><div class="r1"><span class="tg-no">RO-${r.no}</span>${r.jt?`<span class="pt-jt">${r.jt}</span>`:''}<span>·</span><span>${esc(r.veh)} · ${esc(r.eng)} · Unit ${esc(r.unit)}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="send" data-ro="${r.no}">${ic('swap',14)}Send to…</button><button class="btn btn-sm" data-a="toast" data-t="Opens RO-${r.no}.">Open RO</button></div><h2>${esc(r.cust)}</h2>
    <div class="pt-facts"><div><small>Truck</small><span class="${r.spot[0]==='B'&&st==='late'?'warn':''}">${r.spot==='—'?'Gone — RO closed':r.spot[0]==='B'?`${ic('pin',12)}Bay ${r.spot.slice(1)}${st==='late'?' · tied up':''}`:`${ic('pin',12)}Lot ${r.spot}`}</span></div><div><small>Technician</small><span>${esc(PPL[r.tech])}</span></div><div><small>Writer</small><span>${esc(PPL[r.wr])}</span></div><div><small>VIN</small><span class="m">${esc(r.vin)}</span></div><div><small>Parts on this RO</small><span class="m">${L.length?usd(tot):'—'}</span></div></div></div><div class="pt-pad">${nextBar(r)}`;
  r.ops.forEach((o,i)=>{ const oin=o.parts.filter(inHand).length, ot=o.parts.reduce((s,p)=>s+p.price*p.qty,0);
    h+=`<div class="pt-op"><div class="pt-oph"><span class="n">${i+1}</span>${r.jt?`<span class="pt-jt">${r.jt}</span>`:''}<b>${esc(o.cmp)}</b><span class="sp"></span><small>${oin} of ${o.parts.length} in hand</small><span class="pt-bar"><i style="width:${o.parts.length?oin/o.parts.length*100:0}%"></i></span></div>
      <div class="pt-pr h"><span>Status</span><span>Part</span><span>Part #</span><span style="text-align:right">Qty</span><span>Where</span><span style="text-align:right">Each</span><span></span></div>
      ${o.parts.map(p=>{ const c=cat(p.pn)||{}, l=late(p); return `<div class="pt-pr">${stChip(p,1)}<span class="d"><b>${esc(p.desc)}</b>${p.st==='Not Ordered'&&c.oh>=p.qty?`<small class="ok">In stock · bin ${c.bin}</small>`:''}</span><span class="pn">${p.pn}</span><span class="q">${p.qty}</span>${srcCell(p)}<span class="pr">${p.price?usd(p.price):'no charge'}</span><span class="ac">${st==='sent'?'':p.st==='Not Ordered'?`<button class="btn btn-sm" data-a="do" data-ro="${r.no}">${c.oh>=p.qty?'Pull':'Order…'}</button>`:l?`<button class="btn btn-sm" data-a="do" data-ro="${r.no}">Chase…</button>`:p.st==='Ordered'?`<button class="btn btn-sm" data-a="rcv1" data-pid="${p.id}">${ic('check',13)}It’s in</button>`:''}</span></div>`; }).join('')}
      <div class="pt-opf"><span>Parts</span><b>${usd(ot)}</b><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Pick from the catalog or paste a quote — same as Extract parts.">${ic('plus',13)}Add a part</button></div></div>`; });
  if(r.ret) h+=`<div class="pt-op"><div class="pt-ret"><span class="gi">${ic(r.ret.kind==='warranty'?'warranty':'undo',16)}</span><b>${r.ret.kind==='warranty'?`${r.ret.tag} · ${esc(r.ret.desc)} · ${r.ret.pn}`:`${esc(r.ret.desc)} · ${r.ret.pn}`}</b><small>${r.ret.kind==='warranty'?`Claim ${r.ret.claim} · RA ${r.ret.ra} · shelf ${r.ret.shelf} · ship by ${short(r.ret.by)}`:`Core charge ${usd0(r.ret.charge)} · shelf ${r.ret.shelf} · back by ${short(r.ret.by)}`}${r.ret.shipped?` · shipped ${esc(r.ret.shipped)}`:''}</small>${r.ret.shipped?'':`<button class="btn btn-sm" data-a="do" data-ro="${r.no}">Ship…</button>`}</div></div>`;
  h+=`<div class="pt-sec">History<span class="sp"></span><span>hand-offs, orders and check-ins</span></div><div class="pt-log">${r.log.map(x=>`<div><time>${x[0]}</time><span>${x[1]}</span></div>`).join('')}</div>`;
  return h+'</div></div>';
}
function vOrder(){
  const rows=[]; S.R.forEach(r=>lines(r).forEach(p=>{ if(p.st==='Ordered'||p.st==='Backordered') rows.push({r,p}); }));
  const G=[['late','Late',x=>!!late(x.p)],['today','Due today',x=>!late(x.p)&&x.p.eta===TODAY],['tom','Tomorrow',x=>x.p.eta===addD(TODAY,1)],['later','Later',x=>!late(x.p)&&x.p.eta&&x.p.eta>addD(TODAY,1)],['none','No ETA yet',x=>!late(x.p)&&!x.p.eta]];
  const amt=rows.reduce((s,x)=>s+x.p.price*x.p.qty,0), nl=rows.filter(x=>late(x.p)).length;
  const row=x=>{ const p=x.p, r=x.r, l=late(p);
    return `<div class="pt-or" data-a="open" data-ro="${r.no}" data-k="ro"><b>${esc(p.desc)}</b><span class="m">${p.pn}</span><span class="m q">${p.qty}</span><span class="ro"><b class="tg-no">${r.no}</b><span>${esc(r.cust)}</span></span><span class="wt">${r.spot[0]==='B'?`<span class="tg-spot bay">${ic('pin',11)}${r.spot}</span>`:`<span class="tg-spot">${ic('pin',11)}${r.spot}</span>`}${F(r.tech)}</span><span class="su">${SUP[p.sup]}<small>PO ${p.po} · ${md(p.ord)}</small></span><span class="eta ${l?(l.k==='bo'?'bad':'late'):''}">${l?(l.k==='late'?`${l.n} d late`:l.k==='bo'?'Backordered':'No ETA'):p.eta===TODAY?'Today':short(p.eta)}</span>${stChip(p,0)}</div>`; };
  const tbl=G.map(g=>{ const L=rows.filter(g[2]); if(!L.length) return ''; return `<div class="pt-tg${g[0]==='late'?' late':''}">${g[1]}<span>${L.length}</span><span class="sp"></span>${g[0]==='today'?`<button class="btn btn-sm" data-a="pop" data-p="chk">${ic('truck',13)}Check in</button>`:''}</div>${L.map(row).join('')}`; }).join('');
  return `<div class="pt-full"><div class="pt-fh"><h2>On order</h2><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="CSV saved — every open order line.">${ic('download',14)}Export</button><button class="btn btn-sm" data-a="toast" data-t="Order list prints — grouped by supplier, with PO numbers.">${ic('print',14)}Print</button></div>
   <div class="pt-sum"><span><b>${rows.length}</b>parts on order</span><span><b>${new Set(rows.map(x=>x.r.no)).size}</b>ROs</span><span><b>${usd0(amt)}</b>on order</span>${nl?`<span class="warn"><b>${nl}</b>late</span>`:''}</div>
   <div class="pt-tbl"><div class="pt-or h"><span>Part</span><span>Part #</span><span class="q">Qty</span><span>RO</span><span>Truck · tech</span><span>Supplier · PO</span><span>ETA</span><span>Status</span></div>${tbl}</div></div>`;
}
function vShelf(){
  const bins=['A1','A2','A3','A4','A5','A6','A7','A8'].map(b=>{ const rs=S.R.filter(r=>!U.done.includes(r.no)&&lines(r).some(p=>p.bin===b&&p.st==='Received')); return {b,r:rs[0]}; });
  const card=x=>{ if(!x.r) return `<div class="pt-bin empty"><span class="k">${x.b}</span><span class="w">Empty</span></div>`;
    const r=x.r, L=lines(r), n=L.filter(inHand).length, all=n===L.length;
    return `<div class="pt-bin" data-a="open" data-ro="${r.no}" data-k="ro"><span class="k">${x.b}<span class="sp"></span><em class="${all?'ok':'part'}">${all?'All in':n+' of '+L.length+' in'}</em></span><span class="t"><b class="tg-no">${r.no}</b><b>${esc(r.cust)}</b></span><span class="w"><span class="tg-av">${r.tech}</span>${F(r.tech)}<span class="sp"></span>${L.filter(p=>p.bin===x.b).length} part${L.filter(p=>p.bin===x.b).length>1?'s':''}</span></div>`; };
  const rets=S.R.filter(r=>r.ret);
  const rrow=r=>{ const x=r.ret, w=x.kind==='warranty';
    return `<div class="pt-sr"><span class="m">${w?x.tag:'Core'}</span><span class="d"><b>${esc(x.desc)}</b><small>${x.pn}</small></span><span class="d"><b><span class="tg-no">${r.no}</span> ${esc(r.cust)}</b><small>${w?`Claim ${x.claim} · RA ${x.ra}`:`${usd0(x.charge)} core charge`}</small></span><span class="m">${x.shelf}</span><span class="st">${x.shipped?`<span class="done">${ic('check',12)}Shipped ${esc(x.shipped)}</span>`:`<span class="pt-st ${dd(TODAY,x.by)<=5?'late':'no'}"><i></i>${w?'Return requested':'Core due back'}</span>${w?'ship':'back'} by ${short(x.by)}`}</span>${x.shipped?'<span></span>':`<button class="btn btn-sm" data-a="do" data-ro="${r.no}">Ship…</button>`}</div>`; };
  return `<div class="pt-full"><div class="pt-fh"><h2>Shelf</h2><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Bin labels print — RO, customer, tech and a list of what’s in it.">${ic('print',14)}Print bin labels</button></div>
    <div class="pt-tg" style="padding-top:0">Staged for the shop<span>${bins.filter(x=>x.r).length} of 8 bins</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">checked-in parts wait here until the tech picks them up</span></div>
    <div class="pt-bins">${bins.map(card).join('')}</div>
    <div class="pt-tg">Going back<span>${rets.length}</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">failed parts Volvo wants back, from the Warranty page · cores</span></div>
    <div class="pt-tbl"><div class="pt-sr h"><span>Tag</span><span>Part</span><span>RO</span><span>Shelf</span><span>Status</span><span></span></div>${rets.map(rrow).join('')}</div></div>`;
}
function kitPrice(k){ return k.kids.reduce((s,x)=>s+(cat(x[0]).price*x[1]),0); }
function vCat(){
  const q=U.cq.trim().toLowerCase(), hay=c=>[c.pn,c.desc,c.fit,c.bin].join(' ').toLowerCase();
  let L=S.C.filter(c=>!q||hay(c).includes(q)); if(U.cflt==='low') L=L.filter(c=>c.min&&c.oh<c.min);
  const kits=U.cflt==='low'?[]:KITS0.filter(k=>!q||[k.pn,k.desc,k.fit].join(' ').toLowerCase().includes(q)||k.kids.some(x=>hay(cat(x[0])).includes(q)));
  const nLow=S.C.filter(c=>c.min&&c.oh<c.min).length;
  const row=c=>{ const low=c.min&&c.oh<c.min; return `<div class="pt-cr"><span></span><span class="d"><b>${esc(c.desc)}</b>${low?'<span class="pt-low">Low</span>':''}</span><span class="m">${c.pn}</span><span class="oh${low?' low':''}">${c.oh}${c.min?`<span style="color:var(--tg-ink4);font-weight:400">/ ${c.min}</span>`:''}</span><span class="m">${c.bin||'—'}</span><span class="m r">${usd(c.price)}</span><span class="fit">${esc(c.fit)}</span><span class="ac">${low?`<button class="btn btn-sm" data-a="reorder" data-pn="${c.pn}">Reorder</button>`:''}</span></div>`; };
  const krow=k=>{ const o=U.kopen[k.pn]!==false; return `<div class="pt-cr"><button class="car${o?' open':''}" data-a="kit" data-pn="${k.pn}" title="Show the parts in this kit">${ic('chevR',13)}</button><span class="d"><span class="pt-kitb">KIT · ${k.kids.length}</span><b>${esc(k.desc)}</b></span><span class="m">${k.pn}</span><span class="oh">${Math.min(...k.kids.map(x=>Math.floor(cat(x[0]).oh/x[1])))}</span><span class="m">—</span><span class="m r">${usd(kitPrice(k))}</span><span class="fit">${esc(k.fit)}</span><span class="ac"></span></div>`+(o?k.kids.map(x=>{ const c=cat(x[0]); return `<div class="pt-cr kid"><span></span><span class="d"><b>${esc(c.desc)}</b><span style="color:var(--tg-ink3)">× ${x[1]}</span></span><span class="m">${c.pn}</span><span class="oh">${c.oh}</span><span class="m">${c.bin||'—'}</span><span class="m r">${usd(c.price)}</span><span class="fit">fits the kit</span><span></span></div>`; }).join(''):''); };
  return `<div class="pt-full"><div class="pt-fh"><h2>Catalog</h2><span class="tg-hf" style="cursor:default">${S.C.length} parts · ${KITS0.length} kits · what we stock, where it sits, what it costs</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Paste a parts list, quote or invoice — or read a screenshot or PDF.">${ic('scan',14)}Extract parts</button><button class="btn btn-sm" data-a="toast" data-t="New kit — name it, then add parts.">${ic('kit',14)}Kit</button><button class="btn btn-sm btn-primary" data-a="toast" data-t="New part — part #, description, price, bin.">${ic('plus',14)}Part</button></div>
   <div class="pt-cbar"><input id="pt-cq" placeholder="Search part #, description, engine, bin…" value="${esc(U.cq)}"><span class="tg-seg3"><button class="${U.cflt==='all'?'on':''}" data-a="cflt" data-v="all">All</button><button class="${U.cflt==='low'?'on':''}" data-a="cflt" data-v="low">Low stock · ${nLow}</button></span><span class="sp"></span></div>
   <div class="pt-tbl"><div class="pt-cr h"><span></span><span>Description</span><span>Part #</span><span class="r">On hand / min</span><span>Bin</span><span class="r">Price</span><span>Fits</span><span></span></div>${kits.map(krow).join('')}${L.map(row).join('')||'<div class="pt-none">Nothing matches.</div>'}</div></div>`;
}
/* ---------- popovers ---------- */
function dueLines(){ const R=[]; S.R.forEach(r=>lines(r).forEach(p=>{ if(p.st==='Ordered'&&(p.eta===TODAY||late(p))) R.push({r,p}); })); return R; }
const nextBin=()=>{ const used=new Set(S.R.flatMap(lines).filter(p=>p.st==='Received').map(p=>p.bin)); return ['A1','A2','A3','A4','A5','A6','A7','A8'].find(b=>!used.has(b))||'A8'; };
function pop(){
  const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const st=`style="left:${p.x||400}px;top:${p.y||12}px"`;
  const r=p.ro?get(p.ro):null;
  if(p.type==='st'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===p.pid); if(!f) return '';
    const H={'Not Ordered':'still to get','Ordered':'on the way','Backordered':'supplier is short','Received':'in hand · on a bin','Installed':'on the truck'};
    return `<div class="tg-pop menu" ${st}><div class="tg-ph"><b>${esc(f.q.desc)}</b><span class="cu">${f.q.pn}</span></div>${Object.keys(H).map((k,i)=>`<button class="tg-mi${f.q.st===k?' on':''}" data-a="setst" data-pid="${p.pid}" data-v="${k}"><span class="pt-dot" style="background:var(${k==='Backordered'?'--tg-bad':k==='Received'?'--tg-good':k==='Ordered'?'--tg-st-support':'--tg-ink3'})"></span>${stTxt[k]}<span class="meta">${H[k]}</span></button>`).join('')}</div>`; }
  if(p.type==='order'){ const no=lines(r).filter(x=>x.st==='Not Ordered'), stk=no.filter(x=>cat(x.pn).oh>=x.qty), buy=no.filter(x=>cat(x.pn).oh<x.qty);
    const O=[['pdc','Volvo PDC · stock order','arrives Mon 10/26 · no freight'],['vor','Volvo PDC · rush (VOR)','arrives tomorrow, Fri 10/23 by 07:00'],['fp','FleetPride','today by 16:00 · '+(buy.length===1?'has 1':'not every part')]];
    const amt=no.reduce((s,x)=>s+x.price*x.qty,0);
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Order parts',`${r.no} · ${esc(r.cust)}`)}<div class="pt-lst">${no.map(x=>{ const c=cat(x.pn), s=c.oh>=x.qty; return `<label class="pt-ln"><input type="checkbox" checked disabled><span class="d"><b>${esc(x.desc)}</b><small>${x.pn} · × ${x.qty}</small></span><span class="r"><b>${usd(x.price*x.qty)}</b>${s?`<span class="stk">from stock · bin ${c.bin}</span>`:'to order'}</span></label>`; }).join('')}</div>
      ${buy.length?`<span class="tg-lbl top" style="margin-top:10px">Order ${buy.length} from</span>${O.map((o,i)=>`<button class="pt-opt${p.o===i?' on':''}" data-a="oset" data-o="${i}"${o[0]==='fp'&&buy.length>1?' disabled':''}>${kbd(i+1)}<b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}
      <div class="pt-two"><label class="pt-f"><span>PO #</span><input id="pt-po" value="${esc(p.po||'55831')}"></label><label class="pt-f"><span>ETA</span><input value="${p.o==null?'':p.o===0?'Mon 10/26':p.o===1?'Fri 10/23 · 07:00':'Thu 10/22 · 16:00'}" readonly placeholder="pick a supplier"></label></div>
      <label class="pt-ck"><input type="checkbox" data-a="tell" ${p.tell!==false?'checked':''}>Send ${F(r.wr)} the ETA — she updates the customer</label>`:`<div class="pt-ctx" style="margin-top:10px">Everything is on the shelf — it goes to the RO’s bin, nothing to order.</div>`}
      <div class="tg-acts"><span class="hint">${stk.length?stk.length+' from stock · ':''}${buy.length?buy.length+' to order · ':''}${usd(amt)}</span><button class="btn btn-sm btn-primary" data-a="ogo"${buy.length&&p.o==null?' disabled':''}>${buy.length&&stk.length?`Order ${buy.length} · pull ${stk.length}`:buy.length?`Order ${buy.length===1?'it':buy.length+' parts'}`:`Pull ${stk.length===1?'it':stk.length+' parts'}`}${kbd('↵')}</button></div></div>`; }
  if(p.type==='chase'){ const x=lines(r).find(late), l=late(x);
    const D=[addD(TODAY,1),addD(TODAY,4),addD(TODAY,5)];
    const O=[['New date from the supplier','pick it below'],['Backordered — no date yet','checks again tomorrow'],['Get it somewhere else','FleetPride has 1 · today by 16:00 · '+usd(x.price*1.05)]];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Chase a late part',`${r.no} · ${esc(r.cust)}`)}<div class="pt-ctx"><b>${esc(x.desc)}</b> · ${x.pn} · ${SUP[x.sup]} · PO ${x.po}<br>${l.k==='late'?`Was due ${short(x.eta)} — ${l.n} day${l.n>1?'s':''} late.`:l.k==='bo'?`Backordered since ${short(x.ord)}.`:`Ordered ${short(x.ord)} — no date yet.`}${r.spot[0]==='B'?` The truck is holding <b>bay ${r.spot.slice(1)}</b>.`:''}</div>
      ${O.map((o,i)=>`<button class="pt-opt${p.o===i?' on':''}" data-a="oset" data-o="${i}">${kbd(i+1)}<b>${o[0]}</b><small>${o[1]}</small></button>`).join('')}
      ${p.o===0?`<div class="tg-r" style="margin:8px 0 0 10px">${D.map(k=>`<button class="tg-chip${p.d===k?' on':''}" data-a="dset" data-d="${k}">${short(k)}</button>`).join('')}</div>`:''}
      <label class="pt-ck"><input type="checkbox" data-a="tell" ${p.tell!==false?'checked':''}>Tell ${F(r.wr)} — it lands in her “Parts delayed” message to the customer</label>
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="cgo"${p.o==null||(p.o===0&&!p.d)?' disabled':''}>Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='hand'){ const b=binOf(r);
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Send to Frank',`${r.no} · ${esc(r.cust)}`)}<div class="pt-ctx">All ${lines(r).length} parts are in, <b>bin ${b}</b>. The truck is on <b>${r.spot}</b>; <b>${F(r.tech)}</b> is the tech.</div>
      <span class="tg-lbl top">Note</span><input id="pt-hn" style="width:100%" value="${esc(p.n!=null?p.n:`All parts in — bin ${b}.`)}">
      <div class="tg-acts"><span class="hint">Frank sees it under Sent to you, then brings it in</span><button class="btn btn-sm btn-primary" data-a="hgo">Send to Frank${kbd('↵')}</button></div></div>`; }
  if(p.type==='ret'){ const R=['Missing part number','Not approved yet','Missing information','Wrong department'];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Send it back',`to ${F(r.route.from)} · ${r.no}`)}<div class="tg-r">${R.map(x=>`<button class="tg-chip${p.why===x?' on':''}" data-a="rset" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <div class="tg-acts"><span class="hint">It goes back to ${F(r.route.from)} with the reason</span><button class="btn btn-sm btn-primary" data-a="rgo"${p.why?'':' disabled'}>Send back${kbd('↵')}</button></div></div>`; }
  if(p.type==='ship'){ const x=r.ret, w=x.kind==='warranty', C=w?['UPS','FedEx','Volvo PDC truck']:['Volvo PDC truck','FleetPride pickup'];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd(w?'Ship a warranty return':'Send a core back',`${r.no} · ${esc(r.cust)}`)}<div class="pt-ctx"><b>${w?x.tag+' · ':''}${esc(x.desc)}</b> · ${x.pn} · shelf ${x.shelf}<br>${w?`RA ${x.ra} · claim ${x.claim} · ship by ${short(x.by)}`:`${usd0(x.charge)} core charge comes off when it’s back · by ${short(x.by)}`}</div>
      <span class="tg-lbl top">How it goes</span><div class="tg-r">${C.map(c=>`<button class="tg-chip${p.c===c?' on':''}" data-a="cset" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      ${p.c&&p.c!=='Volvo PDC truck'&&p.c!=='FleetPride pickup'?`<label class="pt-f"><span>Tracking #</span><input id="pt-tr" value="${esc(p.tr||'')}" placeholder="1Z…"></label>`:''}
      <div class="tg-acts"><span class="hint">${w?'Warranty sees it shipped':'Logged on the RO'}</span><button class="btn btn-sm btn-primary" data-a="sgo"${p.c?'':' disabled'}>Mark shipped${kbd('↵')}</button></div></div>`; }
  if(p.type==='send'){ const D=[['writer','Service writer',PPL[r.wr]],['foreman','Foreman','Frank Delaney'],['tech','Technician',PPL[r.tech]],['warranty','Warranty','Warranty desk']];
    return `<div class="tg-pop menu" ${st}><div class="tg-ph"><b>Send ${r.no} to…</b></div>${D.map((d,i)=>`<button class="tg-mi" data-a="toast" data-t="Sent to ${d[2]} — it shows under their Sent to you.">${kbd(i+1)}${d[1]}<span class="meta">${esc(d[2])}</span></button>`).join('')}</div>`; }
  if(p.type==='chk'){ const L=dueLines(), sel=p.sel||{}, n=Object.keys(sel).filter(k=>sel[k]).length;
    const ln=x=>{ const on=!!sel[x.p.id], l=late(x.p); return `<label class="pt-ln${p.hit===x.p.id?' hit':''}" data-a="ckl" data-pid="${x.p.id}"><input type="checkbox" ${on?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.p.desc)} · <span style="font-family:var(--tg-mono);font-weight:500">${x.p.pn}</span> × ${x.p.qty}</b><small>${x.r.no} · ${esc(x.r.cust)} · ${SUP[x.p.sup]} PO ${x.p.po}${l?' · '+l.t:''}</small></span><span class="r">${on?`<b>→ bin ${x.bin}</b>`:''}${on&&lines(x.r).filter(q=>q.id!==x.p.id).every(q=>inHand(q)||sel[q.id])?'<span class="stk">RO complete</span>':''}</span></label>`; };
    let bn=null; L.forEach(x=>{ const rb=binOf(x.r); x.bin=rb||(x.r._b||(x.r._b=nextBin())); });
    S.R.forEach(r=>delete r._b);
    const today=L.filter(x=>!late(x.p)), lt=L.filter(x=>late(x.p));
    return `<div class="tg-pop xf pt-pop-x" ${st}>${hd('Check in a delivery','Volvo PDC · afternoon truck')}<div class="pt-scan">${ic('scan',16)}<input id="pt-scan" placeholder="Scan or type a part #" value="${esc(p.q||'')}" autocomplete="off"><small>${kbd('↵')} ticks it</small></div>
      <div class="pt-lst">${today.length?`<div class="pt-lh">${ic('calendar',12)}Due today · ${today.length}</div>${today.map(ln).join('')}`:''}${lt.length?`<div class="pt-lh late">${ic('clock',12)}Late — may be on this truck · ${lt.length}</div>${lt.map(ln).join('')}`:''}${L.length?'':'<div class="pt-none">Nothing due — every order is in.</div>'}</div>
      <div class="tg-acts"><span class="hint">Each part goes to its RO’s bin · ${n?n+' ticked':'tick what came'}</span><button class="btn btn-sm btn-primary" data-a="kgo"${n?'':' disabled'}>Check in ${n||''} part${n===1?'':'s'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='srch'){ const q=(p.q||'').trim().toLowerCase(); const res=[];
    if(q){ S.R.forEach(r=>{ lines(r).forEach(x=>{ if([x.pn,x.desc,r.no,r.cust].join(' ').toLowerCase().includes(q)) res.push({k:'ro',r,x}); }); if(!lines(r).length&&[r.no,r.cust].join(' ').toLowerCase().includes(q)) res.push({k:'ro',r,x:null}); });
      S.C.forEach(c=>{ if([c.pn,c.desc].join(' ').toLowerCase().includes(q)) res.push({k:'cat',c}); }); }
    const R=res.slice(0,7);
    return `<div class="tg-pop menu pt-pop-w" ${st}><div class="pt-srin">${ic('search',15)}<input id="pt-sq" placeholder="Part #, part, RO or customer" value="${esc(p.q||'')}" autocomplete="off"></div>${q?(R.length?R.map((x,i)=>x.k==='ro'?`<button class="pt-srr${i===0?' k':''}" data-a="open" data-ro="${x.r.no}" data-k="ro"><span class="gi">${ic('ros',14)}</span><b>${x.x?esc(x.x.desc)+' · ':''}${x.r.no} ${esc(x.r.cust)}</b><span class="m">${x.x?x.x.pn:''}</span><small>${x.x?`${stTxt[x.x.st]}${x.x.bin&&x.x.st==='Received'?' · bin '+x.x.bin:''}${x.x.eta&&!inHand(x.x)?' · due '+short(x.x.eta):''}`:'Return on the shelf'}</small></button>`:`<button class="pt-srr${i===0?' k':''}" data-a="open" data-k="cat" data-pn="${x.c.pn}"><span class="gi">${ic('book',14)}</span><b>${esc(x.c.desc)}</b><span class="m">${x.c.pn}</span><small>Catalog · ${x.c.oh} on hand${x.c.bin?' · bin '+x.c.bin:''} · ${usd(x.c.price)}</small></button>`).join(''):`<div class="pt-none">Nothing matches “${esc(p.q)}”.</div>`):'<div class="pt-none">Where is it, who’s it for, is it in? Try 22972342, “radiator” or 37628.</div>'}</div>`; }
  return '';
}
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
const logIt=(r,t)=>r.log.unshift(['10/22 '+hm(NOW),t]);
function clear(r,why){ U.done.push(r.no); r.doneAt=hm(NOW); r.doneWhy=why; const L=flat(); U.sel=L[0]||r.no; }
function doIt(no,el){ const r=get(no); if(!r) return; U.sel=no; const st=stateOf(r);
  if(st==='sent'){ snap(); r.route.acc=1; logIt(r,'Parts accepted');
    if(r.route.now){ const p=lines(r)[0], c=cat(p.pn); c.oh-=p.qty; p.st='Received'; p.sup='stock'; p.bin='Counter'; p.rcv=NOW; logIt(r,`Pulled from stock · bin ${c.bin} · handed to ${F(r.tech)}`); clear(r,`Injector handed to ${F(r.tech)} at the counter`); toast(`Pulled ${lc(p.desc)} from ${c.bin} — handed to ${F(r.tech)}. ${c.oh} left on the shelf.`); render(); return; }
    toast(`Accepted — ${r.no} is under To order.`); render(); return; }
  if(st==='order') return openPop('order',{ro:no,tell:true},el);
  if(st==='late') return openPop('chase',{ro:no,tell:true},el);
  if(st==='in') return openPop('hand',{ro:no},el);
  if(st==='ret') return openPop('ship',{ro:no},el);
  U.view='desk'; render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop, r=p&&p.ro?get(p.ro):null;
  if(a==='sel'){ if(e.target.closest('.tg-go')) return; U.sel=t.dataset.ro; U.kb=false; U.pop=null; render(); }
  else if(a==='do'){ e.stopPropagation(); U.pop=null; doIt(t.dataset.ro,t); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='hf'){ const k=t.dataset.k; if(k==='due'){ U.view='order'; render(); return; } const G=grouped(); if(G[k]&&G[k].length){ U.view='desk'; U.sel=G[k][0].no; render(); } }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p&&!t.dataset.pid){ U.pop=null; render(); return; } const ex={}; if(t.dataset.pid) ex.pid=t.dataset.pid; if(t.dataset.ro) ex.ro=t.dataset.ro; if(t.dataset.p==='chk') ex.sel={}; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='open'){ if(t.dataset.k==='ro'){ U.view='desk'; U.sel=t.dataset.ro; U.pop=null; const st=stateOf(get(t.dataset.ro)); if(st==='way') U.open.way=true; if(st==='done') U.open.done=true; render(); } else if(t.dataset.k==='cat'){ U.view='cat'; U.cq=t.dataset.pn; U.pop=null; render(); } else { U.open[t.dataset.k]=!U.open[t.dataset.k]; render(); } }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='setst'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); if(!f) return; snap(); const v=t.dataset.v; f.q.st=v; if(v==='Received'&&!f.q.bin){ f.q.bin=binOf(f.r)||nextBin(); f.q.rcv=NOW; } if(v==='Ordered'&&!f.q.po){ f.q.sup='pdc'; f.q.po='55831'; f.q.ord=TODAY; f.q.eta=addD(TODAY,4); } logIt(f.r,`${f.q.desc} → ${stTxt[v]}`); U.pop=null; toast(`${f.q.desc} · ${stTxt[v]}.`); render(); }
  else if(a==='rcv1'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); snap(); f.q.st='Received'; f.q.bin=binOf(f.r)||nextBin(); f.q.rcv=NOW; logIt(f.r,`Checked in · ${f.q.desc} · bin ${f.q.bin}`); toast(`${f.q.desc} checked in · bin ${f.q.bin}${lines(f.r).every(inHand)?' — every part is in.':'.'}`); render(); }
  else if(a==='oset'){ p.o=+t.dataset.o; render(); }
  else if(a==='dset'){ p.d=t.dataset.d; render(); }
  else if(a==='tell'){ p.tell=t.checked; }
  else if(a==='ogo'){ const no=lines(r).filter(x=>x.st==='Not Ordered'), buy=no.filter(x=>cat(x.pn).oh<x.qty); if(buy.length&&p.o==null) return; snap();
    const po=($('#pt-po')||{}).value||'55831', sup=['pdc','vor','fp'][p.o], eta=[addD(TODAY,4),addD(TODAY,1),TODAY][p.o]; let b=binOf(r);
    no.forEach(x=>{ const c=cat(x.pn); if(c.oh>=x.qty){ c.oh-=x.qty; b=b||nextBin(); Object.assign(x,{st:'Received',sup:'stock',bin:b,rcv:NOW}); } else Object.assign(x,{st:'Ordered',sup,po,ord:TODAY,eta}); });
    const stk=no.length-buy.length; if(stk) logIt(r,`${stk} pulled from stock · bin ${b}`); if(buy.length){ logIt(r,`Ordered ${buy.length} · PO ${po} · ${SUP[sup]} · due ${eta===TODAY?'today 16:00':short(eta)}`); if(p.tell!==false){ logIt(r,`ETA sent to <b>${F(r.wr)}</b> for the customer`); r.told='10/22'; } }
    U.pop=null; toast(buy.length?`Ordered ${buy.length}${stk?` · ${stk} pulled from stock`:''} — due ${eta===TODAY?'today 16:00':short(eta)}${p.tell!==false?`. ${F(r.wr)} has the ETA.`:'.'}`:`Pulled ${stk} from stock — bin ${b}. Every part is in.`); render(); }
  else if(a==='cgo'){ const x=lines(r).find(late); if(!x||p.o==null) return; snap();
    if(p.o===0){ x.eta=p.d; x.st='Ordered'; logIt(r,`${SUP[x.sup]}: new date ${short(p.d)}`); }
    else if(p.o===1){ x.st='Backordered'; x.eta=null; x.ord=x.ord||TODAY; logIt(r,`${SUP[x.sup]}: backordered, no date`); }
    else { x.sup='fp'; x.po='55832'; x.ord=TODAY; x.eta=TODAY; x.st='Ordered'; x.price=Math.round(x.price*105)/100; logIt(r,`Re-ordered from FleetPride · PO 55832 · due today 16:00`); }
    if(p.tell!==false){ logIt(r,`<b>${F(r.wr)}</b> told · “Parts delayed” message ready for the customer`); r.told='10/22'; }
    U.pop=null; toast(`${p.o===0?'New date '+short(p.d):p.o===1?'Marked backordered':'Coming from FleetPride today'}${p.tell!==false?` — ${F(r.wr)} has it for the customer.`:'.'}`); render(); }
  else if(a==='hgo'){ snap(); const n=($('#pt-hn')||{}).value||''; logIt(r,`Parts → <b>Frank</b> · “${esc(n)}”`); clear(r,`Sent to Frank · ${n}`); U.pop=null; toast(`Sent to Frank — ${r.no} is under his Sent to you.`); render(); }
  else if(a==='rset'){ p.why=t.dataset.v; render(); }
  else if(a==='rgo'){ snap(); logIt(r,`Sent back to <b>${F(r.route.from)}</b> · ${p.why}`); clear(r,`Back to ${F(r.route.from)} · ${p.why}`); U.pop=null; toast(`Sent back to ${F(r.route.from)} — “${p.why}”.`); render(); }
  else if(a==='cset'){ p.c=t.dataset.v; render(); }
  else if(a==='sgo'){ snap(); r.ret.shipped=`${md(TODAY)} · ${p.c}`; logIt(r,`${r.ret.kind==='warranty'?r.ret.tag+' shipped':'Core sent back'} · ${p.c}${p.tr?' · '+esc(p.tr):''}`); clear(r,r.ret.kind==='warranty'?`${r.ret.tag} shipped · ${p.c}`:`Core sent · ${p.c}`); U.pop=null; toast(r.ret.kind==='warranty'?`${r.ret.tag} shipped — Warranty sees it on the claim.`:`Core sent back — the ${usd0(r.ret.charge)} charge comes off when it lands.`); render(); }
  else if(a==='ckl'){ e.preventDefault(); p.sel[t.dataset.pid]=!p.sel[t.dataset.pid]; p.hit=null; render(); }
  else if(a==='kgo'){ const L=dueLines().filter(x=>p.sel[x.p.id]); if(!L.length) return; snap(); const done=new Set();
    L.forEach(x=>{ const b=binOf(x.r)||nextBin(); Object.assign(x.p,{st:'Received',bin:b,rcv:NOW}); done.add(x.r.no); logIt(x.r,`Checked in · ${x.p.desc} · bin ${b}`); });
    const full=[...done].filter(no=>lines(get(no)).every(inHand));
    U.pop=null; toast(`${L.length} part${L.length>1?'s':''} checked in${full.length?` · ${full.join(' and ')} ${full.length>1?'have':'has'} every part — under Arrived`:''}.`); if(full.length){ U.view='desk'; U.sel=full[0]; } render(); }
  else if(a==='cflt'){ U.cflt=t.dataset.v; render(); }
  else if(a==='kit'){ U.kopen[t.dataset.pn]=U.kopen[t.dataset.pn]===false; render(); }
  else if(a==='reorder'){ const c=cat(t.dataset.pn), q=c.min-c.oh+Math.max(1,Math.ceil(c.min/2)); toast(`${c.desc} · ${q} added to the next stock order — ${c.oh+q} on hand once it lands (min ${c.min}).`,false); render(); }
  else if(a==='undo'){ if(UNDO.length){ const x=JSON.parse(UNDO.pop()); S=x.S; U.done=x.done; TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('input',e=>{ const p=U.pop, id=e.target.id;
  if(id==='pt-cq'){ U.cq=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#pt-cq'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } return; }
  if(!p) return;
  if(id==='pt-hn') p.n=e.target.value; if(id==='pt-po') p.po=e.target.value; if(id==='pt-tr') p.tr=e.target.value;
  if(id==='pt-sq'){ p.q=e.target.value; render(); const f=$('#pt-sq'); if(f){ f.focus(); f.setSelectionRange(f.value.length,f.value.length); } }
  if(id==='pt-scan') p.q=e.target.value; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"]')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.pop=null; render(); }
function scanHit(){ const p=U.pop, q=(p.q||'').replace(/\s/g,''); if(!q) return; const x=dueLines().find(y=>y.p.pn===q||y.p.pn.endsWith(q)&&q.length>=4);
  if(x){ p.sel[x.p.id]=true; p.hit=x.p.id; p.q=''; } else { p.q=''; toast(`${q} isn’t on any open order — check the packing slip.`,false); } render(); const f=$('#pt-scan'); if(f) f.focus(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'&&e.target.id==='pt-scan'){ if((p.q||'').trim()){ scanHit(); return stop(); } }
    if(k==='Enter'&&e.target.id==='pt-sq'){ const b=$('.tg-pop .pt-srr'); if(b) b.click(); return stop(); }
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(inF) return; const n=+k; if(n>=1&&n<=4){ const b=$(`.tg-pop [data-a="oset"][data-o="${n-1}"]:not([disabled])`)||$$('.tg-pop .tg-mi')[n-1]; if(b){ b.click(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){ if(U.view!=='desk'){ U.view='desk'; } move(1); return stop(); } if(k==='k'){ if(U.view!=='desk'){ U.view='desk'; } move(-1); return stop(); }
  if(k==='Enter'&&U.view==='desk'&&U.sel){ const b=$(`.tg-it[data-ro="${U.sel}"] .tg-go`); if(b) doIt(U.sel,b); return stop(); }
  if(k==='c'){ const b=$('[data-a="pop"][data-p="chk"]'); if(b) openPop('chk',{sel:{}},b); return stop(); }
  if(k==='/'){ const b=$('[data-a="pop"][data-p="srch"]'); if(b) openPop('srch',{},b); return stop(); }
  if(k>='1'&&k<='4'){ U.view=['desk','order','shelf','cat'][+k-1]; render(); return stop(); }
});
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; tip.hidden=true; });
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); }
    else { x=W-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #pt-scan')||$('.tg-pop #pt-sq')||$('.tg-pop #pt-hn'); if(f){ U.pop._f=1; f.focus(); if(f.id==='pt-hn') f.select(); } }
}
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  desk:()=>{reset();render();},
  order:()=>{reset();U.sel='37750';get('37750').route.acc=1;render();const b=$('.tg-next [data-a="do"]');doIt('37750',b);U.pop.o=1;render();},
  late:()=>{reset();U.sel='37203';render();const b=$('.tg-next [data-a="do"]');doIt('37203',b);U.pop.o=0;U.pop.d='2026-10-26';render();},
  chk:()=>{reset();U.sel='37628';render();const b=$('[data-a="pop"][data-p="chk"]');const L=dueLines();openPop('chk',{sel:{[L.find(x=>x.r.no==='37628').p.id]:true,[L.find(x=>x.r.no==='37720').p.id]:true}},b);},
  oo:()=>{reset();U.view='order';render();},
  shelf:()=>{reset();U.view='shelf';render();},
  cat:()=>{reset();U.view='cat';render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__pt={S:()=>S,U:()=>U,render,reset,openPop,DEMO,stateOf,get,dueLines};
reset(); render();
"""
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "cart", "clock", "check", "undo", "box", "inbox2", "truck", "shelf", "book"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("desk", "1 · Desk"), ("order", "2 · Order parts"), ("late", "3 · Chase a late part"), ("chk", "4 · Check in a delivery"), ("oo", "5 · On order"), ("shelf", "6 · Shelf"), ("cat", "7 · Catalog")])
about = [
 ("Same panel as Triage, Foreman, Warranty", "Header facts, view tabs, Needs action on the left, the RO on the right, a Next bar with the one thing to do."),
 ("Sent to you", "Hand-offs from the writer (approved — order parts) and the foreman (a tech needs a part now). Accept, pull, or send back with a reason."),
 ("To order · Late · Arrived · Returns", "Order with stock pulled automatically, chase late parts and tell the writer, send finished ROs to Frank, ship warranty returns and cores."),
 ("Check in a delivery", "Scan or tick what came; each part goes to its RO’s bin and a complete RO moves to Arrived."),
 ("On order · Shelf · Catalog", "Every open order line by ETA, the bins staged for the shop plus what goes back, and the parts list with on-hand counts and kits."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Parts mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Parts — first mock-up</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Parts<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
