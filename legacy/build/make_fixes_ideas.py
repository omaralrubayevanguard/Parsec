# Fixes — the 12 ideas in one mock-up, built on Fixes v2. One button per idea, with a spotlight note.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_fixes2.py")
OUT = sys.argv[1]
src2 = open(SRC, encoding="utf-8").read()
g = {"__name__": "fxideas", "__file__": SRC}
exec(src2.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]
IC["sliders"] = '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
IC["star"] = '<path d="M12 4.2l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 16l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z"/>'
IC["download"] = '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>'
IC["image"] = '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 4.5-4.5 3 3 2.5-2.5L20 17"/>'

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

# ================= data =================
rep("h:[7.5,9.0],q:8.0}]}", "h:[7.5,9.0],q:8.0}]},\n {k:'cel',sys:'aft',t:'Check engine light — aftertreatment fault',n:2,V:[{w:1,cause:'Outlet NOx sensor out of range',fix:'Replaced the outlet NOx sensor',parts:[['22827993','Outlet NOx sensor',1,486.20]],codes:['SPN 3226 FMI 2'],h:[0.9,1.2],q:1.0},{w:1,cause:'DPF pressure sensor stuck high',fix:'Replaced the DPF pressure sensor',parts:[['22770789','DPF pressure sensor',1,186.40]],codes:['SPN 3251 FMI 2'],h:[0.6,0.8],q:0.8}]}")
rep("h:[2.0,2.8],q:2.4}]}", "h:[2.6,3.2],q:2.4}]}")
rep("const ents=k=>S.E[k].concat(S.M.filter(m=>m.k===k)).sort((a,b)=>a.date<b.date?1:-1);",
    "let FILT=false; const band=m=>m<300000?'lo':m<500000?'mid':'hi';\nconst passF=e=>!FILT||((!U.fe||e.eng===U.fe)&&(!U.fmdl||String(e.truck).includes(U.fmdl))&&(!U.fmi||band(e.miles)===U.fmi));\nconst nF=()=>[U.fe,U.fmdl,U.fmi].filter(Boolean).length;\nconst ents=k=>(S.E[k]||[]).concat(S.M.filter(m=>m.k===k)).filter(passF).sort((a,b)=>a.date<b.date?1:-1);")
rep("q=g.V[0].q,", "q=(S.qo[k])||g.V[0].q,")
rep("let L=G0.slice();", "let L=G0.filter(g=>ents(g.k).length);")
rep("S={E,O:JSON.parse(JSON.stringify(OPEN0)),R:JSON.parse(JSON.stringify(REV0)),M:[],extra:{}};", r"""S={E,O:JSON.parse(JSON.stringify(OPEN0)),R:JSON.parse(JSON.stringify(REV0)),M:[],extra:{},std:{wp:{fix:'Replaced the water pump and gasket, pressure tested, holds',note:'Clean the gasket surface down to bare metal — a rushed surface is the usual weep.',by:'FD',at:'Sep 30'}},kits:{},qo:{},qk:{}};
  const e0=E.nox[0], days=dd(e0.date,TODAY); Object.assign(e0,{out:'cb',back:days,backRo:'37795',live:1});
  S.O.push({no:'37795',k:'nox',cust:e0.cust,truck:e0.truck,eng:e0.eng,miles:e0.miles+6100,tech:'DK',wr:'JT',spot:'L15',q:null,parts:[],in:'today 11:20',cb:{ro:e0.ro,days,date:e0.date}});
  S.O.push({no:'37802',k:'nox',cmp:'Check engine light on, derate warning',code:'SPN 3226 FMI 2',cust:'Catawba Timber',truck:'2019 Volvo VNL 860',eng:'D13',miles:455200,tech:'KT',wr:'AM',spot:'L16',q:null,parts:[],in:'today 12:05'});""")
rep("U={view:'lib',sel:'nox',pop:null,kb:false,sort:'count',grp:'sys',flt:false,open:{},q:'',role:'fm'};",
    "U={view:'lib',sel:'nox',pop:null,kb:false,sort:'count',grp:'sys',flt:false,open:{},q:'',role:'fm',fe:null,fmdl:null,fmi:null,note:null,hl:null,steps:{}};")
rep("function render(){\n  if(U.role==='tech'&&U.view==='rev') U.view='lib';", "function render(){\n  if(U.role==='tech'&&U.view==='rev') U.view='lib';\n  if(U.view==='trend'&&U.role!=='mg'&&U.role!=='fm') U.view='lib';\n  FILT=U.view==='lib';")
rep("const v=U.view, body=v==='open'?vOpen():v==='rev'?vRev():vLib();", "const v=U.view, body=v==='open'?vOpen():v==='rev'?vRev():v==='trend'?vTrend():vLib();")
rep("const vs=[['lib','book','Library'],['open','ros','Open ROs'],['rev','note','Review']].filter(x=>isRev()||x[0]!=='rev');",
    "const vs=[['lib','book','Library'],['open','ros','Open ROs'],['rev','note','Review'],['trend','chart','Trends']].filter(x=>(isRev()||x[0]!=='rev')&&(x[0]!=='trend'||U.role==='mg'||U.role==='fm'));")
rep("if(k>='1'&&k<='3'){ U.view=['lib','open','rev'][+k-1];", "if(k>='1'&&k<='4'){ U.view=['lib','open','rev','trend'][+k-1];")
rep("<b>${G0.length}</b>complaints</span><i>·</i>", "<b>${G0.length}</b>complaints</span><i>·</i>${S.O.filter(o=>o.cb).length?`<button class=\"tg-hf bad\" data-a=\"gocb\"><b>${S.O.filter(o=>o.cb).length}</b>comeback</button><i>·</i>`:''}")

# ================= the list: filters, standard star =================
rep("<div class=\"tg-lh\">Complaints<span class=\"n\">${G0.length}</span><button class=\"fx-flt${U.flt?' on':''}\" data-a=\"flt\" style=\"margin-left:auto\">",
    "<div class=\"tg-lh\">Complaints<span class=\"n\">${groupsList().length}</span><button class=\"fx-flt${nF()?' on':''}\" data-a=\"pop\" data-p=\"flt2\" style=\"margin-left:auto\">${ic('sliders',12)}Filter${nF()?' · '+nF():''}</button><button class=\"fx-flt${U.flt?' on':''}\" data-a=\"flt\">")
rep("</span></div><div class=\"tg-scroll\">${body}</div>", "</span></div>${fChips()}<div class=\"tg-scroll\">${body}</div>")
rep("<span class=\"fx-n\">${E.length}×</span>", "${S.std[g.k]?`<span class=\"fx-star\" title=\"Shop standard\">${ic('star',12)}</span>`:''}<span class=\"fx-n\">${E.length}×</span>")

