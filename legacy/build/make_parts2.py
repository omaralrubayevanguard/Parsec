# Parts mock-up v2 — Staged and Picked up statuses, hand-off rules that ask first, Parts runs every return, Setup with placeholders.
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_parts.py")
OUT = sys.argv[1]
src1 = open(SRC, encoding="utf-8").read()
g = {"__name__": "pt2", "__file__": SRC}
exec(src1.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

def fn_body(name):
    i = JS.index("function " + name + "(")
    b = JS.index("{", JS.index(")", i)); d = 0; k = b
    while True:
        ch = JS[k]
        if ch == "{": d += 1
        elif ch == "}":
            d -= 1
            if d == 0: break
        k += 1
    return i, k + 1

def fn_replace(name, new):
    global JS
    i, j = fn_body(name)
    JS = JS[:i] + new.strip() + JS[j:]

# ================= data =================
rep("['82491362','Headlamp, left',0,'',628.00,'VNL · 2018+',0]",
    "['82491362','Headlamp, left',0,'',628.00,'VNL · 2018+',0],['21479093','DPF gasket kit',3,'C3',38.20,'D13 · 2017+',2],['22325227','Fuel pump',0,'',412.00,'D13 · 2017+',0],['85134770','Brake chamber, type 30/30',6,'G3',96.80,'All models',2],['23175123','Alternator 24V 130A',0,'',512.00,'D13 · 2017+',0]")
i = JS.index("function seed(){"); j = JS.index("function reset(){")
seedtxt = JS[i:j]
seedtxt = seedtxt.replace("st:'Received'", "st:'Staged'")
a = "{st:'Staged',sup:'pdc',po:'55803',ord:'2026-10-21',eta:'2026-10-22',bin:'A4',rcv:461}"
assert seedtxt.count(a) == 1; seedtxt = seedtxt.replace(a, "{st:'Received',sup:'pdc',po:'55803',ord:'2026-10-21',eta:'2026-10-22',rcv:461}")
a = "log:[['10/22 07:43','Checked in · bin A4 · all parts in'],"
assert seedtxt.count(a) == 1; seedtxt = seedtxt.replace(a, "log:[['10/22 07:43','Gasket pulled from stock · bin A4'],['10/22 07:41','Water pump checked in at receiving · no bin yet'],")
seedtxt, nret = re.subn(r"\n    ret:\{[^}]*\},", "", seedtxt); assert nret == 2, nret
a = "   {no:'37771',cust:'Northline Transport'"
assert seedtxt.count(a) == 1
seedtxt = seedtxt.replace(a, """   {no:'37590',cust:'Silverline LTL',unit:'S-220',veh:'2020 Volvo VNL 760',eng:'D13',vin:'…LN230558',spot:'B7',tech:'MR',wr:'AM',
    ops:[{cmp:'Clean DPF and replace DPF pressure sensor',parts:[pt('22770789',1,{st:'Picked up',sup:'stock',bin:'',rcv:610,pk:800}),pt('21479093',1,{st:'Installed',sup:'stock',bin:'',rcv:610,pk:800})]}],log:[['10/22 13:20','<b>Mike</b> picked up bin A6 · sensor and gasket kit'],['10/22 10:10','Pulled from stock · bin A6']]},
   {no:'35915',cust:'Silverline LTL',unit:'S-114',veh:'2019 Volvo VNL 760',eng:'D13',vin:'…KN205561',spot:'—',tech:'AW',wr:'AM',ops:[],log:[['09/21 15:30','Failed part tagged FP-1003 · shelf W1 · hold for Volvo until 10/21']]},
   {no:'37555',cust:'Piedmont Aggregates',unit:'PA-31',veh:'2018 Volvo VHD',eng:'D11',vin:'…JN188254',spot:'—',tech:'DK',wr:'JT',ops:[],log:[['10/21 16:05','Customer declined the fuel pump job — pump came back to Parts · shelf R1'],['10/20 09:10','Ordered · PO 55796 · Volvo PDC']]},
""" + a)
JS = JS[:i] + seedtxt + JS[j:]
rep("function reset(){ S={R:seed(),C:JSON.parse(JSON.stringify(CAT0))};", """function seedT(){ return [
 {id:'FP-1001',kind:'warranty',desc:'Water pump',pn:'21468475',qty:1,ro:'37771',cust:'Northline Transport',claim:'W2619848',ra:'88213',st:'ship',by:'2026-10-27',shelf:'W3',to:'Volvo · warranty',why:'Volvo asked for the failed part',credit:0},
 {id:'FP-1002',kind:'warranty',desc:'Water pump',pn:'21468475',qty:1,ro:'37237',cust:'Highplains Grain',claim:'W2695599',st:'hold',by:'2026-11-13',shelf:'W4',to:'Volvo · warranty',why:'Held in case Volvo asks',credit:0},
 {id:'FP-1003',kind:'warranty',desc:'DPF pressure sensor',pn:'22770789',qty:1,ro:'35915',cust:'Silverline LTL',claim:'W2678765',st:'hold',by:'2026-10-21',shelf:'W1',to:'Volvo · warranty',why:'Held in case Volvo asks',credit:0},
 {id:'C-2001',kind:'core',desc:'Starter core',pn:'22088425',qty:1,ro:'37480',cust:'Yadkin Valley Dairy',st:'ship',by:'2026-10-29',shelf:'K2',to:'Volvo PDC',why:'Core charge on the new starter',credit:95},
 {id:'C-2002',kind:'core',desc:'Alternator core',pn:'23175123',qty:1,ro:'37701',cust:'Triad Cold Chain',st:'shipped',shipped:'10/20 · PDC truck',by:'2026-11-02',shelf:'K1',to:'Volvo PDC',why:'Core charge on the new alternator',credit:120},
 {id:'R-3001',kind:'supplier',desc:'Fuel pump',pn:'22325227',qty:1,ro:'37555',cust:'Piedmont Aggregates',st:'ra',shelf:'R1',to:'Volvo PDC',why:'Not needed — customer declined',credit:350.20},
 {id:'R-3002',kind:'supplier',desc:'Brake chamber, type 30/30',pn:'85134770',qty:2,ro:null,st:'ship',ra:'41187',shelf:'R2',to:'Volvo PDC',why:'Overstock — 4 over the max',credit:164.56},
 {id:'R-3003',kind:'supplier',desc:'Mud flap bracket',pn:'FP-MB2211',qty:1,ro:'37612',cust:'Midway Auto Transport',st:'credited',ra:'FP-77812',shipped:'10/16 · FleetPride pickup',credited:'10/21',shelf:'R3',to:'FleetPride',why:'Damaged in shipping',credit:58.40}
]; }
function reset(){ S={R:seed(),C:JSON.parse(JSON.stringify(CAT0)),T:seedT()};""")
rep("U={view:'desk',sel:'37750',pop:null,kb:false,open:{},done:[],cq:'',cflt:'all',kopen:{},q:''};",
    "U={view:'desk',sel:'37750',pop:null,kb:false,open:{},done:[],cq:'',cflt:'all',kopen:{},q:'',ask:[],rflt:'all',rsel:null,set:{},rule:{approval:'ask',parts:'ask'}};")
rep("const snap=()=>{ UNDO.push(JSON.stringify({S,done:U.done})); if(UNDO.length>30) UNDO.shift(); };",
    "const snap=()=>{ UNDO.push(JSON.stringify({S,done:U.done,ask:U.ask})); if(UNDO.length>30) UNDO.shift(); };")
rep("const x=JSON.parse(UNDO.pop()); S=x.S; U.done=x.done;", "const x=JSON.parse(UNDO.pop()); S=x.S; U.done=x.done; U.ask=x.ask||[];")

# ================= statuses =================
rep("const inHand=p=>p.st==='Received'||p.st==='Installed';",
    "const IN_ST=['Received','Staged','Picked up','Installed'], inHand=p=>IN_ST.includes(p.st), withTech=p=>p.st==='Picked up'||p.st==='Installed';\n"
    "const STS=['Not Ordered','Ordered','Backordered','Received','Staged','Picked up','Installed'];\n"
    "const STH={'Not Ordered':'still to get','Ordered':'on the way','Backordered':'supplier is short','Received':'checked in · no bin yet','Staged':'on a bin for the tech','Picked up':'the tech has it','Installed':'on the truck'};\n"
    "const stVar=k=>k==='Backordered'?'--tg-bad':k==='Received'?'--tg-good':k==='Staged'?'--tg-acc':k==='Picked up'?'--tg-st-customer':k==='Ordered'?'--tg-st-support':'--tg-ink3';\n"
    "const BINS=['A1','A2','A3','A4','A5','A6','A7','A8'];")
rep("const stCls={'Not Ordered':'no','Ordered':'ord','Backordered':'bo','Received':'in','Installed':'inst'};",
    "const stCls={'Not Ordered':'no','Ordered':'ord','Backordered':'bo','Received':'in','Staged':'stg','Picked up':'pk','Installed':'inst'};")
rep("const stTxt={'Not Ordered':'Not ordered','Ordered':'Ordered','Backordered':'Backordered','Received':'In hand','Installed':'Installed'};",
    "const stTxt={'Not Ordered':'Not ordered','Ordered':'Ordered','Backordered':'Backordered','Received':'Received','Staged':'Staged','Picked up':'Picked up','Installed':'Installed'};")
rep("const nextBin=()=>{ const used=new Set(S.R.flatMap(lines).filter(p=>p.st==='Received').map(p=>p.bin)); return ['A1','A2','A3','A4','A5','A6','A7','A8'].find(b=>!used.has(b))||'A8'; };",
    "const usedBins=()=>new Set(S.R.flatMap(lines).filter(p=>p.st==='Staged').map(p=>p.bin));\nconst nextBin=()=>{ const used=usedBins(); return BINS.find(b=>!used.has(b))||'A8'; };")
rep("const binOf=r=>{ const b=lines(r).map(p=>p.bin).filter(Boolean); return b[0]||null; };",
    "const binOf=r=>{ const b=lines(r).filter(p=>p.st==='Staged').map(p=>p.bin).filter(Boolean); return b[0]||null; };\nconst rcvd=r=>lines(r).filter(p=>p.st==='Received');")

# ================= returns: helpers =================
rep("const get=no=>S.R.find(r=>r.no===no);", r"""const get=no=>S.R.find(r=>r.no===no);
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
  return `${t.id} · ${rstTxt(t)}.`; }""")

# ================= what each RO needs =================
fn_replace("stateOf", r"""function stateOf(r){
  if(U.done.includes(r.no)) return 'done';
  if(r.route&&!r.route.acc) return 'sent';
  const L=lines(r);
  if(L.some(p=>p.st==='Not Ordered')) return 'order';
  if(L.some(late)) return 'late';
  if(L.length&&L.every(inHand)&&!L.every(withTech)) return 'in';
  if(retsOf(r).some(needs)) return 'ret';
  if(L.length&&L.every(withTech)) return 'tech';
  if(!L.length) return 'quiet';
  return 'way';
}""")
rep("function grouped(){ const G={sent:[],order:[],late:[],in:[],ret:[],way:[],done:[]};", "function grouped(){ const G={sent:[],order:[],late:[],in:[],ret:[],way:[],tech:[],quiet:[],done:[]};")
rep("const flat=()=>{ const G=grouped(); return GROUPS.flatMap(g=>G[g[0]]).concat(U.open.way?G.way:[]).map(r=>r.no); };",
    "const flat=()=>{ const G=grouped(); return GROUPS.flatMap(g=>G[g[0]]).concat(U.open.way?G.way:[],U.open.tech?G.tech:[]).map(r=>r.no); };")
fn_replace("why", r"""function why(r){ const st=stateOf(r), L=lines(r);
  if(st==='sent') return {t:`From ${F(r.route.from)} ${hm(r.route.at)} · ${r.route.why}`,late:!!r.route.now};
  if(st==='order'){ const no=L.filter(p=>p.st==='Not Ordered'), stk=no.filter(p=>(cat(p.pn)||{}).oh>=p.qty).length; return {t:`Approved ${hm(r.appr||r.route&&r.route.at||480)} · ${no.length} part${no.length>1?'s':''}${stk?` · ${stk} on the shelf`:''}`}; }
  if(st==='late'){ const p=L.find(late), l=late(p); return {t:r.spot[0]==='B'?`${r.spot} tied up ${dd(r.bay||TODAY,TODAY)} d · ${lc(p.desc)} ${l.t}`:`${p.desc} · ${l.t}`,late:true}; }
  if(st==='in'){ const rc=rcvd(r); return rc.length?{t:`${rc[0].desc} checked in ${hm(rc[0].rcv)} · needs a bin`,late:true}:{t:`All ${L.length} in · bin ${binOf(r)} · since ${hm(Math.max(...L.map(p=>p.rcv||0)))}`}; }
  if(st==='ret'){ const t=retsOf(r).find(needs); return {t:retWhy(t),late:retLate(t)}; }
  if(st==='way'){ const p=L.filter(x=>!inHand(x)).sort((a,b)=>(a.eta||'9')<(b.eta||'9')?-1:1)[0]; return {t:p?`${p.desc} · due ${p.eta===TODAY?'today':short(p.eta)}`:'—'}; }
  if(st==='tech') return {t:`${F(r.tech)} has every part · picked up ${hm(Math.max(...L.map(p=>p.pk||0)))}`};
  return {t:'Cleared'}; }""")
rep("const BTN={sent:r=>r.route.now?'Pull it':'Accept',order:()=>'Order…',late:()=>'Chase…',in:()=>'Send to Frank',ret:()=>'Ship…',way:()=>'Open'};",
    "const BTN={sent:r=>r.route.now?'Pull it':'Accept',order:()=>'Order…',late:()=>'Chase…',in:r=>rcvd(r).length?'Stage it':'Send to Frank',ret:r=>retAct(retsOf(r).find(needs))[1],way:()=>'Open',tech:()=>'Open'};")

# ================= the list: a With the tech section, 5 views =================
rep("""  if(G.done.length) body+=`<div class="tg-sec""", """  if(G.tech.length) body+=`<div class="tg-sec${U.open.tech?' open':''}" data-a="open" data-k="tech">${ic('chevR',12)}<span>With the tech</span><span class="n">${G.tech.length}</span><span class="m">every part picked up</span></div>`+(U.open.tech?G.tech.map(item).join(''):'');
  if(G.done.length) body+=`<div class="tg-sec""")
rep("<span>${kbd('1')}–${kbd('4')}views</span></div></section>`;", "<span>${kbd('1')}–${kbd('5')}views</span></div></section>`;")
rep("if(k>='1'&&k<='4'){ U.view=['desk','order','shelf','cat'][+k-1]; render(); return stop(); }", "if(k>='1'&&k<='5'){ U.view=['desk','order','shelf','ret','cat'][+k-1]; render(); return stop(); }")
rep("const body=v==='order'?vOrder():v==='shelf'?vShelf():v==='cat'?vCat():vDesk();", "const body=v==='order'?vOrder():v==='shelf'?vShelf():v==='cat'?vCat():v==='ret'?vRet():v==='setup'?vSetup():vDesk();")
rep("<div class=\"tk-tip\" hidden></div></div>${TOAST?", "${askCard()}<div class=\"tk-tip\" hidden></div></div>${TOAST?")

# ================= header: Returns tab, setup, returns count =================
rep("const vs=[['desk','inbox2','Desk'],['order','truck','On order'],['shelf','shelf','Shelf'],['cat','book','Catalog']];",
    "const vs=[['desk','inbox2','Desk'],['order','truck','On order'],['shelf','shelf','Shelf'],['ret','undo','Returns'],['cat','book','Catalog']];")
rep("${f('due',due,'due today')}", "${f('due',due,'due today')}${f('rets',S.T.filter(needs).length,'returns')}")
rep("""<button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Find a part, RO or customer (/)">${ic('search',16)}</button>""",
    """<button class="btn ib tg-srch-b" data-a="pop" data-p="srch" title="Find a part, RO or customer (/)">${ic('search',16)}</button><button class="btn ib tg-srch-b${U.view==='setup'?' on':''}" data-a="view" data-v="setup" title="Parts setup — suppliers, bins, returns, rules">${ic('gear',16)}</button>""")
rep("else if(a==='hf'){ const k=t.dataset.k; if(k==='due'){ U.view='order'; render(); return; }", "else if(a==='hf'){ const k=t.dataset.k; if(k==='due'){ U.view='order'; render(); return; } if(k==='rets'){ U.view='ret'; render(); return; }")

# ================= the RO pane =================
fn_replace("srcCell", r"""function srcCell(p,r){
  const c=cat(p.pn)||{}, l=late(p);
  if(p.st==='Not Ordered') return c.oh>=p.qty?`<span class="src"><b>On the shelf · ${c.bin}</b><small>${c.oh} on hand</small></span>`:`<span class="src"><b>To order</b><small>${c.oh?c.oh+' on hand · short':'none on hand'}</small></span>`;
  if(p.st==='Received') return `<span class="src"><b>Receiving · no bin yet</b><small class="late">checked in ${hm(p.rcv)}</small></span>`;
  if(p.st==='Staged') return `<span class="src"><b>Bin ${p.bin}</b><small>${p.sup==='stock'?'from stock':SUP[p.sup]+' · PO '+p.po}${p.rcv?' · '+hm(p.rcv):''}</small></span>`;
  if(p.st==='Picked up') return `<span class="src"><b>With ${F(r.tech)}</b><small>picked up ${hm(p.pk||NOW)}</small></span>`;
  if(p.st==='Installed') return `<span class="src"><b>On the truck</b><small>installed by ${F(r.tech)}</small></span>`;
  return `<span class="src"><b>${SUP[p.sup]} · PO ${p.po}</b><small class="${l?(l.k==='bo'?'bad':'late'):''}">${l?l.t:p.eta?(p.eta===TODAY?'due today':'due '+short(p.eta)):'no ETA'}</small></span>`; }""")
rep("${srcCell(p)}", "${srcCell(p,r)}")
rep(""":p.st==='Ordered'?`<button class="btn btn-sm" data-a="rcv1" data-pid="${p.id}">${ic('check',13)}It’s in</button>`:''}</span></div>`; }).j""",
    """:p.st==='Ordered'?`<button class="btn btn-sm" data-a="rcv1" data-pid="${p.id}">${ic('check',13)}It’s in</button>`:p.st==='Received'?`<button class="btn btn-sm" data-a="stage1" data-pid="${p.id}">Stage</button>`:p.st==='Staged'?`<button class="btn btn-sm" data-a="pk1" data-pid="${p.id}" title="The tech took it">${ic('check',13)}Picked up</button>`:''}</span></div>`; }).j""")
i = JS.index("  if(r.ret) h+=`<div class=\"pt-op\"><div class=\"pt-ret\">"); j = JS.index("\n", i)
JS = JS[:i] + r"""  const RT=retsOf(r); if(RT.length) h+=`<div class="pt-op"><div class="pt-oph"><span class="n">${ic('undo',13)}</span><b>Going back</b><span class="sp"></span><small>Parts runs every return</small></div>${RT.map(t=>{ const a=retAct(t); return `<div class="pt-ret"><span class="gi">${ic(t.kind==='warranty'?'warranty':t.kind==='core'?'undo':'box',16)}</span><b>${t.id} · ${esc(t.desc)}${t.qty>1?' × '+t.qty:''} · <span style="font-family:var(--tg-mono);font-weight:500">${t.pn}</span> <span class="pt-kind ${t.kind}">${KIND[t.kind]}</span></b><small>${esc(t.why)} · ${t.kind==='warranty'?`claim ${t.claim}${t.ra?' · RA '+t.ra:''}`:`${t.to}${t.ra?' · RA '+t.ra:''} · ${usd(t.credit)} credit`} · shelf ${t.shelf}${t.by&&t.st!=='credited'?` · ${t.st==='hold'?'hold until':'by'} ${short(t.by)}`:''} · <span class="pt-st ${rstCls(t)}" style="height:18px;cursor:default"><i></i>${rstTxt(t)}</span></small>${a?`<button class="btn btn-sm" data-a="rdo" data-tid="${t.id}">${a[1]}</button>`:''}</div>`; }).join('')}</div>`;""" + JS[j:]
fn_replace("nextBar", r"""function nextBar(r){
  const st=stateOf(r), L=lines(r);
  const bar=(t,btn,a,sec)=>`<div class="tg-next"><span class="k">Next</span><p>${t}</p>${btn?`<button class="btn btn-sm${a==='do'?' btn-primary':''}" data-a="do" data-ro="${r.no}">${btn}${kbd('↵')}</button>`:''}${sec||''}</div>`;
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
}""")

# ================= Shelf =================
fn_replace("vShelf", r"""function vShelf(){
  const ALL=S.R.flatMap(r=>lines(r).map(p=>({r,p})));
  const bins=BINS.map(b=>{ const L=ALL.filter(x=>x.p.st==='Staged'&&x.p.bin===b); return {b,r:L[0]&&L[0].r,L}; });
  const card=x=>{ if(!x.r) return `<div class="pt-bin empty"><span class="k">${x.b}</span><span class="w">Empty</span></div>`;
    const r=x.r, L=lines(r), n=L.filter(inHand).length, all=n===L.length;
    return `<div class="pt-bin" data-a="open" data-ro="${r.no}" data-k="ro"><span class="k">${x.b}<span class="sp"></span><em class="${all?'ok':'part'}">${all?'All in':n+' of '+L.length+' in'}</em></span><span class="t"><b class="tg-no">${r.no}</b><b>${esc(r.cust)}</b></span><span class="w"><span class="tg-av">${r.tech}</span>${F(r.tech)} · ${x.L.length} part${x.L.length>1?'s':''}<span class="sp"></span><button class="btn btn-sm pt-pk" data-a="pickup" data-bin="${x.b}" title="${F(r.tech)} took these">${ic('check',12)}Picked up</button></span></div>`; };
  const wait=ALL.filter(x=>x.p.st==='Received');
  const free=BINS.filter(b=>!usedBins().has(b));
  const picked=ALL.filter(x=>x.p.st==='Picked up'||(x.p.st==='Installed'&&x.p.pk)).sort((a,b)=>(b.p.pk||0)-(a.p.pk||0));
  const SH=[['W','Warranty',6],['K','Cores',4],['R','Supplier returns',4]];
  const shelves=SH.map(s=>`<div class="pt-shg"><small>${s[1]}</small><div>${Array.from({length:s[2]},(_,i)=>s[0]+(i+1)).map(id=>{ const t=S.T.find(x=>x.shelf===id&&!['shipped','credited','scrapped','back'].includes(x.st)); return t?`<button class="pt-shv${needs(t)?' act':''}" data-a="rsel" data-tid="${t.id}" title="${esc(t.desc)} · ${rstTxt(t)}"><b>${id}</b>${t.id}</button>`:`<span class="pt-shv off"><b>${id}</b>empty</span>`; }).join('')}</div></div>`).join('');
  return `<div class="pt-full"><div class="pt-fh"><h2>Shelf</h2><span class="sp"></span><button class="btn btn-sm" data-a="toast" data-t="Bin labels print — RO, customer, tech and a list of what’s in it.">${ic('print',14)}Print bin labels</button></div>
    ${wait.length?`<div class="pt-tg" style="padding-top:0;color:var(--tg-warn)">Waiting for a bin<span>${wait.length}</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">checked in at receiving — Received, not yet Staged</span></div>
    <div class="pt-tbl" style="padding-top:8px">${wait.map(x=>{ const b=binOf(x.r); const opts=b?[b]:free.slice(0,3); return `<div class="pt-wait"><span class="d"><b>${esc(x.p.desc)}</b><small>${x.p.pn} · checked in ${hm(x.p.rcv)}</small></span><span class="ro"><b class="tg-no">${x.r.no}</b> ${esc(x.r.cust)}</span><span class="tg-r">${opts.map((o,i)=>`<button class="tg-chip${i===0?' on':''}" data-a="stageto" data-pid="${x.p.id}" data-bin="${o}">${b?'With the rest · ':'Bin '}${o}</button>`).join('')}</span></div>`; }).join('')}</div>`:''}
    <div class="pt-tg"${wait.length?'':' style="padding-top:0"'}>Staged for the shop<span>${bins.filter(x=>x.r).length} of ${BINS.length} bins</span><span class="sp"></span><span style="font-weight:400;color:var(--tg-ink3)">Staged until the tech picks them up</span></div>
    <div class="pt-bins">${bins.map(card).join('')}</div>
    <div class="pt-two2"><div><div class="pt-tg">Return shelves<span>Parts runs every return</span><span class="sp"></span><button class="btn btn-sm tg-gh" data-a="view" data-v="ret">Open Returns</button></div><div class="pt-tbl pt-shs">${shelves}</div></div>
    <div><div class="pt-tg">Picked up today<span>${picked.length}</span></div><div class="pt-tbl">${picked.length?picked.map(x=>`<div class="pt-pkr"><time>${hm(x.p.pk)}</time><span class="tg-av">${x.r.tech}</span><span><b>${esc(x.p.desc)}</b> · <span class="tg-no">${x.r.no}</span></span>${stChip(x.p,0)}</div>`).join(''):'<div class="pt-none">Nothing picked up yet today.</div>'}</div></div></div></div>`;
}""")

# ================= Returns =================
JS = JS.replace("function kitPrice(k){", r"""function vRet(){
  const fl=U.rflt, L=S.T.filter(t=>fl==='all'||t.kind===fl);
  const G=[['todo','To do',t=>needs(t)],['hold','Holding for Volvo',t=>t.st==='hold'&&!needs(t)],['cr','Shipped — credit due',t=>t.st==='shipped'&&t.kind!=='warranty'],['done','Done',t=>['credited','scrapped','back'].includes(t.st)||(t.st==='shipped'&&t.kind==='warranty')]];
  const due=S.T.filter(t=>t.kind!=='warranty'&&['ra','ship','shipped'].includes(t.st)).reduce((s,t)=>s+t.credit,0);
  const row=t=>{ const a=retAct(t), r=t.ro&&get(t.ro);
    return `<div class="pt-rr${U.rsel===t.id?' hl':''}" data-tid="${t.id}"><span class="m">${t.id}</span><span class="d"><b>${esc(t.desc)}${t.qty>1?' × '+t.qty:''}</b><small>${t.pn} · shelf ${t.shelf}</small></span><span><span class="pt-kind ${t.kind}">${KIND[t.kind]}</span></span><span class="d"><b>${t.ro?`<span class="tg-no">${t.ro}</span> ${esc(t.cust)}`:'Stock'}</b><small>${esc(t.why)}</small></span><span class="d"><b>${esc(t.to)}</b><small>${t.ra?'RA '+t.ra:t.kind==='warranty'?'claim '+t.claim:t.kind==='core'?'no RA needed':'no RA yet'}</small></span><span class="dt${retLate(t)?' late':''}">${t.st==='credited'?'credited '+t.credited:t.shipped&&t.st!=='ship'?'shipped '+t.shipped.split(' · ')[0]:t.by?(t.st==='hold'?'hold until ':'by ')+short(t.by):'—'}</span><span class="m r">${t.credit?usd(t.credit):'—'}</span><span><span class="pt-st ${rstCls(t)}" style="cursor:default"><i></i>${rstTxt(t)}</span></span><span class="ac">${a?`<button class="btn btn-sm" data-a="rdo" data-tid="${t.id}">${a[1]}</button>`:r?`<button class="btn btn-sm tg-gh" data-a="open" data-ro="${t.ro}" data-k="ro">Open RO</button>`:''}</span></div>`; };
  const tbl=G.map(g=>{ const X=L.filter(g[2]); if(!X.length) return ''; return `<div class="pt-tg${g[0]==='todo'?' late':''}">${g[1]}<span>${X.length}</span></div>${X.map(row).join('')}`; }).join('')||'<div class="pt-none">No returns.</div>';
  const n=k=>S.T.filter(t=>k==='all'||t.kind===k).length;
  return `<div class="pt-full"><div class="pt-fh"><h2>Returns</h2><span class="tg-hf" style="cursor:default">Parts runs every return — warranty, cores and supplier returns. Warranty sees its own on the claim.</span><span class="sp"></span><button class="btn btn-sm btn-primary" data-a="pop" data-p="newret">${ic('plus',14)}Start a return</button></div>
   <div class="pt-cbar"><span class="tg-seg3">${[['all','All'],['warranty','Warranty'],['core','Cores'],['supplier','Supplier']].map(x=>`<button class="${U.rflt===x[0]?'on':''}" data-a="rflt" data-v="${x[0]}">${x[1]} · ${n(x[0])}</button>`).join('')}</span><span class="sp"></span><div class="pt-sum" style="margin:0"><span class="warn"><b>${S.T.filter(needs).length}</b>to do</span><span><b>${usd0(due)}</b>credit coming back</span><span><b>${S.T.filter(t=>t.st==='hold').length}</b>held for Volvo</span></div></div>
   <div class="pt-tbl"><div class="pt-rr h"><span>Tag</span><span>Part</span><span>Kind</span><span>RO · why</span><span>Back to</span><span>Due</span><span class="r">Credit</span><span>Status</span><span></span></div>${tbl}</div></div>`;
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
  return `<div class="pt-ask"><div class="h"><span class="i">${ic('swap',15)}</span><span><b>${L.length===1?`${L[0].no} has every part`:`${L.length} ROs have every part`}</b><small>All parts received → Foreman asks first</small></span></div>${L.map(r=>`<div class="r"><b class="tg-no">${r.no}</b><span>${esc(r.cust)} · bin ${binOf(r)}</span><button class="btn btn-sm${L.length===1?' btn-primary':''}" data-a="asksend" data-ro="${r.no}">Send to Frank</button></div>`).join('')}<div class="a"><button class="btn btn-sm tg-gh" data-a="askno">Not yet</button>${L.length>1?`<button class="btn btn-sm btn-primary" data-a="askall">Send both to Frank</button>`:''}</div></div>`; }
function kitPrice(k){""", 1)

# ================= popovers =================
rep("""const H={'Not Ordered':'still to get','Ordered':'on the way','Backordered':'supplier is short','Received':'in hand · on a bin','Installed':'on the truck'};""", "const H=STH;")
rep("""<span class="pt-dot" style="background:var(${k==='Backordered'?'--tg-bad':k==='Received'?'--tg-good':k==='Ordered'?'--tg-st-support':'--tg-ink3'})"></span>""", """<span class="pt-dot" style="background:var(${stVar(k)})"></span>""")
rep("<button class=\"tg-mi${f.q.st===k?' on':''}\" data-a=\"setst\"", "${k==='Received'?'<div class=\"pt-mis\"></div>':''}<button class=\"tg-mi${f.q.st===k?' on':''}\" data-a=\"setst\"")
i = JS.index("  if(p.type==='ship'){"); j = JS.index("  if(p.type==='send'){")
JS = JS[:i] + r"""  const T=p.tid?getT(p.tid):null;
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
""" + JS[j:]
rep("const ln=x=>{ const on=!!sel[x.p.id], l=late(x.p); return", "const ln=x=>{ const on=!!sel[x.p.id], l=late(x.p), stg=p.stage!==false; return")
rep("<span class=\"r\">${on?`<b>→ bin ${x.bin}</b>`:''}", "<span class=\"r\">${on?`<b>${stg?'→ bin '+x.bin:'→ receiving'}</b>`:''}")
rep("let bn=null; L.forEach(x=>{ const rb=binOf(x.r); x.bin=rb||(x.r._b||(x.r._b=nextBin())); });",
    "const used=usedBins(); L.forEach(x=>{ let b=binOf(x.r)||x.r._b; if(!b){ b=BINS.find(z=>!used.has(z))||'A8'; used.add(b); x.r._b=b; } x.bin=b; });")
rep("<div class=\"tg-acts\"><span class=\"hint\">Each part goes to its RO’s bin · ${n?n+' ticked':'tick what came'}</span>",
    "<label class=\"pt-ck\"><input type=\"checkbox\" data-a=\"stg\" ${p.stage!==false?'checked':''}><span>Put them on bins now — <b style=\"font-weight:500\">Staged</b>. Off: they wait at receiving as <b style=\"font-weight:500\">Received</b>.</span></label><div class=\"tg-acts\"><span class=\"hint\">${n?n+' ticked':'tick what came'}</span>")
rep("S.R.forEach(r=>{ lines(r).forEach(x=>{ if([x.pn,x.desc,r.no,r.cust].join(' ').toLowerCase().includes(q)) res.push({k:'ro',r,x}); });",
    "S.T.forEach(t=>{ if([t.id,t.pn,t.desc,t.ro||'',t.cust||''].join(' ').toLowerCase().includes(q)) res.push({k:'ret',t}); });\n      S.R.forEach(r=>{ lines(r).forEach(x=>{ if([x.pn,x.desc,r.no,r.cust].join(' ').toLowerCase().includes(q)) res.push({k:'ro',r,x}); });")
rep("${q?(R.length?R.map((x,i)=>x.k==='ro'?", "${q?(R.length?R.map((x,i)=>x.k==='ret'?`<button class=\"pt-srr${i===0?' k':''}\" data-a=\"rsel\" data-tid=\"${x.t.id}\"><span class=\"gi\">${ic('undo',14)}</span><b>${x.t.id} · ${esc(x.t.desc)}</b><span class=\"m\">${x.t.pn}</span><small>Return · ${KIND[x.t.kind]} · ${rstTxt(x.t)} · shelf ${x.t.shelf}</small></button>`:x.k==='ro'?")
rep("${x.x.bin&&x.x.st==='Received'?' · bin '+x.x.bin:''}", "${x.x.bin&&x.x.st==='Staged'?' · bin '+x.x.bin:''}")
rep("`:'Return on the shelf'}</small>", "`:'Returns only'}</small>")
JS = JS.replace("function pop(){", r"""function newCands(){ const L=[];
  S.R.forEach(r=>lines(r).forEach(p=>{ if(p.st==='Staged'||p.st==='Received') L.push({k:'ro:'+p.id,pid:p.id,ro:r.no,cust:r.cust,desc:p.desc,pn:p.pn,qty:p.qty,price:p.price,st:p.st,to:p.sup==='fp'?'FleetPride':'Volvo PDC'}); }));
  S.C.forEach(c=>{ if(c.min&&c.oh>=c.min*3) L.push({k:'cat:'+c.pn,desc:c.desc,pn:c.pn,qty:c.oh-c.min*2,price:c.price,oh:c.oh,min:c.min,to:'Volvo PDC'}); });
  return L; }
function pop(){""", 1)

# ================= doing things =================
fn_replace("doIt", r"""function doIt(no,el){ const r=get(no); if(!r) return; U.sel=no; const st=stateOf(r);
  if(st==='sent'){ snap(); r.route.acc=1; logIt(r,'Parts accepted');
    if(r.route.now){ const p=lines(r)[0], c=cat(p.pn); c.oh-=p.qty; Object.assign(p,{st:'Picked up',sup:'stock',bin:'',rcv:NOW,pk:NOW}); logIt(r,`Pulled from stock · bin ${c.bin} · <b>${F(r.tech)}</b> picked it up at the counter`); toast(`Pulled the ${lc(p.desc)} from ${c.bin} — ${F(r.tech)} picked it up. ${c.oh} left on the shelf.`); render(); return; }
    toast(`Accepted — ${r.no} is under To order.`); render(); return; }
  if(st==='order') return openPop('order',{ro:no,tell:true},el);
  if(st==='late') return openPop('chase',{ro:no,tell:true},el);
  if(st==='in'){ const rc=rcvd(r); if(rc.length){ snap(); const b=binOf(r)||nextBin(); rc.forEach(p=>{ p.st='Staged'; p.bin=b; }); logIt(r,`Staged · ${rc.map(p=>p.desc).join(', ')} · bin ${b}`); U.ask=[r.no]; toast(`Staged in ${b} — every part for ${r.no} is on its bin.`); render(); return; } return openPop('hand',{ro:no},el); }
  if(st==='ret'){ const t=retsOf(r).find(needs); return openPop(retAct(t)[0],{tid:t.id,ro:no},el); }
  U.view='desk'; render(); }""")
rep("if(t.dataset.ro) ex.ro=t.dataset.ro; if(t.dataset.p==='chk') ex.sel={};", "if(t.dataset.ro) ex.ro=t.dataset.ro; if(t.dataset.tid) ex.tid=t.dataset.tid; if(t.dataset.p==='chk') ex.sel={};")
i = JS.index("  else if(a==='setst'){"); j = JS.index("\n", JS.index("  else if(a==='rcv1'){"))
JS = JS[:i] + r"""  else if(a==='setst'){ const f=S.R.flatMap(x=>lines(x).map(q=>({r:x,q}))).find(x=>x.q.id===t.dataset.pid); if(!f) return; snap(); const v=t.dataset.v, q=f.q; q.st=v;
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
""" + JS[j:]
rep("mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop, r=p&&p.ro?get(p.ro):null;",
    "mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop, r=p&&p.ro?get(p.ro):null, T_=p&&p.tid?getT(p.tid):null;")
i = JS.index("  else if(a==='sgo'){"); j = JS.index("\n", i)
JS = JS[:i] + r"""  else if(a==='sgo'){ const t=T_; if(!t||!p.c) return; snap(); t.shipped=`${md(TODAY)} · ${p.c}`; t.st='shipped'; if(t.kind==='warranty') t.trk=p.tr||''; const rr=t.ro&&get(t.ro); if(rr) logIt(rr,`${t.id} shipped · ${p.c}${p.tr?' · '+esc(p.tr):''}`); U.pop=null; toast(t.kind==='warranty'?`${t.id} shipped — Warranty sees it on claim ${t.claim}.`:`${t.id} shipped — ${usd(t.credit)} credit due once it lands.`); render(); }""" + JS[j:]
rep("const full=[...done].filter(no=>lines(get(no)).every(inHand));\n    U.pop=null; toast(`${L.length} part${L.length>1?'s':''} checked in${full.length?` · ${full.join(' and ')} ${full.length>1?'have':'has'} every part — under Arrived`:''}.`); if(full.length){ U.view='desk'; U.sel=full[0]; } render(); }",
    "const full=[...done].filter(no=>lines(get(no)).every(inHand)&&!rcvd(get(no)).length);\n    U.pop=null; U.ask=full; toast(`${L.length} part${L.length>1?'s':''} checked in${p.stage!==false?' and staged':' — waiting at receiving'}.`); if(full.length){ U.view='desk'; U.sel=full[0]; } render(); }")
rep("L.forEach(x=>{ const b=binOf(x.r)||nextBin(); Object.assign(x.p,{st:'Received',bin:b,rcv:NOW}); done.add(x.r.no); logIt(x.r,`Checked in · ${x.p.desc} · bin ${b}`); });",
    "const stg=p.stage!==false; L.forEach(x=>{ const b=stg?(binOf(x.r)||nextBin()):''; Object.assign(x.p,{st:stg?'Staged':'Received',bin:b,rcv:NOW}); done.add(x.r.no); logIt(x.r,`Checked in · ${x.p.desc}${stg?' · staged in '+b:' · at receiving'}`); });")
rep("if(c.oh>=x.qty){ c.oh-=x.qty; b=b||nextBin(); Object.assign(x,{st:'Received',sup:'stock',bin:b,rcv:NOW}); }", "if(c.oh>=x.qty){ c.oh-=x.qty; b=b||nextBin(); Object.assign(x,{st:'Staged',sup:'stock',bin:b,rcv:NOW}); }")
rep("U.pop=null; toast(buy.length?", "if(!buy.length) U.ask=[r.no]; U.pop=null; toast(buy.length?")
rep("`Pulled ${stk} from stock — bin ${b}. Every part is in.`", "`Pulled ${stk} from stock — staged in ${b}. Every part is in.`")
rep("else if(a==='hgo'){ snap();", "else if(a==='hgo'){ snap(); U.ask=U.ask.filter(x=>x!==r.no);")
rep("if(id==='pt-hn') p.n=e.target.value;", "if(id==='pt-hn') p.n=e.target.value; if(id==='pt-ra') p.ra=e.target.value; if(id==='pt-cr') p.cr=e.target.value; if(id==='pt-cm') p.cm=e.target.value;")
rep("  if(!p) return;\n  if(id==='pt-hn')", "  if(e.target.dataset.set){ const k=e.target.dataset.set; U.set[k]=e.target.value; const c=e.target.parentNode.querySelector('.pt-ph'); if(c){ c.textContent=e.target.value?'set':'placeholder'; c.classList.toggle('set',!!e.target.value); } return; }\n  if(!p) return;\n  if(id==='pt-hn')")
rep("const b=$(`.tg-pop [data-a=\"oset\"][data-o=\"${n-1}\"]:not([disabled])`)||$$('.tg-pop .tg-mi')[n-1];", "const b=$(`.tg-pop [data-a=\"oset\"][data-o=\"${n-1}\"]:not([disabled])`)||$$('.tg-pop .tg-mi')[n-1];")
rep("if(U.pop&&!U.pop._f){ const f=$('.tg-pop #pt-scan')||$('.tg-pop #pt-sq')||$('.tg-pop #pt-hn');", "if(U.pop&&!U.pop._f){ const f=$('.tg-pop #pt-scan')||$('.tg-pop #pt-sq')||$('.tg-pop #pt-hn')||$('.tg-pop #pt-ra');")
rep("document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"]')){",
    "document.addEventListener('pointerdown',e=>{ if(!mock.contains(e.target)) return; if(U.pop&&!e.target.closest('.tg-pop,[data-a=\"pop\"],[data-a=\"do\"],[data-a=\"rdo\"]')){")

