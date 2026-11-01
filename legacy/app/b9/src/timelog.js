
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const p2=n=>String(n).padStart(2,'0');
const hm=m=>p2(Math.floor(m/60))+':'+p2(Math.round(m%60));
const dur=m=>{ m=Math.round(m); return Math.floor(m/60)+':'+p2(m%60); };
const pm=s=>{ const x=/^(\d{1,2}):(\d{2})$/.exec(String(s).trim()); return x?(+x[1])*60+(+x[2]):null; };
/* today is Thu Oct 22 2026, 14:15 */
let NOW=14*60+15; const TODAY='2026-10-22';
const SHIFT={MR:930,DK:990,LM:930,PS:990};
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], DNL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MNL=['January','February','March','April','May','June','July','August','September','October','November','December'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const short=k=>{ const d=dOf(k); return DN[d.getDay()]+' '+(d.getMonth()+1)+'/'+d.getDate(); };
const TECH={MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah'};
const TF=k=>TECH[k].split(' ')[0];
const ROS={
 '37612':['Midway Auto Transport','Wheel seal leaking — drive axle, left rear'], '37628':['Prairie Line Trucking','Turbo actuator fault — low boost'],
 '37502':['Piedmont Aggregates','Check engine light — outlet NOx sensor'], '37590':['Silverline LTL','Clean DPF and replace DPF pressure sensor'],
 '37455':['Highplains Grain','Coolant leak at water pump'], '37011':['Red Mesa Hauling','Recall 24V-118 — EGR cooler inspection'],
 '37544':['Copperline Transport','EGR valve stuck — derate'], '37519':['Dixie Fleet Services','Coolant temp sensor — erratic reading'],
 '37701':['Triad Cold Chain','Alternator not charging — 12.1 V at idle'], '37388':['Elkin Hardwoods','DEF doser clogged — derate'],
 '37466':['Uwharrie Fuel','Misfire cylinder 4 — injector'], '37203':['Surry Feed & Seed','Radiator leak — lower tank'],
 '37720':['Keystone Carriers','PM service — 74-point inspection'], '37731':['Iron Horse Logistics','Clutch slipping — replace clutch'],
 '37742':['Rowan Ready Mix','Air dryer purging constantly'], '37750':['Yadkin Valley Freight','A/C not cooling — compressor clutch']
};
const SHOPW=['Clean bay','Training','Tool maintenance','Shop truck'];
const SR=['Diagnosing','Repairing','Inspecting – 74-point'], ER=['Complete','Switched job','Waiting – Parts','Waiting – Approval','Waiting – Tech Support','Lunch','End of day'];
const NOTES=['Replaced and torqued to spec, verified no leaks.','Pulled codes, checked wiring and connectors.','Ordered parts, waiting on delivery.','Road tested 10 miles, no return.','Pressure tested the system, holds.','Cleaned the connector, re-pinned, codes cleared.'];
/* a seeded generator — the same days every time */
function rng(seed){ let a=0; for(const c of seed) a=(a*31+c.charCodeAt(0))|0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
let PID=0;
const pu=(s,e,ro,sr,er,note,q,o)=>Object.assign({id:'p'+(++PID),s,e,ro,sr,er,note:note||'',q:q||0},o||{});
function genDay(t,k){
  const d=dOf(k), r=rng(t+k); if(d.getDay()===0||d.getDay()===6) return null;
  const pool=Object.keys(ROS); const pick=()=>pool[Math.floor(r()*pool.length)];
  const cin=410+Math.floor(r()*18), l0=690+Math.floor(r()*8), l1=l0+30, out=k===TODAY?null:925+Math.floor(r()*25);
  const sh=[[cin,l0,'Lunch'],[l1,out,out?'End of day':null]], p=[];
  let m=cin+3+Math.floor(r()*5), ro=pick(), shopDone=r()<0.6;
  const end=out||NOW;
  while(m<end-10){
    if(m>=l0-5&&m<l1){ m=l1+2+Math.floor(r()*5); continue; }
    if(!shopDone&&m>780&&r()<0.5){ const e=Math.min(m+12+Math.floor(r()*18),end); p.push(pu(m,e,'SHOP','Shop time','Switched job','',0,{shop:SHOPW[Math.floor(r()*4)]})); shopDone=true; m=e+1; continue; }
    let e=m+40+Math.floor(r()*110), er=ER[Math.floor(r()*5)];
    if(m<l0&&e>l0-2){ e=l0; er='Lunch'; }
    if(e>end){ e=k===TODAY?null:end; er=k===TODAY?null:'End of day'; }
    const len=(e==null?NOW:e)-m;
    p.push(pu(m,e,ro,SR[Math.floor(r()*3)],er,r()<0.88?NOTES[Math.floor(r()*NOTES.length)]:'',Math.round(len/60*(0.85+r()*0.5)*10)/10));
    if(e==null) break;
    m=e+(er==='Lunch'?0:2+Math.floor(r()*14)); if(er!=='Lunch'&&er!=='Switched job') ro=pick(); else if(er==='Switched job') ro=pick();
  }
  return {sh:sh.filter(x=>x[0]<(k===TODAY?NOW:1e9)),p};
}
const DAYS=[]; for(let i=24;i>=0;i--) DAYS.push(addD(TODAY,-i));
function seed(){
  PID=0; const D={};
  Object.keys(TECH).forEach(t=>{ D[t]={}; DAYS.forEach(k=>{ const g=genDay(t,k); if(g) D[t][k]=g; }); });
  /* Mike — today, by hand */
  D.MR[TODAY]={sh:[[418,690,'Lunch'],[720,null,null]],p:[
    pu(424,532,'37612','Repairing','Complete','Replaced wheel seal and both shoes on that end, refilled hub.',2.4),
    pu(560,684,'37628','Diagnosing','Waiting – Parts','Actuator sticking at 60% — ordered a new actuator.',1.6),
    pu(725,790,'37502','Repairing','Complete','Replaced outlet NOx sensor, ran a parked regen, no return.',1.0),
    pu(790,804,'SHOP','Shop time','Switched job','',0,{shop:'Clean bay'}),
    pu(804,null,'37590','Repairing',null,'',0.9)]};
  /* yesterday: two punches overlap */
  D.MR['2026-10-21']={sh:[[415,690,'Lunch'],[720,932,'End of day']],p:[
    pu(420,612,'37455','Repairing','Switched job','Water pump out, gasket surface cleaned.',3.0),
    pu(605,688,'37011','Inspecting – 74-point','Complete','Recall inspection — seepage at the cooler outlet, photos on the RO.',1.0),
    pu(722,880,'37544','Diagnosing','Waiting – Tech Support','Valve sticking at 40%, Volvo tech support case open.',2.0),
    pu(880,928,'37519','Repairing','Complete','',0.6)]};
  /* Monday: never clocked out */
  D.MR['2026-10-19']={sh:[[420,null,null]],p:[
    pu(426,630,'37701','Repairing','Switched job','Rectifier failed — replaced alternator, 14.1 V at idle.',1.6),
    pu(634,690,'37388','Repairing','Lunch','Doser tip crystallized — flow test failed.',0.8),
    pu(725,924,'37466','Repairing','End of day','Replaced injector 4, cylinder cut-out test good.',3.2)]};
  /* Tuesday: no lunch clock-out — lunch taken automatically */
  D.MR['2026-10-20']={sh:[[422,692,'Lunch','auto'],[722,930,'End of day']],p:[
    pu(428,560,'37742','Diagnosing','Switched job','Purge valve leaking at the dryer — quoted.',1.9),
    pu(564,692,'37720','Inspecting – 74-point','Lunch','74-point done — brakes at 40%, wipers.',2.2),
    pu(724,860,'37750','Repairing','Waiting – Approval','Compressor clutch open — quote sent.',2.3),
    pu(862,926,'37203','Repairing','End of day','Radiator out, new one on order.',0.9)]};
  D.MR['2026-10-19'].p.forEach((p,i)=>{ p.q=[2.4,1.0,3.4][i]; });
  /* the pay period before (Oct 5 – 18): every punch has a note but three */
  Object.keys(D.MR).forEach(k=>{ if(k>='2026-10-05'&&k<='2026-10-18') D.MR[k].p.forEach((p,i)=>{ if(p.ro!=='SHOP'&&!p.note) p.note=NOTES[(i+k.charCodeAt(9))%NOTES.length]; }); });
  [['2026-10-07',1],['2026-10-13',2],['2026-10-15',0]].forEach(([k,i])=>{ const L=(D.MR[k]||{p:[]}).p.filter(p=>p.ro!=='SHOP'); if(L[i]) L[i].note=''; });
  /* the others, today */
  D.DK[TODAY]={sh:[[412,695,'Lunch'],[725,null,null]],p:[pu(418,600,'37720','Inspecting – 74-point','Complete','74-point done, brakes at 40%.',1.5),pu(606,693,'37742','Diagnosing','Waiting – Parts','Purge valve leaking — ordered.',1.0),pu(725,null,'37731','Repairing',null,'',2.4)]};
  D.LM[TODAY]={sh:[[425,690,'Lunch'],[720,820,'Appointment']],p:[pu(430,688,'37750','Diagnosing','Waiting – Approval','Compressor clutch open — quote sent.',2.6),pu(722,818,'37203','Repairing','Switched job','Radiator out.',1.2)],back:'15:00'};
  D.PS[TODAY]={sh:[[420,690,'Lunch'],[720,null,null]],p:[pu(424,612,'37011','Repairing','Complete','EGR cooler gasket replaced.',3.4),pu(618,688,'37544','Diagnosing','Switched job','',1.1),pu(722,833,'37612','Repairing','Complete','Hub end play checked, torqued.',1.8)]};
  return D;
}
let S,U,UNDO,TOAST,TT;
function reset(){ NOW=14*60+15; S={D:seed(),sign:{}}; U={view:'day',who:'MR',day:TODAY,sel:null,pop:null,kb:false,open:{},fixed:{},role:'tech',note:null,hov:null,drag:null,snap:1,kh:false,ab:null,per:'cur',snz:0,otAsk:false,trTbl:false}; UNDO=[]; TOAST=null; syncRole(); }
function syncRole(){ $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===U.role)); }
function setRole(r){ U.role=r; if(r==='tech'){ U.who='MR'; if(U.view==='shop') U.view='day'; } syncRole(); }
const nfx=t=>DAYS.filter(k=>{ const c=calc(t,k); return c&&c.fixes.length&&!U.fixed[t+k]; }).length;
const snap=()=>{ UNDO.push(JSON.stringify(S)); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }

/* ---------- a day's numbers ---------- */
function dayOf(t,k){ return (S.D[t]||{})[k]||null; }
function calc(t,k){
  const D=dayOf(t,k); if(!D) return null;
  const today=k===TODAY, open=D.sh.some(x=>x[1]==null), eod=x=>x==null?(today?NOW:null):x;
  const segs=D.sh.map(x=>[x[0],eod(x[1]),x[2],x[1],x[3]]);
  const ps=D.p.slice().sort((a,b)=>a.s-b.s).map(p=>Object.assign({},p,{e2:p.e==null?(today?NOW:p.s):p.e}));
  let clocked=0, job=0, shop=0, q=0; segs.forEach(x=>{ if(x[1]!=null) clocked+=x[1]-x[0]; });
  const lastStop=ps.length?Math.max(...ps.map(p=>p.e2)):null;
  /* a clock left open on a past day counts to the last punch, until it is fixed */
  if(!today&&open){ segs.forEach(x=>{ if(x[1]==null){ const e=Math.max(x[0],lastStop||x[0]); clocked+=e-x[0]; x[1]=e; } }); }
  ps.forEach(p=>{ const m=p.e2-p.s; if(p.ro==='SHOP') shop+=m; else { job+=m; q+=p.q; } });
  /* air: on the clock, not on a punch */
  const air=[]; segs.forEach(x=>{ if(x[1]==null) return; let c=x[0]; ps.forEach(p=>{ if(p.e2<=c||p.s>=x[1]) return; if(p.s>c) air.push([c,Math.min(p.s,x[1])]); c=Math.max(c,p.e2); }); if(x[1]>c) air.push([c,x[1]]); });
  const airM=air.reduce((a,x)=>a+x[1]-x[0],0);
  const lunch=[]; for(let i=1;i<segs.length;i++){ if(segs[i-1][1]!=null&&segs[i][0]>segs[i-1][1]) lunch.push([segs[i-1][1],segs[i][0],segs[i-1][2],segs[i-1][4]]); }
  const fixes=[];
  if(!today&&open) fixes.push({k:'noout',t:'No clock out',why:`Clocked in ${hm(D.sh[0][0])} and never clocked out — the day counts to the last punch, ${hm(lastStop)}, until it’s fixed`,at:lastStop});
  for(let i=1;i<ps.length;i++){ if(ps[i].s<ps[i-1].e2){ fixes.push({k:'over',t:'Punches overlap',why:`${ps[i-1].ro} and ${ps[i].ro} overlap ${ps[i-1].e2-ps[i].s} min, ${hm(ps[i].s)}–${hm(ps[i-1].e2)}`,a:ps[i-1].id,b:ps[i].id,from:ps[i].s,to:ps[i-1].e2}); } }
  const soft=[]; air.forEach(x=>{ if(x[1]-x[0]>=20) soft.push({k:'air',from:x[0],to:x[1]}); });
  const miss=ps.filter(p=>p.ro!=='SHOP'&&p.e!=null&&!p.note).length;
  const on=open&&today, run=ps.find(p=>p.e==null);
  const first=segs.length?segs[0][0]:null, last=segs.length?segs[segs.length-1][1]:null;
  const span=today?NOW:(open?lastStop:last); const lastOut=segs.length?segs[segs.length-1][3]:null;
  return {shEnd:SHIFT[t],over:(today&&open)?NOW-SHIFT[t]:null,D,segs,ps,clocked:(!today&&open)?clocked:clocked,job,shop,air,airM,lunch,lunchM:lunch.filter(x=>x[2]==='Lunch').reduce((a,x)=>a+x[1]-x[0],0),q,eff:job?q/(job/60):null,fixes,soft,miss,on,run,open,first,last,span,today};
}
const effTxt=e=>e==null?'—':Math.round(e*100)+'%';
const days=()=>DAYS.filter(k=>dayOf(U.who,k)).slice().reverse();
const wkStart=k=>{ const d=dOf(k), w=(d.getDay()+6)%7; return addD(k,-w); };
function groups(){
  const L=days(), ws=wkStart(TODAY), lws=addD(ws,-7), G={fix:[],wk:[],last:[],old:[]};
  L.forEach(k=>{ const c=calc(U.who,k); if(c.fixes.length&&!U.fixed[U.who+k]) G.fix.push(k); else if(k>=ws) G.wk.push(k); else if(k>=lws) G.last.push(k); else G.old.push(k); });
  return G;
}
const flat=()=>{ const G=groups(); return G.fix.concat(G.wk,G.last,U.open.old?G.old:[]); };

/* ---------- drawing ---------- */
const pos=(m,a,b)=>((m-a)/(b-a)*100).toFixed(3)+'%';
const wid=(x,y,a,b)=>((y-x)/(b-a)*100).toFixed(3)+'%';
function strip(c){ const a=360,b=1080; let h=''; c.segs.forEach(x=>{ if(x[1]==null) return; }); c.ps.forEach(p=>{ h+=`<i class="${p.ro==='SHOP'?'shop':'job'}" style="left:${pos(Math.max(p.s,a),a,b)};width:${wid(Math.max(p.s,a),Math.min(p.e2,b),a,b)}"></i>`; });
  c.air.forEach(x=>{ h+=`<i class="air" style="left:${pos(Math.max(x[0],a),a,b)};width:${wid(Math.max(x[0],a),Math.min(x[1],b),a,b)}"></i>`; });
  if(c.fixes.some(f=>f.k==='noout')&&c.ps.length){ const ls=Math.max(...c.ps.map(p=>p.e2)); h+=`<i class="prob" style="left:${pos(ls,a,b)};right:0"></i>`; }
  return `<div class="tk-strip">${h}</div>`; }
function track(c,a,b,opts){
  opts=opts||{}; let h='';
  c.segs.forEach(x=>{ const e=x[1]==null?b:Math.min(x[1],b); h+=`<span class="tk-clk" style="left:${pos(x[0],a,b)};width:${wid(x[0],e,a,b)}"></span>`; });
  c.lunch.forEach(x=>{ h+=`<span class="tk-lunch${x[3]?' auto':''}" data-tip="${esc((x[3]?'Lunch, taken automatically':x[2]==='Lunch'?'Lunch':x[2]||'Off the clock')+' · '+hm(x[0])+'–'+hm(x[1])+' · '+dur(x[1]-x[0]))}" style="left:${pos(x[0],a,b)};width:${wid(x[0],x[1],a,b)}">${x[3]?'<em>AUTO</em>':x[2]==='Lunch'?ic('coffee',14):''}</span>`; });
  c.air.forEach(x=>{ if(x[0]>=b) return; const e=Math.min(x[1],b); h+=`<span class="tk-b air${opts.live&&x[1]-x[0]>=20?' long':''}" data-tip="${esc('Air · '+hm(x[0])+'–'+hm(x[1])+' · '+dur(x[1]-x[0])+'|On the clock, not on a job')}" style="left:${pos(x[0],a,b)};width:${wid(x[0],e,a,b)}"></span>`; });
  const over=new Set(), overO={}; c.fixes.forEach(f=>{ if(f.k==='over'){ over.add(f.a); over.add(f.b); overO[f.a]=0; overO[f.b]=1; } });
  c.ps.forEach(p=>{ const e=Math.min(p.e2,b), w=(e-p.s)/(b-a)*(opts.w||800), shp=p.ro==='SHOP', sel=U.sel===p.id&&opts.live;
    const lbl=opts.live&&w>46?(shp?'Shop':p.ro):'';
    h+=`<span class="tk-b ${shp?'shop':'job'}${p.e==null?' run':''}${sel?' sel':''}${opts.live&&U.hov===p.id?' hov':''}${opts.live&&U.drag&&U.drag.pid===p.id?' drg':''}${over.has(p.id)&&opts.live?' prob':''}" ${opts.live?`data-a="psel" data-p="${p.id}"`:''} data-tip="${esc((shp?'Shop · '+p.shop:p.ro+' · '+ROS[p.ro][1])+'|'+hm(p.s)+'–'+(p.e==null?'now':hm(p.e))+' · '+dur(p.e2-p.s)+(shp?'':' · '+p.sr+(p.er?' → '+p.er:'')))}" style="left:${pos(p.s,a,b)};width:${wid(p.s,e,a,b)}">${lbl}${opts.live?`<i class="h l${U.drag&&U.drag.pid===p.id&&U.drag.edge==='s'?' on':''}" data-h="s" data-p="${p.id}" title="Drag to change the start"></i>${p.e!=null?`<i class="h r${U.drag&&U.drag.pid===p.id&&U.drag.edge==='e'?' on':''}" data-h="e" data-p="${p.id}" title="Drag to change the stop"></i>`:''}`:''}</span>`; });
  if(opts.live) h+=dragLayer(c,a,b);
  if(opts.flags){ c.segs.forEach((x,i)=>{ if(!(i&&c.segs[i-1][4])) h+=`<span class="tk-flag" style="left:${pos(x[0],a,b)}">IN</span>`; if(x[3]!=null&&!x[4]) h+=`<span class="tk-flag out" style="left:${pos(x[1],a,b)}">OUT</span>`; });
    if(c.open&&!c.today){ const ls=Math.max(...c.ps.map(p=>p.e2)); h+=`<span class="tk-flag bad" style="left:${pos(Math.min(ls+10,b-5),a,b)}">NO OUT</span>`; } }
  if(opts.live&&c.open&&!c.today&&c.ps.length){ const ls=Math.max(...c.ps.map(p=>p.e2)); h+=`<span class="tk-ghost" data-tip="Not counted · after ${hm(ls)}|The day counts to the last punch until the clock out is fixed" style="left:${pos(ls,a,b)};width:${wid(ls,b,a,b)}"><em>not counted</em></span>`; }
  if(opts.live) c.fixes.forEach(f=>{ if(f.k==='over') h+=`<span class="tk-ovl" data-tip="Counted twice · ${hm(f.from)}–${hm(f.to)}|${f.to-f.from} min on two punches at once" style="left:${pos(f.from,a,b)};width:${wid(f.from,f.to,a,b)}"><em>${f.to-f.from} min twice</em></span>`; });
  if(opts.live&&c.today&&c.on&&c.shEnd>a&&c.shEnd<b) h+=`<span class="tk-shend${c.over>=30?' late':''}" style="left:${pos(c.shEnd,a,b)}"><em>SHIFT ENDS ${hm(c.shEnd)}</em></span>`;
  if(c.today&&NOW>a&&NOW<b) h+=`<span class="tk-now" style="left:${pos(NOW,a,b)}" title="Now ${hm(NOW)}"></span>`;
  return h;
}
function dragLayer(c,a,b){
  let h='';
  const dg=U.drag; if(dg){ const p0=c.ps.find(x=>x.id===dg.pid); if(p0){ const oe=dg.orig.e==null?NOW:dg.orig.e;
    h+=`<span class="tk-gh" style="left:${pos(dg.orig.s,a,b)};width:${wid(dg.orig.s,Math.min(oe,b),a,b)}"></span>`;
    const t=dg.edge==='e'?p0.e2:p0.s, delta=t-(dg.edge==='e'?oe:dg.orig.s), hit=dg.hit;
    if(hit&&hit.k!=='min') h+=`<span class="tk-guide${hit.k==='meet'?' meet':' stop'}" style="left:${pos(t,a,b)}"></span>`;
    const why=!hit?'':hit.k==='meet'?`meets ${hit.p.ro==='SHOP'?'shop time':hit.p.ro}`:hit.k==='in'?`clocked in ${hm(hit.t)} — can’t start earlier`:hit.k==='out'?`${hit.why==='Lunch'?'out to lunch':'clocked out'} ${hm(hit.t)} — can’t run later`:hit.k==='now'?'that’s now':'5 min is the shortest punch';
    h+=`<span class="tk-bub${hit?(hit.k==='meet'?' meet':' stop'):''}" style="left:${pos(t,a,b)}"><b>${dg.edge==='e'?'Stop':'Start'} ${hm(t)}</b><small>${dur(p0.e2-p0.s)} long · ${delta===0?'no change':Math.abs(delta)+' min '+(delta>0?'later':'earlier')}</small>${why?`<em>${why}</em>`:''}</span>`; } }
  if(U.hov){ const ph=c.ps.find(x=>x.id===U.hov); if(ph) h+=`<span class="tk-bub hint" style="left:${pos(ph.e2,a,b)}"><b>⟷</b><small>Drag the edge to change the stop</small></span>`; }
  if(U.kh&&U.sel){ const pk=c.ps.find(x=>x.id===U.sel); if(pk) h+=`<span class="tk-bub kh" style="left:${pos((pk.s+pk.e2)/2,a,b)}"><small><span class="k">${kbd('Alt')}${kbd('←')}${kbd('→')}</span> moves the stop</small><small><span class="k">${kbd('Alt')}${kbd('⇧')}${kbd('←')}${kbd('→')}</span> moves the start</small></span>`; }
  return h; }
function limits(k,pid,edge){
  const c=calc(U.who,k), D=dayOf(U.who,k), p=D.p.find(x=>x.id===pid), ps=c.ps, i=ps.findIndex(x=>x.id===pid), today=k===TODAY, pe=p.e==null?NOW:p.e;
  const prev=ps.slice(0,i).filter(x=>x.e2<=p.s+1).pop()||null, next=ps.slice(i+1).find(x=>x.s>=pe-1)||null;
  const seg=c.segs.find(x=>p.s>=x[0]-1&&p.s<=x[1]+1)||c.segs[0];
  if(edge==='s'){ const lo1=seg[0], lo2=prev?prev.e2:-1e9, lo=Math.max(lo1,lo2); return {lo, hi:pe-5, loWhy:prev&&lo2>=lo1?{k:'meet',p:prev}:{k:'in',t:lo1}, hiWhy:{k:'min'}}; }
  const segEnd=seg[3]==null?(today?NOW:seg[1]):seg[3], hi2=next?next.s:1e9, hi=Math.min(segEnd,hi2);
  return {lo:p.s+5, hi, loWhy:{k:'min'}, hiWhy:next&&hi2<=segEnd?{k:'meet',p:next}:{k:seg[3]==null&&today?'now':'out',t:segEnd,why:seg[2]}};
}
function dragTo(m){ const d=U.drag, D=dayOf(U.who,U.day), p=D.p.find(x=>x.id===d.pid), L=limits(U.day,d.pid,d.edge);
  let v=Math.round(m/U.snap)*U.snap, hit=null;
  if(Math.abs(m-L.hi)<=3) v=L.hi; if(Math.abs(m-L.lo)<=3) v=L.lo;
  if(v>=L.hi){ v=L.hi; hit=L.hiWhy; } else if(v<=L.lo){ v=L.lo; hit=L.loWhy; }
  p[d.edge]=v; d.hit=hit; }
function finishDrag(){ const d=U.drag; U.drag=null; const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===d.pid); if(!p){ render(); return; }
  if(p.s===d.orig.s&&p.e===d.orig.e){ UNDO.pop(); render(); return; }
  d.ed0=p.ed||null; if(!p.ed) p.ed=hm(d.orig.s)+'–'+(d.orig.e==null?'now':hm(d.orig.e));
  const o=d.edge==='e'?d.orig.e:d.orig.s, n=p[d.edge];
  if(U.role==='foreman'){ const el=$(`.tk-tl .tk-b[data-p="${p.id}"]`); openPop('why',{pid:p.id,orig:d.orig,edge:d.edge,ed0:d.ed0,o,n},el); return; }
  toast(`${p.ro==='SHOP'?'Shop time':p.ro} · ${d.edge==='e'?'stop':'start'} ${hm(o)} → ${hm(n)} · ${dur((p.e==null?NOW:p.e)-p.s)} long`); render(); }