# ================= the pane =================
rep("function vLib(){", "function vLib(){\n  if(!ents(U.sel).length){ const f=groupsList()[0]; if(f) U.sel=f.k; else return `<div class=\"tg-blank\"><div class=\"tg-empty\"><span class=\"tg-ring0\">${ic('sliders',22)}</span><h3>No fixes match</h3><p>Clear a filter to see more.</p><button class=\"btn btn-sm\" data-a=\"fclr\" data-f=\"all\">Clear filters</button></div></div>`; }")
rep("  if(O.length){ const o=pO[0]||O[0];", "  h+=cbBanner(g.k);\n  if(O.length){ const o=pO[0]||O[0];")
rep("  if(g.tip) h+=`<div class=\"fx-tip\">", "  h+=quoteCheck(g.k,st);\n  if(STEPS[g.k]) h+=checkFirst(g,st); else if(g.tip) h+=`<div class=\"fx-tip\">")
rep("  h+=`<div class=\"fx-card\"><div class=\"fx-ch\"><b>Every time it was fixed</b>", "  h+=tsCard(g.k)+phCard(g.k)+wCard(g,st);\n  h+=`<div class=\"fx-card\"><div class=\"fx-ch\"><b>Every time it was fixed</b>")
rep("<b>The usual fix</b><small>from ${st.n} times on ${st.trucks} trucks</small><span class=\"sp\"></span>",
    "<b>The usual fix</b>${S.std[g.k]?`<span class=\"fx-std\">${ic('star',11)}Shop standard · ${F(S.std[g.k].by)} · ${S.std[g.k].at}</span>`:''}<small>from ${st.n} times on ${st.trucks} trucks</small><span class=\"sp\"></span>${(U.role==='fm'||U.role==='lt'||U.role==='mg')?`<button class=\"btn btn-sm tg-gh\" data-a=\"pop\" data-p=\"std\" data-k=\"${g.k}\">${ic('star',13)}${S.std[g.k]?'Change standard':'Make shop standard'}</button>`:''}<button class=\"btn btn-sm tg-gh\" data-a=\"pop\" data-p=\"cons\" data-k=\"${g.k}\">${ic('eye',13)}What the tech sees</button>")
rep("<div><small class=\"l\">Correction</small><p>${esc(f0[0])}<i>${f0[1]} of ${st.n}</i></p>${st.fixes.slice(1)",
    "<div><small class=\"l\">Correction</small>${S.std[g.k]?`<p>${esc(S.std[g.k].fix)}<i>shop standard</i></p>${S.std[g.k].note?`<div class=\"fx-alt fx-stdn\">${ic('pin',11)}${esc(S.std[g.k].note)}</div>`:''}`:`<p>${esc(f0[0])}<i>${f0[1]} of ${st.n}</i></p>`}${st.fixes.filter(x=>!S.std[g.k]||x[0]!==S.std[g.k].fix).slice(S.std[g.k]?0:1)")
rep(".slice(S.std[g.k]?0:1).slice(1)", ".slice(S.std[g.k]?0:1)", 0)
rep("<small class=\"l\" style=\"display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3);margin-bottom:4px\">Parts used</small>",
    "<div class=\"fx-plh\"><small class=\"l\" style=\"display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3)\">Parts used</small>${st.parts.length?(S.kits[g.k]?`<span class=\"fx-kitc\">${ic('check',11)}${S.kits[g.k].id} in Parts</span>`:`<button class=\"btn btn-sm tg-gh\" data-a=\"pop\" data-p=\"kit\" data-k=\"${g.k}\">${ic('plus',12)}Make a kit</button>`):''}</div>")
rep("<span class=\"fx-er${e.out==='cb'?' cbrow':''}\"", "<span class=\"fx-er\"", 0)
rep("<div class=\"fx-er${e.out==='cb'?' cbrow':''}\">", "<div class=\"fx-er${e.out==='cb'?' cbrow':''}${U.hl===e.ro?' hl':''}\" data-ro=\"${e.ro}\">")
rep("<span class=\"fx-oc cb\" title=\"Came back as RO-${e.backRo}\">${ic('undo',11)}Back in ${e.back} d</span>", "<span class=\"fx-oc cb\" title=\"Came back as RO-${e.backRo}\">${ic('undo',11)}${e.live?'Back now':'Back in '+e.back+' d'}</span>")

# ================= Open ROs: comeback and code match =================
rep("<b class=\"lk\" data-a=\"sel\" data-k=\"${o.k}\" data-go=\"1\">${esc(g.t)}</b><small>${st.n} past fixes · ${same} on a ${esc(o.eng)}${g.tip?' · worth knowing':''}</small>",
    "${o.cmp?`<b>${esc(o.cmp)}</b><small class=\"fx-bycode\">${ic('link',11)}${o.code} → <span class=\"lk\" data-a=\"sel\" data-k=\"${o.k}\" data-go=\"1\">${esc(g.t.split(' — ')[0])}</span> · ${st.n}×</small>`:`<b class=\"lk\" data-a=\"sel\" data-k=\"${o.k}\" data-go=\"1\">${esc(g.t)}</b><small>${o.cb?`<span class=\"fx-cbt\">${ic('undo',11)}comeback · ${o.cb.days} d after ${o.cb.ro}</span>`:`${st.n} past fixes · ${same} on a ${esc(o.eng)}${g.tip?' · worth knowing':''}`}</small>`}")
rep("return `<div class=\"fx-or\"><span class=\"c\"><b><span class=\"tg-no\">${o.no}</span> ${esc(o.cust)}</b>", "return `<div class=\"fx-or${o.cmp?' code':''}${o.cb?' cb':''}\"><span class=\"c\"><b><span class=\"tg-no\">${o.no}</span> ${esc(o.cust)}</b>")

