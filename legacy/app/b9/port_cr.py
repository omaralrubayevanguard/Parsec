# Career v2 mock-up -> the Career page module on real data (b9/cr1.js).
# The mock's engine and views stay; the made-up shop becomes pgShopData(), the made-up per-tech data
# (goals, notes, certificates, fixes, rate, earlier years, data checks) becomes the shop's own:
#   goals      -> Manager -> Team (MG.goalsFor), else the shop's targets
#   notes/goal -> STATE.crNotes[name]   (written by the foreman or manager on this page; sent to the Inbox)
#   rate, earlier years, alerts, certificates -> STATE.cr[name]
#   fixes      -> the Fixes library (who wrote it, who pressed Use fix on it)
#   checks     -> the punches (clock running > 10 h, punches with no operation)
import os, re
H = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(H, "src", "career.js"), encoding="utf-8").read()


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
cut("const $=(s,r=document)=>", "const p2=n=>", r"""const PGR=()=>document.querySelector('[data-pg="career"]')||document;
const $=s=>PGR().querySelector(s), $$=s=>[...PGR().querySelectorAll(s)];
const LOGO=typeof PX_LOGO!=='undefined'?PX_LOGO:'';
const esc=PG.e, ic=PG.ic, kbd=PG.kbd;
""")
rep("const TODAY='2026-10-22';", "let TODAY=todayStr();")
cut("const PPL={RH:", "const PAY={", r"""let PPL={}, TECHS=[], CUST=[], RATE=210, BAYS=8;
const F=k=>String((PPL[k]||k||'')).split(' ')[0];
""")
cut("/* ---------- a dealership’s last 210 days", "const ST_COL=", r"""/* ---------- the shop, from Parsec: pgShopData() builds it once per change ---------- */
let ROS=[], TB={}, ATT={}, BAYU={}, BYC={}, BYO={}, START=TODAY, DAYS=0, SD=null, DSD=null, TSTART={}, SINCE={}, GLC={eff:100,prod:85,sold:7.5,cb:3};
/* when each tech starts in the data: a tech who first shows up two weeks after Parsec did "started" then */
function starts(){ TSTART={}; SINCE={}; const F1={}; TECHS.forEach(t=>{ let f=null; for(const d in (ATT[t]||{})) if(ATT[t][d]>0&&(!f||d<f)) f=d; for(const d in (TB[t]||{})) if(TB[t][d]>0&&(!f||d<f)) f=d; F1[t]=f||TODAY; }); const f0=TECHS.map(t=>F1[t]).sort()[0]||START;
  if(f0>START) START=f0;   /* Parsec started when the first punch did */
  TECHS.forEach(t=>{ const f=F1[t]; if(f>addD(f0,13)) TSTART[t]=f; SINCE[t]=MNL[dOf(f).getMonth()]+' '+f.slice(0,4); }); }
function data(){ SD=pgShopData(); TODAY=SD.TODAY; if(SD!==DSD){ DSD=SD; ROS=SD.ROS; TB=SD.TB; ATT=SD.ATT; BAYU=SD.BAYU; BYC=SD.BYC; BYO=SD.BYO; PPL=SD.PPL; TECHS=SD.TECHS; CUST=SD.CUST; START=SD.START; DAYS=dd(START,TODAY); RATE=SD.RATE; BAYS=SD.BAYS; MEMO.clear(); for(const k in PCACHE) delete PCACHE[k]; starts(); } }
""")
rep("function left(r,t){ const tot=Math.max(1,dd(r.open,r.close)), el=Math.min(tot,dd(r.open,t)+.5); return Math.max(0,r.q*(1-el/tot)); }",
    "function left(r,t){ return Math.max(0,r.q-r.b); }")
rep("const partsAt=(t,F)=>openAt(t,F).filter(r=>r.pw&&t<addW(r.open,r.pw+1));", "const partsAt=(t,F)=>openAt(t,F).filter(r=>r.pwWin&&r.pwWin[0]<=t&&t<r.pwWin[1]);")
rep("const T=F&&F.k==='tech'?[F.v]:TECHS; let att=0, bur=0; D.forEach(k=>T.forEach(t=>{ att+=ATT[t][k]||0; bur+=TB[t][k]||0; }));",
    "const T=F&&F.k==='tech'?[F.v]:TECHS; let att=0, bur=0; D.forEach(k=>T.forEach(t=>{ att+=(ATT[t]||{})[k]||0; bur+=(TB[t]||{})[k]||0; }));")

