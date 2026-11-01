# Foreman — Decide & Assign ideas on top of Needs action + Floor + Techs:
# findings land on the op, assign by bay type, plan several together, hold for parts.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
TS = os.path.join(B, "make_foreman_techs.py")
SRC = os.path.join(B, "make_foreman.py")
t = open(TS).read()
lib = t.split('\nexec(compile(src, SRC, "exec"), {"__name__": "__main__"')[0]
ns = {"__file__": TS, "__name__": "techs_lib"}
exec(compile(lib, TS, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:80], c)
    src = src.replace(a, b)

# ---------- data ----------
rep("{no:'37480',", "{no:'37480',pre:5000,ops2:[{t:'Diagnose low power',q:2.5,b:1.2,st:'on'}],find:{by:'KT',at:9.83,op:1,short:'VGT sticking',add:{t:'Replace turbocharger (VGT)',q:4.5,pt:'Turbo assembly',pr:3180,stock:false,eta:'tomorrow 10:00'}},")
rep("{no:'37011',", "{no:'37011',ops2:[{t:'Comeback — find the coolant loss',q:2.0,b:1.5,st:'on'}],find:{by:'PS',at:8.58,op:1,short:'coolant in the oil',add:{t:'Replace oil cooler, flush cooling system',q:3.5,pt:'Oil cooler kit',pr:640,stock:true}},")
rep("sub:'Backordered',spot:'D2'", "sub:'Backordered',spot:'B11'")
rep("\n {no:'37355',", "\n {no:'37705',cust:'Pilot Mountain Propane',unit:'19',cmp:'Trailer ABS lamp, brake lights out',st:'hold',spot:'T1',tech:'',chk:9.42,q:1.5,b:0},\n {no:'37355',")
rep("'37290':'Drivetrain'", "'37290':'Drivetrain','37705':'Electrical'")
# bays the job fits come first wherever a bay is picked
rep("const freeBays=()=>BAYS.filter(b=>!S.R.some(r=>r.spot===b));", "const freeBays=()=>{ const F=BAYS.filter(b=>!S.R.some(r=>r.spot===b)); return BFOR?F.sort((a,c)=>bayScore(c,BFOR)-bayScore(a,BFOR)||spc(a)-spc(c)):F; };")
rep("F.map(b=>`<button class=\"tg-chip${p.bay===b?' on':''}\" data-a=\"abay\" data-b=\"${b}\">${ic('bay',12)}${b}</button>`).join('')", "bayChips(F,BR(p,r),p.bay)", 4)
rep("""[data-a="fill"],[data-a="skills"]'))""", """[data-a="fill"],[data-a="skills"],[data-a="plan"]'))""")
rep('<div class="tg-ph"><b>Fill ${b}</b><span class="cu">', '<div class="tg-ph"><b>Fill ${b}</b><span class="fm-bth">${esc(btTxt(b))}</span><span class="cu">')

