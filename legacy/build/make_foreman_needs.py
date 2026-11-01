# Foreman — four new Needs action items: stuck clocks, free techs, back again, failed road tests.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_foreman.py")
src = open(SRC).read()

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:80], c)
    src = src.replace(a, b)

# ---------- data ----------
rep("spot:'B7',tech:'AW',run:9.08,q:6.0,b:4.2}", "spot:'B7',tech:'AW',run:-9.17,q:6.0,b:2.5,lastNote:{at:-8.03,t:'Clutch is in, bolting up the bell housing.'}}")
rep("st:'working',sub:'Testing',spot:'B8',tech:'KT',run:9.83,q:1.5,b:0.4}", "st:'hold',spot:'B8',tech:'KT',done:9.83,lastStop:9.83,q:1.5,b:1.4}")
rep("spot:'UP',tech:'LM',q:3.0,b:0.5,hold:{to:'parts',who:'Parts desk',h:20,goal:24}}", "spot:'UP',tech:'LM',q:3.0,b:1.7,hold:{to:'parts',who:'Parts desk',h:20,goal:24},lunch:{tech:'LM',from:11.92,to:13.08}}")
rep("spot:'T3',tech:'',chk:7.83,q:2.0,b:0}", "spot:'T3',tech:'',chk:7.83,q:2.0,b:0,rep:{no:'37190',closed:'Oct 10',days:12,mi:'3,140',tech:'AW',was:'Air leak at the dash',fix:'Replaced the treadle valve, leak-tested the dash lines.',hrs:1.8}}")
rep("st:'roadtest',spot:'D1',tech:'MR',q:2.5,b:2.6}", "st:'hold',spot:'D1',tech:'MR',q:2.5,b:2.6,rt:{at:9.92,by:'MR',mi:14,note:'Still losing coolant at highway speed — temp climbs past 210.'}}")

# ---------- techs as list items ----------
rep("const get=no=>S.R.find(r=>r.no===no);", """const SHIFT={MR:7,LM:7,PS:7.5,AW:7,KT:7};
const TPS={}; TECH.forEach(t=>{TPS['T-'+t[0]]={no:'T-'+t[0],cust:t[1],tech:t[0],isTech:true,spot:'',unit:'',cmp:'',st:'hold',q:0,b:0};});
const get=no=>S.R.find(r=>r.no===no)||TPS[no];""")
rep("const GROUPS=[['sent','Sent to you'],['you','Waiting on you'],['tech','Needs a tech'],['in','Bring in'],['road','Road test'],['watch','Watch']];",
    "const GROUPS=[['clock','Clocks'],['free','Free techs'],['sent','Sent to you'],['you','Waiting on you'],['back','Back again'],['road','Road test'],['tech','Needs a tech'],['in','Bring in'],['watch','Watch']];")
rep("    if(r.sent&&!r.acc) it={g:'sent'", """    const stuck=r.run!=null&&(r.run<0||NOW-r.run>10);
    if(stuck) it={g:'clock',ic:'clock',why:`${TF(r.tech)}’s clock still running from yesterday ${hm(r.run+24)} · ${dur(NOW-r.run)}`,btn:'Stop it',act:'stopclk',late:true};
    else if(r.lunch&&!r.lunchOk) it={g:'clock',ic:'clock',why:`${TF(r.lunch.tech)}’s clock ran through lunch yesterday · ${hm(r.lunch.from)}–${hm(r.lunch.to)}`,btn:'Fix',act:'fixclk'};
    else if(r.rep&&!r.repOk) it={g:'back',ic:'history',why:`Back ${r.rep.days} days after RO-${r.rep.no} · same complaint · ${TF(r.rep.tech)} fixed it`,btn:'Review',act:'repeat',late:true};
    else if(r.rt&&!r.rtOk) it={g:'road',ic:'road',why:`Failed ${hm(r.rt.at)} · ${TF(r.rt.by)}: ${r.rt.note}`,btn:'Decide',act:'rtfail',late:true};
    else if(r.sent&&!r.acc) it={g:'sent'""")
rep("it.late=lateOf(r);", "it.late=it.late||lateOf(r);")
rep("  clashes().forEach(c=>{", """  freeTechs().forEach(f=>L.push({g:'free',ic:'user',why:`Free ${dur(NOW-f.since)} · ${f.last?'last job '+f.last.no+' done '+hm(f.since):'clocked in '+hm(SHIFT[f.k])} · ${f.wait} waiting on others`,btn:'Give work',act:'give',ro:TPS['T-'+f.k],late:NOW-f.since>0.5}));
  clashes().forEach(c=>{""")
