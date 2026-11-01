/* ---------- flow: who holds what ---------- */
const dur=m=>m<60?m+' min':m<1440?Math.floor(m/60)+' h'+(m%60?' '+(m%60)+' min':''):Math.floor(m/1440)+' d '+Math.floor(m%1440/60)+' h';
function vFlow(){ const sel=U.flow, keys=Object.keys(RT);
  const cards=keys.map(k=>{ const L=HOLD.filter(x=>x.to===k), inc=L.filter(x=>x.pend).length, hold=L.length-inc, av=L.length?Math.round(sum(L,x=>x.min)/L.length):0, g=U.goals[k], ov=L.filter(x=>x.min>g).length;
    return `<button class="mg-fc${sel===k?' on':''}" data-a="flow" data-k="${k}"><span class="h"><span class="tg-av" style="background:${RT[k][2]};color:#fff">${RT[k][0]}</span>${RT[k][1]}</span><span class="nn"><span><b>${hold}</b>holding</span><span><b>${inc}</b>to accept</span></span><span class="mt${av>g?' over':''}"><i style="width:${Math.min(100,av/g*100).toFixed(0)}%"></i></span><span class="g${av>g?' over':''}">avg <b>${L.length?dur(av):'—'}</b> · goal ${dur(g)}</span>${ov?`<span class="mg-pv w">${ic('flag',11)}${ov} over goal</span>`:'<span class="mg-pv ok">'+ic('check',11)+'all inside goal</span>'}</button>`; }).join('');
  const L=HOLD.filter(x=>x.to===sel).sort((p,q)=>q.min-p.min);
  return `<div class="mg-full"><div class="mg-sec">Transfers — who holds what<span>ROs open now · the hold goals are yours to set</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="sel" data-k="days" data-go="1">${ic('chart',13)}Average days open</button></div><div class="mg-fcs">${cards}</div>
    <div class="mg-fcols" style="margin-top:12px"><div class="mg-card"><div class="mg-ch"><b>With ${RT[sel][1]}</b><small>${L.length} · longest first</small></div><div class="mg-cb">${L.length?L.slice(0,8).map(x=>{ const ov=!x.pend&&x.min>U.goals[sel]; return `<div class="mg-hr" data-a="ro" data-no="${x.r.no}"><span class="c"><b><span class="tg-no">${x.r.no}</span> ${esc(x.r.cust)}</b><small>${x.pend?'waiting to be accepted':x.r.status}${sel==='tech'?' · '+PPL[x.r.tech]:''}</small></span>${ov?`<span class="mg-pv w">${ic('flag',11)}over goal</span>`:x.pend&&x.pm>U.acc*15?'<span class="mg-pv w">late to accept</span>':'<span></span>'}<span class="m${ov?' over':''}">${dur(x.pend?x.pm:x.min)}</span></div>`; }).join(''):`<div class="mg-none">Nothing with ${RT[sel][1]} right now.</div>`}${L.length>8?`<div class="mg-more"><span>Showing 8 of ${L.length}</span></div>`:''}</div></div>
    <div class="mg-card"><div class="mg-ch"><b>Stage rules</b><small>when a stage is done, where the RO goes</small></div><div class="mg-cb" style="padding-top:2px">${U.rules.map(r=>`<div class="mg-rr"><b style="font-weight:500">${r.when}</b><span class="to"><span class="tg-av" style="background:${RT[r.to][2]};color:#fff">${RT[r.to][0]}</span>${r.k==='approval'?'Parts, or Foreman':RT[r.to][1]}</span><span class="tg-seg3">${[['ask','Ask first'],['auto','Automatic'],['off','Off']].map(m=>`<button class="${r.m===m[0]?'on':''}" data-a="rule" data-k="${r.k}" data-v="${m[0]}">${m[1]}</button>`).join('')}</span></div>`).join('')}
      <div class="mg-gl">${keys.map(k=>`<label><span><span class="tg-av" style="width:16px;height:16px;font-size:8px;background:${RT[k][2]};color:#fff">${RT[k][0]}</span>${RT[k][1]} hold goal</span><input data-goal="${k}" value="${U.goals[k]}" inputmode="numeric"></label>`).join('')}</div>
      <label class="tg-ck" style="display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12.5px;color:var(--tg-ink2)"><input type="checkbox" data-a="acc" ${U.acc?'checked':''}>Hand-offs must be accepted before the RO moves · within 15 min</label></div></div></div></div>`; }
