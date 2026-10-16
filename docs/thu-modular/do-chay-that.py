# Phiên 2 bộ thử modular: ĐO khung que từ HÀNG CHẠY THẬT của Zed — chỉ là TÀI LIỆU, không đụng code game.
# Chạy từ thư mục gốc repo:  python3 docs/thu-modular/do-chay-that.py
#
# Nguồn: docs/anh-goc/zed/zed-v2-canonical.png, HÀNG 3 (y 512–767), 8 khung × ô 256×256
#        (cùng tấm, cùng tỉ lệ với dáng đứng của phiên 1 → dùng chung hệ toạ độ, chung tỉ lệ sang game).
# Ô chạy = ô 256×256 của tấm gốc, DỜI XUỐNG 9 px cho đường đất (đáy dép thấp nhất cả hàng, y = 239 trên tấm)
# trùng y = 248 như mọi que phiên 1. Không co giãn, không dời ngang → mọi khung cùng cỡ, cùng đường chân.
#
# Các bước:
#   1. ĐO TỰ ĐỘNG (do_tu_dong): tách màu (tóc, da, đỏ, tối) → đỉnh đầu, cằm, tâm đầu, nắm tay, mũi chân, cổ chân, eo;
#      các khớp còn lại suy ra bằng hình học (vai/hông theo thân, khuỷu/gối bằng IK 2 đoạn).
#   2. CHỈNH TAY: que-chay-that.chinh-tay.json ghi đè từng khớp sai (đã soát bằng mắt trên ảnh ×4 có lưới).
#   3. Ghi que-chay-that.json/png/gif, ảnh lưới, ảnh chồng que lên Zed từng khung, ảnh so tự động ↔ chỉnh tay.
#   4. Tách lớp bộ phận cơ thể TỪNG KHUNG bằng mặt nạ theo xương → bo-phan-chay/ + bo-phan-chay.json.
#   5. Neo đồ từng khung (trong que-chay-that.json) + ghép thử giáp/nón có sẵn lên Zed chạy thật.
#   6. Dựng lại kiem-tra.html (gọi lam_html của tao-bo-thu.py, đã có dáng "chay-that").
import importlib.util, json, math, os
import numpy as np
from PIL import Image, ImageDraw

DAY = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('tao_bo_thu', os.path.join(DAY, 'tao-bo-thu.py'))
T = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(T)
RA, P, A0, O, OG, font = T.RA, T.P, T.A0, T.O, T.OG, T.font
DEN, DO, XAM, TRANG = T.DEN, T.DO, T.XAM, T.TRANG

HANG, SO_KHUNG, DY = 3, 8, 9               # hàng 3 của tấm, 8 khung, dời xuống 9 px
GIAY = 0.075
CHINH = os.path.join(RA, 'que-chay-that.chinh-tay.json')
RA_BP = os.path.join(RA, 'bo-phan-chay')

def o_chay(i):
    """Ảnh ô khung i (0..7) đã dời về hệ ô que: RGB nền xanh + mặt nạ hình (True = có hình)."""
    tam = Image.open(T.TAM).convert('RGB')
    o = Image.new('RGB', (O, O), (0, 255, 0))
    o.paste(tam.crop((i * 256, (HANG - 1) * 256, (i + 1) * 256, HANG * 256 - DY)), (0, DY))
    a = np.array(o).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    nen = ((g > 150) & (r < 120) & (b < 120)) | (g > np.maximum(r, b) + 45)
    return o, a, ~nen

def lop_mau(a, hinh):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    toc = hinh & (r > 165) & (g > 140) & (b >= g + 5)
    da = hinh & (r > 185) & (g > 110) & (r - g > 25) & (b < g + 3) & (b > g - 55)
    do_ = hinh & (r > 110) & (g < 75) & (b < 90) & (r > g + 60)
    toi = hinh & (np.maximum(np.maximum(r, g), b) < 100)
    return toc, da, do_, toi

def thanh_phan(m):
    """Gán nhãn vùng liền (4 hướng). Trả về list (số điểm, ys, xs) giảm dần."""
    h, w = m.shape; nhan = np.zeros((h, w), int); ds = []; k = 0
    for y0, x0 in zip(*np.nonzero(m)):
        if nhan[y0, x0]: continue
        k += 1; st = [(y0, x0)]; nhan[y0, x0] = k; ys, xs = [], []
        while st:
            y, x = st.pop(); ys.append(y); xs.append(x)
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < h and 0 <= xx < w and m[yy, xx] and not nhan[yy, xx]:
                    nhan[yy, xx] = k; st.append((yy, xx))
        ds.append((len(ys), np.array(ys), np.array(xs)))
    return sorted(ds, key=lambda t: -t[0])

def ik(a, c, l1, l2, chon):
    """Khớp giữa của chuỗi 2 đoạn a→b→c; chon(b1, b2) chọn nghiệm. Quá tầm thì duỗi thẳng theo tỉ lệ."""
    dx, dy = c[0] - a[0], c[1] - a[1]; d = math.hypot(dx, dy)
    if d >= l1 + l2 - 0.01 or d < 1e-6:
        t = l1 / (l1 + l2); return (a[0] + dx * t, a[1] + dy * t)
    x = (d * d + l1 * l1 - l2 * l2) / (2 * d); h = math.sqrt(max(0, l1 * l1 - x * x))
    ux, uy = dx / d, dy / d
    b1 = (a[0] + ux * x - uy * h, a[1] + uy * x + ux * h); b2 = (a[0] + ux * x + uy * h, a[1] + uy * x - ux * h)
    return chon(b1, b2)

