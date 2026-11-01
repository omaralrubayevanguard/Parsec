# Fixes page mock-up — the same panel as Triage, Foreman, Warranty, Time Log and Parts (Parsec design system, Ivory + Graphite).
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
 "book": '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5zM5 18.5A1.5 1.5 0 0 0 6.5 20H19"/>',
 "filter": '<path d="M6 19c1.6-1.8 0-3.6 1.6-5.4S7.6 10 9.2 8.2M11.2 19c1.6-1.8 0-3.6 1.6-5.4s0-3.6 1.6-5.4M16.4 19c1.6-1.8 0-3.6 1.6-5.4s0-3.6 1.6-5.4M4 5h16"/>',
 "engine": '<path d="M6 9h9l2 2h2v6h-2l-2 2H8l-2-2H4v-6h2z"/><path d="M9 9V6h4v3M19 11v6"/>',
 "drop": '<path d="M12 3.5c3.2 4.2 5.5 7.3 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6 5.5-10.2z"/>',
 "bolt": '<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>',
 "air": '<path d="M4 9h11a3 3 0 1 0-3-3M4 14h14a3 3 0 1 1-3 3M4 19h6"/>',
 "gear2": '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18"/>',
 "snow": '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
 "bulb": '<path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.8.6-1.5 1.4-1.5 2.5h-4c0-1.1-.7-1.9-1.5-2.5z"/>',
 "spark": '<path d="M12 3.5 13.8 10 20 12l-6.2 2L12 20.5 10.2 14 4 12l6.2-2z"/>',
 "merge": '<path d="M6 4v5a5 5 0 0 0 5 5h7M15 11l3 3-3 3M6 20v-4"/>',
})

