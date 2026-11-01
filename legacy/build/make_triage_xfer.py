# Triage — Transfers and release: release with checks, transfer with a reason, Held too long at twice the goal.
# Builds on make_triage_contact.py → make_triage_needs.py → make_triage_inbox.py → make_triage.py.
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
src = open(f"{B}/make_triage_contact.py").read().split("\nrep = {")[0]
argv = sys.argv; sys.argv = [argv[0], "/dev/null"]
ns = {"__file__": f"{B}/make_triage_contact.py", "__name__": "tcc"}
exec(src, ns)
sys.argv = argv
P, tok, bun, DATA, ICO, SI = ns["P"], ns["tok"], ns["bun"], ns["DATA"], ns["ICO"], ns["SI"]
BASE = ns["JS"].rstrip()
assert BASE.endswith("render();"); BASE = BASE[: -len("render();")]

def sub(s, a, b, count=None):
    assert a in s, a[:80]
    return s.replace(a, b) if count is None else s.replace(a, b, count)
# thread: transfer history instead of the single "With …" line
BASE = sub(BASE, '<div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">With <b style="color:var(--ink)">${esc(r.hold[1])}</b> · ${ROLE[r.hold[0]][1]}<time>${r.hold[2]<1?Math.round(r.hold[2]*60)+\'m\':r.hold[2]+\'h\'}</time></div></div></div>', '${xferRows(r)}')
# Desk: why / back-by under Who has it, Release on Ready to close, Transfer button wired
BASE = sub(BASE, '<div style="margin-top:12px">${held(r)}</div>', '<div style="margin-top:12px">${held(r)}</div>${xferDesk(r)}')
BASE = sub(BASE, 'Ready to close<small>${done} of 5</small></div>', 'Ready to close<small>${done} of 5</small>${r.cat===\'rdy\'?`<button class="px-btn px-btn--sm px-btn--primary" data-act="${r.no}" style="margin-left:10px">${I.release}Release…</button>`:\'\'}</div>')
BASE = sub(BASE, '<button class="px-btn px-btn--sm px-btn--primary">Transfer…</button>', '<button class="px-btn px-btn--sm px-btn--primary" data-pop="xfer" data-no="${r.no}">Transfer…</button>')

