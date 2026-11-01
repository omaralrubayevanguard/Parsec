/* ---------- state ---------- */
let S,U,UNDO,TOAST,TT,RENDERING=false;
const SET0={parts:'push',triage:'push',foreman:'push',warranty:'inbox',fixes:'inbox',manager:'inbox',timelog:'push',console:'push',career:'inbox',ros:'inbox'};
function reset(who){ S={N:JSON.parse(JSON.stringify(IB0)).map(n=>Object.assign({st:'new',sent:[]},n))}; U={who:who||'FD',view:'in',lf:'all',sel:null,pop:null,kb:false,pick:null,reply:'',set:Object.assign({},SET0),quiet:true}; UNDO=[]; TOAST=null; U.sel=null; const f=flat()[0]; if(f) select(f.id); }
const snap=()=>{ UNDO.push(JSON.stringify({N:S.N,sel:U.sel})); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const mine=()=>S.N.filter(n=>n.to===U.who);
const live=n=>n.st==='new'||n.st==='read';
const actionable=n=>n.k==='ask'||n.k==='men';
function inView(){ const L=mine().filter(n=>U.view==='in'?live(n):U.view==='snz'?n.st==='snz':n.st==='done'); return U.view==='in'&&U.lf==='un'?L.filter(n=>n.st==='new'):U.view==='in'&&U.lf==='ask'?L.filter(actionable):L; }
function groups(){ const L=inView().slice().sort(order); if(U.view!=='in') return [[U.view==='snz'?'Snoozed':'Done',L]];
  const A=L.filter(actionable), R=L.filter(n=>!actionable(n));
  return [['Needs you',A],['Today',R.filter(n=>n.d===0)],['Yesterday',R.filter(n=>n.d===1)],['Earlier this week',R.filter(n=>n.d>1)]].filter(g=>g[1].length); }
const flat=()=>groups().flatMap(g=>g[1]);
const cur=()=>S.N.find(n=>n.id===U.sel);
const roNo=k=>k?k.replace(/b$/,''):'';
const counts=()=>{ const M=mine(); return {ask:M.filter(n=>live(n)&&actionable(n)).length,un:M.filter(n=>n.st==='new').length,snz:M.filter(n=>n.st==='snz').length,done:M.filter(n=>n.st==='done').length,inb:M.filter(live).length}; };

/* ---------- drawing ---------- */
function render(){ if(RENDERING) return; RENDERING=true; try{ draw(); } finally{ RENDERING=false; } }
function draw(){ const c=counts();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='inbox'?'is-on':''}">${ic(k,18)}${k==='inbox'&&c.un?`<span class="rl-badge">${c.un}</span>`:''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg ib">${head(c)}<div class="tg-body">${list(c)}<div class="tg-main">${detail()}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after(); }
function head(c){ const vs=[['in','inbox','Inbox',c.inb],['snz','clock','Snoozed',c.snz],['done','check','Done',c.done]];
  return `<header class="tg-head"><h1 class="tg-h1">Inbox</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><span class="tg-av">${U.who}</span>${PPL[U.who]}<span class="ib-role">${ROLE[U.who]}</span></span><i>·</i>${c.ask?`<button class="tg-hf w" data-a="lf" data-v="ask"><b>${c.ask}</b>need you</button><i>·</i>`:''}<button class="tg-hf" data-a="lf" data-v="un"><b>${c.un}</b>unread</button>${c.snz?`<i>·</i><button class="tg-hf" data-a="view" data-v="snz"><b>${c.snz}</b>snoozed</button>`:''}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}${x[3]?`<span class="ib-vn">${x[3]}</span>`:''}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Search your inbox (/)">${ic('search',16)}</button><button class="btn ib" data-a="pop" data-p="set" title="What reaches you">${ic('gear',16)}</button></header>`; }
function item(n){ const on=n.id===U.sel, un=n.st==='new', fr=n.from;
  return `<div class="tg-it ib-it${on?' on':''}${on&&U.kb?' kb':''}${un?' un':''}" data-a="sel" data-id="${n.id}">${un?'<span class="tg-dot"></span>':''}<span class="tg-gi">${ic(SRC[n.src][1],15)}</span><span class="tg-t"><b>${esc(n.t)}</b></span><span class="tg-w">${n.ro?`<span class="tg-no">${roNo(n.ro)}</span> ${esc(RO[n.ro][0])} · `:''}${fr==='SYS'?'Parsec':esc(F(fr))}</span><span class="ib-m"><small>${n.st==='snz'?ic('clock',11)+n.snz:when(n)}</small>${n.k!=='fyi'&&n.st!=='done'?`<span class="ib-k ${n.k}">${KIND[n.k]}</span>`:''}</span></div>`; }
