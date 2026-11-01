# Warranty — group 5: after filing. Returned and denied claims get a Decide popover (fix and resubmit,
# appeal, goodwill, bill the customer, write it off); paid-short claims get a reason and a decision;
# a payment statement marks several claims paid at once, pasted lines matched by claim #.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
CK = os.path.join(B, "make_warranty_checks.py")
SRC = os.path.join(B, "make_warranty.py")
t = open(CK).read()
lib = t.split('\ng = {"__name__"')[0]
ns = {"__file__": CK, "__name__": "checks_lib"}
exec(compile(lib, CK, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:90], c)
    src = src.replace(a, b)

# ---------- outcomes after filing ----------
rep("const STAGE={repair:0,ready:1,submitted:2,returned:2,approved:3,paid:4,denied:4};", """const STAGE={repair:0,ready:1,submitted:2,returned:2,approved:3,paid:4,denied:4};
Object.assign(STL,{appealed:'Appealed',written:'Written off',billed:'Customer pays'}); Object.assign(STC,{appealed:'subm',written:'den',billed:'repair'});
Object.assign(RANK,{appealed:3,written:6,billed:6}); Object.assign(STAGE,{appealed:2,written:4,billed:4});
const CLOSED=['paid','denied','written','billed'];""")
rep("const isOpen=r=>r.ops.some(o=>o.st!=='paid'&&o.st!=='denied');", "const isOpen=r=>r.ops.some(o=>!CLOSED.includes(o.st)||(o.st==='paid'&&o.claim.short&&!o.claim.short.dec));")
rep("o.st==='submitted'||o.st==='approved'||o.st==='returned').reduce", "o.st==='submitted'||o.st==='approved'||o.st==='returned'||o.st==='appealed').reduce")

# ---------- data: a claim paid short; denied gets the full reason ----------
rep(" {no:'37620',cust:'Northline Transport'", """ {no:'37355',cust:'Rowan Ready Mix',unit:'T-238',truck:'2021 Volvo VNR 640',eng:'D11 425HP',vin:'4V4WC9EG5MN270318',mi:'176,900',eh:'5,210',ws:'08-14-2024',cs:'C-8188',tech:'MR',opened:24,spot:'Released',
  ops:[op({cov:'base',cmp:'Air governor leaking — slow build-up',cause:'Governor diaphragm leaking at the exhaust port.',fix:'Replaced air governor, leak-tested, build-up time within spec.',parts:[['Air governor','20792960',1,214.30,'Installed']],q:1.2,b:1.2,cost:702.40,done:20,st:'paid',srt:{op:'5632-04-02',name:'Air governor, replace',hrs:0.8},
   claim:{no:'W2622980',hrs:'1.2',amt:'702.40',paid:'612.00',at:1,short:{amt:90.40,why:'Labor cut to the SRT (0.8 h) · shop supplies not paid',src:'CM-88011'}},hist:[[18,'submitted','You'],[9,'approved','Volvo'],[1,'paid','You']]})]},
 {no:'37620',cust:'Northline Transport'""")

# ---------- the list ----------
rep("const GROUPS=[['sent','Sent to you'],['back','Returned'],['ready','Ready to file'],['tech','Needs the tech'],['volvo','Waiting on Volvo'],['part','Failed parts'],['paid','Not paid yet']];",
    "const GROUPS=[['sent','Sent to you'],['back','Returned'],['den','Denied'],['ready','Ready to file'],['tech','Needs the tech'],['volvo','Waiting on Volvo'],['part','Failed parts'],['paid','Not paid yet'],['short','Paid short']];")
rep("add({op:r.ops.indexOf(back),g:'back',ic:'undo',due:n,why:`Resubmit by ${byTxt(n)} · ${back.claim.why}`,btn:'Fix',act:'fix',late:n<=3}); return; }",
    """add({op:r.ops.indexOf(back),g:'back',ic:'undo',due:n,why:`Resubmit by ${byTxt(n)} · ${back.claim.why}`,btn:'Decide',act:'decide',late:n<=3}); return; }
    const dn=r.ops.find(o=>o.st==='denied'&&!o.claim.dec); if(dn){ add({op:r.ops.indexOf(dn),g:'den',ic:'x',why:`Denied ${when(dn.claim.at)} · ${usd(amtOf(dn))} · ${dn.claim.why}`,btn:'Decide',act:'decide',late:dn.claim.at>5}); return; }""")