# ---------- the per-tech data -> the shop's ----------
cut("const TECH4=[", "const TYPE={", r"""/* the goals the manager set for each tech (Manager → Team), else the shop's targets */
function GL(k){ let g=null; try{ g=MG.goalsFor(k); }catch(e){} return Object.assign({eff:100,prod:85,sold:7.5,cb:3},g||{}); }
function cmpOf(o){ const t=String(o.cmp||'').trim(); return t||(o.t==='diag'?'Diagnosis':o.t==='pm'?'PM service':OPT[o.t]||'Operation'); }
""")
cut("/* ---------- v2: the extra things a tech’s Career keeps ---------- */", "const GRP=", r"""/* ---------- what a tech's Career keeps: STATE.cr[name] (rate, earlier years, alerts, certificates) and STATE.crNotes[name] (notes and a goal) ---------- */
const yb=k=>(+k.slice(0,4)-1)+k.slice(4);
function CRS(k){ k=k||U.who; const S=STATE.cr&&typeof STATE.cr==='object'?STATE.cr:(STATE.cr={}); const n=PPL[k]||k; const s=S[n]||(S[n]={}); if(!s.al) s.al={pace:1,fri:1,best:0}; if(!Array.isArray(s.skills)) s.skills=[]; return s; }
function NTS(k){ k=k||U.who; const S=STATE.crNotes&&typeof STATE.crNotes==='object'?STATE.crNotes:(STATE.crNotes={}); const n=PPL[k]||k; const s=S[n]||(S[n]={goal:null,L:[]}); if(!Array.isArray(s.L)) s.L=[]; return s; }
/* the pay period: two weeks from the Time Log's anchor Monday */
function PAYP(){ const a=PG.perStart(TODAY); return {a,b:PG.perEnd(a)}; }
/* the people: who manages, who's foreman, who's looking */
const fst=n=>String(n||'').split(' ')[0];
const MGR=()=>PG.person('Manager')||'your manager', FMP=()=>PG.person('Foreman')||PG.person('Manager')||'', FMN=()=>FMP()||'your foreman';
const SHOPN=()=>String(STATE.shopName||(STATE.settings&&STATE.settings.shopName)||'').trim();
const roleOf=k=>{ let sf=null; try{ sf=staffForTech(PPL[k]); }catch(e){} return sf&&sf.role||'Technician'; };
const canPick=()=>{ const m=PG.me(); return !!(m.admin||m.role==='Manager'||m.role==='Foreman'); };
const isSelf=()=>!!U.who&&SD&&SD.keyOf(PG.me().name)===U.who;
const canPay=()=>{ const m=PG.me(); return isSelf()||!!m.admin||m.role==='Manager'; };
/* certificates and classes */
function SKLf(){ return CRS().skills.map(x=>{ let st='ok', line='No expiry'; if(x.prog){ st='prog'; line=x.pct?x.pct+'% done':'In progress'; } else if(x.exp){ const n=dd(TODAY,x.exp); if(n<0){ st='warn'; line='Expired '+fd(x.exp)+', '+x.exp.slice(0,4); } else if(n<=90){ st='warn'; line='Expires '+fd(x.exp)+' — in '+n+' days'; } else line='Expires '+MN[dOf(x.exp).getMonth()]+' '+x.exp.slice(0,4); } return [x.name,st,line,x.pct||0,x.id]; }); }
/* fixes this tech wrote, and what happened when others used them: [title, written, used, held, used by, hours saved, key] */
function FXWf(){ const me=PPL[U.who]||''; if(!me||typeof FX==='undefined') return []; let C; try{ C=FX.build(); }catch(e){ return []; } const M=new Map();
  Object.keys(C.E).forEach(k=>C.E[k].forEach(e=>{ if(!e.tech||SD.keyOf(e.tech)!==U.who) return; if(!M.has(k)) M.set(k,{k,t:(C.T[k]||{}).t||k,d:e.date,ros:new Set()}); const x=M.get(k); if(e.date&&(!x.d||e.date<x.d)) x.d=e.date; x.ros.add(String(e.ro)); }));
  const L=[]; M.forEach(x=>{ let used=0, held=0, sv=0; const by=new Set();
    STATE.ros.forEach(ro=>(ro.operations||[]).forEach(op=>{ const u=op.fxUse; if(!u||!x.ros.has(String(u.ro||'').replace(/^RO[\s-]*/i,''))) return; used++; const w=u.by||ro.assignedTech||''; if(w&&SD.keyOf(w)!==U.who) by.add(fst(w));
      if(opDoneNow(op)){ const E2=(C.E[x.k]||[]).find(e=>e.opId===op.id); if(!E2||E2.out!=='cb') held++; const q=+op.quoted||0, b=(opCalc(op).burntHrs||0); if(q>b) sv+=q-b; } }));
    L.push([x.t,x.d||TODAY,used,held,[...by].join(', ')||'—',sv,x.k]); });
  return L.sort((a,b)=>b[2]-a[2]||(a[1]<b[1]?1:-1)).slice(0,8); }
""")
rep("const isSum=k=>['sold','clk','lost','unap'].includes(k.id);", "const isSum=k=>['sold','clk','lost','unap'].includes(k.id);")
# data checks from the punches: [id, icon, title, text, button, day]
cut("const CHK={MR:", "const daysIn=", r"""function CHKf(){ const L=[]; if(!U.who) return L; const mine=p=>SD.keyOf(punchWho(p)||'')===U.who;
  STATE.punches.filter(p=>!p.stop&&mine(p)&&(Date.now()-new Date(p.start))>10*3600000).forEach(p=>{ const ro=getRO(p.roId); L.push(['c1:'+p.id,'play','Clock still running'+(ro?' on '+tgNum(ro):''),`Since ${PG.whenL(p.start)} — ${Math.round((Date.now()-new Date(p.start))/3600000)} h. Efficiency leaves the operation out until it’s fixed.`,'Fix it in the Time Log',localDay(p.start)]); });
  STATE.punches.filter(p=>mine(p)&&p.stop&&!isShopPunch(p)&&localDay(p.start)>=addD(TODAY,-13)&&!getOp(p.roId,p.opId)).forEach(p=>{ const ro=getRO(p.roId), h=(new Date(p.stop)-new Date(p.start))/3600000; L.push(['c2:'+p.id,'timelog','A punch with no operation',`${fd(localDay(p.start))} · ${h1(h)} h${ro?' on '+tgNum(ro):''} not on a job — it counts as unapplied.`,'Pick the job',localDay(p.start)]); });
  return L.slice(0,8); }
const nChk=()=>CHKf().length;
""")
rep("const daysIn=(a,b)=>Object.keys(ATT[U.who]).filter(", "const daysIn=(a,b)=>Object.keys(ATT[U.who]||{}).filter(")

# ---------- state ----------
rep("let U, TOAST, TT, RENDERING=false;\nfunction reset(who){ U={who:who||'MR',view:'ov',p:'mo',cmp:'prev',drv:'eff',sel:null,pop:null,kb:false,tg:{},chk:{c1:1,c2:1},prior:{},usePrior:false,pay:false,al:{pace:1,fri:1,best:0},ack:{},stmt:null,hl:null}; TOAST=null; }\nfunction toast(t){ TOAST={t}; clearTimeout(TT); TT=setTimeout(()=>{TOAST=null;render();},5200); }",
    r"""let U, DIRTY=false;
function reset(){ MEMO.clear(); U={who:null,view:'ov',p:'mo',cmp:'prev',drv:'eff',sel:null,pop:null,kb:false,tg:{},prior:{},usePrior:false,pay:false,al:{pace:1,fri:1,best:0},stmt:null,hl:null}; }
const toast=t=>pushToast(t);
const snap=()=>{ pushUndo('career'); DIRTY=true; };
/* every draw: the shop, whose Career this is, their settings */
function sync(){ data(); const me=PG.me();
  if(U._me!==me.name){ reset(); U._me=me.name; }
  const mk=SD.keyOf(me.name);
  if(!canPick()) U.who=TECHS.includes(mk)?mk:null;
  else if(!U.who||!TECHS.includes(U.who)) U.who=TECHS.includes(mk)?mk:(TECHS[0]||null);
  if(U.who){ const c=CRS(); U.prior[U.who]=c.prior||null; U.usePrior=!!(c.usePrior&&c.prior); U.al=c.al; GLC=GL(U.who); } }""")

