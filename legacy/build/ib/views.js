/* ---------- state ---------- */
let S,U,UNDO,TOAST,TT,RENDERING=false;
const SET0={parts:'push',triage:'push',foreman:'push',warranty:'inbox',fixes:'inbox',manager:'inbox',timelog:'push',console:'push',career:'inbox',ros:'inbox'};
function reset(who){ S={N:JSON.parse(JSON.stringify(IB0)).map(n=>Object.assign({st:'new',sent:[]},n)),SENT:JSON.parse(JSON.stringify(SENT0))};
  U={who:who||'FD',view:'in',lf:'all',sel:null,pop:null,kb:false,pick:{},reply:'',set:Object.assign({},SET0),quiet:true,morning:true,sumx:{},bulk:false,bs:{},away:{}};
  UNDO=[]; TOAST=null; U.sel=null; const f=flat()[0]; if(f) select(f.key); }
const snap=()=>{ UNDO.push(JSON.stringify({N:S.N,SENT:S.SENT,sel:U.sel,away:U.away,sumx:U.sumx})); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const live=n=>n.st==='new'||n.st==='read';
const actionable=n=>n.k==='ask'||n.k==='men';
/* covering: while someone is away, their asks show up in their backup’s inbox too */
const coverFor=w=>Object.keys(U.away).filter(x=>U.away[x]&&U.away[x].cover===w);
const mine=()=>S.N.filter(n=>n.to===U.who||(coverFor(U.who).includes(n.to)&&actionable(n)));
const roNo=k=>k?k.replace(/b$/,''):'';
const tkey=n=>n.ro?n.to+'|'+n.ro:n.id;
/* one thread per RO: everything about the same truck, newest first */
function threads(L){ const M=new Map(); L.forEach(n=>{ const k=tkey(n); if(!M.has(k)) M.set(k,[]); M.get(k).push(n); });
  return [...M.entries()].map(([key,I])=>{ I.sort(order); const prim=I.find(n=>live(n)&&actionable(n))||I[0]; return {key,I,prim,top:I[0],ask:I.some(n=>live(n)&&actionable(n)),un:I.some(n=>n.st==='new'),cov:prim.to!==U.who}; }); }
function inViewItems(){ return mine().filter(n=>U.view==='in'?live(n):U.view==='snz'?n.st==='snz':n.st==='done'); }
function groups(){ if(U.view==='sent') return [['Sent by you',S.SENT.filter(x=>x.by===U.who).map(x=>({key:'s:'+x.id,sent:x}))]];
  let T=threads(inViewItems()).sort((a,b)=>order(a.top,b.top));
  if(U.view!=='in') return [[U.view==='snz'?'Snoozed':'Done',T]];
  if(U.lf==='un') T=T.filter(t=>t.un); else if(U.lf==='ask') T=T.filter(t=>t.ask);
  const C=T.filter(t=>t.cov), A=T.filter(t=>!t.cov&&t.ask), R=T.filter(t=>!t.cov&&!t.ask);
  return [[`Covering for ${C.length?F(C[0].prim.to):''}`,C],['Needs you',A],['Today',R.filter(t=>t.top.d===0)],['Yesterday',R.filter(t=>t.top.d===1)],['Earlier this week',R.filter(t=>t.top.d>1)]].filter(g=>g[1].length); }
const flat=()=>groups().flatMap(g=>g[1]);
const curT=()=>U.sel==='SUM'?null:flat().find(t=>t.key===U.sel&&t.I)||null;
const counts=()=>{ const M=mine().filter(n=>n.to===U.who); return {ask:threads(M.filter(live)).filter(t=>t.ask).length,un:M.filter(n=>n.st==='new').length,snz:M.filter(n=>n.st==='snz').length,done:M.filter(n=>n.st==='done').length,inb:threads(mine().filter(live)).length,sent:S.SENT.filter(x=>x.by===U.who).length}; };
/* asks past the hold goal: reminded at the goal, to the backup at one and a half times it */
const fmtT=m=>{ const h=Math.floor(m/60)%24, mm=m%60; return ((h+11)%12+1)+':'+String(mm).padStart(2,'0')+' '+(h<12?'am':'pm'); };
function esc8(n){ if(!actionable(n)||!live(n)||n.d>0) return null; const g=GOAL[n.to], t=tmin(n.tm), age=NOW-t; if(age<g) return null; const b=BACKUP[n.to]; return {rem:fmtT(t+g),bk:fmtT(t+Math.round(g*1.5)),gone:age>=g*1.5,who:b[0],role:b[1],goal:g}; }

/* ---------- drawing ---------- */
function render(){ if(RENDERING) return; RENDERING=true; try{ draw(); } finally{ RENDERING=false; } }
function draw(){ const c=counts();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='inbox'?'is-on':''}">${ic(k,18)}${k==='inbox'&&c.un?`<span class="rl-badge">${c.un}</span>`:''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg ib">${head(c)}<div class="tg-body">${list(c)}<div class="tg-main">${detail()}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after(); }
function head(c){ const vs=[['in','inbox','Inbox',c.inb],['snz','clock','Snoozed',c.snz],['done','check','Done',c.done],['sent','send','Sent',0]], aw=U.away[U.who];
  return `<header class="tg-head"><h1 class="tg-h1">Inbox</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><span class="tg-av">${U.who}</span>${PPL[U.who]}<span class="ib-role">${ROLE[U.who]}</span></span><i>·</i>${aw?`<button class="tg-hf w" data-a="pop" data-p="away"><b>Away</b>until ${aw.until.split(',')[0]}</button><i>·</i>`:''}${c.ask?`<button class="tg-hf w" data-a="lf" data-v="ask"><b>${c.ask}</b>need you</button><i>·</i>`:''}<button class="tg-hf" data-a="lf" data-v="un"><b>${c.un}</b>unread</button></span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}${x[3]?`<span class="ib-vn">${x[3]}</span>`:''}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn btn-sm" data-a="pop" data-p="eos" title="Pass on what’s open" style="height:30px">${ic('moon',14)}End of shift</button><button class="btn ib${aw?' on':''}" data-a="pop" data-p="away" title="Away — who covers your asks">${ic('exit',16)}</button><button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Search your inbox (/)">${ic('search',16)}</button><button class="btn ib" data-a="pop" data-p="set" title="What reaches you">${ic('gear',16)}</button></header>`; }