rep("const sb=r.ops.find(o=>o.st==='submitted'&&o.claim.at>=C.claim);", "const sb=r.ops.find(o=>(o.st==='submitted'||o.st==='appealed')&&o.claim.at>=C.claim);")
rep("""btn:'Paid…',act:'paid',late:ap.claim.at>=C.paid+5}); }""", """btn:'Paid…',act:'paid',late:ap.claim.at>=C.paid+5}); return; }
    const sh=r.ops.find(o=>o.st==='paid'&&o.claim.short&&!o.claim.short.dec); if(sh){ add({op:r.ops.indexOf(sh),g:'short',ic:'dollar',why:`Paid ${usd(+sh.claim.paid)} of ${usd(amtOf(sh))} · short ${usd(sh.claim.short.amt)} — ${sh.claim.short.why}`,btn:'Decide',act:'short',late:false}); }""")
rep("x.act==='file'||x.act==='fix'||x.act==='ask'?' btn-primary':''} tg-go", "x.act==='file'||x.act==='fix'||x.act==='ask'||x.act==='decide'?' btn-primary':''} tg-go")
rep("  if(x.act==='fix'){", "  if(x.act==='decide') return openPop('decide',no,x.op);\n  if(x.act==='short') return openPop('short',no,x.op);\n  if(x.act==='fix'){")
rep("s==='paid'?'Paid in full.':s==='denied'?r.ops[0].claim.why:'';", "s==='paid'?'Paid in full.':s==='denied'?r.ops[0].claim.why:s==='appealed'?'Appeal sent — waiting on Volvo.':s==='written'?'Written off.':s==='billed'?'Moved to customer pay.':'';")

# ---------- claim card ----------
rep("else if(s==='returned') acts=btn('submitted','Resubmit','btn-primary',g.length>0)+btn('denied','Denied','bad');",
    "else if(s==='returned') acts=`<button class=\"btn btn-sm btn-primary\" data-a=\"pop\" data-p=\"decide\" data-ro=\"${r.no}\" data-op=\"${i}\">Decide…</button>`+btn('submitted','Resubmit','',g.length>0);")
rep("else acts=btn('reopen','Reopen');", """else if(s==='denied'&&!c.dec) acts=`<button class="btn btn-sm btn-primary" data-a="pop" data-p="decide" data-ro="${r.no}" data-op="${i}">Decide…</button>`;
  else if(s==='appealed') acts=btn('approved','Approved','btn-primary')+btn('denied','Denied','bad');
  else if(s==='paid'&&c.short&&!c.short.dec) acts=`<button class="btn btn-sm btn-primary" data-a="pop" data-p="short" data-ro="${r.no}" data-op="${i}">Paid short — decide…</button>`;
  else acts=btn('reopen','Reopen');""")
rep("${s==='paid'?inp('paid','Paid $','',true):''}", "${s==='paid'?inp('paid','Paid $','',true):''}${c.short?`<div class=\"wx-short w\"><b>Short ${usd(c.short.amt)}</b><span>${esc(c.short.why)}${c.short.src?' · statement '+esc(c.short.src):''}${c.short.dec?' · '+esc(c.short.dec):''}</span></div>`:''}${s==='appealed'&&c.appeal?`<div class=\"wx-short ap w\"><b>Appeal</b><span>${esc(c.appeal)}</span></div>`:''}")
rep("if(['submitted','approved','paid'].includes(o.st)) return '';", "if(['submitted','approved','paid','appealed','written','billed'].includes(o.st)) return '';")
# board
rep("const k=o.st==='returned'?'ready':o.st==='denied'?'paid':o.st;", "const k=o.st==='returned'?'ready':o.st==='appealed'?'submitted':CLOSED.includes(o.st)?'paid':o.st;")
rep("m=L.reduce((a,y)=>a+(y.o.st==='denied'?0:amtOf(y.o)),0);", "m=L.reduce((a,y)=>a+(['denied','written','billed'].includes(y.o.st)?0:y.o.st==='paid'?+(y.o.claim.paid||amtOf(y.o)):amtOf(y.o)),0);")
rep("o.st==='denied'?`denied ${when(o.claim.at)}`:`${o.st==='approved'?'approved':'filed'} ${ago(o.claim.at)} ago`;",
    "o.st==='denied'?`denied ${when(o.claim.at)}`:o.st==='written'?`written off ${when(o.claim.at)}`:o.st==='billed'?`to customer ${when(o.claim.at)}`:`${o.st==='approved'?'approved':o.st==='appealed'?'appealed':'filed'} ${ago(o.claim.at)} ago`;")
