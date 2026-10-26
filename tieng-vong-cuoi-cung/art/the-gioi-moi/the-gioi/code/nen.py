"""Bước 3 – nền: tách nguon/nen-lang.png (1672×941) thành các lớp parallax, xuất 1920×1080 (= 960×540 logic ở 2x).

Lớp (từ xa → gần):
  xa       trời + mây + núi xa + làng chìm trong sương (KHÔNG có mặt trời) – chỗ bị vật gần che đã được lấp màu
  mat-troi đĩa mặt trời tách riêng (để khi lặp lật nền xa không thấy 2 mặt trời; game vẽ 1 lần, trôi rất chậm)
  giua     làng giữa: nhà, tháp chuông, vách đá, cầu gỗ, cây giữa, hàng rào – chân lớp mờ dần vào sương
  gan-cay  cây cổ thụ góc trên-trái (tán, thân, đèn lồng)
  gan-la   bụi lá tối 2 góc dưới (đè lên sàn → vẽ mờ)
  dat      dải đất cỏ + vách dưới (đã BỎ khỏi nền vì đất do gạch đảm nhận) – xuất riêng phòng khi cần
Cách tách:
  1) đường mép cỏ: mỗi cột tìm hàng đầu tiên là cỏ vàng-lục trong khoảng y 640–800, lọc trung vị → dưới đường = 'dat'
  2) xa ↔ (giua+gan): GrabCut (OpenCV) với hạt giống tự động: trời/sương = mịn (độ lệch cục bộ thấp) + sáng/xanh tím;
     vật = nhiều nét mực đen + tương phản cao. Sau đó ép thêm: điểm "giống trời" (sáng, mịn) trong vùng vật → xa.
  3) gan = phần vật nằm trong đa giác cây góc trái (vẽ tay theo ảnh) + bụi lá tối (đen/xanh két) ở 2 góc dưới.
  4) lấp chỗ trống của lớp xa bằng kéo–đẩy (push-pull) nhiều tầng → màu trời/sương liền mạch, cuộn không lộ lỗ.
Bản dịu (-diu): giảm bão hoà + tương phản, hơi mờ lớp xa, phủ nhẹ màu sương → nhân vật/gạch nổi hơn."""
import cv2
import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw

from chung import NEN, NGUON, luu_json, luu_png, u8

RONG, CAO = 1920, 1080

# cây cổ thụ góc trái (vẽ tay theo ảnh nguồn): tán + cành + thân + rễ; đèn lồng treo; dây leo rủ
CAY_GAN = [[(0, 0), (845, 0), (845, 40), (800, 95), (700, 105), (640, 135), (590, 145), (530, 200), (480, 200), (450, 140),
            (300, 145), (250, 168), (200, 188), (165, 218), (160, 250), (152, 300), (142, 400), (140, 470), (150, 520),
            (230, 560), (268, 610), (268, 760), (0, 760)],
           [(215, 160), (232, 160), (232, 250), (258, 262), (264, 352), (186, 352), (192, 262), (215, 250)],
           [(314, 135), (348, 135), (348, 312), (314, 312)]]


def da_giac(h, w, ds):
    im = Image.new('L', (w, h), 0)
    for pts in ds:
        ImageDraw.Draw(im).polygon(pts, fill=255)
    return np.array(im) > 0


def keo_day(rgb, w, muc=9):
    """Lấp điểm có trọng số w≈0 bằng màu trung bình mờ dần từ xung quanh (pyramid push-pull)."""
    rgb = rgb.astype(np.float64)
    w = w.astype(np.float64)
    tang = []
    c, ww = rgb * w[..., None], w
    for _ in range(muc):
        tang.append((c, ww))
        h, wd = ww.shape
        h2, w2 = (h + 1) // 2, (wd + 1) // 2
        cp = np.zeros((h2 * 2, w2 * 2, 3)); cp[:h, :wd] = c
        wp = np.zeros((h2 * 2, w2 * 2)); wp[:h, :wd] = ww
        c = cp.reshape(h2, 2, w2, 2, 3).sum((1, 3))
        ww = wp.reshape(h2, 2, w2, 2).sum((1, 3))
    col = c / np.maximum(ww[..., None], 1e-9)
    for c0, w0 in reversed(tang):
        h, wd = w0.shape
        up = cv2.resize(col.astype(np.float32), (wd, h), interpolation=cv2.INTER_LINEAR).astype(np.float64)
        up = cv2.GaussianBlur(up, (0, 0), 1.0)
        a = np.clip(w0, 0, 1)[..., None]
        col = np.where(w0[..., None] > 1e-9, (c0 / np.maximum(w0[..., None], 1e-9)) * a + up * (1 - a), up)
    return col