# ---------- drawing ----------
cut("/* ---------- drawing ---------- */\nfunction render(){", "function head(){", r"""/* ---------- drawing ---------- */
function view(){ sync();
  if(!U.who) return `<div class="tg mg cr" data-pg="career"><header class="tg-head"><h1 class="tg-h1">Career</h1></header><div class="tg-body"><div class="tg-main"><div class="tg-blank"><div class="tg-empty"><span class="tg-ring0">${ic('career',22)}</span><h3>Nothing here yet</h3><p>Career fills in from your punches and the operations you finish — your numbers, your bests, your notes.</p></div></div></div></div></div>`;
  const v=U.view; return `<div class="tg mg cr" data-pg="career">${head()}<div class="tg-body">${v==='work'?wList():''}<div class="tg-main">${v==='work'?wDetail():v==='grow'?vGrow():vOv()}</div>${pop()}${U.stmt?stmtSheet():''}</div></div>`; }
const rd=()=>PG.keepScroll(render);
""")
rep("<span class=\"tg-hf\" style=\"cursor:default\"><span class=\"tg-av\">${U.who}</span>${PPL[U.who]}<span class=\"ib-role\">since ${SINCE[U.who]}</span></span>",
    "${canPick()?`<label class=\"tg-hf cr-pick\" title=\"Whose Career\"><span class=\"tg-av\">${esc(U.who)}</span><select data-who=\"1\" data-ch=\"1\">${TECHS.map(t=>`<option value=\"${esc(t)}\"${t===U.who?' selected':''}>${esc(PPL[t]||t)}</option>`).join('')}</select><span class=\"ib-role\">since ${SINCE[U.who]}</span></label>`:`<span class=\"tg-hf\" style=\"cursor:default\"><span class=\"tg-av\">${esc(U.who)}</span>${esc(PPL[U.who])}<span class=\"ib-role\">since ${SINCE[U.who]}</span></span>`}")
