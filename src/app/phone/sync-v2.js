/* Parsec · phone · sync-v2.js
   Phone sync v2 (Parsec Mobile 3): spare codes, tasks per technician, what is pending for the phone (TQP).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   mobTech mobTaskOf mobGroupOf TQP MOB_TECH MOB_PEND (3 functions, 3 constants)
   state      fmNote mobTickIds punches ros shiftEnd
   uses       access/ clock/ data/ kit/ pages/ pages/fixes/ pages/inbox/ pages/triage/ pages/warranty/ ro/ ro-page/ shell/ state/
   at load    builds TQP (a closure) · 3× a delayed start
*/
/* ===== QR spare codes (shared by Parsec and Parsec Mobile) =====
   After every 6 codes comes one spare code built from those 6. If the camera misses any one of them,
   the spare fills it in, so a missed code no longer means waiting a whole loop. Phones or computers
   that don't know spare codes just skip them. Frame: TQP:sid:mode:group/6/total:chunkLen:lastLen:payload */
var TQP = (function(){
  var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", IX = {}, K = 6;
  for(var i = 0; i < A.length; i++) IX[A.charAt(i)] = i;
  var RX = /^TQ1:([a-z0-9]+):([rz]):(\d+)\/(\d+):(.*)$/, RP = /^TQP:([a-z0-9]+):([rz]):(\d+)\/(\d+)\/(\d+):(\d+):(\d+):(.*)$/;
  function add(frames){
    var n = frames.length; if(n < 3) return frames;
    var m0 = RX.exec(frames[0]), mz = RX.exec(frames[n - 1]); if(!m0 || !mz) return frames;
    var ch = m0[5].length, last = mz[5].length, out = [];
    for(var g = 0; g * K < n; g++){
      var grp = frames.slice(g * K, g * K + K), cs = [], L = 0;
      for(var q = 0; q < grp.length; q++){ var m = RX.exec(grp[q]); if(!m) return frames; cs.push(m[5]); if(m[5].length > L) L = m[5].length; }
      var p = "";
      for(var j = 0; j < L; j++){ var s = 0; for(q = 0; q < cs.length; q++) if(j < cs[q].length) s += IX[cs[q].charAt(j)]; p += A.charAt(s % 65); }
      out = out.concat(grp);
      if(grp.length > 1) out.push("TQP:" + m0[1] + ":" + m0[2] + ":" + g + "/" + K + "/" + n + ":" + ch + ":" + last + ":" + p);
    }
    return out;
  }
  /* feed it every code the camera reads; it calls progress(got, total) and, once all are in, done(mode, text) */
  function decoder(progress, done){
    var sid = null, total = 0, mode = "r", parts = {}, par = {}, got = 0, fin = false;
    function fill(g){
      var P = par[g]; if(!P) return false;
      var a = g * P.k + 1, b = Math.min(total, a + P.k - 1), miss = 0, mi = 0;
      for(var i = a; i <= b; i++) if(parts[i] === undefined){ miss++; mi = i; }
      if(miss !== 1) return false;
      var len = mi === total ? P.last : P.ch, s = "";
      for(var j = 0; j < len; j++){
        var v = IX[P.p.charAt(j)]; if(v === undefined) return false;
        for(i = a; i <= b; i++) if(i !== mi){ var c = parts[i]; if(j < c.length) v -= IX[c.charAt(j)]; }
        s += A.charAt(((v % 65) + 65) % 65);
      }
      parts[mi] = s; got++; return true;
    }
    return function take(d){
      if(fin) return;
      var m = RX.exec(d), q = m ? null : RP.exec(d); if(!m && !q) return;
      var id = m ? m[1] : q[1], tot = m ? +m[4] : +q[5];
      if(id !== sid){ sid = id; total = tot; mode = m ? m[2] : q[2]; parts = {}; par = {}; got = 0; }
      if(m){ if(parts[m[3]] !== undefined) return; parts[m[3]] = m[5]; got++; fill(Math.floor((+m[3] - 1) / K)); }
      else { if(par[q[3]]) return; par[q[3]] = { k: +q[4], ch: +q[6], last: +q[7], p: q[8] }; if(!fill(+q[3])) return; }
      if(progress) progress(got, total);
      if(got === total){ fin = true; var s = ""; for(var i = 1; i <= total; i++) s += parts[i]; done(mode, s); }
    };
  }
  return { add: add, decoder: decoder, K: K };
})();

