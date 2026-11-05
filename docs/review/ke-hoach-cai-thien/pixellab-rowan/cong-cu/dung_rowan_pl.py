#!/usr/bin/env python3
"""Dựng tấm Rowan PixelLab (mỗi loại vũ khí một tấm) từ khung PixelLab gốc.

Nguồn: docs/anh-goc/pixellab-rowan/<loai>/<dong_tac>/<se|sw>/NN.png (khung 128×128 do PixelLab vẽ, vũ khí nằm sẵn trong tay).
Ra:    game/art/custom/zed-rowan-pl-<loai>.sprite.json

Code CHỈ: đo chân, dời cả bộ khung của một hướng một độ dịch chung (giữa hai bàn chân → gốc), cắt bỏ viền trong suốt từng khung,
xếp vào tấm ≤ 2048. Không vẽ / vá / lật điểm ảnh nào.
Chạy: python3 docs/review/ke-hoach-cai-thien/pixellab-rowan/cong-cu/dung_rowan_pl.py [--ghi]
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
NGUON = os.path.join(GOC, 'docs/anh-goc/pixellab-rowan')
RA = os.path.join(GOC, 'game/art/custom')
LOAI = ['kiem', 'thuong', 'bua', 'phitieu']
HUONG = ['se', 'sw']
DO_GAME = 1 / 2.4  # điểm game / điểm ảnh PixelLab: trong trận (cỡ ×1,2, nét 2) 1 điểm PixelLab = 1 điểm màn hình
CAO_CHUAN = 84  # cao thân nhân vật kiếm (điểm PixelLab); 84 / 2,4 = 35 điểm game
RONG_TAM = 2048


def chan(a):
    """Giữa hai bàn chân + đáy chân của một khung (mảng RGBA): điểm ảnh màu ủng (nâu) thấp nhất."""
    al = a[..., 3] > 0
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    nau = al & (r > g) & (g > b) & (r > 60) & (r < 200) & (r - b > 30)
    ys, xs = np.where(nau)
    if not len(ys):
        ys, xs = np.where(al)
    y1 = ys.max()
    m = ys >= y1 - 5
    return float(xs[m].mean()), int(y1)


def doc(loai):
    d = os.path.join(NGUON, loai)
    ds = {}
    for k in sorted(os.listdir(d)):
        p = os.path.join(d, k)
        if not os.path.isdir(p) or k.startswith('_'):
            continue
        ds[k] = {}
        for h in HUONG:
            fs = sorted(f for f in os.listdir(os.path.join(p, h)) if f.endswith('.png'))
            ds[k][h] = [np.array(Image.open(os.path.join(p, h, f)).convert('RGBA')) for f in fs]
    return ds


def dung(loai):
    ds = doc(loai)
    # độ dịch chung mỗi hướng: đo chân trên mọi khung của động tác đứng thở (chân đứng yên) → trung vị
    neo = {}
    for h in HUONG:
        cs = [chan(a) for a in ds['dung'][h]]
        neo[h] = (float(np.median([c[0] for c in cs])), float(np.median([c[1] for c in cs])))
    # cao thân (đỉnh mũ trùm vàng → đáy chân) của ảnh đứng: mỗi nhân vật PixelLab có khung riêng (112 / 128 / 144) nên thân cao khác nhau
    # → cỡ vẽ mỗi tấm (do) chỉnh cho thân cao bằng nhân vật kiếm (CAO_CHUAN điểm PixelLab = 1 điểm màn hình trong trận)
    cao = []
    for h in HUONG:
        for a in ds['dung'][h]:
            r, g, b, al = [a[..., i].astype(int) for i in range(4)]
            mu = (al > 0) & (r > 190) & (g > 120) & (g < 190) & (b < 90)
            cao.append(chan(a)[1] + 1 - np.where(mu)[0].min())
    cao = float(np.median(cao))
    o = []  # (k, h, i, mảng đã cắt, dx, dy)
    for k, hh in ds.items():
        for h, fr in hh.items():
            cx, cy = neo[h]
            for i, a in enumerate(fr):
                al = a[..., 3] > 0
                ys, xs = np.where(al)
                x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
                o.append((k, h, i, a[y0:y1, x0:x1], int(x0 - round(cx)), int(y0 - cy - 1)))
    # xếp kệ: cao trước
    thu = sorted(range(len(o)), key=lambda j: -o[j][3].shape[0])
    x = y = hk = 0
    vt = {}
    for j in thu:
        hgt, wid = o[j][3].shape[:2]
        if x + wid > RONG_TAM:
            x, y, hk = 0, y + hk + 1, 0
        vt[j] = (x, y)
        x += wid + 1
        hk = max(hk, hgt)
    W = RONG_TAM if y > 0 else x
    H = y + hk
    assert W <= 2048 and H <= 2048, (W, H)
    tam = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hang = {}
    for j, (k, h, i, a, dx, dy) in enumerate(o):
        px, py = vt[j]
        tam.paste(Image.fromarray(a, 'RGBA'), (px, py))
        hang.setdefault(k, {}).setdefault(h, [])
        hang[k][h].append([px, py, a.shape[1], a.shape[0], dx, dy])
    bio = io.BytesIO()
    tam.save(bio, 'PNG', optimize=True)
    tep = {
        'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-rowan-pl-' + loai,
        'ten': 'Rowan PixelLab cầm ' + loai + ' (vũ khí vẽ sẵn trong tay)', 'phien_ban': 1,
        'rowan_pl': 1, 'vk': loai, 'do': round(DO_GAME * CAO_CHUAN / cao, 5), 'cao_than': cao, 'huong': HUONG,
        'ghi_chu': 'pixellab-rowan 05/11: khung PixelLab skeleton-v3, 2 hướng (se: quay phải, sw: quay trái, không lật). '
                   'hang[động tác][hướng] = [[x, y, rộng, cao, dx, dy] mỗi khung]; dx, dy: góc trên-trái so với giữa chân (điểm PixelLab).',
        'hang': hang,
        'tam': 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(),
    }
    return tep, (W, H), len(bio.getvalue()), neo


def dung_hao():
    """Hào quang hình thái / hệ (PixelLab generate-image-v2, vòng sáng dưới chân): hao/<he>_<cap>.png, he = fire|poison|ice|gold, cap 1..3."""
    d = os.path.join(NGUON, 'hao')
    ds = []
    for he in ['fire', 'poison', 'ice', 'gold']:
        for cap in (1, 2, 3):
            ds.append((he, cap, Image.open(os.path.join(d, '%s_%d.png' % (he, cap))).convert('RGBA')))
    W = max(i.width for _, _, i in ds)
    H = sum(i.height + 1 for _, _, i in ds)
    tam = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hao, y = {}, 0
    for he, cap, im in ds:
        tam.paste(im, (0, y))
        hao.setdefault(he, {})[str(cap)] = [0, y, im.width, im.height]
        y += im.height + 1
    bio = io.BytesIO()
    tam.save(bio, 'PNG', optimize=True)
    return {
        'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-rowan-pl-hao', 'ten': 'Hào quang hình thái / hệ dưới chân Rowan (PixelLab)',
        'phien_ban': 1, 'rowan_pl': 1, 'do': DO_GAME, 'hao': hao,
        'ghi_chu': 'pixellab-rowan 05/11: vòng sáng PixelLab dưới chân; cấp 1 Mầm, 2 Thành hình, 3 Thức tỉnh; gold = vũ khí chưa có hệ. Nửa sau vẽ sau lưng, nửa trước vẽ trước người (js/zed_moi.js).',
        'tam': 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(),
    }, len(bio.getvalue())


if __name__ == '__main__':
    tep, n = dung_hao()
    print('hao %.0f KB' % (n / 1024))
    if '--ghi' in sys.argv:
        with open(os.path.join(RA, tep['ma'] + '.sprite.json'), 'w') as f:
            json.dump(tep, f, ensure_ascii=False, separators=(',', ':'))
    for l in LOAI:
        if not os.path.isdir(os.path.join(NGUON, l)):
            print('thiếu', l); continue
        if not os.path.isdir(os.path.join(NGUON, l, 'dung')):
            print('thiếu đứng', l); continue
        tep, wh, n, neo = dung(l)
        print(l, 'tấm', wh, '%.0f KB' % (n / 1024), 'neo', neo, 'cao thân', tep['cao_than'], 'do', tep['do'], 'động tác', len(tep['hang']))
        if '--ghi' in sys.argv:
            with open(os.path.join(RA, tep['ma'] + '.sprite.json'), 'w') as f:
                json.dump(tep, f, ensure_ascii=False, separators=(',', ':'))
