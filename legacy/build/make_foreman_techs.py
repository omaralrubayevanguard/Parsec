# Foreman — Techs ideas on top of Needs action + Floor: queue order, skills, real capacity, today per tech.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
FL = os.path.join(B, "make_foreman_floor.py")
SRC = os.path.join(B, "make_foreman.py")
t = open(FL).read()
lib = t.split('\nexec(compile(src, SRC, "exec"), {"__name__": "__main__"')[0]
ns = {"__file__": FL, "__name__": "floor_lib"}
exec(compile(lib, FL, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:80], c)
    src = src.replace(a, b)

TECHSJS = r"""
/* ---------- v4: queue order · skills · real capacity · today per tech ---------- */
const HE=k=>k==='PS'?'she':'he', HIS=k=>k==='PS'?'her':'his', HIM=k=>k==='PS'?'her':'him';
const SK=['Electrical','Aftertreatment','Engine','Drivetrain','Brakes','Hydraulics','HVAC','PM','Warranty cert.'];
const SKA={'Electrical':'ELEC','Aftertreatment':'AFT','Engine':'ENG','Drivetrain':'DRV','Brakes':'BRK','Hydraulics':'HYD','HVAC':'HVAC','PM':'PM','Warranty cert.':'WAR'};
const SKILLS0={MR:['Electrical','Engine','Warranty cert.'],LM:['Aftertreatment','Hydraulics','Engine'],PS:['Brakes','PM','Electrical','Warranty cert.'],AW:['Drivetrain','Brakes','PM'],KT:['Electrical','Brakes','PM']};
let SKILLS=JSON.parse(JSON.stringify(SKILLS0));
const NEED={'37544':'Engine','37602':'Electrical','37655':'Brakes','37480':'Engine','37011':'Electrical','36988':'Electrical','37590':'Drivetrain','37700':'Electrical','37388':'PM','37612':'Drivetrain','37420':'Hydraulics','37150':'PM','37628':'Brakes','37660':'Aftertreatment','37500':'Brakes','37455':'Aftertreatment','37502':'Electrical','37210':'Engine','37320':'Aftertreatment','37290':'Drivetrain'};
const needOf=r=>r&&NEED[r.no]||null;
const fits=(k,r)=>{ const n=needOf(r); return !n||!k||(SKILLS[k]||[]).includes(n); };
const SHIFT2={MR:[7,16.5],LM:[7,16.5],PS:[7.5,16],AW:[7,16.5],KT:[7,15.5]};
const OFF={PS:{from:14,to:16,txt:'out from 14:00'}}, NEXTDAY={AW:'off tomorrow'};
const TODAY={MR:{c:3.2,f:3.0,j:1},LM:{c:3.2,f:2.1,j:0},PS:{c:2.7,f:2.9,j:1},AW:{c:null,f:1.2,j:0},KT:{c:2.8,f:3.3,j:1}};
const r1=x=>Math.round(x*10)/10, roomOf=k=>r1(hoursLeft(k))-r1(workOf(k));
const ovl=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
function hoursLeft(k){ const s=SHIFT2[k][0], e=SHIFT2[k][1], st=Math.max(NOW,s); let h=Math.max(0,e-st)-ovl(st,e,LUNCH[0],LUNCH[1]); const o=OFF[k]; if(o) h-=ovl(st,e,o.from,o.to)-ovl(Math.max(st,o.from),Math.min(e,o.to),LUNCH[0],LUNCH[1]); return Math.max(0,h); }
const workable=r=>!WAITST.test(r.st)&&r.st!=='roadtest';
function workOf(k){ return S.R.filter(r=>r.tech===k&&workable(r)).reduce((a,r)=>a+(r.done?0.5:leftEst(r)),0)+S.R.filter(r=>r.helper===k).reduce((a,r)=>a+leftEst(r),0); }
function waitOf(k){ return S.R.filter(r=>r.tech===k&&WAITST.test(r.st)).reduce((a,r)=>a+leftEst(r),0); }
function upNext(k){ return S.R.filter(r=>r.tech===k&&!r.run&&workable(r)).sort((a,b)=>(a.qpos!=null?a.qpos:99)-(b.qpos!=null?b.qpos:99)||(inBay(b)?1:0)-(inBay(a)?1:0)); }
reset=(orig=>function(){ orig(); SKILLS=JSON.parse(JSON.stringify(SKILLS0)); TECH.forEach(t=>upNext(t[0]).forEach((r,i)=>{r.qpos=i+1;})); })(reset);
function techSub(r){ const idle=!r.run&&r.st==='hold'&&inBay(r)&&!r.done&&r.tech&&r.idle!=null&&idleH(r)>=0.25;
  if(isStuck(r)) return [`${ic('clock',11)}clock since yesterday`,'bad']; if(r.rt&&!r.rtOk) return ['road test failed','bad'];
  if(r.run) return [`${ic('clock',11)}on the clock · ${dur(NOW-r.run)}`,'']; if(/^W/.test(r.spot)) return [`arriving ~${hm(r.eta)}`,''];
  if(r.chk&&!r.tech) return [`checked in ${dur(NOW-r.chk)} ago`,NOW-r.chk>2?'warn':'']; if(r.st==='roadtest') return ['road test done · release',''];
  if(WAITST.test(r.st)) return [esc(ST[r.st].replace('Waiting – ','waiting · ').toLowerCase()),'']; if(idle) return [`nobody on · ${dur(idleH(r))}`,'warn'];
  if(r.done) return ['road test next','']; if(r.bring) return [`bring in · ${hh(leftEst(r))}`,''];
  if(r.q&&r.b>r.q*1.25) return [`over the quote · ${r.b.toFixed(1)} / ${r.q.toFixed(1)} h`,'warn']; return [`${hh(leftEst(r))} · ${inBay(r)?'in '+r.spot:'on '+r.spot}`,'']; }
function card2(r,s,k,ord){ const c=r.run?'now':WAITST.test(r.st)?'wait':'next', need=needOf(r), fit=fits(k,r), sb=techSub(r);
  return `<div class="fm-card ${c}${s&&s.no===r.no?' sel':''}" data-a="sel" data-ro="${r.no}" draggable="true" data-drag="${r.no}" data-ord="${ord}" data-k="${k||''}"><div class="r1">${ord?`<span class="fm-ord" title="#${ord} in ${esc(TF(k))}’s queue">${ord}</span>`:si(r)}<b class="tg-no">${r.no}</b>${need?`<span class="fm-skt${fit?'':' no'}" title="Needs ${need}${fit?'':' — '+esc(TF(k))+' isn’t on it'}">${SKA[need]}</span>`:''}${spotChip(r)}</div><div class="cu">${esc(r.cust)}</div><div class="r3${sb[1]?' '+sb[1]:''}">${sb[0]}</div></div>`; }
function dayBar(k,wk){ const T0=NOW, T1=16.5, X=h=>Math.max(0,Math.min(100,(h-T0)/(T1-T0)*100)), e=SHIFT2[k][1], o=OFF[k]; let g='';
  if(e<T1) g+=`<i class="gone" style="left:${X(e)}%;width:${100-X(e)}%" title="Shift ends ${hm(e)}"></i>`;
  if(o) g+=`<i class="off" style="left:${X(o.from)}%;width:${X(Math.min(o.to,e))-X(o.from)}%" title="${o.txt}"></i>`;
  g+=`<i class="lun" style="left:${X(12)}%;width:${X(12.5)-X(12)}%" title="Lunch"></i>`;
  const blocks=[[12,12.5]].concat(o?[[o.from,o.to]]:[]); let tt=T0, need=wk, guard=0;
  while(need>0.01&&tt<e&&guard++<20){ const bk=blocks.find(b=>tt>=b[0]&&tt<b[1]); if(bk){ tt=bk[1]; continue; } const nb=Math.min(e,...blocks.filter(b=>b[0]>tt).map(b=>b[0])); const take=Math.min(need,nb-tt); g+=`<i class="wk" style="left:${X(tt)}%;width:${X(tt+take)-X(tt)}%"></i>`; tt+=take; need-=take; }
  const lab=(h,txt,cls)=>{ const x=X(h); return `<span class="${cls||''}" style="left:${x}%;transform:translateX(${x>88?'-100%':x<6?'0':'-50%'})">${txt}</span>`; };
  return `<div class="fm-dbar${need>0.01?' spill':''}"><div class="trk">${g}${need>0.01?'<i class="sp"></i>':''}</div><div class="ax">${lab(NOW,hm(NOW))}${lab(12.25,'lunch')}${o?lab(o.from,'out '+hm(o.from),'w'):''}${lab(e,'off '+hm(e))}</div></div>`; }
vTechs=function(s){
  const lane=k=>{ const run=runOf(k), nx=upNext(k), wt=S.R.filter(r=>r.tech===k&&WAITST.test(r.st)), hl=hoursLeft(k), wk=workOf(k), w8=waitOf(k), f=freeTechs().find(x=>x.k===k), T=TODAY[k]; let over;
    over=r1(wk)-r1(hl); const cap=`<span>${hh(wk)} lined up · ${hh(hl)} left</span>`+(over>0.05?`<b class="bad" title="${NEXTDAY[k]?'Doesn’t fit today and '+HE(k)+'’s '+NEXTDAY[k]:'Doesn’t fit today — rolls to tomorrow'}">${NEXTDAY[k]?hh(over)+' over':'+'+hh(over)+' tomorrow'}</b>`:`<b class="ok">room ${hh(r1(hl)-r1(wk))}</b>`);
    return `<div class="fm-lane fm-lane2${s&&s.isTech&&s.tech===k?' sel':''}" data-tech="${k}"><div class="fm-lh">
      <span class="nm"><span class="tg-av">${k}</span>${esc(TN(k))}${run&&!isStuck(run)?'<i class="on"></i>':''}<button class="fm-ske" data-a="skills" data-k="${k}" title="Edit skills">${ic('pencil',12)}</button></span>
      <span class="now" title="Shift ${hm(SHIFT2[k][0])}–${hm(SHIFT2[k][1])}">${run?(isStuck(run)?`<span class="bad">Clock since yesterday · ${run.spot}</span>`:`On ${run.spot} · ${dur(NOW-run.run)}`):f?`<span class="warnt">Free ${dur(NOW-f.since)}</span>`:'Clocked in'}${OFF[k]?` · <span class="warnt">${OFF[k].txt}</span>`:''}${NEXTDAY[k]?` · ${NEXTDAY[k]}`:''}</span>
      <span class="fm-sks">${(SKILLS[k]||[]).map(x=>`<span class="fm-sk">${esc(x)}</span>`).join('')||'<span class="fm-sk none">No skills set</span>'}</span>
      ${dayBar(k,wk)}<small class="fm-capt"${w8?` title="Not counted: ${hh(w8)} waiting on parts, customer or support"`:''}>${cap}</small>
      <div class="fm-tdy"><span class="lb">Today</span><span><small>Clocked</small>${T.c==null?'<b class="bad" title="Clock still running from yesterday">fix</b>':`<b>${T.c.toFixed(1)}</b>`}</span><span><small>Flagged</small><b>${T.f.toFixed(1)}</b></span><span><small>Flag %</small><b class="${T.c&&T.f/T.c<0.8?'warnt':''}">${T.c?Math.round(T.f/T.c*100)+'%':'—'}</b></span><span><small>Done</small><b>${T.j}</b></span></div></div>
      <div class="fm-cards">${run?card2(run,s,k,0):''}${nx.map((r,i)=>card2(r,s,k,i+1)).join('')}${wt.map(r=>card2(r,s,k,0)).join('')}${!run&&!nx.length&&!wt.length?'<span class="fm-none">Nothing assigned</span>':''}</div></div>`; };
  const none=S.R.filter(r=>!r.tech&&(r.chk||/^W/.test(r.spot)));
  return `<div class="fm-tv"><div class="fm-lane fm-lane2 none" data-tech=""><div class="fm-lh"><span class="nm">No tech yet</span><span class="now">Checked in and arriving — drag onto a tech</span></div><div class="fm-cards">${none.map(r=>card2(r,s,'',0)).join('')||'<span class="fm-none">Everyone has a tech</span>'}</div></div>${TECH.map(t=>lane(t[0])).join('')}
    <div class="tg-leg"><span><span class="fm-ord">1</span>Up-next order — drag a card onto another to put it ahead</span><span><span class="fm-skt">BRK</span>Skill the job needs</span><span><span class="fm-skt no">BRK</span>Tech isn’t on it</span><span class="hint">The tech sees the same order on his Console</span></div></div>`;
};
function reorder(no,k,beforeNo){ const r=get(no); if(!r||r.isTech||r.run||!workable(r)) return; snap(); const was=r.tech; if(was!==k){ r.tech=k; r.chk=null; }
  const L=upNext(k).filter(x=>x.no!==no); const i=L.findIndex(x=>x.no===beforeNo); L.splice(i<0?L.length:i,0,r); L.forEach((x,j)=>{x.qpos=j+1;}); U.sel=no;
  if(was!==k){ clr(r,'userPlus',`Assigned to ${TF(k)} · #${r.qpos}`); toast(`${no} → ${TN(k)} · #${r.qpos} in ${HIS(k)} queue${fits(k,r)?'':' — '+HE(k)+' isn’t marked for '+needOf(r)}.`); }
  else toast(`${TF(k)}’s queue: ${no} is #${r.qpos} now — ${HE(k)} sees the same order on ${HIS(k)} Console.`); render(); }
const toEnd=r=>{ r.qpos=null; if(r.tech&&workable(r)&&!r.run) r.qpos=upNext(r.tech).length; };
reassign=(orig=>function(no,k){ const r0=get(no), was=r0&&r0.tech; orig(no,k); const r=get(no); if(r&&!r.isTech&&r.tech!==was){ toEnd(r); if(k&&!fits(k,r)) toast(`${no} → ${TN(k)} · #${r.qpos} in ${HIS(k)} queue — ${HE(k)} isn’t marked for ${needOf(r)}.`); else if(k) toast(`${no} → ${TN(k)} · #${r.qpos} in ${HIS(k)} queue — waiting for ${HIM(k)} to accept.`); render(); } })(reassign);
ago=(orig=>function(){ const p=U.pop, r=p&&get(p.ro), was=r&&r.tech; orig(); if(r&&r.tech!==was){ toEnd(r); render(); } })(ago);
mock.addEventListener('dragover',e=>{ if(!DRAG) return; const c=e.target.closest('.fm-card[data-ord]'); if(!c||c.dataset.ord==='0'||c.dataset.drag===DRAG) return; e.preventDefault(); e.stopPropagation(); $$('.fm-card.ins,.over',mock).forEach(x=>{ if(x!==c) x.classList.remove('ins','over'); }); c.classList.add('ins'); },true);
mock.addEventListener('drop',e=>{ if(!DRAG) return; const c=e.target.closest('.fm-card[data-ord]'); if(!c||c.dataset.ord==='0'||c.dataset.drag===DRAG) return; e.preventDefault(); e.stopPropagation(); const no=DRAG; DRAG=null; reorder(no,c.dataset.k,c.dataset.drag); },true);
mock.addEventListener('dragend',()=>{ $$('.fm-card.ins',mock).forEach(x=>x.classList.remove('ins')); });
/* skills flow into Assign, Give work and Fill a bay */
fillCands=(orig=>function(b,at){ const C=orig(b,at), ft=freeTechs().map(f=>f.k);
  C.forEach(c=>{ const need=needOf(c.r); if(!need||fits(c.tech,c.r)) return;
    const alt=ft.find(k=>fits(k,c.r))||(c.r.tech&&fits(c.r.tech,c.r)?c.r.tech:null)||TECH.map(x=>x[0]).filter(k=>fits(k,c.r)).sort((x,y)=>(hoursLeft(y)-workOf(y))-(hoursLeft(x)-workOf(x)))[0];
    if(alt){ c.note=`${TF(c.tech)} isn’t on ${need} — ${TF(alt)} is${ft.includes(alt)?' and free':''}`; c.tech=alt; } else c.note+=` · nobody is on ${need}`; });
  return C; })(fillCands);
cands=(orig=>function(k){ const C=orig(k); C.forEach(c=>{ c.fit=fits(k,c.r); }); return C.sort((a,b)=>(b.fit?1:0)-(a.fit?1:0)||a.pr-b.pr); })(cands);
const P3={
  assign:(p,r)=>{ const F=freeBays(), need=needOf(r), arr=/^W/.test(r.spot), ftk=freeTechs().map(f=>f.k);
    const T=TECH.map(x=>{ const k=x[0]; return {k,fit:fits(k,r),room:roomOf(k),run:runOf(k),free:ftk.includes(k)}; }).sort((a,b)=>(b.fit?1:0)-(a.fit?1:0)||(b.free?1:0)-(a.free?1:0)||b.room-a.room);
    if(p.t==null) p.t=r.tech&&fits(r.tech,r)?r.tech:T[0].k; if(p.bay==null) p.bay=inBay(r)?r.spot:F[0]||'';
    const pt=T.find(x=>x.k===p.t);
    return `<div class="tg-pop xf"${p.top!=null?` style="top:${p.top}px"`:''}><div class="tg-ph"><b>${arr?'Plan the arrival':'Assign'}</b><span class="tg-no">RO-${r.no}</span><span class="cu">${esc(r.cust)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
      <div class="fm-ctx">${esc(r.cmp)}${need?` · needs <b>${need}</b>`:''} · ~${hh(leftEst(r)||r.q||2)}</div>
      <span class="tg-lbl top">Tech<small style="margin-left:6px;color:var(--tg-ink4)">skill · hours free today</small></span>
      ${T.map((x,i)=>`<button class="fm-tk two${p.t===x.k?' on':''}" data-a="apick" data-k="${x.k}">${kbd(i+1)}<span class="tg-av">${x.k}</span><span class="nm"><span>${esc(TN(x.k))}${i===0?'<span class="sug">Best fit</span>':''}</span><small class="${need?(x.fit?'ok':'no'):''}">${need?(x.fit?'✓ '+need:'not on '+need):(SKILLS[x.k]||[]).join(' · ')}</small></span><span class="meta${x.room<0?' full':''}">${x.room>=0?hh(x.room)+' free':hh(-x.room)+' over'}${x.run?' · on '+x.run.spot:x.free?' · free now':''}</span></button>`).join('')}
      <span class="tg-lbl top" style="margin-top:10px">Bay</span><div class="tg-r">${F.map(b=>`<button class="tg-chip${p.bay===b?' on':''}" data-a="abay" data-b="${b}">${ic('bay',12)}${b}</button>`).join('')}<button class="tg-chip${p.bay===''?' on':''}" data-a="abay" data-b="">${inBay(r)?'Keep '+r.spot:arr?'Decide when it lands':'Leave on '+r.spot}</button></div>
      ${pt&&!pt.fit?`<div class="tg-goal" style="color:var(--tg-warn)">${ic('flag',12)}${esc(TF(p.t))} isn’t marked for ${need} — you can still assign ${HIM(p.t)}</div>`:pt&&pt.room<0?`<div class="tg-goal" style="color:var(--tg-warn)">${ic('clock',12)}${esc(TF(p.t))} is already ${hh(-pt.room)} over today</div>`:`<div class="tg-goal">${ic('clock',12)}${esc(TF(p.t))} has ${hh(Math.max(0,pt?pt.room:0))} free today${OFF[p.t]?' · '+OFF[p.t].txt:''}</div>`}
      <div class="tg-acts"><span class="hint">1–5 tech · it goes to the end of ${HIS(p.t)} queue</span><button class="btn btn-sm btn-primary" data-a="ago">${ic('userPlus',13)}${arr?'Reserve':'Assign'} ${esc(TF(p.t))}${p.bay?' · '+p.bay:''}${kbd('↵')}</button></div></div>`; },
  skills:(p)=>{ const k=p.k, my=SKILLS[k]||[];
    return `<div class="tg-pop xf fm-skp"><div class="tg-ph"><b>Skills</b><span class="cu">${esc(TN(k))}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
      <div class="tg-r">${SK.map(x=>`<button class="tg-chip tick${my.includes(x)?' on':''}" data-a="sktog" data-s="${esc(x)}">${my.includes(x)?ic('check',12):''}${esc(x)}</button>`).join('')}</div>
      <div class="tg-goal">${ic('user',12)}Assign, Give work and Fill a bay suggest techs who have the skill a job needs.</div>
      <div class="tg-acts"><span class="hint">In Parsec this lives under Manager → Staff</span><button class="btn btn-sm btn-primary" data-a="popx">Done</button></div></div>`; }
};
pop=(orig=>function(){ const p=U.pop; if(p&&P3[p.type]){ if(p.type==='skills') return P3.skills(p); const r=get(p.ro); if(r&&!r.isTech) return P3[p.type](p,r); } return orig(); })(pop);
after=(orig=>function(){ orig(); const p=U.pop, el=$('.tg-pop.fm-skp'); if(!p||p.type!=='skills'||!el) return; const body=$('.tg-body'), tg=$(`.fm-lane[data-tech="${p.k}"] .fm-ske`); if(!tg) return;
  const br=body.getBoundingClientRect(), rr=tg.getBoundingClientRect(); let left=(rr.right-br.left)/scale+8, top=(rr.top-br.top)/scale-8; if(top+el.offsetHeight>body.offsetHeight-12) top=body.offsetHeight-el.offsetHeight-12; el.style.left=Math.round(left)+'px'; el.style.top=Math.round(Math.max(12,top))+'px'; })(after);
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a;
  if(a==='skills'){ U.pop={type:'skills',k:t.dataset.k}; render(); }
  else if(a==='sktog'&&U.pop){ const k=U.pop.k, x=t.dataset.s, L=SKILLS[k]||(SKILLS[k]=[]); const i=L.indexOf(x); if(i<0) L.push(x); else L.splice(i,1); render(); } });
"""
rep("\nconst DEMO={", TECHSJS + "\nconst DEMO={")
rep("""<span class="tg-no">${c.r.no}</span> ${esc(c.r.cust)}${i===0?'<span class="sug">Closest</span>':''}""", """<span class="tg-no">${c.r.no}</span>${needOf(c.r)?`<span class="fm-skt${c.fit?'':' no'}" title="Needs ${needOf(c.r)}${c.fit?'':' — '+esc(TF(k))+' isn’t on it'}">${SKA[needOf(c.r)]}</span>`:''} ${esc(c.r.cust)}${i===0&&c.fit!==false?'<span class="sug">Best fit</span>':''}""")
rep("all waiting on others · ${hh(END-NOW)} left today", "all waiting on others · ${hh(hoursLeft(k))} left today")
rep("ld=loadOf(k), day=END-NOW, wait=", "ld=loadOf(k), day=hoursLeft(k), wait=")
rep("""if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"],[data-a="fill"]'))""", """if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"],[data-a="fill"],[data-a="skills"]'))""")
src = re.sub(r"const DEMO=\{.*?\n\};\n", """const DEMO={
  techs:()=>{reset();U.view='techs';U.sel='T-KT';render();},
  order:()=>{reset();U.view='techs';U.sel='37210';render();toast('Drag an up-next card onto another to put it ahead — try Mike’s 37210 onto 37612.',false);render();},
  skills:()=>{reset();U.view='techs';U.sel='T-KT';render();U.pop={type:'skills',k:'KT'};render();},
  assign:()=>{reset();U.view='techs';U.sel='37660';render();openPop('assign','37660');},
  cap:()=>{reset();U.view='techs';U.sel='37500';render();},
  today:()=>{reset();U.view='techs';U.sel='T-KT';render();$$('.fm-tdy').forEach(x=>x.classList.add('flash'));}
};
""", src, count=1, flags=re.S)
assert "cap:()=>" in src