function cancelDrag(){ const d=U.drag; if(!d) return; const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===d.pid); if(p){ p.s=d.orig.s; p.e=d.orig.e; } U.drag=null; UNDO.pop(); }
let NT=0;
function nudge(edge,dv){ if(isLocked(U.who,U.day)){ toast('Locked — this pay period was approved.',false); render(); return; } if(U.role==='foreman'){ toast('As foreman, drag the edge or press E — a change to someone’s time asks why.',false); render(); return; } const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===U.sel); if(!p||(edge==='e'&&p.e==null)) return; const L=limits(U.day,p.id,edge), cur=p[edge], v=Math.max(L.lo,Math.min(L.hi,cur+dv));
  if(v===cur){ toast(`The ${edge==='e'?'stop':'start'} can’t move further that way.`,false); render(); return; }
  if(Date.now()-NT>1500) snap(); NT=Date.now(); if(!p.ed) p.ed=hm(p.s)+'–'+(p.e==null?'now':hm(p.e)); p[edge]=v; U.kh=false;
  toast(`${p.ro==='SHOP'?'Shop time':p.ro} · ${edge==='e'?'stop':'start'} ${hm(v)} · ${dur((p.e==null?NOW:p.e)-p.s)} long`); render(); }
const PER={prev:['2026-10-05','Oct 5 – Oct 18'],cur:['2026-10-19','Oct 19 – Nov 1']};
const WHYS=['Forgot to stop the clock','Wrong job or RO','Tech asked me to','Matches the RO paperwork'];
const perDays=per=>{ const L=[]; for(let i=0;i<14;i++) L.push(addD(PER[per][0],i)); return L; };
const sgT=()=>U.who==='ALL'?'MR':U.who, sgK=()=>sgT()+U.per, stamp=()=>'Thu 10/22 '+hm(NOW);
function isLocked(t,k){ const s=S.sign[t+'prev']; return !!(s&&s.fm)&&k>=PER.prev[0]&&k<=addD(PER.prev[0],13); }
function missNotes(t,L){ const R=[]; L.forEach(k=>{ const D=dayOf(t,k); if(D&&k!==TODAY) D.p.slice().sort((a,b)=>a.s-b.s).forEach(p=>{ if(p.ro!=='SHOP'&&p.e!=null&&!(p.note||'').trim()) R.push({k,p}); }); }); return R; }
const needWhy=p=>U.role==='foreman'&&!p.why;
function whyRow(p,t){ return U.role==='foreman'?`<span class="tg-lbl top">Why change ${TF(t==='ALL'?'MR':t)}’s time?</span><div class="tg-r tk-why">${WHYS.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="pset" data-f="why" data-v="${esc(w)}">${esc(w)}</button>`).join('')}</div>`:''; }
function edBadge(p){ if(!p.ed) return ''; if(p.ed==='added by hand') return '<span class="tk-ed">added by hand</span>';
  return p.by?`<span class="tk-ed by" title="Changed by ${p.by}: ${esc(p.why)} · before: ${esc(p.ed)}">${ic('pencil',10)}${p.by} · ${esc(p.why)} · was ${esc(p.ed)}</span>`:`<span class="tk-ed" title="Before the edit: ${esc(p.ed)}">edited · was ${esc(p.ed)}</span>`; }
function whyCancel(){ const p=U.pop; if(!p||p.type!=='why') return; const D=dayOf(U.who,U.day), x=D&&D.p.find(q=>q.id===p.pid); if(x){ x.s=p.orig.s; x.e=p.orig.e; if(p.ed0) x.ed=p.ed0; else delete x.ed; } UNDO.pop(); U.pop=null; toast('Put back — nothing changed.',false); }
function clockOut(at){ snap(); const D=dayOf('MR',TODAY), r=D.p.find(p=>p.e==null); if(r){ if(at<NOW&&!r.ed) r.ed=hm(r.s)+'–now'; r.e=Math.max(r.s+5,at); r.er='End of day'; } const sg=D.sh[D.sh.length-1]; sg[1]=at; sg[2]='End of day'; return r; }
function remind(){ if(U.role!=='tech') return ''; const c=calc('MR',TODAY); if(!c||!c.on||c.over==null||c.over<0||U.otAsk||NOW<U.snz) return '';
  const ro=c.run?(c.run.ro==='SHOP'?'shop time':c.run.ro):null;
  if(c.over>=30) return `<div class="tk-remind warn"><span class="i">${ic('flag',16)}</span><div><b>${c.over} min past your shift</b><p>Still on ${ro||'the clock'}${c.run?' — '+dur(NOW-c.run.s):''}. Past 30 minutes, Frank sees it in the Shop view.</p><div class="r"><button class="btn btn-sm btn-primary" data-a="clkat">Clock out at ${hm(c.shEnd)}</button><button class="btn btn-sm" data-a="clkout">Clock out now</button><button class="btn btn-sm tg-gh" data-a="ot">It’s overtime</button></div></div></div>`;
  return `<div class="tk-remind"><span class="i">${ic('clock',16)}</span><div><b>Your shift ended at ${hm(c.shEnd)}</b><p>You’re still on the clock${ro?' — on '+ro+' for '+dur(NOW-c.run.s):''}.</p><div class="r"><button class="btn btn-sm btn-primary" data-a="clkout">${ro?'Stop and clock out':'Clock out'}</button><button class="btn btn-sm" data-a="remsnz">Still working · ask at ${hm(NOW+30)}</button></div></div></div>`; }
function signBar(L){
  const t=sgT(), per=U.per, sg=S.sign[t+per]||{}, me=U.role==='tech', nm=TF(t), ended=per==='prev';
  const fixD=L.filter(k=>{ const c=calc(t,k); return c&&c.fixes.length&&!U.fixed[t+k]; }), mn=missNotes(t,L), blocked=fixD.length+mn.length>0;
  const step=(n,lbl,sub,st)=>`<div class="tk-stp ${st}"><span class="dot">${st.includes('done')?ic(n===3?'lock':'check',12):n}</span><span><b>${lbl}</b><small>${sub}</small></span></div>`;
  const s1=sg.tech?'done':ended?'now':'', s2=sg.fm?'done':sg.tech?'now':'', s3=sg.fm?'done lk':'';
  let act='';
  if(!ended) act=`<span class="tk-sgn-n">Signing opens Sun 11/1, when the period ends</span>`;
  else if(sg.fm) act=me?`<span class="tk-sgn-n">${ic('lock',13)}Locked — ask Frank if something’s wrong</span>`:`<button class="btn btn-sm" data-a="treopen">${ic('history',14)}Reopen</button>`;
  else if(sg.tech) act=me?`<button class="btn btn-sm tg-gh" data-a="tunsign">Take back my signature</button>`:`<button class="btn btn-sm btn-primary" data-a="tapprove">${ic('check',14)}Approve and lock</button>`;
  else act=me?`<button class="btn btn-sm btn-primary" data-a="tsign"${blocked?' disabled title="Clear the items below first"':''}>${ic('pencil',14)}Sign my timesheet</button>`:`<span class="tk-sgn-n">Waiting for ${nm} to sign</span>`;
  const ps=S.sign[t+'prev']||{}, due=per==='cur'&&!ps.fm?`<div class="tk-sgn-due">${ic('flag',14)}<span><b>${PER.prev[1]}</b> is waiting for ${ps.tech?(me?'Frank to approve':'your approval'):(me?'your signature':nm+'’s signature')} · due Fri 10/23</span><button class="btn btn-sm" data-a="per" data-v="prev">Open it</button></div>`:'';
  const blk=!sg.tech&&blocked?`<div class="tk-blk"><span class="t">${ended?(me?'Before you can sign':'Before '+nm+' can sign'):'Before this can be signed'}</span>${fixD.map(k=>`<button class="tk-bk bad" data-a="gofix" data-k="${k}">${ic('flag',12)}${short(k)} · ${esc(calc(t,k).fixes[0].t)}</button>`).join('')}${mn.length?`<button class="tk-bk warn" data-a="pop" data-p="notes">${ic('note',12)}${mn.length} punch${mn.length>1?'es':''} without a work note · Add them…</button>`:''}</div>`:'';
  return `<div class="tk-sgn">${due}<div class="tk-sgr">${step(1,me?'You sign':nm+' signs',sg.tech?'Signed '+sg.tech:ended?(blocked?'Not yet — see below':'Ready'):'After the period ends',s1)}<i class="tk-sl${sg.tech?' done':''}"></i>${step(2,me?'Frank approves':'You approve',sg.fm?'Approved '+sg.fm:sg.tech?'Waiting':'After the signature',s2)}<i class="tk-sl${sg.fm?' done':''}"></i>${step(3,'Locked',sg.fm?'No more changes':'Changes close after approval',s3)}<span class="sp"></span>${act}</div>${blk}</div>`; }
function sigLines(){ const sg=S.sign[sgK()]||{}, t=sgT();
  return `<div class="tk-sig"><div>${sg.tech?`<i>${esc(TECH[t])}<small>${sg.tech}</small></i>`:''}Technician</div><div>${sg.fm?`<i>Frank Delaney<small>${sg.fm}</small></i>`:''}Foreman / manager</div></div>`; }
function effTrend(){
  const t=sgT(), ws=wkStart(TODAY), syn=[.91,.97,1.02,.99], W=[];
  for(let i=7;i>=0;i--){ const k=addD(ws,-7*i); let j=0,q=0,n=0; for(let d=0;d<7;d++){ const c=calc(t,addD(k,d)); if(c){ j+=c.job; q+=c.q; n++; } }
    if(!n){ j=35.5*60; q=syn[7-i]*35.5; } W.push({k,e:q/(j/60),j:j/60,q,cur:i===0}); }
  const vals=W.map(w=>w.e), lo=Math.min(.8,Math.floor((Math.min(...vals)-.04)*10)/10), hi=Math.max(1.2,Math.ceil((Math.max(...vals)+.04)*10)/10);
  const avg=vals.reduce((s,v)=>s+v,0)/vals.length, cur=W[7].e, dl=Math.round((cur-W[6].e)*100);
  const sum=`<div class="tk-trs"><small>This week so far</small><b>${effTxt(cur)}</b><small><span class="${dl>=0?'up':'dn'}">${dl>=0?'▲':'▼'} ${Math.abs(dl)} pts</span> on last week</small><small>8-week average ${effTxt(avg)}</small></div>`;
  let body;
  if(U.trTbl) body=`<table class="tk-trt"><thead><tr><th>Week of</th><th>On jobs</th><th>Quoted</th><th>Efficiency</th></tr></thead><tbody>${W.slice().reverse().map(w=>{ const d=dOf(w.k); return `<tr><td>${MN[d.getMonth()]} ${d.getDate()}${w.cur?' · so far':''}</td><td>${w.j.toFixed(1)} h</td><td>${w.q.toFixed(1)} h</td><td>${effTxt(w.e)}</td></tr>`; }).join('')}</tbody></table>`;
  else { const Wd=640,H=150,L=44,R=64,T=12,B=24, X=i=>L+i*(Wd-L-R)/7, Y=v=>T+(hi-v)/(hi-lo)*(H-T-B); let g='';
    for(let v=lo;v<=hi+1e-9;v+=.1){ const y=Y(v), one=Math.abs(v-1)<1e-6; if(!one) g+=`<line class="gl" x1="${L}" x2="${Wd-R+10}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`; g+=`<text class="${one?'rl':'ax'}" x="${L-8}" y="${(y+3.5).toFixed(1)}" text-anchor="end">${Math.round(v*100)}%</text>`; }
    const y1=Y(1); g+=`<line class="ref" x1="${L}" x2="${Wd-R+10}" y1="${y1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`;
    const pt=W.map((w,i)=>[X(i),Y(w.e)]), f=q=>q[0].toFixed(1)+' '+q[1].toFixed(1);
    g+=`<path class="tln" d="M${pt.slice(0,7).map(f).join(' L')}"/><path class="tln so" d="M${f(pt[6])} L${f(pt[7])}"/>`;
    W.forEach((w,i)=>{ const d=dOf(w.k); g+=`<text class="ax" x="${X(i).toFixed(1)}" y="${H-5}" text-anchor="middle">${d.getMonth()+1}/${d.getDate()}</text>`; });
    pt.forEach((q,i)=>{ g+=`<circle class="pt${W[i].cur?' cur':''}" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4.5"/>`; });
    g+=`<text class="vl" x="${(pt[7][0]+11).toFixed(1)}" y="${(pt[7][1]+1).toFixed(1)}">${effTxt(cur)}</text><text class="rl" x="${(pt[7][0]+11).toFixed(1)}" y="${(pt[7][1]+14).toFixed(1)}">so far</text>`;
    const sw=(Wd-L-R)/7; W.forEach((w,i)=>{ const d=dOf(w.k); g+=`<rect class="hit" x="${(X(i)-sw/2).toFixed(1)}" y="${T-6}" width="${sw.toFixed(1)}" height="${H-T-B+12}" rx="6" data-tip="Week of ${MN[d.getMonth()]} ${d.getDate()}${w.cur?' · so far':''}|${effTxt(w.e)} · ${w.q.toFixed(1)} h quoted for ${w.j.toFixed(1)} h on jobs"/>`; });
    body=`<svg width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Efficiency per week, last 8 weeks">${g}</svg>`; }
  return `<div class="tk-trend"><div class="tk-trh"><b>Efficiency, week by week</b><small>quoted hours ÷ hours on jobs · 100% is right on the quote</small><span class="sp"></span><span class="tg-seg3"><button class="${U.trTbl?'':'on'}" data-a="trtbl" data-v="0">Chart</button><button class="${U.trTbl?'on':''}" data-a="trtbl" data-v="1">Table</button></span></div><div class="tk-trb">${sum}${body}</div></div>`; }
