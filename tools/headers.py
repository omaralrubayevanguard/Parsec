#!/usr/bin/env python3
"""Parsec · file headers and the area map

    python3 tools/headers.py            rewrite the generated part of every src/app file header, and docs/AREAS.md
    python3 tools/headers.py --check    only say which files lack a header (the build runs this)

Every file in src/app starts with a header like this:

    /* Parsec · pages/foreman · page.js
       The Foreman page: the header, Needs action on the left, the selected RO on top of the floor, Techs, Yard, Tomorrow.
       Flow: fmView() draws the whole page from STATE on every render(); fmHead/fmList/fmTop build its parts; clicks go to fmAct.
       ── facts (generated; run tools/headers.py to refresh) ──
       declares   fmView fmHead fmIsBatch … (24 functions)
       state      ros staff fmCfg
       uses       ro/ kit/ shell/ pages/triage pages/shared-yard
       at load    on document click · wrap render
    */

The first two or three lines are written by hand (purpose, then flow); the facts below the rule are generated here
from the parsed code: what the file declares, which STATE keys it touches, which other areas it calls into, and what
it does at load. Refresh them after moving code; the hand-written lines stay as they are.
"""
import os, sys, re, json, subprocess
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(H, *a)
APP = P("src", "app")
CHECK = "--check" in sys.argv
files = sorted(os.path.relpath(os.path.join(dp, f), APP).replace(os.sep, "/") for dp, _, fs in os.walk(APP) for f in fs if f.endswith(".js"))
HEAD_RE = re.compile(r"\A/\* Parsec · (?P<area>[^·\n]+?) · (?P<file>[^\n]+?)\n(?P<hand>(?:(?!   ── facts)[^\n]*\n)*?)(?:   ── facts[^\n]*\n(?P<facts>(?:(?!\*/)[^\n]*\n)*))?\*/\n", re.S)
missing = [f for f in files if not HEAD_RE.match(open(os.path.join(APP, f), encoding="utf-8").read())]
if CHECK:
    if missing: print("files without a header: " + ", ".join(missing)); sys.exit(1)
    print("headers: every src/app file has one"); sys.exit(0)

# ---------- the facts, from the parsed assembly ----------
r = subprocess.run([sys.executable, P("build.py"), "--no-checks"], capture_output=True, text=True)
if r.returncode: sys.exit("build first: " + r.stdout[-500:])
manifest = [l.strip() for l in open(P("build", "manifest.txt"), encoding="utf-8") if l.strip() and not l.startswith("#")]
parts, offsets, line = [], [], 1
for f in ["_head.js"] + manifest + ["_tail.js"]:
    t = open(os.path.join(APP, f), encoding="utf-8").read(); t = t if t.endswith("\n") else t + "\n"
    parts.append(t); offsets.append([f, line]); line += t.count("\n") + 1
