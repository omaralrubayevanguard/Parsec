/* ---------- what the page holds besides the numbers ---------- */
const PINS0=['sales','sold','eff','prod','aro','cls','wip','days','cb','apr','wpn','fill'];
const NEEDS0=[
 {id:'n1',ic:'warranty',h:'Write-off sign-off',p:'<b>37466 Uwharrie Fuel</b> — claim rejected; $412.60 is over your $250 limit. Grace asks.',a:[['Sign off','ok','Signed off — $412.60 written off on 37466. Grace sees it on Warranty.'],['Ask Grace','','Sent to Grace — “What did Volvo say on 37466?”']]},
 {id:'n2',ic:'dollar',h:'Goodwill ask',p:'<b>37519 Dixie Fleet Services</b> — Alicia asks $380 goodwill on a comeback, 6 days after the first fix.',a:[['Approve','ok','Goodwill approved — $380 on 37519. Alicia sees it on Triage.'],['Decline','','Declined — Alicia gets a note to call the customer.']]},
 {id:'n3',ic:'undo',h:'Comeback',p:'<b>37795 Haw River Dairy</b> is back 29 days after RO 37482 with the same complaint. Frank has it.',a:[['See it','go:cb','']]},
 {id:'n4',ic:'clock',h:'Over hold goal',p:'<b>3 ROs with Parts</b> past the 4 h goal — the longest has waited 2 d 3 h.',a:[['See Flow','go:flow','']]},
 {id:'n5',ic:'fixes',h:'Fix reviews',p:'<b>4 fixes</b> waiting for a review in Fixes — you’re one of the reviewers.',a:[['Open Fixes','','In Parsec this opens Fixes → Review.']]}];
const RT={tech:['TE','Technician','var(--tg-st-working)'],writer:['AP','Approval','var(--tg-st-customer)'],parts:['PT','Parts','var(--tg-st-waiting)'],foreman:['FM','Foreman','var(--tg-acc)'],manager:['MG','Manager','var(--tg-st-support)'],warranty:['WA','Warranty','var(--tg-st-problem)']};
const RULES0=[{k:'checkin',when:'Check-in done',to:'foreman',m:'ask'},{k:'diag',when:'Diag done — cause on every operation',to:'writer',m:'ask'},{k:'approval',when:'Approval done',to:'parts',m:'ask'},{k:'parts',when:'All parts received',to:'foreman',m:'ask'},{k:'roadtest',when:'Road test passed',to:'manager',m:'off'},{k:'closeout',when:'Close-out done · warranty work',to:'warranty',m:'ask'}];
const GOALS0={tech:360,writer:240,parts:240,foreman:120,manager:180,warranty:1440};
const HOLD=(()=>{ const r2=rng('holds'), L=ROS.filter(r=>r.close>TODAY), H=[]; const span={tech:[30,520],writer:[20,380],parts:[60,3100],foreman:[10,240],manager:[30,260],warranty:[200,2600]};
  L.forEach((r,i)=>{ let to={'Checked in':'foreman','Diagnosing':'tech','In progress':'tech','Waiting approval':'writer','Waiting on parts':'parts','Warranty auth':'warranty','Road test':'foreman'}[r.status]||'tech'; if(i===5||i===11) to='manager';
    const s=span[to], min=Math.round(s[0]+Math.pow(r2(),1.6)*(s[1]-s[0])); H.push({r,to,min,pend:r2()<.18,pm:Math.round(2+r2()*30)}); });
  return H; })();
