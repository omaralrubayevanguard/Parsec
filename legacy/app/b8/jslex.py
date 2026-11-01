# A small JavaScript scanner for the clean-out: finds comments, strings, template literals and regex
# literals so brace matching and comment edits never touch code inside them.
import re

KW_BEFORE_REGEX = {"return", "typeof", "case", "do", "else", "in", "instanceof", "new", "delete", "void", "throw", "yield", "await", "of"}
ID = re.compile(r"[A-Za-z_$][\w$]*")


def scan(js):
    """yield (kind, start, end) for 'comment', 'string', 'template', 'regex' spans and ('code', i, i+1) for braces.
    Template literals are yielded whole, with their ${ } code scanned recursively for nested spans."""
    out = []
    n = len(js)
    i = 0
    prev = None   # last significant token: 'id:<word>', 'num', 'punct:<c>'
    stack = []    # for templates: brace depth markers

    def regex_ok():
        if prev is None:
            return True
        if prev.startswith("punct:"):
            c = prev[6:]
            return c not in ")]}"
        if prev.startswith("id:"):
            return prev[3:] in KW_BEFORE_REGEX
        return False

    depth = 0
    while i < n:
        c = js[i]
        if c in " \t\r\n ﻿  ":
            i += 1; continue
        if c == "/" and i + 1 < n and js[i + 1] == "/":
            j = js.find("\n", i); j = n if j < 0 else j
            out.append(("comment", i, j)); i = j; continue
        if c == "/" and i + 1 < n and js[i + 1] == "*":
            j = js.find("*/", i + 2); j = n if j < 0 else j + 2
            out.append(("comment", i, j)); i = j; continue
        if c in "'\"":
            j = i + 1
            while j < n and js[j] != c:
                if js[j] == "\\": j += 1
                elif js[j] == "\n": break
                j += 1
            out.append(("string", i, j + 1)); i = j + 1; prev = "num"; continue
        if c == "`":
            j = i + 1; st = i
            while j < n:
                if js[j] == "\\": j += 2; continue
                if js[j] == "`": break
                if js[j] == "$" and j + 1 < n and js[j + 1] == "{":
                    # nested code until the matching }
                    k = j + 2; d = 1
                    sub_start = k
                    while k < n and d:
                        ch = js[k]
                        if ch in "'\"`" or (ch == "/" and k + 1 < n and js[k + 1] in "/*"):
                            # recurse: scan the inner code to skip strings/templates/comments
                            spans = scan_one(js, k)
                            k = spans; continue
                        if ch == "{": d += 1
                        elif ch == "}": d -= 1
                        k += 1
                    j = k; continue
                j += 1
            out.append(("template", st, j + 1)); i = j + 1; prev = "num"; continue
        if c == "/" and regex_ok():
            j = i + 1; cls = False
            while j < n:
                ch = js[j]
                if ch == "\\": j += 2; continue
                if ch == "\n": break
                if cls:
                    if ch == "]": cls = False
                elif ch == "[": cls = True
                elif ch == "/": break
                j += 1
            j += 1
            while j < n and (js[j].isalnum() or js[j] == "_"):
                j += 1
            out.append(("regex", i, j)); i = j; prev = "num"; continue
        m = ID.match(js, i)
        if m:
            prev = "id:" + m.group(0); i = m.end(); continue
        if c.isdigit():
            j = i + 1
            while j < n and (js[j].isalnum() or js[j] in "._"):
                j += 1
            prev = "num"; i = j; continue
        if c in "{}":
            out.append(("brace", i, i + 1))
        prev = "punct:" + c
        i += 1
    return out


def scan_one(js, k):
    """skip one string/template/comment starting at k; return index after it"""
    c = js[k]
    if c == "/" and js[k + 1] == "/":
        j = js.find("\n", k); return len(js) if j < 0 else j
    if c == "/" and js[k + 1] == "*":
        j = js.find("*/", k + 2); return len(js) if j < 0 else j + 2
    if c in "'\"":
        j = k + 1
        while j < len(js) and js[j] != c:
            if js[j] == "\\": j += 1
            j += 1
        return j + 1
    if c == "`":
        j = k + 1
        while j < len(js):
            if js[j] == "\\": j += 2; continue
            if js[j] == "`": return j + 1
            if js[j] == "$" and js[j + 1] == "{":
                kk = j + 2; d = 1
                while kk < len(js) and d:
                    ch = js[kk]
                    if ch in "'\"`" or (ch == "/" and js[kk + 1] in "/*"):
                        kk = scan_one(js, kk); continue
                    if ch == "{": d += 1
                    elif ch == "}": d -= 1
                    kk += 1
                j = kk; continue
            j += 1
        return j
    return k + 1


class Lexed:
    def __init__(self, js):
        self.js = js
        self.spans = scan(js)
        self.braces = [s for s in self.spans if s[0] == "brace"]
        self.bpos = [s[1] for s in self.braces]
        self.inert = [(s[1], s[2], s[0]) for s in self.spans if s[0] != "brace"]
        self.istart = [s[0] for s in self.inert]

    def match(self, open_at):
        """index of the } matching the { at open_at"""
        import bisect
        k = bisect.bisect_left(self.bpos, open_at)
        assert self.bpos[k] == open_at, "not a code brace"
        d = 0
        for _, p, _e in self.braces[k:]:
            if self.js[p] == "{": d += 1
            else:
                d -= 1
                if d == 0: return p
        raise ValueError("unbalanced")

    def in_inert(self, pos):
        import bisect
        k = bisect.bisect_right(self.istart, pos) - 1
        return k >= 0 and self.inert[k][0] <= pos < self.inert[k][1]

    def comments(self):
        return [(a, b) for a, b, k in self.inert if k == "comment"]
