"""Bước 2 – gạch gỗ-rễ và gạch đá cho Làng Chuông: ô 32 px logic, xuất 64 px (2x), ghép liền, viền đen chỉ ở cạnh lộ.

Ảnh gen (nguon-v2/gach-go.png, gach-da.png, 1575×999) đi theo vị trí khuôn khuon-gach-32.png (×1,2) nhưng:
  • gộp nhiều ô thành DẢI, mỗi dải có viền hộp bao ngoài;
  • MỌI dải đều có thảm rêu ở mặt trên (kể cả hàng khuôn dành cho ô thân / tường / đáy) → không có ô thân, tường, đáy dùng được.
Nên dựng như sau (làm ở độ phân giải R = 192 px/ô = ảnh gen ×1,25, cuối cùng thu ⅓ về 64 px):
  1. THÂN (ô đặc bên trong): ghép chồng nhiều dải "phần thân dưới rêu" lấy từ các dải gen (image quilting: chọn dải khớp
     nhất, nối bằng đường cắt nhỏ nhất), làm lặp liền 2 chiều, tối hơn mặt trên 15 % + giảm bão hoà ("phần trong dịu hơn").
     Gỗ: các hốc tối xanh lam dưới rễ (trông như lỗ thủng xuyên nền) đổi màu thành nâu gỗ sẫm.
  2. MẶT TRÊN (rêu): cắt từ dải gen, làm lặp ngang liền, đáy thay bằng mép trên ô thân (đường cắt nhỏ nhất) → xếp chồng liền.
  3. TƯỜNG / ĐÁY / CỘT / GÓC NGOÀI DƯỚI / GÓC TRONG: dựng bằng code từ ô thân + vẽ viền đen đúng độ dày viền gen
     (8 px ở R ≈ 2,7 px ở 2x ≈ 1,3 px logic), có dải bóng nhẹ phía trong viền.
  4. GÓC TRÊN TRÁI/PHẢI, ĐỈNH CỘT, KHỐI RỜI, VÁN MỘT CHIỀU: lấy từ ô gen tương ứng, cạnh giáp ô khác thay bằng mép ô kề.
  5. DỐC (2 dốc thoải 2 ô + dốc 45°, lên/xuống): dựng bằng code – trượt từng cột của ô mặt trên xuống theo mặt dốc,
     phần dưới là ô thân, vẽ lại viền theo mặt dốc. Như vậy mép dốc khớp đúng ô mặt trên và ô thân.
Mọi ô nằm gọn trong 64×64 (không thò ra ngoài ô) → vẽ thẳng theo lưới, không cần lệch."""
import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung import GACH, NGUON, T2, T_LOGIC, doi_co, khu_vien_trang, lap_ngang, luu_json, luu_png, nen_trang, \
    thay_le, xep_atlas

R = 192                 # cỡ ô khi làm việc
K = 1.25                # ảnh gen → ảnh làm việc (ô gen ≈ 153,6 px)
B_LAP = 56              # dải dùng để làm lặp liền
B_KHOP = 40             # dải thay để khớp ô kề
T_VIEN = 8              # độ dày viền đen (px ở R)
MAU_VIEN = np.array([16, 13, 12.0])
TOI_THAN = 0.80         # thân tối hơn mặt trên
DS = 3                  # R / 64
PAD = 12                # đệm khi thu nhỏ (px ở R)

# hộp các dải trên ảnh gen (px gen, đo bằng tách thành phần liên thông – giống nhau ở 2 ảnh, lệch ≤ 2 px)
DAI = {
    'r0-tren': (230, 37, 960, 186),     # khuôn: 4 ô mặt trên (c1–c3) + góc trên phải (c4) → 1 dải, viền phải
    'r0c0': (39, 37, 192, 186),         # góc trên trái
    'r0c5': (998, 37, 1152, 186),       # đỉnh cột
    'r0c6': (1190, 37, 1344, 90),       # ván: đầu trái
    'r0c7': (1382, 37, 1536, 90),       # ván: đầu phải (khuôn muốn ô giữa – gen vẽ đầu phải)
    'r1-12': (230, 224, 576, 378), 'r1-34': (614, 224, 960, 378), 'r1-67': (1190, 225, 1536, 378),
    'r1c0': (39, 225, 192, 378), 'r1c5': (998, 224, 1152, 378),
    'r2c0': (39, 416, 192, 570), 'r2c1': (230, 416, 384, 570), 'r2-23': (422, 417, 768, 570),
    'r2c4': (806, 416, 960, 570), 'r2c5': (998, 416, 1152, 570), 'r2-67': (1191, 417, 1536, 570),
    'r3c6': (1190, 608, 1344, 662), 'r3c7': (1382, 608, 1536, 662),
    'r4-03': (39, 802, 768, 954), 'r4c4': (806, 801, 960, 954), 'r4-56': (998, 802, 1344, 954),
}


# ------------------------------------------------------------------ chuẩn bị ảnh nguồn
def doi_mau_hoc(rgb):
    """Gỗ: hốc tối xanh lam dưới rễ → nâu gỗ sẫm (giữ độ sáng, đổi sắc)."""
    Rr, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    L = rgb @ np.array([0.299, 0.587, 0.114])
    m = ((B > Rr + 4) & (G > Rr) & (L < 110)).astype(float)
    m = nd.gaussian_filter(m, 1.2)[..., None]
    nau = np.array([86, 52, 34.0])
    Ln = nau @ np.array([0.299, 0.587, 0.114])
    moi = (L[..., None] / Ln) * nau * 0.95
    return rgb * (1 - m) + np.clip(moi, 0, 255) * m


