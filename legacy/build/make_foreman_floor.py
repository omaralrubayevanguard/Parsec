# Foreman — Floor ideas on top of the Needs action changes:
# when each bay frees up (tiles + Day view), fill a free bay, promises at risk, today's numbers.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
NS = os.path.join(B, "make_foreman_needs.py")
SRC = os.path.join(B, "make_foreman.py")
t = open(NS).read()
lib = t.split('\ng = {"__name__"')[0]
ns = {"__file__": NS, "__name__": "needs_lib"}
exec(compile(lib, NS, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:80], c)
    src = src.replace(a, b)

# promise times (new RO field)
rep("{no:'37150',", "{no:'37150',promise:10.5,lounge:true,")
rep("({you:'Waiting on you',tech:'Need a tech',late:'Late'})", "({you:'Waiting on you',tech:'Need a tech',late:'Late',risk:'At risk'})")
rep("{no:'37602',", "{no:'37602',promise:12,")
rep("{no:'37544',", "{no:'37544',promise:11,")
rep("{no:'37655',", "{no:'37655',promise:13,")
rep("{no:'37420',", "{no:'37420',promise:16,")
rep("{no:'37612',", "{no:'37612',promise:15,")
rep("""if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"]'))""", """if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"],[data-a="fill"]'))""")

