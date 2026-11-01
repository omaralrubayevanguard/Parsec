/* Parsec · data · photo-shrink.js
   Photos wider than 1600 px or over 2 MB become a 1600 px JPEG before they are saved (v160Shrink); PDFs and small images stay as they are.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   v160Shrink V160_IMG (1 function, 1 constant)
*/
/* ---------- photos: wider than 1600 px or over 2 MB → a 1600 px wide JPEG (q 0.85). PDFs, small images, PNG under 2 MB as they are ---------- */
var V160_IMG = { w: 1600, big: 2 * 1024 * 1024, q: 0.85 };
function v160Shrink(file){
  return new Promise(function(res){
    var plain = { blob: file, name: file.name, saved: 0 };
    if(!file || !/^image\/(jpeg|jpg|png|webp)$/i.test(file.type || "") || !window.HTMLCanvasElement) return res(plain);
    var png = /png$/i.test(file.type), big = file.size > V160_IMG.big;
    if(png && !big) return res(plain);                               /* a PNG under 2 MB stays a PNG (screenshots, Tech Tool) */
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function(){
      var w = img.naturalWidth, h = img.naturalHeight;
      if(!(w > V160_IMG.w) && !big){ URL.revokeObjectURL(url); return res(plain); }   /* small: as it is */
      var scale = Math.min(1, V160_IMG.w / w), c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w * scale)); c.height = Math.max(1, Math.round(h * scale));
      try{ var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); }
      catch(e){ URL.revokeObjectURL(url); return res(plain); }
      c.toBlob(function(blob){
        URL.revokeObjectURL(url);
        if(!blob || blob.size >= file.size) return res(plain);
        var nm = String(file.name || "photo"); nm = /\.[A-Za-z0-9]{1,5}$/.test(nm) ? nm.replace(/\.[A-Za-z0-9]{1,5}$/, ".jpg") : nm + ".jpg";
        res({ blob: blob, name: nm, saved: file.size - blob.size, w: c.width, h: c.height });
      }, "image/jpeg", V160_IMG.q);
    };
    img.onerror = function(){ URL.revokeObjectURL(url); res(plain); };
    img.src = url;
  });
}