def chuan_bi(ten_anh, go):
    a = np.asarray(Image.open(f'{NGUON}/{ten_anh}').convert('RGB')).astype(np.float64)
    if go:
        a = doi_mau_hoc(a)
    bg = nen_trang(a)
    rg = khu_vien_trang(a, ~bg)
    h, w = rg.shape[:2]
    big = doi_co(rg, round(w * K), round(h * K))
    # bớt li ti nhẹ (trung vị 5 px ở R ≈ 1,7 px ở 2x) – chỉ RGB, giữ alpha
    rgb = np.dstack([nd.median_filter(big[..., i], size=5) for i in range(3)])
    out = big.copy()
    out[..., :3] = rgb
    out[out[..., 3] == 0] = 0
    return out


def hop(ten):
    x0, y0, x1, y1 = DAI[ten]
    return round(x0 * K), round(y0 * K), round(x1 * K), round(y1 * K)


def cat(A, x, y, w=R, h=R):
    """Cắt ô w×h ở (x,y) ảnh làm việc; phần ngoài ảnh = trong suốt."""
    out = np.zeros((h, w, 4), np.uint8)
    H, W = A.shape[:2]
    xs0, ys0 = max(0, x), max(0, y)
    xs1, ys1 = min(W, x + w), min(H, y + h)
    out[ys0 - y:ys1 - y, xs0 - x:xs1 - x] = A[ys0:ys1, xs0:xs1]
    return out


# ------------------------------------------------------------------ màu theo độ sâu
def lam_toi(t, he):
    """Nhân độ sáng theo hệ số `he` (số, hoặc mảng theo hàng y) + giảm bão hoà tương ứng (he 0,85 → bão hoà 0,88)."""
    o = t.astype(np.float64)
    he = np.broadcast_to(np.asarray(he, float).reshape(-1, 1), (o.shape[0], 1))[..., None]
    bh = 1 - (1 - he) * 0.8
    L = (o[..., :3] @ np.array([0.299, 0.587, 0.114]))[..., None]
    o[..., :3] = np.clip((L + (o[..., :3] - L) * bh) * he, 0, 255)
    return np.round(o).astype(np.uint8)


def doc_sau(n=R, y0=80, y1=150):
    y = np.arange(n, dtype=float)
    s = np.clip((y - y0) / (y1 - y0), 0, 1)
    s = s * s * (3 - 2 * s)
    return 1 - (1 - TOI_THAN) * s


# ------------------------------------------------------------------ ô thân: dựng bằng code (mảng phẳng, 1 tông bóng)
# Bảng màu lấy từ phần thân của ảnh gen (phân vị độ sáng 5/20/40/60/80/95 %), trước khi làm tối.
MAU_GO = dict(sau=(70, 42, 30), toi=(98, 60, 42), vua=(124, 76, 47), sang=(146, 91, 51), noi=(166, 104, 57))
MAU_DA = dict(vua=(40, 48, 55), bong=(62, 73, 83), mat=(84, 96, 106), sang=(106, 116, 123))
SS = 2            # siêu lấy mẫu khi vẽ (khử răng cưa)


def _thu(img):
    n = img.shape[0] // SS
    return img.reshape(n, SS, n, SS, -1).mean((1, 3))


def go_than(seed, so_re=2, day=(74, 92), diu=False):
    """Thân gỗ-rễ lặp liền 2 chiều: các rễ lớn chạy ngang uốn lượn (mảng phẳng: thân vừa, nửa trên sáng, mép dưới
    có 1 vệt bóng + nét sẫm mảnh), giữa các rễ là nền nâu sẫm. Mọi đường cong có chu kỳ đúng R → lặp liền.
    diu=True: cùng hình rễ nhưng bỏ nét sẫm, dải sáng hẹp (dùng cho biến thể ít chi tiết)."""
    rng = np.random.default_rng(seed)
    n = R * SS
    x = (np.arange(n) + 0.5) / SS
    y = (np.arange(n) + 0.5) / SS
    img = np.empty((n, n, 3))
    img[:] = MAU_GO['toi']
    tam0 = rng.uniform(0, R)
    for i in range(so_re):
        tam = tam0 + i * R / so_re + rng.uniform(-8, 8)
        yc = tam + rng.uniform(8, 16) * np.sin(2 * np.pi * x / R + rng.uniform(0, 6.3)) \
            + rng.uniform(2, 5) * np.sin(4 * np.pi * x / R + rng.uniform(0, 6.3))
        th = rng.uniform(*day) + 10 * np.sin(2 * np.pi * x / R + rng.uniform(0, 6.3))
        dy = (y[:, None] - yc[None, :] + R / 2) % R - R / 2          # khoảng cách dọc có quấn vòng
        u = (dy + th[None, :] / 2) / th[None, :]                     # 0 = mép trên rễ, 1 = mép dưới
        m = (u >= 0) & (u <= 1)
        c = np.empty((n, n, 3))
        c[:] = MAU_GO['vua']
        if not diu:
            c[u < 0.40] = MAU_GO['sang']
            c[u < 0.10] = MAU_GO['noi']
            c[u > 0.84] = MAU_GO['toi']
            c[u > 0.965] = MAU_GO['sau']
        else:
            c[u < 0.30] = MAU_GO['sang']
        img[m] = c[m]
    return _thu(img)


