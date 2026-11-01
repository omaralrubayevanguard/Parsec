# Parsec 16 (A) — the data check: every kind of data the app keeps (STATE.<key>) must have a home in the folder.
# A key that is in neither the topic map (b9/v160a.js, between /*PD-MAP*/ and /*PD-MAP-END*/) nor PD_LOCAL_ONLY (with a
# reason) stops the build. At run time an unplaced key still reaches Shop/other.json, so nothing is ever lost — this makes
# sure it gets a proper home. Runs last (zzzz). Uses js, b9, LOG.
import re as _re
def pd_data_check(js_text, map_src):
    m = map_src[map_src.index("/*PD-MAP*/"):map_src.index("/*PD-MAP-END*/")]
    m = _re.sub(r"/\*.*?\*/", "", m, flags=_re.S)                       # comments don't place anything
    known, local = set(), set()
    for name, body in _re.findall(r"var (PD_\w+) = \{(.*?)\};", m, _re.S):
        if name == "PD_TOPICS": known |= set(_re.findall(r'"([A-Za-z_$][\w$]*)"', body))           # the topic files' keys
        elif name == "PD_LOCAL_ONLY": local |= set(_re.findall(r'"([A-Za-z_$][\w$]*)"\s*:', body))  # kept on this computer, with a reason
        else: known |= set(_re.findall(r'([A-Za-z_$][\w$]*)\s*:', body))                          # PD_SPLIT, PD_HOME: split by period, with the ROs, layout.json
    known |= local
    used = set(_re.findall(r'(?<![\w$.])STATE\.([A-Za-z_$][\w$]*)', js_text))
    used |= set(_re.findall(r'(?<![\w$.])STATE\[\s*["\']([A-Za-z_$][\w$]*)["\']\s*\]', js_text))
    used |= set(_re.findall(r"\bst0\(\s*'([A-Za-z_$][\w$]*)'\s*\)", js_text))
    ds = _re.search(r"function defaultState\(\)\{\s*return \{(.*?)\};", js_text, _re.S)
    if ds: used |= set(_re.findall(r"([A-Za-z_$][\w$]*)\s*:", ds.group(1)))
    used -= {"hasOwnProperty", "toString", "constructor", "valueOf"}
    missing = sorted(used - known)
    return used, missing, local
_pd_used, _pd_missing, _pd_local = pd_data_check(js, b9("v160a.js"))
if _pd_missing:
    raise SystemExit("data check failed — kinds of data with no home in the folder: " + ", ".join(_pd_missing)
                     + "\n  Put each in PD_TOPICS in b9/v160a.js (or, with a reason, in PD_LOCAL_ONLY).")
LOG.append("data check: %d kinds · %d saved · 0 left out%s" % (len(_pd_used), len(_pd_used - _pd_local), (" · %d on this computer only" % len(_pd_used & _pd_local)) if _pd_used & _pd_local else ""))