rep("${o.st==='returned'||o.st==='denied'?chip(o.st):''}", "${['returned','denied','appealed','written','billed'].includes(o.st)?chip(o.st):''}${o.claim.short?`<span class=\"wx-c back\">short</span>`:''}")
rep("<span class=\"wx-amt\">${o.st==='repair'&&!o.cost?'':usd0(amtOf(o))}</span>", "<span class=\"wx-amt\">${o.st==='repair'&&!o.cost?'':usd0(o.st==='paid'&&o.claim.paid?+o.claim.paid:amtOf(o))}</span>")

# ---------- popovers ----------
rep("  if(p.type==='paid'){ return `<div class=\"tg-pop xf\">${hd('Mark paid')}<div class=\"wx-ctx\">${esc(o.claim.no||'')} · approved ${ago(o.claim.at)} ago · claimed <b>${usd(amtOf(o))}</b></div>\n      <label class=\"wx-f\"><span>Paid / credit $</span><input id=\"wx-pd\" value=\"${esc(p.pd!=null?p.pd:amtOf(o).toFixed(2))}\" autocomplete=\"off\"></label>",
    """  if(p.type==='decide'){ const den=o.st==='denied', amt=amtOf(o), big=amt>S.cfg.wo;
    const O=[!den&&['fix','Fix and resubmit',`Opens the claim — the packet shows what to fix · by ${byTxt(resubLeft(o))}`,'Open the claim'],['appeal','Appeal','Volvo got it wrong — your note and evidence go back with the claim','Send the appeal'],['gw','Goodwill — ask the manager','To Tom Hayes · reason “Goodwill request”','Send to the manager'],['bill','Bill the customer',`To Approval · Dana writes a customer estimate for ${usd(amt)}`,'Send to Approval'],['wo','Write it off',`${usd(amt)} comes off the books${big?' · over '+usd0(S.cfg.wo)+', so the manager signs off first':''}`,big?'Ask the manager to sign off':'Write it off']].filter(Boolean);
    const ch=O.find(x=>x[0]===p.d);
    return `<div class="tg-pop xf">${hd(den?'Denied':'Returned')}<div class="wx-ctx"><b>${esc(o.claim.no||'')}</b> · op ${p.op+1} · ${esc(o.cmp)} · ${usd(amt)}<br>Volvo, ${when(o.claim.at)}: <q>${esc(o.claim.why||'')}</q></div>
      ${O.map((x,k)=>`<button class="wx-opt${p.d===x[0]?' on':''}" data-a="dpk" data-d="${x[0]}">${kbd(k+1)}<b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}
      ${p.d==='appeal'?`<label class="wx-f" style="margin-top:8px"><span>Why Volvo should pay it</span><textarea id="wx-ap" placeholder="${den?'e.g. In service 7 yr 11 mo, but the radiator was replaced under claim W2550190 on 3/4/2026 — covered as a previous repair':'e.g. The photo is attached now; the extra 0.3 h was seized bolts on the pulley'}"></textarea></label>`:''}${p.d==='wo'?`<label class="wx-f" style="margin-top:8px"><span>Reason</span><input id="wx-wo" placeholder="e.g. Customer goodwill, our miss on the photo"></label>`:''}
      <div class="tg-acts"><span class="hint">1–${O.length} choose · logged on the claim and the RO</span><button class="btn btn-sm btn-primary" data-a="dgo"${ch?'':' disabled'}>${ch?esc(ch[3]):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='short'){ const s=o.claim.short, O=[['accept',`Accept it — write off ${usd(s.amt)}`,'The claim closes · logged on the RO'],['appeal','Appeal the difference','Your note goes back with the claim · it waits under Waiting on Volvo'],['bill',`Bill the customer ${usd(s.amt)}`,'To Approval · added to the customer’s invoice']];
    return `<div class="tg-pop xf">${hd('Paid short')}<div class="wx-ctx"><b>${esc(o.claim.no)}</b> · claimed ${usd(amtOf(o))} · paid <b>${usd(+o.claim.paid)}</b> · short <b>${usd(s.amt)}</b><br>${esc(s.why)}${s.src?' · statement '+esc(s.src):''}</div>
      ${O.map((x,k)=>`<button class="wx-opt${p.d===x[0]?' on':''}" data-a="dpk" data-d="${x[0]}">${kbd(k+1)}<b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}
      ${p.d==='appeal'?`<label class="wx-f" style="margin-top:8px"><span>Note for the appeal</span><textarea id="wx-ap" placeholder="e.g. 0.4 h over the SRT — rusted governor bolts, photo attached"></textarea></label>`:''}
      <div class="tg-acts"><span class="hint">1–3 choose</span><button class="btn btn-sm btn-primary" data-a="sdgo"${p.d?'':' disabled'}>${p.d?esc(O.find(x=>x[0]===p.d)[1].split(' — ')[0]):'Choose'}${kbd('↵')}</button></div></div>`; }
  if(p.type==='paid'){ const pd=p.pd!=null?+p.pd:amtOf(o), sh=Math.round((amtOf(o)-pd)*100)/100, R=['Labor cut to the SRT','Parts price cut','Part not covered','Supplies or freight not paid','Other'];
    return `<div class="tg-pop xf">${hd('Mark paid')}<div class="wx-ctx">${esc(o.claim.no||'')} · approved ${ago(o.claim.at)} ago · claimed <b>${usd(amtOf(o))}</b></div>
      <label class="wx-f"><span>Paid / credit $</span><input id="wx-pd" value="${esc(p.pd!=null?p.pd:amtOf(o).toFixed(2))}" autocomplete="off"></label>
      <div id="wx-shb" class="wx-shb"${sh>0.004?'':' hidden'}><b>Short <span id="wx-sha">${usd(Math.max(0,sh))}</span></b> — why did Volvo cut it?<div class="tg-r" style="margin-top:6px">${R.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="pwhy" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div><small>It stays under Paid short until you accept it, appeal it or bill the customer.</small></div>""")
