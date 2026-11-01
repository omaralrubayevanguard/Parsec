# Foreman page mock-up — the Triage patterns carried over (Parsec design system, Ivory + Graphite).
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(os.path.dirname(B), "app")
sys.path.insert(0, B)
import parts as P
OUT = sys.argv[1]
tok = open(f"{B}/ds/tokens.local.css").read()
bun = open(f"{B}/ds/project/components/bundle.css").read().split("\n", 1)[1]
shell = open(f"{B}/_shell.css").read()
tg = open(f"{A}/tg.css").read()
tg = tg.replace(':root:is([data-theme="ivd"],[data-theme="mist"],[data-theme="atd"]) .tg{', ':root[data-theme="dark"] .tg{')

IC = dict(P.ICONS)
IC.update({
 "phone": '<path d="M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z"/>',
 "userPlus": '<circle cx="10" cy="8" r="3.5"/><path d="M3.75 19.5c.6-3.4 3.2-5.25 6.25-5.25s5.65 1.85 6.25 5.25M18.5 7.5v5M16 10h5"/>',
 "pin": '<path d="M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z"/><circle cx="12" cy="10.25" r="2.25"/>',
 "flag": '<path d="M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6"/>',
 "release": '<path d="M4.5 12h11M11.5 7.5L16 12l-4.5 4.5M19.5 5v14"/>',
 "inArrow": '<path d="M19.5 12h-11M12.5 7.5L8 12l4.5 4.5M4.5 5v14"/>',
 "grid": '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
 "decide": '<path d="M12 3.75v4.5M12 15.75v4.5M5.5 12H3.75M20.25 12H18.5"/><circle cx="12" cy="12" r="3.75"/>',
 "road": '<path d="M8 20.5 10 3.5M16 20.5 14 3.5M12 6v2M12 11v2M12 16v2"/>',
 "gauge": '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="M12 16.5l3.5-4.5"/>',
 "bay": '<path d="M3.75 20.25V9L12 4l8.25 5v11.25"/><path d="M7.5 20.25v-7.5h9v7.5M7.5 15.75h9"/>',
})
ICO = {k: v for k, v in IC.items()}
SI = {}
for k in ["hold", "working", "parts", "foreman", "support", "customer", "roadtest", "released", "declined"]:
    SI[k] = P.si(k).replace('class="px-si"', 'class="tg-si"').replace("var(--panel)", "var(--tg-panel)")

CSS = shell + r"""
.tg-panel > .tg{height:100%;min-height:0;box-shadow:none;border-radius:0;}
.tg-rail a.is-on{background:var(--selected);color:var(--ink);}
.rl-badge{right:-2px;}
/* the app's buttons (Ivory) */
.tg .btn{appearance:none;border:0;cursor:pointer;background:var(--tg-raised);color:var(--tg-ink);box-shadow:inset 0 0 0 1px var(--tg-border);border-radius:8px;font:500 13.5px/1 var(--tg-sans);transition:background-color .15s,transform .08s;}
.tg .btn:hover{background:var(--tg-fill);}
.tg .btn:active:not([disabled]){transform:scale(.98);}
.tg .btn-primary{background:var(--tg-primary);color:var(--tg-onprimary);box-shadow:none;}
.tg .btn-primary:hover{background:var(--tg-primary);box-shadow:inset 0 0 0 999px rgba(128,128,128,.14);}
.tg .btn[disabled]{background:var(--tg-fill);color:var(--tg-ink4);box-shadow:none;cursor:default;}
.tg .btn.ib:not(.btn-primary){background:transparent;box-shadow:none;color:var(--tg-ink2);}
.tg .btn.ib:not(.btn-primary):hover{background:var(--tg-fill);color:var(--tg-ink);}
.tg :focus-visible{outline:none;box-shadow:var(--shadow-focus) !important;}
.toast-fm{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;min-height:40px;padding:0 8px 0 16px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-size:13.5px;box-shadow:var(--shadow-raised);z-index:60;animation:tg-up .2s cubic-bezier(.2,.8,.2,1) both;white-space:nowrap;}
.toast-fm button{all:unset;cursor:pointer;font-weight:600;padding:0 10px;height:28px;display:inline-flex;align-items:center;gap:6px;border-radius:999px;}
.toast-fm button:hover{background:rgba(128,128,128,.2);}
.fm .tg-it .tg-t .tg-spot{display:inline-flex;}
.fm .tg-it[draggable="true"]{cursor:grab;}

/* ---------- Floor view ---------- */
.fm-fl{display:flex;flex-direction:column;min-width:0;}
.fm-fl .tg-top{padding-bottom:14px;}
.fm-fl .tg-next{margin:14px 28px 0;}
.fm-who{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.fm-bays{flex:1;min-height:0;overflow:auto;padding:16px 28px 18px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;}
.fm-bh{display:flex;align-items:baseline;gap:10px;font-size:13px;font-weight:600;}
.fm-bh small{font-weight:400;font-size:12px;color:var(--tg-ink3);}
.fm-bh .leg{margin-left:auto;display:flex;gap:14px;font-weight:400;font-size:12px;color:var(--tg-ink3);}
.fm-bh .leg span{display:inline-flex;align-items:center;gap:5px;}
.fm-bh .leg i{width:8px;height:8px;border-radius:50%;display:inline-block;}
.fm-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;}
.fm-bay{position:relative;display:flex;flex-direction:column;gap:5px;min-height:100px;padding:9px 11px 10px;border-radius:12px;background:var(--tg-raised);box-shadow:0 0 0 1px var(--tg-hair),0 2px 6px -3px rgba(0,0,0,.1);cursor:pointer;min-width:0;transition:box-shadow .15s,opacity .15s;user-select:none;}
.fm-bay:hover{box-shadow:0 0 0 1px var(--tg-bs);}
.fm-bay.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc),0 2px 6px -3px rgba(0,0,0,.12);}
.fm-bay .r1{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--tg-ink3);}
.fm-bay .r1 .l{font:500 11px/1 var(--tg-mono);color:var(--tg-ink3);}
.fm-bay .r1 .st{margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-weight:500;white-space:nowrap;}
.fm-bay .r1 .st .tg-si{width:12px;height:12px;}
.fm-bay.on .r1 .st{color:var(--tg-st-working);}
.fm-bay.idle .r1 .st{color:var(--tg-warn);}
.fm-bay.idle{box-shadow:0 0 0 1px color-mix(in srgb,var(--tg-warn) 45%,transparent),0 2px 6px -3px rgba(0,0,0,.1);}
.fm-bay.wait .r1 .st,.fm-bay.done .r1 .st{color:var(--tg-ink2);}
.fm-bay .t{display:flex;align-items:baseline;gap:7px;min-width:0;}
.fm-bay .t .tg-no{font-size:13px;color:var(--tg-ink);}
.fm-bay .t b.cu{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.fm-bay .r3{margin-top:auto;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tg-ink2);min-width:0;}
.fm-bay .r3 .nm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.fm-bay .r3 .hrs{margin-left:auto;font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;}
.fm-bay .r3 .hrs.over{color:var(--tg-bad);font-weight:500;}
.fm-bay .ln{position:absolute;left:11px;right:11px;bottom:5px;height:3px;border-radius:2px;background:var(--tg-hair);overflow:hidden;}
.fm-bay .ln i{display:block;height:100%;background:var(--tg-ink3);border-radius:2px;}
.fm-bay .ln.over i{background:var(--tg-st-problem);}
.fm-bay{padding-bottom:13px !important;}
.fm-qb{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;}
.fm-qb .m{width:46px;height:4px;border-radius:2px;background:var(--tg-hair);overflow:hidden;}
.fm-qb .m i{display:block;height:100%;background:var(--tg-ink2);border-radius:2px;}
.fm-qb.over{color:var(--tg-bad);} .fm-qb.over .m i{background:var(--tg-st-problem);}
.fm-bay.free{background:transparent;box-shadow:inset 0 0 0 1px var(--tg-hair);background-image:repeating-linear-gradient(135deg,transparent 0 6px,color-mix(in srgb,var(--tg-hair) 55%,transparent) 6px 7px);cursor:default;}
.fm-bay.free .open{margin:auto 0 0;font-size:12.5px;color:var(--tg-ink3);}
.fm-bay.drop,.fm-dragging .fm-bay.free{background:var(--tg-acct);background-image:none;box-shadow:inset 0 0 0 1.5px var(--tg-accl);cursor:pointer;}
.fm-dragging .fm-bay.free .open{color:var(--tg-acctx);}
.fm-bay.over{box-shadow:inset 0 0 0 2px var(--tg-acc) !important;}
.fm-dragging .fm-bay:not(.free){opacity:.5;}
.fm-bay.flash{animation:tg-ping 1s ease-out 3;}
.fm-wt{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border-radius:14px;background:var(--tg-canvas);}
.fm-wt > .k{font-size:12px;font-weight:600;color:var(--tg-ink2);margin-right:4px;}
.fm-chip{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 10px;border-radius:9px;background:var(--tg-raised);box-shadow:0 0 0 1px var(--tg-hair);font-size:12.5px;cursor:grab;user-select:none;}
.fm-chip:hover{box-shadow:0 0 0 1px var(--tg-bs);}
.fm-chip.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.fm-chip small{color:var(--tg-ink3);font-size:11.5px;}
.fm-wt .hint{margin-left:auto;font-size:12px;color:var(--tg-ink3);}

/* ---------- Techs view ---------- */
.fm-tv{overflow:auto;padding:16px 24px 20px;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin;min-width:0;}
.fm-tv > *{flex-shrink:0;}
.fm-lane{display:grid;grid-template-columns:210px minmax(0,1fr);gap:12px;align-items:stretch;padding:8px;border-radius:14px;box-shadow:inset 0 0 0 1px var(--tg-hair);transition:box-shadow .15s,background-color .15s;min-height:88px;}
.fm-lane.none{background:var(--tg-canvas);box-shadow:none;}
.fm-lane.over{box-shadow:inset 0 0 0 2px var(--tg-acc);background:var(--tg-acct);}
.fm-lh{display:flex;flex-direction:column;gap:5px;padding:4px 4px 2px 6px;min-width:0;}
.fm-lh .nm{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;white-space:nowrap;}
.fm-lh .nm .tg-av{width:26px;height:26px;font-size:10px;}
.fm-lh .nm .on{width:7px;height:7px;border-radius:50%;background:var(--tg-st-working);box-shadow:0 0 0 3px var(--tg-good-t);margin-left:2px;}
.fm-lh .now{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-cap{display:flex;flex-direction:column;gap:4px;margin-top:auto;}
.fm-cap .m{height:5px;border-radius:3px;background:var(--tg-hair);overflow:hidden;position:relative;}
.fm-cap .m i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--tg-ink2);}
.fm-cap small{font-size:11.5px;line-height:16px;color:var(--tg-ink3);}
.fm-cap.full .m i{background:var(--tg-st-problem);} .fm-cap.full small{color:var(--tg-warn);font-weight:500;}
.fm-cap.light small b{color:var(--tg-good);font-weight:500;}
.fm-cards{display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;min-width:0;}
.fm-card{display:flex;flex-direction:column;gap:4px;width:158px;padding:8px 10px 9px;border-radius:10px;background:var(--tg-raised);box-shadow:0 0 0 1px var(--tg-hair);font-size:12.5px;cursor:grab;user-select:none;min-width:0;transition:box-shadow .15s,opacity .15s;}
.fm-card:hover{box-shadow:0 0 0 1px var(--tg-bs);}
.fm-card.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.fm-card.now{box-shadow:inset 3px 0 0 var(--tg-st-working),0 0 0 1px var(--tg-hair);}
.fm-card.now.sel{box-shadow:inset 3px 0 0 var(--tg-st-working),inset 0 0 0 1.5px var(--tg-acc);}
.fm-card.wait{background:transparent;}
.fm-card .r1{display:flex;align-items:center;gap:6px;}
.fm-card .r1 .tg-spot{margin-left:auto;height:18px;font-size:11px !important;}
.fm-card .cu{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-card .r3{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-card.now .r3{color:var(--tg-st-working);font-weight:500;}
.fm-card .r3.warn{color:var(--tg-warn);font-weight:500;}
.fm-card.src{opacity:.35;}
.fm-none{font-size:12.5px;color:var(--tg-ink4);align-self:center;padding:0 4px;}

/* ---------- popovers ---------- */
.fm-ctx{margin:-2px 0 10px;padding:9px 11px;border-radius:10px;background:var(--tg-canvas);font-size:12.5px;line-height:18px;color:var(--tg-ink2);}
.fm-ctx b{color:var(--tg-ink);font-weight:500;}
.fm-ctx q{font-style:italic;}
.fm-ctx q::before{content:"“";} .fm-ctx q::after{content:"”";}
.fm-opt{display:grid !important;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center;width:100%;padding:7px 10px !important;border-radius:9px;text-align:left;}
.fm-opt .tg-kbd{grid-row:1 / span 2;}
.fm-opt b{font-size:13.5px;font-weight:500;}
.fm-opt small{font-size:12px;color:var(--tg-ink3);}
.fm-opt:hover,.fm-opt.hv{background:var(--tg-fill);}
.fm-opt.on{background:var(--tg-fill);box-shadow:inset 0 0 0 1.5px var(--tg-ink);}
.fm-tk{display:grid !important;grid-template-columns:auto auto 1fr auto;column-gap:9px;align-items:center;width:100%;height:36px;padding:0 10px !important;border-radius:9px;font-size:13.5px;text-align:left;}
.fm-tk:hover,.fm-tk.hv{background:var(--tg-fill);}
.fm-tk.on{background:var(--tg-fill);box-shadow:inset 0 0 0 1.5px var(--tg-ink);}
.fm-tk .meta{font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.fm-tk .sug{display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:5px;background:var(--tg-good-t);color:var(--tg-good);font-size:10.5px;font-weight:600;margin-left:6px;}
.fm-tk .full{color:var(--tg-warn);}
.fm-ops{display:flex;flex-direction:column;border-radius:12px;box-shadow:inset 0 0 0 1px var(--tg-hair);padding:4px 12px;margin-bottom:10px;}
.fm-op{display:flex;align-items:center;gap:10px;min-height:32px;font-size:13px;}
.fm-op + .fm-op{box-shadow:inset 0 1px 0 var(--tg-hair);}
.fm-op .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-op .h{font-size:12.5px;color:var(--tg-ink2);white-space:nowrap;}
.fm-op .h.over{color:var(--tg-bad);font-weight:500;}
.fm-about-ref{font-size:12px;color:var(--ink-3);}
"""

