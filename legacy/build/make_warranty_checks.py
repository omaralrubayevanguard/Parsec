# Warranty — group 4: checks that stop claims coming back. Labor against the SRT (claim the SRT,
# give a reason, or ask Volvo for the extra), coverage from the warranty start date and miles against
# the terms you set, and why claims came back — tallied, with a heads-up on a claim that looks like one.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
PK = os.path.join(B, "make_warranty_packet.py")
SRC = os.path.join(B, "make_warranty.py")
t = open(PK).read()
lib = t.split('\ng = {"__name__"')[0]
ns = {"__file__": PK, "__name__": "packet_lib"}
exec(compile(lib, PK, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:90], c)
    src = src.replace(a, b)

# ---------- data: SRT on each ready job, a coverage on every job ----------
rep("st:'ready',claim:{code:'SPN 167 FMI 1'}", "st:'ready',cov:'base',srt:{op:'3211-01-04',name:'Alternator, replace',hrs:1.6},claim:{code:'SPN 167 FMI 1'}")
rep("q:3.0,b:3.3,cost:1134.40,done:9,st:'returned',", "q:3.0,b:3.3,cost:1134.40,done:9,st:'returned',cov:'engine',srt:{op:'2611-03-02',name:'Water pump, replace',hrs:3.0},")
rep("cost:812.30,done:27,st:'ready',claim:{code:''}", "cost:812.30,done:27,st:'ready',cov:'prev',srt:{op:'7732-02-01',name:'Wheel seal, drive axle, replace',hrs:2.2},claim:{code:''}")
rep("cost:893.60,done:1,st:'ready',claim:{code:'SPN 3226 FMI 2'}", "cost:893.60,done:1,st:'ready',cov:'emis',srt:{op:'2584-05-01',name:'NOx sensor, outlet, replace',hrs:1.0},claim:{code:'SPN 3226 FMI 2'}")
rep("cost:470.05,done:1,st:'ready',claim:{code:''}", "cost:470.05,done:1,st:'ready',cov:'base',srt:{op:'5641-02-03',name:'Air dryer purge valve, replace',hrs:1.2},claim:{code:''}")
rep("cost:235.40,done:2,st:'ready',ask:", "cost:235.40,done:2,st:'ready',cov:'engine',srt:{op:'2611-08-01',name:'Coolant level sensor, replace',hrs:0.8},ask:")
rep("ws:'10-11-2020',cs:'C-9151'", "ws:'04-11-2025',cs:'C-9151'")
rep("ws:'02-03-2020',cs:'C-9133'", "ws:'02-03-2023',cs:'C-9133'")
for k, v in [("Coolant leak at water pump',cause:'Seal leaking", "engine"), ("Radiator leak", "base"), ("Misfire cylinder 4", "engine"), ("DEF doser clogged", "emis"), ("Coolant temp sensor", "engine"), ("Turbo actuator fault", "engine"), ("EGR valve stuck", "emis"), ("DPF regen fault", "emis"), ("Clean DPF and replace", "emis"), ("Recall 24V-118", "recall")]:
    rep("cmp:'" + k, "cov:'" + v + "',cmp:'" + k)

