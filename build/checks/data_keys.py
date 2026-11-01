# Parsec · data guard (run by build.py): every kind of data the app keeps (STATE.<key>) has a home in the data store.
#   python3 data_keys.py <assembled app.js>
# The topic map is src/app/data/store-topics.js, between /*PD-MAP*/ and /*PD-MAP-END*/: PD_TOPICS (which Shop/<topic>
# file holds which keys), PD_SPLIT (split by month or year), PD_HOME (with the ROs, or layout.json) and PD_LOCAL_ONLY
# (kept on this computer, each with a reason). A STATE key in none of them stops the build. At run time an unplaced
# key still reaches Shop/other.json, so nothing is lost — this makes sure every key gets a proper home, and that an
# export for the server carries it.
import re, sys
js = open(sys.argv[1], encoding="utf-8").read()
m = js[js.index("/*PD-MAP*/"):js.index("/*PD-MAP-END*/")]
m = re.sub(r"/\*.*?\*/", "", m, flags=re.S)
known, local = set(), set()
for name, body in re.findall(r"var (PD_\w+) = \{(.*?)\};", m, re.S):
    if name == "PD_TOPICS": known |= set(re.findall(r'"([A-Za-z_$][\w$]*)"', body))
    elif name == "PD_LOCAL_ONLY": local |= set(re.findall(r'"([A-Za-z_$][\w$]*)"\s*:', body))
    else: known |= set(re.findall(r'([A-Za-z_$][\w$]*)\s*:', body))
known |= local
used = set(re.findall(r'(?<![\w$.])STATE\.([A-Za-z_$][\w$]*)', js))
used |= set(re.findall(r'(?<![\w$.])STATE\[\s*["\']([A-Za-z_$][\w$]*)["\']\s*\]', js))
used |= set(re.findall(r"\bst0\(\s*'([A-Za-z_$][\w$]*)'\s*\)", js))
ds = re.search(r"function defaultState\(\)\{\s*return \{(.*?)\};", js, re.S)
if ds: used |= set(re.findall(r"([A-Za-z_$][\w$]*)\s*:", ds.group(1)))
used -= {"hasOwnProperty", "toString", "constructor", "valueOf"}
missing = sorted(used - known)
if missing:
    print("data check FAILED — kinds of data with no home in the data store: " + ", ".join(missing))
    print("  give each a topic in PD_TOPICS (src/app/data/store-topics.js), or a reason in PD_LOCAL_ONLY")
    sys.exit(1)
print("data check: %d kinds · %d saved · 0 left out%s" % (len(used), len(used - local), (" · %d on this computer only" % len(used & local)) if used & local else ""))
