#!/bin/bash
cd "$(dirname "$0")"
for t in "_t130c.py t12_x.html" "_t129.py t12_x.html" "_t128.py t12_x.html" "_t127t.py t12_x.html" "_t127p.py t12_x.html" "_t127f.py t12_x.html" "_t127e.py t12_x.html" "_t126.py t12_x.html" "_t125_127p.py t12_x.html" "_t124_127p.py t12_x.html" "_t125b_127p.py t12_x.html" "_t125c.py t12_x.html" "_t125d.py t12_x.html" "_b123/_tc123.py t12_x.html" "_c123/_t123c_day.py t12_x.html" "_t122.py t12_x.html" "_t121.py t12_x.html" "_t12i_xc.py" "_int/_t113_xc.py" "_int/_t113b_xc.py" "_int/_t11c_xc.py" "_int/_t11d_xc.py" "_int/_t12b_xc.py" "_int/_t12c_xc.py" "_int/_t12d_127_xc.py"; do
  echo "=== $t"; timeout 600 python3 $t 2>&1 | grep -E "FAIL|ERROR|rror|Traceback|passed|failed" | head -20
done
echo "=== DONE"
