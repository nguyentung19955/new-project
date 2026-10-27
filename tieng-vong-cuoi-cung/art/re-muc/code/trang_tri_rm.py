"""Bước 4 – mảnh TRANG TRÍ ĐỊA HÌNH Rễ Mục cho module game/runtime/trang-tri-dia-hinh.js (cùng dạng JSON với
art/the-gioi-moi/cong-lang-v3/cong-lang-v3.json: boi 2, anh{tep, co_anh}, o{anh, khung, neo, co_logic}).
  mang-re-1..4   mảng rễ lớn che vân lặp của thân (như 'mang-go*' Cổng làng): KHÔNG có ảnh gen riêng → dựng từ chính 8 ô thân
                 gen phóng 2,3× (rễ to gấp đôi ô → phá nhịp 32 px), cắt theo mảng lởm chởm, tối 7 % + bớt màu 5 % (mức đã duyệt
                 cho mảng gỗ Cổng làng), mép mảng mờ 3 px. ≈ 112 logic, neo góc trên-trái; game cắt theo ô đặc (cat:'dac').
  chan-re-1, chan-re-2   chân rễ góc (chỗ sàn gặp tường): từ gốc rễ mục (do-vat gen) – 1: nửa phải của gốc, mép cắt mờ dần để
                 dán vào tường; 2: cả gốc thu 0,7. Neo (mép trái = mặt tường, đáy = mặt sàn); lat = 1 cho góc phải.
  Hệ: 2x. Ra: trang-tri/re-muc-tt.png + re-muc-tt.json."""
import os
import sys

import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung_rm import TT, DOVAT, doi_co, luu_png, luu_json, xep_atlas, toi_bot_mau, LUM

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gach_rm import bo_than_rm, TOI_THAN, LC   # noqa: E402

R = 192


def mo_dan(rgba, canh, px):
    a = rgba.astype(np.float64)
    h, w = a.shape[:2]
    if canh == 'trai':
        f = np.clip((np.arange(w) + 0.5) / px, 0, 1)
        a[..., 3] *= f[None, :]
    elif canh == 'phai':
        f = np.clip((w - np.arange(w) - 0.5) / px, 0, 1)
        a[..., 3] *= f[None, :]
    o = np.round(a).astype(np.uint8)
    o[o[..., 3] == 0] = 0
    return o


def mang_re(F, i, seed):
    """Mảng ~224×216 (2x): thân ô gen (4 ô ghép 2×2, liền) phóng 2,3× → cắt mảng lởm chởm (bán kính theo góc, 5 sóng)."""
    rng = np.random.default_rng(seed)
    o = [F[(i + k) % 8] for k in range(4)]
    big = np.concatenate([np.concatenate([o[0], o[1]], 1), np.concatenate([o[2], o[3]], 1)], 0)   # 384×384 ở R
    k = 2.3 * 64 / R                                 # về 2x rồi phóng 2,3
    big = doi_co(big, round(big.shape[1] * k), round(big.shape[0] * k))
    H, W = big.shape[:2]
    cy, cx = H / 2 + rng.uniform(-20, 20), W / 2 + rng.uniform(-20, 20)
    yy, xx = np.mgrid[0:H, 0:W] + 0.5
    ang = np.arctan2(yy - cy, xx - cx)
    rad = 108 * (1 + 0.11 * np.sin(2 * ang + rng.uniform(0, 6.3)) + 0.09 * np.sin(3 * ang + rng.uniform(0, 6.3)) + 0.06 * np.sin(5 * ang + rng.uniform(0, 6.3))
                 + 0.04 * np.sin(8 * ang + rng.uniform(0, 6.3)) + 0.035 * np.sin(13 * ang + rng.uniform(0, 6.3)))
    d = np.hypot((yy - cy), (xx - cx) * rng.uniform(0.96, 1.08))
    m = np.clip((rad - d) / 3.0, 0, 1)
    out = big.astype(np.float64)
    out[..., 3] *= m
    out = np.round(out).astype(np.uint8)
    out[out[..., 3] == 0] = 0
    ys, xs = np.nonzero(out[..., 3] > 0)
    out = out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return toi_bot_mau(out, 0.93, 0.95)


def chay():
    Fr, C = bo_than_rm()
    F = [LC.lam_toi(f, TOI_THAN) for f in Fr]
    items, meta_o = [], {}
    for i in range(4):
        im = mang_re(F, i * 2, 20 + i)
        items.append((f'mang-re-{i + 1}', im))
        meta_o[f'mang-re-{i + 1}'] = {'neo': [0, 0], 'ghi_chu': 'mảng rễ lớn che vân lặp (thân gen phóng 2,3×, tối 7 %); neo góc trên-trái; cat dac'}
    goc = np.array(Image.open(os.path.join(DOVAT, 'goc-re.png')).convert('RGBA'))
    h, w = goc.shape[:2]
    nua = goc[:, w // 2 - 6:].copy()
    nua = mo_dan(nua, 'trai', 8)
    items.append(('chan-re-1', nua))
    meta_o['chan-re-1'] = {'neo': [0, int(nua.shape[0])], 'ghi_chu': 'chân rễ góc: nửa phải gốc rễ mục, mép cắt dán vào tường; neo (mặt tường, mặt sàn); lat=1 cho góc phải'}
    nho = doi_co(goc, round(w * 0.7), round(h * 0.7))
    items.append(('chan-re-2', nho))
    meta_o['chan-re-2'] = {'neo': [int(nho.shape[1] * 0.35), int(nho.shape[0])], 'ghi_chu': 'gốc rễ mục thu 0,7 làm chân rễ thấp; neo (35 % bề rộng, đáy)'}
    at, pos = xep_atlas(items, rong=1024)
    os.makedirs(TT, exist_ok=True)
    luu_png(at, f'{TT}/re-muc-tt.png')
    o = {}
    for ten, v in pos.items():
        x, y, ww, hh = v
        o[ten] = dict({'anh': 're-muc-tt.png', 'khung': v, 'co_logic': [ww / 2, hh / 2]}, **meta_o[ten])
    luu_json({
        'boi': 2,
        'ghi_chu': 'Trang trí địa hình Rễ Mục – cùng dạng cong-lang-v3.json (khung / neo px 2x). Mảng rễ: mang-re* (cat dac); chân rễ góc: chan-re-1/2. '
                   'Ghép vào game: gộp o + anh vào JSON trang trí đang nạp (xem game/thu-re-muc/GHI-CHU.md).',
        'anh': {'re-muc-tt': {'tep': 're-muc-tt.png', 'co_anh': [int(at.shape[1]), int(at.shape[0])]}},
        'o': o,
    }, f'{TT}/re-muc-tt.json')
    print('trang trí Rễ Mục:', {k: v['co_logic'] for k, v in o.items()}, 'atlas', at.shape[1], '×', at.shape[0])


if __name__ == '__main__':
    chay()