function ideasAfter(){
  if(U.pop&&U.pop.type==='notes'){ const el=$(`.tg-pop [data-nid="${U.pop.fid||(U.pop.ids||[])[0]}"]`); if(el&&document.activeElement!==el){ el.focus(); const v=el.value; el.setSelectionRange(v.length,v.length); } }
}
mock.addEventListener('input',e=>{ const id=e.target.dataset&&e.target.dataset.nid; if(!id||!U.pop) return; const f=findP(id); if(!f) return; if(!U.pop._sn){ snap(); U.pop._sn=1; } f.p.note=e.target.value;
  const n=$$('.tg-pop [data-nid]').filter(x=>!x.value.trim()).length, h=$('.tg-pop .tk-nleft'); if(h) h.textContent=n?n+' left':'All done'; });
mock.addEventListener('focusin',e=>{ const id=e.target.dataset&&e.target.dataset.nid; if(id&&U.pop) U.pop.fid=id; });
function axis(a,b,step){ let h=''; for(let m=Math.ceil(a/60)*60;m<=b;m+=60*(step||1)){ h+=`<span class="hr" style="left:${pos(m,a,b)}">${p2(m/60)}</span>`; } return `<div class="tk-ax">${h}</div>`; }
function gridL(a,b){ let h=''; for(let m=Math.ceil(a/60)*60;m<=b;m+=60) h+=`<i style="left:${pos(m,a,b)}"></i>`; return `<div class="tk-grid">${h}</div>`; }