function list(c){ const G=groups();
  const body=G.length?G.map(([g,L])=>`<div class="tg-grp">${g}<span>${L.length}</span></div>`+L.map(item).join('')).join(''):`<div class="tg-empty"><span class="tg-ring0">${ic(U.view==='in'?'check':U.view==='snz'?'clock':'inbox',22)}</span><h3>${U.view==='in'?'You’re all caught up':U.view==='snz'?'Nothing snoozed':'Nothing done yet today'}</h3><p>${U.view==='in'?'Hand-offs, asks and anything sent to you land here.':U.view==='snz'?'Snoozed things come back at the time you picked.':'What you finish moves here for a week.'}</p></div>`;
  return `<section class="tg-list"><div class="tg-lh">${U.view==='in'?'Inbox':U.view==='snz'?'Snoozed':'Done'}<span class="n">${inView().length}</span></div>${U.view==='in'?`<div class="ib-lh2"><span class="tg-seg3">${[['all','All'],['un','Unread · '+c.un],['ask','Needs you · '+c.ask]].map(x=>`<button class="${U.lf===x[0]?'on':''}" data-a="lf" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div>`:''}<div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('↵')}do it</span><span>${kbd('E')}done</span><span>${kbd('S')}snooze</span><span>${kbd('R')}reply</span></div></section>`; }
function roStrip(n){ if(!n.ro) return ''; const r=RO[n.ro];
  return `<div class="ib-ro" data-a="open" data-t="In Parsec this opens RO ${roNo(n.ro)}."><span class="tg-no">${roNo(n.ro)}</span><b>${esc(r[0])}</b><span class="tr">${r[1]}</span><span class="sp"></span><span class="st">${esc(r[2])}</span><span class="who"><span class="tg-av">${r[3]}</span>${F(r[3])} has it</span><span class="dd">${r[4]?r[4]+' d open':'in today'}</span><span class="sp2">${r[5]}</span>${ic('chevR',14)}</div>`; }
function detail(){ const n=cur(); if(!n||n.to!==U.who) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('inbox',22)}</span><h3>Nothing open</h3><p>Pick something on the left.</p></div></div>`;
  const fr=n.from, frN=fr==='SYS'?'Parsec':fr==='CU'?'the customer':fr==='VO'?'Volvo':PPL[fr];
  const state=n.st==='done'?`<div class="ib-state">${ic('check',14)}Done${n.how?' — '+esc(n.how):''}<span class="sp"></span><button class="btn btn-sm tg-gh" data-a="back">Back to the inbox</button></div>`:n.st==='snz'?`<div class="ib-state">${ic('clock',14)}Snoozed until ${n.snz}<span class="sp"></span><button class="btn btn-sm tg-gh" data-a="back">Unsnooze</button></div>`:'';
  const pk=n.pick&&live(n)?`<div class="ib-pick">${(FREE[U.who]||FREE.FD).map(([t,s])=>{ const busy=/^on /.test(s); return `<button class="ib-tc${U.pick===t?' on':''}${busy?' busy':''}" data-a="pick" data-t="${t}"${busy?' disabled':''}><span class="tg-av">${t}</span><span class="c"><b>${F(t)}${n.hint===t?' <i>· '+n.hintT+'</i>':''}</b><small>${s}</small></span></button>`; }).join('')}</div>`:'';
  const acts=live(n)?`<div class="ib-acts">${n.acts.map((a,i)=>{ const dis=a[1]==='pick'&&!U.pick; return `<button class="btn btn-sm${i===0?' btn-primary':''}" data-a="act" data-i="${i}"${dis?' disabled':''}>${a[1]==='pick'&&U.pick?'Send to '+F(U.pick):a[0]}${i===0?kbd('↵'):''}</button>`; }).join('')}<span class="hint">${n.k==='ask'?'It stays here until it’s done — or someone does it from their page.':n.k==='men'?F(fr)+' sees your answer in their inbox.':''}</span></div>`:'';
  const feed=n.sent.map(x=>[U.who,'just now',x]).reverse().concat(n.feed||[[fr,n.tm,n.t]]);
  return `<div class="ib-pane"><div class="tg-top"><div class="r1"><span class="ib-src">${ic(SRC[n.src][1],13)}${SRC[n.src][0]}</span><span class="ib-from">${fr.length===2?`<span class="tg-av">${fr}</span>`:''}${frN} · ${whenL(n)}</span><span class="sp"></span>${live(n)?`<button class="btn btn-sm" data-a="pop" data-p="snz" title="Snooze (S)">${ic('clock',14)}Snooze</button><button class="btn btn-sm" data-a="done" title="Done (E)">${ic('check',14)}Done</button>`:''}${n.ro?`<button class="btn btn-sm" data-a="open" data-t="In Parsec this opens RO ${roNo(n.ro)}.">${ic('ros',14)}Open RO</button>`:''}</div><h2>${esc(n.t)}</h2>${roStrip(n)}</div>
   <div class="ib-pad">${state}<div class="ib-msg ${n.k}"><span class="k">${n.k==='men'?'@ '+F(U.who):KIND[n.k]}</span>${n.b?`<p>${esc(n.b)}</p>`:''}${n.q?`<blockquote><span class="tg-av">${fr}</span><span>“${esc(n.q)}”</span></blockquote>`:''}
     ${n.parts?`<div class="ib-parts">${n.parts.map(p=>`<div><b>${esc(p[0])}</b><span class="m">${p[1]}</span><span class="${/none/.test(p[2])?'w':''}">${p[2]}</span></div>`).join('')}</div>`:''}${pk}${acts}</div>
    <div class="ib-card"><div class="ib-ch"><b>${n.ro?'On this RO':'Where it came from'}</b><small>${n.ro?'newest first':''}</small></div><div class="tg-feed">${feed.map(f=>`<div class="tg-fe"><span class="gi tg-av" style="width:22px;height:22px">${f[0].length===2&&PPL[f[0]]&&f[0]!=='CU'&&f[0]!=='VO'?f[0]:'P'}</span><b>${f[0]==='SYS'?'Parsec':f[0]==='CU'?'Customer':f[0]==='VO'?'Volvo':PPL[f[0]]}</b><time>${f[1]}</time><p>${esc(f[2])}</p></div>`).join('')}</div></div>
    ${fr.length===2&&!['SYS','CU','VO'].includes(fr)?`<div class="ib-reply"><span class="tg-av">${U.who}</span><input id="ib-r" placeholder="Reply to ${F(fr)} — it lands in their inbox" value="${esc(U.reply)}" autocomplete="off"><button class="btn btn-sm btn-primary" data-a="send"${U.reply.trim()?'':' disabled'}>${ic('send',13)}Send</button></div>`:''}</div></div>`; }
