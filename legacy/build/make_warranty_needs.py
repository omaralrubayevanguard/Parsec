# Warranty — group 2: Needs action, what the warranty admin works from.
# Deadlines on Ready to file and Returned, ask the tech for a missing story, Waiting on Volvo,
# failed parts due, not paid yet, and a settings popover for the windows.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_warranty.py")
src = open(SRC).read()

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:90], c)
    src = src.replace(a, b)

# ---------- data ----------
rep("tech:'LM',opened:9,spot:'Lot D1',", "tech:'LM',opened:29,spot:'Lot D1',")
rep("q:2.4,b:2.6,cost:812.30,done:6,st:'ready'", "q:2.4,b:2.6,cost:812.30,done:27,st:'ready'")
rep("tech:'LM',opened:5,spot:'B6',", "tech:'LM',opened:5,spot:'B6',vol:{kind:'ts',no:'TS-31422',at:2,what:'EGR valve sticking at 40% — asked Volvo for the next step'},")
rep("tech:'MR',opened:1,spot:'B3',", "tech:'MR',opened:1,spot:'B3',vol:{kind:'pre',at:0.25,what:'Turbo actuator, $1,940 — over the pre-approval limit'},")
rep("parts:[['Water pump','21468475',1,412.00,'Installed']],q:3.0,b:3.1,cost:1287.27",
    "parts:[['Water pump','21468475',1,412.00,'Installed',{tag:'FP-0398',shelf:'W1',ret:{ra:'88213',by:5}}]],q:3.0,b:3.1,cost:1287.27")
rep("parts:[['DPF pressure sensor','22303390',1,212.60,'Installed'],",
    "parts:[['DPF pressure sensor','22303390',1,212.60,'Installed',{tag:'FP-0405',shelf:'W2',keep:1}],")
rep("parts:[['Water pump','21468475',1,412.00,'Installed'],['Water pump gasket'",
    "parts:[['Water pump','21468475',1,412.00,'Installed',{tag:'FP-0412',shelf:'W3',keep:21}],['Water pump gasket'")
rep(" {no:'37620',cust:'Northline Transport'", """ {no:'37733',cust:'Haw River Dairy',unit:'T-160',truck:'2021 Volvo VNL 760',eng:'D13 TC 455HP',vin:'4V4NC9EH0MN288127',mi:'201,300',eh:'5,902',ws:'10-11-2020',cs:'C-9151',tech:'LM',opened:3,spot:'Lot E3',
  ops:[op({cmp:'Air dryer purge valve leaking',cause:'Purge valve stuck open; cartridge saturated.',fix:'',parts:[['Air dryer cartridge','21620181',1,96.75,'Installed'],['Purge valve','20867321',1,142.30,'Installed']],q:1.2,b:1.1,cost:470.05,done:1,st:'ready',claim:{code:''}})]},
 {no:'37688',cust:'Sandhills Grain',unit:'T-409',truck:'2020 Volvo VNR 640',eng:'D11 425HP',vin:'4V4WC9EG8LN241906',mi:'287,700',eh:'8,215',ws:'02-03-2020',cs:'C-9133',tech:'KT',opened:4,spot:'Lot E5',
  ops:[op({cmp:'Coolant level sensor — false low warning',cause:'',fix:'Replaced coolant level sensor, warning cleared on the drive.',parts:[['Coolant level sensor','22430542',1,88.40,'Installed']],q:0.8,b:0.7,cost:235.40,done:2,st:'ready',ask:{who:'KT',at:0.21,what:['cause']},claim:{code:'SPN 111 FMI 1'}})]},
 {no:'37620',cust:'Northline Transport'""")

# ---------- settings + deadlines ----------
rep("let S,U,UNDO,TOAST,TT;", """let S,U,UNDO,TOAST,TT;
const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30};
/* a date `n` days from today (Thu 10/22) */
const byTxt=n=>{ if(n<0) return Math.abs(n)===1?'yesterday':Math.abs(n)+' d ago'; if(n===0) return 'today'; if(n===1) return 'tomorrow'; const d=new Date(2026,9,22); d.setDate(d.getDate()+n); return (n<7?DAYN[d.getDay()]+' ':'')+(d.getMonth()+1)+'/'+d.getDate(); };
const dueChip=n=>`<span class="wx-due${n<=3?' late':n<=7?' soon':''}">${n<0?'overdue':n===0?'due today':n+' d left'}</span>`;
const fileLeft=o=>Math.round(S.cfg.file-o.done), resubLeft=o=>Math.round(S.cfg.resub-o.claim.at);
const storyGaps=o=>[!o.cause&&'cause',!o.fix&&'correction',!(o.b>0)&&'labor'].filter(Boolean);
const hrs=a=>a*24;""")
rep("function reset(){S={R:JSON.parse(JSON.stringify(R0)),CL:JSON.parse(JSON.stringify(CL0))};",
    "function reset(){S={R:JSON.parse(JSON.stringify(R0)),CL:JSON.parse(JSON.stringify(CL0)),cfg:Object.assign({},CFG0)};")

