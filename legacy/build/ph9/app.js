/* Parsec on the phone — technicians only: their work, a job (view, change, attach, status), the clock, Inbox and Fixes.
   Every phone on the board is the same little app, started on a different screen. Nothing is saved. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const IC=__ICO__, LOGO=__LOGO__;
const ic=(n,s)=>IC[n]?`<svg class="ph-ic" viewBox="0 0 24 24"${s?` style="width:${s}px;height:${s}px"`:''} aria-hidden="true">${IC[n]}</svg>`:'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const p2=n=>String(n).padStart(2,'0');
const hmm=m=>Math.floor(m/60)+':'+p2(Math.floor(m%60));
const hms=s=>Math.floor(s/3600)+':'+p2(Math.floor(s/60)%60)+':'+p2(Math.floor(s%60));
const h2=n=>(Math.round(n*100)/100).toFixed(2);
const T0=Date.now(), el=()=>(Date.now()-T0)/1000;
/* status icons: the shape names the family, the colour who it waits on */
function si(k){ const ring='<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  const dash='<circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>';
  const B={hold:ring,working:ring+'<path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>',parts:dash,foreman:dash,support:dash,customer:dash,problem:dash,
    done:'<circle cx="7" cy="7" r="6" fill="currentColor"/><path d="M4.4 7.2l1.8 1.8 3.5-3.7" fill="none" stroke="var(--panel)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'};
  return `<svg class="ph-si" data-s="${k}" viewBox="0 0 14 14" aria-hidden="true">${B[k]||ring}</svg>`; }
const ST={hold:'Hold Tech',working:'Working',parts:'Waiting – Parts',foreman:'Waiting – Foreman',support:'Waiting – Tech Support',customer:'Waiting – Approval',done:'Complete'};
const PS={notordered:['Not ordered','hold'],ordered:['Ordered','parts'],backordered:['Backordered','problem'],received:['Received','working'],staged:['Staged','working'],picked:['Picked up','working'],installed:['Installed','done']};
const REASONS=['Diagnosing','Repairing','Inspecting','Testing'];