function item(t){ if(t.sent) return sentItem(t.sent); const n=t.prim, on=t.key===U.sel, un=t.un, fr=n.from, e=esc8(n), many=t.I.filter(x=>U.view==='in'?live(x):true).length;
  const names=[...new Set(t.I.map(x=>x.from==='SYS'?'Parsec':x.from==='CU'?'Customer':x.from==='VO'?'Volvo':F(x.from)))].slice(0,3).join(', ');
  return `<div class="tg-it ib-it${on?' on':''}${on&&U.kb?' kb':''}${un?' un':''}${U.bulk?' bk':''}" data-a="sel" data-id="${t.key}">${U.bulk?`<span class="ib-cb${U.bs[t.key]?' on':''}">${U.bs[t.key]?ic('check',11):''}</span>`:un?'<span class="tg-dot"></span>':''}<span class="tg-gi">${ic(SRC[n.src][1],15)}</span><span class="tg-t"><b>${esc(n.t)}</b>${many>1?`<span class="ib-n">${many}</span>`:''}</span><span class="tg-w">${n.ro?`<span class="tg-no">${roNo(n.ro)}</span> ${esc(RO[n.ro][0])} · `:''}${esc(names)}</span><span class="ib-m"><small>${n.st==='snz'?ic('clock',11)+esc(n.snz):when(t.top)}</small>${t.cov?`<span class="ib-k cov">for ${F(n.to)}</span>`:U.away[n.to]&&actionable(n)&&live(n)?`<span class="ib-k cov">${F(U.away[n.to].cover)} has it too</span>`:e?`<span class="ib-k late">${e.gone?'with '+F(e.who)+' too':'overdue'}</span>`:n.k!=='fyi'&&n.st!=='done'?`<span class="ib-k ${n.k}">${KIND[n.k]}</span>`:n.auto?'<span class="ib-k auto">cleared itself</span>':''}</span></div>`; }
function sentItem(x){ const on='s:'+x.id===U.sel;
  return `<div class="tg-it ib-it${on?' on':''}" data-a="sel" data-id="s:${x.id}"><span class="tg-gi"><span class="tg-av" style="width:22px;height:22px">${x.to}</span></span><span class="tg-t"><b>${esc(x.t)}</b></span><span class="tg-w">${x.ro?`<span class="tg-no">${roNo(x.ro)}</span> ${esc(RO[x.ro][0])} · `:''}to ${F(x.to)}</span><span class="ib-m"><small>${x.tm}</small>${x.did?`<span class="ib-k auto">${esc(x.did.split(' ')[0])}</span>`:x.seen?'<span class="ib-k men">seen</span>':'<span class="ib-k late">not seen</span>'}</span></div>`; }
