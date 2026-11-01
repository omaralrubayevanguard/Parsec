# Warranty page mock-up — group 1: the same layout as Triage and Foreman (Parsec design system, Ivory + Graphite).
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
 "pin": '<path d="M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z"/><circle cx="12" cy="10.25" r="2.25"/>',
 "flag": '<path d="M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6"/>',
 "file": '<path d="M7 3.75h6.5L18 8.25V19a1.25 1.25 0 0 1-1.25 1.25h-9.5A1.25 1.25 0 0 1 6 19V5a1.25 1.25 0 0 1 1-1.25z"/><path d="M13.25 3.75V8.5H18M9 12.5h6M9 16h6"/>',
 "undo": '<path d="M9 7.5 4.5 12 9 16.5"/><path d="M4.5 12h10a5 5 0 0 1 0 10h-2"/>',
 "dollar": '<path d="M12 3.75v16.5M16 7.5c-.6-1.5-2.1-2.25-4-2.25-2.35 0-4 1.2-4 3s1.6 2.5 4 3 4 1.25 4 3.1-1.8 3.15-4 3.15c-2 0-3.6-.85-4.25-2.5"/>',
 "board": '<rect x="3.75" y="4.5" width="4.5" height="15" rx="1.25"/><rect x="9.75" y="4.5" width="4.5" height="10" rx="1.25"/><rect x="15.75" y="4.5" width="4.5" height="12.5" rx="1.25"/>',
 "claim": '<path d="M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z"/><path d="M8.9 12.1l2.2 2.2 4.1-4.4"/>',
 "send": '<path d="M4 12 20 4.5 15.5 20l-3.25-6.75z"/><path d="M12.25 13.25 20 4.5"/>',
 "phone": '<path d="M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z"/>',
 "info": '<circle cx="12" cy="12" r="8.25"/><path d="M12 11v5M12 8v.01"/>',
 "inbox2": '<path d="M3.75 13.5h4.5l1.5 2.25h4.5l1.5-2.25h4.5"/><path d="M5.6 6.2 3.75 13.5v5.25h16.5V13.5L18.4 6.2a1.5 1.5 0 0 0-1.45-1.2H7.05A1.5 1.5 0 0 0 5.6 6.2z"/>',
})

