# Manager v3 mock-up -> the Manager page module on real data (b9/mg1.js).
# The mock's engine and views stay as written; the made-up shop is swapped for pgShopData(), the mock frame
# for the page frame (PG), and the mock-only bits (demo buttons, spotlight notes, fake toasts) for real actions.
import os, re, sys
H = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(H, "src", "manager.js"), encoding="utf-8").read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:110], c)
    s = s.replace(a, b)

def cut(a, b, new="", incl=False):
    global s
    i = s.index(a); j = s.index(b, i) + (len(b) if incl else 0)
    s = s[:i] + new + s[j:]

# ---------- the frame ----------
cut("const $=(s,r=document)=>", "const p2=n=>", """const PGR=()=>document.querySelector('[data-pg="manager"]')||document;
const $=s=>PGR().querySelector(s), $$=s=>[...PGR().querySelectorAll(s)];
const LOGO=typeof PX_LOGO!=='undefined'?PX_LOGO:'';
const esc=PG.e, ic=PG.ic, kbd=PG.kbd;
""")
rep("const TODAY='2026-10-22';", "let TODAY=todayStr();")
cut("const PPL={RH:", "const PAY={", """let PPL={}, TECHS=[], CUST=[], RATE=210, BAYS=8;
const F=k=>String((PPL[k]||k||'')).split(' ')[0];
""")
# ---------- the made-up shop -> the real one ----------
cut("/* ---------- a dealership’s last 210 days", "const ST_COL=", """/* ---------- the shop, from Parsec: pgShopData() builds it once per change ---------- */
let ROS=[], TB={}, ATT={}, BAYU={}, BYC={}, BYO={}, START=TODAY, DAYS=0, SD=null;
""")
# open ROs never close in the real data: what's left is quoted minus clocked
rep("function left(r,t){ const tot=Math.max(1,dd(r.open,r.close)), el=Math.min(tot,dd(r.open,t)+.5); return Math.max(0,r.q*(1-el/tot)); }",
    "function left(r,t){ return Math.max(0,r.q-r.b); }")
rep("const partsAt=(t,F)=>openAt(t,F).filter(r=>r.pw&&t<addW(r.open,r.pw+1));", "const partsAt=(t,F)=>openAt(t,F).filter(r=>r.pwWin&&r.pwWin[0]<=t&&t<r.pwWin[1]);")
rep("const late=pw>0&&R()<.32;", "const late=pw>0&&R()<.32;", 0)
# ---------- what the page holds besides the numbers ----------
cut("const NEEDS0=[", "const RT={", """/* Needs you: what's in the manager's Inbox that needs an answer */
function NEEDS(){ if(typeof IB==='undefined') return []; const me=PG.me().name; return IB.itemsFor(me).filter(n=>(n.st==='new'||n.st==='read')&&(n.k==='ask'||n.k==='men')).sort((a,b)=>new Date(b.at)-new Date(a.at)).map(n=>{ const ro=n.ro&&getRO(n.ro);
  return {id:n.key,ic:(({parts:'parts',triage:'triage',foreman:'foreman',warranty:'warranty',fixes:'fixes',timelog:'timelog',console:'console'})[n.src])||'inbox',h:esc(n.t),p:(ro?`<b>${esc(tgNum(ro))} ${esc(ro.customerName||'')}</b> — `:'')+esc(n.b||n.q||('From '+n.from)),a:[[ro?'Open RO':'Open','open'],['Done','done']],ro:n.ro,n}; }); }
""")
cut("const HOLD=(()=>{", "const NAV=", """/* who holds each open RO, and for how long */
let HOLD=[];
/* an RO nobody has handed off sits with whoever its status waits on */
function stHolder(ro){ let st=''; try{ st=roStatus(ro).status||''; }catch(e){} return /Parts/.test(st)?'parts':/Customer|Approval|Estimate/.test(st)?'writer':/Foreman/.test(st)?'foreman':/Warranty/.test(st)?'warranty':/Manager/.test(st)?'manager':'tech'; }
function holdsOf(){ const L=[]; ROS.filter(r=>r.close>TODAY).forEach(r=>{ const ro=r.ro; let h=null; try{ h=rtHolder(ro); }catch(e){} const to=ro.route?(h&&RT[h.to]?h.to:'tech'):stHolder(ro); const since=(()=>{ try{ return rtHeldSince(ro); }catch(e){ return ro.dateOpened; } })(); const pend=!!(ro.route&&ro.route.state==='pending');
  L.push({r,to:pend&&RT[ro.route.to]?ro.route.to:to,min:Math.max(0,Math.round((Date.now()-new Date(since||ro.dateOpened))/60000)),pend,pm:pend?Math.max(0,Math.round((Date.now()-new Date(ro.route.at))/60000)):0}); }); return L; }
""")
rep("const NAV=[['console','Console'],['ros','Repair Orders'],['warranty','Warranty'],['fixes','Fixes'],['foreman','Foreman'],['manager','Manager'],['triage','Triage'],['rolist','RO List'],['timelog','Time Log'],['parts','Parts'],['career','Career']];",
    "let NAV=[];")
rep("const ROLES={'Technician':['console','ros','fixes','timelog','parts','career'],'Foreman':['console','ros','fixes','foreman','triage','timelog','parts','career'],'Manager':['console','ros','warranty','fixes','foreman','manager','triage','timelog','parts','career'],'Service writer':['ros','warranty','fixes','triage','parts'],'Warranty admin':['ros','warranty','fixes','parts'],'Triage':['ros','triage'],'Parts':['ros','parts']};",
    "let ROLES={};")