# overview words
rep("(TSTART[U.who]?'before Vanguard':P0.from.slice(-4)+' to 2024')", "(TSTART[U.who]?'before this shop':String(P0.from).slice(-4)+' to '+String(P0.to).slice(-4))")
rep("${noCmp()?'':' · '+cmpLbl()} · goals set by Ray Holloway</span>", "${noCmp()?'':' · '+cmpLbl()} · goals set by ${esc(MGR())}</span>")
rep("`<span>shop avg ${fmt(k.u,isSum(k)?o.shop/6:o.shop)}</span>`", "`<span>shop avg ${fmt(k.u,isSum(k)?o.shop/Math.max(1,TECHS.length):o.shop)}</span>`")
# goals and alerts
rep("<small>set by Ray Holloway, Oct 1</small>", "<small>set by ${esc(MGR())}</small>")
rep("proj=sd.v/dn*tot,", "proj=dn?(sd.v||0)/dn*tot:0,")
rep("<b>Sent this morning, 7:00</b>", "<b>In your Inbox</b>")
rep("<button class=\"btn btn-sm\" data-a=\"toast\" data-t=\"In Parsec this opens the alert in your Inbox.\">Open</button>", "<button class=\"btn btn-sm\" data-a=\"inbox\">Open</button>")
rep("${U.al.pace&&behind>.5?`<div class=\"cr-last\">", "${isSelf()&&U.al.pace&&behind>.5&&dn>=2?`<div class=\"cr-last\">")
rep("<small>only you get these</small>", "<small>${isSelf()?'only you get these':'only '+esc(F(U.who))+' changes these'}</small>")
# pay: the tech's own rate, the Time Log's pay period, private to the tech and the manager
# pay: hourly — hours on the clock × the rate the manager entered on Team; the pay period from Manager → Settings
cut("/* 8 · pay estimate — flat rate, hidden until asked */\nfunction payCard(){", "function overCard(){", r"""/* 8 · pay estimate — hourly: hours on the clock × the rate the manager set; the pay period the manager set */
function payCard(){ const nm=PPL[U.who]||'', r=PG.payOf(nm);
  if(!canPay()) return `<div class="mg-card cr-pay"><div class="mg-ch"><b>Pay estimate</b></div><div class="mg-cb"><div class="mg-none">${ic('lock',13)} Pay is private — only ${esc(F(U.who))} and ${esc(MGR())} see it.</div></div></div>`;
  const PP=PAYP(), a=PP.a, e=PP.b, A=ATT[U.who]||{}, hrs=(x,y)=>{ let h=0; for(let k=x;k<=y;k=addD(k,1)) h+=A[k]||0; return h; };
  const cl=hrs(a,minK(e,TODAY)), dn=wdIn(a,minK(e,TODAY)), tot=wdIn(a,e), left=Math.max(0,tot-dn), pace=dn?cl/dn:0, proj=cl+pace*left, std=8*tot;
  let ot=0; for(let w=wStart(a);w<=e;w=addD(w,7)){ const h=hrs(w<a?a:w,minK(addD(w,6),minK(e,TODAY))); ot+=Math.max(0,h-40); }
  const pay=h=>(h-Math.min(h,ot))*r+Math.min(h,ot)*r*1.5, sh=U.pay&&r>0, m=v=>sh?usd0(v):'$ • • • •', mx=Math.max(std,proj,1)*1.1, X=v=>(v/mx*100).toFixed(1);
  const pv=PG.perPrev(a), lp=hrs(pv,addD(a,-1)), isMgr=!isSelf();
  return `<div class="mg-card cr-pay${hl('pay')}" data-sec="pay"><div class="mg-ch"><b>Pay estimate</b><small>${fd(a)} – ${fd(e)}</small><span class="sp"></span>${r?`<button class="btn btn-sm" data-a="pay">${ic('eye',14)}${sh?'Hide amounts':'Show amounts'}</button>`:isMgr?`<button class="btn btn-sm" data-a="mgteam">${ic('users',13)}Enter ${esc(F(U.who))}’s pay in Team</button>`:''}</div><div class="mg-cb">
    ${r?'':`<div class="cr-note0" style="margin:0 0 10px">${ic('info',13)}<span>No pay rate entered yet — ${isMgr?'enter it on Manager → Team.':esc(fst(MGR()))+' enters it on the Manager page.'}</span></div>`}
    <div class="cr-big"><small>At your pace, by ${fd(e)}</small><b>${m(pay(proj))}</b><span>${h1(proj)} h on the clock${sh?' × $'+r+' an hour':''}${ot>.05?' · '+h1(ot)+' h overtime so far':''}</span></div>
    <div class="cr-pbar"><span class="tr"><i class="f" style="width:${X(cl)}%"></i><i class="p" style="left:${X(cl)}%;width:${X(Math.max(0,proj-cl))}%"></i><em style="left:${X(std)}%"></em></span><span class="ax"><span style="left:${X(std)}%">8 h</span></span></div>
    <div class="cr-prow"><span><i class="f"></i>On the clock so far<small>${fd(a)} – ${fd(minK(e,TODAY))} · ${+dn.toFixed(1)} of ${+tot.toFixed(1)} workdays</small></span><b>${h1(cl)} h</b><b class="m">${m(pay(cl))}</b></div>
    <div class="cr-prow"><span><i class="p"></i>The rest, at your pace<small>${+left.toFixed(1)} workdays left</small></span><b>${h1(Math.max(0,proj-cl))} h</b><b class="m">${m(Math.max(0,pay(proj)-pay(cl)))}</b></div>
    <div class="cr-prow"><span><i class="g"></i>At 8 h a workday<small>${+tot.toFixed(1)} workdays</small></span><b>${h1(std)} h</b><b class="m">${m(std*r)}</b></div>
    <div class="cr-prow last"><span>Last pay period<small>${fd(pv)} – ${fd(addD(a,-1))}</small></span><b>${h1(lp)} h</b><b class="m">${m(lp*r)}</b></div>
    <div class="cr-pft">${ic('lock',12)}<span>Hourly, paid ${PG.perWord()} — hours on the clock × your rate, time and a half over 40 h in a week. Only you and ${esc(MGR())} see this; payroll has the final number.</span></div></div></div>`; }
""")
# growth words
rep("${TSTART[U.who]?'since you started in '+SINCE[U.who]:'since Jan 2025, when Parsec started'}", "${TSTART[U.who]?'since you started in '+SINCE[U.who]:'since '+MN[dOf(START).getMonth()]+' '+START.slice(0,4)+', when Parsec started'}")
rep("const a=TSTART[U.who]||'2026-01-01', O=opsIn(a,TODAY), M=new Map();", "const a=TSTART[U.who]||(TODAY.slice(0,4)+'-01-01'), O=opsIn(a,TODAY), M=new Map();")
rep("Tell Frank and he takes it to the writers.", "Tell ${esc(fst(FMN()))} and it goes to the writers.")
rep("${ic('send',13)}Tell Frank</button>", "${ic('send',13)}Tell ${esc(fst(FMN()))}</button>")
# coaching notes: the real ones
cut("/* 5 · coaching notes */\nfunction notesCard(){", "/* 6 · skills and training */", r"""/* 5 · coaching notes: written here by the foreman or the manager; the tech sees them here and in the Inbox */
function notesCard(){ const N=NTS(), g=N.goal, self=isSelf(), lead=canPick()&&!self, fm=FMN();
  let gh='';
  if(g&&KM[g.k]){ const k=KM[g.k], a=mStart(TODAY), raw=val(k,a,TODAY,FT()), wd=ctx(a,TODAY,FT()).wd, v=k.tw!=null?(wd?raw/wd:null):raw, ok=v==null?null:k.d>=0?v>=g.t:v<=g.t, pct=k.d>=0?Math.min(1,(v||0)/g.t):Math.min(1,g.t/Math.max(v||.001,g.t)), fv=x=>k.tw!=null?h1(x)+' h a workday':fmt(k.u,x);
    gh=`<div class="cr-fg"><small>Goal from ${esc(fst(g.by))} · set ${fd(g.set)}</small><b>${k.id==='cb'?'Comebacks under '+fmt(k.u,g.t):k.n+' to '+fv(g.t)} by ${fd(g.due)}</b><span class="b"><i class="${ok?'ok':'off'}" style="width:${(pct*100).toFixed(1)}%"></i></span><span class="m ${ok?'ok':'off'}">${v==null?'—':fv(v)}<small>this month</small></span></div>`; }
  const L=N.L.slice().sort((a,b)=>a.at<b.at?1:-1);
  return `<div class="mg-card${hl('notes')}" data-sec="notes"><div class="mg-ch"><b>Coaching notes</b><small>from ${esc(fm)}</small><span class="sp"></span>${lead?`<button class="btn btn-sm" data-a="pop" data-p="note">${ic('plus',13)}Note</button><button class="btn btn-sm tg-gh" data-a="pop" data-p="goal">${ic('flag',13)}Goal</button>`:''}<span class="cr-who">${ic('lock',11)}${esc(self?'you':F(U.who))}, ${esc(fst(fm))} and ${esc(fst(MGR()))}</span></div><div class="mg-cb">${gh}
    ${L.length?L.map(n=>{ const un=self&&!n.ack; return `<div class="cr-nt${un?' new':''}"><div class="h"><span class="tg-av">${esc(PG.ini(n.by))}</span><b>${esc(fst(n.by))}</b><small>${fd(localDay(n.at))}</small><span class="cr-tag">${esc(n.tag||'Note')}</span><span class="sp"></span>${un?'<span class="ib-k ask">New</span>':''}</div><p>${esc(n.text)}</p>${un?`<div class="r"><button class="btn btn-sm" data-a="pop" data-p="reply" data-id="${esc(n.id)}">${ic('chat',13)}Reply</button><button class="btn btn-sm btn-primary" data-a="ack" data-id="${esc(n.id)}">${ic('check',13)}Got it</button></div>`:n.ack?`<div class="seen">${ic('check',11)}${self?'You saw it':esc(F(U.who))+' saw it'} ${fd(localDay(n.ack))}</div>`:`<div class="seen">Not seen yet</div>`}</div>`; }).join(''):`<div class="mg-none">No notes yet — ${lead?'write the first one: what went well, what to watch.':esc(fst(fm))+' writes them here.'}</div>`}</div></div>`; }
""")
cut("/* 6 · skills and training */\nfunction skillCard(){", "/* 7 · fixes you wrote */", r"""/* 6 · skills and training: the tech or the foreman adds them */
function skillCard(){ const S=SKLf(), nx=CRS().next, ed=isSelf()||canPick();
  return `<div class="mg-card${hl('skills')}" data-sec="skills"><div class="mg-ch"><b>Skills &amp; training</b><small>${esc(fst(FMN()))} sees these when work is handed out</small></div><div class="mg-cb">${S.length?S.map(x=>`<div class="cr-sk"><span class="gi ${x[1]}">${ic(x[1]==='ok'?'check':x[1]==='warn'?'flag':x[1]==='prog'?'book':'plus',13)}</span><span class="n"><b>${esc(x[0])}</b><small class="${x[1]}">${esc(x[2])}</small></span>${x[1]==='prog'&&x[3]?`<span class="b"><i style="width:${x[3]}%"></i></span>`:''}${x[1]==='warn'&&isSelf()?`<button class="btn btn-sm" data-a="retest" data-id="${esc(x[4])}">Book the retest</button>`:''}${ed?`<button class="btn btn-sm ib tg-gh" data-a="sdel" data-id="${esc(x[4])}" title="Take it off">${ic('x',13)}</button>`:''}</div>`).join(''):`<div class="mg-none">No certificates yet.</div>`}
    ${nx&&nx.name?`<div class="cr-next">${ic('clock',13)}<span>Next: <b>${esc(nx.name)}</b></span></div>`:''}
    ${ed?`<button class="cr-add" data-a="pop" data-p="skill">${ic('plus',13)}Add a certificate or class</button>`:''}</div></div>`; }
""")
cut("/* 7 · fixes you wrote */\nfunction fixCard(){", "/* 10 · the statement", r"""/* 7 · fixes you wrote — from the Fixes library */
function fixCard(){ const L=FXWf(), used=sum(L,f=>f[2]), held=sum(L,f=>f[3]), sv=sum(L,f=>f[5]);
  return `<div class="mg-card${hl('fixw')}" data-sec="fixw"><div class="mg-ch"><b>Fixes you wrote</b><small>when others use them, it shows here</small><span class="sp"></span>${L.length?`<span class="cr-fxs"><b>${used}</b> uses · <b>${held}</b> held · <b>${h1(sv)} h</b> saved others</span>`:''}</div><div class="mg-cb">${L.length?`<div class="cr-fh"><span>Fix</span><span>Used by</span><span>Used</span><span>Held</span><span>Saved</span></div>`+L.map(f=>`<button class="cr-fr" data-a="fxgo" data-k="${esc(f[6])}"><span class="n">${ic('fixes',14)}<b>${esc(f[0])}</b><small>written ${fd(f[1])}${f[1].slice(0,4)!==TODAY.slice(0,4)?', '+f[1].slice(0,4):''}</small></span><span class="by">${esc(f[4])}</span><span class="m">${f[2]}×</span><span class="m ${!f[2]?'':f[3]<f[2]?'mid':'ok'}">${f[2]?f[3]+' of '+f[2]:'—'}</span><span class="m">${f[2]?h1(f[5])+' h':'—'}</span></button>`).join('')+`<div class="cr-qft">Held — the truck didn’t come back with the same complaint. Saved — quoted minus clocked on the jobs that used it.</div>`:`<div class="mg-none">No fixes yet. When a job teaches you something, write it up in Fixes — it shows here each time someone uses it.</div><button class="cr-add" data-a="fxgo">${ic('plus',13)}Open Fixes</button>`}</div></div>`; }
""")
# the statement
rep("const a=TSTART[U.who]||'2026-01-01'; return [a,TODAY,", "const a=TSTART[U.who]||(TODAY.slice(0,4)+'-01-01'); return [a,TODAY,")
rep("const D=bestsData(), L=FXW[U.who], S=SKL[U.who].L.filter(s=>s[1]==='ok'||s[1]==='warn');", "const D=bestsData(), L=FXWf(), S=SKLf().filter(s=>s[1]==='ok'||s[1]==='warn');")
rep("<button class=\"btn btn-sm\" data-a=\"toast\" data-t=\"Sent to the printer — one page.\">${ic('print',14)}Print</button><button class=\"btn btn-sm btn-primary\" data-a=\"toast\" data-t=\"Saved — “${PPL[U.who]} work record.pdf”.\">",
    "<button class=\"btn btn-sm\" data-a=\"print\">${ic('print',14)}Print</button><button class=\"btn btn-sm btn-primary\" data-a=\"print\" title=\"Pick “Save as PDF” in the print window\">")
