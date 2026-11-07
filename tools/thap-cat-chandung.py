#!/usr/bin/env python3
"""TURRET MERGE — cắt chân dung "Một thiên hà, nhiều chủng tộc" (docs/demo-hop-tuong/tuvan/chan-dung-moi/STYLE.md) vào game.
Nguồn: docs/demo-hop-tuong/tuvan/chan-dung-moi/raw/cd_<id>.png (1536×1024, ChatGPT) + mốc mặt tools/thap-cat-chandung.json
  {id: [mặt x, đường mắt y]} (phần cạnh ảnh gốc, chú thích tay trên bảng soát).
Ra (ghi đè bản cũ; id không có ảnh mới thì giữ ảnh cũ + mốc cũ):
  thap/assets/pilot_<id>.png     427×427  — ô vuông cạnh 46 % chiều cao quanh mặt, mắt ở 40 % ô (thẻ, khay, bảng chạm)
  thap/assets/pn/pilot_<id>.png  256×256  — như trên, bản nhỏ
  thap/assets/hero/hero_<id>.jpg 1170×1020 — cắt giữa 1174×1024 (x 11,8–88,2 %), trang ụ / nền sảnh
và cập nhật mốc: PO_NEO + HERO_NEO (thap/js/chandung.js), FACE_BOX (thap/js/khung.js).
Đầu (đỉnh tóc → cằm) ước theo mắt: đỉnh = mắt − 15 %, cằm = mắt + 10 % chiều cao ảnh gốc.
Chạy (gốc repo): python3 tools/thap-cat-chandung.py [id ...]
"""
import json, os, re, sys
from PIL import Image
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RAW = os.path.join(R, 'docs/demo-hop-tuong/tuvan/chan-dung-moi/raw')
A = os.path.join(R, 'thap/assets')
F = json.load(open(os.path.join(R, 'tools/thap-cat-chandung.json')))
NGUON = {'set': 'cd_set_v2.png'}          # ảnh thử pha 1 có bản v2
TILE, EYE, TOP, CHIN = 0.46, 0.40, 0.15, 0.10
ids = sys.argv[1:] or sorted(F)

def cat(i):
    fx, ey = F[i]
    im = Image.open(os.path.join(RAW, NGUON.get(i, f'cd_{i}.png'))).convert('RGB')
    if im.size != (1536, 1024): im = im.resize((1536, 1024), Image.LANCZOS)
    W, H = im.size
    S = round(TILE * H)
    T = min(max(0, round(ey * H - EYE * S)), H - S)
    L = min(max(0, round(fx * W - S / 2)), W - S)
    sq = im.crop((L, T, L + S, T + S))
    sq.resize((427, 427), Image.LANCZOS).save(os.path.join(A, f'pilot_{i}.png'), optimize=True)
    sq.resize((256, 256), Image.LANCZOS).save(os.path.join(A, f'pn/pilot_{i}.png'), optimize=True)
    x0 = round(0.118 * W)
    im.crop((x0, 0, x0 + 1174, H)).resize((1170, 1020), Image.LANCZOS).save(os.path.join(A, f'hero/hero_{i}.jpg'), quality=88, optimize=True, progressive=True)
    p = lambda y: round(max(0, min(100, (y * H - T) / S * 100)), 1)
    top, eye, chin, x = p(ey - TOP), p(ey), p(ey + CHIN), round((fx * W - L) / S * 100, 1)
    po = [top, eye, x, chin]
    hx = round((fx * W - x0) / 1174 * 100, 1)
    hero = [round(max(0, (ey - TOP) * 100), 1), round(ey * 100, 1), hx]
    fb = [x, round((top + chin) / 2, 1), round(chin - top, 1)]
    return po, hero, fb

def fmt(v): return '[' + ', '.join(('%g' % n) for n in v) + ']'
def thay(txt, ten, i, v):
    a = txt.index('const ' + ten + ' = {'); b = txt.index('};', a)
    blk = txt[a:b]
    pat = re.compile(r'(?<![\w])' + i + r'\s*:\s*\[[^\]]*\]')
    blk = pat.sub(i + ': ' + fmt(v), blk, 1) if pat.search(blk) else blk.rstrip() + ' ' + i + ': ' + fmt(v) + ','
    return txt[:a] + blk + txt[b:]

cd = open(os.path.join(R, 'thap/js/chandung.js')).read()
kh = open(os.path.join(R, 'thap/js/khung.js')).read()
for i in ids:
    if not os.path.exists(os.path.join(RAW, NGUON.get(i, f'cd_{i}.png'))): print('thiếu ảnh', i); continue
    po, hero, fb = cat(i)
    cd = thay(cd, 'PO_NEO', i, po); cd = thay(cd, 'HERO_NEO', i, hero)
    a = kh.index('const FACE_BOX = {'); b = kh.index('};', a); blk = kh[a:b]
    pat = re.compile(r'(?<![\w])' + i + r':\[[^\]]*\]')
    nv = i + ':[' + ','.join('%g' % n for n in fb) + ']'
    blk = pat.sub(nv, blk, 1) if pat.search(blk) else blk + ',' + nv
    kh = kh[:a] + blk + kh[b:]
    print(i, po, hero)
open(os.path.join(R, 'thap/js/chandung.js'), 'w').write(cd)
open(os.path.join(R, 'thap/js/khung.js'), 'w').write(kh)
