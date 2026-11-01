#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
export TZ=Pacific/Auckland
python3 build12.py > _b143.log 2>&1 || { echo BUILD FAILED; exit 1; }
for t in "_int/_t12c.py" "_int/_t12d_127.py" "_t14b.py t12.html" "_t130.py t12.html" "_t127f.py t12.html" "_t124_127p.py t12.html" "_t125_127p.py t12.html" "_t125b_127p.py t12.html" "_t125c.py t12.html" "_t122.py" "_t141.py t12.html"; do
  n=$(basename ${t%% *} .py); timeout 500 python3 $t > "_rr143_$n.log" 2>&1; echo "=== $t :: $(grep -E '^FAILS|FAILS ' _rr143_$n.log | tail -1) $(grep -c Traceback _rr143_$n.log) tb $(grep -E '^FAIL ' _rr143_$n.log | head -3 | tr '\n' '|' | cut -c1-300)"
done
echo DONE