FLOORJS = r"""
/* ---------- v3: when bays free up · fill a free bay · promises at risk · today's numbers ---------- */
const LUNCH=[12,12.5];
const addWork=(st,h)=>{ let e=st+h; if(st<LUNCH[0]&&e>LUNCH[0]) e+=LUNCH[1]-LUNCH[0]; return Math.ceil(e*12-1e-6)/12; };
const leftEst=r=>{ let l=left(r); if(r.q&&r.b>=r.q) l=1.0; if(!r.q) l=2.0; if(r.helper) l=l/2; return l; };
function freeAt(r){
  if(isStuck(r)) return {t:null,k:'stuck',txt:'fix the clock first'};
  if(r.run) return {t:addWork(NOW,leftEst(r)),k:'on'};
  if(r.done) return {t:NOW+0.5,k:'done',txt:'after the road test'};
  if(r.st==='parts'){ const m=/due (\w+)/.exec(r.sub||''); return {t:null,k:'wait',txt:'parts'+(m?' due '+m[1]:'')}; }
  if(WAITST.test(r.st)) return {t:null,k:'wait',txt:'waiting on '+ST[r.st].replace('Waiting – ','').toLowerCase()};
  if(r.tech){ const o=runOf(r.tech), st=o&&o!==r&&!isStuck(o)?(freeAt(o).t||NOW):NOW; return {t:addWork(st,leftEst(r)),k:'next',start:st}; }
  return {t:null,k:'none',txt:'no tech'};
}
function riskOf(r){ if(r.promise==null) return null; const f=freeAt(r); if(f.t==null) return {risk:true,ready:null,txt:f.txt}; return {risk:f.t>r.promise+0.04,ready:f.t}; }
needsAll=(orig=>function(){ const L=orig(), have={}; L.forEach(x=>{have[x.ro.no]=x;});
  S.R.forEach(r=>{ const k=riskOf(r); if(!k||!k.risk||r.riskOk||snoozed(r)) return;
    if(have[r.no]){ have[r.no].why+=` · promised ${hm(r.promise)}`; have[r.no].risk=true; return; }
    L.push({g:'watch',ic:'flag',ro:r,late:true,risk:true,btn:'Review',act:'risk',why:k.ready!=null?`Promised ${hm(r.promise)} · ready ~${hm(k.ready)} · ${dur(k.ready-r.promise)} late${r.lounge?' · customer waiting':''}`:`Promised ${hm(r.promise)} today · ${freeAt(r).txt}`}); });
  return L; })(needsAll);
match=(orig=>function(it){ return U.filt==='risk'?!!it.risk:orig(it); })(match);
head=(orig=>function(){ const h=orig(), n=needsAll().filter(x=>x.risk).length, on=U.filt==='risk';
  const b=`<button class="tg-hf w${on?' on':''}" data-a="filt" data-k="risk"><b>${n}</b>at risk${on?ic('x',12):''}</button><i>·</i>`;
  const i=h.indexOf('<button class="tg-hf w'); return i<0?h:h.slice(0,i)+b+h.slice(i); })(head);
freeTechs=(orig=>function(){ return orig().filter(f=>!S.R.some(r=>r.helper===f.k)); })(freeTechs);

bayTile=function(b,s){
  const r=S.R.find(x=>x.spot===b);
  if(!r) return `<div class="fm-bay free fill" data-a="fill" data-bay="${b}" data-drop="${b}" title="Fill ${b}"><div class="r1"><span class="l">${b}</span><span class="st">free now</span></div><span class="open">${ic('plus',13)}Fill this bay</span></div>`;
  let c='', st='';
  if(isStuck(r)){c='idle stuck';st=`${ic('clock',12)}Since yesterday`;}
  else if(r.run){c='on';st=`<span class="live tg-live" style="background:var(--tg-st-working)"></span>${dur(NOW-r.run)}`;}
  else if(r.st==='hold'&&r.tech&&!r.done&&r.idle!=null&&idleH(r)>=0.25){c='idle';st=`Nobody on · ${dur(idleH(r))}`;}
  else if(r.st==='hold'&&r.tech&&!r.done){c='wait';st='Up next';}
  else if(r.done){c='done';st=`${ic('road',12)}Road test next`;}
  else {c='wait';st=`${si(r)}${esc(ST[r.st].replace('Waiting – ','').replace('Tech Support','tech support').toLowerCase())}`;}
  const f=freeAt(r), k=riskOf(r), risk=k&&k.risk;
  const right=risk?`<span class="hrs risk">${ic('flag',11)}${hm(r.promise)} · ${k.ready!=null?'~'+hm(k.ready):esc(f.txt)}</span>`:`<span class="hrs">${f.t!=null?(f.k==='done'?'road test':'free ~'+hm(f.t)):esc(f.txt)}</span>`;
  return `<div class="fm-bay ${c}${risk?' risk':''}${s&&s.no===r.no?' sel':''}${U.flash===b?' flash':''}" data-a="sel" data-ro="${r.no}" data-drop="${b}" draggable="true" data-drag="${r.no}" title="${esc(r.cust+' · '+stTxt(r)+(r.q?' · '+r.b.toFixed(1)+' of '+r.q.toFixed(1)+' h':'')+(r.promise!=null?' · promised '+hm(r.promise):''))}"><div class="r1"><span class="l">${b}</span><span class="st">${st}</span></div><div class="t"><b class="tg-no">${r.no}</b><b class="cu">${esc(r.cust)}</b></div><div class="r3">${r.tech?`<span class="tg-av">${r.tech}</span><span class="nm">${esc(TF(r.tech))}</span>`:'<span class="nm">No tech</span>'}${right}</div>${r.q?`<span class="ln${r.b>r.q?' over':''}"><i style="width:${Math.min(100,r.b/r.q*100).toFixed(0)}%"></i></span>`:''}</div>`;
};
function todayStrip(){
  const hl=Math.max(0,END-NOW-(NOW<LUNCH[0]?0.5:0)), avail=TECH.length*hl;
  const lined=S.R.filter(r=>r.tech&&!WAITST.test(r.st)&&r.st!=='roadtest'&&!r.done).reduce((a,r)=>a+leftEst(r),0)+S.R.filter(r=>r.helper).reduce((a,r)=>a+leftEst(r),0);
  const BASE={MR:1.05,LM:1.6,PS:2.4,AW:0,KT:2.83};
  const clk=TECH.reduce((a,t)=>{ const o=runOf(t[0]); return a+BASE[t[0]]+(o?NOW-Math.max(o.run,7):0); },0), flag=11.4, eff=Math.round(flag/clk*100), F=freeBays();
  const cell=(l,v,sub,pct,extra)=>`<div class="fm-st"${extra||''}><span class="l">${l}</span><b>${v}</b><span class="m"><i style="width:${Math.min(100,pct).toFixed(0)}%"></i></span><small>${sub}</small></div>`;
  return `<div class="fm-today">${cell('Lined up for today',hh(lined),`of ${hh(avail)} left · ${hh(Math.max(0,avail-lined))} open`,lined/avail*100)}${cell('Clocked today',hh(clk),`${TECH.filter(t=>runOf(t[0])).length} of ${TECH.length} on now · since 07:00`,clk/(TECH.length*(NOW-7))*100)}${cell('Flagged today',hh(flag),`${eff}% of clocked`,eff)}${cell('Bays',`${BAYS.length-F.length} / ${BAYS.length}`,F.length?`${F.length} free now — click to fill`:'none free',(BAYS.length-F.length)/BAYS.length*100,F.length?` data-a="fill" data-bay="${F[0]}"`:'')}</div>`;
}
function dayView(s){
  const T0=NOW, T1=END, X=h=>Math.max(0,Math.min(1,(h-T0)/(T1-T0)))*100, P=v=>v.toFixed(2)+'%';
  const arr=S.R.filter(r=>/^W/.test(r.spot)&&r.eta);
  const axis=`<div class="fm-dax"><span class="lab"></span><div class="trk"><span class="now">now ${hm(NOW)}</span>${[11,12,13,14,15,16].map(h=>`<span class="tk" style="left:${P(X(h))}">${hm(h)}</span>`).join('')}</div></div>`
    +(arr.length?`<div class="fm-dax arr-row"><span class="lab">In</span><div class="trk">${arr.map(r=>`<button class="arr" data-a="sel" data-ro="${r.no}" style="left:${P(X(r.eta))}" title="${esc(r.cust)} — arriving ~${hm(r.eta)}">${ic('inArrow',11)}${r.no} ~${hm(r.eta)}</button>`).join('')}</div></div>`:'');
  const lun=`<i class="lun" style="left:${P(X(12))};width:${P(X(12.5)-X(12))}"></i>`;
  const rows=BAYS.map(b=>{ const r=S.R.find(x=>x.spot===b), pl=S.R.filter(x=>x.plan&&x.plan.bay===b); let h='', from=T0;
    if(r){ const f=freeAt(r), k=riskOf(r), st=f.start&&f.start>T0?f.start:T0, end=f.t==null?T1:Math.min(T1,f.t);
      const cls=f.k==='on'?'on':f.k==='stuck'?'stuck':f.k==='next'?'next':f.k==='done'?'done':'wait';
      if(st>T0) h+=`<span class="pre" style="left:0;width:${P(X(st))}" title="${esc(TF(r.tech))} is on another truck until ~${hm(st)}"></span>`;
      h+=`<button class="bar ${cls}${k&&k.risk?' risk':''}${s&&s.no===r.no?' sel':''}" data-a="sel" data-ro="${r.no}" style="left:${P(X(st))};width:${P(Math.max(3,X(end)-X(st)))}" title="${esc(r.cust)} · ${f.t!=null?'free ~'+hm(f.t):esc(f.txt)}"><b>${r.no}</b>${r.tech?esc(TF(r.tech)):''}${f.t==null?' · '+esc(f.txt):f.k==='stuck'?' · fix the clock':''}</button>`;
      if(r.promise!=null) h+=`<i class="pm${k&&k.risk?' bad':''}" style="left:${P(X(r.promise))}" title="Promised ${hm(r.promise)}"></i>`;
      from=f.t==null?T1:f.t; }
    pl.forEach(x=>{ const e=addWork(x.plan.at,x.q||2); h+=`<button class="bar plan${s&&s.no===x.no?' sel':''}" data-a="sel" data-ro="${x.no}" style="left:${P(X(x.plan.at))};width:${P(Math.max(3,X(e)-X(x.plan.at)))}" title="Planned"><b>${x.no}</b>${esc(TF(x.tech))} · planned</button>`; from=Math.max(from,e); });
    if(from<T1) h+=`<button class="gap" data-a="fill" data-bay="${b}"${from>T0?` data-at="${from}"`:''} style="left:${P(X(from))};width:${P(100-X(from))}">${from>T0?'free ~'+hm(from):ic('plus',11)+'free now — fill '+b}</button>`;
    return `<div class="fm-drow"><span class="lab">${b}</span><div class="trk">${lun}${h}</div></div>`; }).join('');
  return `<div class="fm-day">${axis}${rows}<div class="tg-leg"><span><i class="lg on"></i>On the clock</span><span><i class="lg next"></i>Up next</span><span><i class="lg wait"></i>Waiting — no time yet</span><span><i class="lg plan"></i>Planned</span><span><i class="pmk"></i>Promised</span><span><i class="lg lun"></i>Lunch</span><span class="hint">Click a free stretch to fill it</span></div></div>`;
}
vFloor=function(r){
  const F=freeBays(), used=BAYS.length-F.length;
  const nf=BAYS.map(b=>{ const x=S.R.find(y=>y.spot===b); if(!x) return null; const f=freeAt(x); return f.t!=null&&f.k!=='done'?{b,t:f.t,x}:null; }).filter(Boolean).sort((a,c)=>a.t-c.t).slice(0,3);
  const wt=S.R.filter(x=>!inBay(x)&&(x.bring||/^W/.test(x.spot)||(x.chk&&!x.tech)));
  const hdr=`<div class="fm-bh">Bays<small>${used} of ${BAYS.length} in use</small><span class="fm-nf">${F.length?`<b>${F.length} free now</b>`:''}Next free${nf.map(o=>`<button class="fm-nfc" data-a="sel" data-ro="${o.x.no}" title="${esc(o.x.cust)}">${o.b} ~${hm(o.t)}</button>`).join('')}</span><span class="tg-seg3 fm-mode"><button class="${U.day?'':'on'}" data-a="daymode" data-v="0">Grid</button><button class="${U.day?'on':''}" data-a="daymode" data-v="1">Day</button></span></div>`;
  return `<div class="fm-fl">${topOf(r)}${todayStrip()}<div class="fm-bays">${hdr}${U.day?dayView(r):`<div class="fm-grid">${BAYS.map(b=>bayTile(b,r)).join('')}</div>`}
   <div class="fm-wt"><span class="k">Waiting for a bay</span>${wt.map(x=>`<span class="fm-chip${x.no===r.no?' sel':''}" data-a="sel" data-ro="${x.no}" draggable="true" data-drag="${x.no}">${sq(cat(x))}<b class="tg-no">${x.no}</b>${esc(x.cust.split(' ')[0])}<small>${x.plan?'→ '+x.plan.bay+' ~'+hm(x.plan.at):(x.tech?TF(x.tech):'no tech')+' · '+x.spot}</small></span>`).join('')}<span class="hint">Drag onto an open bay, or click one</span></div></div></div>`;
};
function fillCands(b,at){ const ft=freeTechs().map(f=>f.k), hl=END-NOW-0.5, light=TECH.map(t=>t[0]).sort((a,c)=>loadOf(a)-loadOf(c))[0];
  return S.R.filter(r=>!inBay(r)&&!(r.plan&&r.plan.bay!==b)&&(r.bring||(r.chk&&!r.tech)||(/^W/.test(r.spot)))).map(r=>{
    const h=r.q||2, arrv=/^W/.test(r.spot); let why, pr, tech=r.tech, note;
    if(r.bring){ why=r.bring; pr=0; } else if(arrv){ why=`Arriving ~${hm(r.eta)}`; pr=at!=null&&at>=r.eta?1:2; } else { why=`Checked in ${dur(NOW-r.chk)} ago${r.rep&&!r.repOk?' · back again — review first':''}`; pr=r.rep&&!r.repOk?3:1; }
    const busy=tech&&at==null&&runOf(tech)&&!isStuck(runOf(tech))?runOf(tech):null;
    if(ft.length&&(!tech||loadOf(tech)>hl||busy)){ note=!tech?`${TF(ft[0])} is free`:busy?`${TF(tech)} is on ${busy.spot} — ${TF(ft[0])} can start now`:`${TF(tech)} is full — ${TF(ft[0])} is free`; tech=ft[0]; if(r.bring) pr=-0.5; }
    else if(!tech){ tech=light; note=`${TF(tech)} has the least work`; } else note=`${TF(tech)} is next`;
    return {r,h,why,pr,tech,note}; }).sort((a,c)=>a.pr-c.pr).slice(0,5); }
function riskStrip(r,k){ const T0=NOW, end=Math.max(r.promise,k.ready||r.promise)+0.25, X=h=>Math.max(0,Math.min(100,(h-T0)/(end-T0)*100));
  return `<div class="fm-pr"><div class="trk"><i class="fill${k.ready!=null&&k.ready>r.promise?' late':''}" style="width:${X(k.ready!=null?k.ready:end).toFixed(1)}%;--ok:${(X(r.promise)/Math.max(1,X(k.ready||end))*100).toFixed(1)}%"></i><i class="pm" style="left:${X(r.promise).toFixed(1)}%"></i><span class="pml" style="left:${X(r.promise).toFixed(1)}%">promised ${hm(r.promise)}</span></div><div class="cp"><span style="left:0">now ${hm(NOW)}</span>${k.ready!=null?`<span style="left:${X(k.ready).toFixed(1)}%" class="r">ready ~${hm(k.ready)}</span>`:''}</div></div>`; }
const P2={
  fill:(p)=>{ const b=p.bay, at=p.at, C=fillCands(b,at); if(p.pick==null) p.pick=C[0]&&C[0].r.no; const pk=C.find(c=>c.r.no===p.pick); if(pk&&p.t==null) p.t=pk.tech;
    const ft=freeTechs().map(f=>f.k), st=at!=null?at:NOW;
    return `<div class="tg-pop xf fill"><div class="tg-ph"><b>Fill ${b}</b><span class="cu">${at!=null?'free ~'+hm(at):'free now'}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
      <span class="tg-lbl top">Best next</span>${C.map((c,i)=>`<button class="fm-cand${p.pick===c.r.no?' on':''}" data-a="fpick" data-no="${c.r.no}">${kbd(i+1)}${sq(cat(c.r))}<span class="m"><b><span class="tg-no">${c.r.no}</span> ${esc(c.r.cust)}${i===0?'<span class="sug">Best fit</span>':''}</b><small>${esc(c.why)} · ${esc(c.note)}</small></span><span class="meta">${hh(c.h)} · done ~${hm(addWork(st,c.h))}</span></button>`).join('')||'<p class="tg-none">Nothing waiting for a bay.</p>'}
      ${pk?`<span class="tg-lbl top" style="margin-top:10px">Tech</span><div class="tg-r">${TECH.map(t=>`<button class="tg-chip${p.t===t[0]?' on':''}" data-a="ftech" data-k="${t[0]}"><span class="tg-av" style="width:18px;height:18px;font-size:8.5px">${t[0]}</span>${esc(t[1].split(' ')[0])}<small>${ft.includes(t[0])?'free':hh(loadOf(t[0]))}</small></button>`).join('')}</div>`:''}
      <div class="tg-acts"><span class="hint">${at!=null?'Planned — it shows on the Day view':'Moves the truck · the tech gets it on his Console'}</span><button class="btn btn-sm btn-primary" data-a="fgo"${pk?'':' disabled'}>${ic('bay',13)}${pk?(at!=null?'Plan ':'Bring ')+pk.r.no+' · '+esc(TF(p.t)):'Pick a truck'}${kbd('↵')}</button></div></div>`; },
  risk:(p,r)=>{ const k=riskOf(r)||{risk:false,ready:freeAt(r).t}, f=freeAt(r), ft=freeTechs().map(x=>x.k); if(p.o==null) p.o=0;
    const late=k.ready!=null, O=late?[[`Tell Dana — new time ~${hm(k.ready)}`,'She updates the customer · logged on the RO'],[ft.length?`Add ${TF(ft[0])} to help`:'Add a second tech',ft.length?`${TF(ft[0])} is free · about ${hh(leftEst(r)/2)} faster`:'Pick who helps'],['It’ll make it',`Check again at ${hm(r.promise)}`]]
      :[[`Tell Dana — ${esc(f.txt)}`,'She calls the customer with the new day'],['Chase the part','To Ben in Parts · reason “Promised today”'],['Keep the promise for now','Check again at 14:00']];
    return `<div class="tg-pop xf"${p.top!=null?` style="top:${p.top}px"`:''}>${hdT('Promise at risk',r)}<div class="fm-ctx">Promised <b>${hm(r.promise)}</b> to ${esc(r.cust)}${r.lounge?' · <b>customer waiting in the lounge</b>':''}<br>${late?`Ready about <b>${hm(k.ready)}</b> — ${dur(k.ready-r.promise)} late${r.tech?' · '+esc(TF(r.tech))+(r.run?' is on it':' isn’t on it yet'):''}`:`Can’t finish today — ${esc(f.txt)}`}</div>
      ${late?riskStrip(r,k):''}${O.map((o,i)=>opt(p,i,o[0],o[1])).join('')}
      <div class="tg-acts"><span class="hint">1–3 choose</span><button class="btn btn-sm btn-primary" data-a="rgo2">${late?['Send to Dana',ft.length?'Add '+esc(TF(ft[0])):'Pick a tech…','Snooze to '+hm(r.promise)][p.o]:['Send to Dana','Send to Parts','Snooze to 14:00'][p.o]}${kbd('↵')}</button></div></div>`; }
};
pop=(orig=>function(){ const p=U.pop; if(p&&P2[p.type]) return P2[p.type](p,p.ro?get(p.ro):null); return orig(); })(pop);
after=(orig=>function(){ orig(); const p=U.pop, el=$('.tg-pop.fill'); if(!p||p.type!=='fill'||!el) return;
  const body=$('.tg-body'), tg=$(`.fm-drow .gap[data-bay="${p.bay}"]`)||$(`.fm-bay[data-bay="${p.bay}"]`)||$('.fm-st[data-a="fill"]'); if(!tg) return;
  const br=body.getBoundingClientRect(), rr=tg.getBoundingClientRect(), w=el.offsetWidth, h=el.offsetHeight;
  let left=(rr.left-br.left)/scale, top=(rr.bottom-br.top)/scale+6;
  if(left+w>body.offsetWidth-12) left=body.offsetWidth-w-12; if(top+h>body.offsetHeight-12) top=(rr.top-br.top)/scale-h-6;
  el.style.left=Math.max(12,left)+'px'; el.style.top=Math.max(12,top)+'px'; })(after);
function fgo(){ const p=U.pop, C=fillCands(p.bay,p.at), pk=C.find(c=>c.r.no===p.pick); if(!pk) return; const c=pk.r, was=c.tech, b=flat(); snap(); c.tech=p.t;
  if(p.at!=null){ c.plan={bay:p.bay,at:p.at}; clr(c,'bay',`Planned into ${p.bay} ~${hm(p.at)}`); U.pop=null; U.sel=c.no; toast(`${c.no} planned into ${p.bay} at ~${hm(p.at)} · ${TN(p.t)}.`); render(); return; }
  c.spot=p.bay; c.bring=null; c.chk=null; c.plan=null; c.st='hold'; c.idle=NOW; if(c.rep) c.repOk=true; U.flash=p.bay;
  clr(c,'bay',`Brought in to ${p.bay}`); afterAct(c.no,b); U.pop=null; U.sel=c.no; toast(`${c.no} → ${p.bay} · ${TN(p.t)}${was&&was!==p.t?' (was '+TF(was)+')':''} — waiting for him to clock on.`); render(); }
function rgo2(){ const p=U.pop, r=get(p.ro), k=riskOf(r), b=flat(), o=p.o||0, ft=freeTechs(); snap();
  if(k&&k.ready!=null){
    if(o===0){ const nt=Math.ceil(k.ready*4)/4; r.promise=nt; r.riskOk=true; return done(r,'swap',`New time ~${hm(nt)} · to Dana`,`Dana will tell ${r.cust.split(' ')[0]} the new time: ~${hm(nt)}.`,b); }
    if(o===1){ if(!ft.length){ U.pop={type:'assign',ro:r.no,i:0}; render(); return; } r.helper=ft[0].k; r.riskOk=true; return done(r,'userPlus',`${TF(ft[0].k)} helping`,`${TN(ft[0].k)} helps on ${r.spot} — ready ~${hm(freeAt(r).t)}.`,b); }
    r.snz=r.promise; r.snzWhy='It’ll make it'; return done(r,'clock','Snoozed to the promise',`${r.cust} snoozed until ${hm(r.promise)}.`,b); }
  if(o===0){ r.riskOk=true; return done(r,'swap','Dana — new day',`Dana will call ${r.cust.split(' ')[0]}: ${freeAt(r).txt}.`,b); }
  if(o===1){ r.riskOk=true; r.hold={to:'parts',who:'Ben Okafor',h:0,goal:4}; return done(r,'swap','Chasing the part',`${r.no} to Ben · chase the part — promised today.`,b); }
  r.snz=14; r.snzWhy='Keeping the promise'; return done(r,'clock','Snoozed to 14:00',`${r.cust} snoozed until 14:00.`,b); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a;
  if(a==='fill'){ U.pop={type:'fill',bay:t.dataset.bay,at:t.dataset.at!=null?+t.dataset.at:null,ro:null}; U.srch=false; render(); }
  else if(a==='daymode'){ U.day=t.dataset.v==='1'; U.pop=null; render(); }
  else if(U.pop&&a==='fpick'){ U.pop.pick=t.dataset.no; U.pop.t=null; render(); }
  else if(U.pop&&a==='ftech'){ U.pop.t=t.dataset.k; render(); }
  else if(U.pop&&a==='fgo') fgo();
  else if(U.pop&&a==='rgo2') rgo2(); });
addEventListener('keydown',e=>{ const p=U.pop; if(!p||!P2[p.type]||e.target.matches('input,textarea')||e.ctrlKey||e.metaKey||e.altKey) return; const n=+e.key;
  if(n>=1&&n<=5){ const bt=p.type==='fill'?$$('.tg-pop [data-a="fpick"]')[n-1]:$(`.tg-pop [data-a="dpick"][data-i="${n-1}"]`); if(bt) bt.click(); e.preventDefault(); } });
"""
rep("\nconst DEMO={", FLOORJS + "\nconst DEMO={")
src = re.sub(r"const DEMO=\{.*?\n\};\n", """const DEMO={
  floor:()=>{reset();U.sel='37602';render();},
  day:()=>{reset();U.day=true;U.sel='37602';render();},
  fill:()=>{reset();U.sel='37455';render();U.pop={type:'fill',bay:'B11',at:null,ro:null};render();},
  risk:()=>{reset();U.sel='37150';render();openPop('risk','37150');},
  today:()=>{reset();U.sel='37602';render();const t=$('.fm-today');if(t){t.classList.add('flash');}}
};
""", src, count=1, flags=re.S)
assert "today:()=>" in src

