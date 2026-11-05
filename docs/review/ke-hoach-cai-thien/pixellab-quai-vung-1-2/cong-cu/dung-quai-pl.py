#!/usr/bin/env python3
"""Ghép khung PixelLab của quái vùng 1–2 thành tấm .sprite.json (docs/anh-goc/pixellab-quai-vung-1-2/<mã cũ>/khung/<hàng>-NN.png).

Giống hệt cách của phiên quái nấm (pixellab-quai-nam/cong-cu/dung-quai-pl.py): chỉ CẮT + ĐẶT + GHÉP, không vẽ / vá / đổi màu điểm ảnh nào.
- Mọi khung một con cùng một khung vẽ PixelLab (cùng nhân vật, cùng khung xương, hướng south-east) → MỘT ô cắt chung, không dời riêng khung nào.
- Điểm neo (goc) = giữa thân theo chiều ngang + đáy hình ở khung idle-00, net 2 (2 điểm ảnh PixelLab = 1 điểm game).
- Hàng thêm (tele_<chiêu>, atk_<chiêu>, phase): game/js/quai_pl.js đọc từ tệp và dùng khi quái ra đúng chiêu đó.
Chạy:  python3 docs/review/ke-hoach-cai-thien/pixellab-quai-vung-1-2/cong-cu/dung-quai-pl.py [--ghi] [mã cũ ...]
"""
import base64, glob, io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'anh-goc', 'pixellab-quai-vung-1-2')
OUT = os.path.join(ROOT, 'game', 'art', 'custom')
NET = 2
CFG = json.load(open(os.path.join(os.path.dirname(__file__), 'cau-hinh.json'), encoding='utf-8'))


def khung(con, ten):
    fs = sorted(glob.glob(os.path.join(SRC, con, 'khung', ten + '-[0-9][0-9].png')))
    return [Image.open(f).convert('RGBA') for f in fs]


def dung(con, cfg):
    rows = []
    for r in cfg['rows']:
        fs = khung(con, r['ten'])
        if not fs:
            raise SystemExit('%s: thiếu khung %s' % (con, r['ten']))
        rows.append((r, fs))
    allf = [f for _, fs in rows for f in fs]
    W, H = allf[0].size
    assert all(f.size == (W, H) for f in allf), con + ': khung khác cỡ'
    bbs = [f.getbbox() for f in allf if f.getbbox()]
    bb = [min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs)]
    a = np.array(rows[0][1][0])[..., 3] > 0
    ys, xs = np.where(a)
    by = int(ys.max())
    fx = int(round((xs.min() + xs.max() + 1) / 2))  # giữa thân (khung đứng): nhiều con không có chân rõ (bay, bò ngang) — neo giữa thân để lật trái/phải không lệch khỏi hộp va chạm
    fy = by + 1
    x0, y0 = bb[0] - 2, bb[1] - 2
    if (fx - x0) % 2: x0 -= 1
    if (fy - y0) % 2: y0 -= 1
    x1, y1 = bb[2] + 2, bb[3] + 2
    if (x1 - x0) % 2: x1 += 1
    if (y1 - y0) % 2: y1 += 1
    fw, fh = x1 - x0, y1 - y0
    ncot = max(len(fs) for _, fs in rows)
    tam = Image.new('RGBA', (fw * ncot, fh * len(rows)), (0, 0, 0, 0))
    dt = {}
    for h, (r, fs) in enumerate(rows):
        for i, f in enumerate(fs):
            tam.paste(f.crop((x0, y0, x1, y1)), (i * fw, h * fh))
        d = {'hang': h, 'so': len(fs), 'giay': r['giay']}
        if r.get('lap'): d['lap'] = True
        for k in ('lap_tu', 'lap_den', 'mo'):
            if k in r: d[k] = r[k]
        dt[r['ten']] = d
    ib = rows[0][1][0].getbbox()
    rong, cao = (ib[2] - ib[0] + 1) // NET, (ib[3] - ib[1] + 1) // NET
    b = io.BytesIO(); tam.save(b, 'PNG', optimize=True)
    # Tấm mới mang THẲNG mã quái cũ (con) + "quai_moi"; tấm ChatGPT cũ chuyển sang <mã>-plcu ("quai_cu_cua", chỉ nạp khi ?quaipl=0).
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'quai_moi': True, 'ma': con, 'ten_pl': cfg['ma'], 'ten': cfg['ten'], 'vung': cfg['vung'], 'net': NET,
           'khung_rong': fw // NET, 'khung_cao': fh // NET, 'goc': [(fx - x0) // NET, (fy - y0) // NET], 'rong': rong, 'cao': cao,
           'dong_tac': dt, 'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
    return tep, tam


def doi_cu(con, cfg):
    """Tấm ChatGPT cũ <con>.sprite.json (và dáng pha <con>-p2/-p3 của trùm) → <mã>-plcu.sprite.json, mục quai_cu_cua = mã cũ. Chỉ làm một lần."""
    for ma in [con] + cfg.get('pha', []):
        f = os.path.join(OUT, ma + '.sprite.json')
        if not os.path.exists(f):
            continue
        d = json.load(open(f, encoding='utf-8'))
        if d.get('quai_moi'):
            continue
        d['ma'] = ma + '-plcu'; d['quai_cu_cua'] = ma
        with open(os.path.join(OUT, ma + '-plcu.sprite.json'), 'w', encoding='utf-8') as g:
            json.dump(d, g, ensure_ascii=False, separators=(',', ':'))
        os.remove(f)


def main():
    ghi = '--ghi' in sys.argv
    chi = [x for x in sys.argv[1:] if not x.startswith('--')]
    for con, cfg in CFG.items():
        if chi and con not in chi:
            continue
        if not os.path.isdir(os.path.join(SRC, con, 'khung')):
            continue
        tep, tam = dung(con, cfg)
        print(cfg['ma'], 'khung', tep['khung_rong'], 'x', tep['khung_cao'], 'goc', tep['goc'], 'than', tep['rong'], 'x', tep['cao'],
              'tam', tam.size, '%.0f KB' % (len(tep['tam']) * 3 / 4 / 1024), {k: v['so'] for k, v in tep['dong_tac'].items()})
        if ghi:
            doi_cu(con, cfg)
            cu = json.load(open(os.path.join(OUT, con + '-plcu.sprite.json'), encoding='utf-8'))
            if cu.get('bo_va'): tep['bo_va'] = cu['bo_va']  # giữ y các vá tạm của game như tấm cũ (js/mobs.js boVa)
            with open(os.path.join(OUT, con + '.sprite.json'), 'w', encoding='utf-8') as f:
                json.dump(tep, f, ensure_ascii=False, separators=(',', ':'))
            tam.save(os.path.join(SRC, con, 'tam-' + cfg['ma'] + '.png'))


if __name__ == '__main__':
    main()