rep("""<button class="btn btn-sm btn-primary" data-a="paidgo">${ic('dollar',13)}Mark paid${kbd('↵')}</button></div></div>`; }""", """<button class="btn btn-sm btn-primary" data-a="paidgo">${ic('dollar',13)}Mark paid${kbd('↵')}</button></div></div>`; }
  if(p.type==='stmt') return '';""")

# ---------- the payment statement ----------
rep("${U.print?printView():''}", "${U.print?printView():''}${U.stmt?stmtView():''}")
rep("function vClaims(r){", r"""const STMT_DEMO='Credit memo CM-88123   10/21/2026\nW2621417   INJECTOR CYL 4          2,140.00\nW2624409   DPF REGEN DIAG            294.00\nW2624410   DPF SENSOR + CLEAN      1,020.31\nW2619855   NOT ON THIS LIST          415.00';
function stmtRows(){ const L=[]; S.R.forEach(r=>r.ops.forEach((o,i)=>{ if(['approved','submitted','appealed'].includes(o.st)&&o.claim.no) L.push({r,o,i,key:r.no+':'+i}); })); return L.sort((a,b)=>(a.o.st==='approved'?0:1)-(b.o.st==='approved'?0:1)); }
function stmtView(){ const T=U.stmt, L=stmtRows(), on=L.filter(x=>T.on[x.key]), sum=on.reduce((a,x)=>a+(+T.amt[x.key]||0),0), tot=+String(T.total||'').replace(/[$,]/g,'')||0, short=on.filter(x=>(+T.amt[x.key]||0)<amtOf(x.o)-0.004);
  const diff=Math.round((tot-sum)*100)/100;
  return `<div class="wx-pv"><div class="wx-pvb"><b>Payment statement</b><span>Tick what Volvo paid · or paste the statement lines</span><span class="sp"></span><button class="btn btn-sm" data-a="stx">Close${kbd('Esc')}</button><button class="btn btn-sm btn-primary" data-a="stgo"${on.length?'':' disabled'}>${ic('dollar',13)}Mark ${on.length||''} paid</button></div>
   <div class="wx-st"><aside><label class="wx-f"><span>Statement / credit memo #</span><input id="wx-stn" value="${esc(T.no||'')}" placeholder="e.g. CM-88123"></label>
     <label class="wx-f"><span>Total on the statement $</span><input id="wx-stt" value="${esc(T.total||'')}" placeholder="0.00"></label>
     <label class="wx-f"><span>Paste the statement</span><textarea id="wx-stp" rows="7" placeholder="Copy the lines from Volvo’s statement and paste them here — Parsec finds the claim numbers and amounts">${esc(T.paste||'')}</textarea></label>
     <button class="btn btn-sm" data-a="stmatch">${ic('search',13)}Match claim numbers</button>
     ${T.miss&&T.miss.length?`<div class="wx-stm">${ic('flag',12)}Not in Parsec: ${T.miss.map(esc).join(', ')}</div>`:''}</aside>
   <div class="wx-stt"><div class="wx-sth"><span></span><span>RO · customer</span><span>Claim #</span><span>Status</span><span class="r">Claimed</span><span class="r">Paid</span><span class="r">Short</span></div>
     ${L.map(x=>{ const v=T.amt[x.key]!=null?T.amt[x.key]:'', s=T.on[x.key]&&v!==''?Math.round((amtOf(x.o)-(+v||0))*100)/100:0; return `<div class="wx-str${T.on[x.key]?' on':''}"><button class="wx-sck${T.on[x.key]?' on':''}" data-a="stck" data-k="${x.key}">${T.on[x.key]?ic('check',11):''}</button><span><b class="tg-no">${x.r.no}</b> ${esc(x.r.cust)}${x.r.ops.length>1?` <small>op ${x.i+1}</small>`:''}</span><span class="m">${esc(x.o.claim.no)}</span><span>${chip(x.o.st)}</span><span class="r m">${usd(amtOf(x.o))}</span><span class="r"><input data-stamt="${x.key}" value="${esc(v)}" placeholder="${amtOf(x.o).toFixed(2)}"></span><span class="r m ${s>0.004?'bad':''}">${s>0.004?usd(s):''}</span></div>`; }).join('')}
     <div class="wx-stf"><span>${on.length} ticked · paid <b>${usd(sum)}</b>${tot?` of the statement’s <b>${usd(tot)}</b> — ${Math.abs(diff)<0.01?`<span class="ok">${ic('check',12)}matches</span>`:`<span class="bad">${usd(Math.abs(diff))} ${diff>0?'not matched':'over'}</span>`}`:''}</span>${short.length?`<span class="bad">${short.length} short — ${short.length>1?'they go':'it goes'} under Paid short</span>`:''}</div></div></div></div>`; }
function vClaims(r){""")
rep('<button class="btn ib" data-a="rets" title="Why claims came back">', '<button class="btn ib" data-a="stmt" title="Payment statement">${ic(\'dollar\',16)}</button><button class="btn ib" data-a="rets" title="Why claims came back">')

