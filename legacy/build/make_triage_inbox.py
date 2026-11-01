# Triage — Action inbox with Inbox / Desk / Yard views (reuses the data, helpers and styles of make_triage.py).
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
src = open(f"{B}/make_triage.py").read().split("rep = {")[0]
argv = sys.argv; sys.argv = [argv[0], "/dev/null"]
ns = {"__file__": f"{B}/make_triage.py", "__name__": "tri"}
exec(src, ns)
sys.argv = argv
P, tok, bun, DATA, ICO, SI = ns["P"], ns["tok"], ns["bun"], ns["DATA"], ns["ICO"], ns["SI"]
SHARED = ns["JS"].split("/* ===== 1 · Stage lanes")[0]
CSS = ns["CSS"] + r'''
/* ---------- header: view switch + icon-only search ---------- */
.tg-views{margin-left:auto}
.tg-views button{display:inline-flex;align-items:center;gap:6px;padding:5px 12px}
.tg-views .px-ico{width:14px;height:14px;color:var(--ink-3)}
.tg-views button.is-on .px-ico{color:var(--ink)}
.tg-views .px-kbd{margin-left:2px;opacity:.7}
.tg-hsep{width:1px;height:20px;background:var(--hairline);margin:0 2px}
.tg-srch{position:relative;display:flex;align-items:center}
.tg-srch input{width:32px;height:32px;box-sizing:border-box;padding:0 10px 0 34px;font-size:13.5px;opacity:0;pointer-events:none;transition:width .22s cubic-bezier(.2,.8,.2,1),opacity .15s}
.tg-srch.open input{width:280px;opacity:1;pointer-events:auto}
.tg-srch .px-btn{position:absolute;left:0;top:0;color:var(--ink-2)}
.tg-srch.open .px-btn{background:transparent;color:var(--ink-3)}
.tg-srch .px-kbd{position:absolute;right:8px;top:50%;transform:translateY(-50%);opacity:0;transition:opacity .15s;pointer-events:none}
.tg-srch.open .px-kbd{opacity:1}
.tg-srch .px-btn .tip{position:absolute;top:38px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:4px 8px;border-radius:6px;background:var(--ink);color:var(--canvas);font-size:11.5px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:5}
.tg-srch:not(.open) .px-btn:hover .tip{opacity:1}
.sr-pop{position:absolute;top:50px;right:132px;width:380px;border-radius:14px;background:var(--raised);box-shadow:0 0 0 1px var(--border),var(--shadow-raised);padding:6px;z-index:20;display:none}
.tg-head.sr-on .sr-pop{display:block}
.sr-pop .h{padding:8px 10px 4px;font-size:11.5px;font-weight:500;color:var(--ink-3)}
.sr-pop .it{display:flex;align-items:center;gap:10px;height:36px;padding:0 10px;border-radius:9px;font-size:13px;cursor:pointer}
.sr-pop .it:hover,.sr-pop .it.k{background:var(--fill)}
.sr-pop .it b{font-weight:500;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sr-pop .ft{display:flex;gap:14px;padding:8px 10px 4px;font-size:11.5px;color:var(--ink-3);box-shadow:inset 0 1px 0 var(--hairline);margin-top:4px}
.tg-head{position:relative}

/* ---------- always-on inbox list ---------- */
.ib .i3-list{flex-basis:400px}
.ib .i3-grp{display:flex;gap:6px}
.ib .i3-grp span{color:var(--ink-4)}
.ib .i3-it .t .tg-spot{margin-left:auto;height:18px;font-size:11px;opacity:0;transition:opacity .15s}
.ib.v-yard .i3-it .t .tg-spot{opacity:1}
.ib-main{flex:1;min-width:0;display:flex;flex-direction:column;position:relative}
.ib-main > .i3-main,.ib-main > .i7-main,.ib-main > .yd{flex:1;min-height:0}
.ib-main .i3-main{min-height:0}
.ib-out{padding:9px 20px 16px;font-size:12px;color:var(--ink-3);box-shadow:inset 0 1px 0 var(--hairline)}
.ib-out b{color:var(--ink-2);font-weight:500}

/* ---------- yard view ---------- */
.yd{overflow:auto;padding:18px 24px 22px;display:flex;flex-direction:column;gap:16px;scrollbar-width:thin}
.yd-bar{display:flex;align-items:center;gap:12px;min-height:52px;padding:0 10px 0 16px;border-radius:14px;background:var(--canvas);font-size:13px;flex:none}
.yd-bar h3{margin:0;font:500 18px/24px var(--font-serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.yd-bar .at{display:inline-flex;align-items:center;gap:6px;color:var(--ink-2);white-space:nowrap}
.yd-bar .at .px-ico{width:14px;height:14px;color:var(--ink-3)}
.yd-bar .at b{font:500 13px/1 var(--font-mono);color:var(--ink)}
.yd-bar .stt{display:inline-flex;align-items:center;gap:6px;color:var(--ink-2);white-space:nowrap}
.yd-bar .tg-ro{white-space:nowrap}
.ib .i3-comp .r.k2{margin-top:-4px}
.ib .i3-comp .lbl{width:58px;flex:none}
.yd-bar .sp{flex:1}
.yd-bar.mv{background:var(--accent-tint);box-shadow:inset 0 0 0 1px var(--accent-line)}
.yd-bar.mv .k{font-size:12px;font-weight:600;color:var(--accent-text)}
.yd .i2-s.hl{box-shadow:0 0 0 2px var(--border-strong),0 6px 14px -6px rgba(0,0,0,.25);transform:translateY(-1px)}
.yd .i2-s{transition:box-shadow .15s,transform .15s}
.yd .i2-s.free{cursor:pointer;background-image:none;background:var(--accent-tint);box-shadow:inset 0 0 0 1.5px var(--accent-line)}
.yd .i2-s.free:hover{box-shadow:inset 0 0 0 2px var(--accent)}
.yd .i2-s.free .l{color:var(--accent-text)}
.yd .i2-s.dim{opacity:.45}
.yd-toast{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);padding:9px 14px;border-radius:10px;background:var(--ink);color:var(--canvas);font-size:13px;box-shadow:var(--shadow-raised);z-index:10;display:flex;gap:12px;align-items:center}
.yd-toast u{text-decoration:none;font-weight:600;cursor:pointer;opacity:.85}
'''

