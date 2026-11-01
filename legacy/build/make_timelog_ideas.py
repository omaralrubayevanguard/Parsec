# Time Log — all 8 ideas in one mock-up, built on the drag-an-edge mock-up (which is built on the 7 recommendations).
import os, sys, json, re
B = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(B, "make_timelog_drag.py")
OUT = sys.argv[1]
srcd = open(SRC, encoding="utf-8").read()
g = {"__name__": "tlideas", "__file__": SRC}
exec(srcd.split("\nused = set(")[0], g)
CSS, JS, IC, P, tok, bun, tg = g["CSS"], g["JS"], g["IC"], g["P"], g["tok"], g["bun"], g["tg"]
IC["lock"] = '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'

def rep(a, b, n=1):
    global JS
    c = JS.count(a); assert c == n, (a[:90], c); JS = JS.replace(a, b)

# ---------- time can move (the demos jump to 15:32 and 16:02), shifts, sign-offs ----------
rep("const NOW=14*60+15, TODAY='2026-10-22';", "let NOW=14*60+15; const TODAY='2026-10-22';\nconst SHIFT={MR:930,DK:990,LM:930,PS:990};")
rep("function reset(){ S={D:seed()};", "function reset(){ NOW=14*60+15; S={D:seed(),sign:{}};")
rep("fixed:{},role:'tech',note:null,hov:null,drag:null,snap:1,kh:false,ab:null};",
    "fixed:{},role:'tech',note:null,hov:null,drag:null,snap:1,kh:false,ab:null,per:'cur',snz:0,otAsk:false,trTbl:false};")
rep("<i>·</i><span class=\"tg-hf\"><b>${c?effTxt(c.eff):'—'}</b>efficiency today</span>", "${c&&c.on&&c.over>=30?'':`<i>·</i><span class=\"tg-hf\"><b>${c?effTxt(c.eff):'—'}</b>efficiency today</span>`}")
rep('title="Now 14:15"', 'title="Now ${hm(NOW)}"')
rep("at 14:15 —", "at ${hm(NOW)} —")

# ---------- seed: an automatic lunch on Tuesday; last pay period has every note but three ----------
rep("  /* the others, today */", r"""  /* Tuesday: no lunch clock-out — lunch taken automatically */
  D.MR['2026-10-20']={sh:[[422,692,'Lunch','auto'],[722,930,'End of day']],p:[
    pu(428,560,'37742','Diagnosing','Switched job','Purge valve leaking at the dryer — quoted.',1.9),
    pu(564,692,'37720','Inspecting – 74-point','Lunch','74-point done — brakes at 40%, wipers.',2.2),
    pu(724,860,'37750','Repairing','Waiting – Approval','Compressor clutch open — quote sent.',2.3),
    pu(862,926,'37203','Repairing','End of day','Radiator out, new one on order.',0.9)]};
  D.MR['2026-10-19'].p.forEach((p,i)=>{ p.q=[2.4,1.0,3.4][i]; });
  /* the pay period before (Oct 5 – 18): every punch has a note but three */
  Object.keys(D.MR).forEach(k=>{ if(k>='2026-10-05'&&k<='2026-10-18') D.MR[k].p.forEach((p,i)=>{ if(p.ro!=='SHOP'&&!p.note) p.note=NOTES[(i+k.charCodeAt(9))%NOTES.length]; }); });
  [['2026-10-07',1],['2026-10-13',2],['2026-10-15',0]].forEach(([k,i])=>{ const L=(D.MR[k]||{p:[]}).p.filter(p=>p.ro!=='SHOP'); if(L[i]) L[i].note=''; });
  /* the others, today */""")

# ---------- calc: the auto flag rides along; how far past the shift ----------
rep("const segs=D.sh.map(x=>[x[0],eod(x[1]),x[2],x[1]]);", "const segs=D.sh.map(x=>[x[0],eod(x[1]),x[2],x[1],x[3]]);")
rep("lunch.push([segs[i-1][1],segs[i][0],segs[i-1][2]])", "lunch.push([segs[i-1][1],segs[i][0],segs[i-1][2],segs[i-1][4]])")
rep("return {D,segs,ps,", "return {shEnd:SHIFT[t],over:(today&&open)?NOW-SHIFT[t]:null,D,segs,ps,")

# ---------- 3 · automatic lunch on the timeline, in the rows, the list and a banner ----------
rep('class="tk-lunch" data-tip=', 'class="tk-lunch${x[3]?\' auto\':\'\'}" data-tip=')
rep("${x[2]==='Lunch'?ic('coffee',14):''}</span>`; });", "${x[3]?'<em>AUTO</em>':x[2]==='Lunch'?ic('coffee',14):''}</span>`; });")
JS = JS.replace("(x[2]==='Lunch'?'Lunch':x[2]||'Off the clock')+' · '", "(x[3]?'Lunch, taken automatically':x[2]==='Lunch'?'Lunch':x[2]||'Off the clock')+' · '", 1)
rep("c.segs.forEach((x,i)=>{ h+=`<span class=\"tk-flag\" style=\"left:${pos(x[0],a,b)}\">IN</span>`; if(x[3]!=null) h+=",
    "c.segs.forEach((x,i)=>{ if(!(i&&c.segs[i-1][4])) h+=`<span class=\"tk-flag\" style=\"left:${pos(x[0],a,b)}\">IN</span>`; if(x[3]!=null&&!x[4]) h+=")
rep("c.segs.forEach((x,i)=>{ R.push({t:x[0],kind:'in',i}); if(x[3]!=null) R.push({t:x[1],kind:'out',why:x[2]}); });",
    "c.segs.forEach((x,i)=>{ if(!(i&&c.segs[i-1][4])) R.push({t:x[0],kind:'in',i}); if(x[3]!=null) R.push({t:x[1],kind:'out',why:x[2],auto:x[4],to:c.segs[i+1]?c.segs[i+1][0]:null}); });")
rep("if(r.kind==='out') return",
    "if(r.kind==='out'&&r.auto) return `<div class=\"tk-r edge auto\"><span class=\"tm\">${hm(r.t)} – ${hm(r.to)}</span><span class=\"du\">${dur(r.to-r.t)}</span><span class=\"wh\"><span class=\"l1\">${ic('coffee',13)}<b>Lunch, taken automatically</b>· no lunch clock-out by 6 hours in</span></span><span></span></div>`;\n    if(r.kind==='out') return")
