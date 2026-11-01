# Warranty — group 3: the claim packet. One checklist per claim (claim checks + the RO's evidence)
# with a fix button on every gap, Copy for the claim (field by field), a printable packet with
# the photos, and comeback claims showing the earlier RO and its claim #.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
NS = os.path.join(B, "make_warranty_needs.py")
SRC = os.path.join(B, "make_warranty.py")
t = open(NS).read()
lib = t.split('\ng = {"__name__"')[0]
ns = {"__file__": NS, "__name__": "needs_lib"}
exec(compile(lib, NS, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:90], c)
    src = src.replace(a, b)

# ---------- data: evidence on each RO, failed-part tags, a comeback ----------
rep("{no:'37701',", "{no:'37701',ev:{dash:1,photos:1,dtc:1},")
rep("{no:'37455',", "{no:'37455',ev:{dash:1,photos:0,dtc:0},")
rep("{no:'37612',", "{no:'37612',ev:{dash:1,photos:0,dtc:0},back:{no:'36210',days:41,claim:'W2601187',paid:812.30,tech:'LM',fix:'Replaced the left rear wheel seal and adjusted the brakes.'},")
rep("{no:'37502',", "{no:'37502',ev:{dash:1,photos:2,dtc:1},")
rep("{no:'37733',", "{no:'37733',ev:{dash:1,photos:1,dtc:0},")
rep("{no:'37688',", "{no:'37688',ev:{dash:0,photos:1,dtc:1},")
rep("{no:'37466',", "{no:'37466',pa:'PA-55021',")
rep("{no:'37203',", "{no:'37203',pa:'PA-54870',")
rep("parts:[['NOx sensor, outlet','22827993',1,684.10,'Installed']]", "parts:[['NOx sensor, outlet','22827993',1,684.10,'Installed',{tag:'FP-0414',shelf:'W4',keep:29}]]")
rep("parts:[['Wheel seal','85137214',1,79.90,'Installed'],", "parts:[['Wheel seal','85137214',1,79.90,'Installed',{tag:'FP-0409',shelf:'W2',keep:26}],")
rep("parts:[['Coolant level sensor','22430542',1,88.40,'Installed']]", "parts:[['Coolant level sensor','22430542',1,88.40,'Installed',{tag:'FP-0411',shelf:'W1',keep:28}]]")
rep("const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30};", "const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30,pa:1500};")

# ---------- the packet: claim checks + the RO's evidence ----------
m = re.search(r"const checks=\(r,o\)=>\{.*?\]\]; \};", src, re.S)
src = src.replace(m.group(0), r"""const EV=r=>r.ev||{dash:1,photos:2,dtc:1};
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
  return L; };""")
rep("(g.length?` · missing ${g.map(x=>x[0].toLowerCase()).join(', ')}`:'')", "(g.length?` · missing ${g.map(x=>x[5]).join(', ')}`:' · packet complete')")

# ---------- claim card: the packet replaces the chips; Copy and Print sit with the actions ----------
rep("""<div class="wx-chk">${C.filter(x=>x[2]||x[1]).map(x=>`<span class="wx-ck ${x[1]?'ok':'no'}">${ic(x[1]?'check':'flag',11)}${esc(x[0])}</span>`).join('')}${C.filter(x=>!x[2]&&!x[1]).map(x=>`<span class="wx-ck">${esc(x[0])} · optional</span>`).join('')}</div>
""", "${packet(r,o,i,s!=='paid'&&s!=='denied')}\n")
rep("""else if(s==='ready') acts=`<button class="btn btn-sm btn-primary" data-a="do" data-ro="${r.no}" data-op="${i}"${g.length?' disabled':''}>${ic('send',13)}File claim…</button>`;""",
    """else if(s==='ready') acts=`<button class="btn btn-sm btn-primary" data-a="do" data-ro="${r.no}" data-op="${i}">${ic('send',13)}File claim…</button>`;""")
