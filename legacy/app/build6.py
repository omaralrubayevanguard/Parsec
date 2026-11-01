"""v180: Parsec_5 -> Parsec_6.
- Themes: the design system's Ivory (light) and Graphite (dark) are the only looks. The theme
  picker and the theme button switch between the two; an old saved look (Night, Light,
  Terminator) opens in the matching one instead.
- With the side menu, nothing sits across the top of the window, so the top-bar height that
  sticky lists and headers measure from is 0 (it was the side menu's full height, which
  squashed the Warranty and Fixes lists to nothing and pushed the Time Log header off screen).
"""
import os, sys, re
H = os.path.dirname(os.path.abspath(__file__))

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, (a[:90], c)
    return s.replace(a, b)

def patch(src):
    # ---------- themes: Ivory and Graphite only ----------
    src = rep(src, 'var THEME = "mist";\n', 'var THEME = "ivl";\n')
    src = rep(src, 'function resolvedTheme(){\n  return THEME_IDS.indexOf(THEME) > -1 ? THEME : "mist";\n}',
                   '/* v180: Ivory and Graphite are the only looks now — an old saved one opens in the matching one */\n'
                   'var THEME_OLD = { mist: "ivd", atd: "ivd", glacier: "ivl", atl: "ivl" };\n'
                   'function resolvedTheme(){\n  return THEME === "ivd" ? "ivd" : "ivl";\n}')
    src = rep(src, '  THEME = THEME_IDS.indexOf(mode) > -1 ? mode : "mist";   /* an old saved theme falls back to Mist */\n',
                   '  mode = THEME_OLD[mode] || mode; THEME = mode === "ivd" ? "ivd" : "ivl";   /* v180 */\n')
    src = rep(src, '  try{ if(!localStorage.getItem("tec_at3k_try")){ localStorage.setItem("tec_at3k_try", "1"); saved = "atl"; } }catch(e){}   /* v174: open in the AssistTerminator3000 look once */\n'
                   '  try{ if(!localStorage.getItem("tec_iv_try")){ localStorage.setItem("tec_iv_try", "1"); saved = "ivl"; } }catch(e){}   /* v175: open in Ivory once */\n'
                   '  applyTheme(saved || "mist");\n',
                   '  applyTheme(saved || "ivl");   /* v180 */\n')
    src = rep(src, '    theme: "mist",\n', '    theme: "ivl",\n')
    src = rep(src, 'theme: STATE.theme || "mist",', 'theme: STATE.theme || "ivl",')
    src = rep(src, 'var THEME_ORDER = ["mist","glacier"];', 'var THEME_ORDER = ["ivl","ivd"];   /* v180: the design system\'s light and dark */')
    src = rep(src, 'var THEME_ICON = { mist:THEME_ICON_LIGHT, glacier:THEME_ICON_LIGHT };',
                   'var THEME_ICON = { ivl:THEME_ICON_LIGHT, ivd:THEME_ICON_DARK };')
    src = rep(src, '/* v143: two theme tiles — Mist and Glacier */', '/* v180: two theme tiles — Ivory and Graphite */')

    # ---------- the top-bar height when the menu is down the side ----------
    src = rep(src, "function hdrStuckH(){\n  var pz = document.querySelector('.pz-hdr');\n",
                   "function hdrStuckH(){\n  var pz = document.querySelector('.pz-hdr');\n"
                   "  if(pz && getComputedStyle(pz).position === 'fixed' && pz.getBoundingClientRect().width < window.innerWidth / 2) return 0;   /* v180: the side menu — nothing across the top */\n")
    # ---------- Large and Shop floor sizes zoom the page; full-height panels divide by the zoom ----------
    css = """
/* v180: Large and Shop floor zoom the whole page, and the zoom scales 100vh too — so a panel
   sized to the window came out taller than the window. These divide by the zoom. */
:root{--zf:1;}
html[data-size=large]{--zf:1.15;}
html[data-size=floor]{--zf:1.35;}
#app{min-height:calc(100vh / var(--zf));}
html[data-size=large],html[data-size=floor]{--page-min-h:calc(100dvh / var(--zf));}
:root:is([data-theme="ivl"],[data-theme="ivd"]):not([data-device="phone"]) .main{min-height:calc(100vh / var(--zf) - 16px);}
:root:is([data-theme="ivl"],[data-theme="ivd"]):not([data-device="phone"]) .main.v-triage,
:root:is([data-theme="ivl"],[data-theme="ivd"]):not([data-device="phone"]) .main.v-foreman{height:calc(100vh / var(--zf) - 16px) !important;}
:root:is([data-theme="ivl"],[data-theme="ivd"]):not([data-device="phone"]) .pz-hdr .pnav-set-pop{max-height:calc(100vh / var(--zf) - 24px) !important;}
:root:is([data-theme="ivl"],[data-theme="ivd"]):not([data-device="phone"]) .iv-side :is(.notif-pop,.profile-pop){max-height:calc(100vh / var(--zf) - 24px) !important;}
.ro-list{max-height:calc(100vh / var(--zf) - var(--tb-h,64px) - 28px);}
.ro-page > .ro-list{height:calc(100dvh / var(--zf) - var(--tb-h,64px) - 36px);}
.tg-srpop{max-height:calc(100vh / var(--zf) - 160px);}
"""
    # the RO page lives in its own shadow root; --zf reaches it because custom properties inherit
    zf = ('/* v180: Large and Shop floor zoom the page - full-height pieces divide by the zoom */'
          ':host(.th-iv:not([data-device="phone"])) .page.roB.roB.roB.ivB { min-height: calc(100vh / var(--zf, 1) - 16px); }'
          ':host(.th-iv:not([data-device="phone"])) .page.roB.roB.roB.ivB > .ivD { height: calc(100vh / var(--zf, 1) - 16px); }'
          '.pxr { height: calc(100vh / var(--zf, 1) - 16px); }'
          '.roCol { max-height: calc(100vh / var(--zf, 1) - var(--jcTop, 0px) + 12px); }'
          '.page.soloMode .card { min-height: calc(100vh / var(--zf, 1) - 90px); }'
          '.attBox { height: calc(92vh / var(--zf, 1)); }'
          '.px-modal { max-height: calc(86vh / var(--zf, 1)); }')
    src = rep(src, "JC_CSS += ROAD_CSS;\n", "JC_CSS += ROAD_CSS;\nvar JC_ZF = '" + zf + "';\n")
    src = rep(src, "R2.innerHTML = '<style>' + JC_CSS + '</style>", "R2.innerHTML = '<style>' + JC_CSS + JC_ZF + '</style>")
    src = rep(src, "R.innerHTML = '<style>' + JC_CSS + '</style>", "R.innerHTML = '<style>' + JC_CSS + JC_ZF + '</style>")
    k = src.index('<style id="v179fm">'); e = src.index("</style>", k) + len("</style>")
    src = src[:e] + '\n<style id="v180">' + css + '</style>' + src[e:]
    return src

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(H, "Parsec_6.html")
    a = patch(open(os.path.join(H, "Parsec_5.html"), encoding="utf-8").read())
    open(out, "w", encoding="utf-8").write(a)
    t = patch(open(os.path.join(H, "t5.html"), encoding="utf-8").read())
    open(os.path.join(H, "t6.html"), "w", encoding="utf-8").write(t)
    print("built", out, len(a))