def _mat_na_trong(le=22, doc=26):
    """1 ở giữa ô, 0 sát 4 mép (trong `le` px), chuyển mềm trong `doc` px → phần đổi không chạm mép ô."""
    a = np.minimum(np.arange(R), R - 1 - np.arange(R))
    d = np.minimum.outer(a, a)
    return np.clip((d - le) / doc, 0, 1)


def _to_re(u, c):
    c[:] = MAU_GO['vua']
    c[u < 0.40] = MAU_GO['sang']
    c[u < 0.12] = MAU_GO['noi']
    c[u > 0.82] = MAU_GO['toi']
    c[u > 0.95] = MAU_GO['sau']
    return c


def go_mat(seed):
    """Mắt gỗ (bầu dục: viền sẫm, lõi tối, chấm sáng) ở giữa ô. Trả lớp RGBA."""
    rng = np.random.default_rng(seed)
    n = R * SS
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / SS
    cx, cy = rng.uniform(80, 112), rng.uniform(80, 112)
    rx, ry = rng.uniform(22, 28), rng.uniform(13, 17)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    lop = np.zeros((n, n, 4))
    lop[d <= 1.0] = (*MAU_GO['sau'], 255)
    lop[d <= 0.80] = (*MAU_GO['toi'], 255)
    lop[d <= 0.45] = (*MAU_GO['vua'], 255)
    lop[(d <= 0.45) & (yy < cy - 2)] = (*MAU_GO['sang'], 255)
    return _thu(lop)


def go_nhanh(seed):
    """Một rễ nhánh ngắn chéo qua giữa ô (đầu tròn), tô như rễ chính. Trả lớp RGBA."""
    rng = np.random.default_rng(seed)
    n = R * SS
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / SS
    x1, y1 = rng.uniform(48, 70), rng.uniform(112, 136)
    x2, y2 = rng.uniform(122, 144), rng.uniform(56, 80)
    th = rng.uniform(36, 42)
    vx, vy = x2 - x1, y2 - y1
    L2 = vx * vx + vy * vy
    t = np.clip(((xx - x1) * vx + (yy - y1) * vy) / L2, 0, 1)
    px, py = x1 + t * vx, y1 + t * vy
    nx, ny = -vy / np.sqrt(L2), vx / np.sqrt(L2)
    if ny < 0:
        nx, ny = -nx, -ny
    dd = np.sqrt((xx - px) ** 2 + (yy - py) ** 2)
    u = (((xx - px) * nx + (yy - py) * ny) + th / 2) / th
    lop = np.zeros((n, n, 4))
    c = _to_re(u, np.empty((n, n, 3)))
    m = dd <= th / 2
    lop[m, :3] = c[m]
    lop[m, 3] = 255
    vien = (dd > th / 2) & (dd <= th / 2 + 2.5)
    lop[vien] = (*MAU_GO['sau'], 255)
    return _thu(lop)


def da_than(seed, kieu='thuong', hang=(62, 66, 64), rong=(64, 80, 96, 112, 128)):
    """Thân đá xây lặp liền: 3 hàng khối, mạch vữa sẫm, mỗi khối 1 màu mặt + dải sáng trên + 1 tông bóng dưới/phải.
    Bố cục khối theo `seed`; `kieu` chỉ đổi các khối KHÔNG vắt qua mép ô (mép ô giữ y hệt → ghép liền với ô thân):
      'mau' = đổi độ sáng khối trong; 'tach' = chia đôi khối trong dài nhất mỗi hàng; 'gop' = gộp các khối trong liền nhau."""
    rng = np.random.default_rng(seed)
    rng2 = np.random.default_rng(seed * 7 + len(kieu))
    n = R * SS
    img = np.empty((n, n, 3))
    img[:] = MAU_DA['vua']
    g, rb = 5 * SS, 10 * SS
    yy, xx = np.mgrid[0:n, 0:n]
    y0 = 0
    for h in hang:
        h2 = h * SS
        x = rng.uniform(0, R) * SS
        bien = [x]
        while True:
            w = rng.choice(rong) * SS
            if bien[-1] + w >= x + n - 40 * SS:
                break
            bien.append(bien[-1] + w)
        bien.append(x + n)
        khoi = [[a, b, rng.uniform(0.93, 1.06)] for a, b in zip(bien[:-1], bien[1:])]
        cham = [k for k in khoi if k[0] < n < k[1]]                  # khối vắt qua mép phải↔trái ô
        trong = [k for k in khoi if not (k[0] < n < k[1])]
        if kieu == 'mau':
            for k in trong:
                k[2] = rng2.uniform(0.86, 1.10)
        elif kieu == 'tach' and trong:
            k = max(trong, key=lambda k: k[1] - k[0])
            if k[1] - k[0] >= 100 * SS:
                m = (k[0] + k[1]) / 2
                trong.remove(k)
                trong += [[k[0], m, k[2]], [m, k[1], k[2] * rng2.uniform(0.90, 1.04)]]
        elif kieu == 'gop' and len(trong) > 1:
            trong.sort()
            moi = [list(trong[0])]
            for k in trong[1:]:
                if abs(k[0] - moi[-1][1]) < 1:
                    moi[-1][1] = k[1]
                else:
                    moi.append(list(k))
            trong = moi
        for a, b, f in cham + trong:
            for dx in (0, -n):
                X0, X1, Y0, Y1 = a + dx + g, b + dx - g, y0 + g, y0 + h2 - g
                if X1 < 0 or X0 > n:
                    continue
                qx = np.clip(xx, X0 + rb, X1 - rb)
                qy = np.clip(yy, Y0 + rb, Y1 - rb)
                m = ((xx - qx) ** 2 + (yy - qy) ** 2 <= rb * rb) & (xx >= X0) & (xx <= X1) & (yy >= Y0) & (yy <= Y1)
                c = np.empty((n, n, 3))
                c[:] = np.array(MAU_DA['mat']) * f
                c[(yy < Y0 + 8 * SS)] = np.array(MAU_DA['sang']) * f
                c[(yy > Y1 - 9 * SS) | (xx > X1 - 8 * SS)] = np.array(MAU_DA['bong']) * f
                img[m] = c[m]
        y0 += h2
    return _thu(img)