rep("""<div class="wx-acts">${acts}<span class="sp"></span><button class="btn btn-sm tg-gh">${ic('note',13)}Open on RO</button></div>""",
    """<div class="wx-acts">${acts}${s!=='repair'?`<button class="btn btn-sm" data-a="copy" data-ro="${r.no}" data-op="${i}" title="Copy for the claim (C)">${ic('copy',13)}Copy</button><button class="btn btn-sm" data-a="print" data-ro="${r.no}" data-op="${i}" title="Print packet (P)">${ic('print',13)}Print</button>`:''}<span class="sp"></span><button class="btn btn-sm tg-gh" title="Open on RO">${ic('note',13)}RO</button></div>""")
rep("function opCard(r,o,i){", r"""const FIXL={'ask':r=>'Ask '+TF(r.tech),'causal':()=>'Pick','field':()=>'Add','upload':()=>'Upload','tag':()=>'Tag it'};
function fixBtn(r,i,x){ if(!x[4]) return ''; const k=x[4].split(':')[0]; let l=FIXL[k](r); if(x[4]==='field:prev') l='Add '+r.back.claim; return `<button class="btn btn-sm" data-a="fix" data-fix="${x[4]}" data-ro="${r.no}" data-op="${i}">${esc(l)}</button>`; }
function pkRows(r,o,i,live){ const C=checks(r,o), g=C.filter(x=>x[2]&&!x[1]), opt=C.filter(x=>!x[2]&&!x[1]), ok=C.filter(x=>x[1]);
  return g.map(x=>`<div class="wx-pk-r"><span class="i no">!</span><span class="t">${esc(x[0])}<small>${esc(x[3])}</small></span>${live?fixBtn(r,i,x):''}</div>`).join('')
    +opt.map(x=>`<div class="wx-pk-r opt"><span class="i">${ic('plus',11)}</span><span class="t">${esc(x[0])}<small>optional</small></span>${live?fixBtn(r,i,x):''}</div>`).join('')
    +(ok.length?`<div class="wx-pk-ok">${ic('check',12)}<span>${ok.map(x=>esc(x[0])).join(' · ')}</span></div>`:''); }
function packet(r,o,i,live){ const C=checks(r,o), req=C.filter(x=>x[2]), done=req.filter(x=>x[1]).length, full=done===req.length;
  return `<div class="wx-pk${full?' full':''}"><div class="wx-pk-h"><b>Packet</b><span>${done} of ${req.length}</span><span class="m"><i style="width:${(done/req.length*100).toFixed(0)}%"></i></span>${full?`<span class="okt">${ic('check',12)}Everything Volvo asks for</span>`:''}</div>${pkRows(r,o,i,live)}</div>`; }
function comeback(r){ const b=r.back; return `<div class="wx-line back">${ic('history',14)}<span><b>Comeback</b> — same unit back ${b.days} days after <b>RO-${b.no}</b>, same complaint. ${esc(TF(b.tech))}: “${esc(b.fix)}” · claim <b>${esc(b.claim)}</b> paid ${usd(b.paid)}</span><button class="btn btn-sm" data-a="cpy1" data-v="${esc(b.claim)}">${ic('copy',13)}${esc(b.claim)}</button><button class="btn btn-sm tg-gh">Open RO-${b.no}</button></div>`; }
function opCard(r,o,i){""")
rep("""<div class="wx-cl" data-scroll="cl">${topOf(r,true)}<div class="wx-pad">""", """<div class="wx-cl" data-scroll="cl">${topOf(r,true)}<div class="wx-pad">${r.back?comeback(r):''}""")
rep("""<b class="tg-cu">${esc(r.cust)}</b>${r.ops.length>1&&x.op!=null?""", """<b class="tg-cu">${esc(r.cust)}</b>${r.back?`<span class="tg-back">${ic('history',11)}Comeback</span>`:''}${r.ops.length>1&&x.op!=null?""")

