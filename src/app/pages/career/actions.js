/* Parsec · pages/career · actions.js
   Doing things on Career: pop-overs, clicks, the goal alerts sent to the Inbox.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   openPop onClick onChange keydown after newBest alertsFor change input fieldKey H (10 functions, 1 constant)
   state      cr
   uses       data/ pages/ pages/inbox/ pages/manager/ shell/ state/
*/
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); if(el) PG.anchor(U,el); rd(); }
function onClick(t,e){ const a=t.dataset.a; const wasHl=U.hl; U.hl=null;
  if(a==='view'){ U.view=t.dataset.v; U.pop=null; rd(); }
  else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; rd(); return; } openPop(t.dataset.p,{id:t.dataset.id},t); }
  else if(a==='popx'){ U.pop=null; rd(); }
  else if(a==='pset'){ U.p=t.dataset.v; U.pop=null; rd(); }
  else if(a==='sel'){ U.sel=t.dataset.ro; U.kb=false; rd(); }
  else if(a==='go'){ U.view='work'; U.sel=t.dataset.ro; U.kb=true; rd(); }
  else if(a==='fix'){ const c=CHKf().find(x=>x[0]===t.dataset.c); U.pop=null; if(c){ UI.tlDay=c[5]; UI.tlWho=PPL[U.who]; PG.go('timelog'); } }
  else if(a==='toast'){ toast(t.dataset.t); rd(); }
  else if(a==='cmp'){ U.cmp=t.dataset.v; rd(); }
  else if(a==='drv'){ U.drv=t.dataset.v; rd(); }
  else if(a==='al'){ if(!isSelf()){ toast('Only '+F(U.who)+' changes their alerts.'); return; } const k=t.dataset.k; snap(); U.al[k]=U.al[k]?0:1; CRS().al=U.al; toast(U.al[k]?'On.':'Off — nothing more about this.'); rd(); }
  else if(a==='pay'){ U.pay=!U.pay; rd(); }
  else if(a==='ack'){ const n=NTS().L.find(x=>x.id===t.dataset.id); if(!n) return; snap(); n.ack=nowIso(); try{ IB.send({to:n.by,k:'fyi',src:'career',t:F(U.who)+' saw your note',b:String(n.text).slice(0,160)}); }catch(err){} toast(fst(n.by)+' sees you got it.'); rd(); }
  else if(a==='ask'){ const to=FMP(); if(!to){ toast('No foreman or manager on the team yet.'); return; } try{ IB.send({to,k:'fyi',src:'career',t:`Quote check: ${t.dataset.n}`,b:`${PPL[U.who]} runs ${t.dataset.v} over the quote on average — ${t.dataset.c} jobs. Worth a word with the writers.`}); }catch(err){} toast(`Sent to ${fst(to)}: ${t.dataset.n} runs ${t.dataset.v} over the quote for you, on average — ${t.dataset.c} jobs.`); rd(); }
  else if(a==='stmt'){ U.stmt=U.stmt?null:'yr'; U.pop=null; rd(); }
  else if(a==='stmtp'){ U.stmt=t.dataset.v; rd(); }
  else if(a==='stmtx'){ U.stmt=null; rd(); }
  else if(a==='prior'){ snap(); U.usePrior=t.dataset.v==='1'; CRS().usePrior=U.usePrior; rd(); }
  else if(a==='psave'){ const o={}; $$('.cr-pf input').forEach(i=>{ const f=i.dataset.f, v=i.value.trim(); o[f]=f==='from'||f==='to'?v:(+v.replace(/[^\d.]/g,'')||0); }); snap(); U.prior[U.who]=o; U.usePrior=true; CRS().prior=o; CRS().usePrior=true; U.pop=null; U.hl='prior'; toast('Added — your totals show both, marked “by hand”.'); rd(); }
  else if(a==='pclr'){ snap(); const c=CRS(); c.prior=null; c.usePrior=false; U.prior[U.who]=null; U.usePrior=false; U.pop=null; toast('Earlier years taken off.'); rd(); }
  else if(a==='inbox'){ PG.go('inbox'); }
  else if(a==='ro'){ PG.openRo(t.dataset.id); }
  else if(a==='fxgo'){ PG.go('fixes'); }
  else if(a==='print'){ const el=$('.mq-sheet'); if(!el) return; el.classList.add('pg-printme'); document.documentElement.classList.add('pg-print2'); setTimeout(()=>{ try{ window.print(); } finally { el.classList.remove('pg-printme'); document.documentElement.classList.remove('pg-print2'); } },30); }
  else if(a==='nsave'){ const tx=(($('#cr-ntx')||{}).value||'').trim(); if(!tx){ toast('Type the note first.'); return; } const tag=($('#cr-ntag')||{}).value||'Note', me=PG.me().name; snap(); NTS().L.push({id:uid('cn'),at:nowIso(),by:me,text:tx,tag,ack:null}); try{ IB.send({to:PPL[U.who],k:'fyi',src:'career',t:`A note from ${fst(me)} — ${tag.toLowerCase()}`,b:tx.slice(0,200)}); }catch(err){} U.pop=null; toast(`Sent — ${F(U.who)} sees it on Career.`); rd(); }
  else if(a==='gsave'){ const k=($('#cr-gk')||{}).value, v=parseFloat((($('#cr-gt')||{}).value||'').replace(/[%h\s]/g,'')), due=($('#cr-gd')||{}).value; if(!KM[k]||!(v>0)||!/^\d{4}-\d\d-\d\d$/.test(due||'')){ toast('Pick the number, a target and a date.'); return; } snap(); NTS().goal={k,t:v,due,set:TODAY,by:PG.me().name}; try{ IB.send({to:PPL[U.who],k:'fyi',src:'career',t:`New goal: ${KM[k].n} ${KM[k].tw!=null?v+' h a workday':KM[k].u==='pct'?v+'%':v} by ${fd(due)}`,b:'From '+PG.me().name+' — it’s on your Career page.'}); }catch(err){} U.pop=null; toast('Goal set — it sits on top of the notes.'); rd(); }
  else if(a==='gclr'){ snap(); NTS().goal=null; U.pop=null; toast('Goal taken off.'); rd(); }
  else if(a==='rsend'){ const tx=(($('#cr-rtx')||{}).value||'').trim(); if(!tx){ toast('Type the reply first.'); return; } const n=NTS().L.find(x=>x.id===t.dataset.id), to=n?n.by:FMP(); if(!to){ toast('No one to send it to.'); return; } try{ IB.send({to,k:'fyi',src:'career',t:`${F(U.who)} replied to your note`,b:tx.slice(0,300)}); }catch(err){} if(n&&!n.ack){ snap(); n.ack=nowIso(); } U.pop=null; toast(`Sent to ${fst(to)}.`); rd(); }
  else if(a==='ssave'){ const nm=(($('#cr-sn')||{}).value||'').trim(), ex=($('#cr-se')||{}).value||'', pc=parseInt((($('#cr-sp')||{}).value||'').replace(/\D/g,''),10), nx=(($('#cr-sx')||{}).value||'').trim(); if(!nm&&!nx){ toast('Type the name first.'); return; } snap(); const S=CRS(); if(nm) S.skills.push({id:uid('sk'),name:nm,exp:/^\d{4}-\d\d-\d\d$/.test(ex)?ex:'',prog:pc>0&&pc<100,pct:pc>0&&pc<100?pc:0}); S.next=nx?{name:nx}:null; U.pop=null; toast(nm?'Added.':'Saved.'); rd(); }
  else if(a==='sdel'){ const S=CRS(); snap(); S.skills=S.skills.filter(x=>x.id!==t.dataset.id); toast('Taken off.'); rd(); }
  else if(a==='retest'){ const x=CRS().skills.find(y=>y.id===t.dataset.id), to=FMP(); if(!x||!to){ toast('No foreman or manager on the team yet.'); return; } try{ IB.send({to,k:'ask',src:'career',t:`${F(U.who)} needs a retest: ${x.name}`,b:x.exp?'Expires '+fd(x.exp)+', '+x.exp.slice(0,4)+'.':''}); }catch(err){} toast(`Asked ${fst(to)}.`); rd(); }
  else if(a==='mgteam'){ if(typeof MG!=='undefined'){ MG.U().view='team'; MG.U().person=U.who; } PG.go('manager'); }
  else if(wasHl) rd();
}
function onChange(t){ if(t.dataset.who){ const v=t.value; if(canPick()&&TECHS.includes(v)){ const p=U.p, vw=U.view, me=U._me; reset(); U._me=me; U.who=v; U.p=p; U.view=vw; rd(); } } }
function keydown(e){ const k=e.key; if(e.ctrlKey||e.metaKey||e.altKey||PG.typing(e)) return; const stop=()=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();};
  if(U.pop){ if(k==='Escape'){ U.pop=null; rd(); return stop(); } if(U.pop.type==='per'){ const i='dwmqya'.indexOf(k); if(i>=0){ U.p=['day','wk','mo','qt','yr','all'][i]; U.pop=null; rd(); return stop(); } } return; }
  if(U.stmt){ if(k==='Escape'){ U.stmt=null; rd(); return stop(); } return; }
  if((k==='j'||k==='k')&&U.view==='work'){ const L=wFlat(), i=L.findIndex(x=>x.r.id===U.sel); const n=L[Math.max(0,Math.min(L.length-1,i+(k==='j'?1:-1)))]; if(n){ U.sel=n.r.id; U.kb=true; rd(); } return stop(); }
  const i='dwmqya'.indexOf(k); if(i>=0&&U.view!=='grow'){ U.p=['day','wk','mo','qt','yr','all'][i]; rd(); return stop(); }
  if(k==='c'&&U.view==='ov'&&yrSeg()){ U.cmp=U.cmp==='yr'?'prev':'yr'; rd(); return stop(); }
  if(k==='1'||k==='2'||k==='3'){ U.view=['ov','work','grow'][+k-1]; rd(); return stop(); }
}
function after(){ PG.placePop(U);
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop textarea')||$('.tg-pop input:not([type=date])'); if(f){ U.pop._f=1; f.focus(); } } }


/* ---------- the alerts on the goals card, as Inbox items for the tech ---------- */
function newBest(k){ const F_={k:'tech',v:k}, s0=TSTART[k]||START, W_=[]; for(let a=wStart(s0);a<=TODAY;a=addD(a,7)){ const b=minK(addD(a,6),TODAY), O=ctx(a,b,F_).ops, q=sum(O,o=>o.q), bb=sum(O,o=>o.b); W_.push({a,q,e:bb?q/bb*100:null}); }
  const cur=W_.pop(), ok=W_.filter(w=>w.q>=20&&w.e!=null); if(!cur||cur.q<20||cur.e==null||ok.length<3) return null; const best=Math.max(...ok.map(w=>w.e)); return cur.e>best?{cur,best}:null; }
function alertsFor(me){ const S=STATE.cr&&STATE.cr[me], al=S&&S.al?S.al:{pace:1,fri:1,best:0}; if(!al.pace&&!al.fri&&!al.best) return []; data(); const k=SD.keyOf(me); if(!TECHS.includes(k)) return [];
  const F_={k:'tech',v:k}, g=GL(k), L=[], at=(d,h)=>{ const x=dOf(d); x.setHours(h,0,0,0); return x.toISOString(); };
  if(al.pace){ const a=mStart(TODAY), X=ctx(a,TODAY,F_), v=val(KM.sold,a,TODAY,F_)||0, behind=g.sold*X.wd-v; if(behind>.5&&X.wd>=2) L.push({key:'crp:'+TODAY, from:'Parsec', k:'rem', src:'career', at:at(TODAY,7), t:`You’re ${Math.round(behind)} h behind pace on hours sold for ${mName(TODAY)}`, b:`${h1(v)} h sold so far — your goal is ${g.sold} h a workday.`, acts:[['Open Career','page']]}); }
  if(al.fri){ const dw=dOf(TODAY).getDay(); if((dw===5&&new Date().getHours()>=16)||dw===6||dw===0){ const fr=dw===5?TODAY:addD(TODAY,dw===6?-1:-2), a=addD(fr,-4), O=ctx(a,fr,F_).ops, q=sum(O,o=>o.q), b=sum(O,o=>o.b); if(O.length) L.push({key:'crf:'+fr, from:'Parsec', k:'fyi', src:'career', at:at(fr,16), t:`Your week: ${h1(q)} h sold · ${b?Math.round(q/b*100)+'%':'—'} efficiency`, b:`${O.length} operation${O.length===1?'':'s'} closed, ${fd(a)} – ${fd(fr)}.`, acts:[['Open Career','page']]}); } }
  if(al.best){ const nb=newBest(k); if(nb) L.push({key:'crb:'+nb.cur.a, from:'Parsec', k:'fyi', src:'career', at:at(TODAY,7), t:`New best week: ${Math.round(nb.cur.e)}% efficiency`, b:`Your best before was ${Math.round(nb.best)}%.`, acts:[['Open Career','page']]}); }
  return L; }

  reset();
  const H = new Proxy({}, { get: (o, a) => (t, e) => { DIRTY = false; const r = onClick(t, e); if(DIRTY){ scheduleSave(true); DIRTY = false; } return r; } });
  function change(t){ onChange(t); }
  function input(t, e){}
  function fieldKey(t, ev){ if(ev.key === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } ev.preventDefault(); return true; }
    if(ev.key === 'Enter' && U.pop && t.tagName !== 'TEXTAREA'){ ev.preventDefault(); const b = $('.tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    if(ev.key === 'Enter' && U.pop && t.tagName === 'TEXTAREA' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); const b = $('.tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    return false; }
  PG.reg('career', { H, U: () => U, input, change, fieldKey, keydown, after });
  if(typeof IB !== 'undefined') IB.DERIVE.push(me => alertsFor(me));
  return { view, U: () => U, alertsFor };