rep("stat('Lunch',dur(c.lunchM))", "stat('Lunch',dur(c.lunchM),c.lunch.some(x=>x[3])?'auto':'')")
rep(":c.miss?`<span class=\"why warn\">", ":c.lunch.some(x=>x[3])&&!c.D.autoOk?`<span class=\"why warn\">${ic('coffee',12)}Lunch taken automatically — check it</span>`:c.miss?`<span class=\"why warn\">")
rep("  /* the day, in order: clock edges", r"""  const al=c.lunch.find(x=>x[3]); if(al&&!c.D.autoOk) h+=`<div class="tk-fix warn auto">${ic('coffee',16)}<p><b>Lunch taken automatically.</b> No lunch clock-out by ${hm(c.segs[0][0]+360)}, 6 hours in — so 30 min came off at ${hm(al[0])}–${hm(al[1])}, where no job was running.</p><button class="btn btn-sm" data-a="lunchok">Keep it</button><button class="btn btn-sm tg-gh" data-a="lunchwork">I worked through it</button></div>`;
  /* the day, in order: clock edges""")

# ---------- 2 · 4 · the shift end: a line on today's timeline, the reminder, the header, the Shop view ----------
rep("  if(c.today&&NOW>a&&NOW<b) h+=",
    "  if(opts.live&&c.today&&c.on&&c.shEnd>a&&c.shEnd<b) h+=`<span class=\"tk-shend${c.over>=30?' late':''}\" style=\"left:${pos(c.shEnd,a,b)}\"><em>SHIFT ENDS ${hm(c.shEnd)}</em></span>`;\n  if(c.today&&NOW>a&&NOW<b) h+=")
rep("${c&&c.on?`<span class=\"tg-hf tk-hb\">", "${c&&c.on&&c.over>=30?`<span class=\"tg-hf bad\"><b>${c.over} min</b>past the shift</span><i>·</i>`:''}${c&&c.on?`<span class=\"tg-hf tk-hb\">")
rep("const now=k===TODAY?(c.run?", "const now=k===TODAY&&c.on&&c.over>=30?`<small class=\"bad\">${ic('flag',11)}${c.over} min past shift · ${c.run?(c.run.ro==='SHOP'?'shop time':c.run.ro):'no job'}</small>`:k===TODAY?(c.run?")
rep("<span><b>1</b>off — Luis", "${(()=>{ const n=Object.keys(TECH).filter(t=>{ const x=calc(t,k); return k===TODAY&&x&&x.on&&x.over>=30; }).length; return n?`<span class=\"bad\"><b>${n}</b>clock${n>1?'s':''} 30+ min past the shift</span>`:''; })()}<span><b>1</b>off — Luis")
rep("<div class=\"tk-tip\" hidden>", "${remind()}<div class=\"tk-tip\" hidden>")

# ---------- 5 · 8 · pay periods, the sign-off bar, the lock ----------
rep("const per0='2026-10-12'", "const per0=PER[U.per][0]")
rep("<b>Pay period · Oct 12 – Oct 25</b>", "<b>Pay period · ${PER[U.per][1]}</b>")
rep("<span class=\"tg-hf\" style=\"cursor:default\">two weeks, Monday to Sunday</span>",
    "<span class=\"tg-hf\" style=\"cursor:default\">${U.per==='prev'?'ended Sun 10/18 · due Fri 10/23':'two weeks, Monday to Sunday'}</span>")
rep("<button class=\"btn btn-sm ib\" data-a=\"toast\" data-t=\"The pay period before.\">${ic('chevL',15)}</button><button class=\"btn btn-sm ib\" disabled>${ic('chevR',15)}</button>",
    "<button class=\"btn btn-sm ib\" data-a=\"per\" data-v=\"prev\" title=\"The period before\"${U.per==='prev'?' disabled':''}>${ic('chevL',15)}</button><button class=\"btn btn-sm ib\" data-a=\"per\" data-v=\"cur\" title=\"This period\"${U.per==='cur'?' disabled':''}>${ic('chevR',15)}</button>")
rep("<small>Oct 12 – Oct 25, 2026</small></div></header>", "<small>${PER[U.per][1]}, 2026</small>${(S.sign[sgK()]||{}).fm?`<span class=\"tk-stamp\">${ic('lock',11)}Approved · locked</span>`:''}</div></header>")
rep("<div class=\"tk-sig\"><div>Technician</div><div>Foreman / manager</div></div>", "${sigLines()}")
rep("const n=['2026-10-19','2026-10-21'].filter(", "const n=perDays(U.per).filter(")
i = JS.index("${nfix?`<div class=\"tk-tsfix\">"); j = JS.index("</div>`:''}", i) + len("</div>`:''}")
JS = JS[:i] + "${signBar(L)}" + JS[j:]
rep("<div class=\"tk-day\" data-scroll=\"day\">", "<div class=\"tk-day${isLocked(U.who,k)?' locked':''}\" data-scroll=\"day\">")
rep("<h2>${c.today?'Today · ':''}${DNL[d.getDay()]}, ${MNL[d.getMonth()]} ${d.getDate()}</h2>${st}",
    "<h2>${c.today?'Today · ':''}${DNL[d.getDay()]}, ${MNL[d.getMonth()]} ${d.getDate()}</h2>${st}${isLocked(U.who,k)?`<span class=\"tk-pill lock\">${ic('lock',11)}Locked · approved by Frank</span>`:''}")
rep("<span class=\"r1\">${today?'Today':DNL[d.getDay()]}", "<span class=\"r1\">${today?'Today':DNL[d.getDay()]}${isLocked(U.who,k)?`<span class=\"tk-lk\" title=\"Approved and locked\">${ic('lock',12)}</span>`:''}")
rep("function openPop(type,ex,el){", "function openPop(type,ex,el){ if(['edit','fix','air'].includes(type)&&isLocked(U.who,U.day)){ U.pop=null; toast(`Locked — ${PER.prev[1]} was approved. ${U.role==='foreman'?'Reopen it on the timesheet to change it.':'Ask Frank to reopen it.'}`,false); render(); return; }")
rep("function nudge(edge,dv){", "function nudge(edge,dv){ if(isLocked(U.who,U.day)){ toast('Locked — this pay period was approved.',false); render(); return; } if(U.role==='foreman'){ toast('As foreman, drag the edge or press E — a change to someone’s time asks why.',false); render(); return; }")

