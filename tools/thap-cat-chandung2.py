#!/usr/bin/env python3
"""TURRET MERGE — cắt CHÂN DUNG ĐỢT 2 (đa dạng, 09/11 — docs/demo-hop-tuong/tuvan/chan-dung-moi/DA-DANG-2.md) vào game.
Nguồn: docs/demo-hop-tuong/thap-art/raw_pilot2_<id>.png (ChatGPT, vuông ~1254², nền phẳng #FF00FF, bán thân 3/4).
Ra (ghi đè ảnh cũ trùng lặp — trung-lap.jpg):
  thap/assets/pilot_<id>.png       427²  — ô vuông quanh mặt, mắt ở 40 % ô, cằm cách mắt 21,7 % ô (như thap-cat-chandung)
  thap/assets/pn/pilot_<id>.png    256²  — như trên, bản nhỏ
  thap/assets/hero/hero_<id>.jpg   1170×1020 — phần trên ảnh (rộng đủ), trang ụ / chỉ huy
và mốc mặt PO_NEO + HERO_NEO (thap/js/chandung.js), FACE_BOX (thap/js/khung.js).
Cách làm như tools/thap-cat-thacmana-congap.py: khoá magenta loang từ viền (viền alpha mềm, tách trộn màu nền → không viền
hồng), nền = bản mờ-tối của chính nhân vật (ảnh gốc không có nền vẽ).
Mốc MAT[id] = (mặt x, đường mắt y, cằm y) theo cạnh ảnh gốc — chú thích tay trên bảng lưới 10 % (soát lại: KT=1 in bảng).
Chạy (gốc repo): python3 tools/thap-cat-chandung2.py [id ...]     (KHONG_JS=1: chỉ ghi ảnh, không sửa js)
"""
import os, sys, re
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
A = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js')
MAG = (255, 0, 255)
TILE_EYE, TOP_K = 0.40, 1.5     # mắt ở 40 % ô; đỉnh đầu ≈ mắt − 1,5 × (cằm − mắt)

# (mặt x, mắt y, cằm y) — phần cạnh ảnh gốc
MAT = {
    'bienmau': (0.53, 0.37, 0.50), 'cauvong': (0.52, 0.36, 0.52), 'cuongno': (0.55, 0.32, 0.47), 'dongbo': (0.42, 0.30, 0.46),
    'guongcong': (0.56, 0.29, 0.43), 'hutmana': (0.50, 0.25, 0.38), 'kepha': (0.55, 0.31, 0.46), 'khien': (0.51, 0.21, 0.33),
    'khoisinh': (0.58, 0.31, 0.45), 'khuech': (0.46, 0.30, 0.46), 'laser': (0.53, 0.36, 0.52), 'loa': (0.41, 0.43, 0.57),
    'loren': (0.54, 0.28, 0.42), 'luoicheo': (0.55, 0.40, 0.53), 'luutru': (0.60, 0.30, 0.43), 'mana': (0.47, 0.25, 0.38),
    'maychem': (0.48, 0.28, 0.41), 'mimic': (0.56, 0.38, 0.52), 'min': (0.48, 0.29, 0.44), 'nam': (0.50, 0.25, 0.39),
    'nayda': (0.55, 0.32, 0.47), 'nemesis': (0.48, 0.25, 0.39), 'ngaithoigian': (0.52, 0.34, 0.47), 'nguyenrua': (0.59, 0.32, 0.46),
    'nhanban': (0.48, 0.36, 0.52), 'phun': (0.53, 0.22, 0.38), 'radar': (0.57, 0.41, 0.55), 'railgun': (0.45, 0.27, 0.41),
    'ronglua': (0.56, 0.25, 0.39), 'santhuong': (0.52, 0.31, 0.45), 'thanhdia': (0.57, 0.33, 0.47), 'tia': (0.48, 0.33, 0.45),
    'tienhoa': (0.58, 0.44, 0.57), 'tudo': (0.55, 0.38, 0.52), 'wallgen': (0.46, 0.28, 0.44),
}
# vùng hồng/tím THẬT của nhân vật (tóc hồng, lưỡi…) — không coi là nền: (tâm x, tâm y, bán kính) theo cạnh ảnh
GIU = {}


