#!/usr/bin/env python3
"""TURRET MERGE — cắt 26 ụ HÌNH MỚI kiểu "tự do sáng tạo" (11/11; ảnh người dùng gen bằng ChatGPT, nền magenta).

Nguồn: docs/demo-hop-tuong/thap-art/raw_anime_u_tudo_t01..t14.png (1536×1024). Mỗi hàng 4 cột: lắp ráp · bệ · ĐẦU · huy hiệu.
  t01–t06: 3 hàng = 3 ụ · t07: 1 hàng (Sanctum) · t08–t14: 3 hàng = dạng 1/2/3 của 1 ụ grow-up.
GIỮ BỆ đang có trong game (<id>_de / <id>_vien — bệ theo bậc đã đồng bộ): tool KHÔNG ghi bệ. Chỉ ghi:
  <id>_nong.png (+ _nong_s1..s3)  ĐẦU: khung cố định 1 ô (PX px / cạnh ô, tâm ảnh = tâm ô), ảnh quay PHẢI như mọi đầu ụ
                                  (đầu "đứng" vẽ với gocDau −π/2 → hiện đúng chiều ảnh gốc — render.js DAU_DUNG), viền màu nhấn nướng sẵn
  <id>_phu.png                    huy hiệu tròn (cột 4), cùng cỡ file cũ (PHU_K giữ nguyên)
  nho/<id>.png                    icon thẻ 192 px = bệ ĐANG CÓ + đầu mới (dạng 1)
  glyph/<id>.png                  bóng trắng nhận diện 128 px
Cỡ đầu (người dùng 11/11): bề ngang đầu ≈ 85–100% bề ngang bệ (bệ = 0,70 ô) theo đúng tỉ lệ đầu/bệ của tấm gốc, không tràn ô
  (cạnh lớn nhất ≤ CAO_MAX ô); ụ 3 dạng: dạng 2/3 lớn dần theo tỉ lệ tấm gốc, chặn ở ô. 'day': phóng lớn nhất trong ô (Resonance Grid mảnh).
  Đầu XOAY theo mục tiêu / quay tròn ('xoay'): bán kính xa nhất ≤ R_MAX ô.
Ghi thap/js/artscale.js: DAU_VE[id] = {K: 1.0[, S: [1, 1, 1]]} (cỡ VẼ = 1 ô — cỡ LUẬT HEAD_K/STAGE_K giữ nguyên), PHU_GIUA bỏ 'set'
  (vòng cuộn cũ không còn), UMOD_TIP của ụ còn xoay (no5) theo mũi hình mới.
Chạy: python3 tools/thap-cat-u-tudo.py [id …]     (KHONG_JS=1 không sửa artscale.js · OUT=thư_mục · KT=thư_mục ảnh kiểm)
"""
import os, sys, json, re, importlib.util
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.environ.get('RAW_ANIME', os.path.join(GOC, 'docs/demo-hop-tuong/thap-art'))
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js/artscale.js')
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)

PX = 300          # điểm ảnh / cạnh ô
BE = 0.70         # bề ngang bệ / cạnh ô (render.js than(): bệ chung 0,714 × 0,98)
RONG = (0.85, 1.0)  # bề ngang đầu / bề ngang bệ (dạng 1 và ụ 1 dạng)
CAO_MAX = 0.95    # cạnh lớn nhất của đầu đứng / cạnh ô (chừa lắc ±3,5°)
R_MAX = 0.485     # đầu xoay: bán kính xa nhất / cạnh ô (= thap-cat-umod.py)
VIEN = 0.016      # viền màu nhấn / cạnh ô

