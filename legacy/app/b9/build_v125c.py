# Parsec 12.5 — the Yard on the Technician page (fork C): the code is in b9/tc1.js (tcYard, the List / Yard switch, Y) and b9/tc.css.
# It reuses the Triage yard map (tgVYard) the Foreman's Yard view shows. Runs inside build12.py: uses js, rep, LOG.
assert "function tcYard(all){" in js, "the Technician page's yard is missing"
LOG.append("Parsec 12.5: the Yard on the Technician page")
HOOK_NAMES += [n for n in ["yardSpots", "yardMap"] if n not in HOOK_NAMES]
