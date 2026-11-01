/* ======================= Career — one technician’s own numbers ======================= */
const TECH4=[['MR','2019'],['DK','2021'],['AW','2026'],['KT','2018']];
const SINCE={MR:'March 2019',DK:'June 2021',AW:'August 2026',KT:'January 2018'};
const PG={MR:{eff:100,prod:85,sold:7.5,cb:3},DK:{eff:100,prod:85,sold:7.5,cb:3},AW:{eff:92,prod:85,sold:6.5,cb:4},KT:{eff:100,prod:85,sold:7.5,cb:3}};
const CMP={rep:['Outlet NOx sensor — check engine light','DEF doser clogged — derate','Turbo actuator fault — low boost','Coolant leak at water pump','Air dryer purging constantly','Wheel seal leaking — drive axle','A/C not cooling — compressor clutch','Alternator not charging','EGR valve stuck — derate','Misfire cylinder 4 — injector','DPF pressure sensor — fault code','Clutch slipping'],pm:['PM service — A','PM service — B','PM service — C'],war:['Warranty — DEF doser','Warranty — turbo actuator','Warranty — outlet NOx sensor','Warranty — water pump','Warranty — A/C compressor']};
function cmpOf(o){ const r=o.r, i=r.ops.indexOf(o); if(o.t==='diag'){ const f=r.ops.find(x=>x.t!=='diag'); return 'Diagnosis — '+(f?cmpOf(f).replace(/^Warranty — /,'').split(' — ')[0].toLowerCase():'customer concern'); } const L=CMP[o.t]||CMP.rep; return L[(+r.no*7+i*3)%L.length]; }
const TYPE={diag:['DIAG','dg'],rep:['OP','op'],pm:['PM','pm'],war:['WARR','wa']};
const wdIn=(a,b)=>{ let n=0; for(let k=a;k<=b;k=addD(k,1)) n+=wf(k); return n; };
const lostOf=o=>o.b-o.q, sev=l=>l<=0?'ok':l<=.5?'low':l<=1.5?'mid':'high';
const hm=h=>{ const m=Math.round(Math.abs(h)*60); return Math.floor(m/60)+':'+String(m%60).padStart(2,'0'); };
/* all time, plus the calendar periods */
const _per=per;
const tStart=()=>TSTART[U.who]||START;
per=function(p){ if(p!=='all') return _per(p); const a=tStart(); return {p:'all',a,b:TODAY,pa:addD(a,-1),pb:addD(a,-1),n:'All time',s:'since '+MN[dOf(a).getMonth()]+' '+a.slice(0,4)+(TSTART[U.who]?' — when you started':' — when Parsec started'),cmp:'',g:'all',fut:true}; };
const _buckets=buckets;
buckets=function(p,prev){ if(p!=='all') return _buckets(p,prev); if(prev) return null; const L=[]; for(let a=mStart(tStart());a<=TODAY;a=addM(a,1)) L.push({a,b:mEnd(a),l:MN[dOf(a).getMonth()]+(dOf(a).getMonth()===0?' ’'+a.slice(2,4):''),t:MNL[dOf(a).getMonth()]+' '+a.slice(0,4)}); return L; };
let U, TOAST, TT, RENDERING=false;
function reset(who){ U={who:who||'MR',view:'ov',p:'mo',sel:null,pop:null,kb:false,tg:{},chk:{c1:1,c2:1}}; TOAST=null; }
function toast(t){ TOAST={t}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const FT=()=>({k:'tech',v:U.who});
const W=()=>win(U.p), PW=()=>pwin(U.p);
const isSum=k=>['sold','clk','lost','unap'].includes(k.id);
function kv(k){ const [a,b]=W(), [pa,pb]=PW(), F_=FT(), v=val(k,a,b,F_), pv=U.p==='all'?null:val(k,pa,pb,F_), X=ctx(a,b,F_), g=PG[U.who][k.id], t=g==null?null:k.tw!=null?g*X.wd:g;
  return {v,pv,t,dl:U.p==='all'?{s:'',cl:'flat'}:delta(k,v,pv),ok:t==null||v==null?null:k.d>=0?v>=t:v<=t,X,shop:val(k,a,b)}; }
function sparkSvg(k,w=76,h=28){ const L=spark(U.p==='all'?'yr':U.p).map(x=>val(k,x.a,x.b,FT())); const V=L.filter(v=>v!=null); if(V.length<2) return `<svg class="spk" width="${w}" height="${h}"></svg>`;
  let lo=Math.min(...V), hi=Math.max(...V); if(hi-lo<1e-6){ hi+=1; lo-=1; } const x=i=>2+i*(w-4)/(L.length-1), y=v=>h-3-(v-lo)/(hi-lo)*(h-6), pts=L.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
  return `<svg class="spk mg-svg" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--tg-ink4)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="3" fill="var(--tg-acc)"/></svg>`; }
const rtop=(x,y,w,h)=>{ const r=Math.min(4,h,w/2); return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`; };
/* this tech’s work: operations by them, on ROs closed in the window */
function opsIn(a,b){ return ctx(a,b,FT()).ops; }
function rosIn(a,b){ const M=new Map(); opsIn(a,b).forEach(o=>{ if(!M.has(o.r)) M.set(o.r,[]); M.get(o.r).push(o); }); const open=openAt(TODAY).filter(r=>r.ops.some(o=>o.tech===U.who)).map(r=>[r,r.ops.filter(o=>o.tech===U.who)]); return {closed:[...M.entries()],open:b>=TODAY?open:[]}; }
const CHK={MR:[['c1','play','Clock still running on 37466','Since 5:12 pm yesterday — 21 h. Efficiency leaves the operation out until it’s fixed.','Stop it at 5:12 pm'],['c2','timelog','A punch with no operation','Oct 20 · 0.8 h on 37628 not on a job — it counts as unapplied.','Pick the job']],DK:[['c2','timelog','A punch with no operation','Oct 21 · 0.4 h on 37388 not on a job.','Pick the job']],AW:[['c1','play','Clock still running on 37544','Since 4:40 pm yesterday.','Stop it at 4:40 pm']],KT:[['c1','play','Clock still running on 37589','Since 6:02 pm yesterday — 20 h.','Stop it at 6:02 pm']]};
const nChk=()=>(CHK[U.who]||[]).filter(c=>U.chk[c[0]]).length;

/* ---------- drawing ---------- */
function render(){ if(RENDERING) return; RENDERING=true; try{ draw(); } finally{ RENDERING=false; } }
function draw(){ const v=U.view;
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='career'?'is-on':''}">${ic(k,18)}${k==='inbox'?'<span class="rl-badge">3</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg mg cr">${head()}<div class="tg-body">${v==='work'?wList():''}<div class="tg-main">${v==='work'?wDetail():vOv()}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}</div>`:''}</div></div>`;
  after(); }
function head(){ const e=kv(KM.eff), s=kv(KM.sold), n=nChk();
  return `<header class="tg-head"><h1 class="tg-h1">Career</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><span class="tg-av">${U.who}</span>${PPL[U.who]}<span class="ib-role">Technician · since ${SINCE[U.who]}</span></span><i>·</i><span class="tg-hf" style="cursor:default"><b>${fmt('pct',e.v)}</b>efficiency</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${fmt('h',s.v)}</b>sold</span>${n?`<i>·</i><button class="tg-hf w" data-a="pop" data-p="chk"><b>${n}</b>to fix in the Time Log</button>`:''}</span>
  <div class="tg-views">${[['ov','grid','Overview'],['work','ros','Work']].map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn btn-sm" data-a="pop" data-p="per" style="height:30px" title="Period (D · W · M · Q · Y · A)">${ic('clock',14)}${per(U.p).n}${ic('chevD',13)}</button><button class="btn btn-sm" data-a="toast" data-t="Your career sheet prints — the totals, this period against your goals, and every RO." style="height:30px">${ic('print',14)}Print</button></header>`; }
/* ---------- overview ---------- */
function totals(){ const X=ctx(tStart(),TODAY,FT()), q=sum(X.ops,o=>o.q), b=sum(X.ops,o=>o.b), ro=new Set(X.ops.map(o=>o.r)).size, ov=sum(X.ops,over), days=Object.keys(ATT[U.who]).filter(d=>ATT[U.who][d]>0).length;
  return [['ROs worked',ro.toLocaleString(),'every RO with your time on it'],['Hours sold',Math.round(q).toLocaleString()+' h','quoted, on your operations'],['Hours clocked',Math.round(b).toLocaleString()+' h','punched on those operations'],['Over quote',Math.round(ov).toLocaleString()+' h','on the jobs that ran over'],['Efficiency',fmt('pct',b?q/b*100:null),'sold ÷ clocked, all time'],['Days worked',days.toLocaleString(),'with a punch']]; }
function tile(k,label){ const o=kv(k);
  return `<div class="mg-tile" data-tip="${esc(k.n)}|${esc(k.how)}"><span class="l"><span>${label||k.n}</span></span><span class="v">${fmt(k.u,o.v)}</span>${sparkSvg(k)}<span class="r">${o.dl.s?`<span class="mg-d ${o.dl.cl}">${o.dl.s}</span>`:''}<span class="sp"></span>${o.t!=null?(o.ok?`<span class="mg-tgt ok">${ic('check',11)}goal ${fmt(k.u,o.t)}</span>`:`<span class="mg-tgt off">${ic('flag',11)}goal ${fmt(k.u,o.t)}</span>`):`<span>shop avg ${fmt(k.u,k.id==='clk'||k.id==='sold'||k.id==='lost'||k.id==='unap'?o.shop/6:o.shop)}</span>`}</span></div>`; }
function vOv(){ const T=totals(), P_=per(U.p);
  let h=`<div class="mg-full"><div class="mg-sec">Career totals<span>${TSTART[U.who]?'since you started in '+SINCE[U.who]+' — all of it':'since '+MN[dOf(START).getMonth()]+' '+START.slice(0,4)+', when Parsec started — your time before Parsec isn’t in here'}</span></div><div class="cr-tot">${T.map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>`;
  h+=`<div class="mg-sec">${P_.n}<span>${P_.s}${P_.cmp?' · '+P_.cmp:''} · goals set by Ray Holloway</span></div><div class="mg-tiles">${[['eff'],['prod'],['sold'],['clk'],['unap'],['lost'],['cb','Comebacks'],['fx']].map(x=>tile(KM[x[0]],x[1])).join('')}</div>`;
  h+=`<div class="mg-two cr-two"><div class="mg-card"><div class="mg-ch"><b>Efficiency</b><small>${{day:'each of the last 14 workdays',wk:'running total, day by day',mo:'running total, day by day',qt:'running total, week by week',yr:'running total, month by month',all:'each month'}[P_.g]}</small><span class="sp"></span><span class="mg-leg"><span><i></i>${U.p==='all'?'Each month':'This period'}</span>${P_.cmp&&U.p!=='day'?'<span><i class="ln"></i>The period before</span>':''}<span><i class="tl"></i>Your goal</span></span></div><div class="mg-cb">${effChart(700)}</div></div>${goalsCard()}</div>`;
  h+=`<div class="mg-two cr-two b"><div class="mg-card"><div class="mg-ch"><b>Your hours, last 14 days</b><small>on ROs and unapplied</small><span class="sp"></span><span class="mg-leg"><span><i></i>On ROs</span><span><i class="un"></i>Unapplied</span></span></div><div class="mg-cb">${hoursChart(700)}</div></div>${overCard()}</div></div>`;
  return h; }
const RUN=()=>['wk','lwk','mo','lmo','qt','lqt','yr'].includes(U.p);
function effChart(w){ const k=KM.eff, F_=FT(), P_=per(U.p), C=buckets(U.p), PB=U.p==='all'?null:buckets(U.p,true), run=RUN();
  const cv=(x,a0)=>!x||x.fut?null:val(k,run?a0:x.a,minK(x.b,TODAY),F_);
  const V=C.map(x=>cv(x,P_.a)), PV=PB?PB.map(x=>cv(x,P_.pa)):null, g=PG[U.who].eff;
  const all=V.concat(PV||[]).concat([g]).filter(v=>v!=null); const H=190, pl=44, pr=64, pt=10, pb=22; let lo=Math.max(0,Math.floor((Math.min(...all)-8)/10)*10), stp=Math.max(5,Math.ceil((Math.max(...all)+6-lo)/4/5)*5), hi=lo+4*stp;
  const st=(w-pl-pr)/C.length, cx=i=>pl+st*i+st/2, y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`; for(let v=lo;v<=hi;v+=stp) s+=`<line class="gl" x1="${pl}" x2="${w-pr+8}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${pl-8}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end">${Math.round(v)}%</text>`;
  s+=`<line class="tl" x1="${pl}" x2="${w-pr+8}" y1="${y(g).toFixed(1)}" y2="${y(g).toFixed(1)}"/><text class="tlab" x="${w-pr+12}" y="${(y(g)+3.5).toFixed(1)}">Goal ${g}%</text>`;
  const seg=(A,cls)=>{ const pts=A.map((v,i)=>v==null?null:[cx(i),y(v)]); let out='', cur=[]; const fl=()=>{ if(cur.length>1) out+=(cls==='ln'?`<path class="ar" d="M${cur[0][0]},${y(lo)}L${cur.map(p=>p.map(n=>n.toFixed(1)).join(',')).join('L')}L${cur[cur.length-1][0]},${y(lo)}Z"/>`:'')+`<polyline class="${cls}" points="${cur.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}"/>`; cur=[]; }; pts.forEach(p=>{ if(p) cur.push(p); else fl(); }); fl(); return out; };
  if(PV) s+=seg(PV,'pv'); s+=seg(V,'ln');
  const every=C.length>16?3:C.length>9?2:1;
  C.forEach((x,i)=>{ if(V[i]!=null&&C.length<=14) s+=`<circle class="dt" cx="${cx(i).toFixed(1)}" cy="${y(V[i]).toFixed(1)}" r="4"/>`; if(i%every===(C.length-1)%every) s+=`<text class="ax" x="${cx(i).toFixed(1)}" y="${H-5}" text-anchor="middle"${x.fut?' style="opacity:.45"':''}>${x.l}</text>`;
    if(!x.fut) s+=`<rect class="hit" x="${(cx(i)-st/2).toFixed(1)}" y="${pt}" width="${st.toFixed(1)}" height="${H-pt-pb}" data-tip="${esc(x.t)}|${V[i]==null?'no work closed':(RUN()?'So far ':'')+Math.round(V[i])+'%'}${PV&&PV[i]!=null?' · the period before '+Math.round(PV[i])+'%':''}"/>`; });
  return s+'</svg>'; }
function hoursChart(w){ const L=[]; let k=TODAY; while(L.length<14){ if(wf(k)) L.unshift(k); k=addD(k,-1); }
  const V=L.map(d=>{ const b=TB[U.who][d]||0, a=ATT[U.who][d]||0; return {d,b,u:Math.max(0,a-b),a}; }), H=170, pl=30, pb=22, pt=8, mx=Math.ceil(Math.max(...V.map(x=>x.a))/2)*2+1, st=(w-pl-4)/L.length, bw=Math.min(24,st*.6), y=v=>pt+(H-pt-pb)*(1-v/mx);
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`; for(let g=0;g<=mx;g+=Math.max(2,Math.round(mx/4/2)*2)) s+=`<line class="gl" x1="${pl}" x2="${w}" y1="${y(g)}" y2="${y(g)}"/><text class="ax" x="${pl-6}" y="${y(g)+3.5}" text-anchor="end">${g}</text>`;
  V.forEach((x,i)=>{ const c=pl+st*i+st/2, x0=c-bw/2; s+=`<path class="bar" d="M${x0},${y(0)}V${y(x.b)}H${x0+bw}V${y(0)}Z"/>`; if(x.u>.05) s+=`<path class="bar un" d="${rtop(x0,y(x.b+x.u),bw,Math.max(0,y(x.b)-2-y(x.b+x.u)))}"/>`; s+=`<text class="ax" x="${c}" y="${H-6}" text-anchor="middle">${i%2?'':md(x.d)}</text><rect class="hit" x="${c-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" data-tip="${DW[dOf(x.d).getDay()]} ${fd(x.d)}|On ROs ${h1(x.b)} h · unapplied ${h1(x.u)} h · on the clock ${h1(x.a)} h"/>`; });
  return s+'</svg>'; }
function goalsCard(){ const g=PG[U.who], o=per('mo'), done=Object.keys(ATT[U.who]).filter(d=>d>=o.a&&d<=TODAY&&ATT[U.who][d]>0).length;
  const R=[['eff','Efficiency'],['prod','Productivity'],['sold','Hours sold'],['cb','Comebacks']].map(([id,n])=>{ const k=KM[id], v=val(k,o.a,TODAY,FT()), X=ctx(o.a,TODAY,FT()), t=k.tw!=null?g[id]*X.wd:g[id], ok=v==null?null:k.d>=0?v>=t:v<=t; return {k,n,v,t,ok,g:g[id]}; });
  const sd=R[2], tot=wdIn(o.a,mEnd(o.a)), dn=wdIn(o.a,TODAY), proj=sd.v/dn*tot, goalM=sd.g*tot;
  return `<div class="mg-card cr-goals"><div class="mg-ch"><b>Your goals · ${mName(TODAY)}</b><small>set by Ray Holloway, Oct 1</small></div><div class="mg-cb">${R.map(r=>{ const pct=r.k.d>=0?Math.min(1,(r.v||0)/r.t):Math.min(1,r.t/Math.max(r.v||0.001,r.t)); return `<div class="cr-gr"><span class="n"><b>${r.n}</b><small>goal ${r.k.tw!=null?r.g+' h a workday':fmt(r.k.u,r.g)}</small></span><span class="b"><i class="${r.ok?'ok':'off'}" style="width:${(pct*100).toFixed(1)}%"></i></span><span class="m ${r.ok?'ok':'off'}">${fmt(r.k.u,r.v)}<small>${r.ok?'meets it':r.k.d>=0?'under':'over'}</small></span></div>`; }).join('')}
    <div class="cr-pace">${ic('spark',13)}<span>On pace for <b>${Math.round(proj)} h</b> sold by ${fd(mEnd(o.a))} — the goal is ${Math.round(goalM)} h${proj<goalM?` · ${h1((goalM-sd.v)/(tot-dn))} h a workday to get there`:''}.</span></div></div></div>`; }
function overCard(){ const [a,b]=W(), L=opsIn(a,b).filter(o=>lostOf(o)>0).sort((p,q)=>lostOf(q)-lostOf(p)).slice(0,5);
  return `<div class="mg-card"><div class="mg-ch"><b>Jobs that ran over</b><small>${per(U.p).n.toLowerCase()} · most hours first</small></div><div class="mg-cb">${L.length?L.map(o=>`<button class="cr-or" data-a="go" data-ro="${o.r.no}"><span class="cr-ty ${TYPE[o.t][1]}">${TYPE[o.t][0]}</span><span class="n"><b>${esc(cmpOf(o))}</b><small><span class="tg-no">${o.r.no}</span> ${esc(o.r.cust)}</small></span><span class="m ${sev(lostOf(o))}">+${hm(lostOf(o))}<small>${h1(o.q)} quoted</small></span></button>`).join(''):'<div class="mg-none">Nothing ran over — every job inside its quote.</div>'}</div></div>`; }
/* ---------- work: the ROs, and the operations on each ---------- */
function wGroups(){ const [a,b]=W(), R=rosIn(a,b), G=[];
  if(R.open.length) G.push(['Open now',R.open.map(([r,O])=>({r,O,open:1}))]);
  const C=R.closed.map(([r,O])=>({r,O})).sort((p,q)=>p.r.close<q.r.close?1:-1), wk=k=>wStart(k);
  const by=new Map(); C.forEach(x=>{ const w=wk(x.r.close); if(!by.has(w)) by.set(w,[]); by.get(w).push(x); });
  [...by.entries()].forEach(([w,L])=>G.push([w===wStart(TODAY)?'This week':w===addD(wStart(TODAY),-7)?'Last week':'Week of '+fd(w),L]));
  return G; }
const wFlat=()=>wGroups().flatMap(g=>g[1]);
function wList(){ const G=wGroups(), n=G.reduce((s,g)=>s+g[1].length,0);
  if(!U.sel||!wFlat().some(x=>x.r.no===U.sel)) U.sel=(wFlat()[0]||{r:{}}).r.no||null;
  const it=x=>{ const q=sum(x.O,o=>o.q), b=sum(x.O,o=>o.b), l=b-q, on=x.r.no===U.sel; return `<div class="tg-it cr-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-ro="${x.r.no}"><span class="cr-rail ${x.open?'op':sev(l)}"></span><span class="tg-t"><span class="tg-no">${x.r.no}</span><b>${esc(x.r.cust)}</b>${x.r.cb&&!x.open?'<span class="ib-k late">came back</span>':''}</span><span class="tg-w">${esc(cmpOf(x.O.find(o=>o.t!=='diag')||x.O[0]))}${x.O.length>1?' · +'+(x.O.length-1):''}</span><span class="cr-m">${x.open?`<small>${esc(x.r.status)}</small>`:`<b class="${sev(l)}">${b?Math.round(q/b*100)+'%':'—'}</b><small>${h1(q)} / ${h1(b)} h</small>`}</span></div>`; };
  return `<section class="tg-list"><div class="tg-lh">Your ROs<span class="n">${n}</span></div><div class="ib-lh2"><small style="font-size:12px;color:var(--tg-ink3)">${per(U.p).n} · ${per(U.p).s}</small></div><div class="tg-scroll">${G.map(([g,L])=>`<div class="tg-grp">${g}<span>${L.length}</span></div>`+L.map(it).join('')).join('')||'<div class="tg-empty"><h3>Nothing here</h3><p>No ROs with your time in this period.</p></div>'}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('1')}${kbd('2')}views</span><span>${kbd('D')}${kbd('W')}${kbd('M')}${kbd('Q')}${kbd('Y')}${kbd('A')}period</span></div></section>`; }
function wDetail(){ const x=wFlat().find(y=>y.r.no===U.sel); if(!x) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('ros',22)}</span><h3>Pick an RO</h3><p>Your operations on it, quoted against clocked.</p></div></div>`;
  const r=x.r, O=x.O, q=sum(O,o=>o.q), b=sum(O,o=>o.b), others=r.ops.filter(o=>o.tech!==U.who);
  const D=[]; for(let k=r.open;k<=minK(r.close,TODAY);k=addD(k,1)) if(wf(k)) D.push(k); if(!D.length) D.push(r.open);
  const SCH=new Map(); (()=>{ let di=0, used=0; O.forEach((o,i)=>{ const st=Math.min(D.length-1,Math.max(di,Math.floor(i*D.length/O.length))); if(st>di){ di=st; used=0; } let left=o.b; const L=[]; while(left>0.05){ const room=Math.max(0.3,4-used), t=Math.min(left,room); L.push([D[Math.min(di,D.length-1)],t]); left-=t; used+=t; if(left>0.05){ di=Math.min(D.length-1,di+1); used=0; if(di===D.length-1){ L.push([D[di],left]); left=0; } } } SCH.set(o,L.reduce((A,x)=>{ const f=A.find(y=>y[0]===x[0]); if(f) f[1]+=x[1]; else A.push([x[0],x[1]]); return A; },[])); }); })();
  const days=o=>SCH.get(o);
  return `<div class="mg-pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic('ros',13)}${x.open?esc(r.status):'Closed '+fd(r.close)}</span><span>${esc(r.truck)} · ${PAY[r.pay]} · opened ${fd(r.open)}</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="In Parsec this opens RO ${r.no}.">${ic('ros',14)}Open RO</button></div><h2><span class="tg-no" style="font-size:20px;margin-right:8px">${r.no}</span>${esc(r.cust)}</h2>
    <div class="cr-facts"><span><small>Sold</small><b>${h1(q)} h</b></span><span><small>Clocked</small><b>${h1(b)} h</b></span><span><small>Efficiency</small><b class="${sev(b-q)}">${b?Math.round(q/b*100)+'%':'—'}</b></span><span><small>${b>q?'Over quote':'Under quote'}</small><b class="${sev(b-q)}">${b>q?'+':'−'}${hm(b-q)}</b></span><span><small>Your operations</small><b>${O.length} of ${r.ops.length}</b></span></div></div>
   <div class="mg-pad">${r.cb&&!x.open?`<div class="ib-esc">${ic('undo',13)}<span>This truck came back ${r.cb} days later with the same complaint — Fixes has it with the first fix.</span></div>`:''}
    ${O.map(o=>{ const l=lostOf(o), sv=sev(l), mx=Math.max(o.q,o.b)*1.15, pq=o.q/mx*100, pb=Math.min(o.b,o.q)/mx*100, po=Math.max(0,o.b-o.q)/mx*100;
      return `<div class="cr-job ${sv}"><div class="h"><span class="cr-ty ${TYPE[o.t][1]}">${TYPE[o.t][0]}</span><b>${esc(cmpOf(o))}</b>${o.fixU?`<span class="ib-k auto">${ic('fixes',11)} used a past fix</span>`:o.fixA?'<span class="ib-k rem">past fix not used</span>':''}<span class="sp"></span><span class="eff ${sv}">${Math.round(o.q/o.b*100)}%</span></div>
        <div class="cr-bar"><span class="tr"><i class="b" style="width:${pb.toFixed(1)}%"></i>${po?`<i class="o ${sv}" style="left:${pq.toFixed(1)}%;width:${po.toFixed(1)}%"></i>`:''}<em style="left:${pq.toFixed(1)}%"></em></span><span class="nums"><span>Quoted <b>${h1(o.q)} h</b><small>${hm(o.q)}</small></span><span>Burnt <b>${h1(o.b)} h</b><small>${hm(o.b)}</small></span><span>${l>0?'Over':'Remaining'} <b class="${sv}">${h1(Math.abs(l))} h</b><small>${hm(l)}</small></span></span></div>
        <div class="cr-days">${days(o).map(d=>`<span>${DW[dOf(d[0]).getDay()].slice(0,3)} ${md(d[0])} · ${h1(d[1])} h</span>`).join('')}</div></div>`; }).join('')}
    ${others.length?`<div class="mg-card"><div class="mg-ch"><b>Others on this RO</b><small>not in your numbers</small></div><div class="mg-cb">${others.map(o=>`<div class="ib-sl"><span class="cr-ty ${TYPE[o.t][1]}">${TYPE[o.t][0]}</span><span>${esc(cmpOf(o))}</span><small>${PPL[o.tech]} · ${h1(o.q)} / ${h1(o.b)} h</small></div>`).join('')}</div></div>`:''}</div></div>`; }
/* ---------- popovers ---------- */
function pop(){ const p=U.pop; if(!p) return '';
  if(p.type==='per') return `<div class="tg-pop menu mg-pop-w">${PERS.concat(['all']).map(x=>{ const o=per(x); return `${x==='wk'||x==='mo'||x==='qt'||x==='yr'||x==='all'?'<div class="mg-psep"></div>':''}<button class="tg-mi${U.p===x?' on':''}" data-a="pset" data-v="${x}">${x==='all'?kbd('A'):PKEY[x]?kbd(PKEY[x]):'<span class="tg-kbd" style="visibility:hidden">·</span>'}${o.n}<span class="meta">${x==='all'?'since Jan 2025':o.s}</span></button>`; }).join('')}<div class="tg-pft">${ic('info',12)}Calendar periods — the same ones the Manager page uses.</div></div>`;
  if(p.type==='chk'){ const L=(CHK[U.who]||[]).filter(c=>U.chk[c[0]]);
    return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>To fix in the Time Log</b><span class="cu">your numbers trip on these</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>${L.length?L.map(c=>`<div class="mg-chk"><span class="gi">${ic(c[1],14)}</span><b>${c[2]}</b><p>${c[3]}</p><div class="r"><button class="btn btn-sm" data-a="fix" data-c="${c[0]}">${c[4]}</button></div></div>`).join(''):`<div class="mg-none">${ic('check',14)} All clean.</div>`}</div>`; }
  return ''; }
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a;
  if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; render(); return; } openPop(t.dataset.p,{},t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='pset'){ U.p=t.dataset.v; U.pop=null; render(); }
  else if(a==='sel'){ U.sel=t.dataset.ro; U.kb=false; render(); }
  else if(a==='go'){ U.view='work'; U.sel=t.dataset.ro; render(); const it=$('.tg-scroll .tg-it.on'), sc=$('.tg-scroll'); if(it&&sc) sc.scrollTop=it.offsetTop-120; }
  else if(a==='fix'){ U.chk[t.dataset.c]=0; toast('Fixed in the Time Log — your numbers count it again.'); render(); }
  else if(a==='toast'){ toast(t.dataset.t); render(); }
});
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.cr').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-300)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"]')){ U.pop=null; render(); } },true);
addEventListener('keydown',e=>{ const k=e.key; if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select')) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  if(U.pop){ if(k==='Escape'){ U.pop=null; render(); return stop(); } if(U.pop.type==='per'){ const i='dwmqya'.indexOf(k); if(i>=0){ U.p=['day','wk','mo','qt','yr','all'][i]; U.pop=null; render(); return stop(); } } return; }
  if((k==='j'||k==='k')&&U.view==='work'){ const L=wFlat(), i=L.findIndex(x=>x.r.no===U.sel); const n=L[Math.max(0,Math.min(L.length-1,i+(k==='j'?1:-1)))]; if(n){ U.sel=n.r.no; U.kb=true; render(); } return stop(); }
  const i='dwmqya'.indexOf(k); if(i>=0){ U.p=['day','wk','mo','qt','yr','all'][i]; render(); return stop(); }
  if(k==='1'||k==='2'){ U.view=k==='1'?'ov':'work'; render(); return stop(); }
});
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W_=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); } else { x=W_-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W_-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; } }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
function setWho(w){ reset(w); $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===w)); }
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ const p=U.p, v=U.view; setWho(b.dataset.role); U.p=p; U.view=v; $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); render(); }));
const DEMO={
  ov:()=>{setWho('MR');render();},
  yr:()=>{setWho('MR');U.p='yr';render();},
  all:()=>{setWho('MR');U.p='all';render();},
  work:()=>{setWho('MR');U.view='work';render();},
  over:()=>{setWho('MR');const [a,b]=W(); const o=opsIn(a,b).filter(o=>lostOf(o)>0).sort((p,q)=>lostOf(q)-lostOf(p))[0]; U.view='work'; U.sel=o?o.r.no:null; render(); const it=$('.tg-scroll .tg-it.on'), sc=$('.tg-scroll'); if(it&&sc) sc.scrollTop=it.offsetTop-120;},
  chk:()=>{setWho('MR');render();openPop('chk',{},$('[data-a="pop"][data-p="chk"]'));},
  per:()=>{setWho('MR');render();openPop('per',{},$('[data-a="pop"][data-p="per"]'));},
  new:()=>{setWho('AW');render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{setWho(U.who);$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__cr={U:()=>U,render,setWho,DEMO,wFlat,kv,KM};
setWho('MR'); render();
