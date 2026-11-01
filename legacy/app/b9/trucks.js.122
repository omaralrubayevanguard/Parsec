/* ============================== The truck on the RO (Parsec 9.7 → 10) ==============================
   A picture of the truck in the RO's header (a band across the top, the truck on the right), in the
   RO list, Search, Foreman and Triage, the bays and the yard. Which picture: this RO's own photo (Truck &
   photos); else the body for the truck's year and model (Parsec 10: ChatGPT's 52 Volvo bodies, each from
   the side and from above); else the check-in photo — the first picture in the RO's Pictures; else a plain
   outline. Model pictures live with the shop's data (Your data › Truck pictures). */
var TRK_START = __TRKPICS__;      /* the pictures the shop starts with */
var TRK_SEED = [
  { id: "st-white", make: "Volvo", model: "VNL 760", years: "2018-2024", color: "White", src: "starter:side_white", cut: 1, top: "starter:top_white" },
  { id: "st-gray", make: "Volvo", model: "VNL 860", years: "2018-2024", color: "Gray", src: "starter:side_gray", cut: 1, top: "starter:top_gray" },
  { id: "st-blue", make: "Volvo", model: "VNR 300", years: "2018-2025", color: "Blue", src: "starter:side_blue", cut: 1, top: "starter:top_blue" },
  { id: "st-red", make: "Volvo", model: "VHD", years: "", color: "Red", src: "starter:side_red", cut: 1, top: "starter:top_red" }
];
/* Parsec 10: the 52-truck catalog — every Volvo body from 1997 to today, by generation and cab */
var VT_P = __VTP__;
var VT_BY = {}; VT_P.forEach(function(p){ VT_BY[p.id] = p; });
var VT_ALIAS = { "vn-original-day": "VNL 200,VNM 200", "vn-original-mid": "VNL 420,VNL 610,VNM 420,VNM 610", "vn-original-high": "VNL 660,VNL 770" };
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
  if(m && !(ro.trkUse === "photo" && p)) return { kind: "model", entry: m, src: trkSrc(m), photo: p };
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
function trkTopOf(ro){ var o = trkOwnOf(ro); if(o && o.top) return { entry: o, src: trkSrc(o, "top") };
  var m = trkModelFor(ro); return m && m.top ? { entry: m, src: trkSrc(m, "top"), up: !!m.up } : null; }
/* the bay tile keeps its look; the truck sits small at its right — from above, cab up, when there's that view; else its picture */
function trkBayTop(ro){ var T = null, P = null; try{ T = trkTopOf(ro); P = T ? null : trkPick(ro); }catch(e){}
  if(T && T.src) return '<span class="fm-ti top' + (T.up ? ' up' : '') + '" title="' + esc(trkLabel(ro)) + '"><img src="' + esc(T.src) + '" alt="" draggable="false"></span>';
  if(P && P.kind !== "none") return '<span class="fm-ti" title="' + esc(trkLabel(ro)) + '">' + trkThumb(ro) + '</span>';
  return ''; }
/* Parsec 10: a yard spot on Triage gets the truck from above, small */
function trkYardTop(ro){ try{ var T = trkTopOf(ro); if(!T || !T.src || !T.up) return ''; return '<span class="tg-tv" aria-hidden="true"><img src="' + esc(T.src) + '" alt="" draggable="false"></span>'; }catch(e){ return ''; } }
/* the selected RO's header on Foreman and Triage: its picture at the right (nothing when there's no picture) */
function trkHead(ro){ try{ if(!ro || ro.isTech || ro.shop || ro.id === SHOP_RO_ID) return ''; var P = trkPick(ro); if(P.kind === "none") return '';
  var nN = trkNotesOf(ro).length;
  return '<span class="tg-hpic" title="' + esc(trkLabel(ro)) + (P.kind === "photo" ? ' — check-in photo' : '') + (nN ? ' · ' + nN + ' note' + (nN === 1 ? '' : 's') + ' on the truck' : '') + '">' + trkThumb(ro) + (nN ? '<em class="tg-hn">' + nN + '</em>' : '') + '</span>'; }catch(e){ return ''; } }