# ---------- popovers: File shows the packet; Copy; the fixes ----------
i = src.index("  if(p.type==='file'){"); j = src.index("  if(p.type==='paid')", i)
src = src[:i] + r"""  if(p.type==='file'){ const C=checks(r,o), g=C.filter(x=>x[2]&&!x[1]), req=C.filter(x=>x[2]);
    return `<div class="tg-pop xf wx-filep">${hd('File the claim')}<div class="wx-ctx">Op ${p.op+1} · <b>${esc(o.cmp)}</b> · ${usd(amtOf(o))}${r.back?` · <b>comeback</b> of RO-${r.back.no}`:''}</div>
      <div class="wx-pk${g.length?'':' full'}"><div class="wx-pk-h"><b>Packet</b><span>${req.length-g.length} of ${req.length}</span><span class="m"><i style="width:${((req.length-g.length)/req.length*100).toFixed(0)}%"></i></span>${g.length?'':`<span class="okt">${ic('check',12)}Everything Volvo asks for</span>`}</div>
      ${g.map(x=>`<div class="wx-pk-r"><span class="i no">!</span><span class="t">${esc(x[0])}<small>${esc(x[3])}</small></span>${fixBtn(r,p.op,x)}</div>`).join('')}</div>
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
""" + src[j:]
rep("const askBtn=(r,o,i)=>", r"""const dateOf=a=>{ const d=new Date(2026,9,22); d.setDate(d.getDate()-Math.round(a||0)); return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear(); };
/* the claim screen's order — every line copies on its own */
function copyRows(r,o){ const cp=o.parts[o.causal], oth=o.parts.filter((x,k)=>k!==o.causal);
  return [['VIN',r.vin],['Mileage',String(r.mi).replace(/,/g,'')],['Engine hours',String(r.eh).replace(/,/g,'')],['Repair date',o.done!=null?dateOf(o.done):''],['Fault code',o.claim.code||''],['Causal part #',cp?cp[1]:''],
    ['Complaint',o.cmp,1],['Cause',o.cause,1],['Correction',o.fix,1],['Labor hours',o.claim.hrs||o.b.toFixed(1)],['Other parts',oth.map(x=>x[1]+' ×'+x[2]).join(', ')],['Pre-approval #',r.pa||''],['Tech support #',r.ts||(r.vol&&r.vol.no)||''],['Earlier claim #',r.back?r.back.claim:'']]; }
function clip(t){ try{ navigator.clipboard.writeText(t).catch(()=>{}); }catch(e){} }
const askBtn=(r,o,i)=>""")

# ---------- the printable packet ----------
rep("""${pop()}</div></div>${TOAST?""", """${pop()}</div>${U.print?printView():''}</div>${TOAST?""")
rep("function vClaims(r){", r"""function printView(){ const r=get(U.print.ro), ops=r.ops.filter(o=>o.st!=='repair'), ev=EV(r);
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
function vClaims(r){""")

# ---------- actions ----------
rep("  else if(a==='cfg'){", r"""  else if(a==='fix'){ const [k,v]=t.dataset.fix.split(':'), op=+t.dataset.op, prev=U.pop&&U.pop.type==='file'?Object.assign({},U.pop):null;
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
  else if(a==='cfg'){""")
rep(r"""<span class="tg-lbl top" style="margin-top:10px">Chase after</span>""", r"""<span class="tg-lbl top" style="margin-top:10px">Packet</span>${row('pa','Pre-approval needed over','$','the packet asks for the # above this')}<span class="tg-lbl top" style="margin-top:10px">Chase after</span>""")

# ---------- keys: C copies, P prints, the copy list walks with ↑ ↓ ----------
rep("  if(U.srch){ if(k==='Escape'){U.srch=false;render();return stop();}", """  if(U.print){ if(k==='Escape'){U.print=null;render();return stop();} return; }
  if(U.pop&&U.pop.type==='copy'&&!inF){ const R=copyRows(get(U.pop.ro),get(U.pop.ro).ops[U.pop.op]);
    if(k==='ArrowDown'||k==='j'){ U.pop.k=Math.min(R.length-1,(U.pop.k||0)+1); render(); $$('.wx-cp')[U.pop.k]?.classList.add('kb'); return stop(); }
    if(k==='ArrowUp'||k==='k'){ U.pop.k=Math.max(0,(U.pop.k||0)-1); render(); $$('.wx-cp')[U.pop.k]?.classList.add('kb'); return stop(); }
    if(k==='Enter'){ $$('.wx-cp')[U.pop.k||0]?.click(); return stop(); }
    if(k==='Escape'){ U.pop=U.pop.ret||null; render(); return stop(); } }
  if(U.srch){ if(k==='Escape'){U.srch=false;render();return stop();}""")
