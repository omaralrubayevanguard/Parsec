const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const p2=n=>String(n).padStart(2,'0');
const h1=n=>(Math.round(n*10)/10).toFixed(1);
const sum=(L,f)=>L.reduce((s,x)=>s+f(x),0);
/* ---------- the day: Thursday, October 22, 2026 — it is 2:15 pm ---------- */
const NOW0=14*60+15, T0=Date.now();
const nowM=()=>NOW0+(Date.now()-T0)/60000;
const clk=m=>{ m=Math.floor(m); const h=Math.floor(m/60)%24, mm=m%60; return (h%12||12)+':'+p2(mm)+(h<12?' am':' pm'); };
const hhmm=m=>{ m=Math.floor(m); return p2(Math.floor(m/60))+':'+p2(m%60); };
const dur=m=>{ m=Math.max(0,Math.floor(m)); return Math.floor(m/60)+':'+p2(m%60); };
const hms=m=>{ const s=Math.max(0,Math.floor(m*60)); return Math.floor(s/3600)+':'+p2(Math.floor(s/60)%60)+':'+p2(s%60); };
const hmH=h=>dur(h*60);
const PPL={RH:'Ray Holloway',FD:'Frank Delaney',AM:'Alicia Moore',BO:'Ben Okafor',GP:'Grace Park',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran',VO:'Volvo tech support'};
const F=k=>PPL[k].split(' ')[0];
const TYPE={diag:['DIAG','dg'],rep:['OP','op'],pm:['PM','pm'],war:['WARR','wa']};
const lostOf=o=>o.b-o.q, sev=l=>l<=0?'ok':l<=.5?'low':l<=1.5?'mid':'high';
const SHOPW=['Clean bay','Training','Tool maintenance','Shop truck'];
const GOAL=7.5;
/* Mike’s work — the op he’s on, Frank’s order for today, what’s waiting, what’s done */
const OPS0=[
 {id:'o1',no:'37590',cust:'Silverline LTL',truck:'2019 VNL 760',unit:'212',spot:'Bay 6',t:'rep',cmp:'Clean DPF and replace DPF pressure sensor',q:2.8,b0:0,st:'next',ord:0,sr:'Repairing',
  parts:[['DPF pressure sensor','22303390',1,'pick'],['DPF gasket kit','21982465',1,'pick'],['Exhaust clamp','20545364',2,'pick']],
  notes:[['1:26 pm','Pulled the DPF and put it on the cleaning machine.']],
  fix:{t:'DPF pressure sensor — fault code',by:'DK',at:'Jun 2, 2026',held:'9 of 9',save:'0:36',steps:['Check both sensor hoses for soot and cracks before replacing the sensor.','Clear codes, then run a parked regen and watch delta-P stay under 1.5 kPa at idle.']}},
 {id:'o2',no:'37750',cust:'Yadkin Valley Freight',truck:'2021 VNL 860',unit:'48',spot:'Yard C3',t:'rep',cmp:'A/C not cooling — compressor clutch',q:2.6,b0:0,st:'next',ord:1,
  why:'Luis found the clutch coil open this morning. The customer approved at 1:40 pm.',tags:[['ok','Approved 1:40 pm'],['pt','Parts staged']],
  parts:[['A/C compressor clutch','21366987',1,'staged'],['O-ring kit','20412298',1,'staged'],['Refrigerant R-134a','',4,'stock']]},
 {id:'o3',no:'37755',cust:'Copperline Transport',truck:'2022 VNL 760',unit:'1107',spot:'Bay 4',t:'pm',cmp:'PM service — B',q:2.2,b0:0,st:'next',ord:2,
  why:'Checked in at 7:40 am. Frank moved it to Bay 4 for you.',tags:[['in','In Bay 4']],parts:[['PM kit — B','PMK-B-D13',1,'staged'],['Engine oil 15W-40','',11,'stock']]},
 {id:'o4',no:'37762',cust:'Keystone Carriers',truck:'2020 VNL 760',unit:'560',spot:'Yard A7',t:'diag',cmp:'Air leak — tractor protection valve',q:1.0,b0:0,st:'next',ord:3,
  why:'Driver says the trailer supply pops out on hills. Still in the yard.',tags:[['yd','Yard A7']],parts:[]},
 {id:'o5',no:'37628',cust:'Prairie Line Trucking',truck:'2019 VNL 760',unit:'77',spot:'Bay 2',t:'rep',cmp:'Turbo actuator fault — low boost',q:2.5,b0:0,st:'wait',
  hold:{k:'Parts',who:'BO',at:'11:40 am',txt:'Turbo actuator ordered — due tomorrow, 10:00 am.',left:'due Fri 10:00'},parts:[['Turbo actuator','23390843',1,'ordered']]},
 {id:'o6',no:'37544',cust:'Copperline Transport',truck:'2018 VNL 670',unit:'1042',spot:'Bay 8',t:'diag',cmp:'EGR valve stuck — derate',q:1.5,b0:2.0,st:'wait',
  hold:{k:'Tech support',who:'VO',at:'Wed 2:40 pm',txt:'Volvo case 6-118442 — valve sticking at 40%, waiting on their answer.',left:'23 h'},parts:[]},
 {id:'o7',no:'37716',cust:'Dixie Fleet Services',truck:'2020 VNL 860',unit:'305',spot:'Yard B2',t:'rep',cmp:'Wheel seal leaking — steer axle, right',q:1.8,b0:0,st:'wait',
  hold:{k:'Approval',who:'AM',at:'11:20 am',txt:'Alicia sent the estimate — $612. No answer yet.',left:'2 h 55 m'},parts:[['Wheel seal','21045770',1,'stock']]},
 {id:'o8',no:'37612',cust:'Midway Auto Transport',truck:'2017 VNL 670',unit:'19',t:'rep',cmp:'Wheel seal leaking — drive axle, left rear',q:2.4,b0:1.8,st:'done',at:'8:52 am',
  notes:[['8:50 am','Replaced wheel seal and both shoes on that end, refilled hub.']],parts:[['Wheel seal','21045771',1,'pick'],['Brake shoe kit','85134427',1,'pick']]},
 {id:'o9',no:'37628',cust:'Prairie Line Trucking',truck:'2019 VNL 760',unit:'77',t:'diag',cmp:'Diagnosis — low boost',q:1.8,b0:2.07,st:'done',at:'11:24 am',
  notes:[['11:20 am','Actuator sticking at 60% — ordered a new actuator.']],parts:[]},
 {id:'o10',no:'37502',cust:'Piedmont Aggregates',truck:'2018 VNL 670',unit:'33',t:'rep',cmp:'Check engine light — outlet NOx sensor',q:1.0,b0:1.08,st:'done',at:'1:10 pm',
  notes:[['1:08 pm','Replaced outlet NOx sensor, ran a parked regen, no return.']],parts:[['Outlet NOx sensor','22827993',1,'pick']]}];
/* punches today [start, end, what, kind]; the running one has no end */
const DAY0={sh:[[418,690],[720,null]],p:[[424,532,'37612','job'],[560,684,'37628','job'],[725,790,'37502','job'],[790,804,'Clean bay','shop'],[804,null,'37590','job']]};
const CHK=[['c1','timelog','Wed Oct 21 · punches overlap 7 min','37455 ran to 10:12 while 37011 started at 10:05.','Fix the overlap'],['c2','clock','Mon Oct 19 · no clock out','On the clock since 7:00 am — set when you left.','Set 3:24 pm']];
/* the shop, right now */
const TEAM=[
 {k:'MR',st:'job',no:'37590',cmp:'Clean DPF and replace DPF pressure sensor',since:804,q:2.8,b0:0,day:'6:47',eff:105},
 {k:'DK',st:'job',no:'37731',cmp:'Clutch slipping — replace clutch',since:725,q:6.0,b0:1.4,day:'6:58',eff:98},
 {k:'KT',st:'job',no:'37466',cmp:'Misfire cylinder 4 — injector',since:782,q:2.0,b0:0,day:'7:05',eff:110},
 {k:'AW',st:'job',no:'37388',cmp:'DEF doser clogged — derate',since:730,q:1.6,b0:0.4,day:'6:40',eff:86},
 {k:'PS',st:'air',since:833,txt:'Not on a job',day:'6:55',eff:112},
 {k:'LM',st:'out',txt:'Appointment · back 3:00 pm',day:'4:58',eff:101}];
const STG=['Check-in','Diag','Approval','Parts','Repair','Road test','Close-out'];
/* [RO, customer, tech, stage, state, label, days open] */
const BOARD=[
 ['37590','Silverline LTL','MR',4,'work','Repairing',2],['37750','Yadkin Valley Freight','MR',4,'next','Approved — next for Mike',1],['37755','Copperline Transport','MR',0,'next','Checked in · Bay 4',0],['37762','Keystone Carriers','MR',1,'next','Waiting diag · yard',0],
 ['37628','Prairie Line Trucking','MR',3,'wait','Parts · due Fri 10:00',2],['37544','Copperline Transport','MR',1,'wait','Tech support · 23 h',3],['37716','Dixie Fleet Services','MR',2,'wait','Approval · sent 11:20 am',1],
 ['37731','Iron Horse Logistics','DK',4,'work','Repairing',3],['37742','Rowan Ready Mix','DK',3,'wait','Parts · purge valve',2],['37388','Elkin Hardwoods','AW',4,'work','Repairing',2],
 ['37466','Uwharrie Fuel','KT',4,'work','Repairing',4],['37480','Yadkin Valley Dairy','KT',1,'wait','With Frank · second opinion',1],['37320','Rockingham Lumber','KT',3,'wait','Parts · backordered',6],
 ['37203','Surry Feed & Seed','LM',4,'pause','Paused — Luis back at 3:00',5],['37601','Midway Auto Transport','PS',5,'work','Road test',1],['37701','Triad Cold Chain','PS',6,'next','Ready to close',3],
 ['37795','Haw River Dairy','',0,'next','Checked in · yard',0],['37802','Catawba Timber','',2,'wait','Approval · sent 9:05 am',1]];
/* v2 — photos and codes on each op [dash picture, pictures, DTC files] */
const PH0={o1:[1,2,0],o2:[0,0,0],o3:[1,0,0],o4:[0,0,0],o5:[1,3,1],o6:[1,1,1],o7:[1,2,0],o8:[1,4,0],o9:[1,2,1],o10:[1,1,1]};
const KEYS={'37590':'30','37612':'18','37502':'41','37628':'22'};
/* the morning, before Mike clocks in */
const MORN={at:'6:56 am',set:'6:52 am',order:[['37612','Midway Auto Transport','Wheel seal leaking — drive axle, left rear','rep',2.4,'Bay 2','Parts staged'],['37628','Prairie Line Trucking','Diagnosis — low boost','diag',1.8,'Bay 3',''],['37502','Piedmont Aggregates','Check engine light — outlet NOx sensor','rep',1.0,'Yard B4','Parts staged'],['37590','Silverline LTL','Clean DPF and replace DPF pressure sensor','rep',2.8,'Bay 6','']],more:3,staged:[['37612','Wheel seal · brake shoe kit'],['37502','Outlet NOx sensor']],waiting:3,inbox:3};
