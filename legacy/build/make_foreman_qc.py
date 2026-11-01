# Foreman — QC & handoff on top of everything before: QC before release, the Foreman badge, tomorrow's board + handoff note.
import os, sys, re
B = os.path.dirname(os.path.abspath(__file__))
DS = os.path.join(B, "make_foreman_decide.py")
SRC = os.path.join(B, "make_foreman.py")
t = open(DS).read()
lib = t.split('\nexec(compile(src, SRC, "exec"), {"__name__": "__main__"')[0]
ns = {"__file__": DS, "__name__": "decide_lib"}
exec(compile(lib, DS, "exec"), ns)
src = ns["src"]

def rep(a, b, n=1):
    global src
    c = src.count(a)
    assert c == n, (a[:80], c)
    src = src.replace(a, b)

# ---------- data: two trucks road-tested and waiting for QC ----------
rep("st:'hold',spot:'B9',tech:'AW',q:2.5,b:2.3,done:9.33}", "st:'roadtest',spot:'B9',tech:'AW',q:2.5,b:2.3,done:9.33,rtPass:{at:9.75,by:'AW',mi:6},pu:[6,6,0],ops2:[{t:'PM service A',q:1.5,b:1.4,st:'done'},{t:'DOT inspection',q:1.0,b:0.9,st:'done'}]}")
rep("st:'hold',spot:'B8',tech:'KT',done:9.83", "st:'roadtest',rtPass:{at:10.08,by:'KT',mi:4},pu:[1,2,1],ops2:[{t:'ABS light — replace wheel speed sensor',q:1.5,b:1.4,st:'done',story:false}],spot:'B8',tech:'KT',done:9.83")
# views + keys
rep("const vs=[['floor','grid','Floor'],['techs','user','Techs'],['yard','pin','Yard']];", "const vs=[['floor','grid','Floor'],['techs','user','Techs'],['yard','pin','Yard'],['tmr','clock','Tomorrow']];")
rep("const body=v==='techs'?vTechs(r):v==='yard'?vYard(r):vFloor(r);", "const body=v==='techs'?vTechs(r):v==='yard'?vYard(r):v==='tmr'?vTmr(r):vFloor(r);")
rep("if(k==='1'||k==='2'||k==='3'){U.view=['floor','techs','yard'][+k-1];render();return stop();}", "if(k==='1'||k==='2'||k==='3'||k==='4'){U.view=['floor','techs','yard','tmr'][+k-1];render();return stop();}")
rep("${k==='triage'?'<span class=\"rl-badge\">2</span>':''}</a>", "${k==='triage'?'<span class=\"rl-badge\">2</span>':k==='foreman'?navBadge():''}</a>")
rep("<a class=\"${k==='foreman'?'is-on':''}\">", "<a class=\"${k==='foreman'?'is-on':''}\"${k==='foreman'?' data-a=\"nbf\" title=\"Foreman\"':''}>")
rep("Logged on the RO · then it shows on Triage under Ready to go", "Logged on the RO · then it comes to you for QC")
rep("""[data-a="plan"]'))""", """[data-a="plan"],[data-a="nbf"]'))""")