/* ---------- Friday, October 23 — Mike's day ---------- */
const D0={
  clock:{on:true,lunch:false,in:'07:02'}, run:'j1', clocked:402,
  jobs:{
    j1:{ro:'37742',op:1,ops:2,cu:'Summit Freightways',un:'VNL 760 · #T-762',vin:'…KN159798',key:'K-18',loc:'Bay 3',cm:'Air leak at the dryer – diagnose',type:'diag',q:1.5,burnt:1.05,st:'working',why:'Diagnosing',bul:5,
      notes:[['07:14','Leak at the dryer purge valve — soapy water confirms. Builds to 90, drops past cut-out.'],['07:40','Purge valve sticks open, cartridge saturated.'],['08:02','Quoted valve and cartridge — sent to Jenna.']],
      cause:'Purge valve stuck open, cartridge saturated',corr:'',other:'Op 2 · PM-A service',
      parts:[{n:'Purge valve',pn:'21880286',q:1,k:'received'},{n:'Air dryer cartridge',pn:'85125386',q:1,k:'ordered'}],
      files:{dash:1,pics:3,dtc:1,other:0}},
    j2:{ro:'37761',op:1,ops:1,cu:'Summit Freightways',un:'VNL 860 · #4502',vin:'…MN224517',key:'K-22',loc:'Lot D2',cm:'EGR cooler leaking – replace',type:'war',q:3.6,burnt:0,st:'hold',why:'',bul:2,tag:'Frank’s next',
      notes:[],cause:'Coolant in the EGR cooler outlet — pressure test fails',corr:'',other:'',parts:[{n:'EGR cooler',pn:'23258450',q:1,k:'staged'},{n:'Gasket kit',pn:'21719589',q:1,k:'staged'}],files:{dash:1,pics:2,dtc:0,other:0}},
    j3:{ro:'37768',op:2,ops:2,cu:'Coastal Beverage',un:'VNL 300 · #31',vin:'…LN310044',key:'K-07',loc:'Bay 3',cm:'Front brake shoes & drums',type:'op',q:2.8,burnt:0.42,st:'hold',why:'',bul:6,tag:'Back · parts staged',paused:true,
      notes:[['Thu 14:20','Drums past spec — 16.62 in. Waiting on shoes and drums.']],cause:'Drums worn past spec, shoes at 2 mm',corr:'',other:'Op 1 · PM-B service (done)',parts:[{n:'Brake drum',pn:'20514926',q:2,k:'staged'},{n:'Shoe kit',pn:'85136213',q:1,k:'staged'}],files:{dash:1,pics:4,dtc:0,other:0}},
    j4:{ro:'37750',op:1,ops:1,cu:'Hartley Produce',un:'VNL 670 · #12',vin:'…GN887120',key:'K-31',loc:'Lot B4',cm:'A/C not cooling – compressor clutch',type:'op',q:3.0,burnt:2.5,st:'customer',why:'Waiting – Approval',bul:7,
      notes:[['Thu 15:05','Clutch coil open — quote sent for the clutch kit.']],cause:'Compressor clutch coil open',corr:'',other:'',parts:[{n:'Clutch kit',pn:'22327069',q:1,k:'notordered'}],files:{dash:1,pics:2,dtc:1,other:0}},
    j5:{ro:'37733',op:3,ops:3,cu:'Mesa Aggregates',un:'VHD 300 · #9',vin:'…HN561203',key:'K-12',loc:'Lot A1',cm:'Coolant leak at the water pump',type:'op',q:2.0,burnt:2.25,st:'parts',why:'Waiting – Parts · pump Monday',bul:6,
      notes:[['Wed 10:12','Pump weeping at the weep hole — pump ordered.']],cause:'Water pump seal leaking',corr:'',other:'',parts:[{n:'Water pump',pn:'21648961',q:1,k:'backordered'}],files:{dash:1,pics:3,dtc:0,other:0}},
  },
  next:['j2','j3'], wait:['j4','j5'], done:[],
  inbox:[
    {id:'m1',who:'Frank Delaney',ini:'FD',at:'6:40 am',t:'Take <span class="ph-no">37761</span> next — EGR cooler, warranty. Tag the old cooler for Volvo.',acts:[['Accept','acc'],['Ask Frank','ask']]},
    {id:'m2',who:'Ben Okafor',ini:'BO',at:'6:52 am',t:'Shoes and drums for <span class="ph-no">37768</span> are staged — bay 3, shelf B.',acts:[['Picked up','pick']]},
    {id:'m3',who:'Jenna Cho',ini:'JC',at:'Yesterday',t:'<span class="ph-no">37750</span> approved — compressor clutch kit, go ahead.',acts:[['Open the job','open']]},
    {id:'m4',who:'Parsec',ini:'',sys:1,at:'Mon',t:'Sign your timesheet — Oct 12 – 25. Due Fri 10/30.',acts:[['Sign','sign']]},
    {id:'m5',who:'Tom Brandt',ini:'TB',at:'Mon',t:'Nice week — 112% efficiency. Keep it up.',acts:[['Got it','ok']]},
  ],
  fixes:[
    {id:'f1',for:'j1',cm:'Air leak at the dryer',cause:'Purge valve stuck open, cartridge saturated',corr:'Replaced purge valve and desiccant cartridge. Leak tested at cut-out, no drop over 10 min.',parts:['Purge valve · 21880286','Air dryer cartridge · 85125386'],by:'Dana',when:'Sep 30',ro:'36102',used:6,held:'6 of 6',avg:1.3,q:1.5},
    {id:'f2',for:'j2',cm:'EGR cooler leaking',cause:'Cooler core cracked',corr:'Replaced EGR cooler and gaskets, pressure tested cooling system at 20 psi, no loss.',parts:['EGR cooler · 23258450','Gasket kit · 21719589'],by:'Luis',when:'Aug 12',ro:'35077',used:4,held:'4 of 4',avg:3.4,q:3.6},
    {id:'f3',for:null,cm:'Wheel seal leaking – drive axle',cause:'Seal lip torn',corr:'Replaced wheel seal, cleaned brakes, refilled hub oil to the line.',parts:['Wheel seal · 21047435'],by:'Priya',when:'Oct 2',ro:'36540',used:9,held:'8 of 9',avg:2.0,q:2.2},
  ],
};
const clone=o=>JSON.parse(JSON.stringify(o));
let NAV='A';
const APPS=[];
class App{
  constructor(root,init){ this.root=root; this.init=init; this.reset(); root.addEventListener('click',e=>this.click(e)); APPS.push(this); }
  reset(){ this.d=clone(D0); this.s=Object.assign({route:'work',job:'j1',tab:'notes',sheet:null,pick:null,tab2:'in',fix:'f1',filesNew:null,clockPick:null,partI:0,toast:null},clone(this.init.s||{})); if(this.init.d) this.init.d(this.d); this.render(); }
  J(id){ return this.d.jobs[id||this.s.job]; }
  toast(t,undo){ this.s.toast={t,undo}; clearTimeout(this.tt); this.tt=setTimeout(()=>{ this.s.toast=null; this.render(); },2600); }
  /* ---------- screens ---------- */
  top(title,opts={}){
    const S=this.s, b=NAV==='B', unread=this.d.inbox.filter(m=>!m.done).length;
    const right=b&&S.route==='work'?`<button class="ph-ib" data-a="go" data-v="inbox" title="Inbox">${ic('inbox',22)}${unread?`<em>${unread}</em>`:''}</button><button class="ph-ib" data-a="go" data-v="fixes" title="Fixes">${ic('fixes',21)}</button>`:'';
    const back=b&&(S.route==='inbox'||S.route==='fixes')?`<button class="ph-back" data-a="go" data-v="work">${ic('chevL')}Work</button>`:'';
    return `<div class="ph-top">${back||`<span class="ph-date">${opts.date||'Fri, Oct 23'}</span>`}<span class="sp"></span>${right}<button class="ph-av" data-a="sheet" data-v="me" title="You">MR</button></div>${title?`<h1 class="ph-h1">${title}</h1>`:''}`;
  }
  jobRow(id,o={}){
    const j=this.J(id), run=this.d.run===id, burnt=j.burnt+(run?el()/3600:0), pct=Math.min(100,burnt/j.q*100);
    const st=j.st!=='hold'&&j.st!=='working'?`<span class="ph-pill${j.st==='parts'?' w':''}">${si(j.st)}${esc(j.why||ST[j.st])}</span>`:j.tag?`<span class="ph-pill a">${esc(j.tag)}</span>`:'';
    return `<div class="ph-job" data-a="job" data-v="${id}">
      <span class="l1">${o.n?'':''}<span class="ph-no">${j.ro}</span><span class="cu">${esc(j.cu)}</span></span>
      <span class="l2">${esc(j.cm)}</span>
      <span class="l3"><span class="ph-bar${burnt>j.q?' over':''}"><i style="width:${pct}%"></i></span><span${run?' data-tk="h"':''}>${h2(burnt)}</span> / ${h2(j.q)} h<span class="ph-type ${j.type}"><i></i>${j.type.toUpperCase()}</span>${st}</span>
      ${o.nogo?'':`<button class="go${run?' on':''}" data-a="${run?'stopask':'start'}" data-v="${id}" title="${run?'Stop':'Start the clock'}">${ic(run?'stop':'play')}</button>`}</div>`;
  }
  clockCard(){
    const c=this.d.clock, run=this.d.run?this.J(this.d.run):null;
    if(!c.on) return `<div class="ph-card ph-clk"><div class="r1"><span class="ph-dot out"></span><span class="t"><b>${c.lunch?'At lunch since 11:30':'Off the clock'}</b><small>${c.lunch?'Back by 12:00':'Shift 07:00 – 15:30'}</small></span></div><button class="ph-btn pri full" data-a="clockin">${ic('play',18)}${c.lunch?'Back from lunch':'Clock in'}</button></div>`;
    const strip=[['j',4,22],['a',22,24],['j',24,47],['s',52,57],['j',57,68]].map(x=>`<i class="${x[0]}" style="left:${x[1]}%;width:${x[2]-x[1]}%"></i>`).join('')+'<i class="n" style="left:68%"></i>';
    return `<div class="ph-card ph-clk"><div class="r1"><span class="ph-dot live${run?'':' air'}"></span><span class="t"><b>On the clock · ${hmm(this.d.clocked+el()/60)}</b><small>${run?`On ${run.ro} · in at ${c.in}`:`No job running — that’s air · in at ${c.in}`}</small></span><button class="ph-btn sm" data-a="sheet" data-v="clock">Clock out</button></div>
      <div class="ph-strip">${strip}</div><div class="ph-ax"><span>7a</span><span>9a</span><span>11a</span><span>1p</span><span>3p</span></div>
      <div class="ph-stats"><div><small>On jobs</small><b>5:10<em>77%</em></b></div><div><small>Air</small><b>0:52</b></div><div><small>Efficiency</small><b class="g">106%</b></div></div></div>`;
  }
  work(){
    const d=this.d;
    if(!d.clock.on&&!d.clock.lunch) return this.start();
    let h=this.top('Today')+`<div style="margin-top:12px">${this.clockCard()}</div>`;
    h+=`<div class="ph-warn" style="margin-top:10px">${ic('flag')}<span><b>0:15 of air</b> 09:05 – 09:20 — what were you on?</span><button class="ph-btn sm" data-a="toast" data-v="Pick the job you were on, or say it was shop time.">Fill it</button></div>`;
    h+=`<div class="ph-note"><span class="ph-av">FD</span><div><b>Frank · 6:40 am</b><p>37761 after the dryer. Volvo wants the old cooler tagged.</p><small>Your order for today · <span style="color:var(--accent-text)">Got it</span></small></div></div>`;
    if(d.run) h+=`<div class="ph-sec">On it now</div><div class="ph-now">${this.jobRow(d.run)}</div>`;
    h+=`<div class="ph-sec">Next<small>${d.next.length}</small></div><div>${d.next.map(id=>this.jobRow(id)).join('')||'<p class="ph-cu">Nothing queued — Frank will send the next one.</p>'}</div>`;
    h+=`<div class="ph-sec">Waiting<small>${d.wait.length}</small></div><div>${d.wait.map(id=>this.jobRow(id)).join('')}</div>`;
    if(d.done.length) h+=`<div class="ph-sec">Done today<small>${d.done.length}</small></div><div>${d.done.map(id=>this.jobRow(id,{nogo:1})).join('')}</div>`;
    return h;
  }
  start(){
    const d=this.d, eod=this.s.eod;
    let h=this.top('',{date:eod?'Fri, Oct 23 · 3:28 pm':'Fri, Oct 23 · 6:48 am'})+`<h1 class="ph-hello">${eod?'Done for today, Mike':'Good morning, Mike'}</h1>`;
    if(eod) return h+`<div class="ph-card ph-clk" style="margin-top:14px"><div class="r1"><span class="ph-dot out"></span><span class="t"><b>Clocked out 15:28</b><small>7:56 on the clock · 106% efficiency</small></span></div><div class="ph-stats"><div><small>On jobs</small><b>6:35</b></div><div><small>Air</small><b>0:41</b></div><div><small>Jobs</small><b>4</b></div></div></div>
      <div class="ph-warn g" style="margin-top:12px">${ic('check')}<span>Every punch has a note. Frank sees your day in the Day report.</span></div><button class="ph-btn full" style="margin-top:14px" data-a="clockin">${ic('play',18)}Clock back in</button>`;
    h+=`<div style="margin-top:14px">${this.clockCard()}</div>`;
    h+=`<div class="ph-sec">Frank’s order<small>for today</small></div><div class="ph-order">${['j1','j2','j3'].map((id,i)=>{ const j=this.J(id); return `<div class="ph-job" data-a="job" data-v="${id}"><span class="n">${i+1}</span><span class="l1"><span class="ph-no">${j.ro}</span><span class="cu">${esc(j.cu)}</span></span><span class="l2">${esc(j.cm)}</span><span class="l3">${esc(j.loc)} · ${h2(j.q)} h quoted</span></div>`; }).join('')}</div>`;
    h+=`<div class="ph-sec">Overnight</div><div class="ph-warn g">${ic('parts')}<span><b>Parts staged</b> for 37768 — bay 3, shelf B.</span></div><div class="ph-warn g">${ic('check')}<span><b>37750 approved</b> — clutch kit ordered.</span></div>`;
    return h;
  }
  job(){
    const S=this.s, j=this.J(), run=this.d.run===S.job, burnt=j.burnt+(run?el()/3600:0), left=Math.max(0,j.q-burnt), eff=burnt>0.05?j.q/burnt:null;
    const nF=j.files.dash+j.files.pics+j.files.dtc+j.files.other;
    let h=`<div class="ph-top"><button class="ph-back" data-a="go" data-v="work">${ic('chevL')}Work</button><span class="sp"></span><span class="ph-no">${j.ro} · Op ${j.op} of ${j.ops}</span><span class="sp"></span><button class="ph-ib" data-a="toast" data-v="RO, other ops, key tag and location — and Ask Frank.">${ic('more')}</button></div>`;
    h+=`<div class="ph-cu">${esc(j.cu)} · ${esc(j.un)} · ${esc(j.loc)}</div>`;
    h+=`<div class="ph-chips"><button class="ph-st" data-a="sheet" data-v="status">${si(j.st)}${ST[j.st]}${j.st==='working'&&j.why?`<span>· ${esc(j.why)}</span>`:''}${ic('chevD')}</button><span class="ph-type ${j.type}"><i></i>${j.type.toUpperCase()}</span></div>`;
    h+=`<h2 class="ph-title">${esc(j.cm)}</h2>`;
    h+=`<div class="ph-card ph-timer" ><div class="big"><span${run?' data-tk="t"':''}>${hms(burnt*3600)}</span></div><div class="run">${run?`<span class="ph-dot live"></span>Clock running · ${esc(j.why||'Working')}`:`<span class="ph-dot out"></span>Not running · ${ST[j.st]}`}</div>
      <div class="ph-prog"><i style="width:${Math.min(100,burnt/j.q*100)}%"></i><b style="left:calc(100% - 2px)"></b></div>
      <div class="ph-q"><div><small>Quoted</small><b>${h2(j.q)}<em>h</em></b></div><div><small>Burnt</small><b><span${run?' data-tk="h"':''}>${h2(burnt)}</span><em>h</em></b></div><div><small>Left</small><b>${h2(left)}<em>h</em></b></div>${j.st==='done'?`<div><small>Efficiency</small><b class="${eff>=1?'g':'r'}">${Math.round(eff*100)}<em>%</em></b></div>`:`<div><small>Pace</small><b class="${burnt<=j.q?'g':'r'}" style="font-family:var(--font-sans);font-size:15px">${burnt<=j.q?'On time':'Over'}</b></div>`}</div>
      <div class="ph-bul">${Array.from({length:9},(_,i)=>`<i class="${i<j.bul?'d':''}"></i>`).join('')}</div><div class="ph-bull"><span>Bulletins ${j.bul} of 9</span><span>Next: ${['Update case','Create folder','Dash pic','Drive in','Take pictures','Upload DTCs','Update location','EOD','Keys stored'][Math.min(8,j.bul)]}</span></div></div>`;
    const T=[['notes','Notes',j.notes.length],['parts','Parts',j.parts.length],['files','Files',nF],['info','Job','']];
    h+=`<div class="ph-seg">${T.map(t=>`<button class="${S.tab===t[0]?'on':''}" data-a="tab" data-v="${t[0]}">${t[1]}${t[2]!==''?`<small>${t[2]}</small>`:''}</button>`).join('')}</div>`;
    if(S.tab==='notes') h+=`<div class="ph-nl">${j.notes.map(n=>`<div class="ph-n"><time>${n[0]}</time><span>${esc(n[1])}</span></div>`).join('')||'<p class="ph-cu">No work notes yet.</p>'}</div><button class="ph-comp" data-a="note"><span>What did you find or do?</span><span class="ph-ib">${ic('mic',18)}</span></button><p class="ph-cu" style="font-size:12px;margin-top:6px">Enter adds the time. The mic types what you say.</p>`;
    if(S.tab==='parts') h+=`<div style="margin-top:6px">${j.parts.map((p,i)=>`<div class="ph-pt"><b>${esc(p.n)}</b><small>${p.pn} · Qty ${p.q}</small><button class="ph-pst" data-a="part" data-v="${i}">${si(PS[p.k][1])}${PS[p.k][0]}${ic('chevD')}</button></div>`).join('')}</div><button class="ph-add" data-a="toast" data-v="Asks Ben: the part, how many, and for which op.">${ic('plus')}Need a part</button>`;
    if(S.tab==='files'){ const F=j.files, nw=S.filesNew; const th=(n,g,lab)=>Array.from({length:n},(_,i)=>`<span class="${nw===g&&i===n-1?'new':''}" style="background:linear-gradient(${135+i*40}deg,#6b6f73,#a39a8c ${40+i*10}%,#3f4246)"><em>${lab(i)}</em></span>`).join('');
      h+=`<div class="ph-fg"><h4>${si(F.dash?'done':'hold')}Dash pic<small>${F.dash}</small></h4><div class="ph-th">${th(F.dash,'dash',()=> '07:06')}${F.dash?'':'<span class="add">'+ic('camera')+'</span>'}</div></div>
        <div class="ph-fg"><h4>${si(F.pics?'done':'hold')}Pictures<small>${F.pics}</small></h4><div class="ph-th">${th(F.pics,'pics',i=>['07:12','07:13','07:41','now','now'][i]||'now')}<span class="add" data-a="sheet" data-v="attach">${ic('plus')}</span></div></div>
        <div class="ph-fg"><h4>${si(F.dtc?'done':'hold')}DTCs<small>${F.dtc}</small></h4><div class="ph-th">${Array.from({length:F.dtc},(_,i)=>`<span class="doc${nw==='dtc'&&i===F.dtc-1?' new':''}"><b>PDF</b>DTC report<br>${i?'now':'07:20'}</span>`).join('')}<span class="add" data-a="sheet" data-v="attach">${ic('plus')}</span></div></div>
        <div class="ph-fg"><h4>${si(F.other?'done':'hold')}Other<small>${F.other}</small></h4><div class="ph-th">${th(F.other,'other',()=> 'now')}<span class="add" data-a="sheet" data-v="attach">${ic('plus')}</span></div></div>
        <p class="ph-cu" style="font-size:12px;margin-top:10px">Saved with the RO, in its Attachments folder in the shop folder.</p>`; }
    if(S.tab==='info') h+=`<div style="margin-top:6px"><div class="ph-kv"><small>Complaint</small><b>${esc(j.cm)}</b></div><div class="ph-kv"><small>Cause</small><b>${esc(j.cause)||'<span class="mu">—</span>'}</b></div><div class="ph-kv" data-a="toast" data-v="Type or dictate the correction — Complete needs it."><small>Correction</small><b class="${j.corr?'':'mu'}">${esc(j.corr)||'Add the correction — Complete needs it'}</b></div>
      <div class="ph-kv"><small>Unit</small><b>${esc(j.un)} · VIN ${esc(j.vin)}</b></div><div class="ph-kv"><small>Key tag · location</small><b>${esc(j.key)} · ${esc(j.loc)}</b></div>${j.other?`<div class="ph-kv"><small>Other ops on this RO</small><b>${esc(j.other)}</b></div>`:''}</div>`;
    return h;
  }
  inbox(){
    const S=this.s, L=this.d.inbox.filter(m=>S.tab2==='in'?!m.done:m.done);
    let h=this.top('Inbox')+`<div class="ph-tabs2"><button class="${S.tab2==='in'?'on':''}" data-a="tab2" data-v="in">For you ${this.d.inbox.filter(m=>!m.done).length}</button><button class="${S.tab2==='done'?'on':''}" data-a="tab2" data-v="done">Done</button></div>`;
    h+=L.map(m=>`<div class="ph-msg${m.done?' done':''}"><span class="ph-av${m.sys?' sys':''}">${m.sys?ic('timelog',16):m.ini}</span><span class="h"><b>${esc(m.who)}</b><span>· ${m.at}</span><span class="sp"></span>${m.done?'':'<i></i>'}</span><p>${m.t}</p>${m.done?'':`<span class="a">${m.acts.map((a,i)=>`<button class="ph-btn sm${i?'':' pri'}" data-a="msg" data-v="${m.id}" data-k="${a[1]}">${a[0]}</button>`).join('')}</span>`}</div>`).join('')||'<p class="ph-cu" style="margin-top:20px">You’re all caught up.</p>';
    return h;
  }
  fixes(){
    const S=this.s, run=this.d.run?this.J(this.d.run):null;
    if(S.fixOpen){ const f=this.d.fixes.find(x=>x.id===S.fix), j=f.for?this.J(f.for):null;
      return `<div class="ph-top"><button class="ph-back" data-a="fixback">${ic('chevL')}Fixes</button></div><div class="ph-fxd"><div class="ph-cu">${esc(f.by)} · ${f.when} · RO ${f.ro}</div><h2>${esc(f.cm)}</h2>
        <div class="ph-fxs"><div><small>Used</small><b>${f.used}×</b></div><div><small>Held</small><b class="g">${f.held}</b></div><div><small>Avg time</small><b>${f.avg} h</b><small>quoted ${f.q}</small></div></div>
        <div class="ph-kv" style="margin-top:8px"><small>Cause</small><b>${esc(f.cause)}</b></div><div class="ph-kv"><small>Correction</small><b>${esc(f.corr)}</b></div><div class="ph-kv"><small>Parts</small><b>${f.parts.map(esc).join('<br>')}</b></div>
        ${j?`<div class="ph-warn" style="background:var(--fill)">${ic('fixes')}<span><b>On ${j.ro} · Op ${j.op} this adds</b> the cause and the correction, and any parts not on the job yet. Nothing changes until you tap it.</span></div><button class="ph-btn pri full" style="margin-top:12px" data-a="usefix">Use on ${j.ro} · Op ${j.op}</button>`:''}</div>`; }
    let h=this.top('Fixes')+`<div class="ph-search">${ic('search')}<span>Complaint, code or part</span></div>`;
    const mine=this.d.fixes.filter(f=>f.for&&(this.d.next.includes(f.for)||this.d.run===f.for)), rest=this.d.fixes.filter(f=>!mine.includes(f));
    const card=(f,for_)=>`<button class="ph-fx${for_?' for':''}" data-a="fix" data-v="${f.id}"><span class="h">${for_?`<span class="ph-pill a">For ${this.J(f.for).ro}</span>`:''}<span>${esc(f.by)} · ${f.when}</span><span class="sp"></span>${ic('chevR',16)}</span><b>${esc(f.cm)}</b><p>${esc(f.corr)}</p><span class="m"><span><b>${f.used}×</b> used</span><span><b>${f.held}</b> held</span><span><b>${f.avg} h</b> avg</span></span></button>`;
    h+=`<div class="ph-sec">For your jobs<small>${mine.length}</small></div>${mine.map(f=>card(f,1)).join('')}<div class="ph-sec">In the shop</div>${rest.map(f=>card(f,0)).join('')}`;
    return h;
  }
  /* ---------- sheets ---------- */
  sheet(){
    const S=this.s, j=this.J(); if(!S.sheet) return '';
    let h='';
    if(S.sheet==='status'){ const run=this.d.run===S.job, opts=[['switched','hold','Switched job','Pause it — it stays on top of Next'],['parts','parts','Waiting – Parts','Ben gets a note with what you need'],['customer','customer','Waiting – Approval','The quote goes to Jenna'],['foreman','foreman','Waiting – Foreman','Frank gets a note'],['support','support','Waiting – Tech Support','Add the case number'],['done','done','Complete','Needs the correction']];
      h=`<h3>${run?'Stop the clock':'Change the status'}</h3><p class="sub">${j.ro} · ${esc(j.cm)}</p><div class="ph-sb2">`;
      if(run) h+=`<span class="ph-lbl">Still working — what you’re doing</span><div class="ph-chipr">${REASONS.map(r=>`<button class="ph-chip${j.why===r?' on':''}" data-a="why" data-v="${r}">${r}</button>`).join('')}</div><span class="ph-lbl">Stop, and the job is now…</span>`;
      else h+=`<span class="ph-lbl">The job is now…</span>`;
      h+=opts.map(o=>`<button class="ph-opt${S.pick===o[0]?' on':''}" data-a="pick" data-v="${o[0]}">${si(o[1])}<b>${o[2]}</b><small>${o[3]}</small>${o[0]==='done'&&!j.corr?'<span class="r">add it</span>':''}</button>`).join('');
      if(S.pick==='done'&&!j.corr) h+=`<div class="ph-warn">${ic('note')}<span><b>Correction</b> — what fixed it. Type it or tap the mic.</span></div><span class="ph-field">Replaced purge valve and cartridge…</span>`;
      else if(S.pick==='parts') h+=`<span class="ph-field f">Air dryer cartridge · 85125386 — still on order</span>`;
      else if(S.pick) h+=`<span class="ph-field">Note for the job (optional)</span>`;
      h+=`</div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn pri" data-a="setst"${S.pick?'':' style="opacity:.4;pointer-events:none"'}>${run?'Stop & set':'Set status'}</button></div>`; }
    if(S.sheet==='attach') h=`<h3>Add to ${j.ro}</h3><p class="sub">Photos are made smaller to save space. They’re saved with the RO.</p><div class="ph-sb2">
      <span class="ph-lbl">File it under</span><div class="ph-chipr">${[['dash','Dash pic'],['pics','Pictures'],['dtc','DTCs'],['other','Other']].map(g=>`<button class="ph-chip${(S.fileG||'pics')===g[0]?' on':''}" data-a="fileg" data-v="${g[0]}">${g[1]}</button>`).join('')}</div>
      <span class="ph-lbl">From</span>
      <button class="ph-opt" data-a="add" data-v="camera">${ic('camera')}<b>Take a photo</b><small>Opens the camera</small></button>
      <button class="ph-opt" data-a="add" data-v="photos">${ic('image')}<b>Choose photos</b><small>From the phone’s pictures — pick several</small></button>
      <button class="ph-opt" data-a="add" data-v="scan">${ic('scan')}<b>Scan a document</b><small>A printout, a work order, a receipt</small></button>
      <button class="ph-opt" data-a="add" data-v="file">${ic('clip')}<b>Add a file</b><small>DTC report, PDF, a video</small></button></div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button></div>`;
    if(S.sheet==='part'){ const p=j.parts[S.partI]; h=`<h3>${esc(p.n)}</h3><p class="sub">${p.pn} · Qty ${p.q} · now ${PS[p.k][0]}${p.k==='staged'?' — bay 3, shelf B':''}</p><div class="ph-sb2">
      ${[['picked','Picked up','You have it at the truck'],['installed','Installed','It’s on the unit'],['notneeded','Not needed','It goes back to Ben'],['wrong','Wrong part','Ben gets a note to swap it']].map(o=>`<button class="ph-opt" data-a="pset" data-v="${o[0]}">${si(o[0]==='installed'?'done':o[0]==='picked'?'working':o[0]==='wrong'?'problem':'hold')}<b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}
      <p class="ph-cu" style="font-size:12px;margin:8px 4px 0">Ordered, received and staged are set by parts.</p></div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button></div>`; }
    if(S.sheet==='clock'){ const run=this.d.run?this.J(this.d.run):null, p=S.clockPick;
      h=`<h3>Clock out</h3><p class="sub">In at 07:02 · ${hmm(this.d.clocked+el()/60)} on the clock</p><div class="ph-sb2">
        <button class="ph-opt${p==='lunch'?' on':''}" data-a="cpick" data-v="lunch">${ic('coffee')}<b>Lunch</b><small>30 min — back by 12:00</small></button>
        <button class="ph-opt${p==='brk'?' on':''}" data-a="cpick" data-v="brk">${ic('clock')}<b>Appointment or break</b><small>Say when you’ll be back</small></button>
        <button class="ph-opt${p==='eod'?' on':''}" data-a="cpick" data-v="eod">${ic('exit')}<b>End of day</b><small>Close out today</small></button>`;
      if(p==='eod'){ h+=`<span class="ph-lbl">Before you go</span>`;
        if(run) h+=`<div class="ph-warn">${ic('clock')}<span><b>${run.ro} is still running.</b> It stops as Switched job — or change it.</span><button class="ph-btn sm" data-a="sheet" data-v="status" data-j="${this.d.run}">Change</button></div>`;
        h+=`<div class="ph-warn b">${ic('flag')}<span><b>0:15 of air</b> 09:05 – 09:20 has no job.</span><button class="ph-btn sm" data-a="toast" data-v="Pick the job you were on, or say it was shop time.">Fill it</button></div>
          <div class="ph-warn">${ic('note')}<span><b>37768</b> 10:40 – 11:20 has no work note.</span><button class="ph-btn sm" data-a="toast" data-v="Opens the note for that punch.">Add</button></div>
          <span class="ph-lbl">For tomorrow</span><span class="ph-field">What’s left on 37742 — the next person reads this</span>`; }
      h+=`</div><div class="ph-sfoot"><button class="ph-btn" data-a="close">Cancel</button><button class="ph-btn pri" data-a="clockout"${p?'':' style="opacity:.4;pointer-events:none"'}>${p==='eod'?'Clock out for the day':p==='lunch'?'Start lunch':'Clock out'}</button></div>`; }
    if(S.sheet==='me') h=`<div style="display:flex;align-items:center;gap:12px"><span class="ph-av" style="width:46px;height:46px;font-size:15px">MR</span><div><h3>Mike Rodriguez</h3><p class="sub" style="margin:0">Technician · signed in 06:58</p></div></div><div class="ph-sb2">
      <span class="ph-lbl">Look</span><div class="ph-chipr"><button class="ph-chip${document.documentElement.dataset.theme==='dark'?'':' on'}" data-a="theme" data-v="light">Ivory</button><button class="ph-chip${document.documentElement.dataset.theme==='dark'?' on':''}" data-a="theme" data-v="dark">Graphite</button></div>
      <span class="ph-lbl">On the phone</span><p class="ph-cu" style="margin:4px 4px 0">Your work, Inbox and Fixes. Everything else stays on the computer.</p>
      <button class="ph-opt" data-a="toast" data-v="Back to the sign-in — pick your name and PIN.">${ic('exit')}<b>Sign out</b><small>Someone else uses this phone</small></button></div>`;
    return `<div class="ph-scrim" data-a="close"></div><div class="ph-sheet"><div class="ph-grab"></div>${h}</div>`;
  }
  foot(){
    const S=this.s, d=this.d;
    if(S.route==='job'){ const run=d.run===S.job;
      return `<div class="ph-foot"><div class="ph-acts"><button class="ph-btn" data-a="sheet" data-v="attach">${ic('camera')}Photo</button><button class="ph-btn" data-a="note">${ic('mic')}Note</button>${run?`<button class="ph-btn main" data-a="sheet" data-v="status">${ic('stop')}Stop</button>`:`<button class="ph-btn main start" data-a="start" data-v="${S.job}">${ic('play')}${d.run?'Switch to this job':'Start the clock'}</button>`}</div></div>`; }
    const run=d.run?this.J(d.run):null, unread=d.inbox.filter(m=>!m.done).length;
    const cbar=run&&S.route!=='work'?`<div class="ph-cbar"><span class="ph-dot live"></span><span class="t" data-a="job" data-v="${d.run}"><b><span data-tk="t">${hms((run.burnt+el()/3600)*3600)}</span> · ${run.ro}</b><small>${esc(run.cm)}</small></span><button class="ph-btn sm" data-a="sheet" data-v="status" data-j="${d.run}">${ic('stop',16)}Stop</button></div>`:'';
    const tabs=`<div class="ph-tabs">${[['work','today','Work',0],['inbox','inbox','Inbox',unread],['fixes','fixes','Fixes',0]].map(t=>`<button class="${S.route===t[0]?'on':''}" data-a="go" data-v="${t[0]}"><span class="w">${ic(t[1])}${t[3]?`<em>${t[3]}</em>`:''}</span>${t[2]}</button>`).join('')}</div>`;
    if(NAV==='B') return cbar?`<div class="ph-foot tabs">${cbar}</div>`:'';
    return `<div class="ph-foot tabs">${cbar}${tabs}</div>`;
  }
  render(){
    const S=this.s, sc=this.root.querySelector('.ph-main'), y=sc?sc.scrollTop:0;
    const main=S.route==='job'?this.job():S.route==='inbox'?this.inbox():S.route==='fixes'?this.fixes():this.work();
    this.root.className='ph'+(NAV==='B'?' navB':'');
    this.root.innerHTML=`<div class="ph-isl"></div><div class="ph-sb"><span>${S.route==='work'&&!this.d.clock.on&&!this.d.clock.lunch?(S.eod?'3:28':'6:48'):'1:44'}</span><span>${SB}</span></div><div class="ph-main">${main}</div>${this.foot()}${this.sheet()}${S.toast?`<div class="ph-toast"><span>${esc(S.toast.t)}</span>${S.toast.undo?'<button data-a="undo">Undo</button>':''}</div>`:''}<div class="ph-home"></div>`;
    const s2=this.root.querySelector('.ph-main'); if(s2&&this.keepY) s2.scrollTop=y; this.keepY=false;
    if(this.init.scroll&&!this.scrolled){ this.scrolled=true; s2.scrollTop=this.init.scroll; }
  }
  /* ---------- what a tap does ---------- */
  click(e){
    const t=e.target.closest('[data-a]'); if(!t||!this.root.contains(t)) return;
    e.stopPropagation();
    const a=t.dataset.a, v=t.dataset.v, S=this.s, d=this.d;
    const go=(r)=>{ S.route=r; S.sheet=null; this.root.querySelector('.ph-main').scrollTop=0; };
    this.undo=this.undo||null;
    const snap=()=>{ this.undo=JSON.stringify({d:this.d,s:Object.assign({},this.s,{toast:null,sheet:null})}); };
    this.keepY=true;
    if(a==='go'){ go(v); S.fixOpen=false; this.keepY=false; }
    else if(a==='job'){ if(e.target.closest('.go')) return; S.job=v; S.tab='notes'; go('job'); this.keepY=false; }
    else if(a==='tab'){ S.tab=v; S.filesNew=null; }
    else if(a==='tab2'){ S.tab2=v; }
    else if(a==='sheet'){ if(t.dataset.j) S.job=t.dataset.j; S.sheet=v; S.pick=null; if(v!=='clock') S.clockPick=S.sheet==='clock'?S.clockPick:S.clockPick; }
    else if(a==='close'){ S.sheet=null; }
    else if(a==='toast'){ this.toast(v); }
    else if(a==='start'){ snap(); const prev=d.run; if(prev&&prev!==v){ const pj=this.J(prev); pj.burnt+=el()/3600*0; pj.st='hold'; pj.paused=true; pj.tag='Paused'; d.next.unshift(prev); }
      d.next=d.next.filter(x=>x!==v); d.wait=d.wait.filter(x=>x!==v); d.run=v; const j=this.J(v); j.st='working'; j.why=j.why&&REASONS.includes(j.why)?j.why:'Repairing'; j.tag='';
      if(!d.clock.on){ d.clock.on=true; d.clock.lunch=false; }
      this.toast(prev&&prev!==v?`Switched from ${this.J(prev).ro} — it’s on top of Next`:`Clock started · ${j.ro} · ${j.why}`,1); }
    else if(a==='stopask'){ S.job=v; S.sheet='status'; S.pick=null; }
    else if(a==='why'){ this.J().why=v; S.sheet=null; this.toast(`Now ${v.toLowerCase()} · ${this.J().ro}`); }
    else if(a==='pick'){ S.pick=v; }
    else if(a==='setst'){ snap(); const j=this.J(), id=S.job, k=S.pick; if(d.run===id) d.run=null;
      d.next=d.next.filter(x=>x!==id); d.wait=d.wait.filter(x=>x!==id); d.done=d.done.filter(x=>x!==id);
      if(k==='switched'){ j.st='hold'; j.why=''; j.tag='Paused'; d.next.unshift(id); }
      else if(k==='done'){ j.st='done'; j.why='Complete'; if(!j.corr) j.corr='Replaced purge valve and cartridge.'; d.done.push(id); }
      else { j.st=k; j.why=ST[k]; d.wait.unshift(id); }
      S.sheet=null; this.toast(`${j.ro} → ${k==='switched'?'Paused, top of Next':ST[k]}${k==='parts'?' · Ben has it':k==='customer'?' · Jenna has the quote':k==='foreman'?' · Frank has it':''}`,1); }
    else if(a==='fileg'){ S.fileG=v; }
    else if(a==='add'){ snap(); const g=S.fileG||(v==='file'?'dtc':'pics'), j=this.J(); j.files[g]++; S.sheet=null; S.tab='files'; S.filesNew=g; this.toast(`${v==='file'?'File':v==='scan'?'Scan':'Photo'} added to ${({dash:'Dash pic',pics:'Pictures',dtc:'DTCs',other:'Other'})[g]} · ${j.ro}`,1); }
    else if(a==='part'){ S.partI=+v; S.sheet='part'; }
    else if(a==='pset'){ snap(); const p=this.J().parts[S.partI]; if(v==='picked'||v==='installed') p.k=v; S.sheet=null; this.toast(v==='picked'?`${p.n} picked up`:v==='installed'?`${p.n} installed`:v==='notneeded'?`${p.n} — Ben takes it back`:`Ben will swap the ${p.n.toLowerCase()}`,1); }
    else if(a==='note'){ S.tab='notes'; this.toast('Type, or hold the mic and talk — Enter saves it with the time.'); }
    else if(a==='cpick'){ S.clockPick=v; }
    else if(a==='clockout'){ snap(); const p=S.clockPick, run=d.run;
      if(run){ const j=this.J(run); j.st='hold'; j.tag='Paused'; d.next.unshift(run); d.run=null; }
      if(p==='lunch'){ d.clock.on=false; d.clock.lunch=true; S.sheet=null; go('work'); this.toast('Lunch started 11:30 · back by 12:00',1); }
      else { d.clock.on=false; d.clock.lunch=false; S.eod=p==='eod'; S.sheet=null; go('work'); this.toast(p==='eod'?'Clocked out 15:28 · 7:56 today':'Clocked out — say when you’re back',1); } }
    else if(a==='clockin'){ snap(); const was=d.clock.lunch; d.clock.on=true; d.clock.lunch=false; S.eod=false; go('work'); this.toast(was?'Back from lunch 12:01':'Clocked in 06:58 · start 37742 at the truck',1); }
    else if(a==='msg'){ snap(); const m=d.inbox.find(x=>x.id===v), k=t.dataset.k; m.done=true;
      if(k==='open'){ S.job='j4'; S.tab='notes'; go('job'); }
      if(k==='pick'){ this.J('j3').parts.forEach(p=>p.k='picked'); }
      this.toast({acc:'37761 is yours — Frank sees you took it',ask:'Opens a note to Frank',pick:'Shoes and drums picked up · 37768',open:'37750 — approved, go ahead',sign:'Timesheet signed — Frank approves it next',ok:'Done'}[k],k!=='open'); }
    else if(a==='fix'){ S.fix=v; S.fixOpen=true; this.keepY=false; this.root.querySelector('.ph-main').scrollTop=0; }
    else if(a==='fixback'){ S.fixOpen=false; }
    else if(a==='usefix'){ snap(); const f=d.fixes.find(x=>x.id===S.fix), j=this.J(f.for); j.cause=f.cause; j.corr=f.corr; this.toast(`Cause and correction added to ${j.ro} · Op ${j.op}`,1); }
    else if(a==='theme'){ setTheme(v); }
    else if(a==='undo'){ if(this.undo){ const u=JSON.parse(this.undo); this.d=u.d; this.s=u.s; this.undo=null; } S.toast=null; this.s.toast=null; }
    this.render();
  }
  tick(){ const run=this.d.run?this.J(this.d.run):null; if(!run) return; const b=run.burnt+el()/3600;
    this.root.querySelectorAll('[data-tk="t"]').forEach(x=>x.textContent=hms(b*3600)); this.root.querySelectorAll('[data-tk="h"]').forEach(x=>x.textContent=h2(b)); }
}
const SB='<svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 27 12" width="27" height="12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="2"/></svg>';
/* ---------- the board: one phone per screen ---------- */
const PHONES=[
  ['Start of day','Clock in — Frank’s order, what came in overnight',{s:{},d:d=>{ d.clock.on=false; d.run=null; d.jobs.j1.st='hold'; d.jobs.j1.why=''; d.next=['j1','j2','j3']; }}],
  ['Work','Your jobs and your day — start, stop, switch',{s:{}}],
  ['A job','Everything on it — notes, parts, files, the job',{s:{route:'job'}}],
  ['Change the status','Stop the clock and say what’s next',{s:{route:'job',sheet:'status',pick:'parts'}}],
  ['Attach files','Photos, scans and files, filed under the RO’s bulletins',{s:{route:'job',tab:'files',sheet:'attach'}}],
  ['Parts','What’s staged, picked up, installed',{s:{route:'job',job:'j2',tab:'parts'},d:d=>{}}],
  ['Clock out','Lunch, a break, or the end of the day',{s:{sheet:'clock',clockPick:'eod'}}],
  ['Inbox','What’s sent to you — answer it right there',{s:{route:'inbox'}}],
  ['Fixes','A past fix for the job you’re on — use it',{s:{route:'fixes',fixOpen:true,fix:'f1'}}],
];
const board=$('.ph-board');
board.innerHTML=PHONES.map((p,i)=>`<figure class="ph-fig"><figcaption><i>${i+1}</i>${p[0]}<small>${p[1]}</small></figcaption><div class="ph-dev"><div class="ph" data-i="${i}"></div></div></figure>`).join('');
$$('.ph[data-i]').forEach(r=>new App(r,PHONES[+r.dataset.i][2]));
setInterval(()=>APPS.forEach(a=>a.tick()),1000);
function setTheme(v){ document.documentElement.dataset.theme=v; $$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x.dataset.themeSet===v)); APPS.forEach(a=>a.render()); }
$$('[data-theme-set]').forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.themeSet)));
$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>{ NAV=b.dataset.nav; $$('[data-nav]').forEach(x=>x.classList.toggle('is-on',x===b)); APPS.forEach(a=>a.render()); }));
$('[data-reset]').addEventListener('click',()=>APPS.forEach(a=>{ a.scrolled=false; a.reset(); }));
