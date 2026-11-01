# Triage — Customer contact: outcomes do the next step, text templates, who to call, approval record.
# Builds on make_triage_needs.py (Needs action list) → make_triage_inbox.py → make_triage.py.
import os, sys, json
B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
src = open(f"{B}/make_triage_needs.py").read().split("\nrep = {")[0]
argv = sys.argv; sys.argv = [argv[0], "/dev/null"]
ns = {"__file__": f"{B}/make_triage_needs.py", "__name__": "tnd"}
exec(src, ns)
sys.argv = argv
P, tok, bun, DATA, ICO, SI = ns["P"], ns["tok"], ns["bun"], ns["DATA"], ns["ICO"], ns["SI"]
BASE = ns["JS"].rstrip()
assert BASE.endswith("render();"); BASE = BASE[: -len("render();")]

CSS = ns["CSS"] + r'''
.wt-demo button{display:inline-flex;align-items:center;gap:6px}
/* ---------- who to call ---------- */
.cx-ppl{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch}
.cx-pc{display:flex;align-items:center;gap:10px;padding:7px 8px 7px 10px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--hairline);min-width:0;flex:1 1 300px;max-width:440px;transition:box-shadow .3s}
.cx-pc.sug{box-shadow:inset 0 0 0 1px var(--border-strong);background:var(--canvas)}
.cx-pc .nm{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.cx-pc .nm b{font-size:13px;font-weight:500;display:flex;align-items:center;gap:6px;white-space:nowrap}
.cx-pc .nm small{font-size:11.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-pc .nm b .rl{font-weight:400;color:var(--ink-3);font-size:12px}
.cx-pc .nm small .px-id{color:var(--ink-2);font-size:11.5px}
.cx-tag{display:inline-flex;align-items:center;height:16px;padding:0 5px;border-radius:5px;background:var(--fill);font-size:10.5px;font-weight:500;color:var(--ink-2)}
.cx-hint{flex-basis:100%;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-2)}
.cx-hint .px-ico{width:13px;height:13px;color:var(--warn)}
.cx-add{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:0 10px;border-radius:12px;font-size:12.5px;color:var(--ink-3);box-shadow:inset 0 0 0 1px var(--hairline)}
.cx-add:hover{color:var(--ink);box-shadow:inset 0 0 0 1px var(--border-strong)}
.cx-add .px-ico{width:13px;height:13px}
.cx-addf{flex-basis:100%;display:flex;gap:8px;align-items:center}
.cx-addf .px-input{height:30px;font-size:13px}
.flash{animation:cx-flash 1.6s ease-out 1}
@keyframes cx-flash{0%,30%{box-shadow:inset 0 0 0 2px var(--accent)}100%{}}
/* log form additions */
.cx-to{align-items:stretch}
.cx-chip{all:unset;box-sizing:border-box;cursor:pointer;display:inline-grid;grid-template-columns:auto auto;grid-template-rows:auto auto;column-gap:8px;align-items:center;padding:5px 10px 5px 6px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--border);font-size:12.5px;min-width:0}
.cx-chip .px-av{grid-row:1 / span 2}
.cx-chip b{font-weight:500;white-space:nowrap}
.cx-chip small{font-size:11px;color:var(--ink-3);white-space:nowrap}
.cx-chip.on{background:var(--fill);box-shadow:inset 0 0 0 1.5px var(--ink)}
.i3-comp .cx-chip{grid-template-columns:auto auto auto;grid-template-rows:auto;padding:3px 10px 3px 4px;height:28px}
.i3-comp .cx-chip .px-av{grid-row:auto}
.i3-comp .cx-chip small{display:none}
.cx-det{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-3);margin-top:-2px}
.cx-det .px-ico{width:13px;height:13px}
.cx-det .px-id{color:var(--ink);font-size:12.5px}
.px-link{all:unset;cursor:pointer;font-size:12.5px;font-weight:500;color:var(--accent-text)}
.px-link:hover{text-decoration:underline}
.cx-tpls .tg-chip .sug{width:6px;height:6px;border-radius:50%;background:var(--accent);display:inline-block;margin-left:2px}
.cx-tpls .cx-edit{margin-left:4px}
.cx-msg{border-radius:12px;background:var(--canvas);box-shadow:inset 0 0 0 1px var(--hairline);padding:10px 12px 8px;display:flex;flex-direction:column;gap:6px}
.cx-msg .pv{font-size:13.5px;line-height:20px;color:var(--ink);cursor:text;white-space:pre-wrap}
.cx-msg .pv mark{background:var(--accent-tint);color:inherit;border-radius:4px;padding:0 2px;box-shadow:inset 0 -1px 0 var(--accent-line)}
.cx-msg textarea{all:unset;font-size:13.5px;line-height:20px;color:var(--ink);white-space:pre-wrap;min-height:100px;outline:none}
.cx-msg textarea:focus,.cx-msg textarea:focus-visible{outline:none}
.cx-msg .ft{display:flex;justify-content:space-between;font-size:11px;color:var(--ink-4)}
.cx-ap{border-radius:12px;box-shadow:inset 0 0 0 1px var(--hairline);padding:8px 12px 10px;display:flex;flex-direction:column;gap:2px}
.cx-ap .h{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;padding:2px 0 4px}
.cx-ap .h small{margin-left:auto;font-weight:400;color:var(--ink-3);font-variant-numeric:tabular-nums}
.cx-op{display:flex;align-items:center;gap:10px;min-height:30px;font-size:13px;cursor:pointer}
.cx-op input,.cx-rest input{accent-color:var(--ink);width:15px;height:15px;margin:0}
.cx-op .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cx-op .mny{font-variant-numeric:tabular-nums;color:var(--ink-2)}
.cx-op.off .t,.cx-op.off .mny{color:var(--ink-4)}
.cx-rest{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-2);padding:4px 0 2px;cursor:pointer}
.cx-f{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--ink-3);padding-top:6px}
.cx-f span{width:96px;flex:none}
.cx-f .px-input{flex:1;height:30px;font-size:13px}
.cx-ap .cx-f span{width:auto}
.cx-ap .cx-f .px-input{max-width:180px}
.cx-rec{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink-3);padding-top:6px}
.cx-rec .px-ico{width:12px;height:12px;color:var(--status-working)}
.cx-rec b{font-weight:500;color:var(--ink-2)}
.i3-comp .cx-ap{flex-direction:row;flex-wrap:wrap;column-gap:22px}
.i3-comp .cx-ap .h{flex-basis:100%}
.i3-comp .cx-op{flex:0 1 auto}
.i3-comp .cx-rec{flex-basis:100%}
.nx-pop{max-height:calc(100% - 24px);overflow:auto;scrollbar-width:none}
/* ---------- approvals card with records ---------- */
.cx-card .i3-op{flex-wrap:wrap;row-gap:2px;padding:9px 14px}
.cx-card .h .px-btn{margin-left:8px}
.cx-rl{flex-basis:100%;display:flex;align-items:center;gap:6px;padding-left:46px;font-size:12px;color:var(--ink-3)}
.cx-rl .px-ico{width:12px;height:12px;flex:none}
.cx-rl b{font-weight:500;color:var(--ink-2)}
.cx-rl.ok .px-ico{color:var(--good)}.cx-rl.no .px-ico{color:var(--bad)}
.cx-rl.warn{color:var(--warn)}.cx-rl.warn .px-ico{color:var(--warn)}
.cx-rl .by{margin-left:auto;color:var(--ink-4)}
.cx-rl button{all:unset;cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px}
.tg-seg3 button.on.part{color:var(--warn)}
.ap-pop{box-sizing:border-box;display:flex;flex-direction:column;gap:8px}
.ap-in{flex-basis:100%;margin:8px 0 4px 46px;padding:12px 14px;border-radius:12px;background:var(--canvas);box-shadow:inset 0 0 0 1px var(--border);animation:px-up .18s cubic-bezier(.2,.8,.2,1) both}
.ap-in .nx-ph b{font-weight:500}
.ap-pop .nx-ph{margin:0}
.ap-pop .nx-ph .mny{font-size:12.5px;color:var(--ink);font-variant-numeric:tabular-nums;margin-left:auto}
.ap-pop .nx-ph .mny + .px-btn{margin-left:4px}
.ap-pop .lbl{font-size:12px;color:var(--ink-3);margin-bottom:-2px}
.ap-pop .acts{display:flex;justify-content:flex-end;gap:8px;padding-top:4px}
.ap-pop .tg-chip .px-kbd,.cx-tm .tg-chip .px-kbd{min-width:14px;height:15px;padding:0 3px;font-size:10px;margin-left:-4px;background:transparent;box-shadow:inset 0 0 0 1px var(--border)}
/* thread */
.i3-m p{white-space:pre-line}
.ib-main .i3-thread{min-height:0}
.ib-main .i3-thread > *{flex-shrink:0}
.i3-m .hd .to{color:var(--ink-2)}
.i3-m .hd .to::before{content:"→ ";color:var(--ink-4)}
/* ---------- template editor ---------- */
.cx-tm .px-modal{width:820px}
.cx-tmg{display:grid;grid-template-columns:200px 1fr;gap:20px}
.cx-tml{display:flex;flex-direction:column;gap:2px}
.cx-tmr{display:flex;flex-direction:column;gap:10px;min-width:0}
.cx-tmr .px-input{font-size:14px;width:100%;box-sizing:border-box}
.nx-toast > span{white-space:normal;line-height:18px}
.cx-tmb{height:auto !important;min-height:96px;padding:10px 12px !important;line-height:21px;resize:vertical;font-family:var(--font-sans)}
.cx-tok{display:flex;gap:6px;flex-wrap:wrap}
.cx-tok .tg-chip{font:500 12px/1 var(--font-mono);height:24px}
'''

