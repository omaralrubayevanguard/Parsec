// The clean-out, with a real parser: what in the app script can never run.
//   node prune.js <app.js> <others.txt> <keep.json>   ->  JSON { cuts: [[start, end, name, kind]], ... }
// 1. action handlers no button can reach: `case "x":` in the data-action switches, and
//    `if(t.dataset.action === "x")` tests, when "x" is written nowhere else in the page
// 2. top-level functions and constants nothing reachable uses (reachability from the code that runs at load)
const fs = require("fs");
const acorn = require("/opt/node-tools/node_modules/acorn");
const [, , jsPath, otherPath, keepPath] = process.argv;
const js = fs.readFileSync(jsPath, "utf8"), others = fs.readFileSync(otherPath, "utf8");
const keep = new Set(JSON.parse(fs.readFileSync(keepPath, "utf8")));
const ast = acorn.parse(js, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true });

/* ---------- a walker that knows which identifiers are references ---------- */
function kids(n, f){
  for(const k in n){
    if(k === "type" || k === "start" || k === "end") continue;
    const v = n[k];
    if(Array.isArray(v)){ for(const x of v) if(x && typeof x.type === "string") f(x, n, k); }
    else if(v && typeof v.type === "string") f(v, n, k);
  }
}
function walk(n, visit, parent, key){
  if(visit(n, parent, key) === false) return;
  kids(n, (c, p, k) => walk(c, visit, p, k));
}
function isRef(n, p, k){
  if(n.type !== "Identifier") return false;
  if(!p) return true;
  if((p.type === "MemberExpression") && k === "property" && !p.computed) return false;
  if((p.type === "Property" || p.type === "MethodDefinition" || p.type === "PropertyDefinition") && k === "key" && !p.computed) return p.shorthand === true;
  if((p.type === "LabeledStatement" || p.type === "BreakStatement" || p.type === "ContinueStatement") && k === "label") return false;
  return true;
}
const strs = [];   // every string value in the script: [value, node]
walk(ast, n => {
  if(n.type === "Literal" && typeof n.value === "string") strs.push([n.value, n]);
  else if(n.type === "TemplateElement") strs.push([n.value.cooked || n.value.raw || "", n]);
});

/* ---------- 1. handlers no button reaches ---------- */
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const prefixes = new Set();
for(const [v] of strs){ const m = /([\w-]*-)$/.exec(v); if(m && m[1].length >= 3) prefixes.add(m[1].replace(/^.*?([\w-]+-)$/, "$1")); }
const others2 = others;
function emitted(L, selfNodes){
  if(!L || !/^[\w-]+$/.test(L)) return true;
  for(const p of prefixes) if(L.startsWith(p) && L !== p) return true;
  const re = new RegExp("(?<![\\w-])" + esc(L) + "(?![\\w-])");
  if(re.test(others2)) return true;
  for(const [v, n] of strs){ if(selfNodes.has(n)) continue; if(v.indexOf(L) >= 0 && re.test(v)) return true; }
  return false;
}
const cuts = [];
const tested = [];   // the literal nodes used as action tests
const isActionMember = e => e && e.type === "MemberExpression" && !e.computed && e.property.name === "action" && e.object.type === "MemberExpression" && !e.object.computed && e.object.property.name === "dataset";
function actionEq(test){
  if(!test) return null;
  if(test.type === "LogicalExpression" && test.operator === "&&") return actionEq(test.right) || null;
  if(test.type === "BinaryExpression" && (test.operator === "===" || test.operator === "==")){
    const [x, y] = [test.left, test.right];
    if(isActionMember(x) && y.type === "Literal" && typeof y.value === "string") return y;
    if(isActionMember(y) && x.type === "Literal" && typeof x.value === "string") return x;
  }
  return null;
}
const switches = [], ifs = [];
walk(ast, n => {
  if(n.type === "SwitchStatement" && n.discriminant.type === "Identifier" && n.discriminant.name === "a" && n.cases.filter(c => c.test && c.test.type === "Literal" && typeof c.test.value === "string").length >= 10) switches.push(n);
  if(n.type === "IfStatement" && !n.alternate){ const l = actionEq(n.test); if(l) ifs.push([n, l]); }
});
switches.forEach(s => s.cases.forEach(c => { if(c.test && c.test.type === "Literal") tested.push(c.test); }));
ifs.forEach(([n, l]) => tested.push(l));
const self = new Set(tested);
let nCase = 0, nIf = 0;
switches.forEach(s => {
  /* labels with no body fall through into the next: a group is the labels up to one with a body */
  let grp = [];
  s.cases.forEach(c => {
    grp.push(c);
    if(c.consequent.length === 0) return;
    const labels = grp.filter(x => x.test);
    const dead = labels.length === grp.length && labels.every(x => x.test.type === "Literal" && typeof x.test.value === "string" && !emitted(x.test.value, self));
    if(dead){ cuts.push([grp[0].start, c.end, grp.map(x => x.test.value).join("|"), "case"]); nCase += grp.length; }
    grp = [];
  });
});
ifs.forEach(([n, l]) => { if(!emitted(l.value, self)){ cuts.push([n.start, n.end, l.value, "if"]); nIf++; } });

