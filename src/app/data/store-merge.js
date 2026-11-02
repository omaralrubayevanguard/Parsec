/* Parsec · data · store-merge.js
   Merging two states record by record (two computers saved the same shop): newer mark wins, deletions carry, and a clash on the same record asks Keep this / Keep that (pdClashAsk).
   Flow: adoptFolderState and pd16Poll call pdMerge; pdApplyMerge writes the result.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pdSameShop pdAt pdMerge pdKeyLabel pdWhenTxt pdClashText pdClashWhere pdClashAsk pdApplyMerge pd16Pull pd16PullNow pd16Nothing … (13 functions)
   uses       access/ kit/ ro/ shell/ state/
*/
/* ---------- the merge ---------- */
function pdSameShop(a, b){
  var x = a && a.pdShop && a.pdShop.id, y = b && b.pdShop && b.pdShop.id;
  if(x && y) return x === y;
  var ra = (a && a.ros) || [], rb = (b && b.ros) || [];
  if(!ra.length || !rb.length) return true;
  var ids = {}; ra.forEach(function(r){ ids[r.id] = 1; });
  return rb.some(function(r){ return ids[r.id]; });
}
function pdAt(x){ var t = x && x.updatedAt ? Date.parse(x.updatedAt) : 0; return isFinite(t) ? t : 0; }
/* base: pdSnap() of the last agreed folder (or null); choices: {clashId: "mine"|"theirs"} from the dialog */
function pdMerge(base, mine, theirs, choices){
  var clashes = [], stats = { theirs: 0, mine: 0, both: 0, gone: 0, kept: 0, keys: 0, kinds: {} }, out = {};
  var mSaved = mine.savedAt || 0, tSaved = theirs.savedAt || 0, mKA = mine.pdKeyAt || {}, tKA = theirs.pdKeyAt || {};
  var side = function(a, b){ return a > b ? "mine" : b > a ? "theirs" : (tSaved > mSaved ? "theirs" : "mine"); };
  var tombs = {};
  [].concat(Array.isArray(mine.tombs) ? mine.tombs : [], Array.isArray(theirs.tombs) ? theirs.tombs : []).forEach(function(t){
    if(!pdPlain(t)) return; var k = t.kind + ":" + t.id; if(!tombs[k] || Date.parse(t.deletedAt) < Date.parse(tombs[k].deletedAt)) tombs[k] = t; });
  var bump = function(kind, how){ stats[how]++; if(how !== "mine") stats.kinds[kind] = (stats.kinds[kind] || 0) + 1; };
  var label = function(kind, rec){ if(kind === "ros"){ var no = String(rec.roNumber || rec.id); return (/^RO/i.test(no) ? no : "RO " + no) + (rec.customerName ? " · " + rec.customerName : ""); }
    if(kind === "punches") return "Time punch" + (rec.by ? " · " + rec.by : "") + (rec.start ? " · " + pdWhenTxt(rec.start) : "");
    if(kind === "shifts") return "Day clock" + (rec.by ? " · " + rec.by : "") + (rec.in ? " · " + pdWhenTxt(rec.in) : "");
    if(kind === "staff") return "Person · " + (rec.name || rec.id);
    if(kind === "inventory") return "Part · " + (rec.desc || rec.pn || rec.id);
    return kind + " · " + (rec.name || rec.title || rec.text || rec.id); };
  function m3(b, m, t, cx){
    var sm = pdSig(m), st = pdSig(t);
    if(sm === st) return pdAt(t) > pdAt(m) ? t : m;
    if(b !== undefined){ var sb = pdSig(b); if(sb === sm) return t; if(sb === st) return m; }
    if(pdPlain(m) && pdPlain(t)){
      var c2 = Object.assign({}, cx); if(m.updatedAt || t.updatedAt){ c2.mAt = pdAt(m) || cx.mAt; c2.tAt = pdAt(t) || cx.tAt; c2.mBy = m.updatedBy || cx.mBy; c2.tBy = t.updatedBy || cx.tBy; }
      var o = {}, ks = Object.keys(m).concat(Object.keys(t).filter(function(k){ return !(k in m); }));
      ks.forEach(function(k){ if(k === "updatedAt" || k === "updatedBy") return;
        var v = m3(pdPlain(b) ? b[k] : undefined, m[k], t[k], Object.assign({}, c2, { path: cx.path ? cx.path + "." + k : k }));
        if(v !== undefined) o[k] = v; });
      return o;
    }
    var idl = function(a){ return Array.isArray(a) && (a.length === 0 || pdIdList(a)); };
    if(idl(m) && idl(t) && (m.length || t.length)) return byId(Array.isArray(b) ? b : [], m, t, cx);
    if(Array.isArray(m) && Array.isArray(t) && m.concat(t).every(function(x){ return x === null || typeof x !== "object"; })){
      var bs = {}, ms = {}, ts = {}; (Array.isArray(b) ? b : []).forEach(function(x){ bs[JSON.stringify(x)] = 1; });
      m.forEach(function(x){ ms[JSON.stringify(x)] = 1; }); t.forEach(function(x){ ts[JSON.stringify(x)] = 1; });
      return m.filter(function(x){ var k = JSON.stringify(x); return ts[k] || !bs[k]; }).concat(t.filter(function(x){ var k = JSON.stringify(x); return !ms[k] && !bs[k]; }));
    }
    /* both changed the same thing: a real clash */
    var id = cx.rk + "|" + (cx.path || ""), def = side(cx.mAt || 0, cx.tAt || 0), pick = choices && choices[id] || def;
    clashes.push({ id: id, rk: cx.rk, kind: cx.kind, label: cx.label, rec: cx.rec, path: cx.path || "", mine: m, theirs: t, pick: pick, def: def,
      mAt: cx.mAt || 0, tAt: cx.tAt || 0, mBy: cx.mBy || "", tBy: cx.tBy || "" });
    return pick === "theirs" ? t : m;
  }
  function byId(b, m, t, cx){
    var bi = pdIdx(b), mi = pdIdx(m), ti = pdIdx(t), res = [];
    m.forEach(function(x){
      var tt = ti[x.id], bb = bi[x.id];
      if(tt) res.push(m3(bb, x, tt, Object.assign({}, cx, { path: (cx.path || "") + "[" + x.id + "]" })));
      else if(!(bb && pdSig(bb) === pdSig(x))) res.push(x);           /* new here, or changed here after they removed it */
    });
    addTheirs(res, t, function(x){ return !mi[x.id] && !(bi[x.id] && pdSig(bi[x.id]) === pdSig(x)); });
    return res;
  }
  function addTheirs(res, t, want, kind){   /* theirs-only, each after the record it followed there */
    var idOf = function(x){ return kind ? pdIdOf(kind, x) : x && x.id; };
    var pos = {}; res.forEach(function(x, i){ pos[idOf(x)] = i; });
    var prev = null;
    t.forEach(function(x){
      if(want(x)){ var at = prev != null && prev in pos ? pos[prev] + 1 : res.length; res.splice(at, 0, x); pos = {}; res.forEach(function(y, i){ pos[idOf(y)] = i; }); }
      prev = idOf(x);
    });
  }
  var skip = { savedAt: 1, pdKeyAt: 1, tombs: 1, v: 1, pdShop: 1 };
  var keys = Object.keys(mine).concat(Object.keys(theirs).filter(function(k){ return !(k in mine); }));
  keys.forEach(function(k){
    if(skip[k]) return;
    var m = mine[k], t = theirs[k];
    if(m === undefined){ out[k] = t; return; }                      /* a whole kind is never dropped by a merge */
    if(t === undefined){ out[k] = m; return; }
    if(pdIsRecs(m) || pdIsRecs(t)){
      var ma = Array.isArray(m) ? m : [], ta = Array.isArray(t) ? t : [], mi = pdIdxK(k, ma), ti = pdIdxK(k, ta), res = [], I = function(x){ return pdPlain(x) ? pdIdOf(k, x) : null; };
      var one = function(id, mm, tt){
        var key = k + ":" + id, bj = base && base.recs ? base.recs[key] : undefined, bb, v;
        if(bj !== undefined){ try{ bb = JSON.parse(bj); }catch(e){} }
        if(mm && tt){
          var sm = pdSig(mm), st = pdSig(tt);
          if(sm === st) v = pdAt(tt) > pdAt(mm) ? tt : mm;
          else if(bb && pdSig(bb) === sm){ v = tt; bump(k, "theirs"); }
          else if(bb && pdSig(bb) === st){ v = mm; bump(k, "mine"); }
          else if(bb){
            v = m3(bb, mm, tt, { rk: key, kind: k, label: label(k, mm), rec: mm, mAt: pdAt(mm), tAt: pdAt(tt), mBy: mm.updatedBy, tBy: tt.updatedBy, path: "" });
            if(pdPlain(v) && !PD_NO_MARK[k]){ v.updatedAt = nowIso(); v.updatedBy = pdWho(); }
            bump(k, "both"); }
          else { v = side(pdAt(mm), pdAt(tt)) === "theirs" ? tt : mm; bump(k, v === tt ? "theirs" : "mine"); }
        } else if(tt){ v = tt; bump(k, "theirs"); }
        else v = mm;
        var tomb = tombs[key];
        if(tomb && v){ if(pdAt(v) > (Date.parse(tomb.deletedAt) || 0)) delete tombs[key];   /* edited after it was deleted: it stays */
          else { v = null; if(mm) bump(k, "gone"); } }                /* a deletion beats an older edit */
        return v;
      };
      ma.forEach(function(x){ if(I(x) == null){ res.push(x); return; } var v = one(I(x), x, ti[I(x)]); if(v) res.push(v); });
      var add = {}; ta.forEach(function(x){ if(I(x) != null && !mi[I(x)]){ var v = one(I(x), null, x); if(v) add[I(x)] = v; } });
      addTheirs(res, ta.map(function(x){ return (I(x) != null && add[I(x)]) || x; }), function(x){ return I(x) != null && !!add[I(x)] && add[I(x)] === x; }, k);
      /* a record with no key at all is kept from both sides (once) */
      var sigs = {}; res.forEach(function(x){ if(I(x) == null) sigs[pdSig(x)] = 1; });
      ta.forEach(function(x){ if(I(x) == null && !sigs[pdSig(x)]){ res.push(x); sigs[pdSig(x)] = 1; } });
      if(k === "audit") res.sort(function(a, c){ var x = String(a.at || ""), y = String(c.at || ""); return x < y ? -1 : x > y ? 1 : 0; });
      out[k] = res; return;
    }
    var bjk = base && base.keys ? base.keys[k] : undefined, bk;
    if(bjk !== undefined){ try{ bk = JSON.parse(bjk); }catch(e){} }
    var v = bk === undefined ? (pdSig(m) === pdSig(t) ? m : side(pdT(mKA[k]), pdT(tKA[k])) === "theirs" ? t : m)    /* no common ancestor: the newer change */
      : m3(bk, m, t, { rk: "key:" + k, kind: k, label: pdKeyLabel(k), mAt: pdT(mKA[k]), tAt: pdT(tKA[k]), path: "" });
    if(pdSig(v) !== pdSig(m)) stats.keys++;
    out[k] = v;
  });
  /* the marks that still stand: none for a record that is still here */
  var live = {};
  Object.keys(out).forEach(function(k){ if(Array.isArray(out[k])) out[k].forEach(function(r){ if(pdPlain(r) && pdIdOf(k, r) != null){ live[k + ":" + pdIdOf(k, r)] = 1;
    (PD_SUBS[k] || []).forEach(function(sk){ (r[sk] || []).forEach(function(c){ if(c && c.id != null){ live[sk + ":" + c.id] = 1; (PD_SUBS[sk] || []).forEach(function(s2){ (c[s2] || []).forEach(function(g){ if(g && g.id != null) live[s2 + ":" + g.id] = 1; }); }); } }); }); } }); });
  out.tombs = Object.keys(tombs).filter(function(k){ return !live[k]; }).map(function(k){ return tombs[k]; }).sort(function(a, b){ return String(a.deletedAt) < String(b.deletedAt) ? -1 : 1; });
  var mt = {}; (Array.isArray(mine.tombs) ? mine.tombs : []).forEach(function(t){ if(t) mt[t.kind + ":" + t.id] = 1; });
  stats.tombsNew = out.tombs.filter(function(t){ return !mt[t.kind + ":" + t.id]; }).length;
  var ka = {}; Object.keys(mKA).concat(Object.keys(tKA)).forEach(function(k){ var a = pdT(mKA[k]), b = pdT(tKA[k]); ka[k] = new Date(Math.max(a, b)).toISOString(); });
  out.pdKeyAt = ka; out.v = mine.v || theirs.v || 1; out.savedAt = Math.max(mSaved, tSaved); out.pdShop = theirs.pdShop || mine.pdShop;
  return { state: out, clashes: clashes, stats: stats };
}
function pdKeyLabel(k){ var t = {}; Object.keys(PD_TOPICS).forEach(function(n){ PD_TOPICS[n].forEach(function(x){ t[x] = n; }); });
  var nice = String(k).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(); return (t[k] ? t[k].charAt(0).toUpperCase() + t[k].slice(1) : "Shop") + " · " + nice; }
