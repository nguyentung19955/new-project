"""Còn vẽ tay 6 (16/10): cắt 16 ảnh chủ game gen (../../con-ve-tay-5/anh-gen/<mã>.png, nền #00FF00, một hàng khung ngang)
thành game/art/custom/<mã>.sprite.json.
    python3 dung-dot6.py [--ghi]      (không --ghi: chỉ ghi vào cong-cu/ra6/ để xem)
Cùng cách đợt 2/3 (../../con-ve-tay/cong-cu/dung-dot3.py): khử nền xanh, tách khung, thu nhỏ hộp (alpha trước nhân), net 2, lượng tử màu,
kiểm khớp từng điểm, đo neo. Khác đợt 3:
 - Khung theo LƯỚI: ảnh gen chia đều N ô (N = số khung trong prompt; ảnh vẽ thiếu khung cuối thì ô cuối rỗng, bỏ). Ranh giới thật là cột
   trống nhất gần ranh giới đều (±80 điểm ảnh gốc: hạt băng / tia lửa lấn ô bên cạnh). Neo tính theo GỐC Ô ĐỀU, chung mọi khung, nên
   chuyển động trong dải (vòng to dần, khói nở, mũi tên nhún 1 điểm ảnh) giữ đúng như ảnh gen.
 - Khử nền (KHU):
   'tach'  vật không xanh lục (trắng, cam, xanh lam, xám): a = 1 − (lục − max(đỏ, lam)) / 245, màu = (điểm − (1 − a)·nền) / a.
   'chat'  vật cũng xanh lục (giọt độc, lá): bỏ điểm gần màu nền (khoảng cách < 60) và điểm lục chói sát nền; viền tối giữ.
   'sang'  quầng sáng vàng trộn nền (đom đóm): a theo kênh ĐỎ (nền đỏ ≈ 0) = (đỏ − 8) / 232, màu tách trộn như 'tach'
           → quầng thành vàng nhạt trong suốt dần, không còn viền xanh lục (như vong-hoi-quai đợt 3).
   'bong'  bóng chân: ảnh gen ra xanh lục đậm vì ăn nền → bỏ màu, lấy 3 nấc theo độ tối kênh lục (lục < 100 / < 160 / < 230)
           → màu #14182e, alpha 45% / 30% / 15% (đúng prompt).
   'nang'  cột nắng: 3 dải theo kênh đỏ (> 220 lõi / > 150 / > 60) → màu #fff4b0, alpha 30% / 20% / 10% (prompt: 25% ba nấc).
   'phong' dấu phòng: như 'tach' nhưng điểm gần đặc (a > 0,8) giữ màu gốc (rêu xanh trên đá không bị tẩy xám); điểm mờ (mép) tách trộn.
 - Ảnh nhiều nấc alpha (MO): giữ 0 / 80 / 140 / 200 / 255 thay vì cắt 0 / 255.
 - Còn vẽ tay 7 (16/10): 5 ảnh chủ game gen lại (../anh-gen-lai/, LAI) thay bản đợt 6:
   gd-cot-nang-rung (cột rộng, đứng hơn), hu-hat-no (vẫn 5 khung trên lưới 6 ô → 'giay' co theo số khung thật để mỗi khung giữ nhịp cũ),
   hu-khoi-tron (đủ 6 khung), hu-vong-song (vòng DẸT 5 khung có vạch đen dọc chia ô → VACH: xoá các cột gần như toàn đen ±5 điểm ảnh,
   và mọi điểm tối; ghi "det" = cao / rộng vòng để game kéo về tỉ lệ vòng cũ), gd-dau-phong-4-loai (4 vòng rỗng cam / ngọc / tím / đỏ, cắt
   theo 4 ô đều thành gd-dau-phong-tinh-anh / -thu-thach / -nguyen / -trum, giữ màu gốc: khử 'vong' = 'phong' + alpha lấy thêm theo
   khoảng cách tới màu nền, để mép vòng ngọc không thủng).
   'nang' đợt 7: dải sáng theo kênh LAM (lõi > 165 / giữa > 125 / ngoài), chỉ điểm đỏ > 150 (nền đỏ ≈ 0 → không viền xanh lục).
 - Ảnh gd-* ghi dạng "giao-dien" (js/sprite_custom.js themGd: một ảnh tĩnh); gd-mui-ten-cua 2 khung đặt cạnh nhau, ghi thêm "so": 2,
   "khung_rong" (room_art.js tự cắt khung).
"""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/review/ke-hoach-cai-thien/con-ve-tay-5/anh-gen')
LAI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'anh-gen-lai')
LAI = {'gd-cot-nang-rung', 'hu-hat-no', 'hu-khoi-tron', 'hu-vong-song', 'gd-dau-phong-4-loai'}  # vẽ tay 7: ảnh gen lại
VACH = {'hu-vong-song'}  # ảnh có vạch đen dọc chia ô
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra6'); os.makedirs(RA, exist_ok=True)
N = 2
NEN = np.array([3, 248, 3])
# mã, tên, số ô lưới, khử, neo, cỡ (('hop', W, H): hộp chung vừa W×H điểm game), giây, lặp, xoay, đốm lẻ tối thiểu
HU = [
    ('hu-bong-chan', 'Bóng dưới chân (Zed, quái, trùm, vật; game co theo cỡ thân)', 1, 'bong', 'giua', ('hop', 32, 10), 1.0, True, False, 40),
    ('hu-vong-song', 'Vòng sóng lan trên sàn (trắng → nhuộm; game kéo dẹt theo vòng cũ, "ban_kinh" = bán kính từng khung)', 5, 'tach', 'giua', ('hop', 64, 32), 0.3, False, False, 6),
    ('hu-giot-he-fire', 'Lưỡi lửa dọc nhát chém vũ khí hệ Lửa (thay tongue)', 5, 'tach', 'giua', ('hop', 40, 24), 0.3, False, False, 6),
    ('hu-giot-he-ice', 'Mảnh băng dọc nhát chém vũ khí hệ Băng (thay drawIce)', 5, 'tach', 'giua', ('hop', 40, 24), 0.3, False, False, 6),
    ('hu-giot-he-poison', 'Giọt độc dọc nhát chém vũ khí hệ Độc (thay drawDrips)', 5, 'chat', 'giua', ('hop', 40, 24), 0.3, False, False, 6),
    ('hu-hat-no', 'Hạt nổ / tia lửa chung (trắng → nhuộm; thay burst / drawParts)', 6, 'tach', 'giua', ('hop', 24, 24), 0.4, False, False, 4),
    ('hu-quang-dan', 'Quầng + vệt bay sau đạn (trắng → nhuộm; xoay theo hướng bay; neo ở đầu quầng)', 4, 'tach', 'dau', ('hop', 24, 8), 0.3, True, True, 4),
    ('hu-moi-truong-rung-domdom', 'Đom đóm Rừng già (lặp; thay ambLive fly)', 8, 'sang', 'giua', ('hop', 24, 24), 1.6, True, False, 4),
    ('hu-moi-truong-rung-la', 'Lá rơi Rừng già (khung 1–3 đang rơi, 4–7 nằm trên sàn, 8 tan; game tự cho rơi; thay ambLive leaf)', 8, 'chat', 'hop', ('hop', 8, 8), 1.0, False, False, 6),
    ('hu-sao-chop', 'Sao chớp khi trúng / đổi vũ khí (trắng → nhuộm; thay star trong chớp "flash")', 5, 'tach', 'giua', ('hop', 20, 20), 0.12, False, False, 2),
    ('hu-vet-luot', 'Vệt kéo theo khi lướt (trắng → nhuộm; neo ở mép trước; thay dashline)', 4, 'tach', 'phai', ('hop', 40, 16), 0.4, False, False, 4),
    ('hu-tu-luc-vong', 'Vòng tụ lực (trắng → nhuộm; co vào rồi nảy; thay drawCharge / drawThrob)', 6, 'tach', 'giua', ('hop', 48, 24), 0.6, True, False, 2),
    ('hu-khoi-tron', 'Khói tròn / mây hơi (nhuộm nhẹ theo màu bụi; thay puffs, hạt loại 2)', 6, 'tach', 'giua', ('hop', 24, 24), 0.5, False, False, 6),
]
GD = [
    ('gd-dau-phong', 'Dấu phòng Bắt đầu trên sàn (phòng khác dùng tạm, nhuộm màu)', 1, 'phong', ('rong', 44)),
    ('gd-mui-ten-cua', 'Mũi tên nhún chỉ cửa đã mở (2 khung cạnh nhau, chĩa lên)', 2, 'tach', ('rong', 9)),
    ('gd-cot-nang-rung', 'Cột nắng chéo Rừng già (ngả xuống bên phải; game lật cho ngả trái như cột cũ)', 1, 'nang', ('cao', 96)),
    # vẽ tay 7: 4 vòng rỗng (ảnh tròn; game kéo dẹt 0,82 như ringMark cũ). Rộng = 2·bán kính vòng cũ + 4 (30 / 34 / 24 / 58)
    ('gd-dau-phong-tinh-anh', 'Dấu phòng tinh anh (vòng rỗng cam)', 1, 'vong', ('rong', 64), 'gd-dau-phong-4-loai', (0, 4)),
    ('gd-dau-phong-thu-thach', 'Dấu phòng thử thách (vòng rỗng ngọc)', 1, 'vong', ('rong', 72), 'gd-dau-phong-4-loai', (1, 4)),
    ('gd-dau-phong-nguyen', 'Dấu phòng lời nguyền (vòng rỗng tím)', 1, 'vong', ('rong', 52), 'gd-dau-phong-4-loai', (2, 4)),
    ('gd-dau-phong-trum', 'Dấu phòng trùm (vòng rỗng đỏ)', 1, 'vong', ('rong', 120), 'gd-dau-phong-4-loai', (3, 4)),
]
MO = {'hu-bong-chan', 'hu-moi-truong-rung-domdom', 'gd-cot-nang-rung', 'gd-dau-phong'}