# ---------- the list ----------
rep("const GROUPS=[['sent','Sent to you'],['back','Returned'],['ready','Ready to file'],['paid','Approved, not paid'],['watch','No answer yet']];",
    "const GROUPS=[['sent','Sent to you'],['back','Returned'],['ready','Ready to file'],['tech','Needs the tech'],['volvo','Waiting on Volvo'],['part','Failed parts'],['paid','Not paid yet']];")
i = src.index("function needsAll(){ const out=[];"); j = src.index("  return out; }", i) + len("  return out; }")
src = src[:i] + r"""function needsAll(){ const out=[], C=S.cfg;
  S.R.forEach(r=>{
    const add=(x)=>out.push(Object.assign({ro:r},x));
    if(r.sent){ add({g:'sent',ic:'inbox2',why:r.sent.note,btn:'Accept',act:'accept',late:hrs(r.sent.at)>C.ts}); return; }
    const back=r.ops.find(o=>o.st==='returned'); if(back){ const n=resubLeft(back); add({op:r.ops.indexOf(back),g:'back',ic:'undo',due:n,why:`Resubmit by ${byTxt(n)} · ${back.claim.why}`,btn:'Fix',act:'fix',late:n<=3}); return; }
    const rd=r.ops.filter(o=>o.st==='ready').sort((a,b)=>b.done-a.done);
    if(rd.length){ const o=rd[0], k=r.ops.indexOf(o), sg=storyGaps(o), n=fileLeft(o);
      if(sg.length&&o.ask){ const h=hrs(o.ask.at); add({op:k,g:'tech',ic:'chat',due:n,why:`${o.ask.n?'Nudged':'Asked'} ${TF(o.ask.who)} ${h<1?'just now':Math.round(h)+' h ago'} for the ${o.ask.what.join(' and ')} · not written yet`,btn:'Nudge',act:'nudge',late:h>=C.ask}); return; }
      if(sg.length){ add({op:k,g:'tech',ic:'chat',due:n,why:`${sg.map(x=>x[0].toUpperCase()+x.slice(1)).join(' and ')} not written · ${TF(r.tech)} finished it ${when(o.done)}`,btn:'Ask '+TF(r.tech),act:'ask',late:n<=3}); return; }
      const g=gaps(r,o); add({op:k,g:'ready',ic:'file',due:n,why:`File by ${byTxt(n)} · finished ${when(o.done)} · ${usd(amtOf(o))}`+(g.length?` · missing ${g.map(x=>x[0].toLowerCase()).join(', ')}`:''),btn:'File',act:'file',late:n<=3}); return; }
    if(r.vol){ const v=r.vol, h=hrs(v.at), lim=v.kind==='ts'?C.ts:C.pre; if(h>=lim*0.75){ add({g:'volvo',ic:'phone',why:`${v.kind==='ts'?'Tech support case '+v.no:'Pre-approval'} · ${v.kind==='ts'?'open '+ago(v.at):'asked '+Math.round(h)+' h ago'} · no answer`,btn:'Follow up',act:'follow',late:h>=lim}); return; } }
    const sb=r.ops.find(o=>o.st==='submitted'&&o.claim.at>=C.claim); if(sb){ add({op:r.ops.indexOf(sb),g:'volvo',ic:'phone',why:`Claim ${sb.claim.no} filed ${ago(sb.claim.at)} ago · no answer`,btn:'Follow up',act:'follow',late:true}); return; }
    let fp=null; r.ops.forEach((o,k)=>o.parts.forEach((p,jj)=>{ const f=p[5]; if(!f||f.done) return; const n=f.ret?f.ret.by:f.keep; if(n<=7&&(!fp||n<fp.n)) fp={o,k,p,f,n,jj}; }));
    if(fp){ add({op:fp.k,pj:fp.jj,g:'part',ic:'parts',due:fp.n,why:fp.f.ret?`Volvo wants the ${fp.p[0].toLowerCase()} back · ship by ${byTxt(fp.n)} · RA ${fp.f.ret.ra}`:`${fp.p[0]} · ${C.keep} days are up ${byTxt(fp.n)} · tag ${fp.f.tag}`,btn:fp.f.ret?'Ship…':'Done holding…',act:'part',late:fp.n<=2}); return; }
    const ap=r.ops.find(o=>o.st==='approved'&&o.claim.at>=C.paid); if(ap){ add({op:r.ops.indexOf(ap),g:'paid',ic:'dollar',why:`Approved ${ago(ap.claim.at)} ago · ${usd(amtOf(ap))} not paid`,btn:'Paid…',act:'paid',late:ap.claim.at>=C.paid+5}); }
  });
  return out; }""" + src[j:]