cut("const STAFF0=[", "const DEPT=", """let STAFF0=[];
""")
cut("const AL0=(()=>{", "let U, UNDO, TOAST, TT;", """/* the activity log: the last week of the audit trail */
let AL0=[];
const ALT={status:['status','flag','set status'],release:['release','check','released'],checkin:['checkin','keyTag','checked in'],estimate:['estimate','send','sent the estimate on'],route:['handoff','swap','handed off'],signin:['signin','user','signed in'],staff:['staff','manager','changed'],'punch-del':['delete','trash','deleted a punch'],'ro-del':['delete','trash','deleted an RO']};
function alOf(){ const from=addD(TODAY,-6); return (Array.isArray(STATE.audit)?STATE.audit:[]).filter(a=>a.at&&localDay(a.at)>=from).slice(-400).reverse().map(a=>{ const t=ALT[a.type]||[a.type,'history',a.type]; const ro=a.ro&&getRO(a.ro), d=new Date(a.at);
  return {day:localDay(a.at),m:d.getHours()*60+d.getMinutes(),ty:t[0],ic:t[1],verb:'',by:SD.keyOf(a.by||'Admin'),ro:ro?tgNum(ro):(a.num?String(a.num).replace(/^RO[\\s-]*/i,''):null),roId:ro?ro.id:null,cust:ro?ro.customerName||'':'',text:a.text||''}; }); }
""")
rep("|~${P_.done} of ${P_.tot} workdays done", "${k.base&&U.tg[k.id]==null?'|~The goal is your own last 90 days — set yours in KPIs':''}|~${P_.done} of ${P_.tot} workdays done")
rep("<button class=\"mg-pc${i===0?' main':''}\"", "<button class=\"mg-pc${i===0?' m0':''}\"")   # .main is the app's page frame
rep("return n>=3?{id:'al-'+id,k,n,v:val(k,TODAY,TODAY)}:null;", "if(n<3) return null; let d=TODAY, v=null; for(let g=0;g<14&&v==null;g++){ if(wf(d)) v=val(k,d,d); if(v==null) d=addD(d,-1); } return {id:'al-'+id,k,n,v,d};")
rep('workdays in a row — ${fmt(a.k.u,a.v)} today.`', 'workdays in a row${a.v!=null?\' — \'+fmt(a.k.u,a.v)+(a.d===TODAY?\' today\':\' on \'+fd(a.d)):\'\'}.`')
# ---------- the page's own settings live in STATE.mgSet; rules and goals are the shop's hand-off settings ----------
cut("function reset(){ MEMO.forEach(", "const snap=()=>", """const ordN=n=>n+(['th','st','nd','rd'][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);
function mgSet(){ const s=STATE.mgSet&&typeof STATE.mgSet==='object'?STATE.mgSet:(STATE.mgSet={}); if(!Array.isArray(s.pins)||s.pins.length!==12) s.pins=PINS0.slice(); if(!s.tg) s.tg={}; if(!s.al) s.al={prod:1,eff:1,cb:1,fill:1,fc:1,days:1}; if(!s.mute) s.mute={}; if(!s.pg) s.pg={}; if(!s.chkx) s.chkx={}; return s; }
/* the per-workday goals start at the shop's own last 90 days (rounded) until the manager sets one; $ per hour starts at the labor rate */
function baseTargets(){ const b=addD(TODAY,-1), a=addD(TODAY,-91)<START?START:addD(TODAY,-91), n=wdIn(a,b); const nice=v=>{ const e=Math.pow(10,Math.floor(Math.log10(Math.abs(v)))-1); return +(Math.round(v/e)*e).toPrecision(2); };
  K.forEach(k=>{ if(!('tw0' in k)) k.tw0=k.tw; if(k.tw0==null) return; let v=null; try{ v=n>=10?val(k,a,b):null; }catch(e){} k.tw=v!=null&&v>0?nice(v/n):k.tw0; k.base=v!=null&&v>0; });
  if(KM.lph) KM.lph.t=RATE; }
function reset(){ MEMO.clear(); U={view:'ov',p:'mo',sel:'eff',bf:null,bk:null,brk:{},ed:false,pop:null,kb:false,lf:'all',q:'',flow:'parts',person:null,alf:'all',alw:'',nall:false,unl:false,rep:null,repn:'',fleet:null}; UNDO=[]; }
/* every draw: the shop from pgShopData, the page's settings from STATE */
function sync(){ NAV=NAV_PAGES.filter(x=>x[0]!=='inbox'); ROLES=STAFF_ROLES; SD=pgShopData(); TODAY=SD.TODAY; if(SD!==U._sd){ U._sd=SD; ROS=SD.ROS; TB=SD.TB; ATT=SD.ATT; BAYU=SD.BAYU; BYC=SD.BYC; BYO=SD.BYO; PPL=SD.PPL; TECHS=SD.TECHS; CUST=SD.CUST; START=SD.START; DAYS=dd(START,TODAY); RATE=SD.RATE; BAYS=SD.BAYS; MEMO.clear(); for(const k in PCACHE) delete PCACHE[k]; HOLD=holdsOf(); AL0=alOf(); CHK0=chkOf(); SHARE=null; PAYA=null; baseTargets(); }
  const M=mgSet(); U.tg=M.tg; U.pins=M.pins; U.al=M.al; U.mute=M.mute; U.pg=PGS(); U.chk=CHK0.map(c=>c.id).filter(id=>!M.chkx[id]); U.needs=[];
  const c=rtCfg(); U.rules=c.rules.map(r=>({k:r.k,when:r.when,to:r.to,m:r.mode})); U.goals=c.goals; U.acc=c.needAccept!==false;
  STAFF0=staffList().filter(sf=>sf.name).map(sf=>[SD.keyOf(sf.name),sf.role]); U.roles=Object.fromEntries(STAFF0); U.pages=Object.fromEntries(staffList().filter(sf=>sf.name).map(sf=>[SD.keyOf(sf.name),Object.assign({},sf.pages||{})]));
  if(U.addK){ const nk=SD.keyOf(U.addK); U.addK=null; if(U.roles[nk]) U.person=nk; }
  if(!U.person||!U.roles[U.person]) U.person=(STAFF0.find(x=>x[1]==='Technician')||STAFF0[0]||[null])[0];
  if(!U.fleet||!CUST.includes(U.fleet)) U.fleet=CUST[0]||null;
  if(!KM[U.sel]) U.sel='eff'; }
const staffOf=k=>staffList().find(sf=>sf.name&&SD.keyOf(sf.name)===k);
const meK=()=>SD.keyOf(PG.me().name);
""")
rep("const snap=()=>{ UNDO.push(JSON.stringify({al:U.al,mute:U.mute,pg:U.pg,chk:U.chk,tg:U.tg,pins:U.pins,needs:U.needs,rules:U.rules,goals:U.goals,pages:U.pages,roles:U.roles,acc:U.acc})); if(UNDO.length>30) UNDO.shift(); };",
    "let DIRTY=false; const snap=()=>{ pushUndo('manager'); DIRTY=true; };")
rep("function toast(t,undo=true){ TOAST={t,undo}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }", "const toast=(t,u=true)=>pushToast(t,u);")
# ---------- drawing ----------
cut("let RENDERING=false;\nfunction render(){", "function head(){", """function view(){ sync();
  if(!ROS.length) return `<div class="tg mg" data-pg="manager">${head()}<div class="tg-body"><div class="tg-main"><div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('chart',22)}</span><h3>No ROs yet</h3><p>The numbers build from the ROs, the Time Log and the parts as the shop uses Parsec.</p></div></div></div></div></div>`;
  const v=U.view, body=v==='kpi'?vKpi():v==='fleet'?vFleet():v==='flow'?vFlow():v==='team'?vTeam():v==='act'?vAct():vOv();
  return `<div class="tg mg" data-pg="manager">${head()}<div class="tg-body v-${v}">${v==='kpi'?kList():v==='team'?pList():v==='fleet'?fList():''}<div class="tg-main">${body}</div>${pop()}${U.rep?repSheet():''}</div></div>`; }
const rd=()=>PG.keepScroll(render);
""")
rep("const nOpen=openAt(TODAY).length, nd=U.needs.length+alerts().length,", "const nOpen=openAt(TODAY).length, nd=NEEDS().length+alerts().length,")
rep("const N=alertNeeds().concat(U.needs.map(id=>NEEDS0.find(n=>n.id===id))), [a,b]=W();", "const N=alertNeeds().concat(NEEDS()), [a,b]=W();")
rep("`<div class=\"mg-clear\">${ic('check',16)}Nothing needs you right now — sign-offs, goodwill asks, comebacks and late hand-offs land here.</div>`",
    "`<div class=\"mg-clear\">${ic('check',16)}Nothing needs you right now — asks, hand-offs, comebacks and off-target alerts land here.</div>`")
