const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const p2=n=>String(n).padStart(2,'0');
const mn=s=>{ const [h,m]=s.split(':').map(Number); return h*60+m; };
const hm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const dur=m=>Math.floor(m/60)+':'+p2(Math.round(m%60));
const h1=n=>(Math.round(n*10)/10).toFixed(1);
const pct=n=>n==null?'—':Math.round(n*100)+'%';

/* ---------- Thursday, October 22 — the numbers are made up but add up ---------- */
const TECH={MR:{n:'Mike Rodriguez',r:'Technician',end:'15:30'},DK:{n:'Dana Kowalski',r:'Technician',end:'15:30'},PS:{n:'Priya Shah',r:'Technician',end:'16:00'},LM:{n:'Luis Martinez',r:'Technician',off:'Vacation'}};
const ROS={
 '37742':{cu:'Summit Freightways',un:'2019 Freightliner Cascadia · #4471'},
 '37720':{cu:'Ridgeline Logistics',un:'2021 Kenworth T680 · #218'},
 '37750':{cu:'Hartley Produce',un:'2018 Volvo VNL · #12'},
 '37761':{cu:'Summit Freightways',un:'2020 Freightliner Cascadia · #4502',war:1},
 '37768':{cu:'Coastal Beverage',un:'2022 International LT · #31'},
 '37733':{cu:'Mesa Aggregates',un:'2017 Peterbilt 567 · #9'},
 '37790':{cu:'Ridgeline Logistics',un:'2020 Kenworth W990 · #240'},
};
const DAY={
 MR:{in:'07:02',out:'15:28',why:'End of day',lunch:['11:30','12:00'],p:[
   {s:'07:10',e:'09:05',ro:'37742',op:1,cmp:'Air leak at the dryer – diagnose',q:1.5,a:'Diagnosing',b:'Switched job',left:'Quoted, waiting on OK',note:'Purge valve leaking at the dryer — quoted the valve and a cartridge.'},
   {s:'09:20',e:'11:30',ro:'37720',op:2,cmp:'74-point inspection',q:2.5,a:'Inspecting',b:'Complete',left:'Done',note:'74-point done — brakes at 40%, wipers. Photos on the RO.'},
   {s:'12:00',e:'12:40',ro:'SHOP',cmp:'Bay clean-up',a:'Shop time',b:'Switched job',note:'Swept bay 3, restocked the cart.'},
   {s:'12:40',e:'15:10',ro:'37750',op:1,cmp:'A/C not cooling – compressor clutch',q:3.0,a:'Repairing',b:'Waiting – Approval',left:'Waiting on approval',note:'Compressor clutch open — quote sent for the clutch kit.',ed:{was:'12:45',what:'Start',by:'Frank',why:'Forgot to punch in — was already at the truck'}}],
   airOk:{'15:10':'It’s right · putting tools away'}, sign:null},
 DK:{in:'06:58',out:'15:31',why:'End of day',lunch:['11:45','12:15'],p:[
   {s:'07:00',e:'10:10',ro:'37761',op:1,cmp:'EGR cooler leaking – replace',q:3.6,a:'Repairing',b:'Complete',left:'Done · warranty claim ready',note:'EGR cooler replaced, pressure test good, claim photos on the RO.'},
   {s:'10:25',e:'11:45',ro:'37768',op:1,cmp:'PM-B service',q:1.4,a:'Servicing',b:'Complete',left:'Done',note:'PM-B done, fuel filters, grease.'},
   {s:'12:15',e:'14:55',ro:'37768',op:2,cmp:'Front brake shoes & drums',q:2.8,a:'Repairing',b:'Complete',left:'Done',note:'Shoes and drums both sides, adjusted, road tested.'},
   {s:'15:00',e:'15:25',ro:'SHOP',cmp:'Training – new scan tool',a:'Shop time',b:'End of day',note:'Went through the new scan tool with Ben.'}],
   airOk:{'10:10':'It’s right · parts run'}, sign:{tech:'Dana Kowalski',tAt:'Thu 15:34',fm:'Frank Diaz',fAt:'Fri 07:05'}},
 PS:{in:'07:30',out:'16:02',why:'End of day',lunch:['13:30','14:00'],auto:1,p:[
   {s:'07:35',e:'09:50',ro:'37733',op:3,cmp:'Coolant leak at the water pump',q:2.0,a:'Repairing',b:'Waiting – Parts',left:'Waiting on the pump',note:'Water pump weeping at the weep hole — pump on order, ETA Monday.'},
   {s:'10:40',e:'13:30',ro:'37790',op:1,cmp:'Check engine light – DEF dosing',q:2.5,a:'Diagnosing',b:'Complete',left:'Done',note:''},
   {s:'14:00',e:'15:55',ro:'37790',op:2,cmp:'Replace DEF doser',q:1.8,a:'Repairing',b:'Complete',left:'Done',note:'Doser replaced, forced regen OK.'}],
   airOk:{}, sign:{tech:'Priya Shah',tAt:'Thu 16:03'}},
 LM:null,
};
const ORDER=['MR','DK','PS','LM'];

