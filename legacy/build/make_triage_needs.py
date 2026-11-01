# Triage — Needs action list: snooze from the outcome, keyboard triage, cleared today, all caught up.
# Builds on make_triage_inbox.py (header views, Desk, Yard, search) and make_triage.py (data, helpers, styles).
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
src = open(f"{B}/make_triage_inbox.py").read().split("\nrep = {")[0]
argv = sys.argv; sys.argv = [argv[0], "/dev/null"]
ns = {"__file__": f"{B}/make_triage_inbox.py", "__name__": "tib"}
exec(src, ns)
sys.argv = argv
P, tok, bun, DATA, ICO, SI = ns["P"], ns["tok"], ns["bun"], ns["DATA"], ns["ICO"], ns["SI"]
IJS = ns["JS"]
SHARED = ns["SHARED"]
def between(s, a, b):
    i = s.index(a); j = s.index(b, i); return s[i:j]
DESK_YARD = between(IJS, "/* ---------- view 2 · Desk ---------- */", "/* ---------- search")
SEARCH = between(IJS, "/* ---------- search", "/* ---------- page ---------- */")
# Desk "Next" bar: its buttons run the same list actions
old = "<button class=\"px-btn px-btn--sm\">${I.phone}Log a call</button>${n?`<button class=\"px-btn px-btn--accent px-btn--sm\">${n[4]}</button>`:''}"
new = "<button class=\"px-btn px-btn--sm\" data-pop=\"log\" data-no=\"${r.no}\">${I.phone}Log a call</button>${n?`<button class=\"px-btn px-btn--accent px-btn--sm\" data-act=\"${r.no}\">${n[4]}</button>`:''}"
assert old in DESK_YARD; DESK_YARD = DESK_YARD.replace(old, new).replace("const n=needs().find", "const n=needsNow().find")