# the KPI page's print, the drill CSVs
rep('<button class="btn btn-sm" data-a="toast" data-t="The KPI sheet prints — the number, the trend, the breakdown and the ROs behind it.">', '<button class="btn btn-sm" data-a="print">')
rep('<button class="btn btn-sm tg-gh" data-a="toast" data-t="Downloaded — ${n} rows as CSV.">', '<button class="btn btn-sm tg-gh" data-a="csv" data-k="${k.id}">')
rep('<button class="btn btn-sm tg-gh" data-a="toast" data-t="Downloaded — ${n} ROs as CSV.">', '<button class="btn btn-sm tg-gh" data-a="csv" data-k="${k.id}">')
# team
rep('<button class="btn btn-sm tg-gh" data-a="toast" data-t="Add an employee — name, role and PIN; the role fills in the pages they can open.">', '<button class="btn btn-sm tg-gh" data-a="pop" data-p="addp" title="Add a person — name, role and PIN">')
rep("<span class=\"tg-w\">${r}${k==='RH'?' · you':''}</span>", "<span class=\"tg-w\">${r}${k===meK()?' · you':''}</span>")
rep("<span>${k==='RH'?'This is you':'Last signed in today, '+(7+STAFF0.findIndex(x=>x[0]===k)%3)+':'+p2(10+STAFF0.findIndex(x=>x[0]===k)*4%50)}</span><span class=\"sp\"></span><button class=\"btn btn-sm\" data-a=\"toast\" data-t=\"Parsec now shows what ${F(k)} sees — switch back to Admin any time from Settings.\">",
    "<span>${k===meK()?'This is you':esc(r)}</span><span class=\"sp\"></span><button class=\"btn btn-sm\" data-action=\"viewas-set\" data-id=\"${(staffOf(k)||{}).id||''}\">")
rep("<small>${r} · ${(U.pages[k]?Object.keys(U.pages[k]).filter(p=>U.pages[k][p]).length:0)} pages · signs in with a PIN</small>", "<small>${r} · ${(U.pages[k]?Object.keys(U.pages[k]).filter(p=>U.pages[k][p]).length:0)} pages · ${(staffOf(k)||{}).pin?'signs in with a PIN':'no PIN yet'}</small>")
rep("<div class=\"mg-form\"><label>Name<input value=\"${esc(PPL[k])}\"></label><label>Role<select data-role=\"${k}\">${Object.keys(ROLES).map(x=>`<option${x===r?' selected':''}>${x}</option>`).join('')}</select></label><label>PIN<input type=\"password\" value=\"1234\" autocomplete=\"new-password\"></label></div>",
    "<div class=\"mg-form\"><label>Name<input value=\"${esc(PPL[k])}\" disabled title=\"Change names on the Settings page\"></label><label>Role<select data-role=\"${k}\" data-ch=\"1\">${Object.keys(ROLES).map(x=>`<option${x===r?' selected':''}>${x}</option>`).join('')}</select></label><label>PIN<input type=\"password\" data-pin=\"${k}\" data-ch=\"1\" value=\"\" placeholder=\"${(staffOf(k)||{}).pin?'••••':'4 digits'}\" inputmode=\"numeric\" maxlength=\"6\" autocomplete=\"new-password\"></label><label>Pay<input data-pay=\"${k}\" data-ch=\"1\" value=\"${PG.payOf(PPL[k])||''}\" placeholder=\"$ an hour\" inputmode=\"decimal\" title=\"Hourly pay — only the manager and ${esc(F(k))} see it\"></label></div>")
# activity
rep("<select data-alw style=\"height:30px\">", "<select data-alw data-ch=\"1\" style=\"height:30px\">")
rep('<button class="btn btn-sm" data-a="toast" data-t="Downloaded — the activity log as CSV (last 3,000 lines).">', '<button class="btn btn-sm" data-a="alcsv">')
rep("${days.map(d=>`<div class=\"mg-day\">${d===TODAY?'Today':'Yesterday'} · ${fd(d)}</div>`", "${days.map(d=>`<div class=\"mg-day\">${d===TODAY?'Today':d===addD(TODAY,-1)?'Yesterday':DWL[dOf(d).getDay()]} · ${fd(d)}</div>`")
rep("<span class=\"who\"><span class=\"tg-av\">${x.by}</span>${PPL[x.by]}</span>", "<span class=\"who\"><span class=\"tg-av\">${esc(x.by)}</span>${esc(PPL[x.by]||x.by)}</span>")
rep("<span class=\"x\">${x.verb} ${x.ro?`<span class=\"tg-no\">${x.ro}</span>${esc(x.cust)}`:''}${x.text?(x.ro?' — ':'')+esc(x.text):''}</span>${x.ro?`<button class=\"btn btn-sm tg-gh\" data-a=\"ro\" data-no=\"${x.ro}\">Open</button>`:'<span></span>'}",
    "<span class=\"x\">${x.ro?`<span class=\"tg-no\">${esc(x.ro)}</span>`:''}${esc(x.text)}</span>${x.roId?`<button class=\"btn btn-sm tg-gh\" data-a=\"ro\" data-no=\"${esc(x.ro)}\">Open</button>`:'<span></span>'}")
# ---------- doing things ----------
rep("function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }",
    "function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); if(el) PG.anchor(U,el); rd(); }")
rep("mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;\n  if(a==='noop') return;",
    "function onClick(t,e){ const a=t.dataset.a, p=U.pop;\n  if(a==='noop') return;")
rep("""    if(x[1]==='go:cb'){ toast('In Parsec this opens RO 37795 — Fixes links it to the first fix on 37482.',false); render(); return; }
    if(x[1]==='go:flow'){ U.view='flow'; U.flow='parts'; render(); return; }
    snap(); if(x[1]==='ok'||x[0]==='Decline'||x[0]==='Ask Grace') U.needs=U.needs.filter(id=>id!==n.id); toast(x[2]); render(); }""",
    """    if(x[1]==='open'){ if(n.ro) PG.openRo(n.ro); else PG.go('inbox'); return; }
    snap(); const st=IB.store().st; st[n.id]=Object.assign(st[n.id]||{},{done:nowIso(),how:'from the Manager page'}); IB.flush(); toast('Done — it’s in Done in your Inbox.'); render(); }""")
rep("else if(a==='nd'){ const n=NEEDS0.find(x=>x.id===t.dataset.id), x=n.a[+t.dataset.i];", "else if(a==='nd'){ const n=NEEDS().find(x=>x.id===t.dataset.id); if(!n) return; const x=n.a[+t.dataset.i];")
rep("else if(a==='lockpg'){ toast(t.dataset.k==='RH'||pRole(t.dataset.k)==='Manager'?'The Manager page is always on for the manager.':'Only the manager role opens the Manager page.',false); render(); }",
    "else if(a==='lockpg'){ toast(pRole(t.dataset.k)==='Manager'?'The Manager page is always on for the manager.':'Only the manager role opens the Manager page.',false); render(); }")
