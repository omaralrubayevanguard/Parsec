const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const P=__ICO__, LOGO=__LOGO__;
const root=document.documentElement, mock=$('.mock'), wrap=$('.wt-wrap');
let scale=1; function fit(){scale=Math.min(1,wrap.clientWidth/1440);mock.style.transform=`scale(${scale})`;wrap.style.height=(900*scale)+'px';}
addEventListener('resize',fit);fit();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=(n,s=16)=>P[n]?`<svg class="tg-ic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${P[n]}</svg>`:'';
const kbd=k=>`<span class="tg-kbd">${k}</span>`;
const PPL={RH:'Ray Holloway',FD:'Frank Delaney',AM:'Alicia Moore',JT:'Jordan Tate',BO:'Ben Okafor',GP:'Grace Park',MR:'Mike Rodriguez',DK:'Dana Kowalski',LM:'Luis Martinez',PS:'Priya Shah',AW:'Andre Wilson',KT:'Kevin Tran',SYS:'Parsec',CU:'Customer',VO:'Volvo'};
const ROLE={MR:'Technician',FD:'Foreman',AM:'Service writer',BO:'Parts',GP:'Warranty',RH:'Manager'};
const F=k=>PPL[k].split(' ')[0];
const SRC={parts:['Parts','parts'],triage:['Triage','triage'],foreman:['Foreman','foreman'],warranty:['Warranty','warranty'],fixes:['Fixes','fixes'],manager:['Manager','manager'],timelog:['Time Log','timelog'],console:['Console','console'],career:['Career','career'],ros:['Repair Orders','ros']};
const KIND={ask:'Needs you',men:'@ you',rem:'Reminder',fyi:'For you to know'};
/* the trucks the notifications point at */
const RO={
 '37388':['Elkin Hardwoods','2021 VNR 640 · D13','All parts in','FD',2,'L9'],
 '37802':['Catawba Timber','2019 VNL 860 · D13','Checked in','FD',0,'L22'],
 '37795':['Haw River Dairy','2019 VNL 760 · D13','Checked in · comeback','FD',0,'L15'],
 '37571':['Triad Cold Chain','2020 VNL 760 · D13 TC','In progress','KT',1,'Bay 3'],
 '37546':['Copperline Transport','2019 VNL 760 · D13','QC — road test','FD',3,'Bay 6'],
 '37589':['Yadkin Valley Freight','2021 VNL 860 · D13','In progress','KT',2,'Bay 2'],
 '37544':['Copperline Transport','2018 VNL 760 · D13','Waiting on parts','AW',7,'L4'],
 '37760':['Piedmont Aggregates','2018 VNL 670 · D13','Assigned','MR',0,'L14'],
 '37628':['Dixie Fleet Services','2021 VNR 640 · D13','Approved · parts on order','MR',2,'L7'],
 '37466':['Uwharrie Fuel','2020 VHD · D11','Warranty claim','GP',4,'Bay 1'],
 '37577':['Silverline LTL','2019 VNL 760 · D13','Waiting approval','AM',1,'L11'],
 '37519':['Dixie Fleet Services','2018 VNL 670 · D13','Ready to release','AM',3,'L2'],
 '37595':['Rowan Ready Mix','2019 VNR 640 · D13','Waiting on parts','BO',5,'L18'],
 '37321':['Sandhills Grain','2020 VNL 760 · D13','Closed · claim filed','GP',41,'—'],
 '37315':['Red Mesa Hauling','2020 VNL 760 · D11','Closed','MR',0,'—'],
 '37455':['Iron Horse Logistics','2017 VNL 670 · D13','Waiting on sublet','FD',4,'L6'],
 '37750':['Yadkin Valley Freight','2020 VNL 760 · D13','In progress','LM',1,'Bay 5'],
 '37466b':['Uwharrie Fuel','2020 VHD · D11','In progress','MR',4,'Bay 1']
};
/* who has time, for the foreman’s “send to a tech” */
const FREE={FD:[['DK','2.5 h free'],['LM','4.0 h free'],['AW','5.5 h free'],['PS','3.0 h free · off Monday'],['KT','1.0 h free · on 37571'],['MR','on 37760']]};
/* d: days ago · tm: time · k: ask (needs you), men (@ you), rem (reminder), fyi */
const IB0=[
 // ---------- Frank Delaney · Foreman ----------
 {id:'f1',to:'FD',src:'parts',from:'BO',k:'ask',d:0,tm:'2:08 pm',ro:'37388',t:'Parts are all in for 37388',b:'All parts received — the hand-off rule asks first. Send it to a tech?',parts:[['DEF doser','23295841','bin A3'],['Doser gasket','21512367','bin A3']],pick:'tech',hint:'DK',hintT:'did the diag',acts:[['Send to a tech','pick','sent'],['Not now','snooze']],feed:[['BO','2:08 pm','Checked in both parts — staged in bin A3'],['AM','Oct 20','Elkin Hardwoods approved — $1,027.38'],['DK','Oct 20','Diag done — doser tip crystallized']]},
 {id:'f2',to:'FD',src:'triage',from:'AM',k:'ask',d:0,tm:'12:09 pm',ro:'37802',t:'Check-in done on 37802 — needs a tech',b:'Check engine light on, derate warning. The code matches the outlet NOx sensor fixes — fixed 9 times, held 8.',pick:'tech',acts:[['Assign a tech','pick','assigned'],['Open in Foreman','open']],feed:[['AM','12:05 pm','Checked in — key tag 41, spot L22'],['AM','12:04 pm','SPN 3226 FMI 2 from the driver’s photo']]},
 {id:'f3',to:'FD',src:'fixes',from:'RH',k:'ask',d:0,tm:'11:24 am',ro:'37795',t:'Comeback — 37795 is back',b:'Haw River Dairy is back 29 days after RO 37482 with the same complaint. Dana replaced the outlet NOx sensor then.',pick:'tech',hint:'DK',hintT:'did the first fix',acts:[['Assign a tech','pick','assigned'],['See the first fix','open']],feed:[['RH','11:24 am','Flagged as a comeback — linked to 37482'],['AM','11:20 am','Checked in — same complaint as Sep 23']]},
 {id:'f4',to:'FD',src:'console',from:'KT',k:'men',d:0,tm:'2:01 pm',ro:'37571',t:'Kevin asked you for help',q:'Actuator test still fails with the new actuator — can you look before I order another one?',acts:[['On my way','do','Kevin sees “Frank is on his way.”'],['Reply','reply']],feed:[['KT','2:01 pm','Asked Frank for help'],['KT','1:12 pm','Actuator test failed — SPN 641 FMI 7']]},
 {id:'f5',to:'FD',src:'foreman',from:'LM',k:'fyi',d:0,tm:'1:40 pm',ro:'37546',t:'37546 is ready for QC',b:'Luis finished the A/C compressor and recharge — road test next.',acts:[['Start QC','do','QC started on 37546 — the road test is yours.'],['Open RO','open']]},
 {id:'f6',to:'FD',src:'timelog',from:'SYS',k:'rem',d:0,tm:'7:00 am',ro:'37589',t:'Kevin’s clock has run since yesterday',b:'A punch on 37589 has run since 6:02 pm yesterday — 20 hours.',acts:[['Stop it at 6:02 pm','do','Stopped at 6:02 pm yesterday — 20 h taken off.'],['Message Kevin','reply']]},
 {id:'f7',to:'FD',src:'parts',from:'BO',k:'fyi',d:0,tm:'10:52 am',ro:'37544',t:'ETA moved — EGR valve for 37544',b:'Now Tuesday, Oct 27 (was Friday). Alicia has been told.',acts:[['Okay','do','Okay.'],['Open RO','open']],st:'read'},
 {id:'f8',to:'FD',src:'manager',from:'RH',k:'fyi',d:1,tm:'4:40 pm',t:'Ray set Andre’s goals',b:'Efficiency 92%, productivity 85%, 6.5 h sold a workday — stepping up to the shop’s by January.',acts:[['Okay','do','Okay.']],st:'read'},
 {id:'f9',to:'FD',src:'ros',from:'JT',k:'fyi',d:1,tm:'3:15 pm',ro:'37455',t:'Sublet back on 37455 — alignment done',b:'Iron Horse Logistics · the alignment shop dropped it off.',acts:[['Okay','do','Okay.']],st:'done'},
 {id:'f10',to:'FD',src:'foreman',from:'SYS',k:'rem',d:1,tm:'7:00 am',t:'Bay 4 lift inspection due Friday',b:'The yearly lift inspection — book it before Friday.',acts:[['Booked it','do','Marked booked.']],st:'snz',snz:'Monday, 7:00 am'},
 // ---------- Mike Rodriguez · Technician ----------
 {id:'m1',to:'MR',src:'foreman',from:'FD',k:'ask',d:0,tm:'1:52 pm',ro:'37760',t:'Frank assigned you 37760',b:'Outlet NOx sensor — check engine light. The usual fix: replace the sensor, run a parked regen — held 8 of 9 times.',acts:[['Accept','do','37760 is yours — it’s on your Console.'],['Can’t take it','reply']],feed:[['FD','1:52 pm','Assigned to Mike'],['AM','1:40 pm','Checked in — spot L14']]},
 {id:'m2',to:'MR',src:'parts',from:'BO',k:'fyi',d:0,tm:'2:03 pm',ro:'37760',t:'Parts staged for 37760 — bin A3',b:'Ben pulled the part for you.',parts:[['Outlet NOx sensor','22827993','bin A3']],acts:[['Picked up','do','Marked picked up — Ben sees it.'],['Open RO','open']]},
 {id:'m3',to:'MR',src:'triage',from:'AM',k:'fyi',d:0,tm:'11:05 am',ro:'37628',t:'Approved — 37628, go ahead',b:'Dixie Fleet said yes to the turbo actuator, $1,648. The part is ordered — here tomorrow.',acts:[['Okay','do','Okay.']]},
 {id:'m4',to:'MR',src:'foreman',from:'FD',k:'men',d:0,tm:'10:31 am',ro:'37544',t:'Frank: help Andre after lunch?',q:'Mike, can you give Andre a hand with the EGR cooler on 37544 after lunch?',acts:[['Sure','do','Frank sees “Sure.”'],['Reply','reply']],st:'read'},
 {id:'m5',to:'MR',src:'timelog',from:'SYS',k:'rem',d:0,tm:'9:40 am',ro:'37466b',t:'Your clock on 37466 has run 9 h',b:'Still on it, or did the clock get left running?',acts:[['Stop it now','do','Stopped — 9.0 h on 37466.'],['Still on it','do','Okay — it asks again in 2 hours.']]},
 {id:'m6',to:'MR',src:'fixes',from:'AM',k:'fyi',d:1,tm:'3:30 pm',ro:'37315',t:'Your fix on 37315 was kept as written',b:'Alicia reviewed it — it’s in Fixes for the next one.',acts:[['Okay','do','Okay.']],st:'read'},
 {id:'m7',to:'MR',src:'career',from:'RH',k:'fyi',d:1,tm:'8:15 am',t:'Ray set your October goals',b:'Efficiency 100%, productivity 85%, 7.5 h sold a workday, comebacks under 3%.',acts:[['See Career','open']],st:'read'},
 {id:'m8',to:'MR',src:'timelog',from:'FD',k:'fyi',d:2,tm:'4:50 pm',t:'Frank approved your time edit',b:'Oct 20 — lunch moved to 12:30.',acts:[['Okay','do','Okay.']],st:'done'},
 // ---------- Alicia Moore · Service writer ----------
 {id:'a1',to:'AM',src:'console',from:'AW',k:'ask',d:0,tm:'1:58 pm',ro:'37544',t:'Diag done on 37544 — write the estimate',b:'EGR cooler leaking coolant into the valve. A cause on every operation.',acts:[['Write the estimate','open'],['Not now','snooze']],feed:[['AW','1:58 pm','Diag done — handed to Approval'],['AW','11:02 am','Pressure test — cooler leaks at 22 psi']]},
 {id:'a2',to:'AM',src:'triage',from:'CU',k:'ask',d:0,tm:'1:31 pm',ro:'37577',t:'Silverline LTL replied “Approved, go ahead”',b:'A reply to the estimate text on 37577 — $2,140.60.',acts:[['Mark approved','do','37577 approved — Parts is asked about the parts.'],['Call back','open']]},
 {id:'a3',to:'AM',src:'parts',from:'BO',k:'fyi',d:0,tm:'10:52 am',ro:'37544',t:'ETA moved on 37544 — tell the customer?',b:'EGR valve now Tuesday, Oct 27 (was Friday).',acts:[['Text the customer','do','Sent to Copperline: “The EGR valve arrives Tuesday — we’ll call when the truck is ready.”'],['Open RO','open']]},
 {id:'a4',to:'AM',src:'foreman',from:'FD',k:'fyi',d:0,tm:'9:12 am',ro:'37519',t:'37519 is ready to release',b:'Dixie Fleet Services · QC passed, road tested.',acts:[['Call to pick up','do','Logged a call to Dixie Fleet — “ready for pickup”.'],['Open RO','open']],st:'read'},
 {id:'a5',to:'AM',src:'manager',from:'RH',k:'fyi',d:0,tm:'8:47 am',ro:'37519',t:'Ray approved $380 goodwill on 37519',acts:[['Okay','do','Okay.']],st:'read'},
 {id:'a6',to:'AM',src:'triage',from:'SYS',k:'rem',d:0,tm:'7:30 am',ro:'37595',t:'No update to Rowan Ready Mix in 2 days',b:'37595 was promised Friday — still waiting on parts.',acts:[['Text an update','do','Sent: “Still waiting on one part — we’ll update you Friday morning.”'],['Snooze','snooze']]},
 {id:'a7',to:'AM',src:'warranty',from:'GP',k:'men',d:1,tm:'2:20 pm',ro:'37546',t:'Grace: signature needed on 37546',q:'Can you get the customer to sign the warranty form on 37546 when they pick up?',acts:[['Done','do','Grace sees “Done.”'],['Reply','reply']],st:'read'},
 // ---------- Ben Okafor · Parts ----------
 {id:'b1',to:'BO',src:'triage',from:'AM',k:'ask',d:0,tm:'11:02 am',ro:'37628',t:'Approval done on 37628 — order the parts',b:'Dixie Fleet said yes. The hand-off rule asks first.',parts:[['Turbo actuator','22972342','none on hand']],acts:[['Order it','do','Ordered from Volvo — here tomorrow.'],['Open in Parts','open']]},
 {id:'b2',to:'BO',src:'fixes',from:'JT',k:'ask',d:0,tm:'12:20 pm',ro:'37802',t:'Use fix on 37802 sent a part',b:'Jordan used the outlet NOx sensor fix — the part comes to you first.',parts:[['Outlet NOx sensor','22827993','3 on hand · C1']],acts:[['Pull it','do','Pulled — staged in bin A5 for 37802.'],['Not now','snooze']]},
 {id:'b3',to:'BO',src:'console',from:'DK',k:'men',d:0,tm:'1:47 pm',ro:'37388',t:'Dana needs a part not on 37388',q:'The doser line is kinked too — can you add a DEF line, doser (22011837)?',acts:[['Add it to the RO','do','Added to 37388 — 1 on hand, staged in A3.'],['Reply','reply']]},
 {id:'b4',to:'BO',src:'parts',from:'SYS',k:'rem',d:0,tm:'7:00 am',ro:'37388',t:'Core due back in 2 days — 37388',b:'DEF doser core — Volvo credits $120 if it’s back by Oct 24.',acts:[['Ship it','do','Marked shipped — tracking goes on the return.'],['Snooze','snooze']]},
 {id:'b5',to:'BO',src:'warranty',from:'GP',k:'fyi',d:0,tm:'9:35 am',t:'Credit received — return R-3003',b:'$412.00 back from Volvo.',acts:[['Okay','do','Okay.']],st:'read'},
 {id:'b6',to:'BO',src:'console',from:'LM',k:'fyi',d:1,tm:'1:10 pm',ro:'37750',t:'Luis picked up the parts for 37750',acts:[['Okay','do','Okay.']],st:'done'},
 // ---------- Grace Park · Warranty ----------
 {id:'g1',to:'GP',src:'ros',from:'LM',k:'ask',d:0,tm:'1:44 pm',ro:'37546',t:'Close-out done on 37546 — file the claim',b:'Warranty work closed — A/C compressor, 2.4 h. The story is written from the usual fix.',acts:[['Start the claim','open'],['Not now','snooze']]},
 {id:'g2',to:'GP',src:'warranty',from:'VO',k:'fyi',d:0,tm:'11:40 am',t:'Volvo paid claim FP-1001 — $2,318.40',acts:[['Okay','do','Okay.']]},
 {id:'g3',to:'GP',src:'manager',from:'RH',k:'fyi',d:0,tm:'10:18 am',ro:'37466',t:'Ray signed off the write-off on 37466',b:'$412.60 written off — the claim can close.',acts:[['Close the claim','do','Claim closed — written off $412.60.'],['Open in Warranty','open']]},
 {id:'g4',to:'GP',src:'warranty',from:'SYS',k:'rem',d:0,tm:'7:00 am',ro:'37321',t:'Claim on 37321 has waited 41 days',b:'Filed Sep 11 — no answer from Volvo yet.',acts:[['Log a call','do','Logged a call — follow up Monday.'],['Snooze','snooze']]},
 {id:'g5',to:'GP',src:'triage',from:'AM',k:'men',d:1,tm:'4:05 pm',ro:'37546',t:'Alicia: the signature is in',q:'Signed form for 37546 is in the folder.',acts:[['Thanks','do','Alicia sees “Thanks.”'],['Reply','reply']],st:'read'},
 // ---------- Ray Holloway · Manager ----------
 {id:'r1',to:'RH',src:'warranty',from:'GP',k:'ask',d:0,tm:'10:02 am',ro:'37466',t:'Write-off sign-off on 37466',b:'Claim rejected — $412.60 is over your $250 limit.',acts:[['Sign off','do','Signed off — Grace sees it on Warranty.'],['Ask Grace','reply']]},
 {id:'r2',to:'RH',src:'triage',from:'AM',k:'ask',d:0,tm:'8:40 am',ro:'37519',t:'Goodwill ask on 37519 — $380',b:'A comeback, 6 days after the first fix. Dixie Fleet is a top-five customer.',acts:[['Approve','do','Approved — Alicia sees it.'],['Decline','reply']]},
 {id:'r3',to:'RH',src:'manager',from:'SYS',k:'rem',d:0,tm:'7:00 am',t:'Productivity under 85% four workdays in a row',b:'74% today — unapplied hours are up on Andre and Kevin.',acts:[['See it','open'],['Mute a week','do','Muted for a week.']]},
 {id:'r4',to:'RH',src:'fixes',from:'SYS',k:'ask',d:0,tm:'7:00 am',t:'4 fixes waiting for a review',b:'You’re one of the reviewers — the oldest is 3 days.',acts:[['Open Fixes','open']]},
 {id:'r5',to:'RH',src:'fixes',from:'FD',k:'fyi',d:0,tm:'11:30 am',ro:'37795',t:'Frank has the comeback on 37795',acts:[['Okay','do','Okay.']],st:'read'},
 {id:'r6',to:'RH',src:'manager',from:'SYS',k:'fyi',d:1,tm:'6:00 pm',t:'September’s report is ready',b:'The pinned 12, what moved, money left on the table — one page.',acts:[['Open it','open']],st:'read'}
];
const tmin=s=>{ const m=s.match(/(\d+):(\d+) (am|pm)/); return ((+m[1]%12)+(m[3]==='pm'?12:0))*60+(+m[2]); };
const NOW=14*60+15;
const when=n=>n.d===0?(NOW-tmin(n.tm)<60?(NOW-tmin(n.tm))+' min ago':n.tm):n.d===1?'Yesterday':['','','Tuesday','Monday'][n.d]||'Earlier';
const whenL=n=>n.d===0?'Today, '+n.tm:n.d===1?'Yesterday, '+n.tm:(['','','Tuesday','Monday'][n.d]||'Earlier')+', '+n.tm;
const order=(a,b)=>a.d-b.d||tmin(b.tm)-tmin(a.tm);