# tấm → các hàng (id; tấm 3 dạng: 1 id cho cả 3 hàng)
TAM = {
    't01': ['nhanban', 'xaotron', 'thaukinh'], 't02': ['docton', 'tuthan', 'nangsao'], 't03': ['epxung', 'no5', 'nhieusong'],
    't04': ['santhuong', 'sungluc', 'tia'], 't05': ['set', 'railgun', 'sinhdoi'], 't06': ['saochep', 'loren', 'nguyenrua'], 't07': ['thanhdia'],
}
DANG = {'t08': 'lienket', 't09': 'dongbo', 't10': 'orbital', 't11': 'luoicheo', 't12': 'guongcong', 't13': 'overlord', 't14': 'lophanung'}
# màu nhấn (viền ôm hình bóng) theo tông hình mới
MAU = {
    'nhanban': '#5fe07a', 'xaotron': '#ffd24a', 'thaukinh': '#2fd38a', 'docton': '#c8283c', 'tuthan': '#7a3cff', 'nangsao': '#ffe04a',
    'epxung': '#c04cff', 'no5': '#b06bff', 'nhieusong': '#c77dff', 'santhuong': '#ff9a1a', 'sungluc': '#ff5a4a', 'tia': '#9be22d',
    'set': '#5fd8ff', 'railgun': '#ff8a2a', 'sinhdoi': '#ff7a4a', 'saochep': '#6ad0ff', 'loren': '#ff8a2a', 'nguyenrua': '#ff4b5e',
    'thanhdia': '#7fd8ff', 'lienket': '#c77dff', 'dongbo': '#3fe0e0', 'orbital': '#4f8bff', 'luoicheo': '#45e0c8', 'guongcong': '#7fe8ff',
    'overlord': '#ff4a3a', 'lophanung': '#9fe6ff',
}
XOAY = {'no5', 'sinhdoi'}      # đầu còn xoay (Fifth Shot chĩa viên vàng vào mục tiêu · Twin Maker đôi cá quay chậm) → vừa vòng tròn
DAY = {'luoicheo'}             # phóng lớn nhất trong ô
GLYPH = True
# NỀN MAGENTA LẪN VÀO HÌNH (quầng/khói/vòng trong mờ vẽ đè lên nền hồng → ra tím-hồng): tách trộn theo màu quầng thật F trong dải hue [h0, h1]
#   id: (F rgb 0..1, h0, h1) — điểm ảnh = a·F + (1 − a)·magenta → alpha × a, màu về F. Chỉ đụng điểm trong dải hue (màu thật của hình giữ nguyên).
TACH_HONG = {
    'overlord': ((1.0, 0.25, 0.3), 288, 342),     # dạng 2: quầng đỏ giữa 2 sừng (tia sét trắng giữ)
    'luoicheo': ((0.25, 0.95, 1.0), 222, 338),    # dạng 2: vòng sóng cyan trong mờ ở 4 mũi
    'lophanung': ((0.75, 0.9, 1.0), 250, 338),    # dạng 2 khói lạnh · dạng 3 lưới lục giác
    'orbital': ((0.3, 0.95, 1.0), 270, 338),      # dạng 2: vòng quỹ đạo
}
# Sanctum: vệt tím-hồng trong hào quang (sát màu nền) — KHÔNG làm trong suốt (thủng vòng hào quang) mà đổi hue về xanh lam của hào quang, giữ đặc
DOI_HUE = {'thanhdia': (262, 338, 226)}


def hsv(f):
    mx, mn = f.max(-1), f.min(-1); d = mx - mn; r, g, b = f[..., 0], f[..., 1], f[..., 2]
    h = np.where(mx == r, ((g - b) / np.maximum(d, 1e-6)) % 6, np.where(mx == g, (b - r) / np.maximum(d, 1e-6) + 2, (r - g) / np.maximum(d, 1e-6) + 4)) * 60
    return np.where(d > 1e-6, h, 0), np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx


