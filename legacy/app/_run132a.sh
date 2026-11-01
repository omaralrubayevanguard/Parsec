#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
PG_TAG=_a python3 build12.py > _b132a.log 2>&1 || { echo BUILD FAILED; tail -5 _b132a.log; exit 1; }
for t in "_t132a.py t12_a.html" "_t131r.py t12_a.html" "_t130b.py t12_a.html" "_t122.py t12_a.html"; do
  echo "=== $t"; timeout 600 python3 $t > "_r132a_$(basename ${t%% *} .py).log" 2>&1; grep -E "FAIL|ERROR|rror|Traceback|passed|failed" "_r132a_$(basename ${t%% *} .py).log" | head -14
done
echo "=== DONE"