QJS = r"""
/* ---------- v6: QC before release · the Foreman badge · tomorrow's board ---------- */
GROUPS.splice(GROUPS.findIndex(g=>g[0]==='road')+1,0,['qc','QC before release']);
/* 1 · QC */
function qcAuto(r){ const O=r.ops2||[{t:r.cmp,q:r.q,b:r.b,st:'done'}], ns=O.findIndex(o=>o.story===false);
  return [{ok:O.every(o=>o.st==='done'||o.st==='rec'),t:`All ops closed · ${O.filter(o=>o.st==='done').length} of ${O.length}`},
    {ok:ns<0,t:ns<0?'Story written on every op':`No story on op ${ns+1} · ${O[ns].t}`},
    {ok:!r.q||r.b<=r.q*1.1,t:`${r.b.toFixed(1)} of ${r.q.toFixed(1)} h quoted`},
    {ok:!!r.rtPass,t:r.rtPass?`Road test passed · ${TF(r.rtPass.by)} · ${r.rtPass.mi} mi · ${hm(r.rtPass.at)}`:'No road test result yet'},
    {ok:!r.pu||!r.pu[2],t:r.pu?`Parts · ${r.pu[0]} of ${r.pu[1]} used${r.pu[2]?' · '+r.pu[2]+' to return to Parts':' · nothing to return'}`:'No parts on the RO'}]; }
const QCM=['Walk-around — tools out, covers on, no leaks','Cab clean · keys and paperwork with the truck'];
const QWHY=['Story missing','Parts to return','Recheck the repair','Clean up'];
needsAll=(orig=>function(){ const L=orig(), have=new Set(L.map(x=>x.ro.no));
  S.R.forEach(r=>{ if(r.st!=='roadtest'||r.qcOk||have.has(r.no)) return; const bad=qcAuto(r).filter(c=>!c.ok).length;
    L.push({g:'qc',ic:'check',ro:r,btn:'QC',act:'qc',late:false,why:`${r.rtPass?'Road test passed '+hm(r.rtPass.at):'Road tested'} · ${TF(r.tech)} · ${bad?bad+' thing'+(bad>1?'s':'')+' to check':'all checks pass'}`}); });
  return L; })(needsAll);
function qcP(p,r){ const A=qcAuto(r), bad=A.filter(c=>!c.ok), tf=TF(r.tech); if(p.o==null) p.o=bad.length?1:0; if(p.m==null) p.m=[]; if(p.w==null) p.w=bad.length&&/story/i.test(bad[0].t)?0:bad.length&&/return/i.test(bad[0].t)?1:2;
  return `<div class="tg-pop xf fm-qc">${hdT('QC before release',r)}<div class="fm-ctx"><b>${esc(TN(r.tech))}</b> · all ops done ${hm(r.done||NOW)}${r.rtPass?' · road test '+hm(r.rtPass.at):''} · ${esc(r.cmp)}</div>
    <span class="tg-lbl top">Parsec checked</span><div class="fm-qcl">${A.map(c=>`<div class="fm-qci${c.ok?' ok':' no'}">${c.ok?ic('check',13):ic('flag',13)}<span>${esc(c.t)}</span></div>`).join('')}</div>
    <span class="tg-lbl top" style="margin-top:10px">You check</span>${QCM.map((m,i)=>`<label class="tg-opt"><input type="checkbox" data-a="qck" data-i="${i}"${p.m.includes(i)?' checked':''}>${esc(m)}</label>`).join('')}
    <div style="height:10px"></div>
    ${opt(p,0,'Pass — ready to go',`To Dana · she closes the RO and calls ${esc(r.cust.split(' ')[0])} · shows on Triage under Ready to go`)}
    ${opt(p,1,`Send back to ${esc(tf)}`,'It goes to the top of his queue with your reason')}
    ${p.o===1?`<div class="tg-r fm-qw">${QWHY.map((w,i)=>`<button class="tg-chip${p.w===i?' on':''}" data-a="qwhy" data-i="${i}">${esc(w)}</button>`).join('')}</div>`:''}
    ${opt(p,2,'I’ll look at it','Stays with you · back in the list in 30 min')}
    <div class="tg-acts"><span class="hint">${p.o===0&&(bad.length||p.m.length<QCM.length)?`${bad.length+QCM.length-p.m.length} not checked — noted on the RO`:'QC on every RO · Manager → Shop sets which ones'}</span><button class="btn btn-sm btn-primary" data-a="qgo">${['Pass · to Dana','Send back to '+esc(tf),'Snooze 30 min'][p.o]}${kbd('↵')}</button></div></div>`; }
function qgo(){ const p=U.pop, r=get(p.ro), b=flat(), o=p.o||0, tf=TF(r.tech); snap();
  if(o===2){ r.snz=NOW+0.5; r.snzWhy='QC — looking'; return done(r,'clock','QC — snoozed',`${r.cust} snoozed until ${hm(NOW+0.5)}.`,b); }
  if(o===0){ const open=qcAuto(r).filter(c=>!c.ok).length+QCM.length-(p.m||[]).length; r.qcOk=true; r.hold={to:'writer',who:'Dana Kowalski',h:0,goal:2}; return done(r,'check','QC passed · to Dana',`${r.no} passed QC${open?' with '+open+' open item'+(open>1?'s':'')+' noted':''} — Dana has it under Ready to go.`,b); }
  const w=QWHY[p.w||0]; r.st='hold'; r.sub='QC: '+w.toLowerCase(); r.qcBack={why:w,at:NOW}; r.idle=NOW; const L=upNext(r.tech).filter(x=>x!==r); L.unshift(r); L.forEach((x,i)=>{x.qpos=i+1;});
  return done(r,'swap',`QC — back to ${tf} · ${w}`,`${r.no} back to ${TN(r.tech)} · ${w} — top of ${HIS(r.tech)} queue.`,b); }
techSub=(orig=>function(r){ if(r.st==='roadtest'&&!r.qcOk) return [`${ic('check',11)}QC next`,'']; if(r.st==='roadtest') return ['QC passed · with Dana','']; if(r.qcBack&&r.st==='hold') return [`back from QC · ${r.qcBack.why.toLowerCase()}`,'warn']; return orig(r); })(techSub);
bayTile=(orig=>function(b,s){ let h=orig(b,s); const r=S.R.find(x=>x.spot===b); if(r&&r.st==='roadtest') h=h.replace(/<span class="st">[\s\S]*?<\/span><\/div>/,`<span class="st fm-qcst">${ic('check',12)}${r.qcOk?'Ready to go':'QC next'}</span></div>`); return h; })(bayTile);
/* 2 · the Foreman badge */
const NBG=[['clock','Clocks'],['free','Free techs'],['sent','Sent to you'],['you','Waiting on you'],['back','Back again'],['road','Road test'],['qc','QC'],['tech','Needs a tech'],['in','Bring in'],['watch','Watch']];
let NBON=['clock','sent','you','back','road','qc'];
const nbItems=()=>needsAll().filter(x=>NBON.includes(x.g)&&!snoozed(x.ro));
function navBadge(){ const L=nbItems(); if(!L.length) return ''; const late=L.some(x=>x.late); return `<span class="rl-badge fm-nb${late?' late':''}">${L.length}</span>`; }
function nbFly(){ if(!U.nbf) return ''; const L=nbItems(), late=L.filter(x=>x.late).length, G={}; L.forEach(x=>{G[x.g]=(G[x.g]||0)+1;});
  return `<div class="fm-nbf"><div class="h"><b>Foreman</b><span>${L.length} need you${late?` · <em>${late} late</em>`:''}</span></div>
    <div class="fm-nbs">${NBG.filter(g=>G[g[0]]).map(g=>`<span>${g[1]} <b>${G[g[0]]}</b></span>`).join('')}</div>
    ${L.slice().sort((a,c)=>(c.late?1:0)-(a.late?1:0)).slice(0,5).map(x=>`<button class="fm-nbi" data-a="nbgo" data-ro="${x.ro.no}">${x.late?'<i class="tg-dot"></i>':''}<span class="tg-gi">${x.ro.isTech?`<span class="tg-av">${x.ro.tech}</span>`:ic(x.ic,14)}</span><span class="m"><b>${x.ro.isTech?esc(x.ro.cust):`<span class="tg-no">${x.ro.no}</span> ${esc(x.ro.cust)}`}</b><small>${esc(x.why)}</small></span></button>`).join('')}
    <span class="tg-lbl top">Count in the badge</span><div class="tg-r">${NBG.map(g=>`<button class="tg-chip${NBON.includes(g[0])?' on':''}" data-a="nbt" data-g="${g[0]}">${NBON.includes(g[0])?ic('check',11):''}${g[1]}</button>`).join('')}</div>
    <div class="fm-nbh">${ic('bell',13)}On every page, red when something is late — and in the browser tab as “(${L.length}) Parsec”.</div></div>`; }
/* 3 · tomorrow's board */
const TMR0=[{no:'37722',cust:'Stanly Freight',cmp:'PM service A',kind:'appt',at:7.5,q:2.5,need:'PM'},{no:'37720',cust:'Davie County Schools',cmp:'Dash lights flicker, gauges drop out',kind:'appt',at:8,q:2.0,need:'Electrical'},{no:'37725',cust:'Wilkesboro Ice',cmp:'Clutch adjustment, shifter air leak',kind:'appt',at:9,q:3.0,need:'Drivetrain'},{no:'37731',cust:'Rowan County Fleet',cmp:'Rear brakes — shoes and drums',kind:'appt',at:10.5,q:3.5,need:'Brakes'}];
const TIN=()=>TECH.map(t=>t[0]).filter(k=>!NEXTDAY[k]);
const capT=k=>SHIFT2[k][1]-SHIFT2[k][0]-0.5;
const fitsN=(k,n)=>!n||(SKILLS[k]||[]).includes(n);
function tmItems(){ const L=TMR0.map(x=>Object.assign({},x));
  S.R.forEach(r=>{ if(r.parts&&/tomorrow/.test(r.parts.eta)) L.push({no:r.no,cust:r.cust,cmp:r.parts.op,kind:'parts',at:10,q:(r.ops2||[]).filter(o=>o.st==='parts').reduce((a,o)=>a+o.q,0)||leftEst(r),need:needOf(r),tech0:r.parts.back}); });
  TECH.forEach(t=>{ const k=t[0], hl=hoursLeft(k), run=runOf(k); let used=0; const Q=(run&&!isStuck(run)?[run]:[]).concat(upNext(k));
    Q.forEach(r=>{ const h=r.done?0.5:leftEst(r); if(used+h<=hl+0.05){ used+=h; return; } const rest=used>=hl?h:used+h-hl; used+=h; L.push({no:r.no,cust:r.cust,cmp:r.cmp,kind:'carry',q:Math.round(rest*10)/10,part:rest<h-0.05,need:needOf(r),tech0:k}); }); });
  S.R.filter(r=>r.st==='customer'&&r.tech&&r.sub==='Approval pending').forEach(r=>L.push({no:r.no,cust:r.cust,cmp:r.cmp,kind:'maybe',q:r.q,need:needOf(r),tech0:r.tech}));
  return L; }
const KORD={parts:0,carry:1,appt:2,maybe:3};
function tmAuto(L){ const P={}, room={}; TIN().forEach(k=>{P[k]=[];room[k]=capT(k);}); const un=[];
  L.slice().sort((a,c)=>KORD[a.kind]-KORD[c.kind]||(a.at||0)-(c.at||0)).forEach(x=>{ if(x.kind==='maybe'){ un.push(x.no); return; }
    let t=x.tech0&&P[x.tech0]&&x.kind!=='appt'?x.tech0:null;
    if(!t){ const C=TIN().filter(k=>fitsN(k,x.need)).sort((a,c)=>room[c]-room[a]); t=C.find(k=>room[k]>=x.q-0.05)||null; }
    if(t){ P[t].push(x.no); room[t]-=x.q; } else un.push(x.no); });
  return {P,un}; }
function tmPlan(){ const L=tmItems(), ids=new Set(L.map(x=>x.no)); if(!S.tm) S.tm=tmAuto(L);
  const P=S.tm.P, seen=new Set(); Object.keys(P).forEach(k=>{ P[k]=P[k].filter(n=>ids.has(n)&&!seen.has(n)&&seen.add(n)); }); S.tm.un=S.tm.un.filter(n=>ids.has(n)&&!seen.has(n)&&seen.add(n));
  L.forEach(x=>{ if(!seen.has(x.no)){ S.tm.un.push(x.no); seen.add(x.no); } }); return {L,P,un:S.tm.un}; }
const tmWhy=x=>x.kind==='appt'?`appt ${hm(x.at)} · ${hh(x.q)}`:x.kind==='parts'?`parts due ~${hm(x.at)} · ${hh(x.q)}`:x.kind==='carry'?(x.part?`finish from today · ${hh(x.q)} left`:`rolls over from today · ${hh(x.q)}`):`if Dana gets approval · ${hh(x.q)}`;
function tmNote(){ const {L,P,un}=tmPlan(), M={}, out=[]; L.forEach(x=>{M[x.no]=x;});
  TECH.forEach(t=>{ if(NEXTDAY[t[0]]) out.push(`${TF(t[0])} is off tomorrow.`); });
  un.map(n=>M[n]).filter(x=>x.kind!=='maybe').forEach(x=>{ const who=TIN().filter(k=>fitsN(k,x.need)); out.push(`${x.no} ${x.cust} (${x.cmp.toLowerCase()}) has no tech yet${x.need&&!who.length?' — nobody in tomorrow does '+x.need:''}.`); });
  TIN().forEach(k=>{ const f=P[k][0]&&M[P[k][0]]; if(!f) return; out.push(`${TF(k)}: start on ${f.no} ${f.cust}${f.kind==='parts'?' when the part lands ~'+hm(f.at):f.kind==='appt'?' — appointment '+hm(f.at):f.kind==='carry'?' — finish it first':''}.`); });
  S.R.filter(r=>r.st==='parts'&&inBay(r)).forEach(r=>out.push(`${r.spot} stays blocked by ${r.no} until its part shows.`));
  return out.map(s=>'• '+s).join('\n'); }
function vTmr(s){ const {L,P,un}=tmPlan(), M={}; L.forEach(x=>{M[x.no]=x;});
  const card=(x,i,k)=>{ const fit=!k||fitsN(k,x.need), sel=U.tsel===x.no;
    return `<div class="fm-tmk ${x.kind}${sel?' sel':''}" draggable="true" data-tdrag="${x.no}" data-a="tsel" data-no="${x.no}"><div class="r1">${k?`<span class="fm-ord">${i+1}</span>`:''}<b class="tg-no">${x.no}</b>${x.need?`<span class="fm-skt${fit?'':' no'}">${SKA[x.need]}</span>`:''}<span class="kd">${({appt:'Appt',parts:'Parts',carry:'Carry-over',maybe:'Maybe'})[x.kind]}</span></div><div class="cu">${esc(x.cust)}</div><div class="r3">${esc(tmWhy(x))}</div>
      ${sel?`<div class="fm-tmv">${TIN().map(t=>`<button class="tg-chip${k===t?' on':''}" data-a="tmv" data-no="${x.no}" data-k="${t}">${esc(TF(t))}</button>`).join('')}<button class="tg-chip${!k?' on':''}" data-a="tmv" data-no="${x.no}" data-k="">Not yet</button></div>`:''}</div>`; };
  const col=k=>{ const h=P[k].reduce((a,n)=>a+M[n].q,0), c=capT(k), o=h-c;
    return `<div class="fm-tmc" data-tk="${k}"><div class="h"><span class="nm"><span class="tg-av">${k}</span>${esc(TN(k))}</span><small>${hm(SHIFT2[k][0])}–${hm(SHIFT2[k][1])}</small><div class="fm-tcap"><i style="width:${Math.min(100,h/c*100).toFixed(0)}%"${o>0.05?' class="over"':''}></i></div><small class="${o>0.05?'bad':h<c*0.5?'room':''}">${hh(h)} of ${hh(c)}${o>0.05?' · '+hh(o)+' over':' · '+hh(c-h)+' free'}</small></div><div class="fm-tml">${P[k].map((n,i)=>card(M[n],i,k)).join('')||'<span class="fm-none">Nothing yet — drag work here</span>'}</div></div>`; };
  const off=TECH.map(t=>t[0]).filter(k=>NEXTDAY[k]);
  const tot=TIN().reduce((a,k)=>a+capT(k),0), pl=TIN().reduce((a,k)=>a+P[k].reduce((b,n)=>b+M[n].q,0),0);
  const note=U.tmNote!=null?U.tmNote:tmNote();
  return `<div class="fm-tmr"><div class="fm-tmh"><b>Tomorrow · Fri</b><span>${TIN().length} techs in · ${hh(tot)} · ${hh(pl)} planned</span>${off.map(k=>`<span class="fm-off"><span class="tg-av">${k}</span>${esc(TF(k))} off</span>`).join('')}<span class="sp"></span><button class="btn btn-sm" data-a="tmauto">${ic('userPlus',13)}Plan the rest</button></div>
    <div class="fm-tmcols"><div class="fm-tmc un" data-tk=""><div class="h"><span class="nm">Not planned</span><small>${un.length} · drag onto a tech</small></div><div class="fm-tml">${un.map((n,i)=>card(M[n],i,null)).join('')||'<span class="fm-none">Everything has a tech</span>'}</div></div>${TIN().map(col).join('')}</div>
    <div class="fm-hand"><div class="h"><b>Handoff note</b><small>On every Console at 07:00, and Dana’s Triage</small><span class="sp"></span>${U.tmNote!=null?'<button class="btn btn-sm tg-gh" data-a="tmreset">Back to suggested</button>':''}<button class="btn btn-sm btn-primary" data-a="tmsend">${ic('clock',13)}${U.tmSent?'Scheduled · 07:00':'Send at 07:00'}</button></div><textarea id="fm-note" rows="7">${esc(note)}</textarea></div>
    <div class="tg-leg"><span><span class="fm-ord">1</span>#1 shows on his Console at clock-in</span><span><span class="kd2 appt">Appt</span>Booked</span><span><span class="kd2 carry">Carry-over</span>Won’t finish today</span><span><span class="kd2 parts">Parts</span>Part due tomorrow</span><span class="hint">Drag cards, or click one to move it</span></div></div>`; }
function tmMove(no,k,before){ const {P}=tmPlan(); snap(); Object.keys(P).forEach(t=>{P[t]=P[t].filter(n=>n!==no);}); S.tm.un=S.tm.un.filter(n=>n!==no);
  const L=k?P[k]:S.tm.un, i=before?L.indexOf(before):-1; L.splice(i<0?L.length:i,0,no); U.tsel=null; U.tmNote=null; render(); }
reset=(orig=>function(){ orig(); S.tm=null; U.tmNote=null; U.tmSent=false; U.tsel=null; U.nbf=false; NBON=['clock','sent','you','back','road','qc']; })(reset);
pop=(orig=>function(){ const p=U.pop; if(p&&p.type==='qc'){ const r=get(p.ro); if(r) return qcP(p,r); } return orig(); })(pop);
render=(orig=>function(){ orig(); const app=$('.tg-app'); if(app&&U.nbf){ app.insertAdjacentHTML('beforeend',nbFly()); const a=$('.tg-rail a[data-a="nbf"]'), f=$('.fm-nbf'); if(a&&f){ const ar=a.getBoundingClientRect(), pr=app.getBoundingClientRect(); f.style.top=Math.max(8,Math.min((ar.top-pr.top)/scale-8,app.offsetHeight-f.offsetHeight-8))+'px'; } } })(render);
let TD=null;
mock.addEventListener('dragstart',e=>{ const d=e.target.closest('[data-tdrag]'); if(!d) return; TD=d.dataset.tdrag; try{e.dataTransfer.setData('text/plain',TD);}catch(x){} d.classList.add('src'); });
mock.addEventListener('dragover',e=>{ if(!TD) return; const z=e.target.closest('.fm-tmc'); if(!z) return; e.preventDefault(); $$('.fm-tmc.over,.fm-tmk.ins',mock).forEach(x=>x.classList.remove('over','ins')); z.classList.add('over'); const c=e.target.closest('.fm-tmk'); if(c&&c.dataset.tdrag!==TD) c.classList.add('ins'); });
mock.addEventListener('drop',e=>{ if(!TD) return; const z=e.target.closest('.fm-tmc'); if(!z) return; e.preventDefault(); const c=e.target.closest('.fm-tmk'), no=TD; TD=null; tmMove(no,z.dataset.tk,c&&c.dataset.tdrag!==no?c.dataset.tdrag:null); });
mock.addEventListener('dragend',()=>{ TD=null; $$('.fm-tmc.over,.fm-tmk.ins,.fm-tmk.src',mock).forEach(x=>x.classList.remove('over','ins','src')); });
mock.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t) return; const a=t.dataset.a, p=U.pop;
  if(a==='nbf'){ U.nbf=!U.nbf; render(); }
  else if(a==='nbgo'){ U.nbf=false; U.sel=t.dataset.ro; U.view=U.view==='tmr'?'floor':U.view; render(); }
  else if(a==='nbt'){ const g=t.dataset.g, i=NBON.indexOf(g); if(i<0) NBON.push(g); else NBON.splice(i,1); render(); }
  else if(a==='tsel'){ if(e.target.closest('[data-a="tmv"]')) return; U.tsel=U.tsel===t.dataset.no?null:t.dataset.no; render(); }
  else if(a==='tmv') tmMove(t.dataset.no,t.dataset.k,null);
  else if(a==='tmauto'){ snap(); const L=tmItems(); const {P}=tmPlan(); const room={}; TIN().forEach(k=>{room[k]=capT(k)-P[k].reduce((s,n)=>s+(L.find(x=>x.no===n)||{q:0}).q,0);});
    const left=[]; L.filter(x=>S.tm.un.includes(x.no)).sort((a,c)=>KORD[a.kind]-KORD[c.kind]||(a.at||0)-(c.at||0)).forEach(x=>{ if(x.kind==='maybe'){ left.push(x.no); return; } const C=TIN().filter(k=>fitsN(k,x.need)).sort((a,c)=>room[c]-room[a]); const k=C.find(k=>room[k]>=x.q-0.05); if(k){ P[k].push(x.no); room[k]-=x.q; } else left.push(x.no); });
    const n=S.tm.un.length-left.length; S.tm.un=left; U.tmNote=null; toast(n?`Planned ${n} more for tomorrow.`:`Nothing else fits — ${left.length} still need a tech who has the skill.`); render(); }
  else if(a==='tmreset'){ U.tmNote=null; render(); }
  else if(a==='tmsend'){ const v=$('#fm-note'); if(v) U.tmNote=v.value===tmNote()?null:v.value; U.tmSent=true; toast(`Handoff note set for 07:00 — on ${TIN().length} Consoles and Dana’s Triage. Each tech sees his #1 at clock-in.`); render(); }
  else if(!p) return;
  else if(a==='qck'){ const i=+t.dataset.i, m=p.m||(p.m=[]), j=m.indexOf(i); if(j<0) m.push(i); else m.splice(j,1); render(); }
  else if(a==='qwhy'){ p.w=+t.dataset.i; render(); }
  else if(a==='qgo') qgo(); });
mock.addEventListener('input',e=>{ if(e.target.id==='fm-note') U.tmNote=e.target.value; });
document.addEventListener('pointerdown',e=>{ if(U.nbf&&mock.contains(e.target)&&!e.target.closest('.fm-nbf,[data-a="nbf"]')){ U.nbf=false; render(); } },true);
addEventListener('keydown',e=>{ const p=U.pop; if(!p||p.type!=='qc'||e.target.matches('input,textarea')||e.ctrlKey||e.metaKey||e.altKey) return; const n=+e.key; if(n>=1&&n<=3){ $(`.tg-pop [data-a="dpick"][data-i="${n-1}"]`)?.click(); e.preventDefault(); } });
const holdTomorrow=()=>{ const r=get('37480'), A=r.find.add; r.ops2.push({t:A.t,q:A.q,b:0,by:'KT',at:NOW,st:'parts'}); r.ops2[0].st='done'; r.find=null; r.acc=true; r.sent=null; r.st='parts'; r.sub='Ordered · due tomorrow 10:00'; r.hold={to:'parts',who:'Ben Okafor',h:0,goal:24}; r.parts={eta:'tomorrow 10:00',back:'KT',op:A.t}; r.spot='D2'; };
"""
rep("\nconst DEMO={", QJS + "\nconst DEMO={")
src = re.sub(r"const DEMO=\{.*?\n\};\n", """const DEMO={
  overview:()=>{reset();U.sel='37388';render();},
  qc:()=>{reset();U.sel='37388';render();openPop('qc','37388');},
  back:()=>{reset();U.sel='37700';render();openPop('qc','37700');},
  badge:()=>{reset();U.sel='37388';render();U.nbf=true;render();},
  tmr:()=>{reset();holdTomorrow();U.view='tmr';U.sel='37480';render();},
  note:()=>{reset();holdTomorrow();U.view='tmr';U.sel='37480';render();const n=$('#fm-note');if(n){n.scrollIntoView({block:'center'});n.focus();}}
};
""", src, count=1, flags=re.S)
assert "note:()=>" in src

