#!/usr/bin/env python3
"""KIẾM VUÔNG 17/10 (docs/review/ke-hoach-cai-thien/kiem-vuong/bao-cao.md) — dựng ảnh kiếm mới đầu vuông, cán dài 4 cấp cho game.

Chạy (từ gốc repo):  python3 docs/anh-goc/zed/dung-kiem-vuong.py
Đọc:  docs/anh-goc/zed/moi/vk-kiem-vuong-gif/vk-kiem-vuong/khung-01..04.png  (cắt bằng cat-diem-anh.py từ moi/vk-kiem-vuong.png:
        python3 docs/anh-goc/zed/cat-diem-anh.py docs/anh-goc/zed/moi/vk-kiem-vuong.png --hang 1 --so 4 --ten vk-kiem-vuong
                --ra docs/anh-goc/zed/moi/vk-kiem-vuong-gif)
      game/art/custom/zed-vk.sprite.json  (ô kiếm cũ từng cấp + điểm cầm chuẩn cam-vk-chuan: để đo độ dài lưỡi cũ)
Ghi:  mục "kiem_vuong" trong game/art/custom/zed-vk.sprite.json (các mục cũ KHÔNG đổi; dung-zed-game.py giữ lại mục này khi dựng lại):
        tam   ảnh 4 kiếm (một hàng, cách 2 điểm ảnh), nền trong suốt, thu nhỏ kiểu nét (do-net/cong-cu/thu_net.py), PNG bảng màu
        vk    [x, y, rộng, cao] × 4 cấp trên ảnh đó          cam  điểm cầm (tâm nắm tay TRƯỚC) trên ô từng cấp
        mui   [y trên, y dưới] của cạnh đầu vuông (cột cuối ô) từng cấp — game dùng cho chặn đất + mũi vệt chém
        chan  cột đốc chắn bắt đầu (phía lưỡi) từng cấp      chuoi  cột đuôi chuôi (núm) từng cấp
      docs/review/ke-hoach-cai-thien/kiem-vuong/kiem-vuong-x4.png  (ảnh xem: cũ trên, mới dưới, cùng tỉ lệ game, ×4)

CỠ: cùng tỉ lệ ô với tấm zed-vk (game vẽ ×vk_tl của hàng, không đổi) và LƯỠI (từ đốc chắn tới mũi) dài đúng bằng lưỡi kiếm cũ cùng cấp
→ tầm hình từ nắm tay tới mũi như cũ (vùng trúng không đổi). Cán dài hơn cán cũ (ảnh vẽ cán đủ hai tay) nên ô rộng hơn ô cũ.
ĐIỂM CẦM: cách đốc chắn đúng bằng khoảng cũ (điểm cầm chuẩn cam-vk-chuan → đốc) — nắm tay trước sát chắn tay, như kiếm cũ; tay thứ hai
(khung hai tay) nằm sau nó trên cán. Dọc: giữa bề dày cán ở cột điểm cầm."""
import base64, glob, io, json, os, sys
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu'))
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/cam-vk-chuan'))
import thu_net as TN  # noqa: E402
import do_cam as DC  # noqa: E402

NGUON = os.path.join(DAY, 'moi', 'vk-kiem-vuong-gif', 'vk-kiem-vuong')
TEP_VK = os.path.join(ROOT, 'game/art/custom/zed-vk.sprite.json')
RA_XEM = os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/kiem-vuong')
SO_MAU = 64


def cam_chuan_cu():
    """Điểm cầm kiếm cũ đang dùng trong game (bảng cam-vk-chuan 'moi', khớp tấm hiện tại) — để đo khoảng điểm cầm → đốc chắn."""
    s = open(os.path.join(ROOT, 'game/js/cam_chuan_data.js'), encoding='utf-8').read()
    B = json.loads(s.split('G.CAM_CHUAN_DATA = ', 1)[1].rsplit(';', 1)[0])
    return B['vk_cam']['kiem']['moi']


