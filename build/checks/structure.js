// Parsec · structure guard (run by build.py)
//   node structure.js <assembled app.js> <offsets.json>   → JSON on stdout
// The app script is one closure. This parses it and checks what the file layout can't enforce by itself:
//   · it parses at all (a syntax error is reported with the source file and line)
//   · no top-level name is declared twice (a later declaration would silently win)
//   · nothing that runs at load reads a top-level constant declared further down (it would read undefined)
//   · _head.js opens the closure, _tail.js closes it, boot/init.js is the last file before the tail
// and it describes the load order for build.py's baseline: every statement that runs at load, in sequence, as
//   "<file> · <kind> · <what>" — constants, the page closures, listeners (target + event), wrappers of shared functions.
const fs = require("fs");
const acorn = require(__dirname + "/../../vendor/acorn/acorn.js");   // the parser, vendored (MIT) so nothing has to be installed
const [, , jsPath, offPath] = process.argv;
const js = fs.readFileSync(jsPath, "utf8"), offsets = JSON.parse(fs.readFileSync(offPath, "utf8"));
const errors = [];
const lineStarts = [0]; for (let i = 0; i < js.length; i++) if (js.charCodeAt(i) === 10) lineStarts.push(i + 1);
function lineOf(pos) { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (lineStarts[m] <= pos) lo = m; else hi = m - 1; } return lo + 1; }
function fileOf(pos) { const ln = lineOf(pos); let f = offsets[0]; for (const o of offsets) { if (o[1] <= ln) f = o; else break; } return { file: f[0], line: ln - f[1] + 1 }; }
let ast;
try { ast = acorn.parse(js, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true }); }
catch (e) { const w = fileOf(e.pos || 0); console.log(JSON.stringify({ errors: ["does not parse: " + e.message.replace(/\(\d+:\d+\)$/, "") + " — src/app/" + w.file + " line " + w.line] })); process.exit(0); }
if (ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "CallExpression") errors.push("the app script must be exactly one closure: (function(){ ... })();  — check _head.js and _tail.js");
const body = ast.body.length === 1 && ast.body[0].expression && ast.body[0].expression.callee && ast.body[0].expression.callee.body ? ast.body[0].expression.callee.body.body : [];

/* ---------- names ---------- */
const declared = new Map();   // name → statement index
body.forEach((n, i) => {
  const names = n.type === "FunctionDeclaration" ? [n.id.name] : n.type === "VariableDeclaration" ? n.declarations.map(d => d.id.type === "Identifier" ? d.id.name : null).filter(Boolean) : [];
  for (const nm of names) { if (declared.has(nm)) { const a = fileOf(body[declared.get(nm)].start), b = fileOf(n.start); errors.push("declared twice: " + nm + " — src/app/" + a.file + ":" + a.line + " and src/app/" + b.file + ":" + b.line); } else declared.set(nm, i); }
});
const varIndex = new Map(); body.forEach((n, i) => { if (n.type === "VariableDeclaration") n.declarations.forEach(d => { if (d.id.type === "Identifier") varIndex.set(d.id.name, i); }); });

