# Parsec · Tooltips — the ideas (exec'd by make.py; uses e, st, btn, kbd from it)
CAPS = json.load(open(os.path.join(H, "caps.json")))
IC = {
  "copy": '<rect x="5" y="5" width="8" height="8" rx="1.6"/><path d="M3 10.5V4.2C3 3.5 3.5 3 4.2 3h6.3"/>',
  "search": '<circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2 13 13"/>',
  "plus": '<path d="M8 3.5v9M3.5 8h9"/>',
  "scan": '<path d="M3 5.5V4c0-.6.4-1 1-1h1.5M10.5 3H12c.6 0 1 .4 1 1v1.5M13 10.5V12c0 .6-.4 1-1 1h-1.5M5.5 13H4c-.6 0-1-.4-1-1v-1.5M5.5 8h5"/>',
  "print": '<path d="M5 6V3h6v3M4 11H3V7h10v4h-1M5 9.5h6V13H5z"/>',
  "info": '<circle cx="8" cy="8" r="5.5"/><path d="M8 7.3v3.4M8 5.2v.1"/>',
}
def ib(name, cls=""): return '<span class="tt-ib %s"><svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">%s</svg></span>' % (cls, IC[name])
def kc(*keys): return '<span class="tt-k">' + "".join('<kbd>%s</kbd>' % e(k) for k in keys) + '</span>'
def tt(title, detail="", keys="", v="ink", arrow="up", style="", cls=""):
    """a tooltip drawn in place: title (+ key chips) and an optional detail line; arrow up = it hangs below its control"""
    d = ''.join('<small>%s</small>' % x for x in (detail if isinstance(detail, list) else ([detail] if detail else [])))
    return '<span class="tt %s a-%s %s" style="%s"><span class="tt-t"><b>%s</b>%s</span>%s</span>' % (v, arrow, cls, style, title, keys, d)
def native(t, style=""): return '<span class="tt-nat" style="%s">%s</span>' % (style, e(t))
def stage(inner, h=96, cls=""): return '<div class="tt-st %s" style="height:%dpx">%s</div>' % (cls, h, inner)
def at(x, y, inner): return '<span class="tt-at" style="left:%s;top:%s">%s</span>' % (x, y, inner)
def line(ctrl, tip, cap=""): return '<div class="tt-ln"><span class="c">%s</span>%s%s</div>' % (ctrl, tip, ('<span class="cp">%s</span>' % cap) if cap else '')
def rows(*R): return ''.join('<span class="tt-row"><i class="%s"></i>%s<b>%s</b></span>' % (('sw-' + c) if c else '', e(a), e(b)) for a, b, c in R)

NOW = ('<div class="tt-now">'
  + '<figure><img src="%s" alt="The Time Log’s own tip: a card that follows the mouse"><figcaption>The Time Log’s own tip · a card, follows the mouse, no delay</figcaption></figure>' % CAPS["c1_tl"]
  + '<figure><img src="%s" alt="The Manager’s KPI tip with rows"><figcaption>The Manager’s KPI tip · rows, cut at the window edge</figcaption></figure>' % CAPS["c2_mg"]
  + '<figure><img src="%s" alt="The browser’s own grey box"><figcaption>Everywhere else · the browser’s own box, after about a second, the key as “( / )”</figcaption></figure>' % CAPS["c3_native"]
  + '</div><div class="tt-nums">'
  + ''.join('<span><b>%s</b>%s</span>' % (a, b) for a, b in [
      ("≈ 560", "browser boxes (title)"), ("38", "Parsec’s own tips (Time Log, Manager, Warranty)"), ("7", "different tip styles"),
      ("4", "ways to write a key: ( / ) · (Esc) · [ · (X)"), ("30", "longer than 60 characters"), ("22", "one word — “Burnt”, “ETA”, “Close”"),
      ("80", "disabled buttons — 4 say why"), ("0", "on a phone or tablet")])
  + '</div>')

# ---------------- 1 · one look ----------------
S1 = (line(ib("copy", "hv"), tt("Copy RO number", "", kc("C"), "ink", "left"), "A · Ink")
  + line(ib("copy", "hv"), tt("Copy RO number", "", kc("C"), "card", "left"), "B · Card")
  + line(ib("copy", "hv"), tt("Copy RO number", "", kc("C"), "quiet", "left"), "C · Quiet"))
S2 = stage(
  at("8%", "16px", btn("Day report")) + at("2%", "52px", tt("Every tech, this day", "", kc("P"), "ink", "up"))
  + at("55%", "16px", btn("Day report")) + at("49%", "54px", tt("Every tech, this day", "", kc("P"), "ink", "none"))
  + '<span class="tt-cap" style="left:3%">An arrow at the button</span><span class="tt-cap" style="left:50%">No arrow · 6 px gap</span>', 112)