function calc(t){
  const D=DAY[t]; if(!D) return null;
  const I=mn(D.in), O=mn(D.out), L=D.lunch.map(mn);
  const segs=[];   // every minute of the day, in order
  const ps=D.p.map(p=>({...p,S:mn(p.s),E:mn(p.e)})).sort((a,b)=>a.S-b.S);
  let cur=I;
  const gap=(a,b)=>{ if(b-a<=0) return; if(a<L[1]&&b>L[0]){ gap(a,L[0]); segs.push({k:'lun',S:L[0],E:L[1],auto:D.auto}); gap(L[1],b); return; } segs.push({k:'air',S:a,E:b,ok:D.airOk[hm(a)]||null}); };
  ps.forEach(p=>{ gap(cur,p.S); segs.push({k:p.ro==='SHOP'?'shop':'job',S:p.S,E:p.E,p}); cur=p.E; });
  gap(cur,O);
  if(!segs.some(s=>s.k==='lun')){ /* lunch inside no gap — shouldn't happen here */ }
  const sum=k=>segs.filter(s=>s.k===k).reduce((a,s)=>a+s.E-s.S,0);
  const job=sum('job'), air=sum('air'), shop=sum('shop'), lun=sum('lun'), cl=O-I-lun;
  const jobsBy={}; ps.filter(p=>p.ro!=='SHOP').forEach(p=>{ const k=p.ro+'·'+p.op; if(!jobsBy[k]) jobsBy[k]={ro:p.ro,op:p.op,cmp:p.cmp,q:p.q,m:0,n:0,left:p.left,b:p.b}; jobsBy[k].m+=p.E-p.S; jobsBy[k].n++; jobsBy[k].left=p.left; jobsBy[k].b=p.b; });
  const jobs=Object.values(jobsBy); const q=jobs.reduce((a,j)=>a+j.q,0);
  const flags=[];
  segs.filter(s=>s.k==='air'&&s.E-s.S>=10&&!s.ok).forEach(s=>flags.push({k:'r',t:`<b>${dur(s.E-s.S)} of air</b> ${hm(s.S)} – ${hm(s.E)} — not explained`,sh:`${dur(s.E-s.S)} air not explained`,S:s.S}));
  ps.filter(p=>p.ro!=='SHOP'&&!p.note).forEach(p=>flags.push({k:'a',t:`<b>${p.ro}</b> ${hm(p.S)} – ${hm(p.E)} — no work note`,sh:`${p.ro} has no work note`,S:p.S}));
  if(D.auto) flags.push({k:'a',t:`<b>Lunch taken automatically</b> ${hm(L[0])} – ${hm(L[1])} — no lunch clock-out by 6 hours in`,sh:'lunch taken automatically',S:L[0]});
  const eds=ps.filter(p=>p.ed);
  const end=mn(TECH[t].end), past=O-end;
  return {D,I,O,L,segs,ps,job,air,shop,lun,cl,jobs,q,eff:job?q/(job/60):null,flags,eds,past,end,ros:new Set(jobs.map(j=>j.ro)).size};
}

/* ---------- state ---------- */
let U;
function reset(){ U={opt:'A',who:'MR',pop:false,pv:false,sign:{}}; Object.keys(DAY).forEach(t=>{ if(DAY[t]&&DAY[t].sign) U.sign[t]={...DAY[t].sign}; }); }
reset();