const NAV=[['console','Console'],['ros','Repair Orders'],['warranty','Warranty'],['fixes','Fixes'],['foreman','Foreman'],['manager','Manager'],['triage','Triage'],['rolist','RO List'],['timelog','Time Log'],['parts','Parts'],['career','Career']];
const NAVIC={rolist:'ros'};
const ROLES={'Technician':['console','ros','fixes','timelog','parts','career'],'Foreman':['console','ros','fixes','foreman','triage','timelog','parts','career'],'Manager':['console','ros','warranty','fixes','foreman','manager','triage','timelog','parts','career'],'Service writer':['ros','warranty','fixes','triage','parts'],'Warranty admin':['ros','warranty','fixes','parts'],'Triage':['ros','triage'],'Parts':['ros','parts']};
const STAFF0=[['MR','Technician'],['DK','Technician'],['LM','Technician'],['PS','Technician'],['AW','Technician'],['KT','Technician'],['FD','Foreman'],['AM','Service writer'],['JT','Service writer'],['BO','Parts'],['GP','Warranty admin'],['RH','Manager']];
const DEPT={'Technician':'Technicians','Foreman':'Shop floor','Service writer':'Service advisors','Parts':'Parts','Warranty admin':'Warranty','Manager':'Management','Triage':'Triage'};
const ROLEK={'Technician':['eff','prod','sold','cb'],'Foreman':['eff','fc','cb','days'],'Service writer':['apr','aw','ont','dec'],'Parts':['fill','pw','bko','rcr'],'Warranty admin':['wpn','wrj','wdp','wcl'],'Manager':['sales','eff','cb','apr']};
const AL0=(()=>{ const r3=rng('audit'), L=[], ty=[['status','flag','set status'],['release','check','released'],['checkin','keyTag','checked in'],['estimate','send','sent the estimate on'],['handoff','swap','handed off'],['signin','user','signed in'],['staff','manager','changed page access for'],['delete','trash','deleted a punch on']];
  const who=['AM','JT','FD','BO','GP','MR','DK','LM','PS','AW','KT','RH']; const RS=ROS.filter(r=>r.open>=addD(TODAY,-6));
  for(let i=0;i<34;i++){ const WT=[6,4,4,3,5,4,1,1], tot=WT.reduce((x,y)=>x+y,0); let z=r3()*tot, ti=0; while(z>WT[ti]){ z-=WT[ti]; ti++; } const t=ty[ti], BY={status:['MR','DK','LM','PS','AW','KT','FD'],release:['AM','JT'],checkin:['AM','JT'],estimate:['AM','JT'],handoff:['AM','JT','FD','BO','GP','MR','KT'],signin:who,staff:['RH'],delete:['FD','RH']}[t[0]], w=BY[Math.floor(r3()*BY.length)], r=RS[Math.floor(r3()*RS.length)];
    const day=i<19?TODAY:addD(TODAY,-1), m=i<19?(14*60+12)-i*17:(17*60+30)-(i-19)*29;
    const text=t[0]==='status'?['Waiting on parts','In progress','Road test','Diagnosing'][i%4]:t[0]==='handoff'?'to '+['Parts','Foreman','Approval','Warranty'][i%4]:t[0]==='signin'?'on the shop computer':t[0]==='staff'?PPL[['AW','JT','BO'][i%3]]+' — '+['Fixes on','Warranty off','Triage on'][i%3]:'';
    L.push({day,m,ty:t[0],ic:t[1],verb:t[2],by:w,ro:t[0]==='signin'||t[0]==='staff'?null:r.no,cust:r.cust,text}); }
  return L; })();

let U, UNDO, TOAST, TT;
function reset(){ MEMO.forEach((v,k)=>{ if(k.startsWith('v|')) MEMO.delete(k); });
  U={view:'ov',p:'w',sel:'eff',bf:null,bk:null,brk:{},pins:PINS0.slice(),ed:false,pop:null,kb:false,lf:'all',q:'',tg:{},needs:NEEDS0.map(n=>n.id),flow:'parts',rules:JSON.parse(JSON.stringify(RULES0)),goals:Object.assign({},GOALS0),acc:true,person:'MR',pages:Object.fromEntries(STAFF0.map(([k,r])=>[k,Object.fromEntries(ROLES[r].map(p=>[p,1]))])),roles:Object.fromEntries(STAFF0),alf:'all',alw:'',nall:false};
  UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify({tg:U.tg,pins:U.pins,needs:U.needs,rules:U.rules,goals:U.goals,pages:U.pages,roles:U.roles,acc:U.acc})); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const W=()=>win(U.p), PW=()=>pwin(U.p);
const isSum=k=>['sold','clk','lost','unap','sales','lab','prt','dec','wo','opn','cls','wcl','wpd'].includes(k.id);
function kv(k,F){ const [a,b]=W(), [pa,pb]=PW(); const v=val(k,a,b,F), pv=val(k,pa,pb,F); const X=ctx(a,b,F), t=tgt(k,X); return {v,pv,t,dl:delta(k,v,pv),ok:t==null||v==null?null:k.d>=0?v>=t:v<=t,X}; }
function tgtTxt(k,o){ if(o.t==null) return ''; const word=k.d>=0?'under':'over', gn=Math.abs(Math.round(o.v-o.t)), gap=k.u==='pct'?gn+(gn===1?' pt':' pts'):fmt(k.u,Math.abs(o.v-o.t));
  return o.ok?`<span class="mg-tgt ok">${ic('check',12)}On target · ${fmt(k.u,o.t)}</span>`:`<span class="mg-tgt off">${ic('flag',12)}${gap} ${word} ${fmt(k.u,o.t)}</span>`; }
function sparkSvg(k,w=72,h=26,F){ const L=spark(U.p).map(x=>val(k,x.a,x.b,F)); const V=L.filter(v=>v!=null); if(V.length<2) return `<svg class="spk" width="${w}" height="${h}"></svg>`;
  let lo=Math.min(...V), hi=Math.max(...V); if(hi-lo<1e-6){ hi+=1; lo-=1; } const x=i=>2+i*(w-4)/(L.length-1), y=v=>h-3-(v-lo)/(hi-lo)*(h-6);
  const pts=L.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
  return `<svg class="spk mg-svg" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--tg-ink4)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="3" fill="var(--tg-acc)"/></svg>`; }

