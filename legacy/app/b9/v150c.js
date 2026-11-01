/* ---------- Parsec 15 (C): a deleted time entry stays as air and says what it was · who wrote a note ---------- */
/* the record a deleted punch leaves: whose time it was, what it was on, who deleted it and when */
function v150Hole(p){
  var ro = null, op = null; try{ ro = getRO(p.roId); op = ro ? (ro.operations || []).filter(function(o){ return o.id === p.opId; })[0] : null; }catch(e){}
  var shop = false; try{ shop = typeof isShopPunch === "function" && isShopPunch(p); }catch(e){}
  var lbl = shop ? "shop time" : ro ? (typeof tgNum === "function" ? String(tgNum(ro)) : String(ro.roNumber || "")) : "a punch";
  var who = ""; try{ who = (typeof PG !== "undefined" && PG.me && PG.me().name) || (typeof punchByName === "function" ? punchByName() : "") || ""; }catch(e){}
  return { id: uid("hl"), start: p.start, stop: p.stop, by: (typeof punchWho === "function" ? punchWho(p) : p.by) || p.by || "", roId: p.roId, opId: p.opId,
    label: lbl, what: shop ? (op && op.complaint || "") : (op && op.complaint || ""), delBy: who || "Admin", delAt: nowIso() };
}
/* deleting without an Undo of its own (an approved ask runs inside the approval's Undo) */
function v150PunchGone(p){
  var i = (STATE.punches || []).indexOf(p); if(i < 0) return false;
  try{ audit("punch-del", "Deleted a punch on " + (getRO(p.roId) ? roLabel(getRO(p.roId)) : "an RO") + " (" + fmtTime(p.start) + (p.stop ? "–" + fmtTime(p.stop) : "") + ")", getRO(p.roId)); }catch(e){}
  if(p.stop){ STATE.holes = STATE.holes || []; STATE.holes.push(v150Hole(p)); }
  STATE.punches.splice(i, 1); try{ syncAllBurnt(); }catch(e){} scheduleSave(true); return true;
}
/* notes that aren't on a punch: who wrote them (new ones are stamped as they're saved) and who may change them */
function v150StampBy(){
  var now = Date.now(), me = ""; try{ me = (typeof PG !== "undefined" && PG.me && PG.me().name) || (typeof punchByName === "function" ? punchByName() : "") || ""; }catch(e){}
  if(!me || !STATE || !Array.isArray(STATE.ros)) return;
  STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(op){
    [op.log, op.offNotes].forEach(function(L){ if(!Array.isArray(L)) return; L.forEach(function(n){ if(n && !n.by && n.at && n.text && Math.abs(now - new Date(n.at).getTime()) < 120000) n.by = me; }); });
  }); });
}
function v150NoteWho(job, ref, ro){ return (ref && ref.by) || (job && job.assignedTech) || (ro && ro.assignedTech) || ""; }
function v150NoteOk(job, ref, ro){
  var sf = null; try{ sf = typeof viewAsStaff === "function" ? viewAsStaff() : null; }catch(e){}
  if(!sf) return { ok: true };                                                     /* the admin, or no sign-in */
  if(/^(Foreman|Manager|Admin)$/.test(sf.role || "")) return { ok: true };
  var w = v150NoteWho(job, ref, ro); if(w && (typeof techSame === "function" ? techSame(w, sf.name) : w === sf.name)) return { ok: true };
  var f = String(w || "").trim().split(/\s+/)[0];
  return { ok: false, why: f ? "Only " + f + " or a foreman can change " + f + "’s note" : "Only the writer or a foreman can change this note" };
}
function v150HolesOf(job){ return (Array.isArray(STATE.holes) ? STATE.holes : []).filter(function(h){ return h && job && h.opId === job.id && h.start && h.stop && h.by; }); }
(function(o){ scheduleSave = function(){ try{ v150StampBy(); }catch(e){} return o.apply(this, arguments); }; })(scheduleSave);