# ================= the idea helpers =================
JS = JS.replace("/* ---------- popovers ---------- */", r"""const STEPS={
 cts:[['Check the connector at the sensor','Corroded on 2 of 3 — clean, re-pin, replace the pigtail ($38.75)','2 of 3'],['Test the sensor','Tech Tool resistance check against coolant temperature','—'],['Replace the sensor only if it fails the test','1 of 3 — $64.20 and about 0.7 h','1 of 3']],
 doser:[['Check the doser line behind the tank','Kinked on 1 of 5 — re-route it ($88.40 line)','1 of 5'],['Run the doser flow test','Tech Tool · aftertreatment · doser test','—'],['Replace the doser and gasket if flow fails','4 of 5 — $751.78','4 of 5']],
 dpfp:[['Check the sensor hoses','Cracked on 1 of 4 — $24.10','1 of 4'],['Compare the reading to a known-good sensor','Key on, engine off — should read near zero','—'],['Replace the pressure sensor','3 of 4 — $186.40','3 of 4']],
 egr:[['Look for coolant in the EGR valve','If it’s wet, the cooler is leaking — 1 of 3, and it came back when only the valve was done','1 of 3'],['Pressure test the cooling system','Rules the cooler in or out before ordering','—'],['Replace the EGR valve, then run the EGR test','2 of 3 — $968.00','2 of 3']],
 turbo:[['Check the actuator connector','A backed-out pin on 1 of 6 — it came back after a re-pin, so test the actuator too','1 of 6'],['Run the actuator test in Tech Tool','Failed on 5 of 6','5 of 6'],['Replace the actuator and calibrate it','$1,348.00 and about 1.6 h','5 of 6']]
};
const TS={egr:[{c:'TS-31422',d:'2026-10-16',ro:'37544',by:'AW',st:'open',said:'Check the EGR cooler for an internal leak before replacing the valve — coolant in the valve means the cooler.'},{c:'TS-29870',d:'2026-06-03',ro:'36561',by:'MR',st:'closed',said:'Heavy carbon on the valve: replace it, then run the EGR cleaning routine before releasing the truck.'}],turbo:[{c:'TS-30115',d:'2026-08-12',ro:'37012',by:'KT',st:'closed',said:'Actuator fault with good wiring — replace and calibrate. Re-pinning alone doesn’t hold on this actuator.'}]};
const PH={wp:[['Failed pump — weep hole','37455','#6b6f74','#3c3f43'],['Seal face, worn','37455','#7c6a55','#3d342b'],['Gasket surface, cleaned','37220','#8a8f94','#55595e'],['Pressure test — holds','37220','#49615a','#26332f'],['Tech Tool printout','37104','#d8d4ca','#a8a296']]};
const WSET={alt:1,wp:1,inj:1,ac:1};
function cbBanner(k){ const o=S.O.find(x=>x.k===k&&x.cb); if(!o) return ''; const f=ents(k).find(e=>e.ro===o.cb.ro);
  return `<div class="fx-cb">${ic('undo',16)}<span><b>Comeback.</b> ${o.no} ${esc(o.cust)} is back with the same complaint — same truck, ${o.cb.days} days after RO ${o.cb.ro} (${fd(o.cb.date)})${f?`, where ${F(f.tech)} ${lc(f.fix).replace(/^replaced/,'replaced')}`:''}.</span><button class="btn btn-sm" data-a="tofix" data-ro="${o.cb.ro}">See that fix</button><button class="btn btn-sm btn-primary" data-a="cbsend" data-no="${o.no}">Send to Frank</button></div>`; }
function checkFirst(g,st){ const S_=STEPS[g.k], dn=U.steps[g.k]||{};
  return `<div class="fx-card fx-steps"><div class="fx-ch">${ic('bulb',14)}<b>Check first</b><small>${esc(g.tip||'')}</small></div>${S_.map((s,i)=>`<label class="fx-step${dn[i]?' done':''}" data-a="stp" data-k="${g.k}" data-i="${i}"><span class="n">${dn[i]?ic('check',12):i+1}</span><span class="d"><b>${esc(s[0])}</b><small>${esc(s[1])}</small></span><span class="s">${s[2]}</span></label>`).join('')}<div class="fx-cf">${ic('info',12)}${nF()?'Counts are from every job, not just the filter.':'Built from how it’s been fixed — the cheap checks come first. It shows on the tech’s Console too.'}</div></div>`; }
const dq=(a,b)=>Math.round((+h1(a)-+h1(b))*10)/10;
function quoteCheck(k,st){ const d=dq(st.hrs,st.q); if(Math.abs(d)<0.3||st.n<4||S.qk[k]) return '';
  return `<div class="fx-qc">${ic('gauge',16)}<span><b>Quote check.</b> It’s taken ${h1(st.hrs)} h on average over ${st.n} jobs — the usual quote is ${h1(st.q)} h. That’s about ${usd0(Math.abs(d)*RATE)} ${d>0?'of labor not billed':'over'} each time.</span><button class="btn btn-sm btn-primary" data-a="qset" data-k="${k}">Make it ${h1(st.hrs)} h</button><button class="btn btn-sm tg-gh" data-a="qkeep" data-k="${k}">Keep ${h1(st.q)} h</button></div>`; }
function tsCard(k){ const L=TS[k]; if(!L) return '';
  return `<div class="fx-card fx-ts"><div class="fx-ch">${ic('phone',14)}<b>Tech support said</b><small>cases on this complaint</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Attach a case — the case number and what support said; it shows here and on the RO.">${ic('plus',12)}Attach a case</button></div>${L.map(x=>`<div class="fx-tsr"><span class="m">${x.c}</span><span class="d"><span>${esc(x.said)}</span><small>RO ${x.ro} · ${esc(PPL[x.by])} · ${fd(x.d)}</small></span><span class="fx-oc ${x.st==='open'?'nw':'ok'}">${x.st==='open'?'Open':'Closed'}</span></div>`).join('')}</div>`; }
function phCard(k){ const L=PH[k]; if(!L) return '';
  return `<div class="fx-card fx-ph"><div class="fx-ch">${ic('image',14)}<b>Photos and files</b><small>${L.length} from ${new Set(L.map(x=>x[1])).size} ROs</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Add photos — from the RO, or straight from the phone app.">${ic('plus',12)}Add</button></div><div class="fx-phg">${L.map((x,i)=>`<button class="fx-pht" data-a="pop" data-p="photo" data-k="${k}" data-i="${i}"><i style="background:linear-gradient(135deg,${x[2]},${x[3]})">${ic(i===4?'file':'image',18)}</i><b>${esc(x[0])}</b><small>RO ${x[1]}</small></button>`).join('')}</div></div>`; }
function wCard(g,st){ if(!WSET[g.k]||!st.parts.length) return ''; const p=st.parts[0], c0=st.causes[0][0], f0=(S.std[g.k]||{}).fix||st.fixes[0][0];
  return `<div class="fx-card fx-war"><div class="fx-ch">${ic('warranty',14)}<b>For a warranty claim</b><small>the causal part and story, from the usual fix</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Copied — complaint, cause, correction and causal part, in claim order.">${ic('copy',13)}Copy for the claim</button></div>
   <div class="fx-wr"><div><small>Causal part</small><b>${esc(p.p[1])} · <span style="font-family:var(--tg-mono)">${p.p[0]}</span></b><small>${p.n} of ${st.n} jobs</small></div><div><small>Labor</small><b style="font-family:var(--tg-mono)">${h1(st.q)} h</b><small>the usual quote</small></div><div><small>Codes</small><b style="font-family:var(--tg-mono)">${st.codes.length?st.codes[0][0]:'—'}</b><small>${st.codes.length?st.codes[0][1]+' of '+st.n:'none logged'}</small></div></div>
   <div class="fx-ws"><p><b>Complaint</b> ${esc(g.t)}.</p><p><b>Cause</b> ${esc(c0)}.</p><p><b>Correction</b> ${esc(f0)}.</p></div><div class="fx-cf" style="padding:8px 16px 10px">${ic('info',12)}Warranty starts from this when a claim on the same complaint opens — they still check it against the RO.</div></div>`; }
function fChips(){ if(!nF()) return ''; const L=[]; if(U.fe) L.push(['fe',U.fe]); if(U.fmdl) L.push(['fmdl',U.fmdl]); if(U.fmi) L.push(['fmi',{lo:'Under 300k mi',mid:'300k–500k mi',hi:'Over 500k mi'}[U.fmi]]);
  return `<div class="fx-fchips">${L.map(x=>`<button class="fx-fc" data-a="fclr" data-f="${x[0]}">${esc(x[1])}${ic('x',11)}</button>`).join('')}<button class="fx-fc clr" data-a="fclr" data-f="all">Clear</button></div>`; }
function vTrend(){ const D90=addD(TODAY,-90), D180=addD(TODAY,-180);
  const rows=G0.map(g=>{ const E=ents(g.k), a=E.filter(e=>e.date>=D90).length, b=E.filter(e=>e.date<D90&&e.date>=D180).length, cb=E.filter(e=>e.out==='cb').length, st=stats(g.k); return {g,a,b,cb,n:E.length,st,dh:dq(st.hrs,st.q)}; });
  const top=rows.slice().sort((x,y)=>y.a-x.a).slice(0,7), mx=Math.max(1,...top.map(x=>x.a));
  const bys=Object.keys(SYS).map(sk=>{ const R_=rows.filter(x=>x.g.sys===sk); return {sk,a:R_.reduce((t,x)=>t+x.a,0),b:R_.reduce((t,x)=>t+x.b,0),top:R_.slice().sort((x,y)=>y.a-x.a)[0]}; }).filter(x=>x.a||x.b).sort((x,y)=>y.a-x.a), mxs=Math.max(1,...bys.map(x=>x.a));
  const cbs=rows.filter(x=>x.cb).sort((x,y)=>y.cb/y.n-x.cb/x.n), oq=rows.filter(x=>x.dh>=0.2).sort((x,y)=>y.dh-x.dh);
  return `<div class="fx-full"><div class="fx-fh"><h2>Trends</h2><span class="tg-hf" style="cursor:default">Last 90 days · the foreman and the manager see this</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="The monthly sheet prints — repeat complaints, comebacks and quotes to fix.">${ic('print',14)}Print</button></div>
   <div class="fx-trend"><div style="display:flex;flex-direction:column;gap:14px"><div class="fx-tbl" style="margin:0"><div class="fx-tg">Most repeated<span>fixes in the last 90 days</span></div>${top.map(x=>`<div class="fx-tbar" data-a="sel" data-k="${x.g.k}" data-go="1" data-tip="${esc(x.g.t)}|${x.a} in the last 90 days · ${x.b} in the 90 before"><span class="n">${esc(x.g.t)}</span><span class="b"><i style="width:${x.a/mx*100}%"></i></span><b>${x.a}</b><span class="d ${x.a>x.b?'up':x.a<x.b?'dn':''}">${x.a>x.b?'▲ '+(x.a-x.b):x.a<x.b?'▼ '+(x.b-x.a):'—'}</span></div>`).join('')}<div class="fx-cf">${ic('info',12)}Arrows compare with the 90 days before.</div></div>
   <div class="fx-tbl" style="margin:0"><div class="fx-tg">By system<span>fixes in the last 90 days</span></div>${bys.map(x=>`<div class="fx-tbar sy" data-a="sel" data-k="${x.top.g.k}" data-go="1" data-tip="${SYS[x.sk][0]}|${x.a} in the last 90 days · ${x.b} in the 90 before"><span class="n">${ic(SYS[x.sk][1],14)}${SYS[x.sk][0]}</span><span class="b"><i style="width:${x.a/mxs*100}%"></i></span><b>${x.a}</b><span class="d ${x.a>x.b?'up':x.a<x.b?'dn':''}">${x.a>x.b?'▲ '+(x.a-x.b):x.a<x.b?'▼ '+(x.b-x.a):'—'}</span></div>`).join('')}</div></div>
   <div style="display:flex;flex-direction:column;gap:14px"><div class="fx-tbl" style="margin:0"><div class="fx-tg">Comebacks<span>fixes that didn’t hold</span></div>${cbs.map(x=>`<div class="fx-trr" data-a="sel" data-k="${x.g.k}" data-go="1"><span class="n">${esc(x.g.t)}</span><span class="fx-oc cb">${x.cb} of ${x.n}</span><b>${Math.round(x.cb/x.n*100)}%</b></div>`).join('')||'<div class="fx-none">None.</div>'}</div>
   <div class="fx-tbl" style="margin:0"><div class="fx-tg">Taking longer than quoted<span>average clocked minus the usual quote</span></div>${oq.map(x=>`<div class="fx-trr" data-a="sel" data-k="${x.g.k}" data-go="1"><span class="n">${esc(x.g.t)}</span><span class="m">+${h1(x.dh)} h</span><b>${usd0(x.dh*RATE)}</b></div>`).join('')||'<div class="fx-none">Every quote is close.</div>'}<div class="fx-cf">${ic('info',12)}Dollars are labor not billed per job, at $210 an hour.</div></div></div></div></div>`; }
/* ---------- popovers ---------- */""", 1)

