#!/usr/bin/env python3
"""Ghép khung PixelLab vùng 3–4 (docs/anh-goc/pixellab-quai-vung-3-4/<mã cũ>/khung/<hàng>-NN.png) thành tấm .sprite.json của game,
mang THẲNG mã quái cũ (mục "quai_moi"; tấm cũ là <mã>-plcu, doi-cu.py — như phiên vùng 1–2).

Theo đúng cách của pixellab-quai-nam/cong-cu/dung-quai-pl.py — chỉ CẮT + ĐẶT VỊ TRÍ + GHÉP, không vẽ / vá / đổi màu điểm ảnh nào:
- Mọi khung của một con cùng một khung vẽ PixelLab (cùng nhân vật, cùng khung xương, hướng south-east) → MỘT ô cắt chung (hợp các vùng
  có hình + lề 2), không dời riêng khung nào ⇒ chân không trượt giữa các khung / các động tác.
- Điểm neo (goc) = giữa chân ở ảnh đứng (khung idle-00 = ảnh đứng south-east của bộ 8 hướng), đáy chân.
- net 2: 2 điểm ảnh PixelLab = 1 điểm game (như các quái khác); con nào vẽ ra to hơn hẳn thân cũ thì net 3 ("net" trong chon.json)
  để cỡ thân trong game gần như cũ (hộp va chạm của game không đổi).
- rong / cao (cỡ bóng, hộp chữ) chép từ tấm cũ của con đó để bóng dưới chân giữ như cũ; 'mo' (lúc bắt đầu mờ khi chết) chép từ tấm cũ.
Bảng hàng / thời lượng: docs/anh-goc/pixellab-quai-vung-3-4/chon.json.
Chạy:  python3 docs/review/ke-hoach-cai-thien/pixellab-quai-vung-3-4/cong-cu/dung-quai-34.py [--ghi] [mã cũ ...]
"""
import base64, glob, io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'anh-goc', 'pixellab-quai-vung-3-4')
OUT = os.path.join(ROOT, 'game', 'art', 'custom')
NET = 2
GIAY_MOI = {'tele': 0.7, 'atk': 0.6, 'idle': 1.4, 'move': 0.8, 'hit': 0.3, 'die': 1.2}


def khung(cu, hang):
    fs = sorted(glob.glob(os.path.join(SRC, cu, 'khung', hang + '-[0-9][0-9].png')))
    return [Image.open(f).convert('RGBA') for f in fs]


def dung(cu, cfg):
    NET = int(cfg.get('net', 2))  # 2 (mặc định) hoặc 3: chọn net cho thân mới gần cỡ thân cũ nhất (con vẽ cao / to hơn → net 3)
    tcu = json.load(open(os.path.join(OUT, cu + '-plcu.sprite.json'), encoding='utf-8'))  # tấm ChatGPT cũ (doi-cu.py)
    dcu = tcu.get('dong_tac', {})
    rows = []
    for r in cfg['hang']:
        ten = r['ten']; fs = khung(cu, ten)
        assert fs, (cu, ten, 'thiếu khung')
        goc_ten = ten.split('_')[0]
        g = r.get('giay') or (dcu.get(ten, {}).get('giay')) or GIAY_MOI.get(goc_ten, 0.7)
        lap = r.get('lap', goc_ten in ('idle', 'move'))
        rows.append((ten, g, lap, fs, r))
    allf = [f for r in rows for f in r[3]]
    W, H = allf[0].size
    assert all(f.size == (W, H) for f in allf), 'khung khác cỡ'
    bbs = [f.getbbox() for f in allf if f.getbbox()]
    bb = [min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs)]
    a = np.array(rows[0][3][0])[..., 3] > 0
    ys, xs = np.where(a)
    by = int(ys.max())
    cao = by - int(ys.min()) + 1
    fx = int(round(xs[ys >= by - max(3, int(cao * 0.1))].mean()))  # giữa chân: trọng tâm 10% chiều cao thấp nhất (giáo / gậy mảnh chạm đất không kéo lệch)
    fy = by + 1  # mép dưới bàn chân
    x0, y0 = max(0, bb[0] - 2), max(0, bb[1] - 2)
    x0 -= (fx - x0) % NET; y0 -= (fy - y0) % NET
    x1, y1 = bb[2] + 2, bb[3] + 2
    x1 += (-(x1 - x0)) % NET; y1 += (-(y1 - y0)) % NET
    fw, fh = x1 - x0, y1 - y0
    ncot = max(len(r[3]) for r in rows)
    tam = Image.new('RGBA', (fw * ncot, fh * len(rows)), (0, 0, 0, 0))
    dt = {}
    for h, (t, g, l, fs, r) in enumerate(rows):
        for i, f in enumerate(fs):
            tam.paste(f.crop((x0, y0, x1, y1)), (i * fw, h * fh))  # chỉ cắt + đặt, không đổi điểm ảnh
        dt[t] = {'hang': h, 'so': len(fs), 'giay': g}
        if l: dt[t]['lap'] = True
        if t == 'die':
            mo = r.get('mo', dcu.get('die', {}).get('mo'))
            if mo is not None: dt[t]['mo'] = mo
        for k in ('lap_tu', 'lap_den', 've'):
            if k in r: dt[t][k] = r[k]
    b = io.BytesIO(); tam.save(b, 'PNG', optimize=True)
    ib = rows[0][3][0].getbbox()
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'quai_moi': True, 'ma': cu, 'ten_pl': cfg['ma'], 'ten': cfg['ten'], 'vung': tcu.get('vung', cfg.get('vung')), 'net': NET,
           'khung_rong': fw // NET, 'khung_cao': fh // NET, 'goc': [(fx - x0) // NET, (fy - y0) // NET],
           'rong': tcu.get('rong') or (ib[2] - ib[0]) // NET, 'cao': tcu.get('cao') or (ib[3] - ib[1]) // NET,
           'dong_tac': dt,
           'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
    if tcu.get('bong'): tep['bong'] = tcu['bong']
    return tep, tam


def main():
    ghi = '--ghi' in sys.argv
    chon = json.load(open(os.path.join(SRC, 'chon.json'), encoding='utf-8'))
    ds = [a for a in sys.argv[1:] if not a.startswith('--')] or list(chon)
    for cu in ds:
        cfg = chon[cu]
        tep, tam = dung(cu, cfg)
        print(cu, '→', cfg['ma'], 'khung', tep['khung_rong'], 'x', tep['khung_cao'], 'goc', tep['goc'], 'tam', tam.size,
              '%.0f KB' % (len(tep['tam']) * 3 / 4 / 1024), {k: v['so'] for k, v in tep['dong_tac'].items()})
        assert max(tam.size) <= 8192 and tam.size[0] * tam.size[1] <= 16000000  # trang > 2048 do game/build.py chia (F4)
        if ghi:
            with open(os.path.join(OUT, cu + '.sprite.json'), 'w', encoding='utf-8') as f:
                json.dump(tep, f, ensure_ascii=False, separators=(',', ':'))
            tam.save(os.path.join(SRC, cu, 'tam-' + cfg['ma'] + '.png'))


if __name__ == '__main__':
    main()