function render(){
  const v=U.view;
  const body=v==='week'?vWeek():v==='sheet'?vSheet():v==='shop'?vShop():vDay();
  const showList=v==='day'||v==='week';
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='timelog'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg tk${U.drag&&!U.drag.frozen?' dragging':''}">${head()}<div class="tg-body v-${v}">${showList?list():''}<div class="tg-main">${body}</div>${pop()}</div>${remind()}<div class="tk-tip" hidden></div><div class="tk-ring" hidden></div><div class="tk-note" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const c=calc(U.who,TODAY), ws=wkStart(TODAY); let wk=0; for(let i=0;i<7;i++){ const x=calc(U.who,addD(ws,i)); if(x) wk+=x.clocked; }
  const G=groups(), nf=G.fix.length, all=U.who==='ALL';
  const vs=[['day','clock','Day'],['week','calendar','Week'],['sheet','sheet','Timesheet'],['shop','users','Shop']].filter(x=>U.role!=='tech'||x[0]!=='shop');
  const who=all?`<span class="tk-av all">${ic('users',12)}</span>Whole shop`:`<span class="tk-av">${U.who}</span>${U.who==='MR'&&U.role==='tech'?'You · ':''}${esc(TECH[U.who])}`;
  let facts='';
  if(all||U.view==='shop'){ const on=Object.keys(TECH).filter(t=>{ const x=calc(t,TODAY); return x&&x.on; }).length; facts=`<span class="tg-hf"><b>${on} of 4</b>on the clock</span><i>·</i><span class="tg-hf"><b>1</b>off — appointment</span>`; }
  else facts=`${c&&c.on&&c.over>=30?`<span class="tg-hf bad"><b>${c.over} min</b>past the shift</span><i>·</i>`:''}${c&&c.on?`<span class="tg-hf tk-hb"><span class="tk-live"></span><b>${dur(c.clocked)}</b>on the clock</span><i>·</i>`:''}<span class="tg-hf"><b>${dur(wk)}</b>this week</span>${c&&c.on&&c.over>=30?'':`<i>·</i><span class="tg-hf"><b>${c?effTxt(c.eff):'—'}</b>efficiency today</span>`}${nf?`<i>·</i><button class="tg-hf w" data-a="tofix"><b>${nf}</b>to fix</button>`:''}`;
  return `<header class="tg-head"><h1 class="tg-h1">Time Log</h1>${U.role==='tech'?`<span class="tk-who st" title="Your own time — a technician sees only their own log">${who}<span class="tk-mine">only yours</span></span>`:`<button class="tk-who" data-a="pop" data-p="who">${who}${ic('chevD',14)}</button>`}<span class="tg-facts">${facts}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="add" title="Add a punch or a clock segment (A)">${ic('plus',16)}</button><button class="btn ib tg-srch-b" data-a="pop" data-p="exp" title="Print and export">${ic('download',16)}</button></header>`;
}
function list(){
  const G=groups(), s=U.day;
  const item=k=>{ const c=calc(U.who,k), d=dOf(k), on=k===s, f=c.fixes[0]&&!U.fixed[U.who+k]?c.fixes[0]:null, today=k===TODAY;
    const why=f?`<span class="why bad">${ic('flag',12)}${esc(f.t)} · ${esc(f.k==='noout'?'since '+hm(c.D.sh[0][0]):(f.to-f.from)+' min')}</span>`
      :today&&c.on?`<span class="why">${c.run?`On ${c.run.ro==='SHOP'?'shop time':c.run.ro} · ${dur(NOW-c.run.s)}`:'On the clock, not on a job'}</span>`
      :c.lunch.some(x=>x[3])&&!c.D.autoOk?`<span class="why warn">${ic('coffee',12)}Lunch taken automatically — check it</span>`:c.miss?`<span class="why warn">${ic('note',12)}${c.miss} punch${c.miss>1?'es':''} without a work note</span>`:`<span class="why">${hm(c.first)} – ${c.last!=null?hm(c.last):'—'} · ${c.ps.filter(p=>p.ro!=='SHOP').length} jobs</span>`;
    return `<div class="tk-di${on?' on':''}${on&&U.kb?' kb':''}${today?' today':''}" data-a="day" data-k="${k}"><span class="tk-dt"><small>${DN[d.getDay()]}</small><b>${d.getDate()}</b></span>
      <span class="r1">${today?'Today':DNL[d.getDay()]}${isLocked(U.who,k)?`<span class="tk-lk" title="Approved and locked">${ic('lock',12)}</span>`:''}${today&&c.on?'<span class="tk-pill">On the clock</span>':''}<small>${MN[d.getMonth()]} ${d.getDate()}</small></span>
      <span class="tot">${dur(c.clocked)}<small>${effTxt(c.eff)}</small></span>${strip(c)}${why}</div>`; };
  let body='';
  const grp=(t,L)=>L.length?`<div class="tg-grp">${t}<span>${L.length}</span></div>`+L.map(item).join(''):'';
  body+=grp('To fix',G.fix)+grp('This week',G.wk)+grp('Last week',G.last);
  if(G.old.length) body+=`<div class="tg-sec${U.open.old?' open':''}" data-a="open" data-k="old">${ic('chevR',12)}<span>Earlier</span><span class="n">${G.old.length}</span></div>`+(U.open.old?G.old.map(item).join(''):'');
  const keys=`<div class="tg-keys"><span>${kbd('J')}${kbd('K')}day</span><span>${kbd('E')}edit</span><span>${kbd('A')}add</span><span>${kbd('1')}–${kbd('4')}views</span></div>`;
  return `<section class="tg-list"><div class="tg-lh">Days<span class="n">${days().length}</span>${G.fix.length?`<button class="tg-fchip w" data-a="tofix">${G.fix.length} to fix</button>`:''}</div><div class="tg-scroll">${body}</div>${keys}</section>`;
}
function vDay(){
  const k=U.day, c=calc(U.who,k), d=dOf(k);
  if(!c) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('clock',22)}</span><h3>Nothing clocked</h3><p>No clock in and no punches this day.</p></div></div>`;
  let a=Math.min(390,Math.floor((c.first-20)/60)*60), b=Math.max(1020,Math.ceil(((c.today?NOW:c.open?Math.max(...c.ps.map(p=>p.e2)):c.last)+30)/60)*60);
  if(U.drag&&U.ab){ a=U.ab[0]; b=U.ab[1]; } else U.ab=[a,b];
  const pct=c.clocked?Math.round(c.job/c.clocked*100):0;
  const st=c.today&&c.on?`<span class="tk-pill">${ic('clock',11)}On the clock since ${hm(c.segs[c.segs.length-1][0])}</span>`:c.open&&!c.today?`<span class="tk-pill bad">${ic('flag',11)}No clock out</span>`:`<span class="tk-pill off">Closed out ${c.last!=null?hm(c.last):''}</span>`;
  const stat=(l,v,sub,cls,sw)=>`<div class="tk-stat${cls?' '+cls:''}"><small>${sw?`<i class="sw" style="background:var(--tk-${sw})"></i>`:''}${l}</small><b>${v}${sub?`<em>${sub}</em>`:''}</b></div>`;
  let h=`<div class="tk-day${isLocked(U.who,k)?' locked':''}" data-scroll="day"><div class="tk-dh"><h2>${c.today?'Today · ':''}${DNL[d.getDay()]}, ${MNL[d.getMonth()]} ${d.getDate()}</h2>${st}${isLocked(U.who,k)?`<span class="tk-pill lock">${ic('lock',11)}Locked · approved by Frank</span>`:''}<span class="sp"></span><span class="nav"><button class="btn btn-sm ib" data-a="dnav" data-d="-1" title="Day before (←)">${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="dnav" data-d="1" title="Day after (→)"${k===TODAY?' disabled':''}>${ic('chevR',15)}</button></span><button class="btn btn-sm" data-a="toast" data-t="The day report prints — one page, every punch with its notes.">${ic('print',14)}Day report</button></div>`;
  h+=`<div class="tk-stats">${stat('Clocked',dur(c.clocked),c.open&&!c.today?'to the last punch':'')}${stat('On jobs',dur(c.job),pct+'%','', 'job')}${stat('Air',dur(c.airM),'','', 'air')}${stat('Shop',dur(c.shop),'','', 'shop')}${stat('Lunch',dur(c.lunchM),c.lunch.some(x=>x[3])?'auto':'')}${stat('Efficiency',effTxt(c.eff),c.q.toFixed(1)+' h quoted',c.eff>=1?'good':'')}</div>`;
  h+=`<div class="tk-tl"><div class="tk-trk">${gridL(a,b)}${track(c,a,b,{live:1,flags:1,w:740})}</div>${axis(a,b)}<div class="tk-leg"><span><i class="job"></i>On a job</span><span><i class="air"></i>Air — on the clock, off a job</span><span><i class="shop"></i>Shop time</span><span><i class="lunch"></i>Lunch · off the clock</span><span class="sp"></span><span class="tk-snap">Drag an edge to change a time · snap <span class="tg-seg3"><button class="${U.snap===1?'on':''}" data-a="snap" data-v="1">1 min</button><button class="${U.snap===5?'on':''}" data-a="snap" data-v="5">5 min</button></span></span></div></div>`;
  c.fixes.filter(()=>!U.fixed[U.who+k]).forEach(f=>{ h+=`<div class="tk-fix">${ic('flag',16)}<p><b>${esc(f.t)}.</b> ${esc(f.why)}.</p><button class="btn btn-sm btn-primary" data-a="pop" data-p="fix" data-f="${f.k}">Fix…</button></div>`; });
  c.soft.forEach(s=>{ if(U.fixed['air'+U.who+k+s.from]) return; h+=`<div class="tk-fix warn">${ic('info',16)}<p><b>${dur(s.to-s.from)} of air</b> from ${hm(s.from)} to ${hm(s.to)} — on the clock, not on a job.</p><button class="btn btn-sm" data-a="pop" data-p="air" data-from="${s.from}" data-to="${s.to}">Fill it…</button><button class="btn btn-sm tg-gh" data-a="airok" data-from="${s.from}">It’s right</button></div>`; });
  const al=c.lunch.find(x=>x[3]); if(al&&!c.D.autoOk) h+=`<div class="tk-fix warn auto">${ic('coffee',16)}<p><b>Lunch taken automatically.</b> No lunch clock-out by ${hm(c.segs[0][0]+360)}, 6 hours in — so 30 min came off at ${hm(al[0])}–${hm(al[1])}, where no job was running.</p><button class="btn btn-sm" data-a="lunchok">Keep it</button><button class="btn btn-sm tg-gh" data-a="lunchwork">I worked through it</button></div>`;
  /* the day, in order: clock edges, punches, air, lunch */
  const R=[]; c.segs.forEach((x,i)=>{ if(!(i&&c.segs[i-1][4])) R.push({t:x[0],kind:'in',i}); if(x[3]!=null) R.push({t:x[1],kind:'out',why:x[2],auto:x[4],to:c.segs[i+1]?c.segs[i+1][0]:null}); });
  c.ps.forEach(p=>R.push({t:p.s,kind:'p',p})); c.air.forEach(x=>{ if(x[1]-x[0]>=3) R.push({t:x[0],kind:'air',x}); });
  R.sort((x,y)=>x.t-y.t||(x.kind==='out'?-1:0));
  const over=new Set(), overO={}; c.fixes.forEach(f=>{ if(f.k==='over'){ over.add(f.a); over.add(f.b); overO[f.a]=0; overO[f.b]=1; } });
  const row=r=>{
    if(r.kind==='in') return `<div class="tk-r edge"><span class="tm">${hm(r.t)}</span><span></span><span class="wh"><span class="l1">${ic('clock',13)}Clocked in${r.i?' · back from lunch':''}</span></span><span></span></div>`;
    if(r.kind==='out'&&r.auto) return `<div class="tk-r edge auto"><span class="tm">${hm(r.t)} – ${hm(r.to)}</span><span class="du">${dur(r.to-r.t)}</span><span class="wh"><span class="l1">${ic('coffee',13)}<b>Lunch, taken automatically</b>· no lunch clock-out by 6 hours in</span></span><span></span></div>`;
    if(r.kind==='out') return `<div class="tk-r edge"><span class="tm">${hm(r.t)}</span><span></span><span class="wh"><span class="l1">${ic(r.why==='Lunch'?'coffee':'exit',13)}Clocked out · ${esc(r.why||'')}</span></span><span></span></div>`;
    if(r.kind==='air') return `<div class="tk-r air"><span class="tm">${hm(r.x[0])} – ${hm(r.x[1])}</span><span class="du">${dur(r.x[1]-r.x[0])}</span><span class="wh"><span class="l1"><i class="tk-sw air"></i><b>Air — on the clock, not on a job</b></span></span><span class="ac">${r.x[1]-r.x[0]>=10?`<button class="btn btn-sm tg-gh" data-a="pop" data-p="air" data-from="${r.x[0]}" data-to="${r.x[1]}">${ic('plus',13)}Fill</button>`:''}</span></div>`;
    const p=r.p, shp=p.ro==='SHOP', run=p.e==null, m=p.e2-p.s;
    return `<div class="tk-r${U.sel===p.id?' sel':''}${run?' run':''}${over.has(p.id)?' prob':''}" data-a="psel" data-p="${p.id}"><span class="tm">${hm(p.s)} – ${run?'now':hm(p.e)}</span><span class="du">${dur(m)}</span>
      <span class="wh"><span class="l1"><i class="tk-sw ${shp?'shop':'job'}"></i>${shp?`<b>Shop time</b><span class="cm">${esc(p.shop)}</span>`:`<span class="no">${p.ro}</span><span class="cm">${esc(ROS[p.ro][1])}</span>`}${edBadge(p)}</span>
      <span class="l2">${shp?'':`<span class="tk-rs">${esc(p.sr)}<i>→</i>${run?'<b style="color:var(--tg-good);font-weight:500">running</b>':esc(p.er||'')}</span><span>·</span>`}${shp?'<span class="nt">Counts as shop time, not on an RO</span>':p.note?`<span class="nt">${esc(p.note)}</span>`:run?'<span class="nt">Notes go in when the clock stops</span>':'<span class="nt miss">No work note</span>'}</span></span>
      <span class="ac">${run?`<button class="btn btn-sm" data-a="toast" data-t="Stopped ${p.ro} at ${hm(NOW)} — the stop reason picker opens, same as the Console.">${ic('stop',13)}Stop</button>`:(overO[p.id]!=null?`<button class="btn btn-sm" data-a="pop" data-p="fix" data-f="over" data-o="${overO[p.id]}">${ic('split',13)}Trim…</button>`:'')+`<button class="btn btn-sm ib" data-a="pop" data-p="edit" data-pid="${p.id}" title="Edit (E)">${ic('pencil',14)}</button>`}</span></div>`; };
  h+=`<div class="tk-st"><div class="tk-sth">The day, in order<span class="sp"></span><span style="font-weight:400">Click a row or a block to select it · E edits</span></div>${R.map(row).join('')}</div>`;
  /* by operation */
  const O={}; c.ps.forEach(p=>{ if(p.ro==='SHOP') return; const o=O[p.ro]||(O[p.ro]={b:0,q:0}); o.b+=(p.e2-p.s)/60; o.q+=p.q; });
  const ks=Object.keys(O);
  if(ks.length) h+=`<div class="tk-ops"><div class="tk-sth" style="margin-bottom:4px">By operation today<span class="sp"></span><span style="font-weight:400">clocked against what it pays · the line is the quote</span></div>${ks.map(r=>{ const o=O[r], mx=Math.max(o.b,o.q)*1.15; return `<div class="tk-opr"><span class="cm"><span class="no">${r}</span>${esc(ROS[r][1])}</span><span class="tk-bar" title="${o.b.toFixed(2)} h clocked · ${o.q.toFixed(1)} h quoted"><i style="width:${(o.b/mx*100).toFixed(1)}%"></i><u style="left:${(o.q/mx*100).toFixed(1)}%"></u></span><span class="v">${o.b.toFixed(2)} / ${o.q.toFixed(1)} h</span></div>`; }).join('')}</div>`;
  return h+'</div>';
}
function vWeek(){
  const ws=wkStart(U.day), a=360, b=1080; let T={c:0,j:0,air:0,s:0,q:0};
  const rows=[0,1,2,3,4,5,6].map(i=>{ const k=addD(ws,i), d=dOf(k), c=calc(U.who,k);
    if(c){ T.c+=c.clocked; T.j+=c.job; T.air+=c.airM; T.s+=c.shop; T.q+=c.q; }
    const fut=k>TODAY;
    return `<div class="tk-wr${k===U.day?' on':''}" data-a="${c?'wday':''}" data-k="${k}"><span class="dl"><b>${DN[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}</b><small>${c?(c.fixes.length&&!U.fixed[U.who+k]?`<span style="color:var(--tg-bad);font-weight:500">${esc(c.fixes[0].t)}</span>`:k===TODAY?'today':hm(c.first)+' – '+(c.last!=null?hm(c.last):'—')):fut?'—':'off'}</small></span>
      <span class="tk-wt">${c?track(c,a,b,{w:560}):''}</span>${c?`<span class="v">${dur(c.clocked)}<small>clocked</small></span><span class="v">${dur(c.job)}<small>${c.clocked?Math.round(c.job/c.clocked*100)+'% on jobs':'on jobs'}</small></span><span class="v">${effTxt(c.eff)}<small>eff.</small></span>`:'<span></span><span></span><span></span>'}</div>`; }).join('');
  const d0=dOf(ws), d6=dOf(addD(ws,6)), cap=40*60;
  return `<div class="tk-wk"><div class="tk-dh"><h2>Week of ${MNL[d0.getMonth()]} ${d0.getDate()} – ${d6.getDate()}</h2><span class="sp"></span><span class="nav"><button class="btn btn-sm ib" data-a="wnav" data-d="-7">${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="wnav" data-d="7"${ws===wkStart(TODAY)?' disabled':''}>${ic('chevR',15)}</button></span></div>
    <div class="tk-cap"><div class="m"><small><b style="color:var(--tg-ink);font:600 15px/1 var(--tg-mono)">${dur(T.c)}</b> of 40:00 · ${dur(Math.max(0,cap-T.c))} to go before overtime</small><div class="tk-capb"><i style="width:${Math.min(100,T.c/cap*100).toFixed(1)}%"></i></div></div>
    <div class="tk-stats" style="padding:0;gap:6px 26px"><div class="tk-stat"><small><i class="sw" style="background:var(--tk-job)"></i>On jobs</small><b>${dur(T.j)}<em>${T.c?Math.round(T.j/T.c*100):0}%</em></b></div><div class="tk-stat"><small><i class="sw" style="background:var(--tk-air)"></i>Air</small><b>${dur(T.air)}</b></div><div class="tk-stat"><small><i class="sw" style="background:var(--tk-shop)"></i>Shop</small><b>${dur(T.s)}</b></div><div class="tk-stat${T.j&&T.q/(T.j/60)>=1?' good':''}"><small>Efficiency</small><b>${T.j?effTxt(T.q/(T.j/60)):'—'}</b></div></div></div>
    <div class="tk-wg"><div class="tk-wr h"><span></span><span class="tk-wt" style="height:18px">${axis(a,b,2)}</span><span class="v mut" style="font-family:var(--tg-sans)">Clocked</span><span class="v mut" style="font-family:var(--tg-sans)">On jobs</span><span class="v mut" style="font-family:var(--tg-sans)">Eff.</span></div>${rows}</div>
    ${effTrend()}<div class="tk-st" style="margin-top:12px"><div class="tk-sth" style="font-weight:400">Click a day to open it · the timeline runs 06:00–18:00</div></div></div>`;
}
function vSheet(){
  const per0=PER[U.per][0], L=[]; for(let i=0;i<14;i++) L.push(addD(per0,i));
  let T={c:0,j:0,air:0,s:0,l:0}, W={c:0,j:0,air:0,s:0,l:0}; const rows=[];
  L.forEach((k,i)=>{ const c=calc(U.who,k), d=dOf(k), fut=k>TODAY;
    if(c){ ['c','j','air','s','l'].forEach((f,j)=>{ const v=[c.clocked,c.job,c.airM,c.shop,c.lunchM][j]; T[f]+=v; W[f]+=v; }); }
    const prob=c&&c.fixes.length&&!U.fixed[U.who+k];
    rows.push(c?`<tr class="${prob?'prob':''}"><td>${DN[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}</td><td>${hm(c.first)}</td><td>${c.open?(c.today?'on':'—'):hm(c.last)}</td><td>${dur(c.lunchM)}</td><td>${dur(c.clocked)}</td><td>${dur(c.job)}</td><td>${dur(c.airM)}</td><td>${dur(c.shop)}</td><td class="fl">${prob?esc(c.fixes[0].t)+' — fix before printing':c.today?'still on the clock':''}</td></tr>`
      :`<tr><td>${DN[d.getDay()]} ${d.getMonth()+1}/${d.getDate()}</td><td class="mut" colspan="7" style="text-align:left;font-family:var(--tg-sans)">${fut?'':'off'}</td><td></td></tr>`);
    if(i===6||i===13){ rows.push(`<tr class="wk"><td>Week ${i===6?1:2}</td><td></td><td></td><td>${dur(W.l)}</td><td>${dur(W.c)}</td><td>${dur(W.j)}</td><td>${dur(W.air)}</td><td>${dur(W.s)}</td><td class="fl${W.c>2400?' ot':''}">${W.c>2400?'Overtime '+dur(W.c-2400):'No overtime'}</td></tr>`); W={c:0,j:0,air:0,s:0,l:0}; } });
  const nfix=L.filter(k=>{ const c=calc(U.who,k); return c&&c.fixes.length&&!U.fixed[U.who+k]; }).length;
  return `<div class="tk-ts"><div class="tk-tsbar"><span class="nav"><button class="btn btn-sm ib" data-a="per" data-v="prev" title="The period before"${U.per==='prev'?' disabled':''}>${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="per" data-v="cur" title="This period"${U.per==='cur'?' disabled':''}>${ic('chevR',15)}</button></span><b>Pay period · ${PER[U.per][1]}</b><span class="tg-hf" style="cursor:default">${U.per==='prev'?'ended Sun 10/18 · due Fri 10/23':'two weeks, Monday to Sunday'}</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="CSV saved — one row per day, the same columns as the sheet.">${ic('download',14)}Export CSV</button><button class="btn btn-sm btn-primary" data-a="tsprint">${ic('print',14)}Print</button></div>${signBar(L)}
   <article class="tk-paper"><header><div><span class="lg">${LOGO}</span><b>Timesheet</b><small>Vanguard Truck Center · Greensboro</small></div><div class="r"><b>${esc(TECH[U.who==='ALL'?'MR':U.who])}</b><small>Technician</small><small>${PER[U.per][1]}, 2026</small>${(S.sign[sgK()]||{}).fm?`<span class="tk-stamp">${ic('lock',11)}Approved · locked</span>`:''}</div></header>
   <table><thead><tr><th>Day</th><th>In</th><th>Out</th><th>Lunch</th><th>Clocked</th><th>On jobs</th><th>Air</th><th>Shop</th><th style="text-align:left">Note</th></tr></thead><tbody>${rows.join('')}<tr class="tot"><td>Period</td><td></td><td></td><td>${dur(T.l)}</td><td>${dur(T.c)}</td><td>${dur(T.j)}</td><td>${dur(T.air)}</td><td>${dur(T.s)}</td><td class="fl">${T.c?Math.round(T.j/T.c*100)+'% on jobs':''}</td></tr></tbody></table>
   ${sigLines()}<footer>Printed from Parsec · times from the clock in / out and the punches · edited punches are marked in the day report</footer></article></div>`;
}
function vShop(){
  const k=U.day, a=360, b=1080, d=dOf(k);
  const rows=Object.keys(TECH).map(t=>{ const c=calc(t,k); if(!c) return `<div class="tk-sr"><span class="nm"><span class="tk-av lg">${t}</span><span><b>${TECH[t]}</b><small>Not in</small></span></span><span></span><span class="v">—</span><span class="v">—</span><span class="v">—</span></div>`;
    const D=c.D, lastOut=c.segs[c.segs.length-1];
    const now=k===TODAY&&c.on&&c.over>=30?`<small class="bad">${ic('flag',11)}${c.over} min past shift · ${c.run?(c.run.ro==='SHOP'?'shop time':c.run.ro):'no job'}</small>`:k===TODAY?(c.run?`<small class="on">On ${c.run.ro==='SHOP'?'shop time':c.run.ro} · ${dur(NOW-c.run.s)}</small>`:c.on?`<small class="warn">On the clock, no job for ${dur(NOW-Math.max(...c.ps.map(p=>p.e2)))}</small>`:`<small>Off the clock — ${esc((lastOut[2]||'').toLowerCase())}${D.back?', back by '+D.back:''}</small>`):`<small>${hm(c.first)} – ${c.last!=null?hm(c.last):'—'}</small>`;
    return `<div class="tk-sr" data-a="who" data-t="${t}"><span class="nm"><span class="tk-av lg">${t}</span><span><b>${TECH[t]}${nfx(t)?` <span class="tk-pill bad">${nfx(t)} to fix</span>`:''}</b>${now}</span></span><span class="tk-wt">${track(c,a,b,{w:520})}</span><span class="v">${dur(c.clocked)}<small>clocked</small></span><span class="v">${dur(c.job)}<small>${c.clocked?Math.round(c.job/c.clocked*100):0}% on jobs</small></span><span class="v">${effTxt(c.eff)}<small>eff.</small></span></div>`; }).join('');
  const all=Object.keys(TECH).map(t=>calc(t,k)).filter(Boolean), cl=all.reduce((s,c)=>s+c.clocked,0), jb=all.reduce((s,c)=>s+c.job,0), air=all.reduce((s,c)=>s+c.airM,0);
  return `<div class="tk-sh"><div class="tk-dh"><h2>${k===TODAY?'Today · ':''}${DNL[d.getDay()]}, ${MNL[d.getMonth()]} ${d.getDate()}</h2><span class="sp"></span><span class="nav"><button class="btn btn-sm ib" data-a="dnav" data-d="-1">${ic('chevL',15)}</button><button class="btn btn-sm ib" data-a="dnav" data-d="1"${k===TODAY?' disabled':''}>${ic('chevR',15)}</button></span><button class="btn btn-sm btn-primary" data-a="toast" data-t="The end-of-day sheet prints — one line per tech, open ROs and hours left.">${ic('print',14)}End-of-day sheet</button></div>
   <div class="tk-sum"><span><b>${dur(cl)}</b>clocked across the shop</span><span><b>${cl?Math.round(jb/cl*100):0}%</b>on jobs</span><span class="warn"><b>${dur(air)}</b>air</span>${(()=>{ const n=Object.keys(TECH).filter(t=>{ const x=calc(t,k); return k===TODAY&&x&&x.on&&x.over>=30; }).length; return n?`<span class="bad"><b>${n}</b>clock${n>1?'s':''} 30+ min past the shift</span>`:''; })()}<span><b>1</b>off — Luis, appointment until 15:00</span></div>
   <div class="tk-wg"><div class="tk-sr h"><span>Technician</span><span class="tk-wt" style="height:18px">${axis(a,b,2)}</span><span class="v" style="font-family:var(--tg-sans);color:var(--tg-ink3)">Clocked</span><span class="v" style="font-family:var(--tg-sans);color:var(--tg-ink3)">On jobs</span><span class="v" style="font-family:var(--tg-sans);color:var(--tg-ink3)">Eff.</span></div>${rows}</div>
   <div class="tk-st" style="margin-top:12px"><div class="tk-sth" style="font-weight:400">Click a tech to open their day · the foreman and the manager see this view, a tech sees only their own time</div></div></div>`;
}
function findP(id){ for(const t in S.D) for(const k in S.D[t]){ const p=S.D[t][k].p.find(x=>x.id===id); if(p) return {t,k,p}; } return null; }
function pop(){
  const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const st=`style="left:${p.x||400}px;top:${p.y||12}px"`;
  if(p.type==='who') return `<div class="tg-pop menu tk-pop-m" ${st}><div class="tk-mih">Whose time</div>${Object.keys(TECH).map((t,i)=>`<button class="tg-mi${U.who===t?' on':''}" data-a="who" data-t="${t}"><span class="tk-av">${t}</span>${esc(TECH[t])}</button>`).join('')}<button class="tg-mi${U.who==='ALL'?' on':''}" data-a="who" data-t="ALL"><span class="tk-av all">${ic('users',12)}</span>Whole shop<span class="meta">Shop view</span></button><div class="tk-mnote">A technician sees only their own time. The foreman and the manager can open anyone’s.</div></div>`;
  if(p.type==='add') return `<div class="tg-pop menu tk-pop-m" ${st}><button class="tg-mi" data-a="addp">${ic('clock',14)}Add a punch…<span class="meta">${kbd('A')}</span></button><button class="tg-mi" data-a="toast" data-t="Clock segment — a clock in / out typed by hand, for a day you forgot to clock.">${ic('plus',14)}Add a clock in / out…</button><div class="tk-mnote">Import CSV and Backup move to Settings → Data — they’re not day-to-day.</div></div>`;
  if(p.type==='exp') return `<div class="tg-pop menu tk-pop-m" ${st}><button class="tg-mi" data-a="toast" data-t="The day report prints.">${ic('print',14)}Day report<span class="meta">this day</span></button><button class="tg-mi" data-a="view" data-v="sheet">${ic('sheet',14)}Timesheet<span class="meta">pay period</span></button><button class="tg-mi" data-a="view" data-v="shop">${ic('users',14)}End-of-day sheet<span class="meta">every tech</span></button><button class="tg-mi" data-a="toast" data-t="CSV saved — every punch in the range.">${ic('download',14)}Export punches · CSV</button></div>`;
  if(p.type==='edit'){ const f=findP(p.pid); if(!f) return ''; const x=f.p, s=p.s!=null?p.s:hm(x.s), e=p.e!=null?p.e:hm(x.e), m=(pm(e)||0)-(pm(s)||0);
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Edit punch',`${x.ro==='SHOP'?'Shop time':x.ro} · ${short(f.k)}`)}<div class="tk-ctx">${x.ro==='SHOP'?esc(x.shop):`<b>${x.ro}</b> · ${esc(ROS[x.ro][0])}<br>${esc(ROS[x.ro][1])}`}</div>
      <div class="tk-tg"><label class="tk-f"><span>Start</span><input id="tk-s" value="${esc(s)}"></label><label class="tk-f"><span>Stop</span><input id="tk-e" value="${esc(e)}"></label><span class="tk-f"><span>Length</span><span class="ro">${m>0?dur(m):'—'}</span></span></div>
      ${x.ro==='SHOP'?'':`<span class="tg-lbl top">Started as</span><div class="tg-r">${SR.map(r=>`<button class="tg-chip${(p.sr||x.sr)===r?' on':''}" data-a="pset" data-f="sr" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>
      <span class="tg-lbl top">Stopped as</span><div class="tg-r">${ER.map(r=>`<button class="tg-chip${(p.er||x.er)===r?' on':''}" data-a="pset" data-f="er" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>
      <label class="tk-f" style="margin-top:6px"><span>Work note</span><textarea id="tk-n" rows="2" placeholder="What was done">${esc(p.n!=null?p.n:x.note)}</textarea></label>`}
      ${x.ed?`<div class="tk-was" style="margin-top:8px">${ic('history',11)} Edited — was ${esc(x.ed)}</div>`:''}
      ${whyRow(p,f.t)}<div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="pdel" style="color:var(--tg-bad)">${ic('trash',13)}Delete</button><span class="hint">${U.role==='foreman'?TF(f.t)+' sees the reason on the day':'Edits are marked on the day report'}</span><button class="btn btn-sm btn-primary" data-a="psave"${needWhy(p)?' disabled':''}>Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='fix'){ const c=calc(U.who,U.day), f=c&&c.fixes.find(x=>x.k===p.f); if(!f) return '';
    if(f.k==='noout'){ const O=[[hm(f.at),'The last punch stopped then'],['15:30','Your usual end of shift'],['','Type the time you left']];
      return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('No clock out',short(U.day))}<div class="tk-ctx">Clocked in at <b>${hm(c.D.sh[0][0])}</b> and never clocked out, so the day counts <b>${dur(c.clocked)}</b>. The last punch, ${c.ps[c.ps.length-1].ro}, stopped at <b>${hm(f.at)}</b>.</div>
      ${O.map((o,i)=>`<button class="tk-opt${p.o===i?' on':''}" data-a="fset" data-o="${i}">${kbd(i+1)}<b>${o[0]?'Clock out at '+o[0]:'Another time'}</b><small>${o[1]}</small></button>`).join('')}
      ${p.o===2?`<label class="tk-f" style="margin-top:6px"><span>Clock out at</span><input id="tk-fo" value="${esc(p.t||'')}" placeholder="15:45"></label>`:''}
      ${whyRow(p,U.who)}<div class="tg-acts"><span class="hint">The day becomes ${p.o===0?dur(f.at-c.D.sh[0][0]):p.o===1?dur(930-c.D.sh[0][0]):'—'} clocked</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o==null||needWhy(p)?' disabled':''}>Clock out${kbd('↵')}</button></div></div>`; }
    const A=c.ps.find(x=>x.id===f.a), Bp=c.ps.find(x=>x.id===f.b);
    const O=[[`End ${A.ro} at ${hm(Bp.s)}`,`${A.ro} loses ${f.to-f.from} min`],[`Start ${Bp.ro} at ${hm(A.e2)}`,`${Bp.ro} loses ${f.to-f.from} min`]];
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Punches overlap',short(U.day))}<div class="tk-ctx"><b>${A.ro}</b> ran to ${hm(A.e2)} and <b>${Bp.ro}</b> started at ${hm(Bp.s)} — the same ${f.to-f.from} minutes counted twice.</div>
      ${O.map((o,i)=>`<button class="tk-opt${p.o===i?' on':''}" data-a="fset" data-o="${i}">${kbd(i+1)}<b>${o[0]}</b><small>${o[1]}</small></button>`).join('')}
      ${whyRow(p,U.who)}<div class="tg-acts"><span class="hint">Marked as edited on both punches</span><button class="btn btn-sm btn-primary" data-a="fgo"${p.o==null||needWhy(p)?' disabled':''}>Fix it${kbd('↵')}</button></div></div>`; }
  if(p.type==='why'){ const f=findP(p.pid); if(!f) return ''; const x=f.p;
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Why the change?',`${x.ro==='SHOP'?'Shop time':x.ro} · ${p.edge==='e'?'stop':'start'} ${hm(p.o)} → ${hm(p.n)}`)}<div class="tk-ctx">This is <b>${esc(TECH[f.t])}</b>’s time. The reason shows on ${TF(f.t)}’s day and on the day report.</div>
      <div class="tg-r tk-why">${WHYS.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="pset" data-f="why" data-v="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="wcancel">Put it back</button><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="wgo"${p.why?'':' disabled'}>Save change${kbd('↵')}</button></div></div>`; }
  if(p.type==='notes'){ const ids=p.ids||(p.ids=missNotes(sgT(),perDays(U.per)).map(x=>x.p.id)), left=ids.filter(id=>{ const f=findP(id); return f&&!(f.p.note||'').trim(); }).length;
    return `<div class="tg-pop xf tk-pop-n" ${st}>${hd('Punches without a work note',PER[U.per][1])}<div class="tk-ctx">The timesheet can’t be signed until every punch has a note. Each one saves to its punch.</div>
      <div class="tk-nl">${ids.map(id=>{ const f=findP(id); if(!f) return ''; const x=f.p; return `<label class="tk-nr"><span class="m"><span class="d">${short(f.k)}</span><span class="no">${x.ro}</span><span class="cm">${esc(ROS[x.ro][1])}</span><small>${hm(x.s)}–${hm(x.e)}</small></span><input data-nid="${id}" value="${esc(x.note)}" placeholder="What was done"></label>`; }).join('')}</div>
      <div class="tg-acts"><span class="hint tk-nleft">${left?left+' left':'All done'}</span><button class="btn btn-sm btn-primary" data-a="notesgo">Done${kbd('↵')}</button></div></div>`; }
  if(p.type==='air'){ const c=calc(U.who,U.day), recent=[...new Set(c.ps.filter(x=>x.ro!=='SHOP').map(x=>x.ro))].slice(-4);
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Fill the air',`${hm(p.from)}–${hm(p.to)} · ${dur(p.to-p.from)}`)}<span class="tg-lbl top">On a job</span>${recent.map(r=>`<button class="tk-ro${p.ro===r?' on':''}" data-a="aset" data-ro="${r}"><span class="no">${r}</span><span class="cm">${esc(ROS[r][1])}</span></button>`).join('')}
      <span class="tg-lbl top" style="margin-top:8px">Or shop time</span><div class="tg-r">${SHOPW.map(w=>`<button class="tg-chip${p.ro==='SHOP'&&p.w===w?' on':''}" data-a="aset" data-ro="SHOP" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      <div class="tg-acts"><span class="hint">Adds a punch for the whole gap</span><button class="btn btn-sm btn-primary" data-a="ago"${p.ro?'':' disabled'}>Add punch${kbd('↵')}</button></div></div>`; }
  return '';
}
/* ---------- doing things ---------- */
function openPop(type,ex,el){ if(['edit','fix','air'].includes(type)&&isLocked(U.who,U.day)){ U.pop=null; toast(`Locked — ${PER.prev[1]} was approved. ${U.role==='foreman'?'Reopen it on the timesheet to change it.':'Ask Frank to reopen it.'}`,false); render(); return; } U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='day'){ U.day=t.dataset.k; U.sel=null; U.kb=false; U.pop=null; if(U.view!=='day'&&U.view!=='week') U.view='day'; render(); }
  else if(a==='wday'){ U.day=t.dataset.k; U.view='day'; U.sel=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; if(U.who==='ALL'&&(U.view==='day'||U.view==='week'||U.view==='sheet')) U.who='MR'; render(); }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p&&!t.dataset.pid){ U.pop=null; render(); return; } const ex={}; if(t.dataset.pid) ex.pid=t.dataset.pid; if(t.dataset.f) ex.f=t.dataset.f; if(t.dataset.o!=null) ex.o=+t.dataset.o; if(t.dataset.from){ ex.from=+t.dataset.from; ex.to=+t.dataset.to; } openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ whyCancel(); U.pop=null; render(); }
  else if(a==='open'){ U.open[t.dataset.k]=!U.open[t.dataset.k]; render(); }
  else if(a==='tofix'){ const G=groups(); if(G.fix.length){ U.day=G.fix[0]; U.view='day'; U.sel=null; render(); } }
  else if(a==='who'){ const w=t.dataset.t; U.pop=null; if(w==='ALL'){ U.who='ALL'; U.view='shop'; } else { U.who=w; if(U.view==='shop') U.view='day'; if(!dayOf(w,U.day)) U.day=TODAY; } U.sel=null; render(); }
  else if(a==='psel'){ U.sel=t.dataset.p; render(); }
  else if(a==='dnav'){ const L=DAYS; let i=L.indexOf(U.day)+(+t.dataset.d); if(U.view==='day'){ while(i>=0&&i<L.length&&!dayOf(U.who,L[i])) i+=(+t.dataset.d); } if(i>=0&&i<L.length){ U.day=L[i]; U.sel=null; } render(); }
  else if(a==='wnav'){ const k=addD(U.day,+t.dataset.d); if(k<=TODAY&&k>=DAYS[0]){ U.day=k; render(); } }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='pset'){ p[t.dataset.f]=t.dataset.v; render(); }
  else if(a==='psave'){ const f=findP(p.pid); if(!f) return; const s=pm($('#tk-s').value), en=pm($('#tk-e').value); if(s==null||en==null||en<=s){ toast('Stop has to come after start.',false); render(); return; } snap(); const x=f.p; if(s!==x.s||en!==x.e) x.ed=x.ed||(hm(x.s)+'–'+hm(x.e)); x.s=s; x.e=en; if(p.sr) x.sr=p.sr; if(p.er) x.er=p.er; if(U.role==='foreman'){ if(!p.why) return; x.by='Frank'; x.why=p.why; } const n=$('#tk-n'); if(n) x.note=n.value; U.pop=null; toast(`${x.ro==='SHOP'?'Shop time':x.ro} · ${hm(s)}–${hm(en)} saved.`); render(); }
  else if(a==='pdel'){ const f=findP(p.pid); if(!f) return; snap(); S.D[f.t][f.k].p=S.D[f.t][f.k].p.filter(x=>x.id!==p.pid); U.pop=null; U.sel=null; toast(`Punch deleted — ${f.p.ro==='SHOP'?'shop time':f.p.ro} ${hm(f.p.s)}–${hm(f.p.e)}.`); render(); }
  else if(a==='fset'){ p.o=+t.dataset.o; render(); if(p.o===2) $('#tk-fo')?.focus(); }
  else if(a==='fgo'){ const c=calc(U.who,U.day), f=c.fixes.find(x=>x.k===p.f); if(!f||p.o==null) return; snap(); const D=dayOf(U.who,U.day);
    if(f.k==='noout'){ const v=p.o===0?f.at:p.o===1?930:pm(($('#tk-fo')||{}).value||''); if(v==null){ toast('Type a time like 15:45.',false); render(); return; } D.sh[D.sh.length-1][1]=v; D.sh[D.sh.length-1][2]='End of day'; U.pop=null; toast(`Clocked out at ${hm(v)} on ${short(U.day)} — the day is ${dur(v-D.sh[0][0])}.`); render(); return; }
    const A=D.p.find(x=>x.id===f.a), Bp=D.p.find(x=>x.id===f.b); if(p.o===0){ A.ed=A.ed||(hm(A.s)+'–'+hm(A.e)); A.e=Bp.s; } else { Bp.ed=Bp.ed||(hm(Bp.s)+'–'+hm(Bp.e)); Bp.s=A.e; } if(U.role==='foreman') Object.assign(p.o===0?A:Bp,{by:'Frank',why:p.why}); U.pop=null; toast('Overlap fixed — both punches are marked edited.'); render(); }
  else if(a==='aset'){ p.ro=t.dataset.ro; p.w=t.dataset.w||null; render(); }
  else if(a==='ago'){ if(!p.ro) return; snap(); const D=dayOf(U.who,U.day); D.p.push(pu(p.from,p.to,p.ro,p.ro==='SHOP'?'Shop time':'Repairing',p.ro==='SHOP'?'Switched job':'Switched job','',p.ro==='SHOP'?0:Math.round((p.to-p.from)/60*10)/10,p.ro==='SHOP'?{shop:p.w,ed:'added by hand'}:{ed:'added by hand'})); U.pop=null; toast(`${dur(p.to-p.from)} added to ${p.ro==='SHOP'?'shop time · '+p.w:p.ro}.`); render(); }
  else if(a==='airok'){ snap(); U.fixed['air'+U.who+U.day+t.dataset.from]=1; toast('Kept as air.'); render(); }
  else if(a==='addp'){ U.pop=null; toast('Add a punch — pick the RO and operation, then the times. Same form as Edit.',false); render(); }
  else if(a==='snap'){ U.snap=+t.dataset.v; render(); }
  else if(a==='per'){ U.per=t.dataset.v; U.pop=null; render(); }
  else if(a==='tsign'){ snap(); S.sign[sgK()]={tech:stamp()}; toast(`Signed — ${PER[U.per][1]} goes to Frank to approve.`); render(); }
  else if(a==='tunsign'){ snap(); delete S.sign[sgK()]; toast('Signature taken back — you can change your time again.'); render(); }
  else if(a==='tapprove'){ snap(); S.sign[sgK()].fm=stamp(); toast(`Approved — ${PER[U.per][1]} is locked for ${TF(sgT())}.`); render(); }
  else if(a==='treopen'){ snap(); delete S.sign[sgK()]; toast(`Reopened — ${TF(sgT())} can change it, then signs again.`); render(); }
  else if(a==='notesgo'){ const n=missNotes(sgT(),perDays(U.per)).length, ch=p&&p._sn; U.pop=null; toast(n?`${n} punch${n>1?'es':''} still without a note.`:'Notes added — the timesheet is ready to sign.',!!ch); render(); }
  else if(a==='clkout'){ const r=clockOut(NOW); toast(`Clocked out at ${hm(NOW)}${r?' · '+(r.ro==='SHOP'?'shop time':r.ro)+' stopped — add its work note':''}.`); render(); }
  else if(a==='clkat'){ const c=calc('MR',TODAY), m=c.over; clockOut(c.shEnd); toast(`Clocked out at ${hm(c.shEnd)} — the ${m} min after don’t count. Marked edited.`); render(); }
  else if(a==='remsnz'){ U.snz=NOW+30; toast(`OK — it asks again at ${hm(NOW+30)}.`,false); render(); }
  else if(a==='ot'){ U.otAsk=true; toast('Marked overtime — Frank is asked to OK it.',false); render(); }
  else if(a==='lunchok'){ snap(); dayOf(U.who,U.day).autoOk=1; toast('Kept — lunch stays at 30 min.'); render(); }
  else if(a==='lunchwork'){ snap(); const D=dayOf(U.who,U.day), i=D.sh.findIndex(x=>x[3]==='auto'); if(i>=0&&D.sh[i+1]){ D.sh[i][1]=D.sh[i+1][1]; D.sh[i][2]=D.sh[i+1][2]; D.sh.splice(i+1,1); D.sh[i].length=3; } toast('Lunch removed — the 30 min are back on the clock as air. Fill them with the job you were on.'); render(); }
  else if(a==='trtbl'){ U.trTbl=t.dataset.v==='1'; render(); }
  else if(a==='wgo'){ const f=findP(p.pid); if(!f||!p.why) return; f.p.by='Frank'; f.p.why=p.why; U.pop=null; toast(`${f.p.ro==='SHOP'?'Shop time':f.p.ro} · ${p.edge==='e'?'stop':'start'} ${hm(p.o)} → ${hm(p.n)} · ${TF(f.t)} sees why.`); render(); }
  else if(a==='wcancel'){ whyCancel(); render(); }
  else if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }
  else if(a==='gofix'){ U.view='day'; U.day=t.dataset.k; U.note=null; U.pop=null; render(); const b=$('.tk-fix [data-a="pop"][data-p="fix"]'); if(b) openPop('fix',{f:b.dataset.f},b); }
  else if(a==='tsprint'){ const n=perDays(U.per).filter(k=>{ const c=calc(U.who,k); return c&&c.fixes.length; }).length; toast(n?`${n} day${n>1?'s':''} still need fixing — they print marked. Fix them first for a clean sheet.`:'The timesheet prints — signature lines at the bottom.',false); render(); }
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('dblclick',e=>{ const t=e.target.closest('[data-a="psel"]'); if(!t) return; const f=findP(t.dataset.p); if(f&&f.p.e!=null) openPop('edit',{pid:t.dataset.p},t); });
mock.addEventListener('input',e=>{ const p=U.pop; if(!p) return; if(e.target.id==='tk-s') p.s=e.target.value; if(e.target.id==='tk-e') p.e=e.target.value; if(e.target.id==='tk-n') p.n=e.target.value; if(e.target.id==='tk-fo') p.t=e.target.value;
  if((e.target.id==='tk-s'||e.target.id==='tk-e')){ const m=(pm(p.e!=null?p.e:'')||0)-(pm(p.s!=null?p.s:'')||0), r=$('.tk-tg .ro'); if(r) r.textContent=m>0?dur(m):'—'; } });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; if(U.drag){ tip.hidden=true; return; } const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.tk').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-290)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],.tk-note')){ whyCancel(); U.pop=null; render(); } },true);