L = {k: T.LEN[k] for k in T.LEN}          # độ dài xương dáng đứng (px gốc)
K_CHAN = 1.15                             # quần ống thụng, dáng chạy thấp người: chân đo trên hình dài hơn ~15%

def do_tu_dong(i):
    o, a, hinh = o_chay(i)
    toc, da, do_, toi = lop_mau(a, hinh)
    J = {}
    # --- đầu: vùng tóc lớn nhất; đỉnh = phân vị 10% mép trên ở 50% cột giữa (bỏ chỏm tóc nhọn, sừng là màu đỏ)
    vt = [v for v in thanh_phan(toc) if v[0] > 60]          # sừng cắt tóc thành nhiều mảng → gộp các mảng lớn
    ty = np.concatenate([v[1] for v in vt]); tx = np.concatenate([v[2] for v in vt])
    x0, x1 = np.percentile(tx, 25), np.percentile(tx, 75)
    tren = [ty[tx == x].min() for x in range(int(x0), int(x1) + 1) if (tx == x).any()]
    dinh = (float(np.median([x for x in range(int(x0), int(x1) + 1) if (tx == x).any()])), float(np.percentile(tren, 10)))
    # mặt: vùng da LỚN NHẤT có tâm trên y 140 (tai là mảng da nhỏ hơn)
    vung_da = [v for v in thanh_phan(da) if v[0] > 25]
    mat = max((v for v in vung_da if v[1].mean() < 140), key=lambda v: v[0])
    cy = mat[1].max(); cx = float(mat[2][mat[1] >= cy - 2].mean())
    J['dinh_dau'] = dinh; J['cam'] = (cx, float(cy))
    J['tam_dau'] = ((dinh[0] + cx) / 2 - 2, (dinh[1] + cy) / 2 + 4)
    # --- eo: dải đỏ (đai) ở y 165–200, x > 95 (bỏ khăn bay phía sau)
    ys, xs = np.nonzero(do_)
    k = (ys > 160) & (ys < 200) & (xs > 95)
    J['eo'] = (float(np.median(xs[k])), float(np.median(ys[k])))
    J['hong'] = (J['eo'][0] - 2, J['eo'][1] + 15)
    # --- bàn chân: điểm da (ngón chân lộ ra dép) ở y > 190 chia trái/phải theo x
    ys, xs = np.nonzero(da); k = ys > 190
    fx, fy = xs[k], ys[k]
    giua = (fx.min() + fx.max()) / 2
    for s, m in (('trai', fx < giua), ('phai', fx >= giua)):
        px, py = fx[m], fy[m]
        if s == 'phai':   # chân trước: mũi = điểm xa nhất về phía phải-dưới
            j = np.argmax(px + 0.5 * py); J['mui_chan_phai'] = (float(px[j]), float(py[j]))
        else:             # chân sau (đá lên phía sau): mũi = điểm xa nhất về bên trái
            j = np.argmin(px - 0.3 * py); J['mui_chan_trai'] = (float(px[j]), float(py[j]))
        J['co_chan_' + s] = (float(px.mean()), float(py.mean()))
    # --- nắm tay: vùng da cỡ vừa ở y 130–195 không phải mặt, không phải ngực (ngực = vùng da lớn nhất dưới mặt)
    duoi = [v for v in vung_da if v is not mat and 125 < v[1].mean() < 200]
    nguc = max(duoi, key=lambda v: v[0]) if duoi else None
    tay = sorted([v for v in duoi if v is not nguc], key=lambda v: -v[2].mean())
    if tay:
        J['nam_tay_phai'] = (float(tay[0][2].mean()), float(tay[0][1].mean()))
        J['nam_tay_trai'] = (float(tay[-1][2].mean()), float(tay[-1][1].mean())) if len(tay) > 1 else None
    # --- cổ: dưới cằm, lùi về sau theo hướng thân
    J['co'] = (J['cam'][0] - 24, J['cam'][1] + 4)
    return J, o, hinh

