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