rep("<h3>Work record · ${PPL[U.who]}</h3><small>Technician · Vanguard Truck Center, Greensboro · since ${SINCE[U.who]}</small>",
    "<h3>Work record · ${esc(PPL[U.who])}</h3><small>${esc(roleOf(U.who))}${SHOPN()?' · '+esc(SHOPN()):''} · since ${SINCE[U.who]}</small>")
rep("<small>Frank Delaney · shop foreman</small>", "<small>${esc(FMN())} · shop foreman</small>")
rep("<small>Ray Holloway · service manager</small>", "<small>${esc(MGR())} · service manager</small>")
rep("entered by hand from old time sheets and confirmed by Ray Holloway. ", "entered by hand from old time sheets. ")
# work
rep("<button class=\"btn btn-sm\" data-a=\"toast\" data-t=\"In Parsec this opens RO ${r.no}.\">${ic('ros',14)}Open RO</button>", "<button class=\"btn btn-sm\" data-a=\"ro\" data-id=\"${r.id}\">${ic('ros',14)}Open RO</button>")
rep("  const days=o=>SCH.get(o);", r"""  const days=o=>{ const M={}; STATE.punches.forEach(p=>{ if(p.opId===o.id&&p.stop&&SD.keyOf(punchWho(p)||'')===U.who){ const d=localDay(p.start); M[d]=(M[d]||0)+(new Date(p.stop)-new Date(p.start))/3600000; } }); const L=Object.keys(M).sort().map(d=>[d,M[d]]); return L.length?L:SCH.get(o); };""")
rep("<span class=\"eff ${sv}\">${Math.round(o.q/o.b*100)}%</span>", "<span class=\"eff ${sv}\">${o.b?Math.round(o.q/o.b*100)+'%':'—'}</span>")
rep("<small>${PPL[o.tech]} · ${h1(o.q)} / ${h1(o.b)} h</small>", "<small>${esc(PPL[o.tech]||o.tech)} · ${h1(o.q)} / ${h1(o.b)} h</small>")
# popovers
rep("${x==='all'?(TSTART[U.who]?'since '+SINCE[U.who]:'since Jan 2025'):o.s}", "${x==='all'?(TSTART[U.who]?'since '+SINCE[U.who]:'since '+MN[dOf(START).getMonth()]+' '+START.slice(0,4)):o.s}")
rep("const L=(CHK[U.who]||[]).filter(c=>U.chk[c[0]]);", "const L=CHKf();")
rep("[['user','You','Everything on this page.'],['foreman','Frank Delaney · shop foreman','Your numbers, Work, coaching notes and skills. Not pay.'],['manager','Ray Holloway · service manager','Everything. He sets your goals.'],['lock','Other techs','Nothing — each tech sees only their own.']].map(r=>`<div class=\"cr-pvr\"><span class=\"gi\">${ic(r[0],14)}</span><b>${r[1]}</b><small>${r[2]}</small></div>`)",
    "[['user','You','Everything on this page.'],['foreman',FMN()+' · shop foreman','Your numbers, Work, coaching notes and skills. Not pay.'],['manager',MGR()+' · service manager','Everything. Sets your goals.'],['lock','Other techs','Nothing — each tech sees only their own.']].map(r=>`<div class=\"cr-pvr\"><span class=\"gi\">${ic(r[0],14)}</span><b>${esc(r[1])}</b><small>${r[2]}</small></div>`)")
