/* Parsec · access · people-and-demo-team.js
   People: staffList() and lookups by name / role (staffForTech, techNorm), initials and avatars (avatarSvg), the audit log (audit / auditLog), and the demo team used by the sample data.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   profileInitials avatarSvg techNorm techSame staffForTech punchByName punchWho punchAvHtml auditLog audit auditCsv qrMul … (37 functions, 9 constants)
   state      audit punches ros techName
   uses       data/ kit/ pages/ pages/rolist/ pages/technician/ ro/ ro-page/ shell/ state/
   at load    3× on window resize · 2× on window scroll
*/
/* ---------- the profile button ----------
   A round button, top right of the header, showing the technician's initials
   (or a generic person icon until a name is set). Pops a small card to set it. */
function profileInitials(name){
  var s = String(name || "").trim();
  if(!s) return "";
  var parts = s.split(/\s+/).filter(Boolean);
  var a = parts[0] ? parts[0][0] : "", b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}
/* ---------- demo team: portraits drawn in code (no photos are stored), or upload a real one ---------- */
var DEMO_TEAM = [
  { name: "Mike Rodriguez", role: "Technician", av: { f: 0, skin: "#b98462", shade: "#8f5f43", hair: "#1b1411", style: "short", beard: "stubble", shirt: "work", sc: "#27425f", eye: "#3a2a1c", bg: ["#5d7189", "#2e3a4a"], age: 0 } },
  { name: "Dana Kowalski", role: "Technician", av: { f: 1, skin: "#efc6a8", shade: "#d19c7c", hair: "#8a4a22", style: "ponytail", beard: "none", shirt: "work", sc: "#2c4a3f", eye: "#4d7a8c", bg: ["#a9b4a0", "#566453"], age: 0 } },
  { name: "Luis Martinez", role: "Technician", av: { f: 0, skin: "#c99572", shade: "#9b6a4b", hair: "#15110e", style: "cap", beard: "mustache", shirt: "work", sc: "#3b3f46", eye: "#33231a", bg: ["#8a7a66", "#463c31"], age: 1, cap: "#a3262a" } },
  { name: "Priya Shah", role: "Technician", av: { f: 1, skin: "#a8744f", shade: "#7e5136", hair: "#120d0c", style: "long", beard: "none", shirt: "work", sc: "#27425f", eye: "#2a1b12", bg: ["#7f8ea3", "#3a465a"], age: 0 } },
  { name: "Frank Delaney", role: "Foreman", av: { f: 0, skin: "#e3b393", shade: "#bd8767", hair: "#b9b8b5", style: "short", beard: "none", shirt: "dress", sc: "#7fa0c4", eye: "#5b7f95", bg: ["#9aa5b3", "#4a5565"], age: 2, glasses: true } },
  { name: "Tom Brandt", role: "Manager", av: { f: 0, skin: "#f0c9ad", shade: "#cf9c7c", hair: "#6f5c4a", style: "bald", beard: "full", shirt: "dress", sc: "#f4f4f2", eye: "#4f6f8a", bg: ["#b2a79a", "#554b40"], age: 2, glasses: true, tie: "#6b1f2b" } },
  { name: "Jenna Cho", role: "Service writer", av: { f: 1, skin: "#f1d0b3", shade: "#d3a784", hair: "#14100f", style: "bob", beard: "none", shirt: "polo", sc: "#1f5fa8", eye: "#2c1d15", bg: ["#b9c4d3", "#667790"], age: 0 } },
  { name: "Derek Washington", role: "Service writer", av: { f: 0, skin: "#7a4e36", shade: "#573623", hair: "#0d0a09", style: "buzz", beard: "full", shirt: "polo", sc: "#1f5fa8", eye: "#251710", bg: ["#a79e92", "#4d463d"], age: 0 } },
  { name: "Sofia Alvarez", role: "Triage", av: { f: 1, skin: "#d9a584", shade: "#b27c5c", hair: "#3a2216", style: "wavy", beard: "none", shirt: "hivis", sc: "#c9d62b", eye: "#4a3322", bg: ["#9bb0a8", "#4d6159"], age: 0 } },
  { name: "Ben Okafor", role: "Parts", av: { f: 0, skin: "#5d3b2a", shade: "#3f261a", hair: "#0a0807", style: "short", beard: "none", shirt: "polo", sc: "#4a4f57", eye: "#1f130d", bg: ["#8f9aa8", "#414b59"], age: 0, glasses: true } },
  { name: "Carla Reyes", role: "Warranty admin", av: { f: 1, skin: "#c68e6a", shade: "#9c6748", hair: "#2a1a12", style: "long", beard: "none", shirt: "polo", sc: "#7a3b8f", eye: "#2c1d15", bg: ["#c4b5c9", "#6c5a73"], age: 1 } }
];
function avatarSvg(av, key){
  var k = "av" + String(key || "x").replace(/\W/g, "").slice(-10), g = function(n){ return k + n; };
  var s = av.skin, sh = av.shade, hc = av.hair, f = !!av.f, st = av.style;
  var gray = av.age >= 1 ? (av.age >= 2 ? .85 : .35) : 0;
  var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 8 80 80" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">';
  o += '<defs>'
    + '<radialGradient id="'+g("b")+'" cx=".35" cy=".25" r=".95"><stop offset="0" stop-color="'+av.bg[0]+'"/><stop offset="1" stop-color="'+av.bg[1]+'"/></radialGradient>'
    + '<radialGradient id="'+g("f")+'" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="'+s+'"/><stop offset=".75" stop-color="'+s+'"/><stop offset="1" stop-color="'+sh+'"/></radialGradient>'
    + '<linearGradient id="'+g("n")+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".55" stop-color="'+sh+'"/><stop offset="1" stop-color="'+sh+'"/></linearGradient>'
    + '<linearGradient id="'+g("s")+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+av.sc+'"/><stop offset="1" stop-color="#000" stop-opacity=".0"/></linearGradient>'
    + '<radialGradient id="'+g("v")+'" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>'
    + '<linearGradient id="'+g("h")+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+hc+'"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'
    + '<filter id="'+g("g")+'" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="'+(k.length * 7)+'"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".11"/></feComponentTransfer></filter>'
    + '<filter id="'+g("bl")+'"><feGaussianBlur stdDeviation="1.1"/></filter>'
    + '</defs>';
  o += '<rect width="100" height="100" fill="url(#'+g("b")+')"/>';
  o += '<ellipse cx="22" cy="18" rx="26" ry="20" fill="#fff" opacity=".10" filter="url(#'+g("bl")+')"/>';
  /* hair behind the head */
  if(st === "long") o += '<path d="M29 40C25 58 27 76 24 92 40 96 60 96 76 92 73 76 75 58 71 40Z" fill="url(#'+g("h")+')"/>';
  if(st === "wavy") o += '<path d="M29 38C22 54 30 62 25 76 22 86 30 92 28 98H72C70 92 78 86 75 76 70 62 78 54 71 38Z" fill="url(#'+g("h")+')"/>';
  if(st === "bob") o += '<path d="M28 38C24 52 26 62 31 68 40 70 60 70 69 68 74 62 76 52 72 38Z" fill="url(#'+g("h")+')"/>';
  if(st === "ponytail") o += '<path d="M66 30C80 30 84 48 80 62 78 70 73 74 71 70 76 60 74 46 64 42Z" fill="url(#'+g("h")+')"/>';
  /* shoulders and shirt */
  o += '<path d="M6 100C8 84 22 77 38 74L50 78 62 74C78 77 92 84 94 100Z" fill="'+av.sc+'"/>';
  o += '<path d="M6 100C8 84 22 77 38 74L50 78 62 74C78 77 92 84 94 100Z" fill="url(#'+g("s")+')" opacity=".55"/>';
  if(av.shirt === "hivis"){
    o += '<path d="M31 76 40 100M69 76 60 100" stroke="#e8e8e0" stroke-width="3.4" opacity=".92"/><path d="M12 92H88" stroke="#e8e8e0" stroke-width="3" opacity=".7"/>'
      + '<path d="M38 74L50 90 62 74 58 72 50 80 42 72Z" fill="#3d4a52"/>';
  }
  if(av.shirt === "work"){
    o += '<path d="M38 74L50 92 62 74 57 72 50 82 43 72Z" fill="#000" opacity=".28"/><path d="M36 74 50 90 64 74 58 71 50 80 42 71Z" fill="'+av.sc+'"/><path d="M36 74 50 90 64 74" fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".6"/>'
      + '<rect x="62" y="86" width="13" height="5.5" rx="1" fill="#e8ecef" opacity=".95"/><rect x="63.6" y="87.6" width="7" height="1.1" fill="#31506f"/><rect x="63.6" y="89.4" width="9" height=".9" fill="#7b8a99"/>';
  }
  if(av.shirt === "polo"){
    o += '<path d="M40 74 50 86 60 74 56 72 50 78 44 72Z" fill="#000" opacity=".25"/><path d="M38 74 50 88 62 74 57 71 50 79 43 71Z" fill="'+av.sc+'"/><path d="M50 79V90" stroke="#000" stroke-opacity=".28" stroke-width=".7"/><circle cx="50" cy="83" r=".8" fill="#fff" opacity=".7"/><circle cx="50" cy="87" r=".8" fill="#fff" opacity=".7"/>';
  }
  if(av.shirt === "dress"){
    o += '<path d="M38 73 50 94 62 73 57 71 50 80 43 71Z" fill="#000" opacity=".2"/><path d="M37 73 50 92 63 73 58 70 50 79 42 70Z" fill="'+av.sc+'"/><path d="M42 70 50 79 58 70" fill="none" stroke="#000" stroke-opacity=".28" stroke-width=".7"/>';
    if(av.tie) o += '<path d="M47.6 78.5H52.4L54 98H46Z" fill="'+av.tie+'"/><path d="M47.6 78.5H52.4L51.6 82H48.4Z" fill="#000" opacity=".3"/>';
  }
  /* neck */
  o += '<path d="M42 56V74C42 78 46 81 50 81 54 81 58 78 58 74V56Z" fill="'+sh+'"/>';
  o += '<path d="M42 56V66C46 70 54 70 58 66V56Z" fill="url(#'+g("n")+')"/>';
  /* ears */
  o += '<ellipse cx="32.2" cy="46" rx="2.7" ry="4.6" fill="'+sh+'"/><ellipse cx="67.8" cy="46" rx="2.7" ry="4.6" fill="'+sh+'"/>';
  /* head */
  var rx = f ? 16.2 : 17.4, chin = f ? 66 : 67.5;
  o += '<path d="M'+(50-rx)+' 42C'+(50-rx)+' 26 '+(50-rx+3)+' 21 50 21S'+(50+rx-3)+' 26 '+(50+rx)+' 42C'+(50+rx)+' 56 '+(f ? 61 : 62.5)+' '+chin+' 50 '+chin+'S'+(50-rx)+' 56 '+(50-rx)+' 42Z" fill="url(#'+g("f")+')"/>';
  /* jaw shadow and cheek warmth */
  o += '<path d="M'+(50-rx+1)+' 50C'+(50-rx+4)+' 62 44 '+chin+' 50 '+chin+'S'+(50+rx-4)+' 62 '+(50+rx-1)+' 50C'+(50+rx-3)+' 60 '+(f?58:60)+' 65 50 65S'+(50-rx+3)+' 60 '+(50-rx+1)+' 50Z" fill="'+sh+'" opacity=".28"/>';
  o += '<ellipse cx="41" cy="52" rx="4.6" ry="3" fill="#d4604f" opacity="'+(f ? ".16" : ".09")+'"/><ellipse cx="59" cy="52" rx="4.6" ry="3" fill="#d4604f" opacity="'+(f ? ".16" : ".09")+'"/>';
  /* beard under the features */
  if(av.beard === "full") o += '<path d="M33 48C33 62 40 70 50 70S67 62 67 48C65 56 61 59 56 59.5 53 57.6 47 57.6 44 59.5 39 59 35 56 33 48Z" fill="'+hc+'" opacity=".94"/><path d="M45 58.2C48 56.8 52 56.8 55 58.2 52 59.6 48 59.6 45 58.2Z" fill="#a3504a" opacity=".85"/>';
  if(av.beard === "stubble") o += '<path d="M33 48C33 62 40 69 50 69S67 62 67 48C65 56 61 59 56 59.5 53 57.6 47 57.6 44 59.5 39 59 35 56 33 48Z" fill="'+hc+'" opacity=".32"/>';
  /* brows */
  var bw = f ? 1.05 : 1.7, bc = hc;
  o += '<path d="M37.2 39.2C39.5 37.6 43 37.4 45.6 38.6" stroke="'+bc+'" stroke-width="'+bw+'" fill="none" stroke-linecap="round"/><path d="M54.4 38.6C57 37.4 60.5 37.6 62.8 39.2" stroke="'+bc+'" stroke-width="'+bw+'" fill="none" stroke-linecap="round"/>';
  /* eyes */
  [42.2, 57.8].forEach(function(x, i){
    o += '<ellipse cx="'+x+'" cy="43.4" rx="3.5" ry="1.9" fill="#f3efe9"/>'
      + '<circle cx="'+(x + (i ? -.2 : .2))+'" cy="43.4" r="1.75" fill="'+av.eye+'"/><circle cx="'+(x + (i ? -.2 : .2))+'" cy="43.4" r=".85" fill="#0b0807"/><circle cx="'+(x + .8)+'" cy="42.7" r=".5" fill="#fff" opacity=".9"/>'
      + '<path d="M'+(x-3.7)+' 43.2C'+(x-2)+' 41 '+(x+2)+' 41 '+(x+3.7)+' 43.2" stroke="#1a110d" stroke-width="'+(f ? .9 : .7)+'" fill="none" stroke-linecap="round" opacity=".85"/>'
      + '<path d="M'+(x-3)+' 45.2C'+(x-1)+' 46.1 '+(x+1)+' 46.1 '+(x+3)+' 45.2" stroke="'+sh+'" stroke-width=".5" fill="none" opacity=".6"/>';
  });
  /* nose */
  o += '<path d="M50 44C49.4 48 48.6 50.6 47.4 52.4 49 53.7 51 53.7 52.6 52.4 51.4 50.6 50.6 48 50 44Z" fill="'+sh+'" opacity=".26"/>'
    + '<path d="M47.2 52.6C48.6 53.8 51.4 53.8 52.8 52.6" stroke="'+sh+'" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".75"/>'
    + '<ellipse cx="48.2" cy="52.5" rx=".8" ry=".5" fill="#2a1710" opacity=".5"/><ellipse cx="51.8" cy="52.5" rx=".8" ry=".5" fill="#2a1710" opacity=".5"/>';
  /* mouth */
  var lip = f ? "#b8564f" : "#a2625a";
  o += '<path d="M44.6 59.4C47 58.4 48.8 58 50 58.8 51.2 58 53 58.4 55.4 59.4 53.6 61.6 46.4 61.6 44.6 59.4Z" fill="'+lip+'"/>'
    + '<path d="M44.8 59.5C47.4 60.2 52.6 60.2 55.2 59.5" stroke="#4a1f1b" stroke-width=".5" fill="none" opacity=".7"/>'
    + '<path d="M46.2 61.1C48 62.2 52 62.2 53.8 61.1" stroke="#fff" stroke-width=".55" fill="none" opacity=".28"/>';
  if(av.beard === "mustache") o += '<path d="M43.2 57.8C45.6 55.8 48.6 56.6 50 57.4 51.4 56.6 54.4 55.8 56.8 57.8 54.6 59 51.6 58.2 50 58 48.4 58.2 45.4 59 43.2 57.8Z" fill="'+hc+'"/>';
  /* hair in front */
  var hf = 'url(#'+g("h")+')';
  if(st === "short" || st === "ponytail") o += '<path d="M32.4 43C29.6 24 40 17.6 50 17.6S70.4 24 67.6 43C66.4 36 63 31.4 57 29.4 49 31.4 40 28.6 35 33.6 33.6 36 33 39 32.4 43Z" fill="'+hf+'"/>'
    + '<path d="M36 30C42 25.6 55 25 62 30" stroke="#fff" stroke-opacity=".12" stroke-width="1.4" fill="none"/>';
  if(st === "buzz") o += '<path d="M32.6 42C30.4 25 40.6 18.4 50 18.4S69.6 25 67.4 42C66.4 35 63 30.6 50 30.6S33.6 35 32.6 42Z" fill="'+hc+'" opacity=".86"/>';
  if(st === "bald"){ o += '<path d="M32.4 44C32 36 34.6 31.6 37 30 35.4 34 34.8 38.6 35 45Z" fill="'+hc+'" opacity=".95"/><path d="M67.6 44C68 36 65.4 31.6 63 30 64.6 34 65.2 38.6 65 45Z" fill="'+hc+'" opacity=".95"/><ellipse cx="45" cy="26" rx="6" ry="2.6" fill="#fff" opacity=".2" filter="url(#'+g("bl")+')"/>'; }
  if(st === "long") o += '<path d="M32 42C28 22 40 17 50 17S72 22 68 42C67 34 62 29 55 28 46 33 38 31 34 38 33 40 32 41 32 42Z" fill="'+hf+'"/><path d="M50 18C46 24 40 30 33 40" stroke="#fff" stroke-opacity=".12" stroke-width="1.2" fill="none"/>';
  if(st === "wavy") o += '<path d="M31 46C25 24 40 16 50 16S75 24 69 46C68 36 64 30 56 28 46 34 38 30 34 38 32 41 31 45 31 46Z" fill="'+hf+'"/><path d="M36 24C42 19 52 19 60 23" stroke="#fff" stroke-opacity=".14" stroke-width="1.3" fill="none"/>';
  if(st === "bob") o += '<path d="M30 44C26 22 40 16.6 50 16.6S74 22 70 44C69 35 64 29 50 29S31 35 30 44Z" fill="'+hf+'"/><path d="M33 31C40 24 58 24 67 31" stroke="#fff" stroke-opacity=".13" stroke-width="1.3" fill="none"/>';
  if(st === "cap"){
    o += '<path d="M32.6 42C30 28 38 22 50 22S70 28 67.4 42C66 36 62 33 50 33S34 36 32.6 42Z" fill="'+hc+'"/>'
      + '<path d="M31 36C31 22 40 15.4 50 15.4S69 22 69 36C62 32 38 32 31 36Z" fill="'+(av.cap || "#a3262a")+'"/><path d="M31 36C40 38.6 60 38.6 69 36 66 40 34 40 31 36Z" fill="#000" opacity=".25"/>'
      + '<path d="M50 15.6V32" stroke="#000" stroke-opacity=".18" stroke-width=".6"/><rect x="45" y="22" width="10" height="6.4" rx="1.4" fill="#e8e8e0" opacity=".9"/><path d="M47 25.2H53" stroke="'+(av.cap || "#a3262a")+'" stroke-width="1.5" stroke-linecap="round"/>'
      + '<path d="M33 37C40 41 60 41 67 37 70 40 66 43 50 43S30 40 33 37Z" fill="'+(av.cap || "#a3262a")+'" opacity=".0"/>';
  }
  if(gray){ o += '<path d="M32.4 43C31.6 36 33.4 32 36 30.4 34.6 35 34.4 39 34.6 44Z" fill="#d8d6d2" opacity="'+gray+'"/><path d="M67.6 43C68.4 36 66.6 32 64 30.4 65.4 35 65.6 39 65.4 44Z" fill="#d8d6d2" opacity="'+gray+'"/>'; }
  if(av.glasses) o += '<g fill="#cfe3ee" fill-opacity=".14" stroke="#1b1b1d" stroke-width="1.05"><rect x="35.2" y="39.6" width="13" height="8.8" rx="3.6"/><rect x="51.8" y="39.6" width="13" height="8.8" rx="3.6"/></g><path d="M48.2 42.8C49.4 42 50.6 42 51.8 42.8M35.2 42.2 32.4 41.4M64.8 42.2 67.6 41.4" stroke="#1b1b1d" stroke-width=".9" fill="none"/><path d="M37 41.6 41 41" stroke="#fff" stroke-width=".7" opacity=".5" stroke-linecap="round"/>';
  o += '<rect width="100" height="100" fill="url(#'+g("v")+')"/>';
  o += '<rect width="100" height="100" filter="url(#'+g("g")+')" fill="#fff"/>';
  return o + '</svg>';
}