rep("  if(k==='t'){U.kb=true;openPop('xfer',U.sel);return stop();}", """  if(k==='t'){U.kb=true;openPop('xfer',U.sel);return stop();}
  if(k==='c'||k==='p'){ const r=get(U.sel), x=itemOf(U.sel), op=x&&x.op!=null?x.op:Math.max(0,r.ops.findIndex(o=>o.st!=='repair')); if(k==='c'){ U.copied=null; U.pop={type:'copy',ro:r.no,op,k:0}; } else { U.print={ro:r.no,op}; U.pop=null; } render(); return stop(); }""")
rep("    if(p.type==='ask'&&n>=1&&n<=4){", "    if(p.type==='file'&&(k==='c'||k==='p')){ $(`.tg-pop [data-a=\"${k==='c'?'copy':'print'}\"]`)?.click(); return stop(); }\n    if(p.type==='causal'&&n>=1){ $$('.tg-pop [data-a=\"cpick\"]')[n-1]?.click(); return stop(); }\n    if(p.type==='ask'&&n>=1&&n<=4){")
rep("<span>${kbd('T')}send to</span>", "<span>${kbd('T')}send to</span><span>${kbd('C')}copy</span>")
rep("document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;\n  if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"],[data-a=\"cfg\"]')){U.pop=null;ch=true;}",
    "document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;\n  if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"],[data-a=\"cfg\"],[data-a=\"fix\"],[data-a=\"copy\"]')){U.pop=null;ch=true;}")

