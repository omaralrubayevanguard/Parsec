# Parsec 16.1 (A): what removing the Assistant and the note stamps saves — Parsec_12_pre.html vs Parsec_12_a.html
import os, sys, re, gzip
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(H), "build")); sys.path.insert(0, os.path.join(H, "b8")); sys.path.insert(0, os.path.join(H, "b9"))
import clean as C, cssx
def stats(f):
    s = open(os.path.join(H, f), encoding="utf-8").read(); b = s.encode("utf-8")
    rules = 0
    for _a, a, e in C.style_blocks(s):
        rules += sum(1 for n, ctx in cssx.walk(cssx.parse(s, a, e)) if n["kind"] == "rule")
    k0 = s.index("<script>\n(function(){") if "<script>\n(function(){" in s else 0
    fns = set(re.findall(r'^function\s+([A-Za-z_$][\w$]*)', s, re.M))
    return dict(bytes=len(b), gz=len(gzip.compress(b, 9)), lines=s.count("\n") + 1, rules=rules, fns=fns)
P, A = stats("Parsec_12_pre.html"), stats("Parsec_12_a.html")
d = P["bytes"] - A["bytes"]
print("pre  %d bytes (%.1f KB) gzip %d · %d lines · %d CSS rules · %d top-level functions" % (P["bytes"], P["bytes"] / 1024, P["gz"], P["lines"], P["rules"], len(P["fns"])))
print("a    %d bytes (%.1f KB) gzip %d · %d lines · %d CSS rules · %d top-level functions" % (A["bytes"], A["bytes"] / 1024, A["gz"], A["lines"], A["rules"], len(A["fns"])))
print("saved %d bytes = %.1f KB = %.2f%% of the file · gzip %d bytes (%.1f KB, %.2f%%) · %d lines · %d CSS rules" % (d, d / 1024, 100.0 * d / P["bytes"], P["gz"] - A["gz"], (P["gz"] - A["gz"]) / 1024, 100.0 * (P["gz"] - A["gz"]) / P["gz"], P["lines"] - A["lines"], P["rules"] - A["rules"]))
gone, new = sorted(P["fns"] - A["fns"]), sorted(A["fns"] - P["fns"])
print("functions gone (%d): %s" % (len(gone), ", ".join(gone)))
print("functions new (%d): %s" % (len(new), ", ".join(new)))