rep("function match(x){ const f=U.filt; if(!f) return true;", "function match(x){ const f=U.filt; if(!f) return true; if(f==='due') return x.due!=null&&x.due<=7;")
rep("GROUPS.forEach(g=>G[g[0]].sort((a,b)=>(b.late?1:0)-(a.late?1:0)));", "GROUPS.forEach(g=>G[g[0]].sort((a,b)=>(a.due!=null&&b.due!=null?a.due-b.due:0)||(b.late?1:0)-(a.late?1:0)));")
# the due chip sits in the item's title row
rep("${r.ops.length>1&&x.op!=null?`<span class=\"tg-spot\">op ${x.op+1}</span>`:''}</span>",
    "${r.ops.length>1&&x.op!=null?`<span class=\"tg-spot\">op ${x.op+1}</span>`:''}${x.due!=null&&(x.due<=7||x.g==='back'||x.g==='part')?dueChip(x.due):''}</span>")
rep("x.act==='file'||x.act==='fix'?' btn-primary':''} tg-go", "x.act==='file'||x.act==='fix'||x.act==='ask'?' btn-primary':''} tg-go")
rep("({ready:'Ready to file',back:'Returned',late:'Late'})[U.filt]", "({ready:'Ready to file',back:'Returned',late:'Late',due:'Due this week'})[U.filt]")
rep("U.filt==='late'||U.filt==='back'?' w':''", "U.filt==='late'||U.filt==='back'||U.filt==='due'?' w':''")

# ---------- header: due this week + settings ----------
rep("const all=needsAll(), late=all.filter(x=>x.late).length,", "const all=needsAll(), late=all.filter(x=>x.late).length, due=all.filter(x=>x.due!=null&&x.due<=7).length,")
rep("${f('back',back,'returned',back>0)}<i>·</i>", "${f('back',back,'returned',back>0)}<i>·</i>${f('due',due,'due this week',due>0)}<i>·</i>")
rep('<span class="tg-hsep"></span>${sr}', '<span class="tg-hsep"></span>${sr}<button class="btn ib" data-a="cfg" title="Warranty settings">${ic(\'gear\',16)}</button>')

# ---------- claim card: due, ask the tech, Volvo, failed parts ----------
rep("""<h3>${esc(o.cmp)}</h3><span class="os">""", """<h3>${esc(o.cmp)}</h3>${s==='ready'?`<span class="wx-by">File by ${byTxt(fileLeft(o))}</span>${dueChip(fileLeft(o))}`:s==='returned'?`<span class="wx-by">Resubmit by ${byTxt(resubLeft(o))}</span>${dueChip(resubLeft(o))}`:''}<span class="os">""")
rep("""<dt>Cause</dt><dd class="${o.cause?'':'miss'}">${o.cause?esc(o.cause):'Not written yet'}</dd><dt>Correction</dt><dd class="${o.fix?'':'miss'}">${o.fix?esc(o.fix):'Not written yet'}</dd></dl>""",
    """<dt>Cause</dt><dd class="${o.cause?'':'miss'}">${o.cause?esc(o.cause):'Not written yet'+askBtn(r,o,i)}</dd><dt>Correction</dt><dd class="${o.fix?'':'miss'}">${o.fix?esc(o.fix):'Not written yet'+askBtn(r,o,i)}</dd></dl>
     ${o.ask?`<div class="wx-line ask">${ic('chat',14)}<span>Waiting on <b>${esc(TF(o.ask.who))}</b> · asked ${hrs(o.ask.at)<1?'just now':Math.round(hrs(o.ask.at))+' h ago'} for the ${esc(o.ask.what.join(' and '))} · it’s on ${TF(o.ask.who)}’s Console</span><button class="btn btn-sm" data-a="nudge" data-ro="${r.no}" data-op="${i}">Nudge</button></div>`:''}""")
