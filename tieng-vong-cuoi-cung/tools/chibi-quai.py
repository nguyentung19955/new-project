#!/usr/bin/env python3
"""Quái chibi 1 tư thế (nền trắng) → khung PNG trong suốt + animation TẠM bằng biến dạng.

Chạy từ tieng-vong-cuoi-cung/:
  python3 tools/chibi-quai.py art/chibi/quai/quai-chuong-go.png --ra art/chibi/quai/khung --cao 256

Quy ước giống Lam (tools/chibi-tach-khung.py): ô 512, pivot giữa hai bàn chân tại (256, 500).
Lam đứng ≈ 344 px trong ô 512 → 160 px trên màn (ô 240). Quái --cao 256 trong ô 512 → 120 px trên màn.
Ra:
  dung.png                 ô 512, tư thế gốc
  game/dung.png            ô 240 (cỡ game, cùng hệ số với Lam 512→240)
  nhun/khung-N.png (+game/) 4 khung: co giãn dọc ±2,5% (giữ thể tích) – TẠM thay idle
  lac/khung-N.png  (+game/) 6 khung: nghiêng ±3° quanh pivot + nhún nhẹ – TẠM thay đi bộ
  nhun/xem-thu.gif, lac/xem-thu.gif
"""
import argparse, importlib.util, json, math, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

_sp = importlib.util.spec_from_file_location('t', os.path.join(os.path.dirname(__file__), 'chibi-tach-khung.py'))
t = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(t)

O, DAY, GAME = 512, 500, 240


def pivot_hai_chan(rgba):
    """Giữa tâm 2 bàn chân: 2 thành phần lớn nhất trong dải 8% dưới cùng."""
    al = rgba[..., 3] > 128
    ys = np.where(al.any(1))[0]
    day, top = ys.max(), ys.min()
    band = np.zeros_like(al)
    y0 = day - int((day - top) * 0.08)
    band[y0:day + 1] = al[y0:day + 1]
    lab, n = ndi.label(band)
    dien = ndi.sum(band, lab, range(1, n + 1))
    od = np.argsort(dien)[::-1][:2]
    cx = [np.where(lab == i + 1)[1].mean() for i in od]
    return float(np.mean(cx)), float(day), len(od)


def bo_lo_trang(rgba, toi_thieu=40):
    """Xoá lỗ trắng kín còn sót (vd lòng quai treo chuông): rất sáng, gần như không màu.
    Mắt phát sáng màu kem/vàng (bão hoà cao) nên không bị đụng."""
    a = rgba[..., :3].astype(int)
    trang = (rgba[..., 3] > 0) & (a.min(-1) > 215) & (a.max(-1) - a.min(-1) < 30)
    lab, n = ndi.label(trang)
    out = rgba.copy()
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = lab[sl] == i
        if m.sum() >= toi_thieu:
            mm = ndi.binary_dilation(m, iterations=2)
            out[sl][..., 3][mm] = np.minimum(out[sl][..., 3][mm], np.where(m, 0, 140)[mm])
    return out


