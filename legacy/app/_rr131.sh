#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t131s.py t12.html" "_t127e.py t12.html" "_t125b_127p.py t12.html"; do
  echo "=== $t"; TZ=Asia/Tokyo timeout 600 python3 $t 2>&1 | grep -E "FAIL|ERROR|rror|Traceback|passed|failed" | head -14
done
echo "=== DONE"