CSS = ns["CSS"] + r'''
/* ---------- toolbar demo controls ---------- */
.wt-clock{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-3)}
.wt-clock b{font:500 13px/1 var(--font-mono);color:var(--ink);min-width:44px;text-align:center}

/* ---------- list items ---------- */
.ib .i3-list{position:relative;flex:0 0 400px;width:400px;min-width:0}
.ib .i3-scroll{position:relative}
.ib .i3-it{grid-template-columns:28px minmax(0,1fr) auto auto;max-height:96px;transition:max-height .2s ease,opacity .18s ease,padding .2s ease,background-color .12s}
.ib .i3-it.out{max-height:0;opacity:0;padding-top:0;padding-bottom:0;overflow:hidden}
.ib .i3-it .nx-snz{grid-column:3;grid-row:1 / span 2;color:var(--ink-3);display:none}
.ib .i3-it:hover .nx-snz,.ib .i3-it.on .nx-snz{display:inline-flex}
.ib:not(.v-yard) .i3-it .t .tg-spot{display:none}
.ib .i3-it [data-act]{grid-column:4}
.ib .i3-it.kb{box-shadow:inset 3px 0 0 var(--accent)}
.ib .i3-it.kb .dot{display:none}
.nx-back{display:inline-flex;align-items:center;gap:3px;height:18px;padding:0 6px;border-radius:6px;background:var(--fill);color:var(--ink-2);font-size:11px;font-weight:500;flex:none}
.nx-back .px-ico{width:11px;height:11px}
.i3-lh .nx-done{all:unset;margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:400;color:var(--ink-3);cursor:pointer}
.i3-lh .nx-done .px-ico{width:13px;height:13px;color:var(--status-working)}
.i3-lh .nx-done:hover{color:var(--ink)}
.nx-sec{display:flex;align-items:center;gap:8px;margin-top:12px;padding:11px 20px 9px;font-size:12px;font-weight:500;color:var(--ink-3);cursor:pointer;box-shadow:inset 0 1px 0 var(--hairline)}
.nx-sec + .nx-sec,.nx-rows + .nx-sec{margin-top:0}
.nx-sec:hover{color:var(--ink)}
.nx-sec .px-ico{width:12px;height:12px;transition:transform .15s}
.nx-sec.open > .px-ico{transform:rotate(90deg)}
.nx-sec .n{color:var(--ink-4)}
.nx-sec .m{margin-left:auto;font-weight:400}
.nx-rows{padding-bottom:6px}
.nx-row{display:grid;grid-template-columns:44px auto minmax(0,1fr) auto;align-items:center;gap:0 10px;padding:5px 20px;font-size:12.5px;cursor:pointer}
.nx-row:hover{background:var(--fill)}
.nx-row time{grid-row:1 / span 2;font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.nx-row b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nx-row small{grid-column:2 / 4;display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nx-row small .px-ico{width:12px;height:12px;flex:none}
.nx-row .px-btn{grid-column:4;grid-row:1 / span 2}
.nx-row.done{cursor:default;padding-top:7px;padding-bottom:7px}
.nx-row.done time{grid-row:auto}
.nx-row.done small{grid-column:4;justify-self:end}
.nx-row.done small .px-ico{color:var(--status-working)}
.nx-keys{flex:none;display:flex;align-items:center;gap:11px;height:38px;padding:0 14px 0 20px;box-shadow:inset 0 1px 0 var(--hairline);font-size:11.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden}
.nx-keys > span{display:inline-flex;align-items:center;gap:4px}
.nx-keys .px-kbd{min-width:16px;height:16px;padding:0 3px;font-size:10.5px}
.nx-keys b{font-weight:500;color:var(--ink-2)}
.nx-keys .sp{flex:1}
.nx-keys button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.nx-keys button:hover{color:var(--ink)}
.nx-toast{position:absolute;left:14px;right:14px;bottom:50px;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 14px;border-radius:12px;background:var(--ink);color:var(--canvas);font-size:13px;box-shadow:var(--shadow-raised);z-index:12;animation:px-up .18s cubic-bezier(.2,.8,.2,1) both}
.nx-toast > span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nx-toast button{all:unset;cursor:pointer;font-weight:600;display:inline-flex;gap:6px;align-items:center}
.nx-toast .px-kbd{background:rgba(128,128,128,.32);color:inherit;box-shadow:none;height:16px;font-size:10.5px}

/* ---------- popovers from the list ---------- */
.nx-pop{position:absolute;left:390px;z-index:30;width:372px;box-sizing:border-box;padding:12px 14px 14px;box-shadow:0 0 0 1px var(--border),var(--shadow-raised)}
.nx-pop.menu{width:320px;padding:6px}
.nx-ph{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:12.5px;color:var(--ink-3);min-width:0}
.nx-pop.menu .nx-ph{margin:4px 6px 6px 10px}
.nx-ph .k{font-weight:600;color:var(--ink);white-space:nowrap}
.nx-ph .tg-ro{white-space:nowrap}
.nx-ph b{font-weight:500;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.nx-ph .px-btn{margin-left:auto;flex:none}
.nx-pop .px-menu__item .px-kbd{margin-left:0;min-width:16px;height:16px;font-size:10.5px}
.nx-pop .px-menu__item .px-menu__meta{margin-left:auto}
.nx-pop .px-menu__item b{font-weight:500}
.nx-pop .ft{margin:6px 6px 2px 10px;padding-top:8px;box-shadow:inset 0 1px 0 var(--hairline);font-size:11.5px;color:var(--ink-3);display:flex;gap:10px;align-items:center}
.nx-pop .ft .px-kbd{height:16px;font-size:10.5px}
.nx-pop .card{display:flex;flex-direction:column;gap:8px;margin:2px 10px 10px;font-size:13px;color:var(--ink-2)}
.nx-pop .card div{display:flex;align-items:center;gap:8px}
.nx-pop .card .px-ico{width:14px;height:14px;color:var(--ink-3)}
.nx-pop .acts{display:flex;gap:8px;margin:0 6px 4px;justify-content:flex-end}
.lf{display:flex;flex-direction:column;gap:8px}
.lf-r{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.lf .lbl{font-size:12px;color:var(--ink-3);width:58px;flex:none}
.nx-pop .lf .lbl{width:100%;margin:2px 0 -1px}
.lf .tg-chip .px-kbd{min-width:14px;height:15px;padding:0 3px;font-size:10px;margin-left:-4px;background:transparent;box-shadow:inset 0 0 0 1px var(--border)}
.lf .tg-chip.on .px-kbd{box-shadow:inset 0 0 0 1px var(--border-strong)}
.lf-when .tg-chip{font-variant-numeric:tabular-nums}
.lf-when .tg-chip small{color:var(--ink-3);font-size:11px}
.lf textarea{all:unset;box-sizing:border-box;width:100%;min-height:36px;padding:8px 10px;border-radius:9px;box-shadow:inset 0 0 0 1px var(--border);font-size:13.5px;line-height:20px;color:var(--ink);white-space:pre-wrap}
.lf textarea:focus{box-shadow:inset 0 0 0 1.5px var(--ink-3)}
.lf textarea::placeholder{color:var(--ink-3)}
.lf-f{flex-wrap:nowrap;gap:10px}
.lf-fu{flex:1;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink-3);min-width:0}
.lf-fu .px-ico{width:13px;height:13px;flex:none}
.lf-fu.snz{color:var(--ink-2)}.lf-fu.ok{color:var(--good)}.lf-fu.no{color:var(--bad)}
.lf .px-btn[disabled]{opacity:.4;pointer-events:none}
.lf-hint{font-size:11.5px;color:var(--ink-3);display:flex;gap:10px;margin-top:-2px}
.lf-hint .px-kbd{height:15px;font-size:10px}
.i3-comp .lf-nf{flex-wrap:nowrap;gap:12px}
.i3-comp .lf textarea{box-shadow:none;padding:0;min-height:22px;flex:1}
.i3-comp .lf-fu{flex:none;max-width:52%}
.i3-comp .lf-fu span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ---------- all caught up ---------- */
.nx-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:52px 20px 8px}
.nx-empty .ring{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:var(--good-tint);color:var(--good);animation:px-rise .3s cubic-bezier(.2,.8,.2,1) both}
.nx-empty .ring .px-ico{width:24px;height:24px}
.nx-empty h3{margin:16px 0 4px;font:500 24px/30px var(--font-serif);letter-spacing:-.01em}
.nx-empty p{margin:0;font-size:13px;color:var(--ink-3)}
.nx-up{align-self:stretch;margin-top:26px;text-align:left;border-radius:14px;background:var(--canvas);padding:4px 0 6px}
.nx-up .h{padding:10px 16px 4px;font-size:12px;font-weight:500;color:var(--ink-3)}
.nx-up .nx-row{padding:7px 16px}
.nx-up .nx-row small .px-ico{color:var(--ink-3)}
.nx-empty .px-btn{margin-top:14px}

/* ---------- keyboard sheet ---------- */
.nx-kgrid{display:grid;grid-template-columns:1fr 1fr;gap:0 28px}
.nx-kcol{display:flex;flex-direction:column}
.nx-kg{font-size:12px;font-weight:500;color:var(--ink-3);padding:4px 0 6px}
.nx-kg:not(:first-child){padding-top:16px}
.nx-k{display:flex;align-items:center;gap:8px;height:32px;font-size:13.5px;box-shadow:inset 0 -1px 0 var(--hairline)}
.nx-k .ks{margin-left:auto;display:flex;gap:4px;align-items:center;font-size:11px;color:var(--ink-4)}
.nx-help .px-modal{width:620px}
'''