def suy_ra(J):
    """Điền khớp còn thiếu bằng hình học. Vai/hông theo hướng thân, ép ngang 0.5 (nhìn nghiêng); khuỷu/gối = IK."""
    J = dict(J)
    gt = T.goc(J['hong'], J['co']) - A0['than']
    for s in ('phai', 'trai'):
        if 'vai_' + s not in J:
            v = T.tru(P['vai_' + s], P['co']); v = (v[0] * 0.5, v[1]); J['vai_' + s] = T.cong(J['co'], T.xoay(v, gt))
        if 'hong_' + s not in J:
            v = T.tru(P['hong_' + s], P['hong']); v = (v[0] * 0.4, v[1]); J['hong_' + s] = T.cong(J['hong'], T.xoay(v, gt))
    if not J.get('nam_tay_trai'):   # tay xa khuất: đặt sau thân, buông chéo xuống
        J['nam_tay_trai'] = T.cong(J['vai_trai'], (-20, 30))
    for s, kt, kd, kb in (('phai', 'ttp', 'tdp', 'btp'), ('trai', 'ttt', 'tdt', 'btt')):
        if 'co_tay_' + s not in J:    # cổ tay = lùi từ tâm nắm tay về phía vai một đoạn bằng bàn tay
            n, v = J['nam_tay_' + s], J['vai_' + s]; d = max(1, T.dai(n, v))
            J['co_tay_' + s] = (n[0] + (v[0] - n[0]) / d * L[kb], n[1] + (v[1] - n[1]) / d * L[kb])
        if 'khuyu_' + s not in J:
            J['khuyu_' + s] = ik(J['vai_' + s], J['co_tay_' + s], L[kt], L[kd], lambda b1, b2: max(b1, b2, key=lambda b: b[1]))
    for s, kd, kc in (('phai', 'dp', 'cp'), ('trai', 'dt', 'ct')):
        if 'goi_' + s not in J:
            J['goi_' + s] = ik(J['hong_' + s], J['co_chan_' + s], L[kd] * K_CHAN, L[kc] * K_CHAN,
                               lambda b1, b2: max(b1, b2, key=lambda b: b[0]))
    J['goc'] = (J['hong'][0], float(OG[1]))      # điểm gốc khung = chiếu hông xuống đường đất
    return J

def goc_doan(J):
    a = {k: T.goc(J[x], J[y]) for k, (x, y) in T.CHUOI.items()}
    return a

THU_TU = [m for m, _, _ in T.KHOP]        # cùng 23 khớp với phiên 1

def doc_chinh():
    if not os.path.exists(CHINH): return {}
    with open(CHINH, encoding='utf-8') as f: return json.load(f)

# ------------------------------------------------------------------ ẢNH KIỂM
def ve_khung_that(im, o, ox, S, mo=1.0):
    rgba = o.convert('RGBA'); a = np.array(rgba); _, _, hinh = o_chay_mask(o)
    a[..., 3] = np.where(hinh, int(255 * mo), 0); z = Image.fromarray(a).resize((O * S, O * S), Image.NEAREST)
    im.paste(z, (ox, 0), z)

def o_chay_mask(o):
    a = np.array(o).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    nen = ((g > 150) & (r < 120) & (b < 120)) | (g > np.maximum(r, b) + 45)
    return o, a, ~nen

def anh_trong_suot(o):
    _, _, hinh = o_chay_mask(o); a = np.array(o.convert('RGBA')); a[..., 3] = np.where(hinh, 255, 0)
    return Image.fromarray(a)

def tam_chong(khung, anh, S=2, mo=0.55, nhan=None, khung2=None):
    """Hàng ô: Zed thật (mờ) + que đè lên. khung2 (nếu có) vẽ que thứ hai mảnh màu cam (đo tự động) để so."""
    n = len(khung); im = Image.new('RGB', (n * O * S, O * S + 28), TRANG); d = ImageDraw.Draw(im)
    for i, (J, a) in enumerate(khung):
        ox = i * O * S
        ve_khung_that(im, anh[i], ox, S, mo)
        d = ImageDraw.Draw(im); d.line([(ox, OG[1] * S), (ox + O * S, OG[1] * S)], fill=(150, 150, 150), width=2)
        if khung2:
            J2 = khung2[i]
            for _, x, y, _ in T.DOAN_VE: d.line([(ox + J2[x][0] * S, J2[x][1] * S), (ox + J2[y][0] * S, J2[y][1] * S)], fill=(255, 140, 0), width=2)
            for m, v in J2.items():
                if m != 'goc': d.ellipse([ox + v[0] * S - 3, v[1] * S - 3, ox + v[0] * S + 3, v[1] * S + 3], outline=(255, 140, 0), width=2)
        T.ve_que(im, J, ox, 0, S); d = ImageDraw.Draw(im)
        d.rectangle([ox, 0, ox + O * S - 1, O * S - 1], outline=(200, 200, 200))
        d.text((ox + 6, O * S + 5), nhan[i] if nhan else f'khung {i + 1}', fill=(200, 0, 0), font=font(15, True))
    return im

