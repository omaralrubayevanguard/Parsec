#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
export TZ=Pacific/Auckland
python3 build12.py > _b143.log 2>&1 || { echo BUILD FAILED; tail -5 _b143.log; exit 1; }
for t in "_t141.py t12.html" "_t125b_127p.py t12.html" "_int/_t12d_127.py" "_t14b.py t12.html" "_t130.py t12.html" "_t122.py" "_t143b.py t12.html" "_t14t.py t12.html" "_t142.py t12.html" "_t127p.py t12.html" "_t121.py" "_t143a.py t12.html" "_t131r.py t12.html"; do
  n=$(basename ${t%% *} .py); timeout 500 python3 $t > "_rr143_$n.log" 2>&1; echo "=== $t :: $(grep -E '^FAILS|FAILS ' _rr143_$n.log | tail -1) $(grep -c Traceback _rr143_$n.log) tb $(grep -E '^FAIL ' _rr143_$n.log | head -3 | tr '\n' '|' | cut -c1-300)"
done
echo DONE