JS = SHARED + r'''
SEL='37590'; let TAB='inbox', SRCH=false, MOVE=false, TOAST='', QV='';
const VIEWS=[['inbox','inbox','Inbox'],['desk','console','Desk'],['yard','pin','Yard']];
const T0=10.25; let NOW=T0;
const fmt=h=>{const m=Math.round(h*60),d=Math.floor(m/1440),mm=m%1440,s=`${Math.floor(mm/60)}:${String(mm%60).padStart(2,'0')}`;return d?'Fri '+s:s;};
const r5=h=>Math.round(h*12)/12;
const TECH={MR:'Mike Rodriguez',LM:'Luis Martinez',PS:'Pat Sutton'};
const HOLDER={writer:'Dana Kowalski',parts:'Parts desk',foreman:'Ray Owens',manager:'Tom Becker',warranty:'Kim Lee'};
const GOAL={tech:8,writer:4,parts:24,foreman:2,warranty:24,manager:4};
const OUTS=['Approved','Declined','Left voicemail','No answer','Update given','Will call back'];
const FOLLOW={'Left voicemail':2,'No answer':1,'Update given':4};
const GORD=['Waiting on customers','Ready to go','Held too long','Coming in'];
const CLR0=[{at:7.83,ic:'inArrow',what:'Checked in to T3',no:'37628',cust:'Rowan Ready Mix'},{at:8.03,ic:'x',what:'Logged decline on op 2',no:'37460',cust:'Lexington Bottling'},{at:8.67,ic:'release',what:'Released',no:'37220',cust:'Elkin Hardwoods'},{at:9.17,ic:'userPlus',what:'Assigned to Mike Rodriguez',no:'35112',cust:'Piedmont Aggregates'},{at:9.5,ic:'release',what:'Released',no:'37388',cust:'Surry Feed & Seed'}];
const INIT=JSON.stringify({ros:ROS,rel:D.rel});
let SNZ={}, BACK={}, CLR=JSON.parse(JSON.stringify(CLR0)), UNDO=[], NT=null, POP=null, KB=false, HELP=false, OPEN={snz:false,clr:false};
const newLF=()=>({kind:'Call',out:null,when:null,note:''});
let LFP=newLF(), LFC=newLF();

/* ---------- what needs action right now ---------- */
const etaH=r=>{const [h,m]=String(r.age).split(':').map(Number);return h+(m||0)/60;};
function needsNow(){return needs().filter(x=>{const r=x[0];if(SNZ[r.no])return false;if(r.cat==='arr'&&etaH(r)-NOW>1.5)return false;return true;})
  .map(x=>{const y=x.slice(),b=BACK[y[0].no];if(b)y[3]=b.why?`${b.why} · snoozed ${fmt(b.at)}`:`Snoozed ${fmt(b.at)}`;y[3]=y[3].replace('Checked in 0m ago','Checked in just now');return y;});}
function grouped(){const N=needsNow(),G={};GORD.forEach(g=>G[g]=[]);N.forEach(x=>G[x[5]].push(x));
  GORD.forEach(g=>G[g].sort((a,b)=>(BACK[b[0].no]?1:0)-(BACK[a[0].no]?1:0)||a[1]-b[1]));return G;}
const flat=()=>{const G=grouped();return GORD.flatMap(g=>G[g].map(x=>x[0].no));};
const itemOf=no=>needsNow().find(x=>x[0].no===no);
const whenOpts=()=>[['In 1 hour',r5(NOW+1)],['In 2 hours',r5(NOW+2)],['After lunch',NOW<12.5?13:r5(NOW+3)],['End of day',Math.max(16.5,r5(NOW+.5))],['Tomorrow morning',32]];
const freeSpots=()=>{const used=new Set(ROS.map(r=>r.spot));return ['T1','T2','T3','B4','B7','B8','W3','W4'].filter(s=>!used.has(s)).slice(0,4);};

/* ---------- actions ---------- */
function snap(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL}));if(UNDO.length>30)UNDO.shift();}
function undo(){if(!UNDO.length)return;const s=JSON.parse(UNDO.pop());ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ=s.SNZ;BACK=s.BACK;CLR=s.CLR;SEL=s.SEL;POP=null;toast('Undone',false);render();}
let TT=0;function toast(msg,can=true){const id=++TT;NT={msg,can,id};setTimeout(()=>{if(NT&&NT.id===id){NT=null;const el=$('.nx-toast');if(el)el.remove();}},6500);}
const SHORT=w=>w.replace(/^Assigned to (\S)\S* (\S).*$/,'Assigned · $1$2').replace(/^Checked in to /,'Checked in · ').replace(/^Logged decline.*$/,'Declined').replace(/^Transferred to /,'To ');
const clr=(ic,what,r)=>CLR.push({at:NOW,ic,what,no:r.no,cust:r.cust});
function snooze(no,until,why){const r=get(no);SNZ[no]={until,why:why||'',at:NOW};delete BACK[no];toast(`${r.cust} snoozed until ${fmt(until)}`);}
function run(no,fn){const L=flat(),i=L.indexOf(no),el=$(`.i3-it[data-sel="${no}"]`);POP=null;
  const go=()=>{fn();const L2=flat();if(!L2.includes(SEL)){SEL=L2.length?L2[Math.min(Math.max(i,0),L2.length-1)]:SEL;}render();};
  if(el){el.classList.add('out');setTimeout(go,190);}else go();}
function applyLog(S,no){const r=get(no),inList=!!itemOf(no),a=appr(r);snap();delete BACK[no];
  r.ct.push([S.kind,fmt(NOW),'Dana Kowalski',S.out,S.note.trim()]);r.ev.push([NOW,KIND[S.kind]==='chat'?'text':KIND[S.kind]==='mail'?'email':KIND[S.kind]==='user'?'person':'call']);
  if(S.out==='Approved'){r.ops.forEach(o=>{if(o[2]===null)o[2]='ok';});if(r.cat==='apr'){r.cat='wrk';r.st='hold';r.stn='Hold tech';r.sub='';r.late=false;r.next='';r.stage=3;r.hold=['tech',TECH[r.tech]||'Technician',0,8];}clr('check',a.op?`Approved ${money(a.op)}`:'Approved',r);toast(`Approved${a.op?' '+money(a.op):''} · back to ${TECH[r.tech]||'the tech'}`);}
  else if(S.out==='Declined'){r.ops.forEach(o=>{if(o[2]===null)o[2]='no';});if(r.cat==='apr'){r.cat='rdy';r.st='declined';r.stn='Declined';r.sub='';r.late=false;r.next='';r.stage=6;r.age='0m';r.hold=['writer','Dana Kowalski',0,2];}clr('x','Logged decline',r);toast('Declined · now ready to release');}
  else if(inList){const until=S.out==='Will call back'?S.when:r5(NOW+FOLLOW[S.out]);snooze(no,until,S.out==='Will call back'?'Said they’d call back':S.out);}
  else toast(`${S.kind} logged on RO-${r.no}`);}
function doRelease(no){const r=get(no);snap();ROS.splice(ROS.indexOf(r),1);D.rel.push({no:r.no,cust:r.cust,at:fmt(NOW),spot:r.spot});delete BACK[no];clr('release','Released',r);toast(`Released RO-${r.no} · ${r.spot} is free`);}
function doAssign(no,code){const r=get(no);snap();r.tech=code;r.hold=['tech',TECH[code],0,8];delete BACK[no];clr('userPlus',`Assigned to ${TECH[code]}`,r);toast(`Assigned to ${TECH[code]}`);}
function doCheckin(no,sp){const r=get(no);snap();Object.assign(r,{cat:'chk',spot:sp,tech:'',age:'0m',st:'hold',stn:'Hold tech',sub:'',hold:['foreman','Ray Owens',0,1]});r.tl.push([NOW,'chk']);delete BACK[no];clr('inArrow',`Checked in to ${sp}`,r);toast(`Checked in to ${sp} · needs a tech`);}
function doNudge(no){const r=get(no);snap();SNZ[no]={until:r5(NOW+1),why:`Nudged ${r.hold[1]}`,at:NOW};delete BACK[no];toast(`Nudged ${r.hold[1]} · back at ${fmt(r5(NOW+1))} if still held`);}
function doXfer(no,role){const r=get(no);snap();const who=role==='tech'?(TECH[r.tech]||'Mike Rodriguez'):HOLDER[role];r.hold=[role,who,0,GOAL[role]];delete BACK[no];if(!itemOf(no))clr('swap',`Transferred to ${ROLE[role][1]}`,r);toast(`Transferred to ${who} · ${ROLE[role][1]}`);}
function act(no){const x=itemOf(no);if(!x)return;SEL=no;const b=x[4];
  if(b==='Call back'||b==='Follow up')openPop('log',no);else if(b==='Release')openPop('release',no);else if(b==='Assign')openPop('assign',no);else if(b==='Check in')openPop('checkin',no);else if(b==='Nudge')run(no,()=>doNudge(no));}
function openPop(type,no){if(type==='snooze'&&!itemOf(no))return;SEL=no;POP={type,no,i:0};if(type==='log')LFP=newLF();if(type==='xfer'){const k=['writer','tech','parts','foreman','warranty','manager'];POP.i=k.indexOf(get(no).hold[0])===0?1:0;}render();}
function popN(){return POP.type==='snooze'?5:POP.type==='assign'?3:POP.type==='xfer'?6:POP.type==='checkin'?freeSpots().length:POP.type==='release'?1:0;}
function popPick(i){const no=POP.no,t=POP.type;
  if(t==='snooze'){const h=whenOpts()[i][1];run(no,()=>{snap();snooze(no,h,'');});}
  else if(t==='assign')run(no,()=>doAssign(no,['MR','LM','PS'][i]));
  else if(t==='xfer')run(no,()=>doXfer(no,['writer','tech','parts','foreman','warranty','manager'][i]));
  else if(t==='checkin')run(no,()=>doCheckin(no,freeSpots()[i]));
  else if(t==='release')run(no,()=>doRelease(no));}
function submitLog(sc){const S=sc==='p'?LFP:LFC,no=sc==='p'?POP.no:SEL;if(!S.out)return;const keep={...S};run(no,()=>applyLog(keep,no));if(sc==='p')LFP=newLF();else LFC=newLF();}
function tick(h){NOW=r5(NOW+h);let n=0;Object.keys(SNZ).forEach(no=>{if(SNZ[no].until<=NOW+1e-6){BACK[no]={at:SNZ[no].at,why:SNZ[no].why};delete SNZ[no];n++;}});if(n)toast(`${n} back from snooze`,false);render();}
function clearAll(){snap();for(let p=0;p<6;p++){const N=needsNow();if(!N.length)break;N.forEach(([r,_,__,___,b])=>{const no=r.no;
  if(b==='Release'){ROS.splice(ROS.indexOf(r),1);D.rel.push({no,cust:r.cust,at:fmt(NOW),spot:r.spot});clr('release','Released',r);}
  else if(b==='Assign'){r.tech='LM';r.hold=['tech',TECH.LM,0,8];clr('userPlus','Assigned to Luis Martinez',r);}
  else if(b==='Check in'){const sp=freeSpots()[0];Object.assign(r,{cat:'chk',spot:sp,tech:'',age:'0m',st:'hold',stn:'Hold tech',hold:['foreman','Ray Owens',0,1]});clr('inArrow',`Checked in to ${sp}`,r);}
  else if(b==='Nudge')SNZ[no]={until:r5(NOW+1),why:`Nudged ${r.hold[1]}`,at:NOW};
  else{r.ct.push(['Call',fmt(NOW),'Dana Kowalski','Left voicemail',''] );SNZ[no]={until:r5(NOW+2),why:'Left voicemail',at:NOW};}
  delete BACK[no];});}
  if(!get(SEL))SEL=ROS[0].no;POP=null;TOP0=true;toast('Demo · worked through the whole list');render();}
function reset(){const s=JSON.parse(INIT);ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ={};BACK={};CLR=JSON.parse(JSON.stringify(CLR0));UNDO=[];NT=null;POP=null;NOW=T0;SEL='37590';KB=false;OPEN={snz:false,clr:false};TOP0=true;render();}

/* ---------- the log form (popover and the Inbox composer share it) ---------- */
function follow(S,r){if(!S.out)return ['','Pick an outcome'];
  if(S.out==='Approved'){const a=appr(r);return ['ok',a.op?`Approves ${money(a.op)} open and clears the item`:'Logs it and clears the item'];}
  if(S.out==='Declined')return ['no','Declines what’s open — the RO moves to Ready to release'];
  if(!itemOf(r.no))return ['','Logs it on the RO'];
  if(S.out==='Will call back')return ['snz',`Back in the list at ${fmt(S.when)}`];
  const h=FOLLOW[S.out];return ['snz',`Back in the list at ${fmt(r5(NOW+h))} · ${h} h`];}
function logForm(S,sc,r){const f=follow(S,r),ic=f[0]==='snz'?I.clock:f[0]==='ok'?I.check:f[0]==='no'?I.x:'';
  const kinds=`<div class="lf-r"><span class="lbl">Log</span>${['Call','Text','Email','In person'].map(k=>`<button class="tg-chip${S.kind===k?' on':''}" data-lf-kind="${k}">${I[KIND[k]]}${k}</button>`).join('')}</div>`;
  const outs=`<div class="lf-r"><span class="lbl">Outcome</span>${OUTS.map((k,i)=>`<button class="tg-chip${S.out===k?' on':''}" data-lf-out="${k}">${sc==='p'?`<span class="px-kbd">${i+1}</span>`:''}${k}</button>`).join('')}</div>`;
  const when=S.out==='Will call back'&&itemOf(r.no)?`<div class="lf-r lf-when"><span class="lbl">When did they say?</span>${whenOpts().map(([l,h])=>`<button class="tg-chip${S.when===h?' on':''}" data-lf-when="${h}" title="${l}">${fmt(h)}</button>`).join('')}</div>`:'';
  const ta=`<textarea rows="1" data-lf-note placeholder="Note — e.g. approved $540 for op 2">${esc(S.note)}</textarea>`;
  const go=`<button class="px-btn px-btn--primary px-btn--sm" data-lf-go${S.out?'':' disabled'}>Log it<span class="px-kbd">↵</span></button>`;
  const fu=`<span class="lf-fu ${f[0]}">${ic}<span>${f[1]}</span></span>`;
  return sc==='p'?`<div class="lf" data-lf="p">${kinds}${outs}${when}${ta}<div class="lf-r lf-f">${fu}${go}</div><div class="lf-hint"><span><span class="px-kbd">1</span>–<span class="px-kbd">6</span> outcome</span><span><span class="px-kbd">N</span> note</span><span><span class="px-kbd">Esc</span> close</span></div></div>`
   :`<div class="lf" data-lf="c">${kinds.replace('<span class="lbl">Log</span>','<span class="lbl">Log</span>')}${outs}${when}<div class="lf-r lf-nf">${ta}${fu}${go}</div></div>`;}

/* ---------- popovers ---------- */
function popHtml(){if(!POP)return '';const r=get(POP.no);if(!r)return '';const head=(k)=>`<div class="nx-ph"><span class="k">${k}</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>`;
  const mi=(i,inner)=>`<button class="px-menu__item${POP.i===i?' is-hover':''}" data-pick-i="${i}"><span class="px-kbd">${i+1}</span>${inner}</button>`;
  const ft=t=>`<div class="ft">${t}</div>`;
  if(POP.type==='log')return `<div class="nx-pop px-pop">${head('Log a contact')}${logForm(LFP,'p',r)}</div>`;
  if(POP.type==='snooze')return `<div class="nx-pop px-pop menu">${head('Snooze until')}${whenOpts().map(([l,h],i)=>mi(i,`${l}<span class="px-menu__meta">${fmt(h)}</span>`)).join('')}${ft('Comes back at the top of its group.')}</div>`;
  if(POP.type==='assign'){const load=c=>ROS.filter(x=>x.tech===c&&(x.cat==='wrk'||x.cat==='chk')).length;return `<div class="nx-pop px-pop menu">${head('Assign')}${['MR','LM','PS'].map((c,i)=>mi(i,`<span class="px-av">${c}</span>${TECH[c]}<span class="px-menu__meta">${load(c)} on the yard</span>`)).join('')}${ft('Clears the item. The tech sees it on their Console.')}</div>`;}
  if(POP.type==='xfer'){const ks=['writer','tech','parts','foreman','warranty','manager'];return `<div class="nx-pop px-pop menu">${head('Transfer to')}${ks.map((k,i)=>mi(i,`<span class="tg-role">${ROLE[k][0]}</span>${ROLE[k][1]}<span class="px-menu__meta">${r.hold[0]===k?'has it now':k==='tech'?(TECH[r.tech]||'—'):HOLDER[k]}</span>`)).join('')}${ft(`Held ${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'} by ${esc(r.hold[1])} — the clock restarts.`)}</div>`;}
  if(POP.type==='checkin')return `<div class="nx-pop px-pop menu">${head('Check in to')}${freeSpots().map((s,i)=>mi(i,`${ZONE(s)}<span class="px-menu__meta px-id">${s}</span>`)).join('')}${ft('Then it moves to Ready to go → Assign.')}</div>`;
  if(POP.type==='release')return `<div class="nx-pop px-pop menu">${head('Release')}<div class="card"><div>${I.keyTag}Key tag <span class="px-id">1${r.no.slice(-2)}</span> back on the board</div><div>${I.pin}${ZONE(r.spot)} <span class="px-id">${r.spot}</span> frees up</div><div>${I.check}Moves to Released today</div></div><div class="acts"><button class="px-btn px-btn--sm" data-close>Cancel<span class="px-kbd">Esc</span></button><button class="px-btn px-btn--primary px-btn--sm" data-pick-i="0">${I.release}Release<span class="px-kbd">↵</span></button></div></div>`;
  return '';}

/* ---------- left: Needs action ---------- */
function inboxList(){const G=grouped(),L=flat(),r=get(SEL);
  const item=([x,_,icn,why,btn])=>{const on=x.no===SEL,k=on&&KB;return `<div class="i3-it${on?' on':''}${k?' kb':''}" data-sel="${x.no}" data-spot="${x.spot}">${x.late?'<i class="dot"></i>':''}<span class="gi">${I[icn]}</span><span class="t"><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b>${BACK[x.no]?`<span class="nx-back">${I.clock}Back</span>`:''}${spot(x.spot)}</span><span class="w${x.late&&!BACK[x.no]?' late':''}">${esc(why)}</span><button class="px-btn px-btn--sm px-btn--icon px-btn--ghost nx-snz" data-pop="snooze" data-no="${x.no}" title="Snooze  S">${I.clock}</button><button class="px-btn px-btn--sm${btn==='Release'?' px-btn--primary':''}" data-act="${x.no}">${btn}${k?'<span class="px-kbd">↵</span>':''}</button></div>`;};
  const sn=Object.keys(SNZ).map(no=>({no,...SNZ[no]})).filter(s=>get(s.no)).sort((a,b)=>a.until-b.until);
  const arr=ROS.filter(x=>x.cat==='arr'&&etaH(x)-NOW>1.5);
  const cleared=`<div class="nx-sec${OPEN.clr?' open':''}" data-open="clr">${I.chevR}<span>Cleared today</span><span class="n">${CLR.length}</span></div>${OPEN.clr?`<div class="nx-rows">${CLR.slice().reverse().map(c=>`<div class="nx-row done"${get(c.no)?` data-sel="${c.no}" style="cursor:pointer"`:''} title="${esc(c.what)}"><time>${fmt(c.at)}</time><span class="tg-ro">${c.no}</span><b>${esc(c.cust)}</b><small>${I[c.ic]}${esc(SHORT(c.what))}</small></div>`).join('')}</div>`:''}`;
  let body;
  if(!L.length){const up=[...sn.map(s=>({t:s.until,html:`<time>${fmt(s.until)}</time><span class="tg-ro">${s.no}</span><b>${esc(get(s.no).cust)}</b><small>${I.clock}${esc(s.why||'Snoozed by hand')}</small>`,no:s.no})),...arr.map(x=>({t:etaH(x),html:`<time>~${x.age}</time><span class="tg-ro">${x.no}</span><b>${esc(x.cust)}</b><small>${I.inArrow}Arriving · ${x.spot}</small>`,no:x.no}))].sort((a,b)=>a.t-b.t).slice(0,6);
    body=`<div class="nx-empty"><div class="ring">${I.check}</div><h3>All caught up</h3><p>Nothing needs you right now.</p>${up.length?`<div class="nx-up"><div class="h">Coming up</div>${up.map(u=>`<div class="nx-row" data-sel="${u.no}">${u.html}</div>`).join('')}</div>`:''}</div>${cleared}`;}
  else body=GORD.filter(g=>G[g].length).map(g=>`<div class="i3-grp">${g}<span>${G[g].length}</span></div>`+G[g].map(item).join('')).join('')
    +(sn.length?`<div class="nx-sec${OPEN.snz?' open':''}" data-open="snz">${I.chevR}<span>Snoozed</span><span class="n">${sn.length}</span><span class="m">next back ${fmt(sn[0].until)}</span></div>${OPEN.snz?`<div class="nx-rows">${sn.map(s=>`<div class="nx-row" data-sel="${s.no}"><time>${fmt(s.until)}</time><span class="tg-ro">${s.no}</span><b>${esc(get(s.no).cust)}</b><small>${esc(s.why||'Snoozed by hand')}</small><button class="px-btn px-btn--sm px-btn--ghost" data-wake="${s.no}">Wake</button></div>`).join('')}</div>`:''}`:'')+cleared;
  const x=itemOf(SEL);
  const out=L.length&&!L.includes(SEL)&&r?`<div class="ib-out">${SNZ[SEL]?`<b>RO-${r.no}</b> is snoozed until ${fmt(SNZ[SEL].until)}.`:`Showing <b>RO-${r.no} · ${esc(r.cust)}</b> — nothing waiting on it.`}</div>`:'';
  const keys=`<div class="nx-keys"><span><span class="px-kbd">J</span><span class="px-kbd">K</span>move</span>${x?`<span><span class="px-kbd">↵</span><b>${x[4]}</b></span>`:''}<span><span class="px-kbd">S</span>snooze</span><span><span class="px-kbd">T</span>transfer</span><span class="sp"></span><button data-help title="All keys"><span class="px-kbd">?</span>more</button></div>`;
  const nt=NT?`<div class="nx-toast"><span>${esc(NT.msg)}</span>${NT.can&&UNDO.length?`<button data-nundo>Undo<span class="px-kbd">Ctrl Z</span></button>`:''}</div>`:'';
  return `<div class="i3-list"><div class="i3-lh">Needs action<span class="n">${L.length}</span><button class="nx-done" data-open="clr">${I.check}${CLR.length} cleared today</button></div><div class="i3-scroll">${body}</div>${out}${keys}${nt}</div>`;}

/* ---------- view 1 · Inbox (conversation + composer) ---------- */
function vInbox(r){const a=appr(r);
  const thread=r.ct.map(c=>`<div class="i3-m"><span class="gi">${I[KIND[c[0]]]}</span><div class="bd"><div class="hd"><b>${esc(c[0])}</b><span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span><span style="color:var(--ink-3)">${esc(c[2])}</span><time>${esc(c[1])}</time></div>${c[4]?`<p>${esc(c[4])}</p>`:''}</div></div>`).join('');
  const sz=SNZ[r.no]?`<div class="i3-m sys"><span class="gi">${I.clock}</span><div class="bd"><div class="hd">Snoozed until <b style="color:var(--ink)">${fmt(SNZ[r.no].until)}</b>${SNZ[r.no].why?' · '+esc(SNZ[r.no].why):''}<time>${fmt(SNZ[r.no].at)}</time></div></div></div>`:'';
  return `<div class="i3-main"><div class="i3-top"><div class="r1"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2>
   <div class="r2">${spot(r.spot)}${ticks(r)}<span style="display:inline-flex;gap:6px;align-items:center">${st(r)}</span>${held(r)}<span style="margin-left:auto;display:flex;gap:8px"><button class="px-btn px-btn--sm" data-pop="xfer" data-no="${r.no}">${I.swap}Transfer…</button><button class="px-btn px-btn--sm">Open RO</button></span></div></div>
   <div class="i3-thread"><span class="i3-day">This RO · calls, texts, approvals and transfers</span>${thread||'<div class="i3-m sys"><span class="gi">'+I.phone+'</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>'}${sz}
    <div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">With <b style="color:var(--ink)">${esc(r.hold[1])}</b> · ${ROLE[r.hold[0]][1]}<time>${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'}</time></div></div></div>
    <div class="i3-appr"><div class="h">${I.check}Approvals<span>Approved ${money(a.ok)} · open ${money(a.op)}${a.no?' · declined '+money(a.no):''}</span></div>${r.ops.map((o,i)=>`<div class="i3-op"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}">Approve</button><button class="${o[2]==='part'?'on':''}">Partly</button><button class="${o[2]==='no'?'on no':''}">Decline</button></span>`}</div>`).join('')}</div>
   </div>
   <div class="i3-comp">${logForm(LFC,'c',r)}</div></div>`;}
''' + DESK_YARD + SEARCH + r'''
/* ---------- page ---------- */
const HELPK=[['List',[['Next item','J','↓'],['Previous item','K','↑'],['Do the item’s button','↵'],['Snooze…','S'],['Log a call or text','C'],['Transfer…','T'],['Undo','Ctrl','Z']]],['In a popover',[['Pick outcome or option','1','6'],['Write a note','N'],['Confirm','↵'],['Close','Esc']]],['Page',[['Inbox · Desk · Yard','1','3'],['Search','/'],['This list','?']]]];
const RAIL=['inbox','console','triage','ros','|','foreman','warranty','manager','parts','|','timelog','fixes','career'];
function helpHtml(){const col=gs=>`<div class="nx-kcol">${gs.map(([g,rows])=>`<div class="nx-kg">${g}</div>${rows.map(([l,...k])=>`<div class="nx-k">${l}<span class="ks">${k.map((x,i)=>`${i&&(l.includes('·')||l.startsWith('Pick'))?'–':''}<span class="px-kbd">${x}</span>`).join('')}</span></div>`).join('')}`).join('')}</div>`;
  return `<div class="px-scrim nx-help" data-help-close><div class="px-modal"><div class="px-modal__h"><div><h2>Keyboard</h2><p>Works anywhere on Triage when you’re not typing.</p></div><button class="px-btn px-btn--icon px-btn--ghost" data-help-close aria-label="Close">${I.x}</button></div><div class="px-modal__b"><div class="nx-kgrid">${col([HELPK[0]])}${col([HELPK[1],HELPK[2]])}</div></div><div class="px-modal__f"><span class="px-modal__hint"><span class="px-kbd">?</span> or <span class="px-kbd">Esc</span> to close</span></div></div></div>`;}
let TOP0=false;
function render(){if(!get(SEL))SEL=flat()[0]||ROS[0].no;const r=get(SEL);
  const sc=$('.i3-scroll'),keep=sc&&!TOP0&&flat().length?sc.scrollTop:0;TOP0=false;
  const facts=`<span><b>${ROS.length}</b> on the yard</span>·<span><b>${ROS.filter(r=>r.cat==='apr').length}</b> awaiting approval</span>·<span><b>${ROS.filter(r=>r.cat==='rdy').length}</b> ready to release</span>·<span class="w"><b>${ROS.filter(r=>r.late).length}</b> late</span>`;
  const views=`<div class="px-seg tg-views" role="tablist">${VIEWS.map(([k,ic,l],i)=>`<button role="tab" class="${TAB===k?'is-on':''}" data-view="${k}" title="${l} view (${i+1})">${I[ic]}${l}</button>`).join('')}</div>`;
  const search=`<span class="tg-srch${SRCH?' open':''}"><input class="px-input" placeholder="Search ROs"><span class="px-kbd">Esc</span><button class="px-btn px-btn--icon px-btn--ghost" data-search aria-label="Search">${I.search}<span class="tip">Search <span class="px-kbd" style="position:static;opacity:1;transform:none">/</span></span></button></span>`;
  const main=TAB==='inbox'?vInbox(r):TAB==='desk'?vDesk(r):vYard(r);
  mock.innerHTML=`<div class="tg-app"><aside class="tg-rail"><span class="lg">${LOGO}</span><a>${I.sidebar}</a><a>${I.search}</a><span class="ck"><i></i></span><span class="sep"></span>${RAIL.map(k=>k==='|'?'<span class="sep"></span>':`<a class="${k==='triage'?'is-on':''}">${I[k]}</a>`).join('')}<span class="sp"></span><a>${I.gear}</a><span class="px-av px-av--md px-av--me">MR</span></aside>
   <section class="tg-panel"><header class="tg-head${SRCH?' sr-on':''}"><h1>Triage</h1><span class="tg-facts">${facts}</span>${views}<span class="tg-hsep"></span>${search}<button class="px-btn px-btn--primary">${I.plus}New RO</button><div class="sr-pop">${SRCH?srPop():''}</div></header>
   <div class="tg-body ib v-${TAB}">${inboxList()}<div class="ib-main">${main}</div>${popHtml()}</div></section></div>${HELP?helpHtml():''}`;
  const sc2=$('.i3-scroll');if(sc2){sc2.scrollTop=keep;const el=$('.i3-it.on',sc2);if(el&&KB){if(el.offsetTop<sc2.scrollTop+30)sc2.scrollTop=el.offsetTop-40;else if(el.offsetTop+el.offsetHeight>sc2.scrollTop+sc2.clientHeight-20)sc2.scrollTop=el.offsetTop+el.offsetHeight-sc2.clientHeight+40;}}
  if(POP){const p=$('.nx-pop'),body=$('.tg-body'),it=$(`.i3-it[data-sel="${POP.no}"]`);if(p){let top=16;if(it){top=(it.getBoundingClientRect().top-body.getBoundingClientRect().top)/scale-6;}top=Math.max(12,Math.min(top,body.offsetHeight-p.offsetHeight-12));p.style.top=top+'px';}}
  $('[data-clock]').textContent=fmt(NOW);
  if(SRCH){const i=$('.tg-srch input');i.value=QV;i.focus();i.setSelectionRange(QV.length,QV.length);}}
function setTab(t){TAB=t;MOVE=false;TOAST='';render();}
$$('[data-theme-set]').forEach(b=>b.onclick=()=>{root.dataset.theme=b.dataset.themeSet;$$('[data-theme-set]').forEach(x=>x.classList.toggle('is-on',x===b));});
$$('[data-tt]').forEach(b=>b.onclick=()=>tick(+b.dataset.tt));
$('[data-reset]').onclick=reset; $('[data-caught]').onclick=clearAll;
let YUNDO=null;
mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s);
  if(HELP){if(q('[data-help-close]')&&(!q('.px-modal')||q('.px-btn'))){HELP=false;render();}return;}
  if(q('[data-help]')){HELP=true;render();return;}
  const vw=q('[data-view]');if(vw){setTab(vw.dataset.view);return;}
  if(q('[data-search]')){SRCH=!SRCH;QV='';render();return;}
  const mv=q('[data-move]');if(mv){MOVE=mv.dataset.move==='1';TOAST='';render();return;}
  const fr=q('[data-free]');if(fr){const r=get(SEL);YUNDO=[r.no,r.spot];TOAST=`Moved RO-${r.no} from ${r.spot} to ${fr.dataset.free}`;r.spot=fr.dataset.free;MOVE=false;render();return;}
  if(q('[data-undo]')&&YUNDO){get(YUNDO[0]).spot=YUNDO[1];YUNDO=null;TOAST='';render();return;}
  if(q('[data-close]')){POP=null;render();return;}
  const lf=q('[data-lf]');if(lf){const S=lf.dataset.lf==='p'?LFP:LFC,r=get(lf.dataset.lf==='p'?POP.no:SEL);
    const k=q('[data-lf-kind]'),o=q('[data-lf-out]'),w=q('[data-lf-when]');
    if(k){S.kind=k.dataset.lfKind;render();return;} if(o){S.out=o.dataset.lfOut;if(S.out==='Will call back'&&S.when==null)S.when=r5(NOW+2);render();return;} if(w){S.when=+w.dataset.lfWhen;render();return;}
    if(q('[data-lf-go]')){submitLog(lf.dataset.lf);return;} return;}
  const pk=q('[data-pick-i]');if(pk&&POP){popPick(+pk.dataset.pickI);return;}
  let closed=false;if(POP&&!q('.nx-pop')){POP=null;closed=true;}
  const a=q('[data-act]');if(a){KB=false;act(a.dataset.act);return;}
  const pp=q('[data-pop]');if(pp){openPop(pp.dataset.pop,pp.dataset.no||SEL);return;}
  const wk=q('[data-wake]');if(wk){snap();const no=wk.dataset.wake;BACK[no]={at:SNZ[no].at,why:SNZ[no].why};delete SNZ[no];SEL=no;toast('Back in the list');render();return;}
  const op=q('[data-open]');if(op){OPEN[op.dataset.open]=!OPEN[op.dataset.open];render();if(op.dataset.open==='clr'&&OPEN.clr){const s=$('.i3-scroll'),c=$('.nx-sec[data-open="clr"]',s);if(s&&c)s.scrollTop=c.offsetTop-60;}return;}
  if(q('[data-nundo]')){undo();return;}
  const s=q('[data-sel]');if(s&&!q('.px-btn')&&!MOVE){SEL=s.dataset.sel;KB=false;if(s.hasAttribute('data-pick')){SRCH=false;QV='';}TOAST='';render();return;}
  if(closed)render();});
mock.addEventListener('input',e=>{if(e.target.matches('.tg-srch input')){QV=e.target.value;$('.sr-pop').innerHTML=srPop();}
  if(e.target.matches('[data-lf-note]')){const sc=e.target.closest('[data-lf]').dataset.lf;(sc==='p'?LFP:LFC).note=e.target.value;}});
mock.addEventListener('mouseover',e=>{const it=e.target.closest('.i3-it');$$('.yd .i2-s.hl').forEach(x=>x.classList.remove('hl'));if(it&&TAB==='yard'){const sp=$(`.yd [data-at="${it.dataset.spot}"]`);if(sp)sp.classList.add('hl');}});
function move(d){const L=flat();if(!L.length)return;KB=true;const i=L.indexOf(SEL);SEL=i<0?L[d>0?0:L.length-1]:L[Math.max(0,Math.min(L.length-1,i+d))];render();}
addEventListener('keydown',e=>{const k=e.key,inF=e.target.matches('input,textarea');
  if(HELP){if(k==='Escape'||k==='?'){HELP=false;render();}return;}
  if(k==='Escape'){if(POP){POP=null;render();}else if(SRCH){SRCH=false;QV='';render();}else if(MOVE){MOVE=false;render();}else if(inF)e.target.blur();return;}
  if(k==='Enter'&&SRCH){const it=$('.sr-pop .it.k[data-sel]');if(it){SEL=it.dataset.sel;SRCH=false;QV='';render();}return;}
  if(POP){if(POP.type==='log'){if(k==='Enter'&&!e.shiftKey){e.preventDefault();submitLog('p');return;}if(inF)return;const n=+k;if(n>=1&&n<=6){LFP.out=OUTS[n-1];if(LFP.out==='Will call back'&&LFP.when==null)LFP.when=r5(NOW+2);render();return;}if(k==='n'){e.preventDefault();$('.nx-pop [data-lf-note]').focus();}return;}
    const N=popN();if(k==='ArrowDown'||k==='j'){e.preventDefault();POP.i=(POP.i+1)%N;render();return;}if(k==='ArrowUp'||k==='k'){e.preventDefault();POP.i=(POP.i-1+N)%N;render();return;}
    if(k==='Enter'){e.preventDefault();popPick(POP.i);return;}const n=+k;if(n>=1&&n<=N){popPick(n-1);return;}return;}
  if(inF){if(k==='Enter'&&!e.shiftKey&&e.target.matches('[data-lf-note]')){e.preventDefault();submitLog('c');}return;}
  if((e.ctrlKey||e.metaKey)&&(k==='z'||k==='Z')){e.preventDefault();undo();return;}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(k==='j'||k==='ArrowDown'){e.preventDefault();move(1);return;}
  if(k==='k'||k==='ArrowUp'){e.preventDefault();move(-1);return;}
  if(k==='Enter'){e.preventDefault();KB=true;act(SEL);return;}
  if(k==='s'){KB=true;openPop('snooze',SEL);return;}
  if(k==='c'){KB=true;openPop('log',SEL);return;}
  if(k==='t'){KB=true;openPop('xfer',SEL);return;}
  if(k==='?'){HELP=true;render();return;}
  if(k==='/'){e.preventDefault();SRCH=true;QV='';render();return;}
  const n=+k;if(n>=1&&n<=3)setTab(VIEWS[n-1][0]);});
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
NOTES = [
 ("Snooze from the outcome", "Left voicemail → back in 2 h · No answer → 1 h · Update given → 4 h · Will call back asks when. Approved and Declined clear the item. S or the clock icon snoozes by hand."),
 ("Keyboard triage", "J/K move, ↵ runs the item’s button, S snooze, C log, T transfer, Ctrl Z undo, ? all keys. After each action the next item is selected."),
 ("Cleared today", "Finished items fade out with Undo. The count sits in the list header; the list starts fresh at midnight."),
 ("All caught up", "When the list is empty: what comes back from snooze, and the next arrival. Arrivals join the list 90 min before they’re due."),
 ("In Parsec", "The snooze is saved on the RO next to its contact entry, so it survives a reload. Cleared today is read from the day’s contacts, releases, assignments and check-ins — nothing new to fill in."),
]
about = '<h2>Needs action<small>Try it: press J, then ↵, then 3, then ↵. Use the shop clock to bring snoozed items back.</small></h2><ul>' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in NOTES) + "</ul>"
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage needs action</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — Needs action</h1>
<div class="wt-clock">Shop clock <b data-clock>10:15</b><button class="px-btn px-btn--sm" data-tt="0.5">+30 min</button><button class="px-btn px-btn--sm" data-tt="2">+2 h</button><button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button></div>
<button class="px-btn px-btn--sm" data-caught>Show all caught up</button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about">{about}</div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
