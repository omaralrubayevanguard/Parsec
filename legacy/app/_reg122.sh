#!/bin/bash
cd "$(dirname "$0")"
for t in _t122.py _t121.py _t12i.py _int/_t113.py _int/_t113b.py _int/_t11c.py _int/_t11d.py _int/_t12b.py _int/_t12c.py _int/_t12d.py; do
  echo "=== $t"; timeout 300 python3 $t 2>&1 | grep -E "FAIL|ERROR|rror|Traceback" | head -12
done
echo "=== DONE"
