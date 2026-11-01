/* Parsec · pages/manager · ideas.js
   The ten ideas (Manager v3): pace to month end, drivers, streaks, alerts, the monthly report.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   gpBase fullEnd pace paceCard paceLine paceVals sizeOf drivers impTxt whyCard streak alerts … (31 functions, 22 constants)
   state      punches staff
   uses       access/ data/ kit/ pages/ pages/triage/ ro/ shell/ state/
*/
/* ======================= the ten ideas ======================= */
/* each fleet gets its own trucks, so a scorecard can list them */
/* 4 · money left on the table, as a KPI too */
const leakR=r=>sum(r.ops,over)*RATE+r.dec+r.wo;
K.splice(K.findIndex(k=>k.id==='dec'),0,{id:'leak',c:'mon',n:'Money left on the table',u:'usd',d:-1,how:'Hours over quote and unapplied hours at $210, plus declined work and write-offs.',src:['Time Log','Triage','Warranty'],br:['tech','pay'],dr:'CL',mh:'Left',col:r=>[usd0(leakR(r)),r.dec?'declined '+usd0(r.dec):''],tone:()=>'warn',sk:r=>-leakR(r),f:X=>sum(X.ops,over)*RATE+Math.max(0,X.att-X.bur)*RATE+sum(X.OP,r=>r.dec)+sum(X.CL,r=>r.wo)});
/* 10 · the KPIs two more fields would open up */
/* parts cost share: this RO's lines with a cost, else the shop's average over every closed RO with one; pay: the hours clocked × each tech's rate, the shop's average rate for hours with none */
let SHARE=null, PAYA=null;
function gpBase(){ if(SHARE!=null) return; let c=0, k=0, pc=0, pk=0; ROS.forEach(r=>{ c+=r.pcost||0; k+=r.pknown||0; pc+=r.payc||0; pk+=r.payk||0; }); SHARE=k>0?c/k:null; PAYA=pk>0?pc/pk:null; }
const PCOST=r=>{ gpBase(); return r.pknown>0?r.pcost/r.pknown:(SHARE!=null?SHARE:0); };
const PAYR_OF=r=>{ gpBase(); const b=sum(r.ops,o=>o.b); if(!b) return 0; const rest=Math.max(0,b-(r.payk||0)); return ((r.payc||0)+rest*(PAYA||0))/b; };
const PAYR_T=t=>{ const v=PG.payOf(PPL[t]||t); if(v>0) return v; gpBase(); return PAYA||0; };
const OVHv=()=>+PG.shop().overhead||0;
const gpR=r=>r.lab-sum(r.ops,o=>o.b)*PAYR_OF(r)+r.prt*(1-PCOST(r));
/* what's been entered: the lock opens as soon as each field has something */
const HAVE=()=>{ gpBase(); return {cost:SHARE!=null,pay:PAYA!=null,ovh:OVHv()>0}; };
const locked=k=>!!(k.lock&&k.needs.some(n=>!HAVE()[n]));
CAT.gp=['Gross profit','lock'];
K.push(
 {id:'gp',c:'gp',lock:1,n:'Gross profit',u:'usd',d:1,tw:9500,how:'Sales minus what they cost — tech pay on the hours clocked, and what the parts cost.',src:['ROs','Parts','Team'],needs:['cost','pay'],br:['pay','tech','cust'],dr:'CL',mh:'Gross profit',col:r=>[usd0(gpR(r)),pc(gpR(r)/r.sales*100)+' of sales'],sk:r=>gpR(r)/r.sales,f:X=>sum(X.CL,gpR)},
 {id:'pgm',c:'gp',lock:1,n:'Parts margin',u:'pct',d:1,t:36,how:'Parts sales minus parts cost, ÷ parts sales.',src:['Parts'],needs:['cost'],br:['pay','cust'],dr:'CL',flt:r=>r.prt>0,mh:'Margin',col:r=>[pc((1-PCOST(r))*100),usd0(r.prt*(1-PCOST(r)))],sk:r=>-PCOST(r),f:X=>{ const p=sum(X.CL,r=>r.prt); return p?sum(X.CL,r=>r.prt*(1-PCOST(r)))/p*100:null; }},
 {id:'lgm',c:'gp',lock:1,n:'Labor margin',u:'pct',d:1,t:80,how:'Labor sales minus tech pay on the hours clocked, ÷ labor sales.',src:['Time Log','Team'],needs:['pay'],br:['tech','pay'],dr:'ops',mh:'Margin',col:R=>[pc((R.q*RATE-R.b*PAYR_T(R.ops[0]&&R.ops[0].tech))/(R.q*RATE)*100),`${h1(R.b)} h at $${Math.round(PAYR_T(R.ops[0]&&R.ops[0].tech))}`],sk:R=>(R.q*RATE-R.b*PAYR_T(R.ops[0]&&R.ops[0].tech))/(R.q*RATE),f:X=>{ const l=sum(X.ops,o=>o.q)*RATE; return l?(l-sum(X.ops,o=>o.b*PAYR_T(o.tech)))/l*100:null; }},
 {id:'gpr',c:'gp',lock:1,n:'Gross profit per RO',u:'usd',d:1,t:1100,how:'Gross profit ÷ ROs closed.',src:['ROs','Parts','Team'],needs:['cost','pay'],br:['pay','tech','cust'],dr:'CL',mh:'Gross profit',col:r=>[usd0(gpR(r)),''],sk:r=>gpR(r),f:X=>X.CL.length?sum(X.CL,gpR)/X.CL.length:null},
 {id:'abs',c:'gp',lock:1,n:'Service absorption',u:'pct',d:1,t:100,how:'Service and parts gross profit ÷ the dealership’s overhead — at 100% service pays the bills.',src:['ROs','Parts','Team','Settings'],needs:['cost','pay','ovh'],br:[],dr:'none',f:X=>X.wd&&OVHv()?sum(X.CL,gpR)/(OVHv()/24*X.wd)*100:null});
