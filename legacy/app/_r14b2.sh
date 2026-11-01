#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t14b.py t12_bb.html" "_t126.py t12_bb.html" "_t125b_127p.py t12_bb.html" "_t125b_127p.py t12_bq.html" "_t125_127p.py t12_bb.html" "_t130c.py t12_bb.html" "_t131s.py t12_bb.html"; do
  echo "=== $t"; TZ=UTC timeout 600 python3 $t > "_r14b2_$(basename ${t%% *} .py)_$(echo ${t##* } | tr -d .).log" 2>&1; grep -E "FAIL|ERROR|rror|Traceback|passed|failed" "_r14b2_$(basename ${t%% *} .py)_$(echo ${t##* } | tr -d .).log" | head -14
done
echo "=== DONE"
