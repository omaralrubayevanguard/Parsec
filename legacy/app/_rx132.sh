#!/bin/bash
cd /tmp/claude-0/-home-claude/febe01e4-e12e-554d-9dc2-ccfd769708e9/scratchpad/app
./_bx132.sh || exit 1; tail -1 _b132x.log
echo "=== x132/t132.js"; node x132/t132.js | tail -1
echo "=== _t132x"; timeout 900 python3 _t132x.py t12_ix.html > _r132x.log 2>&1; grep -E "FAIL|Traceback|rror" _r132x.log | head; grep -c "^ok" _r132x.log
for t in "_t132x_l_ocr.py" "_int/_t132x_l_t12c.py" "_t132a.py t12_ix.html"; do
  echo "=== $t"; timeout 600 python3 $t 2>&1 | grep -E "FAIL|ERROR|rror|Traceback|passed|failed|read in|^ *[0-9] " | head -14
done
echo "=== DONE"