CSS3 = r"""
.fm-today{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 28px 0;flex:none;}
.fm-st{display:flex;flex-direction:column;gap:3px;padding:8px 12px 9px;border-radius:12px;background:var(--tg-canvas);min-width:0;}
.fm-st .l{font-size:11.5px;color:var(--tg-ink3);}
.tg .fm-st b{font:500 18px/22px var(--tg-serif) !important;color:var(--tg-ink);}
.fm-st .m{height:4px;border-radius:2px;background:var(--tg-hair);overflow:hidden;margin-top:2px;}
.fm-st .m i{display:block;height:100%;background:var(--tg-ink2);border-radius:2px;}
.fm-st small{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-st[data-a]{cursor:pointer;} .fm-st[data-a]:hover{box-shadow:inset 0 0 0 1px var(--tg-bs);}
.fm-st[data-a] small{color:var(--tg-acctx);font-weight:500;}
.fm-today.flash .fm-st{animation:tg-ping 1s ease-out 2;}
.fm-nf{display:inline-flex;align-items:center;gap:6px;margin-left:12px;font-weight:400;font-size:12px;color:var(--tg-ink3);}
.fm-nf b{font-weight:500;color:var(--tg-acctx);margin-right:8px;}
.fm-nfc{display:inline-flex;align-items:center;height:22px;padding:0 8px !important;border-radius:7px;background:var(--tg-canvas);font:500 11.5px/1 var(--tg-mono) !important;color:var(--tg-ink2);}
.fm-nfc:hover{background:var(--tg-fill);color:var(--tg-ink);}
.fm-mode{margin-left:auto;font-weight:400;}
.fm-bay .r3 .hrs{display:inline-flex;align-items:center;gap:3px;}
.fm-bay .r3 .hrs.risk{color:var(--tg-warn);font-weight:500;}
.fm-bay.risk{box-shadow:0 0 0 1.5px var(--tg-warn),0 2px 6px -3px rgba(0,0,0,.1) !important;}
.fm-bay.risk.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc),0 0 0 1.5px var(--tg-warn) !important;}
.fm-bay.free.fill{cursor:pointer;}
.fm-bay.free.fill:hover{background:var(--tg-acct);background-image:none;box-shadow:inset 0 0 0 1.5px var(--tg-accl);}
.fm-bay.free.fill:hover .open{color:var(--tg-acctx);}
.fm-bay.free .open{display:inline-flex;align-items:center;gap:5px;}
.fm-bay.free .r1 .st{color:var(--tg-ink3);font-weight:400;margin-left:auto;}
.fm-day{display:flex;flex-direction:column;gap:3px;}
.fm-dax,.fm-drow{display:grid;grid-template-columns:40px minmax(0,1fr);gap:8px;align-items:center;}
.fm-dax{height:22px;margin-bottom:2px;}
.fm-dax .trk{position:relative;height:100%;font-size:11px;color:var(--tg-ink3);}
.fm-dax .tk{position:absolute;top:4px;transform:translateX(-50%);}
.fm-dax .now{position:absolute;left:0;top:4px;font-weight:600;color:var(--tg-acctx);}
.fm-dax.arr-row{height:22px;margin-bottom:4px;}
.fm-dax.arr-row .lab{font:500 11px/1 var(--tg-sans);color:var(--tg-ink3);}
.fm-dax .arr{position:absolute;top:1px;display:inline-flex;align-items:center;gap:3px;height:19px;padding:0 6px;border-radius:6px;background:var(--tg-acct);color:var(--tg-acctx);font-weight:500;white-space:nowrap;}
.fm-drow .lab{font:500 11px/1 var(--tg-mono);color:var(--tg-ink3);}
.fm-drow .trk{position:relative;height:25px;border-radius:7px;background:var(--tg-canvas);}
.fm-drow .lun{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(135deg,transparent 0 3px,color-mix(in srgb,var(--tg-ink4) 35%,transparent) 3px 5px);}
.fm-drow .bar,.fm-drow .gap{position:absolute;top:2px;bottom:2px;display:flex !important;align-items:center;gap:5px;padding:0 8px !important;border-radius:6px;font-size:11.5px;white-space:nowrap;overflow:hidden;min-width:0;}
.fm-drow .bar{color:var(--tg-ink);z-index:1;}
.fm-drow .bar b{font:500 11px/1 var(--tg-mono);}
.fm-drow .bar.on{background:color-mix(in srgb,var(--tg-st-working) 22%,var(--tg-raised));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-st-working) 45%,transparent);}
.fm-drow .bar.next,.fm-drow .bar.done{background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-border);}
.fm-drow .bar.wait{background:repeating-linear-gradient(135deg,var(--tg-raised) 0 6px,var(--tg-fill) 6px 9px);box-shadow:inset 0 0 0 1px var(--tg-hair);color:var(--tg-ink2);}
.fm-drow .bar.stuck{background:var(--tg-bad-t);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-bad) 45%,transparent);color:var(--tg-bad);}
.fm-drow .bar.plan{background:var(--tg-acct);box-shadow:inset 0 0 0 1.5px var(--tg-accl);color:var(--tg-acctx);}
.fm-drow .bar.risk{box-shadow:inset 0 0 0 1.5px var(--tg-warn);}
.fm-drow .bar.sel{box-shadow:inset 0 0 0 2px var(--tg-acc);}
.fm-drow .pre{position:absolute;top:11px;height:3px;border-radius:2px;background:var(--tg-border);}
.fm-drow .gap{color:var(--tg-ink4);}
.fm-drow .gap:hover{background:var(--tg-acct);color:var(--tg-acctx);box-shadow:inset 0 0 0 1.5px var(--tg-accl);}
.fm-drow .pm{position:absolute;top:-3px;width:9px;height:9px;margin-left:-4.5px;transform:rotate(45deg);background:var(--tg-ink2);border-radius:1.5px;box-shadow:0 0 0 2px var(--tg-panel);z-index:3;}
.fm-drow .pm.bad{background:var(--tg-warn);}
.fm-day .tg-leg{margin-top:10px;}
.fm-day .tg-leg .lg{display:inline-block;width:14px;height:10px;border-radius:3px;}
.fm-day .tg-leg .lg.on{background:color-mix(in srgb,var(--tg-st-working) 22%,var(--tg-raised));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-st-working) 45%,transparent);}
.fm-day .tg-leg .lg.next{background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-border);}
.fm-day .tg-leg .lg.wait{background:repeating-linear-gradient(135deg,var(--tg-raised) 0 4px,var(--tg-fill) 4px 6px);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.fm-day .tg-leg .lg.plan{background:var(--tg-acct);box-shadow:inset 0 0 0 1.5px var(--tg-accl);}
.fm-day .tg-leg .lg.lun{background:repeating-linear-gradient(135deg,transparent 0 3px,color-mix(in srgb,var(--tg-ink4) 45%,transparent) 3px 5px);}
.fm-day .tg-leg .pmk{display:inline-block;width:8px;height:8px;transform:rotate(45deg);background:var(--tg-ink2);border-radius:1.5px;}
.tg-pop.fill{width:440px;}
.fm-pr{margin:0 0 12px;padding-top:20px;}
.fm-pr .pml{position:absolute;top:-21px;transform:translateX(-50%);font-size:11px;font-weight:600;color:var(--tg-ink);white-space:nowrap;}
.fm-pr .trk{position:relative;height:10px;border-radius:5px;background:var(--tg-hair);}
.fm-pr .trk .fill{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:var(--tg-st-working);}
.fm-pr .trk .fill.late{background:linear-gradient(90deg,var(--tg-st-working) var(--ok),var(--tg-warn) var(--ok));}
.fm-pr .trk .pm{position:absolute;top:-2px;width:12px;height:12px;margin-left:-6px;transform:rotate(45deg);background:var(--tg-ink);border-radius:2px;box-shadow:0 0 0 2px var(--tg-raised);}
.fm-pr .cp{position:relative;height:16px;margin-top:6px;font-size:11px;color:var(--tg-ink3);}
.fm-pr .cp span{position:absolute;top:0;transform:translateX(-50%);white-space:nowrap;}
.fm-pr .cp span:first-child{transform:none;} .fm-pr .cp span.r{transform:translateX(-100%);color:var(--tg-warn);font-weight:500;}
"""
rep('.tg .fm-times input{width:110px;height:30px;}\n', '.tg .fm-times input{width:110px;height:30px;}\n' + CSS3)