# ---------- actions ----------
rep("else if(a==='paidgo'){ const r=get(p.ro), b=flat(), v=($('#wx-pd')||{}).value||'0'; snap(); setSt(r,p.op,'paid',{paid:v}); done(r,'dollar','Paid · '+usd(+v),`RO-${r.no} paid · ${usd(+v)}.`,b); }",
    """else if(a==='paidgo'){ const r=get(p.ro), b=flat(), v=($('#wx-pd')||{}).value||'0', o=r.ops[p.op], sh=Math.round((amtOf(o)-(+v||0))*100)/100; if(sh>0.004&&!p.why){ $('#wx-shb')?.classList.add('need'); return; } snap(); setSt(r,p.op,'paid',{paid:(+v).toFixed(2),short:sh>0.004?{amt:sh,why:p.why}:null}); done(r,'dollar','Paid · '+usd(+v),sh>0.004?`RO-${r.no} paid ${usd(+v)} — ${usd(sh)} short, under Paid short.`:`RO-${r.no} paid in full · ${usd(+v)}.`,b); }
  else if(a==='pwhy'){ p.why=t.dataset.w; p.pd=($('#wx-pd')||{}).value; render(); }
  else if(a==='dpk'){ p.d=t.dataset.d; render(); const f=$('#wx-ap,#wx-wo'); if(f) f.focus(); }
  else if(a==='dgo'){ const r=get(p.ro), o=r.ops[p.op], b=flat(), d=p.d, amt=amtOf(o); if(!d) return;
     if(d==='fix'){ U.pop=null; U.view='claims'; U.op=p.op; render(); return; }
     const note=(($('#wx-ap')||{}).value||($('#wx-wo')||{}).value||'').trim(); snap();
     if(d==='appeal'){ setSt(r,p.op,'appealed',{appeal:note||'See the attached evidence.'}); done(r,'send','Appealed · '+o.claim.no,`Appeal sent with ${o.claim.no} — it waits under Waiting on Volvo.`,b); return; }
     if(d==='gw'){ o.claim.dec='goodwill asked'; r.snz='with Manager'; r.snzWhy='Goodwill request'; done(r,'swap','To Manager · goodwill',`RO-${r.no} → Tom Hayes · goodwill request on ${usd(amt)}.`,b); return; }
     if(d==='bill'){ o.claim.dec='billed'; setSt(r,p.op,'billed'); done(r,'swap','To Approval · customer pays',`RO-${r.no} op ${p.op+1} → Dana Kowalski · customer estimate for ${usd(amt)}.`,b); return; }
     if(amt>S.cfg.wo){ o.claim.dec='write-off asked'; r.snz='with Manager'; r.snzWhy='Write-off sign-off'; done(r,'swap','To Manager · write-off sign-off',`RO-${r.no} → Tom Hayes · sign-off to write off ${usd(amt)}.`,b); return; }
     o.claim.dec='written off'; setSt(r,p.op,'written',{wo:note}); done(r,'x','Written off · '+usd(amt),`${usd(amt)} written off on RO-${r.no}.`,b); }
  else if(a==='sdgo'){ const r=get(p.ro), o=r.ops[p.op], s=o.claim.short, b=flat(), d=p.d; if(!d) return; snap();
     if(d==='accept'){ s.dec='written off'; done(r,'check','Short accepted · '+usd(s.amt),`${usd(s.amt)} written off — ${o.claim.no} is closed.`,b); return; }
     if(d==='appeal'){ s.dec='appeal sent'; setSt(r,p.op,'appealed',{appeal:(($('#wx-ap')||{}).value||'').trim()||'Appealing the short pay.'}); done(r,'send','Appealed the short pay',`Appeal on the ${usd(s.amt)} sent — it waits under Waiting on Volvo.`,b); return; }
     s.dec='billed to the customer'; done(r,'swap','Short billed to the customer',`RO-${r.no} → Dana Kowalski · ${usd(s.amt)} added to the customer’s invoice.`,b); }
  else if(a==='stmt'){ U.stmt={on:{},amt:{},no:'',total:'',paste:''}; U.pop=null; render(); }
  else if(a==='stx'){ U.stmt=null; render(); }
  else if(a==='stck'){ const k=t.dataset.k, T=U.stmt; T.on[k]=!T.on[k]; if(T.on[k]&&(T.amt[k]==null||T.amt[k]==='')){ const x=stmtRows().find(y=>y.key===k); T.amt[k]=amtOf(x.o).toFixed(2); } render(); }
  else if(a==='stmatch'){ const T=U.stmt, txt=($('#wx-stp')||{}).value||''; T.paste=txt; T.no=($('#wx-stn')||{}).value||T.no; T.total=($('#wx-stt')||{}).value||T.total; const L=stmtRows(), miss=[];
     const mm=txt.match(/CM-\\d+/); if(mm&&!T.no) T.no=mm[0];
     txt.split(/\\n/).forEach(line=>{ const m=/(W\\d{7})\\b.*?([\\d,]+\\.\\d\\d)\\s*$/.exec(line.trim()); if(!m) return; const x=L.find(y=>y.o.claim.no===m[1]); if(!x){ miss.push(m[1]); return; } T.on[x.key]=true; T.amt[x.key]=m[2].replace(/,/g,''); });
     T.miss=miss; if(!T.total){ const s=L.filter(x=>T.on[x.key]).reduce((a,x)=>a+(+T.amt[x.key]||0),0); T.total=s.toFixed(2); } render(); }
  else if(a==='stgo'){ const T=U.stmt, L=stmtRows().filter(x=>T.on[x.key]); if(!L.length) return; snap(); let n=0, sh=0;
     L.forEach(x=>{ const v=+T.amt[x.key]||0, s=Math.round((amtOf(x.o)-v)*100)/100; setSt(x.r,x.i,'paid',{paid:v.toFixed(2),short:s>0.004?{amt:s,why:'See the statement for the reason',src:T.no||'statement'}:null}); clr(x.r,'dollar','Paid · '+usd(v)); n++; if(s>0.004) sh++; });
     U.stmt=null; toast(`${n} claim${n>1?'s':''} paid from ${T.no||'the statement'}${sh?` · ${sh} short, under Paid short`:''}.`); render(); }""")