S3 = ('<div class="tt-time"><span class="tt-tl"><i style="left:0;width:22%" class="w"></i><i style="left:22%;width:30%" class="s"></i><i style="left:52%;width:4%" class="g"></i><i style="left:56%;width:28%" class="s"></i><i style="left:84%;width:6%" class="h"></i></span>'
  '<span class="tt-tk" style="left:0">point</span><span class="tt-tk" style="left:22%">400 ms · shows</span><span class="tt-tk" style="left:52%">next button · at once</span><span class="tt-tk" style="left:84%">off · hides</span></div>'
  '<p class="tt-mu">It sits beside the control, never under the mouse, and flips above or to the side at a window edge — so it’s never cut off.</p>')
G1 = [
  ("look", "One tooltip, the same everywhere", "Today: the browser’s grey box on most things, and six different Parsec tips.", S1,
   [("ink", "A · Ink", "dark on light, light on dark — stands out"), ("card", "B · Card", "like the Time Log’s tip now"), ("quiet", "C · Quiet", "a tinted box, no shadow"), ("skipit", "Skip", "")]),
  ("arrow", "Where it sits", "Beside its control, with or without a pointer.", S2,
   [("arrow", "With an arrow", ""), ("noarrow", "No arrow", "6 px from the control"), ("skipit", "Skip", "")]),
  ("delay", "When it shows", "Long enough not to flash while you move the mouse across the page.", S3,
   [("400", "After 400 ms, then at once between neighbours", ""), ("700", "After 700 ms", "calmer"), ("now", "Right away", "as the Time Log’s tips now"), ("skipit", "Skip", "")]),
]

# ---------------- 2 · what it says ----------------
BA = [("Search repair orders  ( / )", "Search ROs", ["/"]), ("Click to edit this part", "Edit this part", []), ("Click to change", "Change the data folder", []),
      ("Burnt", "Burnt · hours clocked on this RO", []), ("Tick to plan together  (X)", "Plan these together", ["X"]), ("Snooze (S)", "Snooze until tomorrow 07:00", ["S"]),
      ("On the clock — click to stop", "Stop the clock", ["S"])]
S4 = '<div class="tt-ba"><span class="h">Now</span><span></span><span class="h">Then</span>' + "".join(
  '<span>%s</span><span class="ar">→</span><span>%s</span>' % (native(a), tt(e(b), "", kc(*k) if k else "", "ink", "none", "position:static")) for a, b, k in BA) + '</div>'
S5 = (line(ib("plus", "hv"), tt("Add operation", "", kc("O"), "ink", "left")) + line(ib("search", "hv"), tt("Search ROs", "", kc("/"), "ink", "left"))
  + line(ib("print", "hv"), tt("Print the RO", "", kc("Ctrl", "P"), "ink", "left")))
S6 = (line(ib("copy", "hv"), tt("Copy the VIN", "1M1AN07Y5JM012345 · goes to the clipboard", "", "ink", "left"))
  + line(ib("scan", "hv"), tt("Extract operations", "Paste text or drop a screenshot", "", "ink", "left")))
RULES = [("ok", "Sentence case", "Add operation — not Add Operation"), ("ok", "Start with what it does", "Edit this part — not Click to edit this part"),
         ("ok", "Up to 60 characters; more goes on line 2", ""), ("ok", "No full stop on one line", ""), ("ok", "Keys as chips, at the end", "Search ROs  /"),
         ("ok", "Units on numbers, people by first name", "1.83 h · Luis"), ("no", "Don’t repeat the label", "a button that says Print doesn’t need “Print”")]
S7 = '<ul class="tt-rules">' + "".join('<li class="%s"><b>%s</b>%s</li>' % (c, e(a), ('<small>' + e(b) + '</small>') if b else "") for c, a, b in RULES) + '</ul>'
G2 = [
  ("words", "What it does, then the key", "Real tooltips from Parsec, rewritten.", S4,
   [("all", "Rewrite all of them this way", "≈ 560"), ("worst", "Only the worst", "“Click to …”, one-word and over 60 characters"), ("skipit", "Skip", "")]),
  ("keys", "Keys as chips", "One way to show a shortcut — four ways today.", S5,
   [("chips", "Key chips at the end", ""), ("icon", "Key chips on icon buttons only", ""), ("skipit", "Skip", "")]),
  ("two", "A title and a detail line", "When there’s more to say than the name.", S6,
   [("two", "Two lines where it helps", ""), ("one", "One line everywhere", ""), ("skipit", "Skip", "")]),
  ("rules", "Writing rules", "So new ones stay the same.", S7,
   [("rules", "Use these rules", ""), ("check", "The rules, and the build flags a tooltip that breaks one", ""), ("skipit", "Skip", "")]),
]

