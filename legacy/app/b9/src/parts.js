
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const p2=n=>String(n).padStart(2,'0');
const hm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const usd=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=n=>'$'+Math.round(n).toLocaleString('en-US');
/* today is Thu Oct 22 2026, 14:15 */
const NOW=14*60+15, TODAY='2026-10-22';
const DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const short=k=>{ const d=dOf(k); return DN[d.getDay()]+' '+(d.getMonth()+1)+'/'+d.getDate(); };
const md=k=>{ const d=dOf(k); return (d.getMonth()+1)+'/'+d.getDate(); };
const dd=(a,b)=>Math.round((dOf(b)-dOf(a))/86400000);
const PPL={AM:'Alicia Moore',JT:'Jordan Tate',FD:'Frank Delaney',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
const F=k=>PPL[k].split(' ')[0];
const lc=s=>/^[A-Z][a-z]/.test(s)?s[0].toLowerCase()+s.slice(1):s;
const SUP={pdc:'Volvo PDC',vor:'PDC rush',fp:'FleetPride',stock:'Stock'};
/* the catalog: what the shop keeps, where it sits, what it costs */
const CAT0=[
 ['22411521','A/C compressor',0,'',1186.40,'D13 · VNL · 2018–21',0],['21877394','Receiver drier',2,'D1',88.50,'VNL · 2018–23',2],['20532195','O-ring kit, A/C',6,'D1',12.40,'All models',4],
 ['22479124','Injector',1,'E2',684.00,'D13 · 2017+',2],['23295841','DEF doser',0,'',742.18,'D13 · 2019+',0],['21512367','Doser gasket',4,'C5',9.60,'D13',4],
 ['21531071','Coolant temp sensor',2,'B2',64.20,'D11 · D13',2],['21789944','Connector pigtail, 2-pin',0,'',38.75,'All models',2],['22972342','Turbo actuator',0,'',1348.00,'D13 TC · 2019+',0],
 ['21399788','Radiator',0,'',2214.00,'VNL · 2018–22',0],['23137410','EGR valve',0,'',968.00,'D13 · 2017–21',0],['21620181','Purge valve, air dryer',1,'C1',142.60,'All models',1],
 ['20972915','Air dryer cartridge',3,'C1',96.30,'All models',2],['21468475','Water pump',0,'',398.70,'D13 · 2017+',1],['20734264','Water pump gasket',5,'B4',14.20,'D13',2],
 ['85137802','Brake shoe kit, 16.5 × 7',0,'',192.00,'Q+ drum brakes',2],['85131923','Brake drum, 16.5 × 7',2,'G1',178.00,'Q+ drum brakes',2],['85137815','Brake hardware kit',4,'G2',24.80,'Q+ drum brakes',4],
 ['21751883','EGR cooler gasket kit',0,'',46.90,'D13 · 2017–21',0],['22088425','Starter',1,'E4',486.00,'D13',1],['21707133','Oil filter',14,'F1',28.40,'D13',12],['21380475','Fuel filter',9,'F1',34.60,'D13',12],['23223434','Coolant filter',7,'F2',22.10,'D11 · D13',6],
 ['85023114','Clutch kit, 15.5"',0,'',1642.00,'I-Shift · manual 2017+',0],['21302012','Release bearing',1,'E5',214.50,'Manual 2017+',1],['22770789','DPF pressure sensor',0,'',186.40,'D13 · 2017+',1],['82491362','Headlamp, left',0,'',628.00,'VNL · 2018+',0],['21479093','DPF gasket kit',3,'C3',38.20,'D13 · 2017+',2],['22325227','Fuel pump',0,'',412.00,'D13 · 2017+',0],['85134770','Brake chamber, type 30/30',6,'G3',96.80,'All models',2],['23175123','Alternator 24V 130A',0,'',512.00,'D13 · 2017+',0],['20750712','PAG oil, 8 oz',12,'D2',18.90,'A/C systems',6],['21813012','Expansion valve',1,'D1',146.20,'VNL · 2018–23',1]
].map(x=>({pn:x[0],desc:x[1],oh:x[2],bin:x[3],price:x[4],fit:x[5],min:x[6]}));
const KITS0=[{pn:'PMK-D13',desc:'PM kit — D13',fit:'D13 · every 35k mi',kids:[['21707133',2],['21380475',2],['23223434',1]]},{pn:'BRK-Q165',desc:'Brake job — one axle',fit:'Q+ drum brakes',kids:[['85137802',2],['85131923',2],['85137815',2]]}];
let S,U,UNDO,TOAST,TT;
const cat=pn=>S.C.find(c=>c.pn===pn);
let PID=0;
const pt=(pn,qty,o)=>{ const c=CAT0.find(x=>x.pn===pn); return Object.assign({id:'p'+(++PID),pn,desc:c.desc,qty,price:c.price,st:'Not Ordered'},o||{}); };
function seed(){
  PID=0;
  return [
   {no:'37750',cust:'Yadkin Valley Freight',unit:'T-118',veh:'2020 Volvo VNL 760',eng:'D13',vin:'…LN227310',spot:'L4',tech:'LM',wr:'AM',route:{from:'AM',at:832,why:'Approved — order parts'},
    ops:[{cmp:'A/C not cooling — compressor clutch',parts:[pt('22411521',1),pt('21877394',1),pt('20532195',1)]}],log:[['10/22 13:52','<b>Alicia</b> → Parts · Approved — order parts'],['10/22 11:05','Customer approved the estimate · $1,940']]},
   {no:'37466',cust:'Uwharrie Fuel',unit:'U-07',veh:'2019 Volvo VNL 860',eng:'D13',vin:'…KN204417',spot:'B6',tech:'PS',wr:'JT',route:{from:'PS',at:842,why:'Injector — cylinder 4',now:1,phone:1,note:'Cut-out test failed on 4. Need the injector to finish before 3.'},
    ops:[{cmp:'Misfire cylinder 4 — injector',parts:[pt('22479124',1)]}],log:[['10/22 14:02','<b>Priya</b> asked from her phone · injector, cylinder 4'],['10/22 13:30','Cylinder cut-out test failed on 4']]},
   {no:'37688',cust:'Sandhills Grain',unit:'SG-5',veh:'2021 Volvo VNL 760',eng:'D13',vin:'…MN290417',spot:'B3',tech:'AW',wr:'JT',route:{from:'AW',at:851,why:'Brake chamber 30/30 — left rear',now:1,phone:1,photo:1,note:'Left rear drive chamber is cracked. One 30/30 please.'},
    ops:[{cmp:'Air leak — left rear brake chamber',parts:[pt('85134770',1)]}],log:[['10/22 14:11','<b>Andre</b> asked from his phone · brake chamber 30/30 · photo']]},
   {no:'37388',cust:'Elkin Hardwoods',unit:'EH-22',veh:'2021 Volvo VNR 640',eng:'D13',vin:'…MN310982',spot:'L9',tech:'DK',wr:'AM',appr:700,
    ops:[{cmp:'DEF doser clogged — derate',parts:[pt('23295841',1),pt('21512367',1)]}],log:[['10/22 11:40','<b>Alicia</b> → Parts · Approved — order parts · accepted']]},
   {no:'37519',cust:'Dixie Fleet Services',unit:'D-341',veh:'2018 Volvo VNL 670',eng:'D13',vin:'…JN198004',spot:'L2',tech:'MR',wr:'JT',appr:615,
    ops:[{cmp:'Coolant temp sensor — erratic reading',parts:[pt('21531071',1),pt('21789944',1)]}],log:[['10/22 10:15','<b>Jordan</b> → Parts · Approved — order parts · accepted']]},
   {no:'37203',cust:'Surry Feed & Seed',unit:'SF-3',veh:'2019 Volvo VNL 760',eng:'D13',vin:'…KN266120',spot:'B9',tech:'LM',wr:'AM',bay:'2026-10-19',
    ops:[{cmp:'Radiator leak — lower tank',parts:[pt('21399788',1,{st:'Backordered',sup:'pdc',po:'55762',ord:'2026-10-19',eta:null})]}],log:[['10/20 08:10','Volvo PDC: radiator backordered, no date'],['10/19 15:20','Ordered · PO 55762 · Volvo PDC'],['10/19 14:55','Radiator out — truck stays in B9']],told:'10/20'},
   {no:'37628',cust:'Prairie Line Trucking',unit:'412',veh:'2019 Volvo VNL 860',eng:'D13 TC',vin:'…KN281460',spot:'L12',tech:'MR',wr:'JT',
    ops:[{cmp:'Turbo actuator fault — low boost',parts:[pt('22972342',1,{st:'Ordered',sup:'pdc',po:'55790',ord:'2026-10-20',eta:'2026-10-21'})]}],log:[['10/20 11:40','Ordered · PO 55790 · Volvo PDC · due Wed 10/21'],['10/20 11:24','Mike stopped · Waiting – Parts']],told:'10/20'},
   {no:'37544',cust:'Copperline Transport',unit:'C-55',veh:'2018 Volvo VNL 760',eng:'D13',vin:'…JN173385',spot:'L3',tech:'AW',wr:'AM',
    ops:[{cmp:'EGR valve stuck — derate',parts:[pt('23137410',1,{st:'Ordered',sup:'pdc',po:'55711',ord:'2026-10-15',eta:null})]}],log:[['10/15 16:05','Ordered · PO 55711 · Volvo PDC · no date given']]},
   {no:'37742',cust:'Rowan Ready Mix',unit:'RM-9',veh:'2020 Volvo VHD',eng:'D11',vin:'…LN240051',spot:'L5',tech:'DK',wr:'JT',
    ops:[{cmp:'Air dryer purging constantly',parts:[pt('21620181',1,{st:'Staged',sup:'pdc',po:'55801',ord:'2026-10-21',eta:'2026-10-22',bin:'A3',rcv:460}),pt('20972915',1,{st:'Staged',sup:'stock',bin:'A3',rcv:462})]}],log:[['10/22 07:42','Checked in · bin A3 · all parts in'],['10/21 09:30','Ordered · PO 55801 · Volvo PDC']]},
   {no:'37455',cust:'Highplains Grain',unit:'HG-14',veh:'2021 Volvo VNL 760',eng:'D13',vin:'…MN288713',spot:'L8',tech:'AW',wr:'AM',
    ops:[{cmp:'Coolant leak at water pump',parts:[pt('21468475',1,{st:'Received',sup:'pdc',po:'55803',ord:'2026-10-21',eta:'2026-10-22',rcv:461}),pt('20734264',1,{st:'Staged',sup:'stock',bin:'A4',rcv:463})]}],log:[['10/22 07:43','Gasket pulled from stock · bin A4'],['10/22 07:41','Water pump checked in at receiving · no bin yet'],['10/21 10:10','Ordered · PO 55803 · Volvo PDC']]},
   {no:'37720',cust:'Keystone Carriers',unit:'K-201',veh:'2022 Volvo VNL 860',eng:'D13',vin:'…NN301776',spot:'L1',tech:'DK',wr:'JT',
    ops:[{cmp:'Brakes at 40% — drive axle shoes and drums',parts:[pt('85137802',2,{st:'Ordered',sup:'pdc',po:'55822',ord:'2026-10-21',eta:'2026-10-22'}),pt('85131923',2,{st:'Staged',sup:'stock',bin:'A2',rcv:610}),pt('85137815',2,{st:'Staged',sup:'stock',bin:'A2',rcv:611})]}],log:[['10/22 10:11','Drums and hardware pulled from stock · bin A2'],['10/21 15:30','Ordered shoes · PO 55822 · Volvo PDC · due today']]},
   {no:'37011',cust:'Red Mesa Hauling',unit:'RMH-6',veh:'2019 Volvo VNL 760',eng:'D13',vin:'…KN259903',spot:'L6',tech:'PS',wr:'AM',jt:'RECALL',
    ops:[{cmp:'Recall 24V-118 — EGR cooler inspection',parts:[pt('21751883',1,{st:'Ordered',sup:'pdc',po:'55818',ord:'2026-10-21',eta:'2026-10-22',price:0})]}],log:[['10/21 13:00','Ordered · PO 55818 · Volvo PDC · recall, no charge']]},
   {no:'37660',cust:'Mount Airy Logistics',unit:'MA-40',veh:'2018 Volvo VNL 670',eng:'D13',vin:'…JN171290',spot:'L10',tech:'KT',wr:'JT',
    ops:[{cmp:'Clutch slipping — replace clutch',parts:[pt('85023114',1,{st:'Ordered',sup:'vor',po:'55826',ord:'2026-10-22',eta:'2026-10-23'}),pt('21302012',1,{st:'Staged',sup:'stock',bin:'A5',rcv:575})]}],log:[['10/22 09:35','Clutch kit on rush · PO 55826 · due Fri 10/23 07:00'],['10/22 09:35','Release bearing pulled from stock · bin A5']]},
   {no:'37602',cust:'Triad Cold Chain',unit:'T-412',veh:'2021 Volvo VNL 760',eng:'D13 TC',vin:'…MN281460',spot:'L11',tech:'MR',wr:'AM',
    ops:[{cmp:'DPF pressure sensor — fault code',parts:[pt('22770789',1,{st:'Ordered',sup:'pdc',po:'55824',ord:'2026-10-22',eta:'2026-10-26'})]}],log:[['10/22 08:50','Ordered · PO 55824 · Volvo PDC · due Mon 10/26']]},
   {no:'37593',cust:'Catawba Timber',unit:'CT-8',veh:'2019 Volvo VNL 860',eng:'D13',vin:'…KN233017',spot:'L7',tech:'PS',wr:'JT',
    ops:[{cmp:'Headlamp out — housing cracked, left',parts:[pt('82491362',1,{st:'Ordered',sup:'pdc',po:'55819',ord:'2026-10-21',eta:'2026-10-27'})]}],log:[['10/21 14:10','Ordered · PO 55819 · Volvo PDC · due Tue 10/27']]},
   {no:'37590',cust:'Silverline LTL',unit:'S-220',veh:'2020 Volvo VNL 760',eng:'D13',vin:'…LN230558',spot:'B7',tech:'MR',wr:'AM',
    ops:[{cmp:'Clean DPF and replace DPF pressure sensor',parts:[pt('22770789',1,{st:'Picked up',sup:'stock',bin:'',rcv:610,pk:800}),pt('21479093',1,{st:'Installed',sup:'stock',bin:'',rcv:610,pk:800})]}],log:[['10/22 13:20','<b>Mike</b> picked up bin A6 · sensor and gasket kit'],['10/22 10:10','Pulled from stock · bin A6']]},
   {no:'35915',cust:'Silverline LTL',unit:'S-114',veh:'2019 Volvo VNL 760',eng:'D13',vin:'…KN205561',spot:'—',tech:'AW',wr:'AM',ops:[],log:[['09/21 15:30','Failed part tagged FP-1003 · shelf W1 · hold for Volvo until 10/21']]},
   {no:'37555',cust:'Piedmont Aggregates',unit:'PA-31',veh:'2018 Volvo VHD',eng:'D11',vin:'…JN188254',spot:'—',tech:'DK',wr:'JT',ops:[],log:[['10/21 16:05','Customer declined the fuel pump job — pump came back to Parts · shelf R1'],['10/20 09:10','Ordered · PO 55796 · Volvo PDC']]},
   {no:'37771',cust:'Northline Transport',unit:'N-88',veh:'2020 Volvo VNL 760',eng:'D13',vin:'…LN219044',spot:'—',tech:'AW',wr:'AM',ops:[],log:[['10/21 09:00','Volvo asked for the water pump back · RA 88213'],['10/14 15:10','Failed part tagged FP-1001 · shelf W3']]},
   {no:'37480',cust:'Yadkin Valley Dairy',unit:'YD-2',veh:'2018 Volvo VNL 670',eng:'D13',vin:'…JN160327',spot:'—',tech:'KT',wr:'JT',ops:[],log:[['10/20 16:40','Starter replaced · core on shelf K2 · $95 core charge']]}
  ];
}
function seedT(){ return [
 {id:'FP-1001',claimAmt:646.80,kind:'warranty',desc:'Water pump',pn:'21468475',qty:1,ro:'37771',cust:'Northline Transport',claim:'W2619848',ra:'88213',st:'ship',by:'2026-10-27',shelf:'W3',to:'Volvo · warranty',why:'Volvo asked for the failed part',credit:0},
 {id:'FP-1002',claimAmt:412.40,kind:'warranty',desc:'Water pump',pn:'21468475',qty:1,ro:'37237',cust:'Highplains Grain',claim:'W2695599',st:'hold',by:'2026-11-13',shelf:'W4',to:'Volvo · warranty',why:'Held in case Volvo asks',credit:0},
 {id:'FP-1003',kind:'warranty',desc:'DPF pressure sensor',pn:'22770789',qty:1,ro:'35915',cust:'Silverline LTL',claim:'W2678765',st:'hold',by:'2026-10-21',shelf:'W1',to:'Volvo · warranty',why:'Held in case Volvo asks',credit:0},
 {id:'C-2001',kind:'core',desc:'Starter core',pn:'22088425',qty:1,ro:'37480',cust:'Yadkin Valley Dairy',st:'ship',by:'2026-10-29',shelf:'K2',to:'Volvo PDC',why:'Core charge on the new starter',credit:95},
 {id:'C-2002',kind:'core',desc:'Alternator core',pn:'23175123',qty:1,ro:'37701',cust:'Triad Cold Chain',st:'shipped',shipped:'10/20 · PDC truck',by:'2026-11-02',shelf:'K1',to:'Volvo PDC',why:'Core charge on the new alternator',credit:120},
 {id:'R-3001',kind:'supplier',desc:'Fuel pump',pn:'22325227',qty:1,ro:'37555',cust:'Piedmont Aggregates',st:'ra',shelf:'R1',to:'Volvo PDC',why:'Not needed — customer declined',credit:350.20},
 {id:'R-3002',kind:'supplier',desc:'Brake chamber, type 30/30',pn:'85134770',qty:2,ro:null,st:'ship',ra:'41187',shelf:'R2',to:'Volvo PDC',why:'Overstock — 4 over the max',credit:164.56},
 {id:'R-3003',kind:'supplier',desc:'Mud flap bracket',pn:'FP-MB2211',qty:1,ro:'37612',cust:'Midway Auto Transport',st:'credited',ra:'FP-77812',shipped:'10/16 · FleetPride pickup',credited:'10/21',shelf:'R3',to:'FleetPride',why:'Damaged in shipping',credit:58.40}
]; }
function reset(){ S={R:seed(),C:JSON.parse(JSON.stringify(CAT0)),T:seedT()}; U={view:'desk',sel:'37750',pop:null,kb:false,open:{},done:[],cq:'',cflt:'all',kopen:{},q:'',ask:[],rflt:'all',rsel:null,set:{},rule:{approval:'ask',parts:'ask'},note:null,sg:{},cc:{},counted:null,so:null}; UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify({S,done:U.done,ask:U.ask})); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const get=no=>S.R.find(r=>r.no===no);
const getT=id=>S.T.find(t=>t.id===id), retsOf=r=>S.T.filter(t=>t.ro===r.no);
const KIND={warranty:'Warranty',core:'Core',supplier:'Supplier'};
const RST={hold:'Holding',ra:'Needs an RA',ship:'Ready to ship',shipped:'Shipped',credited:'Credited',scrapped:'Scrapped',back:'Given back'};
const retAct=t=>t.st==='ra'?['ra','Ask for RA…']:t.st==='ship'?['ship','Ship…']:(t.st==='hold'&&t.by<=TODAY)?['hold','Done holding…']:(t.st==='shipped'&&t.kind!=='warranty')?['credit','Credit in…']:null;
const needs=t=>!!retAct(t)&&t.st!=='shipped';
const retLate=t=>(t.st==='hold'&&t.by<=TODAY)||(t.st==='ship'&&t.by&&dd(TODAY,t.by)<=5);
const rstTxt=t=>t.st==='shipped'?(t.kind==='warranty'?'Shipped':'Shipped · credit due'):t.st==='hold'&&t.by<=TODAY?'Hold is over':RST[t.st];
const rstCls=t=>t.st==='ra'?'late':t.st==='ship'?'ord':t.st==='shipped'?(t.kind==='warranty'?'in':'stg'):t.st==='credited'?'in':t.st==='hold'?(t.by<=TODAY?'late':'no'):'inst';
function retWhy(t){
  if(t.st==='ship') return t.kind==='warranty'?`Volvo wants the ${lc(t.desc)} back · ship by ${short(t.by)}`:t.kind==='core'?`${t.desc} · ${usd0(t.credit)} credit · back by ${short(t.by)}`:`${t.desc} × ${t.qty} · RA ${t.ra} · ready to ship`;
  if(t.st==='ra') return `${t.desc} · ${lc(t.why)} · needs an RA`;
  if(t.st==='hold') return `${t.id} ${lc(t.desc)} · hold ended ${short(t.by)} · scrap or keep`;
  return `${t.desc} · ${rstTxt(t)}`; }
function retNext(t){
  if(t.st==='ship') return t.kind==='warranty'?`Volvo wants the ${lc(t.desc)} back — tag ${t.id}, shelf ${t.shelf}, RA ${t.ra}. Ship by ${short(t.by)}.`:t.kind==='core'?`Send the ${lc(t.desc)} back by ${short(t.by)} — ${usd0(t.credit)} core credit when it lands.`:`${t.desc} × ${t.qty} has RA ${t.ra} — ship it to ${t.to} for ${usd(t.credit)} credit.`;
  if(t.st==='ra') return `${t.desc}: ${lc(t.why)}. Ask ${t.to} for a return authorization (RA).`;
  if(t.st==='hold') return `The hold on ${t.id} ended ${short(t.by)} — scrap it, keep it longer, or give it back to the customer.`;
  return `${t.id} · ${rstTxt(t)}.`; }

/* ---------- what each RO needs from Parts ---------- */
const lines=r=>r.ops.flatMap(o=>o.parts);
const IN_ST=['Received','Staged','Picked up','Installed'], inHand=p=>IN_ST.includes(p.st), withTech=p=>p.st==='Picked up'||p.st==='Installed';
const STS=['Not Ordered','Ordered','Backordered','Received','Staged','Picked up','Installed'];
const STH={'Not Ordered':'still to get','Ordered':'on the way','Backordered':'supplier is short','Received':'checked in · no bin yet','Staged':'on a bin for the tech','Picked up':'the tech has it','Installed':'on the truck'};
const stVar=k=>k==='Backordered'?'--tg-bad':k==='Received'?'--tg-good':k==='Staged'?'--tg-acc':k==='Picked up'?'--tg-st-customer':k==='Ordered'?'--tg-st-support':'--tg-ink3';
const BINS=['A1','A2','A3','A4','A5','A6','A7','A8'];
function late(p){ if(p.st==='Backordered') return {k:'bo',t:p.eta?'backordered · now '+short(p.eta):'backordered · no date'};
  if(p.st!=='Ordered') return null;
  if(p.eta&&p.eta<TODAY){ const n=dd(p.eta,TODAY); return {k:'late',t:`due ${short(p.eta)} · ${n} d late`,n}; }
  if(!p.eta&&p.ord&&dd(p.ord,TODAY)>=5) return {k:'noeta',t:`ordered ${dd(p.ord,TODAY)} d ago · no ETA`}; return null; }
function stateOf(r){
  if(U.done.includes(r.no)) return 'done';
  if(r.route&&!r.route.acc) return r.route.now?'counter':'sent';
  const L=lines(r);
  if(L.some(p=>p.st==='Not Ordered')) return 'order';
  if(L.some(late)) return 'late';
  if(L.length&&L.every(inHand)&&!L.every(withTech)) return 'in';
  if(retsOf(r).some(needs)) return 'ret';
  if(L.length&&L.every(withTech)) return 'tech';
  if(!L.length) return 'quiet';
  return 'way';
}
const GROUPS=[['counter','At the counter','user'],['sent','Sent to you','inbox'],['order','To order','cart'],['late','Late','clock'],['in','Arrived','check'],['ret','Returns','undo']];
function grouped(){ const G={counter:[],sent:[],order:[],late:[],in:[],ret:[],way:[],tech:[],quiet:[],done:[]}; S.R.forEach(r=>G[stateOf(r)].push(r)); return G; }
const flat=()=>{ const G=grouped(); return GROUPS.flatMap(g=>G[g[0]]).concat(U.open.way?G.way:[],U.open.tech?G.tech:[]).map(r=>r.no); };
const binOf=r=>{ const b=lines(r).filter(p=>p.st==='Staged').map(p=>p.bin).filter(Boolean); return b[0]||null; };
const rcvd=r=>lines(r).filter(p=>p.st==='Received');
function why(r){ const st=stateOf(r), L=lines(r);
  if(st==='counter') return {t:`Waiting ${NOW-r.route.at} min · ${F(r.route.from)} · ${lc(L[0].desc)}`,late:true};
  if(st==='sent') return {t:`From ${F(r.route.from)} ${hm(r.route.at)} · ${r.route.why}`,late:!!r.route.now};
  if(st==='order'){ const no=L.filter(p=>p.st==='Not Ordered'), stk=no.filter(p=>(cat(p.pn)||{}).oh>=p.qty).length; return {t:`Approved ${hm(r.appr||r.route&&r.route.at||480)} · ${no.length} part${no.length>1?'s':''}${stk?` · ${stk} on the shelf`:''}`}; }
  if(st==='late'){ const p=L.find(late), l=late(p); return {t:r.spot[0]==='B'?`${r.spot} tied up ${dd(r.bay||TODAY,TODAY)} d · ${lc(p.desc)} ${l.t}`:`${p.desc} · ${l.t}`,late:true}; }
  if(st==='in'){ const rc=rcvd(r); return rc.length?{t:`${rc[0].desc} checked in ${hm(rc[0].rcv)} · needs a bin`,late:true}:{t:`All ${L.length} in · bin ${binOf(r)} · since ${hm(Math.max(...L.map(p=>p.rcv||0)))}`}; }
  if(st==='ret'){ const t=retsOf(r).find(needs); return {t:retWhy(t),late:retLate(t)}; }
  if(st==='way'){ const p=L.filter(x=>!inHand(x)).sort((a,b)=>(a.eta||'9')<(b.eta||'9')?-1:1)[0]; return {t:p?`${p.desc} · due ${p.eta===TODAY?'today':short(p.eta)}`:'—'}; }
  if(st==='tech') return {t:`${F(r.tech)} has every part · picked up ${hm(Math.max(...L.map(p=>p.pk||0)))}`};
  return {t:'Cleared'}; }
const BTN={counter:r=>(cat(lines(r)[0].pn)||{}).oh?'Pull it':'Order…',sent:r=>r.route.now?'Pull it':'Accept',order:()=>'Order…',late:()=>'Chase…',in:r=>rcvd(r).length?'Stage it':'Send to Frank',ret:r=>retAct(retsOf(r).find(needs))[1],way:()=>'Open',tech:()=>'Open'};

/* ---------- drawing ---------- */
const stCls={'Not Ordered':'no','Ordered':'ord','Backordered':'bo','Received':'in','Staged':'stg','Picked up':'pk','Installed':'inst'};
const stTxt={'Not Ordered':'Not ordered','Ordered':'Ordered','Backordered':'Backordered','Received':'Received','Staged':'Staged','Picked up':'Picked up','Installed':'Installed'};
const stChip=(p,live)=>{ const l=late(p); return `<span class="pt-st ${l&&l.k==='late'?'late':stCls[p.st]}"${live?` data-a="pop" data-p="st" data-pid="${p.id}" title="Change status"`:''}><i></i>${stTxt[p.st]}${live?ic('chevD',10):''}</span>`; };
function render(){
  const v=U.view;
  const body=v==='order'?vOrder():v==='shelf'?vShelf():v==='cat'?vCat():v==='ret'?vRet():v==='setup'?vSetup():vDesk();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='parts'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg pt">${head()}<div class="tg-body v-${v}">${v==='desk'?list():''}<div class="tg-main">${body}</div>${pop()}</div>${askCard()}<div class="tk-tip" hidden></div><div class="tk-ring" hidden></div><div class="tk-note" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const G=grouped(), all=S.R.flatMap(lines), oo=all.filter(p=>p.st==='Ordered'||p.st==='Backordered'), due=oo.filter(p=>p.eta===TODAY).length, amt=oo.reduce((s,p)=>s+p.price*p.qty,0);
  const f=(k,n,t,w)=>n?`<button class="tg-hf${w?' w':''}" data-a="hf" data-k="${k}"><b>${n}</b>${t}</button><i>·</i>`:'';
  const vs=[['desk','inbox2','Desk'],['order','truck','On order'],['shelf','shelf','Shelf'],['ret','undo','Returns'],['cat','book','Catalog']];
  return `<header class="tg-head"><h1 class="tg-h1">Parts</h1><span class="tg-facts">${f('counter',G.counter.length,'at the counter',true)}${f('sent',G.sent.length,'sent to you')}${f('order',G.order.length,'to order')}${f('late',G.late.length,'late',true)}${f('due',due,'due today')}${f('rets',S.T.filter(needs).length,'returns')}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Find a part, RO or customer (/)">${ic('search',16)}</button><button class="btn ib tg-srch-b${U.view==='setup'?' on':''}" data-a="view" data-v="setup" title="Parts setup — suppliers, bins, returns, rules">${ic('gear',16)}</button><button class="btn btn-sm btn-primary pt-cb" data-a="pop" data-p="chk" title="Check in a delivery (C)">${ic('truck',15)}Check in</button></header>`;
}
function list(){
  const G=grouped(), s=U.sel;
  const item=r=>{ const st=stateOf(r), w=why(r), on=r.no===s, g=GROUPS.find(x=>x[0]===st);
    return `<div class="tg-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-ro="${r.no}">${w.late?'<i class="tg-dot"></i>':''}<span class="tg-gi${st==='counter'?' now':''}">${ic(g?g[2]:'box',15)}</span><span class="tg-t"><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b>${r.spot!=='—'?`<span class="tg-spot${r.spot[0]==='B'?' bay':''}">${ic('pin',11)}${r.spot}</span>`:''}</span><span class="tg-w${w.late?' late':''}">${esc(w.t)}</span><button class="btn btn-sm${st==='counter'?' btn-primary':''} tg-go" data-a="do" data-ro="${r.no}">${esc(BTN[st](r))}${on&&U.kb?kbd('↵'):''}</button></div>`; };
  let body=GROUPS.filter(g=>G[g[0]].length).map(g=>`<div class="tg-grp">${g[1]}<span>${G[g[0]].length}</span></div>`+G[g[0]].map(item).join('')).join('');
  if(!body) body=`<div class="tg-empty"><span class="tg-ring0 ok">${ic('check',22)}</span><h3>All caught up</h3><p>Nothing to order, chase or ship.</p></div>`;
  if(G.way.length) body+=`<div class="tg-sec${U.open.way?' open':''}" data-a="open" data-k="way">${ic('chevR',12)}<span>On the way</span><span class="n">${G.way.length}</span><span class="m">on time</span></div>`+(U.open.way?G.way.map(item).join(''):'');
  if(G.tech.length) body+=`<div class="tg-sec${U.open.tech?' open':''}" data-a="open" data-k="tech">${ic('chevR',12)}<span>With the tech</span><span class="n">${G.tech.length}</span><span class="m">every part picked up</span></div>`+(U.open.tech?G.tech.map(item).join(''):'');
  if(G.done.length) body+=`<div class="tg-sec${U.open.done?' open':''}" data-a="open" data-k="done">${ic('chevR',12)}<span>Cleared today</span><span class="n">${G.done.length}</span></div>`+(U.open.done?`<div class="tg-rows">${G.done.map(r=>`<div class="tg-row done"><time>${esc(r.doneAt||'')}</time><b class="tg-no">${r.no}</b><b>${esc(r.cust)}</b><small>${ic('check',12)}${esc(r.doneWhy||'')}</small></div>`).join('')}</div>`:'');
  const n=GROUPS.reduce((a,g)=>a+G[g[0]].length,0);
  return `<section class="tg-list"><div class="tg-lh">Needs action<span class="n">${n}</span></div><div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span><span>${kbd('↵')}do it</span><span>${kbd('C')}check in</span><span>${kbd('/')}find</span><span>${kbd('1')}–${kbd('5')}views</span></div></section>`;
}
function srcCell(p,r){
  const c=cat(p.pn)||{}, l=late(p);
  if(p.st==='Not Ordered') return c.oh>=p.qty?`<span class="src"><b>On the shelf · ${c.bin}</b><small>${c.oh} on hand</small></span>`:`<span class="src"><b>To order</b><small>${c.oh?c.oh+' on hand · short':'none on hand'}</small></span>`;
  if(p.st==='Received') return `<span class="src"><b>Receiving · no bin yet</b><small class="late">checked in ${hm(p.rcv)}</small></span>`;
  if(p.st==='Staged') return `<span class="src"><b>Bin ${p.bin}</b><small>${p.sup==='stock'?'from stock':SUP[p.sup]+' · PO '+p.po}${p.rcv?' · '+hm(p.rcv):''}</small></span>`;
  if(p.st==='Picked up') return `<span class="src"><b>With ${F(r.tech)}</b><small>picked up ${hm(p.pk||NOW)}</small></span>`;
  if(p.st==='Installed') return `<span class="src"><b>On the truck</b><small>installed by ${F(r.tech)}</small></span>`;
  return `<span class="src"><b>${SUP[p.sup]} · PO ${p.po}</b><small class="${l?(l.k==='bo'?'bad':'late'):''}">${l?l.t:p.eta?(p.eta===TODAY?'due today':'due '+short(p.eta)):'no ETA'}</small></span>`; }
function nextBar(r){
  const st=stateOf(r), L=lines(r);
  const bar=(t,btn,a,sec)=>`<div class="tg-next"><span class="k">Next</span><p>${t}</p>${btn?`<button class="btn btn-sm${a==='do'?' btn-primary':''}" data-a="do" data-ro="${r.no}">${btn}${kbd('↵')}</button>`:''}${sec||''}</div>`;
  if(st==='counter'){ const c=cat(L[0].pn); return bar(`${F(r.tech)} is at ${r.spot}, waiting ${NOW-r.route.at} min for the ${lc(L[0].desc)} — ${c.oh?`${c.oh} on the shelf, bin ${c.bin}`:'none on the shelf'}.`,c.oh?'Pull it':'Order…','do'); }
  if(st==='sent') return r.route.now?bar(`${F(r.tech)} is waiting in ${r.spot} for the ${lc(L[0].desc)} — ${cat(L[0].pn).oh} on the shelf, bin ${cat(L[0].pn).bin}.`,'Pull it','do',`<button class="btn btn-sm" data-a="pop" data-p="ret" data-ro="${r.no}">Return…</button>`)
    :bar(`${F(r.route.from)} sent this ${hm(r.route.at)} · ${esc(r.route.why)}.<span class="pt-rule">${ic('swap',11)}Approval done → Parts · asked ${F(r.route.from)} first</span>`,'Accept','do',`<button class="btn btn-sm" data-a="pop" data-p="ret" data-ro="${r.no}">Return…</button>`);
  if(st==='order'){ const no=L.filter(p=>p.st==='Not Ordered'), stk=no.filter(p=>cat(p.pn).oh>=p.qty).length; return bar(stk===no.length?(no.length===1?`1 part to get — it’s on the shelf, bin ${cat(no[0].pn).bin}.`:`${no.length} parts to get — all on the shelf.`):`${no.length} part${no.length>1?'s':''} to get${stk?` · ${stk} on the shelf`:''}.`,stk===no.length?'Pull…':'Order…','do'); }
  if(st==='late'){ const p=L.find(late), l=late(p); return bar(`The ${lc(p.desc)} is ${l.k==='late'?l.n+' day'+(l.n>1?'s':'')+' late':l.k==='bo'?'backordered with no date':'7 days out with no ETA'} — ${SUP[p.sup]}, PO ${p.po}.${r.told?` ${F(r.wr)} last told the customer ${r.told}.`:''}`,'Chase…','do'); }
  if(st==='in'){ const rc=rcvd(r); if(rc.length){ const b=binOf(r)||nextBin(); return bar(`The ${lc(rc[0].desc)} is checked in but has no bin — stage it${binOf(r)?' with the rest':''} in ${b}.`,'Stage it','do'); }
    return bar(`Every part is in — bin ${binOf(r)}. Send it to Frank to bring the truck in?<span class="pt-rule">${ic('swap',11)}All parts received → Foreman · asks first</span>`,'Send to Frank','do',`<button class="btn btn-sm" data-a="notyet" data-ro="${r.no}">Not yet</button>`); }
  if(st==='ret'){ const t=retsOf(r).find(needs); return bar(retNext(t),retAct(t)[1],'do'); }
  if(st==='way'){ const p=L.filter(x=>!inHand(x))[0]; return bar(`Nothing to do — the ${lc(p.desc)} is due ${p.eta===TODAY?'today':short(p.eta)}.`,'',''); }
  if(st==='tech') return bar(`Nothing for Parts — ${F(r.tech)} has every part.`,'','');
  if(st==='quiet'){ const t=retsOf(r)[0]; return t?bar(`${t.id} · ${rstTxt(t)}${t.st==='hold'?' until '+short(t.by):''} — nothing to do yet.`,'',''):bar('Nothing for Parts on this RO.','',''); }
  return `<div class="pt-ok">${ic('check',16)}Cleared — ${esc(r.doneWhy||'')}</div>`;
}
function vDesk(){
  const r=get(U.sel); if(!r) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('parts',22)}</span><h3>Pick an RO</h3><p>Its parts, where they are and what’s next.</p></div></div>`;
  const st=stateOf(r), L=lines(r), g=GROUPS.find(x=>x[0]===st);
  const tot=L.reduce((s,p)=>s+p.price*p.qty,0), nIn=L.filter(inHand).length;
  let h=`<div class="pt-pane" data-scroll="pane"><div class="tg-top"><div class="r1"><span class="tg-no">RO-${r.no}</span>${r.jt?`<span class="pt-jt">${r.jt}</span>`:''}<span>·</span><span>${esc(r.veh)} · ${esc(r.eng)} · Unit ${esc(r.unit)}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="send" data-ro="${r.no}">${ic('swap',14)}Send to…</button><button class="btn btn-sm" data-a="toast" data-t="Opens RO-${r.no}.">Open RO</button></div><h2>${esc(r.cust)}</h2>
    <div class="pt-facts"><div><small>Truck</small><span class="${r.spot[0]==='B'&&st==='late'?'warn':''}">${r.spot==='—'?'Gone — RO closed':r.spot[0]==='B'?`${ic('pin',12)}Bay ${r.spot.slice(1)}${st==='late'?' · tied up':''}`:`${ic('pin',12)}Lot ${r.spot}`}</span></div><div><small>Technician</small><span>${esc(PPL[r.tech])}</span></div><div><small>Writer</small><span>${esc(PPL[r.wr])}</span></div><div><small>VIN</small><span class="m">${esc(r.vin)}</span></div><div><small>Parts on this RO</small><span class="m">${L.length?usd(tot):'—'}</span></div></div></div><div class="pt-pad">${nextBar(r)}${extraCards(r)}`;
  r.ops.forEach((o,i)=>{ const oin=o.parts.filter(inHand).length, ot=o.parts.reduce((s,p)=>s+p.price*p.qty,0);
    h+=`<div class="pt-op"><div class="pt-oph"><span class="n">${i+1}</span>${r.jt?`<span class="pt-jt">${r.jt}</span>`:''}<b>${esc(o.cmp)}</b><span class="sp"></span><small>${oin} of ${o.parts.length} in hand</small><span class="pt-bar"><i style="width:${o.parts.length?oin/o.parts.length*100:0}%"></i></span></div>
      <div class="pt-pr h"><span>Status</span><span>Part</span><span>Part #</span><span style="text-align:right">Qty</span><span>Where</span><span style="text-align:right">Each</span><span></span></div>
      ${o.parts.map(p=>{ const c=cat(p.pn)||{}, l=late(p); return `<div class="pt-pr">${stChip(p,1)}<span class="d"><b>${esc(p.desc)}</b>${p.st==='Not Ordered'&&c.oh>=p.qty?`<small class="ok">In stock · bin ${c.bin}</small>`:''}</span><span class="pn">${p.pn}</span><span class="q">${p.qty}</span>${srcCell(p,r)}<span class="pr">${p.price?usd(p.price):'no charge'}</span><span class="ac">${st==='sent'?'':p.st==='Not Ordered'?`<button class="btn btn-sm" data-a="do" data-ro="${r.no}">${c.oh>=p.qty?'Pull':'Order…'}</button>`:l?`<button class="btn btn-sm" data-a="do" data-ro="${r.no}">Chase…</button>`:p.st==='Ordered'?`<button class="btn btn-sm" data-a="rcv1" data-pid="${p.id}">${ic('check',13)}It’s in</button>`:p.st==='Received'?`<button class="btn btn-sm" data-a="stage1" data-pid="${p.id}">Stage</button>`:p.st==='Staged'?`<button class="btn btn-sm" data-a="pk1" data-pid="${p.id}" title="The tech took it">${ic('check',13)}Picked up</button>`:''}</span></div>`; }).join('')}
      <div class="pt-opf"><span>Parts</span><b>${usd(ot)}</b><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Pick from the catalog or paste a quote — same as Extract parts.">${ic('plus',13)}Add a part</button></div></div>`; });
  const RT=retsOf(r); if(RT.length) h+=`<div class="pt-op"><div class="pt-oph"><span class="n">${ic('undo',13)}</span><b>Going back</b><span class="sp"></span><small>Parts runs every return</small></div>${RT.map(t=>{ const a=retAct(t); return `<div class="pt-ret"><span class="gi">${ic(t.kind==='warranty'?'warranty':t.kind==='core'?'undo':'box',16)}</span><b>${t.id} · ${esc(t.desc)}${t.qty>1?' × '+t.qty:''} · <span style="font-family:var(--tg-mono);font-weight:500">${t.pn}</span> <span class="pt-kind ${t.kind}">${KIND[t.kind]}</span></b><small>${esc(t.why)} · ${t.kind==='warranty'?`claim ${t.claim}${t.ra?' · RA '+t.ra:''}`:`${t.to}${t.ra?' · RA '+t.ra:''} · ${usd(t.credit)} credit`} · shelf ${t.shelf}${t.by&&t.st!=='credited'?` · ${t.st==='hold'?'hold until':'by'} ${short(t.by)}`:''} · <span class="pt-st ${rstCls(t)}" style="height:18px;cursor:default"><i></i>${rstTxt(t)}</span></small>${a?`<button class="btn btn-sm" data-a="rdo" data-tid="${t.id}">${a[1]}</button>`:''}</div>`; }).join('')}</div>`;
  h+=`<div class="pt-sec">History<span class="sp"></span><span>hand-offs, orders and check-ins</span></div><div class="pt-log">${r.log.map(x=>`<div><time>${x[0]}</time><span>${x[1]}</span></div>`).join('')}</div>`;
  return h+'</div></div>';
}
function vOrder(){
  const rows=[]; S.R.forEach(r=>lines(r).forEach(p=>{ if(p.st==='Ordered'||p.st==='Backordered') rows.push({r,p}); }));
  const G=[['late','Late',x=>!!late(x.p)],['today','Due today',x=>!late(x.p)&&x.p.eta===TODAY],['tom','Tomorrow',x=>x.p.eta===addD(TODAY,1)],['later','Later',x=>!late(x.p)&&x.p.eta&&x.p.eta>addD(TODAY,1)],['none','No ETA yet',x=>!late(x.p)&&!x.p.eta]];
  const amt=rows.reduce((s,x)=>s+x.p.price*x.p.qty,0), nl=rows.filter(x=>late(x.p)).length;
  const row=x=>{ const p=x.p, r=x.r, l=late(p);
    return `<div class="pt-or" data-a="open" data-ro="${r.no}" data-k="ro"><b>${esc(p.desc)}</b><span class="m">${p.pn}</span><span class="m q">${p.qty}</span><span class="ro"><b class="tg-no">${r.no}</b><span>${esc(r.cust)}</span></span><span class="wt">${r.spot[0]==='B'?`<span class="tg-spot bay">${ic('pin',11)}${r.spot}</span>`:`<span class="tg-spot">${ic('pin',11)}${r.spot}</span>`}${F(r.tech)}</span><span class="su">${SUP[p.sup]}<small>PO ${p.po} · ${md(p.ord)}</small></span><span class="eta ${l?(l.k==='bo'?'bad':'late'):''}">${l?(l.k==='late'?`${l.n} d late`:l.k==='bo'?'Backordered':'No ETA'):p.eta===TODAY?'Today':short(p.eta)}</span>${stChip(p,0)}</div>`; };
  const tbl=G.map(g=>{ const L=rows.filter(g[2]); if(!L.length) return ''; return `<div class="pt-tg${g[0]==='late'?' late':''}">${g[1]}<span>${L.length}</span><span class="sp"></span>${g[0]==='today'?`<button class="btn btn-sm" data-a="pop" data-p="chk">${ic('truck',13)}Check in</button>`:''}</div>${L.map(row).join('')}`; }).join('');
  return `<div class="pt-full"><div class="pt-fh"><h2>On order</h2><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="CSV saved — every open order line.">${ic('download',14)}Export</button><button class="btn btn-sm" data-a="toast" data-t="Order list prints — grouped by supplier, with PO numbers.">${ic('print',14)}Print</button></div>
   ${orderCards()}<div class="pt-sum"><span><b>${rows.length}</b>parts on order</span><span><b>${new Set(rows.map(x=>x.r.no)).size}</b>ROs</span><span><b>${usd0(amt)}</b>on order</span>${nl?`<span class="warn"><b>${nl}</b>late</span>`:''}</div>
   <div class="pt-tbl"><div class="pt-or h"><span>Part</span><span>Part #</span><span class="q">Qty</span><span>RO</span><span>Truck · tech</span><span>Supplier · PO</span><span>ETA</span><span>Status</span></div>${tbl}</div></div>`;
}
function vShelf(){
  const ALL=S.R.flatMap(r=>lines(r).map(p=>({r,p})));
  const bins=BINS.map(b=>{ const L=ALL.filter(x=>x.p.st==='Staged'&&x.p.bin===b); return {b,r:L[0]&&L[0].r,L}; });
  const card=x=>{ if(!x.r) return `<div class="pt-bin empty"><span class="k">${x.b}</span><span class="w">Empty</span></div>`;
    const r=x.r, L=lines(r), n=L.filter(inHand).length, all=n===L.length;
    return `<div class="pt-bin" data-a="open" data-ro="${r.no}" data-k="ro"><span class="k">${x.b}<span class="sp"></span><em class="${all?'ok':'part'}">${all?'All in':n+' of '+L.length+' in'}</em></span><span class="t"><b class="tg-no">${r.no}</b><b>${esc(r.cust)}</b></span><span class="w"><span class="tg-av">${r.tech}</span>${F(r.tech)} · ${x.L.length} part${x.L.length>1?'s':''}<span class="sp"></span><button class="btn btn-sm ib pt-pk pt-lb" data-a="pop" data-p="label" data-bin="${x.b}" title="Bin label">${ic('scan',13)}</button><button class="btn btn-sm pt-pk" data-a="pickup" data-bin="${x.b}" title="${F(r.tech)} took these">${ic('check',12)}Picked up</button></span></div>`; };
  const wait=ALL.filter(x=>x.p.st==='Received');
  const free=BINS.filter(b=>!usedBins().has(b));
  const picked=ALL.filter(x=>x.p.st==='Picked up'||(x.p.st==='Installed'&&x.p.pk)).sort((a,b)=>(b.p.pk||0)-(a.p.pk||0));
  const SH=[['W','Warranty',6],['K','Cores',4],['R','Supplier returns',4]];
  const shelves=SH.map(s=>`<div class="pt-shg"><small>${s[1]}</small><div>${Array.from({length:s[2]},(_,i)=>s[0]+(i+1)).map(id=>{ const t=S.T.find(x=>x.shelf===id&&!['shipped','credited','scrapped','back'].includes(x.st)); return t?`<button class="pt-shv${needs(t)?' act':''}" data-a="rsel" data-tid="${t.id}" title="${esc(t.desc)} · ${rstTxt(t)}"><b>${id}</b>${t.id}</button>`:`<span class="pt-shv off"><b>${id}</b>empty</span>`; }).join('')}</div></div>`).join('');
  return `<div class="pt-full"><div class="pt-fh"><h2>Shelf</h2><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Bin labels print — RO, customer, tech and a list of what’s in it.">${ic('print',14)}Print bin labels</button></div>
    ${upNext()}${wait.length?`<div class="pt-tg" style="color:var(--tg-warn)">Waiting for a bin<span>${wait.length}</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">checked in at receiving — Received, not yet Staged</span></div>
    <div class="pt-tbl" style="padding-top:8px">${wait.map(x=>{ const b=binOf(x.r); const opts=b?[b]:free.slice(0,3); return `<div class="pt-wait"><span class="d"><b>${esc(x.p.desc)}</b><small>${x.p.pn} · checked in ${hm(x.p.rcv)}</small></span><span class="ro"><b class="tg-no">${x.r.no}</b> ${esc(x.r.cust)}</span><span class="tg-r">${opts.map((o,i)=>`<button class="tg-chip${i===0?' on':''}" data-a="stageto" data-pid="${x.p.id}" data-bin="${o}">${b?'With the rest · ':'Bin '}${o}</button>`).join('')}</span></div>`; }).join('')}</div>`:''}
    <div class="pt-tg"${wait.length?'':' style="padding-top:0"'}>Staged for the shop<span>${bins.filter(x=>x.r).length} of ${BINS.length} bins</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">Staged until the tech picks them up</span></div>
    <div class="pt-bins">${bins.map(card).join('')}</div>
    <div class="pt-two2"><div><div class="pt-tg">Return shelves<span>Parts runs every return</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="view" data-v="ret">Open Returns</button></div><div class="pt-tbl pt-shs">${shelves}</div></div>
    <div><div class="pt-tg">Picked up today<span>${picked.length}</span></div><div class="pt-tbl">${picked.length?picked.map(x=>`<div class="pt-pkr"><time>${hm(x.p.pk)}</time><span class="tg-av">${x.r.tech}</span><span><b>${esc(x.p.desc)}</b> · <span class="tg-no">${x.r.no}</span></span>${stChip(x.p,0)}</div>`).join(''):'<div class="pt-none">Nothing picked up yet today.</div>'}</div></div></div></div>`;
}
function vRet(){
  const fl=U.rflt, L=S.T.filter(t=>fl==='all'||t.kind===fl);
  const G=[['todo','To do',t=>needs(t)],['hold','Holding for Volvo',t=>t.st==='hold'&&!needs(t)],['cr','Shipped — credit due',t=>t.st==='shipped'&&t.kind!=='warranty'],['done','Done',t=>['credited','scrapped','back'].includes(t.st)||(t.st==='shipped'&&t.kind==='warranty')]];
  const due=S.T.filter(t=>t.kind!=='warranty'&&['ra','ship','shipped'].includes(t.st)).reduce((s,t)=>s+t.credit,0);
  const row=t=>{ const a=retAct(t), r=t.ro&&get(t.ro);
    return `<div class="pt-rr${U.rsel===t.id?' hl':''}" data-tid="${t.id}"><span class="m">${t.id}</span><span class="d"><b>${esc(t.desc)}${t.qty>1?' × '+t.qty:''}</b><small>${t.pn} · shelf ${t.shelf}</small></span><span><span class="pt-kind ${t.kind}">${KIND[t.kind]}</span></span><span class="d"><b>${t.ro?`<span class="tg-no">${t.ro}</span> ${esc(t.cust)}`:'Stock'}</b><small>${esc(t.why)}</small></span><span class="d"><b>${esc(t.to)}</b><small>${t.ra?'RA '+t.ra:t.kind==='warranty'?'claim '+t.claim:t.kind==='core'?'no RA needed':'no RA yet'}</small></span><span class="dt${retLate(t)?' late':''}">${t.st==='credited'?'credited '+t.credited:t.shipped&&t.st!=='ship'?'shipped '+t.shipped.split(' · ')[0]:t.by?(t.st==='hold'?'hold until ':'by ')+short(t.by):'—'}</span><span class="m r">${t.credit?usd(t.credit):'—'}</span><span><span class="pt-st ${rstCls(t)}" style="cursor:default"><i></i>${rstTxt(t)}</span></span><span class="ac">${a?`<button class="btn btn-sm" data-a="rdo" data-tid="${t.id}">${a[1]}</button>`:r?`<button class="btn btn-sm tg-gh" data-a="open" data-ro="${t.ro}" data-k="ro">Open RO</button>`:''}</span></div>`; };
  const tbl=G.map(g=>{ const X=L.filter(g[2]); if(!X.length) return ''; return `<div class="pt-tg${g[0]==='todo'?' late':''}">${g[1]}<span>${X.length}</span></div>${X.map(row).join('')}`; }).join('')||'<div class="pt-none">No returns.</div>';
  const n=k=>S.T.filter(t=>k==='all'||t.kind===k).length;
  return `<div class="pt-full"><div class="pt-fh"><h2>Returns</h2><span class="tg-hf" style="cursor:default">Parts runs every return — warranty, cores and supplier returns. Warranty sees its own on the claim.</span><span class="sp"></span><button class="btn btn-sm btn-primary" data-a="pop" data-p="newret">${ic('plus',14)}Start a return</button></div>
   <div class="pt-cbar"><span class="tg-seg3">${[['all','All'],['warranty','Warranty'],['core','Cores'],['supplier','Supplier']].map(x=>`<button class="${U.rflt===x[0]?'on':''}" data-a="rflt" data-v="${x[0]}">${x[1]} · ${n(x[0])}</button>`).join('')}</span><span class="sp"></span><div class="pt-sum" style="margin:0"><span class="warn"><b>${S.T.filter(needs).length}</b>to do</span><span><b>${usd0(due)}</b>credit coming back</span><span><b>${S.T.filter(t=>t.st==='hold').length}</b>held for Volvo</span></div></div>
   ${riskCard()}<div class="pt-tbl"><div class="pt-rr h"><span>Tag</span><span>Part</span><span>Kind</span><span>RO · why</span><span>Back to</span><span>Due</span><span class="r">Credit</span><span>Status</span><span></span></div>${tbl}</div></div>`;
}
function vSetup(){
  const S_=[
   ['Suppliers','Where parts come from, when to order, when they land',[['sup_pdc','Volvo PDC · stock order','Order by 15:00 · next business day 07:00'],['sup_vor','Volvo PDC · rush (VOR)','Order by 17:00 · next morning 07:00'],['sup_fp','FleetPride','Order by 12:00 · same day 16:00'],['sup_x','Another supplier','Name · order-by time · delivery']]],
   ['Deliveries','When trucks come in and receiving is open',[['del_pdc','Volvo PDC trucks','07:00 and 15:00'],['del_rcv','Receiving hours','06:30 – 17:00']]],
   ['Bins and shelves','What the Shelf view and the Returns tags use',[['bin_a','Staging bins','A1 – A8'],['bin_w','Warranty return shelves','W1 – W6'],['bin_k','Core shelves','K1 – K4'],['bin_r','Supplier return shelves','R1 – R4']]],
   ['Returns','Parts runs every return',[['ret_hold','Hold a failed part for Volvo','30 days'],['ret_core','Send a core back within','30 days'],['ret_fee','Supplier restocking fee','15%'],['ret_cr','Credit should land within','14 days']]],
   ['Part numbers','',[['pn_fmt','Volvo part # format','8 digits'],['pn_mock','Part numbers in this mock-up','made up — swap in real ones']]]
  ];
  const card=s=>`<div class="pt-set"><div class="pt-seth"><b>${s[0]}</b>${s[1]?`<small>${s[1]}</small>`:''}</div>${s[2].map(x=>{ const v=U.set[x[0]]; return `<label class="pt-setr"><span>${x[1]}</span><input data-set="${x[0]}" placeholder="${esc(x[2])}" value="${esc(v||'')}"><span class="pt-ph${v?' set':''}">${v?'set':'placeholder'}</span></label>`; }).join('')}</div>`;
  const RL=[['approval','Approval done','Parts','the writer is asked first'],['parts','All parts received','Foreman','you’re asked first']];
  const rules=`<div class="pt-set"><div class="pt-seth"><b>Hand-off rules</b><small>Parts sits between the writer and the foreman</small></div>${RL.map(x=>`<div class="pt-setr"><span>${x[1]} → ${x[2]}<small>${x[3]}</small></span><span class="tg-seg3">${[['ask','Ask first'],['auto','Automatic'],['off','Off']].map(m=>`<button class="${U.rule[x[0]]===m[0]?'on':''}" data-a="rulem" data-k="${x[0]}" data-v="${m[0]}">${m[1]}</button>`).join('')}</span><span class="pt-ph set">${U.rule[x[0]]==='ask'?'chosen':'changed'}</span></div>`).join('')}</div>`;
  return `<div class="pt-full"><div class="pt-fh"><h2>Parts setup</h2><span class="tg-hf" style="cursor:default">Grey text is a placeholder — type the real value over it. Lives in Settings → Parts.</span><span class="sp"></span><button class="btn btn-sm" data-a="view" data-v="desk">Done</button></div><div class="pt-setg"><div>${card(S_[0])}${card(S_[1])}${rules}</div><div>${card(S_[2])}${card(S_[3])}${card(S_[4])}</div></div></div>`;
}
function askCard(){ const L=(U.ask||[]).map(get).filter(r=>r&&stateOf(r)==='in'&&!rcvd(r).length); if(!L.length) return '';
  return `<div class="pt-ask"><div class="h"><span class="i">${ic('swap',15)}</span><span><b>${L.length===1?`${L[0].no} has every part`:`${L.length} ROs have every part`}</b><small>All parts received → Foreman asks first</small></span></div>${L.map(r=>`<div class="r"><b class="tg-no">${r.no}</b><span>${esc(r.cust)} · bin ${binOf(r)}</span><button class="btn btn-sm${L.length===1?' btn-primary':''}" data-a="asksend" data-ro="${r.no}">Send to Frank</button></div>`).join('')}<div class="a"><button class="btn btn-sm tg-gh" data-a="askno">Not yet</button>${L.length>1?`<button class="btn btn-sm btn-primary" data-a="askall">${L.length===2?'Send both':'Send all '+L.length} to Frank</button>`:''}</div></div>`; }
