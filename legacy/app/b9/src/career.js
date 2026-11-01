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
/* Andre started in August 2026 — his work before that was Luis’s */
const TSTART={AW:'2026-08-03'}; ROS.forEach(r=>{ r.ops.forEach(o=>{ if(TSTART[o.tech]&&r.close<TSTART[o.tech]) o.tech='LM'; }); if(TSTART[r.tech]&&r.close<TSTART[r.tech]) r.tech='LM'; });
/* each tech has a job or two where the quote runs tight for them, and one where it’s easy */
const QB={MR:{rep:{11:1.34,5:1.24},pm:.9},DK:{rep:{2:1.26},war:{1:1.26}},AW:{rep:{2:1.3,8:1.22},war:{1:1.3}},KT:{rep:{6:1.22},war:{4:1.22}}};
ROS.forEach(r=>{ r.ops.forEach((o,i)=>{ const B_=QB[o.tech]; if(!B_) return; let f=1; if(o.t==='rep'||o.t==='war'){ const j=(+r.no*7+i*3)%(o.t==='rep'?12:5), M_=B_[o.t]; if(M_&&M_[j]) f=M_[j]; } else if(o.t==='pm'&&B_.pm) f=B_.pm; if(f!==1) o.b=Math.max(.2,Math.round(o.b*f*10)/10); }); r.b=Math.round(r.ops.reduce((s,o)=>s+o.b,0)*10)/10; });
/* who clocked what, day by day: an operation’s hours spread over the days the RO was open */
const TB={}, ATT={}, BAYU={}; TECHS.forEach(t=>{ TB[t]={}; ATT[t]={}; });
ROS.forEach(r=>{ const D=[]; for(let k=r.open;k<=r.close;k=addD(k,1)) if(wf(k)) D.push(k); if(!D.length) D.push(r.open);
  r.ops.forEach(o=>{ D.forEach(k=>{ if(k<=TODAY) TB[o.tech][k]=(TB[o.tech][k]||0)+o.b/D.length; }); }); });