K.forEach(k=>{ KM[k.id]=k; });
const fmtU=(k,v)=>fmt(k.u,v)+(k.u==='n'?' ROs':'');
const wdIn=(a,b)=>{ let n=0; for(let k=a;k<=b;k=addD(k,1)) n+=wf(k); return n; };
/* 1 · pace: where “this week / month / quarter / year” lands if it keeps going like this */
function fullEnd(o){ return o.g==='wk'?addD(o.a,5):o.g==='mo'?mEnd(o.a):o.g==='qt'?addD(addM(o.a,3),-1):o.g==='yr'?o.a.slice(0,4)+'-12-31':o.b; }
function pace(k,p,F){ const o=per(p); if(!o.fut||o.g==='day'||!isSum(k)||(locked(k))) return null; const v=val(k,o.a,o.b,F); if(v==null) return null;
  const e=fullEnd(o), done=wdIn(o.a,o.b), tot=wdIn(o.a,e), left=tot-done, pd=done?v/done:0, proj=v+pd*left, tb=tgtBase(k), goal=tb!=null&&k.tw!=null?tb*tot:null;
  return {v,proj,goal,done,tot,left,pd,e,need:goal!=null&&left>0?(goal-v)/left:null}; }
function paceCard(){ const L=['sales','sold','cls'].map(id=>[KM[id],pace(KM[id],'mo')]).filter(x=>x[1]), mo=mName(TODAY);
  return `<div class="mq-pace">${L.map(([k,P_],i)=>{ const short=P_.goal!=null?P_.goal-P_.proj:0, ok=short<=0, mx=Math.max(P_.goal||0,P_.proj)*1.05;
    return `<button class="mq-pc${i===0?' m0':''}" data-a="pacego" data-k="${k.id}" data-tip="${esc(k.n)} · ${mo}|So far::${fmtU(k,P_.v)}|On pace for::${fmtU(k,P_.proj)}|Goal::${P_.goal!=null?fmtU(k,P_.goal):'—'}${k.base&&U.tg[k.id]==null?'|~The goal is your own last 90 days — set yours in KPIs':''}|~${P_.done} of ${P_.tot} workdays done · ${fmtU(k,P_.pd)} a workday so far"><span class="l">${k.n} · ${mo}</span><span class="t">On pace for <b>${fmtU(k,P_.proj)}</b></span><span class="bar"><i class="done" style="width:${(P_.v/mx*100).toFixed(1)}%"></i><i class="proj" style="left:${(P_.v/mx*100).toFixed(1)}%;width:${((P_.proj-P_.v)/mx*100).toFixed(1)}%"></i>${P_.goal!=null?`<em style="left:${(P_.goal/mx*100).toFixed(1)}%"></em>`:''}</span><span class="s ${ok?'ok':'off'}">${ok?ic('check',12)+'<b>'+fmtU(k,-short)+'</b> over the '+fmtU(k,P_.goal)+' goal':ic('flag',12)+'<b>'+fmtU(k,short)+'</b> short of '+fmtU(k,P_.goal)}${P_.need!=null&&!ok?' · needs '+fmtU(k,P_.need)+' a workday':' · '+P_.left+' workdays left'}</span></button>`; }).join('')}</div>`; }
function paceLine(k){ const P_=pace(k,U.p,U.bf); if(!P_) return ''; const ok=P_.goal==null||P_.proj>=P_.goal;
  return `<span class="mq-pace-l">${ic('spark',12)}On pace for <b>${fmtU(k,P_.proj)}</b> by ${fd(P_.e)}${P_.goal!=null?` · goal ${fmtU(k,P_.goal)}${ok?'':' · needs '+fmtU(k,P_.need)+' a workday'}`:''}</span>`; }
function paceVals(k,C){ const P_=pace(k,U.p,U.bf); if(!P_) return null; return C.map(x=>x&&x.fut?P_.pd*wdIn(x.a,x.b):null); }
/* 2 · why it moved */
const DIMN={tech:'tech',pay:'pay',type:'job type',cust:'customer'};
function sizeOf(k,X){ return k.dr==='tech'?X.att:k.dr==='ops'?X.ops.length:k.dr==='OP'?X.OP.length:X.CL.length; }
function drivers(k,a,b,pa,pb){ const N=sizeOf(k,ctx(a,b)), sm=isSum(k)||k.snap, L=[];
  (k.br||[]).forEach(d=>brVals(d,ctx(a,b)).forEach(([v,n])=>{ const F={k:d,v}, x=val(k,a,b,F), px=val(k,pa,pb,F); if(x==null||px==null) return; const w=sm?1:N?sizeOf(k,ctx(a,b,F))/N:0; L.push({d,v,n,x,px,imp:(x-px)*w}); }));
  return L.filter(r=>Math.abs(r.imp)>1e-9).sort((p,q)=>Math.abs(q.imp)-Math.abs(p.imp)).slice(0,4); }