rep("const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30,pa:1500};", r"""const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30,pa:1500,rate:210,cov:[['base','Base vehicle',24,250000],['engine','Engine',60,500000],['emis','Aftertreatment',60,300000],['prev','Previous repair',12,0],['recall','Recall / campaign',0,0]]};
/* returns in the last 90 days — what Volvo sent back and why */
const RETS=[['36877','Kernersville Freight','Coolant leak at water pump','21468475','srt','Labor 0.5 h over the SRT, no reason given',23],['36790','Yadkin Valley Logistics','Outlet NOx sensor','22827993','dtc','No Tech Tool DTC readout attached',31],
 ['36702','Rowan Ready Mix','Water pump leaking','21468475','photo','Causal part photo missing',38],['36655','Surry Feed & Seed','DPF pressure sensor','22303390','photo','Causal part photo missing',45],
 ['36610','Piedmont Aggregates','Water pump gasket leak','20734235','causal','Wrong causal part — gasket claimed, the pump failed',52],['36588','Triad Cold Chain','Turbo actuator','23154112','srt','Labor 0.8 h over the SRT',57],
 ['36541','Elkin Hardwoods','Radiator leak','21712578','coverage','Outside base coverage',63],['36502','Dixie Fleet Services','EGR cooler','23199543','photo','Causal part photo missing',70],
 ['36470','Uwharrie Fuel','Injector cylinder 2','85020422','srt','Labor 0.4 h over the SRT',76],['36433','Midway Auto Transport','DEF doser','23380146','dtc','No DTC readout',84]];
const RWHY={photo:['Causal part photo missing','Photo of the failed part'],srt:['Labor over the SRT','Labor within the SRT'],dtc:['No DTC readout','DTC readout'],causal:['Wrong causal part','Causal part picked'],coverage:['Outside coverage','Inside coverage']};
const KW=['water pump','nox','dpf','egr','alternator','turbo','injector','wheel seal','def','radiator'];""")

# ---------- SRT + coverage logic ----------
rep("const EV=r=>r.ev||{dash:1,photos:2,dtc:1};", r"""const EV=r=>r.ev||{dash:1,photos:2,dtc:1};
const claimH=o=>o.claim.hrs?+o.claim.hrs:(o.srt?Math.max(o.srt.hrs,o.b):o.b);
const overSrt=o=>o.srt?Math.round((claimH(o)-o.srt.hrs)*10)/10:0;
const srtOk=o=>!o.srt||overSrt(o)<=0.05||!!o.srtWhy;
const moIn=ws=>{ const m=/^(\d\d)-(\d\d)-(\d{4})$/.exec(ws||''); if(!m) return null; return (2026-+m[3])*12+(10-+m[1])+(22>=+m[2]?0:-1); };
const ymTxt=mo=>{ const y=Math.floor(mo/12), m=mo%12; return (y?y+' yr ':'')+(m||!y?m+' mo':'').trim(); };
const num=s=>+String(s||'').replace(/,/g,'');
function covOf(r,o){ const C=S.cfg.cov, c=C.find(x=>x[0]===(o.cov||'base'))||C[0], k=c[0];
  if(k==='recall') return {c,st:'in',txt:'no time or mile limit',pct:0};
  if(k==='prev'){ if(!r.back) return {c,st:'unknown',txt:'no earlier repair on this unit',pct:0}; const mo=r.back.days/30.4, pct=c[2]?mo/c[2]:0; return {c,st:pct>=1?'out':pct>=0.9?'near':'in',txt:`${r.back.days} days since RO-${r.back.no} · limit ${c[2]} mo`,pct}; }
  const mo=moIn(r.ws); if(mo==null) return {c,st:'unknown',txt:'add the warranty start date to check',pct:0};
  const mi=num(r.mi), pm=c[2]?mo/c[2]:0, pi=c[3]?mi/c[3]:0, pct=Math.max(pm,pi), st=pct>=1?'out':pct>=0.9?'near':'in';
  return {c,st,mo,mi,pct,txt:`${mo} of ${c[2]} months${c[3]?` · ${mi.toLocaleString('en-US')} of ${c[3].toLocaleString('en-US')} mi`:''}`}; }
function headsUp(o){ const cp=o.parts[o.causal], low=o.cmp.toLowerCase(), kw=KW.find(w=>low.includes(w));
  return RETS.filter(x=>(cp&&x[3]===cp[1])||(kw&&x[2].toLowerCase().includes(kw))).sort((a,b)=>a[6]-b[6])[0]||null; }""")
