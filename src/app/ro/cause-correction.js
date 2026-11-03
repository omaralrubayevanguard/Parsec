/* Parsec · ro · cause-correction.js
   Cause and Correction from the tech notes (17.3): the notes split into sentences, the first half the Cause and the rest the Correction, a sentence moved by hand, saved on the operation for Warranty and Fixes.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   ccKey ccSplitText ccSentences ccSplit ccEntry ccLine ccWrite ccSync ccTag ccSetHand ccRefill ccKeepMine … (13 functions, 4 constants)
   state      punches
   uses       automations/ data/ state/
*/
/* ============================== Cause and Correction from the tech notes (Parsec 17.3) ==============================
   Every note on an operation (punch notes, notes off the clock, older Work performed text) is split into sentences in time order.
   By order: the first half is the Cause, the second half the Correction. A sentence that starts "Cause:" or "Fix:" / "Correction:"
   goes where it says, and the tech can put any sentence in Cause, Correction or Neither (op.ccTag, by the sentence's key).
   The two lines are saved in the operation's work log, one entry each (kind "cause" / "fix", marked cc: "c" / "x"), where Warranty,
   Fixes and opStory already read them. A cause or fix written as its own note (the Technician page, an older RO) is a note like any
   other, labeled; a whole line set from the Fixes page or the phone becomes the line, as the tech's own words. A line changed by hand stays (op.ccHand[k] keeps what the notes said
   then); when the notes say something new, the card asks. */