rep("""<span class="q">×${p[2]} · ${usd(p[3])}</span></div>`).join('')}</div>`:''}""",
    """<span class="q">×${p[2]} · ${usd(p[3])}</span></div>${p[5]?`<div class="wx-fp">${ic('parts',12)}Failed part · tag <b>${esc(p[5].tag)}</b> · shelf ${esc(p[5].shelf)} · ${p[5].done?esc(p[5].done):p[5].ret?`Volvo wants it back — ship by ${byTxt(p[5].ret.by)} · RA ${esc(p[5].ret.ra)}`:`keep until ${byTxt(p[5].keep)}`}</div>`:''}`).join('')}</div>`:''}
     ${r.vol&&i===0?`<div class="wx-line vol">${ic('phone',14)}<span>${r.vol.kind==='ts'?`Tech support case <b>${esc(r.vol.no)}</b> · open ${ago(r.vol.at)}`:`Pre-approval asked <b>${Math.round(hrs(r.vol.at))} h ago</b>`} · ${esc(r.vol.what)}</span><button class="btn btn-sm" data-a="pop" data-p="follow" data-ro="${r.no}" data-op="0">Follow up</button></div>`:''}""")
rep("function opCard(r,o,i){", """const askBtn=(r,o,i)=>o.done!=null&&!o.ask?` <button class="wx-ask" data-a="pop" data-p="ask" data-ro="${r.no}" data-op="${i}">Ask ${esc(TF(r.tech))}</button>`:'';
function opCard(r,o,i){""")

# ---------- popovers ----------
i = src.index("  if(p.type==='follow'){"); j = src.index("  if(p.type==='xfer'){", i)
src = src[:i] + r"""  if(p.type==='ask'){ const W=[['cause','The cause',!o.cause],['correction','The correction',!o.fix],['photo','A photo of the causal part',o.parts.length>0&&!r.photo],['labor','Clock the labor',!(o.b>0)]];
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
""" + src[j:]
# settings has no RO
rep("function pop(){\n  const p=U.pop; if(!p) return ''; const r=get(p.ro); if(!r) return '';",
    """function pop(){
  const p=U.pop; if(!p) return '';
  if(p.type==='cfg'){ const C=S.cfg, row=(k,l,u,h)=>`<div class="wx-cr"><span>${l}${h?`<small>${h}</small>`:''}</span><input data-cfg="${k}" value="${C[k]}"><em>${u}</em></div>`;
    return `<div class="tg-pop xf wx-cfgp"><div class="tg-ph"><b>Warranty settings</b><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div>
      <span class="tg-lbl top">Deadlines</span>${row('file','File a claim within','days','of the repair')}${row('resub','Resubmit a returned claim within','days')}${row('keep','Keep failed parts','days','unless Volvo asks for them')}
      <span class="tg-lbl top" style="margin-top:10px">Chase after</span>${row('ask','The tech hasn’t answered','hours')}${row('ts','A tech support case is open','hours')}${row('pre','A pre-approval is waiting','hours')}${row('claim','A claim has no answer','days')}${row('paid','An approved claim isn’t paid','days')}
      <div class="tg-acts"><span class="hint">Saved with the shop data · late turns orange in the list</span><button class="btn btn-sm btn-primary" data-a="popx">Done</button></div></div>`; }
  const r=get(p.ro); if(!r) return '';""")

# ---------- actions ----------
rep("  if(x.act==='follow') return openPop('follow',no,x.op);\n}", """  if(x.act==='follow') return openPop('follow',no,x.op);
  if(x.act==='ask') return openPop('ask',no,x.op);
  if(x.act==='part') return openPop('part',no,x.op);
  if(x.act==='nudge') return nudge(x.ro,x.op);
}
function nudge(r,i){ const o=r.ops[i]; snap(); o.ask.at=0; o.ask.n=(o.ask.n||0)+1; toast(`Nudged ${TF(o.ask.who)} — it’s back on top of ${TF(o.ask.who)}’s Console.`); render(); }""")
i = src.index("  else if(a==='fgo'){"); j = src.index("\n", i)
src = src[:i] + r"""  else if(a==='fgo'){ const r=get(p.ro), b=flat(), v=r.vol, sb=r.ops.find(x=>x.st==='submitted'), kind=v&&!sb?v.kind:'claim', o=p.o; if(o==null) return;
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
  else if(a==='cfg'){ U.pop={type:'cfg',ro:U.sel}; render(); }""" + src[j:]