# list item: a tech shows an avatar and a name, not an RO number
m = re.search(r'<span class="tg-gi">\$\{ic\(x\.ic,15\)\}</span><span class="tg-t"><b class="tg-no">\$\{r\.no\}</b><b class="tg-cu">\$\{esc\(r\.cust\)\}</b>(.*?)\$\{spotChip\(r\)\}</span>', src)
assert m, "item template"
src = src.replace(m.group(0), '<span class="tg-gi">${r.isTech?`<span class="tg-av">${r.tech}</span>`:ic(x.ic,15)}</span><span class="tg-t">${r.isTech?\'\':`<b class="tg-no">${r.no}</b>`}<b class="tg-cu">${esc(r.cust)}</b>' + m.group(1) + '${r.isTech?\'\':spotChip(r)}</span>')
rep("function moveTo(no,spot){ const r=get(no); if(!r||r.spot===spot) return;", "function moveTo(no,spot){ const r=get(no); if(!r||r.isTech||r.spot===spot) return;")
rep("function reassign(no,k){ const r=get(no); if(!r||r.tech===k) return;", "function reassign(no,k){ const r=get(no); if(!r||r.isTech||r.tech===k) return;")
rep("function topOf(r){\n  const c=cat(r)", "function topOf(r){\n  if(r.isTech) return techTop(r);\n  const c=cat(r)")
rep("  if(r.run){c='on';", "  if(r.run!=null&&(r.run<0||NOW-r.run>10)){c='idle stuck';st=`${ic('clock',12)}Since yesterday`;}\n  else if(r.run){c='on';")
rep("  const sub=r.run?`${ic('clock',11)}on the clock · ${dur(NOW-r.run)}`:", "  const stk=r.run!=null&&(r.run<0||NOW-r.run>10);\n  const sub=stk?`${ic('clock',11)}clock since yesterday ${hm(r.run+24)}`:r.rt&&!r.rtOk?'road test failed':r.run?`${ic('clock',11)}on the clock · ${dur(NOW-r.run)}`:")
rep("  const warn=idle||", "  const warn=stk||(r.rt&&!r.rtOk)||idle||")
rep('return `<div class="fm-lane" data-tech="${k}">', 'return `<div class="fm-lane${s&&s.isTech&&s.tech===k?\' sel\':\'\'}" data-tech="${k}">')
rep(":'Off the clock'}</span>", ":(freeTechs().find(f=>f.k===k)?`<span style=\"color:var(--tg-warn);font-weight:500\">Clocked in · free ${dur(NOW-freeTechs().find(f=>f.k===k).since)}</span>`:'Off the clock')}</span>")
rep("function vYard(s){\n", "function vYard(s){\n  if(s&&s.isTech) s=S.R.find(r=>r.tech===s.tech&&inBay(r))||S.R[0];\n")