rep("const d=U.prior[U.who]||PRIOR0[U.who];", "const d=U.prior[U.who]||{from:'',to:'',ro:'',d:'',q:'',b:''};")
rep("${TSTART[U.who]?'Your years before Vanguard':'Your years before Parsec'}", "${TSTART[U.who]?'Your years before this shop':'Your years before Parsec'}")
rep("Over quote stays Parsec only. Ray confirms it once.", "Over quote stays Parsec only.")
rep("""     <div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="psave">${ic('check',13)}Add to my totals</button></div></div>`; }
  return ''; }""", r"""     <div class="tg-acts">${U.prior[U.who]?'<button class="btn btn-sm tg-gh" data-a="pclr">Take them off</button><span class="sp"></span>':''}<button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="psave">${ic('check',13)}Add to my totals</button></div></div>`; }
  if(p.type==='note') return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>A note to ${esc(F(U.who))}</b><span class="cu">on Career and in their Inbox</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div><div class="cr-pf1"><label><small>About</small><select id="cr-ntag">${['Work','Quotes','Fixes','Time Log','Training','Quality','Goals'].map(x=>`<option>${x}</option>`).join('')}</select></label><label><small>Note</small><textarea id="cr-ntx" rows="4" placeholder="What went well, what to watch next time…"></textarea></label></div><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="nsave">${ic('send',13)}Send</button></div></div>`;
  if(p.type==='goal'){ const g=NTS().goal||{}; return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>A goal for ${esc(F(U.who))}</b><span class="cu">one at a time — it sits on top of the notes</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div><div class="cr-pf"><label><small>Number</small><select id="cr-gk">${[['eff','Efficiency %'],['prod','Productivity %'],['sold','Hours sold a workday'],['cb','Comeback rate %']].map(x=>`<option value="${x[0]}"${g.k===x[0]?' selected':''}>${x[1]}</option>`).join('')}</select></label><label><small>Target</small><input id="cr-gt" value="${g.t!=null?g.t:''}" inputmode="decimal" placeholder="85"></label><label><small>By</small><input id="cr-gd" type="date" value="${g.due||mEnd(addM(TODAY,1))}"></label></div><div class="tg-acts">${g.k?'<button class="btn btn-sm tg-gh" data-a="gclr">Take it off</button><span class="sp"></span>':''}<button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="gsave">${ic('check',13)}Set the goal</button></div></div>`; }
  if(p.type==='reply'){ const n=NTS().L.find(x=>x.id===p.id); return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>Reply to ${esc(fst(n?n.by:FMN()))}</b><span class="cu">it goes to their Inbox</span><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div><div class="cr-pf1"><label><small>Your reply</small><textarea id="cr-rtx" rows="3"></textarea></label></div><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="rsend" data-id="${esc(p.id||'')}">${ic('send',13)}Send</button></div></div>`; }
  if(p.type==='skill') return `<div class="tg-pop xf mg-pop-w"><div class="tg-ph"><b>Add a certificate or class</b><button class="btn btn-sm ib" data-a="popx">${ic('x',14)}</button></div><div class="cr-pf"><label style="grid-column:1/-1"><small>Name</small><input id="cr-sn" placeholder="ASE T2 · Diesel engines"></label><label><small>Expires</small><input id="cr-se" type="date"></label><label><small>Still in progress — % done</small><input id="cr-sp" inputmode="numeric" placeholder="empty if it’s done"></label><label style="grid-column:1/-1"><small>Next class (optional)</small><input id="cr-sx" value="${esc((CRS().next||{}).name||'')}" placeholder="Volvo I-Shift · Level 2 — Nov 18"></label></div><div class="tg-acts"><button class="btn btn-sm" data-a="popx">Cancel</button><button class="btn btn-sm btn-primary" data-a="ssave">${ic('check',13)}Save</button></div></div>`;
  return ''; }""")

# ---------- doing things ----------
rep("function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); const body=$('.tg-body'); if(el&&body){ const r=el.getBoundingClientRect(), br=body.getBoundingClientRect(); U.pop.ax=(r.left-br.left)/scale; U.pop.ay=(r.bottom-br.top)/scale; U.pop.aw=r.width/scale; U.pop.at=(r.top-br.top)/scale; } render(); }",
    "function openPop(type,ex,el){ U.pop=Object.assign({type},ex||{}); if(el) PG.anchor(U,el); rd(); }")
rep("function keepScroll(fn){ const sc=$('.mg-full'), y=sc?sc.scrollTop:0; fn(); const s2=$('.mg-full'); if(s2) s2.scrollTop=y; }\n", "")
rep("mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a; const wasHl=U.hl; U.hl=null;",
    "function onClick(t,e){ const a=t.dataset.a; const wasHl=U.hl; U.hl=null;")
rep("else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; keepScroll(render); return; } const sc=$('.mg-full'), y=sc?sc.scrollTop:0; openPop(t.dataset.p,{},t); const s2=$('.mg-full'); if(s2) s2.scrollTop=y; }",
    "else if(a==='pop'){ if(U.pop&&U.pop.type===t.dataset.p){ U.pop=null; rd(); return; } openPop(t.dataset.p,{id:t.dataset.id},t); }")
rep("else if(a==='go'){ U.view='work'; U.sel=t.dataset.ro; render(); const it=$('.tg-scroll .tg-it.on'), sc=$('.tg-scroll'); if(it&&sc) sc.scrollTop=it.offsetTop-120; }",
    "else if(a==='go'){ U.view='work'; U.sel=t.dataset.ro; U.kb=true; render(); }")
rep("else if(a==='fix'){ U.chk[t.dataset.c]=0; toast('Fixed in the Time Log — your numbers count it again.'); render(); }",
    "else if(a==='fix'){ const c=CHKf().find(x=>x[0]===t.dataset.c); U.pop=null; if(c){ UI.tlDay=c[5]; UI.tlWho=PPL[U.who]; PG.go('timelog'); } }")
rep("else if(a==='al'){ const k=t.dataset.k; U.al[k]=U.al[k]?0:1;", "else if(a==='al'){ if(!isSelf()){ toast('Only '+F(U.who)+' changes their alerts.'); return; } const k=t.dataset.k; snap(); U.al[k]=U.al[k]?0:1; CRS().al=U.al;")
rep("else if(a==='ack'){ U.ack[t.dataset.k]=1; toast('Frank sees you got it.'); keepScroll(render); }",
    "else if(a==='ack'){ const n=NTS().L.find(x=>x.id===t.dataset.id); if(!n) return; snap(); n.ack=nowIso(); try{ IB.send({to:n.by,k:'fyi',src:'career',t:F(U.who)+' saw your note',b:String(n.text).slice(0,160)}); }catch(err){} toast(fst(n.by)+' sees you got it.'); rd(); }")
rep("else if(a==='ask'){ toast(`Sent to Frank: ${t.dataset.n} runs ${t.dataset.v} over the quote for you, on average — ${t.dataset.c} jobs.`); keepScroll(render); }",
    "else if(a==='ask'){ const to=FMP(); if(!to){ toast('No foreman or manager on the team yet.'); return; } try{ IB.send({to,k:'fyi',src:'career',t:`Quote check: ${t.dataset.n}`,b:`${PPL[U.who]} runs ${t.dataset.v} over the quote on average — ${t.dataset.c} jobs. Worth a word with the writers.`}); }catch(err){} toast(`Sent to ${fst(to)}: ${t.dataset.n} runs ${t.dataset.v} over the quote for you, on average — ${t.dataset.c} jobs.`); rd(); }")