function impTxt(k,v){ const s=v>0?'+':'−', a=Math.abs(v); return k.u==='pct'?s+(a<1?a.toFixed(1):Math.round(a))+' pts':k.u==='usd'?s+fmt('usd',a):k.u==='n'?s+Math.round(a):s+h1(a)+(k.u==='d'?' d':' h'); }
function whyCard(k){ if(locked(k)||U.bf) return ''; const o=kv(k); if(o.v==null||o.pv==null||!o.dl.d) return ''; const [a,b]=W(), [pa,pb]=PW(), D=drivers(k,a,b,pa,pb); if(!D.length) return '';
  const mx=Math.max(...D.map(r=>Math.abs(r.imp)));
  return `<div class="mq-card mq-why"><div class="mq-ch">${ic('spark',14)}<b>Why it moved</b><small>${k.n} is ${o.dl.up?'up':'down'} ${impTxt(k,o.v-o.pv).slice(1)} ${per(U.p).cmp} — the biggest moves</small></div><div class="mq-cb" style="padding-top:6px">${D.map(r=>{ const good=r.imp*k.d>0, cl=!k.d?'flat':good?'good':'bad';
    return `<button class="mq-wr" data-a="bf" data-f="${r.d}" data-v="${esc(r.v)}" data-tip="${esc(r.n)}|Before::${fmt(k.u,r.px,1)}|Now::${fmt(k.u,r.x,1)}|~Click to see only ${esc(r.n)}"><span class="n">${r.d==='tech'?`<span class="tg-av">${r.v}</span>`:''}<b>${esc(r.n)}</b><small>${DIMN[r.d]}</small></span><span class="ft">${fmt(k.u,r.px)} → ${fmt(k.u,r.x)}</span><span class="dv"><span class="ax"></span><i class="${cl}" style="${r.imp<0?'right:50%':'left:50%'};width:${(Math.abs(r.imp)/mx*50).toFixed(1)}%"></i></span><span class="m ${k.d?cl:''}">${impTxt(k,r.imp)}</span></button>`; }).join('')}
    <div class="mq-more">${ic('info',12)}<span>${isSum(k)||k.snap?'Each row is that slice’s own change.':'Each row is weighted by its share of the work, so the rows roughly add up.'} Click one and the page follows it.</span></div></div></div>`; }
/* 3 · off-target alerts — three workdays in a row lands it in Needs you */
function streak(k){ const tb=tgtBase(k); if(tb==null) return 0; let n=0, d=TODAY; for(let g=0;g<40;g++){ if(wf(d)){ const v=val(k,d,d); if(v!=null){ const t=k.tw!=null?tb*wf(d):tb; if(k.d>=0?v<t:v>t) n++; else break; } } d=addD(d,-1); } return n; }
function alerts(){ return Object.keys(U.al).filter(id=>U.al[id]&&!U.mute[id]&&KM[id]).map(id=>{ const k=KM[id], n=streak(k); if(n<3) return null; let d=TODAY, v=null; for(let g=0;g<14&&v==null;g++){ if(wf(d)) v=val(k,d,d); if(v==null) d=addD(d,-1); } return {id:'al-'+id,k,n,v,d}; }).filter(Boolean); }
const NUMW=['','one','two','three','four','five','six','seven','eight','nine','ten'];
function alertNeeds(){ return alerts().map(a=>{ const t=tgtBase(a.k), tt=a.k.tw!=null?t:t; return {id:a.id,al:a.k.id,ic:'bell',h:`Off target ${a.n} workdays`,p:`<b>${a.k.n}</b> has been ${a.k.d>=0?'under':'over'} ${fmt(a.k.u,tt)} ${NUMW[a.n]||a.n} workdays in a row${a.v!=null?' — '+fmt(a.k.u,a.v)+(a.d===TODAY?' today':' on '+fd(a.d)):''}.`,a:[['See it'],['Mute a week']]}; }); }
/* 4 · money left on the table */
function leakCard(){ const [a,b]=W(), X=ctx(a,b), ov=sum(X.ops,over), un=Math.max(0,X.att-X.bur), od=ROS.filter(r=>r.cr&&r.close<=addD(b,-30)&&r.crAt>b);
  const R_=[['lost','Hours over quote',ov*RATE,h1(ov)+' h × ${RATE}'],['unap','Unapplied hours',un*RATE,Math.round(un)+' h × ${RATE} — on the clock, nothing sold'],['dec','Declined work',sum(X.OP,r=>r.dec),X.OP.filter(r=>r.dec).length+' estimates said no'],['wo','Write-offs and goodwill',sum(X.CL,r=>r.wo),X.CL.filter(r=>r.wo).length+' ROs']];
  const tot=sum(R_,x=>x[2]), mx=Math.max(1,...R_.map(x=>x[2]));
  return `<div class="mq-card mq-leak"><div class="mq-ch"><b>Money left on the table</b><small>${per(U.p).n.toLowerCase()}</small><span class="sp"></span><b class="tot">${usd0(tot)}</b></div><div class="mq-cb" style="padding-top:6px">${R_.map(x=>`<button class="mq-lr" data-a="sel" data-k="${x[0]}" data-go="1"><span class="n"><b>${x[1]}</b><small>${x[3]}</small></span><span class="b"><i style="width:${(x[2]/mx*100).toFixed(1)}%"></i></span><span class="m">${usd0(x[2])}</span></button>`).join('')}
    <div class="mq-more">${ic('info',12)}<span>It’s a KPI too — with its trend and the ROs behind it.</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="sel" data-k="leak" data-go="1">Open it</button></div></div></div>`; }
/* 6 · capacity — the work in the shop plus booked appointments, against the hours the techs have */
const OFF={}, APPT=[0,0,0,0,0,0,0,0];
function capRows(){ const D=[]; let k=TODAY; while(D.length<8){ k=addD(k,1); if(wf(k)) D.push(k); } let carry=sum(openAt(TODAY),r=>left(r,TODAY));
  return D.map((d,i)=>{ const f=wf(d), off=OFF[d]||[], techs=f<1?3:TECHS.length-off.length, cap=techs*(f<1?4.5:8.5)*.85, ap=APPT[i], fc=Math.min(cap,carry), fa=Math.min(cap-fc,ap); carry=carry-fc+(ap-fa); return {d,cap,fc,fa,off,techs,free:Math.max(0,cap-fc-fa)}; }); }