src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("floor", "Floor"), ("day", "1 · When bays free up"), ("fill", "2 · Fill a free bay"), ("risk", "3 · Promise at risk"), ("today", "4 · Today’s numbers")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("1 · When each bay frees up", "Every bay says “free ~11:40”, worked out from the quoted hours left and lunch. The three soonest sit in the Bays header. Waiting bays say what they’re waiting on instead of a time."),
 ("1 · Day view", "Grid or Day. Day lays the bays out from now to the end of the shift: on the clock, up next, waiting, planned, lunch, arrivals and promises. Click any free stretch to fill it."),
 ("2 · Fill a free bay", "Click an open bay, a free stretch on the Day view, or the Bays number. The best next truck comes first — parts in hand, then check-ins, then arrivals — with the right tech. If the assigned tech is full and someone’s free, it suggests the free one."),
 ("3 · Promise at risk", "An RO can carry a promise time. When the work won’t make it, the bay turns amber and it lands in Watch. Tell Dana the new time, add a free tech, or keep it. “At risk” in the header filters to just these."),
 ("4 · Today’s numbers", "One line above the board: work lined up against tech hours left, hours clocked, hours flagged, and bays in use."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Foreman needs action</title>", "<title>Parsec Foreman floor</title>")
rep("Parsec · Foreman — Needs action", "Parsec · Foreman — Floor")
rep("<h2>Needs action<small>Four new kinds of item. Use the buttons above, or J K and ↵.</small></h2>", "<h2>Floor<small>Builds on the Needs action changes. Use the buttons above.</small></h2>")

exec(compile(src, SRC, "exec"), {"__name__": "__main__", "__file__": SRC})