/* ---------- drawing ---------- */
let RENDERING=false;
function render(){ if(RENDERING) return; RENDERING=true; try{ draw(); } finally{ RENDERING=false; } }
function draw(){
  const v=U.view, body=v==='kpi'?vKpi():v==='flow'?vFlow():v==='team'?vTeam():v==='act'?vAct():vOv();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='manager'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg mg">${head()}<div class="tg-body v-${v}">${v==='kpi'?kList():v==='team'?pList():''}<div class="tg-main">${body}</div>${pop()}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const nOpen=openAt(TODAY).length, nd=U.needs.length, s=kv(KM.sales), e=kv(KM.eff);
  const vs=[['ov','grid','Overview'],['kpi','chart','KPIs'],['flow','swap','Flow'],['team','users','Team'],['act','history','Activity']];
  return `<header class="tg-head"><h1 class="tg-h1">Manager</h1><span class="tg-facts"><button class="tg-hf" data-a="sel" data-k="wip" data-go="1"><b>${nOpen}</b>open ROs</button><i>·</i>${nd?`<button class="tg-hf w" data-a="view" data-v="ov"><b>${nd}</b>need you</button><i>·</i>`:''}<button class="tg-hf" data-a="sel" data-k="sales" data-go="1"><b>${fmt('usd',s.v)}</b>sales</button><i>·</i><button class="tg-hf" data-a="sel" data-k="eff" data-go="1"><b>${fmt('pct',e.v)}</b>efficiency</button></span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn btn-sm mg-perb" data-a="pop" data-p="per" title="Period (D · W · M · Q)" style="height:30px">${ic('clock',14)}${PER[U.p][0]}${ic('chevD',13)}</button><button class="btn ib tg-srch-b" data-a="pop" data-p="find" title="Find a KPI (/)">${ic('search',16)}</button></header>`;
}
/* ---------- overview ---------- */
function vOv(){
  const N=U.needs.map(id=>NEEDS0.find(n=>n.id===id)), [a,b]=W();
  let h=`<div class="mg-full" data-scroll="ov"><div class="mg-sec">Needs you${N.length?`<span class="mg-n w">${N.length}</span>`:''}<span class="sp"></span>${N.length>4?`<button class="btn btn-sm tg-gh" data-a="nall">${U.nall?'Show 4':'+'+(N.length-4)+' more'}</button>`:''}</div>`;
  h+=N.length?`<div class="mg-needs">${N.slice(0,U.nall?99:4).map(n=>`<div class="mg-nd"><div class="h">${ic(n.ic,14)}${n.h}</div><p>${n.p}</p><div class="a">${n.a.map((x,i)=>`<button class="btn btn-sm${i===0?' btn-primary':''}" data-a="nd" data-id="${n.id}" data-i="${i}">${x[0]}</button>`).join('')}</div></div>`).join('')}</div>`
    :`<div class="mg-clear">${ic('check',16)}Nothing needs you right now — sign-offs, goodwill asks, comebacks and late hand-offs land here.</div>`;
  h+=`<div class="mg-sec">Pinned<span>${PER[U.p][0]} · ${PER[U.p][1]}</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="ed">${U.ed?ic('check',13)+'Done':ic('pencil',13)+'Edit tiles'}</button><button class="btn btn-sm tg-gh" data-a="view" data-v="kpi">${ic('chart',13)}All ${K.length} KPIs</button></div>`;
  h+=`<div class="mg-tiles${U.ed?' ed':''}">${U.pins.map(id=>tile(KM[id])).join('')}${U.ed?`<button class="mg-addt" data-a="pop" data-p="add">${ic('plus',18)}Add a tile</button>`:''}</div>`;
  h+=`<div class="mg-sec">The shop<span>today and the last two weeks</span></div><div class="mg-two"><div class="mg-card"><div class="mg-ch"><b>Hours, last 14 days</b><small>on ROs and unapplied, per day</small><span class="sp"></span><span class="mg-leg"><span><i></i>On ROs</span><span><i class="un"></i>Unapplied</span></span></div><div class="mg-cb">${hoursChart(694)}</div></div>${openCard()}</div></div>`;
  return h; }
function tile(k){ const o=kv(k);
  return `<button class="mg-tile" data-a="${U.ed?'noop':'sel'}" data-k="${k.id}" data-go="1" data-tip="${esc(k.n)}|${esc(k.how)}"><span class="l"><span>${k.n}</span>${k.snap?'<span class="now">right now</span>':''}</span><span class="v">${fmt(k.u,o.v)}</span>${sparkSvg(k,76,28)}<span class="r"><span class="mg-d ${o.dl.cl}">${o.dl.s}</span><span class="sp"></span>${o.t!=null?(o.ok?`<span class="mg-tgt ok">${ic('check',11)}target ${fmt(k.u,o.t)}</span>`:`<span class="mg-tgt off">${ic('flag',11)}target ${fmt(k.u,o.t)}</span>`):''}</span>${U.ed?`<span class="x" data-a="tx" data-k="${k.id}" title="Remove">${ic('x',12)}</span>`:''}</button>`; }
