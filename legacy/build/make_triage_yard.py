# Triage — Yard: drag from the list (or the map) to a free spot, arrival countdown from the call log, spot clash warning.
# Builds on make_triage_xfer.py → contact → needs → inbox → make_triage.py.
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
src = open(f"{B}/make_triage_xfer.py").read().split("\nrep = {")[0]
argv = sys.argv; sys.argv = [argv[0], "/dev/null"]
ns = {"__file__": f"{B}/make_triage_xfer.py", "__name__": "txr"}
exec(src, ns)
sys.argv = argv
P, tok, bun, DATA, ICO, SI = ns["P"], ns["tok"], ns["bun"], ns["DATA"], ns["ICO"], ns["SI"]
BASE = ns["JS"].rstrip()
assert BASE.endswith("render();"); BASE = BASE[: -len("render();")]

CSS = ns["CSS"] + r'''
/* ---------- yard: drag targets ---------- */
.yd .i2-s[draggable="true"]{cursor:grab;-webkit-user-drag:element;user-select:none}
.yd .i2-s.src{opacity:.35}
.yd.dragging .i2-s[data-drop]{background-image:none;background:var(--accent-tint);box-shadow:inset 0 0 0 1.5px var(--accent-line)}
.yd.dragging .i2-s[data-drop] .l{color:var(--accent-text)}
.yd.dragging .i2-s.over{box-shadow:inset 0 0 0 2px var(--accent);background:color-mix(in srgb,var(--accent-tint) 60%,var(--raised))}
.yd.dragging .i2-s.occ:not(.src),.yd.dragging .i2-s.rsv{opacity:.5}
.ib.v-yard .i3-it[draggable="true"]{cursor:grab}
.ib.v-yard .i3-it.dragsrc{opacity:.45}
.yd-hint{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-3)}
.yd-hint .px-kbd{height:16px;font-size:10.5px}
/* reserved spot for an arrival */
.yd .i2-s.rsv{background:transparent;background-image:none;box-shadow:inset 0 0 0 1.5px var(--border-strong);outline:none;cursor:pointer}
.yd .i2-s.rsv{border:1.5px dashed var(--border-strong);box-shadow:none}
.yd .i2-s.rsv b{color:var(--ink-2)}
.yd .i2-s.rsv small{color:var(--ink-2);font-variant-numeric:tabular-nums;font-weight:500}
.yd .i2-s.rsv.soon small{color:var(--accent-text)}
.yd .i2-s.rsv.late{border-color:var(--warn)}.yd .i2-s.rsv.late small{color:var(--warn)}
/* clash */
.yd .i2-s.clash{box-shadow:0 0 0 1.5px var(--warn),0 2px 6px -3px rgba(0,0,0,.12);background:var(--raised)}
.yd .i2-s.clash b{gap:0;font-size:12px;padding-right:0;white-space:nowrap;overflow:hidden}
.yd .i2-s.clash b em{font-style:normal;color:var(--ink-4);margin:0 2px}
.yd .i2-s.clash small{color:var(--warn);font-weight:500}
.yd .i2-s .cl{width:14px;height:14px;border-radius:50%;background:var(--warn);color:var(--panel);font:700 10px/14px var(--font-sans);text-align:center;font-style:normal;display:inline-block}
.yd-bar.cl{background:var(--warn-tint);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--warn) 35%,transparent);flex-wrap:wrap;padding:8px 10px 8px 16px;row-gap:6px}
.yd-bar.cl .k{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--warn)}
.yd-bar.cl .k .px-ico{width:13px;height:13px}
.yd-bar.cl .txt{color:var(--ink);min-width:0;flex:1}
.yd-bar.cl .btns{flex-basis:100%;display:flex;gap:8px;padding-left:96px}
.yd-bar.cl .txt b{font-weight:600}
.cx-warnbtn{color:var(--warn) !important}
.cx-warnbtn .px-ico{color:var(--warn)}
.yd-bar.coach{background:var(--accent-tint);box-shadow:inset 0 0 0 1px var(--accent-line)}
.yd-bar.coach .k{font-size:12px;font-weight:600;color:var(--accent-text)}
/* arrivals */
.eta-row .hd b{color:var(--ink)}
.eta-q{font-style:italic;color:var(--ink-2)}
'''