# ---------------- 3 · say more where it helps ----------------
S8 = stage(
  at("4%", "12px", '<span class="b sm pri tt-dis">Sign my timesheet</span>') + at("0%", "50px", tt("Not yet — 2 things to fix", ["Thu 10/29 no clock out · Wed 10/28 no lunch", "Or sign with a note"], "", "ink", "up")), 118)
S9 = stage(
  at("4%", "12px", st("wait", "Waiting – Parts", "", True)) + at("0%", "50px", tt("Waiting – Parts · since 10:42", ["2 parts on order · ETA Fri", "Set by Frank · 2 h 18 m ago"], "", "ink", "up")), 118)
S10 = stage(
  at("3%", "14px", '<span class="tt-cut">Check engine light - NOx sensor faul…</span>') + at("0%", "48px", tt("Check engine light - NOx sensor fault SPN 3226 FMI 2", "", "", "ink", "up", "", "wrap")), 90)
S11 = stage(
  at("4%", "10px", '<span class="tt-num"><small>Efficiency</small><b>82 %</b></span>') + at("0%", "58px", '<span class="tt ink a-up"><span class="tt-t"><b>Efficiency · Op 1</b></span>' + rows(("Quoted", "1.50 h", "q"), ("Burnt", "1.83 h", "b"), ("Quoted ÷ burnt", "82 %", "")) + '</span>'), 140)
S12 = stage(
  at("4%", "12px", '<span class="tt-av">LM</span>') + at("0%", "48px", tt("Luis Martinez · Technician", "On 2587 since 13:20 · 0:47", "", "ink", "up")), 104)
G3 = [
  ("dis", "Disabled buttons say why", "80 disabled buttons — 4 say why today.", S8,
   [("all", "Every disabled button", ""), ("main", "The main actions only", "sign, release, complete, start"), ("skipit", "Skip", "")]),
  ("pill", "Status pills explain themselves", "", S9,
   [("full", "Status · since when · why · who", ""), ("since", "Status and since when", ""), ("skipit", "Skip", "")]),
  ("cut", "Cut-off text shows in full", "Only when it’s actually cut.", S10,
   [("on", "Yes", "complaints, customers, part names"), ("skipit", "Skip", "")]),
  ("math", "Numbers show the math", "Efficiency, burnt vs quoted, totals.", S11,
   [("rows", "Rows, like the Manager’s KPI tips", ""), ("line", "One line: 1.50 h ÷ 1.83 h = 82 %", ""), ("skipit", "Skip", "")]),
  ("ppl", "Initials say who", "The LM / FD circles.", S12,
   [("full", "Name, role and what they’re on", ""), ("name", "Name and role", ""), ("skipit", "Skip", "")]),
]

# ---------------- 4 · touch, keyboard, how many ----------------
S13 = ('<div class="tt-ph"><div class="scr"><span class="b sm">' + 'Release without checks' + '</span>' + tt("Completes and releases", "Skips the truck checks · asks why", "", "ink", "up", "position:absolute;left:6px;top:46px") + '<span class="hand">press and hold</span></div>'
       '<div class="scr"><span class="tt-lb">Burnt <span class="tt-i">' + ib("info") + '</span></span>' + tt("Hours clocked on this RO", "", "", "ink", "up", "position:absolute;left:6px;top:46px") + '<span class="hand">tap the ⓘ</span></div></div>')
S14 = '<div class="tt-set"><span>Tooltips</span><span class="tt-seg"><i class="on">All</i><i>Fewer</i><i>Off</i></span><small>Fewer: only keys, disabled reasons and cut-off text</small></div>'
S15 = stage(at("4%", "12px", ib("copy", "hv fo")) + at("0%", "50px", tt("Copy RO number", "", kc("C"), "ink", "up")) + '<span class="tt-cap" style="left:44%;top:22px">Tab to it — it shows · Esc hides it</span>', 96)
G4 = [
  ("touch", "On a phone or tablet", "Nothing shows on touch today.", S13,
   [("hold", "Press and hold", ""), ("info", "An ⓘ on the few that matter", ""), ("both", "Both", ""), ("skipit", "Skip", "")]),
  ("amount", "Fewer for people who know Parsec", "A setting on your profile menu.", S14,
   [("set", "All · Fewer · Off", ""), ("all", "Always all", ""), ("skipit", "Skip", "")]),
  ("focus", "The keyboard shows them too", "", S15,
   [("focus", "On Tab focus too", ""), ("hover", "Mouse only", ""), ("skipit", "Skip", "")]),
]

IDEAS = [("One look", G1), ("What it says", G2), ("Say more where it helps", G3), ("Touch, keyboard, how many", G4)]
