#!/bin/sh
# Tách lại toàn bộ khung chibi Lam. Chạy từ thư mục tieng-vong-cuoi-cung/:  sh tools/chibi-lam-chay-het.sh
set -e
A=art/chibi/lam; K=$A/khung; T=tools/chibi-tach-khung.py
MAT=${MAT:-15}
python3 $T $A/idle.gif       --ra $K/idle      --mat $MAT --fps 8  --json $K/idle.json
python3 $T $A/run-6.png      --hang 2 --cot 3 --ra $K/run    --mat $MAT --fps 12 --bay 2,5 --json $K/run.json
python3 $T $A/attack-6.png   --hang 2 --cot 3 --ra $K/attack --mat $MAT --fps 14 --json $K/attack.json
python3 $T $A/combo-20.png   --hang 5 --cot 4 --tach-hang --ra $K/combo --mat $MAT --fps 14 --bay 4,5,6,7,8,13,14 --json $K/combo.json
python3 $T $A/goc-nhin-8.png --hang 2 --cot 4 --ra $K/goc-nhin --mat $MAT --fps 4 --json $K/goc-nhin.json
python3 tools/chibi-so-sanh-co.py