const SUGG={'37750':[['20750712',1,4],['21813012',1,3]]};
function extraCards(r){ const st=stateOf(r), L=lines(r); let h='';
  if(st==='counter'&&r.route.phone){ const p=L[0], c=cat(p.pn);
    h+=`<div class="pt-msg"><span class="tg-av md">${r.route.from}</span><div class="bd"><div class="hd"><b>${esc(PPL[r.route.from])}</b><span>asked from the phone app · ${hm(r.route.at)}</span><span class="tg-spot bay">${ic('pin',11)}${r.spot}</span><span class="tg-late">waiting ${NOW-r.route.at} min</span></div><p>${esc(r.route.note)}</p>${r.route.photo?`<span class="pt-photo"><i></i>${ic('clip',13)}photo · cracked chamber</span>`:''}<div class="mt">${ic('check',12)}Matched to <b>${esc(p.desc)} · ${p.pn}</b> — ${c.oh} on hand, bin ${c.bin}</div></div></div>`; }
  const sg=SUGG[r.no]; if(sg&&(st==='order'||st==='sent')&&!U.sg[r.no]){ const left=sg.filter(x=>!L.some(p=>p.pn===x[0]));
    if(left.length) h+=`<div class="pt-sug"><div class="h">${ic('history',14)}<b>Usually goes with this job</b><small>same complaint on 5 past ROs · the writer saw these on the estimate</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="sgno" data-ro="${r.no}">Not needed</button>${left.length>1?`<button class="btn btn-sm" data-a="sgall" data-ro="${r.no}">Add both</button>`:''}</div>${left.map(x=>{ const c=cat(x[0]); return `<div class="r"><span class="d"><b>${esc(c.desc)}</b><small>${c.pn}</small></span><span class="u" data-tip="${esc(c.desc)}|Used on ${x[2]} of the last 5 jobs like this"><i style="width:${x[2]/5*100}%"></i></span><span class="uc">${x[2]} of 5 jobs</span><span class="s">${c.oh?c.oh+' on hand · '+c.bin:'none on hand'}</span><span class="pr">${usd(c.price)}</span><button class="btn btn-sm" data-a="sgadd" data-ro="${r.no}" data-pn="${c.pn}">${ic('plus',13)}Add</button></div>`; }).join('')}</div>`; }
  return h; }
