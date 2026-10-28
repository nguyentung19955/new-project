#!/usr/bin/env python3
"""Đo độ NÉT của Lam mới 2 khi vẽ trong game (Làm nét 28/10) → game/thu-lam-moi-2/xem-thu/net-28-10/
Không phải bộ kiểm thử tự động: chỉ đo + xuất ảnh so để người duyệt xem.

Cách đo:
  - Vẽ một khung (chém D = dáng đứng tạm, chạy ô 1) trong Chromium bằng ĐÚNG cách của khoi-lam-moi-2.js: canvas bộ đệm = logic × BK,
    setTransform(BK), translate(snap(X)), drawImage(sheet, …, cỡ logic), imageSmoothingQuality 'high'.
    BK 2,166 = iPhone 844×390 @3x ngang (bộ đệm 2079 / 960) ; BK 3 = màn đủ rộng @3x.
  - Tham chiếu = ảnh gen GỐC thu THẲNG một lần (Lanczos, không làm nét) tới đúng cỡ điểm ảnh thật của màn (112 × BK px), cùng neo.
  - Độ nét = trung bình độ lớn gradient (Sobel) của độ sáng (hình phủ lên xám giữa) trong vùng nhân vật, so với tham chiếu (= 100 %).
    Viền vượt (halo) = tỉ lệ điểm có kênh (nhân trước) vượt khoảng min–max 3×3 của bản thu INTER_AREA cùng cỡ quá 4/255 (đo trên sheet).
  - Các bản: sheet 2x PNG (trước) · sheet 2x qua WebP q90 (đúng cách đóng gói artifact trước đây) · sheet 3x mới (PNG = WebP lossless).
Chạy: python3 -B game/thu-lam-moi-2/cong-cu/do-net.py   (~1 phút)"""
import base64, io, json, os, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
CODE = os.path.join(GOC, 'art', 'huong-moi', 'lam-tu-the-2', 'code'); sys.path.insert(0, CODE)
import dung_sheet as DS
SPR = os.path.join(GOC, 'art', 'huong-moi', 'lam-tu-the-2', 'sprite')
OUT = os.path.join(GOC, 'game', 'thu-lam-moi-2', 'xem-thu', 'net-28-10'); os.makedirs(OUT, exist_ok=True)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception:
    FONT = ImageFont.load_default()

BKS = [('2,17', 2079 / 960), ('3', 3.0)]
KHUNG = [('chem1', 3, 'chém D (đứng tạm)'), ('chay', 0, 'chạy ô 1')]
LW, LH, X0, Y0 = 150, 126, 75.37, 119.62          # canvas logic + vị trí neo (lẻ như giữa màn chơi)


def b64png(arr):
    b = io.BytesIO(); Image.fromarray(arr).save(b, 'PNG'); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def webp(arr, **kw):
    b = io.BytesIO(); Image.fromarray(arr).save(b, 'WEBP', method=6, **kw); d = b.getvalue()
    return np.asarray(Image.open(io.BytesIO(d)).convert('RGBA')), len(d)


def sang(rgba):
    """độ sáng (0–1) của hình phủ lên xám 0,5 – alpha thẳng"""
    a = rgba[..., 3:4].astype(np.float32) / 255; c = rgba[..., :3].astype(np.float32) / 255
    c = c * a + 0.5 * (1 - a)
    return c @ np.float32([0.299, 0.587, 0.114])


def grad(L):
    return np.hypot(cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3))


def nhan_truoc(rgba):
    a = rgba.astype(np.float32) / 255; a[..., :3] *= a[..., 3:4]; return a


def halo(sheet, area):
    """tỉ lệ điểm có một kênh (alpha nhân trước) vượt khoảng min–max 3×3 của bản INTER_AREA cùng cỡ quá 4/255, trong vùng có hình"""
    L, R = nhan_truoc(sheet), nhan_truoc(area); k = np.ones((3, 3), np.uint8)
    lo, hi = cv2.erode(R, k), cv2.dilate(R, k)
    v = ((L > hi + 4 / 255) | (L < lo - 4 / 255)).any(-1); m = cv2.dilate((area[..., 3] > 0).astype(np.uint8), k) > 0
    return float(v[m].mean())


