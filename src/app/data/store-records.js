/* Parsec · data · store-records.js
   Records and marks: where an RO's folder goes (Open / Closed/<year>), ids on every record, updatedAt / updatedBy marks, deletion marks (tombstones in STATE.tombs), and pdCanon — the same data always gives the same text.
   Flow: pdMark is called by the save; the merge and the export rely on ids and marks.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pd16Closed pd16Year pd16Parent pd16Names pd16Page pd16Ids pd16Walk pd16TopKinds pd16Scan pdMarkReset pdMark pdSnap … (16 functions, 1 constant)
   state      pdKeyAt pdShop savedAt tombs
   uses       kit/ ro/ state/
*/
/* ---------- where each RO's folder goes ---------- */
function pd16Closed(ro){ try{ return !!roIsDone(ro); }catch(e){ return !!(ro && ro.dateClosed); } }
function pd16Year(ro){ var t = 0; try{ t = roDoneAt(ro); }catch(e){} var y = t ? new Date(t).getFullYear() : NaN; return isFinite(y) && y > 1990 ? String(y) : String(new Date().getFullYear()); }
function pd16Parent(ro){ return pd16Closed(ro) ? PD_CLOSED + "/" + pd16Year(ro) : PD_OPEN; }
/* folder names never change — "RO-38097 - Blue Ridge Haulers"; two ROs that would share one: the later gets " (<id>)" */
function pd16Names(S){
  S = S || STATE;
  var NAMES = {}, used = {}, nowMs = Date.now();
  S.ros.forEach(function(ro){
    var base = roFolderFor(ro), had = ROFOLDER[ro.id] ? pdLeaf(ROFOLDER[ro.id]) : null;
    var lc = PD_LASTCUST[ro.id];
    if(!lc || lc.v !== (ro.customerName || "")) PD_LASTCUST[ro.id] = lc = { v: ro.customerName || "", at: nowMs };
    if(had && had !== base && had !== base + " (" + ro.id + ")" && had.split(" - ")[0].replace(/ \(.*\)$/, "") === roNumPart(ro) && nowMs - lc.at < 30000) base = had;
    if(had && (had === base || had === base + " (" + ro.id + ")") && !used[had.toLowerCase()]){ NAMES[ro.id] = had; used[had.toLowerCase()] = 1; }
  });
  S.ros.forEach(function(ro){
    if(NAMES[ro.id]) return;
    var base = roFolderFor(ro), name = used[base.toLowerCase()] ? base + " (" + ro.id + ")" : base;
    NAMES[ro.id] = name; used[name.toLowerCase()] = 1;
  });
  var out = {}; S.ros.forEach(function(ro){ out[ro.id] = pd16Parent(ro) + "/" + NAMES[ro.id]; });
  return out;
}
/* the page beside ro.json: the same readable record, with no data inside */
function pd16Page(ro, punches, savedAt, closed){
  var h;
  try{ h = roPageHtml(ro, punches || [], { savedAt: savedAt || Date.now() }); }
  catch(e){ h = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(roNumPart(ro)) + ' Repair Order</title></head><body><h1>' + esc(ro.roNumber || "RO") + '</h1><p>' + esc(ro.customerName || "") + '</p></body></html>'; }
  return h.replace(PD_DATA_RE, "").replace("This page is the record Parsec keeps for this RO.", "A page to read. Parsec keeps this RO’s data in " + (closed ? "ro.json.gz" : "ro.json") + " beside it.");
}

