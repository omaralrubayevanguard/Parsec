
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const p2=n=>String(n).padStart(2,'0');
const usd=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=n=>'$'+Math.round(n).toLocaleString('en-US');
const hm=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const h1=n=>(Math.round(n*10)/10).toFixed(1);
const TODAY='2026-10-22', NOW=14*60+15;
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dOf=k=>{ const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
const kOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const addD=(k,n)=>{ const d=dOf(k); d.setDate(d.getDate()+n); return kOf(d); };
const fd=k=>{ if(!k) return '—'; const d=dOf(k); return MN[d.getMonth()]+' '+d.getDate()+(d.getFullYear()!==2026?', '+d.getFullYear():''); };
const dd=(a,b)=>Math.round((dOf(b)-dOf(a))/86400000);
const PPL={AM:'Alicia Moore',JT:'Jordan Tate',FD:'Frank Delaney',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
PPL.RH='Ray Holloway';
const F=k=>PPL[k].split(' ')[0];
const ROLES={tech:['AW','Technician'],lt:['MR','Lead tech'],fm:['FD','Foreman'],tr:['AM','Triage'],mg:['RH','Manager']};
const me=()=>ROLES[U.role][0], myRole=()=>ROLES[U.role][1], isRev=()=>U.role!=='tech';
function setRole(r){ U.role=r; U.pop=null; if(r==='tech'&&U.view==='rev') U.view='lib'; $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role===r)); }
const lc=s=>/^[A-Z][a-z]/.test(s)?s[0].toLowerCase()+s.slice(1):s;
const RATE=210;
const SYS={aft:['Aftertreatment','filter'],eng:['Engine','engine'],cool:['Cooling','drop'],elec:['Electrical','bolt'],air:['Air and brakes','air'],cab:['Cab and A/C','snow'],drv:['Drivetrain','gear2']};
const CUST=['Midway Auto Transport','Prairie Line Trucking','Piedmont Aggregates','Silverline LTL','Highplains Grain','Red Mesa Hauling','Copperline Transport','Dixie Fleet Services','Triad Cold Chain','Elkin Hardwoods','Uwharrie Fuel','Surry Feed & Seed','Keystone Carriers','Iron Horse Logistics','Rowan Ready Mix','Yadkin Valley Freight','Sandhills Grain','Catawba Timber','Mount Airy Logistics','Haw River Dairy','Alamance Hauling','Forsyth Fleet Services'];
const TRUCK=['2018 Volvo VNL 670','2019 Volvo VNL 760','2020 Volvo VNL 760','2021 Volvo VNL 860','2019 Volvo VNR 640','2022 Volvo VNL 760','2020 Volvo VHD','2017 Volvo VNL 670'];
const TECHS=['MR','DK','LM','PS','AW','KT'];
const ONHAND={'22827993':3,'23295841':0,'21512367':4,'22770789':0,'21340719':2,'23137410':0,'21751883':0,'22972342':0,'22479124':1,'21468475':0,'20734264':5,'21789944':0,'21531071':2,'21399788':0,'23175123':0,'21620181':1,'20972915':3,'21511217':4,'85137802':0,'22411521':0,'21877394':2,'20750712':12,'85023114':0,'21302012':1,'22011837':1};
/* the complaints: how each was fixed, and how often each way */
const G0=[
 {k:'nox',sys:'aft',t:'Outlet NOx sensor — check engine light',n:9,eng:['D13','D13','D13 TC','D11'],V:[{w:9,cause:'Outlet NOx sensor reading out of range — failed the sensor test',fix:'Replaced the outlet NOx sensor, ran a parked regen, no return',parts:[['22827993','Outlet NOx sensor',1,486.20]],codes:['SPN 3226 FMI 2'],h:[0.8,1.3],q:1.0}]},
 {k:'doser',sys:'aft',t:'DEF doser clogged — derate',n:5,V:[{w:4,cause:'Doser tip crystallized — flow test failed',fix:'Replaced the DEF doser and gasket, flushed the line, flow test good',parts:[['23295841','DEF doser',1,742.18],['21512367','Doser gasket',1,9.60]],codes:['SPN 3361 FMI 7'],h:[1.1,1.7],q:1.3},{w:1,cause:'Doser line kinked behind the tank',fix:'Re-routed and replaced the doser line',parts:[['22011837','DEF line, doser',1,88.40]],codes:['SPN 3361 FMI 7'],h:[0.9,1.2],q:1.3}],tip:'1 of 5 times it was a kinked line behind the tank, not the doser. Check the line before ordering a $742 doser.'},
 {k:'dpfp',sys:'aft',t:'DPF pressure sensor — fault code',n:4,V:[{w:3,cause:'Sensor reading stuck high',fix:'Replaced the DPF pressure sensor, cleared codes',parts:[['22770789','DPF pressure sensor',1,186.40]],codes:['SPN 3251 FMI 2'],h:[0.5,0.9],q:0.7},{w:1,cause:'Sensor hose cracked',fix:'Replaced the sensor hose',parts:[['21340719','DPF sensor hose',1,24.10]],codes:['SPN 3251 FMI 2'],h:[0.4,0.6],q:0.7}],tip:'1 of 4 times it was a cracked sensor hose — a $24 part.'},
 {k:'egr',sys:'aft',t:'EGR valve stuck — derate',n:3,V:[{w:2,cause:'Valve sticking at 40% — carbon build-up',fix:'Replaced the EGR valve, ran the EGR test in Tech Tool',parts:[['23137410','EGR valve',1,968.00]],codes:['SPN 27 FMI 7'],h:[1.8,2.6],q:2.0},{w:1,cause:'EGR cooler leaking coolant into the valve',fix:'Replaced the EGR cooler and the valve, pressure tested the cooling system',parts:[['21751883','EGR cooler gasket kit',1,46.90],['23137410','EGR valve',1,968.00]],codes:['SPN 27 FMI 7'],h:[5.4,6.1],q:2.0}],tip:'1 of 3 came back — the EGR cooler was leaking coolant into the valve. Look for coolant in the valve before replacing it.',ord:[1,0,0],cb:[[1,21]]},
 {k:'turbo',sys:'eng',t:'Turbo actuator fault — low boost',n:6,eng:['D13 TC','D13 TC','D13'],V:[{w:5,cause:'Actuator sticking — failed the actuator test in Tech Tool',fix:'Replaced the turbo actuator, calibrated with Tech Tool, road tested',parts:[['22972342','Turbo actuator',1,1348.00]],codes:['SPN 641 FMI 7'],h:[1.3,2.1],q:1.6},{w:1,cause:'Actuator connector pin backed out',fix:'Re-pinned the actuator connector',parts:[],codes:['SPN 641 FMI 5'],h:[0.6,0.8],q:1.6}],tip:'1 of 6 was a backed-out connector pin — and it came back 9 days later. Check the connector, then test the actuator.',ord:[0,0,0,1,0,0],cb:[[3,9]]},
 {k:'inj',sys:'eng',t:'Misfire cylinder 4 — injector',n:5,V:[{w:5,cause:'Cylinder cut-out test failed on 4',fix:'Replaced injector 4, cut-out test good',parts:[['22479124','Injector',1,684.00]],codes:['SPN 654 FMI 7'],h:[2.6,3.4],q:3.0}]},
 {k:'wp',sys:'cool',t:'Coolant leak at water pump',n:7,V:[{w:7,cause:'Weep hole leaking — the pump seal failed',fix:'Replaced the water pump and gasket, pressure tested, holds',parts:[['21468475','Water pump',1,398.70],['20734264','Water pump gasket',1,14.20]],codes:[],h:[2.6,3.4],q:3.0}]},
 {k:'cts',sys:'cool',t:'Coolant temp sensor — erratic reading',n:3,V:[{w:2,cause:'Connector corroded — the sensor tested good',fix:'Cleaned and re-pinned the connector, replaced the pigtail',parts:[['21789944','Connector pigtail, 2-pin',1,38.75]],codes:['SPN 110 FMI 2'],h:[0.5,0.8],q:0.8},{w:1,cause:'Sensor failed internally',fix:'Replaced the coolant temp sensor',parts:[['21531071','Coolant temp sensor',1,64.20]],codes:['SPN 110 FMI 2'],h:[0.6,0.9],q:0.8}],tip:'2 of 3 times it was the connector, not the sensor. Test the sensor before you order one — the pigtail is $38.75.'},
 {k:'rad',sys:'cool',t:'Radiator leak — lower tank',n:2,V:[{w:2,cause:'Lower tank cracked at the seam',fix:'Replaced the radiator, pressure tested',parts:[['21399788','Radiator',1,2214.00]],codes:[],h:[4.2,5.1],q:4.5}]},
 {k:'alt',sys:'elec',t:'Alternator not charging — 12.1 V at idle',n:4,V:[{w:4,cause:'Rectifier failed — no output above 12.2 V',fix:'Replaced the alternator, verified 14.1 V at idle',parts:[['23175123','Alternator 24V 130A',1,512.00]],codes:['SPN 167 FMI 1'],h:[1.2,1.7],q:1.5}]},
 {k:'dryer',sys:'air',t:'Air dryer purging constantly',n:4,V:[{w:4,cause:'Purge valve leaking',fix:'Replaced the purge valve and the cartridge',parts:[['21620181','Purge valve, air dryer',1,142.60],['20972915','Air dryer cartridge',1,96.30]],codes:[],h:[0.7,1.1],q:1.0}]},
 {k:'seal',sys:'air',t:'Wheel seal leaking — drive axle',n:6,V:[{w:6,cause:'Seal worn — oil on the shoes',fix:'Replaced the wheel seal and the shoes on that end, refilled the hub',parts:[['21511217','Wheel seal',1,58.30],['85137802','Brake shoe kit, 16.5 × 7',1,192.00]],codes:[],h:[2.6,3.2],q:2.4}]},
 {k:'ac',sys:'cab',t:'A/C not cooling — compressor clutch',n:3,V:[{w:3,cause:'Clutch coil open',fix:'Replaced the compressor and the receiver drier, evacuated and recharged',parts:[['22411521','A/C compressor',1,1186.40],['21877394','Receiver drier',1,88.50],['20750712','PAG oil, 8 oz',1,18.90]],codes:[],h:[2.1,2.9],q:2.4}]},
 {k:'clutch',sys:'drv',t:'Clutch slipping — replace clutch',n:2,V:[{w:2,cause:'Clutch worn past spec',fix:'Replaced the clutch and the release bearing',parts:[['85023114','Clutch kit, 15.5"',1,1642.00],['21302012','Release bearing',1,214.50]],codes:[],h:[7.5,9.0],q:8.0}]},
 {k:'cel',sys:'aft',t:'Check engine light — aftertreatment fault',n:2,V:[{w:1,cause:'Outlet NOx sensor out of range',fix:'Replaced the outlet NOx sensor',parts:[['22827993','Outlet NOx sensor',1,486.20]],codes:['SPN 3226 FMI 2'],h:[0.9,1.2],q:1.0},{w:1,cause:'DPF pressure sensor stuck high',fix:'Replaced the DPF pressure sensor',parts:[['22770789','DPF pressure sensor',1,186.40]],codes:['SPN 3251 FMI 2'],h:[0.6,0.8],q:0.8}]}
];
function rng(seed){ let a=0; for(const c of seed) a=(a*31+c.charCodeAt(0))|0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
let EID=0;
function build(g){ const r=rng(g.k), E=[]; let day=TODAY, V=[]; g.V.forEach(v=>{ for(let i=0;i<v.w;i++) V.push(v); });
  for(let i=0;i<g.n;i++){ day=addD(day,-(6+Math.floor(r()*70))); const v=g.ord?g.V[g.ord[i]]:V[i%V.length];
    const h=Math.round((v.h[0]+r()*(v.h[1]-v.h[0]))*10)/10, q=v.q, eng=(g.eng||['D13','D13','D13 TC','D11'])[Math.floor(r()*(g.eng||[1,2,3,4]).length)];
    const no=String(37700-Math.round(dd(day,TODAY)*7.5)-Math.floor(r()*5)), pc=v.parts.reduce((s,p)=>s+p[2]*p[3],0);
    E.push({id:'e'+(++EID),k:g.k,date:day,ro:no,cust:CUST[Math.floor(r()*CUST.length)],truck:TRUCK[Math.floor(r()*TRUCK.length)],eng,miles:120000+Math.floor(r()*500)*1000,vin:'…'+'JKLMN'[Math.floor(r()*5)]+'N'+String(100000+Math.floor(r()*899999)).slice(0,6),
      cause:v.cause,fix:v.fix,parts:v.parts,codes:v.codes,tech:TECHS[Math.floor(r()*TECHS.length)],h,q,cost:Math.round(pc+q*RATE),out:'ok'}); }
  (g.cb||[]).forEach(([i,days])=>{ if(E[i]){ E[i].out='cb'; E[i].back=days; const f=E[i-1]; if(f){ Object.assign(f,{date:addD(E[i].date,days),cust:E[i].cust,truck:E[i].truck,eng:E[i].eng,vin:E[i].vin,miles:E[i].miles+2400,ro:String(+E[i].ro+Math.round(days*7.5))}); f.after=E[i].ro; } E[i].backRo=f?f.ro:String(+E[i].ro+Math.round(days*7.5)); } });
  return E; }
/* trucks in the shop now, by complaint */
const OPEN0=[
 {no:'37760',k:'nox',cust:'Piedmont Aggregates',truck:'2018 Volvo VNL 670',eng:'D13',miles:412300,tech:'MR',wr:'AM',spot:'L14',q:null,parts:[],in:'today 13:40'},
 {no:'37388',k:'doser',cust:'Elkin Hardwoods',truck:'2021 Volvo VNR 640',eng:'D13',miles:288400,tech:'DK',wr:'AM',spot:'L9',q:null,parts:['23295841','21512367'],in:'10/21'},
 {no:'37628',by:'JT',k:'turbo',cust:'Prairie Line Trucking',truck:'2019 Volvo VNL 860',eng:'D13 TC',miles:501200,tech:'MR',wr:'JT',spot:'L12',q:1.6,parts:['22972342'],from:'37455',in:'10/20'},
 {no:'37544',k:'egr',cust:'Copperline Transport',truck:'2018 Volvo VNL 760',eng:'D13',miles:466900,tech:'AW',wr:'AM',spot:'L3',q:2.0,parts:['23137410'],in:'10/15'},
 {no:'37519',k:'cts',cust:'Dixie Fleet Services',truck:'2018 Volvo VNL 670',eng:'D13',miles:538700,tech:'MR',wr:'JT',spot:'L2',q:0.8,parts:['21531071','21789944'],in:'10/22'},
 {no:'37750',by:'AM',k:'ac',cust:'Yadkin Valley Freight',truck:'2020 Volvo VNL 760',eng:'D13',miles:322100,tech:'LM',wr:'AM',spot:'L4',q:2.4,parts:['22411521','21877394'],from:'36992',in:'10/22'},
 {no:'37466',by:'FD',k:'inj',cust:'Uwharrie Fuel',truck:'2019 Volvo VNL 860',eng:'D13',miles:612800,tech:'PS',wr:'JT',spot:'B6',q:3.0,parts:['22479124'],from:'37104',in:'10/22'},
 {no:'37203',k:'rad',cust:'Surry Feed & Seed',truck:'2019 Volvo VNL 760',eng:'D13',miles:397500,tech:'LM',wr:'AM',spot:'B9',q:4.5,parts:['21399788'],in:'10/19'}
];
/* finished this week — landed in Fixes, some need a better write-up */
const REV0=[
 {id:'r1',k:'dryer',ro:'37742',cust:'Rowan Ready Mix',tech:'DK',truck:'2020 Volvo VHD',eng:'D11',gap:'short',cmp:'Air dryer purging constantly',cause:'Purge valve leaking',fix:'replaced',noteFix:'Replaced the purge valve and the cartridge — no more purging at idle',note:'Purge valve leaking at the dryer — replaced valve and cartridge, no more purging at idle.'},
 {id:'r2',k:'wp',ro:'37455',cust:'Highplains Grain',tech:'AW',truck:'2021 Volvo VNL 760',eng:'D13',gap:'cause',cmp:'Coolant leak at water pump',cause:'',fix:'Replaced the water pump and gasket',noteCause:'Weep hole was wet — the pump seal failed',note:'Water pump out, gasket surface cleaned. Weep hole was wet, seal gone.'},
 {id:'r3',k:'seal',ro:'37612',cust:'Midway Auto Transport',tech:'MR',truck:'2019 Volvo VNL 760',eng:'D13',gap:'dup',cmp:'Wheel seal leaking — drive axle, left rear',cause:'Seal worn',fix:'Replaced wheel seal and both shoes on that end, refilled hub'},
 {id:'r4',k:'nox',ro:'37502',cust:'Piedmont Aggregates',tech:'MR',truck:'2018 Volvo VNL 670',eng:'D13',gap:'code',cmp:'Outlet NOx sensor — check engine light',cause:'Sensor out of range',fix:'Replaced outlet NOx sensor, ran a parked regen, no return'},
 {id:'r5',k:'dpfp',ro:'37590',cust:'Silverline LTL',tech:'MR',truck:'2020 Volvo VNL 760',eng:'D13 TC',gap:'none',cmp:'DPF pressure sensor — fault code',cause:'Sensor reading stuck high',fix:'Replaced the DPF pressure sensor, cleaned the DPF',ok:1}
];
let S,U,UNDO,TOAST,TT;
function reset(){ EID=0; const E={}; G0.forEach(g=>{ E[g.k]=build(g); }); S={E,O:JSON.parse(JSON.stringify(OPEN0)),R:JSON.parse(JSON.stringify(REV0)),M:[],extra:{},std:{wp:{fix:'Replaced the water pump and gasket, pressure tested, holds',note:'Clean the gasket surface down to bare metal — a rushed surface is the usual weep.',by:'FD',at:'Sep 30'}},kits:{},qo:{},qk:{}};
  const e0=E.nox[0], days=dd(e0.date,TODAY); Object.assign(e0,{out:'cb',back:days,backRo:'37795',live:1});
  S.O.push({no:'37795',k:'nox',cust:e0.cust,truck:e0.truck,eng:e0.eng,miles:e0.miles+6100,tech:'DK',wr:'JT',spot:'L15',q:null,parts:[],in:'today 11:20',cb:{ro:e0.ro,days,date:e0.date}});
  S.O.push({no:'37802',k:'nox',cmp:'Check engine light on, derate warning',code:'SPN 3226 FMI 2',cust:'Catawba Timber',truck:'2019 Volvo VNL 860',eng:'D13',miles:455200,tech:'KT',wr:'AM',spot:'L16',q:null,parts:[],in:'today 12:05'});
  U={view:'lib',sel:'nox',pop:null,kb:false,sort:'count',grp:'sys',flt:false,open:{},q:'',role:'fm',fe:null,fmdl:null,fmi:null,note:null,hl:null,steps:{}}; $$('[data-role]').forEach(x=>x.classList.toggle('is-on',x.dataset.role==='fm')); UNDO=[]; TOAST=null; }
const snap=()=>{ UNDO.push(JSON.stringify(S)); if(UNDO.length>30) UNDO.shift(); };
function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }
const grp=k=>G0.find(g=>g.k===k);
let FILT=false; const band=m=>m<300000?'lo':m<500000?'mid':'hi';
const passF=e=>!FILT||((!U.fe||e.eng===U.fe)&&(!U.fmdl||String(e.truck).includes(U.fmdl))&&(!U.fmi||band(e.miles)===U.fmi));
const nF=()=>[U.fe,U.fmdl,U.fmi].filter(Boolean).length;
const ents=k=>(S.E[k]||[]).concat(S.M.filter(m=>m.k===k)).filter(passF).sort((a,b)=>a.date<b.date?1:-1);
const opensOf=k=>S.O.filter(o=>o.k===k);
const pend=o=>!o.q||!o.parts.length;
function stats(k){ const E=ents(k), g=grp(k), cb=E.filter(e=>e.out==='cb').length, hrs=E.reduce((s,e)=>s+e.h,0)/E.length, q=(S.qo[k])||g.V[0].q, cost=E.reduce((s,e)=>s+e.cost,0)/E.length;
  const T={}; E.forEach(e=>{ T[e.tech]=(T[e.tech]||0)+1; }); const top=Object.keys(T).sort((a,b)=>T[b]-T[a])[0];
  const C={}, X={}, PT={}, CD={}; E.forEach(e=>{ C[e.cause]=(C[e.cause]||0)+1; X[e.fix]=(X[e.fix]||0)+1; e.parts.forEach(p=>{ PT[p[0]]=PT[p[0]]||{p,n:0}; PT[p[0]].n++; }); e.codes.forEach(c=>{ CD[c]=(CD[c]||0)+1; }); });
  const srt=o=>Object.keys(o).sort((a,b)=>o[b]-o[a]);
  return {E,n:E.length,cb,hrs,q,cost,top,topN:T[top],causes:srt(C).map(c=>[c,C[c]]),fixes:srt(X).map(c=>[c,X[c]]),parts:Object.values(PT).sort((a,b)=>b.n-a.n),codes:srt(CD).map(c=>[c,CD[c]]),trucks:new Set(E.map(e=>e.vin)).size,engs:[...new Set(E.map(e=>e.eng))]}; }