mock.addEventListener('pointerdown',e=>{ const h=e.target.closest('.h[data-h]');
  if(U.drag&&U.drag.frozen&&!(h&&h.dataset.p===U.drag.pid)){ cancelDrag(); if(!h){ render(); return; } }
  if(!h) return; e.preventDefault(); e.stopPropagation(); const D=dayOf(U.who,U.day), p=D&&D.p.find(x=>x.id===h.dataset.p); if(!p) return;
  if(!(U.drag&&U.drag.frozen)){ snap(); U.drag={pid:p.id,edge:h.dataset.h,orig:{s:p.s,e:p.e}}; } else U.drag.edge=h.dataset.h;
  U.drag.frozen=false; U.sel=p.id; U.hov=null; U.kh=false; U.note=null; U.pop=null; $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); render(); },true);
document.addEventListener('pointermove',e=>{ if(!U.drag||U.drag.frozen) return; const tr=$('.tk-tl .tk-trk'); if(!tr||!U.ab) return; const r=tr.getBoundingClientRect();
  dragTo(U.ab[0]+(e.clientX-r.left)/r.width*(U.ab[1]-U.ab[0])); render(); });
document.addEventListener('pointerup',()=>{ if(U.drag&&!U.drag.frozen) finishDrag(); });
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.indexOf(U.day); U.day=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.sel=null; U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(U.drag&&!U.drag.frozen&&k==='Escape'){ cancelDrag(); render(); e.preventDefault(); return; }
  if(e.altKey&&(k==='ArrowLeft'||k==='ArrowRight')&&U.sel&&U.view==='day'&&!inF){ nudge(e.shiftKey?'s':'e',k==='ArrowLeft'?-U.snap:U.snap); e.preventDefault(); return; }
  if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p&&p.type==='notes'&&k==='Enter'&&e.target.dataset&&e.target.dataset.nid){ const L=$$('.tg-pop [data-nid]'), i=L.indexOf(e.target); if(i<L.length-1){ L[i+1].focus(); return stop(); } }
  if(p){ if(k==='Escape'){whyCancel();U.pop=null;render();return stop();} if(k==='Enter'&&!(e.target.tagName==='TEXTAREA')){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); } if(inF) return; const n=+k; if(n>=1&&n<=3){ $(`.tg-pop [data-a="fset"][data-o="${n-1}"]`)?.click(); return stop(); } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='ArrowLeft'||k==='ArrowRight'){ $(`[data-a="dnav"][data-d="${k==='ArrowLeft'?-1:1}"]`)?.click(); return stop(); }
  if(k==='e'){ const c=calc(U.who,U.day), x=c&&(c.ps.find(q=>q.id===U.sel)||c.ps.filter(q=>q.e!=null).slice(-1)[0]); if(x&&x.e!=null){ U.sel=x.id; render(); const el=$(`.tk-r[data-p="${x.id}"]`); openPop('edit',{pid:x.id},el); } return stop(); }
  if(k==='a'){ const b=$('[data-a="pop"][data-p="add"]'); if(b) openPop('add',{},b); return stop(); }
  if(k>='1'&&k<='4'){ if(k==='4'&&U.role==='tech') return stop(); U.view=['day','week','sheet','shop'][+k-1]; if(U.view==='shop') U.who=U.who; else if(U.who==='ALL') U.who='MR'; render(); return stop(); }
});
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; if(['edit','fix','air'].includes(U.pop.type)) x=Math.min(U.pop.ax+(U.pop.aw||0)-pw,W-pw-16); y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); }
    else { x=W-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tk-di.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  const f=$('.tg-pop #tk-s'); if(f&&U.pop&&!U.pop._f){ U.pop._f=1; f.focus(); f.select(); }
  ideasAfter();
  note();
}
const NOTE={
 1:{r:'.tk-bub',at:'right',t:'Drag an edge',p:'Grab either end of a punch and drag. The time follows the pointer, clicks to the next job and stops at the clock. Let go to save, with Undo.'},
 2:{r:'.tk-remind',at:'left',t:'Shift-end reminder',p:'Your shift ended at 15:30 and you’re still on the clock. Stop and clock out in one click, or keep working and it asks again in 30 minutes.'},
 3:{r:'.tk-lunch.auto',n:'.tk-fix.auto',al:'right',t:'Lunch, taken automatically',p:'No lunch clock-out by 6 hours in, so 30 minutes come off where no job was running, marked AUTO. Keep it, or say you worked through it.'},
 4:{r:'.tk-remind',at:'left',t:'30 minutes past the shift',p:'The reminder turns red and the foreman sees it too. Clock out at 15:30 if you forgot, clock out now, or mark it overtime. View as Foreman → Shop shows the flag.'},
 5:{r:'.tk-sgn',n:'.tk-sgn',al:'right',t:'Pay-period sign-off',p:'Mike signs, Frank approves, and the period locks: no more changes to those days unless Frank reopens it. Approve here, then open a day from Oct 5 – 18.'},
 6:{r:'.tg-pop',at:'right',t:'A reason to change someone’s time',p:'When the foreman drags, edits or fixes a tech’s punch, he picks why. Save stays off until he does. The tech sees the reason on the punch.'},
 7:{r:'.tk-trend',t:'Efficiency, week by week',p:'Eight weeks on the Week view. The dashed line is 100% — quoted hours equal hours on the job. Hover a week for the hours; Table shows the numbers.'},
 8:{r:'.tg-pop',at:'right',t:'Notes before signing',p:'A punch without a work note blocks the signature. Add them right here; each saves to its punch. Then Sign turns on.'}
};
function box(sels){ const L=[].concat(sels).map(s=>$(s)).filter(Boolean); if(!L.length) return null; const tk=$('.tk').getBoundingClientRect(); let l=1e9,t=1e9,r=-1e9,b=-1e9;
  L.forEach(e=>{ const x=e.getBoundingClientRect(); l=Math.min(l,x.left); t=Math.min(t,x.top); r=Math.max(r,x.right); b=Math.max(b,x.bottom); }); return {l:(l-tk.left)/scale,t:(t-tk.top)/scale,r:(r-tk.left)/scale,b:(b-tk.top)/scale}; }