def bien_dang(rgba, px, py, sx=1.0, sy=1.0, goc=0.0):
    """Co giãn (sx, sy) rồi xoay `goc` độ quanh pivot (px, py). Ảnh premultiplied, nội suy bậc 1."""
    a = rgba.astype(np.float32)
    pm = a.copy(); pm[..., :3] *= a[..., 3:4] / 255
    H, W = rgba.shape[:2]
    r = math.radians(goc)
    c, s = math.cos(r), math.sin(r)
    # ánh xạ ngược: điểm đích (y,x) → nguồn
    M = np.array([[c / sy, s / sy], [-s / sx, c / sx]])  # (dy,dx) đích → nguồn, xoay + co giãn
    off = np.array([py, px]) - M @ np.array([py, px])
    out = np.dstack([ndi.affine_transform(pm[..., i], M, offset=off, order=1, mode='constant', cval=0)
                     for i in range(4)])
    al = np.clip(out[..., 3], 0, 255)
    rgb = np.where(al[..., None] > 0.5, out[..., :3] * 255 / np.maximum(al[..., None], 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('vao'); ap.add_argument('--ra', required=True)
    ap.add_argument('--cao', type=float, default=256, help='chiều cao quái trong ô 512 (256 → 120 px trên màn)')
    a = ap.parse_args()

    rgba = bo_lo_trang(t.bo_nen(np.asarray(Image.open(a.vao).convert('RGB'))))
    hangs = t.tach_khung(rgba, 1)
    k = max(hangs[0], key=lambda q: q['img'].shape[0] * q['img'].shape[1])
    img = k['img']
    px, py, nchan = pivot_hai_chan(img)
    h_goc = img.shape[0]
    s = a.cao / h_goc
    # đệm để xoay không bị cắt, biến dạng ở độ phân giải gốc rồi mới thu
    pad = int(h_goc * 0.1)
    big = np.pad(img, ((pad, pad), (pad, pad), (0, 0)))
    bpx, bpy = px + pad, py + pad

    def ra_o(arr):
        sc = t.doi_co(arr, s)
        o, mat = t.dat_o(sc, bpx * s, bpy * s)
        return Image.fromarray(o, 'RGBA'), mat

    os.makedirs(os.path.join(a.ra, 'game'), exist_ok=True)
    dung, mat = ra_o(big)
    dung.save(os.path.join(a.ra, 'dung.png'), optimize=True)
    t.thu_nho(dung, GAME).save(os.path.join(a.ra, 'game', 'dung.png'), optimize=True)

    anim = {
        # nhún: co giãn dọc ±2,5%, ngang ngược chiều để giữ thể tích
        'nhun': [dict(sy=1 + 0.025 * math.sin(2 * math.pi * i / 4), goc=0) for i in range(4)],
        # lắc: nghiêng ±3° quanh pivot, nhún 1,5% ở hai đầu lắc
        'lac': [dict(sy=1 - 0.015 * abs(math.sin(2 * math.pi * i / 6)), goc=3 * math.sin(2 * math.pi * i / 6))
                for i in range(6)],
    }
    fps = {'nhun': 6, 'lac': 8}
    so_do = dict(vao=a.vao, ti_le_512=round(s, 4), cao_512=a.cao, cao_game=round(a.cao * GAME / O, 1),
                 pivot_512=[O // 2, DAY], pivot_game=[GAME // 2, round(DAY * GAME / O)], so_chan_do=nchan,
                 bi_cat_px=mat, ghi_chu='Animation TẠM bằng biến dạng 1 tư thế – thay khi có ảnh gen.', anim={})
    for ten, ds in anim.items():
        d = os.path.join(a.ra, ten); os.makedirs(os.path.join(d, 'game'), exist_ok=True)
        imgs = []
        for i, p in enumerate(ds, 1):
            sx = 1 / math.sqrt(p['sy'])
            arr = bien_dang(big, bpx, bpy, sx=sx, sy=p['sy'], goc=p['goc'])
            im, m = ra_o(arr)
            im.save(os.path.join(d, f'khung-{i}.png'), optimize=True)
            t.thu_nho(im, GAME).save(os.path.join(d, 'game', f'khung-{i}.png'), optimize=True)
            imgs.append(im)
            so_do['bi_cat_px'] = max(so_do['bi_cat_px'], m)
        t.luu_gif([t.thu_nho(i, 256) for i in imgs], os.path.join(d, 'xem-thu.gif'), fps[ten])
        so_do['anim'][ten] = dict(so_khung=len(ds), fps=fps[ten],
                                  tham_so=[{q: round(v, 4) for q, v in p.items()} for p in ds])
    json.dump(so_do, open(os.path.join(a.ra, 'quai-chuong-go.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({q: v for q, v in so_do.items() if q != 'anim'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