JS = SHARED + r'''
SEL='37590'; let TAB='inbox', SRCH=false, MOVE=false, TOAST='';
const VIEWS=[['inbox','inbox','Inbox'],['desk','console','Desk'],['yard','pin','Yard']];

/* ---------- left: Needs action (always on) ---------- */
function inboxList(){const N=needs();const groups={};N.forEach(x=>{(groups[x[5]]=groups[x[5]]||[]).push(x);});
  const inList=N.some(x=>x[0].no===SEL), r=get(SEL);
  return `<div class="i3-list"><div class="i3-lh">Needs action<span class="n">${N.length}</span></div><div class="i3-scroll">${Object.keys(groups).map(g=>`<div class="i3-grp">${g}<span>${groups[g].length}</span></div>`+groups[g].map(([x,_,icn,why,btn])=>`<div class="i3-it${x.no===SEL?' on':''}" data-sel="${x.no}" data-spot="${x.spot}">${x.late?'<i class="dot"></i>':''}<span class="gi">${I[icn]}</span><span class="t"><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b>${spot(x.spot)}</span><span class="w${x.late?' late':''}">${esc(why)}</span><button class="px-btn px-btn--sm${btn==='Release'?' px-btn--primary':''}">${btn}</button></div>`).join('')).join('')}</div>
  ${inList?'':`<div class="ib-out">Showing <b>RO-${r.no} · ${esc(r.cust)}</b> — nothing waiting on it.</div>`}</div>`;}

/* ---------- view 1 · Inbox (conversation) ---------- */
function vInbox(r){const a=appr(r);
  const thread=r.ct.map(c=>`<div class="i3-m"><span class="gi">${I[KIND[c[0]]]}</span><div class="bd"><div class="hd"><b>${esc(c[0])}</b><span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span><span style="color:var(--ink-3)">${esc(c[2])}</span><time>${esc(c[1])}</time></div>${c[4]?`<p>${esc(c[4])}</p>`:''}</div></div>`).join('');
  return `<div class="i3-main"><div class="i3-top"><div class="r1"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2>
   <div class="r2">${spot(r.spot)}${ticks(r)}<span style="display:inline-flex;gap:6px;align-items:center">${st(r)}</span>${held(r)}<span style="margin-left:auto;display:flex;gap:8px"><button class="px-btn px-btn--sm">${I.swap}Transfer…</button><button class="px-btn px-btn--sm">Open RO</button></span></div></div>
   <div class="i3-thread"><span class="i3-day">This RO · calls, texts, approvals and transfers</span>${thread||'<div class="i3-m sys"><span class="gi">'+I.phone+'</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>'}
    <div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">Transferred to <b style="color:var(--ink)">${esc(r.hold[1])}</b> · ${ROLE[r.hold[0]][1]}<time>${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'} ago</time></div></div></div>
    <div class="i3-appr"><div class="h">${I.check}Approvals<span>Approved ${money(a.ok)} · open ${money(a.op)}${a.no?' · declined '+money(a.no):''}</span></div>${r.ops.map((o,i)=>`<div class="i3-op"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button class="${o[2]==='part'?'on':''}">Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div>
   </div>
   <div class="i3-comp"><div class="r"><span class="lbl">Log</span>${['Call','Text','Email','In person'].map((k,i)=>`<button class="tg-chip${i===0?' on':''}" data-chip="k">${I[KIND[k]]}${k}</button>`).join('')}</div><div class="r k2"><span class="lbl">Outcome</span>${['Approved','Declined','Left voicemail','No answer','Update given','Will call back'].map((k,i)=>`<button class="tg-chip${i===2?' on':''}" data-chip="o">${k}</button>`).join('')}</div>
    <div class="r"><textarea rows="1" placeholder="Note — e.g. approved $540 for op 2"></textarea><button class="px-btn px-btn--primary px-btn--sm send">Log it<span class="px-kbd">↵</span></button></div></div></div>`;}

/* ---------- view 2 · Desk ---------- */
function vDesk(r){const a=appr(r);
  const steps=STG.map((n,i)=>`<div class="i7-step ${i<r.stage?'done':i===r.stage?(r.cat==='apr'?'wait':'now'):''}"><i></i><b>${n}</b><small>${i<r.stage?'done':i===r.stage?'now':'—'}</small></div>`).join('');
  const done=closeList(r).filter(x=>x[0]).length,C=2*Math.PI*22;
  const n=needs().find(x=>x[0]===r);const t=r.next||(n?n[3]:'Nothing waiting on anyone — keep going.');
  return `<div class="i7-main"><div class="i7-hd"><div class="l"><div class="eb"><span class="tg-ro">RO-${r.no}</span>·<span>${esc(r.veh)} · Unit ${esc(r.unit)}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2></div><div class="r">${spot(r.spot)}<button class="px-status--button">${st(r)}${I.chevD.replace('px-ico','px-ico px-chev')}</button></div></div>
   <div class="i7-strip"><div class="tg-sec" style="display:flex;gap:8px">Stage<span style="color:var(--ink-2)">${STG[r.stage]} · ${r.stage+1} of 7</span><span style="margin-left:auto">ready ${esc(r.ready)}</span></div><div class="i7-steps">${steps}</div></div>
   <div class="i7-next"><span class="k">Next</span><p>${esc(t.charAt(0).toUpperCase()+t.slice(1))}</p><button class="px-btn px-btn--sm">${I.phone}Log a call</button>${n?`<button class="px-btn px-btn--accent px-btn--sm">${n[4]}</button>`:''}</div>
   <div class="i7-two"><div class="i7-card"><div class="h">${I.phone}Customer<small>${r.ct.length} contact${r.ct.length===1?'':'s'}</small></div>${feed(r,3)}<div class="i7-log">${['Call','Text','Email','In person'].map(k=>`<button class="tg-chip">${I[KIND[k]]}${k}</button>`).join('')}</div></div>
    <div class="i7-card"><div class="h">${I.check}Approvals<small>approved ${money(a.ok)} · open ${money(a.op)}</small></div>${r.ops.map((o,i)=>`<div class="i3-op" style="padding:8px 0"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button>Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div></div>
   <div class="i7-two"><div class="i7-card"><div class="h">Ready to close<small>${done} of 5</small></div><div class="i7-rtc"><svg class="tg-ring${done===5?' ok':''}" width="56" height="56" viewBox="0 0 56 56"><circle class="t" cx="28" cy="28" r="22"/><circle class="p" cx="28" cy="28" r="22" stroke-dasharray="${(C*done/5).toFixed(1)} ${C.toFixed(1)}"/></svg>${closeHtml(r)}</div></div>
    <div class="i7-card"><div class="h">${I.swap}Who has it</div><div style="display:flex;align-items:center;gap:10px"><span class="tg-role">${ROLE[r.hold[0]][0]}</span><div style="flex:1"><div style="font-weight:500;font-size:14px">${esc(r.hold[1])}</div><div style="font-size:12.5px;color:var(--ink-3)">${ROLE[r.hold[0]][1]}</div></div><button class="px-btn px-btn--sm px-btn--primary">Transfer…</button></div><div style="margin-top:12px">${held(r)}</div><div class="tg-kv" style="margin-top:14px"><span>Tech</span><b style="font-weight:400">${r.tech||'Unassigned'}</b><span>Key tag</span><b class="px-id">1${r.no.slice(-2)}</b><span>Ready about</span><b style="font-weight:400">${esc(r.ready)}</b></div></div></div>
  </div>`;}

/* ---------- view 3 · Yard ---------- */
const ZONE=id=>/^B\d/.test(id)?'Bay '+id.slice(1):id==='UP'?'UpTime bay':/^AW/.test(id)?'Awning':/^W/.test(id)?'Arrival line':/^T/.test(id)?'Triage lane '+id.slice(1):/^[CDE]/.test(id)?id[0]+' line':'Yard';
function vYard(r){const at={};ROS.forEach(x=>at[x.spot]=x);
  const s=(id)=>{const x=at[id];if(x)return `<button class="i2-s occ${x.no===SEL?' tg-sel':''}${MOVE&&x.no!==SEL?' dim':''}" data-sel="${x.no}" data-at="${id}" title="${esc(x.cust)}"><span class="l">${id}</span><b>${sq(x.cat)}${x.no.slice(-4)}${x.live?'<i class="tg-live"></i>':''}</b><small>${esc(x.cust)}</small><span class="fl">${x.warr?I.warranty:''}${x.late?'<i class="lt"></i>':''}</span></button>`;
    return MOVE?`<button class="i2-s free" data-free="${id}"><span class="l">${id}</span></button>`:`<div class="i2-s" data-at="${id}"><span class="l">${id}</span></div>`;};
  const grid=(ids,cols)=>`<div class="i2-g" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${ids.map(s).join('')}</div>`;
  const lot=(row,n)=>Array.from({length:n},(_,i)=>row+(i+1));
  const bar=MOVE?`<div class="yd-bar mv"><span class="k">Move</span><span><b style="font-weight:500">RO-${r.no} · ${esc(r.cust)}</b> from ${ZONE(r.spot)} <span class="px-id">${r.spot}</span> — pick a free spot</span><span class="sp"></span><button class="px-btn px-btn--sm" data-move="0">Cancel<span class="px-kbd">Esc</span></button></div>`
   :`<div class="yd-bar">${sq(r.cat)}<span class="tg-ro">RO-${r.no}</span><h3>${esc(r.cust)}</h3><span class="at">${I.pin}${ZONE(r.spot)}<b>${r.spot}</b></span><span class="stt">${st(r)}</span><span class="sp"></span><span style="font-size:12px;color:var(--ink-3);white-space:nowrap">Key tag <span class="px-id" style="color:var(--ink-2)">1${r.no.slice(-2)}</span></span><button class="px-btn px-btn--sm" data-move="1">${I.pin}Move…</button></div>`;
  return `<div class="yd">${bar}
   <div class="i2-row"><section class="i2-z" style="flex:1.55"><div class="i2-zh">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid(['UP','B1','B2','B3','B4','AW1','B5','B6','B7','B8'],5)}</section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Check-in<small>arrival line · triage lanes</small></div>${grid(['W1','W2','W3','W4'],4)}<div style="height:6px"></div>${grid(['T1','T2','T3'],4)}</section></div>
   <section class="i2-z"><div class="i2-zh">Parking lot<small>C · waiting on customers &nbsp;·&nbsp; D · ready to release &nbsp;·&nbsp; E · overflow</small></div>${grid(lot('C',10),10)}<div style="height:6px"></div>${grid(lot('D',10),10)}<div style="height:6px"></div>${grid(lot('E',10),10)}</section>
   <div class="i2-row"><section class="i2-z" style="flex:1"><div class="i2-zh">Warranty<small>on the yard</small></div><div style="display:flex;flex-direction:column;gap:6px">${ROS.filter(x=>x.warr).map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer" data-sel="${x.no}"><span class="tg-ro">${x.no}</span><b style="font-weight:500;white-space:nowrap">${esc(x.cust)}</b>${spot(x.spot)}<span style="margin-left:auto;color:var(--ink-3);font-size:12px;white-space:nowrap">${x.warr[0]}% · ${x.warr[1]} missing</span><span style="width:60px" class="i6-wb"><i style="width:${x.warr[0]}%"></i></span></div>`).join('')}</div></section>
   <section class="i2-z" style="flex:.8"><div class="i2-zh">Released today<small>${D.rel.length}</small></div><div style="display:flex;flex-direction:column;gap:6px">${D.rel.map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${x.no}</span><b style="font-weight:500">${esc(x.cust)}</b><span style="margin-left:auto;color:var(--ink-3);font-size:12px">${x.at}</span></div>`).join('')}</div></section></div>
   <div class="i2-leg">${ORDER.map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span><i class="tg-live"></i>On the clock</span><span><i style="width:6px;height:6px;border-radius:50%;background:var(--warn);display:inline-block"></i>Late</span><span style="color:var(--accent-text)">${I.warranty}Warranty</span></div>
  </div>${TOAST?`<div class="yd-toast">${TOAST}<u data-undo>Undo</u></div>`:''}`;}

/* ---------- search (icon only, opens on click or /) ---------- */
function srPop(){const q=($('.tg-srch input')||{}).value||'';const L=ROS.filter(r=>!q||(r.no+' '+r.cust+' '+r.unit).toLowerCase().includes(q.toLowerCase())).slice(0,6);
  return `<div class="h">${q?'Matches':'Recent'}</div>${L.map((r,i)=>`<div class="it${i===0?' k':''}" data-sel="${r.no}" data-pick>${sq(r.cat)}<span class="tg-ro">${r.no}</span><b>${esc(r.cust)}</b>${spot(r.spot)}</div>`).join('')||'<div class="it" style="color:var(--ink-3)">No RO, unit or customer matches</div>'}<div class="ft"><span><span class="px-kbd">↵</span> open</span><span><span class="px-kbd">Esc</span> close</span><span style="margin-left:auto">RO, unit, customer or VIN</span></div>`;}

/* ---------- page ---------- */
const NOTES={
inbox:[['One list, always on','Needs action stays on the left whatever the view — grouped, each item with one button.'],['Inbox view','The customer conversation for the selected RO: calls, texts, approvals and transfers, with the log box at the bottom.'],['Search','Icon only. Click it or press / — it opens in place with recent ROs.']],
desk:[['Same list, new pane','Pick from Needs action; the pane becomes the desk for that RO.'],['Desk view','Stage, Next with its button, Customer + Approvals, Ready to close, Who has it.'],['Views stay put','The view you pick is kept when you move between ROs.']],
yard:[['Where it is','The selected RO is outlined on the yard; its spot and zone sit in the bar on top.'],['Hover to find','Hovering a list item lifts its spot on the map; spot chips show in the list in this view.'],['Move in place','Move… lights up the free spots — click one to move the truck, with Undo.']]};
const RAIL=['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'];
function render(){const r=get(SEL);
  const facts=`<span><b>${ROS.length}</b> on the yard</span>·<span><b>${ROS.filter(r=>r.cat==='apr').length}</b> awaiting approval</span>·<span><b>${ROS.filter(r=>r.cat==='rdy').length}</b> ready to release</span>·<span class="w"><b>${ROS.filter(r=>r.late).length}</b> late</span>`;
  const views=`<div class="px-seg tg-views" role="tablist">${VIEWS.map(([k,ic,l],i)=>`<button role="tab" class="${TAB===k?'is-on':''}" data-view="${k}" title="${l} view (${i+1})">${I[ic]}${l}</button>`).join('')}</div>`;
  const search=`<span class="tg-srch${SRCH?' open':''}"><input class="px-input" placeholder="Search ROs"><span class="px-kbd">Esc</span><button class="px-btn px-btn--icon px-btn--ghost" data-search aria-label="Search">${I.search}<span class="tip">Search <span class="px-kbd" style="position:static;opacity:1;transform:none">/</span></span></button></span>`;
  const main=TAB==='inbox'?vInbox(r):TAB==='desk'?vDesk(r):vYard(r);
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${I.sidebar}</a><a>${I.search}</a><span class="ck"><i></i></span><span class="sep"></span>${RAIL.map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='triage'?'is-on':''}">${I[k]}</a>`).join('')}<span class="sp"></span><a>${I.gear}</a><span class="px-av px-av--md px-av--me">MR</span></aside>
   <section class="tg-panel"><header class="tg-head${SRCH?' sr-on':''}"><h1>Triage</h1><span class="tg-facts">${facts}</span>${views}<span class="tg-hsep"></span>${search}<button class="px-btn px-btn--primary">${I.plus}New RO</button><div class="sr-pop">${SRCH?srPop():''}</div></header>
   <div class="tg-body ib v-${TAB}">${inboxList()}<div class="ib-main">${main}</div></div></section></div>`;
  const v=VIEWS.find(x=>x[0]===TAB);
  $('.wt-about').innerHTML=`<h2>${v[2]} view<small>Action inbox on the left, always. The header switch changes the pane on the right.</small></h2><ul>${NOTES[TAB].map(n=>`<li><b>${n[0]}</b>${n[1]}</li>`).join('')}</ul>`;
  $$('[data-tab-out]').forEach(b=>b.classList.toggle('is-on',b.dataset.tabOut===TAB));
  if(SRCH){const i=$('.tg-srch input');i.value=QV;i.focus();i.setSelectionRange(QV.length,QV.length);}}
let QV='';
function setTab(t){TAB=t;MOVE=false;TOAST='';render();}
$$('[data-tab-out]').forEach(b=>b.onclick=()=>setTab(b.dataset.tabOut));
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
let UNDO=null;
mock.addEventListener('click',e=>{const t=e.target;
  const vw=t.closest('[data-view]');if(vw){setTab(vw.dataset.view);return;}
  if(t.closest('[data-search]')){SRCH=!SRCH;QV='';render();return;}
  const mv=t.closest('[data-move]');if(mv){MOVE=mv.dataset.move==='1';TOAST='';render();return;}
  const fr=t.closest('[data-free]');if(fr){const r=get(SEL);UNDO=[r.no,r.spot];TOAST=`Moved RO-${r.no} from ${r.spot} to ${fr.dataset.free}`;r.spot=fr.dataset.free;MOVE=false;render();return;}
  if(t.closest('[data-undo]')&&UNDO){get(UNDO[0]).spot=UNDO[1];UNDO=null;TOAST='';render();return;}
  const s=t.closest('[data-sel]');if(s&&!t.closest('.px-btn')&&!MOVE){SEL=s.dataset.sel;if(s.hasAttribute('data-pick')){SRCH=false;QV='';}TOAST='';render();return;}
  const c=t.closest('[data-chip]');if(c){$$(`[data-chip="${c.dataset.chip}"]`,c.parentElement).forEach(x=>x.classList.toggle('on',x===c));}});
mock.addEventListener('input',e=>{if(e.target.matches('.tg-srch input')){QV=e.target.value;$('.sr-pop').innerHTML=srPop();}});
mock.addEventListener('mouseover',e=>{const it=e.target.closest('.i3-it');$$('.yd .i2-s.hl').forEach(x=>x.classList.remove('hl'));if(it&&TAB==='yard'){const sp=$(`.yd [data-at="${it.dataset.spot}"]`);if(sp)sp.classList.add('hl');}});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(SRCH){SRCH=false;QV='';render();}else if(MOVE){MOVE=false;render();}return;}
  if(e.key==='Enter'&&SRCH){const k=$('.sr-pop .it.k[data-sel]');if(k){SEL=k.dataset.sel;SRCH=false;QV='';render();}return;}
  if(e.target.matches('input,textarea'))return;
  if(e.key==='/'){e.preventDefault();SRCH=true;QV='';render();return;}
  const n=+e.key;if(n>=1&&n<=3)setTab(VIEWS[n-1][0]);});
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
outtabs = "".join(f'<button data-tab-out="{k}">{n}</button>' for k, n in [("inbox", "1 · Inbox"), ("desk", "2 · Desk"), ("yard", "3 · Yard")])
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage inbox</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — Action inbox</h1><div class="wt-ideas">{outtabs}</div>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
