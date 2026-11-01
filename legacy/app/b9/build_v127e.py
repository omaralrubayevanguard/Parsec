# Parsec 12.7 (fork E) — change a clock while it runs: its start, stop it at an earlier time (and say why), its reason and
# operation, and the day clock's start. The shared pieces: b9/v127e.js (global). The Time tabs (b9/rop1.js, b9/tc1.js) and
# the Time Log (b9/tl1.js–tl3.js) call them directly; the clock pop-over off the sidebar (base code) is patched here.
# Runs inside build12.py: uses js, rep, b9, EXTRA_CSS, HOOK_NAMES, LOG.
js = rep(js, "\nvar PG = (function(){\n", "\n" + b9("v127e.js") + "\nvar PG = (function(){\n")
# ---- the clock pop-over: “On the clock since 07:02” gets a pencil; the time box opens under it
js = rep(js, """  h += '<div class="pxp-h"><span class="pxr-dot ' + st + '"></span><b>' + head + '</b><span class="sp"></span>' + (st === "out" ? '' : '<b class="mono" data-shift-hm>' + fmtHM(todayShiftMs()) + '</b>') + '</div>';""",
         """  h += '<div class="pxp-h"><span class="pxr-dot ' + st + '"></span><b>' + head + '</b>' + (st !== "out" && sh ? rcPxPen(sh) : '') + '<span class="sp"></span>' + (st === "out" ? '' : '<b class="mono" data-shift-hm>' + fmtHM(todayShiftMs()) + '</b>') + '</div>' + (st !== "out" && sh ? rcPxShin(sh) : '');""")
js = rep(js, '    case "px-side": pxSideToggle(); return true;\n', '    case "px-side": pxSideToggle(); return true;\n    case "px-shin": case "px-shin-x": case "px-shin-go": return rcPxAct(a);\n')
js = rep(js, '    case "px-pop": { var p = t.dataset.p; UI.pxPop = UI.pxPop === p ? null : p; UI.notifOpen = false; render(); return true; }',
         '    case "px-pop": { var p = t.dataset.p; UI.pxPop = UI.pxPop === p ? null : p; UI.pxShin = false; UI.notifOpen = false; render(); return true; }')
EXTRA_CSS.append("""/* Parsec 12.7 — the clock pop-over: change when you clocked in */
.pxp-pen{all:unset;box-sizing:border-box;cursor:pointer;display:inline-grid;place-items:center;width:24px;height:24px;margin-left:-4px;border-radius:7px;color:var(--px-ink3);}
.pxp-pen:hover,.pxp-pen.on{background:var(--px-fill);color:var(--px-ink);}
.pxp-pen:focus-visible{outline:2px solid var(--px-acc,var(--accent));outline-offset:1px;}
.pxp-pen .px-ic,.pxp-pen svg{width:12px;height:12px;}
.pxp-shin{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:-2px 0 10px;padding:8px 10px;border-radius:10px;background:var(--px-fill);font-size:12.5px;}
.pxp-shin .t{flex-basis:100%;font-size:11.5px;font-weight:500;color:var(--px-ink2);}
.pxp-shin input{box-sizing:border-box;width:128px;height:30px;padding:0 8px;border-radius:8px;border:0;background:var(--px-raised,var(--px-panel,#fff));box-shadow:inset 0 0 0 1px var(--px-hair);font:500 13px/30px var(--font-mono,ui-monospace,monospace);color:var(--px-ink);color-scheme:light dark;}
.pxp-shin input:focus{outline:none;box-shadow:inset 0 0 0 1px var(--px-acc,var(--accent)),0 0 0 3px color-mix(in srgb,var(--px-acc,var(--accent)) 22%,transparent);}
.pxp-shin small{flex-basis:100%;font-size:11.5px;color:var(--px-ink3);}
""")
HOOK_NAMES += ["rcMove", "rcTargets", "rcStopAt", "rcShiftIn", "rcShiftLimits", "rcPxAct"]
LOG.append("Parsec 12.7 (E): change a clock while it runs — its start, stop it earlier, its reason and operation, the day clock's start")
