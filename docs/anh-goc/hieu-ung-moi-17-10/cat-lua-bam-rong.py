#!/usr/bin/env python3
"""LỬA BÁM THÂN RỘNG (17/10 tối, docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/bao-cao.md).

Ảnh chủ game gen: lua-bam-than-rong.png — 1 hàng 4 khung lửa cháy bè ngang, nền #00FF00.
→ game/art/custom/hu-bam-lua-rong.sprite.json (hiệu ứng lặp 4 khung, như hu-bam-lua; js/fx.js fx.entity vẽ cho quái thân bè / to,
  co theo BỀ NGANG thân của bảng neo js/dinh_quai_bang.js; ?luarong=0 tắt).
Cách làm: bỏ nền xanh (khử viền xanh), tách 4 khung theo cột trống (gộp tàn lửa rời vào khung gần), mỗi khung đặt ĐÁY-GIỮA chung
(gốc lửa trùng nhau → không nhảy), thu nhỏ KIỂU NÉT (do-net/cong-cu/thu_net.thu) về RONG điểm ảnh game bề ngang, ≤ 48 màu;
bản nét 2 ("tam") + nét 3 / 4 ("tam_n3", "tam_n4", tải lười khi ?netcao) cùng khung bao.
Chạy (từ gốc repo):  python3 docs/anh-goc/hieu-ung-moi-17-10/cat-lua-bam-rong.py"""
import base64, json, os, sys
import numpy as np
from PIL import Image
DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'do-net', 'cong-cu'))
import thu_net  # noqa: E402

ANH = os.path.join(DAY, 'lua-bam-than-rong.png')
RA = os.path.join(GOC, 'game', 'art', 'custom', 'hu-bam-lua-rong.sprite.json')
RONG = 40      # bề ngang khung (điểm ảnh game) — game co theo bề ngang thân quái
MA = 'hu-bam-lua-rong'


def main():
    a = np.array(Image.open(ANH).convert('RGBA'))
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    nen = (g > 120) & (g - np.maximum(r, b) > 60)
    fg = ~nen
    m = fg & (g > np.maximum(r, b))  # khử ám xanh: lửa không có xanh lá
    a[..., 1] = np.where(m, np.maximum(r, b), g).astype(np.uint8)
    a[..., 3] = np.where(fg, 255, 0).astype(np.uint8)
    a[~fg] = 0
    cot = fg.any(0)
    xs = np.nonzero(cot)[0]
    doan, s, p = [], xs[0], xs[0]
    for x in xs[1:]:
        if x - p > 1:
            doan.append([s, p + 1]); s = x
        p = x
    doan.append([s, p + 1])
    while len(doan) > 4:
        i = int(np.argmin([doan[j + 1][0] - doan[j][1] for j in range(len(doan) - 1)]))
        doan[i] = [doan[i][0], doan[i + 1][1]]; del doan[i + 1]
    assert len(doan) == 4, doan
    kh = []
    for x0, x1 in doan:
        k = a[:, x0:x1]
        ys = np.nonzero(k[..., 3].any(1))[0]
        kh.append(k[ys.min():ys.max() + 1])
    W0 = max(k.shape[1] for k in kh); H0 = max(k.shape[0] for k in kh)
    cells = []
    for k in kh:  # đáy-giữa chung
        c = np.zeros((H0, W0, 4), np.uint8)
        ox = (W0 - k.shape[1]) // 2
        c[H0 - k.shape[0]:, ox:ox + k.shape[1]] = k
        cells.append(c)
    fw = RONG; fh = int(round(H0 * RONG / W0))
    tep = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': MA, 'ten': 'Đang cháy trên thân rộng (quái bè / to)',
           'net': 2, 'khung_rong': fw, 'khung_cao': fh, 'goc': [fw / 2, fh - 0.5], 'so': 4, 'giay': 0.45, 'lap': True, 'xoay': False, 'co': 1,
           'tron': 'thuong'}
    for n, key in ((2, 'tam'), (3, 'tam_n3'), (4, 'tam_n4')):
        nho = [thu_net.thu(c, fw * n, fh * n) for c in cells]
        dai = thu_net.giam_mau(np.concatenate(nho, 1), 48)
        tep[key] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(dai)).decode()
        if n == 2:
            Image.fromarray(dai).save(os.path.join(DAY, 'cat-' + MA + '.png'))
        print('%s nét %d: %d×%d, %d KB' % (MA, n, dai.shape[1], dai.shape[0], len(tep[key]) * 3 // 4 // 1024))
    json.dump(tep, open(RA, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('khung %d×%d game, neo %s' % (fw, fh, tep['goc']))


if __name__ == '__main__':
    main()