rep("  if(p.type==='srch'){", r"""  if(p.type==='cons'){ const k=p.k, g=grp(k), s=stats(k), O=opensOf(k), o=O.find(pend)||O[0], tab=p.tab||'start', std=S.std[k];
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('What the tech sees',`${o?esc(PPL[o.tech])+' · RO '+o.no:'on the Console and the phone app'}`)}<div class="fx-tabs tg-seg3"><button class="${tab==='start'?'on':''}" data-a="ctab" data-v="start">When the clock starts</button><button class="${tab==='stop'?'on':''}" data-a="ctab" data-v="stop">When it stops</button></div>
      <div class="fx-con"><div class="bar"><span class="dot"></span>Console${o?' · '+F(o.tech):''}<span class="sp"></span>${o?'RO '+o.no:''}</div>${tab==='start'?`<div class="t">${esc(g.t)}</div><div class="chips"><span>Fixed ${s.n}× before</span><span>usually ${h1(s.hrs)} h</span>${std?'<span class="std">shop standard</span>':''}</div>
        ${STEPS[k]?`<div class="sec">Check first</div>${STEPS[k].map((x,i)=>`<div class="st"><span>${i+1}</span>${esc(x[0])}</div>`).join('')}`:''}
        <div class="sec">The usual fix</div><p>${esc(s.causes[0][0])} → ${esc(std?std.fix:s.fixes[0][0])}</p>${std&&std.note?`<p class="nt">${esc(std.note)}</p>`:''}
        ${s.parts.length?`<div class="sec">Parts</div>${s.parts.slice(0,3).map(x=>`<p>${esc(x.p[1])} · ${x.p[0]}</p>`).join('')}`:''}<div class="go"><span class="b">Got it</span></div>`
      :`<div class="t">Did the usual fix work?</div><p>${esc(std?std.fix:s.fixes[0][0])}</p><div class="ans"><button data-a="cans" data-v="Yes — fixed">Yes — fixed</button><button data-a="cans" data-v="Not sure yet">Not sure yet</button><button data-a="cans" data-v="No — something else">No — something else</button></div><p class="nt">The answer counts toward Held. “Something else” asks for the cause.</p>`}</div>
      <div class="fx-nb">${ic('info',12)}Shows when ${o?F(o.tech):'the tech'} starts the clock on this complaint — same card on the phone app.</div></div>`; }
  if(p.type==='std'){ const k=p.k, s=stats(k), cur=S.std[k];
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Make it the shop standard',esc(grp(k).t))}<div class="fx-ctx">The standard shows first — here, on the Console, and when someone presses Use fix. Foreman, lead tech or manager.</div>
      <span class="tg-lbl top">Correction</span>${s.fixes.map((x,i)=>`<button class="tg-mi${(p.f!=null?p.f:(cur?s.fixes.findIndex(y=>y[0]===cur.fix):0))===i?' on':''}" data-a="sfix" data-i="${i}" style="height:auto;min-height:40px;padding:6px 10px !important;white-space:normal;line-height:18px">${kbd(i+1)}<span style="flex:1">${esc(x[0])}</span><span class="meta">${x[1]} of ${s.n}</span></button>`).join('')}
      <label class="fx-f"><span>Note for the tech</span><input id="fx-sn" value="${esc(p.n!=null?p.n:(cur&&cur.note)||'')}" placeholder="e.g. Check the connector before you test the actuator"></label>
      <div class="tg-acts">${cur?'<button class="btn btn-sm tg-gh" data-a="sclr">Remove standard</button>':''}<span class="hint">Set by ${F(me())} · ${myRole()}</span><button class="btn btn-sm btn-primary" data-a="sgo">Make standard${kbd('↵')}</button></div></div>`; }
  if(p.type==='kit'){ const k=p.k, s=stats(k), sel=p.sel||(p.sel=Object.fromEntries(s.parts.filter(x=>x.n/s.n>=0.5).map(x=>[x.p[0],true]))), tot=s.parts.filter(x=>sel[x.p[0]]).reduce((a,x)=>a+x.p[2]*x.p[3],0);
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Make a kit',esc(grp(k).t))}<label class="fx-f" style="margin-top:0"><span>Kit name</span><input id="fx-kn" value="${esc(p.n!=null?p.n:grp(k).t.split(' — ')[0]+' job')}"></label>
      <span class="tg-lbl top" style="margin-top:8px">Parts</span>${s.parts.map(x=>`<label class="fx-ln" data-a="kpk" data-pn="${x.p[0]}"><input type="checkbox" ${sel[x.p[0]]?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.p[1])} · <span style="font-family:var(--tg-mono);font-weight:500">${x.p[0]}</span></b><small>used on ${x.n} of ${s.n} · ${ONHAND[x.p[0]]!=null?ONHAND[x.p[0]]+' on hand':'—'}</small></span><span class="r"><b>${usd(x.p[3])}</b>× ${x.p[2]}</span></label>`).join('')}
      <div class="tg-acts"><span class="hint">Goes to Parts → Catalog · ${usd(tot)}</span><button class="btn btn-sm btn-primary" data-a="kgo">Make kit${kbd('↵')}</button></div></div>`; }
  if(p.type==='photo'){ const x=PH[p.k][+p.i];
    return `<div class="tg-pop xf fx-pop-x" ${st}>${hd(esc(x[0]),'RO '+x[1])}<div class="fx-big" style="background:linear-gradient(135deg,${x[2]},${x[3]})">${ic(+p.i===4?'file':'image',40)}</div><div class="tg-acts"><span class="hint">From RO ${x[1]} · ${fd(addD(TODAY,-20-+p.i*9))}</span><button class="btn btn-sm" data-a="toast" data-t="Downloaded.">${ic('download',14)}Download</button></div></div>`; }
  if(p.type==='flt2'){ const row=(lbl,f,opts)=>`<span class="tg-lbl top">${lbl}</span><div class="tg-r" style="margin-bottom:6px">${opts.map(o=>`<button class="tg-chip${U[f]===o[0]?' on':''}" data-a="fset2" data-f="${f}" data-v="${o[0]}">${esc(o[1])}</button>`).join('')}</div>`;
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Filter the fixes','only the jobs that match')}${row('Engine','fe',[['D13','D13'],['D13 TC','D13 TC'],['D11','D11']])}${row('Model','fmdl',[['VNL','VNL'],['VNR','VNR'],['VHD','VHD']])}${row('Miles','fmi',[['lo','Under 300k'],['mid','300k–500k'],['hi','Over 500k']])}
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="fclr" data-f="all">Clear</button><span class="hint">${G0.reduce((s,g)=>s+ents(g.k).length,0)} fixes match</span><button class="btn btn-sm btn-primary" data-a="popx">Done${kbd('↵')}</button></div></div>`; }
  if(p.type==='srch'){""")

