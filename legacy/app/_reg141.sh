#!/bin/bash
cd "$(dirname "$0")"; export TZ=Asia/Tokyo
for t in "_t14t.py t12.html" "_t14c.py t12.html" "_t131r.py t12.html" "_t130b.py t12.html" "_t127p.py t12.html" "_t132x.py t12.html" "_t121.py t12.html"; do
  echo "=== $t"; timeout 600 python3 $t > "_r141_$(basename ${t%% *} .py).log" 2>&1; grep -E "^FAIL|FAILS|Traceback|rror:" "_r141_$(basename ${t%% *} .py).log" | head -8
done; echo "=== DONE"