/* ---------- pieces ---------- */
const A0=6*60, A1=17*60;
const X=m=>((m-A0)/(A1-A0)*100).toFixed(2)+'%', W=(a,b)=>((b-a)/(A1-A0)*100).toFixed(2)+'%';
function track(c,big){
  let h=`<div class="dr-trk"><span class="k" style="left:${X(c.I)};width:${W(c.I,c.O)}"></span>`;
  c.segs.forEach(s=>{ const w=(s.E-s.S)/(A1-A0)*(big?820:300); const lab=big&&w>34?(s.k==='job'?s.p.ro:s.k==='shop'?'Shop':s.k==='lun'?'':''):'';
    h+=`<span class="b ${s.k}${s.k==='air'&&!s.ok&&s.E-s.S>=10?' prob':''}${s.auto?' auto':''}" style="left:${X(s.S)};width:${W(s.S,s.E)}">${lab}</span>`; });
  if(big){ h+=`<span class="f" style="left:${X(c.I)}">IN</span><span class="f o" style="left:${X(c.O)}">OUT</span>`; if(c.end) h+=`<span class="se" style="left:${X(c.end)}" title="Shift ends ${hm(c.end)}"></span>`; }
  return h+'</div>';
}
function axis(){ let h='<div class="dr-ax">'; for(let x=6;x<=17;x++) h+=`<span style="left:${X(x*60)}">${p2(x)}</span>`; return h+'</div>'; }
function legend(){ return `<div class="dr-leg"><span><i style="background:#96621f"></i>On a job</span><span><i style="background:#2a9d8f"></i>Air — on the clock, off a job</span><span><i style="background:#6250d6"></i>Shop time</span><span><i class="lun"></i>Lunch</span><span><i class="se"></i>Shift ends</span></div>`; }
const AV=t=>t==='ALL'?'<span class="tk-av all">'+ic('users',12)+'</span>':`<span class="tk-av">${t}</span>`;
function signed(t){ return U.sign[t]||{}; }
function stamp(t){ const s=signed(t); return s.fm?`<span class="tk-stamp">${ic('lock',10)}Approved · locked</span>`:s.tech?`<span class="tk-stamp todo">Signed by tech · waiting on the foreman</span>`:`<span class="tk-stamp todo">Not signed yet</span>`; }
function sigs(t){ const s=signed(t); return `<div class="tk-sig"><div>${s.tech?`<i>${esc(s.tech)}<small>${s.tAt}</small></i>`:''}Technician</div><div>${s.fm?`<i>${esc(s.fm)}<small>${s.fAt}</small></i>`:''}Foreman</div></div>`; }
const LEFT=b=>/Complete/.test(b)?'g':/Waiting/.test(b)?'a':'';

