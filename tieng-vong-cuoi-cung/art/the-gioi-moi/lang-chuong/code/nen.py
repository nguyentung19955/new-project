"""Bước 1 – nền parallax Làng Chuông (trong lòng thân cây) từ 3 ảnh gen nguon-v2/lang-lop-*.png.

Xuất 2x cho khung logic 960×540 (ảnh cao 1080). Mỗi lớp:
  • đổi cỡ nguồn 1672×941 → cao 1080 (×1,1483);
  • lớp trong suốt: dọn alpha (bỏ quầng mờ alpha < 16, bỏ hạt lẻ, làm gọn mép, lấy màu mép từ điểm đặc gần nhất);
  • làm tối + giảm bão hoà + giảm tương phản + bớt chi tiết nhỏ (để Lam/quái nổi);
  • làm lặp ngang liền bằng đường cắt nhỏ nhất (mép phải nối thẳng vào mép trái).
Lớp xa còn được tách thêm thành 2 lớp phụ (hốc sâu 0,08 + vách gỗ 0,20) – tuỳ chọn.
Lớp tiền cảnh (1,05) dựng từ góc trên của lớp gần, tô gần như đen."""
import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung import NEN, NGUON, lap_ngang, luu_json, luu_png, u8

H2 = 1080           # cao ảnh xuất (2x của 540)


# ------------------------------------------------------------------ màu
def chinh_mau(rgb, sang=1.0, bao_hoa=1.0, tuong_phan=1.0, tam=None, nhuom=None, nhuom_k=0.0):
    """rgb float 0..255. Giảm bão hoà quanh độ sáng điểm, nhân độ sáng, ép tương phản về `tam`, nhuộm nhẹ."""
    L = (rgb * [0.299, 0.587, 0.114]).sum(-1, keepdims=True)
    out = L + (rgb - L) * bao_hoa
    if tam is None:
        tam = float(L.mean())
    out = tam + (out - tam) * tuong_phan
    out = out * sang
    if nhuom is not None:
        out = out * (1 - nhuom_k) + np.array(nhuom, float) * sang * nhuom_k
    return np.clip(out, 0, 255)


def bot_chi_tiet(rgb, r=2, sigma=0.8):
    """Bớt nét/mảng li ti: lọc trung vị từng kênh rồi làm mềm nhẹ. Giữ hình khối lớn."""
    o = np.dstack([nd.median_filter(rgb[..., i], size=2 * r + 1) for i in range(3)])
    return np.dstack([nd.gaussian_filter(o[..., i], sigma) for i in range(3)])


def doi_co_rgb(a, w, h):
    return np.asarray(Image.fromarray(u8(a)).resize((w, h), Image.LANCZOS)).astype(np.float64)


# ------------------------------------------------------------------ alpha
def don_alpha(rgba, nguong=16, hat=80):
    """rgba uint8. Bỏ quầng (alpha < nguong), bỏ cụm nhỏ < hat điểm, kéo alpha mép cho gọn,
    màu điểm mép = màu điểm đặc gần nhất (khử màu nền lẫn vào)."""
    a = rgba.astype(np.float64)
    al = a[..., 3]
    m = al >= nguong
    lab, n = nd.label(m)
    if n:
        sz = nd.sum(m, lab, range(1, n + 1))
        bo = np.isin(lab, np.nonzero(sz < hat)[0] + 1)
        m &= ~bo
    # lấp lỗ li ti bên trong (≤ 6 điểm)
    lo = ~m
    lab, n = nd.label(lo)
    if n:
        sz = nd.sum(lo, lab, range(1, n + 1))
        m |= np.isin(lab, np.nonzero(sz <= 6)[0] + 1)
    # alpha mới: dốc từ 40 → 200 thành 0 → 1 (mép gọn, vẫn khử răng cưa 1–2 điểm)
    t = np.clip((al - 40) / 160.0, 0, 1)
    t = t * t * (3 - 2 * t)
    t[~m] = 0
    t[m & (al >= 200)] = 1
    dac = t >= 0.999
    _, (iy, ix) = nd.distance_transform_edt(~dac, return_indices=True)
    rgb = a[..., :3][iy, ix]
    out = np.dstack([rgb, t * 255])
    out[t == 0] = 0
    return out


