# A small CSS reader for the clean-out: rules, at-rules, declarations — aware of comments, strings and parentheses.
import re

NEST_AT = ("@media", "@supports", "@layer", "@container", "@document")


def _skip_comment(s, i):
    j = s.find("*/", i + 2)
    return len(s) if j < 0 else j + 2


def _skip_string(s, i):
    q = s[i]; i += 1
    while i < len(s):
        c = s[i]
        if c == "\\":
            i += 2; continue
        if c == q:
            return i + 1
        if c == "\n":
            return i + 1
        i += 1
    return i


def match_brace(s, i):
    """s[i] == '{' -> index just past the matching '}'"""
    assert s[i] == "{"
    d = 0
    n = len(s)
    while i < n:
        c = s[i]
        if c == "/" and s.startswith("/*", i):
            i = _skip_comment(s, i); continue
        if c in "\"'":
            i = _skip_string(s, i); continue
        if c == "{":
            d += 1
        elif c == "}":
            d -= 1
            if d == 0:
                return i + 1
        i += 1
    raise ValueError("unbalanced brace")


def parse(s, a=0, b=None):
    """-> list of nodes over s[a:b]. node: dict(kind, pre, start, end, bstart, bend, kids)"""
    if b is None:
        b = len(s)
    out = []
    i = a
    pre_start = None
    par = 0
    while i < b:
        c = s[i]
        if c == "/" and s.startswith("/*", i):
            i = _skip_comment(s, i); continue
        if c in "\"'":
            if pre_start is None: pre_start = i
            i = _skip_string(s, i); continue
        if c.isspace() and pre_start is None:
            i += 1; continue
        if pre_start is None:
            pre_start = i
        if c == "(":
            par += 1
        elif c == ")":
            par -= 1
        elif c == ";" and par <= 0:
            out.append(dict(kind="stmt", pre=s[pre_start:i].strip(), start=pre_start, end=i + 1))
            pre_start = None; i += 1; continue
        elif c == "{" and par <= 0:
            e = match_brace(s, i)
            pre = strip_comments(s[pre_start:i]).strip()
            node = dict(pre=pre, start=pre_start, end=e, bstart=i + 1, bend=e - 1)
            low = pre.lower()
            if low.startswith(NEST_AT):
                node["kind"] = "at"; node["kids"] = parse(s, i + 1, e - 1)
            elif low.startswith("@"):
                node["kind"] = "opaque"
            else:
                body = s[i + 1:e - 1]
                node["kind"] = "rule" if "{" not in strip_comments_strings(body) else "opaque"
            out.append(node)
            pre_start = None; par = 0; i = e; continue
        elif c == "}":
            # stray close (bad css) — skip it
            pre_start = None; i += 1; continue
        i += 1
    return out


def strip_comments(t):
    out = []; i = 0
    while i < len(t):
        if t.startswith("/*", i):
            i = _skip_comment(t, i); out.append(" "); continue
        c = t[i]
        if c in "\"'":
            j = _skip_string(t, i); out.append(t[i:j]); i = j; continue
        out.append(c); i += 1
    return "".join(out)


def strip_comments_strings(t):
    out = []; i = 0
    while i < len(t):
        if t.startswith("/*", i):
            i = _skip_comment(t, i); continue
        c = t[i]
        if c in "\"'":
            i = _skip_string(t, i); out.append('""'); continue
        out.append(c); i += 1
    return "".join(out)


def decls(body):
    """-> list of (prop, value, important, raw)"""
    body = strip_comments(body)
    res = []; i = 0; st = 0; par = 0
    while i <= len(body):
        c = body[i] if i < len(body) else ";"
        if c in "\"'" and i < len(body):
            i = _skip_string(body, i); continue
        if c == "(":
            par += 1
        elif c == ")":
            par -= 1
        elif c == ";" and par <= 0:
            raw = body[st:i].strip()
            if raw and ":" in raw:
                p, v = raw.split(":", 1)
                p = p.strip(); v = v.strip()
                imp = False
                m = re.search(r"!\s*important\s*$", v, re.I)
                if m:
                    imp = True; v = v[:m.start()].strip()
                pl = p if p.startswith("--") else p.lower()
                res.append((pl, v, imp, raw))
            st = i + 1
        i += 1
    return res


def norm_sel(sel):
    sel = strip_comments(sel)
    sel = re.sub(r"\s+", " ", sel).strip()
    sel = re.sub(r"\s*([>+~,])\s*", r"\1", sel)
    return sel


def walk(nodes, ctx=()):
    for n in nodes:
        if n["kind"] == "at":
            yield from walk(n["kids"], ctx + (re.sub(r"\s+", " ", n["pre"]),))
        else:
            yield n, ctx


def split_selectors(sel):
    """split a selector list on top-level commas"""
    out = []; d = 0; st = 0; i = 0
    while i < len(sel):
        c = sel[i]
        if c in "\"'":
            i = _skip_string(sel, i); continue
        if c in "([":
            d += 1
        elif c in ")]":
            d -= 1
        elif c == "," and d == 0:
            out.append(sel[st:i].strip()); st = i + 1
        i += 1
    out.append(sel[st:].strip())
    return [x for x in out if x]
