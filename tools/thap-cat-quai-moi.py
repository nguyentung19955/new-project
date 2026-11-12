# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt tấm 4 QUÁI MỚI (12/11): docs/demo-hop-tuong/thap-art/raw_quai_moi.png (1254×1254, 4 hàng × 4 khung, nền magenta)
→ thap/assets/quai_<id>.png: dải đi 4 khung 768×192 như quai_bo.png (quaianim.js vẽ dải 4 khung, hoà 2 khung liền nhau).
  hàng 1 bo_khien (bọ khiên) · hàng 2 nam_hoi (nấm hồi máu, giữ bào tử quanh thân) · hàng 3 ca_no (cá nóc nổ — khung 1→3 PHÌNH TO
  là cố ý: một tỉ lệ chung cho cả hàng, neo theo tâm thân) · hàng 4 ma_troi: CHỈ KHUNG 1 (khung 2–4 vẽ bán trong suốt trên nền
  magenta, không tách sạch được) → 4 khung = khung 1 co giãn nhẹ (nhấp nhô); độ mờ tàng hình do code đặt (globalAlpha).
Tách nền: alpha = 1 − (min(R,B) − G) / độ magenta của nền (đúng với mọi màu thân có G ≥ min(R,B): xanh thép, bạc hà, cam đỏ, xanh ma trơi,
  quầng sáng / tia lửa mờ) rồi TÁCH TRỘN màu nền khỏi điểm bán trong suốt → không viền hồng; bỏ đốm lẻ; thu Lanczos nhân-trước-alpha.
Chạy: python3 tools/thap-cat-quai-moi.py   (in khung bao thân từng khung để chọn QUAI[id].co)"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_quai_moi.png')
ASS = os.path.join(GOC, 'thap/assets')
O = 192          # cạnh 1 khung ra
LE = 5           # lề trong suốt quanh khung lớn nhất (px ra)
HANG = ['bo_khien', 'nam_hoi', 'ca_no', 'ma_troi']


def tach_nen(cell, bg):
    r, g, b = cell[..., 0], cell[..., 1], cell[..., 2]
    mb = min(bg[0], bg[2]) - bg[1]
    a = np.clip(1 - (np.minimum(r, b) - g) / mb, 0, 1)
    a = np.where(a < 0.06, 0, np.where(a > 0.94, 1, a))
    an = np.maximum(a, 1e-3)[..., None]
    f = (cell - (1 - a[..., None]) * bg) / an          # tách trộn nền
    f = np.where((a > 0)[..., None] & (a < 1)[..., None], f, cell)
    return np.clip(np.dstack([f, a * 255]), 0, 255)


def bo_dom(a, nho, giu_gan=None):
    """bỏ đốm lẻ < nho px; giu_gan = (mặt nạ thân, px): đốm xa thân hơn px cũng bỏ."""
    m = a[..., 3] > 20
    lab, n = ndimage.label(m, structure=np.ones((3, 3)))
    if not n: return a
    sz = ndimage.sum(m, lab, range(1, n + 1))
    xoa = np.isin(lab, 1 + np.nonzero(sz < nho)[0])
    a[xoa | ~m & (a[..., 3] < 20)] = 0
    return a


def than(a):
    """mặt nạ khối lớn nhất (thân) + tâm lõi thân (ăn mòn bỏ râu / ngòi / bào tử)."""
    m = a[..., 3] > 128
    lab, n = ndimage.label(m)
    sz = ndimage.sum(m, lab, range(1, n + 1)); T = lab == (int(np.argmax(sz)) + 1)
    e = ndimage.binary_erosion(T, iterations=max(2, a.shape[0] // 14))
    if e.sum() < T.sum() * 0.1: e = T
    ys, xs = np.nonzero(e)
    return T, xs.mean(), ys.mean()


def dat(a, cx, cy, s, ra, kx=1.0, ky=1.0):
    """ô vuông cạnh s (nguồn) tâm (cx, cy) → ra×ra, Lanczos nhân-trước-alpha; kx/ky: co giãn quanh tâm (ma trơi nhấp nhô)."""
    im = Image.fromarray(a.astype(np.uint8), 'RGBA').convert('RGBa')
    w, h = s / kx, s / ky
    x0, y0 = cx - w / 2, cy - h / 2
    P = 8
    pad = Image.new('RGBa', (im.width + 2 * P + int(s), im.height + 2 * P + int(s)), (0, 0, 0, 0))
    ox = oy = P + int(s / 2)
    pad.paste(im, (ox, oy))
    q = pad.resize((ra, ra), Image.LANCZOS, box=(x0 + ox, y0 + oy, x0 + ox + w, y0 + oy + h))
    return q.convert('RGBA')


def main():
    im = np.asarray(Image.open(RAW).convert('RGB')).astype(np.float32)
    H, W = im.shape[:2]; ch, cw = H / 4, W / 4
    bg = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]).reshape(-1, 3), axis=0)
    print('nền', bg)
    for hi, id in enumerate(HANG):
        ks = []
        for c in range(4):
            cell = im[int(round(hi * ch)):int(round((hi + 1) * ch)), int(round(c * cw)):int(round((c + 1) * cw))]
            a = bo_dom(tach_nen(cell, bg), 14)
            # mảnh lọt từ ô bên cạnh: khối nhỏ chạm mép ô
            m = a[..., 3] > 8; lab, n = ndimage.label(m, structure=np.ones((3, 3)))
            sz = ndimage.sum(m, lab, range(1, n + 1))
            for k in set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])).tolist()) - {0}:
                if sz[k - 1] < m.size * 0.01: a[lab == k] = 0
            ks.append(a)
        if id == 'ma_troi': ks = [ks[0]] * 4
        tt = [than(a) for a in ks]
        # nửa cạnh ô nguồn = khoảng xa nhất từ tâm lõi tới mép phần nhìn thấy (mọi khung) → một tỉ lệ chung cả hàng
        r = 0
        for a, (T, cx, cy) in zip(ks, tt):
            ys, xs = np.nonzero(a[..., 3] > 20)
            r = max(r, cx - xs.min(), xs.max() - cx, cy - ys.min(), ys.max() - cy)
        bien = [(1, 1), (1.035, 0.965), (1, 1), (0.965, 1.035)] if id == 'ma_troi' else [(1, 1)] * 4
        if id == 'ma_troi': r *= 1.04
        s = 2 * r * O / (O - 2 * LE)
        dai = Image.new('RGBA', (O * 4, O), (0, 0, 0, 0))
        for i, (a, (T, cx, cy)) in enumerate(zip(ks, tt)):
            f = dat(a, cx, cy, s, O, *bien[i]); dai.paste(f, (i * O, 0))
            b = np.asarray(f)[..., 3] > 128; lab, n = ndimage.label(b); sz = ndimage.sum(b, lab, range(1, n + 1))
            ys, xs = np.nonzero(lab == (int(np.argmax(sz)) + 1))
            print(id, 'khung', i, 'thân %d×%d px (ô %d) · tâm thân (%.0f, %.0f)' % (xs.max() - xs.min() + 1, ys.max() - ys.min() + 1, O, (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2))
        dai.save(os.path.join(ASS, 'quai_' + id + '.png'), optimize=True)
        print('→ thap/assets/quai_' + id + '.png', dai.size, 'tỉ lệ thu %.3f' % (O / s))


if __name__ == '__main__':
    main()