def doi_co_rgba(a, w, h):
    """a float RGBA (alpha thẳng) → đổi cỡ theo premultiplied."""
    al = a[..., 3:4] / 255.0
    pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    ch = [np.asarray(Image.fromarray(pm[..., i].astype(np.float32), 'F').resize((w, h), Image.LANCZOS)) for i in range(4)]
    o = np.dstack(ch)
    al2 = np.clip(o[..., 3], 0, 255) / 255.0
    rgb = np.where(al2[..., None] > 1e-4, o[..., :3] / np.maximum(al2[..., None], 1e-4), 0)
    out = np.dstack([np.clip(rgb, 0, 255), al2 * 255])
    out[out[..., 3] < 1] = 0
    return out


def lap(img, b):
    """Lặp ngang liền (rộng giảm b). Kiểm: nối mép phải → mép trái chênh bao nhiêu (so với chênh 2 cột kề bên trong)."""
    rgb = img.shape[2] == 3
    if rgb:
        img = np.dstack([img, np.full(img.shape[:2], 255, np.uint8)])
    o = lap_ngang(img, b)
    if rgb:
        o = np.ascontiguousarray(o[..., :3])
    p = o.astype(np.float64)
    noi = np.abs(p[:, -1] - p[:, 0]).mean()
    trong = np.abs(np.diff(p, axis=1)).mean()
    return o, round(float(noi / max(trong, 1e-6)), 2)


# ------------------------------------------------------------------ các lớp
def lop_xa():
    src = np.asarray(Image.open(f'{NGUON}/lang-lop-xa.png').convert('RGB')).astype(np.float64)
    h, w = src.shape[:2]
    W = round(w * H2 / h)
    a = doi_co_rgb(src, W, H2)
    a = bot_chi_tiet(a, r=3, sigma=1.2)
    # nét đen của nền xa: nhấc lên gần màu mảng (hạn chế nét đen)
    L = a.mean(-1, keepdims=True)
    toi = np.clip((60 - L) / 60, 0, 1)
    a = a * (1 - 0.45 * toi) + nd.gaussian_filter(a, (6, 6, 0)) * 0.45 * toi
    g = chinh_mau(a, sang=0.60, bao_hoa=0.62, tuong_phan=0.72, tam=70, nhuom=(40, 52, 60), nhuom_k=0.12)
    # tách hốc sâu (xanh lam) ↔ vách gỗ (nâu): theo màu
    s0 = doi_co_rgb(src, W, H2)
    hoc = (s0[..., 2] > s0[..., 0] + 6)
    hoc = nd.binary_opening(hoc, iterations=2)
    hoc = nd.binary_closing(hoc, iterations=2)
    lab, n = nd.label(hoc)
    if n:
        sz = nd.sum(hoc, lab, range(1, n + 1))
        hoc = np.isin(lab, np.nonzero(sz > 1500)[0] + 1)
    mem = nd.gaussian_filter(hoc.astype(float), 1.2)
    # lớp hốc (đục): giữ màu hốc, chỗ vách lấp bằng màu hốc mờ rộng (normalized convolution) rồi tối thêm
    wgt = hoc.astype(float)
    num = np.dstack([nd.gaussian_filter(g[..., i] * wgt, 60) for i in range(3)])
    den = nd.gaussian_filter(wgt, 60)[..., None]
    lap_mau = num / np.maximum(den, 1e-4)
    lap_mau = np.where(den > 1e-3, lap_mau, g.reshape(-1, 3)[hoc.ravel()].mean(0) if hoc.any() else g.mean((0, 1)))
    lap_mau = chinh_mau(lap_mau, sang=0.8)
    hoc_lop = g * mem[..., None] + lap_mau * (1 - mem[..., None])
    vach = np.dstack([g, (1 - mem) * 255])
    vach[vach[..., 3] < 1] = 0
    return g, hoc_lop, vach


