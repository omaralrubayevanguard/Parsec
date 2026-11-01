const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const p2=n=>String(n).padStart(2,'0');
const usd0=n=>(n<0?'−$':'$')+Math.round(Math.abs(n)).toLocaleString('en-US');
const h1=n=>(Math.round(n*10)/10).toFixed(1);
const TODAY='2026-10-22';
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], DW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const fd=k=>{ if(!k) return '—'; const d=dOf(k); return MN[d.getMonth()]+' '+d.getDate(); };
const md=k=>{ const d=dOf(k); return (d.getMonth()+1)+'/'+d.getDate(); };
const dd=(a,b)=>Math.round((dOf(b)-dOf(a))/86400000);
const wf=k=>{ const g=dOf(k).getDay(); return g===0?0:g===6?.5:1; };
const addW=(k,n)=>{ let d=k; while(n>0){ d=addD(d,1); if(wf(d)) n--; } return d; };
const PPL={RH:'Ray Holloway',FD:'Frank Delaney',AM:'Alicia Moore',JT:'Jordan Tate',BO:'Ben Okafor',GP:'Grace Park',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
const F=k=>PPL[k].split(' ')[0];
const RATE=210, BAYS=8;
const TECHS=['MR','DK','LM','PS','AW','KT'];
const SKILL={MR:.93,DK:.97,LM:1.0,PS:1.04,AW:1.13,KT:.99};
const CUST=['Piedmont Aggregates','Silverline LTL','Triad Cold Chain','Yadkin Valley Freight','Dixie Fleet Services','Uwharrie Fuel','Haw River Dairy','Catawba Timber','Elkin Hardwoods','Copperline Transport','Red Mesa Hauling','Surry Feed & Seed','Keystone Carriers','Iron Horse Logistics','Rowan Ready Mix','Sandhills Grain','Mount Airy Logistics','Alamance Hauling','Forsyth Fleet Services','Highplains Grain','Midway Auto Transport','Prairie Line Trucking'];
const CW=CUST.map((c,i)=>i<6?5:i<12?2.2:1); const CWS=CW.reduce((a,b)=>a+b,0);
const TRUCK=['2018 VNL 670','2019 VNL 760','2020 VNL 760','2021 VNL 860','2019 VNR 640','2022 VNL 760','2020 VHD','2017 VNL 670'];
const PAY={cp:'Customer pay',w:'Warranty',int:'Internal'};
const OPT={diag:'Diagnosis',rep:'Repair',pm:'PM service',war:'Warranty repair'};
function rng(seed){ let a=0; for(const c of seed) a=(a*31+c.charCodeAt(0))|0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ---------- a dealership’s last 210 days, made up but consistent ---------- */
const R=rng('vanguard-greensboro-7');
const rr=(a,b)=>a+R()*(b-a), ri=(a,b)=>Math.floor(rr(a,b+1)), pick=L=>L[Math.floor(R()*L.length)], r1=n=>Math.round(n*10)/10;
const lgn=s=>Math.exp((R()+R()+R()-1.5)*s);
const cpick=()=>{ let x=R()*CWS; for(let i=0;i<CUST.length;i++){ x-=CW[i]; if(x<=0) return CUST[i]; } return CUST[0]; };
const START='2025-01-01', DAYS=dd(START,TODAY);
const ROS=[]; let NO=33240;
function mkOp(t,q,tech){ const fixA=(t==='rep'||t==='war')&&R()<.42, fixU=fixA&&R()<.7; let b=q*SKILL[tech]*lgn(.24)*(fixU?.9:1); if(R()<.07) b*=rr(1.35,1.9); return {t,q,b:Math.max(.2,r1(b)),tech,fixA,fixU}; }
function mkRO(open){
  const u=R(), pay=u<.6?'cp':u<.9?'w':'int', tech=pick(TECHS), cust=cpick();
  let ops=[]; if(R()<.62) ops.push(mkOp('diag',r1(rr(.5,1.5)),tech));
  const nR=ri(1,3); for(let i=0;i<nR;i++){ const t=pay==='w'?'war':(R()<.18?'pm':'rep'); const q=t==='pm'?r1(rr(1.2,2.6)):Math.max(.5,r1(Math.min(9,rr(1.3,3.6)*lgn(.5)))); ops.push(mkOp(t,q,R()<.82?tech:pick(TECHS))); }
  let lines=0, prt=0, miss=0;
  ops.forEach(o=>{ if(o.t==='diag') return; const n=o.t==='pm'?2:ri(0,2); for(let j=0;j<n;j++){ lines++; prt+=o.t==='pm'?rr(40,150):Math.min(3200,rr(130,760)*lgn(.75)); if(R()>.86) miss++; } });
  let pw=miss?ri(1,4)+(R()<.2?ri(2,4):0):0; const late=pw>0&&R()<.32;
  const est=pay==='cp'; let appr=true, aw=0, dec=0;
  if(est){ aw=r1(Math.min(30,rr(.3,5.5)*lgn(.85)));
    if(R()<.13&&ops.some(o=>o.t==='diag')){ appr=false; const drop=ops.filter(o=>o.t!=='diag'); dec=Math.round(drop.reduce((s,o)=>s+o.q*RATE,0)+prt*.92); ops=ops.filter(o=>o.t==='diag'); prt=0; lines=0; miss=0; pw=0; }
    else if(R()<.2) dec=Math.round(rr(250,2300)); }
  const fc=r1(Math.min(30,rr(.3,4.6)*lgn(.75)));
  const B=ops.reduce((s,o)=>s+o.b,0), Q=ops.reduce((s,o)=>s+o.q,0);
  const wd=1+Math.floor(fc/10+B/7.5+pw+aw/12+(pay==='w'?rr(0,2.2):0)+rr(0,1.25));
  const prom=Math.max(1,Math.floor(B/7.5+2+(pay==='w'?1:0))+(R()<.62?1:0));
  const close=addW(open,wd);
  const pk=R()<.55?0:r1(Math.min(6,rr(.2,2.6)*lgn(.5)));
  const cb=R()<.034?ri(3,29):0;
  const lab=Math.round(Q*RATE); prt=Math.round(prt);
  let wo=est&&R()<.03?Math.round(rr(80,900)):0, cl=null;
  if(pay==='w'){ const filed=addD(close,ri(1,4)), rej=R()<.065, payD=ri(9,38); cl={filed,amt:lab+prt,rej,payD,dec:addD(filed,payD)}; if(rej&&R()<.5) wo+=Math.round((lab+prt)*.35); }
  const cr=lines&&(pay==='w'||R()<.2)?Math.round(prt*rr(.05,.25)):0, crAt=cr?addD(close,ri(10,45)):null;
  const r={no:String(++NO),open,close,pay,cust,truck:pick(TRUCK),tech,ops,lines,miss,pw,late,est,appr,aw,dec,fc,prom,wd,pk,cb,wo,cl,cr,crAt,lab,prt,sales:lab+prt,q:r1(Q),b:r1(B)};
  ops.forEach(o=>o.r=r); return r;
}
for(let i=0;i<=DAYS;i++){ const k=addD(START,i), f=wf(k); if(!f) continue; const n=Math.round((f===1?8.6:3.2)*(.72+R()*.56)); for(let j=0;j<n;j++) ROS.push(mkRO(k)); }
/* the three trucks the other pages talk about, so the numbers line up */
(()=>{ const L=ROS.filter(r=>r.close>TODAY); const set=(r,o)=>Object.assign(r,o);
  if(L[0]) set(L[0],{no:'37795',cust:'Haw River Dairy',truck:'2019 VNL 760'}); if(L[1]) set(L[1],{no:'37802',cust:'Catawba Timber',truck:'2019 VNL 860'}); if(L[2]) set(L[2],{no:'37760',cust:'Piedmont Aggregates',truck:'2018 VNL 670'}); })();
/* repeat customers: in during the 90 days before */
(()=>{ const by={}; ROS.forEach(r=>{ (by[r.cust]=by[r.cust]||[]).push(r.open); }); ROS.forEach(r=>{ r.rep=by[r.cust].some(d=>d<r.open&&d>=addD(r.open,-90)); }); })();
/* who clocked what, day by day: an operation’s hours spread over the days the RO was open */
const TB={}, ATT={}, BAYU={}; TECHS.forEach(t=>{ TB[t]={}; ATT[t]={}; });
ROS.forEach(r=>{ const D=[]; for(let k=r.open;k<=r.close;k=addD(k,1)) if(wf(k)) D.push(k); if(!D.length) D.push(r.open);
  r.ops.forEach(o=>{ D.forEach(k=>{ if(k<=TODAY) TB[o.tech][k]=(TB[o.tech][k]||0)+o.b/D.length; }); }); });
const R2=rng('attendance');
for(let i=0;i<=DAYS;i++){ const k=addD(START,i), f=wf(k); if(!f) continue; let tot=0;
  TECHS.forEach(t=>{ const b=TB[t][k]||0; tot+=b; ATT[t][k]=f===1?Math.max(8.5+R2()*.6,b+.4+R2()*.6):(b>0?Math.max(b+.4+R2()*.6,4.5):0); });
  BAYU[k]=Math.min(100,tot*1.3/(BAYS*(f===1?9.5:5))*100); }
ROS.forEach(r=>{ if(r.close>TODAY){ const p=(dd(r.open,TODAY)+.5)/Math.max(1,dd(r.open,r.close));
  r.status=r.pw&&TODAY<addW(r.open,r.pw+1)?'Waiting on parts':r.est&&(!r.appr||(+r.no%4===0&&p<.5))?'Waiting approval':p<.12?'Checked in':p<.3?'Diagnosing':r.pay==='w'&&p<.45?'Warranty auth':p>.88?'Road test':'In progress'; } });
const BYC={}, BYO={}; ROS.forEach(r=>{ (BYC[r.close]=BYC[r.close]||[]).push(r); (BYO[r.open]=BYO[r.open]||[]).push(r); });
const ST_COL={'Checked in':'var(--tg-st-hold)','Diagnosing':'var(--tg-st-support)','Waiting approval':'var(--tg-st-customer)','Warranty auth':'var(--tg-acc)','Waiting on parts':'var(--tg-st-waiting)','In progress':'var(--tg-st-working)','Road test':'var(--tg-good)'};

/* ---------- the engine: every number below comes from these few functions ---------- */
const sum=(L,f)=>L.reduce((s,x)=>s+f(x),0), avg=(L,f)=>L.length?sum(L,f)/L.length:null;
const MEMO=new Map();
const roF=F=>r=>!F||(F.k==='pay'?r.pay===F.v:F.k==='cust'?r.cust===F.v:F.k==='tech'?r.tech===F.v:F.k==='type'?r.ops.some(o=>o.t===F.v):true);
const opF=F=>o=>!F||(F.k==='tech'?o.tech===F.v:F.k==='type'?o.t===F.v:F.k==='pay'?o.r.pay===F.v:F.k==='cust'?o.r.cust===F.v:true);
function ctx(a,b,F){ const key=a+'|'+b+'|'+(F?F.k+':'+F.v:''); if(MEMO.has(key)) return MEMO.get(key);
  const D=[]; for(let k=a;k<=b;k=addD(k,1)) D.push(k); const f=roF(F), g=opF(F);
  const CL=[], OP=[], ops=[]; D.forEach(k=>{ (BYC[k]||[]).forEach(r=>{ if(r.close>TODAY) return; if(f(r)) CL.push(r); r.ops.forEach(o=>{ if(g(o)) ops.push(o); }); }); (BYO[k]||[]).forEach(r=>{ if(f(r)) OP.push(r); }); });
  const T=F&&F.k==='tech'?[F.v]:TECHS; let att=0, bur=0; D.forEach(k=>T.forEach(t=>{ att+=ATT[t][k]||0; bur+=TB[t][k]||0; }));
  const X={a,b,D,F,CL,OP,ops,att,bur,wd:D.reduce((s,k)=>s+wf(k),0)}; MEMO.set(key,X); return X; }
const openAt=(t,F)=>ROS.filter(r=>r.open<=t&&r.close>t&&roF(F)(r));
const partsAt=(t,F)=>openAt(t,F).filter(r=>r.pw&&t<addW(r.open,r.pw+1));
const claimsIn=X=>ROS.filter(r=>r.cl&&r.cl.filed>=X.a&&r.cl.filed<=X.b&&r.cl.filed<=TODAY&&roF(X.F)(r));
const decidedIn=X=>ROS.filter(r=>r.cl&&r.cl.dec>=X.a&&r.cl.dec<=X.b&&r.cl.dec<=TODAY&&roF(X.F)(r));
const pendAt=(t,F)=>ROS.filter(r=>r.cl&&r.cl.filed<=t&&r.cl.dec>t&&roF(F)(r));
const credAt=(t,F)=>ROS.filter(r=>r.cr&&r.close<=t&&r.crAt>t&&roF(F)(r));
const over=o=>Math.max(0,o.b-o.q);
const CAT={lab:['Labor','timelog'],mon:['Money','dollar'],flo:['Flow','ros'],qua:['Quality','check'],war:['Warranty','warranty'],prt:['Parts','parts'],cus:['Customers','user']};
/* k: id · c: group · n: name · u: unit · d: which way is good · t: target (or tw: per workday) · br: breakdowns · dr: what the ROs table lists */
const K=[
 {id:'eff',c:'lab',n:'Efficiency',u:'pct',d:1,t:100,how:'Hours sold ÷ hours clocked, on the same operations.',src:['Time Log','ROs'],br:['tech','type','pay'],dr:'ops',mh:'Sold / clocked',col:R=>[pc(R.q/R.b*100),`${h1(R.q)} / ${h1(R.b)} h`],tone:R=>R.q/R.b<.85?'bad':R.q/R.b<1?'warn':'',sk:R=>R.q/R.b,f:X=>{ const b=sum(X.ops,o=>o.b); return b?sum(X.ops,o=>o.q)/b*100:null; }},
 {id:'prod',c:'lab',n:'Productivity',u:'pct',d:1,t:85,how:'Hours clocked on ROs ÷ hours on the clock.',src:['Time Log'],br:['tech'],dr:'tech',f:X=>X.att?X.bur/X.att*100:null},
 {id:'ovr',c:'lab',n:'Overall',u:'pct',d:1,t:85,how:'Hours sold ÷ hours on the clock — efficiency and productivity in one number.',src:['Time Log','ROs'],br:['tech'],dr:'tech',f:X=>X.att?sum(X.ops,o=>o.q)/X.att*100:null},
 {id:'sold',c:'lab',n:'Hours sold',u:'h',d:1,tw:45,how:'Quoted hours on operations closed in the period.',src:['ROs'],br:['tech','type','pay'],dr:'ops',mh:'Sold',col:R=>[h1(R.q)+' h',R.ops.length+' op'+(R.ops.length>1?'s':'')],sk:R=>-R.q,f:X=>sum(X.ops,o=>o.q)},
 {id:'clk',c:'lab',n:'Hours on ROs',u:'h',d:0,how:'Hours clocked on repair orders — straight from the Time Log punches.',src:['Time Log'],br:['tech'],dr:'tech',f:X=>X.bur},
 {id:'lost',c:'lab',n:'Hours over quote',u:'h',d:-1,tw:3,how:'Clocked minus quoted, on the operations that ran over.',src:['Time Log','ROs'],br:['tech','type','pay'],dr:'ops',mh:'Over quote',col:R=>['+'+h1(sum(R.ops,over))+' h',`${h1(R.q)} quoted`],tone:R=>sum(R.ops,over)>1.5?'bad':sum(R.ops,over)>0?'warn':'',sk:R=>-sum(R.ops,over),f:X=>sum(X.ops,over)},
 {id:'unap',c:'lab',n:'Unapplied hours',u:'h',d:-1,tw:8,how:'On the clock but not on an RO — waiting for work, shop jobs, clean-up.',src:['Time Log'],br:['tech'],dr:'tech',f:X=>Math.max(0,X.att-X.bur)},
 {id:'lph',c:'lab',n:'Labor $ per clocked hour',u:'usd',d:1,t:210,how:'Labor sold ÷ hours clocked. At 100% efficiency it’s the $210 rate.',src:['Time Log','ROs'],br:['tech','type','pay'],dr:'ops',mh:'Per clocked h',col:R=>[usd0(R.q*RATE/R.b),`${h1(R.b)} h clocked`],tone:R=>R.q/R.b<.85?'bad':R.q/R.b<1?'warn':'',sk:R=>R.q/R.b,f:X=>{ const b=sum(X.ops,o=>o.b); return b?sum(X.ops,o=>o.q)*RATE/b:null; }},
 {id:'sales',c:'mon',n:'Total sales',u:'usd',d:1,tw:16000,how:'Labor plus parts, on ROs closed in the period.',src:['ROs','Parts'],br:['pay','tech','cust'],dr:'CL',mh:'Sales',col:r=>[usd0(r.sales),`${usd0(r.lab)} labor`],sk:r=>-r.sales,f:X=>sum(X.CL,r=>r.sales)},
 {id:'lab',c:'mon',n:'Labor sales',u:'usd',d:1,tw:9000,how:'Hours sold × $210.',src:['ROs'],br:['pay','tech','type'],dr:'ops',mh:'Labor',col:R=>[usd0(R.q*RATE),h1(R.q)+' h sold'],sk:R=>-R.q,f:X=>sum(X.ops,o=>o.q)*RATE},
 {id:'prt',c:'mon',n:'Parts sales',u:'usd',d:1,tw:7000,how:'Parts billed on ROs closed in the period.',src:['Parts'],br:['pay','tech','cust'],dr:'CL',mh:'Parts',col:r=>[usd0(r.prt),r.lines+' line'+(r.lines===1?'':'s')],sk:r=>-r.prt,f:X=>sum(X.CL,r=>r.prt)},
 {id:'aro',c:'mon',n:'Average RO',u:'usd',d:1,t:1800,how:'Total sales ÷ ROs closed.',src:['ROs'],br:['pay','tech','cust'],dr:'CL',mh:'Sales',col:r=>[usd0(r.sales),h1(r.q)+' h sold'],sk:r=>r.sales,f:X=>X.CL.length?sum(X.CL,r=>r.sales)/X.CL.length:null},
 {id:'hpr',c:'mon',n:'Hours per RO',u:'h',d:1,t:5,how:'Hours sold ÷ ROs closed.',src:['ROs'],br:['pay','tech','cust'],dr:'CL',mh:'Sold',col:r=>[h1(r.q)+' h',r.ops.length+' ops'],sk:r=>r.q,f:X=>X.CL.length?sum(X.CL,r=>r.q)/X.CL.length:null},
 {id:'cps',c:'mon',n:'Customer pay share',u:'pct',d:1,t:60,how:'Share of sales the customer paid — not warranty, not internal.',src:['ROs'],br:['tech','cust'],dr:'CL',mh:'Pay',col:r=>[PAY[r.pay],usd0(r.sales)],sk:r=>r.pay==='cp'?1:0,f:X=>{ const s=sum(X.CL,r=>r.sales); return s?sum(X.CL.filter(r=>r.pay==='cp'),r=>r.sales)/s*100:null; }},
 {id:'dec',c:'mon',n:'Declined work',u:'usd',d:-1,how:'Work on estimates the customer said no to — worth a call back.',src:['Triage'],br:['cust','tech'],dr:'OP',flt:r=>r.dec>0,mh:'Declined',col:r=>[usd0(r.dec),r.appr?'part of it':'all of it'],tone:()=>'warn',sk:r=>-r.dec,f:X=>sum(X.OP,r=>r.dec)},
 {id:'wo',c:'mon',n:'Write-offs and goodwill',u:'usd',d:-1,how:'Goodwill given and rejected claims written off.',src:['Warranty'],br:['pay','cust','tech'],dr:'CL',flt:r=>r.wo>0,mh:'Written off',col:r=>[usd0(r.wo),r.cl&&r.cl.rej?'claim rejected':'goodwill'],tone:()=>'bad',sk:r=>-r.wo,f:X=>sum(X.CL,r=>r.wo)},
 {id:'opn',c:'flo',n:'ROs opened',u:'n',d:0,how:'Trucks checked in.',src:['Triage'],br:['pay','tech','cust'],dr:'OP',mh:'Opened',col:r=>[md(r.open),PAY[r.pay]],sk:r=>-dd(r.open,TODAY),f:X=>X.OP.length},
 {id:'cls',c:'flo',n:'ROs closed',u:'n',d:1,tw:8.5,how:'ROs closed out in the period.',src:['ROs'],br:['pay','tech','cust'],dr:'CL',mh:'Days open',col:r=>[dd(r.open,r.close)+' d',usd0(r.sales)],sk:r=>-dd(r.open,r.close),f:X=>X.CL.length},
 {id:'wip',c:'flo',n:'Open ROs',u:'n',d:0,snap:1,how:'ROs open at the end of the period.',src:['ROs'],br:['pay','tech','cust'],dr:'open',mh:'Status',col:r=>[r.status||'—',dd(r.open,TODAY)+' d open'],sk:r=>-dd(r.open,TODAY),f:X=>openAt(X.b,X.F).length},
 {id:'wiph',c:'flo',n:'Quoted hours waiting',u:'h',d:0,snap:1,how:'Quoted hours not yet worked, on open ROs.',src:['ROs','Time Log'],br:['tech','pay'],dr:'open',mh:'Left',col:r=>[h1(left(r,TODAY))+' h',h1(r.q)+' quoted'],sk:r=>-left(r,TODAY),f:X=>sum(openAt(X.b,X.F),r=>left(r,X.b))},
 {id:'days',c:'flo',n:'Average days open',u:'d',d:-1,t:4,how:'Check-in to close, on ROs closed in the period.',src:['ROs'],br:['pay','tech','cust'],dr:'CL',mh:'Days open',col:r=>[dd(r.open,r.close)+' d',r.pw?r.pw+' d on parts':''],tone:r=>dd(r.open,r.close)>8?'bad':dd(r.open,r.close)>5?'warn':'',sk:r=>-dd(r.open,r.close),f:X=>avg(X.CL,r=>dd(r.open,r.close))},
 {id:'fc',c:'flo',n:'Time to first clock',u:'hr',d:-1,t:4,how:'Check-in to the first punch on the RO.',src:['Triage','Time Log'],br:['tech','pay'],dr:'OP',mh:'First clock',col:r=>[h1(r.fc)+' h',F(r.tech)],tone:r=>r.fc>8?'bad':r.fc>4?'warn':'',sk:r=>-r.fc,f:X=>avg(X.OP,r=>r.fc)},
 {id:'aw',c:'flo',n:'Approval wait',u:'hr',d:-1,t:6,how:'Estimate sent to the customer’s yes.',src:['Triage'],br:['cust','tech'],dr:'OP',flt:r=>r.est&&r.appr,mh:'Waited',col:r=>[h1(r.aw)+' h',''],tone:r=>r.aw>12?'bad':r.aw>6?'warn':'',sk:r=>-r.aw,f:X=>avg(X.OP.filter(r=>r.est&&r.appr),r=>r.aw)},
 {id:'pw',c:'flo',n:'Parts wait',u:'d',d:-1,t:1.5,how:'Days an RO waited on parts, on ROs that used parts.',src:['Parts'],br:['pay','tech','cust'],dr:'CL',flt:r=>r.lines>0,mh:'Waited',col:r=>[r.pw+' d',r.miss?r.miss+' not on the shelf':'all on the shelf'],tone:r=>r.pw>3?'bad':r.pw?'warn':'',sk:r=>-r.pw,f:X=>avg(X.CL.filter(r=>r.lines),r=>r.pw)},
 {id:'pk',c:'flo',n:'Ready to picked up',u:'d',d:-1,t:1,how:'Released to the customer driving off — trucks sitting on the yard.',src:['Triage'],br:['cust','pay'],dr:'CL',mh:'Sat',col:r=>[h1(r.pk)+' d',''],tone:r=>r.pk>2?'warn':'',sk:r=>-r.pk,f:X=>avg(X.CL,r=>r.pk)},
 {id:'bay',c:'flo',n:'Bay use',u:'pct',d:1,t:85,how:'Hours a bay held a truck ÷ bay hours open (8 bays).',src:['Foreman'],br:[],dr:'none',f:X=>{ const D=X.D.filter(k=>wf(k)); return D.length?avg(D,k=>BAYU[k]):null; }},
 {id:'cb',c:'qua',n:'Comeback rate',u:'pct',d:-1,t:3,how:'Same truck back with the same complaint within 30 days.',src:['Fixes'],br:['tech','type','pay'],dr:'CL',flt:r=>r.cb>0,mh:'Came back',col:r=>['in '+r.cb+' d',F(r.tech)],tone:()=>'bad',sk:r=>r.cb,f:X=>X.CL.length?X.CL.filter(r=>r.cb).length/X.CL.length*100:null},
 {id:'qa',c:'qua',n:'Quote accuracy',u:'pct',d:1,t:80,how:'Operations that finished within 15% of the quote.',src:['Time Log','ROs'],br:['tech','type','pay'],dr:'ops',mh:'Clocked vs quote',col:R=>[(R.b>=R.q?'+':'−')+h1(Math.abs(R.b-R.q))+' h',`${h1(R.q)} quoted`],tone:R=>Math.abs(R.b-R.q)>R.q*.15?'warn':'',sk:R=>-Math.abs(R.b-R.q)/R.q,f:X=>X.ops.length?X.ops.filter(o=>Math.abs(o.b-o.q)<=o.q*.15).length/X.ops.length*100:null},
 {id:'dg',c:'qua',n:'Diag hours per RO',u:'h',d:-1,t:1,how:'Diagnosis hours clocked ÷ ROs closed.',src:['Time Log'],br:['tech','pay'],dr:'CL',mh:'Diag',col:r=>[h1(sum(r.ops.filter(o=>o.t==='diag'),o=>o.b))+' h',''],sk:r=>-sum(r.ops.filter(o=>o.t==='diag'),o=>o.b),f:X=>X.CL.length?sum(X.ops.filter(o=>o.t==='diag'),o=>o.b)/X.CL.length:null},
 {id:'fx',c:'qua',n:'Past fix used',u:'pct',d:1,t:75,how:'Jobs with a past fix in Fixes where someone pressed Use fix.',src:['Fixes'],br:['tech','pay'],dr:'ops',fo:o=>o.fixA,mh:'Use fix',col:R=>[R.ops.some(o=>o.fixU)?'Used':'Not used',''],tone:R=>R.ops.some(o=>o.fixU)?'':'warn',sk:R=>R.ops.some(o=>o.fixU)?1:0,f:X=>{ const A=X.ops.filter(o=>o.fixA); return A.length?A.filter(o=>o.fixU).length/A.length*100:null; }},
 {id:'wcl',c:'war',n:'Claims filed',u:'n',d:0,how:'Warranty claims sent to Volvo.',src:['Warranty'],br:['tech','cust'],dr:'claim',f:X=>claimsIn(X).length},
 {id:'wpd',c:'war',n:'Claims paid',u:'usd',d:1,how:'Claim money that came back in the period.',src:['Warranty'],br:['tech','cust'],dr:'claimpaid',f:X=>sum(decidedIn(X).filter(r=>!r.cl.rej),r=>r.cl.amt)},
 {id:'wpn',c:'war',n:'Claims waiting on pay',u:'usd',d:-1,snap:1,how:'Filed, not paid or rejected yet.',src:['Warranty'],br:['tech','cust'],dr:'claimpend',f:X=>sum(pendAt(X.b,X.F),r=>r.cl.amt)},
 {id:'wrj',c:'war',n:'Reject rate',u:'pct',d:-1,t:5,how:'Rejected ÷ claims decided in the period.',src:['Warranty'],br:['tech','cust'],dr:'claimdec',f:X=>{ const L=decidedIn(X); return L.length?L.filter(r=>r.cl.rej).length/L.length*100:null; }},
 {id:'wdp',c:'war',n:'Days to get paid',u:'d',d:-1,t:21,how:'Filed to paid, on claims paid in the period.',src:['Warranty'],br:['tech','cust'],dr:'claimpaid',f:X=>avg(decidedIn(X).filter(r=>!r.cl.rej),r=>r.cl.payD)},
 {id:'fill',c:'prt',n:'Fill rate',u:'pct',d:1,t:85,how:'Part lines on the shelf when the RO needed them.',src:['Parts'],br:['pay','tech','cust'],dr:'CL',flt:r=>r.lines>0,mh:'On the shelf',col:r=>[(r.lines-r.miss)+' of '+r.lines,r.miss?r.pw+' d wait':''],tone:r=>r.miss?'warn':'',sk:r=>(r.lines-r.miss)/r.lines,f:X=>{ const l=sum(X.CL,r=>r.lines); return l?(l-sum(X.CL,r=>r.miss))/l*100:null; }},
 {id:'bko',c:'prt',n:'Waiting on parts',u:'n',d:-1,snap:1,how:'Open ROs held by a part on order.',src:['Parts'],br:['pay','tech','cust'],dr:'parts',f:X=>partsAt(X.b,X.F).length},
 {id:'late',c:'prt',n:'Parts past ETA',u:'n',d:-1,snap:1,how:'Parts on order that missed their ETA.',src:['Parts'],br:['pay','tech'],dr:'late',f:X=>partsAt(X.b,X.F).filter(r=>r.late).length},
 {id:'rcr',c:'prt',n:'Return credits due',u:'usd',d:-1,snap:1,how:'Warranty, core and supplier returns sent — credit not back yet.',src:['Parts'],br:['pay','cust'],dr:'credit',f:X=>sum(credAt(X.b,X.F),r=>r.cr)},
 {id:'apr',c:'cus',n:'Estimate approval',u:'pct',d:1,t:85,how:'Estimates the customer said yes to.',src:['Triage'],br:['cust','tech'],dr:'OP',flt:r=>r.est,mh:'Answer',col:r=>[r.appr?'Yes':'No',r.dec?usd0(r.dec)+' declined':''],tone:r=>r.appr?'':'bad',sk:r=>r.appr?1:0,f:X=>{ const E=X.OP.filter(r=>r.est); return E.length?E.filter(r=>r.appr).length/E.length*100:null; }},
 {id:'ont',c:'cus',n:'Promised on time',u:'pct',d:1,t:90,how:'Released by the day the customer was promised.',src:['Triage'],br:['pay','tech','cust'],dr:'CL',mh:'Promised',col:r=>[r.wd<=r.prom?'On time':(r.wd-r.prom)+' d late',r.prom+' d promised'],tone:r=>r.wd>r.prom?'warn':'',sk:r=>r.prom-r.wd,f:X=>X.CL.length?X.CL.filter(r=>r.wd<=r.prom).length/X.CL.length*100:null},
 {id:'rep',c:'cus',n:'Repeat customers',u:'pct',d:1,how:'Customers on these ROs who were also in during the 90 days before.',src:['ROs'],br:['pay','tech'],dr:'CL',mh:'Repeat',col:r=>[r.rep?'Yes':'First in 90 d',''],sk:r=>r.rep?1:0,f:X=>X.CL.length?X.CL.filter(r=>r.rep).length/X.CL.length*100:null}
];
const KM=Object.fromEntries(K.map(k=>[k.id,k]));
function left(r,t){ const tot=Math.max(1,dd(r.open,r.close)), el=Math.min(tot,dd(r.open,t)+.5); return Math.max(0,r.q*(1-el/tot)); }
const pc=v=>v==null?'—':Math.round(v)+'%';

/* the numbers, formatted */
function fmt(u,v,full){ if(v==null||isNaN(v)) return '—';
  if(u==='pct') return Math.round(v)+'%';
  if(u==='usd') return !full&&Math.abs(v)>=1e6?'$'+(v/1e6).toFixed(2)+'M':!full&&Math.abs(v)>=10000?'$'+(v/1000).toFixed(v>=100000?0:1)+'k':usd0(v);
  if(u==='h') return (v>=100?Math.round(v).toLocaleString():h1(v))+' h';
  if(u==='hr') return h1(v)+' h';
  if(u==='d') return h1(v)+' d';
  return Math.round(v).toLocaleString(); }
const unitWord={pct:'%',usd:'$',h:'h',hr:'h',d:'days',n:''};
/* periods */
const MNL=['January','February','March','April','May','June','July','August','September','October','November','December'], DWL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const minK=(a,b)=>a<b?a:b;
const mStart=k=>k.slice(0,8)+'01';
const mEnd=k=>{ const d=dOf(mStart(k)); d.setMonth(d.getMonth()+1); d.setDate(0); return kOf(d); };
const addM=(k,n)=>{ const d=dOf(mStart(k)); d.setMonth(d.getMonth()+n); return kOf(d); };
const qStart=k=>{ const d=dOf(k); return d.getFullYear()+'-'+p2(Math.floor(d.getMonth()/3)*3+1)+'-01'; };
const qN=k=>Math.floor(dOf(k).getMonth()/3)+1;
const wStart=k=>addD(k,-((dOf(k).getDay()+6)%7));
const mName=k=>MNL[dOf(k).getMonth()];
/* periods — calendar: the week starts Monday; “this” runs to today and compares with the same days before */
const PERS=['day','wk','lwk','mo','lmo','qt','lqt','yr'];
const PKEY={day:'D',wk:'W',mo:'M',qt:'Q',yr:'Y'};
const PCACHE={};
function per(p){ if(PCACHE[p]) return PCACHE[p]; const T=TODAY; let o;
  if(p==='day') o={a:T,b:T,pa:addD(T,-7),pb:addD(T,-7),n:'Today',s:DWL[dOf(T).getDay()]+', '+fd(T),cmp:'vs last '+DWL[dOf(T).getDay()],g:'day'};
  else if(p==='wk'){ const a=wStart(T); o={a,b:T,pa:addD(a,-7),pb:addD(T,-7),n:'This week',s:fd(a)+' – '+fd(T),cmp:'vs the same days last week',g:'wk'}; }
  else if(p==='lwk'){ const a=addD(wStart(T),-7), b=addD(a,6); o={a,b,pa:addD(a,-7),pb:addD(b,-7),n:'Last week',s:fd(a)+' – '+fd(b),cmp:'vs the week before',g:'wk'}; }
  else if(p==='mo'){ const a=mStart(T), pa=addM(T,-1); o={a,b:T,pa,pb:minK(addD(pa,dd(a,T)),mEnd(pa)),n:'This month',s:mName(T)+' 1 – '+dOf(T).getDate(),cmp:'vs '+MN[dOf(pa).getMonth()]+' 1 – '+dOf(minK(addD(pa,dd(a,T)),mEnd(pa))).getDate(),g:'mo'}; }
  else if(p==='lmo'){ const a=addM(T,-1), pa=addM(a,-1); o={a,b:mEnd(a),pa,pb:mEnd(pa),n:'Last month',s:mName(a),cmp:'vs '+mName(pa),g:'mo'}; }
  else if(p==='qt'){ const a=qStart(T), pa=addM(a,-3); o={a,b:T,pa,pb:addD(pa,dd(a,T)),n:'This quarter',s:'Q'+qN(T)+' · '+fd(a)+' – '+fd(T),cmp:'vs the same days of Q'+qN(pa),g:'qt'}; }
  else if(p==='lqt'){ const a=addM(qStart(T),-3), pa=addM(a,-3); o={a,b:addD(qStart(T),-1),pa,pb:addD(a,-1),n:'Last quarter',s:'Q'+qN(a)+' · '+fd(a)+' – '+fd(addD(qStart(T),-1)),cmp:'vs Q'+qN(pa),g:'qt'}; }
  else { const y=+T.slice(0,4), a=y+'-01-01'; o={a,b:T,pa:(y-1)+'-01-01',pb:(y-1)+T.slice(4),n:'This year',s:'Jan 1 – '+fd(T),cmp:'vs the same days of '+(y-1),g:'yr'}; }
  o.p=p; o.fut=o.b>=TODAY; return PCACHE[p]=o; }
function win(p){ const o=per(p); return [o.a,o.b]; }
function pwin(p){ const o=per(p); return [o.pa,o.pb]; }
/* chart buckets for the period, and the matching ones from the period before */
function buckets(p,prev){ const o=per(p), L=[];
  if(o.g==='day'){ if(prev) return null; let k=TODAY; while(L.length<14){ if(wf(k)) L.unshift({a:k,b:k,l:DW[dOf(k).getDay()].slice(0,2)+' '+dOf(k).getDate(),t:DWL[dOf(k).getDay()]+' '+fd(k)}); k=addD(k,-1); } return L; }
  if(o.g==='wk'){ for(let i=0;i<6;i++){ const k=addD(prev?o.pa:o.a,i); L.push({a:k,b:k,l:DW[i+1].slice(0,2)+' '+dOf(k).getDate(),t:DWL[i+1]+' '+fd(k),fut:k>TODAY}); } return L; }
  if(o.g==='mo'){ const a0=o.a, e=mEnd(a0); for(let k=a0;k<=e;k=addD(k,1)){ if(!wf(k)) continue; const d=dOf(k).getDate();
      if(prev){ const pk=addD(o.pa,d-1); L.push(pk<=mEnd(o.pa)?{a:pk,b:pk,t:DWL[dOf(pk).getDay()]+' '+fd(pk)}:null); }
      else L.push({a:k,b:k,l:String(d),t:DWL[dOf(k).getDay()]+' '+fd(k),fut:k>TODAY}); } return L; }
  if(o.g==='qt'){ const qs=o.a, qe=addD(addM(qs,3),-1), pqs=o.pa, pqe=addD(addM(pqs,3),-1); for(let i=0;;i++){ const a=addD(qs,7*i); if(a>qe) break; const b=minK(addD(a,6),qe);
      if(prev){ const pa=addD(pqs,7*i); L.push(pa<=pqe?{a:pa,b:minK(addD(pa,6),pqe),t:'Week of '+fd(pa)}:null); } else L.push({a,b,l:md(a),t:'Week of '+fd(a),fut:a>TODAY}); } return L; }
  const y=+o.a.slice(0,4)-(prev?1:0); for(let m=0;m<12;m++){ const a=y+'-'+p2(m+1)+'-01', b=mEnd(a); L.push({a,b,l:MN[m],t:MNL[m]+' '+y+(!prev&&a<=TODAY&&b>TODAY?' — to date':''),fut:a>TODAY}); } return L; }
const vb=(k,x,F)=>!x||x.fut?null:val(k,x.a,minK(x.b,TODAY),F);
/* the sparkline: the last 12 days, weeks or months up to the end of the period */
const spark=p=>{ const o=per(p), e=minK(o.b,TODAY), L=[];
  if(o.g==='qt'){ for(let i=11;i>=0;i--){ const b=addD(e,-7*i); L.push({a:addD(b,-6),b}); } return L; }
  if(o.g==='yr'){ for(let i=11;i>=0;i--){ const b=addD(e,-28*i); L.push({a:addD(b,-27),b}); } return L; }
  let k=e; while(L.length<12){ if(wf(k)) L.unshift({a:k,b:k}); k=addD(k,-1); } return L; };
const val=(k,a,b,F)=>{ const key='v|'+k.id+'|'+a+'|'+b+'|'+(F?F.k+':'+F.v:''); if(MEMO.has(key)) return MEMO.get(key); const v=k.f(ctx(a,b,F)); MEMO.set(key,v); return v; };
function tgt(k,X){ const o=U.tg[k.id]; if(o===null) return null; if(o!=null) return k.tw!=null?o*X.wd:o; return k.t!=null?k.t:k.tw!=null?k.tw*X.wd:null; }
const tgtBase=k=>{ const o=U.tg[k.id]; return o===null?null:o!=null?o:k.t!=null?k.t:k.tw!=null?k.tw:null; };
function delta(k,v,pv){ if(v==null||pv==null) return {s:'—',cl:'flat'}; let d, s;
  if(k.u==='pct'){ d=v-pv; const n=Math.abs(Math.round(d)); s=n+(n===1?' pt':' pts'); } else if(k.u==='d'||k.u==='hr'){ d=v-pv; s=h1(Math.abs(d))+(k.u==='d'?' d':' h'); } else { if(!pv) return {s:'new',cl:'flat'}; d=(v-pv)/Math.abs(pv)*100; s=Math.abs(Math.round(d))+'%'; }
  const z=k.u==='pct'?Math.abs(d)<.5:k.u==='d'||k.u==='hr'?Math.abs(d)<.05:Math.abs(d)<.5;
  return {s:(z?'':d>0?'▲ ':'▼ ')+(z?'no change':s),cl:z||!k.d?'flat':d*k.d>0?'good':'bad',d,up:d>0}; }
const BRN={tech:'By tech',type:'By job type',pay:'By pay',cust:'By customer'};
function brVals(key,X){ if(key==='tech') return TECHS.map(t=>[t,PPL[t]]); if(key==='pay') return Object.keys(PAY).map(p=>[p,PAY[p]]); if(key==='type') return Object.keys(OPT).map(t=>[t,OPT[t]]);
  const C={}; ctx(X.a,X.b).CL.forEach(r=>{ C[r.cust]=(C[r.cust]||0)+r.sales; }); return Object.keys(C).sort((a,b)=>C[b]-C[a]).slice(0,7).map(c=>[c,c]); }

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
  U={view:'ov',p:'mo',sel:'eff',bf:null,bk:null,brk:{},pins:PINS0.slice(),ed:false,pop:null,kb:false,lf:'all',q:'',tg:{},needs:NEEDS0.map(n=>n.id),flow:'parts',rules:JSON.parse(JSON.stringify(RULES0)),goals:Object.assign({},GOALS0),acc:true,person:'MR',pages:Object.fromEntries(STAFF0.map(([k,r])=>[k,Object.fromEntries(ROLES[r].map(p=>[p,1]))])),roles:Object.fromEntries(STAFF0),alf:'all',alw:'',nall:false,al:{prod:1,eff:1,cb:1,fill:1,fc:1,days:1},mute:{},pg:PG0(),unl:false,chk:CHK0.map(c=>c.id),rep:null,repn:'',fleet:'Piedmont Aggregates',note:null};
  UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify({al:U.al,mute:U.mute,pg:U.pg,chk:U.chk,tg:U.tg,pins:U.pins,needs:U.needs,rules:U.rules,goals:U.goals,pages:U.pages,roles:U.roles,acc:U.acc})); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const W=()=>win(U.p), PW=()=>pwin(U.p);
const isSum=k=>['sold','clk','lost','unap','sales','lab','prt','dec','wo','opn','cls','wcl','wpd','leak','gp'].includes(k.id);
function kv(k,F){ if(k.lock&&!U.unl) return {v:null,pv:null,t:null,dl:{s:'needs fields',cl:'flat'},ok:null,X:ctx(...W())}; const [a,b]=W(), [pa,pb]=PW(); const v=val(k,a,b,F), pv=val(k,pa,pb,F); const X=ctx(a,b,F), t=tgt(k,X); return {v,pv,t,dl:delta(k,v,pv),ok:t==null||v==null?null:k.d>=0?v>=t:v<=t,X}; }
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
  const v=U.view, body=v==='kpi'?vKpi():v==='fleet'?vFleet():v==='flow'?vFlow():v==='team'?vTeam():v==='act'?vAct():vOv();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='manager'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg mg">${head()}<div class="tg-body v-${v}">${v==='kpi'?kList():v==='team'?pList():v==='fleet'?fList():''}<div class="tg-main">${body}</div>${pop()}${U.rep?repSheet():''}</div><div class="tk-tip" hidden></div><div class="tk-ring" hidden></div><div class="tk-note" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const nOpen=openAt(TODAY).length, nd=U.needs.length+alerts().length, s=kv(KM.sales), e=kv(KM.eff);
  const vs=[['ov','grid','Overview'],['kpi','chart','KPIs'],['fleet','unit','Fleets'],['flow','swap','Flow'],['team','users','Team'],['act','history','Activity']];
  return `<header class="tg-head"><h1 class="tg-h1">Manager</h1><span class="mg-lock" data-tip="Manager only|No other role can open this page — Team shows it locked.">${ic('lock',13)}</span><span class="tg-facts"><button class="tg-hf" data-a="sel" data-k="wip" data-go="1"><b>${nOpen}</b>open ROs</button><i>·</i>${nd?`<button class="tg-hf w" data-a="view" data-v="ov"><b>${nd}</b>need you</button><i>·</i>`:''}<button class="tg-hf" data-a="sel" data-k="sales" data-go="1"><b>${fmt('usd',s.v)}</b>sales</button>${nChk()?`<i>·</i><button class="tg-hf w" data-a="pop" data-p="chk"><b>${nChk()}</b>data checks</button>`:`<i>·</i><button class="tg-hf" data-a="sel" data-k="eff" data-go="1"><b>${fmt('pct',e.v)}</b>efficiency</button>`}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn btn-sm mg-perb" data-a="pop" data-p="per" title="Period (D · W · M · Q · Y)" style="height:30px">${ic('clock',14)}${per(U.p).n}${ic('chevD',13)}</button><button class="btn ib tg-srch-b" data-a="pop" data-p="find" title="Find a KPI (/)">${ic('search',16)}</button></header>`;
}
/* ---------- overview ---------- */
function vOv(){
  const N=alertNeeds().concat(U.needs.map(id=>NEEDS0.find(n=>n.id===id))), [a,b]=W();
  let h=`<div class="mg-full" data-scroll="ov"><div class="mg-sec">Needs you${N.length?`<span class="mg-n w">${N.length}</span>`:''}<span class="sp"></span>${N.length>4?`<button class="btn btn-sm tg-gh" data-a="nall">${U.nall?'Show 4':'+'+(N.length-4)+' more'}</button>`:''}</div>`;
  h+=N.length?`<div class="mg-needs">${N.slice(0,U.nall?99:4).map(n=>`<div class="mg-nd${n.al?' al':''}"><div class="h">${ic(n.ic,14)}${n.h}</div><p>${n.p}</p><div class="a">${n.a.map((x,i)=>`<button class="btn btn-sm${i===0?' btn-primary':''}" data-a="${n.al?'aln':'nd'}" data-id="${n.id}" data-i="${i}">${x[0]}</button>`).join('')}</div></div>`).join('')}</div>`
    :`<div class="mg-clear">${ic('check',16)}Nothing needs you right now — sign-offs, goodwill asks, comebacks and late hand-offs land here.</div>`;
  h+=`<div class="mg-sec">${mName(TODAY)} pace<span>where ${mName(TODAY)} lands if the rest of the month goes like it has so far</span></div>${paceCard()}`;
  h+=`<div class="mg-sec">Pinned<span>${per(U.p).n} · ${per(U.p).s} · ${per(U.p).cmp}</span><span class="sp"></span>${U.ed?`<span>12 spots — take one off to put another on</span><button class="btn btn-sm tg-gh" data-a="tdef">${ic('undo',13)}The usual 12</button>`:''}<button class="btn btn-sm tg-gh" data-a="rep">${ic('file',13)}Monthly report</button><button class="btn btn-sm tg-gh" data-a="ed">${U.ed?ic('check',13)+'Done':ic('pencil',13)+'Edit tiles'}</button><button class="btn btn-sm tg-gh" data-a="view" data-v="kpi">${ic('chart',13)}All ${K.length} KPIs</button></div>`;
  h+=`<div class="mg-tiles${U.ed?' ed':''}">${U.pins.map((id,i)=>id?tile(KM[id]):U.ed?`<button class="mg-addt" data-a="pop" data-p="add" data-i="${i}">${ic('plus',18)}Add a tile<small>spot ${i+1} of 12</small></button>`:'').join('')}</div>`;
  h+=`<div class="mg-sec">The shop<span>today and the last two weeks</span></div><div class="mg-two"><div class="mg-card"><div class="mg-ch"><b>Hours, last 14 days</b><small>on ROs and unapplied, per day</small><span class="sp"></span><span class="mg-leg"><span><i></i>On ROs</span><span><i class="un"></i>Unapplied</span></span></div><div class="mg-cb">${hoursChart(694)}</div></div>${openCard()}</div><div class="mg-two r2">${leakCard()}${capCard()}</div></div>`;
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
    if(k.lock&&!U.unl) return `<div class="tg-it mg-it lk${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-k="${k.id}"><span class="tg-t"><b>${k.n}</b></span><span class="tg-w">needs ${k.needs.map(n=>({cost:'part cost',pay:'tech pay',ovh:'overhead'})[n]).join(' + ')}</span><span></span><span class="v">${ic('lock',14)}</span></div>`;
    return `<div class="tg-it mg-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-k="${k.id}"><span class="tg-t"><b>${k.n}</b>${U.pins.includes(k.id)?`<span class="pin" title="Pinned to Overview">${ic('pin',12)}</span>`:''}${U.al[k.id]?`<span class="pin" title="Alert on">${ic('bell',12)}</span>`:''}</span><span class="tg-w"><span class="mg-d ${o.dl.cl}">${o.dl.s}</span>${o.t!=null?`<span class="${o.ok?'':'off'}">· ${o.ok?'on target':'target '+fmt(k.u,o.t)}</span>`:''}</span>${sparkSvg(k,64,24)}<span class="v${o.ok===false?' off':''}">${fmt(k.u,o.v)}${k.snap?'<small>now</small>':''}</span></div>`; };
  const body=Object.keys(CAT).map(c=>{ const X=L.filter(k=>k.c===c); return X.length?`<div class="tg-grp">${CAT[c][0]}<span>${X.length}</span></div>`+X.map(item).join(''):''; }).join('')||`<div class="tg-empty"><span class="tg-ring0">${ic('chart',22)}</span><h3>Nothing here</h3><p>No KPI matches.</p></div>`;
  return `<section class="tg-list"><div class="tg-lh">KPIs<span class="n">${K.length}</span></div><div class="mg-srin">${ic('search',14)}<input id="mg-lq" placeholder="Find a KPI — hours, comeback, parts…" value="${esc(U.q)}" autocomplete="off"></div><div class="mg-lh2"><span class="tg-seg3">${[['all','All'],['pin','Pinned · '+U.pins.filter(Boolean).length],['off','Off target · '+nOff]].map(x=>`<button class="${U.lf===x[0]?'on':''}" data-a="lf" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div><div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('P')}pin</span><span>${kbd('T')}target</span><span>${kbd('D')}${kbd('W')}${kbd('M')}${kbd('Q')}${kbd('Y')}period</span><span>${kbd('/')}find</span></div></section>`; }
/* ---------- one KPI ---------- */
function bfName(F){ if(!F) return ''; return F.k==='tech'?PPL[F.v]:F.k==='pay'?PAY[F.v]:F.k==='type'?OPT[F.v]:F.v; }
function vKpi(){ const k=KM[U.sel]; if(k.lock&&!U.unl) return lockPane(k); const F=U.bf, o=kv(k,F), [a,b]=W(), B=chartB(), bk=U.bk!=null?B.cur[U.bk]:null;
  const pin=U.pins.includes(k.id);
  let h=`<div class="mg-pane" data-scroll="pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic(CAT[k.c][1],13)}${CAT[k.c][0]}</span><span>${per(U.p).n} · ${per(U.p).s}${k.snap?' · counted at the end':''}</span><span class="sp"></span><button class="btn btn-sm" data-a="alt" data-k="${k.id}">${ic('bell',14)}${U.al[k.id]?'Alert on':'Alert me'}</button><button class="btn btn-sm" data-a="pin" data-k="${k.id}" title="P">${ic('pin',14)}${pin?'Pinned':'Pin to Overview'}</button><button class="btn btn-sm" data-a="pop" data-p="tgt" data-k="${k.id}" title="T">${ic('flag',14)}${tgtBase(k)!=null?'Target':'Set a target'}</button><button class="btn btn-sm" data-a="toast" data-t="The KPI sheet prints — the number, the trend, the breakdown and the ROs behind it.">${ic('print',14)}Print</button></div><h2>${k.n}</h2>
    <div class="mg-hero"><span class="big">${fmt(k.u,o.v,1)}${k.snap?'<small>right now</small>':''}</span><span class="meta"><span class="mg-d ${o.dl.cl}">${o.dl.s}<small>${per(U.p).cmp} · ${fmt(k.u,o.pv,1)}</small></span>${o.t!=null?tgtTxt(k,o):`<span class="mg-tgt">${ic('flag',12)}No target</span>`}${paceLine(k)}</span><span class="sp" style="flex:1"></span>${F?`<button class="mg-fchip" data-a="bfx">${esc(bfName(F))}${ic('x',12)}</button>`:''}</div>
    ${k.lock?`<div class="mg-sample">${ic('info',13)}Sample numbers — parts cost 58–70% of the price, tech pay $36 an hour, overhead $260k a month.<button data-a="unl0">Hide them</button></div>`:''}<div class="mg-how">${ic('info',13)}<span>${k.how}</span>${['eff','sold','lph','lost','qa','lab'].includes(k.id)&&U.chk.includes('c1')?`<button class="mg-dchip" data-a="pop" data-p="chk">${ic('flag',11)}3 ROs left out — data checks</button>`:''}<span class="src">${k.src.map(s=>`<span>${s}</span>`).join('')}</span></div></div>
   <div class="mg-pad">${whyCard(k)}<div class="mg-card"><div class="mg-ch"><b>Trend</b><small>${{day:'last 14 workdays — today on the right',wk:'by day',mo:'by day',qt:'by week',yr:'by month'}[per(U.p).g]}${bk?' · '+bk.t+' picked':''}</small><span class="sp"></span><span class="mg-leg"><span><i></i>${U.p==='day'?'Each day':'This period'}</span>${pace(k,U.p,U.bf)?'<span><i class="pc"></i>On pace</span>':''}${B.prev?'<span><i class="ln"></i>The period before</span>':''}${tgtBase(k)!=null?'<span><i class="tl"></i>Target</span>':''}</span>${bk?`<button class="btn btn-sm tg-gh" data-a="bkx">${ic('x',12)}Clear day</button>`:''}</div><div class="mg-cb">${trend(k,B,888)}</div></div>
   <div class="mg-bot">${brCard(k)}${drillCard(k,bk)}</div></div></div>`;
  return h; }
function chartB(){ return {cur:buckets(U.p),prev:buckets(U.p,true)}; }
function trend(k,B,w){ const F=U.bf, C=B.cur, V=C.map(x=>vb(k,x,F)), PV=B.prev?B.prev.map(x=>vb(k,x,F)):null, bar=isSum(k), tb=tgtBase(k);
  const TV=C.map(x=>tb==null||x.fut&&k.tw!=null?null:k.tw!=null?tb*ctx(x.a,x.b).wd:tb);
  const PC=bar?paceVals(k,C):null; const all=V.concat(PV||[]).concat(TV).concat(PC||[]).filter(v=>v!=null); const H=200, pl=48, pr=70, pt=10, pb=24;
  let lo=0, hi=Math.max(1e-6,...all)*1.1; if(!bar){ const mn=Math.min(...all); lo=Math.max(0,mn-(hi/1.1-mn)*.6); if(k.u==='pct') lo=Math.floor(lo/10)*10; }
  const nice=v=>{ const p=Math.pow(10,Math.floor(Math.log10(v))), m=v/p; return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p; }; const step=nice((hi-lo)/4); hi=lo+step*Math.ceil((hi-lo)/step);
  const iw=w-pl-pr, st=iw/C.length, y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo)), cx=i=>pl+st*i+st/2, bw=Math.min(26,st*.62);
  const ax=v=>k.u==='pct'?Math.round(v)+'%':k.u==='usd'?(v>=1000?'$'+(v/1000).toFixed(v>=10000||v%1000===0?0:1)+'k':'$'+Math.round(v)):k.u==='n'?Math.round(v):(v%1?v.toFixed(1):v);
  let s=`<svg class="mg-svg" width="${w}" height="${H}"><defs><pattern id="mgh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" style="fill:var(--tg-acc);opacity:.16"/><rect width="2.4" height="6" style="fill:var(--tg-acc);opacity:.6"/></pattern></defs>`;
  for(let g=lo;g<=hi+1e-9;g+=step) s+=`<line class="gl" x1="${pl}" x2="${w-pr+8}" y1="${y(g).toFixed(1)}" y2="${y(g).toFixed(1)}"/><text class="ax" x="${pl-8}" y="${(y(g)+3.5).toFixed(1)}" text-anchor="end">${ax(g)}</text>`;
  const every=per(U.p).g==='yr'?1:C.length>16?3:C.length>9?2:1, sel=U.bk;
  if(sel!=null) s+=`<rect class="sel" x="${cx(sel)-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" rx="6"/>`;
  if(bar){ V.forEach((v,i)=>{ if(v==null||v<=0) return; const x0=cx(i)-bw/2; s+=`<path class="bar${sel!=null&&sel!==i?' dim':''}${U.p==='day'&&i===C.length-1?' now':''}" d="${rtop(x0,y(v),bw,y(lo)-y(v))}"/>`; });
    if(PC) PC.forEach((v,i)=>{ if(!v) return; s+=`<path class="bar pace" d="${rtop(cx(i)-bw/2,y(v),bw,y(lo)-y(v))}"/>`; });
    TV.forEach((t,i)=>{ if(t==null||!V[i]&&V[i]!==0) return; s+=`<line class="tk" x1="${cx(i)-bw/2-3}" x2="${cx(i)+bw/2+3}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke-dasharray="3 2"/>`; }); }
  else { const pts=V.map((v,i)=>v==null?null:[cx(i),y(v)]); const seg=[]; let cur=[]; pts.forEach(p=>{ if(p) cur.push(p); else if(cur.length){ seg.push(cur); cur=[]; } }); if(cur.length) seg.push(cur);
    seg.forEach(L=>{ if(L.length>1) s+=`<path class="ar" d="M${L[0][0]},${y(lo)}L${L.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L')}L${L[L.length-1][0]},${y(lo)}Z"/><polyline class="ln" points="${L.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`; });
    if(tb!=null) s+=`<line class="tl" x1="${pl}" x2="${w-pr+8}" y1="${y(tb).toFixed(1)}" y2="${y(tb).toFixed(1)}"/><text class="tlab" x="${w-pr+12}" y="${(y(tb)+3.5).toFixed(1)}">Target ${fmt(k.u,tb)}</text>`; }
  if(PV){ const pp=PV.map((v,i)=>v==null?null:[cx(i),y(v)]).filter(Boolean); if(pp.length>1) s+=`<polyline class="pv" points="${pp.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}"/>`; }
  if(!bar) V.forEach((v,i)=>{ if(v==null) return; if(C.length<=14||i===C.length-1||i===sel) s+=`<circle class="dt${sel!=null&&sel!==i?' dim':''}" cx="${cx(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4"/>`; });
  if(bar&&tb!=null) s+=`<text class="tlab" x="${w-pr+12}" y="${pt+10}">Target</text><text class="tlab" x="${w-pr+12}" y="${pt+24}" style="font-weight:400">${fmt(k.u,tb)}/workday</text>`;
  C.forEach((x,i)=>{ if(i%every===(per(U.p).g==='yr'?0:(C.length-1)%every)) s+=`<text class="ax" x="${cx(i).toFixed(1)}" y="${H-6}" text-anchor="middle"${U.p==='day'&&i===C.length-1?' style="fill:var(--tg-ink);font-weight:600"':x.fut?' style="opacity:.45"':''}>${U.p==='day'&&i===C.length-1?'Today':x.l}</text>`;
    if(x.fut&&!(PV&&PV[i]!=null)) return; const tip=[x.t.replace(/^./,c=>c.toUpperCase()),(U.p==='day'?'This day':'This period')+'::'+(x.fut?'not yet':fmt(k.u,V[i],1))]; if(PV) tip.push('The period before::'+fmt(k.u,PV[i],1)+(B.prev[i]?' · '+B.prev[i].t:'')); if(TV[i]!=null) tip.push('Target::'+fmt(k.u,TV[i],1)); if(!x.fut) tip.push('~Click to see the ROs behind it');
    s+=`<rect class="hit" x="${(cx(i)-st/2).toFixed(1)}" y="${pt}" width="${st.toFixed(1)}" height="${H-pt-pb}" data-a="${x.fut?'noop':'bk'}" data-i="${i}" data-tip="${esc(tip.join('|'))}"/>`; });
  return s+'</svg>'; }