rep("mock.addEventListener('input',e=>{ ", """mock.addEventListener('input',e=>{ if(e.target.id==='wx-pd'&&U.pop){ const r=get(U.pop.ro), o=r.ops[U.pop.op], sh=Math.round((amtOf(o)-(+e.target.value||0))*100)/100, bx=$('#wx-shb'); U.pop.pd=e.target.value; if(bx){ bx.hidden=!(sh>0.004); $('#wx-sha').textContent=usd(Math.max(0,sh)); } return; }
  if(e.target.dataset.stamt&&U.stmt){ U.stmt.amt[e.target.dataset.stamt]=e.target.value; U.stmt.on[e.target.dataset.stamt]=true; return; }
  if(e.target.id==='wx-stn'&&U.stmt){ U.stmt.no=e.target.value; return; } if(e.target.id==='wx-stt'&&U.stmt){ U.stmt.total=e.target.value; return; } if(e.target.id==='wx-stp'&&U.stmt){ U.stmt.paste=e.target.value; return; }
  """)
rep("mock.addEventListener('click',e=>{", "mock.addEventListener('change',e=>{ if((e.target.dataset.stamt||e.target.id==='wx-stt')&&U.stmt) render(); });\nmock.addEventListener('click',e=>{")
rep("  if(U.print){ if(k==='Escape'){U.print=null;render();return stop();} return; }", "  if(U.print){ if(k==='Escape'){U.print=null;render();return stop();} return; }\n  if(U.stmt){ if(k==='Escape'&&!inF){U.stmt=null;render();return stop();} return; }")
rep("    if(p.type==='srt'&&n>=1&&n<=3){", "    if((p.type==='decide'||p.type==='short')&&n>=1&&n<=5){ $$('.tg-pop [data-a=\"dpk\"]')[n-1]?.click(); return stop(); }\n    if(p.type==='srt'&&n>=1&&n<=3){")
rep("const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30,pa:1500,rate:210,", "const CFG0={file:30,resub:10,ask:4,ts:24,pre:4,claim:14,paid:10,keep:30,pa:1500,rate:210,wo:500,")
rep("${row('rate','Labor rate on claims','$/h','for what over-SRT time costs')}", "${row('rate','Labor rate on claims','$/h','for what over-SRT time costs')}${row('wo','Manager signs off write-offs over','$')}")
rep("document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; let ch=false;", "document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)||e.target.closest('.wx-pv')) return; let ch=false;")