os.makedirs(P("build", "_tmp"), exist_ok=True)
open(P("build", "_tmp", "app.js"), "w", encoding="utf-8").write("\n".join(parts)); json.dump(offsets, open(P("build", "_tmp", "offsets.json"), "w"))
FACTS_JS = r'''
const fs=require("fs"); const acorn=require(process.argv[4]);
const js=fs.readFileSync(process.argv[2],"utf8"), offsets=JSON.parse(fs.readFileSync(process.argv[3],"utf8"));
const ls=[0]; for(let i=0;i<js.length;i++) if(js.charCodeAt(i)===10) ls.push(i+1);
const lineOf=p=>{let lo=0,hi=ls.length-1; while(lo<hi){const m=(lo+hi+1)>>1; if(ls[m]<=p) lo=m; else hi=m-1;} return lo+1;};
const fileOf=p=>{const ln=lineOf(p); let f=offsets[0]; for(const o of offsets){ if(o[1]<=ln) f=o; else break;} return f[0];};
const ast=acorn.parse(js,{ecmaVersion:"latest",sourceType:"script",allowReturnOutsideFunction:true}); const body=ast.body[0].expression.callee.body.body;
const F={}; const of=f=>F[f]||(F[f]={fns:[],vars:[],load:[],refs:new Set()});
const owner=new Map();
function declare(n, inner){ const f=fileOf(n.start); if(n.type==="FunctionDeclaration"){ of(f).fns.push(n.id.name); if(!inner) owner.set(n.id.name,f);} else if(n.type==="VariableDeclaration") n.declarations.forEach(d=>{ if(d.id.type==="Identifier"){ of(f).vars.push(d.id.name); if(!inner) owner.set(d.id.name,f);} }); }
const closureOf=n=>{ if(n.type!=="VariableDeclaration"||n.declarations.length!==1) return null; const d=n.declarations[0]; return d.init&&d.init.type==="CallExpression"&&/Function/.test(d.init.callee.type)&&d.init.callee.body.body.length>=30?d.init.callee.body.body:null; };
body.forEach(n=>{ declare(n,false); const inner=closureOf(n); if(inner) inner.forEach(m=>declare(m,true)); });   // a page closure's inner functions count for the file they sit in
function kids(n,f){ for(const k in n){ if(k==="type"||k==="start"||k==="end") continue; const v=n[k]; if(Array.isArray(v)){ for(const x of v) if(x&&typeof x.type==="string") f(x,n,k);} else if(v&&typeof v.type==="string") f(v,n,k);} }
function isRef(n,p,k){ if(n.type!=="Identifier") return false; if(!p) return true; if(p.type==="MemberExpression"&&k==="property"&&!p.computed) return false; if((p.type==="Property"||p.type==="MethodDefinition")&&k==="key"&&!p.computed) return p.shorthand===true; if(p.type==="VariableDeclarator"&&k==="id") return false; if(/Function/.test(p.type)&&(k==="id"||k==="params")) return false; return true; }
function loadTags(n, f){ const tags=[];
  (function w(m,p,k,deferred){ if(!m||typeof m.type!=="string") return;
    if(!deferred&&m.type==="CallExpression"&&m.callee.type==="MemberExpression"&&!m.callee.computed&&m.callee.property.name==="addEventListener"){ const tgt=js.slice(m.callee.object.start,m.callee.object.end).replace(/\s+/g,"").slice(0,20), ty=m.arguments[0]&&m.arguments[0].type==="Literal"?m.arguments[0].value:"?"; tags.push("on "+tgt+" "+ty); }
    if(!deferred&&m.type==="AssignmentExpression"&&m.left.type==="Identifier"&&owner.has(m.left.name)) tags.push("wraps "+m.left.name);
    if(!deferred&&m.type==="CallExpression"&&m.callee.type==="Identifier"&&/^set(Interval|Timeout)$/.test(m.callee.name)) tags.push(m.callee.name==="setInterval"?"a timer":"a delayed start");
    if(/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(m.type)){ const iife=p&&p.type==="CallExpression"&&k==="callee"; if(!iife) return; }
    kids(m,(c,pp,kk)=>w(c,pp,kk,deferred)); })(n,null,null,false);
  return tags; }
body.forEach(n=>{ const f=fileOf(n.start);
  const refWalk=(node,file)=>{ const R=of(file).refs; (function w(m,p,k){ if(!m||typeof m.type!=="string") return; if(isRef(m,p,k)&&owner.has(m.name)&&owner.get(m.name)!==file) R.add(owner.get(m.name)); kids(m,w); })(node,null,null); };
  const inner=closureOf(n);
  if(inner){ inner.forEach(m=>{ const mf=fileOf(m.start); refWalk(m,mf); if(m.type!=="FunctionDeclaration") of(mf).load.push(...loadTags(m,mf)); }); of(f).load.unshift("builds "+n.declarations[0].id.name+" (a closure)"); return; }
  refWalk(n,f);
  if(n.type==="FunctionDeclaration") return; const tags=[];
  (function w(m,p,k,deferred){ if(!m||typeof m.type!=="string") return;
    if(!deferred&&m.type==="CallExpression"&&m.callee.type==="MemberExpression"&&!m.callee.computed&&m.callee.property.name==="addEventListener"){ const tgt=js.slice(m.callee.object.start,m.callee.object.end).replace(/\s+/g,"").slice(0,20), ty=m.arguments[0]&&m.arguments[0].type==="Literal"?m.arguments[0].value:"?"; tags.push("on "+tgt+" "+ty); }
    if(!deferred&&m.type==="AssignmentExpression"&&m.left.type==="Identifier"&&owner.has(m.left.name)) tags.push("wraps "+m.left.name);
    if(!deferred&&m.type==="CallExpression"&&m.callee.type==="Identifier"&&/^set(Interval|Timeout)$/.test(m.callee.name)) tags.push(m.callee.name==="setInterval"?"a timer":"a delayed start");
    if(/^(FunctionDeclaration|FunctionExpression|ArrowFunctionExpression)$/.test(m.type)){ const iife=p&&p.type==="CallExpression"&&k==="callee"; if(!iife) return; }
    kids(m,(c,pp,kk)=>w(c,pp,kk,deferred)); })(n,null,null,false);
  if(n.type==="VariableDeclaration"&&n.declarations.length===1&&n.declarations[0].init&&n.declarations[0].init.type==="CallExpression"&&/Function/.test(n.declarations[0].init.callee.type)) tags.unshift("builds "+n.declarations[0].id.name+" (a closure)");
  of(f).load.push(...tags); });
for(const f in F) F[f].refs=[...F[f].refs]; console.log(JSON.stringify(F));
'''
open(P("build", "_tmp", "facts.js"), "w").write(FACTS_JS)
r = subprocess.run(["node", P("build", "_tmp", "facts.js"), P("build", "_tmp", "app.js"), P("build", "_tmp", "offsets.json"), P("vendor", "acorn", "acorn.js")], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr[:2000])
F = json.loads(r.stdout)
PURPOSE = json.load(open(P("tools", "purposes.json"), encoding="utf-8")) if os.path.exists(P("tools", "purposes.json")) else {}