const UPN=[['B4','15:00','37742','when Dana finishes 37731'],['B11','15:30','37519','Mike, next in line'],['B2','Fri 07:00','37660','first thing tomorrow']];
function upNext(){ return `<div class="pt-tg" style="padding-top:0">Up next on the floor<span>from Frank’s queue</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">pull the parts before the bay frees up</span></div><div class="pt-up">${UPN.map(u=>{ const r=get(u[2]); if(!r) return '';
    const L=lines(r), pull=L.filter(p=>p.st==='Not Ordered'&&(cat(p.pn)||{}).oh>=p.qty), no=L.filter(p=>p.st==='Not Ordered'&&!pull.includes(p)), oo=L.filter(p=>p.st==='Ordered'||p.st==='Backordered');
    const s=pull.length?['warn',`${pull.length} on the shelf, not pulled`]:no.length?['warn',`${no.length} still to order`]:oo.length?['',`${oo[0].desc} due ${oo[0].eta===TODAY?'today':short(oo[0].eta)}`]:['ok',`Ready · bin ${binOf(r)||'—'}`];
    return `<div class="pt-upc"><div class="k"><span class="tg-spot">${ic('pin',11)}${u[0]}</span><b>${u[1]}</b><span class="sp"></span><em class="${s[0]}">${s[1]}</em></div><div class="t"><b class="tg-no">${r.no}</b><b>${esc(r.cust)}</b></div><div class="w"><span class="tg-av">${r.tech}</span>${esc(u[3])}<span class="sp"></span>${pull.length?`<button class="btn btn-sm btn-primary" data-a="pullahead" data-ro="${r.no}" data-bay="${u[0]}">Pull ${pull.length} to a bin</button>`:''}</div></div>`; }).join('')}</div>`; }