def khu_hong(c, i):
    if i in TACH_HONG:
        F, h0, h1 = TACH_HONG[i]; F = np.array(F); Mg = np.array([1.0, 0.0, 1.0])
        h, s, v = hsv(c[..., :3]); m = (c[..., 3] > 0) & (h >= h0) & (h <= h1) & (s > 0.3) & (v > 0.35)
        a = np.clip(((c[..., :3] - Mg) * (F - Mg)).sum(-1) / ((F - Mg) ** 2).sum(), 0, 1)
        a = np.where(a < 0.12, 0, a)
        c = c.copy(); c[..., 3] = np.where(m, c[..., 3] * a, c[..., 3]); c[..., :3] = np.where(m[..., None], F, c[..., :3]); c[c[..., 3] == 0] = 0
    if i in DOI_HUE:
        import colorsys
        h0, h1, hm = DOI_HUE[i]; h, s, v = hsv(c[..., :3]); m = (c[..., 3] > 0) & (h >= h0) & (h <= h1) & (s > 0.25)
        w = np.clip((h - h0) / 12, 0, 1)                      # mép dải mềm
        ys, xs = np.nonzero(m); c = c.copy()
        for y, x in zip(ys, xs):
            hh = (h[y, x] + (hm - h[y, x]) * w[y, x]) / 360; c[y, x, :3] = colorsys.hsv_to_rgb(hh, min(1.0, s[y, x]), v[y, x])
    return c


