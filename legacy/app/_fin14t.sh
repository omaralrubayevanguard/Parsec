#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
PG_TAG=_tt python3 build12.py > _btt.log 2>&1 || { echo BUILD FAILED; tail -5 _btt.log; exit 1; }
for t in "_t14t.py t12_tt.html" "_t130c.py t12_tt.html" "_t130c.py t12_tt.html" "_t125b_127p.py t12_tt.html" "_t129.py t12_tt.html" "_t131r.py t12_tt.html" "_t130a.py t12_tt.html" "_t125c.py t12_tt.html"; do echo "=== $t"; timeout 600 python3 $t 2>&1 | grep -E "FAIL|Traceback" | head -6; done
for t in "_t122.py t12_tt.html" "_b123/_tc123.py t12_tt.html"; do echo "=== TZ $t"; TZ=Asia/Tokyo timeout 600 python3 $t 2>&1 | grep -E "FAIL|Traceback" | head -6; done
python3 _s14t.py t12_tt.html > _s14t.log 2>&1
echo "=== DONE"