CSS = shell + r"""
""" + frame + r"""
/* ===== Fixes — prefix fx-, on the Triage tg- base ===== */
.fx .tg-list{flex-basis:400px;width:400px;}
.fx .tg-pop{left:auto;}
.fx .tg-it{grid-template-columns:28px minmax(0,1fr) auto;}
.fx .tg-it .tg-t > b.cmp{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.fx-n{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 11px/1 var(--tg-mono);background:var(--tg-fill);color:var(--tg-ink2);flex:none;}
.fx-open{grid-column:3;grid-row:1 / span 2;display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:600;background:var(--tg-acct);color:var(--tg-acctx);white-space:nowrap;}
.fx-lh2{display:flex;align-items:center;gap:6px;padding:0 20px 8px;}
.fx-lh2 .sp{flex:1;}
.fx-lh2 .tg-seg3 button{font-size:11.5px;padding:2px 8px !important;}
.fx-flt{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px !important;border-radius:7px;font-size:11.5px;font-weight:500;color:var(--tg-ink2);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.fx-flt.on{background:var(--tg-acct);color:var(--tg-acctx);box-shadow:inset 0 0 0 1px var(--tg-accl);}
.fx-pane{height:100%;overflow:auto;scrollbar-width:thin;display:flex;flex-direction:column;}
.fx-pane > .tg-top{position:sticky;top:0;z-index:3;background:var(--tg-panel);}
.fx-facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px 16px;}
.fx-facts small{display:block;font-size:11.5px;color:var(--tg-ink3);}
.fx-facts span{display:flex;align-items:baseline;gap:6px;font-size:13px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink);}
.fx-facts span.m{font:500 13px/20px var(--tg-mono);} .fx-facts span em{font:400 12px/1 var(--tg-sans);font-style:normal;color:var(--tg-ink3);}
.fx-facts .warn{color:var(--tg-warn);} .fx-facts .good{color:var(--tg-good);}
.fx-pad{padding:16px 28px 28px;display:flex;flex-direction:column;gap:12px;}
.fx-card{border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);overflow:hidden;}
.fx-ch{display:flex;align-items:center;gap:10px;padding:11px 16px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13.5px;}
.fx-ch b{font-weight:600;} .fx-ch small{font-size:12px;color:var(--tg-ink3);} .fx-ch .sp{flex:1;}
.fx-best{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
.fx-best > div{padding:12px 16px;min-width:0;}
.fx-best > div + div{box-shadow:inset 1px 0 0 var(--tg-hair);}
.fx-best small.l{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--tg-ink3);margin-bottom:4px;}
.fx-best p{margin:0;font-size:14px;line-height:21px;color:var(--tg-ink);}
.fx-best p i{font-style:normal;font-size:12px;color:var(--tg-ink3);margin-left:4px;white-space:nowrap;}
.fx-alt{margin-top:6px;font-size:12.5px;color:var(--tg-ink2);line-height:18px;}
.fx-alt i{font-style:normal;color:var(--tg-ink3);}
.fx-bot{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);box-shadow:inset 0 1px 0 var(--tg-hair);}
.fx-bot > div{padding:12px 16px;min-width:0;} .fx-bot > div + div{box-shadow:inset 1px 0 0 var(--tg-hair);}
.fx-pl{display:grid;grid-template-columns:minmax(0,1fr) 68px 50px 112px;gap:10px;align-items:center;min-height:30px;font-size:13px;}
.fx-pl b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fx-pl .m{font:500 12px/1 var(--tg-mono);color:var(--tg-ink2);}
.fx-pl .u{position:relative;height:5px;border-radius:3px;background:var(--tg-hair);overflow:hidden;} .fx-pl .u i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--tg-ink2);}
.fx-pl .n{font-size:12px;color:var(--tg-ink3);text-align:right;white-space:nowrap;}
.fx-codes{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.fx-code{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 7px;border-radius:6px;background:var(--tg-fill);font:500 11.5px/1 var(--tg-mono);color:var(--tg-ink2);}
.fx-code small{font:400 11px/1 var(--tg-sans);color:var(--tg-ink3);}
/* the hours strip */
.fx-hrs{position:relative;height:62px;margin:8px 4px 0;}
.fx-hrs .ax{position:absolute;left:0;right:0;top:40px;height:1px;background:var(--tg-hair);}
.fx-hrs .tk{position:absolute;top:48px;transform:translateX(-50%);font:500 10.5px/1 var(--tg-mono);color:var(--tg-ink4);}
.fx-hrs .q{position:absolute;top:13px;height:32px;width:0;border-left:1.5px dashed var(--tg-ink3);}
.fx-hrs .q em{position:absolute;bottom:calc(100% + 1px);left:0;transform:translateX(-50%);font:600 10.5px/1 var(--tg-sans);font-style:normal;color:var(--tg-ink3);white-space:nowrap;}
.fx-hrs .d{position:absolute;top:35px;width:11px;height:11px;margin-left:-5.5px;border-radius:50%;background:var(--tg-ink2);box-shadow:0 0 0 2px var(--tg-raised);cursor:default;}
.fx-hrs .d.cb{background:var(--tg-bad);}
.fx-hrs .d:hover{transform:scale(1.25);}
.fx-hl{display:flex;align-items:center;gap:12px;margin-top:2px;font-size:11.5px;color:var(--tg-ink3);}
.fx-hl i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:var(--tg-ink2);vertical-align:0;} .fx-hl i.cb{background:var(--tg-bad);}
/* worth knowing */
.fx-tip{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;border-radius:14px;background:var(--tg-warn-t);font-size:13px;line-height:19px;color:var(--tg-ink);}
.fx-tip > .tg-ic{color:var(--tg-warn);flex:none;margin-top:1px;} .fx-tip b{font-weight:600;}
/* every time */
.fx-er{display:grid;grid-template-columns:70px minmax(0,1.05fr) minmax(0,1fr) minmax(0,1.15fr) 82px 96px;gap:12px;align-items:start;padding:10px 16px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;line-height:18px;}
.fx-er.h{padding:7px 16px;font-size:11.5px;color:var(--tg-ink3);box-shadow:none;}
.fx-er .dt{font:500 12px/18px var(--tg-mono);color:var(--tg-ink2);}
.fx-er .c{display:flex;flex-direction:column;gap:2px;min-width:0;} .fx-er .c b{font-weight:500;} .fx-er .c small{font-size:12px;color:var(--tg-ink3);line-height:16px;}
.fx-er .c small.m{font-family:var(--tg-mono);font-size:11.5px;}
.fx-er .ro{display:inline-flex;align-items:center;gap:6px;cursor:pointer;} .fx-er .ro:hover .tg-no{text-decoration:underline;}
.fx-er .tc{font-size:12.5px;color:var(--tg-ink2);} .fx-er .tc b{display:block;font:500 12.5px/18px var(--tg-mono);color:var(--tg-ink);}
.fx-oc{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:500;white-space:nowrap;}
.fx-oc.ok{background:var(--tg-good-t);color:var(--tg-good);} .fx-oc.cb{background:var(--tg-bad-t);color:var(--tg-bad);} .fx-oc.nw{background:var(--tg-fill);color:var(--tg-ink3);}
.fx-man{display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:4px;font-size:10.5px;font-weight:600;background:var(--tg-fill);color:var(--tg-ink3);}
.fx-er.cbrow{background:color-mix(in srgb,var(--tg-bad) 4%,transparent);}
/* full views */
.fx-full{height:100%;overflow:auto;scrollbar-width:thin;padding:18px 28px 28px;}
.fx-fh{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.fx-fh h2{margin:0;font:500 24px/30px var(--tg-serif);letter-spacing:-.01em;}
.fx-fh .sp{flex:1;}
.fx-tbl{border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);padding:4px 16px 8px;margin-bottom:14px;}
.fx-tg{display:flex;align-items:center;gap:8px;padding:12px 2px 6px;font-size:12px;font-weight:600;color:var(--tg-ink3);}
.fx-tg span{font-weight:400;color:var(--tg-ink4);} .fx-tg .sp{flex:1;} .fx-tg.warn{color:var(--tg-warn);}
.fx-or{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1.3fr) 110px 120px minmax(0,1.3fr) 128px;gap:12px;align-items:center;min-height:54px;padding:4px 6px;border-radius:10px;font-size:13px;}
.fx-or.h{min-height:28px;font-size:11.5px;color:var(--tg-ink3);}
.fx-or .c{display:flex;flex-direction:column;gap:2px;min-width:0;} .fx-or .c b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fx-or .c small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fx-or .c .lk{cursor:pointer;} .fx-or .c .lk:hover{text-decoration:underline;}
.fx-or .q{display:flex;flex-direction:column;gap:2px;} .fx-or .q b{font:500 13px/1.2 var(--tg-mono);} .fx-or .q small{font-size:11.5px;color:var(--tg-ink3);}
.fx-or .q b.none{font-family:var(--tg-sans);font-weight:400;color:var(--tg-warn);}
.fx-or .ac{display:flex;justify-content:flex-end;}
.fx-ap{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--tg-good);font-weight:500;}
.fx-rv{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1.5fr) minmax(0,1.3fr) 236px;gap:14px;align-items:center;min-height:58px;padding:6px 6px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;}
.fx-rv:last-child{box-shadow:none;}
.fx-rv .c{display:flex;flex-direction:column;gap:2px;min-width:0;} .fx-rv .c b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fx-rv .c small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fx-gap{display:inline-flex;align-items:center;gap:5px;align-self:flex-start;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:500;background:var(--tg-warn-t);color:var(--tg-warn);}
.fx-gap.dup{background:var(--tg-acct);color:var(--tg-acctx);}
.fx-rv .ac{display:flex;gap:6px;justify-content:flex-end;}
.fx-sum{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
.fx-sum span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:8px;background:var(--tg-fill);font-size:12.5px;color:var(--tg-ink2);}
.fx-sum span b{font-weight:600;color:var(--tg-ink);} .fx-sum span.warn{background:var(--tg-warn-t);color:var(--tg-warn);} .fx-sum span.warn b{color:var(--tg-warn);}
/* popovers */
.fx-pop-w{width:460px;} .fx-pop-x{width:520px;}
.fx-ctx{margin:-2px 0 10px;padding:9px 11px;border-radius:10px;background:var(--tg-canvas);font-size:12.5px;line-height:18px;color:var(--tg-ink2);}
.fx-ctx b{color:var(--tg-ink);font-weight:500;}
.fx-ln{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:7px 4px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;cursor:pointer;}
.fx-ln:last-child{box-shadow:none;}
.fx-ln input{margin:0;}
.fx-ln .d{display:flex;flex-direction:column;gap:1px;min-width:0;} .fx-ln .d b{font-weight:500;} .fx-ln .d small{font-size:12px;color:var(--tg-ink3);}
.fx-ln .r{text-align:right;font-size:12px;color:var(--tg-ink3);white-space:nowrap;} .fx-ln .r b{display:block;font:500 12.5px/18px var(--tg-mono);color:var(--tg-ink);}
.fx-f{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--tg-ink3);margin-top:8px;}
.fx-f input,.fx-f textarea{width:100%;}
.fx-f textarea{resize:none;font-size:13px;line-height:19px;}
.fx-two{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.fx-three{display:grid;grid-template-columns:90px 1fr 1fr;gap:10px;}
.fx-ck{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12.5px;color:var(--tg-ink2);cursor:pointer;}
.fx-ck input{margin:0;}
.fx-src{display:flex;gap:8px;align-items:flex-start;margin:6px 0 0;padding:8px 10px;border-radius:9px;box-shadow:inset 0 0 0 1px var(--tg-hair);font-size:12.5px;line-height:18px;color:var(--tg-ink2);}
.fx-src .tg-av{flex:none;margin-top:1px;} .fx-src span{flex:1;} .fx-src i{font-style:normal;color:var(--tg-ink3);}
.fx-hint{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:6px;font-size:12px;color:var(--tg-acctx);}
.fx-srin{display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;margin:0 0 6px;border-radius:9px;background:var(--tg-fill);}
.fx-srin input{flex:1;background:transparent !important;box-shadow:none !important;border:0 !important;padding:0 !important;font-size:13.5px;}
.fx-srin input:focus{box-shadow:none !important;outline:none;}
.fx-srin .tg-ic{color:var(--tg-ink3);}
.fx-srr{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:2px 10px;align-items:center;width:100%;padding:7px 10px !important;border-radius:9px;text-align:left;font-size:13px;}
.fx-srr:hover,.fx-srr.k{background:var(--tg-fill);}
.fx-srr .gi{grid-row:1 / span 2;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:var(--tg-fill);color:var(--tg-ink2);}
.fx-srr b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fx-srr small{grid-column:2 / 4;font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fx-srr small mark{background:var(--tg-acct);color:var(--tg-acctx);border-radius:3px;padding:0 2px;}
.fx-srr .m{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);}
.fx-none{padding:14px 10px;font-size:12.5px;color:var(--tg-ink3);}
.tk-tip{position:absolute;z-index:30;max-width:280px;padding:8px 10px;border-radius:9px;background:var(--tg-raised);box-shadow:var(--tg-sh-raised);font-size:12px;line-height:17px;color:var(--tg-ink);pointer-events:none;}
.tk-tip b{font-weight:600;} .tk-tip small{display:block;color:var(--tg-ink3);}
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
const usd=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=n=>'$'+Math.round(n).toLocaleString('en-US');
const h1=n=>(Math.round(n*10)/10).toFixed(1);
const TODAY='2026-10-22', NOW=14*60+15;
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const fd=k=>{ if(!k) return '—'; const d=dOf(k); return MN[d.getMonth()]+' '+d.getDate()+(d.getFullYear()!==2026?', '+d.getFullYear():''); };
const dd=(a,b)=>Math.round((dOf(b)-dOf(a))/86400000);
const PPL={AM:'Alicia Moore',JT:'Jordan Tate',FD:'Frank Delaney',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
const F=k=>PPL[k].split(' ')[0];
const lc=s=>/^[A-Z][a-z]/.test(s)?s[0].toLowerCase()+s.slice(1):s;
const RATE=210;
const SYS={aft:['Aftertreatment','filter'],eng:['Engine','engine'],cool:['Cooling','drop'],elec:['Electrical','bolt'],air:['Air and brakes','air'],cab:['Cab and A/C','snow'],drv:['Drivetrain','gear2']};
const CUST=['Midway Auto Transport','Prairie Line Trucking','Piedmont Aggregates','Silverline LTL','Highplains Grain','Red Mesa Hauling','Copperline Transport','Dixie Fleet Services','Triad Cold Chain','Elkin Hardwoods','Uwharrie Fuel','Surry Feed & Seed','Keystone Carriers','Iron Horse Logistics','Rowan Ready Mix','Yadkin Valley Freight','Sandhills Grain','Catawba Timber','Mount Airy Logistics','Haw River Dairy','Alamance Hauling','Forsyth Fleet Services'];
const TRUCK=['2018 Volvo VNL 670','2019 Volvo VNL 760','2020 Volvo VNL 760','2021 Volvo VNL 860','2019 Volvo VNR 640','2022 Volvo VNL 760','2020 Volvo VHD','2017 Volvo VNL 670'];
const TECHS=['MR','DK','LM','PS','AW','KT'];
const ONHAND={'22827993':3,'23295841':0,'21512367':4,'22770789':0,'21340719':2,'23137410':0,'21751883':0,'22972342':0,'22479124':1,'21468475':0,'20734264':5,'21789944':0,'21531071':2,'21399788':0,'23175123':0,'21620181':1,'20972915':3,'21511217':4,'85137802':0,'22411521':0,'21877394':2,'20750712':12,'85023114':0,'21302012':1,'22011837':1};
/* the complaints: how each was fixed, and how often each way */
const G0=[
 {k:'nox',sys:'aft',t:'Outlet NOx sensor — check engine light',n:9,eng:['D13','D13','D13 TC','D11'],V:[{w:9,cause:'Outlet NOx sensor reading out of range — failed the sensor test',fix:'Replaced the outlet NOx sensor, ran a parked regen, no return',parts:[['22827993','Outlet NOx sensor',1,486.20]],codes:['SPN 3226 FMI 2'],h:[0.8,1.3],q:1.0}]},
 {k:'doser',sys:'aft',t:'DEF doser clogged — derate',n:5,V:[{w:4,cause:'Doser tip crystallized — flow test failed',fix:'Replaced the DEF doser and gasket, flushed the line, flow test good',parts:[['23295841','DEF doser',1,742.18],['21512367','Doser gasket',1,9.60]],codes:['SPN 3361 FMI 7'],h:[1.1,1.7],q:1.3},{w:1,cause:'Doser line kinked behind the tank',fix:'Re-routed and replaced the doser line',parts:[['22011837','DEF line, doser',1,88.40]],codes:['SPN 3361 FMI 7'],h:[0.9,1.2],q:1.3}],tip:'1 of 5 times it was a kinked line behind the tank, not the doser. Check the line before ordering a $742 doser.'},
 {k:'dpfp',sys:'aft',t:'DPF pressure sensor — fault code',n:4,V:[{w:3,cause:'Sensor reading stuck high',fix:'Replaced the DPF pressure sensor, cleared codes',parts:[['22770789','DPF pressure sensor',1,186.40]],codes:['SPN 3251 FMI 2'],h:[0.5,0.9],q:0.7},{w:1,cause:'Sensor hose cracked',fix:'Replaced the sensor hose',parts:[['21340719','DPF sensor hose',1,24.10]],codes:['SPN 3251 FMI 2'],h:[0.4,0.6],q:0.7}],tip:'1 of 4 times it was a cracked sensor hose — a $24 part.'},
 {k:'egr',sys:'aft',t:'EGR valve stuck — derate',n:3,V:[{w:2,cause:'Valve sticking at 40% — carbon build-up',fix:'Replaced the EGR valve, ran the EGR test in Tech Tool',parts:[['23137410','EGR valve',1,968.00]],codes:['SPN 27 FMI 7'],h:[1.8,2.6],q:2.0},{w:1,cause:'EGR cooler leaking coolant into the valve',fix:'Replaced the EGR cooler and the valve, pressure tested the cooling system',parts:[['21751883','EGR cooler gasket kit',1,46.90],['23137410','EGR valve',1,968.00]],codes:['SPN 27 FMI 7'],h:[5.4,6.1],q:2.0}],tip:'1 of 3 came back — the EGR cooler was leaking coolant into the valve. Look for coolant in the valve before replacing it.',ord:[1,0,0],cb:[[1,21]]},
 {k:'turbo',sys:'eng',t:'Turbo actuator fault — low boost',n:6,eng:['D13 TC','D13 TC','D13'],V:[{w:5,cause:'Actuator sticking — failed the actuator test in Tech Tool',fix:'Replaced the turbo actuator, calibrated with Tech Tool, road tested',parts:[['22972342','Turbo actuator',1,1348.00]],codes:['SPN 641 FMI 7'],h:[1.3,2.1],q:1.6},{w:1,cause:'Actuator connector pin backed out',fix:'Re-pinned the actuator connector',parts:[],codes:['SPN 641 FMI 5'],h:[0.6,0.8],q:1.6}],tip:'1 of 6 was a backed-out connector pin — and it came back 9 days later. Check the connector, then test the actuator.',ord:[0,0,0,1,0,0],cb:[[3,9]]},
 {k:'inj',sys:'eng',t:'Misfire cylinder 4 — injector',n:5,V:[{w:5,cause:'Cylinder cut-out test failed on 4',fix:'Replaced injector 4, cut-out test good',parts:[['22479124','Injector',1,684.00]],codes:['SPN 654 FMI 7'],h:[2.6,3.4],q:3.0}]},
 {k:'wp',sys:'cool',t:'Coolant leak at water pump',n:7,V:[{w:7,cause:'Weep hole leaking — the pump seal failed',fix:'Replaced the water pump and gasket, pressure tested, holds',parts:[['21468475','Water pump',1,398.70],['20734264','Water pump gasket',1,14.20]],codes:[],h:[2.6,3.4],q:3.0}]},
 {k:'cts',sys:'cool',t:'Coolant temp sensor — erratic reading',n:3,V:[{w:2,cause:'Connector corroded — the sensor tested good',fix:'Cleaned and re-pinned the connector, replaced the pigtail',parts:[['21789944','Connector pigtail, 2-pin',1,38.75]],codes:['SPN 110 FMI 2'],h:[0.5,0.8],q:0.8},{w:1,cause:'Sensor failed internally',fix:'Replaced the coolant temp sensor',parts:[['21531071','Coolant temp sensor',1,64.20]],codes:['SPN 110 FMI 2'],h:[0.6,0.9],q:0.8}],tip:'2 of 3 times it was the connector, not the sensor. Test the sensor before you order one — the pigtail is $38.75.'},
 {k:'rad',sys:'cool',t:'Radiator leak — lower tank',n:2,V:[{w:2,cause:'Lower tank cracked at the seam',fix:'Replaced the radiator, pressure tested',parts:[['21399788','Radiator',1,2214.00]],codes:[],h:[4.2,5.1],q:4.5}]},
 {k:'alt',sys:'elec',t:'Alternator not charging — 12.1 V at idle',n:4,V:[{w:4,cause:'Rectifier failed — no output above 12.2 V',fix:'Replaced the alternator, verified 14.1 V at idle',parts:[['23175123','Alternator 24V 130A',1,512.00]],codes:['SPN 167 FMI 1'],h:[1.2,1.7],q:1.5}]},
 {k:'dryer',sys:'air',t:'Air dryer purging constantly',n:4,V:[{w:4,cause:'Purge valve leaking',fix:'Replaced the purge valve and the cartridge',parts:[['21620181','Purge valve, air dryer',1,142.60],['20972915','Air dryer cartridge',1,96.30]],codes:[],h:[0.7,1.1],q:1.0}]},
 {k:'seal',sys:'air',t:'Wheel seal leaking — drive axle',n:6,V:[{w:6,cause:'Seal worn — oil on the shoes',fix:'Replaced the wheel seal and the shoes on that end, refilled the hub',parts:[['21511217','Wheel seal',1,58.30],['85137802','Brake shoe kit, 16.5 × 7',1,192.00]],codes:[],h:[2.0,2.8],q:2.4}]},
 {k:'ac',sys:'cab',t:'A/C not cooling — compressor clutch',n:3,V:[{w:3,cause:'Clutch coil open',fix:'Replaced the compressor and the receiver drier, evacuated and recharged',parts:[['22411521','A/C compressor',1,1186.40],['21877394','Receiver drier',1,88.50],['20750712','PAG oil, 8 oz',1,18.90]],codes:[],h:[2.1,2.9],q:2.4}]},
 {k:'clutch',sys:'drv',t:'Clutch slipping — replace clutch',n:2,V:[{w:2,cause:'Clutch worn past spec',fix:'Replaced the clutch and the release bearing',parts:[['85023114','Clutch kit, 15.5"',1,1642.00],['21302012','Release bearing',1,214.50]],codes:[],h:[7.5,9.0],q:8.0}]}
];
function rng(seed){ let a=0; for(const c of seed) a=(a*31+c.charCodeAt(0))|0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
let EID=0;
function build(g){ const r=rng(g.k), E=[]; let day=TODAY, V=[]; g.V.forEach(v=>{ for(let i=0;i<v.w;i++) V.push(v); });
  for(let i=0;i<g.n;i++){ day=addD(day,-(6+Math.floor(r()*70))); const v=g.ord?g.V[g.ord[i]]:V[i%V.length];
    const h=Math.round((v.h[0]+r()*(v.h[1]-v.h[0]))*10)/10, q=v.q, eng=(g.eng||['D13','D13','D13 TC','D11'])[Math.floor(r()*(g.eng||[1,2,3,4]).length)];
    const no=String(37700-Math.round(dd(day,TODAY)*7.5)-Math.floor(r()*5)), pc=v.parts.reduce((s,p)=>s+p[2]*p[3],0);
    E.push({id:'e'+(++EID),k:g.k,date:day,ro:no,cust:CUST[Math.floor(r()*CUST.length)],truck:TRUCK[Math.floor(r()*TRUCK.length)],eng,miles:120000+Math.floor(r()*500)*1000,vin:'…'+'JKLMN'[Math.floor(r()*5)]+'N'+String(100000+Math.floor(r()*899999)).slice(0,6),
      cause:v.cause,fix:v.fix,parts:v.parts,codes:v.codes,tech:TECHS[Math.floor(r()*TECHS.length)],h,q,cost:Math.round(pc+q*RATE),out:'ok'}); }
  (g.cb||[]).forEach(([i,days])=>{ if(E[i]){ E[i].out='cb'; E[i].back=days; const f=E[i-1]; if(f){ Object.assign(f,{date:addD(E[i].date,days),cust:E[i].cust,truck:E[i].truck,eng:E[i].eng,vin:E[i].vin,miles:E[i].miles+2400,ro:String(+E[i].ro+Math.round(days*7.5))}); f.after=E[i].ro; } E[i].backRo=f?f.ro:String(+E[i].ro+Math.round(days*7.5)); } });
  return E; }
/* trucks in the shop now, by complaint */
const OPEN0=[
 {no:'37760',k:'nox',cust:'Piedmont Aggregates',truck:'2018 Volvo VNL 670',eng:'D13',miles:412300,tech:'MR',wr:'AM',spot:'L14',q:null,parts:[],in:'today 13:40'},
 {no:'37388',k:'doser',cust:'Elkin Hardwoods',truck:'2021 Volvo VNR 640',eng:'D13',miles:288400,tech:'DK',wr:'AM',spot:'L9',q:null,parts:['23295841','21512367'],in:'10/21'},
 {no:'37628',k:'turbo',cust:'Prairie Line Trucking',truck:'2019 Volvo VNL 860',eng:'D13 TC',miles:501200,tech:'MR',wr:'JT',spot:'L12',q:1.6,parts:['22972342'],from:'37455',in:'10/20'},
 {no:'37544',k:'egr',cust:'Copperline Transport',truck:'2018 Volvo VNL 760',eng:'D13',miles:466900,tech:'AW',wr:'AM',spot:'L3',q:2.0,parts:['23137410'],in:'10/15'},
 {no:'37519',k:'cts',cust:'Dixie Fleet Services',truck:'2018 Volvo VNL 670',eng:'D13',miles:538700,tech:'MR',wr:'JT',spot:'L2',q:0.8,parts:['21531071','21789944'],in:'10/22'},
 {no:'37750',k:'ac',cust:'Yadkin Valley Freight',truck:'2020 Volvo VNL 760',eng:'D13',miles:322100,tech:'LM',wr:'AM',spot:'L4',q:2.4,parts:['22411521','21877394'],from:'36992',in:'10/22'},
 {no:'37466',k:'inj',cust:'Uwharrie Fuel',truck:'2019 Volvo VNL 860',eng:'D13',miles:612800,tech:'PS',wr:'JT',spot:'B6',q:3.0,parts:['22479124'],from:'37104',in:'10/22'},
 {no:'37203',k:'rad',cust:'Surry Feed & Seed',truck:'2019 Volvo VNL 760',eng:'D13',miles:397500,tech:'LM',wr:'AM',spot:'B9',q:4.5,parts:['21399788'],in:'10/19'}
];
/* finished this week — landed in Fixes, some need a better write-up */
const REV0=[
 {id:'r1',k:'dryer',ro:'37742',cust:'Rowan Ready Mix',tech:'DK',truck:'2020 Volvo VHD',eng:'D11',gap:'short',cmp:'Air dryer purging constantly',cause:'Purge valve leaking',fix:'replaced',noteFix:'Replaced the purge valve and the cartridge — no more purging at idle',note:'Purge valve leaking at the dryer — replaced valve and cartridge, no more purging at idle.'},
 {id:'r2',k:'wp',ro:'37455',cust:'Highplains Grain',tech:'AW',truck:'2021 Volvo VNL 760',eng:'D13',gap:'cause',cmp:'Coolant leak at water pump',cause:'',fix:'Replaced the water pump and gasket',noteCause:'Weep hole was wet — the pump seal failed',note:'Water pump out, gasket surface cleaned. Weep hole was wet, seal gone.'},
 {id:'r3',k:'seal',ro:'37612',cust:'Midway Auto Transport',tech:'MR',truck:'2019 Volvo VNL 760',eng:'D13',gap:'dup',cmp:'Wheel seal leaking — drive axle, left rear',cause:'Seal worn',fix:'Replaced wheel seal and both shoes on that end, refilled hub'},
 {id:'r4',k:'nox',ro:'37502',cust:'Piedmont Aggregates',tech:'MR',truck:'2018 Volvo VNL 670',eng:'D13',gap:'code',cmp:'Outlet NOx sensor — check engine light',cause:'Sensor out of range',fix:'Replaced outlet NOx sensor, ran a parked regen, no return'},
 {id:'r5',k:'dpfp',ro:'37590',cust:'Silverline LTL',tech:'MR',truck:'2020 Volvo VNL 760',eng:'D13 TC',gap:'none',cmp:'DPF pressure sensor — fault code',cause:'Sensor reading stuck high',fix:'Replaced the DPF pressure sensor, cleaned the DPF',ok:1}
];
let S,U,UNDO,TOAST,TT;
function reset(){ EID=0; const E={}; G0.forEach(g=>{ E[g.k]=build(g); }); S={E,O:JSON.parse(JSON.stringify(OPEN0)),R:JSON.parse(JSON.stringify(REV0)),M:[],extra:{}};
  U={view:'lib',sel:'nox',pop:null,kb:false,sort:'count',flt:false,open:{},q:''}; UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify(S)); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const grp=k=>G0.find(g=>g.k===k);
const ents=k=>S.E[k].concat(S.M.filter(m=>m.k===k)).sort((a,b)=>a.date<b.date?1:-1);
const opensOf=k=>S.O.filter(o=>o.k===k);
const pend=o=>!o.q||!o.parts.length;
function stats(k){ const E=ents(k), g=grp(k), cb=E.filter(e=>e.out==='cb').length, hrs=E.reduce((s,e)=>s+e.h,0)/E.length, q=g.V[0].q, cost=E.reduce((s,e)=>s+e.cost,0)/E.length;
  const T={}; E.forEach(e=>{ T[e.tech]=(T[e.tech]||0)+1; }); const top=Object.keys(T).sort((a,b)=>T[b]-T[a])[0];
  const C={}, X={}, PT={}, CD={}; E.forEach(e=>{ C[e.cause]=(C[e.cause]||0)+1; X[e.fix]=(X[e.fix]||0)+1; e.parts.forEach(p=>{ PT[p[0]]=PT[p[0]]||{p,n:0}; PT[p[0]].n++; }); e.codes.forEach(c=>{ CD[c]=(CD[c]||0)+1; }); });
  const srt=o=>Object.keys(o).sort((a,b)=>o[b]-o[a]);
  return {E,n:E.length,cb,hrs,q,cost,top,topN:T[top],causes:srt(C).map(c=>[c,C[c]]),fixes:srt(X).map(c=>[c,X[c]]),parts:Object.values(PT).sort((a,b)=>b.n-a.n),codes:srt(CD).map(c=>[c,CD[c]]),trucks:new Set(E.map(e=>e.vin)).size,engs:[...new Set(E.map(e=>e.eng))]}; }
function groupsList(){ let L=G0.slice(); if(U.flt) L=L.filter(g=>opensOf(g.k).length);
  if(U.sort==='recent') L.sort((a,b)=>ents(a.k)[0].date<ents(b.k)[0].date?1:-1); else if(U.sort==='az') L.sort((a,b)=>a.t.localeCompare(b.t)); else L.sort((a,b)=>ents(b.k).length-ents(a.k).length);
  return L; }
const flat=()=>{ const L=groupsList(); if(U.sort!=='count') return L.map(g=>g.k); return Object.keys(SYS).flatMap(s=>L.filter(g=>g.sys===s)).map(g=>g.k); };

/* ---------- drawing ---------- */
function render(){
  const v=U.view, body=v==='open'?vOpen():v==='rev'?vRev():vLib();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='fixes'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg fx">${head()}<div class="tg-body v-${v}">${v==='lib'?list():''}<div class="tg-main">${body}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const n=G0.reduce((s,g)=>s+ents(g.k).length,0), op=S.O.filter(o=>pend(o)).length, rv=S.R.filter(r=>!r.ok&&!r.done).length, wk=S.R.length;
  const vs=[['lib','book','Library'],['open','ros','Open ROs'],['rev','note','Review']];
  return `<header class="tg-head"><h1 class="tg-h1">Fixes</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><b>${n}</b>fixes</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${G0.length}</b>complaints</span><i>·</i>${op?`<button class="tg-hf w" data-a="view" data-v="open"><b>${op}</b>open ROs can use one</button><i>·</i>`:''}${rv?`<button class="tg-hf" data-a="view" data-v="rev"><b>${rv}</b>to review</button><i>·</i>`:''}<span class="tg-hf" style="cursor:default"><b>${wk}</b>new this week</span></span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Search complaint, cause, code, part # or VIN (/)">${ic('search',16)}</button><button class="btn btn-sm btn-primary" data-a="pop" data-p="add" title="Add a fix by hand (A)" style="height:30px">${ic('plus',15)}Add a fix</button></header>`;
}
function list(){
  const L=groupsList(), s=U.sel, nOpen=G0.filter(g=>opensOf(g.k).length).length;
  const item=g=>{ const E=ents(g.k), on=g.k===s, o=opensOf(g.k), cb=E.filter(e=>e.out==='cb').length;
    return `<div class="tg-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-k="${g.k}"><span class="tg-gi">${ic(SYS[g.sys][1],15)}</span><span class="tg-t"><b class="cmp">${esc(g.t)}</b><span class="fx-n">${E.length}×</span></span><span class="tg-w${cb?' late':''}">Last ${fd(E[0].date)} · ${[...new Set(E.map(e=>e.eng))].slice(0,2).join(', ')}${cb?` · ${cb} came back`:''}${g.tip&&!cb?' · worth knowing':''}</span>${o.length?`<span class="fx-open" title="${o.map(x=>x.no).join(', ')}">${o.length} open</span>`:''}</div>`; };
  let body;
  if(U.sort==='count') body=Object.keys(SYS).map(sk=>{ const X=L.filter(g=>g.sys===sk); return X.length?`<div class="tg-grp">${SYS[sk][0]}<span>${X.length}</span></div>`+X.map(item).join(''):''; }).join('');
  else body=L.map(item).join('');
  if(!L.length) body=`<div class="tg-empty"><span class="tg-ring0">${ic('book',22)}</span><h3>Nothing here</h3><p>No complaint matches.</p></div>`;
  return `<section class="tg-list"><div class="tg-lh">Complaints<span class="n">${G0.length}</span></div><div class="fx-lh2"><span class="tg-seg3">${[['count','Most fixed'],['recent','Recent'],['az','A–Z']].map(x=>`<button class="${U.sort===x[0]?'on':''}" data-a="sort" data-v="${x[0]}">${x[1]}</button>`).join('')}</span><span class="sp"></span><button class="fx-flt${U.flt?' on':''}" data-a="flt">${ic('ros',12)}On open ROs · ${nOpen}</button></div><div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('U')}use on an RO</span><span>${kbd('A')}add</span><span>${kbd('/')}search</span><span>${kbd('1')}–${kbd('3')}views</span></div></section>`;
}
function hoursStrip(st){ const mx=Math.max(st.q,...st.E.map(e=>e.h))*1.15, x=v=>(v/mx*100).toFixed(2)+'%';
  let tk=''; const step=mx>6?2:mx>3?1:0.5; for(let v=0;v<=mx;v+=step) tk+=`<span class="tk" style="left:${x(v)}">${v%1?v.toFixed(1):v}h</span>`;
  return `<div class="fx-hrs"><span class="ax"></span>${tk}<span class="q" style="left:${x(st.q)}"><em>quoted ${h1(st.q)} h</em></span>${(()=>{ const seen={}; return st.E.map(e=>{ const kk=Math.round(e.h*10/ (mx>3?2:1)), n=seen[kk]=(seen[kk]||0)+1; return [e,n-1]; }); })().map(([e,n])=>`<span class="d${e.out==='cb'?' cb':''}" style="left:${x(e.h)};top:${35-Math.min(n,2)*8}px" data-tip="RO ${e.ro} · ${h1(e.h)} h clocked|${esc(PPL[e.tech])} · ${fd(e.date)}${e.out==='cb'?' · came back':''}"></span>`).join('')}</div><div class="fx-hl"><span><i></i>one job, hours clocked</span>${st.cb?'<span><i class="cb"></i>came back</span>':''}</div>`; }
function vLib(){
  const g=grp(U.sel); if(!g) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('book',22)}</span><h3>Pick a complaint</h3><p>Every time it was fixed, and what usually works.</p></div></div>`;
  const st=stats(g.k), O=opensOf(g.k), pO=O.filter(pend);
  let h=`<div class="fx-pane" data-scroll="pane"><div class="tg-top"><div class="r1"><span class="fx-n">${st.n}× fixed</span><span>${st.trucks} trucks · ${st.engs.join(', ')} · ${SYS[g.sys][0]}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="add" data-k="${g.k}">${ic('plus',14)}Add a fix</button><button class="btn btn-sm" data-a="toast" data-t="The fix sheet prints — the usual cause and fix, parts, codes, and every time it was done.">${ic('print',14)}Print</button></div><h2>${esc(g.t)}</h2>
    <div class="fx-facts"><div><small>Usually takes</small><span class="m">${h1(st.hrs)} h<em>quoted ${h1(st.q)} h</em></span></div><div><small>Average cost</small><span class="m">${usd0(st.cost)}</span></div><div><small>Held</small><span class="${st.cb?'warn':'good'}">${st.n-st.cb} of ${st.n}${st.cb?` · ${st.cb} came back`:''}</span></div><div><small>Last fixed</small><span>${fd(st.E[0].date)}</span></div><div><small>${st.topN>1?'Fixed most by':'Fixed by'}</small><span>${st.topN>1?esc(PPL[st.top])+' · '+st.topN+'×':[...new Set(st.E.map(e=>F(e.tech)))].slice(0,3).join(', ')}</span></div></div></div><div class="fx-pad">`;
  if(O.length){ const o=pO[0]||O[0]; h+=`<div class="tg-next"><span class="k">Next</span><p>${pO.length?`<b style="font-weight:600">${o.no} ${esc(o.cust)}</b> has this complaint — in the shop now${!o.q?', no quote yet':!o.parts.length?', no parts yet':''}.${O.length>1?` ${O.length-1} more open.`:''}`:`${O.map(x=>x.no).join(', ')} already use${O.length===1?'s':''} this fix.`}</p>${pO.length?`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use on ${o.no}…${kbd('U')}</button>`:`<button class="btn btn-sm" data-a="view" data-v="open">See open ROs</button>`}</div>`; }
  if(g.tip) h+=`<div class="fx-tip">${ic('bulb',16)}<span><b>Worth knowing.</b> ${esc(g.tip)}</span></div>`;
  const c0=st.causes[0], f0=st.fixes[0];
  h+=`<div class="fx-card"><div class="fx-ch">${ic('spark',14)}<b>The usual fix</b><small>from ${st.n} times on ${st.trucks} trucks</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Copied — cause, correction and parts, ready to paste on the RO.">${ic('copy',13)}Copy</button></div>
    <div class="fx-best"><div><small class="l">Cause</small><p>${esc(c0[0])}<i>${c0[1]} of ${st.n}</i></p>${st.causes.slice(1).map(x=>`<div class="fx-alt">Also: ${esc(x[0])} <i>· ${x[1]} of ${st.n}</i></div>`).join('')}${st.codes.length?`<div class="fx-codes">${st.codes.map(x=>`<span class="fx-code">${x[0]}<small>${x[1]} of ${st.n}</small></span>`).join('')}</div>`:''}</div>
    <div><small class="l">Correction</small><p>${esc(f0[0])}<i>${f0[1]} of ${st.n}</i></p>${st.fixes.slice(1).map(x=>`<div class="fx-alt">Also: ${esc(x[0])} <i>· ${x[1]} of ${st.n}</i></div>`).join('')}</div></div>
    <div class="fx-bot"><div><small class="l" style="display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3);margin-bottom:4px">Parts used</small>${st.parts.length?st.parts.map(x=>`<div class="fx-pl"><b>${esc(x.p[1])}</b><span class="m">${x.p[0]}</span><span class="u" data-tip="${esc(x.p[1])}|Used on ${x.n} of ${st.n} jobs"><i style="width:${x.n/st.n*100}%"></i></span><span class="n">${x.n} of ${st.n} · ${ONHAND[x.p[0]]!=null?ONHAND[x.p[0]]+' on hand':'—'}</span></div>`).join(''):'<div class="fx-none" style="padding:4px 0">No parts — labor only.</div>'}</div>
    <div><small class="l" style="display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3)">Hours, every job</small>${hoursStrip(st)}</div></div></div>`;
  h+=`<div class="fx-card"><div class="fx-ch"><b>Every time it was fixed</b><small>newest first · the RO opens on the operation</small></div><div class="fx-er h"><span>Date</span><span>RO · truck</span><span>Cause</span><span>Correction</span><span>Tech · hours</span><span>Held?</span></div>${st.E.map(e=>`<div class="fx-er${e.out==='cb'?' cbrow':''}"><span class="dt">${fd(e.date).replace(', 20',' ’')}</span><span class="c"><span class="ro" data-a="toast" data-t="Opens RO-${e.ro} on this operation."><b class="tg-no">${e.ro}</b>${e.man?'<span class="fx-man">by hand</span>':''}</span><small>${esc(e.cust)}</small>${e.after?`<small style="color:var(--tg-bad)">after ${e.after} came back</small>`:''}<small>${esc(e.truck.replace('Volvo ',''))} · ${esc(e.eng)} · ${Math.round(e.miles/1000)}k mi</small></span><span class="c"><span>${esc(e.cause)}</span>${e.codes.length?`<small class="m">${e.codes.join(', ')}</small>`:''}</span><span class="c"><span>${esc(e.fix)}</span>${e.parts.length?`<small>${e.parts.map(p=>(p[2]>1?p[2]+'× ':'')+esc(p[1])+' · '+p[0]).join(' · ')}</small>`:''}</span><span class="tc"><b>${h1(e.h)} h</b>${F(e.tech)}</span><span>${e.out==='cb'?`<span class="fx-oc cb" title="Came back as RO-${e.backRo}">${ic('undo',11)}Back in ${e.back} d</span>`:dd(e.date,TODAY)<30?`<span class="fx-oc nw">Too soon to tell</span>`:`<span class="fx-oc ok">${ic('check',11)}Held</span>`}</span></div>`).join('')}</div>`;
  return h+'</div></div>';
}
function vOpen(){
  const row=o=>{ const g=grp(o.k), st=stats(o.k), same=st.E.filter(e=>e.eng===o.eng).length;
    return `<div class="fx-or"><span class="c"><b><span class="tg-no">${o.no}</span> ${esc(o.cust)}</b><small>${esc(o.truck.replace('Volvo ',''))} · ${esc(o.eng)} · ${F(o.tech)} · in ${o.in}</small></span><span class="c"><b class="lk" data-a="sel" data-k="${o.k}" data-go="1">${esc(g.t)}</b><small>${st.n} past fixes · ${same} on a ${esc(o.eng)}${g.tip?' · worth knowing':''}</small></span><span class="q">${o.q?`<b>${h1(o.q)} h</b><small>${o.from?'from RO '+o.from:'quoted'}</small>`:`<b class="none">No quote</b><small>usual ${h1(st.q)} h</small>`}</span><span class="q">${o.parts.length?`<b>${o.parts.length} part${o.parts.length>1?'s':''}</b><small>${o.from?'from the fix':'on the RO'}</small>`:`<b class="none">No parts</b><small>usual ${st.parts.length}</small>`}</span><span class="c"><span style="font-size:12.5px">${esc(st.fixes[0][0])}</span><small>${st.fixes[0][1]} of ${st.n}${st.cb?` · ${st.cb} came back`:''}</small></span><span class="ac">${pend(o)?`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use fix…</button>`:`<span class="fx-ap">${ic('check',13)}${o.from?'Used':'Set'}</span>`}</span></div>`; };
  const A=S.O.filter(pend), B=S.O.filter(o=>!pend(o));
  return `<div class="fx-full"><div class="fx-fh"><h2>Open ROs</h2><span class="tg-hf" style="cursor:default">Operations in the shop now that have been fixed before</span><span class="sp"></span></div>
   <div class="fx-sum"><span class="${A.length?'warn':''}"><b>${A.length}</b>still need a quote or parts</span><span><b>${B.length}</b>already set</span><span><b>${S.O.filter(o=>o.from).length}</b>filled from a past fix</span></div>
   <div class="fx-tbl"><div class="fx-or h"><span>RO</span><span>Complaint · past fixes</span><span>Quote</span><span>Parts</span><span>The usual fix</span><span></span></div>${A.length?`<div class="fx-tg warn">Needs a quote or parts<span>${A.length}</span></div>${A.map(row).join('')}`:''}${B.length?`<div class="fx-tg">Already set<span>${B.length}</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">a past fix filled in the quote and parts — or the writer did</span></div>${B.map(row).join('')}`:''}</div></div>`;
}
function vRev(){
  const L=S.R.filter(r=>!r.ok&&!r.done), ok=S.R.filter(r=>r.ok), dn=S.R.filter(r=>r.done);
  const G={short:['Correction just says “'+'replaced'+'”','note'],cause:['No cause written','note'],code:['No fault code','note'],dup:['Looks like an existing complaint','merge']};
  const row=r=>{ const g=grp(r.k), gp=G[r.gap];
    return `<div class="fx-rv"><span class="c"><b><span class="tg-no">${r.ro}</span> ${esc(r.cust)}</b><small>${esc(PPL[r.tech])} · ${esc(r.truck.replace('Volvo ',''))} · ${esc(r.eng)}</small></span><span class="c"><b>${esc(r.cmp)}</b><small>${r.cause?esc(r.cause):'<i>no cause</i>'} → ${esc(r.fix)}</small></span><span class="c"><span class="fx-gap${r.gap==='dup'?' dup':''}">${ic(gp[1],11)}${gp[0]}</span><small>${r.gap==='dup'?`“${esc(g.t)}” · ${ents(g.k).length}×`:r.gap==='code'?'the usual code here is '+stats(r.k).codes[0][0]:r.note?'the tech’s note has more':'—'}</small></span><span class="ac">${r.gap==='dup'?`<button class="btn btn-sm btn-primary" data-a="pop" data-p="merge" data-id="${r.id}">Merge…</button><button class="btn btn-sm tg-gh" data-a="rvok" data-id="${r.id}">Keep separate</button>`:`<button class="btn btn-sm btn-primary" data-a="pop" data-p="write" data-id="${r.id}">${r.gap==='code'?'Add the code…':'Write it up…'}</button><button class="btn btn-sm tg-gh" data-a="rvok" data-id="${r.id}">It’s fine</button>`}</span></div>`; };
  return `<div class="fx-full"><div class="fx-fh"><h2>Review</h2><span class="tg-hf" style="cursor:default">Operations finished this week land here first — a good write-up is what makes a fix findable</span><span class="sp"></span></div>
   <div class="fx-sum"><span class="${L.length?'warn':''}"><b>${L.length}</b>to look at</span><span><b>${ok.length+dn.length}</b>good to go</span></div>
   <div class="fx-tbl">${L.length?L.map(row).join(''):'<div class="fx-none">All caught up — every new fix has a cause, a correction and a code.</div>'}</div>
   ${ok.length+dn.length?`<div class="fx-tg">Good to go<span>${ok.length+dn.length}</span></div><div class="fx-tbl">${ok.concat(dn).map(r=>`<div class="fx-rv"><span class="c"><b><span class="tg-no">${r.ro}</span> ${esc(r.cust)}</b><small>${esc(PPL[r.tech])}</small></span><span class="c"><b>${esc(r.cmp)}</b><small>${esc(r.cause)} → ${esc(r.fix)}</small></span><span class="c"><span class="fx-oc ok" style="align-self:flex-start">${ic('check',11)}${r.done?'Written up':r.kept?'Kept as written':'Complete'}</span></span><span class="ac"></span></div>`).join('')}</div>`:''}</div>`;
}
/* ---------- popovers ---------- */
function pop(){
  const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const st=`style="left:400px;top:12px"`;
  if(p.type==='use'){ const o=S.O.find(x=>x.no===p.no); if(!o) return ''; const g=grp(o.k), s=stats(o.k), same=s.E.filter(e=>e.eng===o.eng), avgS=same.length?same.reduce((a,e)=>a+e.h,0)/same.length:s.hrs;
    const Q=[[s.q,'The usual quote',`quoted ${h1(s.q)} h on ${s.E.filter(e=>e.q===s.q).length} of ${s.n}`],[Math.round(avgS*10)/10,`What it took on a ${o.eng}`,`average clocked, ${same.length} job${same.length===1?'':'s'}`],[null,'Type it','your own number']];
    const sel=p.parts||(p.parts=Object.fromEntries(s.parts.filter(x=>x.n/s.n>=0.5).map(x=>[x.p[0],true])));
    const qv=p.o===2?parseFloat(p.qt)||0:p.o!=null?Q[p.o][0]:0, pc=s.parts.filter(x=>sel[x.p[0]]).reduce((a,x)=>a+x.p[2]*x.p[3],0);
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Use this fix',`${o.no} · ${esc(o.cust)}`)}<div class="fx-ctx"><b>${esc(g.t)}</b><br>${esc(o.truck)} · ${esc(o.eng)} · ${o.miles.toLocaleString()} mi · ${F(o.tech)} has it</div>
      <span class="tg-lbl top">Quote</span>${Q.map((q,i)=>`<button class="tg-chip${p.o===i?' on':''}" data-a="oset" data-o="${i}" style="margin:0 4px 4px 0">${kbd(i+1)}${q[0]!=null?h1(q[0])+' h · ':''}${q[1]}</button>`).join('')}
      ${p.o===2?`<label class="fx-f" style="margin-top:4px"><span>Hours</span><input id="fx-qt" value="${esc(p.qt||'')}" placeholder="1.2"></label>`:''}
      <span class="tg-lbl top" style="margin-top:8px">Parts</span>${s.parts.length?s.parts.map(x=>`<label class="fx-ln" data-a="pck" data-pn="${x.p[0]}"><input type="checkbox" ${sel[x.p[0]]?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.p[1])} · <span style="font-family:var(--tg-mono);font-weight:500">${x.p[0]}</span></b><small>used on ${x.n} of ${s.n} · ${ONHAND[x.p[0]]?ONHAND[x.p[0]]+' on hand':'none on hand'}</small></span><span class="r"><b>${usd(x.p[3])}</b>× ${x.p[2]}</span></label>`).join(''):'<div class="fx-none" style="padding:4px 0">Labor only.</div>'}
      ${g.tip?`<div class="fx-src">${ic('bulb',14)}<span>${esc(g.tip)}</span></div>`:''}
      <label class="fx-ck"><input type="checkbox" data-a="tel" ${p.tell!==false?'checked':''}>Show the usual cause and fix on ${F(o.tech)}’s Console</label>
      <label class="fx-ck"><input type="checkbox" data-a="tpa" ${p.toParts!==false?'checked':''}>Send the parts to Parts — it asks ${F(o.wr)} first</label>
      <div class="tg-acts"><span class="hint">${qv?h1(qv)+' h · '+usd0(qv*RATE)+' labor':'pick a quote'}${pc?' · '+usd(pc)+' parts':''}</span><button class="btn btn-sm btn-primary" data-a="ugo"${p.o==null||(p.o===2&&!(parseFloat(p.qt)>0))?' disabled':''}>Use fix${kbd('↵')}</button></div></div>`; }
  if(p.type==='write'){ const r=S.R.find(x=>x.id===p.id); if(!r) return ''; const s=stats(r.k);
    return `<div class="tg-pop xf fx-pop-x" ${st}>${hd(r.gap==='code'?'Add the fault code':'Write it up',`${r.ro} · ${esc(r.cust)}`)}<div class="fx-ctx"><b>${esc(r.cmp)}</b> · ${esc(PPL[r.tech])}</div>
      ${r.note?`<div class="fx-src"><span class="tg-av">${r.tech}</span><span><i>From ${F(r.tech)}’s punch notes</i><br>“${esc(r.note)}”</span><button class="btn btn-sm" data-a="usenote">Use it</button></div>`:''}
      <label class="fx-f"><span>Cause</span><textarea id="fx-c" rows="2" placeholder="What was found">${esc(p.c!=null?p.c:r.cause)}</textarea></label>
      <label class="fx-f"><span>Correction</span><textarea id="fx-x" rows="2" placeholder="What fixed it">${esc(p.x!=null?p.x:r.fix)}</textarea></label>
      <label class="fx-f"><span>Fault code</span><input id="fx-cd" value="${esc(p.cd!=null?p.cd:'')}" placeholder="${s.codes.length?s.codes[0][0]+' — the usual one':'none'}"></label>
      <div class="tg-acts"><span class="hint">It joins “${esc(grp(r.k).t)}” · ${ents(r.k).length}×</span><button class="btn btn-sm btn-primary" data-a="wgo">Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='merge'){ const r=S.R.find(x=>x.id===p.id); if(!r) return ''; const C=[r.k].concat(G0.filter(g=>g.k!==r.k&&g.sys===grp(r.k).sys).map(g=>g.k)).slice(0,3);
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Merge into…',`${r.ro}`)}<div class="fx-ctx">“<b>${esc(r.cmp)}</b>” — the same job, worded differently. Merged, it counts with the others and shows up when someone searches either way.</div>
      ${C.map((k,i)=>`<button class="tg-mi${(p.k||C[0])===k?' on':''}" data-a="mset" data-k="${k}" style="height:auto;min-height:38px;padding:6px 10px !important">${kbd(i+1)}<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(grp(k).t)}</span><span class="meta">${ents(k).length}×</span></button>`).join('')}
      <label class="fx-ck"><input type="checkbox" checked disabled>Keep “${esc(r.cmp.split(' — ').slice(-1)[0])}” as a search word</label>
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="mgo">Merge${kbd('↵')}</button></div></div>`; }
  if(p.type==='add'){ const d=p.d||(p.d={cmp:p.k?grp(p.k).t:'',c:'',x:'',eng:'',cd:'',pn:''}); const q=d.cmp.trim().toLowerCase(); const m=q&&!G0.some(g=>g.t.toLowerCase()===q)?G0.filter(g=>q.split(/\s+/).filter(w=>w.length>3).some(w=>g.t.toLowerCase().includes(w))).slice(0,2):[];
    return `<div class="tg-pop xf fx-pop-x" ${st}>${hd('Add a fix by hand','work done before Parsec')}
      <label class="fx-f" style="margin-top:0"><span>Complaint</span><input id="fx-acmp" value="${esc(d.cmp)}" placeholder="e.g. Coolant leak at water pump" autocomplete="off"></label>
      ${m.length?`<div class="fx-hint">${ic('merge',13)}Same as ${m.map(g=>`<button class="tg-chip" data-a="apick" data-k="${g.k}" style="height:22px">${esc(g.t)} · ${ents(g.k).length}×</button>`).join(' ')}?</div>`:''}
      <div class="fx-two"><label class="fx-f"><span>Cause</span><textarea id="fx-ac" rows="3" placeholder="What was found">${esc(d.c)}</textarea></label><label class="fx-f"><span>Correction</span><textarea id="fx-ax" rows="3" placeholder="What fixed it">${esc(d.x)}</textarea></label></div>
      <div class="fx-three"><label class="fx-f"><span>Engine</span><input id="fx-aeng" value="${esc(d.eng)}" placeholder="D13"></label><label class="fx-f"><span>Fault code</span><input id="fx-acd" value="${esc(d.cd)}" placeholder="SPN 641 FMI 7"></label><label class="fx-f"><span>Part #s</span><input id="fx-apn" value="${esc(d.pn)}" placeholder="22972342"></label></div>
      <div class="tg-acts"><span class="hint">Finished operations land here by themselves</span><button class="btn btn-sm btn-primary" data-a="ago">Save fix${kbd('↵')}</button></div></div>`; }
  if(p.type==='srch'){ const q=(p.q||'').trim().toLowerCase(), R=[];
    if(q){ G0.forEach(g=>{ const E=ents(g.k); const hit=[]; const W=q.split(/\s+/);
      const look=(lbl,s)=>{ if(W.every(w=>String(s).toLowerCase().includes(w))) hit.push([lbl,s]); };
      look('Complaint',g.t); E.forEach(e=>{ look('Cause',e.cause); look('Correction',e.fix); e.codes.forEach(c=>look('Code',c)); e.parts.forEach(pp=>look('Part',pp[0]+' '+pp[1])); look('VIN',e.vin); look('RO',e.ro); });
      if(hit.length) R.push({g,h:hit[0],n:hit.length}); }); }
    const mk=(s,q)=>{ const i=s.toLowerCase().indexOf(q.split(/\s+/)[0]); return i<0?esc(s):esc(s.slice(0,i))+'<mark>'+esc(s.slice(i,i+q.split(/\s+/)[0].length))+'</mark>'+esc(s.slice(i+q.split(/\s+/)[0].length)); };
    return `<div class="tg-pop menu fx-pop-w" ${st}><div class="fx-srin">${ic('search',15)}<input id="fx-sq" placeholder="Complaint, cause, SPN code, part # or VIN" value="${esc(p.q||'')}" autocomplete="off"></div>${q?(R.length?R.slice(0,7).map((x,i)=>`<button class="fx-srr${i===0?' k':''}" data-a="sel" data-k="${x.g.k}" data-go="1"><span class="gi">${ic(SYS[x.g.sys][1],14)}</span><b>${esc(x.g.t)}</b><span class="m">${ents(x.g.k).length}×</span><small>${x.h[0]}: ${mk(x.h[1],q)}</small></button>`).join(''):`<div class="fx-none">Nothing matches “${esc(p.q)}”. Try a part number, a code, or fewer words.</div>`):'<div class="fx-none">Try “SPN 641”, “22972342”, “connector” or a VIN.</div>'}</div>`; }
  return '';
}
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='sel'){ U.sel=t.dataset.k; U.kb=false; U.pop=null; if(t.dataset.go){ U.view='lib'; if(U.flt&&!opensOf(U.sel).length) U.flt=false; } render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='sort'){ U.sort=t.dataset.v; render(); }
  else if(a==='flt'){ U.flt=!U.flt; if(U.flt&&!opensOf(U.sel).length){ const g=groupsList()[0]; if(g) U.sel=g.k; } render(); }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p&&!t.dataset.no&&!t.dataset.id){ U.pop=null; render(); return; } const ex={}; if(t.dataset.no) ex.no=t.dataset.no; if(t.dataset.id) ex.id=t.dataset.id; if(t.dataset.k) ex.k=t.dataset.k; if(t.dataset.p==='use') ex.tell=true; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='oset'){ p.o=+t.dataset.o; render(); if(p.o===2) $('#fx-qt')?.focus(); }
  else if(a==='pck'){ e.preventDefault(); p.parts[t.dataset.pn]=!p.parts[t.dataset.pn]; render(); }
  else if(a==='tel'){ p.tell=t.checked; }
  else if(a==='tpa'){ p.toParts=t.checked; }
  else if(a==='ugo'){ const o=S.O.find(x=>x.no===p.no), s=stats(o.k), same=s.E.filter(e=>e.eng===o.eng); if(p.o==null) return; snap();
    const qv=p.o===2?parseFloat(p.qt):p.o===0?s.q:Math.round((same.length?same.reduce((a,e)=>a+e.h,0)/same.length:s.hrs)*10)/10;
    o.q=qv; o.parts=Object.keys(p.parts).filter(k=>p.parts[k]); o.from=s.E[0].ro; U.pop=null;
    toast(`Used on ${o.no} — ${h1(qv)} h quoted${o.parts.length?`, ${o.parts.length} part${o.parts.length>1?'s':''} on the RO${p.toParts!==false?' (Parts is asked)':''}`:''}${p.tell!==false?`. ${F(o.tech)} sees the usual fix on the Console.`:'.'}`); render(); }
  else if(a==='usenote'){ const r=S.R.find(x=>x.id===p.id); if(r.noteCause) p.c=r.noteCause; if(r.noteFix) p.x=r.noteFix; render(); }
  else if(a==='wgo'){ const r=S.R.find(x=>x.id===p.id); snap(); const c=(($('#fx-c')||{}).value||'').trim(), x=(($('#fx-x')||{}).value||'').trim(), cd=(($('#fx-cd')||{}).value||'').trim();
    r.cause=c||r.cause; r.fix=x||r.fix; r.done=1; S.M.push({id:'m'+r.id,k:r.k,date:TODAY,ro:r.ro,cust:r.cust,truck:r.truck,eng:r.eng,miles:300000,vin:'…new',cause:r.cause,fix:r.fix,parts:grp(r.k).V[0].parts,codes:cd?[cd]:(grp(r.k).V[0].codes),tech:r.tech,h:grp(r.k).V[0].q,q:grp(r.k).V[0].q,cost:0,out:'ok'});
    U.pop=null; toast(`Written up — it joins “${grp(r.k).t}”, now ${ents(r.k).length}×.`); render(); }
  else if(a==='mset'){ p.k=t.dataset.k; render(); }
  else if(a==='mgo'){ const r=S.R.find(x=>x.id===p.id), k=p.k||r.k; snap(); r.done=1; r.k=k; S.M.push({id:'m'+r.id,k,date:TODAY,ro:r.ro,cust:r.cust,truck:r.truck,eng:r.eng,miles:300000,vin:'…new',cause:r.cause,fix:r.fix,parts:grp(k).V[0].parts,codes:grp(k).V[0].codes,tech:r.tech,h:grp(k).V[0].q,q:grp(k).V[0].q,cost:0,out:'ok'}); U.pop=null; toast(`Merged into “${grp(k).t}” — now ${ents(k).length}×.`); render(); }
  else if(a==='rvok'){ const r=S.R.find(x=>x.id===t.dataset.id); snap(); r.ok=1; r.kept=1; toast(`${r.ro} kept as written.`); render(); }
  else if(a==='apick'){ p.d.cmp=grp(t.dataset.k).t; p.k=t.dataset.k; render(); }
  else if(a==='ago'){ const d=p.d; d.cmp=(($('#fx-acmp')||{}).value||'').trim(); d.c=(($('#fx-ac')||{}).value||'').trim(); d.x=(($('#fx-ax')||{}).value||'').trim();
    if(!d.cmp||!(d.c||d.x)){ toast(!d.cmp?'Add the complaint.':'Add the cause, the correction, or both.',false); render(); return; }
    const g=G0.find(x=>x.t.toLowerCase()===d.cmp.toLowerCase()); if(!g){ toast('In the mock-up, pick one of the existing complaints — a new one would start its own group.',false); render(); return; }
    snap(); S.M.push({id:'mh'+Date.now(),k:g.k,date:TODAY,ro:'—',man:1,cust:'Added by hand',truck:'—',eng:(($('#fx-aeng')||{}).value||'—'),miles:0,vin:'',cause:d.c||'—',fix:d.x||'—',parts:[],codes:(($('#fx-acd')||{}).value||'').trim()?[(($('#fx-acd')||{}).value||'').trim()]:[],tech:'MR',h:g.V[0].q,q:g.V[0].q,cost:0,out:'ok'});
    U.pop=null; U.view='lib'; U.sel=g.k; toast(`Fix added to “${g.t}” — now ${ents(g.k).length}×.`); render(); }
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('input',e=>{ const p=U.pop, id=e.target.id; if(!p) return;
  if(id==='fx-qt'){ p.qt=e.target.value; const b=$('.tg-pop [data-a="ugo"]'); if(b) b.disabled=!(parseFloat(p.qt)>0); const h=$('.tg-pop .hint'); if(h&&parseFloat(p.qt)>0) h.textContent=h1(parseFloat(p.qt))+' h · '+usd0(parseFloat(p.qt)*RATE)+' labor'; }
  if(id==='fx-c') p.c=e.target.value; if(id==='fx-x') p.x=e.target.value; if(id==='fx-cd') p.cd=e.target.value;
  if(id==='fx-sq'||id==='fx-acmp'){ if(id==='fx-sq') p.q=e.target.value; else p.d.cmp=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#'+id); if(f){ f.focus(); f.setSelectionRange(pos,pos); } }
  if(id==='fx-ac') p.d.c=e.target.value; if(id==='fx-ax') p.d.x=e.target.value; if(id==='fx-aeng') p.d.eng=e.target.value; if(id==='fx-acd') p.d.cd=e.target.value; if(id==='fx-apn') p.d.pn=e.target.value; });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.fx').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-290)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"]')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; U.view='lib'; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'&&e.target.id==='fx-sq'){ const b=$('.tg-pop .fx-srr'); if(b) b.click(); return stop(); }
    if(k==='Enter'&&e.target.tagName==='TEXTAREA') return;
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(inF) return; const n=+k; if(n>=1&&n<=3){ const b=$(`.tg-pop [data-a="oset"][data-o="${n-1}"]`)||$$('.tg-pop [data-a="mset"]')[n-1]; if(b){ b.click(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='u'){ const b=$('.tg-next [data-p="use"]'); if(b) openPop('use',{no:b.dataset.no,tell:true},b); return stop(); }
  if(k==='a'){ const b=$('[data-a="pop"][data-p="add"]'); if(b) openPop('add',{},b); return stop(); }
  if(k==='/'){ const b=$('[data-a="pop"][data-p="srch"]'); if(b) openPop('srch',{},b); return stop(); }
  if(k>='1'&&k<='3'){ U.view=['lib','open','rev'][+k-1]; render(); return stop(); }
});
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); }
    else { x=W-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #fx-sq')||$('.tg-pop #fx-acmp'); if(f){ U.pop._f=1; f.focus(); } }
}
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  lib:()=>{reset();render();},
  usual:()=>{reset();U.sel='cts';render();},
  use:()=>{reset();render();const b=$('.tg-next [data-p="use"]');openPop('use',{no:b.dataset.no,tell:true,o:0},b);},
  open:()=>{reset();U.view='open';render();},
  rev:()=>{reset();U.view='rev';render();const b=$('[data-a="pop"][data-p="write"][data-id="r2"]');openPop('write',{id:'r2'},b);},
  add:()=>{reset();U.sel='turbo';render();const b=$('[data-a="pop"][data-p="add"]');openPop('add',{d:{cmp:'Turbo actuator low boost',c:'',x:'',eng:'',cd:'',pn:''}},b);},
  srch:()=>{reset();render();const b=$('[data-a="pop"][data-p="srch"]');openPop('srch',{q:'SPN 641'},b);}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__fx={S:()=>S,U:()=>U,render,reset,openPop,DEMO,stats,ents};
reset(); render();
"""
used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "filter", "engine", "drop", "bolt", "air", "snow", "gear2", "book", "note", "merge"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("lib", "1 · Library"), ("usual", "2 · The usual fix"), ("use", "3 · Use on an open RO"), ("open", "4 · Open ROs"), ("rev", "5 · Review"), ("add", "6 · Add by hand"), ("srch", "7 · Search by code")])
about = [
 ("Same panel as the other pages", "Header facts, view tabs (Library · Open ROs · Review), the complaints on the left, the fix on the right, a Next bar with the one thing to do."),
 ("The usual fix", "The most common cause and correction, with the other ways it was fixed, parts used, fault codes, hours on every job, and whether each fix held."),
 ("Worth knowing", "When a complaint has been fixed more than one way, or a fix came back, it says what to check first."),
 ("Open ROs", "Trucks in the shop with a complaint that's been fixed before — use the fix to fill the quote and parts, and show it on the tech's Console."),
 ("Review", "New fixes land here first; write them up from the tech's notes, add the code, or merge duplicates so they're findable."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Fixes mock-up</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Fixes — first mock-up</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Fixes<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