rep("else if(a==='rule'){ const r=U.rules.find(x=>x.k===t.dataset.k); if(r.m===t.dataset.v) return; snap(); r.m=t.dataset.v;", "else if(a==='rule'){ const r=U.rules.find(x=>x.k===t.dataset.k); if(r.m===t.dataset.v) return; snap(); r.m=t.dataset.v; const rr=rtCfg().rules.find(x=>x.k===r.k); if(rr) rr.mode=r.m;")
rep("else if(a==='acc'){ snap(); U.acc=t.checked;", "else if(a==='acc'){ snap(); U.acc=t.checked; rtCfg().needAccept=U.acc;")
rep("else if(a==='page'){ const k=t.dataset.k, pg=t.dataset.v; snap(); U.pages[k][pg]=U.pages[k][pg]?0:1;", "else if(a==='page'){ const k=t.dataset.k, pg=t.dataset.v, sf=staffOf(k); if(!sf) return; snap(); sf.pages=sf.pages||{}; sf.pages[pg]=!sf.pages[pg]; U.pages[k][pg]=sf.pages[pg]?1:0; try{ audit('staff',sf.name+' — '+(NAV.find(x=>x[0]===pg)||[pg,pg])[1]+(sf.pages[pg]?' on':' off')); }catch(e){}")
rep("else if(a==='ro'){ toast(`In Parsec this opens RO ${t.dataset.no}.`,false); render(); }", "else if(a==='ro'){ const r=ROS.find(x=>x.no===t.dataset.no); if(r) PG.openRo(r.id); }")
rep("else if(a==='undo'){ if(UNDO.length){ Object.assign(U,JSON.parse(UNDO.pop())); TOAST={t:'Undone.',undo:false}; U.pop=null; render(); } }\n});", "else return onClick2(t,e);\n}")
rep("""mock.addEventListener('change',e=>{ const t=e.target;
  if(t.dataset.role){ const k=t.dataset.role; snap(); U.roles[k]=t.value; U.pages[k]=Object.fromEntries(ROLES[t.value].map(p=>[p,1])); toast(`${F(k)} is a ${t.value.toLowerCase()} now — the pages follow the role.`); render(); }""",
    """function onChange(t){
  if(t.dataset.role){ const k=t.dataset.role, sf=staffOf(k); if(!sf) return; snap(); sf.role=t.value; sf.pages={}; (ROLES[t.value]||[]).forEach(p=>{ sf.pages[p]=true; }); try{ audit('staff',sf.name+' is now '+t.value); }catch(e){} toast(`${F(k)} is a ${t.value.toLowerCase()} now — the pages follow the role.`); render(); }
  if(t.dataset.pin){ const sf=staffOf(t.dataset.pin), v=String(t.value||'').trim(); if(!sf) return; if(!/^\\d{4,6}$/.test(v)){ toast('A PIN is 4 to 6 digits.',false); return; } snap(); sf.pin=v; toast(`${F(t.dataset.pin)}’s PIN is set.`); render(); }""")
rep("  if(t.dataset.goal){ const v=parseInt(t.value,10); if(v>0&&v!==U.goals[t.dataset.goal]){ snap(); U.goals[t.dataset.goal]=v; toast(`${RT[t.dataset.goal][1]} hold goal: ${dur(v)}.`); render(); } } });",
    "  if(t.dataset.goal){ const v=parseInt(t.value,10); if(v>0&&v!==U.goals[t.dataset.goal]){ snap(); U.goals[t.dataset.goal]=v; toast(`${RT[t.dataset.goal][1]} hold goal: ${dur(v)}.`); render(); } }\n  if(t.dataset.pgg){ const v=parseFloat(t.value); if(v>0){ snap(); const M=mgSet(); M.pg[t.dataset.pgg]=Object.assign({},PGS()[t.dataset.pgg],M.pg[t.dataset.pgg]||{}); M.pg[t.dataset.pgg][t.dataset.k]=v; toast(`${F(t.dataset.pgg)}’s goal for ${KM[t.dataset.k].n}: ${v}${KM[t.dataset.k].u==='pct'?'%':' h a workday'} — they see it on Career.`); render(); } }\n}")
rep("mock.addEventListener('input',e=>{ const id=e.target.id, p=U.pop;", "function onInput(e){ const id=e.target.id, p=U.pop; if(id==='mg-rn'){ U.repn=e.target.value; return; }")
rep("  if(id==='mg-tv'&&p) p.v=e.target.value; });", "  if(id==='mg-tv'&&p) p.v=e.target.value; }")
cut("mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip');", "function move(d){", "")
rep("if(U.view==='team'){ const L=STAFF0.map(x=>x[0]);", "if(U.view==='team'){ const L=STAFF0.map(x=>x[0]);")
rep("addEventListener('keydown',e=>{ const k=e.key, inF=e.target.matches('input,textarea,select'); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();};",
    "function keydown(e){ const k=e.key, inF=PG.typing(e); if(e.ctrlKey||e.metaKey||e.altKey) return; const stop=()=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();};")
rep("  if(k>='1'&&k<='6'){ U.view=['ov','kpi','fleet','flow','team','act'][+k-1]; U.pop=null; render(); return stop(); }\n});", "  if(k>='1'&&k<='6'){ U.view=['ov','kpi','fleet','flow','team','act'][+k-1]; U.pop=null; render(); return stop(); }\n}")
cut("function after(){\n  const p=$('.tg-pop'), body=$('.tg-body');", "/* ======================= the ten ideas", """function after(){ PG.placePop(U);
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop #mg-pq')||$('.tg-pop #mg-tv'); if(f){ U.pop._f=1; f.focus(); if(f.select) f.select(); } } }
""")
cut("(()=>{ const r=rng('units'), M={};", "/* 4 · money left on the table, as a KPI too */", "")
rep("const OFF={'2026-10-26':['PS'],'2026-10-30':['KT']}, APPT=[16,11,21,9,14,6,12,5];", "const OFF={}, APPT=[0,0,0,0,0,0,0,0];")
rep("const PG0=()=>Object.fromEntries(TECHS.map(t=>[t,t==='AW'?{eff:92,prod:85,sold:6.5,cb:4}:{eff:100,prod:85,sold:7.5,cb:3}]));",
    "const PG0=()=>{ const tb=k=>{ const v=KM[k]?tgtBase(KM[k]):null; return v==null?null:v; }; const sd=tb('sold'); return {eff:tb('eff')||100,prod:tb('prod')||85,sold:sd?Math.max(.5,Math.round(sd/Math.max(1,TECHS.length)*2)/2):7.5,cb:tb('cb')||3}; };\n"
    "const PGS=()=>{ const M=mgSet(); return Object.fromEntries(TECHS.map(t=>[t,Object.assign(PG0(),M.pg[t]||{})])); };")