rep("function setSt(r,i,to,extra){", "const O_LOG={ts:['','Called Volvo — case still open','Escalated to the field rep'],pre:['','','Called — still waiting'],claim:['Called Volvo — still reviewing','Emailed the claims desk','']};\nfunction setSt(r,i,to,extra){")
rep("mock.addEventListener('input',e=>{ ", "mock.addEventListener('input',e=>{ if(e.target.dataset.cfg){ const v=+e.target.value; if(v>0){ S.cfg[e.target.dataset.cfg]=v; const pp=$('.tg-list'); if(pp){ pp.outerHTML=list(); } } return; } ")
# keys inside popovers
rep("    if(p.type==='follow'&&n>=1&&n<=3){ $(`.tg-pop [data-a=\"fpick\"][data-i=\"${n-1}\"]`)?.click(); return stop(); }",
    "    if((p.type==='follow'||p.type==='part')&&n>=1&&n<=3){ $(`.tg-pop [data-a=\"fpick\"][data-i=\"${n-1}\"]`)?.click(); return stop(); }\n    if(p.type==='ask'&&n>=1&&n<=4){ $$('.tg-pop [data-a=\"askw\"]')[n-1]?.click(); return stop(); }")
rep("  if(p&&U.pop){ const it=", "  const sc0=$('.tg-scroll'), on0=sc0&&sc0.querySelector('.tg-it.on'); if(on0&&U.pop&&(on0.offsetTop<sc0.scrollTop||on0.offsetTop+on0.offsetHeight>sc0.scrollTop+sc0.clientHeight)) sc0.scrollTop=on0.offsetTop-sc0.clientHeight/2;\n  if(p&&U.pop&&U.pop.type!=='cfg'){ const it=")
rep("document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;\n  if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"]')){U.pop=null;ch=true;}",
    "document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;\n  if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"],[data-a=\"cfg\"]')){U.pop=null;ch=true;}")

# ---------- styles ----------
CSS2 = r"""
/* ---------- group 2: deadlines, ask the tech, Volvo, failed parts ---------- */
.wx-due{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font-size:11px;font-weight:600;white-space:nowrap;background:var(--tg-fill);color:var(--tg-ink3);}
.wx-due.soon{background:var(--tg-warn-t);color:var(--tg-warn);}
.wx-due.late{background:var(--tg-bad-t);color:var(--tg-bad);}
.wx-by{font-size:12px;color:var(--tg-ink3);white-space:nowrap;}
.wx-ask{all:unset;cursor:pointer;margin-left:6px;font-style:normal;font-size:12px;font-weight:600;color:var(--tg-acctx);}
.wx-ask:hover{text-decoration:underline;}
.wx-line{display:flex;align-items:center;gap:8px;margin:0 0 10px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:17px;color:var(--tg-ink2);}
.wx-line > span{flex:1;min-width:0;}
.wx-line b{color:var(--tg-ink);font-weight:500;}
.wx-line .tg-ic{flex:none;}
.wx-line.ask{background:var(--tg-acct);} .wx-line.ask .tg-ic{color:var(--tg-acctx);}
.wx-line.vol{background:color-mix(in srgb,var(--tg-st-support) 9%,transparent);margin-top:10px;} .wx-line.vol .tg-ic{color:var(--tg-st-support);}
.wx-fp{display:flex;align-items:center;gap:6px;margin:-1px 0 4px 32px;font-size:11.5px;color:var(--tg-ink3);}
.wx-fp b{font:500 11.5px/1 var(--tg-mono);color:var(--tg-ink2);}
.wx-opt{all:unset;box-sizing:border-box;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center;width:100%;padding:7px 10px;border-radius:9px;cursor:pointer;}
.wx-opt .tg-kbd{grid-row:1 / span 2;}
.wx-opt b{font-size:13.5px;font-weight:500;color:var(--tg-ink);}
.wx-opt small{font-size:12px;color:var(--tg-ink3);}
.wx-opt:hover{background:var(--tg-fill);} .wx-opt.on{background:var(--tg-fill);box-shadow:inset 0 0 0 1.5px var(--tg-ink);}
.wx-ckb{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:9px;width:100%;height:34px;padding:0 10px;border-radius:9px;cursor:pointer;font-size:13.5px;color:var(--tg-ink);}
.wx-ckb:hover{background:var(--tg-fill);}
.wx-ckb .b{width:16px;height:16px;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--tg-border);display:grid;place-items:center;color:var(--tg-onprimary);}
.wx-ckb.on .b{background:var(--tg-primary);box-shadow:none;}
.wx-ckb small{margin-left:auto;font-size:11.5px;color:var(--tg-ink4);}
.wx-prev{display:block;margin-top:10px;padding:8px 10px;border-radius:9px;background:var(--tg-canvas);font-size:12px;line-height:17px;color:var(--tg-ink3);}
.wx-prev .tg-ic{vertical-align:-2px;margin-right:4px;}
.wx-prev b{color:var(--tg-ink);font-weight:500;}
.tg-pop.wx-cfgp{left:auto;right:16px;top:12px !important;width:440px;}
.wx-cr{display:grid;grid-template-columns:1fr 64px 46px;align-items:center;gap:8px;min-height:34px;font-size:13px;color:var(--tg-ink);}
.wx-cr small{display:block;font-size:11.5px;color:var(--tg-ink3);}
.wx-cr input{all:unset;box-sizing:border-box;width:64px;height:30px;padding:0 8px;border-radius:8px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-border);font:500 13px/30px var(--tg-mono);text-align:right;color:var(--tg-ink);}
.wx-cr input:focus{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.wx-cr em{font-style:normal;font-size:12px;color:var(--tg-ink3);}
.wx .tg-it .tg-t .wx-due{margin-left:2px;}
"""
rep('.tg-pop .wx-f{margin-bottom:8px;}\n"""', '.tg-pop .wx-f{margin-bottom:8px;}\n' + CSS2 + '"""')

