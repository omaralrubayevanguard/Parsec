# Mock-up CSS -> app CSS: the app's themes and variables, the renamed class prefixes, and every selector held
# to the pages that use it (zero-specificity :where, so the mock-up's own cascade order stands).
import re, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "b8"))
import cssx

FRAME = (".tg-panel", ".tg-rail", ".rl-badge", ".tg .btn", ".tg :focus-visible", ".toast-fm", ".mock", ".wt-", "html,body", "body{", ".tg-app")
VARS = {"--ink-3": "--tg-ink3", "--hairline": "--tg-hair", "--ink-4": "--tg-ink4", "--ink-2": "--tg-ink2", "--status-working": "--tg-st-working", "--good-tint": "--tg-good-t"}
PFX = {"mg": "mq", "cx": "cq", "tl": "tq", "pt": "pq", "fx": "fq", "rl": "rq"}


def rename_classes(s):
    return re.sub(r'(?<![\d-])\.(mg|cx|tl|pt|fx|rl)(?=-[a-z0-9]|[^\w-])', lambda m: "." + PFX[m.group(1)], s)


def rename_js(js):
    """class names inside strings and templates: 'mg-x', "cx", `tl-row on` ... and selectors '.pt-x'"""
    js = re.sub(r'(?<=[\s"\'`.#])(mg|cx|tl|pt|fx|rl)-(?=[a-z0-9])', lambda m: PFX[m.group(1)] + "-", js)
    js = re.sub(r'(?<=class=")([^"$]*)', lambda m: re.sub(r'(?<![\w-])(mg|cx|tl|pt|fx|rl)(?![\w-])', lambda k: PFX[k.group(1)], m.group(1)), js)
    return js


def _first_compound_end(sel):
    d = 0; i = 0
    while i < len(sel):
        c = sel[i]
        if c in "([": d += 1
        elif c in ")]": d -= 1
        elif d == 0 and c in " >+~": return i
        i += 1
    return len(sel)


def scope_sel(sel, scope):
    sel = sel.strip()
    pre = ""
    m = re.match(r'(:root(?:\[[^\]]*\]|:not\([^)]*\)|:is\([^)]*\))*)\s+', sel)
    if m:
        pre, sel = m.group(1) + " ", sel[m.end():]
    if not sel or sel.startswith(("html", "body", ":root")):
        return pre + sel
    e = _first_compound_end(sel)
    comp, rest = sel[:e], sel[e:]
    k = comp.find("::")
    if k >= 0:
        comp = comp[:k] + ":where(" + scope + ")" + comp[k:]
    else:
        comp = comp + ":where(" + scope + ")"
    return pre + comp + rest


def convert(css, pages):
    css = "\n".join(l for l in css.split("\n") if not l.strip().startswith(FRAME))
    css = css.replace(':root[data-theme="dark"]', ':root[data-theme="ivd"]').replace(':root[data-theme="light"]', ':root[data-theme="ivl"]')
    for a, b in VARS.items():
        css = re.sub(r'var\(' + re.escape(a) + r'(?![\w-])', 'var(' + b, css)
    css = rename_classes(css)
    scope = ",".join('[data-pg="%s"],[data-pg="%s"] *' % (p, p) for p in pages)
    out = []

    def emit(nodes, depth):
        for n in nodes:
            if n["kind"] == "at":
                out.append(n["pre"] + "{")
                emit(n["kids"], depth + 1)
                out.append("}")
            elif n["kind"] == "rule":
                sels = cssx.split_selectors(n["pre"])
                body = css[n["bstart"]:n["bend"]].strip()
                out.append(",".join(scope_sel(x, scope) for x in sels) + "{" + body + "}")
            elif n["kind"] == "opaque":
                out.append(css[n["start"]:n["end"]])
            else:
                out.append(css[n["start"]:n["end"]])
    emit(cssx.parse(css), 0)
    return "\n".join(out)


if __name__ == "__main__":
    print(convert(open(sys.argv[1]).read(), sys.argv[2].split(","))[:3000])