function hoursChart(w){ const L=[]; let k=TODAY; while(L.length<14){ if(wf(k)) L.unshift(k); k=addD(k,-1); }
  const V=L.map(d=>{ let b=0,a=0; TECHS.forEach(t=>{ b+=TB[t][d]||0; a+=ATT[t][d]||0; }); return {d,b,u:Math.max(0,a-b),a}; });
  const H=170, pl=34, pb=22, pt=8, mx=Math.ceil(Math.max(...V.map(x=>x.a))/10)*10, iw=w-pl-4, st=iw/L.length, bw=Math.min(22,st*.6), y=v=>pt+(H-pt-pb)*(1-v/mx);
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`; for(let g=0;g<=mx;g+=mx/4){ s+=`<line class="gl" x1="${pl}" x2="${w}" y1="${y(g)}" y2="${y(g)}"/><text class="ax" x="${pl-6}" y="${y(g)+3.5}" text-anchor="end">${Math.round(g)}</text>`; }
  V.forEach((x,i)=>{ const cx=pl+st*i+st/2, x0=cx-bw/2, yb=y(x.b), yu=y(x.b+x.u);
    s+=`<path class="bar" d="M${x0},${y(0)}V${yb}H${x0+bw}V${y(0)}Z"/>`;
    if(x.u>.05) s+=`<path class="bar un" d="${rtop(x0,yu,bw,Math.max(0,yb-2-yu))}"/>`;
    s+=`<text class="ax" x="${cx}" y="${H-6}" text-anchor="middle">${i%2?'':md(x.d)}</text><rect class="hit" x="${cx-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" data-a="sel" data-k="unap" data-go="1" data-tip="${DW[dOf(x.d).getDay()]} ${fd(x.d)}|On ROs::${h1(x.b)} h|Unapplied::${h1(x.u)} h|On the clock::${h1(x.a)} h"/>`; });
  return s+'</svg>'; }
const rtop=(x,y,w,h)=>{ const r=Math.min(4,h,w/2); return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`; };
function openCard(){ const O=openAt(TODAY), C={}; O.forEach(r=>{ C[r.status]=(C[r.status]||0)+1; }); const S=Object.keys(ST_COL).filter(s=>C[s]);
  const A=[0,0,0,0,0]; O.forEach(r=>{ const d=dd(r.open,TODAY); A[d<=1?0:d<=3?1:d<=7?2:d<=14?3:4]++; }); const am=Math.max(1,...A), AL=['0–1 d','2–3 d','4–7 d','8–14 d','15+ d'];
  return `<div class="mg-card"><div class="mg-ch"><b>Open work</b><small>${O.length} ROs by status, and how long they’ve been open</small></div><div class="mg-cb"><div class="mg-stack">${S.map(s=>`<i style="flex:${C[s]};background:${ST_COL[s]}" data-tip="${s}|${C[s]} RO${C[s]>1?'s':''}"></i>`).join('')}</div>
    <div class="mg-lg2">${S.map(s=>`<span data-a="sel" data-k="wip" data-go="1"><i style="background:${ST_COL[s]}"></i>${s}<b>${C[s]}</b></span>`).join('')}</div>
    <div class="mg-age">${A.map((n,i)=>`<div class="${i>=3&&n?'w':''}" data-a="sel" data-k="days" data-go="1" data-tip="${AL[i]} open|${n} RO${n===1?'':'s'}${i>=3?' · over a week':''}"><b>${n}</b><span class="c" style="height:${Math.round(n/am*70)}px"></span><small>${AL[i]}${i===3&&n?' · late':''}</small></div>`).join('')}</div></div></div>`; }
/* ---------- the KPI list ---------- */
function kRows(){ let L=K.slice(); const q=U.q.trim().toLowerCase();
  if(q) L=L.filter(k=>(k.n+' '+CAT[k.c][0]+' '+k.how).toLowerCase().includes(q));
  if(U.lf==='pin') L=L.filter(k=>U.pins.includes(k.id)); else if(U.lf==='off') L=L.filter(k=>kv(k).ok===false);
  return L; }