def hex_rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def tach_tam(a, nh):
    """cả tấm → {(hàng, cột): RGBA float} — mảng theo trọng tâm; mảng nhỏ (tia, khói, sóng) đi theo khối lớn gần nhất."""
    m, _ = U.tach(a)
    c = U.khoa(a.astype(np.float64) / 255, m)
    lab, n = nd.label(c[..., 3] > 0, structure=np.ones((3, 3)))
    H, W = a.shape[:2]; ch, cw = H / nh, W / 4
    cm = nd.center_of_mass(lab > 0, lab, range(1, n + 1)); sz = nd.sum(lab > 0, lab, range(1, n + 1))
    lon = [k for k in range(1, n + 1) if sz[k - 1] >= 0.05 * sz.max()]
    _, (iy, ix) = nd.distance_transform_edt(~np.isin(lab, lon), return_indices=True)
    o = {}
    for k, (y, x) in enumerate(cm, 1):
        if k not in lon:
            ys, xs = np.nonzero(lab == k); j = len(ys) // 2; kk = lab[iy[ys[j], xs[j]], ix[ys[j], xs[j]]]; y, x = cm[kk - 1]
        o.setdefault((min(nh - 1, int(y // ch)), min(3, int(x // cw))), []).append(k)
    ra = {}
    for key, ks in o.items():
        q = c.copy(); q[~np.isin(lab, ks)] = 0; ra[key] = q
    return ra


def loren_toc(c):
    """Twin Anvil dạng TỐC (lorentoc_nong — skills4.js dauAnh): cùng hình mới, lật gương (búa băng ra trước) + quầng nung trên đe đổi cam → xanh băng
    (xử lý màu trên ảnh có sẵn, không vẽ mới) → phân biệt đe Sát thương (lửa) / đe Tốc (băng) như trước."""
    import colorsys
    c = c[:, ::-1].copy(); x0, y0, x1, y1 = khung(c); h, s, v = hsv(c[..., :3])
    yy = np.arange(c.shape[0])[:, None] * np.ones((1, c.shape[1]))
    m = (c[..., 3] > 0) & (h >= 6) & (h <= 38) & (s > 0.45) & (v > 0.45) & (yy > y0 + 0.44 * (y1 - y0)) & (yy < y0 + 0.69 * (y1 - y0))
    for y, x in zip(*np.nonzero(m)): c[y, x, :3] = colorsys.hsv_to_rgb(0.53, min(1.0, s[y, x] * 0.8), v[y, x])
    return c


def khung(c):
    ys, xs = np.nonzero(c[..., 3] > 0.02); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def dau(c, s, mau, xoay):
    """c: RGBA float đầu chĩa LÊN, s = px đích / px gốc → ảnh PX×PX quay PHẢI, tâm = tâm khung bao, viền màu nhấn dưới hình."""
    c = np.rot90(c, -1).copy()
    x0, y0, x1, y1 = khung(c); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    im = U.anh(c)
    im = im.convert('RGBa').resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS).convert('RGBA')
    out = Image.new('RGBA', (PX, PX)); out.alpha_composite(im, (int(round(PX / 2 - cx * s)), int(round(PX / 2 - cy * s))))
    pv = VIEN * PX; k = 2 * int(round(pv / 2)) + 1
    g = out.split()[3].filter(ImageFilter.MaxFilter(k)).filter(ImageFilter.GaussianBlur(max(1, pv / 3)))
    ga = np.clip(np.asarray(g).astype(np.float64) / 255 * 1.6, 0, 1) * 0.95
    v = np.zeros((PX, PX, 4), np.uint8); v[..., :3] = hex_rgb(mau); v[..., 3] = (ga * 255).astype(np.uint8)
    nen = Image.fromarray(v, 'RGBA'); nen.alpha_composite(out)
    return nen


def ti_le(c, wb, i, n, s1=None):
    """px đích / px gốc của đầu c (dạng n = 0..2; s1 = tỉ lệ dạng 1). wb = bề ngang bệ cột 2 (px gốc) = BE ô."""
    x0, y0, x1, y1 = khung(c); w, h = x1 - x0, y1 - y0
    o = wb / BE                                   # px gốc / cạnh ô
    pv = 1.4 * VIEN                               # viền nướng thêm mỗi phía (ô)
    if i in XOAY:
        ys, xs = np.nonzero(c[..., 3] > 0.02); r = np.sqrt((xs + 0.5 - (x0 + x1) / 2) ** 2 + (ys + 0.5 - (y0 + y1) / 2) ** 2).max()
        return min(1.0 / o * min(1.0, RONG[1] * wb / w), (R_MAX - pv) / r) * PX
    tran = (CAO_MAX - 2 * pv) / max(w, h)         # chặn ô (ô / px gốc)
    if i in DAY: return tran * (0.93, 0.96, 1.0)[n] * PX
    if n == 0 or s1 is None:
        k = min(max(w / wb, RONG[0]), RONG[1]) * wb / w / o   # bề ngang đầu = 85–100% bệ
    else:
        k = s1 / PX                               # dạng 2/3: giữ tỉ lệ px của dạng 1 → lớn dần như tấm gốc
    return min(k, tran) * PX


def glyph(c, i):
    lum = 0.3 * c[..., 0] + 0.59 * c[..., 1] + 0.11 * c[..., 2]
    toi = nd.binary_dilation(lum < 0.09, iterations=1) & nd.binary_erosion(c[..., 3] > 0.5, iterations=8)
    g = np.zeros(c.shape); g[..., :3] = 1; g[..., 3] = c[..., 3] * ~toi
    x0, y0, x1, y1 = U.bbox(c[..., 3] > 0); h = max(x1 - x0, y1 - y0) / 2 / 0.9
    U.anh(U.thu(U.dat_giua(g, (x0 + x1) / 2, (y0 + y1) / 2, h), 128)).save(os.path.join(OUT, 'glyph', i + '.png'), optimize=True)


def phu(c, i):
    p = os.path.join(OUT, i + '_phu.png'); N = Image.open(p).size[0] if os.path.exists(p) else 190
    x0, y0, x1, y1 = U.bbox(c[..., 3] > 0); h = max(x1 - x0, y1 - y0) / 2 + 3
    U.anh(U.thu(U.dat_giua(c, (x0 + x1) / 2, (y0 + y1) / 2, h), N)).save(p, optimize=True)


def icon(i, im_dau, DE):
    """nho/<id>.png: bệ ĐANG CÓ + đầu mới dựng đứng (đầu chĩa lên), 192 px, phần hình chiếm 88%."""
    N = 384; ic = Image.new('RGBA', (N, N)); o = N / 1.2          # px / cạnh ô
    de = Image.open(os.path.join(OUT, i + '_de.png')).convert('RGBA'); b = int(round(o * U.SB_C0 * DE.get(i, 1.0)))
    ic.alpha_composite(de.convert('RGBa').resize((b, b), Image.LANCZOS).convert('RGBA'), ((N - b) // 2, (N - b) // 2))
    d = int(round(o)); hd = im_dau.convert('RGBa').resize((d, d), Image.LANCZOS).convert('RGBA').rotate(90, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - d) // 2, (N - d) // 2))
    cr = ic.crop(ic.getbbox()); s2 = 0.88 * 192 / max(cr.size)
    cr = cr.convert('RGBa').resize((max(1, round(cr.width * s2)), max(1, round(cr.height * s2))), Image.LANCZOS).convert('RGBA')
    ic = Image.new('RGBA', (192, 192)); ic.alpha_composite(cr, ((192 - cr.width) // 2, (192 - cr.height) // 2))
    ic.save(os.path.join(OUT, 'nho', i + '.png'), optimize=True)


def mui(im):
    """mũi (đầu quay PHẢI): điểm đặc xa nhất bên phải trong dải giữa ±8%, theo nửa cạnh ảnh"""
    a = np.asarray(im)[..., 3] > 128; h, w = a.shape; xs = np.nonzero(a[int(h * .42):int(h * .58)].any(0))[0]
    return round(float((xs.max() + 1 - w / 2) / (w / 2)), 3)


def main():
    chon = set(sys.argv[1:])
    t = open(JS, encoding='utf-8').read()
    DV, DE, HK, TIP, PG = U.js_obj(t, 'DAU_VE'), U.js_obj(t, 'DE_RIENG'), U.js_obj(t, 'HEAD_K'), U.js_obj(t, 'UMOD_TIP'), U.js_obj(t, 'PHU_GIUA')
    kt = os.environ.get('KT')
    for tam in sorted(list(TAM) + list(DANG)):
        ids = TAM.get(tam) or [DANG[tam]] * 3
        if chon and not (chon & set(ids)): continue
        T = tach_tam(np.asarray(Image.open(os.path.join(RAW, 'raw_anime_u_tudo_%s.png' % tam)).convert('RGB')), len(ids))
        s1 = None
        for r, i in enumerate(ids):
            if chon and i not in chon: continue
            c, be = khu_hong(T[(r, 2)], i), T[(r, 1)]; bx0, _, bx1, _ = khung(be)
            n = r if tam in DANG else 0
            s = ti_le(c, bx1 - bx0, i, n, s1)
            if tam in DANG and n == 0: s1 = s
            im = dau(c, s, MAU[i], i in XOAY)
            bb = im.getbbox(); print(tam, i, 'dạng %d' % (n + 1) if tam in DANG else '', 'tỉ lệ', round(s, 3), 'khung', bb, 'ngang/bệ', round((bb[3] - bb[1]) / PX / BE, 2), 'cao/ô', round((bb[2] - bb[0]) / PX, 2))
            if tam in DANG: im.save(os.path.join(OUT, '%s_nong_s%d.png' % (i, n + 1)), optimize=True)
            if n == 0:
                im.save(os.path.join(OUT, i + '_nong.png'), optimize=True)
                icon(i, im, DE); phu(T[(r, 3)], i)
                if GLYPH: glyph(c, i)
                if i == 'loren': dau(loren_toc(c), s, '#6ad0ff', False).save(os.path.join(OUT, 'lorentoc_nong.png'), optimize=True); HK['lorentoc'] = 1.0
                DV[i] = {'K': 1.0, 'S': [1.0, 1.0, 1.0]} if tam in DANG else {'K': 1.0}
                if i in XOAY and i in TIP: TIP[i] = round(min(1.0, mui(im) / HK[i]), 3)   # mũi luật = coDau/2 × tip, coDau = ô × HEAD_K
            if kt:
                os.makedirs(kt, exist_ok=True); nen = Image.new('RGBA', (PX * 2, PX), (20, 24, 48, 255)); nen.paste((40, 230, 60, 255), (PX, 0, PX * 2, PX))
                up = im.rotate(90); nen.alpha_composite(up, (0, 0)); nen.alpha_composite(up, (PX, 0)); nen.convert('RGB').save(os.path.join(kt, '%s_%d.png' % (i, n + 1)))
    if os.environ.get('KHONG_JS'): return
    PG.pop('set', None)
    t = U.js_set(t, 'HEAD_K', HK); t = U.js_set(t, 'DAU_VE', DV); t = U.js_set(t, 'UMOD_TIP', TIP); t = U.js_set(t, 'PHU_GIUA', PG)
    open(JS, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