# ---------- styles ----------
CSS5 = r"""
/* ---------- group 5: decide, paid short, statement ---------- */
.wx-short{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:9px;background:var(--tg-bad-t);font-size:12.5px;color:var(--tg-ink2);}
.wx-short b{color:var(--tg-bad);font-weight:600;}
.wx-short.ap{background:color-mix(in srgb,var(--tg-st-support) 10%,transparent);} .wx-short.ap b{color:var(--tg-st-support);}
.wx-short.w{grid-column:1 / -1;}
.wx-shb{margin:2px 0 8px;padding:9px 11px;border-radius:10px;background:var(--tg-bad-t);font-size:12.5px;color:var(--tg-ink2);}
.wx-shb > b{color:var(--tg-bad);} .wx-shb small{display:block;margin-top:6px;font-size:11.5px;color:var(--tg-ink3);}
.wx-shb.need{box-shadow:inset 0 0 0 1.5px var(--tg-bad);}
.wx-st{flex:1;min-height:0;display:grid;grid-template-columns:300px minmax(0,1fr);gap:0;background:var(--tg-panel);}
.wx-st aside{padding:18px 20px;display:flex;flex-direction:column;gap:10px;box-shadow:inset -1px 0 0 var(--tg-hair);overflow:auto;}
.wx-st aside textarea{min-height:150px;font-family:var(--tg-mono) !important;font-size:11.5px !important;white-space:pre !important;overflow:auto;}
.wx-stm{display:flex;gap:6px;align-items:flex-start;font-size:12px;color:var(--tg-warn);}
.wx-stt{display:flex;flex-direction:column;min-height:0;overflow:auto;padding:10px 20px 16px;}
.wx-sth,.wx-str{display:grid;grid-template-columns:28px minmax(0,1.6fr) 100px 110px 96px 110px 84px;align-items:center;gap:10px;}
.wx-sth{font-size:11.5px;color:var(--tg-ink3);padding:6px 0;box-shadow:inset 0 -1px 0 var(--tg-hair);position:sticky;top:-10px;background:var(--tg-panel);}
.wx-str{min-height:42px;font-size:13px;box-shadow:inset 0 -1px 0 var(--tg-hair);}
.wx-str.on{background:color-mix(in srgb,var(--tg-good) 5%,transparent);}
.wx-str small{font-size:11.5px;color:var(--tg-ink3);}
.wx-str .m,.wx-sth .m{font:500 12.5px/1 var(--tg-mono);}
.wx-str .r,.wx-sth .r{text-align:right;justify-self:end;}
.wx-str .bad{color:var(--tg-bad);font-weight:600;}
.wx-str input{all:unset;box-sizing:border-box;width:100px;height:30px;padding:0 8px;border-radius:8px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-border);font:500 12.5px/30px var(--tg-mono);text-align:right;color:var(--tg-ink);}
.wx-str input:focus{box-shadow:inset 0 0 0 1.5px var(--tg-acc);}
.wx-sck{all:unset;cursor:pointer;width:18px;height:18px;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--tg-border);display:grid;place-items:center;color:var(--tg-onprimary);}
.wx-sck.on{background:var(--tg-primary);box-shadow:none;}
.wx-stf{display:flex;justify-content:space-between;gap:12px;padding:12px 0 0;font-size:13px;color:var(--tg-ink2);}
.wx-stf b{color:var(--tg-ink);font-weight:600;} .wx-stf .ok{display:inline-flex;align-items:center;gap:4px;color:var(--tg-good);font-weight:600;} .wx-stf .bad{color:var(--tg-bad);font-weight:600;}
.wx-pv .wx-st .wx-f input,.wx-pv .wx-st .wx-f textarea{font-family:var(--tg-sans);}
"""
rep("@media print{", CSS5 + "@media print{")