rep("  if(big) a('Pre-approval #',!!r.pa,1,'Approvals','field:pa','pre-approval #');", """  if(big) a('Pre-approval #',!!r.pa,1,'Approvals','field:pa','pre-approval #');
  if(o.srt) a('Labor within the SRT',srtOk(o),1,'Checks','srt','over SRT');
  { const cv=covOf(r,o); if(r.ws||cv.c[0]==='prev'||cv.c[0]==='recall') a('Inside coverage',cv.st!=='out',1,'Checks','cov','outside coverage'); }""")
rep("const FIXL={'ask':r=>'Ask '+TF(r.tech),", "const FIXL={'srt':()=>'Fix labor','cov':()=>'Coverage…','ask':r=>'Ask '+TF(r.tech),")
rep("['Labor hours',o.claim.hrs||o.b.toFixed(1)]", "['Labor hours',claimH(o).toFixed(1)],['SRT op #',o.srt?o.srt.op:'']")

# ---------- claim card: a Checks block under the parts ----------
rep("""     <div class="wx-lab"><span>Quoted""", """     ${checksBlock(r,o,i,s!=='paid'&&s!=='denied')}
     <div class="wx-lab"><span>Quoted""")
rep("function comeback(r){", r"""function checksBlock(r,o,i,live){ if(['submitted','approved','paid'].includes(o.st)) return ''; const cv=covOf(r,o), ov=overSrt(o), hu=(o.st==='ready'||o.st==='returned'||o.st==='repair')?headsUp(o):null;
  const ccls=cv.st==='out'?'bad':cv.st==='near'?'warn':cv.st==='unknown'?'warn':'ok';
  const cov=`<div class="wx-c2 ${ccls}"><span class="k">Coverage</span><span class="v"><b>${cv.st==='out'?'Outside ':cv.st==='near'?'Near the end of ':cv.st==='unknown'?'':'Inside '}${esc(cv.c[1])}</b> · ${esc(cv.txt)}</span>${cv.pct?`<span class="bar"><i style="width:${Math.min(100,cv.pct*100).toFixed(0)}%"></i></span>`:''}${live?(cv.st==='unknown'&&!r.ws?`<button class="btn btn-sm" data-a="fix" data-fix="field:ws" data-ro="${r.no}" data-op="${i}">Add start</button>`:`<button class="btn btn-sm" data-a="fix" data-fix="cov" data-ro="${r.no}" data-op="${i}">${cv.st==='out'?'Coverage…':'Change'}</button>`):''}</div>`;
  const srt=o.srt?`<div class="wx-c2 ${ov>0.05&&!o.srtWhy?'bad':'ok'}"><span class="k">SRT</span><span class="v">${esc(o.srt.op)} · ${o.srt.hrs.toFixed(1)} h · claiming <b>${claimH(o).toFixed(1)} h</b>${ov>0.05?(o.srtWhy?` · ${ov.toFixed(1)} h over — <i>${esc(o.srtWhy)}</i>`:` · <b>${ov.toFixed(1)} h over</b>, no reason`):claimH(o)>o.b+0.05?` · clocked ${o.b.toFixed(1)} h`:' · within'}</span>${live&&(ov>0.05||o.srtWhy)?`<button class="btn btn-sm" data-a="fix" data-fix="srt" data-ro="${r.no}" data-op="${i}">${o.srtWhy?'Change':'Fix labor'}</button>`:''}</div>`
    :(live&&o.done!=null?`<div class="wx-c2 warn"><span class="k">SRT</span><span class="v">No SRT op on this job yet</span><button class="btn btn-sm" data-a="fix" data-fix="srt" data-ro="${r.no}" data-op="${i}">Add SRT</button></div>`:'');
  let h=''; if(hu){ const w=RWHY[hu[4]], C=checks(r,o), it=C.find(x=>x[0]===w[1]), has=it?it[1]:true;
    h=`<div class="wx-c2 hu ${it&&!has?'bad':'ok'}"><span class="k">${ic('history',12)}Heads-up</span><span class="v">RO-${hu[0]} (${esc(hu[2].toLowerCase())}, ${when(hu[6])}) came back: <b>${esc(w[0].replace(/^./,c=>c.toLowerCase()))}</b>. ${!it?'Worth checking before you file.':has?'This one has it covered.':'This one has the same gap.'}</span><button class="btn btn-sm tg-gh" data-a="rets">See returns</button></div>`; }
  return `<div class="wx-c2s">${cov}${srt}${h}</div>`; }
function comeback(r){""")