function ccKey(t){ return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 80); }
/* one note's text → its sentences */
function ccSplitText(t){
  t = String(t || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  t = t.replace(/\s*—\s*\d{1,2}-\d{1,2}-\d{4}\s+\d{1,2}:\d{2}(:\d{2})?\s*/g, " ");   /* the old Work performed stamps */
  var out = [];
  t.split(/\n+/).forEach(function(line){
    line = line.replace(/\s+/g, " ").trim(); if(!line) return;
    line.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/).forEach(function(s){ s = s.trim(); if(s) out.push(s); });
  });
  return out;
}
/* every sentence on the operation, oldest first; extra = text being typed that isn't saved yet */
function ccSentences(op, extra){
  var L = [], seen = {};
  var add = function(text, at, force){ ccSplitText(text).forEach(function(s, i){ var k = ccKey(s); if(!k) return; L.push({ t: s, k: k, at: at + i / 1000, force: force || "" }); }); };
  if(op.work) add(op.work, 0);
  try{ (STATE.punches || []).filter(function(p){ return p.opId === op.id; }).forEach(function(p){
    var st = +new Date(p.start) || 0;
    noteEntries(p.notes).forEach(function(n, i){ var at = st + i, m = /^(\d+):(\d{2})$/.exec(n.ran || ""); if(m) at = st + (+m[1] * 60 + +m[2]) * 60000; add(n.text, at); });
  }); }catch(e){}
  (Array.isArray(op.offNotes) ? op.offNotes : []).forEach(function(n){ add(n.text, +new Date(n.at) || 0); });
  (op.log || []).forEach(function(l){ if(l && !l.cc && l.text && (l.kind === "cause" || l.kind === "fix")) add(l.text, +new Date(l.at) || 0, l.kind === "fix" ? "x" : "c"); });   /* a cause or fix written as its own note */
  if(extra) add(extra, Date.now() + 1);
  L.sort(function(a, b){ return a.at - b.at; });
  return L.filter(function(x){ if(seen[x.k]) return false; seen[x.k] = 1; return true; });
}
var CC_LBL_C = /^cause\s*[:\-–]\s*/i, CC_LBL_X = /^(?:fix|correction|repair|repaired)\s*[:\-–]\s*/i;
/* which line each sentence goes to: { all: [{ t, k, to: "c"|"x"|"n", by: "you"|"label"|"order" }], c: "…", x: "…" } */
function ccSplit(op, extra){
  var all = ccSentences(op, extra), tags = op.ccTag || {}, free = [];
  all.forEach(function(s){
    if(tags[s.k]){ s.to = tags[s.k]; s.by = "you"; }
    else if(s.force){ s.to = s.force; s.by = "label"; }
    else if(CC_LBL_C.test(s.t)){ s.to = "c"; s.by = "label"; s.t = s.t.replace(CC_LBL_C, ""); }
    else if(CC_LBL_X.test(s.t)){ s.to = "x"; s.by = "label"; s.t = s.t.replace(CC_LBL_X, ""); }
    else free.push(s);
  });
  var half = Math.ceil(free.length / 2);
  free.forEach(function(s, i){ s.to = i < half ? "c" : "x"; s.by = "order"; });
  var join = function(k){ return all.filter(function(s){ return s.to === k; }).map(function(s){ return /[.!?]$/.test(s.t) ? s.t : s.t + "."; }).join(" "); };
  return { all: all, c: join("c"), x: join("x"), n: all.length };
}
var CC_F = { c: "cause", x: "correction" }, CC_K = { c: "cause", x: "fix" };
function ccEntry(op, k){ return (Array.isArray(op.log) ? op.log : []).filter(function(l){ return l && l.cc === k; })[0] || null; }
function ccLine(op, k){ var e = ccEntry(op, k); return e ? String(e.text || "") : ""; }
function ccWrite(op, k, text){
  if(!Array.isArray(op.log)) op.log = []; var e = ccEntry(op, k); text = String(text || "").trim();
  if(!text){ if(e) op.log.splice(op.log.indexOf(e), 1); return; }
  if(!e){ e = { id: uid("lg"), at: nowIso(), kind: CC_K[k], cc: k, text: "" }; op.log.push(e); }
  if(e.text !== text){ e.text = text; e.at = nowIso(); }
}
/* keep op.cause / op.correction in step with the notes; returns { split, ask: { c, x } } — ask: changed by hand, and the notes moved on */
function ccSync(op){
  if(!op || !op.id) return null;
  var sp = ccSplit(op), ask = { c: false, x: false }, hand = op.ccHand || {};
  ["c", "x"].forEach(function(k){
    /* the field the Fixes page and the phone set: the tech's own words for the whole line */
    var fld = String(op[CC_F[k]] || "").trim();
    if(fld){ delete op[CC_F[k]]; ccWrite(op, k, fld); op.ccHand = hand; hand[k] = sp[k]; }
    if(hand[k] != null){ if(hand[k] !== sp[k]) ask[k] = true; return; }
    if(ccLine(op, k) !== sp[k]) ccWrite(op, k, sp[k]);
  });
  /* no save here: this runs while pages read the lines; the next save keeps them */
  return { split: sp, ask: ask };
}
/* the tech puts a sentence in Cause, Correction or Neither ("" = back to the order) */
function ccTag(op, key, to){ op.ccTag = op.ccTag || {}; if(to) op.ccTag[key] = to; else delete op.ccTag[key]; return ccSync(op); }
/* a line typed by hand: it stays until refilled; empty refills from the notes */
function ccSetHand(op, k, v){
  var sp = ccSplit(op); op.ccHand = op.ccHand || {}; v = String(v || "").replace(/\s+/g, " ").trim();
  if(!v){ delete op.ccHand[k]; ccWrite(op, k, sp[k]); }
  else { op.ccHand[k] = sp[k]; ccWrite(op, k, v); }
  return ccSync(op);
}
function ccRefill(op, k){ if(op.ccHand) delete op.ccHand[k]; return ccSync(op); }
function ccKeepMine(op, k){ op.ccHand = op.ccHand || {}; op.ccHand[k] = ccSplit(op)[k]; return ccSync(op); }
/* the whole story for ASIST: Complaint · Cause · Correction */
function ccStory(op){
  try{ ccSync(op); }catch(e){}
  var d = function(s){ s = String(s || "").trim(); return s && !/[.!?]$/.test(s) ? s + "." : s; };
  return ["Complaint: " + d(op.complaint || ""), "Cause: " + d(ccLine(op, "c")), "Correction: " + d(ccLine(op, "x"))].join("\n");
}
