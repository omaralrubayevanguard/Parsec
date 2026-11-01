/* Parsec · pages/manager · actions.js
   Doing things on Manager: pop-overs, go to a KPI, clicks and keys.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   openPop goKpi onClick onChange onInput move keydown after (8 functions)
   state      laborRate
   uses       access/ data/ pages/ pages/inbox/ pages/rolist/ ro/ shell/ state/
*/
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); if(el) PG.anchor(U,el); rd(); }
function goKpi(id,F){ U.sel=id; U.view='kpi'; U.bf=F||null; U.bk=null; U.pop=null; U.kb=false; if(U.lf!=='all'&&!kRows().some(k=>k.id===id)) U.lf='all'; rd(); const it=$('.tg-scroll .tg-it.on'), sc=$('.tg-scroll'); if(it&&sc) sc.scrollTop=it.offsetTop-120; }
function onClick(t,e){ const a=t.dataset.a, p=U.pop;
  if(a==='noop') return;
  if(a==='sel'){ if(t.dataset.go||U.view!=='kpi'){ goKpi(t.dataset.k); return; } U.sel=t.dataset.k; U.bf=null; U.bk=null; U.kb=false; U.pop=null; rd(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; rd(); }
  else if(a==='ptime'){ UI.dHome='manager'; UI.tlWho=PPL[t.dataset.k]; UI.tlView=t.dataset.v; PG.go('timelog'); }   /* 17.1: Team › a person's time */
  else if(a==='pcar'){ UI.dHome='manager'; UI.crWho=t.dataset.k; PG.go('career'); }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p){ U.pop=null; rd(); return; } const ex={}; if(t.dataset.k) ex.k=t.dataset.k; if(t.dataset.i!=null) ex.i=t.dataset.i; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; rd(); }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); rd(); }
  else if(a==='pset'){ U.p=t.dataset.v; U.bk=null; U.pop=null; rd(); }
  else if(a==='pin'){ const id=t.dataset.k; if(U.pins.includes(id)){ snap(); U.pins[U.pins.indexOf(id)]=null; toast(`${KM[id].n} is off the Overview — its spot is open.`); } else { const i=U.pins.indexOf(null); if(i<0){ toast('The Overview holds 12 tiles — take one off in Edit tiles first.',false); rd(); return; } snap(); U.pins[i]=id; toast(`${KM[id].n} pinned to the Overview.`); } rd(); }
  else if(a==='tq'){ p.v=t.dataset.v; rd(); }
  else if(a==='tsave'){ const k=KM[p.k], v=parseFloat((($('#mq-tv')||{}).value||'').replace(/[$,%]/g,'')); if(!(v>=0)){ toast('Type a number.',false); rd(); return; } snap(); U.tg[k.id]=v; U.pop=null; toast(`Target for ${k.n}: ${fmt(k.u,v)}${k.tw!=null?' per workday':''}.`); rd(); }
  else if(a==='tclr'){ const k=KM[p.k]; snap(); U.tg[k.id]=null; U.pop=null; toast(`${k.n} has no target now.`); rd(); }
  else if(a==='brk'){ U.brk[U.sel]=t.dataset.v; rd(); }
  else if(a==='bf'){ const f=t.dataset.f, v=t.dataset.v; U.bf=U.bf&&U.bf.k===f&&U.bf.v===v?null:{k:f,v}; U.bk=null; rd(); }
  else if(a==='bfx'){ U.bf=null; rd(); }
  else if(a==='bk'){ const i=+t.dataset.i; U.bk=U.bk===i?null:i; rd(); }
  else if(a==='bkx'){ U.bk=null; rd(); }
  else if(a==='lf'){ U.lf=t.dataset.v; const L=kRows(); if(L.length&&!L.some(k=>k.id===U.sel)){ U.sel=L[0].id; U.bf=null; U.bk=null; } rd(); }
  else if(a==='nd'){ const n=NEEDS().find(x=>x.id===t.dataset.id); if(!n) return; const x=n.a[+t.dataset.i];
    if(x[1]==='open'){ if(n.ro) PG.openRo(n.ro); else PG.go('inbox'); return; }
    snap(); const st=IB.store().st; st[n.id]=Object.assign(st[n.id]||{},{done:nowIso(),how:'from the Manager page'}); IB.flush(); toast('Done.'); rd(); }
  else if(a==='nall'){ U.nall=!U.nall; rd(); }
  else if(a==='ed'){ U.ed=!U.ed; U.pop=null; rd(); }
  else if(a==='tx'){ e.stopPropagation(); const id=t.dataset.k; snap(); U.pins[U.pins.indexOf(id)]=null; toast(`${KM[id].n} is off the Overview — pick one for its spot.`); rd(); }
  else if(a==='tdef'){ snap(); U.pins=PINS0.slice(); toast('Back to the usual 12.'); rd(); }
  else if(a==='lockpg' && t.dataset.v==='tech'){ toast(pRole(t.dataset.k)==='Technician'?'The Technician page is always on for a technician.':'Technicians open the Technician page for their own repair orders — and the admin, for any technician.',false); rd(); }
  else if(a==='lockpg'){ toast(pRole(t.dataset.k)==='Manager'?'The Manager page is always on for the manager.':'Only the manager role opens the Manager page.',false); rd(); }
  else if(a==='addk'){ const id=t.dataset.k; let i=p&&p.i!=null?+p.i:U.pins.indexOf(null); if(i<0||U.pins[i]){ i=U.pins.indexOf(null); } if(i<0){ U.pop=null; toast('The Overview holds 12 tiles — take one off first.',false); rd(); return; } snap(); U.pins[i]=id; U.pop=null; toast(`${KM[id].n} added to the Overview.`); rd(); }
  else if(a==='flow'){ U.flow=t.dataset.k; rd(); }
  else if(a==='rule'){ const r=U.rules.find(x=>x.k===t.dataset.k); if(r.m===t.dataset.v) return; if(!permOk('a.settings')) return; snap(); r.m=t.dataset.v; const rr=rtCfg().rules.find(x=>x.k===r.k); if(rr) rr.mode=r.m; toast(`${r.when} → ${RT[r.to][1]}: ${{ask:'asks first',auto:'moves by itself',off:'stays put'}[r.m]}.`); rd(); }
  else if(a==='acc'){ if(!permOk('a.settings')){ t.checked=!t.checked; return; } snap(); U.acc=t.checked; rtCfg().needAccept=U.acc; toast(U.acc?'Hand-offs need accepting again.':'Hand-offs move without accepting.'); rd(); }
  else if(a==='person'){ U.person=t.dataset.k; U.kb=false; rd(); }
  else if(a==='psel'){ goKpi(t.dataset.k,t.dataset.t?{k:'tech',v:t.dataset.t}:null); }
  else if(a==='page'){ const k=t.dataset.k, pg=t.dataset.v, sf=staffOf(k); if(!sf||!permOk('a.people')) return; if(sf.id===viewAsId()){ toast('Someone else changes your own pages — on the Admin page.',false); return; } const v=!permHas(sf,'pages',pg); snap(); permSet(sf,'pages',pg,v); U._sd=null; toast(`${F(k)} ${v?'can open':'can’t open'} ${permPageLabel(pg)} now.`); rd(); }   /* Parsec 13 */
  else if(a==='tpin'){ const sf=staffOf(t.dataset.k); if(!sf||!permOk('a.people')) return; snap(); const pin=admResetPin(sf); U._sd=null; rd(); admPinShow(sf,pin,false); }
  else if(a==='offgo'){ const sf=staffOf(t.dataset.k); if(!sf||!permOk('a.people')) return; if(sf.id===viewAsId()){ toast('You can’t turn off your own sign-in.',false); return; } const off=t.dataset.v==='1'; snap(); admSetOff(sf,off); U.pop=null; U._sd=null; toast(off?`${F(t.dataset.k)} can’t sign in now — their punches, notes and ROs keep their name.`:`${F(t.dataset.k)} can sign in again.`); rd(); }
  else if(a==='alf'){ U.alf=t.dataset.v; rd(); }
  else if(a==='ro'){ const r=ROS.find(x=>x.id===t.dataset.no)||ROS.find(x=>x.no===t.dataset.no); if(r) PG.openRo(r.id); }   /* by id — the last 4 can repeat */
  else return onClick2(t,e);
}
function onChange(t){
  if(t.dataset.set){ if(!permOk('a.settings')){ rd(); return; } const S=PG.shop(), k=t.dataset.set, v=String(t.value||'').trim();   /* Parsec 13: “Change settings and automations” */
    if(k==='rate'){ const n=parseFloat(v.replace(/[$,\s]/g,'')); if(!(n>0)){ toast('Type the labor rate in dollars.',false); return; } snap(); STATE.laborRate=n; toast(`Labor rate: $${n} an hour.`); }
    else if(k==='perk'){ snap(); const was=S.payPer.kind; S.payPer.kind=v; if(v==='monthly'&&was!=='monthly') S.payPer.anchor=TODAY.slice(0,8)+'01'; else if(v!=='monthly'&&dOf(S.payPer.anchor).getDay()!==1){ const d=dOf(TODAY); S.payPer.anchor=addD(TODAY,-((d.getDay()+6)%7)); } toast(`Pay period: ${PG.perWord()} — ${PG.perLabel(PG.perStart(TODAY))} now.`); }
    else if(k==='pera'){ if(!/^\d{4}-\d\d-\d\d$/.test(v)){ toast('Pick a date.',false); return; } snap(); S.payPer.anchor=v; toast(`Pay periods run from ${fd(v)}.`); }
    else if(k==='ovh'){ const n=parseFloat(v.replace(/[$,\s]/g,'')); snap(); S.overhead=n>0?n:0; toast(n>0?`Overhead: ${usd0(n)} a month.`:'Overhead cleared.'); }
    else if(k==='apin'){ if(viewAsId()){ toast('Only the Admin changes the Admin PIN.',false); return; } if(!v) return; if(!pinValid(v)){ toast('The Admin PIN is 4 digits.',false); return; } snap(); adminPinSet(v); try{ audit('pin','Changed the Admin PIN'); }catch(e){} toast('Admin PIN set — Parsec keeps it scrambled.'); }
    U._sd=null; rd(); return; }
  if(t.dataset.pay){ const sf=staffOf(t.dataset.pay), v=parseFloat(String(t.value||'').replace(/[$,\s]/g,'')); if(!sf) return; if(!permOk('a.people')){ rd(); return; } snap(); const P=PG.shop().pay; if(v>0) P[sf.name]=v; else delete P[sf.name]; U._sd=null; toast(v>0?`${F(t.dataset.pay)}’s pay: $${v} an hour — only you and ${F(t.dataset.pay)} see it.`:`${F(t.dataset.pay)}’s pay cleared.`); rd(); return; }
  if(t.dataset.role){ const k=t.dataset.role, sf=staffOf(k); if(!sf) return; if(!permOk('a.people')){ rd(); return; } if(sf.id===viewAsId()){ toast('Someone else changes your own role — on the Admin page.',false); rd(); return; } snap(); permSetRole(sf,t.value); U._sd=null; toast(`${F(k)} is a ${t.value.toLowerCase()} now — the role’s pages and actions, and what was changed for ${F(k)}.`); rd(); }   /* Parsec 13 */
  if(t.dataset.pin){ const sf=staffOf(t.dataset.pin), v=String(t.value||'').trim(); if(!sf||!permOk('a.people')) return; if(!pinValid(v)){ toast('A PIN is 4 digits.',false); return; } snap(); pinSet(sf,v,false); try{ audit('pin','Set '+sf.name+'’s PIN'); }catch(e){} toast(`${F(t.dataset.pin)}’s PIN is set.`); rd(); }
  if(t.matches('[data-alw]')){ U.alw=t.value; rd(); }
  if(t.dataset.goal){ const v=parseInt(t.value,10); if(v>0&&v!==U.goals[t.dataset.goal]){ snap(); U.goals[t.dataset.goal]=v; toast(`${RT[t.dataset.goal][1]} hold goal: ${dur(v)}.`); rd(); } }
  if(t.dataset.pgg){ const v=parseFloat(t.value); if(v>0){ snap(); const M=mgSet(); M.pg[t.dataset.pgg]=Object.assign({},PGS()[t.dataset.pgg],M.pg[t.dataset.pgg]||{}); M.pg[t.dataset.pgg][t.dataset.k]=v; toast(`${F(t.dataset.pgg)}’s goal for ${KM[t.dataset.k].n}: ${v}${KM[t.dataset.k].u==='pct'?'%':' h a workday'} — they see it on Career.`); rd(); } }
}
function onInput(e){ const id=e.target.id, p=U.pop; if(id==='mq-rn'){ U.repn=e.target.value; return; }
  if(id==='mq-lq'){ U.q=e.target.value; const pos=e.target.selectionStart; const L=kRows(); if(L.length&&!L.some(k=>k.id===U.sel)){ U.sel=L[0].id; U.bf=null; U.bk=null; } rd(); const f=$('#mq-lq'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } }
  if(id==='mq-pq'&&p){ p.q=e.target.value; const pos=e.target.selectionStart; rd(); const f=$('#mq-pq'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } }
  if(id==='mq-tv'&&p) p.v=e.target.value; }