# ---------- 6 · a reason when the foreman changes someone's time ----------
rep("<div class=\"tg-acts\"><button class=\"btn btn-sm tg-gh\" data-a=\"pdel\"", "${whyRow(p,f.t)}<div class=\"tg-acts\"><button class=\"btn btn-sm tg-gh\" data-a=\"pdel\"")
rep("<span class=\"hint\">Edits are marked on the day report</span>", "<span class=\"hint\">${U.role==='foreman'?TF(f.t)+' sees the reason on the day':'Edits are marked on the day report'}</span>")
rep("data-a=\"psave\">Save", "data-a=\"psave\"${needWhy(p)?' disabled':''}>Save")
rep("if(p.er) x.er=p.er;", "if(p.er) x.er=p.er; if(U.role==='foreman'){ if(!p.why) return; x.by='Frank'; x.why=p.why; }")
rep("<div class=\"tg-acts\"><span class=\"hint\">The day becomes", "${whyRow(p,U.who)}<div class=\"tg-acts\"><span class=\"hint\">The day becomes")
rep("<div class=\"tg-acts\"><span class=\"hint\">Marked as edited on both punches", "${whyRow(p,U.who)}<div class=\"tg-acts\"><span class=\"hint\">Marked as edited on both punches")
rep("data-a=\"fgo\"${p.o==null?' disabled':''}", "data-a=\"fgo\"${p.o==null||needWhy(p)?' disabled':''}", 2)
rep("U.pop=null; toast('Overlap fixed", "if(U.role==='foreman') Object.assign(p.o===0?A:Bp,{by:'Frank',why:p.why}); U.pop=null; toast('Overlap fixed")
rep("if(!p.ed) p.ed=hm(d.orig.s)", "d.ed0=p.ed||null; if(!p.ed) p.ed=hm(d.orig.s)")
rep("  const o=d.edge==='e'?d.orig.e:d.orig.s, n=p[d.edge];\n  toast(",
    "  const o=d.edge==='e'?d.orig.e:d.orig.s, n=p[d.edge];\n  if(U.role==='foreman'){ const el=$(`.tk-tl .tk-b[data-p=\"${p.id}\"]`); openPop('why',{pid:p.id,orig:d.orig,edge:d.edge,ed0:d.ed0,o,n},el); return; }\n  toast(")
rep("${p.ed?(p.ed==='added by hand'?'<span class=\"tk-ed\">added by hand</span>':`<span class=\"tk-ed\" title=\"Before the edit: ${esc(p.ed)}\">edited · was ${esc(p.ed)}</span>`):''}", "${edBadge(p)}")
rep("else if(a==='popx'){ U.pop=null; render(); }", "else if(a==='popx'){ whyCancel(); U.pop=null; render(); }")
rep("if(p){ if(k==='Escape'){U.pop=null;render();return stop();}",
    "if(p&&p.type==='notes'&&k==='Enter'&&e.target.dataset&&e.target.dataset.nid){ const L=$$('.tg-pop [data-nid]'), i=L.indexOf(e.target); if(i<L.length-1){ L[i+1].focus(); return stop(); } }\n"
    "  if(p){ if(k==='Escape'){whyCancel();U.pop=null;render();return stop();}")
rep("{ U.pop=null; render(); } },true);", "{ whyCancel(); U.pop=null; render(); } },true);")

# ---------- the new popovers: why, and the missing notes ----------
rep("  if(p.type==='air'){", r"""  if(p.type==='why'){ const f=findP(p.pid); if(!f) return ''; const x=f.p;
    return `<div class="tg-pop xf tk-pop-w" ${st}>${hd('Why the change?',`${x.ro==='SHOP'?'Shop time':x.ro} · ${p.edge==='e'?'stop':'start'} ${hm(p.o)} → ${hm(p.n)}`)}<div class="tk-ctx">This is <b>${esc(TECH[f.t])}</b>’s time. The reason shows on ${TF(f.t)}’s day and on the day report.</div>
      <div class="tg-r tk-why">${WHYS.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="pset" data-f="why" data-v="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      <div class="tg-acts"><button class="btn btn-sm tg-gh" data-a="wcancel">Put it back</button><span class="hint"></span><button class="btn btn-sm btn-primary" data-a="wgo"${p.why?'':' disabled'}>Save change${kbd('↵')}</button></div></div>`; }
  if(p.type==='notes'){ const ids=p.ids||(p.ids=missNotes(sgT(),perDays(U.per)).map(x=>x.p.id)), left=ids.filter(id=>{ const f=findP(id); return f&&!(f.p.note||'').trim(); }).length;
    return `<div class="tg-pop xf tk-pop-n" ${st}>${hd('Punches without a work note',PER[U.per][1])}<div class="tk-ctx">The timesheet can’t be signed until every punch has a note. Each one saves to its punch.</div>
      <div class="tk-nl">${ids.map(id=>{ const f=findP(id); if(!f) return ''; const x=f.p; return `<label class="tk-nr"><span class="m"><span class="d">${short(f.k)}</span><span class="no">${x.ro}</span><span class="cm">${esc(ROS[x.ro][1])}</span><small>${hm(x.s)}–${hm(x.e)}</small></span><input data-nid="${id}" value="${esc(x.note)}" placeholder="What was done"></label>`; }).join('')}</div>
      <div class="tg-acts"><span class="hint tk-nleft">${left?left+' left':'All done'}</span><button class="btn btn-sm btn-primary" data-a="notesgo">Done${kbd('↵')}</button></div></div>`; }
  if(p.type==='air'){""")

# ---------- 7 · the efficiency trend on the Week view ----------
rep("<div class=\"tk-st\" style=\"margin-top:12px\"><div class=\"tk-sth\" style=\"font-weight:400\">Click a day to open it", "${effTrend()}<div class=\"tk-st\" style=\"margin-top:12px\"><div class=\"tk-sth\" style=\"font-weight:400\">Click a day to open it")