# ================= demos =================
i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const DEMO={
  desk:()=>{reset();render();},
  sts:()=>{reset();U.sel='37455';render();const b=$('.pt-pr .pt-st[data-a="pop"]');openPop('st',{pid:b.dataset.pid},b);},
  chk:()=>{reset();U.sel='37628';render();const b=$('[data-a="pop"][data-p="chk"]');const L=dueLines();openPop('chk',{sel:{[L.find(x=>x.r.no==='37628').p.id]:true,[L.find(x=>x.r.no==='37720').p.id]:true}},b);},
  ask:()=>{reset();U.sel='37628';render();const b=$('[data-a="pop"][data-p="chk"]');const L=dueLines();openPop('chk',{sel:{[L.find(x=>x.r.no==='37628').p.id]:true,[L.find(x=>x.r.no==='37720').p.id]:true}},b);$('[data-a="kgo"]').click();},
  shelf:()=>{reset();U.view='shelf';render();},
  ret:()=>{reset();U.view='ret';render();},
  newret:()=>{reset();U.view='ret';render();const b=$('[data-a="pop"][data-p="newret"]');const c=newCands().find(x=>x.ro==='37455'&&x.st==='Received');openPop('newret',{k:c.k,why:'Damaged'},b);},
  setup:()=>{reset();U.view='setup';render();}
};""" + JS[j:]

CSS += r"""
/* ===== v2: Staged · Picked up · ask first · returns · setup ===== */
.pt-st.stg{background:var(--tg-acct);color:var(--tg-acctx);}
.pt-st.pk{background:color-mix(in srgb,var(--tg-st-customer) 13%,transparent);color:var(--tg-st-customer);}
.pt-mis{height:1px;margin:4px 8px;background:var(--tg-hair);}
.tg-next p .pt-rule{display:inline-flex;align-items:center;gap:5px;margin-left:10px;height:20px;padding:0 7px;border-radius:6px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-accl);font-size:11.5px;font-weight:500;color:var(--tg-acctx);vertical-align:1px;white-space:nowrap;}
.pt-kind{display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font:600 10.5px/1 var(--tg-sans);letter-spacing:.02em;vertical-align:1px;}
.pt-kind.warranty{background:color-mix(in srgb,var(--tg-st-customer) 12%,transparent);color:var(--tg-st-customer);}
.pt-kind.core{background:var(--tg-acct);color:var(--tg-acctx);}
.pt-kind.supplier{background:var(--tg-fill);color:var(--tg-ink2);}
.pt-ret{box-shadow:inset 0 -1px 0 var(--tg-hair);} .pt-ret:last-child{box-shadow:none;}
.pt-ret small{display:flex;flex-wrap:wrap;align-items:center;gap:4px;}
.pt-rr{display:grid;grid-template-columns:70px minmax(0,1.3fr) 76px minmax(0,1.5fr) minmax(0,1fr) 108px 78px 150px 118px;gap:12px;align-items:center;min-height:50px;padding:4px 6px;border-radius:10px;font-size:13px;}
.pt-rr.h{min-height:28px;font-size:11.5px;color:var(--tg-ink3);}
.pt-rr.hl{background:var(--tg-sel);box-shadow:inset 0 0 0 1px var(--tg-border);}
.pt-rr .m{font:500 12.5px/1 var(--tg-mono);} .pt-rr .r{text-align:right;}
.pt-rr .d{display:flex;flex-direction:column;gap:2px;min-width:0;} .pt-rr .d b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pt-rr .d small{font-size:12px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-rr .dt{font-size:12.5px;color:var(--tg-ink2);white-space:nowrap;} .pt-rr .dt.late{color:var(--tg-warn);font-weight:500;}
.pt-rr .ac{display:flex;justify-content:flex-end;}
.pt-kv{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0 0 6px;padding:2px 2px 4px;font-size:12.5px;}
.pt-kv span{color:var(--tg-ink3);} .pt-kv b{font-weight:500;font-family:var(--tg-mono);font-size:12.5px;}
.pt-bin .pt-pk{height:22px !important;padding:0 7px !important;font-size:11.5px;margin:-3px -5px -3px 0;}
.pt-wait{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:12px;align-items:center;min-height:46px;padding:2px 2px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:13px;}
.pt-wait:last-child{box-shadow:none;}
.pt-wait .d{display:flex;flex-direction:column;gap:2px;min-width:0;} .pt-wait .d b{font-weight:500;} .pt-wait .d small{font-size:12px;color:var(--tg-ink3);}
.pt-wait .ro{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink2);}
.pt-two2{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px;}
.pt-shs{padding:10px 14px 12px;display:flex;flex-direction:column;gap:10px;}
.pt-shg small{display:block;font-size:11.5px;color:var(--tg-ink3);margin-bottom:5px;}
.pt-shg > div{display:flex;flex-wrap:wrap;gap:6px;}
.pt-shv{all:unset;box-sizing:border-box;display:inline-flex;flex-direction:column;gap:1px;min-width:74px;padding:6px 9px;border-radius:9px;font:500 11.5px/15px var(--tg-mono);color:var(--tg-ink);background:var(--tg-fill);cursor:pointer;}
.pt-shv b{font:600 11px/14px var(--tg-mono);color:var(--tg-ink3);}
.pt-shv:hover{box-shadow:inset 0 0 0 1px var(--tg-bs);}
.pt-shv.act{background:var(--tg-warn-t);color:var(--tg-warn);} .pt-shv.act b{color:var(--tg-warn);}
.pt-shv.off{cursor:default;background:repeating-linear-gradient(135deg,transparent 0 5px,var(--tg-hair) 5px 6px);color:var(--tg-ink4);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.pt-pkr{display:grid;grid-template-columns:44px 22px minmax(0,1fr) auto;gap:10px;align-items:center;min-height:38px;padding:2px 2px;box-shadow:inset 0 -1px 0 var(--tg-hair);font-size:12.5px;}
.pt-pkr:last-child{box-shadow:none;}
.pt-pkr time{font:500 12px/1 var(--tg-mono);color:var(--tg-ink3);} .pt-pkr b{font-weight:500;}
.pt-pkr > span:nth-child(3){white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pt-ask{position:absolute;right:24px;bottom:24px;z-index:36;width:420px;padding:14px 16px;border-radius:14px;background:var(--tg-raised);box-shadow:0 18px 44px -14px rgba(0,0,0,.35),inset 0 0 0 1.5px var(--tg-accl);font-size:13px;color:var(--tg-ink);}
.pt-ask .h{display:flex;gap:12px;align-items:center;margin-bottom:8px;}
.pt-ask .i{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;flex:none;background:var(--tg-acct);color:var(--tg-acctx);}
.pt-ask .h b{display:block;font-size:14px;font-weight:600;line-height:20px;} .pt-ask .h small{display:block;font-size:12px;color:var(--tg-ink3);}
.pt-ask .r{display:flex;align-items:center;gap:10px;min-height:38px;box-shadow:inset 0 1px 0 var(--tg-hair);}
.pt-ask .r span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink2);}
.pt-ask .a{display:flex;justify-content:flex-end;gap:6px;margin-top:8px;}
.pt-setg{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;}
.pt-setg > div{display:flex;flex-direction:column;gap:14px;}
.pt-set{border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);padding:12px 16px 8px;}
.pt-seth{display:flex;align-items:baseline;gap:10px;margin-bottom:4px;} .pt-seth b{font-size:13.5px;font-weight:600;} .pt-seth small{font-size:12px;color:var(--tg-ink3);}
.pt-setr{display:grid;grid-template-columns:minmax(0,190px) minmax(0,1fr) 84px;gap:12px;align-items:center;min-height:44px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:13px;}
.pt-setr:first-of-type{box-shadow:none;}
.pt-setr > span:first-child{display:flex;flex-direction:column;gap:1px;color:var(--tg-ink);} .pt-setr > span:first-child small{font-size:11.5px;color:var(--tg-ink3);}
.pt-setr input{width:100%;height:32px;}
.pt-setr input::placeholder{color:var(--tg-ink4);font-style:italic;}
.pt-setr .tg-seg3{justify-self:start;}
.pt-ph{justify-self:end;display:inline-flex;align-items:center;height:18px;padding:0 6px;border-radius:5px;font-size:10.5px;font-weight:600;letter-spacing:.02em;background:var(--tg-warn-t);color:var(--tg-warn);}
.pt-ph.set{background:var(--tg-good-t);color:var(--tg-good);}
.tg-srch-b.on{background:var(--tg-fill);}
"""

used = set(re.findall(r"ic\('([A-Za-z0-9]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "cart", "clock", "check", "undo", "box", "inbox2", "truck", "shelf", "book"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("desk", "1 · Desk"), ("sts", "2 · Seven statuses"), ("chk", "3 · Check in → Staged"), ("ask", "4 · Asks first"), ("shelf", "5 · Shelf · picked up"), ("ret", "6 · Returns"), ("newret", "7 · Start a return"), ("setup", "8 · Setup · placeholders")])
about = [
 ("Statuses", "Not ordered → Ordered / Backordered → Received (checked in) → Staged (on a bin) → Picked up (the tech has it) → Installed."),
 ("Hand-off rules ask first", "Approval done → Parts asks the writer; All parts received → Foreman asks you, with Send to Frank or Not yet."),
 ("Parts runs every return", "Warranty returns, cores and supplier returns in one Returns tab: RA, ship, credit in, done holding. Warranty sees its own on the claim."),
 ("Setup", "Suppliers, delivery times, bins and shelves, return rules and part-number format — grey placeholders until you type the real ones."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Parts mock-up v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Parts — v2</h1><div class="wt-ideas wt-demo">{demos}</div>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Parts · v2<small>The four changes. Everything from the first mock-up still works. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
