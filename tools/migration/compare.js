// Parsec 17 migration · the proof: dist/Parsec.html means the same as the Parsec 16.3 file.
//   node compare.js <old.html> <new.html>
// Compares, ignoring comments and whitespace:
//   · the HTML outside the style/script blocks
//   · every <style> block (by id), as normalized CSS
//   · the other scripts (RO engine, QR libraries) token by token
//   · the app script: the SET of top-level function declarations (hoisted — their place doesn't matter) and the exact
//     SEQUENCE of everything else (what runs at load), token by token, with string values compared (not escapes); a
//     string over 5 KB is treated as CSS (the RO page's stylesheet) and normalized like one.
const fs = require("fs");
const acorn = require(__dirname + "/../../vendor/acorn/acorn.js");
const [, , A, B] = process.argv;
const a = fs.readFileSync(A, "utf8"), b = fs.readFileSync(B, "utf8");
let bad = 0; const say = (ok, what, detail) => { console.log((ok ? "  ok   " : "  DIFF ") + what + (detail && !ok ? " — " + detail : "")); if (!ok) bad++; };
function blocksOf(h) {
  const out = []; const sre = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m;
  while ((m = sre.exec(h))) out.push({ kind: "script", id: (m[1].match(/id="([^"]+)"/) || [])[1] || "", start: m.index, end: m.index + m[0].length, text: m[2] });
  const inS = p => out.some(x => x.kind === "script" && p >= x.start && p < x.end);
  const tre = /<style\b([^>]*)>([\s\S]*?)<\/style>/g;
  while ((m = tre.exec(h))) if (!inS(m.index)) out.push({ kind: "style", id: (m[1].match(/id="([^"]+)"/) || [])[1] || "", start: m.index, end: m.index + m[0].length, text: m[2] });
  out.sort((x, y) => x.start - y.start); return out;
}
const normCss = t => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};:,>])\s*/g, "$1").trim();
const normHtml = t => t.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
function outside(h, blocks) { let s = "", last = 0; for (const x of blocks) { s += h.slice(last, x.start) + "<" + x.kind + ":" + x.id + ">"; last = x.end; } return normHtml(s + h.slice(last)); }
const ba = blocksOf(a), bb = blocksOf(b);
say(outside(a, ba) === outside(b, bb), "the page around the blocks");
say(ba.map(x => x.kind + ":" + x.id).join() === bb.map(x => x.kind + ":" + x.id).join(), "the same blocks in the same order", ba.map(x => x.id).join() + " vs " + bb.map(x => x.id).join());
for (const x of ba) { const y = bb.find(z => z.kind === x.kind && z.id === x.id); if (!y) continue;
  if (x.kind === "style") say(normCss(x.text) === normCss(y.text), "style " + x.id, normCss(x.text).length + " vs " + normCss(y.text).length + " chars"); }
function tokens(js) {
  const out = [];
  for (const t of acorn.tokenizer(js, { ecmaVersion: "latest" })) {
    let v = t.type.label === "string" ? "s:" + (t.value.length > 5000 ? normCss(t.value) : t.value) : t.type.label === "template" ? "t:" + t.value : t.type.label === "regexp" ? "r:" + t.value.pattern + "/" + t.value.flags : t.type.label === "num" ? "n:" + t.value : (t.type.label === "name" || t.type.keyword ? "i:" + t.value : "p:" + (t.value === undefined ? t.type.label : t.value));
    out.push(v);
  }
  return out;
}
function firstDiff(x, y) { let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++; return "token " + i + ": " + JSON.stringify((x[i] || "<end>").slice(0, 80)) + " vs " + JSON.stringify((y[i] || "<end>").slice(0, 80)) + " · around: " + x.slice(Math.max(0, i - 8), i + 4).map(s => s.slice(2, 22)).join(" "); }
for (const x of ba) { if (x.kind !== "script" || x.id === "app-script" || x.id === "state-data" || !x.id) continue; const y = bb.find(z => z.id === x.id); const tx = tokens(x.text), ty = tokens(y.text); say(tx.join("\u0001") === ty.join("\u0001"), "script " + x.id, firstDiff(tx, ty)); }
// the app script
function appParts(js) {
  const ast = acorn.parse(js, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true });
  const body = ast.body[0].expression.callee.body.body; const fns = new Map(), seq = [];
  for (const n of body) { const t = tokens(js.slice(n.start, n.end)).join("\u0001"); if (n.type === "FunctionDeclaration") fns.set(n.id.name, t); else seq.push({ t, name: n.type === "VariableDeclaration" ? n.declarations.map(d => d.id.name).join(",") : n.type }); }
  return { fns, seq, head: tokens(js.slice(0, body[0].start)).join(" "), tail: tokens(js.slice(body[body.length - 1].end)).join(" ") };
}
const pa = appParts(ba.find(x => x.id === "app-script").text), pb = appParts(bb.find(x => x.id === "app-script").text);
say(pa.head === pb.head && pa.tail === pb.tail, "app: the closure's head and tail");
const onlyA = [...pa.fns.keys()].filter(k => !pb.fns.has(k)), onlyB = [...pb.fns.keys()].filter(k => !pa.fns.has(k)), changed = [...pa.fns.keys()].filter(k => pb.fns.has(k) && pa.fns.get(k) !== pb.fns.get(k));
say(!onlyA.length && !onlyB.length && !changed.length, "app: the same " + pa.fns.size + " functions, each the same", "missing " + onlyA.slice(0, 5) + " · new " + onlyB.slice(0, 5) + " · changed " + changed.slice(0, 8));
for (const k of changed.slice(0, 3)) say(false, "  function " + k, firstDiff(pa.fns.get(k).split("\u0001"), pb.fns.get(k).split("\u0001")));
let seqOk = pa.seq.length === pb.seq.length; let firstBad = -1;
for (let i = 0; i < Math.min(pa.seq.length, pb.seq.length); i++) if (pa.seq[i].t !== pb.seq[i].t) { seqOk = false; firstBad = i; break; }
say(seqOk, "app: the same " + pa.seq.length + " load-time statements, in the same order", firstBad >= 0 ? "#" + firstBad + " " + pa.seq[firstBad].name + " vs " + pb.seq[firstBad].name + " · " + firstDiff(pa.seq[firstBad].t.split("\u0001"), pb.seq[firstBad].t.split("\u0001")) : pa.seq.length + " vs " + pb.seq.length);
console.log(bad ? "\n" + bad + " difference(s)" : "\nSAME: the new build means exactly what the 16.3 file means.");
process.exit(bad ? 1 : 0);
