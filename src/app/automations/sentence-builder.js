/* Parsec · automations · sentence-builder.js
   A custom rule reads as a sentence (16.2 B): When [event] [qualifier] and [detail is] [value] then [action] to [value]; the builder's chips and keyboard, the test run over the last 7 days, save.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v162bM v162bTrig v162bFieldPh v162bActPh v162bVal v162bList v162bQualIdx v162bTokens v162bText v162bMissing v162bMenuOpts v162bChip … (47 functions, 11 constants)
   state      punches ros
   uses       data/ import/ kit/ ro/ ro-page/ shell/ state/
   at load    on document keydown · on document click · builds NOTE_DRAFTS (a closure) · on window beforeunload
*/
/* ======================================================================= Parsec 16.2 (B): a custom rule reads as a sentence
   Settings → Automations → Custom rules. Underneath it is the rule the runner (autoEvaluate) has always read:
     { id, name, on, mode, when, conds: [{ f, op, v }], acts: [{ a, v }] }   (+ tested: when it was last tried, ISO)
   so every rule saved before 16.2 shows as a sentence with nothing converted, and runs as it did.
   Grammar (each [chip] opens a short menu of the options the old drop-downs offered):
     When [trigger]  [qualifier]  { and [detail is/isn't] [value] }  then [action] (to|saying) [value]  { and [action] … }
     trigger   AUTO_TRIGGERS, said as an event ("an operation’s clock stops")
     qualifier the trigger's own detail, read in place: the first condition on that trigger's field with "is"
               ("stops as Complete", "changes to Hold Tech"); its menu starts with "Any reason" / "Any status"
     detail    AUTO_FIELDS × amOps ("the RO is", "the stop reason isn’t", "it’s after") · value amOptionsFor or typed
     action    AUTO_ACTIONS ("set the RO status") · value amOptionsFor or typed (note, reminder, work-log stamp)
   Test run: the rule against the current ROs and what happened in the last 7 days — punches started and stopped
   (STATE.punches), status and part changes, edits, ticks and files (each RO's history) — read only, nothing changes. */
