#!/bin/sh
# Đợt 2: Lam idle/jump mới, Quái Chuông Gỗ, tileset rễ cây, nền hốc cây, ảnh ghép thử.
# Chạy từ thư mục tieng-vong-cuoi-cung/:  sh tools/chibi-chay-het-2.sh   (cần python3: numpy, scipy, pillow, opencv)
set -e
A=art/chibi/lam; K=$A/khung; T=tools/chibi-tach-khung.py
rm -rf $K/idle $K/jump art/chibi/quai/khung art/chibi/tileset/manh
python3 $T $A/idle-6.png --hang 1 --cot 6 --ra $K/idle --ti-le 0.585 --pivot de --fps 8 --json $K/idle.json
python3 $T $A/jump-4.png --hang 1 --cot 4 --ra $K/jump --ti-le 0.522 --pivot de --bay 2,3,4 --mat-bay 236 --fps 10 --json $K/jump.json
python3 tools/chibi-quai.py art/chibi/quai/quai-chuong-go.png --ra art/chibi/quai/khung --cao 256
python3 tools/chibi-tileset.py art/chibi/tileset/re-cay-reu.png --ra art/chibi/tileset
python3 tools/chibi-nen.py art/chibi/nen/hoc-cay.png --ra art/chibi/nen
python3 tools/chibi-ghep-thu.py