NEWJS = r"""
/* ---------- v2: stuck clocks · free techs · back again · failed road tests ---------- */
const isStuck=r=>r.run!=null&&(r.run<0||NOW-r.run>10);
const WAITST=/^(parts|support|customer|foreman)$/;
function freeTechs(){ return TECH.map(t=>t[0]).filter(k=>!runOf(k)&&!S.R.some(r=>r.tech===k&&r.st==='hold'&&inBay(r)&&!r.done&&!r.rt))
  .map(k=>{ const mine=S.R.filter(r=>r.tech===k), last=mine.filter(r=>r.lastStop!=null).sort((a,b)=>b.lastStop-a.lastStop)[0];
    return {k,last,since:last?last.lastStop:SHIFT[k],wait:mine.filter(r=>WAITST.test(r.st)).length}; }).filter(f=>NOW-f.since>=0.25); }
function techTop(r){ const k=r.tech, f=freeTechs().find(x=>x.k===k), ld=loadOf(k), day=END-NOW, wait=S.R.filter(x=>x.tech===k&&WAITST.test(x.st));
  return `<div class="tg-top"><div class="r1"><span class="tg-av">${k}</span><span>Technician · clocked in ${hm(SHIFT[k])}</span><span class="sp"></span><button class="btn btn-sm" data-a="view" data-v="techs">${ic('user',14)}His lane</button></div>
   <h2>${esc(r.cust)}</h2><div class="r2">${f?`<span class="tg-late">Free ${dur(NOW-f.since)}</span>`:''}${f&&f.last?`<span>Last job <b class="tg-no">RO-${f.last.no}</b> · ${f.last.spot} · done ${hm(f.since)}</span>`:''}<span>${hh(ld)} of work · ${hh(day)} left today</span></div></div>
   <div class="tg-next"><span class="k">Next</span><p>${f?`Nothing he can work on — ${wait.map(x=>x.no+' waits on '+ST[x.st].replace('Waiting – ','').toLowerCase()).join(', ')}.`:'He has work.'}</p>${f?`<button class="btn btn-sm btn-primary" data-a="do" data-ro="${r.no}">Give work${kbd('↵')}</button>`:''}</div>`; }
function cands(k){ const c=[];
  S.R.forEach(r=>{ if(r.tech===k||r.run) return;
    if(inBay(r)&&r.st==='hold'&&r.tech&&!r.done&&!r.rt&&r.idle!=null&&idleH(r)>=0.25){ const o=runOf(r.tech); c.push({r,why:`In ${r.spot} · nobody on ${dur(idleH(r))} · ${TF(r.tech)}’s${o?', '+TF(r.tech)+' is on '+o.spot:''}`,inb:true,pr:0}); }
    else if(r.bring) c.push({r,why:`${r.bring} · ${TF(r.tech)} next (${hh(loadOf(r.tech))} of work)`,pr:1});
    else if(r.chk&&!r.tech) c.push({r,why:`Checked in ${dur(NOW-r.chk)} ago · ${r.spot}${r.rep&&!r.repOk?' · back again — review first':''}`,pr:r.rep&&!r.repOk?3:2}); });
  return c.sort((a,b)=>a.pr-b.pr).slice(0,5); }
const hdT=(k,r)=>`<div class="tg-ph"><b>${k}</b>${r.isTech?'':`<span class="tg-no">RO-${r.no}</span>`}<span class="cu">${esc(r.cust)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
function tlBar(segs){ return `<div class="fm-tl"><div class="bar">${segs.map(s=>`<i class="${s[0]}" style="flex:${s[1]}"></i>`).join('')}</div><div class="cp">${segs.map(s=>`<span class="${s[0]}" style="flex:${s[1]}">${s[2]}</span>`).join('')}</div></div>`; }
const opt=(p,i,t,d)=>`<button class="fm-opt${p.o===i?' on':''}" data-a="dpick" data-i="${i}">${kbd(i+1)}<b>${t}</b><small>${d}</small></button>`;
const NEWP={
  stopclk:(p,r)=>{ if(p.o==null) p.o=0; if(p.rs==null) p.rs=true; const st=r.run, ln=r.lastNote, tf=TF(r.tech);
    const O=[[`End of shift · yesterday 16:30`,16.5-24,' · suggested'],[`Last note · yesterday ${hm(ln.at+24)}`,ln.at,''],['Now · keep all of it',NOW,'']];
    return `<div class="tg-pop xf">${hdT('Clock still running',r)}<div class="fm-ctx"><b>${esc(TN(r.tech))}</b> clocked on yesterday ${hm(st+24)} and never clocked off. Last note ${hm(ln.at+24)}: <q>${esc(ln.t)}</q></div>
      ${tlBar([['w',3,`${hm(st+24)}–16:30 worked`],['x',3,'overnight'],['t',3,`07:00–${hm(NOW)} today`]])}
      ${O.map((o,i)=>opt(p,i,o[0],`${hh(o[1]-st)} on this clock${o[2]}`)).join('')}
      ${p.o!==2?`<label class="tg-opt"><input type="checkbox" data-a="rs"${p.rs?' checked':''}>Start a new clock from 07:00 today, when ${esc(tf)} clocked in</label>`:''}
      <div class="tg-acts"><span class="hint">Logged on the RO · ${esc(tf)} sees it on his Console</span><button class="btn btn-sm btn-primary" data-a="ngo">${['Stop at 16:30','Stop at '+hm(ln.at+24),'Stop now'][p.o]}${kbd('↵')}</button></div></div>`; },
  fixclk:(p,r)=>{ if(p.o==null) p.o=0; const L=r.lunch, tf=TF(L.tech), tot=L.to-L.from;
    return `<div class="tg-pop xf">${hdT('Clock ran through lunch',r)}<div class="fm-ctx"><b>${esc(TN(L.tech))}</b> · yesterday ${hm(L.from)}–${hm(L.to)} · ${hh(tot)} on this RO, no lunch break clocked</div>
      ${tlBar([['w',1.3,hm(L.from)],['x',2,'12:00–12:30 lunch'],['w',2.4,`12:30–${hm(L.to)}`]])}
      ${opt(p,0,'Take out lunch · 12:00–12:30',`${hh(tot-0.5)} left on the RO · splits the clock in two`)}${opt(p,1,'Worked through lunch',`Keep ${hh(tot)} · noted on the RO`)}${opt(p,2,'Other times','Type the start and stop')}
      ${p.o===2?`<div class="fm-times"><span>From</span><input type="time" value="${hm(L.from)}"><span>to</span><input type="time" value="${hm(L.to)}"></div>`:''}
      <div class="tg-acts"><span class="hint">${esc(tf)} sees the change on his Console</span><button class="btn btn-sm btn-primary" data-a="ngo">${['Take out lunch','Keep '+hh(tot),'Save times'][p.o]}${kbd('↵')}</button></div></div>`; },
  repeat:(p,r)=>{ if(p.o==null) p.o=0; const R=r.rep, tf=TF(R.tech);
    return `<div class="tg-pop xf">${hdT('Back again',r)}<div class="fm-cmp"><div><small>Last visit · RO-${R.no}</small><b>${esc(R.was)}</b><p>${esc(R.fix)}</p><span>Closed ${R.closed} · ${esc(TN(R.tech))} · ${hh(R.hrs)}</span></div><div class="now"><small>Now · RO-${r.no}</small><b>${esc(r.cmp)}</b><p>Checked in ${hm(r.chk)} on ${r.spot} · no tech yet</p><span>Unit ${esc(r.unit)} · ${R.days} days · ${R.mi} mi later</span></div></div>
      <div class="fm-same">${ic('history',13)}Same unit, same complaint — likely a comeback</div>
      ${opt(p,0,`Comeback — back to ${esc(tf)}`,'No charge to the customer · flagged comeback · waits under Bring in')}${opt(p,1,'Comeback — someone else','Flagged comeback · then pick the tech')}${opt(p,2,'Not related','A normal repair · goes to Needs a tech')}${opt(p,3,'I’ll look first','Stays with you · back in the list in 1 h')}
      <div class="tg-acts"><span class="hint">1–4 choose · the comeback flag shows on the RO and in Fixes</span><button class="btn btn-sm btn-primary" data-a="ngo">${['Back to '+esc(tf),'Pick a tech…','Not related','Snooze 1 h'][p.o]}${kbd('↵')}</button></div></div>`; },
  rtfail:(p,r)=>{ if(p.o==null) p.o=0; const T=r.rt, tf=TF(r.tech);
    return `<div class="tg-pop xf">${hdT('Road test failed',r)}<div class="fm-rt"><span class="res">Fail</span><b>${esc(TN(T.by))} · ${T.mi} mi · ${hm(T.at)}</b><q>${esc(T.note)}</q></div>
      <div class="fm-ops"><div class="fm-op"><span class="t">${esc(r.cmp)}</span><span class="h${r.b>r.q?' over':''}">${r.b.toFixed(1)} / ${r.q.toFixed(1)} h</span></div></div>
      ${opt(p,0,`Redo — back to ${esc(tf)}`,'No charge for the redo · waits for a bay under Bring in')}${opt(p,1,'I’ll drive it','Stays with you · back in the list in 1 h')}${opt(p,2,'Someone else','Pick another tech for the redo')}${opt(p,3,'More work found','To Dana · new estimate for the customer')}
      <div class="tg-acts"><span class="hint">1–4 choose · the result stays on the RO</span><button class="btn btn-sm btn-primary" data-a="ngo">${['Back to '+esc(tf),'Snooze 1 h','Pick a tech…','Send to Dana'][p.o]}${kbd('↵')}</button></div></div>`; },
  give:(p,r)=>{ const k=r.tech, C=cands(k), f=freeTechs().find(x=>x.k===k), F=freeBays();
    if(p.pick==null) p.pick=C[0]&&C[0].r.no; const pk=C.find(c=>c.r.no===p.pick); if(pk&&!pk.inb&&p.bay==null) p.bay=F[0];
    return `<div class="tg-pop xf">${hdT('Give work',r)}<div class="fm-ctx"><b>${esc(TF(k))}</b> is free${f?' since '+hm(f.since):''} · ${hh(loadOf(k))} of work, all waiting on others · ${hh(END-NOW)} left today</div>
      <span class="tg-lbl top">Trucks he can take</span>${C.map((c,i)=>`<button class="fm-cand${p.pick===c.r.no?' on':''}" data-a="gpick" data-no="${c.r.no}">${kbd(i+1)}${sq(cat(c.r))}<span class="m"><b><span class="tg-no">${c.r.no}</span> ${esc(c.r.cust)}${i===0?'<span class="sug">Closest</span>':''}</b><small>${esc(c.why)}</small></span><span class="meta">${hh(left(c.r)||c.r.q)}</span></button>`).join('')}
      ${pk&&!pk.inb?`<span class="tg-lbl top" style="margin-top:10px">Bay</span><div class="tg-r">${F.map(b=>`<button class="tg-chip${p.bay===b?' on':''}" data-a="abay" data-b="${b}">${ic('bay',12)}${b}</button>`).join('')}</div>`:''}
      <div class="tg-acts"><span class="hint">1–${C.length} pick · he gets it on his Console</span><button class="btn btn-sm btn-primary" data-a="ngo"${pk?'':' disabled'}>${ic('userPlus',13)}Give ${esc(TF(k))} ${pk?pk.r.no+(pk.inb?'':' · '+(p.bay||'')):''}${kbd('↵')}</button></div></div>`; }
};
pop=(orig=>function(){ const p=U.pop; if(p&&NEWP[p.type]){ const r=get(p.ro); return r?NEWP[p.type](p,r):''; } return orig(); })(pop);
openPop=(orig=>function(type,no){ const r=get(no); if(r&&r.isTech&&type!=='snooze') type='give'; return orig(type,no); })(openPop);
reset=(orig=>function(){ orig(); Object.values(TPS).forEach(t=>{delete t.snz;delete t.snzWhy;}); })(reset);
function ngo(){ const p=U.pop, r=get(p.ro), b=flat(), o=p.o||0; snap();
  if(p.type==='stopclk'){ const tf=TF(r.tech), end=[16.5-24,r.lastNote.at,NOW][o], h=end-r.run; r.b+=h; r.lastStop=end;
    r.run=o!==2&&p.rs?7:null; if(r.run==null&&o!==2) r.idle=NOW;
    return done(r,'clock',`Clock stopped ${o===2?'now':'yesterday '+hm(end+24)}`,`${tf}’s clock on ${r.no} stopped ${o===2?'now':'at yesterday '+hm(end+24)} · ${hh(h)}${r.run!=null?' · new clock from 07:00':''}.`,b); }
  if(p.type==='fixclk'){ const tf=TF(r.lunch.tech); if(o===0) r.b-=0.5; r.lunchOk=true;
    return done(r,'clock',o===0?'Lunch taken out':o===1?'Worked through lunch':'Clock times fixed',o===0?`Lunch taken out of ${tf}’s clock on ${r.no} · now ${hh(r.lunch.to-r.lunch.from-0.5)}.`:o===1?`Kept — ${tf} worked through lunch. Noted on ${r.no}.`:`Clock times saved on ${r.no}.`,b); }
  if(p.type==='repeat'){ const R=r.rep;
    if(o===3){ r.snz=NOW+1; r.snzWhy='Looking at the last visit'; return done(r,'clock','Snoozed — looking first',`${r.cust} snoozed until ${hm(NOW+1)} — it stays with you.`,b); }
    r.repOk=true;
    if(o===0){ r.comeback=true; r.tech=R.tech; r.chk=null; r.bring=`Comeback on RO-${R.no} · no charge`; return done(r,'history',`Comeback — back to ${TF(R.tech)}`,`${r.no} flagged comeback · back to ${TN(R.tech)} · no charge. It waits under Bring in.`,b); }
    if(o===1){ r.comeback=true; clr(r,'history','Flagged comeback'); U.pop={type:'assign',ro:r.no,i:0}; toast(`${r.no} flagged comeback — pick the tech.`); render(); return; }
    return done(r,'check','Not related',`Not related — ${r.no} goes on as a normal repair.`,b); }
  if(p.type==='rtfail'){ const tf=TF(r.tech);
    if(o===1){ r.snz=NOW+1; r.snzWhy='You’re driving it'; return done(r,'road','Driving it yourself',`${r.cust} snoozed until ${hm(NOW+1)} — you’re driving it.`,b); }
    r.rtOk=true;
    if(o===0){ r.bring=`Failed road test · redo, no charge`; return done(r,'road',`Redo — back to ${tf}`,`${r.no} back to ${TN(r.tech)} for a redo · no charge. It waits under Bring in.`,b); }
    if(o===2){ r.bring='Failed road test · redo'; clr(r,'road','Road test failed — new tech'); U.pop={type:'assign',ro:r.no,i:0}; toast(`Pick who redoes ${r.no}.`); render(); return; }
    r.st='customer'; r.sub='Estimate sent'; r.hold={to:'writer',who:'Dana Kowalski',h:0,goal:4}; return done(r,'swap','To Dana · more work found',`${r.no} to Dana · more work found after the road test.`,b); }
  if(p.type==='give'){ const k=r.tech, C=cands(k), pk=C.find(c=>c.r.no===p.pick); if(!pk){ UNDO.pop(); return; } const c=pk.r, was=c.tech;
    c.tech=k; if(!pk.inb&&p.bay){ c.spot=p.bay; U.flash=p.bay; } c.bring=null; c.chk=null; c.st='hold'; c.idle=NOW; if(c.rep) c.repOk=true;
    clr(c,'userPlus',`Given to ${TF(k)}${pk.inb?'':' · '+p.bay}`); afterAct(r.no,b); U.pop=null; U.sel=c.no;
    toast(`${c.no} → ${TN(k)}${pk.inb?' in '+c.spot:' · '+c.spot}${was?' (was '+TF(was)+')':''} — waiting for him to clock on.`); render(); return; }
}
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t||!U.pop) return; const a=t.dataset.a, p=U.pop;
  if(a==='ngo') ngo(); else if(a==='gpick'){ p.pick=t.dataset.no; p.bay=null; render(); } else if(a==='rs'){ p.rs=!p.rs; render(); } });
addEventListener('keydown',e=>{ const p=U.pop; if(!p||!NEWP[p.type]||e.target.matches('input,textarea')||e.ctrlKey||e.metaKey||e.altKey) return; const n=+e.key;
  if(n>=1&&n<=5){ const bt=p.type==='give'?$$('.tg-pop [data-a="gpick"]')[n-1]:$(`.tg-pop [data-a="dpick"][data-i="${n-1}"]`); if(bt) bt.click(); e.preventDefault(); } });
"""
rep("const DEMO={", NEWJS + "\nconst DEMO={")
src = re.sub(r"const DEMO=\{.*?\n\};\n", """const DEMO={
  list:()=>{reset();render();},
  clock:()=>{reset();U.sel='37590';render();openPop('stopclk','37590');},
  lunch:()=>{reset();U.sel='37420';render();openPop('fixclk','37420');},
  free:()=>{reset();U.sel='T-KT';render();openPop('give','T-KT');},
  back:()=>{reset();U.sel='37628';render();openPop('repeat','37628');},
  road:()=>{reset();U.sel='37210';render();openPop('rtfail','37210');}
};
""", src, count=1, flags=re.S)
assert "clock:()=>" in src

