#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tách nền + cắt ô + canh tâm xoay + tách lớp sáng cho TỜ LƯỚI đầu ụ gen bằng ChatGPT (nền hồng #FF00FF).

Chỉ cần Python 3 + Pillow + numpy (chạy được trên Windows / Linux / macOS).

Ví dụ:
  python tools/unity-tach-nen.py --anh to.png --luoi 3x2 --id sungluc,bang,doc,mana,tia,set \
         --assets thap/assets --ra Giao/2026-11-12_dau_trang
  python tools/unity-tach-nen.py --anh soi.png --luoi 3x1 --id soi:s1,soi:s2,soi:s3 \
         --assets thap/assets --ra Giao/2026-11-12_lon_dan

Mỗi ô (đầu ụ đã vẽ mặt trước chĩa LÊN) cho ra:
  <id>_nong.png            (ụ lớn dần: <id>_nong_d1/_d2/_d3.png)
  <id>_nong_sang.png       (chỉ khi có phần tự phát sáng xanh lơ đủ lớn)
  <id>_diem.json           (canvas, trục xoay, đầu nòng, tỉ lệ, cách tách nền, cảnh báo)
và 1 ảnh <thư mục xuất>/_xem-truoc.png để NHÌN lại trước khi giao.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HONG = np.array([255, 0, 255], np.float32)
NEN_TOI = (40, 44, 58)


# ---------------------------------------------------------------- tiện ích mặt nạ
def _L(m):
    return Image.fromarray(m.astype(np.uint8) * 255, 'L')


def no(m, r):  # nở mặt nạ r px
    return np.asarray(_L(m).filter(ImageFilter.MaxFilter(2 * r + 1))) > 0 if r > 0 else m


def co(m, r):  # co mặt nạ r px
    return np.asarray(_L(m).filter(ImageFilter.MinFilter(2 * r + 1))) > 0 if r > 0 else m


def loang_tu_mep(cho_phep):
    """Vùng của `cho_phep` liền với mép ảnh (đổ loang 4 hướng từ ngoài vào)."""
    h, w = cho_phep.shape
    p = np.ones((h + 2, w + 2), np.uint8) * 255      # viền đệm 1 px luôn đi được
    p[1:-1, 1:-1] = cho_phep * 255
    im = Image.fromarray(p, 'L').copy()            # .copy(): ảnh dựng từ mảng numpy không cho ghi
    ImageDraw.floodfill(im, (0, 0), 128)
    return np.asarray(im)[1:-1, 1:-1] == 128


def lan_trong(hat, vung, buoc=2, toi_da=800):
    """Lan `hat` ra trong phạm vi `vung` cho tới khi hết lan (dựng lại vùng liền với hạt)."""
    cur = hat & vung
    n = int(cur.sum())
    for _ in range(toi_da):
        cur = no(cur, buoc) & vung
        m = int(cur.sum())
        if m == n:
            break
        n = m
    return cur


def lap_lo(m):
    """Lấp mọi lỗ kín bên trong mặt nạ."""
    return ~loang_tu_mep(~m)


def bbox_mat_na(m):
    ys, xs = np.where(m)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


# ---------------------------------------------------------------- tách nền
def khoang_cach_hong(rgb):
    return np.sqrt(((rgb - HONG) ** 2).sum(2))


def nen_kin_that(d, vat_dac):
    """Mảng nền hồng THẬT nằm kín giữa vật (khe giữa các bộ phận): có lõi rất gần màu nền."""
    kin = vat_dac & (d < 70)
    loi = co(kin & (d < 40), 1)
    return lan_trong(loi, kin)


def key_mau(rgb, d):
    """Tách theo khoảng cách màu tới hồng; khử ám hồng ở mép; vá lỗ thủng nằm sâu trong thân."""
    al = np.clip((d - 65) / 60, 0, 1)
    dac = lap_lo(al >= 0.5)
    nen_kin = nen_kin_that(d, dac)
    trong = co(dac, 3) & ~nen_kin                 # phần ruột vật (bỏ dải mép 3 px)
    lo = trong & (al < 0.5)                       # ruột mà bị coi là nền = thủng
    ti_le_thung = float(lo.sum()) / max(1, int(dac.sum()))
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # khử ám hồng: kéo R,B về phía G khi alpha thấp
    lim = np.maximum(g, np.minimum(r, b) * al)
    m = al < 1
    r2 = np.where(m, np.minimum(r, lim + (r - lim) * al), r)
    b2 = np.where(m, np.minimum(b, lim + (b - lim) * al), b)
    # vá: điểm ruột bán trong suốt (không phải nền kín thật) → đặc lại, giữ màu gốc
    va = trong & (al < 1)
    r2 = np.where(va, r, r2)
    b2 = np.where(va, b, b2)
    al = np.where(va, 1.0, al)
    out = np.dstack([r2, g, b2, al * 255]).clip(0, 255).astype(np.uint8)
    return out, ti_le_thung, int(va.sum()), float(nen_kin.sum()) / max(1, int(dac.sum()))


