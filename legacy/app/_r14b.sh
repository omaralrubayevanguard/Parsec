#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
for t in "_t14b.py t12_bb.html" "_t126.py t12_bb.html" "_t125b_127p.py t12_bb.html" "_t124_127p.py t12_bb.html" "_t125_127p.py t12_bb.html" "_t130c.py t12_bb.html" "_t131s.py t12_bb.html" "_t132x.py t12_bb.html" "_int/_t12c_bb.py" "_int/_t12b_bb.py" "_int/_t113_bb.py" "_int/_t113b_bb.py" "_int/_t11c_bb.py" "_int/_t11d_bb.py" "_int/_t12d_127_bb.py" "_t12i_bb.py"; do
  echo "=== $t"; TZ=Asia/Tokyo timeout 600 python3 $t > "_r14b_$(basename ${t%% *} .py).log" 2>&1; grep -E "FAIL|ERROR|rror|Traceback|passed|failed" "_r14b_$(basename ${t%% *} .py).log" | head -14
done
echo "=== DONE"
