# The clean-out: code nothing calls, styles nothing matches, styles written twice, version notes.
import re, os, sys, json, subprocess, collections, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cssx, jslex

DEBUG = []
OLD_THEMES = ("mist", "atd", "glacier", "atl")


def node_check(code, label):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code); p = f.name
    r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
    os.unlink(p)
    if r.returncode:
        raise SystemExit("syntax check failed (%s):\n%s" % (label, r.stderr[:2000]))


# ---------------- JS: functions nothing calls ----------------
def js_unreferenced(js, whole):
    decl = collections.Counter(re.findall(r'(?m)^function\s+([A-Za-z_$][\w$]*)\s*\(', js))
    words = collections.Counter(re.findall(r'[A-Za-z_$][\w$]*', whole))
    return sorted(n for n in decl if words[n] <= decl[n])


def js_remove_functions(js, names, log):
    L = jslex.Lexed(js)
    cuts = []
    for name in names:
        ms = list(re.finditer(r'(?m)^function\s+' + re.escape(name) + r'\s*\(', js))
        for m in ms:
            o = js.index('{', m.end())
            assert not L.in_inert(o), name
            e = L.match(o) + 1
            s = m.start()
            # the comment right above it, when it belongs to it alone
            k = s
            while k > 0 and js[k - 1] in " \t": k -= 1
            if k > 1 and js[k - 1] == "\n":
                prevline_end = k - 1
                q = prevline_end
                if js[q - 2:q] == "*/":
                    st = js.rfind("/*", 0, q)
                    if st >= 0 and (st == 0 or js[st - 1] == "\n") and "====" not in js[st:q] and not L.in_inert(st - 1 if st else 0):
                        s = st
            if e < len(js) and js[e] == "\n": e += 1
            cuts.append((s, e, name))
    cuts.sort()
    for a, b in zip(cuts, cuts[1:]):
        assert a[1] <= b[0], ("overlap", a[2], b[2])
    node_check("\n".join(js[s:e] for s, e, _ in cuts), "removed functions")
    for s, e, name in reversed(cuts):
        log.append((name, e - s))
        js = js[:s] + js[e:]
    return js


# ---------------- CSS ----------------
def style_blocks(src):
    first_script = src.index('<script id="state-data"') if '<script id="state-data"' in src else src.index("<script")
    out = []
    for m in re.finditer(r'<style([^>]*)>', src[:first_script]):
        e = src.index("</style>", m.end())
        out.append((m.group(1), m.end(), e))
    return out


def theme_fix_selector(sel):
    """-> new selector or None when it can only match an old theme"""
    def fix_is(m):
        args = cssx.split_selectors(m.group(2))
        keep = [x for x in args if not any('data-theme="%s"' % t in x for t in OLD_THEMES)]
        if not keep:
            return "\0DEAD"
        if m.group(1) == "is" and len(keep) == 1 and re.fullmatch(r'\[data-theme="[a-z]+"\]', keep[0]):
            return keep[0]
        return ":%s(%s)" % (m.group(1), ",".join(keep))
    s2 = re.sub(r':(is|where)\(([^()]*)\)', fix_is, sel)
    if "\0DEAD" in s2:
        return None
    bare = re.sub(r':not\([^()]*\)', '', s2)
    if any('data-theme="%s"' % t in bare for t in OLD_THEMES):
        return None
    return s2