DJS = r"""
/* ---------- v5: findings on the op · bay types · plan together · hold for parts ---------- */
let BFOR=null;
const BT={AW1:['Awning'],AW2:['Awning'],UP:['Express'],B1:['Pit'],B2:['Pit'],B3:['Lift'],B4:['Lift'],B5:['Crane','Exhaust'],B6:['Crane','Exhaust'],B7:['Pit','Long'],B8:['Pit','Long'],B9:['Align'],B10:['Lift'],B11:['Exhaust'],B12:['Lift','Long']};
const BN={'37590':['Pit','Lift'],'37612':['Lift','Pit'],'37655':['Lift','Pit'],'37500':['Lift','Pit'],'37011':['Crane'],'37455':['Exhaust'],'37660':['Exhaust'],'37320':['Exhaust'],'37440':['Align'],'37355':['Lift','Pit']};
const NEEDTXT={Pit:'a pit or lift',Lift:'a lift or pit',Crane:'a crane',Exhaust:'an exhaust hose',Align:'the alignment rack'};
const NEEDNO={Pit:'pit or lift',Lift:'lift or pit',Crane:'crane',Exhaust:'exhaust hose',Align:'alignment rack'};
const SPECIAL=['Pit','Lift','Crane','Exhaust','Align','Long'];
const bnOf=r=>r&&!r.isTech&&BN[r.no]||null;
const bayFits=(b,r)=>{ const n=bnOf(r); return !n||(BT[b]||[]).some(f=>n.includes(f)); };
const bayScore=(b,r)=>{ const n=bnOf(r); return !n?1:bayFits(b,r)?2:0; };
const spc=b=>(BT[b]||[]).filter(f=>SPECIAL.includes(f)).length;
const btTxt=b=>(BT[b]||[]).join(' · ');
const BR=(p,r)=>r&&r.isTech?(p.pick?get(p.pick):null):r;
const money=n=>'$'+Number(n).toLocaleString('en-US');
function nextFit(r,skip){ const n=bnOf(r); if(!n) return null; let best=null;
  BAYS.forEach(b=>{ if(!bayFits(b,r)) return; const o=S.R.find(x=>x.spot===b); if(!o||o===r) return; const f=freeAt(o);
    if(f.t!=null&&(!best||best.t==null||f.t<best.t)) best={b,t:f.t,o}; else if(f.t==null&&!best) best={b,t:null,o}; });
  return best; }
const heldBy=r=>{ const n=bnOf(r); return n?S.R.find(o=>inBay(o)&&o.st==='parts'&&bayFits(o.spot,r)):null; };
function bayChips(F,r,sel,attr){ const n=bnOf(r); attr=attr||(b=>`data-a="abay" data-b="${b}"`);
  const ch=F.map(b=>{ const ok=bayFits(b,r); return `<button class="tg-chip fm-bc${sel===b?' on':''}${n?(ok?' ok':' no'):''}" ${attr(b)} title="${esc(btTxt(b))}${n&&!ok?' — no '+NEEDNO[n[0]]:''}">${ic('bay',12)}${b}<small>${n&&ok?ic('check',10):''}${esc(btTxt(b))}</small></button>`; }).join('');
  if(!ch) return '';
  let w=''; if(n&&sel&&BAYS.includes(sel)&&!bayFits(sel,r)) w=`<div class="fm-bwarn">${ic('flag',12)}${sel} has no ${NEEDNO[n[0]]} — this job needs ${NEEDTXT[n[0]]}</div>`;
  else if(n&&!F.some(b=>bayFits(b,r))){ const h=heldBy(r), nf=nextFit(r); w=`<div class="fm-bwarn">${ic('bay',12)}No free bay with ${NEEDTXT[n[0]]}${h?` · ${h.spot} holds ${h.no}, waiting on parts`:nf&&nf.t!=null?` · ${nf.b} frees ~${hm(nf.t)}`:''}</div>`; }
  return ch+w; }
bayTile=(orig=>function(b,s){ return orig(b,s).replace(`<span class="l">${b}</span>`,`<span class="l">${b}</span><span class="bt">${esc(btTxt(b))}</span>`); })(bayTile);
fillCands=(orig=>function(b,at){ const C=orig(b,at); C.forEach(c=>{ const n=bnOf(c.r); if(!n) return; if(bayFits(b,c.r)) c.note+=` · ${b} has ${NEEDTXT[n[0]].replace(/^(a|an|the) /,'the ')}`; else { c.pr+=10; c.note=`needs ${NEEDTXT[n[0]]} — ${b} has none`; } }); return C.sort((a,c)=>a.pr-c.pr); })(fillCands);
moveTo=(orig=>function(no,spot){ orig(no,spot); const r=get(no); if(r&&r.spot===spot&&BAYS.includes(spot)&&!bayFits(spot,r)){ toast(`${no} → ${spot} — ${spot} has no ${NEEDNO[bnOf(r)[0]]}; this job needs ${NEEDTXT[bnOf(r)[0]]}.`); render(); } })(moveTo);

/* 1 · findings land on the op */
const opSt=(o,r)=>({on:r.run?'on the clock':'in progress',done:'done',appr:'Dana · approval',go:'approved',parts:'parts · '+(r.parts?r.parts.eta:'ordered'),case:'Kim · tech support',rec:'recommended',todo:'to do'})[o.st]||'';
function opsStrip(r){ const O=r.ops2; if(!O||(!r.find&&O.length<2)) return '';
  return `<div class="fm-opl"><span class="k">Ops</span>${O.map((o,i)=>`<span class="fm-opp ${o.st}"><b>${o.st==='done'?ic('check',10):i+1}</b>${esc(o.t)}<i>${opSt(o,r)}${o.st==='on'||o.st==='done'?' · '+o.b.toFixed(1)+' / '+o.q.toFixed(1)+' h':' · '+hh(o.q)}</i></span>`).join('')}${r.find?`<span class="fm-opp found"><b>+</b>${esc(r.find.add.t)}<i>found by ${esc(TF(r.find.by))} · to decide</i></span>`:''}</div>`; }
topOf=(orig=>function(r){ let h=orig(r); if(!r||r.isTech) return h;
  const btn=r.parts?`<button class="btn btn-sm" data-a="partsin" data-ro="${r.no}" title="Parts marks this when the part lands — try it">${ic('check',14)}Parts in</button>`:inBay(r)&&r.st!=='parts'?`<button class="btn btn-sm" data-a="pop" data-p="hold" data-ro="${r.no}">${ic('parts',14)}Hold for parts…</button>`:'';
  if(btn) h=h.replace('<button class="btn btn-sm" data-a="pop" data-p="xfer"', btn+'<button class="btn btn-sm" data-a="pop" data-p="xfer"');
  const s=opsStrip(r); if(!s) return h; const i=h.indexOf('<div class="tg-next">'), j=h.lastIndexOf('</div>',i); return h.slice(0,j)+s+h.slice(j); })(topOf);
function dOpts4(r,p){ const F=r.find, A=F.add, tf=TF(r.tech), fb=TF(F.by), n=(r.ops2||[]).length+1, cb=!!r.comeback;
  if(cb) return [{t:`Go ahead — back to ${tf}`,d:`Op ${n} added as comeback work · no charge · ${A.pt} ${A.stock?'in stock':'to order'}`,go:`Send back to ${tf}`,act:'go'},{t:'Warranty claim',d:`To Kim · op ${n} goes on the claim against the Oct 2 job`,go:'Send to Warranty',act:'warr'},{t:'Not related — quote it',d:`To Dana · op ${n} on a new estimate for the customer`,go:'Send to Dana',act:'quote'},{t:'I’ll look at it',d:'Stays with you · back in the list in 1 h',go:'Snooze 1 h',act:'look'}];
  return [{t:'Quote it — to Dana',d:`Op ${n} goes on the estimate · ${hh(+p.h||A.q)} + ${A.pt} ${money(A.pr)} · ${tf} stops until it’s approved`,go:'Send to Dana',act:'quote'},
    {t:A.stock?`Go ahead — back to ${tf}`:'Go ahead — order the part',d:`${r.cust.split(' ')[0]} approves up to ${money(r.pre||0)} without a call · ${A.stock?'in stock':'not in stock — hold for parts next'}`,go:A.stock?`Go ahead · back to ${tf}`:'Go ahead · hold for parts…',act:'go'},
    {t:'Tech support first',d:`To Kim · Volvo case with ${fb}’s finding and op ${n} attached`,go:'Send to Warranty',act:'warr'},
    {t:'Not now — recommend it',d:`Op ${n} saved as recommended · shows on the RO and at the next visit`,go:'Save as recommended',act:'rec'},
    {t:'I’ll look at it',d:'Stays with you · back in the list in 1 h',go:'Snooze 1 h',act:'look'}]; }
const pendOf=(r,p)=>{ const F=r.find, A=F.add; return {t:A.t,q:p&&+p.h||A.q,pt:A.pt,pr:A.pr,by:F.by,eta:A.eta}; };
function dgo4(){ const p=U.pop, r=get(p.ro), O=dOpts4(r,p), o=O[p.o]; if(!o) return; const b=flat(), F=r.find, A=F.add, n=(r.ops2||[]).length+1, tf=TF(r.tech);
  if(o.act==='look'){ snap(); r.snz=NOW+1; r.snzWhy='Looking at it'; return done(r,'clock','Looking at it',`${r.cust} snoozed until ${hm(NOW+1)} — it stays with you.`,b); }
  if(o.act==='go'&&!A.stock){ U.pop={type:'hold',ro:r.no,pend:pendOf(r,p),i:0}; render(); return; }
  snap(); const cb=!!r.comeback, op={t:A.t,q:+p.h||A.q,b:0,by:F.by,at:NOW}; (r.ops2=r.ops2||[]).push(op); r.find=null; r.acc=true; r.sent=null; r.comeback=false;
  if(o.act==='quote'){ op.st='appr'; if(r.ops2[0].st==='on') r.ops2[0].st='done'; r.st='customer'; r.sub='Estimate sent'; r.hold={to:'writer',who:'Dana Kowalski',h:0,goal:4}; return done(r,'swap',`Op ${n} quoted · to Dana`,`Op ${n} “${A.t}” is on the estimate · ${r.no} to Dana for approval.`,b); }
  if(o.act==='go'){ op.st='go'; if(r.ops2[0].st==='on') r.ops2[0].st='done'; r.st='hold'; r.sub=''; r.idle=NOW; return done(r,'check',`Op ${n} approved · back to ${tf}`,`Op ${n} “${A.t}” approved${cb?' as comeback work, no charge':''} — back to ${TN(r.tech)}, it’s on the Console.`,b); }
  if(o.act==='warr'){ op.st='case'; r.st='support'; r.sub='Case opened'; r.hold={to:'warranty',who:'Kim Lee',h:0,goal:24}; return done(r,'swap',`Op ${n} · to Warranty`,`${r.no} to Kim Lee with op ${n} and ${TF(F.by)}’s finding attached.`,b); }
  op.st='rec'; r.st='hold'; r.sub=''; r.idle=NOW; return done(r,'note',`Op ${n} recommended`,`Op ${n} saved as recommended on ${r.no} — ${tf} finishes op 1.`,b); }

/* 4 · hold for parts */
function etaList(r){ const due=/due (\w+)/.exec(r.sub||''); const E=[['Today 15:00','today 15:00',15],['Tomorrow 10:00','tomorrow 10:00',34],['In 2–3 days','in 2–3 days',72],['Not sure','not sure yet',null]];
  if(due&&!/^(today|tomorrow)$/i.test(due[1])) E.splice(2,1,[due[1]+' · Ben’s ETA',due[1],60]); return E; }
const nextFor=r=>r.tech&&r.st!=='parts'?cands(r.tech).filter(c=>c.r.no!==r.no&&c.fit!==false)[0]:null;
function holdP(p,r){ const pd=p.pend, waiting=r.st==='parts'&&!pd, k=r.tech, tf=TF(k), lot=freeLot()[0], from=inBay(r)?r.spot:null, E=etaList(r), due=/due/.test(r.sub||'');
  if(p.e==null) p.e=pd?1:due?2:r.sub==='Backordered'?3:1; const late=p.e>=1; if(p.mv==null) p.mv=!!from&&late;
  const nx=waiting?null:nextFor(r); if(p.nx==null) p.nx=!!nx; if(p.bk==null) p.bk=true; if(p.dn==null) p.dn=!waiting;
  const want=from?fillCands(from,null).filter(c=>c.r.no!==r.no&&bayFits(from,c.r))[0]:null;
  const what=pd?`Op ${(r.ops2||[]).length+1} · ${pd.t} · ${pd.pt} — not in stock`:waiting?`${r.cmp} · parts ${r.sub.toLowerCase()} · with ${r.hold?r.hold.who:'Parts'}`:r.cmp;
  return `<div class="tg-pop xf fm-hold">${hdT('Hold for parts',r)}<div class="fm-ctx">${esc(what)}${from?`<br>In <b>${from}</b> · ${esc(btTxt(from))}${k?' · '+esc(TN(k)):''}`:''}</div>
    <span class="tg-lbl top">Parts here</span><div class="tg-r tg-when">${E.map((e,i)=>`<button class="tg-chip${p.e===i?' on':''}" data-a="heta" data-i="${i}">${kbd(i+1)}${esc(e[0])}</button>`).join('')}</div>
    ${from?`<span class="tg-lbl top" style="margin-top:10px">The truck</span>
      <button class="fm-opt nk${p.mv?' on':''}" data-a="hmv" data-v="1"><b>Move it to the lot · ${lot}</b><small>${from} frees up${want?` — ${want.r.no} ${esc(want.r.cust)} can go in${bnOf(want.r)?' · '+esc(btTxt(from))+' ✓':''}`:''}</small></button>
      <button class="fm-opt nk${!p.mv?' on':''}" data-a="hmv" data-v="0"><b>Keep it in ${from}</b><small>${late?`${from} is blocked until the parts come · ${esc(E[p.e][1])}`:'Parts are due today — keep the bay'}</small></button>`:''}
    <div class="fm-hck">${nx?`<label class="tg-opt"><input type="checkbox" data-a="hnx"${p.nx?' checked':''}>${esc(tf)} takes <b class="tg-no">${nx.r.no}</b> ${esc(nx.r.cust)} next${nx.inb?' · in '+nx.r.spot:from&&p.mv&&bayFits(from,nx.r)?' · into '+from:''}</label>`:''}
    ${k?`<label class="tg-opt"><input type="checkbox" data-a="hbk"${p.bk?' checked':''}>When Parts marks them in, back to ${esc(tf)} as #1 — it shows under Bring in</label>`:''}
    <label class="tg-opt"><input type="checkbox" data-a="hdn"${p.dn?' checked':''}>Tell Dana${r.promise!=null?` — promised ${hm(r.promise)}, the new time follows the parts`:' — she updates the customer'}</label></div>
    <div class="tg-acts"><span class="hint">1–4 when · Parts sees the ETA</span><button class="btn btn-sm btn-primary" data-a="hgo">${ic('parts',13)}${waiting?(p.mv?`Move to ${lot} · free ${from}`:'Save'):'Hold for parts'+(p.mv?' · move to '+lot:'')}${kbd('↵')}</button></div></div>`; }
function hgo(){ const p=U.pop, r=get(p.ro), b=flat(), pd=p.pend, waiting=r.st==='parts'&&!pd, k=r.tech, from=inBay(r)?r.spot:null, lot=freeLot()[0], E=etaList(r), e=E[p.e==null?1:p.e], nx=waiting?null:nextFor(r); snap();
  if(pd){ (r.ops2=r.ops2||[]).push({t:pd.t,q:pd.q,b:0,by:pd.by,at:NOW,st:'parts'}); if(r.ops2[0]&&r.ops2[0].st==='on') r.ops2[0].st='done'; r.find=null; r.acc=true; r.sent=null; r.comeback=false; }
  r.st='parts'; if(!(waiting&&e[2]==null)) r.sub=e[2]==null?'Ordered · ETA not sure':'Ordered · due '+e[1];
  r.hold={to:'parts',who:'Ben Okafor',h:waiting&&r.hold?r.hold.h:0,goal:24}; r.run=null; r.idle=null; r.parts={eta:e[1],back:p.bk?k:null,op:pd?pd.t:r.cmp};
  const out=[];
  if(from&&p.mv){ r.spot=lot; U.flash=from; out.push(`→ ${lot}, ${from} is free`); } else if(from) r.bayOk=true;
  if(nx&&p.nx){ const c=nx.r, was=c.tech; c.tech=k; c.chk=null; c.bring=null; c.st='hold'; c.sub=''; if(!inBay(c)&&from&&p.mv&&bayFits(from,c)) c.spot=from; c.idle=NOW; if(c.rep) c.repOk=true; toEnd(c); const L=upNext(k).filter(x=>x!==c); L.unshift(c); L.forEach((x,i)=>{x.qpos=i+1;}); clr(c,'userPlus',`Given to ${TF(k)}${was&&was!==k?' (was '+TF(was)+')':''}`); out.push(`${TF(k)} takes ${c.no}${inBay(c)?' in '+c.spot:''}`); }
  if(p.dn) out.push('Dana told');
  clr(r,'parts',`Hold for parts · ${e[1]}`); afterAct(r.no,b); U.sel=r.no;
  if(p.ret){ const L=p.ret.list; U.pop={type:'plan',list:L,plan:autoPlan(L.map(get).filter(Boolean)),ex:null,ro:null}; } else U.pop=null;
  toast(`${r.no} on hold for parts · ${e[1]}${out.length?' · '+out.join(' · '):''}.`); render(); }
function partsIn(no){ const r=get(no); if(!r||!r.parts) return; snap(); const P=r.parts; r.st='hold'; r.sub=''; r.hold=null; r.bayOk=false; if(P.back) r.tech=P.back; r.bring=`Parts in · ${P.op}`; (r.ops2||[]).forEach(o=>{ if(o.st==='parts') o.st='go'; }); r.parts=null;
  if(r.tech){ const L=upNext(r.tech).filter(x=>x!==r); L.unshift(r); L.forEach((x,i)=>{x.qpos=i+1;}); }
  clr(r,'parts','Parts in'); U.sel=no; toast(`Parts in for ${r.no} — it’s under Bring in, #1 for ${TN(r.tech)}.`); render(); }

/* 3 · plan together */
const isBatch=x=>(x.g==='tech'&&x.act==='assign')||x.g==='in';
const pOrd=r=>r.bring?0:r.chk?1:2+(r.eta||0)/100;
const hoursOf=r=>leftEst(r)||r.q||2;
function planList(){ return needsAll().filter(x=>!snoozed(x.ro)&&isBatch(x)).map(x=>x.ro).sort((a,c)=>pOrd(a)-pOrd(c)); }
function baseRoom(L){ const room={}; TECH.forEach(t=>{ const k=t[0]; room[k]=hoursLeft(k)-(workOf(k)-L.filter(r=>r.tech===k&&workable(r)).reduce((a,r)=>a+leftEst(r),0)); }); return room; }
function autoPlan(L){ L=L.slice().sort((a,c)=>pOrd(a)-pOrd(c)); const room=baseRoom(L), used=new Set(), plan={};
  L.forEach(r=>{ const h=hoursOf(r); let t=r.tech&&fits(r.tech,r)&&room[r.tech]>=h-0.05?r.tech:null;
    if(!t){ const C=TECH.map(x=>x[0]).filter(k=>fits(k,r)).sort((a,c)=>room[c]-room[a]); t=C.find(k=>room[k]>=h-0.05)||C[0]||r.tech||TECH.map(x=>x[0]).sort((a,c)=>room[c]-room[a])[0]; }
    room[t]-=h; const F=freeBays().filter(b=>!used.has(b)); let bay='';
    if(bnOf(r)) bay=F.find(b=>bayFits(b,r))||''; else bay=F.slice().sort((a,c)=>spc(a)-spc(c))[0]||'';
    if(bay) used.add(bay); plan[r.no]={t,bay,on:true}; });
  return plan; }
function planLoad(p){ const L=p.list.map(get).filter(Boolean), room=baseRoom(L); L.forEach(r=>{ const x=p.plan[r.no]; if(x.on) room[x.t]-=hoursOf(r); }); return room; }
function openPlan(g){ const L=(g==='sel'?(U.bs||[]).map(get).filter(Boolean):planList()).sort((a,c)=>pOrd(a)-pOrd(c)); if(!L.length) return; U.pop={type:'plan',list:L.map(r=>r.no),plan:autoPlan(L),ex:null,ro:null}; U.srch=false; render(); }
function planP(p){ const L=p.list.map(get).filter(Boolean), P=p.plan, room=planLoad(p), on=L.filter(r=>P[r.no].on);
  const row=r=>{ const x=P[r.no], need=needOf(r), bn=bnOf(r), arr=/^W/.test(r.spot), h=hoursOf(r), fT=fits(x.t,r), fB=!x.bay||bayFits(x.bay,r), ex=p.ex===r.no;
    const sub=r.bring?r.bring.split(' · ')[0]:arr?`arriving ~${hm(r.eta)}`:`checked in ${dur(NOW-r.chk)} ago · ${r.spot}`;
    let h2=`<div class="fm-pr4${x.on?'':' off'}${ex?' ex':''}"><button class="fm-bx in${x.on?' on':''}" data-a="pon" data-no="${r.no}">${x.on?ic('check',12):''}</button>
      <span class="m"><b><span class="tg-no">${r.no}</span>${need?`<span class="fm-skt">${SKA[need]}</span>`:''}${bn?`<span class="fm-skt bay">${ic('bay',10)}${bn[0].toUpperCase()}</span>`:''}<span class="cu">${esc(r.cust)}</span></b><small>${esc(sub)} · ${hh(h)}${r.tech&&r.tech!==x.t?' · was '+esc(TF(r.tech)):''}</small></span>
      <button class="fm-pp${fT?'':' no'}" data-a="pex" data-no="${r.no}" title="${fT?'':esc(TF(x.t))+' isn’t marked for '+need}"><span class="tg-av">${x.t}</span>${esc(TF(x.t))}${ic('chevD',12)}</button>
      <button class="fm-pp${x.bay?(fB?'':' no'):' none'+(bn?' warn':'')}" data-a="pex" data-no="${r.no}">${x.bay?ic('bay',12)+x.bay:arr?'when it lands':'no bay yet'}${ic('chevD',12)}</button></div>`;
    if(ex){ const usedO=new Set(L.filter(y=>y!==r&&P[y.no].on&&P[y.no].bay).map(y=>P[y.no].bay));
      const BF=freeBays().filter(b=>!usedO.has(b)).sort((a,c)=>bayScore(c,r)-bayScore(a,r)||spc(a)-spc(c));
      const T=TECH.map(t=>t[0]).map(k=>({k,fit:fits(k,r),rm:x.t===k?room[k]:room[k]-h})).sort((a,c)=>(c.fit?1:0)-(a.fit?1:0)||c.rm-a.rm);
      h2+=`<div class="fm-pex"><div class="tg-r"><span class="tg-lbl">Tech</span>${T.map(t=>`<button class="tg-chip${x.t===t.k?' on':''}" data-a="pt" data-no="${r.no}" data-k="${t.k}"><span class="tg-av" style="width:18px;height:18px;font-size:8.5px">${t.k}</span>${esc(TF(t.k))}<small class="${t.rm<0?'no':''}">${need&&!t.fit?'no '+SKA[need]+' · ':''}${t.rm>=0?hh(t.rm)+' free':hh(-t.rm)+' over'}</small></button>`).join('')}</div>
        <div class="tg-r"><span class="tg-lbl">Bay</span>${bayChips(BF,r,x.bay,b=>`data-a="pb" data-no="${r.no}" data-b="${b}"`)}<button class="tg-chip${!x.bay?' on':''}" data-a="pb" data-no="${r.no}" data-b="">${arr?'When it lands':'No bay yet'}</button></div></div>`; }
    return h2; };
  const over=TECH.map(t=>t[0]).filter(k=>room[k]<-0.05&&on.some(r=>P[r.no].t===k));
  const nob=on.filter(r=>bnOf(r)&&!P[r.no].bay), hb=nob.length?heldBy(nob[0]):null, nf=nob.length?nextFit(nob[0]):null;
  const used=TECH.map(t=>t[0]).filter(k=>on.some(r=>P[r.no].t===k));
  return `<div class="tg-pop xf fm-plan4"><div class="tg-ph"><b>Plan together</b><span class="cu">${L.length} trucks · skills, hours left and bay type</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
    <div class="fm-prs">${L.map(row).join('')}</div>
    <div class="fm-psum"><span class="k">After this</span>${used.map(k=>`<span class="fm-pl${room[k]<-0.05?' over':''}"><span class="tg-av">${k}</span>${room[k]>=0?hh(room[k])+' free':hh(-room[k])+' over'}</span>`).join('')}
      ${nob.length?`<div class="fm-pw">${ic('bay',13)}<span>${nob.map(r=>r.no).join(' and ')} need${nob.length>1?'':'s'} ${NEEDTXT[bnOf(nob[0])[0]]} — ${hb?`${hb.spot} holds ${hb.no}, waiting on parts`:nf&&nf.t!=null?`${nf.b} frees ~${hm(nf.t)}`:nob.every(r=>/^W/.test(r.spot))?'none free · pick one when it lands':'none free'}</span>${hb?`<button class="btn btn-sm" data-a="pfree" data-ro="${hb.no}">${ic('parts',13)}Free ${hb.spot}…</button>`:''}</div>`:''}
      ${over.length?`<div class="fm-pw">${ic('clock',13)}<span>${over.map(k=>TF(k)).join(' and ')} go${over.length>1?'':'es'} over today — the rest rolls to tomorrow</span></div>`:''}</div>
    <div class="tg-acts"><span class="hint">Click a tech or bay to change it · nothing double-books a bay</span><button class="btn btn-sm btn-primary" data-a="pgo"${on.length?'':' disabled'}>${ic('userPlus',13)}Assign ${on.length}${kbd('↵')}</button></div></div>`; }
function pgo(){ const p=U.pop, L=p.list.map(get).filter(r=>r&&p.plan[r.no].on); if(!L.length) return; const b=flat(); snap(); const out=[];
  L.forEach(r=>{ const x=p.plan[r.no], was=r.tech, arr=/^W/.test(r.spot); r.tech=x.t; r.chk=null;
    if(arr) r.plan=x.bay?{bay:x.bay,at:r.eta}:null; else if(x.bay){ r.spot=x.bay; r.bring=null; r.st='hold'; r.sub=''; r.idle=NOW; if(r.rep) r.repOk=true; }
    if(r.tech!==was||r.qpos==null) toEnd(r); clr(r,'userPlus',`Planned · ${TF(x.t)}${x.bay?' · '+x.bay:''}`); out.push(`${r.no} → ${TF(x.t)}${x.bay?' · '+x.bay:arr?' when it lands':''}`); });
  U.bs=[]; afterAct(L[0].no,b); U.pop=null; toast(`${L.length} assigned — ${out.join(', ')}. Each tech has them on the Console.`); render(); }
/* selecting in Needs action */
list=(orig=>function(){ let h=orig(); const bs=U.bs||[], N={}; needs().forEach(x=>{N[x.ro.no]=x;});
  h=h.replace(/<div class="tg-it([^"]*)" data-a="sel" data-ro="([^"]+)"([^>]*)>/g,(m,c,no,rest)=>{ const x=N[no]; if(!x||!isBatch(x)) return m; const on=bs.includes(no);
    return `<div class="tg-it${c} fm-bt${on?' bon':''}" data-a="sel" data-ro="${no}"${rest}><button class="fm-bx${on?' on':''}" data-a="bsel" data-ro="${no}" title="Select · X">${on?ic('check',12):''}</button>`; });
  const n=planList().length;
  if(n>1) h=h.replace(/<div class="tg-grp">Needs a tech<span>(\d+)<\/span><\/div>/,`<div class="tg-grp">Needs a tech<span>$1</span><button class="fm-plan" data-a="plan" data-g="all">${ic('userPlus',12)}Plan ${n} together</button></div>`);
  if(bs.length){ h=h.replace('<section class="tg-list">','<section class="tg-list fm-bmode">'); h=h.replace(/<div class="tg-keys">[\s\S]*?<\/div>(?=<\/section>)/,`<div class="tg-keys fm-bsb"><b>${bs.length} selected</b><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="bclr">Clear</button><button class="btn btn-sm btn-primary" data-a="plan" data-g="sel">${ic('userPlus',13)}Plan together${kbd('P')}</button></div>`); }
  return h; })(list);
/* needs action: findings and bays held for parts */
needsAll=(orig=>function(){ const L=orig(), have=new Set(L.map(x=>x.ro.no));
  L.forEach(x=>{ const r=x.ro; if(r.find&&(x.g==='sent'||x.g==='you')) x.why=`${r.comeback?'Comeback · ':''}${TF(r.find.by)} found: ${r.find.short} · op ${(r.ops2||[]).length+1} to decide`; });
  S.R.forEach(r=>{ if(r.st!=='parts'||!inBay(r)||r.bayOk||have.has(r.no)||snoozed(r)) return;
    const want=S.R.filter(x=>x!==r&&!inBay(x)&&(x.bring||(x.chk&&!x.tech)||/^W/.test(x.spot))&&bnOf(x)&&bayFits(r.spot,x));
    L.push({g:'watch',ic:'parts',ro:r,btn:'Free bay',act:'hold',late:want.length>0,why:`In ${r.spot} · parts ${(r.sub||'').replace(/^Ordered · /,'').toLowerCase()} · ${want.length?want.map(x=>x.no).join(' and ')+' need'+(want.length>1?'':'s')+' '+NEEDTXT[bnOf(want[0])[0]]:'bay blocked'}`}); });
  return L; })(needsAll);
reset=(orig=>function(){ orig(); U.bs=[]; })(reset);
const P4={decide:(p,r)=>{ const F=r.find, A=F.add, ops=r.ops2||[], n=ops.length+1, O=dOpts4(r,p), ch=O[p.o]; if(p.h==null) p.h=A.q;
  return `<div class="tg-pop xf fm-dec">${hdT(r.comeback?'Decide · comeback':'Decide',r)}<div class="fm-ctx"><b>${esc(TN(F.by))}</b> · ${dur(NOW-F.at)} ago · found on op ${F.op}<br><q>${esc(r.sent&&!r.comeback?r.sent.note:r.note)}</q></div>
    <span class="tg-lbl top">Ops on the RO</span><div class="fm-ops fm-ops4">${ops.map((o,i)=>`<div class="fm-op"><span class="n">${i+1}</span><span class="t">${esc(o.t)}</span><span class="s">${opSt(o,r)}</span><span class="h">${o.b.toFixed(1)} / ${o.q.toFixed(1)} h</span></div>`).join('')}
      <div class="fm-op new"><span class="n">${n}</span><span class="t"><b>${esc(A.t)}</b><small>Found by ${esc(TF(F.by))} · ${esc(A.pt)} ${money(A.pr)} · ${A.stock?'in stock':'not in stock'}</small></span><label class="fm-hin"><input type="number" step="0.5" min="0" value="${p.h}" data-a="oph" aria-label="Hours">h</label></div></div>
    ${O.map((o,i)=>opt(p,i,esc(o.t),esc(o.d))).join('')}
    <div class="tg-acts"><span class="hint">1–${O.length} choose · written on op ${n} · ${esc(TF(r.tech))} sees it on the Console</span><button class="btn btn-sm btn-primary" data-a="dgo4"${ch?'':' disabled'}>${ch?esc(ch.go):'Choose'}${kbd('↵')}</button></div></div>`; }};
pop=(orig=>function(){ const p=U.pop; if(!p) return orig();
  if(p.type==='plan') return planP(p);
  const r=p.ro?get(p.ro):null;
  if(p.type==='hold'&&r) return holdP(p,r);
  if(p.type==='decide'&&r&&r.find) return P4.decide(p,r);
  if(p.type==='give'&&r&&r.isTech&&p.pick==null){ const C=cands(r.tech); p.pick=C[0]&&C[0].r.no; }
  BFOR=p.type==='give'?(p.pick?get(p.pick):null):p.type==='fill'?null:(r&&!r.isTech?r:null);
  if(BFOR&&p.bay==null&&/^W/.test(BFOR.spot)&&bnOf(BFOR)&&!freeBays().some(b=>bayFits(b,BFOR))) p.bay='';
  try{ return orig(); } finally{ BFOR=null; } })(pop);
after=(orig=>function(){ orig(); const p=U.pop, el=$('.tg-pop.fm-plan4'); if(el&&p&&p.type==='plan'){ el.style.top='12px'; } })(after);
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='bsel'){ const no=t.dataset.ro, L=U.bs||(U.bs=[]), i=L.indexOf(no); if(i<0) L.push(no); else L.splice(i,1); render(); }
  else if(a==='bclr'){ U.bs=[]; render(); }
  else if(a==='plan') openPlan(t.dataset.g);
  else if(a==='partsin') partsIn(t.dataset.ro);
  else if(!p) return;
  else if(a==='dgo4') dgo4();
  else if(a==='heta'){ p.e=+t.dataset.i; p.mv=null; render(); } else if(a==='hmv'){ p.mv=t.dataset.v==='1'; render(); }
  else if(a==='hnx'){ p.nx=!p.nx; render(); } else if(a==='hbk'){ p.bk=!p.bk; render(); } else if(a==='hdn'){ p.dn=!p.dn; render(); } else if(a==='hgo') hgo();
  else if(a==='pon'){ const x=p.plan[t.dataset.no]; x.on=!x.on; render(); }
  else if(a==='pex'){ p.ex=p.ex===t.dataset.no?null:t.dataset.no; render(); }
  else if(a==='pt'){ p.plan[t.dataset.no].t=t.dataset.k; render(); }
  else if(a==='pb'){ const no=t.dataset.no, b=t.dataset.b; Object.keys(p.plan).forEach(k=>{ if(k!==no&&b&&p.plan[k].bay===b) p.plan[k].bay=''; }); p.plan[no].bay=b; render(); }
  else if(a==='pgo') pgo();
  else if(a==='pfree'){ U.pop={type:'hold',ro:t.dataset.ro,ret:{list:p.list},i:0}; render(); } });
mock.addEventListener('input',e=>{ if(e.target.dataset.a==='oph'&&U.pop) U.pop.h=e.target.value; });
mock.addEventListener('change',e=>{ if(e.target.dataset.a==='oph'&&U.pop){ U.pop.h=e.target.value; render(); } });
addEventListener('keydown',e=>{ if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea')) return; const p=U.pop, k=e.key;
  if(p&&p.type==='hold'){ const n=+k; if(n>=1&&n<=4){ $(`.tg-pop [data-a="heta"][data-i="${n-1}"]`)?.click(); e.preventDefault(); } return; }
  if(p) return;
  if(k==='x'){ const x=needs().find(y=>y.ro.no===U.sel); if(x&&isBatch(x)){ const L=U.bs||(U.bs=[]), i=L.indexOf(U.sel); if(i<0) L.push(U.sel); else L.splice(i,1); render(); } e.preventDefault(); }
  if(k==='p'){ openPlan((U.bs||[]).length?'sel':'all'); e.preventDefault(); } });
"""
rep("\nconst DEMO={", DJS + "\nconst DEMO={")
src = re.sub(r"const DEMO=\{.*?\n\};\n", """const DEMO={
  overview:()=>{reset();U.sel='37480';render();const g=[...document.querySelectorAll('.tg-grp')].find(x=>x.textContent.startsWith('Needs a tech')),sc=$('.tg-scroll');if(g&&sc)sc.scrollTop=g.offsetTop-160;},
  find:()=>{reset();const r=get('37480');r.acc=true;r.since=NOW;U.sel='37480';render();openPop('decide','37480');U.pop.o=0;render();},
  bays:()=>{reset();U.sel='37500';render();openPop('bring','37500');},
  batch:()=>{reset();U.sel='37500';render();openPlan('all');},
  hold:()=>{reset();const r=get('37480');r.acc=true;r.since=NOW;U.sel='37480';render();U.pop={type:'hold',ro:'37480',pend:pendOf(r),i:0};render();},
  free:()=>{reset();U.sel='37320';render();openPop('hold','37320');}
};
""", src, count=1, flags=re.S)
assert "free:()=>" in src