function stockCards(){ const low=S.C.filter(c=>c.min&&c.oh<c.min), mx=c=>c.min*2, tot=low.reduce((s,c)=>s+(mx(c)-c.oh)*c.price,0), cnt=S.C.filter(c=>c.bin&&c.bin[0]==='F');
  return `<div class="pt-cgrid"><div class="pt-reo pt-tbl"><div class="pt-ch"><b>Next stock order</b><small>Volvo PDC · goes at 15:00 · back up to max</small><span class="sp"></span>${U.so?`<span class="pt-st in" style="cursor:default"><i></i>Sent ${U.so}</span>`:`<button class="btn btn-sm btn-primary" data-a="sosend">Send · ${usd0(tot)}</button>`}</div><div class="pt-rl h"><span>Part</span><span class="r">On hand / min</span><span class="r">Order</span><span class="r">Cost</span></div>${low.map(c=>`<div class="pt-rl"><span class="d"><b>${esc(c.desc)}</b><small>${c.pn}${c.bin?' · '+c.bin:''}</small></span><span class="oh low">${c.oh} / ${c.min}</span><span class="q">+${mx(c)-c.oh}</span><span class="m r">${usd((mx(c)-c.oh)*c.price)}</span></div>`).join('')}<div class="pt-cf">${ic('info',12)}A part joins this order by itself when it drops below its min.</div></div>
  <div class="pt-cnt pt-tbl"><div class="pt-ch"><b>Count today · shelf F</b><small>one shelf a day · every shelf each week</small><span class="sp"></span>${U.counted?`<span class="pt-st in" style="cursor:default"><i></i>Counted ${U.counted}</span>`:`<button class="btn btn-sm" data-a="ccsave">Save count</button>`}</div><div class="pt-rl h"><span>Part</span><span class="r">Parsec says</span><span class="r">Counted</span><span class="r"></span></div>${cnt.map(c=>{ const v=U.cc[c.pn], d=v===''||v==null?null:(+v-c.oh); return `<div class="pt-rl"><span class="d"><b>${esc(c.desc)}</b><small>${c.pn} · ${c.bin}</small></span><span class="oh">${c.oh}</span><input class="pt-ccin" data-cc="${c.pn}" value="${esc(v==null?'':v)}" placeholder="—"${U.counted?' disabled':''}><span class="dv${d==null?'':d?' off':' ok'}">${d==null?'':d===0?'matches':(d>0?'+':'')+d}</span></div>`; }).join('')}<div class="pt-cf">${ic('info',12)}Tomorrow: shelf G. A count that’s off fixes the on-hand number.</div></div></div>`; }
