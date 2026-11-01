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