def xoa_vach(rgb):
    """Vạch đen dọc chia ô: cột có > 100 điểm tối (max kênh < 100) → tô màu nền cột đó ±5 điểm ảnh (cả viền trộn)."""
    rgb = rgb.copy(); toi = rgb.max(2) < 100; col = toi.sum(0)
    for x in np.nonzero(col > 100)[0]:
        rgb[:, max(0, x - 5):x + 6] = NEN
    rgb[rgb.max(2) < 100] = NEN  # điểm tối lẻ còn sót
    return rgb


def khu_nen(rgb, khu, toi_thieu):
    f = rgb.astype(np.float32); r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx = np.maximum(r, b)
    if khu == 'bong':
        a = np.where(g < 100, 0.45, np.where(g < 160, 0.30, np.where(g < 230, 0.15, 0.0))).astype(np.float32)
        a = np.where(g - mx > 200, 0, a)  # nền
        f = np.broadcast_to(np.array([20, 24, 46], np.float32), f.shape).copy()
        return np.dstack([f, a * 255]).astype(np.float32)
    if khu == 'nang':
        a = np.where(r > 150, np.where(b > 165, 0.30, np.where(b > 125, 0.20, 0.10)), 0.0).astype(np.float32)
        f = np.broadcast_to(np.array([255, 244, 176], np.float32), f.shape).copy()
        return np.dstack([f, a * 255]).astype(np.float32)
    if khu == 'chat':
        d = np.sqrt(((f - NEN) ** 2).sum(2))
        a = (~((d < 60) | ((g > 225) & (r < 120) & (b < 80)))).astype(np.float32)
    else:
        if khu in ('tach', 'phong', 'vong'):
            a = np.clip(1 - (g - mx) / 245.0, 0, 1)
            if khu == 'vong':  # vòng ngọc (lục + lam): mép trộn nền có lục − max cao → thủng; lấy thêm theo khoảng cách tới màu nền
                a = np.maximum(a, np.clip(np.sqrt(((f - NEN) ** 2).sum(2)) / 180.0, 0, 1))
        else:  # 'sang'
            a = np.clip((r - 8) / 232.0, 0, 1)
        aa = np.maximum(a, 1e-3)[..., None]
        f2 = np.where(a[..., None] > 0, (f - (1 - a[..., None]) * NEN) / aa, 0)
        if khu in ('phong', 'vong'):
            f2 = np.where((a > 0.8)[..., None], f, f2)
        f = f2
    vat = a > 0.35
    lab, n = ndimage.label(vat)
    if n:
        sz = ndimage.sum(vat, lab, range(1, n + 1))
        giu = np.isin(lab, 1 + np.nonzero(sz >= toi_thieu)[0])
        a = np.where(ndimage.binary_dilation(giu, iterations=2), a, 0)
    return np.dstack([np.clip(f, 0, 255), a * 255]).astype(np.float32)