function brCard(k){ const keys=k.br; if(!keys.length) return `<div class="mg-card"><div class="mg-ch"><b>Breakdown</b></div><div class="mg-cb"><div class="mg-none" style="padding:4px 0">This one is the whole shop — no breakdown.</div></div></div>`;
  const key=U.brk[k.id]&&keys.includes(U.brk[k.id])?U.brk[k.id]:keys[0], [a,b]=W(), X=ctx(a,b), tb=tgtBase(k);
  const rows=brVals(key,X).map(([v,n])=>{ const F={k:key,v}, x=val(k,a,b,F), XX=ctx(a,b,F); const cnt=k.dr==='tech'?Math.round(XX.att)+' h on the clock':k.dr==='ops'?XX.ops.length+' ops':k.dr==='OP'?XX.OP.length+' opened':k.snap?'':XX.CL.length+' ROs'; const pgv=key==='tech'&&U.pg[v]&&U.pg[v][k.id]!=null?U.pg[v][k.id]:null; const t=pgv!=null?(k.tw!=null?pgv*XX.wd:pgv):tb==null?null:k.tw!=null?tb*XX.wd*(key==='tech'?1/6:1):tb; return {v,n,x,cnt,t:k.tw!=null&&key!=='tech'?null:t}; }).filter(r=>r.x!=null&&(r.x!==0||k.d!==0||isSum(k)));
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
function drillCard(k,bk){ const F=U.bf, [a,b]=bk?[bk.a,bk.b]:W(), X=ctx(a,b,F); const scope=bk?bk.t:per(U.p).n.toLowerCase();
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
  return `<section class="tg-list"><div class="tg-lh">Team<span class="n">${STAFF0.length}</span><span class="sp" style="flex:1"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Add an employee — name, role and PIN; the role fills in the pages they can open.">${ic('plus',13)}Add</button></div><div class="tg-scroll">${D.map(d=>{ const X=STAFF0.filter(([,r])=>DEPT[r]===d); return `<div class="tg-grp">${d}<span>${X.length}</span></div>`+X.map(item).join(''); }).join('')}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('1')}–${kbd('6')}views</span><span class="sp"></span><span>${per(U.p).n}</span></div></section>`; }
function vTeam(){ const k=U.person, r=pRole(k), tech=r==='Technician', FF=tech?{k:'tech',v:k}:null, KS=(ROLEK[r]||ROLEK.Manager).map(id=>KM[id]);
  return `<div class="mg-pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic('user',13)}${DEPT[r]}</span><span>${k==='RH'?'This is you':'Last signed in today, '+(7+STAFF0.findIndex(x=>x[0]===k)%3)+':'+p2(10+STAFF0.findIndex(x=>x[0]===k)*4%50)}</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Parsec now shows what ${F(k)} sees — switch back to Admin any time from Settings.">${ic('eye',14)}See Parsec as ${F(k)}</button></div>
    <div class="mg-ph"><span class="av">${k}</span><span class="c"><h2 style="margin:0;font:500 24px/30px var(--tg-serif);letter-spacing:-.01em">${PPL[k]}</h2><small>${r} · ${(U.pages[k]?Object.keys(U.pages[k]).filter(p=>U.pages[k][p]).length:0)} pages · signs in with a PIN</small></span></div></div>
   <div class="mg-pad"><div class="mg-sec" style="margin:0 2px">${tech?'Their numbers':'The numbers they move'}<span>${per(U.p).n} · ${tech?'only '+F(k)+'’s work':'the whole shop'}</span></div><div class="mg-sc">${KS.map(kk=>{ const o=kvG(kk,FF,tech?k:null); return `<button class="mg-tile" data-a="psel" data-k="${kk.id}" data-t="${tech?k:''}" data-tip="${esc(kk.n)}|${esc(kk.how)}|~Opens in KPIs${tech?', filtered to '+F(k):''}"><span class="l"><span>${kk.n}</span>${kk.snap?'<span class="now">right now</span>':''}</span><span class="v">${fmt(kk.u,o.v)}</span>${sparkSvg(kk,76,28,FF)}<span class="r"><span class="mg-d ${o.dl.cl}">${o.dl.s}</span><span class="sp"></span>${o.t!=null?(o.ok?`<span class="mg-tgt ok">${ic('check',11)}target ${fmt(kk.u,o.t)}</span>`:`<span class="mg-tgt off">${ic('flag',11)}target ${fmt(kk.u,o.t)}</span>`):''}</span></button>`; }).join('')}</div>
    ${tech?goalsCard(k):''}<div class="mg-card"><div class="mg-ch"><b>Pages they can open</b><small>the ${r.toLowerCase()} role fills these in — change any of them</small></div><div class="mg-cb"><div class="mg-pages">${NAV.map(([p,n])=>{ if(p==='manager'){ const mg=r==='Manager'; return `<button class="mg-pg lk${mg?' on':''}" data-a="lockpg" data-k="${k}" data-tip="Manager only|${mg?'Always on for the manager.':'Only the manager role opens this page — it can’t be switched on for a '+r.toLowerCase()+'.'}">${ic('manager',15)}${n}<span class="ck">${ic('lock',11)}</span></button>`; } const on=U.pages[k]&&U.pages[k][p]; return `<button class="mg-pg${on?' on':''}" data-a="page" data-k="${k}" data-v="${p}">${ic(NAVIC[p]||p,15)}${n}<span class="ck">${on?ic('check',11):''}</span></button>`; }).join('')}</div></div></div>
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
  if(p.type==='per') return `<div class="tg-pop menu mg-pop-w">${PERS.map(x=>{ const o=per(x); return `${x==='wk'||x==='mo'||x==='qt'||x==='yr'?'<div class="mg-psep"></div>':''}<button class="tg-mi${U.p===x?' on':''}" data-a="pset" data-v="${x}">${PKEY[x]?kbd(PKEY[x]):'<span class="tg-kbd" style="visibility:hidden">·</span>'}${o.n}<span class="meta">${o.s}</span></button>`; }).join('')}<div class="tg-pft">${ic('info',12)}Calendar periods — the week starts Monday. “This” runs to today and compares with the same days before.</div></div>`;
  if(p.type==='chk') return chkPop();
  if(p.type==='tgt'){ const k=KM[p.k], [a,b]=W(), X=ctx(a,b), o=kv(k), base=tgtBase(k), pw_=k.tw!=null;
    const qs=k.u==='pct'?(base!=null&&base<=10?[2,3,4,5]:[base-10,base-5,base,base+5].filter(v=>v>0&&v<=100).map(Math.round)):pw_?[base*.9,base,base*1.1].map(v=>k.u==='usd'?Math.round(v/500)*500:Math.round(v*2)/2):null;
    return `<div class="tg-pop xf mg-pop-w">${hd('Target',esc(k.n))}<div class="mg-ctx">${k.d>0?'Higher is better':k.d<0?'Lower is better':'Neither way is better'}. ${per(U.p).n}: <b>${fmt(k.u,o.v,1)}</b>.${pw_?` A total, so the target is <b>per workday</b> — ${per(U.p).n.toLowerCase()} has ${h1(X.wd)} workdays so far (Saturday counts half).`:''}</div>
      <label class="mg-f"><span>${pw_?'Per workday':'Target'}</span><span class="row"><input id="mg-tv" value="${esc(p.v!=null?p.v:base!=null?(k.u==='usd'?Math.round(base):k.u==='pct'?Math.round(base):h1(base)):'')}" inputmode="decimal" placeholder="${k.u==='pct'?'85':'—'}"><span class="u">${k.u==='pct'?'%':k.u==='usd'?'dollars':k.u==='d'?'days':k.u==='n'?'ROs':'hours'}</span></span></label>
      ${qs?`<div class="mg-qs">${qs.map(v=>`<button class="tg-chip" data-a="tq" data-v="${v}" style="height:24px">${fmt(k.u,v)}</button>`).join('')}</div>`:''}
      <label class="mg-ck"><input type="checkbox" data-a="alt" ${U.al[k.id]?'checked':''}>Tell me when it’s off target three workdays in a row</label>
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
  else if(a==='pop'){ if(p&&p.type===t.dataset.p){ U.pop=null; render(); return; } const ex={}; if(t.dataset.k) ex.k=t.dataset.k; if(t.dataset.i!=null) ex.i=t.dataset.i; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='pset'){ U.p=t.dataset.v; U.bk=null; U.pop=null; render(); }
  else if(a==='pin'){ const id=t.dataset.k; if(U.pins.includes(id)){ snap(); U.pins[U.pins.indexOf(id)]=null; toast(`${KM[id].n} is off the Overview — its spot is open.`); } else { const i=U.pins.indexOf(null); if(i<0){ toast('The Overview holds 12 tiles — take one off in Edit tiles first.',false); render(); return; } snap(); U.pins[i]=id; toast(`${KM[id].n} pinned to the Overview.`); } render(); }
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
  else if(a==='tx'){ e.stopPropagation(); const id=t.dataset.k; snap(); U.pins[U.pins.indexOf(id)]=null; toast(`${KM[id].n} is off the Overview — pick one for its spot.`); render(); }
  else if(a==='tdef'){ snap(); U.pins=PINS0.slice(); toast('Back to the usual 12.'); render(); }
  else if(a==='lockpg'){ toast(t.dataset.k==='RH'||pRole(t.dataset.k)==='Manager'?'The Manager page is always on for the manager.':'Only the manager role opens the Manager page.',false); render(); }
  else if(a==='addk'){ const id=t.dataset.k; let i=p&&p.i!=null?+p.i:U.pins.indexOf(null); if(i<0||U.pins[i]){ i=U.pins.indexOf(null); } if(i<0){ U.pop=null; toast('The Overview holds 12 tiles — take one off first.',false); render(); return; } snap(); U.pins[i]=id; U.pop=null; toast(`${KM[id].n} added to the Overview.`); render(); }
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
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],.tk-note')){ U.pop=null; render(); } },true);
function move(d){ if(U.view==='fleet'){ const L=fleetRows().map(x=>x.c), i=L.indexOf(U.fleet); U.fleet=L[Math.max(0,Math.min(L.length-1,i+d))]; U.kb=true; render(); return; } if(U.view==='team'){ const L=STAFF0.map(x=>x[0]); const i=L.indexOf(U.person); U.person=L[Math.max(0,Math.min(L.length-1,i+d))]; U.kb=true; render(); return; }
  const L=Object.keys(CAT).flatMap(c=>kRows().filter(k=>k.c===c)).map(k=>k.id); if(!L.length) return; U.kb=true; U.view='kpi'; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.bf=null; U.bk=null; U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea,select'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'){ if(e.target.id==='mg-pq'){ $('.tg-pop .mg-srr')?.click(); return stop(); } $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(p.type==='per'&&!inF){ const i='dwmqy'.indexOf(k.toLowerCase()); if(i>=0){ U.p=['day','wk','mo','qt','yr'][i]; U.pop=null; U.bk=null; render(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='/'){ const b=$('[data-a="pop"][data-p="find"]'); if(b) openPop('find',{},b); return stop(); }
  if(k==='p'&&U.view==='kpi'){ $('[data-a="pin"]')?.click(); return stop(); }
  if(k==='t'&&U.view==='kpi'){ const b=$('[data-a="pop"][data-p="tgt"]'); if(b) openPop('tgt',{k:U.sel},b); return stop(); }
  const pi='dwmqy'.indexOf(k); if(pi>=0){ U.p=['day','wk','mo','qt','yr'][pi]; U.bk=null; render(); return stop(); }
  if(k>='1'&&k<='6'){ U.view=['ov','kpi','fleet','flow','team','act'][+k-1]; U.pop=null; render(); return stop(); }
});
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W_=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); } else { x=W_-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W_-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #mg-pq')||$('.tg-pop #mg-tv'); if(f){ U.pop._f=1; f.focus(); if(f.select) f.select(); } }
  note();
}
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  d1:()=>{reset();render();},
  d2:()=>{reset();goKpi('sales');},
  d3:()=>{reset();render();},
  d4:()=>{reset();render();scrollTo_('.mg-leak');},
  d5:()=>{reset();U.view='fleet';U.fleet='Piedmont Aggregates';render();},
  d6:()=>{reset();render();scrollTo_('.mg-cap');},
  d7:()=>{reset();U.view='team';U.person='AW';render();scrollTo_('.mg-goals');},
  d8:()=>{reset();render();openPop('chk',{},$('[data-p="chk"]'));render();},
  d9:()=>{reset();U.rep=addM(TODAY,-1);render();},
  d10:()=>{reset();goKpi('gp');},
  try:()=>{reset();render();},
  ov:()=>{reset();render();},
  flow:()=>{reset();U.view='flow';render();},
  team:()=>{reset();U.view='team';U.person='AW';render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
/* ======================= the ten ideas ======================= */
/* each fleet gets its own trucks, so a scorecard can list them */
(()=>{ const r=rng('units'), M={}; CUST.forEach((c,i)=>{ M[c]=i<6?16:i<12?8:4; }); ROS.forEach(x=>{ const u=101+Math.floor(r()*M[x.cust]); x.unit=u; x.truck=TRUCK[(u*7+CUST.indexOf(x.cust))%8]; }); })();
/* 4 · money left on the table, as a KPI too */
const leakR=r=>sum(r.ops,over)*RATE+r.dec+r.wo;
K.splice(K.findIndex(k=>k.id==='dec'),0,{id:'leak',c:'mon',n:'Money left on the table',u:'usd',d:-1,how:'Hours over quote and unapplied hours at $210, plus declined work and write-offs.',src:['Time Log','Triage','Warranty'],br:['tech','pay'],dr:'CL',mh:'Left',col:r=>[usd0(leakR(r)),r.dec?'declined '+usd0(r.dec):''],tone:()=>'warn',sk:r=>-leakR(r),f:X=>sum(X.ops,over)*RATE+Math.max(0,X.att-X.bur)*RATE+sum(X.OP,r=>r.dec)+sum(X.CL,r=>r.wo)});
/* 10 · the KPIs two more fields would open up */
const PCOST=r=>.58+((+r.no*37)%13)/100, PAYR=36, OVH=260000;
const gpR=r=>r.lab-sum(r.ops,o=>o.b)*PAYR+r.prt*(1-PCOST(r));
CAT.gp=['Gross profit','lock'];
K.push(
 {id:'gp',c:'gp',lock:1,n:'Gross profit',u:'usd',d:1,tw:9500,how:'Sales minus what they cost — tech pay on the hours clocked, and what the parts cost.',src:['ROs','Parts','Team'],needs:['cost','pay'],br:['pay','tech','cust'],dr:'CL',mh:'Gross profit',col:r=>[usd0(gpR(r)),pc(gpR(r)/r.sales*100)+' of sales'],sk:r=>gpR(r)/r.sales,f:X=>sum(X.CL,gpR)},
 {id:'pgm',c:'gp',lock:1,n:'Parts margin',u:'pct',d:1,t:36,how:'Parts sales minus parts cost, ÷ parts sales.',src:['Parts'],needs:['cost'],br:['pay','cust'],dr:'CL',flt:r=>r.prt>0,mh:'Margin',col:r=>[pc((1-PCOST(r))*100),usd0(r.prt*(1-PCOST(r)))],sk:r=>-PCOST(r),f:X=>{ const p=sum(X.CL,r=>r.prt); return p?sum(X.CL,r=>r.prt*(1-PCOST(r)))/p*100:null; }},
 {id:'lgm',c:'gp',lock:1,n:'Labor margin',u:'pct',d:1,t:80,how:'Labor sales minus tech pay on the hours clocked, ÷ labor sales.',src:['Time Log','Team'],needs:['pay'],br:['tech','pay'],dr:'ops',mh:'Margin',col:R=>[pc((R.q*RATE-R.b*PAYR)/(R.q*RATE)*100),`${h1(R.b)} h at $${PAYR}`],sk:R=>(R.q*RATE-R.b*PAYR)/(R.q*RATE),f:X=>{ const l=sum(X.ops,o=>o.q)*RATE; return l?(l-sum(X.ops,o=>o.b)*PAYR)/l*100:null; }},
 {id:'gpr',c:'gp',lock:1,n:'Gross profit per RO',u:'usd',d:1,t:1100,how:'Gross profit ÷ ROs closed.',src:['ROs','Parts','Team'],needs:['cost','pay'],br:['pay','tech','cust'],dr:'CL',mh:'Gross profit',col:r=>[usd0(gpR(r)),''],sk:r=>gpR(r),f:X=>X.CL.length?sum(X.CL,gpR)/X.CL.length:null},
 {id:'abs',c:'gp',lock:1,n:'Service absorption',u:'pct',d:1,t:100,how:'Service and parts gross profit ÷ the dealership’s overhead — at 100% service pays the bills.',src:['ROs','Parts','Team','Settings'],needs:['cost','pay','ovh'],br:[],dr:'none',f:X=>X.wd?sum(X.CL,gpR)/(OVH/24*X.wd)*100:null});
K.forEach(k=>{ KM[k.id]=k; });
const fmtU=(k,v)=>fmt(k.u,v)+(k.u==='n'?' ROs':'');
const wdIn=(a,b)=>{ let n=0; for(let k=a;k<=b;k=addD(k,1)) n+=wf(k); return n; };
/* 1 · pace: where “this week / month / quarter / year” lands if it keeps going like this */
function fullEnd(o){ return o.g==='wk'?addD(o.a,5):o.g==='mo'?mEnd(o.a):o.g==='qt'?addD(addM(o.a,3),-1):o.g==='yr'?o.a.slice(0,4)+'-12-31':o.b; }
function pace(k,p,F){ const o=per(p); if(!o.fut||o.g==='day'||!isSum(k)||(k.lock&&!U.unl)) return null; const v=val(k,o.a,o.b,F); if(v==null) return null;
  const e=fullEnd(o), done=wdIn(o.a,o.b), tot=wdIn(o.a,e), left=tot-done, pd=done?v/done:0, proj=v+pd*left, tb=tgtBase(k), goal=tb!=null&&k.tw!=null?tb*tot:null;
  return {v,proj,goal,done,tot,left,pd,e,need:goal!=null&&left>0?(goal-v)/left:null}; }
function paceCard(){ const L=['sales','sold','cls'].map(id=>[KM[id],pace(KM[id],'mo')]).filter(x=>x[1]), mo=mName(TODAY);
  return `<div class="mg-pace">${L.map(([k,P_],i)=>{ const short=P_.goal!=null?P_.goal-P_.proj:0, ok=short<=0, mx=Math.max(P_.goal||0,P_.proj)*1.05;
    return `<button class="mg-pc${i===0?' main':''}" data-a="pacego" data-k="${k.id}" data-tip="${esc(k.n)} · ${mo}|So far::${fmtU(k,P_.v)}|On pace for::${fmtU(k,P_.proj)}|Goal::${P_.goal!=null?fmtU(k,P_.goal):'—'}|~${P_.done} of ${P_.tot} workdays done · ${fmtU(k,P_.pd)} a workday so far"><span class="l">${k.n} · ${mo}</span><span class="t">On pace for <b>${fmtU(k,P_.proj)}</b></span><span class="bar"><i class="done" style="width:${(P_.v/mx*100).toFixed(1)}%"></i><i class="proj" style="left:${(P_.v/mx*100).toFixed(1)}%;width:${((P_.proj-P_.v)/mx*100).toFixed(1)}%"></i>${P_.goal!=null?`<em style="left:${(P_.goal/mx*100).toFixed(1)}%"></em>`:''}</span><span class="s ${ok?'ok':'off'}">${ok?ic('check',12)+'<b>'+fmtU(k,-short)+'</b> over the '+fmtU(k,P_.goal)+' goal':ic('flag',12)+'<b>'+fmtU(k,short)+'</b> short of '+fmtU(k,P_.goal)}${P_.need!=null&&!ok?' · needs '+fmtU(k,P_.need)+' a workday':' · '+P_.left+' workdays left'}</span></button>`; }).join('')}</div>`; }
function paceLine(k){ const P_=pace(k,U.p,U.bf); if(!P_) return ''; const ok=P_.goal==null||P_.proj>=P_.goal;
  return `<span class="mg-pace-l">${ic('spark',12)}On pace for <b>${fmtU(k,P_.proj)}</b> by ${fd(P_.e)}${P_.goal!=null?` · goal ${fmtU(k,P_.goal)}${ok?'':' · needs '+fmtU(k,P_.need)+' a workday'}`:''}</span>`; }
function paceVals(k,C){ const P_=pace(k,U.p,U.bf); if(!P_) return null; return C.map(x=>x&&x.fut?P_.pd*wdIn(x.a,x.b):null); }
/* 2 · why it moved */
const DIMN={tech:'tech',pay:'pay',type:'job type',cust:'customer'};
function sizeOf(k,X){ return k.dr==='tech'?X.att:k.dr==='ops'?X.ops.length:k.dr==='OP'?X.OP.length:X.CL.length; }
function drivers(k,a,b,pa,pb){ const N=sizeOf(k,ctx(a,b)), sm=isSum(k)||k.snap, L=[];
  (k.br||[]).forEach(d=>brVals(d,ctx(a,b)).forEach(([v,n])=>{ const F={k:d,v}, x=val(k,a,b,F), px=val(k,pa,pb,F); if(x==null||px==null) return; const w=sm?1:N?sizeOf(k,ctx(a,b,F))/N:0; L.push({d,v,n,x,px,imp:(x-px)*w}); }));
  return L.filter(r=>Math.abs(r.imp)>1e-9).sort((p,q)=>Math.abs(q.imp)-Math.abs(p.imp)).slice(0,4); }
function impTxt(k,v){ const s=v>0?'+':'−', a=Math.abs(v); return k.u==='pct'?s+(a<1?a.toFixed(1):Math.round(a))+' pts':k.u==='usd'?s+fmt('usd',a):k.u==='n'?s+Math.round(a):s+h1(a)+(k.u==='d'?' d':' h'); }
function whyCard(k){ if(k.lock&&!U.unl||U.bf) return ''; const o=kv(k); if(o.v==null||o.pv==null||!o.dl.d) return ''; const [a,b]=W(), [pa,pb]=PW(), D=drivers(k,a,b,pa,pb); if(!D.length) return '';
  const mx=Math.max(...D.map(r=>Math.abs(r.imp)));
  return `<div class="mg-card mg-why"><div class="mg-ch">${ic('spark',14)}<b>Why it moved</b><small>${k.n} is ${o.dl.up?'up':'down'} ${impTxt(k,o.v-o.pv).slice(1)} ${per(U.p).cmp} — the biggest moves</small></div><div class="mg-cb" style="padding-top:6px">${D.map(r=>{ const good=r.imp*k.d>0, cl=!k.d?'flat':good?'good':'bad';
    return `<button class="mg-wr" data-a="bf" data-f="${r.d}" data-v="${esc(r.v)}" data-tip="${esc(r.n)}|Before::${fmt(k.u,r.px,1)}|Now::${fmt(k.u,r.x,1)}|~Click to see only ${esc(r.n)}"><span class="n">${r.d==='tech'?`<span class="tg-av">${r.v}</span>`:''}<b>${esc(r.n)}</b><small>${DIMN[r.d]}</small></span><span class="ft">${fmt(k.u,r.px)} → ${fmt(k.u,r.x)}</span><span class="dv"><span class="ax"></span><i class="${cl}" style="${r.imp<0?'right:50%':'left:50%'};width:${(Math.abs(r.imp)/mx*50).toFixed(1)}%"></i></span><span class="m ${k.d?cl:''}">${impTxt(k,r.imp)}</span></button>`; }).join('')}
    <div class="mg-more">${ic('info',12)}<span>${isSum(k)||k.snap?'Each row is that slice’s own change.':'Each row is weighted by its share of the work, so the rows roughly add up.'} Click one and the page follows it.</span></div></div></div>`; }
/* 3 · off-target alerts — three workdays in a row lands it in Needs you */
function streak(k){ const tb=tgtBase(k); if(tb==null) return 0; let n=0, d=TODAY; for(let g=0;g<40;g++){ if(wf(d)){ const v=val(k,d,d); if(v!=null){ const t=k.tw!=null?tb*wf(d):tb; if(k.d>=0?v<t:v>t) n++; else break; } } d=addD(d,-1); } return n; }
function alerts(){ return Object.keys(U.al).filter(id=>U.al[id]&&!U.mute[id]&&KM[id]).map(id=>{ const k=KM[id], n=streak(k); return n>=3?{id:'al-'+id,k,n,v:val(k,TODAY,TODAY)}:null; }).filter(Boolean); }
const NUMW=['','one','two','three','four','five','six','seven','eight','nine','ten'];
function alertNeeds(){ return alerts().map(a=>{ const t=tgtBase(a.k), tt=a.k.tw!=null?t:t; return {id:a.id,al:a.k.id,ic:'bell',h:`Off target ${a.n} workdays`,p:`<b>${a.k.n}</b> has been ${a.k.d>=0?'under':'over'} ${fmt(a.k.u,tt)} ${NUMW[a.n]||a.n} workdays in a row — ${fmt(a.k.u,a.v)} today.`,a:[['See it'],['Mute a week']]}; }); }
/* 4 · money left on the table */
function leakCard(){ const [a,b]=W(), X=ctx(a,b), ov=sum(X.ops,over), un=Math.max(0,X.att-X.bur), od=ROS.filter(r=>r.cr&&r.close<=addD(b,-30)&&r.crAt>b);
  const R_=[['lost','Hours over quote',ov*RATE,h1(ov)+' h × $210'],['unap','Unapplied hours',un*RATE,Math.round(un)+' h × $210 — on the clock, nothing sold'],['dec','Declined work',sum(X.OP,r=>r.dec),X.OP.filter(r=>r.dec).length+' estimates said no'],['wo','Write-offs and goodwill',sum(X.CL,r=>r.wo),X.CL.filter(r=>r.wo).length+' ROs']];
  const tot=sum(R_,x=>x[2]), mx=Math.max(1,...R_.map(x=>x[2]));
  return `<div class="mg-card mg-leak"><div class="mg-ch"><b>Money left on the table</b><small>${per(U.p).n.toLowerCase()}</small><span class="sp"></span><b class="tot">${usd0(tot)}</b></div><div class="mg-cb" style="padding-top:6px">${R_.map(x=>`<button class="mg-lr" data-a="sel" data-k="${x[0]}" data-go="1"><span class="n"><b>${x[1]}</b><small>${x[3]}</small></span><span class="b"><i style="width:${(x[2]/mx*100).toFixed(1)}%"></i></span><span class="m">${usd0(x[2])}</span></button>`).join('')}
    <div class="mg-more">${ic('info',12)}<span>It’s a KPI too — with its trend and the ROs behind it.</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="sel" data-k="leak" data-go="1">Open it</button></div></div></div>`; }
/* 6 · capacity — the work in the shop plus booked appointments, against the hours the techs have */
const OFF={'2026-10-26':['PS'],'2026-10-30':['KT']}, APPT=[16,11,21,9,14,6,12,5];
function capRows(){ const D=[]; let k=TODAY; while(D.length<8){ k=addD(k,1); if(wf(k)) D.push(k); } let carry=sum(openAt(TODAY),r=>left(r,TODAY));
  return D.map((d,i)=>{ const f=wf(d), off=OFF[d]||[], techs=f<1?3:TECHS.length-off.length, cap=techs*(f<1?4.5:8.5)*.85, ap=APPT[i], fc=Math.min(cap,carry), fa=Math.min(cap-fc,ap); carry=carry-fc+(ap-fa); return {d,cap,fc,fa,off,techs,free:Math.max(0,cap-fc-fa)}; }); }
function capCard(){ const rows=capRows(); let thru=-1; for(let i=0;i<rows.length;i++){ if(rows[i].free<=rows[i].cap*.03) thru=i; else break; } const first=rows[thru+1], mx=Math.max(...rows.map(r=>r.cap));
  return `<div class="mg-card mg-cap"><div class="mg-ch"><b>Capacity</b><small>the next 8 workdays</small><span class="sp"></span><span class="mg-leg"><span><i></i>In the shop</span><span><i class="ap"></i>Appointments</span><span><i class="fr"></i>Free</span></span></div><div class="mg-cb"><p class="mg-capt">${thru>=0?`Booked through <b>${DWL[dOf(rows[thru].d).getDay()]} ${fd(rows[thru].d)}</b>`:'Room tomorrow'}${first?` — first open time ${DWL[dOf(first.d).getDay()]}, <b>${Math.round(first.free)} h</b> free.`:'.'}</p>
    <div class="mg-capg">${rows.map(r=>`<div class="c" data-tip="${DWL[dOf(r.d).getDay()]} ${fd(r.d)}|In the shop::${h1(r.fc)} h|Appointments::${h1(r.fa)} h|Free::${h1(r.free)} h|~${r.techs} techs at 85%${r.off.length?' · '+r.off.map(F).join(', ')+' off':''}"><span class="col" style="height:${Math.round(r.cap/mx*118)}px"><i class="w" style="height:${(r.fc/r.cap*100).toFixed(1)}%"></i><i class="a" style="height:${(r.fa/r.cap*100).toFixed(1)}%"></i></span><b>${DW[dOf(r.d).getDay()].slice(0,2)} ${dOf(r.d).getDate()}</b><small>${r.off.length?r.off.map(F).join(', ')+' off':r.free>=1?Math.round(r.free)+' h free':'full'}</small></div>`).join('')}</div></div></div>`; }
/* 7 · goals per person */
const PG0=()=>Object.fromEntries(TECHS.map(t=>[t,t==='AW'?{eff:92,prod:85,sold:6.5,cb:4}:{eff:100,prod:85,sold:7.5,cb:3}]));
function kvG(k,F,who){ const o=kv(k,F); if(!who||!U.pg[who]||U.pg[who][k.id]==null) return o; const g=U.pg[who][k.id], t=k.tw!=null?g*o.X.wd:g; return Object.assign({},o,{t,ok:o.v==null?null:k.d>=0?o.v>=t:o.v<=t}); }
function goalsCard(k){ const g=U.pg[k], FF={k:'tech',v:k};
  return `<div class="mg-card mg-goals"><div class="mg-ch"><b>Goals for ${F(k)}</b><small>his own — the shop’s targets stay as they are</small><span class="sp"></span><span class="mg-pv">${ic('career',11)}${F(k)} sees them on Career</span></div><div class="mg-cb"><div class="mg-gh"><span>KPI</span><span>Shop target</span><span>${F(k)}’s goal</span><span class="m">${per(U.p).n}</span></div>${['eff','prod','sold','cb'].map(id=>{ const kk=KM[id], o=kvG(kk,FF,k), tb=tgtBase(kk);
    return `<div class="mg-gr"><b>${kk.n}</b><span class="st">${kk.tw!=null?h1(tb/TECHS.length)+' h a day':fmt(kk.u,tb)}</span><span class="in"><input data-pg="${k}" data-k="${id}" value="${g[id]}" inputmode="decimal"><small>${kk.u==='pct'?'%':'h a workday'}</small></span><span class="m ${o.ok===false?'off':o.ok?'ok':''}">${fmt(kk.u,o.v)}<small>${o.ok==null?'':o.ok?'meets it':(kk.d>=0?'under':'over')+' '+fmt(kk.u,o.t)}</small></span></div>`; }).join('')}
    <div class="mg-more">${ic('info',12)}<span>${k==='AW'?'Andre started in August — his goals step up to the shop’s by January.':'Goals start at the shop’s targets — change any of them.'}</span></div></div></div>`; }
/* 8 · data checks */
const CHK0=(()=>{ const C=ROS.filter(r=>r.close<=TODAY&&r.close>=addD(TODAY,-6)), O=openAt(TODAY); return [
 {id:'c1',ic:'clock',t:'Closed without a punch',d:'Hours sold and efficiency leave these out until someone adds the time.',ros:C.slice(0,3).map(r=>r.no),a:'Add the time',done:'Time added — the three ROs count again.'},
 {id:'c2',ic:'timelog',t:'Punches with no operation',d:'Time on the RO but not on a job — it counts as unapplied.',ros:O.slice(3,5).map(r=>r.no),a:'Pick the job',done:'Punches moved onto their jobs.'},
 {id:'c3',ic:'flag',t:'Operation with no quote',d:'No quote, no efficiency — every hour counts as over quote.',ros:[O[6].no],a:'Add the quote',done:'Quote added — 1.6 h.'},
 {id:'c4',ic:'play',t:'Clock still running',d:'Kevin Tran’s clock on '+O[8].no+' has run since 6:02 pm yesterday.',ros:[O[8].no],a:'Stop it at 6:02 pm',done:'Stopped at 6:02 pm yesterday — 14 h taken off.'}]; })();
const nChk=()=>CHK0.filter(c=>U.chk.includes(c.id)).reduce((s,c)=>s+c.ros.length,0);
function chkPop(){ const L=CHK0.filter(c=>U.chk.includes(c.id));
  return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>Data checks</b><span class="cu">${nChk()} things the numbers trip on</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>${L.length?L.map(c=>`<div class="mg-chk"><span class="gi">${ic(c.ic,14)}</span><b>${c.t}<span>${c.ros.length}</span></b><p>${c.d}</p><div class="r">${c.ros.map(n=>`<button class="tg-no" data-a="ro" data-no="${n}">${n}</button>`).join('')}<button class="btn btn-sm" data-a="chkfix" data-id="${c.id}">${c.a}</button></div></div>`).join(''):`<div class="mg-none">${ic('check',14)} All clean — every number counts every RO.</div>`}<div class="tg-pft">${ic('info',12)}Parsec checks every night and when an RO closes.</div></div>`; }
/* 9 · monthly report */
function repSheet(){ const a=U.rep, b=mEnd(a), pa=addM(a,-1), pb=mEnd(pa), X=ctx(a,b), mon=mName(a)+' '+a.slice(0,4);
  const months=[addM(TODAY,-1),addM(TODAY,-2),addM(TODAY,-3)];
  const tiles=PINS0.map(id=>{ const k=KM[id], v=val(k,a,b), pv=val(k,pa,pb), tb=tgtBase(k), t=tb==null?null:k.tw!=null?tb*X.wd:tb, dl=delta(k,v,pv), ok=t==null||v==null?null:k.d>=0?v>=t:v<=t;
    return `<div class="rt"><small>${k.n}</small><b>${fmt(k.u,v)}</b><span class="mg-d ${dl.cl}">${dl.s}</span>${t!=null?`<em class="${ok?'ok':'off'}">${ok?'✓ on target · ':''}target ${fmt(k.u,t)}</em>`:'<em>&nbsp;</em>'}</div>`; }).join('');
  const D=drivers(KM.sales,a,b,pa,pb), E=drivers(KM.eff,a,b,pa,pb).slice(0,2), ov=sum(X.ops,over)*RATE, un=Math.max(0,X.att-X.bur)*RATE, dec=sum(X.OP,r=>r.dec), wo=sum(X.CL,r=>r.wo), CB=X.CL.filter(r=>r.cb).slice(0,4);
  return `<div class="mg-rep"><div class="mg-repbar"><b>Monthly report</b><span class="tg-seg3">${months.map(m=>`<button class="${m===a?'on':''}" data-a="repm" data-v="${m}">${MNL[dOf(m).getMonth()]}</button>`).join('')}</span><span style="font-size:12.5px;color:var(--tg-ink3)">The pinned 12, what moved, money left on the table, comebacks, and your notes — one page.</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Sent to the printer — one page.">${ic('print',14)}Print</button><button class="btn btn-sm btn-primary" data-a="toast" data-t="Saved — “Service report ${mon}.pdf”.">${ic('download',14)}Save as PDF</button><button class="btn btn-sm ib" data-a="repx" title="Close">${ic('x',14)}</button></div>
   <div class="mg-repsc"><div class="mg-sheet"><div class="sh-h"><span class="lg">${LOGO}</span><div><h3>Service report · ${mon}</h3><small>${X.CL.length} ROs closed · ${+X.wd.toFixed(1)} workdays · compared with ${mName(pa)}</small></div><small class="pp">Prepared by Ray Holloway<br>${fd(TODAY)}, ${TODAY.slice(0,4)}</small></div>
    <h4>The pinned 12</h4><div class="sh-g">${tiles}</div>
    <div class="sh-2"><div><h4>What moved sales</h4>${D.map(r=>`<div class="mv"><span>${esc(r.n)} <small style="color:#8F897C">· ${DIMN[r.d]}</small></span><b class="${r.imp>0?'good':'bad'}">${impTxt(KM.sales,r.imp)}</b></div>`).join('')}<h4>What moved efficiency</h4>${E.map(r=>`<div class="mv"><span>${esc(r.n)} · ${fmt('pct',r.px)} → ${fmt('pct',r.x)}</span><b class="${r.imp>0?'good':'bad'}">${impTxt(KM.eff,r.imp)}</b></div>`).join('')}</div>
     <div><h4>Money left on the table</h4><p class="big">${usd0(ov+un+dec+wo)}</p><div class="ln"><span>Hours over quote</span><b>${usd0(ov)}</b></div><div class="ln"><span>Unapplied hours</span><b>${usd0(un)}</b></div><div class="ln"><span>Declined work</span><b>${usd0(dec)}</b></div><div class="ln"><span>Write-offs and goodwill</span><b>${usd0(wo)}</b></div>
      <h4>Comebacks · ${X.CL.filter(r=>r.cb).length}</h4>${CB.map(r=>`<div class="ln"><span>${r.no} ${esc(r.cust)}</span><b>${r.cb} d · ${F(r.tech)}</b></div>`).join('')||'<div class="ln"><span>None</span></div>'}</div></div>
    <h4>Notes</h4><textarea id="mg-rn" placeholder="What you want the GM to know — it prints with the report.">${esc(U.repn||'')}</textarea></div></div></div>`; }
/* 10 · the locked ones */
function lockPane(k){ const N={cost:['Part cost','On each part line in Parts — what you paid. Parts already keeps the price.','Parts'],pay:['Tech pay rate','Per tech in Team, dollars an hour. Only the manager sees it.','Team'],ovh:['Monthly overhead','One number in Settings — rent, salaries, utilities.','Settings']};
  const ex={cost:`<div class="mock-f"><span>Turbo actuator · 22972342</span><span class="pr">Price <b>$1,348.00</b></span><span class="cs">Cost <input placeholder="$" disabled></span></div>`,pay:`<div class="mock-f"><span>Andre Wilson · Technician</span><span class="cs">Pay <input placeholder="$ / h" disabled></span></div>`,ovh:`<div class="mock-f"><span>Overhead a month</span><span class="cs"><input placeholder="$" disabled></span></div>`};
  return `<div class="mg-pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic('lock',13)}Gross profit</span><span>Needs ${k.needs.length===1?'one field':k.needs.length+' fields'} Parsec doesn’t keep yet</span></div><h2>${k.n}</h2><div class="mg-how">${ic('info',13)}<span>${k.how}</span></div></div>
   <div class="mg-pad"><div class="mg-card mg-lockc"><div class="mg-ch">${ic('lock',14)}<b>What it needs</b><small>${k.needs.map(n=>N[n][0].toLowerCase()).join(' and ')}</small></div><div class="mg-cb"><div class="mg-needf">${k.needs.map(n=>`<div class="f"><span class="mg-pv">${N[n][2]}</span><b>${N[n][0]}</b><small>${N[n][1]}</small>${ex[n]}</div>`).join('')}</div>
     <p class="mg-unl">Part cost and tech pay open up four of these — gross profit, parts margin, labor margin and gross profit per RO. Add the monthly overhead and service absorption opens too.</p><div class="tg-acts" style="justify-content:flex-start"><button class="btn btn-sm btn-primary" data-a="unl">${ic('eye',14)}Show them with sample numbers</button><span class="hint">Nothing is saved — it’s to see what you’d get.</span></div></div></div></div></div>`; }
/* 5 · fleets */
function fleetRows(){ const [a,b]=W(); return CUST.map(c=>{ const F_={k:'cust',v:c}, X=ctx(a,b,F_); return {c,n:X.CL.length,s:sum(X.CL,r=>r.sales),open:openAt(TODAY,F_).length}; }).sort((p,q)=>q.s-p.s); }
function fList(){ const L=fleetRows();
  return `<section class="tg-list"><div class="tg-lh">Fleets<span class="n">${L.length}</span></div><div class="mg-lh2"><small style="font-size:12px;color:var(--tg-ink3)">${per(U.p).n} · most sales first</small></div><div class="tg-scroll">${L.map(x=>`<div class="tg-it mg-fi${x.c===U.fleet?' on':''}${x.c===U.fleet&&U.kb?' kb':''}" data-a="fleet" data-k="${esc(x.c)}"><span class="tg-gi">${ic('unit',15)}</span><span class="tg-t"><b>${esc(x.c)}</b></span><span class="tg-w">${x.n} RO${x.n===1?'':'s'}${x.open?' · '+x.open+' in the shop':''}</span><span class="m">${fmt('usd',x.s)}</span></div>`).join('')}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('1')}–${kbd('6')}views</span></div></section>`; }
function monthBars(V,B,w){ const H=150, pl=40, pb=20, pt=8, mx0=Math.max(1,...V.filter(v=>v!=null)), st0=Math.pow(10,Math.floor(Math.log10(mx0/2))), stp=[1,2,2.5,5,10].map(m=>m*st0).find(s=>mx0/s<=4)||st0*10, mx=Math.ceil(mx0/stp)*stp, st=(w-pl)/B.length, bw=Math.min(24,st*.6), y=v=>pt+(H-pt-pb)*(1-v/mx);
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`; [0,.5,1].forEach(f=>{ const v=mx*f; s+=`<line class="gl" x1="${pl}" x2="${w}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${pl-6}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end">${fmt('usd',v)}</text>`; });
  B.forEach((x,i)=>{ const cx=pl+st*i+st/2, v=V[i]; if(v) s+=`<path class="bar" d="${rtop(cx-bw/2,y(v),bw,y(0)-y(v))}"/>`; s+=`<text class="ax" x="${cx}" y="${H-5}" text-anchor="middle"${x.fut?' style="opacity:.45"':''}>${x.l}</text>${x.fut?'':`<rect class="hit" x="${cx-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" data-tip="${esc(x.t)}|Sales::${fmt('usd',v||0,1)}"/>`}`; });
  return s+'</svg>'; }