var DEPT_OF = { "Technician": "Service technicians", "Foreman": "Shop floor", "Manager": "Management", "Service writer": "Service advisors", "Triage": "Triage & check-in", "Parts": "Parts", "Warranty admin": "Warranty" };
function techNorm(x){ return String(x || "").toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean); }
/* "Mike R." and "Mike Rodriguez" are the same person */
function techSame(a, b){
  var x = techNorm(a), y = techNorm(b);
  if(!x.length || !y.length) return false;
  if(x.join(" ") === y.join(" ")) return true;
  return x.length > 1 && y.length > 1 && x[0] === y[0] && x[1][0] === y[1][0];
}
function staffForTech(name){ return staffList().filter(function(sf){ return techSame(name, sf.name); })[0] || null; }
/* who punched: stored on the punch at the moment it starts; older punches fall back to the RO's tech */
function punchByName(){ var sf = viewAsStaff(); return sf ? sf.name : String(STATE.techName || ""); }
function punchWho(p){ var ro = getRO(p.roId); return p.by || (ro && ro.assignedTech) || ""; }
function punchAvHtml(p, ctx){
  var nm = punchWho(p); if(!nm) return "";
  var sf = staffForTech(nm);
  return '<span class="jp-who" title="Punched by ' + esc(sf ? sf.name : nm) + '"' + v149eAvAttr(sf ? sf.name : nm) + '>' + staffAvHtml(sf || { name: nm }, "jp-av", ctx) + '</span>';
}
/* ---- audit trail: who did what, when ----
   Status changes, releases, check-ins, deletes, sign-ins and staff edits each leave a line.
   Kept in shop-data.json (last 3000), shown on the Manager page, exportable as CSV. */