/* the small picture where a Needs action row had its icon (Foreman, Triage) */
function trkGi(ro, icon){ try{ return '<span class="tg-gi trk" title="' + esc(trkLabel(ro)) + '">' + trkThumb(ro) + '</span>'; }catch(e){ return '<span class="tg-gi">' + icon + '</span>'; } }
/* load a check-in photo once; everything that shows it redraws from the cache */
function trkLoadPhoto(f, roId, cb){
  if(!f || TRK_PH[f.id]){ if(cb && f) cb(TRK_PH[f.id]); return; }
  if(TRK_PEND[f.id]){ if(cb) TRK_PEND[f.id].push(cb); return; }
  TRK_PEND[f.id] = cb ? [cb] : [];
  var done = function(u){ var L = TRK_PEND[f.id] || []; delete TRK_PEND[f.id]; if(u) TRK_PH[f.id] = u; else TRK_BAD[f.id] = 1; L.forEach(function(fn){ try{ fn(u); }catch(e){} }); };
  try{ if(typeof JC === "undefined" || !JC || !JC.blobOf){ done(""); return; }
    var t = setTimeout(function(){ if(TRK_PEND[f.id]) done(""); }, 8000);   /* a folder that never answers */
    JC.blobOf(f, roId).then(function(b){ clearTimeout(t); if(TRK_PEND[f.id]) done(b ? URL.createObjectURL(b) : ""); }, function(){ clearTimeout(t); if(TRK_PEND[f.id]) done(""); });
  }catch(e){ done(""); }
}
function trkNone(pic, I){ var act = pic.querySelector(".px-trk__act"), cam = pic.querySelector(".px-trk__cam"); pic.className = "px-trk__pic is-none"; pic.innerHTML = TRK_SIL + '<span class="px-trk__none">No picture for ' + esc(I.model || "this model") + ' yet</span>'; if(act) pic.appendChild(act); if(cam) pic.appendChild(cam); if(pic.parentNode) pic.parentNode.classList.add("is-none"); }
function trkLabel(ro){ var I = trkInfo(ro); return [I.year || "", I.make, I.model, ro && ro.trkTrim ? ro.trkTrim : ""].filter(Boolean).join(" ") || "this truck"; }
var TRK_CAM = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.3"/></svg>';
/* ---------- the RO's header: the title on the left, the truck on the right ---------- */
function trkBanner(tb, ro){
  if(!ro || ro.id === (typeof SHOP_RO_ID !== "undefined" ? SHOP_RO_ID : "") || ro.shop) return tb;
  var P = trkPick(ro), I = trkInfo(ro);
  var band = document.createElement("div"); band.className = "px-trk" + (P.kind === "none" ? " is-none" : "");
  var pic = document.createElement("div"); pic.className = "px-trk__pic is-" + P.kind + (P.kind === "model" && !P.entry.cut ? " is-framed" : "");
  if(P.kind === "model"){ var im = document.createElement("img"); im.src = P.src; im.alt = trkLabel(ro); pic.appendChild(im); pic.title = P.own ? "This RO’s own photo" : (P.entry.make ? P.entry.make + " " : "") + P.entry.model + " — the model picture"; }
  else if(P.kind === "photo"){ var ip = document.createElement("img"); ip.alt = "Check-in photo"; if(P.src) ip.src = P.src; else trkLoadPhoto(P.file, ro.id, function(u){ if(u){ ip.src = u; return; } var P2 = trkPick(ro); if(P2.kind === "photo") trkLoadPhoto(P2.file, ro.id, function(u2){ if(u2) ip.src = u2; else trkNone(pic, I); }); else if(P2.kind === "none") trkNone(pic, I); });
    pic.appendChild(ip); var cap = document.createElement("span"); cap.className = "px-trk__cap"; cap.textContent = "Check-in photo"; pic.appendChild(cap); pic.title = "The first picture in this RO's Pictures"; }
  else { pic.innerHTML = TRK_SIL + '<span class="px-trk__none">No picture for ' + esc(I.model || "this model") + ' yet</span>'; }
  var act = document.createElement("button"); act.type = "button"; act.className = "px-trk__act"; act.title = "More"; act.setAttribute("aria-label", "More about the truck picture");
  act.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>';
  act.addEventListener("click", function(ev){ ev.stopPropagation(); trkMenu(band, act, ro, P); });
  pic.appendChild(act);
  /* Parsec 10: the camera badge opens Truck & photos */
  var cam = document.createElement("button"); cam.type = "button"; cam.className = "px-trk__cam"; cam.title = "Truck & photos"; cam.setAttribute("aria-label", "Truck and photos"); cam.innerHTML = TRK_CAM;
  cam.addEventListener("click", function(ev){ ev.stopPropagation(); trkDlgOpen(ro, cam); });
  pic.appendChild(cam);
  try{ trkBannerNotes(pic, ro, P); }catch(e){ console.error(e); }
  band.appendChild(tb); band.appendChild(pic);
  return band;
}
function trkMenu(band, anchor, ro, P){
  var old = band.querySelector(".px-trk__menu"); if(old){ old.remove(); band.classList.remove("has-menu"); return; }
  var I = trkInfo(ro), mdl = I.model || "this model", m = P.model || (P.kind === "model" && !P.own ? P.entry : trkModelFor(ro)), photo = trkPhotoOf(ro);
  var menu = document.createElement("div"); menu.className = "px-trk__menu";
  var item = function(t, s, fn, cls){ var b = document.createElement("button"); b.type = "button"; if(cls) b.className = cls; b.innerHTML = "<b>" + esc(t) + "</b>" + (s ? "<small>" + esc(s) + "</small>" : ""); b.addEventListener("click", function(ev){ ev.stopPropagation(); shut(); fn(); }); menu.appendChild(b); };
  var shut = function(){ menu.remove(); band.classList.remove("has-menu"); };
  item("Truck & photos…", "Year, body, trim — or this RO’s own photos", function(){ trkDlgOpen(ro, anchor); });
  if(P.own) item("Use the body picture again", "This RO’s own photo goes", function(){ pushUndo("truck photo"); delete ro.trkOwn; trkChanged("This RO shows the body picture again."); });
  if(m && photo && !P.own){ if(ro.trkUse === "photo") item("Use the model picture here", "", function(){ pushUndo("truck picture"); delete ro.trkUse; trkChanged(); });
    else item("Use the check-in photo on this RO", "The first picture in Pictures", function(){ pushUndo("truck picture"); ro.trkUse = "photo"; trkChanged(); }); }
  item("Notes on the truck…", trkNotesOf(ro).length ? trkNotesOf(ro).length + " so far — put a note where the issue is" : "Put a note where the issue is", function(){ trkInspOpen(ro); });
  if(m && !m.own) item("Replace the picture for every " + mdl, (m.make ? m.make + " " : "") + m.model + (m.years ? " · " + m.years : ""), function(){ trkPickFile(function(src, cut){ trkSave(m.id, { src: src, cut: cut }); }); });
  else if(!m) item("Add a picture for every " + mdl, "Shows on every RO for this model — a side view looks best", function(){ trkPickFile(function(src, cut){ trkAdd(ro, src, cut); }); });
  item("The 52-truck catalog…", "Every Volvo body from 1997 to today", function(){ trkCatOpen(null); });
  item("All truck pictures…", "Your data › Truck pictures", function(){ UI.pxPrev = UI.view; UI.view = "profile"; UI.pxSec = "data"; try{ if(typeof pmOn === "function" && pmOn()) PM.pend = true; }catch(e){} render(); setTimeout(function(){ var c = document.querySelector('[data-trk-card]'); if(c) c.scrollIntoView({ block: "center" }); }, 60); }, "is-sep");
  band.appendChild(menu); band.classList.add("has-menu");
  var first = menu.querySelector("button"); if(first) try{ first.focus({ preventScroll: true }); }catch(e){}
  menu.addEventListener("keydown", function(e){ if(e.key === "Escape"){ e.stopPropagation(); shut(); anchor.focus(); } });
  setTimeout(function(){ var off = function(e){ var p = e.composedPath ? e.composedPath() : [e.target]; if(p.indexOf(menu) < 0 && p.indexOf(anchor) < 0){ shut(); document.removeEventListener("click", off, true); } else if(!menu.isConnected) document.removeEventListener("click", off, true); }; document.addEventListener("click", off, true); }, 0);
}
/* ---------- adding and changing pictures ---------- */
var TRK_IN = null;
function trkPickFile(cb){
  if(!TRK_IN){ TRK_IN = document.createElement("input"); TRK_IN.type = "file"; TRK_IN.accept = "image/*"; TRK_IN.style.display = "none"; document.body.appendChild(TRK_IN); }
  TRK_IN.value = ""; TRK_IN.onchange = function(){ var f = TRK_IN.files && TRK_IN.files[0]; if(f) trkShrink(f, cb); }; TRK_IN.click();
}
/* made small (560 px wide) and kept with the shop's data; a picture with a see-through background shows without a frame */
function trkShrink(file, cb, max){
  var url = URL.createObjectURL(file), img = new Image();
  img.onload = function(){
    var sc = Math.min(1, (max || 560) / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * sc)), h = Math.max(1, Math.round(img.naturalHeight * sc));
    var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
    var cut = 0; try{ var d = x.getImageData(0, 0, w, h).data, a = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4]; cut = a.every(function(i){ return d[i + 3] < 16; }) ? 1 : 0; }catch(e){}
    var out = c.toDataURL("image/webp", .82); if(!/^data:image\/webp/.test(out)) out = cut ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", .82);
    cb(out, cut);
  };
  img.onerror = function(){ URL.revokeObjectURL(url); pushToast("That file isn't a picture this browser can read."); };
  img.src = url;
}
function trkAdd(ro, src, cut){
  var I = trkInfo(ro); if(!I.model){ pushToast("Add the truck's model on the RO first — the picture goes with the model."); return; }
  pushUndo("truck picture");
  trkLib().push({ id: uid("trk"), make: I.make || "", model: I.model, years: "", color: "", src: src, cut: cut, at: nowIso(), by: (typeof punchByName === "function" && punchByName()) || "" });
  trkChanged("Picture added — it shows on every " + I.model + ".");
}
function trkSave(id, f){ var e = trkLib().filter(function(x){ return x.id === id; })[0]; if(!e) return; pushUndo("truck picture"); Object.assign(e, f, { at: nowIso() }); if(f.top) delete e.up; trkChanged("Saved."); }
function trkRemove(id){ var L = trkLib(), e = L.filter(function(x){ return x.id === id; })[0]; if(!e) return; pushUndo("truck picture"); STATE.truckPics = L.filter(function(x){ return x.id !== id; }); trkChanged("Removed — ROs for " + e.model + " show the check-in photo now."); }
function trkChanged(msg, undo){ scheduleSave(true); try{ render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} if(msg) pushToast(msg, !!undo); }
/* ---------- the small picture in lists ---------- */
function trkThumb(ro){
  var P = trkPick(ro);
  if(P.kind === "model") return '<span class="trk-th' + (P.entry.cut ? '' : ' fr') + '"><img src="' + esc(P.src) + '" alt=""></span>';
  if(P.kind === "photo") return '<span class="trk-th ph"><img' + (P.src ? ' src="' + esc(P.src) + '"' : '') + ' data-trk-f="' + esc(P.file.id) + '" data-trk-ro="' + esc(ro.id) + '" alt=""></span>';
  return '<span class="trk-th no">' + TRK_SIL + '</span>';
}
function trkHydrate(){
  if(TI && TI.ros !== STATE.ros){ TI.ros = STATE.ros; TI.draft = null; trkInspDraw(); }   /* Ctrl Z while the notes are open */
  document.querySelectorAll("#app img[data-trk-f]:not([src])").forEach(function(im){
    var ro = getRO(im.getAttribute("data-trk-ro")), f = ro && trkPhotoOf(ro);
    var swap = function(){ var th = im.closest(".trk-th"); if(ro && th && th.isConnected) th.outerHTML = trkThumb(ro); };
    if(!f || f.id !== im.getAttribute("data-trk-f")){ swap(); return; }
    trkLoadPhoto(f, ro.id, function(u){ if(u) document.querySelectorAll('#app img[data-trk-f="' + f.id + '"]').forEach(function(x){ x.src = u; }); else { swap(); trkHydrate(); } });
  });
}
/* ---------- Your data › Truck pictures ---------- */
function trkSettingsHtml(){
  var L = trkLib(), used = {};
  STATE.ros.forEach(function(ro){ if(ro.id === SHOP_RO_ID || ro.shop || (typeof roIsDone === "function" && roIsDone(ro))) return; var m = trkModelFor(ro); if(m) used[m.id] = (used[m.id] || 0) + 1; });
  var row = function(e){ var p = e.vt && VT_BY[e.vt]; return '<div class="px-trkr" data-trk-k="' + esc(((e.make || '') + ' ' + (e.model || '') + ' ' + (p ? p.label + ' ' + p.cab + ' ' : '') + (e.years || '')).toLowerCase()) + '"><span class="px-trkr__pic' + (e.cut ? '' : ' fr') + '"><img src="' + esc(trkSrc(e)) + '" alt="" loading="lazy"></span>'
    + '<button class="px-trkr__top' + (e.top ? '' : ' no') + (e.up ? ' up' : '') + '" data-trk-do="top" data-id="' + esc(e.id) + '" title="' + (e.top ? 'The view from above, for the bays and the yard — click to replace' : 'Add a view from above, for the bays and the yard') + '">' + (e.top ? '<img src="' + esc(trkSrc(e, "top")) + '" alt="" loading="lazy">' : '<span>+ From above</span>') + '</button>'
    + '<span class="px-trkr__f"><input class="px-in" data-trk-ed="' + esc(e.id) + '" data-f="make" value="' + esc(e.make || '') + '" placeholder="Make" aria-label="Make">'
    + '<input class="px-in" data-trk-ed="' + esc(e.id) + '" data-f="model" value="' + esc(e.model || '') + '" placeholder="Model" aria-label="Model">'
    + '<input class="px-in" data-trk-ed="' + esc(e.id) + '" data-f="years" value="' + esc(e.years || '') + '" placeholder="Years (any)" aria-label="Years, like 2018-2024">'
    + '<small class="px-trkr__n">' + (p ? esc(p.label) + ' · ' : '') + (used[e.id] ? 'On ' + used[e.id] + ' open RO' + (used[e.id] === 1 ? '' : 's') : 'No open ROs right now') + '</small></span>'
    + '<span class="px-trkr__b"><button class="px-btn sm" data-trk-do="replace" data-id="' + esc(e.id) + '">Replace</button><button class="px-btn sm ghost" data-trk-do="remove" data-id="' + esc(e.id) + '">Remove</button></span></div>'; };
  var miss = VT_SEED.filter(function(x){ return !L.some(function(e){ return e.id === x.id; }); }).length;
  return pxCard(pxCh("Truck pictures", "matched to each RO by model and year — without one, the check-in photo shows")
    + '<div class="px-row"><button class="px-btn sm" data-trk-do="catalog">Browse the 52-truck catalog</button>' + (miss ? '<button class="px-btn sm ghost" data-trk-do="restore">Put back ' + miss + ' catalog picture' + (miss === 1 ? '' : 's') + '</button>' : '') + '<span class="px-hint">ChatGPT’s 52 Volvo bodies, 1997 to today — each from the side and from above.</span></div>'
    + (L.length > 8 ? '<div class="px-row"><input class="px-trkq" data-trk-q placeholder="Find a model — VNL 760, VHD, 2019…" aria-label="Find a model picture"><span class="px-hint">' + L.length + ' pictures</span></div>' : '')
    + '<div class="px-trkl' + (L.length > 8 ? ' is-long' : '') + '" data-trk-card>' + (L.length ? L.map(row).join('') : '<p class="px-hint">No model pictures yet — open an RO and use the ⋯ on its picture to add one.</p>') + '</div>'
    + '<div class="px-row"><button class="px-btn sm" data-trk-do="add">Add a picture…</button><span class="px-hint">Years like 2018-2024 or 2025-, blank for any. A side view with a see-through background looks best; the view from above shows the truck in its bay and on the yard. Use pictures the dealership may use.</span></div>');
}
(function(){
  document.addEventListener("click", function(ev){
    var b = ev.target.closest && ev.target.closest("[data-trk-do]"); if(!b) return;
    ev.preventDefault(); ev.stopPropagation();
    var k = b.getAttribute("data-trk-do"), id = b.getAttribute("data-id");
    if(k === "remove") trkRemove(id);
    else if(k === "replace") trkPickFile(function(src, cut){ trkSave(id, { src: src, cut: cut }); });
    else if(k === "top") trkPickFile(function(src){ trkSave(id, { top: src }); });
    else if(k === "add") trkPickFile(function(src, cut){ pushUndo("truck picture"); trkLib().push({ id: uid("trk"), make: "Volvo", model: "", years: "", color: "", src: src, cut: cut, at: nowIso() }); trkChanged("Added — type its model so it finds its ROs."); });
    else if(k === "catalog") trkCatOpen(null, b);
    else if(k === "restore"){ pushUndo("truck pictures"); var L = trkLib(), n = 0; VT_SEED.forEach(function(x){ if(!L.some(function(e){ return e.id === x.id; })){ L.push(trkClone(x)); n++; } }); trkChanged(n + " catalog picture" + (n === 1 ? "" : "s") + " back."); }
  }, true);
  document.addEventListener("input", function(ev){
    var t = ev.target; if(!t || !t.hasAttribute || !t.hasAttribute("data-trk-q")) return;
    var q = String(t.value || "").toLowerCase().trim(), yr = /^\d{4}$/.test(q) ? +q : 0;
    document.querySelectorAll(".px-trkr[data-trk-k]").forEach(function(r){ var k = r.getAttribute("data-trk-k"), ok = !q || k.indexOf(q) > -1 || k.replace(/\s+/g, "").indexOf(q.replace(/\s+/g, "")) > -1;
      if(yr){ var y = trkYears((k.match(/(\d{4}-?\d{0,4})$/) || [])[1]); ok = !y || (yr >= y[0] && yr <= y[1]); }
      r.hidden = !ok; });
  }, true);
  document.addEventListener("change", function(ev){
    var t = ev.target; if(!t || !t.getAttribute || !t.getAttribute("data-trk-ed")) return;
    var e = trkLib().filter(function(x){ return x.id === t.getAttribute("data-trk-ed"); })[0]; if(!e) return;
    var f = t.getAttribute("data-f"), v = String(t.value || "").trim().slice(0, 40);
    if(f === "years" && v && !trkYears(v)){ pushToast("Years like 2018-2024, 2025- or 2019 — or leave it blank."); return; }
    if(e[f] === v) return; pushUndo("truck picture"); e[f] = v; trkChanged();
  }, true);
})();