def _rgba(f):
    return np.round(np.dstack([np.clip(f, 0, 255), np.full(f.shape[:2], 255.0)])).astype(np.uint8)


def bo_than(go, seed=11):
    """[thân chính, biến thể 2, biến thể 3, biến thể ít chi tiết] – 4 mép của mọi biến thể Y HỆT thân chính
    (chỉ đổi phần giữa ô) → xen kẽ tự do không lộ nối."""
    if go:
        f0 = go_than(seed)
        out = [f0]
        for lop in (go_mat(seed + 1), go_nhanh(seed + 2)):
            a = (lop[..., 3:4] / 255) * (_mat_na_trong(14, 1)[..., None] > 0)
            out.append(f0 * (1 - a) + lop[..., :3] * a)
        q = _mat_na_trong(16, 40)[..., None]
        out.append(f0 * (1 - q) + go_than(seed, diu=True) * q)
    else:
        out = [da_than(seed), da_than(seed, 'mau'), da_than(seed, 'tach'), da_than(seed, 'gop')]
    return [_rgba(f) for f in out]


# ------------------------------------------------------------------ phủ thảm rêu (lấy từ gen) lên thân dựng bằng code
def la_reu(p):
    r, g, b = p[..., 0].astype(int), p[..., 1].astype(int), p[..., 2].astype(int)
    return (g > r + 12) & (g > b + 12) & (p[..., 3] > 128)


def phu_reu(gen, nen, them=3, bong=6):
    """gen: ô cắt từ ảnh gen (có rêu ở trên). Giữ phần gen từ mép trên đến đáy thảm rêu (theo từng cột) + `them` px,
    bên dưới là `nen`. Dưới mép rêu thêm 1 vệt bóng phẳng (cel)."""
    reu = la_reu(gen)
    toi = (gen[..., :3].astype(int).sum(-1) < 120) & (gen[..., 3] > 128)
    vung = reu | (toi & (np.arange(R)[:, None] < 20))
    lab, k = nd.label(vung)
    cham = np.unique(lab[:16][lab[:16] > 0])
    vung = np.isin(lab, cham)
    ys = np.arange(R)[:, None]
    day = np.where(vung.any(0), (vung * ys).max(0), 0)
    day = nd.maximum_filter1d(day, 3)
    giu = ys <= day[None, :] + them
    o = nen.astype(np.float64).copy()
    sh = (ys > day[None, :] + them) & (ys <= day[None, :] + them + bong)
    o[..., :3] *= np.where(sh, 0.72, 1.0)[..., None]
    gm = nd.gaussian_filter(giu.astype(float), 0.7)[..., None] * (gen[..., 3:4] / 255.0)
    o[..., :3] = gen[..., :3] * gm + o[..., :3] * (1 - gm)
    o[..., 3] = np.maximum(o[..., 3], gen[..., 3] * giu)
    return np.round(o).astype(np.uint8)