def be_day(A, x, cy):
    """Đoạn đục liền (y đầu, y cuối) trên cột x chứa hàng cy (hoặc gần cy nhất)."""
    col = A[:, x]
    if not col.any():
        return None
    if not col[cy]:
        ys = np.nonzero(col)[0]; cy = int(ys[np.argmin(np.abs(ys - cy))])
    a, b = cy, cy
    while a > 0 and col[a - 1]: a -= 1
    while b < len(col) - 1 and col[b + 1]: b += 1
    return a, b


def do_nguon(a):
    """Ảnh nguồn một cấp: hàng tâm cán (theo phần quấn đỏ), cột đốc chắn (bề dày vọt ≥ 1,5 × cán + 1, như do_cam.doc_chan)."""
    A = a[..., 3] > 0
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    do = (r > 110) & (g < 70) & (b < 70) & A
    do[:, int(a.shape[1] * 0.35):] = False
    ys, xs = np.nonzero(do)
    cy = int(np.median(ys))
    ext = [(lambda d: 0 if d is None or not A[cy, x] else d[1] - d[0] + 1)(be_day(A, x, cy) if A[cy, x] else None) for x in range(a.shape[1])]
    giua = int(np.median(xs))
    t = float(np.median([e for e in ext[giua - 10: giua + 10] if e > 0]))
    xg = next(x for x in range(giua, a.shape[1]) if ext[x] >= 1.5 * t + 1)
    return cy, xg, t