function groupsList(){ let L=G0.filter(g=>ents(g.k).length); if(U.flt) L=L.filter(g=>opensOf(g.k).length);
  if(U.sort==='recent') L.sort((a,b)=>ents(a.k)[0].date<ents(b.k)[0].date?1:-1); else if(U.sort==='az') L.sort((a,b)=>a.t.localeCompare(b.t)); else L.sort((a,b)=>ents(b.k).length-ents(a.k).length);
  return L; }
const flat=()=>{ const L=groupsList(); if(U.grp!=='sys') return L.map(g=>g.k); return Object.keys(SYS).flatMap(s=>L.filter(g=>g.sys===s)).map(g=>g.k); };

/* ---------- drawing ---------- */
function render(){
  if(U.role==='tech'&&U.view==='rev') U.view='lib';
  if(U.view==='trend'&&U.role!=='mg'&&U.role!=='fm') U.view='lib';
  FILT=U.view==='lib';
  const v=U.view, body=v==='open'?vOpen():v==='rev'?vRev():v==='trend'?vTrend():vLib();
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='fixes'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg fx">${head()}<div class="tg-body v-${v}">${v==='lib'?list():''}<div class="tg-main">${body}</div>${pop()}</div><div class="tk-tip" hidden></div><div class="tk-ring" hidden></div><div class="tk-note" hidden></div></div>${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const n=G0.reduce((s,g)=>s+ents(g.k).length,0), op=S.O.filter(o=>pend(o)).length, rv=S.R.filter(r=>!r.ok&&!r.done).length, wk=S.R.length;
  const vs=[['lib','book','Library'],['open','ros','Open ROs'],['rev','note','Review'],['trend','chart','Trends']].filter(x=>(isRev()||x[0]!=='rev')&&(x[0]!=='trend'||U.role==='mg'||U.role==='fm'));
  return `<header class="tg-head"><h1 class="tg-h1">Fixes</h1><span class="tg-facts"><span class="tg-hf" style="cursor:default"><b>${n}</b>fixes</span><i>·</i><span class="tg-hf" style="cursor:default"><b>${G0.length}</b>complaints</span><i>·</i>${S.O.filter(o=>o.cb).length?`<button class="tg-hf bad" data-a="gocb"><b>${S.O.filter(o=>o.cb).length}</b>comeback</button><i>·</i>`:''}${op?`<button class="tg-hf w" data-a="view" data-v="open"><b>${op}</b>open ROs can use one</button><i>·</i>`:''}${rv&&isRev()?`<button class="tg-hf" data-a="view" data-v="rev"><b>${rv}</b>to review</button><i>·</i>`:''}<span class="tg-hf" style="cursor:default"><b>${wk}</b>new this week</span></span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>
  <button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Search complaint, cause, code, part # or VIN (/)">${ic('search',16)}</button><button class="btn btn-sm btn-primary" data-a="pop" data-p="add" title="Add a fix by hand (A)" style="height:30px">${ic('plus',15)}Add a fix</button></header>`;
}
function list(){
  const L=groupsList(), s=U.sel, nOpen=G0.filter(g=>opensOf(g.k).length).length;
  const item=g=>{ const E=ents(g.k), on=g.k===s, o=opensOf(g.k), cb=E.filter(e=>e.out==='cb').length;
    return `<div class="tg-it${on?' on':''}${on&&U.kb?' kb':''}" data-a="sel" data-k="${g.k}"><span class="tg-gi">${ic(SYS[g.sys][1],15)}</span><span class="tg-t"><b class="cmp">${esc(g.t)}</b>${S.std[g.k]?`<span class="fx-star" title="Shop standard">${ic('star',12)}</span>`:''}<span class="fx-n">${E.length}×</span></span><span class="tg-w${cb?' late':''}">Last ${fd(E[0].date)} · ${[...new Set(E.map(e=>e.eng))].slice(0,2).join(', ')}${cb?` · ${cb} came back`:''}${g.tip&&!cb?' · worth knowing':''}</span>${o.length?`<span class="fx-open" title="${o.map(x=>x.no).join(', ')}">${o.length} open</span>`:''}</div>`; };
  let body;
  if(U.grp==='sys') body=Object.keys(SYS).map(sk=>{ const X=L.filter(g=>g.sys===sk); return X.length?`<div class="tg-grp">${SYS[sk][0]}<span>${X.length}</span></div>`+X.map(item).join(''):''; }).join('');
  else body=L.map(item).join('');
  if(!L.length) body=`<div class="tg-empty"><span class="tg-ring0">${ic('book',22)}</span><h3>Nothing here</h3><p>No complaint matches.</p></div>`;
  return `<section class="tg-list"><div class="tg-lh">Complaints<span class="n">${groupsList().length}</span><button class="fx-flt${nF()?' on':''}" data-a="pop" data-p="flt2" style="margin-left:auto">${ic('sliders',12)}Filter${nF()?' · '+nF():''}</button><button class="fx-flt${U.flt?' on':''}" data-a="flt">${ic('ros',12)}On open ROs · ${nOpen}</button></div><div class="fx-lh2"><span class="tg-seg3">${[['sys','By system'],['flat','Flat']].map(x=>`<button class="${U.grp===x[0]?'on':''}" data-a="grp" data-v="${x[0]}">${x[1]}</button>`).join('')}</span><span class="sp"></span><span class="tg-seg3">${[['count','Most fixed'],['recent','Recent'],['az','A–Z']].map(x=>`<button class="${U.sort===x[0]?'on':''}" data-a="sort" data-v="${x[0]}">${x[1]}</button>`).join('')}</span></div>${fChips()}<div class="tg-scroll">${body}</div><div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span>${isRev()?`<span>${kbd('U')}use on an RO</span>`:''}<span>${kbd('A')}add</span><span>${kbd('/')}search</span><span>${kbd('1')}–${kbd(isRev()?'3':'2')}views</span></div></section>`;
}
function hoursStrip(st){ const mx=Math.max(st.q,...st.E.map(e=>e.h))*1.15, x=v=>(v/mx*100).toFixed(2)+'%';
  let tk=''; const step=mx>6?2:mx>3?1:0.5; for(let v=0;v<=mx;v+=step) tk+=`<span class="tk" style="left:${x(v)}">${v%1?v.toFixed(1):v}h</span>`;
  return `<div class="fx-hrs"><span class="ax"></span>${tk}<span class="q" style="left:${x(st.q)}"><em>quoted ${h1(st.q)} h</em></span>${(()=>{ const seen={}; return st.E.map(e=>{ const kk=Math.round(e.h*10/ (mx>3?2:1)), n=seen[kk]=(seen[kk]||0)+1; return [e,n-1]; }); })().map(([e,n])=>`<span class="d${e.out==='cb'?' cb':''}" style="left:${x(e.h)};top:${35-Math.min(n,2)*8}px" data-tip="RO ${e.ro} · ${h1(e.h)} h clocked|${esc(PPL[e.tech])} · ${fd(e.date)}${e.out==='cb'?' · came back':''}"></span>`).join('')}</div><div class="fx-hl"><span><i></i>one job, hours clocked</span>${st.cb?'<span><i class="cb"></i>came back</span>':''}</div>`; }