# ---------- popovers ----------
rep("  if(p.type==='paid'){", r"""  if(p.type==='srt'){ const s=o.srt, ov=s?overSrt(o):0, cost=(ov*S.cfg.rate);
    if(!s) return `<div class="tg-pop xf wx-smallp">${hd('Add the SRT')}<div class="wx-ctx">Op ${p.op+1} · ${esc(o.cmp)} · clocked ${o.b.toFixed(1)} h</div>
      <div class="wx-grid"><label class="wx-f"><span>SRT op #</span><input id="wx-so" placeholder="from the SRT book"></label><label class="wx-f"><span>SRT hours</span><input id="wx-sh" placeholder="e.g. 1.2"></label></div>
      <div class="tg-acts"><span class="hint">Saved on the claim · the copy list gets it</span><button class="btn btn-sm btn-primary" data-a="srtadd">Save${kbd('↵')}</button></div></div>`;
    const O=[[`Claim the SRT · ${s.hrs.toFixed(1)} h`,`${ov.toFixed(1)} h (${usd(cost)}) stays with the shop`,'Claim '+s.hrs.toFixed(1)+' h'],[`Claim ${claimH(o).toFixed(1)} h with a reason`,'Volvo sees the reason on the claim','Claim '+claimH(o).toFixed(1)+' h'],[`Ask Volvo for the extra ${ov.toFixed(1)} h`,'A pre-approval request · it waits under Waiting on Volvo','Ask Volvo']];
    const R=['Seized or rusted fasteners','Extra diagnosis — tech support case','Another failure found','Access — body or upfit in the way'];
    return `<div class="tg-pop xf">${hd('Labor against the SRT')}<div class="wx-ctx">SRT <b>${esc(s.op)}</b> · ${esc(s.name)} · <b>${s.hrs.toFixed(1)} h</b><br>${esc(TF(r.tech))} clocked <b>${o.b.toFixed(1)} h</b> · the claim says ${claimH(o).toFixed(1)} h · <b>${ov.toFixed(1)} h over</b></div>
      ${O.map((x,k)=>`<button class="wx-opt${p.o===k?' on':''}" data-a="spick" data-i="${k}">${kbd(k+1)}<b>${x[0]}</b><small>${x[1]}</small></button>`).join('')}
      ${p.o===1?`<span class="tg-lbl top" style="margin-top:8px">Reason</span><div class="tg-r">${R.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="swhy" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div><input class="tg-wide" id="wx-sn" placeholder="What happened, for the reviewer (optional)">`:''}
      <div class="tg-acts"><span class="hint">Over the SRT with no reason is the top reason claims come back</span><button class="btn btn-sm btn-primary" data-a="sgo"${p.o==null||(p.o===1&&!p.why)?' disabled':''}>${p.o!=null?esc(O[p.o][2]):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='cov'){ const C=S.cfg.cov, mo=moIn(r.ws);
    return `<div class="tg-pop xf">${hd('Coverage')}<div class="wx-ctx">In service <b>${mo!=null?ymTxt(mo):'—'}</b>${r.ws?` since ${esc(r.ws)}`:''} · <b>${esc(r.mi)} mi</b> · ${esc(r.eh)} h${r.back?` · ${r.back.days} days since RO-${r.back.no}`:''}</div>
      <span class="tg-lbl top">Claim it under</span>${C.filter(c=>o.kind==='RECALL'?c[0]==='recall':c[0]!=='recall'&&(c[0]!=='prev'||r.back)).map((c,k)=>{ const cv=covOf(r,Object.assign({},o,{cov:c[0]})); return `<button class="wx-cv${(o.cov||'base')===c[0]?' on':''}" data-a="vpick" data-k="${c[0]}">${kbd(k+1)}<span class="m"><b>${esc(c[1])}</b><small>${c[0]==='recall'?'no limit':(c[2]?c[2]+' mo':'')+(c[3]?' · '+c[3].toLocaleString('en-US')+' mi':'')}</small></span><span class="wx-cvs ${cv.st}">${cv.st==='out'?'Outside':cv.st==='near'?'Near the end':cv.st==='unknown'?'Can’t check':'Inside'}</span></button>`; }).join('')}
      <span class="tg-lbl top" style="margin-top:8px">Nothing fits</span><button class="wx-opt" data-a="gw" data-to="manager"><span class="tg-role">MG</span><b>Goodwill — ask the manager</b><small>To Tom Hayes · reason “Goodwill request” · it comes back with his answer</small></button><button class="wx-opt" data-a="gw" data-to="writer"><span class="tg-role">AP</span><b>Customer pays</b><small>To Approval · Dana writes a new estimate for the customer</small></button>
      <div class="tg-acts"><button class="tg-link" data-a="terms">Edit coverage terms</button><span class="sp" style="flex:1"></span><button class="btn btn-sm btn-primary" data-a="popx">Done</button></div></div>`; }
  if(p.type==='terms'){ const C=S.cfg.cov;
    return `<div class="tg-pop xf wx-cfgp">${hd('Coverage terms')}<div class="wx-ctx">Examples to start from — set them to your Volvo coverage terms. 0 means no limit.</div>
      <div class="wx-tm h"><span>Coverage</span><span>Months</span><span>Miles</span></div>${C.map((c,k)=>`<div class="wx-tm"><input data-tm="${k}" data-f="1" value="${esc(c[1])}"><input data-tm="${k}" data-f="2" value="${c[2]}"><input data-tm="${k}" data-f="3" value="${c[3]}"></div>`).join('')}
      <div class="tg-acts"><span class="hint">Saved with the shop data · every claim re-checks</span><button class="btn btn-sm btn-primary" data-a="back">Done</button></div></div>`; }
  if(p.type==='rets'){ const all=RETS.map(x=>x[4]).concat(['photo','srt']), T={}; all.forEach(k=>T[k]=(T[k]||0)+1); const K=Object.keys(T).sort((a,b)=>T[b]-T[a]), mx=Math.max(...K.map(k=>T[k]));
    return `<div class="tg-pop xf wx-cfgp wx-retp"><div class="tg-ph"><b>Why claims came back</b><span class="cu">last 90 days · 11 of 64 filed</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
      ${K.map(k=>`<div class="wx-rt"><span class="t">${esc(RWHY[k][0])}</span><span class="bar"><i style="width:${(T[k]/mx*100).toFixed(0)}%"></i></span><b>${T[k]}</b><span class="ck">${ic('check',11)}Packet checks “${esc(RWHY[k][1].replace(/^./,c=>c.toLowerCase()))}”</span></div>`).join('')}
      <span class="tg-lbl top" style="margin-top:10px">Latest</span><div class="wx-rl">${[['37455','Highplains Grain','Causal part photo missing · labor over the SRT',3]].concat(RETS.slice(0,5).map(x=>[x[0],x[1],x[5],x[6]])).map(x=>`<div><b class="tg-no">${x[0]}</b><span>${esc(x[1])}</span><small>${esc(x[2])}</small><time>${when(x[3])}</time></div>`).join('')}</div>
      <div class="tg-acts"><span class="hint">A claim that matches one of these gets a heads-up</span><button class="btn btn-sm btn-primary" data-a="popx">Done</button></div></div>`; }
  if(p.type==='paid'){""")