CSS5 = r"""
.fm-bay .r1 .bt{font-size:10.5px;color:var(--tg-ink4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.fm-bay .r1 .st{flex:none;}
.fm-bth{font-size:12px;color:var(--tg-ink3);}
.tg-chip.fm-bc small{display:inline-flex;align-items:center;gap:3px;}
.tg-chip.fm-bc.ok small{color:var(--tg-good);}
.tg-chip.fm-bc.no{color:var(--tg-ink3);}
.tg-chip.fm-bc.no small{color:var(--tg-ink4);}
.fm-bwarn{flex-basis:100%;order:99;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tg-warn);margin-top:2px;}
.tg-pop.fm-dec{width:470px;}
.fm-ops4{padding:4px 10px;}
.fm-ops4 .fm-op .n{width:18px;height:18px;border-radius:5px;background:var(--tg-fill);display:grid;place-items:center;font:600 10.5px/1 var(--tg-sans);color:var(--tg-ink2);flex:none;}
.fm-ops4 .fm-op .s{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;}
.fm-ops4 .fm-op.new{margin:4px -6px;padding:7px 8px;border-radius:9px;background:var(--tg-acct);box-shadow:inset 0 0 0 1px var(--tg-accl) !important;}
.fm-ops4 .fm-op.new .n{background:var(--tg-acc);color:#fff;}
.fm-ops4 .fm-op.new .t{display:flex;flex-direction:column;white-space:normal;line-height:17px;}
.fm-ops4 .fm-op.new .t b{font-weight:500;}
.fm-ops4 .fm-op.new small{font-size:11.5px;color:var(--tg-ink3);}
.fm-hin{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--tg-ink3);flex:none;}
.tg .fm-hin input{width:60px;height:28px;text-align:right;padding:0 6px;font:500 13px/1 var(--tg-sans);}
.fm-opl{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:-2px;}
.fm-opl .k{font-size:12px;color:var(--tg-ink3);margin-right:2px;}
.fm-opp{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px 0 4px;border-radius:7px;box-shadow:inset 0 0 0 1px var(--tg-border);font-size:12px;color:var(--tg-ink);white-space:nowrap;max-width:100%;}
.fm-opp b{display:grid;place-items:center;width:16px;height:16px;border-radius:4px;background:var(--tg-fill);font:600 10px/1 var(--tg-sans);color:var(--tg-ink2);flex:none;}
.fm-opp i{font-style:normal;color:var(--tg-ink3);overflow:hidden;text-overflow:ellipsis;}
.fm-opp.done{color:var(--tg-ink3);} .fm-opp.done b{background:var(--tg-good-t);color:var(--tg-good);}
.fm-opp.found{background:var(--tg-acct);box-shadow:inset 0 0 0 1px var(--tg-accl);} .fm-opp.found b{background:var(--tg-acc);color:#fff;} .fm-opp.found i{color:var(--tg-acctx);font-weight:500;}
.fm-opp.appr i{color:var(--tg-st-customer);font-weight:500;} .fm-opp.parts i,.fm-opp.case i{color:var(--tg-warn);font-weight:500;} .fm-opp.go i{color:var(--tg-good);font-weight:500;}
.fm-opt.nk{grid-template-columns:1fr;}
.fm-hck{margin-top:4px;}
.fm-hck .tg-opt b{font-weight:500;color:var(--tg-ink);}
.tg-pop.fm-hold{width:500px;}
.fm-bx{position:absolute;left:20px;top:50%;margin-top:-14px;width:28px;height:28px;border-radius:9px;display:grid !important;place-items:center;background:var(--tg-raised);box-shadow:inset 0 0 0 1.5px var(--tg-border);color:var(--tg-onprimary);opacity:0;z-index:2;transition:opacity .12s;}
.fm-bx:hover{box-shadow:inset 0 0 0 1.5px var(--tg-ink3);}
.tg-it.fm-bt:hover .fm-bx,.fm-bmode .fm-bx,.fm-bx.on{opacity:1;}
.fm-bx.on{background:var(--tg-primary);box-shadow:none;}
.tg-it.bon{background:var(--tg-acct);}
.fm-plan{margin-left:auto;display:inline-flex !important;align-items:center;gap:5px;font-size:12px;font-weight:500;color:var(--tg-acctx);}
.fm-plan:hover{text-decoration:underline;}
.tg-keys.fm-bsb{gap:8px;padding-right:10px;}
.tg-keys.fm-bsb b{font-weight:500;color:var(--tg-ink);}
.tg-pop.fm-plan4{width:640px;}
.fm-prs{display:flex;flex-direction:column;border-radius:12px;box-shadow:inset 0 0 0 1px var(--tg-hair);padding:4px;}
.fm-pr4{display:grid;grid-template-columns:auto minmax(0,1fr) 108px 124px;align-items:center;gap:10px;padding:7px 8px;border-radius:9px;}
.fm-pr4 + .fm-pr4,.fm-pex + .fm-pr4{box-shadow:inset 0 1px 0 var(--tg-hair);}
.fm-pr4.off .m,.fm-pr4.off .fm-pp{opacity:.45;}
.fm-pr4.ex{background:var(--tg-fill);border-radius:9px 9px 0 0;box-shadow:none;}
.fm-bx.in{position:static;margin:0;opacity:1;width:22px;height:22px;border-radius:7px;}
.fm-pr4 .m{display:flex;flex-direction:column;min-width:0;}
.fm-pr4 .m b{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;min-width:0;}
.fm-pr4 .m b .cu{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.fm-pr4 .m small{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-skt.bay{gap:2px;}
.fm-pp{display:inline-flex !important;align-items:center;gap:6px;height:28px;padding:0 6px 0 6px !important;border-radius:8px;box-shadow:inset 0 0 0 1px var(--tg-border);font-size:12.5px;color:var(--tg-ink);white-space:nowrap;width:100%;justify-content:flex-start;}
.fm-pp .tg-ic:last-child{color:var(--tg-ink4);margin-left:auto;}
.fm-pp:hover{background:var(--tg-raised);}
.fm-pp .tg-av{width:20px;height:20px;font-size:8.5px;}
.fm-pp.no{box-shadow:inset 0 0 0 1.5px var(--tg-warn);color:var(--tg-warn);}
.fm-pp.none{color:var(--tg-ink3);box-shadow:none;outline:1px dashed var(--tg-border);outline-offset:-1px;}
.fm-pp.none.warn{color:var(--tg-warn);outline-color:var(--tg-warn);}
.fm-pex{display:flex;flex-direction:column;gap:6px;padding:4px 8px 10px 40px;background:var(--tg-fill);border-radius:0 0 9px 9px;}
.fm-pex .tg-lbl{width:34px;}
.fm-pex .tg-chip{background:var(--tg-raised);}
.fm-pex .tg-chip small.no{color:var(--tg-bad);}
.fm-psum{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin-top:10px;font-size:12px;color:var(--tg-ink3);}
.fm-psum .k{color:var(--tg-ink3);}
.fm-pl{display:inline-flex;align-items:center;gap:5px;color:var(--tg-ink2);}
.fm-pl .tg-av{width:18px;height:18px;font-size:8px;}
.fm-pl.over{color:var(--tg-bad);font-weight:500;}
.fm-pw{flex-basis:100%;display:flex;align-items:center;gap:8px;color:var(--tg-warn);font-weight:500;}
.fm-pw span{flex:1;min-width:0;}
.fm-pw .btn{font-weight:500;}
"""
rep(".tg-pop.fm-skp{width:360px;}", ".tg-pop.fm-skp{width:360px;}\n" + CSS5)