function vFleet(){ const c=U.fleet, FF={k:'cust',v:c}, KS=['sales','cls','aro','days','cb','apr'].map(id=>KM[id]), all=ROS.filter(r=>r.cust===c), units=[...new Set(all.map(r=>r.unit))].sort((p,q)=>p-q), yb=buckets('yr'), V=yb.map(x=>vb(KM.sales,x,FF)), O=openAt(TODAY,FF);
  const UT=units.map(u=>{ const L=all.filter(r=>r.unit===u&&r.close<=TODAY&&r.open>=addD(TODAY,-365)); return {u,truck:all.find(r=>r.unit===u).truck,n:L.length,down:sum(L,r=>dd(r.open,r.close)),last:L.length?L[L.length-1].close:null,op:all.find(r=>r.unit===u&&r.close>TODAY)}; }).sort((p,q)=>q.down-p.down);
  return `<div class="mg-pane"><div class="tg-top"><div class="r1"><span class="mg-cat">${ic('unit',13)}Fleet</span><span>${units.length} trucks · a customer since ${mName(all[0].open)} ${all[0].open.slice(0,4)}</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="The scorecard prints for the account review — the numbers, their trucks and what’s in the shop.">${ic('print',14)}Print for the account review</button></div><h2>${esc(c)}</h2></div>
   <div class="mg-pad"><div class="mg-sec" style="margin:0 2px">Scorecard<span>${per(U.p).n} · ${per(U.p).cmp}</span></div><div class="mg-tiles c3">${KS.map(kk=>{ const o=kv(kk,FF); return `<button class="mg-tile" data-a="fsel" data-k="${kk.id}" data-tip="${esc(kk.n)}|${esc(kk.how)}|~Opens in KPIs, only ${esc(c)}"><span class="l"><span>${kk.id==='days'?'Days down per RO':kk.n}</span></span><span class="v">${fmt(kk.u,o.v)}</span>${sparkSvg(kk,76,28,FF)}<span class="r"><span class="mg-d ${o.dl.cl}">${o.dl.s}</span><span class="sp"></span><span>shop ${fmt(kk.u,kv(kk).v)}</span></span></button>`; }).join('')}</div>
    <div class="mg-two"><div class="mg-card"><div class="mg-ch"><b>Sales by month</b><small>${TODAY.slice(0,4)}</small></div><div class="mg-cb">${monthBars(V,yb,470)}</div></div><div class="mg-card"><div class="mg-ch"><b>In the shop now</b><small>${O.length}</small></div><div class="mg-cb">${O.length?O.map(r=>`<div class="mg-hr" data-a="ro" data-no="${r.no}"><span class="c"><b><span class="tg-no">${r.no}</span> Unit ${r.unit}</b><small>${r.status} · ${r.truck}</small></span><span></span><span class="m">${dd(r.open,TODAY)?dd(r.open,TODAY)+' d':'today'}</span></div>`).join(''):'<div class="mg-none">Nothing in the shop right now.</div>'}</div></div></div>
    <div class="mg-card"><div class="mg-ch"><b>Their trucks</b><small>the last 12 months · most days down first</small></div><div class="mg-cb"><div class="mg-tbl fl"><div class="h"><span>Unit</span><span>Truck</span><span class="m">ROs</span><span class="m">Days down</span><span>Last in</span><span class="m">Now</span></div>${UT.slice(0,8).map(x=>`<div class="mg-tr"${x.op?` data-a="ro" data-no="${x.op.no}"`:''}><span class="u">${x.u}</span><span class="c"><b>${x.truck}</b></span><span class="m">${x.n}</span><span class="m${x.down>14?' warn':''}">${x.down} d</span><span class="dt">${x.last?md(x.last):'—'}</span><span class="m">${x.op?`<span class="mg-pv w">in the shop</span>`:''}</span></div>`).join('')}</div>${UT.length>8?`<div class="mg-more"><span>Showing 8 of ${UT.length}</span></div>`:''}</div></div></div></div>`; }