rep("  if(p.type==='cfg'){", "  if(p.type==='rets'||p.type==='terms'&&!p.ro){ U.pop.ro=U.sel; }\n  if(p.type==='cfg'){")

# ---------- actions ----------
rep("  else if(a==='cfg'){", r"""  else if(a==='spick'){ p.o=+t.dataset.i; render(); }
  else if(a==='swhy'){ p.why=t.dataset.w; render(); }
  else if(a==='sgo'){ const r=get(p.ro), o=r.ops[p.op], s=o.srt; if(p.o==null) return; snap();
     if(p.o===0){ o.claim.hrs=s.hrs.toFixed(1); o.srtWhy=null; U.pop=p.ret||null; toast(`Claiming the SRT · ${s.hrs.toFixed(1)} h on op ${p.op+1}.`); render(); return; }
     if(p.o===1){ o.claim.hrs=claimH(o).toFixed(1); o.srtWhy=p.why+((($('#wx-sn')||{}).value||'').trim()?' — '+$('#wx-sn').value.trim():''); U.pop=p.ret||null; toast('Reason on the claim — Volvo sees it.'); render(); return; }
     const b=flat(); r.vol={kind:'pre',at:0,what:`Extra labor — ${overSrt(o).toFixed(1)} h over SRT ${s.op}`}; o.srtWhy='Asked Volvo for the extra time'; done(r,'phone','Asked Volvo for extra labor',`Asked Volvo for the extra ${overSrt(o).toFixed(1)} h — it waits under Waiting on Volvo.`,b); }
  else if(a==='srtadd'){ const r=get(p.ro), o=r.ops[p.op], op=($('#wx-so')||{}).value||'', h=+(($('#wx-sh')||{}).value||0); if(!op||!h) return; snap(); o.srt={op,name:o.cmp,hrs:h}; U.pop=p.ret||null; render(); }
  else if(a==='vpick'){ const r=get(p.ro); snap(); r.ops[p.op].cov=t.dataset.k; render(); }
  else if(a==='gw'){ const r=get(p.ro), b=flat(), to=t.dataset.to; snap(); r.snz='with '+(to==='manager'?'Manager':'Approval'); r.snzWhy=to==='manager'?'Goodwill request':'Customer pays'; done(r,'swap',to==='manager'?'To Manager · goodwill':'To Approval · customer pays',to==='manager'?`RO-${r.no} → Tom Hayes · goodwill request. It comes back here with his answer.`:`RO-${r.no} → Dana Kowalski · new estimate for the customer.`,b); }
  else if(a==='terms'){ U.pop={type:'terms',ro:p?p.ro:U.sel,op:p?p.op:0,ret:p&&p.type==='cov'?Object.assign({},p):null}; render(); }
  else if(a==='rets'){ U.pop={type:'rets',ro:U.sel}; render(); }
  else if(a==='cfg'){""")