/* ---------- the sheet for one tech ---------- */
function sheet(t){
  const T=TECH[t], c=calc(t);
  let h=`<div class="tk-paper dr-paper"><header><div class="t"><span class="lg">${LOGO}</span><b>Day report</b><small>Parsec · Thursday, October 22, 2026</small></div>
    <div class="r"><b>${T.n}</b><small>${T.r} · shift 07:00 – ${T.end}</small><small>${hm(c.I)} – ${hm(c.O)} · ${c.ps.length} punches · ${c.ros} RO${c.ros===1?'':'s'}</small>${stamp(t)}</div></header>`;
  h+=`<div class="dr-tot">
    <div><small>Clocked</small><b>${dur(c.cl)}</b></div>
    <div><small><i style="background:#96621f"></i>On jobs</small><b>${dur(c.job)}<em>${Math.round(c.job/c.cl*100)}%</em></b></div>
    <div><small><i style="background:#2a9d8f"></i>Air</small><b>${dur(c.air)}</b></div>
    <div><small><i style="background:#6250d6"></i>Shop</small><b>${dur(c.shop)}</b></div>
    <div><small>Lunch</small><b>${dur(c.lun)}${c.D.auto?'<em class="r">auto</em>':''}</b></div>
    <div><small>Quoted</small><b>${h1(c.q)}<em>h</em></b></div>
    <div><small>Efficiency</small><b style="color:${c.eff>=1?'#2c7350':'#a8402e'}">${pct(c.eff)}</b></div></div>`;
  h+=`<div class="dr-h3">The day<span class="sp"></span><small>06:00 – 17:00</small></div><div class="dr-tl">${track(c,true)}${axis()}</div>${legend()}`;
  /* jobs */
  h+=`<div class="dr-h3">Jobs<small>${c.jobs.length} operation${c.jobs.length===1?'':'s'} on ${c.ros} RO${c.ros===1?'':'s'}</small></div><table><thead><tr><th class="l">RO</th><th class="l">Customer · unit</th><th class="l">Operation</th><th>Time today</th><th>Quoted</th><th>Eff.</th><th class="l">Left as</th></tr></thead><tbody>`;
  c.jobs.forEach(j=>{ const R=ROS[j.ro], e=j.m?j.q/(j.m/60):null;
    h+=`<tr><td class="l"><span class="dr-ro">${j.ro}</span><small>Op ${j.op}${R.war?' · warranty':''}</small></td><td class="l s">${esc(R.cu)}<small>${esc(R.un)}</small></td><td class="l s w">${esc(j.cmp)}</td><td>${dur(j.m)}</td><td>${h1(j.q)}</td><td><span class="${e>=1?'g':'r'}">${pct(e)}</span></td><td class="l s"><span class="${LEFT(j.b)}">${esc(j.left)}</span></td></tr>`; });
  h+=`<tr class="tot"><td class="l" colspan="3">On jobs</td><td>${dur(c.job)}</td><td>${h1(c.q)}</td><td>${pct(c.eff)}</td><td></td></tr></tbody></table>`;
  /* the day in order */
  h+=`<div class="dr-h3">The day, in order<small>every clock edge and punch · ✎ marks a time someone changed</small></div><table class="dr-ord"><thead><tr><th class="l" style="width:104px">Time</th><th style="width:48px">Length</th><th class="l">What</th><th class="l" style="width:170px">Started → stopped</th><th class="l">Work note</th></tr></thead><tbody>`;
  h+=`<tr class="edge"><td class="l">${hm(c.I)}</td><td></td><td class="l s"><b>Clocked in</b></td><td></td><td></td></tr>`;
  c.segs.forEach(s=>{ const tm=`${hm(s.S)} – ${hm(s.E)}`, L_=dur(s.E-s.S);
    if(s.k==='air'){ const bad=!s.ok&&s.E-s.S>=10; h+=`<tr class="air${bad?' prob':''}"><td class="l">${tm}</td><td>${L_}</td><td class="l s"><span class="dr-sw air"></span>Air — on the clock, not on a job${bad?'<span class="dr-tag">not explained</span>':''}</td><td></td><td class="note">${s.ok?`<span class="dr-tag ok" style="margin-left:0">${esc(s.ok)}</span>`:''}</td></tr>`; return; }
    if(s.k==='lun'){ h+=`<tr class="lun"><td class="l">${tm}</td><td>${L_}</td><td class="l s"><span class="dr-sw lun"></span>${s.auto?'Lunch, taken automatically<span class="dr-tag a">auto</span>':'Lunch · off the clock'}</td><td></td><td class="note">${s.auto?'No lunch clock-out by 6 hours in — 30 min came off where no job was running.':''}</td></tr>`; return; }
    const p=s.p, R=ROS[p.ro];
    h+=`<tr${!p.note&&p.ro!=='SHOP'?' class="prob"':''}><td class="l">${tm}</td><td>${L_}</td><td class="l s w"><span class="dr-sw ${s.k}"></span>${p.ro==='SHOP'?'<b>Shop time</b> · '+esc(p.cmp):`<b class="dr-ro">${p.ro}</b> ${esc(p.cmp)}<small>${esc(R.cu)}</small>`}${p.ed?`<span class="dr-ed">${ic('pencil',11)}${p.ed.what} was ${p.ed.was} · changed by ${p.ed.by}</span>`:''}</td><td class="l s">${esc(p.a)} → ${esc(p.b)}</td><td class="note">${p.note?esc(p.note):'<span class="dr-tag">no work note</span>'}${p.ed?`<span class="dr-ed" style="color:#67625a">Why: ${esc(p.ed.why)}</span>`:''}</td></tr>`; });
  h+=`<tr class="edge"><td class="l">${hm(c.O)}</td><td></td><td class="l s"><b>Clocked out</b> · ${esc(c.D.why)}</td><td></td><td class="note">${c.past>=30?`<span class="dr-tag">${c.past} min past the shift</span>`:`shift ends ${hm(c.end)}`}</td></tr></tbody></table>`;
  /* checks */
  const ok=[];
  if(!c.ps.some(p=>p.ro!=='SHOP'&&!p.note)) ok.push('Every job punch has a work note');
  if(!c.D.auto) ok.push(`Lunch ${dur(c.lun)}, clocked out and back in`);
  if(c.past<30) ok.push(`Clocked out ${hm(c.O)} · shift ends ${hm(c.end)}`);
  if(!c.segs.some(s=>s.k==='air'&&!s.ok&&s.E-s.S>=10)) ok.push('All air over 10 min is explained');
  h+=`<div class="dr-h3">Checks<small>${c.flags.length?c.flags.length+' to look at':'nothing to look at'}${c.eds.length?' · '+c.eds.length+' time changed':''}</small></div><div class="dr-chk">`;
  c.flags.forEach(f=>{ h+=`<div><span class="m ${f.k}">${ic('flag',11)}</span><span>${f.t}</span></div>`; });
  c.eds.forEach(p=>{ h+=`<div><span class="m n">${ic('pencil',11)}</span><span><b>${p.ro}</b> ${p.ed.what.toLowerCase()} ${p.ed.was} → ${p.s} · ${p.ed.by} · “${esc(p.ed.why)}”</span></div>`; });
  ok.forEach(o=>{ h+=`<div><span class="m">${ic('check',11)}</span><span>${o}</span></div>`; });
  h+=`</div>${sigs(t)}<footer>Printed from Parsec · Fri, Oct 23, 2026 07:12 · times are 24-hour · efficiency is quoted hours ÷ hours on jobs · air is clocked time on no job and not lunch</footer></div>`;
  return h;
}

