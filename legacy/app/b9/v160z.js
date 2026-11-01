/* ---------- Parsec 16 (C): small helpers for the data store — compression, checksums, folders. No installs: the browser's own
   CompressionStream / DecompressionStream ('gzip') and crypto.subtle. A browser without them gets plain text (still readable). ---------- */
function pdGzipOk(){ return typeof CompressionStream === "function" && typeof DecompressionStream === "function" && typeof Response === "function"; }
/* text → a gzip Blob (or a plain text Blob where the browser can't compress) */
function pdGzip(text){
  text = String(text == null ? "" : text);
  if(!pdGzipOk()) return Promise.resolve(new Blob([text], { type: "application/json" }));
  try{
    var s = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Response(s).blob().then(function(b){ return new Blob([b], { type: "application/gzip" }); });
  }catch(e){ return Promise.resolve(new Blob([text], { type: "application/json" })); }
}
/* a Blob / File / ArrayBuffer / string → text; gzip is recognised by its first two bytes, so plain files read too */
function pdGunzip(b){
  if(b == null) return Promise.reject(new Error("nothing to read"));
  if(typeof b === "string") return Promise.resolve(b);
  var blob = b instanceof Blob ? b : new Blob([b]);
  return blob.slice(0, 2).arrayBuffer().then(function(h){
    var u = new Uint8Array(h);
    if(u.length === 2 && u[0] === 0x1f && u[1] === 0x8b){
      if(!pdGzipOk()) throw new Error("This browser can't open compressed files");
      return new Response(blob.stream().pipeThrough(new DecompressionStream("gzip"))).text();
    }
    return blob.text();
  });
}
/* sha-256 of a Blob / ArrayBuffer / string, as hex */
function pdSha256(x){
  var p = typeof x === "string" ? Promise.resolve(new TextEncoder().encode(x).buffer) : x instanceof Blob ? x.arrayBuffer() : Promise.resolve(x);
  return p.then(function(buf){ return crypto.subtle.digest("SHA-256", buf); })
    .then(function(d){ return Array.prototype.map.call(new Uint8Array(d), function(v){ return ("0" + v.toString(16)).slice(-2); }).join(""); });
}
/* a folder by path under a directory: pdDirAt(dir, ["Backups", "2026-10"], true) */
function pdDirAt(dir, parts, create){
  return (parts || []).reduce(function(p, name){ return p.then(function(d){ return d.getDirectoryHandle(name, { create: !!create }); }); }, Promise.resolve(dir));
}
/* write text or a Blob to a file (replacing it) */
function pdPut(dir, name, data){
  return dir.getFileHandle(name, { create: true })
    .then(function(fh){ return fh.createWritable(); })
    .then(function(w){ return w.write(data).then(function(){ return w.close(); }); });
}
function pdEntries(dir){
  var out = [], it;
  try{ it = dir.values(); }catch(e){ return Promise.resolve(out); }
  function step(){ return it.next().then(function(r){ if(r.done) return out; out.push(r.value); return step(); }); }
  return step().catch(function(){ return out; });
}
function pd2(n){ return String(n).padStart(2, "0"); }
function pdStamp(d){ d = d || new Date(); return d.getFullYear() + "-" + pd2(d.getMonth() + 1) + "-" + pd2(d.getDate()) + " " + pd2(d.getHours()) + "-" + pd2(d.getMinutes()); }