def tach_luoi(a, so):
    """Chia so ô đều; ranh giới thật = giữa dải cột trống nhất gần ranh giới đều. Trả về [(khung, hộp ảnh gốc, gốc ô đều)]; bỏ ô rỗng ở cuối."""
    H, W = a.shape[:2]; m = a[..., 3] > 60; col = m.sum(0)
    cw = W / so; bs = [0]
    for i in range(1, so):
        x0 = int(i * cw - 80); x1 = int(i * cw + 80)
        seg = col[x0:x1]; mn = seg.min()
        # dải liên tục dài nhất có giá trị nhỏ nhất → lấy giữa dải
        lab, k = ndimage.label(seg == mn)
        L, s0, s1 = max((int((lab == j).sum()), *np.nonzero(lab == j)[0][[0, -1]]) for j in range(1, k + 1))
        bs.append(x0 + (s0 + s1) // 2)
    bs.append(W)
    ks = []
    for i in range(so):
        sub = m[:, bs[i]:bs[i + 1]]
        if not sub.any(): ks.append(None); continue
        rows = np.nonzero(sub.any(1))[0]; cols = np.nonzero(sub.any(0))[0]
        X0, X1, Y0, Y1 = bs[i] + cols[0], bs[i] + cols[-1] + 1, rows[0], rows[-1] + 1
        blk = a[Y0:Y1, X0:X1].copy()
        # bỏ phần lấn sang ô khác (chỉ giữ cột thuộc ô này)
        ks.append((blk, (X0, Y0, X1, Y1), i * cw))
    while ks and ks[-1] is None: ks.pop()
    assert all(k is not None for k in ks), 'ô rỗng giữa dải'
    return ks


def thu(a, z, mo):
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4] / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    if mo:
        lv = np.array([0, 26, 38, 51, 64, 77, 80, 115, 140, 200, 255])
        q = lv[np.argmin(np.abs(A[..., None] - lv), 2)]
        o[..., 3] = np.where(A < 14, 0, q)
    else:
        o[..., 3] = (A >= 110) * 255
        if not o[..., 3].any(): o[..., 3] = (A >= max(1, A.max() * 0.5)) * 255
    return o