# ---------- the actions ----------
rep("  else if(a==='notex'){", r"""  else if(a==='per'){ U.per=t.dataset.v; U.pop=null; render(); }
  else if(a==='tsign'){ snap(); S.sign[sgK()]={tech:stamp()}; toast(`Signed — ${PER[U.per][1]} goes to Frank to approve.`); render(); }
  else if(a==='tunsign'){ snap(); delete S.sign[sgK()]; toast('Signature taken back — you can change your time again.'); render(); }
  else if(a==='tapprove'){ snap(); S.sign[sgK()].fm=stamp(); toast(`Approved — ${PER[U.per][1]} is locked for ${TF(sgT())}.`); render(); }
  else if(a==='treopen'){ snap(); delete S.sign[sgK()]; toast(`Reopened — ${TF(sgT())} can change it, then signs again.`); render(); }
  else if(a==='notesgo'){ const n=missNotes(sgT(),perDays(U.per)).length, ch=p&&p._sn; U.pop=null; toast(n?`${n} punch${n>1?'es':''} still without a note.`:'Notes added — the timesheet is ready to sign.',!!ch); render(); }
  else if(a==='clkout'){ const r=clockOut(NOW); toast(`Clocked out at ${hm(NOW)}${r?' · '+(r.ro==='SHOP'?'shop time':r.ro)+' stopped — add its work note':''}.`); render(); }
  else if(a==='clkat'){ const c=calc('MR',TODAY), m=c.over; clockOut(c.shEnd); toast(`Clocked out at ${hm(c.shEnd)} — the ${m} min after don’t count. Marked edited.`); render(); }
  else if(a==='remsnz'){ U.snz=NOW+30; toast(`OK — it asks again at ${hm(NOW+30)}.`,false); render(); }
  else if(a==='ot'){ U.otAsk=true; toast('Marked overtime — Frank is asked to OK it.',false); render(); }
  else if(a==='lunchok'){ snap(); dayOf(U.who,U.day).autoOk=1; toast('Kept — lunch stays at 30 min.'); render(); }
  else if(a==='lunchwork'){ snap(); const D=dayOf(U.who,U.day), i=D.sh.findIndex(x=>x[3]==='auto'); if(i>=0&&D.sh[i+1]){ D.sh[i][1]=D.sh[i+1][1]; D.sh[i][2]=D.sh[i+1][2]; D.sh.splice(i+1,1); D.sh[i].length=3; } toast('Lunch removed — the 30 min are back on the clock as air. Fill them with the job you were on.'); render(); }
  else if(a==='trtbl'){ U.trTbl=t.dataset.v==='1'; render(); }
  else if(a==='wgo'){ const f=findP(p.pid); if(!f||!p.why) return; f.p.by='Frank'; f.p.why=p.why; U.pop=null; toast(`${f.p.ro==='SHOP'?'Shop time':f.p.ro} · ${p.edge==='e'?'stop':'start'} ${hm(p.o)} → ${hm(p.n)} · ${TF(f.t)} sees why.`); render(); }
  else if(a==='wcancel'){ whyCancel(); render(); }
  else if(a==='notex'){""")