def css_edit(src, fn, label, log):
    """fn(node, ctx, selectors) -> None (keep) | [] (drop rule) | list of selectors (rewrite prelude). Edits every head style block."""
    edits = []
    n_drop = 0; n_re = 0; bytes0 = 0
    for attrs, a, b in style_blocks(src):
        nodes = cssx.parse(src, a, b)

        def visit(ns, ctx):
            nonlocal n_drop, n_re, bytes0
            alive = 0
            for n in ns:
                if n["kind"] == "at":
                    k = visit(n["kids"], ctx + (n["pre"],))
                    if k == 0 and n["kids"]:
                        edits.append((n["start"], n["end"], "")); bytes0 += n["end"] - n["start"]
                    else:
                        alive += 1
                    continue
                if n["kind"] != "rule":
                    alive += 1; continue
                sels = cssx.split_selectors(cssx.strip_comments(n["pre"]))
                r = fn(n, ctx, sels)
                if r is None:
                    alive += 1
                elif not r:
                    edits.append((n["start"], n["end"], "")); n_drop += 1; bytes0 += n["end"] - n["start"]
                else:
                    edits.append((n["start"], n["bstart"] - 1, ",".join(r))); n_re += 1; alive += 1
                    DEBUG.append((label, " , ".join(sels), " , ".join(r)))
            return alive
        visit(nodes, ())
    edits.sort()
    # nested edits: an at-rule removal swallows edits inside it
    keep = []
    for e in edits:
        if keep and e[0] < keep[-1][1]:
            if e[1] <= keep[-1][1] and keep[-1][2] == "":
                continue
            raise AssertionError(("overlap", e[:2], keep[-1][:2]))
        keep.append(e)
    for s, e, t in reversed(keep):
        src = src[:s] + t + src[e:]
    log.append("%s: %d rules out, %d selectors rewritten, %d KB" % (label, n_drop, n_re, bytes0 // 1024))
    return src


def css_old_themes(src, log):
    def fn(n, ctx, sels):
        new = [theme_fix_selector(x) for x in sels]
        if all(x == y for x, y in zip(new, sels)):
            return None
        return [x for x in new if x]
    return css_edit(src, fn, "old themes (Mist, Atd, Glacier, Atl)", log)


def css_dead_classes(src, dead, label, log):
    pat = re.compile(r'\.(' + "|".join(re.escape(c) for c in sorted(dead, key=len, reverse=True)) + r')(?![\w-])')
    def fn(n, ctx, sels):
        keep = [x for x in sels if not pat.search(re.sub(r':not\([^()]*\)', '', x))]
        return None if len(keep) == len(sels) else keep
    return css_edit(src, fn, label, log)


def css_classes(src):
    cls = collections.Counter()
    for attrs, a, b in style_blocks(src):
        for n, ctx in cssx.walk(cssx.parse(src, a, b)):
            if n["kind"] != "rule": continue
            for c in re.findall(r'\.([A-Za-z_][\w-]*)', cssx.strip_comments_strings(n["pre"])):
                cls[c] += 1
    return cls


def css_overrides(src):
    """declarations a later rule with the same selector (same @media) always beats -> [(block-start, decl raw, winner (prop, value))]"""
    rules = []
    for attrs, a, b in style_blocks(src):
        for n, ctx in cssx.walk(cssx.parse(src, a, b)):
            if n["kind"] == "rule":
                rules.append((n, tuple(re.sub(r"\s+", " ", c) for c in ctx)))
    by = collections.defaultdict(list)
    for i, (n, ctx) in enumerate(rules):
        by[(ctx, cssx.norm_sel(n["pre"]))].append(i)
    plan = []   # (rule node, [killed decl prop], [winner (prop,value)])
    for key, idx in by.items():
        if len(idx) < 2: continue
        later = {}
        for i in reversed(idx):
            n, ctx = rules[i]
            ds = cssx.decls(src[n["bstart"]:n["bend"]])
            kill = [(d, later[d[0]]) for d in ds if d[0] in later and (later[d[0]][2] or not d[2])]
            if kill:
                plan.append((n, kill))
            for d in ds:
                if d[0] not in later:
                    later[d[0]] = d
                elif d[2] and not later[d[0]][2]:
                    later[d[0]] = d
    return plan


def css_dedupe(src, ok_winner, log):
    plan = css_overrides(src)
    edits = []; nd = 0; nr = 0
    for n, kill in plan:
        kill = [(d, w) for d, w in kill if ok_winner(w[0], w[1])]
        if not kill: continue
        body = src[n["bstart"]:n["bend"]]
        ds = cssx.decls(body)
        killed = collections.Counter((d[0], d[1], d[2]) for d, w in kill)
        rest = []
        for d in ds:
            key = (d[0], d[1], d[2])
            if killed[key] > 0:
                killed[key] -= 1; nd += 1; continue
            rest.append(d[3])
        if not rest:
            edits.append((n["start"], n["end"], "")); nr += 1
        else:
            edits.append((n["bstart"], n["bend"], ";".join(rest) + ";"))
    edits.sort()
    for s, e, t in reversed(edits):
        src = src[:s] + t + src[e:]
    log.append("styles written twice: %d declarations out (%d rules emptied)" % (nd, nr))
    return src


# ---------------- version notes -> changelog ----------------
VTAG = re.compile(r'\bv(\d{2,3})[a-z]?\b')


def strip_version_notes(js, where, notes):
    L = jslex.Lexed(js)
    out = []; last = 0
    for a, b in L.comments():
        c = js[a:b]
        if not VTAG.search(c):
            continue
        vs = VTAG.findall(c)
        body = c[2:-2] if c.startswith("/*") else c[2:]
        clean = re.sub(r'\s+', ' ', body).strip(" =")
        nxt = re.match(r'\s*(?:function\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))', js[b:b + 200])
        if nxt:
            at = "on " + (nxt.group(1) or nxt.group(2))
        else:
            prv = None
            for m in re.finditer(r'(?m)^function\s+([A-Za-z_$][\w$]*)', js[max(0, a - 60000):a]):
                prv = m.group(1)
            at = ("in " + prv) if prv else ""
        clean = re.sub(r'^v\d{2,3}[a-z]?\s*[:—–-]?\s*', '', clean)
        notes.append((int(vs[0]), at, clean))
        if c.startswith("//"):
            new = re.sub(r'\s*\(?\bv\d{2,3}[a-z]?\b\)?:?\s*', ' ', c).rstrip()
            if new.strip() in ("//", ""):
                new = ""
        else:
            inner = c[2:-2]
            if re.fullmatch(r'\s*=*\s*(v\d{2,3}[a-z]?[\s,:+&·/-]*)+\s*=*\s*', inner):
                new = ""
            else:
                inner2 = re.sub(r'^(\s*)v\d{2,3}[a-z]?\s*[:—–-]\s*', r'\1', inner)            # "v181: ..." at the start
                inner2 = re.sub(r'\s*\((?:v\d{2,3}[a-z]?[,\s]*)+\)', '', inner2)                  # "(v77)"
                inner2 = re.sub(r'(?<![\w-])v\d{2,3}[a-z]?:\s*', '', inner2)                       # "v120: " mid-text
                inner2 = re.sub(r'\s*\bv\d{2,3}[a-z]?\b(?=\s*(\*|$))', '', inner2)                # trailing tag
                new = "/*" + inner2 + "*/" if inner2.strip() else ""
        out.append(js[last:a]); out.append(new); last = b
    out.append(js[last:])
    res = "".join(out)
    # tidy: a line that held only a removed comment
    res = re.sub(r'[ \t]+\n', '\n', res)
    return res


def strip_css_version_notes(css, where, notes):
    def rp(m):
        c = m.group(0)
        if not VTAG.search(c): return c
        notes.append((int(VTAG.findall(c)[0]), where, re.sub(r'^v\d{2,3}[a-z]?\s*[:—–-]?\s*', '', re.sub(r'\s+', ' ', c[2:-2]).strip(" ="))))
        inner = c[2:-2]
        inner2 = re.sub(r'^(\s*(?:=+\s*)?)v\d{2,3}[a-z]?\s*[:—–-]\s*', r'\1', inner)
        inner2 = re.sub(r'\s*\((?:v\d{2,3}[a-z]?[,\s]*)+\)', '', inner2)
        inner2 = re.sub(r'(?<![\w-])v\d{2,3}[a-z]?:\s*', '', inner2)
        return "/*" + inner2 + "*/" if inner2.strip(" =") else ""
    out = []; i = 0
    while i < len(css):
        if css.startswith("/*", i):
            j = css.find("*/", i + 2); j = len(css) if j < 0 else j + 2
            out.append(rp(re.match(r'(?s).*', css[i:j]))); i = j; continue
        c = css[i]
        if c in "\"'":
            j = cssx._skip_string(css, i); out.append(css[i:j]); i = j; continue
        out.append(c); i += 1
    return "".join(out)