function kList(){ const L=kRows(), nOff=K.filter(k=>kv(k).ok===false).length;
  const item=k=>{ const o=kv(k), on=k.id===U.sel;
    return `<div class="tg-it mg-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-k="${k.id}"><span class="tg-t"><b>${k.n}</b>${U.pins.includes(k.id)?`<span class="pin" title="Pinned to Overview">${ic('pin',12)}</span>`:''}</span><span class="tg-w"><span class="mg-d ${o.dl.cl}">${o.dl.s}</span>${o.t!=null?`<span class="${o.ok?'':'off'}">· ${o.ok?'on target':'target '+fmt(k.u,o.t)}</span>`:''}</span>${sparkSvg(k,64,24)}<span class="v${o.ok===false?' off':''}">${fmt(k.u,o.v)}${k.snap?'<small>now</small>':''}</span></div>`; };
  const body=Object.keys(CAT).map(c=>{ const X=L.filter(k=>k.c===c); return X.length?`<div class="tg-grp">${CAT[c][0]}<span>${X.length}</span></div>`+X.map(item).join(''):''; }).join('')||`<div class="tg-empty"><span class="tg-ring0">${ic('chart',22)}</span><h3>Nothing here</h3><p>No KPI matches.</p></div>`;
  return `<section class="tg-list"><div class="tg-lh">KPIs<span class="n">${K.length}</span></div><div class="mg-srin">${ic('search',14)}<input id="mg-lq" placeholder="Find a KPI — hours, comeback, parts…" value="${esc(U.q)}" autocomplete="off"></div><div class="mg-lh2"><span class="tg-seg3">${[['all','All'],['pin','Pinned · '+U.pins.length],['off','Off target · '+nOff]].map(x=>`<button class="${U.lf===x[0]?'on':''}" data-a="lf" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div><div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('P')}pin</span><span>${kbd('T')}target</span><span>${kbd('D')}${kbd('W')}${kbd('M')}${kbd('Q')}period</span><span>${kbd('/')}find</span></div></section>`; }
/* ---------- one KPI ---------- */
function bfName(F){ if(!F) return ''; return F.k==='tech'?PPL[F.v]:F.k==='pay'?PAY[F.v]:F.k==='type'?OPT[F.v]:F.v; }
function vKpi(){ const k=KM[U.sel]; const F=U.bf, o=kv(k,F), [a,b]=W(), B=chartB(), bk=U.bk!=null?B.cur[U.bk]:null;
  const pin=U.pins.includes(k.id);
  let h=`<div class="mg-pane" data-scroll="pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic(CAT[k.c][1],13)}${CAT[k.c][0]}</span><span>${k.snap?'A count at the end of the period':'Over the period'} · ${PER[U.p][0].toLowerCase()}</span><span class="sp"></span><button class="btn btn-sm" data-a="pin" data-k="${k.id}" title="P">${ic('pin',14)}${pin?'Pinned':'Pin to Overview'}</button><button class="btn btn-sm" data-a="pop" data-p="tgt" data-k="${k.id}" title="T">${ic('flag',14)}${tgtBase(k)!=null?'Target':'Set a target'}</button><button class="btn btn-sm" data-a="toast" data-t="The KPI sheet prints — the number, the trend, the breakdown and the ROs behind it.">${ic('print',14)}Print</button></div><h2>${k.n}</h2>
    <div class="mg-hero"><span class="big">${fmt(k.u,o.v,1)}${k.snap?'<small>right now</small>':''}</span><span class="meta"><span class="mg-d ${o.dl.cl}">${o.dl.s}<small>${PER[U.p][1]} · ${fmt(k.u,o.pv,1)}</small></span>${o.t!=null?tgtTxt(k,o):`<span class="mg-tgt">${ic('flag',12)}No target</span>`}</span><span class="sp" style="flex:1"></span>${F?`<button class="mg-fchip" data-a="bfx">${esc(bfName(F))}${ic('x',12)}</button>`:''}</div>
    <div class="mg-how">${ic('info',13)}<span>${k.how}</span><span class="src">${k.src.map(s=>`<span>${s}</span>`).join('')}</span></div></div>
   <div class="mg-pad"><div class="mg-card"><div class="mg-ch"><b>Trend</b><small>${U.p==='day'?'last 14 days — today on the right':U.p==='q'?'by week':'by day'}${bk?' · '+bk.t+' picked':''}</small><span class="sp"></span><span class="mg-leg"><span><i></i>${U.p==='day'?'Each day':'This period'}</span>${B.prev?'<span><i class="ln"></i>The period before</span>':''}${tgtBase(k)!=null?'<span><i class="tl"></i>Target</span>':''}</span>${bk?`<button class="btn btn-sm tg-gh" data-a="bkx">${ic('x',12)}Clear day</button>`:''}</div><div class="mg-cb">${trend(k,B,888)}</div></div>
   <div class="mg-bot">${brCard(k)}${drillCard(k,bk)}</div></div></div>`;
  return h; }
function chartB(){ const cur=buckets(U.p); if(U.p==='day') return {cur,prev:null}; const sh=U.p==='w'?7:U.p==='m'?30:91; return {cur,prev:buckets(U.p,sh)}; }
function trend(k,B,w){ const F=U.bf, C=B.cur, V=C.map(x=>val(k,x.a,x.b,F)), PV=B.prev?B.prev.map(x=>val(k,x.a,x.b,F)):null, bar=isSum(k), tb=tgtBase(k);
  const TV=C.map(x=>tb==null?null:k.tw!=null?tb*ctx(x.a,x.b).wd:tb);
  const all=V.concat(PV||[]).concat(TV).filter(v=>v!=null); const H=200, pl=48, pr=70, pt=10, pb=24;
  let lo=0, hi=Math.max(1e-6,...all)*1.1; if(!bar){ const mn=Math.min(...all); lo=Math.max(0,mn-(hi/1.1-mn)*.6); if(k.u==='pct') lo=Math.floor(lo/10)*10; }
  const nice=v=>{ const p=Math.pow(10,Math.floor(Math.log10(v))), m=v/p; return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p; }; const step=nice((hi-lo)/4); hi=lo+step*Math.ceil((hi-lo)/step);
  const iw=w-pl-pr, st=iw/C.length, y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo)), cx=i=>pl+st*i+st/2, bw=Math.min(26,st*.62);
  const ax=v=>k.u==='pct'?Math.round(v)+'%':k.u==='usd'?(v>=1000?'$'+(v/1000).toFixed(v>=10000||v%1000===0?0:1)+'k':'$'+Math.round(v)):k.u==='n'?Math.round(v):(v%1?v.toFixed(1):v);
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`;
  for(let g=lo;g<=hi+1e-9;g+=step) s+=`<line class="gl" x1="${pl}" x2="${w-pr+8}" y1="${y(g).toFixed(1)}" y2="${y(g).toFixed(1)}"/><text class="ax" x="${pl-8}" y="${(y(g)+3.5).toFixed(1)}" text-anchor="end">${ax(g)}</text>`;
  const every=C.length>16?3:C.length>9?2:1, sel=U.bk;
  if(sel!=null) s+=`<rect class="sel" x="${cx(sel)-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" rx="6"/>`;
  if(bar){ V.forEach((v,i)=>{ if(v==null||v<=0) return; const x0=cx(i)-bw/2; s+=`<path class="bar${sel!=null&&sel!==i?' dim':''}${U.p==='day'&&i===C.length-1?' now':''}" d="${rtop(x0,y(v),bw,y(lo)-y(v))}"/>`; });
    TV.forEach((t,i)=>{ if(t==null||!V[i]&&V[i]!==0) return; s+=`<line class="tk" x1="${cx(i)-bw/2-3}" x2="${cx(i)+bw/2+3}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke-dasharray="3 2"/>`; }); }
  else { const pts=V.map((v,i)=>v==null?null:[cx(i),y(v)]); const seg=[]; let cur=[]; pts.forEach(p=>{ if(p) cur.push(p); else if(cur.length){ seg.push(cur); cur=[]; } }); if(cur.length) seg.push(cur);
    seg.forEach(L=>{ if(L.length>1) s+=`<path class="ar" d="M${L[0][0]},${y(lo)}L${L.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L')}L${L[L.length-1][0]},${y(lo)}Z"/><polyline class="ln" points="${L.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`; });
    if(tb!=null) s+=`<line class="tl" x1="${pl}" x2="${w-pr+8}" y1="${y(tb).toFixed(1)}" y2="${y(tb).toFixed(1)}"/><text class="tlab" x="${w-pr+12}" y="${(y(tb)+3.5).toFixed(1)}">Target ${fmt(k.u,tb)}</text>`; }
  if(PV){ const pp=PV.map((v,i)=>v==null?null:[cx(i),y(v)]).filter(Boolean); if(pp.length>1) s+=`<polyline class="pv" points="${pp.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`; }
  if(!bar) V.forEach((v,i)=>{ if(v==null) return; if(C.length<=14||i===C.length-1||i===sel) s+=`<circle class="dt${sel!=null&&sel!==i?' dim':''}" cx="${cx(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4"/>`; });
  if(bar&&tb!=null) s+=`<text class="tlab" x="${w-pr+12}" y="${pt+10}">Target</text><text class="tlab" x="${w-pr+12}" y="${pt+24}" style="font-weight:400">${fmt(k.u,tb)}/day</text>`;
  C.forEach((x,i)=>{ if(i%every===(C.length-1)%every) s+=`<text class="ax" x="${cx(i).toFixed(1)}" y="${H-6}" text-anchor="middle"${U.p==='day'&&i===C.length-1?' style="fill:var(--tg-ink);font-weight:600"':''}>${U.p==='day'&&i===C.length-1?'Today':x.l}</text>`;
    const tip=[x.t.replace(/^./,c=>c.toUpperCase()),(U.p==='day'?'This day':'This period')+'::'+fmt(k.u,V[i],1)]; if(PV) tip.push('The period before::'+fmt(k.u,PV[i],1)); if(TV[i]!=null) tip.push('Target::'+fmt(k.u,TV[i],1)); tip.push('~Click to see the ROs behind it');
    s+=`<rect class="hit" x="${(cx(i)-st/2).toFixed(1)}" y="${pt}" width="${st.toFixed(1)}" height="${H-pt-pb}" data-a="bk" data-i="${i}" data-tip="${esc(tip.join('|'))}"/>`; });
  return s+'</svg>'; }