# ---------- the frame ----------
i = src.index("const DEMO={"); j = src.index("};", i) + 2
src = src[:i] + r"""const DEMO={
  list:()=>{reset();render();},
  ask:()=>{reset();U.sel='37733';render();openPop('ask','37733',0);},
  answer:()=>{reset();U.sel='37688';render();const o=get('37688').ops[0];o.cause='Sensor float stuck low — contacts corroded.';o.ask=null;toast('Kevin wrote the cause — 37688 moved to Ready to file.',false);render();},
  volvo:()=>{reset();U.sel='37544';render();openPop('follow','37544',0);U.pop.o=0;render();},
  part:()=>{reset();U.sel='37620';render();openPop('part','37620',0);U.pop.o=0;render();},
  cfg:()=>{reset();render();U.pop={type:'cfg',ro:U.sel};render();}
};""" + src[j:]
src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("list", "Needs action"), ("ask", "1 · Ask the tech"), ("answer", "2 · Tech answers"), ("volvo", "3 · Waiting on Volvo"), ("part", "4 · Failed part"), ("cfg", "5 · Settings")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("Deadlines", "Ready to file counts down from the day the job was finished; Returned counts down to the resubmit date. Soonest first. Orange inside a week, red inside 3 days."),
 ("Needs the tech", "A finished job with no cause or correction can’t be filed. Ask the tech: it lands on their Console and the claim waits as “Waiting on Mike”. Nudge if it sits."),
 ("Waiting on Volvo", "A tech support case, a pre-approval or a filed claim with no answer past its limit. Follow up logs the call — or the answer, which goes straight to the tech."),
 ("Failed parts", "Volvo asked for a part back, or the holding days are up. Ship it, scrap it or keep it longer."),
 ("Not paid yet", "Approved but still no credit after the days you set."),
 ("Settings", "Every window above, in one place (gear in the header)."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Warranty layout</title>", "<title>Parsec Warranty needs action</title>")
rep("Parsec · Warranty — same layout as Triage and Foreman", "Parsec · Warranty — Needs action")
rep("<h2>Warranty<small>Try the buttons above, or the keys. Nothing here is saved.</small></h2>", "<h2>Needs action<small>What the warranty admin works from. Use the buttons above, or J K and ↵.</small></h2>")

g = {"__name__": "__main__", "__file__": SRC}
exec(compile(src, SRC, "exec"), g)
