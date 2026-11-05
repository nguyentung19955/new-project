#!/usr/bin/env python3
"""TALESWORN phiên D (05/11/2026): cắt ảnh ChatGPT 05/11 cho bản thử 5 phút đầu → game/art/custom/*.sprite.json.

Chạy lại được:  python3 docs/anh-goc/talesworn-d/cat-anh-slice.py [--xem]

Nguồn: docs/yeu-cau-anh/talesworn-anh-05-11/*-nguon-chatgpt.png (nền magenta #FF00FF). Code CHỈ cắt, tách nền, thu nét, ghép:
  - tách nền magenta theo công thức sổ tay (docs/so-tay/so-tay-last-echo.md mục 2.7) + bỏ hẳn điểm "ám hồng" (không để viền hồng);
  - thu nét: mỗi ô lấy màu CÓ THẬT xuất hiện nhiều nhất (ưu tiên viền tối ≥ 30%) — không trung bình nên không nhoè;
  - khiên Fire Guard: lòng khiên trong suốt trên ảnh gốc (nền hồng lộ qua) → phủ lại một lớp TRONG MỜ màu Lửa (alpha thấp)
    lấy đúng màu của vành khiên, chỉ trong vùng vành khép kín (khung vỡ cuối không có lòng);
  - Thương Băng: 1 hình → 4 khung lặp bằng cách đổi độ trong của VÒNG SÁNG dưới thương (thương giữ nguyên).
Ghi (net 2 = ảnh gấp đôi điểm ảnh game):
  hu-trang-muc-lua  6 khung 24×24 lặp      (trang Mực Lửa bay)
  hu-fire-guard     6 khung 64×64          (1–4 lặp quanh trùm, 5–6 vỡ)
  gd-bt-fire-guard  16×16                  (biểu tượng trên đầu trùm)
  gd-page-scrap     18×18                  (vật rơi vẽ 10×10, biểu tượng màn kết quả 17×18)
  gd-nut-doi        40×40                  (mặt nút ĐỔI)
  hu-thuong-bang-dat 4 khung 40×24 lặp     (Thương Băng nằm đất có vòng sáng)
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
NGUON = os.path.join(GOC, 'docs', 'yeu-cau-anh', 'talesworn-anh-05-11')
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
XEM = os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'talesworn-d-gan-anh', 'anh')
NET = 2
FIRE = (242, 104, 56)


def png64(im):
    b = io.BytesIO()
    im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def luma(a):
    return 0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]


def tach_nen(path):
    """RGBA float: tách nền magenta (sổ tay 2.7) + bỏ điểm ám hồng."""
    a = np.array(Image.open(path).convert('RGB')).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2)
    al = np.clip((d - 45) / 105, 0, 1)
    p = np.clip((b - g - 20) / 150, 0, 1) * (r > 110)
    b2 = np.where(p > 0.05, np.minimum(b, g * 0.7 + 10), b)
    al = al * (1 - p * 0.75)
    hong = (r > 140) & (b > 100) & (g < b - 35) & (g < r - 60)  # pha hồng do nền magenta lẫn vào: bỏ hẳn
    al[hong] = 0
    out = np.dstack([r, g, b2, al * 255])
    return out


def cum(A, gian=6, nho=400):
    """Các cụm điểm ảnh (giãn gian px rồi đánh nhãn) → danh sách (x0, y0, x1, y1) theo thứ tự trái → phải, trên → dưới."""
    m = A[..., 3] > 128
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=gian))
    ra = []
    for s in ndimage.find_objects(lab):
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        if m[y0:y1, x0:x1].sum() >= nho:
            ra.append((x0, y0, x1, y1))
    ra.sort(key=lambda q: (round(q[1] / 300), q[0]))
    return ra


def thu_net(A, k, w, h, cx, cy):
    """Thu vùng A (RGBA float) về ô w×h (điểm ảnh ảnh, đã gấp NET), tỉ lệ k (điểm nguồn / điểm ảnh), tâm nguồn (cx, cy) vào giữa ô."""
    m = A[..., 3] > 128
    src = A[..., :3].clip(0, 255).astype(np.uint8)
    # lượng tử 32 màu trên điểm đặc (gom các sắc gần nhau của ảnh AI)
    ys, xs = np.nonzero(m)
    pim = Image.fromarray(src[ys.min():ys.max() + 1, xs.min():xs.max() + 1]).quantize(32, method=Image.Quantize.MEDIANCUT)
    pal = np.array(pim.getpalette()[:96]).reshape(-1, 3)
    q = np.zeros(m.shape, int)
    q[ys.min():ys.max() + 1, xs.min():xs.max() + 1] = np.array(pim)
    toi = luma(pal) < 60
    ra = np.zeros((h, w, 4), np.uint8)
    for j in range(h):
        for i in range(w):
            ya = int(round(cy + (j - h / 2) * k)); yb = max(ya + 1, int(round(cy + (j + 1 - h / 2) * k)))
            xa = int(round(cx + (i - w / 2) * k)); xb = max(xa + 1, int(round(cx + (i + 1 - w / 2) * k)))
            ya, xa = max(0, ya), max(0, xa)
            yb, xb = min(m.shape[0], yb), min(m.shape[1], xb)
            if yb <= ya or xb <= xa:
                continue
            mm = m[ya:yb, xa:xb]
            if mm.mean() < 0.45:
                continue
            v = q[ya:yb, xa:xb][mm]
            c = np.bincount(v, minlength=len(pal))
            if c[toi].sum() >= 0.3 * c.sum():
                c = c * toi
            ra[j, i, :3] = pal[int(np.argmax(c))]
            ra[j, i, 3] = 255
    return ra


def long_trong(o, mau, al):
    """Lớp trong mờ trong lòng vành khép kín: điểm trong suốt không nối ra mép ô."""
    trong = o[..., 3] == 0
    lab, n = ndimage.label(trong)
    ngoai = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    long_ = trong & ~np.isin(lab, list(ngoai)) & (lab > 0)
    o[long_] = (*mau, al)
    return int(long_.sum())


def mau_vanh(o):
    """Màu cam của vành khiên (màu sáng vừa xuất hiện nhiều nhất)."""
    al = o[..., 3] == 255
    px = o[al][:, :3].astype(int)
    cam = px[(px[:, 0] > 200) & (px[:, 1] > 70) & (px[:, 1] < 160) & (px[:, 2] < 110)]
    if not len(cam):
        return FIRE
    u, c = np.unique(cam, axis=0, return_counts=True)
    return tuple(int(x) for x in u[int(np.argmax(c))])


def dai(frames):
    w = sum(f.shape[1] for f in frames)
    out = np.zeros((frames[0].shape[0], w, 4), np.uint8)
    x = 0
    for f in frames:
        out[:, x:x + f.shape[1]] = f
        x += f.shape[1]
    return Image.fromarray(out)


def ghi(ten, d):
    d = dict({'loai': 'linh-khi-sprite', 'phien_ban': 1}, **d)
    p = os.path.join(CUSTOM, ten + '.sprite.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    print('%-28s %6.1f KB' % (ten + '.sprite.json', os.path.getsize(p) / 1024))


def hu(ma, ten, frames, fw, fh, giay, lap, goc=None):
    ghi(ma, {'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'tam': png64(dai(frames)), 'net': NET, 'khung_rong': fw, 'khung_cao': fh,
             'goc': goc or [fw / 2, fh / 2], 'so': len(frames), 'giay': giay, 'lap': lap, 'xoay': False, 'co': 1, 'tron': 'thuong',
             'nguon': 'docs/yeu-cau-anh/talesworn-anh-05-11 · docs/anh-goc/talesworn-d/cat-anh-slice.py'})


def gd(ma, ten, o):
    ghi(ma, {'doi_tuong': 'giao-dien', 'ma': ma, 'ten': ten, 'rong': o.shape[1] // NET, 'cao': o.shape[0] // NET, 'net': NET,
             'anh': png64(Image.fromarray(o)), 'nguon': 'docs/yeu-cau-anh/talesworn-anh-05-11 · docs/anh-goc/talesworn-d/cat-anh-slice.py'})


def rieng(A, hop, le=4):
    """Chỉ giữ điểm trong hộp của khung này (đốm lửa của khung bên cạnh không lọt vào)."""
    B = A.copy()
    x0, y0, x1, y1 = hop
    m = np.zeros(A.shape[:2], bool)
    m[max(0, y0 - le):y1 + le, max(0, x0 - le):x1 + le] = True
    B[~m, 3] = 0
    return B


def khung_deu(A, hops, w, h, phu=1.0, goc=None):
    """Mọi khung cùng tỉ lệ (theo khung to nhất), tâm từng khung = tâm hộp."""
    kmax = max(max(x1 - x0, y1 - y0) for x0, y0, x1, y1 in hops)
    k = kmax / (min(w, h) * phu)
    goc = goc or hops
    return [thu_net(rieng(A, g), k, w, h, (x0 + x1) / 2, (y0 + y1) / 2) for (x0, y0, x1, y1), g in zip(hops, goc)], k


def main():
    xem = '--xem' in sys.argv
    out = {}
    # 1. trang Mực Lửa: 6 khung
    A = tach_nen(os.path.join(NGUON, 'trang-muc-lua-6khung-nguon-chatgpt.png'))
    hops = cum(A, gian=14, nho=3000)
    assert len(hops) == 6, hops
    # cùng một tâm dọc (trang lượn: giữ đúng chỗ ảnh gốc theo dòng), tâm ngang từng khung
    cy = np.mean([(h[1] + h[3]) / 2 for h in hops])
    goc = hops
    hops = [(x0, int(cy - (y1 - y0) / 2), x1, int(cy + (y1 - y0) / 2)) for x0, y0, x1, y1 in hops]
    fr, k = khung_deu(A, hops, 24 * NET, 24 * NET, 0.96, goc)
    hu('hu-trang-muc-lua', 'Trang Mực Lửa bay (6 khung lặp)', fr, 24, 24, 0.75, True)
    out['trang'] = fr
    # 2. Fire Guard: 6 khung (1–4 lặp, 5–6 vỡ) — tâm chung cho cả 6 khung (khiên đứng yên quanh trùm)
    A = tach_nen(os.path.join(NGUON, 'fire-guard-6khung-nguon-chatgpt.png'))
    hops = cum(A, gian=10, nho=3000)
    assert len(hops) == 6, hops
    cyg = np.mean([(h[1] + h[3]) / 2 for h in hops[:4]])
    kmax = 350.0 / (64 * NET)
    fr = [thu_net(rieng(A, h, 2), kmax, 64 * NET, 64 * NET, (h[0] + h[2]) / 2, cyg) for h in hops]
    for i, o in enumerate(fr):
        if i < 5:
            n = long_trong(o, mau_vanh(o), 46)
            print('  fire-guard khung %d: lòng trong mờ %d điểm' % (i + 1, n))
    hu('hu-fire-guard', 'Fire Guard (1–4 lặp quanh trùm, 5–6 vỡ thành mảnh băng)', fr, 64, 64, 0.8, True)
    out['guard'] = fr
    # 3–6. biểu tượng Fire Guard, Page Scrap, nút ĐỔI, Thương Băng
    A = tach_nen(os.path.join(NGUON, 'bieu-tuong-guard-page-swap-thuong-bang-nguon-chatgpt.png'))
    hops = cum(A, gian=18, nho=3000)
    assert len(hops) == 4, hops
    hops.sort(key=lambda q: q[0])
    (a0, b0, a1, b1) = hops[0]
    o = thu_net(A, max(a1 - a0, b1 - b0) / (16 * NET), 16 * NET, 16 * NET, (a0 + a1) / 2, (b0 + b1) / 2)
    gd('gd-bt-fire-guard', 'Biểu tượng Fire Guard (khiên lửa + bút lông)', o)
    out['bt'] = o
    (a0, b0, a1, b1) = hops[1]
    o = thu_net(A, max(a1 - a0, b1 - b0) / (18 * NET), 18 * NET, 18 * NET, (a0 + a1) / 2, (b0 + b1) / 2)
    gd('gd-page-scrap', 'Page Scrap (mảnh trang góc vàng)', o)
    out['scrap'] = o
    (a0, b0, a1, b1) = hops[2]
    o = thu_net(A, max(a1 - a0, b1 - b0) / (40 * NET), 40 * NET, 40 * NET, (a0 + a1) / 2, (b0 + b1) / 2)
    gd('gd-nut-doi', 'Mặt nút ĐỔI (gỗ, góc đồng, 2 mũi tên vòng)', o)
    out['nut'] = o
    (a0, b0, a1, b1) = hops[3]
    k = (a1 - a0) / (40 * NET * 0.98)
    o = thu_net(A, k, 40 * NET, 24 * NET, (a0 + a1) / 2, (b0 + b1) / 2)
    # vòng sáng: điểm xanh băng nhạt ở nửa dưới (dưới cán thương) — đổi độ trong theo khung, thương giữ nguyên
    px = o[..., :3].astype(int)
    hh = o.shape[0]
    yy = np.arange(hh)[:, None] * np.ones((1, o.shape[1]))
    xanh = (o[..., 3] > 0) & (px[..., 2] > 170) & (px[..., 2] > px[..., 0] + 30)
    # thương: cụm đặc lớn nhất có viền tối; vòng: điểm xanh không dính thân thương ở dưới đường tâm
    than = ndimage.binary_dilation(luma(px.astype(float)) < 70, iterations=2) & (o[..., 3] > 0)
    vong = xanh & (yy > hh * 0.55) & ~than
    fr = []
    for mo in (1.0, 0.8, 0.6, 0.8):
        f = o.copy()
        f[vong, 3] = int(255 * mo)
        fr.append(f)
    hu('hu-thuong-bang-dat', 'Thương Băng nằm đất, vòng sáng phập phồng (4 khung lặp)', fr, 40, 24, 1.0, True)
    out['thuong'] = fr
    if xem:
        os.makedirs(XEM, exist_ok=True)
        nen = (60, 84, 52, 255)
        hang = [out['trang'], out['guard'], [out['bt'], out['scrap'], out['nut']], out['thuong']]
        W = max(sum(f.shape[1] + 8 for f in h) for h in hang) + 8
        H = sum(max(f.shape[0] for f in h) + 8 for h in hang) + 8
        cv = Image.new('RGBA', (W, H), nen)
        y = 8
        for h in hang:
            x = 8
            for f in h:
                cv.alpha_composite(Image.fromarray(f), (x, y))
                x += f.shape[1] + 8
            y += max(f.shape[0] for f in h) + 8
        cv.resize((W * 3, H * 3), Image.NEAREST).save(os.path.join(XEM, 'cat-slice-x3.png'))


if __name__ == '__main__':
    main()