# ---------- the helpers ----------
JS = JS.replace("function axis(a,b,step){", r"""const PER={prev:['2026-10-05','Oct 5 – Oct 18'],cur:['2026-10-19','Oct 19 – Nov 1']};
const WHYS=['Forgot to stop the clock','Wrong job or RO','Tech asked me to','Matches the RO paperwork'];
const perDays=per=>{ const L=[]; for(let i=0;i<14;i++) L.push(addD(PER[per][0],i)); return L; };
const sgT=()=>U.who==='ALL'?'MR':U.who, sgK=()=>sgT()+U.per, stamp=()=>'Thu 10/22 '+hm(NOW);
function isLocked(t,k){ const s=S.sign[t+'prev']; return !!(s&&s.fm)&&k>=PER.prev[0]&&k<=addD(PER.prev[0],13); }
function missNotes(t,L){ const R=[]; L.forEach(k=>{ const D=dayOf(t,k); if(D&&k!==TODAY) D.p.slice().sort((a,b)=>a.s-b.s).forEach(p=>{ if(p.ro!=='SHOP'&&p.e!=null&&!(p.note||'').trim()) R.push({k,p}); }); }); return R; }
const needWhy=p=>U.role==='foreman'&&!p.why;
function whyRow(p,t){ return U.role==='foreman'?`<span class="tg-lbl top">Why change ${TF(t==='ALL'?'MR':t)}’s time?</span><div class="tg-r tk-why">${WHYS.map(w=>`<button class="tg-chip${p.why===w?' on':''}" data-a="pset" data-f="why" data-v="${esc(w)}">${esc(w)}</button>`).join('')}</div>`:''; }
function edBadge(p){ if(!p.ed) return ''; if(p.ed==='added by hand') return '<span class="tk-ed">added by hand</span>';
  return p.by?`<span class="tk-ed by" title="Changed by ${p.by}: ${esc(p.why)} · before: ${esc(p.ed)}">${ic('pencil',10)}${p.by} · ${esc(p.why)} · was ${esc(p.ed)}</span>`:`<span class="tk-ed" title="Before the edit: ${esc(p.ed)}">edited · was ${esc(p.ed)}</span>`; }
function whyCancel(){ const p=U.pop; if(!p||p.type!=='why') return; const D=dayOf(U.who,U.day), x=D&&D.p.find(q=>q.id===p.pid); if(x){ x.s=p.orig.s; x.e=p.orig.e; if(p.ed0) x.ed=p.ed0; else delete x.ed; } UNDO.pop(); U.pop=null; toast('Put back — nothing changed.',false); }
function clockOut(at){ snap(); const D=dayOf('MR',TODAY), r=D.p.find(p=>p.e==null); if(r){ if(at<NOW&&!r.ed) r.ed=hm(r.s)+'–now'; r.e=Math.max(r.s+5,at); r.er='End of day'; } const sg=D.sh[D.sh.length-1]; sg[1]=at; sg[2]='End of day'; return r; }
function remind(){ if(U.role!=='tech') return ''; const c=calc('MR',TODAY); if(!c||!c.on||c.over==null||c.over<0||U.otAsk||NOW<U.snz) return '';
  const ro=c.run?(c.run.ro==='SHOP'?'shop time':c.run.ro):null;
  if(c.over>=30) return `<div class="tk-remind warn"><span class="i">${ic('flag',16)}</span><div><b>${c.over} min past your shift</b><p>Still on ${ro||'the clock'}${c.run?' — '+dur(NOW-c.run.s):''}. Past 30 minutes, Frank sees it in the Shop view.</p><div class="r"><button class="btn btn-sm btn-primary" data-a="clkat">Clock out at ${hm(c.shEnd)}</button><button class="btn btn-sm" data-a="clkout">Clock out now</button><button class="btn btn-sm tg-gh" data-a="ot">It’s overtime</button></div></div></div>`;
  return `<div class="tk-remind"><span class="i">${ic('clock',16)}</span><div><b>Your shift ended at ${hm(c.shEnd)}</b><p>You’re still on the clock${ro?' — on '+ro+' for '+dur(NOW-c.run.s):''}.</p><div class="r"><button class="btn btn-sm btn-primary" data-a="clkout">${ro?'Stop and clock out':'Clock out'}</button><button class="btn btn-sm" data-a="remsnz">Still working · ask at ${hm(NOW+30)}</button></div></div></div>`; }
function signBar(L){
  const t=sgT(), per=U.per, sg=S.sign[t+per]||{}, me=U.role==='tech', nm=TF(t), ended=per==='prev';
  const fixD=L.filter(k=>{ const c=calc(t,k); return c&&c.fixes.length&&!U.fixed[t+k]; }), mn=missNotes(t,L), blocked=fixD.length+mn.length>0;
  const step=(n,lbl,sub,st)=>`<div class="tk-stp ${st}"><span class="dot">${st.includes('done')?ic(n===3?'lock':'check',12):n}</span><span><b>${lbl}</b><small>${sub}</small></span></div>`;
  const s1=sg.tech?'done':ended?'now':'', s2=sg.fm?'done':sg.tech?'now':'', s3=sg.fm?'done lk':'';
  let act='';
  if(!ended) act=`<span class="tk-sgn-n">Signing opens Sun 11/1, when the period ends</span>`;
  else if(sg.fm) act=me?`<span class="tk-sgn-n">${ic('lock',13)}Locked — ask Frank if something’s wrong</span>`:`<button class="btn btn-sm" data-a="treopen">${ic('history',14)}Reopen</button>`;
  else if(sg.tech) act=me?`<button class="btn btn-sm tg-gh" data-a="tunsign">Take back my signature</button>`:`<button class="btn btn-sm btn-primary" data-a="tapprove">${ic('check',14)}Approve and lock</button>`;
  else act=me?`<button class="btn btn-sm btn-primary" data-a="tsign"${blocked?' disabled title="Clear the items below first"':''}>${ic('pencil',14)}Sign my timesheet</button>`:`<span class="tk-sgn-n">Waiting for ${nm} to sign</span>`;
  const ps=S.sign[t+'prev']||{}, due=per==='cur'&&!ps.fm?`<div class="tk-sgn-due">${ic('flag',14)}<span><b>${PER.prev[1]}</b> is waiting for ${ps.tech?(me?'Frank to approve':'your approval'):(me?'your signature':nm+'’s signature')} · due Fri 10/23</span><button class="btn btn-sm" data-a="per" data-v="prev">Open it</button></div>`:'';
  const blk=!sg.tech&&blocked?`<div class="tk-blk"><span class="t">${ended?(me?'Before you can sign':'Before '+nm+' can sign'):'Before this can be signed'}</span>${fixD.map(k=>`<button class="tk-bk bad" data-a="gofix" data-k="${k}">${ic('flag',12)}${short(k)} · ${esc(calc(t,k).fixes[0].t)}</button>`).join('')}${mn.length?`<button class="tk-bk warn" data-a="pop" data-p="notes">${ic('note',12)}${mn.length} punch${mn.length>1?'es':''} without a work note · Add them…</button>`:''}</div>`:'';
  return `<div class="tk-sgn">${due}<div class="tk-sgr">${step(1,me?'You sign':nm+' signs',sg.tech?'Signed '+sg.tech:ended?(blocked?'Not yet — see below':'Ready'):'After the period ends',s1)}<i class="tk-sl${sg.tech?' done':''}"></i>${step(2,me?'Frank approves':'You approve',sg.fm?'Approved '+sg.fm:sg.tech?'Waiting':'After the signature',s2)}<i class="tk-sl${sg.fm?' done':''}"></i>${step(3,'Locked',sg.fm?'No more changes':'Changes close after approval',s3)}<span class="sp"></span>${act}</div>${blk}</div>`; }
function sigLines(){ const sg=S.sign[sgK()]||{}, t=sgT();
  return `<div class="tk-sig"><div>${sg.tech?`<i>${esc(TECH[t])}<small>${sg.tech}</small></i>`:''}Technician</div><div>${sg.fm?`<i>Frank Delaney<small>${sg.fm}</small></i>`:''}Foreman / manager</div></div>`; }
function effTrend(){
  const t=sgT(), ws=wkStart(TODAY), syn=[.91,.97,1.02,.99], W=[];
  for(let i=7;i>=0;i--){ const k=addD(ws,-7*i); let j=0,q=0,n=0; for(let d=0;d<7;d++){ const c=calc(t,addD(k,d)); if(c){ j+=c.job; q+=c.q; n++; } }
    if(!n){ j=35.5*60; q=syn[7-i]*35.5; } W.push({k,e:q/(j/60),j:j/60,q,cur:i===0}); }
  const vals=W.map(w=>w.e), lo=Math.min(.8,Math.floor((Math.min(...vals)-.04)*10)/10), hi=Math.max(1.2,Math.ceil((Math.max(...vals)+.04)*10)/10);
  const avg=vals.reduce((s,v)=>s+v,0)/vals.length, cur=W[7].e, dl=Math.round((cur-W[6].e)*100);
  const sum=`<div class="tk-trs"><small>This week so far</small><b>${effTxt(cur)}</b><small><span class="${dl>=0?'up':'dn'}">${dl>=0?'▲':'▼'} ${Math.abs(dl)} pts</span> on last week</small><small>8-week average ${effTxt(avg)}</small></div>`;
  let body;
  if(U.trTbl) body=`<table class="tk-trt"><thead><tr><th>Week of</th><th>On jobs</th><th>Quoted</th><th>Efficiency</th></tr></thead><tbody>${W.slice().reverse().map(w=>{ const d=dOf(w.k); return `<tr><td>${MN[d.getMonth()]} ${d.getDate()}${w.cur?' · so far':''}</td><td>${w.j.toFixed(1)} h</td><td>${w.q.toFixed(1)} h</td><td>${effTxt(w.e)}</td></tr>`; }).join('')}</tbody></table>`;
  else { const Wd=640,H=150,L=44,R=64,T=12,B=24, X=i=>L+i*(Wd-L-R)/7, Y=v=>T+(hi-v)/(hi-lo)*(H-T-B); let g='';
    for(let v=lo;v<=hi+1e-9;v+=.1){ const y=Y(v), one=Math.abs(v-1)<1e-6; if(!one) g+=`<line class="gl" x1="${L}" x2="${Wd-R+10}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`; g+=`<text class="${one?'rl':'ax'}" x="${L-8}" y="${(y+3.5).toFixed(1)}" text-anchor="end">${Math.round(v*100)}%</text>`; }
    const y1=Y(1); g+=`<line class="ref" x1="${L}" x2="${Wd-R+10}" y1="${y1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`;
    const pt=W.map((w,i)=>[X(i),Y(w.e)]), f=q=>q[0].toFixed(1)+' '+q[1].toFixed(1);
    g+=`<path class="tln" d="M${pt.slice(0,7).map(f).join(' L')}"/><path class="tln so" d="M${f(pt[6])} L${f(pt[7])}"/>`;
    W.forEach((w,i)=>{ const d=dOf(w.k); g+=`<text class="ax" x="${X(i).toFixed(1)}" y="${H-5}" text-anchor="middle">${d.getMonth()+1}/${d.getDate()}</text>`; });
    pt.forEach((q,i)=>{ g+=`<circle class="pt${W[i].cur?' cur':''}" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4.5"/>`; });
    g+=`<text class="vl" x="${(pt[7][0]+11).toFixed(1)}" y="${(pt[7][1]+1).toFixed(1)}">${effTxt(cur)}</text><text class="rl" x="${(pt[7][0]+11).toFixed(1)}" y="${(pt[7][1]+14).toFixed(1)}">so far</text>`;
    const sw=(Wd-L-R)/7; W.forEach((w,i)=>{ const d=dOf(w.k); g+=`<rect class="hit" x="${(X(i)-sw/2).toFixed(1)}" y="${T-6}" width="${sw.toFixed(1)}" height="${H-T-B+12}" rx="6" data-tip="Week of ${MN[d.getMonth()]} ${d.getDate()}${w.cur?' · so far':''}|${effTxt(w.e)} · ${w.q.toFixed(1)} h quoted for ${w.j.toFixed(1)} h on jobs"/>`; });
    body=`<svg width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Efficiency per week, last 8 weeks">${g}</svg>`; }
  return `<div class="tk-trend"><div class="tk-trh"><b>Efficiency, week by week</b><small>quoted hours ÷ hours on jobs · 100% is right on the quote</small><span class="sp"></span><span class="tg-seg3"><button class="${U.trTbl?'':'on'}" data-a="trtbl" data-v="0">Chart</button><button class="${U.trTbl?'on':''}" data-a="trtbl" data-v="1">Table</button></span></div><div class="tk-trb">${sum}${body}</div></div>`; }
function ideasAfter(){
  if(U.pop&&U.pop.type==='notes'){ const el=$(`.tg-pop [data-nid="${U.pop.fid||(U.pop.ids||[])[0]}"]`); if(el&&document.activeElement!==el){ el.focus(); const v=el.value; el.setSelectionRange(v.length,v.length); } }
}
mock.addEventListener('input',e=>{ const id=e.target.dataset&&e.target.dataset.nid; if(!id||!U.pop) return; const f=findP(id); if(!f) return; if(!U.pop._sn){ snap(); U.pop._sn=1; } f.p.note=e.target.value;
  const n=$$('.tg-pop [data-nid]').filter(x=>!x.value.trim()).length, h=$('.tg-pop .tk-nleft'); if(h) h.textContent=n?n+' left':'All done'; });
mock.addEventListener('focusin',e=>{ const id=e.target.dataset&&e.target.dataset.nid; if(id&&U.pop) U.pop.fid=id; });
function axis(a,b,step){""", 1)
rep("  note();\n}", "  ideasAfter();\n  note();\n}")
rep("const A=N.n?box(pick(N.n)):R", "const A=(N.n&&box(pick(N.n)))||R")