def png(sh, so_mau=128):
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    if len(px):
        q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]
    sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist()))); assert len(mau) <= 256, len(mau)
    flat = sh.reshape(-1, 4).astype(np.int64)
    key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    km = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    im = Image.fromarray(np.searchsorted(km, key).astype(np.uint8).reshape(sh.shape[:2]), 'P'); im.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue()


def dung(ma, so, khu, neo, toi_thieu, co, nguon=None, cat=None):
    nguon = nguon or ma
    rgb = np.array(Image.open(os.path.join(LAI_DIR if nguon in LAI else GOC, nguon + '.png')).convert('RGB'))
    if cat:  # một ô trong ảnh nhiều vật (ô đều theo bề ngang)
        cw = rgb.shape[1] / cat[1]; rgb = rgb[:, int(cat[0] * cw):int((cat[0] + 1) * cw)]
    if ma in VACH: rgb = xoa_vach(rgb)
    a = khu_nen(rgb, khu, toi_thieu)
    ks = tach_luoi(a, so)
    # hộp hợp của các khung theo gốc ô đều
    U = [min(k[1][0] - k[2] for k in ks), min(k[1][1] for k in ks), max(k[1][2] - k[2] for k in ks), max(k[1][3] for k in ks)]
    if neo == 'giua': AX, AY = [(U[0] + U[2]) / 2 + k[2] for k in ks], [(U[1] + U[3]) / 2] * len(ks)
    elif neo == 'dau': AX, AY = [U[2] - (U[3] - U[1]) / 2 + k[2] for k in ks], [(U[1] + U[3]) / 2] * len(ks)
    elif neo == 'phai': AX, AY = [U[2] + k[2] for k in ks], [(U[1] + U[3]) / 2] * len(ks)
    else: AX, AY = [(k[1][0] + k[1][2]) / 2 for k in ks], [(k[1][1] + k[1][3]) / 2 for k in ks]  # 'hop': giữa hộp từng khung
    if neo == 'hop':
        bw = max(k[1][2] - k[1][0] for k in ks); bh = max(k[1][3] - k[1][1] for k in ks)
    else:
        bw = U[2] - U[0]; bh = U[3] - U[1]
    if co[0] == 'hop': z0 = min(co[1] / bw, co[2] / bh)
    elif co[0] == 'rong': z0 = co[1] / bw
    else: z0 = co[1] / bh
    z = z0 * N; kh = []
    for i, (b0, (x0, y0, x1, y1), g0) in enumerate(ks):
        b = thu(b0, z, ma in MO); kh.append((b, (AX[i] - x0) * z, (AY[i] - y0) * z))
    trai = max(x for b, x, y in kh); phai = max(b.shape[1] - x for b, x, y in kh)
    tren = max(y for b, x, y in kh); duoi = max(b.shape[0] - y for b, x, y in kh)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    sh = np.zeros((FH * N, len(kh) * FW * N, 4), np.uint8)
    for i, (b, x, y) in enumerate(kh):
        X0 = int(round(GX * N - x)) + i * FW * N; Y0 = int(round(GY * N - y))
        sub = sh[Y0:Y0 + b.shape[0], X0:X0 + b.shape[1]]; sub[:] = np.where(b[..., 3:4] > 0, b, sub)
    for i in range(len(kh)):
        assert sh[:, i * FW * N:(i + 1) * FW * N, 3].any(), (ma, 'khung rỗng', i + 1)
    return sh, FW, FH, GX, GY, len(kh), z0, ks, AX, len(ks) < so


