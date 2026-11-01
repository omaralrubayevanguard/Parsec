
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P={"console": "<rect x=\"3.75\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"3.75\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3.75\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"13.25\" y=\"13.25\" width=\"7\" height=\"7\" rx=\"2\"/>", "ros": "<path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M8.5 12.5h7M8.5 16h4.5\"/>", "foreman": "<rect x=\"5\" y=\"4.75\" width=\"14\" height=\"15.5\" rx=\"2.5\"/><path d=\"M9.5 4.75V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.75M8.75 10.5h6.5M8.75 14h6.5M8.75 17.25h3.5\"/>", "manager": "<circle cx=\"9.25\" cy=\"8.25\" r=\"3.25\"/><path d=\"M3.5 19.5c0-3.2 2.6-5.25 5.75-5.25s5.75 2.05 5.75 5.25\"/><path d=\"M15.5 5.3a3.2 3.2 0 0 1 0 5.9M17.2 14.6c2 .6 3.3 2.2 3.3 4.4\"/>", "triage": "<rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12.25\" rx=\"2.75\"/><path d=\"M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M12 10.75v5.5M9.25 13.5h5.5\"/>", "timelog": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.25V12l3.25 1.9\"/>", "parts": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/>", "career": "<path d=\"M5 19.5v-5M10 19.5v-11M15 19.5v-7.5M20 19.5V5\"/>", "warranty": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "fixes": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/>", "newRo": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 8v8M8 12h8\"/>", "gear": "<path d=\"M4 8h8.5M17 8h3M4 16h3M11.5 16H20\"/><circle cx=\"14.75\" cy=\"8\" r=\"2.25\"/><circle cx=\"9.25\" cy=\"16\" r=\"2.25\"/>", "bell": "<path d=\"M6 16.75V11a6 6 0 0 1 12 0v5.75l1.5 1.5h-15z\"/><path d=\"M10 20.5a2.25 2.25 0 0 0 4 0\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "play": "<path d=\"M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z\"/>", "stop": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2.75\"/>", "swap": "<path d=\"M7 7.5h12.5L16 4M17 16.5H4.5L8 20\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"3.75\"/><path d=\"M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75\"/>", "print": "<path d=\"M7 9V4.5h10V9\"/><rect x=\"3.75\" y=\"9\" width=\"16.5\" height=\"7.5\" rx=\"2\"/><path d=\"M7 14.5h10v5H7z\"/>", "trash": "<path d=\"M4.5 6.5h15M9.5 6.5V4.75h5V6.5M6.5 6.5l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3l.9-12.2M10 10.5v5.5M14 10.5v5.5\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "keyTag": "<circle cx=\"8\" cy=\"15.5\" r=\"4\"/><path d=\"M10.9 12.6l8.6-8.6M16.5 7l2.5 2.5M14 9.5l2 2\"/>", "history": "<path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.75h3.75\"/><path d=\"M12 8.5V12l2.5 1.5\"/>", "save": "<path d=\"M5.5 4h10.2L20 8.3v10.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4z\"/><path d=\"M8 4v4.5h7V4M8 20v-6h8v6\"/>", "addJob": "<path d=\"M6.5 3.75h7l4.75 4.75v10.25a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.75V5.25a1.5 1.5 0 0 1 1.5-1.5z\"/><path d=\"M13.5 3.75V8.5h4.75\"/><path d=\"M12 11v6M9 14h6\"/>", "addPart": "<path d=\"M12 3.5l7.5 4v9l-7.5 4-7.5-4v-9z\"/><path d=\"M4.5 7.5l7.5 4 7.5-4M12 11.5v9\"/><path d=\"M19 15v6M16 18h6\"/>", "pencil": "<path d=\"M4.75 19.25l1-4L15.6 5.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L8.75 18.25z\"/><path d=\"M14 7l3 3\"/>", "note": "<path d=\"M6 3.75h12A1.25 1.25 0 0 1 19.25 5v9.5l-4.75 5.75H6A1.25 1.25 0 0 1 4.75 19V5A1.25 1.25 0 0 1 6 3.75z\"/><path d=\"M14.5 20.25v-4.5a1.25 1.25 0 0 1 1.25-1.25h3.5M8 8.5h8M8 12h5\"/>", "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>", "eye": "<path d=\"M2.75 12S6 5.75 12 5.75 21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "clip": "<path d=\"M19.4 11.2l-7.1 7.2a4.4 4.4 0 0 1-6.2-6.2l7.6-7.6a2.9 2.9 0 0 1 4.1 4.1l-7.3 7.3a1.4 1.4 0 0 1-2-2l6.6-6.6\"/>", "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>", "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>", "unit": "<path d=\"M2.75 16.5V7.25A1.5 1.5 0 0 1 4.25 5.75h9.25v10.75M13.5 9.25h3.6a1.5 1.5 0 0 1 1.2.6l2.2 2.9a1.5 1.5 0 0 1 .3.9v2.85h-2\"/><circle cx=\"7\" cy=\"17.25\" r=\"2\"/><circle cx=\"16.5\" cy=\"17.25\" r=\"2\"/><path d=\"M9 17.25h5.5\"/>", "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4\"/>", "moon": "<path d=\"M19.5 14.5A8 8 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z\"/>", "chat": "<path d=\"M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25H11.5L7 20v-3.5h-.25A2.25 2.25 0 0 1 4.5 14.25z\"/>", "exit": "<path d=\"M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 8l-4 4 4 4M6 12h9\"/>", "chevD": "<path d=\"M6.5 9.5L12 15l5.5-5.5\"/>", "chevU": "<path d=\"M6.5 14.5L12 9l5.5 5.5\"/>", "chevR": "<path d=\"M9.5 6.5L15 12l-5.5 5.5\"/>", "more": "<path d=\"M5.5 12h.01M12 12h.01M18.5 12h.01\" stroke-width=\"2.4\"/>", "inbox": "<path d=\"M3.75 13.5l2.6-7.1A1.5 1.5 0 0 1 7.76 5.4h8.48a1.5 1.5 0 0 1 1.41 1l2.6 7.1v4.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5z\"/><path d=\"M3.75 13.5h4.5l1.25 2h5l1.25-2h4.5\"/>", "sidebar": "<rect x=\"3.75\" y=\"4.75\" width=\"16.5\" height=\"14.5\" rx=\"2.75\"/><path d=\"M9.5 4.75v14.5\"/>", "link": "<path d=\"M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1\"/>", "pin": "<path d=\"M12 20.5s-6-5.6-6-10.25a6 6 0 0 1 12 0C18 14.9 12 20.5 12 20.5z\"/><circle cx=\"12\" cy=\"10.25\" r=\"2.25\"/>", "flag": "<path d=\"M6 20.5V4.5M6 5h10.5l-2 3.75 2 3.75H6\"/>", "file": "<path d=\"M7 3.75h6.5L18 8.25V19a1.25 1.25 0 0 1-1.25 1.25h-9.5A1.25 1.25 0 0 1 6 19V5a1.25 1.25 0 0 1 1-1.25z\"/><path d=\"M13.25 3.75V8.5H18M9 12.5h6M9 16h6\"/>", "undo": "<path d=\"M9 7.5 4.5 12 9 16.5\"/><path d=\"M4.5 12h10a5 5 0 0 1 0 10h-2\"/>", "dollar": "<path d=\"M12 3.75v16.5M16 7.5c-.6-1.5-2.1-2.25-4-2.25-2.35 0-4 1.2-4 3s1.6 2.5 4 3 4 1.25 4 3.1-1.8 3.15-4 3.15c-2 0-3.6-.85-4.25-2.5\"/>", "board": "<rect x=\"3.75\" y=\"4.5\" width=\"4.5\" height=\"15\" rx=\"1.25\"/><rect x=\"9.75\" y=\"4.5\" width=\"4.5\" height=\"10\" rx=\"1.25\"/><rect x=\"15.75\" y=\"4.5\" width=\"4.5\" height=\"12.5\" rx=\"1.25\"/>", "claim": "<path d=\"M12 3.5l7 2.75v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.5z\"/><path d=\"M8.9 12.1l2.2 2.2 4.1-4.4\"/>", "send": "<path d=\"M4 12 20 4.5 15.5 20l-3.25-6.75z\"/><path d=\"M12.25 13.25 20 4.5\"/>", "phone": "<path d=\"M6.2 4.5h2.6l1.4 3.6-1.9 1.3a10.5 10.5 0 0 0 5.3 5.3l1.3-1.9 3.6 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A14 14 0 0 1 4.6 6.2a1.6 1.6 0 0 1 1.6-1.7z\"/>", "gauge": "<path d=\"M4.5 16.5a7.5 7.5 0 1 1 15 0\"/><path d=\"M12 16.5l3.5-4.5\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"8.25\"/><path d=\"M12 11v5M12 8v.01\"/>", "inbox2": "<path d=\"M3.75 13.5h4.5l1.5 2.25h4.5l1.5-2.25h4.5\"/><path d=\"M5.6 6.2 3.75 13.5v5.25h16.5V13.5L18.4 6.2a1.5 1.5 0 0 0-1.45-1.2H7.05A1.5 1.5 0 0 0 5.6 6.2z\"/>"}, SI={"hold": "<svg class=\"tg-si\" data-s=\"hold\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>", "working": "<svg class=\"tg-si\" data-s=\"working\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"5.25\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><path d=\"M7 3.5a3.5 3.5 0 0 1 0 7z\" fill=\"currentColor\"/></svg>", "released": "<svg class=\"tg-si\" data-s=\"released\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"6\" fill=\"currentColor\"/><path d=\"M4.4 7.2l1.8 1.8 3.5-3.7\" fill=\"none\" stroke=\"var(--tg-panel)\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "declined": "<svg class=\"tg-si\" data-s=\"declined\" viewBox=\"0 0 14 14\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"7\" r=\"6\" fill=\"currentColor\"/><path d=\"M5 5l4 4M9 5l-4 4\" fill=\"none\" stroke=\"var(--tg-panel)\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>"}, LOGO="<svg viewBox=\"-110 -110 220 220\" aria-hidden=\"true\"><circle class=\"c\" r=\"14\"/><circle cx=\"44\" r=\"9.5\"/><circle cx=\"-44\" r=\"9.5\"/><circle cx=\"22\" cy=\"38\" r=\"9.5\"/><circle cx=\"-22\" cy=\"38\" r=\"9.5\"/><circle cx=\"22\" cy=\"-38\" r=\"9.5\"/><circle cx=\"-22\" cy=\"-38\" r=\"9.5\"/><circle cy=\"-84\" r=\"7\" class=\"o\"/><circle cy=\"84\" r=\"7\" class=\"o\"/><circle cx=\"73\" cy=\"42\" r=\"7\" class=\"o\"/><circle cx=\"-73\" cy=\"42\" r=\"7\" class=\"o\"/><circle cx=\"73\" cy=\"-42\" r=\"7\" class=\"o\"/><circle cx=\"-73\" cy=\"-42\" r=\"7\" class=\"o\"/></svg>";
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const usd=n=>'$'+(Math.round(n*100)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=n=>'$'+Math.round(n).toLocaleString('en-US');
/* today is Thu Oct 22, 10:15 — ages are in days (a = days ago, fractions are hours) */
const DAYN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const when=a=>{ if(a<1){ const h=Math.round(a*24); return h<1?'just now':h+' h ago'; } const d=new Date(2026,9,22); d.setDate(d.getDate()-Math.round(a)); return Math.round(a)===1?'yesterday':Math.round(a)<7?DAYN[d.getDay()]:(d.getMonth()+1)+'/'+d.getDate(); };
const ago=a=>a<1?Math.max(1,Math.round(a*24))+' h':Math.round(a)+' d';
const TECH={MR:'Mike Rodriguez',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran'};
const TF=k=>(TECH[k]||k).split(' ')[0];
const DESK={tech:['TE','Technician'],writer:['AP','Approval','Dana Kowalski'],parts:['PT','Parts','Ben Okafor'],foreman:['FM','Foreman','Ray Owens'],manager:['MG','Manager','Tom Hayes'],warranty:['WA','Warranty','you']};
const WHY={tech:['Write the cause','Write the correction','Photo of the causal part'],writer:['Bill the customer','Customer pays instead'],parts:['Send the failed part back','Check a part number'],foreman:['Second opinion','Labor over SRT'],manager:['Goodwill request','Write-off sign-off']};
const STL={repair:'In repair',ready:'Ready to file',submitted:'Submitted',returned:'Returned',approved:'Approved',paid:'Paid',denied:'Denied'};
const STC={repair:'repair',ready:'ready',submitted:'subm',returned:'back',approved:'ok',paid:'paid',denied:'den'};
const RANK={returned:0,ready:1,repair:2,submitted:3,approved:4,denied:5,paid:6};
const STAGE={repair:0,ready:1,submitted:2,returned:2,approved:3,paid:4,denied:4};
const op=(o)=>Object.assign({kind:'WARR',cause:'',fix:'',parts:[],causal:0,q:0,b:0,cost:0,done:null,claim:{},hist:[]},o);
const R0=[
 {no:'37701',ev:{dash:1,photos:1,dtc:1},cust:'Triad Cold Chain',unit:'T-412',truck:'2021 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH7MN281460',mi:'212,400',eh:'6,118',ws:'03-02-2021',cs:'C-8301',tech:'AW',opened:3,spot:'Lot B2',
  sent:{by:'Close-out rule',at:0.13,why:'Warranty work',note:'Close-out done · warranty work. Andre finished the alternator yesterday.'},
  ops:[op({cmp:'Alternator not charging — 12.1 V at idle',cause:'Rectifier failed internally; no output above 12.2 V.',fix:'Replaced alternator, verified 14.1 V charging at idle and 1,500 rpm.',parts:[['Alternator 24V 130A','23175123',1,512.00,'Installed']],q:1.6,b:1.5,cost:827.00,done:1.1,st:'ready',claim:{code:'SPN 167 FMI 1'}})]},
 {no:'37455',ev:{dash:1,photos:0,dtc:0},cust:'Highplains Grain',unit:'T-948',truck:'2018 Volvo VNL 670',eng:'D16 550HP',vin:'4V4NC9EH4JN956042',mi:'646,000',eh:'15,961',ws:'',cs:'C-8256',tech:'PS',opened:13,spot:'Lot D4',cust2:['Driver side mirror broken','Wheel seal leaking — drive axle'],
  ops:[op({cmp:'Coolant leak at water pump',cause:'Weep hole wet, bearing play at the pulley.',fix:'Replaced water pump and gasket, refilled and bled, pressure test held 15 psi.',parts:[['Water pump','21468475',1,412.00,'Installed',{tag:'FP-0412',shelf:'W3',keep:21}],['Water pump gasket','20734235',1,18.90,'Installed'],['Coolant VCS (gal)','VCS-1G',3,24.50,'Installed']],q:3.0,b:3.3,cost:1134.40,done:9,st:'returned',
   claim:{no:'W2627315',code:'',hrs:'3.3',amt:'1217.22',why:'Causal part photo missing, and labor is over the SRT — add the tech support case.',at:3},hist:[[8,'submitted','You'],[3,'returned','Volvo']]})]},
 {no:'37612',ev:{dash:1,photos:0,dtc:0},back:{no:'36210',days:41,claim:'W2601187',paid:812.30,tech:'LM',fix:'Replaced the left rear wheel seal and adjusted the brakes.'},cust:'Midway Auto Transport',unit:'T-305',truck:'2020 Volvo VNR 640',eng:'D13 455HP',vin:'4V4WC9EH0LN224817',mi:'338,900',eh:'9,402',ws:'06-18-2020',cs:'C-8277',tech:'LM',opened:29,spot:'Lot D1',
  ops:[op({cmp:'Wheel seal leaking — drive axle, left rear',cause:'Seal lip torn; hub oil contaminated the brake shoes.',fix:'Replaced wheel seal and both shoes on that end, refilled hub, checked end play.',parts:[['Wheel seal','85137214',1,79.90,'Installed',{tag:'FP-0409',shelf:'W2',keep:26}],['Brake shoe kit','85128891',1,186.40,'Installed']],q:2.4,b:2.6,cost:812.30,done:27,st:'ready',claim:{code:''}})]},
 {no:'37502',ev:{dash:1,photos:2,dtc:1},cust:'Piedmont Aggregates',unit:'T-221',truck:'2022 Volvo VNL 860',eng:'D13 TC 500HP',vin:'4V4NC9EJ1NN301125',mi:'141,700',eh:'4,013',ws:'11-09-2021',cs:'C-8310',tech:'MR',opened:4,spot:'Lot D6',
  ops:[op({cmp:'Check engine light — outlet NOx sensor',cause:'Outlet NOx sensor reading flat; heater circuit open.',fix:'Replaced outlet NOx sensor, cleared codes, ran a parked regen — no return.',parts:[['NOx sensor, outlet','22827993',1,684.10,'Installed',{tag:'FP-0414',shelf:'W4',keep:29}]],q:1.0,b:0.9,cost:893.60,done:1,st:'ready',claim:{code:'SPN 3226 FMI 2'}})]},
 {no:'37590',cust:'Silverline LTL',unit:'T-588',truck:'2021 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH2MN277019',mi:'263,500',eh:'7,731',ws:'01-25-2021',cs:'C-8219',tech:'MR',opened:16,spot:'Released',
  ops:[op({kind:'WARR',cmp:'DPF regen fault — soot load high, SPN 3719',cause:'DPF pressure sensor line cracked; false soot load.',fix:'Diagnosed with Tech Tool, smoke-tested lines.',q:1.5,b:1.4,cost:294.00,done:14,st:'approved',claim:{no:'W2624409',code:'SPN 3719 FMI 16',hrs:'1.4',amt:'294.00',at:3},hist:[[13,'submitted','You'],[3,'approved','Volvo']]}),
       op({cmp:'Clean DPF and replace DPF pressure sensor',cause:'Ash load at service limit; sensor line cracked.',fix:'Cleaned DPF on the machine, replaced sensor and line, forced regen.',parts:[['DPF pressure sensor','22303390',1,212.60,'Installed',{tag:'FP-0405',shelf:'W2',keep:1}],['Sensor line','21994377',1,38.20,'Installed']],q:3.5,b:3.4,cost:1103.71,done:13,st:'submitted',claim:{no:'W2624410',code:'SPN 3251 FMI 2',hrs:'3.4',amt:'1103.71',at:9},hist:[[9,'submitted','You']]})]},
 {no:'37388',cust:'Elkin Hardwoods',unit:'T-117',truck:'2020 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH5LN219934',mi:'402,100',eh:'11,880',ws:'02-14-2020',cs:'C-8174',tech:'KT',opened:22,spot:'Released',
  ops:[op({cmp:'DEF doser clogged — derate',cause:'Doser tip crystallized, flow test failed.',fix:'Replaced DEF doser, flow tested, cleared derate.',parts:[['DEF doser','23380146',1,618.00,'Installed']],q:1.8,b:1.9,cost:942.55,done:18,st:'submitted',claim:{no:'W2619980',code:'SPN 5394 FMI 5',hrs:'1.9',amt:'942.55',at:16},hist:[[16,'submitted','You']]})]},
 {no:'37466',pa:'PA-55021',cust:'Uwharrie Fuel',unit:'T-090',truck:'2019 Volvo VNL 860',eng:'D13 500HP',vin:'4V4NC9EJ8KN198812',mi:'488,300',eh:'13,215',ws:'08-30-2019',cs:'C-8150',tech:'PS',opened:26,spot:'Released',
  ops:[op({cmp:'Misfire cylinder 4 — injector',cause:'Injector 4 balance rate out of range.',fix:'Replaced injector 4, ran cylinder cut-out test, cleared codes.',parts:[['Injector','85020422',1,1180.00,'Installed'],['Injector seal kit','22479128',1,46.00,'Installed']],q:3.2,b:3.0,cost:2140.00,done:24,st:'approved',claim:{no:'W2621417',code:'SPN 654 FMI 5',hrs:'3.0',amt:'2140.00',at:12},hist:[[22,'submitted','You'],[12,'approved','Volvo']]})]},
 {no:'37011',cust:'Red Mesa Hauling',unit:'T-501',truck:'2022 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH6NN290344',mi:'118,200',eh:'3,377',ws:'04-04-2022',cs:'C-9129',tech:'PS',opened:2,spot:'B8',
  ops:[op({kind:'RECALL',cmp:'Recall 24V-118 — EGR cooler inspection',cause:'Recall inspection: seepage at the cooler outlet.',fix:'',parts:[['EGR cooler gasket','23199543',1,58.40,'Received']],q:1.0,b:0.3,cost:268.40,st:'repair'})]},
 {no:'37628',cust:'Prairie Line Trucking',unit:'T-733',truck:'2021 Volvo VNR 640',eng:'D11 425HP',vin:'4V4WC9EG3MN266051',mi:'190,600',eh:'5,540',ws:'05-12-2021',cs:'C-9140',tech:'MR',opened:1,spot:'B3',vol:{kind:'pre',at:0.25,what:'Turbo actuator, $1,940 — over the pre-approval limit'},
  ops:[op({cmp:'Turbo actuator fault — low boost',cause:'',fix:'',q:2.2,b:0.8,cost:0,st:'repair',claim:{code:'SPN 641 FMI 7'}})]},
 {no:'37544',cust:'Copperline Transport',unit:'T-266',truck:'2020 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH9LN230716',mi:'372,000',eh:'10,604',ws:'',cs:'C-9102',tech:'LM',opened:5,spot:'B6',vol:{kind:'ts',no:'TS-31422',at:2,what:'EGR valve sticking at 40% — asked Volvo for the next step'},
  ops:[op({cmp:'EGR valve stuck — derate',cause:'Valve sticking at 40%; Volvo tech support case open.',fix:'',q:2.0,b:1.1,cost:0,st:'repair'})]},
 {no:'37519',cust:'Dixie Fleet Services',unit:'T-844',truck:'2022 Volvo VNL 860',eng:'D13 TC 500HP',vin:'4V4NC9EJ4NN305581',mi:'99,800',eh:'2,870',ws:'09-20-2021',cs:'C-9088',tech:'AW',opened:7,spot:'Released',
  ops:[op({cmp:'Coolant temp sensor — erratic reading',cause:'Sensor connector pin corroded inside the sensor body.',fix:'Replaced coolant temp sensor, verified reading against IR gun.',parts:[['Coolant temp sensor','21531072',1,64.20,'Installed']],q:0.6,b:0.6,cost:190.20,done:5,st:'submitted',claim:{no:'W2628102',code:'SPN 110 FMI 2',hrs:'0.6',amt:'190.20',at:3},hist:[[3,'submitted','You']]})]},
 {no:'37733',ev:{dash:1,photos:1,dtc:0},cust:'Haw River Dairy',unit:'T-160',truck:'2021 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH0MN288127',mi:'201,300',eh:'5,902',ws:'10-11-2020',cs:'C-9151',tech:'LM',opened:3,spot:'Lot E3',
  ops:[op({cmp:'Air dryer purge valve leaking',cause:'Purge valve stuck open; cartridge saturated.',fix:'',parts:[['Air dryer cartridge','21620181',1,96.75,'Installed'],['Purge valve','20867321',1,142.30,'Installed']],q:1.2,b:1.1,cost:470.05,done:1,st:'ready',claim:{code:''}})]},
 {no:'37688',ev:{dash:0,photos:1,dtc:1},cust:'Sandhills Grain',unit:'T-409',truck:'2020 Volvo VNR 640',eng:'D11 425HP',vin:'4V4WC9EG8LN241906',mi:'287,700',eh:'8,215',ws:'02-03-2020',cs:'C-9133',tech:'KT',opened:4,spot:'Lot E5',
  ops:[op({cmp:'Coolant level sensor — false low warning',cause:'',fix:'Replaced coolant level sensor, warning cleared on the drive.',parts:[['Coolant level sensor','22430542',1,88.40,'Installed',{tag:'FP-0411',shelf:'W1',keep:28}]],q:0.8,b:0.7,cost:235.40,done:2,st:'ready',ask:{who:'KT',at:0.21,what:['cause']},claim:{code:'SPN 111 FMI 1'}})]},
 {no:'37620',cust:'Northline Transport',unit:'T-372',truck:'2021 Volvo VNL 670',eng:'D13 455HP',vin:'4V4NC9EH1MN266820',mi:'301,400',eh:'8,640',ws:'07-07-2021',cs:'C-8102',tech:'KT',opened:30,spot:'Released',
  ops:[op({cmp:'Coolant leak at water pump',cause:'Seal leaking at the weep hole.',fix:'Replaced water pump and gasket, pressure tested.',parts:[['Water pump','21468475',1,412.00,'Installed',{tag:'FP-0398',shelf:'W1',ret:{ra:'88213',by:5}}]],q:3.0,b:3.1,cost:1287.27,done:28,st:'paid',claim:{no:'W2618834',hrs:'3.0',amt:'1287.27',paid:'1287.27',at:2},hist:[[27,'submitted','You'],[15,'approved','Volvo'],[2,'paid','You']]})]},
 {no:'37203',pa:'PA-54870',cust:'Surry Feed & Seed',unit:'T-655',truck:'2018 Volvo VNL 670',eng:'D13 455HP',vin:'4V4NC9EH3JN901277',mi:'540,800',eh:'16,020',ws:'05-01-2018',cs:'C-8090',tech:'LM',opened:21,spot:'Released',
  ops:[op({cmp:'Radiator leak — lower tank',cause:'Lower tank seam cracked.',fix:'Replaced radiator.',parts:[['Radiator','21712578',1,1460.00,'Installed']],q:3.8,b:4.0,cost:2311.00,done:19,st:'denied',claim:{no:'W2620771',hrs:'4.0',amt:'2311.00',why:'Outside base coverage — 8 years in service.',at:5},hist:[[17,'submitted','You'],[5,'denied','Volvo']]})]}
];
const CL0=[{at:0.08,ic:'check',what:'Paid · $612.00',no:'37355',cust:'Rowan Ready Mix'}];
let S,U,UNDO,TOAST,TT;
const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30,pa:1500};
/* a date `n` days from today (Thu 10/22) */
const byTxt=n=>{ if(n<0) return Math.abs(n)===1?'yesterday':Math.abs(n)+' d ago'; if(n===0) return 'today'; if(n===1) return 'tomorrow'; const d=new Date(2026,9,22); d.setDate(d.getDate()+n); return (n<7?DAYN[d.getDay()]+' ':'')+(d.getMonth()+1)+'/'+d.getDate(); };
const dueChip=n=>`<span class="wx-due${n<=3?' late':n<=7?' soon':''}">${n<0?'overdue':n===0?'due today':n+' d left'}</span>`;
const fileLeft=o=>Math.round(S.cfg.file-o.done), resubLeft=o=>Math.round(S.cfg.resub-o.claim.at);
const storyGaps=o=>[!o.cause&&'cause',!o.fix&&'correction',!(o.b>0)&&'labor'].filter(Boolean);
const hrs=a=>a*24;
function reset(){S={R:JSON.parse(JSON.stringify(R0)),CL:JSON.parse(JSON.stringify(CL0)),cfg:Object.assign({},CFG0)};U={view:'claims',sel:null,op:null,pop:null,kb:false,filt:null,open:{},srch:false,q:''};UNDO=[];TOAST=null;}
const get=no=>S.R.find(r=>r.no===no);
const snap=()=>{UNDO.push(JSON.stringify(S));if(UNDO.length>30)UNDO.shift();};
function toast(t,undo=true){TOAST={t,undo};clearTimeout(TT);TT=setTimeout(()=>{TOAST=null;render();},5200);}
function clr(r,ic,what){S.CL.push({at:0,ic,what,no:r.no,cust:r.cust});}

/* ---------- claim logic ---------- */
const roSt=r=>r.ops.reduce((b,o)=>b===null||RANK[o.st]<RANK[b]?o.st:b,null);
const roStage=r=>Math.min(...r.ops.map(o=>STAGE[o.st]));
const amtOf=o=>+(o.claim.amt||o.cost||0);
const EV=r=>r.ev||{dash:1,photos:2,dtc:1};
/* every item: [label, done, required, group, fix, short name] */
const checks=(r,o)=>{ const ps=o.parts.length, cp=o.parts[o.causal], ev=EV(r), big=amtOf(o)>S.cfg.pa, L=[];
  const a=(l,ok,req,g,fix,sh)=>L.push([l,!!ok,req?1:0,g,fix||'',sh||l.toLowerCase()]);
  a('Complaint',!!o.cmp,1,'Story','','complaint'); a('Cause',!!o.cause,1,'Story','ask:cause','cause'); a('Correction',!!o.fix,1,'Story','ask:correction','correction');
  if(ps) a('Causal part picked',o.causal!=null,1,'Parts & labor','causal','causal part');
  a('Labor clocked',o.b>0,1,'Parts & labor','ask:labor','labor'); a('Fault code',!!o.claim.code,0,'Parts & labor','field:code','fault code');
  a('VIN (17)',r.vin.length===17,1,'Unit','field:vin','VIN'); a('Mileage',!!r.mi,1,'Unit','field:mi','mileage'); a('Engine hours',!!r.eh,0,'Unit','field:eh','engine hours'); a('Warranty start date',!!r.ws,1,'Unit','field:ws','warranty start');
  a('Dash picture',ev.dash,1,'Evidence','upload:dash','dash picture');
  if(ps) a('Photo of the failed part',ev.photos>0,1,'Evidence','upload:photos','part photo');
  if(o.claim.code) a('DTC readout',ev.dtc,1,'Evidence','upload:dtc','DTC readout');
  if(ps) a('Failed part tagged',cp&&cp[5],1,'Evidence','tag','part tag');
  if(r.back) a('Earlier claim # noted',!!o.claim.prev,1,'Comeback','field:prev','earlier claim #');
  if(big) a('Pre-approval #',!!r.pa,1,'Approvals','field:pa','pre-approval #');
  a('Tech support case #',!!r.ts,0,'Approvals','field:ts','tech support #');
  return L; };
const gaps=(r,o)=>checks(r,o).filter(c=>c[2]&&!c[1]);
const isOpen=r=>r.ops.some(o=>o.st!=='paid'&&o.st!=='denied');
const outstanding=()=>S.R.reduce((a,r)=>a+r.ops.filter(o=>o.st==='submitted'||o.st==='approved'||o.st==='returned').reduce((b,o)=>b+amtOf(o),0),0);
const GROUPS=[['sent','Sent to you'],['back','Returned'],['ready','Ready to file'],['tech','Needs the tech'],['volvo','Waiting on Volvo'],['part','Failed parts'],['paid','Not paid yet']];
function needsAll(){ const out=[], C=S.cfg;
  S.R.forEach(r=>{
    const add=(x)=>out.push(Object.assign({ro:r},x));
    if(r.sent){ add({g:'sent',ic:'inbox2',why:r.sent.note,btn:'Accept',act:'accept',late:hrs(r.sent.at)>C.ts}); return; }
    const back=r.ops.find(o=>o.st==='returned'); if(back){ const n=resubLeft(back); add({op:r.ops.indexOf(back),g:'back',ic:'undo',due:n,why:`Resubmit by ${byTxt(n)} · ${back.claim.why}`,btn:'Fix',act:'fix',late:n<=3}); return; }
    const rd=r.ops.filter(o=>o.st==='ready').sort((a,b)=>b.done-a.done);
    if(rd.length){ const o=rd[0], k=r.ops.indexOf(o), sg=storyGaps(o), n=fileLeft(o);
      if(sg.length&&o.ask){ const h=hrs(o.ask.at); add({op:k,g:'tech',ic:'chat',due:n,why:`${o.ask.n?'Nudged':'Asked'} ${TF(o.ask.who)} ${h<1?'just now':Math.round(h)+' h ago'} for the ${o.ask.what.join(' and ')} · not written yet`,btn:'Nudge',act:'nudge',late:h>=C.ask}); return; }
      if(sg.length){ add({op:k,g:'tech',ic:'chat',due:n,why:`${sg.map(x=>x[0].toUpperCase()+x.slice(1)).join(' and ')} not written · ${TF(r.tech)} finished it ${when(o.done)}`,btn:'Ask '+TF(r.tech),act:'ask',late:n<=3}); return; }
      const g=gaps(r,o); add({op:k,g:'ready',ic:'file',due:n,why:`File by ${byTxt(n)} · finished ${when(o.done)} · ${usd(amtOf(o))}`+(g.length?` · missing ${g.map(x=>x[5]).join(', ')}`:' · packet complete'),btn:'File',act:'file',late:n<=3}); return; }
    if(r.vol){ const v=r.vol, h=hrs(v.at), lim=v.kind==='ts'?C.ts:C.pre; if(h>=lim*0.75){ add({g:'volvo',ic:'phone',why:`${v.kind==='ts'?'Tech support case '+v.no:'Pre-approval'} · ${v.kind==='ts'?'open '+ago(v.at):'asked '+Math.round(h)+' h ago'} · no answer`,btn:'Follow up',act:'follow',late:h>=lim}); return; } }
    const sb=r.ops.find(o=>o.st==='submitted'&&o.claim.at>=C.claim); if(sb){ add({op:r.ops.indexOf(sb),g:'volvo',ic:'phone',why:`Claim ${sb.claim.no} filed ${ago(sb.claim.at)} ago · no answer`,btn:'Follow up',act:'follow',late:true}); return; }
    let fp=null; r.ops.forEach((o,k)=>o.parts.forEach((p,jj)=>{ const f=p[5]; if(!f||f.done) return; const n=f.ret?f.ret.by:f.keep; if(n<=7&&(!fp||n<fp.n)) fp={o,k,p,f,n,jj}; }));
    if(fp){ add({op:fp.k,pj:fp.jj,g:'part',ic:'parts',due:fp.n,why:fp.f.ret?`Volvo wants the ${fp.p[0].toLowerCase()} back · ship by ${byTxt(fp.n)} · RA ${fp.f.ret.ra}`:`${fp.p[0]} · ${C.keep} days are up ${byTxt(fp.n)} · tag ${fp.f.tag}`,btn:fp.f.ret?'Ship…':'Done holding…',act:'part',late:fp.n<=2}); return; }
    const ap=r.ops.find(o=>o.st==='approved'&&o.claim.at>=C.paid); if(ap){ add({op:r.ops.indexOf(ap),g:'paid',ic:'dollar',why:`Approved ${ago(ap.claim.at)} ago · ${usd(amtOf(ap))} not paid`,btn:'Paid…',act:'paid',late:ap.claim.at>=C.paid+5}); }
  });
  return out; }
const snoozed=r=>r.snz;
function match(x){ const f=U.filt; if(!f) return true; if(f==='due') return x.due!=null&&x.due<=7; if(f==='ready') return x.g==='ready'; if(f==='back') return x.g==='back'; if(f==='late') return x.late; return true; }
const needs=()=>needsAll().filter(x=>!snoozed(x.ro)&&match(x));
function grouped(){const G={};GROUPS.forEach(g=>G[g[0]]=[]);needs().forEach(x=>G[x.g].push(x));GROUPS.forEach(g=>G[g[0]].sort((a,b)=>(a.due!=null&&b.due!=null?a.due-b.due:0)||(b.late?1:0)-(a.late?1:0)));return G;}
const flat=()=>{const G=grouped();return GROUPS.reduce((a,g)=>a.concat(G[g[0]].map(x=>x.ro.no)),[]);};
const itemOf=no=>needs().find(x=>x.ro.no===no);
function sel(){ let r=get(U.sel); if(r) return r; const f=flat(); U.sel=f[0]||S.R[0].no; return get(U.sel); }
const chip=s=>`<span class="wx-c ${STC[s]}"><i></i>${STL[s]}</span>`;
const jt=o=>`<span class="wx-jt${o.kind==='RECALL'?' recall':''}">${o.kind==='RECALL'?'RECALL':'WARRANTY'}</span>`;

/* ---------- render ---------- */
function render(){
  const r=sel(), v=U.view, late=needsAll().filter(x=>x.late).length;
  const body=v==='board'?vBoard(r):vClaims(r);
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${ic('sidebar',18)}</a><a>${ic('search',18)}</a><span class="ck"><i></i></span><span class="sep"></span>${['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'].map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='warranty'?'is-on':''}">${ic(k,18)}${k==='triage'?'<span class="rl-badge">2</span>':''}</a>`).join('')}<span class="sp"></span><a>${ic('gear',18)}</a></aside>
  <div class="tg-panel"><div class="tg wx">${head()}<div class="tg-body v-${v}">${list()}<div class="tg-main">${body}</div>${pop()}</div></div>${U.print?printView():''}${TOAST?`<div class="toast-fm">${esc(TOAST.t)}${TOAST.undo?`<button data-a="undo">${ic('history',14)}Undo</button>`:''}</div>`:''}</div></div>`;
  after();
}
function head(){
  const all=needsAll(), late=all.filter(x=>x.late).length, due=all.filter(x=>x.due!=null&&x.due<=7).length, ready=all.filter(x=>x.g==='ready').length, back=all.filter(x=>x.g==='back').length, open=S.R.filter(isOpen).length;
  const f=(k,n,t,w)=>{const o=U.filt===k;return `<button class="tg-hf${w?' w':''}${o?' on':''}" data-a="filt" data-k="${k}"><b>${n}</b>${t}${o?ic('x',12):''}</button>`;};
  const vs=[['claims','claim','Claims'],['board','board','Board']];
  const sr=U.srch?`<span class="tg-srch open"><span class="tg-srch-i">${ic('search',15)}</span><input id="wx-q" placeholder="RO, claim #, VIN, customer or code" value="${esc(U.q)}" autocomplete="off">${kbd('Esc')}</span>`:`<button class="btn ib tg-srch-b" data-a="srch" title="Search ( / )">${ic('search',16)}</button>`;
  return `<header class="tg-head"><h1 class="tg-h1">Warranty</h1><span class="tg-facts"><button class="tg-hf" data-a="filt" data-k=""><b>${open}</b>open claims</button><i>·</i>${f('ready',ready,'ready to file')}<i>·</i>${f('back',back,'returned',back>0)}<i>·</i>${f('due',due,'due this week',due>0)}<i>·</i><span class="tg-hf" style="cursor:default"><b>${usd0(outstanding())}</b>waiting on Volvo</span><i>·</i>${f('late',late,'late',true)}</span>
  <div class="tg-views">${vs.map((x,i)=>`<button class="${U.view===x[0]?'on':''}" data-a="view" data-v="${x[0]}" title="${x[2]} (${i+1})">${ic(x[1],14)}${x[2]}</button>`).join('')}</div><span class="tg-hsep"></span>${sr}<button class="btn ib" data-a="cfg" title="Warranty settings">${ic('gear',16)}</button>${U.srch?`<div class="tg-srpop">${search()}</div>`:''}</header>`;
}
function search(){
  const q=U.q.trim().toLowerCase();
  const hay=r=>[r.no,r.cust,r.vin,r.unit].concat(r.ops.map(o=>[o.cmp,o.claim.no||'',o.claim.code||''].join(' '))).join(' ').toLowerCase();
  const L=q?S.R.filter(r=>q.split(/\s+/).every(w=>hay(r).includes(w))).slice(0,6):flat().slice(0,4).map(get);
  return `<div class="h">${q?L.length+' claims':'In Needs action'}</div>`+(L.length?L.map((r,i)=>`<div class="tg-sr${i===0?' k':''}" data-a="sel" data-ro="${r.no}"><b class="tg-no">${r.no}</b><b class="cu">${esc(r.cust)}</b><small>${esc(r.ops.map(o=>o.claim.no).filter(Boolean).join(' · ')||'no claim # yet')}</small><span class="wh"><span class="w1">${esc(r.ops[0].cmp)}</span><span class="w2">${chip(roSt(r))}</span></span></div>`).join(''):`<div class="nores">Nothing matches “${esc(U.q)}”.</div>`)+`<div class="tg-pft"><span>${kbd('↑')}${kbd('↓')} move</span><span>${kbd('↵')} open</span><span>${kbd('Esc')} close</span></div>`;
}
function list(){
  const G=grouped(), L=flat(), s=U.sel, kb=U.kb, sn=S.R.filter(snoozed);
  const item=x=>{const r=x.ro,on=r.no===s;return `<div class="tg-it${on?' on':''}${on&&kb?' kb':''}" data-a="sel" data-ro="${r.no}">${x.late?'<i class="tg-dot"></i>':''}<span class="tg-gi">${ic(x.ic,15)}</span><span class="tg-t"><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b>${r.back?`<span class="tg-back">${ic('history',11)}Comeback</span>`:''}${r.ops.length>1&&x.op!=null?`<span class="tg-spot">op ${x.op+1}</span>`:''}${x.due!=null&&(x.due<=7||x.g==='back'||x.g==='part')?dueChip(x.due):''}</span><span class="tg-w${x.late?' late':''}">${esc(x.why)}</span><button class="btn btn-sm ib tg-snz" data-a="pop" data-p="snooze" data-ro="${r.no}" title="Snooze (S)">${ic('clock',15)}</button><button class="btn btn-sm${x.act==='file'||x.act==='fix'||x.act==='ask'?' btn-primary':''} tg-go" data-a="do" data-ro="${r.no}">${esc(x.btn)}${on&&kb?kbd('↵'):''}</button></div>`;};
  let body;
  if(!L.length) body=U.filt?`<div class="tg-empty"><span class="tg-ring0">${ic('check',22)}</span><h3>Nothing here</h3><p>No claim in Needs action matches.</p><button class="btn btn-sm" data-a="filt" data-k="">Clear filter</button></div>`:`<div class="tg-empty"><span class="tg-ring0 ok">${ic('check',22)}</span><h3>All caught up</h3><p>Nothing to file, fix or chase.</p></div>`;
  else body=GROUPS.filter(g=>G[g[0]].length).map(g=>`<div class="tg-grp">${g[1]}<span>${G[g[0]].length}</span></div>`+G[g[0]].map(item).join('')).join('');
  if(sn.length) body+=`<div class="tg-sec${U.open.snz?' open':''}" data-a="open" data-k="snz">${ic('chevR',12)}<span>Snoozed</span><span class="n">${sn.length}</span></div>`+(U.open.snz?`<div class="tg-rows">${sn.map(r=>`<div class="tg-row" data-a="sel" data-ro="${r.no}"><time>${esc(r.snz)}</time><b class="tg-no">${r.no}</b><b class="tg-cu">${esc(r.cust)}</b><small>${ic('clock',12)}${esc(r.snzWhy||'Snoozed')}</small><button class="btn btn-sm tg-gh" data-a="wake" data-ro="${r.no}">Wake</button></div>`).join('')}</div>`:'');
  body+=`<div class="tg-sec${U.open.clr?' open':''}" data-a="open" data-k="clr">${ic('chevR',12)}<span>Cleared today</span><span class="n">${S.CL.length}</span></div>`+(U.open.clr?`<div class="tg-rows">${S.CL.slice().reverse().map(c=>`<div class="tg-row done"><time>${c.at?'08:12':'now'}</time><b class="tg-no">${c.no}</b><b class="tg-cu">${esc(c.cust)}</b><small>${ic(c.ic,12)}${esc(c.what)}</small></div>`).join('')}</div>`:'');
  const x=itemOf(s);
  const keys=`<div class="tg-keys"><span>${kbd('J')}${kbd('K')}move</span>${x?`<span>${kbd('↵')}<b>${esc(x.btn)}</b></span>`:''}<span>${kbd('S')}snooze</span><span>${kbd('T')}send to</span><span>${kbd('C')}copy</span><span>${kbd('/')}search</span></div>`;
  return `<section class="tg-list"><div class="tg-lh">Needs action<span class="n">${L.length}</span>${U.filt?`<button class="tg-fchip${U.filt==='late'||U.filt==='back'||U.filt==='due'?' w':''}" data-a="filt" data-k="">${({ready:'Ready to file',back:'Returned',late:'Late',due:'Due this week'})[U.filt]}${ic('x',11)}</button>`:''}<button class="tg-done" data-a="open" data-k="clr" data-force="1">${ic('check',13)}${S.CL.length} cleared today</button></div><div class="tg-scroll">${body}</div>${keys}</section>`;
}
/* the selected RO's claim, at the top of both views */
function topOf(r, big){
  const s=roSt(r), x=itemOf(r.no), st=roStage(r), ret=r.ops.some(o=>o.st==='returned'), den=r.ops.every(o=>o.st==='denied'), paidAll=r.ops.every(o=>o.st==='paid');
  const claimed=r.ops.reduce((a,o)=>a+(o.st!=='repair'?amtOf(o):0),0), paid=r.ops.reduce((a,o)=>a+(+o.claim.paid||0),0);
  const stops=['Repair','Ready to file','Submitted','Approved','Paid'];
  const trk=`<div class="wx-trk"><span class="ln"><i style="width:${st/4*100}%"></i></span>${stops.map((t,i)=>{ let c=i<st?'done':i===st?'cur':'', l=t, g=i<st?ic('check',10):'';
      if(i===st&&ret){c='back';l='Returned';g=ic('undo',10);} else if(i===4&&den){c='den';l='Denied';g=ic('x',10);} else if(i===4&&paidAll){c='paid';g=ic('check',10);}
      return `<span class="wx-stp ${c}"><span class="d">${g}</span>${l}</span>`; }).join('')}</div>`;
  const next=x&&x.g==='sent'?r.sent.note:x?x.why:s==='repair'?`${TF(r.tech)} is still on it — it comes here as Ready to file when the op is done.`:s==='submitted'?'Filed — waiting on Volvo.':s==='approved'?'Approved — waiting for the credit.':s==='paid'?'Paid in full.':s==='denied'?r.ops[0].claim.why:'';
  const fact=(k,v,cls)=>`<div><small>${k}</small><span class="${cls||''}">${v?esc(v):'<i>—</i>'}</span></div>`;
  return `<div class="tg-top"><div class="r1"><b class="tg-no">RO-${r.no}</b>${chip(s)}<span>·</span><span>${esc(r.eng)} · Unit ${esc(r.unit)} · ${esc(r.truck)}</span><span class="sp"></span><button class="btn btn-sm" data-a="pop" data-p="xfer" data-ro="${r.no}">${ic('swap',14)}Send to…</button><button class="btn btn-sm">Open RO</button></div>
   <h2>${esc(r.cust)}</h2>
   <div class="wx-sum">${trk}<div class="wx-money"><small>${paid?'Paid':'Claimed'}</small><b>${paid?usd(paid):claimed?usd(claimed):'—'}</b></div></div>
   ${big?`<div class="wx-facts">${fact('VIN',r.vin)}${fact('Mileage',r.mi+' mi')}${fact('Engine hours',r.eh)}${fact('Warranty starts',r.ws)}${fact('Case #',r.cs)}${fact('Technician',TECH[r.tech],'s')}</div>`:''}</div>
   <div class="tg-next" style="margin:14px 28px 0"><span class="k">Next</span><p>${esc(next)}</p>${x?`<button class="btn btn-sm${x.act==='file'||x.act==='fix'?' btn-primary':''}" data-a="do" data-ro="${r.no}">${esc(x.btn)}${kbd('↵')}</button>`:''}</div>`;
}
function printView(){ const r=get(U.print.ro), ops=r.ops.filter(o=>o.st!=='repair'), ev=EV(r);
  const ph=(t,s,k)=>`<figure class="wx-ph"><span class="img ${k}">${ic(k==='dash'?'gauge':k==='dtc'?'note':'parts',22)}</span><figcaption><b>${t}</b>${s}</figcaption></figure>`;
  return `<div class="wx-pv"><div class="wx-pvb"><b>Print packet</b><span>RO-${r.no} · ${esc(r.cust)} · ${ops.length} warranty op${ops.length>1?'s':''}</span><span class="sp"></span><button class="btn btn-sm" data-a="pvx">Close${kbd('Esc')}</button><button class="btn btn-sm btn-primary" data-a="pvprint">${ic('print',13)}Print</button></div>
   <div class="wx-pvs"><article class="wx-sheet">
    <header><div><span class="lg">${LOGO}</span><b>Warranty claim packet</b><small>Vanguard Truck Center · Greensboro</small></div><div class="r"><b>RO-${r.no}</b><small>${ops.map(o=>o.claim.no).filter(Boolean).join(' · ')||'Claim # when filed'}</small><small>Printed ${dateOf(0)}</small></div></header>
    <dl class="wx-shu"><div><dt>Customer</dt><dd>${esc(r.cust)}</dd></div><div><dt>Unit</dt><dd>${esc(r.unit)} · ${esc(r.truck)}</dd></div><div><dt>Engine</dt><dd>${esc(r.eng)}</dd></div><div><dt>VIN</dt><dd class="m">${esc(r.vin)}</dd></div><div><dt>Mileage</dt><dd class="m">${esc(r.mi)}</dd></div><div><dt>Engine hours</dt><dd class="m">${esc(r.eh)}</dd></div><div><dt>Warranty start</dt><dd class="m">${esc(r.ws||'—')}</dd></div><div><dt>Case #</dt><dd class="m">${esc(r.cs)}</dd></div></dl>
    ${r.back?`<p class="wx-shb">Comeback of RO-${r.back.no} (${r.back.days} days) · earlier claim ${esc(r.back.claim)}</p>`:''}
    ${ops.map(o=>{ const k=r.ops.indexOf(o); return `<section><h4><span>Op ${k+1}</span>${esc(o.cmp)}<em>${o.kind==='RECALL'?'Recall':'Warranty'}${o.claim.no?' · '+esc(o.claim.no):''}</em></h4>
      <dl class="wx-sh3"><dt>Complaint</dt><dd>${esc(o.cmp)}</dd><dt>Cause</dt><dd>${esc(o.cause||'—')}</dd><dt>Correction</dt><dd>${esc(o.fix||'—')}</dd></dl>
      ${o.parts.length?`<table><thead><tr><th>Part</th><th>Part #</th><th>Qty</th><th>Failed-part tag</th></tr></thead><tbody>${o.parts.map((x,j)=>`<tr><td>${esc(x[0])}${o.causal===j?' <b>· causal</b>':''}</td><td class="m">${esc(x[1])}</td><td class="m">${x[2]}</td><td class="m">${x[5]?esc(x[5].tag)+' · '+esc(x[5].shelf):'—'}</td></tr>`).join('')}</tbody></table>`:''}
      <p class="wx-shl">Labor ${esc(o.claim.hrs||o.b.toFixed(1))} h · ${esc(TECH[r.tech])} · fault code ${esc(o.claim.code||'—')} · amount ${usd(amtOf(o))}</p></section>`; }).join('')}
    <section><h4><span>Photos</span>Evidence</h4><div class="wx-phs">${ev.dash?ph('Dash',' · '+esc(r.mi)+' mi · '+esc(r.eh)+' h','dash'):''}${ev.photos?ph('Failed part',' · '+esc((ops[0]&&ops[0].parts[ops[0].causal]||['—'])[0]),'part'):''}${ev.photos>1?ph('Failed part',' · tag in view','part'):''}${ev.dtc?ph('Tech Tool',' · DTC readout','dtc'):''}</div></section>
    <footer>Printed from Parsec · keep with the failed part until the claim is paid</footer>
   </article></div></div>`; }
function vClaims(r){
  const cust=r.cust2||[];
  return `<div class="wx-cl" data-scroll="cl">${topOf(r,true)}<div class="wx-pad">${r.back?comeback(r):''}${cust.length?`<div class="wx-note">${ic('info',15)}<span><b>${cust.length} customer-pay operation${cust.length>1?'s stay':' stays'} on the RO</b> and ${cust.length>1?'aren’t':'isn’t'} part of the claim: ${esc(cust.join(' · '))}</span></div>`:''}${r.ops.map((o,i)=>opCard(r,o,i)).join('')}</div></div>`;
}
const dateOf=a=>{ const d=new Date(2026,9,22); d.setDate(d.getDate()-Math.round(a||0)); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); };
/* the claim screen's order — every line copies on its own */
function copyRows(r,o){ const cp=o.parts[o.causal], oth=o.parts.filter((x,k)=>k!==o.causal);
  return [['VIN',r.vin],['Mileage',String(r.mi).replace(/,/g,'')],['Engine hours',String(r.eh).replace(/,/g,'')],['Repair date',o.done!=null?dateOf(o.done):''],['Fault code',o.claim.code||''],['Causal part #',cp?cp[1]:''],
    ['Complaint',o.cmp,1],['Cause',o.cause,1],['Correction',o.fix,1],['Labor hours',o.claim.hrs||o.b.toFixed(1)],['Other parts',oth.map(x=>x[1]+' ×'+x[2]).join(', ')],['Pre-approval #',r.pa||''],['Tech support #',r.ts||(r.vol&&r.vol.no)||''],['Earlier claim #',r.back?r.back.claim:'']]; }
function clip(t){ try{ navigator.clipboard.writeText(t).catch(()=>{}); }catch(e){} }
const askBtn=(r,o,i)=>o.done!=null&&!o.ask?` <button class="wx-ask" data-a="pop" data-p="ask" data-ro="${r.no}" data-op="${i}">Ask ${esc(TF(r.tech))}</button>`:'';
const FIXL={'ask':r=>'Ask '+TF(r.tech),'causal':()=>'Pick','field':()=>'Add','upload':()=>'Upload','tag':()=>'Tag it'};
function fixBtn(r,i,x){ if(!x[4]) return ''; const k=x[4].split(':')[0]; let l=FIXL[k](r); if(x[4]==='field:prev') l='Add '+r.back.claim; return `<button class="btn btn-sm" data-a="fix" data-fix="${x[4]}" data-ro="${r.no}" data-op="${i}">${esc(l)}</button>`; }
function pkRows(r,o,i,live){ const C=checks(r,o), g=C.filter(x=>x[2]&&!x[1]), opt=C.filter(x=>!x[2]&&!x[1]), ok=C.filter(x=>x[1]);
  return g.map(x=>`<div class="wx-pk-r"><span class="i no">${ic('flag',11)}</span><span class="t">${esc(x[0])}<small>${esc(x[3])}</small></span>${live?fixBtn(r,i,x):''}</div>`).join('')
    +opt.map(x=>`<div class="wx-pk-r opt"><span class="i">${ic('plus',11)}</span><span class="t">${esc(x[0])}<small>optional</small></span>${live?fixBtn(r,i,x):''}</div>`).join('')
    +(ok.length?`<div class="wx-pk-ok">${ic('check',12)}<span>${ok.map(x=>esc(x[0])).join(' · ')}</span></div>`:''); }
function packet(r,o,i,live){ const C=checks(r,o), req=C.filter(x=>x[2]), done=req.filter(x=>x[1]).length, full=done===req.length;
  return `<div class="wx-pk${full?' full':''}"><div class="wx-pk-h"><b>Packet</b><span>${done} of ${req.length}</span><span class="m"><i style="width:${(done/req.length*100).toFixed(0)}%"></i></span>${full?`<span class="okt">${ic('check',12)}Everything Volvo asks for</span>`:''}</div>${pkRows(r,o,i,live)}</div>`; }
function comeback(r){ const b=r.back; return `<div class="wx-line back">${ic('history',14)}<span><b>Comeback</b> — same unit back ${b.days} days after <b>RO-${b.no}</b>, same complaint. ${esc(TF(b.tech))}: “${esc(b.fix)}” · claim <b>${esc(b.claim)}</b> paid ${usd(b.paid)}</span><button class="btn btn-sm" data-a="cpy1" data-v="${esc(b.claim)}">${ic('copy',13)}${esc(b.claim)}</button><button class="btn btn-sm tg-gh">Open RO-${b.no}</button></div>`; }
function opCard(r,o,i){
  const g=gaps(r,o), C=checks(r,o), s=o.st, c=o.claim;
  const inp=(k,l,ph,w,v)=>`<label class="wx-f${w?' w':''}"><span>${l}</span><input data-f="${k}" data-ro="${r.no}" data-op="${i}" value="${esc(v!=null?v:c[k]||'')}" placeholder="${esc(ph||'')}"></label>`;
  const btn=(to,l,k,dis,tip)=>`<button class="btn btn-sm${k?' '+k:''}" data-a="st" data-ro="${r.no}" data-op="${i}" data-to="${to}"${dis?' disabled':''}${tip?` title="${esc(tip)}"`:''}>${l}</button>`;
  let acts='';
  if(s==='repair') acts=btn('submitted','Submit claim','btn-primary',true,'Finish the operation first');
  else if(s==='ready') acts=`<button class="btn btn-sm btn-primary" data-a="do" data-ro="${r.no}" data-op="${i}">${ic('send',13)}File claim…</button>`;
  else if(s==='submitted') acts=btn('approved','Approved','btn-primary')+btn('returned','Returned')+btn('denied','Denied','bad');
  else if(s==='returned') acts=btn('submitted','Resubmit','btn-primary',g.length>0)+btn('denied','Denied','bad');
  else if(s==='approved') acts=`<button class="btn btn-sm btn-primary" data-a="pop" data-p="paid" data-ro="${r.no}" data-op="${i}">${ic('dollar',13)}Mark paid…</button>`+btn('returned','Returned');
  else acts=btn('reopen','Reopen');
  const lit=U.op===i&&U.sel===r.no;
  return `<section class="wx-op${s==='returned'?' hl':lit?' sel':''}" data-op="${i}"><header class="wx-oph"><span class="n">${i+1}</span>${jt(o)}<h3>${esc(o.cmp)}</h3>${s==='ready'?`<span class="wx-by">File by ${byTxt(fileLeft(o))}</span>${dueChip(fileLeft(o))}`:s==='returned'?`<span class="wx-by">Resubmit by ${byTxt(resubLeft(o))}</span>${dueChip(resubLeft(o))}`:''}<span class="os">${o.done!=null?SI.released+'Complete':SI.working+'Working'}</span>${chip(s)}</header>
   <div class="wx-opb"><div>
     <dl class="wx-story"><dt>Complaint</dt><dd>${esc(o.cmp)}</dd><dt>Cause</dt><dd class="${o.cause?'':'miss'}">${o.cause?esc(o.cause):'Not written yet'+askBtn(r,o,i)}</dd><dt>Correction</dt><dd class="${o.fix?'':'miss'}">${o.fix?esc(o.fix):'Not written yet'+askBtn(r,o,i)}</dd></dl>
     ${o.ask?`<div class="wx-line ask">${ic('chat',14)}<span>Waiting on <b>${esc(TF(o.ask.who))}</b> · asked ${hrs(o.ask.at)<1?'just now':Math.round(hrs(o.ask.at))+' h ago'} for the ${esc(o.ask.what.join(' and '))} · it’s on ${TF(o.ask.who)}’s Console</span><button class="btn btn-sm" data-a="nudge" data-ro="${r.no}" data-op="${i}">Nudge</button></div>`:''}
     ${o.parts.length?`<span class="wx-k">Parts${o.parts.length>1?' · pick the causal part':''}</span><div class="wx-pts">${o.parts.map((p,j)=>`<div class="wx-pt${o.causal===j?' on':''}" data-a="causal" data-ro="${r.no}" data-op="${i}" data-j="${j}"><span class="r"></span><span class="d">${esc(p[0])}${o.causal===j?'<em>CAUSAL</em>':''}</span><span class="pn">${esc(p[1])}</span><span class="q">×${p[2]} · ${usd(p[3])}</span></div>${p[5]?`<div class="wx-fp">${ic('parts',12)}Failed part · tag <b>${esc(p[5].tag)}</b> · shelf ${esc(p[5].shelf)} · ${p[5].done?esc(p[5].done):p[5].ret?`Volvo wants it back — ship by ${byTxt(p[5].ret.by)} · RA ${esc(p[5].ret.ra)}`:`keep until ${byTxt(p[5].keep)}`}</div>`:''}`).join('')}</div>`:''}
     ${r.vol&&i===0?`<div class="wx-line vol">${ic('phone',14)}<span>${r.vol.kind==='ts'?`Tech support case <b>${esc(r.vol.no)}</b> · open ${ago(r.vol.at)}`:`Pre-approval asked <b>${Math.round(hrs(r.vol.at))} h ago</b>`} · ${esc(r.vol.what)}</span><button class="btn btn-sm" data-a="pop" data-p="follow" data-ro="${r.no}" data-op="0">Follow up</button></div>`:''}
     <div class="wx-lab"><span>Quoted <b>${o.q.toFixed(1)}h</b></span><span>Clocked <b>${o.b.toFixed(1)}h</b></span><span>Cost <b>${o.cost?usd(o.cost):'—'}</b></span><span>${esc(TECH[r.tech])}</span></div>
   </div><div>
     <span class="wx-k">Claim</span>
     <div class="wx-grid">${inp('no','Claim #','Given when you file')}${inp('code','Fault code','SPN / FMI')}${inp('hrs','Labor hrs',o.b.toFixed(1))}${inp('amt','Amount $',o.cost?o.cost.toFixed(2):'0.00')}${s==='paid'?inp('paid','Paid $','',true):''}${s==='returned'||s==='denied'?`<label class="wx-f w${s==='returned'?' bad':''}"><span>${s==='returned'?'Why it came back':'Why it was denied'}</span><input data-f="why" data-ro="${r.no}" data-op="${i}" value="${esc(c.why||'')}"></label>`:''}</div>
     ${packet(r,o,i,s!=='paid'&&s!=='denied')}
     <div class="wx-acts">${acts}${s!=='repair'?`<button class="btn btn-sm" data-a="copy" data-ro="${r.no}" data-op="${i}" title="Copy for the claim (C)">${ic('copy',13)}Copy</button><button class="btn btn-sm" data-a="print" data-ro="${r.no}" data-op="${i}" title="Print packet (P)">${ic('print',13)}Print</button>`:''}<span class="sp"></span><button class="btn btn-sm tg-gh">${ic('note',13)}Open on RO</button></div>
   </div></div>
   ${o.hist.length?`<div class="wx-hist">${o.hist.slice().reverse().map(h=>`<span><b>${STL[h[1]]}</b> ${when(h[0])} · ${esc(h[2])}</span>`).join('')}</div>`:''}</section>`;
}
function vBoard(r){
  const cols=[['repair','In repair'],['ready','Ready to file'],['submitted','Submitted'],['approved','Approved'],['paid','Paid']];
  const C={repair:[],ready:[],submitted:[],approved:[],paid:[]};
  S.R.forEach(x=>x.ops.forEach((o,i)=>{ const k=o.st==='returned'?'ready':o.st==='denied'?'paid':o.st; C[k].push({r:x,o,i}); }));
  C.ready.sort((a,b)=>(a.o.st==='returned'?0:1)-(b.o.st==='returned'?0:1)||(b.o.done||0)-(a.o.done||0));
  const lateOf=(o)=>o.st==='ready'&&o.done>5||o.st==='returned'&&o.claim.at>2||o.st==='submitted'&&o.claim.at>14||o.st==='approved'&&o.claim.at>14;
  const sub=(o)=>o.st==='repair'?`${o.b.toFixed(1)} of ${o.q.toFixed(1)} h`:o.st==='ready'?`done ${when(o.done)}`:o.st==='returned'?`back ${when(o.claim.at)}`:o.st==='paid'?`paid ${when(o.claim.at)}`:o.st==='denied'?`denied ${when(o.claim.at)}`:`${o.st==='approved'?'approved':'filed'} ${ago(o.claim.at)} ago`;
  const card=({r:x,o,i})=>{ const L=lateOf(o); return `<div class="wx-cd${x.no===r.no?' sel':''}" data-a="sel" data-ro="${x.no}" data-op="${i}">${L?'<i class="tg-dot"></i>':''}<div class="r1"><b class="tg-no">${x.no}</b>${x.ops.length>1?`<span>op ${i+1}</span>`:''}${o.kind==='RECALL'?jt(o):''}<span class="sp"></span>${o.st==='returned'||o.st==='denied'?chip(o.st):''}</div><span class="cu">${esc(x.cust)}</span><span class="op">${esc(o.cmp)}</span><div class="r3"><span class="${L?'late':''}">${sub(o)}</span><span class="sp"></span><span class="wx-amt">${o.st==='repair'&&!o.cost?'':usd0(amtOf(o))}</span></div></div>`; };
  return `<div class="wx-bv">${topOf(r,false)}<div class="wx-bd">${cols.map(c=>{ const L=C[c[0]], m=L.reduce((a,y)=>a+(y.o.st==='denied'?0:amtOf(y.o)),0); return `<div class="wx-col ${c[0]}"><div class="wx-ch">${c[1]}<span class="n">${L.length}</span><span class="m">${m?usd0(m):''}</span></div><div class="wx-cs">${L.map(card).join('')||'<span class="empty">Nothing here</span>'}</div></div>`; }).join('')}</div></div>`;
}
function pop(){
  const p=U.pop; if(!p) return '';
  if(p.type==='cfg'){ const C=S.cfg, row=(k,l,u,h)=>`<div class="wx-cr"><span>${l}${h?`<small>${h}</small>`:''}</span><input data-cfg="${k}" value="${C[k]}"><em>${u}</em></div>`;
    return `<div class="tg-pop xf wx-cfgp"><div class="tg-ph"><b>Warranty settings</b><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
      <span class="tg-lbl top">Deadlines</span>${row('file','File a claim within','days','of the repair')}${row('resub','Resubmit a returned claim within','days')}${row('keep','Keep failed parts','days','unless Volvo asks for them')}
      <span class="tg-lbl top" style="margin-top:10px">Packet</span>${row('pa','Pre-approval needed over','$','the packet asks for the # above this')}<span class="tg-lbl top" style="margin-top:10px">Chase after</span>${row('ask','The tech hasn’t answered','hours')}${row('ts','A tech support case is open','hours')}${row('pre','A pre-approval is waiting','hours')}${row('claim','A claim has no answer','days')}${row('paid','An approved claim isn’t paid','days')}
      <div class="tg-acts"><span class="hint">Saved with the shop data · late turns orange in the list</span><button class="btn btn-sm btn-primary" data-a="popx">Done</button></div></div>`; }
  const r=get(p.ro); if(!r) return '';
  const hd=k=>`<div class="tg-ph"><b>${k}</b><span class="tg-no">RO-${r.no}</span><span class="cu">${esc(r.cust)}</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>`;
  const o=r.ops[p.op!=null?p.op:0];
  if(p.type==='snooze'){ const O=[['Tomorrow morning','Fri 08:00'],['In 2 days','Sat 08:00'],['Monday','Mon 08:00'],['Next week','Thu 10/29']];
    return `<div class="tg-pop menu">${hd('Snooze until')}${O.map((x,i)=>`<button class="tg-mi" data-a="snzpick" data-i="${i}">${kbd(i+1)}${x[0]}<span class="meta">${x[1]}</span></button>`).join('')}<div class="tg-pft">Comes back at the top of its group.</div></div>`; }
  if(p.type==='file'){ const C=checks(r,o), g=C.filter(x=>x[2]&&!x[1]), req=C.filter(x=>x[2]);
    return `<div class="tg-pop xf wx-filep">${hd('File the claim')}<div class="wx-ctx">Op ${p.op+1} · <b>${esc(o.cmp)}</b> · ${usd(amtOf(o))}${r.back?` · <b>comeback</b> of RO-${r.back.no}`:''}</div>
      <div class="wx-pk${g.length?'':' full'}"><div class="wx-pk-h"><b>Packet</b><span>${req.length-g.length} of ${req.length}</span><span class="m"><i style="width:${((req.length-g.length)/req.length*100).toFixed(0)}%"></i></span>${g.length?'':`<span class="okt">${ic('check',12)}Everything Volvo asks for</span>`}</div>
      ${g.map(x=>`<div class="wx-pk-r"><span class="i no">${ic('flag',11)}</span><span class="t">${esc(x[0])}<small>${esc(x[3])}</small></span>${fixBtn(r,p.op,x)}</div>`).join('')}</div>
      <div class="wx-two"><button class="btn btn-sm" data-a="copy" data-ro="${r.no}" data-op="${p.op}">${ic('copy',13)}Copy for the claim${kbd('C')}</button><button class="btn btn-sm" data-a="print" data-ro="${r.no}" data-op="${p.op}">${ic('print',13)}Print packet${kbd('P')}</button></div>
      <label class="wx-f"><span>Claim # from Volvo</span><input id="wx-cn" placeholder="e.g. W2628140" value="${esc(p.cn||'')}" autocomplete="off"></label>
      <div class="tg-acts"><span class="hint">${g.length?'Fix the '+g.length+' above, then file':'Copy it into Volvo’s claim system, then log the claim # here'}</span><button class="btn btn-sm btn-primary" data-a="filego"${g.length?' disabled':''}>${ic('send',13)}Mark submitted${kbd('↵')}</button></div></div>`; }
  if(p.type==='copy'){ const R=copyRows(r,o);
    return `<div class="tg-pop xf wx-copyp">${hd('Copy for the claim')}<div class="wx-ctx">Click a line to copy it, then paste it into the matching box in Volvo’s claim screen. Same order as the screen.</div>
      <div class="wx-cps">${R.map((x,k)=>`<button class="wx-cp${U.copied===k?' done':''}${x[1]?'':' none'}" data-a="cpy" data-k="${k}"${x[1]?'':' disabled'}><span class="n">${k+1}</span><span class="k">${esc(x[0])}</span><span class="v${x[2]?' long':''}">${x[1]?esc(x[1]):'—'}</span><span class="c">${U.copied===k?ic('check',13)+'Copied':ic('copy',13)}</span></button>`).join('')}</div>
      <div class="tg-acts"><span class="hint">↑ ↓ then ↵ copies · Esc closes</span><button class="btn btn-sm" data-a="cpall">${ic('copy',13)}${U.copied==='all'?'Copied all':'Copy all'}</button>${p.ret?`<button class="btn btn-sm btn-primary" data-a="back">Back to filing</button>`:''}</div></div>`; }
  if(p.type==='field'){ const F={code:['Fault code','SPN / FMI',o.claim.code],vin:['VIN','17 characters',r.vin],mi:['Mileage','e.g. 338,900',r.mi],eh:['Engine hours','e.g. 9,402',r.eh],ws:['Warranty start date','MM-DD-YYYY',r.ws],prev:['Earlier claim #','',r.back?r.back.claim:''],pa:['Pre-approval #','e.g. PA-55120',r.pa],ts:['Tech support case #','e.g. TS-31422',r.ts]}[p.k];
    return `<div class="tg-pop xf wx-smallp">${hd('Add '+F[0].toLowerCase())}${p.k==='prev'?`<div class="wx-ctx">From RO-${r.back.no} · ${esc(r.back.claim)} · paid ${usd(r.back.paid)}</div>`:p.k==='ws'?`<div class="wx-ctx">On the unit’s warranty card, or in ASIST under the asset · goes on the RO</div>`:''}
      <label class="wx-f"><span>${F[0]}</span><input id="wx-fv" placeholder="${esc(F[1])}" value="${esc(F[2]||'')}" autocomplete="off"></label>
      <div class="tg-acts"><span class="hint">${p.k==='vin'||p.k==='mi'||p.k==='eh'||p.k==='ws'?'Saved on the RO':'Saved on the claim'}</span><button class="btn btn-sm btn-primary" data-a="fvgo">Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='tag'){ const cp=o.parts[o.causal]||o.parts[0]; if(!p.shelf) p.shelf='W3';
    return `<div class="tg-pop xf wx-smallp">${hd('Tag the failed part')}<div class="wx-ctx"><b>${esc(cp[0])}</b> · ${esc(cp[1])} · causal part</div>
      <div class="wx-grid"><label class="wx-f"><span>Tag #</span><input id="wx-tg" value="${esc(p.tag||'FP-0415')}" autocomplete="off"></label><label class="wx-f"><span>Keep until</span><input value="${esc(byTxt(S.cfg.keep))}" disabled></label></div>
      <span class="tg-lbl top">Shelf</span><div class="tg-r">${['W1','W2','W3','W4','W5','W6'].map(s=>`<button class="tg-chip${p.shelf===s?' on':''}" data-a="shelf" data-s="${s}">${s}</button>`).join('')}</div>
      <div class="tg-acts"><span class="hint">Print the tag from the packet</span><button class="btn btn-sm btn-primary" data-a="taggo">${ic('parts',13)}Save tag${kbd('↵')}</button></div></div>`; }
  if(p.type==='causal'){ if(p.j==null) p.j=o.causal!=null?o.causal:0;
    return `<div class="tg-pop xf wx-smallp">${hd('Causal part')}<div class="wx-ctx">The part that failed — Volvo pays the claim against it</div>${o.parts.map((x,k)=>`<button class="wx-opt${p.j===k?' on':''}" data-a="cpick" data-j="${k}">${kbd(k+1)}<b>${esc(x[0])}</b><small>${esc(x[1])} · ×${x[2]} · ${usd(x[3])}</small></button>`).join('')}
      <div class="tg-acts"><button class="btn btn-sm btn-primary" data-a="cgo">Save${kbd('↵')}</button></div></div>`; }
  if(p.type==='paid'){ return `<div class="tg-pop xf">${hd('Mark paid')}<div class="wx-ctx">${esc(o.claim.no||'')} · approved ${ago(o.claim.at)} ago · claimed <b>${usd(amtOf(o))}</b></div>
      <label class="wx-f"><span>Paid / credit $</span><input id="wx-pd" value="${esc(p.pd!=null?p.pd:amtOf(o).toFixed(2))}" autocomplete="off"></label>
      <div class="tg-acts"><span class="hint">From the credit statement</span><button class="btn btn-sm btn-primary" data-a="paidgo">${ic('dollar',13)}Mark paid${kbd('↵')}</button></div></div>`; }
  if(p.type==='ask'){ const W=[['cause','The cause',!o.cause],['correction','The correction',!o.fix],['photo','A photo of the causal part',o.parts.length>0&&!r.photo],['labor','Clock the labor',!(o.b>0)]];
    if(!p.w) p.w=W.filter(x=>x[2]).map(x=>x[0]);
    return `<div class="tg-pop xf">${hd('Ask '+TF(r.tech))}<div class="wx-ctx"><b>${esc(TECH[r.tech])}</b> finished op ${p.op+1} ${when(o.done)} · ${esc(o.cmp)}</div>
      <span class="tg-lbl top">What’s missing</span>${W.map((x,k)=>`<button class="wx-ckb${p.w.includes(x[0])?' on':''}" data-a="askw" data-k="${x[0]}">${kbd(k+1)}<span class="b">${p.w.includes(x[0])?ic('check',11):''}</span>${x[1]}${x[2]?'':'<small>done</small>'}</button>`).join('')}
      <input class="tg-wide" placeholder="Note for ${esc(TF(r.tech))} (optional)" style="margin-top:8px">
      <div class="wx-prev">${ic('console',13)}On ${esc(TF(r.tech))}’s Console: <b>Warranty needs ${esc(p.w.map(w=>w==='photo'?'a photo of the causal part':w==='labor'?'the labor clocked':'the '+w).join(' and ')||'…')}</b> · RO-${r.no} op ${p.op+1}</div>
      <div class="tg-acts"><span class="hint">It waits here as “Waiting on ${esc(TF(r.tech))}”</span><button class="btn btn-sm btn-primary" data-a="askgo"${p.w.length?'':' disabled'}>${ic('chat',13)}Ask ${esc(TF(r.tech))}${kbd('↵')}</button></div></div>`; }
  if(p.type==='follow'){ const v=r.vol, sb=r.ops.find(x=>x.st==='submitted'), kind=v&&!sb?v.kind:'claim';
    const O=kind==='ts'?[['Answer in','Write what Volvo said — it goes to '+TF(r.tech),'Send it to '+TF(r.tech),1],['Called — still open','Back in this list tomorrow','Log it'],['Escalate to the field rep','Back in this list tomorrow','Log it']]
      :kind==='pre'?[['Approved — go ahead','Log the authorization # — '+TF(r.tech)+' gets the go-ahead','Tell '+TF(r.tech),2],['Denied — customer pays','To Approval · new estimate for the customer','Send to Approval'],['Called — still waiting','Back in 2 hours','Log it']]
      :[['Called — still reviewing','Back in 3 days','Log it'],['Emailed the claims desk','Back in 3 days','Log it'],['Resubmit it','Opens the claim','Open the claim']];
    const ch=O[p.o];
    return `<div class="tg-pop xf">${hd(kind==='ts'?'Tech support':kind==='pre'?'Pre-approval':'Follow up')}<div class="wx-ctx">${kind==='ts'?`Case <b>${esc(v.no)}</b> · open ${ago(v.at)} · goal ${S.cfg.ts} h<br>${esc(v.what)}`:kind==='pre'?`Asked ${Math.round(hrs(v.at))} h ago · goal ${S.cfg.pre} h<br>${esc(v.what)}`:`<b>${esc(sb.claim.no)}</b> · filed ${ago(sb.claim.at)} ago · ${usd(amtOf(sb))} · no answer`}</div>
      ${O.map((x,k)=>`<button class="wx-opt${p.o===k?' on':''}" data-a="fpick" data-i="${k}">${kbd(k+1)}<b>${x[0]}</b><small>${x[1]}</small></button>`).join('')}
      ${ch&&ch[3]===1?`<label class="wx-f" style="margin-top:8px"><span>What Volvo said</span><textarea placeholder="e.g. Replace the EGR valve and actuator as one, PN 23296721"></textarea></label>`:''}${ch&&ch[3]===2?`<label class="wx-f" style="margin-top:8px"><span>Authorization #</span><input placeholder="e.g. PA-55120"></label>`:''}
      <div class="tg-acts"><span class="hint">Logged on the RO</span><button class="btn btn-sm btn-primary" data-a="fgo"${ch?'':' disabled'}>${ch?esc(ch[2]):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='part'){ const x=itemOf(r.no), pp=o.parts[x&&x.pj!=null?x.pj:0], f=pp[5];
    const O=f.ret?[['Shipped','Log the tracking # · the RA closes','Mark shipped',1],['Can’t find it','To Parts · find FP tag '+f.tag,'Send to Parts']]:[['Scrap it','The 30 days are up · logged on the claim','Scrap it'],['Keep 14 more days','Volvo may still ask for it','Keep it'],['Give it back to the customer','Logged on the RO','Log it']];
    const ch=O[p.o];
    return `<div class="tg-pop xf">${hd('Failed part')}<div class="wx-ctx"><b>${esc(pp[0])}</b> · ${esc(pp[1])} · tag ${esc(f.tag)} · shelf ${esc(f.shelf)}<br>${f.ret?`Volvo asked for it back · RA <b>${esc(f.ret.ra)}</b> · ship by ${byTxt(f.ret.by)}`:`Held since the repair · ${S.cfg.keep} days are up ${byTxt(f.keep)}`}</div>
      ${O.map((y,k)=>`<button class="wx-opt${p.o===k?' on':''}" data-a="fpick" data-i="${k}">${kbd(k+1)}<b>${y[0]}</b><small>${y[1]}</small></button>`).join('')}
      ${ch&&ch[3]===1?`<label class="wx-f" style="margin-top:8px"><span>Tracking #</span><input placeholder="e.g. 1Z 999 AA1 01 2345 6784"></label>`:''}
      <div class="tg-acts"><span class="hint">Every failed part is on the Parts view later</span><button class="btn btn-sm btn-primary" data-a="pgo"${ch?'':' disabled'}>${ch?esc(ch[2]):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='xfer'){ const D=Object.keys(DESK);
    return `<div class="tg-pop xf">${hd('Send to')}<span class="tg-lbl top">To</span><div class="tg-desks">${D.map((k,i)=>`<button class="tg-dsk${p.to===k?' on':''}${k==='warranty'?' cur':''}" data-a="xto" data-k="${k}"${k==='warranty'?' disabled':''}><span class="tg-role">${DESK[k][0]}</span><b>${DESK[k][1]}</b><small>${k==='warranty'?'you':k==='tech'?TECH[r.tech]:DESK[k][2]}</small>${p.to?'':kbd(i+1)}</button>`).join('')}</div>
      ${p.to?`<span class="tg-lbl top">Why</span><div class="tg-r">${WHY[p.to].map((w,i)=>`<button class="tg-chip${p.why===w?' on':''}" data-a="xwhy" data-w="${esc(w)}">${kbd(i+1)}${esc(w)}</button>`).join('')}</div><input class="tg-wide" placeholder="Note (optional)">`:''}
      <div class="tg-acts"><span class="hint">Same transfer as Triage and Foreman</span><button class="btn btn-sm btn-primary" data-a="xgo"${p.to&&p.why?'':' disabled'}>${ic('swap',13)}Send${p.to?' to '+DESK[p.to][1]:''}${kbd('↵')}</button></div></div>`; }
  return '';
}
/* ---------- actions ---------- */
function afterAct(no,before){ const L=flat(); if(L.indexOf(U.sel)<0){ const i=before.indexOf(no); U.sel=L.length?L[Math.min(Math.max(i,0),L.length-1)]:U.sel; } }
function done(r,ic,what,msg,b){ clr(r,ic,what); afterAct(r.no,b); U.pop=null; toast(msg); render(); }
function act(no){ const x=itemOf(no); if(!x) return; U.sel=no;
  if(x.act==='accept'){ const r=x.ro, b=flat(); snap(); r.sent=null; afterAct(r.no,b); U.sel=r.no; toast(`RO-${r.no} accepted — it’s with you. File it when ready.`); render(); return; }
  if(x.act==='fix'){ U.view='claims'; U.op=x.op; U.pop=null; render(); return; }
  if(x.act==='file') return openPop('file',no,x.op);
  if(x.act==='paid') return openPop('paid',no,x.op);
  if(x.act==='follow') return openPop('follow',no,x.op);
  if(x.act==='ask') return openPop('ask',no,x.op);
  if(x.act==='part') return openPop('part',no,x.op);
  if(x.act==='nudge') return nudge(x.ro,x.op);
}
function nudge(r,i){ const o=r.ops[i]; snap(); o.ask.at=0; o.ask.n=(o.ask.n||0)+1; toast(`Nudged ${TF(o.ask.who)} — it’s back on top of ${TF(o.ask.who)}’s Console.`); render(); }
function openPop(type,no,op){ U.sel=no; U.pop={type,ro:no,op:op!=null?op:0}; U.srch=false; render(); const f=$('#wx-cn,#wx-pd'); if(f) f.focus(); }
const O_LOG={ts:['','Called Volvo — case still open','Escalated to the field rep'],pre:['','','Called — still waiting'],claim:['Called Volvo — still reviewing','Emailed the claims desk','']};
function setSt(r,i,to,extra){ const o=r.ops[i], from=o.st; o.st=to==='reopen'?(o.done!=null?'ready':'repair'):to; o.claim.at=0; o.hist.push([0,o.st,'You']); Object.assign(o.claim,extra||{}); return from; }
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, no=t.dataset.ro, p=U.pop;
  if(a==='sel'){ if(e.target.closest('button')&&e.target.closest('button')!==t) return; U.sel=no; U.op=t.dataset.op!=null?+t.dataset.op:null; U.kb=false; U.pop=null; U.srch=false; render(); }
  else if(a==='do'){ U.kb=false; if(t.dataset.op!=null){ openPop('file',no,+t.dataset.op); } else act(no); }
  else if(a==='pop'){ openPop(t.dataset.p,no,t.dataset.op!=null?+t.dataset.op:(itemOf(no)||{}).op); }
  else if(a==='popx'){ U.pop=null; render(); }
  else if(a==='view'){ U.view=t.dataset.v; U.pop=null; render(); }
  else if(a==='filt'){ const k=t.dataset.k||null; U.filt=!k||U.filt===k?null:k; const L=flat(); if(L.length&&L.indexOf(U.sel)<0) U.sel=L[0]; render(); }
  else if(a==='open'){ const k=t.dataset.k; U.open[k]=t.dataset.force&&!U.open[k]?true:!U.open[k]; render(); }
  else if(a==='wake'){ const r=get(no); snap(); r.snz=null; U.sel=no; render(); }
  else if(a==='snzpick'){ const r=get(p.ro), b=flat(), O=['Fri 08:00','Sat 08:00','Mon 08:00','Thu 10/29'], i=+t.dataset.i; snap(); r.snz=O[i]; afterAct(r.no,b); U.pop=null; toast(`RO-${r.no} snoozed until ${O[i]}.`); render(); }
  else if(a==='causal'){ const r=get(no); snap(); r.ops[+t.dataset.op].causal=+t.dataset.j; render(); }
  else if(a==='st'){ const r=get(no), i=+t.dataset.op, to=t.dataset.to, b=flat(); snap(); setSt(r,i,to, to==='returned'?{why:''}:to==='paid'?{paid:String(amtOf(r.ops[i]))}:null);
     if(to==='returned'){ U.op=i; render(); const f=$(`.wx-op[data-op="${i}"] [data-f="why"]`); if(f) f.focus(); toast(`Op ${i+1} returned — write what Volvo asked for.`); return; }
     done(r,to==='approved'?'check':to==='denied'?'x':to==='submitted'?'send':'undo',`${STL[r.ops[i].st]} · op ${i+1}`,`RO-${r.no} op ${i+1}: ${STL[r.ops[i].st].toLowerCase()}.`,b); }
  else if(a==='filego'){ const r=get(p.ro), b=flat(), cn=($('#wx-cn')||{}).value||''; snap(); const o=r.ops[p.op]; setSt(r,p.op,'submitted',{no:cn||o.claim.no||'W26281'+(40+p.op),hrs:o.claim.hrs||o.b.toFixed(1),amt:o.claim.amt||amtOf(o).toFixed(2)}); done(r,'send','Filed · '+r.ops[p.op].claim.no,`Claim ${r.ops[p.op].claim.no} filed for RO-${r.no} · ${usd(amtOf(o))}.`,b); }
  else if(a==='paidgo'){ const r=get(p.ro), b=flat(), v=($('#wx-pd')||{}).value||'0'; snap(); setSt(r,p.op,'paid',{paid:v}); done(r,'dollar','Paid · '+usd(+v),`RO-${r.no} paid · ${usd(+v)}.`,b); }
  else if(a==='fpick'){ p.o=+t.dataset.i; render(); }
  else if(a==='fgo'){ const r=get(p.ro), b=flat(), v=r.vol, sb=r.ops.find(x=>x.st==='submitted'), kind=v&&!sb?v.kind:'claim', o=p.o; if(o==null) return;
     if(kind==='claim'&&o===2){ U.pop=null; U.view='claims'; U.op=p.op; render(); return; }
     snap();
     if(kind==='ts'&&o===0){ r.vol=null; done(r,'phone','Tech support answered',`Volvo’s answer went to ${TF(r.tech)} on the Console · logged on RO-${r.no}.`,b); return; }
     if(kind==='pre'&&o===0){ r.vol=null; done(r,'check','Pre-approved',`Pre-approved — ${TF(r.tech)} has the go-ahead on the Console.`,b); return; }
     if(kind==='pre'&&o===1){ r.vol=null; r.snz='with Approval'; r.snzWhy='Pre-approval denied'; done(r,'swap','To Approval · pre-approval denied',`RO-${r.no} → Dana Kowalski · new estimate for the customer.`,b); return; }
     r.snz=kind==='pre'?'12:15':kind==='ts'?'Fri 08:00':'Sun 08:00'; r.snzWhy=O_LOG[kind][o]; if(v) v.at=0; afterAct(r.no,b); done(r,'phone',r.snzWhy,`Logged on RO-${r.no} · back ${r.snz}.`,b); }
  else if(a==='askw'){ const k=t.dataset.k; p.w=p.w.includes(k)?p.w.filter(x=>x!==k):p.w.concat(k); render(); }
  else if(a==='askgo'){ const r=get(p.ro), o=r.ops[p.op]; snap(); o.ask={who:r.tech,at:0,what:p.w.map(w=>w==='photo'?'causal part photo':w==='labor'?'labor':w)}; U.pop=null; toast(`Asked ${TF(r.tech)} for the ${o.ask.what.join(' and ')} — it’s on ${TF(r.tech)}’s Console.`); render(); }
  else if(a==='nudge'){ nudge(get(no),+t.dataset.op); }
  else if(a==='pgo'){ const r=get(p.ro), b=flat(), x=itemOf(r.no), pp=r.ops[p.op].parts[x&&x.pj!=null?x.pj:0], f=pp[5]; if(p.o==null) return; snap();
     if(f.ret&&p.o===1){ r.snz='with Parts'; r.snzWhy='Find tag '+f.tag; done(r,'swap','To Parts · find '+f.tag,`RO-${r.no} → Ben Okafor · find failed part ${f.tag}.`,b); return; }
     if(!f.ret&&p.o===1){ f.keep+=14; done(r,'parts','Keeping '+f.tag+' 14 more days',`${f.tag} kept until ${byTxt(f.keep)}.`,b); return; }
     f.done=f.ret?'shipped '+byTxt(0)+' · RA '+f.ret.ra:p.o===0?'scrapped today':'given back to the customer'; done(r,'parts',(f.ret?'Shipped ':p.o===0?'Scrapped ':'Returned ')+f.tag,`${pp[0]} (${f.tag}) ${f.ret?'shipped to Volvo':p.o===0?'scrapped':'given back to the customer'}.`,b); }
  else if(a==='fix'){ const [k,v]=t.dataset.fix.split(':'), op=+t.dataset.op, prev=U.pop&&U.pop.type==='file'?Object.assign({},U.pop):null;
     if(k==='upload'){ const r=get(no); snap(); r.ev=Object.assign({},EV(r)); if(v==='photos') r.ev.photos=(r.ev.photos||0)+1; else r.ev[v]=1; toast(({dash:'dash.jpg',photos:'failed-part.jpg',dtc:'techtool-dtc.pdf'})[v]+` attached to RO-${r.no}.`); render(); return; }
     if(k==='ask'){ U.sel=no; U.pop={type:'ask',ro:no,op,w:[v==='labor'?'labor':v==='photos'?'photo':v]}; render(); return; }
     U.sel=no; U.pop={type:k==='field'?'field':k,ro:no,op,k:v,ret:prev}; render(); const f=$('#wx-fv,#wx-tg'); if(f){ f.focus(); f.select&&f.select(); } }
  else if(a==='fvgo'){ const r=get(p.ro), o=r.ops[p.op], v=($('#wx-fv')||{}).value||''; if(!v.trim()) return; snap();
     if(p.k==='code') o.claim.code=v; else if(p.k==='prev') o.claim.prev=v; else r[p.k]=v;
     U.pop=p.ret; toast('Saved.'); render(); }
  else if(a==='shelf'){ p.shelf=t.dataset.s; render(); }
  else if(a==='taggo'){ const r=get(p.ro), o=r.ops[p.op], j=o.causal!=null?o.causal:0, v=($('#wx-tg')||{}).value||'FP-0415'; snap(); o.parts[j][5]={tag:v,shelf:p.shelf,keep:S.cfg.keep}; U.pop=p.ret; toast(`${o.parts[j][0]} tagged ${v} · shelf ${p.shelf}.`); render(); }
  else if(a==='cpick'){ p.j=+t.dataset.j; render(); }
  else if(a==='cgo'){ const r=get(p.ro); snap(); r.ops[p.op].causal=p.j; U.pop=p.ret; render(); }
  else if(a==='copy'){ const prev=U.pop&&U.pop.type==='file'?Object.assign({},U.pop):null; U.copied=null; U.sel=no; U.pop={type:'copy',ro:no,op:+t.dataset.op,ret:prev,k:0}; render(); }
  else if(a==='cpy'){ const r=get(p.ro), R=copyRows(r,r.ops[p.op]), k=+t.dataset.k; clip(R[k][1]); U.copied=k; p.k=k; render(); }
  else if(a==='cpall'){ const r=get(p.ro), R=copyRows(r,r.ops[p.op]); clip(R.filter(x=>x[1]).map(x=>x[0]+': '+x[1]).join('\n')); U.copied='all'; render(); }
  else if(a==='cpy1'){ clip(t.dataset.v); toast(t.dataset.v+' copied.',false); render(); }
  else if(a==='back'){ U.pop=p.ret; render(); }
  else if(a==='print'){ U.print={ro:no,op:+t.dataset.op}; U.pop=null; render(); }
  else if(a==='pvx'){ U.print=null; render(); }
  else if(a==='pvprint'){ window.print(); }
  else if(a==='cfg'){ U.pop={type:'cfg',ro:U.sel}; render(); }
  else if(a==='xto'){ p.to=t.dataset.k; p.why=null; render(); } else if(a==='xwhy'){ p.why=t.dataset.w; render(); }
  else if(a==='xgo'){ const r=get(p.ro), b=flat(); snap(); const who=p.to==='tech'?TECH[r.tech]:DESK[p.to][2]; r.snz='with '+DESK[p.to][1]; r.snzWhy=p.why; afterAct(r.no,b); done(r,'swap',`To ${DESK[p.to][1]} · ${p.why}`,`RO-${r.no} → ${who} · ${p.why}. It comes back here when they’re done.`,b); }
  else if(a==='undo'){ if(UNDO.length){ S=JSON.parse(UNDO.pop()); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }
  else if(a==='srch'){ U.srch=true; U.q=''; render(); }
});
mock.addEventListener('input',e=>{ if(e.target.dataset.cfg){ const v=+e.target.value; if(v>0){ S.cfg[e.target.dataset.cfg]=v; const pp=$('.tg-list'); if(pp){ pp.outerHTML=list(); } } return; } if(e.target.id==='wx-q'){ U.q=e.target.value; const pp=$('.tg-srpop'); if(pp) pp.innerHTML=search(); } if(e.target.id==='wx-cn'&&U.pop) U.pop.cn=e.target.value; if(e.target.id==='wx-pd'&&U.pop) U.pop.pd=e.target.value;
  const f=e.target.dataset.f; if(f){ const r=get(e.target.dataset.ro); r.ops[+e.target.dataset.op].claim[f]=e.target.value; } });
document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;
  if(U.pop&&!e.target.closest('.tg-pop,[data-a="pop"],[data-a="do"],[data-a="cfg"],[data-a="fix"],[data-a="copy"]')){U.pop=null;ch=true;}
  if(U.srch&&!e.target.closest('.tg-srch,.tg-srpop,[data-a="srch"]')){U.srch=false;ch=true;}
  if(ch) render(); },true);
function move(d){ const L=flat(); if(!L.length) return; U.kb=true; U.op=null; const i=L.indexOf(U.sel); U.sel=i<0?L[0]:L[Math.max(0,Math.min(L.length-1,i+d))]; render(); }
addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea'); if(e.ctrlKey||e.metaKey||e.altKey) return;
  const stop=()=>{e.preventDefault();e.stopPropagation();};
  if(U.print){ if(k==='Escape'){U.print=null;render();return stop();} return; }
  if(U.pop&&U.pop.type==='copy'&&!inF){ const R=copyRows(get(U.pop.ro),get(U.pop.ro).ops[U.pop.op]);
    if(k==='ArrowDown'||k==='j'){ U.pop.k=Math.min(R.length-1,(U.pop.k||0)+1); render(); $$('.wx-cp')[U.pop.k]?.classList.add('kb'); return stop(); }
    if(k==='ArrowUp'||k==='k'){ U.pop.k=Math.max(0,(U.pop.k||0)-1); render(); $$('.wx-cp')[U.pop.k]?.classList.add('kb'); return stop(); }
    if(k==='Enter'){ $$('.wx-cp')[U.pop.k||0]?.click(); return stop(); }
    if(k==='Escape'){ U.pop=U.pop.ret||null; render(); return stop(); } }
  if(U.srch){ if(k==='Escape'){U.srch=false;render();return stop();} if(k==='Enter'){const f=$('.tg-srpop .tg-sr');if(f){U.sel=f.dataset.ro;U.srch=false;render();}return stop();} return; }
  const p=U.pop;
  if(p){ if(k==='Escape'){U.pop=null;render();return stop();}
    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }
    if(inF) return;
    const n=+k;
    if(p.type==='snooze'&&n>=1&&n<=4){ $(`.tg-pop [data-a="snzpick"][data-i="${n-1}"]`)?.click(); return stop(); }
    if((p.type==='follow'||p.type==='part')&&n>=1&&n<=3){ $(`.tg-pop [data-a="fpick"][data-i="${n-1}"]`)?.click(); return stop(); }
    if(p.type==='file'&&(k==='c'||k==='p')){ $(`.tg-pop [data-a="${k==='c'?'copy':'print'}"]`)?.click(); return stop(); }
    if(p.type==='causal'&&n>=1){ $$('.tg-pop [data-a="cpick"]')[n-1]?.click(); return stop(); }
    if(p.type==='ask'&&n>=1&&n<=4){ $$('.tg-pop [data-a="askw"]')[n-1]?.click(); return stop(); }
    if(p.type==='xfer'&&n>=1){ if(!p.to){ $$('.tg-pop .tg-dsk:not([disabled])').find(b=>Object.keys(DESK).indexOf(b.dataset.k)===n-1)?.click(); } else $$('.tg-pop [data-a="xwhy"]')[n-1]?.click(); return stop(); }
    return; }
  if(inF){ if(k==='Escape'){ e.target.blur(); return stop(); } return; }
  if(k==='j'||k==='ArrowDown'){move(1);return stop();} if(k==='k'||k==='ArrowUp'){move(-1);return stop();}
  if(k==='Enter'){U.kb=true;act(U.sel);return stop();}
  if(k==='s'){U.kb=true;if(itemOf(U.sel))openPop('snooze',U.sel);return stop();}
  if(k==='t'){U.kb=true;openPop('xfer',U.sel);return stop();}
  if(k==='c'||k==='p'){ const r=get(U.sel), x=itemOf(U.sel), op=x&&x.op!=null?x.op:Math.max(0,r.ops.findIndex(o=>o.st!=='repair')); if(k==='c'){ U.copied=null; U.pop={type:'copy',ro:r.no,op,k:0}; } else { U.print={ro:r.no,op}; U.pop=null; } render(); return stop(); }
  if(k==='1'||k==='2'){U.view=['claims','board'][+k-1];render();return stop();}
  if(k==='/'){U.srch=true;U.q='';render();return stop();}
  if(k==='Escape'){ if(U.filt){U.filt=null;render();return stop();} }
});
function after(){ const p=$('.tg-pop'), body=$('.tg-body');
  const sc0=$('.tg-scroll'), on0=sc0&&sc0.querySelector('.tg-it.on'); if(on0&&U.pop&&(on0.offsetTop<sc0.scrollTop||on0.offsetTop+on0.offsetHeight>sc0.scrollTop+sc0.clientHeight)) sc0.scrollTop=on0.offsetTop-sc0.clientHeight/2;
  if(p&&U.pop&&U.pop.type!=='cfg'){ const it=$(`.tg-it[data-ro="${U.pop.ro}"]`); let top=12; if(it) top=it.getBoundingClientRect().top/scale-body.getBoundingClientRect().top/scale-6; top=Math.round(Math.max(12,Math.min(top,body.offsetHeight-p.offsetHeight-12))); p.style.top=top+'px'; }
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.srch){ const q=$('#wx-q'); if(q&&document.activeElement!==q){q.focus();q.setSelectionRange(q.value.length,q.value.length);} }
  if(U.op!=null&&U.view==='claims'){ const c=$(`.wx-op[data-op="${U.op}"]`), cl=$('.wx-cl'); if(c&&cl&&U.op>0&&!U._sc){ U._sc=1; cl.scrollTop=c.offsetTop-cl.querySelector('.tg-top').offsetHeight-12; setTimeout(()=>{U._sc=0;},0); } } }
/* ---------- the toolbar ---------- */
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));}));
const DEMO={
  file:()=>{reset();U.sel='37701';render();openPop('file','37701',0);},
  clean:()=>{reset();U.sel='37502';render();openPop('file','37502',0);},
  copy:()=>{reset();U.sel='37502';render();U.copied=4;U.pop={type:'copy',ro:'37502',op:0,k:4};render();},
  print:()=>{reset();U.sel='37502';U.print={ro:'37502',op:0};render();},
  back:()=>{reset();U.sel='37612';render();},
  card:()=>{reset();U.sel='37455';render();}
};render();}
};
$$('[data-demo]').forEach(b=>b.addEventListener('click',()=>{DEMO[b.dataset.demo]();$$('[data-demo]').forEach(x=>x.classList.toggle('is-on',x===b));}));
$('[data-reset]').addEventListener('click',()=>{reset();$$('[data-demo]').forEach(x=>x.classList.remove('is-on'));render();});
window.__wx={S:()=>S,U:()=>U,render,reset,openPop,DEMO,act};
reset(); render();