/* ---------- spotlight notes ---------- */
const NOTE={
 1:{r:'.mg-pace',t:'Month pace',p:'Where October lands if the rest of the month goes like the first three weeks — against the goal, and what it takes a workday to get there. Works for the week, quarter and year too.'},
 2:{r:'.mg-why',t:'Why it moved',p:'The biggest slices behind the change — by pay, tech, customer or job type. Click one and the number, the trend and the ROs follow it.'},
 3:{r:'.mg-nd.al',t:'Off-target alerts',p:'Three workdays in a row off target and it lands in Needs you. Turn it on per KPI from its target; mute it for a week when you know why.'},
 4:{r:'.mg-leak',t:'Money left on the table',p:'Hours over quote and unapplied hours at $210, declined work and write-offs — one number, each part clickable. It’s a KPI too, with its trend.'},
 5:{r:'.mg-tiles.c3',t:'Fleet scorecards',p:'One page per customer — sales, days down, comebacks, approvals, their trucks and what’s in the shop. Prints for the account review.'},
 6:{r:'.mg-cap',t:'Capacity',p:'The work in the shop plus booked appointments, against the hours the techs have — so “booked through Tuesday” is a number, not a guess.'},
 7:{r:'.mg-goals',t:'Goals per person',p:'Each tech can have their own goals — a new tech ramps up. They show on the tech’s Career page; the shop’s targets stay as they are.'},
 8:{r:'.tg-pop',at:'left',t:'Data checks',p:'Every number depends on the Time Log. ROs closed without a punch, punches with no job, missing quotes and clocks left running — fix them here.'},
 9:{r:'.mg-sheet .sh-h',al:'right',t:'Monthly report',p:'One page for the GM — the pinned 12, what moved, money left on the table, comebacks and your notes. Print it or save a PDF.'},
 10:{r:'.mg-lockc',t:'Two more fields',p:'Part cost and tech pay open up gross profit and margins; add overhead for service absorption. Try them with sample numbers.'}
};
function box(sels){ const L=[].concat(sels).map(s=>$(s)).filter(Boolean); if(!L.length) return null; const tk=$('.mg').getBoundingClientRect(); let l=1e9,t=1e9,r=-1e9,b=-1e9;
  L.forEach(e=>{ const x=e.getBoundingClientRect(); l=Math.min(l,x.left); t=Math.min(t,x.top); r=Math.max(r,x.right); b=Math.max(b,x.bottom); }); return {l:(l-tk.left)/scale,t:(t-tk.top)/scale,r:(r-tk.left)/scale,b:(b-tk.top)/scale}; }