CSS = shell + r"""
.tg-panel > .tg{height:100%;min-height:0;box-shadow:none;border-radius:0;}
.tg-rail a.is-on{background:var(--selected);color:var(--ink);}
.rl-badge{right:-2px;}
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
.wx .tg-it .tg-t .tg-spot{display:inline-flex;}
.wx-amt{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);white-space:nowrap;}

/* ---------- claim chips ---------- */
.wx-c{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:500;white-space:nowrap;background:var(--tg-fill);color:var(--tg-ink2);}
.wx-c i{width:6px;height:6px;border-radius:50%;background:currentColor;}
.wx-c.repair{color:var(--tg-ink3);}
.wx-c.ready{background:var(--tg-acct);color:var(--tg-acctx);}
.wx-c.subm{background:color-mix(in srgb,var(--tg-st-support) 12%,transparent);color:var(--tg-st-support);}
.wx-c.back{background:var(--tg-bad-t);color:var(--tg-bad);}
.wx-c.ok{background:color-mix(in srgb,var(--tg-st-customer) 12%,transparent);color:var(--tg-st-customer);}
.wx-c.paid{background:var(--tg-good-t);color:var(--tg-good);}
.wx-c.den{background:var(--tg-fill);color:var(--tg-bad);}
.wx-jt{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 10.5px/1 var(--tg-mono);letter-spacing:.03em;background:var(--tg-warn-t);color:var(--tg-warn);}
.wx-jt.recall{background:color-mix(in srgb,var(--tg-st-customer) 12%,transparent);color:var(--tg-st-customer);}

/* ---------- Claims view ---------- */
.wx-cl{height:100%;overflow:auto;scrollbar-width:thin;display:flex;flex-direction:column;}
.wx-cl > .tg-top{position:sticky;top:0;z-index:3;background:var(--tg-panel);}
.wx-trk{position:relative;display:grid;grid-template-columns:repeat(5,1fr);align-items:start;margin:4px 0 0;}
.wx-trk .ln{position:absolute;left:10%;right:10%;top:8px;height:2px;background:var(--tg-hair);}
.wx-trk .ln i{position:absolute;left:0;top:0;bottom:0;background:var(--tg-ink);}
.wx-stp{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:var(--tg-ink4);}
.wx-stp .d{width:18px;height:18px;border-radius:50%;background:var(--tg-panel);box-shadow:inset 0 0 0 1.5px var(--tg-border);display:grid;place-items:center;color:var(--tg-onprimary);}
.wx-stp.done{color:var(--tg-ink2);} .wx-stp.done .d{background:var(--tg-ink);box-shadow:none;}
.wx-stp.cur{color:var(--tg-ink);font-weight:600;} .wx-stp.cur .d{background:var(--tg-panel);box-shadow:inset 0 0 0 5px var(--tg-ink);}
.wx-stp.back{color:var(--tg-bad);font-weight:600;} .wx-stp.back .d{background:var(--tg-bad);box-shadow:none;}
.wx-stp.den{color:var(--tg-bad);font-weight:600;} .wx-stp.den .d{background:var(--tg-bad);box-shadow:none;}
.wx-stp.paid .d{background:var(--tg-good);box-shadow:none;} .wx-stp.paid{color:var(--tg-good);font-weight:600;}
.wx-sum{display:flex;align-items:center;gap:22px;}
.wx-sum .wx-trk{flex:1;min-width:0;}
.wx-money{flex:none;text-align:right;}
.wx-money small{display:block;font-size:11.5px;color:var(--tg-ink3);}
.wx-money b{font:500 22px/28px var(--tg-serif);letter-spacing:-.01em;}
.wx-facts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px 16px;}
.wx-facts div{min-width:0;}
.wx-facts small{display:block;font-size:11.5px;color:var(--tg-ink3);}
.wx-facts span{display:block;font:500 12.5px/18px var(--tg-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink);}
.wx-facts span.s{font-family:var(--tg-sans);font-size:13px;}
.wx-facts i{font-style:normal;color:var(--tg-ink4);}
.wx-pad{padding:16px 28px 28px;display:flex;flex-direction:column;gap:12px;}
.wx-note{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:18px;color:var(--tg-ink3);}
.wx-note .tg-ic{flex:none;margin-top:1px;}
.wx-op{border-radius:16px;box-shadow:inset 0 0 0 1px var(--tg-hair);background:var(--tg-raised);overflow:hidden;}
.wx-op.hl{box-shadow:inset 0 0 0 1.5px var(--tg-bad);}
.wx-op.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.wx-oph{display:flex;align-items:center;gap:8px;padding:12px 16px;box-shadow:inset 0 -1px 0 var(--tg-hair);}
.wx-oph .n{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);}
.wx-oph h3{margin:0;font-size:14.5px;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-oph .os{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--tg-ink2);white-space:nowrap;}
.wx-opb{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);}
.wx-opb > div{padding:14px 16px;min-width:0;}
.wx-opb > div + div{box-shadow:inset 1px 0 0 var(--tg-hair);background:var(--tg-panel);}
.wx-k{display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3);margin:0 0 4px;}
.wx-story{display:grid;grid-template-columns:90px minmax(0,1fr);gap:6px 12px;font-size:13px;line-height:19px;margin-bottom:12px;}
.wx-story dt{color:var(--tg-ink3);font-size:12px;line-height:19px;}
.wx-story dd{margin:0;color:var(--tg-ink);}
.wx-story dd.miss{color:var(--tg-warn);font-style:italic;}
.wx-pts{display:flex;flex-direction:column;gap:2px;margin-bottom:10px;}
.wx-pt{display:grid;grid-template-columns:16px minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;font-size:12.5px;cursor:pointer;}
.wx-pt:hover{background:var(--tg-fill);}
.wx-pt.on{background:var(--tg-acct);}
.wx-pt .r{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--tg-border);}
.wx-pt.on .r{box-shadow:inset 0 0 0 4px var(--tg-acc);}
.wx-pt .d{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-pt .d em{font-style:normal;font-size:10.5px;font-weight:600;color:var(--tg-acctx);margin-left:6px;letter-spacing:.02em;}
.wx-pt .pn,.wx-pt .q{font:500 11.5px/1 var(--tg-mono);color:var(--tg-ink3);white-space:nowrap;}
.wx-lab{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--tg-ink3);}
.wx-lab b{font:500 12px/1 var(--tg-mono);color:var(--tg-ink);}
.wx-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.wx-f{display:flex;flex-direction:column;gap:4px;font-size:11.5px;color:var(--tg-ink3);}
.wx-f.w{grid-column:1 / -1;}
.wx-f input,.wx-f textarea{all:unset;box-sizing:border-box;width:100%;min-height:32px;padding:7px 9px;border-radius:8px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-border);font:500 13px/18px var(--tg-mono);color:var(--tg-ink);}
.wx-f textarea{font-family:var(--tg-sans);font-weight:400;min-height:52px;white-space:pre-wrap;}
.wx-f input::placeholder,.wx-f textarea::placeholder{color:var(--tg-ink4);font-weight:400;}
.wx-f input:focus,.wx-f textarea:focus{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.wx-f.bad input{box-shadow:inset 0 0 0 1.5px var(--tg-bad);background:var(--tg-bad-t);font-family:var(--tg-sans);font-weight:400;}
.wx-chk{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 12px;}
.wx-ck{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 7px;border-radius:6px;font-size:11.5px;background:var(--tg-fill);color:var(--tg-ink2);}
.wx-ck.no{background:var(--tg-warn-t);color:var(--tg-warn);font-weight:500;}
.wx-ck.ok .tg-ic{color:var(--tg-good);}
.wx-acts{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.wx-acts .sp{flex:1;}
.wx-acts .btn.bad{color:var(--tg-bad);}
.wx-hist{display:flex;flex-wrap:wrap;gap:4px 14px;padding:9px 16px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:11.5px;color:var(--tg-ink3);}
.wx-hist b{color:var(--tg-ink2);font-weight:500;}

/* ---------- Board view ---------- */
.wx-bv{height:100%;display:flex;flex-direction:column;min-height:0;}
.wx-bd{flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;padding:16px 20px 18px;overflow:hidden;}
.wx-col{display:flex;flex-direction:column;min-height:0;border-radius:14px;background:var(--tg-canvas);}
.wx-ch{display:flex;align-items:baseline;gap:6px;padding:11px 12px 8px;font-size:13px;font-weight:600;}
.wx-ch .n{font-weight:400;color:var(--tg-ink3);font-size:12px;}
.wx-ch .m{margin-left:auto;font:500 11.5px/1 var(--tg-mono);color:var(--tg-ink3);}
.wx-cs{flex:1;min-height:0;overflow:auto;padding:0 8px 10px;display:flex;flex-direction:column;gap:6px;scrollbar-width:thin;}
.wx-cd{position:relative;display:flex;flex-direction:column;gap:4px;padding:9px 10px 10px;border-radius:10px;background:var(--tg-raised);box-shadow:0 0 0 1px var(--tg-hair),0 1px 3px -2px rgba(0,0,0,.12);cursor:pointer;font-size:12.5px;}
.wx-cd:hover{box-shadow:0 0 0 1px var(--tg-bs);}
.wx-cd.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.wx-cd .r1{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--tg-ink3);}
.wx-cd .r1 .tg-no{font-size:12px;color:var(--tg-ink);}
.wx-cd .r1 .sp{flex:1;}
.wx-cd .cu{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-cd .op{color:var(--tg-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-cd .r3{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;}
.wx-cd .r3 > span:first-child{overflow:hidden;text-overflow:ellipsis;min-width:0;}
.wx-cd .r3 .sp{flex:1;}
.wx-cd .r3 .late{color:var(--tg-warn);font-weight:500;}
.wx-cd .tg-dot{position:absolute;left:-3px;top:13px;}
.wx-col .empty{font-size:12px;color:var(--tg-ink4);padding:4px 6px;}
.wx-col.paid .wx-cd{opacity:.85;}

/* ---------- popovers ---------- */
.wx-ctx{margin:-2px 0 10px;padding:9px 11px;border-radius:10px;background:var(--tg-canvas);font-size:12.5px;line-height:18px;color:var(--tg-ink2);}
.wx-ctx b{color:var(--tg-ink);font-weight:500;}
.wx-ctx q{font-style:italic;} .wx-ctx q::before{content:"“";} .wx-ctx q::after{content:"”";}
.wx-sumg{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:12.5px;margin:0 0 10px;}
.wx-sumg dt{color:var(--tg-ink3);} .wx-sumg dd{margin:0;font:500 12.5px/18px var(--tg-mono);}
.tg-pop .wx-f{margin-bottom:8px;}
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
const usd=n=>'$'+(Math.round(n*100)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=n=>'$'+Math.round(n).toLocaleString('en-US');
/* today is Thu Oct 22, 10:15 — ages are in days (a = days ago, fractions are hours) */
const DAYN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const when=a=>{ if(a<1){ const h=Math.round(a*24); return h<1?'just now':h+' h ago'; } const d=new Date(2026,9,22); d.setDate(d.getDate()-Math.round(a)); return Math.round(a)===1?'yesterday':Math.round(a)<7?DAYN[d.getDay()]:(d.getMonth()+1)+'/'+d.getDate(); };
const ago=a=>a<1?Math.max(1,Math.round(a*24))+' h':Math.round(a)+' d';
const TECH={MR:'Mike Rodriguez',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
const TF=k=>(TECH[k]||k).split(' ')[0];
const DESK={tech:['TE','Technician'],writer:['AP','Approval','Dana Kowalski'],parts:['PT','Parts','Ben Okafor'],foreman:['FM','Foreman','Ray Owens'],manager:['MG','Manager','Tom Hayes'],warranty:['WA','Warranty','you']};
const WHY={tech:['Write the cause','Write the correction','Photo of the causal part'],writer:['Bill the customer','Customer pays instead'],parts:['Send the failed part back','Check a part number'],foreman:['Second opinion','Labor over SRT'],manager:['Goodwill request','Write-off sign-off']};
const STL={repair:'In repair',ready:'Ready to file',submitted:'Submitted',returned:'Returned',approved:'Approved',paid:'Paid',denied:'Denied'};
const STC={repair:'repair',ready:'ready',submitted:'subm',returned:'back',approved:'ok',paid:'paid',denied:'den'};
const RANK={returned:0,ready:1,repair:2,submitted:3,approved:4,denied:5,paid:6};
const STAGE={repair:0,ready:1,submitted:2,returned:2,approved:3,paid:4,denied:4};
const op=(o)=>Object.assign({kind:'WARR',cause:'',fix:'',parts:[],causal:0,q:0,b:0,cost:0,done:null,claim:{},hist:[]},o);
const R0=[
 {no:'37701',cust:'Triad Cold Chain',unit:'T-412',truck:'2021 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH7MN281460',mi:'212,400',eh:'6,118',ws:'03-02-2021',cs:'C-8301',tech:'AW',opened:3,spot:'Lot B2',
  sent:{by:'Close-out rule',at:0.13,why:'Warranty work',note:'Close-out done · warranty work. Andre finished the alternator yesterday.'},
  ops:[op({cmp:'Alternator not charging — 12.1 V at idle',cause:'Rectifier failed internally; no output above 12.2 V.',fix:'Replaced alternator, verified 14.1 V charging at idle and 1,500 rpm.',parts:[['Alternator 24V 130A','23175123',1,512.00,'Installed']],q:1.6,b:1.5,cost:827.00,done:1.1,st:'ready',claim:{code:'SPN 167 FMI 1'}})]},
 {no:'37455',cust:'Highplains Grain',unit:'T-948',truck:'2018 Volvo VNL 670',eng:'D16 550HP',vin:'4V4NC9EH4JN956042',mi:'646,000',eh:'15,961',ws:'',cs:'C-8256',tech:'PS',opened:13,spot:'Lot D4',cust2:['Driver side mirror broken','Wheel seal leaking — drive axle'],
  ops:[op({cmp:'Coolant leak at water pump',cause:'Weep hole wet, bearing play at the pulley.',fix:'Replaced water pump and gasket, refilled and bled, pressure test held 15 psi.',parts:[['Water pump','21468475',1,412.00,'Installed'],['Water pump gasket','20734235',1,18.90,'Installed'],['Coolant VCS (gal)','VCS-1G',3,24.50,'Installed']],q:3.0,b:3.3,cost:1134.40,done:9,st:'returned',
   claim:{no:'W2627315',code:'',hrs:'3.3',amt:'1217.22',why:'Causal part photo missing, and labor is over the SRT — add the tech support case.',at:3},hist:[[8,'submitted','You'],[3,'returned','Volvo']]})]},
 {no:'37612',cust:'Midway Auto Transport',unit:'T-305',truck:'2020 Volvo VNR 640',eng:'D13 455HP',vin:'4V4WC9EH0LN224817',mi:'338,900',eh:'9,402',ws:'06-18-2020',cs:'C-8277',tech:'LM',opened:9,spot:'Lot D1',
  ops:[op({cmp:'Wheel seal leaking — drive axle, left rear',cause:'Seal lip torn; hub oil contaminated the brake shoes.',fix:'Replaced wheel seal and both shoes on that end, refilled hub, checked end play.',parts:[['Wheel seal','85137214',1,79.90,'Installed'],['Brake shoe kit','85128891',1,186.40,'Installed']],q:2.4,b:2.6,cost:812.30,done:6,st:'ready',claim:{code:''}})]},
 {no:'37502',cust:'Piedmont Aggregates',unit:'T-221',truck:'2022 Volvo VNL 860',eng:'D13 TC 500HP',vin:'4V4NC9EJ1NN301125',mi:'141,700',eh:'4,013',ws:'11-09-2021',cs:'C-8310',tech:'MR',opened:4,spot:'Lot D6',
  ops:[op({cmp:'Check engine light — outlet NOx sensor',cause:'Outlet NOx sensor reading flat; heater circuit open.',fix:'Replaced outlet NOx sensor, cleared codes, ran a parked regen — no return.',parts:[['NOx sensor, outlet','22827993',1,684.10,'Installed']],q:1.0,b:0.9,cost:893.60,done:1,st:'ready',claim:{code:'SPN 3226 FMI 2'}})]},
 {no:'37590',cust:'Silverline LTL',unit:'T-588',truck:'2021 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH2MN277019',mi:'263,500',eh:'7,731',ws:'01-25-2021',cs:'C-8219',tech:'MR',opened:16,spot:'Released',
  ops:[op({kind:'WARR',cmp:'DPF regen fault — soot load high, SPN 3719',cause:'DPF pressure sensor line cracked; false soot load.',fix:'Diagnosed with Tech Tool, smoke-tested lines.',q:1.5,b:1.4,cost:294.00,done:14,st:'approved',claim:{no:'W2624409',code:'SPN 3719 FMI 16',hrs:'1.4',amt:'294.00',at:3},hist:[[13,'submitted','You'],[3,'approved','Volvo']]}),
       op({cmp:'Clean DPF and replace DPF pressure sensor',cause:'Ash load at service limit; sensor line cracked.',fix:'Cleaned DPF on the machine, replaced sensor and line, forced regen.',parts:[['DPF pressure sensor','22303390',1,212.60,'Installed'],['Sensor line','21994377',1,38.20,'Installed']],q:3.5,b:3.4,cost:1103.71,done:13,st:'submitted',claim:{no:'W2624410',code:'SPN 3251 FMI 2',hrs:'3.4',amt:'1103.71',at:9},hist:[[9,'submitted','You']]})]},
 {no:'37388',cust:'Elkin Hardwoods',unit:'T-117',truck:'2020 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH5LN219934',mi:'402,100',eh:'11,880',ws:'02-14-2020',cs:'C-8174',tech:'KT',opened:22,spot:'Released',
  ops:[op({cmp:'DEF doser clogged — derate',cause:'Doser tip crystallized, flow test failed.',fix:'Replaced DEF doser, flow tested, cleared derate.',parts:[['DEF doser','23380146',1,618.00,'Installed']],q:1.8,b:1.9,cost:942.55,done:18,st:'submitted',claim:{no:'W2619980',code:'SPN 5394 FMI 5',hrs:'1.9',amt:'942.55',at:16},hist:[[16,'submitted','You']]})]},
 {no:'37466',cust:'Uwharrie Fuel',unit:'T-090',truck:'2019 Volvo VNL 860',eng:'D13 500HP',vin:'4V4NC9EJ8KN198812',mi:'488,300',eh:'13,215',ws:'08-30-2019',cs:'C-8150',tech:'PS',opened:26,spot:'Released',
  ops:[op({cmp:'Misfire cylinder 4 — injector',cause:'Injector 4 balance rate out of range.',fix:'Replaced injector 4, ran cylinder cut-out test, cleared codes.',parts:[['Injector','85020422',1,1180.00,'Installed'],['Injector seal kit','22479128',1,46.00,'Installed']],q:3.2,b:3.0,cost:2140.00,done:24,st:'approved',claim:{no:'W2621417',code:'SPN 654 FMI 5',hrs:'3.0',amt:'2140.00',at:12},hist:[[22,'submitted','You'],[12,'approved','Volvo']]})]},
 {no:'37011',cust:'Red Mesa Hauling',unit:'T-501',truck:'2022 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH6NN290344',mi:'118,200',eh:'3,377',ws:'04-04-2022',cs:'C-9129',tech:'PS',opened:2,spot:'B8',
  ops:[op({kind:'RECALL',cmp:'Recall 24V-118 — EGR cooler inspection',cause:'Recall inspection: seepage at the cooler outlet.',fix:'',parts:[['EGR cooler gasket','23199543',1,58.40,'Received']],q:1.0,b:0.3,cost:268.40,st:'repair'})]},
 {no:'37628',cust:'Prairie Line Trucking',unit:'T-733',truck:'2021 Volvo VNR 640',eng:'D11 425HP',vin:'4V4WC9EG3MN266051',mi:'190,600',eh:'5,540',ws:'05-12-2021',cs:'C-9140',tech:'MR',opened:1,spot:'B3',
  ops:[op({cmp:'Turbo actuator fault — low boost',cause:'',fix:'',q:2.2,b:0.8,cost:0,st:'repair',claim:{code:'SPN 641 FMI 7'}})]},
 {no:'37544',cust:'Copperline Transport',unit:'T-266',truck:'2020 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH9LN230716',mi:'372,000',eh:'10,604',ws:'',cs:'C-9102',tech:'LM',opened:5,spot:'B6',
  ops:[op({cmp:'EGR valve stuck — derate',cause:'Valve sticking at 40%; Volvo tech support case open.',fix:'',q:2.0,b:1.1,cost:0,st:'repair'})]},
 {no:'37519',cust:'Dixie Fleet Services',unit:'T-844',truck:'2022 Volvo VNL 860',eng:'D13 TC 500HP',vin:'4V4NC9EJ4NN305581',mi:'99,800',eh:'2,870',ws:'09-20-2021',cs:'C-9088',tech:'AW',opened:7,spot:'Released',
  ops:[op({cmp:'Coolant temp sensor — erratic reading',cause:'Sensor connector pin corroded inside the sensor body.',fix:'Replaced coolant temp sensor, verified reading against IR gun.',parts:[['Coolant temp sensor','21531072',1,64.20,'Installed']],q:0.6,b:0.6,cost:190.20,done:5,st:'submitted',claim:{no:'W2628102',code:'SPN 110 FMI 2',hrs:'0.6',amt:'190.20',at:3},hist:[[3,'submitted','You']]})]},
 {no:'37620',cust:'Northline Transport',unit:'T-372',truck:'2021 Volvo VNL 670',eng:'D13 455HP',vin:'4V4NC9EH1MN266820',mi:'301,400',eh:'8,640',ws:'07-07-2021',cs:'C-8102',tech:'KT',opened:30,spot:'Released',
  ops:[op({cmp:'Coolant leak at water pump',cause:'Seal leaking at the weep hole.',fix:'Replaced water pump and gasket, pressure tested.',parts:[['Water pump','21468475',1,412.00,'Installed']],q:3.0,b:3.1,cost:1287.27,done:28,st:'paid',claim:{no:'W2618834',hrs:'3.0',amt:'1287.27',paid:'1287.27',at:2},hist:[[27,'submitted','You'],[15,'approved','Volvo'],[2,'paid','You']]})]},
 {no:'37203',cust:'Surry Feed & Seed',unit:'T-655',truck:'2018 Volvo VNL 670',eng:'D13 455HP',vin:'4V4NC9EH3JN901277',mi:'540,800',eh:'16,020',ws:'05-01-2018',cs:'C-8090',tech:'LM',opened:21,spot:'Released',
  ops:[op({cmp:'Radiator leak — lower tank',cause:'Lower tank seam cracked.',fix:'Replaced radiator.',parts:[['Radiator','21712578',1,1460.00,'Installed']],q:3.8,b:4.0,cost:2311.00,done:19,st:'denied',claim:{no:'W2620771',hrs:'4.0',amt:'2311.00',why:'Outside base coverage — 8 years in service.',at:5},hist:[[17,'submitted','You'],[5,'denied','Volvo']]})]}
];
const CL0=[{at:0.08,ic:'check',what:'Paid · $612.00',no:'37355',cust:'Rowan Ready Mix'}];
let S,U,UNDO,TOAST,TT;
function reset(){S={R:JSON.parse(JSON.stringify(R0)),CL:JSON.parse(JSON.stringify(CL0))};U={view:'claims',sel:null,op:null,pop:null,kb:false,filt:null,open:{},srch:false,q:''};UNDO=[];TOAST=null;}
const get=no=>S.R.find(r=>r.no===no);
const snap=()=>{UNDO.push(JSON.stringify(S));if(UNDO.length>30)UNDO.shift();};
function toast(t,undo=true){TOAST={t,undo};clearTimeout(TT);TT=setTimeout(()=>{TOAST=null;render();},5200);}
function clr(r,ic,what){S.CL.push({at:0,ic,what,no:r.no,cust:r.cust});}

/* ---------- claim logic ---------- */
const roSt=r=>r.ops.reduce((b,o)=>b===null||RANK[o.st]<RANK[b]?o.st:b,null);
const roStage=r=>Math.min(...r.ops.map(o=>STAGE[o.st]));
const amtOf=o=>+(o.claim.amt||o.cost||0);
const checks=(r,o)=>{ const ps=o.parts.length; return [
  ['Operation complete',o.done!=null,1],['Cause written',!!o.cause,1],['Correction written',!!o.fix,1],[ps?'Causal part picked':'No parts',!ps||o.causal!=null,ps>0],
  ['Labor clocked',o.b>0,1],['VIN (17)',r.vin.length===17,1],['Mileage',!!r.mi,1],['Engine hours',!!r.eh,0],['Fault code',!!o.claim.code,0],['Photo attached',!!r.photo,0]]; };
const gaps=(r,o)=>checks(r,o).filter(c=>c[2]&&!c[1]);
const isOpen=r=>r.ops.some(o=>o.st!=='paid'&&o.st!=='denied');
const outstanding=()=>S.R.reduce((a,r)=>a+r.ops.filter(o=>o.st==='submitted'||o.st==='approved'||o.st==='returned').reduce((b,o)=>b+amtOf(o),0),0);
const GROUPS=[['sent','Sent to you'],['back','Returned'],['ready','Ready to file'],['paid','Approved, not paid'],['watch','No answer yet']];
function needsAll(){ const out=[];
  S.R.forEach(r=>{
    if(r.sent){ out.push({ro:r,g:'sent',ic:'inbox2',why:`From ${r.sent.by} ${ago(r.sent.at)} ago · ${r.sent.why}`,btn:'Accept',act:'accept',late:r.sent.at>1}); return; }
    const back=r.ops.find(o=>o.st==='returned'); if(back){ out.push({ro:r,op:r.ops.indexOf(back),g:'back',ic:'undo',why:`Returned ${when(back.claim.at)} — ${back.claim.why}`,btn:'Fix',act:'fix',late:back.claim.at>2}); return; }
    const rd=r.ops.filter(o=>o.st==='ready'); if(rd.length){ const o=rd[0], g=gaps(r,o); out.push({ro:r,op:r.ops.indexOf(o),g:'ready',ic:'file',why:`Finished ${when(o.done)} · ${usd(amtOf(o))}`+(g.length?` · missing ${g.map(x=>x[0].toLowerCase()).join(', ')}`:' · nothing missing'),btn:'File',act:'file',late:o.done>5}); return; }
    const ap=r.ops.find(o=>o.st==='approved'&&o.claim.at>10); if(ap){ out.push({ro:r,op:r.ops.indexOf(ap),g:'paid',ic:'dollar',why:`Approved ${ago(ap.claim.at)} ago · ${usd(amtOf(ap))} not paid yet`,btn:'Paid…',act:'paid',late:ap.claim.at>14}); return; }
    const sb=r.ops.find(o=>o.st==='submitted'&&o.claim.at>14); if(sb){ out.push({ro:r,op:r.ops.indexOf(sb),g:'watch',ic:'clock',why:`Filed ${ago(sb.claim.at)} ago · ${sb.claim.no} · no answer`,btn:'Follow up',act:'follow',late:true}); }
  });
  return out; }
const snoozed=r=>r.snz;
function match(x){ const f=U.filt; if(!f) return true; if(f==='ready') return x.g==='ready'; if(f==='back') return x.g==='back'; if(f==='late') return x.late; return true; }
const needs=()=>needsAll().filter(x=>!snoozed(x.ro)&&match(x));
function grouped(){const G={};GROUPS.forEach(g=>G[g[0]]=[]);needs().forEach(x=>G[x.g].push(x));GROUPS.forEach(g=>G[g[0]].sort((a,b)=>(b.late?1:0)-(a.late?1:0)));return G;}
const flat=()=>{const G=grouped();return GROUPS.reduce((a,g)=>a.concat(G[g[0]].map(x=>x.ro.no)),[]);};
const itemOf=no=>needs().find(x=>x.ro.no===no);
function sel(){ let r=get(U.sel); if(r) return r; const f=flat(); U.sel=f[0]||S.R[0].no; return get(U.sel); }
const chip=s=>`<span class="wx-c ${STC[s]}"><i></i>${STL[s]}</span>`;
const jt=o=>`<span class="wx-jt${o.kind==='RECALL'?' recall':''}">${o.kind==='RECALL'?'RECALL':'WARRANTY'}</span>`;

/* ---------- render ---------- */
function render(){
  const r=sel(), v=U.view, late=needsAll().filter(x=>x.late).length;
  const body=v==='board'?vBoard(r):vClaims(r);
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='warranty'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg wx">${head()}<div class="tg-body v-${v}">${list()}<div class="tg-main">${body}</div>${pop()}</div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const all=needsAll(), late=all.filter(x=>x.late).length, ready=all.filter(x=>x.g==='ready').length, back=all.filter(x=>x.g==='back').length, open=S.R.filter(isOpen).length;
  const f=(k,n,t,w)=>{const o=U.filt===k;return `<button class="tg-hf${w?' w':''}${o?' on':''}" data-a="filt" data-k="${k}"><b>${n}</b>${t}${o?ic('x',12):''}</button>`;};
  const vs=[['claims','claim','Claims'],['board','board','Board']];
  const sr=U.srch?`<span class="tg-srch open"><span class="tg-srch-i">${ic('search',15)}</span><input id="wx-q" placeholder="RO, claim #, VIN, customer or code" value="${esc(U.q)}" autocomplete="off">${kbd('Esc')}</span>`:`<button class="btn ib tg-srch-b" data-a="srch" title="Search ( / )">${ic('search',16)}</button>`;
  return `<header class="tg-head"><h1 class="tg-h1">Warranty</h1><span class="tg-facts"><button class="tg-hf" data-a="filt" data-k=""><b>${open}</b>open claims</button><i>·</i>${f('ready',ready,'ready to file')}<i>·</i>${f('back',back,'returned',back>0)}<i>·</i><span class="tg-hf" style="cursor:default"><b>${usd0(outstanding())}</b>waiting on Volvo</span><i>·</i>${f('late',late,'late',true)}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>${sr}${U.srch?`<div class="tg-srpop">${search()}</div>`:''}</header>`;
}
function search(){
  const q=U.q.trim().toLowerCase();
  const hay=r=>[r.no,r.cust,r.vin,r.unit].concat(r.ops.map(o=>[o.cmp,o.claim.no||'',o.claim.code||''].join(' '))).join(' ').toLowerCase();
  const L=q?S.R.filter(r=>q.split(/\s+/).every(w=>hay(r).includes(w))).slice(0,6):flat().slice(0,4).map(get);
  return `<div class="h">${q?L.length+' claims':'In Needs action'}</div>`+(L.length?L.map((r,i)=>`<div class="tg-sr${i===0?' k':''}" data-a="sel" data-ro="${r.no}"><b class="tg-no">${r.no}</b><b class="cu">${esc(r.cust)}</b><small>${esc(r.ops.map(o=>o.claim.no).filter(Boolean).join(' · ')||'no claim # yet')}</small><span class="wh"><span class="w1">${esc(r.ops[0].cmp)}</span><span class="w2">${chip(roSt(r))}</span></span></div>`).join(''):`<div class="nores">Nothing matches “${esc(U.q)}”.</div>`)+`<div class="tg-pft"><span>${kbd('↑')}${kbd('↓')} move</span><span>${kbd('↵')} open</span><span>${kbd('Esc')} close</span></div>`;
}
function list(){
  const G=grouped(), L=flat(), s=U.sel, kb=U.kb, sn=S.R.filter(snoozed);
  const item=x=>{const r=x.ro,on=r.no===s;return `<div class="tg-it${on?' on':''}${on&&kb?' kb':''}" data-a="sel" data-ro="${r.no}">${x.late?'<i class="tg-dot"></i>':''}<span class="tg-gi">${ic(x.ic,15)}</span><span class="tg-t"><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b>${r.ops.length>1&&x.op!=null?`<span class="tg-spot">op ${x.op+1}</span>`:''}</span><span class="tg-w${x.late?' late':''}">${esc(x.why)}</span><button class="btn btn-sm ib tg-snz" data-a="pop" data-p="snooze" data-ro="${r.no}" title="Snooze (S)">${ic('clock',15)}</button><button class="btn btn-sm${x.act==='file'||x.act==='fix'?' btn-primary':''} tg-go" data-a="do" data-ro="${r.no}">${esc(x.btn)}${on&&kb?kbd('↵'):''}</button></div>`;};
  let body;
  if(!L.length) body=U.filt?`<div class="tg-empty"><span class="tg-ring0">${ic('check',22)}</span><h3>Nothing here</h3><p>No claim in Needs action matches.</p><button class="btn btn-sm" data-a="filt" data-k="">Clear filter</button></div>`:`<div class="tg-empty"><span class="tg-ring0 ok">${ic('check',22)}</span><h3>All caught up</h3><p>Nothing to file, fix or chase.</p></div>`;
  else body=GROUPS.filter(g=>G[g[0]].length).map(g=>`<div class="tg-grp">${g[1]}<span>${G[g[0]].length}</span></div>`+G[g[0]].map(item).join('')).join('');
  if(sn.length) body+=`<div class="tg-sec${U.open.snz?' open':''}" data-a="open" data-k="snz">${ic('chevR',12)}<span>Snoozed</span><span class="n">${sn.length}</span></div>`+(U.open.snz?`<div class="tg-rows">${sn.map(r=>`<div class="tg-row" data-a="sel" data-ro="${r.no}"><time>${esc(r.snz)}</time><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b><small>${ic('clock',12)}${esc(r.snzWhy||'Snoozed')}</small><button class="btn btn-sm tg-gh" data-a="wake" data-ro="${r.no}">Wake</button></div>`).join('')}</div>`:'');
  body+=`<div class="tg-sec${U.open.clr?' open':''}" data-a="open" data-k="clr">${ic('chevR',12)}<span>Cleared today</span><span class="n">${S.CL.length}</span></div>`+(U.open.clr?`<div class="tg-rows">${S.CL.slice().reverse().map(c=>`<div class="tg-row done"><time>${c.at?'08:12':'now'}</time><b class="tg-no">${c.no}</b><b class="tg-cu">${esc(c.cust)}</b><small>${ic(c.ic,12)}${esc(c.what)}</small></div>`).join('')}</div>`:'');
  const x=itemOf(s);
  const keys=`<div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span>${x?`<span>${kbd('↵')}<b>${esc(x.btn)}</b></span>`:''}<span>${kbd('S')}snooze</span><span>${kbd('T')}send to</span><span>${kbd('/')}search</span></div>`;
  return `<section class="tg-list"><div class="tg-lh">Needs action<span class="n">${L.length}</span>${U.filt?`<button class="tg-fchip${U.filt==='late'||U.filt==='back'?' w':''}" data-a="filt" data-k="">${({ready:'Ready to file',back:'Returned',late:'Late'})[U.filt]}${ic('x',11)}</button>`:''}<button class="tg-done" data-a="open" data-k="clr" data-force="1">${ic('check',13)}${S.CL.length} cleared today</button></div><div class="tg-scroll">${body}</div>${keys}</section>`;
}
/* the selected RO's claim, at the top of both views */
function topOf(r, big){
  const s=roSt(r), x=itemOf(r.no), st=roStage(r), ret=r.ops.some(o=>o.st==='returned'), den=r.ops.every(o=>o.st==='denied'), paidAll=r.ops.every(o=>o.st==='paid');
  const claimed=r.ops.reduce((a,o)=>a+(o.st!=='repair'?amtOf(o):0),0), paid=r.ops.reduce((a,o)=>a+(+o.claim.paid||0),0);
  const stops=['Repair','Ready to file','Submitted','Approved','Paid'];
  const trk=`<div class="wx-trk"><span class="ln"><i style="width:${st/4*100}%"></i></span>${stops.map((t,i)=>{ let c=i<st?'done':i===st?'cur':'', l=t, g=i<st?ic('check',10):'';
      if(i===st&&ret){c='back';l='Returned';g=ic('undo',10);} else if(i===4&&den){c='den';l='Denied';g=ic('x',10);} else if(i===4&&paidAll){c='paid';g=ic('check',10);}
      return `<span class="wx-stp ${c}"><span class="d">${g}</span>${l}</span>`; }).join('')}</div>`;
  const next=x&&x.g==='sent'?r.sent.note:x?x.why:s==='repair'?`${TF(r.tech)} is still on it — it comes here as Ready to file when the op is done.`:s==='submitted'?'Filed — waiting on Volvo.':s==='approved'?'Approved — waiting for the credit.':s==='paid'?'Paid in full.':s==='denied'?r.ops[0].claim.why:'';
  const fact=(k,v,cls)=>`<div><small>${k}</small><span class="${cls||''}">${v?esc(v):'<i>—</i>'}</span></div>`;
  return `<div class="tg-top"><div class="r1"><b class="tg-no">RO-${r.no}</b>${chip(s)}<span>·</span><span>${esc(r.eng)} · Unit ${esc(r.unit)} · ${esc(r.truck)}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="xfer" data-ro="${r.no}">${ic('swap',14)}Send to…</button><button class="btn btn-sm">Open RO</button></div>
   <h2>${esc(r.cust)}</h2>
   <div class="wx-sum">${trk}<div class="wx-money"><small>${paid?'Paid':'Claimed'}</small><b>${paid?usd(paid):claimed?usd(claimed):'—'}</b></div></div>
   ${big?`<div class="wx-facts">${fact('VIN',r.vin)}${fact('Mileage',r.mi+' mi')}${fact('Engine hours',r.eh)}${fact('Warranty starts',r.ws)}${fact('Case #',r.cs)}${fact('Technician',TECH[r.tech],'s')}</div>`:''}</div>
   <div class="tg-next" style="margin:14px 28px 0"><span class="k">Next</span><p>${esc(next)}</p>${x?`<button class="btn btn-sm${x.act==='file'||x.act==='fix'?' btn-primary':''}" data-a="do" data-ro="${r.no}">${esc(x.btn)}${kbd('↵')}</button>`:''}</div>`;
}
function vClaims(r){
  const cust=r.cust2||[];
  return `<div class="wx-cl" data-scroll="cl">${topOf(r,true)}<div class="wx-pad">${cust.length?`<div class="wx-note">${ic('info',15)}<span><b>${cust.length} customer-pay operation${cust.length>1?'s stay':' stays'} on the RO</b> and ${cust.length>1?'aren’t':'isn’t'} part of the claim: ${esc(cust.join(' · '))}</span></div>`:''}${r.ops.map((o,i)=>opCard(r,o,i)).join('')}</div></div>`;
}
function opCard(r,o,i){
  const g=gaps(r,o), C=checks(r,o), s=o.st, c=o.claim;
  const inp=(k,l,ph,w,v)=>`<label class="wx-f${w?' w':''}"><span>${l}</span><input data-f="${k}" data-ro="${r.no}" data-op="${i}" value="${esc(v!=null?v:c[k]||'')}" placeholder="${esc(ph||'')}"></label>`;
  const btn=(to,l,k,dis,tip)=>`<button class="btn btn-sm${k?' '+k:''}" data-a="st" data-ro="${r.no}" data-op="${i}" data-to="${to}"${dis?' disabled':''}${tip?` title="${esc(tip)}"`:''}>${l}</button>`;
  let acts='';
  if(s==='repair') acts=btn('submitted','Submit claim','btn-primary',true,'Finish the operation first');
  else if(s==='ready') acts=`<button class="btn btn-sm btn-primary" data-a="do" data-ro="${r.no}" data-op="${i}"${g.length?' disabled':''}>${ic('send',13)}File claim…</button>`;
  else if(s==='submitted') acts=btn('approved','Approved','btn-primary')+btn('returned','Returned')+btn('denied','Denied','bad');
  else if(s==='returned') acts=btn('submitted','Resubmit','btn-primary',g.length>0)+btn('denied','Denied','bad');
  else if(s==='approved') acts=`<button class="btn btn-sm btn-primary" data-a="pop" data-p="paid" data-ro="${r.no}" data-op="${i}">${ic('dollar',13)}Mark paid…</button>`+btn('returned','Returned');
  else acts=btn('reopen','Reopen');
  const lit=U.op===i&&U.sel===r.no;
  return `<section class="wx-op${s==='returned'?' hl':lit?' sel':''}" data-op="${i}"><header class="wx-oph"><span class="n">${i+1}</span>${jt(o)}<h3>${esc(o.cmp)}</h3><span class="os">${o.done!=null?SI.released+'Complete':SI.working+'Working'}</span>${chip(s)}</header>
   <div class="wx-opb"><div>
     <dl class="wx-story"><dt>Complaint</dt><dd>${esc(o.cmp)}</dd><dt>Cause</dt><dd class="${o.cause?'':'miss'}">${o.cause?esc(o.cause):'Not written yet'}</dd><dt>Correction</dt><dd class="${o.fix?'':'miss'}">${o.fix?esc(o.fix):'Not written yet'}</dd></dl>
     ${o.parts.length?`<span class="wx-k">Parts${o.parts.length>1?' · pick the causal part':''}</span><div class="wx-pts">${o.parts.map((p,j)=>`<div class="wx-pt${o.causal===j?' on':''}" data-a="causal" data-ro="${r.no}" data-op="${i}" data-j="${j}"><span class="r"></span><span class="d">${esc(p[0])}${o.causal===j?'<em>CAUSAL</em>':''}</span><span class="pn">${esc(p[1])}</span><span class="q">×${p[2]} · ${usd(p[3])}</span></div>`).join('')}</div>`:''}
     <div class="wx-lab"><span>Quoted <b>${o.q.toFixed(1)}h</b></span><span>Clocked <b>${o.b.toFixed(1)}h</b></span><span>Cost <b>${o.cost?usd(o.cost):'—'}</b></span><span>${esc(TECH[r.tech])}</span></div>
   </div><div>
     <span class="wx-k">Claim</span>
     <div class="wx-grid">${inp('no','Claim #','Given when you file')}${inp('code','Fault code','SPN / FMI')}${inp('hrs','Labor hrs',o.b.toFixed(1))}${inp('amt','Amount $',o.cost?o.cost.toFixed(2):'0.00')}${s==='paid'?inp('paid','Paid $','',true):''}${s==='returned'||s==='denied'?`<label class="wx-f w${s==='returned'?' bad':''}"><span>${s==='returned'?'Why it came back':'Why it was denied'}</span><input data-f="why" data-ro="${r.no}" data-op="${i}" value="${esc(c.why||'')}"></label>`:''}</div>
     <div class="wx-chk">${C.filter(x=>x[2]||x[1]).map(x=>`<span class="wx-ck ${x[1]?'ok':'no'}">${ic(x[1]?'check':'flag',11)}${esc(x[0])}</span>`).join('')}${C.filter(x=>!x[2]&&!x[1]).map(x=>`<span class="wx-ck">${esc(x[0])} · optional</span>`).join('')}</div>
     <div class="wx-acts">${acts}<span class="sp"></span><button class="btn btn-sm tg-gh">${ic('note',13)}Open on RO</button></div>
   </div></div>
   ${o.hist.length?`<div class="wx-hist">${o.hist.slice().reverse().map(h=>`<span><b>${STL[h[1]]}</b> ${when(h[0])} · ${esc(h[2])}</span>`).join('')}</div>`:''}</section>`;
}
function vBoard(r){
  const cols=[['repair','In repair'],['ready','Ready to file'],['submitted','Submitted'],['approved','Approved'],['paid','Paid']];
  const C={repair:[],ready:[],submitted:[],approved:[],paid:[]};
  S.R.forEach(x=>x.ops.forEach((o,i)=>{ const k=o.st==='returned'?'ready':o.st==='denied'?'paid':o.st; C[k].push({r:x,o,i}); }));
  C.ready.sort((a,b)=>(a.o.st==='returned'?0:1)-(b.o.st==='returned'?0:1)||(b.o.done||0)-(a.o.done||0));
  const lateOf=(o)=>o.st==='ready'&&o.done>5||o.st==='returned'&&o.claim.at>2||o.st==='submitted'&&o.claim.at>14||o.st==='approved'&&o.claim.at>14;
  const sub=(o)=>o.st==='repair'?`${o.b.toFixed(1)} of ${o.q.toFixed(1)} h`:o.st==='ready'?`done ${when(o.done)}`:o.st==='returned'?`back ${when(o.claim.at)}`:o.st==='paid'?`paid ${when(o.claim.at)}`:o.st==='denied'?`denied ${when(o.claim.at)}`:`${o.st==='approved'?'approved':'filed'} ${ago(o.claim.at)} ago`;
  const card=({r:x,o,i})=>{ const L=lateOf(o); return `<div class="wx-cd${x.no===r.no?' sel':''}" data-a="sel" data-ro="${x.no}" data-op="${i}">${L?'<i class="tg-dot"></i>':''}<div class="r1"><b class="tg-no">${x.no}</b>${x.ops.length>1?`<span>op ${i+1}</span>`:''}${o.kind==='RECALL'?jt(o):''}<span class="sp"></span>${o.st==='returned'||o.st==='denied'?chip(o.st):''}</div><span class="cu">${esc(x.cust)}</span><span class="op">${esc(o.cmp)}</span><div class="r3"><span class="${L?'late':''}">${sub(o)}</span><span class="sp"></span><span class="wx-amt">${o.st==='repair'&&!o.cost?'':usd0(amtOf(o))}</span></div></div>`; };
  return `<div class="wx-bv">${topOf(r,false)}<div class="wx-bd">${cols.map(c=>{ const L=C[c[0]], m=L.reduce((a,y)=>a+(y.o.st==='denied'?0:amtOf(y.o)),0); return `<div class="wx-col ${c[0]}"><div class="wx-ch">${c[1]}<span class="n">${L.length}</span><span class="m">${m?usd0(m):''}</span></div><div class="wx-cs">${L.map(card).join('')||'<span class="empty">Nothing here</span>'}</div></div>`; }).join('')}</div></div>`;
}
function pop(){
  const p=U.pop; if(!p) return ''; const r=get(p.ro); if(!r) return '';
  const hd=k=>`<div class="tg-ph"><b>${k}</b><span class="tg-no">RO-${r.no}</span><span class="cu">${esc(r.cust)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const o=r.ops[p.op!=null?p.op:0];
  if(p.type==='snooze'){ const O=[['Tomorrow morning','Fri 08:00'],['In 2 days','Sat 08:00'],['Monday','Mon 08:00'],['Next week','Thu 10/29']];
    return `<div class="tg-pop menu">${hd('Snooze until')}${O.map((x,i)=>`<button class="tg-mi" data-a="snzpick" data-i="${i}">${kbd(i+1)}${x[0]}<span class="meta">${x[1]}</span></button>`).join('')}<div class="tg-pft">Comes back at the top of its group.</div></div>`; }
  if(p.type==='file'){ const g=gaps(r,o), cp=o.parts[o.causal];
    return `<div class="tg-pop xf">${hd('File the claim')}<dl class="wx-sumg"><dt>Operation</dt><dd style="font-family:var(--tg-sans)">${esc(o.cmp)}</dd><dt>Causal part</dt><dd>${cp?`<span style="font-family:var(--tg-sans);font-weight:400">${esc(cp[0])}</span> · ${esc(cp[1])}`:'—'}</dd><dt>Fault code</dt><dd>${esc(o.claim.code||'—')}</dd><dt>Labor</dt><dd>${(o.claim.hrs||o.b.toFixed(1))} h</dd><dt>Amount</dt><dd>${usd(amtOf(o))}</dd><dt>VIN · miles</dt><dd>${esc(r.vin)} · ${esc(r.mi)}</dd></dl>
      ${g.length?`<div class="tg-goal" style="color:var(--tg-warn)">${ic('flag',12)}Missing: ${esc(g.map(x=>x[0].toLowerCase()).join(', '))}</div>`:''}
      <label class="wx-f"><span>Claim # from Volvo</span><input id="wx-cn" placeholder="e.g. W2628140" value="${esc(p.cn||'')}" autocomplete="off"></label>
      <div class="tg-acts"><span class="hint">Type it into Volvo’s claim system, then log the claim # here</span><button class="btn btn-sm btn-primary" data-a="filego"${g.length?' disabled':''}>${ic('send',13)}Mark submitted${kbd('↵')}</button></div></div>`; }
  if(p.type==='paid'){ return `<div class="tg-pop xf">${hd('Mark paid')}<div class="wx-ctx">${esc(o.claim.no||'')} · approved ${ago(o.claim.at)} ago · claimed <b>${usd(amtOf(o))}</b></div>
      <label class="wx-f"><span>Paid / credit $</span><input id="wx-pd" value="${esc(p.pd!=null?p.pd:amtOf(o).toFixed(2))}" autocomplete="off"></label>
      <div class="tg-acts"><span class="hint">From the credit statement</span><button class="btn btn-sm btn-primary" data-a="paidgo">${ic('dollar',13)}Mark paid${kbd('↵')}</button></div></div>`; }
  if(p.type==='follow'){ const O=[['Called Volvo — they’re reviewing it','Back in 3 days'],['Emailed the claims desk','Back in 3 days'],['Resubmit it','Opens the claim']];
    return `<div class="tg-pop xf">${hd('Follow up')}<div class="wx-ctx">${esc(o.claim.no)} · filed ${ago(o.claim.at)} ago · ${usd(amtOf(o))} · no answer yet</div>
      ${O.map((x,i)=>`<button class="tg-mi${p.o===i?' hv':''}" data-a="fpick" data-i="${i}">${kbd(i+1)}${x[0]}<span class="meta">${x[1]}</span></button>`).join('')}
      <div class="tg-acts"><span class="hint">Logged on the claim</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o!=null?'':' disabled'}>Log it${kbd('↵')}</button></div></div>`; }
  if(p.type==='xfer'){ const D=Object.keys(DESK);
    return `<div class="tg-pop xf">${hd('Send to')}<span class="tg-lbl top">To</span><div class="tg-desks">${D.map((k,i)=>`<button class="tg-dsk${p.to===k?' on':''}${k==='warranty'?' cur':''}" data-a="xto" data-k="${k}"${k==='warranty'?' disabled':''}><span class="tg-role">${DESK[k][0]}</span><b>${DESK[k][1]}</b><small>${k==='warranty'?'you':k==='tech'?TECH[r.tech]:DESK[k][2]}</small>${p.to?'':kbd(i+1)}</button>`).join('')}</div>
      ${p.to?`<span class="tg-lbl top">Why</span><div class="tg-r">${WHY[p.to].map((w,i)=>`<button class="tg-chip${p.why===w?' on':''}" data-a="xwhy" data-w="${esc(w)}">${kbd(i+1)}${esc(w)}</button>`).join('')}</div><input class="tg-wide" placeholder="Note (optional)">`:''}
      <div class="tg-acts"><span class="hint">Same transfer as Triage and Foreman</span><button class="btn btn-sm btn-primary" data-a="xgo"${p.to&&p.why?'':' disabled'}>${ic('swap',13)}Send${p.to?' to '+DESK[p.to][1]:''}${kbd('↵')}</button></div></div>`; }
  return '';
}
/* ---------- actions ---------- */
function afterAct(no,before){ const L=flat(); if(L.indexOf(U.sel)<0){ const i=before.indexOf(no); U.sel=L.length?L[Math.min(Math.max(i,0),L.length-1)]:U.sel; } }
function done(r,ic,what,msg,b){ clr(r,ic,what); afterAct(r.no,b); U.pop=null; toast(msg); render(); }
function act(no){ const x=itemOf(no); if(!x) return; U.sel=no;
  if(x.act==='accept'){ const r=x.ro, b=flat(); snap(); r.sent=null; afterAct(r.no,b); U.sel=r.no; toast(`RO-${r.no} accepted — it’s with you. File it when ready.`); render(); return; }
  if(x.act==='fix'){ U.view='claims'; U.op=x.op; U.pop=null; render(); return; }
  if(x.act==='file') return openPop('file',no,x.op);
  if(x.act==='paid') return openPop('paid',no,x.op);
  if(x.act==='follow') return openPop('follow',no,x.op);
}
function openPop(type,no,op){ U.sel=no; U.pop={type,ro:no,op:op!=null?op:0}; U.srch=false; render(); const f=$('#wx-cn,#wx-pd'); if(f) f.focus(); }
function setSt(r,i,to,extra){ const o=r.ops[i], from=o.st; o.st=to==='reopen'?(o.done!=null?'ready':'repair'):to; o.claim.at=0; o.hist.push([0,o.st,'You']); Object.assign(o.claim,extra||{}); return from; }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, no=t.dataset.ro, p=U.pop;
  if(a==='sel'){ if(e.target.closest('button')&&e.target.closest('button')!==t) return; U.sel=no; U.op=t.dataset.op!=null?+t.dataset.op:null; U.kb=false; U.pop=null; U.srch=false; render(); }
  else if(a==='do'){ U.kb=false; if(t.dataset.op!=null){ openPop('file',no,+t.dataset.op); } else act(no); }
  else if(a==='pop'){ openPop(t.dataset.p,no,t.dataset.op!=null?+t.dataset.op:(itemOf(no)||{}).op); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='filt'){ const k=t.dataset.k||null; U.filt=!k||U.filt===k?null:k; const L=flat(); if(L.length&&L.indexOf(U.sel)<0) U.sel=L[0]; render(); }
  else if(a==='open'){ const k=t.dataset.k; U.open[k]=t.dataset.force&&!U.open[k]?true:!U.open[k]; render(); }
  else if(a==='wake'){ const r=get(no); snap(); r.snz=null; U.sel=no; render(); }
  else if(a==='snzpick'){ const r=get(p.ro), b=flat(), O=['Fri 08:00','Sat 08:00','Mon 08:00','Thu 10/29'], i=+t.dataset.i; snap(); r.snz=O[i]; afterAct(r.no,b); U.pop=null; toast(`RO-${r.no} snoozed until ${O[i]}.`); render(); }
  else if(a==='causal'){ const r=get(no); snap(); r.ops[+t.dataset.op].causal=+t.dataset.j; render(); }
  else if(a==='st'){ const r=get(no), i=+t.dataset.op, to=t.dataset.to, b=flat(); snap(); setSt(r,i,to, to==='returned'?{why:''}:to==='paid'?{paid:String(amtOf(r.ops[i]))}:null);
     if(to==='returned'){ U.op=i; render(); const f=$(`.wx-op[data-op="${i}"] [data-f="why"]`); if(f) f.focus(); toast(`Op ${i+1} returned — write what Volvo asked for.`); return; }
     done(r,to==='approved'?'check':to==='denied'?'x':to==='submitted'?'send':'undo',`${STL[r.ops[i].st]} · op ${i+1}`,`RO-${r.no} op ${i+1}: ${STL[r.ops[i].st].toLowerCase()}.`,b); }
  else if(a==='filego'){ const r=get(p.ro), b=flat(), cn=($('#wx-cn')||{}).value||''; snap(); const o=r.ops[p.op]; setSt(r,p.op,'submitted',{no:cn||o.claim.no||'W26281'+(40+p.op),hrs:o.claim.hrs||o.b.toFixed(1),amt:o.claim.amt||amtOf(o).toFixed(2)}); done(r,'send','Filed · '+r.ops[p.op].claim.no,`Claim ${r.ops[p.op].claim.no} filed for RO-${r.no} · ${usd(amtOf(o))}.`,b); }
  else if(a==='paidgo'){ const r=get(p.ro), b=flat(), v=($('#wx-pd')||{}).value||'0'; snap(); setSt(r,p.op,'paid',{paid:v}); done(r,'dollar','Paid · '+usd(+v),`RO-${r.no} paid · ${usd(+v)}.`,b); }
  else if(a==='fpick'){ p.o=+t.dataset.i; render(); }
  else if(a==='fgo'){ const r=get(p.ro), b=flat(); if(p.o===2){ U.pop=null; U.view='claims'; U.op=p.op; render(); return; } snap(); r.snz='Sun 08:00'; r.snzWhy=['Called Volvo','Emailed the claims desk'][p.o]; afterAct(r.no,b); done(r,'clock',r.snzWhy,`Logged on ${r.ops[p.op].claim.no} · back Sunday.`,b); }
  else if(a==='xto'){ p.to=t.dataset.k; p.why=null; render(); } else if(a==='xwhy'){ p.why=t.dataset.w; render(); }
  else if(a==='xgo'){ const r=get(p.ro), b=flat(); snap(); const who=p.to==='tech'?TECH[r.tech]:DESK[p.to][2]; r.snz='with '+DESK[p.to][1]; r.snzWhy=p.why; afterAct(r.no,b); done(r,'swap',`To ${DESK[p.to][1]} · ${p.why}`,`RO-${r.no} → ${who} · ${p.why}. It comes back here when they’re done.`,b); }
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
  else if(a==='srch'){ U.srch=true; U.q=''; render(); }
});
mock.addEventListener('input',e=>{ if(e.target.id==='wx-q'){ U.q=e.target.value; const pp=$('.tg-srpop'); if(pp) pp.innerHTML=search(); } if(e.target.id==='wx-cn'&&U.pop) U.pop.cn=e.target.value; if(e.target.id==='wx-pd'&&U.pop) U.pop.pd=e.target.value;
  const f=e.target.dataset.f; if(f){ const r=get(e.target.dataset.ro); r.ops[+e.target.dataset.op].claim[f]=e.target.value; } });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;
  if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"]')){U.pop=null;ch=true;}
  if(U.srch&&!e.target.closest('.tg-srch,.tg-srpop,[data-a="srch"]')){U.srch=false;ch=true;}
  if(ch) render(); },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; U.op=null; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return;
  const stop=()=>{e.preventDefault();e.stopPropagation();};
  if(U.srch){ if(k==='Escape'){U.srch=false;render();return stop();} if(k==='Enter'){const f=$('.tg-srpop .tg-sr');if(f){U.sel=f.dataset.ro;U.srch=false;render();}return stop();} return; }
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(inF) return;
    const n=+k;
    if(p.type==='snooze'&&n>=1&&n<=4){ $(`.tg-pop [data-a="snzpick"][data-i="${n-1}"]`)?.click(); return stop(); }
    if(p.type==='follow'&&n>=1&&n<=3){ $(`.tg-pop [data-a="fpick"][data-i="${n-1}"]`)?.click(); return stop(); }
    if(p.type==='xfer'&&n>=1){ if(!p.to){ $$('.tg-pop .tg-dsk:not([disabled])').find(b=>Object.keys(DESK).indexOf(b.dataset.k)===n-1)?.click(); } else $$('.tg-pop [data-a="xwhy"]')[n-1]?.click(); return stop(); }
    return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'||k==='ArrowDown'){move(1);return stop();} if(k==='k'||k==='ArrowUp'){move(-1);return stop();}
  if(k==='Enter'){U.kb=true;act(U.sel);return stop();}
  if(k==='s'){U.kb=true;if(itemOf(U.sel))openPop('snooze',U.sel);return stop();}
  if(k==='t'){U.kb=true;openPop('xfer',U.sel);return stop();}
  if(k==='1'||k==='2'){U.view=['claims','board'][+k-1];render();return stop();}
  if(k==='/'){U.srch=true;U.q='';render();return stop();}
  if(k==='Escape'){ if(U.filt){U.filt=null;render();return stop();} }
});
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop){ const it=$(`.tg-it[data-ro="${U.pop.ro}"]`); let top=12; if(it) top=it.getBoundingClientRect().top/scale-body.getBoundingClientRect().top/scale-6; top=Math.round(Math.max(12,Math.min(top,body.offsetHeight-p.offsetHeight-12))); p.style.top=top+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.srch){ const q=$('#wx-q'); if(q&&document.activeElement!==q){q.focus();q.setSelectionRange(q.value.length,q.value.length);} }
  if(U.op!=null&&U.view==='claims'){ const c=$(`.wx-op[data-op="${U.op}"]`), cl=$('.wx-cl'); if(c&&cl&&U.op>0&&!U._sc){ U._sc=1; cl.scrollTop=c.offsetTop-cl.querySelector('.tg-top').offsetHeight-12; setTimeout(()=>{U._sc=0;},0); } } }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  file:()=>{reset();U.sel='37502';render();openPop('file','37502',0);},
  back:()=>{reset();U.sel='37455';render();act('37455');},
  sent:()=>{reset();U.sel='37701';render();},
  board:()=>{reset();U.view='board';U.sel='37590';render();},
  paid:()=>{reset();U.sel='37466';render();openPop('paid','37466',0);},
  xfer:()=>{reset();U.sel='37612';render();openPop('xfer','37612',0);U.pop.to='tech';U.pop.why='Photo of the causal part';render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__wx={S:()=>S,U:()=>U,render,reset,openPop,DEMO,act};
reset(); render();
"""
ICO = {k: v for k, v in IC.items()}
SI = {}
for k in ["hold", "working", "released", "declined"]:
    SI[k] = P.si(k).replace('class="px-si"', 'class="tg-si"').replace("var(--panel)", "var(--tg-panel)")
for k, v in {"__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("file", "1 · File a claim"), ("back", "2 · Returned"), ("sent", "3 · Sent to you"), ("board", "4 · Board"), ("paid", "5 · Mark paid"), ("xfer", "6 · Send to")])
about = [
 ("Needs action on the left", "Sent to you · Returned · Ready to file · Approved, not paid · No answer yet. J K, ↵, S snooze, T send to, / search."),
 ("Facts are filters", "Ready to file, returned and late narrow the list. Open claims clears it."),
 ("Claims · Board", "Claims is the selected claim, op by op. Board is every claim by stage, with dollars per column."),
 ("Sent to Warranty lands here", "The close-out rule and the Foreman’s “Tech support first” show up as Sent to you, with Accept."),
 ("File and Paid", "File logs the claim # you got from Volvo. Paid takes the credit amount."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Warranty layout</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Warranty — same layout as Triage and Foreman</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Warranty<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
