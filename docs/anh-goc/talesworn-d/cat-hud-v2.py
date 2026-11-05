#!/usr/bin/env python3
"""TALESWORN phiên D (05/11/2026): cắt khung HUD bản 2 (docs/yeu-cau-anh/talesworn-anh-05-11/hud-v2-nguon-chatgpt.png) thành bộ khung
9 mảnh lưu sẵn ở game/art/custom (CHƯA dùng mặc định; ?hudmoi=1 thử khung thanh máu + ô vũ khí, xem js/stage.js drawHud).

Chạy lại được:  python3 docs/anh-goc/talesworn-d/cat-hud-v2.py [--xem]

Như các khung 9 mảnh có sẵn (gd-khung-mau…): ảnh chỉ là VIỀN KHUNG, lòng tối của ảnh gốc bỏ trống (game tự tô lòng). Bảng giấy da giữ lòng giấy.
Cùng một tỉ lệ thu cho mọi mảnh (góc đồng bằng nhau giữa các khung). net 2.
  gd-hud2-thanh-mau    thanh máu      (vien 9 mảnh)
  gd-hud2-thanh-linh-luc thanh linh lực (vien 9 mảnh)
  gd-hud2-o-vk         ô vũ khí vuông (vien 9 mảnh)   gd-hud2-o-vk-2: ô vuông thứ hai
  gd-hud2-nut-tron     khung nút tròn (không 9 mảnh: co cả hình)   gd-hud2-nut-tron-2
  gd-hud2-bang-giay    bảng giấy da   (vien 9 mảnh)
"""
import importlib.util, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('cat', os.path.join(DAY, 'cat-anh-slice.py'))
cat = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cat)
NET = cat.NET
K = 6.2  # điểm nguồn / điểm ảnh (net 2 → 12,4 điểm nguồn mỗi điểm game): thanh máu cao ~13 điểm game như thanh trong trận


def bo_long(o, giu_giay=False):
    """Lòng tối (cụm điểm tối nối với tâm ô) → trong suốt. Trả số điểm đã bỏ."""
    if giu_giay:
        return 0
    px = o[..., :3].astype(int)
    toi = (o[..., 3] > 0) & (cat.luma(px.astype(float)) < 70) & (np.abs(px[..., 0] - px[..., 2]) < 40)
    lab, n = ndimage.label(toi)
    h, w = toi.shape
    tam = lab[h // 2, w // 2]
    if not tam:
        return 0
    m = lab == tam
    # vết mực (đốm xám) nằm trong lòng: cũng bỏ (lòng do game tô)
    long_ = ndimage.binary_fill_holes(m)
    vien = ndimage.binary_erosion(long_, iterations=0) if False else long_
    o[vien] = 0
    return int(vien.sum())


def main():
    A = cat.tach_nen(os.path.join(cat.NGUON, 'hud-v2-nguon-chatgpt.png'))
    hops = cat.cum(A, gian=6, nho=5000)
    hops.sort(key=lambda q: (q[1] // 200, q[0]))
    assert len(hops) == 7, hops
    # thứ tự theo ảnh: hàng 1: thanh máu, ô vuông 1, ô vuông 2; hàng 2: thanh linh lực, nút tròn 1, 2; hàng 3: bảng giấy da
    ten = {}
    for h in hops:
        x0, y0, x1, y1 = h
        w, hh = x1 - x0, y1 - y0
        if w > 1200:
            ten['gd-hud2-bang-giay'] = h
        elif w > 700 and y0 < 150:
            ten['gd-hud2-thanh-mau'] = h
        elif w > 700:
            ten['gd-hud2-thanh-linh-luc'] = h
        elif y0 < 150:
            ten['gd-hud2-o-vk' if 'gd-hud2-o-vk' not in ten else 'gd-hud2-o-vk-2'] = h
        else:
            ten['gd-hud2-nut-tron' if 'gd-hud2-nut-tron' not in ten else 'gd-hud2-nut-tron-2'] = h
    TEN = {'gd-hud2-thanh-mau': 'HUD bản 2 · khung thanh máu', 'gd-hud2-thanh-linh-luc': 'HUD bản 2 · khung thanh linh lực',
           'gd-hud2-o-vk': 'HUD bản 2 · ô vũ khí vuông', 'gd-hud2-o-vk-2': 'HUD bản 2 · ô vũ khí vuông (2)',
           'gd-hud2-nut-tron': 'HUD bản 2 · khung nút tròn', 'gd-hud2-nut-tron-2': 'HUD bản 2 · khung nút tròn (2)',
           'gd-hud2-bang-giay': 'HUD bản 2 · bảng giấy da'}
    xem = []
    for ma in sorted(ten):
        x0, y0, x1, y1 = ten[ma]
        tron = 'nut-tron' in ma
        k = K / 2 if tron else K  # nút tròn lưu to gấp đôi (nút trong trận ~36 điểm game, không co 9 mảnh)
        w = int(round((x1 - x0) / k / NET)) * NET
        h = int(round((y1 - y0) / k / NET)) * NET
        o = cat.thu_net(cat.rieng(A, ten[ma], 2), k, w, h, (x0 + x1) / 2, (y0 + y1) / 2)
        n = bo_long(o, ma == 'gd-hud2-bang-giay')
        d = {'doi_tuong': 'giao-dien', 'ma': ma, 'ten': TEN[ma], 'rong': w // NET, 'cao': h // NET, 'net': NET,
             'anh': cat.png64(Image.fromarray(o)), 'nguon': 'docs/yeu-cau-anh/talesworn-anh-05-11/hud-v2-nguon-chatgpt.png · docs/anh-goc/talesworn-d/cat-hud-v2.py'}
        if not tron:
            # góc đồng ~ 58 điểm nguồn → điểm game; cạnh giữa thẳng nên co giãn được
            v = int(round(58 / (K * NET)))
            d['vien'] = [v, v, v, v]
        cat.ghi(ma, d)
        print('    %s: %d×%d điểm game, bỏ lòng %d điểm ảnh%s' % (ma, w // NET, h // NET, n, ', vien %s' % d['vien'] if 'vien' in d else ''))
        xem.append(o)
    if '--xem' in sys.argv:
        os.makedirs(cat.XEM, exist_ok=True)
        W = max(f.shape[1] for f in xem) + 16
        H = sum(f.shape[0] + 8 for f in xem) + 8
        cv = Image.new('RGBA', (W, H), (60, 84, 52, 255))
        y = 8
        for f in xem:
            cv.alpha_composite(Image.fromarray(f), (8, y))
            y += f.shape[0] + 8
        cv.resize((W * 2, H * 2), Image.NEAREST).save(os.path.join(cat.XEM, 'cat-hud-v2-x2.png'))


if __name__ == '__main__':
    main()