/* ============================== Phone sync v2 — Parsec Mobile 3 ==============================
   Still QR codes, no network. Send to phone now carries one technician's world: their ROs and operations
   (with the foreman's order, paused and parts-in marks), today's clock and punches, their Inbox, the foreman's
   note and the Fixes that match their jobs. Get from phone now also takes the day clock (in / out, lunch,
   end of day), clock time that was still running at the last sync (it grows on the next one), Staged and
   Picked up, photos (shrunk on the phone) and Inbox items marked done. Older phone versions still work. */
var MOB_TECH = "", MOB_PEND = {};
function mobTech(){
  var T = (typeof rtTechs === "function" ? rtTechs() : []) || [];
  if(MOB_TECH && T.some(function(t){ return techSame(t, MOB_TECH); })) return MOB_TECH;
  var m = PG.me(); if(m.tech) return m.tech;
  return T[0] || "";
}
function mobTaskOf(g){ return { dash: "dashpic", pics: "pics", dtc: "dtc", other: "report" }[g] || "pics"; }
function mobGroupOf(task){ return { dashpic: "dash", pics: "pics", dtc: "dtc" }[task] || "other"; }
(function(){
  var strip = function(s){ return String(s == null ? "" : s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(); };
  var today = function(){ return todayStr(); };
  function minePred(me){
    var since = Date.now() - 7 * 86400000;
    return function(ro){
      if(techSame(ro.assignedTech || "", me)) return true;
      if(ro.route && ro.route.to === "tech" && techSame(ro.route.who || "", me)) return true;
      return STATE.punches.some(function(p){ return p.roId === ro.id && techSame(punchWho(p), me) && new Date(p.start).getTime() > since; });
    };
  }
  function opExtras(ro, op, me){
    var ps = opPunches(op.id), last = ps.filter(function(p){ return p.stop; }).slice(-1)[0], st0 = opStatus(op), stn = typeof st0 === "string" ? st0 : st0.status, sub = typeof st0 === "string" ? "" : (st0.sub || "");
    var b0 = 0; try{ b0 = opCalc(op).burntHrs || 0; }catch(e){}
    var x = { pz: "", bk: sub === "Ready – parts in" ? 1 : 0, tg: [], why: "", dn: "", sub: sub };
    if(!/^(Complete|Waiting|Declined)/.test(stn) && last && b0 > 0.01 && !/^Complete/.test(last.stopReason || "")) x.pz = last.stop;
    if(/^Complete/.test(stn)){ var dp = ps.filter(function(p){ return p.stop && /^Complete/.test(p.stopReason || ""); }).slice(-1)[0]; x.dn = dp ? dp.stop : (op.jobStatus && op.jobStatus.setAt) || (last && last.stop) || ""; }
    if(op.appr && op.appr.at && localDay(op.appr.at) === today()) x.tg.push(["ok", "Approved " + PG.clk(op.appr.at)]);
    if(opRealParts(op).some(function(p){ return p.status === "Staged"; })) x.tg.push(["pt", "Parts staged"]);
    if(ro.route && ro.route.to === "tech" && ro.route.note && techSame(ro.route.who || "", me)) x.why = (ro.route.by ? PG.first(ro.route.by) + ": " : "") + ro.route.note;
    return x;
  }
  function dayFor(me){
    var k = today();
    var sh = shiftList().filter(function(s){ return localDay(s.in) === k && s.by && techSame(s.by, me); })
      .map(function(s){ return [s.id, s.in, s.out || null, s.outReason || ""]; });
    var ps = STATE.punches.filter(function(p){ return localDay(p.start) === k && techSame(punchWho(p), me); }).map(function(p){
      var ro = getRO(p.roId); return [p.id, p.start, p.stop || null, ro ? (isShopPunch(p) ? "SHOP" : tgNum(ro)) : "?", isShopPunch(p) ? 1 : 0, p.opId]; });
    return { sh: sh, ps: ps };
  }
  function inboxFor(me){
    if(typeof IB === "undefined" || !IB.itemsFor) return [];
    var L = []; try{ L = IB.itemsFor(me) || []; }catch(e){ return []; }
    return L.filter(function(x){ return x.st !== "done" && x.st !== "snz"; }).slice(0, 25).map(function(x){
      return { key: x.key, from: strip(x.from), at: x.at || "", k: x.k || "", t: strip(x.t).slice(0, 220), b: strip(x.b).slice(0, 300), ro: x.ro || null, op: x.op || null,
        acts: (x.acts || []).slice(0, 2).map(function(a){ return [strip(a[0]).slice(0, 30), String(a[1] || "")]; }) };
    });
  }
  function fixesFor(me, roIds){
    if(typeof FX === "undefined" || !FX.build) return { mine: [], G: [] };
    var C; try{ FX.flush(); C = FX.build(); }catch(e){ return { mine: [], G: [] }; }
    var mine = (C.O || []).filter(function(o){ return roIds[o.roId]; }).map(function(o){ return { k: o.k, roId: o.roId, opId: o.opId }; });
    var keys = {}; mine.forEach(function(m){ keys[m.k] = 1; });
    var recent = Object.keys(C.E || {}).map(function(k){ var d = (C.E[k] || []).reduce(function(a, e){ return e.date > a ? e.date : a; }, ""); return [k, d]; })
      .sort(function(a, b){ return a[1] < b[1] ? 1 : -1; }).slice(0, 8).map(function(x){ return x[0]; });
    recent.forEach(function(k){ keys[k] = 1; });
    var G = Object.keys(keys).map(function(k){
      var E = (C.E[k] || []).slice().sort(function(a, b){ return (a.date || "") < (b.date || "") ? 1 : -1; });
      if(!E.length) return null;
      var wh = E.filter(function(e){ return e.h > 0; }), avg = wh.length ? wh.reduce(function(s, e){ return s + e.h; }, 0) / wh.length : 0;
      return { k: k, t: strip((C.T[k] || {}).t || E[0].fix || ""), n: E.length, ok: E.filter(function(e){ return e.out !== "cb"; }).length, avg: Math.round(avg * 10) / 10, q: E[0].q || 0,
        E: E.slice(0, 3).map(function(e){ return { by: e.tech || "", d: e.date || "", ro: e.ro || "", ca: strip(e.cause).slice(0, 300), fx: strip(e.fix).slice(0, 400), pt: (e.parts || []).slice(0, 6).map(function(p){ return [p[0], strip(p[1]).slice(0, 60), p[2]]; }), h: e.h || 0 }; }) };
    }).filter(Boolean);
    return { mine: mine, G: G };
  }
  setTimeout(function(){
    if(typeof mobBundle !== "function") return;
    var baseB = mobBundle;
    mobBundle = function(){
      var b = baseB(), me = mobTech(); if(!me) return b;
      var mine = minePred(me), keep = {};
      STATE.ros.forEach(function(ro){ if(ro.id !== SHOP_RO_ID && !roIsDone(ro) && mine(ro)) keep[ro.id] = 1; });
      b.ros = b.ros.filter(function(r){ return keep[r.id]; }).map(function(r){
        var ro = getRO(r.id); if(!ro) return r;
        r.tech = ro.assignedTech || ""; r.loc = ro.location || ""; r.fq = ro.fmQ || 0; r.model = ro.model || "";
        var ids = (ro.operations || []).map(function(o){ return o.id; });
        r.ops.forEach(function(o){ var op = (ro.operations || []).filter(function(x){ return x.id === o.id; })[0]; if(!op) return; Object.assign(o, opExtras(ro, op, me)); if(typeof opStory === "function"){ o.ca = opStory(op, "cause").slice(0, 400); o.fx = opStory(op, "fix").slice(0, 400); } });
        var att = [];
        (ro.bulletins || []).forEach(function(bl){ (bl.files || []).forEach(function(f){ var i = ids.indexOf(f.op); att.push({ n: f.name || f.fname || "file", z: f.size || 0, at: f.ts || "", op: i > -1 ? i + 1 : 0, g: mobGroupOf(bl.task) }); }); });
        (ro.attachments || []).forEach(function(a){ att.push({ n: a.name || "file", z: a.size || 0, at: a.addedAt || "", op: 0, g: "other" }); });
        r.att = att.slice(-60);
        return r;
      });
      var sf = staffForTech(me);
      b.v = 2; b.me = me; b.shiftEnd = (sf && sf.shiftEnd) || STATE.shiftEnd || "15:30";
      b.fm = STATE.fmNote && STATE.fmNote.d === today() && STATE.fmNote.text ? { by: STATE.fmNote.by || PG.person("Foreman") || "", text: strip(STATE.fmNote.text).slice(0, 400), at: STATE.fmNote.at || "" } : null;
      b.day = dayFor(me);
      b.ib = inboxFor(me);
      b.fx = fixesFor(me, keep);
      /* what came from the phone, with the time it ends — so the phone keeps a clock that grew after the last sync */
      var ver = STATE.punches.filter(function(p){ return p.fromPhone && p.stop; }).slice(-300).map(function(p){ return p.id + "@" + p.stop; })
        .concat(shiftList().filter(function(s){ return s.fromPhone && s.out; }).slice(-100).map(function(s){ return s.id + "@" + s.out; }));
      b.ack = (b.ack || []).concat(ver);
      return b;
    };
    if(typeof mobApply !== "function") return;
    var baseA = mobApply, MINE = { time: 1, pstat: 1, shift: 1, file: 1, ib: 1 };
    mobApply = function(b){
      if(!b || b.t !== "ph") return baseA(b);
      var ch = Array.isArray(b.ch) ? b.ch : [];
      var r = baseA(Object.assign({}, b, { ops: Array.isArray(b.ops) ? b.ops : [], ch: ch.filter(function(x){ return !(x && MINE[x.k]); }) }));
      if(!r || !r.ok) return r;
      var x = mobTake(ch.filter(function(c){ return c && MINE[c.k]; }), b.by || "");
      r.chg = (r.chg || 0) + x.n + x.files; r.files = x.files; r.shifts = x.shifts; r.clash = x.clash;
      /* say what came, in the shop's words (the old line only knew notes, parts and operation details) */
      var W = { time: "clock time", shift: "the day clock", note: "notes", part: "part requests", edit: "cause, correction or status", pstat: "part status", file: "photos", ib: "Inbox" }, seen = {}, words = [];
      ch.forEach(function(c){ if(c && W[c.k] && !seen[c.k]){ seen[c.k] = 1; words.push(W[c.k]); } });
      if(words.length) setTimeout(function(){ var m = document.querySelector(".psy-msg"); if(m) m.innerHTML = m.innerHTML.replace(" (notes, parts, operation details)", " (" + esc(words.join(", ")) + ")"); }, 0);
      return r;
    };
  }, 0);
  /* the phone's own kinds of change */
  function mobTake(L, by0){
    var out = { n: 0, files: 0, shifts: 0, clash: 0, closed: 0 };
    if(!L.length) return out;
    if(!Array.isArray(STATE.mobTickIds)) STATE.mobTickIds = [];
    var dn = {}; STATE.mobTickIds.forEach(function(id){ dn[id] = 1; });
    var undone = true, mark = function(id){ STATE.mobTickIds.push(id); dn[id] = 1; out.n++; };
    var undoOnce = function(){ if(undone){ pushUndo("changes from the phone"); undone = false; } };
    if(typeof syncAllBurnt === "function") syncAllBurnt();
    L.slice().sort(function(a, c){ return String(a.at || "").localeCompare(String(c.at || "")); }).forEach(function(x){
      if(typeof x.id !== "string" || !x.id) return;
      var who = x.by || by0 || "";
      if(x.k === "time"){
        var s = new Date(x.s), e = new Date(x.e); if(isNaN(s) || isNaN(e) || e <= s || e - s > 16 * 3600000) return;
        var ro = getRO(x.roId); if(!ro || ro.id === SHOP_RO_ID) return;
        if(roIsDone(ro)){ out.closed++; return; }   /* like before: no new time on a closed RO */
        var op = (ro.operations || []).filter(function(o){ return o.id === x.opId; })[0]; if(!op) return;
        var have = STATE.punches.filter(function(p){ return p.id === x.id; })[0];
        if(have){
          if(!have.fromPhone) return;
          if(!have.stop || new Date(have.stop) < e){ undoOnce(); have.stop = e.toISOString(); have.stopReason = x.open ? null : (x.sr || have.stopReason || null); mark(x.id + "@" + have.stop); }
          else if(!x.open && x.sr && have.stopReason !== x.sr){ undoOnce(); have.stopReason = x.sr; mark(x.id + "@" + have.stop + "#"); }
          return;
        }
        if(dn[x.id]) return;
        var clash = STATE.punches.some(function(p){ if(!techSame(punchWho(p), who)) return false; var a = new Date(p.start).getTime(), b2 = p.stop ? new Date(p.stop).getTime() : Date.now(); return s.getTime() < b2 && e.getTime() > a; });
        if(clash){ out.clash++; return; }
        undoOnce();
        STATE.punches.push({ id: x.id, roId: ro.id, opId: op.id, start: s.toISOString(), stop: e.toISOString(), startReason: START_REASONS.indexOf(x.r) > -1 ? x.r : "Repairing",
          stopReason: x.open ? null : (x.sr || null), notes: "", manual: true, fromPhone: true, burntCredited: true, by: who });
        mark(x.id); STATE.mobTickIds.push(x.id + "@" + e.toISOString());
      } else if(x.k === "shift"){
        var a0 = new Date(x.in), b0 = new Date(x.out || x.at || Date.now()); if(isNaN(a0) || isNaN(b0) || b0 <= a0 || b0 - a0 > 18 * 3600000) return;
        var sh = shiftList().filter(function(z){ return z.id === x.id; })[0];
        if(sh && !sh.fromPhone){
          /* clocked in on this computer, clocked out on the phone */
          if(sh.out){ mark(x.id + "@" + b0.toISOString()); return; }   /* already closed here — this computer's record stands */
          if(x.open || (sh.by && !techSame(sh.by, who))) return;
          undoOnce(); sh.out = b0.toISOString(); sh.outReason = x.why || ""; sh.outFrom = "phone"; mark(x.id + "@" + sh.out); out.shifts++; return;
        }
        if(sh){ if(new Date(sh.out) < b0 || (x.why && sh.outReason !== x.why)){ undoOnce(); sh.out = b0.toISOString(); sh.outReason = x.open ? "" : (x.why || ""); sh.phoneOpen = !!x.open; mark(x.id + "@" + sh.out); out.shifts++; } return; }
        var over = shiftList().some(function(z){ return z.by && techSame(z.by, who) && new Date(z.in) < b0 && (z.out ? new Date(z.out) : new Date()) > a0; });
        if(over){ out.clash++; return; }
        undoOnce();
        shiftList().push({ id: x.id, in: a0.toISOString(), out: b0.toISOString(), outReason: x.open ? "" : (x.why || ""), by: who, fromPhone: true, phoneOpen: !!x.open });
        mark(x.id); STATE.mobTickIds.push(x.id + "@" + b0.toISOString()); out.shifts++;
      } else if(x.k === "pstat"){
        if(dn[x.id]) return;
        var PST = ["Not Ordered", "Ordered", "Backordered", "Received", "Staged", "Picked up", "Installed"];
        if(PST.indexOf(x.st) < 0) return;
        var ro2 = getRO(x.roId); if(!ro2 || roIsDone(ro2)) return;
        var op2 = (ro2.operations || []).filter(function(o){ return o.id === x.opId; })[0]; if(!op2) return;
        var list = opRealParts(op2), d = String(x.d || "").trim().slice(0, 60), pn = String(x.pn || "").trim();
        var p = list.filter(function(q){ return String(q.partNumber || "").trim() === pn && String(q.description || "").trim().slice(0, 60) === d; })[0] || (typeof x.i === "number" ? list[x.i] : null);
        if(!p) return;
        undoOnce(); p.status = x.st; p.statusChangedAt = typeof x.at === "string" ? x.at : nowIso(); if(x.st === "Picked up" && who) p.pickedBy = who; mark(x.id);
      } else if(x.k === "file"){
        if(dn[x.id] || MOB_PEND[x.id]) return;
        var ro3 = getRO(x.roId); if(!ro3 || typeof JC === "undefined" || !JC.addFilesTo || typeof x.d !== "string") return;
        try{
          var bin = atob(x.d), u = new Uint8Array(bin.length); for(var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          var f = new File([u], String(x.n || "phone-photo.jpg").replace(/[\\\/:*?"<>|]+/g, "-").slice(0, 120), { type: x.ty || "image/jpeg" });
          var fid = x.id; MOB_PEND[fid] = 1; out.files++;
          /* the photo is stored a moment later; only then does the phone hear it can let go of it */
          JC.addFilesTo(ro3, mobTaskOf(x.g), [f], function(n){ delete MOB_PEND[fid];
            if(n){ if(!Array.isArray(STATE.mobTickIds)) STATE.mobTickIds = []; STATE.mobTickIds.push(fid); scheduleSave(true); }
            else pushToast("A photo from the phone couldn’t be stored in this browser — it stays on the phone; send again."); });
        }catch(err){ console.error(err); }
      } else if(x.k === "ib"){
        if(dn[x.id] || typeof IB === "undefined" || !IB.store || typeof x.key !== "string") return;
        var st = IB.store().st; st[x.key] = Object.assign({}, st[x.key] || {}, { done: true, how: String(x.act || "Done").slice(0, 30), at: x.at || nowIso(), by: who, phone: true });
        mark(x.id);
      }
    });
    if(STATE.mobTickIds.length > 1200) STATE.mobTickIds = STATE.mobTickIds.slice(-900);
    if(out.n){ if(typeof syncAllBurnt === "function") syncAllBurnt(); try{ IB.flush(); }catch(e){} scheduleSave(true); try{ render(); }catch(e){} if(typeof JC !== "undefined" && JC && JC.rerender){ try{ JC.rerender(); }catch(e){} } }
    var bits = [];
    if(out.files) bits.push(out.files + " photo" + (out.files === 1 ? "" : "s"));
    if(out.shifts) bits.push("the day clock");
    if(bits.length) pushToast("From the phone: " + bits.join(" and ") + ".");
    if(out.closed) pushToast(out.closed + " clock entr" + (out.closed === 1 ? "y" : "ies") + " from the phone " + (out.closed === 1 ? "is" : "are") + " on a closed RO and " + (out.closed === 1 ? "was" : "were") + " left out — add " + (out.closed === 1 ? "it" : "them") + " in the Time Log if " + (out.closed === 1 ? "it counts" : "they count") + ".");
    if(out.clash) pushToast(out.clash + " clock entr" + (out.clash === 1 ? "y" : "ies") + " from the phone overlap time already on this computer for that tech — fix " + (out.clash === 1 ? "it" : "them") + " in the Time Log.");
    return out;
  }
  /* spare codes both ways, and the webcam reads at full size (dense codes from a phone screen) */
  setTimeout(function(){
    if(typeof TQ === "undefined" || typeof TQP === "undefined" || !TQ.pack) return;
    var basePack = TQ.pack;
    TQ.pack = function(o){ return basePack(o).then(function(pk){ pk.data = pk.frames.length; pk.frames = TQP.add(pk.frames); return pk; }); };
    TQ.scanner = function(video, onProgress, onDone, onError){
      var stopped = false, stream = null, cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
      function stop(){ stopped = true; if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); try{ video.srcObject = null; }catch(e){} }
      var take = TQP.decoder(function(got, tot){ if(onProgress) onProgress(got, tot); }, function(mode, s){ stop(); TQ.unpack(mode, s).then(onDone, function(e){ if(onError) onError(e); }); });
      function tick(){
        if(stopped) return;
        if(video.readyState >= 2 && video.videoWidth){
          var w = video.videoWidth, h = video.videoHeight, sc = Math.min(1, 1280 / Math.max(w, h));
          cv.width = Math.round(w * sc); cv.height = Math.round(h * sc); cx.drawImage(video, 0, 0, cv.width, cv.height);
          var img = cx.getImageData(0, 0, cv.width, cv.height), code = null;
          try{ code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" }); }catch(e){}
          if(code && code.data) take(code.data);
        }
        if(!stopped) setTimeout(tick, 30);
      }
      if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ setTimeout(function(){ if(onError) onError(new Error("No camera access here.")); }, 0); return stop; }
      navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }).then(function(s){
        if(stopped){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
        stream = s; video.setAttribute("playsinline", ""); video.muted = true; video.srcObject = s;
        var p = video.play(); if(p && p.catch) p.catch(function(){});
        tick();
      }, function(e){ if(onError) onError(e); });
      return stop;
    };
  }, 0);
  /* Send to phone: pick whose phone it is */
  setTimeout(function(){
    if(typeof psyMode !== "function") return;
    var baseM = psyMode;
    psyMode = function(mode){
      baseM(mode);
      if(mode !== "send" || !PSY || !PSY.el) return;
      var info = PSY.el.querySelector(".psy-info"); if(!info) return;
      var T = (typeof rtTechs === "function" ? rtTechs() : []) || [], me = mobTech();
      var w = document.createElement("label"); w.className = "psy-who";
      w.innerHTML = '<span>Whose phone</span><select>' + T.map(function(t){ return '<option' + (techSame(t, me) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join("") + '</select>';
      info.insertBefore(w, info.firstChild);
      w.querySelector("select").addEventListener("change", function(e){ MOB_TECH = e.target.value; psyMode("send"); });
      var p = info.querySelector("p"); if(p && p.firstChild && p.firstChild.tagName === "B"){ var n = (mobBundle().ros || []).length; p.firstChild.textContent = n + " RO" + (n === 1 ? "" : "s") + " for " + PG.first(me); }
    };
  }, 0);
})();