def lop_giua():
    src = np.asarray(Image.open(f'{NGUON}/lang-lop-giua.png').convert('RGBA'))
    c = don_alpha(src)
    h, w = c.shape[:2]
    W = round(w * H2 / h)
    c = doi_co_rgba(c, W, H2)
    rgb = bot_chi_tiet(c[..., :3], r=1, sigma=0.6)
    # nét đen mảnh/dịu hơn gameplay: nhấc nét tối về nâu sẫm
    L = rgb.mean(-1, keepdims=True)
    toi = np.clip((55 - L) / 55, 0, 1)
    rgb = rgb * (1 - 0.5 * toi) + np.array([58, 44, 38.0]) * 0.5 * toi
    # đèn lồng/cửa sổ vàng: giữ sáng hơn phần còn lại (điểm nhấn cục bộ)
    den = ((rgb[..., 0] > 170) & (rgb[..., 1] > 120) & (rgb[..., 2] < 140)).astype(float)
    den = nd.gaussian_filter(den, 1.0)[..., None]
    thuong = chinh_mau(rgb, sang=0.70, bao_hoa=0.68, tuong_phan=0.80, tam=80, nhuom=(40, 50, 62), nhuom_k=0.10)
    sang = chinh_mau(rgb, sang=0.85, bao_hoa=0.85, tuong_phan=0.9, tam=80)
    rgb = thuong * (1 - den) + sang * den
    return np.dstack([rgb, c[..., 3]])


def lop_gan():
    src = np.asarray(Image.open(f'{NGUON}/lang-lop-gan.png').convert('RGBA'))
    c = don_alpha(src)
    h, w = c.shape[:2]
    W = round(w * H2 / h)
    c = doi_co_rgba(c, W, H2)
    rgb = bot_chi_tiet(c[..., :3], r=1, sigma=0.7)
    rgb = chinh_mau(rgb, sang=0.55, bao_hoa=0.70, tuong_phan=0.85, tam=60, nhuom=(30, 36, 40), nhuom_k=0.15)
    return np.dstack([rgb, c[..., 3]])


def tien_canh(gan_goc):
    """Tiền cảnh 1,05: lấy cụm rễ treo góc trên-trái của lớp gần (chỉ 40 % trên của màn, rộng ~¼ màn), tô gần đen.
    Ảnh rộng 2 màn (3840) chỉ có 1 cụm ở mép trái + 1 cụm lật ở giữa-phải → đi qua màn thưa, không che đường đi."""
    h, w = gan_goc.shape[:2]
    cum = gan_goc[: int(h * 0.42), : int(w * 0.24)].copy()
    # mờ dần phía dưới (không bao giờ chạm vùng sàn/nhân vật): từ 30 % → 0 ở 40 % chiều cao màn
    yy = np.arange(cum.shape[0])[:, None]
    fade = np.clip((0.40 * H2 - yy) / (0.10 * H2), 0, 1)
    # mờ dần 2 bên (không lộ mép cắt thẳng): trái 18 %, phải 35 % bề rộng cụm, có gợn theo chiều dọc
    cw = cum.shape[1]
    xx = np.arange(cw)[None, :]
    gon = 0.06 * cw * np.sin(yy / 37.0) + 0.04 * cw * np.sin(yy / 13.0 + 1.0)
    fx = np.clip(np.minimum((xx + gon) / (0.18 * cw), (cw - xx + gon) / (0.35 * cw)), 0, 1)
    cum[..., 3] *= fade * fx * 0.92
    mau = chinh_mau(cum[..., :3], sang=0.50, bao_hoa=0.55, tuong_phan=0.75, tam=45, nhuom=(16, 18, 20), nhuom_k=0.25)
    cum = np.dstack([mau, cum[..., 3]])
    cum[cum[..., 3] < 1] = 0
    out = np.zeros((H2, 3840, 4))
    out[:cum.shape[0], :cum.shape[1]] = cum
    lat = cum[:, ::-1]
    x = 3840 - 1400 - lat.shape[1]
    vung = out[:lat.shape[0], x:x + lat.shape[1]]
    a = lat[..., 3:4] / 255
    vung[..., :3] = lat[..., :3] * a + vung[..., :3] * (1 - a)
    vung[..., 3] = np.maximum(vung[..., 3], lat[..., 3])
    return out


