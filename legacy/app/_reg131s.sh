#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t122.py t12_s.html" "_t125c.py t12_s.html" "_t125d.py t12_s.html" "_t126.py t12_s.html" "_t130b.py t12_s.html" "_int/_t12c_s.py" "_t130c.py t12_s.html" "_t121.py t12_s.html" "_t130.py t12_s.html"; do
  echo "=== $t"; timeout 600 python3 $t > "_r131s_$(basename ${t%% *} .py).log" 2>&1; grep -E "FAIL|ERROR|rror|Traceback|passed|failed" "_r131s_$(basename ${t%% *} .py).log" | head -14
done
echo "=== DONE"