rep("else if(a==='prior'){ U.usePrior=t.dataset.v==='1'; keepScroll(render); }", "else if(a==='prior'){ snap(); U.usePrior=t.dataset.v==='1'; CRS().usePrior=U.usePrior; rd(); }")
rep("U.prior[U.who]=o; U.usePrior=true; U.pop=null; U.hl='prior';", "snap(); U.prior[U.who]=o; U.usePrior=true; CRS().prior=o; CRS().usePrior=true; U.pop=null; U.hl='prior';")
rep("  else if(wasHl) render();\n});", r"""  else if(a==='pclr'){ snap(); const c=CRS(); c.prior=null; c.usePrior=false; U.prior[U.who]=null; U.usePrior=false; U.pop=null; toast('Earlier years taken off.'); rd(); }
  else if(a==='inbox'){ PG.go('inbox'); }
  else if(a==='ro'){ PG.openRo(t.dataset.id); }
  else if(a==='fxgo'){ PG.go('fixes'); }
  else if(a==='print'){ const el=$('.mg-sheet'); if(!el) return; el.classList.add('pg-printme'); document.documentElement.classList.add('pg-print2'); setTimeout(()=>{ try{ window.print(); } finally { el.classList.remove('pg-printme'); document.documentElement.classList.remove('pg-print2'); } },30); }
  else if(a==='nsave'){ const tx=(($('#cr-ntx')||{}).value||'').trim(); if(!tx){ toast('Type the note first.'); return; } const tag=($('#cr-ntag')||{}).value||'Note', me=PG.me().name; snap(); NTS().L.push({id:uid('cn'),at:nowIso(),by:me,text:tx,tag,ack:null}); try{ IB.send({to:PPL[U.who],k:'fyi',src:'career',t:`A note from ${fst(me)} — ${tag.toLowerCase()}`,b:tx.slice(0,200)}); }catch(err){} U.pop=null; toast(`Sent — ${F(U.who)} sees it on Career and in the Inbox.`); rd(); }
  else if(a==='gsave'){ const k=($('#cr-gk')||{}).value, v=parseFloat((($('#cr-gt')||{}).value||'').replace(/[%h\s]/g,'')), due=($('#cr-gd')||{}).value; if(!KM[k]||!(v>0)||!/^\d{4}-\d\d-\d\d$/.test(due||'')){ toast('Pick the number, a target and a date.'); return; } snap(); NTS().goal={k,t:v,due,set:TODAY,by:PG.me().name}; try{ IB.send({to:PPL[U.who],k:'fyi',src:'career',t:`New goal: ${KM[k].n} ${KM[k].tw!=null?v+' h a workday':KM[k].u==='pct'?v+'%':v} by ${fd(due)}`,b:'From '+PG.me().name+' — it’s on your Career page.'}); }catch(err){} U.pop=null; toast('Goal set — it sits on top of the notes.'); rd(); }
  else if(a==='gclr'){ snap(); NTS().goal=null; U.pop=null; toast('Goal taken off.'); rd(); }
  else if(a==='rsend'){ const tx=(($('#cr-rtx')||{}).value||'').trim(); if(!tx){ toast('Type the reply first.'); return; } const n=NTS().L.find(x=>x.id===t.dataset.id), to=n?n.by:FMP(); if(!to){ toast('No one to send it to.'); return; } try{ IB.send({to,k:'fyi',src:'career',t:`${F(U.who)} replied to your note`,b:tx.slice(0,300)}); }catch(err){} if(n&&!n.ack){ snap(); n.ack=nowIso(); } U.pop=null; toast(`Sent to ${fst(to)}’s Inbox.`); rd(); }
  else if(a==='ssave'){ const nm=(($('#cr-sn')||{}).value||'').trim(), ex=($('#cr-se')||{}).value||'', pc=parseInt((($('#cr-sp')||{}).value||'').replace(/\D/g,''),10), nx=(($('#cr-sx')||{}).value||'').trim(); if(!nm&&!nx){ toast('Type the name first.'); return; } snap(); const S=CRS(); if(nm) S.skills.push({id:uid('sk'),name:nm,exp:/^\d{4}-\d\d-\d\d$/.test(ex)?ex:'',prog:pc>0&&pc<100,pct:pc>0&&pc<100?pc:0}); S.next=nx?{name:nx}:null; U.pop=null; toast(nm?'Added.':'Saved.'); rd(); }
  else if(a==='sdel'){ const S=CRS(); snap(); S.skills=S.skills.filter(x=>x.id!==t.dataset.id); toast('Taken off.'); rd(); }
  else if(a==='retest'){ const x=CRS().skills.find(y=>y.id===t.dataset.id), to=FMP(); if(!x||!to){ toast('No foreman or manager on the team yet.'); return; } try{ IB.send({to,k:'ask',src:'career',t:`${F(U.who)} needs a retest: ${x.name}`,b:x.exp?'Expires '+fd(x.exp)+', '+x.exp.slice(0,4)+'.':''}); }catch(err){} toast(`Asked ${fst(to)} — it’s in their Inbox.`); rd(); }
  else if(a==='mgteam'){ if(typeof MG!=='undefined'){ MG.U().view='team'; MG.U().person=U.who; } PG.go('manager'); }
  else if(wasHl) render();
}
function onChange(t){ if(t.dataset.who){ const v=t.value; if(canPick()&&TECHS.includes(v)){ const p=U.p, vw=U.view, me=U._me; reset(); U._me=me; U.who=v; U.p=p; U.view=vw; rd(); } } }""")
cut("mock.addEventListener('mousemove',e=>{ const tip=$('.tk-tip');", "addEventListener('keydown',e=>{", "")
rep("addEventListener('keydown',e=>{ const k=e.key; if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select')) return; const stop=()=>{e.preventDefault();e.stopPropagation();};",
    "function keydown(e){ const k=e.key; if(e.ctrlKey||e.metaKey||e.altKey||PG.typing(e)) return; const stop=()=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();};")
rep("  if(k==='1'||k==='2'||k==='3'){ U.view=['ov','work','grow'][+k-1]; render(); return stop(); }\n});", "  if(k==='1'||k==='2'||k==='3'){ U.view=['ov','work','grow'][+k-1]; render(); return stop(); }\n}")
cut("function after(){ const p=$('.tg-pop'), body=$('.tg-body');", "/* scroll a card into view and ring it, for the demo buttons */", r"""function after(){ PG.placePop(U);
  const sc=$('.tg-scroll'), on=sc&&sc.querySelector('.tg-it.on'); if(on&&U.kb){ if(on.offsetTop<sc.scrollTop+30) sc.scrollTop=on.offsetTop-40; else if(on.offsetTop+on.offsetHeight>sc.scrollTop+sc.clientHeight-20) sc.scrollTop=on.offsetTop+on.offsetHeight-sc.clientHeight+40; }
  if(U.pop&&!U.pop._f){ const f=$('.tg-pop textarea')||$('.tg-pop input:not([type=date])'); if(f){ U.pop._f=1; f.focus(); } } }
""")
cut("/* scroll a card into view and ring it, for the demo buttons */", "setWho('MR'); render();", "", incl=True)

