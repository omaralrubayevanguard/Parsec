/* Parsec · trucks · matching.js
   Which picture an RO shows: trkPick — the RO's own picture, else the catalog body that matches its model and year (trkModelFor / trkMatch), else the check-in photo (trkPhotoOf); the library of pictures (trkLib) and their sources.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   vtModelOf vtTrims vtYears trkClone trkLib trkNorm trkCode trkFamily vtFam vtFamRange truckYM trkInfo … (30 functions, 11 constants)
   state      truckPics truckPicsV
   uses       data/ kit/ pages/warranty/ ro/ state/
*/
function vtModelOf(p){ if(p.family === "VN") return p.cab === "Day cab" ? "VNL 300" : /mid/i.test(p.cab) ? "VNL 610" : "VNL 660"; if(p.family === "VNR Electric") return "VNR Electric"; return p.family + " " + p.cab; }
var VT_SEED = VT_P.map(function(p){ return { id: "vt-" + p.id, make: "Volvo", model: vtModelOf(p), alias: VT_ALIAS[p.id] || "", years: p.from + "-" + (p.to >= 2026 ? "" : p.to), src: "starter:vt_" + p.id + "_s", top: "starter:vt_" + p.id + "_t", cut: 1, up: 1, vt: p.id }; });
function vtTrims(p){ return p && Array.isArray(p.trims) ? p.trims : []; }
function vtYears(p){ return p.from + (p.to >= 2026 ? "–today" : p.to === p.from ? "" : "–" + p.to); }
var TRK_SIL = '<svg viewBox="0 0 200 92" aria-hidden="true"><g fill="currentColor"><path d="M14 66V52q0-6 6-7l30-3 8-16q2-4 7-4h24v44z" opacity=".55"/><path d="M89 22h42q4 0 4 4v40H89z" opacity=".4"/><rect x="135" y="60" width="56" height="6" rx="2" opacity=".5"/><rect x="146" y="54" width="22" height="6" rx="2" opacity=".45"/><rect x="92" y="58" width="30" height="10" rx="5" opacity=".35"/></g><g fill="none" stroke="currentColor" stroke-width="5" opacity=".6"><circle cx="38" cy="74" r="10"/><circle cx="152" cy="74" r="10"/><circle cx="177" cy="74" r="10"/></g></svg>';
var TRK_URL = {}, TRK_PH = {}, TRK_PEND = {}, TRK_BAD = {};   /* TRK_BAD: photos whose file isn't in this browser or the folder */
function trkClone(x){ return Object.assign({}, x); }
function trkLib(){ if(!Array.isArray(STATE.truckPics)){ STATE.truckPics = TRK_SEED.concat(VT_SEED).map(trkClone); STATE.truckPicsV = 3; }
  /* Parsec 10, once: 9.9's pictures cut from screenshots go (the ones nobody changed) and the 52 bodies come in — pictures removed after that stay removed */
  if((STATE.truckPicsV || 0) < 3){ var have = {};
    STATE.truckPics = STATE.truckPics.filter(function(e){ return !(/^g-/.test(e.id) && /^starter:g_/.test(String(e.src || ""))); });
    STATE.truckPics.forEach(function(e){ have[e.id] = 1; if(e.id === "st-blue" && e.years === "2018-" && e.src === "starter:side_blue") e.years = "2018-2025"; });
    VT_SEED.forEach(function(x){ if(!have[x.id]) STATE.truckPics.push(trkClone(x)); });
    STATE.truckPicsV = 3; }
  /* the starter pictures' view from above — a top removed on purpose is "" and stays gone */
  STATE.truckPics.forEach(function(e){ if(e.top === undefined){ var s = TRK_SEED.concat(VT_SEED).filter(function(x){ return x.id === e.id; })[0]; if(s && e.src === s.src) e.top = s.top; } });
  return STATE.truckPics; }
