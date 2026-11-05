/* Parsec · settings · values-and-changes.js
   Values, defaults and who: sgVal / sgDef / sgChanged, who may change a setting (sgCan / sgWho), and sgChange — every change goes through here (before and after, the Recently changed log with Undo, the save). Also going to a setting and search.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   sgDef sgHasVal sgVal sgChanged sgOpts sgText sgRolesWith sgPeopleWith sgCan sgWho sgOnly sgLog … (29 functions, 1 constant)
   state      setLog
   uses       access/ data/ kit/ pages/rolist/ ro/ shell/ state/
   at load    wraps ptipSetMode
*/
/* ---------- values, defaults, who ---------- */
function sgDef(e){ return typeof e.def === "function" ? e.def() : sgCopy(e.def); }
function sgHasVal(e){ return typeof e.get === "function"; }
function sgVal(e){ try{ return e.get(); }catch(x){ return null; } }
function sgChanged(e){ if(!sgHasVal(e) || e.def === undefined || e.kind === "action" || e.kind === "ref" || e.kind === "mount") return false; if(e.dot) return !!e.dot(); return !sgSame(sgVal(e), sgDef(e)); }
function sgOpts(e){ return typeof e.opts === "function" ? e.opts() : (e.opts || []); }
function sgText(e, v){
  if(v === undefined) v = sgVal(e);
  if(e.text) try{ return String(e.text(v)); }catch(x){ return ""; }
  if(e.kind === "seg" || e.kind === "sel"){ var o = sgOpts(e).filter(function(x){ return String(x[0]) === String(v); })[0]; return o ? o[1] : String(v); }
  if(e.kind === "sw") return v ? "On" : "Off";
  if(e.kind === "num") return v + (e.unit ? " " + e.unit : "");
  if(e.kind === "text") return v ? String(v) : "—";
  return "";
}
function sgRolesWith(act){ return permRoles().filter(function(r){ var t = permRole(r); return !!(t.acts && t.acts[act]); }); }
function sgPeopleWith(act){ return staffList().filter(function(sf){ return sf && !sf.off && permChanged(sf, "acts", act) && permHas(sf, "acts", act); }).map(function(sf){ return admFirst(sf.name); }); }
function sgCan(e){
  var w = e.who; if(w === "me") return true;
  var me = sgMe(); if(!me) return true;                                    /* the Admin: everything */
  if(me.off) return false;
  if(w === "admin") return false;
  if(w === "va") return me.role === "Manager";
  return can(w);
}
function sgWho(e){   /* the who line — from the permissions as they are now */
  if(e.who === "me") return e.per === "computer" ? "You — saved on this computer" : "You — saved for you";
  if(e.who === "admin") return "Only the Admin";
  if(e.who === "va") return "The manager and the Admin";
  var R = sgRolesWith(e.who).map(function(r){ return r.toLowerCase(); }), P = sgPeopleWith(e.who);
  return R.length || P.length ? "The " + sgAnd(R.concat(P).concat(["Admin"])) : "Only the Admin";
}
function sgOnly(e){
  if(e.who === "admin") return "Only the Admin can change this";
  if(e.who === "va") return "Only the manager can change this";
  var R = sgRolesWith(e.who).map(function(r){ return r.toLowerCase(); }), P = sgPeopleWith(e.who);
  return R.length || P.length ? "Only the " + sgAnd(R.concat(P)) + " can change this" : "Only the Admin can change this";
}