function capCard(){ const rows=capRows(); let thru=-1; for(let i=0;i<rows.length;i++){ if(rows[i].free<=rows[i].cap*.03) thru=i; else break; } const first=rows[thru+1], mx=Math.max(...rows.map(r=>r.cap));
  return `<div class="mq-card mq-cap"><div class="mq-ch"><b>Capacity</b><small>the next 8 workdays</small><span class="sp"></span><span class="mq-leg"><span><i></i>In the shop</span><span><i class="ap"></i>Appointments</span><span><i class="fr"></i>Free</span></span></div><div class="mq-cb"><p class="mq-capt">${thru>=0?`Booked through <b>${DWL[dOf(rows[thru].d).getDay()]} ${fd(rows[thru].d)}</b>`:'Room tomorrow'}${first?` — first open time ${DWL[dOf(first.d).getDay()]}, <b>${Math.round(first.free)} h</b> free.`:'.'}</p>
    <div class="mq-capg">${rows.map(r=>`<div class="c" data-tip="${DWL[dOf(r.d).getDay()]} ${fd(r.d)}|In the shop::${h1(r.fc)} h|Appointments::${h1(r.fa)} h|Free::${h1(r.free)} h|~${r.techs} techs at 85%${r.off.length?' · '+r.off.map(F).join(', ')+' off':''}"><span class="col" style="height:${Math.round(r.cap/mx*118)}px"><i class="w" style="height:${(r.fc/r.cap*100).toFixed(1)}%"></i><i class="a" style="height:${(r.fa/r.cap*100).toFixed(1)}%"></i></span><b>${DW[dOf(r.d).getDay()].slice(0,2)} ${dOf(r.d).getDate()}</b><small>${r.off.length?r.off.map(F).join(', ')+' off':r.free>=1?Math.round(r.free)+' h free':'full'}</small></div>`).join('')}</div></div></div>`; }
/* 7 · goals per person */
const PG0=()=>{ const tb=k=>{ const v=KM[k]?tgtBase(KM[k]):null; return v==null?null:v; }; const sd=tb('sold'); return {eff:tb('eff')||100,prod:tb('prod')||85,sold:sd?Math.max(.5,Math.round(sd/Math.max(1,TECHS.length)*2)/2):7.5,cb:tb('cb')||3}; };
const PGS=()=>{ const M=mgSet(); return Object.fromEntries(TECHS.map(t=>[t,Object.assign(PG0(),M.pg[t]||{})])); };
function kvG(k,F,who){ const o=kv(k,F); if(!who||!U.pg[who]||U.pg[who][k.id]==null) return o; const g=U.pg[who][k.id], t=k.tw!=null?g*o.X.wd:g; return Object.assign({},o,{t,ok:o.v==null?null:k.d>=0?o.v>=t:o.v<=t}); }
function goalsCard(k){ const g=U.pg[k], FF={k:'tech',v:k};
  return `<div class="mq-card mq-goals"><div class="mq-ch"><b>Goals for ${F(k)}</b><small>their own — the shop’s targets stay as they are</small><span class="sp"></span><span class="mq-pv">${ic('career',11)}${F(k)} sees them on Career</span></div><div class="mq-cb"><div class="mq-gh"><span>KPI</span><span>Shop target</span><span>${F(k)}’s goal</span><span class="m">${per(U.p).n}</span></div>${['eff','prod','sold','cb'].map(id=>{ const kk=KM[id], o=kvG(kk,FF,k), tb=tgtBase(kk);
    return `<div class="mq-gr"><b>${kk.n}</b><span class="st">${kk.tw!=null?h1(tb/TECHS.length)+' h a day':fmt(kk.u,tb)}</span><span class="in"><input data-pgg="${k}" data-k="${id}" data-ch="1" value="${g[id]}" inputmode="decimal"><small>${kk.u==='pct'?'%':'h a workday'}</small></span><span class="m ${o.ok===false?'off':o.ok?'ok':''}">${fmt(kk.u,o.v)}<small>${o.ok==null?'':o.ok?'meets it':(kk.d>=0?'under':'over')+' '+fmt(kk.u,o.t)}</small></span></div>`; }).join('')}
    <div class="mq-more">${ic('info',12)}<span>Goals start at the shop’s targets — change any of them. A new tech can start lower and step up.</span></div></div></div>`; }
/* 8 · data checks */
let CHK0=[];
function chkOf(){ const C=ROS.filter(r=>r.close<=TODAY&&r.close>=addD(TODAY,-13)), O=openAt(TODAY), L=[];
  const np=C.filter(r=>r.ops.some(o=>o.q>0)&&!r.ops.some(o=>o.b>0)); if(np.length) L.push({id:'c1',ic:'clock',t:'Closed without a punch',d:'Hours sold and efficiency leave these out until someone adds the time.',ros:np.map(r=>r.id),a:'Open the first one',go:np[0].id});
  const nq=O.filter(r=>r.ops.some(o=>o.b>0.2&&!o.q)); if(nq.length) L.push({id:'c3',ic:'flag',t:'Operation with no quote',d:'No quote, no efficiency — every hour counts as over quote.',ros:nq.map(r=>r.id),a:'Open the first one',go:nq[0].id});
  const run=STATE.punches.filter(p=>!p.stop&&(Date.now()-new Date(p.start))>10*3600000); if(run.length){ const p=run[0], ro=getRO(p.roId); L.push({id:'c4',ic:'play',t:'Clock still running',d:`${esc(punchWho(p)||'A')}’s clock${ro?' on '+esc(tgNum(ro)):''} has run since ${PG.whenL(p.start)}.`,ros:run.map(x=>{ const r2=getRO(x.roId); return r2?r2.id:'shop'; }),a:'Fix it in the Time Log',tl:localDay(p.start),who:punchWho(p)}); }
  const ni=STATE.punches.filter(p=>!isShopPunch(p)&&p.stop&&localDay(p.start)>=addD(TODAY,-13)&&!getOp(p.roId,p.opId)); if(ni.length) L.push({id:'c2',ic:'timelog',t:'Punches with no operation',d:'Time on an RO but not on a job — it counts as unapplied.',ros:[...new Set(ni.map(p=>{ const r2=getRO(p.roId); return r2?tgNum(r2):'?'; }))],a:'Open the Time Log',tl:localDay(ni[0].start),who:punchWho(ni[0])});
  return L; }