rep("mock.addEventListener('input',e=>{ ", "mock.addEventListener('input',e=>{ if(e.target.dataset.tm!=null){ const c=S.cfg.cov[+e.target.dataset.tm], f=+e.target.dataset.f; c[f]=f===1?e.target.value:(+e.target.value||0); return; } ")
rep("    if(p.type==='causal'&&n>=1){", "    if(p.type==='srt'&&n>=1&&n<=3){ $(`.tg-pop [data-a=\"spick\"][data-i=\"${n-1}\"]`)?.click(); return stop(); }\n    if(p.type==='cov'&&n>=1&&n<=5){ $$('.tg-pop [data-a=\"vpick\"]')[n-1]?.click(); return stop(); }\n    if(p.type==='causal'&&n>=1){")
rep("document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;\n  if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"],[data-a=\"cfg\"],[data-a=\"fix\"],[data-a=\"copy\"]')){U.pop=null;ch=true;}",
    "document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;\n  if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"],[data-a=\"cfg\"],[data-a=\"fix\"],[data-a=\"copy\"],[data-a=\"rets\"]')){U.pop=null;ch=true;}")
rep("  if(p&&U.pop&&U.pop.type!=='cfg'){ const it=", "  if(p&&U.pop&&!['cfg','rets','terms'].includes(U.pop.type)){ const it=")
# header: returns
rep('<button class="btn ib" data-a="cfg" title="Warranty settings">', '<button class="btn ib" data-a="rets" title="Why claims came back">${ic(\'chart\',16)}</button><button class="btn ib" data-a="cfg" title="Warranty settings">')
rep('<span class="tg-lbl top" style="margin-top:10px">Chase after</span>', '${row(\'rate\',\'Labor rate on claims\',\'$/h\',\'for what over-SRT time costs\')}<span class="tg-lbl top" style="margin-top:10px">Chase after</span>')
rep("row('pa','Pre-approval needed over','$','the packet asks for the # above this')}", "row('pa','Pre-approval needed over','$','the packet asks for the # above this')}<div class=\"wx-cr\"><span>Coverage terms<small>base, engine, aftertreatment…</small></span><button class=\"btn btn-sm\" data-a=\"terms\" style=\"grid-column:2 / span 2\">Edit</button></div>")