def key_loang(rgb, d, nguong=70):
    """Đổ loang nền từ mép ô vào; co 1 px + làm mềm mép. Dùng khi vật tím/hồng gần màu nền."""
    nen = loang_tu_mep(d < nguong)
    # mảng hồng kín giữa vật KHÔNG bỏ (không phân biệt được khe nền thật với thân hồng) → chỉ đo để cảnh báo
    ti_le_kin = float(nen_kin_that(d, ~nen).sum()) / max(1, int((~nen).sum()))
    a = _L(~nen).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    al = np.asarray(a).astype(np.float32) / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # khử ám hồng chỉ ở dải mép bán trong suốt
    m = al < 1
    lim = np.maximum(g, np.minimum(r, b) * al)
    r2 = np.where(m, np.minimum(r, lim + (r - lim) * al), r)
    b2 = np.where(m, np.minimum(b, lim + (b - lim) * al), b)
    return np.dstack([r2, g, b2, al * 255]).clip(0, 255).astype(np.uint8), ti_le_kin


def tach_nen(o, cach):
    """Trả (ảnh RGBA numpy, cách đã dùng, tỉ lệ thủng của cách `mau`, số điểm đã vá, tỉ lệ mảng hồng kín)."""
    rgb = np.asarray(o.convert('RGB')).astype(np.float32)
    d = khoang_cach_hong(rgb)
    if cach == 'loang':
        out, kin = key_loang(rgb, d)
        return out, 'loang', None, 0, kin
    out, thung, va, kin = key_mau(rgb, d)
    if cach == 'tu-dong' and thung > 0.02:
        out, kin = key_loang(rgb, d)
        return out, 'loang', thung, 0, kin
    return out, 'mau', thung, va, kin


def bo_nhieu(a):
    """Chỉ bỏ đốm li ti (< ~30 px²): giữ mọi mảnh có chỗ dày ≥ 5 px, kể cả chi tiết RỜI khỏi thân
    (bông tuyết, ngôi sao, sóng tín hiệu, khói…)."""
    m = a[..., 3] > 40
    giu = lan_trong(co(m, 2), m)
    a = a.copy()
    a[..., 3] = np.where(giu, a[..., 3], 0)
    return a


# ---------------------------------------------------------------- canh theo ảnh web
def bbox_web(duong_dan, canvas):
    """bbox phần gần đặc của ảnh web sau khi xoay phải→lên và phóng ×(canvas/300) quanh tâm khung."""
    im = Image.open(duong_dan).convert('RGBA').rotate(90, expand=True)   # 90° ngược chiều kim đồng hồ
    s = canvas / 300.0
    w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    im = im.resize((w, h), Image.LANCZOS)
    b = bbox_mat_na(np.asarray(im)[..., 3] > 200)
    if b is None:
        return None
    ox, oy = (canvas - w) / 2.0, (canvas - h) / 2.0
    return (b[0] + ox, b[1] + oy, b[2] + ox, b[3] + oy)


def phong(im, s):
    """Phóng đều ảnh RGBA (nhân trước alpha để mép không bị viền)."""
    w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    return im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')


def lop_sang(im):
    """Lọc phần tự phát sáng xanh lơ ngay trên ảnh đã đặt → khớp vị trí tuyệt đối."""
    a = np.asarray(im).astype(np.int32)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    m = (g > 190) & (b > 215) & (r < 170) & (al > 200)
    gan = no(m, 7)
    m = m | ((g > 215) & (b > 230) & (al > 200) & gan)       # lõi trắng-xanh nằm sát vùng sáng
    dien_tich = int(m.sum())
    M = _L(m).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
    o = im.copy()
    o.putalpha(Image.fromarray(np.minimum(np.asarray(M), al).astype(np.uint8), 'L'))
    return o, dien_tich