def luoi_chong(khung, anh, S=3):
    """Mỗi khung một ảnh ×3: lưới toạ độ (8/32 px), Zed thật, que, số khớp. Ghép 2 hàng × 4."""
    tam = []
    for i, (J, a) in enumerate(khung):
        im = Image.new('RGB', (O * S, O * S + 30), TRANG); d = ImageDraw.Draw(im)
        for v in range(0, O + 1, 8):
            c = (205, 218, 255) if v % 32 else (120, 150, 230)
            d.line([(v * S, 0), (v * S, O * S)], fill=c); d.line([(0, v * S), (O * S, v * S)], fill=c)
        ve_khung_that(im, anh[i], 0, S, 0.6); d = ImageDraw.Draw(im)
        for v in range(0, O, 32):
            d.text((v * S + 2, 2), str(v), fill=(40, 70, 170), font=font(12));
            if v: d.text((2, v * S + 2), str(v), fill=(40, 70, 170), font=font(12))
        d.line([(0, OG[1] * S), (O * S, OG[1] * S)], fill=(120, 120, 120), width=2)
        T.ve_que(im, J, 0, 0, S); d = ImageDraw.Draw(im)
        for k, m in enumerate(THU_TU, 1):
            x, y = J[m]; d.text((x * S + 6, y * S - 16), str(k), fill=(150, 0, 0), font=font(12, True), stroke_width=2, stroke_fill=TRANG)
        d.text((6, O * S + 6), f'khung {i + 1} · gốc (0,0) góc trên-trái ô · đất y={OG[1]}', fill=(200, 0, 0), font=font(15, True))
        d.rectangle([0, 0, O * S - 1, O * S - 1], outline=(60, 60, 60)); tam.append(im)
    w, h = tam[0].size; cot = 4; hang = math.ceil(len(tam) / cot)
    out = Image.new('RGB', (w * cot, h * hang + 40), TRANG); d = ImageDraw.Draw(out)
    for k, im in enumerate(tam): out.paste(im, ((k % cot) * w, (k // cot) * h))
    d.text((10, h * hang + 8), 'Số khớp: ' + '  '.join(f'{k}={m}' for k, m in enumerate(THU_TU, 1)), fill=DEN, font=font(14))
    return out

# ------------------------------------------------------------------ TÁCH LỚP BỘ PHẬN
# (tên tệp, khớp đầu, khớp cuối, bán kính px — bề dày nửa bộ phận trên hình, lớp vẽ)
BP = [
    ('dau', None, None, None, 50),
    ('than', 'hong', 'co', 20, 30),
    ('canh-tay-tren-phai', 'vai_phai', 'khuyu_phai', 8, 70), ('canh-tay-duoi-phai', 'khuyu_phai', 'co_tay_phai', 8, 71),
    ('ban-tay-phai', 'co_tay_phai', 'nam_tay_phai', 9, 72),
    ('canh-tay-tren-trai', 'vai_trai', 'khuyu_trai', 7, 10), ('canh-tay-duoi-trai', 'khuyu_trai', 'co_tay_trai', 7, 11),
    ('ban-tay-trai', 'co_tay_trai', 'nam_tay_trai', 9, 12),
    ('dui-phai', 'hong_phai', 'goi_phai', 18, 40), ('cang-chan-phai', 'goi_phai', 'co_chan_phai', 13, 41),
    ('ban-chan-phai', 'co_chan_phai', 'mui_chan_phai', 10, 42),
    ('dui-trai', 'hong_trai', 'goi_trai', 18, 20), ('cang-chan-trai', 'goi_trai', 'co_chan_trai', 13, 21),
    ('ban-chan-trai', 'co_chan_trai', 'mui_chan_trai', 10, 22),
]
KHAN = ('khan', 5)   # khăn đỏ bay sau lưng: lớp riêng (phụ kiện), không thuộc bộ phận nào
MAU_BP = {'dau': (255, 214, 102), 'than': (120, 200, 255), 'canh-tay-tren-phai': (255, 120, 120), 'canh-tay-duoi-phai': (230, 60, 60),
          'ban-tay-phai': (150, 20, 20), 'canh-tay-tren-trai': (255, 170, 220), 'canh-tay-duoi-trai': (220, 110, 190),
          'ban-tay-trai': (150, 50, 130), 'dui-phai': (110, 220, 110), 'cang-chan-phai': (40, 160, 60), 'ban-chan-phai': (10, 90, 30),
          'dui-trai': (180, 240, 170), 'cang-chan-trai': (120, 190, 150), 'ban-chan-trai': (60, 130, 110), 'khan': (200, 200, 200)}

def kc_doan(X, Y, a, b):
    ax, ay = a; bx, by = b; vx, vy = bx - ax, by - ay; l2 = vx * vx + vy * vy or 1
    t = np.clip(((X - ax) * vx + (Y - ay) * vy) / l2, 0, 1)
    return np.hypot(X - (ax + t * vx), Y - (ay + t * vy))

def tach_lop(J, o):
    """Mặt nạ theo xương. Mỗi điểm hình: (1) tóc/sừng hoặc nằm trong vòng đầu (trên đường cổ) → đầu;
    (2) các bộ phận có điểm nằm trong bán kính → lấy bộ phận LỚP CAO NHẤT (gần người xem); (3) không bộ phận nào
    trong bán kính: trên hông + sau cổ → khăn; còn lại → bộ phận có (khoảng cách − bán kính) nhỏ nhất."""
    _, a, hinh = o_chay_mask(o); toc, da, do_, toi = lop_mau(a, hinh)
    Y, X = np.mgrid[0:O, 0:O].astype(float)
    r_dau = T.dai(J['tam_dau'], J['dinh_dau'])
    # đường cổ: vuông góc với trục đầu (co → đỉnh), qua cổ; điểm phía đầu của đường này mới tính là đầu
    ux, uy = J['dinh_dau'][0] - J['co'][0], J['dinh_dau'][1] - J['co'][1]; n = math.hypot(ux, uy); ux, uy = ux / n, uy / n
    phia_dau = ((X - J['co'][0]) * ux + (Y - J['co'][1]) * uy) > 2
    vong = np.hypot(X - J['tam_dau'][0], Y - J['tam_dau'][1]) < r_dau * 1.0
    sung = hinh & do_ & (Y < J['tam_dau'][1] - 10) & (X > J['co'][0] - 5)   # sừng đỏ sẫm phía trên đầu
    la_dau = hinh & ((phia_dau & (vong | toc)) | sung)
    tot = np.full((O, O), -1); ten = [b[0] for b in BP] + ['khan']
    lech = []
    for k, (t, x, y, r, lop) in enumerate(BP):
        if t == 'dau': lech.append(np.hypot(X - J['tam_dau'][0], Y - J['tam_dau'][1]) - r_dau); continue
        lech.append(kc_doan(X, Y, J[x], J[y]) - r)
    lech = np.array(lech)
    lop = np.array([b[4] for b in BP])
    trong = lech <= 0
    diem = np.where(trong, lop[:, None, None], -1)
    chon = np.argmax(diem, axis=0); co_trong = trong.any(axis=0)
    gan = np.argmin(lech, axis=0)
    tot = np.where(co_trong, chon, gan)
    # khăn: điểm ngoài mọi bán kính, nằm trên hông và phía sau cổ (khăn bay ra sau lưng)
    khan = hinh & ~co_trong & (Y < J['hong'][1]) & (X < J['co'][0])
    tot = np.where(khan, len(BP), tot)
    tot = np.where(la_dau, 0, tot)
    tot = np.where(hinh, tot, -1)
    rgba = np.array(o.convert('RGBA'))
    ra = {}
    for k, t in enumerate(ten):
        m = tot == k
        if not m.any(): continue
        p = rgba.copy(); p[..., 3] = np.where(m, 255, 0)
        ys, xs = np.nonzero(m)
        ra[t] = (Image.fromarray(p), [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1], int(m.sum()))
    return ra, tot

def lam_bo_phan_chay(khung, anh):
    os.makedirs(RA_BP, exist_ok=True)
    ds = []; ban_do = []; rap = []; tach = []
    for i, ((J, a), o) in enumerate(zip(khung, anh)):
        ra, tot = tach_lop(J, o)
        thu = os.path.join(RA_BP, f'khung-{i + 1:02d}'); os.makedirs(thu, exist_ok=True)
        muc = {}
        for t, (im, hop, so) in ra.items():
            im.crop(hop).save(os.path.join(thu, t + '.png'))
            info = next((b for b in BP if b[0] == t), None)
            lop = info[4] if info else KHAN[1]
            m = {'anh': f'bo-phan-chay/khung-{i + 1:02d}/{t}.png', 'dat_tai_o': hop[:2], 'hop': hop, 'so_diem_anh': so, 'lop': lop}
            if info and info[1]:
                m.update({'pivot': info[1], 'pivot_o': [round(v, 1) for v in J[info[1]]],
                          'pivot_trong_anh': [round(J[info[1]][0] - hop[0], 1), round(J[info[1]][1] - hop[1], 1)],
                          'khop_cuoi': info[2], 'khop_cuoi_o': [round(v, 1) for v in J[info[2]]],
                          'goc_do': round(T.goc(J[info[1]], J[info[2]]), 1)})
            elif t == 'dau':
                m.update({'pivot': 'co', 'pivot_o': [round(v, 1) for v in J['co']],
                          'pivot_trong_anh': [round(J['co'][0] - hop[0], 1), round(J['co'][1] - hop[1], 1)],
                          'goc_do': round(T.goc(J['co'], J['dinh_dau']), 1)})
            muc[t] = m
        ds.append({'khung': i + 1, 'bo_phan': muc})
        # bản đồ màu bộ phận
        bd = np.full((O, O, 3), 255, np.uint8)
        ten = [b[0] for b in BP] + ['khan']
        for k, t in enumerate(ten): bd[tot == k] = MAU_BP[t]
        ban_do.append(Image.fromarray(bd))
        bda = np.dstack([bd, np.where(tot >= 0, 255, 0).astype(np.uint8)])   # bản đồ nền trong suốt (trang kiểm dùng)
        Image.fromarray(bda, 'RGBA').save(os.path.join(RA_BP, f'ban-do-{i + 1:02d}.png'))
        # ráp lại đúng thứ tự lớp (phải trùng ảnh gốc)
        r = Image.new('RGBA', (O, O), (255, 255, 255, 255))
        for t, (im, hop, so) in sorted(ra.items(), key=lambda kv: muc[kv[0]]['lop']): r.alpha_composite(im)
        rap.append(r.convert('RGB'))
        # tách rời (nổ tung): mỗi bộ phận dời ra xa tâm hông
        e = Image.new('RGBA', (O + 120, O + 60), (255, 255, 255, 255)); hx, hy = J['hong']
        for t, (im, hop, so) in sorted(ra.items(), key=lambda kv: muc[kv[0]]['lop']):
            cx, cy = (hop[0] + hop[2]) / 2, (hop[1] + hop[3]) / 2
            dx, dy = (cx - hx) * 0.3, (cy - hy) * 0.22
            e.alpha_composite(im, (int(60 + dx), int(20 + dy)))
        tach.append(e.convert('RGB'))
    # ảnh tổng: 4 hàng (gốc, bản đồ màu, ráp lại, tách rời) × 8 khung, ×2
    S = 2; w = (O + 120) * S; H = (O + 60) * S
    out = Image.new('RGB', (w * len(khung), H * 4 + 120), TRANG); d = ImageDraw.Draw(out)
    nhan_hang = ['Zed thật', 'Bản đồ bộ phận (mặt nạ theo xương)', 'Ráp lại theo lớp (phải giống hàng 1)', 'Tách rời']
    for i in range(len(khung)):
        g = Image.new('RGB', (O, O), TRANG); g.paste(anh_trong_suot(anh[i]), (0, 0), anh_trong_suot(anh[i]))
        for hng, im in enumerate([g, ban_do[i], rap[i], tach[i]]):
            out.paste(im.resize((im.width * S, im.height * S), Image.NEAREST), (i * w + 10, hng * H + 30))
        d.text((i * w + 14, 4), f'khung {i + 1}', fill=(200, 0, 0), font=font(18, True))
    for hng, t in enumerate(nhan_hang): d.text((14, hng * H + 30 + O * S + 4), t, fill=DEN, font=font(16, True))
    # chú giải màu
    x = 14; y = H * 4 + 40
    for t, c in MAU_BP.items():
        d.rectangle([x, y, x + 18, y + 18], fill=c, outline=DEN); d.text((x + 24, y), t, fill=DEN, font=font(14)); x += 24 + 9 * len(t) + 30
        if x > out.width - 260: x = 14; y += 28
    out.save(os.path.join(RA, 'bo-phan-chay.png'))
    # kiểm: ráp lại có trùng ảnh gốc không
    lech = []
    for i in range(len(khung)):
        g = Image.new('RGB', (O, O), TRANG); g.paste(anh_trong_suot(anh[i]), (0, 0), anh_trong_suot(anh[i]))
        lech.append(int((np.array(g) != np.array(rap[i])).any(axis=2).sum()))
    T.ghi_json('bo-phan-chay.json', {
        'loai': 'linh-khi-thu-modular-bo-phan-chay', 'phien_ban': 1, 'nhan_vat': 'zed-v2',
        'nguon': 'docs/anh-goc/zed/zed-v2-canonical.png hàng 3 (chạy, 8 khung), ô dời xuống 9 px (xem que-chay-that.json)',
        'he_toa_do': 'GỐC (0,0) = góc TRÊN-TRÁI ô 256×256. dat_tai_o = vị trí góc trên-trái của ảnh bộ phận trong ô. '
                     'pivot_o / khop_cuoi_o = toạ độ khớp trong ô; pivot_trong_anh = toạ độ pivot trong ảnh bộ phận.',
        'cach_tach': 'Mặt nạ theo xương que-chay-that.json: điểm tóc/sừng và điểm trong vòng đầu phía trên đường cổ → đầu; '
                     'còn lại: các bộ phận có điểm nằm trong bán kính (ban_kinh_px) → bộ phận lớp cao nhất; ngoài mọi bán kính: '
                     'nằm trên hông và sau cổ → khăn (phụ kiện), còn lại → bộ phận gần nhất. Mỗi điểm ảnh thuộc đúng 1 tệp.',
        'ban_kinh_px': {b[0]: b[3] for b in BP if b[3]},
        'lop': {b[0]: b[4] for b in BP} | {'khan': KHAN[1]},
        'kiem_rap_lai_so_diem_lech': lech,
        'gioi_han': ['Quần ống thụng che gối: ranh đùi/cẳng chân là đường chia theo xương, không theo nếp vẽ.',
                     'Chỗ tay gần đè lên ngực: phần ngực sát tay vào tay (lớp cao hơn). Tay xa khuất sau thân ở khung 3–6 chỉ còn nắm tay.',
                     'Mép giữa 2 bộ phận là đường cắt cứng; xoay bộ phận nhiều sẽ hở mép — chỉ dùng để thay đồ theo từng khung, không để xoay tự do.'],
        'khung': ds})
    return lech

# ------------------------------------------------------------------ CHÍNH
def lam():
    chinh = doc_chinh()
    tu_dong, khung, anh = [], [], []
    for i in range(SO_KHUNG):
        Jt, o, hinh = do_tu_dong(i)
        Jt_day = suy_ra(Jt)
        Jc = dict(Jt)
        for m, v in chinh.get('khung', {}).get(str(i + 1), {}).items():
            if not m.startswith('_'): Jc[m] = tuple(v)
        # khớp chỉnh tay có thể làm khớp suy ra thay đổi → suy lại từ khớp đã chỉnh
        Jc = suy_ra({m: v for m, v in Jc.items() if m in chinh.get('khung', {}).get(str(i + 1), {}) or m in DO_DUOC})
        tu_dong.append(Jt_day); khung.append((Jc, goc_doan(Jc))); anh.append(o)
    # ảnh
    nhan = [f'khung {i + 1}' for i in range(SO_KHUNG)]
    T.tam_que('', khung, GIAY, '').save(os.path.join(RA, 'que-chay-that.png'))
    fr = []
    for J, a in khung:
        f = Image.new('RGB', (O, O), TRANG); ImageDraw.Draw(f).line([(8, OG[1]), (O - 8, OG[1])], fill=(185, 185, 185))
        T.ve_que(f, J); fr.append(f.resize((O * 2, O * 2), Image.NEAREST))
    fr[0].save(os.path.join(RA, 'que-chay-that.gif'), save_all=True, append_images=fr[1:], duration=int(GIAY * 1000), loop=0)
    fr = []
    for (J, a), o in zip(khung, anh):
        f = Image.new('RGB', (O * 2, O * 2), TRANG); ve_khung_that(f, o, 0, 2, 0.55); T.ve_que(f, J, 0, 0, 2); fr.append(f)
    fr[0].save(os.path.join(RA, 'que-chay-that-chong-zed.gif'), save_all=True, append_images=fr[1:], duration=int(GIAY * 1000), loop=0)
    T.luoi(khung).save(os.path.join(RA, 'que-chay-that-luoi.png'))
    tam_chong(khung, anh, nhan=nhan).save(os.path.join(RA, 'que-chay-that-chong-zed.png'))
    luoi_chong(khung, anh).save(os.path.join(RA, 'que-chay-that-chong-zed-luoi.png'))
    tam_chong(khung, anh, khung2=tu_dong, nhan=[f'k{i + 1}: cam = tự động, đen = sau chỉnh' for i in range(SO_KHUNG)]).save(
        os.path.join(RA, 'que-chay-that-tu-dong-va-chinh.png'))
    # hàng chạy thật trơn (để gửi kèm prompt): 8 ô 256 nền xanh, cùng đường đất
    h = Image.new('RGB', (O * SO_KHUNG, O), (0, 255, 0))
    for i, o in enumerate(anh): h.paste(o, (i * O, 0))
    h.save(os.path.join(RA, 'zed-chay-that-hang.png'))
    # JSON
    ds = []
    for i, (J, a) in enumerate(khung):
        chinh_k = {m: v for m, v in chinh.get('khung', {}).get(str(i + 1), {}).items() if not m.startswith('_')}
        ds.append({'khung': i + 1,
                   'neo_do': T.neo_do(J, a),
                   'khop_px': {m: [round(J[m][0], 1), round(J[m][1], 1)] for m in THU_TU},
                   'khop_game': {m: T.cell_game(J[m]) for m in THU_TU},
                   'goc_doan_do': {k: round(v, 1) for k, v in a.items()},
                   'nguon_khop': {m: ('chinh_tay' if m in chinh_k else ('do_tu_dong' if m in DO_DUOC else 'suy_ra')) for m in THU_TU},
                   'tu_dong_truoc_chinh': {m: [round(tu_dong[i][m][0], 1), round(tu_dong[i][m][1], 1)] for m in THU_TU},
                   'ghi_chu_chinh': chinh.get('khung', {}).get(str(i + 1), {}).get('_ghi_chu', '')})
    T.ghi_json('que-chay-that.json', {
        'loai': 'linh-khi-thu-modular-que', 'phien_ban': 2, 'dong_tac': 'chạy THẬT (đo từ sprite), 8 khung, lặp',
        'nguon': 'docs/anh-goc/zed/zed-v2-canonical.png HÀNG 3 (y 512–767), cột i = ô x (i−1)×256 … i×256. '
                 'Cùng tấm và cùng tỉ lệ với dáng đứng phiên 1. Hàng game đang dùng (moi/03-chay-v4, 12 khung) là bản vẽ khác '
                 '(bộ ninja tóc đen, cỡ khác) — không dùng ở đây.',
        'so_khung': SO_KHUNG, 'giay_moi_khung': GIAY, 'o': [O, O], 'goc_trong_o': list(OG),
        'doi_o': f'ô que = ô tấm gốc dời xuống {DY} px (đường đất tấm y=239 → y={OG[1]}); không co giãn, không dời ngang',
        'he_toa_do': 'GỐC (0,0) = góc TRÊN-TRÁI của khung (ô 256×256). khop_px/neo_do: (x, y) điểm ảnh trong ô (ô i nằm ở '
                     'x = (i−1)×256 trên que-chay-that.png và zed-chay-that-hang.png). khop_game: khung 48×48, chân [24,45], '
                     'cùng tỉ lệ phiên 1 (1 px = 0.1314 điểm game). Góc: 0° sang phải, 90° xuống. "goc" = hông chiếu xuống đất.',
        'quy_uoc_trai_phai': 'phải = phía GẦN người xem (vẽ trước thân), trái = phía XA (vẽ sau). Ở hàng này tay/chân KHÔNG đổi '
                             'bên giữa các khung (sprite vẽ kiểu phi): chân phải = chân TRƯỚC (đặt xuống đất ở khung 1,2,5,7,8), '
                             'chân trái = chân SAU (đá ngược lên); tay phải = nắm tay đưa trước ngực, tay trái = tay xa '
                             '(ló dưới tay phải ở khung 1,2,7,8; vung ra sau lưng ở khung 3–6).',
        'cach_do': 'Tự động (do-chay-that.py: tách màu tóc/da/đỏ → đỉnh đầu, cằm, tâm đầu, eo, nắm tay, mũi + cổ chân; '
                   'vai/hông theo thân; khuỷu/gối IK) rồi soát bằng mắt trên ảnh ×4 có lưới, chỉnh tay trong '
                   'que-chay-that.chinh-tay.json. nguon_khop từng khớp ghi rõ khớp nào chỉnh tay. Sai số ước ±3 px (±0.4 điểm game); '
                   'gối/khuỷu nằm trong quần thụng, ống tay — vị trí ước theo dáng, sai số lớn hơn (±5 px).',
        'khoa_goc': {k: f'{a}→{b}' for k, (a, b) in T.CHUOI.items()},
        'cach_gan_do': T.json.load(open(os.path.join(RA, 'que-chay-8.json'), encoding='utf-8'))['cach_gan_do'],
        'thu_tu_lop': T.LOP_DO, 'khung': ds})
    lech = lam_bo_phan_chay(khung, anh)
    lam_ghep_that(khung, anh)
    lam_mau_gen(khung, anh)
    # dựng lại trang kiểm (giữ dáng cũ, thêm chay-that)
    do = [(x, T.cat_do(x[0])) for x in T.DO_THU]; T.lam_html(do)
    return khung, tu_dong, lech

DO_DUOC = {'dinh_dau', 'tam_dau', 'cam', 'co', 'eo', 'hong', 'nam_tay_phai', 'nam_tay_trai',
           'co_chan_phai', 'co_chan_trai', 'mui_chan_phai', 'mui_chan_trai'}

def lam_ghep_that(khung, anh):
    """Giáp + nón có sẵn (lop-ghep/) đặt lên Zed chạy THẬT bằng neo từng khung (không vẽ lại)."""
    do = [(x, T.cat_do(x[0])) for x in T.DO_THU]; fn = T.ham_ghep(do); S = 2
    n = len(khung); im = Image.new('RGB', (n * O * S, O * S + 28), TRANG); fr = []
    for i, ((J, a), o) in enumerate(zip(khung, anh)):
        f = Image.new('RGB', (O * S, O * S), TRANG)
        z = anh_trong_suot(o).resize((O * S, O * S), Image.NEAREST)
        viec = fn(0, J, a, 0, S) + [(30, lambda c, z=z: c.paste(z, (0, 0), z))]
        for _, g in sorted(viec, key=lambda t: t[0]): g(f)
        im.paste(f, (i * O * S, 0)); fr.append(f)
        ImageDraw.Draw(im).text((i * O * S + 6, O * S + 5), f'khung {i + 1}', fill=(200, 0, 0), font=font(15, True))
    im.save(os.path.join(RA, 'ghep-thu-giap-non-chay-that.png'))
    fr[0].save(os.path.join(RA, 'ghep-thu-giap-non-chay-that.gif'), save_all=True, append_images=fr[1:], duration=80, loop=0)

NHOM_GEN = {   # ảnh mẫu gửi kèm prompt gen theo TỪNG PHẦN: vùng tô màu = chỗ món đồ phải phủ, mỗi khung
    'ao': (['than', 'canh-tay-tren-phai', 'canh-tay-tren-trai'], 'áo (thân + tay áo ngắn)'),
    'quan': (['dui-phai', 'cang-chan-phai', 'dui-trai', 'cang-chan-trai'], 'quần (đùi + cẳng chân)'),
    'mu': (['dau'], 'mũ / tóc (đầu)'),
    'gang': (['canh-tay-duoi-phai', 'ban-tay-phai', 'canh-tay-duoi-trai', 'ban-tay-trai'], 'găng / bao tay (cẳng tay + bàn tay)'),
    'giay': (['ban-chan-phai', 'ban-chan-trai'], 'giày / dép (bàn chân)'),
}
def lam_mau_gen(khung, anh):
    """mau-gen/<nhóm>.png: 1 hàng 8 ô 256, nền #00FF00, Zed thật xám nhạt, vùng bộ phận của nhóm tô màu (gần đậm, xa nhạt)."""
    os.makedirs(os.path.join(RA, 'mau-gen'), exist_ok=True)
    ten = [b[0] for b in BP] + ['khan']
    tots = [tach_lop(J, o)[1] for (J, a), o in zip(khung, anh)]
    for nhom, (ds, _) in NHOM_GEN.items():
        h = np.zeros((O, O * len(khung), 3), np.uint8); h[...] = (0, 255, 0)
        for i, tot in enumerate(tots):
            o = np.array(anh[i]).astype(int); g = o.mean(axis=2)
            xam = (170 + (g - 128) * 0.25).clip(120, 220).astype(np.uint8)
            cell = h[:, i * O:(i + 1) * O]
            cell[tot >= 0] = np.stack([xam] * 3, -1)[tot >= 0]
            for t in ds:
                m = tot == ten.index(t); xa = t.endswith('trai')
                c = np.array((235, 120, 40) if not xa else (240, 175, 120))
                cell[m] = (c * 0.7 + o[m] * 0.3).astype(np.uint8)
        Image.fromarray(h).save(os.path.join(RA, 'mau-gen', f'vung-{nhom}.png'))

if __name__ == '__main__':
    khung, tu_dong, lech = lam()
    for i, (J, a) in enumerate(khung):
        print(i + 1, {m: tuple(round(v) for v in J[m]) for m in THU_TU})
    print('ráp lại lệch (điểm ảnh):', lech)
    print('xong')