# ---------- styles ----------
CSS4 = r"""
/* ---------- group 4: SRT, coverage, returns ---------- */
.wx-c2s{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;}
.wx-opt .tg-role{grid-row:1 / span 2;}
.wx-c2{display:grid;grid-template-columns:86px minmax(0,1fr) auto;align-items:center;gap:4px 10px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:17px;background:var(--tg-canvas);color:var(--tg-ink2);}
.wx-c2 .k{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:var(--tg-ink3);}
.wx-c2 .v b{color:var(--tg-ink);font-weight:500;}
.wx-c2 .v i{font-style:normal;color:var(--tg-ink);}
.wx-c2 .bar{grid-column:2;height:4px;border-radius:2px;background:var(--tg-hair);overflow:hidden;}
.wx-c2 .bar i{display:block;height:100%;border-radius:2px;background:var(--tg-good);}
.wx-c2 .btn{grid-column:3;grid-row:1;height:26px;padding:0 9px;font-size:12.5px;}
.wx-c2.ok .k{color:var(--tg-good);}
.wx-c2.warn{background:var(--tg-warn-t);} .wx-c2.warn .k{color:var(--tg-warn);} .wx-c2.warn .bar i{background:var(--tg-warn);}
.wx-c2.bad{background:var(--tg-bad-t);} .wx-c2.bad .k{color:var(--tg-bad);} .wx-c2.bad .bar i{background:var(--tg-bad);} .wx-c2.bad .v b{color:var(--tg-bad);}
.wx-c2.hu{background:transparent;box-shadow:inset 0 0 0 1px var(--tg-hair);}
.wx-c2.hu.bad{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-bad) 40%,transparent);background:transparent;} .wx-c2.hu.bad .k{color:var(--tg-bad);} .wx-c2.hu.bad .v b{color:var(--tg-ink);}
.wx-c2.hu.ok .k{color:var(--tg-ink3);}
.wx-cv{all:unset;box-sizing:border-box;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;padding:7px 10px;border-radius:9px;cursor:pointer;}
.wx-cv:hover{background:var(--tg-fill);} .wx-cv.on{background:var(--tg-fill);box-shadow:inset 0 0 0 1.5px var(--tg-ink);}
.wx-cv .m{display:flex;flex-direction:column;min-width:0;} .wx-cv b{font-size:13.5px;font-weight:500;color:var(--tg-ink);} .wx-cv small{font-size:12px;color:var(--tg-ink3);}
.wx-cvs{font-size:11.5px;font-weight:600;padding:0 7px;height:20px;display:inline-flex;align-items:center;border-radius:6px;}
.wx-cvs.in{background:var(--tg-good-t);color:var(--tg-good);} .wx-cvs.near,.wx-cvs.unknown{background:var(--tg-warn-t);color:var(--tg-warn);} .wx-cvs.out{background:var(--tg-bad-t);color:var(--tg-bad);}
.wx-tm{display:grid;grid-template-columns:1fr 80px 100px;gap:6px;margin-bottom:6px;}
.wx-tm.h{font-size:11.5px;color:var(--tg-ink3);margin-bottom:4px;}
.wx-tm input{all:unset;box-sizing:border-box;height:30px;padding:0 8px;border-radius:8px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-border);font:500 13px/30px var(--tg-sans);color:var(--tg-ink);}
.wx-tm input + input{font-family:var(--tg-mono);text-align:right;}
.wx-tm input:focus{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.tg-pop.wx-retp{width:500px;}
.wx-rt{display:grid;grid-template-columns:170px minmax(0,1fr) 24px;align-items:center;gap:4px 10px;padding:6px 0;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;}
.wx-rt .bar{height:8px;border-radius:4px;background:var(--tg-fill);overflow:hidden;} .wx-rt .bar i{display:block;height:100%;background:var(--tg-warn);border-radius:4px;}
.wx-rt b{font:600 13px/1 var(--tg-mono);text-align:right;}
.wx-rt .ck{grid-column:1 / -1;display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--tg-good);}
.wx-rl{display:flex;flex-direction:column;}
.wx-rl > div{display:grid;grid-template-columns:44px 140px minmax(0,1fr) auto;gap:8px;align-items:baseline;padding:4px 0;font-size:12.5px;}
.wx-rl span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .wx-rl small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .wx-rl time{font-size:11.5px;color:var(--tg-ink4);}
"""
rep("@media print{", CSS4 + "@media print{")
rep(''' "info": ''', ''' "chart": '<path d="M4.5 19.5h15M7.5 16.5v-5M12 16.5v-9M16.5 16.5v-3"/>',
 "info": ''')