CSS2 = r"""
.tg-gi .tg-av{width:24px;height:24px;font-size:9.5px;background:var(--tg-raised);}
.fm-lane.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.fm-bay.stuck .r1 .st{color:var(--tg-bad);}
.fm-bay.stuck{box-shadow:0 0 0 1px color-mix(in srgb,var(--tg-bad) 50%,transparent),0 2px 6px -3px rgba(0,0,0,.1) !important;}
.fm-bay.stuck.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc),0 0 0 1px color-mix(in srgb,var(--tg-bad) 50%,transparent) !important;}
.fm-tl{margin:0 0 12px;}
.fm-tl .bar{display:flex;gap:2px;height:10px;border-radius:5px;overflow:hidden;}
.fm-tl .bar i{display:block;height:100%;min-width:4px;}
.fm-tl .bar .w{background:var(--tg-st-working);}
.fm-tl .bar .t{background:var(--tg-ink3);}
.fm-tl .bar .x{background:repeating-linear-gradient(135deg,var(--tg-warn) 0 3px,var(--tg-warn-t) 3px 6px);}
.fm-tl .cp{display:flex;gap:2px;margin-top:5px;font-size:11px;line-height:14px;color:var(--tg-ink3);}
.fm-tl .cp span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:4px;}
.fm-tl .cp .x{color:var(--tg-warn);font-weight:500;}
.fm-cmp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}
.fm-cmp > div{display:flex;flex-direction:column;gap:3px;padding:9px 11px;border-radius:10px;background:var(--tg-canvas);min-width:0;}
.fm-cmp > div.now{background:var(--tg-warn-t);}
.fm-cmp small{font-size:11.5px;color:var(--tg-ink3);}
.fm-cmp b{font-size:13px;font-weight:500;}
.fm-cmp p{margin:0;font-size:12.5px;line-height:17px;color:var(--tg-ink2);}
.fm-cmp span{font-size:11.5px;color:var(--tg-ink3);margin-top:auto;padding-top:4px;}
.fm-same{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500;color:var(--tg-warn);margin:0 0 8px;}
.fm-rt{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin:-2px 0 10px;padding:9px 11px;border-radius:10px;background:var(--tg-bad-t);font-size:12.5px;color:var(--tg-ink2);}
.fm-rt .res{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;background:var(--tg-bad);color:var(--tg-panel);font-size:11px;font-weight:600;}
.fm-rt b{font-weight:500;color:var(--tg-ink);}
.fm-rt q{flex-basis:100%;font-style:italic;} .fm-rt q::before{content:"“";} .fm-rt q::after{content:"”";}
.fm-cand{display:grid !important;grid-template-columns:auto auto minmax(0,1fr) auto;column-gap:9px;align-items:center;width:100%;padding:7px 10px !important;border-radius:9px;text-align:left;}
.fm-cand:hover{background:var(--tg-fill);} .fm-cand.on{background:var(--tg-fill);box-shadow:inset 0 0 0 1.5px var(--tg-ink);}
.fm-cand .m{display:flex;flex-direction:column;min-width:0;}
.fm-cand .m b{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-cand .m small{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-cand .meta{font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.fm-cand .sug{display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:5px;background:var(--tg-good-t);color:var(--tg-good);font-size:10.5px;font-weight:600;margin-left:6px;vertical-align:1px;}
.fm-times{display:flex;gap:8px;align-items:center;margin-top:8px;font-size:12.5px;color:var(--tg-ink3);}
.tg .fm-times input{width:110px;height:30px;}
"""
rep('.fm-about-ref{font-size:12px;color:var(--ink-3);}\n"""', '.fm-about-ref{font-size:12px;color:var(--ink-3);}\n' + CSS2 + '"""')