def lap_hang(a, biet, du_phong):
    """Lấp theo HÀNG (nội suy ngang giữa các điểm đã biết, ngoài mép thì giữ màu điểm gần nhất) → trời giữ đúng dải
    màu theo độ cao, sương thành dải ngang; rồi làm mịn dọc nhẹ trong vùng lấp. Hàng không có điểm nào → du_phong."""
    h, w = biet.shape
    out = du_phong.copy()
    xs = np.arange(w)
    for y in range(h):
        k = np.nonzero(biet[y])[0]
        if len(k) < 8:
            continue
        for c in range(3):
            out[y, :, c] = np.interp(xs, k, a[y, k, c])
    mo = cv2.GaussianBlur(out.astype(np.float32), (0, 0), sigmaX=10, sigmaY=22).astype(np.float64)
    return np.where(biet[..., None], a, mo)


def duong_co(a):
    """y mép trên dải cỏ cho từng cột (px nguồn)."""
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    co = (R > 80) & (G > 75) & (B < 75) & (R - B > 45) & (G - B > 40)
    co = nd.binary_opening(co, structure=np.ones((5, 1)))
    h, w = co.shape
    y = np.full(w, 735.0)
    for x in range(w):
        ys = np.nonzero(co[640:800, x])[0]
        if len(ys):
            y[x] = 640 + ys.min()
    y = nd.median_filter(y, 61)
    y = nd.uniform_filter1d(y, 41)
    return y


