#!/bin/bash
cd "$(dirname "$0")"
for t in "_t130.py t12.html" "_t130a.py t12.html" "_t130b.py t12.html" "_t130c.py t12.html" "_t129.py t12.html" "_t128.py t12.html" "_t127t.py t12.html" "_t127p.py t12.html" "_t127f.py t12.html" "_t127e.py t12.html" "_t126.py t12.html" "_t125_127p.py t12.html" "_t124_127p.py t12.html" "_t125b_127p.py t12.html" "_t125c.py t12.html" "_t125d.py t12.html" "_b123/_tc123.py t12.html" "_c123/_t123c_day.py t12.html" "_t122.py" "_t121.py" "_t12i.py" "_int/_t113.py" "_int/_t113b.py" "_int/_t11c.py" "_int/_t11d.py" "_int/_t12b.py" "_int/_t12c.py" "_int/_t12d_127.py"; do
  echo "=== $t"; timeout 600 python3 $t 2>&1 | grep -E "FAIL|ERROR|rror|Traceback|passed|failed" | head -14
done
echo "=== DONE"