CSS4 = r"""
.fm-lane2{grid-template-columns:256px minmax(0,1fr);align-items:start;}
.fm-lane2 .fm-card{width:calc((100% - 24px) / 4);}
.fm-card .r3{display:block;}
.fm-card .r3 svg{margin-right:4px;vertical-align:-2px;}
.fm-lane2 .fm-lh{gap:4px;padding-bottom:4px;}
.fm-lane2 .fm-lh .nm{width:100%;}
.fm-lane2.none{align-items:center;}
.fm-ske{margin-left:auto;width:22px;height:22px;display:inline-grid !important;place-items:center;border-radius:6px;color:var(--tg-ink3);}
.fm-ske:hover{background:var(--tg-fill);color:var(--tg-ink);}
.fm-lh .bad{color:var(--tg-bad);font-weight:500;} .fm-lh .warnt{color:var(--tg-warn);font-weight:500;}
.fm-lane2 .fm-lh .now{white-space:normal;line-height:16px;}
.fm-sks{display:flex;flex-wrap:wrap;gap:3px;margin:1px 0;}
.fm-sk{display:inline-flex;align-items:center;height:17px;padding:0 6px;border-radius:5px;background:var(--tg-fill);font-size:10.5px;font-weight:500;color:var(--tg-ink2);}
.fm-sk.none{background:transparent;color:var(--tg-ink4);padding:0;}
.fm-dbar{margin-top:3px;}
.fm-dbar .trk{position:relative;height:8px;border-radius:4px;background:var(--tg-hair);overflow:hidden;}
.fm-dbar .trk i{position:absolute;top:0;bottom:0;}
.fm-dbar .wk{background:var(--tg-ink2);}
.fm-dbar .lun{background:repeating-linear-gradient(135deg,transparent 0 2px,color-mix(in srgb,var(--tg-ink4) 70%,transparent) 2px 4px);z-index:1;}
.fm-dbar .off{background:repeating-linear-gradient(135deg,var(--tg-warn-t) 0 3px,color-mix(in srgb,var(--tg-warn) 55%,transparent) 3px 5px);}
.fm-dbar .gone{background:repeating-linear-gradient(135deg,transparent 0 3px,color-mix(in srgb,var(--tg-ink4) 55%,transparent) 3px 5px);}
.fm-dbar .sp{right:0;width:6px;background:var(--tg-st-problem);z-index:2;}
.fm-dbar .ax{position:relative;height:12px;font-size:10px;line-height:12px;color:var(--tg-ink4);margin-top:2px;white-space:nowrap;}
.fm-dbar .ax span{position:absolute;top:0;}
.fm-dbar .ax span.w{color:var(--tg-warn);}
.fm-capt{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;line-height:15px;color:var(--tg-ink3);}
.fm-capt b.ok{color:var(--tg-good);font-weight:500;} .fm-capt b.bad{color:var(--tg-bad);font-weight:500;}
.fm-tdy{display:grid;grid-template-columns:auto repeat(4,minmax(0,1fr));gap:8px;align-items:end;padding-top:6px;margin-top:3px;box-shadow:inset 0 1px 0 var(--tg-hair);}
.fm-tdy .lb{font-size:11px;font-weight:600;color:var(--tg-ink3);line-height:17px;padding-right:2px;}
.fm-tdy span{display:flex;flex-direction:column;min-width:0;}
.fm-tdy small{font-size:10px;line-height:12px;color:var(--tg-ink4);white-space:nowrap;}
.fm-tdy b{font:600 13px/17px var(--tg-sans);color:var(--tg-ink);font-variant-numeric:tabular-nums;}
.fm-tdy b.bad{color:var(--tg-bad);} .fm-tdy b.warnt{color:var(--tg-warn);}
.fm-tdy.flash{animation:tg-ping 1s ease-out 2;border-radius:4px;}
.fm-ord{display:inline-grid;place-items:center;width:16px;height:16px;border-radius:50%;background:var(--tg-ink);color:var(--tg-panel);font:600 10px/1 var(--tg-sans);flex:none;}
.fm-skt{display:inline-flex;align-items:center;height:16px;padding:0 4px;border-radius:4px;box-shadow:inset 0 0 0 1px var(--tg-border);font:600 9.5px/1 var(--tg-sans);letter-spacing:.03em;color:var(--tg-ink3);flex:none;}
.fm-skt.no{box-shadow:none;background:var(--tg-bad-t);color:var(--tg-bad);}
.fm-card .r3.bad{color:var(--tg-bad);font-weight:500;}
.fm-card.ins{box-shadow:inset 4px 0 0 var(--tg-acc),0 0 0 1px var(--tg-acc) !important;}
.fm-tk.two{height:auto;min-height:42px;padding:5px 10px !important;}
.fm-tk .nm{display:flex;flex-direction:column;line-height:17px;min-width:0;}
.fm-tk .nm small{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-tk .nm small.no{color:var(--tg-bad);} .fm-tk .nm small.ok{color:var(--tg-good);}
.tg-pop.fm-skp{width:360px;}
.fm-cand .m b .fm-skt{margin:0 2px 0 6px;vertical-align:1px;}
.fm-tv .tg-leg .fm-ord{width:14px;height:14px;font-size:9px;}
"""
rep('.fm-pr .cp span:first-child{transform:none;}', CSS4 + '\n.fm-pr .cp span:first-child{transform:none;}')