# ---------- the frame ----------
src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("list", "Needs action"), ("clock", "1 · Stuck clock"), ("lunch", "1 · Through lunch"), ("free", "2 · Free tech"), ("back", "3 · Back again"), ("road", "4 · Failed road test")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("1 · Clocks", "A clock still running from yesterday, or one that ran through lunch. Stop it at the end of the shift, at the last note, or now — and start a fresh one from today’s clock-in. The bay shows it in red until it’s fixed."),
 ("2 · Free techs", "Clocked in, nothing running, nothing he can work on. Give work lists what’s closest first: a bay with nobody on, parts in hand, a fresh check-in."),
 ("3 · Back again", "Same unit back within 30 days. The last visit sits next to this one. Comeback back to the same tech, someone else, or not related."),
 ("4 · Failed road test", "The result and the driver’s note come straight to you. Redo, drive it yourself, someone else, or more work found."),
 ("Where they sit", "The two about people come first — Clocks, then Free techs. Back again follows Waiting on you; a failed road test leads the Road test group."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Foreman mock-up</title>", "<title>Parsec Foreman needs action</title>")
rep("Parsec · Foreman — Triage patterns carried over", "Parsec · Foreman — Needs action")
rep("<h2>Foreman<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2>", "<h2>Needs action<small>Four new kinds of item. Use the buttons above, or J K and ↵.</small></h2>")

g = {"__name__": "__main__", "__file__": SRC}
exec(compile(src, SRC, "exec"), g)