# ---------- the notes and the demo states ----------
i = JS.index("const NOTE={"); j = JS.index("\n};\n", i) + 4
JS = JS[:i] + """const NOTE={
 1:{r:'.tk-bub',at:'right',t:'Drag an edge',p:'Grab either end of a punch and drag. The time follows the pointer, clicks to the next job and stops at the clock. Let go to save, with Undo.'},
 2:{r:'.tk-remind',at:'left',t:'Shift-end reminder',p:'Your shift ended at 15:30 and you’re still on the clock. Stop and clock out in one click, or keep working and it asks again in 30 minutes.'},
 3:{r:'.tk-lunch.auto',n:'.tk-fix.auto',al:'right',t:'Lunch, taken automatically',p:'No lunch clock-out by 6 hours in, so 30 minutes come off where no job was running, marked AUTO. Keep it, or say you worked through it.'},
 4:{r:'.tk-remind',at:'left',t:'30 minutes past the shift',p:'The reminder turns red and the foreman sees it too. Clock out at 15:30 if you forgot, clock out now, or mark it overtime. View as Foreman → Shop shows the flag.'},
 5:{r:'.tk-sgn',n:'.tk-sgn',al:'right',t:'Pay-period sign-off',p:'Mike signs, Frank approves, and the period locks: no more changes to those days unless Frank reopens it. Approve here, then open a day from Oct 5 – 18.'},
 6:{r:'.tg-pop',at:'right',t:'A reason to change someone’s time',p:'When the foreman drags, edits or fixes a tech’s punch, he picks why. Save stays off until he does. The tech sees the reason on the punch.'},
 7:{r:'.tk-trend',t:'Efficiency, week by week',p:'Eight weeks on the Week view. The dashed line is 100% — quoted hours equal hours on the job. Hover a week for the hours; Table shows the numbers.'},
 8:{r:'.tg-pop',at:'right',t:'Notes before signing',p:'A punch without a work note blocks the signature. Add them right here; each saves to its punch. Then Sign turns on.'}
};
""" + JS[j:]
i = JS.index("const DEMO={"); j = JS.index("};", i) + 2
JS = JS[:i] + """const fillNotes=(t,per)=>missNotes(t,perDays(per)).forEach(x=>{ x.p.note=NOTES[0]; });
const DEMO={
  d1:()=>{reset();setRole('tech');frozen(P1(),'e',520);U.note=1;render();},
  d2:()=>{reset();setRole('tech');NOW=932;U.note=2;render();},
  d3:()=>{reset();setRole('tech');U.day='2026-10-20';U.note=3;render();},
  d4:()=>{reset();setRole('tech');NOW=962;U.note=4;render();},
  d5:()=>{reset();setRole('foreman');U.who='MR';U.view='sheet';U.per='prev';fillNotes('MR','prev');S.sign.MRprev={tech:'Wed 10/21 15:41'};U.note=5;render();},
  d6:()=>{reset();setRole('foreman');U.who='MR';frozen(P1(),'e',520);finishDrag();U.note=6;render();},
  d7:()=>{reset();setRole('tech');U.view='week';U.note=7;render();const s=$('.tk-wk'),t=$('.tk-trend');if(s&&t&&s.scrollHeight>s.clientHeight){s.scrollTop=t.offsetTop-80;note();}},
  d8:()=>{reset();setRole('tech');U.view='sheet';U.per='prev';render();const b=$('.tk-bk.warn');openPop('notes',{},b);U.note=8;render();},
  try:()=>{reset();render();}
};""" + JS[j:]

