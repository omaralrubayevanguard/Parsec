#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t14t.py t12_tt.html" "_t131r.py t12_tt.html" "_t130.py t12_tt.html" "_t130a.py t12_tt.html" "_t130b.py t12_tt.html" "_t130c.py t12_tt.html" "_t129.py t12_tt.html" "_t128.py t12_tt.html" "_t127t.py t12_tt.html" "_t127p.py t12_tt.html" "_t127f.py t12_tt.html" "_t127e.py t12_tt.html" "_t126.py t12_tt.html" "_t125_127p.py t12_tt.html" "_t124_127p.py t12_tt.html" "_t125b_127p.py t12_tt.html" "_t125c.py t12_tt.html" "_t125d.py t12_tt.html" "_b123/_tc123.py t12_tt.html" "_c123/_t123c_day.py t12_tt.html" "_t122.py t12_tt.html" "_t121.py t12_tt.html" "_t132a.py t12_tt.html"; do
  n=$(basename ${t%% *} .py)
  echo "=== $t"; timeout 600 python3 $t > "_rt14_$n.log" 2>&1; grep -E "FAIL|ERROR|rror|Traceback|passed|failed" "_rt14_$n.log" | head -14
done
echo "=== DONE"