function trkNorm(s){ return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
/* a Volvo model as the RO or the VIN decode writes it, down to family + cab code: VNL64T760 → VNL760, VHD64F300 → VHD300, VN 610 → VNL610 */
function trkCode(s){ var n = trkNorm(String(s || "").replace(/volvo/ig, "")), m = /^(VNL|VNM|VNR|VNX|VHD|VAH|VT|VN)(?:\d{2}[A-Z]{0,2})?(\d{3})(?:AF|AB|[A-Z]{0,2})?$/.exec(n) || /^(VNL|VNM|VNR|VNX|VHD|VAH|VT|VN)(\d{3})/.exec(n);
  if(!m) return n; return (m[1] === "VN" ? "VNL" : m[1]) + m[2]; }
function trkFamily(model){ var n = trkNorm(String(model || "").replace(/volvo/ig, "")), m = /^(VNRELECTRIC|VNL|VNM|VNR|VNX|VHD|VAH|VT|VN)/.exec(n); return m ? (m[1] === "VNRELECTRIC" ? "VNR Electric" : m[1] === "VN" ? "VNL" : m[1]) : ""; }   /* the first VN is the VNL line */
function vtFam(p){ return p.family === "VN" ? "VNL" : p.family; }
/* the years a Volvo family was built (from the catalog) */
function vtFamRange(fam){ var L = VT_P.filter(function(p){ return vtFam(p) === fam; }); if(!L.length) return null;
  return [Math.min.apply(0, L.map(function(p){ return p.from; })), Math.max.apply(0, L.map(function(p){ return p.to >= 2026 ? 9999 : p.to; }))]; }
/* The model year: the RO's own (New RO and the RO's Vehicle facts), else the VIN's. The VIN's year letter repeats every 30 years,
   so when the model was only built in the other one, that's the year. */
function truckYM(ro){
  var t = truckYM0(ro), y = +(ro && ro.year) || 0;
  if(y >= 1980 && y <= 2100){ t.year = y; t.yearFrom = "ro"; }
  else if(t.year){ t.yearFrom = "vin"; var r = vtFamRange(trkFamily(t.model)); if(r && (t.year < r[0] || t.year > r[1])){ var alt = [t.year - 30, t.year + 30].filter(function(v){ return v >= r[0] && v <= r[1] && v <= new Date().getFullYear() + 1; })[0]; if(alt) t.year = alt; } }
  t.line = [t.year, t.make, t.model].filter(Boolean).join(" ");
  return t;
}
function trkInfo(ro){ var t = {}; try{ t = truckYM(ro) || {}; }catch(e){}
  return { year: +t.year || 0, yearFrom: t.yearFrom || "", make: String(t.make || "").trim(), model: String((ro && ro.model) || t.model || "").trim() }; }
function trkYears(s){ var m = /^\s*(\d{4})?\s*(?:[-–+]\s*(\d{4})?)?\s*$/.exec(String(s || "")); if(!m || (!m[1] && !m[2])) return null;
  var a = m[1] ? +m[1] : 0, b = m[2] ? +m[2] : (/[-–+]/.test(s) ? 9999 : a); return [a, b]; }
function trkEntry(id){ return id ? trkLib().filter(function(e){ return e.id === id && !e.off; })[0] || null : null; }
/* the best model picture for this truck, or null — the body confirmed on the RO comes first */
function trkModelFor(ro){
  var c = ro && trkEntry(ro.trkBody); if(c) return c;
  var I = trkInfo(ro), rm = trkCode(I.model), best = null, bs = 0;
  /* Parsec 12.2: the picture set when the RO was made (or its year and model last changed) stays with it */
  var A = ro && ro.trkAuto; if(A && A.id && (A.y || 0) === (I.year || 0) && (A.m || "") === (rm || "")){ var ea = trkEntry(A.id); if(ea) return ea; }
  if(!rm){ if(ro && I.year && !ro.shop && ro.id !== SHOP_RO_ID && ro.id){ var er = trkAutoPick(ro); if(er) setTimeout(trkAutoSave, 0); return er; } return null; }   /* a year and no model: a body of that year, at random */
  trkLib().forEach(function(e){
    if(e.off) return;
    var s = 0;
    [e.model].concat(String(e.alias || "").split(",")).forEach(function(nm, k){ var em = trkCode(nm); if(!em) return;
      var v = rm === em ? 4 : (rm.indexOf(em) === 0 || rm.slice(-em.length) === em) ? 3 : 0;   /* "VNL 760" = "VNL760"; "VHD" fits "VHD 400"; "Anthem" fits "Mack Anthem" */
      if(k && v) v -= .5; if(v > s) s = v; });
    if(!s) return;
    if(e.make && I.make && trkNorm(e.make) !== trkNorm(I.make)) return;
    var y = trkYears(e.years); if(y && I.year){ if(I.year < y[0] || I.year > y[1]) s -= 2 + Math.min(40, I.year < y[0] ? y[0] - I.year : I.year - y[1]) / 100; else s += 1; }   /* out of its years: only when nothing fits — the nearest generation */
    if(e.color && ro.color && trkNorm(e.color) === trkNorm(ro.color)) s += 1;
    if(y && !I.year) s += Math.min(y[0], 2100) / 1e5;   /* no year on the RO: the newest generation */
    if(s > bs){ bs = s; best = e; }
  });
  /* Parsec 11.3: the body goes by the year and the model. The model names only the family (VNL, VNL64T), or a cab that wasn't built
     that year (a 2015 VNL 760), or only a starter picture with no years fits: the family's body for that year — the nearest cab */
  var fam = trkFamily(I.model);
  if(fam && (!best || (I.year && (!trkFits(best, I.year) || (/^st-/.test(best.id) && !trkYears(best.years)))))){
    var alt = trkFamPick(fam, I.year, +((/(\d{3})$/.exec(rm) || [])[1] || 0)); if(alt) return alt; }
  return best;
}
function trkFits(e, y){ var r = trkYears(e.years); return !r || !y || (y >= r[0] && y <= r[1]); }
/* the usual cab of each family, most common first — for a model with no cab */
var TRK_FAM_CAB = { VNL: [760, 670, 780, 860, 640, 740, 840, 660, 730, 630, 440, 430, 400, 300], VNR: [640, 660, 440, 400, 300], VNX: [740, 630, 400, 300], VHD: [300, 400, 200, 430], VAH: [300, 400, 600, 630, 430, 200], VNM: [430, 630, 200], VT: [880, 830, 800] };
function trkFamPick(fam, year, cab){
  var L = VT_SEED.filter(function(e){ var p = VT_BY[e.vt]; return p && vtFam(p) === fam && !!trkEntry(e.id); });
  if(!L.length) return null;
  var to = function(p){ return p.to >= 2026 ? 9999 : p.to; };
  var C = year ? L.filter(function(e){ var p = VT_BY[e.vt]; return year >= p.from && year <= to(p); }) : [];
  if(!C.length){   /* no year, or none built that year: the generation nearest it (the newest, with no year) */
    var dist = function(e){ var p = VT_BY[e.vt]; return !year ? -p.from : year < p.from ? p.from - year : year - to(p); };
    var m = Math.min.apply(0, L.map(dist)); C = L.filter(function(e){ return dist(e) === m; }); }
  var num = function(e){ var x = /(\d{3})/.exec(VT_BY[e.vt].cab || ""); return x ? +x[1] : 0; }, pref = TRK_FAM_CAB[fam] || [];
  var rank = function(e){ var n = num(e), i = pref.indexOf(n), c = VT_BY[e.vt].cab || ""; return n ? (i < 0 ? 90 : i) : /high/i.test(c) ? 95 : /mid/i.test(c) ? 96 : 97; };   /* the first VN: high roof, mid roof, day cab */
  C.sort(function(a, b){ if(cab){ var d = Math.abs(num(a) - cab) - Math.abs(num(b) - cab); if(d) return d; } return rank(a) - rank(b); });
  return trkEntry(C[0].id);
}
/* Parsec 12.2 — the truck picture is set when the RO is made: by its year and model (the same match as always); with a year and
   no model, a body built that year, picked at random from the main models. It's kept on the RO (trkAuto) until the year or the
   model changes; a body confirmed in Truck & photos, and the RO's own photos, still come first. */
var TRK_MAIN = ["VNL", "VNR", "VHD", "VAH", "VNX"];
function trkRandomFor(year, seed){
  var to = function(p){ return p.to >= 2026 ? 9999 : p.to; };
  var L = VT_SEED.filter(function(e){ var p = VT_BY[e.vt]; return p && TRK_MAIN.indexOf(vtFam(p)) > -1 && !!trkEntry(e.id); });
  if(!L.length) return null;
  var C = L.filter(function(e){ var p = VT_BY[e.vt]; return year >= p.from && year <= to(p); });
  if(!C.length){ var dist = function(e){ var p = VT_BY[e.vt]; return year < p.from ? p.from - year : year - to(p); }, m = Math.min.apply(0, L.map(dist)); C = L.filter(function(e){ return dist(e) === m; }); }
  var h = 0, k = String(seed || Math.random()) + "|" + year; for(var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;   /* random, but the same one for this RO and year */
  return trkEntry(C[h % C.length].id);
}
function trkAutoPick(ro){
  if(!ro || ro.shop || ro.id === SHOP_RO_ID) return null;
  var I = trkInfo(ro), rm = trkCode(I.model) || "", e = null;
  if(rm){ var keep = ro.trkAuto; ro.trkAuto = null; try{ e = trkModelFor(ro); } finally { ro.trkAuto = keep; } }
  else if(I.year) e = trkRandomFor(I.year, ro.id);
  if(e) ro.trkAuto = { id: e.id, y: I.year || 0, m: rm, rnd: rm ? 0 : 1, at: nowIso() }; else delete ro.trkAuto;
  return e;
}
var TRK_AS = 0; function trkAutoSave(){ if(TRK_AS) return; TRK_AS = 1; setTimeout(function(){ TRK_AS = 0; try{ scheduleSave(); }catch(e){} }, 400); }
/* how well the truck matches a body — said in the Truck & photos window (after ChatGPT's year-and-cab match) */
function trkMatch(ro){
  var I = trkInfo(ro), fam = trkFamily(I.model), code = trkCode(I.model), cab = (/(\d{3})$/.exec(code) || [])[1] || "";
  var chosen = trkEntry(ro.trkBody), best = trkModelFor(ro);
  if(chosen) return { st: "confirmed", entry: chosen, msg: "Body confirmed for this RO." };
  if(!I.model){ var ra = I.year ? trkModelFor(ro) : null; return { st: "model", entry: ra, msg: ra ? "No model on the RO — a " + I.year + " body picked at random. Add the model to match it." : "Add the truck’s model to match a body." }; }
  if(!fam) return { st: "family", entry: best, msg: best ? "Matched to a picture in Your data." : "This model isn’t in the Volvo catalog — add a vehicle photo." };
  if(!I.year) return { st: "year", entry: best, msg: "Add the model year to match the body" + (best ? " — showing the newest." : "."), I: I };
  var C = VT_SEED.filter(function(e){ var p = VT_BY[e.vt], fit = cab ? [e.model].concat(String(e.alias || "").split(",")).some(function(nm){ return trkCode(nm) === code; }) : vtFam(p) === fam;
    return fit && I.year >= p.from && I.year <= (p.to >= 2026 ? 9999 : p.to); });
  if(!C.length) return { st: "unsupported", entry: best, msg: "No body for a " + I.year + " " + I.model + (best ? " — showing the nearest. Confirm it, or add a photo." : ". Add a vehicle photo."), I: I };
  if(C.length > 1) return cab ? { st: "review", entry: best || trkEntry(C[0].id), cands: C, msg: I.year + " had two bodies — check which one against the truck.", I: I }
    : { st: "cab", entry: best || trkEntry(C[0].id), cands: C, msg: "Choose the cab to finish the match.", I: I };
  var p = VT_BY[C[0].vt], e = trkEntry(C[0].id) || best;
  if(p.review || (p.reviewYears || []).indexOf(I.year) > -1) return { st: "review", entry: e, msg: (p.review ? "An older body — " : I.year + " is a changeover year — ") + "check it against the truck.", I: I };
  return { st: "matched", entry: e, msg: "Matched by model year" + (I.yearFrom === "vin" ? " (from the VIN)" : "") + " and cab.", I: I };
}
var TRK_ST = { confirmed: ["good", "Confirmed"], matched: ["good", "Matched"], review: ["warn", "Check against truck"], cab: ["warn", "Choose the cab"], unsupported: ["warn", "Nearest body"], year: ["warn", "Needs the year"], model: ["bad", "Needs the model"], family: ["", "Not in the catalog"] };
/* the RO's own photos (Truck & photos) */
function trkOwnOf(ro){ var o = ro && ro.trkOwn; if(!o || !(o.side || o.top)) return null; return { id: "own-" + ro.id, make: "", model: "", src: o.side, top: o.top || "", cut: o.cut ? 1 : 0, own: 1, at: o.at || "" }; }
/* the check-in photo: the first picture in the RO's Pictures, else the first picture attached */
function trkPhotoOf(ro){
  var isImg = function(f){ return f && f.id && (/^image\//.test(f.type || "") || /\.(jpe?g|png|webp|gif|heic)$/i.test(f.name || f.fname || "")); };
  var L = [];
  (ro.bulletins || []).forEach(function(b){ if(b.task === "pics") (b.files || []).forEach(function(f){ if(isImg(f) && !TRK_BAD[f.id]) L.push(f); }); });
  if(!L.length) (ro.attachments || []).forEach(function(a){ if(isImg(a) && !TRK_BAD[a.id]) L.push(a); });
  return L[0] || null;
}
/* what to show: the RO's own photo, then the body, then the check-in photo, then the outline (an RO can ask for its check-in photo instead) */
function trkPick(ro){
  var o = trkOwnOf(ro), m = trkModelFor(ro), p = trkPhotoOf(ro);
  if(o && o.src) return { kind: "model", entry: o, src: trkSrc(o), photo: p, own: 1, model: m };
  if(m && !(ro.trkUse === "photo" && p)){ var base = trkSrc(m), col = null; try{ col = trkColorOf(ro); }catch(e){}   /* 17.3: the truck's colour */
    return { kind: "model", entry: m, src: col ? trkPaintSrc(base, col.hex, false) : base, base: base, color: col, photo: p }; }
  if(p) return { kind: "photo", file: p, src: TRK_PH[p.id] || "", model: m };
  return { kind: "none" };
}
function trkSrc(e, f){
  f = f || "src"; var key = e.id + "|" + f + "|" + (e.at || "") + "|" + String(e[f] || "").length;
  if(TRK_URL[key] !== undefined) return TRK_URL[key];
  var d = String(e[f] || ""); if(/^starter:/.test(d)) d = TRK_START[d.slice(8)] || "";
  var u = d;
  try{ var m = /^data:([^;]+);base64,(.*)$/.exec(d); if(m){ var b = atob(m[2]), a = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); u = URL.createObjectURL(new Blob([a], { type: m[1] })); } }catch(e){}
  TRK_URL[key] = u; return u;
}
/* the truck from above, for its bay and its yard spot: the RO's own top photo, else the body's top view, or nothing */
function trkTopOf(ro){   /* Parsec 16.3 (B): the top view that belongs to the picture trkPick shows — own, or the model's; none for a photo */
  var P = null; try{ P = trkPick(ro); }catch(e){}
  if(!P || P.kind !== "model" || !P.entry || !P.entry.top) return null;
  var ts = trkSrc(P.entry, "top"); if(P.color && !P.own) ts = trkPaintSrc(ts, P.color.hex, true);   /* 17.3: the colour from above too */
  return { entry: P.entry, src: ts, up: !!P.entry.up }; }
/* the bay tile keeps its look; the truck sits small at its right — from above, cab up, when there's that view; else its picture */
function trkBayTop(ro){ var T = null, P = null; try{ T = trkTopOf(ro); P = T ? null : trkPick(ro); }catch(e){}
  if(T && T.src) return '<span class="fm-ti top' + (T.up ? ' up' : '') + '" title="' + esc(trkLabel(ro)) + '"><img src="' + esc(T.src) + '" alt="" draggable="false"></span>';
  if(P && P.kind !== "none") return '<span class="fm-ti" title="' + esc(trkLabel(ro)) + '">' + trkThumb(ro) + '</span>';
  return ''; }
/* Parsec 10: a yard spot on Triage gets the truck from above, small */
function trkYardTop(ro){ try{ var T = trkTopOf(ro); if(!T || !T.src || !T.up) return ''; return '<span class="tg-tv" aria-hidden="true"><img src="' + esc(T.src) + '" alt="" draggable="false"></span>'; }catch(e){ return ''; } }
/* the selected RO's header on Foreman and Triage: its picture at the right (nothing when there's no picture) */
/* ===== Parsec 16.3 (B) — the RO everywhere: a quick look at any RO link, the same truck from above, and which picture an RO uses =====
   · Peek: point at an RO link (.ro-lnk[data-rolnk]) for half a second — its picture, number, customer, truck, status, tech and
     contact. Leaving, scrolling, Esc or a click hides it; the click itself opens the RO. Works inside shadow roots too.
   · Shop view: a bay shows the top view of the very picture the RO shows, or that picture itself — never another truck's top.
   · A new check-in photo on an RO with a model picture asks once: the model picture or this photo (ro.trkUse, ro.trkAsked). */
var V163B = { t: 0, lnk: null, el: null, roId: "", seen: null, q: [], ask: null };
function v163bE(t){ return String(t == null ? "" : t).replace(/[&<>"]/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function v163bPhone(p){ var s = String(p || "").trim(), d = s.replace(/\D/g, ""); if(d.length === 11 && d.charAt(0) === "1") d = d.slice(1); return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : s; }
