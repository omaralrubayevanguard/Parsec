# Parsec 12.3 (fork B): the Technician page's RO — the Time tab, icons, the operation header, tab actions, the truck line.
# The work itself is in b9/tc1.js and b9/tc.css (backups *.122).
#
# (The reason and job type colors now go in from b9/build_v123.py — see there.)
# The reason and job type colors in the main document (b9/v123.css, fork A) need two things to reach the Technician page:
# 1. they are only read through strings the scripts build (reasonVar → "var(--rc-diag)"), so the build's "custom properties
#    nothing reads" pass drops them: one throwaway declaration that reads every one keeps them (read by nothing itself, the
#    same pass removes it, and its rule with it);
# 2. older theme blocks — :root[data-theme="ivl"][data-theme] and the ivd one — declare the same names (one ink for every
#    reason) and outrank v123.css's plain :root: v123.css's blocks go in again here, one step stronger, read from the file
#    at build time so they never drift from fork A's colors. (Only the Technician page reads these in the main document;
#    the RO page has its own in its shadow root.)
# (the color vars moved to b9/build_v123.py at integration)
LOG.append("12.3 tech RO: tc1.js + tc.css (Time tab colors, in-place edits, icon buttons, header job type / status / ⋯, tab actions);")