/* ---------- changing: every change goes through here — before and after, the log, the save ---------- */
function sgLog(){ if(!Array.isArray(STATE.setLog)) STATE.setLog = []; return STATE.setLog; }
var SG_BUSY = 0;
function sgChange(id, fn, how){
  var e = SG_BY[id]; if(!e) return false;
  if(!sgCan(e)){ pushToast(sgOnly(e) + "."); return false; }
  var before = sgHasVal(e) ? sgCopy(sgVal(e)) : null, r;
  SG_BUSY++; try{ r = fn(e); }catch(x){ console.error(x); r = false; } finally{ SG_BUSY--; }
  if(typeof r === "string"){ pushToast(r); render(); return false; }
  var after = sgHasVal(e) ? sgCopy(sgVal(e)) : null;
  if(sgSame(before, after)){ render(); return false; }
  if(e.after) try{ e.after(before, after); }catch(x){ console.error(x); }
  var x = sgRecord(e, before, after, how);
  scheduleSave(true); render();
  if(!e.quiet) pushToast(e.label + ": " + (e.change ? x.fromT + " → " + x.toT : x.toT) + (how === "reset" ? " — back to the default" : how === "undo" ? " — put back" : "") + ".");
  return true;
}
function sgRecord(e, before, after, how){
  var me = sgMe(), L = sgLog();
  var ch = null; if(e.change) try{ ch = e.change(before, after); }catch(z){ ch = null; }
  var x = { id: uid("sg"), k: e.id, at: nowIso(), by: sgByName(), byId: me ? me.id : "", how: how || "set", fromT: ch ? ch[0] : sgText(e, before), toT: ch ? ch[1] : sgText(e, after) };
  if(!e.secret){ x.from = before; x.to = after; }
  L.push(x); if(L.length > 120) STATE.setLog = L.slice(-120);
  return x;
}
function sgSet(id, v, how){ return sgChange(id, function(e){ if(e.ok && !e.ok(v)) return "Type " + (e.unit === "$ an hour" ? "the labor rate in dollars" : "a number") + "."; e.set(v); }, how); }
function sgOp(id, op, val){ return sgChange(id, function(e){ var cur = sgCopy(sgVal(e)), r = e.op(op, val, cur); if(typeof r === "string") return r; e.set(r); }); }
function sgReset(id){ var e = SG_BY[id]; if(!e || e.noReset || !sgChanged(e)) return false; return sgChange(id, function(e){ e.set(sgDef(e)); }, "reset"); }
function sgResetGroup(g){
  var L = SG_REG.filter(function(e){ return e.g === g && sgShown(e) && !e.noReset && sgChanged(e) && sgCan(e); }), n = 0, Q = [];
  SG_BUSY++; try{ L.forEach(function(e){ var b = sgCopy(sgVal(e)); try{ e.set(sgDef(e)); }catch(x){ console.error(x); return; } var a = sgCopy(sgVal(e)); if(!sgSame(a, b)){ if(e.after) try{ e.after(b, a); }catch(x){} Q.push([e, b, a]); n++; } }); }finally{ SG_BUSY--; }
  Q.forEach(function(q){ sgRecord(q[0], q[1], q[2], "reset"); });
  UI.sgArm = null; if(n) scheduleSave(true); render();
  pushToast(n ? n + (n === 1 ? " setting" : " settings") + " back to the default — Undo each in Recently changed." : "Nothing to reset.");
  return n;
}
/* the paths that differ between two values: undo puts back only what that one change changed */
function sgDiff(a, b, p, out){
  if(sgSame(a, b)) return out;
  var oa = a && typeof a === "object" && !Array.isArray(a), ob = b && typeof b === "object" && !Array.isArray(b);
  if(oa && ob){ var ks = {}; Object.keys(a).forEach(function(k){ ks[k] = 1; }); Object.keys(b).forEach(function(k){ ks[k] = 1; }); Object.keys(ks).forEach(function(k){ sgDiff(a[k], b[k], p.concat([k]), out); }); return out; }
  if(p.length && SG_META[p[p.length - 1]]) return out;
  out.push(p); return out;
}
function sgAt(o, p){ for(var i = 0; i < p.length; i++){ if(o == null) return undefined; o = o[p[i]]; } return o; }
function sgPut(o, p, v){ if(!p.length) return v; if(!o || typeof o !== "object") o = {}; var c = o; for(var i = 0; i < p.length - 1; i++){ if(!c[p[i]] || typeof c[p[i]] !== "object") c[p[i]] = {}; c = c[p[i]]; } if(v === undefined) delete c[p[p.length - 1]]; else c[p[p.length - 1]] = v; return o; }
function sgCanUndo(x){ var e = SG_BY[x.k]; if(!e || x.undoneAt || !("from" in x) || !sgHasVal(e)) return false; if(e.who === "me"){ var me = sgMe(); if((me ? me.id : "") !== (x.byId || "")) return false; } return sgCan(e); }
function sgUndo(logId){
  var x = sgLog().filter(function(y){ return y.id === logId; })[0]; if(!x) return false;
  var e = SG_BY[x.k]; if(!e) return false;
  if(!sgCanUndo(x)){ pushToast(x.undoneAt ? "That one is already put back." : !("from" in x) ? "A PIN can’t be put back — set it again." : sgCan(e) ? "Only " + x.by + " can put that back." : sgOnly(e) + "."); return false; }
  var ok = sgChange(x.k, function(e){ var cur = sgCopy(sgVal(e)); sgDiff(x.from, x.to, [], []).forEach(function(p){ cur = sgPut(cur, p, sgCopy(sgAt(x.from, p))); }); e.set(cur); }, "undo");
  x.undoneAt = nowIso(); x.undoneBy = sgByName(); scheduleSave(true); render();
  return ok;
}
/* a change made from the person pop-over's Tooltips row goes in the list too */
(function(o){ ptipSetMode = function(v){ var b = ptipMode(), r = o.apply(this, arguments);
  if(!SG_BUSY && b !== r && SG_BY["me.tips"]){ try{ sgRecord(SG_BY["me.tips"], b, r, "set"); scheduleSave(true); }catch(e){} } return r; }; })(ptipSetMode);

