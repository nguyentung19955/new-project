#!/usr/bin/env python3
"""CẮT VỆT CHÉM KIẾM NẶNG (17/10, docs/review/ke-hoach-cai-thien/kiem-nang/bao-cao.md).

Ảnh: vet-kiem-nang-4x6.png (chủ game gen, nền xanh): 4 hàng × 6 khung (ô ngang 256 điểm ảnh; hàng tách theo dải có hình):
  hàng 1 tia lửa / bụi lê đất  → game/art/custom/hu-chem-kiem-nang-1.sprite.json  (lê kiếm: khung 1–3 nhát 1, ở mũi kiếm sát đất)
  hàng 2 vệt chém hất lên       → hu-chem-kiem-nang-2  (nhát 1)
  hàng 3 bổ xuống + nổ đất      → hu-chem-kiem-nang-3  (nhát 2, nổ ở chỗ mũi kiếm chạm đất)
  hàng 4 chém ngang dài         → hu-chem-kiem-nang-4  (nhát 3)
Mỗi hàng: bỏ nền xanh (khử viền xanh), cắt cùng một khung bao cho cả 6 khung (vị trí trong ô giữ nguyên → không nhảy), thu nhỏ KIỂU NÉT
(do-net/cong-cu/thu_net.thu: lấy màu có thật theo ô, alpha 0/255) về KG điểm ảnh game / điểm ảnh gốc, lưu net 2, ≤ 48 màu.
In ra các điểm mốc (điểm ảnh game so với điểm neo "goc", chưa nhân "co") để js/fx.js đặt ảnh theo mũi kiếm (bảng ANH_KN):
  hàng 2, 4: đuôi vệt (điểm bắt đầu) và đầu vệt (điểm kết thúc) đo trên khung to nhất → game xoay + co ảnh sao cho đuôi → mũi kiếm lúc
  bắt đầu vung, đầu → mũi kiếm lúc vừa chém xong (hai điểm); hàng 1, 3: neo = giữa đáy (mặt đất).
Chạy:  python3 docs/anh-goc/kiem-nang/cat-vet-kiem-nang.py
       python3 docs/anh-goc/kiem-nang/cat-vet-kiem-nang.py --gon   (17/10 tối: tấm vet-kiem-nang-gon-trang-4x6.png — vệt GỌN, vẽ TRẮNG để game
       nhuộm màu hệ → hu-chem-kiem-nang-gon-1..4, mốc vet-moc-gon.json; js/fx.js chọn khi ?vetgon khác 0)
"""
import base64, json, os, sys
import numpy as np
from PIL import Image
DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'do-net', 'cong-cu'))
import thu_net  # noqa: E402

GON = '--gon' in sys.argv
ANH = os.path.join(DAY, 'vet-kiem-nang-gon-trang-4x6.png' if GON else 'vet-kiem-nang-4x6.png')
RA = os.path.join(GOC, 'game', 'art', 'custom')
O = 256
KG = 0.2          # điểm ảnh game / điểm ảnh ảnh gốc
NET = 2
HANG = [  # (mã, tên, giây phát 6 khung, kiểu neo)
    ("hu-chem-kiem-nang-1", "Kiếm nặng — tia lửa lê đất", 0.13, "day"),
    ('hu-chem-kiem-nang-2', 'Kiếm nặng — vệt chém hất lên', 0.2, 'hai'),
    ('hu-chem-kiem-nang-3', 'Kiếm nặng — bổ xuống + nổ đất', 0.3, 'day'),
    ('hu-chem-kiem-nang-4', 'Kiếm nặng — chém ngang', 0.22, 'hai'),
]