const nChk=()=>CHK0.filter(c=>U.chk.includes(c.id)).reduce((s,c)=>s+c.ros.length,0);
function chkPop(){ const L=CHK0.filter(c=>U.chk.includes(c.id));
  return `<div class="tg-pop xf mq-pop-w"><div class="tg-ph"><b>Data checks</b><span class="cu">${nChk()} things the numbers trip on</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>${L.length?L.map(c=>`<div class="mq-chk"><span class="gi">${ic(c.ic,14)}</span><b>${c.t}<span>${c.ros.length}</span></b><p>${c.d}</p><div class="r">${c.ros.map(n=>`<button class="tg-no" data-a="ro" data-no="${n}">${(ROS.find(x=>x.id===n)||{no:n}).no}</button>`).join('')}<button class="btn btn-sm" data-a="chkfix" data-id="${c.id}">${c.a}</button><button class="btn btn-sm tg-gh" data-a="chkx" data-id="${c.id}">It’s fine</button></div></div>`).join(''):`<div class="mq-none">${ic('check',14)} All clean — every number counts every RO.</div>`}<div class="tg-pft">${ic('info',12)}Parsec checks every time the page opens — the last two weeks.</div></div>`; }
/* 9 · monthly report */
function repSheet(){ const a=U.rep, b=mEnd(a), pa=addM(a,-1), pb=mEnd(pa), X=ctx(a,b), mon=mName(a)+' '+a.slice(0,4);
  const months=[addM(TODAY,-1),addM(TODAY,-2),addM(TODAY,-3)];
  const tiles=PINS0.map(id=>{ const k=KM[id], v=val(k,a,b), pv=val(k,pa,pb), tb=tgtBase(k), t=tb==null?null:k.tw!=null?tb*X.wd:tb, dl=delta(k,v,pv), ok=t==null||v==null?null:k.d>=0?v>=t:v<=t;
    return `<div class="rt"><small>${k.n}</small><b>${fmt(k.u,v)}</b><span class="mq-d ${dl.cl}">${dl.s}</span>${t!=null?`<em class="${ok?'ok':'off'}">${ok?'✓ on target · ':''}target ${fmt(k.u,t)}</em>`:'<em>&nbsp;</em>'}</div>`; }).join('');
  const D=drivers(KM.sales,a,b,pa,pb), E=drivers(KM.eff,a,b,pa,pb).slice(0,2), ov=sum(X.ops,over)*RATE, un=Math.max(0,X.att-X.bur)*RATE, dec=sum(X.OP,r=>r.dec), wo=sum(X.CL,r=>r.wo), CB=X.CL.filter(r=>r.cb).slice(0,4);
  return `<div class="mq-rep"><div class="mq-repbar"><b>Monthly report</b><span class="tg-seg3">${months.map(m=>`<button class="${m===a?'on':''}" data-a="repm" data-v="${m}">${MNL[dOf(m).getMonth()]}</button>`).join('')}</span><span style="font-size:12.5px;color:var(--tg-ink3)">The pinned 12, what moved, money left on the table, comebacks, and your notes — one page.</span><span class="sp"></span><button class="btn btn-sm" data-a="repprint">${ic('print',14)}Print</button><button class="btn btn-sm btn-primary" data-a="repprint" title="Pick “Save as PDF” in the print window">${ic('download',14)}Save as PDF</button><button class="btn btn-sm ib" data-a="repx" title="Close">${ic('x',14)}</button></div>
   <div class="mq-repsc"><div class="mq-sheet"><div class="sh-h"><span class="lg">${LOGO}</span><div><h3>Service report · ${mon}</h3><small>${X.CL.length} ROs closed · ${+X.wd.toFixed(1)} workdays · compared with ${mName(pa)}</small></div><small class="pp">Prepared by ${esc(PG.me().name)}<br>${fd(TODAY)}, ${TODAY.slice(0,4)}</small></div>
    <h4>The pinned 12</h4><div class="sh-g">${tiles}</div>
    <div class="sh-2"><div><h4>What moved sales</h4>${D.map(r=>`<div class="mv"><span>${esc(r.n)} <small style="color:#8F897C">· ${DIMN[r.d]}</small></span><b class="${r.imp>0?'good':'bad'}">${impTxt(KM.sales,r.imp)}</b></div>`).join('')}<h4>What moved efficiency</h4>${E.map(r=>`<div class="mv"><span>${esc(r.n)} · ${fmt('pct',r.px)} → ${fmt('pct',r.x)}</span><b class="${r.imp>0?'good':'bad'}">${impTxt(KM.eff,r.imp)}</b></div>`).join('')}</div>
     <div><h4>Money left on the table</h4><p class="big">${usd0(ov+un+dec+wo)}</p><div class="ln"><span>Hours over quote</span><b>${usd0(ov)}</b></div><div class="ln"><span>Unapplied hours</span><b>${usd0(un)}</b></div><div class="ln"><span>Declined work</span><b>${usd0(dec)}</b></div><div class="ln"><span>Write-offs and goodwill</span><b>${usd0(wo)}</b></div>
      <h4>Comebacks · ${X.CL.filter(r=>r.cb).length}</h4>${CB.map(r=>`<div class="ln"><span>${r.no} ${esc(r.cust)}</span><b>${r.cb} d · ${F(r.tech)}</b></div>`).join('')||'<div class="ln"><span>None</span></div>'}</div></div>
    <h4>Notes</h4><textarea id="mq-rn" data-in="rn" placeholder="What you want the GM to know — it prints with the report.">${esc(U.repn||'')}</textarea></div></div></div>`; }