def area_of(f): return "/".join(f.split("/")[:-1]) if "/" in f else "app"
def hand_default(f, text):
    """A purpose line when none is written yet: the file's first banner, cleaned."""
    m = re.match(r"\s*/\*\s*(?:=+|-+)?\s*(.*?)\s*(?:=+|-+)?\s*(?:\*/|\n)", text, re.S)
    t = (m.group(1) if m else "").strip(" ·-=")
    return (t.split("\n")[0][:140] or f.split("/")[-1].replace(".js", "").replace("-", " ")) + "\n"
rows = {}
for f in files:
    p = os.path.join(APP, f); text = open(p, encoding="utf-8").read()
    m = HEAD_RE.match(text); hand = m.group("hand") if m else None
    body = text[m.end():] if m else text
    if f in PURPOSE: hand = "".join("   " + l.rstrip() + "\n" for l in PURPOSE[f].strip("\n").split("\n"))
    if hand is None: hand = "   " + hand_default(f, body)
    facts = F.get(f, {"fns": [], "vars": [], "load": [], "refs": []})
    L = []
    names = facts["fns"] + facts["vars"]
    if names:
        shown = " ".join(names[:12]) + (" …" if len(names) > 12 else "")
        L.append("   declares   %s (%s)" % (shown, ", ".join(x for x in ["%d function%s" % (len(facts["fns"]), "" if len(facts["fns"]) == 1 else "s") if facts["fns"] else "", "%d constant%s" % (len(facts["vars"]), "" if len(facts["vars"]) == 1 else "s") if facts["vars"] else ""] if x)))
    keys = sorted(set(re.findall(r"(?<![\w$.])STATE\.([A-Za-z_$][\w$]*)", body)) - {"hasOwnProperty"})
    if keys: L.append("   state      " + " ".join(keys[:16]) + (" …" if len(keys) > 16 else ""))
    areas = sorted({area_of(x) for x in facts["refs"]} - {area_of(f)})
    if areas: L.append("   uses       " + " ".join(a + "/" for a in areas))
    if facts["load"]:
        from collections import Counter
        c = Counter(facts["load"]); L.append("   at load    " + " · ".join((("%d× " % n) if n > 1 else "") + k for k, n in c.items())[:200])
    if f in ("_head.js", "_tail.js"): L = []
    header = "/* Parsec · %s · %s\n%s%s*/\n" % (area_of(f), f.split("/")[-1], hand, ("   ── facts (generated; run tools/headers.py to refresh) ──\n" + "\n".join(L) + "\n") if L else "")
    open(p, "w", encoding="utf-8").write(header + body.lstrip("\n"))
    rows.setdefault(area_of(f), []).append((f.split("/")[-1], hand.strip().split("\n")[0].strip(), len(body) // 1024, len(facts["fns"]), len(facts["vars"])))

# ---------- docs/AREAS.md ----------
AREA_TEXT = json.load(open(P("tools", "areas.json"), encoding="utf-8")) if os.path.exists(P("tools", "areas.json")) else {}
out = ["# Parsec · the areas and their files", "", "Generated by `python3 tools/headers.py` from the file headers — the purpose line of each file, its size and what it declares.", "Load order is `build/manifest.txt`; this page is for finding things.", ""]
for area in sorted(rows, key=lambda a: (a == "app", a)):
    out.append("## " + area + "/" + ("  — " + AREA_TEXT[area] if area in AREA_TEXT else "")); out.append("")
    out.append("| file | what it is | KB | functions | constants |"); out.append("|---|---|---:|---:|---:|")
    for fn, purpose, kb, nf, nv in sorted(rows[area]): out.append("| `%s` | %s | %d | %d | %d |" % (fn, purpose.replace("|", "\\|"), kb, nf, nv))
    out.append("")
os.makedirs(P("docs"), exist_ok=True); open(P("docs", "AREAS.md"), "w", encoding="utf-8").write("\n".join(out))
print("headers written for %d files · docs/AREAS.md · %d files have a hand-written purpose, %d use their banner" % (len(files), sum(1 for f in files if f in PURPOSE), sum(1 for f in files if f not in PURPOSE)))
