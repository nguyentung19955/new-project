#!/usr/bin/env python3
"""TURRET MERGE — cắt ảnh THẬT (ChatGPT 09/11) cho Thác Mana (thacmana) + Cổng Ấp Nở (congap), thay ảnh tạm.
Nguồn (docs/demo-hop-tuong/thap-art/, nền #FF00FF):
  raw_thacmana_master.png  ụ lắp đủ (đầu hướng PHẢI) · raw_thacmana_parts.png lưới 3 cột × 2 hàng:
      1 BASE · 2 HEAD (hướng phải) · 3 RING · 4 CORE · 5 GLOW · 6 OUTLINE (4–6 chưa dùng — để cho tầng mana / Mana Flood)
  raw_congap_parts.png     lưới 3 × 2 (512²/ô): 1 master · 2 BASE · 3 HEAD (trứng hướng LÊN) · 4 RING · 5 CORE · 6 GLOW
      (raw_congap_master.png vẽ KHÁC lưới — vành khác, không tách lớp được → không dùng cho bàn; lưới tự khớp ô 1 = ô 2 + ô 3)
  raw_<id>_pilot.png       chân dung vuông nền magenta.
Cách làm: dựng tấm 2×2 kiểu tools/thap-cat-umod.py (ô 1 lắp sẵn · ô 2 bệ · ô 3 đầu nòng LÊN · ô 4 phần phụ) rồi gọi
  đúng hàm mot() của thap-cat-umod.py (tách nền loang, viền alpha mềm 1 px, so khớp tỉ lệ đầu/bệ theo ô 1, thu Lanczos
  nhân-trước-alpha, <id>_vien.png, nho/<id>.png) — thacmana: ô 1 = master (thu cho bệ bằng bệ của lưới).
  glyph/<id>.png 128²: hình bóng TRẮNG của icon (vùng tối = trong suốt, như glyph/canon).
  Chân dung: khoá magenta → nền = bản mờ-tối của chính ảnh (tạm, ảnh gốc không có nền) → pilot 427² + pn 256² + hero 1170×1020;
  mốc mặt ghi PO_NEO/HERO_NEO (chandung.js) + FACE_BOX (khung.js) theo công thức thap-cat-chandung.py.
Chạy (gốc repo): python3 tools/thap-cat-thacmana-congap.py   (KHONG_JS=1: không sửa js)
"""
import os, sys, json, re, importlib.util
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
A = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js')
TMP = os.environ.get('TMPDIR', '/tmp')
os.environ.setdefault('KHONG_JS', '1')
sp = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools/thap-cat-umod.py'))
U = importlib.util.module_from_spec(sp); sp.loader.exec_module(U)
U.OUT = A
MAG = (255, 0, 255)