var V162B = { days: 7 };
var V162B_TRIG = {
  "punch.start": "an operation’s clock starts", "punch.stop": "an operation’s clock stops", "punch.edit": "a punch is edited",
  "job.status": "an operation’s status changes", "part.status": "a part’s status changes", "parts.allReceived": "all of an operation’s parts are in",
  "jobs.allComplete": "every operation on the RO is complete", "ro.status": "the RO status changes", "task.tick": "a task is ticked", "file.add": "a file is added"
};
var V162B_QUAL = {
  "punch.stop": { f: "stopReason", w: "as", any: "for any reason", opt: "Any reason" },
  "punch.start": { f: "startReason", w: "for", any: "for any reason", opt: "Any reason" },
  "job.status": { f: "jobStatus", w: "to", any: "to any status", opt: "Any status" },
  "ro.status": { f: "roStatus", w: "to", any: "to any status", opt: "Any status" },
  "part.status": { f: "partStatus", w: "to", any: "to any status", opt: "Any status" }
};
var V162B_FIELD = {
  startReason: { is: "the start reason is", not: "the start reason isn’t", noun: "the start reason" },
  stopReason: { is: "the stop reason is", not: "the stop reason isn’t", noun: "the stop reason" },
  jobType: { is: "the operation type is", not: "the operation type isn’t", noun: "the operation type" },
  jobStatus: { is: "the operation is", not: "the operation isn’t", noun: "the operation" },
  roStatus: { is: "the RO is", not: "the RO isn’t", noun: "the RO" },
  partStatus: { is: "the part is", not: "the part isn’t", noun: "the part" },
  customer: { contains: "the customer’s name has", is: "the customer is", noun: "the customer" },
  overQuoted: { is: "the hours burnt are", not: "the hours burnt aren’t", noun: "the hours burnt" },
  hour: { after: "it’s after", before: "it’s before", noun: "the time" }
};
var V162B_OVER = { yes: "over the quote", no: "within the quote" };
var V162B_ACT = {
  roStatus: ["set the RO status", "to"], jobStatus: ["set the operation status", "to"], note: ["add an RO note line", "saying"],
  remind: ["add a reminder", "to"], stamp: ["stamp the work log with", ""], task: ["tick a task (retired)", ""]
};
var V162B_DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function v162bM(){ return UI.modal; }   /* the panel's state: { edit, chip, test } */
function v162bTrig(k){ return V162B_TRIG[k] || (k ? String(autoLabel(AUTO_TRIGGERS, k)).toLowerCase() : ""); }
function v162bFieldPh(f, op){ var x = V162B_FIELD[f]; return x && x[op] ? x[op] : (f ? String(autoLabel(AUTO_FIELDS, f)).toLowerCase() + " " + autoLabel(amOps(f), op) : ""); }
function v162bActPh(a){ return V162B_ACT[a] ? V162B_ACT[a][0] : (a ? String(autoLabel(AUTO_ACTIONS, a)).toLowerCase() : ""); }
function v162bVal(k, v){ if(v == null || v === "") return ""; return k === "overQuoted" ? (V162B_OVER[v] || v) : String(autoValueLabel(k, v)); }
function v162bList(k){ var o = amOptionsFor(k); return o ? o.map(function(x){ return Array.isArray(x) ? [String(x[0]), k === "overQuoted" ? V162B_OVER[x[0]] || x[1] : String(x[1])] : [String(x), k === "overQuoted" ? V162B_OVER[x] || x : String(x)]; }) : null; }
function v162bQualIdx(r){
  var q = V162B_QUAL[r.when]; if(!q) return -1;
  var c = r.conds || [];
  for(var i = 0; i < c.length; i++) if(c[i] && c[i].f === q.f && c[i].op === "is" && c[i].v != null && c[i].v !== "") return i;
  return -1;
}
/* the sentence, as a list of pieces: words, chips, typed boxes and remove buttons — drawn and read from the same list */
function v162bTokens(r){
  var T = [], W = function(s){ T.push({ w: s }); }, conds = r.conds || [], acts = r.acts || [], qi = v162bQualIdx(r), q = V162B_QUAL[r.when];
  W("When");
  T.push({ chip: "when", label: v162bTrig(r.when), ph: "pick an event", aria: "Event" });
  if(q){
    if(qi >= 0){ W(q.w); T.push({ chip: "q", label: v162bVal(q.f, conds[qi].v), aria: q.opt }); }
    else T.push({ chip: "q", label: q.any, ghost: true, aria: q.opt });
  }
  conds.forEach(function(c, i){
    if(i === qi) return;
    W("and");
    T.push({ chip: "cf:" + i, label: c.f ? v162bFieldPh(c.f, c.op) : "", ph: "pick a detail", aria: "Condition" });
    if(c.f){
      if(amOptionsFor(c.f)) T.push({ chip: "cv:" + i, label: v162bVal(c.f, c.v), ph: "pick one", aria: "Value" });
      else T.push({ inp: "cv:" + i, key: c.f, v: c.v == null ? "" : String(c.v) });
    }
    T.push({ x: "am-del-cond", i: i, what: "condition" });
  });
  W("then");
  acts.forEach(function(a, i){
    if(i) W("and");
    T.push({ chip: "aa:" + i, label: v162bActPh(a.a), ph: "pick an action", aria: "Action" });
    if(a.a){
      var link = V162B_ACT[a.a] ? V162B_ACT[a.a][1] : "";
      if(amOptionsFor(a.a)){ if(link) W(link); T.push({ chip: "av:" + i, label: v162bVal(a.a, a.v), ph: "pick one", aria: "Value" }); }
      else if(a.a !== "task"){ if(link) W(link); T.push({ inp: "av:" + i, key: a.a, v: a.v == null ? "" : String(a.v) }); }
    }
    if(acts.length > 1) T.push({ x: "am-del-act", i: i, what: "action" });
  });
  return T;
}
function v162bText(r){
  return v162bTokens(r).map(function(t){
    if(t.w) return t.w;
    if(t.chip) return t.label || "…";
    if(t.inp) return t.v ? (t.key === "hour" ? t.v : "“" + t.v + "”") : "…";
    return "";
  }).filter(Boolean).join(" ");
}
/* what's still to pick, in words ("" when the sentence is whole) */
function v162bMissing(r){
  if(!r || !r.when) return "pick an event";
  var conds = r.conds || [], acts = r.acts || [];
  for(var i = 0; i < conds.length; i++){
    var c = conds[i];
    if(!c || !c.f || !c.op) return "pick a detail after “and”";
    if(c.v == null || String(c.v).trim() === "") return c.f === "customer" ? "type the customer’s name" : c.f === "hour" ? "pick a time" : "pick a value for “" + v162bFieldPh(c.f, c.op) + "”";
  }
  if(!acts.length) return "pick an action";
  for(var j = 0; j < acts.length; j++){
    var a = acts[j];
    if(!a || !a.a) return "pick an action after “then”";
    if(a.a === "stamp" || a.a === "task") continue;
    if(a.v == null || String(a.v).trim() === "") return a.a === "note" ? "type the note" : a.a === "remind" ? "type the reminder" : "pick a status to set";
  }
  return "";
}
/* ---- drawing ---- */
function v162bMenuOpts(e, slot){
  var m = /^(\w+):(\d+)$/.exec(slot), k = m ? m[1] : slot, i = m ? +m[2] : -1, L = [], cur = "";
  var keep = function(v, l){ if(v !== "" && !L.some(function(x){ return x[0] === v; })) L.push([v, l || v]); };   /* a value no list has any more stays pickable */
  if(k === "when"){ L = AUTO_TRIGGERS.map(function(x){ return [x[0], v162bTrig(x[0])]; }); cur = e.when || ""; keep(cur, v162bTrig(cur)); }
  else if(k === "q"){ var q = V162B_QUAL[e.when]; if(!q) return { L: [], cur: "" }; var qi = v162bQualIdx(e); L = [["", q.opt]].concat(v162bList(q.f) || []); cur = qi >= 0 ? String(e.conds[qi].v) : ""; keep(cur); }
  else if(k === "cf"){ AUTO_FIELDS.forEach(function(f){ amOps(f[0]).forEach(function(o){ L.push([f[0] + "|" + o[0], v162bFieldPh(f[0], o[0])]); }); }); var c = e.conds[i] || {}; cur = c.f ? c.f + "|" + c.op : ""; keep(cur, v162bFieldPh(c.f, c.op)); }
  else if(k === "cv"){ var c2 = e.conds[i] || {}; L = v162bList(c2.f) || []; cur = c2.v == null ? "" : String(c2.v); keep(cur, v162bVal(c2.f, cur)); }
  else if(k === "aa"){ L = AUTO_ACTIONS.map(function(x){ return [x[0], v162bActPh(x[0])]; }); var a = e.acts[i] || {}; cur = a.a || ""; keep(cur, v162bActPh(cur)); }
  else if(k === "av"){ var a2 = e.acts[i] || {}; L = v162bList(a2.a) || []; cur = a2.v == null ? "" : String(a2.v); keep(cur, v162bVal(a2.a, cur)); }
  else if(k === "mode"){ L = [["suggest", "suggest it — I accept it"], ["auto", "just do it"]]; cur = e.mode === "auto" ? "auto" : "suggest"; }
  return { L: L, cur: cur };
}
function v162bChip(t, open, e){
  var cls = "v162b-chip" + (t.label ? "" : " empty") + (t.ghost ? " ghost" : "") + (open ? " open" : "");
  var h = '<span class="v162b-cw"><button type="button" class="' + cls + '" data-action="am-chip" data-slot="' + esc(t.chip) + '" aria-haspopup="listbox" aria-expanded="' + !!open + '"'
    + (t.label ? '' : ' aria-label="' + esc(t.aria + ": " + t.ph) + '"') + '>' + esc(t.label || t.ph) + '</button>';
  if(open){
    var o = v162bMenuOpts(e, t.chip);
    h += '<span class="v162b-menu" role="listbox" aria-label="' + esc(t.aria) + '">' + o.L.map(function(x){
      var on = x[0] === o.cur;
      return '<button type="button" role="option" class="v162b-opt' + (on ? ' on' : '') + (x[0] === "" ? ' any' : '') + '" data-action="am-pick" data-slot="' + esc(t.chip) + '" data-v="' + esc(x[0]) + '" aria-selected="' + on + '">' + esc(x[1]) + '</button>';
    }).join("") + '</span>';
  }
  return h + '</span>';
}
function v162bInput(t){
  if(t.key === "hour") return '<input class="v162b-in v162b-time" type="time" data-am="' + t.inp + '" value="' + esc(t.v || "") + '" aria-label="Time of day">';
  var ph = t.key === "stamp" ? AUTO_STAMP_DEFAULT : t.key === "customer" ? "e.g. Crete" : t.key === "remind" ? "e.g. call the customer back" : "e.g. Ready for road test";
  var n = Math.max(12, Math.min(48, (t.v || ph).length + 2));
  return '<input class="v162b-in" type="text" size="' + n + '" data-am="' + t.inp + '" value="' + esc(t.v || "") + '" placeholder="' + esc(ph) + '" aria-label="'
    + (t.key === "customer" ? "Customer name" : t.key === "note" ? "Note line" : t.key === "remind" ? "Reminder" : "Work-log line") + '">';
}
function v162bSentence(e, chip){
  return v162bTokens(e).map(function(t){
    if(t.w) return '<span class="v162b-w">' + esc(t.w) + '</span>';
    if(t.chip) return v162bChip(t, chip === t.chip, e);
    if(t.inp) return v162bInput(t);
    if(t.x) return '<button type="button" class="v162b-x" data-action="' + t.x + '" data-i="' + t.i + '" aria-label="' + (t.what === "action" ? "Remove this action" : "Remove this condition") + '"'
      + (t.what === "action" ? ' title="Remove this action"' : ' title="Remove this condition"') + '></button>';
    return "";
  }).join(" ");
}
/* the rule as a read-only sentence, for the list of rules */
function amRuleSummary(r){
  return '<span class="v162b-read">' + v162bTokens(r).map(function(t){
    if(t.w) return esc(t.w);
    if(t.chip) return t.label ? '<span class="v162b-v' + (t.ghost ? ' ghost' : '') + '">' + esc(t.label) + '</span>' : '<span class="v162b-v empty">…</span>';
    if(t.inp) return '<span class="v162b-v">' + (t.v ? esc(t.key === "hour" ? t.v : "“" + t.v + "”") : "…") + '</span>';
    return "";
  }).filter(Boolean).join(" ") + '</span>';
}
function v162bTag(r){
  if(v162bMissing(r)) return '<span class="v162b-tag warn">Unfinished — edit it to finish the sentence</span>';
  if(!r.on && !r.tested) return '<span class="v162b-tag">Off · not tested yet</span>';
  return "";
}
function v162bBuilder(m){
  var e = m.edit, miss = v162bMissing(e), chip = m.chip || null;
  var h = '<div class="am-builder v162b" data-v162b="1">'
    + '<div class="am-line"><span class="am-k">NAME</span><input class="am-in" type="text" data-am="name" value="' + esc(e.name || "") + '" placeholder="Optional — e.g. Road test done" aria-label="Rule name"></div>'
    + '<p class="v162b-sent" aria-label="The rule">' + v162bSentence(e, chip) + '</p>'
    + '<div class="v162b-add"><button type="button" class="btn btn-sm" data-action="am-add-cond" title="Add a condition the event has to meet">' + IC.plus + '<span>and</span></button>'
    + '<button type="button" class="btn btn-sm" data-action="am-add-act" title="Add another thing for the rule to do">' + IC.plus + '<span>then</span></button></div>';
  if((e.acts || []).some(function(a){ return a.a === "stamp" || a.a === "note" || a.a === "remind"; }))
    h += '<div class="hint am-tokens">Text can use {start} {stop} {hours} {reason} {stopReason} {note} {job} {ro} {date}.</div>';
  h += '<div class="am-line am-foot v162b-foot"><span class="v162b-w">Apply:</span>' + v162bChip({ chip: "mode", label: e.mode === "auto" ? "just do it" : "suggest it — I accept it", aria: "Apply" }, chip === "mode", e)
    + '<span class="v162b-onw"><button type="button" class="am-tg' + (e.on ? ' on' : '') + '" data-action="am-on" role="switch" aria-checked="' + !!e.on + '" aria-label="Rule on"></button><span>' + (e.on ? "On" : "Off until you turn it on") + '</span></span>'
    + '<span class="grow"></span>'
    + '<button type="button" class="btn btn-sm" data-action="am-test"' + (miss ? ' disabled aria-disabled="true"' : '') + ' title="Try the rule on the last 7 days — nothing changes">Test run</button>'
    + '<button type="button" class="btn btn-sm" data-action="am-cancel">Cancel</button>'
    + '<button type="button" class="btn btn-sm btn-primary" data-action="am-save"' + (miss ? ' disabled aria-disabled="true"' : '') + '>Save rule</button></div>'
    + '<div class="hint v162b-need" role="status"' + (miss ? '' : ' hidden') + '>' + (miss ? esc("To save, " + miss + ".") : '') + '</div>';
  if(m.test) h += v162bResHtml(m.test, e);
  return h + '<div class="form-error" id="am-error"></div></div>';
}
function v162bResHtml(x, e){
  var li = function(L){ return '<ul>' + L.slice(0, 8).map(function(y){ return '<li><span class="mono">' + esc(y.ro) + '</span> ' + esc(y.when) + ' ' + esc(y.what) + '</li>'; }).join("") + (L.length > 8 ? '<li class="more">+ ' + (L.length - 8) + ' more</li>' : '') + '</ul>'; };
  var h = '<div class="v162b-res ' + (x.hits.length ? 'yes' : 'no') + '" role="status">';
  if(x.hits.length) h += '<b>Would have run ' + (x.hits.length === 1 ? 'once' : x.hits.length + ' times') + '</b><span> in the last ' + x.days + ' days · nothing was changed</span>' + li(x.hits);
  else h += '<b>Wouldn’t have run in the last ' + x.days + ' days</b><span> — ' + esc(x.why) + '</span>' + (x.near.length ? li(x.near) : '');
  if(!e.on) h += '<div class="v162b-res-foot"><button type="button" class="btn btn-sm" data-action="am-test-on" title="Switch the rule on — it takes effect when you save">Turn it on</button></div>';
  return h + '</div>';
}
/* redraw, keeping the panel's scroll, then put the focus where it belongs */
function v162bScroller(){
  var el = document.querySelector(".v162b");
  while(el && el !== document.body){ var s = getComputedStyle(el); if(/auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return el; el = el.parentElement; }
  return null;
}
function v162bDraw(focus){
  var sc = v162bScroller(), top = sc ? sc.scrollTop : 0;
  render();
  var sc2 = v162bScroller(); if(sc2) sc2.scrollTop = top;
  var go = function(){
    var m = v162bM(), el = null;
    if(m && m.chip) el = document.querySelector(".v162b-menu .v162b-opt.on") || document.querySelector(".v162b-menu .v162b-opt");
    else if(focus) [].concat(focus).some(function(f){ el = document.querySelector(f); return !!el; });
    if(el && el !== document.activeElement){ try{ el.focus({ preventScroll: false }); }catch(err){ el.focus(); } }
  };
  go(); setTimeout(go, 0);
}
function v162bSync(){
  var m = v162bM(), e = m && m.edit; if(!e || !document.querySelector(".v162b")) return;
  var miss = v162bMissing(e);
  ['[data-action="am-save"]', '[data-action="am-test"]'].forEach(function(s){ var b = document.querySelector(".v162b " + s); if(b){ b.disabled = !!miss; if(miss) b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled"); } });
  var nd = document.querySelector(".v162b-need"); if(nd){ nd.hidden = !miss; nd.textContent = miss ? "To save, " + miss + "." : ""; }
  var rs = document.querySelector(".v162b-res"); if(rs && m.test){ rs.classList.add("stale"); m.test.stale = true; }
}
function v162bPick(e, slot, v){
  var mm = /^(\w+):(\d+)$/.exec(slot), k = mm ? mm[1] : slot, i = mm ? +mm[2] : -1;
  if(k === "when"){ e.when = v; return; }
  if(k === "mode"){ e.mode = v === "auto" ? "auto" : "suggest"; return; }
  if(k === "q"){
    var q = V162B_QUAL[e.when], qi = v162bQualIdx(e); if(!q) return;
    if(v === ""){ if(qi >= 0) e.conds.splice(qi, 1); }
    else if(qi >= 0) e.conds[qi].v = v;
    else e.conds.unshift({ f: q.f, op: "is", v: v });
    return;
  }
  if(k === "cf"){ var p = String(v).split("|"), c = e.conds[i]; if(!c) return; if(c.f !== p[0]) c.v = p[0] === "hour" ? "12:00" : ""; c.f = p[0]; c.op = p[1] || amOps(p[0])[0][0]; return; }
  if(k === "cv"){ if(e.conds[i]) e.conds[i].v = v; return; }
  if(k === "aa"){ var a = e.acts[i]; if(!a) return; if(a.a !== v) a.v = v === "stamp" ? AUTO_STAMP_DEFAULT : ""; a.a = v; return; }
  if(k === "av"){ if(e.acts[i]) e.acts[i].v = v; }
}
/* the next thing to fill after a pick: a value chip opens its menu, a typed box takes the focus */
function v162bNext(e, slot){
  var mm = /^(\w+):(\d+)$/.exec(slot); if(!mm) return null;
  if(mm[1] === "cf"){ var c = e.conds[+mm[2]]; if(c && c.f && (c.v == null || c.v === "")) return amOptionsFor(c.f) ? { chip: "cv:" + mm[2] } : { sel: '.v162b [data-am="cv:' + mm[2] + '"]' }; }
  if(mm[1] === "aa"){ var a = e.acts[+mm[2]]; if(a && a.a && (a.v == null || a.v === "")) return amOptionsFor(a.a) ? { chip: "av:" + mm[2] } : { sel: '.v162b [data-am="av:' + mm[2] + '"]' }; }
  return null;
}
function v162bAct(a, t){
  var m = v162bM(); if(!m) return false;
  var ae = document.activeElement;   /* a box still being typed in keeps what it has before the sentence moves */
  if(ae && ae.getAttribute && ae.getAttribute("data-am") && ae.closest && ae.closest(".am")) ae.blur();
  if(a !== "am-chip" && a !== "am-pick") m.chip = null;
  if(a === "am-new"){ m.edit = { id: null, name: "", when: "", conds: [], acts: [{ a: "", v: "" }], mode: "suggest", on: false }; m.test = null; m.chip = "when"; v162bDraw(); return true; }
  if(a === "am-edit" || a === "am-cancel"){ m.test = null; return false; }   /* the panel copies the rule / closes the builder */
  var e = m.edit; if(!e) return false;
  if(!Array.isArray(e.conds)) e.conds = [];
  if(!Array.isArray(e.acts)) e.acts = [];
  var chipSel = function(s){ return '.v162b-chip[data-slot="' + s + '"]'; };
  if(a === "am-chip"){ var s = t.dataset.slot; m.chip = m.chip === s ? null : s; v162bDraw(m.chip ? null : chipSel(s)); return true; }
  if(a === "am-pick"){
    var slot = t.dataset.slot; v162bPick(e, slot, t.dataset.v || ""); m.test = null;
    var nx = v162bNext(e, slot); m.chip = nx && nx.chip ? nx.chip : null;
    v162bDraw(nx && nx.sel ? nx.sel : [chipSel(slot), chipSel("q")]); return true;
  }
  if(a === "am-add-cond"){ e.conds.push({ f: "", op: "is", v: "" }); m.test = null; m.chip = "cf:" + (e.conds.length - 1); v162bDraw(); return true; }
  if(a === "am-add-act"){ e.acts.push({ a: "", v: "" }); m.test = null; m.chip = "aa:" + (e.acts.length - 1); v162bDraw(); return true; }
  if(a === "am-del-cond"){ e.conds.splice(+t.dataset.i, 1); m.test = null; v162bDraw('.v162b [data-action="am-add-cond"]'); return true; }
  if(a === "am-del-act"){ if(e.acts.length > 1) e.acts.splice(+t.dataset.i, 1); m.test = null; v162bDraw('.v162b [data-action="am-add-act"]'); return true; }
  if(a === "am-on" || a === "am-test-on"){ e.on = a === "am-test-on" ? true : !e.on; v162bDraw('.v162b [data-action="am-on"]'); return true; }
  if(a === "am-test"){ if(v162bMissing(e)) return true; m.test = v162bTestRun(e); e.tested = nowIso(); v162bDraw(".v162b-res"); return true; }
  if(a === "am-save"){
    var miss = v162bMissing(e);
    if(miss){ var er = document.getElementById("am-error"); if(er) er.textContent = "To save, " + miss + "."; return true; }
    var cfg = autoCfg(), r = JSON.parse(JSON.stringify(e));
    pushUndo(e.id ? "edit rule" : "add rule");
    if(r.id) cfg.rules = cfg.rules.map(function(x){ return x.id === r.id ? r : x; });
    else { r.id = uid("rl"); r.on = !!r.on; cfg.rules.push(r); }
    m.edit = null; m.test = null; scheduleSave(true); render();
    pushToast(r.on ? "Rule saved — it’s on." : "Rule saved — it’s off until you turn it on.");
    return true;
  }
  return false;
}
/* a custom rule fired (autoEvaluate): tell Fork A's "What ran" log, when there is one */
function v162bRan(r, ev, sg, how){
  if(typeof v162Log !== "function" || !sg) return;
  try{ v162Log({ kind: "rule", rule: "r." + r.id, name: r.name || v162bText(r), how: how, ro: ev.ro, op: ev.op || null, sg: sg, acts: sg.acts, text: sg.text, at: sg.at }); }catch(err){}
}
/* ---- keyboard: the open menu ---- */
document.addEventListener("keydown", function(ev){
  var t = ev.target;
  if(t && t.classList && t.classList.contains("v162b-chip") && (ev.key === "ArrowDown" || ev.key === "ArrowUp") && !document.querySelector(".v162b-menu")){ ev.preventDefault(); ev.stopPropagation(); t.click(); return; }
  var menu = document.querySelector(".v162b-menu"), m = v162bM(); if(!menu || !m || !m.chip) return;
  var opts = Array.prototype.slice.call(menu.querySelectorAll(".v162b-opt")), i = opts.indexOf(document.activeElement), slot = m.chip;
  var stop = function(){ ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); };
  var to = function(j){ if(opts.length){ j = (j + opts.length) % opts.length; opts[j].focus(); } };
  if(ev.key === "Escape" || ev.key === "Tab"){ stop(); m.chip = null; v162bDraw('.v162b-chip[data-slot="' + slot + '"]'); return; }
  if(ev.key === "ArrowDown"){ stop(); to(i < 0 ? 0 : i + 1); return; }
  if(ev.key === "ArrowUp"){ stop(); to(i < 0 ? opts.length - 1 : i - 1); return; }
  if(ev.key === "Home"){ stop(); to(0); return; }
  if(ev.key === "End"){ stop(); to(opts.length - 1); return; }
  if(ev.key === "Enter" || ev.key === " "){ if(i >= 0){ stop(); opts[i].click(); } return; }
  if(ev.key.length === 1 && /\S/.test(ev.key) && !ev.ctrlKey && !ev.metaKey && !ev.altKey){   /* type a letter: the next option starting with it */
    stop(); var c = ev.key.toLowerCase();
    for(var n = 1; n <= opts.length; n++){ var o = opts[(Math.max(i, 0) + n) % opts.length]; if(o.textContent.trim().toLowerCase().indexOf(c) === 0){ o.focus(); break; } }
  }
}, true);
/* a click anywhere else closes the menu (after the click has done its own work) */
document.addEventListener("click", function(ev){
  var m = v162bM(); if(!m || !m.chip || !document.querySelector(".v162b-menu")) return;
  var t = ev.target, act = t && t.closest ? t.closest("[data-action]") : null;
  if(t && t.closest && (t.closest(".v162b-menu") || t.closest(".v162b-chip") || (act && act.dataset.action !== "overlay-close"))) return;
  setTimeout(function(){ var m2 = v162bM(); if(m2 && m2.chip){ m2.chip = null; v162bDraw(); } }, 0);
}, true);

/* ---- Test run: the rule against the current ROs and the last 7 days, read only ---- */
function v162bRoName(ro){ var n = String(ro && ro.roNumber || ""); return n ? (/^RO/i.test(n) ? n : "RO-" + n) : "RO"; }
function v162bWhen(ms){ var d = new Date(ms); return V162B_DAY[d.getDay()] + " " + fmtTime(d.toISOString()); }
function v162bPad(n){ return String(n).padStart(2, "0"); }
/* a status as it read at a moment, from the RO's history (the last change at or before it; else what the next change started from) */
function v162bAt(ro, opId, T){
  var last = null, next = null;
  (Array.isArray(ro.history) ? ro.history : []).forEach(function(h){
    if(!h || h.k !== "status") return;
    if(opId ? (h.op !== opId || String(h.t || "").indexOf("Operation status") !== 0) : h.t !== "RO status") return;
    var ms = cdMs(h.at); if(isNaN(ms)) return;
    if(ms <= T){ if(!last || ms >= last.ms) last = { ms: ms, v: h.n }; }
    else if(!next || ms < next.ms) next = { ms: ms, v: h.o };
  });
  var v = last ? last.v : next ? next.v : null;
  if(v == null || v === ""){ if(opId){ var op = getOp(ro.id, opId); return op ? autoStatusName(opStatus(op)) : ""; } return roStatus(ro).status; }
  return opId ? String(v) : String(v).split(" · ")[0];
}
function v162bTaskId(name){ var d = (typeof WF_TASKS !== "undefined" ? WF_TASKS : []).filter(function(x){ return x.name === name; })[0]; return d ? d.id : name; }
function v162bPunchAt(roId, opId, T){
  var best = null;
  (STATE.punches || []).forEach(function(p){ if(p.roId !== roId || p.opId !== opId) return; var a = cdMs(p.start); if(!isNaN(a) && a <= T && (!best || a > cdMs(best.start))) best = p; });
  return best;
}
/* what happened: the events the runner would have raised, rebuilt from punches and each RO's history */
function v162bEvents(days){
  var now = Date.now(), since = now - (days || V162B.days) * 864e5, out = [];
  var inWin = function(ms){ return !isNaN(ms) && ms >= since && ms <= now + 60000; };
  (STATE.ros || []).forEach(function(ro){
    var mine = [];
    (Array.isArray(ro.history) ? ro.history : []).forEach(function(h){
      if(!h) return; var ms = cdMs(h.at); if(!inWin(ms)) return; var t = String(h.t || "");
      if(h.k === "status" && t === "RO status") mine.push({ type: "ro.status", at: ms, ro: ro, value: String(h.n || "").split(" · ")[0], prev: h.o });
      else if(h.k === "status" && t.indexOf("Operation status") === 0){ var op = getOp(ro.id, h.op); if(op) mine.push({ type: "job.status", at: ms, ro: ro, op: op, value: String(h.n || ""), prev: h.o }); }
      else if(h.k === "part" && t.indexOf("Part · ") === 0){
        var op2 = getOp(ro.id, h.op), d = t.slice(7);
        var part = op2 ? (op2.parts || []).filter(function(x){ return (x.description || x.desc || x.partNumber || "part") === d; })[0] || null : null;
        mine.push({ type: "part.status", at: ms, ro: ro, op: op2 || null, part: part, value: String(h.n || "") });
      }
      else if(h.k === "punch" && t.indexOf("Punch edited") === 0) mine.push({ type: "punch.edit", at: ms, ro: ro, op: getOp(ro.id, h.op) || null, punch: v162bPunchAt(ro.id, h.op, ms) });
      else if(h.k === "task" && t === "Task ticked") mine.push({ type: "task.tick", at: ms, ro: ro, task: v162bTaskId(h.n) });
      else if(h.k === "file" && /added$/.test(t)) mine.push({ type: "file.add", at: ms, ro: ro });
    });
    /* all parts in / every operation complete: when it last came true, if it still is */
    (ro.operations || []).forEach(function(op){
      var ps = op.parts || []; if(!ps.length || !ps.every(pxPartIn)) return;
      var b = null; mine.forEach(function(x){ if(x.type === "part.status" && x.op === op && (!b || x.at >= b.at)) b = x; });
      if(b) mine.push({ type: "parts.allReceived", at: b.at, ro: ro, op: op });
    });
    var live = (ro.operations || []).filter(function(o){ return !o.declined; });
    if(live.length && live.every(function(o){ return AUTO_COMPLETE.indexOf(autoStatusName(opStatus(o))) >= 0; })){
      var dn = null; mine.forEach(function(x){ if(x.type === "job.status" && AUTO_COMPLETE.indexOf(x.value) >= 0 && (!dn || x.at >= dn.at)) dn = x; });
      if(dn) mine.push({ type: "jobs.allComplete", at: dn.at, ro: ro, op: null });
    }
    out = out.concat(mine);
  });
  (STATE.punches || []).forEach(function(p){
    var ro = getRO(p.roId); if(!ro) return;
    var op = getOp(ro.id, p.opId) || null, a = cdMs(p.start), b = p.stop ? cdMs(p.stop) : NaN;
    if(inWin(a)) out.push({ type: "punch.start", at: a, ro: ro, op: op, punch: p });
    if(inWin(b)) out.push({ type: "punch.stop", at: b, ro: ro, op: op, punch: p });
  });
  return out.sort(function(x, y){ return x.at - y.at; });
}
/* the details the rule's conditions read (autoCtx's fields), as they were at that moment */
function v162bCtx(ev){
  var ro = ev.ro, op = ev.op, p = ev.punch, d = new Date(ev.at), q = 0, burnt = 0;
  if(op){
    q = Number(op.quoted) || 0;
    if(typeof op.burnt === "number") burnt = op.burnt;
    else (STATE.punches || []).forEach(function(x){ if(x.opId !== op.id || x.roId !== ro.id) return; var a = cdMs(x.start), b = Math.min(x.stop ? cdMs(x.stop) : Date.now(), ev.at); if(!isNaN(a) && b > a) burnt += (b - a) / 36e5; });
  }
  return {
    startReason: p ? p.startReason || "" : "", stopReason: p && ev.type !== "punch.start" ? p.stopReason || "" : "",
    jobType: op ? op.jobType || opJobType(op) : "",
    jobStatus: op ? (ev.type === "job.status" ? ev.value : v162bAt(ro, op.id, ev.at)) : "",
    roStatus: ro ? (ev.type === "ro.status" ? ev.value : v162bAt(ro, null, ev.at)) : "",
    partStatus: ev.type === "part.status" ? ev.value : (ev.part ? ev.part.status || "" : ""),
    customer: ro ? ro.customerName || "" : "", overQuoted: op ? (q > 0 && burnt > q ? "yes" : "no") : "",
    hour: v162bPad(d.getHours()) + ":" + v162bPad(d.getMinutes())
  };
}
/* why one condition didn't hold, in words */
function v162bWhy(cd, ctx){
  var x = V162B_FIELD[cd.f] || {}, noun = x.noun || String(autoLabel(AUTO_FIELDS, cd.f)).toLowerCase(), had = ctx[cd.f] == null ? "" : String(ctx[cd.f]);
  var hv = had === "" ? "nothing" : v162bVal(cd.f, had), w = v162bVal(cd.f, cd.v), be = cd.f === "overQuoted" ? "were" : "was";
  if(cd.f === "hour") return "it was " + had + ", not " + (cd.op === "before" ? "before " : "after ") + cd.v;
  if(cd.op === "not") return noun + " " + be + " " + hv;
  if(cd.op === "contains") return noun + " was " + hv + " — no “" + cd.v + "” in it";
  return noun + " " + be + " " + hv + ", not " + w;
}
function v162bWhat(a, v, ev){
  if(a.a === "roStatus") return "status " + v;
  if(a.a === "jobStatus") return "operation " + ((ev.op && ev.op.complaint) || "") + " → " + v;
  if(a.a === "note") return "note “" + v + "”";
  if(a.a === "remind") return "reminder “" + v + "”";
  if(a.a === "stamp") return "work log “" + v + "”";
  return autoActText({ a: a.a, v: v });
}
function v162bTestRun(r){
  var days = V162B.days, evs = v162bEvents(days).filter(function(x){ return x.type === r.when; }), hits = [], near = [];
  evs.forEach(function(ev){
    var ctx = v162bCtx(ev), fails = [];
    (r.conds || []).forEach(function(cd){ if(!autoCondOk(cd, ctx)) fails.push(v162bWhy(cd, ctx)); });
    if(fails.length){ near.push({ ev: ev, n: fails.length, why: fails }); return; }
    var did = [], skip = [];
    (r.acts || []).forEach(function(a){
      if((a.a === "jobStatus" || a.a === "stamp") && !ev.op){ skip.push("there was no operation to " + (a.a === "stamp" ? "stamp" : "set")); return; }
      if(a.a === "task"){ skip.push("ticking a task is retired"); return; }
      var v = a.a === "stamp" ? autoFill(a.v || AUTO_STAMP_DEFAULT, ev) : (a.a === "note" || a.a === "remind") ? autoFill(a.v, ev) : a.v;
      if(a.a === "roStatus" && ctx.roStatus === a.v){ skip.push("the RO was already " + a.v); return; }
      if(a.a === "jobStatus" && ctx.jobStatus === a.v){ skip.push("the operation was already " + a.v); return; }
      if((a.a === "note" || a.a === "remind") && !v){ skip.push("the text is empty"); return; }
      did.push(v162bWhat(a, v, ev));
    });
    if(!did.length){ near.push({ ev: ev, n: 0, why: skip.length ? ["it would have changed nothing — " + skip.join(", ")] : ["it would have changed nothing"] }); return; }
    hits.push({ ev: ev, what: did });
  });
  var row = function(x, what){ return { ro: v162bRoName(x.ev.ro), when: v162bWhen(x.ev.at), what: what, at: x.ev.at }; };
  hits.sort(function(a, b){ return b.ev.at - a.ev.at; });
  near.sort(function(a, b){ return a.n - b.n || b.ev.at - a.ev.at; });
  var why = !evs.length ? "nothing like “" + v162bTrig(r.when) + "” happened in that time"
    : "here’s why, closest first";
  return {
    at: nowIso(), days: days, seen: evs.length, why: why,
    hits: hits.map(function(x){ return row(x, "→ " + x.what.join(" · ")); }),
    near: near.slice(0, 3).map(function(x){ return row(x, "— " + x.why.join("; ")); })
  };
}
function autoValueLabel(k, v){ var o = amOptionsFor(k); if(o && Array.isArray(o[0])) { for(var i=0;i<o.length;i++) if(o[i][0] === v) return o[i][1]; } return v; }
function automationsModalBody(m){
  var cfg = autoCfg();
  var h = '<div class="am">';
  h += '<div class="am-head"><b>Built-in</b><span class="am-sub">Apply as</span><div class="am-seg" role="group" aria-label="Built-in rules apply as">'
    + [["suggest","Suggest"],["auto","Auto"]].map(function(x){ return '<button class="'+(cfg.mode === x[0] ? 'on' : '')+'" data-action="am-mode" data-mode="'+x[0]+'" aria-pressed="'+(cfg.mode === x[0])+'">'+x[1]+'</button>'; }).join("")
    + '</div></div>';
  AUTO_BUILTINS.forEach(function(b){
    var on = !!cfg.builtin[b[0]];
    h += '<div class="am-rule"><div class="am-t"><b>'+b[1]+'</b><span>'+b[2]+'</span>'+v162Thr(b[0])+'</div>'
      + '<button class="am-tg'+(on ? ' on' : '')+'" data-action="am-builtin" data-k="'+b[0]+'" role="switch" aria-checked="'+on+'" aria-label="'+b[1]+'"></button></div>';
  });
  h += '<div class="am-rule"><div class="am-t"><b>Change history</b><span>Every change to ROs, operations, punches, parts and task entries is recorded on the RO’s History tab. Always on, kept forever.</span></div>'
    + '<span class="am-tg on locked" title="Always on"></span></div>';

  h += '<div class="am-head" style="margin-top:18px"><b>Custom rules</b>'+(m.edit ? '' : '<button class="btn btn-sm" data-action="am-new">'+IC.plus+'<span>Rule</span></button>')+'</div>';
  if(!cfg.rules.length && !m.edit) h += '<div class="hint am-empty">No custom rules yet. Example: when an operation’s clock stops as Complete and the RO is Waiting – Parts, then set the RO status to Hold Tech.</div>';
  cfg.rules.forEach(function(r){
    if(m.edit && m.edit.id === r.id) return;
    h += '<div class="am-rule am-custom'+(r.on ? '' : ' off')+'"><div class="am-t">'+(r.name ? '<b>'+esc(r.name)+'</b>' : '')
      + '<span class="am-sum">'+amRuleSummary(r)+'</span><span class="am-mode-tag">'+(r.mode === "auto" ? "Auto" : "Suggest")+'</span>'+v162bTag(r)+'</div>'
      + '<div class="am-acts"><button class="ib btn btn-sm" data-action="am-edit" data-id="'+r.id+'" title="Edit rule" aria-label="Edit rule">'+IC.pencil+'</button>'
      + '<button class="del-btn" data-action="am-del" data-id="'+r.id+'" title="Delete rule" aria-label="Delete rule">✕</button>'
      + '<button class="am-tg'+(r.on ? ' on' : '')+'" data-action="am-toggle" data-id="'+r.id+'" role="switch" aria-checked="'+!!r.on+'" aria-label="Rule on"></button></div></div>';
  });
  if(m.edit) h += v162bBuilder(m);   /* Parsec 16.2: the rule as a sentence (b9/v162b.js) */
  h += '<div class="hint am-foot-hint">Suggestions show on the operation card or RO panel they would change. Nothing changes until you press Accept, unless a rule is set to Auto.</div>';
  return h + '</div>';
}
function amField(t, rerender){
  var e = UI.modal && UI.modal.edit; if(!e) return;
  var k = t.getAttribute("data-am"), v = t.value, m = /^(\w+):(\d+)$/.exec(k);
  if(k === "when") e.when = v;
  else if(k === "mode") e.mode = v;
  else if(k === "name") e.name = v;
  else if(m && (m[1].charAt(0) === "c" ? e.conds[+m[2]] : e.acts[+m[2]])){
    var i = +m[2];
    if(m[1] === "cf"){ e.conds[i].f = v; e.conds[i].op = amOps(v)[0][0]; e.conds[i].v = amDefault(v); }
    else if(m[1] === "co") e.conds[i].op = v;
    else if(m[1] === "cv") e.conds[i].v = v;
    else if(m[1] === "aa"){ e.acts[i].a = v; e.acts[i].v = amDefault(v); }
    else if(m[1] === "av") e.acts[i].v = v;
  }
  if(rerender) render(); else v162bSync();
}
function amAction(a, t){
  if(v162bAct(a, t)) return true;   /* Parsec 16.2 (b9/v162b.js) */
  var cfg = autoCfg(), m = UI.modal;
  if(a === "am-mode"){ cfg.mode = t.dataset.mode === "auto" ? "auto" : "suggest"; scheduleSave(true); render(); return true; }
  if(a === "am-builtin"){ var k = t.dataset.k; cfg.builtin[k] = !cfg.builtin[k]; scheduleSave(true); render(); return true; }
  if(a === "am-edit"){ var r = cfg.rules.filter(function(x){ return x.id === t.dataset.id; })[0]; if(r){ m.edit = JSON.parse(JSON.stringify(r)); render(); } return true; }
  if(a === "am-del"){ pushUndo("delete rule"); cfg.rules = cfg.rules.filter(function(x){ return x.id !== t.dataset.id; }); scheduleSave(true); render(); return true; }
  if(a === "am-toggle"){ cfg.rules.forEach(function(x){ if(x.id === t.dataset.id) x.on = !x.on; }); scheduleSave(true); render(); return true; }
  if(!m.edit) return false;
  if(a === "am-cancel"){ m.edit = null; render(); return true; }
  return false;
}


/* ---- punch notes ----
   Each Save adds one line to the punch's notes, as typed. Notes saved before Parsec 16.1 may start
   with a stamp, "[10:05 · 0:26] text" (the clock time and how long the punch had run): it is read
   here, kept as it was, and left out wherever only the note's words are shown or copied. */
var NOTE_STAMP_RE = /^\[(?:(\d{1,2}:\d{2}) \u00b7 )?(\d+:\d{2})\]\s?(.*)$/;
function noteEntries(notes){
  return String(notes || "").split(/\n/).map(function(line){
    var m = NOTE_STAMP_RE.exec(line);
    return m ? { at: m[1] || "", ran: m[2], text: m[3] } : { at: "", ran: "", text: line };
  }).filter(function(e){ return e.text.trim() || e.ran; });
}
/* tech notes tidy themselves when they are saved: capital letters at the start of each sentence,
   a space after commas, "i" as "I", and a full stop at the end. Part numbers, codes and decimals are left alone. */
var NOTE_CODES = {};
(function(){ ACRONYMS.concat(["VCADS","PTT","TECU","EECU","BECU","OBD","DTCS","NOX","TSB","PSI","RPM","ECM","EPA","OK"]).forEach(function(w){ if(["CAN","LED","DOT"].indexOf(w) < 0) NOTE_CODES[w] = 1; }); })();
function autoPunct(t){
  /* abbreviations keep their case (i.e., e.g., approx.), and a note that ends on a number or part number gets no full stop */
  t = String(t || "").replace(/\s+/g, " ").trim();
  if(!t) return t;
  var ABBR = /(?:^|\s)(?:i\.e|e\.g|etc|approx|vs|no|qty|est|min|max|appt|cust|dept|w\/o|w)\.$/i;
  t = t.replace(/\s+([,.;:!?])/g, "$1").replace(/,(?=[A-Za-z])/g, ", ").replace(/([.!?])(?=[A-Z][a-z])/g, "$1 ");
  t = t.replace(/\bi\b(?!\.e)(?=$|[\s',;:!?]|\.(?!e\b))/g, "I");
  t = t.replace(/(^|[.!?]\s+)([a-z])(?=[a-z]*(?:\s|[,.;:!?]|$))/g, function(m, a, b, off){
    if(a && ABBR.test(t.slice(0, off + a.replace(/\s+$/, "").length))) return m;
    if(/^(?:i\.e|e\.g)\./i.test(t.slice(off + a.length))) return m;
    return a + b.toUpperCase();
  });
  /* shop codes keep their capitals - SPN, FMI, DPF, EGR, VCADS... ("can", "led" and "dot" stay words) */
  t = t.replace(/[A-Za-z][A-Za-z0-9\/&]*/g, function(w){ var u = w.toUpperCase(); return NOTE_CODES[u] ? (u === "NOX" ? "NOx" : u) : w; });
  var last = (t.split(" ").pop() || "");
  if(/[A-Za-z)"'”%]$/.test(t) && !/\d/.test(last) && !ABBR.test(" " + last + ".")) t += ".";
  return t;
}
/* what you type in a punch's note field is a draft until you press Save — and it is
   saved for you when you change page or RO, or when any job's clock starts or stops. */
var NOTE_DRAFTS = (function(){ try{ return JSON.parse(sessionStorage.getItem("tec_note_drafts") || "{}") || {}; }catch(e){ return {}; } })();
function noteDraftSet(pid, v){
  if(v && String(v).trim()) NOTE_DRAFTS[pid] = v; else delete NOTE_DRAFTS[pid];
  try{ sessionStorage.setItem("tec_note_drafts", JSON.stringify(NOTE_DRAFTS)); }catch(e){}
}
function commitNoteDrafts(){
  var ids = Object.keys(NOTE_DRAFTS), n = 0;
  ids.forEach(function(pid){
    var txt = autoPunct(String(NOTE_DRAFTS[pid] || "").replace(/\s*\n\s*/g, " ").trim());
    var p = STATE.punches.filter(function(x){ return x.id === pid; })[0];
    if(p && txt){
      var line = txt;
      p.notes = String(p.notes || "").trim() ? String(p.notes).replace(/\s+$/, "") + "\n" + line : line;
      n++;
    }
    delete NOTE_DRAFTS[pid];
  });
  try{ sessionStorage.setItem("tec_note_drafts", "{}"); }catch(e){}
  if(n){ scheduleSave(true); if(typeof JC !== "undefined" && JC.rerender) setTimeout(function(){ JC.rerender(); }, 0); }
  return n;
}
var LAST_PAGE_KEY = null;
window.addEventListener("beforeunload", function(){ if(commitNoteDrafts()) persistLocal(); });

/* ---- open it, see it ----
   Whatever you just opened or expanded is scrolled into view, so you never have to go
   looking for it. Nothing moves if it is already fully on screen; a section taller than
   the screen lands with its top just under the sticky header. */
function revealEl(node, scroller, topPad){
  if(!node || !node.getBoundingClientRect) return;
  requestAnimationFrame(function(){
    var r = node.getBoundingClientRect();
    if(!r.height) return;
    var vTop = scroller ? scroller.getBoundingClientRect().top : 0;
    var vBot = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;
    var top = vTop + (topPad || 0) + 8, room = vBot - top - 8;
    if(r.top >= top && r.bottom <= vBot - 8) return;                  /* already in view */
    var delta = (r.height <= room && r.top >= top) ? r.bottom - (vBot - 8) : r.top - top;
    (scroller || window).scrollBy({ top: delta, behavior: "smooth" });
  });
}
function revealInPage(node){
  var tb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tb-h")) || 0;
  revealEl(node, null, tb);
}

/* ---- Date Closed ----
   Filled in automatically the moment an RO is truly done (every job complete and the
   RO status complete), and taken back off if the RO reopens — but only
   a date the app set itself. A date you type is yours: the app never
   overwrites or clears it. Clearing it yourself on a finished RO keeps it clear until the RO
   reopens. Runs for every RO after each save, not just the one on screen. */
function syncDateClosedRo(ro){
  var done = roLooksFinished(ro) && roIsDone(ro);
  if(done){
    if(!ro.dateClosed && ro.dateClosedAuto !== false){ ro.dateClosed = nowIso(); ro.dateClosedAuto = true; return true; }
    return false;
  }
  if(ro.dateClosed && ro.dateClosedAuto === true){ ro.dateClosed = null; delete ro.dateClosedAuto; return true; }
  if(!ro.dateClosed && ro.dateClosedAuto === false){ delete ro.dateClosedAuto; return true; }   /* reopened: automatic again */
  return false;
}
