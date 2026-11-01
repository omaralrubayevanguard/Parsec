# Parts — the 9 "more ideas" in one mock-up, built on Parts v2. One button per idea, with a spotlight note.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_parts2.py")
OUT = sys.argv[1]
src2 = open(SRC, encoding="utf-8").read()
g = {"__name__": "ptideas", "__file__": SRC}
exec(src2.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

# ---------- data ----------
rep("['23175123','Alternator 24V 130A',0,'',512.00,'D13 · 2017+',0]",
    "['23175123','Alternator 24V 130A',0,'',512.00,'D13 · 2017+',0],['20750712','PAG oil, 8 oz',12,'D2',18.90,'A/C systems',6],['21813012','Expansion valve',1,'D1',146.20,'VNL · 2018–23',1]")
rep("route:{from:'FD',at:842,why:'Priya needs it now — she’s in B6',now:1},",
    "route:{from:'PS',at:842,why:'Injector — cylinder 4',now:1,phone:1,note:'Cut-out test failed on 4. Need the injector to finish before 3.'},")
rep("['10/22 14:02','<b>Frank</b> → Parts · Priya needs the injector now']", "['10/22 14:02','<b>Priya</b> asked from her phone · injector, cylinder 4']")
rep("   {no:'37388',cust:'Elkin Hardwoods'", """   {no:'37688',cust:'Sandhills Grain',unit:'SG-5',veh:'2021 Volvo VNL 760',eng:'D13',vin:'…MN290417',spot:'B3',tech:'AW',wr:'JT',route:{from:'AW',at:851,why:'Brake chamber 30/30 — left rear',now:1,phone:1,photo:1,note:'Left rear drive chamber is cracked. One 30/30 please.'},
    ops:[{cmp:'Air leak — left rear brake chamber',parts:[pt('85134770',1)]}],log:[['10/22 14:11','<b>Andre</b> asked from his phone · brake chamber 30/30 · photo']]},
   {no:'37388',cust:'Elkin Hardwoods'""")
rep("{id:'FP-1001',kind:'warranty',", "{id:'FP-1001',claimAmt:646.80,kind:'warranty',")
rep("{id:'FP-1002',kind:'warranty',", "{id:'FP-1002',claimAmt:412.40,kind:'warranty',")
rep("ask:[],rflt:'all',rsel:null,set:{},rule:{approval:'ask',parts:'ask'}};", "ask:[],rflt:'all',rsel:null,set:{},rule:{approval:'ask',parts:'ask'},note:null,sg:{},cc:{},counted:null,so:null};")

# ---------- 1 · at the counter ----------
rep("const GROUPS=[['sent','Sent to you','inbox'],", "const GROUPS=[['counter','At the counter','user'],['sent','Sent to you','inbox'],")
rep("function grouped(){ const G={sent:[],", "function grouped(){ const G={counter:[],sent:[],")
rep("if(r.route&&!r.route.acc) return 'sent';", "if(r.route&&!r.route.acc) return r.route.now?'counter':'sent';")
rep("function why(r){ const st=stateOf(r), L=lines(r);\n  if(st==='sent')", "function why(r){ const st=stateOf(r), L=lines(r);\n  if(st==='counter') return {t:`Waiting ${NOW-r.route.at} min · ${F(r.route.from)} · ${lc(L[0].desc)}`,late:true};\n  if(st==='sent')")
rep("const BTN={sent:", "const BTN={counter:r=>(cat(lines(r)[0].pn)||{}).oh?'Pull it':'Order…',sent:")
rep("<span class=\"tg-gi${st==='sent'&&r.route.now?' now':''}\">", "<span class=\"tg-gi${st==='counter'?' now':''}\">")
rep("class=\"btn btn-sm${st==='sent'&&r.route.now?' btn-primary':''} tg-go\"", "class=\"btn btn-sm${st==='counter'?' btn-primary':''} tg-go\"")
rep("if(st==='sent'){ snap(); r.route.acc=1;", "if(st==='sent'||st==='counter'){ snap(); r.route.acc=1;")
rep("  if(st==='sent') return r.route.now?bar(", "  if(st==='counter'){ const c=cat(L[0].pn); return bar(`${F(r.tech)} is at ${r.spot}, waiting ${NOW-r.route.at} min for the ${lc(L[0].desc)} — ${c.oh?`${c.oh} on the shelf, bin ${c.bin}`:'none on the shelf'}.`,c.oh?'Pull it':'Order…','do'); }\n  if(st==='sent') return r.route.now?bar(")
rep("<span class=\"tg-hf\" style=\"cursor:default\"><b>${usd0(amt)}</b>on order</span>", "")
rep("${f('sent',G.sent.length,'sent to you')}", "${f('counter',G.counter.length,'at the counter',true)}${f('sent',G.sent.length,'sent to you')}")
rep("<div class=\"pt-pad\">${nextBar(r)}", "<div class=\"pt-pad\">${nextBar(r)}${extraCards(r)}")
rep("if(!b){ b=BINS.find(z=>!used.has(z))||'A8'; used.add(b); x.r._b=b; }", "if(!b&&sel[x.p.id]){ b=BINS.find(z=>!used.has(z))||'A8'; used.add(b); x.r._b=b; }")
rep("<div class=\"pt-scan\">${ic('scan',16)}<input id=\"pt-scan\" placeholder=\"Scan or type a part #\" value=\"${esc(p.q||'')}\" autocomplete=\"off\"><small>${kbd('↵')} ticks it</small></div>", "${chkHead(p)}")

# ---------- the helpers for every idea ----------
JS = JS.replace("function kitPrice(k){", r"""const SUGG={'37750':[['20750712',1,4],['21813012',1,3]]};
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
function kitPrice(k){""", 1)
rep("    ${wait.length?`<div class=\"pt-tg\" style=\"padding-top:0;color:var(--tg-warn)\">Waiting for a bin", "    ${upNext()}${wait.length?`<div class=\"pt-tg\" style=\"color:var(--tg-warn)\">Waiting for a bin")
rep("<div class=\"pt-cbar\"><input id=\"pt-cq\"", "${stockCards()}<div class=\"pt-cbar\"><input id=\"pt-cq\"")
rep("<div class=\"pt-sum\"><span><b>${rows.length}</b>parts on order</span>", "${orderCards()}<div class=\"pt-sum\"><span><b>${rows.length}</b>parts on order</span>")
rep("<div class=\"pt-tbl\"><div class=\"pt-rr h\"><span>Tag</span>", "${riskCard()}<div class=\"pt-tbl\"><div class=\"pt-rr h\"><span>Tag</span>")

# ---------- 5 · bin labels ----------
rep("<span class=\"sp\"></span><button class=\"btn btn-sm pt-pk\" data-a=\"pickup\"", "<span class=\"sp\"></span><button class=\"btn btn-sm ib pt-pk pt-lb\" data-a=\"pop\" data-p=\"label\" data-bin=\"${x.b}\" title=\"Bin label\">${ic('scan',13)}</button><button class=\"btn btn-sm pt-pk\" data-a=\"pickup\"")
rep("if(t.dataset.tid) ex.tid=t.dataset.tid;", "if(t.dataset.tid) ex.tid=t.dataset.tid; if(t.dataset.bin) ex.bin=t.dataset.bin;")
rep("  if(p.type==='send'){", r"""  if(p.type==='label'){ const X=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).filter(x=>x.q.st==='Staged'&&x.q.bin===p.bin); if(!X.length) return ''; const rr=X[0].r;
    return `<div class="tg-pop xf pt-pop-w pt-label" ${st}>${hd('Bin label',`${p.bin} · ${rr.no}`)}<div class="pt-lab"><div class="t"><b>${p.bin}</b><span><b>${rr.no} · ${esc(rr.cust)}</b><small>${esc(PPL[rr.tech])} · Unit ${esc(rr.unit)} · staged ${hm(Math.max(...X.map(x=>x.q.rcv||0)))}</small></span></div>${barcode('BIN-'+p.bin+'-'+rr.no)}<div class="ls">${X.map(x=>`<div><span>${x.q.qty} ×</span>${esc(x.q.desc)}<em>${x.q.pn}</em></div>`).join('')}</div><div class="f">Scan with the Parsec phone app to pick up</div></div>
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="scanpk" data-bin="${p.bin}">${ic('scan',14)}Try it — ${F(rr.tech)} scans it</button><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="toast" data-t="Label prints — 4 × 2 in, one per bin.">${ic('print',14)}Print${kbd('↵')}</button></div></div>`; }
  if(p.type==='send'){""")

# ---------- 6 · packing slip ----------
rep("    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }", "    if(k==='Enter'&&e.target.tagName==='TEXTAREA') return;\n    if(k==='Enter'){ $('.tg-pop .btn-primary:not([disabled])')?.click(); return stop(); }")
rep("snap(); const done=new Set();", "snap(); const done=new Set(); const SL=p.mode==='slip'?parseSlip(p.slip||'').filter(x=>x.stock):[]; SL.forEach(x=>{ x.stock.oh+=x.q; });")
rep("checked in${p.stage!==false?' and staged':' — waiting at receiving'}.`);", "checked in${p.stage!==false?' and staged':' — waiting at receiving'}${SL.length?` · ${SL.map(x=>'+'+x.q+' '+x.stock.desc.toLowerCase()+'s').join(', ')} to stock`:''}.`);")

# ---------- actions ----------
rep("  else if(a==='cflt'){", r"""  else if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }
  else if(a==='sgadd'||a==='sgall'){ const rr=get(t.dataset.ro); snap(); const L=(SUGG[rr.no]||[]).filter(x=>!lines(rr).some(q=>q.pn===x[0])&&(a==='sgall'||x[0]===t.dataset.pn)); L.forEach(x=>{ rr.ops[0].parts.push(pt(x[0],x[1])); }); logIt(rr,`Added from past jobs · ${L.map(x=>cat(x[0]).desc).join(', ')}`); toast(`Added ${L.map(x=>cat(x[0]).desc).join(' and ')} — ${L.length>1?'they go':'it goes'} on the same order.`); render(); }
  else if(a==='sgno'){ U.sg[t.dataset.ro]=1; toast('Hidden for this RO.',false); render(); }
  else if(a==='pullahead'){ const rr=get(t.dataset.ro); snap(); const L=lines(rr).filter(p=>p.st==='Not Ordered'&&(cat(p.pn)||{}).oh>=p.qty), b=binOf(rr)||nextBin(); L.forEach(p=>{ cat(p.pn).oh-=p.qty; Object.assign(p,{st:'Staged',sup:'stock',bin:b,rcv:NOW}); }); logIt(rr,`Pulled ahead for ${t.dataset.bay} · ${L.map(p=>p.desc).join(', ')} · bin ${b}`); const left=lines(rr).filter(p=>p.st==='Not Ordered'); toast(`Pulled ${L.length} to ${b} for ${t.dataset.bay}${left.length?` — the ${lc(left[0].desc)} still needs ordering`:''}.`); render(); }
  else if(a==='sosend'){ U.so=hm(NOW); toast(`Stock order sent to Volvo PDC — ${S.C.filter(c=>c.min&&c.oh<c.min).length} lines, due Mon 10/26.`,false); render(); }
  else if(a==='ccsave'){ const ch=[]; S.C.forEach(c=>{ const v=U.cc[c.pn]; if(v!==''&&v!=null&&+v!==c.oh){ ch.push(`${c.desc.toLowerCase()} ${c.oh} → ${+v}`); c.oh=+v; } }); U.counted=hm(NOW); toast(ch.length?`Shelf F counted — ${ch.join(', ')}. On hand fixed.`:'Shelf F counted — everything matches.',false); render(); }
  else if(a==='scanpk'){ const b=t.dataset.bin, X=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).filter(x=>x.q.st==='Staged'&&x.q.bin===b); if(!X.length) return; snap(); X.forEach(x=>Object.assign(x.q,{st:'Picked up',pk:NOW,bin:''})); const rr=X[0].r; logIt(rr,`<b>${F(rr.tech)}</b> scanned bin ${b} · ${X.length} part${X.length>1?'s':''} picked up`); U.pop=null; toast(`${F(rr.tech)} scanned ${b} — ${X.length} part${X.length>1?'s':''} picked up at ${hm(NOW)}.`); render(); }
  else if(a==='cmode'){ p.mode=t.dataset.v; p._f=0; if(p.mode==='slip'&&p.slip) slipSel(p); render(); }
  else if(a==='cflt'){""")
rep("  if(e.target.dataset.set){", r"""  if(e.target.dataset.cc){ const pn=e.target.dataset.cc, c=cat(pn), v=e.target.value; U.cc[pn]=v; const s=e.target.nextElementSibling; if(s){ const d=v===''?null:(+v-c.oh); s.textContent=d==null?'':d===0?'matches':(d>0?'+':'')+d; s.className='dv'+(d==null?'':d?' off':' ok'); } return; }
  if(id==='pt-slip'&&p){ p.slip=e.target.value; slipSel(p); const pos=e.target.selectionStart; render(); const f=$('#pt-slip'); if(f){ f.focus(); f.setSelectionRange(pos,pos); } return; }
  if(e.target.dataset.set){""")
rep("mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; tip.hidden=true; });",
    "mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip'); if(!tip) return; const h=e.target.closest('[data-tip]'); if(!h){ tip.hidden=true; return; } const tk=$('.pt').getBoundingClientRect(), [t1,t2]=h.dataset.tip.split('|'); tip.innerHTML=`<b>${esc(t1)}</b>${t2?`<small>${esc(t2)}</small>`:''}`; tip.hidden=false; tip.style.left=Math.min((e.clientX-tk.left)/scale+14,tk.width/scale-290)+'px'; tip.style.top=((e.clientY-tk.top)/scale+16)+'px'; });")
rep("[data-a=\"rdo\"]')){", "[data-a=\"rdo\"],.tk-note')){")
rep("if(U.pop&&!U.pop._f){ const f=$('.tg-pop #pt-scan')||", "if(U.pop&&!U.pop._f){ const f=$('.tg-pop #pt-slip')||$('.tg-pop #pt-scan')||")

rep("Send both to Frank</button>`", "${L.length===2?'Send both':'Send all '+L.length} to Frank</button>`")
# ---------- the spotlight notes ----------
rep("<div class=\"tk-tip\" hidden></div></div>${TOAST?", "<div class=\"tk-tip\" hidden></div><div class=\"tk-ring\" hidden></div><div class=\"tk-note\" hidden></div></div>${TOAST?")
rep("if(f.id==='pt-hn') f.select(); } }\n}", r"""if(f.id==='pt-hn') f.select(); } }
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
  nt.style.left=Math.round(Math.max(12,Math.min(x,W-nw-12)))+'px'; nt.style.top=Math.round(Math.max(12,Math.min(y,H-nh-12)))+'px'; }""")

i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const DEMO={
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
};""" + JS[j:]

CSS += r"""
/* ===== the 9 ideas ===== */
.pt .tg-facts > i:last-child{display:none;}
.tk-tip{position:absolute;z-index:30;max-width:280px;padding:8px 10px;border-radius:9px;background:var(--tg-raised);box-shadow:var(--tg-sh-raised);font-size:12px;line-height:17px;color:var(--tg-ink);pointer-events:none;}
.tk-tip b{font-weight:600;} .tk-tip small{display:block;color:var(--tg-ink3);}
.tk-ring{position:absolute;z-index:38;border-radius:12px;box-shadow:0 0 0 2px var(--tg-acc),0 0 0 7px color-mix(in srgb,var(--tg-acc) 22%,transparent);pointer-events:none;}
.tk-note{position:absolute;z-index:45;width:300px;padding:11px 13px 13px;border-radius:12px;background:var(--tg-ink);color:var(--tg-panel);box-shadow:0 16px 40px -10px rgba(0,0,0,.45);font-size:12.5px;line-height:18px;}
.tk-note .h{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.tk-note .n{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--tg-acc);color:#fff;font:600 11px/1 var(--tg-sans);flex:none;}
.tk-note b{font-size:13px;font-weight:600;}
.tk-note p{margin:0;color:color-mix(in srgb,var(--tg-panel) 80%,transparent);}
.tk-note button{all:unset;cursor:pointer;margin-left:auto;display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;opacity:.7;} .tk-note button:hover{opacity:1;background:rgba(128,128,128,.25);}
/* 1 · the counter */
.pt-msg{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.pt-msg .bd{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;}
.pt-msg .hd{display:flex;align-items:center;gap:8px;font-size:13px;} .pt-msg .hd b{font-weight:600;} .pt-msg .hd > span:nth-child(2){color:var(--tg-ink3);font-size:12px;}
.pt-msg p{margin:0;padding:9px 12px;border-radius:12px;background:var(--tg-canvas);font-size:13.5px;line-height:20px;}
.pt-photo{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;padding:4px 10px 4px 4px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--tg-hair);font-size:12px;color:var(--tg-ink2);}
.pt-photo i{width:46px;height:34px;border-radius:7px;background:linear-gradient(135deg,#6b6f74,#3c3f43 60%,#8a5a2b);}
.pt-msg .mt{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--tg-good);} .pt-msg .mt b{font-weight:500;color:var(--tg-ink);}
/* 2 · up next */
.pt-up{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px;}
.pt-upc{padding:11px 13px;border-radius:14px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);display:flex;flex-direction:column;gap:6px;}
.pt-upc .k{display:flex;align-items:center;gap:7px;font-size:12.5px;} .pt-upc .k b{font:600 12.5px/1 var(--tg-mono);} .pt-upc .k .sp{flex:1;}
.pt-upc .k em{font-style:normal;font-size:11.5px;font-weight:500;color:var(--tg-ink3);} .pt-upc .k em.warn{color:var(--tg-warn);} .pt-upc .k em.ok{color:var(--tg-good);}
.pt-upc .t{display:flex;align-items:center;gap:7px;font-size:13.5px;min-width:0;} .pt-upc .t b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-upc .w{display:flex;align-items:center;gap:7px;min-height:28px;font-size:12px;color:var(--tg-ink3);} .pt-upc .w .sp{flex:1;}
/* 3 · suggestions */
.pt-sug{border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-accl);overflow:hidden;}
.pt-sug .h{display:flex;align-items:center;gap:8px;padding:10px 12px 10px 16px;background:var(--tg-acct);font-size:13px;} .pt-sug .h .tg-ic{color:var(--tg-acctx);} .pt-sug .h b{font-weight:600;} .pt-sug .h small{font-size:12px;color:var(--tg-ink3);} .pt-sug .h .sp{flex:1;}
.pt-sug .r{display:grid;grid-template-columns:minmax(0,1fr) 90px 80px 120px 78px auto;gap:12px;align-items:center;min-height:48px;padding:4px 16px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;}
.pt-sug .d{display:flex;flex-direction:column;gap:2px;min-width:0;} .pt-sug .d b{font-weight:500;} .pt-sug .d small{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);}
.pt-sug .u{position:relative;height:6px;border-radius:3px;background:var(--tg-hair);overflow:hidden;} .pt-sug .u i{position:absolute;left:0;top:0;bottom:0;background:var(--tg-acc);border-radius:3px;}
.pt-sug .uc,.pt-sug .s{font-size:12px;color:var(--tg-ink3);white-space:nowrap;} .pt-sug .pr{font:500 12.5px/1 var(--tg-mono);text-align:right;}
/* 4 · stock order + count */
.pt-cgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px;align-items:start;}
.pt-cgrid > .pt-tbl{margin:0;padding:12px 16px 10px;}
.pt-ch{display:flex;align-items:center;gap:10px;margin-bottom:4px;min-height:28px;} .pt-ch b{font-size:13.5px;font-weight:600;white-space:nowrap;} .pt-ch small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pt-ch .sp{flex:1;}
.pt-rl{display:grid;grid-template-columns:minmax(0,1fr) 92px 64px 78px;gap:12px;align-items:center;min-height:38px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;}
.pt-rl.h{min-height:26px;font-size:11.5px;color:var(--tg-ink3);box-shadow:none;}
.pt-rl .d{display:flex;flex-direction:column;gap:1px;min-width:0;} .pt-rl .d b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pt-rl .d small{font:500 11.5px/1.3 var(--tg-mono);color:var(--tg-ink3);}
.pt-rl .oh,.pt-rl .q{font:500 12.5px/1 var(--tg-mono);text-align:right;} .pt-rl .oh.low{color:var(--tg-warn);} .pt-rl .q{color:var(--tg-good);}
.pt-rl .m{font:500 12.5px/1 var(--tg-mono);} .pt-rl .r{text-align:right;}
.pt-ccin{width:64px !important;height:28px !important;text-align:right;font-family:var(--tg-mono) !important;justify-self:end;}
.pt-rl .dv{font-size:12px;text-align:right;} .pt-rl .dv.ok{color:var(--tg-good);} .pt-rl .dv.off{color:var(--tg-warn);font-weight:600;}
.pt-cf{display:flex;align-items:center;gap:6px;padding:8px 0 2px;font-size:12px;color:var(--tg-ink3);box-shadow:inset 0 1px 0 var(--tg-hair);}
/* 5 · bin label */
.pt-bin .pt-lb{width:24px !important;padding:0 !important;justify-content:center;}
.pt-lab{margin:2px 0 4px;padding:14px 16px 12px;border-radius:8px;background:#fff;color:#1d1c1a;box-shadow:0 1px 3px rgba(0,0,0,.12),inset 0 0 0 1px #e4dfd4;}
.pt-lab .t{display:flex;gap:14px;align-items:center;padding-bottom:10px;border-bottom:1.5px solid #1d1c1a;}
.pt-lab .t > b{font:600 34px/1 var(--tg-mono);letter-spacing:-.02em;}
.pt-lab .t span{display:flex;flex-direction:column;gap:2px;min-width:0;} .pt-lab .t span b{font:600 14px/18px var(--tg-sans);} .pt-lab .t span small{font-size:11.5px;color:#67625a;}
.pt-bc{display:block;width:100%;height:46px;margin:10px 0 2px;fill:#1d1c1a;}
.pt-bct{font:500 10.5px/1 var(--tg-mono);letter-spacing:.12em;text-align:center;color:#3a3833;}
.pt-lab .ls{margin-top:10px;display:flex;flex-direction:column;gap:3px;font-size:12px;}
.pt-lab .ls div{display:flex;gap:8px;} .pt-lab .ls span{font:600 12px/1.4 var(--tg-mono);} .pt-lab .ls em{margin-left:auto;font:500 11.5px/1.4 var(--tg-mono);font-style:normal;color:#67625a;}
.pt-lab .f{margin-top:10px;font-size:10.5px;color:#8f897c;}
/* 6 · packing slip */
.pt-mode{margin:-2px 0 8px;}
.pt-slip{width:100%;height:118px;resize:none;font:500 11.5px/17px var(--tg-mono) !important;white-space:pre;}
.pt-slr{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 2px;font-size:11.5px;}
.pt-slr b{width:100%;font-size:12px;font-weight:600;color:var(--tg-ink);}
.pt-slr span{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 7px;border-radius:6px;font:500 11.5px/1 var(--tg-mono);}
.pt-slr .ok{background:var(--tg-good-t);color:var(--tg-good);} .pt-slr .stk{background:var(--tg-acct);color:var(--tg-acctx);} .pt-slr .no{background:var(--tg-bad-t);color:var(--tg-bad);}
/* 7 · scorecard */
.pt-scr{display:grid;grid-template-columns:132px minmax(0,1fr) 44px 92px 64px 72px;gap:12px;align-items:center;min-height:38px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;}
.pt-scr .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-scr .bar{position:relative;height:8px;border-radius:4px;background:var(--tg-hair);overflow:hidden;} .pt-scr .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:var(--tg-ink2);}
.pt-scr > b{font:600 12.5px/1 var(--tg-mono);text-align:right;} .pt-scr .m{font-size:12px;color:var(--tg-ink3);white-space:nowrap;} .pt-scr .ln{font-size:12px;color:var(--tg-warn);font-weight:500;white-space:nowrap;}
/* 9 · bays held */
.pt-bayb{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end;}
.pt-bh{display:flex;align-items:center;gap:8px;min-height:36px;font-size:12.5px;box-shadow:inset 0 1px 0 var(--tg-hair);} .pt-bh b{font:600 13px/1 var(--tg-mono);color:var(--tg-warn);} .pt-bh span:last-child{color:var(--tg-ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-bayb .tot{display:flex;align-items:baseline;gap:8px;padding-top:10px;font-size:12px;color:var(--tg-ink3);} .pt-bayb .tot b{font:500 24px/1 var(--tg-serif);color:var(--tg-ink);}
.pt-cols{display:flex;align-items:flex-end;gap:8px;height:104px;padding-bottom:2px;}
.pt-cols .c{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;width:30px;height:100%;}
.pt-cols .c i{display:block;width:18px;border-radius:4px 4px 0 0;background:var(--tg-ink2);}
.pt-cols .c i.cur{background:repeating-linear-gradient(135deg,var(--tg-ink2) 0 3px,transparent 3px 6px);box-shadow:inset 0 0 0 1.5px var(--tg-ink2);}
.pt-cols .c .v{font:600 11.5px/1 var(--tg-mono);color:var(--tg-ink2);} .pt-cols .c small{font:500 10.5px/1 var(--tg-mono);color:var(--tg-ink4);}
/* 8 · money at risk */
.pt-risk{margin-bottom:14px !important;padding:12px 16px 8px !important;}
.pt-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:6px 0 8px;}
.pt-tiles div{padding:10px 12px;border-radius:12px;background:var(--tg-fill);} .pt-tiles div.warn{background:var(--tg-warn-t);}
.pt-tiles small{display:block;font-size:12px;color:var(--tg-ink3);} .pt-tiles b{font:500 22px/30px var(--tg-serif);letter-spacing:-.01em;} .pt-tiles div.warn b,.pt-tiles div.warn small{color:var(--tg-warn);}
.pt-rk{display:grid;grid-template-columns:84px 70px minmax(0,1fr) 90px 116px;gap:12px;align-items:center;min-height:44px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;}
.pt-rk .dt{font-size:12.5px;color:var(--tg-ink2);white-space:nowrap;} .pt-rk .dt.late{color:var(--tg-warn);font-weight:500;}
.pt-rk .m{font:500 12.5px/1 var(--tg-mono);} .pt-rk .r{text-align:right;} .pt-rk .btn{justify-self:end;}
.pt-rk .d{display:flex;flex-direction:column;gap:2px;min-width:0;} .pt-rk .d b{font-weight:500;} .pt-rk .d small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
"""

used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "cart", "clock", "check", "undo", "box", "inbox2", "truck", "shelf", "book", "user", "x", "file"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("d1", "1 · Counter"), ("d2", "2 · Pull ahead"), ("d3", "3 · Suggested parts"), ("d4", "4 · Reorder · count"), ("d5", "5 · Bin labels"), ("d6", "6 · Packing slip"), ("d7", "7 · Suppliers"), ("d8", "8 · Money at risk"), ("d9", "9 · Bays held"), ("try", "Try it")])
about = [
 ("1 · At the counter", "Techs ask from the Console or phone — part, bay, photo — with a wait timer."),
 ("2 · Pull ahead", "Frank’s Up next list: pull shelf parts to a bin before the bay frees up."),
 ("3 · Suggested parts", "Parts that came up on past jobs like this one, shared with the writer’s estimate."),
 ("4 · Reorder · count", "Low stock joins the next stock order by itself; one shelf counted a day."),
 ("5 · Bin labels", "A barcode on every bin; the tech scans it on pickup."),
 ("6 · Packing slip", "Paste or drop it; matching lines tick themselves, the rest goes to stock."),
 ("7 · Suppliers", "On-time %, days late, lines — last 90 days."),
 ("8 · Money at risk", "Credits and claims that depend on a part going back, by due date."),
 ("9 · Bays held", "Days a bay waits on a part — also on Foreman and Manager."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Parts ideas</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Parts — more ideas</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Parts ideas<small>Each button opens the moment that idea shows. Built on Parts v2. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
