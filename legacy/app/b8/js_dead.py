import re, sys, os, collections
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(H, sys.argv[1] if len(sys.argv) > 1 else "Parsec_7.html"), encoding="utf-8").read()
k = src.index('<script id="app-script">') + len('<script id="app-script">'); e = src.index('</script>', k)
js = src[k:e]
decl = collections.Counter(re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(', js))
words = collections.Counter(re.findall(r'[A-Za-z_$][\w$]*', src))
dead = sorted(n for n in decl if words[n] <= decl[n])
print(len(decl), "named functions;", len(dead), "never referenced")
# size of each dead function (top-level-ish: find 'function NAME(' and match braces naively, skipping strings)
def fsize(name):
    i = js.find('function ' + name + '(')
    if i < 0: return 0
    j = js.index('{', i); d = 0; p = j
    while p < len(js):
        c = js[p]
        if c in '"\'`':
            q = c; p += 1
            while p < len(js) and js[p] != q:
                if js[p] == '\\': p += 1
                p += 1
        elif c == '/' and js[p+1] == '/':
            p = js.index('\n', p)
        elif c == '/' and js[p+1] == '*':
            p = js.index('*/', p) + 1
        elif c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return p + 1 - i
        p += 1
    return -1
tot = 0
for n in dead:
    s = fsize(n); tot += max(s, 0)
    print(f"{n:32s} {s:7d}")
print("total", tot)