def main():
    V = json.load(open(TEP_VK, encoding='utf-8'))
    img = Image.open(io.BytesIO(base64.b64decode(V['tam'].split(',', 1)[1]))).convert('RGBA')
    Vd = dict(V, _img=img)
    cam_cu = cam_chuan_cu()
    fs = sorted(glob.glob(os.path.join(NGUON, 'khung-*.png')))
    assert len(fs) == 4, fs
    o, meta = [], {'vk': [], 'cam': [], 'mui': [], 'chan': [], 'chuoi': [], 'ti_le': []}
    x0 = 0
    bang = []
    for cap, f in enumerate(fs):
        r = V['vk']['kiem'][cap]
        xg0, xs0, t0 = DC.doc_chan(Vd, 'kiem', cap, cam_cu[cap])
        luoi_cu = r[2] - xg0                      # lưỡi cũ: đốc chắn → mép phải ô (mũi)
        khe = xg0 - cam_cu[cap][0]                # điểm cầm → đốc chắn (cũ)
        a = np.array(Image.open(f).convert('RGBA'))
        bb = Image.fromarray(a).getbbox(); a = a[bb[1]:bb[3], bb[0]:bb[2]]
        cy, xg, t = do_nguon(a)
        k = luoi_cu / (a.shape[1] - xg)           # điểm ảnh ô / điểm ảnh nguồn
        W, H = max(1, round(a.shape[1] * k)), max(1, round(a.shape[0] * k))
        m = TN.thu(a, W, H)
        o.append(m)
        A = m[..., 3] > 0
        xg1 = int(round(xg * k)); cy1 = int(round(cy * k))
        # đốc chắn trên ảnh đã thu: đo lại như do_cam (cột đầu tiên phía lưỡi dày ≥ 1,5 × cán + 1)
        ext = [(lambda d: d[1] - d[0] + 1 if d else 0)(be_day(A, x, cy1) if A[cy1, x] else None) for x in range(W)]
        t1 = float(np.median([e for e in ext[max(0, xg1 - 12): xg1 - 2] if e > 0]))
        xg1 = next(x for x in range(max(0, xg1 - 6), W) if ext[x] >= 1.5 * t1 + 1)
        cx = round(xg1 - khe, 2)
        d = be_day(A, int(cx), cy1)
        cyc = round((d[0] + d[1] + 1) / 2, 2)
        # đầu vuông: cột cuối có điểm đục
        xm = W - 1
        while not A[:, xm].any(): xm -= 1
        ys = np.nonzero(A[:, max(0, xm - 1): xm + 1].any(1))[0]
        xs_ = int(cx)
        while xs_ > 0 and A[cy1, xs_ - 1]: xs_ -= 1
        meta['vk'].append([x0, 0, W, H]); meta['cam'].append([cx, cyc]); meta['mui'].append([int(ys.min()), int(ys.max()) + 1])
        meta['chan'].append(xg1); meta['chuoi'].append(xs_); meta['ti_le'].append(round(k, 5))
        bang.append((cap, r[2], r[3], W, H, luoi_cu, W - xg1, round(khe, 2), t0, t1, cx - xs_))
        x0 += W + 2
    Ht = max(m.shape[0] for m in o)
    tam = np.zeros((Ht, x0 - 2, 4), np.uint8)
    for m, r in zip(o, meta['vk']):
        tam[:m.shape[0], r[0]:r[0] + r[2]] = m
    tam = TN.giam_mau(tam, SO_MAU)
    png = TN.png_bang_mau(tam)
    meta['tam'] = 'data:image/png;base64,' + base64.b64encode(png).decode('ascii')
    meta['ghi_chu'] = ('Kiếm vuông 17/10 (docs/anh-goc/zed/dung-kiem-vuong.py): thay ô kiếm cũ khi bật (mặc định; ?kiemvuong=0 tắt). '
                       'Cùng tỉ lệ ô với tấm zed-vk; vk = ô từng cấp trên ảnh này; cam = điểm cầm (nắm tay trước) trên ô; '
                       'mui = [y trên, y dưới) cạnh đầu vuông; chan / chuoi = cột đốc chắn / đuôi chuôi.')
    V['kiem_vuong'] = {k: meta[k] for k in ('tam', 'vk', 'cam', 'mui', 'chan', 'chuoi', 'ti_le', 'ghi_chu')}
    s = json.dumps(V, ensure_ascii=False, separators=(',', ':'))
    open(TEP_VK, 'w', encoding='utf-8').write(s)
    print('Ảnh kiếm vuông: %d×%d, %d byte PNG' % (tam.shape[1], tam.shape[0], len(png)))
    print('| Cấp | Ô cũ | Ô mới | Lưỡi cũ → mới (đốc → mũi) | Điểm cầm → đốc | Bề dày cán cũ / mới | Cán sau điểm cầm |')
    print('|---|---|---|---|---|---|---|')
    for c, w0, h0, W, H, l0, l1, kh, t0, t1, can in bang:
        print('| %d | %d×%d | %d×%d | %d → %d | %.2f | %.0f / %.0f | %.1f |' % (c + 1, w0, h0, W, H, l0, l1, kh, t0, t1, can))
    print(json.dumps({k: meta[k] for k in ('vk', 'cam', 'mui', 'chan', 'chuoi')}))
    # ảnh xem: cũ trên, mới dưới, căn điểm cầm, ×4
    os.makedirs(RA_XEM, exist_ok=True)
    Z = 4; Wx = max(max(r[2] for r in meta['vk']), 150) + 30
    xem = Image.new('RGBA', (Wx * 4 * Z // 1, 2 * 90 * Z), (40, 44, 52, 255))
    kv = Image.fromarray(tam)
    for c in range(4):
        r = V['vk']['kiem'][c]
        cu = img.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
        rn = meta['vk'][c]; moi = kv.crop((rn[0], rn[1], rn[0] + rn[2], rn[1] + rn[3]))
        ox = c * Wx * Z + 60 * Z
        for j, (im, cm) in enumerate(((cu, cam_cu[c]), (moi, meta['cam'][c]))):
            im = im.resize((im.width * Z, im.height * Z), Image.NEAREST)
            xem.alpha_composite(im, (int(ox - cm[0] * Z), int((45 + 90 * j) * Z - cm[1] * Z)))
    xem.save(os.path.join(RA_XEM, 'kiem-vuong-x4.png'))


if __name__ == '__main__':
    main()