function pdWhenTxt(iso){ try{ return fmtDate(iso) + " " + fmtTime(iso); }catch(e){ return String(iso || ""); } }

/* ---------- the clash dialog: Keep this / Keep that, per row; the newer is picked for you ---------- */
function pdClashText(v){
  if(v === undefined || v === null || v === "") return "(empty)";
  if(typeof v === "boolean") return v ? "Yes" : "No";
  if(typeof v === "string") return v.length > 90 ? v.slice(0, 88) + "…" : v;
  if(typeof v === "number") return String(v);
  var s = JSON.stringify(v); return s.length > 90 ? s.slice(0, 88) + "…" : s;
}
function pdClashWhere(c){
  /* "operations[op_1].parts[pt_2].qty" → "Operation 1 (Brakes…) · Part 2 · qty" */
  var p = String(c.path || ""), rx = /(operations|parts|log|offNotes)\[([^\]]+)\]/g, m, names = { operations: "Operation", parts: "Part", log: "Note", offNotes: "Note" }, lead = [], cur = c.rec;
  while((m = rx.exec(p))){
    var n = "", arr = cur && cur[m[1]], hit = null;
    if(Array.isArray(arr)) arr.forEach(function(o, i){ if(o && String(o.id) === m[2]){ hit = o; n = " " + (i + 1) + (m[1] === "operations" && o.complaint ? " (" + pdClashText(o.complaint).slice(0, 40) + ")" : ""); } });
    cur = hit; lead.push(names[m[1]] + n);
  }
  var rest = p.replace(rx, "").split(".").filter(Boolean).map(function(f){ return String(f).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase(); });
  return lead.concat(rest.length ? [rest.join(" › ")] : []).join(" · ");
}
function pdClashAsk(clashes){
  return new Promise(function(res){
    var host = document.createElement("div"), pick = {};
    host.className = "pd16-clash"; host.setAttribute("role", "dialog"); host.setAttribute("aria-modal", "true"); host.setAttribute("aria-labelledby", "pd16-clash-h");
    clashes.forEach(function(c){ pick[c.id] = c.pick || c.def; });
    var when = function(ms, by){ return (ms ? pdWhenTxt(new Date(ms).toISOString()) : "earlier") + (by ? " · " + by : ""); };
    var draw = function(){
      host.innerHTML = '<div class="pd16-clash__card"><h2 id="pd16-clash-h">Two computers changed the same thing</h2>'
        + '<p class="pd16-clash__sub">Everything else from both computers is kept. For ' + (clashes.length === 1 ? "this one" : "these " + clashes.length) + ', pick which to keep — the newer one is picked for you. Undo puts it all back.</p>'
        + '<div class="pd16-clash__rows">' + clashes.map(function(c){
          var w = pdClashWhere(c);
          return '<div class="pd16-clash__row" data-cid="' + esc(c.id) + '"><div class="pd16-clash__what"><b>' + esc(c.label || c.kind) + '</b>' + (w ? ' · ' + esc(w) : '') + '</div>'
            + '<div class="pd16-clash__opts">'
            + '<button type="button" class="pd16-clash__opt' + (pick[c.id] === "mine" ? ' is-on' : '') + '" data-pick="mine" aria-pressed="' + (pick[c.id] === "mine") + '"><span class="pd16-clash__k">Keep this' + (c.def === "mine" ? ' · newer' : '') + '</span><span class="pd16-clash__v">' + esc(pdClashText(c.mine)) + '</span><span class="pd16-clash__w">This computer · ' + esc(when(c.mAt, c.mBy)) + '</span></button>'
            + '<button type="button" class="pd16-clash__opt' + (pick[c.id] === "theirs" ? ' is-on' : '') + '" data-pick="theirs" aria-pressed="' + (pick[c.id] === "theirs") + '"><span class="pd16-clash__k">Keep that' + (c.def === "theirs" ? ' · newer' : '') + '</span><span class="pd16-clash__v">' + esc(pdClashText(c.theirs)) + '</span><span class="pd16-clash__w">Other computer · ' + esc(when(c.tAt, c.tBy)) + '</span></button>'
            + '</div></div>'; }).join("") + '</div>'
        + '<div class="pd16-clash__foot"><span class="pd16-clash__note">Saving waits until you choose.</span><button type="button" class="pd16-clash__go" data-pd="use">Use these</button></div></div>';
    };
    draw();
    host.addEventListener("click", function(e){
      var b = e.target.closest && e.target.closest("[data-pick],[data-pd]"); if(!b) return;
      if(b.dataset.pd === "use"){ host.remove(); document.removeEventListener("keydown", key, true); res(pick); return; }
      var row = b.closest("[data-cid]"); if(!row) return; pick[row.dataset.cid] = b.dataset.pick; draw();
      var again = host.querySelector('[data-cid="' + (window.CSS && CSS.escape ? CSS.escape(row.dataset.cid) : row.dataset.cid) + '"] [data-pick="' + b.dataset.pick + '"]'); if(again) again.focus();
    });
    var key = function(e){ if(e.key === "Escape"){ e.stopPropagation(); e.preventDefault(); } };
    document.addEventListener("keydown", key, true);
    document.body.appendChild(host);
    setTimeout(function(){ var f = host.querySelector(".pd16-clash__opt.is-on"); if(f) f.focus(); }, 30);
  });
}
/* the merged state replaces this computer's — Undo brings this computer's back */
function pdApplyMerge(r, why){
  pushUndo(why === "15" ? "merge a Parsec 15 computer's changes" : "merge another computer's changes");
  STATE = normalizeState(r.state);
  pdMarkReset();
  var s = r.stats, parts = [], k = s.kinds, nm = { ros: "RO", punches: "punch", shifts: "day-clock entry", staff: "person", inventory: "part", audit: "activity line" };
  Object.keys(k).forEach(function(x){ parts.push(k[x] + " " + (nm[x] || x) + (k[x] === 1 ? "" : (nm[x] ? (/[sh]$/.test(nm[x]) ? "es" : "s") : ""))); });
  var line = (why === "15" ? "Merged changes saved by a computer still on Parsec 15" : "Merged another computer’s changes") + (why === "open" ? " on opening" : "") + (parts.length ? " — " + parts.join(", ") : "") + (s.keys ? (parts.length ? ", " : " — ") + s.keys + " setting" + (s.keys === 1 ? "" : "s") : "")
    + (s.gone ? " · " + s.gone + " deleted there" : "") + (r.clashes.length ? " · " + r.clashes.length + " picked by hand" : "");
  try{ audit("merge", line); }catch(e){}
  PD16.last = { at: nowIso(), line: line, stats: s, clashes: r.clashes.length }; PD16.merges++;
  undoBaseline();
  try{ render(); }catch(e){}
  pushToast(line + ".", true);
}
/* another computer saved: read the folder, merge, and (when nobody needs to be asked) carry on */
function pd16Pull(why){
  if(PD16.busy) return PD16.pulling || Promise.resolve("busy");   /* 17.1: one pull at a time — a save that wants one waits for the one under way */
  PD16.busy = true;
  try{ pdMark(); }catch(e){}
  var p = pd16PullNow(why);
  PD16.pulling = p.then(function(r){ PD16.pulling = null; return r; }, function(e){ PD16.pulling = null; throw e; });
  return PD16.pulling;
}
function pd16PullNow(why){
  return pd16ReadSettled().then(function(F){
    var base = PD16.base, res = pdMerge(base, STATE, F.state, null), nb = pdSnapOf(F.state);
    pd16Commit(F);
    if(!res.clashes.length && pd16Nothing(res)){ PD16.busy = false; return "same"; }   /* nothing new over there — this computer's copy goes up */
    if(!res.clashes.length){ pdApplyMerge(res, why); PD16.base = nb; PD16.busy = false; return "merged"; }
    PD16.clash = res; PD16.busy = false;
    pdClashAsk(res.clashes).then(function(choices){
      try{ pdMark(); }catch(e){}
      var r2 = pdMerge(base, STATE, F.state, choices);
      PD16.clash = null;
      pdApplyMerge(r2, why); PD16.base = nb;
      scheduleSave(true);
    });
    return "asked";
  }, function(e){ PD16.busy = false; throw e; });
}
/* the merge took nothing from the other computer */
function pd16Nothing(r){ var s = r.stats; return !s.theirs && !s.both && !s.gone && !s.keys && !s.tombsNew; }
function pdSnapOf(S){ var keep = PD16.M; try{ var c = JSON.parse(JSON.stringify(S)); pd16Ids(c); var M = pd16Scan(c); return { recs: M.top, keys: M.key, savedAt: S.savedAt || 0, shop: S.pdShop && S.pdShop.id || null }; }catch(e){ return null; } finally { PD16.M = keep; } }