/* 10 · the locked ones */
function lockPane(k){ const N={cost:['Part cost','On each part line in Parts — typed at check-in, or on the catalog item. Parts already keeps the price.','Parts'],pay:['Tech pay rate','Per tech in Team, dollars an hour. Only the manager sees it.','Team'],ovh:['Monthly overhead','One number in Settings — rent, salaries, utilities.','Settings']};
  const ex={cost:'',pay:'',ovh:''};
  return `<div class="mq-pane"><div class="tg-top"><div class="r1"><span class="mq-cat">${ic('lock',13)}Gross profit</span><span>${(()=>{ const m=k.needs.filter(n=>!HAVE()[n]).length; return m===k.needs.length?'Needs '+(m===1?'one field':m+' fields')+' entered first':'One more to enter — '+k.needs.filter(n=>!HAVE()[n]).map(n=>({cost:'part cost',pay:'tech pay',ovh:'monthly overhead'})[n]).join(' and '); })()}</span></div><h2>${k.n}</h2><div class="mq-how">${ic('info',13)}<span>${k.how}</span></div></div>
   <div class="mq-pad"><div class="mq-card mq-lockc"><div class="mq-ch">${ic('lock',14)}<b>What it needs</b><small>${k.needs.map(n=>N[n][0].toLowerCase()).join(' and ')}</small></div><div class="mq-cb"><div class="mq-needf">${k.needs.map(n=>`<div class="f"><span class="mq-pv${HAVE()[n]?' ok':''}">${HAVE()[n]?'✓ ':''}${N[n][2]}</span><b>${N[n][0]}</b><small>${N[n][1]}</small>${ex[n]}</div>`).join('')}</div>
     <p class="mq-unl">Part cost and tech pay open up four of these — gross profit, parts margin, labor margin and gross profit per RO. Add the monthly overhead and service absorption opens too. One entry is enough to start; the rest use the shop’s average until they’re filled in.</p><div class="tg-acts" style="justify-content:flex-start">${k.needs.includes('pay')&&!HAVE().pay?`<button class="btn btn-sm btn-primary" data-a="goteam">${ic('users',14)}Enter pay on Team</button>`:''}${k.needs.includes('cost')&&!HAVE().cost?`<button class="btn btn-sm${HAVE().pay||!k.needs.includes('pay')?' btn-primary':''}" data-a="goparts">${ic('parts',14)}Enter part cost in Parts</button>`:''}${k.needs.includes('ovh')&&!HAVE().ovh?`<button class="btn btn-sm" data-action="px-sg-go" data-id="shop.ovh">${ic('gear',14)}Overhead in Settings</button>`:''}</div></div></div></div></div>`; }
/* 5 · fleets */
function fleetRows(){ const [a,b]=W(); return CUST.map(c=>{ const F_={k:'cust',v:c}, X=ctx(a,b,F_); return {c,n:X.CL.length,s:sum(X.CL,r=>r.sales),open:openAt(TODAY,F_).length}; }).sort((p,q)=>q.s-p.s); }
function fList(){ const L=fleetRows();
  return `<section class="tg-list"><div class="tg-lh">Fleets<span class="n">${L.length}</span></div><div class="mq-lh2"><small style="font-size:12px;color:var(--tg-ink3)">${per(U.p).n} · most sales first</small></div><div class="tg-scroll">${L.map(x=>`<div class="tg-it mq-fi${x.c===U.fleet?' on':''}${x.c===U.fleet&&U.kb?' kb':''}" data-a="fleet" data-k="${esc(x.c)}"><span class="tg-gi">${ic('unit',15)}</span><span class="tg-t"><b>${esc(x.c)}</b></span><span class="tg-w">${x.n} RO${x.n===1?'':'s'}${x.open?' · '+x.open+' in the shop':''}</span><span class="m">${fmt('usd',x.s)}</span></div>`).join('')}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('1')}–${kbd('6')}views</span></div></section>`; }
function monthBars(V,B,w){ const H=150, pl=40, pb=20, pt=8, mx0=Math.max(1,...V.filter(v=>v!=null)), st0=Math.pow(10,Math.floor(Math.log10(mx0/2))), stp=[1,2,2.5,5,10].map(m=>m*st0).find(s=>mx0/s<=4)||st0*10, mx=Math.ceil(mx0/stp)*stp, st=(w-pl)/B.length, bw=Math.min(24,st*.6), y=v=>pt+(H-pt-pb)*(1-v/mx);
  let s=`<svg class="mq-svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" preserveAspectRatio="xMinYMin meet">`; [0,.5,1].forEach(f=>{ const v=mx*f; s+=`<line class="gl" x1="${pl}" x2="${w}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${pl-6}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end">${fmt('usd',v)}</text>`; });
  B.forEach((x,i)=>{ const cx=pl+st*i+st/2, v=V[i]; if(v) s+=`<path class="bar" d="${rtop(cx-bw/2,y(v),bw,y(0)-y(v))}"/>`; s+=`<text class="ax" x="${cx}" y="${H-5}" text-anchor="middle"${x.fut?' style="opacity:.45"':''}>${x.l}</text>${x.fut?'':`<rect class="hit" x="${cx-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" data-tip="${esc(x.t)}|Sales::${fmt('usd',v||0,1)}"/>`}`; });
  return s+'</svg>'; }