# ---------- the frame ----------
i = src.index("const DEMO={"); j = src.index("\n};", i) + 3
src = src[:i] + r"""const DEMO={
  srt:()=>{reset();U.sel='37455';render();U.pop={type:'srt',ro:'37455',op:0,o:1,why:'Seized or rusted fasteners'};render();},
  cov:()=>{reset();get('37701').sent=null;U.sel='37701';render();U.pop={type:'cov',ro:'37701',op:0};render();},
  near:()=>{reset();U.sel='37502';render();},
  rets:()=>{reset();U.sel='37455';render();U.pop={type:'rets',ro:'37455'};render();},
  heads:()=>{reset();U.sel='37455';render();},
  terms:()=>{reset();U.sel='37701';render();U.pop={type:'terms',ro:'37701',op:0};render();}
};""" + src[j:]
src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("srt", "1 · Over the SRT"), ("cov", "2 · Outside coverage"), ("near", "3 · Near the limit"), ("heads", "4 · Heads-up"), ("rets", "5 · Why claims came back"), ("terms", "6 · Coverage terms")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("Labor against the SRT", "Every job shows its SRT op, the hours and what you’re claiming. Over it with no reason blocks filing: claim the SRT (and see what the extra costs), give a reason, or ask Volvo for the time."),
 ("Coverage", "Months and miles from the warranty start date against the coverage the job is claimed under. Inside, near the end, or outside — with goodwill or customer pay when nothing fits."),
 ("Coverage terms", "Base, engine, aftertreatment, previous repair, recall — months and miles you set. The numbers in the mock-up are examples."),
 ("Why claims came back", "The last 90 days of returns, tallied by reason, each matched to the packet item that now checks it (chart button in the header)."),
 ("Heads-up", "A claim on the same part or complaint as one that came back gets a line saying why — and whether this one has the same gap."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Warranty claim packet</title>", "<title>Parsec Warranty checks</title>")
rep("Parsec · Warranty — Claim packet", "Parsec · Warranty — Checks before filing")
rep("<h2>Claim packet<small>Getting a claim filed right the first time. Use the buttons above, or ↵ on a Ready to file item.</small></h2>", "<h2>Checks before filing<small>The SRT, coverage and past returns — caught before Volvo sends a claim back.</small></h2>")

g = {"__name__": "__main__", "__file__": SRC}
exec(compile(src, SRC, "exec"), g)