/* ---------- going to a setting ---------- */
function sgOpen(sec, id){
  if(UI.view !== "profile"){ UI.pxPrev = UI.view; UI.view = "profile"; try{ window.scrollTo(0, 0); }catch(e){} }
  UI.pxSec = sgSec(sec); UI.sgQ = ""; UI.pxPop = null; UI.appMenu = false; UI.modal = null;
  if(id){ UI.sgHl = id; UI.sgHlUntil = Date.now() + 2000; }
  render();
  var qi = document.querySelector("[data-sg-q]"); if(qi && qi.value){ qi.value = ""; try{ qi.blur(); }catch(e){} }
  if(id) setTimeout(function(){ var r = document.getElementById("sg-r-" + id.replace(/\./g, "-")); if(r) try{ r.scrollIntoView({ block: "center" }); }catch(e){} }, 30);
  if(id) setTimeout(function(){ if(UI.sgHl === id && Date.now() >= UI.sgHlUntil - 20){ UI.sgHl = null; var r = document.querySelector(".sg-row.sg-hl"); if(r) r.classList.remove("sg-hl"); } }, 2010);
}
function sgGo(id){ var e = SG_BY[id]; if(!e) return; sgOpen(e.g, id); }
/* the short link that stands where a setting used to be */
function sgWhere(g){ return "Settings › " + ((SG_GROUPS.filter(function(x){ return x[0] === g; })[0] || [])[2] || "Settings"); }
function sgLinkHtml(g, id, what, person){
  return '<div class="sg-link">' + pxI("settings", 15) + '<span>' + esc(what || "These settings") + ' are in <b>' + esc(sgWhere(g)) + '</b></span><button class="px-btn sm" data-action="px-sg-go" data-g="' + g + '"' + (id ? ' data-id="' + esc(id) + '"' : '') + (person ? ' data-person="' + esc(person) + '"' : '') + '>Open</button></div>';
}

/* ---------- search: labels, help and values ---------- */
function sgWords(e){ var w = typeof e.words === "function" ? (function(){ try{ return e.words(); }catch(x){ return ""; } })() : (e.words || "");
  return [e.label, e.help, e.sub || "", e.where, sgHasVal(e) ? sgText(e) : "", (e.kind === "seg" || e.kind === "sel") ? sgOpts(e).map(function(o){ return o[1]; }).join(" ") : "", e.ph || "", w].join(" ").toLowerCase(); }
function sgFind(q){ q = String(q || "").trim().toLowerCase(); if(!q) return []; var T = q.split(/\s+/);
  return SG_REG.filter(function(e){ if(!sgShown(e) || !sgGroupOk(e.g)) return false; var w = sgWords(e); return T.every(function(t){ return w.indexOf(t) > -1; }); })
    .sort(function(a, b){ var la = a.label.toLowerCase().indexOf(q) > -1 ? 0 : 1, lb = b.label.toLowerCase().indexOf(q) > -1 ? 0 : 1; return la - lb; }); }