/* ---------- the whole shop on one sheet ---------- */
function shopSheet(){
  const C=ORDER.map(t=>[t,calc(t)]), on=C.filter(x=>x[1]);
  const S=k=>on.reduce((a,x)=>a+x[1][k],0); const cl=S('cl'), job=S('job'), air=S('air'), shop=S('shop'), q=S('q');
  let h=`<div class="tk-paper dr-paper"><header><div class="t"><span class="lg">${LOGO}</span><b>Shop day report</b><small>Parsec · Thursday, October 22, 2026</small></div>
    <div class="r"><b>Every technician</b><small>${on.length} of ${ORDER.length} in · ${ORDER.length-on.length} off</small><small>${on.reduce((a,x)=>a+x[1].ps.length,0)} punches · ${new Set(on.flatMap(x=>x[1].jobs.map(j=>j.ro))).size} ROs</small>${on.every(x=>signed(x[0]).fm)?`<span class="tk-stamp">${ic('lock',10)}Every day approved</span>`:`<span class="tk-stamp todo">${on.filter(x=>signed(x[0]).fm).length} of ${on.length} days approved</span>`}</div></header>`;
  h+=`<div class="dr-tot">
    <div><small>Clocked</small><b>${dur(cl)}</b></div>
    <div><small><i style="background:#96621f"></i>On jobs</small><b>${dur(job)}<em>${Math.round(job/cl*100)}%</em></b></div>
    <div><small><i style="background:#2a9d8f"></i>Air</small><b>${dur(air)}</b></div>
    <div><small><i style="background:#6250d6"></i>Shop</small><b>${dur(shop)}</b></div>
    <div><small>Quoted</small><b>${h1(q)}<em>h</em></b></div>
    <div><small>Efficiency</small><b>${pct(q/(job/60))}</b></div>
    <div><small>To look at</small><b>${on.reduce((a,x)=>a+x[1].flags.length,0)}<em>flags</em></b></div></div>`;
  h+=`<div class="dr-h3">Who worked<span class="sp"></span><small>06:00 – 17:00</small></div><table class="dr-shop"><thead><tr><th class="l">Technician</th><th class="l">The day</th><th>In</th><th>Out</th><th>Clocked</th><th>On jobs</th><th>Air</th><th>Eff.</th><th class="l">Status</th></tr></thead><tbody>`;
  C.forEach(([t,c])=>{ const T=TECH[t];
    if(!c){ h+=`<tr class="off"><td class="l"><span class="who">${AV(t)}${esc(T.n)}</span></td><td class="l s" colspan="7">Off · ${esc(T.off)}</td><td></td></tr>`; return; }
    const s=signed(t); h+=`<tr><td class="l"><span class="who">${AV(t)}${esc(T.n)}</span></td><td class="tl">${track(c,false)}</td><td>${hm(c.I)}</td><td>${hm(c.O)}</td><td>${dur(c.cl)}</td><td>${dur(c.job)}</td><td>${dur(c.air)}</td><td><span class="${c.eff>=1?'g':'r'}">${pct(c.eff)}</span></td><td class="l s">${s.fm?'<span class="g">Approved</span>':c.flags.length?`<span class="r">${c.flags.length} to look at</span>`:s.tech?'Signed':'<span class="mu">Not signed</span>'}</td></tr>`; });
  h+=`<tr class="ax"><td></td><td class="tl">${axis()}</td><td colspan="7"></td></tr>`;
  h+=`<tr class="tot"><td class="l" colspan="4">The shop</td><td>${dur(cl)}</td><td>${dur(job)}</td><td>${dur(air)}</td><td>${pct(q/(job/60))}</td><td></td></tr></tbody></table>`;
  h+=`<div class="dr-h3">Jobs worked<small>by RO · time today across every tech</small></div><table><thead><tr><th class="l">RO</th><th class="l">Customer · unit</th><th class="l">Operation</th><th class="l">Tech</th><th>Time today</th><th>Quoted</th><th class="l">Left as</th></tr></thead><tbody>`;
  on.flatMap(([t,c])=>c.jobs.map(j=>({...j,t}))).sort((a,b)=>a.ro.localeCompare(b.ro)||a.op-b.op).forEach(j=>{ const R=ROS[j.ro];
    h+=`<tr><td class="l"><span class="dr-ro">${j.ro}</span><small>Op ${j.op}${R.war?' · warranty':''}</small></td><td class="l s">${esc(R.cu)}<small>${esc(R.un)}</small></td><td class="l s w">${esc(j.cmp)}</td><td class="l s">${esc(TECH[j.t].n.split(' ')[0])}</td><td>${dur(j.m)}</td><td>${h1(j.q)}</td><td class="l s"><span class="${LEFT(j.b)}">${esc(j.left)}</span></td></tr>`; });
  h+=`</tbody></table>`;
  h+=`<div class="dr-h3">To look at<small>from every tech’s day</small></div><div class="dr-chk">`;
  on.forEach(([t,c])=>{ c.flags.forEach(f=>{ h+=`<div><span class="m ${f.k}">${ic('flag',11)}</span><span><b>${esc(TECH[t].n.split(' ')[0])}</b> · ${f.t.replace(/<\/?b>/g,'')}</span></div>`; }); c.eds.forEach(p=>{ h+=`<div><span class="m n">${ic('pencil',11)}</span><span><b>${esc(TECH[t].n.split(' ')[0])}</b> · ${p.ro} ${p.ed.what.toLowerCase()} ${p.ed.was} → ${p.s}, changed by ${p.ed.by}</span></div>`; }); });
  h+=`<div><span class="m n">${ic('user',11)}</span><span><b>Luis</b> · off — vacation</span></div></div>`;
  h+=`<div class="tk-sig"><div>Foreman</div><div>Manager</div></div><footer>Printed from Parsec · Fri, Oct 23, 2026 07:12 · each tech’s own Day report has their punches line by line</footer></div>`;
  return h;
}