function vLib(){
  if(!ents(U.sel).length){ const f=groupsList()[0]; if(f) U.sel=f.k; else return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('sliders',22)}</span><h3>No fixes match</h3><p>Clear a filter to see more.</p><button class="btn btn-sm" data-a="fclr" data-f="all">Clear filters</button></div></div>`; }
  const g=grp(U.sel); if(!g) return `<div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('book',22)}</span><h3>Pick a complaint</h3><p>Every time it was fixed, and what usually works.</p></div></div>`;
  const st=stats(g.k), O=opensOf(g.k), pO=O.filter(pend);
  let h=`<div class="fx-pane" data-scroll="pane"><div class="tg-top"><div class="r1"><span class="fx-n">${st.n}× fixed</span><span>${st.trucks} trucks · ${st.engs.join(', ')} · ${SYS[g.sys][0]}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="add" data-k="${g.k}">${ic('plus',14)}Add a fix</button><button class="btn btn-sm" data-a="toast" data-t="The fix sheet prints — the usual cause and fix, parts, codes, and every time it was done.">${ic('print',14)}Print</button></div><h2>${esc(g.t)}</h2>
    <div class="fx-facts"><div><small>Usually takes</small><span class="m">${h1(st.hrs)} h<em>quoted ${h1(st.q)} h</em></span></div><div><small>Average cost</small><span class="m">${usd0(st.cost)}</span></div><div><small>Held</small><span class="${st.cb?'warn':'good'}">${st.n-st.cb} of ${st.n}${st.cb?` · ${st.cb} came back`:''}</span></div><div><small>Last fixed</small><span>${fd(st.E[0].date)}</span></div><div><small>${st.topN>1?'Fixed most by':'Fixed by'}</small><span>${st.topN>1?esc(PPL[st.top])+' · '+st.topN+'×':[...new Set(st.E.map(e=>F(e.tech)))].slice(0,3).join(', ')}</span></div></div></div><div class="fx-pad">`;
  h+=cbBanner(g.k);
  if(O.length){ const o=pO[0]||O[0]; h+=`<div class="tg-next"><span class="k">Next</span><p>${pO.length?`<b style="font-weight:600">${o.no} ${esc(o.cust)}</b> has this complaint — in the shop now${!o.q?', no quote yet':!o.parts.length?', no parts yet':''}.${O.length>1?` ${O.length-1} more open.`:''}`:`${O.map(x=>x.no).join(', ')} already use${O.length===1?'s':''} this fix.`}</p>${pO.length?(U.role==='tech'?`<button class="btn btn-sm" data-a="askuse" data-no="${o.no}">Ask ${F(o.wr)} to use it</button>`:`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use on ${o.no}…${kbd('U')}</button>`):`<button class="btn btn-sm" data-a="view" data-v="open">See open ROs</button>`}</div>`; }
  h+=quoteCheck(g.k,st);
  if(STEPS[g.k]) h+=checkFirst(g,st); else if(g.tip) h+=`<div class="fx-tip">${ic('bulb',16)}<span><b>Worth knowing.</b> ${esc(g.tip)}</span></div>`;
  const c0=st.causes[0], f0=st.fixes[0];
  h+=`<div class="fx-card"><div class="fx-ch">${ic('spark',14)}<b>The usual fix</b>${S.std[g.k]?`<span class="fx-std">${ic('star',11)}Shop standard · ${F(S.std[g.k].by)} · ${S.std[g.k].at}</span>`:''}<small>from ${st.n} times on ${st.trucks} trucks</small><span class="sp"></span>${(U.role==='fm'||U.role==='lt'||U.role==='mg')?`<button class="btn btn-sm tg-gh" data-a="pop" data-p="std" data-k="${g.k}">${ic('star',13)}${S.std[g.k]?'Change standard':'Make shop standard'}</button>`:''}<button class="btn btn-sm tg-gh" data-a="pop" data-p="cons" data-k="${g.k}">${ic('eye',13)}What the tech sees</button>${U.role==='tech'?`<button class="btn btn-sm tg-gh" data-a="suggest">${ic('pencil',13)}Suggest an edit</button>`:''}<button class="btn btn-sm tg-gh" data-a="toast" data-t="Copied — cause, correction and parts, ready to paste on the RO.">${ic('copy',13)}Copy</button></div>
    <div class="fx-best"><div><small class="l">Cause</small><p>${esc(c0[0])}<i>${c0[1]} of ${st.n}</i></p>${st.causes.slice(1).map(x=>`<div class="fx-alt">Also: ${esc(x[0])} <i>· ${x[1]} of ${st.n}</i></div>`).join('')}${st.codes.length?`<div class="fx-codes">${st.codes.map(x=>`<span class="fx-code">${x[0]}<small>${x[1]} of ${st.n}</small></span>`).join('')}</div>`:''}</div>
    <div><small class="l">Correction</small>${S.std[g.k]?`<p>${esc(S.std[g.k].fix)}<i>shop standard</i></p>${S.std[g.k].note?`<div class="fx-alt fx-stdn">${ic('pin',11)}${esc(S.std[g.k].note)}</div>`:''}`:`<p>${esc(f0[0])}<i>${f0[1]} of ${st.n}</i></p>`}${st.fixes.filter(x=>!S.std[g.k]||x[0]!==S.std[g.k].fix).slice(S.std[g.k]?0:1).map(x=>`<div class="fx-alt">Also: ${esc(x[0])} <i>· ${x[1]} of ${st.n}</i></div>`).join('')}</div></div>
    <div class="fx-bot"><div><div class="fx-plh"><small class="l" style="display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3)">Parts used</small>${st.parts.length?(S.kits[g.k]?`<span class="fx-kitc">${ic('check',11)}${S.kits[g.k].id} in Parts</span>`:`<button class="btn btn-sm tg-gh" data-a="pop" data-p="kit" data-k="${g.k}">${ic('plus',12)}Make a kit</button>`):''}</div>${st.parts.length?st.parts.map(x=>`<div class="fx-pl"><b>${esc(x.p[1])}</b><span class="m">${x.p[0]}</span><span class="u" data-tip="${esc(x.p[1])}|Used on ${x.n} of ${st.n} jobs"><i style="width:${x.n/st.n*100}%"></i></span><span class="n">${x.n} of ${st.n} · ${ONHAND[x.p[0]]!=null?ONHAND[x.p[0]]+' on hand':'—'}</span></div>`).join(''):'<div class="fx-none" style="padding:4px 0">No parts — labor only.</div>'}</div>
    <div><small class="l" style="display:block;font-size:11.5px;font-weight:600;color:var(--tg-ink3)">Hours, every job</small>${hoursStrip(st)}</div></div></div>`;
  h+=tsCard(g.k)+phCard(g.k)+wCard(g,st);
  h+=`<div class="fx-card"><div class="fx-ch"><b>Every time it was fixed</b><small>newest first · the RO opens on the operation</small></div><div class="fx-er h"><span>Date</span><span>RO · truck</span><span>Cause</span><span>Correction</span><span>Tech · hours</span><span>Held?</span></div>${st.E.map(e=>`<div class="fx-er${e.out==='cb'?' cbrow':''}${U.hl===e.ro?' hl':''}" data-ro="${e.ro}"><span class="dt">${fd(e.date).replace(', 20',' ’')}</span><span class="c"><span class="ro" data-a="toast" data-t="Opens RO-${e.ro} on this operation."><b class="tg-no">${e.ro}</b>${e.man?'<span class="fx-man">by hand</span>':''}</span><small>${esc(e.cust)}</small>${e.after?`<small style="color:var(--tg-bad)">after ${e.after} came back</small>`:''}<small>${esc(e.truck.replace('Volvo ',''))} · ${esc(e.eng)} · ${Math.round(e.miles/1000)}k mi</small></span><span class="c"><span>${esc(e.cause)}</span>${e.codes.length?`<small class="m">${e.codes.join(', ')}</small>`:''}</span><span class="c"><span>${esc(e.fix)}</span>${e.parts.length?`<small>${e.parts.map(p=>(p[2]>1?p[2]+'× ':'')+esc(p[1])+' · '+p[0]).join(' · ')}</small>`:''}</span><span class="tc"><b>${h1(e.h)} h</b>${F(e.tech)}</span><span>${e.out==='cb'?`<span class="fx-oc cb" title="Came back as RO-${e.backRo}">${ic('undo',11)}${e.live?'Back now':'Back in '+e.back+' d'}</span>`:dd(e.date,TODAY)<30?`<span class="fx-oc nw">Too soon to tell</span>`:`<span class="fx-oc ok">${ic('check',11)}Held</span>`}</span></div>`).join('')}</div>`;
  return h+'</div></div>';
}
function vOpen(){
  const row=o=>{ const g=grp(o.k), st=stats(o.k), same=st.E.filter(e=>e.eng===o.eng).length;
    return `<div class="fx-or${o.cmp?' code':''}${o.cb?' cb':''}"><span class="c"><b><span class="tg-no">${o.no}</span> ${esc(o.cust)}</b><small>${esc(o.truck.replace('Volvo ',''))} · ${esc(o.eng)} · ${F(o.tech)} · in ${o.in}</small></span><span class="c">${o.cmp?`<b>${esc(o.cmp)}</b><small class="fx-bycode">${ic('link',11)}${o.code} → <span class="lk" data-a="sel" data-k="${o.k}" data-go="1">${esc(g.t.split(' — ')[0])}</span> · ${st.n}×</small>`:`<b class="lk" data-a="sel" data-k="${o.k}" data-go="1">${esc(g.t)}</b><small>${o.cb?`<span class="fx-cbt">${ic('undo',11)}comeback · ${o.cb.days} d after ${o.cb.ro}</span>`:`${st.n} past fixes · ${same} on a ${esc(o.eng)}${g.tip?' · worth knowing':''}`}</small>`}</span><span class="q">${o.q?`<b>${h1(o.q)} h</b><small>${o.from?'Use fix · '+F(o.by||o.wr):'typed by '+F(o.wr)}</small>`:`<b class="none">No quote</b><small>usual ${h1(st.q)} h</small>`}</span><span class="q">${o.parts.length?`<b>${o.parts.length} part${o.parts.length>1?'s':''}</b><small>${o.from?'from RO '+o.from:'on the RO'}</small>`:`<b class="none">No parts</b><small>usual ${st.parts.length}</small>`}</span><span class="c"><span style="font-size:12.5px">${esc(st.fixes[0][0])}</span><small>${st.fixes[0][1]} of ${st.n}${st.cb?` · ${st.cb} came back`:''}</small></span><span class="ac">${pend(o)?(U.role==='tech'?`<button class="btn btn-sm" data-a="askuse" data-no="${o.no}">Ask ${F(o.wr)}</button>`:`<button class="btn btn-sm btn-primary" data-a="pop" data-p="use" data-no="${o.no}">Use fix…</button>`):`<span class="fx-ap">${ic('check',13)}${o.from?'Used':'Set'}</span>`}</span></div>`; };
  const A=S.O.filter(pend), B=S.O.filter(o=>!pend(o));
  return `<div class="fx-full"><div class="fx-fh"><h2>Open ROs</h2><span class="tg-hf" style="cursor:default">Operations in the shop now that have been fixed before. Nothing fills in by itself — Use fix shows what changes, and you say yes.</span><span class="sp"></span></div>
   <div class="fx-sum"><span class="${A.length?'warn':''}"><b>${A.length}</b>still need a quote or parts</span><span><b>${B.length}</b>already set</span><span><b>${S.O.filter(o=>o.from).length}</b>set with Use fix</span></div>
   <div class="fx-tbl"><div class="fx-or h"><span>RO</span><span>Complaint · past fixes</span><span>Quote</span><span>Parts</span><span>The usual fix</span><span></span></div>${A.length?`<div class="fx-tg warn">Needs a quote or parts<span>${A.length}</span></div>${A.map(row).join('')}`:''}${B.length?`<div class="fx-tg">Already set<span>${B.length}</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">someone pressed Use fix — or the writer typed it in</span></div>${B.map(row).join('')}`:''}</div></div>`;
}
function vRev(){
  const L=S.R.filter(r=>!r.ok&&!r.done), ok=S.R.filter(r=>r.ok), dn=S.R.filter(r=>r.done);
  const G={short:['Correction just says “'+'replaced'+'”','note','lead tech or foreman'],cause:['No cause written','note','lead tech or foreman'],code:['No fault code','note','lead tech or foreman'],dup:['Looks like an existing complaint','merge','Triage'],hand:['Added by hand by a tech','note','lead tech or foreman']};
  const row=r=>{ const g=grp(r.k), gp=G[r.gap];
    return `<div class="fx-rv"><span class="c"><b><span class="tg-no">${r.ro}</span> ${esc(r.cust)}</b><small>${esc(PPL[r.tech])} · ${esc(r.truck.replace('Volvo ',''))} · ${esc(r.eng)}</small></span><span class="c"><b>${esc(r.cmp)}</b><small>${r.cause?esc(r.cause):'<i>no cause</i>'} → ${esc(r.fix)}</small></span><span class="c"><span class="fx-gap${r.gap==='dup'?' dup':''}">${ic(gp[1],11)}${gp[0]}</span><small>${r.gap==='dup'?`“${esc(g.t)}” · ${ents(g.k).length}×`:r.gap==='code'?'the usual code here is '+stats(r.k).codes[0][0]:r.gap==='hand'?'by '+F(r.tech)+' · check it before it counts':r.note?'the tech’s note has more':'—'} · usually ${gp[2]}</small></span><span class="ac">${r.gap==='dup'?`<button class="btn btn-sm btn-primary" data-a="pop" data-p="merge" data-id="${r.id}">Merge…</button><button class="btn btn-sm tg-gh" data-a="rvok" data-id="${r.id}">Keep separate</button>`:`<button class="btn btn-sm btn-primary" data-a="pop" data-p="write" data-id="${r.id}">${r.gap==='code'?'Add the code…':'Write it up…'}</button><button class="btn btn-sm tg-gh" data-a="rvok" data-id="${r.id}">It’s fine</button>`}</span></div>`; };
  return `<div class="fx-full"><div class="fx-fh"><h2>Review</h2><span class="tg-hf" style="cursor:default">Operations finished this week land here first — a good write-up is what makes a fix findable</span><span class="sp"></span></div>
   <div class="fx-revs"><b>Who reviews</b>${[['FD','Foreman'],['MR','Lead tech'],['AM','Triage'],['JT','Triage'],['RH','Manager']].map(x=>`<span class="${x[0]===me()?'me':''}"><span class="tg-av">${x[0]}</span>${F(x[0])} · ${x[1]}${x[0]===me()?' · you':''}</span>`).join('')}<em>any of them can clear an item — it shows who did</em></div><div class="fx-sum"><span class="${L.length?'warn':''}"><b>${L.length}</b>to look at</span><span><b>${ok.length+dn.length}</b>good to go</span></div>
   <div class="fx-tbl">${L.length?L.map(row).join(''):'<div class="fx-none">All caught up — every new fix has a cause, a correction and a code.</div>'}</div>
   ${ok.length+dn.length?`<div class="fx-tg">Good to go<span>${ok.length+dn.length}</span></div><div class="fx-tbl">${ok.concat(dn).map(r=>`<div class="fx-rv"><span class="c"><b><span class="tg-no">${r.ro}</span> ${esc(r.cust)}</b><small>${esc(PPL[r.tech])}</small></span><span class="c"><b>${esc(r.cmp)}</b><small>${esc(r.cause)} → ${esc(r.fix)}</small></span><span class="c"><span class="fx-oc ok" style="align-self:flex-start">${ic('check',11)}${r.done?'Written up':r.kept?'Kept as written':'Complete'}</span>${r.by?`<small>by ${F(r.by)} · ${r.byRole} · ${r.at}</small>`:'<small>nothing to fix</small>'}</span><span class="ac"></span></div>`).join('')}</div>`:''}</div>`;
}
const STEPS={
 cts:[['Check the connector at the sensor','Corroded on 2 of 3 — clean, re-pin, replace the pigtail ($38.75)','2 of 3'],['Test the sensor','Tech Tool resistance check against coolant temperature','—'],['Replace the sensor only if it fails the test','1 of 3 — $64.20 and about 0.7 h','1 of 3']],
 doser:[['Check the doser line behind the tank','Kinked on 1 of 5 — re-route it ($88.40 line)','1 of 5'],['Run the doser flow test','Tech Tool · aftertreatment · doser test','—'],['Replace the doser and gasket if flow fails','4 of 5 — $751.78','4 of 5']],
 dpfp:[['Check the sensor hoses','Cracked on 1 of 4 — $24.10','1 of 4'],['Compare the reading to a known-good sensor','Key on, engine off — should read near zero','—'],['Replace the pressure sensor','3 of 4 — $186.40','3 of 4']],
 egr:[['Look for coolant in the EGR valve','If it’s wet, the cooler is leaking — 1 of 3, and it came back when only the valve was done','1 of 3'],['Pressure test the cooling system','Rules the cooler in or out before ordering','—'],['Replace the EGR valve, then run the EGR test','2 of 3 — $968.00','2 of 3']],
 turbo:[['Check the actuator connector','A backed-out pin on 1 of 6 — it came back after a re-pin, so test the actuator too','1 of 6'],['Run the actuator test in Tech Tool','Failed on 5 of 6','5 of 6'],['Replace the actuator and calibrate it','$1,348.00 and about 1.6 h','5 of 6']]
};
const TS={egr:[{c:'TS-31422',d:'2026-10-16',ro:'37544',by:'AW',st:'open',said:'Check the EGR cooler for an internal leak before replacing the valve — coolant in the valve means the cooler.'},{c:'TS-29870',d:'2026-06-03',ro:'36561',by:'MR',st:'closed',said:'Heavy carbon on the valve: replace it, then run the EGR cleaning routine before releasing the truck.'}],turbo:[{c:'TS-30115',d:'2026-08-12',ro:'37012',by:'KT',st:'closed',said:'Actuator fault with good wiring — replace and calibrate. Re-pinning alone doesn’t hold on this actuator.'}]};
const PH={wp:[['Failed pump — weep hole','37455','#6b6f74','#3c3f43'],['Seal face, worn','37455','#7c6a55','#3d342b'],['Gasket surface, cleaned','37220','#8a8f94','#55595e'],['Pressure test — holds','37220','#49615a','#26332f'],['Tech Tool printout','37104','#d8d4ca','#a8a296']]};
const WSET={alt:1,wp:1,inj:1,ac:1};
function cbBanner(k){ const o=S.O.find(x=>x.k===k&&x.cb); if(!o) return ''; const f=ents(k).find(e=>e.ro===o.cb.ro);
  return `<div class="fx-cb">${ic('undo',16)}<span><b>Comeback.</b> ${o.no} ${esc(o.cust)} is back with the same complaint — same truck, ${o.cb.days} days after RO ${o.cb.ro} (${fd(o.cb.date)})${f?`, where ${F(f.tech)} ${lc(f.fix).replace(/^replaced/,'replaced')}`:''}.</span><button class="btn btn-sm" data-a="tofix" data-ro="${o.cb.ro}">See that fix</button><button class="btn btn-sm btn-primary" data-a="cbsend" data-no="${o.no}">Send to Frank</button></div>`; }
function checkFirst(g,st){ const S_=STEPS[g.k], dn=U.steps[g.k]||{};
  return `<div class="fx-card fx-steps"><div class="fx-ch">${ic('bulb',14)}<b>Check first</b><small>${esc(g.tip||'')}</small></div>${S_.map((s,i)=>`<label class="fx-step${dn[i]?' done':''}" data-a="stp" data-k="${g.k}" data-i="${i}"><span class="n">${dn[i]?ic('check',12):i+1}</span><span class="d"><b>${esc(s[0])}</b><small>${esc(s[1])}</small></span><span class="s">${s[2]}</span></label>`).join('')}<div class="fx-cf">${ic('info',12)}${nF()?'Counts are from every job, not just the filter.':'Built from how it’s been fixed — the cheap checks come first. It shows on the tech’s Console too.'}</div></div>`; }
const dq=(a,b)=>Math.round((+h1(a)-+h1(b))*10)/10;
function quoteCheck(k,st){ const d=dq(st.hrs,st.q); if(Math.abs(d)<0.3||st.n<4||S.qk[k]) return '';
  return `<div class="fx-qc">${ic('gauge',16)}<span><b>Quote check.</b> It’s taken ${h1(st.hrs)} h on average over ${st.n} jobs — the usual quote is ${h1(st.q)} h. That’s about ${usd0(Math.abs(d)*RATE)} ${d>0?'of labor not billed':'over'} each time.</span><button class="btn btn-sm btn-primary" data-a="qset" data-k="${k}">Make it ${h1(st.hrs)} h</button><button class="btn btn-sm tg-gh" data-a="qkeep" data-k="${k}">Keep ${h1(st.q)} h</button></div>`; }
function tsCard(k){ const L=TS[k]; if(!L) return '';
  return `<div class="fx-card fx-ts"><div class="fx-ch">${ic('phone',14)}<b>Tech support said</b><small>cases on this complaint</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Attach a case — the case number and what support said; it shows here and on the RO.">${ic('plus',12)}Attach a case</button></div>${L.map(x=>`<div class="fx-tsr"><span class="m">${x.c}</span><span class="d"><span>${esc(x.said)}</span><small>RO ${x.ro} · ${esc(PPL[x.by])} · ${fd(x.d)}</small></span><span class="fx-oc ${x.st==='open'?'nw':'ok'}">${x.st==='open'?'Open':'Closed'}</span></div>`).join('')}</div>`; }