# ================= actions =================
rep("  else if(a==='undo'){", r"""  else if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }
  else if(a==='gocb'){ const o=S.O.find(x=>x.cb); U.view='lib'; U.sel=o.k; U.pop=null; render(); }
  else if(a==='tofix'){ U.hl=t.dataset.ro; render(); const el=$(`.fx-er[data-ro="${U.hl}"]`); if(el) el.scrollIntoView({block:'center'}); }
  else if(a==='cbsend'){ toast(`Sent to Frank — flagged as a comeback, with RO ${S.O.find(x=>x.no===t.dataset.no).cb.ro} linked.`,false); render(); }
  else if(a==='stp'){ e.preventDefault(); const d=U.steps[t.dataset.k]=U.steps[t.dataset.k]||{}; d[t.dataset.i]=!d[t.dataset.i]; render(); }
  else if(a==='qset'){ const k=t.dataset.k, s=stats(k); snap(); S.qo[k]=Math.round(s.hrs*10)/10; toast(`The usual quote is now ${h1(S.qo[k])} h — Use fix and the writer’s estimate start from it.`); render(); }
  else if(a==='qkeep'){ snap(); S.qk[t.dataset.k]=1; toast('Kept — it asks again if the gap grows.'); render(); }
  else if(a==='ctab'){ p.tab=t.dataset.v; render(); }
  else if(a==='cans'){ U.pop=null; toast(`Logged — “${t.dataset.v}”. It counts toward Held.`,false); render(); }
  else if(a==='sfix'){ p.f=+t.dataset.i; render(); }
  else if(a==='sgo'){ const s=stats(p.k), cur=S.std[p.k], i=p.f!=null?p.f:(cur?Math.max(0,s.fixes.findIndex(y=>y[0]===cur.fix)):0); snap(); S.std[p.k]={fix:s.fixes[i][0],note:(($('#fx-sn')||{}).value||'').trim(),by:me(),at:'Oct 22'}; U.pop=null; toast(`Shop standard set by ${F(me())} — it shows first, here and on the Console.`); render(); }
  else if(a==='sclr'){ snap(); delete S.std[p.k]; U.pop=null; toast('Standard removed.'); render(); }
  else if(a==='kpk'){ e.preventDefault(); p.sel[t.dataset.pn]=!p.sel[t.dataset.pn]; render(); }
  else if(a==='kgo'){ snap(); const n=(($('#fx-kn')||{}).value||'Kit').trim(), id='KIT-'+p.k.toUpperCase()+'-01'; S.kits[p.k]={id,n}; U.pop=null; toast(`${id} added to Parts → Catalog — “${n}”.`); render(); }
  else if(a==='fset2'){ const f=t.dataset.f; U[f]=U[f]===t.dataset.v?null:t.dataset.v; render(); }
  else if(a==='fclr'){ const f=t.dataset.f; if(f==='all'){ U.fe=U.fmdl=U.fmi=null; } else U[f]=null; render(); }
  else if(a==='undo'){""")