CSS += r"""
/* ===== the ideas ===== */
/* 2 · 4 · shift end */
.tk-shend{position:absolute;top:-4px;bottom:-4px;width:0;border-left:1.5px dashed var(--tg-ink3);z-index:3;pointer-events:none;}
.tk-shend em{position:absolute;bottom:calc(100% + 3px);left:0;transform:translateX(-50%);font:600 9.5px/16px var(--tg-sans);font-style:normal;letter-spacing:.05em;color:var(--tg-ink3);white-space:nowrap;}
.tk-shend.late{border-left-color:var(--tg-bad);} .tk-shend.late em{color:var(--tg-bad);}
.tk-remind{position:absolute;right:24px;bottom:24px;z-index:36;width:424px;display:flex;gap:12px;padding:14px 16px 14px 14px;border-radius:14px;background:var(--tg-raised);box-shadow:0 18px 44px -14px rgba(0,0,0,.35),inset 0 0 0 1px var(--tg-hair);font-size:13px;color:var(--tg-ink);}
.tk-remind .i{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;flex:none;background:var(--tg-acct);color:var(--tg-acctx);}
.tk-remind b{display:block;font-size:14px;font-weight:600;line-height:20px;}
.tk-remind p{margin:2px 0 10px;color:var(--tg-ink2);line-height:18px;}
.tk-remind .r{display:flex;flex-wrap:wrap;gap:6px;}
.tk-remind.warn{box-shadow:0 18px 44px -14px rgba(0,0,0,.35),inset 0 0 0 1.5px var(--tg-bad);} .tk-remind.warn .i{background:var(--tg-bad-t);color:var(--tg-bad);} .tk-remind.warn b{color:var(--tg-bad);}
.tg-hf.bad,.tg-hf.bad b{color:var(--tg-bad);}
.tk-sr .nm small.bad{color:var(--tg-bad);font-weight:500;display:inline-flex;align-items:center;gap:4px;}
.tk-sum span.bad{background:var(--tg-bad-t);color:var(--tg-bad);} .tk-sum span.bad b{color:var(--tg-bad);}
/* 3 · automatic lunch */
.tk-lunch.auto{box-shadow:inset 0 0 0 1.5px var(--tg-warn);background:repeating-linear-gradient(135deg,transparent 0 5px,color-mix(in srgb,var(--tg-warn) 24%,transparent) 5px 6px);}
.tk-lunch.auto em{font:700 9px/1 var(--tg-sans);font-style:normal;letter-spacing:.06em;color:var(--tg-warn);background:var(--tg-raised);padding:2px 3px;border-radius:3px;}
.tk-wt .tk-lunch em{display:none;}
.tk-r.edge.auto .wh .l1{color:var(--tg-ink3);} .tk-r.edge.auto .wh .l1 b{font-weight:500;color:var(--tg-warn);} .tk-r.edge.auto .wh .l1 .tg-ic{color:var(--tg-warn);} .tk-r.edge.auto .du{color:var(--tg-ink3);}
.tk-fix.auto > .tg-ic{color:var(--tg-warn);}
/* 5 · 8 · sign-off */
.tk-sgn{max-width:860px;margin:0 auto 14px;padding:12px 14px;border-radius:14px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.tk-sgn-due{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:7px 8px 7px 11px;border-radius:10px;background:var(--tg-warn-t);font-size:12.5px;color:var(--tg-ink);}
.tk-sgn-due > .tg-ic{color:var(--tg-warn);flex:none;} .tk-sgn-due span{flex:1;} .tk-sgn-due b{font-weight:600;}
.tk-sgr{display:flex;align-items:center;gap:10px;}
.tk-sgr .sp{flex:1;}
.tk-stp{display:flex;align-items:center;gap:9px;min-width:0;}
.tk-stp .dot{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;flex:none;font:600 11.5px/1 var(--tg-sans);background:var(--tg-fill);color:var(--tg-ink3);}
.tk-stp b{display:block;font-size:13px;font-weight:600;line-height:17px;color:var(--tg-ink3);white-space:nowrap;}
.tk-stp small{display:block;font-size:11.5px;line-height:15px;color:var(--tg-ink3);white-space:nowrap;}
.tk-stp.now .dot{background:var(--tg-primary);color:var(--tg-onprimary);} .tk-stp.now b{color:var(--tg-ink);}
.tk-stp.done .dot{background:var(--tg-good-t);color:var(--tg-good);} .tk-stp.done b{color:var(--tg-ink);}
.tk-stp.lk .dot{background:var(--tg-ink);color:var(--tg-panel);}
.tk-sl{flex:1;min-width:14px;max-width:48px;height:2px;border-radius:1px;background:var(--tg-hair);} .tk-sl.done{background:var(--tg-good);}
.tk-sgn-n{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--tg-ink3);white-space:nowrap;}
.tk-blk{display:flex;align-items:center;flex-wrap:wrap;gap:6px 8px;margin-top:12px;padding-top:11px;box-shadow:inset 0 1px 0 var(--tg-hair);font-size:12.5px;color:var(--tg-ink2);}
.tk-blk .t{font-weight:600;color:var(--tg-ink);margin-right:4px;}
.tk-bk{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px;border-radius:8px;font-size:12.5px;font-weight:500;}
.tk-bk.bad{background:var(--tg-bad-t);color:var(--tg-bad);} .tk-bk.warn{background:var(--tg-warn-t);color:var(--tg-warn);}
.tk-bk:hover{box-shadow:inset 0 0 0 1px currentColor;} .tk-bk:focus-visible{outline:2px solid var(--tg-acc);outline-offset:2px;}
.tk-sig div{position:relative;}
.tk-sig i{position:absolute;left:0;bottom:calc(100% + 5px);font:italic 500 16px/1.1 var(--tg-serif);color:#1d1c1a;white-space:nowrap;}
.tk-sig i small{margin-left:8px;font:400 10.5px/1 var(--tg-sans);font-style:normal;color:#67625a;}
.tk-stamp{display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:2px 7px;border:1.5px solid #2c7350;border-radius:4px;color:#2c7350;font:600 10px/14px var(--tg-sans);letter-spacing:.05em;text-transform:uppercase;}
.tk-pill.lock{background:var(--tg-fill);color:var(--tg-ink2);}
.tk-lk{display:inline-flex;color:var(--tg-ink3);}
.tk-day.locked .tk-b .h,.tk-day.locked .tk-r .ac,.tk-day.locked .tk-fix .btn,.tk-day.locked .tk-snap{display:none !important;}
.tk-pop-n{width:430px;}
.tk-nl{max-height:330px;overflow:auto;}
.tk-nr{display:block;padding:9px 0;box-shadow:inset 0 -1px 0 var(--tg-hair);cursor:text;}
.tk-nr:last-child{box-shadow:none;}
.tk-nr .m{display:flex;align-items:baseline;gap:8px;font-size:12.5px;margin-bottom:6px;min-width:0;}
.tk-nr .m .d{font-weight:600;flex:none;} .tk-nr .m .no{font:500 12px/1 var(--tg-mono);flex:none;} .tk-nr .m .cm{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tg-ink2);min-width:0;} .tk-nr .m small{margin-left:auto;font:500 11.5px/1 var(--tg-mono);color:var(--tg-ink3);flex:none;}
.tk-nr input{width:100%;}
/* 6 · the reason */
.tk-why{margin-bottom:4px;}
.tk-ed{flex:none;}
.tk-ed.by{gap:4px;background:var(--tg-acct);color:var(--tg-acctx);}
/* 7 · the trend */
.tk-trend{margin:16px 28px 0;padding:14px 18px 10px;border-radius:16px;background:var(--tg-raised);box-shadow:inset 0 0 0 1px var(--tg-hair);}
.tk-trh{display:flex;align-items:baseline;gap:10px;margin-bottom:6px;} .tk-trh b{font-size:13px;font-weight:600;} .tk-trh small{font-size:12px;color:var(--tg-ink3);} .tk-trh .sp{flex:1;} .tk-trh .tg-seg3{align-self:center;}
.tk-trb{display:flex;align-items:center;gap:28px;min-height:150px;}
.tk-trs{flex:none;width:160px;}
.tk-trs b{display:block;margin:2px 0 4px;font:500 30px/34px var(--tg-mono);letter-spacing:-.02em;color:var(--tg-ink);}
.tk-trs small{display:block;font-size:12px;line-height:18px;color:var(--tg-ink3);}
.tk-trs .up{color:var(--tg-good);font-weight:600;} .tk-trs .dn{color:var(--tg-bad);font-weight:600;}
.tk-trend svg{display:block;overflow:visible;}
.tk-trend .gl{stroke:var(--tg-hair);stroke-width:1;}
.tk-trend .ref{stroke:var(--tg-ink3);stroke-width:1.25;stroke-dasharray:4 4;}
.tk-trend .ax{font:500 10.5px var(--tg-mono);fill:var(--tg-ink4);}
.tk-trend .rl{font:600 10.5px var(--tg-sans);fill:var(--tg-ink3);}
.tk-trend .tln{fill:none;stroke:var(--tk-job);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;}
.tk-trend .tln.so{stroke-dasharray:2 4;}
.tk-trend .pt{fill:var(--tk-job);stroke:var(--tg-raised);stroke-width:2;}
.tk-trend .pt.cur{fill:var(--tg-raised);stroke:var(--tk-job);stroke-width:2;}
.tk-trend .vl{font:600 12.5px var(--tg-mono);fill:var(--tg-ink);}
.tk-trend .hit{fill:transparent;} .tk-trend .hit:hover{fill:color-mix(in srgb,var(--tg-ink) 6%,transparent);}
.tk-trt{width:100%;max-width:660px;border-collapse:collapse;font-size:12.5px;}
.tk-trt th{font-size:11.5px;font-weight:500;color:var(--tg-ink3);text-align:right;padding:3px 10px;box-shadow:inset 0 -1px 0 var(--tg-hair);} .tk-trt th:first-child,.tk-trt td:first-child{text-align:left;font-family:var(--tg-sans);}
.tk-trt td{padding:2px 10px;text-align:right;font:500 12px/16px var(--tg-mono);box-shadow:inset 0 -1px 0 var(--tg-hair);}
"""