CSS6 = r"""
.fm-qcl{display:flex;flex-direction:column;gap:2px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--tg-hair);padding:6px 10px;}
.fm-qci{display:flex;align-items:center;gap:8px;min-height:26px;font-size:12.5px;color:var(--tg-ink2);}
.fm-qci.ok .tg-ic{color:var(--tg-good);} .fm-qci.no{color:var(--tg-warn);font-weight:500;} .fm-qci.no .tg-ic{color:var(--tg-warn);}
.fm-qw{margin:2px 0 6px 38px;}
.tg-pop.fm-qc{width:460px;}
.fm-bay .r1 .st.fm-qcst{color:var(--tg-good) !important;}
.rl-badge.fm-nb{background:var(--tg-primary,var(--ink));color:var(--tg-onprimary,var(--panel));}
.rl-badge.fm-nb.late{background:var(--bad,#c0392b);color:#fff;}
.fm-nbf{position:absolute;left:62px;z-index:60;width:340px;padding:12px 14px 14px;border-radius:12px;background:var(--tg-raised,var(--panel));box-shadow:0 0 0 1px var(--hairline),0 12px 32px -8px rgba(0,0,0,.25);font:13px/1.35 var(--font-sans);color:var(--ink);}
.fm-nbf .h{display:flex;align-items:baseline;gap:8px;margin-bottom:6px;} .fm-nbf .h b{font-weight:600;font-size:14px;} .fm-nbf .h span{font-size:12px;color:var(--ink-3);} .fm-nbf .h em{font-style:normal;color:var(--bad,#c0392b);font-weight:500;}
.fm-nbs{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11.5px;color:var(--ink-3);margin-bottom:6px;} .fm-nbs b{color:var(--ink);font-weight:600;}
.fm-nbi{position:relative;display:grid !important;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:center;width:100%;padding:6px 6px 6px 10px !important;border:0;border-radius:8px;background:transparent;text-align:left;cursor:pointer;color:inherit;font:inherit;}
.fm-nbi:hover{background:var(--selected);}
.fm-nbi .tg-dot{position:absolute;left:2px;top:50%;margin-top:-3px;}
.fm-nbi .tg-gi{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;background:var(--selected);color:var(--ink-2);}
.fm-nbi .tg-gi .tg-av{width:22px;height:22px;font-size:8.5px;}
.fm-nbi .m{display:flex;flex-direction:column;min-width:0;} .fm-nbi b{font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .fm-nbi small{font-size:11.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-nbf .tg-lbl.top{display:block;width:auto;font-size:12px;color:var(--ink-3);margin:10px 0 6px;}
.fm-nbf .tg-r{display:flex;flex-wrap:wrap;gap:5px;}
.fm-nbf .tg-chip{height:24px;padding:0 8px !important;font-size:12px;border:0;background:transparent;cursor:pointer;box-shadow:inset 0 0 0 1px var(--hairline);color:var(--ink-3);}
.fm-nbf .tg-chip.on{background:var(--selected);color:var(--ink);box-shadow:none;}
.fm-nbh{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:11.5px;color:var(--ink-3);}
.fm-tmr{display:flex;flex-direction:column;gap:12px;padding:16px 28px 18px;height:100%;min-height:0;overflow:auto;box-sizing:border-box;}
.fm-tmh{display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--tg-ink3);flex:none;}
.tg .fm-tmh b{font:500 20px/26px var(--tg-serif);color:var(--tg-ink);}
.fm-tmh .sp{flex:1;}
.fm-off{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px 0 3px;border-radius:7px;background:var(--tg-warn-t);color:var(--tg-warn);font-weight:500;}
.fm-off .tg-av{width:18px;height:18px;font-size:8px;}
.fm-tmcols{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;align-items:start;flex:none;}
.fm-tmc{display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--tg-hair);min-height:200px;min-width:0;}
.fm-tmc.un{background:var(--tg-canvas);}
.fm-tmc.over{box-shadow:inset 0 0 0 2px var(--tg-acc);background:var(--tg-acct);}
.fm-tmc > .h{display:flex;flex-direction:column;gap:3px;padding:2px 4px 6px;}
.fm-tmc > .h .nm{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--tg-ink);}
.fm-tmc > .h small{font-size:11.5px;color:var(--tg-ink3);} .fm-tmc > .h small.bad{color:var(--tg-bad);font-weight:500;} .fm-tmc > .h small.room{color:var(--tg-good);font-weight:500;}
.fm-tcap{height:5px;border-radius:3px;background:var(--tg-hair);overflow:hidden;margin:2px 0;} .fm-tcap i{display:block;height:100%;background:var(--tg-ink2);border-radius:3px;} .fm-tcap i.over{background:var(--tg-st-problem);}
.fm-tml{display:flex;flex-direction:column;gap:6px;}
.fm-tmk{display:flex;flex-direction:column;gap:3px;padding:7px 9px 8px;border-radius:10px;background:var(--tg-raised);box-shadow:0 0 0 1px var(--tg-hair);font-size:12.5px;cursor:grab;user-select:none;min-width:0;}
.fm-tmk:hover{box-shadow:0 0 0 1px var(--tg-bs);} .fm-tmk.sel{box-shadow:inset 0 0 0 1.5px var(--tg-acc);} .fm-tmk.ins{box-shadow:inset 0 3px 0 var(--tg-acc),0 0 0 1px var(--tg-hair);} .fm-tmk.src{opacity:.45;}
.fm-tmk .r1{display:flex;align-items:center;gap:6px;min-width:0;}
.fm-tmk .kd,.kd2{margin-left:auto;display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:4px;font-size:10px;font-weight:600;background:var(--tg-fill);color:var(--tg-ink3);white-space:nowrap;}
.kd2{margin-left:0;}
.fm-tmk.appt .kd,.kd2.appt{background:var(--tg-acct);color:var(--tg-acctx);} .fm-tmk.carry .kd,.kd2.carry{background:var(--tg-warn-t);color:var(--tg-warn);} .fm-tmk.parts .kd,.kd2.parts{background:var(--tg-good-t);color:var(--tg-good);}
.fm-tmk.maybe{opacity:.8;background:repeating-linear-gradient(135deg,var(--tg-raised) 0 6px,var(--tg-fill) 6px 8px);}
.fm-tmk .cu{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-tmk .r3{font-size:11.5px;color:var(--tg-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fm-tmv{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;} .fm-tmv .tg-chip{height:22px;padding:0 7px !important;font-size:11.5px;}
.fm-hand{display:flex;flex-direction:column;gap:6px;padding:10px 12px 12px;border-radius:12px;background:var(--tg-canvas);flex:none;}
.fm-hand .h{display:flex;align-items:center;gap:10px;} .fm-hand .h b{font-size:13px;font-weight:600;} .fm-hand .h small{font-size:11.5px;color:var(--tg-ink3);} .fm-hand .h .sp{flex:1;}
.tg .fm-hand textarea{width:100%;box-sizing:border-box;resize:vertical;min-height:132px;padding:8px 10px;border-radius:9px;border:0;box-shadow:inset 0 0 0 1px var(--tg-border);background:var(--tg-raised);color:var(--tg-ink);font:13px/1.5 var(--tg-sans);}
.fm-tmr .tg-leg{flex:none;}
"""
rep(".tg-pop.fm-skp{width:360px;}", ".tg-pop.fm-skp{width:360px;}\n" + CSS6)

