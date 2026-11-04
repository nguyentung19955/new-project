# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt các tấm hình ChatGPT (raw_*.png) còn chưa cắt thành PNG trong suốt cho thap/assets/.
Ưu tiên bản đã cắt sẵn trong docs/demo-hop-tuong/thap-art/ (phiên chính cắt); chỉ tự cắt những file còn thiếu.
Chạy: python3 tools/thap-cat-hinh.py   → ghi thap/assets/*.png + thap/js/meta.js (tỉ lệ đầu súng, đầu nòng)
"""
import json, os, shutil
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
os.makedirs(DICH, exist_ok=True)
ROSTER = json.load(open(os.path.join(NGUON, 'roster.json'), encoding='utf-8'))


def tach_nen(im, mau):
    """Tách nền xanh lá / hồng tím → alpha mềm + khử viền ám màu."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if mau == 'tim':  # magenta (255,0,255) — chỉ coi là nền khi R,B đều rất cao (giữ màu tím của hình)
        k = np.minimum(r, b) - g
        k = np.where(np.minimum(r, b) > 175, k, 0)
        alpha = np.clip(1.0 - (k - 110) / 70.0, 0, 1)
        # chỉ xoá vùng nền NỐI ra mép ảnh (giữ màu tím kín bên trong: đá mana, xoáy cổng);
        # túi nền kín chỉ xoá khi đúng màu hồng tím thuần
        nen0 = alpha < 0.5
        lab, n = nd.label(nen0)
        mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        noi = np.isin(lab, list(mep))
        thuan = (r > 225) & (b > 225) & (g < 45)
        lt, nt = nd.label(thuan)
        if nt:
            szt = nd.sum(thuan, lt, range(1, nt + 1))
            thuan = np.isin(lt, [i + 1 for i, v in enumerate(szt) if v > 1500])
        vung = nd.binary_dilation(noi, iterations=2) | thuan
        alpha = np.where(vung | (alpha >= 0.5), alpha, 1.0)
        alpha = np.where(~vung & (alpha < 0.5), 1.0, alpha)
    else:            # xanh lá (0,255,0)
        k = g - np.maximum(r, b)
        alpha = np.clip(1.0 - (k - 60) / 90.0, 0, 1)
    nen = alpha < 0.5
    # khử ám màu ở viền (2 px quanh nền)
    vien = nd.binary_dilation(nen, iterations=3) & ~nen
    if mau == 'tim':
        m = np.minimum(r, b)
        du = np.clip(m - g, 0, None) * vien
        r = r - du; b = b - du
    else:
        mx = np.maximum(r, b)
        du = np.clip(g - mx, 0, None) * vien
        g = g - du
    # gọt điểm lẻ
    giu = nd.binary_opening(alpha > 0.5, iterations=1)
    alpha = alpha * nd.binary_dilation(giu, iterations=1)
    out = np.dstack([np.clip(r, 0, 255), np.clip(g, 0, 255), np.clip(b, 0, 255), alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def vuong(im, co=256, le=4):
    """Cắt sát hình rồi đặt giữa ô vuông co×co."""
    bb = im.getbbox()
    im = im.crop(bb)
    w, h = im.size
    s = (co - 2 * le) / max(w, h)
    im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    o = Image.new('RGBA', (co, co))
    o.alpha_composite(im, ((co - im.size[0]) // 2, (co - im.size[1]) // 2))
    return o


def khoi_lon_nhat(im):
    """Giữ khối liền lớn nhất + các khối gần nó (bỏ rác lạc)."""
    a = np.asarray(im)[..., 3] > 40
    lab, n = nd.label(a)
    if n <= 1:
        return im
    sz = nd.sum(a, lab, range(1, n + 1))
    giu = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s > sz.max() * 0.08])
    arr = np.asarray(im).copy()
    arr[..., 3] = arr[..., 3] * giu
    return Image.fromarray(arr, 'RGBA')


def dau_sung(im, co=256):
    """Đầu súng: tâm xoay = tâm thân tròn (đỉnh khoảng cách trong nửa trái) → đặt vào tâm ảnh."""
    im = khoi_lon_nhat(im)
    a = np.asarray(im)[..., 3] > 60
    ys, xs = np.nonzero(a)
    x0, x1 = xs.min(), xs.max()
    dt = nd.distance_transform_edt(nd.binary_fill_holes(a))
    lim = x0 + int((x1 - x0) * 0.62)
    dt[:, lim:] = 0
    cy, cx = np.unravel_index(np.argmax(dt), dt.shape)
    R = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2).max() + 3
    R = int(np.ceil(R))
    big = Image.new('RGBA', (im.size[0] + 2 * R, im.size[1] + 2 * R))
    big.alpha_composite(im, (R, R))
    c = big.crop((cx, cy, cx + 2 * R, cy + 2 * R))  # tâm (cx+R, cy+R) trong big
    return c.resize((co, co), Image.LANCZOS)


def nen_den(im):
    """Ảnh nền đen → alpha theo độ sáng (để vẽ 'lighter')."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    al = a.max(axis=2)
    al = np.clip((al - 8) / 247.0, 0, 1)
    rgb = np.where(al[..., None] > 0.004, a / np.maximum(al[..., None], 0.004), 0)
    out = np.dstack([np.clip(rgb, 0, 255), al * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def co(ten):
    return os.path.exists(os.path.join(NGUON, ten))


def luu(im, ten):
    im.save(os.path.join(DICH, ten), optimize=True)
    print('  cắt', ten)


# 1) chép mọi file đã cắt sẵn
for f in sorted(os.listdir(NGUON)):
    if f.endswith('.png') and not f.startswith('raw'):
        shutil.copy2(os.path.join(NGUON, f), os.path.join(DICH, f))
shutil.copy2(os.path.join(NGUON, 'roster.json'), os.path.join(DICH, 'roster.json'))

# 1b) chuẩn hoá file chính thức cho game: khay nhẹ hơn; đường thẳng/góc cắt sát dải đường (để lặp khít)
def _mo(ten):
    return Image.open(os.path.join(DICH, ten)).convert('RGBA')
if co('khay.png'):
    k = _mo('khay.png')
    if k.size[0] > 900:
        k = k.crop(k.getbbox()); k = k.resize((900, round(900 * k.size[1] / k.size[0])), Image.LANCZOS); k.save(os.path.join(DICH, 'khay.png'), optimize=True)
if co('duong_thang.png'):
    s_ = _mo('duong_thang.png')
    if s_.size[0] == s_.size[1]:
        s_ = khoi_lon_nhat(s_); a_ = np.asarray(s_)[..., 3] > 60
        cot = np.nonzero(a_[a_.shape[0] // 2])[0]
        s_ = s_.crop((cot.min(), 0, cot.max() + 1, s_.size[1]))
        s_ = s_.resize((160, round(160 * s_.size[1] / s_.size[0])), Image.LANCZOS); s_.save(os.path.join(DICH, 'duong_thang.png'), optimize=True)
if co('duong_goc.png'):
    g_ = _mo('duong_goc.png')
    if g_.size[0] == g_.size[1] and g_.size[0] > 200:
        g_ = khoi_lon_nhat(g_); a_ = np.asarray(g_)[..., 3] > 60
        cot = np.nonzero(a_[2])[0]; L, R = cot.min(), cot.max()
        hang = np.nonzero(a_[:, -3])[0]; T, B = hang.min(), hang.max()
        bw = max(R - L, B - T)
        g_ = g_.crop((L, B - bw, L + bw, B)).resize((160, 160), Image.LANCZOS); g_.save(os.path.join(DICH, 'duong_goc.png'), optimize=True)

# 2) bàn máy móc xám
if not co('khay.png') and co('raw_khay.png'):
    k = tach_nen(Image.open(os.path.join(NGUON, 'raw_khay.png')), 'tim')
    k = k.crop(k.getbbox())
    k = k.resize((900, round(900 * k.size[1] / k.size[0])), Image.LANCZOS)
    luu(k, 'khay.png')

# 3) đường thẳng / góc / cổng / lõi
if co('raw_tiles.png'):
    t = tach_nen(Image.open(os.path.join(NGUON, 'raw_tiles.png')), 'tim')
    W, H = t.size
    o = W // 2
    if not co('duong_thang.png'):
        s = khoi_lon_nhat(t.crop((0, 0, o - 6, o - 6)))
        bb = s.getbbox()
        s = s.crop((bb[0], 0, bb[2], o - 6))      # dải dọc, lặp theo chiều dọc
        s = s.resize((160, round(160 * s.size[1] / s.size[0])), Image.LANCZOS)
        luu(s, 'duong_thang.png')
    if not co('duong_goc.png'):
        g = khoi_lon_nhat(t.crop((o + 6, 0, W, o - 6)))
        a = np.asarray(g)[..., 3] > 60
        # cánh dọc ở mép trên: x từ L..R; cánh ngang ở mép phải: y từ T..B
        cot = np.nonzero(a[2])[0]; L, R = cot.min(), cot.max()
        hang = np.nonzero(a[:, -3])[0]; T, B = hang.min(), hang.max()
        # góc nối TRÊN ↔ PHẢI: lấy ô [L..R'] × [T'..B] với cạnh = bề rộng đường
        bw = max(R - L, B - T)
        g = g.crop((L, B - bw, L + bw, B)).resize((160, 160), Image.LANCZOS)
        luu(g, 'duong_goc.png')
    if not co('cong.png'):
        luu(vuong(khoi_lon_nhat(t.crop((6, o + 6, o - 6, H - 6)))), 'cong.png')
    if not co('loi.png'):
        luu(vuong(khoi_lon_nhat(t.crop((o + 6, o + 6, W - 6, H - 6)))), 'loi.png')

# 4) biểu tượng UI + lớp phủ trạng thái
UI = ['ui_mana', 'ui_tim', 'ui_sao', 'ui_nangcap', 'phu_bang', 'phu_da', 'phu_lua', 'phu_ngam',
      'ui_bang_wave', 'ui_nut_trieu', 'ui_canh_bao_trum', 'ui_thuong']
if co('raw_ui.png'):
    u = tach_nen(Image.open(os.path.join(NGUON, 'raw_ui.png')), 'tim')
    W, H = u.size
    cw, ch = W / 4, H / 3
    for i, ten in enumerate(UI):
        if co(ten + '.png') and not ten.startswith('phu'):
            continue
        x, y = i % 4, i // 4
        if co(ten + '.png'):  # bản chính thức (đã có ụ mẫu ở giữa) → chỉ bỏ ụ mẫu
            c = Image.open(os.path.join(NGUON, ten + '.png')).convert('RGBA')
            c = vuong(c)
        else:
            c = u.crop((int(x * cw) + 6, int(y * ch) + 6, int((x + 1) * cw) - 6 + (30 if ten == 'ui_bang_wave' else 0), int((y + 1) * ch) - 6))
            c = vuong(khoi_lon_nhat(c) if not ten.startswith('phu') else c)
        if ten.startswith('phu'):
            # bỏ ụ súng mẫu ở giữa → chỉ giữ khung hiệu ứng
            arr = np.asarray(c).astype(np.float32)
            r, g, b, al = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
            mx, mn = arr[..., :3].max(2), arr[..., :3].min(2)
            sat = (mx - mn) / np.maximum(mx, 1)
            yy, xx = np.mgrid[0:256, 0:256]
            d = np.sqrt((xx - 128) ** 2 + (yy - 128) ** 2)
            if ten == 'phu_bang':
                trong = np.clip((d - 80) / 22, 0, 1)          # 0 ở giữa → 1 ở viền băng
                sang = (mx > 225).astype(np.float32) * 0.75
                al = al * np.maximum(trong, sang * (d < 100))
            elif ten == 'phu_da':
                al = al * np.clip((d - 64) / 10, 0, 1)
            elif ten == 'phu_lua':
                al = al * np.clip((sat - 0.5) / 0.15, 0, 1) * np.clip((d - 50) / 14, 0, 1)
            elif ten == 'phu_ngam':
                al = al * ((r > g + 60) & (r > b + 40))
            arr[..., 3] = al
            c = Image.fromarray(arr.astype(np.uint8), 'RGBA')
        luu(c, ten + '.png')

# 5) 48 ụ còn lại (raw_t1..t8: hàng trên bệ, hàng dưới đầu súng, theo thứ tự roster trừ 16 ụ đã có)
DA_CO = 'canon bang set doc lien laser tia mana radar mimic mortar railgun orbital wallgen blackhole overlord'.split()
CON = [r['id'] for r in ROSTER if r['id'] not in DA_CO]
for n in range(1, 9):
    f = 'raw_t%d.png' % n
    if not co(f):
        continue
    im = tach_nen(Image.open(os.path.join(NGUON, f)), 'xanh')
    W, H = im.size
    cw, ch = W / 6, H / 2
    for i in range(6):
        k = (n - 1) * 6 + i
        if k >= len(CON):
            break
        id_ = CON[k]
        if not co(id_ + '_de.png'):
            luu(vuong(khoi_lon_nhat(im.crop((int(i * cw) + 7, 7, int((i + 1) * cw) - 7, int(ch) - 7)))), id_ + '_de.png')
        if not co(id_ + '_nong.png'):
            luu(dau_sung(im.crop((int(i * cw) + 7, int(ch) + 7, int((i + 1) * cw) - 7, H - 7))), id_ + '_nong.png')

# 6) meta đầu súng: bán kính thân tròn (để chuẩn hoá cỡ đầu theo bệ) + đầu nòng (tỉ lệ so với tâm)
CHINH = {'mimic': 1.0, 'mana': 1.0, 'railgun': 0.95, 'wallgen': 0.95, 'orbital': 0.95, 'overlord': 0.95, 'blackhole': 0.95}
meta = {}
for r in ROSTER:
    p = os.path.join(DICH, r['id'] + '_nong.png')
    if not os.path.exists(p):
        continue
    a = np.asarray(Image.open(p))[..., 3] > 60
    ys, xs = np.nonzero(a)
    dt = nd.distance_transform_edt(nd.binary_fill_holes(a))
    body = float(dt[112:144, 112:144].max())
    # đầu nòng: điểm xa nhất bên phải trên dải giữa
    giua = a[118:138]
    cot = np.nonzero(giua.any(0))[0]
    tip = (cot.max() - 128) / 128.0 if len(cot) else 0.6
    s = min(1.35, max(0.85, 72.0 / max(body, 30)))
    s = CHINH.get(r['id'], s)
    meta[r['id']] = {'s': round(s, 3), 'tip': round(float(tip), 3)}
with open(os.path.join(GOC, 'thap/js/meta.js'), 'w', encoding='utf-8') as fo:
    fo.write('// Tự sinh bởi tools/thap-cat-hinh.py — s: tỉ lệ đầu súng (chuẩn hoá thân tròn khớp bệ), tip: đầu nòng (tỉ lệ bán kính ảnh)\n')
    fo.write('window.ART_META = ' + json.dumps(meta, ensure_ascii=False) + ';\n')
    fo.write('window.ROSTER_EMBED = ' + json.dumps(ROSTER, ensure_ascii=False) + ';\n')
# 7) ảnh nhỏ cho bảng chọn bộ bài (bệ + đầu súng ghép, 112 px) — nhẹ để điện thoại tải nhanh
os.makedirs(os.path.join(DICH, 'nho'), exist_ok=True)
for r in ROSTER:
    pd, pn = os.path.join(DICH, r['id'] + '_de.png'), os.path.join(DICH, r['id'] + '_nong.png')
    if not (os.path.exists(pd) and os.path.exists(pn)):
        continue
    de = Image.open(pd).convert('RGBA')
    no = Image.open(pn).convert('RGBA')
    s_ = meta[r['id']]['s']
    n2 = no.resize((round(256 * s_ * 0.86), round(256 * s_ * 0.86)), Image.LANCZOS)
    o = de.copy()
    if n2.size[0] > 256:  # đầu to hơn bệ: cắt giữa
        m_ = (n2.size[0] - 256) // 2
        n2 = n2.crop((m_, m_, m_ + 256, m_ + 256))
    o.alpha_composite(n2, ((256 - n2.size[0]) // 2, (256 - n2.size[1]) // 2))
    o = o.rotate(0).resize((112, 112), Image.LANCZOS)
    o.save(os.path.join(DICH, 'nho', r['id'] + '.png'), optimize=True)
print('xong', len(meta), 'đầu súng')