def ban_kinh(sh, FW, FH, GX, so):  # vòng sóng: nửa bề rộng (điểm game) từng khung, đo từ điểm neo
    out = []
    for i in range(so):
        m = sh[:, i * FW * N:(i + 1) * FW * N, 3] > 0; xs = np.nonzero(m.any(0))[0]
        out.append(round(((xs[-1] + 1) - xs[0]) / N / 2, 2))
    return out


so_do = {}
for ma, ten, so, khu, neo, co, giay, lap, xoay, tt in HU:
    sh, FW, FH, GX, GY, n, z0, ks, AX, thieu = dung(ma, so, khu, neo, tt, co)
    if thieu and ma in LAI: giay = round(giay * n / so, 2)  # thiếu khung cuối: giữ nhịp từng khung như prompt
    data = png(sh, 48 if ma in MO else 128)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'net': N, 'khung_rong': FW, 'khung_cao': FH,
         'goc': [GX, GY], 'so': n, 'giay': giay, 'lap': lap, 'xoay': xoay, 'co': 1, 'tron': 'thuong', 'thu': round(z0, 5),
         'tam': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    if ma == 'hu-vong-song':
        t['ban_kinh'] = ban_kinh(sh, FW, FH, GX, n)
        hs = []
        for i in range(n):
            m = sh[:, i * FW * N:(i + 1) * FW * N, 3] > 0; ys = np.nonzero(m.any(1))[0]; xs = np.nonzero(m.any(0))[0]
            hs.append((ys[-1] + 1 - ys[0]) / (xs[-1] + 1 - xs[0]))
        t['det'] = round(float(np.mean(hs[1:])), 3)  # cao / rộng vòng (khung 1 nhỏ, nét dày: bỏ)
    if ma.startswith('hu-moi-truong-rung'): t['vung'] = 'rung'
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[ma] = {'o': [FW, FH], 'goc': [GX, GY], 'so': n, 'thu': round(z0, 4), 'png': len(data), 'byte': os.path.getsize(ra)}
    if 'ban_kinh' in t: so_do[ma]['ban_kinh'] = t['ban_kinh']; so_do[ma]['det'] = t['det']
    print(ma, so_do[ma])
for ma, ten, so, khu, co, *ng in GD:
    sh, FW, FH, GX, GY, n, z0, ks, AX, _ = dung(ma, so, khu, 'giua', 40, co, *ng)
    data = png(sh, 48 if ma in MO else 128)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': 'giao-dien', 'rong': FW * n, 'cao': FH, 'net': N,
         'anh': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    if n > 1: t['so'] = n; t['khung_rong'] = FW
    if ma == 'gd-cot-nang-rung':
        # giữa dải sáng ở hàng trên cùng và dưới cùng (điểm game, tính từ mép trái ảnh), để room_art.js đặt đỉnh cột đúng chỗ cột cũ
        m = sh[..., 3] > 0; ys = np.nonzero(m.any(1))[0]; r0 = np.nonzero(m[ys[0]])[0]; r1 = np.nonzero(m[ys[-1]])[0]
        so_do[ma + ':y'] = [round(ys[0] / N, 1), round((ys[-1] + 1) / N, 1)]
        so_do[ma + ':dinh'] = [round((r0[0] + r0[-1] + 1) / 2 / N, 1), round((r1[0] + r1[-1] + 1) / 2 / N, 1)]
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[ma] = {'o': [FW, FH], 'so': n, 'thu': round(z0, 4), 'png': len(data), 'byte': os.path.getsize(ra)}
    print(ma, so_do[ma], so_do.get(ma + ':dinh', ''))
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