# ---------------------------------------------------------------- chính
def doc_id(s):
    """'soi:s2' → ('soi', 2, None); 'bang' → ('bang', None, None); 'laser@loang' → ép cách key riêng ô đó; '-' → None"""
    s = s.strip()
    if s in ('', '-'):
        return None
    key = None
    if '@' in s:
        s, key = s.split('@', 1)
        key = key.strip()
        if key not in ('mau', 'loang', 'tu-dong'):
            sys.exit('Lỗi: cách key lạ "%s" (mau | loang | tu-dong)' % key)
    if ':' in s:
        i, k = s.split(':', 1)
        k = k.strip().lower().lstrip('sd')
        return i.strip(), int(k), key
    return s.strip(), None, key


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    ap = argparse.ArgumentParser(description='Tách nền tờ lưới đầu ụ (nền hồng #FF00FF) cho bản Unity')
    ap.add_argument('--anh', required=True, help='tờ lưới .png')
    ap.add_argument('--luoi', required=True, help='cột x hàng, ví dụ 3x2')
    ap.add_argument('--id', required=True, help='danh sách id theo thứ tự ô (trái→phải, trên→dưới); - = ô trống; ụ lớn dần: soi:s1,soi:s2,soi:s3; ép cách key riêng 1 ô: laser@loang')
    ap.add_argument('--assets', default=None, help='thư mục thap/assets (ảnh web để canh tâm xoay)')
    ap.add_argument('--ra', required=True, help='thư mục xuất')
    ap.add_argument('--canvas', type=int, default=512)
    ap.add_argument('--key', choices=['mau', 'loang', 'tu-dong'], default='tu-dong')
    a = ap.parse_args()

    nx, ny = (int(v) for v in a.luoi.lower().split('x'))
    ids = [doc_id(s) for s in a.id.split(',')]
    if len(ids) > nx * ny:
        sys.exit('Lỗi: số id (%d) nhiều hơn số ô (%d)' % (len(ids), nx * ny))
    ids += [None] * (nx * ny - len(ids))
    to = Image.open(a.anh).convert('RGB')
    cw, ch = to.width // nx, to.height // ny
    N = a.canvas
    os.makedirs(a.ra, exist_ok=True)
    diem_chung = {}      # id → nội dung _diem.json (ụ lớn dần gộp 3 dạng vào 1 file)
    xem, bang = [], []

    for k, idk in enumerate(ids):
        if idk is None:
            continue
        ma, dang, key_rieng = idk
        ten = '%s_nong' % ma + ('_d%d' % dang if dang else '')
        cb = []
        x0, y0 = (k % nx) * cw, (k // nx) * ch
        o = to.crop((x0, y0, x0 + cw, y0 + ch))
        # 1. tách nền
        px, cach, thung, va, kin = tach_nen(o, key_rieng or a.key)
        # 2. cắt theo bbox, bỏ nhiễu
        px = bo_nhieu(px)
        bb = bbox_mat_na(px[..., 3] > 128)
        if bb is None or (bb[2] - bb[0]) * (bb[3] - bb[1]) < 0.01 * cw * ch:
            bang.append((ten, '-', '-', cach, '-', 'Ô TRỐNG (không thấy vật)'))
            continue
        if bb[0] <= 1 or bb[1] <= 1 or bb[2] >= cw - 1 or bb[3] >= ch - 1:
            cb.append('vật chạm mép ô (có thể bị cắt cụt hoặc lấn sang ô bên)')
        if cach == 'mau' and thung is not None and thung > 0.004:
            cb.append('cách mau thủng %.1f%% thân (đã vá %d điểm) — nhìn kỹ ảnh xem trước' % (thung * 100, va))
        if kin > 0.01:
            cb.append('có mảng hồng kín trong thân %.1f%% (%s) — khe nền thật hay thân hồng? nhìn ảnh xem trước, cần thì ép <id>@%s'
                      % (kin * 100, 'đã bỏ' if cach == 'mau' else 'đang giữ', 'loang' if cach == 'mau' else 'mau'))
        le = 3
        c0 = (max(0, bb[0] - le), max(0, bb[1] - le), min(cw, bb[2] + le), min(ch, bb[3] + le))
        vat = Image.fromarray(px, 'RGBA').crop(c0)
        bw, bh = bb[2] - bb[0], bb[3] - bb[1]
        # 3. canh tâm xoay theo ảnh web
        wb = None
        if a.assets:
            f = os.path.join(a.assets, '%s_nong%s.png' % (ma, '_s%d' % dang if dang else ''))
            if os.path.exists(f):
                wb = bbox_web(f, N)
            if wb is None:
                cb.append('thiếu ảnh web %s → đặt giữa canvas, lề 8%%' % os.path.basename(f))
        else:
            cb.append('không có --assets → đặt giữa canvas, lề 8%')
        if wb is None:
            wb = (N * 0.08, N * 0.08, N * 0.92, N * 0.92)
        s = max(wb[2] - wb[0], wb[3] - wb[1]) / float(max(bw, bh))
        cx, cy = (wb[0] + wb[2]) / 2.0, (wb[1] + wb[3]) / 2.0
        vat = phong(vat, s)
        # tâm bbox của vật (trong ảnh đã phóng) → trùng tâm bbox web
        tx = cx - ((bb[0] + bb[2]) / 2.0 - c0[0]) * s
        ty = cy - ((bb[1] + bb[3]) / 2.0 - c0[1]) * s
        C = Image.new('RGBA', (N, N), (0, 0, 0, 0))
        C.alpha_composite(vat, (max(0, round(tx)), max(0, round(ty))),
                          (max(0, -round(tx)), max(0, -round(ty))))
        fb = bbox_mat_na(np.asarray(C)[..., 3] > 128)
        if round(tx) < 0 or round(ty) < 0 or round(tx) + vat.width > N or round(ty) + vat.height > N:
            cb.append('vật tràn khỏi canvas sau khi canh')
        if s > 1.15:
            cb.append('tỉ lệ phóng %.2f > 1,15: ảnh gen nhỏ hơn cần thiết (sẽ hơi mờ)' % s)
        # 4. lưu đầu ụ
        C.save(os.path.join(a.ra, ten + '.png'))
        # 5. lớp sáng
        S, dt = lop_sang(C)
        co_sang = dt > 0.004 * N * N
        f_sang = os.path.join(a.ra, ten + '_sang.png')
        if co_sang:
            S.save(f_sang)
        elif os.path.exists(f_sang):
            os.remove(f_sang)            # lần chạy trước để lại, nay không còn đủ sáng
        # 6. điểm
        muc = {'nong': [[N // 2, fb[1]]], 'co_lop_sang': bool(co_sang),
               'ti_le_so_voi_o_gen': round(s, 3), 'cach_tach_nen': cach,
               'bbox': list(fb), 'canh_bao': cb}
        fd = os.path.join(a.ra, '%s_diem.json' % ma)
        if dang:
            d = diem_chung.get(ma)
            if d is None:
                d = {'canvas': N, 'truc': [N // 2, N // 2], 'dang': {}}
                if os.path.exists(fd):      # chạy từng tờ riêng cho d1/d2/d3 thì gộp dần
                    try:
                        cu = json.load(open(fd, encoding='utf-8'))
                        if isinstance(cu.get('dang'), dict):
                            d['dang'] = cu['dang']
                    except Exception:
                        pass
            d['dang']['d%d' % dang] = muc
            d['nong'] = d['dang'].get('d1', muc)['nong']
        else:
            d = {'canvas': N, 'truc': [N // 2, N // 2]}
            d.update(muc)
        d['nguon'] = 'ChatGPT (to luoi nen hong) -> tools/unity-tach-nen.py; canh vi tri theo anh web'
        diem_chung[ma] = d
        json.dump(d, open(fd, 'w', encoding='utf-8'), ensure_ascii=False)
        xem.append((ten, C, S if co_sang else None, wb))
        bang.append((ten, '%dx%d' % (bw, bh), '%.3f' % s, cach, 'có' if co_sang else '-', '; '.join(cb)))

    # 7. ảnh xem trước + bảng tóm tắt
    if xem:
        T = 256
        P = Image.new('RGB', (T * len(xem), T * 2 + 18), NEN_TOI)
        dr = ImageDraw.Draw(P)
        f = T / float(N)
        for i, (ten, C, S, wb) in enumerate(xem):
            t = C.resize((T, T), Image.LANCZOS)
            P.paste(t, (i * T, 0), t)
            # khung bbox web (xám mờ) + dấu cộng ở trục xoay để soi lệch tâm
            dr.rectangle([i * T + wb[0] * f, wb[1] * f, i * T + wb[2] * f - 1, wb[3] * f - 1], outline=(90, 96, 120))
            dr.line([i * T + T // 2 - 5, T // 2, i * T + T // 2 + 5, T // 2], fill=(255, 255, 255))
            dr.line([i * T + T // 2, T // 2 - 5, i * T + T // 2, T // 2 + 5], fill=(255, 255, 255))
            if S is not None:
                t = S.resize((T, T), Image.LANCZOS)
                P.paste(t, (i * T, T), t)
            dr.text((i * T + 4, T * 2 + 4), ten, fill=(220, 220, 230))
        P.save(os.path.join(a.ra, '_xem-truoc.png'))
    print('%-22s %-9s %-6s %-6s %-5s %s' % ('file', 'cắt', 'tỉ lệ', 'key', 'sáng', 'cảnh báo'))
    for r in bang:
        print('%-22s %-9s %-6s %-6s %-5s %s' % r)
    print('Xem trước: %s' % os.path.join(a.ra, '_xem-truoc.png'))


if __name__ == '__main__':
    main()
