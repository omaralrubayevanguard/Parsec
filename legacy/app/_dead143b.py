import re, sys
sys.path.insert(0, 'b8'); import jslex
p = 'b9/tc1.js'; s = open(p).read()
def spans(js):
    return [(a, b) for k, a, b in jslex.scan(js) if k in ('comment','string','template','regex')]
def match(js, i, SP):
    # i at '{'; return index after the matching '}'
    d = 0; j = i; k = 0; n = len(js)
    sp = sorted(SP); si = 0
    while j < n:
        while si < len(sp) and sp[si][1] <= j: si += 1
        if si < len(sp) and sp[si][0] <= j < sp[si][1]: j = sp[si][1]; continue
        c = js[j]
        if c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return j + 1
        j += 1
    raise Exception('no match')
def decls(js):
    SP = spans(js); out = {}
    for m in re.finditer(r'^  function (\w+)\(', js, re.M):
        # find the body's '{' after the params' ')'
        k = m.end(); d = 1
        while d: 
            c = js[k]; d += (c == '(') - (c == ')'); k += 1
        b = js.index('{', k)
        try: e = match(js, b, SP)
        except Exception: print('skip', m.group(1)); continue
        while e < len(js) and js[e] in ' \t': e += 1
        if e < len(js) and js[e] == '\n': e += 1
        out[m.group(1)] = (m.start(), e)
    for nm in ['TC_BL']:
        m = re.search(r'^  const ' + nm + r' = \{', js, re.M)
        if m:
            b = js.index('{', m.start()); e = match(js, b, SP); e = js.index('\n', e) + 1; out[nm] = (m.start(), e)
    return out
a0 = s.index('  function tcParseFc'); a1 = s.index('  function tcSelClear')
cand = None
removed = []
while True:
    D = decls(s); a0 = s.index('  /* ---------- the RO on the right') if '  /* ---------- the RO on the right' in s else a0
    a1 = s.index('  function tcSelClear')
    region = [n for n, (x, y) in D.items() if x >= s.index('  function tcSent') and y <= a1 and n not in ('tcSent', 'tcList')]
    if cand is None: cand = set(region)
    gone = None
    for n in sorted(region):
        x, y = D[n]; rest = s[:x] + s[y:]
        if not re.search(r'\b' + n + r'\b', rest): gone = n; break
    if not gone: break
    x, y = D[gone]; s = s[:x] + s[y:]; removed.append(gone)
s = re.sub(r"^  const TC_MID = \[[^\n]*\n", "", s, flags=re.M); s = re.sub(r"^  const TC_RIGHT = \[[^\n]*\n", "", s, flags=re.M)
open(p, 'w').write(s); print(len(removed), removed)