def khung_ref(meta, i, BK):
    """khung tham chiếu đặt neo tại điểm ảnh snap(X0·BK) – như game"""
    f = meta['frames'][i]; arr = meta['_mang'][f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']]
    cw, ch = int(np.ceil(LW * BK)), int(np.ceil(LH * BK)); out = np.zeros((ch, cw, 4), np.uint8)
    X, Y = int(round(X0 * BK)), int(round(Y0 * BK)); ox, oy = X - meta['diem_neo']['x'], Y - meta['diem_neo']['y']
    y0, x0 = max(oy, 0), max(ox, 0); y1, x1 = min(oy + f['h'], ch), min(ox + f['w'], cw)
    out[y0:y1, x0:x1] = arr[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    return out


JS = r"""async ([src, f, ax, ay, ppl, BK, LW, LH, X0, Y0, snapDich]) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = Math.ceil(LW * BK); c.height = Math.ceil(LH * BK);
  const ctx = c.getContext('2d'); ctx.setTransform(BK, 0, 0, BK, 0, 0);
  const snap = v => Math.round(v * BK) / BK, sc = 1 / ppl;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.save(); ctx.translate(snap(X0), snap(Y0));
  const dx = snapDich ? Math.round(-ax * sc * BK) / BK : -ax * sc, dy = snapDich ? Math.round(-ay * sc * BK) / BK : -ay * sc;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, dx, dy, f.w * sc, f.h * sc); ctx.restore();
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let s = ''; for (let i = 0; i < d.length; i += 8192) s += String.fromCharCode.apply(null, d.subarray(i, i + 8192));
  return [c.width, c.height, btoa(s)];
}"""


def ve(pg, src, meta, i, BK, snap_dich):
    f = meta['frames'][i]
    w, h, s = pg.evaluate(JS, [src, {k: f[k] for k in 'xywh'}, meta['diem_neo']['x'], meta['diem_neo']['y'],
                               meta['ty_le']['px_nguon_moi_px_logic'], BK, LW, LH, X0, Y0, snap_dich])
    return np.frombuffer(base64.b64decode(s), np.uint8).reshape(h, w, 4).copy()


def do(test, ref):
    m = cv2.dilate(((ref[..., 3] > 5) | (test[..., 3] > 5)).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    return float(grad(sang(test))[m].mean() / grad(sang(ref))[m].mean())


def phong(arr, k, nen=(22, 26, 34)):
    im = Image.new('RGBA', (arr.shape[1], arr.shape[0]), nen + (255,)); im.alpha_composite(Image.fromarray(arr))
    return im.convert('RGB').resize((arr.shape[1] * k, arr.shape[0] * k), Image.NEAREST)


def nhan(im, chu):
    d = ImageDraw.Draw(im); d.rectangle([0, 0, d.textlength(chu, font=FONT) + 10, 20], fill=(12, 15, 20)); d.text((5, 2), chu, font=FONT, fill=(243, 230, 200))
    return im


def main():
    nap = lambda ten, boi: (json.load(open(os.path.join(SPR, 'lam-moi2-%s-%dx.json' % (ten, boi)))),
                            np.asarray(Image.open(os.path.join(SPR, 'lam-moi2-%s-%dx.png' % (ten, boi))).convert('RGBA')))
    kq = {'cach_do': __doc__.split('Cách đo:')[1].split('Chạy:')[0].strip(), 'sheet': {}, 've': {}}
    # --- cấp sheet: 2x INTER_AREA vs 2x Lanczos ; WebP q90 ; 3x mới vs 3x Lanczos không làm nét
    tham = {}
    for boi, loc, net in [(2, 'lanczos', None), (3, 'lanczos', None), (3, 'area', None)]:
        tham[(boi, loc)] = dict(zip(['chay', 'chem1'], DS.dung_ca(boi, loc, net, luu=False)))
    for ten in ('chay', 'chem1'):
        for boi in (2, 3):
            meta, arr = nap(ten, boi); ref = tham[(boi, 'lanczos')][ten]['_mang']
            wq90, n90 = webp(arr, quality=90); wq95, n95 = webp(arr, quality=95); wll, nll = webp(arr, lossless=True)
            sang_p = sang(arr)
            psnr = lambda x: float(10 * np.log10(1 / max(np.mean((sang(x) - sang_p) ** 2), 1e-12)))
            kq['sheet']['%s-%dx' % (ten, boi)] = {
                'png_kb': round(os.path.getsize(os.path.join(SPR, meta['anh'])) / 1024), 'ram_giai_nen_mb': round(arr.size / 2 ** 20, 2),
                'do_net_so_voi_lanczos_cung_co': round(do(arr, ref), 3),
                'halo_ty_le_diem': round(halo(arr, tham[(boi, 'area')][ten]['_mang']) if boi == 3 else halo(arr, arr), 4),
                'webp_q90': {'kb': round(n90 / 1024), 'do_net_so_voi_png': round(do(wq90, arr), 3), 'psnr_db': round(psnr(wq90), 1),
                             'lech_mau_trung_binh_255': round(float(np.abs(wq90[..., :3].astype(int) - arr[..., :3])[arr[..., 3] > 128].mean()), 2)},
                'webp_q95': {'kb': round(n95 / 1024), 'do_net_so_voi_png': round(do(wq95, arr), 3), 'psnr_db': round(psnr(wq95), 1)},
                'webp_lossless': {'kb': round(nll / 1024), 'giong_png_moi_diem_nhin_thay': bool((wll == arr)[arr[..., 3] > 0].all())}}
    # --- cấp vẽ trong game (Chromium, canvas 2D) ---
    tranh = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content('<html><body></body></html>')
        for nbk, BK in BKS:
            ref_bk = dict(zip(['chay', 'chem1'], DS.dung_ca(BK, 'lanczos', None, luu=False)))
            for ten, i, mo_ta in KHUNG:
                m2, a2 = nap(ten, 2); m3, a3 = nap(ten, 3)
                w90 = webp(a2, quality=90)[0]
                ref = khung_ref(ref_bk[ten], i, BK)
                ca = {'2x PNG (trước)': ve(pg, b64png(a2), m2, i, BK, False),
                      '2x WebP q90 (đóng gói trước)': ve(pg, b64png(w90), m2, i, BK, False),
                      '3x mới': ve(pg, b64png(a3), m3, i, BK, True)}
                if BK <= 2: ca['game chọn (BK ≤ 2 → 2x)'] = ve(pg, b64png(a2), m2, i, BK, True)
                kq['ve']['BK %s · %s' % (nbk, mo_ta)] = {
                    'cao_lam_px_that': round(112 * BK, 1), 'he_so_phong_2x': round(BK / 2, 3), 'he_so_phong_3x': round(BK / 3, 3),
                    'do_net_so_voi_gen_thu_thang': {k: round(do(v, ref), 3) for k, v in ca.items()}}
                if ten == 'chem1':
                    tranh.append((nbk, ref, ca))
        b.close()
    # --- ảnh so: phần đầu + thân trên, phóng 4 lần nearest ---
    for nbk, ref, ca in tranh:
        h = ref.shape[0]; ys, xs = np.nonzero(ref[..., 3] > 10); y0 = max(ys.min() - 6, 0); y1 = y0 + int(h * 0.62)
        x0 = max(xs.min() - 6, 0); x1 = min(xs.max() + 6, ref.shape[1])
        cot = [('gen thu thẳng (chuẩn)', ref)] + [(k, v) for k, v in ca.items() if 'game chọn' not in k]
        o = [nhan(phong(v[y0:y1, x0:x1], 4), k) for k, v in cot]
        W = sum(im.width for im in o) + 8 * (len(o) - 1); im = Image.new('RGB', (W, o[0].height + 24), (12, 15, 20)); x = 0
        for t in o: im.paste(t, (x, 24)); x += t.width + 8
        ImageDraw.Draw(im).text((6, 3), 'BK %s (Lam cao %.0f px thật) – đầu + thân trên, phóng 4 lần từng điểm ảnh' % (nbk, 112 * dict(BKS)[nbk]),
                                font=FONT, fill=(243, 230, 200))
        im.save(os.path.join(OUT, 'so-net-bk%s-phong4.png' % nbk.replace(',', '')), optimize=True)
        # 1:1 cả người (đúng cỡ trên màn)
        o = [nhan(phong(v, 1), k.split(' (')[0]) for k, v in cot]
        W = sum(t.width for t in o) + 8 * (len(o) - 1); im = Image.new('RGB', (W, o[0].height), (12, 15, 20)); x = 0
        for t in o: im.paste(t, (x, 0)); x += t.width + 8
        im.save(os.path.join(OUT, 'so-net-bk%s-1x1.png' % nbk.replace(',', '')), optimize=True)
    json.dump(kq, open(os.path.join(OUT, 'do-net.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(kq['sheet'], ensure_ascii=False, indent=1)); print(json.dumps(kq['ve'], ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