function phCard(k){ const L=PH[k]; if(!L) return '';
  return `<div class="fx-card fx-ph"><div class="fx-ch">${ic('image',14)}<b>Photos and files</b><small>${L.length} from ${new Set(L.map(x=>x[1])).size} ROs</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Add photos — from the RO, or straight from the phone app.">${ic('plus',12)}Add</button></div><div class="fx-phg">${L.map((x,i)=>`<button class="fx-pht" data-a="pop" data-p="photo" data-k="${k}" data-i="${i}"><i style="background:linear-gradient(135deg,${x[2]},${x[3]})">${ic(i===4?'file':'image',18)}</i><b>${esc(x[0])}</b><small>RO ${x[1]}</small></button>`).join('')}</div></div>`; }
function wCard(g,st){ if(!WSET[g.k]||!st.parts.length) return ''; const p=st.parts[0], c0=st.causes[0][0], f0=(S.std[g.k]||{}).fix||st.fixes[0][0];
  return `<div class="fx-card fx-war"><div class="fx-ch">${ic('warranty',14)}<b>For a warranty claim</b><small>the causal part and story, from the usual fix</small><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="toast" data-t="Copied — complaint, cause, correction and causal part, in claim order.">${ic('copy',13)}Copy for the claim</button></div>
   <div class="fx-wr"><div><small>Causal part</small><b>${esc(p.p[1])} · <span style="font-family:var(--tg-mono)">${p.p[0]}</span></b><small>${p.n} of ${st.n} jobs</small></div><div><small>Labor</small><b style="font-family:var(--tg-mono)">${h1(st.q)} h</b><small>the usual quote</small></div><div><small>Codes</small><b style="font-family:var(--tg-mono)">${st.codes.length?st.codes[0][0]:'—'}</b><small>${st.codes.length?st.codes[0][1]+' of '+st.n:'none logged'}</small></div></div>
   <div class="fx-ws"><p><b>Complaint</b> ${esc(g.t)}.</p><p><b>Cause</b> ${esc(c0)}.</p><p><b>Correction</b> ${esc(f0)}.</p></div><div class="fx-cf" style="padding:8px 16px 10px">${ic('info',12)}Warranty starts from this when a claim on the same complaint opens — they still check it against the RO.</div></div>`; }