/* ---------- ids, marks and deletion marks ---------- */
function pd16Ids(S){
  var fix = function(kind, arr){
    if(!Array.isArray(arr)) return;
    var seen = {};
    arr.forEach(function(r){ if(pdPlain(r) && r.id != null && r.id !== "") seen[r.id] = 1; });
    arr.forEach(function(r){
      if(!pdPlain(r)) return;
      if(r.id == null || r.id === ""){
        var h = kind.slice(0, 2) + "_" + pdHash(kind + JSON.stringify(r, pdNoMarks)), id = h, n = 2;
        while(seen[id]) id = h + "-" + n++;
        r.id = id; seen[id] = 1;
      }
      (PD_SUBS[kind] || []).forEach(function(sk){ fix(sk, r[sk]); });
    });
  };
  Object.keys(S).forEach(function(k){ if(k !== "tombs" && !PD_IDF[k] && pdIsRecs(S[k])) fix(k, S[k]); });
}
/* every record, children first: fn(kind, rec, parentKind, parentId) */
function pd16Walk(kind, rec, fn, pk, pid){
  (PD_SUBS[kind] || []).forEach(function(sk){ (Array.isArray(rec[sk]) ? rec[sk] : []).forEach(function(c){ if(pdPlain(c) && c.id != null) pd16Walk(sk, c, fn, kind, rec.id); }); });
  fn(kind, rec, pk, pid);
}
function pd16TopKinds(S){ return Object.keys(S).filter(function(k){ return k !== "tombs" && pdIsRecs(S[k]); }); }
function pd16Scan(S){
  var M = { raw: {}, sig: {}, par: {}, top: {}, key: {}, kids: {} };
  var kinds = pd16TopKinds(S), isK = {};
  kinds.forEach(function(k){ isK[k] = 1;
    S[k].forEach(function(rec){
      if(pdIdOf(k, rec) == null) return;
      var tk = k + ":" + pdIdOf(k, rec), kids = [];
      pd16Walk(k, rec, function(kind, r, pk, pid){
        var key = kind + ":" + pdIdOf(kind, r), j = JSON.stringify(r);
        M.raw[key] = j; M.sig[key] = pdSig(r); M.par[key] = pid == null ? null : pid;
        if(key !== tk) kids.push(key); else M.top[key] = j;
      });
      M.kids[tk] = kids;
    });
  });
  Object.keys(S).forEach(function(k){ if(!isK[k] && k !== "savedAt" && k !== "pdKeyAt" && k !== "tombs") M.key[k] = JSON.stringify(S[k] === undefined ? null : S[k]); });
  return M;
}
/* after a load, an adopt or a merge: what is in memory now is the baseline (no record counts as edited) */
function pdMarkReset(){ if(!STATE) return; try{ pd16Ids(STATE); PD16.M = pd16Scan(STATE); }catch(e){ console.warn("pd16 marks", e); PD16.M = null; } }
/* at save: anything that differs from the baseline gets updatedAt / updatedBy; anything gone gets a deletion mark */
function pdMark(){
  if(!STATE) return 0;
  if(!PD16.M){ pdMarkReset(); return 0; }
  pd16Ids(STATE);
  var O = PD16.M, M = { raw: {}, sig: {}, par: {}, top: {}, key: {}, kids: {} }, now = nowIso(), who = pdWho(), n = 0, kAt = {};
  var kinds = pd16TopKinds(STATE), isK = {};
  kinds.forEach(function(k){ isK[k] = 1;
    STATE[k].forEach(function(rec){
      if(pdIdOf(k, rec) == null) return;
      var tk = k + ":" + pdIdOf(k, rec), j0 = JSON.stringify(rec);
      if(O.top[tk] === j0 && O.kids[tk]){            /* untouched: carry it over */
        M.top[tk] = M.raw[tk] = j0; M.sig[tk] = O.sig[tk]; M.par[tk] = null; M.kids[tk] = O.kids[tk];
        O.kids[tk].forEach(function(c){ M.raw[c] = O.raw[c]; M.sig[c] = O.sig[c]; M.par[c] = O.par[c]; });
        return;
      }
      var kids = [];
      pd16Walk(k, rec, function(kind, r, pk, pid){
        var key = kind + ":" + pdIdOf(kind, r), s = pdSig(r);
        if(O.sig[key] !== s){ if(!PD_NO_MARK[kind]){ r.updatedAt = now; r.updatedBy = who; } n++; kAt[k] = 1; }
        M.raw[key] = JSON.stringify(r); M.sig[key] = s; M.par[key] = pid == null ? null : pid;
        if(key !== tk) kids.push(key); else M.top[key] = M.raw[key];
      });
      M.kids[tk] = kids;
    });
  });
  /* gone since the baseline → a deletion mark (a child only when its parent is still here) */
  var T = Array.isArray(STATE.tombs) ? STATE.tombs : null, have = {};
  (T || []).forEach(function(t){ have[t.kind + ":" + t.id] = 1; });
  Object.keys(O.raw).forEach(function(key){
    if(key in M.raw) return;
    var i = key.indexOf(":"), kind = key.slice(0, i), id = key.slice(i + 1), pid = O.par[key];
    if(pid == null) kAt[kind] = 1;
    if(PD_NO_TOMB[kind] || have[key]) return;
    if(pid != null){ var pkind = null; Object.keys(PD_SUBS).forEach(function(pk){ if(PD_SUBS[pk].indexOf(kind) > -1) pkind = pk; }); if(pkind && !((pkind + ":" + pid) in M.raw)) return; }
    if(!T) T = STATE.tombs = [];
    T.push({ kind: kind, id: id, parentId: pid == null ? null : pid, deletedAt: now, by: who }); have[key] = 1; n++;
  });
  /* a record that is back (undo, or kept by a merge) loses its mark */
  if(T){ var keep = T.filter(function(t){ return !((t.kind + ":" + t.id) in M.raw); }); if(keep.length !== T.length){ T.length = 0; Array.prototype.push.apply(T, keep); n++; }
    if(T.length > PD_TOMB_MAX) T.splice(0, T.length - PD_TOMB_MAX); }
  Object.keys(STATE).forEach(function(k){
    if(isK[k] || k === "savedAt" || k === "pdKeyAt" || k === "tombs") return;
    var j = JSON.stringify(STATE[k] === undefined ? null : STATE[k]);
    M.key[k] = j; if(O.key[k] !== j) kAt[k] = 1;
  });
  Object.keys(O.key).forEach(function(k){ if(!(k in M.key) && !isK[k]) kAt[k] = 1; });
  if(T && T.length !== (O.tombN || 0)) kAt.tombs = 1;
  M.tombN = T ? T.length : 0;
  var ks = Object.keys(kAt);
  if(ks.length){ if(!pdPlain(STATE.pdKeyAt)) STATE.pdKeyAt = {}; ks.forEach(function(k){ STATE.pdKeyAt[k] = now; }); }
  PD16.M = M;
  return n;
}
/* the folder as it was last read or written — the common ancestor of a merge */
function pdSnap(){ var M = PD16.M; if(!M) return null; return { recs: Object.assign({}, M.top), keys: Object.assign({}, M.key), savedAt: STATE.savedAt || 0, shop: STATE.pdShop && STATE.pdShop.id || null }; }
var PD16_BASE_T = null;
function pd16BaseKeep(){ clearTimeout(PD16_BASE_T); PD16_BASE_T = setTimeout(function(){ if(PD16.base) idbSet("pd16base", PD16.base).catch(function(){}); }, 4000); }
function pd16BaseLoad(shopId){ return idbGet("pd16base").then(function(b){ return b && b.recs && shopId && b.shop === shopId ? b : null; }, function(){ return null; }); }
/* clear deletion marks — all of them, or just these ids (once the server has taken them in) */
function pdTombsClear(ids){
  var T = Array.isArray(STATE.tombs) ? STATE.tombs : [], before = T.length;
  if(ids == null) T.length = 0;
  else { var want = {}; [].concat(ids).forEach(function(x){ want[pdPlain(x) ? x.kind + ":" + x.id : String(x)] = 1; });
    var keep = T.filter(function(t){ return !want[t.id] && !want[t.kind + ":" + t.id]; }); T.length = 0; Array.prototype.push.apply(T, keep); }
  STATE.tombs = T;
  var n = before - T.length;
  if(n){ if(PD16.M) PD16.M.tombN = T.length; scheduleSave(true); }
  return n;
}

/* ---------- the canonical form: the same data always gives the same text (order of keys and of records doesn't count) ---------- */
function pdCanon(S){
  var sortObj = function(v){
    if(Array.isArray(v)) return v.map(sortObj);
    if(!pdPlain(v)) return v;
    var o = {}; Object.keys(v).sort().forEach(function(k){ if(v[k] !== undefined) o[k] = sortObj(v[k]); }); return o;
  };
  var o = {};
  Object.keys(S || {}).sort().forEach(function(k){
    var v = S[k]; if(v === undefined || PD_LOCAL_ONLY[k]) return;
    if(Array.isArray(v) && v.every(function(x){ return pdPlain(x) && x.id != null; }))
      v = v.slice().sort(function(a, b){ var x = String(a.id), y = String(b.id); return x < y ? -1 : x > y ? 1 : 0; });
    o[k] = sortObj(v);
  });
  return JSON.stringify(o);
}