/* ============================== Truck & photos (Parsec 10) ==============================
   One window per RO, from the camera on the truck picture: the model year and model, how well that
   matches a body (ChatGPT's year-and-cab match), the body and trim, and this RO's own photos — from the side
   for the header and lists, from above for the bay and the yard. Nothing changes until Save truck. */
var TD = null;   /* { ro, d: draft, base, back: element to give focus back to, busy } */
var TRK_MODELS_ALL = null;
function trkModelList(){ if(TRK_MODELS_ALL) return TRK_MODELS_ALL; var s = {};
  VT_SEED.forEach(function(e){ s[e.model] = 1; String(e.alias || "").split(",").forEach(function(a){ if(a) s[a] = 1; }); });
  try{ (TRUCK_MODELS || []).forEach(function(m){ s[m] = 1; }); }catch(e){}
  return (TRK_MODELS_ALL = Object.keys(s).sort()); }
function trkDraftRo(ro, d){ return Object.assign({}, ro, { year: d.year, model: d.model, trkBody: d.body, trkTrim: d.trim, trkOwn: (d.side || d.top) ? { side: d.side || "", top: d.top || "", cut: d.cut || 0 } : null }); }
function trkDlgOpen(ro, back){ if(!ro) return;
  var o = ro.trkOwn || {};
  var d = { year: ro.year ? String(ro.year) : "", model: ro.model || "", body: ro.trkBody || "", trim: ro.trkTrim || "", side: o.side || "", top: o.top || "", cut: o.cut || 0 };
  TD = { ro: ro.id, d: d, base: JSON.stringify(d), back: back || document.activeElement, busy: false, msg: "", err: false, ok: false };
  trkDlgDraw(true);
}
function trkDlgClose(){ var w = document.getElementById("trk-dlg"); if(w) w.remove(); var b = TD && TD.back; TD = null; document.documentElement.classList.remove("ti-open"); try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
function trkDlgDraw(first){
  var ro = TD && getRO(TD.ro); if(!ro){ trkDlgClose(); return; }
  var d = TD.d, dr = trkDraftRo(ro, d), I = trkInfo(dr), M = trkMatch(dr), st = TRK_ST[M.st] || ["", ""];
  var fam = trkFamily(d.model), show = M.entry, p = show && show.vt ? VT_BY[show.vt] : null, trims = vtTrims(p);
  var opts = trkLib().filter(function(e){ if(e.off) return false; var f2 = e.vt ? vtFam(VT_BY[e.vt]) : trkFamily(e.model); return !fam || f2 === fam; })
    .sort(function(a, b){ var pa = a.vt ? VT_BY[a.vt] : null, pb = b.vt ? VT_BY[b.vt] : null; return (pb ? pb.from : 0) - (pa ? pa.from : 0) || String(a.model).localeCompare(String(b.model)); });
  var bodyLbl = function(e){ var q = e.vt ? VT_BY[e.vt] : null; return q ? q.label + " · " + vtYears(q) : (e.make ? e.make + " " : "") + e.model + (e.years ? " · " + e.years : "") + " · your picture"; };
  var sideSrc = d.side || (show ? trkSrc(show) : ""), topSrc = d.top || (show && show.top ? trkSrc(show, "top") : "");
  var dirty = JSON.stringify(d) !== TD.base;
  var h = '<div class="td" role="dialog" aria-modal="true" aria-labelledby="td-h" tabindex="-1">'
    + '<div class="ti-h"><div class="ti-ht"><div class="ti-eb0"><span class="mono">' + esc(ro.roNumber || "") + '</span> · ' + esc(trkLabel(dr)) + '</div><h2 id="td-h">Truck &amp; photos</h2><div class="ti-sub">' + esc(ro.customerName || "Customer") + ' · Match the body, or use your own photos.</div></div>'
    + '<button type="button" class="ti-x" data-td="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="td-b">'
    + '<div class="td-r"><label class="ti-l td-y">Model year<input data-td-f="year" inputmode="numeric" maxlength="4" value="' + esc(d.year) + '" placeholder="' + (I.yearFrom === "vin" && I.year ? esc(String(I.year)) + ' (VIN)' : 'e.g. 2021') + '"></label>'
    + '<label class="ti-l td-m">Volvo model &amp; cab<input data-td-f="model" list="td-models" autocomplete="off" value="' + esc(d.model) + '" placeholder="e.g. VNL 860"></label>'
    + '<datalist id="td-models">' + trkModelList().map(function(m){ return '<option value="' + esc(m) + '"></option>'; }).join('') + '</datalist></div>'
    + '<div class="td-match"><p class="td-st"><span class="td-pill ' + st[0] + '">' + esc(st[1]) + '</span><span>' + esc(M.msg) + '</span>'
    + ((M.st === "review" || M.st === "unsupported" || M.st === "year") && show && !show.own ? '<button type="button" class="px-btn sm" data-td="confirm">Yes, this is the body</button>' : '') + '</p>'
    + '<div class="td-r2"><label class="ti-l">Body generation<select data-td-f="body"><option value="">' + (show ? 'Automatic — ' + esc(bodyLbl(show)) : 'Automatic') + '</option>' + opts.map(function(e){ return '<option value="' + esc(e.id) + '"' + (d.body === e.id ? ' selected' : '') + '>' + esc(bodyLbl(e)) + '</option>'; }).join('') + '</select></label>'
    + '<label class="ti-l">Trim<select data-td-f="trim"' + (trims.length ? '' : ' disabled') + '>' + (trims.length ? '<option value="">Not set</option>' + trims.map(function(t){ return '<option' + (d.trim === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') : '<option>Not offered on this body</option>') + '</select></label></div>'
    + '<p class="td-fine">' + (p ? esc(p.body) + '. ' : '') + 'The picture shows the body; paint, trim, axles and accessories are representative. Your own photo comes first.</p>'
    + '<button type="button" class="td-lnk" data-td="cat">Explore the 52-truck catalog</button></div>'
    + '<div class="td-ph">'
    + '<div class="td-pc"><div class="td-pl"><b>Vehicle photo</b><span>from the side</span></div><div class="td-pv' + (d.side ? ' own' : '') + '" data-td-drop="side" tabindex="0" aria-label="Vehicle photo — drop a picture here">' + (sideSrc ? '<img src="' + esc(sideSrc) + '" alt="">' : '<span class="td-e">' + TRK_SIL + '</span>') + '<i class="td-tag">' + (d.side ? 'YOUR PHOTO' : show ? 'BODY' : 'NONE') + '</i></div>'
    + '<div class="td-pb"><button type="button" class="px-btn sm" data-td="pick" data-k="side">' + TRK_CAM + 'Choose photo</button>' + (d.side ? '<button type="button" class="px-btn sm ghost" data-td="clear" data-k="side">Remove</button>' : '') + '</div><p class="td-fine">In the RO’s header and every list. Drag a picture here or choose a file.</p></div>'
    + '<div class="td-pc"><div class="td-pl"><b>Location photo</b><span>from above · optional</span></div><div class="td-pv top' + (d.top ? ' own' : '') + '" data-td-drop="top" tabindex="0" aria-label="Location photo — drop a picture here">' + (topSrc ? '<img src="' + esc(topSrc) + '" alt="">' : '<span class="td-e">—</span>') + '<i class="td-tag">' + (d.top ? 'YOUR PHOTO' : topSrc ? 'BODY' : 'NONE') + '</i></div>'
    + '<div class="td-pb"><button type="button" class="px-btn sm" data-td="pick" data-k="top">' + TRK_CAM + 'Choose photo</button>' + (d.top ? '<button type="button" class="px-btn sm ghost" data-td="clear" data-k="top">Remove</button>' : '') + '</div><p class="td-fine">The truck in its bay and on the yard.</p></div>'
    + '</div></div>'
    + '<div class="td-f"><span class="td-msg' + (TD.err ? ' err' : TD.ok ? ' ok' : '') + '" role="status">' + esc(TD.msg || (dirty ? 'Not saved yet — nothing changes until you save.' : 'Nothing changed yet.')) + '</span>'
    + '<button type="button" class="px-btn sm ghost" data-td="close">Cancel</button>'
    + '<button type="button" class="px-btn sm pri td-save' + (TD.ok ? ' is-ok' : '') + '" data-td="save"' + (TD.busy ? ' aria-busy="true" disabled' : (!dirty && !TD.err && !TD.ok ? ' disabled' : '')) + '>' + (TD.busy ? '<i class="td-spin"></i>Saving…' : TD.ok ? '✓ Saved' : TD.err ? 'Retry save' : 'Save truck') + '</button></div></div>';
  var w = document.getElementById("trk-dlg");
  if(w && w.firstChild && !first && trkDlgDraw.part){ trkDlgDraw.part = false; var tmp = document.createElement("div"); tmp.innerHTML = h;
    [".ti-eb0", ".td-match", ".td-ph", ".td-f"].forEach(function(sel){ var a = w.querySelector(sel), b = tmp.querySelector(sel); if(a && b) a.replaceWith(b); });
    var yi = w.querySelector('[data-td-f="year"]'), yn = tmp.querySelector('[data-td-f="year"]'); if(yi && yn) yi.placeholder = yn.placeholder;
    return; }
  var keep = w && document.activeElement && w.contains(document.activeElement) ? document.activeElement.getAttribute("data-td-f") : null, pos = keep && document.activeElement.selectionStart;
  if(!w){ w = document.createElement("div"); w.id = "trk-dlg"; w.className = "ti-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  if(keep){ var f = w.querySelector('[data-td-f="' + keep + '"]'); if(f){ f.focus(); try{ if(pos != null) f.setSelectionRange(pos, pos); }catch(e){} } }
  else if(first){ var y = w.querySelector('[data-td-f="year"]'); if(y) try{ y.focus({ preventScroll: true }); }catch(e){} }
}
function trkDlgFile(k, file){ if(!file || !TD) return; trkShrink(file, function(src, cut){ if(!TD) return; TD.d[k] = src; if(k === "side") TD.d.cut = cut; TD.ok = false; TD.err = false; TD.msg = ""; trkDlgDraw(); }, k === "top" ? 320 : 560); }
/* save, then wait for the save to land: the folder, or this browser when there's no folder */
function trkSaveReceipt(){ return new Promise(function(res, rej){ var t0 = Date.now();
  (function look(){ var s = typeof syncStatus !== "undefined" ? syncStatus : "local";
    if(s === "error") return rej(new Error("Saved on this computer, but the shop folder didn’t take it. Retry when the folder is back."));
    if(s !== "pending") return res(s === "saved" ? "Saved to the shop folder." : "Saved on this computer.");
    if(Date.now() - t0 > 15000) return rej(new Error("The save is taking longer than it should — your changes are kept. Retry in a moment."));
    setTimeout(look, 80); })(); }); }
function trkDlgSave(){
  var ro = TD && getRO(TD.ro); if(!ro || TD.busy) return; var d = TD.d;
  var y = String(d.year || "").trim(); if(y && !(/^\d{4}$/.test(y) && +y >= 1980 && +y <= new Date().getFullYear() + 2)){ TD.err = true; TD.msg = "The model year is four digits, like 2021."; trkDlgDraw(); return; }
  TD.busy = true; TD.err = false; TD.ok = false; TD.msg = "Saving to RO " + (ro.roNumber || "") + "…"; trkDlgDraw();
  if(JSON.stringify(d) !== TD.base){ pushUndo("truck & photos");
    if(y) ro.year = +y; else delete ro.year;
    ro.model = String(d.model || "").trim();
    if(d.body) ro.trkBody = d.body; else delete ro.trkBody;
    if(d.trim) ro.trkTrim = d.trim; else delete ro.trkTrim;
    if(d.side || d.top){ ro.trkOwn = { side: d.side || "", top: d.top || "", cut: d.cut || 0, at: nowIso(), by: (typeof punchByName === "function" && punchByName()) || "" }; if(d.side) delete ro.trkUse; } else delete ro.trkOwn;
    try{ audit("truck", (typeof roLabel === "function" ? roLabel(ro) : ro.roNumber) + ": truck & photos — " + trkLabel(ro), ro); }catch(e){}
    scheduleSave(true); TD.base = JSON.stringify(d); }
  var t0 = Date.now();
  trkSaveReceipt().then(function(m){ setTimeout(function(){ if(!TD) return; TD.busy = false; TD.ok = true; TD.msg = m; trkDlgDraw();
      try{ render(); }catch(e){} try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){}
      setTimeout(function(){ if(TD && TD.ok){ trkDlgClose(); pushToast("Truck saved on " + (ro.roNumber || "the RO") + ".", true); } }, 900); }, Math.max(0, 420 - (Date.now() - t0))); },
    function(e){ if(!TD) return; TD.busy = false; TD.err = true; TD.msg = e.message; trkDlgDraw(); });
}
(function(){
  document.addEventListener("click", function(ev){
    if(!TD) return; var w = document.getElementById("trk-dlg"); if(!w || !w.contains(ev.target)) return;
    if(ev.target === w){ trkDlgClose(); return; }
    var t = ev.target.closest("[data-td]"); if(!t) return; var k = t.getAttribute("data-td");
    if(k === "close") trkDlgClose();
    else if(k === "save") trkDlgSave();
    else if(k === "confirm"){ var dr = trkDraftRo(getRO(TD.ro), TD.d), M = trkMatch(dr); if(M.entry) TD.d.body = M.entry.id; TD.ok = false; TD.msg = ""; trkDlgDraw(); }
    else if(k === "cat") trkCatOpen(function(e){ if(!TD) return; var p = VT_BY[e.vt]; TD.d.body = e.id; if(!trkFamily(TD.d.model) || trkFamily(TD.d.model) !== vtFam(p) || trkCode(TD.d.model) === trkFamily(TD.d.model)) TD.d.model = e.model; var yy = +TD.d.year; if(yy && (yy < p.from || yy > (p.to >= 2026 ? 9999 : p.to))) TD.d.year = ""; TD.ok = false; TD.msg = ""; trkDlgDraw(); }, t);
    else if(k === "pick"){ var kk = t.getAttribute("data-k"); if(!TRK_IN){ TRK_IN = document.createElement("input"); TRK_IN.type = "file"; TRK_IN.accept = "image/*"; TRK_IN.style.display = "none"; document.body.appendChild(TRK_IN); } TRK_IN.value = ""; TRK_IN.onchange = function(){ trkDlgFile(kk, TRK_IN.files && TRK_IN.files[0]); }; TRK_IN.click(); }
    else if(k === "clear"){ TD.d[t.getAttribute("data-k")] = ""; if(t.getAttribute("data-k") === "side") TD.d.cut = 0; TD.ok = false; TD.msg = ""; trkDlgDraw(); }
  });
  document.addEventListener("input", function(ev){ if(!TD) return; var t = ev.target, f = t && t.getAttribute && t.getAttribute("data-td-f"); if(!f || !t.closest("#trk-dlg")) return;
    if(f === "year"){ var v = String(t.value || "").replace(/\D/g, "").slice(0, 4); if(v !== t.value) t.value = v; TD.d.year = v; }
    else if(f === "model"){ TD.d.model = t.value; if(TD.d.body){ var e = trkEntry(TD.d.body), pf = e && (e.vt ? vtFam(VT_BY[e.vt]) : trkFamily(e.model)); if(pf && trkFamily(t.value) && pf !== trkFamily(t.value)) TD.d.body = ""; } TD.d.trim = ""; }
    else return; TD.ok = false; TD.err = false; TD.msg = ""; trkDlgDraw.part = true; trkDlgDraw(); });
  document.addEventListener("change", function(ev){ if(!TD) return; var t = ev.target, f = t && t.getAttribute && t.getAttribute("data-td-f"); if(!f || !t.closest("#trk-dlg")) return;
    if(f === "body"){ TD.d.body = t.value; TD.d.trim = ""; } else if(f === "trim") TD.d.trim = t.value; else return; TD.ok = false; TD.err = false; TD.msg = ""; trkDlgDraw(); });
  ["dragover", "dragleave", "drop"].forEach(function(n){ document.addEventListener(n, function(ev){ if(!TD) return; var z = ev.target.closest && ev.target.closest("[data-td-drop]"); if(!z) return; ev.preventDefault();
    if(n === "dragover") z.classList.add("drag"); else z.classList.remove("drag");
    if(n === "drop"){ var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if(f && /^image\//.test(f.type)) trkDlgFile(z.getAttribute("data-td-drop"), f); else pushToast("Drop a picture file."); } }); });
  window.addEventListener("keydown", function(ev){
    if(!TD || TC) return; var w = document.getElementById("trk-dlg"); if(!w) return;
    if(ev.key === "Escape"){ ev.preventDefault(); ev.stopPropagation(); trkDlgClose(); return; }
    if(ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); ev.stopPropagation(); trkDlgSave(); return; }
    var z = ev.target && ev.target.closest && ev.target.closest("[data-td-drop]"); if(z && (ev.key === "Enter" || ev.key === " ")){ ev.preventDefault(); var b = w.querySelector('[data-td="pick"][data-k="' + z.getAttribute("data-td-drop") + '"]'); if(b) b.click(); }
    if(ev.key === "Tab"){ var f = w.querySelectorAll("button:not(:disabled), input, select:not(:disabled), [tabindex='0']"); if(f.length){ var a = f[0], zz = f[f.length - 1]; if(ev.shiftKey && document.activeElement === a){ ev.preventDefault(); zz.focus(); } else if(!ev.shiftKey && document.activeElement === zz){ ev.preventDefault(); a.focus(); } } }
    ev.stopPropagation();   /* the page's own shortcuts stay quiet */
  }, true);
})();

/* ============================== The 52-truck catalog (Parsec 10) ==============================
   A truck for its time: every body ChatGPT drew, by year. From Truck & photos it picks the body; from Your data it shows. */
var TC = null;   /* { pick: fn|null, q, fam, view, sel, back } */
function trkCatOpen(pick, back){ TC = { pick: pick || null, q: "", fam: "All", view: "s", sel: null, back: back || document.activeElement }; trkCatDraw(true); }
function trkCatClose(){ var w = document.getElementById("trk-cat"); if(w) w.remove(); var b = TC && TC.back; TC = null; if(!TD && !TI) document.documentElement.classList.remove("ti-open"); try{ if(b && b.isConnected) b.focus({ preventScroll: true }); }catch(e){} }
function trkCatDraw(first){
  var q = TC.q.trim().toLowerCase(), yr = /^\d{4}$/.test(q) ? +q : 0;
  var L = VT_P.filter(function(p){ if(TC.fam !== "All" && p.family.split(" ")[0] !== TC.fam) return false; if(!q) return true; if(yr) return yr >= p.from && yr <= (p.to >= 2026 ? 9999 : p.to);
    var t = (p.label + " " + p.family + " " + p.cab + " " + p.body + " " + vtModelOf(p)).toLowerCase(); return q.split(/\s+/).every(function(w){ return t.indexOf(w) > -1 || t.replace(/\s+/g, "").indexOf(w) > -1; }); });
  var fams = ["All", "VNL", "VNR", "VNX", "VHD", "VAH", "VNM", "VT", "VN"];
  var src = function(p, k){ var e = trkEntry("vt-" + p.id) || VT_SEED.filter(function(x){ return x.vt === p.id; })[0]; return trkSrc(e, k === "t" ? "top" : "src"); };
  var sel = TC.sel ? VT_BY[TC.sel] : null;
  var h = '<div class="td tc" role="dialog" aria-modal="true" aria-labelledby="tc-h" tabindex="-1">'
    + '<div class="ti-h"><div class="ti-ht"><div class="ti-eb0">Volvo Trucks North America · 1997 to today</div><h2 id="tc-h">A truck for its time.</h2><div class="ti-sub">' + VT_P.length + ' bodies, each from the side and from above.' + (TC.pick ? ' Pick the one that matches the truck.' : '') + '</div></div>'
    + '<button type="button" class="ti-x" data-tc="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="tc-tools"><input data-tc-q value="' + esc(TC.q) + '" placeholder="A year, model or cab — try 2016 or 860" aria-label="Find a body" autocomplete="off">'
    + '<div class="tc-seg" role="group" aria-label="Family">' + fams.map(function(f){ return '<button type="button" data-tc="fam" data-v="' + f + '" aria-pressed="' + (TC.fam === f) + '">' + f + '</button>'; }).join('') + '</div>'
    + '<div class="tc-seg" role="group" aria-label="View"><button type="button" data-tc="view" data-v="s" aria-pressed="' + (TC.view === "s") + '">Side</button><button type="button" data-tc="view" data-v="t" aria-pressed="' + (TC.view === "t") + '">Top</button></div><span class="tc-n">' + L.length + ' of ' + VT_P.length + '</span></div>'
    + (sel ? '<div class="tc-d"><span class="tc-ds"><img src="' + esc(src(sel, "s")) + '" alt=""></span><span class="tc-dt"><img src="' + esc(src(sel, "t")) + '" alt=""></span><div class="tc-dx"><span class="tc-k">' + esc(sel.family + " · " + vtYears(sel)) + '</span><b>' + esc(sel.label) + '</b><p>' + esc(sel.body) + '</p><div class="tc-chips">' + (sel.review ? '<span class="td-pill warn">Check against truck</span>' : '<span class="td-pill good">Matches by year</span>') + vtTrims(sel).map(function(t){ return '<span class="td-pill">' + esc(t) + '</span>'; }).join('') + '</div>' + (TC.pick ? '<button type="button" class="px-btn sm pri" data-tc="use" data-id="' + esc(sel.id) + '">Use this body</button>' : '') + '</div></div>' : '')
    + '<div class="tc-g">' + (L.length ? L.map(function(p){ return '<button type="button" class="tc-c' + (TC.sel === p.id ? ' on' : '') + '" data-tc="sel" data-id="' + esc(p.id) + '"><span class="tc-im' + (TC.view === "t" ? ' t' : '') + '"><img src="' + esc(src(p, TC.view)) + '" alt="" loading="lazy"></span><b>' + esc(p.label) + '</b><small>' + esc(vtYears(p)) + '</small>' + (p.review ? '<em>Check against truck</em>' : '') + '</button>'; }).join('') : '<p class="ti-empty">Nothing for that — try a year between 1997 and today.</p>') + '</div></div>';
  var w = document.getElementById("trk-cat"), hadQ = w && document.activeElement && document.activeElement.hasAttribute && document.activeElement.hasAttribute("data-tc-q"), sc = w && w.querySelector(".tc-g") ? w.querySelector(".tc-g").scrollTop : 0;
  if(!w){ w = document.createElement("div"); w.id = "trk-cat"; w.className = "ti-wrap tc-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  var g = w.querySelector(".tc-g"); if(g) g.scrollTop = sc;
  if(first || hadQ){ var i = w.querySelector("[data-tc-q]"); if(i){ i.focus({ preventScroll: true }); try{ i.setSelectionRange(i.value.length, i.value.length); }catch(e){} } }
}
(function(){
  document.addEventListener("click", function(ev){
    if(!TC) return; var w = document.getElementById("trk-cat"); if(!w || !w.contains(ev.target)) return;
    ev.stopPropagation(); if(ev.target === w){ trkCatClose(); return; }
    var t = ev.target.closest("[data-tc]"); if(!t) return; var k = t.getAttribute("data-tc");
    if(k === "close") trkCatClose();
    else if(k === "fam"){ TC.fam = t.getAttribute("data-v"); trkCatDraw(); }
    else if(k === "view"){ TC.view = t.getAttribute("data-v"); trkCatDraw(); }
    else if(k === "sel"){ var id = t.getAttribute("data-id"); if(TC.pick && TC.sel === id){ var e = trkEntry("vt-" + id) || VT_SEED.filter(function(x){ return x.vt === id; })[0], fn = TC.pick; trkCatClose(); fn(e); return; } TC.sel = id; trkCatDraw(); var d = w.querySelector(".tc-d"); if(d && typeof pmAnimate === "function") pmAnimate(d, [{ opacity: .5, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 180); }
    else if(k === "use"){ var id2 = t.getAttribute("data-id"), e2 = trkEntry("vt-" + id2) || VT_SEED.filter(function(x){ return x.vt === id2; })[0], fn2 = TC.pick; trkCatClose(); if(fn2) fn2(e2); }
  }, true);
  document.addEventListener("input", function(ev){ if(!TC) return; var t = ev.target; if(!t || !t.hasAttribute || !t.hasAttribute("data-tc-q")) return; TC.q = t.value; trkCatDraw(); }, true);
  window.addEventListener("keydown", function(ev){ if(!TC) return; var w = document.getElementById("trk-cat"); if(!w) return;
    if(ev.key === "Escape"){ ev.preventDefault(); ev.stopPropagation(); trkCatClose(); return; }
    ev.stopPropagation(); }, true);
})();

/* ============================== Notes on the truck (Parsec 9.9) ==============================
   Put a note where the issue is: on the RO's truck picture, a numbered mark per observation —
   its type and what you see. Kept on the RO (ro.trkNotes); undo works. The marks show where on the
   truck, not a diagnosis; on a model picture they point at the area, not this exact unit. */
var TRK_KINDS = ["Inspection", "Damage", "Leak", "Wear", "Missing part", "Customer concern"];
var TI = null;   /* the open notes window: { ro, sel, draft, placing, moving, ros } */
function trkNotesOf(ro){ return ro && Array.isArray(ro.trkNotes) ? ro.trkNotes : []; }
function trkPicKey(P){ return P.kind === "model" ? "m:" + P.entry.id : P.kind === "photo" ? "p:" + P.file.id : "none"; }
function trkWhen(iso){ try{ var d = new Date(iso); return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }catch(e){ return ""; } }
function trkInspOpen(ro, id){ if(!ro) return; TI = { ro: ro.id, sel: id || null, draft: null, placing: false, moving: null, ros: STATE.ros }; trkInspDraw(); }
function trkInspClose(){ var el = document.getElementById("trk-insp"); if(el) el.remove(); TI = null; document.documentElement.classList.remove("ti-open"); try{ if(typeof JC !== "undefined" && JC.rerender) JC.rerender(); }catch(e){} }
function trkInspDraw(focusText){
  var ro = TI && getRO(TI.ro); if(!ro){ trkInspClose(); return; }
  var P = trkPick(ro), key = trkPicKey(P), N = trkNotesOf(ro), I = trkInfo(ro);
  var cur = TI.draft || N.filter(function(n){ return n.id === TI.sel; })[0] || null, num = cur ? (TI.draft ? N.length + 1 : N.indexOf(cur) + 1) : 0;
  var pic = P.kind === "model" ? '<img src="' + esc(P.src) + '" alt="' + esc(trkLabel(ro)) + '" draggable="false">'
    : P.kind === "photo" ? '<img' + (P.src ? ' src="' + esc(P.src) + '"' : '') + ' data-ti-ph="1" alt="Check-in photo" draggable="false">' : '<span class="ti-sil">' + TRK_SIL + '</span>';
  var marks = N.map(function(n, i){ return '<button type="button" class="ti-m' + (n.pic && n.pic !== key ? ' other' : '') + (cur === n ? ' sel' : '') + '" style="left:' + (n.x * 100).toFixed(2) + '%;top:' + (n.y * 100).toFixed(2) + '%" data-ti="sel" data-id="' + esc(n.id) + '" title="' + esc(n.kind + (n.text ? ' — ' + n.text : '') + (n.pic && n.pic !== key ? ' (placed on another picture)' : '')) + '">' + (i + 1) + '</button>'; }).join('')
    + (TI.draft ? '<span class="ti-m sel draft" style="left:' + (TI.draft.x * 100).toFixed(2) + '%;top:' + (TI.draft.y * 100).toFixed(2) + '%">' + num + '</span>' : '');
  var ed = cur ? '<div class="ti-ed"><div class="ti-eh"><span class="ti-n">' + num + '</span><b>' + (TI.draft ? 'New note' : 'Note ' + num) + '</b>' + (TI.draft ? '' : '<small>' + esc((cur.by ? cur.by + ' · ' : '') + trkWhen(cur.at)) + '</small>') + '</div>'
      + '<label class="ti-l">Type<select data-ti-f="kind">' + TRK_KINDS.map(function(k){ return '<option' + (k === cur.kind ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>'
      + '<label class="ti-l">What you see<textarea data-ti-f="text" rows="4" placeholder="Like: front bumper cracked on the passenger side">' + esc(cur.text || '') + '</textarea></label>'
      + '<div class="ti-eb"><button type="button" class="px-btn sm pri" data-ti="save">Save note</button>' + (TI.draft ? '<button type="button" class="px-btn sm ghost" data-ti="cancel">Cancel</button>' : '<button type="button" class="px-btn sm" data-ti="move">Move</button><button type="button" class="px-btn sm ghost ti-del" data-ti="del">Remove</button>') + '</div></div>' : '';
  var list = N.length ? '<div class="ti-list">' + N.map(function(n, i){ return '<button type="button" class="ti-li' + (cur === n ? ' sel' : '') + '" data-ti="sel" data-id="' + esc(n.id) + '"><span class="ti-n">' + (i + 1) + '</span><span class="ti-lt"><b>' + esc(n.kind) + '</b><small>' + esc(n.text || '') + '</small></span></button>'; }).join('') + '</div>'
    : '<p class="ti-empty">No notes yet. Press <b>Add note</b>, then click the truck where the issue is.</p>';
  var bar = TI.placing ? '<span class="ti-hint">Click the truck where it is — Enter puts it in the middle, Esc cancels</span>' : '<span class="ti-hint">' + (N.length ? N.length + ' note' + (N.length === 1 ? '' : 's') + ' · click a mark to open it' : 'Notes on this truck') + '</span><button type="button" class="px-btn sm" data-ti="add">+ Add note</button>';
  var h = '<div class="ti" role="dialog" aria-modal="true" aria-label="Notes on the truck" tabindex="-1">'
    + '<div class="ti-h"><div class="ti-ht"><div class="ti-eb0"><span class="mono">' + esc(ro.roNumber || '') + '</span> · Notes on the truck</div><h2>' + esc(ro.customerName || 'Customer') + '</h2><div class="ti-sub">' + esc(trkLabel(ro) + (ro.unitNumber ? ' · Unit ' + ro.unitNumber : '')) + '</div></div>'
    + '<button type="button" class="ti-x" data-ti="close" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    + '<div class="ti-b"><div class="ti-st"><div class="ti-bar">' + bar + '</div><div class="ti-stage' + (TI.placing ? ' placing' : '') + '"><div class="ti-pic" data-ti="pic">' + pic + marks + '</div></div>'
    + '<p class="ti-fine">' + (P.kind === "model" ? 'The marks show where on the truck — this is the model picture, not this exact unit.' : P.kind === "photo" ? 'On this truck’s check-in photo.' : 'No picture for this model yet — the marks go on the outline.') + '</p></div>'
    + '<div class="ti-side">' + ed + list + '</div></div></div>';
  var w = document.getElementById("trk-insp");
  if(!w){ w = document.createElement("div"); w.id = "trk-insp"; w.className = "ti-wrap"; document.body.appendChild(w); }
  w.innerHTML = h; document.documentElement.classList.add("ti-open");
  if(P.kind === "photo" && !P.src) trkLoadPhoto(P.file, ro.id, function(u){ var im = w.querySelector("img[data-ti-ph]"); if(im && u) im.src = u; });
  if(focusText){ var ta = w.querySelector('[data-ti-f="text"]'); if(ta) try{ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }catch(e){} }
  else if(TI.placing){ var st = w.querySelector(".ti-pic"); if(st){ st.tabIndex = -1; try{ st.focus({ preventScroll: true }); }catch(e){} } }
  else { var dl = w.querySelector(".ti"); if(dl && !w.contains(document.activeElement)) try{ dl.focus({ preventScroll: true }); }catch(e){} }
}
function trkInspPlace(x, y){
  var ro = getRO(TI.ro); if(!ro) return; x = Math.max(0.02, Math.min(0.98, x)); y = Math.max(0.03, Math.min(0.97, y));
  if(TI.moving){ var n = trkNotesOf(ro).filter(function(q){ return q.id === TI.moving; })[0]; if(n){ pushUndo("truck note"); n.x = x; n.y = y; n.pic = trkPicKey(trkPick(ro)); scheduleSave(true); TI.ros = STATE.ros; } TI.sel = TI.moving; TI.moving = null; TI.placing = false; trkInspDraw(); return; }
  TI.draft = { x: x, y: y, kind: "Inspection", text: "" }; TI.sel = null; TI.placing = false; trkInspDraw(true);
}
function trkInspSave(){
  var ro = getRO(TI.ro), w = document.getElementById("trk-insp"); if(!ro || !w) return;
  var kind = (w.querySelector('[data-ti-f="kind"]') || {}).value || "Inspection", text = String((w.querySelector('[data-ti-f="text"]') || {}).value || "").trim().slice(0, 600);
  if(!text){ pushToast("Write what you see first."); var ta = w.querySelector('[data-ti-f="text"]'); if(ta) ta.focus(); return; }
  pushUndo("truck note");
  if(!Array.isArray(ro.trkNotes)) ro.trkNotes = [];
  if(TI.draft){ var n = { id: uid("tn"), x: +TI.draft.x.toFixed(4), y: +TI.draft.y.toFixed(4), kind: kind, text: text, at: nowIso(), by: (typeof punchByName === "function" && punchByName()) || "", pic: trkPicKey(trkPick(ro)) }; ro.trkNotes.push(n); TI.draft = null; TI.sel = n.id; }
  else { var e = ro.trkNotes.filter(function(q){ return q.id === TI.sel; })[0]; if(e){ e.kind = kind; e.text = text; e.edited = nowIso(); } }
  scheduleSave(true); TI.ros = STATE.ros; trkInspDraw(); pushToast("Note saved on the truck.");
}
function trkInspDel(){
  var ro = getRO(TI.ro); if(!ro) return; pushUndo("truck note");
  ro.trkNotes = trkNotesOf(ro).filter(function(q){ return q.id !== TI.sel; }); TI.sel = null; scheduleSave(true); TI.ros = STATE.ros; trkInspDraw(); pushToast("Note removed.", true);
}
(function(){
  document.addEventListener("click", function(ev){
    if(!TI) return; var w = document.getElementById("trk-insp"); if(!w || !w.contains(ev.target)) return;
    var t = ev.target.closest("[data-ti]"); if(ev.target === w){ trkInspClose(); return; }
    if(!t) return; var k = t.getAttribute("data-ti");
    if(k === "pic"){ if(!TI.placing) return; var r = t.getBoundingClientRect(); if(!r.width) return; trkInspPlace((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height); return; }
    if(k === "close") trkInspClose();
    else if(k === "add"){ TI.placing = true; TI.moving = null; TI.draft = null; TI.sel = null; trkInspDraw(); }
    else if(k === "move"){ TI.placing = true; TI.moving = TI.sel; trkInspDraw(); }
    else if(k === "sel"){ if(TI.placing && !TI.moving) return; TI.draft = null; TI.placing = false; TI.moving = null; TI.sel = t.getAttribute("data-id"); trkInspDraw(); }
    else if(k === "save") trkInspSave();
    else if(k === "cancel"){ TI.draft = null; trkInspDraw(); }
    else if(k === "del") trkInspDel();
  });
  window.addEventListener("keydown", function(ev){
    if(!TI) return; var w = document.getElementById("trk-insp"); if(!w) return;
    var inField = ev.target && ev.target.closest && ev.target.closest("#trk-insp input, #trk-insp textarea, #trk-insp select");
    if(ev.key === "Escape"){ ev.preventDefault(); ev.stopPropagation(); if(TI.placing){ TI.placing = false; TI.moving = null; trkInspDraw(); } else if(TI.draft){ TI.draft = null; trkInspDraw(); } else trkInspClose(); return; }
    if(TI.placing && ev.key === "Enter"){ ev.preventDefault(); ev.stopPropagation(); trkInspPlace(0.5, 0.5); return; }
    if(inField && ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); ev.stopPropagation(); trkInspSave(); return; }
    if(ev.key === "Tab"){ var f = w.querySelectorAll("button, select, textarea, [tabindex]"); if(f.length){ var a = f[0], z = f[f.length - 1]; if(ev.shiftKey && document.activeElement === a){ ev.preventDefault(); z.focus(); } else if(!ev.shiftKey && document.activeElement === z){ ev.preventDefault(); a.focus(); } } }
    if(!inField && ev.key === " " && !(ev.target && ev.target.closest && ev.target.closest("#trk-insp button"))) ev.preventDefault();
    ev.stopPropagation();   /* the page's own shortcuts (Space for the clock, S, T …) stay quiet while the notes are open */
  }, true);
})();
/* the banner's own marks and the way in */
function trkBannerNotes(pic, ro, P){
  var N = trkNotesOf(ro), key = trkPicKey(P), mine = N.filter(function(n){ return n.pic === key; });
  if(P.kind === "model") mine.forEach(function(n){ var d = document.createElement("span"); d.className = "px-trk__mk"; d.style.left = (n.x * 100) + "%"; d.style.top = (n.y * 100) + "%"; d.textContent = N.indexOf(n) + 1; d.title = n.kind + " — " + (n.text || ""); pic.appendChild(d); });
  if(N.length){ var b = document.createElement("button"); b.type = "button"; b.className = "px-trk__nb"; b.textContent = N.length + " note" + (N.length === 1 ? "" : "s") + " on the truck"; b.addEventListener("click", function(ev){ ev.stopPropagation(); trkInspOpen(ro); }); pic.appendChild(b); }
  var img = pic.querySelector("img, svg"); if(img){ img.style.cursor = "pointer"; img.addEventListener("click", function(){ trkInspOpen(ro); }); }
}