rep("<small>his own — the shop’s targets stay as they are</small>", "<small>their own — the shop’s targets stay as they are</small>")
rep("<input data-pg=\"${k}\" data-k=\"${id}\" value=\"${g[id]}\" inputmode=\"decimal\">", "<input data-pgg=\"${k}\" data-k=\"${id}\" data-ch=\"1\" value=\"${g[id]}\" inputmode=\"decimal\">")
rep("<span>${k==='AW'?'Andre started in August — his goals step up to the shop’s by January.':'Goals start at the shop’s targets — change any of them.'}</span>", "<span>Goals start at the shop’s targets — change any of them. A new tech can start lower and step up.</span>")
# data checks: real ones
cut("const CHK0=(()=>{", "const nChk=()=>", """let CHK0=[];
function chkOf(){ const C=ROS.filter(r=>r.close<=TODAY&&r.close>=addD(TODAY,-13)), O=openAt(TODAY), L=[];
  const np=C.filter(r=>r.ops.some(o=>o.q>0)&&!r.ops.some(o=>o.b>0)); if(np.length) L.push({id:'c1',ic:'clock',t:'Closed without a punch',d:'Hours sold and efficiency leave these out until someone adds the time.',ros:np.map(r=>r.no),a:'Open the first one',go:np[0].id});
  const nq=O.filter(r=>r.ops.some(o=>o.b>0.2&&!o.q)); if(nq.length) L.push({id:'c3',ic:'flag',t:'Operation with no quote',d:'No quote, no efficiency — every hour counts as over quote.',ros:nq.map(r=>r.no),a:'Open the first one',go:nq[0].id});
  const run=STATE.punches.filter(p=>!p.stop&&(Date.now()-new Date(p.start))>10*3600000); if(run.length){ const p=run[0], ro=getRO(p.roId); L.push({id:'c4',ic:'play',t:'Clock still running',d:`${esc(punchWho(p)||'A')}’s clock${ro?' on '+esc(tgNum(ro)):''} has run since ${PG.whenL(p.start)}.`,ros:run.map(x=>{ const r2=getRO(x.roId); return r2?tgNum(r2):'shop'; }),a:'Fix it in the Time Log',tl:localDay(p.start),who:punchWho(p)}); }
  const ni=STATE.punches.filter(p=>!isShopPunch(p)&&p.stop&&localDay(p.start)>=addD(TODAY,-13)&&!getOp(p.roId,p.opId)); if(ni.length) L.push({id:'c2',ic:'timelog',t:'Punches with no operation',d:'Time on an RO but not on a job — it counts as unapplied.',ros:[...new Set(ni.map(p=>{ const r2=getRO(p.roId); return r2?tgNum(r2):'?'; }))],a:'Open the Time Log',tl:localDay(ni[0].start),who:punchWho(ni[0])});
  return L; }
""")
rep("else if(a==='chkfix'){ const c=CHK0.find(x=>x.id===t.dataset.id); snap(); U.chk=U.chk.filter(x=>x!==c.id); toast(c.done); render(); }",
    "else if(a==='chkfix'){ const c=CHK0.find(x=>x.id===t.dataset.id); if(!c) return; U.pop=null; if(c.go) PG.openRo(c.go); else { UI.tlDay=c.tl; UI.tlWho=c.who||null; PG.go('timelog'); } }\n  else if(a==='chkx'){ snap(); mgSet().chkx[t.dataset.id]=nowIso(); toast('Hidden — it comes back if it happens again.'); render(); }")
rep("<button class=\"btn btn-sm\" data-a=\"chkfix\" data-id=\"${c.id}\">${c.a}</button>", "<button class=\"btn btn-sm\" data-a=\"chkfix\" data-id=\"${c.id}\">${c.a}</button><button class=\"btn btn-sm tg-gh\" data-a=\"chkx\" data-id=\"${c.id}\">It’s fine</button>")
rep("<div class=\"tg-pft\">${ic('info',12)}Parsec checks every night and when an RO closes.</div>", "<div class=\"tg-pft\">${ic('info',12)}Parsec checks every time the page opens — the last two weeks.</div>")
rep("${['eff','sold','lph','lost','qa','lab'].includes(k.id)&&U.chk.includes('c1')?`<button class=\"mg-dchip\" data-a=\"pop\" data-p=\"chk\">${ic('flag',11)}3 ROs left out — data checks</button>`:''}",
    "${['eff','sold','lph','lost','qa','lab'].includes(k.id)&&U.chk.includes('c1')?`<button class=\"mg-dchip\" data-a=\"pop\" data-p=\"chk\">${ic('flag',11)}${(CHK0.find(c=>c.id==='c1')||{ros:[]}).ros.length} ROs left out — data checks</button>`:''}")
# monthly report
rep("<small class=\"pp\">Prepared by Ray Holloway<br>${fd(TODAY)}, ${TODAY.slice(0,4)}</small>", "<small class=\"pp\">Prepared by ${esc(PG.me().name)}<br>${fd(TODAY)}, ${TODAY.slice(0,4)}</small>")
rep('<button class="btn btn-sm" data-a="toast" data-t="Sent to the printer — one page.">', '<button class="btn btn-sm" data-a="repprint">')
rep('<button class="btn btn-sm btn-primary" data-a="toast" data-t="Saved — “Service report ${mon}.pdf”.">', '<button class="btn btn-sm btn-primary" data-a="repprint" title="Pick “Save as PDF” in the print window">')
# fleets
rep("units=[...new Set(all.map(r=>r.unit))].sort((p,q)=>p-q)", "units=[...new Set(all.map(r=>r.unit))].sort((p,q)=>String(p).localeCompare(String(q),undefined,{numeric:true}))")
rep('<button class="btn btn-sm" data-a="toast" data-t="The scorecard prints for the account review — the numbers, their trucks and what’s in the shop.">', '<button class="btn btn-sm" data-a="print">')
rep("<span>${units.length} trucks · a customer since ${mName(all[0].open)} ${all[0].open.slice(0,4)}</span>", "<span>${units.length} truck${units.length===1?'':'s'} · a customer since ${mName(all[0].open)} ${all[0].open.slice(0,4)}</span>")
# no spotlight notes, no demo toolbar, no test hook
cut("/* ---------- spotlight notes ---------- */", "/* ---------- the ideas’ own clicks ---------- */", "")
rep("mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a;\n  if(a==='notex'){ U.note=null; render(); $$('[data-demo]').forEach(x=>x.classList.remove('is-on')); }\n  else if(a==='pacego')",
    "function onClick2(t,e){ const a=t.dataset.a;\n  if(a==='pacego')")
