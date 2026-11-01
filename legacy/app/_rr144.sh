#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
export TZ=Pacific/Auckland
for t in "_t143b.py t12.html" "_t141.py t12.html" "_t142.py t12.html" "_t14t.py t12.html" "_t127p.py t12.html" "_t122.py" "_t125b_127p.py t12.html" "_t129.py t12.html" "_t128.py t12.html" "_int/_t12d_127.py" "_t132x.py t12.html" "_t131r.py t12.html" "_t143a.py t12.html"; do
  n=$(basename ${t%% *} .py); timeout 500 python3 $t > "_rr144_$n.log" 2>&1; echo "=== $t :: $(grep -E '^FAILS|FAILS ' _rr144_$n.log | tail -1) $(grep -c Traceback _rr144_$n.log) tb $(grep -E '^FAIL ' _rr144_$n.log | head -3 | tr '\n' '|' | cut -c1-300)"
done
echo DONE