# ---------- the frame ----------
i = src.index("const DEMO={"); j = src.index("\n};", i) + 3
src = src[:i] + r"""const DEMO={
  back:()=>{reset();U.sel='37455';render();openPop('decide','37455',0);},
  den:()=>{reset();U.sel='37203';render();openPop('decide','37203',0);U.pop.d='appeal';render();},
  short:()=>{reset();U.sel='37355';render();openPop('short','37355',0);},
  paid:()=>{reset();U.sel='37466';render();U.pop={type:'paid',ro:'37466',op:0,pd:'1980.00',why:'Labor cut to the SRT'};render();},
  stmt:()=>{reset();U.sel='37466';U.stmt={on:{},amt:{},no:'',total:'',paste:STMT_DEMO};render();$('[data-a="stmatch"]').click();},
  board:()=>{reset();U.view='board';U.sel='37355';render();}
};""" + src[j:]
src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("back", "1 · Returned — decide"), ("den", "2 · Denied — appeal"), ("short", "3 · Paid short"), ("paid", "4 · Mark paid, short"), ("stmt", "5 · Payment statement"), ("board", "6 · Board")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("Decide", "Returned or denied: fix and resubmit, appeal with your note, goodwill from the manager, bill the customer, or write it off — over the amount you set, the manager signs off first."),
 ("Denied gets its own group", "A denied claim stays in Needs action until you decide what happens to the money."),
 ("Paid short", "Mark paid takes what Volvo actually paid. Less than claimed asks why (labor cut to the SRT, parts price, not covered…) and the claim waits under Paid short: accept it, appeal it, or bill the customer."),
 ("Payment statement", "Dollar button in the header. Paste the statement lines — Parsec finds the claim numbers and amounts, ticks them, and checks the total. Mark them paid in one go; short ones land under Paid short."),
 ("Board", "Appealed sits with Submitted. Written off and customer pay close out in Paid, with what was actually paid."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Warranty checks</title>", "<title>Parsec Warranty after filing</title>")
rep("Parsec · Warranty — Checks before filing", "Parsec · Warranty — After filing")
rep("<h2>Checks before filing<small>The SRT, coverage and past returns — caught before Volvo sends a claim back.</small></h2>", "<h2>After filing<small>What happens to the money when Volvo answers.</small></h2>")

g = {"__name__": "__main__", "__file__": SRC}
exec(compile(src, SRC, "exec"), g)
