#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t14c.py t12_cc.html" "_t131r.py t12_cc.html" "_t131s.py t12_cc.html" "_t132a.py t12_cc.html" "_t130.py t12_cc.html" "_t130b.py t12_cc.html" "_t129.py t12_cc.html" "_t128.py t12_cc.html" "_t127t.py t12_cc.html" "_t125c.py t12_cc.html" "_t125d.py t12_cc.html" "_c123/_t123c_day.py t12_cc.html" "_t122.py t12_cc.html" "_t121.py t12_cc.html" "_int/_t12b_cc.py" "_int/_t12c_cc.py" "_t12i_cc.py"; do
  n=$(basename ${t%% *} .py)
  echo "=== $t"; TZ=America/New_York timeout 600 python3 $t > "_r14c_$n.log" 2>&1; grep -E "FAIL|ERROR|rror|Traceback|passed|failed" "_r14c_$n.log" | head -14
done
echo "=== DONE"