/* ---------- 2. reachability of the top-level declarations ---------- */
let body = ast.body;
if(body.length === 1 && body[0].type === "ExpressionStatement"){
  let e = body[0].expression; if(e.type === "UnaryExpression") e = e.argument;
  if(e.type === "CallExpression" && (e.callee.type === "FunctionExpression" || e.callee.type === "ArrowFunctionExpression")) body = e.callee.body.body;
}
const inCut = n => cuts.some(([a, b]) => n.start >= a && n.end <= b);
function refsOf(node){
  const out = new Set();
  walk(node, (n, p, k) => {
    if(inCut(n)) return false;
    if(isRef(n, p, k)) out.add(n.name);
    else if(n.type === "Literal" && typeof n.value === "string"){ for(const w of n.value.match(/[A-Za-z_$][\w$]*/g) || []) out.add(w); }
    else if(n.type === "TemplateElement"){ for(const w of (n.value.cooked || "").match(/[A-Za-z_$][\w$]*/g) || []) out.add(w); }
  });
  return out;
}
function sideEffects(init){
  let se = false;
  walk(init, n => {
    if(se) return false;
    if(n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression" || n.type === "ClassExpression") return false;
    if(["CallExpression", "NewExpression", "AssignmentExpression", "UpdateExpression", "TaggedTemplateExpression", "AwaitExpression", "YieldExpression", "DeleteExpression"].includes(n.type)) se = true;
  });
  return se;
}
const decl = new Map();     // name -> [{node, stmt, kind}]
const roots = new Set();
const rootRefs = new Set();
const addDecl = (name, rec) => { if(!decl.has(name)) decl.set(name, []); decl.get(name).push(rec); };
body.forEach(st => {
  if(st.type === "FunctionDeclaration") addDecl(st.id.name, { node: st, stmt: st, kind: "function" });
  else if(st.type === "ClassDeclaration") addDecl(st.id.name, { node: st, stmt: st, kind: "class" });
  else if(st.type === "VariableDeclaration"){
    st.declarations.forEach(d => {
      if(d.id.type !== "Identifier"){ refsOf(d).forEach(x => rootRefs.add(x)); return; }
      const se = d.init && sideEffects(d.init);
      addDecl(d.id.name, { node: d, stmt: st, kind: "var", se });
      if(se){ roots.add(d.id.name); }
    });
  }
  else refsOf(st).forEach(x => rootRefs.add(x));
});
for(const w of others.match(/[A-Za-z_$][\w$]*/g) || []) if(decl.has(w)) rootRefs.add(w);
keep.forEach(k => rootRefs.add(k));
const graph = new Map();
decl.forEach((recs, name) => { const s = new Set(); recs.forEach(r => refsOf(r.kind === "var" ? (r.node.init || r.node) : r.node).forEach(x => s.add(x))); graph.set(name, s); });
const live = new Set(), todo = [];
const mark = n => { if(decl.has(n) && !live.has(n)){ live.add(n); todo.push(n); } };
rootRefs.forEach(mark); roots.forEach(mark);
while(todo.length){ const n = todo.pop(); (graph.get(n) || new Set()).forEach(mark); }
const deadStmts = new Map();
decl.forEach((recs, name) => {
  if(live.has(name)) return;
  recs.forEach(r => {
    if(r.kind === "var"){
      const allDead = r.stmt.declarations.every(d => d.id.type === "Identifier" && !live.has(d.id.name) && !(d.init && sideEffects(d.init)));
      if(allDead) deadStmts.set(r.stmt, r.stmt.declarations.map(d => d.id.name).join(","));
    } else deadStmts.set(r.stmt, name);
  });
});
deadStmts.forEach((name, st) => { if(!inCut(st)) cuts.push([st.start, st.end, name, st.type === "FunctionDeclaration" ? "function" : "var"]); });
/* ---------- 3. the same inside every function: helpers a module or a function declares and never uses ---------- */
let nInner = 0;
function scopeBody(fn){ return fn.body && fn.body.type === "BlockStatement" ? fn.body.body : null; }
function pruneScope(stmts){
  const d = new Map(), rr = new Set();
  const add = (name, rec) => { if(!d.has(name)) d.set(name, []); d.get(name).push(rec); };
  stmts.forEach(st => {
    if(st.type === "FunctionDeclaration") add(st.id.name, { node: st, stmt: st, kind: "function" });
    else if(st.type === "VariableDeclaration"){
      st.declarations.forEach(dc => {
        if(dc.id.type !== "Identifier" || (dc.init && sideEffects(dc.init))){ refsOf(dc).forEach(x => rr.add(x)); if(dc.id.type === "Identifier") rr.add(dc.id.name); return; }
        add(dc.id.name, { node: dc, stmt: st, kind: "var" });
      });
    }
    else refsOf(st).forEach(x => rr.add(x));
  });
  const g = new Map(); d.forEach((recs, name) => { const s2 = new Set(); recs.forEach(r => refsOf(r.kind === "var" ? (r.node.init || r.node) : r.node).forEach(x => { if(x !== name) s2.add(x); })); g.set(name, s2); });
  const lv = new Set(), td = []; const mk = n => { if(d.has(n) && !lv.has(n)){ lv.add(n); td.push(n); } };
  rr.forEach(mk); while(td.length){ const n = td.pop(); (g.get(n) || new Set()).forEach(mk); }
  d.forEach((recs, name) => { if(lv.has(name)) return; recs.forEach(r => {
    if(inCut(r.stmt)) return;
    if(r.kind === "var"){ if(r.stmt.declarations.every(dc => dc.id.type === "Identifier" && !lv.has(dc.id.name) && !(dc.init && sideEffects(dc.init)))){ cuts.push([r.stmt.start, r.stmt.end, name, "inner"]); nInner++; } }
    else { cuts.push([r.stmt.start, r.stmt.end, name, "inner"]); nInner++; } }); });
}
walk(ast, n => {
  if(inCut(n)) return false;
  if((n.type === "FunctionExpression" || n.type === "FunctionDeclaration" || n.type === "ArrowFunctionExpression") && scopeBody(n)){
    const b = scopeBody(n); if(b !== body) pruneScope(b);
  }
});
cuts.sort((a, b) => a[0] - b[0]);
/* nested cuts: keep the outer one */
const out = [];
for(const c of cuts){ const last = out[out.length - 1]; if(last && c[0] < last[1]){ if(c[1] > last[1]) last[1] = c[1]; continue; } out.push(c); }
process.stdout.write(JSON.stringify({ cuts: out, cases: nCase, ifs: nIf, inner: nInner, decls: decl.size, live: live.size }));