rep("  else if(a==='unl'){ U.unl=true; toast('Sample numbers on — gross profit, margins and absorption. Nothing is saved.',false); render(); }", "  else if(a==='folder'){ U.pop=null; rd(); if(typeof FS!=='undefined'&&FS.status==='needs-permission'&&typeof reconnectFolder==='function') reconnectFolder(); else if(typeof connectFolder==='function') connectFolder(); }\n  else if(a==='goteam'){ U.view='team'; U.pop=null; rd(); }\n  else if(a==='goparts'){ PG.go('parts'); }")
rep("""  else if(a==='fsel'){ goKpi(t.dataset.k,{k:'cust',v:U.fleet}); }
});""", """  else if(a==='fsel'){ goKpi(t.dataset.k,{k:'cust',v:U.fleet}); }
  else if(a==='print'||a==='repprint'){ const el=$(a==='repprint'?'.mg-sheet':'.mg-pane'); if(!el) return; el.classList.add('pg-printme'); document.documentElement.classList.add('pg-print2'); setTimeout(()=>{ try{ window.print(); } finally { el.classList.remove('pg-printme'); document.documentElement.classList.remove('pg-print2'); } },30); }
  else if(a==='csv'){ const k=KM[t.dataset.k]; if(!k) return; const [a0,b0]=W(), X=ctx(a0,b0,U.bf), L=drillRows(k,X).map(x=>x.r||x); const rows=[['RO','Customer','Truck','Pay','Opened','Closed','Tech','Sales','Hours sold','Hours clocked']].concat(L.map(r=>[r.no,r.cust,r.truck,PAY[r.pay],r.open,r.close>TODAY?'':r.close,PPL[r.tech]||r.tech,r.sales,r.q,r.b])); dl(k.n+' '+a0+' to '+b0+'.csv',rows); }
  else if(a==='alcsv'){ try{ const a1=document.createElement('a'); a1.href=URL.createObjectURL(new Blob([auditCsv()],{type:'text/csv'})); a1.download='activity-'+TODAY+'.csv'; document.body.appendChild(a1); a1.click(); setTimeout(()=>{ URL.revokeObjectURL(a1.href); a1.remove(); },500); }catch(err){ toast('Couldn’t save the file here.',false); } }
}
function dl(name,rows){ const csv=rows.map(r=>r.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\\n'); const a1=document.createElement('a'); a1.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a1.download=name; document.body.appendChild(a1); a1.click(); setTimeout(()=>{ URL.revokeObjectURL(a1.href); a1.remove(); },500); toast('Saved — '+(rows.length-1)+' rows.',false); }""")
rep("mock.addEventListener('change',e=>{ const t=e.target; if(t.dataset.pg){ const v=parseFloat(t.value); if(v>0&&U.pg[t.dataset.pg][t.dataset.k]!==v){ snap(); U.pg[t.dataset.pg][t.dataset.k]=v; toast(`${F(t.dataset.pg)}’s goal for ${KM[t.dataset.k].n}: ${v}${KM[t.dataset.k].u==='pct'?'%':' h a workday'} — he sees it on Career.`); render(); } } });\n", "")
rep("mock.addEventListener('input',e=>{ if(e.target.id==='mg-rn') U.repn=e.target.value; });\n", "")
cut("window.__mg={U:()=>U,", "reset(); render();", "", incl=True)
# ---------- the shop's settings: a gear in the header, Settings in the popovers ----------
rep("""<button class="btn ib tg-srch-b" data-a="pop" data-p="find" title="Find a KPI (/)">${ic('search',16)}</button></header>""",
    """<button class="btn ib tg-srch-b" data-a="pop" data-p="find" title="Find a KPI (/)">${ic('search',16)}</button><button class="btn ib tg-srch-b" data-a="pop" data-p="set" title="Shop settings — labor rate, pay period, overhead, PIN, folder">${ic('gear',16)}</button></header>""")
rep("  if(p.type==='chk') return chkPop();", r"""  if(p.type==='chk') return chkPop();
  if(p.type==='set'){ const S=PG.shop(), PP=S.payPer, fs=typeof FS!=='undefined'?FS:{status:'none'}; const fsT=fs.status==='connected'?`Saving to “${esc(fs.dirName)}”`:fs.status==='needs-permission'?`“${esc(fs.dirName)}” — needs permission again`:fs.supported===false?'This browser can’t open folders — use Chrome or Edge':'No folder — saving in this browser only';
    return `<div class="tg-pop xf mg-pop-w">${hd('Shop settings','what the numbers run on')}
     <div class="mg-form mg-setf"><label>Labor rate<span class="in"><input data-set="rate" data-ch="1" value="${PG.rate()}" inputmode="decimal"><small>$ an hour</small></span></label>
      <label>Pay period<select data-set="perk" data-ch="1">${[['weekly','Weekly'],['biweekly','Every two weeks'],['monthly','Monthly']].map(x=>`<option value="${x[0]}"${PP.kind===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select></label>
      <label>${PP.kind==='monthly'?'Starts on the':'A period started on'}<span class="in"><input type="date" data-set="pera" data-ch="1" value="${PP.anchor}"><small>${PP.kind==='monthly'?ordN(dOf(PP.anchor).getDate())+' of each month':'this period · '+PG.perLabel(PG.perStart(TODAY))}</small></span></label>
      <label>Monthly overhead<span class="in"><input data-set="ovh" data-ch="1" value="${S.overhead>0?S.overhead:''}" placeholder="rent, salaries, utilities" inputmode="decimal"><small>$ a month — for service absorption</small></span></label>
      <label>Admin PIN<span class="in"><input type="password" data-set="apin" data-ch="1" value="" placeholder="${S.adminPin?'••••':'4 to 6 digits'}" inputmode="numeric" maxlength="6" autocomplete="new-password"><small>${S.adminPin?'set — asked for on “Admin — every page”':'none — Admin signs in without one'}</small></span></label>
      <label>Data folder<span class="in"><span class="mg-fs">${esc(fsT)}</span><button class="btn btn-sm" data-a="folder">${fs.status==='connected'?'Change folder':fs.status==='needs-permission'?'Reconnect':'Choose the folder'}</button></span></label></div>
     <div class="tg-pft">${ic('info',12)}Pay per tech is on Team, under each person. Part cost is on each part line in Parts.</div></div>`; }""")
rep("function onChange(t){", r"""function onChange(t){
  if(t.dataset.set){ const S=PG.shop(), k=t.dataset.set, v=String(t.value||'').trim();
    if(k==='rate'){ const n=parseFloat(v.replace(/[$,\s]/g,'')); if(!(n>0)){ toast('Type the labor rate in dollars.',false); return; } snap(); STATE.laborRate=n; toast(`Labor rate: $${n} an hour.`); }
    else if(k==='perk'){ snap(); const was=S.payPer.kind; S.payPer.kind=v; if(v==='monthly'&&was!=='monthly') S.payPer.anchor=TODAY.slice(0,8)+'01'; else if(v!=='monthly'&&dOf(S.payPer.anchor).getDay()!==1){ const d=dOf(TODAY); S.payPer.anchor=addD(TODAY,-((d.getDay()+6)%7)); } toast(`Pay period: ${PG.perWord()} — ${PG.perLabel(PG.perStart(TODAY))} now.`); }
    else if(k==='pera'){ if(!/^\d{4}-\d\d-\d\d$/.test(v)){ toast('Pick a date.',false); return; } snap(); S.payPer.anchor=v; toast(`Pay periods run from ${fd(v)}.`); }
    else if(k==='ovh'){ const n=parseFloat(v.replace(/[$,\s]/g,'')); snap(); S.overhead=n>0?n:0; toast(n>0?`Overhead: ${usd0(n)} a month.`:'Overhead cleared.'); }
    else if(k==='apin'){ if(v&&!/^\d{4,6}$/.test(v)){ toast('A PIN is 4 to 6 digits.',false); return; } snap(); S.adminPin=v||''; toast(v?'Admin PIN set.':'Admin PIN cleared.'); }
    U._sd=null; rd(); return; }
  if(t.dataset.pay){ const sf=staffOf(t.dataset.pay), v=parseFloat(String(t.value||'').replace(/[$,\s]/g,'')); if(!sf) return; snap(); const P=PG.shop().pay; if(v>0) P[sf.name]=v; else delete P[sf.name]; U._sd=null; toast(v>0?`${F(t.dataset.pay)}’s pay: $${v} an hour — only you and ${F(t.dataset.pay)} see it.`:`${F(t.dataset.pay)}’s pay cleared.`); rd(); return; }""")