/* ---------- team ---------- */
const pRole=k=>U.roles[k];
function pList(){ const D=[...new Set(STAFF0.map(([,r])=>DEPT[r]))]; const [a,b]=W();
  const item=([k])=>{ const r=pRole(k), on=k===U.person, kk=KM[ROLEK[r]?ROLEK[r][0]:'eff'], FF=r==='Technician'?{k:'tech',v:k}:null, v=val(kk,a,b,FF), t=tgt(kk,ctx(a,b,FF)), off=t!=null&&v!=null&&(kk.d>=0?v<t:v>t);
    return `<div class="tg-it mg-pi${on?' on':''}${on&&U.kb?' kb':''}" data-a="person" data-k="${k}"><span class="tg-av">${k}</span><span class="tg-t"><b>${PPL[k]}</b></span><span class="tg-w">${r}${k==='RH'?' · you':''}</span><span class="m${off?' off':''}">${fmt(kk.u,v)}<small>${kk.n.toLowerCase()}</small></span></div>`; };
  return `<section class="tg-list"><div class="tg-lh">Team<span class="n">${STAFF0.length}</span><span class="sp" style="flex:1"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Add an employee — name, role and PIN; the role fills in the pages they can open.">${ic('plus',13)}Add</button></div><div class="tg-scroll">${D.map(d=>{ const X=STAFF0.filter(([,r])=>DEPT[r]===d); return `<div class="tg-grp">${d}<span>${X.length}</span></div>`+X.map(item).join(''); }).join('')}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('1')}–${kbd('5')}views</span><span class="sp"></span><span>${PER[U.p][0]}</span></div></section>`; }
function vTeam(){ const k=U.person, r=pRole(k), tech=r==='Technician', FF=tech?{k:'tech',v:k}:null, KS=(ROLEK[r]||ROLEK.Manager).map(id=>KM[id]);
  return `<div class="mg-pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic('user',13)}${DEPT[r]}</span><span>${k==='RH'?'This is you':'Last signed in today, '+(7+STAFF0.findIndex(x=>x[0]===k)%3)+':'+p2(10+STAFF0.findIndex(x=>x[0]===k)*4%50)}</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Parsec now shows what ${F(k)} sees — switch back to Admin any time from Settings.">${ic('eye',14)}See Parsec as ${F(k)}</button></div>
    <div class="mg-ph"><span class="av">${k}</span><span class="c"><h2 style="margin:0;font:500 24px/30px var(--tg-serif);letter-spacing:-.01em">${PPL[k]}</h2><small>${r} · ${(U.pages[k]?Object.keys(U.pages[k]).filter(p=>U.pages[k][p]).length:0)} pages · signs in with a PIN</small></span></div></div>
   <div class="mg-pad"><div class="mg-sec" style="margin:0 2px">${tech?'Their numbers':'The numbers they move'}<span>${PER[U.p][0]} · ${tech?'only '+F(k)+'’s work':'the whole shop'}</span></div><div class="mg-sc">${KS.map(kk=>{ const o=kv(kk,FF); return `<button class="mg-tile" data-a="psel" data-k="${kk.id}" data-t="${tech?k:''}" data-tip="${esc(kk.n)}|${esc(kk.how)}|~Opens in KPIs${tech?', filtered to '+F(k):''}"><span class="l"><span>${kk.n}</span>${kk.snap?'<span class="now">right now</span>':''}</span><span class="v">${fmt(kk.u,o.v)}</span>${sparkSvg(kk,76,28,FF)}<span class="r"><span class="mg-d ${o.dl.cl}">${o.dl.s}</span><span class="sp"></span>${o.t!=null&&!(tech&&kk.tw!=null)?(o.ok?`<span class="mg-tgt ok">${ic('check',11)}target ${fmt(kk.u,o.t)}</span>`:`<span class="mg-tgt off">${ic('flag',11)}target ${fmt(kk.u,o.t)}</span>`):''}</span></button>`; }).join('')}</div>
    <div class="mg-card"><div class="mg-ch"><b>Pages they can open</b><small>the ${r.toLowerCase()} role fills these in — change any of them</small></div><div class="mg-cb"><div class="mg-pages">${NAV.map(([p,n])=>{ const on=U.pages[k]&&U.pages[k][p]; return `<button class="mg-pg${on?' on':''}" data-a="page" data-k="${k}" data-v="${p}">${ic(NAVIC[p]||p,15)}${n}<span class="ck">${on?ic('check',11):''}</span></button>`; }).join('')}</div></div></div>
    <div class="mg-card"><div class="mg-ch"><b>Details</b></div><div class="mg-cb"><div class="mg-form"><label>Name<input value="${esc(PPL[k])}"></label><label>Role<select data-role="${k}">${Object.keys(ROLES).map(x=>`<option${x===r?' selected':''}>${x}</option>`).join('')}</select></label><label>PIN<input type="password" value="1234" autocomplete="new-password"></label></div></div></div></div></div>`; }