function brCard(k){ const keys=k.br; if(!keys.length) return `<div class="mg-card"><div class="mg-ch"><b>Breakdown</b></div><div class="mg-cb"><div class="mg-none" style="padding:4px 0">This one is the whole shop — no breakdown.</div></div></div>`;
  const key=U.brk[k.id]&&keys.includes(U.brk[k.id])?U.brk[k.id]:keys[0], [a,b]=W(), X=ctx(a,b), tb=tgtBase(k);
  const rows=brVals(key,X).map(([v,n])=>{ const F={k:key,v}, x=val(k,a,b,F), XX=ctx(a,b,F); const cnt=k.dr==='tech'?Math.round(XX.att)+' h on the clock':k.dr==='ops'?XX.ops.length+' ops':k.dr==='OP'?XX.OP.length+' opened':k.snap?'':XX.CL.length+' ROs'; const t=tb==null?null:k.tw!=null?tb*XX.wd*(key==='tech'?1/6:1):tb; return {v,n,x,cnt,t:k.tw!=null&&key!=='tech'?null:t}; }).filter(r=>r.x!=null&&(r.x!==0||k.d!==0||isSum(k)));
  rows.sort((p,q)=>isSum(k)||k.snap?q.x-p.x:k.d<0?q.x-p.x:p.x-q.x);
  const mx=Math.max(1e-6,...rows.map(r=>r.x),...rows.map(r=>r.t||0))*1.05;
  return `<div class="mg-card"><div class="mg-ch"><b>Breakdown</b><span class="sp"></span>${keys.length>1?`<span class="tg-seg3">${keys.map(x=>`<button class="${x===key?'on':''}" data-a="brk" data-v="${x}">${BRN[x].replace('By ','')}</button>`).join('')}</span>`:`<small>${BRN[key]}</small>`}</div><div class="mg-cb" style="padding-top:6px">
    ${rows.map(r=>{ const on=U.bf&&U.bf.k===key&&U.bf.v===r.v, off=r.t!=null&&(k.d>=0?r.x<r.t:r.x>r.t); return `<button class="mg-br${on?' on':''}" data-a="bf" data-f="${key}" data-v="${esc(r.v)}" data-tip="${esc(r.n)}|${esc(k.n)}::${fmt(k.u,r.x,1)}${r.cnt?'|'+r.cnt:''}|~${on?'Click to clear':'Click to see only this'}"><span class="n">${key==='tech'?`<span class="tg-av">${r.v}</span>`:''}<b>${esc(r.n)}</b><small>${r.cnt}</small></span><span class="b"><i style="width:${(r.x/mx*100).toFixed(1)}%"></i>${r.t!=null?`<em style="left:${(r.t/mx*100).toFixed(1)}%"></em>`:''}</span><span class="m${off?' off':''}">${fmt(k.u,r.x)}</span></button>`; }).join('')}
    <div class="mg-more" style="margin-top:8px">${ic('info',12)}<span>Click a row — the number, the trend and the ROs follow it.</span></div></div></div>`; }