def chay():
    xa, hoc, vach = lop_xa()
    giua = lop_giua()
    gan = lop_gan()
    ket = {}
    xa_l, k1 = lap(u8(xa), 300)
    hoc_l, k2 = lap(u8(hoc), 300)
    vach_l, k3 = lap(u8(vach), 300)
    giua_l, k4 = lap(u8(giua), 360)
    gan_l, k5 = lap(u8(gan), 300)
    tc = u8(tien_canh(gan))
    luu_png(xa_l, f'{NEN}/lang-xa.png')
    luu_png(hoc_l, f'{NEN}/lang-xa-hoc.png')
    luu_png(vach_l, f'{NEN}/lang-xa-vach.png')
    luu_png(giua_l, f'{NEN}/lang-giua.png')
    luu_png(gan_l, f'{NEN}/lang-gan.png')
    luu_png(tc, f'{NEN}/lang-tien-canh.png')
    for ten, im, k, he, mo in [
        ('lang-xa.png', xa_l, k1, 0.08, 'Lớp xa (đục). Dùng MỘT trong hai cách: ảnh này ở 0,08, HOẶC cặp xa-hoc + xa-vach.'),
        ('lang-xa-hoc.png', hoc_l, k2, 0.08, 'Tuỳ chọn: hốc sâu xanh lam (đục), chỗ vách đã lấp màu hốc tối.'),
        ('lang-xa-vach.png', vach_l, k3, 0.20, 'Tuỳ chọn: vách gỗ cong + tia sáng (trong suốt chỗ hốc), vẽ đè lên xa-hoc.'),
        ('lang-giua.png', giua_l, k4, 0.40, 'Nhà, cầu, giá chuông (trong suốt).'),
        ('lang-gan.png', gan_l, k5, 0.65, 'Khung rễ sau gameplay (trong suốt), tối hơn lớp giữa.'),
        ('lang-tien-canh.png', tc, None, 1.05, 'Tiền cảnh: rễ treo gần đen, chỉ nửa trên màn; vẽ SAU nhân vật.'),
    ]:
        ket[ten] = {'co_anh': [int(im.shape[1]), int(im.shape[0])], 'co_logic': [im.shape[1] / 2, im.shape[0] / 2],
                    'he_so_cuon': he, 'lap_ngang': True, 'mo_ta': mo,
                    'kiem_noi_mep': k}
    luu_json({
        'ten': 'Nền parallax Làng Chuông (trong lòng Cây Chuông Vĩnh Hằng)',
        'quy_uoc': {
            'boi_so': 2, 'khung_logic': [960, 540],
            've': 'vẽ ở ½ cỡ ảnh; y = 0 trùng mép trên màn. Lặp ngang: x0 = -((cam_x * he_so) mod rong_logic), vẽ các bản ở x0, x0 + rong, x0 + 2·rong… tới khi phủ hết 960 (lớp rộng < 960 logic cần 2–3 bản).',
            'thu_tu': 'xa (hoặc xa-hoc → xa-vach) → giua → gan → [gạch, đồ vật, Lam, quái] → tien-canh',
            'kiem_noi_mep': 'chênh màu ở chỗ nối mép phải→trái chia cho chênh trung bình 2 cột kề bên trong ảnh (≈1 là không thấy nối)',
        },
        'lop': ket,
    }, f'{NEN}/nen.json')
    print('nền:', {k: v['co_anh'] for k, v in ket.items()})
    return ket


if __name__ == '__main__':
    chay()