used = set(re.findall(r"ic\('([A-Za-z]+)'", JS)) | {"inbox", "console", "triage", "ros", "foreman", "warranty", "manager", "parts", "timelog", "fixes", "career", "sidebar", "search", "gear", "clock", "exit", "coffee", "users", "calendar", "sheet", "lock", "check"}
miss = [k for k in used if k not in IC]
assert not miss, miss
for k, v in {"__ICO__": {k: IC[k] for k in sorted(used)}, "__LOGO__": P.LOGO}.items():
    JS = JS.replace(k, json.dumps(v))
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("d1", "1 · Drag an edge"), ("d2", "2 · Shift-end reminder"), ("d3", "3 · Auto lunch"), ("d4", "4 · Past your shift"), ("d5", "5 · Sign-off"), ("d6", "6 · Reason to edit"), ("d7", "7 · Efficiency trend"), ("d8", "8 · Notes first"), ("try", "Try it")])
about = [
 ("1 · Drag an edge", "Grab either end of a punch; it clicks to the next job and stops at the clock."),
 ("2 · Shift-end reminder", "Still on the clock when your shift ends: clock out, or ask again in 30 min."),
 ("3 · Auto lunch", "No lunch clock-out by 6 hours in: 30 min come off where no job ran, marked AUTO."),
 ("4 · Past your shift", "At 30 min over, the reminder turns red and the foreman sees it."),
 ("5 · Sign-off", "Tech signs, foreman approves, the period locks."),
 ("6 · Reason to edit", "Changing someone else’s time asks why; they see the reason."),
 ("7 · Efficiency trend", "Eight weeks on the Week view, with a table."),
 ("8 · Notes first", "Punches without a work note block signing; add them in place."),
]
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Time Log ideas</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,500&display=swap">
<style>{tok}
{bun}
{tg}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Time Log — the ideas, all together</h1><div class="wt-ideas wt-demo">{demos}</div>
<span class="wt-role">View as<span class="px-seg"><button class="is-on" data-role="tech">Technician</button><button data-role="foreman">Foreman</button></span></span>
<button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about"><h2>Time Log ideas<small>Each button opens the moment that idea shows. Try it lets you click around. Nothing here is saved.</small></h2><ul>{"".join(f"<li><b>{a}</b>{b}</li>" for a, b in about)}</ul></div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w", encoding="utf-8").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