function fChips(){ if(!nF()) return ''; const L=[]; if(U.fe) L.push(['fe',U.fe]); if(U.fmdl) L.push(['fmdl',U.fmdl]); if(U.fmi) L.push(['fmi',{lo:'Under 300k mi',mid:'300k–500k mi',hi:'Over 500k mi'}[U.fmi]]);
  return `<div class="fx-fchips">${L.map(x=>`<button class="fx-fc" data-a="fclr" data-f="${x[0]}">${esc(x[1])}${ic('x',11)}</button>`).join('')}<button class="fx-fc clr" data-a="fclr" data-f="all">Clear</button></div>`; }
function vTrend(){ const D90=addD(TODAY,-90), D180=addD(TODAY,-180);
  const rows=G0.map(g=>{ const E=ents(g.k), a=E.filter(e=>e.date>=D90).length, b=E.filter(e=>e.date<D90&&e.date>=D180).length, cb=E.filter(e=>e.out==='cb').length, st=stats(g.k); return {g,a,b,cb,n:E.length,st,dh:dq(st.hrs,st.q)}; });
  const top=rows.slice().sort((x,y)=>y.a-x.a).slice(0,7), mx=Math.max(1,...top.map(x=>x.a));
  const bys=Object.keys(SYS).map(sk=>{ const R_=rows.filter(x=>x.g.sys===sk); return {sk,a:R_.reduce((t,x)=>t+x.a,0),b:R_.reduce((t,x)=>t+x.b,0),top:R_.slice().sort((x,y)=>y.a-x.a)[0]}; }).filter(x=>x.a||x.b).sort((x,y)=>y.a-x.a), mxs=Math.max(1,...bys.map(x=>x.a));
  const cbs=rows.filter(x=>x.cb).sort((x,y)=>y.cb/y.n-x.cb/x.n), oq=rows.filter(x=>x.dh>=0.2).sort((x,y)=>y.dh-x.dh);
  return `<div class="fx-full"><div class="fx-fh"><h2>Trends</h2><span class="tg-hf" style="cursor:default">Last 90 days · the foreman and the manager see this</span><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="The monthly sheet prints — repeat complaints, comebacks and quotes to fix.">${ic('print',14)}Print</button></div>
   <div class="fx-trend"><div style="display:flex;flex-direction:column;gap:14px"><div class="fx-tbl" style="margin:0"><div class="fx-tg">Most repeated<span>fixes in the last 90 days</span></div>${top.map(x=>`<div class="fx-tbar" data-a="sel" data-k="${x.g.k}" data-go="1" data-tip="${esc(x.g.t)}|${x.a} in the last 90 days · ${x.b} in the 90 before"><span class="n">${esc(x.g.t)}</span><span class="b"><i style="width:${x.a/mx*100}%"></i></span><b>${x.a}</b><span class="d ${x.a>x.b?'up':x.a<x.b?'dn':''}">${x.a>x.b?'▲ '+(x.a-x.b):x.a<x.b?'▼ '+(x.b-x.a):'—'}</span></div>`).join('')}<div class="fx-cf">${ic('info',12)}Arrows compare with the 90 days before.</div></div>
   <div class="fx-tbl" style="margin:0"><div class="fx-tg">By system<span>fixes in the last 90 days</span></div>${bys.map(x=>`<div class="fx-tbar sy" data-a="sel" data-k="${x.top.g.k}" data-go="1" data-tip="${SYS[x.sk][0]}|${x.a} in the last 90 days · ${x.b} in the 90 before"><span class="n">${ic(SYS[x.sk][1],14)}${SYS[x.sk][0]}</span><span class="b"><i style="width:${x.a/mxs*100}%"></i></span><b>${x.a}</b><span class="d ${x.a>x.b?'up':x.a<x.b?'dn':''}">${x.a>x.b?'▲ '+(x.a-x.b):x.a<x.b?'▼ '+(x.b-x.a):'—'}</span></div>`).join('')}</div></div>
   <div style="display:flex;flex-direction:column;gap:14px"><div class="fx-tbl" style="margin:0"><div class="fx-tg">Comebacks<span>fixes that didn’t hold</span></div>${cbs.map(x=>`<div class="fx-trr" data-a="sel" data-k="${x.g.k}" data-go="1"><span class="n">${esc(x.g.t)}</span><span class="fx-oc cb">${x.cb} of ${x.n}</span><b>${Math.round(x.cb/x.n*100)}%</b></div>`).join('')||'<div class="fx-none">None.</div>'}</div>
   <div class="fx-tbl" style="margin:0"><div class="fx-tg">Taking longer than quoted<span>average clocked minus the usual quote</span></div>${oq.map(x=>`<div class="fx-trr" data-a="sel" data-k="${x.g.k}" data-go="1"><span class="n">${esc(x.g.t)}</span><span class="m">+${h1(x.dh)} h</span><b>${usd0(x.dh*RATE)}</b></div>`).join('')||'<div class="fx-none">Every quote is close.</div>'}<div class="fx-cf">${ic('info',12)}Dollars are labor not billed per job, at $210 an hour.</div></div></div></div></div>`; }
