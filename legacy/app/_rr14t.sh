#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t125b_127p.py t12_tt.html" "_t125c.py t12_tt.html"; do echo "=== $t"; timeout 600 python3 $t 2>&1 | grep -E "FAIL|Traceback" | head -6; done
for t in "_b123/_tc123.py t12_tt.html" "_b123/_tc123.py t12.html" "_t122.py t12_tt.html" "_t122.py t12.html"; do echo "=== TZ $t"; TZ=Asia/Tokyo timeout 600 python3 $t 2>&1 | grep -E "FAIL|Traceback" | head -6; done
for i in 1 2 3; do for f in t12.html t12_tt.html; do echo "=== _t130c $f"; timeout 600 python3 _t130c.py $f 2>&1 | grep -E "FAIL" | head -3; done; done
echo "=== DONE"