src = re.sub(r'demos = "".join\(.*?\n', 'demos = "".join(f\'<button data-demo="{k}">{n}</button>\' for k, n in [("overview", "QC & handoff"), ("qc", "1 · QC before release"), ("back", "1 · Send back"), ("badge", "2 · Foreman badge"), ("tmr", "3 · Tomorrow’s board"), ("note", "3 · Handoff note")])\n', src, count=1)
src = re.sub(r"about = \[\n.*?\n\]\n", '''about = [
 ("1 · QC before release", "After the road test, the truck comes to you for QC. Parsec checks what it can — every op closed, a story on each op, hours against the quote, the road test result, parts used or to return. You tick the walk-around. Pass sends it to Dana under Ready to go; Send back puts it at the top of the tech’s queue with your reason."),
 ("2 · Foreman badge", "The Foreman icon carries a count of what needs you — red when something is late — on every page, and in the browser tab. Click it for the top items. Choose which groups count."),
 ("3 · Tomorrow’s board", "A fourth view next to Floor · Techs · Yard. Booked appointments, work that won’t finish today, parts due tomorrow and maybe-approvals, laid out by tech with each one’s hours. Whoever’s off tomorrow is left out. Plan the rest fills by skill and hours; drag or click to move. Each tech’s #1 shows on his Console at clock-in."),
 ("3 · Handoff note", "Written for you from the board — who’s off, what has no tech, where each tech starts, which bays stay blocked. Edit it and send it for 07:00; it shows on every Console and Dana’s Triage."),
]
''', src, count=1, flags=re.S)
rep("<title>Parsec Foreman decide and assign</title>", "<title>Parsec Foreman QC and handoff</title>")
rep("Parsec · Foreman — Decide & Assign", "Parsec · Foreman — QC & Handoff")
rep("<h2>Decide &amp; Assign<small>Builds on the Needs action, Floor and Techs changes. Use the buttons above.</small></h2>", "<h2>QC &amp; Handoff<small>Builds on every Foreman change so far. Use the buttons above, or press 4 for Tomorrow.</small></h2>")

exec(compile(src, SRC, "exec"), {"__name__": "__main__", "__file__": SRC})
