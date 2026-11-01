cd "$(dirname "$0")"
for t in "r9_mob.py" "r9_smoke.py t9.html" "r9_pages.py" "r9old_old_t5_fm.py" "r9_visdiff.py t9_94.html t9.html"; do
  echo "===== $t" >> _regress2.log; timeout 900 python3 $t >> _regress2.log 2>&1; echo "===== exit $? $t" >> _regress2.log
done; echo ALLDONE >> _regress2.log
