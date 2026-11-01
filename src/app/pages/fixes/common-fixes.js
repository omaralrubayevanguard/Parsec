/* Parsec · pages/fixes · common-fixes.js
   Common issues & fixes: fixes keyed by complaint across ROs (fixAll / fixTop); fixAutoFill does nothing since Parsec 9 (Use fix shows what changes).
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   fixKeyOf fixManual fixDateOf fixAll fixCountFor fixTop fixSourceFor fixAutoFill TQ (8 functions, 1 constant)
   state      fixes ros
   uses       access/ data/ pages/warranty/ ro/ state/ trucks/
   at load    builds TQ (a closure)
*/
/* ---------------- Common issues & fixes ---------------- */
function fixKeyOf(c){
  return String(c || '').toLowerCase().replace(/^\s*(comeback|recall\s+[\w-]+|campaign\s+[\w-]+)\s*[-–:]\s*/, '')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function fixManual(){ if(!Array.isArray(STATE.fixes)) STATE.fixes = []; return STATE.fixes; }
function fixDateOf(ro, op){
  var t = 0;
  (op.log || []).forEach(function(l){ if(l.kind === 'fix' && l.at) t = Math.max(t, new Date(l.at).getTime() || 0); });
  if(!t) opPunches(op.id).forEach(function(p){ if(p.stop) t = Math.max(t, new Date(p.stop).getTime() || 0); });
  if(!t) t = new Date(ro.dateClosed || ro.dateOpened || 0).getTime() || 0;
  return t ? new Date(t).toISOString() : '';
}
function fixAll(){
  var out = [];
  STATE.ros.forEach(function(ro){ (ro.operations || []).forEach(function(op){
    if(op.declined || !String(op.complaint || '').trim()) return;
    var fix = opStory(op, 'fix'); if(!fix && !opDoneNow(op)) return;
    var tm = truckYM(ro), techs = {}; opPunches(op.id).forEach(function(p){ var w = punchWho(p); if(w) techs[w] = 1; });
    out.push({ id: op.id, roId: ro.id, opId: op.id, ro: ro.roNumber, complaint: op.complaint.trim(), cause: opStory(op, 'cause'), correction: fix,
      truck: tm.line, vin: ro.vin || '', engine: ro.engineType || '', miles: ro.mileage || '', date: fixDateOf(ro, op),
      tech: Object.keys(techs).join(', ') || ro.assignedTech || '', hours: +op.burnt || 0, cost: opMoney(op).total, parts: opRealParts(op), codes: opFaultCodes(op) });
  }); });
  fixManual().forEach(function(m){
    out.push({ id: m.id, manual: true, complaint: m.complaint || '', cause: m.cause || '', correction: m.correction || '',
      truck: [String(m.year || '').trim(), String(m.model || '').trim()].filter(Boolean).join(' '), vin: m.vin || '', engine: m.engine || '', miles: m.miles || '',
      date: m.date || m.at || '', tech: m.by || '', hours: +m.hours || 0, parts: [], codes: m.code ? [m.code] : [] });
  });
  return out;
}
function fixCountFor(op){
  var k = fixKeyOf(op && op.complaint); if(!k) return 0;
  return fixAll().filter(function(e){ return e.opId !== op.id && fixKeyOf(e.complaint) === k; }).length;
}
function fixTop(items, k){
  var c = {}, best = '', n = 0;
  items.forEach(function(e){ var v = String(e[k] || '').trim(); if(!v) return; var kk = v.toLowerCase(); c[kk] = c[kk] || { v: v, n: 0 }; c[kk].n++; if(c[kk].n > n){ n = c[kk].n; best = c[kk].v; } });
  return { v: best, n: n };
}
/* an operation with no quoted time, or no parts, takes them from the last time the shop
   fixed the same complaint (the Fixes page). Same engine first, then most recent. Each is filled
   once — clear it by hand and it stays cleared. */
function fixSourceFor(ro, op){
  var k = fixKeyOf(op && op.complaint); if(!k) return [];
  var eng = engineNorm(ro.engineType || "");
  var out = [];
  STATE.ros.forEach(function(r){
    (r.operations || []).forEach(function(o){
      if(o === op || o.declined || fixKeyOf(o.complaint) !== k) return;
      if(!opStory(o, "fix") && !opDoneNow(o)) return;
      out.push({ ro: r, op: o, same: !!(eng && engineNorm(r.engineType || "") === eng), at: new Date(fixDateOf(r, o) || 0).getTime() });
    });
  });
  return out.sort(function(a, b){ return (b.same - a.same) || (b.at - a.at); });
}
function fixAutoFill(){
  return false;   /* Parsec 9: nothing fills in by itself — Use fix on the Fixes page shows what changes */
  var changed = false;
  STATE.ros.forEach(function(ro){
    if(ro.id === SHOP_RO_ID || roIsDone(ro)) return;
    (ro.operations || []).forEach(function(op){
      if(op.declined || !String(op.complaint || "").trim() || opDoneNow(op)) return;
      var needQ = !(+op.quoted > 0) && !op.fxQ, needP = !opRealParts(op).length && !op.fxP;
      if(!needQ && !needP) return;
      var src = fixSourceFor(ro, op); if(!src.length) return;
      if(needQ){
        var q = src.filter(function(x){ return +x.op.quoted > 0; })[0], hrs = 0, from = null;
        if(q){ hrs = +q.op.quoted; from = q; }
        else { var c = src.filter(function(x){ return +x.op.burnt > 0; })[0]; if(c){ hrs = Math.round(+c.op.burnt * 10) / 10; from = c; } }
        if(hrs > 0){ op.quoted = hrs; op.fxQ = { ro: from.ro.roNumber, roId: from.ro.id, opId: from.op.id, at: nowIso() }; changed = true; }
      }
      if(needP){
        var pz = src.filter(function(x){ return opRealParts(x.op).length; })[0];
        if(pz){
          op.parts = (op.parts || []).filter(function(p){ return (p.description || "").trim() || (p.partNumber || "").trim(); });
          opRealParts(pz.op).forEach(function(p){
            op.parts.push({ id: "pt_" + uid(), description: p.description || "", partNumber: p.partNumber || "", eta: "", qty: String(p.qty || "1"), price: priceOf(p.price) ? priceOf(p.price) : (invPriceOf(p.partNumber, p.description) ? invPriceOf(p.partNumber, p.description) : ""), status: "Not Ordered", statusChangedAt: nowIso(), fromFix: true });
          });
          op.fxP = { ro: pz.ro.roNumber, roId: pz.ro.id, opId: pz.op.id, at: nowIso() };
          changed = true;
        }
      }
    });
  });
  return changed;
}
/* TQ — move data between TEC on the computer and Parsec Mobile with a loop of QR codes.
   One side shows the codes, the other reads them with its camera. Nothing goes over a network.
   Frame text: TQ1:<session>:<z|r>:<i>/<n>:<base64 chunk>   (z = deflate-compressed, r = plain) */
var TQ = (function(){
  var CH = 360;
  function b64(u8){ var s = ''; for(var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function pipe(u8, Stream){
    var cs = new Stream('deflate-raw'), w = cs.writable.getWriter(); w.write(u8); w.close();
    return new Response(cs.readable).arrayBuffer().then(function(b){ return new Uint8Array(b); });
  }
  function pack(obj){
    var raw = new TextEncoder().encode(JSON.stringify(obj));
    var go = function(mode, body){
      var s = b64(body), sid = Math.random().toString(36).slice(2, 7), n = Math.max(1, Math.ceil(s.length / CH)), out = [];
      for(var i = 0; i < n; i++) out.push('TQ1:' + sid + ':' + mode + ':' + (i + 1) + '/' + n + ':' + s.slice(i * CH, (i + 1) * CH));
      return { frames: out, bytes: body.length };
    };
    if(typeof CompressionStream === 'undefined') return Promise.resolve(go('r', raw));
    return pipe(raw, CompressionStream).then(function(z){ return go('z', z); }, function(){ return go('r', raw); });
  }
  function unpack(mode, s){
    var u = unb64(s);
    var done = function(x){ return JSON.parse(new TextDecoder().decode(x)); };
    if(mode !== 'z') return Promise.resolve(done(u));
    if(typeof DecompressionStream === 'undefined') return Promise.reject(new Error('This browser cannot unpack the codes. Update it and try again.'));
    return pipe(u, DecompressionStream).then(done);
  }
  function draw(canvas, text){
    var qr = qrcode(0, 'L'); qr.addData(text); qr.make();
    var n = qr.getModuleCount(), q = 4, size = n + q * 2, ctx = canvas.getContext('2d');
    canvas.width = size; canvas.height = size;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#000';
    for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(qr.isDark(r, c)) ctx.fillRect(c + q, r + q, 1, 1);
  }
  /* show the frames in a loop; returns stop() */
  function player(canvas, frames, onTick, ms){
    var i = 0;
    var step = function(){ var k = i % frames.length; draw(canvas, frames[k]); if(onTick) onTick(k + 1, frames.length); i++; };
    step();
    var t = setInterval(step, ms || 320);
    return function(){ clearInterval(t); };
  }
  /* read frames from the camera until every piece is in; returns stop() */
  function scanner(video, onProgress, onDone, onError){
    var stopped = false, stream = null, parts = {}, sid = null, total = 0, mode = 'r';
    var cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    function stop(){ stopped = true; if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); try{ video.srcObject = null; }catch(e){} }
    function take(d){
      var m = /^TQ1:([a-z0-9]+):([rz]):(\d+)\/(\d+):(.*)$/.exec(d); if(!m) return;
      if(sid !== m[1]){ sid = m[1]; parts = {}; total = +m[4]; mode = m[2]; }
      if(parts[m[3]] !== undefined) return;
      parts[m[3]] = m[5];
      var got = Object.keys(parts).length;
      if(onProgress) onProgress(got, total);
      if(got === total){
        var s = ''; for(var i = 1; i <= total; i++) s += parts[i];
        stop();
        unpack(mode, s).then(onDone, function(e){ if(onError) onError(e); });
      }
    }
    function tick(){
      if(stopped) return;
      if(video.readyState >= 2 && video.videoWidth){
        var w = video.videoWidth, h = video.videoHeight, sc = Math.min(1, 900 / Math.max(w, h));
        cv.width = Math.round(w * sc); cv.height = Math.round(h * sc);
        cx.drawImage(video, 0, 0, cv.width, cv.height);
        var img = cx.getImageData(0, 0, cv.width, cv.height);
        var code = null; try{ code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' }); }catch(e){}
        if(code && code.data) take(code.data);
      }
      if(!stopped) setTimeout(tick, 40);
    }
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ setTimeout(function(){ if(onError) onError(new Error('No camera access here. On the phone this needs the app opened from its https address.')); }, 0); return stop; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }).then(function(s){
      if(stopped){ s.getTracks().forEach(function(t){ t.stop(); }); return; }
      stream = s; video.setAttribute('playsinline', ''); video.muted = true; video.srcObject = s;
      var p = video.play(); if(p && p.catch) p.catch(function(){});
      tick();
    }, function(e){ if(onError) onError(e); });
    return stop;
  }
  return { pack: pack, player: player, scanner: scanner, unpack: unpack, draw: draw };
})();