# ---------- styles ----------
CSS3 = r"""
/* ---------- group 3: the packet, copy for the claim, print, comeback ---------- */
.wx-pk{margin:0 0 12px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--tg-hair);background:var(--tg-raised);padding:8px 10px 6px;}
.wx-pk-h{display:flex;align-items:center;gap:8px;padding:2px 2px 6px;font-size:12.5px;color:var(--tg-ink3);}
.wx-pk-h b{font-size:12.5px;font-weight:600;color:var(--tg-ink);}
.wx-pk-h .m{flex:1;max-width:120px;height:4px;border-radius:2px;background:var(--tg-hair);overflow:hidden;}
.wx-pk-h .m i{display:block;height:100%;background:var(--tg-warn);border-radius:2px;}
.wx-pk.full .wx-pk-h .m i{background:var(--tg-good);}
.wx-pk-h .okt{display:inline-flex;align-items:center;gap:4px;margin-left:auto;color:var(--tg-good);font-weight:500;}
.wx-pk-r{display:flex;align-items:center;gap:8px;min-height:32px;padding:2px 2px;font-size:13px;box-shadow:inset 0 1px 0 var(--tg-hair);}
.wx-pk-r .i{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:var(--tg-fill);color:var(--tg-ink3);}
.wx-pk-r .i.no{background:var(--tg-warn-t);color:var(--tg-warn);font:700 11px/1 var(--tg-sans);}
.wx-pk-r .t{flex:1;min-width:0;color:var(--tg-ink);}
.wx-pk-r .t small{margin-left:6px;font-size:11.5px;color:var(--tg-ink4);}
.wx-pk-r.opt .t{color:var(--tg-ink3);}
.wx-pk-r .btn{height:26px;padding:0 9px;font-size:12.5px;}
.wx-pk-ok{display:flex;gap:6px;align-items:flex-start;padding:7px 2px 3px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:11.5px;line-height:16px;color:var(--tg-ink3);}
.wx-pk-ok .tg-ic{flex:none;color:var(--tg-good);margin-top:2px;}
.wx-two{display:flex;gap:6px;margin:10px 0;}
.wx-two .btn{flex:1;justify-content:center;}
.tg-pop.wx-filep{width:470px;}
.tg-pop.wx-copyp{width:520px;}
.tg-pop.wx-smallp{width:400px;}
.wx-cps{display:flex;flex-direction:column;gap:1px;max-height:470px;overflow:auto;scrollbar-width:thin;margin:0 -4px;}
.wx-cp{all:unset;box-sizing:border-box;display:grid;grid-template-columns:20px 112px minmax(0,1fr) auto;align-items:center;gap:8px;min-height:32px;padding:5px 8px;border-radius:8px;cursor:pointer;font-size:13px;}
.wx-cp:hover,.wx-cp.kb{background:var(--tg-fill);}
.wx-cp .n{font:500 11px/1 var(--tg-mono);color:var(--tg-ink4);text-align:right;}
.wx-cp .k{font-size:12px;color:var(--tg-ink3);}
.wx-cp .v{font:500 12.5px/18px var(--tg-mono);color:var(--tg-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wx-cp .v.long{font-family:var(--tg-sans);font-weight:400;}
.wx-cp .c{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--tg-ink4);}
.wx-cp:hover .c{color:var(--tg-ink2);}
.wx-cp.done{background:var(--tg-good-t);} .wx-cp.done .c{color:var(--tg-good);font-weight:600;}
.wx-cp.none{cursor:default;opacity:.55;}
.wx-line.back{background:var(--tg-warn-t);margin:0;} .wx-line.back .tg-ic{color:var(--tg-warn);}
.wx .tg-it .tg-back{display:inline-flex;align-items:center;gap:3px;height:18px;padding:0 6px;border-radius:5px;background:var(--tg-warn-t);color:var(--tg-warn);font-size:11px;font-weight:600;}
/* the print preview */
.wx-pv{position:absolute;inset:0;z-index:55;display:flex;flex-direction:column;background:color-mix(in srgb,var(--tg-canvas) 92%,transparent);backdrop-filter:blur(2px);}
.wx-pvb{display:flex;align-items:center;gap:10px;padding:12px 20px;font-size:13px;color:var(--tg-ink3);box-shadow:inset 0 -1px 0 var(--tg-hair);background:var(--tg-panel);}
.wx-pvb b{font-size:14px;color:var(--tg-ink);font-weight:600;}
.wx-pvb .sp{flex:1;}
.wx-pvs{flex:1;overflow:auto;padding:24px;display:flex;justify-content:center;scrollbar-width:thin;}
.wx-sheet{width:680px;flex:none;align-self:flex-start;background:#fff;color:#1d1c1a;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.12),0 12px 40px -12px rgba(0,0,0,.25);padding:34px 40px 28px;font:400 12px/17px var(--tg-sans);}
.wx-sheet header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:1.5px solid #1d1c1a;margin-bottom:12px;}
.wx-sheet header > div{display:flex;flex-direction:column;gap:2px;}
.wx-sheet header .lg svg{width:18px;height:18px;} .wx-sheet header .lg circle{fill:#1d1c1a;} .wx-sheet header .lg .o{fill:#8a857c;} .wx-sheet header .lg .c{fill:#2c7350;}
.wx-sheet header b{font:500 18px/22px var(--tg-serif);} .wx-sheet header .r{text-align:right;} .wx-sheet header .r b{font:600 14px/18px var(--tg-mono);}
.wx-sheet small{font-size:11px;color:#67625a;}
.wx-shu{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 14px;margin:0 0 10px;}
.wx-shu dt{font-size:10.5px;color:#67625a;} .wx-shu dd{margin:0;font-weight:500;} .wx-sheet .m{font-family:var(--tg-mono);font-size:11.5px;}
.wx-shb{margin:0 0 10px;padding:6px 8px;background:#f8eedc;border-radius:4px;font-weight:500;}
.wx-sheet section{padding:10px 0;border-top:1px solid #e6e2d8;}
.wx-sheet h4{display:flex;align-items:baseline;gap:8px;margin:0 0 6px;font-size:13px;font-weight:600;}
.wx-sheet h4 span{font:500 11px/1 var(--tg-mono);color:#67625a;} .wx-sheet h4 em{margin-left:auto;font-style:normal;font-size:11px;font-weight:500;color:#67625a;}
.wx-sh3{display:grid;grid-template-columns:80px 1fr;gap:3px 10px;margin:0 0 8px;} .wx-sh3 dt{color:#67625a;} .wx-sh3 dd{margin:0;}
.wx-sheet table{width:100%;border-collapse:collapse;margin:0 0 6px;} .wx-sheet th{text-align:left;font-size:10.5px;font-weight:500;color:#67625a;padding:3px 4px;border-bottom:1px solid #d6d0c3;} .wx-sheet td{padding:4px;border-bottom:1px solid #f0ede6;}
.wx-shl{margin:0;color:#57534b;}
.wx-phs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.wx-ph{margin:0;display:flex;flex-direction:column;gap:4px;}
.wx-ph .img{aspect-ratio:4/3;border-radius:4px;display:grid;place-items:center;color:#8f897c;background:repeating-linear-gradient(135deg,#f2f0ea 0 8px,#ebe7de 8px 9px);}
.wx-ph .img.dtc{background:#eef0f4;color:#6c69c8;}
.wx-ph figcaption{font-size:10.5px;color:#67625a;} .wx-ph figcaption b{color:#1d1c1a;font-weight:600;}
.wx-sheet footer{margin-top:10px;padding-top:8px;border-top:1px solid #e6e2d8;font-size:10.5px;color:#8f897c;}
@media print{ body *{visibility:hidden !important;} .wx-sheet,.wx-sheet *{visibility:visible !important;} .wx-sheet{position:fixed;left:0;top:0;box-shadow:none;width:100%;} }
"""
rep('.wx .tg-it .tg-t .wx-due{margin-left:2px;}\n', '.wx .tg-it .tg-t .wx-due{margin-left:2px;}\n' + CSS3)

