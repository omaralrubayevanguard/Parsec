/* Parsec · ro · transfers.js
   Transfers: a hand-off the other side has to accept (rtSend / rtAccept / rtReturn), hold goals per holder (rtCfg), the log and how long each hold took.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   rtCfg rtGoalMs rtHolder rtHolderName rtHeldSince rtCanAct rtLog rtSend rtAccept rtReturn rtSegments rtDur … (29 functions, 5 constants)
   state      punches ros rtCfg
   uses       access/ data/ kit/ pages/ pages/fixes/ pages/triage/ pages/warranty/ ro-page/ shell/ state/
   at load    wraps RT_COL · on window.matchMedia("( change
*/
/* ============================== RO TRANSFERS ==============================
   Builds on the v152 route. A transfer is a hand-off the other side has to accept: until they
   do, the RO stays with whoever sent it. They can accept it or return it with a reason. Every
   hand-off, accept and return lands in ro.handoffs, so the RO shows how long each department
   held it. Stage rules can send an RO on by themselves when a stage is finished. */
var RT_REASONS = ["Approval needed", "Parts needed", "Tech + bay", "Repair", "Sign-off", "Warranty claim", "Question"];
var RT_RETURN = ["Missing information", "Not approved yet", "Missing part number", "Wrong department", "No bay or tech free", "Not ready yet"];
var RT_RULES0 = [
  { k: "checkin", when: "Check-in done", to: "foreman", mode: "ask" },
  { k: "diag", when: "Diag done — cause on every operation", to: "writer", mode: "ask" },
  { k: "approval", when: "Approval done", to: "parts", mode: "ask" },
  { k: "parts", when: "All parts received", to: "foreman", mode: "ask" },
  { k: "roadtest", when: "Road test passed", to: "manager", mode: "off" },
  { k: "closeout", when: "Close-out done · warranty work", to: "warranty", mode: "ask" }
];
var RT_GOAL0 = { tech: 360, writer: 240, parts: 240, foreman: 120, manager: 180, warranty: 1440 };
function rtCfg(){
  var c = STATE.rtCfg;
  if(!c || typeof c !== "object") c = STATE.rtCfg = {};
  if(!c.goals) c.goals = JSON.parse(JSON.stringify(RT_GOAL0));
  if(!(c.acceptMin > 0)) c.acceptMin = 15;
  if(!Array.isArray(c.rules)) c.rules = JSON.parse(JSON.stringify(RT_RULES0));
  if(c.needAccept === undefined) c.needAccept = true;
  if(!c.na121){ c.needAccept = false; c.na121 = 1; }   /* Parsec 12.1: it is theirs when you send it — Manager → hand-offs can turn accepting back on */
  return c;
}
function rtGoalMs(k){ return (rtCfg().goals[k] || 240) * 60000; }
function rtHolder(ro){
  var r = ro.route;
  if(!r) return { to: "tech", who: ro.assignedTech || "" };
  if(r.state === "pending") return r.from || { to: "tech", who: ro.assignedTech || "" };
  return { to: r.to, who: r.who || "", q: !!r.queue };
}
function rtHolderName(h, ro){ if(h.q) return "Anyone in " + (TRX_DN[h.to] || RT_DEPT[h.to]); return h.to === "tech" ? (h.who || (ro && ro.assignedTech) || "Technician") : (h.who || rtPerson(h.to) || RT_DEPT[h.to]); }
function rtHeldSince(ro){ var r = ro.route; if(!r) return ro.dateOpened || null; if(r.state === "pending") return r.fromAt || null; return r.acceptedAt || r.at; }
function rtCanAct(ro){
  var r = ro.route; if(!r) return false;
  var me = viewAsStaff(); if(!me) return true;                       /* admin sees and does everything */
  if(me.role === "Manager") return true;
  if(r.to === "tech") return me.role === "Technician" && techSame(r.who, me.name);
  return rtKeyOfRole(me.role) === r.to;
}
function rtLog(ro, e){
  if(!Array.isArray(ro.handoffs)) ro.handoffs = [];
  e.id = uid("ho"); ro.handoffs.push(e);
  if(ro.handoffs.length > 120) ro.handoffs = ro.handoffs.slice(-120);
}
function rtSend(ro, k, who, note, step, opt){
  opt = opt || {};
  var me = rtMe(), at = nowIso(), cfg = rtCfg(), from = rtHolder(ro), since = rtHeldSince(ro);
  if(k === "tech" && who && who !== "*") ro.assignedTech = who;
  if(!Array.isArray(ro.routeVisited)) ro.routeVisited = [];
  var was = rtStep(ro); if(ro.routeVisited.indexOf(was) < 0) ro.routeVisited.push(was);
  var need = opt.accept != null ? !!opt.accept : cfg.needAccept;
  ro.route = { to: k, who: who === "*" ? "" : k === "tech" ? (who || ro.assignedTech || "") : (who || ""), queue: who === "*", by: me.name, byRole: me.role, at: at,
    note: String(note || "").trim().slice(0, 300), reason: opt.reason || "", step: step != null ? step : rtStepFor(ro, k), seen: false,
    state: need ? "pending" : "accepted", acceptedAt: need ? null : at, from: from, fromAt: since, auto: !!opt.auto };
  rtLog(ro, { kind: opt.auto ? "auto" : "send", at: at, by: opt.auto ? "Stage rule" : me.name, from: from.to, to: k, who: ro.route.who, note: ro.route.note, reason: ro.route.reason, step: ro.route.step, need: need });
  try{ audit("route", roLabel(ro) + (opt.auto ? " auto-sent" : " sent") + " to " + (k === "tech" ? ro.route.who || "a technician" : RT_DEPT[k]), ro); }catch(e){}
  scheduleSave(true);
  return ro.route;
}
function rtAccept(ro){
  var r = ro.route; if(!r || r.state === "accepted") return;
  var me = rtMe(), at = nowIso(), wait = ageSince(r.at);
  if(r.state === "returned"){ r.state = "accepted"; r.acceptedAt = at; rtLog(ro, { kind: "got", at: at, by: me.name, to: r.to }); scheduleSave(true); return; }
  r.state = "accepted"; r.acceptedAt = at; r.acceptedBy = me.name; r.seen = true;
  rtLog(ro, { kind: "accept", at: at, by: me.name, to: r.to, who: r.who, wait: wait, step: r.step });
  try{ audit("route", roLabel(ro) + " accepted by " + me.name + " (" + RT_LBL[r.to] + ")", ro); }catch(e){}
  scheduleSave(true);
}
function rtReturn(ro, why){
  var r = ro.route; if(!r || r.state !== "pending") return;
  var me = rtMe(), at = nowIso(), back = r.from || { to: RT_ROLE[r.byRole] ? r.byRole : "tech", who: ro.assignedTech || "" };
  var prevStep = (ro.routeVisited || []).slice(-1)[0];
  ro.route = { to: back.to, who: back.who || "", by: me.name, byRole: me.role, at: at, note: why, reason: "Returned", step: prevStep != null ? prevStep : r.step,
    seen: false, state: "returned", acceptedAt: at, retFrom: r.to, from: { to: r.to, who: r.who }, fromAt: at };
  rtLog(ro, { kind: "return", at: at, by: me.name, from: r.to, to: back.to, who: back.who || "", note: why, wait: ageSince(r.at) });
  try{ audit("route", roLabel(ro) + " returned to " + RT_LBL[back.to] + " — " + why, ro); }catch(e){}
  scheduleSave(true);
}
/* who held the RO when: each accept, return or no-accept send changes the holder */
function rtSegments(ro){
  var segs = [], hs = (ro.handoffs || []).slice().sort(function(a, b){ return new Date(a.at) - new Date(b.at); });
  var cur = { to: "tech", step: 0, at: ro.dateOpened ? new Date(ro.dateOpened).toISOString() : (hs[0] ? hs[0].at : null) };
  var push = function(next){ if(cur && cur.at){ var ms = new Date(next.at) - new Date(cur.at); if(ms > 0) segs.push({ to: cur.to, step: cur.step, at: cur.at, ms: ms, ret: cur.ret }); } cur = next; };
  hs.forEach(function(h){
    if(h.kind === "accept") push({ to: h.to, step: h.step, at: h.at });
    else if(h.kind === "return") push({ to: h.to, step: null, at: h.at, ret: true });
    else if((h.kind === "send" || h.kind === "auto") && h.need === false) push({ to: h.to, step: h.step, at: h.at });
    else if(!h.kind) push({ to: h.to, step: null, at: h.at });          /* v152 hand-offs had no accept step */
  });
  if(cur && cur.at){ var end = roIsDone(ro) && ro.status && ro.status.setAt ? new Date(ro.status.setAt) : new Date(); var ms = end - new Date(cur.at); if(ms > 0) segs.push({ to: cur.to, step: cur.step, at: cur.at, ms: ms, ret: cur.ret, now: !roIsDone(ro) }); }
  return segs;
}
function rtDur(ms){ if(ms == null) return ""; var m = Math.round(ms / 60000); if(m < 60) return m + "m"; var h = Math.floor(m / 60); if(h < 24) return h + "h " + String(m % 60).padStart(2, "0") + "m"; return Math.floor(h / 24) + "d " + (h % 24) + "h"; }
/* the stage rule that applies now: the latest finished stage that has a rule */
function rtRuleTarget(ro, rule){
  if(rule.k === "approval") return rtPartsOut(ro) > 0 ? "parts" : "foreman";
  if(rule.k === "closeout") return rtWarrOps(ro).length ? "warranty" : null;
  return rule.to;
}
function rtSuggest(ro){
  var M = null; try{ M = roStages(ro); }catch(e){} if(!M || roIsDone(ro)) return null;
  var rules = rtCfg().rules, best = null;
  M.list.forEach(function(st){
    if(!st.ok || !st.done) return;
    var rule = rules.filter(function(r){ return r.k === st.k; })[0]; if(!rule || rule.mode === "off") return;
    var to = rtRuleTarget(ro, rule); if(!to) return;
    var done = st.doneAt ? new Date(st.doneAt).getTime() : null;
    if(done == null) { best = null; return; }
    /* the RO has already moved on since this stage finished: work clocked after it, or a hand-off after it */
    if(STATE.punches.some(function(p){ return p.roId === ro.id && new Date(p.start).getTime() > done; })) { best = null; return; }
    if(ro.route && new Date(ro.route.at).getTime() > done) { best = null; return; }
    best = { rule: rule, to: to, stage: st };
  });
  if(!best) return null;
  var r = ro.route, h = rtHolder(ro);
  if(r && r.to === best.to && r.state !== "returned") return null;           /* already on its way or there */
  if(h.to === best.to) return null;
  var cur = M.cur;
  best.why = best.rule.when + (cur ? " · next stage: " + cur.name : "");
  return best;
}
/* auto rules fire once, when a stage turns done while the app is watching — never for stages that were done before */
var RT_AUTO_AT = 0;
function rtAutoAll(){
  if(Date.now() - RT_AUTO_AT < 4000) return; RT_AUTO_AT = Date.now();
  var rules = rtCfg().rules, fired = 0;
  STATE.ros.forEach(function(ro){
    if(ro.id === SHOP_RO_ID || ro.shop || roIsDone(ro)) return;
    var M = null; try{ M = roStages(ro); }catch(e){} if(!M) return;
    var first = !ro.rtDone; if(first) ro.rtDone = {};
    M.list.forEach(function(st){
      if(!st.ok || !st.done || ro.rtDone[st.k]) return;
      ro.rtDone[st.k] = 1;
      if(first) return;
      var rule = rules.filter(function(r){ return r.k === st.k; })[0]; if(!rule || rule.mode !== "auto") return;
      var to = rtRuleTarget(ro, rule); if(!to || rtHolder(ro).to === to || (ro.route && ro.route.to === to)) return;
      rtSend(ro, to, to === "tech" ? ro.assignedTech : "", "Sent by the stage rule: " + rule.when, null, { auto: true, reason: rule.when });
      fired++; pushToast(roLabel(ro) + " sent to " + RT_LBL[to] + " — " + rule.when.toLowerCase() + ".");
    });
  });
  if(fired) scheduleSave(true);
}
/* ---- the send form: inline on the RO page (UI.rtDraft) or in the dialog (UI.modal type route) ---- */
function rtDraftObj(){ return UI.modal && UI.modal.type === "route" ? UI.modal : UI.rtDraft; }
function rtSheetHtml(m, inline){
  var ro = getRO(m.roId); if(!ro) return '<p class="hint">That RO is gone.</p>';
  var sg = rtSuggest(ro), nx = rtNext(ro), sugK = sg ? sg.to : (nx != null ? RT_PATH[nx] : null);
  var sub = {
    writer: (function(){ var u = rtUnapproved(ro); return u.length ? u.length + ' to approve' : 'nothing to approve'; })(),
    parts: (function(){ var n = rtPartsOut(ro); return n ? n + ' part' + (n === 1 ? '' : 's') + ' not in hand' : 'no parts waiting'; })(),
    foreman: rtPerson("foreman") || 'tech + bay', tech: m.who || ro.assignedTech || 'pick who', manager: rtPerson("manager") || 'review / sign off',
    warranty: (function(){ var n = rtWarrOps(ro).length; return n ? n + ' warranty op' + (n === 1 ? '' : 's') : 'no warranty ops'; })()
  };
  var h = '<div class="rt2-sheet' + (inline ? ' inline' : '') + '"><div class="rt2-sc"><span class="rt2-lbl">Send ' + esc(roLabel(ro)) + ' to</span><div class="rt2-dsts">'
    + ["tech", "writer", "parts", "foreman", "manager", "warranty"].map(function(k){
        return '<button class="rt2-dst' + (m.to === k ? ' on' : '') + '" data-action="rt-pick" data-to="' + k + '"><span class="rt2-ab" style="background:' + RT_COL[k] + '">' + RT_AB[k] + '</span><span class="rt2-dt"><b>' + RT_LBL[k] + '</b><small>' + esc(sub[k]) + '</small></span>' + (sugK === k ? '<em class="rt2-next">Next</em>' : '') + '</button>';
      }).join('') + '</div>';
  if(m.to === "tech"){
    h += '<div class="rt2-techs">' + rtTechs().map(function(n){
      var c = STATE.ros.filter(function(x){ return !roIsDone(x) && techSame(x.assignedTech, n); }).length;
      return '<button class="rt2-tech' + (m.who && techSame(m.who, n) ? ' on' : '') + '" data-action="rt-who" data-who="' + esc(n) + '"><b>' + esc(n) + '</b><small>' + c + ' open</small></button>';
    }).join('') + (rtTechs().length ? '' : '<p class="hint">No technicians yet.</p>') + '</div>';
  }
  h += '<span class="rt2-lbl">Why</span><div class="rt2-rs">' + RT_REASONS.map(function(x){ return '<button class="rt2-r' + (m.reason === x ? ' on' : '') + '" data-action="rt-reason" data-r="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div></div>'
    + '<div class="rt2-sc"><span class="rt2-lbl">Note</span><textarea id="rt-note" rows="3" maxlength="300" placeholder="e.g. Last part is in — needs a bay with the lift">' + esc(m.note || "") + '</textarea>'
    + '<label class="rt2-acc"><input type="checkbox" id="rt-acc"' + (m.acc === false ? '' : ' checked') + '> ' + (m.to ? esc(m.to === "tech" ? (m.who || "The technician") : RT_LBL[m.to]) : 'They') + ' must accept it — it stays with ' + esc(rtHolderName(rtHolder(ro), ro)) + ' until then</label>'
    + (inline ? '<span class="rt2-sp"></span><div class="rt2-btns"><button class="btn btn-sm" data-action="rt-close">Cancel</button>' + rtSendBtn(m) + '</div>' : '') + '</div></div>';
  return h;
}
function rtSendBtn(m){
  var nm = !m.to ? 'Pick where to send it' : m.to === "tech" ? (m.who ? 'Send to ' + String(m.who).split(" ")[0] : 'Pick a technician') : 'Send to ' + RT_LBL[m.to];
  return '<button class="btn btn-sm btn-primary" data-action="rt-send"' + (!m.to || (m.to === "tech" && !m.who) ? ' disabled data-tip="' + (!m.to ? 'Pick who does the road test first' : 'Pick the tech first') + '"' : '') + '>' + esc(nm) + '</button>';
}
function rtModalBody(m){ return rtSheetHtml(m, false); }
function rtModalFoot(m){ return '<button class="btn" data-action="close-modal">Cancel</button>' + rtSendBtn(m).replace('btn btn-sm btn-primary', 'btn btn-primary'); }
/* ---- B: the Transfer card on the RO page ---- */
function rtCardHtml(ro){
  var r = ro.route, h = rtHolder(ro), since = rtHeldSince(ro), held = since ? ageSince(since) : null, goal = rtGoalMs(h.to);
  var pct = held != null ? Math.min(100, held / goal * 100) : 0, tone = held == null ? "" : held > goal ? "bad" : held > goal * 0.75 ? "warn" : "ok";
  var canAct = rtCanAct(ro), segs = rtSegments(ro), step = rtStep(ro);
  var byStep = {}, byDept = {};
  segs.forEach(function(s){ byDept[s.to] = (byDept[s.to] || 0) + s.ms; if(s.step != null) byStep[s.step] = (byStep[s.step] || 0) + s.ms; });
  var x = '<div class="rt-card rt2" data-key="rt2-' + ro.id + '"><div class="rt2-top"><span class="rt2-lbl">Transfer</span>'
    + '<span class="rt2-with" style="background:' + RT_COL[h.to] + '">With ' + esc(RT_LBL[h.to]) + ' · ' + esc(rtHolderName(h, ro)) + '</span>'
    + (held != null ? '<span class="rt2-hold ' + tone + '" title="Held ' + rtDur(held) + ' — goal ' + rtDur(goal) + '">Holding <b class="mono">' + rtDur(held) + '</b><i><em style="width:' + pct.toFixed(1) + '%"></em></i><small>goal ' + rtDur(goal) + '</small></span>' : '')
    + '<span class="rt2-sp"></span>'
    + (UI.rtDraft && UI.rtDraft.roId === ro.id ? '' : '<button class="btn btn-sm btn-primary" data-action="rt-open" data-ro="' + ro.id + '">Send to…</button>') + '</div>';
  /* pending / returned banner */
  if(r && r.state === "pending"){
    var late = ageSince(r.at) > rtCfg().acceptMin * 60000;
    x += '<div class="rt2-ban ' + (late ? 'late' : 'wait') + '"><b>Sent to ' + esc(r.to === "tech" ? (r.who || "a technician") : RT_LBL[r.to]) + ' ' + esc(rtAge(r.at)) + ' — waiting for them to accept.</b>'
      + '<span>' + (r.reason ? esc(r.reason) + ' · ' : '') + (r.note ? '“' + esc(r.note) + '”' : 'by ' + esc(r.by)) + '</span><span class="rt2-sp"></span>'
      + (canAct ? '<button class="btn btn-sm" data-action="rt-ret-open" data-ro="' + ro.id + '">Return…</button><button class="btn btn-sm btn-primary" data-action="rt-accept" data-ro="' + ro.id + '">Accept</button>' : '')
      + '<button class="btn btn-sm" data-action="rt-takeback" data-ro="' + ro.id + '" title="Cancel this hand-off">Take it back</button></div>';
    if(UI.rtRet === ro.id) x += '<div class="rt2-retm"><span>Send it back to ' + esc(RT_LBL[h.to]) + ' because…</span>' + RT_RETURN.map(function(w){ return '<button class="btn btn-sm" data-action="rt-return" data-ro="' + ro.id + '" data-why="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>';
  } else if(r && r.state === "returned"){
    x += '<div class="rt2-ban ret"><b>Returned by ' + esc(RT_LBL[r.retFrom] || r.by) + ' — “' + esc(r.note) + '”</b><span>' + esc(rtAge(r.at)) + '</span><span class="rt2-sp"></span><button class="btn btn-sm" data-action="rt-accept" data-ro="' + ro.id + '">Got it</button><button class="btn btn-sm btn-primary" data-action="rt-open" data-ro="' + ro.id + '"' + (r.retFrom ? ' data-to="' + r.retFrom + '"' : '') + '>Fix and resend</button></div>';
  }
  /* the route */
  x += '<div class="rt2-path">' + RT_PATH.map(function(k, i){
    var vis = ro.routeVisited || [], cur = i === step && (!r || r.state !== "pending") || (r && r.state === "pending" && r.from && false);
    var st = (i === step) ? "c" : vis.indexOf(i) > -1 ? "d" : (rtApplies(ro, k) || k === "tech" || k === "foreman") ? "t" : "s";
    if(!r && i === 0) st = "c";
    var sub = k === "tech" ? (i === 0 ? "diag" : "repair") : k === "writer" ? "approval" : k === "parts" ? "order" : k === "foreman" ? "tech + bay" : k === "manager" ? "if needed" : "WARR / RECALL";
    if(st === "s") sub = "not needed";
    var ms = byStep[i] || (k !== "tech" && vis.indexOf(i) > -1 ? byDept[k] : 0);
    if(st === "c" && r && r.state === "pending" && r.to === k) sub = "waiting to accept";
    return '<div class="rt2-n ' + st + '"><i style="' + (st === "c" ? 'background:' + RT_COL[k] : '') + '">' + (st === "d" ? '✓' : RT_AB[k]) + '</i><b>' + RT_LBL[k] + '</b><small>' + esc(sub) + '</small>' + (ms ? '<span class="mono">' + (st === "c" ? 'holding ' : '') + rtDur(ms) + '</span>' : '') + '</div>';
  }).join('') + '</div>';
  /* stage rule suggestion */
  var sg = rtSuggest(ro);
  if(sg && !(r && r.state === "pending")){
    var rule = sg.rule;
    x += '<div class="rt2-sug"><span class="rt2-ar">→</span><span class="rt2-st"><b>Stage says next: ' + esc(RT_LBL[sg.to]) + '</b><small>' + esc(sg.why) + '</small></span><span class="rt2-sp"></span>'
      + '<button class="rt2-mode" data-action="rt-mode" data-k="' + rule.k + '" title="How this rule works for every RO — click to change">' + ["auto", "ask", "off"].map(function(md){ return '<span class="' + (rule.mode === md ? 'on' : '') + '">' + { auto: "Auto", ask: "Ask", off: "Off" }[md] + '</span>'; }).join('') + '</button>'
      + '<button class="btn btn-sm btn-primary" data-action="rt-open" data-ro="' + ro.id + '" data-to="' + sg.to + '" data-r="' + esc(rule.when) + '">Send to ' + esc(RT_LBL[sg.to]) + '</button></div>';
  }
  /* inline send form */
  if(UI.rtDraft && UI.rtDraft.roId === ro.id) x += rtSheetHtml(UI.rtDraft, true);
  /* history */
  if(segs.length || (ro.handoffs || []).length){
    var tot = segs.reduce(function(a, s){ return a + s.ms; }, 0) || 1;
    x += '<div class="rt2-hist"><span class="rt2-lbl">Transfer history</span><div class="rt2-lane">' + segs.map(function(s){
        return '<i style="flex:' + Math.max(s.ms / tot, 0.04).toFixed(3) + ';background:' + (s.ret ? 'var(--k8e4a3c)' : RT_COL[s.to]) + '" title="' + esc(RT_LBL[s.to] + ' · ' + rtDur(s.ms) + (s.now ? ' · now' : '')) + '">' + esc(RT_LBL[s.to] + ' ' + rtDur(s.ms)) + (s.now ? ' · now' : '') + '</i>';
      }).join('') + '</div>'
      + (ro.handoffs || []).slice(-6).reverse().map(function(e){
          var what = e.kind === "accept" ? '<b>' + esc(RT_LBL[e.to]) + ' accepted</b>' : e.kind === "return" ? '<b>' + esc(RT_LBL[e.from]) + ' returned it to ' + esc(RT_LBL[e.to]) + '</b>' : e.kind === "got" ? '<b>' + esc(RT_LBL[e.to]) + ' took it back</b>' : e.kind === "cancel" ? '<b>Hand-off taken back</b>'
            : '<b>' + esc(e.from ? RT_LBL[e.from] : String(e.by || "").split(" ")[0]) + ' → ' + esc(e.to === "tech" ? (e.who ? String(e.who).split(" ")[0] : "Technician") : RT_LBL[e.to]) + '</b>';
          var tag = e.kind === "accept" ? '<em class="ok">accepted in ' + rtDur(e.wait) + '</em>' : e.kind === "return" ? '<em class="bad">returned</em>' : e.kind === "auto" ? '<em class="auto">stage rule</em>' : '';
          return '<div class="rt2-h"><span class="mono">' + esc(fmtDate(e.at)) + ' ' + esc(fmtTime(e.at)) + '</span>' + what + '<span class="rt2-hn">' + esc([e.reason, e.note ? '“' + e.note + '”' : ''].filter(Boolean).join(' · ')) + (e.kind !== "auto" && e.by ? ' <small>— ' + esc(e.by) + '</small>' : '') + '</span>' + tag + '</div>';
        }).join('') + '</div>';
  }
  return x + '</div>';
}
/* ---- C: the department inbox at the top of each page ---- */
function rtInboxHtml(k){
  var me = viewAsStaff(), admin = !me;
  var mine = function(ro){
    if(ro.id === SHOP_RO_ID || roIsDone(ro) || !ro.route) return false;
    if(admin || me.role === "Manager") return true;
    if(k === "tech") return me.role === "Technician" && techSame(ro.route.who, me.name);
    return rtKeyOfRole(me.role) === k;
  };
  var all = STATE.ros.filter(mine);
  var inc = all.filter(function(ro){ return ro.route.to === k && ro.route.state === "pending"; });
  var hold = all.filter(function(ro){ return ro.route.to === k && (!ro.route.state || ro.route.state === "accepted"); });
  var ret = all.filter(function(ro){ return ro.route.to === k && ro.route.state === "returned"; });
  var sent = all.filter(function(ro){ return ro.route.state === "pending" && ro.route.from && ro.route.from.to === k && ro.route.to !== k; });
  if(!inc.length && !hold.length && !ret.length && !sent.length) return "";
  UI.rtTab = UI.rtTab || {};
  var tab = UI.rtTab[k] || (inc.length ? "in" : ret.length ? "ret" : hold.length ? "hold" : "sent");
  var goal = rtGoalMs(k), acc = rtCfg().acceptMin * 60000;
  var tabs = [["in", "Incoming", inc], ["hold", "Holding", hold], ["ret", "Returned", ret], ["sent", "Sent", sent]].map(function(t){
    return '<button class="rt2-tab' + (tab === t[0] ? ' on' : '') + (t[0] === "in" && t[2].length ? ' hot' : '') + '" data-action="rt-tab" data-k="' + k + '" data-t="' + t[0] + '">' + t[1] + ' <span class="mono">' + t[2].length + '</span></button>';
  }).join('');
  var row = function(ro, side, acts){
    return '<div class="rt2-ir"><i style="background:' + side + '"></i><button class="rt2-im" data-action="goto-ro" data-ro="' + ro.id + '"><span><b class="mono">' + esc(roLabel(ro)) + '</b> <b>' + esc(ro.customerName || '') + '</b>' + (ro.location ? ' <em>' + esc(ro.location) + '</em>' : '') + '</span>'
      + '<small>' + acts.sub + '</small></button><span class="rt2-ia">' + acts.right + '</span></div>';
  };
  var body = "";
  var list = tab === "in" ? inc : tab === "hold" ? hold : tab === "ret" ? ret : sent;
  var floor = k === "foreman" ? yardSpots().filter(function(s){ return s.zone === "bay" || s.zone === "uptime" || s.zone === "awning"; }) : [], ym = k === "foreman" ? yardMap().map : {}, techs = k === "foreman" ? rtTechs() : [];
  list.sort(function(a, b){ return new Date(a.route.at) - new Date(b.route.at); }).forEach(function(ro){
    var r = ro.route, from = r.from ? RT_LBL[r.from.to] : r.by;
    if(tab === "in"){
      var w = ageSince(r.at), late = w > acc;
      body += row(ro, RT_COL[r.from ? r.from.to : "tech"], { sub: 'From <b>' + esc(from) + '</b> · ' + esc(r.by) + (r.reason ? ' · ' + esc(r.reason) : '') + (r.note ? ' · “' + esc(r.note) + '”' : '') + (r.auto ? ' · stage rule' : ''),
        right: '<span class="rt2-pill' + (late ? ' late' : '') + '">waiting ' + rtDur(w) + '</span><button class="btn btn-sm" data-action="rt-ret-open" data-ro="' + ro.id + '">Return…</button><button class="btn btn-sm btn-primary" data-action="rt-accept" data-ro="' + ro.id + '">Accept</button>' });
      if(UI.rtRet === ro.id) body += '<div class="rt2-retm">' + '<span>Send it back to ' + esc(from) + ' because…</span>' + RT_RETURN.map(function(wy){ return '<button class="btn btn-sm" data-action="rt-return" data-ro="' + ro.id + '" data-why="' + esc(wy) + '">' + esc(wy) + '</button>'; }).join('') + '</div>';
    } else if(tab === "hold"){
      var hm = ageSince(r.acceptedAt || r.at), p = Math.min(100, hm / goal * 100), tn = hm > goal ? "bad" : hm > goal * .75 ? "warn" : "ok";
      var right = '<span class="rt2-hb ' + tn + '"><i><em style="width:' + p.toFixed(1) + '%"></em></i><b class="mono">' + rtDur(hm) + (hm > goal ? ' · over' : '') + '</b></span>';
      if(k === "foreman"){
        var curSp = spotOf(ro.location);
        right += '<select data-rt-tech="' + ro.id + '"><option value="">Tech…</option>' + techs.map(function(n){ return '<option' + (techSame(ro.assignedTech, n) ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join("") + '</select>'
          + '<select data-rt-bay="' + ro.id + '"><option value="">Bay…</option>' + floor.map(function(sp){ var o = ym[sp.id]; return '<option value="' + esc(sp.id) + '"' + (curSp === sp.id ? ' selected' : '') + '>' + esc(sp.id) + (o && o !== ro ? ' · ' + esc(roLabel(o)) : '') + '</option>'; }).join("") + '</select>'
          + '<button class="btn btn-sm btn-primary" data-action="rt-assign" data-ro="' + ro.id + '">Assign &amp; send</button>';
      } else if(RT_ACT[k]) right += '<button class="btn btn-sm btn-primary" data-action="rt-act" data-ro="' + ro.id + '">' + RT_ACT[k][1] + ' → send back</button>';
      else right += '<button class="btn btn-sm" data-action="rt-open" data-ro="' + ro.id + '">Send to…</button>';
      body += row(ro, RT_COL[k], { sub: (r.reason ? esc(r.reason) + ' · ' : '') + 'accepted ' + esc(rtAge(r.acceptedAt || r.at)) + (r.note ? ' · “' + esc(r.note) + '”' : ''), right: right });
    } else if(tab === "ret"){
      body += row(ro, "var(--k8e4a3c)", { sub: 'Returned by <b>' + esc(RT_LBL[r.retFrom] || r.by) + '</b> · “' + esc(r.note) + '” · ' + esc(rtAge(r.at)),
        right: '<button class="btn btn-sm" data-action="rt-accept" data-ro="' + ro.id + '">Got it</button><button class="btn btn-sm btn-primary" data-action="rt-open" data-ro="' + ro.id + '"' + (r.retFrom ? ' data-to="' + r.retFrom + '"' : '') + '>Fix and resend</button>' });
    } else {
      var ws = ageSince(r.at);
      body += row(ro, RT_COL[r.to], { sub: 'to <b>' + esc(r.to === "tech" ? (r.who || "a technician") : RT_LBL[r.to]) + '</b>' + (r.reason ? ' · ' + esc(r.reason) : ''),
        right: '<span class="rt2-pill' + (ws > acc ? ' late' : '') + '">waiting ' + rtDur(ws) + '</span><button class="btn btn-sm" data-action="rt-takeback" data-ro="' + ro.id + '">Take it back</button>' });
    }
  });
  if(!list.length) body = '<p class="hint rt2-empty">' + { in: "Nothing waiting for you to accept.", hold: "You are not holding any ROs.", ret: "Nothing returned.", sent: "Nothing waiting on anyone else." }[tab] + '</p>';
  return '<section class="rt-inbox rt2-inbox" data-key="rt2-in-' + k + '"><div class="rt2-ih"><b>' + esc(RT_LBL[k]) + ' inbox</b>' + tabs + '<span class="rt2-sp"></span><small>Accept within <b>' + rtCfg().acceptMin + ' min</b> · hold under <b>' + rtDur(goal) + '</b></small></div>' + body + '</section>';
}
function rtAct(a, t){
  var ro, d;
  var keepNote = function(){ var dd = rtDraftObj(); if(!dd) return; var n = document.getElementById("rt-note"); if(n) dd.note = n.value; var ac = document.getElementById("rt-acc"); if(ac) dd.acc = ac.checked; };
  if(a === "rt-open"){
    ro = getRO(t.dataset.ro); if(!ro) return true;
    var d0 = { roId: ro.id, to: t.dataset.to || null, who: null, note: "", reason: t.dataset.r || "", acc: rtCfg().needAccept };
    if(d0.to === "tech") d0.who = ro.assignedTech || null;
    if(t.closest && t.closest(".rt2-sug") && d0.to && (d0.to !== "tech" || d0.who)){ pushUndo("send RO"); rtSend(ro, d0.to, d0.who, "", null, { reason: d0.reason, accept: d0.acc !== false }); pushToast(roLabel(ro) + " sent to " + rtWhoText(ro) + ".", true); render(); try{ if(typeof JC !== "undefined" && JC && JC.rerender) JC.rerender(); }catch(e){} return true; }   /* Parsec 14.1 */
    UI.rtRet = null;
    if(t.closest && t.closest(".rt2") && UI.view === "ros"){ UI.rtDraft = d0; }
    else { d0.type = "route"; UI.modal = d0; }
    render(); return true;
  }
  if(a === "rt-close"){ UI.rtDraft = null; render(); return true; }
  if(a === "rt-pick"){ d = rtDraftObj(); if(!d) return true; keepNote(); d.to = t.dataset.to; d.who = d.to === "tech" ? (getRO(d.roId) || {}).assignedTech || null : null; render(); return true; }
  if(a === "rt-who"){ d = rtDraftObj(); if(!d) return true; keepNote(); d.who = t.dataset.who; render(); return true; }
  if(a === "rt-reason"){ d = rtDraftObj(); if(!d) return true; keepNote(); d.reason = d.reason === t.dataset.r ? "" : t.dataset.r; render(); return true; }
  if(a === "rt-send"){
    d = rtDraftObj(); if(!d) return true; keepNote(); ro = getRO(d.roId); if(!ro || !d.to) return true;
    if(d.to === "tech" && !d.who){ pushToast("Pick a technician first."); return true; }
    pushUndo("send RO"); rtSend(ro, d.to, d.who, d.note, null, { reason: d.reason, accept: d.acc !== false });
    if(UI.modal && UI.modal.type === "route") UI.modal = null; UI.rtDraft = null;
    pushToast(roLabel(ro) + " sent to " + (d.to === "tech" ? d.who : RT_LBL[d.to]) + (ro.route.state === "pending" ? " — waiting for them to accept." : "."), true);
    render(); return true;
  }
  if(a === "rt-accept"){ ro = getRO(t.dataset.ro); if(!ro) return true; pushUndo("accept RO"); var wasRet = ro.route && ro.route.state === "returned"; rtAccept(ro); UI.rtRet = null; pushToast(roLabel(ro) + (wasRet ? " — back with you." : " accepted."), true); render(); return true; }
  if(a === "rt-ret-open"){ UI.rtRet = UI.rtRet === t.dataset.ro ? null : t.dataset.ro; render(); return true; }
  if(a === "rt-return"){ ro = getRO(t.dataset.ro); if(!ro) return true; pushUndo("return RO"); rtReturn(ro, t.dataset.why); UI.rtRet = null; pushToast(roLabel(ro) + " returned — " + t.dataset.why.toLowerCase() + ".", true); render(); return true; }
  if(a === "rt-takeback"){
    ro = getRO(t.dataset.ro); if(!ro || !ro.route || ro.route.state !== "pending") return true;
    pushUndo("take back"); var fr = ro.route.from || { to: "tech", who: ro.assignedTech };
    var prevStep = (ro.routeVisited || []).slice(-1)[0];
    ro.route = { to: fr.to, who: fr.who || "", by: rtMe().name, byRole: rtMe().role, at: ro.route.fromAt || nowIso(), note: "", step: prevStep != null ? prevStep : 0, seen: true, state: "accepted", acceptedAt: ro.route.fromAt || nowIso() };
    rtLog(ro, { kind: "cancel", at: nowIso(), by: rtMe().name, to: fr.to });
    scheduleSave(true); pushToast("Hand-off cancelled — " + roLabel(ro) + " stays with " + RT_LBL[fr.to] + ".", true); render(); return true;
  }
  if(a === "rt-tab"){ UI.rtTab = UI.rtTab || {}; UI.rtTab[t.dataset.k] = t.dataset.t; UI.rtRet = null; render(); return true; }
  if(a === "rt-flow"){ UI.rtFlowSel = t.dataset.k; render(); return true; }
  if(a === "rt-mode"){
    var rl = rtCfg().rules.filter(function(x){ return x.k === t.dataset.k; })[0]; if(!rl) return true;
    rl.mode = rl.mode === "auto" ? "ask" : rl.mode === "ask" ? "off" : "auto";
    scheduleSave(true); pushToast("“" + rl.when + "” — " + { auto: "sends the RO on by itself", ask: "suggests where to send it", off: "off" }[rl.mode] + ".");
    render(); return true;
  }
  return rtActV1(a, t);
}

RT_COL = { tech: "#3b82f6", writer: "#8b5cf6", parts: "#d97706", foreman: "#0d9488", manager: "#db2777", warranty: "#16a34a" };
function raHtml(ro){
  var n = raNext(ro), tab = UI.raTab || null;
  var cnt = { checks: raLive(ro).filter(function(op){ var c = raCcc(op); return !c.c || !c.ca || !c.co; }).length,
    parts: raLive(ro).reduce(function(a, op){ return a + opRealParts(op).filter(function(p){ return p.status !== "Installed"; }).length; }, 0),
    appr: raLive(ro).filter(function(op){ return !op.appr && ["WARR","RECALL"].indexOf(opJobType(op)) < 0; }).length,
    contacts: (ro.contacts || []).length, story: 0, fixes: raLive(ro).filter(function(op){ return fixSourceFor(ro, op).length; }).length };
  /* list + work — the next step on its own line; Checks / Approval / Contacts / Story / Fixes open from "More" in the dock */
  var nm = (RA_TABS.filter(function(t){ return t[0] === tab; })[0] || [])[1];
  if(tab === "parts") tab = null;
  return raNextBarHtml(ro) + (tab ? '<div class="ra-more"><div class="ra-more-h"><b>' + esc(nm || "") + '</b><span class="ra-sp"></span><button class="ra-close" data-action="ra-tab" data-k="" title="Close" aria-label="Close">✕</button></div><div class="ra-body">' + raTabBody(ro, tab) + '</div></div>' : '');
  return '<div class="ra-tabs" role="tablist">' + RA_TABS.map(function(t){ return '<button role="tab" aria-selected="'+(tab === t[0])+'" class="'+(tab === t[0] ? 'on' : '')+'" data-action="ra-tab" data-k="'+t[0]+'">'+t[1]+(cnt[t[0]] ? ' <span class="mono">'+cnt[t[0]]+'</span>' : '')+'</button>'; }).join('')
    + (tab ? '<button class="ra-close" data-action="ra-tab" data-k="" title="Close">✕</button>' : '') + '</div>'
    + (tab ? '<div class="ra-body">' + raTabBody(ro, tab) + '</div>' : '')
    + rtCardHtml(ro)
    + raNextBarHtml(ro);   /* the next step sits right above the RO details */
}
function raBarHtml(ro){
  var m = roMoney(ro), q = 0, b = 0, ap = 0;
  raLive(ro).forEach(function(op){ q += +op.quoted || 0; b += raBurnt(op); if(op.appr || ["WARR","RECALL"].indexOf(opJobType(op)) > -1) ap += opMoney(op).total; });
  var over = b > q && q > 0;
  return '<span>Labor <b class="mono">'+money(m.labor)+'</b></span><span>Parts <b class="mono">'+money(m.parts)+'</b></span>'+(m.other ? '<span>Other <b class="mono">'+money(m.other)+'</b></span>' : '')
    + '<span class="ra-tot">Estimate <b class="mono">'+money(m.total)+'</b></span><span>Approved <b class="mono">'+money(ap)+'</b></span>'
    + '<span class="'+(over ? 'ra-over' : '')+'">Burnt / quoted <b class="mono">'+fmtDec(b)+' / '+fmtDec(q)+' h</b></span>'
    + '<span class="ra-bb"><i style="width:'+(q ? Math.min(100, b / q * 100) : 0).toFixed(1)+'%"></i></span>';
}
function raMount(pane, ro){
  var host = pane.querySelector(":scope > .jc-host"); if(!host) return;
  var top = host.querySelector(":scope > .ra-host") || pane.querySelector(":scope > .ra-host"), bar = pane.querySelector(":scope > .ra-bar");
  if(!top){ top = document.createElement("div"); top.className = "ra-host"; }
  /* the next step, tabs and transfer card are slotted into the console, between Ready to close and the RO header */
  top.setAttribute("slot", "ra");
  if(top.parentNode !== host) host.appendChild(top);
  if(!bar){ bar = document.createElement("div"); bar.className = "ra-bar"; }
  if(bar.previousSibling !== host || bar.parentNode !== pane) host.after(bar);
  if(ro.route && !ro.route.seen && rtIsMine(ro)){ ro.route.seen = true; ro.route.seenAt = nowIso(); scheduleSave(); }
  var a = document.activeElement, typing = a && top.contains(a) && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) && a.id !== "ra-st";
  var h = raHtml(ro);
  if(!typing && top.__h !== h){ top.innerHTML = h; top.__h = h; }
  var hb = raBarHtml(ro); if(bar.__h !== hb){ bar.innerHTML = hb; bar.__h = hb; }
  var dkm = host.shadowRoot && host.shadowRoot.querySelector('.dkMoney'); if(dkm && !ro.shop && dkm.__h !== hb){ dkm.innerHTML = hb; dkm.__h = hb; }
}
function raAct(a, t){
  var ro = t.dataset.ro ? getRO(t.dataset.ro) : null, op = ro && t.dataset.op ? (ro.operations || []).filter(function(o){ return o.id === t.dataset.op; })[0] : null;
  if(a === "ra-tab"){ UI.raTab = t.dataset.k ? (UI.raTab === t.dataset.k ? null : t.dataset.k) : null; persistUI(); render(); return; }
  if(a === "ra-goop" && ro && op){ if(typeof openRoAt === "function") openRoAt(ro.id, op.id); return; }
  if(a === "ra-copy"){ var ta = document.getElementById("ra-st"); if(!ta) return;
    var done = function(){ pushToast("Story copied."); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function(){ ta.select(); document.execCommand("copy"); done(); });
    else { ta.select(); document.execCommand("copy"); done(); } return; }
  if(a === "ra-part" && op){ var p = (op.parts || []).filter(function(x){ return x.id === t.dataset.pt; })[0]; if(!p) return;
    var i = Math.max(0, RA_PST.indexOf(p.status || "Not Ordered")) + (+t.dataset.d), ns = RA_PST[Math.max(0, Math.min(RA_PST.length - 1, i))];
    pushUndo("part status"); p.status = ns; p.statusChangedAt = nowIso(); scheduleSave(true); render(); pushToast((p.description || p.partNumber || "Part") + " → " + ns); return; }
  if(a === "ra-appr" && op){ var s = t.dataset.s; pushUndo("approval");
    if(op.appr && op.appr.s === s){ op.appr = null; if(s === "no") op.declined = false; }
    else { op.appr = { s: s, by: punchByName() || "", at: nowIso() }; op.declined = s === "no"; }
    audit("approval", roLabel(ro) + " Op " + raN(ro, op) + ": " + (op.appr ? { ok: "approved", part: "partly approved", no: "declined" }[s] : "approval cleared"), ro);
    scheduleSave(true); render(); return; }
  if(a === "ra-appr-all" && ro){ pushUndo("approve all"); var n = 0;
    raLive(ro).forEach(function(o){ if(!o.appr && ["WARR","RECALL"].indexOf(opJobType(o)) < 0){ o.appr = { s: "ok", by: punchByName() || "", at: nowIso() }; n++; } });
    if(n){ audit("approval", roLabel(ro) + ": approved " + n + " operation" + (n === 1 ? "" : "s"), ro); scheduleSave(true); pushToast(n + " approved."); } render(); return; }
  if(a === "ra-contact" && ro){ var v = function(id){ var e = document.getElementById(id); return e ? e.value : ""; };
    if(!Array.isArray(ro.contacts)) ro.contacts = [];
    ro.contacts.push({ id: uid("ct"), at: nowIso(), by: punchByName() || "", kind: v("ra-ck"), out: v("ra-co"), note: v("ra-cn").trim() });
    audit("contact", roLabel(ro) + " · " + v("ra-ck") + " — " + v("ra-co"), ro);
    var ne = document.getElementById("ra-cn"); if(ne) ne.value = ""; if(document.activeElement) document.activeElement.blur();
    scheduleSave(true); render(); return; }
  if(a === "ra-contact-del" && ro){ pushUndo("remove contact"); ro.contacts = (ro.contacts || []).filter(function(c){ return c.id !== t.dataset.id; }); scheduleSave(true); render(); return; }
  if(a === "ra-fix-use" && op){ var sr = getRO(t.dataset.sro), so = sr && (sr.operations || []).filter(function(o){ return o.id === t.dataset.sop; })[0]; if(!so) return;
    pushUndo("use a past fix");
    if(+so.quoted > 0) op.quoted = +so.quoted; else if(+so.burnt > 0) op.quoted = Math.round(+so.burnt * 10) / 10;
    if(!opRealParts(op).length) op.parts = opRealParts(so).map(function(p){ return { id: "pt_" + uid("p"), description: p.description || "", partNumber: p.partNumber || "", eta: "", qty: String(p.qty || "1"), price: priceOf(p.price) ? priceOf(p.price) : (invPriceOf(p.partNumber, p.description) ? invPriceOf(p.partNumber, p.description) : ""), status: "Not Ordered", statusChangedAt: nowIso(), fromFix: true }; });
    op.fxQ = op.fxP = { ro: sr.roNumber, roId: sr.id, opId: so.id, at: nowIso() };
    scheduleSave(true); render(); pushToast("Time and parts from " + roLabel(sr) + "."); return; }
}
function attachConsole(){
  var pane = document.querySelector(".ro-detail-pane[data-jc]");
  if(!pane) return;
  var ro = getRO(pane.getAttribute("data-jc"));
  if(!ro) return;
  migrateRO(ro);
  JC.attach(pane, ro);
  try{ raMount(pane, ro); }catch(e){ console.error(e); }
  try{ rpMountRo(); }catch(e){ console.error(e); }   /* 17.1: the one RO panel in its right column */
  var oldSeam = pane.querySelector(":scope > .seam-dock"); if(oldSeam) oldSeam.remove();
  var host = pane.querySelector(".jc-host");
  if(host){ host.classList.toggle("rail-mini", railIsMini()); host.classList.remove("rail-stack"); }
}
/* The list's hide/show tab, docked on the console pane's left edge. */

/* Large touch targets: follows the screen (touch = on) until you choose in the ☰ menu. */
function isDarkTheme(){
  return !!(THEMES[resolvedTheme()] || THEMES.mist).dark;
}
if(window.matchMedia){ try{ window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(){ applyBigTouch(); }); }catch(e){} }