function move(d){ if(U.view==='fleet'){ const L=fleetRows().map(x=>x.c), i=L.indexOf(U.fleet); U.fleet=L[Math.max(0,Math.min(L.length-1,i+d))]; U.kb=true; rd(); return; } if(U.view==='team'){ const L=STAFF0.map(x=>x[0]); const i=L.indexOf(U.person); U.person=L[Math.max(0,Math.min(L.length-1,i+d))]; U.kb=true; rd(); return; }
  const L=Object.keys(CAT).flatMap(c=>kRows().filter(k=>k.c===c)).map(k=>k.id); if(!L.length) return; U.kb=true; U.view='kpi'; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.bf=null; U.bk=null; U.pop=null; rd(); }
function keydown(e){ const k=e.key, inF=PG.typing(e); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;rd();return stop();}
    if(k==='Enter'){ if(e.target.id==='mq-pq'){ $('.tg-pop .mq-srr')?.click(); return stop(); } $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(p.type==='per'&&!inF){ const i='dwmqy'.indexOf(k.toLowerCase()); if(i>=0){ U.p=['day','wk','mo','qt','yr'][i]; U.pop=null; U.bk=null; rd(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='/'){ psmOpen('manager'); return stop(); }   /* Parsec 13.1 — the search window */
  if(k==='p'&&U.view==='kpi'){ $('[data-a="pin"]')?.click(); return stop(); }
  if(k==='t'&&U.view==='kpi'){ const b=$('[data-a="pop"][data-p="tgt"]'); if(b) openPop('tgt',{k:U.sel},b); return stop(); }
  const pi='dwmqy'.indexOf(k); if(pi>=0){ U.p=['day','wk','mo','qt','yr'][pi]; U.bk=null; rd(); return stop(); }
  if(k>='1'&&k<='5'){ U.view=['ov','kpi','flow','team','act'][+k-1]; U.pop=null; rd(); return stop(); }
}
function after(){ PG.placePop(U);
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #mq-pq')||$('.tg-pop #mq-tv'); if(f){ U.pop._f=1; f.focus(); if(f.select) f.select(); } } }