def nen_xanh(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (g > 120) & (g - np.maximum(r, b) > 60)


def dai_hang(fg):
    ys = np.nonzero(fg.any(1))[0]
    out, s, p = [], ys[0], ys[0]
    for v in ys[1:]:
        if v - p > 8:
            out.append((s, p)); s = v
        p = v
    out.append((s, p))
    return out


def main():
    a = np.array(Image.open(ANH).convert('RGBA'))
    xanh = nen_xanh(a)
    fg = ~xanh
    # khử viền xanh: điểm còn lại mà xanh lá trội → kéo G về max(R, B)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = fg & (g > np.maximum(r, b))
    a[..., 1] = np.where(m, np.maximum(r, b), g).astype(np.uint8)
    a[..., 3] = np.where(fg, 255, 0).astype(np.uint8)
    dai = dai_hang(fg)
    assert len(dai) == 4, dai
    bang = {}
    for j, ((y0, y1), (ma, ten, giay, kieu)) in enumerate(zip(dai, HANG)):
        if GON:
            ma = ma.replace('kiem-nang-', 'kiem-nang-gon-'); ten = ten.replace('Kiếm nặng', 'Kiếm nặng (vệt gọn, trắng — game nhuộm hệ)')
        o = a[max(0, y0 - 2):y1 + 3]
        cells = [o[:, c * O:(c + 1) * O] for c in range(6)]
        # khung bao chung (theo ô)
        u = np.zeros(cells[0].shape[:2], bool)
        for c in cells:
            u |= c[..., 3] > 0
        ys, xs = np.nonzero(u)
        bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        W = int(round((bx1 - bx0) * KG * NET)); H = int(round((by1 - by0) * KG * NET))
        W += W % 2; H += H % 2
        nho = [thu_net.thu(c[by0:by1, bx0:bx1], W, H) for c in cells]
        dai_anh = thu_net.giam_mau(np.concatenate(nho, 1), 48)
        fw, fh = W // NET, H // NET
        # điểm mốc (điểm ảnh game trong khung)
        big = int(np.argmax([(n[..., 3] > 0).sum() for n in nho]))
        mk = nho[big][..., 3] > 0
        yy, xx = np.nonzero(mk)
        if kieu == 'hai':
            if j == 1:   # hất lên: đuôi = điểm thấp nhất bên trái, đầu = điểm cao nhất
                i0 = np.argmax(yy * 1.0 - xx * 0.5); i1 = np.argmin(yy)
            else:        # ngang: đuôi = trái nhất, đầu = phải nhất (ở giữa bề cao)
                i0 = np.argmin(xx + np.abs(yy - np.median(yy)) * 2); i1 = np.argmax(xx - np.abs(yy - np.median(yy)) * 2)
            duoi = (xx[i0] / NET, yy[i0] / NET); dau = (xx[i1] / NET, yy[i1] / NET)
            goc = [round(duoi[0], 1), round(duoi[1], 1)]
            moc = {'duoi': [0, 0], 'dau': [round(dau[0] - duoi[0], 1), round(dau[1] - duoi[1], 1)]}
        else:            # giữa đáy
            cx = (xx.min() + xx.max()) / 2 / NET
            goc = [round(cx, 1), round((yy.max() + 1) / NET, 1)]
            moc = {'rong': round((xx.max() - xx.min() + 1) / NET, 1), 'cao': round((yy.max() - yy.min() + 1) / NET, 1)}
        tep = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'net': NET,
               'khung_rong': fw, 'khung_cao': fh, 'goc': goc, 'so': 6, 'giay': giay, 'lap': False, 'xoay': False, 'co': 1, 'tron': 'thuong',
               'tam': 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(dai_anh)).decode()}
        p = os.path.join(RA, ma + '.sprite.json')
        json.dump(tep, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        bang[ma] = moc
        print('%s: khung %d×%d game, neo %s, mốc %s, %d KB' % (ma, fw, fh, goc, moc, os.path.getsize(p) // 1024))
        Image.fromarray(dai_anh).save(os.path.join(DAY, 'cat-' + ma + '.png'))
    json.dump(bang, open(os.path.join(DAY, 'vet-moc-gon.json' if GON else 'vet-moc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
