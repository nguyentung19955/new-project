#!/bin/sh
# Tách lại toàn bộ khung chibi Lam. Chạy từ thư mục tieng-vong-cuoi-cung/:  sh tools/chibi-lam-chay-het.sh
set -e
A=art/chibi/lam; K=$A/khung; T=tools/chibi-tach-khung.py
MAT=${MAT:-15}
python3 $T $A/idle.gif       --ra $K/rut-dao   --mat $MAT --fps 8  --json $K/rut-dao.json   # idle.gif cũ thực ra là rút dao
# idle-6 / jump-4: mắt vẽ to hơn các tấm cũ → đo mắt cho tỉ lệ sai; ép tỉ lệ (xem BAO-CAO-2.md)
python3 $T $A/idle-6.png     --hang 1 --cot 6 --ra $K/idle --ti-le 0.585 --pivot de --fps 8 --json $K/idle.json
python3 $T $A/jump-4.png     --hang 1 --cot 4 --ra $K/jump --ti-le 0.522 --pivot de --bay 2,3,4 --mat-bay 236 --fps 10 --json $K/jump.json
python3 $T $A/run-6.png      --hang 2 --cot 3 --ra $K/run    --mat $MAT --fps 12 --bay 2,5 --json $K/run.json
python3 $T $A/attack-6.png   --hang 2 --cot 3 --ra $K/attack --mat $MAT --fps 14 --json $K/attack.json
python3 $T $A/combo-20.png   --hang 5 --cot 4 --tach-hang --ra $K/combo --mat $MAT --fps 14 --bay 4,5,6,7,8,13,14 --json $K/combo.json
python3 $T $A/goc-nhin-8.png --hang 2 --cot 4 --ra $K/goc-nhin --mat $MAT --fps 4 --json $K/goc-nhin.json
python3 tools/chibi-so-sanh-co.py