# ---------- gross profit from what the shop entered: part cost on the lines, pay per tech on Team, overhead in Settings ----------
rep("const PCOST=r=>.58+((+r.no*37)%13)/100, PAYR=36, OVH=260000;\nconst gpR=r=>r.lab-sum(r.ops,o=>o.b)*PAYR+r.prt*(1-PCOST(r));",
    r"""/* parts cost share: this RO's lines with a cost, else the shop's average over every closed RO with one; pay: the hours clocked × each tech's rate, the shop's average rate for hours with none */
let SHARE=null, PAYA=null;
function gpBase(){ if(SHARE!=null) return; let c=0, k=0, pc=0, pk=0; ROS.forEach(r=>{ c+=r.pcost||0; k+=r.pknown||0; pc+=r.payc||0; pk+=r.payk||0; }); SHARE=k>0?c/k:null; PAYA=pk>0?pc/pk:null; }
const PCOST=r=>{ gpBase(); return r.pknown>0?r.pcost/r.pknown:(SHARE!=null?SHARE:0); };
const PAYR_OF=r=>{ gpBase(); const b=sum(r.ops,o=>o.b); if(!b) return 0; const rest=Math.max(0,b-(r.payk||0)); return ((r.payc||0)+rest*(PAYA||0))/b; };
const PAYR_T=t=>{ const v=PG.payOf(PPL[t]||t); if(v>0) return v; gpBase(); return PAYA||0; };
const OVHv=()=>+PG.shop().overhead||0;
const gpR=r=>r.lab-sum(r.ops,o=>o.b)*PAYR_OF(r)+r.prt*(1-PCOST(r));
/* what's been entered: the lock opens as soon as each field has something */
const HAVE=()=>{ gpBase(); return {cost:SHARE!=null,pay:PAYA!=null,ovh:OVHv()>0}; };
const locked=k=>!!(k.lock&&k.needs.some(n=>!HAVE()[n]));""")
rep("col:R=>[pc((R.q*RATE-R.b*PAYR)/(R.q*RATE)*100),`${h1(R.b)} h at $${PAYR}`],sk:R=>(R.q*RATE-R.b*PAYR)/(R.q*RATE),f:X=>{ const l=sum(X.ops,o=>o.q)*RATE; return l?(l-sum(X.ops,o=>o.b)*PAYR)/l*100:null; }},",
    "col:R=>[pc((R.q*RATE-R.b*PAYR_T(R.ops[0]&&R.ops[0].tech))/(R.q*RATE)*100),`${h1(R.b)} h at $${Math.round(PAYR_T(R.ops[0]&&R.ops[0].tech))}`],sk:R=>(R.q*RATE-R.b*PAYR_T(R.ops[0]&&R.ops[0].tech))/(R.q*RATE),f:X=>{ const l=sum(X.ops,o=>o.q)*RATE; return l?(l-sum(X.ops,o=>o.b*PAYR_T(o.tech)))/l*100:null; }},")
rep("f:X=>X.wd?sum(X.CL,gpR)/(OVH/24*X.wd)*100:null});", "f:X=>X.wd&&OVHv()?sum(X.CL,gpR)/(OVHv()/24*X.wd)*100:null});")
s = s.replace("k.lock&&!U.unl", "locked(k)")
rep("""    ${k.lock?`<div class="mg-sample">${ic('info',13)}Sample numbers — parts cost 58–70% of the price, tech pay $36 an hour, overhead $260k a month.<button data-a="unl0">Hide them</button></div>`:''}""",
    """    ${k.lock?`<div class="mg-sample">${ic('info',13)}From what’s entered — part cost on the lines in Parts, pay per tech on Team${k.needs.includes('ovh')?', overhead in Settings':''}. Lines or hours with nothing entered use the shop’s average.</div>`:''}""")
rep("""     <p class="mg-unl">Part cost and tech pay open up four of these — gross profit, parts margin, labor margin and gross profit per RO. Add the monthly overhead and service absorption opens too.</p><div class="tg-acts" style="justify-content:flex-start"><button class="btn btn-sm btn-primary" data-a="unl">${ic('eye',14)}Show them with sample numbers</button><span class="hint">Nothing is saved — it’s to see what you’d get.</span></div></div></div></div></div>`; }""",
    """     <p class="mg-unl">Part cost and tech pay open up four of these — gross profit, parts margin, labor margin and gross profit per RO. Add the monthly overhead and service absorption opens too. One entry is enough to start; the rest use the shop’s average until they’re filled in.</p><div class="tg-acts" style="justify-content:flex-start">${k.needs.includes('pay')&&!HAVE().pay?`<button class="btn btn-sm btn-primary" data-a="goteam">${ic('users',14)}Enter pay on Team</button>`:''}${k.needs.includes('cost')&&!HAVE().cost?`<button class="btn btn-sm${HAVE().pay||!k.needs.includes('pay')?' btn-primary':''}" data-a="goparts">${ic('parts',14)}Enter part cost in Parts</button>`:''}${k.needs.includes('ovh')&&!HAVE().ovh?`<button class="btn btn-sm" data-a="pop" data-p="set">${ic('gear',14)}Overhead in Settings</button>`:''}</div></div></div></div></div>`; }""")
rep("""function lockPane(k){ const N={cost:['Part cost','On each part line in Parts — what you paid. Parts already keeps the price.','Parts'],pay:['Tech pay rate','Per tech in Team, dollars an hour. Only the manager sees it.','Team'],ovh:['Monthly overhead','One number in Settings — rent, salaries, utilities.','Settings']};""",
    """function lockPane(k){ const N={cost:['Part cost','On each part line in Parts — typed at check-in, or on the catalog item. Parts already keeps the price.','Parts'],pay:['Tech pay rate','Per tech in Team, dollars an hour. Only the manager sees it.','Team'],ovh:['Monthly overhead','One number in Settings — rent, salaries, utilities.','Settings']};""")
rep("""  const ex={cost:`<div class="mock-f"><span>Turbo actuator · 22972342</span><span class="pr">Price <b>$1,348.00</b></span><span class="cs">Cost <input placeholder="$" disabled></span></div>`,pay:`<div class="mock-f"><span>Andre Wilson · Technician</span><span class="cs">Pay <input placeholder="$ / h" disabled></span></div>`,ovh:`<div class="mock-f"><span>Overhead a month</span><span class="cs"><input placeholder="$" disabled></span></div>`};""",
    """  const ex={cost:'',pay:'',ovh:''};""")
