/* ---------- popovers ---------- */
function pop(){ const p=U.pop; if(!p) return '';
  if(p.type==='per') return `<div class="tg-pop menu mg-pop-w">${PERS.concat(['all']).map(x=>{ const o=per(x); return `${x==='wk'||x==='mo'||x==='qt'||x==='yr'||x==='all'?'<div class="mg-psep"></div>':''}<button class="tg-mi${U.p===x?' on':''}" data-a="pset" data-v="${x}">${x==='all'?kbd('A'):PKEY[x]?kbd(PKEY[x]):'<span class="tg-kbd" style="visibility:hidden">·</span>'}${o.n}<span class="meta">${x==='all'?(TSTART[U.who]?'since '+SINCE[U.who]:'since Jan 2025'):o.s}</span></button>`; }).join('')}<div class="tg-pft">${ic('info',12)}Calendar periods — the same ones the Manager page uses.</div></div>`;
  if(p.type==='chk'){ const L=(CHK[U.who]||[]).filter(c=>U.chk[c[0]]);
    return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>To fix in the Time Log</b><span class="cu">your numbers trip on these</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>${L.length?L.map(c=>`<div class="mg-chk"><span class="gi">${ic(c[1],14)}</span><b>${c[2]}</b><p>${c[3]}</p><div class="r"><button class="btn btn-sm" data-a="fix" data-c="${c[0]}">${c[4]}</button></div></div>`).join(''):`<div class="mg-none">${ic('check',14)} All clean.</div>`}</div>`; }
  if(p.type==='priv') return `<div class="tg-pop xf mg-pop-m cr-pv"><div class="tg-ph"><b>Who sees your Career</b><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>${[['user','You','Everything on this page.'],['foreman','Frank Delaney · shop foreman','Your numbers, Work, coaching notes and skills. Not pay.'],['manager','Ray Holloway · service manager','Everything. He sets your goals.'],['lock','Other techs','Nothing — each tech sees only their own.']].map(r=>`<div class="cr-pvr"><span class="gi">${ic(r[0],14)}</span><b>${r[1]}</b><small>${r[2]}</small></div>`).join('')}<div class="tg-pft">${ic('info',12)}The Statement is the only thing that leaves — when you print or save it.</div></div>`;
  if(p.type==='prior'){ const d=U.prior[U.who]||PRIOR0[U.who];
    return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>${TSTART[U.who]?'Your years before Vanguard':'Your years before Parsec'}</b><span class="cu">from your old time sheets</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
     <div class="cr-pf">${[['from','From',d.from],['to','Until',d.to],['ro','ROs worked',d.ro],['d','Days worked',d.d],['q','Hours sold',d.q],['b','Hours clocked',d.b]].map(f=>`<label><small>${f[1]}</small><input data-f="${f[0]}" value="${esc(typeof f[2]==='number'?f[2].toLocaleString():f[2])}"></label>`).join('')}</div>
     <div class="cr-pfn">${ic('info',12)}<span>Shows as “by hand”, next to Parsec’s numbers — never mixed in silently. Over quote stays Parsec only. Ray confirms it once.</span></div>
     <div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="psave">${ic('check',13)}Add to my totals</button></div></div>`; }
  return ''; }
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
function keepScroll(fn){ const sc=$('.mg-full'), y=sc?sc.scrollTop:0; fn(); const s2=$('.mg-full'); if(s2) s2.scrollTop=y; }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a; const wasHl=U.hl; U.hl=null;
  if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; keepScroll(render); return; } const sc=$('.mg-full'), y=sc?sc.scrollTop:0; openPop(t.dataset.p,{},t); const s2=$('.mg-full'); if(s2) s2.scrollTop=y; }
  else if(a==='popx'){ U.pop=null; keepScroll(render); }
  else if(a==='pset'){ U.p=t.dataset.v; U.pop=null; render(); }
  else if(a==='sel'){ U.sel=t.dataset.ro; U.kb=false; render(); }
  else if(a==='go'){ U.view='work'; U.sel=t.dataset.ro; render(); const it=$('.tg-scroll .tg-it.on'), sc=$('.tg-scroll'); if(it&&sc) sc.scrollTop=it.offsetTop-120; }
  else if(a==='fix'){ U.chk[t.dataset.c]=0; toast('Fixed in the Time Log — your numbers count it again.'); render(); }
  else if(a==='toast'){ toast(t.dataset.t); keepScroll(render); }
  else if(a==='cmp'){ U.cmp=t.dataset.v; keepScroll(render); }
  else if(a==='drv'){ U.drv=t.dataset.v; keepScroll(render); }
  else if(a==='al'){ const k=t.dataset.k; U.al[k]=U.al[k]?0:1; toast(U.al[k]?'On — it comes to your Inbox.':'Off — nothing more about this.'); keepScroll(render); }
  else if(a==='pay'){ U.pay=!U.pay; keepScroll(render); }
  else if(a==='ack'){ U.ack[t.dataset.k]=1; toast('Frank sees you got it.'); keepScroll(render); }
  else if(a==='ask'){ toast(`Sent to Frank: ${t.dataset.n} runs ${t.dataset.v} over the quote for you, on average — ${t.dataset.c} jobs.`); keepScroll(render); }
  else if(a==='stmt'){ U.stmt=U.stmt?null:'yr'; U.pop=null; keepScroll(render); }
  else if(a==='stmtp'){ U.stmt=t.dataset.v; render(); }
  else if(a==='stmtx'){ U.stmt=null; keepScroll(render); }
  else if(a==='prior'){ U.usePrior=t.dataset.v==='1'; keepScroll(render); }
  else if(a==='psave'){ const o={}; $$('.cr-pf input').forEach(i=>{ const f=i.dataset.f, v=i.value.trim(); o[f]=f==='from'||f==='to'?v:(+v.replace(/[^\d.]/g,'')||0); }); U.prior[U.who]=o; U.usePrior=true; U.pop=null; U.hl='prior'; toast('Added — your totals show both, marked “by hand”.'); keepScroll(render); }
  else if(wasHl) render();
});
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.cr').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-300)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"]')){ U.pop=null; keepScroll(render); } },true);
addEventListener('keydown',e=>{ const k=e.key; if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select')) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  if(U.pop){ if(k==='Escape'){ U.pop=null; keepScroll(render); return stop(); } if(U.pop.type==='per'){ const i='dwmqya'.indexOf(k); if(i>=0){ U.p=['day','wk','mo','qt','yr','all'][i]; U.pop=null; render(); return stop(); } } return; }
  if(U.stmt){ if(k==='Escape'){ U.stmt=null; keepScroll(render); return stop(); } return; }
  if((k==='j'||k==='k')&&U.view==='work'){ const L=wFlat(), i=L.findIndex(x=>x.r.no===U.sel); const n=L[Math.max(0,Math.min(L.length-1,i+(k==='j'?1:-1)))]; if(n){ U.sel=n.r.no; U.kb=true; render(); } return stop(); }
  const i='dwmqya'.indexOf(k); if(i>=0&&U.view!=='grow'){ U.p=['day','wk','mo','qt','yr','all'][i]; render(); return stop(); }
  if(k==='c'&&U.view==='ov'&&yrSeg()){ U.cmp=U.cmp==='yr'?'prev':'yr'; keepScroll(render); return stop(); }
  if(k==='1'||k==='2'||k==='3'){ U.view=['ov','work','grow'][+k-1]; render(); return stop(); }
});
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W_=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); } else { x=W_-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W_-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; } }
/* scroll a card into view and ring it, for the demo buttons */
function show(sec){ U.hl=sec; render(); const el=$(`[data-sec="${sec}"]`), sc=$('.mg-full'); if(el&&sc){ const r=el.getBoundingClientRect(), s=sc.getBoundingClientRect(); sc.scrollTop+=(r.top-s.top)/scale-(sec==='cmp'?10:14); } }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
function setWho(w){ reset(w); $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===w)); }
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ const p=U.p, v=U.view, c=U.cmp, d=U.drv; setWho(b.dataset.role); U.p=p; U.view=v; U.cmp=c; U.drv=d; $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); render(); }));
const DEMO={
  why:()=>{setWho('MR');show('why');},
  quote:()=>{setWho('MR');U.view='grow';show('quote');},
  best:()=>{setWho('MR');U.view='grow';show('best');},
  ly:()=>{setWho('MR');U.cmp='yr';show('cmp');},
  notes:()=>{setWho('MR');U.view='grow';show('notes');},
  skills:()=>{setWho('MR');U.view='grow';show('skills');},
  fixw:()=>{setWho('MR');U.view='grow';show('fixw');},
  pay:()=>{setWho('MR');U.pay=true;show('pay');},
  alerts:()=>{setWho('MR');show('alerts');},
  stmt:()=>{setWho('MR');U.stmt='yr';render();},
  priv:()=>{setWho('MR');render();openPop('priv',{},$('[data-a="pop"][data-p="priv"]'));},
  prior:()=>{setWho('MR');render();openPop('prior',{},$('[data-a="pop"][data-p="prior"]'));},
  new:()=>{setWho('AW');render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{setWho(U.who);$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__cr={U:()=>U,render,setWho,DEMO,wFlat,kv,KM,qGroups,bestsData};
setWho('MR'); render();