function vFleet(){ const c=U.fleet, FF={k:'cust',v:c}, KS=['sales','cls','aro','days','cb','apr'].map(id=>KM[id]), all=ROS.filter(r=>r.cust===c), units=[...new Set(all.map(r=>r.unit))].sort((p,q)=>String(p).localeCompare(String(q),undefined,{numeric:true})), yb=buckets('yr'), V=yb.map(x=>vb(KM.sales,x,FF)), O=openAt(TODAY,FF);
  const UT=units.map(u=>{ const L=all.filter(r=>r.unit===u&&r.close<=TODAY&&r.open>=addD(TODAY,-365)); return {u,truck:all.find(r=>r.unit===u).truck,n:L.length,down:sum(L,r=>dd(r.open,r.close)),last:L.length?L[L.length-1].close:null,op:all.find(r=>r.unit===u&&r.close>TODAY)}; }).sort((p,q)=>q.down-p.down);
  return `<div class="mq-pane"><div class="tg-top"><div class="r1"><span class="mq-cat">${ic('unit',13)}Fleet</span><span>${units.length} truck${units.length===1?'':'s'} · a customer since ${mName(all[0].open)} ${all[0].open.slice(0,4)}</span><span class="sp"></span><button class="btn btn-sm" data-a="print">${ic('print',14)}Print for the account review</button></div><h2>${esc(c)}</h2></div>
   <div class="mq-pad"><div class="mq-sec" style="margin:0 2px">Scorecard<span>${per(U.p).n} · ${per(U.p).cmp}</span></div><div class="mq-tiles c3">${KS.map(kk=>{ const o=kv(kk,FF); return `<button class="mq-tile" data-a="fsel" data-k="${kk.id}" data-tip="${esc(kk.n)}|${esc(kk.how)}|~Opens in KPIs, only ${esc(c)}"><span class="l"><span>${kk.id==='days'?'Days down per RO':kk.n}</span></span><span class="v">${fmt(kk.u,o.v)}</span>${sparkSvg(kk,76,28,FF)}<span class="r"><span class="mq-d ${o.dl.cl}">${o.dl.s}</span><span class="sp"></span><span>shop ${fmt(kk.u,kv(kk).v)}</span></span></button>`; }).join('')}</div>
    <div class="mq-two"><div class="mq-card"><div class="mq-ch"><b>Sales by month</b><small>${TODAY.slice(0,4)}</small></div><div class="mq-cb">${monthBars(V,yb,470)}</div></div><div class="mq-card"><div class="mq-ch"><b>In the shop now</b><small>${O.length}</small></div><div class="mq-cb">${O.length?O.map(r=>`<div class="mq-hr" data-a="ro" data-no="${r.id}"><span class="c"><b><span class="tg-no">${r.no}</span> Unit ${r.unit}</b><small>${stH(r,{size:12})} · ${r.truck}</small></span><span></span><span class="m">${dd(r.open,TODAY)?dd(r.open,TODAY)+' d':'today'}</span></div>`).join(''):'<div class="mq-none">Nothing in the shop right now.</div>'}</div></div></div>
    <div class="mq-card"><div class="mq-ch"><b>Their trucks</b><small>the last 12 months · most days down first</small></div><div class="mq-cb"><div class="mq-tbl fl"><div class="h"><span>Unit</span><span>Truck</span><span class="m">ROs</span><span class="m">Days down</span><span>Last in</span><span class="m">Now</span></div>${UT.slice(0,8).map(x=>`<div class="mq-tr"${x.op?` data-a="ro" data-no="${x.op.id}"`:''}><span class="u">${x.u}</span><span class="c"><b>${x.truck}</b></span><span class="m">${x.n}</span><span class="m${x.down>14?' warn':''}">${x.down} d</span><span class="dt">${x.last?md(x.last):'—'}</span><span class="m">${x.op?`<span class="mq-pv w">in the shop</span>`:''}</span></div>`).join('')}</div>${UT.length>8?`<div class="mq-more"><span>Showing 8 of ${UT.length}</span></div>`:''}</div></div></div></div>`; }