/* ---------- walking ---------- */
function kids(n, f) { for (const k in n) { if (k === "type" || k === "start" || k === "end") continue; const v = n[k]; if (Array.isArray(v)) { for (const x of v) if (x && typeof x.type === "string") f(x, n, k); } else if (v && typeof v.type === "string") f(v, n, k); } }
function isRef(n, p, k) {
  if (n.type !== "Identifier" || !p) return n.type === "Identifier";
  if (p.type === "MemberExpression" && k === "property" && !p.computed) return false;
  if ((p.type === "Property" || p.type === "MethodDefinition") && k === "key" && !p.computed) return p.shorthand === true;
  if (p.type === "VariableDeclarator" && k === "id") return false;
  if (/Function/.test(p.type) && (k === "id" || k === "params")) return false;
  if (p.type === "LabeledStatement" || p.type === "BreakStatement" || p.type === "ContinueStatement") return false;
  return true;
}
// what a statement does *at load*: its own expression, plus the bodies of functions it calls right away (IIFEs); not functions it only defines
// names a function declares for itself (its params, its vars, its inner functions) — a page closure's own `var IC` is not the top-level IC
function localsOf(fn) {
  const L = new Set(); fn.params.forEach(pm => { if (pm.type === "Identifier") L.add(pm.name); });
  (function w(m) { if (!m || typeof m.type !== "string") return;
    if (m.type === "VariableDeclaration") m.declarations.forEach(d => { if (d.id.type === "Identifier") L.add(d.id.name); });
    if (m.type === "FunctionDeclaration" && m.id) L.add(m.id.name);
    if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(m.type) && m !== fn) return;
    kids(m, w); })(fn.body);
  return L;
}
function atLoad(n, visit) {
  (function walk(m, p, k, locals) {
    if (!m || typeof m.type !== "string") return;
    if (visit(m, p, k, locals) === false) return;
    if (/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(m.type)) { const iife = p && p.type === "CallExpression" && k === "callee"; if (!iife) return; locals = new Set([...locals, ...localsOf(m)]); }
    kids(m, (c, pp, kk) => walk(c, pp, kk, locals));
  })(n, null, null, new Set());
}

/* ---------- the load sequence, reads-before-declaration, listeners, wrappers ---------- */
const loadSeq = []; let nl = 0, nw = 0, nf = 0;
body.forEach((n, i) => {
  if (n.type === "FunctionDeclaration") { nf++; return; }
  const where = fileOf(n.start), tags = [];
  const reads = new Set();
  atLoad(n, (m, p, k, locals) => {
    if (isRef(m, p, k) && varIndex.has(m.name) && varIndex.get(m.name) > i && !locals.has(m.name)) reads.add(m.name);
    if (m.type === "CallExpression" && m.callee.type === "MemberExpression" && !m.callee.computed && m.callee.property.name === "addEventListener") {
      const tgt = js.slice(m.callee.object.start, m.callee.object.end).replace(/\s+/g, "").slice(0, 24), ty = m.arguments[0] && m.arguments[0].type === "Literal" ? m.arguments[0].value : "?";
      const cap = m.arguments[2] ? /true|capture:\s*true/.test(js.slice(m.arguments[2].start, m.arguments[2].end)) : false;
      tags.push("on " + tgt + " " + ty + (cap ? " (capture)" : "")); nl++;
    }
    if (m.type === "AssignmentExpression" && m.left.type === "Identifier" && declared.has(m.left.name)) { tags.push("wrap " + m.left.name); nw++; }
  });
  if (reads.size) {
    for (const r of reads) { const d = fileOf(body[varIndex.get(r)].start); errors.push("reads " + r + " before it exists: src/app/" + where.file + ":" + where.line + " runs at load, but " + r + " is declared later in src/app/" + d.file + ":" + d.line); }
  }
  let what;
  if (n.type === "VariableDeclaration") what = n.kind + " " + n.declarations.map(d => d.id.type === "Identifier" ? d.id.name : "{…}").join(",");
  else if (n.type === "ExpressionStatement") { const e = n.expression; what = e.type === "CallExpression" ? (/Function/.test(e.callee.type) ? "(iife)" : js.slice(e.callee.start, Math.min(e.callee.end, e.callee.start + 40)).replace(/\s+/g, "") + "()") : e.type === "AssignmentExpression" ? "set " + js.slice(e.left.start, e.left.end).slice(0, 40) : e.type; }
  else what = n.type;
  loadSeq.push(where.file + " · " + what + (tags.length ? " · " + tags.join(", ") : ""));
});
const lastFile = offsets[offsets.length - 2][0];
if (lastFile !== "boot/init.js") errors.push("boot/init.js must be the last file in build/manifest.txt (found " + lastFile + ")");
console.log(JSON.stringify({ errors, loadSeq, n: body.length, nf, nl, nw }));