def chay():
    a8 = np.array(Image.open(f'{NGUON}/nen-lang.png').convert('RGB'))
    a = a8.astype(np.float64)
    h, w = a.shape[:2]
    L = a.mean(-1)
    sd = np.sqrt(np.maximum(nd.uniform_filter(L ** 2, 9) - nd.uniform_filter(L, 9) ** 2, 0))
    toi = nd.minimum_filter(L, 7)
    yy = np.arange(h)[:, None]
    # 1) dải đất
    yc = duong_co(a)
    duoi = yy >= yc[None, :] + 6          # chừa 6 px để chân hàng rào / bụi cỏ còn ở lớp giữa
    # 2) GrabCut xa ↔ vật
    canh = nd.uniform_filter((sd > 14).astype(float), 15)
    hat_vat = (canh > 0.35) & (toi < 35)
    min_rong = nd.uniform_filter((sd < 3).astype(float), 21) > 0.9
    B_, R_ = a[..., 2], a[..., 0]
    hat_xa = (((sd < 2.5) & (L > 60) & min_rong) | ((sd < 4) & (L > 75) & (B_ > R_ + 5) & min_rong) |
              ((sd < 6) & (L > 65) & (B_ > R_ + 30)))                 # sương xanh lam sau làng bên trái
    m = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    m[nd.binary_dilation(canh > 0.15, iterations=3)] = cv2.GC_PR_FGD
    m[hat_vat] = cv2.GC_FGD
    m[hat_xa & ~hat_vat] = cv2.GC_BGD
    bgm, fgm = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(a8[..., ::-1].copy(), m, None, bgm, fgm, 5, cv2.GC_INIT_WITH_MASK)
    vat = (m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD)
    # ép thêm: mảng "giống trời" (sáng, rất mịn, cam/tím) trong vùng vật → xa (khe giữa cột tháp chuông, quanh mặt trời)
    giong_troi = (L > 95) & (sd < 3.0) & ~hat_vat
    giong_troi = nd.binary_opening(giong_troi, iterations=2)
    vat &= ~giong_troi
    vat = nd.binary_opening(vat, iterations=1)
    lab, n = nd.label(vat)
    if n:
        sz = nd.sum(vat, lab, range(1, n + 1))
        vat = np.isin(lab, 1 + np.nonzero(sz >= 400)[0])
    vat = nd.binary_fill_holes(vat) & ~giong_troi | (vat & giong_troi)
    # 3) gần: cây góc trái + bụi lá tối 2 góc dưới
    cay = da_giac(h, w, CAY_GAN)
    G_ = a[..., 1]
    xx = np.arange(w)[None, :]
    # lá tối: viền đen + ruột xanh két. Bóng dưới gờ cỏ cùng tông → chỉ nhận ở 2 góc (x<300, x>1530) và dưới y 800
    la = ((G_ - R_ > 9) & (B_ - R_ > 9) & (L < 75)) | (L < 9)
    la[:540] = False
    la = nd.binary_closing(la, iterations=2)
    la = nd.binary_opening(la, iterations=3)
    la = nd.binary_fill_holes(la)
    xx = np.arange(w)[None, :]
    goc = (xx < 300) | (xx > 1530)
    la &= goc | (yy > 800)
    lab, n = nd.label(la)
    if n:
        sz = nd.sum(la, lab, range(1, n + 1))
        la = np.isin(lab, 1 + np.nonzero(sz >= 2500)[0])
    # alpha mềm ở mép cắt y 800 (giữa đáy) để không thành đường thẳng

    suong_lam = (B_ - R_ > 25) & (L > 45)                # sương xanh lam lọt qua kẽ cây → không thuộc cây/làng
    troi_am = (L > 125) & (R_ > B_) & (yy < 230)            # trời cam/hồng lọt qua kẽ lá tán cây
    gan = (vat & cay & ~duoi & ~suong_lam & ~troi_am) | la
    # sương lam sau cây giữa bên trái (GrabCut nhận nhầm là vật): chỉ xét góc trên-trái, chỗ mịn
    vat &= ~(suong_lam & (sd < 10) & (B_ - R_ > 30) & (L > 60) & (xx < 420) & (yy < 400))
    giua = vat & ~gan & ~duoi & ~cay
    xa = ~gan & ~giua & ~duoi
    # 4) mặt trời
    mt = (a[..., 0] > 235) & (a[..., 1] > 205) & (a[..., 2] > 120) & (L > 200)
    lab, n = nd.label(mt)
    if n:
        sz = nd.sum(mt, lab, range(1, n + 1))
        mt = lab == 1 + int(np.argmax(sz))
    ys, xs = np.nonzero(mt)
    cy, cx = ys.mean(), xs.mean()
    r = np.sqrt(mt.sum() / np.pi)
    dist = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    a_mt = np.clip((r + 4 - dist) / 4, 0, 1)                    # đĩa mềm mép
    a_mt[~(xa | nd.binary_dilation(xa, iterations=6))] = 0      # phần bị tháp/núi che giữ nguyên ở lớp đó
    vong_mt = dist < r + 10                                     # viền sáng quanh đĩa: không để lọt sang lớp giữa
    giua &= ~vong_mt
    xa |= vong_mt & ~gan & ~duoi
    # lớp xa: lấp chỗ trống (vật, đất, mặt trời)
    w_xa = (xa & ~nd.binary_dilation(a_mt > 0, iterations=6)).astype(float)
    w_xa = nd.binary_erosion(w_xa > 0, iterations=2).astype(float)       # bỏ viền dính nét mực của vật
    lap = lap_hang(a, w_xa > 0, keo_day(a, w_xa))
    xa_rgb = np.where(w_xa[..., None] > 0, a, lap)

    def mem(mask, r=1.0):
        return np.clip(cv2.GaussianBlur(mask.astype(np.float32), (0, 0), r), 0, 1)

    al_giua = mem(giua, 0.8)
    # chân lớp giữa mờ dần vào sương (40 px nguồn trên mép cỏ)
    tren_co = np.clip((yc[None, :] + 6 - yy) / 40.0, 0, 1)
    al_giua *= tren_co
    # 2 mép trái/phải mờ dần (cầu gỗ bên phải chìm vào sương) → lớp giữa lặp THẲNG (không lật) được, không ra 2 tháp đối xứng
    # mép trái: phần làng sau thân cây bị khuyết → mờ dần từ x 150 → 330 (nhà bên trái chìm vào sương)
    mep = np.clip((xx - 150) / 180.0, 0, 1) * np.clip((w - 1 - xx) / 140.0, 0, 1)
    al_giua *= mep
    # chỗ đa giác cây cắt ngang nội dung (rễ/đá bên phải gốc) → mép mềm 12 px thay vì đường thẳng
    than_cay = da_giac(h, w, CAY_GAN[:1])
    cay_mem = np.clip(cv2.GaussianBlur(nd.binary_erosion(than_cay, iterations=6, border_value=1).astype(np.float32),
                                       (0, 0), 6) * 1.6, 0, 1)
    cay_mem = np.maximum(cay_mem, da_giac(h, w, CAY_GAN[1:]))      # đèn lồng, dây leo: giữ nét
    al_cay = mem(gan & ~la, 0.8) * cay_mem
    al_la = mem(la, 0.8) * np.where(goc, 1.0, np.clip((yy - 800) / 30.0, 0, 1))
    al_dat = mem(duoi & ~la, 0.6)
    lop = {
        'xa': np.dstack([xa_rgb, np.full((h, w), 255.0)]),
        'mat-troi': np.dstack([a, a_mt * 255]),
        'giua': np.dstack([a, al_giua * 255]),
        'gan-cay': np.dstack([a, al_cay * 255]),
        'gan-la': np.dstack([a, al_la * 255]),
        'dat': np.dstack([a, al_dat * 255]),
    }
    suong = np.array([104, 108, 140], float)     # màu sương chân núi (lấy mẫu vùng làng xa)
    # chỗ lớp giữa mờ ở chân: phủ màu sương lên lớp xa ở dải đó cho đỡ lộ "đứt"
    k = np.clip((yy - (yc[None, :] - 60)) / 120.0, 0, 1)[..., None] * 0.55
    lop['xa'][..., :3] = lop['xa'][..., :3] * (1 - k) + suong * k
    out = {}
    for ten, im in lop.items():
        im2 = cv2.resize(im.astype(np.float32), (RONG, CAO), interpolation=cv2.INTER_LANCZOS4)
        im2 = np.clip(im2, 0, 255)
        im2[..., 3][im2[..., 3] < 3] = 0                 # bỏ gợn LANCZOS ở vùng trong suốt
        im2[..., :3] *= (im2[..., 3:4] > 0)
        out[ten] = im2
    # ---- bản dịu
    def diu(im, bh, tp, mo, phu):
        rgb = im[..., :3].copy()
        g = rgb.mean(-1, keepdims=True)
        rgb = g + (rgb - g) * bh                                   # bão hoà
        tb = (rgb * (im[..., 3:4] > 0)).sum((0, 1)) / max(1, (im[..., 3] > 0).sum())
        rgb = tb + (rgb - tb) * tp                                 # tương phản quanh màu trung bình
        rgb = rgb * (1 - phu) + suong * phu                        # phủ sương
        o = np.dstack([rgb, im[..., 3]])
        if mo > 0:
            pm = np.dstack([o[..., :3] * o[..., 3:4] / 255, o[..., 3]])
            pm = cv2.GaussianBlur(pm.astype(np.float32), (0, 0), mo)
            o = np.dstack([pm[..., :3] / np.maximum(pm[..., 3:4] / 255, 1e-4), pm[..., 3]])
        return np.clip(o, 0, 255)

    THAM_DIU = {'xa': (0.78, 0.80, 1.6, 0.14), 'mat-troi': (0.9, 1.0, 0.0, 0.0), 'giua': (0.82, 0.86, 0.7, 0.10),
                'gan-cay': (0.85, 0.9, 0.0, 0.05), 'gan-la': (0.85, 0.9, 0.0, 0.05), 'dat': (0.85, 0.88, 0.0, 0.06)}
    for ten in list(out):
        out[ten + '-diu'] = diu(out[ten], *THAM_DIU[ten])
    for ten, im in out.items():
        im8 = u8(im)
        if ten.startswith('xa'):
            Image.fromarray(im8[..., :3]).save(f'{NEN}/{ten}.png', optimize=True)
        else:
            luu_png(im8, f'{NEN}/{ten}.png')
    # ảnh kiểm tra mask (nguồn, tô màu theo lớp)
    vis = a.copy()
    for mk, col in ((giua, (255, 200, 0)), (gan, (0, 255, 120)), (duoi & ~la, (150, 80, 30)), (a_mt > 0.5, (255, 0, 0))):
        vis[mk] = vis[mk] * 0.45 + np.array(col) * 0.55
    vis[xa & ~(a_mt > 0.5)] = vis[xa & ~(a_mt > 0.5)] * 0.45 + np.array([120, 0, 255]) * 0.55
    Image.fromarray(u8(vis)).save(f'{NEN}/mask-lop.png', optimize=True)
    sx = RONG / w
    luu_json({
        'ten': 'Nền làng rừng hoàng hôn – lớp parallax (từ nguon/nen-lang.png)',
        'co': [RONG, CAO], 'boi_so': 2, 'logic': [RONG // 2, CAO // 2],
        'lop': {
            'xa': {'anh': 'xa.png', 'goi_y_toc_do': 0.2, 'mo_ta': 'trời + núi xa + sương; đã lấp chỗ bị che; không alpha'},
            'mat-troi': {'anh': 'mat-troi.png', 'goi_y_toc_do': 0.2, 'tam': [round(cx * sx, 1), round(cy * sx, 1)],
                         'ban_kinh': round(r * sx, 1), 'mo_ta': 'vẽ 1 lần (KHÔNG lặp), cùng tốc độ với lớp xa, ngay sau lớp xa → khớp đúng chỗ cũ; các bản lặp của lớp xa không có mặt trời'},
            'giua': {'anh': 'giua.png', 'goi_y_toc_do': 0.45, 'mo_ta': 'làng giữa, có alpha, chân và 2 mép mờ vào sương; nên lặp THẲNG (lật sẽ ra 2 tháp chuông đối xứng)'},
            'gan-cay': {'anh': 'gan-cay.png', 'goi_y_toc_do': 1.15, 'goi_y_alpha': 1.0,
                        'mo_ta': 'cây cổ thụ góc trên-trái (tán, cành, thân, rễ, đèn lồng, dây leo); vẽ SAU nhân vật'},
            'gan-la': {'anh': 'gan-la.png', 'goi_y_toc_do': 1.15, 'goi_y_alpha': 0.5,
                       'mo_ta': 'bụi lá tối 2 góc dưới + mép dưới; đè lên sàn/nhân vật nên vẽ mờ'},
            'dat': {'anh': 'dat.png', 'goi_y_toc_do': 1.0, 'mo_ta': 'dải đất cỏ đã bỏ khỏi nền (tuỳ chọn, mặc định không dùng)'},
        },
        'ban_diu': 'mỗi lớp có thêm <ten>-diu.png: bão hoà / tương phản / làm mờ / phủ sương = ' +
                   ', '.join(f'{k} {v}' for k, v in THAM_DIU.items()),
        'duong_co_y_2x': {'trai': round(float(yc[0] * sx), 1), 'giua': round(float(yc[w // 2] * sx), 1),
                          'phai': round(float(yc[-1] * sx), 1)},
        'lap_ngang': 'xa, dat: lặp bằng bản LẬT xen kẽ (như veLap trong demo.html) → liền mép. giua: lặp thẳng (2 mép đã mờ). '
                     'gan-cay: nên vẽ 1 lần mỗi phòng (khung tranh), lặp lật cũng được nhưng hiện 2 cây đối xứng. gan-la: lặp lật.',
    }, f'{NEN}/nen.json')
    print('nền: mặt trời tâm', round(cx), round(cy), 'r', round(r, 1), '· mép cỏ y', int(yc.min()), '–', int(yc.max()))
    return out


if __name__ == '__main__':
    chay()
