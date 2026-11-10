#!/usr/bin/env python3
"""TURRET MERGE — 5 chân dung phi công MỚI kiểu SINH VẬT (10/11, người dùng duyệt): chuato (ong bắp cày đỏ đội vương miện),
pandora (thần khói tím mắt sao bay ra từ rương), hydra (rồng rắn 3 đầu), congap (rồng con đội vỏ trứng), thanhdia (tượng cẩm thạch + vầng đá).
Nguồn: docs/demo-hop-tuong/tuvan/phi-cong-moi/<id>.jpg (1254², nền vẽ sẵn — KHÔNG khoá magenta).
Ra (ghi đè ảnh cũ kiểu người):
  thap/assets/pilot_<id>.png      427²  — ô vuông quanh ĐẦU (CAT[id] = trái, trên, cạnh — px ảnh nguồn)
  thap/assets/pn/pilot_<id>.png   256²  — như trên, bản nhỏ
  thap/assets/hero/hero_<id>.jpg  1170×1020 — phần trên ảnh (rộng đủ), trang ụ
và mốc mặt PO_NEO + HERO_NEO (thap/js/chandung.js), FACE_BOX (thap/js/khung.js) theo MAT[id] = (đỉnh đầu y, mắt y, tâm mặt x, cằm y) px ảnh nguồn.
LƯU Ý: 5 id này KHÔNG còn cắt bằng thap-cat-chandung.py / thap-cat-chandung2.py / thap-cat-thacmana-congap.py / thap-hero.py (ảnh nguồn cũ) — chạy lại các tool đó cho 5 id sẽ ghi đè ảnh mới.
Chạy (gốc repo): python3 tools/thap-cat-phicong-moi.py [id ...]     (KHONG_JS=1: chỉ ghi ảnh)
"""
import os, re, sys
from PIL import Image
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/phi-cong-moi')
A = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js')
# ô vuông cắt (trái, trên, cạnh) — px ảnh nguồn 1254
CAT = {'chuato': (150, 0, 1100), 'pandora': (225, 0, 830), 'hydra': (190, 0, 1000), 'congap': (104, 0, 1150), 'thanhdia': (185, 0, 950),
       'bocap': (250, 0, 900)}  # bocap (10/11): Crimson Sting — sát thủ bọ cạp giáp tím-đen, ô thấy cả đầu + ngòi đuôi hồng ngọc
# (đỉnh đầu y, đường mắt y, tâm mặt x, cằm y) — px ảnh nguồn; hydra = ĐẦU GIỮA; pandora = cụm mắt sao + miệng cười (không lấy rương)
MAT = {'chuato': (5, 445, 700, 690), 'pandora': (20, 340, 640, 470), 'hydra': (0, 212, 690, 385), 'congap': (20, 410, 690, 690), 'thanhdia': (10, 325, 660, 545),
       'bocap': (150, 500, 650, 665)}  # bocap: đầu giáp 4 mắt đỏ + hồng ngọc trán


def cat(i):
    im = Image.open(os.path.join(RAW, i + '.jpg')).convert('RGB'); W, H = im.size
    L, T, S = CAT[i]; top, eye, fx, chin = MAT[i]
    sq = im.crop((L, T, L + S, T + S))
    sq.resize((427, 427), Image.LANCZOS).save(os.path.join(A, 'pilot_%s.png' % i), optimize=True)
    sq.resize((300, 300), Image.LANCZOS).save(os.path.join(A, 'pn', 'pilot_%s.png' % i), optimize=True)
    hh = round(W * 1020 / 1170)
    im.crop((0, 0, W, hh)).resize((1170, 1020), Image.LANCZOS).save(os.path.join(A, 'hero', 'hero_%s.jpg' % i), quality=88, optimize=True, progressive=True)
    p = lambda y: round(max(0, min(100, (y - T) / S * 100)), 1)
    po = [p(top), p(eye), round((fx - L) / S * 100, 1), p(chin)]
    hero = [round(top / hh * 100, 1), round(eye / hh * 100, 1), round(fx / W * 100, 1)]
    fb = [po[2], round((po[0] + po[3]) / 2, 1), round(po[3] - po[0], 1)]
    return po, hero, fb


def ghi_js(cd):
    fmt = lambda v: '[' + ', '.join('%g' % n for n in v) + ']'
    p = os.path.join(JS, 'chandung.js'); t = open(p, encoding='utf-8').read()
    for ten, k in (('PO_NEO', 0), ('HERO_NEO', 1)):
        a = t.index('const ' + ten + ' = {'); b = t.index('};', a); blk = t[a:b]
        for i, v in cd.items():
            pat = re.compile(r'(?<![\w])' + i + r'\s*:\s*\[[^\]]*\]')
            blk = pat.sub(i + ': ' + fmt(v[k]), blk, 1) if pat.search(blk) else blk.rstrip() + ' ' + i + ': ' + fmt(v[k]) + ','
        t = t[:a] + blk + t[b:]
    open(p, 'w', encoding='utf-8').write(t)
    p = os.path.join(JS, 'khung.js'); t = open(p, encoding='utf-8').read()
    a = t.index('const FACE_BOX = {'); b = t.index('};', a); blk = t[a:b]
    for i, v in cd.items():
        nv = i + ':[' + ','.join('%g' % n for n in v[2]) + ']'
        pat = re.compile(r'(?<![\w])' + i + r':\[[^\]]*\]')
        blk = pat.sub(nv, blk, 1) if pat.search(blk) else blk.rstrip().rstrip(',') + ',' + nv
    open(p, 'w', encoding='utf-8').write(t[:a] + blk + t[b:])


if __name__ == '__main__':
    cd = {}
    for i in sys.argv[1:] or sorted(CAT):
        cd[i] = cat(i); print(i, 'PO_NEO', cd[i][0], 'HERO_NEO', cd[i][1], 'FACE_BOX', cd[i][2])
    if os.environ.get('KHONG_JS') != '1': ghi_js(cd)