/* ---------- popovers ---------- */
function pop(){
  const p=U.pop; if(!p) return '';
  const hd=(t,sub)=>`<div class="tg-ph"><b>${t}</b>${sub?`<span class="cu">${sub}</span>`:''}<button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const st=`style="left:400px;top:12px"`;
  if(p.type==='use'){ const o=S.O.find(x=>x.no===p.no); if(!o) return ''; const g=grp(o.k), s=stats(o.k), same=s.E.filter(e=>e.eng===o.eng), avgS=same.length?same.reduce((a,e)=>a+e.h,0)/same.length:s.hrs;
    const Q=[[s.q,'The usual quote',`quoted ${h1(s.q)} h on ${s.E.filter(e=>e.q===s.q).length} of ${s.n}`],[Math.round(avgS*10)/10,`What it took on a ${o.eng}`,`average clocked, ${same.length} job${same.length===1?'':'s'}`],[null,'Type it','your own number']];
    const sel=p.parts||(p.parts=Object.fromEntries(s.parts.filter(x=>x.n/s.n>=0.5).map(x=>[x.p[0],true])));
    const qv=p.o===2?parseFloat(p.qt)||0:p.o!=null?Q[p.o][0]:0, pc=s.parts.filter(x=>sel[x.p[0]]).reduce((a,x)=>a+x.p[2]*x.p[3],0);
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Use this fix',`${o.no} · ${esc(o.cust)}`)}<div class="fx-ctx"><b>${esc(g.t)}</b><br>${esc(o.truck)} · ${esc(o.eng)} · ${o.miles.toLocaleString()} mi · ${F(o.tech)} has it</div>
      <span class="tg-lbl top">Quote</span>${Q.map((q,i)=>`<button class="tg-chip${p.o===i?' on':''}" data-a="oset" data-o="${i}" style="margin:0 4px 4px 0">${kbd(i+1)}${q[0]!=null?h1(q[0])+' h · ':''}${q[1]}</button>`).join('')}
      ${p.o===2?`<label class="fx-f" style="margin-top:4px"><span>Hours</span><input id="fx-qt" value="${esc(p.qt||'')}" placeholder="1.2"></label>`:''}
      <span class="tg-lbl top" style="margin-top:8px">Parts</span>${s.parts.length?s.parts.map(x=>`<label class="fx-ln" data-a="pck" data-pn="${x.p[0]}"><input type="checkbox" ${sel[x.p[0]]?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.p[1])} · <span style="font-family:var(--tg-mono);font-weight:500">${x.p[0]}</span></b><small>used on ${x.n} of ${s.n} · ${ONHAND[x.p[0]]?ONHAND[x.p[0]]+' on hand':'none on hand'}</small></span><span class="r"><b>${usd(x.p[3])}</b>× ${x.p[2]}</span></label>`).join(''):'<div class="fx-none" style="padding:4px 0">Labor only.</div>'}
      ${g.tip?`<div class="fx-src">${ic('bulb',14)}<span>${esc(g.tip)}</span></div>`:''}
      <label class="fx-ck"><input type="checkbox" data-a="tel" ${p.tell!==false?'checked':''}>Show the usual cause and fix on ${F(o.tech)}’s Console</label>
      <label class="fx-ck"><input type="checkbox" data-a="tpa" ${p.toParts!==false?'checked':''}>${me()===o.wr?'Send the parts to Parts':'Send the parts to Parts — it asks '+F(o.wr)+' first'}</label>
      <div class="fx-nb">${ic('info',12)}Nothing on ${o.no} changes until you press Use fix.</div><div class="tg-acts"><span class="hint">${qv?h1(qv)+' h · '+usd0(qv*RATE)+' labor':'pick a quote'}${pc?' · '+usd(pc)+' parts':''}</span><button class="btn btn-sm btn-primary" data-a="ugo"${p.o==null||(p.o===2&&!(parseFloat(p.qt)>0))?' disabled':''}>Use fix${kbd('↵')}</button></div></div>`; }
  if(p.type==='write'){ const r=S.R.find(x=>x.id===p.id); if(!r) return ''; const s=stats(r.k);
    return `<div class="tg-pop xf fx-pop-x" ${st}>${hd(r.gap==='code'?'Add the fault code':'Write it up',`${r.ro} · ${esc(r.cust)}`)}<div class="fx-ctx"><b>${esc(r.cmp)}</b> · ${esc(PPL[r.tech])}</div>
      ${r.note?`<div class="fx-src"><span class="tg-av">${r.tech}</span><span><i>From ${F(r.tech)}’s punch notes</i><br>“${esc(r.note)}”</span><button class="btn btn-sm" data-a="usenote">Use it</button></div>`:''}
      <label class="fx-f"><span>Cause</span><textarea id="fx-c" rows="2" placeholder="What was found">${esc(p.c!=null?p.c:r.cause)}</textarea></label>
      <label class="fx-f"><span>Correction</span><textarea id="fx-x" rows="2" placeholder="What fixed it">${esc(p.x!=null?p.x:r.fix)}</textarea></label>
      <label class="fx-f"><span>Fault code</span><input id="fx-cd" value="${esc(p.cd!=null?p.cd:'')}" placeholder="${s.codes.length?s.codes[0][0]+' — the usual one':'none'}"></label>
      <div class="tg-acts"><span class="hint">It joins “${esc(grp(r.k).t)}” · ${ents(r.k).length}×</span><button class="btn btn-sm btn-primary" data-a="wgo">Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='merge'){ const r=S.R.find(x=>x.id===p.id); if(!r) return ''; const C=[r.k].concat(G0.filter(g=>g.k!==r.k&&g.sys===grp(r.k).sys).map(g=>g.k)).slice(0,3);
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Merge into…',`${r.ro}`)}<div class="fx-ctx">“<b>${esc(r.cmp)}</b>” — the same job, worded differently. Merged, it counts with the others and shows up when someone searches either way.</div>
      ${C.map((k,i)=>`<button class="tg-mi${(p.k||C[0])===k?' on':''}" data-a="mset" data-k="${k}" style="height:auto;min-height:38px;padding:6px 10px !important">${kbd(i+1)}<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(grp(k).t)}</span><span class="meta">${ents(k).length}×</span></button>`).join('')}
      <label class="fx-ck"><input type="checkbox" checked disabled>Keep “${esc(r.cmp.split(' — ').slice(-1)[0])}” as a search word</label>
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="mgo">Merge${kbd('↵')}</button></div></div>`; }
  if(p.type==='add'){ const d=p.d||(p.d={cmp:p.k?grp(p.k).t:'',c:'',x:'',eng:'',cd:'',pn:''}); const q=d.cmp.trim().toLowerCase(); const m=q&&!G0.some(g=>g.t.toLowerCase()===q)?G0.filter(g=>q.split(/\s+/).filter(w=>w.length>3).some(w=>g.t.toLowerCase().includes(w))).slice(0,2):[];
    return `<div class="tg-pop xf fx-pop-x" ${st}>${hd('Add a fix by hand','work done before Parsec')}
      <label class="fx-f" style="margin-top:0"><span>Complaint</span><input id="fx-acmp" value="${esc(d.cmp)}" placeholder="e.g. Coolant leak at water pump" autocomplete="off"></label>
      ${m.length?`<div class="fx-hint">${ic('merge',13)}Same as ${m.map(g=>`<button class="tg-chip" data-a="apick" data-k="${g.k}" style="height:22px">${esc(g.t)} · ${ents(g.k).length}×</button>`).join(' ')}?</div>`:''}
      <div class="fx-two"><label class="fx-f"><span>Cause</span><textarea id="fx-ac" rows="3" placeholder="What was found">${esc(d.c)}</textarea></label><label class="fx-f"><span>Correction</span><textarea id="fx-ax" rows="3" placeholder="What fixed it">${esc(d.x)}</textarea></label></div>
      <div class="fx-three"><label class="fx-f"><span>Engine</span><input id="fx-aeng" value="${esc(d.eng)}" placeholder="D13"></label><label class="fx-f"><span>Fault code</span><input id="fx-acd" value="${esc(d.cd)}" placeholder="SPN 641 FMI 7"></label><label class="fx-f"><span>Part #s</span><input id="fx-apn" value="${esc(d.pn)}" placeholder="22972342"></label></div>
      <div class="tg-acts"><span class="hint">Finished operations land here by themselves</span><button class="btn btn-sm btn-primary" data-a="ago">Save fix${kbd('↵')}</button></div></div>`; }
  if(p.type==='cons'){ const k=p.k, g=grp(k), s=stats(k), O=opensOf(k), o=O.find(pend)||O[0], tab=p.tab||'start', std=S.std[k];
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('What the tech sees',`${o?esc(PPL[o.tech])+' · RO '+o.no:'on the Console and the phone app'}`)}<div class="fx-tabs tg-seg3"><button class="${tab==='start'?'on':''}" data-a="ctab" data-v="start">When the clock starts</button><button class="${tab==='stop'?'on':''}" data-a="ctab" data-v="stop">When it stops</button></div>
      <div class="fx-con"><div class="bar"><span class="dot"></span>Console${o?' · '+F(o.tech):''}<span class="sp"></span>${o?'RO '+o.no:''}</div>${tab==='start'?`<div class="t">${esc(g.t)}</div><div class="chips"><span>Fixed ${s.n}× before</span><span>usually ${h1(s.hrs)} h</span>${std?'<span class="std">shop standard</span>':''}</div>
        ${STEPS[k]?`<div class="sec">Check first</div>${STEPS[k].map((x,i)=>`<div class="st"><span>${i+1}</span>${esc(x[0])}</div>`).join('')}`:''}
        <div class="sec">The usual fix</div><p>${esc(s.causes[0][0])} → ${esc(std?std.fix:s.fixes[0][0])}</p>${std&&std.note?`<p class="nt">${esc(std.note)}</p>`:''}
        ${s.parts.length?`<div class="sec">Parts</div>${s.parts.slice(0,3).map(x=>`<p>${esc(x.p[1])} · ${x.p[0]}</p>`).join('')}`:''}<div class="go"><span class="b">Got it</span></div>`
      :`<div class="t">Did the usual fix work?</div><p>${esc(std?std.fix:s.fixes[0][0])}</p><div class="ans"><button data-a="cans" data-v="Yes — fixed">Yes — fixed</button><button data-a="cans" data-v="Not sure yet">Not sure yet</button><button data-a="cans" data-v="No — something else">No — something else</button></div><p class="nt">The answer counts toward Held. “Something else” asks for the cause.</p>`}</div>
      <div class="fx-nb">${ic('info',12)}Shows when ${o?F(o.tech):'the tech'} starts the clock on this complaint — same card on the phone app.</div></div>`; }
  if(p.type==='std'){ const k=p.k, s=stats(k), cur=S.std[k];
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Make it the shop standard',esc(grp(k).t))}<div class="fx-ctx">The standard shows first — here, on the Console, and when someone presses Use fix. Foreman, lead tech or manager.</div>
      <span class="tg-lbl top">Correction</span>${s.fixes.map((x,i)=>`<button class="tg-mi${(p.f!=null?p.f:(cur?s.fixes.findIndex(y=>y[0]===cur.fix):0))===i?' on':''}" data-a="sfix" data-i="${i}" style="height:auto;min-height:40px;padding:6px 10px !important;white-space:normal;line-height:18px">${kbd(i+1)}<span style="flex:1">${esc(x[0])}</span><span class="meta">${x[1]} of ${s.n}</span></button>`).join('')}
      <label class="fx-f"><span>Note for the tech</span><input id="fx-sn" value="${esc(p.n!=null?p.n:(cur&&cur.note)||'')}" placeholder="e.g. Check the connector before you test the actuator"></label>
      <div class="tg-acts">${cur?'<button class="btn btn-sm tg-gh" data-a="sclr">Remove standard</button>':''}<span class="hint">Set by ${F(me())} · ${myRole()}</span><button class="btn btn-sm btn-primary" data-a="sgo">Make standard${kbd('↵')}</button></div></div>`; }
  if(p.type==='kit'){ const k=p.k, s=stats(k), sel=p.sel||(p.sel=Object.fromEntries(s.parts.filter(x=>x.n/s.n>=0.5).map(x=>[x.p[0],true]))), tot=s.parts.filter(x=>sel[x.p[0]]).reduce((a,x)=>a+x.p[2]*x.p[3],0);
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Make a kit',esc(grp(k).t))}<label class="fx-f" style="margin-top:0"><span>Kit name</span><input id="fx-kn" value="${esc(p.n!=null?p.n:grp(k).t.split(' — ')[0]+' job')}"></label>
      <span class="tg-lbl top" style="margin-top:8px">Parts</span>${s.parts.map(x=>`<label class="fx-ln" data-a="kpk" data-pn="${x.p[0]}"><input type="checkbox" ${sel[x.p[0]]?'checked':''} tabindex="-1"><span class="d"><b>${esc(x.p[1])} · <span style="font-family:var(--tg-mono);font-weight:500">${x.p[0]}</span></b><small>used on ${x.n} of ${s.n} · ${ONHAND[x.p[0]]!=null?ONHAND[x.p[0]]+' on hand':'—'}</small></span><span class="r"><b>${usd(x.p[3])}</b>× ${x.p[2]}</span></label>`).join('')}
      <div class="tg-acts"><span class="hint">Goes to Parts → Catalog · ${usd(tot)}</span><button class="btn btn-sm btn-primary" data-a="kgo">Make kit${kbd('↵')}</button></div></div>`; }
  if(p.type==='photo'){ const x=PH[p.k][+p.i];
    return `<div class="tg-pop xf fx-pop-x" ${st}>${hd(esc(x[0]),'RO '+x[1])}<div class="fx-big" style="background:linear-gradient(135deg,${x[2]},${x[3]})">${ic(+p.i===4?'file':'image',40)}</div><div class="tg-acts"><span class="hint">From RO ${x[1]} · ${fd(addD(TODAY,-20-+p.i*9))}</span><button class="btn btn-sm" data-a="toast" data-t="Downloaded.">${ic('download',14)}Download</button></div></div>`; }
  if(p.type==='flt2'){ const row=(lbl,f,opts)=>`<span class="tg-lbl top">${lbl}</span><div class="tg-r" style="margin-bottom:6px">${opts.map(o=>`<button class="tg-chip${U[f]===o[0]?' on':''}" data-a="fset2" data-f="${f}" data-v="${o[0]}">${esc(o[1])}</button>`).join('')}</div>`;
    return `<div class="tg-pop xf fx-pop-w" ${st}>${hd('Filter the fixes','only the jobs that match')}${row('Engine','fe',[['D13','D13'],['D13 TC','D13 TC'],['D11','D11']])}${row('Model','fmdl',[['VNL','VNL'],['VNR','VNR'],['VHD','VHD']])}${row('Miles','fmi',[['lo','Under 300k'],['mid','300k–500k'],['hi','Over 500k']])}
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="fclr" data-f="all">Clear</button><span class="hint">${G0.reduce((s,g)=>s+ents(g.k).length,0)} fixes match</span><button class="btn btn-sm btn-primary" data-a="popx">Done${kbd('↵')}</button></div></div>`; }
  if(p.type==='srch'){ const q=(p.q||'').trim().toLowerCase(), R=[];
    if(q){ G0.forEach(g=>{ const E=ents(g.k); const hit=[]; const W=q.split(/\s+/);
      const look=(lbl,s)=>{ if(W.every(w=>String(s).toLowerCase().includes(w))) hit.push([lbl,s]); };
      look('Complaint',g.t); E.forEach(e=>{ look('Cause',e.cause); look('Correction',e.fix); e.codes.forEach(c=>look('Code',c)); e.parts.forEach(pp=>look('Part',pp[0]+' '+pp[1])); look('VIN',e.vin); look('RO',e.ro); });
      if(hit.length) R.push({g,h:hit[0],n:hit.length}); }); }
    const mk=(s,q)=>{ const i=s.toLowerCase().indexOf(q.split(/\s+/)[0]); return i<0?esc(s):esc(s.slice(0,i))+'<mark>'+esc(s.slice(i,i+q.split(/\s+/)[0].length))+'</mark>'+esc(s.slice(i+q.split(/\s+/)[0].length)); };
    return `<div class="tg-pop menu fx-pop-w" ${st}><div class="fx-srin">${ic('search',15)}<input id="fx-sq" placeholder="Complaint, cause, SPN code, part # or VIN" value="${esc(p.q||'')}" autocomplete="off"></div>${q?(R.length?R.slice(0,7).map((x,i)=>`<button class="fx-srr${i===0?' k':''}" data-a="sel" data-k="${x.g.k}" data-go="1"><span class="gi">${ic(SYS[x.g.sys][1],14)}</span><b>${esc(x.g.t)}</b><span class="m">${ents(x.g.k).length}×</span><small>${x.h[0]}: ${mk(x.h[1],q)}</small></button>`).join(''):`<div class="fx-none">Nothing matches “${esc(p.q)}”. Try a part number, a code, or fewer words.</div>`):'<div class="fx-none">Try “SPN 641”, “22972342”, “connector” or a VIN.</div>'}</div>`; }
  return '';
}
/* ---------- doing things ---------- */
function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='sel'){ U.sel=t.dataset.k; U.kb=false; U.pop=null; if(t.dataset.go){ U.view='lib'; if(U.flt&&!opensOf(U.sel).length) U.flt=false; } render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='sort'){ U.sort=t.dataset.v; render(); }
  else if(a==='grp'){ U.grp=t.dataset.v; render(); }
  else if(a==='flt'){ U.flt=!U.flt; if(U.flt&&!opensOf(U.sel).length){ const g=groupsList()[0]; if(g) U.sel=g.k; } render(); }
  else if(a==='pop'){ if(p&&p.type===t.dataset.p&&!t.dataset.no&&!t.dataset.id){ U.pop=null; render(); return; } const ex={}; if(t.dataset.no) ex.no=t.dataset.no; if(t.dataset.id) ex.id=t.dataset.id; if(t.dataset.k) ex.k=t.dataset.k; if(t.dataset.i!=null) ex.i=t.dataset.i; if(t.dataset.p==='use') ex.tell=true; openPop(t.dataset.p,ex,t); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='toast'){ U.pop=null; toast(t.dataset.t,false); render(); }
  else if(a==='oset'){ p.o=+t.dataset.o; render(); if(p.o===2) $('#fx-qt')?.focus(); }
  else if(a==='pck'){ e.preventDefault(); p.parts[t.dataset.pn]=!p.parts[t.dataset.pn]; render(); }
  else if(a==='tel'){ p.tell=t.checked; }
  else if(a==='tpa'){ p.toParts=t.checked; }
  else if(a==='ugo'){ const o=S.O.find(x=>x.no===p.no), s=stats(o.k), same=s.E.filter(e=>e.eng===o.eng); if(p.o==null) return; snap();
    const qv=p.o===2?parseFloat(p.qt):p.o===0?s.q:Math.round((same.length?same.reduce((a,e)=>a+e.h,0)/same.length:s.hrs)*10)/10;
    o.q=qv; o.parts=Object.keys(p.parts).filter(k=>p.parts[k]); o.from=s.E[0].ro; o.by=me(); U.pop=null;
    toast(`Used on ${o.no} — ${h1(qv)} h quoted${o.parts.length?`, ${o.parts.length} part${o.parts.length>1?'s':''} on the RO${p.toParts!==false?` (${me()===o.wr?'sent to Parts':F(o.wr)+' is asked'})`:''}`:''}${p.tell!==false?`. ${F(o.tech)} sees the usual fix on the Console.`:'.'}`); render(); }
  else if(a==='usenote'){ const r=S.R.find(x=>x.id===p.id); if(r.noteCause) p.c=r.noteCause; if(r.noteFix) p.x=r.noteFix; render(); }
  else if(a==='wgo'){ const r=S.R.find(x=>x.id===p.id); snap(); const c=(($('#fx-c')||{}).value||'').trim(), x=(($('#fx-x')||{}).value||'').trim(), cd=(($('#fx-cd')||{}).value||'').trim();
    r.cause=c||r.cause; r.fix=x||r.fix; r.done=1; Object.assign(r,{by:me(),byRole:myRole(),at:hm(NOW)}); S.M.push({id:'m'+r.id,k:r.k,date:TODAY,ro:r.ro,cust:r.cust,truck:r.truck,eng:r.eng,miles:300000,vin:'…new',cause:r.cause,fix:r.fix,parts:grp(r.k).V[0].parts,codes:cd?[cd]:(grp(r.k).V[0].codes),tech:r.tech,h:grp(r.k).V[0].q,q:grp(r.k).V[0].q,cost:0,out:'ok'});
    U.pop=null; toast(`Written up — it joins “${grp(r.k).t}”, now ${ents(r.k).length}×.`); render(); }
  else if(a==='mset'){ p.k=t.dataset.k; render(); }
  else if(a==='mgo'){ const r=S.R.find(x=>x.id===p.id), k=p.k||r.k; snap(); r.done=1; r.k=k; Object.assign(r,{by:me(),byRole:myRole(),at:hm(NOW)}); S.M.push({id:'m'+r.id,k,date:TODAY,ro:r.ro,cust:r.cust,truck:r.truck,eng:r.eng,miles:300000,vin:'…new',cause:r.cause,fix:r.fix,parts:grp(k).V[0].parts,codes:grp(k).V[0].codes,tech:r.tech,h:grp(k).V[0].q,q:grp(k).V[0].q,cost:0,out:'ok'}); U.pop=null; toast(`Merged into “${grp(k).t}” — now ${ents(k).length}×.`); render(); }
  else if(a==='rvok'){ const r=S.R.find(x=>x.id===t.dataset.id); snap(); r.ok=1; r.kept=1; Object.assign(r,{by:me(),byRole:myRole(),at:hm(NOW)}); toast(`${r.ro} kept as written — by ${F(me())}.`); render(); }
  else if(a==='apick'){ p.d.cmp=grp(t.dataset.k).t; p.k=t.dataset.k; render(); }
  else if(a==='ago'){ const d=p.d; d.cmp=(($('#fx-acmp')||{}).value||'').trim(); d.c=(($('#fx-ac')||{}).value||'').trim(); d.x=(($('#fx-ax')||{}).value||'').trim();
    if(!d.cmp||!(d.c||d.x)){ toast(!d.cmp?'Add the complaint.':'Add the cause, the correction, or both.',false); render(); return; }
    const g=G0.find(x=>x.t.toLowerCase()===d.cmp.toLowerCase()); if(!g){ toast('In the mock-up, pick one of the existing complaints — a new one would start its own group.',false); render(); return; }
    snap(); if(U.role==='tech'){ S.R.push({id:'rh'+Date.now(),k:g.k,ro:'—',cust:'Added by hand',tech:me(),truck:'—',eng:(($('#fx-aeng')||{}).value||'—'),gap:'hand',cmp:g.t,cause:d.c||'',fix:d.x||''}); U.pop=null; toast(`Sent to Review — a foreman, lead tech, Triage or the manager checks it before it counts.`); render(); return; }
    S.M.push({id:'mh'+Date.now(),k:g.k,date:TODAY,ro:'—',man:1,cust:'Added by hand',truck:'—',eng:(($('#fx-aeng')||{}).value||'—'),miles:0,vin:'',cause:d.c||'—',fix:d.x||'—',parts:[],codes:(($('#fx-acd')||{}).value||'').trim()?[(($('#fx-acd')||{}).value||'').trim()]:[],tech:'MR',h:g.V[0].q,q:g.V[0].q,cost:0,out:'ok'});
    U.pop=null; U.view='lib'; U.sel=g.k; toast(`Fix added to “${g.t}” — now ${ents(g.k).length}×.`); render(); }
  else if(a==='askuse'){ const o=S.O.find(x=>x.no===t.dataset.no); toast(`Asked ${F(o.wr)} to use this fix on ${o.no} — it shows on the Triage page.`,false); render(); }
  else if(a==='suggest'){ snap(); const gg=grp(U.sel); S.R.push({id:'rs'+Date.now(),k:gg.k,ro:'—',cust:'Suggested edit',tech:me(),truck:'—',eng:'—',gap:'hand',cmp:gg.t,cause:stats(gg.k).causes[0][0],fix:stats(gg.k).fixes[0][0]}); toast('Sent to Review — Frank, Mike, Alicia, Jordan or Ray looks at it.'); render(); }
  else if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }
  else if(a==='gocb'){ const o=S.O.find(x=>x.cb); U.view='lib'; U.sel=o.k; U.pop=null; render(); }
  else if(a==='tofix'){ U.hl=t.dataset.ro; render(); const el=$(`.fx-er[data-ro="${U.hl}"]`); if(el) el.scrollIntoView({block:'center'}); }
  else if(a==='cbsend'){ toast(`Sent to Frank — flagged as a comeback, with RO ${S.O.find(x=>x.no===t.dataset.no).cb.ro} linked.`,false); render(); }
  else if(a==='stp'){ e.preventDefault(); const d=U.steps[t.dataset.k]=U.steps[t.dataset.k]||{}; d[t.dataset.i]=!d[t.dataset.i]; render(); }
  else if(a==='qset'){ const k=t.dataset.k, s=stats(k); snap(); S.qo[k]=Math.round(s.hrs*10)/10; toast(`The usual quote is now ${h1(S.qo[k])} h — Use fix and the writer’s estimate start from it.`); render(); }
  else if(a==='qkeep'){ snap(); S.qk[t.dataset.k]=1; toast('Kept — it asks again if the gap grows.'); render(); }
  else if(a==='ctab'){ p.tab=t.dataset.v; render(); }
  else if(a==='cans'){ U.pop=null; toast(`Logged — “${t.dataset.v}”. It counts toward Held.`,false); render(); }
  else if(a==='sfix'){ p.f=+t.dataset.i; render(); }
  else if(a==='sgo'){ const s=stats(p.k), cur=S.std[p.k], i=p.f!=null?p.f:(cur?Math.max(0,s.fixes.findIndex(y=>y[0]===cur.fix)):0); snap(); S.std[p.k]={fix:s.fixes[i][0],note:(($('#fx-sn')||{}).value||'').trim(),by:me(),at:'Oct 22'}; U.pop=null; toast(`Shop standard set by ${F(me())} — it shows first, here and on the Console.`); render(); }
  else if(a==='sclr'){ snap(); delete S.std[p.k]; U.pop=null; toast('Standard removed.'); render(); }
  else if(a==='kpk'){ e.preventDefault(); p.sel[t.dataset.pn]=!p.sel[t.dataset.pn]; render(); }
  else if(a==='kgo'){ snap(); const n=(($('#fx-kn')||{}).value||'Kit').trim(), id='KIT-'+p.k.toUpperCase()+'-01'; S.kits[p.k]={id,n}; U.pop=null; toast(`${id} added to Parts → Catalog — “${n}”.`); render(); }
  else if(a==='fset2'){ const f=t.dataset.f; U[f]=U[f]===t.dataset.v?null:t.dataset.v; render(); }
  else if(a==='fclr'){ const f=t.dataset.f; if(f==='all'){ U.fe=U.fmdl=U.fmi=null; } else U[f]=null; render(); }
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
});
mock.addEventListener('input',e=>{ const p=U.pop, id=e.target.id; if(!p) return;
  if(id==='fx-qt'){ p.qt=e.target.value; const b=$('.tg-pop [data-a="ugo"]'); if(b) b.disabled=!(parseFloat(p.qt)>0); const h=$('.tg-pop .hint'); if(h&&parseFloat(p.qt)>0) h.textContent=h1(parseFloat(p.qt))+' h · '+usd0(parseFloat(p.qt)*RATE)+' labor'; }
  if(id==='fx-sn') p.n=e.target.value; if(id==='fx-kn') p.n=e.target.value;
  if(id==='fx-c') p.c=e.target.value; if(id==='fx-x') p.x=e.target.value; if(id==='fx-cd') p.cd=e.target.value;
  if(id==='fx-sq'||id==='fx-acmp'){ if(id==='fx-sq') p.q=e.target.value; else p.d.cmp=e.target.value; const pos=e.target.selectionStart; render(); const f=$('#'+id); if(f){ f.focus(); f.setSelectionRange(pos,pos); } }
  if(id==='fx-ac') p.d.c=e.target.value; if(id==='fx-ax') p.d.x=e.target.value; if(id==='fx-aeng') p.d.eng=e.target.value; if(id==='fx-acd') p.d.cd=e.target.value; if(id==='fx-apn') p.d.pn=e.target.value; });
mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.fx').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-290)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],.tk-note')){ U.pop=null; render(); } },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; U.view='lib'; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; U.pop=null; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'&&e.target.id==='fx-sq'){ const b=$('.tg-pop .fx-srr'); if(b) b.click(); return stop(); }
    if(k==='Enter'&&e.target.tagName==='TEXTAREA') return;
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(inF) return; const n=+k; if(n>=1&&n<=3){ const b=$(`.tg-pop [data-a="oset"][data-o="${n-1}"]`)||$$('.tg-pop [data-a="mset"]')[n-1]; if(b){ b.click(); return stop(); } } return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'){move(1);return stop();} if(k==='k'){move(-1);return stop();}
  if(k==='u'){ const b=$('.tg-next [data-p="use"]'); if(b) openPop('use',{no:b.dataset.no,tell:true},b); return stop(); }
  if(k==='a'){ const b=$('[data-a="pop"][data-p="add"]'); if(b) openPop('add',{},b); return stop(); }
  if(k==='/'){ const b=$('[data-a="pop"][data-p="srch"]'); if(b) openPop('srch',{},b); return stop(); }
  if(k>='1'&&k<='4'){ U.view=['lib','open','rev','trend'][+k-1]; render(); return stop(); }
});
function after(){
  const p=$('.tg-pop'), body=$('.tg-body');
  if(p&&U.pop&&body){ const W=body.offsetWidth, H=body.offsetHeight, pw=p.offsetWidth, ph=p.offsetHeight; let x, y;
    if(U.pop.ax!=null){ x=U.pop.ax+(U.pop.aw||0)-pw; y=U.pop.ay+6; if(y+ph>H-12) y=Math.max(12,(U.pop.at||y)-ph-6); }
    else { x=W-pw-16; y=12; }
    p.style.left=Math.round(Math.max(12,Math.min(x,W-pw-12)))+'px'; p.style.top=Math.round(Math.max(12,Math.min(y,H-ph-12)))+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #fx-sq')||$('.tg-pop #fx-acmp'); if(f){ U.pop._f=1; f.focus(); } }
  note();
}
const NOTE={
 1:{r:'.fx-steps',t:'Check first',p:'An ordered checklist built from every way this complaint was fixed — the cheap checks first. Tick them off as you go; the same list shows on the tech’s Console.'},
 2:{r:'.tg-pop',at:'left',t:'On the Console and phone',p:'When the clock starts on a complaint that’s been fixed before, the tech gets the usual fix. When it stops, one tap: did it work? The answer counts toward Held.'},
 3:{r:'.fx-cb',t:'Comeback alert',p:'Same truck, same complaint, inside 30 days. It links straight to the first fix and flags it for Frank — and the old fix now shows “Back now”.'},
 4:{r:'.tg-pop',at:'left',t:'Shop standard',p:'The foreman, a lead tech or the manager picks the best fix and adds a note. It shows first everywhere, with a star in the list.'},
 5:{r:'.fx-ts',t:'Tech support said',p:'Case numbers and what support told us, kept with the complaint — so the next tech starts where the last one ended.'},
 6:{r:'.fx-ph',t:'Photos and files',p:'Failed parts, before and after, Tech Tool printouts — from the ROs, or straight from the phone app. Click one to open it.'},
 7:{r:'.fx-or.code',t:'Matched by code',p:'The complaint says “check engine light”, but the code is SPN 3226 FMI 2 — the same code as the NOx sensor fixes. It matches on the code, not just the words.'},
 8:{r:'.tg-pop',at:'left',t:'Kit from a fix',p:'One click turns the usual parts into a kit in the Parts catalog — so the next one is pulled in one go.'},
 9:{r:'.fx-qc',t:'Quote check',p:'When the job keeps taking longer than the quote, it says how much labor isn’t being billed and offers to update the usual quote.'},
 10:{r:'.tg-pop',at:'right',t:'Filters',p:'Engine, model and miles. The list, the counts and the usual fix all follow — here, only the D13 TC jobs.'},
 11:{r:'.fx-war',t:'For a warranty claim',p:'The causal part, labor and the complaint-cause-correction story, already written from the usual fix. Copy it, or Warranty starts from it.'},
 12:{r:'.fx-trend',n:'.fx-trend > div:last-child',t:'Trends',p:'Last 90 days for the foreman and the manager: what keeps coming in, what didn’t hold, and which quotes run short. Click a row to open it.'}
};
function box(sels){ const L=[].concat(sels).map(s=>$(s)).filter(Boolean); if(!L.length) return null; const tk=$('.fx').getBoundingClientRect(); let l=1e9,t=1e9,r=-1e9,b=-1e9;
  L.forEach(e=>{ const x=e.getBoundingClientRect(); l=Math.min(l,x.left); t=Math.min(t,x.top); r=Math.max(r,x.right); b=Math.max(b,x.bottom); }); return {l:(l-tk.left)/scale,t:(t-tk.top)/scale,r:(r-tk.left)/scale,b:(b-tk.top)/scale}; }
const pick=s=>Array.isArray(s)?s.find(x=>$(x)):s;
function note(){ const nt=$('.tk-note'), rg=$('.tk-ring'), tk=$('.fx'); if(!nt||!rg||!tk) return; const N=U.note&&NOTE[U.note]; const R=N?(N.u?box(N.u):box(pick(N.r))):null;
  if(!R){ nt.hidden=true; rg.hidden=true; return; }
  rg.hidden=false; Object.assign(rg.style,{left:(R.l-5)+'px',top:(R.t-5)+'px',width:(R.r-R.l+10)+'px',height:(R.b-R.t+10)+'px'});
  nt.innerHTML=`<div class="h"><span class="n">${U.note}</span><b>${esc(N.t)}</b><button data-a="notex" title="Close">${ic('x',13)}</button></div><p>${esc(N.p)}</p>`; nt.hidden=false;
  const A=(N.n&&box(pick(N.n)))||R, W=tk.offsetWidth, H=tk.offsetHeight, nw=nt.offsetWidth, nh=nt.offsetHeight; let x, y;
  if(N.at==='right'&&A.r+nw+16<W-12){ x=A.r+16; y=A.t-6; } else if(N.at==='left'&&A.l-nw-16>12){ x=A.l-nw-16; y=A.t; } else { x=N.al==='right'?A.r-nw:A.l; y=A.b+12; if(y+nh>H-12) y=A.t-nh-16; }
  nt.style.left=Math.round(Math.max(12,Math.min(x,W-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const scrollTo_=sel=>{ const el=$(sel), pn=$('.fx-pane'); if(el&&pn){ pn.scrollTop=Math.max(0,el.offsetTop-150); note(); } };
const DEMO={
  d1:()=>{reset();setRole('fm');U.sel='cts';U.note=1;render();},
  d2:()=>{reset();setRole('fm');render();const b=$('[data-a="pop"][data-p="cons"]');openPop('cons',{k:'nox'},b);U.note=2;render();},
  d3:()=>{reset();setRole('fm');U.note=3;render();},
  d4:()=>{reset();setRole('fm');U.sel='turbo';render();const b=$('[data-a="pop"][data-p="std"]');openPop('std',{k:'turbo',f:0,n:'Check the connector, then run the actuator test — a re-pin alone came back.'},b);U.note=4;render();},
  d5:()=>{reset();setRole('fm');U.sel='egr';U.note=5;render();scrollTo_('.fx-ts');},
  d6:()=>{reset();setRole('fm');U.sel='wp';U.note=6;render();scrollTo_('.fx-ph');},
  d7:()=>{reset();setRole('tr');U.view='open';U.note=7;render();},
  d8:()=>{reset();setRole('fm');U.sel='ac';render();const b=$('[data-a="pop"][data-p="kit"]');openPop('kit',{k:'ac'},b);U.note=8;render();},
  d9:()=>{reset();setRole('fm');U.sel='seal';U.note=9;render();},
  d10:()=>{reset();setRole('fm');U.fe='D13 TC';U.sel='inj';render();const b=$('[data-a="pop"][data-p="flt2"]');openPop('flt2',{},b);U.note=10;render();},
  d11:()=>{reset();setRole('fm');U.sel='alt';U.note=11;render();scrollTo_('.fx-war');},
  d12:()=>{reset();setRole('mg');U.view='trend';U.note=12;render();},
  try:()=>{reset();setRole('fm');render();}
};
$$('[data-role]').forEach(b=>b.addEventListener('click',()=>{ setRole(b.dataset.role); render(); }));
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__fx={S:()=>S,U:()=>U,render,reset,openPop,DEMO,stats,ents};
reset(); render();