def khoa_mag(im, i=''):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    d = np.sqrt((a[..., 0] - 255) ** 2 + a[..., 1] ** 2 + (a[..., 2] - 255) ** 2)
    al = np.clip((d - 60) / 110, 0, 1)
    # chỉ vùng magenta LOANG từ viền là nền (hồng/tím trong áo, tóc giữ nguyên)
    lab, n = nd.label(d < 150)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen = np.isin(lab, list(vien))
    giu = np.zeros_like(d, bool); yy, xx = np.mgrid[:d.shape[0], :d.shape[1]] / d.shape[0]
    for cx, cy, r in GIU.get(i, ()): giu |= (xx - cx) ** 2 + (yy - cy) ** 2 < r * r
    nen &= ~giu
    # khe tóc kín bên trong: điểm rất magenta (d < 75) cũng là nền
    nen |= nd.binary_opening(d < 75, iterations=1) & ~giu
    al = np.where(nd.binary_dilation(nen, iterations=2) & ~giu, al, 1.0)
    k = (1 - al)[..., None]
    c = np.clip((a - k * np.array(MAG, np.float32)) / np.maximum(al[..., None], 1e-3), 0, 255)
    g = c[..., 1]
    for j in (0, 2): c[..., j] = np.where(al < 1, np.minimum(c[..., j], np.maximum(g + 40, c[..., j] - 60 * (1 - al))), c[..., j])
    return c, al


def chan_dung(i):
    im = Image.open(os.path.join(RAW, 'raw_pilot2_%s.png' % i)).convert('RGB')
    c, al = khoa_mag(im, i)
    W, H = im.size
    # nền tạm: bản mờ rất mạnh + tối của chính nhân vật
    pm = Image.fromarray((c * al[..., None]).astype(np.uint8)); am = Image.fromarray((al * 255).astype(np.uint8))
    b = np.asarray(pm.filter(ImageFilter.GaussianBlur(70))).astype(np.float32)
    ba = np.asarray(am.filter(ImageFilter.GaussianBlur(70))).astype(np.float32)[..., None] / 255
    mau = b / np.maximum(ba, 0.05)
    tb = (c * al[..., None]).reshape(-1, 3).sum(0) / al.sum()
    nen = (0.55 * mau * np.clip(ba * 1.4, 0, 1) + 0.18 * tb * (1 - np.clip(ba * 1.4, 0, 1))) * 0.62
    rgb = c * al[..., None] + nen * (1 - al[..., None])
    full = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    fx, ey, cy = MAT[i]
    S = min(round((cy - ey) * H / 0.217), W, H)                  # cằm cách mắt 21,7 % ô
    T = min(max(0, round(ey * H - TILE_EYE * S)), H - S); L = min(max(0, round(fx * W - S / 2)), W - S)
    sq = full.crop((L, T, L + S, T + S))
    sq.resize((427, 427), Image.LANCZOS).save(os.path.join(A, 'pilot_%s.png' % i), optimize=True)
    sq.resize((256, 256), Image.LANCZOS).save(os.path.join(A, 'pn', 'pilot_%s.png' % i), optimize=True)
    hh = round(W * 1020 / 1170)
    full.crop((0, 0, W, hh)).resize((1170, 1020), Image.LANCZOS).save(os.path.join(A, 'hero', 'hero_%s.jpg' % i), quality=88, optimize=True, progressive=True)
    p = lambda y: round(max(0, min(100, (y * H - T) / S * 100)), 1)
    top = ey - TOP_K * (cy - ey)
    x = round((fx * W - L) / S * 100, 1)
    po = [p(top), p(ey), x, p(cy)]
    hero = [round(max(0, top * H / hh * 100), 1), round(ey * H / hh * 100, 1), round(fx * 100, 1)]
    fb = [x, round((po[0] + po[3]) / 2, 1), round(po[3] - po[0], 1)]
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
    t = t[:a] + blk + t[b:]
    open(p, 'w', encoding='utf-8').write(t)


def main():
    ids = sys.argv[1:] or sorted(MAT)
    cd = {}
    for i in ids:
        if not os.path.exists(os.path.join(RAW, 'raw_pilot2_%s.png' % i)): print('thiếu ảnh', i); continue
        cd[i] = chan_dung(i)
        print(i, 'PO_NEO', cd[i][0], 'HERO_NEO', cd[i][1], 'FACE_BOX', cd[i][2])
    if os.environ.get('KHONG_JS') != '1': ghi_js(cd)


if __name__ == '__main__':
    main()
