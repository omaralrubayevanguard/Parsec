#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
export TZ=Asia/Tokyo
python3 build12.py > _b142.log 2>&1 || { echo BUILD FAILED; exit 1; }
for t in _t142.py _t141.py _t14t.py _t14c.py _t131r.py _t132a.py _t122.py _t127p.py _t130b.py _t125d.py; do
  echo "=== $t"; timeout 500 python3 $t t12.html > "_r142_$t.log" 2>&1; grep -E "^FAIL|FAILS|Traceback|failed" "_r142_$t.log" | head -6
done
echo "=== DONE"