CSS = ns["CSS"] + r'''
/* ---------- release with checks ---------- */
.nx-pop.rl{width:392px}
.rl-sum{display:flex;align-items:center;gap:10px;margin:2px 0 6px;font-size:13px}
.rl-sum b{font-weight:600}
.rl-sum small{margin-left:auto;font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.rl-sum.bad small{color:var(--warn);font-weight:500}
.rl-cks{display:flex;flex-direction:column;border-radius:12px;box-shadow:inset 0 0 0 1px var(--hairline);padding:4px 12px;margin-bottom:10px}
.rl-ck{display:flex;align-items:center;gap:10px;min-height:32px;font-size:13px}
.rl-ck + .rl-ck,.rl-fix + .rl-ck{box-shadow:inset 0 1px 0 var(--hairline)}
.rl-ck i{width:16px;height:16px;border-radius:50%;flex:none;display:grid;place-items:center;box-shadow:inset 0 0 0 1.5px var(--border-strong)}
.rl-ck.ok i{background:var(--status-working);box-shadow:none}
.rl-ck.ok i::after{content:"";width:7px;height:3.5px;border:solid var(--panel);border-width:0 0 1.6px 1.6px;transform:translateY(-1px) rotate(-45deg)}
.rl-ck.no i{box-shadow:inset 0 0 0 1.5px var(--warn)}
.rl-ck.no i::after{content:"";width:6px;height:1.6px;border-radius:1px;background:var(--warn)}
.rl-ck span{flex:none}
.rl-ck small{margin-left:auto;font-size:12px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.rl-ck.no small{color:var(--warn)}
.rl-ck .px-link{flex:none;font-size:12px}
.rl-fix{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:4px 0 10px 26px}
.rl-fix .px-input{flex:1;height:30px;font-size:13px;min-width:120px}
.rl-fix .lb{font-size:12px;color:var(--ink-3)}
.rl-line{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink-2);margin:8px 0 2px;flex-wrap:wrap}
.rl-line .px-ico{width:13px;height:13px;color:var(--ink-3)}
.rl-line{column-gap:14px}
.rl-line .it{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.rl-opt{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-2);margin:6px 0 0;cursor:pointer}
.rl-opt input{accent-color:var(--ink);width:15px;height:15px;margin:0}
.rl-any{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--warn-tint);display:flex;flex-direction:column;gap:8px}
.rl-any .lbl{font-size:12px;font-weight:500;color:var(--warn)}
.rl-any .px-input{height:30px;font-size:13px}
.rl-any .tg-chip{background:var(--raised)}
.rl-any .tg-chip.on{background:var(--raised)}
.nx-pop .acts{margin:12px 0 0;align-items:center}
.nx-pop .acts .hint{margin-right:auto;font-size:11.5px;color:var(--ink-3)}
.nx-pop .lbl.top{display:block;font-size:12px;color:var(--ink-3);margin:2px 0 6px}
/* ---------- transfer with a reason ---------- */
.nx-pop.xf{width:420px}
.nx-pop.xf .tg-chip .px-kbd{min-width:14px;height:15px;padding:0 3px;font-size:10px;margin-left:-4px;background:transparent;box-shadow:inset 0 0 0 1px var(--border)}
.xf-desks{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.xf-d{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:8px;align-items:center;padding:7px 9px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--border);font-size:12.5px;min-width:0;position:relative}
.xf-d .tg-role{grid-row:1 / span 2}
.xf-d b{font-weight:500;white-space:nowrap}
.xf-d small{font-size:11px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.xf-d .px-kbd{position:absolute;top:6px;right:6px;min-width:14px;height:14px;font-size:9.5px;padding:0 3px;background:transparent}
.xf-d.on{background:var(--fill);box-shadow:inset 0 0 0 1.5px var(--ink)}
.xf-d.cur{opacity:.5;cursor:default}
.xf-goal{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-3);margin-top:2px}
.xf-goal .px-ico{width:12px;height:12px}
.nx-pop .lf-r + .lbl.top,.nx-pop .px-input + .lbl.top{margin-top:10px}
.xf-note{width:100%;box-sizing:border-box;height:32px;font-size:13px}
/* thread + desk */
.xf-why{color:var(--ink);font-weight:500}
.i3-m .xf-n{margin:0;padding:0;background:none;box-shadow:none;font-size:12.5px;color:var(--ink-2);line-height:18px}
.xf-back{font-size:12px;color:var(--ink-3)}
.xf-back.late{color:var(--warn);font-weight:500}
.xf-desk{margin-top:12px;padding-top:10px;box-shadow:inset 0 1px 0 var(--hairline);display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--ink-2)}
.xf-desk .r{display:flex;gap:8px;align-items:baseline}
.xf-desk{font-size:13px}
.xf-desk .r{gap:10px}
.xf-desk .r span:first-child{width:96px;flex:none;color:var(--ink-3)}
.xf-desk .late{color:var(--warn);font-weight:500}
.xf-hist{font-size:11.5px;color:var(--ink-3)}
'''