JS = r"""
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, SI=__SI__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const NOW0=10.25, END=16.5;
let NOW=NOW0;
const hm=h=>{const m=Math.round(h*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
const dur=h=>{const m=Math.round(h*60);if(m<60)return m+' min';const H=Math.floor(m/60),M=m%60;return H+'h'+(M?' '+M+'m':'');};
const hh=h=>(Math.round(h*10)/10).toFixed(1)+' h';
const TECH=[['MR','Mike Rodriguez'],['LM','Luis Martinez'],['PS','Priya Shah'],['AW','Andre Wilson'],['KT','Kevin Tran']];
const TN=k=>(TECH.find(t=>t[0]===k)||[k,k])[1], TF=k=>TN(k).split(' ')[0];
const DESK={tech:['TE','Technician','pick who'],writer:['AP','Approval','Dana Kowalski'],parts:['PT','Parts','Ben Okafor'],foreman:['FM','Foreman','Ray Owens'],warranty:['WA','Warranty','Kim Lee'],manager:['MG','Manager','Tom Brandt']};
const WHY={writer:['Estimate ready','Quote over','Customer question'],tech:['Go ahead','Parts arrived','Redo it'],parts:['Parts needed','Wrong part','Core return'],warranty:['Warranty claim','Tech support case','Comeback'],manager:['Sign-off','Pricing call','Customer complaint'],foreman:['Second opinion','Tech + bay','Comeback']};
const BAYS=['AW1','AW2','UP','B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'];
const LOT={D:['D1','D2','D3','D4','D5','D6','D7','D8'],E:['E1','E2','E3','E4','E5','E6','E7','E8']};
const CHK={W:['W1','W2','W3','W4'],T:['T1','T2','T3','T4']};
const ZN=s=>s==='UP'?'UpTime bay':/^AW/.test(s)?'Awning':/^B\d/.test(s)?'Bay '+s.slice(1):/^W/.test(s)?'Arrival line':/^T/.test(s)?'Triage lane '+s.slice(1):s[0]+' line';
const ST={hold:'Hold Tech',working:'Working',parts:'Waiting – Parts',foreman:'Waiting – Foreman',support:'Waiting – Tech Support',customer:'Waiting – Customer',roadtest:'Complete – Road test'};
const R0=[
 {no:'37544',cust:'Greensboro City Waste',unit:'4061',cmp:'Air dryer purging constantly',st:'working',sub:'Diagnosing',spot:'B1',tech:'LM',run:8.67,q:2.0,b:1.6},
 {no:'37602',cust:'Triad Cold Chain',unit:'88',cmp:'Alternator not charging',st:'working',sub:'Repairing',spot:'B2',tech:'MR',run:8.08,q:3.5,b:2.1},
 {no:'37655',cust:'Piedmont Aggregates',unit:'512',cmp:'Brake chambers and slack adjusters',st:'hold',spot:'B3',tech:'AW',idle:9.08,q:4.0,b:1.0},
 {no:'37480',cust:'Yadkin Valley Dairy',unit:'27',cmp:'Low power — turbo actuator or VGT?',st:'foreman',spot:'B4',tech:'KT',q:2.5,b:1.2,sent:{by:'KT',at:9.83,why:'Second opinion',note:'Actuator tests fine on the bench. VGT sticking? Want you to look before I order.'}},
 {no:'37011',cust:'Catawba Timber',unit:'330',cmp:'Comeback — coolant loss after head gasket',st:'foreman',spot:'B5',tech:'PS',q:2.0,b:1.5,since:8.58,note:'Coolant in the oil again. Head gasket was done Oct 2. Pressure test holds 20 min.',comeback:true},
 {no:'36988',cust:'Old Salem Moving',unit:'61',cmp:'Intermittent no-start, U0100',st:'support',sub:'Awaiting reply',spot:'B6',tech:'PS',q:3.0,b:2.0,hold:{to:'warranty',who:'Kim Lee',h:52,goal:24}},
 {no:'37590',cust:'Surry Feed & Seed',unit:'14',cmp:'Clutch slipping — replace clutch',st:'working',sub:'Repairing',spot:'B7',tech:'AW',run:9.08,q:6.0,b:4.2},
 {no:'37700',cust:'Stokes County Schools',unit:'B-19',cmp:'ABS light — wheel speed sensor',st:'working',sub:'Testing',spot:'B8',tech:'KT',run:9.83,q:1.5,b:0.4},
 {no:'37388',cust:'Elkin Hardwoods',unit:'7',cmp:'PM service A and DOT',st:'hold',spot:'B9',tech:'AW',q:2.5,b:2.3,done:9.33},
 {no:'37612',cust:'Alamance Haulers',unit:'903',cmp:'Wheel seal leaking — rear axle',st:'hold',spot:'B10',tech:'MR',q:3.0,b:5.4,ops:[['Wheel seal — rear axle, both sides',2.0,4.6],['Brake adjustment',1.0,0.8]]},
 {no:'37420',cust:'Guilford Paving',unit:'902',cmp:'Hydraulic PTO leak at the pump',st:'parts',sub:'Ordered · due Thu',spot:'UP',tech:'LM',q:3.0,b:0.5,hold:{to:'parts',who:'Parts desk',h:20,goal:24}},
 {no:'37150',cust:'Forsyth Fleet Services',unit:'220',cmp:'PM service B',st:'working',sub:'Inspecting',spot:'AW1',tech:'PS',run:9.5,q:1.5,b:0.6},
 {no:'37628',cust:'Rowan Ready Mix',unit:'5',cmp:'Air leak at the dash',st:'hold',spot:'T3',tech:'',chk:7.83,q:2.0,b:0},
 {no:'37660',cust:'Mount Airy Granite',unit:'41',cmp:'Check engine light, derate',st:'hold',spot:'W1',tech:'',eta:10.67,q:0,b:0},
 {no:'37500',cust:'Randolph Brick',unit:'18',cmp:'Front brakes — pads and rotors',st:'hold',spot:'D3',tech:'PS',q:3.0,b:0,bring:'Approved 8:30 · $1,180 · parts on the shelf'},
 {no:'37455',cust:'Davidson Logistics',unit:'1120',cmp:'EGR cooler replacement',st:'parts',sub:'Received',spot:'D5',tech:'LM',q:4.5,b:0.8,bring:'Parts arrived 9:40 · approved $2,140'},
 {no:'37502',cust:'Lexington Bottling',unit:'66',cmp:'Liftgate inoperative',st:'customer',sub:'Estimate sent',spot:'D5',tech:'',q:1.5,b:0.5},
 {no:'37440',cust:'Wilkes Poultry',unit:'310',cmp:'Steer tires and alignment',st:'customer',sub:'Approval pending',spot:'E1',tech:'MR',q:4.0,b:0.5},
 {no:'37210',cust:'Halifax Freight',unit:'12',cmp:'Coolant leak — water pump',st:'roadtest',spot:'D1',tech:'MR',q:2.5,b:2.6},
 {no:'37320',cust:'Rockingham Lumber',unit:'8',cmp:'DEF system fault',st:'parts',sub:'Backordered',spot:'D2',tech:'KT',q:2.0,b:0.6,hold:{to:'parts',who:'Parts desk',h:30,goal:24}},
 {no:'37290',cust:'Burlington Transit',unit:'B7',cmp:'Door actuator',st:'customer',sub:'Estimate sent',spot:'E2',tech:'AW',q:1.0,b:0.3},
 {no:'37355',cust:'Caswell Grain',unit:'71',cmp:'Fifth wheel rebuild',st:'customer',sub:'Estimate sent',spot:'E3',tech:'',q:3.5,b:0.5}
];
const CL0=[{at:7.67,ic:'userPlus',what:'Assigned to Andre · B9',no:'37388',cust:'Elkin Hardwoods'},{at:8.33,ic:'check',what:'Go ahead — back to Mike',no:'37602',cust:'Triad Cold Chain'},{at:9.17,ic:'bay',what:'Brought in to B7',no:'37590',cust:'Surry Feed & Seed'}];
let S, U, UNDO=[], TOAST=null, TT=null;
function reset(){S={R:JSON.parse(JSON.stringify(R0)),CL:JSON.parse(JSON.stringify(CL0))};U={view:'floor',sel:null,pop:null,kb:false,filt:null,open:{},srch:false,q:'',clash:null,flash:null};NOW=NOW0;UNDO=[];TOAST=null;}
const get=no=>S.R.find(r=>r.no===no);
const snap=()=>{UNDO.push(JSON.stringify(S));if(UNDO.length>30)UNDO.shift();};
function toast(t,undo=true){TOAST={t,undo};clearTimeout(TT);TT=setTimeout(()=>{TOAST=null;render();},5200);}
function clr(r,ic,what){S.CL.push({at:NOW,ic,what,no:r.no,cust:r.cust});}

/* ---------- derived ---------- */
const cat=r=>/^W/.test(r.spot)?'arr':r.st==='customer'?'apr':r.st==='roadtest'?'rdy':r.chk&&!r.tech?'chk':'wrk';
const CAT={arr:['Arriving','var(--tg-ink4)'],chk:['Checked in','var(--tg-st-support)'],apr:['Awaiting approval','var(--tg-st-customer)'],wrk:['In repair','var(--tg-st-working)'],rdy:['Ready to release','var(--tg-ink)']};
const sq=c=>`<i class="tg-sq" style="background:${CAT[c][1]}"></i>`;
const inBay=r=>BAYS.includes(r.spot);
const idleH=r=>r.idle!=null?NOW-r.idle:0;
const left=r=>Math.max(0,r.q-r.b);
const holder=r=>{ if(r.sent&&!r.acc) return {to:'foreman',who:'Ray Owens',h:NOW-r.sent.at,goal:2,pend:true}; if(r.st==='foreman') return {to:'foreman',who:'Ray Owens',h:NOW-(r.since||r.sent&&r.sent.at||NOW),goal:2}; if(r.hold) return {to:r.hold.to,who:r.hold.who,h:r.hold.h,goal:r.hold.goal}; if(!r.tech) return {to:'writer',who:'Dana Kowalski',h:r.chk?NOW-r.chk:0.2,goal:4}; return {to:'tech',who:TN(r.tech),h:r.run?NOW-r.run:idleH(r)||1.5,goal:6}; };
const clashes=()=>{const by={};S.R.forEach(r=>{(by[r.spot]=by[r.spot]||[]).push(r);});return Object.keys(by).filter(k=>by[k].length>1).map(k=>({spot:k,ros:by[k]}));};
function lateOf(r){ if(r.chk&&!r.tech&&NOW-r.chk>2) return true; if(inBay(r)&&r.tech&&!r.run&&r.st==='hold'&&!r.done&&r.idle!=null&&idleH(r)>1) return true; const h=holder(r); if(r.hold&&h.h>=2*h.goal) return true; if(r.eta&&r.eta<NOW) return true; if(r.st==='foreman'&&h.h>h.goal) return true; return false; }
const GROUPS=[['sent','Sent to you'],['you','Waiting on you'],['tech','Needs a tech'],['in','Bring in'],['road','Road test'],['watch','Watch']];
function needsAll(){
  const L=[];
  S.R.forEach(r=>{ let it=null; const h=holder(r);
    if(r.sent&&!r.acc) it={g:'sent',ic:'swap',why:`From ${TF(r.sent.by)} ${dur(NOW-r.sent.at)} ago · ${r.sent.why}`,btn:'Accept',act:'accept'};
    else if(r.st==='foreman') it={g:'you',ic:'decide',why:`${r.comeback?'Comeback':r.sent?r.sent.why:'Waiting'} · ${TF(r.tech)} waiting ${dur(h.h)}`,btn:'Decide',act:'decide'};
    else if(/^W/.test(r.spot)) it={g:'tech',ic:'inArrow',why:r.eta>NOW?`Arriving ~${hm(r.eta)} · in ${dur(r.eta-NOW)} · needs a tech and a bay`:`Due ${hm(r.eta)} · ${dur(NOW-r.eta)} late`,btn:'Plan',act:'assign',pr:1};
    else if(r.chk&&!r.tech) it={g:'tech',ic:'userPlus',why:`Checked in ${dur(NOW-r.chk)} ago · ${r.spot} · no tech yet`,btn:'Assign',act:'assign',pr:0};
    else if(inBay(r)&&r.tech&&!r.run&&r.st==='hold'&&!r.done&&r.idle!=null&&idleH(r)>=0.25) it={g:'tech',ic:'clock',why:`${r.spot} · nobody on for ${dur(idleH(r))} · ${TF(r.tech)}’s`,btn:'Nudge',act:'nudge',pr:0};
    else if(r.bring) it={g:'in',ic:'bay',why:`${r.bring} · ${TF(r.tech)} next`,btn:'Bring in',act:'bring'};
    else if(r.done&&r.st!=='roadtest') it={g:'road',ic:'road',why:`All ops done ${hm(r.done)} · ${r.spot} · no road test yet`,btn:'Road test',act:'road'};
    else if(r.hold&&h.h>=2*h.goal) it={g:'watch',ic:'swap',why:`With ${DESK[h.to][1].toLowerCase()} ${h.h} h · ${(h.h/h.goal).toFixed(1)}× the ${h.goal} h goal`,btn:'Nudge',act:'nudge'};
    else if(r.b>r.q*1.25&&r.q) it={g:'watch',ic:'gauge',why:`${hh(r.b)} on ${hh(r.q)} quoted · ${TF(r.tech)}`,btn:'Review',act:'review'};
    if(!it) return; it.ro=r; it.late=lateOf(r); if(r.snzBack){it.back=true;} L.push(it); });
  clashes().forEach(c=>{ const pick=c.ros[c.ros.length-1], other=c.ros[0]; L.push({g:'watch',ic:'pin',why:`Shares ${c.spot} with ${other.no} — which one is there?`,btn:'Fix spot',act:'clash',ro:pick,spot:c.spot,late:false}); });
  return L;
}
const snoozed=r=>r.snz&&r.snz>NOW;
function match(it){ const f=U.filt; if(!f) return true; if(f==='you') return it.g==='sent'||it.g==='you'; if(f==='late') return it.late; if(f==='tech') return it.g==='tech'; return true; }
const needs=()=>needsAll().filter(x=>!snoozed(x.ro)&&match(x));
function grouped(){const G={};GROUPS.forEach(g=>G[g[0]]=[]);needs().forEach(x=>G[x.g].push(x));GROUPS.forEach(g=>G[g[0]].sort((a,b)=>(b.late?1:0)-(a.late?1:0)||(a.pr||0)-(b.pr||0)));return G;}
const flat=()=>{const G=grouped();return GROUPS.reduce((a,g)=>a.concat(G[g[0]].map(x=>x.ro.no)),[]);};
const itemOf=no=>needs().find(x=>x.ro.no===no);
function sel(){ let r=get(U.sel); if(r) return r; const f=flat(); U.sel=f[0]||S.R[0].no; return get(U.sel); }
const loadOf=k=>S.R.filter(r=>r.tech===k).reduce((a,r)=>a+left(r),0);
const runOf=k=>S.R.find(r=>r.tech===k&&r.run);
const freeBays=()=>BAYS.filter(b=>!S.R.some(r=>r.spot===b));
const freeLot=()=>LOT.D.concat(LOT.E).filter(b=>!S.R.some(r=>r.spot===b));

/* ---------- small pieces ---------- */
const spotChip=r=>`<span class="tg-spot">${ic('pin',11)}${esc(r.spot)}</span>`;
const si=r=>SI[r.st==='roadtest'?'roadtest':r.st]||SI.hold;
const stTxt=r=>ST[r.st]+(r.sub?' · '+r.sub:'');
function held(r){const h=holder(r),o=h.h>h.goal;return `<span class="tg-held${o?' over':''}"><span class="tg-role">${DESK[h.to][0]}</span><span class="m"><i style="width:${Math.min(100,h.h/h.goal*100).toFixed(0)}%"></i></span>${dur(h.h).replace(' ','')} / ${h.goal}h</span>`;}
function qbar(r){ if(!r.q) return ''; const o=r.b>r.q; return `<span class="fm-qb${o?' over':''}" title="${hh(r.b)} on ${hh(r.q)} quoted"><span class="m"><i style="width:${Math.min(100,r.b/r.q*100).toFixed(0)}%"></i></span>${r.b.toFixed(1)}/${r.q.toFixed(1)} h</span>`; }

/* ---------- render ---------- */
function render(){
  const r=sel(), v=U.view;
  const body=v==='techs'?vTechs(r):v==='yard'?vYard(r):vFloor(r);
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='foreman'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg fm">${head()}<div class="tg-body v-${v}">${list()}<div class="tg-main">${body}</div>${pop()}</div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const all=needsAll(), late=all.filter(x=>x.late).length, you=all.filter(x=>x.g==='sent'||x.g==='you').length, tech=all.filter(x=>x.g==='tech').length;
  const used=BAYS.length-freeBays().length, on=TECH.filter(t=>runOf(t[0])).length;
  const f=(k,n,t,w)=>{const o=U.filt===k;return `<button class="tg-hf${w?' w':''}${o?' on':''}" data-a="filt" data-k="${k}"><b>${n}</b>${t}${o?ic('x',12):''}</button>`;};
  const vs=[['floor','grid','Floor'],['techs','user','Techs'],['yard','pin','Yard']];
  const sr=U.srch?`<span class="tg-srch open"><span class="tg-srch-i">${ic('search',15)}</span><input id="fm-q" placeholder="RO, unit, customer or spot" value="${esc(U.q)}" autocomplete="off">${kbd('Esc')}</span>`:`<button class="btn ib tg-srch-b" data-a="srch" title="Search ( / )">${ic('search',16)}</button>`;
  return `<header class="tg-head"><h1 class="tg-h1">Foreman</h1><span class="tg-facts"><button class="tg-hf" data-a="filt" data-k=""><b>${S.R.length}</b>on the yard</button><i>·</i><span class="tg-hf" style="cursor:default"><b>${used}/${BAYS.length}</b>bays</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${on}</b>on the clock</span><i>·</i>${f('you',you,'waiting on you')}<i>·</i>${f('tech',tech,'need a tech')}<i>·</i>${f('late',late,'late',true)}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>${sr}<button class="btn btn-primary tg-newro">${ic('plus',15)}<span>New RO</span></button>${U.srch?`<div class="tg-srpop">${search()}</div>`:''}</header>`;
}
function search(){
  const q=U.q.trim().toLowerCase(); const L=q?S.R.filter(r=>r.no.includes(q)||r.unit.toLowerCase()===q||r.spot.toLowerCase()===q||r.cust.toLowerCase().split(' ').some(w=>w.startsWith(q))).slice(0,6):flat().slice(0,4).map(get);
  return `<div class="h">${q?L.length+' on the yard':'Recent'}</div>`+(L.length?L.map((r,i)=>`<div class="tg-sr${i===0?' k':''}" data-a="sel" data-ro="${r.no}">${sq(cat(r))}<b class="tg-no">${r.no}</b><b class="cu">${esc(r.cust)}</b><small>Unit ${esc(r.unit)} · ${r.tech?TN(r.tech):'no tech'}</small><span class="wh"><span class="w1">${ic('pin',13)}${esc(ZN(r.spot))} <b class="tg-no">${r.spot}</b></span><span class="w2">${esc(stTxt(r))}</span></span></div>`).join(''):`<div class="nores">Nothing matches “${esc(U.q)}”.</div>`)+`<div class="tg-pft"><span>${kbd('↑')}${kbd('↓')} move</span><span>${kbd('↵')} open</span><span>${kbd('Esc')} close</span></div>`;
}
function list(){
  const G=grouped(), L=flat(), s=U.sel, kb=U.kb, sn=S.R.filter(snoozed);
  const item=x=>{const r=x.ro,on=r.no===s;return `<div class="tg-it${on?' on':''}${on&&kb?' kb':''}" data-a="sel" data-ro="${r.no}" draggable="true" data-drag="${r.no}">${x.late?'<i class="tg-dot"></i>':''}<span class="tg-gi">${ic(x.ic,15)}</span><span class="tg-t"><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b>${x.back?`<span class="tg-back">${ic('clock',11)}Back</span>`:''}${spotChip(r)}</span><span class="tg-w${x.late?' late':''}">${esc(x.why)}</span><button class="btn btn-sm ib tg-snz" data-a="pop" data-p="snooze" data-ro="${r.no}" title="Snooze (S)">${ic('clock',15)}</button><button class="btn btn-sm${x.act==='bring'||x.act==='decide'?' btn-primary':''} tg-go" data-a="do" data-ro="${r.no}">${esc(x.btn)}${on&&kb?kbd('↵'):''}</button></div>`;};
  let body;
  if(!L.length) body=U.filt?`<div class="tg-empty"><span class="tg-ring0">${ic('check',22)}</span><h3>Nothing here</h3><p>No RO in Needs action matches.</p><button class="btn btn-sm" data-a="filt" data-k="">Clear filter</button></div>`:`<div class="tg-empty"><span class="tg-ring0 ok">${ic('check',22)}</span><h3>All caught up</h3><p>Nothing needs the foreman right now.</p></div>`;
  else body=GROUPS.filter(g=>G[g[0]].length).map(g=>`<div class="tg-grp">${g[1]}<span>${G[g[0]].length}</span></div>`+G[g[0]].map(item).join('')).join('');
  if(sn.length) body+=`<div class="tg-sec${U.open.snz?' open':''}" data-a="open" data-k="snz">${ic('chevR',12)}<span>Snoozed</span><span class="n">${sn.length}</span><span class="m">next back ${hm(Math.min(...sn.map(r=>r.snz)))}</span></div>`+(U.open.snz?`<div class="tg-rows">${sn.map(r=>`<div class="tg-row" data-a="sel" data-ro="${r.no}"><time>${hm(r.snz)}</time><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b><small>${ic('clock',12)}${esc(r.snzWhy||'Snoozed')}</small><button class="btn btn-sm tg-gh" data-a="wake" data-ro="${r.no}">Wake</button></div>`).join('')}</div>`:'');
  body+=`<div class="tg-sec${U.open.clr?' open':''}" data-a="open" data-k="clr">${ic('chevR',12)}<span>Cleared today</span><span class="n">${S.CL.length}</span></div>`+(U.open.clr?`<div class="tg-rows">${S.CL.slice().reverse().map(c=>`<div class="tg-row done"><time>${hm(c.at)}</time><b class="tg-no">${c.no}</b><b class="tg-cu">${esc(c.cust)}</b><small>${ic(c.ic,12)}${esc(c.what)}</small></div>`).join('')}</div>`:'');
  const x=itemOf(s);
  const keys=`<div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span>${x?`<span>${kbd('↵')}<b>${esc(x.btn)}</b></span>`:''}<span>${kbd('A')}assign</span><span>${kbd('S')}snooze</span><span>${kbd('T')}transfer</span></div>`;
  return `<section class="tg-list"><div class="tg-lh">Needs action<span class="n">${L.length}</span>${U.filt?`<button class="tg-fchip${U.filt==='late'?' w':''}" data-a="filt" data-k="">${({you:'Waiting on you',tech:'Need a tech',late:'Late'})[U.filt]}${ic('x',11)}</button>`:''}<button class="tg-done" data-a="open" data-k="clr" data-force="1">${ic('check',13)}${S.CL.length} cleared today</button></div><div class="tg-scroll">${body}</div>${keys}</section>`;
}
/* the selected RO, on top of Floor */
function topOf(r){
  const c=cat(r), x=itemOf(r.no), h=holder(r);
  const next=x?x.why:r.run?`${TF(r.tech)} is on it — ${dur(NOW-r.run)} so far, ${hh(left(r))} quoted left.`:'Nothing waiting on the foreman.';
  const ctx=r.st==='foreman'?(r.sent&&!r.comeback?r.sent.note:r.note):'';
  return `<div class="tg-top"><div class="r1"><b class="tg-no">RO-${r.no}</b>${sq(c)}<span>${CAT[c][0]}</span>·<span>${esc(r.cmp)}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="xfer" data-ro="${r.no}">${ic('swap',14)}Transfer…</button><button class="btn btn-sm">Open RO</button></div>
   <h2>${esc(r.cust)}</h2><div class="r2">${spotChip(r)}<span class="st">${si(r)}<span>${esc(stTxt(r))}</span></span><span class="fm-who">${r.tech?`<span class="tg-av">${r.tech}</span>${esc(TN(r.tech))}`:'<span class="tg-av">—</span>No tech'}</span>${held(r)}${qbar(r)}</div></div>
   <div class="tg-next"><span class="k">Next</span><p>${esc(ctx?ctx:next)}</p>${x?`<button class="btn btn-sm${x.act==='decide'||x.act==='bring'?' btn-primary':''}" data-a="do" data-ro="${r.no}">${esc(x.btn)}${kbd('↵')}</button>`:''}<button class="btn btn-sm" data-a="pop" data-p="assign" data-ro="${r.no}">${ic('userPlus',14)}Assign…</button></div>`;
}
function bayTile(b,s){
  const r=S.R.find(x=>x.spot===b);
  if(!r) return `<div class="fm-bay free" data-drop="${b}"><div class="r1"><span class="l">${b}</span></div><span class="open">Open</span></div>`;
  let c='', st='';
  if(r.run){c='on';st=`<span class="live tg-live" style="background:var(--tg-st-working)"></span>${dur(NOW-r.run)}`;}
  else if(r.st==='hold'&&r.tech&&!r.done&&r.idle!=null&&idleH(r)>=0.25){c='idle';st=`Nobody on · ${dur(idleH(r))}`;}
  else if(r.st==='hold'&&r.tech&&!r.done){c='wait';st=`Up next`;}
  else if(r.done){c='done';st=`${ic('road',12)}Road test next`;}
  else {c='wait';st=`${si(r)}${esc(ST[r.st].replace('Waiting – ','').replace('Tech Support','tech support').toLowerCase())}`;}
  return `<div class="fm-bay ${c}${s&&s.no===r.no?' sel':''}${U.flash===b?' flash':''}" data-a="sel" data-ro="${r.no}" data-drop="${b}" draggable="true" data-drag="${r.no}" title="${esc(r.cust+' · '+stTxt(r))}"><div class="r1"><span class="l">${b}</span><span class="st">${st}</span></div><div class="t"><b class="tg-no">${r.no}</b><b class="cu">${esc(r.cust)}</b></div><div class="r3">${r.tech?`<span class="tg-av">${r.tech}</span><span class="nm">${esc(TF(r.tech))}</span>`:'<span class="nm">No tech</span>'}${r.q?`<span class="hrs${r.b>r.q?' over':''}">${r.b.toFixed(1)} / ${r.q.toFixed(1)} h</span>`:''}</div>${r.q?`<span class="ln${r.b>r.q?' over':''}"><i style="width:${Math.min(100,r.b/r.q*100).toFixed(0)}%"></i></span>`:''}</div>`;
}
function vFloor(r){
  const used=BAYS.length-freeBays().length, on=BAYS.filter(b=>{const x=S.R.find(y=>y.spot===b);return x&&x.run;}).length, idle=BAYS.filter(b=>{const x=S.R.find(y=>y.spot===b);return x&&x.st==='hold'&&x.tech&&!x.run&&!x.done;}).length;
  const wt=S.R.filter(x=>x.bring||/^W/.test(x.spot)||(x.chk&&!x.tech));
  return `<div class="fm-fl">${topOf(r)}<div class="fm-bays"><div class="fm-bh">Bays<small>${used} of ${BAYS.length} in use · ${on} on the clock · ${idle} nobody on</small><span class="leg"><span><i style="background:var(--tg-st-working)"></i>Tech on</span><span><i style="background:var(--tg-warn)"></i>Nobody on</span><span><i style="background:var(--tg-ink4)"></i>Waiting</span></span></div>
   <div class="fm-grid">${BAYS.map(b=>bayTile(b,r)).join('')}</div>
   <div class="fm-wt"><span class="k">Waiting for a bay</span>${wt.map(x=>`<span class="fm-chip${x.no===r.no?' sel':''}" data-a="sel" data-ro="${x.no}" draggable="true" data-drag="${x.no}">${sq(cat(x))}<b class="tg-no">${x.no}</b>${esc(x.cust.split(' ')[0])}<small>${x.tech?TF(x.tech):'no tech'} · ${x.spot}</small></span>`).join('')}<span class="hint">Drag onto an open bay</span></div></div></div>`;
}
function card(r,s){
  const c=r.run?'now':/^(parts|support|customer|foreman)$/.test(r.st)?'wait':'next';
  const idle=!r.run&&r.st==='hold'&&inBay(r)&&!r.done&&r.tech&&r.idle!=null&&idleH(r)>=0.25;
  const sub=r.run?`${ic('clock',11)}on the clock · ${dur(NOW-r.run)}`:/^W/.test(r.spot)?`arriving ~${hm(r.eta)}`:r.chk&&!r.tech?`checked in ${dur(NOW-r.chk)} ago`:r.st==='roadtest'?'road test done · release':c==='wait'?esc(ST[r.st].replace('Waiting – ','waiting · ').toLowerCase()):idle?`nobody on · ${dur(idleH(r))}`:r.done?'road test next':r.q&&r.b>r.q*1.25?`over the quote · ${r.b.toFixed(1)} / ${r.q.toFixed(1)} h`:`up next · ${hh(left(r))}`;
  const warn=idle||(r.chk&&!r.tech&&NOW-r.chk>2)||(r.q&&r.b>r.q*1.25&&!r.run);
  return `<div class="fm-card ${c}${s&&s.no===r.no?' sel':''}" data-a="sel" data-ro="${r.no}" draggable="true" data-drag="${r.no}"><div class="r1">${si(r)}<b class="tg-no">${r.no}</b>${spotChip(r)}</div><div class="cu">${esc(r.cust)}</div><div class="r3${warn?' warn':''}">${sub}</div></div>`;
}
function vTechs(s){
  const ord=r=>r.run?0:/^(parts|support|customer|foreman)$/.test(r.st)?2:1;
  const lane=(k)=>{ const mine=S.R.filter(r=>r.tech===k).sort((a,b)=>ord(a)-ord(b)), run=runOf(k), ld=loadOf(k), day=END-NOW, full=ld>day, light=ld<day*0.5;
    return `<div class="fm-lane" data-tech="${k}"><div class="fm-lh"><span class="nm"><span class="tg-av">${k}</span>${esc(TN(k))}${run?'<i class="on"></i>':''}</span><span class="now">${run?`On ${run.spot} · ${run.no} · ${dur(NOW-run.run)}`:'Off the clock'}</span><span class="fm-cap${full?' full':light?' light':''}"><span class="m"><i style="width:${Math.min(100,ld/day*100).toFixed(0)}%"></i></span><small>${hh(ld)} of work · ${hh(day)} left today${full?' · '+hh(ld-day)+' over':light?' · <b>room for more</b>':''}</small></span></div><div class="fm-cards">${mine.map(r=>card(r,s)).join('')||'<span class="fm-none">Nothing assigned</span>'}</div></div>`; };
  const none=S.R.filter(r=>!r.tech&&(r.chk||/^W/.test(r.spot)));
  return `<div class="fm-tv"><div class="fm-lane none" data-tech=""><div class="fm-lh"><span class="nm">No tech yet</span><span class="now">Checked in and arriving</span></div><div class="fm-cards">${none.map(r=>card(r,s)).join('')||'<span class="fm-none">Everyone has a tech</span>'}</div></div>${TECH.map(t=>lane(t[0])).join('')}<div class="tg-leg"><span><i class="tg-dash"></i>Drag a card to another tech to reassign — they get it on their Console</span><span class="hint">${kbd('A')} assign</span></div></div>`;
}
function vYard(s){
  const cl=clashes(), c=U.clash&&cl.find(x=>x.spot===U.clash);
  const tile=id=>{ const L=S.R.filter(r=>r.spot===id), lb=`<span class="l">${id}</span>`;
    if(L.length>1) return `<button class="tg-s occ clash${L.some(r=>r.no===s.no)?' tg-on':''}" data-a="clash" data-spot="${id}">${lb}<b>${L.map(r=>r.no.slice(-4)).join('<em>·</em>')}</b><small>${L.length} trucks</small><span class="fl"><i class="cl">!</i></span></button>`;
    const r=L[0]; if(!r) return `<div class="tg-s" data-drop="${id}">${lb}</div>`;
    const a=cat(r);
    if(a==='arr') return `<div class="tg-s rsv${r.no===s.no?' tg-on':''} soon" data-a="sel" data-ro="${r.no}">${lb}<b>${sq('arr')}${r.no.slice(-4)}</b><small>in ${Math.round((r.eta-NOW)*60)}m</small></div>`;
    return `<div class="tg-s occ${r.no===s.no?' tg-on':''}" data-a="sel" data-ro="${r.no}" draggable="true" data-drag="${r.no}" data-drop="${id}">${lb}<b>${sq(a)}${r.no.slice(-4)}${r.run?'<i class="tg-live"></i>':''}</b><small>${esc(r.cust)}</small><span class="fl">${lateOf(r)?'<i class="lt"></i>':''}</span></div>`; };
  const grid=(L,n)=>`<div class="tg-g" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${L.map(tile).join('')}</div>`;
  const bar=c?`<div class="tg-ybar cl"><span class="k">${ic('flag',13)}Spot clash</span><span class="txt">Two ROs claim <b>D line ${c.spot}</b> — ${c.ros.map(r=>`<b>${r.no}</b> ${esc(r.cust)}`).join(' and ')}. Which one is really there?</span><span class="btns">${c.ros.map(r=>`<button class="btn btn-sm" data-a="keep" data-ro="${r.no}">${r.no} is here</button>`).join('')}<button class="btn btn-sm tg-gh" data-a="clashx">Later</button></span></div>`
    :`<div class="tg-ybar">${sq(cat(s))}<b class="tg-no">RO-${s.no}</b><h3>${esc(s.cust)}</h3><span class="at">${ic('pin',14)}${esc(ZN(s.spot))}<b class="tg-no">${s.spot}</b></span><span class="sp"></span>${cl.length?`<button class="btn btn-sm tg-warnb" data-a="clash" data-spot="${cl[0].spot}">${ic('flag',13)}${cl.length} spot clash</button>`:''}<button class="btn btn-sm">${ic('pin',13)}Move…${kbd('M')}</button></div>`;
  return `<div class="tg-yd">${bar}<section class="tg-z"><div class="tg-zh">Shop floor<small>awning · UpTime · bays 1–12</small><span>${BAYS.length-freeBays().length}/${BAYS.length}</span></div>${grid(BAYS,8)}</section>
   <div class="tg-row2"><section class="tg-z" style="flex:1"><div class="tg-zh">Check-in<small>arrival line · triage lanes</small></div>${grid(CHK.W,4)}<div style="height:6px"></div>${grid(CHK.T,4)}</section></div>
   <section class="tg-z"><div class="tg-zh">Parking lot<span>${LOT.D.concat(LOT.E).filter(x=>S.R.some(r=>r.spot===x)).length}/16</span></div>${['D','E'].map(k=>`<div class="tg-lrow"><div class="tg-lrh"><b>${k}</b><small>${k==='D'?'Check in & diag':'Overflow'}</small></div>${grid(LOT[k],8)}</div>`).join('')}</section>
   <div class="tg-leg">${['arr','chk','apr','wrk','rdy'].map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span><i class="cl"></i>Spot clash</span><span><i class="tg-live"></i>On the clock</span><span class="hint">Same yard as Triage — drag a truck onto a free spot</span></div></div>`;
}

/* ---------- popovers ---------- */
function pop(){
  const p=U.pop; if(!p) return ''; const r=get(p.ro); if(!r) return '';
  const hd=k=>`<div class="tg-ph"><b>${k}</b><span class="tg-no">RO-${r.no}</span><span class="cu">${esc(r.cust)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const top=p.top!=null?` style="top:${p.top}px"`:'';
  if(p.type==='snooze'){ const O=[['In 1 hour',NOW+1],['In 2 hours',NOW+2],['After lunch',13],['End of day',16.5],['Tomorrow morning',null]];
    return `<div class="tg-pop menu"${top}>${hd('Snooze until')}${O.map((o,i)=>`<button class="tg-mi${(p.i||0)===i?' hv':''}" data-a="snzpick" data-i="${i}">${kbd(i+1)}${o[0]}<span class="meta">${o[1]?hm(o[1]):'Fri 08:00'}</span></button>`).join('')}<div class="tg-pft">Comes back at the top of its group.</div></div>`; }
  if(p.type==='decide'){ const tf=TF(r.tech), O=decideOpts(r);
    const chosen=O[p.o]; const back=chosen&&chosen.xfer;
    return `<div class="tg-pop xf"${top}>${hd(r.comeback?'Decide · comeback':'Decide')}<div class="fm-ctx"><b>${esc(TN(r.sent?r.sent.by:r.tech))}</b> · ${dur(holder(r).h)} ago<br><q>${esc(r.sent&&!r.comeback?r.sent.note:r.note)}</q></div>
      ${O.map((o,i)=>`<button class="fm-opt${p.o===i?' on':''}" data-a="dpick" data-i="${i}">${kbd(i+1)}<b>${esc(o.t)}</b><small>${esc(o.d)}</small></button>`).join('')}
      ${chosen?`<input class="tg-wide" placeholder="Note for ${esc(chosen.to||tf)} (optional)" style="margin-top:10px">${back?`<span class="tg-lbl top" style="margin-top:10px">Back by</span><div class="tg-r tg-when">${[['Goal · 2 h',NOW+2],['End of day',16.5],['Tomorrow',null],['No time','x']].map((b,i)=>`<button class="tg-chip${(p.b||0)===i?' on':''}" data-a="dback" data-i="${i}">${b[1]==='x'?b[0]:b[1]?hm(b[1])+' <small>'+b[0]+'</small>':'Fri 08:00 <small>'+b[0]+'</small>'}</button>`).join('')}</div>`:''}`:''}
      <div class="tg-acts"><span class="hint">1–${O.length} choose · every choice is logged on the RO</span><button class="btn btn-sm btn-primary" data-a="dgo"${chosen?'':' disabled'}>${chosen?esc(chosen.go):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='assign'){ const T=TECH.map(t=>({k:t[0],ld:loadOf(t[0]),run:runOf(t[0]),n:S.R.filter(x=>x.tech===t[0]).length})).sort((a,b)=>a.ld-b.ld), day=END-NOW, F=freeBays();
    if(p.t==null) p.t=r.tech&&r.tech!==''?r.tech:T[0].k; if(p.bay==null) p.bay=inBay(r)?r.spot:F[0]||'';
    const arr=/^W/.test(r.spot);
    return `<div class="tg-pop xf"${top}>${hd(arr?'Plan the arrival':'Assign')}<span class="tg-lbl top">Tech<small style="margin-left:6px;color:var(--tg-ink4)">quoted hours left · on now</small></span>
      ${T.map((t,i)=>`<button class="fm-tk${p.t===t.k?' on':''}" data-a="apick" data-k="${t.k}">${kbd(i+1)}<span class="tg-av">${t.k}</span><span>${esc(TN(t.k))}${i===0?'<span class="sug">Lightest</span>':''}</span><span class="meta${t.ld>day?' full':''}">${t.n} ROs · ${hh(t.ld)}${t.run?' · on '+t.run.spot:' · free'}</span></button>`).join('')}
      <span class="tg-lbl top" style="margin-top:10px">Bay</span><div class="tg-r">${F.map(b=>`<button class="tg-chip${p.bay===b?' on':''}" data-a="abay" data-b="${b}">${ic('bay',12)}${b}</button>`).join('')}<button class="tg-chip${p.bay===''?' on':''}" data-a="abay" data-b="">${inBay(r)?'Keep '+r.spot:arr?'Decide when it lands':'Leave on '+r.spot}</button></div>
      <div class="tg-goal">${ic('clock',12)}${esc(TF(p.t))} has ${hh(loadOf(p.t))} of work · ${hh(day)} left today${loadOf(p.t)+r.q>day?' — this puts them over':''}</div>
      <div class="tg-acts"><span class="hint">1–5 tech · they accept it on their Console</span><button class="btn btn-sm btn-primary" data-a="ago">${ic('userPlus',13)}${arr?'Reserve':'Assign'} ${esc(TF(p.t))}${p.bay?' · '+p.bay:''}${kbd('↵')}</button></div></div>`; }
  if(p.type==='bring'){ const F=freeBays(); if(p.bay==null) p.bay=F[0]; if(p.t==null) p.t=r.tech;
    return `<div class="tg-pop xf"${top}>${hd('Bring in')}<div class="fm-ctx">${esc(r.bring)}<br>Now on <b>${esc(ZN(r.spot))} ${r.spot}</b> · ${hh(r.q)} quoted</div>
      <span class="tg-lbl top">To bay</span><div class="tg-r">${F.map(b=>`<button class="tg-chip${p.bay===b?' on':''}" data-a="abay" data-b="${b}">${ic('bay',12)}${b}</button>`).join('')||'<span class="tg-none">No open bay — free one on the Floor</span>'}</div>
      <span class="tg-lbl top" style="margin-top:10px">Tech</span><div class="tg-r">${TECH.map(t=>`<button class="tg-chip${p.t===t[0]?' on':''}" data-a="apick" data-k="${t[0]}"><span class="tg-av" style="width:18px;height:18px;font-size:8.5px">${t[0]}</span>${esc(t[1].split(' ')[0])}<small>${hh(loadOf(t[0]))}</small></button>`).join('')}</div>
      <div class="tg-rline"><span>${ic('pin',13)}${r.spot} frees up</span><span>${ic('swap',13)}${esc(TF(p.t))} gets it on their Console</span></div>
      <div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel${kbd('Esc')}</button><button class="btn btn-sm btn-primary" data-a="bgo"${p.bay?'':' disabled'}>${ic('bay',13)}Bring to ${p.bay||'…'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='road'){ if(p.t==null) p.t=r.tech; if(p.w==null) p.w=0; const W=[['Now',NOW],['11:00',11],['After lunch',13]];
    return `<div class="tg-pop xf"${top}>${hd('Road test')}<div class="fm-ctx">All ops marked done at <b>${hm(r.done)}</b> by ${esc(TF(r.tech))} · ${r.b.toFixed(1)} of ${r.q.toFixed(1)} h used</div>
      <span class="tg-lbl top">Who drives</span><div class="tg-r">${TECH.map(t=>`<button class="tg-chip${p.t===t[0]?' on':''}" data-a="apick" data-k="${t[0]}">${esc(t[1].split(' ')[0])}</button>`).join('')}<button class="tg-chip${p.t==='me'?' on':''}" data-a="apick" data-k="me">Me</button></div>
      <span class="tg-lbl top" style="margin-top:10px">When</span><div class="tg-r tg-when">${W.map((w,i)=>`<button class="tg-chip${p.w===i?' on':''}" data-a="rwhen" data-i="${i}">${w[0]}</button>`).join('')}</div>
      <div class="tg-goal">${ic('road',12)}Logged on the RO · then it shows on Triage under Ready to go</div>
      <div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel${kbd('Esc')}</button><button class="btn btn-sm btn-primary" data-a="rgo">${ic('road',13)}Send ${p.t==='me'?'me':esc(TF(p.t))}${kbd('↵')}</button></div></div>`; }
  if(p.type==='review'){ const O=[['Ask Dana for more time','To Approval · reason “Quote over” · she calls the customer'],['Keep going','Check again at 14:00 · snoozed'],[`Talk to ${TF(r.tech)}`,'Nudges them · logged on the RO']];
    return `<div class="tg-pop xf"${top}>${hd('Over the quote')}<div class="fm-ops">${(r.ops||[]).map(o=>`<div class="fm-op"><span class="t">${esc(o[0])}</span><span class="h${o[2]>o[1]?' over':''}">${o[2].toFixed(1)} / ${o[1].toFixed(1)} h</span></div>`).join('')}<div class="fm-op"><b class="t">On the RO</b><span class="h over">${hh(r.b)} on ${hh(r.q)} · +${Math.round((r.b/r.q-1)*100)}%</span></div></div>
      ${O.map((o,i)=>`<button class="fm-opt${p.o===i?' on':''}" data-a="dpick" data-i="${i}">${kbd(i+1)}<b>${esc(o[0])}</b><small>${esc(o[1])}</small></button>`).join('')}
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="vgo"${p.o!=null?'':' disabled'}>${p.o!=null?esc(O[p.o][0]):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='xfer'){ const D=Object.keys(DESK);
    return `<div class="tg-pop xf"${top}>${hd('Transfer')}<span class="tg-lbl top">To</span><div class="tg-desks">${D.map((k,i)=>`<button class="tg-dsk${p.to===k?' on':''}${k==='foreman'?' cur':''}" data-a="xto" data-k="${k}"${k==='foreman'?' disabled':''}><span class="tg-role">${DESK[k][0]}</span><b>${DESK[k][1]}</b><small>${k==='foreman'?'you':k==='tech'?(r.tech?TN(r.tech):'pick who'):DESK[k][2]}</small>${p.to?'':kbd(i+1)}</button>`).join('')}</div>
      ${p.to?`<span class="tg-lbl top">Why</span><div class="tg-r">${WHY[p.to].map((w,i)=>`<button class="tg-chip${p.why===w?' on':''}" data-a="xwhy" data-w="${esc(w)}">${kbd(i+1)}${esc(w)}</button>`).join('')}</div><input class="tg-wide" placeholder="Note (optional)">`:''}
      <div class="tg-acts"><span class="hint">Same transfer as Triage · reason and back-by</span><button class="btn btn-sm btn-primary" data-a="xgo"${p.to&&p.why?'':' disabled'}>${ic('swap',13)}Transfer${p.to?' to '+DESK[p.to][1]:''}${kbd('↵')}</button></div></div>`; }
  return '';
}
function decideOpts(r){ const tf=TF(r.tech);
  if(r.comeback) return [{t:`Go ahead — back to ${tf}`,d:'Working · she redoes it under comeback',go:`Send back to ${tf}`,to:tf,xfer:true,act:'go'},{t:'I’ll look at it',d:'Stays with you · back in the list in 1 h',go:'Snooze 1 h',act:'look'},{t:'Warranty claim',d:'To Kim Lee · comeback on the Oct 2 job',go:'Send to Warranty',to:'Kim',xfer:true,act:'warr'},{t:'Needs approval',d:'To Dana · new estimate for the customer',go:'Send to Dana',to:'Dana',xfer:true,act:'appr'},{t:'Order parts',d:'To Ben · head gasket kit',go:'Send to Parts',to:'Ben',xfer:true,act:'parts'}];
  return [{t:`Go ahead — back to ${tf}`,d:'Order the actuator · Working',go:`Send back to ${tf}`,to:tf,xfer:true,act:'go'},{t:'I’ll look at it',d:'Stays with you · back in the list in 1 h',go:'Snooze 1 h',act:'look'},{t:'Tech support case',d:'To Kim Lee · Volvo tech support',go:'Send to Warranty',to:'Kim',xfer:true,act:'warr'},{t:'Needs approval',d:'To Dana · diag time over the estimate',go:'Send to Dana',to:'Dana',xfer:true,act:'appr'},{t:'Order parts',d:'To Ben · VGT actuator',go:'Send to Parts',to:'Ben',xfer:true,act:'parts'}];
}

/* ---------- doing things ---------- */
function afterAct(no,before){ const L=flat(); if(L.indexOf(U.sel)<0){ const i=before.indexOf(no); U.sel=L.length?L[Math.min(Math.max(i,0),L.length-1)]:U.sel; } }
function act(no){ const x=itemOf(no); if(!x) return; U.sel=no;
  if(x.act==='accept'){ const b=flat(); snap(); x.ro.acc=true; x.ro.since=NOW; clr(x.ro,'swap','Accepted from '+TF(x.ro.sent.by)); afterAct(no,b); U.sel=no; toast(`${x.ro.no} accepted — it’s with you now. Decide when you’re ready.`); render(); return; }
  if(x.act==='nudge'){ const b=flat(); snap(); x.ro.snz=NOW+1; x.ro.snzWhy='Nudged '+(x.ro.hold?x.ro.hold.who:TF(x.ro.tech)); afterAct(no,b); toast(`Nudged ${x.ro.hold?x.ro.hold.who:TN(x.ro.tech)} — back at ${hm(NOW+1)} if nothing moves.`); render(); return; }
  if(x.act==='clash'){ U.view='yard'; U.clash=x.spot; render(); return; }
  openPop(x.act,no); }
function openPop(type,no){ U.sel=no; U.pop={type,ro:no,i:0}; U.srch=false; render(); }
function done(r,ic,what,msg,b){ clr(r,ic,what); afterAct(r.no,b); U.pop=null; toast(msg); render(); }
function dgo(){ const p=U.pop, r=get(p.ro), b=flat(); if(p.type==='review'){ if(p.o==null) return; snap();
    if(p.o===0){ r.hold={to:'writer',who:'Dana Kowalski',h:0,goal:4}; r.st='customer'; r.sub='Approval pending'; r.b=r.b; r.q=r.q; r.over=false; r.qok=true; r.q=r.b+0.01; return done(r,'swap','To Dana · quote over',`${r.no} to Dana · Quote over — she’ll call ${r.cust.split(' ')[0]}.`,b); }
    if(p.o===1){ r.snz=14; r.snzWhy='Over quote — check at 14:00'; return done(r,'clock','Keep going · check 14:00',`${r.cust} snoozed until 14:00.`,b); }
    r.snz=NOW+1; r.snzWhy='Talked to '+TF(r.tech); return done(r,'phone','Nudged '+TF(r.tech),`Nudged ${TN(r.tech)} about the hours.`,b); }
  const O=decideOpts(r), o=O[p.o]; if(!o) return; snap();
  if(o.act==='look'){ r.snz=NOW+1; r.snzWhy='Looking at it'; return done(r,'clock','Looking at it',`${r.cust} snoozed until ${hm(NOW+1)} — it stays with you.`,b); }
  r.acc=true; r.sent=null; r.comeback=false;
  if(o.act==='go'){ r.st='working'; r.sub='Repairing'; r.run=NOW; return done(r,'check',`Go ahead — back to ${TF(r.tech)}`,`${r.no} back to ${TN(r.tech)} · Go ahead${p.b===3?'':' · back by '+(['12:15','16:30','Fri 08:00'][p.b||0])}.`,b); }
  if(o.act==='warr'){ r.st='support'; r.sub='Case opened'; r.hold={to:'warranty',who:'Kim Lee',h:0,goal:24}; return done(r,'swap','To Warranty',`${r.no} to Kim Lee · ${o.t}.`,b); }
  if(o.act==='appr'){ r.st='customer'; r.sub='Estimate sent'; r.hold={to:'writer',who:'Dana Kowalski',h:0,goal:4}; return done(r,'swap','To Dana · needs approval',`${r.no} to Dana · Needs approval.`,b); }
  r.st='parts'; r.sub='Not ordered'; r.hold={to:'parts',who:'Ben Okafor',h:0,goal:24}; return done(r,'swap','To Parts',`${r.no} to Ben · Order parts.`,b); }
function ago(){ const p=U.pop, r=get(p.ro), b=flat(); snap(); const was=r.tech; r.tech=p.t; r.chk=null;
  if(/^W/.test(r.spot)){ r.plan=p.bay; return done(r,'userPlus',`Planned · ${TF(p.t)}${p.bay?' · '+p.bay:''}`,`${r.no} — ${TN(p.t)} takes it${p.bay?' into '+p.bay:''} when it lands at ${hm(r.eta)}.`,b); }
  if(p.bay&&p.bay!==r.spot){ U.flash=p.bay; r.spot=p.bay; }
  if(inBay(r)) r.idle=NOW;
  done(r,'userPlus',`Assigned to ${TF(p.t)}${p.bay?' · '+p.bay:''}`,`${r.no} → ${TN(p.t)}${p.bay?' · '+p.bay:''}${was&&was!==p.t?' (was '+TF(was)+')':''} — waiting for them to accept.`,b); }
function bgo(){ const p=U.pop, r=get(p.ro), b=flat(); if(!p.bay) return; snap(); const from=r.spot; r.spot=p.bay; r.tech=p.t; r.bring=null; r.st='hold'; r.sub=''; r.idle=NOW; U.flash=p.bay;
  done(r,'bay',`Brought in to ${p.bay}`,`${r.no} → ${p.bay} (from ${from}) · ${TN(p.t)} next.`,b); }
function rgo(){ const p=U.pop, r=get(p.ro), b=flat(); snap(); r.done=null; r.st='roadtest'; const who=p.t==='me'?'you':TN(p.t);
  done(r,'road',`Road test · ${p.t==='me'?'me':TF(p.t)}`,`Road test for ${r.no} — ${who}, ${['now','at 11:00','after lunch'][p.w||0]}.`,b); }
function xgo(){ const p=U.pop, r=get(p.ro), b=flat(); if(!p.to||!p.why) return; snap(); r.acc=true; r.sent=null; r.hold=p.to==='tech'?null:{to:p.to,who:DESK[p.to][2],h:0,goal:p.to==='warranty'?24:4};
  if(r.st==='foreman') r.st=p.to==='tech'?'working':'hold'; done(r,'swap','To '+DESK[p.to][1],`${r.no} to ${DESK[p.to][1]} · ${p.why}.`,b); }
function moveTo(no,spot){ const r=get(no); if(!r||r.spot===spot) return; snap(); const from=r.spot; r.spot=spot; if(BAYS.includes(spot)){ r.bring=null; r.chk=null; if(!r.run) r.idle=NOW; } U.sel=no; U.flash=spot; toast(`${r.no} → ${spot} (from ${from})${r.tech?' · '+TF(r.tech):' · pick a tech: A'}`); render(); }
function reassign(no,k){ const r=get(no); if(!r||r.tech===k) return; snap(); const was=r.tech; r.tech=k; r.chk=null; if(r.run&&was!==k) r.run=null, r.idle=NOW; U.sel=no; clr(r,'userPlus',`Assigned to ${k?TF(k):'nobody'}`); toast(k?`${r.no} → ${TN(k)}${was?' (was '+TF(was)+')':''} — waiting for them to accept.`:`${r.no} has no tech now.`); render(); }

/* ---------- events ---------- */
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, no=t.dataset.ro, p=U.pop;
  if(a==='sel'){ if(e.target.closest('button')&&e.target.closest('button')!==t) return; U.sel=no; U.kb=false; U.pop=null; U.srch=false; render(); }
  else if(a==='do'){ U.kb=false; act(no); }
  else if(a==='pop'){ openPop(t.dataset.p,no); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='filt'){ const k=t.dataset.k||null; U.filt=!k||U.filt===k?null:k; const L=flat(); if(L.length&&L.indexOf(U.sel)<0) U.sel=L[0]; render(); }
  else if(a==='open'){ const k=t.dataset.k; U.open[k]=t.dataset.force&&!U.open[k]?true:!U.open[k]; render(); }
  else if(a==='wake'){ const r=get(no); snap(); r.snz=null; r.snzBack=true; U.sel=no; render(); }
  else if(a==='snzpick'){ const r=get(p.ro), b=flat(), O=[NOW+1,NOW+2,13,16.5,32], i=+t.dataset.i; snap(); r.snz=O[i]; r.snzWhy=''; afterAct(r.no,b); U.pop=null; toast(`${r.cust} snoozed until ${i===4?'Fri 08:00':hm(O[i])}.`); render(); }
  else if(a==='dpick'){ p.o=+t.dataset.i; render(); }
  else if(a==='dback'){ p.b=+t.dataset.i; render(); }
  else if(a==='dgo'||a==='vgo') dgo();
  else if(a==='apick'){ p.t=t.dataset.k; render(); }
  else if(a==='abay'){ p.bay=t.dataset.b; render(); }
  else if(a==='ago') ago(); else if(a==='bgo') bgo(); else if(a==='rgo') rgo();
  else if(a==='rwhen'){ p.w=+t.dataset.i; render(); }
  else if(a==='xto'){ p.to=t.dataset.k; p.why=null; render(); } else if(a==='xwhy'){ p.why=t.dataset.w; render(); } else if(a==='xgo') xgo();
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
  else if(a==='srch'){ U.srch=true; U.q=''; render(); }
  else if(a==='clash'){ U.clash=t.dataset.spot; U.view='yard'; render(); }
  else if(a==='clashx'){ U.clash=null; render(); }
  else if(a==='keep'){ const c=clashes().find(x=>x.spot===U.clash); const other=c.ros.find(r=>r.no!==no); snap(); const sp=freeLot()[0]; other.spot=sp; U.clash=null; U.sel=other.no; U.flash=sp; clr(other,'pin','Moved to '+sp); toast(`${no} stays in ${c.spot} · ${other.no} → ${sp}.`); render(); }
});
mock.addEventListener('input',e=>{ if(e.target.id==='fm-q'){ U.q=e.target.value; const pp=$('.tg-srpop'); if(pp) pp.innerHTML=search(); } });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;
  if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"]')){U.pop=null;ch=true;}
  if(U.srch&&!e.target.closest('.tg-srch,.tg-srpop,[data-a="srch"]')){U.srch=false;ch=true;}
  if(ch) render(); },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return;
  const stop=()=>{e.preventDefault();e.stopPropagation();};
  if(U.srch){ if(k==='Escape'){U.srch=false;render();return stop();} if(k==='Enter'){const f=$('.tg-srpop .tg-sr');if(f){U.sel=f.dataset.ro;U.srch=false;render();}return stop();} return; }
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(inF){ if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); stop(); } return; }
    const n=+k;
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(p.type==='snooze'&&n>=1&&n<=5){ $(`.tg-pop [data-a="snzpick"][data-i="${n-1}"]`)?.click(); return stop(); }
    if((p.type==='decide'||p.type==='review')&&n>=1&&n<=5){ const b=$(`.tg-pop [data-a="dpick"][data-i="${n-1}"]`); if(b) b.click(); return stop(); }
    if(p.type==='assign'&&n>=1&&n<=5){ $$('.tg-pop .fm-tk')[n-1]?.click(); return stop(); }
    if(p.type==='xfer'&&n>=1){ if(!p.to){ $$('.tg-pop .tg-dsk:not([disabled])').find((b,i)=>Object.keys(DESK).indexOf(b.dataset.k)===n-1)?.click(); } else $$('.tg-pop [data-a="xwhy"]')[n-1]?.click(); return stop(); }
    return; }
  if(inF) return;
  if(k==='j'||k==='ArrowDown'){move(1);return stop();} if(k==='k'||k==='ArrowUp'){move(-1);return stop();}
  if(k==='Enter'){U.kb=true;act(U.sel);return stop();}
  if(k==='s'){U.kb=true;if(itemOf(U.sel))openPop('snooze',U.sel);return stop();}
  if(k==='a'){U.kb=true;openPop('assign',U.sel);return stop();}
  if(k==='t'){U.kb=true;openPop('xfer',U.sel);return stop();}
  if(k==='1'||k==='2'||k==='3'){U.view=['floor','techs','yard'][+k-1];render();return stop();}
  if(k==='/'){U.srch=true;U.q='';render();return stop();}
  if(k==='Escape'){ if(U.clash){U.clash=null;render();return stop();} if(U.filt){U.filt=null;render();return stop();} }
});
/* dragging: list items, chips and cards onto bays, lot spots or tech lanes */
let DRAG=null;
mock.addEventListener('dragstart',e=>{ const d=e.target.closest('[data-drag]'); if(!d) return; DRAG=d.dataset.drag; try{e.dataTransfer.setData('text/plain',DRAG);e.dataTransfer.effectAllowed='move';}catch(x){} d.classList.add('src'); $('.tg-main')?.classList.add('fm-dragging'); const y=$('.tg-yd'); if(y) y.classList.add('dragging'); });
mock.addEventListener('dragover',e=>{ if(!DRAG) return; const z=e.target.closest('.fm-bay.free,.tg-s[data-drop]:not(.occ),.fm-lane[data-tech]'); if(!z) return; e.preventDefault(); $$('.over',mock).forEach(x=>x!==z&&x.classList.remove('over')); z.classList.add('over'); });
mock.addEventListener('drop',e=>{ const z=e.target.closest('.fm-bay.free,.tg-s[data-drop]:not(.occ),.fm-lane[data-tech]'); if(!z||!DRAG) return; e.preventDefault(); const no=DRAG; DRAG=null; if(z.dataset.tech!=null) reassign(no,z.dataset.tech); else moveTo(no,z.dataset.drop); });
mock.addEventListener('dragend',()=>{ DRAG=null; $$('.src,.over',mock).forEach(x=>x.classList.remove('src','over')); $('.tg-main')?.classList.remove('fm-dragging'); });
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop){ const it=$(`.tg-it[data-ro="${U.pop.ro}"]`); let top=12; if(it) top=it.getBoundingClientRect().top/scale-body.getBoundingClientRect().top/scale-6; top=Math.round(Math.max(12,Math.min(top,body.offsetHeight-p.offsetHeight-12))); p.style.top=top+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.srch){ const q=$('#fm-q'); if(q&&document.activeElement!==q){q.focus();q.setSelectionRange(q.value.length,q.value.length);} }
  U.flash=null; }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  decide:()=>{reset();U.sel='37011';render();openPop('decide','37011');U.pop.o=0;render();},
  assign:()=>{reset();U.sel='37628';render();openPop('assign','37628');},
  bring:()=>{reset();U.sel='37455';render();openPop('bring','37455');},
  techs:()=>{reset();U.view='techs';U.sel='37628';render();},
  review:()=>{reset();U.sel='37612';render();openPop('review','37612');},
  yard:()=>{reset();U.view='yard';U.clash='D5';U.sel='37502';render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__fm={S:()=>S,U:()=>U,render,reset,openPop,DEMO};
reset(); render();
"""
for k, v in {"__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("decide", "1 · Decide"), ("assign", "2 · Assign tech + bay"), ("bring", "3 · Bring in"), ("techs", "4 · Techs"), ("review", "5 · Over the quote"), ("yard", "6 · Yard")])
about = [
 ("Needs action, always on the left", "What’s waiting on the foreman, in groups: Sent to you · Waiting on you · Needs a tech · Bring in · Road test · Watch. Same keys as Triage: J K, ↵, S snooze, A assign, T transfer. Snoozed and Cleared today at the bottom."),
 ("Facts are filters", "“2 waiting on you”, “3 need a tech” and “3 late” narrow the list. “22 on the yard” clears it."),
 ("Floor · Techs · Yard", "The selected RO three ways. Floor is the bay board with a live clock, nobody-on time and hours used against the quote. Techs is one lane per tech with their load against the hours left today. Yard is the Triage yard."),
 ("Decide", "For Waiting – Foreman. Every choice is a transfer with a reason — back to the tech, warranty, approval or parts — or “I’ll look at it”, which snoozes it with you."),
 ("Assign is tech and bay in one", "Techs sorted lightest first, with their hours left. Pick a bay in the same step. An arrival gets a tech and a bay before it lands."),
 ("Bring in · Road test · Watch", "Approved trucks with parts in hand wait for a bay. Finished ops wait for a road test. Watch holds what’s held too long, over the quote, or two trucks on one spot."),
 ("Drag", "A list item, a Waiting-for-a-bay chip or a card onto an open bay, a lot spot or another tech’s lane. Undo on every toast."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Foreman mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Foreman — Triage patterns carried over</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Foreman<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
