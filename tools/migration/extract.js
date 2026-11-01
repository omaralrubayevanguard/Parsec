// Parsec 17 migration · step 1: take the Parsec 16.3 build apart.
//   node extract.js <Parsec_12.html> <t12.html> <workdir>
// Writes, under <workdir>:
//   skeleton.html      the page with every <style> and <script> block replaced by a marker
//   styles/<id>.css    each <style id> block's text (outside the scripts)
//   scripts/<id>.js    each non-app <script> (the RO engine and the two QR libraries)
//   app.js             the app script, verbatim
//   stmts.json         the main closure's statements (index, start, end, type, name) and, for the page
//                      closures, their inner statements with the closure's head and tail text
//   head.txt/tail.txt  what wraps the main closure (the top comment + "(function(){" · "})();")
//   hooks.js           the test build's extra: FS_LOCAL and window.__tg (from t12.html)
// Nothing is changed here; the mapping and the writing happen in emit.py.
const fs = require("fs"), path = require("path");
const acorn = require(__dirname + "/../../vendor/acorn/acorn.js");
const [, , prodPath, testPath, work] = process.argv;
const html = fs.readFileSync(prodPath, "utf8"), thtml = fs.readFileSync(testPath, "utf8");
fs.mkdirSync(path.join(work, "styles"), { recursive: true }); fs.mkdirSync(path.join(work, "scripts"), { recursive: true });

/* ---------- the skeleton: scripts first (styles inside them are strings, not blocks) ---------- */
const blocks = []; // {kind, id, start, end, inner0, inner1}
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m;
while ((m = scriptRe.exec(html))) { const id = (m[1].match(/id="([^"]+)"/) || [])[1] || ""; blocks.push({ kind: "script", id, attrs: m[1], start: m.index, end: m.index + m[0].length, inner0: m.index + m[0].indexOf(">") + 1, inner1: m.index + m[0].length - 9 }); }
const inScript = (p) => blocks.some(b => b.kind === "script" && p >= b.start && p < b.end);
const styleRe = /<style\b([^>]*)>([\s\S]*?)<\/style>/g;
while ((m = styleRe.exec(html))) { if (inScript(m.index)) continue; const id = (m[1].match(/id="([^"]+)"/) || [])[1] || ""; blocks.push({ kind: "style", id, attrs: m[1], start: m.index, end: m.index + m[0].length, inner0: m.index + m[0].indexOf(">") + 1, inner1: m.index + m[0].length - 8 }); }
blocks.sort((a, b) => a.start - b.start);
let out = "", last = 0, n = 0; const index = [];
for (const b of blocks) {
  out += html.slice(last, b.inner0);
  const key = b.id || (b.kind + n); n++;
  const text = html.slice(b.inner0, b.inner1);
  if (b.kind === "style") { fs.writeFileSync(path.join(work, "styles", key + ".css"), text); out += "@@STYLE:" + key + "@@"; }
  else if (b.id === "app-script") { fs.writeFileSync(path.join(work, "app.js"), text); out += "@@APP@@"; }
  else if (b.id === "state-data") { out += text; }   // the empty JSON seed stays in the page
  else { fs.writeFileSync(path.join(work, "scripts", key + ".js"), text); out += "@@SCRIPT:" + key + "@@"; }
  index.push({ kind: b.kind, id: key, attrs: b.attrs.trim(), bytes: text.length });
  last = b.inner1;
}
out += html.slice(last);
fs.writeFileSync(path.join(work, "skeleton.html"), out);
fs.writeFileSync(path.join(work, "blocks.json"), JSON.stringify(index, null, 1));

/* ---------- the app script: the main closure's statements ---------- */
const js = fs.readFileSync(path.join(work, "app.js"), "utf8");
const ast = acorn.parse(js, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true });
if (ast.body.length !== 1) throw new Error("expected one top-level statement (the closure)");
const call = ast.body[0].expression, fnBody = call.callee.body;
const body = fnBody.body;
function nameOf(n) {
  if (n.type === "FunctionDeclaration") return n.id.name;
  if (n.type === "VariableDeclaration") return n.declarations.map(d => d.id.name || "?").join(",");
  if (n.type === "ExpressionStatement") { const e = n.expression; if (e.type === "AssignmentExpression") return "=" + js.slice(e.left.start, e.left.end).slice(0, 40); if (e.type === "CallExpression") return /Function/.test(e.callee.type) ? "(iife)" : js.slice(e.callee.start, Math.min(e.callee.end, e.callee.start + 40)) + "()"; return e.type; }
  if (n.type === "ReturnStatement") return "return";
  return n.type;
}
function closureOf(n) {   // var X = (function(){ ... })();  → the function node
  if (n.type !== "VariableDeclaration" || n.declarations.length !== 1) return null;
  const d = n.declarations[0]; if (!d.init || d.init.type !== "CallExpression" || !/Function/.test(d.init.callee.type) || d.init.arguments.length) return null;
  return { name: d.id.name, fn: d.init.callee };
}
const stmts = body.map((n, i) => {
  const r = { i, start: n.start, end: n.end, type: n.type, name: nameOf(n), load: n.type !== "FunctionDeclaration" };
  const c = closureOf(n);
  if (c && c.fn.body.body.length >= 30) {
    const inner = c.fn.body.body;
    r.closure = { name: c.name, head: [n.start, inner[0].start], tail: [inner[inner.length - 1].end, n.end],
      inner: inner.map((m, j) => ({ i: j, start: m.start, end: m.end, type: m.type, name: nameOf(m) })) };
  }
  return r;
});
fs.writeFileSync(path.join(work, "stmts.json"), JSON.stringify(stmts));
fs.writeFileSync(path.join(work, "head.txt"), js.slice(0, body[0].start));
fs.writeFileSync(path.join(work, "tail.txt"), js.slice(body[body.length - 1].end));

/* ---------- the test hook: what t12.html has that Parsec_12.html hasn't, right before the closure's tail ---------- */
const tail = "})();\n</script>\n</body>";
const tk = thtml.lastIndexOf(tail), pk = html.lastIndexOf(tail);
// both files share the same text up to where the hook starts
let common = 0; const A = html.slice(0, pk), B = thtml.slice(0, tk);
while (common < A.length && A[common] === B[common]) common++;
fs.writeFileSync(path.join(work, "hooks.js"), B.slice(common));
if (A.slice(common).trim() !== "") throw new Error("the test build differs from the production build somewhere other than the hook: " + JSON.stringify(A.slice(common, common + 200)));
console.log("blocks:", index.map(b => b.kind + ":" + b.id + "(" + (b.bytes / 1024 | 0) + "K)").join(" "));
console.log("main closure statements:", stmts.length, "· closures split:", stmts.filter(s => s.closure).map(s => s.closure.name + "[" + s.closure.inner.length + "]").join(" "));
console.log("hook:", (B.length - common), "chars");