/* ---------- activity ---------- */
function vAct(){ const T=[['all','All'],['status','Status'],['handoff','Hand-offs'],['release','Releases'],['checkin','Check-ins'],['estimate','Estimates'],['signin','Sign-ins'],['staff','Staff'],['delete','Deletes']];
  const L=AL0.filter(x=>(U.alf==='all'||x.ty===U.alf)&&(!U.alw||x.by===U.alw)); const days=[...new Set(L.map(x=>x.day))];
  const row=x=>`<div class="mg-al"><time>${p2(Math.floor(x.m/60))}:${p2(x.m%60)}</time><span class="gi">${ic(x.ic,13)}</span><span class="who"><span class="tg-av">${x.by}</span>${PPL[x.by]}</span><span class="x">${x.verb} ${x.ro?`<span class="tg-no">${x.ro}</span>${esc(x.cust)}`:''}${x.text?(x.ro?' — ':'')+esc(x.text):''}</span>${x.ro?`<button class="btn btn-sm tg-gh" data-a="ro" data-no="${x.ro}">Open</button>`:'<span></span>'}</div>`;
  return `<div class="mg-full"><div class="mg-alf">${T.map(t=>`<button class="tg-chip${U.alf===t[0]?' on':''}" data-a="alf" data-v="${t[0]}" style="height:28px">${t[1]}</button>`).join('')}<span class="sp"></span><select data-alw style="height:30px"><option value="">Everyone</option>${STAFF0.map(([k])=>`<option value="${k}"${U.alw===k?' selected':''}>${PPL[k]}</option>`).join('')}</select><button class="btn btn-sm" data-a="toast" data-t="Downloaded — the activity log as CSV (last 3,000 lines).">${ic('download',14)}CSV</button></div>
    <div class="mg-card"><div class="mg-cb" style="padding-top:0">${days.map(d=>`<div class="mg-day">${d===TODAY?'Today':'Yesterday'} · ${fd(d)}</div>`+L.filter(x=>x.day===d).map(row).join('')).join('')||'<div class="mg-none">Nothing matches.</div>'}</div></div></div>`; }