function auditLog(){ if(!Array.isArray(STATE.audit)) STATE.audit = []; return STATE.audit; }
function audit(type, text, ro){
  if(type === 'ro-del' && ro){ try{ v147Rec(ro, null, true); }catch(e){} }   /* Parsec 14.7: the RO stays in its tech's Completed */
  var l = auditLog();
  l.push({ at: nowIso(), by: punchByName() || "Admin", type: type, text: text, ro: ro ? ro.id : null, num: ro ? String(ro.roNumber || "") : "" });
  if(l.length > 3000) l.splice(0, l.length - 3000);
}
function auditCsv(){
  var rows = [["When","Who","What","RO","Detail"]].concat(auditLog().slice().reverse().map(function(a){ return [a.at, a.by, a.type, a.num, a.text]; }));
  return rows.map(function(r){ return r.map(function(v){ v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","); }).join("\n");
}
/* ---- QR code (byte mode, error-correction M, versions 1-6) — drawn offline, no library ---- */
var QR_EC = [null,[10,1,16,0,0],[16,1,28,0,0],[26,1,44,0,0],[18,2,32,0,0],[24,2,43,0,0],[16,4,27,0,0]];
var QR_ALIGN = [null,[],[6,18],[6,22],[6,26],[6,30],[6,34]];
var QR_EXP = [], QR_LOG = [];
(function(){ var x = 1; for(var i = 0; i < 255; i++){ QR_EXP[i] = x; QR_LOG[x] = i; x <<= 1; if(x & 256) x ^= 0x11d; } for(i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255]; })();
function qrMul(a, b){ return a && b ? QR_EXP[QR_LOG[a] + QR_LOG[b]] : 0; }
function qrRs(data, n){
  var g = [1], i, j;
  for(i = 0; i < n; i++){ var ng = []; for(j = 0; j <= g.length; j++) ng[j] = (j < g.length ? g[j] : 0) ^ (j ? qrMul(g[j - 1], QR_EXP[i]) : 0); g = ng; }
  var r = []; for(i = 0; i < n; i++) r[i] = 0;
  data.forEach(function(d){ var f = d ^ r[0]; r.shift(); r.push(0); for(var k = 0; k < n; k++) r[k] ^= qrMul(g[k + 1], f); });
  return r;
}
function qrMatrix(text){
  var bytes = unescape(encodeURIComponent(String(text))).split("").map(function(c){ return c.charCodeAt(0); });
  var v = 1; while(v < 6 && bytes.length > QR_EC[v][1] * QR_EC[v][2] + QR_EC[v][3] * QR_EC[v][4] - 2) v++;
  if(bytes.length > QR_EC[v][1] * QR_EC[v][2] - 2 && v === 6 && bytes.length > 106) return null;
  var ec = QR_EC[v], total = ec[1] * ec[2] + ec[3] * ec[4], bits = [];
  function put(val, len){ for(var i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); }
  put(4, 4); put(bytes.length, 8); bytes.forEach(function(b){ put(b, 8); });
  for(var t = 0; t < 4 && bits.length < total * 8; t++) bits.push(0);
  while(bits.length % 8) bits.push(0);
  var cw = []; for(var i = 0; i < bits.length; i += 8){ var n = 0; for(var j = 0; j < 8; j++) n = n * 2 + bits[i + j]; cw.push(n); }
  for(var pad = 0; cw.length < total; pad++) cw.push(pad % 2 ? 0x11 : 0xec);
  var blocks = [], pos = 0;
  for(i = 0; i < ec[1] + ec[3]; i++){ var len = i < ec[1] ? ec[2] : ec[4]; blocks.push(cw.slice(pos, pos + len)); pos += len; }
  var ecs = blocks.map(function(b){ return qrRs(b, ec[0]); }), out = [], mx = Math.max(ec[2], ec[4]);
  for(i = 0; i < mx; i++) blocks.forEach(function(b){ if(i < b.length) out.push(b[i]); });
  for(i = 0; i < ec[0]; i++) ecs.forEach(function(e){ out.push(e[i]); });
  var N = 17 + 4 * v, M = [], F = [], r, c;
  for(r = 0; r < N; r++){ M[r] = []; F[r] = []; for(c = 0; c < N; c++){ M[r][c] = 0; F[r][c] = 0; } }
  function setf(r, c, d){ if(r >= 0 && c >= 0 && r < N && c < N){ M[r][c] = d ? 1 : 0; F[r][c] = 1; } }
  function finder(r0, c0){ for(var dr = -1; dr <= 7; dr++) for(var dc = -1; dc <= 7; dc++){
    var on = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 && (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)); setf(r0 + dr, c0 + dc, on); } }
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
  for(i = 8; i < N - 8; i++){ setf(6, i, i % 2 === 0); setf(i, 6, i % 2 === 0); }
  var al = QR_ALIGN[v];
  al.forEach(function(ar){ al.forEach(function(ac){
    if((ar === 6 && ac === 6) || (ar === 6 && ac === al[al.length - 1]) || (ac === 6 && ar === al[al.length - 1])) return;
    for(var dr = -2; dr <= 2; dr++) for(var dc = -2; dc <= 2; dc++) setf(ar + dr, ac + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1); }); });
  setf(N - 8, 8, 1);
  for(i = 0; i < 9; i++){ if(!F[8][i]) F[8][i] = 2; if(!F[i][8]) F[i][8] = 2; }
  for(i = 0; i < 8; i++){ if(!F[8][N - 1 - i]) F[8][N - 1 - i] = 2; if(!F[N - 1 - i][8]) F[N - 1 - i][8] = 2; }
  var dbits = []; out.forEach(function(b){ for(var k = 7; k >= 0; k--) dbits.push((b >> k) & 1); });
  var cells = [], up = true, bi = 0;
  for(c = N - 1; c > 0; c -= 2){ if(c === 6) c--;
    for(var k = 0; k < N; k++){ r = up ? N - 1 - k : k; for(var d = 0; d < 2; d++){ var cc = c - d; if(!F[r][cc]) cells.push([r, cc, dbits[bi++] || 0]); } }
    up = !up; }
  var MASKS = [function(r, c){ return (r + c) % 2 === 0; }, function(r){ return r % 2 === 0; }, function(r, c){ return c % 3 === 0; }, function(r, c){ return (r + c) % 3 === 0; },
    function(r, c){ return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; }, function(r, c){ return (r * c) % 2 + (r * c) % 3 === 0; },
    function(r, c){ return ((r * c) % 2 + (r * c) % 3) % 2 === 0; }, function(r, c){ return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }];
  /* format bits are written explicitly below so the two copies are exact */
  function withFormat(mk){
    var G = M.map(function(row){ return row.slice(); });
    cells.forEach(function(x){ G[x[0]][x[1]] = x[2] ^ (MASKS[mk](x[0], x[1]) ? 1 : 0); });
    var rem = mk << 10; for(var s = 14; s >= 10; s--) if((rem >> s) & 1) rem ^= 0x537 << (s - 10);
    var fmt = (((mk << 10) | rem) ^ 0x5412), b = function(n){ return (fmt >> n) & 1; };
    for(var q = 0; q <= 5; q++) G[q][8] = b(q);
    G[7][8] = b(6); G[8][8] = b(7); G[8][7] = b(8);
    for(q = 9; q <= 14; q++) G[8][14 - q] = b(q);
    for(q = 0; q <= 7; q++) G[8][N - 1 - q] = b(q);
    for(q = 8; q <= 14; q++) G[N - 15 + q][8] = b(q);
    G[N - 8][8] = 1;
    return G;
  }
  function penalty(G){
    var p = 0, a, b, run, k;
    for(a = 0; a < N; a++){ [0, 1].forEach(function(tr){ run = 1;
      for(b = 1; b < N; b++){ var x = tr ? G[b][a] : G[a][b], y = tr ? G[b - 1][a] : G[a][b - 1]; if(x === y){ run++; if(run === 5) p += 3; else if(run > 5) p++; } else run = 1; } }); }
    for(a = 0; a < N - 1; a++) for(b = 0; b < N - 1; b++){ var z = G[a][b]; if(z === G[a][b + 1] && z === G[a + 1][b] && z === G[a + 1][b + 1]) p += 3; }
    var pat = [1,0,1,1,1,0,1,0,0,0,0], pat2 = pat.slice().reverse();
    for(a = 0; a < N; a++) for(b = 0; b <= N - 11; b++){
      var h1 = 1, h2 = 1, v1 = 1, v2 = 1;
      for(k = 0; k < 11; k++){ if(G[a][b + k] !== pat[k]) h1 = 0; if(G[a][b + k] !== pat2[k]) h2 = 0; if(G[b + k][a] !== pat[k]) v1 = 0; if(G[b + k][a] !== pat2[k]) v2 = 0; }
      p += 40 * (h1 + h2 + v1 + v2); }
    var dark = 0; G.forEach(function(row){ row.forEach(function(x){ dark += x; }); });
    p += Math.floor(Math.abs(dark * 100 / (N * N) - 50) / 5) * 10;
    return p;
  }
  var best = null, bp = 1e9;
  for(var mk = 0; mk < 8; mk++){ var G = withFormat(mk), pn = penalty(G); if(pn < bp){ bp = pn; best = G; } }
  return best;
}
/* an SVG of the code with a 2-module quiet zone; px is the drawn width */
function qrSvg(text, px){
  var G = qrMatrix(text); if(!G) return "";
  var n = G.length, q = 2, d = [];
  G.forEach(function(row, r){ var c = 0; while(c < n){ if(row[c]){ var s = c; while(c < n && row[c]) c++; d.push("M" + (s + q) + " " + (r + q) + "h" + (c - s) + "v1h-" + (c - s) + "z"); } else c++; } });
  var t = n + 2 * q;
  return '<svg class="qr" width="' + px + '" height="' + px + '" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + d.join("") + '" fill="#000"/></svg>';
}