const R2=rng('attendance');
for(let i=0;i<=DAYS;i++){ const k=addD(START,i), f=wf(k); if(!f) continue; let tot=0;
  TECHS.forEach(t=>{ const b=TB[t][k]||0; tot+=b; ATT[t][k]=f===1?Math.max(8.5+R2()*.6,b+.4+R2()*.6):(b>0?Math.max(b+.4+R2()*.6,4.5):0); if(TSTART[t]&&k<TSTART[t]) ATT[t][k]=0; });
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

/* ======================= Career v2 — one technician’s own numbers, and how they grow ======================= */
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
/* ---------- v2: the extra things a tech’s Career keeps ---------- */
const RATE_T={MR:38,DK:34,AW:26,KT:40};
const PAYP={a:'2026-10-12',b:'2026-10-25'};
const yb=k=>(+k.slice(0,4)-1)+k.slice(4);
/* earlier years, typed in from old time sheets — what each tech would enter */
const PRIOR0={MR:{from:'March 2019',to:'December 2024',ro:2840,q:11420,b:11180,d:1405},DK:{from:'June 2021',to:'December 2024',ro:1310,q:5160,b:5240,d:820},AW:{from:'May 2022',to:'July 2026',ro:1180,q:4410,b:4870,d:1010},KT:{from:'January 2018',to:'December 2024',ro:3420,q:14260,b:14100,d:1690}};
/* coaching notes from the foreman — goal: [kpi, target, by, set] · notes: [id, date, text, tag] */
const NOTES={
 MR:{goal:['prod',85,'2026-11-30','2026-09-15'],L:[
  ['n1','2026-10-20','Clutch jobs: check the release bearing and pilot bushing before you pull the transmission — two of your last three ran long there. If it looks bigger than the quote, tell me first and I’ll get the writer to add time.','Quotes'],
  ['n2','2026-10-06','Good work on the DEF doser — inside the quote. Write it up in Fixes so Dana and Andre can use it.','Fixes'],
  ['n3','2026-09-15','Unapplied time is up. When you’re waiting on parts, punch onto the RO — don’t leave the clock on shop time. Goal: productivity back to 85% by Nov 30.','Time Log']]},
 DK:{goal:['sold',7.5,'2026-12-31','2026-10-01'],L:[
  ['n1','2026-10-14','You’re the quickest on aftertreatment in the shop. I’m sending you the DPF and doser jobs this month — keep writing up what you find.','Work'],
  ['n2','2026-09-22','Volvo I-Shift Level 2 is open in November. Sign up and I’ll cover your Thursday.','Training']]},
 AW:{goal:['eff',92,'2026-12-31','2026-08-03'],L:[
  ['n1','2026-10-19','Better week — 94% on PMs. Ride along with Kevin on the next two turbo jobs before you take one alone.','Training'],
  ['n2','2026-09-28','Read the past fix before you start — the turbo actuator one would have saved you an hour on 37544.','Fixes'],
  ['n3','2026-08-03','Welcome aboard. First goal: 92% efficiency by the end of the year. I’ll check in every two weeks.','Goals']]},
 KT:{goal:['cb',3,'2026-12-31','2026-07-01'],L:[
  ['n1','2026-10-16','Two comebacks this quarter, both A/C. Do the dye leak test before the truck leaves — every time.','Quality'],
  ['n2','2026-09-09','Thanks for taking Andre on the turbo jobs. Log the ride-along time on his RO, not yours.','Time Log']]}};
/* skills and training — [name, state ok|warn|prog|none, line, % done] */
const SKL={
 MR:{L:[['ASE T2 · Diesel engines','ok','Expires Mar 2027'],['ASE T4 · Brakes','warn','Expires Dec 31 — in 70 days'],['Volvo D13 engine · Level 2','ok','Done Jun 2024'],['Volvo I-Shift · Level 2','prog','3 of 5 modules',60],['EPA 609 · A/C refrigerant','ok','No expiry']],next:['Volvo aftertreatment · Level 2','Nov 12–13 · Charlotte training center']},
 DK:{L:[['ASE T2 · Diesel engines','ok','Expires Aug 2028'],['ASE T6 · Electrical','ok','Expires Feb 2027'],['Volvo aftertreatment · Level 2','ok','Done Mar 2025'],['Volvo I-Shift · Level 2','none','Not started — November class open'],['EPA 609 · A/C refrigerant','ok','No expiry']],next:['Volvo I-Shift · Level 2','Nov 18–19 · Charlotte training center']},
 AW:{L:[['ASE T8 · Preventive maintenance','ok','Expires Apr 2029'],['ASE T2 · Diesel engines','prog','Studying — test Dec 5',40],['Volvo PM & inspection','ok','Done Aug 2026'],['EPA 609 · A/C refrigerant','ok','No expiry']],next:['Volvo D13 engine · Level 1','Online · 6 of 12 lessons']},
 KT:{L:[['ASE Master truck technician','ok','Expires Jan 2028'],['Volvo D13 engine · Level 3','ok','Done 2023'],['Volvo aftertreatment · Level 2','ok','Done 2024'],['Volvo I-Shift · Level 2','ok','Done 2022'],['EPA 609 · A/C refrigerant','ok','No expiry']],next:['Volvo electrical · Level 3','Jan 2027 · Greensboro']}};
/* fixes each tech wrote — [title, written, used, held, used by, hours saved] */
const FXW={
 MR:[['DEF doser clogged — derate','2026-10-08',3,3,'Dana, Andre',2.1],['Turbo actuator fault — low boost','2026-03-11',7,6,'Dana, Luis, Kevin',4.4],['Air dryer purging constantly','2025-09-02',5,5,'Priya, Luis',2.6],['Alternator not charging','2025-05-19',2,1,'Kevin',0.4]],
 DK:[['DPF pressure sensor — fault code','2026-06-02',9,9,'Mike, Andre, Kevin',5.2],['Outlet NOx sensor — check engine light','2025-11-20',6,5,'Luis, Priya',3.0]],
 AW:[],
 KT:[['EGR valve stuck — derate','2025-04-03',11,10,'Everyone in the shop',6.9],['A/C not cooling — compressor clutch','2025-07-14',8,6,'Mike, Dana, Andre',3.8],['Misfire cylinder 4 — injector','2026-02-17',4,4,'Luis, Andre',1.9]]};
const GRP=[['diag','Diagnosis'],['rep','Repairs'],['pm','PM service'],['war','Warranty']];

let U, TOAST, TT, RENDERING=false;
function reset(who){ U={who:who||'MR',view:'ov',p:'mo',cmp:'prev',drv:'eff',sel:null,pop:null,kb:false,tg:{},chk:{c1:1,c2:1},prior:{},usePrior:false,pay:false,al:{pace:1,fri:1,best:0},ack:{},stmt:null,hl:null}; TOAST=null; }
function toast(t){ TOAST={t}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const FT=()=>({k:'tech',v:U.who});
const W=()=>win(U.p);
const noCmp=()=>U.p==='all';
const yrSeg=()=>U.p!=='all'&&U.p!=='yr';
const CMPY=()=>U.cmp==='yr'&&yrSeg();
const yrHere=()=>tStart()<=yb(win(U.p)[0]);
const PW=()=>{ if(CMPY()){ const [a,b]=W(); return [yb(a),yb(b)]; } return pwin(U.p); };
const rng2=(a,b)=>a===b?fd(a):a.slice(0,7)===b.slice(0,7)?fd(a)+' – '+dOf(b).getDate():fd(a)+' – '+fd(b);
const cmpLbl=()=>{ if(noCmp()) return ''; if(CMPY()){ const [a,b]=PW(); return 'vs '+rng2(a,b)+', '+a.slice(0,4); } return per(U.p).cmp; };
const hl=s=>U.hl===s?' hl':'';
const isSum=k=>['sold','clk','lost','unap'].includes(k.id);
function kv(k){ const [a,b]=W(), [pa,pb]=PW(), F_=FT(), v=val(k,a,b,F_), pv=noCmp()?null:val(k,pa,pb,F_), X=ctx(a,b,F_), g=PG[U.who][k.id], t=g==null?null:k.tw!=null?g*X.wd:g;
  return {v,pv,t,dl:noCmp()?{s:'',cl:'flat'}:delta(k,v,pv),ok:t==null||v==null?null:k.d>=0?v>=t:v<=t,X,shop:val(k,a,b)}; }
function sparkSvg(k,w=76,h=28){ const L=spark(U.p==='all'?'yr':U.p).map(x=>val(k,x.a,x.b,FT())); const V=L.filter(v=>v!=null); if(V.length<2) return `<svg class="spk" width="${w}" height="${h}"></svg>`;
  let lo=Math.min(...V), hi=Math.max(...V); if(hi-lo<1e-6){ hi+=1; lo-=1; } const x=i=>2+i*(w-4)/(L.length-1), y=v=>h-3-(v-lo)/(hi-lo)*(h-6), pts=L.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);
  return `<svg class="spk mg-svg" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--tg-ink4)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${pts[pts.length-1][0].toFixed(1)}" cy="${pts[pts.length-1][1].toFixed(1)}" r="3" fill="var(--tg-acc)"/></svg>`; }
const rtop=(x,y,w,h)=>{ const r=Math.min(4,h,w/2); return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`; };
/* this tech’s work: operations by them, on ROs closed in the window */
function opsIn(a,b){ return ctx(a,b,FT()).ops; }
function rosIn(a,b){ const M=new Map(); opsIn(a,b).forEach(o=>{ if(!M.has(o.r)) M.set(o.r,[]); M.get(o.r).push(o); }); const open=openAt(TODAY).filter(r=>r.ops.some(o=>o.tech===U.who)).map(r=>[r,r.ops.filter(o=>o.tech===U.who)]); return {closed:[...M.entries()],open:b>=TODAY?open:[]}; }
const CHK={MR:[['c1','play','Clock still running on 37466','Since 5:12 pm yesterday — 21 h. Efficiency leaves the operation out until it’s fixed.','Stop it at 5:12 pm'],['c2','timelog','A punch with no operation','Oct 20 · 0.8 h on 37628 not on a job — it counts as unapplied.','Pick the job']],DK:[['c2','timelog','A punch with no operation','Oct 21 · 0.4 h on 37388 not on a job.','Pick the job']],AW:[['c1','play','Clock still running on 37544','Since 4:40 pm yesterday.','Stop it at 4:40 pm']],KT:[['c1','play','Clock still running on 37589','Since 6:02 pm yesterday — 20 h.','Stop it at 6:02 pm']]};
const nChk=()=>(CHK[U.who]||[]).filter(c=>U.chk[c[0]]).length;
const daysIn=(a,b)=>Object.keys(ATT[U.who]).filter(d=>d>=a&&d<=b&&ATT[U.who][d]>0).length;

/* ---------- drawing ---------- */
function render(){ if(RENDERING) return; RENDERING=true; try{ draw(); } finally{ RENDERING=false; } }
function draw(){ const v=U.view;
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='career'?'is-on':''}">${ic(k,18)}${k==='inbox'?'<span class="rl-badge">3</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg mg cr">${head()}<div class="tg-body">${v==='work'?wList():''}<div class="tg-main">${v==='work'?wDetail():v==='grow'?vGrow():vOv()}</div>${pop()}${U.stmt?stmtSheet():''}</div><div class="tk-tip" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}</div>`:''}</div></div>`;
  after(); }
function head(){ const e=kv(KM.eff), n=nChk(), pv=U.pop&&U.pop.type==='priv';
  return `<header class="tg-head"><h1 class="tg-h1">Career</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><span class="tg-av">${U.who}</span>${PPL[U.who]}<span class="ib-role">since ${SINCE[U.who]}</span></span><i>·</i><span class="tg-hf" style="cursor:default"><b>${fmt('pct',e.v)}</b>efficiency</span>${n?`<i>·</i><button class="tg-hf w" data-a="pop" data-p="chk"><b>${n}</b>to fix in the Time Log</button>`:''}<i>·</i><button class="tg-hf cr-priv${pv?' on':''}" data-a="pop" data-p="priv" title="Who sees this">${ic('lock',12)}Private</button></span>
  <div class="tg-views">${[['ov','grid','Overview'],['work','ros','Work'],['grow','spark','Growth']].map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  ${U.view==='grow'?'':`<button class="btn btn-sm" data-a="pop" data-p="per" style="height:30px" title="Period (D · W · M · Q · Y · A)">${ic('clock',14)}${per(U.p).n}${ic('chevD',13)}</button>`}<button class="btn btn-sm" data-a="stmt" style="height:30px" title="Your work record, ready to print">${ic('file',14)}Statement</button></header>`; }
/* ---------- overview ---------- */
function totals(){ const X=ctx(tStart(),TODAY,FT()), q=sum(X.ops,o=>o.q), b=sum(X.ops,o=>o.b), ro=new Set(X.ops.map(o=>o.r)).size, ov=sum(X.ops,over), days=daysIn(tStart(),TODAY), P0=U.usePrior&&U.prior[U.who], n=v=>Math.round(v).toLocaleString();
  if(!P0) return [['ROs worked',n(ro),'every RO with your time on it'],['Hours sold',n(q)+' h','quoted, on your operations'],['Hours clocked',n(b)+' h','punched on those operations'],['Over quote',n(ov)+' h','on the jobs that ran over'],['Efficiency',fmt('pct',b?q/b*100:null),'sold ÷ clocked, all time'],['Days worked',n(days),'with a punch']];
  return [['ROs worked',n(ro+P0.ro),`${n(P0.ro)} by hand + ${n(ro)} in Parsec`,1],['Hours sold',n(q+P0.q)+' h',`${n(P0.q)} by hand + ${n(q)} in Parsec`,1],['Hours clocked',n(b+P0.b)+' h',`${n(P0.b)} by hand + ${n(b)} in Parsec`,1],['Over quote',n(ov)+' h','Parsec only — not kept before'],['Efficiency',fmt('pct',(q+P0.q)/(b+P0.b)*100),'sold ÷ clocked, all of it',1],['Days worked',n(days+P0.d),`${n(P0.d)} by hand + ${n(days)} in Parsec`,1]]; }
function tile(k,label){ const o=kv(k);
  return `<div class="mg-tile" data-tip="${esc(k.n)}|${esc(k.how)}"><span class="l"><span>${label||k.n}</span></span><span class="v">${fmt(k.u,o.v)}</span>${sparkSvg(k)}<span class="r">${o.dl.s?`<span class="mg-d ${o.dl.cl}">${o.dl.s}</span>`:''}<span class="sp"></span>${o.t!=null?(o.ok?`<span class="mg-tgt ok">${ic('check',11)}goal ${fmt(k.u,o.t)}</span>`:`<span class="mg-tgt off">${ic('flag',11)}goal ${fmt(k.u,o.t)}</span>`):`<span>shop avg ${fmt(k.u,isSum(k)?o.shop/6:o.shop)}</span>`}</span></div>`; }
function vOv(){ const T=totals(), P_=per(U.p), P0=U.prior[U.who];
  let h=`<div class="mg-full"><div class="mg-sec">Career totals<span>${U.usePrior&&P0?'since '+P0.from+' — '+(TSTART[U.who]?'before Vanguard':P0.from.slice(-4)+' to 2024')+' entered by hand, the rest from Parsec':TSTART[U.who]?'since you started in '+SINCE[U.who]+' — all of it':'since '+MN[dOf(START).getMonth()]+' '+START.slice(0,4)+', when Parsec started — your time before Parsec isn’t in here'}</span><span class="sp"></span>${P0?`<span class="tg-seg3 cr-seg"><button class="${U.usePrior?'':'on'}" data-a="prior" data-v="0">Parsec only</button><button class="${U.usePrior?'on':''}" data-a="prior" data-v="1">With earlier years</button></span><button class="btn btn-sm" data-a="pop" data-p="prior">${ic('pencil',13)}Edit</button>`:`<button class="btn btn-sm" data-a="pop" data-p="prior">${ic('plus',13)}Add earlier years</button>`}</div><div class="cr-tot${hl('prior')}">${T.map(x=>`<div><small>${x[0]}${x[3]?'<em>by hand + Parsec</em>':''}</small><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>`;
  h+=`<div class="mg-sec">${P_.n}<span>${P_.s}${noCmp()?'':' · '+cmpLbl()} · goals set by Ray Holloway</span><span class="sp"></span>${yrSeg()?`<span class="cr-cmp${hl('cmp')}" data-sec="cmp">Compare with<span class="tg-seg3 cr-seg"><button class="${CMPY()?'':'on'}" data-a="cmp" data-v="prev" title="Compare with the period before (C)">${{day:'Last '+DWL[dOf(TODAY).getDay()],wk:'Last week',lwk:'The week before',mo:MN[dOf(P_.pa).getMonth()]+' 1 – '+dOf(P_.pb).getDate(),lmo:mName(P_.pa),qt:'Q'+qN(P_.pa)+' to date',lqt:'Q'+qN(P_.pa)}[U.p]}</button><button class="${CMPY()?'on':''}" data-a="cmp" data-v="yr"${yrHere()?' title="The same days last year (C)"':' disabled title="'+F(U.who)+' started in '+SINCE[U.who]+'"'}>Same days last year</button></span></span>`:''}</div>${CMPY()&&!yrHere()?`<div class="cr-note0">${ic('info',13)}<span>${F(U.who)} started in ${SINCE[U.who]} — there’s no last year to compare with yet.</span></div>`:''}<div class="mg-tiles">${[['eff'],['prod'],['sold'],['clk'],['unap'],['lost'],['cb','Comebacks'],['fx']].map(x=>tile(KM[x[0]],x[1])).join('')}</div>`;
  h+=`<div class="mg-two cr-two"><div class="mg-card"><div class="mg-ch"><b>Efficiency</b><small>${{day:'each of the last 14 workdays',wk:'running total, day by day',mo:'running total, day by day',qt:'running total, week by week',yr:'running total, month by month',all:'each month'}[P_.g]}</small><span class="sp"></span><span class="mg-leg"><span><i></i>${U.p==='all'?'Each month':'This period'}</span>${effPB()?`<span><i class="ln"></i>${CMPY()?'Same days last year':'The period before'}</span>`:''}<span><i class="tl"></i>Your goal</span></span></div><div class="mg-cb">${effChart(700,238)}</div></div>${whyCard()}</div>`;
  h+=`<div class="mg-two cr-two b">${goalsCard()}${payCard()}</div>`;
  h+=`<div class="mg-two cr-two b"><div class="mg-card"><div class="mg-ch"><b>Your hours, last 14 days</b><small>on ROs and unapplied</small><span class="sp"></span><span class="mg-leg"><span><i></i>On ROs</span><span><i class="un"></i>Unapplied</span></span></div><div class="mg-cb">${hoursChart(700)}</div></div>${overCard()}</div></div>`;
  return h; }
const RUN=()=>['wk','lwk','mo','lmo','qt','lqt','yr'].includes(U.p);
function effPB(){ const P_=per(U.p); if(noCmp()) return null; if(CMPY()) return P_.g==='day'?null:buckets(U.p).map(x=>({a:yb(x.a),b:yb(x.b),t:x.t.replace(/ — to date$/,'')})); return buckets(U.p,true); }
function effChart(w,H=190){ const k=KM.eff, F_=FT(), P_=per(U.p), C=buckets(U.p), PB=effPB(), run=RUN(), pa0=CMPY()?yb(P_.a):P_.pa;
  const cv=(x,a0)=>!x||x.fut?null:val(k,run?a0:x.a,minK(x.b,TODAY),F_);
  const V=C.map(x=>cv(x,P_.a)), PV=PB?PB.map(x=>cv(x,pa0)):null, g=PG[U.who].eff, pl_=CMPY()?'last year':'the period before';
  const all=V.concat(PV||[]).concat([g]).filter(v=>v!=null); const pl=44, pr=64, pt=10, pb=22; let lo=Math.max(0,Math.floor((Math.min(...all)-8)/10)*10), stp=Math.max(5,Math.ceil((Math.max(...all)+6-lo)/4/5)*5), hi=lo+4*stp;
  const st=(w-pl-pr)/C.length, cx=i=>pl+st*i+st/2, y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`; for(let v=lo;v<=hi;v+=stp) s+=`<line class="gl" x1="${pl}" x2="${w-pr+8}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${pl-8}" y="${(y(v)+3.5).toFixed(1)}" text-anchor="end">${Math.round(v)}%</text>`;
  s+=`<line class="tl" x1="${pl}" x2="${w-pr+8}" y1="${y(g).toFixed(1)}" y2="${y(g).toFixed(1)}"/><text class="tlab" x="${w-pr+12}" y="${(y(g)+3.5).toFixed(1)}">Goal ${g}%</text>`;
  const seg=(A,cls)=>{ const pts=A.map((v,i)=>v==null?null:[cx(i),y(v)]); let out='', cur=[]; const fl=()=>{ if(cur.length>1) out+=(cls==='ln'?`<path class="ar" d="M${cur[0][0]},${y(lo)}L${cur.map(p=>p.map(n=>n.toFixed(1)).join(',')).join('L')}L${cur[cur.length-1][0]},${y(lo)}Z"/>`:'')+`<polyline class="${cls}" points="${cur.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}"/>`; cur=[]; }; pts.forEach(p=>{ if(p) cur.push(p); else fl(); }); fl(); return out; };
  if(PV) s+=seg(PV,'pv'); s+=seg(V,'ln');
  const every=C.length>16?3:C.length>9?2:1;
  C.forEach((x,i)=>{ if(V[i]!=null&&C.length<=14) s+=`<circle class="dt" cx="${cx(i).toFixed(1)}" cy="${y(V[i]).toFixed(1)}" r="4"/>`; if(i%every===(C.length-1)%every) s+=`<text class="ax" x="${cx(i).toFixed(1)}" y="${H-5}" text-anchor="middle"${x.fut?' style="opacity:.45"':''}>${x.l}</text>`;
    if(!x.fut) s+=`<rect class="hit" x="${(cx(i)-st/2).toFixed(1)}" y="${pt}" width="${st.toFixed(1)}" height="${H-pt-pb}" data-tip="${esc(x.t)}|${V[i]==null?'no work closed':(RUN()?'So far ':'')+Math.round(V[i])+'%'}${PV&&PV[i]!=null?' · '+pl_+' '+Math.round(PV[i])+'%':''}"/>`; });
  return s+'</svg>'; }
function hoursChart(w){ const L=[]; let k=TODAY; while(L.length<14){ if(wf(k)) L.unshift(k); k=addD(k,-1); }
  const V=L.map(d=>{ const b=TB[U.who][d]||0, a=ATT[U.who][d]||0; return {d,b,u:Math.max(0,a-b),a}; }), H=170, pl=30, pb=22, pt=8, mx=Math.ceil(Math.max(...V.map(x=>x.a))/2)*2+1, st=(w-pl-4)/L.length, bw=Math.min(24,st*.6), y=v=>pt+(H-pt-pb)*(1-v/mx);
  let s=`<svg class="mg-svg" width="${w}" height="${H}">`; for(let g=0;g<=mx;g+=Math.max(2,Math.round(mx/4/2)*2)) s+=`<line class="gl" x1="${pl}" x2="${w}" y1="${y(g)}" y2="${y(g)}"/><text class="ax" x="${pl-6}" y="${y(g)+3.5}" text-anchor="end">${g}</text>`;
  V.forEach((x,i)=>{ const c=pl+st*i+st/2, x0=c-bw/2; s+=`<path class="bar" d="M${x0},${y(0)}V${y(x.b)}H${x0+bw}V${y(0)}Z"/>`; if(x.u>.05) s+=`<path class="bar un" d="${rtop(x0,y(x.b+x.u),bw,Math.max(0,y(x.b)-2-y(x.b+x.u)))}"/>`; s+=`<text class="ax" x="${c}" y="${H-6}" text-anchor="middle">${i%2?'':md(x.d)}</text><rect class="hit" x="${c-st/2}" y="${pt}" width="${st}" height="${H-pt-pb}" data-tip="${DW[dOf(x.d).getDay()]} ${fd(x.d)}|On ROs ${h1(x.b)} h · unapplied ${h1(x.u)} h · on the clock ${h1(x.a)} h"/>`; });
  return s+'</svg>'; }
/* 1 · why it moved — what each kind of job added to the change, and the one job that did the most */
function whyCard(){ const [a,b]=W(), [pa,pb]=PW(), nc=noCmp(), O=opsIn(a,b), O2=nc?[]:opsIn(pa,pb), isE=U.drv==='eff';
  const Q=sum(O,o=>o.q), B=sum(O,o=>o.b), Q2=sum(O2,o=>o.q), B2=sum(O2,o=>o.b), E=B?Q/B*100:null, E2=B2?Q2/B2*100:null, none=!nc&&!O2.length;
  const rows=GRP.map(([t,n])=>{ const g=O.filter(o=>o.t===t), g2=O2.filter(o=>o.t===t), q=sum(g,o=>o.q), bb=sum(g,o=>o.b), q2=sum(g2,o=>o.q), b2=sum(g2,o=>o.b);
    const imp=nc||none?null:isE?((B?(q-E2/100*bb)/B:0)-(B2?(q2-E2/100*b2)/B2:0))*100:q-q2;
    return {t,n,c:g.length,c2:g2.length,x:isE?(bb?q/bb*100:null):q,px:isE?(b2?q2/b2*100:null):q2,imp}; }).filter(r=>r.c||r.c2).sort((p,q)=>Math.abs(q.imp||0)-Math.abs(p.imp||0));
  const mx=Math.max(isE?1:2,...rows.map(r=>Math.abs(r.imp||0))), u=isE?'pct':'h', fx=v=>isE?fmt('pct',v):h1(v)+' h', it=v=>(v>0?'+':v<0?'−':'')+(isE?Math.abs(v).toFixed(1)+' pts':h1(Math.abs(v))+' h');
  const tv=isE?E:Q, pv=isE?E2:Q2, dl=nc||none?null:isE?(()=>{ const d=tv-pv, z=Math.abs(d)<.05; return {s:z?'no change':(d>0?'▲ ':'▼ ')+Math.abs(d).toFixed(1)+' pts',cl:z?'flat':d>0?'good':'bad'}; })():delta(KM.sold,tv,pv), fs=v=>isE?(v==null?'—':v.toFixed(1)+'%'):h1(v)+' h';
  const top=O.filter(o=>lostOf(o)>.3).sort((p,q)=>lostOf(q)-lostOf(p))[0], wo=top&&B>top.b?(Q-top.q)/(B-top.b)*100:null, big=O.slice().sort((p,q)=>q.q-p.q)[0];
  const d1=daysIn(a,minK(b,TODAY)), d2=nc?0:daysIn(pa,pb);
  return `<div class="mg-card cr-why${hl('why')}" data-sec="why"><div class="mg-ch"><b>Why it moved</b><small>${nc?'all time':cmpLbl()}</small><span class="sp"></span><span class="tg-seg3 cr-seg"><button class="${isE?'on':''}" data-a="drv" data-v="eff">Efficiency</button><button class="${isE?'':'on'}" data-a="drv" data-v="sold">Hours sold</button></span></div><div class="mg-cb">
    <div class="cr-wsum"><span>${isE?'Efficiency':'Hours sold'}</span>${nc||none?`<b>${fs(tv)}</b>`:`<b><em>${fs(pv)}</em> → ${fs(tv)}</b><span class="mg-d ${dl.cl}">${dl.s}</span>`}</div>
    ${nc?`<div class="cr-note0" style="margin:0 0 6px">${ic('info',13)}<span>All time has nothing to compare with — pick a period to see what moved.</span></div>`:none?`<div class="cr-note0" style="margin:0 0 6px">${ic('info',13)}<span>No work of yours closed ${CMPY()?'in the same days last year':'in the period before'} — nothing to compare with.</span></div>`:''}
    ${rows.map(r=>`<div class="cr-wy"><span class="n"><span class="cr-ty ${TYPE[r.t][1]}">${TYPE[r.t][0]}</span><b>${r.n}</b><small>${r.c} job${r.c===1?'':'s'}</small></span><span class="ft">${nc||none?fx(r.x):`${fx(r.px)} → ${fx(r.x)}`}</span><span class="dv">${r.imp==null?'':`<span class="ax"></span><i class="${r.imp>=0?'good':'bad'}" style="${r.imp>=0?'left:50%':'right:50%'};width:${(Math.abs(r.imp)/mx*50).toFixed(1)}%"></i>`}</span><span class="m ${r.imp==null?'':r.imp>=0?'good':'bad'}">${r.imp==null?'':it(r.imp)}</span></div>`).join('')}
    ${isE&&top?`<button class="cr-call" data-a="go" data-ro="${top.r.no}">${ic('flag',13)}<span>One job did the most: <span class="tg-no">${top.r.no}</span> <b>${esc(cmpOf(top))}</b> ran <b class="${sev(lostOf(top))}">+${hm(lostOf(top))}</b> over${wo!=null?` — without it you’d be at <b>${Math.round(wo)}%</b>`:''}.</span>${ic('chevR',14)}</button>`:''}
    ${!isE?`<div class="cr-call st">${ic('clock',13)}<span>Days with a punch: <b>${d1}</b>${nc?'':` vs ${d2}`}${big?` · biggest job <span class="tg-no">${big.r.no}</span> ${esc(cmpOf(big))}, ${h1(big.q)} h sold`:''}.</span></div>`:''}</div></div>`; }
/* goals, with 9 · alerts to the Inbox */
function goalsCard(){ const g=PG[U.who], o=per('mo');
  const R=[['eff','Efficiency'],['prod','Productivity'],['sold','Hours sold'],['cb','Comebacks']].map(([id,n])=>{ const k=KM[id], v=val(k,o.a,TODAY,FT()), X=ctx(o.a,TODAY,FT()), t=k.tw!=null?g[id]*X.wd:g[id], ok=v==null?null:k.d>=0?v>=t:v<=t; return {k,n,v,t,ok,g:g[id]}; });
  const sd=R[2], tot=wdIn(o.a,mEnd(o.a)), dn=wdIn(o.a,TODAY), proj=sd.v/dn*tot, goalM=sd.g*tot, behind=sd.g*dn-sd.v;
  const AL=[['pace','When I fall behind pace on a goal'],['fri','A recap every Friday at 4 pm'],['best','When I set a new best']];
  return `<div class="mg-card cr-goals${hl('alerts')}" data-sec="alerts"><div class="mg-ch"><b>Your goals · ${mName(TODAY)}</b><small>set by Ray Holloway, Oct 1</small></div><div class="mg-cb">${R.map(r=>{ const pct=r.k.d>=0?Math.min(1,(r.v||0)/r.t):Math.min(1,r.t/Math.max(r.v||0.001,r.t)); return `<div class="cr-gr"><span class="n"><b>${r.n}</b><small>goal ${r.k.tw!=null?r.g+' h a workday':fmt(r.k.u,r.g)}</small></span><span class="b"><i class="${r.ok?'ok':'off'}" style="width:${(pct*100).toFixed(1)}%"></i></span><span class="m ${r.ok?'ok':'off'}">${fmt(r.k.u,r.v)}<small>${r.ok?'meets it':r.k.d>=0?'under':'over'}</small></span></div>`; }).join('')}
    <div class="cr-pace">${ic('spark',13)}<span>On pace for <b>${Math.round(proj)} h</b> sold by ${fd(mEnd(o.a))} — the goal is ${Math.round(goalM)} h${proj<goalM?` · ${h1((goalM-sd.v)/(tot-dn))} h a workday to get there`:''}.</span></div>
    <div class="cr-al"><div class="cr-alh">${ic('inbox',13)}<b>Tell me in my Inbox</b><small>only you get these</small></div>${AL.map(([k,n])=>`<button class="cr-sr" data-a="al" data-k="${k}" aria-pressed="${U.al[k]?'true':'false'}"><span>${n}</span><span class="cr-sw${U.al[k]?' on':''}"><i></i></span></button>`).join('')}
    ${U.al.pace&&behind>.5?`<div class="cr-last">${ic('bell',12)}<span><b>Sent this morning, 7:00</b>“You’re ${Math.round(behind)} h behind pace on hours sold for ${mName(TODAY)}.”</span><button class="btn btn-sm" data-a="toast" data-t="In Parsec this opens the alert in your Inbox.">Open</button></div>`:''}</div></div></div>`; }
/* 8 · pay estimate — flat rate, hidden until asked */
function payCard(){ const r=RATE_T[U.who], a=PAYP.a, e=PAYP.b, fl=sum(opsIn(a,TODAY),o=>o.q), dn=wdIn(a,TODAY), tot=wdIn(a,e), proj=dn?fl/dn*tot:0, gl=PG[U.who].sold*tot, sh=U.pay, m=v=>sh?usd0(v):'$ • • • •';
  const mx=Math.max(gl,proj)*1.1, X=v=>(v/mx*100).toFixed(1), lp=sum(opsIn(addD(a,-14),addD(a,-1)),o=>o.q);
  return `<div class="mg-card cr-pay${hl('pay')}" data-sec="pay"><div class="mg-ch"><b>Pay estimate</b><small>pay period ${fd(a)} – ${fd(e)}</small><span class="sp"></span><button class="btn btn-sm" data-a="pay">${ic('eye',14)}${sh?'Hide amounts':'Show amounts'}</button></div><div class="mg-cb">
    <div class="cr-big"><small>At your pace, by ${fd(e)}</small><b>${m(proj*r)}</b><span>${h1(proj)} h flagged${sh?' × $'+r+' an hour':''}</span></div>
    <div class="cr-pbar"><span class="tr"><i class="f" style="width:${X(fl)}%"></i><i class="p" style="left:${X(fl)}%;width:${X(Math.max(0,proj-fl))}%"></i><em style="left:${X(gl)}%"></em></span><span class="ax"><span style="left:${X(gl)}%">goal</span></span></div>
    <div class="cr-prow"><span><i class="f"></i>Flagged so far<small>${fd(a)} – ${fd(TODAY)} · ${+dn.toFixed(1)} of ${+tot.toFixed(1)} workdays</small></span><b>${h1(fl)} h</b><b class="m">${m(fl*r)}</b></div>
    <div class="cr-prow"><span><i class="p"></i>The rest, at your pace<small>${+(tot-dn).toFixed(1)} workdays left</small></span><b>${h1(Math.max(0,proj-fl))} h</b><b class="m">${m(Math.max(0,proj-fl)*r)}</b></div>
    <div class="cr-prow"><span><i class="g"></i>At your goal<small>${PG[U.who].sold} h a workday</small></span><b>${h1(gl)} h</b><b class="m">${m(gl*r)}</b></div>
    <div class="cr-prow last"><span>Last pay period<small>${fd(addD(a,-14))} – ${fd(addD(a,-1))} · paid Oct 16</small></span><b>${h1(lp)} h</b><b class="m">${m(lp*r)}</b></div>
    <div class="cr-pft">${ic('lock',12)}<span>Flat rate — hours sold on your operations × your rate. Redo time on a comeback isn’t flagged. Only you and Ray see this; payroll has the final number.</span></div></div></div>`; }
function overCard(){ const [a,b]=W(), L=opsIn(a,b).filter(o=>lostOf(o)>0).sort((p,q)=>lostOf(q)-lostOf(p)).slice(0,5);
  return `<div class="mg-card"><div class="mg-ch"><b>Jobs that ran over</b><small>${per(U.p).n.toLowerCase()} · most hours first</small></div><div class="mg-cb">${L.length?L.map(o=>`<button class="cr-or" data-a="go" data-ro="${o.r.no}"><span class="cr-ty ${TYPE[o.t][1]}">${TYPE[o.t][0]}</span><span class="n"><b>${esc(cmpOf(o))}</b><small><span class="tg-no">${o.r.no}</span> ${esc(o.r.cust)}</small></span><span class="m ${sev(lostOf(o))}">+${hm(lostOf(o))}<small>${h1(o.q)} quoted</small></span></button>`).join(''):'<div class="mg-none">Nothing ran over — every job inside its quote.</div>'}</div></div>`; }
/* ---------- growth ---------- */
function vGrow(){ return `<div class="mg-full"><div class="mg-sec">Your bests<span>${TSTART[U.who]?'since you started in '+SINCE[U.who]:'since Jan 2025, when Parsec started'} · this week and month so far underneath</span></div><div class="cr-bests${hl('best')}" data-sec="best">${bestsHtml()}</div>
  <div class="mg-two cr-two">${quoteCard()}${notesCard()}</div><div class="mg-two cr-two b">${fixCard()}${skillCard()}</div></div>`; }
/* 3 · bests */
function bestsData(){ const F_=FT(), s=tStart(), g=PG[U.who].eff, W_=[], M_=[];
  for(let a=wStart(s);a<=TODAY;a=addD(a,7)){ const b=minK(addD(a,6),TODAY), O=ctx(a,b,F_).ops, q=sum(O,o=>o.q), bb=sum(O,o=>o.b); W_.push({a,b,q,bb,e:bb?q/bb*100:null}); }
  for(let a=mStart(s);a<=TODAY;a=addM(a,1)){ const b=minK(mEnd(a),TODAY), O=ctx(a,b,F_).ops, q=sum(O,o=>o.q), bb=sum(O,o=>o.b); M_.push({a,b,q,bb,e:bb?q/bb*100:null}); }
  const cur=W_[W_.length-1], done=W_.slice(0,-1), curM=M_[M_.length-1], doneM=M_.slice(0,-1);
  const mxBy=(L,f)=>L.reduce((m,x)=>f(x)!=null&&(!m||f(x)>f(m))?x:m,null);
  const okW=done.filter(w=>w.q>=20), bw=mxBy(okW.length?okW:done,w=>w.e), bh=mxBy(done,w=>w.q), okM=doneM.filter(m=>m.q>=60), bm=mxBy(okM.length?okM:doneM,m=>m.e);
  let best={n:0}, run=0, ra=null; done.forEach(w=>{ if(w.q>=10&&w.e>=g){ if(!run) ra=w.a; run++; if(run>best.n) best={n:run,a:ra,b:w.b}; } else run=0; });
  const CB=ROS.filter(r=>r.cb&&r.close<=TODAY&&r.ops.some(o=>o.tech===U.who)&&addD(r.close,r.cb)<=TODAY).map(r=>({d:addD(r.close,r.cb),r})).sort((p,q)=>p.d<q.d?-1:1);
  const last=CB[CB.length-1], since=dd(last?last.d:s,TODAY); let lg=0, pv=s; CB.forEach(x=>{ lg=Math.max(lg,dd(pv,x.d)); pv=x.d; }); lg=Math.max(lg,since);
  return {bw,bh,bm,best,run,cur,curM,since,lg,last,g}; }
function bestsHtml(){ const D=bestsData(), wk=w=>w?'Week of '+fd(w.a)+(w.a.slice(0,4)!==TODAY.slice(0,4)?', '+w.a.slice(0,4):''):'—';
  const C=[
    ['Best week · efficiency',D.bw?Math.round(D.bw.e)+'%':'—',D.bw?wk(D.bw)+' · '+h1(D.bw.q)+' h sold':'Not enough weeks yet','This week so far',D.cur.e!=null?Math.round(D.cur.e)+'%':'—',D.bw&&D.cur.e!=null?D.cur.e/D.bw.e:0,D.bw&&D.cur.q>=20&&D.cur.e>D.bw.e],
    ['Most hours sold in a week',D.bh?h1(D.bh.q)+' h':'—',wk(D.bh),'This week so far',h1(D.cur.q)+' h',D.bh?D.cur.q/D.bh.q:0,D.bh&&D.cur.q>D.bh.q],
    ['Best month · efficiency',D.bm?Math.round(D.bm.e)+'%':'—',D.bm?MNL[dOf(D.bm.a).getMonth()]+' '+D.bm.a.slice(0,4)+' · '+Math.round(D.bm.q)+' h sold':'—',mName(TODAY)+' so far',D.curM.e!=null?Math.round(D.curM.e)+'%':'—',D.bm&&D.curM.e!=null?D.curM.e/D.bm.e:0,D.bm&&D.curM.q>=60&&D.curM.e>D.bm.e],
    ['Weeks in a row at your goal',D.best.n?D.best.n+' week'+(D.best.n===1?'':'s'):'—',D.best.n?fd(D.best.a)+' – '+fd(D.best.b)+(D.best.b.slice(0,4)!==TODAY.slice(0,4)?', '+D.best.b.slice(0,4):''):'Goal '+D.g+'% — not yet','Running now',D.run+' week'+(D.run===1?'':'s'),D.best.n?D.run/D.best.n:0,false],
    ['Days without a comeback',D.lg+' days',D.last?'Longest stretch · last one '+fd(D.last.d)+', '+D.last.r.no:'None on your work yet','Running now',D.since+' days',D.lg?D.since/D.lg:0,D.last&&D.since>=D.lg]];
  return C.map(c=>`<div class="cr-best"><small>${c[0]}</small><b>${c[1]}</b><span>${c[2]}</span><div class="now"><span class="b"><i class="${c[6]?'ok':''}" style="width:${Math.min(100,(c[5]||0)*100).toFixed(1)}%"></i></span><span class="t">${c[3]} <b>${c[4]}</b>${c[6]?'<span class="ib-k auto">New best</span>':''}</span></div></div>`).join(''); }
/* 2 · quote feedback */
function qGroups(){ const a=TSTART[U.who]||'2026-01-01', O=opsIn(a,TODAY), M=new Map();
  O.forEach(o=>{ const k=o.t==='diag'?'Diagnosis':cmpOf(o); if(!M.has(k)) M.set(k,[]); M.get(k).push(o); });
  return [...M.entries()].map(([n,L])=>({n,L,c:L.length,avg:sum(L,o=>o.b-o.q)/L.length,beat:L.filter(o=>o.b<=o.q).length,t:L[0].t})).filter(g=>g.c>=(TSTART[U.who]?2:4)).sort((p,q)=>q.avg-p.avg); }
function quoteCard(){ const G=qGroups(), top=G.slice(0,9), A=G.flatMap(g=>g.L), base=A.length?sum(A,o=>o.b-o.q)/A.length:0, isT=g=>g.avg>=.3&&g.avg-Math.max(0,base)>=.3, tight=G.filter(isT).slice(0,3), easy=G.filter(g=>g.beat/g.c>=.7).sort((p,q)=>q.beat/q.c-p.beat/p.c)[0];
  return `<div class="mg-card${hl('quote')}" data-sec="quote"><div class="mg-ch"><b>Quote feedback</b><small>${TSTART[U.who]?'since you started':'this year'} · your time against the quote, by job</small><span class="sp"></span><span class="mg-leg"><span><i class="cr-dl u"></i>Inside the quote</span><span><i class="cr-dl o"></i>Over it</span></span></div><div class="mg-cb">
    ${tight.length?`<div class="cr-pace">${ic('bulb',13)}<span>Quotes run tight for you on <b>${tight.map(g=>esc(g.n)).join('</b>, <b>').replace(/, <b>([^,]*)$/,' and <b>$1')}</b>${easy?` — and you beat <b>${esc(easy.n)}</b> ${easy.beat} of ${easy.c} times`:''}. ${base>=.25?` Most of your jobs run a little over — about ${hm(base)} — normal in the first months.`:''} Tell Frank and he takes it to the writers.</span></div>`:''}
    <div class="cr-qh"><span>Job</span><span class="st"><span>−2 h</span><span>quote</span><span>+2 h</span></span><span>Average</span><span>Beat it</span><span></span></div>
    ${top.map(g=>`<div class="cr-qr"><span class="n"><span class="cr-ty ${TYPE[g.t][1]}">${TYPE[g.t][0]}</span><b>${esc(g.n)}</b><small>${g.c}</small></span><span class="st"><em></em>${g.L.map(o=>{ const d=Math.max(-2,Math.min(2,o.b-o.q)); return `<i class="${o.b>o.q?'o':'u'}" style="left:${((d+2)/4*100).toFixed(1)}%"></i>`; }).join('')}<s style="left:${((Math.max(-2,Math.min(2,g.avg))+2)/4*100).toFixed(1)}%"></s></span><span class="m ${g.avg>0?sev(g.avg):'ok'}">${Math.round(g.avg*60)===0?'0:00':(g.avg>0?'+':'−')+hm(g.avg)}</span><span class="bt">${g.beat} of ${g.c}</span>${tight.includes(g)?`<button class="btn btn-sm" data-a="ask" data-n="${esc(g.n)}" data-v="${hm(g.avg)}" data-c="${g.c}">${ic('send',13)}Tell Frank</button>`:'<span></span>'}</div>`).join('')||'<div class="mg-none">Not enough jobs yet — this fills in after a few weeks.</div>'}
    ${G.length>top.length?`<div class="cr-qft">${G.length-top.length} more jobs, all closer to the quote. Each dot is one job; the bar is your average.</div>`:'<div class="cr-qft">Each dot is one job; the bar is your average.</div>'}</div></div>`; }
/* 5 · coaching notes */
function notesCard(){ const N=NOTES[U.who], g=N.goal, k=KM[g[0]], a=mStart(TODAY), raw=val(k,a,TODAY,FT()), v=k.tw!=null?raw/ctx(a,TODAY,FT()).wd:raw, ok=v==null?null:k.d>=0?v>=g[1]:v<=g[1], pct=k.d>=0?Math.min(1,(v||0)/g[1]):Math.min(1,g[1]/Math.max(v||.001,g[1])), fv=x=>k.tw!=null?h1(x)+' h a workday':fmt(k.u,x);
  return `<div class="mg-card${hl('notes')}" data-sec="notes"><div class="mg-ch"><b>Coaching notes</b><small>from Frank Delaney, shop foreman</small><span class="sp"></span><span class="cr-who">${ic('lock',11)}you, Frank and Ray</span></div><div class="mg-cb">
    <div class="cr-fg"><small>Goal from Frank · set ${fd(g[3])}</small><b>${k.id==='cb'?'Comebacks under '+fmt(k.u,g[1]):k.n+' to '+fv(g[1])} by ${fd(g[2])}</b><span class="b"><i class="${ok?'ok':'off'}" style="width:${(pct*100).toFixed(1)}%"></i></span><span class="m ${ok?'ok':'off'}">${fv(v)}<small>this month</small></span></div>
    ${N.L.map((n,i)=>{ const un=i===0&&!U.ack[n[0]]; return `<div class="cr-nt${un?' new':''}"><div class="h"><span class="tg-av">FD</span><b>Frank</b><small>${fd(n[1])}</small><span class="cr-tag">${n[3]}</span><span class="sp"></span>${un?'<span class="ib-k ask">New</span>':''}</div><p>${esc(n[2])}</p>${un?`<div class="r"><button class="btn btn-sm" data-a="toast" data-t="Your reply goes to Frank’s Inbox, on this note.">${ic('chat',13)}Reply</button><button class="btn btn-sm btn-primary" data-a="ack" data-k="${n[0]}">${ic('check',13)}Got it</button></div>`:`<div class="seen">${ic('check',11)}${i===0?'You saw it just now':'You saw it '+fd(addD(n[1],1))}</div>`}</div>`; }).join('')}</div></div>`; }
/* 6 · skills and training */
function skillCard(){ const S=SKL[U.who];
  return `<div class="mg-card${hl('skills')}" data-sec="skills"><div class="mg-ch"><b>Skills &amp; training</b><small>Frank sees these when he hands out work</small></div><div class="mg-cb">${S.L.map(s=>`<div class="cr-sk"><span class="gi ${s[1]}">${ic(s[1]==='ok'?'check':s[1]==='warn'?'flag':s[1]==='prog'?'book':'plus',13)}</span><span class="n"><b>${s[0]}</b><small class="${s[1]}">${s[2]}</small></span>${s[1]==='prog'?`<span class="b"><i style="width:${s[3]}%"></i></span>`:s[1]==='warn'?'<button class="btn btn-sm" data-a="toast" data-t="Asked Frank to book the ASE retest — it’s in his Inbox.">Book the retest</button>':s[1]==='none'?'<button class="btn btn-sm" data-a="toast" data-t="Asked Frank for a seat in the November class.">Ask for a seat</button>':''}</div>`).join('')}
    <div class="cr-next">${ic('clock',13)}<span>Next: <b>${S.next[0]}</b> · ${S.next[1]}</span></div>
    <button class="cr-add" data-a="toast" data-t="Add a photo of the certificate — Frank confirms it, then it shows here.">${ic('plus',13)}Add a certificate</button></div></div>`; }
/* 7 · fixes you wrote */
function fixCard(){ const L=FXW[U.who], used=sum(L,f=>f[2]), held=sum(L,f=>f[3]), sv=sum(L,f=>f[5]);
  return `<div class="mg-card${hl('fixw')}" data-sec="fixw"><div class="mg-ch"><b>Fixes you wrote</b><small>when others use them, it shows here</small><span class="sp"></span>${L.length?`<span class="cr-fxs"><b>${used}</b> uses · <b>${held}</b> held · <b>${h1(sv)} h</b> saved others</span>`:''}</div><div class="mg-cb">${L.length?`<div class="cr-fh"><span>Fix</span><span>Used by</span><span>Used</span><span>Held</span><span>Saved</span></div>`+L.map(f=>`<button class="cr-fr" data-a="toast" data-t="In Parsec this opens the fix in Fixes."><span class="n">${ic('fixes',14)}<b>${esc(f[0])}</b><small>written ${fd(f[1])}${f[1].slice(0,4)!==TODAY.slice(0,4)?', '+f[1].slice(0,4):''}</small></span><span class="by">${f[4]}</span><span class="m">${f[2]}×</span><span class="m ${f[3]<f[2]?'mid':'ok'}">${f[3]} of ${f[2]}</span><span class="m">${h1(f[5])} h</span></button>`).join('')+`<div class="cr-qft">Held — the truck didn’t come back with the same complaint within 30 days. Saved — quoted minus clocked on the jobs that used it.</div>`:`<div class="mg-none">No fixes yet. When a job teaches you something, write it up in Fixes — it shows here each time someone uses it.</div><button class="cr-add" data-a="toast" data-t="In Parsec this opens Fixes with a new fix from your last RO.">${ic('plus',13)}Write a fix from your last job</button>`}</div></div>`; }
/* 10 · the statement — numbers only, nothing private */
function stmtWin(){ const s=U.stmt; if(s==='12'){ const a=addM(mStart(TODAY),-11); return [a,TODAY,'Last 12 months · '+MN[dOf(a).getMonth()]+' '+a.slice(0,4)+' – '+fd(TODAY)+', '+TODAY.slice(0,4)]; } if(s==='yr'){ const a=TSTART[U.who]||'2026-01-01'; return [a,TODAY,'This year · '+fd(a)+' – '+fd(TODAY)+', '+TODAY.slice(0,4)]; } const P0=U.usePrior&&U.prior[U.who]; return [tStart(),TODAY,'All time · since '+(P0?P0.from:SINCE[U.who])]; }
function stmtSheet(){ const [a,b,lab]=stmtWin(), F_=FT(), X=ctx(a,b,F_), q=sum(X.ops,o=>o.q), bb=sum(X.ops,o=>o.b), ro=new Set(X.ops.map(o=>o.r)).size, ovq=sum(X.ops,over), days=daysIn(a,b), P0=U.stmt==='all'&&U.usePrior&&U.prior[U.who]?U.prior[U.who]:null, g=PG[U.who], n=v=>Math.round(v).toLocaleString(), st=P0?'*':'';
  const E=(q+(P0?P0.q:0))/((bb+(P0?P0.b:0))||1)*100;
  const T=[['ROs worked',n(ro+(P0?P0.ro:0))+st],['Hours sold',n(q+(P0?P0.q:0))+' h'+st],['Hours clocked',n(bb+(P0?P0.b:0))+' h'+st],['Efficiency',fmt('pct',E)+st,'goal '+g.eff+'%',E>=g.eff],['Productivity',fmt('pct',val(KM.prod,a,b,F_)),'goal '+g.prod+'%',val(KM.prod,a,b,F_)>=g.prod],['Days worked',n(days+(P0?P0.d:0))+st],['Comeback rate',fmt('pct',val(KM.cb,a,b,F_)),'goal under '+g.cb+'%',val(KM.cb,a,b,F_)<=g.cb],['Past fix used',fmt('pct',val(KM.fx,a,b,F_)),'shop '+fmt('pct',val(KM.fx,a,b))]];
  const rows=[]; if(U.stmt==='all'){ if(P0) rows.push([P0.from.slice(-4)+' – '+P0.to.slice(-4)+' · by hand',P0.q,P0.q/P0.b*100]); for(let y=+tStart().slice(0,4);y<=+TODAY.slice(0,4);y++){ const ya=y+'-01-01'<tStart()?tStart():y+'-01-01', yb_=minK(y+'-12-31',TODAY), O=ctx(ya,yb_,F_).ops, qq=sum(O,o=>o.q), b2=sum(O,o=>o.b); rows.push([String(y)+(yb_===TODAY?' to date':''),qq,b2?qq/b2*100:null]); } }
  else for(let m=mStart(a);m<=TODAY;m=addM(m,1)){ if(m<mStart(tStart())) continue; const O=ctx(m<a?a:m,minK(mEnd(m),TODAY),F_).ops, qq=sum(O,o=>o.q), b2=sum(O,o=>o.b); rows.push([MNL[dOf(m).getMonth()]+' '+m.slice(0,4)+(mEnd(m)>TODAY?' to date':''),qq,b2?qq/b2*100:null]); }
  const D=bestsData(), L=FXW[U.who], S=SKL[U.who].L.filter(s=>s[1]==='ok'||s[1]==='warn');
  return `<div class="mg-rep"><div class="mg-repbar"><b>Statement</b><span class="tg-seg3">${[['yr','This year'],['12','Last 12 months'],['all','All time']].map(x=>`<button class="${U.stmt===x[0]?'on':''}" data-a="stmtp" data-v="${x[0]}">${x[1]}</button>`).join('')}</span><span style="font-size:12.5px;color:var(--tg-ink3)">Your work record for a review or a new job — numbers only, nothing private.</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Sent to the printer — one page.">${ic('print',14)}Print</button><button class="btn btn-sm btn-primary" data-a="toast" data-t="Saved — “${PPL[U.who]} work record.pdf”.">${ic('download',14)}Save as PDF</button><button class="btn btn-sm ib" data-a="stmtx" title="Close (Esc)">${ic('x',14)}</button></div>
   <div class="mg-repsc"><div class="mg-sheet cr-sheet"><div class="sh-h"><span class="lg">${LOGO}</span><div><h3>Work record · ${PPL[U.who]}</h3><small>Technician · Vanguard Truck Center, Greensboro · since ${SINCE[U.who]}</small></div><small class="pp">${lab}<br>From Parsec · printed ${fd(TODAY)}, ${TODAY.slice(0,4)}</small></div>
    <h4>The numbers</h4><div class="sh-g">${T.map(t=>`<div class="rt"><small>${t[0]}</small><b>${t[1]}</b>${t[2]?`<em class="${t[3]==null?'':t[3]?'ok':'off'}">${t[3]?'✓ ':''}${t[2]}</em>`:'<em>&nbsp;</em>'}</div>`).join('')}</div>
    <div class="sh-2"><div><h4>${U.stmt==='all'?'Year by year':'Month by month'}</h4><div class="cr-mt"><span>Period</span><span>Hours sold</span><span>Efficiency</span></div>${rows.map(r=>`<div class="cr-mt"><span>${r[0]}</span><b>${n(r[1])} h</b><b class="${r[2]==null?'':r[2]>=g.eff?'ok':'off'}">${fmt('pct',r[2])}${r[2]!=null&&r[2]>=g.eff?' ✓':''}</b></div>`).join('')}</div>
     <div><h4>Bests</h4>${D.bw?`<div class="ln"><span>Best week · efficiency</span><b>${Math.round(D.bw.e)}% · ${fd(D.bw.a)}</b></div>`:''}${D.bh?`<div class="ln"><span>Most hours sold in a week</span><b>${h1(D.bh.q)} h</b></div>`:''}${D.best.n?`<div class="ln"><span>Weeks in a row at goal</span><b>${D.best.n}</b></div>`:''}<div class="ln"><span>Longest without a comeback</span><b>${D.lg} days</b></div>
      <h4>Certificates</h4>${S.map(s=>`<div class="ln"><span>${s[0]}</span><b style="font-family:var(--tg-sans);font-weight:400;color:#67625A">${s[2].replace(/ — in \d+ days/,'')}</b></div>`).join('')}
      <h4>Fixes written</h4>${L.length?`<div class="ln"><span>${L.length} fix${L.length===1?'':'es'} in Fixes</span><b>used ${sum(L,f=>f[2])}× · held ${sum(L,f=>f[3])}</b></div>`:'<div class="ln"><span>None yet</span></div>'}</div></div>
    <div class="cr-sig"><div><span></span><small>Frank Delaney · shop foreman</small></div><div><span></span><small>Ray Holloway · service manager</small></div></div>
    <p class="cr-fn">${P0?'* Includes '+P0.from.slice(-4)+' – '+P0.to.slice(-4)+', entered by hand from old time sheets and confirmed by Ray Holloway. ':''}From Parsec. Pay and coaching notes are never on the statement.</p></div></div></div>`; }
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
  return `<section class="tg-list"><div class="tg-lh">Your ROs<span class="n">${n}</span></div><div class="ib-lh2"><small style="font-size:12px;color:var(--tg-ink3)">${per(U.p).n} · ${per(U.p).s}</small></div><div class="tg-scroll">${G.map(([g,L])=>`<div class="tg-grp">${g}<span>${L.length}</span></div>`+L.map(it).join('')).join('')||'<div class="tg-empty"><h3>Nothing here</h3><p>No ROs with your time in this period.</p></div>'}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('1')}–${kbd('3')}views</span><span>${kbd('D')}${kbd('W')}${kbd('M')}${kbd('Q')}${kbd('Y')}${kbd('A')}period</span></div></section>`; }
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