const pick=s=>Array.isArray(s)?s.find(x=>$(x)):s;
function note(){ const nt=$('.tk-note'), rg=$('.tk-ring'), tk=$('.tk'); if(!nt||!rg||!tk) return; const N=U.note&&NOTE[U.note]; const R=N?(N.u?box(N.u):box(pick(N.r))):null;
  if(!R){ nt.hidden=true; rg.hidden=true; return; }
  rg.hidden=false; Object.assign(rg.style,{left:(R.l-5)+'px',top:(R.t-5)+'px',width:(R.r-R.l+10)+'px',height:(R.b-R.t+10)+'px'});
  nt.innerHTML=`<div class="h"><span class="n">${U.note}</span><b>${esc(N.t)}</b><button data-a="notex" title="Close">${ic('x',13)}</button></div><p>${esc(N.p)}</p>`; nt.hidden=false;
  const A=(N.n&&box(pick(N.n)))||R, W=tk.offsetWidth, H=tk.offsetHeight, nw=nt.offsetWidth, nh=nt.offsetHeight; let x, y;
  if(N.at==='right'&&A.r+nw+16<W-12){ x=A.r+16; y=A.t-6; } else if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; } else { x=N.al==='right'?A.r-nw:A.l; y=A.b+12; if(y+nh>H-12) y=A.t-nh-16; }
  nt.style.left=Math.round(Math.max(12,Math.min(x,W-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const P1=()=>calc('MR',TODAY).ps[0].id, P3=()=>calc('MR',TODAY).ps[2].id;
function frozen(pid,edge,val){ const D=dayOf(U.who,U.day), p=D.p.find(x=>x.id===pid); render(); snap(); U.drag={pid,edge,orig:{s:p.s,e:p.e},frozen:true}; U.sel=pid; dragTo(val); }
const fillNotes=(t,per)=>missNotes(t,perDays(per)).forEach(x=>{ x.p.note=NOTES[0]; });
const DEMO={
  d1:()=>{reset();setRole('tech');frozen(P1(),'e',520);U.note=1;render();},
  d2:()=>{reset();setRole('tech');NOW=932;U.note=2;render();},
  d3:()=>{reset();setRole('tech');U.day='2026-10-20';U.note=3;render();},
  d4:()=>{reset();setRole('tech');NOW=962;U.note=4;render();},
  d5:()=>{reset();setRole('foreman');U.who='MR';U.view='sheet';U.per='prev';fillNotes('MR','prev');S.sign.MRprev={tech:'Wed 10/21 15:41'};U.note=5;render();},
  d6:()=>{reset();setRole('foreman');U.who='MR';frozen(P1(),'e',520);finishDrag();U.note=6;render();},
  d7:()=>{reset();setRole('tech');U.view='week';U.note=7;render();const s=$('.tk-wk'),t=$('.tk-trend');if(s&&t&&s.scrollHeight>s.clientHeight){s.scrollTop=t.offsetTop-80;note();}},
  d8:()=>{reset();setRole('tech');U.view='sheet';U.per='prev';render();const b=$('.tk-bk.warn');openPop('notes',{},b);U.note=8;render();},
  try:()=>{reset();render();}
};
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ setRole(b.dataset.role); U.pop=null; render(); }));
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__tk={S:()=>S,U:()=>U,render,reset,openPop,DEMO,calc};
reset(); render();