rep("U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"]')", "U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],.tk-note')")
rep("if(t.dataset.k) ex.k=t.dataset.k;", "if(t.dataset.k) ex.k=t.dataset.k; if(t.dataset.i!=null) ex.i=t.dataset.i;")
rep("  if(id==='fx-c') p.c=e.target.value;", "  if(id==='fx-sn') p.n=e.target.value; if(id==='fx-kn') p.n=e.target.value;\n  if(id==='fx-c') p.c=e.target.value;")

# ================= spotlight notes =================
rep("<div class=\"tk-tip\" hidden></div></div>${TOAST?", "<div class=\"tk-tip\" hidden></div><div class=\"tk-ring\" hidden></div><div class=\"tk-note\" hidden></div></div>${TOAST?")
rep("if(U.pop&&!U.pop._f){ const f=$('.tg-pop #fx-sq')||$('.tg-pop #fx-acmp'); if(f){ U.pop._f=1; f.focus(); } }\n}", r"""if(U.pop&&!U.pop._f){ const f=$('.tg-pop #fx-sq')||$('.tg-pop #fx-acmp'); if(f){ U.pop._f=1; f.focus(); } }
  note();
}
const NOTE={
 1:{r:'.fx-steps',t:'Check first',p:'An ordered checklist built from every way this complaint was fixed — the cheap checks first. Tick them off as you go; the same list shows on the tech’s Console.'},
 2:{r:'.tg-pop',at:'left',t:'On the Console and phone',p:'When the clock starts on a complaint that’s been fixed before, the tech gets the usual fix. When it stops, one tap: did it work? The answer counts toward Held.'},
 3:{r:'.fx-cb',t:'Comeback alert',p:'Same truck, same complaint, inside 30 days. It links straight to the first fix and flags it for Frank — and the old fix now shows “Back now”.'},
 4:{r:'.tg-pop',at:'left',t:'Shop standard',p:'The foreman, a lead tech or the manager picks the best fix and adds a note. It shows first everywhere, with a star in the list.'},
 5:{r:'.fx-ts',t:'Tech support said',p:'Case numbers and what support told us, kept with the complaint — so the next tech starts where the last one ended.'},
 6:{r:'.fx-ph',t:'Photos and files',p:'Failed parts, before and after, Tech Tool printouts — from the ROs, or straight from the phone app. Click one to open it.'},
 7:{r:'.fx-or.code',t:'Matched by code',p:'The complaint says “check engine light”, but the code is SPN 3226 FMI 2 — the same code as the NOx sensor fixes. It matches on the code, not just the words.'},
 8:{r:'.tg-pop',at:'left',t:'Kit from a fix',p:'One click turns the usual parts into a kit in the Parts catalog — so the next one is pulled in one go.'},
 9:{r:'.fx-qc',t:'Quote check',p:'When the job keeps taking longer than the quote, it says how much labor isn’t being billed and offers to update the usual quote.'},
 10:{r:'.tg-pop',at:'right',t:'Filters',p:'Engine, model and miles. The list, the counts and the usual fix all follow — here, only the D13 TC jobs.'},
 11:{r:'.fx-war',t:'For a warranty claim',p:'The causal part, labor and the complaint-cause-correction story, already written from the usual fix. Copy it, or Warranty starts from it.'},
 12:{r:'.fx-trend',n:'.fx-trend > div:last-child',t:'Trends',p:'Last 90 days for the foreman and the manager: what keeps coming in, what didn’t hold, and which quotes run short. Click a row to open it.'}
};
function box(sels){ const L=[].concat(sels).map(s=>$(s)).filter(Boolean); if(!L.length) return null; const tk=$('.fx').getBoundingClientRect(); let l=1e9,t=1e9,r=-1e9,b=-1e9;
  L.forEach(e=>{ const x=e.getBoundingClientRect(); l=Math.min(l,x.left); t=Math.min(t,x.top); r=Math.max(r,x.right); b=Math.max(b,x.bottom); }); return {l:(l-tk.left)/scale,t:(t-tk.top)/scale,r:(r-tk.left)/scale,b:(b-tk.top)/scale}; }
const pick=s=>Array.isArray(s)?s.find(x=>$(x)):s;
function note(){ const nt=$('.tk-note'), rg=$('.tk-ring'), tk=$('.fx'); if(!nt||!rg||!tk) return; const N=U.note&&NOTE[U.note]; const R=N?(N.u?box(N.u):box(pick(N.r))):null;
  if(!R){ nt.hidden=true; rg.hidden=true; return; }
  rg.hidden=false; Object.assign(rg.style,{left:(R.l-5)+'px',top:(R.t-5)+'px',width:(R.r-R.l+10)+'px',height:(R.b-R.t+10)+'px'});
  nt.innerHTML=`<div class="h"><span class="n">${U.note}</span><b>${esc(N.t)}</b><button data-a="notex" title="Close">${ic('x',13)}</button></div><p>${esc(N.p)}</p>`; nt.hidden=false;
  const A=(N.n&&box(pick(N.n)))||R, W=tk.offsetWidth, H=tk.offsetHeight, nw=nt.offsetWidth, nh=nt.offsetHeight; let x, y;
  if(N.at==='right'&&A.r+nw+16<W-12){ x=A.r+16; y=A.t-6; } else if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; } else { x=N.al==='right'?A.r-nw:A.l; y=A.b+12; if(y+nh>H-12) y=A.t-nh-16; }
  nt.style.left=Math.round(Math.max(12,Math.min(x,W-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }""")