def fg_bbox(im):
    a = np.asarray(im.convert('RGB')).astype(int)
    d = np.sqrt((a[..., 0] - 255) ** 2 + a[..., 1] ** 2 + (a[..., 2] - 255) ** 2)
    ys, xs = np.nonzero(d > 120)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def o_vuong(im, N):
    """đặt vật (khung bao) vào giữa ô vuông N×N nền magenta"""
    x0, y0, x1, y1 = fg_bbox(im); m = 6
    cr = im.crop((max(0, x0 - m), max(0, y0 - m), min(im.width, x1 + m), min(im.height, y1 + m)))
    o = Image.new('RGB', (N, N), MAG); o.paste(cr, ((N - cr.width) // 2, (N - cr.height) // 2)); return o


def luoi(im, cot, hang):
    w, h = im.width // cot, im.height // hang
    return [im.crop((c * w, r * h, (c + 1) * w, (r + 1) * h)) for r in range(hang) for c in range(cot)]


def tam_2x2(o1, o2, o3, o4, N):
    t = Image.new('RGB', (2 * N, 2 * N), MAG)
    for k, o in enumerate((o1, o2, o3, o4)): t.paste(o, ((k % 2) * N, (k // 2) * N))
    return t


class _NpKhongXoay:
    def __getattr__(self, k): return getattr(np, k)
    @staticmethod
    def rot90(a, k=1): return a


_NP_KHONG_XOAY = _NpKhongXoay()


def dung_tam():
    out = {}
    # --- thacmana
    P = luoi(Image.open(os.path.join(RAW, 'raw_thacmana_parts.png')).convert('RGB'), 3, 2)
    N = 640
    be = o_vuong(P[0], N)
    dau = o_vuong(P[1], N)          # giữ hướng PHẢI như master ô 1 (main() bỏ bước xoay đầu của umod cho id này)
    vong = o_vuong(P[2], N)
    M = Image.open(os.path.join(RAW, 'raw_thacmana_master.png')).convert('RGB')
    bx0, _, bx1, _ = fg_bbox(P[0]); mx0, _, mx1, _ = fg_bbox(M)
    k = (bx1 - bx0) / (mx1 - mx0)
    M2 = M.resize((round(M.width * k), round(M.height * k)), Image.LANCZOS)
    out['thacmana'] = tam_2x2(o_vuong(M2, N), be, dau, vong, N)
    # --- congap: lưới tự nhất quán
    C = luoi(Image.open(os.path.join(RAW, 'raw_congap_parts.png')).convert('RGB'), 3, 2)
    out['congap'] = tam_2x2(*(o_vuong(C[i], 512) for i in range(4)), 512)
    return out


def nho_master(i):
    """icon thẻ nho/<id>.png 192² = chính ảnh master đã duyệt (đầu hướng phải, có vòng rune) — bản dựng từ lớp của umod
    thiếu vòng (PHU_GIUA của umod chưa có id) và trông kém master"""
    a8 = np.asarray(Image.open(os.path.join(RAW, 'raw_%s_master.png' % i)).convert('RGB'))
    m, _ = U.tach(a8); c = U.khoa(a8.astype(np.float64) / 255, m)
    x0, y0, x1, y1 = U.bbox(c[..., 3] > 0); h = max(x1 - x0, y1 - y0) / 2 / 0.88
    sq = U.dat_giua(c, (x0 + x1) / 2, (y0 + y1) / 2, h)
    U.anh(U.thu(sq, 192)).save(os.path.join(A, 'nho', i + '.png'), optimize=True)


def glyph(i):
    """glyph/<id>.png 128²: bóng TRẮNG 1 màu của ĐẦU (ô HEAD của lưới, chĩa LÊN), nét viền tối → khe trong suốt (như glyph/canon)"""
    P = luoi(Image.open(os.path.join(RAW, 'raw_%s_parts.png' % i)).convert('RGB'), 3, 2)
    o = P[1] if i == 'thacmana' else P[2]
    if i == 'thacmana': o = o.rotate(90, expand=True)
    a8 = np.asarray(o); m, _ = U.tach(a8); c = U.khoa(a8.astype(np.float64) / 255, m)
    lum = 0.3 * c[..., 0] + 0.59 * c[..., 1] + 0.11 * c[..., 2]
    toi = nd.binary_dilation(lum < 0.2, iterations=2) & nd.binary_erosion(c[..., 3] > 0.5, iterations=10)   # khe = nét tối bên trong (nở để còn thấy ở 128 px)
    al = c[..., 3] * ~toi
    g = np.zeros(c.shape); g[..., :3] = 1; g[..., 3] = al
    x0, y0, x1, y1 = U.bbox(c[..., 3] > 0); h = max(x1 - x0, y1 - y0) / 2 / 0.9
    U.anh(U.thu(U.dat_giua(g, (x0 + x1) / 2, (y0 + y1) / 2, h), 128)).save(os.path.join(A, 'glyph', i + '.png'), optimize=True)


# ---- chân dung: mốc mặt [mặt x, mắt y, cằm y] theo phần cạnh ảnh gốc vuông (soát tay trên ảnh)
MAT = {'thacmana': (0.53, 0.305, 0.45), 'congap': (0.45, 0.33, 0.49)}
TILE_EYE, TOP_K = 0.40, 1.5     # mắt ở 40 % ô; đỉnh đầu ≈ mắt − 1,5 × (cằm − mắt) (như thap-cat-chandung: 15 % / 10 %)


# vùng tím-magenta THẬT của nhân vật (quả cầu mana, ngọc ngực) — không coi là nền: (tâm x, tâm y, bán kính) theo cạnh ảnh
GIU = {'thacmana': ((0.19, 0.40, 0.125), (0.44, 0.735, 0.065))}


def khoa_mag(im, i=''):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    d = np.sqrt((a[..., 0] - 255) ** 2 + a[..., 1] ** 2 + (a[..., 2] - 255) ** 2)
    al = np.clip((d - 60) / 110, 0, 1)
    # chỉ vùng magenta LOANG từ viền là nền (tím/hồng trong áo, quả cầu giữ nguyên)
    lab, n = nd.label(d < 150)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen = np.isin(lab, list(vien))
    # khe tóc / quầng sét kín bên trong: điểm rất magenta (d < 75) cũng là nền (quả cầu tím, áo đỏ còn xa magenta)
    giu = np.zeros_like(d, bool); yy, xx = np.mgrid[:d.shape[0], :d.shape[1]] / d.shape[0]
    for cx, cy, r in GIU.get(i, ()): giu |= (xx - cx) ** 2 + (yy - cy) ** 2 < r * r
    nen |= nd.binary_opening(d < 75, iterations=1) & ~giu
    al = np.where(nd.binary_dilation(nen, iterations=2), al, 1.0)
    k = (1 - al)[..., None]
    c = np.clip((a - k * np.array(MAG, np.float32)) / np.maximum(al[..., None], 1e-3), 0, 255)
    g = c[..., 1]
    for j in (0, 2): c[..., j] = np.where(al < 1, np.minimum(c[..., j], np.maximum(g + 40, c[..., j] - 60 * (1 - al))), c[..., j])
    return c, al


def chan_dung(i):
    im = Image.open(os.path.join(RAW, 'raw_%s_pilot.png' % i)).convert('RGB')
    c, al = khoa_mag(im, i)
    W, H = im.size
    # nền tạm: bản mờ rất mạnh + tối của chính nhân vật (ảnh gốc nền magenta, không có nền vẽ)
    pm = Image.fromarray((c * al[..., None]).astype(np.uint8)); am = Image.fromarray((al * 255).astype(np.uint8))
    b = np.asarray(pm.filter(ImageFilter.GaussianBlur(70))).astype(np.float32)
    ba = np.asarray(am.filter(ImageFilter.GaussianBlur(70))).astype(np.float32)[..., None] / 255
    mau = b / np.maximum(ba, 0.05)
    tb = (c * al[..., None]).reshape(-1, 3).sum(0) / al.sum()
    nen = (0.55 * mau * np.clip(ba * 1.4, 0, 1) + 0.18 * tb * (1 - np.clip(ba * 1.4, 0, 1))) * 0.62
    rgb = c * al[..., None] + nen * (1 - al[..., None])
    full = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    fx, ey, cy = MAT[i]
    S = round((cy - ey) * H / 0.217)                              # cằm cách mắt 21,7 % ô (= 10 % / 46 %)
    S = min(S, W, H)
    T = min(max(0, round(ey * H - TILE_EYE * S)), H - S); L = min(max(0, round(fx * W - S / 2)), W - S)
    sq = full.crop((L, T, L + S, T + S))
    sq.resize((427, 427), Image.LANCZOS).save(os.path.join(A, 'pilot_%s.png' % i), optimize=True)
    sq.resize((256, 256), Image.LANCZOS).save(os.path.join(A, 'pn', 'pilot_%s.png' % i), optimize=True)
    hh = round(W * 1020 / 1170)
    full.crop((0, 0, W, hh)).resize((1170, 1020), Image.LANCZOS).save(os.path.join(A, 'hero', 'hero_%s.jpg' % i), quality=88, optimize=True, progressive=True)
    p = lambda y: round(max(0, min(100, (y * H - T) / S * 100)), 1)
    top = ey - TOP_K * (cy - ey)
    x = round((fx * W - L) / S * 100, 1)
    po = [p(top), p(ey), x, p(cy)]
    hero = [round(max(0, top * H / hh * 100), 1), round(ey * H / hh * 100, 1), round(fx * 100, 1)]
    fb = [x, round((po[0] + po[3]) / 2, 1), round(po[3] - po[0], 1)]
    return po, hero, fb


def main():
    T = dung_tam()
    bao = {}
    for i, t in T.items():
        p = os.path.join(TMP, 'raw_mod_%s.png' % i); t.save(p)
        U.nguon = (lambda pp: (lambda _i: pp))(p)
        if os.environ.get('KT'): U.os.environ['KT'] = os.environ['KT']
        # thacmana: master + đầu đều hướng PHẢI (quy ước _nong) → bỏ bước xoay LÊN→PHẢI của umod (np.rot90 duy nhất trong mot())
        U.np = _NP_KHONG_XOAY if i == 'thacmana' else np
        bao[i] = r = U.mot(i); os.remove(p); U.np = np
        r['nguon'] = 'raw_%s_parts.png' % i + (' + raw_thacmana_master.png (ô 1)' if i == 'thacmana' else ' (ô 1–4)')
        print(i, json.dumps(r, ensure_ascii=False))
        if i == 'thacmana': nho_master(i)
        glyph(i)
    cd = {i: chan_dung(i) for i in MAT}
    for i, v in cd.items(): print(i, 'PO_NEO', v[0], 'HERO_NEO', v[1], 'FACE_BOX', v[2])
    bp = os.path.join(GOC, 'docs/demo-hop-tuong/tuvan/u-moi/cat-game.json')
    if os.path.exists(bp):
        B = json.load(open(bp, encoding='utf-8')); B.update(bao)
        json.dump(B, open(bp, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    if os.environ.get('KHONG_JS') == '1' and not os.environ.get('GHI_JS'): return
    # artscale.js
    p = os.path.join(JS, 'artscale.js'); t = open(p, encoding='utf-8').read()
    for ten, khoa in (('HEAD_K', 'HEAD_K'), ('DE_RIENG', 'DE_RIENG'), ('PHU_K', 'PHU_K'), ('UMOD_TIP', 'tip')):
        o = U.js_obj(t, ten)
        for i, r in bao.items():
            if r.get(khoa): o[i] = r[khoa]
        t = U.js_set(t, ten, o)
    open(p, 'w', encoding='utf-8').write(t)
    # meta.js ART_META (s = HEAD_K / 0,8 như REN.kDau dự phòng; tip = mũi nòng)
    p = os.path.join(JS, 'meta.js'); t = open(p, encoding='utf-8').read()
    for i, r in bao.items():
        t = re.sub(r'"%s": \{"s": [\d.]+, "tip": [\d.]+\}' % i, '"%s": {"s": %s, "tip": %s}' % (i, round(r['HEAD_K'] / 0.8, 3), r['tip']), t, count=1)
    open(p, 'w', encoding='utf-8').write(t)
    # chân dung: mốc mặt
    fmt = lambda v: '[' + ', '.join('%g' % n for n in v) + ']'
    p = os.path.join(JS, 'chandung.js'); t = open(p, encoding='utf-8').read()
    for ten, k in (('PO_NEO', 0), ('HERO_NEO', 1)):
        a = t.index('const ' + ten + ' = {'); b = t.index('};', a); blk = t[a:b]
        for i, v in cd.items():
            pat = re.compile(r'(?<![\w])' + i + r'\s*:\s*\[[^\]]*\]')
            blk = pat.sub(i + ': ' + fmt(v[k]), blk, 1) if pat.search(blk) else blk.rstrip() + ' ' + i + ': ' + fmt(v[k]) + ','
        t = t[:a] + blk + t[b:]
    open(p, 'w', encoding='utf-8').write(t)
    p = os.path.join(JS, 'khung.js'); t = open(p, encoding='utf-8').read()
    a = t.index('const FACE_BOX = {'); b = t.index('};', a); blk = t[a:b]
    for i, v in cd.items():
        nv = i + ':[' + ','.join('%g' % n for n in v[2]) + ']'
        pat = re.compile(r'(?<![\w])' + i + r':\[[^\]]*\]')
        blk = pat.sub(nv, blk, 1) if pat.search(blk) else blk.rstrip().rstrip(',') + ',' + nv
    t = t[:a] + blk + t[b:]
    open(p, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
