cd "$(dirname "$0")"
python3 build9.py > _build.log 2>&1
python3 _build_93.py > _build93.log 2>&1
for t in "r9_smoke.py t9.html" "r9old_old_t_app_5.py" "r9old_old_t_app2_5.py" "r9old_old_t_app3_5.py" "r9old_old_t5_flow.py" "r9old_old_t5_fm.py" "r9old__flow.py" "r9_pages.py" "r9_mob.py" "r9_cam.py 0.1" "r9_visdiff.py t9_93.html t9.html"; do
  echo "===== $t" >> _regress.log
  timeout 900 python3 $t >> _regress.log 2>&1
  echo "===== exit $? $t" >> _regress.log
done
echo ALLDONE >> _regress.log