# icons
rep(''' "info": ''', ''' "gauge": '<path d="M4.5 16.5a7.5 7.5 0 1 1 15 0"/><path d="M12 16.5l3.5-4.5"/>',
 "info": ''')

# ---------- the frame ----------
i = src.index("const DEMO={"); j = src.index("\n};", i) + 3
src = src[:i] + r"""const DEMO={
  file:()=>{reset();U.sel='37701';render();openPop('file','37701',0);},
  clean:()=>{reset();U.sel='37502';render();openPop('file','37502',0);},
  copy:()=>{reset();U.sel='37502';render();U.copied=4;U.pop={type:'copy',ro:'37502',op:0,k:4};render();},
  print:()=>{reset();U.sel='37502';U.print={ro:'37502',op:0};render();},
  back:()=>{reset();U.sel='37612';render();},
  card:()=>{reset();U.sel='37455';render();}
};""" + src[j:]
src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("file", "1 · Packet with gaps"), ("clean", "2 · Packet complete"), ("copy", "3 · Copy for the claim"), ("print", "4 · Print packet"), ("back", "5 · Comeback"), ("card", "6 · On the claim")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("One packet per claim", "The claim checks and the RO’s evidence in one list: story, parts and labor, unit, dash picture, part photos, DTC readout, failed-part tag, pre-approval over the limit you set."),
 ("Every gap has a fix", "Ask the tech, pick the causal part, add a field, upload a photo, tag the part — right from the list. File stays off until the packet is complete."),
 ("Copy for the claim", "Each line copies on its own, in the order of Volvo’s claim screen. ↑ ↓ and ↵ walk it; Copy all takes the lot. C from anywhere."),
 ("Print packet", "One sheet: the unit, the 3C story, parts with their failed-part tags, labor, fault codes and the photos. P from anywhere."),
 ("Comebacks", "Same unit back on the same complaint: the earlier RO and its claim # sit on top, and the packet asks for that claim #."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Warranty needs action</title>", "<title>Parsec Warranty claim packet</title>")
rep("Parsec · Warranty — Needs action", "Parsec · Warranty — Claim packet")
rep("<h2>Needs action<small>What the warranty admin works from. Use the buttons above, or J K and ↵.</small></h2>", "<h2>Claim packet<small>Getting a claim filed right the first time. Use the buttons above, or ↵ on a Ready to file item.</small></h2>")

g = {"__name__": "__main__", "__file__": SRC}
exec(compile(src, SRC, "exec"), g)