/* ---------- the ideas’ own clicks ---------- */
function onClick2(t,e){ const a=t.dataset.a;
  if(a==='pacego'){ U.p='mo'; goKpi(t.dataset.k); }
  else if(a==='aln'){ const id=t.dataset.id.replace('al-',''); if(+t.dataset.i===0){ goKpi(id); } else { snap(); U.mute[id]=1; toast(`${KM[id].n} is muted for a week — it’s still on the KPI page.`); rd(); } }
  else if(a==='alt'){ const id=t.dataset.k||U.pop&&U.pop.k; snap(); U.al[id]=U.al[id]?0:1; toast(U.al[id]?`You’ll hear about ${KM[id].n} when it’s off target three workdays in a row.`:`No more alerts for ${KM[id].n}.`); rd(); }
  else if(a==='chkfix'){ const c=CHK0.find(x=>x.id===t.dataset.id); if(!c) return; U.pop=null; if(c.go) PG.openRo(c.go); else { UI.tlDay=c.tl; UI.tlWho=c.who||null; PG.go('timelog'); } }
  else if(a==='chkx'){ snap(); mgSet().chkx[t.dataset.id]=nowIso(); toast('Hidden — it comes back if it happens again.'); rd(); }
  else if(a==='folder'){ U.pop=null; rd(); if(typeof FS!=='undefined'&&FS.status==='needs-permission'&&typeof reconnectFolder==='function') reconnectFolder(); else if(typeof connectFolder==='function') connectFolder(); }
  else if(a==='goteam'){ U.view='team'; U.pop=null; rd(); }
  else if(a==='goparts'){ PG.go('parts'); }
  else if(a==='unl0'){ U.unl=false; rd(); }
  else if(a==='addgo'){ const nm=(($('#mq-an')||{}).value||'').trim().replace(/\s+/g,' '), role=($('#mq-ar')||{}).value||'Technician';
    if(!permOk('a.people')) return; if(!nm){ toast('Type their name.',false); return; } if(staffList().some(x=>techSame(x.name,nm))){ toast(`${nm} is already on the team.`,false); return; }
    snap(); const ad=admAddPerson(nm,role);   /* Parsec 13: a temporary PIN, shown once */
    U.pop=null; U._sd=null; U.person=null; U.addK=nm; rd(); admPinShow(ad.sf,ad.pin,true); }
  else if(a==='rmgo'){ const sf=staffOf(t.dataset.k); if(!sf||!permOk('a.people')) return; snap(); STATE.staff=staffList().filter(x=>x.id!==sf.id); try{ if(viewAsId()===sf.id) localStorage.removeItem('tec_viewas'); audit('staff',sf.name+' removed from the team'); }catch(err){} U.pop=null; U.person=null; U._sd=null; toast(`${sf.name} is off the team.`); rd(); }
  else if(a==='rep'){ U.rep=addM(TODAY,-1); U.pop=null; rd(); }
  else if(a==='repm'){ U.rep=t.dataset.v; rd(); }
  else if(a==='repx'){ U.rep=null; rd(); }
  else if(a==='fleet'){ U.fleet=t.dataset.k; U.kb=false; rd(); }
  else if(a==='fsel'){ goKpi(t.dataset.k,{k:'cust',v:U.fleet}); }
  else if(a==='print'||a==='repprint'){ const el=$(a==='repprint'?'.mq-sheet':'.mq-pane'); if(!el) return; el.classList.add('pg-printme'); document.documentElement.classList.add('pg-print2'); setTimeout(()=>{ try{ window.print(); } finally { el.classList.remove('pg-printme'); document.documentElement.classList.remove('pg-print2'); } },30); }
  else if(a==='csv'){ const k=KM[t.dataset.k]; if(!k) return; const [a0,b0]=W(), X=ctx(a0,b0,U.bf), L=drillRows(k,X).map(x=>x.r||x); const rows=[['RO','Customer','Truck','Pay','Opened','Closed','Tech','Sales','Hours sold','Hours on jobs']].concat(L.map(r=>[r.no,r.cust,r.truck,PAY[r.pay],r.open,r.close>TODAY?'':r.close,PPL[r.tech]||r.tech,r.sales,r.q,r.b])); dl(k.n+' '+a0+' to '+b0+'.csv',rows); }
  else if(a==='alcsv'){ try{ const a1=document.createElement('a'); a1.href=URL.createObjectURL(new Blob([auditCsv()],{type:'text/csv'})); a1.download='activity-'+TODAY+'.csv'; document.body.appendChild(a1); a1.click(); setTimeout(()=>{ URL.revokeObjectURL(a1.href); a1.remove(); },500); }catch(err){ toast('Couldn’t save the file here.',false); } }
}
function dl(name,rows){ const csv=rows.map(r=>r.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\n'); const a1=document.createElement('a'); a1.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a1.download=name; document.body.appendChild(a1); a1.click(); setTimeout(()=>{ URL.revokeObjectURL(a1.href); a1.remove(); },500); toast('Saved — '+(rows.length-1)+' rows.',false); }



  reset();
  const H = new Proxy({}, { get: (o, a) => (t, e) => { DIRTY = false; const r = onClick(t, e); if(DIRTY){ scheduleSave(true); DIRTY = false; } return r; } });
  function change(t){ DIRTY = false; onChange(t); if(DIRTY){ scheduleSave(true); DIRTY = false; } }
  function input(t, e){ onInput(e); }
  function fieldKey(t, ev){ if(ev.key === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } ev.preventDefault(); return true; }
    if(ev.key === 'Enter' && U.pop){ ev.preventDefault(); if(t.id === 'mq-pq'){ const b = $('.tg-pop .mq-srr'); if(b) b.click(); } else { const b = $('.tg-pop .btn-primary:not([disabled])'); if(b) b.click(); } return true; }
    return false; }
  /* Parsec 13.1 — the search is an icon: the window filters the KPI list as you type */
  const mgQ=(q,f)=>{ const s=U.q; U.q=q; try{ return f(); } finally { U.q=s; } };
  psmReg('manager',()=>({ title:'Find a KPI', page:'KPI', placeholder:'Find a KPI — hours, comeback, parts…',
    get:()=>U.q, set:q=>{ U.q=q; if(q&&U.view!=='kpi'){ U.view='kpi'; U.pop=null; } const L=kRows(); if(L.length&&!L.some(k=>k.id===U.sel)){ U.sel=L[0].id; U.bf=null; U.bk=null; } rd(); },
    count:q=>({ n:mgQ(q,()=>kRows().length), of:mgQ('',()=>kRows().length) }),
    items:q=>q?mgQ(q,()=>kRows()).slice(0,8).map(k=>{ const o=kv(k); return { id:k.id, title:k.n, sub:[CAT[k.c][0], locked(k)?'needs data':fmt(k.u,o.v), o.t!=null?(o.ok?'on target':'target '+fmt(k.u,o.t)):''].filter(Boolean).join(' · ') }; }):[],
    pick:it=>{ goKpi(it.id); } }));
  PG.reg('manager', { H, U: () => U, input, change, fieldKey, keydown, after });
  return { view, fleetsView, U: () => U, KM, kv: k => kv(k), ctx: (a, b, F) => ctx(a, b, F), goalsFor: k => { try{ sync(); }catch(e){} return (PGS() || {})[k] || null; } };