/* ---------- the screen ---------- */
function nav(){
  const G=[['',[['inbox','Inbox',21],['console','Console'],['triage','Triage'],['ros','RO List',20]]],['Shop',[['foreman','Foreman',5],['warranty','Warranty',54],['manager','Manager'],['parts','Parts']]],['You',[['timelog','Time Log'],['fixes','Fixes'],['career','Career']]]];
  return `<aside class="nv open"><div class="nv-top"><button class="nv-row nv-brand"><span class="nv-ic"><span class="lg">${LOGO}</span></span><span class="nv-tl"><b>Parsec</b></span></button><button class="nv-col">${ic('sidebar',16)}</button></div>
   <button class="nv-row nv-find"><span class="nv-ic">${ic('search',18)}</span><span class="nv-tl">Search</span><span class="nv-kbd">Ctrl K</span></button>
   <button class="nv-row nv-clk job"><span class="nv-ic"><i class="dot"></i></span><span class="nv-tl"><b>On the clock · 0:12</b><small>Frank Diaz · Foreman</small></span></button>
   <div class="nv-gh"><span></span></div>${G.map(([g,L],gi)=>`${gi?`<div class="nv-gh"><span>${g}</span></div>`:''}${L.map(x=>`<button class="nv-row${x[0]==='timelog'?' on':''}"><span class="nv-ic">${ic(x[0],18)}</span><span class="nv-tl">${x[1]}</span>${x[2]?`<span class="nv-n">${x[2]}</span>`:''}</button>`).join('')}`).join('')}
   <span class="nv-sp"></span><button class="nv-row nv-me"><span class="nv-ic"><span class="nv-av">FD</span></span><span class="nv-tl"><b>Frank Diaz</b><small>Foreman</small></span></button></aside>`;
}
function head(){
  const w=U.opt==='C'?'ALL':U.who, nm=w==='ALL'?'Whole shop':TECH[w].n;
  let facts='';
  if(w!=='ALL'){ const c=calc(w); facts=`<span class="tg-hf"><b>${dur(c.cl)}</b>clocked</span><i>·</i><span class="tg-hf"><b>${pct(c.eff)}</b>efficiency</span>${c.flags.length?`<i>·</i><span class="tg-hf w"><b>${c.flags.length}</b>to look at</span>`:''}`; }
  else facts=`<span class="tg-hf"><b>3 of 4</b>in</span><i>·</i><span class="tg-hf w"><b>${ORDER.filter(t=>DAY[t]).reduce((a,t)=>a+calc(t).flags.length,0)}</b>to look at</span>`;
  return `<div class="tg-head"><h1 class="tg-h1">Day report</h1>${U.opt==='B'?'':`<button class="tk-who" data-a="pop">${AV(w)}${esc(nm)}${ic('chevD',12)}</button>`}
    <span class="dr-dn"><button class="btn btn-sm ib" data-a="toast" title="Day before">${ic('chevL',15)}</button><b>Thu, Oct 22</b><button class="btn btn-sm ib" data-a="toast" title="Day after">${ic('chevR',15)}</button></span>
    <div class="tg-facts">${U.opt==='B'?'':facts}</div><span class="sp"></span>
    <button class="btn btn-sm tg-gh" data-a="toast">${ic('timelog',14)}Time Log</button><button class="btn btn-sm" data-a="toast">${ic('file',14)}Save PDF</button><button class="btn btn-sm btn-primary" data-a="pv">${ic('print',14)}Print</button></div>`;
}
function bar(t){
  const c=calc(t), s=signed(t);
  if(s.fm) return `<div class="dr-bar ok">${ic('lock',16)}<span><b>Approved by ${esc(s.fm.split(' ')[0])}</b> · ${s.fAt} — the day is locked; changes go through the manager.</span></div>`;
  if(!c.flags.length) return `<div class="dr-bar ok">${ic('check',16)}<span><b>Nothing to look at.</b> ${s.tech?esc(TECH[t].n.split(' ')[0])+' signed at '+s.tAt+'.':'Waiting on '+esc(TECH[t].n.split(' ')[0])+'’s signature.'}</span>${U.opt==='B'?`<button class="btn btn-sm btn-primary" data-a="appr">${ic('check',14)}Approve the day</button>`:''}</div>`;
  return `<div class="dr-bar">${ic('flag',16)}<span><b>${c.flags.length} to look at</b> before the day is approved · ${c.flags.map(f=>f.sh).join(' · ')}</span><button class="btn btn-sm" data-a="toast">Open the day</button>${U.opt==='B'?`<button class="btn btn-sm btn-primary" data-a="appr">${ic('check',14)}Approve anyway</button>`:''}</div>`;
}
function list(){
  let h=`<section class="tg-list"><div class="tg-lh">Thursday’s days<span class="n">${ORDER.length}</span></div><div class="tg-scroll">`;
  ORDER.forEach(t=>{ const c=calc(t), T=TECH[t], s=signed(t);
    if(!c){ h+=`<div class="dr-ti off" data-a="who" data-v="${t}">${AV(t)}<span class="n">${esc(T.n)}</span><span class="v">—</span><span class="s"><span class="tk-pill off">Off</span>${esc(T.off)}</span></div>`; return; }
    const strip=c.segs.filter(x=>x.k!=='lun').map(x=>`<i class="${x.k}" style="left:${X(x.S)};width:${W(x.S,x.E)}"></i>`).join('');
    const pill=s.fm?'<span class="tk-pill">Approved</span>':c.flags.length?`<span class="tk-pill warn">${c.flags.length} to look at</span>`:'<span class="tk-pill off">To approve</span>';
    h+=`<div class="dr-ti${U.who===t&&U.opt==='B'&&!U.all?' on':''}" data-a="who" data-v="${t}">${AV(t)}<span class="n">${esc(T.n)}</span><span class="v">${dur(c.cl)}<small>${pct(c.eff)}</small></span><span class="tk-strip">${strip}</span><span class="s">${pill}${hm(c.I)} – ${hm(c.O)}${s.tech&&!s.fm?' · signed':''}</span></div>`; });
  h+=`<div class="dr-lsep"></div><div class="dr-ti${U.all?' on':''}" data-a="who" data-v="ALL">${AV('ALL')}<span class="n">Whole shop</span><span class="v">${dur(ORDER.filter(t=>DAY[t]).reduce((a,t)=>a+calc(t).cl,0))}<small>clocked</small></span><span class="s">Every tech on one sheet</span></div>`;
  h+=`</div><div class="tg-keys"><span><span class="tg-kbd">J</span><span class="tg-kbd">K</span> tech</span><span><span class="tg-kbd">A</span> approve</span><span><span class="tg-kbd">P</span> print</span></div></section>`;
  return h;
}
function pop(){
  if(!U.pop) return '';
  return `<div class="dr-pop">${ORDER.map(t=>{ const c=calc(t); return `<button class="tg-mi${U.opt!=='C'&&U.who===t?' on':''}" data-a="pick" data-v="${t}">${AV(t)}${esc(TECH[t].n)}<span class="meta">${c?dur(c.cl)+' · '+pct(c.eff):'Off'}</span></button>`; }).join('')}<hr><button class="tg-mi${U.opt==='C'?' on':''}" data-a="pick" data-v="ALL">${AV('ALL')}Whole shop<span class="meta">every tech, one sheet</span></button></div>`;
}
let toastT=null;
function toast(m){ const el=$('.toast-fm'); if(el) el.remove(); const d=document.createElement('div'); d.className='toast-fm'; d.textContent=m; $('.tg-panel').appendChild(d); clearTimeout(toastT); toastT=setTimeout(()=>d.remove(),2200); }
function render(){
  const keep=$('.dr-cv')?$('.dr-cv').scrollTop:0;
  const one=U.opt==='C'||(U.opt==='B'&&U.all)?shopSheet():(U.opt==='B'||U.opt==='A'?bar(U.who):'')+sheet(U.who);
  mock.classList.toggle('pv',U.pv);
  mock.innerHTML=`<div class="tg-app">${nav()}<main class="tg-panel"><div class="tg tk dr">${head()}<div class="tg-body">${U.opt==='B'?list():''}<div class="dr-cv">${U.pv?one.replace(/<div class="dr-bar[\s\S]*?<\/div>/,''):one}</div></div>${pop()}<span class="dr-pvtag">${ic('print',13)}Print view · Esc to go back</span></div></main></div>`;
  const cv=$('.dr-cv'); if(cv) cv.scrollTop=keep;
  $$('[data-opt]').forEach(b=>b.classList.toggle('is-on',b.dataset.opt===U.opt&&!U.pv));
  const pb=$('[data-pvb]'); if(pb) pb.classList.toggle('is-on',U.pv);
}
mock.addEventListener('click',e=>{
  const t=e.target.closest('[data-a]');
  if(!t){ if(U.pop){ U.pop=false; render(); } if(U.pv){ U.pv=false; render(); } return; }
  const a=t.dataset.a, v=t.dataset.v;
  if(a==='pop'){ U.pop=!U.pop; render(); return; }
  if(a==='pick'){ U.pop=false; if(v==='ALL'){ U.opt='C'; } else { U.who=v; if(U.opt==='C') U.opt='A'; } $('.dr-cv')&&($('.dr-cv').scrollTop=0); render(); return; }
  if(a==='who'){ if(v==='ALL'){ U.all=true; } else { U.all=false; U.who=v; } render(); $('.dr-cv').scrollTop=0; return; }
  if(a==='appr'){ const s=U.sign[U.who]||(U.sign[U.who]={}); s.fm='Frank Diaz'; s.fAt='Fri 07:14'; toast(TECH[U.who].n.split(' ')[0]+'’s day approved · locked'); const nx=ORDER.find(x=>DAY[x]&&!(U.sign[x]||{}).fm); if(nx) U.who=nx; render(); $('.dr-cv').scrollTop=0; return; }
  if(a==='pv'){ U.pv=true; U.pop=false; render(); $('.dr-cv').scrollTop=0; return; }
  if(a==='toast'){ toast(t.title?'In Parsec this moves a day.':t.textContent.indexOf('PDF')>=0?'In Parsec this saves the sheet as a PDF.':'In Parsec this opens the day in the Time Log.'); return; }
});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(U.pv||U.pop){ U.pv=false; U.pop=false; render(); } return; }
  if(e.key==='p'||e.key==='P'){ U.pv=!U.pv; render(); return; }
  if(U.opt==='B'&&(e.key==='j'||e.key==='k')){ const L=[...ORDER,'ALL'], i=U.all?L.length-1:L.indexOf(U.who), n=L[Math.max(0,Math.min(L.length-1,i+(e.key==='j'?1:-1)))]; if(n==='ALL') U.all=true; else { U.all=false; U.who=n; } render(); $('.dr-cv').scrollTop=0; }
  if(U.opt==='B'&&(e.key==='a'||e.key==='A')){ const b=$('[data-a="appr"]'); if(b) b.click(); }
});
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$$('[data-opt]').forEach(b=>b.addEventListener('click',()=>{ U.opt=b.dataset.opt; U.pv=false; U.pop=false; U.all=false; if(U.opt!=='C'&&!DAY[U.who]) U.who='MR'; render(); $('.dr-cv').scrollTop=0; }));
$('[data-pvb]').addEventListener('click',()=>{ U.pv=!U.pv; render(); $('.dr-cv').scrollTop=0; });
$('[data-reset]').addEventListener('click',()=>{ reset(); render(); });
render();