# ------------------------------------------------------------------ viền đen theo cạnh lộ
def ve_vien(t, lo='', goc_trong='', bo_tron=10, bong=12, mat_na=None):
    """t RGBA (R×R). lo: cạnh lộ ('L','R','T','B'); goc_trong: góc lõm ('TL','TR','BL','BR').
    Viền = phần đặc cách 'không khí' ≤ T_VIEN; ngoài ô ở cạnh không lộ coi là đặc. Góc ngoài (2 cạnh lộ gặp nhau) bo tròn.
    mat_na: mặt nạ đặc riêng (vd. dốc); mặc định alpha > 127."""
    t = t.copy()
    p = 3 * T_VIEN
    n = R + 2 * p
    dac = (t[..., 3] > 127) if mat_na is None else mat_na
    if bo_tron:
        yy, xx = np.mgrid[0:R, 0:R] + 0.5
        for g, (cx, cy) in {'TL': (bo_tron, bo_tron), 'TR': (R - bo_tron, bo_tron),
                            'BL': (bo_tron, R - bo_tron), 'BR': (R - bo_tron, R - bo_tron)}.items():
            if g[0] in lo and g[1] in lo:
                vung = ((xx < cx) if g[1] == 'L' else (xx > cx)) & ((yy < cy) if g[0] == 'T' else (yy > cy))
                ngoai = vung & ((xx - cx) ** 2 + (yy - cy) ** 2 > bo_tron ** 2)
                dac = dac & ~ngoai
                t[ngoai] = 0
    M = np.ones((n, n), bool)
    M[p:p + R, p:p + R] = dac
    if 'L' in lo: M[:, :p] = False
    if 'R' in lo: M[:, p + R:] = False
    if 'T' in lo: M[:p, :] = False
    if 'B' in lo: M[p + R:, :] = False
    for g in (goc_trong.split(',') if goc_trong else []):
        ys = slice(0, p) if g[0] == 'T' else slice(p + R, n)
        xs = slice(0, p) if g[1] == 'L' else slice(p + R, n)
        M[ys, xs] = False
    d = nd.distance_transform_edt(M)[p:p + R, p:p + R]
    o = t.astype(np.float64)
    vien = dac & (d <= T_VIEN)
    # dải bóng phía trong viền (sáng từ trên-trái: đáy/phải đậm hơn)
    if bong:
        k = np.clip((d - T_VIEN) / bong, 0, 1)
        o[..., :3] *= (0.80 + 0.20 * k)[..., None] * dac[..., None] + (~dac)[..., None]
    o[vien, :3] = MAU_VIEN
    o[vien, 3] = 255
    return np.round(o).astype(np.uint8)


# ------------------------------------------------------------------ dốc: trượt cột ô mặt trên
def mat_doc(kieu):
    """Độ cao mặt dốc (px từ đỉnh ô) theo cột x ∈ [0,R]. Trả mảng R+1 điểm biên (mép trái mỗi cột..mép phải)."""
    x = np.arange(R + 1, dtype=float)
    return {
        'thoai-len-1': R - x / 2,             # dốc thoải đi lên, nửa thấp: đáy → giữa
        'thoai-len-2': R / 2 - x / 2,         # nửa cao: giữa → đỉnh
        'thoai-xuong-1': x / 2,               # đi xuống, nửa cao: đỉnh → giữa
        'thoai-xuong-2': R / 2 + x / 2,       # nửa thấp: giữa → đáy
        'len': R - x,                         # 45° đi lên
        'xuong': x,                           # 45° đi xuống
    }[kieu]


def dung_doc(T0, F0, kieu):
    s_b = mat_doc(kieu)
    s = (s_b[:-1] + s_b[1:]) / 2              # độ cao ở tâm cột
    yy = np.arange(R)[:, None] + 0.5
    out = F0.astype(np.float64).copy()
    T = T0.astype(np.float64)
    for x in range(R):
        sh = s[x]
        src_y = yy[:, 0] - sh                  # hàng nguồn trong T0
        ok = src_y >= 0
        iy = np.clip(np.round(src_y - 0.5).astype(int), 0, R - 1)
        col = T[iy, x]
        sau = src_y
        w = np.clip((130 - sau) / 40, 0, 1) * ok
        out[:, x, :3] = col[:, :3] * w[:, None] + out[:, x, :3] * (1 - w[:, None])
    # mặt nạ đặc (chống răng cưa bằng siêu lấy mẫu 4×)
    ss = 4
    yf = (np.arange(R * ss) + 0.5) / ss
    xf = (np.arange(R * ss) + 0.5) / ss
    sf = np.interp(xf, np.arange(R + 1), s_b)
    m4 = (yf[:, None] >= sf[None, :]).astype(float)
    cov = m4.reshape(R, ss, R, ss).mean((1, 3))
    out[..., 3] = cov * 255
    o = np.round(out).astype(np.uint8)
    o[cov == 0] = 0
    # viền theo mặt dốc (khoảng cách tới vùng không khí phía trên mặt dốc)
    dac = cov > 0.5
    p = 3 * T_VIEN
    M = np.ones((R + 2 * p, R + 2 * p), bool)
    M[p:p + R, p:p + R] = dac
    M[:p, :] = False                           # phía trên ô là không khí
    # cạnh ở phía thấp của dốc: không khí bên ngoài ô ở phần trên mặt dốc
    if s_b[0] > 1:
        M[:p + int(s_b[0]), :p] = False
    if s_b[-1] > 1:
        M[:p + int(s_b[-1]), p + R:] = False
    d = nd.distance_transform_edt(M)[p:p + R, p:p + R]
    # khoảng cách liên tục tới đường mặt dốc (chính xác hơn edt rời rạc)
    sl = np.gradient(s)
    dd = (yy - s[None, :]) / np.sqrt(1 + sl[None, :] ** 2)
    d = np.minimum(d, np.where(dd > 0, dd, 0))
    vien = (d <= T_VIEN) & (cov > 0)
    of = o.astype(np.float64)
    k = np.clip((d - T_VIEN) / 12, 0, 1)
    of[..., :3] *= (0.85 + 0.15 * k)[..., None]
    of[vien, :3] = MAU_VIEN
    return np.round(of).astype(np.uint8)