function barcode(s){ let x=8, h=''; const W=[]; for(const ch of s){ const c=ch.charCodeAt(0); W.push(1+(c&3),1+((c>>2)&1),1+((c>>3)&3),1+((c>>5)&1)); }
  W.forEach((w,i)=>{ if(i%2===0) h+=`<rect x="${x}" y="0" width="${w*1.6}" height="40"/>`; x+=w*1.6; });
  return `<svg class="pt-bc" viewBox="0 0 ${x+8} 40" width="${x+8}" height="40" preserveAspectRatio="none" aria-label="barcode ${esc(s)}">${h}</svg><div class="pt-bct">${esc(s)}</div>`; }
const SLIP=`VOLVO PDC — PACKING SLIP · DELIVERY 22-OCT · SHIP-TO 4471
85137802  BRAKE SHOE KIT 16.5X7        QTY 2
22972342  ACTUATOR, TURBO              QTY 1
21751883  GASKET KIT, EGR COOLER       QTY 1
21707133  OIL FILTER                   QTY 12`;
function parseSlip(t){ const L=dueLines(); return t.split(/\n/).map(l=>{ const m=/(\d{8})\b.*?(?:QTY|×|\bx)\s*(\d+)/i.exec(l); if(!m) return null; const hit=L.find(x=>x.p.pn===m[1]), c=cat(m[1]); return {pn:m[1],q:+m[2],m:hit||null,stock:!hit&&c?c:null}; }).filter(Boolean); }
function slipSel(p){ p.sel={}; parseSlip(p.slip||'').forEach(x=>{ if(x.m) p.sel[x.m.p.id]=true; }); }
function chkHead(p){ const seg=`<div class="pt-mode"><span class="tg-seg3"><button class="${p.mode!=='slip'?'on':''}" data-a="cmode" data-v="scan">${ic('scan',13)} Scan</button><button class="${p.mode==='slip'?'on':''}" data-a="cmode" data-v="slip">${ic('file',13)} Packing slip</button></span></div>`;
  if(p.mode!=='slip') return seg+`<div class="pt-scan">${ic('scan',16)}<input id="pt-scan" placeholder="Scan or type a part #" value="${esc(p.q||'')}" autocomplete="off"><small>${kbd('↵')} ticks it</small></div>`;
  const R=parseSlip(p.slip||'');
  return seg+`<textarea id="pt-slip" class="pt-slip" placeholder="Paste the packing slip here — or drop the PDF or a photo of it" spellcheck="false">${esc(p.slip||'')}</textarea>${R.length?`<div class="pt-slr"><b>${R.filter(x=>x.m).length} of ${R.length} lines match open orders</b>${R.map(x=>`<span class="${x.m?'ok':x.stock?'stk':'no'}">${ic(x.m?'check':x.stock?'box':'x',11)}${x.pn} × ${x.q} → ${x.m?x.m.r.no:x.stock?'stock · '+esc(x.stock.desc.toLowerCase()):'not on any order'}</span>`).join('')}</div>`:''}`; }
const SC=[['Volvo PDC · stock','pdc',91,0.6,212],['Volvo PDC · rush','vor',97,0.2,38],['FleetPride','fp',84,1.4,57]];
const BDW=[['9/21',4],['9/28',1],['10/5',3],['10/12',5],['10/19',3]];
function orderCards(){ const lateNow=k=>S.R.flatMap(lines).filter(p=>late(p)&&p.sup===k).length;
  const sc=`<div class="pt-sc pt-tbl"><div class="pt-ch"><b>Suppliers · last 90 days</b><small>on time = in by the day they promised</small></div>${SC.map(s=>`<div class="pt-scr" data-tip="${s[0]}|${s[2]}% on time · ${s[4]} lines · ${s[3]} d late on average"><span class="n">${s[0]}</span><span class="bar"><i style="width:${s[2]}%"></i></span><b>${s[2]}%</b><span class="m">${s[3].toFixed(1)} d late avg</span><span class="m">${s[4]} lines</span><span class="ln">${lateNow(s[1])?lateNow(s[1])+' late now':''}</span></div>`).join('')}<div class="pt-cf">${ic('info',12)}Numbers are placeholders until real orders build them up.</div></div>`;
  const held=S.R.filter(r=>r.spot[0]==='B'&&r.bay&&stateOf(r)==='late'), mx=Math.max(...BDW.map(x=>x[1]));
  const bd=`<div class="pt-bay pt-tbl"><div class="pt-ch"><b>Bays held for parts</b><small>Frank sees it on the Floor · the manager sees the month</small></div><div class="pt-bayb"><div class="now">${held.map(r=>{ const p=lines(r).find(late); return `<div class="pt-bh"><span class="tg-spot bay">${ic('pin',11)}${r.spot}</span><b>${dd(r.bay,TODAY)} days</b><span>${r.no} · ${lc(p.desc)} ${late(p).t}</span></div>`; }).join('')||'<div class="pt-none">No bay is waiting on a part.</div>'}<div class="tot"><b>${BDW.slice(-4).reduce((s,x)=>s+x[1],0)}</b>bay-days lost to parts · last 4 weeks</div></div><div class="pt-cols">${BDW.map((x,i)=>`<div class="c" data-tip="Week of ${x[0]}${i===BDW.length-1?' · so far':''}|${x[1]} bay-day${x[1]>1?'s':''} waiting on parts"><span class="v">${x[1]}</span><i style="height:${Math.round(x[1]/mx*58)}px"${i===BDW.length-1?' class="cur"':''}></i><small>${x[0]}</small></div>`).join('')}</div></div></div>`;
  return `<div class="pt-cgrid">${sc}${bd}</div>`; }
function riskCard(){ const wk=addD(TODAY,7);
  const items=S.T.filter(t=>['ship','ra','shipped'].includes(t.st)).map(t=>({t,amt:t.kind==='warranty'?(t.claimAmt||0):t.credit,why:t.kind==='warranty'?`claim ${t.claim} — Volvo can charge it back if the part doesn’t ship`:t.st==='shipped'?`credit not in yet · shipped ${t.shipped.split(' · ')[0]}`:t.kind==='core'?'core credit — lost if the core doesn’t go back':t.st==='ra'?'credit if the supplier takes it — no RA yet':'credit once it ships'})).filter(x=>x.amt>0).sort((a,b)=>(a.t.by||'9')<(b.t.by||'9')?-1:1);
  const sum=f=>items.filter(f).reduce((s,x)=>s+x.amt,0);
  const tiles=[['Due back this week',sum(x=>x.t.st!=='shipped'&&x.t.by&&x.t.by<=wk),'warn'],['Shipped — credit not in',sum(x=>x.t.st==='shipped'),''],['Waiting on an RA',sum(x=>x.t.st==='ra'),'']];
  return `<div class="pt-risk pt-tbl"><div class="pt-ch"><b>Money at risk</b><small>owed back to us, and what’s lost if a part doesn’t go back</small></div><div class="pt-tiles">${tiles.map(x=>`<div class="${x[2]}"><small>${x[0]}</small><b>${usd(x[1])}</b></div>`).join('')}</div>${items.slice(0,4).map(x=>{ const a=retAct(x.t); return `<div class="pt-rk"><span class="dt${retLate(x.t)?' late':''}">${x.t.by&&x.t.st!=='shipped'?short(x.t.by):x.t.st==='shipped'?'waiting':'no date'}</span><span class="m">${x.t.id}</span><span class="d"><b>${esc(x.t.desc)}</b><small>${esc(x.why)}</small></span><span class="m r">${usd(x.amt)}</span>${a?`<button class="btn btn-sm" data-a="rdo" data-tid="${x.t.id}">${a[1]}</button>`:'<span></span>'}</div>`; }).join('')}</div>`; }
function kitPrice(k){ return k.kids.reduce((s,x)=>s+(cat(x[0]).price*x[1]),0); }
function vCat(){
  const q=U.cq.trim().toLowerCase(), hay=c=>[c.pn,c.desc,c.fit,c.bin].join(' ').toLowerCase();
  let L=S.C.filter(c=>!q||hay(c).includes(q)); if(U.cflt==='low') L=L.filter(c=>c.min&&c.oh<c.min);
  const kits=U.cflt==='low'?[]:KITS0.filter(k=>!q||[k.pn,k.desc,k.fit].join(' ').toLowerCase().includes(q)||k.kids.some(x=>hay(cat(x[0])).includes(q)));
  const nLow=S.C.filter(c=>c.min&&c.oh<c.min).length;
  const row=c=>{ const low=c.min&&c.oh<c.min; return `<div class="pt-cr"><span></span><span class="d"><b>${esc(c.desc)}</b>${low?'<span class="pt-low">Low</span>':''}</span><span class="m">${c.pn}</span><span class="oh${low?' low':''}">${c.oh}${c.min?`<span style="color:var(--tg-ink4);font-weight:400">/ ${c.min}</span>`:''}</span><span class="m">${c.bin||'—'}</span><span class="m r">${usd(c.price)}</span><span class="fit">${esc(c.fit)}</span><span class="ac">${low?`<button class="btn btn-sm" data-a="reorder" data-pn="${c.pn}">Reorder</button>`:''}</span></div>`; };
  const krow=k=>{ const o=U.kopen[k.pn]!==false; return `<div class="pt-cr"><button class="car${o?' open':''}" data-a="kit" data-pn="${k.pn}" title="Show the parts in this kit">${ic('chevR',13)}</button><span class="d"><span class="pt-kitb">KIT · ${k.kids.length}</span><b>${esc(k.desc)}</b></span><span class="m">${k.pn}</span><span class="oh">${Math.min(...k.kids.map(x=>Math.floor(cat(x[0]).oh/x[1])))}</span><span class="m">—</span><span class="m r">${usd(kitPrice(k))}</span><span class="fit">${esc(k.fit)}</span><span class="ac"></span></div>`+(o?k.kids.map(x=>{ const c=cat(x[0]); return `<div class="pt-cr kid"><span></span><span class="d"><b>${esc(c.desc)}</b><span style="color:var(--tg-ink3)">× ${x[1]}</span></span><span class="m">${c.pn}</span><span class="oh">${c.oh}</span><span class="m">${c.bin||'—'}</span><span class="m r">${usd(c.price)}</span><span class="fit">fits the kit</span><span></span></div>`; }).join(''):''); };
  return `<div class="pt-full"><div class="pt-fh"><h2>Catalog</h2><span class="tg-hf" style="cursor:default">${S.C.length} parts · ${KITS0.length} kits · what we stock, where it sits, what it costs</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Paste a parts list, quote or invoice — or read a screenshot or PDF.">${ic('scan',14)}Extract parts</button><button class="btn btn-sm" data-a="toast" data-t="New kit — name it, then add parts.">${ic('kit',14)}Kit</button><button class="btn btn-sm btn-primary" data-a="toast" data-t="New part — part #, description, price, bin.">${ic('plus',14)}Part</button></div>
   ${stockCards()}<div class="pt-cbar"><input id="pt-cq" placeholder="Search part #, description, engine, bin…" value="${esc(U.cq)}"><span class="tg-seg3"><button class="${U.cflt==='all'?'on':''}" data-a="cflt" data-v="all">All</button><button class="${U.cflt==='low'?'on':''}" data-a="cflt" data-v="low">Low stock · ${nLow}</button></span><span class="sp"></span></div>
   <div class="pt-tbl"><div class="pt-cr h"><span></span><span>Description</span><span>Part #</span><span class="r">On hand / min</span><span>Bin</span><span class="r">Price</span><span>Fits</span><span></span></div>${kits.map(krow).join('')}${L.map(row).join('')||'<div class="pt-none">Nothing matches.</div>'}</div></div>`;
}
/* ---------- popovers ---------- */
function dueLines(){ const R=[]; S.R.forEach(r=>lines(r).forEach(p=>{ if(p.st==='Ordered'&&(p.eta===TODAY||late(p))) R.push({r,p}); })); return R; }
const usedBins=()=>new Set(S.R.flatMap(lines).filter(p=>p.st==='Staged').map(p=>p.bin));
const nextBin=()=>{ const used=usedBins(); return BINS.find(b=>!used.has(b))||'A8'; };
function newCands(){ const L=[];
  S.R.forEach(r=>lines(r).forEach(p=>{ if(p.st==='Staged'||p.st==='Received') L.push({k:'ro:'+p.id,pid:p.id,ro:r.no,cust:r.cust,desc:p.desc,pn:p.pn,qty:p.qty,price:p.price,st:p.st,to:p.sup==='fp'?'FleetPride':'Volvo PDC'}); }));
  S.C.forEach(c=>{ if(c.min&&c.oh>=c.min*3) L.push({k:'cat:'+c.pn,desc:c.desc,pn:c.pn,qty:c.oh-c.min*2,price:c.price,oh:c.oh,min:c.min,to:'Volvo PDC'}); });
  return L; }