JS = BASE + r'''
/* =================== customer contact layer =================== */
const SHOP={name:'Vanguard Truck Center – Greensboro',phone:'(336) 555-0100',me:'Dana'};
const PEOPLE={
 'Yadkin Valley Logistics':[{n:'Carla Jenkins',r:'Fleet manager',ph:'(336) 555-0142',em:'cjenkins@yadkinvl.com',pref:'Call',best:'before 11',ok:true},{n:'Marcus Reed',r:'Driver',ph:'(336) 555-0178',pref:'Text'}],
 'Sandhills Grain':[{n:'Bill Tate',r:'Owner',ph:'(910) 555-0123',pref:'Call',ok:true},{n:'Jorge Diaz',r:'Fleet manager',ph:'(910) 555-0166',em:'jdiaz@sandhillsgrain.com',pref:'Email'}],
 'Rowan Ready Mix':[{n:'Priya Shah',r:'Fleet manager',ph:'(704) 555-0190',em:'priya@rowanreadymix.com',pref:'Email',ok:true},{n:'Dale Hughes',r:'Driver',ph:'(704) 555-0134',pref:'Text'}],
 'Blue Ridge Haulage':[{n:'Tom Hale',r:'Fleet manager',ph:'(828) 555-0107',em:'thale@blueridgehaul.com',pref:'Call',best:'after 2',ok:true},{n:'Ricky Lane',r:'Driver',ph:'(828) 555-0155',pref:'Text'}],
 'Pilot Mountain Express':[{n:'Amy Carter',r:'Owner',ph:'(336) 555-0120',em:'amy@pilotmtnexpress.com',pref:'Email',ok:true},{n:'Wes Carter',r:'Driver',ph:'(336) 555-0119',pref:'Text'}],
 'Uwharrie Fuel':[{n:'Jan Price',r:'Office manager',ph:'(704) 555-0181',em:'office@uwharriefuel.com',pref:'Call',ok:true}],
 'Lexington Bottling':[{n:'Ed Morales',r:'Fleet manager',ph:'(336) 555-0163',pref:'Call',ok:true}],
 'Haw River Dairy':[{n:'Gail Moore',r:'Owner',ph:'(336) 555-0111',pref:'Call',ok:true},{n:'Josh Moore',r:'Driver',ph:'(336) 555-0112',pref:'Text'}],
};
const CTO={'37590':['Marcus Reed','Marcus Reed','Marcus Reed'],'37516':['Bill Tate'],'37628':['Priya Shah'],'37538':['Tom Hale','Tom Hale'],'37489':['Wes Carter'],'37301':['Jan Price','Jan Price'],'37460':['Ed Morales'],'37555':['Josh Moore']};
const APR0={'37538:0':{who:'Tom Hale',role:'Fleet manager',how:'Decisiv',at:'Tue 14:10',by:'Dana Kowalski',po:'BRH-20931'},
 '37489:0':{who:'Amy Carter',role:'Owner',how:'Email',at:'Tue 11:05',by:'Dana Kowalski',po:'PME-5521'},'37489:1':{who:'Amy Carter',role:'Owner',how:'Email',at:'Tue 11:05',by:'Dana Kowalski',po:'PME-5521'},
 '37460:0':{who:'Ed Morales',role:'Fleet manager',how:'Call',at:'Wed 16:20',by:'Dana Kowalski'},'37460:1':{who:'Ed Morales',role:'Fleet manager',how:'Call',at:'8:00',by:'Dana Kowalski',dec:true,reason:'Too expensive — release as is'},
 '37602:0':{who:'Sam Ortiz',role:'Fleet manager',how:'Call',at:'Mon 9:12',by:'Dana Kowalski'},'37602:1':{who:'Sam Ortiz',role:'Fleet manager',how:'Call',at:'Mon 9:12',by:'Dana Kowalski'}};
let APR=JSON.parse(JSON.stringify(APR0));
let TPL=[
 {id:'est',n:'Estimate',b:'Hi {first}, it’s {me} at {shop}. Estimate for unit {unit} (RO {ro}): {ops}. Total {total}. Reply YES to approve, or call me at {phone}.'},
 {id:'rem',n:'Approval reminder',b:'Hi {first}, checking in on the {total} estimate for unit {unit}. The truck is parked in {spot} until we hear back. Reply YES or call me at {phone}.'},
 {id:'par',n:'Parts delayed',b:'Hi {first}, parts for unit {unit} are now due {due}. We’ll start the moment they land and keep you posted. RO {ro}.'},
 {id:'rdy',n:'Ready for pickup',b:'Hi {first}, unit {unit} is ready. It’s parked in {spot} and the keys are at the service desk. RO {ro}.'}];
const TPL0=JSON.stringify(TPL);let TMCARET=null;
const TOK=['first','me','shop','unit','ro','ops','total','spot','due','ready','phone'];
const HOW=['Call','Text','Email','In person','Decisiv'];
const PAST={Call:'called',Text:'texted',Email:'emailed','In person':'given in person'};
let AP=null, TPLED=null, FLASH='', ADDP=false;
const ini=n=>n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
function pplOf(r){if(!PEOPLE[r.cust]){const F=['Alan Brooks','Lisa Grant','Keith Moore','Dee Walker','Ray Fox','Nina Cole'],Dr=['Chris Hall','Tony Webb','Sam Price','Lee Ford'];let h=0;for(const c of r.cust)h=(h*31+c.charCodeAt(0))%997;
  PEOPLE[r.cust]=[{n:F[h%F.length],r:'Fleet manager',ph:`(336) 555-0${String(h%900+100)}`,pref:'Call',ok:true},{n:Dr[h%Dr.length],r:'Driver',ph:`(336) 555-0${String((h*7)%900+100)}`,pref:'Text'}];}return PEOPLE[r.cust];}
const toOf=(r,c,i)=>c[5]||(CTO[r.no]||[])[i]||'';
function missed(r){const ap=(pplOf(r).find(p=>p.ok)||{}).n;const m={};r.ct.forEach((c,i)=>{const t=toOf(r,c,i);if(t&&t!==ap&&/No answer|Left voicemail/.test(c[3]))m[t]=(m[t]||0)+1;});return m;}
function defTo(r){const L=pplOf(r);const i=L.findIndex(p=>p.ok);return i<0?0:i;}
function toHint(r){const m=missed(r),ap=pplOf(r)[defTo(r)];const k=Object.keys(m).find(n=>m[n]>=2);return k?`${m[k]} calls to ${k.split(' ')[0]} went unanswered — ${ap.n.split(' ')[0]} approves estimates`:'';}
const openOps=r=>r.ops.map((o,i)=>[o,i]).filter(([o])=>o[2]===null);
function suggestTpl(r){if(r.cat==='rdy')return 'rdy';if(r.st==='parts')return 'par';if(r.ops.some(o=>o[2]===null))return r.ct.some(c=>/estimate/i.test(c[4]||''))?'rem':'est';return 'rdy';}
const tplBody=id=>(TPL.find(t=>t.id===id)||{b:''}).b;
function tmap(r,p){const a=appr(r),open=openOps(r).map(x=>x[0]);return {first:p?p.n.split(' ')[0]:'there',me:SHOP.me,shop:SHOP.name,unit:r.unit,ro:r.no,total:money(a.op||a.ok),ops:(open.length?open:r.ops.filter(o=>o[1])).map(o=>`${o[0].split(' – ')[0].toLowerCase()} ${money(o[1])}`).join(', '),spot:r.spot,phone:SHOP.phone,due:((r.sub||'').match(/due (\w+)/)||[,'later this week'])[1],ready:r.ready};}
const fill=(t,r,p)=>{const m=tmap(r,p);return t.replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);};
function fillHtml(t,r,p){const m=tmap(r,p);return t.split(/(\{\w+\})/).map(s=>{const k=(s.match(/^\{(\w+)\}$/)||[])[1];return k&&m[k]!=null?`<mark>${esc(m[k])}</mark>`:esc(s);}).join('');}
const msgOf=(S,r,p)=>S.edit&&S.msg!=null?S.msg:fill(tplBody(S.tpl),r,p);
function copyText(t){const fb=()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}ta.remove();};try{navigator.clipboard.writeText(t).catch(fb);}catch(e){fb();}}
function panelSum(S,r){const open=openOps(r);let n=0,sum=0;open.forEach(([o],j)=>{if(!S.ops||S.ops[j]){n++;sum+=o[1];}});return {n,sum,open};}

/* needs: an in-repair RO with an op still waiting on approval is waiting on the customer too */
needs=(orig=>function(){const L=orig();ROS.forEach(r=>{if(r.cat==='wrk'&&!L.some(x=>x[0]===r)){const op=openOps(r);if(op.length){const c=r.ct[r.ct.length-1];L.push([r,2,'phone',`Op ${op.map(x=>x[1]+1).join(', ')} · ${money(op.reduce((s,x)=>s+x[0][1],0))} waiting on approval${c?' · '+c[3].toLowerCase():''}`,'Follow up','Waiting on customers']);}}});return L.sort((a,b)=>a[1]-b[1]);})(needs);

/* ---------- 1 + 2 + 3 · the log form ---------- */
function follow(S,r){if(!S.out)return ['','Pick an outcome'];
  if(S.out==='Approved'||S.out==='Declined'){const s=panelSum(S,r);if(!s.open.length)return ['','Logs it on the RO'];const left=s.open.length-s.n-(S.out==='Approved'&&S.rest?s.open.length-s.n:0);
    if(S.out==='Approved')return s.n||S.rest?['ok',left?`${left} op${left>1?'s':''} stay open`:`Back to ${TECH[r.tech]||'the tech'} — clears the item`]:['','Tick what they approved'];
    return ['no',left?`${left} op${left>1?'s':''} stay open`:(r.ops.some(o=>o[2]==='ok')?`Back to ${TECH[r.tech]||'the tech'} for the rest`:'Moves to Ready to release')];}
  if(!itemOf(r.no))return ['','Logs it on the RO'];
  if(S.out==='Will call back')return ['snz',`Back in the list at ${fmt(S.when)}`];
  const h=FOLLOW[S.out];return ['snz',`Back in the list at ${fmt(r5(NOW+h))} · ${h} h`];}
function apPanel(S,r,p){if(S.out!=='Approved'&&S.out!=='Declined')return '';const open=openOps(r),ok=S.out==='Approved';
  if(!open.length)return `<div class="cx-ap"><div class="h">No open operations<small>nothing to ${ok?'approve':'decline'}</small></div></div>`;
  if(!S.ops||S.ops.length!==open.length)S.ops=open.map(()=>true);const s=panelSum(S,r),tot=open.reduce((a,x)=>a+x[0][1],0);
  return `<div class="cx-ap"><div class="h">${ok?I.check:I.x}${ok?'Approve':'Decline'}<small>${money(s.sum)} of ${money(tot)} open</small></div>
   ${open.map(([o,i],j)=>`<label class="cx-op${S.ops[j]?'':' off'}"><input type="checkbox" data-lf-op="${j}"${S.ops[j]?' checked':''}><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${money(o[1])}</span></label>`).join('')}
   ${ok&&s.n<open.length?`<label class="cx-rest"><input type="checkbox" data-lf-rest${S.rest?' checked':''}>Decline the rest</label>`:''}
   ${ok?`<div class="cx-f"><span>PO #</span><input class="px-input" data-lf-po value="${esc(S.po||'')}" placeholder="optional"></div>`:''}
   <div class="cx-rec">${I.check}<span>Saved on each op as ${ok?'approved':'declined'} by <b>${esc(p.n)}</b> · ${S.kind} · ${fmt(NOW)}</span></div></div>`;}
function btnLabel(S,r){const txt=(S.kind==='Text'||S.kind==='Email')&&S.tpl;if(S.out==='Approved'||S.out==='Declined'){const s=panelSum(S,r);if(s.open.length&&s.n)return `Log &amp; ${S.out==='Approved'?'approve':'decline'} ${money(s.sum)}`;}return txt?'Copy &amp; log':'Log it';}
function logForm(S,sc,r){const ppl=pplOf(r);if(S.to==null||!ppl[S.to])S.to=defTo(r);const p=ppl[S.to];
  const txt=S.kind==='Text'||S.kind==='Email';if(txt&&S.tpl===undefined)S.tpl=suggestTpl(r);if(txt&&S.tpl&&!S.out)S.out='Update given';
  const f=follow(S,r),ic=f[0]==='snz'?I.clock:f[0]==='ok'?I.check:f[0]==='no'?I.x:'',L=t=>`<span class="lbl">${t}</span>`;
  const chips=ppl.map((q,i)=>`<button class="cx-chip${S.to===i?' on':''}" data-lf-to="${i}"><span class="px-av">${ini(q.n)}</span><b>${esc(q.n)}</b><small>${esc(q.r)}${q.ok?' · approves':''}</small></button>`).join('');
  const addr=S.kind==='Email'?(p.em||''):p.ph;
  const det=`<div class="cx-det">${S.kind==='Email'?I.mail:I.phone}<span class="px-id">${addr?esc(addr):'No email on file'}</span><span>prefers ${p.pref.toLowerCase()}${p.best?' · best '+p.best:''}</span>${addr?`<button class="px-link" data-copy="${esc(addr)}">Copy</button>`:''}</div>`;
  const hint=toHint(r),hintH=hint&&S.kind==='Call'&&S.to===defTo(r)?`<div class="cx-hint">${I.flag}${esc(hint)}</div>`:'';
  const kinds=['Call','Text','Email','In person'].map(k=>`<button class="tg-chip${S.kind===k?' on':''}" data-lf-kind="${k}">${I[KIND[k]]}${k}</button>`).join('');
  let tpl='';if(txt){const sug=suggestTpl(r),m=S.tpl?msgOf(S,r,p):'';tpl=`<div class="lf-r cx-tpls">${L('Template')}${TPL.map(t=>`<button class="tg-chip${S.tpl===t.id?' on':''}" data-lf-tpl="${t.id}" title="${t.id===sug?'Suggested for this RO':''}">${esc(t.n)}${t.id===sug?'<i class="sug"></i>':''}</button>`).join('')}<button class="tg-chip${S.tpl?'':' on'}" data-lf-tpl="">None</button><button class="px-link cx-edit" data-tpled>Edit…</button></div>${S.tpl?`<div class="cx-msg">${S.edit?`<textarea data-lf-msg rows="5">${esc(m)}</textarea>`:`<div class="pv" data-lf-editmsg title="Click to edit">${fillHtml(tplBody(S.tpl),r,p)}</div>`}<div class="ft"><span>${m.length} characters</span><span>${S.edit?'Edited for this message':'Filled from the RO · click to edit'}</span></div></div>`:''}`;}
  const outs=OUTS.map((k,i)=>`<button class="tg-chip${S.out===k?' on':''}" data-lf-out="${k}">${sc==='p'?`<span class="px-kbd">${i+1}</span>`:''}${k}</button>`).join('');
  const when=S.out==='Will call back'&&itemOf(r.no)?`<div class="lf-r lf-when">${L(sc==='p'?'When did they say?':'When')}${whenOpts().map(([l,h])=>`<button class="tg-chip${S.when===h?' on':''}" data-lf-when="${h}" title="${l}">${fmt(h)}</button>`).join('')}</div>`:'';
  const noteOn=!(txt&&S.tpl);
  const ta=noteOn?`<textarea rows="1" data-lf-note placeholder="Note — e.g. asked for a yes or no on the brakes">${esc(S.note)}</textarea>`:'<span style="flex:1"></span>';
  const go=`<button class="px-btn px-btn--primary px-btn--sm" data-lf-go${S.out?'':' disabled'}>${txt&&S.tpl&&!/approve|decline/.test(btnLabel(S,r))?I.copy:''}${btnLabel(S,r)}<span class="px-kbd">↵</span></button>`;
  const fu=`<span class="lf-fu ${f[0]}">${ic}<span>${f[1]}</span></span>`;
  if(sc==='p')return `<div class="lf" data-lf="p"><div class="lf-r cx-to">${L('To')}${chips}</div>${det}${hintH}<div class="lf-r">${L('Log')}${kinds}</div>${tpl}<div class="lf-r">${L('Outcome')}${outs}</div>${apPanel(S,r,p)}${when}${noteOn?ta:''}<div class="lf-r lf-f">${fu}${go}</div><div class="lf-hint"><span><span class="px-kbd">1</span>–<span class="px-kbd">6</span> outcome</span><span><span class="px-kbd">N</span> note</span><span><span class="px-kbd">Esc</span> close</span></div></div>`;
  return `<div class="lf" data-lf="c"><div class="lf-r">${L('To')}${chips}<span style="width:14px"></span>${L('Log')}${kinds}</div>${tpl}<div class="lf-r">${L('Outcome')}${outs}</div>${apPanel(S,r,p)}${when}<div class="lf-r lf-nf">${ta}${fu}${go}</div></div>`;}
function settle(r){if(r.cat!=='apr'||r.ops.some(o=>o[2]===null))return;
  if(r.ops.some(o=>o[2]==='ok'||o[2]==='part'))Object.assign(r,{cat:'wrk',st:'hold',stn:'Hold tech',sub:'',late:false,next:'',stage:3,hold:['tech',TECH[r.tech]||'Technician',0,8]});
  else Object.assign(r,{cat:'rdy',st:'declined',stn:'Declined',sub:'',late:false,next:'',stage:6,age:'0m',hold:['writer','Dana Kowalski',0,2]});}
function applyLog(S,no){const r=get(no),inList=!!itemOf(no),ppl=pplOf(r),p=ppl[S.to==null?defTo(r):S.to]||ppl[0];snap();delete BACK[no];
  const txt=(S.kind==='Text'||S.kind==='Email')&&S.tpl;let note=(S.note||'').trim(),msg='';if(txt){msg=msgOf(S,r,p);note=msg;copyText(msg);}
  const ev=KIND[S.kind]==='chat'?'text':KIND[S.kind]==='mail'?'email':KIND[S.kind]==='user'?'person':'call';
  if((S.out==='Approved'||S.out==='Declined')&&openOps(r).length){const ok=S.out==='Approved',open=openOps(r);let a=0,d=0,ia=[],id=[];
    open.forEach(([o,i],j)=>{const t=!S.ops||S.ops[j],rec={who:p.n,role:p.r,how:S.kind,at:fmt(NOW),by:'Dana Kowalski',po:ok?(S.po||''):''};
      if(ok&&t){o[2]='ok';a+=o[1];ia.push(i+1);APR[`${no}:${i}`]=rec;}else if((ok&&S.rest)||(!ok&&t)){o[2]='no';d+=o[1];id.push(i+1);APR[`${no}:${i}`]={...rec,dec:true,po:''};}});
    const parts=[ia.length?`Approved op ${ia.join(', ')} · ${money(a)}${S.po?' · PO '+S.po:''}`:'',id.length?`Declined op ${id.join(', ')} · ${money(d)}`:''].filter(Boolean).join(' — ');
    r.ct.push([S.kind,fmt(NOW),'Dana Kowalski',ia.length?'Approved':'Declined',[note,parts].filter(Boolean).join('\n'),p.n]);r.ev.push([NOW,ev]);
    settle(r);if(inList&&!itemOf(no))clr(ia.length?'check':'x',ia.length?`Approved ${money(a)}`:'Logged decline',r);
    toast(`${ia.length?'Approved '+money(a):'Declined '+money(d)}${ia.length&&id.length?' · declined '+money(d):''} · ${p.n} · ${S.kind}`);return;}
  r.ct.push([S.kind,fmt(NOW),'Dana Kowalski',S.out,note,p.n]);r.ev.push([NOW,ev]);
  let until=null;if(inList&&S.out!=='Approved'&&S.out!=='Declined'){until=S.out==='Will call back'?S.when:r5(NOW+FOLLOW[S.out]);SNZ[no]={until,why:S.out==='Will call back'?'Said they’d call back':S.out,at:NOW};}
  toast(txt?`Copied — paste it into your ${S.kind==='Email'?'email':'phone'}. Logged as a ${S.kind.toLowerCase()} to ${p.n.split(' ')[0]}${until?', back '+fmt(until):''}.`:until?`${r.cust} snoozed until ${fmt(until)}`:`${S.kind} logged on RO-${r.no}`);}

/* ---------- 4 · approval record ---------- */
function recLine(r,o,i){const a=APR[`${r.no}:${i}`];
  if(o[2]==='warr')return `<div class="cx-rl">${I.warranty}Warranty — no customer approval needed</div>`;
  if(o[2]===null){const c=r.ct.slice().reverse().find(c=>/estimate|\$/i.test(c[4]||''));return `<div class="cx-rl">Open${c?` · estimate ${PAST[c[0]]||'sent'} ${c[1]}`:''}</div>`;}
  if(!a)return `<div class="cx-rl warn">${I.flag}No record of who ${o[2]==='no'?'declined':'approved'} this — <button data-aprrec="${i}">Add</button></div>`;
  return `<div class="cx-rl ${a.dec?'no':'ok'}">${a.dec?I.x:I.check}<b>${esc(a.who)}</b>${a.role?` · ${esc(a.role)}`:''} · ${esc(a.how)} · ${esc(a.at)}${a.po?` · PO <span class="px-id">${esc(a.po)}</span>`:''}${a.amt?` · ${money(a.amt)} of ${money(o[1])}`:''}${a.reason?` · “${esc(a.reason)}”`:''}<span class="by">logged by ${esc(a.by.split(' ')[0])}</span></div>`;}
function recordText(r){const L=[`RO ${r.no} · ${r.cust} · unit ${r.unit}`];r.ops.forEach((o,i)=>{const a=APR[`${r.no}:${i}`];L.push(`Op ${i+1} ${o[0]} ${o[1]?money(o[1]):''} — `+(o[2]==='warr'?'warranty':o[2]===null?'open':a?`${a.dec?'declined':o[2]==='part'?'partly approved':'approved'} by ${a.who}${a.role?' ('+a.role+')':''} via ${a.how}, ${a.at}${a.po?', PO '+a.po:''}${a.amt?', '+money(a.amt):''}${a.reason?', "'+a.reason+'"':''}; logged by ${a.by}`:`${o[2]==='no'?'declined':'approved'} — no record`));});return L.join('\n');}
const newAP=r=>({to:defTo(r),how:'Call',po:'',amt:'',reason:''});
function openAppr(no,op,dec,recOnly){const r=get(no);SEL=no;AP=newAP(r);const a=APR[`${no}:${op}`];if(a){const k=pplOf(r).findIndex(p=>p.n===a.who);if(k>=0)AP.to=k;AP.how=a.how;AP.po=a.po||'';AP.reason=a.reason||'';AP.amt=a.amt||'';}
  POP={type:'appr',no,op,dec,rec:!!recOnly,i:0};render();}
function apprPop(){const r=get(POP.no);if(!r)return '';const o=r.ops[POP.op],ppl=pplOf(r),A=AP,d=POP.dec;
  return `<div class="ap-pop ap-in">${apprBody(r,o,ppl,A,d)}</div>`;}
function apprBody(r,o,ppl,A,d){
  const verb=POP.rec?'Record approval':d==='ok'?'Approve':d==='part'?'Partly approve':'Decline';
  return `<div class="nx-ph"><span class="k">${verb}</span><span class="tg-ro">Op ${POP.op+1}</span><b>${esc(o[0])}</b><span class="mny">${money(o[1])}</span><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>
   <div class="lbl">Who ${d==='no'?'declined':'approved'}</div><div class="lf-r">${ppl.map((q,i)=>`<button class="cx-chip${A.to===i?' on':''}" data-ap-to="${i}"><span class="px-av">${ini(q.n)}</span><b>${esc(q.n)}</b><small>${esc(q.r)}${q.ok?' · approves':''}</small></button>`).join('')}</div>
   <div class="lbl">How</div><div class="lf-r">${HOW.map((h,i)=>`<button class="tg-chip${A.how===h?' on':''}" data-ap-how="${h}"><span class="px-kbd">${i+1}</span>${h}</button>`).join('')}</div>
   ${d==='part'?`<div class="cx-f"><span>Approved amount</span><input class="px-input" data-ap-amt value="${esc(A.amt)}" placeholder="$ of ${money(o[1])}"></div>`:''}
   ${d!=='no'?`<div class="cx-f"><span>PO #</span><input class="px-input" data-ap-po value="${esc(A.po)}" placeholder="optional"></div>`:`<div class="cx-f"><span>Reason</span><input class="px-input" data-ap-reason value="${esc(A.reason)}" placeholder="optional — e.g. too expensive"></div>`}
   <div class="cx-rec">${I.check}<span>Saved with your name, <b>Dana Kowalski</b>, and the time · ${fmt(NOW)}</span></div>
   <div class="acts"><button class="px-btn px-btn--sm" data-close>Cancel<span class="px-kbd">Esc</span></button><button class="px-btn px-btn--primary px-btn--sm" data-ap-save>${POP.rec?'Save record':{ok:'Save approval',part:'Save partial approval',no:'Save decline'}[d]}<span class="px-kbd">↵</span></button></div>`;}
function saveAppr(){const {no,op,dec,rec}=POP,r=get(no),o=r.ops[op],p=pplOf(r)[AP.to],was=!!itemOf(no);snap();
  if(!rec)o[2]=dec;APR[`${no}:${op}`]={who:p.n,role:p.r,how:AP.how,at:fmt(NOW),by:'Dana Kowalski',po:dec==='no'?'':AP.po.trim(),amt:dec==='part'?(+String(AP.amt).replace(/[^\d.]/g,'')||0):0,dec:dec==='no',reason:dec==='no'?AP.reason.trim():''};
  settle(r);if(was&&!itemOf(no))clr(dec==='no'?'x':'check',dec==='no'?'Logged decline':`Approved op ${op+1}`,r);
  POP=null;toast(`${rec?'Record saved':dec==='no'?'Declined':'Approved'} · op ${op+1} · ${p.n} · ${AP.how}`);render();}

/* ---------- Inbox view: who to call strip + thread + approvals with records ---------- */
function vInbox(r){const a=appr(r),ppl=pplOf(r),dt=defTo(r),hint=toHint(r);
  const thread=r.ct.map((c,i)=>{const t=toOf(r,c,i);return `<div class="i3-m"><span class="gi">${I[KIND[c[0]]]}</span><div class="bd"><div class="hd"><b>${esc(c[0])}</b>${t?`<span class="to">${esc(t)}</span>`:''}<span class="tg-oc ${OUTC(c[3])}">${esc(c[3])}</span><span style="color:var(--ink-3)">${esc(c[2])}</span><time>${esc(c[1])}</time></div>${c[4]?`<p>${esc(c[4])}</p>`:''}</div></div>`;}).join('');
  const sz=SNZ[r.no]?`<div class="i3-m sys"><span class="gi">${I.clock}</span><div class="bd"><div class="hd">Snoozed until <b style="color:var(--ink)">${fmt(SNZ[r.no].until)}</b>${SNZ[r.no].why?' · '+esc(SNZ[r.no].why):''}<time>${fmt(SNZ[r.no].at)}</time></div></div></div>`:'';
  const pc=ppl.map((p,i)=>{const k=p.pref==='Text'?['chat','Text']:p.pref==='Email'?['mail','Email']:['phone','Call'];return `<div class="cx-pc${i===dt&&hint?' sug':''}"><span class="px-av px-av--md">${ini(p.n)}</span><div class="nm"><b>${esc(p.n)}<span class="rl">${esc(p.r)}</span>${p.ok?'<span class="cx-tag">Approves</span>':''}</b><small><span class="px-id">${esc(p.ph)}</span> · prefers ${p.pref.toLowerCase()}${p.best?' · '+p.best:''}</small></div><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-copy="${esc(p.ph)}" title="Copy number">${I.copy}</button><button class="px-btn px-btn--sm" data-callp="${i}" data-kind="${k[1]==='Call'?'Call':k[1]}">${I[k[0]]}${k[1]}</button></div>`;}).join('');
  const addf=ADDP?`<div class="cx-addf"><input class="px-input" data-np="n" placeholder="Name" style="width:160px"><select class="px-input" data-np="r" style="width:140px"><option>Fleet manager</option><option>Driver</option><option>Owner</option><option>Office manager</option></select><input class="px-input" data-np="ph" placeholder="(336) 555-0100" style="width:150px"><label style="font-size:12.5px;color:var(--ink-2);display:flex;gap:6px;align-items:center"><input type="checkbox" data-np="ok">Approves</label><button class="px-btn px-btn--sm px-btn--primary" data-np-save>Add</button><button class="px-btn px-btn--sm px-btn--ghost" data-np-cancel>Cancel</button></div>`:'';
  const card=`<div class="i3-appr cx-card"><div class="h">${I.check}Approvals<span>Approved ${money(a.ok)} · open ${money(a.op)}${a.no?' · declined '+money(a.no):''}</span><button class="px-btn px-btn--sm" data-copyrec title="For the Decisiv case notes">${I.copy}Copy record</button></div>${r.ops.map((o,i)=>`<div class="i3-op" data-op="${i}"><span class="tg-ro">Op ${i+1}</span><span class="t">${esc(o[0])}</span><span class="mny">${o[1]?money(o[1]):'—'}</span>${o[2]==='warr'?'<span class="tg-oc ok">Warranty</span>':`<span class="tg-seg3"><button class="${o[2]==='ok'?'on ok':''}" data-apr="${i}" data-dec="ok">Approve</button><button class="${o[2]==='part'?'on part':''}" data-apr="${i}" data-dec="part">Partly</button><button class="${o[2]==='no'?'on no':''}" data-apr="${i}" data-dec="no">Decline</button></span>`}${POP&&POP.type==='appr'&&POP.no===r.no&&POP.op===i?apprPop():recLine(r,o,i)}</div>`).join('')}</div>`;
  return `<div class="i3-main"><div class="i3-top"><div class="r1"><span class="tg-ro">RO-${r.no}</span>${sq(r.cat)}<span>${CAT[r.cat][0]}</span>·${age(r)}</div><h2>${esc(r.cust)}</h2>
   <div class="r2">${spot(r.spot)}${ticks(r)}<span style="display:inline-flex;gap:6px;align-items:center">${st(r)}</span>${held(r)}<span style="margin-left:auto;display:flex;gap:8px"><button class="px-btn px-btn--sm" data-pop="xfer" data-no="${r.no}">${I.swap}Transfer…</button><button class="px-btn px-btn--sm">Open RO</button></span></div>
   <div class="cx-ppl${FLASH==='ppl'?' flash':''}">${pc}<button class="cx-add" data-np-open>${I.plus}Add</button>${hint?`<div class="cx-hint">${I.flag}${esc(hint)}</div>`:''}${addf}</div></div>
   <div class="i3-thread"><span class="i3-day">This RO · calls, texts, approvals and transfers</span>${thread||'<div class="i3-m sys"><span class="gi">'+I.phone+'</span><div class="bd"><div class="hd">No contact logged yet</div></div></div>'}${sz}
    <div class="i3-m sys"><span class="gi">${I.swap}</span><div class="bd"><div class="hd">With <b style="color:var(--ink)">${esc(r.hold[1])}</b> · ${ROLE[r.hold[0]][1]}<time>${r.hold[2]<1?Math.round(r.hold[2]*60)+'m':r.hold[2]+'h'}</time></div></div></div>
    ${card}</div>
   <div class="i3-comp">${logForm(LFC,'c',r)}</div></div>`;}

/* ---------- template editor ---------- */
function tplModal(){const t=TPL.find(x=>x.id===TPLED)||TPL[0],r=get(SEL),p=pplOf(r)[defTo(r)];
  return `<div class="px-scrim cx-tm" data-tm-scrim><div class="px-modal"><div class="px-modal__h"><div><h2>Text templates</h2><p>Shared by everyone on Triage. Words in braces fill in from the RO.</p></div><button class="px-btn px-btn--icon px-btn--ghost" data-tm-close aria-label="Close">${I.x}</button></div>
   <div class="px-modal__b"><div class="cx-tmg"><div class="cx-tml">${TPL.map(x=>`<button class="px-menu__item${x.id===t.id?' is-on':''}" data-tm-sel="${x.id}">${esc(x.n)}</button>`).join('')}<div class="px-menu__sep"></div><button class="px-menu__item" data-tm-new>${I.plus}New template</button></div>
   <div class="cx-tmr"><input class="px-input" data-tm-name value="${esc(t.n)}"><textarea class="px-input cx-tmb" data-tm-body>${esc(t.b)}</textarea><div class="cx-tok">${TOK.map(k=>`<button class="tg-chip" data-tm-tok="${k}">{${k}}</button>`).join('')}</div><div class="tg-sec" style="margin:4px 0 -4px">Preview · RO-${r.no} · ${esc(p.n)}</div><div class="cx-msg"><div class="pv" data-tm-pv>${fillHtml(t.b,r,p)}</div></div></div></div></div>
   <div class="px-modal__f"><span class="px-modal__hint">Changes save as you type</span><button class="px-btn px-btn--primary" data-tm-close>Done</button></div></div></div>`;}

/* ---------- wiring ---------- */
popHtml=(orig=>function(){if(POP&&POP.type==='appr')return '';if(POP&&POP.type==='log'){const r=get(POP.no);if(!r)return '';return `<div class="nx-pop px-pop"><div class="nx-ph"><span class="k">Log a contact</span><span class="tg-ro">RO-${r.no}</span><b>${esc(r.cust)}</b><button class="px-btn px-btn--icon px-btn--ghost px-btn--sm" data-close aria-label="Close">${I.x}</button></div>${logForm(LFP,'p',r)}</div>`;}return orig();})(popHtml);
render=(orig=>function(){orig();
  const ap=$('.ap-in'),th=$('.i3-thread');if(ap&&th){const a=ap.getBoundingClientRect(),t=th.getBoundingClientRect();if(a.bottom>t.bottom)th.scrollTop+=(a.bottom-t.bottom)/scale+16;else if(a.top<t.top)th.scrollTop-=(t.top-a.top)/scale+16;}
  $$('.i3-it').forEach(it=>{const r=get(it.dataset.sel),b=it.querySelector('[data-act]');if(r&&b&&/Call back|Follow up/.test(b.textContent)){const p=pplOf(r)[defTo(r)];b.title=`${p.n} · ${p.ph}`;}});
  if(TPLED){mock.insertAdjacentHTML('beforeend',tplModal());}
  if(FLASH){setTimeout(()=>{FLASH='';},1700);}
  $$('[data-demo]').forEach(b=>b.classList.toggle('is-on',b.dataset.demo===DEMO));})(render);
snap=function(){UNDO.push(JSON.stringify({ros:ROS,rel:D.rel,SNZ,BACK,CLR,SEL,APR}));if(UNDO.length>30)UNDO.shift();};
undo=function(){if(!UNDO.length)return;const s=JSON.parse(UNDO.pop());ROS.splice(0,ROS.length,...s.ros);D.rel.splice(0,D.rel.length,...s.rel);SNZ=s.SNZ;BACK=s.BACK;CLR=s.CLR;SEL=s.SEL;APR=s.APR||APR;POP=null;toast('Undone',false);render();};
reset=(orig=>function(){APR=JSON.parse(JSON.stringify(APR0));TPL=JSON.parse(TPL0);LFC=newLF();TPLED=null;ADDP=false;DEMO='';FLASH='';orig();})(reset);
$('[data-reset]').onclick=()=>reset();
let DEMO='';
function demo(k){reset();DEMO=k;TAB='inbox';KB=false;
  if(k==='out'){openPop('log','37590');LFP.out='Approved';LFP.po='YVL-7731';}
  if(k==='tpl'){openPop('log','37590');LFP.kind='Text';LFP.tpl='rem';}
  if(k==='who'){SEL='37590';FLASH='ppl';}
  if(k==='rec'){SEL='37538';render();openAppr('37538',1,'ok');return;}
  render();}
$$('[data-demo]').forEach(b=>b.onclick=()=>demo(b.dataset.demo));

mock.addEventListener('click',e=>{const t=e.target,q=s=>t.closest(s),stop=()=>{e.stopPropagation();e.preventDefault();};
  if(TPLED){if(q('[data-tm-close]')||(q('[data-tm-scrim]')&&!q('.px-modal'))){TPLED=null;render();return stop();}
    const sl=q('[data-tm-sel]');if(sl){TPLED=sl.dataset.tmSel;render();return stop();}
    if(q('[data-tm-new]')){const id='t'+Date.now();TPL.push({id,n:'New template',b:'Hi {first}, '});TPLED=id;render();return stop();}
    const tk=q('[data-tm-tok]');if(tk){const ta=$('[data-tm-body]'),v=`{${tk.dataset.tmTok}}`,s0=TMCARET==null?ta.value.length:TMCARET;ta.value=ta.value.slice(0,s0)+v+ta.value.slice(s0);TMCARET=s0+v.length;ta.dispatchEvent(new Event('input',{bubbles:true}));ta.focus();ta.selectionStart=ta.selectionEnd=s0+v.length;return stop();}
    e.stopPropagation();return;}
  if(q('[data-tpled]')){TMCARET=null;TPLED=(POP&&POP.type==='log'?LFP:LFC).tpl||TPL[0].id;render();return stop();}
  const cp=q('[data-copy]');if(cp&&cp.dataset.copy){copyText(cp.dataset.copy);toast(`Copied ${cp.dataset.copy}`,false);render();return stop();}
  if(q('[data-copyrec]')){copyText(recordText(get(SEL)));toast('Approval record copied — paste it into the Decisiv case notes',false);render();return stop();}
  const cl=q('[data-callp]');if(cl){openPop('log',SEL);LFP.to=+cl.dataset.callp;LFP.kind=cl.dataset.kind;render();return stop();}
  if(q('[data-np-open]')){ADDP=!ADDP;render();return stop();}
  if(q('[data-np-cancel]')){ADDP=false;render();return stop();}
  if(q('[data-np-save]')){const v=k=>$(`[data-np="${k}"]`);const n=v('n').value.trim();if(n){pplOf(get(SEL)).push({n,r:v('r').value,ph:v('ph').value.trim()||'—',pref:'Call',ok:v('ok').checked});toast(`${n} added to ${get(SEL).cust}`,false);}ADDP=false;render();return stop();}
  const ar=q('[data-apr]');if(ar){openAppr(SEL,+ar.dataset.apr,ar.dataset.dec);return stop();}
  const rc=q('[data-aprrec]');if(rc){const o=get(SEL).ops[+rc.dataset.aprrec];openAppr(SEL,+rc.dataset.aprrec,o[2]==='no'?'no':'ok',true);return stop();}
  if(q('.ap-pop')){const to=q('[data-ap-to]'),hw=q('[data-ap-how]');if(to){AP.to=+to.dataset.apTo;render();}else if(hw){AP.how=hw.dataset.apHow;render();}else if(q('[data-ap-save]'))saveAppr();else if(q('[data-close]')){POP=null;render();}e.stopPropagation();return;}
  const lf=q('[data-lf]');if(lf){const S=lf.dataset.lf==='p'?LFP:LFC;
    const to=q('[data-lf-to]');if(to){S.to=+to.dataset.lfTo;render();return stop();}
    const tp=q('[data-lf-tpl]');if(tp){S.tpl=tp.dataset.lfTpl||null;S.edit=false;S.msg=null;if(S.tpl&&!S.out)S.out='Update given';render();return stop();}
    if(q('[data-lf-editmsg]')){const r=get(lf.dataset.lf==='p'?POP.no:SEL);S.msg=msgOf(S,r,pplOf(r)[S.to]);S.edit=true;render();const ta=$(`[data-lf="${lf.dataset.lf}"] [data-lf-msg]`);if(ta){ta.focus();ta.selectionStart=ta.selectionEnd=ta.value.length;}return stop();}
    const kd=q('[data-lf-kind]');if(kd){S.kind=kd.dataset.lfKind;if((S.kind==='Text'||S.kind==='Email')&&S.tpl===undefined){}render();e.stopPropagation();return;}
    const oc=q('[data-lf-out]');if(oc){S.out=oc.dataset.lfOut;S.ops=null;S.rest=false;if(S.out==='Will call back'&&S.when==null)S.when=r5(NOW+2);render();e.stopPropagation();return;}
    if(q('label.cx-op,label.cx-rest'))e.stopPropagation();}
},true);
mock.addEventListener('focusout',e=>{if(e.target.matches('[data-tm-body]'))TMCARET=e.target.selectionStart;});
mock.addEventListener('change',e=>{const t=e.target;const lf=t.closest('[data-lf]');if(!lf)return;const S=lf.dataset.lf==='p'?LFP:LFC;
  if(t.matches('[data-lf-op]')){S.ops[+t.dataset.lfOp]=t.checked;render();}else if(t.matches('[data-lf-rest]')){S.rest=t.checked;render();}});
mock.addEventListener('input',e=>{const t=e.target,lf=t.closest('[data-lf]'),S=lf?(lf.dataset.lf==='p'?LFP:LFC):null;
  if(S&&t.matches('[data-lf-msg]')){S.msg=t.value;const c=t.closest('.cx-msg').querySelector('.ft span');if(c)c.textContent=t.value.length+' characters';}if(S&&t.matches('[data-lf-po]'))S.po=t.value;
  if(AP&&t.matches('[data-ap-po]'))AP.po=t.value;if(AP&&t.matches('[data-ap-amt]'))AP.amt=t.value;if(AP&&t.matches('[data-ap-reason]'))AP.reason=t.value;
  if(TPLED&&(t.matches('[data-tm-body]')||t.matches('[data-tm-name]'))){const tp=TPL.find(x=>x.id===TPLED);if(t.matches('[data-tm-body]'))tp.b=t.value;else{tp.n=t.value;const b=$(`[data-tm-sel="${TPLED}"]`);if(b)b.textContent=t.value;}const r=get(SEL),pv=$('[data-tm-pv]');if(pv)pv.innerHTML=fillHtml(tp.b,r,pplOf(r)[defTo(r)]);}});
addEventListener('keydown',e=>{const k=e.key,inF=e.target.matches('input,textarea,select');
  if(TPLED){if(k==='Escape'){TPLED=null;render();}e.stopPropagation();return;}
  if(POP&&POP.type==='appr'){if(k==='Escape'){POP=null;render();}else if(k==='Enter'){e.preventDefault();saveAppr();}else if(!inF){const n=+k;if(n>=1&&n<=5){AP.how=HOW[n-1];render();}}e.stopPropagation();return;}
},true);
render();
'''
rep = {"__DATA__": DATA, "__ICO__": ICO, "__SI__": SI, "__LOGO__": P.LOGO}
for k, v in rep.items(): JS = JS.replace(k, json.dumps(v))
NOTES = [
 ("1 · Outcomes do the next step", "Approved or Declined opens the open ops, already ticked. Untick to approve part, or tick “Decline the rest”. One Log & approve saves the contact, the approvals and the record."),
 ("2 · Text templates", "Pick Text or Email and the suggested template (bronze dot) fills from the RO: name, unit, ops, total, spot. Click the text to change it for this message. Copy & log puts it on the clipboard and logs it. Edit… changes the wording for everyone."),
 ("3 · Who to call", "Each customer keeps its people: role, number, how they like to be reached, who approves. The log starts on the person who approves and warns when calls to someone else keep going unanswered. Copy grabs the number."),
 ("4 · Approval record", "Every approved or declined op shows who, how (Call, Text, Email, In person, Decisiv), when, PO # and who logged it. Ops approved before this show “No record — Add”. Copy record pastes into the Decisiv case notes."),
 ("In Parsec", "People are saved on the customer, so every RO for that fleet shares them. op.appr keeps who, how, when and PO next to its status. Templates are saved with Settings. One new rule: an in-repair RO with an op still waiting on approval shows under Waiting on customers."),
]
about = '<h2>Customer contact<small>Use the four buttons above the frame to jump to each one. Everything else still works: J/K, ↵, the shop clock.</small></h2><ul>' + "".join(f"<li><b>{a}</b>{b}</li>" for a, b in NOTES) + "</ul>"
demos = "".join(f'<button data-demo="{k}">{n}</button>' for k, n in [("out", "1 · Outcomes"), ("tpl", "2 · Templates"), ("who", "3 · Who to call"), ("rec", "4 · Approval record")])
html = f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec Triage customer contact</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap">
<style>{tok}
{bun}
{CSS}</style>
</head>
<body>
<div class="wt-bar"><h1>{P.LOGO}Parsec · Triage — Customer contact</h1><div class="wt-ideas wt-demo">{demos}</div>
<div class="wt-clock">Shop clock <b data-clock>10:15</b><button class="px-btn px-btn--sm" data-tt="1">+1 h</button><button class="px-btn px-btn--sm px-btn--ghost" data-reset>Reset</button></div><button data-caught hidden></button>
<div class="px-seg"><button class="is-on" data-theme-set="light">Ivory</button><button data-theme-set="dark">Graphite</button></div></div>
<div class="wt-stage"><div class="wt-wrap"><div class="mock"></div></div></div>
<div class="wt-about">{about}</div>
<script>{JS}</script>
</body>
</html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html) // 1024, "KB")