JS = BASE + r'''
/* =================== transfers and release layer =================== */
const XF0={'37011':[{at:'5:00',from:'Pat Sutton · Technician',to:'foreman',who:'Ray Owens',why:'Comeback',note:'Coolant loss again after the head gasket — needs a second look before we pull it apart.',back:7}],
 '34601':[{at:'Tue 14:20',from:'Mike Rodriguez · Technician',to:'parts',who:'Parts desk',why:'Parts to order',note:'DPF on backorder from the DC.',back:null}],
 '36988':[{at:'Wed 8:10',from:'Pat Sutton · Technician',to:'warranty',who:'Kim Lee',why:'Tech support case',note:'Case 4-118 open with Volvo.',back:32}],
 '37590':[{at:'Wed 8:05',from:'Luis Martinez · Technician',to:'writer',who:'Dana Kowalski',why:'Estimate ready',note:'',back:null}],
 '37555':[{at:'7:15',from:'Dana Kowalski · Approval',to:'foreman',who:'Ray Owens',why:'Needs a tech',note:'PM-A, driver waiting.',back:8.25}],
 '37538':[{at:'9:35',from:'Mike Rodriguez · Technician',to:'writer',who:'Dana Kowalski',why:'Needs customer approval',note:'Wheel seal found during the clutch job.',back:null}]};
let XF=JSON.parse(JSON.stringify(XF0)), RLS=null, XS=null;
const WHY={writer:['Needs customer approval','Estimate ready','Customer question'],tech:['Ready to work','Parts arrived','Approved — go ahead'],parts:['Parts to order','Wrong part','Core return'],foreman:['Second opinion','Comeback','Needs a tech'],warranty:['Claim to file','Tech support case','Policy question'],manager:['Over the goal','Customer complaint','Pricing call']};
const RSN=['Customer is at the counter','Paperwork to follow','Warranty claim pending','Manager OK’d it'];
const DESKS=['writer','tech','parts','foreman','warranty','manager'];
const dur=h=>h<1?Math.round(h*60)+'m':(h<10?h.toFixed(1):Math.round(h))+' h';
const lastX=r=>{const L=XF[r.no];return L&&L.length?L[L.length-1]:null;};
const atStr=a=>typeof a==='number'?fmt(a):a;
function tweak(){const r=get('34601');if(r)r.hold[2]=52;}
tweak();

/* Held too long = twice the desk's goal, or past the back-by time */
needs=(orig=>function(){const L=orig().filter(x=>x[5]!=='Held too long');ROS.forEach(r=>{if(r.cat==='arr'||L.some(x=>x[0]===r))return;const [role,who,h,g]=r.hold,lx=lastX(r),due=lx&&lx.back!=null&&lx.to===role&&NOW>lx.back+1e-6;
  if(h>=2*g||due)L.push([r,4,'swap',due?`Due back from ${who.split(' ')[0]} at ${fmt(lx.back)} · ${dur(NOW-lx.back)} late`:`With ${ROLE[role][1].toLowerCase()} ${dur(h)} · ${(h/g).toFixed(1)}× the ${g} h goal`,'Nudge','Held too long']);});return L.sort((a,b)=>a[1]-b[1]);})(needs);
tick=(orig=>function(h){ROS.forEach(r=>{r.hold[2]=+(r.hold[2]+h).toFixed(2);});orig(h);})(tick);

/* ---------- release with checks ---------- */
function relChecks(r){const [a,b,p,n,rt]=r.chk,hold=/^Waiting/.test(r.stn),dec=r.st==='declined';
  return [{k:'ops',ok:a===b,label:'All operations complete',detail:`${a} of ${b}`,fix:'Mark complete'},
   {k:'parts',ok:!!p,label:'Parts installed',detail:p?'all installed':'not all installed',fix:'Mark installed'},
   {k:'notes',ok:!!n,label:'Notes written',detail:n?(r.noteAdded?'note added '+r.noteAdded:'every punch has a note'):'1 punch with no note',fix:'Add note'},
   {k:'road',ok:!!rt,label:'Road test done',detail:rt?(r.road?`${r.road.res} · ${r.road.mi?r.road.mi+' mi · ':''}${r.road.at}`:dec?'not needed — declined':'Pass'):'not logged',fix:'Log road test'},
   {k:'hold',ok:!hold,label:'Nothing holding',detail:hold?r.stn.replace('Waiting – ','waiting on '):'clear',fix:null}];}
const newRLS=r=>{const L=pplOf(r);let i=L.findIndex(p=>p.r==='Driver');if(i<0)i=defTo(r);return {to:i,other:'',text:false,any:false,reason:'',note:'',fix:null,fixText:'',road:'Pass',mi:''};};
function relPop(r){const C=relChecks(r),bad=C.filter(c=>!c.ok),L=pplOf(r),A=RLS,p=A.to==='o'?{n:A.other||'someone else'}:L[A.to],C2=2*Math.PI*9,done=C.length-bad.length;
  const head=`<div class="nx-ph"><span class="k">Release</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>`;
  const fixF=c=>c.k==='notes'?`<div class="rl-fix"><input class="px-input" data-rl-fixtext placeholder="What was done on ${esc(r.tech)}’s 2.3 h punch" value="${esc(A.fixText)}"><button class="px-btn px-btn--sm px-btn--primary" data-rl-save="notes">Save note</button></div>`
    :c.k==='road'?`<div class="rl-fix"><span class="lb">Result</span><span class="tg-seg3"><button class="${A.road==='Pass'?'on ok':''}" data-rl-road="Pass">Pass</button><button class="${A.road==='Fail'?'on no':''}" data-rl-road="Fail">Fail</button></span><input class="px-input" data-rl-mi placeholder="Miles" style="max-width:80px;min-width:0" value="${esc(A.mi)}"><button class="px-btn px-btn--sm px-btn--primary" data-rl-save="road">Save</button></div>`
    :`<div class="rl-fix"><span class="lb">${c.k==='ops'?'Marks every operation complete on the RO.':'Marks every part on the RO installed.'}</span><button class="px-btn px-btn--sm px-btn--primary" data-rl-save="${c.k}">${c.fix}</button></div>`;
  const cks=`<div class="rl-cks">${C.map(c=>`<div class="rl-ck ${c.ok?'ok':'no'}"><i></i><span>${c.label}</span><small>${esc(c.detail)}</small>${!c.ok&&c.fix&&A.fix!==c.k?`<button class="px-link" data-rl-fix="${c.k}">${c.fix}</button>`:''}</div>${A.fix===c.k&&!c.ok?fixF(c):''}`).join('')}</div>`;
  const ppl=`<span class="lbl top">Picked up by</span><div class="lf-r">${L.map((q,i)=>`<button class="cx-chip${A.to===i?' on':''}" data-rl-to="${i}"><span class="px-av">${ini(q.n)}</span><b>${esc(q.n)}</b><small>${esc(q.r)}</small></button>`).join('')}<button class="tg-chip${A.to==='o'?' on':''}" data-rl-to="o">Someone else</button></div>${A.to==='o'?`<input class="px-input xf-note" style="margin-top:6px" data-rl-other placeholder="Name" value="${esc(A.other)}">`:''}`;
  const line=`<div class="rl-line"><span class="it">${I.keyTag}Key tag <span class="px-id">1${r.no.slice(-2)}</span> to ${esc(p.n.split(' ')[0])}</span><span class="it">${I.pin}${r.spot} frees up</span><span class="it">${I.check}Moves to Released today</span></div>`;
  const tx=pplOf(r).some(q=>q.pref==='Text')?`<label class="rl-opt"><input type="checkbox" data-rl-text${A.text?' checked':''}>Copy the “Ready for pickup” text for ${esc(p.n.split(' ')[0])} too</label>`:'';
  const any=bad.length&&A.any?`<div class="rl-any"><span class="lbl">Release with ${bad.length} check${bad.length>1?'s':''} open — why?</span><div class="lf-r">${RSN.map(x=>`<button class="tg-chip${A.reason===x?' on':''}" data-rl-reason="${x}">${x}</button>`).join('')}</div><input class="px-input" data-rl-note placeholder="Note (optional)" value="${esc(A.note)}"></div>`:'';
  const acts=!bad.length?`<div class="acts"><span class="hint">All 5 checks pass</span><button class="px-btn px-btn--sm" data-close>Cancel<span class="px-kbd">Esc</span></button><button class="px-btn px-btn--primary px-btn--sm" data-rl-go="ok">${I.release}Release<span class="px-kbd">↵</span></button></div>`
    :A.any?`<div class="acts"><button class="px-btn px-btn--sm px-btn--ghost" data-rl-back>Back</button><button class="px-btn px-btn--sm" data-rl-go="any"${A.reason?'':' disabled'}>Release anyway<span class="px-kbd">↵</span></button></div>`
    :`<div class="acts"><span class="hint">Fix ${bad.length} to unlock</span><button class="px-btn px-btn--sm" data-rl-any>Release anyway…</button><button class="px-btn px-btn--primary px-btn--sm" disabled>${I.release}Release</button></div>`;
  return `<div class="nx-pop px-pop rl">${head}<div class="rl-sum${bad.length?' bad':''}"><svg class="tg-ring${bad.length?'':' ok'}" width="22" height="22" viewBox="0 0 22 22"><circle class="t" cx="11" cy="11" r="9" style="stroke-width:3"/><circle class="p" cx="11" cy="11" r="9" style="stroke-width:3" stroke-dasharray="${(C2*done/5).toFixed(1)} ${C2.toFixed(1)}"/></svg><b>Ready to close</b><small>${done} of 5${bad.length?' · '+bad.length+' open':''}</small></div>${cks}${ppl}${line}${tx}${any}${acts}</div>`;}
function relFix(k){const r=get(POP.no);snap();
  if(k==='notes'){if(!RLS.fixText.trim()){toast('Write what was done first',false);render();return;}r.chk[3]=true;r.noteAdded=fmt(NOW);}
  if(k==='road'){if(RLS.road==='Fail'){RLS.fix=null;toast('Road test failed — back to the tech; release stays locked',false);r.road={res:'Fail',mi:RLS.mi,at:fmt(NOW)};render();return;}r.chk[4]=true;r.road={res:'Pass',mi:RLS.mi,at:fmt(NOW)};}
  if(k==='ops')r.chk[0]=r.chk[1];if(k==='parts')r.chk[2]=true;
  RLS.fix=null;RLS.fixText='';toast(`${{notes:'Note added',road:'Road test logged',ops:'Operations marked complete',parts:'Parts marked installed'}[k]}`,true);render();}
function doRelease2(no,any){const r=get(no),bad=relChecks(r).filter(c=>!c.ok),L=pplOf(r),p=RLS.to==='o'?{n:RLS.other.trim()||'Walk-in'}:L[RLS.to],key='1'+no.slice(-2);snap();
  if(RLS.text){const q=L[RLS.to]||L[0];copyText(fill(tplBody('rdy'),r,q));}
  ROS.splice(ROS.indexOf(r),1);D.rel.push({no:r.no,cust:r.cust,at:fmt(NOW)+(any?' · released anyway':` · to ${p.n.split(' ')[0]}`),spot:r.spot,by:'Dana Kowalski',to:p.n,key,ov:any?{open:bad.map(c=>c.label),reason:RLS.reason,note:RLS.note}:null});
  delete BACK[no];CLR.push({at:NOW,ic:any?'flag':'release',what:any?'Released anyway':'Released',no:r.no,cust:r.cust});
  toast(any?`Released anyway — ${bad.map(c=>c.label.toLowerCase()).join(', ')} still open · “${RLS.reason}”`:`Released to ${p.n} · key tag ${key} · ${r.spot} is free${RLS.text?' · ready text copied':''}`);}

/* ---------- transfer with a reason ---------- */
const newXS=r=>({to:null,why:null,note:'',back:undefined});
const backOpts=g=>[[`Goal · ${g} h`,r5(NOW+g)],['In 1 h',r5(NOW+1)],['End of day',Math.max(16.5,r5(NOW+.5))],['Tomorrow',32],['No time',null]];
function xferPop(r){const A=XS,cur=r.hold[0],g=A.to?GOAL[A.to]:null;
  const head=`<div class="nx-ph"><span class="k">Transfer</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>`;
  const desks=`<span class="lbl top">To</span><div class="xf-desks">${DESKS.map((k,i)=>`<button class="xf-d${A.to===k?' on':''}${cur===k?' cur':''}" data-xf-to="${k}"${cur===k?' disabled':''}><span class="tg-role">${ROLE[k][0]}</span><b>${ROLE[k][1]}</b><small>${cur===k?'has it now':k==='tech'?(TECH[r.tech]||'—'):HOLDER[k]}</small>${A.to?'':`<span class="px-kbd">${i+1}</span>`}</button>`).join('')}</div>`;
  if(!A.to)return `<div class="nx-pop px-pop xf">${head}${desks}<div class="xf-goal">${I.clock}With ${esc(r.hold[1])} for ${dur(r.hold[2])} — pick a desk (1–6)</div></div>`;
  if(A.back===undefined)A.back=r5(NOW+g);
  const why=`<span class="lbl top">Why</span><div class="lf-r">${WHY[A.to].map((x,i)=>`<button class="tg-chip${A.why===x?' on':''}" data-xf-why="${x}"><span class="px-kbd">${i+1}</span>${x}</button>`).join('')}</div><input class="px-input xf-note" style="margin-top:6px" data-xf-note placeholder="Note for ${esc((A.to==='tech'?(TECH[r.tech]||'the tech'):HOLDER[A.to]).split(' ')[0])} (optional)" value="${esc(A.note)}">`;
  const back=`<span class="lbl top">Back by</span><div class="lf-r lf-when">${backOpts(g).map(([l,h])=>`<button class="tg-chip${A.back===h?' on':''}" data-xf-back="${h===null?'none':h}">${h===null?l:`${fmt(h)} <small>${l}</small>`}</button>`).join('')}</div>`;
  const goal=`<div class="xf-goal" style="margin-top:8px">${I.clock}Goal ${g} h · Held too long after ${2*g} h${A.back!=null?' or at '+fmt(A.back):''}</div>`;
  const who=A.to==='tech'?(TECH[r.tech]||'Mike Rodriguez'):HOLDER[A.to];
  return `<div class="nx-pop px-pop xf">${head}${desks}${why}${back}${goal}<div class="acts"><span class="hint">1–3 why · ⌫ desk · clock restarts</span><button class="px-btn px-btn--primary px-btn--sm" data-xf-go${A.why?'':' disabled'}>${I.swap}Transfer to ${esc(who.split(' ')[0])}<span class="px-kbd">↵</span></button></div></div>`;}
function doXfer2(no){const r=get(no),A=XS,was=!!itemOf(no),who=A.to==='tech'?(TECH[r.tech]||'Mike Rodriguez'):HOLDER[A.to];snap();
  (XF[no]=XF[no]||[]).push({at:NOW,from:`${r.hold[1]} · ${ROLE[r.hold[0]][1]}`,to:A.to,who,why:A.why,note:A.note.trim(),back:A.back});
  r.hold=[A.to,who,0,GOAL[A.to]];delete BACK[no];if(was&&!itemOf(no))CLR.push({at:NOW,ic:'swap',what:`To ${ROLE[A.to][1]}`,no,cust:r.cust});
  toast(`Transferred to ${who} · ${A.why}${A.back!=null?' · back by '+fmt(A.back):''}`);}

/* ---------- thread + desk ---------- */
function xferRows(r){const L=XF[r.no]||[],cur=lastX(r);
  const rows=L.map((x,i)=>{const live=i===L.length-1&&x.to===r.hold[0],late=live&&x.back!=null&&NOW>x.back;return `<div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">To <b style="color:var(--ink)">${esc(x.who)}</b> · ${ROLE[x.to][1]} — <span class="xf-why">${esc(x.why)}</span><time>${esc(atStr(x.at))}</time></div>${x.note?`<p class="xf-n">${esc(x.note)}</p>`:''}<div class="xf-back${late?' late':''}">From ${esc(x.from)}${x.back!=null?` · back by ${fmt(x.back)}${late?' · '+dur(NOW-x.back)+' late':''}`:''}</div></div></div>`;}).join('');
  const [role,who,h,g]=r.hold;return rows+(cur&&cur.to===role?'':`<div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">With <b style="color:var(--ink)">${esc(who)}</b> · ${ROLE[role][1]}<time>${dur(h)}</time></div></div></div>`);}
function xferDesk(r){const x=lastX(r);if(!x||x.to!==r.hold[0])return `<div class="xf-desk"><div class="r"><span>Why</span><span style="color:var(--ink-3)">No reason recorded</span></div></div>`;const late=x.back!=null&&NOW>x.back,L=XF[r.no];
  return `<div class="xf-desk"><div class="r"><span>Why</span><b style="font-weight:500;color:var(--ink)">${esc(x.why)}</b></div>${x.note?`<div class="r"><span>Note</span><span>${esc(x.note)}</span></div>`:''}<div class="r"><span>Back by</span><span class="${late?'late':''}">${x.back==null?'no time set':fmt(x.back)+(late?' · '+dur(NOW-x.back)+' late':'')}</span></div><div class="r"><span>From</span><span>${esc(x.from)} · ${esc(atStr(x.at))}</span></div>${L.length>1?`<div class="xf-hist">${L.length} transfers on this RO</div>`:''}</div>`;}

/* ---------- wiring ---------- */
openPop=(orig=>function(t,no){if(t==='release')RLS=newRLS(get(no));if(t==='xfer')XS=newXS(get(no));orig(t,no);})(openPop);
popHtml=(orig=>function(){if(POP&&POP.type==='release'){const r=get(POP.no);return r?relPop(r):'';}if(POP&&POP.type==='xfer'){const r=get(POP.no);return r?xferPop(r):'';}return orig();})(popHtml);
snap=function(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL,APR,XF}));if(UNDO.length>30)UNDO.shift();};
undo=function(){if(!UNDO.length)return;const s=JSON.parse(UNDO.pop());ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ=s.SNZ;BACK=s.BACK;CLR=s.CLR;SEL=s.SEL;APR=s.APR||APR;XF=s.XF||XF;POP=null;toast('Undone',false);render();};
reset=(orig=>function(){XF=JSON.parse(JSON.stringify(XF0));RLS=null;XS=null;orig();tweak();DEMO='';render();})(reset);
$('[data-reset]').onclick=()=>reset();
demo=function(k){reset();DEMO=k;KB=false;
  if(k==='rlb'){TAB='inbox';SEL='37301';openPop('release','37301');}
  if(k==='rlok'){TAB='inbox';SEL='37489';openPop('release','37489');RLS.text=true;}
  if(k==='xf'){TAB='inbox';SEL='37538';openPop('xfer','37538');XS.to='foreman';XS.why='Second opinion';XS.note='Wheel seal looks like it’s weeping from the hub — want your eyes on it.';}
  if(k==='held'){TAB='desk';SEL='37011';}
  DEMO=k;render();};
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));

mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  if(!q('.nx-pop')||!POP)return;
  if(POP.type==='release'){const A=RLS;
    const f=q('[data-rl-fix]');if(f){A.fix=f.dataset.rlFix;A.fixText='';render();const i=$('.nx-pop [data-rl-fixtext]');if(i)i.focus();return stop();}
    const sv=q('[data-rl-save]');if(sv){relFix(sv.dataset.rlSave);return stop();}
    const rd=q('[data-rl-road]');if(rd){A.road=rd.dataset.rlRoad;render();return stop();}
    const to=q('[data-rl-to]');if(to){A.to=to.dataset.rlTo==='o'?'o':+to.dataset.rlTo;render();if(A.to==='o'){const i=$('[data-rl-other]');if(i)i.focus();}return stop();}
    if(q('[data-rl-any]')){A.any=true;render();return stop();}
    if(q('[data-rl-back]')){A.any=false;A.reason='';render();return stop();}
    const rs=q('[data-rl-reason]');if(rs){A.reason=rs.dataset.rlReason;render();return stop();}
    const go=q('[data-rl-go]');if(go){const no=POP.no,any=go.dataset.rlGo==='any';run(no,()=>doRelease2(no,any));return stop();}
    if(q('label.rl-opt'))e.stopPropagation();return;}
  if(POP.type==='xfer'){const A=XS;
    const d=q('[data-xf-to]');if(d){if(d.disabled)return stop();A.to=d.dataset.xfTo;A.why=null;A.back=undefined;render();return stop();}
    const w=q('[data-xf-why]');if(w){A.why=w.dataset.xfWhy;render();return stop();}
    const b=q('[data-xf-back]');if(b){A.back=b.dataset.xfBack==='none'?null:+b.dataset.xfBack;render();return stop();}
    if(q('[data-xf-go]')){if(!A.why)return stop();const no=POP.no;run(no,()=>doXfer2(no));return stop();}
    return;}
},true);
mock.addEventListener('change',e=>{if(RLS&&e.target.matches('[data-rl-text]')){RLS.text=e.target.checked;render();}});
mock.addEventListener('input',e=>{const t=e.target;if(RLS){if(t.matches('[data-rl-fixtext]'))RLS.fixText=t.value;if(t.matches('[data-rl-mi]'))RLS.mi=t.value;if(t.matches('[data-rl-other]'))RLS.other=t.value;if(t.matches('[data-rl-note]'))RLS.note=t.value;}if(XS&&t.matches('[data-xf-note]'))XS.note=t.value;});
addEventListener('keydown',e=>{if(!POP||(POP.type!=='release'&&POP.type!=='xfer'))return;const k=e.key,inF=e.target.matches('input,textarea');
  if(k==='Escape'){if(POP.type==='release'&&RLS.fix){RLS.fix=null;render();}else{POP=null;render();}e.stopPropagation();return;}
  if(POP.type==='release'){const r=get(POP.no),bad=relChecks(r).filter(c=>!c.ok);
    if(k==='Enter'){e.preventDefault();if(RLS.fix)relFix(RLS.fix);else if(!bad.length){const no=POP.no;run(no,()=>doRelease2(no,false));}else if(RLS.any&&RLS.reason){const no=POP.no;run(no,()=>doRelease2(no,true));}e.stopPropagation();return;}
    e.stopPropagation();return;}
  if(POP.type==='xfer'){if(k==='Enter'){e.preventDefault();if(XS.to&&XS.why){const no=POP.no;run(no,()=>doXfer2(no));}e.stopPropagation();return;}
    if(!inF){const n=+k;if(!XS.to&&n>=1&&n<=6){const d=DESKS[n-1];if(d!==get(POP.no).hold[0]){XS.to=d;XS.why=null;XS.back=undefined;render();}}else if(XS.to&&n>=1&&n<=WHY[XS.to].length){XS.why=WHY[XS.to][n-1];render();}else if(XS.to&&k==='Backspace'){XS.to=null;XS.why=null;render();}}
    e.stopPropagation();return;}
},true);
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
NOTES = [
 ("1 · Release with checks", "Release unlocks when all 5 Ready-to-close checks pass. Fix links close the gap right there: add the missing note, log the road test, mark parts installed. Release anyway… needs a reason, and the reason is saved on the release."),
 ("What a release records", "Who picked it up, the key tag handed over, the spot that frees up, and any checks that were still open. The RO moves to Released today and Cleared today."),
 ("2 · Transfer with a reason", "Pick the desk (1–6), the reason (the choices change with the desk), an optional note, and when it’s due back — it starts at the desk’s goal. Every transfer shows in the thread and under Who has it on the Desk."),
 ("Held too long", "Now means held twice the desk’s goal, or past its back-by time. Over the goal but under twice only shows on the time-held bar. Try the shop clock: Haw River Dairy and others come back as their back-by passes."),
 ("In Parsec", "Uses the same Ready to close checks the app already has (tyCloseChecks). Each transfer saves from, to, why, note and back-by; each release saves who, key tag, spot and any override."),
]
about = '<h2>Transfers and release<small>Use the four buttons above the frame to jump to each one. Everything from the last two steps still works.</small></h2><ul>' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in NOTES) + "</ul>"
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("rlb", "1 · Release, check open"), ("rlok", "1 · Release, all pass"), ("xf", "2 · Transfer"), ("held", "2 · Held too long")])
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage transfers and release</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — Transfers and release</h1><div class="wt-ideas wt-demo">{demos}</div>
<div class="wt-clock">Shop clock <b data-clock>10:15</b><button class="px-btn px-btn--sm" data-tt="1">+1 h</button><button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button></div><button data-caught hidden></button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about">{about}</div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