function pop(){
  const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const st=`style="left:${p.x||400}px;top:${p.y||12}px"`;
  const r=p.ro?get(p.ro):null;
  if(p.type==='st'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===p.pid); if(!f) return '';
    const H=STH;
    return `<div class="tg-pop menu" ${st}><div class="tg-ph"><b>${esc(f.q.desc)}</b><span class="cu">${f.q.pn}</span></div>${Object.keys(H).map((k,i)=>`${k==='Received'?'<div class="pt-mis"></div>':''}<button class="tg-mi${f.q.st===k?' on':''}" data-a="setst" data-pid="${p.pid}" data-v="${k}"><span class="pt-dot" style="background:var(${stVar(k)})"></span>${stTxt[k]}<span class="meta">${H[k]}</span></button>`).join('')}</div>`; }
  if(p.type==='order'){ const no=lines(r).filter(x=>x.st==='Not Ordered'), stk=no.filter(x=>cat(x.pn).oh>=x.qty), buy=no.filter(x=>cat(x.pn).oh<x.qty);
    const O=[['pdc','Volvo PDC · stock order','arrives Mon 10/26 · no freight'],['vor','Volvo PDC · rush (VOR)','arrives tomorrow, Fri 10/23 by 07:00'],['fp','FleetPride','today by 16:00 · '+(buy.length===1?'has 1':'not every part')]];
    const amt=no.reduce((s,x)=>s+x.price*x.qty,0);
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Order parts',`${r.no} · ${esc(r.cust)}`)}<div class="pt-lst">${no.map(x=>{ const c=cat(x.pn), s=c.oh>=x.qty; return `<label class="pt-ln"><input type="checkbox" checked disabled><span class="d"><b>${esc(x.desc)}</b><small>${x.pn} · × ${x.qty}</small></span><span class="r"><b>${usd(x.price*x.qty)}</b>${s?`<span class="stk">from stock · bin ${c.bin}</span>`:'to order'}</span></label>`; }).join('')}</div>
      ${buy.length?`<span class="tg-lbl top" style="margin-top:10px">Order ${buy.length} from</span>${O.map((o,i)=>`<button class="pt-opt${p.o===i?' on':''}" data-a="oset" data-o="${i}"${o[0]==='fp'&&buy.length>1?' disabled':''}>${kbd(i+1)}<b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}
      <div class="pt-two"><label class="pt-f"><span>PO #</span><input id="pt-po" value="${esc(p.po||'55831')}"></label><label class="pt-f"><span>ETA</span><input value="${p.o==null?'':p.o===0?'Mon 10/26':p.o===1?'Fri 10/23 · 07:00':'Thu 10/22 · 16:00'}" readonly placeholder="pick a supplier"></label></div>
      <label class="pt-ck"><input type="checkbox" data-a="tell" ${p.tell!==false?'checked':''}>Send ${F(r.wr)} the ETA — she updates the customer</label>`:`<div class="pt-ctx" style="margin-top:10px">Everything is on the shelf — it goes to the RO’s bin, nothing to order.</div>`}
      <div class="tg-acts"><span class="hint">${stk.length?stk.length+' from stock · ':''}${buy.length?buy.length+' to order · ':''}${usd(amt)}</span><button class="btn btn-sm btn-primary" data-a="ogo"${buy.length&&p.o==null?' disabled':''}>${buy.length&&stk.length?`Order ${buy.length} · pull ${stk.length}`:buy.length?`Order ${buy.length===1?'it':buy.length+' parts'}`:`Pull ${stk.length===1?'it':stk.length+' parts'}`}${kbd('↵')}</button></div></div>`; }
  if(p.type==='chase'){ const x=lines(r).find(late), l=late(x);
    const D=[addD(TODAY,1),addD(TODAY,4),addD(TODAY,5)];
    const O=[['New date from the supplier','pick it below'],['Backordered — no date yet','checks again tomorrow'],['Get it somewhere else','FleetPride has 1 · today by 16:00 · '+usd(x.price*1.05)]];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Chase a late part',`${r.no} · ${esc(r.cust)}`)}<div class="pt-ctx"><b>${esc(x.desc)}</b> · ${x.pn} · ${SUP[x.sup]} · PO ${x.po}<br>${l.k==='late'?`Was due ${short(x.eta)} — ${l.n} day${l.n>1?'s':''} late.`:l.k==='bo'?`Backordered since ${short(x.ord)}.`:`Ordered ${short(x.ord)} — no date yet.`}${r.spot[0]==='B'?` The truck is holding <b>bay ${r.spot.slice(1)}</b>.`:''}</div>
      ${O.map((o,i)=>`<button class="pt-opt${p.o===i?' on':''}" data-a="oset" data-o="${i}">${kbd(i+1)}<b>${o[0]}</b><small>${o[1]}</small></button>`).join('')}
      ${p.o===0?`<div class="tg-r" style="margin:8px 0 0 10px">${D.map(k=>`<button class="tg-chip${p.d===k?' on':''}" data-a="dset" data-d="${k}">${short(k)}</button>`).join('')}</div>`:''}
      <label class="pt-ck"><input type="checkbox" data-a="tell" ${p.tell!==false?'checked':''}>Tell ${F(r.wr)} — it lands in her “Parts delayed” message to the customer</label>
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="cgo"${p.o==null||(p.o===0&&!p.d)?' disabled':''}>Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='hand'){ const b=binOf(r);
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Send to Frank',`${r.no} · ${esc(r.cust)}`)}<div class="pt-ctx">All ${lines(r).length} parts are in, <b>bin ${b}</b>. The truck is on <b>${r.spot}</b>; <b>${F(r.tech)}</b> is the tech.</div>
      <span class="tg-lbl top">Note</span><input id="pt-hn" style="width:100%" value="${esc(p.n!=null?p.n:`All parts in — bin ${b}.`)}">
      <div class="tg-acts"><span class="hint">Frank sees it under Sent to you, then brings it in</span><button class="btn btn-sm btn-primary" data-a="hgo">Send to Frank${kbd('↵')}</button></div></div>`; }
  if(p.type==='ret'){ const R=['Missing part number','Not approved yet','Missing information','Wrong department'];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Send it back',`to ${F(r.route.from)} · ${r.no}`)}<div class="tg-r">${R.map(x=>`<button class="tg-chip${p.why===x?' on':''}" data-a="rset" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <div class="tg-acts"><span class="hint">It goes back to ${F(r.route.from)} with the reason</span><button class="btn btn-sm btn-primary" data-a="rgo"${p.why?'':' disabled'}>Send back${kbd('↵')}</button></div></div>`; }
  const T=p.tid?getT(p.tid):null;
  const tctx=t=>`<div class="pt-ctx"><b>${t.id} · ${esc(t.desc)}${t.qty>1?' × '+t.qty:''}</b> · ${t.pn} · shelf ${t.shelf} <span class="pt-kind ${t.kind}">${KIND[t.kind]}</span><br>${t.ro?`RO ${t.ro} · ${esc(t.cust)} · `:'From stock · '}${esc(t.why)}</div>`;
  if(p.type==='ship'&&T){ const t=T, C=t.kind==='warranty'?['UPS','FedEx','Volvo PDC truck']:t.kind==='core'?['Volvo PDC truck','FleetPride pickup']:['Volvo PDC truck','UPS','FleetPride pickup'];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd(t.kind==='warranty'?'Ship a warranty return':t.kind==='core'?'Send a core back':'Ship a supplier return',`to ${esc(t.to)}`)}${tctx(t)}
      <div class="pt-kv">${t.kind==='warranty'?`<span>RA</span><b>${t.ra}</b><span>Claim</span><b>${t.claim}</b><span>Ship by</span><b>${short(t.by)}</b>`:t.kind==='core'?`<span>Core credit</span><b>${usd(t.credit)}</b><span>Back by</span><b>${short(t.by)}</b>`:`<span>RA</span><b>${t.ra}</b><span>Credit</span><b>${usd(t.credit)}</b><span>Fee</span><b>15% restocking</b>`}</div>
      <span class="tg-lbl top">How it goes</span><div class="tg-r">${C.map(c=>`<button class="tg-chip${p.c===c?' on':''}" data-a="cset" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      ${p.c==='UPS'||p.c==='FedEx'?`<label class="pt-f"><span>Tracking #</span><input id="pt-tr" value="${esc(p.tr||'')}" placeholder="1Z…"></label>`:''}
      <div class="tg-acts"><span class="hint">${t.kind==='warranty'?'Warranty sees the tracking on the claim':'Credit is due once it lands'}</span><button class="btn btn-sm btn-primary" data-a="sgo"${p.c?'':' disabled'}>Mark shipped${kbd('↵')}</button></div></div>`; }
  if(p.type==='ra'&&T){ const t=T;
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Ask for a return authorization',`${esc(t.to)}`)}${tctx(t)}
      <div class="pt-kv"><span>Credit if they take it</span><b>${usd(t.credit)}</b><span>Fee</span><b>15% restocking</b></div>
      <label class="pt-f"><span>RA # from ${esc(t.to)}</span><input id="pt-ra" value="${esc(p.ra||'')}" placeholder="Type it when they send it"></label>
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="raask">Asked — waiting on them</button><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="rago">Save RA${kbd('↵')}</button></div></div>`; }
  if(p.type==='credit'&&T){ const t=T;
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Credit in',`${esc(t.to)}`)}${tctx(t)}
      <div class="pt-two"><label class="pt-f"><span>Credit received</span><input id="pt-cr" value="${esc(p.cr!=null?p.cr:t.credit.toFixed(2))}"></label><label class="pt-f"><span>Credit memo #</span><input id="pt-cm" value="${esc(p.cm||'')}" placeholder="CM-…"></label></div>
      <div class="tg-acts"><span class="hint">Expected ${usd(t.credit)} · shipped ${esc(t.shipped)}</span><button class="btn btn-sm btn-primary" data-a="crgo">Credit in${kbd('↵')}</button></div></div>`; }
  if(p.type==='hold'&&T){ const t=T, O=[['Scrap it','Holding is done · logged on the claim'],['Keep 14 more days','Volvo may still ask for it'],['Give it back to the customer','Logged on the RO']];
    return `<div class="tg-pop xf pt-pop-w" ${st}>${hd('Done holding',`${t.id}`)}${tctx(t)}${O.map((o,i)=>`<button class="pt-opt${p.o===i?' on':''}" data-a="oset" data-o="${i}">${kbd(i+1)}<b>${o[0]}</b><small>${o[1]}</small></button>`).join('')}
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="hogo"${p.o==null?' disabled':''}>Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='newret'){ const C=newCands(), R=['Wrong part','Not needed — job declined','Damaged','Overstock','Core'], c=C.find(x=>x.k===p.k);
    return `<div class="tg-pop xf pt-pop-x" ${st}>${hd('Start a return','Parts runs it from here')}<span class="tg-lbl top">What’s going back</span><div class="pt-lst" style="max-height:220px">${C.map(x=>`<label class="pt-ln${p.k===x.k?' hit':''}" data-a="nrk" data-k="${x.k}"><input type="radio" ${p.k===x.k?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.desc)}${x.qty>1?' × '+x.qty:''} · <span style="font-family:var(--tg-mono);font-weight:500">${x.pn}</span></b><small>${x.ro?`${x.ro} · ${esc(x.cust)} · ${stTxt[x.st]}`:`Stock · ${x.oh} on hand, min ${x.min}`}</small></span><span class="r"><b>${usd(x.price*x.qty)}</b>${esc(x.to)}</span></label>`).join('')}</div>
      <span class="tg-lbl top" style="margin-top:10px">Why</span><div class="tg-r">${R.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="nrw" data-v="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      ${c&&p.why?`<div class="pt-kv" style="margin-top:10px"><span>Goes to</span><b>${esc(c.to)}</b><span>Shelf</span><b>${p.why==='Core'?'K3':'R4'}</b><span>Credit</span><b>${usd(c.price*c.qty*(p.why==='Core'?1:.85))}${p.why==='Core'?'':' after 15%'}</b></div>${c.ro&&(p.why==='Wrong part'||p.why==='Damaged')?`<div class="pt-ctx" style="margin:8px 0 0">The RO still needs one — the line goes back to <b>Not ordered</b> so it can be ordered again.</div>`:''}`:''}
      <div class="tg-acts"><span class="hint">${p.why==='Core'?'Cores ship without an RA':'Next: ask for an RA'}</span><button class="btn btn-sm btn-primary" data-a="nrgo"${c&&p.why?'':' disabled'}>Start return${kbd('↵')}</button></div></div>`; }
  if(p.type==='label'){ const X=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).filter(x=>x.q.st==='Staged'&&x.q.bin===p.bin); if(!X.length) return ''; const rr=X[0].r;
    return `<div class="tg-pop xf pt-pop-w pt-label" ${st}>${hd('Bin label',`${p.bin} · ${rr.no}`)}<div class="pt-lab"><div class="t"><b>${p.bin}</b><span><b>${rr.no} · ${esc(rr.cust)}</b><small>${esc(PPL[rr.tech])} · Unit ${esc(rr.unit)} · staged ${hm(Math.max(...X.map(x=>x.q.rcv||0)))}</small></span></div>${barcode('BIN-'+p.bin+'-'+rr.no)}<div class="ls">${X.map(x=>`<div><span>${x.q.qty} ×</span>${esc(x.q.desc)}<em>${x.q.pn}</em></div>`).join('')}</div><div class="f">Scan with the Parsec phone app to pick up</div></div>
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="scanpk" data-bin="${p.bin}">${ic('scan',14)}Try it — ${F(rr.tech)} scans it</button><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="toast" data-t="Label prints — 4 × 2 in, one per bin.">${ic('print',14)}Print${kbd('↵')}</button></div></div>`; }
  if(p.type==='send'){ const D=[['writer','Service writer',PPL[r.wr]],['foreman','Foreman','Frank Delaney'],['tech','Technician',PPL[r.tech]],['warranty','Warranty','Warranty desk']];
    return `<div class="tg-pop menu" ${st}><div class="tg-ph"><b>Send ${r.no} to…</b></div>${D.map((d,i)=>`<button class="tg-mi" data-a="toast" data-t="Sent to ${d[2]} — it shows under their Sent to you.">${kbd(i+1)}${d[1]}<span class="meta">${esc(d[2])}</span></button>`).join('')}</div>`; }
  if(p.type==='chk'){ const L=dueLines(), sel=p.sel||{}, n=Object.keys(sel).filter(k=>sel[k]).length;
    const ln=x=>{ const on=!!sel[x.p.id], l=late(x.p), stg=p.stage!==false; return `<label class="pt-ln${p.hit===x.p.id?' hit':''}" data-a="ckl" data-pid="${x.p.id}"><input type="checkbox" ${on?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.p.desc)} · <span style="font-family:var(--tg-mono);font-weight:500">${x.p.pn}</span> × ${x.p.qty}</b><small>${x.r.no} · ${esc(x.r.cust)} · ${SUP[x.p.sup]} PO ${x.p.po}${l?' · '+l.t:''}</small></span><span class="r">${on?`<b>${stg?'→ bin '+x.bin:'→ receiving'}</b>`:''}${on&&lines(x.r).filter(q=>q.id!==x.p.id).every(q=>inHand(q)||sel[q.id])?'<span class="stk">RO complete</span>':''}</span></label>`; };
    const used=usedBins(); L.forEach(x=>{ let b=binOf(x.r)||x.r._b; if(!b&&sel[x.p.id]){ b=BINS.find(z=>!used.has(z))||'A8'; used.add(b); x.r._b=b; } x.bin=b; });
    S.R.forEach(r=>delete r._b);
    const today=L.filter(x=>!late(x.p)), lt=L.filter(x=>late(x.p));
    return `<div class="tg-pop xf pt-pop-x" ${st}>${hd('Check in a delivery','Volvo PDC · afternoon truck')}${chkHead(p)}
      <div class="pt-lst">${today.length?`<div class="pt-lh">${ic('calendar',12)}Due today · ${today.length}</div>${today.map(ln).join('')}`:''}${lt.length?`<div class="pt-lh late">${ic('clock',12)}Late — may be on this truck · ${lt.length}</div>${lt.map(ln).join('')}`:''}${L.length?'':'<div class="pt-none">Nothing due — every order is in.</div>'}</div>
      <label class="pt-ck"><input type="checkbox" data-a="stg" ${p.stage!==false?'checked':''}><span>Put them on bins now — <b style="font-weight:500">Staged</b>. Off: they wait at receiving as <b style="font-weight:500">Received</b>.</span></label><div class="tg-acts"><span class="hint">${n?n+' ticked':'tick what came'}</span><button class="btn btn-sm btn-primary" data-a="kgo"${n?'':' disabled'}>Check in ${n||''} part${n===1?'':'s'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='srch'){ const q=(p.q||'').trim().toLowerCase(); const res=[];
    if(q){ S.T.forEach(t=>{ if([t.id,t.pn,t.desc,t.ro||'',t.cust||''].join(' ').toLowerCase().includes(q)) res.push({k:'ret',t}); });
      S.R.forEach(r=>{ lines(r).forEach(x=>{ if([x.pn,x.desc,r.no,r.cust].join(' ').toLowerCase().includes(q)) res.push({k:'ro',r,x}); }); if(!lines(r).length&&[r.no,r.cust].join(' ').toLowerCase().includes(q)) res.push({k:'ro',r,x:null}); });
      S.C.forEach(c=>{ if([c.pn,c.desc].join(' ').toLowerCase().includes(q)) res.push({k:'cat',c}); }); }
    const R=res.slice(0,7);
    return `<div class="tg-pop menu pt-pop-w" ${st}><div class="pt-srin">${ic('search',15)}<input id="pt-sq" placeholder="Part #, part, RO or customer" value="${esc(p.q||'')}" autocomplete="off"></div>${q?(R.length?R.map((x,i)=>x.k==='ret'?`<button class="pt-srr${i===0?' k':''}" data-a="rsel" data-tid="${x.t.id}"><span class="gi">${ic('undo',14)}</span><b>${x.t.id} · ${esc(x.t.desc)}</b><span class="m">${x.t.pn}</span><small>Return · ${KIND[x.t.kind]} · ${rstTxt(x.t)} · shelf ${x.t.shelf}</small></button>`:x.k==='ro'?`<button class="pt-srr${i===0?' k':''}" data-a="open" data-ro="${x.r.no}" data-k="ro"><span class="gi">${ic('ros',14)}</span><b>${x.x?esc(x.x.desc)+' · ':''}${x.r.no} ${esc(x.r.cust)}</b><span class="m">${x.x?x.x.pn:''}</span><small>${x.x?`${stTxt[x.x.st]}${x.x.bin&&x.x.st==='Staged'?' · bin '+x.x.bin:''}${x.x.eta&&!inHand(x.x)?' · due '+short(x.x.eta):''}`:'Returns only'}</small></button>`:`<button class="pt-srr${i===0?' k':''}" data-a="open" data-k="cat" data-pn="${x.c.pn}"><span class="gi">${ic('book',14)}</span><b>${esc(x.c.desc)}</b><span class="m">${x.c.pn}</span><small>Catalog · ${x.c.oh} on hand${x.c.bin?' · bin '+x.c.bin:''} · ${usd(x.c.price)}</small></button>`).join(''):`<div class="pt-none">Nothing matches “${esc(p.q)}”.</div>`):'<div class="pt-none">Where is it, who’s it for, is it in? Try 22972342, “radiator” or 37628.</div>'}</div>`; }
  return '';
}
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
const logIt=(r,t)=>r.log.unshift(['10/22 '+hm(NOW),t]);
function clear(r,why){ U.done.push(r.no); r.doneAt=hm(NOW); r.doneWhy=why; const L=flat(); U.sel=L[0]||r.no; }
function doIt(no,el){ const r=get(no); if(!r) return; U.sel=no; const st=stateOf(r);
  if(st==='sent'||st==='counter'){ snap(); r.route.acc=1; logIt(r,'Parts accepted');
    if(r.route.now){ const p=lines(r)[0], c=cat(p.pn); c.oh-=p.qty; Object.assign(p,{st:'Picked up',sup:'stock',bin:'',rcv:NOW,pk:NOW}); logIt(r,`Pulled from stock · bin ${c.bin} · <b>${F(r.tech)}</b> picked it up at the counter`); toast(`Pulled the ${lc(p.desc)} from ${c.bin} — ${F(r.tech)} picked it up. ${c.oh} left on the shelf.`); render(); return; }
    toast(`Accepted — ${r.no} is under To order.`); render(); return; }
  if(st==='order') return openPop('order',{ro:no,tell:true},el);
  if(st==='late') return openPop('chase',{ro:no,tell:true},el);
  if(st==='in'){ const rc=rcvd(r); if(rc.length){ snap(); const b=binOf(r)||nextBin(); rc.forEach(p=>{ p.st='Staged'; p.bin=b; }); logIt(r,`Staged · ${rc.map(p=>p.desc).join(', ')} · bin ${b}`); U.ask=[r.no]; toast(`Staged in ${b} — every part for ${r.no} is on its bin.`); render(); return; } return openPop('hand',{ro:no},el); }
  if(st==='ret'){ const t=retsOf(r).find(needs); return openPop(retAct(t)[0],{tid:t.id,ro:no},el); }
  U.view='desk'; render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop, r=p&&p.ro?get(p.ro):null, T_=p&&p.tid?getT(p.tid):null;
  if(a==='sel'){ if(e.target.closest('.tg-go')) return; U.sel=t.dataset.ro; U.kb=false; U.pop=null; render(); }
  else if(a==='do'){ e.stopPropagation(); U.pop=null; doIt(t.dataset.ro,t); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='hf'){ const k=t.dataset.k; if(k==='due'){ U.view='order'; render(); return; } if(k==='rets'){ U.view='ret'; render(); return; } const G=grouped(); if(G[k]&&G[k].length){ U.view='desk'; U.sel=G[k][0].no; render(); } }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p&&!t.dataset.pid){ U.pop=null; render(); return; } const ex={}; if(t.dataset.pid) ex.pid=t.dataset.pid; if(t.dataset.ro) ex.ro=t.dataset.ro; if(t.dataset.tid) ex.tid=t.dataset.tid; if(t.dataset.bin) ex.bin=t.dataset.bin; if(t.dataset.p==='chk') ex.sel={}; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='open'){ if(t.dataset.k==='ro'){ U.view='desk'; U.sel=t.dataset.ro; U.pop=null; const st=stateOf(get(t.dataset.ro)); if(st==='way') U.open.way=true; if(st==='done') U.open.done=true; render(); } else if(t.dataset.k==='cat'){ U.view='cat'; U.cq=t.dataset.pn; U.pop=null; render(); } else { U.open[t.dataset.k]=!U.open[t.dataset.k]; render(); } }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='setst'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); if(!f) return; snap(); const v=t.dataset.v, q=f.q; q.st=v;
    if(v==='Staged'&&!q.bin){ q.bin=binOf(f.r)||nextBin(); q.rcv=q.rcv||NOW; } if(v==='Received'){ q.bin=''; q.rcv=q.rcv||NOW; } if(v==='Picked up'||v==='Installed'){ q.pk=q.pk||NOW; q.bin=''; } if(v==='Ordered'&&!q.po){ q.sup='pdc'; q.po='55831'; q.ord=TODAY; q.eta=addD(TODAY,4); }
    logIt(f.r,`${q.desc} → ${stTxt[v]}${v==='Staged'?' · bin '+q.bin:''}`); U.pop=null; toast(`${q.desc} · ${stTxt[v]}${v==='Staged'?' · bin '+q.bin:''}.`); render(); }
  else if(a==='rcv1'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); snap(); f.q.st='Staged'; f.q.bin=binOf(f.r)||nextBin(); f.q.rcv=NOW; logIt(f.r,`Checked in · ${f.q.desc} · staged in ${f.q.bin}`); const full=lines(f.r).every(inHand); if(full) U.ask=[f.r.no]; toast(`${f.q.desc} checked in · staged in ${f.q.bin}${full?' — every part is in.':'.'}`); render(); }
  else if(a==='stage1'||a==='stageto'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); if(!f) return; snap(); f.q.st='Staged'; f.q.bin=t.dataset.bin||binOf(f.r)||nextBin(); logIt(f.r,`Staged · ${f.q.desc} · bin ${f.q.bin}`); const full=lines(f.r).every(inHand); if(full) U.ask=[f.r.no]; toast(`${f.q.desc} staged in ${f.q.bin}.`); render(); }
  else if(a==='pk1'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); snap(); const b=f.q.bin; Object.assign(f.q,{st:'Picked up',pk:NOW,bin:''}); logIt(f.r,`<b>${F(f.r.tech)}</b> picked up ${f.q.desc} · bin ${b}`); toast(`${F(f.r.tech)} picked up the ${lc(f.q.desc)}.`); render(); }
  else if(a==='pickup'){ e.stopPropagation(); const b=t.dataset.bin, X=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).filter(x=>x.q.st==='Staged'&&x.q.bin===b); if(!X.length) return; snap(); X.forEach(x=>Object.assign(x.q,{st:'Picked up',pk:NOW,bin:''})); const r=X[0].r; logIt(r,`<b>${F(r.tech)}</b> picked up bin ${b} · ${X.length} part${X.length>1?'s':''}`); toast(`Bin ${b} picked up by ${F(r.tech)} — ${X.length} part${X.length>1?'s':''}. The bin is free.`); render(); }
  else if(a==='notyet'||a==='askno'){ U.ask=[]; U.pop=null; toast(`OK — ${a==='notyet'?t.dataset.ro+' stays':'they stay'} under Arrived until you send ${a==='notyet'?'it':'them'}.`,false); render(); }
  else if(a==='asksend'||a==='askall'){ snap(); const L=a==='askall'?U.ask.slice():[t.dataset.ro]; L.forEach(no=>{ const r=get(no); if(!r||stateOf(r)!=='in') return; logIt(r,`Parts → <b>Frank</b> · “All parts in — bin ${binOf(r)}.”`); clear(r,`Sent to Frank · all parts in, bin ${binOf(r)}`); }); U.ask=U.ask.filter(x=>!L.includes(x)); toast(`Sent to Frank — ${L.join(' and ')} ${L.length>1?'are':'is'} under his Sent to you.`); render(); }
  else if(a==='rdo'){ e.stopPropagation(); const x=getT(t.dataset.tid), ac=retAct(x); if(ac) openPop(ac[0],{tid:x.id},t); }
  else if(a==='rsel'){ U.view='ret'; U.rsel=t.dataset.tid; U.pop=null; render(); const el=$(`.pt-rr[data-tid="${U.rsel}"]`); if(el) el.scrollIntoView({block:'center'}); }
  else if(a==='rflt'){ U.rflt=t.dataset.v; render(); }
  else if(a==='rulem'){ U.rule[t.dataset.k]=t.dataset.v; toast(t.dataset.v==='ask'?'Asks first — the way you set it.':'Changed for this mock only — your call was Ask first.',false); render(); }
  else if(a==='stg'){ p.stage=t.checked; render(); }
  else if(a==='nrk'){ e.preventDefault(); p.k=t.dataset.k; render(); }
  else if(a==='nrw'){ p.why=t.dataset.v; render(); }
  else if(a==='nrgo'){ const c=newCands().find(x=>x.k===p.k); if(!c||!p.why) return; snap(); const core=p.why==='Core', n=S.T.filter(x=>x.id[0]===(core?'C':'R')).length+1, id=(core?'C-200':'R-300')+n;
    S.T.push({id,kind:core?'core':'supplier',desc:c.desc,pn:c.pn,qty:c.qty,ro:c.ro||null,cust:c.cust,st:core?'ship':'ra',by:core?addD(TODAY,30):null,shelf:core?'K3':'R4',to:c.to,why:p.why,credit:Math.round(c.price*c.qty*(core?1:.85)*100)/100});
    if(c.ro){ const r=get(c.ro), q=lines(r).find(x=>x.id===c.pid); if(p.why==='Wrong part'||p.why==='Damaged'){ Object.assign(q,{st:'Not Ordered',bin:'',po:'',eta:null}); logIt(r,`${q.desc} going back (${p.why.toLowerCase()}) · ${id} · needs ordering again`); } else if(p.why==='Not needed — job declined'){ r.ops.forEach(o=>o.parts=o.parts.filter(x=>x.id!==c.pid)); logIt(r,`${q.desc} going back · ${id} · not needed`); } }
    else { const cc=cat(c.pn); if(cc) cc.oh-=c.qty; }
    U.pop=null; U.view='ret'; U.rsel=id; toast(`${id} started — ${core?'ready to ship':'ask '+c.to+' for an RA'}.${c.ro&&(p.why==='Wrong part'||p.why==='Damaged')?` ${c.ro} needs a new one — it’s under To order.`:''}`); render(); }
  else if(a==='rago'){ const v=(($('#pt-ra')||{}).value||'').trim(); if(!v){ toast('Type the RA # first — or pick “Asked — waiting on them”.',false); render(); return; } snap(); T_.ra=v; T_.st='ship'; U.pop=null; toast(`${T_.id} · RA ${v} — ready to ship.`); render(); }
  else if(a==='raask'){ snap(); T_.asked=hm(NOW); U.pop=null; toast(`${T_.id} · asked ${T_.to} for an RA — it stays under To do.`); render(); }
  else if(a==='crgo'){ snap(); const v=parseFloat(($('#pt-cr')||{}).value)||T_.credit; T_.st='credited'; T_.credited=md(TODAY); T_.credit=v; U.pop=null; toast(`${T_.id} · ${usd(v)} credit in — closed.`); render(); }
  else if(a==='hogo'){ snap(); if(p.o===0){ T_.st='scrapped'; } else if(p.o===1){ T_.by=addD(TODAY,14); } else { T_.st='back'; } U.pop=null; toast(`${T_.id} · ${p.o===0?'scrapped — logged on the claim':p.o===1?'kept until '+short(T_.by):'given back to the customer'}.`); render(); }

  else if(a==='oset'){ p.o=+t.dataset.o; render(); }
  else if(a==='dset'){ p.d=t.dataset.d; render(); }
  else if(a==='tell'){ p.tell=t.checked; }
  else if(a==='ogo'){ const no=lines(r).filter(x=>x.st==='Not Ordered'), buy=no.filter(x=>cat(x.pn).oh<x.qty); if(buy.length&&p.o==null) return; snap();
    const po=($('#pt-po')||{}).value||'55831', sup=['pdc','vor','fp'][p.o], eta=[addD(TODAY,4),addD(TODAY,1),TODAY][p.o]; let b=binOf(r);
    no.forEach(x=>{ const c=cat(x.pn); if(c.oh>=x.qty){ c.oh-=x.qty; b=b||nextBin(); Object.assign(x,{st:'Staged',sup:'stock',bin:b,rcv:NOW}); } else Object.assign(x,{st:'Ordered',sup,po,ord:TODAY,eta}); });
    const stk=no.length-buy.length; if(stk) logIt(r,`${stk} pulled from stock · bin ${b}`); if(buy.length){ logIt(r,`Ordered ${buy.length} · PO ${po} · ${SUP[sup]} · due ${eta===TODAY?'today 16:00':short(eta)}`); if(p.tell!==false){ logIt(r,`ETA sent to <b>${F(r.wr)}</b> for the customer`); r.told='10/22'; } }
    if(!buy.length) U.ask=[r.no]; U.pop=null; toast(buy.length?`Ordered ${buy.length}${stk?` · ${stk} pulled from stock`:''} — due ${eta===TODAY?'today 16:00':short(eta)}${p.tell!==false?`. ${F(r.wr)} has the ETA.`:'.'}`:`Pulled ${stk} from stock — staged in ${b}. Every part is in.`); render(); }
  else if(a==='cgo'){ const x=lines(r).find(late); if(!x||p.o==null) return; snap();
    if(p.o===0){ x.eta=p.d; x.st='Ordered'; logIt(r,`${SUP[x.sup]}: new date ${short(p.d)}`); }
    else if(p.o===1){ x.st='Backordered'; x.eta=null; x.ord=x.ord||TODAY; logIt(r,`${SUP[x.sup]}: backordered, no date`); }
    else { x.sup='fp'; x.po='55832'; x.ord=TODAY; x.eta=TODAY; x.st='Ordered'; x.price=Math.round(x.price*105)/100; logIt(r,`Re-ordered from FleetPride · PO 55832 · due today 16:00`); }
    if(p.tell!==false){ logIt(r,`<b>${F(r.wr)}</b> told · “Parts delayed” message ready for the customer`); r.told='10/22'; }
    U.pop=null; toast(`${p.o===0?'New date '+short(p.d):p.o===1?'Marked backordered':'Coming from FleetPride today'}${p.tell!==false?` — ${F(r.wr)} has it for the customer.`:'.'}`); render(); }
  else if(a==='hgo'){ snap(); U.ask=U.ask.filter(x=>x!==r.no); const n=($('#pt-hn')||{}).value||''; logIt(r,`Parts → <b>Frank</b> · “${esc(n)}”`); clear(r,`Sent to Frank · ${n}`); U.pop=null; toast(`Sent to Frank — ${r.no} is under his Sent to you.`); render(); }
  else if(a==='rset'){ p.why=t.dataset.v; render(); }
  else if(a==='rgo'){ snap(); logIt(r,`Sent back to <b>${F(r.route.from)}</b> · ${p.why}`); clear(r,`Back to ${F(r.route.from)} · ${p.why}`); U.pop=null; toast(`Sent back to ${F(r.route.from)} — “${p.why}”.`); render(); }
  else if(a==='cset'){ p.c=t.dataset.v; render(); }
  else if(a==='sgo'){ const t=T_; if(!t||!p.c) return; snap(); t.shipped=`${md(TODAY)} · ${p.c}`; t.st='shipped'; if(t.kind==='warranty') t.trk=p.tr||''; const rr=t.ro&&get(t.ro); if(rr) logIt(rr,`${t.id} shipped · ${p.c}${p.tr?' · '+esc(p.tr):''}`); U.pop=null; toast(t.kind==='warranty'?`${t.id} shipped — Warranty sees it on claim ${t.claim}.`:`${t.id} shipped — ${usd(t.credit)} credit due once it lands.`); render(); }
  else if(a==='ckl'){ e.preventDefault(); p.sel[t.dataset.pid]=!p.sel[t.dataset.pid]; p.hit=null; render(); }
  else if(a==='kgo'){ const L=dueLines().filter(x=>p.sel[x.p.id]); if(!L.length) return; snap(); const done=new Set(); const SL=p.mode==='slip'?parseSlip(p.slip||'').filter(x=>x.stock):[]; SL.forEach(x=>{ x.stock.oh+=x.q; });
    const stg=p.stage!==false; L.forEach(x=>{ const b=stg?(binOf(x.r)||nextBin()):''; Object.assign(x.p,{st:stg?'Staged':'Received',bin:b,rcv:NOW}); done.add(x.r.no); logIt(x.r,`Checked in · ${x.p.desc}${stg?' · staged in '+b:' · at receiving'}`); });
    const full=[...done].filter(no=>lines(get(no)).every(inHand)&&!rcvd(get(no)).length);
    U.pop=null; U.ask=full; toast(`${L.length} part${L.length>1?'s':''} checked in${p.stage!==false?' and staged':' — waiting at receiving'}${SL.length?` · ${SL.map(x=>'+'+x.q+' '+x.stock.desc.toLowerCase()+'s').join(', ')} to stock`:''}.`); if(full.length){ U.view='desk'; U.sel=full[0]; } render(); }
  else if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }
  else if(a==='sgadd'||a==='sgall'){ const rr=get(t.dataset.ro); snap(); const L=(SUGG[rr.no]||[]).filter(x=>!lines(rr).some(q=>q.pn===x[0])&&(a==='sgall'||x[0]===t.dataset.pn)); L.forEach(x=>{ rr.ops[0].parts.push(pt(x[0],x[1])); }); logIt(rr,`Added from past jobs · ${L.map(x=>cat(x[0]).desc).join(', ')}`); toast(`Added ${L.map(x=>cat(x[0]).desc).join(' and ')} — ${L.length>1?'they go':'it goes'} on the same order.`); render(); }
  else if(a==='sgno'){ U.sg[t.dataset.ro]=1; toast('Hidden for this RO.',false); render(); }
  else if(a==='pullahead'){ const rr=get(t.dataset.ro); snap(); const L=lines(rr).filter(p=>p.st==='Not Ordered'&&(cat(p.pn)||{}).oh>=p.qty), b=binOf(rr)||nextBin(); L.forEach(p=>{ cat(p.pn).oh-=p.qty; Object.assign(p,{st:'Staged',sup:'stock',bin:b,rcv:NOW}); }); logIt(rr,`Pulled ahead for ${t.dataset.bay} · ${L.map(p=>p.desc).join(', ')} · bin ${b}`); const left=lines(rr).filter(p=>p.st==='Not Ordered'); toast(`Pulled ${L.length} to ${b} for ${t.dataset.bay}${left.length?` — the ${lc(left[0].desc)} still needs ordering`:''}.`); render(); }
  else if(a==='sosend'){ U.so=hm(NOW); toast(`Stock order sent to Volvo PDC — ${S.C.filter(c=>c.min&&c.oh<c.min).length} lines, due Mon 10/26.`,false); render(); }
  else if(a==='ccsave'){ const ch=[]; S.C.forEach(c=>{ const v=U.cc[c.pn]; if(v!==''&&v!=null&&+v!==c.oh){ ch.push(`${c.desc.toLowerCase()} ${c.oh} → ${+v}`); c.oh=+v; } }); U.counted=hm(NOW); toast(ch.length?`Shelf F counted — ${ch.join(', ')}. On hand fixed.`:'Shelf F counted — everything matches.',false); render(); }
  else if(a==='scanpk'){ const b=t.dataset.bin, X=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).filter(x=>x.q.st==='Staged'&&x.q.bin===b); if(!X.length) return; snap(); X.forEach(x=>Object.assign(x.q,{st:'Picked up',pk:NOW,bin:''})); const rr=X[0].r; logIt(rr,`<b>${F(rr.tech)}</b> scanned bin ${b} · ${X.length} part${X.length>1?'s':''} picked up`); U.pop=null; toast(`${F(rr.tech)} scanned ${b} — ${X.length} part${X.length>1?'s':''} picked up at ${hm(NOW)}.`); render(); }
  else if(a==='cmode'){ p.mode=t.dataset.v; p._f=0; if(p.mode==='slip'&&p.slip) slipSel(p); render(); }
  else if(a==='cflt'){ U.cflt=t.dataset.v; render(); }
  else if(a==='kit'){ U.kopen[t.dataset.pn]=U.kopen[t.dataset.pn]===false; render(); }
  else if(a==='reorder'){ const c=cat(t.dataset.pn), q=c.min-c.oh+Math.max(1,Math.ceil(c.min/2)); toast(`${c.desc} · ${q} added to the next stock order — ${c.oh+q} on hand once it lands (min ${c.min}).`,false); render(); }
  else if(a==='undo'){ if(UNDO.length){ const x=JSON.parse(UNDO.pop()); S=x.S; U.done=x.done; U.ask=x.ask||[]; TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('input',e=>{ const p=U.pop, id=e.target.id;
  if(id==='pt-cq'){ U.cq=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#pt-cq'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } return; }
  if(e.target.dataset.cc){ const pn=e.target.dataset.cc, c=cat(pn), v=e.target.value; U.cc[pn]=v; const s=e.target.nextElementSibling; if(s){ const d=v===''?null:(+v-c.oh); s.textContent=d==null?'':d===0?'matches':(d>0?'+':'')+d; s.className='dv'+(d==null?'':d?' off':' ok'); } return; }
  if(id==='pt-slip'&&p){ p.slip=e.target.value; slipSel(p); const pos=e.target.selectionStart; render(); const f=$('#pt-slip'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } return; }
  if(e.target.dataset.set){ const k=e.target.dataset.set; U.set[k]=e.target.value; const c=e.target.parentNode.querySelector('.pt-ph'); if(c){ c.textContent=e.target.value?'set':'placeholder'; c.classList.toggle('set',!!e.target.value); } return; }
  if(!p) return;
  if(id==='pt-hn') p.n=e.target.value; if(id==='pt-ra') p.ra=e.target.value; if(id==='pt-cr') p.cr=e.target.value; if(id==='pt-cm') p.cm=e.target.value; if(id==='pt-po') p.po=e.target.value; if(id==='pt-tr') p.tr=e.target.value;
  if(id==='pt-sq'){ p.q=e.target.value; render(); const f=$('#pt-sq'); if(f){ f.focus(); f.setSelectionRange(f.value.length,f.value.length); } }
  if(id==='pt-scan') p.q=e.target.value; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"],[data-a="rdo"],.tk-note')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.pop=null; render(); }
function scanHit(){ const p=U.pop, q=(p.q||'').replace(/\s/g,''); if(!q) return; const x=dueLines().find(y=>y.p.pn===q||y.p.pn.endsWith(q)&&q.length>=4);
  if(x){ p.sel[x.p.id]=true; p.hit=x.p.id; p.q=''; } else { p.q=''; toast(`${q} isn’t on any open order — check the packing slip.`,false); } render(); const f=$('#pt-scan'); if(f) f.focus(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'&&e.target.id==='pt-scan'){ if((p.q||'').trim()){ scanHit(); return stop(); } }
    if(k==='Enter'&&e.target.id==='pt-sq'){ const b=$('.tg-pop .pt-srr'); if(b) b.click(); return stop(); }
    if(k==='Enter'&&e.target.tagName==='TEXTAREA') return;
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(inF) return; const n=+k; if(n>=1&&n<=4){ const b=$(`.tg-pop [data-a="oset"][data-o="${n-1}"]:not([disabled])`)||$$('.tg-pop .tg-mi')[n-1]; if(b){ b.click(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){ if(U.view!=='desk'){ U.view='desk'; } move(1); return stop(); } if(k==='k'){ if(U.view!=='desk'){ U.view='desk'; } move(-1); return stop(); }
  if(k==='Enter'&&U.view==='desk'&&U.sel){ const b=$(`.tg-it[data-ro="${U.sel}"] .tg-go`); if(b) doIt(U.sel,b); return stop(); }
  if(k==='c'){ const b=$('[data-a="pop"][data-p="chk"]'); if(b) openPop('chk',{sel:{}},b); return stop(); }
  if(k==='/'){ const b=$('[data-a="pop"][data-p="srch"]'); if(b) openPop('srch',{},b); return stop(); }
  if(k>='1'&&k<='5'){ U.view=['desk','order','shelf','ret','cat'][+k-1]; render(); return stop(); }
});
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.pt').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-290)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); }
    else { x=W-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #pt-slip')||$('.tg-pop #pt-scan')||$('.tg-pop #pt-sq')||$('.tg-pop #pt-hn')||$('.tg-pop #pt-ra'); if(f){ U.pop._f=1; f.focus(); if(f.id==='pt-hn') f.select(); } }
  note();
}
const NOTE={
 1:{r:'.pt-msg',t:'At the counter',p:'Techs ask from the Console or the phone app — the part, the bay, a photo. It lands on top with a wait timer, already matched to the catalog. Pull it hands it over.'},
 2:{r:'.pt-up',t:'Pull ahead',p:'Frank’s Up next list, from the Parts side. What’s on the shelf gets pulled to a bin before the bay frees up, so the tech starts the minute the truck rolls in.'},
 3:{r:'.pt-sug',t:'Usually goes with this job',p:'From past ROs with the same complaint. The writer sees the same list on the estimate, so what gets approved is what gets ordered.'},
 4:{u:['.pt-reo','.pt-cnt'],t:'Stock that orders itself',p:'Below its min, a part joins the next stock order by itself, back up to max. One shelf is counted each day, and the count fixes the on-hand number.'},
 5:{r:'.pt-label',at:'left',t:'Bin labels you can scan',p:'Every bin gets a label with a barcode. The tech scans it with the phone when they take the parts — Picked up, with name and time, no typing.'},
 6:{r:'.tg-pop',at:'left',t:'Paste the packing slip',p:'Paste it, or drop the PDF or a photo of it. Lines that match open orders tick themselves; anything else goes to stock.'},
 7:{r:'.pt-sc',t:'Supplier scorecard',p:'On time against the day they promised, average days late, last 90 days. Hover a row for the numbers.'},
 8:{r:'.pt-risk',t:'Money at risk',p:'Core credits, supplier credits and warranty claims that need their part back — by due date, so nothing quietly runs out.'},
 9:{r:'.pt-bay',t:'Bays held for parts',p:'Days a truck sits in a bay waiting on a part. Frank sees it on his Floor; the manager sees the month. Hover a week.'}
};
function box(sels){ const L=[].concat(sels).map(s=>$(s)).filter(Boolean); if(!L.length) return null; const tk=$('.pt').getBoundingClientRect(); let l=1e9,t=1e9,r=-1e9,b=-1e9;
  L.forEach(e=>{ const x=e.getBoundingClientRect(); l=Math.min(l,x.left); t=Math.min(t,x.top); r=Math.max(r,x.right); b=Math.max(b,x.bottom); }); return {l:(l-tk.left)/scale,t:(t-tk.top)/scale,r:(r-tk.left)/scale,b:(b-tk.top)/scale}; }
const pick=s=>Array.isArray(s)?s.find(x=>$(x)):s;
function note(){ const nt=$('.tk-note'), rg=$('.tk-ring'), tk=$('.pt'); if(!nt||!rg||!tk) return; const N=U.note&&NOTE[U.note]; const R=N?(N.u?box(N.u):box(pick(N.r))):null;
  if(!R){ nt.hidden=true; rg.hidden=true; return; }
  rg.hidden=false; Object.assign(rg.style,{left:(R.l-5)+'px',top:(R.t-5)+'px',width:(R.r-R.l+10)+'px',height:(R.b-R.t+10)+'px'});
  nt.innerHTML=`<div class="h"><span class="n">${U.note}</span><b>${esc(N.t)}</b><button data-a="notex" title="Close">${ic('x',13)}</button></div><p>${esc(N.p)}</p>`; nt.hidden=false;
  const A=(N.n&&box(pick(N.n)))||R, W=tk.offsetWidth, H=tk.offsetHeight, nw=nt.offsetWidth, nh=nt.offsetHeight; let x, y;
  if(N.at==='right'&&A.r+nw+16<W-12){ x=A.r+16; y=A.t-6; } else if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; } else { x=N.al==='right'?A.r-nw:A.l; y=A.b+12; if(y+nh>H-12) y=A.t-nh-16; }
  nt.style.left=Math.round(Math.max(12,Math.min(x,W-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  d1:()=>{reset();U.sel='37688';U.note=1;render();},
  d2:()=>{reset();U.view='shelf';U.note=2;render();},
  d3:()=>{reset();get('37750').route.acc=1;U.sel='37750';U.note=3;render();},
  d4:()=>{reset();U.view='cat';U.cc={'21707133':'14','21380475':'8','23223434':'7'};U.note=4;render();},
  d5:()=>{reset();U.view='shelf';render();const b=$('.pt-bin [data-p="label"][data-bin="A3"]');openPop('label',{bin:'A3'},b);U.note=5;render();},
  d6:()=>{reset();U.sel='37628';render();const b=$('[data-a="pop"][data-p="chk"]');const p={mode:'slip',slip:SLIP,sel:{}};slipSel(p);openPop('chk',p,b);U.note=6;render();},
  d7:()=>{reset();U.view='order';U.note=7;render();},
  d8:()=>{reset();U.view='ret';U.note=8;render();},
  d9:()=>{reset();U.view='order';U.note=9;render();},
  try:()=>{reset();render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__pt={S:()=>S,U:()=>U,render,reset,openPop,DEMO,stateOf,get,dueLines};
reset(); render();
