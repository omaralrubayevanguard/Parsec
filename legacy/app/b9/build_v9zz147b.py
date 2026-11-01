# Parsec 14.7 (B) — menus that stay on screen, and Release without checks on the truck card.
# · pxPop (every RO page menu: status, op status, part status, Hold, the ⋯ menus): right edges lined up when there's no room on the
#   right, above the button when there's no room below, scrolls when taller than the window, corrected when "fixed" isn't the window.
# · The status picker's second level and a part's Move to operation › open on the left when there's no room on the right (pxSubFit).
# · The truck picture's ⋯ menu is lifted out of the card (it was cut off by the right rail) — b9/v147b.js, global.
# · Release without checks — b9/v147b_jc.js inside the RO page; styles b9/v147b.css → JC_CSS.
# Runs inside build12.py: uses js, rep, b9, json, LOG, HOOK_NAMES.
_jc0 = js.index('var JC_CSS = "'); _jc1 = js.index('";\n', _jc0)
js = js[:_jc1] + json.dumps("\n" + b9("v147b.css"))[1:-1] + js[_jc1:]
# ---- pxPop: placement
js = rep(js, "  var left = opts.alignRight ? r.right - w : r.left, top = r.bottom + 6;\n  if (top + h > vh - 8) top = Math.max(8, r.top - h - 6);\n  left = Math.max(8, Math.min(left, vw - w - 8));\n  pop.style.left = left + 'px'; pop.style.top = top + 'px'; pop.style.visibility = '';",
  "  var sc = pop.classList.contains('px-smenu') ? (pop.firstChild || pop) : pop;   /* Parsec 14.7: taller than the window, it scrolls (the status picker: its list, so the second level still shows) */\n"
  "  if (h > vh - 16) { sc.style.maxHeight = (vh - 16) + 'px'; sc.style.overflowY = 'auto'; h = pop.offsetHeight; }\n"
  "  var left = opts.alignRight ? r.right - w : r.left, top = r.bottom + 6;\n"
  "  if (opts.alignRight && left < 8) left = r.left; else if (!opts.alignRight && left + w > vw - 8) left = r.right - w;\n"
  "  if (top + h > vh - 8) top = r.top - h - 6 >= 8 ? r.top - h - 6 : Math.max(8, vh - 8 - h);\n"
  "  left = Math.max(8, Math.min(left, vw - w - 8));\n"
  "  pop.style.left = left + 'px'; pop.style.top = top + 'px'; pop.style.visibility = '';\n"
  "  var q0 = pop.getBoundingClientRect(); if (Math.abs(q0.left - left) > 0.5 || Math.abs(q0.top - top) > 0.5) { pop.style.left = (2 * left - q0.left) + 'px'; pop.style.top = (2 * top - q0.top) + 'px'; }")
# ---- the status picker's second level
js = rep(js, "    sub.style.marginTop = (it.btn.offsetTop - 6) + 'px';\n    wrap.appendChild(sub);", "    wrap.appendChild(sub); pxSubFit(sub, wrap, it.btn);   /* Parsec 14.7 */")
# ---- a part's Move to operation ›
js = rep(js, "    sub.style.position = 'absolute'; sub.style.left = '100%'; sub.style.top = '0'; sub.style.marginLeft = '6px';\n    pop.appendChild(sub);",
             "    pop.appendChild(sub); pxSubFit(sub, pop, null);   /* Parsec 14.7 */")
# ---- the RO page (JC): Release without checks, after Truck checks; afterwards the line that says it was
js = rep(js, "function ropMine(j) {", b9("v147b_jc.js") + "\nfunction ropMine(j) {")
js = rep(js, "trxOpen('checks', RO.id); } })); } } catch (er) { console.error(er); }",
             "trxOpen('checks', RO.id); } })); } } catch (er) { console.error(er); }\n  try { if (ropBypassOk()) acts.appendChild(ropBypassBtn()); } catch (er) { console.error(er); }   /* Parsec 14.7 */")
js = rep(js, "  if (tb) tb.appendChild(acts);\n", "  if (tb) tb.appendChild(acts);\n  try { var byl = ropBypassLine(RO); if (byl && tb) tb.appendChild(byl); } catch (er) { console.error(er); }   /* Parsec 14.7 */\n")
# ---- the truck picture's ⋯ menu, lifted out of the card (global)
js = rep(js, "/* ---------- adding and changing pictures ---------- */\nvar TRK_IN = null;", b9("v147b.js") + "\n/* ---------- adding and changing pictures ---------- */\nvar TRK_IN = null;")
HOOK_NAMES += ["v147Fit"]
LOG.append("Parsec 14.7 (B): menus stay on screen · Release without checks")