function list(c){ const G=groups(), aw=U.away[U.who], cov=coverFor(U.who), sum=SUM[U.who];
  const top=U.view==='in'?`${aw?`<div class="ib-band away">${ic('exit',14)}<span><b>Away until ${esc(aw.until)}</b> — ${F(aw.cover)} has your asks. Everything else waits for you.</span><button data-a="awayoff">Back now</button></div>`:''}${U.morning&&!U.sumx[U.who]&&sum?`<div class="tg-it ib-it ib-sum${U.sel==='SUM'?' on':''}" data-a="sel" data-id="SUM"><span class="tg-gi">${ic('sun',15)}</span><span class="tg-t"><b>Morning summary</b></span><span class="tg-w">Since ${sum.since} · on your phone at clock-in</span><span class="ib-m"><small>${sum.at}</small></span></div>`:''}`:'';
  const bulkBar=U.bulk?`<div class="ib-bulk"><b>${Object.values(U.bs).filter(Boolean).length} picked</b><span class="sp"></span><button class="btn btn-sm" data-a="bk" data-v="read">Mark read</button><button class="btn btn-sm" data-a="bk" data-v="snz">Snooze to tomorrow</button><button class="btn btn-sm btn-primary" data-a="bk" data-v="done">${ic('check',13)}Done</button><button class="btn btn-sm ib" data-a="bulk" title="Stop picking">${ic('x',13)}</button></div>`:'';
  const body=G.length?G.map(([g,L])=>`<div class="tg-grp">${g}<span>${L.length}</span></div>`+L.map(item).join('')).join(''):`<div class="tg-empty"><span class="tg-ring0">${ic(U.view==='in'?'check':U.view==='snz'?'clock':U.view==='sent'?'send':'inbox',22)}</span><h3>${U.view==='in'?'You’re all caught up':U.view==='snz'?'Nothing snoozed':U.view==='sent'?'Nothing sent today':'Nothing done yet today'}</h3><p>${U.view==='in'?'Hand-offs, asks and anything sent to you land here. Shop-wide activity stays on the Activity log.':U.view==='snz'?'Snoozed things come back at the time — or when the thing happens.':U.view==='sent'?'What you hand off shows here, with when it was seen.':'What you finish moves here for a week.'}</p></div>`;
  return `<section class="tg-list"><div class="tg-lh">${{in:'Inbox',snz:'Snoozed',done:'Done',sent:'Sent'}[U.view]}<span class="n">${G.reduce((s,g)=>s+g[1].length,0)}</span>${U.view==='in'?`<span class="sp" style="flex:1"></span><button class="btn btn-sm tg-gh${U.bulk?' on':''}" data-a="bulk">${ic('check',13)}${U.bulk?'Picking':'Pick several'}</button>`:''}</div>${U.view==='in'?`<div class="ib-lh2"><span class="tg-seg3">${[['all','All'],['un','Unread · '+c.un],['ask','Needs you · '+c.ask]].map(x=>`<button class="${U.lf===x[0]?'on':''}" data-a="lf" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div>`:''}${bulkBar}<div class="tg-scroll">${top}${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('↵')}do it</span><span>${kbd('E')}done</span><span>${kbd('S')}snooze</span><span>${kbd('X')}pick</span><span>${kbd('R')}reply</span></div></section>`; }
function roStrip(ro){ if(!ro) return ''; const r=RO[ro];
  return `<div class="ib-ro" data-a="open" data-t="In Parsec this opens RO ${roNo(ro)}."><span class="tg-no">${roNo(ro)}</span><b>${esc(r[0])}</b><span class="tr">${r[1]}</span><span class="sp"></span><span class="st">${esc(r[2])}</span><span class="who"><span class="tg-av">${r[3]}</span>${F(r[3])} has it</span><span class="dd">${r[4]?r[4]+' d open':'in today'}</span><span class="sp2">${r[5]}</span>${ic('chevR',14)}</div>`; }
const fromN=fr=>fr==='SYS'?'Parsec':fr==='CU'?'the customer':fr==='VO'?'Volvo':PPL[fr];
function msg(n,big){ const fr=n.from, e=esc8(n), pick=U.pick[n.id];
  const pk=n.pick&&live(n)?`<div class="ib-pick">${(FREE.FD).map(([t,s])=>{ const busy=/^on /.test(s); return `<button class="ib-tc${pick===t?' on':''}${busy?' busy':''}" data-a="pick" data-id="${n.id}" data-t="${t}"${busy?' disabled':''}><span class="tg-av">${t}</span><span class="c"><b>${F(t)}${n.hint===t?' <i>· '+n.hintT+'</i>':''}</b><small>${s}</small></span></button>`; }).join('')}</div>`:'';
  const acts=live(n)?`<div class="ib-acts">${n.acts.map((a,i)=>{ const dis=a[1]==='pick'&&!pick; return `<button class="btn btn-sm${i===0&&big?' btn-primary':''}" data-a="act" data-id="${n.id}" data-i="${i}"${dis?' disabled':''}>${a[1]==='pick'&&pick?'Send to '+F(pick):a[0]}${i===0&&big?kbd('↵'):''}</button>`; }).join('')}${big?`<span class="hint">${n.k==='ask'?'It clears itself if this gets done on its own page.':n.k==='men'?F(fr)+' sees your answer in their inbox.':''}</span>`:`<button class="btn btn-sm tg-gh" data-a="done1" data-id="${n.id}">${ic('check',13)}Done</button>`}</div>`:'';
  const eb=e&&big?`<div class="ib-esc">${ic('clock',13)}<span>Past the ${e.goal/60} h goal — Parsec reminded you at ${e.rem}. ${e.gone?`It went to ${PPL[e.who]} (${e.role}) too at ${e.bk}.`:`If it’s still here at ${e.bk} it goes to ${PPL[e.who]} (${e.role}) too.`}</span></div>`:'';
  return `<div class="ib-msg ${n.k}${big?'':' sm'}">${big?'':`<div class="ib-mh"><span class="tg-av">${fr.length===2&&PPL[fr]&&!['CU','VO'].includes(fr)?fr:'P'}</span><b>${esc(n.t)}</b><small>${fromN(fr)} · ${n.tm}</small></div>`}<span class="k">${n.to!==U.who?'For '+F(n.to)+' — you’re covering':n.k==='men'?'@ '+F(U.who):KIND[n.k]}</span>${eb}${n.b?`<p>${esc(n.b)}</p>`:''}${n.q?`<blockquote><span class="tg-av">${fr}</span><span>“${esc(n.q)}”</span></blockquote>`:''}
    ${n.parts?`<div class="ib-parts">${n.parts.map(p=>`<div><b>${esc(p[0])}</b><span class="m">${p[1]}</span><span class="${/none/.test(p[2])?'w':''}">${p[2]}</span></div>`).join('')}</div>`:''}${pk}${acts}</div>`; }
function detail(){ if(U.sel==='SUM') return sumPane(); if(U.sel&&U.sel.startsWith('s:')) return sentPane(S.SENT.find(x=>'s:'+x.id===U.sel));
  const t=curT(); if(!t) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('inbox',22)}</span><h3>Nothing open</h3><p>Pick something on the left.</p></div></div>`;
  const n=t.prim, fr=n.from, others=t.I.filter(x=>x!==n&&(U.view==='in'?live(x):true)), isLive=live(n);
  const state=n.st==='done'?`<div class="ib-state">${ic('check',14)}Done${n.how?' — '+esc(n.how):''}<span class="sp"></span><button class="btn btn-sm tg-gh" data-a="back" data-id="${n.id}">Back to the inbox</button></div>`:n.st==='snz'?`<div class="ib-state">${ic('clock',14)}Snoozed — ${esc(n.snzT||'until '+n.snz)}<span class="sp"></span>${n.ev?`<button class="btn btn-sm tg-gh" data-a="evt" data-id="${n.id}">Pretend it happens</button>`:''}<button class="btn btn-sm tg-gh" data-a="back" data-id="${n.id}">Unsnooze</button></div>`:'';
  const phone=isLive?(actionable(n)?`<span class="ib-ph">${ic('phone',12)}buzzed your phone</span>`:`<span class="ib-ph q">${ic('phone',12)}waits — no buzz</span>`):'';
  const feed=t.I.flatMap(x=>(x.sent||[]).map(s=>[U.who,'just now',s])).reverse().concat(t.I.flatMap(x=>x.feed||[[x.from,x.tm,x.t]])).filter((f,i,A)=>A.findIndex(g=>g[0]===f[0]&&g[2]===f[2])===i);
  return `<div class="ib-pane"><div class="tg-top"><div class="r1"><span class="ib-src">${ic(SRC[n.src][1],13)}${SRC[n.src][0]}</span><span class="ib-from">${fr.length===2&&!['CU','VO'].includes(fr)&&PPL[fr]?`<span class="tg-av">${fr}</span>`:''}${fromN(fr)} · ${whenL(n)}</span>${phone}<span class="sp"></span>${isLive?`<button class="btn btn-sm" data-a="pop" data-p="snz" title="Snooze (S)">${ic('clock',14)}Snooze</button><button class="btn btn-sm" data-a="done" title="Done (E)">${ic('check',14)}Done${t.I.filter(live).length>1?' · all '+t.I.filter(live).length:''}</button>`:''}${n.ro?`<button class="btn btn-sm" data-a="open" data-t="In Parsec this opens RO ${roNo(n.ro)}.">${ic('ros',14)}Open RO</button>`:`<button class="btn btn-sm" data-a="open" data-t="In Parsec this opens ${SRC[n.src][0]}.">${ic(SRC[n.src][1],14)}Open ${SRC[n.src][0]}</button>`}</div><h2>${esc(n.t)}</h2>${roStrip(n.ro)}</div>
   <div class="ib-pad">${state}${msg(n,true)}${others.length?`<div class="ib-also"><div class="ib-ch"><b>Also on this RO</b><small>${others.length} more — one thread per truck</small></div>${others.map(x=>msg(x,false)).join('')}</div>`:''}
    <div class="ib-card"><div class="ib-ch"><b>${n.ro?'On this RO':'Where it came from'}</b><small>${n.ro?'newest first':''}</small></div><div class="tg-feed">${feed.slice(0,6).map(f=>`<div class="tg-fe"><span class="gi tg-av" style="width:22px;height:22px">${PPL[f[0]]&&!['SYS','CU','VO'].includes(f[0])?f[0]:'P'}</span><b>${f[0]==='SYS'?'Parsec':f[0]==='CU'?'Customer':f[0]==='VO'?'Volvo':PPL[f[0]]}</b><time>${f[1]}</time><p>${esc(f[2])}</p></div>`).join('')}</div></div>
    ${fr.length===2&&!['CU','VO'].includes(fr)&&PPL[fr]&&fr!=='SYS'?`<div class="ib-reply"><span class="tg-av">${U.who}</span><input id="ib-r" placeholder="Reply to ${F(fr)} — @ someone to bring them in" value="${esc(U.reply)}" autocomplete="off"><button class="btn btn-sm btn-primary" data-a="send"${U.reply.trim()?'':' disabled'}>${ic('send',13)}Send</button></div>`:''}</div></div>`; }
function sumPane(){ const s=SUM[U.who], M=mine().filter(n=>n.to===U.who&&live(n)), A=M.filter(actionable), R=M.filter(n=>n.k==='rem');
  return `<div class="ib-pane"><div class="tg-top"><div class="r1"><span class="ib-src">${ic('sun',13)}Morning summary</span><span>${s.at} · since ${s.since}</span><span class="ib-ph">${ic('phone',12)}on your phone at clock-in</span><span class="sp"></span><button class="btn btn-sm" data-a="sumx">${ic('check',14)}Got it</button></div><h2>Good morning, ${F(U.who)}</h2></div>
   <div class="ib-pad"><div class="ib-sumg"><div><b>${A.length}</b><small>need you</small></div><div><b>${M.length}</b><small>in your inbox</small></div><div><b>${R.length}</b><small>reminder${R.length===1?'':'s'}</small></div><div><b>${s.due.length}</b><small>due today</small></div></div>
    ${A.length?`<div class="ib-card"><div class="ib-ch"><b>Needs you first</b></div>${A.sort(order).map(n=>`<div class="ib-sl" data-a="sel" data-id="${tkey(n)}">${ic(SRC[n.src][1],14)}<span>${esc(n.t)}</span><small>${n.ro?roNo(n.ro)+' · ':''}${fromN(n.from)}</small></div>`).join('')}</div>`:''}
    <div class="ib-card"><div class="ib-ch"><b>Due today</b></div>${s.due.map(d=>`<div class="ib-sl"><span class="tg-no">${d[0]}</span><span>${esc(d[1])}</span></div>`).join('')}${s.appt?`<div class="ib-sl">${ic('clock',14)}<span>${esc(s.appt)}</span></div>`:''}${s.run.map(r=>`<div class="ib-sl w">${ic('play',14)}<span>Clock still running — ${esc(r)}</span></div>`).join('')}</div>
    ${s.pass?`<div class="ib-card"><div class="ib-ch"><b>Passed on to you</b><small>end of shift</small></div><div class="ib-sl">${ic('moon',14)}<span>${esc(s.pass)}</span></div></div>`:''}</div></div>`; }
function sentPane(x){ const steps=[['Sent',x.tm,true],['Seen',x.seen,!!x.seen],[x.did?x.did.replace(/ \d.*$/,''):'Done',x.did?x.did.match(/\d.*$/)[0]:null,!!x.did]];
  return `<div class="ib-pane"><div class="tg-top"><div class="r1"><span class="ib-src">${ic('send',13)}Sent</span><span class="ib-from"><span class="tg-av">${x.to}</span>to ${PPL[x.to]} · today, ${x.tm}</span><span class="sp"></span>${!x.seen?`<button class="btn btn-sm btn-primary" data-a="nudge" data-id="${x.id}">${ic('bell',14)}Nudge ${F(x.to)}</button>`:''}${x.ro?`<button class="btn btn-sm" data-a="open" data-t="In Parsec this opens RO ${roNo(x.ro)}.">${ic('ros',14)}Open RO</button>`:''}</div><h2>${esc(x.t)}</h2>${roStrip(x.ro)}</div>
   <div class="ib-pad"><div class="ib-seen">${steps.map((s,i)=>`<div class="st${s[2]?' on':''}"><span class="d">${s[2]?ic('check',12):i+1}</span><b>${s[0]}</b><small>${s[1]||(i===1?'not yet':'—')}</small></div>`).join('<span class="ln"></span>')}</div>
    <div class="ib-msg fyi"><span class="k">What ${F(x.to)} sees</span><p>${!x.seen?`${F(x.to)} hasn’t opened it yet. Parsec buzzes ${x.to==='AW'||x.to==='MR'?'his':'their'} phone again at ${fmtT(tmin(x.tm)+60)} — or nudge now.`:x.did?`${F(x.to)} saw it at ${x.seen} — ${x.did.toLowerCase()}.`:`${F(x.to)} saw it at ${x.seen}. Nothing done on it yet.`}</p></div></div></div>`; }
/* ---------- popovers ---------- */
const OPENT={'Open in Foreman':'In Parsec this opens Foreman with 37802 picked.','See the first fix':'In Parsec this opens Fixes on RO 37482.','Write the estimate':'In Parsec this opens the estimate on 37544.','Start the claim':'In Parsec this opens Warranty with the claim on 37546 started.','See it':'In Parsec this opens Manager → KPIs → Productivity.','Open Fixes':'In Parsec this opens Fixes → Review.','See Career':'In Parsec this opens Career with your goals.','Open it':'In Parsec this opens the monthly report.','Call back':'In Parsec this opens Silverline LTL’s number.','Open in Parts':'In Parsec this opens Parts with 37628 picked.','Open in Warranty':'In Parsec this opens Warranty on 37466.'};
function snzOpts(t){ const n=t.prim, L=[['Later today','4:00 pm','4:00 pm today'],['Tomorrow','7:00 am','Tomorrow, 7:00 am'],['Monday','7:00 am','Monday, 7:00 am']];
  const E=[]; if(n.ro){ const r=RO[n.ro]; if(/parts/i.test(r[2])||n.src==='parts') E.push(['Until the parts arrive','parts',`until the parts for ${roNo(n.ro)} are checked in — ETA Tue, Oct 27`]); if(n.src==='triage'||U.who==='AM') E.push(['Until the customer replies','cust',`until ${r[0]} replies`]); E.push(['Until the RO moves','moves',`until ${roNo(n.ro)} moves to its next stage`]); }
  return {L,E}; }
function pop(){ const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  if(p.type==='snz'){ const t=curT(); if(!t) return ''; const O=snzOpts(t);
    return `<div class="tg-pop menu ib-pop-w"><div class="tg-ph"><b>Snooze until</b></div>${O.L.map((x,i)=>`<button class="tg-mi" data-a="snz" data-v="${x[2]}">${kbd(i+1)}${x[0]}<span class="meta">${x[1]}</span></button>`).join('')}${O.E.length?`<div class="ib-psep">or until something happens</div>${O.E.map((x,i)=>`<button class="tg-mi" data-a="snz" data-v="${x[0].toLowerCase()}" data-e="${x[1]}" data-t="${esc(x[2])}">${kbd(i+4)}${x[0]}<span class="meta">${x[1]==='parts'?'ETA Tue':''}</span></button>`).join('')}`:''}<div class="tg-pft">${ic('info',12)}It comes back to the top of your inbox.</div></div>`; }
  if(p.type==='set') return `<div class="tg-pop xf ib-pop-w">${hd('What reaches you',PPL[U.who])}
    <div class="ib-sr lk"><span>${ic('lock',14)}Hand-offs, asks and @ mentions</span><span class="ib-always">Always · phone + inbox</span></div>
    <div class="ib-ctx">Asks can’t be turned off — they always reach you. Choose where the rest goes.</div>
    ${Object.keys(SRC).map(k=>`<div class="ib-sr"><span>${ic(SRC[k][1],14)}${SRC[k][0]}</span><span class="tg-seg3">${[['push','Phone + inbox'],['inbox','Inbox'],['off','Off']].map(x=>`<button class="${U.set[k]===x[0]?'on':''}" data-a="setv" data-k="${k}" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div>`).join('')}
    <label class="ib-ck"><input type="checkbox" data-a="quiet" ${U.quiet?'checked':''}>Quiet after 6:00 pm — the phone waits until 7:00 am</label>
    <label class="ib-ck"><input type="checkbox" data-a="morning" ${U.morning?'checked':''}>Morning summary at clock-in — here and on the phone</label>
    <div class="tg-pft">${ic('info',12)}This is only what’s sent to you. Shop-wide activity stays on the Activity log.</div></div>`;
  if(p.type==='away'){ const aw=U.away[U.who]||{until:'Monday, 7:00 am',cover:BACKUP[U.who][0]}, sel=p.cover||aw.cover;
    return `<div class="tg-pop xf ib-pop-w">${hd('Away','who covers your asks')}<div class="ib-ctx">While you’re away your asks show up in your cover’s inbox too. FYIs and reminders wait for you. Senders see you’re away.</div>
      <span class="tg-lbl top">Until</span><div class="tg-r" style="margin-bottom:10px">${['End of today','Tomorrow, 7:00 am','Monday, 7:00 am'].map(x=>`<button class="tg-chip${(p.until||aw.until)===x?' on':''}" data-a="awu" data-v="${x}">${x}</button>`).join('')}</div>
      <span class="tg-lbl top">Covering</span><div class="ib-pick" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[BACKUP[U.who][0],'RH','JT','FD'].filter((v,i,A)=>v!==U.who&&A.indexOf(v)===i).slice(0,4).map(t=>`<button class="ib-tc${sel===t?' on':''}" data-a="awc" data-t="${t}"><span class="tg-av">${t}</span><span class="c"><b>${PPL[t]}</b><small>${t===BACKUP[U.who][0]?'your usual backup':t==='RH'?'manager':t==='JT'?'service writer':'foreman'}</small></span></button>`).join('')}</div>
      <div class="tg-acts">${U.away[U.who]?'<button class="btn btn-sm tg-gh" data-a="awayoff">I’m back</button>':''}<button class="btn btn-sm btn-primary" data-a="awayon">${U.away[U.who]?'Update':'Turn on'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='eos'){ const A=mine().filter(n=>n.to===U.who&&live(n)&&actionable(n)).sort(order), sel=p.sel||(p.sel=Object.fromEntries(A.map(n=>[n.id,true]))), to=p.to||(p.to=BACKUP[U.who][0]);
    return `<div class="tg-pop xf ib-pop-w">${hd('End of shift','pass on what’s open')}${A.length?`<span class="tg-lbl top">Still open</span>${A.map(n=>`<label class="ib-eo" data-a="eosk" data-id="${n.id}"><input type="checkbox" ${sel[n.id]?'checked':''} tabindex="-1"><span><b>${esc(n.t)}</b><small>${n.ro?roNo(n.ro)+' · ':''}${fromN(n.from)} · ${n.tm}</small></span></label>`).join('')}`:'<div class="ib-none">Nothing open — a clean hand-off.</div>'}
      <span class="tg-lbl top" style="margin-top:10px">To</span><div class="tg-r" style="margin-bottom:8px">${[BACKUP[U.who][0],'RH','ME'].filter((v,i,A)=>v!==U.who&&A.indexOf(v)===i).map(t=>`<button class="tg-chip${to===t?' on':''}" data-a="eost" data-v="${t}">${t==='ME'?'Keep them for tomorrow':PPL[t]}</button>`).join('')}</div>
      <label class="ib-f"><span>Note</span><textarea id="ib-eon" rows="2" placeholder="What the next person should know">${esc(p.note!=null?p.note:U.who==='FD'?'Kevin’s clock is fixed. 37802 needs a tech first thing — Dana if she’s free.':'')}</textarea></label>
      <div class="tg-acts"><span class="hint">${to==='ME'?'They stay in your inbox; the note goes in your morning summary.':`${F(to)} gets them in the morning summary and in the inbox.`}</span><button class="btn btn-sm btn-primary" data-a="eosgo">Pass it on${kbd('↵')}</button></div></div>`; }
  if(p.type==='srch'){ const q=(p.q||'').trim().toLowerCase(), L=q?mine().filter(n=>(n.t+' '+(n.b||'')+' '+(n.q||'')+' '+roNo(n.ro)+' '+(n.ro?RO[n.ro][0]:'')+' '+PPL[n.from]).toLowerCase().includes(q)).sort(order):[];
    return `<div class="tg-pop menu ib-pop-w"><div class="ib-srin">${ic('search',15)}<input id="ib-q" placeholder="RO, customer, person or words" value="${esc(p.q||'')}" autocomplete="off"></div>${q?(L.length?L.slice(0,7).map((n,i)=>`<button class="ib-srr${i===0?' k':''}" data-a="sel" data-id="${tkey(n)}" data-n="${n.id}" data-go="1"><span class="gi">${ic(SRC[n.src][1],14)}</span><b>${esc(n.t)}</b><span class="m">${n.st==='done'?'done':n.st==='snz'?'snoozed':when(n)}</span><small>${n.ro?roNo(n.ro)+' · '+esc(RO[n.ro][0])+' · ':''}${PPL[n.from]}</small></button>`).join(''):`<div class="ib-none">Nothing matches “${esc(p.q)}”.</div>`):'<div class="ib-none">Searches everything that came to you — done and snoozed too.</div>'}</div>`; }
  return ''; }
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
function select(key){ U.sel=key; U.reply=''; const t=flat().find(x=>x.key===key); if(t&&t.I) t.I.forEach(n=>{ if(n.st==='new') n.st='read'; }); }
function nextAfter(key){ const L=flat(), i=L.findIndex(x=>x.key===key); const nx=L[i+1]||L[i-1]; return nx?nx.key:null; }
function moveOn(key){ if(U.view!=='in') return; const t=flat().find(x=>x.key===key); if(t&&t.I.some(live)) return; const nx=nextAfter(key); U.sel=null; if(nx) select(nx); }
function finish(n,how,st){ const key=U.sel, nx=nextAfter(key); n.st=st||'done'; n.how=how||''; const t=threads(inViewItems()).find(x=>x.key===key); if(U.view==='in'&&!(t&&t.I.some(live))){ U.sel=null; if(nx&&flat().some(x=>x.key===nx)) select(nx); else if(flat()[0]) select(flat()[0].key); } U.pop=null; }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t||t.disabled) return; const a=t.dataset.a, T=curT(), N=id=>S.N.find(x=>x.id===id);
  if(a==='sel'){ if(U.bulk&&!t.dataset.go&&t.dataset.id!=='SUM'&&!t.dataset.id.startsWith('s:')){ U.bs[t.dataset.id]=!U.bs[t.dataset.id]; render(); return; }
    if(t.dataset.go&&t.dataset.n){ const m=N(t.dataset.n); U.view=live(m)?'in':m.st==='snz'?'snz':'done'; U.lf='all'; }
    select(t.dataset.id); U.kb=false; U.pop=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.lf='all'; U.pop=null; U.bulk=false; const L=flat(); if(!L.some(x=>x.key===U.sel)){ U.sel=null; if(L[0]) select(L[0].key); } render(); }
  else if(a==='lf'){ U.view='in'; U.lf=U.lf===t.dataset.v&&t.closest('.tg-facts')?'all':t.dataset.v; const L=flat(); if(!L.some(x=>x.key===U.sel)){ U.sel=null; if(L[0]) select(L[0].key); } render(); }
  else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; render(); return; } openPop(t.dataset.p,{},t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='pick'){ U.pick[t.dataset.id]=U.pick[t.dataset.id]===t.dataset.t?null:t.dataset.t; render(); }
  else if(a==='act'){ const n=N(t.dataset.id), x=n.acts[+t.dataset.i];
    if(x[1]==='snooze'){ openPop('snz',{},t); return; }
    if(x[1]==='reply'){ const f=$('#ib-r'); if(f) f.focus(); return; }
    if(x[1]==='open'){ toast(OPENT[x[0]]||`In Parsec this opens ${n.ro?'RO '+roNo(n.ro):SRC[n.src][0]}.`,false); render(); return; }
    snap();
    if(x[1]==='pick'){ const who=U.pick[n.id]; if(!who) return; finish(n,'sent to '+PPL[who]); S.SENT.unshift({id:'x'+Date.now(),by:U.who,to:who,ro:n.ro,t:`Sent ${roNo(n.ro)} to ${F(who)}`,tm:'2:15 pm',seen:null,did:null}); toast(`${roNo(n.ro)} sent to ${F(who)} — Sent shows when ${F(who)} sees it.`); render(); return; }
    finish(n,x[0]); toast(x[2]||'Done.'); render(); }
  else if(a==='done1'){ snap(); const n=N(t.dataset.id); n.st='done'; n.how=''; toast('Done.'); render(); }
  else if(a==='done'){ if(!T) return; snap(); const L=T.I.filter(live); L.forEach(n=>{ n.st='done'; n.how=''; }); moveOn(T.key); toast(L.length>1?`Done — all ${L.length} on ${roNo(T.prim.ro)}.`:'Done — it’s in Done for a week.'); U.pop=null; render(); }
  else if(a==='snz'){ if(!T) return; snap(); const key=T.key; T.I.filter(live).forEach(n=>{ n.st='snz'; n.snz=t.dataset.v; n.snzT=t.dataset.t||('until '+t.dataset.v); n.ev=t.dataset.e||null; }); U.pop=null; moveOn(key); toast(t.dataset.e?`Snoozed ${t.dataset.t}.`:`Snoozed until ${t.dataset.v}.`); render(); }
  else if(a==='evt'){ snap(); const n=N(t.dataset.id); S.N.filter(x=>tkey(x)===tkey(n)&&x.st==='snz').forEach(x=>{ x.st='new'; x.snz=''; }); S.N.push({id:'ev'+Date.now(),to:n.to,src:n.ev==='parts'?'parts':n.src,from:n.ev==='parts'?'BO':n.from,k:'fyi',d:0,tm:'2:15 pm',ro:n.ro,t:n.ev==='parts'?`Parts are in for ${roNo(n.ro)}`:n.ev==='cust'?`${RO[n.ro][0]} replied`:`${roNo(n.ro)} moved on`,b:'It woke the snoozed thread — back on top of your inbox.',acts:[['Okay','do','Okay.']],st:'new',sent:[]}); U.view='in'; select(tkey(n)); toast('It happened — the thread is back on top of your inbox.'); render(); }
  else if(a==='back'){ snap(); const n=N(t.dataset.id); S.N.filter(x=>tkey(x)===tkey(n)&&!live(x)&&x.st===n.st).forEach(x=>{ x.st='read'; x.snz=''; }); U.view='in'; select(tkey(n)); toast('Back in your inbox.'); render(); }
  else if(a==='send'){ const v=U.reply.trim(); if(!v||!T) return; snap(); T.prim.sent.push(v); U.reply=''; const m=v.match(/@(\w+)/); toast(m?`Sent to ${F(T.prim.from)} — and ${m[1]} is brought in.`:`Sent to ${F(T.prim.from)} — it lands in their inbox.`); render(); }
  else if(a==='open'){ toast(t.dataset.t,false); render(); }
  else if(a==='setv'){ U.set[t.dataset.k]=t.dataset.v; render(); }
  else if(a==='quiet'){ U.quiet=t.checked; }
  else if(a==='morning'){ U.morning=t.checked; render(); }
  else if(a==='sumx'){ snap(); U.sumx[U.who]=1; const f=flat()[0]; U.sel=null; if(f) select(f.key); toast('Summary put away — it’s back tomorrow at clock-in.'); render(); }
  else if(a==='bulk'){ U.bulk=!U.bulk; U.bs={}; render(); }
  else if(a==='bk'){ const keys=Object.keys(U.bs).filter(k=>U.bs[k]); if(!keys.length){ toast('Pick some first — click the rows.',false); render(); return; } snap(); let n=0;
    keys.forEach(k=>{ const th=flat().find(x=>x.key===k); if(!th) return; th.I.filter(live).forEach(x=>{ n++; if(t.dataset.v==='done'){ x.st='done'; x.how=''; } else if(t.dataset.v==='snz'){ x.st='snz'; x.snz='Tomorrow, 7:00 am'; x.snzT='until tomorrow, 7:00 am'; } else x.st='read'; }); });
    U.bulk=false; U.bs={}; const L=flat(); if(!L.some(x=>x.key===U.sel)){ U.sel=null; if(L[0]) select(L[0].key); } toast(t.dataset.v==='done'?`${n} done.`:t.dataset.v==='snz'?`${n} snoozed to tomorrow.`:`${n} marked read.`); render(); }
  else if(a==='awu'){ U.pop.until=t.dataset.v; render(); }
  else if(a==='awc'){ U.pop.cover=t.dataset.t; render(); }
  else if(a==='awayon'){ const aw=U.away[U.who]||{until:'Monday, 7:00 am',cover:BACKUP[U.who][0]}; snap(); U.away[U.who]={until:U.pop.until||aw.until,cover:U.pop.cover||aw.cover}; U.pop=null; toast(`Away until ${U.away[U.who].until} — ${F(U.away[U.who].cover)} covers your asks.`); render(); }
  else if(a==='awayoff'){ snap(); delete U.away[U.who]; U.pop=null; toast('Welcome back — your asks are only yours again.'); render(); }
  else if(a==='eosk'){ e.preventDefault(); U.pop.sel[t.dataset.id]=!U.pop.sel[t.dataset.id]; render(); }
  else if(a==='eost'){ U.pop.to=t.dataset.v; render(); }
  else if(a==='eosgo'){ const p=U.pop, ids=Object.keys(p.sel).filter(k=>p.sel[k]), to=p.to, note=(($('#ib-eon')||{}).value||'').trim(); snap();
    if(to!=='ME') ids.forEach(id=>{ const n=N(id); S.N.push(Object.assign(JSON.parse(JSON.stringify(n)),{id:n.id+'-p',to,st:'new',sent:[],t:n.t,b:(n.b?n.b+' ':'')+`Passed on by ${F(U.who)} at the end of the shift.`})); n.st='done'; n.how=`passed to ${PPL[to]} at the end of the shift`; });
    if(to!=='ME'&&SUM[to]) SUM[to].pass=`${F(U.who)} passed on ${ids.length} thing${ids.length===1?'':'s'} at the end of the shift${note?': “'+note+'”':'.'}`;
    U.pop=null; const L=flat(); if(!L.some(x=>x.key===U.sel)){ U.sel=null; if(L[0]) select(L[0].key); } toast(to==='ME'?'Kept for tomorrow — the note is in your morning summary.':`${ids.length} passed to ${F(to)} — with your note in the morning summary.`); render(); }
  else if(a==='nudge'){ snap(); const x=S.SENT.find(s=>s.id===t.dataset.id); toast(`Nudged ${F(x.to)} — the phone buzzes again.`); render(); }
  else if(a==='undo'){ if(UNDO.length){ const s=JSON.parse(UNDO.pop()); S.N=s.N; S.SENT=s.SENT; U.away=s.away; U.sumx=s.sumx; U.sel=s.sel; const th=curT(); if(!th&&U.sel&&U.sel!=='SUM'&&!U.sel.startsWith('s:')){ const m=S.N.find(x=>tkey(x)===U.sel); if(m) U.view=live(m)?'in':m.st==='snz'?'snz':'done'; } TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('input',e=>{ const id=e.target.id, p=U.pop;
  if(id==='ib-r'){ U.reply=e.target.value; const b=$('[data-a="send"]'); if(b) b.disabled=!U.reply.trim(); }
  if(id==='ib-eon'&&p) p.note=e.target.value;
  if(id==='ib-q'&&p){ p.q=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#ib-q'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } } });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.ib').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-300)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="act"]')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.findIndex(x=>x.key===U.sel); select(i<0?L[0].key:L[Math.max(0,Math.min(L.length-1,i+d))].key); U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea,select'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();}; const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(p.type==='srch'&&k==='Enter'){ $('.tg-pop .ib-srr')?.click(); return stop(); }
    if(k==='Enter'&&e.target.tagName!=='TEXTAREA'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(p.type==='snz'&&!inF){ const i=+k; if(i>=1&&i<=6){ $$('.tg-pop [data-a="snz"]')[i-1]?.click(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } if(k==='Enter'&&e.target.id==='ib-r'){ $('[data-a="send"]')?.click(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  const T=curT(), lv=T&&T.I.some(live);
  if(k==='Enter'&&lv){ $('.ib-msg:not(.sm) .ib-acts .btn-primary:not([disabled])')?.click(); return stop(); }
  if(k==='e'&&lv){ $('[data-a="done"]')?.click(); return stop(); }
  if(k==='s'&&lv){ const b=$('[data-a="pop"][data-p="snz"]'); if(b) openPop('snz',{},b); return stop(); }
  if(k==='x'&&U.view==='in'&&T){ U.bulk=true; U.bs[T.key]=!U.bs[T.key]; render(); return stop(); }
  if(k==='r'){ const f=$('#ib-r'); if(f){ f.focus(); return stop(); } }
  if(k==='u'&&T){ const un=T.I.some(n=>n.st==='new'); T.I.forEach(n=>{ if(live(n)) n.st=un?'read':'new'; }); render(); return stop(); }
  if(k==='/'){ const b=$('[data-a="pop"][data-p="srch"]'); if(b) openPop('srch',{},b); return stop(); }
  if(k>='1'&&k<='4'){ $$('.tg-views button')[+k-1]?.click(); return stop(); }
});
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W_=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); } else { x=W_-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W_-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #ib-q'); if(f){ U.pop._f=1; f.focus(); } } }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
function setWho(w,keep){ if(keep){ U.who=w; U.view='in'; U.lf='all'; U.bulk=false; U.bs={}; U.pop=null; U.sel=null; const f=flat()[0]; if(f) select(f.key); } else reset(w); $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===w)); }
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ setWho(b.dataset.role,true); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); render(); }));
const DEMO={
  thread:()=>{setWho('FD');select('FD|37388');render();},
  snz:()=>{setWho('FD');select('FD|37544');render();openPop('snz',{},$('[data-a="pop"][data-p="snz"]'));},
  clear:()=>{setWho('FD');select('FD|37802');render();setTimeout(()=>{ snap(); const n=S.N.find(x=>x.id==='f2'); finish(n,'cleared by itself — you assigned it to Luis on the Foreman page'); n.auto=1; toast('37802 was assigned on the Foreman page — it cleared from your inbox by itself.'); render(); },500);},
  late:()=>{setWho('FD');select('FD|37795');render();},
  away:()=>{setWho('FD');U.away.FD={until:'Monday, 7:00 am',cover:'MR'};setWho('MR',true);render();},
  sent:()=>{setWho('FD');U.view='sent';select('s:s2');render();},
  sum:()=>{setWho('FD');select('SUM');render();},
  phone:()=>{setWho('FD');render();openPop('set',{},$('[data-a="pop"][data-p="set"]'));},
  bulk:()=>{setWho('FD');U.bulk=true;U.bs={'FD|37546':true,'FD|37544':true,'f8':true};render();},
  eos:()=>{setWho('FD');render();openPop('eos',{},$('[data-a="pop"][data-p="eos"]'));},
  try:()=>{setWho('FD');render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{setWho(U.who);$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__ib={S:()=>S,U:()=>U,render,reset,setWho,DEMO,select,flat};
setWho('FD'); render();