JS = BASE + r'''
/* =================== yard layer =================== */
let DRAG=null, CLASH=null;
PEOPLE['Dixie Fleet Services']=[{n:'Ron Pike',r:'Fleet manager',ph:'(910) 555-0148',pref:'Call',ok:true},{n:'Luis Ortega',r:'Driver',ph:'(910) 555-0187',pref:'Text'}];
PEOPLE['Mount Airy Movers']=[{n:'Beth Sloan',r:'Office manager',ph:'(336) 555-0175',pref:'Email',em:'dispatch@mtairymovers.com',ok:true}];
function tweakYard(){const d=get('37641');if(d){d.ct=[['Call','10:05','Dana Kowalski','Update given','Driver says about an hour out — just left Lexington.','Luis Ortega']];d.ev=[[10.08,'call']];}
  const g=get('37420');if(g)g.spot='B2';}
tweakYard();

/* ---------- arrival ETA from the call log ---------- */
const NUMW={a:1,an:1,one:1,two:2,three:3};
function etaFromText(txt,at){if(!txt)return null;const s=txt.toLowerCase();let m;
  if(/half an hour/.test(s))return at+.5;
  if(m=s.match(/(\d+)\s*(?:min|mins|minutes)\b/))return at+(+m[1])/60;
  if(m=s.match(/\b(an?|one|two|three|\d+(?:\.\d+)?)\s*(and a half\s*)?(?:hour|hours|hr|hrs)\b/)){let h=NUMW[m[1]]??+m[1];if(m[2])h+=.5;return at+h;}
  if(m=s.match(/(?:at|by|around|about)\s*(\d{1,2}):(\d{2})/)){let h=+m[1];if(h<7)h+=12;return h+(+m[2])/60;}
  return null;}
const hm=t=>{const m=String(t).match(/^(\d{1,2}):(\d{2})$/);return m?+m[1]+(+m[2])/60:null;};
function parseEta(r){for(let i=r.ct.length-1;i>=0;i--){const c=r.ct[i],at=hm(c[1]);if(at==null)continue;const e=etaFromText(c[4],at);if(e!=null)return {eta:e,src:c};}return {eta:hm(r.booked||r.age)??NOW+2,src:null};}
const etaOf=r=>parseEta(r).eta;
function syncEta(){ROS.forEach(r=>{if(r.cat!=='arr')return;r.booked=r.booked||r.age;r.age=fmt(etaOf(r));});}
const mins=h=>{const m=Math.round(h*60);return m<60?m+' min':dur(m/60);};

/* ---------- spot clashes ---------- */
function clashes(){const by={};ROS.forEach(x=>{(by[x.spot]=by[x.spot]||[]).push(x);});return Object.keys(by).filter(s=>s!=='—'&&by[s].length>1).map(s=>({spot:s,ros:by[s]}));}

/* needs: arrival countdown text + a Fix spot item for each clash */
needs=(orig=>function(){syncEta();let L=orig();
  L=L.map(x=>{const r=x[0];if(r.cat!=='arr')return x;const e=etaOf(r),d=e-NOW,y=x.slice();
    y[3]=d>.25?`Arriving ~${fmt(e)} · in ${mins(d)} · ${r.spot}`:d>0?`Arriving now · ~${fmt(e)} · ${r.spot}`:`Due ${fmt(e)} · ${mins(-d)} late · call the driver`;y[1]=d>.25?5:-1;return y;});
  clashes().forEach(c=>{const pick=c.ros.slice().reverse().find(r=>r.cat!=='arr'&&!L.some(x=>x[0]===r))||c.ros[c.ros.length-1];L=L.filter(x=>x[0]!==pick);const other=c.ros.find(r=>r!==pick);L.push([pick,0,'pin',`Shares ${c.spot} with ${other.no} — which one is there?`,'Fix spot','Ready to go']);});
  return L.sort((a,b)=>a[1]-b[1]);})(needs);
act=(orig=>function(no){const x=itemOf(no);if(x&&x[4]==='Fix spot'){SEL=no;TAB='yard';CLASH=get(no).spot;MOVE=false;POP=null;render();return;}orig(no);})(act);

/* ---------- moving ---------- */
function moveTo(no,spot){const r=get(no);if(!r)return;const from=r.spot,before=clashes().length;snap();r.spot=spot;SEL=no;MOVE=false;CLASH=null;DEMO='';const fixed=clashes().length<before;
  toast(`Moved RO-${no} from ${from} to ${spot}${fixed?' · clash fixed':''}`);render();}

/* ---------- yard view ---------- */
function vYard(r){const by={};ROS.forEach(x=>{(by[x.spot]=by[x.spot]||[]).push(x);});const CL=clashes();
  const tile=id=>{const L=by[id]||[];
    if(L.length>1){const on=L.some(x=>x.no===SEL);return `<button class="i2-s occ clash${on?' tg-sel':''}" data-clash="${id}" data-at="${id}" title="${esc(L.map(x=>x.no+' '+x.cust).join(' · '))}"><span class="l">${id}</span><b>${L.map(x=>x.no.slice(-4)).join('<em>·</em>')}</b><small>${L.length} trucks</small><span class="fl"><i class="cl">!</i></span></button>`;}
    const x=L[0];
    if(x&&x.cat==='arr'){const e=etaOf(x),d=e-NOW;return `<div class="i2-s rsv${x.no===SEL?' tg-sel':''}${d<=0?' late':d<=.25?' soon':''}" data-sel="${x.no}" data-at="${id}" data-drag="${x.no}" draggable="true" title="${esc(x.cust)} · held for this arrival"><span class="l">${id}</span><b>${sq('arr')}${x.no.slice(-4)}</b><small title="ETA ${fmt(e)}">${d>0?(d<1?`in ${Math.round(d*60)}m`:`~${fmt(e)}`):`late ${Math.round(-d*60)}m`}</small></div>`;}
    if(x)return `<div role="button" tabindex="0" class="i2-s occ${x.no===SEL?' tg-sel':''}${MOVE&&x.no!==SEL?' dim':''}" data-sel="${x.no}" data-at="${id}" data-drag="${x.no}" draggable="true" title="${esc(x.cust)}"><span class="l">${id}</span><b>${sq(x.cat)}${x.no.slice(-4)}${x.live?'<i class="tg-live"></i>':''}</b><small>${esc(x.cust)}</small><span class="fl">${x.warr?I.warranty:''}${x.late?'<i class="lt"></i>':''}</span></div>`;
    return MOVE?`<button class="i2-s free" data-free="${id}" data-drop="${id}" data-at="${id}"><span class="l">${id}</span></button>`:`<div class="i2-s" data-at="${id}" data-drop="${id}"><span class="l">${id}</span></div>`;};
  const grid=(ids,cols)=>`<div class="i2-g" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${ids.map(tile).join('')}</div>`;
  const lot=(row,n)=>Array.from({length:n},(_,i)=>row+(i+1));
  let bar;const cl=CLASH&&CL.find(c=>c.spot===CLASH);
  if(cl)bar=`<div class="yd-bar cl"><span class="k">${I.flag}Spot clash</span><span class="txt">Two ROs claim <b>${ZONE(cl.spot)} ${cl.spot}</b> — ${cl.ros.map(x=>`<b>${x.no}</b> ${esc(x.cust)}`).join(' and ')}. Which one is really there?</span><span class="btns">${cl.ros.map(x=>`<button class="px-btn px-btn--sm" data-keep="${x.no}" title="The other one gets a new spot">${x.no} is here</button>`).join('')}<button class="px-btn px-btn--sm px-btn--ghost" data-clash-x>Later</button></span></div>`;
  else if(MOVE)bar=`<div class="yd-bar mv"><span class="k">Move</span><span><b style="font-weight:500">RO-${r.no} · ${esc(r.cust)}</b> from ${ZONE(r.spot)} <span class="px-id">${r.spot}</span> — pick a free spot</span><span class="sp"></span><button class="px-btn px-btn--sm" data-move="0">Cancel<span class="px-kbd">Esc</span></button></div>`;
  else if(DEMO==='drag')bar=`<div class="yd-bar coach"><span class="k">Try it</span><span>Drag <b style="font-weight:500">${esc(r.cust)}</b> from the list — or any truck on the map — onto a free spot.</span><span class="sp"></span><span class="yd-hint">or press <span class="px-kbd">M</span></span></div>`;
  else bar=`<div class="yd-bar">${sq(r.cat)}<span class="tg-ro">RO-${r.no}</span><h3>${esc(r.cust)}</h3><span class="at">${I.pin}${ZONE(r.spot)}<b>${r.spot}</b></span>${r.cat==='arr'?`<span class="stt">${I.inArrow}${etaOf(r)>NOW?'arriving ~'+fmt(etaOf(r)):'due '+fmt(etaOf(r))}</span>`:`<span class="stt">${st(r)}</span>`}<span class="sp"></span>${CL.length?`<button class="px-btn px-btn--sm cx-warnbtn" data-clash="${CL[0].spot}">${I.flag}${CL.length} spot clash${CL.length>1?'es':''}</button>`:''}<span style="font-size:12px;color:var(--ink-3);white-space:nowrap">Key tag <span class="px-id" style="color:var(--ink-2)">1${r.no.slice(-2)}</span></span><button class="px-btn px-btn--sm" data-move="1">${I.pin}Move…<span class="px-kbd">M</span></button></div>`;
  return `<div class="yd">${bar}
   <div class="i2-row"><section class="i2-z" style="flex:1.55"><div class="i2-zh">Shop floor<small>UpTime · awning · bays 1–8</small></div>${grid(['UP','B1','B2','B3','B4','AW1','B5','B6','B7','B8'],5)}</section>
   <section class="i2-z" style="flex:1"><div class="i2-zh">Check-in<small>arrival line · triage lanes</small></div>${grid(['W1','W2','W3','W4'],4)}<div style="height:6px"></div>${grid(['T1','T2','T3'],4)}</section></div>
   <section class="i2-z"><div class="i2-zh">Parking lot<small>C · waiting on customers &nbsp;·&nbsp; D · ready to release &nbsp;·&nbsp; E · overflow</small></div>${grid(lot('C',10),10)}<div style="height:6px"></div>${grid(lot('D',10),10)}<div style="height:6px"></div>${grid(lot('E',10),10)}</section>
   <div class="i2-row"><section class="i2-z" style="flex:1"><div class="i2-zh">Warranty<small>on the yard</small></div><div style="display:flex;flex-direction:column;gap:6px">${ROS.filter(x=>x.warr).map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer" data-sel="${x.no}"><span class="tg-ro">${x.no}</span><b style="font-weight:500;white-space:nowrap">${esc(x.cust)}</b>${spot(x.spot)}<span style="margin-left:auto;color:var(--ink-3);font-size:12px;white-space:nowrap">${x.warr[0]}% · ${x.warr[1]} missing</span><span style="width:60px" class="i6-wb"><i style="width:${x.warr[0]}%"></i></span></div>`).join('')}</div></section>
   <section class="i2-z" style="flex:.8"><div class="i2-zh">Released today<small>${D.rel.length}</small></div><div style="display:flex;flex-direction:column;gap:6px">${D.rel.map(x=>`<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span class="tg-ro">${x.no}</span><b style="font-weight:500">${esc(x.cust)}</b><span style="margin-left:auto;color:var(--ink-3);font-size:12px">${x.at}</span></div>`).join('')}</div></section></div>
   <div class="i2-leg">${ORDER.map(k=>`<span>${sq(k)}${CAT[k][0]}</span>`).join('')}<span><i style="width:14px;height:10px;border:1.5px dashed var(--border-strong);border-radius:3px;display:inline-block;box-sizing:border-box"></i>Held for an arrival</span><span><i class="cl" style="width:12px;height:12px;border-radius:50%;background:var(--warn);display:inline-block"></i>Spot clash</span><span><i class="tg-live"></i>On the clock</span><span style="color:var(--accent-text)">${I.warranty}Warranty</span><span class="yd-hint" style="margin-left:auto">Drag a truck onto a free spot · <span class="px-kbd">M</span> move</span></div>
  </div>`;}

/* ---------- inbox: ETA line for arrivals ---------- */
vInbox=(orig=>function(r){let h=orig(r);if(r.cat!=='arr')return h;const {eta,src}=parseEta(r),d=eta-NOW;
  const row=`<div class="i3-m sys eta-row"><span class="gi">${I.inArrow}</span><div class="bd"><div class="hd">ETA <b>~${fmt(eta)}</b> · ${src?`from ${esc(src[2].split(' ')[0])}’s ${src[0].toLowerCase()} at ${src[1]}: <span class="eta-q">“${esc((src[4].match(/[^.—]*(?:min|hour|hr|\d:\d\d)[^.—]*/i)||[src[4]])[0].trim())}”</span>`:`booked time · no call yet`}<time>${d>0?'in '+mins(d):mins(-d)+' late'}</time></div></div></div>`;
  return h.replace('<div class="i3-appr cx-card">',row+'<div class="i3-appr cx-card">');})(vInbox);
follow=(orig=>function(S,r){if(r&&r.cat==='arr'&&S.note){const e=etaFromText(S.note,NOW);if(e!=null)return ['snz',`ETA becomes ~${fmt(e)}`];}return orig(S,r);})(follow);
applyLog=(orig=>function(S,no){const r=get(no),arr=r&&r.cat==='arr',e=arr?etaFromText(S.note,NOW):null;orig(S,no);if(arr){delete SNZ[no];toast(e!=null?`ETA updated to ~${fmt(e)} from your note`:`${S.kind} logged on RO-${no}`);}})(applyLog);

/* ---------- wiring ---------- */
render=(orig=>function(){syncEta();orig();if(TAB==='yard')$$('.i3-it').forEach(it=>it.setAttribute('draggable','true'));})(render);
snap=function(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL,APR,XF}));if(UNDO.length>30)UNDO.shift();};
reset=(orig=>function(){CLASH=null;DRAG=null;orig();tweakYard();DEMO='';render();})(reset);
$('[data-reset]').onclick=()=>reset();
demo=function(k){reset();DEMO=k;KB=false;MOVE=false;
  if(k==='drag'){TAB='yard';SEL='37590';}
  if(k==='eta'){TAB='inbox';SEL='37641';}
  if(k==='etay'){TAB='yard';SEL='37641';}
  if(k==='clash'){TAB='yard';SEL='37420';CLASH='B2';}
  render();};
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));
mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  const fr=q('[data-free]');if(fr){moveTo(SEL,fr.dataset.free);return stop();}
  const cl=q('[data-clash]');if(cl){CLASH=cl.dataset.clash;TAB='yard';MOVE=false;render();return stop();}
  if(q('[data-clash-x]')){CLASH=null;render();return stop();}
  const kp=q('[data-keep]');if(kp){const c=clashes().find(c=>c.spot===CLASH);if(c){const other=c.ros.find(x=>x.no!==kp.dataset.keep);SEL=other.no;MOVE=true;CLASH=null;toast(`${kp.dataset.keep} stays in ${c.spot} — pick a spot for ${other.no}`,false);}render();return stop();}
  if(q('[data-move="1"]')){CLASH=null;}
},true);
mock.addEventListener('dragstart',e=>{const d=e.target.closest&&e.target.closest('[data-drag],.ib.v-yard .i3-it');if(!d)return;const no=d.dataset.drag||d.dataset.sel;DRAG=no;try{e.dataTransfer.setData('text/plain',no);e.dataTransfer.effectAllowed='move';}catch(_){}
  const yd=$('.yd');if(yd)yd.classList.add('dragging');$$(`.yd [data-drag="${no}"]`).forEach(x=>x.classList.add('src'));if(d.classList.contains('i3-it'))d.classList.add('dragsrc');});
mock.addEventListener('dragover',e=>{const t=e.target.closest&&e.target.closest('[data-drop]');if(t&&DRAG){e.preventDefault();try{e.dataTransfer.dropEffect='move';}catch(_){}$$('.yd .over').forEach(x=>{if(x!==t)x.classList.remove('over');});t.classList.add('over');}});
mock.addEventListener('dragleave',e=>{const t=e.target.closest&&e.target.closest('[data-drop]');if(t&&!t.contains(e.relatedTarget))t.classList.remove('over');});
mock.addEventListener('drop',e=>{const t=e.target.closest&&e.target.closest('[data-drop]');if(t&&DRAG){e.preventDefault();const no=DRAG;DRAG=null;moveTo(no,t.dataset.drop);}});
mock.addEventListener('dragend',()=>{DRAG=null;const yd=$('.yd');if(yd)yd.classList.remove('dragging');$$('.over,.src,.dragsrc').forEach(x=>x.classList.remove('over','src','dragsrc'));});
mock.addEventListener('input',e=>{const t=e.target;if(!t.matches('[data-lf-note]'))return;const lf=t.closest('[data-lf]'),r=get(lf.dataset.lf==='p'?POP.no:SEL);if(!r||r.cat!=='arr')return;const fu=lf.querySelector('.lf-fu span');const e2=etaFromText(t.value,NOW);if(fu&&e2!=null)fu.textContent=`ETA becomes ~${fmt(e2)}`;});
addEventListener('keydown',e=>{const k=e.key,inF=e.target.matches('input,textarea,select');
  if(k==='Escape'&&CLASH&&!POP){CLASH=null;render();e.stopPropagation();return;}
  if(TAB==='yard'&&!POP&&!inF&&!HELP&&!TPLED&&(k==='m'||k==='M')&&!e.ctrlKey&&!e.metaKey){MOVE=true;CLASH=null;render();e.stopPropagation();}
},true);
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
NOTES = [
 ("1 · Drag to a spot", "In Yard view, drag a list item or a truck on the map onto any free spot. Free spots light up while you drag; taken and held spots don’t take it. Undo is in the message. Keyboard: M, then click a spot."),
 ("2 · Arrival countdown", "The ETA comes from the last call or text: “40 minutes out”, “about an hour”, “around 11:30”. The list counts down; in the last 15 min it jumps to the top of Coming in; past the ETA it turns amber. The arrival line shows a dashed spot held for each truck."),
 ("3 · Spot clash", "Two ROs on one spot get one split tile with a warning, a Fix spot item in Needs action, and a bar asking which one is really there — the other goes straight to picking a new spot."),
 ("In Parsec", "The ETA is read from the contact log — nothing new to type. Logging “30 minutes out” on an arrival updates it. Moves save to the RO’s spot, the same field Move to spot uses today."),
]
about = '<h2>Yard<small>Use the buttons above the frame, then try the shop clock (+30 min) to watch the arrival count down.</small></h2><ul>' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in NOTES) + "</ul>"
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("drag", "1 · Drag to a spot"), ("eta", "2 · Arrival · Inbox"), ("etay", "2 · Arrival · Yard"), ("clash", "3 · Spot clash")])
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage yard</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — Yard</h1><div class="wt-ideas wt-demo">{demos}</div>
<div class="wt-clock">Shop clock <b data-clock>10:15</b><button class="px-btn px-btn--sm" data-tt="0.5">+30 min</button><button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button></div><button data-caught hidden></button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about">{about}</div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