# ------------------------------------------------------------------ thu nhỏ có đệm
def thu_nho(t, ke):
    """ke: {'L'|'R'|'T'|'B': ô kề (R×R) hoặc None}. Đệm PAD px nội dung ô kề rồi thu ⅓ → cắt 64×64."""
    n = R + 2 * PAD
    c = np.zeros((n, n, 4), np.uint8)
    c[PAD:PAD + R, PAD:PAD + R] = t
    if ke.get('L') is not None: c[PAD:PAD + R, :PAD] = ke['L'][:, R - PAD:]
    if ke.get('R') is not None: c[PAD:PAD + R, PAD + R:] = ke['R'][:, :PAD]
    if ke.get('T') is not None: c[:PAD, PAD:PAD + R] = ke['T'][R - PAD:]
    if ke.get('B') is not None: c[PAD + R:, PAD:PAD + R] = ke['B'][:PAD]
    o = doi_co(c, n // DS, n // DS)
    q = PAD // DS
    o = o[q:q + T2, q:q + T2].copy()
    o[o[..., 3] < 16] = 0                          # bỏ vụn gần trong suốt
    # mép giáp ô kề: điểm gần đặc → đặc hẳn (4 ô gặp nhau không lộ lỗ mờ)
    a = o[..., 3]
    for k, sl in (('L', (slice(None), slice(0, 2))), ('R', (slice(None), slice(T2 - 2, T2))),
                  ('T', (slice(0, 2), slice(None))), ('B', (slice(T2 - 2, T2), slice(None)))):
        if ke.get(k) is not None:
            v = a[sl]
            v[v >= 150] = 255
    return o


# ------------------------------------------------------------------ dựng bộ ô 1 chất liệu
def bo_o(A, pre, go):
    O = {}       # ten -> (anh R×R, ke {}, mo_ta, nguon)
    Fr = bo_than(go)
    F = [lam_toi(f, TOI_THAN) for f in Fr]
    F0 = F[0]
    sau = doc_sau()
    TH = lam_toi(Fr[0], sau)             # thân dưới mặt trên: sáng ở trên, tối dần về đúng F0 ở đáy ô

    def khop(t, ref, canh, b=B_KHOP):
        return thay_le(t, ref, canh, b)

    def tu_than(lo, gt='', nen=F0, **kw):
        return ve_vien(nen, lo, gt, **kw)

    # --- thân + biến thể
    O[f'{pre}-than'] = (F0, {'L': F0, 'R': F0, 'T': F0, 'B': F0}, 'thân (đặc bên trong) – lặp liền 2 chiều', 'code (màu lấy từ gen)')
    for ten, f, mt in ((f'{pre}-than-2', F[1], 'thân – biến thể 2 (' + ('mắt gỗ' if go else 'đổi sáng vài khối') + ')'),
                       (f'{pre}-than-3', F[2], 'thân – biến thể 3 (' + ('rễ nhánh chéo' if go else 'chia đôi khối dài') + ')'),
                       (f'{pre}-than-diu', F[3], 'thân – biến thể ÍT chi tiết (' + ('bỏ nét sẫm giữa ô' if go else 'gộp khối') + ')')):
        O[ten] = (f, {'L': F0, 'R': F0, 'T': F0, 'B': F0}, mt + '; 4 mép y hệt thân', 'code (chỉ đổi phần giữa ô)')

    # --- mặt trên giữa (T0) + biến thể: thảm rêu gen phủ lên thân code
    def lay_tren(ten_dai, dx, lap=False):
        x0, y0, x1, y1 = hop(ten_dai)
        t = cat(A, x0 + 18 + dx, y0, R + (B_LAP if lap else 0), R)
        return lap_ngang(t, B_LAP) if lap else t

    T0 = phu_reu(lay_tren('r0-tren', 40, lap=True), TH)
    O[f'{pre}-tren-giua'] = (T0, {'L': T0, 'R': T0, 'B': F0}, 'mặt trên giữa – lặp ngang liền', 'rêu: gen hàng 0 (dải 4 ô); thân: code')
    for i, (dai, dx) in enumerate([('r4-03', 120), ('r4-56', 40), ('r1-12', 30)], 2):
        t = phu_reu(lay_tren(dai, dx), TH)
        t = khop(khop(t, T0, 'trai'), T0, 'phai')
        O[f'{pre}-tren-giua-{i}'] = (t, {'L': T0, 'R': T0, 'B': F0}, f'mặt trên giữa – biến thể {i} (mép khớp mặt trên giữa)', f'rêu: gen dải {dai}')

    # --- tường, đáy, cột, góc trong (code)
    WL, WR = tu_than('L'), tu_than('R')
    O[f'{pre}-canh-trai'] = (WL, {'R': F0, 'T': WL, 'B': WL}, 'cạnh trái (tường) – lặp dọc', 'code: thân + viền trái')
    O[f'{pre}-canh-phai'] = (WR, {'L': F0, 'T': WR, 'B': WR}, 'cạnh phải (tường) – lặp dọc', 'code: thân + viền phải')
    DB = tu_than('B')
    O[f'{pre}-day-giua'] = (DB, {'L': DB, 'R': DB, 'T': F0}, 'mặt dưới (trần) – lặp ngang', 'code: thân + viền dưới')
    O[f'{pre}-day-trai'] = (tu_than('LB'), {'R': DB, 'T': WL}, 'góc ngoài dưới trái', 'code')
    O[f'{pre}-day-phai'] = (tu_than('RB'), {'L': DB, 'T': WR}, 'góc ngoài dưới phải', 'code')
    CT = tu_than('LR')
    O[f'{pre}-cot-than'] = (CT, {'T': CT, 'B': CT}, 'cột rộng 1 ô – thân, lặp dọc', 'code: thân + viền trái/phải')
    O[f'{pre}-cot-day'] = (tu_than('LRB'), {'T': CT}, 'cột rộng 1 ô – đáy (cột treo)', 'code')
    for g, mt in (('TL', 'trên-trái'), ('TR', 'trên-phải'), ('BL', 'dưới-trái'), ('BR', 'dưới-phải')):
        O[f'{pre}-goc-trong-{g.lower()}'] = (tu_than('', g), {'L': F0, 'R': F0, 'T': F0, 'B': F0},
                                              f'góc trong (lõm) {mt}: ô đặc, chỉ có chấm viền ở góc', 'code: thân + chấm viền góc')

    # --- các ô có rêu + viền cạnh lấy từ gen: rêu gen phủ lên (thân sáng-dần-tối + viền code)
    def tu_gen(ten_dai, lo, can='trai', bo_tron=10):
        x0, y0, x1, y1 = hop(ten_dai)
        x = {'trai': x0, 'phai': x1 - R, 'giua': x0 + (x1 - x0 - R) // 2}[can]
        g = cat(A, x, y0)
        # ô gen hẹp hơn R vài px: kéo dài cột mép giáp ô kề
        a = g[..., 3]
        if 'R' not in lo:
            for xx in range(R - 1, R - 8, -1):
                if (a[:60, xx] < 200).mean() > 0.5:
                    g[:, xx] = g[:, xx - 1]
        if 'L' not in lo:
            for xx in range(0, 8):
                if (a[:60, xx] < 200).mean() > 0.5:
                    g[:, xx] = g[:, xx + 1]
        return phu_reu(g, ve_vien(TH, lo.replace('T', ''), bo_tron=bo_tron))

    TL = khop(tu_gen('r0c0', 'L'), T0, 'phai')
    TR = khop(tu_gen('r0-tren', 'R', 'phai'), T0, 'trai')
    O[f'{pre}-tren-trai'] = (TL, {'R': T0, 'B': WL}, 'góc trên trái (mép trái + mặt rêu)', 'rêu: gen hàng 0 ô 0')
    O[f'{pre}-tren-phai'] = (TR, {'L': T0, 'B': WR}, 'góc trên phải', 'rêu: gen hàng 0, đầu phải dải')
    O[f'{pre}-tren-trai-2'] = (khop(tu_gen('r2c0', 'L'), T0, 'phai'), {'R': T0, 'B': WL}, 'góc trên trái – biến thể', 'rêu: gen hàng 2 ô 0')
    O[f'{pre}-tren-phai-2'] = (khop(tu_gen('r2c1', 'R'), T0, 'trai'), {'L': T0, 'B': WR}, 'góc trên phải – biến thể', 'rêu: gen hàng 2 ô 1')
    O[f'{pre}-cot-tren'] = (tu_gen('r0c5', 'LR', 'giua'), {'B': CT}, 'cột rộng 1 ô – đỉnh', 'rêu: gen hàng 0 ô 5')
    O[f'{pre}-khoi'] = (tu_gen('r4c4', 'LRB', 'giua'), {}, 'khối rời 1 ô (đủ 4 viền)', 'rêu: gen hàng 4 ô 4')

    # --- gờ nổi cao 1 ô (mặt trên + đáy lộ)
    NG = ve_vien(T0, 'B', bo_tron=0)
    O[f'{pre}-noi-giua'] = (NG, {'L': NG, 'R': NG}, 'gờ nổi cao 1 ô – giữa, lặp ngang', 'code: mặt trên + viền dưới')
    O[f'{pre}-noi-trai'] = (khop(tu_gen('r0c0', 'LB'), NG, 'phai'), {'R': NG}, 'gờ nổi cao 1 ô – đầu trái', 'rêu gen + code')
    O[f'{pre}-noi-phai'] = (khop(tu_gen('r0-tren', 'RB', 'phai'), NG, 'trai'), {'L': NG}, 'gờ nổi cao 1 ô – đầu phải', 'rêu gen + code')

    # --- ván một chiều (gen: 2 đầu trái r0c6/r3c6, 2 đầu phải r0c7/r3c7; ô giữa dựng từ phần trong của 2 đầu)
    def lay_van(ten):
        x0, y0, x1, y1 = hop(ten)
        v = cat(A, x0, y0, x1 - x0, R)
        m = v[..., 3] > 100
        lab, k = nd.label(m)
        if k >= 1:                                 # bỏ nét khung ô khuôn (xám nhạt) còn sót bên dưới
            sz = nd.sum(m, lab, range(1, k + 1))
            chinh = nd.binary_dilation(lab == (np.argmax(sz) + 1), iterations=2)
            v[~chinh] = 0
        return v
    vt, vp = lay_van('r0c6'), lay_van('r0c7')
    giua = np.concatenate([vt[:, 50:], vp[:, :-50]], 1)
    while giua.shape[1] < R + B_LAP:
        giua = np.concatenate([giua, vt[:, 50:]], 1)
    VG = lap_ngang(giua[:, :R + B_LAP], B_LAP)
    O[f'{pre}-van-giua'] = (VG, {'L': VG, 'R': VG}, 'ván một chiều – giữa, lặp ngang (KHÔNG có viền dọc)', 'code: ghép phần trong 2 đầu ván gen')
    for ten, nguon_t, ben in (('van-trai', 'r0c6', 'L'), ('van-phai', 'r0c7', 'R'), ('van-trai-2', 'r3c6', 'L'), ('van-phai-2', 'r3c7', 'R')):
        v = lay_van(nguon_t)
        t = np.zeros((R, R, 4), np.uint8)
        w = min(R, v.shape[1])
        if ben == 'L':
            t[:, :w] = v[:, :w]
            if w < R: t[:, w:] = VG[:, w:]
            t = khop(t, VG, 'phai')
        else:
            t[:, R - w:] = v[:, v.shape[1] - w:]
            if w < R: t[:, :R - w] = VG[:, :R - w]
            t = khop(t, VG, 'trai')
        O[f'{pre}-{ten}'] = (t, {'R': VG} if ben == 'L' else {'L': VG}, f'ván một chiều – đầu {"trái" if ben == "L" else "phải"}', f'gen {nguon_t}')

    # --- dốc (code)
    doc = {}
    for k, mt in (('thoai-len-1', 'dốc thoải đi lên – nửa thấp (cao 0→16 logic)'),
                  ('thoai-len-2', 'dốc thoải đi lên – nửa cao (16→32)'),
                  ('thoai-xuong-1', 'dốc thoải đi xuống – nửa cao (32→16)'),
                  ('thoai-xuong-2', 'dốc thoải đi xuống – nửa thấp (16→0)'),
                  ('len', 'dốc 45° đi lên sang phải'), ('xuong', 'dốc 45° đi xuống sang phải')):
        t = dung_doc(T0, F0, k)
        s_b = mat_doc(k)
        if s_b[-1] == 0:
            t = khop(t, T0, 'phai')
        if s_b[0] == 0:
            t = khop(t, T0, 'trai')
        doc[k] = (t, mt)
    cap = {'thoai-len-1': ('R', 'thoai-len-2'), 'thoai-len-2': ('L', 'thoai-len-1'),
           'thoai-xuong-1': ('R', 'thoai-xuong-2'), 'thoai-xuong-2': ('L', 'thoai-xuong-1')}
    for k, (t, mt) in doc.items():
        ke = {'B': F0}
        s_b = mat_doc(k)
        if s_b[-1] == 0:
            ke['R'] = T0
        if s_b[0] == 0:
            ke['L'] = T0
        if k in cap:
            ke[cap[k][0]] = doc[cap[k][1]][0]
        O[f'{pre}-doc-{k}'] = (t, ke, mt, 'code: trượt cột ô mặt trên theo mặt dốc + thân + viền')
    return O


def chay():
    meta, items, tat_ca = {}, [], {}
    for anh, pre, go in (('gach-go.png', 'go', True), ('gach-da.png', 'da', False)):
        A = chuan_bi(anh, go)
        O = bo_o(A, pre, go)
        for ten, (t, ke, mt, ng) in O.items():
            o = thu_nho(t, ke)
            tat_ca[ten] = o
            luu_png(o, f'{GACH}/o/{ten}.png')
            items.append((ten, o))
            meta[ten] = {'mo_ta': mt, 'nguon': ng, 'canh_ghep': ''.join(sorted(ke.keys()))}
    at, pos = xep_atlas(items, rong=1024)
    luu_png(at, f'{GACH}/gach-atlas.png')
    for k, v in pos.items():
        meta[k]['khung'] = v
    luu_json({
        'ten': 'Gạch Làng Chuông: gỗ-rễ (go-*) và đá xây (da-*), ô 32 px logic, ảnh 64 px (2x)',
        'anh': 'gach-atlas.png',
        'quy_uoc': {
            'o_logic': T_LOGIC, 'boi_so': 2, 'o_anh': T2,
            'khung': '[x, y, rộng, cao] trong atlas (px ảnh 2x). Mọi ô đúng 64×64, nằm gọn trong ô (không thò ra) → vẽ thẳng theo lưới.',
            'canh_ghep': 'các cạnh đã làm khớp liền với ô kề (L trái, R phải, T trên, B dưới). Cạnh không ghi là cạnh lộ (có viền đen) hoặc mép tự do.',
            'mat_tren': 'mép trên ô = mặt đứng (va chạm), viền đen nằm trong ô.',
            'van': 'ván một chiều: mặt ván = mép trên ô, dày ~11 px logic, phần dưới ô trong suốt.',
            'doc': 'dốc thoải: 2 ô liền (nửa thấp + nửa cao), mỗi ô cao 16 px logic; dốc 45°: 1 ô.',
        },
        'o': meta,
    }, f'{GACH}/gach-atlas.json')
    print('gạch:', len(meta), 'ô · atlas', at.shape[1], '×', at.shape[0])
    return tat_ca


if __name__ == '__main__':
    chay()