/* ---- key tags: a QR on the tag that opens the RO when scanned into the search box ---- */
function keyTagCode(ro){ return "TEC:" + String(ro.roNumber || ""); }
function keyTagHtml(ro, big){
  var I = roInfo(ro);
  return '<div class="kt'+(big ? ' big' : '')+'"><div class="kt-qr">'+qrSvg(keyTagCode(ro), big ? 170 : 108)+'</div><div class="kt-info">'
    + '<b class="kt-tag mono">'+(ro.keyTag ? esc(ro.keyTag) : '—')+'</b><span class="kt-lbl">KEY TAG</span>'
    + '<b class="kt-ro mono">'+esc(roLabel(ro))+'</b>'
    + (ro.customerName ? '<span>'+esc(ro.customerName)+'</span>' : '')
    + (ro.unitNumber ? '<span>Unit '+esc(ro.unitNumber)+'</span>' : '')
    + (ro.vin ? '<span class="mono">VIN …'+esc(String(ro.vin).slice(-8))+'</span>' : '')
    + (ro.location ? '<span>'+esc(ro.location)+'</span>' : '')
    + (warrIs(ro) ? '<i class="kt-w">WARRANTY</i>' : '') + '</div></div>';
}
/* ---- warranty readiness: how complete the paperwork is for a clean claim ---- */
function warrIs(ro){ return !!ro.warranty || (ro.operations || []).some(function(o){ return opJobType(o) === "WARR"; }); }
function warrReady(ro){
  var items = [], log = ro.bulletins || [];
  function task(id){ return log.some(function(e){ return e.task === id && (e.done || (e.files || []).length); }); }
  function add(grp, label, ok){ items.push({ grp: grp, label: label, ok: !!ok }); }
  function has(v){ return v != null && String(v).trim() !== ""; }
  var ops = (ro.operations || []).filter(function(o){ return !o.declined; }), anyParts = ops.some(function(o){ return (o.parts || []).length; });
  add("Unit", "VIN (17 characters)", String(ro.vin || "").replace(/\s/g, "").length === 17);
  add("Unit", "Mileage", has(ro.mileage));
  add("Unit", "Engine hours", has(ro.engineHours));
  add("Unit", "Warranty start date", has(ro.warrantyStart));
  add("Unit", "Build date", has(ro.buildDate));
  add("Case", "Case / tech support number", has(ro.techSupportCase) || has(ro.caseNumber));
  add("Evidence", "Dash picture", task("dashpic"));
  add("Evidence", "Pictures taken", task("pics"));
  add("Evidence", "DTCs uploaded", task("dtc"));
  if(anyParts) add("Evidence", "Failed parts tagged", task("partstag"));
  add("Approval", "Warranty approval received", task("approved"));
  ops.forEach(function(o){
    var g = "Operation · " + String(o.complaint || "no complaint").slice(0, 44);
    add(g, "Complaint written", has(o.complaint));
    add(g, "Cause and correction written", (has(o.cause) && has(o.correction)) || has(o.work));
    add(g, "Labor punched", (+o.burnt || 0) > 0);
    if((o.parts || []).length) add(g, "Part number on every part", o.parts.every(function(p){ return has(p.partNumber); }));
  });
  var ok = items.filter(function(x){ return x.ok; }).length, pct = items.length ? Math.round(100 * ok / items.length) : 0;
  return { items: items, ok: ok, n: items.length, pct: pct, tier: pct >= 90 ? "good" : (pct >= 60 ? "warn" : "bad"),
    miss: items.filter(function(x){ return !x.ok; }) };
}
/* ---- release checklist: the Release button stays locked until every line is ticked ---- */
var RELEASE_CHECK = [["road","Final road test done"],["keys","Keys back on the key board"],["clean","Truck clean, no tools or parts left in it"],["invoice","Invoice closed out"],["notify","Customer told it's ready"]];
function releaseState(ro){ if(!ro.release || typeof ro.release !== "object") ro.release = {}; return ro.release; }
function releaseReady(ro){ var r = releaseState(ro); return RELEASE_CHECK.every(function(x){ return !!r[x[0]]; }); }
/* how long since a status was set, and when it goes stale */
function ageSince(iso){ if(!iso) return null; return Math.max(0, Date.now() - new Date(iso).getTime()); }
function ageText(ms){ if(ms == null) return "—"; var h = ms / 3600000; return h < 1 ? Math.round(ms / 60000) + "m" : (h < 48 ? Math.floor(h) + "h" : Math.floor(h / 24) + "d"); }
/* how long a truck has sat without anyone clocked on it (since its last punch, else its status) */
function roIdleMs(ro){
  var last = 0;
  STATE.punches.forEach(function(p){ if(p.roId === ro.id){ var e = p.stop ? new Date(p.stop).getTime() : Date.now(); if(e > last) last = e; } });
  if(!last && ro.status && ro.status.setAt) last = new Date(ro.status.setAt).getTime();
  if(!last && ro.dateOpened) last = new Date(ro.dateOpened).getTime();
  return last ? Math.max(0, Date.now() - last) : null;
}
function staffAvHtml(sf, cls, ctx){
  var url = sf && !sf.photo ? staffPhotoUrl(sf) : "";
  var inner = sf ? (sf.photo ? '<img alt="" src="' + esc(sf.photo) + '">' : (sf.av ? avatarSvg(sf.av, sf.id + (ctx || "")) : "")) : "";
  if(url) inner += '<img class="av-ph" alt="" src="' + url + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="__tecPhotoFail(this)">';
  return '<span class="' + cls + ' avx' + (inner ? '' : ' ini') + '"' + (sf && sf.name ? ' data-tip="' + esc(sf.name + (sf.role ? ' · ' + sf.role : '')) + '"' : '') + '>' + (inner || esc(profileInitials(sf && sf.name))) + '</span>';
}
function mineOnly(){ var sf = viewAsStaff(); return !!(sf && sf.role === "Technician" && !UI.roShowAll); }
function roInScope(ro){ return !mineOnly() || techSame(ro.assignedTech, viewAsStaff().name); }
function profilePopHtml(name){
  var me = viewAsStaff(), l = staffList(), h = '';
  if(me) h += '<div class="pf-me">' + staffAvHtml(me, "pf-big", "p") + '<div><b>' + esc(me.name) + '</b><small>' + esc(me.role) + ' · ' + esc(DEPT_OF[me.role] || "") + '</small></div></div>'
    + '<div class="pf-row"><label class="btn btn-sm pf-up">Upload photo<input type="file" accept="image/*" data-photo="' + me.id + '" hidden></label>'
    + (me.photo ? '<button class="btn btn-sm" data-action="staff-photo-clear" data-id="' + me.id + '">Use initials</button>' : '') + '</div>';
  else h += '<span class="profile-pop-t">Technician</span><input type="text" data-bind="profile-name" value="' + esc(name) + '" placeholder="Your name" autocomplete="off">';
  if(l.length){
    h += '<span class="profile-pop-t">Sign in as</span>'
      + '<button class="pf-user' + (me ? '' : ' on') + '" data-action="viewas-reset"><span class="pf-sm ini">' + IC.user + '</span><span><b>Admin</b><small>Every page, every RO</small></span></button>';
    Object.keys(DEPT_OF).forEach(function(role){
      var grp = l.filter(function(sf){ return sf.role === role; }); if(!grp.length) return;
      h += '<div class="pf-dept">' + esc(DEPT_OF[role]) + '</div>' + grp.map(function(sf){
        var n = role === "Technician" ? STATE.ros.filter(function(ro){ return !roIsDone(ro) && techSame(ro.assignedTech, sf.name); }).length : 0;
        return '<button class="pf-user' + (me && me.id === sf.id ? ' on' : '') + '" data-action="viewas-set" data-id="' + sf.id + '">' + staffAvHtml(sf, "pf-sm", "p")
          + '<span><b>' + esc(sf.name) + '</b><small>' + esc(role) + (role === "Technician" ? ' · ' + n + ' open RO' + (n === 1 ? '' : 's') : '') + '</small></span></button>';
      }).join('');
    });
  } else h += '<button class="btn btn-sm btn-primary" data-action="demo-team">Create demo team</button><span class="hint">Ten people across the departments, each with a portrait.</span>';
  return h;
}
function ensureDemoTeam(){
  var made = 0;
  DEMO_TEAM.forEach(function(d){
    if(staffList().some(function(sf){ return techSame(sf.name, d.name); })) return;
    var pages = {}; (STAFF_ROLES[d.role] || []).forEach(function(pg){ pages[pg] = true; });
    staffList().push({ id: uid("st"), name: d.name, role: d.role, pages: pages, av: JSON.parse(JSON.stringify(d.av)) }); made++;
  });
  /* hand every unassigned RO to a technician, round the bench */
  var techs = staffList().filter(function(sf){ return sf.role === "Technician"; }), i = 0;
  if(techs.length) STATE.ros.forEach(function(ro){ if(!ro.assignedTech){ ro.assignedTech = techs[i % techs.length].name; i++; } });
  return made;
}
function resizePhoto(file, cb){
  var fr = new FileReader();
  fr.onload = function(){
    var im = new Image();
    im.onload = function(){
      var c = document.createElement("canvas"), n = 192; c.width = c.height = n;
      var sz = Math.min(im.width, im.height), sx = (im.width - sz) / 2, sy = (im.height - sz) / 2.6;
      c.getContext("2d").drawImage(im, sx, Math.max(0, sy), sz, sz, 0, 0, n, n);
      cb(c.toDataURL("image/jpeg", 0.86));
    };
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
}

function profileBtnHtml(){
  var name = String(STATE.techName || "");
  var initials = profileInitials(name);
  var open = !!UI.profileOpen;
  return '<div class="profile' + (open ? ' open' : '') + '" data-key="profile">'
    +   '<button class="profile-btn" data-action="toggle-profile" aria-haspopup="dialog" aria-expanded="' + (open ? 'true' : 'false') + '"'
    +     ' title="' + (viewAsStaff() ? esc(viewAsStaff().name) : (name ? esc(name) : 'Set your name')) + '">'
    +     (viewAsStaff() ? staffAvHtml(viewAsStaff(), "pf-btn", "b") : (initials ? esc(initials) : IC.user))
    +   '</button>'
    +   '<div class="profile-pop" role="dialog" aria-label="Profile">'
    +     profilePopHtml(name)
    +   '</div>'
    + '</div>';
}
function pinProfilePop(){
  var wrap = document.querySelector('.profile.open');
  if(!wrap) return;
  var btn = wrap.querySelector('.profile-btn'), pop = wrap.querySelector('.profile-pop');
  if(!btn || !pop) return;
  var a = zr(btn.getBoundingClientRect()), pad = 10, gap = 8;
  pop.style.left = '0px'; pop.style.top = '0px'; pop.style.maxHeight = '';
  var vw = window.innerWidth / ZF(), vh = window.innerHeight / ZF();
  var w = pop.offsetWidth || 260;
  var left = Math.max(pad, Math.min(a.right - w, vw - w - pad));
  var below = vh - a.bottom - gap - pad, above = a.top - gap - pad;
  var h = pop.offsetHeight || 90;
  var drop = h <= below || below >= above;
  var room = Math.max(120, drop ? below : above);
  if(h > room){ pop.style.maxHeight = Math.round(room) + 'px'; h = pop.offsetHeight; }
  var top = drop ? a.bottom + gap : a.top - gap - h;
  pop.style.left = Math.round(left) + 'px';
  pop.style.top = Math.round(Math.max(pad, Math.min(top, vh - h - pad))) + 'px';
}
window.addEventListener('resize', function(){ pinProfilePop(); });
window.addEventListener('scroll', function(){ pinProfilePop(); }, true);

/* The day, at the foot of the RO page: every punch, air, lunch and job switch — this RO's
   punches in full colour, the other ROs dimmed. Step back through the days you worked. */
/* the RO page fills the window: measure where it starts (top bar + any banner) */
function fitRoPage(){
  var rp = document.querySelector('.ro-page');
  if(!rp) return;
  var top = Math.round(rp.getBoundingClientRect().top + window.scrollY);
  if(document.documentElement.style.getPropertyValue('--ro-top') !== top + 'px') document.documentElement.style.setProperty('--ro-top', top + 'px');
  placeEdgeTab();
}
/* bottom padding only when the page really runs past the window.
   the observer only watches the page's content blocks (never .main itself, whose
   size the padding changes), and it never changes anything inside its own callback —
   it queues the check for the next frame. Changing a watched element's size inside the
   callback is what made Chrome log "ResizeObserver loop completed with undelivered
   notifications". */
var MAIN_RO = null, MAIN_RO_Q = 0;
function mainPadSoon(){
  if(MAIN_RO_Q) return;
  MAIN_RO_Q = requestAnimationFrame(function(){ MAIN_RO_Q = 0; mainPadCheck(); });
}
function mainPadCheck(){
  var m = document.querySelector('#app > .main'); if(!m) return;
  var bottom = 0;
  Array.prototype.forEach.call(m.children, function(c){
    if(getComputedStyle(c).position === 'fixed') return;
    var r = c.getBoundingClientRect(); if(r.height || r.width) bottom = Math.max(bottom, r.bottom);
  });
  var long = bottom > window.innerHeight + 1;
  if(m.classList.contains('main-long') !== long) m.classList.toggle('main-long', long);
}
/* called after every render: re-point the observer at the blocks on screen now, then check */
function fitMainPad(){
  var m = document.querySelector('#app > .main'); if(!m) return;
  if(window.ResizeObserver){
    if(!MAIN_RO) MAIN_RO = new ResizeObserver(mainPadSoon);
    var kids = Array.prototype.slice.call(m.children), seen = MAIN_RO._kids || [];
    var same = seen.length === kids.length && kids.every(function(k, i){ return k === seen[i]; });
    if(!same){ MAIN_RO.disconnect(); kids.forEach(function(k){ MAIN_RO.observe(k); }); MAIN_RO._kids = kids; }
  }
  mainPadCheck();
}
window.addEventListener('resize', function(){ mainPadSoon(); });
function placeEdgeTab(){
  var pane = document.querySelector('.ro-page .jc-pane'), et = document.querySelector('.ro-edge-tab');
  if(!pane || !et) return;
  var tb = document.querySelector('.pz-hdr') || document.querySelector('.topbar'), floor = tb ? tb.getBoundingClientRect().bottom + 8 : 8;
  et.style.top = Math.round(Math.max(floor, pane.getBoundingClientRect().top + 4)) + 'px';
}
window.addEventListener('scroll', function(){ placeEdgeTab(); }, { passive: true });
window.addEventListener('resize', function(){ fitRoPage(); });