function drillRows(k,X){
  if(k.dr==='ops'){ const by=new Map(); X.ops.filter(o=>!k.fo||k.fo(o)).forEach(o=>{ const r=o.r; if(!by.has(r)) by.set(r,{r,ops:[]}); by.get(r).ops.push(o); }); return [...by.values()].map(R=>Object.assign(R,{q:sum(R.ops,o=>o.q),b:sum(R.ops,o=>o.b)})); }
  if(k.dr==='CL'||k.dr==='OP'){ return (k.dr==='CL'?X.CL:X.OP).filter(r=>!k.flt||k.flt(r)); }
  if(k.dr==='open') return openAt(X.b,X.F); if(k.dr==='parts') return partsAt(X.b,X.F); if(k.dr==='late') return partsAt(X.b,X.F).filter(r=>r.late);
  if(k.dr==='claim') return claimsIn(X); if(k.dr==='claimpaid') return decidedIn(X).filter(r=>!r.cl.rej); if(k.dr==='claimdec') return decidedIn(X); if(k.dr==='claimpend') return pendAt(X.b,X.F); if(k.dr==='credit') return credAt(X.b,X.F);
  return []; }
function drillCard(k,bk){ const F=U.bf, [a,b]=bk?[bk.a,bk.b]:W(), X=ctx(a,b,F); const scope=bk?bk.t:PER[U.p][0].toLowerCase();
  if(k.dr==='tech'||k.dr==='none'){ const T=F&&F.k==='tech'?[F.v]:TECHS;
    if(k.dr==='none'){ const D=X.D.filter(d=>wf(d)).slice(-8).reverse(); return `<div class="mg-card"><div class="mg-ch"><b>Day by day</b><small>${scope}</small></div><div class="mg-cb"><div class="mg-tbl tech"><div class="h"><span>Day</span><span class="m">Bay use</span><span class="m">On ROs</span><span class="m"></span><span class="m"></span></div>${D.map(d=>`<div class="mg-tr"><span class="c"><b>${DW[dOf(d).getDay()]} ${fd(d)}</b></span><span class="m">${Math.round(BAYU[d])}%</span><span class="m">${h1(sum(TECHS,t=>TB[t][d]||0))} h</span><span></span><span></span></div>`).join('')}</div></div></div>`; }
    const rows=T.map(t=>{ const Y=ctx(a,b,{k:'tech',v:t}); return {t,att:Y.att,bur:Y.bur,q:sum(Y.ops,o=>o.q)}; });
    return `<div class="mg-card"><div class="mg-ch"><b>By tech</b><small>${scope} · from the Time Log</small></div><div class="mg-cb"><div class="mg-tbl tech"><div class="h"><span>Tech</span><span class="m">On the clock</span><span class="m">On ROs</span><span class="m">Unapplied</span><span class="m">${k.id==='ovr'?'Overall':'Productivity'}</span></div>
      ${rows.map(r=>{ const pv=r.att?(k.id==='ovr'?r.q:r.bur)/r.att*100:null; return `<div class="mg-tr" data-a="bf" data-f="tech" data-v="${r.t}"><span class="c" style="flex-direction:row;align-items:center;gap:8px"><span class="tg-av">${r.t}</span><b>${PPL[r.t]}</b></span><span class="m">${h1(r.att)} h</span><span class="m">${h1(r.bur)} h</span><span class="m${r.att-r.bur>r.att*.2?' warn':''}">${h1(Math.max(0,r.att-r.bur))} h</span><span class="m${pv!=null&&pv<85?' warn':''}">${pc(pv)}</span></div>`; }).join('')}</div>
      <div class="mg-more">${ic('info',12)}<span>Unapplied is time on the clock with no RO — check the Time Log for what it was.</span></div></div></div>`; }
  let L=drillRows(k,X); const cl=k.dr.startsWith('claim')||k.dr==='credit';
  if(cl){ const ak=r=>k.dr==='credit'?r.cr:r.cl.amt; L=L.slice().sort((p,q)=>ak(q)-ak(p)); const n=L.length;
    return `<div class="mg-card"><div class="mg-ch"><b>${k.dr==='credit'?'The returns behind it':'The claims behind it'}</b><small>${n} · ${scope}</small></div><div class="mg-cb"><div class="mg-tbl"><div class="h"><span>RO</span><span>Customer · truck</span><span>${k.dr==='credit'?'Sent':'Filed'}</span><span>Tech</span><span class="m">${k.dr==='credit'?'Credit due':'Amount'}</span></div>
      ${L.slice(0,7).map(r=>{ const c=r.cl; const st=k.dr==='credit'?`due ${fd(r.crAt)}`:c.dec>TODAY?'waiting · '+dd(c.filed,TODAY)+' d':c.rej?'rejected':'paid in '+c.payD+' d'; const tn=k.dr==='credit'?'':c.rej?'bad':c.dec>TODAY&&dd(c.filed,TODAY)>30?'warn':'';
        return `<div class="mg-tr" data-a="ro" data-no="${r.no}"><span class="tg-no">${r.no}</span><span class="c"><b>${esc(r.cust)}</b><small>${r.truck} · ${PAY[r.pay]}</small></span><span class="dt">${md(k.dr==='credit'?r.close:c.filed)}</span><span class="tg-av" title="${PPL[r.tech]}">${r.tech}</span><span class="m ${tn}">${usd0(k.dr==='credit'?r.cr:c.amt)}<small>${st}</small></span></div>`; }).join('')||'<div class="mg-none">None in this period.</div>'}</div>${n>7?`<div class="mg-more"><span>Showing 7 of ${n}</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Downloaded — ${n} rows as CSV.">${ic('download',13)}CSV</button></div>`:''}</div></div>`; }
  const sk=k.sk||(x=>-dd((x.r||x).open,TODAY)); L=L.slice().sort((p,q)=>sk(p)-sk(q)); const n=L.length;
  const rowR=x=>x.r||x, c=x=>k.col(x), when=r=>k.dr==='OP'||k.dr==='open'||k.dr==='parts'||k.dr==='late'?md(r.open):md(r.close);
  return `<div class="mg-card"><div class="mg-ch"><b>The ROs behind it</b><small>${n} · ${scope}${['eff','lph','lost','days','fc','aw','pw','qa','fill','ont','cb','apr'].includes(k.id)?' · worst first':''}</small></div><div class="mg-cb"><div class="mg-tbl"><div class="h"><span>RO</span><span>Customer · truck</span><span>${k.dr==='OP'||k.dr==='open'||k.dr==='parts'||k.dr==='late'?'Opened':'Closed'}</span><span>Tech</span><span class="m">${k.mh||'Status'}</span></div>
    ${L.slice(0,7).map(x=>{ const r=rowR(x), cc=k.col?c(x):[r.status||'—',dd(r.open,TODAY)+' d open'], tn=k.tone?k.tone(x):''; return `<div class="mg-tr" data-a="ro" data-no="${r.no}"><span class="tg-no">${r.no}</span><span class="c"><b>${esc(r.cust)}</b><small>${r.truck} · ${PAY[r.pay]}</small></span><span class="dt">${when(r)}</span><span class="tg-av" title="${PPL[r.tech]}">${r.tech}</span><span class="m ${tn}">${cc[0]}${cc[1]?`<small>${cc[1]}</small>`:''}</span></div>`; }).join('')||'<div class="mg-none">None in this period.</div>'}</div>
    ${n>7?`<div class="mg-more"><span>Showing 7 of ${n}</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Downloaded — ${n} ROs as CSV.">${ic('download',13)}CSV</button></div>`:''}</div></div>`; }