/* ---------- popovers ---------- */
function pop(){ const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  if(p.type==='per') return `<div class="tg-pop menu mg-pop-m">${Object.keys(PER).map((x,i)=>`<button class="tg-mi${U.p===x?' on':''}" data-a="pset" data-v="${x}">${kbd('DWMQ'[i])}${PER[x][0]}<span class="meta">${PER[x][1]}</span></button>`).join('')}<div class="tg-pft">${ic('info',12)}Every number, chart and list follows the period.</div></div>`;
  if(p.type==='tgt'){ const k=KM[p.k], [a,b]=W(), X=ctx(a,b), o=kv(k), base=tgtBase(k), per=k.tw!=null;
    const qs=k.u==='pct'?(base!=null&&base<=10?[2,3,4,5]:[base-10,base-5,base,base+5].filter(v=>v>0&&v<=100).map(Math.round)):per?[base*.9,base,base*1.1].map(v=>k.u==='usd'?Math.round(v/500)*500:Math.round(v*2)/2):null;
    return `<div class="tg-pop xf mg-pop-w">${hd('Target',esc(k.n))}<div class="mg-ctx">${k.d>0?'Higher is better':k.d<0?'Lower is better':'Neither way is better'}. ${PER[U.p][0]}: <b>${fmt(k.u,o.v,1)}</b>.${per?` A sum, so the target is <b>per workday</b> — ${PER[U.p][0].toLowerCase()} has ${h1(X.wd)} workdays (Saturday counts half).`:''}</div>
      <label class="mg-f"><span>${per?'Per workday':'Target'}</span><span class="row"><input id="mg-tv" value="${esc(p.v!=null?p.v:base!=null?(k.u==='usd'?Math.round(base):k.u==='pct'?Math.round(base):h1(base)):'')}" inputmode="decimal" placeholder="${k.u==='pct'?'85':'—'}"><span class="u">${k.u==='pct'?'%':k.u==='usd'?'dollars':k.u==='d'?'days':k.u==='n'?'ROs':'hours'}</span></span></label>
      ${qs?`<div class="mg-qs">${qs.map(v=>`<button class="tg-chip" data-a="tq" data-v="${v}" style="height:24px">${fmt(k.u,v)}</button>`).join('')}</div>`:''}
      <div class="tg-acts">${base!=null?'<button class="btn btn-sm tg-gh" data-a="tclr">No target</button>':''}<span class="hint">Tiles, the chart and the breakdown mark it</span><button class="btn btn-sm btn-primary" data-a="tsave">Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='add'||p.type==='find'){ const q=(p.q||'').trim().toLowerCase(); let L=K.filter(k=>p.type==='find'||!U.pins.includes(k.id)); if(q) L=L.filter(k=>(k.n+' '+CAT[k.c][0]+' '+k.how).toLowerCase().includes(q));
    return `<div class="tg-pop menu mg-pop-w"><div class="mg-srin" style="margin:2px 2px 6px">${ic('search',14)}<input id="mg-pq" placeholder="${p.type==='add'?'Add a tile — find a KPI':'Find a KPI'}" value="${esc(p.q||'')}" autocomplete="off"></div><div style="max-height:420px;overflow:auto">${L.slice(0,40).map((k,i)=>{ const o=kv(k); return `<button class="mg-srr${i===0?' k':''}" data-a="${p.type==='add'?'addk':'sel'}" data-k="${k.id}" data-go="1"><b>${k.n}${U.pins.includes(k.id)&&p.type==='find'?` <span class="pn">${ic('pin',11)}</span>`:''}</b><span class="m">${fmt(k.u,o.v)}</span><small>${CAT[k.c][0]} · ${esc(k.how)}</small></button>`; }).join('')||'<div class="mg-none">No KPI matches.</div>'}</div></div>`; }
  return ''; }

/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
function goKpi(id,F){ U.sel=id; U.view='kpi'; U.bf=F||null; U.bk=null; U.pop=null; U.kb=false; if(U.lf!=='all'&&!kRows().some(k=>k.id===id)) U.lf='all'; render(); const it=$('.tg-scroll .tg-it.on'), sc=$('.tg-scroll'); if(it&&sc) sc.scrollTop=it.offsetTop-120; }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='noop') return;
  if(a==='sel'){ if(t.dataset.go||U.view!=='kpi'){ goKpi(t.dataset.k); return; } U.sel=t.dataset.k; U.bf=null; U.bk=null; U.kb=false; U.pop=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p){ U.pop=null; render(); return; } const ex={}; if(t.dataset.k) ex.k=t.dataset.k; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='pset'){ U.p=t.dataset.v; U.bk=null; U.pop=null; render(); }
  else if(a==='pin'){ const id=t.dataset.k; snap(); if(U.pins.includes(id)){ U.pins=U.pins.filter(x=>x!==id); toast(`${KM[id].n} is off the Overview.`); } else { U.pins.push(id); toast(`${KM[id].n} pinned to the Overview.`); } render(); }
  else if(a==='tq'){ p.v=t.dataset.v; render(); }
  else if(a==='tsave'){ const k=KM[p.k], v=parseFloat((($('#mg-tv')||{}).value||'').replace(/[$,%]/g,'')); if(!(v>=0)){ toast('Type a number.',false); render(); return; } snap(); U.tg[k.id]=v; U.pop=null; toast(`Target for ${k.n}: ${fmt(k.u,v)}${k.tw!=null?' per workday':''}.`); render(); }
  else if(a==='tclr'){ const k=KM[p.k]; snap(); U.tg[k.id]=null; U.pop=null; toast(`${k.n} has no target now.`); render(); }
  else if(a==='brk'){ U.brk[U.sel]=t.dataset.v; render(); }
  else if(a==='bf'){ const f=t.dataset.f, v=t.dataset.v; U.bf=U.bf&&U.bf.k===f&&U.bf.v===v?null:{k:f,v}; U.bk=null; render(); }
  else if(a==='bfx'){ U.bf=null; render(); }
  else if(a==='bk'){ const i=+t.dataset.i; U.bk=U.bk===i?null:i; render(); }
  else if(a==='bkx'){ U.bk=null; render(); }
  else if(a==='lf'){ U.lf=t.dataset.v; const L=kRows(); if(L.length&&!L.some(k=>k.id===U.sel)){ U.sel=L[0].id; U.bf=null; U.bk=null; } render(); }
  else if(a==='nd'){ const n=NEEDS0.find(x=>x.id===t.dataset.id), x=n.a[+t.dataset.i];
    if(x[1]==='go:cb'){ toast('In Parsec this opens RO 37795 — Fixes links it to the first fix on 37482.',false); render(); return; }
    if(x[1]==='go:flow'){ U.view='flow'; U.flow='parts'; render(); return; }
    snap(); if(x[1]==='ok'||x[0]==='Decline'||x[0]==='Ask Grace') U.needs=U.needs.filter(id=>id!==n.id); toast(x[2]); render(); }
  else if(a==='nall'){ U.nall=!U.nall; render(); }
  else if(a==='ed'){ U.ed=!U.ed; U.pop=null; render(); }
  else if(a==='tx'){ e.stopPropagation(); const id=t.dataset.k; snap(); U.pins=U.pins.filter(x=>x!==id); toast(`${KM[id].n} is off the Overview.`); render(); }
  else if(a==='addk'){ const id=t.dataset.k; snap(); U.pins.push(id); U.pop=null; toast(`${KM[id].n} added to the Overview.`); render(); }
  else if(a==='flow'){ U.flow=t.dataset.k; render(); }
  else if(a==='rule'){ const r=U.rules.find(x=>x.k===t.dataset.k); if(r.m===t.dataset.v) return; snap(); r.m=t.dataset.v; toast(`${r.when} → ${RT[r.to][1]}: ${{ask:'asks first',auto:'moves by itself',off:'stays put'}[r.m]}.`); render(); }
  else if(a==='acc'){ snap(); U.acc=t.checked; toast(U.acc?'Hand-offs need accepting again.':'Hand-offs move without accepting.'); render(); }
  else if(a==='person'){ U.person=t.dataset.k; U.kb=false; render(); }
  else if(a==='psel'){ goKpi(t.dataset.k,t.dataset.t?{k:'tech',v:t.dataset.t}:null); }
  else if(a==='page'){ const k=t.dataset.k, pg=t.dataset.v; snap(); U.pages[k][pg]=U.pages[k][pg]?0:1; toast(`${F(k)} ${U.pages[k][pg]?'can open':'can’t open'} ${NAV.find(x=>x[0]===pg)[1]} now.`); render(); }
  else if(a==='alf'){ U.alf=t.dataset.v; render(); }
  else if(a==='ro'){ toast(`In Parsec this opens RO ${t.dataset.no}.`,false); render(); }
  else if(a==='undo'){ if(UNDO.length){ Object.assign(U,JSON.parse(UNDO.pop())); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('change',e=>{ const t=e.target;
  if(t.dataset.role){ const k=t.dataset.role; snap(); U.roles[k]=t.value; U.pages[k]=Object.fromEntries(ROLES[t.value].map(p=>[p,1])); toast(`${F(k)} is a ${t.value.toLowerCase()} now — the pages follow the role.`); render(); }
  if(t.matches('[data-alw]')){ U.alw=t.value; render(); }
  if(t.dataset.goal){ const v=parseInt(t.value,10); if(v>0&&v!==U.goals[t.dataset.goal]){ snap(); U.goals[t.dataset.goal]=v; toast(`${RT[t.dataset.goal][1]} hold goal: ${dur(v)}.`); render(); } } });
mock.addEventListener('input',e=>{ const id=e.target.id, p=U.pop;
  if(id==='mg-lq'){ U.q=e.target.value; const pos=e.target.selectionStart; const L=kRows(); if(L.length&&!L.some(k=>k.id===U.sel)){ U.sel=L[0].id; U.bf=null; U.bk=null; } render(); const f=$('#mg-lq'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } }
  if(id==='mg-pq'&&p){ p.q=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#mg-pq'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } }
  if(id==='mg-tv'&&p) p.v=e.target.value; });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.mg').getBoundingClientRect(), P_=h.dataset.tip.split('|');
  tip.innerHTML=`<b>${esc(P_[0])}</b>`+P_.slice(1).map(x=>x.startsWith('~')?`<small style="margin-top:3px">${esc(x.slice(1))}</small>`:x.includes('::')?`<span class="rw"><i class="${/before/.test(x)?'pv':/Unapplied/.test(x)?'un':''}"${/Target|clock/.test(x)?' style="background:none;border-top:1.5px dashed var(--tg-ink3);height:0;border-radius:0"':''}></i>${esc(x.split('::')[0])}<b>${esc(x.split('::')[1])}</b></span>`:`<small>${esc(x)}</small>`).join('');
  tip.hidden=false; const W_=tk.width/scale, x=(e.clientX-tk.left)/scale+14; tip.style.left=Math.min(x,W_-tip.offsetWidth-12)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"]')){ U.pop=null; render(); } },true);
function move(d){ if(U.view==='team'){ const L=STAFF0.map(x=>x[0]); const i=L.indexOf(U.person); U.person=L[Math.max(0,Math.min(L.length-1,i+d))]; U.kb=true; render(); return; }
  const L=Object.keys(CAT).flatMap(c=>kRows().filter(k=>k.c===c)).map(k=>k.id); if(!L.length) return; U.kb=true; U.view='kpi'; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.bf=null; U.bk=null; U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea,select'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'){ if(e.target.id==='mg-pq'){ $('.tg-pop .mg-srr')?.click(); return stop(); } $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(p.type==='per'&&!inF){ const i='dwmq'.indexOf(k.toLowerCase()); if(i>=0){ U.p=['day','w','m','q'][i]; U.pop=null; U.bk=null; render(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='/'){ const b=$('[data-a="pop"][data-p="find"]'); if(b) openPop('find',{},b); return stop(); }
  if(k==='p'&&U.view==='kpi'){ $('[data-a="pin"]')?.click(); return stop(); }
  if(k==='t'&&U.view==='kpi'){ const b=$('[data-a="pop"][data-p="tgt"]'); if(b) openPop('tgt',{k:U.sel},b); return stop(); }
  const pi='dwmq'.indexOf(k); if(pi>=0){ U.p=['day','w','m','q'][pi]; U.bk=null; render(); return stop(); }
  if(k>='1'&&k<='5'){ U.view=['ov','kpi','flow','team','act'][+k-1]; U.pop=null; render(); return stop(); }
});
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W_=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); } else { x=W_-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W_-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #mg-pq')||$('.tg-pop #mg-tv'); if(f){ U.pop._f=1; f.focus(); if(f.select) f.select(); } }
}
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  ov:()=>{reset();render();},
  kpi:()=>{reset();goKpi('eff');},
  tech:()=>{reset();goKpi('eff',{k:'tech',v:'AW'});},
  day:()=>{reset();U.p='m';goKpi('sales');U.bk=buckets('m').length-4;render();},
  tgt:()=>{reset();goKpi('cb');const b=$('[data-a="pop"][data-p="tgt"]');openPop('tgt',{k:'cb'},b);},
  edit:()=>{reset();U.ed=true;render();const b=$('[data-a="pop"][data-p="add"]');openPop('add',{},b);},
  flow:()=>{reset();U.view='flow';render();},
  team:()=>{reset();U.view='team';U.person='AW';render();},
  act:()=>{reset();U.view='act';render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__mg={U:()=>U,render,reset,openPop,DEMO,K,KM,kv,val,ctx,ROS,goKpi};
reset(); render();
