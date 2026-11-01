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
