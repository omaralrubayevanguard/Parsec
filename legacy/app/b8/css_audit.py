# Count what the clean-out would take out of Parsec_7's styles (read only).
import sys, re, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cssx

H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(H, sys.argv[1] if len(sys.argv) > 1 else "Parsec_7.html"), encoding="utf-8").read()
first_script = src.index("<script")
blocks = []
for m in re.finditer(r'<style([^>]*)>', src[:first_script]):
    e = src.index("</style>", m.end())
    blocks.append((m.group(1), m.end(), e))
OLD = ("mist", "atd", "glacier", "atl")
tot_rules = 0; dead_theme = 0; part_theme = 0; dead_bytes = 0
by_block = collections.Counter()
allrules = []
for bi, (attrs, a, b) in enumerate(blocks):
    nodes = cssx.parse(src, a, b)
    for n, ctx in cssx.walk(nodes):
        if n["kind"] != "rule":
            continue
        tot_rules += 1
        sels = cssx.split_selectors(cssx.strip_comments(n["pre"]))
        allrules.append((bi, n, ctx, sels))
        def dead(sel):
            s2 = re.sub(r':is\(([^()]*)\)', lambda m: ':is(' + ','.join(x for x in m.group(1).split(',') if not any('"%s"' % o in x for o in OLD)) + ')', sel)
            if ':is()' in s2: return True
            s3 = re.sub(r':not\([^()]*\)', '', s2)
            return any('data-theme="%s"' % o in s3 for o in OLD)
        d = [dead(x) for x in sels]
        if all(d):
            dead_theme += 1; dead_bytes += n["end"] - n["start"]; by_block[attrs] += 1
        elif any(d):
            part_theme += 1
print("style blocks", len(blocks), "rules", tot_rules)
print("old-theme rules dead", dead_theme, "bytes", dead_bytes, "partly", part_theme)
print(by_block.most_common(30))

# ---- coverage: what's left between nodes should be only whitespace and comments
gaps = 0
for bi, (attrs, a, b) in enumerate(blocks):
    nodes = cssx.parse(src, a, b)
    def chk(ns, lo, hi):
        global gaps
        p = lo
        for n in ns:
            g = cssx.strip_comments(src[p:n["start"]]).strip()
            if g: gaps += 1; print("GAP", attrs, repr(g[:80]))
            if n["kind"] == "at": chk(n["kids"], n["bstart"], n["bend"])
            p = n["end"]
        g = cssx.strip_comments(src[p:hi]).strip()
        if g: gaps += 1; print("GAP end", attrs, repr(g[:80]))
    chk(nodes, a, b)
print("gaps", gaps)
kinds = collections.Counter()
for bi, (attrs, a, b) in enumerate(blocks):
    for n, ctx in cssx.walk(cssx.parse(src, a, b)):
        kinds[n["kind"]] += 1
        if n["kind"] == "opaque": kinds["op:" + n["pre"].split()[0]] += 1
print(kinds)

# ---- duplicates: same context + same selector list
seen = collections.defaultdict(list)
for i, (bi, n, ctx, sels) in enumerate(allrules):
    key = (ctx, cssx.norm_sel(n["pre"]))
    seen[key].append(i)
multi = {k: v for k, v in seen.items() if len(v) > 1}
print("selectors defined more than once", len(multi), "extra copies", sum(len(v) - 1 for v in multi.values()))
exact = 0; exact_b = 0; prop_rm = 0; rule_empty = 0
for k, idx in multi.items():
    later = {}
    for i in reversed(idx):
        bi, n, ctx, sels = allrules[i]
        body = src[n["bstart"]:n["bend"]]
        ds = cssx.decls(body)
        kill = [d for d in ds if d[0] in later and (later[d[0]] or not d[2])]
        if ds and len(kill) == len(ds): rule_empty += 1; exact_b += n["end"] - n["start"]
        prop_rm += len(kill)
        for d in ds:
            later[d[0]] = later.get(d[0], False) or d[2]
print("rules fully overridden by a later copy", rule_empty, "bytes", exact_b, "declarations overridden", prop_rm)