i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const scrollTo_=sel=>{ const el=$(sel), pn=$('.fx-pane'); if(el&&pn){ pn.scrollTop=Math.max(0,el.offsetTop-150); note(); } };
const DEMO={
  d1:()=>{reset();setRole('fm');U.sel='cts';U.note=1;render();},
  d2:()=>{reset();setRole('fm');render();const b=$('[data-a="pop"][data-p="cons"]');openPop('cons',{k:'nox'},b);U.note=2;render();},
  d3:()=>{reset();setRole('fm');U.note=3;render();},
  d4:()=>{reset();setRole('fm');U.sel='turbo';render();const b=$('[data-a="pop"][data-p="std"]');openPop('std',{k:'turbo',f:0,n:'Check the connector, then run the actuator test — a re-pin alone came back.'},b);U.note=4;render();},
  d5:()=>{reset();setRole('fm');U.sel='egr';U.note=5;render();scrollTo_('.fx-ts');},
  d6:()=>{reset();setRole('fm');U.sel='wp';U.note=6;render();scrollTo_('.fx-ph');},
  d7:()=>{reset();setRole('tr');U.view='open';U.note=7;render();},
  d8:()=>{reset();setRole('fm');U.sel='ac';render();const b=$('[data-a="pop"][data-p="kit"]');openPop('kit',{k:'ac'},b);U.note=8;render();},
  d9:()=>{reset();setRole('fm');U.sel='seal';U.note=9;render();},
  d10:()=>{reset();setRole('fm');U.fe='D13 TC';U.sel='inj';render();const b=$('[data-a="pop"][data-p="flt2"]');openPop('flt2',{},b);U.note=10;render();},
  d11:()=>{reset();setRole('fm');U.sel='alt';U.note=11;render();scrollTo_('.fx-war');},
  d12:()=>{reset();setRole('mg');U.view='trend';U.note=12;render();},
  try:()=>{reset();setRole('fm');render();}
};""" + JS[j:]

CSS += r"""
/* ===== the 12 ideas ===== */
.tk-ring{position:absolute;z-index:38;border-radius:12px;box-shadow:0 0 0 2px var(--tg-acc),0 0 0 7px color-mix(in srgb,var(--tg-acc) 22%,transparent);pointer-events:none;}
.tk-note{position:absolute;z-index:45;width:300px;padding:11px 13px 13px;border-radius:12px;background:var(--tg-ink);color:var(--tg-panel);box-shadow:0 16px 40px -10px rgba(0,0,0,.45);font-size:12.5px;line-height:18px;}
.tk-note .h{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.tk-note .n{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 4px;border-radius:10px;background:var(--tg-acc);color:#fff;font:600 11px/1 var(--tg-sans);flex:none;}
.tk-note b{font-size:13px;font-weight:600;}
.tk-note p{margin:0;color:color-mix(in srgb,var(--tg-panel) 80%,transparent);}
.tk-note button{all:unset;cursor:pointer;margin-left:auto;display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;opacity:.7;} .tk-note button:hover{opacity:1;background:rgba(128,128,128,.25);}
.tg-hf.bad,.tg-hf.bad b{color:var(--tg-bad);}
.fx-star{display:inline-flex;color:var(--tg-acc);flex:none;} .fx-star svg{fill:currentColor;}
.fx-fchips{display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 8px;}
.fx-fc{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 6px 0 8px !important;border-radius:6px;font-size:11.5px;font-weight:500;background:var(--tg-acct);color:var(--tg-acctx);}
.fx-fc.clr{background:none;color:var(--tg-ink3);padding:0 6px !important;}
/* 3 · comeback */
.fx-cb{display:flex;gap:12px;align-items:center;padding:12px 14px 12px 16px;border-radius:14px;background:var(--tg-bad-t);font-size:13px;line-height:19px;color:var(--tg-ink);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-bad) 30%,transparent);}
.fx-cb > .tg-ic{color:var(--tg-bad);flex:none;} .fx-cb span{flex:1;} .fx-cb b{font-weight:600;color:var(--tg-bad);}
.fx-er.hl{background:var(--tg-sel);box-shadow:inset 3px 0 0 var(--tg-bad);}
.fx-cbt{display:inline-flex;align-items:center;gap:4px;color:var(--tg-bad);font-weight:500;}
.fx-or.cb{background:color-mix(in srgb,var(--tg-bad) 5%,transparent);}
.fx-or.code{background:var(--tg-acct);}
.fx-bycode{display:inline-flex;align-items:center;gap:4px;color:var(--tg-acctx) !important;}
/* 1 · check first */
.fx-step{display:grid;grid-template-columns:26px minmax(0,1fr) 60px;gap:12px;align-items:center;padding:9px 16px;box-shadow:inset 0 1px 0 var(--tg-hair);cursor:pointer;}
.fx-step:first-of-type{box-shadow:none;}
.fx-step .n{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:600 11.5px/1 var(--tg-sans);background:var(--tg-fill);color:var(--tg-ink2);}
.fx-step.done .n{background:var(--tg-good);color:#fff;}
.fx-step .d{display:flex;flex-direction:column;gap:2px;min-width:0;} .fx-step .d b{font-size:13.5px;font-weight:500;} .fx-step .d small{font-size:12px;color:var(--tg-ink3);}
.fx-step.done .d b{text-decoration:line-through;color:var(--tg-ink3);}
.fx-step .s{font-size:12px;color:var(--tg-ink3);text-align:right;white-space:nowrap;}
.fx-step:hover{background:var(--tg-fill);}
.fx-cf{display:flex;align-items:center;gap:6px;padding:8px 16px 10px;font-size:12px;color:var(--tg-ink3);box-shadow:inset 0 1px 0 var(--tg-hair);}
.fx-steps .fx-ch small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
/* 9 · quote check */
.fx-qc{display:flex;gap:12px;align-items:center;padding:12px 14px 12px 16px;border-radius:14px;background:var(--tg-acct);box-shadow:inset 0 0 0 1px var(--tg-accl);font-size:13px;line-height:19px;}
.fx-qc > .tg-ic{color:var(--tg-acctx);flex:none;} .fx-qc span{flex:1;} .fx-qc b{font-weight:600;}
/* 4 · standard */
.fx-std{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:6px;font-size:11.5px;font-weight:600;background:var(--tg-acct);color:var(--tg-acctx);}
.fx-std svg{fill:currentColor;}
.fx-stdn{display:flex;gap:5px;align-items:flex-start;color:var(--tg-acctx) !important;}
/* 8 · kit */
.fx-plh{display:flex;align-items:center;gap:8px;margin-bottom:4px;min-height:24px;} .fx-plh .btn{margin-left:auto;height:24px;}
.fx-kitc{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:500;color:var(--tg-good);}
/* 5 · tech support */
.fx-tsr{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:start;padding:10px 16px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;line-height:19px;}
.fx-tsr:first-of-type{box-shadow:none;}
.fx-tsr .m{font:500 12px/19px var(--tg-mono);color:var(--tg-ink2);} .fx-tsr .d{display:flex;flex-direction:column;gap:2px;} .fx-tsr .d small{font-size:12px;color:var(--tg-ink3);}
/* 6 · photos */
.fx-phg{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;padding:12px 16px 14px;}
.fx-pht{all:unset;cursor:pointer;display:flex;flex-direction:column;gap:3px;min-width:0;}
.fx-pht i{display:grid;place-items:center;aspect-ratio:4/3;border-radius:10px;color:rgba(255,255,255,.75);}
.fx-pht:hover i{outline:2px solid var(--tg-acc);outline-offset:2px;}
.fx-pht b{font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fx-pht small{font-size:11.5px;color:var(--tg-ink3);}
.fx-big{display:grid;place-items:center;height:300px;border-radius:12px;color:rgba(255,255,255,.7);}
/* 11 · warranty */
.fx-wr{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,.7fr) minmax(0,1fr);gap:12px;padding:12px 16px 4px;}
.fx-wr small{display:block;font-size:11.5px;color:var(--tg-ink3);} .fx-wr b{display:block;font-size:13.5px;font-weight:500;line-height:20px;}
.fx-ws{margin:8px 16px 12px;padding:10px 12px;border-radius:10px;background:var(--tg-canvas);font-size:13px;line-height:19px;}
.fx-ws p{margin:0;} .fx-ws b{font-weight:600;display:inline-block;min-width:82px;}
/* 2 · console */
.fx-tabs{margin:0 0 10px;}
.fx-con{border-radius:14px;background:#17171a;color:#ecebe8;padding:12px 14px 14px;font-size:13px;line-height:19px;}
.fx-con .bar{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#a19f99;margin-bottom:8px;} .fx-con .bar .sp{flex:1;} .fx-con .dot{width:7px;height:7px;border-radius:50%;background:#3fb27f;}
.fx-con .t{font:500 18px/24px var(--tg-serif);color:#fff;margin-bottom:6px;}
.fx-con .chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;} .fx-con .chips span{height:20px;display:inline-flex;align-items:center;padding:0 7px;border-radius:6px;background:rgba(255,255,255,.1);font-size:11.5px;} .fx-con .chips .std{background:#c99a5b;color:#17171a;font-weight:600;}
.fx-con .sec{margin:10px 0 3px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#a19f99;}
.fx-con p{margin:0 0 2px;} .fx-con p.nt{color:#c99a5b;font-size:12.5px;margin-top:6px;}
.fx-con .st{display:flex;gap:8px;align-items:center;margin:2px 0;} .fx-con .st span{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);font-size:10.5px;font-weight:600;flex:none;}
.fx-con .go{display:flex;justify-content:flex-end;margin-top:10px;} .fx-con .go .b{height:28px;display:inline-flex;align-items:center;padding:0 12px;border-radius:8px;background:#ecebe8;color:#17171a;font-weight:600;font-size:12.5px;}
.fx-con .ans{display:flex;flex-direction:column;gap:6px;margin:10px 0 4px;} .fx-con .ans button{all:unset;cursor:pointer;height:34px;display:flex;align-items:center;padding:0 12px;border-radius:9px;background:rgba(255,255,255,.1);font-weight:500;} .fx-con .ans button:hover{background:rgba(255,255,255,.18);} .fx-con .ans button:first-child{background:#3fb27f;color:#0c1f17;}
/* 12 · trends */
.fx-trend{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px;align-items:start;}
.fx-tbar{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) 30px 46px;gap:12px;align-items:center;min-height:38px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;cursor:pointer;}
.fx-tbar:hover{background:var(--tg-fill);}
.fx-tbar .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fx-tbar .b{position:relative;height:10px;border-radius:5px;background:var(--tg-hair);overflow:hidden;} .fx-tbar .b i{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:var(--tg-ink2);}
.fx-tbar > b{font:600 12.5px/1 var(--tg-mono);text-align:right;} .fx-tbar .d{font-size:12px;color:var(--tg-ink3);text-align:right;} .fx-tbar .d.up{color:var(--tg-warn);font-weight:500;} .fx-tbar .d.dn{color:var(--tg-good);}
.fx-tbar.sy .n{display:flex;align-items:center;gap:8px;} .fx-tbar.sy .n svg{color:var(--tg-ink3);flex:none;}
.fx-or.cb,.fx-or.code{margin:3px 0;}
.fx-trr{display:grid;grid-template-columns:minmax(0,1fr) auto 64px;gap:12px;align-items:center;min-height:38px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;cursor:pointer;}
.fx-trr:hover{background:var(--tg-fill);}
.fx-trr .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fx-trr > b{font:600 12.5px/1 var(--tg-mono);text-align:right;} .fx-trr .m{font:500 12px/1 var(--tg-mono);color:var(--tg-warn);}
"""

used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "filter", "engine", "drop", "bolt", "air", "snow", "gear2", "book", "note", "merge", "chart", "sliders", "star", "image", "file", "eye", "phone", "gauge", "link", "pin", "download"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("d1", "1 · Check first"), ("d2", "2 · Console"), ("d3", "3 · Comeback"), ("d4", "4 · Standard"), ("d5", "5 · Tech support"), ("d6", "6 · Photos"), ("d7", "7 · Code match"), ("d8", "8 · Kit"), ("d9", "9 · Quote check"), ("d10", "10 · Filters"), ("d11", "11 · Warranty"), ("d12", "12 · Trends"), ("try", "Try it")])
about = [
 ("1 · Check first", "An ordered checklist from every way it was fixed — cheap checks first."),
 ("2 · On the Console", "The usual fix when the clock starts; “did it work?” when it stops."),
 ("3 · Comeback alert", "Same truck, same complaint inside 30 days, linked to the first fix."),
 ("4 · Shop standard", "The best fix, picked by the foreman, lead tech or manager, shown first."),
 ("5 · Tech support", "Case numbers and what support said, kept with the complaint."),
 ("6 · Photos and files", "Failed parts, before and after, printouts."),
 ("7 · Code match", "A differently worded complaint matched by its fault code."),
 ("8 · Kit from a fix", "The usual parts become a kit in the Parts catalog."),
 ("9 · Quote check", "When jobs run longer than quoted, update the usual quote."),
 ("10 · Filters", "Engine, model and miles."),
 ("11 · Warranty", "The causal part and story, written from the usual fix."),
 ("12 · Trends", "Repeat complaints, comebacks and short quotes for the foreman and manager."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Fixes ideas</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Fixes — ideas</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg">{"".join(f'<button data-role="{k}"{" class=\"is-on\"" if k=="fm" else ""}>{n}</button>' for k, n in [("tech","Technician"),("lt","Lead tech"),("fm","Foreman"),("tr","Triage"),("mg","Manager")])}</span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Fixes ideas<small>Each button opens the moment that idea shows. Built on Fixes v2. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