const OPENT={'Open in Foreman':'In Parsec this opens Foreman with 37802 picked.','See the first fix':'In Parsec this opens Fixes on RO 37482.','Write the estimate':'In Parsec this opens the estimate on 37544.','Start the claim':'In Parsec this opens Warranty with the claim on 37546 started.','See it':'In Parsec this opens Manager → KPIs → Productivity.','Open Fixes':'In Parsec this opens Fixes → Review.','See Career':'In Parsec this opens Career with your goals.','Open it':'In Parsec this opens the monthly report.','Call back':'In Parsec this opens Silverline LTL’s number.','Open in Parts':'In Parsec this opens Parts with 37628 picked.','Open in Warranty':'In Parsec this opens Warranty on 37466.'};
/* ---------- popovers ---------- */
function pop(){ const p=U.pop; if(!p) return '';
  if(p.type==='snz') return `<div class="tg-pop menu ib-pop-m"><div class="tg-ph"><b>Snooze until</b></div>${[['Later today','4:00 pm'],['Tomorrow','7:00 am'],['Monday','7:00 am'],['Next week','Monday, Oct 26']].map((x,i)=>`<button class="tg-mi" data-a="snz" data-v="${x[0]==='Later today'?'4:00 pm today':x[0]==='Tomorrow'?'Tomorrow, 7:00 am':x[0]==='Monday'?'Monday, 7:00 am':'Monday, Oct 26'}">${kbd(i+1)}${x[0]}<span class="meta">${x[1]}</span></button>`).join('')}<div class="tg-pft">${ic('info',12)}It comes back to the top of your inbox.</div></div>`;
  if(p.type==='set') return `<div class="tg-pop xf ib-pop-w"><div class="tg-ph"><b>What reaches you</b><span class="cu">${PPL[U.who]}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div><div class="ib-ctx">Hand-offs, asks and @ mentions always reach you. Choose where the rest goes.</div>
    ${Object.keys(SRC).map(k=>`<div class="ib-sr"><span>${ic(SRC[k][1],14)}${SRC[k][0]}</span><span class="tg-seg3">${[['push','Phone + inbox'],['inbox','Inbox'],['off','Off']].map(x=>`<button class="${U.set[k]===x[0]?'on':''}" data-a="setv" data-k="${k}" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div>`).join('')}
    <label class="ib-ck"><input type="checkbox" data-a="quiet" ${U.quiet?'checked':''}>Quiet after 6:00 pm — the phone waits until 7:00 am</label></div>`;
  if(p.type==='srch'){ const q=(p.q||'').trim().toLowerCase(), L=q?mine().filter(n=>(n.t+' '+(n.b||'')+' '+(n.q||'')+' '+roNo(n.ro)+' '+(n.ro?RO[n.ro][0]:'')+' '+PPL[n.from]).toLowerCase().includes(q)).sort(order):[];
    return `<div class="tg-pop menu ib-pop-w"><div class="ib-srin">${ic('search',15)}<input id="ib-q" placeholder="RO, customer, person or words" value="${esc(p.q||'')}" autocomplete="off"></div>${q?(L.length?L.slice(0,7).map((n,i)=>`<button class="ib-srr${i===0?' k':''}" data-a="sel" data-id="${n.id}" data-go="1"><span class="gi">${ic(SRC[n.src][1],14)}</span><b>${esc(n.t)}</b><span class="m">${n.st==='done'?'done':n.st==='snz'?'snoozed':when(n)}</span><small>${n.ro?roNo(n.ro)+' · '+esc(RO[n.ro][0])+' · ':''}${PPL[n.from]}</small></button>`).join(''):`<div class="ib-none">Nothing matches “${esc(p.q)}”.</div>`):'<div class="ib-none">Searches everything that came to you — done and snoozed too.</div>'}</div>`; }
  return ''; }
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
function select(id){ U.sel=id; U.pick=null; U.reply=''; const n=cur(); if(n&&n.st==='new') n.st='read'; }
function nextAfter(id){ const L=flat(), i=L.findIndex(x=>x.id===id); const nx=L[i+1]||L[i-1]; return nx?nx.id:null; }
function finish(n,how,st){ snap(); const nx=nextAfter(n.id); n.st=st||'done'; n.how=how||''; if(U.view==='in') { if(nx) select(nx); else U.sel=null; } U.pop=null; }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t||t.disabled) return; const a=t.dataset.a, n=cur();
  if(a==='sel'){ if(t.dataset.go){ const m=S.N.find(x=>x.id===t.dataset.id); U.view=live(m)?'in':m.st==='snz'?'snz':'done'; U.lf='all'; } select(t.dataset.id); U.kb=false; U.pop=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.lf='all'; U.pop=null; const L=flat(); if(!L.some(x=>x.id===U.sel)) { if(L[0]) select(L[0].id); else U.sel=null; } render(); }
  else if(a==='lf'){ U.view='in'; U.lf=U.lf===t.dataset.v&&t.closest('.tg-facts')?'all':t.dataset.v; const L=flat(); if(!L.some(x=>x.id===U.sel)) { if(L[0]) select(L[0].id); else U.sel=null; } render(); }
  else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; render(); return; } openPop(t.dataset.p,{},t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='pick'){ U.pick=U.pick===t.dataset.t?null:t.dataset.t; render(); }
  else if(a==='act'){ const x=n.acts[+t.dataset.i];
    if(x[1]==='snooze'){ openPop('snz',{},t); return; }
    if(x[1]==='reply'){ const f=$('#ib-r'); if(f) f.focus(); return; }
    if(x[1]==='open'){ toast(OPENT[x[0]]||`In Parsec this opens ${n.ro?'RO '+roNo(n.ro):SRC[n.src][0]}.`,false); render(); return; }
    if(x[1]==='pick'){ const who=U.pick; if(!who) return; const msg=`${roNo(n.ro)} sent to ${F(who)} — ${F(who)} accepts it on the Console.`; finish(n,'sent to '+PPL[who]); toast(msg); render(); return; }
    finish(n,x[0]); toast(x[2]||'Done.'); render(); }
  else if(a==='done'){ finish(n,''); toast('Done — it’s in Done for a week.'); render(); }
  else if(a==='snz'){ finish(n,'', 'snz'); n.snz=t.dataset.v; toast(`Snoozed until ${t.dataset.v}.`); render(); }
  else if(a==='back'){ snap(); n.st='read'; U.view='in'; toast(n.snz&&!n.how?'Back in your inbox.':'Back in your inbox.'); n.snz=''; render(); }
  else if(a==='send'){ const v=U.reply.trim(); if(!v) return; snap(); n.sent.push(v); U.reply=''; if(n.st==='new') n.st='read'; toast(`Sent to ${F(n.from)} — it lands in their inbox.`); render(); }
  else if(a==='open'){ toast(t.dataset.t,false); render(); }
  else if(a==='setv'){ U.set[t.dataset.k]=t.dataset.v; render(); }
  else if(a==='quiet'){ U.quiet=t.checked; }
  else if(a==='toast'){ toast(t.dataset.t,false); render(); }
  else if(a==='undo'){ if(UNDO.length){ const s=JSON.parse(UNDO.pop()); S.N=s.N; U.sel=s.sel; const m=cur(); if(m) U.view=live(m)?'in':m.st==='snz'?'snz':'done'; TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('input',e=>{ const id=e.target.id, p=U.pop;
  if(id==='ib-r'){ U.reply=e.target.value; const b=$('[data-a="send"]'); if(b) b.disabled=!U.reply.trim(); }
  if(id==='ib-q'&&p){ p.q=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#ib-q'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } } });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.ib').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-300)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="act"]')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.findIndex(x=>x.id===U.sel); select(i<0?L[0].id:L[Math.max(0,Math.min(L.length-1,i+d))].id); U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea,select'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();}; const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(p.type==='srch'&&k==='Enter'){ $('.tg-pop .ib-srr')?.click(); return stop(); }
    if(p.type==='snz'&&!inF){ const i=+k; if(i>=1&&i<=4){ $$('.tg-pop [data-a="snz"]')[i-1]?.click(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } if(k==='Enter'&&e.target.id==='ib-r'){ $('[data-a="send"]')?.click(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  const n=cur();
  if(k==='Enter'&&n&&live(n)){ $('.ib-acts .btn-primary:not([disabled])')?.click(); return stop(); }
  if(k==='e'&&n&&live(n)){ $('[data-a="done"]')?.click(); return stop(); }
  if(k==='s'&&n&&live(n)){ const b=$('[data-a="pop"][data-p="snz"]'); if(b) openPop('snz',{},b); return stop(); }
  if(k==='r'){ const f=$('#ib-r'); if(f){ f.focus(); return stop(); } }
  if(k==='u'&&n){ n.st=n.st==='new'?'read':'new'; render(); return stop(); }
  if(k==='/'){ const b=$('[data-a="pop"][data-p="srch"]'); if(b) openPop('srch',{},b); return stop(); }
  if(k>='1'&&k<='3'){ $$('.tg-views button')[+k-1]?.click(); return stop(); }
});
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W_=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); } else { x=W_-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W_-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #ib-q'); if(f){ U.pop._f=1; f.focus(); } } }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
function setWho(w){ reset(w); $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===w)); }
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ setWho(b.dataset.role); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); render(); }));
const DEMO={
  inbox:()=>{setWho('FD');render();},
  pick:()=>{setWho('FD');select('f1');U.pick='DK';render();},
  ask:()=>{setWho('FD');select('f4');U.reply='Be there in 10 — don’t order yet.';render();const f=$('#ib-r'); if(f) f.focus();},
  snz:()=>{setWho('FD');select('f2');render();openPop('snz',{},$('[data-a="pop"][data-p="snz"]'));},
  done:()=>{setWho('FD');U.view='done';select('f9');render();},
  set:()=>{setWho('FD');render();openPop('set',{},$('[data-a="pop"][data-p="set"]'));},
  tech:()=>{setWho('MR');render();},
  writer:()=>{setWho('AM');render();},
  mgr:()=>{setWho('RH');render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{setWho(U.who);$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__ib={S:()=>S,U:()=>U,render,reset,setWho,DEMO,select};
setWho('FD'); render();