src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("techs", "Techs"), ("order", "1 · Order the queue"), ("skills", "2 · Skills"), ("assign", "2 · Assign by skill"), ("cap", "3 · Real capacity"), ("today", "4 · Today per tech")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("1 · Order the queue", "Each tech’s up-next jobs are numbered. Drag one onto another to put it ahead, or onto another tech to hand it over. The tech sees the same order on his Console."),
 ("2 · Skills", "Each tech has skills — Electrical, Aftertreatment, Brakes and so on — and each job shows the one it needs, red when the tech isn’t on it. Assign sorts best fit first. Give work and Fill a bay suggest someone who has it. Edit with the pencil; in Parsec it lives under Manager → Staff."),
 ("3 · Real capacity", "Hours left come from each tech’s own shift, minus lunch and time off. The bar fills with the work lined up; what won’t fit spills to tomorrow — or shows as over if they’re off tomorrow."),
 ("4 · Today per tech", "Hours clocked, hours flagged and the % between them, with jobs finished today."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Foreman floor</title>", "<title>Parsec Foreman techs</title>")
rep("Parsec · Foreman — Floor", "Parsec · Foreman — Techs")
rep("<h2>Floor<small>Builds on the Needs action changes. Use the buttons above.</small></h2>", "<h2>Techs<small>Builds on the Needs action and Floor changes. Use the buttons above.</small></h2>")

exec(compile(src, SRC, "exec"), {"__name__": "__main__", "__file__": SRC})