function note(){ const nt=$('.tk-note'), rg=$('.tk-ring'), tk=$('.mg'); if(!nt||!rg||!tk) return; const N=U.note&&NOTE[U.note]; const R_=N?box(N.r):null;
  if(!R_){ nt.hidden=true; rg.hidden=true; return; }
  rg.hidden=false; Object.assign(rg.style,{left:(R_.l-5)+'px',top:(R_.t-5)+'px',width:(R_.r-R_.l+10)+'px',height:(R_.b-R_.t+10)+'px'});
  nt.innerHTML=`<div class="h"><span class="n">${U.note}</span><b>${esc(N.t)}</b><button data-a="notex" title="Close">${ic('x',13)}</button></div><p>${esc(N.p)}</p>`; nt.hidden=false;
  const A=R_, W_=tk.offsetWidth, H=tk.offsetHeight, nw=nt.offsetWidth, nh=nt.offsetHeight; let x, y;
  if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; } else { x=N.al==='right'?A.r-nw:A.l; y=A.b+12; if(y+nh>H-12) y=A.t-nh-16; }
  nt.style.left=Math.round(Math.max(12,Math.min(x,W_-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }
const scrollTo_=sel=>{ const el=$(sel), pn=$('.mg-full')||$('.mg-pane'); if(el&&pn){ pn.scrollTop=Math.max(0,el.getBoundingClientRect().top/scale-pn.getBoundingClientRect().top/scale+pn.scrollTop-90); note(); } };
/* ---------- the ideas’ own clicks ---------- */
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a;
  if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }
  else if(a==='pacego'){ U.p='mo'; goKpi(t.dataset.k); }
  else if(a==='aln'){ const id=t.dataset.id.replace('al-',''); if(+t.dataset.i===0){ goKpi(id); } else { snap(); U.mute[id]=1; toast(`${KM[id].n} is muted for a week — it’s still on the KPI page.`); render(); } }
  else if(a==='alt'){ const id=t.dataset.k||U.pop&&U.pop.k; snap(); U.al[id]=U.al[id]?0:1; toast(U.al[id]?`You’ll hear about ${KM[id].n} when it’s off target three workdays in a row.`:`No more alerts for ${KM[id].n}.`); render(); }
  else if(a==='chkfix'){ const c=CHK0.find(x=>x.id===t.dataset.id); snap(); U.chk=U.chk.filter(x=>x!==c.id); toast(c.done); render(); }
  else if(a==='unl'){ U.unl=true; toast('Sample numbers on — gross profit, margins and absorption. Nothing is saved.',false); render(); }
  else if(a==='unl0'){ U.unl=false; render(); }
  else if(a==='rep'){ U.rep=addM(TODAY,-1); U.pop=null; render(); }
  else if(a==='repm'){ U.rep=t.dataset.v; render(); }
  else if(a==='repx'){ U.rep=null; render(); }
  else if(a==='fleet'){ U.fleet=t.dataset.k; U.kb=false; render(); }
  else if(a==='fsel'){ goKpi(t.dataset.k,{k:'cust',v:U.fleet}); }
});
mock.addEventListener('change',e=>{ const t=e.target; if(t.dataset.pg){ const v=parseFloat(t.value); if(v>0&&U.pg[t.dataset.pg][t.dataset.k]!==v){ snap(); U.pg[t.dataset.pg][t.dataset.k]=v; toast(`${F(t.dataset.pg)}’s goal for ${KM[t.dataset.k].n}: ${v}${KM[t.dataset.k].u==='pct'?'%':' h a workday'} — he sees it on Career.`); render(); } } });
mock.addEventListener('input',e=>{ if(e.target.id==='mg-rn') U.repn=e.target.value; });

window.__mg={U:()=>U,render,reset,openPop,DEMO,K,KM,kv,val,ctx,ROS,goKpi};
reset(); render();