src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("overview", "Decide & Assign"), ("find", "1 · Findings on the op"), ("bays", "2 · Bay types"), ("batch", "3 · Plan together"), ("hold", "4 · Hold for parts"), ("free", "4 · Bay held for parts")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("1 · Findings land on the op", "When a tech finds more work, it comes to you as a new op on the RO — hours, part, price, in stock or not. Quote it, go ahead, tech support, or recommend it for next time. The choice is written on that op and the tech sees it on his Console. The RO card lists every op and where it stands."),
 ("2 · Assign by bay type", "Each bay has a type — pit, lift, crane, exhaust hose, alignment rack, long. Each job says what it needs. Assign, Bring in, Give work and Fill a bay put the bays that fit first and warn when one doesn’t. Bay types are set once under Manager → Shop."),
 ("3 · Plan together", "Tick trucks in Needs action (or press X), or use Plan together on Needs a tech. Parsec suggests a tech and a bay for each — skills, hours left and bay type — and never puts two trucks in one bay. Change any row, then assign them all at once."),
 ("4 · Hold for parts", "When a job waits on parts: say when they’re due, move the truck to the lot so the bay frees up, give the tech his next job, and have it come back to him as #1 when Parts marks the part in. A truck sitting in a bay waiting on parts shows in Watch."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Foreman techs</title>", "<title>Parsec Foreman decide and assign</title>")
rep("Parsec · Foreman — Techs", "Parsec · Foreman — Decide & Assign")
rep("<h2>Techs<small>Builds on the Needs action and Floor changes. Use the buttons above.</small></h2>", "<h2>Decide &amp; Assign<small>Builds on the Needs action, Floor and Techs changes. Use the buttons above.</small></h2>")

exec(compile(src, SRC, "exec"), {"__name__": "__main__", "__file__": SRC})