# ---------- the alerts a tech turns on: derived Inbox items ----------
s += r"""
/* ---------- the alerts on the goals card, as Inbox items for the tech ---------- */
function newBest(k){ const F_={k:'tech',v:k}, s0=TSTART[k]||START, W_=[]; for(let a=wStart(s0);a<=TODAY;a=addD(a,7)){ const b=minK(addD(a,6),TODAY), O=ctx(a,b,F_).ops, q=sum(O,o=>o.q), bb=sum(O,o=>o.b); W_.push({a,q,e:bb?q/bb*100:null}); }
  const cur=W_.pop(), ok=W_.filter(w=>w.q>=20&&w.e!=null); if(!cur||cur.q<20||cur.e==null||ok.length<3) return null; const best=Math.max(...ok.map(w=>w.e)); return cur.e>best?{cur,best}:null; }
function alertsFor(me){ const S=STATE.cr&&STATE.cr[me], al=S&&S.al?S.al:{pace:1,fri:1,best:0}; if(!al.pace&&!al.fri&&!al.best) return []; data(); const k=SD.keyOf(me); if(!TECHS.includes(k)) return [];
  const F_={k:'tech',v:k}, g=GL(k), L=[], at=(d,h)=>{ const x=dOf(d); x.setHours(h,0,0,0); return x.toISOString(); };
  if(al.pace){ const a=mStart(TODAY), X=ctx(a,TODAY,F_), v=val(KM.sold,a,TODAY,F_)||0, behind=g.sold*X.wd-v; if(behind>.5&&X.wd>=2) L.push({key:'crp:'+TODAY, from:'Parsec', k:'rem', src:'career', at:at(TODAY,7), t:`You’re ${Math.round(behind)} h behind pace on hours sold for ${mName(TODAY)}`, b:`${h1(v)} h sold so far — your goal is ${g.sold} h a workday.`, acts:[['Open Career','page']]}); }
  if(al.fri){ const dw=dOf(TODAY).getDay(); if((dw===5&&new Date().getHours()>=16)||dw===6||dw===0){ const fr=dw===5?TODAY:addD(TODAY,dw===6?-1:-2), a=addD(fr,-4), O=ctx(a,fr,F_).ops, q=sum(O,o=>o.q), b=sum(O,o=>o.b); if(O.length) L.push({key:'crf:'+fr, from:'Parsec', k:'fyi', src:'career', at:at(fr,16), t:`Your week: ${h1(q)} h sold · ${b?Math.round(q/b*100)+'%':'—'} efficiency`, b:`${O.length} operation${O.length===1?'':'s'} closed, ${fd(a)} – ${fd(fr)}.`, acts:[['Open Career','page']]}); } }
  if(al.best){ const nb=newBest(k); if(nb) L.push({key:'crb:'+nb.cur.a, from:'Parsec', k:'fyi', src:'career', at:at(TODAY,7), t:`New best week: ${Math.round(nb.cur.e)}% efficiency`, b:`Your best before was ${Math.round(nb.best)}%.`, acts:[['Open Career','page']]}); }
  return L; }
"""
s = s.replace('<svg class="mg-svg" width="${w}" height="${H}">', '<svg class="mg-svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" preserveAspectRatio="xMinYMin meet">')   # charts shrink with the card
# render() inside the module means the app's render — keep the scroll
s = re.sub(r"(?<![\w.])render\(\)", "rd()", s)
s = s.replace("keepScroll(render)", "rd()")
s = s.replace("const rd=()=>PG.keepScroll(rd());", "const rd=()=>PG.keepScroll(render);")
s = s.replace("const rd=()=>PG.rd();", "const rd=()=>PG.keepScroll(render);")
assert "PG.rd(" not in s
s = s.replace("PG[U.who]", "GLC")
s = re.sub(r"\$210(?![\d,])", "${RATE}", s)
s = s.replace("how:'Labor sold ÷ hours clocked. At 100% efficiency it’s the ${RATE} rate.'", "how:'Labor sold ÷ hours clocked. At 100% efficiency it’s the labor rate.'")
s = s.replace("how:'Hours sold × ${RATE}.'", "how:'Hours sold × the labor rate.'")
for bad in ["mock.", "TOAST", "SKL[", "FXW[", "NOTES[", "RATE_T", "PRIOR0", "CHK[", "U.chk", "U.ack", "Ray ", "Frank", "Vanguard", "setWho"]:
    assert bad not in s, (bad, s[s.index(bad) - 80:s.index(bad) + 80])
assert "scale" not in re.sub(r"scale\(", "", s), "scale left"
assert "PG=" not in s.replace("const PGR=", "")

out = """/* ============================== Career (Career v2 mock-up) ==============================
   One technician's own numbers and how they grow: the period's tiles, efficiency day by day, why it moved,
   goals with Inbox alerts, the pay estimate (private), jobs that ran over; Work (their ROs, operation by
   operation, from the punches); Growth (bests, quote feedback, coaching notes, certificates, fixes they wrote);
   the Statement for a review. A tech sees only their own; the foreman and manager pick a tech. */
var CR = (function(){
""" + s + """
  reset();
  const H = new Proxy({}, { get: (o, a) => (t, e) => { DIRTY = false; const r = onClick(t, e); if(DIRTY){ scheduleSave(true); DIRTY = false; } return r; } });
  function change(t){ onChange(t); }
  function input(t, e){}
  function fieldKey(t, ev){ if(ev.key === 'Escape'){ t.blur(); if(U.pop){ U.pop = null; rd(); } ev.preventDefault(); return true; }
    if(ev.key === 'Enter' && U.pop && t.tagName !== 'TEXTAREA'){ ev.preventDefault(); const b = $('.tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    if(ev.key === 'Enter' && U.pop && t.tagName === 'TEXTAREA' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); const b = $('.tg-pop .btn-primary:not([disabled])'); if(b) b.click(); return true; }
    return false; }
  PG.reg('career', { H, U: () => U, input, change, fieldKey, keydown, after });
  if(typeof IB !== 'undefined') IB.DERIVE.push(me => alertsFor(me));
  return { view, U: () => U, alertsFor };
})();
function viewCareer(){ return CR.view(); }
"""
out = out.replace('<textarea id="cr-ntx"', '<textarea id="cr-ntx" data-in="ntx"').replace('<textarea id="cr-rtx"', '<textarea id="cr-rtx" data-in="rtx"')
for i in ["cr-sn", "cr-se", "cr-sp", "cr-sx", "cr-gt", "cr-gd"]:
    out = out.replace('<input id="%s"' % i, '<input id="%s" data-in="%s"' % (i, i[3:]))
out = out.replace('<input data-f="${f[0]}"', '<input data-f="${f[0]}" data-in="pf"')
open(os.path.join(H, "cr1.js"), "w", encoding="utf-8").write(out)
print("wrote cr1.js", len(out))