rep("""<span class="mg-pv">${N[n][2]}</span><b>${N[n][0]}</b><small>${N[n][1]}</small>${ex[n]}</div>`""", """<span class="mg-pv${HAVE()[n]?' ok':''}">${HAVE()[n]?'✓ ':''}${N[n][2]}</span><b>${N[n][0]}</b><small>${N[n][1]}</small>${ex[n]}</div>`""")
# ---------- people: add and remove on Team ----------
rep('<div class="mg-ch"><b>Details</b></div>', '<div class="mg-ch"><b>Details</b><small>name, role, PIN and pay</small><span class="sp"></span>${k!==meK()?`<button class="btn btn-sm tg-gh" data-a="pop" data-p="rmp" data-k="${k}">${ic(\'trash\',13)}Remove from the team</button>`:\'\'}</div>')
rep("  if(p.type==='chk') return chkPop();", r"""  if(p.type==='chk') return chkPop();
  if(p.type==='addp') return `<div class="tg-pop xf mg-pop-w">${hd('Add a person','they sign in with their name, and a PIN if you set one')}
     <div class="mg-form mg-setf"><label>Name<input id="mg-an" data-in="an" placeholder="First and last name" autocomplete="off"></label>
      <label>Role<select id="mg-ar">${Object.keys(ROLES).map(x=>`<option${x==='Technician'?' selected':''}>${x}</option>`).join('')}</select></label>
      <label>PIN<span class="in"><input id="mg-ap" data-in="ap" type="password" placeholder="4 to 6 digits — optional" inputmode="numeric" maxlength="6" autocomplete="new-password"><small>the role fills in the pages — change them after</small></span></label></div>
     <div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="addgo">${ic('plus',13)}Add to the team</button></div></div>`;
  if(p.type==='rmp'){ const sf=staffOf(p.k); if(!sf) return ''; return `<div class="tg-pop xf mg-pop-m">${hd('Remove '+esc(sf.name)+'?','they can’t sign in after this')}<p class="mg-rmp">Their ROs, punches and history stay. ${PG.payOf(sf.name)?'Their pay rate is kept in case they come back.':''}</p><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Keep them</button><button class="btn btn-sm btn-primary mg-danger" data-a="rmgo" data-k="${p.k}">${ic('trash',13)}Remove</button></div></div>`; }""")
rep("  else if(a==='unl0'){ U.unl=false; render(); }", r"""  else if(a==='unl0'){ U.unl=false; render(); }
  else if(a==='addgo'){ const nm=(($('#mg-an')||{}).value||'').trim().replace(/\s+/g,' '), role=($('#mg-ar')||{}).value||'Technician', pin=(($('#mg-ap')||{}).value||'').trim();
    if(!nm){ toast('Type their name.',false); return; } if(staffList().some(x=>techSame(x.name,nm))){ toast(`${nm} is already on the team.`,false); return; } if(pin&&!/^\d{4,6}$/.test(pin)){ toast('A PIN is 4 to 6 digits.',false); return; }
    snap(); const pages={}; (ROLES[role]||[]).forEach(pg=>{ pages[pg]=true; }); const sf={id:uid('st'),name:nm,role,pages}; if(pin) sf.pin=pin; staffList().push(sf); try{ audit('staff',nm+' added as '+role); }catch(err){}
    U.pop=null; U._sd=null; U.person=null; U.addK=nm; toast(`${nm} is on the team — ${role.toLowerCase()}${pin?', with a PIN':''}.`); render(); }
  else if(a==='rmgo'){ const sf=staffOf(t.dataset.k); if(!sf) return; snap(); STATE.staff=staffList().filter(x=>x.id!==sf.id); try{ if(viewAsId()===sf.id) localStorage.removeItem('tec_viewas'); audit('staff',sf.name+' removed from the team'); }catch(err){} U.pop=null; U.person=null; U._sd=null; toast(`${sf.name} is off the team.`); render(); }""")
rep("<span>Needs ${k.needs.length===1?'one field':k.needs.length+' fields'} Parsec doesn’t keep yet</span>", "<span>${(()=>{ const m=k.needs.filter(n=>!HAVE()[n]).length; return m===k.needs.length?'Needs '+(m===1?'one field':m+' fields')+' entered first':'One more to enter — '+k.needs.filter(n=>!HAVE()[n]).map(n=>({cost:'part cost',pay:'tech pay',ovh:'monthly overhead'})[n]).join(' and '); })()}</span>")
# the rate in the words
s = s.replace("How hours sold ÷", "How hours sold ÷")
s = re.sub(r"\$210(?![\d,])", "${RATE}", s)          # in template strings this reads the shop's rate
# strings that are plain '...' (not templates) can't use ${}: put them back to words
s = s.replace("how:'Labor sold ÷ hours clocked. At 100% efficiency it’s the ${RATE} rate.'", "how:'Labor sold ÷ hours clocked. At 100% efficiency it’s the labor rate.'")
s = s.replace("how:'Hours sold × ${RATE}.'", "how:'Hours sold × the labor rate.'")
s = s.replace("how:'Hours over quote and unapplied hours at ${RATE}, plus declined work and write-offs.'", "how:'Hours over quote and unapplied hours at the labor rate, plus declined work and write-offs.'")
s = s.replace('<svg class="mg-svg" width="${w}" height="${H}">', '<svg class="mg-svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" preserveAspectRatio="xMinYMin meet">')   # charts shrink with the card
# render() inside the module means the app's render — keep the scroll
s = re.sub(r"(?<![\w.])render\(\)", "rd()", s)
s = s.replace("const rd=()=>PG.keepScroll(rd());", "const rd=()=>PG.keepScroll(render);")
assert "mock." not in s, s[s.index("mock."):s.index("mock.")+80]
assert "scale" not in re.sub(r"scale\(", "", s).replace("'scale", ""), "scale left"

out = """/* ============================== Manager (Manager v3 mock-up, with the ideas) ==============================
   The KPIs from the ROs, the Time Log and the parts; pace, why it moved, alerts, money left on the table,
   fleets, capacity, goals per person, data checks and the monthly report; Flow (who holds what, the stage
   rules and hold goals), Team (roles and pages) and Activity (the audit trail). Manager only. */
var MG = (function(){
""" + s + """
  reset();
  const H = new Proxy({}, { get: (o, a) => (t, e) => { DIRTY = false; const r = onClick(t, e); if(DIRTY){ scheduleSave(true); DIRTY = false; } return r; } });
  function change(t){ DIRTY = false; onChange(t); if(DIRTY){ scheduleSave(true); DIRTY = false; } }
  function input(t, e){ onInput(e); }
  function fieldKey(t, ev){ if(ev.key === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } ev.preventDefault(); return true; }
    if(ev.key === 'Enter' && U.pop){ ev.preventDefault(); if(t.id === 'mg-pq'){ const b = $('.tg-pop .mg-srr'); if(b) b.click(); } else { const b = $('.tg-pop .btn-primary:not([disabled])'); if(b) b.click(); } return true; }
    return false; }
  PG.reg('manager', { H, U: () => U, input, change, fieldKey, keydown, after });
  return { view, U: () => U, KM, kv: k => kv(k), ctx: (a, b, F) => ctx(a, b, F), goalsFor: k => { try{ sync(); }catch(e){} return (PGS() || {})[k] || null; } };
})();
function viewManager(){ return MG.view(); }
"""
# inputs in the mock use ids, not data-in — mark them so the frame passes them on
out = out.replace('<input id="mg-lq"', '<input id="mg-lq" data-in="lq"').replace('<input id="mg-pq"', '<input id="mg-pq" data-in="pq"').replace('<input id="mg-tv"', '<input id="mg-tv" data-in="tv"').replace('<textarea id="mg-rn"', '<textarea id="mg-rn" data-in="rn"')
out = out.replace('<input data-goal="${k}"', '<input data-goal="${k}" data-ch="1"')
out = out.replace('<input type="checkbox" data-a="acc"', '<input type="checkbox" data-a="acc"')
open(os.path.join(H, "mg1.js"), "w", encoding="utf-8").write(out)
print("wrote mg1.js", len(out))
